"""FitForge Gym — FastAPI backend."""
from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

# Route modules
from routes_auth import router as auth_router, seed_admin
from routes_content import router as content_router
from routes_catalog import router as catalog_router
from routes_media import router as media_router
from routes_bookings import router as bookings_router
from seed_data import seed_all



logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("fitforge")

app = FastAPI(title="FitForge Gym API", version="1.0.0")

# Responses / Exceptions middleware and handlers
from responses import (
    request_id_middleware,
    http_exception_handler,
    validation_exception_handler,
    catch_all_exception_handler
)
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

app.middleware("http")(request_id_middleware)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, catch_all_exception_handler)

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
app.state.db = db

# CORS — must allow credentials AND explicit origins (not wildcard) for cookies to work.
origins_env = os.environ.get("CORS_ORIGINS", "*")
if origins_env == "*":
    # For local/dev without cookies we allow wildcard, but the frontend uses Bearer tokens anyway.
    allow_origins = ["*"]
    allow_credentials = False
else:
    allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/")
async def root():
    return {"service": "FitForge Gym API", "status": "ok"}


from fastapi.responses import JSONResponse

@app.get("/health")
@app.get("/api/health")
async def health():
    try:
        # Check database connectivity by pinging MongoDB
        await app.state.db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )


# Register routers
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(catalog_router)
app.include_router(media_router)
app.include_router(bookings_router)


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.content.create_index("_key", unique=True)
    for coll in ("services", "plans", "trainers", "testimonials", "faqs",
                 "schedule", "gallery", "features", "inquiries", "newsletter",
                 "contact_messages", "trial_bookings", "media", "audit_logs",
                 "bookings", "calendar_exceptions", "revisions"):
        await db[coll].create_index("id", unique=True, sparse=True)

    # Seed
    await seed_admin(db)
    await seed_all(db)

    # Write test credentials for testing agent (safely for deployment)
    try:
        memory_dir = ROOT_DIR / ".." / "memory"
        memory_dir.mkdir(parents=True, exist_ok=True)
        creds_file = memory_dir / "test_credentials.md"
        creds_content = f"""# FitForge Gym — Test Credentials

## Admin Account
- **Email:** {os.environ.get('ADMIN_EMAIL', 'admin@fitforge.com')}
- **Password:** {os.environ.get('ADMIN_PASSWORD', 'FitForge@2026')}
- **Role:** admin

## Admin Panel
- Login page: `/admin/login`
- Dashboard: `/admin`

## Auth Endpoints
- POST `/api/auth/login`  — body: `{{"email": ..., "password": ...}}`
- GET `/api/auth/me`
- POST `/api/auth/logout`
- POST `/api/auth/refresh`
"""
        creds_file.write_text(creds_content)
        logger.info("Test credentials updated in memory folder")
    except Exception as e:
        logger.warning(f"Could not write test credentials: {e}")

    logger.info("FitForge backend startup complete")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
