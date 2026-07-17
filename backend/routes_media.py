"""Media library routes."""
import os
import uuid
import logging
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Request, Depends, UploadFile, File, HTTPException, Response, Query
from fastapi.responses import RedirectResponse
from auth import require_admin
from storage import upload_image, delete_image
from models import MediaItem
from responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["media"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml",
}
VALID_FOLDERS = {"hero", "trainers", "gallery", "transformations", "membership", "blogs", "testimonials", "profile", "general"}


def _now():
    return datetime.now(timezone.utc).isoformat()


@router.post("/admin/media/upload")
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    folder: str = "general",
    user=Depends(require_admin),
):
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    ct = file.content_type or ""
    ext = ""
    if "." in (file.filename or ""):
        ext = file.filename.rsplit(".", 1)[-1].lower()

    if ct not in ALLOWED_TYPES:
        ct = MIME_TYPES.get(ext, ct)
        if ct not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ct}")

    # Validate and sanitize folder name
    folder = folder.lower().strip()
    if folder == "content":
        folder = "general"
    if folder not in VALID_FOLDERS:
        folder = "general"

    # Upload to Cloudinary
    try:
        upload_result = upload_image(io.BytesIO(data), folder=folder)
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    item = MediaItem(
        storage_path=upload_result["public_id"],
        url=upload_result["secure_url"],
        original_filename=file.filename or f"upload.{ext or 'bin'}",
        content_type=ct,
        size=upload_result["size"],
        folder=folder,
    )
    
    db = request.app.state.db
    await db.media.insert_one(item.model_dump())
    return standard_response(
        success=True,
        message="Media uploaded successfully",
        data=item.model_dump()
    )


@router.get("/media/file")
async def serve_media(
    request: Request,
    path: str = Query(...),
):
    """Public media file server. For legacy path URLs, redirects to the secure URL."""
    db = request.app.state.db
    record = await db.media.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    
    return RedirectResponse(url=record["url"])


@router.get("/admin/media")
async def list_media(request: Request, page: int = 1, limit: int = 30, folder: str = "", q: str = "", _=Depends(require_admin)):
    db = request.app.state.db
    query = {"is_deleted": False}
    if folder:
        query["folder"] = folder
    if q:
        query["original_filename"] = {"$regex": q, "$options": "i"}
    total = await db.media.count_documents(query)
    items = await db.media.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(limit)
    return standard_response(
        success=True,
        message="Media list retrieved",
        data={"items": items, "total": total, "page": page, "limit": limit}
    )


async def scan_media_usage(db, storage_path: str, url: str) -> list:
    uses = []
    if not storage_path:
        return uses

    # Remove Cloudinary transformation suffixes if any
    clean_path = storage_path.split("/")[-1].split(".")[0]

    def matches(val) -> bool:
        if not val or not isinstance(val, str):
            return False
        return (clean_path in val) or (url in val)

    def scan_val(val, path_name: str) -> list:
        found = []
        if isinstance(val, dict):
            for k, v in val.items():
                found.extend(scan_val(v, f"{path_name}.{k}"))
        elif isinstance(val, list):
            for idx, item in enumerate(val):
                found.extend(scan_val(item, f"{path_name}[{idx}]"))
        elif isinstance(val, str):
            if matches(val):
                found.append(path_name)
        return found

    # 1. Content Collection
    cursor = db.content.find({})
    async for doc in cursor:
        key = doc.get("_key", "unknown")
        matches_found = scan_val(doc, key)
        if matches_found:
            uses.append({
                "collection": "content",
                "document_id": key,
                "document_name": key.capitalize(),
                "fields": matches_found
            })

    # 2. Dynamic Catalog Collections
    collections_to_scan = ["services", "plans", "trainers", "testimonials", "gallery", "features"]
    for coll in collections_to_scan:
        cursor = db[coll].find({"is_deleted": {"$ne": True}})
        async for doc in cursor:
            doc_id = doc.get("id", str(doc.get("_id", "unknown")))
            doc_name = doc.get("name") or doc.get("title") or doc_id
            matches_found = scan_val(doc, doc_name)
            if matches_found:
                uses.append({
                    "collection": coll,
                    "document_id": doc_id,
                    "document_name": doc_name,
                    "fields": matches_found
                })

    return uses


@router.get("/admin/media/{media_id}/usage")
async def get_media_usage(media_id: str, request: Request, _=Depends(require_admin)):
    db = request.app.state.db
    record = await db.media.find_one({"id": media_id})
    if not record:
        raise HTTPException(status_code=404, detail="Media item not found")
        
    usages = await scan_media_usage(db, record.get("storage_path"), record.get("url"))
    return standard_response(
        success=True,
        message="Media usage details retrieved",
        data={
            "in_use": len(usages) > 0,
            "usages": usages
        }
    )


@router.delete("/admin/media/{media_id}")
async def delete_media(media_id: str, request: Request, force: bool = False, user=Depends(require_admin)):
    db = request.app.state.db
    record = await db.media.find_one({"id": media_id})
    if not record:
        raise HTTPException(status_code=404, detail="Media item not found")

    # Check for active references
    usages = await scan_media_usage(db, record.get("storage_path"), record.get("url"))
    if usages and not force:
        return standard_response(
            success=False,
            message="Cannot delete. Media item is currently referenced by other documents.",
            error="MEDIA_IN_USE",
            data={"usages": usages}
        )

    # Delete from Cloudinary
    try:
        delete_image(record["storage_path"])
    except Exception as e:
        logger.error(f"Cloudinary delete failed: {e}")

    # Remove database record
    await db.media.delete_one({"id": media_id})

    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_email": user.get("email"),
        "action": "delete",
        "entity": "media",
        "entity_id": media_id,
        "details": f"Deleted from database and Cloudinary: {record.get('original_filename')} (Forced: {force})",
        "created_at": _now(),
    })
    return standard_response(
        success=True,
        message="Media item deleted successfully",
        data={"success": True}
    )
