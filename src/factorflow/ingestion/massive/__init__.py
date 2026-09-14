"""The Massive provider boundary: the only place this codebase holds the
provider credential in usable form and the only place that knows Massive's
response shapes (`component-design-massive-client.md` section 1).

Package contents land across CAP-001-E3's stories:

- `models.py` -- CAP-001-E3-S2. The four Pydantic response models.
- `client.py` -- CAP-001-E3-S1. `MassiveClient`'s four historical reads.
- `errors.py` -- CAP-001-E3-S3. The typed error taxonomy. CAP-001-E3-S5
  adds the safe failure-reason composer to this same module.

Only the four product model types and the error-taxonomy primitives are
re-exported here (DAC-E3-12): a caller of `massive-client` --
`CAP-001-E3-S1`'s historical reads -- imports `TickerReference`,
`DailyBar`, `FinancialStatement`, `CorporateAction`, the five
`MassiveError` types, `classify_error_body`, `is_rate_limited_body`,
`is_fatal_for_governor`, `wrap_validation_error`, `compose_failure_reason`
and `MAX_FAILURE_REASON_VARIABLE_TEXT` from this package, never the
Massive SDK's own `BadResponse` type or a raw wire dictionary.

The client, as the caller identified by
`component-design-rate-limit-governor.md` section 2.3, adapts these
primitives to `Outcome.THROTTLED`, `RETRYABLE` or `FATAL`: this package
supplies the classification seam and never imports that enum itself, so
`CAP-001-E3-S4` remains the sole owner of pacing and retry behavior.

`compose_failure_reason` (CAP-001-E3-S5) is a narrow, testable seam: this
package owns safe reason composition, `CAP-001-E3-S1`'s `MassiveClient`
supplies the credential-aware `redact` closure at call time, and
`CAP-001-E4-S6` consumes only the resulting string for
`run_instrument_result.reason`. This package never loads runtime
configuration or unwraps a credential itself.
"""

from factorflow.ingestion.massive.errors import (
    MAX_FAILURE_REASON_VARIABLE_TEXT,
    CredentialRejected,
    InstrumentNotFound,
    MassiveError,
    ProviderContractViolation,
    ProviderUnavailable,
    classify_error_body,
    compose_failure_reason,
    is_fatal_for_governor,
    is_rate_limited_body,
    wrap_validation_error,
)
from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)

__all__ = [
    "MAX_FAILURE_REASON_VARIABLE_TEXT",
    "CorporateAction",
    "CredentialRejected",
    "DailyBar",
    "FinancialStatement",
    "InstrumentNotFound",
    "MassiveError",
    "ProviderContractViolation",
    "ProviderUnavailable",
    "TickerReference",
    "classify_error_body",
    "compose_failure_reason",
    "is_fatal_for_governor",
    "is_rate_limited_body",
    "wrap_validation_error",
]
