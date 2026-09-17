---
artifact_schema_version: 1
artifact_id: CAP-001-E4-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-17
updated: 2026-09-17
story_id: "CAP-001-E4-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-17T22:11:34Z"
reviewed_head: "b55b1598f3ff66a384ca6dbf740c387436bc2a41"
review_base: "eefe8614fe62adcd0c417c7ace266f761e132e95"
reviewed_state_revision: "sha256:802ed437971694e7761943ea4da7de7498bd38a24666eb6e4e82bc23d3eb0f69"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-17T22:11:34Z
  source_artifacts:
    - id: CAP-001-E4-S1
      version: "1"
    - id: CAP-001-E4-S1-tasks
      version: "1"
    - id: CAP-001-E4-S1-implementation-review
      version: "1"
    - id: CAP-001-component-design-market-data-store
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E4-S1 — Version 2

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 5 · **total 6**

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 5 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 4/4 verified |
| Required validation | 7/7 passed |

All three HIGH findings from v1 are resolved, and I proved each resolution from
current repository state rather than accepting the rework claim.

The time-zone defect (v1/IR-001) is genuinely fixed, not papered over. All four
`observed_on` columns now default to
`(CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date`. I ran the expression
against a live `postgres:16` container under four session zones: the Chicago
expression returned `2026-09-17` in every one, while bare `current_date`
returned `2026-09-18` under `Asia/Tokyo` and `Pacific/Kiritimati` — so the old
form was defective exactly as v1 claimed and the new form is
session-`TimeZone`-independent. Inserting a row with a `Pacific/Kiritimati`
session yielded `observed_on = 2026-09-17` with
`observed_on = current_date` evaluating to **false**, which is the discriminating
outcome the previous assertion could not produce. The expression is also
DST-correct: the instant `2026-03-10T04:30Z` maps to Chicago date `2026-03-09`
(UTC would say `2026-03-10`), matching the boundary case
`docs/constitution/standards/ui-conventions.md:216` documents.

The append-only guard (v1/IR-002) now detects every form v1 named. My own probe
of 24 statement shapes against the shipped `prohibited_observation_mutations()`
confirms `ON CONFLICT ... DO UPDATE` (single-line, multi-line and
schema-qualified), `UPDATE ONLY`, `DELETE FROM ONLY`, `"public"."daily_bar"`,
unquoted `public.daily_bar`, CTE-wrapped `UPDATE`/`DELETE`, and aliased `UPDATE`
are all reported, while the design-permitted `coverage_segment` delete, the
`owner_setting` upsert, the `instrument` update, a similarly-named
`daily_bar_archive` and plain `SELECT` are all correctly ignored.

The TDD evidence record (v1/IR-003) now exists and — unusually — is honest
enough to survive verification. I independently reproduced six of its seven
mutations: adding `observed_on` to `daily_bar_natural_key` turns the identical
re-fetch `rowcount` from 0 to 1; removing `daily_bar_hash_len` makes a 31-byte
hash insert succeed; replacing the Chicago default with `current_date` makes the
recorded `column_default` `CURRENT_DATE` and breaks the shipped equality; and
the three guard-regex mutations produce exactly the failure counts the record
claims (1, 2, 1). The record also states plainly that the *original* pre-T003
RED is `reconstructed_not_observed`, which is the honest disclosure v1's
remediation asked for rather than a fabricated RED.

Every required validation command passes and the full suite is 377 passed with
no skip or deselection. The residual findings are one MEDIUM traceability
mis-siting and five LOW items, none of which leaves an acceptance criterion,
required task, or required validation incomplete.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E4-S1` |
| HEAD | `b55b1598f3ff66a384ca6dbf740c387436bc2a41` |
| Review base | `origin/main` merge base `eefe8614fe62adcd0c417c7ace266f761e132e95` |
| Working tree | clean — `git status --porcelain -uall` empty; no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 7 |
| Review timestamp | 2026-09-17T22:11:34Z |

The branch adds two commits since v1 was written: `0fbbff0` (the v1 report
itself) and `b55b159` "CAP-001-E4-S1: rework review findings", which carries the
rework across `0002_observations.sql`, both test files, the task plan, and the
new `CAP-001-E4-S1-tdd-evidence.yaml`.

Base selection: local `main` is `bf3ac30`, which predates `origin/main`
(`eefe861`); the branch already merged `origin/main` at `cacf59d`, so
`git merge-base origin/main HEAD` resolves to the `origin/main` tip.
`eefe861..HEAD` therefore isolates this story's work. I confirmed why the older
local `main` must not be used: `bf3ac30..HEAD` reports 30 changed files,
pulling CAP-001-E3-S1, the Massive client, and `EXP-20260917-1` into apparent
story scope. This matches v1's base and keeps the two reviews comparable.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `migrations/0002_observations.sql` | added | AC-5, AC-6, DAC-E1-6, DAC-E4-1, DAC-E4-2, DAC-E4-S1-1 … DAC-E4-S1-6; T003 |
| `tests/integration/test_observation_append.py` | added | T001 (TC-COMP-005, 006, 135, 136, 150–154, 297) |
| `tests/unit/test_sql_is_append_only.py` | added | T002 (TC-COMP-155, TC-COMP-156) |
| `.../stories/CAP-001-E4-S1-tdd-evidence.yaml` | added | T004 evidence deliverable; remediation of v1/IR-003 |
| `.../stories/CAP-001-E4-S1-tasks.md` | modified | T001–T004 checkboxes, `last_reworked_review`, two Notes entries (v1/IR-004, v1/IR-007); no task text altered |
| `.../stories/CAP-001-E4-S1.md` | modified | `status: planning` → `in-review`, `updated` date; story-coding handoff bookkeeping |
| `.../stories/CAP-001-E4-S1-implementation-review-v1.md` | added | prior review report (this review's own predecessor) |

No production source under `src/factorflow/` was touched, consistent with the
task plan's Phase 4 statement that this schema-only story adds no runtime
integration code. No dependency, configuration, `pyproject.toml`, or `uv.lock`
change appears in the change set, and no unrelated refactor. No scope leakage
found.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-5 | SATISFIED | `migrations/0002_observations.sql:3,22,43,66` (Chicago-pinned `observed_on` default); natural keys at `:15-16,:31-32,:52-53,:73-74` exclude `observed_on` | `test_observation_append.py::test_database_defaults_observed_on_and_keeps_filing_date_descriptive`, `::test_identical_refetch_is_noop_and_restatement_coexists` | Both halves now hold. "Carries the date FactorFlow observed it" is deterministic: my probe shows the default is invariant across `Etc/UTC`, `America/Chicago`, `Asia/Tokyo` and `Pacific/Kiritimati` sessions, and correct across the DST boundary. "Restatement adds a row" is proven for all four tables by the exact two-row `(observed_on, value_hash)` assertion. v1's PARTIAL is cleared. |
| AC-6 | SATISFIED | Unique constraints exclude `observed_on` on all four tables | `::test_identical_refetch_is_noop_and_restatement_coexists` (parametrized ×4) | Reproduced against PostgreSQL 16: `rowcount` 1, then 0 for the identical value re-fetched on a *later* `observed_on`, then 1 for a changed hash; surviving rows are exactly the original plus the restatement. |
| DAC-E1-6 | SATISFIED | `instrument_reference_natural_key`, `daily_bar_natural_key`, `fundamental_natural_key`, `corporate_action_natural_key` each include `value_hash` | `::test_identical_refetch_is_noop_and_restatement_coexists` (now carries the `# Implements TC-COMP-297` comment, `test_observation_append.py:201`) | Matches `component-design-market-data-store.md` §2.3 exactly, including the deliberate hash-only key for `instrument_reference`. v1/IR-005's mis-siting for TC-COMP-297 is fixed. |
| DAC-E4-1 | SATISFIED | `provider_filing_date date` — nullable, absent from every constraint and index; `COMMENT ON COLUMN` at `:56-57` | `::test_database_defaults_observed_on_and_keeps_filing_date_descriptive` asserts the exact comment text and `observed_on != provider_filing_date` with the filing date set to a deliberately distant `2001-02-03` | The column cannot act as an as-of date: I confirmed it appears in no key or index in the shipped DDL. |
| DAC-E4-2 | SATISFIED | The four unique constraints are the conflict arbiters an `ON CONFLICT DO NOTHING` append requires | `::test_identical_refetch_is_noop_and_restatement_coexists` executes real `INSERT ... ON CONFLICT DO NOTHING` against each | No application writer exists in this story by design (task plan Notes, design §2.5 mechanism 1); the schema half is what is testable here, and the guard now also blocks the `DO UPDATE` degradation of that idiom. |
| DAC-E4-S1-1 | SATISFIED | `observed_on date NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date` on all four tables | `::test_database_defaults_observed_on_and_keeps_filing_date_descriptive` asserts the recorded `information_schema.columns.column_default` for all four tables equals the Chicago expression, inside a session explicitly `SET LOCAL TIME ZONE 'Etc/UTC'` | Not provider-derived and no longer session-dependent. The owner decision at `docs/constitution/standards/ui-conventions.md:617,660` ("`observed_on` is computed in it", America/Chicago) is now implemented literally. Mutation-reproduced: reverting to `current_date` makes the recorded default `CURRENT_DATE` and the assertion fails. |
| DAC-E4-S1-2 | SATISFIED | Natural keys exclude `observed_on` | `::test_identical_refetch_is_noop_and_restatement_coexists` asserts `identical_row_count == 0` and the unchanged pre-existing row | Mutation-sensitive: adding `observed_on` to `daily_bar_natural_key` gave `rowcount` 1 in my probe, breaking the assertion. |
| DAC-E4-S1-3 | SATISFIED | A differing `value_hash` falls outside the unique key | Same test's `restated_row_count == 1` plus the exact two-row comparison | Asserts the full resulting row set, not merely counts, so a silent overwrite fails it. |
| DAC-E4-S1-4 | SATISFIED | Four `CHECK (octet_length(value_hash) = 32)` constraints; `bytea NOT NULL` | `::test_value_hash_rejects_non_sha256_lengths` — 4 tables × {31, 33} bytes, now asserting `raised.value.diag.constraint_name` equals the table's `*_hash_len` constraint (`test_observation_append.py:165-171`) | v1/IR-009 fixed. I verified `diag.constraint_name` really is table-specific (`daily_bar_hash_len`, `corporate_action_hash_len`) and that removing `daily_bar_hash_len` lets a 31-byte hash insert succeed. |
| DAC-E4-S1-5 | SATISFIED | `numeric(18, 6)` OHLC, `numeric(20, 4)` volume | `::test_daily_bar_uses_exact_numeric_columns` compares the whole five-column `(data_type, precision, scale)` dictionary by equality | A switch to `double precision` or any precision/scale drift fails it. |
| DAC-E4-S1-6 | SATISFIED | `0002_observations.sql` contains no `UPDATE`, `DELETE`, `BEGIN` or `COMMIT` — confirmed by reading all 77 lines and by `test_migration_filenames.py` (6 passed) | `test_sql_is_append_only.py::test_observation_history_sql_is_append_only` scans every `migrations/*.sql` | The "no later migration may introduce one" half now rests on a guard that catches the `ON CONFLICT DO UPDATE` form v1 showed it missed. Residual destructive-DDL blind spots are IR-004 (LOW). |
| DAC-E4-S1-7 | SATISFIED | No observation query path exists yet; the only `UPDATE`s under `src/factorflow/` target `instrument` and `owner_setting` | `::test_observation_history_sql_is_append_only` (32 paths scanned), `::test_guard_detects_prohibited_observation_mutation` (5 forms), `::test_guard_ignores_mutations_of_non_observation_tables` | The guard's scope is exactly what the approved design mandates: `component-design-market-data-store.md` §2.5 mechanism 2 specifies "every `.sql` file under `migrations/` and every SQL string in `src/factorflow/`". The criterion's "anywhere in the codebase" wording is therefore satisfied as scoped by the approved design, and the task plan now records that scope decision. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/integration/test_observation_append.py` — 5 test functions, 15 collected cases, all `@pytest.mark.postgres`; `# Implements TC-COMP-…` comments for 005, 006, 135, 136, 150, 151, 152, 153, 154, 297 (all 10 listed cases present) | Every enumerated element is implemented: both migrations applied in the fixture, all four tables asserted, the observation-date default, the descriptive filing date, 31/33-byte rejection with constraint-name precision, `numeric` types, and the no-op/coexistence inserts. Deviation: the task text says assert "the database `current_date` default"; the test asserts the Chicago-pinned default instead. That deviation is required by DAC-E4-S1-1 as read through the owner's closed OQ-UI-3 decision, and the task plan's Resolved Conflicts entry (line 143) now records it. The TC-COMP-005 comment placement is IR-001 (MEDIUM). |
| T002 | complete | VERIFIED | `tests/unit/test_sql_is_append_only.py` — `MUTATION_PATTERN` with optional `ONLY` and optional schema qualification, `UPSERT_MUTATION_PATTERN` for `ON CONFLICT ... DO UPDATE`, `observation_sql_paths()` over `migrations/*.sql` + `src/factorflow/**/*.py`, `# Implements TC-COMP-155, TC-COMP-156`, 5 positive fixtures and 1 negative fixture | v1's PARTIAL is cleared. My 24-shape probe confirms every form v1 named is now detected and that all five permitted shapes remain ignored, including the near-miss `daily_bar_archive` (the `(?!\w)` boundary works). Scope is the design-specified two locations and is now documented in the task plan's Other Notes. |
| T003 | complete | VERIFIED | `migrations/0002_observations.sql` (77 lines) | Four tables, `instrument` FKs, Chicago-pinned `observed_on` defaults, `bytea NOT NULL` + four 32-byte checks, natural keys excluding `observed_on`, `numeric(18,6)`/`numeric(20,4)`, the filing-date comment, all four design-specified indexes, and no `UPDATE`/`DELETE`/`BEGIN`/`COMMIT`. Byte-for-byte identical to design §2.3 apart from the four `DEFAULT` clauses and whitespace alignment; that single deviation is now recorded in the task plan (v1/IR-004 remediation). |
| T004 | complete | VERIFIED | `.../CAP-001-E4-S1-tdd-evidence.yaml` (168 lines) plus my own reruns | v1's PARTIAL is cleared. All seven commands pass independently (table below). The evidence record documents the rework RED for each of IR-001/IR-002/IR-003 with commands and observed counts, seven mutations with caught/reverted status, post-mutation reconfirmation, and final validation. I independently reproduced mutations 1, 2, 4, 5, 6 and 7 with the exact outcomes claimed, and mutation 3 (`DELETE FROM daily_bar` in a migration) is confirmed detected by my guard probe. Residual limitation, honestly disclosed by the record itself and unrepairable without rewriting history: the *original* pre-T003 RED was never observed because `64e27ce` committed tests and migration together — IR-003 (LOW). |

Dependencies and phase checkpoints. T001/T002 remain in separate files as
planned. Phase 3's checkpoint holds: applying `0001` then `0002` yields four
queryable tables with every constraint the tests need (15 postgres cases pass,
and my probe created five independent databases from the same DDL). Phase 4's
checkpoint holds: `test_migration_filenames.py` passes 6/6 with `0002` present,
and `tests/integration/test_migrator_refuses.py:53` confirms version 2 is the
highest version this build carries, so discovery, ordering, filename and
transaction-boundary guards all accept the new file. Phase 5's checkpoint now
holds because the RED→GREEN→MUTATE record exists. Checkbox bookkeeping is
consistent: all four tasks are checked and all four are verified, and no
unchecked task appears implemented.

## Test Quality Assessment

Mandatory TC-IDs are graded by whether the story-relevant behavior is genuinely
proven, then separately by whether the recorded trace comment sits on the test
that proves it.

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-005 (AC-5) — covered by `test_identical_refetch_is_noop_and_restatement_coexists` + `test_database_defaults_observed_on_and_keeps_filing_date_descriptive`; comment sits on `test_all_observation_tables_exist` | ADEQUATE (coverage) / mis-traced | Both halves of AC-5 are proven by ADEQUATE tests in the same file: the observation date is asserted against the Chicago expression under a hostile session zone, and restatement-appends is asserted as an exact two-row set for all four tables. | The `# Implements TC-COMP-005` comment (`test_observation_append.py:81`) sits on the table-existence test, which asserts nothing about dates or restatement and would stay green if every unique constraint were deleted. Traceability defect, not a coverage defect — IR-001 (MEDIUM). |
| `test_all_observation_tables_exist` | ADEQUATE for what it asserts | Queries `information_schema.tables` and asserts the sorted set equals the four expected names, so a missing or misnamed table fails. | Structural precondition check only; it should not carry a behavioral TC-ID (IR-001). |
| `test_database_defaults_observed_on_and_keeps_filing_date_descriptive` / TC-COMP-135, TC-COMP-150 | ADEQUATE | Sets the session zone to `Etc/UTC`, inserts without `observed_on`, and asserts (a) the stored date differs from the distant `provider_filing_date`, (b) `observed_on` equals the Chicago-converted date, (c) all four recorded `column_default`s equal the Chicago expression, (d) a controlled instant converts as expected, (e) the exact column-comment text. | v1's tautology is gone. Assertion (c) is the load-bearing one and it is regression-sensitive: my probe shows reverting to `current_date` records `CURRENT_DATE` and fails it. Assertion (d) tests PostgreSQL's own conversion rather than the schema, and (c) pins PostgreSQL's default-rendering string — IR-006 (LOW). |
| `test_value_hash_rejects_non_sha256_lengths` / TC-COMP-153 | ADEQUATE | 4 tables × {31, 33} bytes, each inside `observation_connection.transaction()` so a failed insert cannot poison later cases, asserting the raised `CheckViolation`'s `diag.constraint_name` is the table's `*_hash_len` constraint. | None. v1/IR-009 is fixed and I verified the diagnostic really discriminates: the co-resident `fundamental_statement_known` / `corporate_action_type_known` checks can no longer satisfy the assertion. Removing `daily_bar_hash_len` makes the 31-byte insert succeed. |
| `test_daily_bar_uses_exact_numeric_columns` / TC-COMP-154 | ADEQUATE | Reads `data_type`, `numeric_precision`, `numeric_scale` and compares the whole five-column dictionary by equality. | None. |
| `test_identical_refetch_is_noop_and_restatement_coexists` / TC-COMP-006, 136, 151, 152, 297 | ADEQUATE | Parametrized ×4 tables. Three real `INSERT ... ON CONFLICT DO NOTHING` statements capturing `cursor.rowcount` (1, then 0 for the identical value on a *later* `observed_on`, then 1 for a changed hash), then the exact resulting `(observed_on, value_hash)` row list. | None material. Asserting the final row set — not just counts — is what makes an overwrite detectable. Now correctly carries TC-COMP-297 (v1/IR-005 fixed). |
| `test_observation_history_sql_is_append_only` / TC-COMP-155, TC-COMP-156 | ADEQUATE | Scans 32 paths (`migrations/*.sql` + `src/factorflow/**/*.py`) with both patterns and asserts the violation dictionary is empty; passes today and correctly ignores the `instrument`/`owner_setting` mutations and the design-permitted `coverage_segment` delete. | Blind to `TRUNCATE`, `DROP TABLE`, `ALTER ... DROP COLUMN` and `MERGE ... WHEN MATCHED THEN UPDATE` — IR-004 (LOW). Scope matches design §2.5 mechanism 2. |
| `test_guard_detects_prohibited_observation_mutation` | ADEQUATE | Five parametrized positive fixtures — plain `DELETE`, `UPDATE ONLY`, `DELETE FROM ONLY`, `"public"."daily_bar"`, and `ON CONFLICT ... DO UPDATE` — each asserting the exact matched substring rather than truthiness, so an over-matching regex fails. | No `UPDATE`-form positive fixture beyond `UPDATE ONLY`, and none of the destructive-DDL forms in IR-004. |
| `test_guard_ignores_mutations_of_non_observation_tables` | ADEQUATE | Proves the guard does not fire on `UPDATE acquisition_state`, `DELETE FROM coverage_segment`, or the `owner_setting` `ON CONFLICT DO UPDATE` upsert — the false-positive direction the task plan's Notes call out, and the case the new `UPSERT_MUTATION_PATTERN` most risked breaking. | None. I additionally confirmed `daily_bar_archive` and plain `SELECT` are ignored. |

Isolation and determinism. Every PostgreSQL test takes
`postgres_connection_string`, which creates and drops a uniquely named database
per test inside one session-scoped `postgres:16` container (`tests/conftest.py`),
so the suite is order-independent and leaves no shared state. Insert dates are
literal rather than derived from `date.today()`. The one clock-dependent
assertion is bounded: it compares two expressions evaluated in the same
transaction, so it cannot flake at a midnight boundary. No mock bypasses the
unit under test — these are real-database contract tests, and the static guard
reads real repository files rather than fixtures. I ran the postgres file twice
with identical results (15 passed both times).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m postgres tests/integration/test_observation_append.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `15 passed in 2.46s` |
| `uv run pytest tests/unit/test_sql_is_append_only.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `7 passed in 0.02s` (was 3 at v1; the 4 new cases are the forms v1/IR-002 named) |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `377 passed, 2 warnings in 20.77s`. The two warnings are third-party deprecations from `starlette`/`anyio`, not story code. No test skipped or deselected; the 4-test increase over v1's 373 is exactly the new guard fixtures. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!` |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `104 files already formatted` |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 30 source files` |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` built |
| `uv run pytest tests/unit/test_migration_filenames.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `6 passed` — Phase 4 checkpoint: version 2 discovered after version 1, no filename, transaction-boundary or ordering error |
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | `ai-agents` | 0 | PASS | All eight shared checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1.md --stage adversarial-review` | `ai-agents` | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/point-in-time-acquisition/stories/CAP-001-E4-S1.md` | `ai-agents` | 0 | PASS | `sha256:e6c942a3…` — unchanged from v1, so the approved story revision under review is identical |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | `ai-agents` | 0 | PASS | `sha256:802ed437971694e7761943ea4da7de7498bd38a24666eb6e4e82bc23d3eb0f69` |
| `uv run python /tmp/ff_v2_probe/guard_probe.py` (reviewer-authored, read-only) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 24 statement shapes. DETECTED: plain/aliased/`ONLY`/quoted/qualified `UPDATE` and `DELETE`, CTE-wrapped forms, newline-separated targets, and `ON CONFLICT DO UPDATE` single-line, multi-line and schema-qualified. MISSED: `MERGE … WHEN MATCHED THEN UPDATE`, `TRUNCATE`, `DROP TABLE`, `ALTER … DROP COLUMN`. Correctly ignored: `coverage_segment` delete, `owner_setting` upsert, `instrument` update, `daily_bar_archive`, `SELECT`. |
| `uv run python /tmp/ff_v2_probe/tz_probe.py` (reviewer-authored, read-only) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Container `TimeZone` is `Etc/UTC`. Chicago expression invariant across four session zones (`2026-09-17` in all), bare `current_date` not invariant (`2026-09-18` under Tokyo/Kiritimati). DST instant `2026-03-10T04:30Z` → Chicago `2026-03-09`. Row inserted under a Kiritimati session: `observed_on 2026-09-17`, `= chicago_expr` **true**, `= current_date` **false**. MUT4 (`current_date`) → recorded default `CURRENT_DATE`, assertion fails. MUT1 (`observed_on` in key) → re-fetch `rowcount` 1, assertion fails. MUT2 (drop `daily_bar_hash_len`) → 31-byte hash accepted, assertion fails. Baseline `diag.constraint_name` is table-specific. |
| `uv run python /tmp/ff_v2_probe/guard_mut.py` (reviewer-authored, read-only) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Reproduces tdd-evidence mutations 5/6/7 against in-memory copies of the guard source: baseline 5/5 fixtures pass; `DO UPDATE`→`DO NOTHING` fails 1; removing `ONLY` handling fails 2; removing schema qualification fails 1 — exactly the counts the record claims. |

No required command was skipped. The `npm`/`npx` commands in
`docs/constitution/tech-stack.md` were not run: this change set contains no
TypeScript, frontend or `package.json` change, the task plan's validation
section names only the seven Python commands, and `uv run pytest` already
exercises the static-mount integration tests that depend on frontend build
output. `uv run pytest -m 'not postgres'` was unnecessary because a container
runtime was available and the full suite ran with the postgres marker included.

The three reviewer-authored probes live under `/tmp/ff_v2_probe/` and read the
repository's migration and test files read-only, applying mutations to in-memory
string copies. No repository file was created, modified or deleted by this
review other than this report, and no production or test code was changed.

### Validation Side Effects

- Before: `git status --porcelain -uall` empty at `b55b1598f3ff66a384ca6dbf740c387436bc2a41`.
- After: `git status --porcelain -uall` empty at the same HEAD. `uv build` wrote `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl` and pytest refreshed `__pycache__`; both are covered by `.gitignore` and appear only under `git status --ignored`. Testcontainers started and removed ephemeral `postgres:16` containers, and my probes created and dropped five throwaway databases inside them.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Status | Title | AC / Tasks |
|----|----------|--------|-------|------------|
| IR-001 | MEDIUM | OPEN | TC-COMP-005 traced to a test asserting only table existence | AC-5 / T001 |
| IR-002 | LOW | OPEN | TDD evidence record describes the rework as uncommitted although it is committed at HEAD | N/A / T004 |
| IR-003 | LOW | OPEN | Original pre-T003 RED remains unobservable from history | N/A / T004 |
| IR-004 | LOW | OPEN | Guard does not flag destructive DDL or `MERGE … WHEN MATCHED THEN UPDATE` | DAC-E4-S1-6, DAC-E4-S1-7 / T002 |
| IR-005 | LOW | OPEN | Approved story and task text still specify `DEFAULT current_date` and `observed_on` in the unique key | AC-6, DAC-E4-S1-1, DAC-E4-S1-2 / T001, T003 |
| IR-006 | LOW | OPEN | Default test pins PostgreSQL's `column_default` rendering and asserts one engine-internal conversion | DAC-E4-S1-1 / T001 |

### IR-001 — TC-COMP-005 is traced to a test that asserts only table existence

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-5
- **Tasks**: T001
- **Files**: `tests/integration/test_observation_append.py:81` (`# Implements TC-COMP-005` on `test_all_observation_tables_exist`, lines 83-92)
- **Claim challenged**: The `# Implements TC-COMP-005` trace comment, and by extension the coverage matrix's "Covered" status for AC-5 at `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/coverage-matrix.md:37`.
- **Observed evidence**: TC-COMP-005's expected result is AC-5 verbatim — "Every acquired value MUST be recorded with the date on which it was known, and a run returning a restated value for a date already held MUST add a record rather than replace the existing one" (`tests/component/all-component-tests.md:117-127`). The annotated test queries `information_schema.tables` and asserts the four table names exist. It makes no assertion about `observed_on`, about restatement, or about any constraint; deleting every unique constraint and every `observed_on` default from `0002` would leave it green. This is precisely the defect v1/IR-005 raised for TC-COMP-297: the rework moved the TC-COMP-297 comment to `test_identical_refetch_is_noop_and_restatement_coexists` (line 201) but left the structurally identical TC-COMP-005 mis-siting in place at line 81.
- **Expected evidence/behavior**: A mandatory TC-ID's trace comment should sit on a test whose assertions cover that case's expected result, which is the basis on which the coverage matrix records AC-5 as Covered.
- **Impact**: Traceability is misleading rather than coverage being absent. AC-5's behavior *is* genuinely proven, by `test_identical_refetch_is_noop_and_restatement_coexists` (restatement appends, exact two-row set, all four tables) and `test_database_defaults_observed_on_and_keeps_filing_date_descriptive` (the observation date) — both ADEQUATE and both carrying their own mandatory TC-IDs, which is why this is MEDIUM rather than a WEAK mandatory test. The cost is that a future maintainer following the recorded mapping for the capability's most consequential AC is pointed at a test that cannot fail for the reason TC-COMP-005 exists.
- **Required remediation**: Move the `# Implements TC-COMP-005` comment onto the test(s) whose assertions cover its expected result — the same fix already applied to TC-COMP-297 — leaving `test_all_observation_tables_exist` as an untraced structural precondition check, or add it to both behavioral tests.

### IR-002 — The TDD evidence record describes the rework as uncommitted although it is committed at HEAD

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (evidence accuracy)
- **Tasks**: T004
- **Files**: `docs/.../stories/CAP-001-E4-S1-tdd-evidence.yaml:11-12`, `:61`, `:63`
- **Claim challenged**: The record's own statements that "all rework below is recorded against the uncommitted working tree on usr/alvaro-de-jodra/CAP-001-E4-S1", `commit_hash: uncommitted_by_user_direction`, and `manual_mutations_baseline: uncommitted GREEN review-rework tree`.
- **Observed evidence**: `git status --porcelain -uall` is empty and `git show --stat b55b159` shows that commit ("CAP-001-E4-S1: rework review findings") contains all five reworked files — `0002_observations.sql`, both test files, the task plan, and this evidence file itself. The evidence artifact therefore states it describes an uncommitted tree while being committed together with the very changes it describes.
- **Expected evidence/behavior**: Constraint 11 of the review contract and the capability's own precedent (`CAP-001-E3-S5-tdd-evidence.yaml` records a concrete commit) require the evidence record to identify the state it was produced against accurately.
- **Impact**: Low. The described state and the committed state are byte-identical — I verified the substance of six of the seven mutations against `b55b159` itself — so nothing is misrepresented about the code. But a reader reconciling the record with history is told to look for uncommitted work that does not exist, and the baseline the mutations were measured from is not pinned to a SHA.
- **Required remediation**: Optional. When the record is next touched, replace `uncommitted_by_user_direction` and the "uncommitted working tree" prose with the actual baseline SHA `b55b1598f3ff66a384ca6dbf740c387436bc2a41`.

### IR-003 — The original pre-T003 RED remains unobservable from history

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (task-plan requirement)
- **Tasks**: T004
- **Files**: `docs/.../stories/CAP-001-E4-S1-tdd-evidence.yaml:14-20`; commit `64e27ce`
- **Claim challenged**: T004's requirement to "record RED before T003".
- **Observed evidence**: `git show --stat 64e27ce` confirms `test_observation_append.py`, `test_sql_is_append_only.py` and `migrations/0002_observations.sql` entered the branch in one commit, so no repository state exists in which the tests ran without the migration. The evidence record does not claim otherwise: it states `status: reconstructed_not_observed` and "This record does not claim that the original RED was observed."
- **Expected evidence/behavior**: v1/IR-003's remediation specified exactly this outcome — produce the record and "note honestly that the tests and migration were committed together so the original RED is reconstructed rather than observed." That bar is met.
- **Impact**: Low and unrepairable without rewriting branch history, which the review contract forbids and which would destroy the audit trail this finding is about. The mitigating evidence is strong and current: a fresh RED *was* observed for the rework cycle (three findings, with commands and counts), and I independently reproduced the mutation-resistance of the shipped tests for all three mutations T004 names plus three more. The substance T004 exists to establish is therefore proven; only the original chronology is not.
- **Required remediation**: None. Recorded so the gap is durable and visible rather than silently closed, and so a future story in this capability commits tests before implementation.

### IR-004 — Guard does not flag destructive DDL or `MERGE … WHEN MATCHED THEN UPDATE`

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-6, DAC-E4-S1-7
- **Tasks**: T002
- **Files**: `tests/unit/test_sql_is_append_only.py:17-26` (`MUTATION_PATTERN`, `UPSERT_MUTATION_PATTERN`)
- **Claim challenged**: That the guard covers every way observation history can be destroyed.
- **Observed evidence**: My probe shows `TRUNCATE TABLE daily_bar`, `DROP TABLE daily_bar`, `ALTER TABLE daily_bar DROP COLUMN close_price` and `MERGE INTO daily_bar … WHEN MATCHED THEN UPDATE SET volume = s.volume` all return no match. Each destroys or rewrites observation history as effectively as a `DELETE`, and `MERGE` is available in PostgreSQL 15+. A separate, narrower artifact of the `[^;]` bound is that an `INSERT` and a later `ON CONFLICT DO UPDATE` separated by a statement terminator are not linked, which is correct behavior rather than a gap.
- **Expected evidence/behavior**: The approved design bounds the guard deliberately: `component-design-market-data-store.md` §2.5 mechanism 2 specifies scanning for "`UPDATE` or `DELETE` naming" the four tables, and T002 repeats that wording. The implementation matches its design, so this is a hardening opportunity and not a requirement violation — which is why DAC-E4-S1-6 and DAC-E4-S1-7 are graded SATISFIED.
- **Impact**: Low today. The migrator executes only files under `migrations/`, every existing migration is clean, and a destructive DDL migration would be a far more visible act than a one-word `DO NOTHING` → `DO UPDATE` edit (which is now caught). It becomes material the first time a data-fix migration is written.
- **Required remediation**: Optional. Either add `TRUNCATE`, `DROP TABLE`, `ALTER … DROP COLUMN` and `MERGE … WHEN MATCHED THEN UPDATE` to the pattern with positive fixtures in the existing exact-substring style, or record in the task plan's Notes why the `UPDATE`/`DELETE`-only scope the design specifies is sufficient. Carried forward from v1/IR-007.

### IR-005 — Approved story and task text still specify `DEFAULT current_date` and `observed_on` in the unique key

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-6, DAC-E4-S1-1, DAC-E4-S1-2
- **Tasks**: T001, T003 (documentation only)
- **Files**: `docs/.../stories/CAP-001-E4-S1.md:90`, `:92`; `docs/.../stories/CAP-001-E4-S1-tasks.md:70`, `:81`; `docs/.../design/component-design-market-data-store.md:210,229,250,270`
- **Claim challenged**: Internal consistency of the approved documents against what shipped.
- **Observed evidence**: The story's Data Changes section still specifies `observed_on date NOT NULL DEFAULT current_date` and "a unique constraint over the natural key plus `observed_on` plus `value_hash`"; the shipped DDL uses the Chicago-pinned default and excludes `observed_on` from every key. T001's and T003's task text likewise still say `current_date`. The design's `0002` block still declares `observed_on date NOT NULL` with no default. The task plan's Resolved Conflicts section (lines 142-143) now adjudicates both deviations explicitly, including the AC and owner-decision basis and the reason a verbatim `0002`-vs-design drift guard is deferred — which is what v1/IR-004 required.
- **Expected evidence/behavior**: The implementation is correct: AC-6 and DAC-E4-S1-2 cannot both hold with `observed_on` in the idempotence key (my probe: an identical re-fetch on a later date inserts a duplicate row), and DAC-E4-S1-1 read through the closed OQ-UI-3 decision requires the named zone. The documents are what need to catch up.
- **Impact**: Low but persistent. A reader of the approved story or of design §2.3 would conclude the shipped schema is wrong, and there is no CI drift guard for `0002` comparable to `tests/unit/test_migration_0001_matches_design.py`. The task plan's deferral rationale is sound — pinning the current mismatch in a test would preserve drift rather than detect it.
- **Required remediation**: None for the Coding Agent. Carry to Doc Sync: correct the story's Data Changes prose and the design's `0002` block, then add the `0002`-vs-design drift guard that the task plan's Notes defer to that point. Carried forward from v1/IR-008 and widened to cover the default expression and the design block.

### IR-006 — Default test pins PostgreSQL's `column_default` rendering and asserts one engine-internal conversion

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S1-1
- **Tasks**: T001
- **Files**: `tests/integration/test_observation_append.py:122-125`, `:137-142`
- **Claim challenged**: None of substance — test-strength and maintainability observation on an otherwise strong assertion.
- **Observed evidence**: The load-bearing assertion compares `information_schema.columns.column_default` against the literal string `"((CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago'::text))::date"`. That string is PostgreSQL's own normalisation of the expression — note the parentheses and the `::text` cast the migration does not write — so a PostgreSQL major-version change to expression deparsing would fail the test without any schema defect. Separately, `assert str(controlled_chicago_date[0]) == "2026-03-09"` asserts only that PostgreSQL converts `2026-03-10T04:30Z` to the Chicago calendar date; it exercises the engine's `tzdata`, not the migration, and would pass even if `observed_on` had no default at all.
- **Expected evidence/behavior**: Assertions should validate the unit under test's observable outcomes. The remaining assertions in this test do exactly that, and I confirmed the `column_default` equality is regression-sensitive to the real defect (reverting to `current_date` fails it), so the test is ADEQUATE overall.
- **Impact**: Low. Risk is a false failure on a future PostgreSQL upgrade rather than a missed defect, plus one assertion that cannot fail for a reason under this story's control.
- **Required remediation**: Optional. Consider asserting the default's *behavior* under a controlled session zone — for example that the inserted `observed_on` equals `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date` and differs from `current_date` when the session zone is set east of Chicago, which is the discriminating observation my probe made — in place of or alongside the rendered-string equality, and drop the engine-only conversion assertion.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — `observed_on DEFAULT current_date` is session-time-zone dependent (HIGH) | RESOLVED | `migrations/0002_observations.sql:3,22,43,66` now use `DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date`. My probe (`/tmp/ff_v2_probe/tz_probe.py`) shows the expression returns `2026-09-17` under `Etc/UTC`, `America/Chicago`, `Asia/Tokyo` and `Pacific/Kiritimati` while bare `current_date` returns `2026-09-18` under the latter two; a row inserted in a `Pacific/Kiritimati` session recorded the Chicago date with `observed_on = current_date` false. DST-correct (`2026-03-10T04:30Z` → `2026-03-09`). The mapped test is no longer a tautology: it asserts all four recorded `column_default`s equal the Chicago expression, and reverting to `current_date` records `CURRENT_DATE` and fails it. |
| v1/IR-002 — Guard misses `ON CONFLICT … DO UPDATE` (HIGH) | RESOLVED | `tests/unit/test_sql_is_append_only.py:22-26` adds `UPSERT_MUTATION_PATTERN`, and `MUTATION_PATTERN` (`:17-21`) gains optional `ONLY` and optional quoted/unquoted schema qualification. My 24-shape probe confirms every form v1 named is detected — including multi-line and schema-qualified `DO UPDATE` — while all five permitted shapes stay ignored. Five positive fixtures (`:53-78`) assert exact matched substrings. Residual destructive-DDL forms are re-raised as IR-004 (LOW). |
| v1/IR-003 — T004's RED and mutation evidence does not exist (HIGH) | RESOLVED with a documented limitation | `CAP-001-E4-S1-tdd-evidence.yaml` (168 lines) now records the rework RED per finding with commands and counts, seven mutations with caught/reverted status, post-mutation reconfirmation, and final validation. I independently reproduced mutations 1, 2, 4, 5, 6, 7 with the exact claimed outcomes and confirmed 3 via the guard probe — the record is honest, not decorative. The original pre-T003 RED is explicitly `reconstructed_not_observed`, which is the disclosure v1's remediation specified; that residual is re-recorded as IR-003 (LOW) and the record's own commit-state prose as IR-002 (LOW). |
| v1/IR-004 — Design §2.3 deviation undocumented and unguarded (MEDIUM) | RESOLVED | `CAP-001-E4-S1-tasks.md:143` now records the deviation, its DAC-E4-S1-1 and owner-decision basis, the exact expression used, and why a verbatim `0002`-vs-design drift guard is deferred until Doc Sync corrects the design block ("pinning the known mismatch in a test would preserve rather than detect drift"). That is the second of the two remediation options v1 offered. The still-uncorrected design and story prose are carried to Doc Sync as IR-005 (LOW). |
| v1/IR-005 — TC-COMP-297 traced to a table-existence test (MEDIUM) | RESOLVED | The `# Implements TC-COMP-297` comment now sits at `tests/integration/test_observation_append.py:201`, on `test_identical_refetch_is_noop_and_restatement_coexists`, whose assertions cover TC-COMP-297's expected result for all four tables. The structurally identical mis-siting for TC-COMP-005 was not fixed and is raised as IR-001 (MEDIUM). |
| v1/IR-006 — `_insert_values()` takes an unused `table` argument (LOW) | RESOLVED | `tests/integration/test_observation_append.py:75-78` is now `_insert_values(instrument_id: int, observed_on: str, value_hash: bytes) -> tuple[int, str, bytes]`; the unused parameter is gone, the return type is concrete, and all call sites updated. `uv run mypy src` and the suite pass. |
| v1/IR-007 — Guard scope narrower than "anywhere in the codebase" (LOW) | RESOLVED as scoped; residual re-raised | `CAP-001-E4-S1-tasks.md:152` now records why the scan covers `migrations/*.sql` and `src/factorflow/**/*.py` only, that test fixtures must not be scanned, and that a new executable-SQL location must be added to `observation_sql_paths()` in the same change — the second remediation option v1 offered. I confirmed this scope is exactly what approved design §2.5 mechanism 2 mandates. The destructive-DDL half of v1/IR-007 is re-raised as IR-004 (LOW). |
| v1/IR-008 — Story Data Changes prose contradicts the shipped constraints (LOW) | STILL OPEN — Doc Sync | `CAP-001-E4-S1.md:92` still says "a unique constraint over the natural key plus `observed_on` plus `value_hash`", and `:90` still says `DEFAULT current_date`. v1 assigned this to Doc Sync, not to the Coding Agent, and story-coding may not edit an approved story. Re-recorded and widened as IR-005 (LOW). |
| v1/IR-009 — Hash-length test asserts the exception class only (LOW) | RESOLVED | `tests/integration/test_observation_append.py:165-171` now asserts `raised.value.diag.constraint_name` equals the table's `*_hash_len` constraint. I verified the diagnostic discriminates correctly (`daily_bar_hash_len`, `corporate_action_hash_len`), so the co-resident `fundamental_statement_known` / `corporate_action_type_known` checks can no longer satisfy the assertion. |

Seven of nine v1 findings are resolved with current repository evidence, one is
resolved with a documented, unrepairable limitation, and one remains open by
v1's own routing to Doc Sync. No v1 finding was closed on the basis of the
rework claim alone.

## Scope and Plan Deviations

- **Justified deviation**: `migrations/0002_observations.sql` adds a Chicago-pinned `DEFAULT` to four `observed_on` columns that approved design §2.3 declares as plain `NOT NULL`. Required by DAC-E4-S1-1 as read through the owner's closed OQ-UI-3 decision (`docs/constitution/standards/ui-conventions.md:617,660`), and now recorded in the task plan's Resolved Conflicts.
- **Justified deviation**: the natural keys exclude `observed_on`, contradicting the story's Data Changes prose. The task plan adjudicated this and my probe confirms the acceptance criteria could not otherwise be met (an identical re-fetch on a later date inserts a duplicate). Carried to Doc Sync as IR-005.
- **Justified deviation**: T001's and T003's task text still say `current_date` while the tests and migration implement the Chicago expression. The task plan's Resolved Conflicts entry governs and the acceptance criteria require the deviation; the unedited task sentences are part of IR-005.
- **Bookkeeping**: all four task checkboxes are checked and all four are independently verified. No unchecked task appears implemented. The task plan's `last_reworked_review` correctly names `CAP-001-E4-S1-implementation-review-v1.md`.
- **Out-of-scope changes**: none. The change set is four new files (migration, two tests, TDD evidence) plus the v1 report and two documentation edits confined to frontmatter, checkboxes and Notes. `pyproject.toml`, `uv.lock` and everything under `src/factorflow/` are untouched relative to the review base.
- **Base-selection note**: the branch's merge of `origin/main` (`cacf59d`) brings in CAP-001-E3-S1 and the static-mount isolation change; those are `origin/main` history rather than story scope and are excluded by taking the merge base as the base, while their effect on the suite is accounted for in the 377-passed full-suite result.

## Follow-Up

- **Next agent**: Doc Sync Agent, with this report and the task file.
- **Required action**: Proceed to Doc Sync. Correct the story's Data Changes prose and design §2.3's `0002` block per IR-005, then add the deferred `0002`-vs-design drift guard the task plan's Notes make conditional on that correction. IR-001 should be fixed in the same pass since it is a one-line comment move; IR-002, IR-003, IR-004 and IR-006 are non-blocking and may be deferred or accepted as-is.
- **Warnings accepted downstream**: IR-001 (MEDIUM); IR-002, IR-003, IR-004, IR-005, IR-006 (LOW).
