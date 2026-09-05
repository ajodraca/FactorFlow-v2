---
artifact_schema_version: 1
artifact_id: CAP-001-component-design-observation-writer
artifact_type: component-design
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-05
updated: 2026-09-05
ai_provenance:
  agent_id: design-decomposition-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-05T05:20:00Z
  source_artifacts:
    - id: CAP-001
      version: "6"
    - id: CAP-001-system-design
      version: "3"
    - id: CAP-001-ux-design
      version: "3"
    - id: tech-stack
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Component: Observation Writer

**Status:** draft
**Capability:** CAP-001
**Owner:** Alvaro de Jodra
**Last Updated:** 2026-09-05

## 1. Overview

The observation writer is the only component in the product that appends to
point-in-time history. It stamps each observation with the date FactorFlow
observed it, computes the value hash that makes a re-run idempotent, and extends
the coverage segment inside the same transaction as the rows that justify it.

The system design marks its interface **critical, unrecoverable if wrong**, and
that is not rhetorical. C5 says factor and universe history cannot be
reconstructed after the fact: fundamentals are restated and delisted instruments
disappear, so anything overwritten now is lost permanently. Every other
component in this capability can be rewritten later. This one cannot have its
mistakes undone.

Use cases addressed:

- Append observations for the four data types with `observed_on` set by this
  product (AC-5).
- Append nothing when the provider returns a value already held (AC-6).
- Append a new row when the provider returns a restatement, leaving the earlier
  row intact (AC-5).
- Extend coverage only for the range actually written (AC-12).
- Record when an instrument and data type were last reached, including when
  nothing came back (AC-7).
- Do all of the above for one instrument in one transaction, so a failure
  leaves nothing.

Support matrix: the ingestion container only. It is called by
`acquisition-runner` and by nothing else.

Dependencies: `market-data-store`, `psycopg` 3, the Python standard library
`hashlib`.

## 2. Design Details

### 2.1 Placement

```
src/factorflow/ingestion/writer.py     the write API
src/factorflow/ingestion/hashing.py    canonical value hashing
src/factorflow/ingestion/coverage.py   segment merge arithmetic
```

### 2.2 The write transaction

The sequence below is the component's whole contract, and it is drawn because
every acceptance criterion it carries depends on the boundaries of one
transaction rather than on the content of any single statement. All four data
types for one instrument are appended, the coverage segment is merged, the
acquisition state is stamped, and the per-instrument results are recorded, and
then one commit makes all of it visible at once. Nothing partial is ever
observable: a failure at any step rolls back the whole instrument, which is what
lets `coverage-service` read coverage as evidence rather than as intent. The
expected outcome is that an instrument is either fully recorded with coverage
that matches its rows, or absent as though never attempted.

```mermaid
sequenceDiagram
    participant R as acquisition-runner
    participant W as observation-writer
    participant H as hashing
    participant DB as market-data-store

    R->>W: write_instrument(instrument_id, run_id, observations, range_written)
    W->>DB: BEGIN
    loop For each observation
        W->>H: canonical JSON, then SHA-256
        H-->>W: value_hash
        W->>DB: INSERT ... ON CONFLICT DO NOTHING
        DB-->>W: 1 row appended, or 0 because the value is already held
    end
    W->>DB: read existing coverage_segment rows for this instrument and data type
    W->>W: merge the written range into them
    W->>DB: DELETE and INSERT the merged segments, or extend in place
    W->>DB: UPSERT acquisition_state (last_acquired_at, last_run_id, last_outcome)
    W->>DB: INSERT run_instrument_result per data type
    alt Every statement succeeded
        W->>DB: COMMIT
        W-->>R: rows appended per data type, and whether anything changed
    else Any failure
        W->>DB: ROLLBACK
        W-->>R: raise; the instrument is recorded failed by the runner
    end
```

### 2.3 Value hashing

```python
# src/factorflow/ingestion/hashing.py
import hashlib
import json
from decimal import Decimal
from typing import Any


def canonical_json(value: dict[str, Any]) -> bytes:
    """Deterministic JSON: sorted keys, no whitespace, decimals as strings."""
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        default=lambda item: str(item) if isinstance(item, Decimal) else _unsupported(item),
    ).encode("utf-8")


def value_hash(value: dict[str, Any]) -> bytes:
    """SHA-256 over the canonical form. 32 bytes, matching the column check."""
    return hashlib.sha256(canonical_json(value)).digest()
```

Three properties make the hash trustworthy:

- **Determinism.** Sorted keys and fixed separators, so the same value hashes
  the same way across processes and releases. A hash that depended on dictionary
  ordering would append a duplicate row on every run, which is precisely AC-6's
  failure.
- **Decimals as strings.** Prices are `Decimal` and are serialised as their
  string form, never as floats. Passing a price through a float would make
  `123.45` and `123.450000000000003` hash differently on some inputs and
  identically on others, and both errors corrupt append-only history.
- **Value only.** The hash covers the observation's values, never
  `observed_on`, never `run_id`, never `recorded_at`. Including the observation
  date would make every run append a duplicate, since the date changes daily.

An unsupported type raises rather than being coerced, because a silent
`default=str` over an unexpected object would hash a `repr` and produce a value
that looks stable and is not.

### 2.4 The append statements

One shape per table, all four the same in structure:

```sql
-- daily bars
INSERT INTO daily_bar (
    instrument_id, session_date, observed_on, value_hash,
    open_price, high_price, low_price, close_price, volume)
VALUES (%(instrument_id)s, %(session_date)s, %(observed_on)s, %(value_hash)s,
        %(open)s, %(high)s, %(low)s, %(close)s, %(volume)s)
ON CONFLICT (instrument_id, session_date, value_hash) DO NOTHING;
```

`ON CONFLICT DO NOTHING`, never `DO UPDATE`. `DO UPDATE` is the single change
that would break C5, and it is one word away from the correct statement, which
is why the append-only scan in the `market-data-store` design checks for it and
why no other component holds a write path to these tables.

`observed_on` is the run's acquisition date, supplied by the writer. The
provider's `filing_date` travels in the payload as a descriptive attribute and
is never read as an as-of date (system design constraint 5.4).

Batching uses `executemany` over one prepared statement per data type, which
keeps 3000 instruments viable without abandoning the per-instrument transaction
boundary.

### 2.5 Coverage merge

```python
# src/factorflow/ingestion/coverage.py
from datetime import date, timedelta


def merge_ranges(
    existing: list[tuple[date, date]], written: tuple[date, date]
) -> list[tuple[date, date]]:
    """Merge the written range into the existing segments.

    Adjacent ranges merge: [2020-01-01, 2020-06-30] and [2020-07-01, 2020-12-31]
    become one segment, because a one-day boundary is not a gap in coverage.
    Disjoint ranges stay separate, which is what a deepening backfill produces
    before it meets the range already held (AC-22).
    """
```

The merged result replaces the instrument's segments for that data type inside
the same transaction. The database's `coverage_no_overlap` exclusion constraint
is the backstop: a merge bug produces a constraint violation and a rolled-back
instrument rather than double-counted coverage.

Coverage is extended for **the range written, not the range requested**. When a
provider returns data for only part of a requested range, the segment covers
what came back. This is the difference between AC-12 holding and not holding,
and it is why the writer takes the written range from the parsed observations
rather than from the fetch plan.

### 2.6 Interface

```python
# src/factorflow/ingestion/writer.py
from dataclasses import dataclass
from datetime import date
from uuid import UUID

import psycopg


@dataclass(frozen=True)
class WriteResult:
    appended: dict[str, int]      # rows appended, per data type
    unchanged: dict[str, int]     # rows the store already held
    covered_range: tuple[date, date] | None


def write_instrument(
    connection: psycopg.Connection,
    instrument_id: int,
    run_id: UUID,
    observations: "ParsedObservations",
    observed_on: date,
) -> WriteResult:
    """Append observations, merge coverage and stamp state, in one transaction.

    Raises on any failure, having rolled back. The caller records the
    instrument as failed; nothing partial survives.
    """
```

`appended` and `unchanged` are returned separately because the runner needs the
distinction: an instrument for which everything was already held is `unchanged`
and counts toward a successful run, while an instrument for which nothing was
returned at all is a different outcome entirely.

### 2.7 Messages

N/A, not applicable for this component.

## 3. Constraints and Assumptions

- **Append-only, forever** (C5, system design constraint 5.3). No `UPDATE`, no
  `DELETE`, against any observation table, in any code path, in this capability
  or any later one.
- **The observation date is FactorFlow's** (system design constraint 5.4). The
  provider's date is an attribute.
- **Idempotent on the value** (AC-6). The natural key includes the value hash,
  so a repeated run appends nothing and a restatement appends a row.
- **Coverage is derived, never asserted** (system design constraint 5.9).
  Segments extend only inside the transaction that wrote the rows, and only for
  the range that came back.
- **One instrument, one transaction** (AC-12). No batching across instruments.
- **Assumption: the runner supplies parsed, validated observations.**
  `massive-client` validates; this component does not re-validate provider
  shapes, and would be the wrong place to.
- **Assumption: `observed_on` is the acquisition date rather than the moment.**
  A date, not a timestamp, because C5 asks for the date a value was known and a
  finer resolution would make two runs on one day produce different keys for the
  same value.

## 4. Security

- **Data classification.** Observations are Internal. No Restricted value passes
  through this component.
- **Injection (SEC-INP-002).** Every statement is parameterised and prepared.
  The payload reaches the database as a JSONB bind parameter, never as
  interpolated text, so no provider field can alter a statement.
- **Provider data is data (AGT-PROHIB-003).** Nothing in an observation selects
  a code path, names a table, or is interpolated into SQL or a log format.
- **Crypto usage.** SHA-256 from the standard library, used as a content
  fingerprint for idempotence rather than as a security primitive. No custom
  construction (SEC-ENC-002). The choice of SHA-256 over a faster non-
  cryptographic hash is deliberate: a collision here would silently discard a
  restatement, which is unrecoverable, and the cost of a cryptographic digest
  over a few kilobytes is irrelevant beside a network round trip.
- **Errors are never swallowed (OPS-ERR-001).** Every failure raises, having
  rolled back. There is no branch that catches a write failure and continues.
- **Destructive operation prevention (OPS-DEST-001).** This component performs
  no destructive operation. The one statement that deletes anything is the
  coverage segment replacement in section 2.5, which rewrites derived rows
  inside the transaction that recomputes them and never touches an observation.
- **Privacy impact: none.**
- **OSS inventory:** `psycopg` 3 only; hashing is standard library.

## 5. Scalability and Performance

- **The write path is the run's second cost after the provider.** At AC-4's
  3000 instruments and five years of daily bars, a first run appends on the
  order of 3.8 million rows across 3000 transactions.
- **Batching within the transaction.** `executemany` over one prepared statement
  per data type, so an instrument with 1260 bars is one round trip rather than
  1260 (SA-RES-001).
- **Hashing cost.** One SHA-256 over a few hundred bytes per observation, on the
  order of microseconds. At 3.8 million rows this is a few seconds across a run
  that is bounded by the provider's rate budget in any case.
- **Memory.** One instrument's observations at a time, released at commit. Peak
  memory is a function of the largest instrument's history, not of the roster.
- **The coverage merge** reads at most a handful of segments per instrument and
  data type, served by `idx_coverage_instrument`.
- **Concurrency (SA-CONC-001).** One writer at a time, because one run is
  active. No shared mutable state; the connection is not shared across tasks.
- **No throughput target is stated** by the capability, so none is asserted.

## 6. Upgrade

- **No previous release.**
- **The hash function is a compatibility surface.** Changing the canonical form
  or the digest in a later release would make every existing row hash
  differently, so the next run would append a duplicate of everything, doubling
  the history. Any change to `hashing.py` is therefore a breaking change
  requiring a migration strategy, and this is recorded here because the code
  looks innocuous and the consequence is not recoverable.
- **Adding a data type later** adds a table, an append statement and a coverage
  data type value. It does not change any existing row.
- **Data migration: none owned here.**
- **Behaviour change after upgrade: none in this capability.**
- **Manual actions required: none.**
- **Rollback (OPS-MIG-003).** Reverting the ingestion image is safe as long as
  the hash function is unchanged, which is the same constraint as above read
  backwards.

## 7. Testing

`testcontainers[postgres]` throughout, because this component's correctness is
inseparable from the database constraints it writes against. The two exceptions
are the hashing and merge tests, which are pure functions.

| Test | File | What it proves |
|------|------|----------------|
| Identical value appends nothing | `tests/integration/test_writer_idempotence.py` | A second write of the same bar leaves one row and reports it `unchanged` (AC-6) |
| Restated value appends a row | `tests/integration/test_writer_idempotence.py` | A changed close price for the same session appends a second row with today's `observed_on`, and the first row is byte-identical afterwards (AC-5) |
| Observed date is ours | `tests/integration/test_writer_dates.py` | `observed_on` is the acquisition date and not the provider's `filing_date` (C5) |
| Filing date is retained as an attribute | `tests/integration/test_writer_dates.py` | The payload carries it and no query reads it as an as-of date |
| Coverage matches rows written | `tests/integration/test_writer_coverage.py` | The segment covers exactly the range returned, not the range requested (AC-12) |
| A partial provider response covers only what came back | `tests/integration/test_writer_coverage.py` | Requesting five years and receiving three leaves a three-year segment (AC-12) |
| Failure leaves nothing | `tests/integration/test_writer_transaction.py` | An error after the bar insert leaves no bar, no segment and no state row (AC-12) |
| Adjacent segments merge | `tests/unit/test_coverage_merge.py` | Two ranges one day apart become one; no container needed |
| Disjoint segments stay separate | `tests/unit/test_coverage_merge.py` | A deepening backfill not yet meeting the held range stays two segments (AC-22) |
| Overlap is impossible | `tests/integration/test_writer_coverage.py` | A merge bug raises the exclusion constraint rather than double-counting |
| Hash is deterministic | `tests/unit/test_hashing.py` | Key order does not change the digest |
| Decimals do not pass through float | `tests/unit/test_hashing.py` | Prices differing in the last place hash differently, and equal prices hash identically |
| Hash excludes the observation date | `tests/unit/test_hashing.py` | The same value on two dates hashes the same, which is what makes a re-run append nothing (AC-6) |
| Unsupported types raise | `tests/unit/test_hashing.py` | No silent `repr` fallback |
| No update or delete on observations | `tests/unit/test_sql_is_append_only.py` | Shared with the store design; the statements here are `INSERT` only (C5) |
| Volume | `tests/integration/test_writer_volume.py` | One instrument with five years of bars writes in one transaction within the suite timeout (AC-4) |

Migration testing, backward compatibility and security testing for this
component all reduce to the hash-stability property in section 6, which the
determinism tests cover.

## 8. Acceptance Criteria

1. Every appended row carries `observed_on` set by this product.
2. Writing an observation whose value is already held appends no row and is
   reported as unchanged.
3. Writing a restated value for a period already held appends a new row and
   leaves the earlier row unchanged in every column.
4. The provider's filing date is stored in the payload and is never used as the
   as-of date.
5. The coverage segment written covers exactly the range for which rows were
   returned.
6. A failure at any point in an instrument's write leaves no observations, no
   coverage segment and no acquisition state for that attempt.
7. Adjacent coverage ranges merge into one segment; disjoint ranges remain
   separate.
8. No statement issued by this component updates or deletes an observation row.
9. The value hash is identical for equal values regardless of key order, and
   differs for values differing in the last decimal place.
10. The value hash does not include the observation date, the run identifier or
    the recording timestamp.
11. Failure scenario: a provider response containing a duplicate session date
    appends one row rather than raising, because the second insert conflicts and
    does nothing.
12. Failure scenario: an unsupported value type raises during hashing rather
    than producing a digest over a string representation.

## 9. Workflows

- **Intersecting workflow: every acquisition run.** This component introduces no
  workflow of its own; it is the write half of the runner's instrument loop.
- **Intersecting workflow: recover from a failed run.** The capability's third
  flow, step 5, requires that a re-run leaves data neither duplicated nor
  overwritten. That is this component's idempotence, and it is why the flow is
  safe to repeat as often as the owner likes.
- **Intersecting workflow: stop a run.** The capability's fourth flow requires
  that instruments already acquired keep their coverage. That follows from the
  per-instrument commit boundary here.
- **Intersecting workflow: deepen history.** AC-22's backfill appends an earlier
  range and merges it, without touching the range already held.

## 10. UX / GUI

N/A, not applicable for this component. Two interface guarantees rest on it. The
Coverage screen's covered ranges are trustworthy because segments are written
only alongside the rows that justify them, which is what lets the UX design
state that coverage is derived from written rows only. And the Run detail
screen's offer of a re-run as the recovery action for a failure is safe advice
only because of the idempotence specified in section 2.3.

Internationalization: none.

## 11. API Endpoints

This component exposes no HTTP surface.

| Endpoint | Method/Operation | Auth/Privilege | Request | Response | Notes |
|----------|-----------------|----------------|---------|----------|-------|
| `write_instrument` | in-process call | ingestion database credential | Instrument, run, parsed observations, observation date | Rows appended and unchanged per data type, and the covered range | Consumer is `acquisition-runner`; one call is one transaction (AC-12) |
| Observation append | `INSERT ... ON CONFLICT DO NOTHING` | ingestion database credential | Observation rows with hash and observation date | Rows inserted | The system design's **critical** interface; no `UPDATE`, no `DELETE` (C5) |
| Coverage extension | `SELECT`, then segment replacement | ingestion database credential | Written range | Merged segments | Inside the same transaction as the appends |
| Acquisition state stamp | `INSERT ... ON CONFLICT DO UPDATE` on `acquisition_state` | ingestion database credential | Instrument, data type, run, outcome | None | The one permitted upsert, on derived state rather than on history (AC-7) |

## 12. References

| Type | Document Name | Description | Link |
|------|---------------|-------------|------|
| Capability | CAP-001 v6 | AC-5, AC-6, AC-7, AC-12, AC-22 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/Capability-CAP-001.md` |
| System design | CAP-001 system design v3 | Control flow steps 15 to 17, constraints 5.3, 5.4, 5.9; the critical interface in 4.2 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/system-design.md` |
| Component design | Market Data Store | Observation tables, natural keys, the coverage exclusion constraint | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-market-data-store.md` |
| Constitution | Product Charter v2 | C5, append-only point-in-time history | `docs/constitution/product-charter.md` |
| Constitution | Tech Stack v2 | Provider fundamentals are not as-reported; no ORM | `docs/constitution/tech-stack.md` |

## 13. Traceability

| Capability AC | System Design Element | Component Design Element | Section |
|--------------|----------------------|--------------------------|---------|
| AC-5 | `observation-writer` appends with `observed_on` | Writer stamps the acquisition date; provider date is payload only | 2.4 |
| AC-6 | `INSERT ... ON CONFLICT DO NOTHING` on the natural key including a value hash | Canonical hashing and the conflict target | 2.3, 2.4 |
| AC-7 | `coverage-service` reports last acquired | `acquisition_state` upsert inside the transaction | 2.2, 2.6 |
| AC-12 | Coverage segments extended only inside the committed write transaction | One transaction per instrument; coverage for the range written, not requested | 2.2, 2.5 |
| AC-22 | Backfill preserves already-covered history | Merge arithmetic keeping disjoint ranges separate until they meet | 2.5 |
| AC-3 | Four data types acquired | One append statement per data type | 2.4 |

## 14. Open Questions

1. **Should `observed_on` be the run's start date or the moment each instrument
   is written?** This design uses the run's acquisition date so every instrument
   in one run shares an observation date, which makes a run's output a coherent
   point-in-time snapshot. A run crossing midnight would then stamp instruments
   with a date earlier than the day they were actually fetched. The alternative
   splits one run across two observation dates. Neither the capability nor the
   system design says. *Owner: capability owner. Blocks: an acceptance
   criterion; both readings satisfy AC-5 as written.*
2. **Should the hash cover the provider's filing date?** It is currently in the
   payload and therefore in the hash, which means a restatement that changes
   only the filing date and no value appends a new row. That is arguably correct,
   since the provider's record did change, and arguably noise. *Owner: system
   design owner. Blocks: nothing; the current behaviour errs toward appending,
   which is the recoverable direction.*
3. **Is a coverage segment per data type the right granularity for
   fundamentals?** Fundamentals arrive per fiscal period rather than per day, so
   a date range describes them loosely. The capability asks for a covered range
   per data type, which this satisfies, but a reader may over-read a fundamentals
   range as a promise of daily completeness. *Owner: system design owner.
   Blocks: nothing; recorded because the interface renders the range.*
