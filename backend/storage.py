"""Cloudinary storage service implementation."""
import os
import uuid
import time
import logging
from typing import Any, Dict, Optional
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

logger = logging.getLogger(__name__)

# Load configuration variables from environment
CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
API_KEY = os.environ.get("CLOUDINARY_API_KEY")
API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")
APP_NAME = os.environ.get("APP_NAME", "fitforge")

# Configure Cloudinary once at startup - fail fast if credentials are missing
if CLOUD_NAME and API_KEY and API_SECRET:
    cloudinary.config(
        cloud_name=CLOUD_NAME,
        api_key=API_KEY,
        api_secret=API_SECRET,
        secure=True
    )
    logger.info("Cloudinary storage service configured successfully")
else:
    missing = []
    if not CLOUD_NAME: missing.append("CLOUDINARY_CLOUD_NAME")
    if not API_KEY: missing.append("CLOUDINARY_API_KEY")
    if not API_SECRET: missing.append("CLOUDINARY_API_SECRET")
    raise ValueError(f"Cloudinary configuration failed: Missing required environment variables: {', '.join(missing)}")


def upload_image(file_data: Any, folder: str = "media", retries: int = 3, backoff: float = 1.0) -> Dict[str, Any]:
    """
    Upload an image or other file to Cloudinary.

    Args:
        file_data: File content (bytes, file-like object, or file path).
        folder: Subfolder under the application's root namespace (e.g. 'gallery', 'trainers').
        retries: Number of retry attempts in case of network/timeout failures.
        backoff: Wait time multiplier between retry attempts.

    Returns:
        dict: A dictionary containing upload metadata (public_id, secure_url, size, format, resource_type).
    """
    if not (CLOUD_NAME and API_KEY and API_SECRET):
        logger.error("Cloudinary upload failed: missing credentials")
        raise RuntimeError("Cloudinary is not configured. Missing credentials.")

    # Generate a unique path/public_id
    unique_id = str(uuid.uuid4())
    root_folder = APP_NAME if APP_NAME else "fitforge"
    public_id = f"{root_folder}/{folder}/{unique_id}"

    last_exception: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Uploading file to Cloudinary as '{public_id}' (attempt {attempt}/{retries})...")
            # Call official Cloudinary SDK upload
            response = cloudinary.uploader.upload(
                file_data,
                public_id=public_id,
                resource_type="auto",
                overwrite=True,
                unique_filename=True,
                invalidate=True,
                quality="auto",
                fetch_format="auto",
                timeout=30  # 30 second request timeout
            )
            logger.info("Image uploaded successfully")
            return {
                "public_id": response.get("public_id"),
                "secure_url": response.get("secure_url"),
                "size": response.get("bytes", 0),
                "format": response.get("format", ""),
                "resource_type": response.get("resource_type", "image")
            }
        except Exception as e:
            last_exception = e
            logger.warning(f"Cloudinary upload attempt {attempt} failed: {e}")
            if attempt < retries:
                time.sleep(backoff * attempt)

    logger.error("Cloudinary upload failed")
    raise RuntimeError(f"Cloudinary upload failed: {last_exception}")


def delete_image(public_id: str, retries: int = 3, backoff: float = 1.0) -> Dict[str, Any]:
    """
    Delete an asset from Cloudinary using its public_id.

    Args:
        public_id: Cloudinary public identifier.
        retries: Number of retry attempts in case of failure.
        backoff: Wait time multiplier between retry attempts.

    Returns:
        dict: Result metadata from Cloudinary.
    """
    if not (CLOUD_NAME and API_KEY and API_SECRET):
        logger.error("Cloudinary delete failed: missing credentials")
        raise RuntimeError("Cloudinary is not configured. Missing credentials.")

    last_exception: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Deleting asset '{public_id}' from Cloudinary (attempt {attempt}/{retries})...")
            # Call official Cloudinary SDK destroy
            response = cloudinary.uploader.destroy(
                public_id,
                invalidate=True,
                timeout=30
            )
            result = response.get("result")
            if result in ("ok", "not found"):
                logger.info("Image deleted successfully")
                return response
            else:
                raise RuntimeError(f"Cloudinary destroy returned non-ok result: {result}")
        except Exception as e:
            last_exception = e
            logger.warning(f"Cloudinary delete attempt {attempt} failed: {e}")
            if attempt < retries:
                time.sleep(backoff * attempt)

    logger.error("Cloudinary delete failed")
    raise RuntimeError(f"Cloudinary delete failed: {last_exception}")


def get_image_url(
    public_id: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    crop: Optional[str] = None
) -> str:
    """
    Get the secure URL for a given public_id, optionally applying transformations.

    Args:
        public_id: Cloudinary public identifier.
        width: Optional transformed width.
        height: Optional transformed height.
        crop: Optional crop type (e.g. 'fill', 'scale', 'crop').

    Returns:
        str: Secure, transformed URL.
    """
    options: Dict[str, Any] = {
        "secure": True,
        "quality": "auto",
        "fetch_format": "auto",
    }
    if width:
        options["width"] = width
    if height:
        options["height"] = height
    if crop:
        options["crop"] = crop

    url, _ = cloudinary_url(public_id, **options)
    return url


async def cleanup_replaced_images(old_doc: Optional[dict], new_doc: Optional[dict], db) -> None:
    """
    Scans old_doc and new_doc for any changes in fields containing image URLs.
    If a URL is replaced, it looks up the corresponding MediaItem in the db and deletes the Cloudinary asset.
    """
    if not old_doc:
        return
    
    # Standard image fields in all database models
    image_fields = ["photo", "url", "avatar", "before_image", "after_image", "background_image", "favicon_url", "og_image"]
    for field in image_fields:
        old_val = old_doc.get(field)
        new_val = new_doc.get(field) if new_doc else None
        if old_val and old_val != new_val:
            # Look up if there's a MediaItem with this URL
            media_item = await db.media.find_one({"url": old_val})
            if media_item:
                try:
                    delete_image(media_item["storage_path"])
                    await db.media.delete_one({"id": media_item["id"]})
                    logger.info(f"Image replaced/deleted. Cleaned up Cloudinary asset: {media_item['storage_path']}")
                except Exception as e:
                    logger.error(f"Cloudinary cleanup failed for {media_item['storage_path']}: {e}")

