---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E1-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-31T02:45:12Z"
reviewed_head: "a44bd918cf49aa0df74a0f6fc0105c5a79b6fc8f"
review_base: "6a5eca7213a84853d9b0b6d46ee16a65e628d32a"
reviewed_state_revision: "sha256:21afdaccb867f89c519a5c8c020923ecb6470d776c8a9c15c54909de9644c008"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-31T03:05:00Z
  source_artifacts:
    - id: CAP-002-E1-S4
      version: "1 (sha256:1b10daa0e2c8c9f7d0903de0b98b2c866d9e705b543cfad79eadc9c79cd4b522)"
    - id: CAP-002-E1-S4-tasks
      version: "1 (sha256:6e917c38dc1ca304b0c04fe83c45a7a60464ca611c725672a4815ebc16e1bb82)"
    - id: CAP-002-E1-S4-tdd-evidence
      version: "cycles 1 to 4"
    - id: CAP-002-E1-S4-implementation-review
      version: "1 (baseline, reviewed_head 7db5ae220e9ae46fa76859b4cef9885bbb00e800)"
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

# Implementation Review: CAP-002-E1-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 8/8 passed |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0 · **total 1**

This is a re-review, run unattended by a `pipeline-run` driver after the rework commit
`a44bd91`. Its baseline is v1 (CHANGES-REQUIRED, `reviewed_head` `7db5ae2`). The rework
changed tests and evidence only: `git diff 7db5ae2 HEAD -- src/` is empty, so `service.py`
is byte-identical to what v1 reviewed.

All three v1 findings are resolved, on current evidence:

- **v1/IR-001 (HIGH), resolved.** `test_a_write_waiting_on_the_lock_checks_what_the_holder_committed`,
  run for `remove_member`, `rename` and `retire`, holds the write lock on a second session.
  While the write waits, the holder commits a change, and the test requires the write to
  refuse on that committed state. All three `review:*-lock-after-replay` mutants are now
  killed by this test, and the failure messages show the outcomes v1 predicted: a `done`
  removal, a `done` rename, and `UniqueViolation` in place of `UniverseRetired`.
- **v1/IR-002 (HIGH), resolved.** Two new tests,
  `test_a_blank_rename_is_a_shape_failure_before_the_target_check` and
  `test_a_malformed_symbol_is_a_shape_failure_before_the_target_check`, each run against
  an unknown and a retired universe. Both require exactly `ValueError` and no event
  written. Both `review:*-target-before-shape` mutants are killed.
- **v1/IR-003 (LOW), resolved by rewording.** TC-COMP-037's as-of assertion now carries a
  comment that states its real reach: an as-of read still replays after retire. The comment
  points to S2's `test_universe_as_of.py` for differing past dates.

The review reran all 31 baseline mutants and the regenerated catalogue, and added 4
mutants of its own: 35 in all, 35 killed. Every required command passes: 1221 passed and
1 xfailed outside PostgreSQL, 671 passed under it. Lint, format, strict mypy, the build and
the TDD-evidence lint are all clean.

One MEDIUM finding remains: **IR-001**. The rework cycle's evidence records a
`code_review_verdict` and a `spec_drift` verdict from the coder's own self-review. T014
requires independent subagents. The cycle discloses the substitution, and the cycle is
test-only. CONST-REV's definition of independence and the CAP-001-E5-S2 v1 precedent both
make it non-blocking. The story proceeds to Doc Sync.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, the run-local clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S4` |
| HEAD | `a44bd918cf49aa0df74a0f6fc0105c5a79b6fc8f`. Three commits over the base: `7db5ae2` story-coding, `d137e54` review v1, and `a44bd91` the rework (test-only; `Decision-Id: DEC-0096`) |
| Review base | `origin/main` = `6a5eca7213a84853d9b0b6d46ee16a65e628d32a`, resolved by `pipeline-state.py review-base --base-ref origin/main`. It is an ancestor of HEAD and the merge base. The clone's `origin/HEAD` is stale, so it was not used |
| Working tree | Clean (no staged, unstaged or untracked files) before validation, and clean after it until this report was written |
| Changed files reviewed | 22 over the base (18 added, 4 modified); 10 of them changed since the baseline |
| Baseline | v1 (`CAP-002-E1-S4-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `7db5ae220e9ae46fa76859b4cef9885bbb00e800`, with `-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/service.py` | modified | T011. Unchanged since the baseline |
| `tests/integration/test_universe_maintenance.py` | added | T002 to T008, T010. Since the baseline it gains the IR-001 and IR-002 tests, the TC-COMP-037 comment and a corrected T010(a) docstring (130 lines, all additions apart from the docstring) |
| `tests/unit/test_universe_sql_safety.py` | modified | T009. Unchanged since the baseline; still additions only over the base |
| `docs/.../stories/CAP-002-E1-S4-tasks.md` | modified | T001 to T014 checkboxes; since the baseline only `updated` and `last_reworked_review: CAP-002-E1-S4-implementation-review-v1.md` (story-coding G, review-rework handoff) |
| `docs/.../stories/CAP-002-E1-S4.md` | modified | `status: in-review` (story-coding G). The content revision still equals the approval's `reviewed_revision` |
| `docs/.../stories/CAP-002-E1-S4-tdd-evidence.yaml` | added | T014. Since the baseline it gains `cycle-4` and the header's decision note |
| `docs/.../stories/CAP-002-E1-S4-evidence/cycle-{1,2,3,4}.patch` | added | T014 `reviewed_patch`. The `cycle-4.patch` SHA-256 equals its `diff_sha256` (`5d80e641...`), and its test-file hunks are line-for-line the committed `7db5ae2..HEAD` diff |
| `docs/.../stories/CAP-002-E1-S4-evidence/red-cycle-{1..4}*.log` | added | T014 `red_log`; hashes match |
| `docs/.../stories/CAP-002-E1-S4-evidence/green-cycle-4-{not-postgres,postgres}.log` | added | T014 cycle-4 `logs`; hashes match |
| `docs/.../stories/CAP-002-E1-S4-evidence/mutation-cycle-{1..4}-results.json` | added | T014 `mutation.results`; hashes match |
| `docs/.../stories/CAP-002-E1-S4-implementation-review-v1.md`, `-v1-mutation.json` | added | The v1 gate report and its results (this skill's I.4 and I.5 output) |

## Acceptance Criteria Verification

Production is unchanged since v1, so this table re-derives each criterion from the same code.
It cites the tests that now pin the behaviour, the rework's additions included.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `service.py:rename` (276-289), `remove_member` (292-318), `retire` (321-327) | `test_rename_keeps_identity_history_and_memberships`, `test_a_removed_member_keeps_both_events_in_history`, `test_retire_appends_one_retired_event_and_data_stays_readable` | Each write appends exactly one event through the service. The rows of earlier events stay identical (full-tuple comparison) |
| AC-5 | SATISFIED | `remove_member`: lock at 301, then `_require_active` at 303. The membership check comes before `len(universe.members) == 1` raises `LastMember` | The four TC-COMP-036 tests and `test_a_write_waiting_on_the_lock_checks_what_the_holder_committed[remove_member]` | The concurrent case is now pinned. A removal waiting on the lock sees the holder's removal and raises `LastMember`, and `BBB` remains |
| AC-6 | SATISFIED | `remove_member` and `retire` only `INSERT`; replay is S2's | `test_a_removed_member_keeps_both_events_in_history`, `test_retire_appends_one_retired_event_and_data_stays_readable`; past-date replay in S2's `test_universe_as_of.py` | Both membership events remain. The same-day reach of the as-of read is now stated in the test (v1/IR-003) |
| DAC-E1-4 | SATISFIED | `rename`: `_normalise_name` (284), then `_name_in_use(conn, new_name, excluding=universe_id)` (286) | The six TC-COMP-023 rename-half tests, `test_a_blank_rename_is_a_shape_failure_before_the_target_check[unknown,retired]`, `test_a_rename_waiting_on_the_lock_sees_a_create_that_took_the_name` | The own-name case follows DEC-0096. The shape refusal now precedes the target refusal under test |
| DAC-E1-7 | SATISFIED | `LastMember` message `"...; retire the universe instead"`; `retire` appends one `retired` event; `_require_active` refuses every later write | `test_removing_the_sole_member_raises_last_member_offering_retirement`, `test_retire_appends_one_retired_event_and_data_stays_readable`, `test_every_write_to_a_retired_universe_raises_universe_retired`, the `[rename]` and `[retire]` race tests | The refusal holds under concurrency: a write waiting on a concurrent retire raises exactly `UniverseRetired` |
| DAC-E1-10 | SATISFIED | `service.py` holds no `UPDATE`/`DELETE`; `_INSERT_MEMBER_REMOVED_SQL` is `INSERT` only | S1's `test_research_sql_is_append_only.py` and S2's scan, both unedited; T009's appended cases | Rerun green (109 passed in the four scan modules) |
| DAC-E1-S4-1 | SATISFIED | `rename` appends one `renamed` event and returns `get_universe` | `test_rename_keeps_identity_history_and_memberships` | Same id, members, origin and `created_at`. The `universe` row is unchanged, and exactly one row is appended |
| DAC-E1-S4-2 | SATISFIED | as AC-5 | `test_removing_the_sole_member_raises_last_member_offering_retirement`, the `[remove_member]` race test | `"retire" in str(exc)`, nothing written, member still listed, retire then succeeds |
| DAC-E1-S4-3 | SATISFIED | `_INSERT_MEMBER_REMOVED_SQL` | `test_a_removed_member_keeps_both_events_in_history` | `member_added` is followed by `member_removed`, and the member is absent from current members. A second universe keeps the stock, and a re-add appends a third event |
| DAC-E1-S4-4 | SATISFIED | `retire` | `test_retire_appends_one_retired_event_and_data_stays_readable` | `lifecycle == "retired"`, and `retired_at` equals the event's `recorded_at`. Members are unchanged, and the events and the retired listing are readable |
| DAC-E1-S4-5 | SATISFIED | `_require_active` follows the lock in all three writes | `test_every_write_to_a_retired_universe_raises_universe_retired`, the `[rename]` and `[retire]` race tests | All four writes are refused when single-threaded, and now also when concurrent with a retire |
| DAC-E1-S4-6 | SATISFIED | `remove_member`: `NotAMember` naming the normalised symbol | The seven TC-COMP-026 tests and `test_a_malformed_symbol_is_a_shape_failure_before_the_target_check[unknown,retired]` | A malformed symbol is a plain `ValueError` even against an unknown or retired universe (design 2.4 step 2 before step 5) |
| DAC-E1-S4-7 | SATISFIED | `_INSERT_MEMBER_REMOVED_SQL`: named placeholders, `INSERT` only | The four TC-COMP-054 cases in `test_universe_sql_safety.py` | The detection check fires on synthetic `DELETE`, f-string, `.format` and `%` sources |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1, S2 and S3 producers are present at the base; this story's functions are absent there | Unchanged since v1 |
| T002 | complete | VERIFIED | `test_rename_keeps_identity_history_and_memberships` (54) | Unchanged since v1 |
| T003 | complete | VERIFIED | The six rename-half tests (99-187, 216) plus `test_a_blank_rename_is_a_shape_failure_before_the_target_check` (201) | (a) to (f), with the shape-before-target order now pinned (v1/IR-002) |
| T004 | complete | VERIFIED | The seven TC-COMP-026 tests (335-440) plus `test_a_malformed_symbol_is_a_shape_failure_before_the_target_check` (410) | (a) to (g), with the shape-before-target order now pinned (v1/IR-002) |
| T005 | complete | VERIFIED | The four TC-COMP-036 tests (446-515) | Unchanged since v1 |
| T006 | complete | VERIFIED | `test_a_removed_member_keeps_both_events_in_history` (521) | Unchanged since v1 |
| T007 | complete | VERIFIED | `test_retire_appends_one_retired_event_and_data_stays_readable` (238) | The as-of assertion's claim now matches its reach (comment at 273-275) |
| T008 | complete | VERIFIED | `test_every_write_to_a_retired_universe_raises_universe_retired` (291) | Unchanged since v1 |
| T009 | complete | VERIFIED | Four test functions appended to `tests/unit/test_universe_sql_safety.py` (325-369) | Unchanged since v1; no S2 line edited |
| T010 | complete | VERIFIED | (a) `test_each_maintenance_write_waits_on_the_write_lock` (584) together with `test_a_write_waiting_on_the_lock_checks_what_the_holder_committed` (702); (b) to (g) as in v1 | v1 marked this PARTIAL because (a) did not prove the lock comes first. The new test proves it for all three writes and kills the three lock-order mutants. (a)'s docstring now claims only what it proves |
| T011 | complete | VERIFIED | `service.py` 65-68, 276-327, `__all__` | Byte-identical to v1's review: lock, then shape, then `_require_active`, then the name or membership check, one `INSERT`, and `get_universe` |
| T012 | complete | VERIFIED | The three scans reran green | The changed paths are the planned files plus the evidence directory and the v1 report, which T014 and this skill require |
| T013 | complete | VERIFIED | Every Validation Plan command reran green (below) | |
| T014 | complete | VERIFIED | `CAP-002-E1-S4-tdd-evidence.yaml`, four cycles; lint clean with `--require-logs`; every hash reproduces | Cycle 4's RED is the five baseline survivors, each failing the intended new test (`red-cycle-4.log`). Its two review verdicts come from the coder's disclosed self-review, not from the independent subagents T014 names (IR-001, MEDIUM) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_rename_keeps_identity_history_and_memberships` / TC-COMP-025 | ADEQUATE | Full-tuple equality of the earlier events, the new row's columns, the `universe` row, the replayed fields, events newest first, and a second rename | none |
| Rename-half tests / TC-COMP-023 | ADEQUATE | Name in use after trimming, exact comparison, retired-name reuse, an earlier name taken back, own name (DEC-0096), long name, blank names. The new test adds blank names on an unknown and a retired universe | none. `review:rename-target-before-shape` killed (`[unknown]` fails with `UniverseNotFound`) |
| TC-COMP-026 tests | ADEQUATE | Typed `LookupError`, nothing written, a symbol without an instrument, normalised message, an already-removed member, `NotAMember` before `LastMember`, unknown universe. The new test adds a malformed symbol on an unknown and a retired universe | none. `review:remove-target-before-shape` killed |
| TC-COMP-036 tests | ADEQUATE | `ValueError` subtype, `"retire"` in the message, nothing written, member still listed; current-membership replay; lifecycle ignored; retirement then succeeds | none |
| `test_a_removed_member_keeps_both_events_in_history` / TC-COMP-053 | ADEQUATE | Event order and ids, identical prefix, `removed_at` provenance, current members, events page, second universe, re-add | none |
| `test_retire_appends_one_retired_event_and_data_stays_readable` / TC-COMP-037 | ADEQUATE | The new row's columns, `retired_at`, members and name kept, events page, as-of replay after retire, `as_of_before_creation`, lifecycle listings | none. The same-day reach is now stated, and differing past dates are S2's |
| `test_every_write_to_a_retired_universe_raises_universe_retired` / TC-COMP-038 | ADEQUATE | Six refusals, each followed by a count check and a read check; order against `NotAMember` and `UniverseNameInUse`; coverage before target | none |
| TC-COMP-054 appended cases | ADEQUATE | Constant set, append-only predicate, named placeholders, AST checks, executed-constant multiset, detection check | none |
| `test_each_maintenance_write_waits_on_the_write_lock[*]` (T010(a)) | ADEQUATE | `pg_locks` shows a waiter; no result arrives before the holder commits; then the write completes and its event exists | Proves the write waits before writing, and its docstring now claims only that. The lock-before-checks order is the next row |
| `test_a_write_waiting_on_the_lock_checks_what_the_holder_committed[remove_member,rename,retire]` (rework, IR-001) | ADEQUATE | B waits on the lock, which `pg_locks` confirms. A, re-entrant in the same session, commits a removal, a retire or a retire. B must raise exactly `LastMember`, `UniverseRetired` or `UniverseRetired`. The log must hold only the holder's event, and for removal `BBB` must remain. The test uses `type(...) is`, so neither `UniqueViolation` nor a `ValueError` parent can pass | none. Kills the three `review:*-lock-after-replay` mutants. Deterministic: bounded waits, a thread join with timeout, every connection closed in `finally`, one session-scoped container per pytest process |
| `test_a_rename_waiting_on_the_lock_sees_a_create_that_took_the_name` (T010(b)) | ADEQUATE | Rename/create serialisation | none |
| `test_a_failed_event_insert_propagates_and_writes_nothing[*]` (T010(c)) | ADEQUATE | `OperationalError` on the event `INSERT` propagates unchanged; the count is unchanged after rollback | none |
| T010(d) to (g) | ADEQUATE | Event types in id order, `removed_at` equal to the events page's newest, normalisation, removal of a retired instrument | none |

Isolation and determinism: each test runs against its own migrated database inside one
session-scoped container. The suite is not parallelised within a process, so the
cluster-wide `pg_locks` count sees only that test's waiter. No wall-clock or host-time-zone
dependence was found.

### Mutation testing (E.9)

`mutation-run.py generate --range 6a5eca7..HEAD --cycle review` produced 4 catalogue
mutants (`negate-boolean` 2, `off-by-one` 2). The review added 4 manual mutants of its own
(`review-v2:*`). `mutation-run.py scope --since 7db5ae2 --previous <v1 -mutation.json>`
then added the baseline's 27 manual mutants. The total was 35: 31 tagged `carried` (the
baseline ran them) and 4 tagged `late` (the reviewer's new mutants, on production lines
unchanged since the baseline). No baseline mutant had stopped applying. The run used
`--jobs 4` and the baseline's focused command:

```
uv sync -q --offline --all-extras --all-groups && uv run --offline pytest -m "postgres or not postgres" tests/unit/test_universe_sql_safety.py tests/unit/test_universe_service_validation.py tests/integration/test_universe_maintenance.py tests/integration/test_universe_create.py -x -q -p no:cacheprovider
```

All four baselines exited 0 with 151 passed.

| Group | Scope | Mutants | Killed | Survived |
|-------|-------|---------|--------|----------|
| Catalogue (`service.py` 304, 307, 317) | carried | 4 | 4 | 0 |
| Coder's manual (cycles 1 to 3) | carried | 21 | 21 | 0 |
| v1 reviewer's `review:*` (including the 5 v1 survivors) | carried | 6 | 6 | 0 |
| v2 reviewer's `review-v2:*` | late | 4 | 4 | 0 |
| **Total** | | **35** | **35** | **0** |

The five v1 survivors are each killed by the test the rework added for it:

| v1 survivor | Killing test (first failure, `-x`) | Failure observed |
|-------------|------------------------------------|------------------|
| `review:remove-lock-after-replay` | `test_a_write_waiting_on_the_lock_checks_what_the_holder_committed[remove_member]` | outcome `['done']`, expected `LastMember` |
| `review:retire-lock-after-replay` | `...[retire]` | outcome `UniqueViolation` (`idx_universe_event_single_retired`), expected `UniverseRetired` |
| `review:rename-lock-after-replay` | `...[rename]` | outcome `['done']`, expected `UniverseRetired` |
| `review:rename-target-before-shape` | `test_a_blank_rename_is_a_shape_failure_before_the_target_check[unknown]` | `UniverseNotFound` raised |
| `review:remove-target-before-shape` | `test_a_malformed_symbol_is_a_shape_failure_before_the_target_check[unknown]` | `UniverseNotFound` raised |

The reviewer's new mutants were `review-v2:rename-replays-before-insert` and
`review-v2:retire-replays-before-insert` (each returns the state read before its own event),
`review-v2:remove-returns-member-since` (returns the wrong datetime), and
`review-v2:remove-not-a-member-names-raw-symbol` (puts the raw symbol in the error). All four
were killed. Results: `CAP-002-E1-S4-implementation-review-v2-mutation.json` (sha256
`a47d2a8fa3a8137671cb82ab12bbfe92f215cfbe9e85395115b14a646a082cd0`).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY`: review changes were reworked; a new review version is required |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `6a5eca7213a84853d9b0b6d46ee16a65e628d32a`; ancestor of HEAD |
| `uv run --directory <component> --offline pytest -m "not postgres" tests/unit/test_universe_sql_safety.py tests/unit/test_universe_service_validation.py tests/unit/test_research_sql_is_append_only.py tests/unit/test_package_data_ships_sql.py -q -p no:cacheprovider` | harness root (`--directory` = component) | 0 | PASS | 109 passed (T011 checkpoint, T012 scans) |
| `uv run --directory <component> --offline pytest -m "not postgres" -q -p no:cacheprovider` | harness root (`--directory` = component) | 0 | PASS | 1221 passed, 1 xfailed, 671 deselected in 27.67s |
| `uv run --directory <component> --offline pytest -m postgres -q -p no:cacheprovider` | harness root (`--directory` = component) | 0 | PASS | 671 passed, 1222 deselected in 246.28s (664 at v1 plus the 7 rework tests). With the row above this is the full `uv run pytest`: 1892 passed, 1 xfailed |
| `uv run --directory <component> --offline ruff check --no-cache .` | harness root (`--directory` = component) | 0 | PASS | All checks passed |
| `uv run --directory <component> --offline ruff format --check --no-cache .` | harness root (`--directory` = component) | 0 | PASS | 248 files already formatted |
| `uv run --directory <component> --offline mypy src` | harness root (`--directory` = component) | 0 | PASS | No issues in 57 source files (strict) |
| `uv build --directory <component> --offline --out-dir <scratchpad>/rv2/build` | harness root | 0 | PASS | sdist and wheel built outside the repository |
| `uv lock --directory <component> --check --offline` | harness root | 0 | PASS | Resolved 46 packages; lockfile consistent (`pyproject.toml` and `uv.lock` unchanged) |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-002-E1-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6a5eca7213a84853d9b0b6d46ee16a65e628d32a --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. Independently, `shasum -a 256` reproduces every cycle-4 hash (patch, RED log, both GREEN logs, mutation results) |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratchpad>/rv2/mutants.json --jobs 4 --command '<focused command above>' --out <scratchpad>/rv2/results.json` | harness root | 0 | PASS | 35 mutants, 35 killed; all baselines passed |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | component | N/A | NOT RUN | No TypeScript, frontend or `package*.json` file is in the change set, and the plan's Validation Plan names only the Python commands |

The 8 required commands are the plan's six Constitution-Defined Commands (`uv build`, both
pytest halves, `ruff check`, `ruff format --check`, `mypy src`), the TDD-evidence lint and
the mutation run (E.9). Every `uv` and mutation command ran as one plain call outside the
sandbox, because the uv cache and the Docker socket need it. None failed for environment
reasons. `<component>` is `repos/factorflow-v2/FactorFlow-v2`; `<scratchpad>` is this
session's scratchpad.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-002-E1-S4`, HEAD `a44bd91`, clean tree, `code-revision` `sha256:21afdaccb867f89c519a5c8c020923ecb6470d776c8a9c15c54909de9644c008`.
- After: same HEAD, clean tree, same `code-revision` fingerprint. `uv build` rewrote the ignored `src/factorflow.egg-info/`. The mutants ran in clones under the scratchpad's `rv2/work`.
- Unexpected tracked-file changes: none. The only new files are this report and its `-mutation.json`, both under `docs/`, which the fingerprint excludes.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | delta | OPEN | The rework cycle's code-review and spec-drift verdicts come from the coder's self-review, not from the independent subagents T014 requires |

### IR-001 — Cycle 4's per-cycle reviews are a self-review, not independent subagents

- **Severity**: MEDIUM
- **Scope**: delta (the `cycle-4` entry was added after the baseline's `reviewed_head`)
- **Status**: OPEN
- **Acceptance criteria**: N/A (T014 traces to no AC)
- **Tasks**: T014
- **Files**: `docs/.../stories/CAP-002-E1-S4-tdd-evidence.yaml` `cycle-4` (`code_review_verdict: APPROVED`, `spec_drift.drift_detected: false`, `green_evidence`)
- **Claim challenged**: cycle 4 records `code_review_verdict: APPROVED` and `drift_detected: false` as its per-cycle reviews.
- **Observed evidence**: `green_evidence` says: "Code review: the coder's self-review against the constitution (no reviewer subagent was available to this unattended stage), no findings; the independent gate is the next adversarial review." No spec-drift reviewer is named. No `exceptions[]` entry and no decision record covers the substitution. Cycles 1 to 3 do not record such a substitution. The lint passes, because it checks that verdicts are present, not who produced them (`check-tdd-evidence.py` header).
- **Expected evidence/behavior**: T014 says to "dispatch an independent code-review subagent and an independent spec-drift subagent against it" after every cycle. INV-TDD-001 and INV-TDD-003 make the per-cycle reviews mandatory. CONST-REV defines an independently verified claim as "one checked against fresh evidence rather than accepted from a prior assertion", which "does not mean a different person must perform the check".
- **Impact**: the cycle is test-only. This review re-derived every claim in it from the repository. The RED is meaningful: each baseline survivor fails the intended new test. The patch reproduces, every hash matches, and all 35 mutants are killed. No defect that the missing reviewers would plausibly have caught survives into the change set. The weakness is evidential, not behavioural. CAP-001-E5-S2 v1 classified the same disclosed substitution as MEDIUM, and this report follows that precedent.
- **Required remediation**: none blocks this story. In a later cycle, either dispatch the independent reviewers T014 names, or record the substitution where the gate can see it: an `exceptions[]` entry acknowledged by the owner, or a decision record under `docs/unattended-mode.md`. Do not leave it only in free text.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — write-lock tests do not prove the lock precedes the replay checks | RESOLVED | `tests/integration/test_universe_maintenance.py::test_a_write_waiting_on_the_lock_checks_what_the_holder_committed[remove_member,rename,retire]` (702-747). Rerun: `review:remove-lock-after-replay`, `review:retire-lock-after-replay` and `review:rename-lock-after-replay` are killed by it, with the outcomes v1's probe predicted (`v2-mutation.json`). The T010(a) docstring no longer overclaims (587-591) |
| v1/IR-002 (HIGH) — shape-before-target order unpinned for `rename` and `remove_member` | RESOLVED | `test_a_blank_rename_is_a_shape_failure_before_the_target_check[unknown,retired]` (201-213) and `test_a_malformed_symbol_is_a_shape_failure_before_the_target_check[unknown,retired]` (410-422). Each requires `type(exc) is ValueError`, the shape message and no event. `review:rename-target-before-shape` and `review:remove-target-before-shape` are killed |
| v1/IR-003 (LOW) — TC-COMP-037's as-of read is same-day | RESOLVED | The remediation offered rewording. The comment at 273-275 now states that the assertion shows replay after retire, not a differing past membership, and names S2's `test_universe_as_of.py` for past dates. The assertion is unchanged and still passes |

## Scope and Plan Deviations

- **Rework scope**: test and evidence only. `git diff 7db5ae2 HEAD -- src/` is empty, as
  v1's remediation ("Production code needs no change") allowed.
- **Cycle 4's RED**: the five baseline survivors, run against the new tests in scratch clones
  (`red-cycle-4.log`), rather than a failing run on the reviewed tree. Production was already
  correct, and the survivors are what the tests must kill, so this is justified.
- **Cycle 4's reviews**: self-review substituted for the independent subagents (IR-001).
- **Cycle structure (T014)**: three planned-work cycles instead of the suggested four, plus
  the rework cycle. v1 already accepted this with the reason recorded.
- **Evidence directory and v1 report**: not in T012's expected `git status`, but required by
  T014 and by this skill. Justified.
- No unjustified production, dependency or configuration change. The S2 lines in
  `test_universe_sql_safety.py` and the S3 helpers in `service.py` are unchanged.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-002-E1-S4)
- **Required action**: run story-scoped doc sync against HEAD `a44bd91`, whose implementation
  state is `reviewed_state_revision`. The driver commits this report and its
  `-mutation.json` before that stage.
- **Warnings accepted downstream**: IR-001
