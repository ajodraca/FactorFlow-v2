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
apart only by its message text, and per DAC-E3-S3-6 a throttled response
never becomes a `MassiveError` here -- it is flow control for the
rate-limit governor, not a failure. Only throttling that persists past
the stock's throttle wait budget ends as one, `ProviderRateLimited`,
which the governor raises and no response is classified into (CAP-003
massive-client sections 2.4, 2.5).

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
from collections.abc import Callable
from typing import Any

from pydantic import ValidationError

__all__ = [
    "MassiveError",
    "InstrumentNotFound",
    "CredentialRejected",
    "ProviderUnavailable",
    "ProviderRateLimited",
    "ProviderContractViolation",
    "ProviderNotEntitled",
    "classify_error_body",
    "is_rate_limited_body",
    "is_fatal_for_governor",
    "wrap_validation_error",
    "MAX_FAILURE_REASON_VARIABLE_TEXT",
    "compose_failure_reason",
]

_NOT_FOUND_STATUS = "NOT_FOUND"
# Section 2.6a: the 404 body's documented text.
_NOT_FOUND_MESSAGE_MARKER = "ticker not found"
# Section 2.6a: the two observed 401 bodies' `error` text.
_API_KEY_ERROR_MARKERS = ("api key", "authorization header")
# Section 2.6a: the observed 429 body's `error` text.
_RATE_LIMIT_MARKER = "exceeded the maximum requests"
_NOT_ENTITLED_MARKER = "not entitled"  # production 403 text, 2026-11-07 (CAP-002 manifest B1)


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
    malformed. Not retried -- every remaining instrument in the
    run would fail identically."""


class ProviderUnavailable(MassiveError):
    """A transport failure, a server error, or an error envelope this
    module does not recognise -- the safe default (DAC-E3-S3-3). The only
    taxonomy type a caller's governor classifier should treat as
    retryable."""


class ProviderRateLimited(ProviderUnavailable):
    """Raised by the rate-limit governor when the provider keeps throttling
    past the stock's throttle wait budget (AC-30). A ProviderUnavailable, so
    every delivered `except ProviderUnavailable` still catches it. Never built
    from a response: under retries=0 urllib3 drains the 429 body, so it never
    carries a provider request_id."""


class ProviderContractViolation(MassiveError):
    """A `200` response that fails model validation (DAC-E3-5), reserved
    exclusively for that case. Distinct from unavailability because it
    means the provider's contract changed, not that it is down, so
    retrying will not help (DAC-E3-S3-4)."""


class ProviderNotEntitled(MassiveError):
    """The owner's plan is not entitled to this endpoint (the observed 403
    body, marker "not entitled" in `error` or `message`). Fatal for the
    governor: sent once, never retried. Per data type, not per run: prices may
    succeed while financials are refused, so the data type is recorded failed
    and the run continues. Carries the provider request_id when the body has
    one (AC-29)."""


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


def _mentions_not_entitled(fields: dict[str, str | None]) -> bool:
    return any(
        _NOT_ENTITLED_MARKER in (fields[name] or "").lower() for name in ("error", "message")
    )


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
    reason = fields["error"] or ""
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

    A plan refusal -- `not entitled` in `error` or in `message`, each field
    searched on its own, case-insensitively -- classifies as
    `ProviderNotEntitled`, after the not-found and credential rules and
    before the default (CAP-003 massive-client section 2.4, AC-29).
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

    if _mentions_not_entitled(fields):
        return ProviderNotEntitled(
            "The provider plan is not entitled to this data.",
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


MAX_FAILURE_REASON_VARIABLE_TEXT = 500
"""Bounds the composed reason's one variable segment (the redacted
diagnostic text), in characters.

Owner decision, 2026-09-11 (this story's task plan Notes): a full
`MAX_PAGE_SIZE = 500` (`src/factorflow/api/bounds.py`) run-detail response
in which every instrument fails therefore stays under roughly 250 KB of
reason text. The bound is also about 2.5 times the approximately
200-character legitimate worst case recorded in
`component-design-massive-client.md` section 4, so it does not truncate a
realistic provider diagnostic while still capping a pathological one.

This is a genuine missing bound in `component-design-massive-client.md`,
the store DDL, and `src/factorflow/api/bounds.py` -- not a precedence
conflict with any of them. It is recorded here for the next
massive-client design revision rather than backfilled into those
artifacts by this story.
"""

_TRUNCATION_MARKER = "…[truncated]"

_ERROR_KIND_BY_TYPE: dict[type[MassiveError], str] = {
    InstrumentNotFound: "not_found",
    CredentialRejected: "credential_rejected",
    ProviderUnavailable: "unavailable",
    ProviderContractViolation: "contract_violation",
    ProviderNotEntitled: "not_entitled",
    ProviderRateLimited: "rate_limited",
}

_CREDENTIAL_REJECTED_DESCRIPTION = "the provider rejected the configured credential"
"""A fixed description for `CredentialRejected` (DAC-E3-S5-2). Never built
from the error's own message, which may itself embed provider-supplied
diagnostic text -- only the fixed kind and the typed fields (symbol, data
type, request ID) are safe to compose unconditionally."""

_NOT_ENTITLED_DESCRIPTION = "the provider plan is not entitled to this data"
"""A fixed description for `ProviderNotEntitled` (CAP-003 massive-client
section 2.5, AC-29). Never built from the provider's text, which is free
text the stored reason must not carry (AGT-PROHIB-003), and never passed to
`redact`."""


def compose_failure_reason(
    error: MassiveError,
    *,
    symbol: str,
    data_type: str,
    redact: Callable[[str], str],
) -> str:
    """Compose a safe, owner-visible failure reason from a typed `error`
    (DAC-E3-13, AC-13, AC-11).

    The stable fields -- the error kind, `symbol`, `data_type`, and the
    provider request ID (explicit even when absent, DAC-E3-S5-1) -- are
    composed first and are never subject to truncation or redaction: they
    never carry provider-supplied free text. Only `error`'s own message is
    variable diagnostic text; it is passed through `redact` *before* it is
    bounded to `MAX_FAILURE_REASON_VARIABLE_TEXT` characters, so a
    credential sitting anywhere in the raw text -- including near the
    truncation boundary -- is removed before the cut is made, not after.

    `redact` is supplied by the caller (`MassiveClient`, which owns the
    usable credential) and is invoked only with `error`'s own message --
    never with `symbol`, `data_type`, or the request ID mixed in.

    `CredentialRejected` never composes its own message into the reason,
    even redacted: it always uses a fixed rejection description
    (DAC-E3-S5-2), because stating "credential rejected" must not depend
    on trusting redaction to catch every way a credential could appear in
    provider-echoed text.

    `ProviderNotEntitled` likewise composes a fixed description, never its
    own message and never through `redact`: the provider's text tells the
    owner nothing the kind and the data type do not, and is provider free
    text the stored reason must not carry (AGT-PROHIB-003).

    Raises `TypeError` if `error`'s exact class is not one of the typed
    `MassiveError` subclasses in this module's kind table -- this composer
    never emits an untyped reason for an unrecognised error class.
    """
    kind = _ERROR_KIND_BY_TYPE.get(type(error))
    if kind is None:
        raise TypeError(
            f"compose_failure_reason does not support {type(error).__name__}; "
            "only the typed MassiveError subclasses in its kind table are accepted."
        )

    if error.provider_request_id is None:
        request_id_segment = "request_id=unavailable"
    else:
        request_id_segment = f"request_id={error.provider_request_id}"

    if isinstance(error, CredentialRejected):
        variable_segment = _CREDENTIAL_REJECTED_DESCRIPTION
    elif type(error) is ProviderNotEntitled:
        variable_segment = _NOT_ENTITLED_DESCRIPTION  # never the provider's text; redact not called
    else:
        variable_segment = _bound_variable_text(redact(str(error)))

    return (
        f"[{kind}] symbol={symbol} data_type={data_type} {request_id_segment}: {variable_segment}"
    )


def _bound_variable_text(text: str) -> str:
    """Bound already-redacted `text` to `MAX_FAILURE_REASON_VARIABLE_TEXT`
    characters, marking the cut with `_TRUNCATION_MARKER` when it is made.

    Called only after redaction (`compose_failure_reason`), so truncating
    here never re-exposes a credential a naive truncate-then-redact order
    could have split across the cut boundary.
    """
    if len(text) <= MAX_FAILURE_REASON_VARIABLE_TEXT:
        return text
    keep = MAX_FAILURE_REASON_VARIABLE_TEXT - len(_TRUNCATION_MARKER)
    return text[:keep] + _TRUNCATION_MARKER
