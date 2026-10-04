---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: adversarial-review-agent
owner_github: ajodraca
created: 2026-10-04
updated: 2026-10-04
story_id: "CAP-001-E7-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-04T23:17:17Z"
reviewed_head: "0f7e12712525b593d1230de1e2f61ffc0dad9790"
review_base: "9e8bac9f3f5923b47457167002e7dbc33e1132ac"
reviewed_state_revision: "sha256:2f3c07354a4521269d8ac02cd9dcc26e21619ab5fb6bcda65a3748d93a565d3d"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E7-S3
    artifact_version: 1
    content_revision: sha256:0399cb094da1b191dec34b9cd77e27c2ec6946acfab9be740fb74176cbe1320d
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: unknown
  timestamp: "2026-10-04T23:17:17Z"
  source_artifacts:
    - id: CAP-001-E7-S3
      version: "1"
    - id: CAP-001-E7-S3-tasks
      version: "1"
    - id: DEC-0012
      version: "1"
    - id: DEC-0013
      version: "1"
    - id: DEC-0014
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E7-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 6/6 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 13/13 passed |

`GET /api/health` now reports the most recent acquisition run. The read was added to the
run-journal boundary (`queries.get_most_recent_run`, `_MOST_RECENT_RUN_SQL`), the response model
(`MostRecentRun`) was added and `HealthResponse.most_recent_run` widened, the route calls the read
inside the existing connection block and resets the field in the existing `except psycopg.Error`
branch, and the TypeScript mirror was widened. Every acceptance criterion traces to production code
and to at least one test whose assertions I read and whose failure mode I checked; all six mandatory
TC-IDs carry `# Implements` trace comments and pass. The three decisions this story rests on
(DEC-0012, DEC-0013, DEC-0014) exist, are owner-`upheld`, and every behaviour-changing commit carries
the matching `Decision-Id` trailers.

I reran the full constitution validation set independently, including the container-backed
`postgres` suite: `uv run pytest` is 784 passed, `uv run mypy src` and both `ruff` commands are
clean, and the TypeScript type check, Biome lint/format, Vitest suite and both builds pass. I also
independently reproduced the DAC-E7-S3-4 index claim outside the test suite with
`EXPLAIN (ANALYZE)` on 1000 analysed rows: the plan is
`Limit → Incremental Sort → Index Scan using idx_acquisition_run_recent`, 0.013 ms, no `Seq Scan`.

The two findings are LOW and non-blocking: leftover per-test imports that were a RED-phase
collection workaround, and an OpenAPI `required` list that does not state a field the hand-written
TypeScript mirror types as always present (root cause predates this story). Neither affects an
acceptance criterion, a required task, or a required validation command.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E7-S3-run-20261004T220203Z` |
| HEAD | `0f7e12712525b593d1230de1e2f61ffc0dad9790` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E7-integration-20261004T220203Z` → `9e8bac9f3f5923b47457167002e7dbc33e1132ac` (verified merge base of `HEAD`, and an ancestor of it) |
| Working tree | clean — no staged, unstaged, or untracked non-ignored files, before and after validation |
| Changed files reviewed | 11 (8 modified, 3 added), across 11 commits |

The supervised driver named `2c28d53493f43b311defea80a9bbcb95eba1a92e` as the frozen base for this
run. That commit is an ancestor of `HEAD` but the integration branch has since advanced; the
merge base of `HEAD` with the supplied integration ref is `9e8bac9`, which
`pipeline-state.py review-base --base-ref <integration-branch>` resolved and which isolates this
story's change set from the sibling units already integrated. `9e8bac9` is recorded as `review_base`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/runs/queries.py` | modified | DAC-E7-S3-2, DAC-E7-S3-4, AC-18; T010 |
| `src/factorflow/api/models.py` | modified | DAC-E7-S3-3, DAC-E7-8; T011 |
| `src/factorflow/api/routes/health.py` | modified | AC-18, DAC-E7-8, DAC-E7-S3-1, DAC-E7-S3-2; T012 |
| `web/src/api/types.ts` | modified | DAC-E7-S3-3; T013 (DEC-0013) |
| `tests/integration/test_api_health.py` | modified | T002, T003, T004, T005, T009 |
| `tests/integration/test_run_most_recent.py` | added | T006, T014 |
| `tests/unit/test_api_models.py` | modified | T007 |
| `tests/unit/test_health_most_recent_run.py` | added | T008, T014 |
| `docs/.../CAP-001-E7-S3-tasks.md` | modified | Task checkbox bookkeeping only (15 `[ ]` → `[x]`; no requirement text altered — verified by diff) |
| `docs/.../CAP-001-E7-S3-tdd-evidence.yaml` | added | T015 evidence chain |
| `docs/.../CAP-001-E7-S3.md` | modified | Story `status: planning` → `in-review` (one line) |

No production or test file outside this list was touched. No dependency manifest, lockfile,
migration, or configuration file changed — consistent with the plan's "No migration is added".
`web/src/app/status-region.tsx`, its tests and every `most_recent_run: null` fixture are untouched,
as T013 and DEC-0013 require.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-18 | SATISFIED | `src/factorflow/api/routes/health.py:71-105` (`get_health` populates `most_recent_run`); `src/factorflow/runs/queries.py:304-313` | `tests/integration/test_api_health.py:234-261` `test_health_alone_answers_whether_the_most_recent_run_failed` (TC-COMP-018, parametrised both directions); `tests/unit/test_health_most_recent_run.py:78-92` | A single `GET /api/health` answers "did the latest run fail?". The test registers an `httpx` request hook and asserts `requested_paths == ["/api/health"]`, so the answer provably needs no second request, and the `failure-not-sticky` parameter proves a past failure is not reported after a later success. Scope note: the story's AC-18 text is scoped to health being called; the status region's populated outcome line is an owner-flagged backlog gap (see Scope and Plan Deviations). |
| DAC-E7-8 | SATISFIED | `src/factorflow/api/models.py:46` (`most_recent_run: "MostRecentRun | None"`), `:169-180` (`MostRecentRun`); `health.py:105` | `tests/integration/test_api_health.py:176-210` `test_health_reports_the_most_recent_terminal_run` (TC-COMP-090, TC-COMP-073) | The test pins the body's key set to exactly the five health keys and re-asserts the four E1 fields, so the payload is completed rather than replaced. I confirmed the generated OpenAPI `HealthResponse` now `$ref`s `MostRecentRun`. |
| DAC-E7-S3-1 | SATISFIED | `health.py:74` (`most_recent_run: MostRecentRun | None = None`); `queries.py:313` returns `None` on no row | `test_api_health.py:158-173` `test_health_most_recent_run_null_when_no_run_recorded` (TC-COMP-088); `test_run_most_recent.py:134-139`; `test_health_most_recent_run.py:96-105` | The HTTP test asserts `database == "reachable"` and `schema_version == highest migration` beside `most_recent_run is None`, so `null` provably means "no run recorded" and not "unreachable" or "failed". Per-test fresh database (`tests/conftest.py:80-114`) makes the empty-table precondition real, not incidental. |
| DAC-E7-S3-2 | SATISFIED | `queries.py:298-304` — `_MOST_RECENT_RUN_SQL` has no `WHERE` clause and no state filter | `test_api_health.py:213-231` parametrised over `requested`/`running`/`cancelling` (TC-COMP-089); `test_run_most_recent.py:114-131` | Each case seeds an **older terminal `failed`** run plus a **newer non-terminal** run, so a state filter or an `ended_at`-based order would fail the test rather than pass it accidentally. `ended_at is None` is asserted, matching the `acquisition_run_terminal_has_end` DDL. |
| DAC-E7-S3-3 | SATISFIED | `models.py:169-180` — exactly `run_id`, `state`, `ended_at` | `test_api_health.py:206-210` (key set is exactly the three, values equal the seeded run); `tests/unit/test_api_models.py:156-217` | `datetime.fromisoformat(ended_at)` is compared as an aware datetime rather than as a string, so zone rendering is not over-constrained. The unit test asserts `MostRecentRun.model_fields` is exactly the three names, so a fourth field would fail. |
| DAC-E7-S3-4 | SATISFIED | `queries.py:304` — `_LIST_SQL_BASE + _LIST_ORDER + " LIMIT 1"`, served by `idx_acquisition_run_recent` (`migrations/0004_runs.sql:33`) | `tests/integration/test_run_most_recent.py:46-81` (TC-COMP-091) | The test seeds 1000 rows, runs `ANALYZE`, walks the `EXPLAIN (FORMAT JSON)` tree of the **shipped** constant, asserts an index scan on `idx_acquisition_run_recent` and the absence of a `Seq Scan` on `acquisition_run`, and sets no planner GUC. I reproduced the plan independently (see Independent Validation): `Limit → Incremental Sort (Presorted Key: requested_at) → Index Scan using idx_acquisition_run_recent`, actual 0.013 ms. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `CAP-001-E7-S3-tdd-evidence.yaml:14-34` baseline block names every seam and records the four baseline commands green at `base_commit: 9e8bac9` | I re-verified each named seam exists as described: `health.py` probes and `except psycopg.Error`, `queries.py` `RunRow`/`_row_to_run`/`_LIST_SQL_BASE`/`_LIST_ORDER`, `idx_acquisition_run_recent` and both DDL checks, `migrated_run_schema_connection`, and `RunState` in `web/src/api/types.ts`. |
| T002 | complete | VERIFIED | `test_api_health.py:158-173` with `# Implements TC-COMP-088` | Correctly recorded as characterization (green-on-arrival), not a fabricated RED; the assertions are non-vacuous because the fixture migrates the real schema. |
| T003 | complete | VERIFIED | `test_api_health.py:176-210` with `# Implements TC-COMP-090` and `# Implements TC-COMP-073` | Every bullet the task names is asserted, including the exact five-key body. RED-before-GREEN corroborated by commit order: test commit `69fd984` precedes route commit `cd313ab`. |
| T004 | complete | VERIFIED | `test_api_health.py:213-231` | Parametrised over the three non-terminal states as specified. |
| T005 | complete | VERIFIED | `test_api_health.py:234-261` | Both directions covered, each in its own fresh database via parametrisation; the single-request claim is asserted, not assumed. |
| T006 | complete | VERIFIED | `tests/integration/test_run_most_recent.py` (new file, 139 lines) | All four specified cases present: index plan, ties, non-terminal precedence, empty table. The tie test is seeded in **both** insertion orders, so physical row order cannot satisfy it without the `run_id` tie-breaker, and it cross-checks `list_runs(ListFilters(limit=1)).rows[0].run_id`. No collision with E7-S1's `test_run_queries.py`. |
| T007 | complete | VERIFIED | `tests/unit/test_api_models.py:149-217` | All five specified assertions present, including `state` accepting every `get_args(RunState)` value and rejecting `"bogus"`. Pre-existing cases in the file are unchanged (diff is additive apart from three import lines). See IR-001 for the per-test import style. |
| T008 | complete | VERIFIED | `tests/unit/test_health_most_recent_run.py` (new file) | Follows the `_fake_request`/fake-pool pattern; the three specified cases plus a fourth added under T014. The mapping test asserts `model_dump()` equals exactly the three expected values, so mapping `requested_at` or `started_at` into `ended_at` would fail. |
| T009 | complete | VERIFIED | `test_api_health.py:90-118` | `apply_pending(conn, discover(...))` replaces the two synthetic rows; `schema_version` is asserted against `_highest_migration_version()` rather than the literal `2`; every original assertion is kept and `most_recent_run is None` added. `test_health_unreachable_database` and `test_health_most_recent_run_is_null` are byte-identical to the base. |
| T010 | complete | VERIFIED | `queries.py:16-17` (docstring), `:298-313` | Constant and function exactly as planned; the comment cites `idx_acquisition_run_recent`, DAC-E7-S3-4, TC-COMP-091 and the deliberate order reuse (plus DEC-0012). `list_runs`, `get_run_detail`, the cursor helpers and `RunRow` are unchanged — confirmed by diff. |
| T011 | complete | VERIFIED | `models.py:169-180` plus `:46` and the rewritten IR-006 paragraph `:31-39` | Three fields, no more. Justified deviation: the annotation is the string forward reference `"MostRecentRun | None"` resolved by `HealthResponse.model_rebuild()` (`models.py:182`), because the class must sit after `RunState`. The docstring records it, the OpenAPI schema resolves correctly, and `mypy src` is clean. |
| T012 | complete | VERIFIED | `health.py:1-10` (docstring), `:74`, `:80-86`, `:96` | Read placed after `probe_schema_version` inside the existing connection block; `most_recent_run = None` added to the existing `except psycopg.Error` branch; `probe_database_reachable`, its timeout, and the log line untouched. `tests/unit/test_health_route_unreachable.py` is unmodified and green. `state=row.state  # type: ignore[arg-type]` matches the established pattern at `routes/runs.py:153,224` and is bounded by the `acquisition_run_state_known` DDL check. |
| T013 | complete | VERIFIED | `web/src/api/types.ts:11-29`, `:45`, `:221` | `RunSummary` widened to the three snake_case fields, `HealthResponse.most_recent_run` is `RunSummary \| null`, both comments rewritten as specified, `AcquisitionRun`'s "health placeholder" wording corrected. No component, test or fixture changed. `npx tsc --noEmit`, `npm run lint` and `npm run test` all pass. |
| T014 | complete | VERIFIED | `test_run_most_recent.py:88-111` (both tie insertion orders) and `test_health_most_recent_run.py:53-60,128-142` (`_PoolFailingOnRelease`) | I checked each planned mutant against the suite by inspection: `DESC→ASC` and a terminal/`ended_at` filter die on T004/T006; dropping the `run_id` tie-breaker dies on one of the two tie orders; dropping `LIMIT 1` dies on TC-COMP-091 (the plan degenerates to a full sort); hardcoding `None`, omitting the `except`-branch reset, and mapping the wrong timestamp die on the four unit tests; loosening `state` to `str` dies on `test_most_recent_run_rejects_an_unknown_state`. The `_PoolFailingOnRelease` test is the only one that kills the omitted reset, and it is genuinely needed. |
| T015 | complete | VERIFIED | `CAP-001-E7-S3-tdd-evidence.yaml` — 10 cycles, each with `code_review_verdict: APPROVED`, `spec_drift.drift_detected: false`, `tests_executed: true` and a `commit_hash` | I parsed the YAML and matched all 10 `commit_hash` values to the 10 behaviour-bearing commits on the branch in order. The commit sequence corroborates the recorded RED/GREEN ordering: test-only commits (`f7df176`, `69fd984`, `d674772`, `834e10b`, `2c905c3`) precede the production commits (`bfefb98` queries, `cb4771d` models, `cd313ab` route, `32aa449` types). No `REJECTED` or drifting cycle was committed. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_health_alone_answers_whether_the_most_recent_run_failed` / TC-COMP-018 | ADEQUATE | Proves health alone answers AC-18's question in both directions, and that exactly one HTTP request is issued (request hook asserts the path list). Fresh database per parameter. | none |
| `test_health_reports_the_most_recent_terminal_run` / TC-COMP-073, TC-COMP-090 | ADEQUATE | Proves the exact five-key body, the four E1 fields' survival, the exact three-key nested object, and value equality of `run_id`/`state`/`ended_at` against the seeded row. Would fail on any extra or renamed field. | none |
| `test_health_most_recent_run_null_when_no_run_recorded` / TC-COMP-088 | ADEQUATE | Characterization; proves `null` on a *reachable, migrated* store rather than on a failure path, which is the distinction DAC-E7-S3-1 turns on. | none |
| `test_health_reports_a_newer_non_terminal_run` / TC-COMP-089 | ADEQUATE | Seeds an older terminal run as a decoy, so the test cannot pass with a state filter or an `ended_at` order. Covers all three non-terminal states. | none |
| `test_most_recent_run_query_uses_the_recent_index` / TC-COMP-091 | ADEQUATE | Executes the shipped constant, not a copy; walks the JSON plan tree recursively; asserts both the positive (named index) and the negative (`Seq Scan` on the table); changes no planner setting; attaches the plan to the assertion message. I reproduced the plan independently. | none |
| `test_most_recent_run_breaks_ties_like_the_runs_list` / TC-COMP-089 | ADEQUATE | Both insertion orders are parametrised with fixed UUIDs, defeating a pass-by-physical-order; cross-checks agreement with `list_runs(limit=1)`, which is the behaviour DEC-0012 promises. | none |
| `test_most_recent_run_reports_a_newer_requested_run`, `test_most_recent_run_is_none_on_an_empty_table` | ADEQUATE | Direct boundary coverage at the read boundary with no HTTP. | none |
| `test_get_health_maps_the_most_recent_run` | ADEQUATE | Asserts `model_dump()` equals exactly `{run_id, state, ended_at}` of the row, with `requested_at`/`started_at`/`ended_at` all distinct in the fixture, so a wrong-field mapping fails. Stubs only the two reads, not the unit under test. | none |
| `test_get_health_degrades_to_unreachable_when_the_run_read_fails` | ADEQUATE | `psycopg.OperationalError` from the stubbed read; asserts the route does not raise and that all three database-derived fields are null beside `unreachable` (DEC-0014). | none |
| `test_get_health_discards_a_run_read_before_the_connection_failed` | ADEQUATE | A connection that raises on release, with a successful read already in hand — the only test that kills the "omit the `except`-branch reset" mutant. | none |
| `tests/unit/test_api_models.py` additions / T007 | ADEQUATE | Field-set, every-valid-state, invalid-state rejection, `null` serialization presence, and a full `HealthResponse` JSON round-trip including `model_validate_json(...) == model`. | Style only — see IR-001 |
| `test_health_reachable_database` (T009) | ADEQUATE | Precondition now matches production (migrator runs before the API binds, AC-16); all original assertions retained and strengthened from a literal `2` to the discovered highest version. | none |

Isolation and determinism: every `postgres`-marked test receives its own freshly created database
inside the session container (`tests/conftest.py:80-114`), so none of the seeded-run tests can
observe another's rows; all timestamps are fixed constants with explicit `UTC`; no test touches the
network, sleeps, or depends on collection order. The one environment-dependent assertion
(`credential_present`) is compared against `credential_present()` rather than a hardcoded boolean.
Mocks are confined to the two read functions and the reachability probe; the unit under test
(`get_health`) is always the real function.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 784 passed, 2 warnings, 201.45s — full suite including container-backed tests |
| `uv run pytest -m 'not postgres' -q` | same | 0 | PASS | 515 passed, 269 deselected |
| `uv run pytest -m postgres -q` | same | 0 | PASS | 269 passed, 515 deselected, 186.95s (Docker 28.3.2 available; nothing excluded) |
| `uv run pytest -m postgres tests/integration/test_api_health.py tests/integration/test_run_most_recent.py` | same | 0 | PASS | 15 passed — story-specific validation |
| `uv run pytest tests/unit/test_api_models.py tests/unit/test_health_most_recent_run.py tests/unit/test_health_route_unreachable.py tests/unit/test_api_no_secrets.py tests/unit/test_api_isolation.py` | same | 0 | PASS | 27 passed — story-specific plus the no-secrets and isolation guards |
| `uv run ruff check .` | same | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | same | 0 | PASS | 173 files already formatted |
| `uv run mypy src` | same | 0 | PASS | no issues in 47 source files |
| `uv build` | same | 0 | PASS | sdist and wheel built |
| `npx tsc --noEmit` | same (repo root, where `tsconfig`/`package.json` live) | 0 | PASS | clean |
| `npm run lint` | same | 0 | PASS | biome, 75 files, no fixes applied |
| `npm run format` | same | 0 | PASS | biome, 75 files, no fixes applied |
| `npm run test` | same | 0 | PASS | 36 test files, 222 tests passed |
| `npm run build` | same | 0 | PASS | vite build into `src/factorflow/api/static/` |
| `uv sync --all-extras`, `npm ci` | same | N/A | NOT RUN | Install steps. No dependency manifest or lockfile is in the change set, and the resolved environment ran every build, test, lint, format and type-check command above successfully, so reinstalling would add no evidence. |
| `EXPLAIN (ANALYZE, FORMAT TEXT) queries._MOST_RECENT_RUN_SQL` on 1000 analysed rows (reviewer script in `/tmp`, own throwaway container) | same | 0 | PASS | Independent reproduction of the DAC-E7-S3-4 claim: `Limit → Incremental Sort (Sort Key: requested_at DESC, run_id DESC; Presorted Key: requested_at) → Index Scan using idx_acquisition_run_recent`, Execution Time 0.013 ms, no `Seq Scan`. The index is single-column (`requested_at DESC`), so the `run_id` tie-breaker is resolved by an incremental sort over the already-ordered index output and only the first tie group is materialised — the poll is cheap as the AC requires. |

### Validation Side Effects

- Before: `git status --porcelain` empty; `HEAD` `0f7e127`.
- After: `git status --porcelain` empty; `HEAD` `0f7e127`.
- Unexpected tracked-file changes: none. `npm run test` and `npm run build` write into
  `src/factorflow/api/static/` and `uv build` into `dist/`, both ignored; the tracked marker in the
  static directory was left intact. The reviewer's `EXPLAIN` script was written to `/tmp`, outside
  the repository, and its container was removed on exit. No branch, index, or ref was modified.

## Findings

| Finding | Severity | Status | Summary |
|---------|----------|--------|---------|
| IR-001 | LOW | OPEN | Per-test `MostRecentRun` imports in `test_api_models.py` are leftover RED-phase scaffolding, and their comment is now stale |
| IR-002 | LOW | OPEN | `most_recent_run` is absent from the OpenAPI `required` list while the TypeScript mirror types it as always present |

### IR-001 — Per-test imports of `MostRecentRun` are leftover RED-phase scaffolding

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (does not affect DAC-E7-S3-3's coverage)
- **Tasks**: T007
- **Files**: `tests/unit/test_api_models.py:149-217` (six function-local `from factorflow.api.models import MostRecentRun` statements and the comment at `:149-150`)
- **Claim challenged**: that the test file's final form is the one the task plan asks for ("Extend `tests/unit/test_api_models.py`, keeping the existing tests unchanged").
- **Observed evidence**: every new test imports `MostRecentRun` inside its own body, with the comment "`MostRecentRun` is imported per test so the RED for this story's model does not break collection of the tests above". That workaround was necessary only while the model did not exist (commit `834e10b`); since `cb4771d` the symbol has been importable at module scope, where the file imports its other eleven model symbols (`:14-25`).
- **Expected evidence/behavior**: after GREEN, the file follows its own established module-scope import pattern (SKILL review area "dead code, debug artifacts, brittle test hooks"; the plan's TEST-TDD-004 behaviour-preserving refactoring step).
- **Impact**: cosmetic only. The tests pass, assert the same things, and the stale comment misleads a future reader into thinking the per-test import is still load-bearing.
- **Required remediation**: hoist `MostRecentRun` into the existing module-level import block and drop the obsolete comment, or keep the local imports and correct the comment to say why they remain. No assertion needs to change.

### IR-002 — `most_recent_run` is absent from the published OpenAPI `required` list while the TypeScript mirror types it as always present

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (DAC-E7-8 and DAC-E1-S6-3 are both satisfied on the wire)
- **Tasks**: T011, T013
- **Files**: `src/factorflow/api/models.py:46` (`most_recent_run: "MostRecentRun | None" = None`); `web/src/api/types.ts:45` (`most_recent_run: RunSummary | null`)
- **Claim challenged**: that `web/src/api/types.ts` is an exact mirror of the API's published contract (owner-web-app §2.1, and T013's purpose, "keep the interface's type mirror true to the wire").
- **Observed evidence**: the generated schema lists `HealthResponse.required` as `["status", "database", "credential_present", "schema_version"]` — `most_recent_run` is optional because the Pydantic field carries a `= None` default. The runtime body always contains the key (asserted by `test_health_most_recent_run_is_null` and `test_health_reports_the_most_recent_terminal_run`), and the mirror types it as a required property.
- **Expected evidence/behavior**: the schema and the mirror agree, so a client generated from `/openapi.json` sees the same contract the hand-written mirror states.
- **Impact**: low and latent. Behaviour is correct and DAC-E1-S6-3 holds; only a schema-generated client would differ from the mirror by treating the key as possibly absent. The root cause is the `= None` default introduced by CAP-001-E1-S6, not by this story — this story made the field a structured object, which is what makes the discrepancy worth recording.
- **Required remediation**: none within this story's approved scope. Record it for the component design's next revision (ingestion-api §11), or make the field explicitly required in `HealthResponse` in the story that next owns the health contract.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified — forward reference plus `model_rebuild()` (T011).** The plan said to change the
  annotation to `MostRecentRun | None` and place the class after `RunState`. Those two instructions
  conflict at module scope, so the implementation uses the string annotation
  `"MostRecentRun | None"` and calls `HealthResponse.model_rebuild()` after the class
  (`models.py:182`). The docstring records it, `mypy src` is clean, the OpenAPI schema resolves to a
  `$ref`, and three existing tests generate the full schema, so the resolution is covered.
- **Justified — one extra unit test beyond T008's three (`test_get_health_discards_a_run_read_before_the_connection_failed`).**
  Added under T014; it is the only test that kills the "omit the `except`-branch reset" mutant the
  plan names.
- **Bookkeeping — story status moved `planning` → `in-review` in the first commit** (`f7df176`),
  skipping the intermediate `in-progress` state in the lifecycle. The final state is the correct one
  for this gate, the story's governed content revision is unchanged
  (`sha256:0399cb09…`, still matching its approval record), so no finding is raised.
- **No scope leakage found.** Every changed file traces to a planned task. No unrelated refactor,
  debug artifact, dead code, dependency change, migration, or configuration change is present. The
  three decisions this story rests on (DEC-0012 ordering key, DEC-0013 mirror widening, DEC-0014
  degraded response) exist under `projects/factorflow-v2/decisions/`, are `owner_verdict: upheld`,
  and each behaviour-changing commit carries the matching `Decision-Id` trailer.
- **Carried forward, not a defect of this story.** The task plan's "Backlog gap (owner action)"
  stands: `web/src/app/status-region.tsx` still renders the neutral *Most recent run recorded* line
  and does not state the outcome or link to run detail. That rendering is outside this story's
  acceptance criteria (module `ingestion-api`) and outside DEC-0013, which explicitly limits the web
  change to the type. AC-18 is satisfied at the API boundary, which is what this story's AC text
  requires; the owner still needs to place the rendering story (ux-design "Diagnosing a failure",
  TC-E2E-011).

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to documentation synchronisation for CAP-001-E7-S3 with IR-001 and
  IR-002 recorded as accepted warnings. The owner should also note the status-region rendering
  backlog gap above at the next backlog revision.
- **Warnings accepted downstream**: IR-001, IR-002
