"""Auth routes for FitForge admin."""
import os
from fastapi import APIRouter, Request, Response, HTTPException, Depends
from datetime import datetime, timezone
from models import LoginIn, UserOut
from auth import (
    verify_password, hash_password, create_access_token, create_refresh_token,
    set_auth_cookies, clear_auth_cookies, get_current_user, decode_token,
)
from responses import standard_response
import jwt
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def _check_brute_force(db, identifier: str):
    now = datetime.now(timezone.utc)
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if not doc:
        return
    if doc.get("locked_until"):
        locked_until = doc["locked_until"]
        if isinstance(locked_until, str):
            locked_until = datetime.fromisoformat(locked_until)
        if locked_until > now:
            raise HTTPException(status_code=429, detail=f"Too many failed attempts. Try again in a few minutes.")


async def _record_failure(db, identifier: str):
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    doc = await db.login_attempts.find_one({"identifier": identifier}) or {"identifier": identifier, "count": 0}
    count = doc.get("count", 0) + 1
    update = {"count": count, "last_attempt": now.isoformat()}
    if count >= MAX_ATTEMPTS:
        update["locked_until"] = (now + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        update["count"] = 0
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)


async def _clear_failures(db, identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})


@router.post("/login")
async def login(body: LoginIn, request: Request, response: Response):
    db = request.app.state.db
    email = body.email.lower().strip()
    client_ip = request.client.host if request.client else "unknown"
    identifier = f"{client_ip}:{email}"

    await _check_brute_force(db, identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        await _record_failure(db, identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await _clear_failures(db, identifier)

    access = create_access_token(user["id"], user["email"], user.get("role", "admin"))
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)

    # Audit
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "actor_email": user["email"], "action": "login", "entity": "auth",
        "entity_id": user["id"], "details": f"IP: {client_ip}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return standard_response(
        success=True,
        message="Logged in successfully",
        data={
            "id": user["id"], "email": user["email"],
            "name": user.get("name", "Admin"), "role": user.get("role", "admin"),
            "access_token": access,
        }
    )


@router.post("/logout")
async def logout(response: Response, user=Depends(get_current_user)):
    clear_auth_cookies(response)
    return standard_response(success=True, message="Logged out successfully")


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return standard_response(
        success=True,
        message="Profile retrieved",
        data=UserOut(**user).model_dump()
    )


@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        db = request.app.state.db
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(user["id"], user["email"], user.get("role", "admin"))
        refresh = create_refresh_token(user["id"])
        set_auth_cookies(response, access, refresh)
        return standard_response(success=True, message="Token refreshed successfully")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


async def seed_admin(db):
    """Create/update admin user from env vars."""
    email = os.environ.get("ADMIN_EMAIL", "admin@fitforge.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "FitForge@2026")
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "name": "FitForge Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password)}},
        )
