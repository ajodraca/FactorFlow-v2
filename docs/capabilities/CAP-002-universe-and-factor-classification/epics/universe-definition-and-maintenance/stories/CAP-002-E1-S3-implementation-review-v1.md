---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-23
updated: 2026-10-23
story_id: "CAP-002-E1-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-23T05:37:41Z"
reviewed_head: "8d0282626f9eccfeccb67ac4bf80967cd4dac144"
review_base: "f1bee9c7927981e5da4e35588b5fbb69c7cb3be7"
reviewed_state_revision: "sha256:115c491e2ca9431ad229b8dd1ce72d30ef380f8fee38d92a9ab9a7e47c142725"
verdict: INCONCLUSIVE
review_subjects:
  - artifact_id: CAP-002-E1-S3
    artifact_version: 1
    content_revision: sha256:458756aaab924bfa05dd45c4cd6aa08618ae397eb3c24575171b0ce0f30f6ea5
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-23T05:49:37Z
  source_artifacts:
    - id: CAP-002-E1-S3
      version: "1 (sha256:458756aaab924bfa05dd45c4cd6aa08618ae397eb3c24575171b0ce0f30f6ea5)"
    - id: CAP-002-E1-S3-tasks
      version: "1 (sha256:e9d5c4b49a7ff82c2b60994437ceb7042423983920026897eb73862d927fde66)"
    - id: CAP-002-E1-S3-tdd-evidence
      version: "1 (cycles 1 to 5)"
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

# Implementation Review: CAP-002-E1-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **INCONCLUSIVE** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 0/17 satisfied; 17 not testable in this review (no runtime evidence) |
| Planned tasks | 16/16 verified on reading; T002 to T009, T011 and the database half of T015 have no independent run |
| Required validation | 5/7 passed; 2 not run (`uv run pytest -m postgres`, `uv run pytest`) |

The verdict is INCONCLUSIVE because the required database suites could not run in this review.
It is not a finding against the code.

Every acceptance criterion of this story is a behaviour against PostgreSQL. Its only test
evidence is in `tests/integration/test_universe_create.py` and
`tests/integration/test_universe_volume.py`, which are all `postgres`-marked. The reviewer
could not run them:

- The suite starts PostgreSQL 16 through `testcontainers`, and the sandbox denies the Docker
  socket (`DockerException: ... Operation not permitted`).
- The permission system denied running the command outside the sandbox.
- A local PostgreSQL 14 cluster could not start either, because the sandbox denies `shmget`.

The skill (F.3) forbids substituting a narrower command, so the gate cannot pass on unit
evidence alone.

What could be checked independently:

- **Code and tests.** Reading the production code and every test against the story, the task
  plan, design 2.3 to 2.5 and the eight mapped TCs found no implementation defect. Each check
  is in design 2.4's order, the lock comes first, and the module issues only `INSERT`.
- **Evidence chain.** The five cycle patches, applied in order to `review_base`, reproduce the
  committed `src/` and `tests/` files byte for byte. Every RED log and mutation-results digest
  matches the YAML, and `check-tdd-evidence.py --require-logs` reports 0 errors.
- **In-sandbox commands.** All of them pass: the unit suites, ruff, ruff format, mypy strict
  and the offline build.

Two findings are recorded for the rework or rerun. Neither blocks the gate on its own:

- **IR-001 (MEDIUM).** Design 2.4 fixes the order of `create_by_hand`'s refusals, and no test
  pins it.
- **IR-002 (LOW).** `__all__` leaves out the five public operations.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S3-run-20261023T035034Z` |
| HEAD | `8d0282626f9eccfeccb67ac4bf80967cd4dac144` (one commit over the base: `story-coding(CAP-002-E1-S3): ...`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z`, resolved by `pipeline-state.py review-base --base-ref` to `f1bee9c7927981e5da4e35588b5fbb69c7cb3be7`; `git merge-base --is-ancestor` exits 0 |
| Working tree | Clean before and after validation (`git status --porcelain --untracked-files=all` empty) |
| Changed files reviewed | 22 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/service.py` | added | AC-1, AC-3, AC-5, AC-15, DAC-E1-1/-4/-5/-6/-9, DAC-E1-S3-1 to -7; T013 |
| `src/factorflow/universes/sql/coverage_check.sql` | added | AC-1, DAC-E1-1, DAC-E1-S3-1; T012 |
| `tests/integration/test_universe_create.py` | added | TC-COMP-001, -002, -019, -023, -024, -035, -118; T002 to T008, T011 |
| `tests/integration/test_universe_volume.py` | added | TC-COMP-003, DAC-E1-S3-8; T009 |
| `tests/unit/test_universe_service_validation.py` | added | T010 |
| `docs/.../stories/CAP-002-E1-S3-tasks.md` | modified | Checkbox bookkeeping only (16 `[ ]` to `[x]`); T001 to T016 |
| `docs/.../stories/CAP-002-E1-S3.md` | modified | `status: planning` to `in-review` only (T014 allows it). The content revision still equals the approved `reviewed_revision`. |
| `docs/.../stories/CAP-002-E1-S3-tdd-evidence.yaml` | added | T016 |
| `docs/.../stories/CAP-002-E1-S3-evidence/cycle-1.patch` to `cycle-5.patch` (5 files) | added | T016 `reviewed_patch` per cycle |
| `docs/.../stories/CAP-002-E1-S3-evidence/red-cycle-1-pure-service.log`, `red-cycle-2-create.log`, `red-cycle-3-name-and-lock.log`, `red-cycle-4-add-members-and-reads.log`, `red-cycle-5-volume.log` | added | T016 RED evidence (`--require-logs`) |
| `docs/.../stories/CAP-002-E1-S3-evidence/mutation-cycle-1-results.json` to `mutation-cycle-4-results.json` (4 files) | added | T016 mutation evidence |

## Acceptance Criteria Verification

`NOT TESTABLE` here means the criterion needs a PostgreSQL run that this review could not
perform. The code and the assertions were read and showed no defect.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | NOT TESTABLE | `service.py:192-222` `create_by_hand`; `:151-156` `_uncovered`; `sql/coverage_check.sql` | `test_universe_create.py:141` (TC-COMP-002), `:221`, `:722` (TC-COMP-001) | Coverage is checked over the whole batch, and an uncovered stock refuses the request. The tests were not run here. |
| AC-3 | NOT TESTABLE | `service.py:192-222` makes no check across universes | `test_universe_create.py:181`, `:706` | Two universes share a stock; removing it from one leaves the other unchanged. |
| AC-5 | NOT TESTABLE | `service.py:208-209` `EmptyUniverse` after the coverage and name checks | `test_universe_create.py:251`, `:267` (TC-COMP-035) | Create half only; the last-member half is S4's (task plan traceability). |
| AC-15 | NOT TESTABLE | `coverage_check.sql` never joins `instrument.lifecycle`; `service.py` never reads lifecycle | `test_universe_create.py:535`, `:556`, `:571` (TC-COMP-118) | A covered retired symbol is accepted, a member whose instrument retires stays a member, and an uncovered retired symbol is refused. |
| DAC-E1-1 | NOT TESTABLE | `service.py:203-205`, `:247-249`; `InstrumentNotAcquired` `:87-92` | `test_universe_create.py:221`, `:722`, `:590` | Every uncovered symbol is named, sorted, and nothing is written (counts checked after `rollback`). |
| DAC-E1-4 | NOT TESTABLE | `service.py:136-148` `_name_in_use` over `replay.list_universe_rows("active", ...)` with exact equality | `test_universe_create.py:281`, `:300`, `:314`, `:343` | Create half. A retired name is reusable, a renamed universe holds its new name, and a clash on a later page is found. |
| DAC-E1-5 | NOT TESTABLE | `service.py:131-133`, `:199-200`, `:244-245` lock as the first statement | `test_universe_create.py:449`, `:492`, `:739` | See TC-COMP-019 below. |
| DAC-E1-6 | NOT TESTABLE | `service.py:251-262` partition; `executemany` only when `added` is non-empty | `test_universe_create.py:360`, `:386`, `:404` | `already_member` is returned with no event, and an empty `executemany` is never issued. |
| DAC-E1-9 | NOT TESTABLE | As AC-15 | `test_universe_create.py:535`, `:556` | `lifecycle == "retired"` replays, and a re-add returns `already_member`. |
| DAC-E1-S3-1 | NOT TESTABLE | As DAC-E1-1 | `test_universe_create.py:221`, `:238`, `:722`, `:590` | Includes lower-case normalisation and the SQL-level half (T008). |
| DAC-E1-S3-2 | NOT TESTABLE | `service.py:208-209` | `test_universe_create.py:251`, `:267` | A following create of the same name proves no half-created universe exists. Blank strings raise `ValueError`, not `EmptyUniverse`. |
| DAC-E1-S3-3 | NOT TESTABLE | `service.py:214-222` one list, one `cur.executemany` | `test_universe_create.py:141` | The spy asserts one call of 4 rows. `member_since` equals each `member_added` `recorded_at`. |
| DAC-E1-S3-4 | NOT TESTABLE | As DAC-E1-4 | `test_universe_create.py:281`, `:300`, `:314` | Rename half is S4's (task plan Resolved Conflicts). |
| DAC-E1-S3-5 | NOT TESTABLE | As DAC-E1-5 | `test_universe_create.py:449`, `:492` | The coder's `red-cycle-3-name-and-lock.log` shows both forms failing without the lock. |
| DAC-E1-S3-6 | NOT TESTABLE | As DAC-E1-6 | `test_universe_create.py:360` | `(["CCC"], ["AAA", "BBB"])`, and the event count rises by exactly 1. |
| DAC-E1-S3-7 | NOT TESTABLE | As AC-15 | `test_universe_create.py:535` | Returned and replayed `RRR` has `lifecycle == "retired"`. |
| DAC-E1-S3-8 | NOT TESTABLE | `create_by_hand` plus two `add_members` calls of 1000 | `test_universe_volume.py:40` (`slow`) | Correctness only; no elapsed-time bound (task plan Open Gaps). Not run here. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `review_base`: `0005_universes.sql`, `universes/__init__.py`, `replay.py` exporting `Member`, `Origin`, `Universe`, `UniverseEvent`, `UniverseRow(universe_id, name, lifecycle, created_at, retired_at)`, `current_state`, `membership_as_of`, `list_events`, `list_universe_rows`; the four S2 `.sql` files; `pyproject.toml` package-data `"universes/sql/*.sql"` | Verification task; no file changed. |
| T002 | complete | VERIFIED | `test_universe_create.py:141`, `:181` | Matches the plan: trimmed name, by-hand origin, symbol order, `member_since`, event rows, one `executemany` of 4, `get_universe` equality, and the AC-3 overlap. Not run here. |
| T003 | complete | VERIFIED | `test_universe_create.py:221`, `:238`, `:722` | Cases (a), (b) and (c) as planned, with counts checked after `rollback`. Not run here. |
| T004 | complete | VERIFIED | `test_universe_create.py:251`, `:267` | As planned, including the follow-up create of `"U"` and the blank-strings `ValueError`. Not run here. |
| T005 | complete | VERIFIED | `test_universe_create.py:281`, `:300`, `:314` | Trimmed clash, exact comparison (`growth`, `Growth 2`), retired reuse through a direct `retired` insert, and the renamed name deciding. Not run here. |
| T006 | complete | VERIFIED | `test_universe_create.py:360`, `:386`, `:404`, `:449`, `:492` | TC-COMP-024 (all three cases) and TC-COMP-019 (the `pg_locks` form, and a 20-round barrier with fresh names). Exceptions are captured in the threads, and connections close in `finally`. Not run here. |
| T007 | complete | VERIFIED | `test_universe_create.py:535`, `:556`, `:571` | Cases (a) to (d) as planned. Not run here. |
| T008 | complete | VERIFIED | `test_universe_create.py:590` | Runs `service.COVERAGE_CHECK_SQL` directly. It returns exactly `["BBB", "CCC"]`, nothing for an empty list, and does not report a symbol covered by two segments. Not run here. |
| T009 | complete | VERIFIED | `test_universe_volume.py:25-83` | `generate_series` seeding, three calls, 3000 members in order, 1 + 3000 events, a second pass of 3000 `already_member` with no event, and the as-of reads. Uses `as_of=created_on` in place of "today" (equivalent and deterministic). Not run here. |
| T010 | complete | VERIFIED | `tests/unit/test_universe_service_validation.py` (36 tests) | Cases (a) to (f) present and passing (rerun). |
| T011 | complete | VERIFIED | `test_universe_create.py:611`, `:623`, `:195`, `:636`, `:652`, `:691`, `:706`, `:780` | Cases (a) to (g) as planned, plus an `add_members` lock-wait test (`:739`). Not run here. |
| T012 | complete | VERIFIED | `src/factorflow/universes/sql/coverage_check.sql` | The statement is verbatim design 2.5. It has two leading comment lines in place of one (see Scope and Plan Deviations). |
| T013 | complete | VERIFIED | `src/factorflow/universes/service.py` | The constants, the eight design 2.3 exceptions, the re-exports, the helpers with the planned names, `create_by_hand` and `add_members` in design 2.4 order, and the read delegates are all present. There is no reader import and no `UPDATE` or `DELETE`. `mypy --strict` is clean with no `type: ignore`. See IR-002 (`__all__`). |
| T014 | complete | VERIFIED | Rerun: `test_universe_sql_safety.py`, `test_research_sql_is_append_only.py`, `test_package_data_ships_sql.py` pass | The change set matches T014's list plus the T016 evidence files. |
| T015 | complete | VERIFIED | Rerun in the sandbox: `pytest -m 'not postgres'`, ruff, ruff format, mypy and `uv build` all pass | The database half (`pytest -m postgres`, the full suite) rests only on the coder's GREEN statements. This review could not rerun it, which is the basis of the INCONCLUSIVE verdict. |
| T016 | complete | VERIFIED | `CAP-002-E1-S3-tdd-evidence.yaml`, `CAP-002-E1-S3-evidence/` | Five cycles, each with RED log, `diff_sha256`, `APPROVED` and no drift; `commit_hash: stage`. The digests and the patch chain were reproduced (see Independent Validation). |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_create_appends_one_created_then_one_member_added_per_distinct_symbol`, `test_a_stock_may_belong_to_several_universes` / TC-COMP-002 | ADEQUATE (on reading) | Observable outcomes throughout: the returned `Universe` fields, the raw `universe_event` rows in `event_id` order, `member_since` per instrument, one spied `executemany` of exactly 4 rows (the spy delegates to the original), `get_universe` equality, and an overlapping second universe. | Not run here. |
| `test_create_refuses_the_whole_request_naming_every_uncovered_symbol`, `test_lower_case_input_is_normalised_before_the_coverage_check`, `test_add_refuses_the_whole_request_and_changes_nothing`, `test_the_coverage_statement_returns_exactly_the_uncovered_symbols` / TC-COMP-001 | ADEQUATE (on reading) | Mixed covered, no-segment and no-row symbols. Asserts the exact sorted `symbols`, the message, and table counts or events after `rollback` for both create and add. The SQL half guards against duplicate rows by list equality. | Not run here. The combined-cause order is not pinned (IR-001). |
| `test_a_3000_member_universe_is_created_in_three_calls_and_replayed` / TC-COMP-003 | ADEQUATE (on reading) | Three calls at the cap, full membership order, event totals, an idempotent second pass, and the as-of reads before and on creation. | Not run here; the `slow` and `postgres` markers are both present. |
| `test_a_second_create_waits_on_the_advisory_lock_then_is_refused`, `test_racing_creates_never_both_succeed` / TC-COMP-019 | ADEQUATE (on reading) | The deterministic form holds the key on A and observes B as an ungranted advisory waiter with no outcome yet. A then creates `"Race"` re-entrantly and commits, and B must raise `UniverseNameInUse`, with exactly one `created` event. A lock taken after the name check would let B pass the check before A commits and produce two universes, so a misplaced lock fails this test. The barrier form requires one success and one refusal in each of 20 rounds. | Not run here. `pg_locks` is cluster-wide, which is acceptable because tests run serially. |
| `test_an_active_name_cannot_be_reused_after_trimming`, `test_a_retired_universes_name_is_reusable`, `test_the_replayed_current_name_decides_not_the_created_name` / TC-COMP-023 | ADEQUATE (on reading) | Trimmed clash refused and nothing written. Exact comparison: case and suffix variants are accepted. Retired reuse, and the replayed rename deciding. | Not run here. Rename half is S4's. Taken name with empty symbols is not pinned (IR-001). |
| `test_adding_a_current_member_is_reported_and_appends_no_event`, `test_adding_only_current_members_appends_nothing`, `test_a_removed_symbol_is_added_again_as_a_new_member` / TC-COMP-024 | ADEQUATE (on reading) | Exact `(added, already_member)` tuples, event-count deltas, the new event's `instrument_id`, no `executemany` call when nothing is added, and re-adding after removal. | Not run here. |
| `test_create_with_no_symbols_raises_empty_universe_and_writes_nothing`, `test_blank_symbols_are_a_shape_failure_not_an_empty_universe` / TC-COMP-035 | ADEQUATE (on reading) | `EmptyUniverse`, zero rows after `rollback`, the same name reusable afterwards, and blank strings refused as `ValueError` but not `EmptyUniverse`. | Not run here. |
| `test_a_covered_retired_symbol_is_accepted_and_replays_retired`, `test_a_member_stays_a_member_when_its_instrument_retires`, `test_a_retired_instrument_without_coverage_is_still_uncovered` / TC-COMP-118 | ADEQUATE (on reading) | Retired covered symbols are accepted on create and add, a member whose instrument retires stays a member and re-adds as `already_member`, and coverage rather than lifecycle refuses. | Not run here. |
| T011 additional integration tests (`:195`, `:611`, `:623`, `:636`, `:652`, `:691`, `:706`, `:739`, `:780`) | ADEQUATE (on reading) | Coverage before target; `UniverseRetired` with no write. A mid-write `OperationalError` propagates and leaves zero rows. Lifecycle, prefix, rename and cursor paging in `list_universes`; newest-first events with symbols, and their cursor; shared-instrument isolation; `add_members` waits on the lock. | Not run here. |
| `tests/unit/test_universe_service_validation.py` (T010) | ADEQUATE | Trim, empty and whitespace refusals, no length bound, symbol shape (`1ABC`, `A B`, 17 characters, empty), the cap at 1000 and 1001 counted before de-duplication and before shape checks, the sorted copy in `InstrumentNotAcquired`, exception bases, the lock key, and the identity of the re-exports. | `test_all_names_in_dunder_all_resolve` does not check that the public operations are listed (IR-002). |
| TDD evidence lint | ADEQUATE | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings. The RED logs come from real container runs (for example `red-cycle-3-name-and-lock.log`, 4 failures for the reasons the YAML states). Cycle 5's RED is a deliberately injected fault, which T016's suggested cycle 5 allows. | None. |
| Mutation (review cycle) | INCOMPLETE | 22 catalogue mutants and 6 reviewer manual mutants. Run against the unit suites only, 7 were killed; the other 21 need the `postgres` suite. Read against the test code: 16 of the 21 would be killed by a named test, 3 are equivalent, and 2 non-equivalent mutants (manual ir-01 and ir-02) are killed by no test in the change set. | IR-001. A database-backed rerun is required to confirm. |

## Independent Validation

All commands ran in the sandbox, in
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2` ("component")
unless stated. `uv` commands used `UV_CACHE_DIR=/tmp/claude-501/uv-cache` and
`uv run --frozen --offline` with the existing `.venv`, because the sandbox denies
`~/.cache/uv` and `pypi.org`. Caches were redirected so that nothing was written into the
repository: `-p no:cacheprovider` for pytest, `--no-cache` for ruff and `--cache-dir` for mypy.
No setuptools wheel is available offline in a fresh uv cache, so the commands that build
wheels used `UV_FIND_LINKS=/tmp/claude-501/ir-wheels`. That directory holds a wheel repacked
from the locally cached setuptools 84.2.1 (`~/.cache/uv/archive-v0/2YEXGW7dY86Rro9h`), and the
build backend is unchanged.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed. |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — story is ready for independent review`. |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z` | harness root | 0 | PASS | `f1bee9c7927981e5da4e35588b5fbb69c7cb3be7`, an ancestor of HEAD (`merge-base --is-ancestor` exits 0). |
| `git diff --stat f1bee9c..HEAD`; `git status --porcelain=v1 --untracked-files=all` | component | 0 | PASS | 22 files changed (17 594 insertions, 17 deletions). No staged, unstaged or untracked file. |
| Patch chain: `git archive f1bee9c src tests` into the scratchpad, then `git apply --include='src/*' --include='tests/*'` of `cycle-1.patch` to `cycle-5.patch` in order, then `cmp` with HEAD | scratchpad | 0 | PASS | All five patches apply cleanly. `service.py`, `coverage_check.sql` and the three test files are byte-identical to HEAD. Each patch's `shasum -a 256` equals its `diff_sha256`. |
| `shasum -a 256` of the 5 RED logs and 4 mutation-results files | stories dir | 0 | PASS | All 9 digests equal the YAML's `red_log_sha256` and `results_sha256`. |
| `python3 scripts/check-tdd-evidence.py --evidence <stories>/CAP-002-E1-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f1bee9c7927981e5da4e35588b5fbb69c7cb3be7 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. |
| `uv run pytest -v tests/unit/test_universe_sql_safety.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py tests/unit/test_universe_service_validation.py` | component | 0 | PASS | 87 passed. Covers the T014 guards, T010, and the unit half of the Phase 3 checkpoint. |
| `uv run pytest -m 'not postgres'` (first attempt, without `UV_FIND_LINKS`) | component | 1 | NOT RUN (environment) | 1 failed and 2 errors, all `uv build --wheel --offline` inside `test_release_excludes_test_paths.py` and `test_distribution_contents.py`: no setuptools offline. Superseded by the next row. |
| `uv run pytest -m 'not postgres'` (with `UV_FIND_LINKS`) | component | 0 | PASS | 947 passed, 1 skipped, 359 deselected (23.3 s, from 05:44:53Z). |
| `uv run pytest -m postgres -x tests/integration/test_universe_create.py` | component | 1 | NOT RUN (environment) | 1 error at fixture setup: `docker.errors.DockerException: Error while fetching server API version: ('Connection aborted.', PermissionError(1, 'Operation not permitted'))`. No test body ran. |
| `uv run pytest -m postgres` | component | N/A | NOT RUN | Same cause, and required (task plan, tech stack). `docker info` is denied on the socket in the sandbox. The permission system denied a run outside the sandbox. `initdb` of a local PostgreSQL 14 failed with `shmget` denied, and 14 is not the stack's 16 in any case. |
| `uv run pytest` (tech-stack full suite) | component | N/A | NOT RUN | Same cause. |
| `uv run pytest -m 'postgres and slow' tests/integration/test_universe_volume.py` | component | N/A | NOT RUN | Same cause. `pyproject.toml` has no `addopts`, so the `slow` test is part of `-m postgres`. |
| `uv run ruff check .` | component | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | component | 0 | PASS | 207 files already formatted. |
| `uv run mypy src` | component | 0 | PASS | No issues in 50 source files (strict). |
| `uv build` (as `uv build --offline --out-dir /tmp/claude-501/ir-build`, with `UV_FIND_LINKS`) | component | 0 | PASS | Built the sdist and the wheel. The wheel contains `factorflow/universes/service.py` and `factorflow/universes/sql/coverage_check.sql` beside the four S2 files. |
| `uv sync --all-extras` | component | N/A | NOT RUN | It needs `pypi.org`, which the sandbox denies. The existing `.venv` was used with `--frozen`. Not a story command. |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | component | N/A | NOT RUN | The change set has no frontend file, and the task plan's Validation Plan names none. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f1bee9c7927981e5da4e35588b5fbb69c7cb3be7..HEAD --cycle review --out /tmp/claude-501/ir-mut/mutants.json` | harness root | 0 | PASS | 22 catalogue mutants (3 drop-field-copy, 11 negate-boolean, 8 off-by-one) over both changed production files. Six manual mutants, ir-01 to ir-06, were appended (below). |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /tmp/claude-501/ir-mut/mutants.json --jobs 4 --command 'cd {workdir} && PYTHONPATH={workdir}/src <component>/.venv/bin/python -m pytest -x -q -p no:cacheprovider tests/unit/test_universe_service_validation.py tests/unit/test_universe_sql_safety.py' --out /tmp/claude-501/ir-mut/results-unit.json --work-root /tmp/claude-501/ir-mut/work` | harness root | 3 | INCOMPLETE | 05:46:03 to 05:46:08Z, all 4 baselines exit 0. 28 mutants: 7 killed (`service.py:91`, `:99`, `:100` drop-field-copy; `:109`, `:126` negate-boolean; `:120` off-by-one; ir-05) and 21 survived. A survivor here proves nothing, because these mutants change paths that only the `postgres` suite runs. Results sha256 `f27ce93fdbdbc37b5cf5ab3c51db7da45ba83081a55ddff2a15e691945609a0d`. |

Reviewer manual mutants, all in `service.py`:

- **ir-01, line 203.** `uncovered = [] if _name_in_use(conn, clean_name) else _uncovered(conn, clean_symbols)`,
  which checks the name before coverage.
- **ir-02, line 206.** `if clean_symbols and _name_in_use(conn, clean_name):`, which checks
  for an empty list before the name.
- **ir-03, line 250.** `_replayed` in place of `_require_active`, which drops the retired guard.
- **ir-04, line 206.** The name check gets the raw, untrimmed name.
- **ir-05, line 120.** The cap is not re-checked.
- **ir-06, line 253.** `already_member` is always empty.

Static disposition of the 21 mutants that survived the unit-only run, pending a run against
the database:

- **Would be killed by a named test.**
  - `:143`, `:145` (two), `:146`: killed by `test_an_active_name_cannot_be_reused_after_trimming`
    and `test_the_name_check_ignores_the_universe_excluded`.
  - `:148`, `:174` (two), `:208`, `:213`: these break every create, so TC-COMP-002 kills them.
  - `:153`, `:156`: killed by `test_create_refuses_the_whole_request_naming_every_uncovered_symbol`.
  - `:180`, `:252`, ir-06: killed by `test_adding_a_current_member_is_reported_and_appends_no_event`.
  - ir-03: killed by `test_add_members_to_a_retired_universe_is_refused`.
  - ir-04: killed by `test_an_active_name_cannot_be_reused_after_trimming` (`"  Growth "`).
- **Equivalent.**
  - `coverage_check.sql:1` and `:2` change a digit in a `--` comment.
  - `coverage_check.sql:6` changes `SELECT 1` to `SELECT 2` inside `EXISTS`, which ignores its
    select list.
- **Not equivalent, and killed by no test.** ir-01 and ir-02 (IR-001).

The coder's committed cycle results agree where they overlap. Across cycles 1 to 4 they record
71 mutants, 65 killed and 6 survivors, each argued equivalent, and this reviewer agrees with
those six arguments. The coder did not generate ir-01 or ir-02.

### Validation Side Effects

- **Before.** HEAD `8d0282626f9eccfeccb67ac4bf80967cd4dac144` on
  `usr/alvaro-de-jodra/CAP-002-E1-S3-run-20261023T035034Z`. `git status --porcelain
  --untracked-files=all` was empty, and `code-revision` was
  `sha256:115c491e2ca9431ad229b8dd1ce72d30ef380f8fee38d92a9ab9a7e47c142725`.
- **After.** The same HEAD and branch, an empty `git status`, and the same `code-revision`
  fingerprint.
- **Unexpected tracked-file changes.** None. Build output and mutation clones went to
  `/tmp/claude-501/`. Setuptools' bdist step uses the gitignored `build/` directory.

## Findings

**Verdict:** INCONCLUSIVE — CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | MEDIUM | `create_by_hand`'s design-2.4 refusal order (coverage, then name, then empty) is not pinned by any test (ir-01, ir-02 survive on reading) |
| IR-002 | LOW | `__all__` omits the five public operations of `service.py` |

### IR-001 — `create_by_hand`'s design-2.4 refusal order is not pinned by any test

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S3-1, DAC-E1-S3-2, DAC-E1-S3-4 (none is unmet)
- **Tasks**: T003, T004, T005, T013
- **Files**: `src/factorflow/universes/service.py:203-209` (`create_by_hand`);
  `tests/integration/test_universe_create.py` (no test combines two refusal causes on create)
- **Claim challenged**: T013 says `create_by_hand` runs its checks "in design 2.4's order".
  Cycles 2 and 3 of the TDD evidence say no non-equivalent mutant survives.
- **Observed evidence**:
  - The code follows the order: coverage (`:203-205`), then name (`:206-207`), then empty
    (`:208-209`).
  - No test calls `create_by_hand` with a name an active universe already holds together with
    an uncovered symbol. No test calls it with such a name and an empty symbol list either.
  - Every refusal test on create uses a free name (`"U"` in an empty database), or covered
    symbols with a taken name.
  - Manual mutant ir-01 checks the name before coverage, so a taken name plus `["ZZZ"]` raises
    `UniverseNameInUse` in place of `InstrumentNotAcquired`. Manual mutant ir-02 checks for
    an empty list before the name, so a taken name plus `[]` raises `EmptyUniverse` in place of
    `UniverseNameInUse`.
  - Reading the tests shows neither mutant is killed. The run against the unit suites (above)
    could not judge them.
  - The task plan's Resolved Conflicts records the second outcome ("an empty create whose name
    is taken reports `UniverseNameInUse`"), but pins only the `add_members` order (T011(a)).
- **Expected evidence/behavior**:
  - Design 2.4 fixes coverage (step 4), then name (step 6), then empty (step 7), "the order
    that makes each refusal name exactly one cause".
  - Design section 11 gives each refusal its own outcome for `classification-api` (S6): 409
    `instrument_not_acquired`, 409 `universe_name_in_use` and 422 `empty_universe`.
  - Skill E.9 says no non-equivalent mutant may survive the change set.
- **Impact**: A reordering regression would change which refusal, and which HTTP status, the
  owner sees, and no test would fail. This is plausible when S4 and S5 extend `service.py`
  around the same helpers.
- **Required remediation**: Add integration assertions for both combined cases. A taken active
  name with an uncovered symbol must raise `InstrumentNotAcquired`, and a taken active name
  with no symbols must raise `UniverseNameInUse`. Then show ir-01 and ir-02 killed by the
  `postgres` suite.

### IR-002 — `__all__` omits every public operation of the module

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013, T010(f)
- **Files**: `src/factorflow/universes/service.py:31-46`;
  `tests/unit/test_universe_service_validation.py:169` (`test_all_names_in_dunder_all_resolve`)
- **Claim challenged**: T013 says the explicit `__all__` lets "every design name
  `factorflow.universes.service.*` resolve" (DEC-0093).
- **Observed evidence**:
  - `__all__` lists the eight exceptions, `COVERAGE_CHECK_SQL`, `UNIVERSE_WRITE_LOCK_KEY` and
    the four re-exported types.
  - It does not list `create_by_hand`, `add_members`, `get_universe`, `list_universes` or
    `list_events`, which are the operations design 2.3 and section 11 define as this module's
    interface.
  - The unit test checks only that the listed names resolve.
- **Expected evidence/behavior**: A module that declares `__all__` lists its public interface,
  which is design 2.3's.
- **Impact**: Explicit imports and `service.create_by_hand` work, so no acceptance criterion is
  affected. A star import, or a documentation tool that honours `__all__`, would leave out
  every operation S6 calls.
- **Required remediation**: Add the five public functions to `__all__`, or state in the module
  docstring why they are excluded.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **`coverage_check.sql` header.** It has two leading `--` lines, not the "only a leading `--`
  comment" T012 names. The second line states the AC-15 rule. The statement itself is
  verbatim design 2.5. Justified, with no behavioural effect.
- **TC markers.** They are docstrings (`"""Implements TC-COMP-002."""`) rather than the
  `# Implements` comments T002 to T009 name. Traceability is preserved and greppable.
- **T009 as-of read.** It uses `as_of=universe.created_on`, not "today". This is the same
  America/Chicago date, and it cannot change if the test runs across midnight. Justified.
- **Tests beyond the plan.** `_name_in_use` excluding and paging (`:332`, `:343`),
  `add_members` lock wait (`:739`), events cursor paging (`:780`), empty add (`:419`,
  DEC-0095), the cap checked before shape, and name not case-folded. They exercise T013's
  helpers or kill mutants, and none adds production behaviour. Justified.
- **Evidence directory.** Patches, RED logs and mutation results go beyond T014's list of
  expected files, as T016 and `--require-logs` require. Justified.
- **Story frontmatter.** Only `status` changed (`planning` to `in-review`), and
  `artifact-gate.py revision` still equals the approved `reviewed_revision`.
- **Out-of-scope changes.** None. There is no `UPDATE` or `DELETE`, no reader import, no
  `conftest.py`, and no edit to S1 or S2 files or `pyproject.toml`.

## Follow-Up

- **Next agent**: Adversarial Review Agent after evidence correction (v2 of this report).
- **Required action**:
  - Rerun this review where the Docker socket is reachable, either by allowing it in the
    sandbox (`/sandbox`) or by permitting the run outside it. Doc Sync is not authorized until
    that rerun passes.
  - The rerun must run `uv run pytest -m postgres` and `uv run pytest`. These cover
    `tests/integration/test_universe_create.py` and the `slow`
    `tests/integration/test_universe_volume.py`.
  - The rerun must also run the review mutants with the focused database command, including
    `tests/integration/test_universe_create.py`, and confirm the static dispositions above,
    ir-01 to ir-06 included.
  - The Coding Agent may resolve IR-001 and IR-002 before the rerun. Neither blocks a passing
    verdict on its own.
- **Warnings accepted downstream**: N/A
