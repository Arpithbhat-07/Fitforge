"""Public content routes + admin CRUD for hero/about/contact/seo/site settings."""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Request, Depends, HTTPException
from auth import require_admin
from responses import standard_response
from models import (
    HeroContent, AboutContent, ContactContent, SEOSettings, SiteSettings,
    ContactMessageIn, ContactMessage, NewsletterIn, NewsletterSubscriber,
    InquiryIn, Inquiry, InquiryUpdate, TrialBookingIn, TrialBooking,
    BMIRequest, BMIResponse, GlobalSettings, FeatureFlags, LegalContent
)
from revisions import save_revision

router = APIRouter(prefix="/api", tags=["content"])
logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc).isoformat()


async def _get_singleton(db, key: str, default_model):
    doc = await db.content.find_one({"_key": key})
    if not doc:
        doc = default_model().model_dump()
        await db.content.insert_one({"_key": key, **doc})
        doc = await db.content.find_one({"_key": key})
    return doc


async def _get_singleton_public(key: str, default_model, request: Request, preview: bool):
    db = request.app.state.db
    doc = await _get_singleton(db, key, default_model)
    if not preview and "published_version" in doc:
        return doc["published_version"]
    # Return draft fields
    return {k: v for k, v in doc.items() if k not in ("_id", "_key", "published_version")}


async def _update_singleton(key: str, payload: dict, request: Request, user: dict, default_model):
    db = request.app.state.db
    old_doc = await db.content.find_one({"_key": key})
    if old_doc:
        old_doc_clean = {k: v for k, v in old_doc.items() if k not in ("_id", "_key", "published_version")}
    else:
        old_doc_clean = default_model().model_dump()
        
    await db.content.update_one({"_key": key}, {"$set": payload}, upsert=True)
    
    try:
        from storage import cleanup_replaced_images
        await cleanup_replaced_images(old_doc, payload, db)
    except Exception as e:
        logger.error(f"Failed to clean up replaced image in {key}: {e}")
        
    await save_revision(
        db=db,
        collection="content",
        doc_id=key,
        action="update",
        actor_email=user.get("email"),
        before=old_doc_clean,
        after=payload
    )
    return await _get_singleton_public(key, default_model, request, preview=True)


# ---------- Public reads ----------
@router.get("/content/hero")
async def get_hero(request: Request, preview: bool = False):
    doc = await _get_singleton_public("hero", HeroContent, request, preview)
    return standard_response(success=True, message="Hero content retrieved", data=doc)


@router.get("/content/about")
async def get_about(request: Request, preview: bool = False):
    doc = await _get_singleton_public("about", AboutContent, request, preview)
    return standard_response(success=True, message="About content retrieved", data=doc)


@router.get("/content/contact")
async def get_contact(request: Request, preview: bool = False):
    doc = await _get_singleton_public("contact", ContactContent, request, preview)
    return standard_response(success=True, message="Contact content retrieved", data=doc)


@router.get("/content/seo")
async def get_seo(request: Request, preview: bool = False):
    doc = await _get_singleton_public("seo", SEOSettings, request, preview)
    return standard_response(success=True, message="SEO content retrieved", data=doc)


@router.get("/content/site-settings")
async def get_site_settings(request: Request, preview: bool = False):
    doc = await _get_singleton_public("site_settings", SiteSettings, request, preview)
    return standard_response(success=True, message="Site settings retrieved", data=doc)


@router.get("/content/global-settings")
async def get_global_settings(request: Request, preview: bool = False):
    doc = await _get_singleton_public("global_settings", GlobalSettings, request, preview)
    return standard_response(success=True, message="Global settings retrieved", data=doc)


@router.get("/content/feature-flags")
async def get_feature_flags(request: Request, preview: bool = False):
    doc = await _get_singleton_public("feature_flags", FeatureFlags, request, preview)
    return standard_response(success=True, message="Feature flags retrieved", data=doc)


@router.get("/content/privacy-policy")
async def get_privacy_policy(request: Request, preview: bool = False):
    doc = await _get_singleton_public("privacy_policy", lambda: LegalContent(title="Privacy Policy", content="<h1>Privacy Policy</h1><p>Our privacy terms...</p>"), request, preview)
    return standard_response(success=True, message="Privacy policy retrieved", data=doc)


@router.get("/content/terms")
async def get_terms(request: Request, preview: bool = False):
    doc = await _get_singleton_public("terms", lambda: LegalContent(title="Terms & Conditions", content="<h1>Terms & Conditions</h1><p>Our terms of service...</p>"), request, preview)
    return standard_response(success=True, message="Terms retrieved", data=doc)


# ---------- Admin updates ----------
@router.put("/admin/content/hero")
async def update_hero(payload: HeroContent, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("hero", payload.model_dump(), request, user, HeroContent)
    return standard_response(success=True, message="Hero content updated", data=doc)


@router.put("/admin/content/about")
async def update_about(payload: AboutContent, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("about", payload.model_dump(), request, user, AboutContent)
    return standard_response(success=True, message="About content updated", data=doc)


@router.put("/admin/content/contact")
async def update_contact(payload: ContactContent, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("contact", payload.model_dump(), request, user, ContactContent)
    return standard_response(success=True, message="Contact content updated", data=doc)


@router.put("/admin/content/seo")
async def update_seo(payload: SEOSettings, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("seo", payload.model_dump(), request, user, SEOSettings)
    return standard_response(success=True, message="SEO content updated", data=doc)


@router.put("/admin/content/site-settings")
async def update_site_settings(payload: SiteSettings, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("site_settings", payload.model_dump(), request, user, SiteSettings)
    return standard_response(success=True, message="Site settings updated", data=doc)


@router.put("/admin/content/global-settings")
async def update_global_settings(payload: GlobalSettings, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("global_settings", payload.model_dump(), request, user, GlobalSettings)
    return standard_response(success=True, message="Global settings updated", data=doc)


@router.put("/admin/content/feature-flags")
async def update_feature_flags(payload: FeatureFlags, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("feature_flags", payload.model_dump(), request, user, FeatureFlags)
    return standard_response(success=True, message="Feature flags updated", data=doc)


@router.put("/admin/content/privacy-policy")
async def update_privacy_policy(payload: LegalContent, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("privacy_policy", payload.model_dump(), request, user, LegalContent)
    return standard_response(success=True, message="Privacy policy updated", data=doc)


@router.put("/admin/content/terms")
async def update_terms(payload: LegalContent, request: Request, user=Depends(require_admin)):
    doc = await _update_singleton("terms", payload.model_dump(), request, user, LegalContent)
    return standard_response(success=True, message="Terms updated", data=doc)


# ---------- Contact form / Newsletter / Inquiries / Trial ----------
@router.post("/contact")
async def submit_contact(body: ContactMessageIn, request: Request):
    db = request.app.state.db
    msg = ContactMessage(**body.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())
    
    # Send email
    try:
        from mail import send_email_async, email_callout
        send_email_async(
            to_email=body.email,
            template_name="contact",
            context={
                "name": body.name,
                "message_content": body.message,
                "callout": email_callout("We've received your query. Our average response time is under 24 hours.", "Message Received")
            }
        )
        # Admin alert
        send_email_async(
            to_email="admin@fitforge.com",
            template_name="admin_notification",
            context={
                "event_type": "New Contact Message",
                "event_details": f"Name: {body.name}\nEmail: {body.email}\nSubject: {body.subject}\nMessage: {body.message}"
            }
        )
    except Exception as e:
        logger.error(f"Failed to send contact emails: {e}")
        
    return standard_response(success=True, message="Contact message submitted successfully", data={"id": msg.id})


@router.post("/newsletter/subscribe")
async def subscribe_newsletter(body: NewsletterIn, request: Request):
    db = request.app.state.db
    email = body.email.lower().strip()
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return standard_response(
            success=True,
            message="Already subscribed to newsletter",
            data={"already_subscribed": True}
        )
    sub = NewsletterSubscriber(email=email)
    await db.newsletter.insert_one(sub.model_dump())
    
    # Send email
    try:
        from mail import send_email_async, email_callout
        send_email_async(
            to_email=email,
            template_name="newsletter",
            context={
                "callout": email_callout("Thank you for joining our community! You will receive our premium weekly bulletins starting this Friday.", "Subscription Active")
            }
        )
        # Admin
        send_email_async(
            to_email="admin@fitforge.com",
            template_name="admin_notification",
            context={
                "event_type": "New Newsletter Subscriber",
                "event_details": f"New signup from email address: {email}"
            }
        )
    except Exception as e:
        logger.error(f"Failed to send newsletter emails: {e}")
        
    return standard_response(success=True, message="Subscribed to newsletter successfully", data={"id": sub.id})


@router.post("/inquiries")
async def submit_inquiry(body: InquiryIn, request: Request):
    db = request.app.state.db
    inq = Inquiry(**body.model_dump())
    await db.inquiries.insert_one(inq.model_dump())
    
    # Send email
    try:
        from mail import send_email_async, email_callout
        send_email_async(
            to_email=body.email,
            template_name="enquiry",
            context={
                "customer_name": body.name,
                "plan_name": body.plan or "General",
                "phone": body.phone,
                "callout": email_callout(f"Plan requested: {body.plan or 'General'}. Preferred time: {body.preferred_time or 'Anytime'}.", "Consultation Enquiry")
            }
        )
        # Admin
        send_email_async(
            to_email="admin@fitforge.com",
            template_name="admin_notification",
            context={
                "event_type": "New Membership Enquiry",
                "event_details": f"Name: {body.name}\nEmail: {body.email}\nPhone: {body.phone}\nPlan: {body.plan}\nGoal: {body.fitness_goal}"
            }
        )
    except Exception as e:
        logger.error(f"Failed to send inquiry emails: {e}")
        
    return standard_response(success=True, message="Inquiry submitted successfully", data={"id": inq.id})


@router.post("/trial-bookings")
async def submit_trial(body: TrialBookingIn, request: Request):
    db = request.app.state.db
    booking = TrialBooking(**body.model_dump())
    await db.trial_bookings.insert_one(booking.model_dump())
    
    # Send email
    try:
        from mail import send_email_async, email_callout
        send_email_async(
            to_email=body.email,
            template_name="reservation",
            context={
                "customer_name": body.name,
                "trainer_name": "General Facility",
                "date": body.preferred_date,
                "time_slot": "All Day Access",
                "status": "approved",
                "callout": email_callout("Your 3-day guest pass is activated! Show this email at the front desk when you arrive.", "Pass Activated")
            }
        )
        # Admin
        send_email_async(
            to_email="admin@fitforge.com",
            template_name="admin_notification",
            context={
                "event_type": "New Guest Pass Requested",
                "event_details": f"Name: {body.name}\nEmail: {body.email}\nPhone: {body.phone}\nDate: {body.preferred_date}"
            }
        )
    except Exception as e:
        logger.error(f"Failed to send trial booking emails: {e}")
        
    return standard_response(success=True, message="Trial booking submitted successfully", data={"id": booking.id})


# ---------- BMI Calculator ----------
@router.post("/bmi")
async def calculate_bmi(body: BMIRequest):
    if body.height_cm <= 0 or body.weight_kg <= 0:
        raise HTTPException(status_code=400, detail="Height and weight must be positive")
    h = body.height_cm / 100.0
    bmi = round(body.weight_kg / (h * h), 1)
    if bmi < 18.5:
        cat, advice = "Underweight", "Focus on nutrient-dense meals and progressive strength training to build healthy muscle mass."
    elif bmi < 25:
        cat, advice = "Healthy", "Excellent range. Maintain consistent training and balanced nutrition to preserve your baseline."
    elif bmi < 30:
        cat, advice = "Overweight", "A structured plan combining strength, cardio, and nutrition coaching will move you back to a healthy range."
    else:
        cat, advice = "Obese", "Speak to one of our certified coaches — we'll build a sustainable step-by-step transformation program."
    
    resp = BMIResponse(bmi=bmi, category=cat, advice=advice)
    return standard_response(success=True, message="BMI calculated successfully", data=resp.model_dump())


# ---------- Visits tracking ----------
@router.post("/visits/track")
async def track_visit(request: Request):
    db = request.app.state.db
    today = datetime.now(timezone.utc).date().isoformat()
    await db.visits.update_one(
        {"date": today},
        {"$inc": {"count": 1}},
        upsert=True,
    )
    return standard_response(success=True, message="Visit tracked successfully", data=None)


# ---------- Admin: Contact messages CRUD ----------
@router.get("/admin/contact-messages")
async def list_messages(request: Request, page: int = 1, limit: int = 20, q: str = "", _=Depends(require_admin)):
    db = request.app.state.db
    query = {}
    if q:
        query = {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"subject": {"$regex": q, "$options": "i"}},
        ]}
    total = await db.contact_messages.count_documents(query)
    items = await db.contact_messages.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return standard_response(
        success=True,
        message="Contact messages retrieved successfully",
        data={"items": items, "total": total, "page": page, "limit": limit}
    )


@router.patch("/admin/contact-messages/{msg_id}")
async def update_message(msg_id: str, payload: dict, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    await db.contact_messages.update_one({"id": msg_id}, {"$set": payload})
    return standard_response(success=True, message="Contact message updated successfully", data={"success": True})


@router.delete("/admin/contact-messages/{msg_id}")
async def delete_message(msg_id: str, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    await db.contact_messages.delete_one({"id": msg_id})
    return standard_response(success=True, message="Contact message deleted successfully", data={"success": True})


# ---------- Admin: Newsletter CRUD ----------
@router.get("/admin/newsletter")
async def list_newsletter(request: Request, page: int = 1, limit: int = 50, q: str = "", _=Depends(require_admin)):
    db = request.app.state.db
    query = {}
    if q:
        query = {"email": {"$regex": q, "$options": "i"}}
    total = await db.newsletter.count_documents(query)
    items = await db.newsletter.find(query, {"_id": 0}).sort("subscribed_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return standard_response(
        success=True,
        message="Newsletter subscribers retrieved successfully",
        data={"items": items, "total": total, "page": page, "limit": limit}
    )


@router.delete("/admin/newsletter/{sub_id}")
async def delete_subscriber(sub_id: str, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    await db.newsletter.delete_one({"id": sub_id})
    return standard_response(success=True, message="Newsletter subscriber deleted successfully", data={"success": True})


# ---------- Admin: Inquiries CRUD ----------
@router.get("/admin/inquiries")
async def list_inquiries(request: Request, page: int = 1, limit: int = 20, q: str = "", status: str = "", _=Depends(require_admin)):
    db = request.app.state.db
    query = {}
    conds = []
    if q:
        conds.append({"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
        ]})
    if status:
        conds.append({"status": status})
    if conds:
        query = {"$and": conds}
    total = await db.inquiries.count_documents(query)
    items = await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return standard_response(
        success=True,
        message="Inquiries retrieved successfully",
        data={"items": items, "total": total, "page": page, "limit": limit}
    )


@router.patch("/admin/inquiries/{inq_id}")
async def update_inquiry(inq_id: str, payload: InquiryUpdate, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.inquiries.update_one({"id": inq_id}, {"$set": updates})
    return standard_response(success=True, message="Inquiry updated successfully", data={"success": True})


@router.delete("/admin/inquiries/{inq_id}")
async def delete_inquiry(inq_id: str, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    await db.inquiries.delete_one({"id": inq_id})
    return standard_response(success=True, message="Inquiry deleted successfully", data={"success": True})


# ---------- Admin: Trial bookings ----------
@router.get("/admin/trial-bookings")
async def list_trials(request: Request, page: int = 1, limit: int = 20, _=Depends(require_admin)):
    db = request.app.state.db
    total = await db.trial_bookings.count_documents({})
    items = await db.trial_bookings.find({}, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return standard_response(
        success=True,
        message="Trial bookings retrieved successfully",
        data={"items": items, "total": total, "page": page, "limit": limit}
    )


@router.delete("/admin/trial-bookings/{bid}")
async def delete_trial(bid: str, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    await db.trial_bookings.delete_one({"id": bid})
    return standard_response(success=True, message="Trial booking deleted successfully", data={"success": True})


# ---------- Admin: Analytics ----------
@router.get("/admin/analytics/overview")
async def analytics_overview(request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    inquiries = await db.inquiries.count_documents({})
    inquiries_new = await db.inquiries.count_documents({"status": "new"})
    messages = await db.contact_messages.count_documents({})
    unread = await db.contact_messages.count_documents({"is_read": False})
    subscribers = await db.newsletter.count_documents({"is_active": True})
    trials = await db.trial_bookings.count_documents({})
    visits_agg = await db.visits.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]).to_list(1)
    total_visits = visits_agg[0]["total"] if visits_agg else 0
    # last 7 day visits
    daily = await db.visits.find({}, {"_id": 0}).sort("date", -1).limit(30).to_list(30)
    data = {
        "inquiries_total": inquiries,
        "inquiries_new": inquiries_new,
        "messages_total": messages,
        "messages_unread": unread,
        "subscribers": subscribers,
        "trial_bookings": trials,
        "visits_total": total_visits,
        "visits_daily": list(reversed(daily)),
    }
    return standard_response(success=True, message="Analytics overview retrieved successfully", data=data)


@router.get("/admin/activity/recent")
async def recent_activity(request: Request, limit: int = 15, _=Depends(require_admin)):
    db = request.app.state.db
    items = await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return standard_response(success=True, message="Recent activity logs retrieved successfully", data={"items": items})


@router.post("/admin/content/{key}/publish")
async def publish_content(key: str, request: Request, user=Depends(require_admin)):
    db = request.app.state.db
    doc = await db.content.find_one({"_key": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Extract draft fields (exclude system fields like _id, _key, published_version)
    draft = {k: v for k, v in doc.items() if k not in ("_id", "_key", "published_version")}
    
    # Update document setting published_version to draft
    await db.content.update_one({"_key": key}, {"$set": {"published_version": draft}})
    
    # Save revision log
    from revisions import save_revision
    await save_revision(
        db=db,
        collection="content",
        doc_id=key,
        action="publish",
        actor_email=user.get("email"),
        before=doc.get("published_version"),
        after=draft
    )
    
    return standard_response(success=True, message=f"{key.capitalize()} published successfully", data=draft)


@router.get("/admin/revisions/{collection}/{doc_id}")
async def get_revisions(collection: str, doc_id: str, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    items = await db.revisions.find(
        {"collection": collection, "document_id": doc_id}
    ).sort("timestamp", -1).to_list(100)
    return standard_response(
        success=True,
        message="Revisions retrieved successfully",
        data=items
    )


@router.post("/admin/revisions/{revision_id}/restore")
async def restore_revision(revision_id: str, request: Request, user=Depends(require_admin)):
    db = request.app.state.db
    revision = await db.revisions.find_one({"id": revision_id})
    if not revision:
        raise HTTPException(status_code=404, detail="Revision not found")
        
    collection = revision["collection"]
    doc_id = revision["document_id"]
    
    target_state = revision["after_state"]
    if not target_state:
        target_state = revision["before_state"]
        
    if not target_state:
        raise HTTPException(status_code=400, detail="Cannot restore empty state")

    # Get current document to track the restore revision
    current_doc = None
    if collection == "content":
        current_doc = await db.content.find_one({"_key": doc_id})
        if current_doc:
            current_doc = {k: v for k, v in current_doc.items() if k not in ("_id", "_key", "published_version")}
    else:
        current_doc = await db[collection].find_one({"id": doc_id})
        if current_doc:
            current_doc = {k: v for k, v in current_doc.items() if k not in ("_id", "_key")}

    # Restore in database
    if collection == "content":
        await db.content.update_one({"_key": doc_id}, {"$set": target_state}, upsert=True)
    else:
        await db[collection].update_one({"id": doc_id}, {"$set": target_state}, upsert=True)

    # Save revision log
    from revisions import save_revision
    await save_revision(
        db=db,
        collection=collection,
        doc_id=doc_id,
        action="restore",
        actor_email=user.get("email"),
        before=current_doc,
        after=target_state
    )

    return standard_response(
        success=True,
        message="Document restored successfully",
        data=target_state
    )


@router.get("/admin/mail/diagnostics")
async def mail_diagnostics(request: Request, _=Depends(require_admin)):
    from mail import RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO, verify_resend_connection, get_last_send_status
    status_ok, msg = verify_resend_connection()
    return standard_response(
        success=True,
        message="Mail diagnostics retrieved",
        data={
            "resend_api_key_configured": bool(RESEND_API_KEY),
            "email_from": EMAIL_FROM,
            "email_reply_to": EMAIL_REPLY_TO,
            "is_connected": status_ok,
            "connection_message": msg,
            "last_send_status": get_last_send_status()
        }
    )


@router.post("/admin/mail/test-send")
async def mail_test_send(payload: dict, request: Request, _=Depends(require_admin)):
    to_email = payload.get("email")
    if not to_email:
        raise HTTPException(status_code=400, detail="Recipient email is required")
        
    from mail import send_email_sync, email_callout
    success = send_email_sync(
        to_email=to_email,
        template_name="newsletter",
        context={
            "callout": email_callout("This is a live SMTP diagnostic test email from the FitForge Admin panel.", "Diagnostic Test Email")
        },
        subject="FitForge SMTP Test Email"
    )
    if success:
        return standard_response(success=True, message=f"Test email dispatched successfully to {to_email}")
    else:
        raise HTTPException(status_code=500, detail="Failed to dispatch test email. Check server log.")


@router.get("/admin/trash")
async def get_trash_list(request: Request, _=Depends(require_admin)):
    from datetime import datetime as _now
    db = request.app.state.db
    trash_items = []
    
    # 1. Dynamic catalog collections
    for coll in ("services", "plans", "trainers", "testimonials", "faqs",
                 "schedule", "gallery", "features"):
        cursor = db[coll].find({"is_deleted": True})
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["collection"] = coll
            doc["display_name"] = doc.get("name") or doc.get("title") or doc.get("caption") or doc.get("question") or doc.get("class_name") or doc.get("id")
            trash_items.append(doc)
            
    # 2. Content singleton sections
    cursor = db.content.find({})
    async for doc in cursor:
        doc_key = doc.get("_key")
        sections = doc.get("sections", {})
        if sections and isinstance(sections, dict):
            for sec_name, sec_state in sections.items():
                if sec_state and isinstance(sec_state, dict) and sec_state.get("deleted"):
                    trash_items.append({
                        "id": f"content:{doc_key}:{sec_name}",
                        "collection": "content_sections",
                        "display_name": f"{doc_key.capitalize()} - {sec_name.capitalize()}",
                        "deleted_at": doc.get("updated_at") or _now(),
                    })
                    
    return standard_response(success=True, message="Trash list retrieved", data=trash_items)


@router.post("/admin/trash/{collection}/{doc_id}/restore")
async def restore_trash_item(collection: str, doc_id: str, request: Request, user=Depends(require_admin)):
    db = request.app.state.db
    
    if collection == "content_sections":
        parts = doc_id.split(":")
        if len(parts) == 3:
            doc_key = parts[1]
            sec_name = parts[2]
            
            doc = await db.content.find_one({"_key": doc_key})
            if not doc:
                raise HTTPException(status_code=404, detail="Section content not found")
                
            await db.content.update_one(
                {"_key": doc_key},
                {"$set": {f"sections.{sec_name}.deleted": False}}
            )
            
            # Save revision log
            from revisions import save_revision
            await save_revision(
                db=db,
                collection="content",
                doc_id=doc_key,
                action="restore",
                actor_email=user.get("email"),
                before=doc,
                after={**doc, "sections": {**doc.get("sections", {}), sec_name: {**doc.get("sections", {}).get(sec_name, {}), "deleted": False}}}
            )
            return standard_response(success=True, message="Section successfully restored from trash")
        raise HTTPException(status_code=400, detail="Invalid section ID")
        
    doc = await db[collection].find_one({"id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found in trash")
        
    await db[collection].update_one({"id": doc_id}, {"$set": {"is_deleted": False}, "$unset": {"deleted_at": ""}})
    
    # Save revision log
    from revisions import save_revision
    await save_revision(
        db=db,
        collection=collection,
        doc_id=doc_id,
        action="restore",
        actor_email=user.get("email"),
        before=doc,
        after={**doc, "is_deleted": False}
    )
    return standard_response(success=True, message="Item successfully restored from trash")


@router.delete("/admin/trash/{collection}/{doc_id}/permanent")
async def permanent_delete_item(collection: str, doc_id: str, request: Request, user=Depends(require_admin)):
    db = request.app.state.db
    
    if collection == "content_sections":
        parts = doc_id.split(":")
        if len(parts) == 3:
            doc_key = parts[1]
            sec_name = parts[2]
            
            doc = await db.content.find_one({"_key": doc_key})
            if not doc:
                raise HTTPException(status_code=404, detail="Section not found")
                
            await db.content.update_one(
                {"_key": doc_key},
                {"$set": {sec_name: ""}, "$unset": {f"sections.{sec_name}": ""}}
            )
            
            # Save revision log
            from revisions import save_revision
            await save_revision(
                db=db,
                collection="content",
                doc_id=doc_key,
                action="permanent_delete",
                actor_email=user.get("email"),
                before=doc,
                after=None
            )
            return standard_response(success=True, message="Section permanently deleted")
        raise HTTPException(status_code=400, detail="Invalid section ID")
        
    doc = await db[collection].find_one({"id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
        
    # Clean up images in Cloudinary
    try:
        from storage import cleanup_replaced_images
        await cleanup_replaced_images(doc, None, db)
    except Exception as e:
        logger.error(f"Failed to clean up deleted images: {e}")
        
    await db[collection].delete_one({"id": doc_id})
    
    # Save revision
    from revisions import save_revision
    await save_revision(
        db=db,
        collection=collection,
        doc_id=doc_id,
        action="permanent_delete",
        actor_email=user.get("email"),
        before=doc,
        after=None
    )
    return standard_response(success=True, message="Item permanently deleted from database")
