# Per-instrument outcome classification

`src/factorflow/ingestion/outcomes.py` owns the classification boundary between
a provider result and a persisted outcome string. It contains no SQL, no retry
logic, no credential access, and no reason-composition logic.

**`InstrumentOutcomeRecord`** — A frozen dataclass carrying `data_type`,
`outcome` (one of `"written"`, `"unchanged"`, `"not_found"`, `"failed"`), and
an optional `reason` string. The reason is the pre-composed, credential-safe
failure reason from the Massive-client boundary (`compose_failure_reason`, see
[Massive provider failure reasons](../../README.md#massive-provider-failure-reasons));
it is `None` on success paths.

**`classify_write_result(result: WriteResult) -> dict[str, str]`** — Maps a
`WriteResult` to a dict with exactly four keys (the four schema data-type
names). Each data type maps to `"written"` when any rows were appended, or
`"unchanged"` when every returned row already existed (or none came back). This
is a pure function: no database access, no side effects.

**`classify_provider_error(error, *, data_type, reason) -> InstrumentOutcomeRecord`** —
Maps a typed `MassiveError` to a single `InstrumentOutcomeRecord` for the
failing data type. `InstrumentNotFound` → `"not_found"`;
`ProviderUnavailable`/`ProviderContractViolation`/`ProviderNotEntitled` →
`"failed"`. `ProviderNotEntitled` is a plan refusal: it is recorded against the
one data type the plan does not cover, so the instrument's other data types and
the run go on (CAP-003-E8-S1, AC-29). `ProviderRateLimited`, which the
rate-limit governor raises when a stock's throttle wait budget is spent, is a
`ProviderUnavailable` and is recorded `"failed"` through the same branch
(CAP-003-E8-S2). `CredentialRejected` raises `ValueError` — it is a run-level failure that must
not become a per-data-type outcome row. Any unrecognised type raises `TypeError`.
The `reason` argument is the already-composed, credential-safe reason string
from the Massive-client boundary; this module does not re-compose or re-redact it.

**`write_error_results(connection, run_id, instrument_id, outcome, reason)`** —
Preserved from E4-S5 for the all-at-once fetch phase. Inserts
`run_instrument_result` rows for all four data types when the provider failed
before any per-data-type result was classified. This path is used by callers
that have not yet migrated to the per-data-type fetch seam. Once the runner
fetches data types individually, `classify_provider_error` +
`write_instrument_with_outcomes` replace this path for individual failures.

**Classification table:**

| Provider result | `classify_write_result` / `classify_provider_error` output | Run effect |
|---|---|---|
| Data returned, rows appended | `written` | counts toward `succeeded` |
| Data returned, every value already held | `unchanged` | counts toward `succeeded` |
| Instrument unknown to the provider (`InstrumentNotFound`) | `not_found` | run continues, outcome becomes `partial` |
| Transport or server error, attempts exhausted (`ProviderUnavailable`, `ProviderContractViolation`) | `failed` | run continues, outcome becomes `partial` |
| Plan not entitled to the data type (`ProviderNotEntitled`, a `403` sent once and never retried) | `failed` | run continues, outcome becomes `partial` |
| Rate-limit pacing (`429`) within the throttle wait budget | no outcome — absorbed by the governor before classification | no row written |
| Rate limiting that outlasts the throttle wait budget (`ProviderRateLimited`, a `ProviderUnavailable`) | `failed` | run continues, outcome becomes `partial` |
| Not reached because the run was cancelled | no row written | no coverage, no failure |
