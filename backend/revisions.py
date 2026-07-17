import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

logger = logging.getLogger("fitforge.revisions")

async def save_revision(
    db,
    collection: str,
    doc_id: str,
    action: str,
    actor_email: str,
    before: Optional[Dict[str, Any]],
    after: Optional[Dict[str, Any]]
):
    changed_fields = []
    
    # Standard fields we exclude from change diffs
    ignored_fields = {"_id", "id", "_key", "created_at", "updated_at", "deleted_at"}
    
    if before and after:
        # Determine modified fields
        all_keys = set(before.keys()).union(set(after.keys()))
        for k in all_keys:
            if k in ignored_fields:
                continue
            if before.get(k) != after.get(k):
                changed_fields.append(k)
                
    elif before and not after:
        # Deletion
        changed_fields = [k for k in before.keys() if k not in ignored_fields]
    elif after and not before:
        # Creation
        changed_fields = [k for k in after.keys() if k not in ignored_fields]

    # Don't save empty updates to prevent revision bloat
    if action == "update" and not changed_fields:
        return

    revision = {
        "id": str(uuid.uuid4()),
        "collection": collection,
        "document_id": doc_id,
        "action": action,
        "changed_by": actor_email or "system",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "before_state": before,
        "after_state": after,
        "changed_fields": changed_fields
    }
    
    await db.revisions.insert_one(revision)
    logger.info(f"Saved revision for {collection}/{doc_id} by {actor_email} with changes on: {changed_fields}")
