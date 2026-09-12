"""The Massive provider's typed error taxonomy.

Component design: ``component-design-massive-client.md`` sections 2.4
(the taxonomy and classification order), 2.6a (the response envelope) and
4 (error disclosure). Story: ``CAP-001-E3-S3``.

The Massive SDK raises one exception, `BadResponse`, for every non-200
response and discards the HTTP status code -- only the raw response body
survives (section 2.4). AC-11 depends on telling a 404 (an unrecognised
instrument) from a 401 (a rejected credential), so this module
reconstructs that distinction by parsing the body as JSON.

Two properties of the envelope make that fragile (section 2.6a): the
failure field is not stably named -- a 404 carries `message`, while 401
and 429 carry `error` -- and `status` is `"NOT_FOUND"` on a missing
ticker and `"ERROR"` on everything else Massive returns as JSON. A 429
additionally carries no distinguishing `status` value at all; it is told
apart only by its message text, and per DAC-E3-S3-6 it must never become
a `MassiveError` at all -- it is flow control for the rate-limit
governor, not a failure.

Per the owner's resolution recorded in this story's task plan Notes,
malformed and valid-but-unknown error envelopes classify as
`ProviderUnavailable`; `ProviderContractViolation` is reserved
exclusively for a `200` response that fails model validation
(`wrap_validation_error`). `classify_error_body` therefore never returns
`ProviderContractViolation`.

This module never imports the Massive SDK, the runtime credential, or a
request URL. It only ever reads four documented, safe fields off a
parsed envelope -- `status`, `message`, `error`, `request_id` -- and
discards everything else, so an unexpected field carrying something
sensitive cannot reach a constructed exception (SEC-INP-001, AC-13,
DAC-E3-13).
"""

from __future__ import annotations

import json
from typing import Any

from pydantic import ValidationError

__all__ = [
    "MassiveError",
    "InstrumentNotFound",
    "CredentialRejected",
    "ProviderUnavailable",
    "ProviderContractViolation",
    "classify_error_body",
    "is_rate_limited_body",
    "is_fatal_for_governor",
    "wrap_validation_error",
]

_NOT_FOUND_STATUS = "NOT_FOUND"
# Section 2.6a: the 404 body's documented text.
_NOT_FOUND_MESSAGE_MARKER = "ticker not found"
# Section 2.6a: the two observed 401 bodies' `error` text.
_API_KEY_ERROR_MARKERS = ("api key", "authorization header")
# Section 2.6a: the observed 429 body's `error` text.
_RATE_LIMIT_MARKER = "exceeded the maximum requests"


class MassiveError(Exception):
    """Base for every provider failure this component raises.

    Carries only a safe, pre-built message and the provider's own
    `request_id` (section 2.6a) -- never the raw SDK exception, a request
    URL, or the credential (DAC-E3-13, AC-13). `str()` of any instance is
    therefore safe to place in a stored failure reason or a log record
    without further redaction, because nothing unsafe is ever passed to
    `__init__` in the first place.
    """

    def __init__(self, message: str, *, provider_request_id: str | None = None) -> None:
        super().__init__(message)
        self.provider_request_id = provider_request_id


class InstrumentNotFound(MassiveError):
    """The provider does not recognise this symbol, or holds no data of
    this type for it (AC-11). Recorded per instrument; the run continues.
    Not retried -- retrying returns the same answer."""


class CredentialRejected(MassiveError):
    """The API key was missing, unknown, or the `Authorization` header was
    malformed (401/403). Not retried -- every remaining instrument in the
    run would fail identically."""


class ProviderUnavailable(MassiveError):
    """A transport failure, a server error, or an error envelope this
    module does not recognise -- the safe default (DAC-E3-S3-3). The only
    taxonomy type a caller's governor classifier should treat as
    retryable."""


class ProviderContractViolation(MassiveError):
    """A `200` response that fails model validation (DAC-E3-5), reserved
    exclusively for that case. Distinct from unavailability because it
    means the provider's contract changed, not that it is down, so
    retrying will not help (DAC-E3-S3-4)."""


def _safe_fields(raw_body: bytes | str) -> dict[str, str | None] | None:
    """Parse `raw_body` as JSON and return only the four documented,
    safe fields (`status`, `message`, `error`, `request_id`); every other
    key is discarded before it can reach a constructed exception
    (SEC-INP-001).

    Returns `None` when the body is not valid JSON, decodes to something
    other than a JSON object, or cannot be decoded as text at all.
    """
    try:
        text = raw_body.decode() if isinstance(raw_body, bytes) else raw_body
        parsed: Any = json.loads(text)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    if not isinstance(parsed, dict):
        return None

    def _str_or_none(value: Any) -> str | None:
        return value if isinstance(value, str) else None

    return {
        "status": _str_or_none(parsed.get("status")),
        "message": _str_or_none(parsed.get("message")),
        "error": _str_or_none(parsed.get("error")),
        "request_id": _str_or_none(parsed.get("request_id")),
    }


def is_rate_limited_body(raw_body: bytes | str) -> bool:
    """True when `raw_body` is Massive's 429 envelope (DAC-E3-S3-6).

    A 429 carries no distinguishing `status` -- it reads `"ERROR"`,
    identical to a 401 (section 2.6a) -- so it is told apart only by its
    message text. Callers MUST check this *before* `classify_error_body`:
    a rate-limited response is flow control for the governor, never a
    `MassiveError`.
    """
    fields = _safe_fields(raw_body)
    if fields is None:
        return False
    reason = fields["error"] or fields["message"] or ""
    return _RATE_LIMIT_MARKER in reason.lower()


def classify_error_body(raw_body: bytes | str) -> MassiveError:
    """Classify a Massive error envelope into one of the taxonomy's types.

    Returns, rather than raises, the classified error -- the caller
    decides whether and how to raise it. Never call this on a body
    `is_rate_limited_body` has already identified as throttling.

    This function never returns `ProviderContractViolation`; that type is
    reserved for a *successful* response failing model validation
    (`wrap_validation_error`), per the owner's precedence resolution
    recorded in this story's task plan.
    """
    fields = _safe_fields(raw_body)
    if fields is None:
        return ProviderUnavailable("The provider returned an unparseable error response.")

    status = fields["status"]
    reason = fields["error"] or fields["message"] or ""
    request_id = fields["request_id"]

    if status == _NOT_FOUND_STATUS or _NOT_FOUND_MESSAGE_MARKER in reason.lower():
        return InstrumentNotFound(
            "The provider does not recognise this instrument.",
            provider_request_id=request_id,
        )

    if any(marker in reason.lower() for marker in _API_KEY_ERROR_MARKERS):
        return CredentialRejected(
            "The provider rejected the configured credential.",
            provider_request_id=request_id,
        )

    return ProviderUnavailable(
        "The provider returned an error this component does not recognise.",
        provider_request_id=request_id,
    )


def is_fatal_for_governor(error: MassiveError) -> bool:
    """True when a caller building the rate-limit governor's `classify`
    callable (`component-design-rate-limit-governor.md` section 2.3, owned
    by CAP-001-E3-S1/S4) must not retry `error` and must surface it as-is.

    `ProviderUnavailable` is the only type this taxonomy marks retryable
    -- every other type means retrying would reproduce the identical
    failure (DAC-E3-S3-4). This module never imports the governor's
    `Outcome` enum; it only labels its own types so that seam can be
    built without duplicating the decision here.
    """
    return not isinstance(error, ProviderUnavailable)


def wrap_validation_error(
    error: ValidationError, *, provider_request_id: str | None = None
) -> ProviderContractViolation:
    """Wrap a Pydantic `ValidationError` raised while validating a
    successful (`200`) response against a CAP-001-E3-S2 model into
    `ProviderContractViolation` (DAC-E3-5).

    The wrapped error carries only a safe summary -- the model's name and
    the number of failing fields -- never the raw field values Pydantic's
    own error report includes, so a provider value that failed validation
    cannot leak through and no partially parsed value is returned or
    retained.
    """
    return ProviderContractViolation(
        f"The provider's response for {error.title} failed model validation "
        f"({error.error_count()} field(s)).",
        provider_request_id=provider_request_id,
    )
