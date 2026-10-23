---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-23
updated: 2026-10-23
story_id: "CAP-002-E1-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-23T18:45:58Z"
reviewed_head: "b237ee80a83032baf7d29a3f09240b12533b65f0"
review_base: "f1bee9c7927981e5da4e35588b5fbb69c7cb3be7"
reviewed_state_revision: "sha256:115c491e2ca9431ad229b8dd1ce72d30ef380f8fee38d92a9ab9a7e47c142725"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S3
    artifact_version: 1
    content_revision: sha256:458756aaab924bfa05dd45c4cd6aa08618ae397eb3c24575171b0ce0f30f6ea5
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-23T19:05:16Z
  source_artifacts:
    - id: CAP-002-E1-S3
      version: "1 (sha256:458756aaab924bfa05dd45c4cd6aa08618ae397eb3c24575171b0ce0f30f6ea5)"
    - id: CAP-002-E1-S3-tasks
      version: "1 (sha256:e9d5c4b49a7ff82c2b60994437ceb7042423983920026897eb73862d927fde66)"
    - id: CAP-002-E1-S3-tdd-evidence
      version: "1 (cycles 1 to 5)"
    - id: CAP-002-E1-S3-implementation-review
      version: "1 (INCONCLUSIVE)"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-universe-service-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "5"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 17/17 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 9/9 passed |

This is an attended review that the owner requested. The owner authorized running the Docker
commands outside the sandbox, so the evidence gap that made v1 INCONCLUSIVE is closed:

- `uv run pytest -m postgres` ran: 359 passed, the story's 32 among them.
- The full `uv run pytest` ran: 1307 passed.
- The story's own suites ran under PostgreSQL 16 through `testcontainers`. This covers
  `tests/integration/test_universe_create.py` and the `slow` volume test.

The code under review is the same as in v1. HEAD differs from v1's `reviewed_head` only by the
v1 report, and the `code-revision` fingerprint is unchanged.

Every acceptance criterion is satisfied, with passing tests that assert observable outcomes.
Every task is verified. Every required command passes, and the TDD-evidence lint is clean.

The review mutation run used 48 mutants over both changed production files: 22 from the
catalogue and 26 written by the reviewer. Run against the focused unit and `postgres` suites,
41 were killed and 7 survived:

- Three survivors are equivalent: two change a digit in a SQL comment, and one changes
  `SELECT 1` inside `EXISTS`.
- Four survivors are not equivalent. A reviewer probe ran each one against a real database and
  showed a different result from the committed code. These four survivors are the basis of
  the two MEDIUM findings.

No mandatory TC's Expected Result depends on them, so they reduce test strength but do not
block the gate:

- **IR-001 (MEDIUM, carried from v1, now confirmed by a run).** No test pins the order of
  `create_by_hand`'s refusals (design 2.4). Mutants ir-01 and ir-02 survive.
- **IR-003 (MEDIUM, new).** No test shows that a write rolls back its own events. The
  mid-write failure test calls `conn.rollback()` before it asserts, so it passes even without
  `with conn.transaction()` (design 2.3, design section 8 criterion 10). Mutants ir-07 and
  ir-08 survive.
- **IR-002 (LOW, carried from v1).** `__all__` still omits the five public operations.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S3-run-20261023T035034Z` |
| HEAD | `b237ee80a83032baf7d29a3f09240b12533b65f0`. Two commits over the base: `8d02826` story-coding and `b237ee8` the v1 review. |
| Review base | `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z`. `pipeline-state.py review-base --base-ref` resolves it to `f1bee9c7927981e5da4e35588b5fbb69c7cb3be7`, and `git merge-base --is-ancestor f1bee9c HEAD` exits 0. |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` is empty) |
| Changed files reviewed | 23 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/service.py` | added | AC-1, AC-3, AC-5, AC-15, DAC-E1-1/-4/-5/-6/-9, DAC-E1-S3-1 to -8; T013 |
| `src/factorflow/universes/sql/coverage_check.sql` | added | AC-1, DAC-E1-1, DAC-E1-S3-1; T012 |
| `tests/integration/test_universe_create.py` | added | TC-COMP-001, -002, -019, -023, -024, -035, -118; T002 to T008, T011 |
| `tests/integration/test_universe_volume.py` | added | TC-COMP-003, DAC-E1-S3-8; T009 |
| `tests/unit/test_universe_service_validation.py` | added | T010 |
| `docs/.../stories/CAP-002-E1-S3-tasks.md` | modified | Checkboxes only. Turning `[x]` back to `[ ]` reproduces the base file byte for byte. T001 to T016. |
| `docs/.../stories/CAP-002-E1-S3.md` | modified | `status: planning` to `in-review` only, which is byte-verified. `artifact-gate.py revision` still equals the approved `reviewed_revision`. |
| `docs/.../stories/CAP-002-E1-S3-tdd-evidence.yaml` | added | T016 |
| `docs/.../stories/CAP-002-E1-S3-evidence/cycle-1.patch` to `cycle-5.patch` (5 files) | added | T016 `reviewed_patch` per cycle |
| `docs/.../stories/CAP-002-E1-S3-evidence/red-cycle-*.log` (5 files) | added | T016 RED evidence (`--require-logs`) |
| `docs/.../stories/CAP-002-E1-S3-evidence/mutation-cycle-1-results.json` to `-4-results.json` (4 files) | added | T016 mutation evidence |
| `docs/.../stories/CAP-002-E1-S3-implementation-review-v1.md` | added | The preceding adversarial-review report (`b237ee8`) |

## Acceptance Criteria Verification

Every row was rerun in this review: `test_universe_create.py` (31 tests) and
`test_universe_volume.py` (1 test) pass under `-m postgres`.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `service.py:192-222` `create_by_hand`; `:151-156` `_uncovered`; `sql/coverage_check.sql` | `test_universe_create.py:141`, `:221`, `:722` | Members come only from covered stocks. An uncovered stock refuses the whole request. |
| AC-3 | SATISFIED | `create_by_hand` makes no check across universes | `:181`, `:706` | Two universes share `MSFT`. Removing a shared stock from one leaves the other unchanged. |
| AC-5 | SATISFIED (story scope) | `service.py:208-209` `EmptyUniverse` | `:251` | Create half. The last-member half belongs to `remove_member` (CAP-002-E1-S4, story Description). |
| AC-15 | SATISFIED (membership side) | `coverage_check.sql` never reads lifecycle; the service never consults lifecycle | `:535`, `:556`, `:571` | A covered retired symbol is accepted and stays a member after its instrument retires. An uncovered retired symbol is refused. |
| DAC-E1-1 | SATISFIED | `service.py:203-205`, `:247-249`; `InstrumentNotAcquired` `:87-92` | `:221`, `:722`, `:590` | Every uncovered symbol is named, sorted. Counts and events are unchanged after `rollback`, for both create and add. |
| DAC-E1-4 | SATISFIED (create half) | `service.py:136-148` `_name_in_use` over `replay.list_universe_rows("active", ...)`, exact equality | `:281`, `:300`, `:314`, `:343` | Clash after trimming, exact comparison, retired name reusable, replayed rename decides, clash found on a later page. Rename is S4's. |
| DAC-E1-5 | SATISFIED | `service.py:200` lock first; `:52` `pg_advisory_xact_lock` | `:449`, `:492` | B is seen waiting in `pg_locks` and then refused. Every one of the 20 barrier rounds has exactly one success. Killed ir-03 (lock after the name check). |
| DAC-E1-6 | SATISFIED | `service.py:251-261` | `:360`, `:386`, `:404` | `already_member` is returned with no event, and no empty `executemany` is issued. Killed ir-19 and ir-26. |
| DAC-E1-9 | SATISFIED | As AC-15 | `:535`, `:556` | `lifecycle == "retired"` replays, and a re-add returns `already_member`. |
| DAC-E1-S3-1 | SATISFIED | As DAC-E1-1 | `:221`, `:238`, `:722`, `:590` | Lower-case input is normalised. The SQL half returns each uncovered symbol once. Killed ir-21, ir-22, ir-24 and ir-25. |
| DAC-E1-S3-2 | SATISFIED | `service.py:208-209` | `:251`, `:267` | Nothing is written. The same name is reusable afterwards. Blank strings raise `ValueError`, not `EmptyUniverse`. |
| DAC-E1-S3-3 | SATISFIED | `service.py:214-222` one list, one `executemany` | `:141` | The spy sees exactly 1 call of 4 rows, and `member_since` equals each `recorded_at`. Killed ir-20 (one execute per event). |
| DAC-E1-S3-4 | SATISFIED (create half) | As DAC-E1-4 | `:281`, `:300`, `:314` | The rename half is S4's (task plan Resolved Conflicts). |
| DAC-E1-S3-5 | SATISFIED | As DAC-E1-5 | `:449`, `:492` | Also killed ir-05 and ir-06, through S2's pinned lock statement. |
| DAC-E1-S3-6 | SATISFIED | As DAC-E1-6 | `:360` | Returns `(["CCC"], ["AAA", "BBB"])`, and the event count rises by exactly 1. |
| DAC-E1-S3-7 | SATISFIED | As AC-15 | `:535` | The returned and the replayed `RRR` both have `lifecycle == "retired"`. |
| DAC-E1-S3-8 | SATISFIED | `create_by_hand` plus two `add_members` calls of 1000 | `test_universe_volume.py:40` | Passed in 2.1 s (`-m 'postgres and slow'`). Correctness only, since no elapsed-time bound is stated (task plan Open Gaps). |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `f1bee9c`: `0005_universes.sql`, `replay.py` with `Member`, `Origin`, `Universe`, `UniverseEvent`, `UniverseRow(universe_id, name, lifecycle, created_at, retired_at)`, `current_state`, `membership_as_of`, `list_events`, `list_universe_rows`; the four S2 `.sql` files; the `universes/sql/*.sql` package-data glob | Verification only; no file changed. |
| T002 | complete | VERIFIED | `test_universe_create.py:141`, `:181` | All planned assertions are present and pass. |
| T003 | complete | VERIFIED | `:221`, `:238`, `:722` | Cases (a) to (c), with the counts checked after `rollback`. |
| T004 | complete | VERIFIED | `:251`, `:267` | Includes the follow-up create of `"U"` and the blank-strings `ValueError`. |
| T005 | complete | VERIFIED | `:281`, `:300`, `:314` | As planned. |
| T006 | complete | VERIFIED | `:360`, `:386`, `:404`, `:449`, `:492` | TC-COMP-024 (all three cases) and TC-COMP-019 (both forms). Thread exceptions are captured, and connections close in `finally`. |
| T007 | complete | VERIFIED | `:535`, `:556`, `:571` | Cases (a) to (d). |
| T008 | complete | VERIFIED | `:590` | Exactly the uncovered set, nothing for `[]`, and a symbol with two segments is not reported. |
| T009 | complete | VERIFIED | `test_universe_volume.py:25-83` | `generate_series` seeding, three calls, 3000 members in order, 1 + 3000 events, an idempotent second pass, and the as-of reads. |
| T010 | complete | VERIFIED | `tests/unit/test_universe_service_validation.py` (36 tests) | Cases (a) to (f). See IR-002 on `__all__`. |
| T011 | complete | VERIFIED | `:611`, `:623`, `:195`, `:636`, `:652`, `:691`, `:706`; also `:739`, `:780` | Cases (a) to (g) are implemented as written. Case (d) follows the plan's own `conn.rollback()`-then-assert design, which is why it cannot kill ir-07 (IR-003). |
| T012 | complete | VERIFIED | `src/factorflow/universes/sql/coverage_check.sql` | The statement (lines 3-8) is verbatim from design 2.5. The header has two comment lines (see Scope). |
| T013 | complete | VERIFIED | `src/factorflow/universes/service.py` | Constants, the eight exceptions, the re-exports and the planned helper names are present. The checks follow design 2.4's order. Reads take no lock. There is no reader import, no `UPDATE`/`DELETE`, and no `type: ignore`. |
| T014 | complete | VERIFIED | Rerun: `test_universe_sql_safety.py` 30 passed, `test_research_sql_is_append_only.py` 12, `test_package_data_ships_sql.py` 9 | The change set matches T014's list plus the T016 evidence files and the v1 report. |
| T015 | complete | VERIFIED | Every Validation Plan command was rerun and passes (Independent Validation) | Both database suites now have independent runs. |
| T016 | complete | VERIFIED | `CAP-002-E1-S3-tdd-evidence.yaml`, `CAP-002-E1-S3-evidence/` | Five cycles, each `APPROVED` with no drift and `commit_hash: stage`. The lint is clean, and the patch chain was reproduced. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_create_appends_one_created_then_one_member_added_per_distinct_symbol`, `test_a_stock_may_belong_to_several_universes` / TC-COMP-002 | ADEQUATE | Returned fields, raw event rows in `event_id` order, `member_since` per instrument, one delegating `executemany` spy of 4 rows, `get_universe` equality, and an overlapping second universe. Kills ir-17, ir-20 and `:213`. | None for TC-COMP-002's Expected Result. |
| `test_create_refuses_...`, `test_lower_case_input_...`, `test_add_refuses_...`, `test_the_coverage_statement_...` / TC-COMP-001 | ADEQUATE | Covered, no-segment and no-row symbols together. Exact sorted `symbols`, the message, and counts or events after `rollback`. Kills `:153`, `:156`, ir-21, ir-22, ir-24 and ir-25. | Single cause only. The combined cause with a taken name is not pinned (IR-001), which is outside TC-COMP-001's Expected Result. |
| `test_a_3000_member_universe_is_created_in_three_calls_and_replayed` / TC-COMP-003 | ADEQUATE | Three calls at the cap, full order, event totals, an idempotent second pass, and the as-of reads. Passed in this review. | None. |
| `test_a_second_create_waits_on_the_advisory_lock_then_is_refused`, `test_racing_creates_never_both_succeed` / TC-COMP-019 | ADEQUATE | B is observed as an ungranted advisory waiter with no outcome yet, then refused after A commits. 20 barrier rounds of one success and one refusal. Kills ir-03. | `pg_locks` is cluster-wide. That is safe here because pytest runs serially and advisory keys are per database. |
| `test_an_active_name_cannot_be_reused_after_trimming`, `test_a_retired_universes_name_is_reusable`, `test_the_replayed_current_name_decides_not_the_created_name` / TC-COMP-023 | ADEQUATE | Trimmed clash with nothing written, exact comparison, retired reuse, replayed rename. Kills `:143` to `:148`, ir-11, ir-12, ir-13 and ir-14 (with the T011 helper tests). | Rename half is S4's. A taken name with an empty list is not pinned (IR-001). |
| `test_adding_a_current_member_...`, `test_adding_only_current_members_...`, `test_a_removed_symbol_...` / TC-COMP-024 | ADEQUATE | Exact `(added, already_member)` tuples, event-count deltas, the new event's `instrument_id`, no `executemany` when nothing is added, and re-adding after a removal. Kills `:180`, `:252`, ir-19 and ir-26. | None. |
| `test_create_with_no_symbols_...`, `test_blank_symbols_...` / TC-COMP-035 | ADEQUATE | `EmptyUniverse`, zero rows after `rollback`, the name reusable afterwards, and blank strings refused as a shape failure. Kills `:208`. | None for its Expected Result (see IR-001 for the combined cause). |
| `test_a_covered_retired_symbol_...`, `test_a_member_stays_a_member_...`, `test_a_retired_instrument_without_coverage_...` / TC-COMP-118 | ADEQUATE | Covered retired symbols are accepted on create and add, a member stays a member after its instrument retires, and coverage rather than lifecycle refuses. Kills ir-21. | None. |
| T011 additional integration tests (`:195`, `:611`, `:623`, `:636`, `:652`, `:691`, `:706`, `:739`, `:780`) | ADEQUATE except `:636` | Coverage before target (kills ir-10). `UniverseRetired` (kills ir-09). The `add_members` lock wait (kills ir-04). List pages, lifecycle, prefix and rename (kills ir-23). The events existence check and cursor (kills ir-15). Shared instrument. `get_universe` `as_of` (kills ir-16). | `test_a_failure_mid_write_rolls_back_every_event` (`:636`) is WEAK (not mandatory). It rolls back before it asserts, so ir-07 survives, and no `add_members` failure test exists, so ir-08 survives (IR-003). |
| `tests/unit/test_universe_service_validation.py` (T010) | ADEQUATE | Name trimming, no length bound, symbol shape, the cap at 1000 and 1001 (before de-duplication and before the shape checks), the sorted copy, exception bases, the lock key and the re-export identity. Kills `:91`, `:99`, `:100`, `:109`, `:120`, `:126` and ir-18. | `__all__` contents are not checked against the public operations (IR-002). |
| TDD evidence | ADEQUATE | Lint clean with `--require-logs`. Every RED log fails for the reason the YAML states. For example, cycle 3 had 4 failures for the missing name check and lock (`['created', 'created']`, `the second create never reached the lock`). Cycle 5's RED is an injected fault, which T016 allows. | The coder's cycles did not generate ir-01, ir-02, ir-07 or ir-08. |
| Mutation (review cycle) | 41/48 killed; 3 equivalent; 4 non-equivalent survivors | See Independent Validation. | IR-001 (ir-01, ir-02) and IR-003 (ir-07, ir-08). |

Determinism and isolation:

- Each test gets its own database (`tests/conftest.py`), migrated through version 5 only.
- The lock-wait loops are bounded at 5 s, and thread joins time out.
- `test_get_universe_of_an_unknown_id_and_before_creation` reads `date.today() + 1`. Under any
  host time zone that is on or after the Chicago creation date.
- No test depends on the network beyond the local container.

## Independent Validation

All commands ran in `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`
("component") unless stated. In the commands below, `<component>` is that path, `<story>` is
the story path above, `<stories>` is its directory, and `<scratchpad>` is this session's
scratch directory
`/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-musing-kalam-9778b9/4c0d8a20-3920-4e9b-b414-4599ab187ce2/scratchpad`,
which is outside the repository. As the owner authorized, the commands that need Docker,
`~/.cache` or temporary files ran outside the sandbox. The project `.venv` is CPython 3.13.7
(`requires-python >=3.12`), as for earlier reviews. The tech stack's container runtime is
3.12, and nothing in the change set is version-specific.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | 8/8 checks passed. The first attempt in the sandbox exited 1 because the here-document temp file was denied, so it was rerun outside. |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `RESUME — latest verdict is INCONCLUSIVE`, so v2 was written. |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z` | harness root | 0 | PASS | `f1bee9c7927981e5da4e35588b5fbb69c7cb3be7`, an ancestor of HEAD |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after) | harness root | 0 | PASS | `sha256:115c491e...2725` both times, the same as v1 |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:458756aa...6ea5`, equal to the approved `reviewed_revision` |
| `python3 scripts/check-tdd-evidence.py --evidence <stories>/CAP-002-E1-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f1bee9c7927981e5da4e35588b5fbb69c7cb3be7 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. The sandboxed attempt failed on `git apply` temp files, so it was rerun outside. |
| Patch chain: `git archive f1bee9c src tests` into the scratchpad, `git apply` `cycle-1.patch` to `cycle-5.patch` in order, `cmp` with HEAD, and `shasum -a 256` of each patch | scratchpad | 0 | PASS | All five apply, the five story files are byte-identical to HEAD, and every digest equals its `diff_sha256` |
| `uv lock --check` | component | 0 | PASS | Lockfile current. Run before `uv sync` to make sure the sync could not rewrite `uv.lock`. |
| `uv sync --all-extras` | component | 0 | PASS | `Checked 43 packages`; no change |
| `uv run pytest -m postgres tests/integration/test_universe_create.py tests/integration/test_universe_volume.py -q` (Phase 3 checkpoint, database half) | component | 0 | PASS | 32 passed (4.4 s) |
| `uv run pytest -m 'not postgres' tests/unit/test_universe_service_validation.py tests/unit/test_universe_sql_safety.py -q` (Phase 3 checkpoint, unit half) | component | 0 | PASS | 66 passed |
| `uv run pytest tests/unit/test_universe_sql_safety.py`; `tests/unit/test_research_sql_is_append_only.py`; `tests/unit/test_package_data_ships_sql.py` (T014) | component | 0 / 0 / 0 | PASS | 30, 12 and 9 passed |
| `uv run pytest -m 'postgres and slow' tests/integration/test_universe_volume.py -q` | component | 0 | PASS | 1 passed. `pyproject.toml` has no `addopts`, so this test is also part of `-m postgres`. |
| `uv run pytest -m postgres` | component | 0 | PASS | 359 passed, 948 deselected (217 s, 18:47:14Z to 18:50:51Z) |
| `uv run pytest -m 'not postgres'` | component | 0 | PASS | 948 passed, 359 deselected (25 s) |
| `uv run pytest` | component | 0 | PASS | 1307 passed (242 s, 18:51:35Z to 18:55:38Z) |
| `uv run ruff check .` | component | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | component | 0 | PASS | 207 files already formatted |
| `uv run mypy src` | component | 0 | PASS | No issues in 50 source files (strict) |
| `uv build` (as `uv build --out-dir <scratchpad>/build-out`) | component | 0 | PASS | Built the sdist and the wheel. The wheel ships `universes/service.py` and `universes/sql/coverage_check.sql` beside the four S2 files. The output was redirected so that `dist/` was not touched; setuptools used the ignored `build/` and `src/factorflow.egg-info/`. |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | component | N/A | NOT RUN | Not applicable. The change set has no frontend or TypeScript file, and the task plan's Validation Plan names none. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f1bee9c7927981e5da4e35588b5fbb69c7cb3be7..HEAD --cycle review --out <scratchpad>/mut/mutants.json` | harness root | 0 | PASS | 22 catalogue mutants (3 drop-field-copy, 11 negate-boolean, 8 off-by-one) over both changed production files. 26 reviewer mutants, ir-01 to ir-26, were appended (listed below). |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratchpad>/mut/mutants.json --jobs 4 --timeout 300 --work-root <scratchpad>/mut/work --out <scratchpad>/mut/results.json --command 'cd {workdir} && PYTHONPATH={workdir}/src <component>/.venv/bin/python -c "<assert service.__file__ is under {workdir}>" && PYTHONPATH={workdir}/src <component>/.venv/bin/python -m pytest -x -q -p no:cacheprovider tests/unit/test_universe_service_validation.py tests/unit/test_universe_sql_safety.py tests/integration/test_universe_create.py tests/integration/test_universe_volume.py'` | harness root | 3 | PASS-WITH-SURVIVORS | 18:56:15Z to 18:57:09Z. All 4 baselines passed 98 tests each. 41 killed, 7 survived. Results sha256 `fb29c164db313315335c012cc67f8177390dfdae9a7215bbf1a66c0bcaf47250`. |
| Reviewer probe `<scratchpad>/probe/probe_survivors.py`, run with `<component>/.venv/bin/python -I` against its own `postgres:16` container. It loads the committed `service.py` and in-memory copies mutated as ir-01, ir-02 and ir-07. | scratchpad | 0 | PASS (diagnostic) | Results in IR-001 and IR-003. No repository file was changed. |

Reviewer manual mutants and their outcome against the focused suites:

| Mutant | Change (all in `service.py` unless noted) | Result |
|--------|-------------------------------------------|--------|
| ir-01 | `create_by_hand` checks the name before coverage | **survived** (IR-001) |
| ir-02 | `create_by_hand` checks empty before the name | **survived** (IR-001) |
| ir-03 | `create_by_hand` takes the lock after the name check | killed (`test_a_second_create_waits_...`) |
| ir-04 | `add_members` takes no lock | killed (`test_add_members_waits_on_the_write_lock`) |
| ir-05, ir-06 | `pg_advisory_lock` (session) / `pg_try_advisory_xact_lock` | killed (S2's pinned `LOCK_STATEMENT`) |
| ir-07 | `create_by_hand` without `with conn.transaction()` | **survived** (IR-003) |
| ir-08 | `add_members` without `with conn.transaction()` | **survived** (IR-003) |
| ir-09 | `add_members` drops the retired guard | killed |
| ir-10 | `add_members` checks the target before coverage | killed |
| ir-11 | the name check uses the untrimmed name | killed |
| ir-12 | `_name_in_use` counts retired universes | killed |
| ir-13 | `_name_in_use` reads one page only | killed |
| ir-14 | `_name_in_use` ignores `excluding` | killed |
| ir-15 | `list_events` skips the existence check | killed |
| ir-16 | `get_universe` ignores `as_of` | killed |
| ir-17, ir-18 | `_normalise_symbols` keeps duplicates / request order | killed |
| ir-19 | `already_member` always empty | killed |
| ir-20 | one `execute` per event in place of one `executemany` | killed |
| ir-21, ir-22 (`coverage_check.sql`) | the check joins lifecycle / `LEFT JOIN coverage_segment` | killed |
| ir-23 | `list_universes` ignores `lifecycle` | killed |
| ir-24, ir-25 | the refusal names only the first uncovered symbol (create / add) | killed |
| ir-26 | `add_members` calls `executemany` with nothing to add | killed |

Catalogue survivors, all equivalent:

- `coverage_check.sql:1` and `:2` change a digit inside a `--` comment.
- `coverage_check.sql:6` changes `SELECT 1` to `SELECT 2` inside `NOT EXISTS`, which ignores its
  select list.

The other 19 catalogue mutants were killed. These include the 16 that v1 could only argue
statically, so v1's static dispositions are confirmed.

### Validation Side Effects

- **Before.** HEAD `b237ee80a83032baf7d29a3f09240b12533b65f0` on
  `usr/alvaro-de-jodra/CAP-002-E1-S3-run-20261023T035034Z`. `git status --porcelain=v1
  --untracked-files=all` was empty, and `code-revision` was `sha256:115c491e...2725`.
- **After.** The same HEAD, branch and `code-revision`, and an empty `git status`.
- **Unexpected tracked-file changes.** None. The test, build and mutation outputs went to the
  scratchpad, or to the gitignored `.pytest_cache/`, `build/` and `src/factorflow.egg-info/`.
  The mutation clones (`git clone --shared`) were removed by the runner.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 1 · **total 3**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | MEDIUM | `create_by_hand`'s design-2.4 refusal order is not pinned by any test (ir-01, ir-02 survive) |
| IR-002 | LOW | `__all__` omits the five public operations of `service.py` |
| IR-003 | MEDIUM | No test shows that a write rolls back its own events: the mid-write test rolls back first (ir-07, ir-08 survive) |

### IR-001 — `create_by_hand`'s design-2.4 refusal order is not pinned by any test

- **Severity**: MEDIUM
- **Status**: OPEN. This is v1/IR-001, carried forward and now confirmed by a run.
- **Acceptance criteria**: DAC-E1-S3-1, DAC-E1-S3-2, DAC-E1-S3-4 (none is unmet)
- **Tasks**: T003, T004, T005, T013
- **Files**: `src/factorflow/universes/service.py:203-209` (`create_by_hand`);
  `tests/integration/test_universe_create.py` (no create test combines two refusal causes)
- **Claim challenged**:
  - T013 says `create_by_hand` runs its checks "in design 2.4's order".
  - The task plan's Resolved Conflicts says "an empty create whose name is taken reports
    `UniverseNameInUse`".
  - The TDD evidence for cycles 2 and 3 reports no non-equivalent survivor.
- **Observed evidence**:
  - The code is correct: coverage (`:203-205`), then name (`:206-207`), then empty (`:208-209`).
  - In the database-backed run, ir-01 (name before coverage) and ir-02 (empty before name)
    both survive with all 98 focused tests passing.
  - The probe gives these results:

    | Input | Committed code | ir-01 | ir-02 |
    |-------|----------------|-------|-------|
    | Taken name with `["NOCOV"]` | `InstrumentNotAcquired` | `UniverseNameInUse` | `InstrumentNotAcquired` |
    | Taken name with `[]` | `UniverseNameInUse` | `UniverseNameInUse` | `EmptyUniverse` |

  - Every create refusal test uses either a free name or covered symbols. T011(a) pins the
    order only for `add_members`, and ir-10 is killed there.
- **Expected evidence/behavior**:
  - Design 2.4 fixes coverage (step 4), then name (step 6), then empty (step 7). These are "the
    checks in the order that makes each refusal name exactly one cause".
  - Design section 11 maps each refusal to its own API outcome (409 `instrument_not_acquired`,
    409 `universe_name_in_use`, 422 `empty_universe`).
  - Skill E.9 says no non-equivalent mutant may survive.
  - Severity is MEDIUM, not HIGH, because the mapped TCs disagree on combined inputs.
    TC-COMP-001 (and TC-COMP-035) favour one outcome, and TC-COMP-023 favours the other, so
    neither TC's Expected Result decides them. Only design 2.4's order does, and no mandatory
    TC carries that order.
- **Impact**: A reordering in `create_by_hand` would change which refusal and which HTTP status
  the owner sees, and no test would fail. S4 and S5 extend this module around the same
  helpers.
- **Required remediation**: Add create tests for both combined causes:
  - A taken active name with an uncovered symbol raises `InstrumentNotAcquired`.
  - A taken active name with no symbols raises `UniverseNameInUse`.

  Then show ir-01 and ir-02 killed.

### IR-002 — `__all__` omits every public operation of the module

- **Severity**: LOW
- **Status**: OPEN. This is v1/IR-002, carried forward with no change since v1.
- **Acceptance criteria**: N/A
- **Tasks**: T013, T010(f)
- **Files**: `src/factorflow/universes/service.py:31-46`;
  `tests/unit/test_universe_service_validation.py:169` (`test_all_names_in_dunder_all_resolve`)
- **Claim challenged**: T013's explicit `__all__` is meant to let "every design name
  `factorflow.universes.service.*` resolve" (DEC-0093).
- **Observed evidence**:
  - `__all__` lists the eight exceptions, the two constants and the four re-exported types.
  - It omits `create_by_hand`, `add_members`, `get_universe`, `list_universes` and
    `list_events`.
  - The unit test checks only that the names it lists resolve.
- **Expected evidence/behavior**: A module that declares `__all__` lists its public interface,
  which design 2.3 and section 11 define.
- **Impact**: Explicit imports work. A star import, or a tool that honours `__all__`, would drop
  every operation that `classification-api` (S6) calls.
- **Required remediation**: List the five operations in `__all__`, or state in the module
  docstring why they are excluded.

### IR-003 — No test shows that a write rolls back its own events

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A. The criterion behind it is design section 8 criterion 10, which
  is not a story AC. No story AC is unmet.
- **Tasks**: T011(d), T013
- **Files**: `src/factorflow/universes/service.py:199`, `:244` (`with conn.transaction():`);
  `tests/integration/test_universe_create.py:636-649`
  (`test_a_failure_mid_write_rolls_back_every_event`)
- **Claim challenged**: T011(d) says this test proves design section 8 criterion 10: "a
  database error during a write rolls back every event of that call and propagates; no
  partial universe exists".
- **Observed evidence**:
  - The test raises after `executemany` has run, then calls `conn.rollback()` itself (`:647`),
    then asserts zero rows. The caller's rollback empties the tables whether or not the call
    rolled anything back.
  - In the database-backed run, ir-07 (`create_by_hand` with `with conn.cursor():` in place of
    `with conn.transaction():`) survives. So does ir-08, the same change in `add_members`. No
    `add_members` failure test exists.
  - The probe ran the same mid-write failure on an idle connection and read the state before
    any caller rollback:
    - **Committed code:** the connection is `IDLE` with 0 `created` events. The call rolled back.
    - **ir-07:** the connection is `INTRANS` with 1 `created` event still pending. A caller that
      catches the error and commits would persist a partial universe.
  - Without the block, a refusal also leaves the transaction open and the advisory lock held
    until the caller ends it. An autocommit connection would lose atomicity and the lock
    altogether.
- **Expected evidence/behavior**:
  - Design 2.3 says "every write function runs inside `with conn.transaction():`".
  - Design section 8 criterion 10 requires the call to roll back every event of that call.
  - Skill E.9 says no non-equivalent mutant may survive.
  - Severity is MEDIUM, not HIGH, because the code is correct and no mandatory TC's Expected
    Result depends on this. The weak test is T011's additional test, and it follows the plan's
    own test design.
- **Impact**: Dropping the transaction block from either write, or leaving it out of the write
  functions S4 and S5 add, would pass every current test.
- **Required remediation**:
  - Make the failure test assert, before any caller `rollback()`, that the call left nothing
    behind. For example, check that `conn.info.transaction_status` is `IDLE` and that no
    `universe` or `universe_event` row exists. A second connection that observes the write
    lock free after the failure would also serve.
  - Add the same failure case for `add_members`.
  - Then show ir-07 and ir-08 killed.

## Previous Review Disposition

v1's verdict was INCONCLUSIVE only because the `postgres` suites could not run. That evidence
gap is resolved: `uv run pytest -m postgres`, `uv run pytest` and the database-backed mutation
run all ran in this review. No code or test changed between v1 and v2. HEAD `b237ee8` adds
only the v1 report over v1's `8d02826`, and the `code-revision` fingerprint is identical.

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | STILL OPEN | No test was added. The database-backed mutation run confirms that ir-01 and ir-02 survive, which v1 had only predicted, and the probe shows each changes the refusal raised. Carried as v2/IR-001. |
| v1/IR-002 | STILL OPEN | `service.py:31-46` is unchanged and still omits the five operations. Carried as v2/IR-002. |

## Scope and Plan Deviations

- **`coverage_check.sql` header.** It has two leading `--` lines, not the single comment T012
  names. The second line states the AC-15 rule. The statement itself is verbatim from design
  2.5. Justified, with no behavioural effect.
- **TC markers.** They are docstrings (`"""Implements TC-COMP-002."""`) rather than the
  `# Implements` comments T002 to T009 name. They are still greppable, and no harness tool
  parses either form. Justified.
- **T009 as-of read.** It uses `as_of=universe.created_on` in place of "today". This is the same
  Chicago date, and it does not depend on wall-clock midnight. Justified.
- **Tests beyond the plan.** These cover `_name_in_use` with `excluding` and paging (`:332`,
  `:343`), the `add_members` lock wait (`:739`), events cursor paging (`:780`), the empty add
  (`:419`, DEC-0095, owner upheld), the cap checked before the shape check, and that names are
  not case-folded. Each exercises a T013 helper or kills a mutant, and none adds production
  behaviour. Justified.
- **Extra private helpers.** `_event_row`, `_instrument_ids` and `_replayed` sit beside the
  planned helper names, which are all kept for S4 and S5. Justified refactor within T013.
- **Evidence directory and v1 report.** Patches, RED logs, mutation results and the v1 review go
  beyond T014's list, as T016, `--require-logs` and this skill require. Justified.
- **Story frontmatter.** Only `status` changed (`planning` to `in-review`), and the content
  revision still equals the approved `reviewed_revision`.
- **Out-of-scope changes.** None. There is no `UPDATE` or `DELETE`, no reader import, no
  `conftest.py`, no edit to S1 or S2 files, and no change to `pyproject.toml` or `uv.lock`.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E1-S3 against this report (v2). IR-001 and
  IR-003 are test-strength warnings that the owner may schedule as rework. If the Coding Agent
  addresses them first, a new review version is required before doc sync.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
