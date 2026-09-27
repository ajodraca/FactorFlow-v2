---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-17
updated: 2026-09-17
story_id: "CAP-001-E4-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-17T21:47:59Z"
reviewed_head: "f554687b1c9692dec921b98ce94ab9f35843abdc"
review_base: "eefe8614fe62adcd0c417c7ace266f761e132e95"
reviewed_state_revision: "sha256:ed5db225806a5b01c4cd1c3b54fa2f67de10b2de83c3aa9353d4decfdfc6ea7a"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E4-S1
    artifact_version: 1
    content_revision: sha256:e6c942a30383f662b07f3c220e6b0b8097b48e55328cd7e08158d79148d8a885
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-09-17T21:47:59Z
  source_artifacts:
    - id: CAP-001-E4-S1
      version: "1"
    - id: CAP-001-E4-S1-tasks
      version: "1"
    - id: CAP-001-component-design-market-data-store
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S1 — Version 1

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 3 · MEDIUM 2 · LOW 4 · **total 9**

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 2 |
| Low findings | 4 |
| Acceptance criteria | 9/12 satisfied |
| Planned tasks | 3/4 verified |
| Required validation | 7/7 passed |

Every validation command in the task plan passes independently, and the shipped
migration reproduces the design's SQL for `0002` almost verbatim. The schema's
core idempotence mechanism is real and I proved it under PostgreSQL 16: an
identical re-fetch on a later `observed_on` writes zero rows, a restatement
coexists, and the two mutations the plan names (adding `observed_on` to a unique
key, removing a `value_hash` length check) each break a shipped assertion.

Three things block the gate. First, `observed_on date NOT NULL DEFAULT
current_date` inherits the PostgreSQL session time zone, which defaults to
`Etc/UTC` in the project's own test container, while the approved owner decision
recorded in `design/ux-brief.md` states that America/Chicago computes
`observed_on`; for roughly six hours of every day the append-only history would
record tomorrow's date as FactorFlow's observation date, and the mapped test
cannot detect it because it compares the default against `current_date` in the
same session. Second, the static append-only guard — the only enforcement
mechanism the owner chose for DAC-E4-S1-6 and DAC-E4-S1-7 — does not match
`INSERT ... ON CONFLICT ... DO UPDATE SET`, which is the upsert idiom this
codebase already uses at `src/factorflow/instruments/settings.py:74` and the
most plausible way a future writer would destroy observation history. Third,
T004's required RED and manual-mutation record does not exist in any form: no
`CAP-001-E4-S1-tdd-evidence.yaml` accompanies this story although all five
CAP-001-E3 peers produced one, and the tests and the migration landed in a
single commit, so the RED phase is unverifiable from history.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S1` |
| HEAD | `f554687b1c9692dec921b98ce94ab9f35843abdc` |
| Review base | `origin/main` merge base `eefe8614fe62adcd0c417c7ace266f761e132e95` |
| Working tree | clean — `git status --porcelain` empty; no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 5 |

The branch contains the stopped-stage commit `64e27ce` (all three code/test
files plus the task checkboxes), the merge of `origin/main` at `cacf59d`, and
the final validation commit `f554687` (task plan and story frontmatter only).
`git merge-base HEAD origin/main` resolves to the `origin/main` tip itself
because that merge is already in the branch, so the diff
`eefe861..HEAD` isolates this story's work cleanly from unrelated
`main` history. The older local `main` (`bf3ac30`) was not used as the base
because it predates the merged `origin/main` and would have pulled in
CAP-001-E3-S1 and the static-mount isolation change as apparent story scope.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `migrations/0002_observations.sql` | added | AC-5, AC-6, DAC-E1-6, DAC-E4-1, DAC-E4-2, DAC-E4-S1-1 … DAC-E4-S1-6; T003 |
| `tests/integration/test_observation_append.py` | added | T001 (TC-COMP-005, 006, 135, 136, 150–154, 297) |
| `tests/unit/test_sql_is_append_only.py` | added | T002 (TC-COMP-155, TC-COMP-156) |
| `.../stories/CAP-001-E4-S1-tasks.md` | modified | T001–T004 checkbox bookkeeping only; no task text altered |
| `.../stories/CAP-001-E4-S1.md` | modified | `status: planning` → `in-review`, `updated` date; story-coding handoff bookkeeping |

No production source under `src/factorflow/` was touched, which is consistent
with the task plan's Phase 4 statement that this schema-only story adds no
runtime integration code. No dependency, configuration, or unrelated refactor
appears in the change set. No scope leakage found.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-5 | PARTIAL | `migrations/0002_observations.sql:3,22,43,66` (`observed_on ... DEFAULT current_date`), natural keys at lines 15-16, 31-32, 52-53, 73-74 | `test_observation_append.py::test_identical_refetch_is_noop_and_restatement_coexists`, `::test_database_defaults_observed_on_and_keeps_filing_date_descriptive` | Restatement-appends half is genuinely proven for all four tables (I reran it: 15 passed). The "carries the date FactorFlow observed it" half is time-zone dependent and unpinned — IR-001. |
| AC-6 | SATISFIED | Unique constraints exclude `observed_on` on all four tables, so an identical value collides regardless of fetch date | `::test_identical_refetch_is_noop_and_restatement_coexists` (parametrized over all four tables) | Independently reproduced against PostgreSQL 16: first insert `rowcount=1`, identical re-fetch on a later `observed_on` `rowcount=0`, restated hash `rowcount=1`, and the surviving rows are exactly the original plus the restatement. |
| DAC-E1-6 | SATISFIED | `instrument_reference_natural_key`, `daily_bar_natural_key`, `fundamental_natural_key`, `corporate_action_natural_key` each include `value_hash` | `::test_identical_refetch_is_noop_and_restatement_coexists` | Matches `component-design-market-data-store.md` §2.3 exactly, including the deliberate hash-only key for `instrument_reference` (design §2.3 rationale). TC-COMP-297's own trace comment is mis-sited — IR-005. |
| DAC-E4-1 | SATISFIED | `provider_filing_date date` with no NOT NULL and no key membership; `COMMENT ON COLUMN` at lines 56-57 | `::test_database_defaults_observed_on_and_keeps_filing_date_descriptive` asserts the comment text and that `observed_on != provider_filing_date` | The column is absent from every constraint and index, so it cannot act as an as-of date. |
| DAC-E4-2 | SATISFIED | The unique constraints are the conflict arbiters an `ON CONFLICT DO NOTHING` append needs | `::test_identical_refetch_is_noop_and_restatement_coexists` executes real `INSERT ... ON CONFLICT DO NOTHING` | No application writer exists in this story by design (task plan Notes); the criterion's schema half is what is testable here. |
| DAC-E4-S1-1 | PARTIAL | `DEFAULT current_date` on all four tables | `::test_database_defaults_observed_on_and_keeps_filing_date_descriptive` | The default exists and is not provider-derived, but `current_date` follows the session `TimeZone`. IR-001. |
| DAC-E4-S1-2 | SATISFIED | Natural keys exclude `observed_on` | `::test_identical_refetch_is_noop_and_restatement_coexists` asserts `cursor.rowcount == 0` and that the pre-existing row is unchanged | Mutation-sensitive: adding `observed_on` to `daily_bar_natural_key` makes the assertion fail (probe evidence below). |
| DAC-E4-S1-3 | SATISFIED | Differing `value_hash` falls outside the unique key | Same test's `restated_row_count == 1` plus the exact two-row `(observed_on, value_hash)` comparison | Asserts the full resulting row set, not merely a count, so a silent overwrite would fail it. |
| DAC-E4-S1-4 | SATISFIED | Four `CHECK (octet_length(value_hash) = 32)` constraints; `bytea NOT NULL` | `::test_value_hash_rejects_non_sha256_lengths` (4 tables × 31/33 bytes = 8 cases) | Both boundaries are exercised on every table. Removing `daily_bar_hash_len` makes the 31-byte case pass the insert, i.e. the test fails (probe evidence below). |
| DAC-E4-S1-5 | SATISFIED | `numeric(18, 6)` for OHLC, `numeric(20, 4)` for volume | `::test_daily_bar_uses_exact_numeric_columns` asserts `data_type`, precision and scale for all five columns | Reads `information_schema`, so a change to `double precision` or a different scale fails it. |
| DAC-E4-S1-6 | PARTIAL | `0002_observations.sql` contains no `UPDATE`/`DELETE`/`BEGIN`/`COMMIT` (I confirmed by reading the file in full and by the passing `test_migration_filenames.py`) | `test_sql_is_append_only.py::test_observation_history_sql_is_append_only` | The present migration is clean. The "no later migration may introduce one" half rests on a guard that misses the `ON CONFLICT DO UPDATE` form — IR-002. |
| DAC-E4-S1-7 | PARTIAL | No observation query path exists yet; the only `UPDATE`s under `src/factorflow/` target `instrument` and `owner_setting` | `test_observation_history_sql_is_append_only`, `test_guard_detects_prohibited_observation_mutation`, `test_guard_ignores_mutations_of_non_observation_tables` | Currently true of the codebase, but the regression guard has demonstrable blind spots — IR-002, IR-007. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/integration/test_observation_append.py` — five test functions, 15 collected cases, all `@pytest.mark.postgres`; `# Implements TC-COMP-…` comments present for 005, 006, 135, 136, 150, 151, 152, 153, 154, 297 | Every element the task enumerates is present: both migrations applied in the fixture, all four tables asserted, `current_date` default, descriptive filing date, 31/33-byte rejection, `numeric` types, and the no-op/coexistence inserts. The TC-COMP-297 comment sits on the weakest of the five tests (IR-005). |
| T002 | complete | PARTIAL | `tests/unit/test_sql_is_append_only.py` — `MUTATION_PATTERN`, `observation_sql_paths()` over `migrations/*.sql` and `src/factorflow/**/*.py`, `# Implements TC-COMP-155, TC-COMP-156`, plus a positive and a negative fixture | Scope, case-insensitivity, the four-table restriction and the `coverage_segment` exemption are all correct. The task requires failing when "an `UPDATE` or `DELETE` statement targets" an observation table; `INSERT ... ON CONFLICT ... DO UPDATE SET <observation table>` is such a statement and is not matched — IR-002. |
| T003 | complete | VERIFIED | `migrations/0002_observations.sql` (77 lines) | All four tables, `instrument` FKs, `DEFAULT current_date`, `bytea NOT NULL` + 32-byte checks, natural keys excluding `observed_on`, `numeric(18,6)`/`numeric(20,4)`, the filing-date comment, and all four design-specified indexes. No `UPDATE`, `DELETE`, `BEGIN` or `COMMIT`. The `DEFAULT current_date` addition relative to design §2.3 is AC-mandated but undocumented — IR-004. |
| T004 | complete | PARTIAL | Commit `f554687` message; no evidence artifact in the repository | I reran all seven commands and all pass, so the validation half is verified. The task also requires recording RED before T003 and manual mutation evidence; no such record exists anywhere (IR-003), and `64e27ce` committed the tests and the migration together, so RED cannot be reconstructed from history. |

Dependencies and phase checkpoints: T001/T002 are in separate files as planned;
T003's Phase 3 checkpoint holds (applying `0001` then `0002` yields four
queryable tables — the fixture does exactly this and 15 tests pass); Phase 4's
checkpoint holds (`test_migration_filenames.py::test_real_migration_versions_are_contiguous_from_one`
and the `discover()` BEGIN/COMMIT and non-transactional-DDL guards all pass with
`0002` present, so version 2 is discovered after version 1). Checkbox
bookkeeping is otherwise consistent: no unchecked task appears implemented.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_all_observation_tables_exist` / TC-COMP-005, TC-COMP-297 | WEAK | Queries `information_schema.tables` and asserts the sorted set equals the four expected names, so a missing or misnamed table fails. | TC-COMP-297's expected result is a natural-key uniqueness constraint including a value hash; this test asserts nothing about constraints. The behavior is proven by the TC-COMP-136 test in the same file, so the gap is traceability rather than coverage — IR-005. |
| `test_database_defaults_observed_on_and_keeps_filing_date_descriptive` / TC-COMP-135, TC-COMP-150 | WEAK | Omits `observed_on` from the INSERT, then asserts via `RETURNING` that the stored value differs from the deliberately distant `provider_filing_date` (2001-02-03) and that `observed_on = current_date` is true; separately pins the exact column-comment text. | `observed_on = current_date` is evaluated in the same session that applied the default, so it is a tautology: it would hold under any session `TimeZone` and cannot detect the wrong-zone defect in IR-001. Pinning the date to an expected zone (or the calendar date of a controlled instant) is what would make it regression-sensitive. |
| `test_value_hash_rejects_non_sha256_lengths` / TC-COMP-153 | ADEQUATE | Parametrized 4 tables × {31, 33} bytes, each inside `observation_connection.transaction()` so a failed insert does not poison later cases, asserting `psycopg.errors.CheckViolation`. | Asserts the exception class but not which constraint raised it (IR-009, LOW). Regression-sensitive: I removed `daily_bar_hash_len` from a copy of the migration and the 31-byte insert was accepted, i.e. the case fails. |
| `test_daily_bar_uses_exact_numeric_columns` / TC-COMP-154 | ADEQUATE | Reads `data_type`, `numeric_precision`, `numeric_scale` from `information_schema.columns` and compares the whole five-column dictionary by equality. | None. A switch to `double precision`, or any precision/scale drift, fails it. |
| `test_identical_refetch_is_noop_and_restatement_coexists` / TC-COMP-006, 136, 151, 152 | ADEQUATE | Parametrized over all four tables. Executes three real `INSERT ... ON CONFLICT DO NOTHING` statements, capturing `cursor.rowcount` after each (1, then 0 for the identical value re-fetched on a *later* `observed_on`, then 1 for a changed hash), then asserts the exact resulting `(observed_on, value_hash)` row list. | None material. Asserting the final row set — not just counts — is what makes an overwrite detectable. Regression-sensitive: adding `observed_on` to `daily_bar_natural_key` turns the middle `rowcount` into 1 and the assertion fails. |
| `test_observation_history_sql_is_append_only` / TC-COMP-155, TC-COMP-156 | WEAK | Scans every `migrations/*.sql` and every `src/factorflow/**/*.py` file and asserts the violation dictionary is empty; passes today and correctly ignores the `instrument`/`owner_setting` mutations and the design-permitted `coverage_segment` delete. | Blind to `INSERT ... ON CONFLICT ... DO UPDATE SET <table>`, `UPDATE ONLY <table>`, `DELETE FROM ONLY <table>`, and `"public"."<table>"` — IR-002, plus the narrower-than-AC file scope in IR-007. |
| `test_guard_detects_prohibited_observation_mutation` | ADEQUATE | Asserts the exact matched substring `["DELETE FROM daily_bar"]`, not merely truthiness, so a regex that over-matches would fail. | Single form only; no `UPDATE` positive fixture and none of the forms in IR-002. |
| `test_guard_ignores_mutations_of_non_observation_tables` | ADEQUATE | Proves the guard does not fire on `UPDATE acquisition_state` or `DELETE FROM coverage_segment`, which the design explicitly permits. | None. This is the false-positive direction the task plan's Notes call out. |

Isolation and determinism: every PostgreSQL test takes `postgres_connection_string`,
which creates and drops a uniquely named database per test inside one
session-scoped container (`tests/conftest.py`), so the suite is order-independent
and leaves no shared state. Insert dates are literal, not derived from
`date.today()`, apart from the intentional `current_date` assertion. No mock
bypasses the unit under test — these are real-database contract tests, and the
static guard reads real repository files rather than fixtures, which is the
strongest available form for both. I re-ran the story tests twice with identical
results.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m postgres tests/integration/test_observation_append.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `15 passed in 2.43s` |
| `uv run pytest tests/unit/test_sql_is_append_only.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `3 passed in 0.01s` |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `373 passed, 2 warnings in 20.70s`. The pre-existing `test_api_static_mount.py` failure that stopped the earlier story-coding stage is resolved by the merged `origin/main` commit `f0b40c2`; no test is skipped or deselected. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!` |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `104 files already formatted` |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 30 source files` |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` built |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story <story> --stage adversarial-review` | `ai-agents` | 0 | PASS | `READY — story is ready for independent review` |
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | `ai-agents` | 0 | PASS | All eight shared checks passed |
| `uv run python /tmp/ff_mut/probe.py` (reviewer-authored mutation probe, run against copies in `/tmp`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Baseline: re-fetch `rowcount=0`, 31-byte hash rejected. Mutation A (`observed_on` added to `daily_bar_natural_key`): re-fetch `rowcount=1` → the shipped assertion fails. Mutation B (`daily_bar_hash_len` removed): 31-byte hash accepted → the shipped assertion fails. |
| `uv run python /tmp/ff_guard_probe.py` (reviewer-authored guard probe) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Guard catches plain and multi-line `UPDATE`/`DELETE FROM`; misses `ON CONFLICT DO UPDATE SET`, `UPDATE ONLY`, `DELETE FROM ONLY`, `"public"."daily_bar"`, `TRUNCATE`, `DROP TABLE`, `ALTER ... DROP COLUMN`. Correctly ignores the permitted `coverage_segment` delete and the `owner_setting` upsert. |
| `uv run python /tmp/ff_mut/tz4.py` (reviewer-authored time-zone probe) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `postgres:16` default session `TimeZone` is `Etc/UTC`. The same instant (2026-03-10T04:30Z) is calendar date `2026-03-10` under `Etc/UTC` and `2026-03-09` under `America/Chicago`. |

No required command was skipped. The `npm`/`npx` commands in
`docs/constitution/tech-stack.md` were not run: this change set contains no
TypeScript, frontend, or `package.json` change, the task plan's validation
section names only the seven Python commands, and `uv run pytest` already
exercises the static-mount integration tests that depend on frontend build
output. `uv run pytest -m 'not postgres'` was not needed because a container
runtime was available and the full suite ran.

The three reviewer-authored probe scripts live under `/tmp` and read the
repository's migration files read-only; no repository file was created,
modified, or deleted to produce them, and no production or test code was
changed by this review.

### Validation Side Effects

- Before: `git status --porcelain` empty at `f554687b1c9692dec921b98ce94ab9f35843abdc`.
- After: `git status --porcelain` empty at `f554687b1c9692dec921b98ce94ab9f35843abdc`. `uv build` created `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl`, and pytest refreshed `__pycache__`; both paths are covered by `.gitignore` (`build/`, `dist/`) and appear only under `git status --ignored`. Testcontainers started and removed ephemeral `postgres:16` containers.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Status | Title | AC / Tasks |
|----|----------|--------|-------|------------|
| IR-001 | HIGH | OPEN | `observed_on DEFAULT current_date` records a session-time-zone-dependent date | DAC-E4-S1-1, AC-5 / T003, T001 |
| IR-002 | HIGH | OPEN | Static guard does not detect `ON CONFLICT ... DO UPDATE` against observation tables | DAC-E4-S1-6, DAC-E4-S1-7 / T002 |
| IR-003 | HIGH | OPEN | T004's required RED and manual-mutation evidence does not exist | N/A / T004 |
| IR-004 | MEDIUM | OPEN | Deviation from approved design §2.3 undocumented and unguarded | DAC-E4-S1-1 / T003 |
| IR-005 | MEDIUM | OPEN | TC-COMP-297 traced to a test asserting only table existence | DAC-E1-6 / T001 |
| IR-006 | LOW | OPEN | `_insert_values()` takes an unused `table` argument | N/A / T001 |
| IR-007 | LOW | OPEN | Guard scope narrower than DAC-E4-S1-7's "anywhere in the codebase" | DAC-E4-S1-7 / T002 |
| IR-008 | LOW | OPEN | Story Data Changes section still contradicts the shipped unique constraints | AC-6, DAC-E4-S1-2 / N/A |
| IR-009 | LOW | OPEN | Hash-length test asserts the exception class but not the constraint | DAC-E4-S1-4 / T001 |

### IR-001 — `observed_on DEFAULT current_date` records a session-time-zone-dependent date, not FactorFlow's observation date

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-1, AC-5
- **Tasks**: T003, T001
- **Files**: `migrations/0002_observations.sql:3`, `:22`, `:43`, `:66`; `tests/integration/test_observation_append.py:97-124`
- **Claim challenged**: T003's and DAC-E4-S1-1's claim that `observed_on date NOT NULL DEFAULT current_date` records "FactorFlow's own observation date".
- **Observed evidence**: PostgreSQL evaluates `current_date` in the session's `TimeZone` setting. Nothing in this change set, in `0001_extensions_owner_state.sql`, in `src/factorflow/db/`, or in the connection strings pins that setting. My probe shows the project's own `postgres:16` test container defaults to `Etc/UTC`, and that a single instant (2026-03-10T04:30Z) is calendar date `2026-03-10` under `Etc/UTC` but `2026-03-09` under `America/Chicago`. The mapped test asserts `observed_on = current_date` inside the same session, which is true under every zone and therefore cannot detect this.
- **Expected evidence/behavior**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-brief.md:400` records the owner decision of 2026-09-05 closing OQ-UI-3: "Dates are ISO-8601 and timestamps carry a visible zone, which is America/Chicago … The same zone computes `observed_on`", and explicitly anticipates that "a run between 23:00 and 24:00 Central stamps a calendar day that exchange time would call the next one". A default that follows an unpinned server setting does not implement a named zone.
- **Impact**: For roughly six hours of every day (18:00/19:00 Central to midnight), a run against a UTC-configured server appends observation rows dated a day later than the day FactorFlow observed them. The story's own Description states C5 "cannot be repaired retrospectively", and because the value hash excludes `observed_on`, a corrected re-fetch is a no-op that cannot overwrite the wrong date — the error is permanent in exactly the table the story exists to protect. It also silently shifts the boundary in the ux-brief's documented 23:00–24:00 Central case.
- **Required remediation**: Make the observation date follow the decided zone deterministically — for example by defining the default in terms of `America/Chicago` rather than the session zone, or by having the migration or the connection path pin the zone — and strengthen the TC-COMP-150 assertion so it fails when the recorded date is the wrong calendar day for a controlled instant, rather than comparing the default against `current_date`. If the owner instead decides UTC governs `observed_on`, record that decision and reconcile `ux-brief.md:400` before closing this finding.

### IR-002 — The static append-only guard does not detect `ON CONFLICT ... DO UPDATE` against observation tables

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-6, DAC-E4-S1-7
- **Tasks**: T002
- **Files**: `tests/unit/test_sql_is_append_only.py:14-22` (`MUTATION_PATTERN`, `prohibited_observation_mutations`)
- **Claim challenged**: T002's claim that the guard fails "when an `UPDATE` or `DELETE` statement targets `instrument_reference`, `daily_bar`, `fundamental_observation`, or `corporate_action`", and TC-COMP-156's claim of codebase-wide enforcement.
- **Observed evidence**: The regex requires the table name to follow `UPDATE ` or `DELETE FROM ` immediately. Executing the shipped `prohibited_observation_mutations` against realistic statements returned no match for `INSERT INTO daily_bar (...) VALUES (...) ON CONFLICT (instrument_id, session_date, value_hash) DO UPDATE SET close_price = EXCLUDED.close_price`, nor for `UPDATE ONLY daily_bar SET volume = 0`, `DELETE FROM ONLY daily_bar WHERE 1=1`, or `DELETE FROM "public"."daily_bar"`. Plain `UPDATE daily_bar` / `DELETE FROM daily_bar` and multi-line forms are matched correctly.
- **Expected evidence/behavior**: `ON CONFLICT ... DO UPDATE SET` updates existing rows of its target table, so it is an `UPDATE` targeting an observation table under DAC-E4-S1-6 and DAC-E4-S1-7. The story Description states the owner deliberately rejected role grants and that this static test "is the cheapest available guard for a constraint the owner deliberately chose not to enforce with grants", making the guard the sole enforcement mechanism.
- **Impact**: This is not a hypothetical form. `src/factorflow/instruments/settings.py:74` already uses `ON CONFLICT ... DO UPDATE SET` for `owner_setting`, so it is this codebase's established upsert idiom, and T003's note that "the follow-on writer must use `INSERT ... ON CONFLICT DO NOTHING`" means the writer story (CAP-001-E4-S3) will be writing precisely this statement shape against these tables. A one-word change from `DO NOTHING` to `DO UPDATE SET` would overwrite point-in-time history, pass the guard, pass the full suite, and destroy data that the story says cannot be recovered.
- **Required remediation**: Extend the pattern so a `DO UPDATE` whose insert targets an observation table is reported, and add `UPDATE ONLY` / `DELETE FROM ONLY` handling; add positive fixtures for each newly covered form (the existing `test_guard_detects_prohibited_observation_mutation` shows the right assertion style) while keeping the `coverage_segment` and `owner_setting`/`acquisition_state` negative cases green.

### IR-003 — T004's required RED and manual-mutation evidence does not exist

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: N/A (task-plan requirement)
- **Tasks**: T004
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1-tasks.md:98`; no evidence artifact in the story directory
- **Claim challenged**: The checked `[x] T004`, which requires "record RED before T003, then GREEN and manual mutation evidence that adding `observed_on` to a unique constraint, removing a `value_hash` length check, or introducing an observation-table `DELETE` makes a named test fail".
- **Observed evidence**: The story directory contains only `CAP-001-E4-S1.md`, `CAP-001-E4-S1-tasks.md` and this report. `find docs -name '*tdd-evidence*'` returns files for CAP-001-E3-S1 through E3-S5 and none for E4-S1. Neither commit message (`64e27ce`, `f554687`) records a RED result, a mutation, or a named failing test. Commit `64e27ce` introduced `test_observation_append.py`, `test_sql_is_append_only.py` and `0002_observations.sql` together, so no RED state exists in history either. The task's "record" deliverable therefore has no corroborating artifact in the repository.
- **Expected evidence/behavior**: T004 states the requirement, its Phase 5 checkpoint requires "RED→GREEN→MUTATE evidence", and every prior story in this capability recorded it as `<story-id>-tdd-evidence.yaml` (for example `CAP-001-E3-S5-tdd-evidence.yaml`, which logs each mutation, the exact command, whether it was caught, and the revert confirmation).
- **Impact**: The mutation-resistance claim the gate depends on was unverifiable from the repository, and a later reviewer or the owner has no record of which mutations were tried or which were not caught. Mitigating context: I reproduced the substance independently — the `observed_on`-in-unique-key and removed-hash-check mutations each break a shipped assertion, and a plain observation-table `DELETE` is caught by the guard's own fixture — so this is an evidence-record gap, not evidence of weak tests. Conversely, had this record existed, the guard blind spot in IR-002 would likely have surfaced during the mutation session.
- **Required remediation**: Produce the story's TDD evidence record in the form the capability already uses, covering the three named mutations with the exact command, observed failure, and revert confirmation for each, and note honestly that the tests and migration were committed together so the original RED is reconstructed rather than observed. Do not re-check T004 until that record exists.

### IR-004 — Deviation from approved design §2.3 is undocumented and unguarded against further drift

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-1
- **Tasks**: T003
- **Files**: `migrations/0002_observations.sql:3,22,43,66`; `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-market-data-store.md:210,229,250,270`; compare `tests/unit/test_migration_0001_matches_design.py`
- **Claim challenged**: That the shipped `0002` matches its approved design, and that the task plan's deviation notes are complete.
- **Observed evidence**: The design's `0002` SQL block declares `observed_on date NOT NULL` on all four tables; the shipped file declares `observed_on date NOT NULL DEFAULT current_date`. Otherwise the two are identical. The task plan's "Resolved Conflicts" section documents only the *story prose* conflict about `observed_on` in the unique key and states "Open Gaps: None"; this design deviation is not recorded. `tests/unit/test_migration_0001_matches_design.py` establishes a verbatim drift guard for `0001` by reading the design's own SQL block, with a docstring explaining that this exists "to catch divergence between the design and what ships"; no equivalent exists for `0002`, and one could not pass today.
- **Expected evidence/behavior**: The deviation itself is justified — DAC-E4-S1-1 requires the default — but the task plan's Notes section is where justified deviations belong, and the repository's own established pattern is a design-drift guard per migration.
- **Impact**: The approved design and the shipped schema now disagree with nothing in CI to detect it, and the next reader of §2.3 will believe `observed_on` has no default. Every subsequent migration inherits a weaker guarantee than `0001` has.
- **Required remediation**: Record the deviation and its AC justification where the task plan records deviations, and either add a `0002`-vs-design drift guard after the design's `0002` block is corrected to include the default, or record why `0002` is exempt from the pattern `0001` follows. Correcting the design document itself is Doc Sync's to perform.

### IR-005 — TC-COMP-297 is traced to a test that asserts only table existence

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-6
- **Tasks**: T001
- **Files**: `tests/integration/test_observation_append.py:79-91`
- **Claim challenged**: The `# Implements TC-COMP-297` comment on `test_all_observation_tables_exist`.
- **Observed evidence**: TC-COMP-297's expected result is "The observation tables MUST carry a natural-key uniqueness constraint including a value hash, so that appending an identical value is a no-op and appending a restated value adds a row"
  (`docs/.../tests/component/all-component-tests.md:6541`). The annotated test queries `information_schema.tables` and asserts the four names exist; it makes no assertion about constraints, columns, or conflict behavior. Deleting every unique constraint from `0002` would leave it green.
- **Expected evidence/behavior**: A mandatory TC-ID's trace comment should sit on a test whose assertions cover that case's expected result, which is the basis on which the coverage matrix marks DAC-E1-6 "Covered".
- **Impact**: Traceability is misleading rather than coverage being absent — `test_identical_refetch_is_noop_and_restatement_coexists` genuinely proves the behavior for all four tables. But the recorded mapping points a future maintainer at a test that cannot fail for the reason TC-COMP-297 exists.
- **Required remediation**: Move the `# Implements TC-COMP-297` comment to the test that asserts the conflict behavior, or add a constraint-shape assertion (for example over `pg_constraint`/`information_schema.table_constraints`, asserting `value_hash` is a key column and `observed_on` is not) to the annotated test.

### IR-006 — `_insert_values()` takes a `table` argument it never uses

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001
- **Files**: `tests/integration/test_observation_append.py:75-76`
- **Claim challenged**: None — code-quality observation.
- **Observed evidence**: `def _insert_values(table: str, instrument_id: int, observed_on: str, value_hash: bytes) -> tuple: return (instrument_id, observed_on, value_hash)`. The `table` parameter is discarded, and every call site passes it. The return annotation is a bare `tuple`.
- **Expected evidence/behavior**: Nearby test helpers in this repository take only what they use; `ruff check` passes because unused *arguments* are not enabled, so nothing else flags it.
- **Impact**: The helper reads as if the tuple shape were table-dependent when all four inserts share one parameter order, which invites a wrong assumption when a fifth table is added.
- **Required remediation**: Drop the unused parameter (or use it), and annotate the concrete tuple type.

### IR-007 — Guard scope is narrower than DAC-E4-S1-7's "anywhere in the codebase"

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-7
- **Tasks**: T002
- **Files**: `tests/unit/test_sql_is_append_only.py:25-29` (`observation_sql_paths`)
- **Claim challenged**: That the guard enforces DAC-E4-S1-7 codebase-wide.
- **Observed evidence**: The guard scans only `migrations/*.sql` and `src/factorflow/**/*.py`. SQL in `scripts/`, `tests/`, or any future non-`src` Python or SQL location is unscanned. It also does not flag `TRUNCATE TABLE <table>`, `DROP TABLE <table>`, or `ALTER TABLE <table> DROP COLUMN`, each of which destroys observation history as effectively as a `DELETE`.
- **Expected evidence/behavior**: DAC-E4-S1-7 and TC-COMP-156 say "anywhere in the codebase". T002 deliberately narrowed this to the two locations where SQL lives today, so the implementation matches its plan.
- **Impact**: Low today — those are the only locations containing SQL, and the migrator only executes files from `migrations/`. It becomes material the first time SQL appears elsewhere.
- **Required remediation**: Optional. Either widen the scan to the repository (excluding this guard's own fixtures) or record in the task plan's Notes why the two-directory scope is sufficient. Consider adding the destructive-DDL forms while addressing IR-002.

### IR-008 — Story's Data Changes section still contradicts the shipped unique constraints

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-6, DAC-E4-S1-2
- **Tasks**: N/A
- **Files**: `docs/.../stories/CAP-001-E4-S1.md:92`; `docs/.../stories/CAP-001-E4-S1-tasks.md:141`
- **Claim challenged**: Internal consistency of the story document against what shipped.
- **Observed evidence**: The story's Data Changes section still specifies "a unique constraint over the natural key plus `observed_on` plus `value_hash`", while the shipped constraints exclude `observed_on`. The story commit in this change set touched only `status` and `updated`.
- **Expected evidence/behavior**: The task plan's "Resolved Conflicts" note already adjudicated this correctly — the acceptance criteria govern, `observed_on` is excluded, and "the story's Data Changes prose should be corrected in its next approved revision" — so this is a known, deliberately deferred item, not a surprise.
- **Impact**: A reader of the approved story would conclude the implementation is wrong. My mutation probe confirms the plan's reasoning is right: with `observed_on` in the key, an identical re-fetch on a later date inserts a duplicate row, violating AC-6.
- **Required remediation**: None for the Coding Agent. Carry to Doc Sync so the story prose is corrected in its next revision, with the task plan's adjudication as the rationale.

### IR-009 — Hash-length test asserts the exception class but not the constraint

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-4
- **Tasks**: T001
- **Files**: `tests/integration/test_observation_append.py:127-143`
- **Claim challenged**: That the test proves the *value-hash length* check rejects 31- and 33-byte inputs.
- **Observed evidence**: The test asserts only `pytest.raises(CheckViolation)`. `fundamental_observation` and `corporate_action` each carry a second CHECK constraint (`fundamental_statement_known`, `corporate_action_type_known`), so the assertion is satisfied by any check violation on those tables. Today the fixture inserts valid `statement_type`/`action_type` values, so only the hash check can fire — I confirmed by removing `daily_bar_hash_len` and observing the 31-byte insert succeed.
- **Expected evidence/behavior**: Precise assertion of the observable outcome, i.e. that the *hash-length* constraint is the one enforcing the boundary.
- **Impact**: A future change to the enum lists or the fixture literals could make the test pass for the wrong reason without anyone noticing.
- **Required remediation**: Assert the raised error's `diag.constraint_name` matches the table's `*_hash_len` constraint.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviation**: `migrations/0002_observations.sql` adds `DEFAULT current_date` to four `observed_on` columns that the approved design declares as plain `NOT NULL`. The addition is required by DAC-E4-S1-1, so the deviation is correct; the failure to record it and the absent design-drift guard are IR-004.
- **Justified deviation**: the natural keys exclude `observed_on`, contradicting the story's Data Changes prose. The task plan adjudicated this explicitly and my probe confirms the acceptance criteria could not be met otherwise. Documented as IR-008 for Doc Sync.
- **Bookkeeping inconsistency**: T004 is checked complete although its evidence-recording half produced no artifact (IR-003). All other checkboxes match the repository.
- **Out-of-scope changes**: none. The change set is three new files plus two frontmatter/checkbox-only documentation edits. The branch's merge of `origin/main` (`cacf59d`) brings in CAP-001-E3-S1 and the static-mount isolation fix; those are `origin/main` history rather than story scope and were excluded from the review set by taking the merge base as the base, while their effect on the suite is accounted for in the full-suite result.
- **Note on the stopped stage**: commit `64e27ce` deliberately preserved an incomplete stage because a pre-existing, unrelated `test_api_static_mount.py` failure blocked the non-Postgres suite. That failure is gone at `HEAD` — `uv run pytest` reports 373 passed — so the stated reason for stopping is resolved and is not carried forward as a finding.

## Follow-Up

- **Next agent**: Coding Agent (rework), then Adversarial Review Agent for a v2 review.
- **Required action**: Resolve IR-001 (pin the zone that computes `observed_on` and make the TC-COMP-150 assertion able to fail), IR-002 (extend the guard to `ON CONFLICT ... DO UPDATE` and the `ONLY` forms, with positive fixtures), and IR-003 (produce the story's RED/GREEN/MUTATE evidence record) before re-review. Address IR-004 and IR-005 in the same pass; IR-006, IR-007 and IR-009 are optional, and IR-008 belongs to Doc Sync. Do not re-check T004 until its evidence record exists.
- **Warnings accepted downstream**: N/A — the verdict is `CHANGES-REQUIRED`.
