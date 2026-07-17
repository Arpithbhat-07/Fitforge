import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Request, Depends, HTTPException
from auth import require_admin
from responses import standard_response
from models import (
    TrainerBooking, TrainerBookingIn, CalendarException, CalendarExceptionIn
)

router = APIRouter(prefix="/api", tags=["bookings"])
logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc).isoformat()


@router.get("/trainers/{trainer_id}/slots")
async def get_trainer_slots(trainer_id: str, date: str, request: Request):
    db = request.app.state.db
    
    # 1. Check if date is a gym-wide holiday or gym is closed
    gym_exception = await db.calendar_exceptions.find_one({
        "trainer_id": None,
        "is_active": True,
        "start_date": {"$lte": date},
        "end_date": {"$gte": date}
    })
    if gym_exception:
        return standard_response(
            success=True,
            message=f"Gym is closed: {gym_exception['title']}",
            data=[]
        )

    # 2. Check if trainer is on leave on this date
    trainer_leave = await db.calendar_exceptions.find_one({
        "trainer_id": trainer_id,
        "is_active": True,
        "start_date": {"$lte": date},
        "end_date": {"$gte": date}
    })
    if trainer_leave:
        return standard_response(
            success=True,
            message=f"Trainer is on leave: {trainer_leave['title']}",
            data=[]
        )

    # 3. Get trainer details for standard slots
    trainer = await db.trainers.find_one({"id": trainer_id, "is_deleted": {"$ne": True}})
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
        
    slots = trainer.get("available_slots", ["08:00 AM", "10:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"])

    # 4. Get active bookings for trainer on this date
    bookings = await db.bookings.find({
        "trainer_id": trainer_id,
        "date": date,
        "status": {"$in": ["pending", "approved"]}
    }).to_list(100)
    
    booked_slots = {b["time_slot"] for b in bookings}

    available = [s for s in slots if s not in booked_slots]
    return standard_response(success=True, message="Available slots retrieved", data=available)


@router.post("/bookings")
async def create_booking(body: TrainerBookingIn, request: Request):
    db = request.app.state.db
    
    # Verify slot is still available
    already_booked = await db.bookings.find_one({
        "trainer_id": body.trainer_id,
        "date": body.date,
        "time_slot": body.time_slot,
        "status": {"$in": ["pending", "approved"]}
    })
    if already_booked:
        raise HTTPException(status_code=400, detail="This time slot is already booked")
        
    # Get trainer name
    trainer = await db.trainers.find_one({"id": body.trainer_id})
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
        
    booking = TrainerBooking(
        name=body.name,
        email=body.email,
        phone=body.phone,
        trainer_id=body.trainer_id,
        date=body.date,
        time_slot=body.time_slot,
        notes=body.notes,
        status="pending"
    )
    
    await db.bookings.insert_one(booking.model_dump())
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_email": body.email,
        "action": "create",
        "entity": "booking",
        "entity_id": booking.id,
        "details": f"Requested booking with {trainer['name']} on {body.date} at {body.time_slot}",
        "created_at": _now()
    })
    
    # Send email notifications (handles template-driven HTML email)
    try:
        from mail import send_email_async
        # Notify User
        send_email_async(
            to_email=body.email,
            template_name="reservation",
            context={
                "customer_name": body.name,
                "trainer_name": trainer["name"],
                "date": body.date,
                "time_slot": body.time_slot,
                "notes": body.notes,
                "status": "pending"
            }
        )
        # Notify Admin
        admin_email = "admin@fitforge.com"
        send_email_async(
            to_email=admin_email,
            template_name="admin_notification",
            context={
                "type": "New Booking Request",
                "details": f"Customer {body.name} requested a booking with {trainer['name']} on {body.date} at {body.time_slot}."
            }
        )
    except Exception as e:
        logger.error(f"Failed to dispatch booking emails: {e}")
        
    return standard_response(
        success=True,
        message="Booking request submitted successfully",
        data=booking.model_dump()
    )


@router.get("/admin/bookings")
async def list_bookings(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    trainer_id: Optional[str] = None,
    status: Optional[str] = None,
    _=Depends(require_admin)
):
    db = request.app.state.db
    query = {}
    
    if start_date or end_date:
        date_cond = {}
        if start_date:
            date_cond["$gte"] = start_date
        if end_date:
            date_cond["$lte"] = end_date
        query["date"] = date_cond
        
    if trainer_id:
        query["trainer_id"] = trainer_id
    if status:
        query["status"] = status
        
    bookings = await db.bookings.find(query).sort("date", 1).to_list(500)
    
    for b in bookings:
        b["_id"] = str(b["_id"])
        trainer = await db.trainers.find_one({"id": b["trainer_id"]})
        b["trainer_name"] = trainer["name"] if trainer else "Unknown Trainer"
        
    # Also fetch calendar exceptions
    exceptions_query = {"is_active": True}
    exceptions = await db.calendar_exceptions.find(exceptions_query).to_list(100)
    for exc in exceptions:
        exc["_id"] = str(exc["_id"])
        if exc.get("trainer_id"):
            trainer = await db.trainers.find_one({"id": exc["trainer_id"]})
            exc["trainer_name"] = trainer["name"] if trainer else "Unknown Trainer"
            
    return standard_response(
        success=True,
        message="Admin bookings and exceptions retrieved",
        data={
            "bookings": bookings,
            "exceptions": exceptions
        }
    )


@router.patch("/admin/bookings/{booking_id}")
async def update_booking(
    booking_id: str,
    payload: dict,
    request: Request,
    user=Depends(require_admin)
):
    db = request.app.state.db
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    updates = {}
    if "status" in payload:
        updates["status"] = payload["status"]
    if "date" in payload:
        updates["date"] = payload["date"]
    if "time_slot" in payload:
        updates["time_slot"] = payload["time_slot"]
    if "notes" in payload:
        updates["notes"] = payload["notes"]
        
    await db.bookings.update_one({"id": booking_id}, {"$set": updates})
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_email": user.get("email"),
        "action": "update",
        "entity": "booking",
        "entity_id": booking_id,
        "details": f"Updated booking {booking_id} values: {updates}",
        "created_at": _now()
    })
    
    trainer = await db.trainers.find_one({"id": booking["trainer_id"]})
    trainer_name = trainer["name"] if trainer else "Trainer"
    
    # Dispatch Email notification on status changes
    try:
        from mail import send_email_async
        if "status" in updates:
            new_status = updates["status"]
            if new_status == "approved":
                send_email_async(
                    to_email=booking["email"],
                    template_name="reservation",
                    context={
                        "customer_name": booking["name"],
                        "trainer_name": trainer_name,
                        "date": updates.get("date", booking["date"]),
                        "time_slot": updates.get("time_slot", booking["time_slot"]),
                        "notes": updates.get("notes", booking.get("notes", "")),
                        "status": "approved"
                    }
                )
            elif new_status == "rejected":
                send_email_async(
                    to_email=booking["email"],
                    template_name="cancelled",
                    context={
                        "customer_name": booking["name"],
                        "trainer_name": trainer_name,
                        "date": booking["date"],
                        "time_slot": booking["time_slot"],
                        "cancellation_reason": updates.get("notes", "Rescheduling overlap or trainer leaves.")
                    }
                )
        elif ("date" in updates or "time_slot" in updates) and booking["status"] == "approved":
            # Rescheduled confirmation
            send_email_async(
                to_email=booking["email"],
                template_name="reservation",
                context={
                    "customer_name": booking["name"],
                    "trainer_name": trainer_name,
                    "date": updates.get("date", booking["date"]),
                    "time_slot": updates.get("time_slot", booking["time_slot"]),
                    "notes": "Your booking was rescheduled.",
                    "status": "approved"
                }
            )
    except Exception as e:
        logger.error(f"Failed to dispatch booking update emails: {e}")
        
    updated_booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return standard_response(
        success=True,
        message="Booking updated successfully",
        data=updated_booking
    )


@router.post("/admin/calendar-exceptions")
async def create_exception(body: CalendarExceptionIn, request: Request, user=Depends(require_admin)):
    db = request.app.state.db
    exc = CalendarException(**body.model_dump())
    await db.calendar_exceptions.insert_one(exc.model_dump())
    
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_email": user.get("email"),
        "action": "create",
        "entity": "calendar_exception",
        "entity_id": exc.id,
        "details": f"Created exception: {body.title} ({body.type})",
        "created_at": _now()
    })
    return standard_response(
        success=True,
        message="Calendar exception created successfully",
        data=exc.model_dump()
    )


@router.delete("/admin/calendar-exceptions/{exc_id}")
async def delete_exception(exc_id: str, request: Request, user=Depends(require_admin)):
    db = request.app.state.db
    await db.calendar_exceptions.delete_one({"id": exc_id})
    # Audit log
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_email": user.get("email"),
        "action": "delete",
        "entity": "calendar_exception",
        "entity_id": exc_id,
        "details": f"Deleted calendar exception {exc_id}",
        "created_at": _now()
    })
    return standard_response(
        success=True,
        message="Calendar exception deleted successfully",
        data={"success": True}
    )
