"""The error envelope and its FastAPI exception handlers.

Component design: `component-design-ingestion-api.md` section 2.3. Every
non-2xx response carries the same body shape, `{"error": {...}}`, so the
interface has one shape to render. `request_id` is filled from the
request-id middleware (`app.py`, DAC-E1-S6-5) so a reported failure is
findable in the container log.

SEC-ERR-001 (section 2.3): a `500` returns `code: "internal_error"` and the
request id only. The driver exception's own message is never returned to the
client; it is logged server-side instead.

CAP-001-E7-S2: the `500` body is exactly `{"error": {"code", "request_id"}}`,
with no `message` and no `resource` (DAC-E7-7), and its log record carries the
same request id as the response (DAC-E7-S2-3).
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
    state: str | None = None
    """The actual persisted run state; present only for `run_already_terminal`
    responses (component-design-ingestion-api.md §§2.4, 10, 11). Excluded from
    the serialised body when absent so existing envelope consumers are not
    affected by an extra null field (T007 precedence resolution)."""


class ErrorEnvelope(BaseModel):
    error: ErrorDetail


def error_response(
    status_code: int,
    code: str,
    message: str,
    request_id: str,
    resource: str | None = None,
    state: str | None = None,
) -> JSONResponse:
    """Build the standard error envelope response (section 2.3).

    `state` is populated only for `run_already_terminal` responses and is
    excluded from the serialised body on all other errors (T007): the field
    is omitted rather than sent as null so existing envelope consumers do not
    encounter an unexpected key.
    """
    detail = ErrorDetail(
        code=code,
        message=message,
        resource=resource,
        request_id=request_id,
        state=state,
    )
    # Exclude `state` when absent — use exclude_none only for the `state`
    # field.  We cannot use envelope.model_dump(exclude_none=True) globally
    # because `resource` is also Optional and is legitimately returned as
    # null on some errors.  Build the detail dict manually instead.
    detail_dict = detail.model_dump(exclude={"state"})
    if state is not None:
        detail_dict["state"] = state
    content = {"error": detail_dict}
    return JSONResponse(status_code=status_code, content=content)


async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Map an unhandled exception to `500` with no driver detail in the body.

    The body is the internal-error code and the request id only (CAP-001-E7-S2,
    DAC-E7-7). The actual exception is logged server-side with the request id
    passed explicitly, so the record carries it even when Starlette's
    `ServerErrorMiddleware` runs this handler after the request-id middleware
    has unbound it (DAC-E7-S2-3). It is findable in the log without ever
    crossing into the response body (SEC-ERR-001).
    """
    request_id = getattr(request.state, "request_id", None)
    extra = {"request_id": request_id} if request_id is not None else None
    _LOGGER.error("unhandled exception during request handling", exc_info=exc, extra=extra)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "request_id": request_id or "unknown"}},
    )
