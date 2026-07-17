"""Generic collection routes: services, plans, trainers, testimonials, faqs, schedule, gallery, features."""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Request, Depends, HTTPException
from auth import require_admin
from responses import standard_response
from models import (
    Service, ServiceIn, Plan, PlanIn, Trainer, TrainerIn,
    Testimonial, TestimonialIn, FAQ, FAQIn, ScheduleItem, ScheduleItemIn,
    GalleryImage, GalleryImageIn, Feature, FeatureIn,
)

router = APIRouter(prefix="/api", tags=["catalog"])
logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc).isoformat()


async def _log(db, user, action, entity, entity_id="", details=""):
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_email": user.get("email", "system"),
        "action": action, "entity": entity, "entity_id": entity_id,
        "details": details, "created_at": _now(),
    })


def _make_collection_routes(name: str, model_cls, input_cls, coll: str, admin_only_read: bool = False):
    """Register public list + admin CRUD for a collection."""

    @router.get(f"/{name}")
    async def public_list(request: Request):
        db = request.app.state.db
        items = await db[coll].find({"is_active": True, "is_deleted": {"$ne": True}}, {"_id": 0}).sort("order", 1).to_list(500)
        return standard_response(
            success=True,
            message=f"{name.capitalize()} list retrieved",
            data=items
        )

    @router.get(f"/admin/{name}")
    async def admin_list(
        request: Request,
        page: int = 1,
        limit: int = 10,
        q: str = "",
        active: Optional[bool] = None,
        featured: Optional[bool] = None,
        category: Optional[str] = None,
        trainer: Optional[str] = None,
        difficulty: Optional[str] = None,
        class_type: Optional[str] = None,
        _=Depends(require_admin)
    ):
        db = request.app.state.db
        query = {"is_deleted": {"$ne": True}}
        
        # Search Query
        if q:
            or_conds = []
            search_fields = ["title", "name", "category", "description", "tags", "question", "class_name", "caption", "role", "specialization"]
            for field in search_fields:
                if field in model_cls.model_fields:
                    or_conds.append({field: {"$regex": q, "$options": "i"}})
            if or_conds:
                query["$or"] = or_conds
                
        # Dynamic Filters
        if active is not None:
            query["is_active"] = active
        if featured is not None and "is_highlighted" in model_cls.model_fields:
            query["is_highlighted"] = featured
        if category and "category" in model_cls.model_fields:
            query["category"] = category
        if trainer and "trainer" in model_cls.model_fields:
            query["trainer"] = trainer
        if difficulty and "difficulty" in model_cls.model_fields:
            query["difficulty"] = difficulty
        if class_type and "class_type" in model_cls.model_fields:
            query["class_type"] = class_type

        sort_field = "order" if "order" in model_cls.model_fields else "created_at" if "created_at" in model_cls.model_fields else "id"
        
        total = await db[coll].count_documents(query)
        items = await db[coll].find(query, {"_id": 0}).sort(sort_field, 1).skip((page - 1) * limit).limit(limit).to_list(limit)
        
        return standard_response(
            success=True,
            message=f"Admin {name.capitalize()} list retrieved",
            data={"items": items, "total": total, "page": page, "limit": limit}
        )

    @router.get(f"/admin/{name}/{{item_id}}")
    async def admin_get(item_id: str, request: Request, _=Depends(require_admin)):
        db = request.app.state.db
        item = await db[coll].find_one({"id": item_id, "is_deleted": {"$ne": True}}, {"_id": 0})
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        return standard_response(
            success=True,
            message=f"{name.capitalize()} item retrieved",
            data=item
        )

    @router.post(f"/admin/{name}")
    async def admin_create(body: input_cls, request: Request, user=Depends(require_admin)):
        db = request.app.state.db
        item = model_cls(**body.model_dump())
        
        # Enforce draft/publish status field if it exists, default to published
        item_dump = item.model_dump()
        if "is_deleted" not in item_dump:
            item_dump["is_deleted"] = False
            
        await db[coll].insert_one(item_dump)
        await _log(db, user, "create", name, item.id, f"Created {name}")
        return standard_response(
            success=True,
            message=f"{name.capitalize()} item created successfully",
            data=item_dump
        )

    @router.put(f"/admin/{name}/{{item_id}}")
    async def admin_update(item_id: str, body: input_cls, request: Request, user=Depends(require_admin)):
        db = request.app.state.db
        old_doc = await db[coll].find_one({"id": item_id})
        if not old_doc:
            raise HTTPException(status_code=404, detail="Not found")
        updates = body.model_dump()
        result = await db[coll].update_one({"id": item_id}, {"$set": updates})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        
        try:
            from storage import cleanup_replaced_images
            await cleanup_replaced_images(old_doc, updates, db)
        except Exception as e:
            logger.error(f"Failed to clean up replaced image: {e}")

        await _log(db, user, "update", name, item_id, f"Updated {name}")
        updated_doc = await db[coll].find_one({"id": item_id}, {"_id": 0})
        return standard_response(
            success=True,
            message=f"{name.capitalize()} item updated successfully",
            data=updated_doc
        )

    @router.delete(f"/admin/{name}/{{item_id}}")
    async def admin_delete(item_id: str, request: Request, user=Depends(require_admin)):
        db = request.app.state.db
        old_doc = await db[coll].find_one({"id": item_id})
        if not old_doc:
            raise HTTPException(status_code=404, detail="Not found")
            
        # Soft delete update
        await db[coll].update_one({"id": item_id}, {"$set": {"is_deleted": True, "deleted_at": _now()}})
        
        await _log(db, user, "delete", name, item_id, f"Soft-deleted {name}")
        return standard_response(
            success=True,
            message=f"{name.capitalize()} item soft-deleted successfully",
            data={"success": True}
        )

    # rename to avoid duplicate operation IDs
    public_list.__name__ = f"list_{name}"
    admin_list.__name__ = f"admin_list_{name}"
    admin_get.__name__ = f"admin_get_{name}"
    admin_create.__name__ = f"admin_create_{name}"
    admin_update.__name__ = f"admin_update_{name}"
    admin_delete.__name__ = f"admin_delete_{name}"


_make_collection_routes("services", Service, ServiceIn, "services")
_make_collection_routes("plans", Plan, PlanIn, "plans")
_make_collection_routes("trainers", Trainer, TrainerIn, "trainers")
_make_collection_routes("testimonials", Testimonial, TestimonialIn, "testimonials")
_make_collection_routes("faqs", FAQ, FAQIn, "faqs")
_make_collection_routes("schedule", ScheduleItem, ScheduleItemIn, "schedule")
_make_collection_routes("gallery", GalleryImage, GalleryImageIn, "gallery")
_make_collection_routes("features", Feature, FeatureIn, "features")
