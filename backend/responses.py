import contextvars
import uuid
import logging
from typing import Any, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("fitforge.responses")

# Context var to store request_id for the current task/request
request_id_ctx = contextvars.ContextVar("request_id", default="")

from bson import ObjectId

def clean_object_ids(val: Any) -> Any:
    if isinstance(val, dict):
        return {k: clean_object_ids(v) for k, v in val.items() if k != "_id"}
    elif isinstance(val, list):
        return [clean_object_ids(x) for x in val]
    elif isinstance(val, ObjectId):
        return str(val)
    return val

def standard_response(
    success: bool,
    message: str,
    data: Any = None,
    error_code: Optional[str] = None,
    status_code: int = 200
) -> JSONResponse:
    req_id = request_id_ctx.get()
    if not req_id:
        req_id = str(uuid.uuid4())
        request_id_ctx.set(req_id)
        
    content = {
        "success": success,
        "message": message,
        "data": clean_object_ids(data),
        "request_id": req_id
    }
    if not success and error_code:
        content["error"] = error_code
        
    return JSONResponse(status_code=status_code, content=content)


async def request_id_middleware(request: Request, call_next):
    # Retrieve request_id from incoming headers or generate a new one
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    token = request_id_ctx.set(req_id)
    try:
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response
    finally:
        request_id_ctx.reset(token)

def get_error_code(status_code: int) -> str:
    mapping = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        408: "TIMEOUT",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        429: "TOO_MANY_REQUESTS",
        500: "INTERNAL_SERVER_ERROR",
        502: "BAD_GATEWAY",
        503: "SERVICE_UNAVAILABLE",
    }
    return mapping.get(status_code, "ERROR")

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    status_code = exc.status_code
    error_code = get_error_code(status_code)
    message = str(exc.detail)
    return standard_response(
        success=False,
        message=message,
        error_code=error_code,
        status_code=status_code
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    status_code = 422
    error_code = "VALIDATION_ERROR"
    
    # Format Pydantic validation errors nicely
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(x) for x in err.get("loc", []))
        msg = err.get("msg", "invalid value")
        errors.append(f"{loc}: {msg}")
        
    message = "Validation failed: " + "; ".join(errors)
    return standard_response(
        success=False,
        message=message,
        data={"errors": exc.errors()},
        error_code=error_code,
        status_code=status_code
    )

async def catch_all_exception_handler(request: Request, exc: Exception):
    req_id = request_id_ctx.get()
    logger.exception(f"Unhandled exception occurred. Request ID: {req_id}")
    
    # Secure: Never expose stack trace to user
    return standard_response(
        success=False,
        message="An unexpected server error occurred. Please contact support.",
        error_code="INTERNAL_SERVER_ERROR",
        status_code=500
    )
