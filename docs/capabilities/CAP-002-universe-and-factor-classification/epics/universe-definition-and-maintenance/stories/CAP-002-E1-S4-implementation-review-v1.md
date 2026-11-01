---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E1-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T02:18:41Z"
reviewed_head: "7db5ae220e9ae46fa76859b4cef9885bbb00e800"
review_base: "6a5eca7213a84853d9b0b6d46ee16a65e628d32a"
reviewed_state_revision: "sha256:cd82946ab2996c00174c98751a192776bb517348ba8eed179dc81fb20009ecb6"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E1-S4
    artifact_version: 1
    content_revision: sha256:1b10daa0e2c8c9f7d0903de0b98b2c866d9e705b543cfad79eadc9c79cd4b522
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-31T02:35:00Z
  source_artifacts:
    - id: CAP-002-E1-S4
      version: "1 (sha256:1b10daa0e2c8c9f7d0903de0b98b2c866d9e705b543cfad79eadc9c79cd4b522)"
    - id: CAP-002-E1-S4-tasks
      version: "1 (sha256:a1a8ce7eeb7b5952347d8bea29215a620498cb283d7bcf5ac193b306a6cf1bb1)"
    - id: CAP-002-E1-S4-tdd-evidence
      version: "1 (cycles 1 to 3)"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-universe-service-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 13/14 verified |
| Required validation | 7/7 passed |

**By severity:** CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 1 · **total 3**

This is the initial review of the story, run unattended by a `pipeline-run` driver. The
production code is correct. `rename`, `remove_member` and `retire` each take the write lock as
their first statement, refuse an unknown or retired universe, and append exactly one event
through an `INSERT`-only, named-placeholder statement. All 13 acceptance criteria are satisfied
by the code and by passing tests. Every required validation command passes when rerun: 1885
passed and 1 xfailed across the two halves of the suite. Lint, format, the strict type check
and the build are clean, and the TDD-evidence lint reports no error.

The gate fails on test strength. The review regenerated the mutation catalogue over the change
set, reran the coder's 21 hand-written mutants, and added 6 of its own: 31 mutants in all. 26
were killed and 5 survived. None of the 5 is equivalent. A probe in a scratch clone (never in
the reviewed repository) showed each one produce a wrong outcome:

- **IR-001 (HIGH).** The write-lock tests prove only that each write waits on the lock
  somewhere before its insert. They do not prove that the lock comes before the replay checks.
  With the replay moved ahead of the lock, all 144 focused tests still pass. Yet two concurrent
  removals then empty a two-member universe, and a rename that waited on a concurrent retire
  appends `renamed` to the retired universe. A second concurrent retire then fails with the
  database's `UniqueViolation` rather than `UniverseRetired`.
- **IR-002 (HIGH).** Design 2.4 puts the shape check (step 2, `ValueError`) before the target
  check (step 5), but no test pins that order for `rename` or `remove_member`. With the two
  checks swapped, a blank name on an unknown universe raises `UniverseNotFound`, and a
  malformed symbol on a retired universe raises `UniverseRetired`. Both mutants survive.
- **IR-003 (LOW).** TC-COMP-037's as-of read after a retire runs on the same day as every
  event, so it cannot show a past membership that differs from the current one.

The story returns to the Coding Agent. Only tests need to change.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, a run-local clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S4` |
| HEAD | `7db5ae220e9ae46fa76859b4cef9885bbb00e800`: one commit over the base, `7db5ae2` story-coding, carrying `Decision-Id: DEC-0096` |
| Review base | `origin/main` = `6a5eca7213a84853d9b0b6d46ee16a65e628d32a`, resolved by `pipeline-state.py review-base --base-ref origin/main`; an ancestor of HEAD and the merge base. Without `--base-ref` the command resolves `1d166f7`, because the clone's `origin/HEAD` points at `usr/alvaro-de-jodra/tech-stack-v7`. The driver named `origin/main`, so that resolution was not used |
| Working tree | clean (no staged, unstaged or untracked files) before and after validation |
| Changed files reviewed | 15 (11 added, 4 modified) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/service.py` | modified | T011: `_INSERT_MEMBER_REMOVED_SQL`, `rename`, `remove_member`, `retire`, the three names in `__all__`, the module docstring citations. No S3 line changed apart from the docstring and `__all__` |
| `tests/integration/test_universe_maintenance.py` | added | T002 to T008, T010 |
| `tests/unit/test_universe_sql_safety.py` | modified | T009: one import line and a block appended after S2's cases; no S2 line changed or removed (`git diff` shows additions only) |
| `docs/.../stories/CAP-002-E1-S4-tasks.md` | modified | T001 to T014 checkboxes only (`git diff --word-diff` shows `[ ]` to `[x]` and nothing else) |
| `docs/.../stories/CAP-002-E1-S4.md` | modified | `status: planning` to `in-review` (T012). The content revision is unchanged and still equals the approval's `reviewed_revision` |
| `docs/.../stories/CAP-002-E1-S4-tdd-evidence.yaml` | added | T014 |
| `docs/.../stories/CAP-002-E1-S4-evidence/cycle-{1,2,3}.patch` | added | T014 `reviewed_patch`; SHA-256 values match each cycle's `diff_sha256` |
| `docs/.../stories/CAP-002-E1-S4-evidence/red-cycle-{1,2,3}-*.log` | added | T014 `red_log` |
| `docs/.../stories/CAP-002-E1-S4-evidence/mutation-cycle-{1,2,3}-results.json` | added | T014 `mutation.results` |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `service.py:rename` (276-289), `remove_member` (292-318), `retire` (321-327); `add_members` is S3's | `test_rename_keeps_identity_history_and_memberships`, `test_a_removed_member_keeps_both_events_in_history`, `test_retire_appends_one_retired_event_and_data_stays_readable` | Each write appends one event through the service; no direct store edit is needed. Renaming leaves the earlier event rows identical (full-tuple comparison) |
| AC-5 | SATISFIED | `remove_member`: `len(universe.members) == 1` raises `LastMember` after the membership check | `test_removing_the_sole_member_raises_last_member_offering_retirement`, `test_the_last_member_rule_applies_to_the_current_membership`, `test_a_re_added_member_counts_towards_the_current_membership`, `test_the_sole_member_is_protected_whatever_its_instrument_lifecycle` | Correct single-threaded. Under concurrency it rests on the lock coming first, which no test pins (IR-001) |
| AC-6 | SATISFIED | `remove_member` and `retire` only `INSERT`; replay of `membership_as_of.sql` is S2's | `test_a_removed_member_keeps_both_events_in_history`, `test_retire_appends_one_retired_event_and_data_stays_readable`; past-date replay is S2's `test_universe_as_of.py` | Both membership events remain, and the stock is absent from current members. The as-of read in this file is same-day only (IR-003) |
| DAC-E1-4 | SATISFIED | `rename`: `_name_in_use(conn, new_name, excluding=universe_id)` after `_normalise_name` | `test_rename_to_an_active_name_is_refused_after_trimming`, `test_the_rename_comparison_is_exact_after_trimming`, `test_a_retired_universes_name_is_reusable_by_rename`, `test_a_universe_may_take_back_a_name_it_held_earlier`, `test_renaming_to_its_own_name_appends_one_renamed_event` | The own-name case follows DEC-0096, which the owner has upheld |
| DAC-E1-7 | SATISFIED | `LastMember` message `"...; retire the universe instead"`; `retire` appends one `retired` event; `_require_active` refuses every later write | `test_removing_the_sole_member_raises_last_member_offering_retirement`, `test_retire_appends_one_retired_event_and_data_stays_readable`, `test_every_write_to_a_retired_universe_raises_universe_retired` | Single-threaded refusal is proven. The lock-order gap is IR-001 |
| DAC-E1-10 | SATISFIED | `service.py` holds no `UPDATE`/`DELETE`; the new constant is `INSERT` only | S1's `test_research_sql_is_append_only.py` and S2's scan, unedited and passing; T009's appended cases | Whole-tree scan reran green |
| DAC-E1-S4-1 | SATISFIED | `rename` appends one `renamed` event and returns `get_universe` | `test_rename_keeps_identity_history_and_memberships` | Same `universe_id`, members (with `member_since`), origin and `created_at`. The `universe` row and its count are unchanged, and one row is appended with `instrument_id`/`filter_provenance` null |
| DAC-E1-S4-2 | SATISFIED | as AC-5 | `test_removing_the_sole_member_raises_last_member_offering_retirement` | Asserts `"retire" in str(exc)`, that the event count is unchanged, that the member is still listed, and that the offered retirement then succeeds |
| DAC-E1-S4-3 | SATISFIED | `_INSERT_MEMBER_REMOVED_SQL` | `test_a_removed_member_keeps_both_events_in_history` | `member_added` precedes `member_removed`, the earlier rows are identical, and the member is absent. A second universe keeps the stock, and a re-add appends a third event |
| DAC-E1-S4-4 | SATISFIED | `retire` | `test_retire_appends_one_retired_event_and_data_stays_readable` | `lifecycle == "retired"`, and `retired_at` equals the event's `recorded_at`. Members are unchanged, and the events and the retired listing are readable |
| DAC-E1-S4-5 | SATISFIED | `_require_active` is called in all three new writes before any other replay check | `test_every_write_to_a_retired_universe_raises_universe_retired` | All four writes are tested, nothing is written, and reads still work. The check order against `NotAMember` and `UniverseNameInUse` is pinned |
| DAC-E1-S4-6 | SATISFIED | `remove_member`: `NotAMember` naming the normalised symbol | `test_removing_a_non_member_raises_not_a_member_and_writes_nothing` and the five TC-COMP-026 edge tests | Covers an uncovered symbol, lower-case input, an already-removed member, the one-member universe and an unknown universe. The shape-vs-target order is unpinned (IR-002) |
| DAC-E1-S4-7 | SATISFIED | `_INSERT_MEMBER_REMOVED_SQL`: named placeholders, `INSERT` only | `test_the_service_holds_the_maintenance_insert_beside_s3s_statements`, `test_the_maintenance_functions_issue_no_mutation_and_no_built_statement`, `test_the_maintenance_functions_only_lock_or_append_events`, `test_the_maintenance_scan_fires` | The detection check fires on synthetic `DELETE`, f-string, `.format` and `%` sources |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1, S2 and S3 producers present at the base; the story's functions and test file absent at the base | Confirmed by `git show origin/main:src/factorflow/universes/service.py` lacking the three functions, and by the imports resolving |
| T002 | complete | VERIFIED | `test_rename_keeps_identity_history_and_memberships` | Every assertion the plan lists is present |
| T003 | complete | VERIFIED | Six TC-COMP-023 rename-half tests | Covers (a) to (f), including the 10 000-character name. Its blank-name test is WEAK (IR-002) |
| T004 | complete | VERIFIED | Seven TC-COMP-026 tests | Covers (a) to (g). The malformed-symbol and unknown-universe tests do not pin the shape-before-target order (IR-002) |
| T005 | complete | VERIFIED | Four TC-COMP-036 tests | Covers (a) to (e); (e), retirement after `LastMember`, is inside test (a) |
| T006 | complete | VERIFIED | `test_a_removed_member_keeps_both_events_in_history` | `removed_at` is timezone-aware and equals the row's `recorded_at`; AC-3 cross-universe; re-add |
| T007 | complete | VERIFIED | `test_retire_appends_one_retired_event_and_data_stays_readable` | See IR-003 for the as-of assertion |
| T008 | complete | VERIFIED | `test_every_write_to_a_retired_universe_raises_universe_retired` | All four writes; check order; reads after each refusal; coverage before target for `add_members` |
| T009 | complete | VERIFIED | Four test functions appended to `tests/unit/test_universe_sql_safety.py` | (a) to (d) as planned; no S2 line edited |
| T010 | complete | PARTIAL | (a) to (g) present in `test_universe_maintenance.py` | (a) states that it proves "the lock is its first statement". It proves only that each write waits on the lock before inserting, and three non-equivalent mutants survive it (IR-001). (b) to (g) are verified |
| T011 | complete | VERIFIED | `service.py` 65-68, 276-327, `__all__` | Matches the plan line by line: the lock first, then the shape check, `_require_active`, the name or membership check, one `INSERT`, and `get_universe`. No `replay.*` call; no S3 helper changed |
| T012 | complete | VERIFIED | The three scans reran green | `git status` lists the planned files plus `CAP-002-E1-S4-evidence/`, which T014's `reviewed_patch`, `red_log` and mutation results require |
| T013 | complete | VERIFIED | Every Validation Plan command reran green (below) | |
| T014 | complete | VERIFIED | `CAP-002-E1-S4-tdd-evidence.yaml`, three cycles | The lint is clean with `--require-logs`, and the patch hashes match `diff_sha256`. The plan suggested four cycles; the coder ran three and recorded why (retire moved into cycle 1 because T003(c) needs it). Cycle 3's RED is an injected and reverted break, as the plan allows |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_rename_keeps_identity_history_and_memberships` / TC-COMP-025 | ADEQUATE | Full-tuple equality of the earlier events, the new row's columns, the `universe` row, the replayed fields, events newest first, and a second rename | none |
| Rename-half tests / TC-COMP-023 | WEAK | Name in use after trimming, exact comparison, retired-name reuse, an earlier name taken back, own name (DEC-0096), long name | `test_rename_to_a_blank_name_is_a_shape_failure` uses only a known, active universe, so `review:rename-target-before-shape` survives (IR-002) |
| TC-COMP-026 tests | WEAK | Typed `LookupError`, nothing written, a symbol without an instrument, normalised message, an already-removed member, `NotAMember` before `LastMember`, unknown universe | The malformed-symbol and unknown-universe tests never combine the two, so `review:remove-target-before-shape` survives (IR-002) |
| TC-COMP-036 tests | ADEQUATE | `ValueError` subtype, `"retire"` in the message, nothing written, the member still listed; current-membership replay after remove and re-add; lifecycle ignored; retirement then succeeds | Concurrency is IR-001 |
| `test_a_removed_member_keeps_both_events_in_history` / TC-COMP-053 | ADEQUATE | Event order and ids, the identical prefix, `removed_at` provenance, current members, the events page, the second universe, re-add | none |
| `test_retire_appends_one_retired_event_and_data_stays_readable` / TC-COMP-037 | ADEQUATE | The new row's columns, `retired_at`, members and name kept, events page, `as_of_before_creation`, lifecycle listings | The as-of read is same-day only (IR-003, LOW) |
| `test_every_write_to_a_retired_universe_raises_universe_retired` / TC-COMP-038 | ADEQUATE | Six refusals, each followed by a count check and a read check; order against `NotAMember` and `UniverseNameInUse`; coverage before target | Concurrency is IR-001 |
| TC-COMP-054 appended cases | ADEQUATE | The constant set, the append-only predicate, named placeholders, AST checks of the three functions, the exact executed-constant multiset, the detection check | none |
| `test_each_maintenance_write_waits_on_the_write_lock[rename,remove_member,retire]` (T010(a)) | WEAK | `pg_locks` shows a waiter, and no result arrives before the holder commits; then done and the event exists | Passes when the lock is taken after the replay checks; `review:{rename,remove,retire}-lock-after-replay` survive (IR-001) |
| `test_a_rename_waiting_on_the_lock_sees_a_create_that_took_the_name` (T010(b)) | ADEQUATE | B blocks, A creates the name under the re-entrant lock, and B raises `UniverseNameInUse` with one active holder | Kills `manual:rename-lock-after-name-check` |
| `test_a_failed_event_insert_propagates_and_writes_nothing[*]` (T010(c)) | ADEQUATE | The patched `Cursor.execute` fails only the event `INSERT`; `OperationalError` propagates unchanged; the count is unchanged after rollback | none |
| T010(d) to (g) | ADEQUATE | Event types in id order, `removed_at` equal to the events page's newest, normalisation, removal of a retired instrument | none |

Isolation and determinism: each test runs against its own migrated database (`test_<uuid>`).
The lock tests poll `pg_locks` with a bounded 5-second loop and close every connection in
`finally`. No wall-clock or host-time-zone dependence was found. All tests use the service,
and none inserts a state directly.

### Mutation testing (E.9)

The catalogue was regenerated by
`mutation-run.py generate --range 6a5eca7..HEAD --cycle review`, which produced 4 mutants
(`negate-boolean` 2, `off-by-one` 2). The run added the coder's 21 hand-written mutants from
cycles 1 to 3, rerun independently, and 6 reviewer mutants (`review:*`). The command was:

```
uv sync -q --offline --all-extras --all-groups && uv run --offline pytest -m "postgres or not postgres" tests/unit/test_universe_sql_safety.py tests/unit/test_universe_service_validation.py tests/integration/test_universe_maintenance.py tests/integration/test_universe_create.py -x -q -p no:cacheprovider
```

It ran with `--jobs 4`. All four baselines exited 0 with 144 passed.

| Group | Mutants | Killed | Survived |
|-------|---------|--------|----------|
| Catalogue (`service.py` 304, 307, 317) | 4 | 4 | 0 |
| Coder's manual, rerun | 21 | 21 | 0 |
| Reviewer's manual | 6 | 1 | 5 |
| **Total** | **31** | **26** | **5** |

| Survivor | Change | Equivalent? | Outcome under the mutant (scratch-clone probe) |
|----------|--------|-------------|---------------------------------------|
| `review:remove-lock-after-replay` | `_take_lock` after `_require_active` in `remove_member` | No: design 2.3, "as its first statement, performs its checks by replay"; AC-5 | B removes `AAA` while A, holding the lock, removes `BBB`: B returns `done` and the universe has `[]` members |
| `review:retire-lock-after-replay` | `_take_lock` after `_require_active` in `retire` | No: design 2.3; DAC-E1-S4-5 | A second concurrent retire raises `psycopg.errors.UniqueViolation` (`idx_universe_event_single_retired`) instead of `UniverseRetired` |
| `review:rename-lock-after-replay` | `_take_lock` after `_require_active` in `rename` | No: design 2.3; DAC-E1-S4-5 | A rename waiting on a concurrent retire returns `done`, leaving the events `created, member_added, member_added, retired, renamed` |
| `review:rename-target-before-shape` | `_require_active` before `_normalise_name` | No: design 2.4 step 2 before step 5; plan T011 | `rename(unknown_id, "   ")` raises `UniverseNotFound` instead of `ValueError` |
| `review:remove-target-before-shape` | `_require_active` before `_normalise_symbols` | No: design 2.4 step 2 before step 5; plan T011 | `remove_member(retired_id, "1ABC")` raises `UniverseRetired` instead of a plain `ValueError` |

On the unmutated HEAD, the same probe gives the contracted outcomes: `LastMember` with
`["AAA"]` left, `UniverseRetired` twice with no `renamed` event, and a plain `ValueError`
twice. The probe lived only in a scratch clone at `7db5ae2` and was not added to the reviewed
repository. Results:
`CAP-002-E1-S4-implementation-review-v1-mutation.json` (sha256
`6b17481c49fac24f3cc364de4f580f2f1254e8041e3fd28053bead3f5bcf15c3`).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check ... --stage adversarial-review` | harness root | 0 | PASS | `READY` |
| `uv run --offline pytest -m 'not postgres' tests/unit/test_universe_sql_safety.py tests/unit/test_universe_service_validation.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py -q` | component | 0 | PASS | 109 passed (T011 checkpoint, T012 scans) |
| `uv run --offline pytest -m postgres tests/integration/test_universe_maintenance.py tests/integration/test_universe_create.py -q` | component | 0 | PASS | 70 passed (T011 checkpoint) |
| `uv run --offline pytest -m 'not postgres' -q -p no:cacheprovider` | component | 0 | PASS | 1221 passed, 1 xfailed, 664 deselected. `-p no:cacheprovider` only avoids writing `.pytest_cache`; the selection is the plan's |
| `uv run --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS | 664 passed, 1222 deselected in 473.78s. With the row above this is the full `uv run pytest` (1885 passed, 1 xfailed) |
| `uv run --offline ruff check --no-cache .` | component | 0 | PASS | All checks passed |
| `uv run --offline ruff format --check --no-cache .` | component | 0 | PASS | 248 files already formatted |
| `uv run --offline mypy src` | component | 0 | PASS | No issues in 57 source files (strict) |
| `uv build --offline --out-dir $SCRATCHPAD/build` | component | 0 | PASS | sdist and wheel built into the session scratchpad. `--out-dir` keeps `dist/` out of the repository |
| `uv lock --check --offline` | component | 0 | PASS | Lockfile consistent. Stands in for `uv sync --all-extras`: `pyproject.toml` and `uv.lock` are unchanged, and a sync would only rewrite the ignored `.venv` |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-002-E1-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6a5eca7213a84853d9b0b6d46ee16a65e628d32a --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py run ... --jobs 4` (command above) | harness root | 3 | FAIL | 31 mutants: 26 killed, 5 survived (IR-001, IR-002). Exit 3 reports survivors; all baselines passed |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | component | N/A | NOT RUN | No TypeScript, frontend or `package*.json` file is in the change set, and the plan's Validation Plan names only the Python commands |

The required count of 7 is the plan's six Constitution-Defined Commands (`uv build`, the two
pytest halves, `ruff check`, `ruff format --check`, `mypy src`) plus the TDD-evidence lint.
Every command ran as one plain call outside the sandbox, because the uv cache and Docker
socket need it. None failed for environment reasons.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E1-S4`, HEAD `7db5ae2`, clean tree, `code-revision` `sha256:cd82946ab2996c00174c98751a192776bb517348ba8eed179dc81fb20009ecb6`.
- After: same HEAD, clean tree, same `code-revision` fingerprint. `uv build` rewrote the ignored `src/factorflow.egg-info/`; mutants ran in `--shared` clones under the scratchpad.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | The write-lock tests pass when `rename`, `remove_member` or `retire` reads state before taking the lock; three non-equivalent mutants survive, and the probe shows an emptied universe and a write to a retired one |
| IR-002 | HIGH | initial | OPEN | No test pins design 2.4's shape check (step 2) before the target check (step 5) for `rename` and `remove_member`; two non-equivalent mutants survive |
| IR-003 | LOW | initial | OPEN | TC-COMP-037's as-of read after a retire is same-day, so it cannot show a past membership different from the current one |

### IR-001 — The write-lock tests do not prove the lock precedes the replay checks

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-5, DAC-E1-7, DAC-E1-S4-2, DAC-E1-S4-5
- **Tasks**: T010 (a)
- **Files**: `tests/integration/test_universe_maintenance.py::test_each_maintenance_write_waits_on_the_write_lock` (lines 538-576); `src/factorflow/universes/service.py` `rename` 283-285, `remove_member` 301-303, `retire` 324-325
- **Claim challenged**: T010(a) says the test, which polls `pg_locks` until B waits, proves "the lock is its first statement". Cycle 3's evidence cites it as the write-lock proof.
- **Observed evidence**: the test passes whenever the write blocks on the lock at any point before its `INSERT`. Three mutants move `_take_lock(conn)` after `_require_active` (and, in `remove_member`, after the membership and last-member reads that follow it). All three survive all 144 focused tests: `review:remove-lock-after-replay`, `review:retire-lock-after-replay` and `review:rename-lock-after-replay`. The scratch-clone probe shows the wrong outcomes. Under the mutant, two concurrent `remove_member` calls on a two-member universe both succeed and leave zero members. A second concurrent `retire` raises the database's `UniqueViolation`, not `UniverseRetired`. A `rename` that waited on a concurrent `retire` appends `renamed` to the retired universe. Only `rename` has a serialisation test (T010(b)), and that test covers the name check, not the target or membership check.
- **Expected evidence/behavior**: design 2.3 says every write "takes `SELECT pg_advisory_xact_lock(%s)` ... as its first statement, performs its checks by replay". DEC-0065 (4) adds "so two writes cannot both pass the check". Design 2.4 makes the last-member check "a replay of current membership after the proposed removal". AC-5 and DAC-E1-S4-5 require the refusals that the mutants lose.
- **Impact**: the production code is correct today. Nothing in the suite would catch a refactor that reads state before the lock, and S5 adds another write to this module (Other Notes: "keep the lock as the first statement of every write"). With one owner-operator such a regression would rarely contend (design 3). When it did, it would leave an empty universe or write to a retired one: the data-integrity outcomes these rules exist to prevent.
- **Required remediation**: add tests that fail when `remove_member`, `retire` or `rename` performs its replay checks before taking the write lock. For each, the test should show that a change committed by the lock holder while the call waits is seen by that call's checks. The three `review:*-lock-after-replay` mutants in `CAP-002-E1-S4-implementation-review-v1-mutation.json` must then be killed. Production code needs no change.

### IR-002 — The shape-before-target check order is unpinned for `rename` and `remove_member`

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-4, DAC-E1-S4-6 (shape refusals on the rename and remove paths)
- **Tasks**: T003 (f), T004 (e), (g)
- **Files**: `tests/integration/test_universe_maintenance.py::test_rename_to_a_blank_name_is_a_shape_failure` (176-187), `::test_a_malformed_symbol_is_a_shape_failure_not_a_non_member` (364-377), `::test_removing_from_an_unknown_universe_is_refused` (392-395), `::test_rename_of_an_unknown_universe_is_refused` (199-201); `service.py` 284-285, 302-303
- **Claim challenged**: the TC-COMP-023 and TC-COMP-026 tests pin the refusals of `rename` and `remove_member`, including that a malformed input is "`ValueError` (not `NotAMember`)".
- **Observed evidence**: every shape-failure test uses a known, active universe. Every unknown-universe test uses a well-formed name or symbol. Swapping `_require_active` ahead of the shape check survives the focused suites: `review:rename-target-before-shape` and `review:remove-target-before-shape`. Under the mutant, the probe shows `rename(unknown_id, "   ")` raising `UniverseNotFound`, and `remove_member(retired_id, "1ABC")` raising `UniverseRetired`. On HEAD both raise a plain `ValueError`.
- **Expected evidence/behavior**: design 2.4 gives "one shape for all six operations, with the checks in the order that makes each refusal name exactly one cause". Step 2 (normalise symbols, trim the name: `ValueError`, 422) precedes step 5 (target exists and is active: `UniverseNotFound` 404, `UniverseRetired` 409). Plan T011 tags `_normalise_name` "(step 2)" and `_require_active` "(step 5)".
- **Impact**: the API validates names and symbols before the service (design 2.3), so through HTTP the difference is reachable only by a direct caller. A reordering would still change the refusal code the design assigns, and no test would notice. The small reach goes here, under Impact, and does not lower the severity (E.9).
- **Required remediation**: add tests, for each of `rename` and `remove_member`, that combine a shape failure with an unknown or retired target and expect the shape `ValueError` (not `UniverseNotFound` or `UniverseRetired`). The two `review:*-target-before-shape` mutants must then be killed.

### IR-003 — TC-COMP-037's as-of read cannot show a past membership different from today's

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-6, DAC-E1-S4-4
- **Tasks**: T007
- **Files**: `tests/integration/test_universe_maintenance.py::test_retire_appends_one_retired_event_and_data_stays_readable` (246-250)
- **Claim challenged**: T007 says `get_universe(..., as_of=<creation day>)` "still replays the creation-day membership (history stays readable)".
- **Observed evidence**: creation, the removal of `BBB` and the retire all fall on one `recorded_on`. Under the end-of-day rule (DEC-0065), the creation-day membership is therefore `["AAA"]`, the same as the current membership. The assertion would pass even if the as-of argument were ignored after a retire.
- **Expected evidence/behavior**: AC-6 says the user can see "which stocks belonged to a universe on any past date". S2's `test_universe_as_of.py` already carries the past-date replay. The plan prefers service-built states over direct inserts, so this stays a non-blocking evidence-quality point.
- **Impact**: none on behaviour. The test's history claim after a retire is weaker than its wording.
- **Required remediation**: optional. Either reword the T007 assertion's claim, or, where it is cheap without direct inserts, assert an as-of membership that differs from the current one after `retire`.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Cycle structure (T014)**: three cycles instead of the suggested four. Retire moved into
  cycle 1 because T003(c) needs it, and the full TC-COMP-037 test moved to cycle 2. The
  evidence file records both. Justified.
- **Evidence directory**: T012's expected `git status` omits `CAP-002-E1-S4-evidence/`. Its
  patches, RED logs and mutation results are what T014 and the TDD-evidence contract require.
  Justified.
- **`__all__`**: the three new functions are added, as T011 instructs ("add them to `__all__`
  if S3 defined one"). S3's `__all__` lists the re-exported types and exceptions but none of
  S3's own five functions, so the list is now a partial inventory of the public functions.
  This follows the plan and is not a finding.
- **Review base**: the driver supplied `origin/main`. The default `review-base` resolution
  would have used the clone's `origin/HEAD`, which points at a stale tech-stack branch.
- No unjustified production, dependency or configuration change. No S2 line in
  `test_universe_sql_safety.py` and no S3 helper in `service.py` was altered.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of `CAP-002-E1-S4-tasks.md` against this report)
- **Required action**: resolve IR-001 and IR-002 by adding tests that kill the five `review:*` survivors recorded in `CAP-002-E1-S4-implementation-review-v1-mutation.json`; IR-003 is optional. Production code needs no change. Then rerun `$adversarial-review`, which will use this report and its mutation results as its baseline.
- **Warnings accepted downstream**: N/A
