"""The error envelope and its FastAPI exception handlers.

Component design: `component-design-ingestion-api.md` section 2.3. Every
non-2xx response carries the same body shape, `{"error": {...}}`, so the
interface has one shape to render. `request_id` is filled from the
request-id middleware (`app.py`, DAC-E1-S6-5) so a reported failure is
findable in the container log.

SEC-ERR-001 (section 2.3): a `500` returns `code: "internal_error"` and the
request id only. The driver exception's own message is never returned to the
client; it is logged server-side instead.
"""

import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

_LOGGER = logging.getLogger("factorflow.api")


class ErrorDetail(BaseModel):
    code: str
    message: str
    resource: str | None = None
    request_id: str


class ErrorEnvelope(BaseModel):
    error: ErrorDetail


def error_response(
    status_code: int,
    code: str,
    message: str,
    request_id: str,
    resource: str | None = None,
) -> JSONResponse:
    """Build the standard error envelope response (section 2.3)."""
    envelope = ErrorEnvelope(
        error=ErrorDetail(code=code, message=message, resource=resource, request_id=request_id)
    )
    return JSONResponse(status_code=status_code, content=envelope.model_dump())


async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Map an unhandled exception to `500` with no driver detail in the body.

    The actual exception is logged server-side, with the request id already
    bound into the logging context by the request-id middleware, so it is
    findable in the log without ever crossing into the response body
    (SEC-ERR-001).
    """
    request_id = getattr(request.state, "request_id", "unknown")
    _LOGGER.error("unhandled exception during request handling", exc_info=exc)
    return error_response(
        status_code=500,
        code="internal_error",
        message="An internal error occurred. Check the server log for the request id above.",
        request_id=request_id,
    )
