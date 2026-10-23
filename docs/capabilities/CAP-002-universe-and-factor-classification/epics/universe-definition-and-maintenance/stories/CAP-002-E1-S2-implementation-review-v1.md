---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-23
updated: 2026-10-23
story_id: "CAP-002-E1-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-23T04:26:01Z"
reviewed_head: "89dfe228d4d7608c9df3bb9101d44addfaba192f"
review_base: "98f642f326c8746b9c4ecd581129381937a6e469"
reviewed_state_revision: "sha256:a69716332dea3063a0f7210d04abb8ef99a82078516b8c404bc11004a1cfc15d"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E1-S2
    artifact_version: 1
    content_revision: sha256:c56f3aa4e1780be5392fb5d46b67074a1443d393a264e22960cb648d7f5461d4
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-23T04:26:01Z
  source_artifacts:
    - id: CAP-002-E1-S2
      version: "1 (sha256:c56f3aa4e1780be5392fb5d46b67074a1443d393a264e22960cb648d7f5461d4)"
    - id: CAP-002-E1-S2-tasks
      version: "1 (sha256:ee6eb631ef6dda49764325195543c0744637d8c81a459e13f4c981d863f1774a)"
    - id: CAP-002-E1-S2-tdd-evidence
      version: "1 (cycles 1 to 3)"
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

# Implementation Review: CAP-002-E1-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 2/9 satisfied |
| Planned tasks | 12/13 verified |
| Required validation | 5/5 passed |

The production code reads correctly against the story, the task plan and component design
sections 2.3 and 2.5. `membership_as_of.sql` matches the design block byte for byte, every
statement uses named placeholders and is loaded once at import, nothing writes, and all five
required validation commands pass when rerun independently (908 non-postgres and 320
postgres tests, ruff, ruff format, mypy strict). The TDD evidence lint is clean. Every
catalogue mutant that survived is equivalent, as the coder's evidence claims.

The gate fails on test strength. The reviewer's own mutants found eight non-equivalent
survivors in production files, and each one leaves an acceptance criterion's defining
property without a test that would catch a regression:

- **IR-001.** `current_state(as_of=D)` can return today's members for a past date and
  every test still passes. This is the path CAP-002-E1-S3's `get_universe(as_of)` delegates
  to.
- **IR-002.** In every fixture, `recorded_at`'s UTC date equals `recorded_on` and
  `recorded_at` rises with `event_id`. As a result, replacing the America/Chicago
  `recorded_on` grain, or the `event_id` order, with `recorded_at` goes undetected in the
  membership query, the creation date and the events page. Those are the substitutions
  DEC-0065 exists to forbid.
- **IR-003.** The TC-COMP-117 fixture reverses the planned scenario: the retired stock is
  added after it retired. DAC-E1-9's "already a member" case, the usual AC-15 case, is
  therefore never tested.

Under the skill's rule, a surviving non-equivalent mutant makes the mandatory tests for
TC-COMP-049, -050, -051 and -117 `WEAK`. A `WEAK` mandatory test is at least HIGH.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S2-run-20261023T035034Z` |
| HEAD | `89dfe228d4d7608c9df3bb9101d44addfaba192f` (`story-coding(CAP-002-E1-S2): universe replay read half`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z` = `98f642f326c8746b9c4ecd581129381937a6e469` (resolved with `pipeline-state.py review-base --base-ref`; ancestor of HEAD confirmed with `git merge-base --is-ancestor`) |
| Working tree | clean: no staged, unstaged or untracked files before or after validation |
| Changed files reviewed | 20 (one commit, `98f642f..89dfe22`) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/__init__.py` | added | T001 |
| `src/factorflow/universes/replay.py` | added | T009, T010; AC-6, AC-15, DAC-E1-8, DAC-E1-9, DAC-E1-S2-1 to -5 |
| `src/factorflow/universes/sql/membership_as_of.sql` | added | T007; DAC-E1-8, DAC-E1-S2-1, DAC-E1-9 |
| `src/factorflow/universes/sql/current_state.sql` | added | T008; DAC-E1-S2-2, AC-6 |
| `src/factorflow/universes/sql/events_page.sql` | added | T008; DAC-E1-S2-4 |
| `src/factorflow/universes/sql/list_universes.sql` | added | T008 (DEC-0094) |
| `tests/unit/test_universe_replay.py` | added | T002, T006; TC-COMP-049 (unit tier) |
| `tests/integration/test_universe_as_of.py` | added | T003, T004; TC-COMP-049, -050, -051, -117 |
| `tests/unit/test_universe_sql_safety.py` | added | T005; TC-COMP-052 |
| `docs/.../stories/CAP-002-E1-S2-tasks.md` | modified | T011 permits it: checkboxes T001 to T013 and `updated` date only (word diff confirmed) |
| `docs/.../stories/CAP-002-E1-S2.md` | modified | T011 permits it: `status: planning` changed to `in-review` only |
| `docs/.../stories/CAP-002-E1-S2-tdd-evidence.yaml` | added | T013 |
| `docs/.../stories/CAP-002-E1-S2-evidence/cycle-1.patch` | added | T013 (`reviewed_patch`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/cycle-2.patch` | added | T013 (`reviewed_patch`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/cycle-3.patch` | added | T013 (`reviewed_patch`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/red-cycle-1-pure-replay.log` | added | T013 (`red_log`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/red-cycle-2-sql-reads.log` | added | T013 (`red_log`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/red-cycle-3-sql-safety.log` | added | T013 (`red_log`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/mutation-cycle-1-results.json` | added | T013 (mutation results) |
| `docs/.../stories/CAP-002-E1-S2-evidence/mutation-cycle-2-results.json` | added | T013 (mutation results) |

`docs/...` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-6 | PARTIAL | `replay.py:membership_as_of` (199-206), `current_state` (209-237), `list_events` (240-254); replay from `universe_event` only, no write statement | `test_universe_as_of.py`: differential (118-142), before-creation (160-177), retired universe (197-213), events page (324-376) | The code is correct. However, no test proves that `current_state(as_of=past)` returns that date's members: the manual mutant that passes `row["today"]` survived (IR-001). The replay grain is also unpinned (IR-002). |
| AC-15 | PARTIAL | `membership_as_of.sql` never reads `i.lifecycle` to exclude anything; it only returns it (line 12) | `test_a_retired_instrument_stays_a_member_and_replays_as_retired` (180-194) | The "exclude retired" mutant (manual:14) was killed. A stock that retired after it joined has no test: mutant manual:18 survived (IR-003). |
| DAC-E1-8 | PARTIAL | `membership_as_of.sql:9-10` (`recorded_on <= %(as_of)s`, `DISTINCT ON ... event_id DESC`); `current_state` composes it | differential and same-day tests; `test_current_membership_uses_todays_america_chicago_date` (226-241) | The code is correct. No fixture separates the America/Chicago `recorded_on` from `recorded_at`'s date, or `event_id` order from time order (IR-002). The past-date path through `current_state` is also unpinned (IR-001). |
| DAC-E1-9 | PARTIAL | as AC-15 | as AC-15 | The "MAY already be a member" branch has no fixture: the planned "added before it was retired" case was implemented reversed (IR-003). |
| DAC-E1-S2-1 | PARTIAL | `fold_members` (`replay.py:105-125`); `membership_as_of.sql` | unit fold tests (43-137); `test_a_stock_added_and_removed_on_one_date_is_not_a_member_that_day` (145-157) | The same-day and add-day rules are asserted at both tiers. The `recorded_on` grain itself is not: manual:1 and manual:5 survived (IR-002). |
| DAC-E1-S2-2 | PARTIAL | `current_state.sql:7` (`c.recorded_on AS created_on`); `replay.py:223-236` | `test_a_date_before_creation_has_no_members_and_names_the_creation_date` (160-177) | Empty members, the flag, `created_on == D1` and the `False` result on D1 are all asserted. Deriving `created_on` from `recorded_at::date` survives (manual:8, IR-002). |
| DAC-E1-S2-3 | SATISFIED | `membership_as_of.sql:12-16` returns `i.lifecycle` without filtering | `test_a_retired_instrument_stays_a_member_and_replays_as_retired` asserts `lifecycle == 'retired'` for the current read (`current_state`) and for past `as_of` values | Mutant manual:14 (`AND i.lifecycle = 'active'`) was killed. |
| DAC-E1-S2-4 | PARTIAL | `events_page.sql:13-16`; `replay.py:list_events` fetches `limit + 1` and builds the cursor from the last `event_id` | `test_events_page_newest_first_with_a_stable_cursor` (324-376) and the related page tests | Pages of 3, 3 and 1, a stable cursor across an interleaved append, and the clean last page are all asserted. Ordering by `recorded_at` first survives (manual:17, IR-002). |
| DAC-E1-S2-5 | SATISFIED | four `Final` constants read at module level (`replay.py:31-35`); every `.sql` uses `%(name)s` only (inspected) | `tests/unit/test_universe_sql_safety.py` (125-264) | The scan runs over the real tree with a non-vacuity guard, and synthetic cases show that every check fires. `MEMBERSHIP_AS_OF_SQL` equals its file. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/universes/__init__.py` (docstring only) | It exports nothing, and `pyproject.toml` is unchanged, as planned. |
| T002 | complete | VERIFIED | `tests/unit/test_universe_replay.py:43-137` | Every planned case is present: same-day, D/D+1/D+30, removal on E, re-add, `event_id` versus `recorded_at` and list order with five shuffles, after-`as_of`, non-member events, empty input. IR-002 limits their regression sensitivity on the date grain. |
| T003 | complete | PARTIAL | `tests/integration/test_universe_as_of.py:118-302` | Cases (a) to (j) all exist. Case (d) reverses the planned fixture: the stock is added after it retired, where the plan says "added before it was retired" (IR-003). Case (a)'s promise to keep "two implementations honest" does not hold for either replay key (IR-002). |
| T004 | complete | VERIFIED | `test_universe_as_of.py:324-551` | Planned cases are present: 3/3/1 pages, interleaved append, isolation, empty universe, limit 0 and `MAX_PAGE_SIZE + 1`, bad cursor, unconverted provenance passthrough (int and float types), and the `list_universe_rows` lifecycle, prefix, order and paging cases. IR-002 covers the ordering mutant. |
| T005 | complete | VERIFIED | `tests/unit/test_universe_sql_safety.py` | Checks (a), (a'), (b), (c) and (d) are implemented as specified. (a') runs over any source text and is fed synthetic sources. |
| T006 | complete | VERIFIED | `test_universe_replay.py:140-324` | Parts (a), (c) and (d) are adequate. Part (b) uses the plan's own example values (80 and 0.5), which are exact in binary, so it cannot detect a float-built `Decimal` (IR-004, MEDIUM). |
| T007 | complete | VERIFIED | `sql/membership_as_of.sql` | A programmatic comparison shows the file equals design section 2.5's `sql` block byte for byte. |
| T008 | complete | VERIFIED | `sql/current_state.sql`, `sql/events_page.sql`, `sql/list_universes.sql` | Named placeholders only, `starts_with` rather than `LIKE`, the `::bigint`, `::text`, `::timestamptz` and `::uuid` casts, the America/Chicago `today`, columns that match `UniverseRow`, no `member_count`. The header comments lack the design section number and DEC that the task asks for (IR-006, LOW). |
| T009 | complete | VERIFIED | `replay.py:31-196` | The constants, frozen dataclasses with trailing defaulted `created_on` and `filter_provenance`, `ReplayEvent`, `UniverseRow` (`universe_id` first), `fold_members`, `origin_from_provenance` and the cursor codecs raising `runs.queries.CursorError` are all present. No private `runs.queries` helper is imported. |
| T010 | complete | VERIFIED | `replay.py:199-290` | Dict parameters with the constant as the first argument, `dict_row`, `limit` validated before any I/O, `limit + 1` lookahead, lifecycle enumeration, `None` for an unknown universe, `as_of` defaulting to the SQL `today`. Production behaviour is correct. IR-001 records that its as-of composition has no test. |
| T011 | complete | VERIFIED | reviewer rerun: `test_package_data_ships_sql.py` and `test_research_sql_is_append_only.py` (21 passed) | The change set holds only the planned files plus the T013 evidence files. |
| T012 | complete | VERIFIED | reviewer rerun of every Validation Plan command (see Independent Validation) | All pass. |
| T013 | complete | VERIFIED | `CAP-002-E1-S2-tdd-evidence.yaml`, `CAP-002-E1-S2-evidence/` | Three cycles with RED logs, reviewed patches, `commit_hash: stage` and mutation blocks. `check-tdd-evidence.py --require-logs` reports 0 errors and 0 warnings. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_universe_replay.py` fold tests / TC-COMP-049 (unit tier) | WEAK | Exact `instrument_id -> member_since` maps for every planned case. Shuffled order and inverted `recorded_at` prove that `event_id` decides. | `_at()` (27-28) always puts `recorded_at` at 12:00 UTC on the `recorded_on` day, so a fold that uses `recorded_at.date()` survives (manual:1). IR-002. |
| `test_sql_and_the_pure_fold_agree_on_every_date_of_a_scripted_history`, `test_a_stock_added_and_removed_on_one_date_is_not_a_member_that_day`, `test_member_since_is_the_selected_adds_recorded_at` / TC-COMP-049 (integration tier) | WEAK | The SQL is compared with the fold for every date from D1-1 to D4+2, plus same-day removal and `member_since` from the selected add. | The history never puts an event across midnight UTC and never inverts `recorded_at` against `event_id`. As a result manual:5 (`recorded_at::date`) and manual:7 (`ORDER BY ... recorded_at DESC`) survive. IR-002. |
| `test_a_retired_universe_keeps_its_members_and_reports_when_it_retired` / TC-COMP-049 | WEAK | A retired universe keeps its members; `lifecycle` and `retired_at` are asserted. | Its past and current memberships are identical, so `current_state` ignoring `as_of` survives (manual:3). IR-001. |
| `test_a_date_before_creation_has_no_members_and_names_the_creation_date` / TC-COMP-050 | WEAK | Empty members, `as_of_before_creation`, `created_on` and `as_of` before creation; the flag is `False` and members are present on D1. | `created_on` from `recorded_at::date` survives (manual:8, IR-002). Members on D1 equal today's members, so manual:3 survives (IR-001). |
| `test_a_retired_instrument_stays_a_member_and_replays_as_retired` / TC-COMP-117 | WEAK | A retired stock is a member with `lifecycle == 'retired'` for current and past reads, and is never filtered out (manual:14 killed). | The stock is added on D2 after `retired_at` (D1-30), the reverse of the plan. A "member, then retired" exclusion survives (manual:18). IR-003. |
| Events page tests / TC-COMP-051 | WEAK | 3/3/1 pages, strict `event_id` order, a cursor that stays stable across appends, isolation, the last-page cursor, raw provenance types, and refusal of a bad limit or cursor. | `recorded_at` rises with `event_id` in every fixture, so `ORDER BY e.recorded_at DESC, e.event_id DESC` survives (manual:17). IR-002. |
| `test_universe_sql_safety.py` / TC-COMP-052 | ADEQUATE | The real tree is scanned with a non-vacuity guard. Synthetic cases show each check fires: f-string, `.format`, `%` and `+` arguments, `read_text` in a function or class, `UPDATE`, `DELETE`, unnamed `%s`, `%d`, a literal `%`, and the lock exception. The test also covers (a') collection and the file-equality check (d). | none |
| Cursor round-trip and bad-cursor tests (T006 a) | ADEQUATE | URL-safe alphabet, `v: 1`, every padding length, and `CursorError` for empty input, non-base64, a non-object, a wrong version, a missing field, a wrong type and a bool id. All catalogue mutants on `_decode` and `decode_event_cursor` were killed. | none |
| `origin_from_provenance` tests (T006 b, T003 i) | WEAK (not mandatory) | `by_hand` fields are `None`; the typed `UUID` and `date`, `Decimal` instances, `{}` for empty thresholds, and a null symbol are asserted. | 80 and 0.5 are exact in binary, so `Decimal(value)` survives (manual:4). IR-004. |
| Purity and limit-before-I/O tests (T006 c, d) | ADEQUATE | Deep-copy equality before and after; `None` connection with limits 0, -1 and `MAX_PAGE_SIZE + 1` and an unknown lifecycle. | none |
| `list_universe_rows` tests (T004 second half) | ADEQUATE | Lifecycle sets, replayed and case-sensitive prefix, literal `%`, newest-first order, a cursor that stays stable across an insert, the same-instant tie-break, and one row per universe. Mutants manual:11, :12 and :16 and the keyset `<=` mutant were killed. | none |
| `test_current_membership_uses_todays_america_chicago_date` (T003 f) | ADEQUATE (time-dependent sensitivity) | It asserts today's Chicago-dated member and excludes tomorrow's. Pass or fail is deterministic, because `CURRENT_TIMESTAMP` is fixed per transaction. | It kills a session-time-zone `CURRENT_DATE` regression only in the daily window when the UTC and Chicago dates differ (IR-005, LOW). |

Isolation and determinism: each integration test gets a fresh database (`test_<uuid>`) migrated through version 5 only. The unit tests share one monotonic id iterator, which matters only for relative order within a test. Shuffles use fixed seeds. No network or wall-clock dependence affects pass or fail.

## Independent Validation

All commands ran in `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2` unless stated otherwise. Two sandbox limits shaped how they ran:

- **uv cache.** The sandbox denies writes to `~/.cache/uv`. In-sandbox runs used `UV_CACHE_DIR=$TMPDIR/uv-cache` and `--no-sync`. `uv sync --locked --dry-run --offline` showed that `.venv` matches `uv.lock`: no version changes, only the editable project reinstall.
- **Docker.** The sandbox also blocks the Docker socket, so testcontainers cannot start. Both full suites were therefore rerun outside the sandbox, with `UV_OFFLINE=1` so that nothing reached pypi.org, which the user has denied.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed. |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY`. |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z` | harness root | 0 | PASS | `98f642f326c8746b9c4ecd581129381937a6e469`, an ancestor of HEAD. |
| `uv run pytest -m 'not postgres' tests/unit/test_universe_replay.py tests/unit/test_universe_sql_safety.py` (run as `UV_CACHE_DIR=$TMPDIR/uv-cache uv run --no-sync pytest ... -p no:cacheprovider`) | component | 0 | PASS | 78 passed (focused checkpoint). |
| `uv run pytest -m 'not postgres'` (in sandbox, temporary uv cache) | component | 1 | NOT RUN (environment) | 1 failed and 2 errors, all in `test_release_excludes_test_paths.py` and `test_distribution_contents.py`. Their `uv build --wheel --offline` needs setuptools from uv's cache, which the sandbox denies. The rerun below supersedes this run. |
| `uv run pytest -m 'not postgres'` (run as `UV_OFFLINE=1 uv run --no-sync pytest -m 'not postgres'`, outside the sandbox) | component | 0 | PASS | 908 passed, 320 deselected (24.3 s). Includes the offline wheel-build tests. |
| `uv run pytest -m postgres` (run as `UV_OFFLINE=1 uv run --no-sync pytest -m postgres`, outside the sandbox for Docker) | component | 0 | PASS | 320 passed, 908 deselected (210.7 s). Includes the focused checkpoint `tests/integration/test_universe_as_of.py`. |
| `uv run ruff check .` (`--no-sync`) | component | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` (`--no-sync`) | component | 0 | PASS | 203 files already formatted. |
| `uv run mypy src` (`--no-sync`) | component | 0 | PASS | No issues in 49 source files (strict). |
| `uv run pytest tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py` (`--no-sync`) | component | 0 | PASS | 21 passed (T011). |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 98f642f326c8746b9c4ecd581129381937a6e469 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 98f642f326c8746b9c4ecd581129381937a6e469..HEAD --cycle review --out <scratchpad>/mutants.json` | harness root | 0 | PASS | 38 catalogue mutants (17 negate-boolean, 21 off-by-one). The reviewer added 13 manual mutants. |
| `python3 scripts/mutation-run.py run --jobs 4 --command 'cd {workdir} && PYTHONPATH={workdir}/src <venv>/python -m pytest -x -q -p no:cacheprovider tests/unit/test_universe_replay.py tests/unit/test_universe_sql_safety.py tests/integration/test_universe_as_of.py -m "postgres or not postgres"'` (outside the sandbox for Docker; results in the scratchpad, outside the repo) | harness root | 3 | FAIL | 51 mutants: 40 killed, 11 survived. Five catalogue survivors are equivalent (see below). Six manual survivors are not: manual:1, :3, :4, :5, :7, :8. Run at 04:19 to 04:20Z. |
| Same runner, second manual batch (manual:14 to :17) | harness root | 3 | FAIL | 3 killed (14 exclude-retired, 15 provenance dropped, 16 lifecycle label swapped). Survived: 17 (events page ordered by `recorded_at` first). |
| Same runner, manual:18 | harness root | 3 | FAIL | Survived: members whose instrument retired after they joined are dropped. |
| `uv build` | component | N/A | NOT RUN | The plan marks the build "not affected". `test_distribution_contents.py` and `test_release_excludes_test_paths.py`, which run `uv build --wheel --offline`, passed inside the `-m 'not postgres'` run, so they provide the build evidence. |

Equivalent catalogue survivors, each confirmed by the reviewer:

- **`replay.py:119` `>` to `>=`.** `event_id` is an identity primary key, so equal ids are the same event.
- **`replay.py:249` and `:279` `limit + 2`.** The page is still sliced to `limit` and the cursor still decided by `len(rows) > limit`.
- **`current_state.sql:24` and `list_universes.sql:22`, `LIMIT 2` on the retired lateral.** `idx_universe_event_single_retired` (migration `0005`) allows at most one `retired` event per universe.

The coder's evidence makes the same equivalence claims, and they hold.

### Validation Side Effects

- Before: HEAD `89dfe228d4d7608c9df3bb9101d44addfaba192f`; `git status --porcelain --untracked-files=all` empty; `code-revision` `sha256:a69716332dea3063a0f7210d04abb8ef99a82078516b8c404bc11004a1cfc15d`.
- After: same HEAD, same branch, `git status` empty, same `code-revision` fingerprint.
- Unexpected tracked-file changes: none. Mutants ran in isolated clones under the session scratchpad.

## Findings

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 3 · MEDIUM 1 · LOW 2 · **total 6**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | HIGH | `current_state(as_of=D)` returning a past date's members is not tested (manual:3 survives) |
| IR-002 | HIGH | Fixtures never separate `recorded_at` from `recorded_on` or from `event_id` order, so the SQL replay keys are unpinned (manual:1, :5, :7, :8, :17 survive) |
| IR-003 | HIGH | The TC-COMP-117 fixture reverses the planned scenario, so the "already a member, then retired" case is untested (manual:18 survives) |
| IR-004 | MEDIUM | `Decimal(str(value))` threshold conversion is not pinned (manual:4 survives) |
| IR-005 | LOW | The America/Chicago "today" test catches a session-date regression only part of each day |
| IR-006 | LOW | The new SQL headers lack the design section number and DEC citations T008 asks for |

### IR-001 — `current_state(as_of=D)` returning a past date's members is not tested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-6, DAC-E1-8
- **Tasks**: T003, T010
- **Files**: `src/factorflow/universes/replay.py:232` (`members=[] if before_creation else membership_as_of(conn, universe_id, effective)`); `tests/integration/test_universe_as_of.py:160-177`, `197-213`
- **Claim challenged**: T010 says that, unless the date is before creation, "the members come from `membership_as_of`" for the requested `as_of`. The TC-COMP-049 and -050 tests call `current_state(..., as_of=...)` as evidence of AC-6.
- **Observed evidence**: The reviewer mutant manual:3 replaced `effective` with `row["today"]` in that call, so `current_state` ignores `as_of` for members. It survived the focused suites (103 passed). Every `current_state(as_of=past)` call in the tests is on a universe whose membership on that date equals its membership today: [AA] on D1 versus [AA] today (160-177), and [AA] on D2 versus [AA] today (197-213). The only past-date assertions with differing membership go through `membership_as_of` directly.
- **Expected evidence/behavior**: AC-6 says "the user MUST be able to see which stocks belonged to a universe on any past date". DAC-E1-8 says the same for a given America/Chicago date. Under DEC-0093, CAP-002-E1-S3's `get_universe(as_of)` maps directly onto `current_state`, and design section 8 criterion 9 is that `get_universe(as_of=D)` returns the members as of D.
- **Impact**: A regression that makes the universe-as-of read (and later `GET /api/universes/{id}?as_of=`) return current members for a past date would pass every test in this story.
- **Required remediation**: Add an integration assertion where `current_state(conn, universe_id, as_of=D)` must return members that differ from the current membership, for example a stock removed after D and a stock added after D, and that equal `membership_as_of(conn, universe_id, D)`. Mutant manual:3 must be killed.

### IR-002 — Fixtures never separate `recorded_at` from `recorded_on` or from `event_id` order, so the SQL replay keys are unpinned

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-8, DAC-E1-S2-1, DAC-E1-S2-2, DAC-E1-S2-4 (AC-6)
- **Tasks**: T003 (a), T004 (the T002 cases exist as planned; their sensitivity is affected)
- **Files**: `tests/integration/test_universe_as_of.py:47-48` (`_at`), `70-96` (`_event`); `tests/unit/test_universe_replay.py:27-28` (`_at`); production keys at `sql/membership_as_of.sql:9-10`, `sql/current_state.sql:7`, `sql/events_page.sql:15`, `replay.py:114`
- **Claim challenged**: T003 (a) says the differential test keeps "one definition of the rule, two implementations kept honest". TC-COMP-049 is stated over the `recorded_on` date, and TC-COMP-051 over `event_id DESC`.
- **Observed evidence**: Every fixture event has `recorded_at` at 12:00 UTC on its `recorded_on` day, or an explicit time on that same UTC day, and `recorded_at` never decreases as `event_id` increases at the SQL tier. Five reviewer mutants survived:
  - manual:5: `membership_as_of.sql` `recorded_on <= %(as_of)s` changed to `recorded_at::date <= %(as_of)s`.
  - manual:8: `current_state.sql` `c.recorded_on AS created_on` changed to `c.recorded_at::date AS created_on`.
  - manual:7: `membership_as_of.sql` ordered by `instrument_id, recorded_at DESC, event_id DESC`.
  - manual:17: `events_page.sql` ordered by `e.recorded_at DESC, e.event_id DESC`.
  - manual:1: `fold_members` using `event.recorded_at.date() > as_of`.

  None of these is equivalent. The application sets no session `TimeZone` (no timezone setting in `src/factorflow/**/*.py`), so in a UTC session an event recorded after 19:00 CDT has a `recorded_at` date one day after its `recorded_on`. `recorded_at` defaults to `now()`, the transaction start time, so it is not guaranteed to follow `event_id` order. The pure fold inverts `recorded_at` against `event_id` (unit tier, T002), but no SQL-tier fixture does.
- **Expected evidence/behavior**: DAC-E1-S2-1 makes the `recorded_on` date the grain, and DAC-E1-8 an America/Chicago date. DAC-E1-S2-2 requires "the creation date" (`created_on` from `recorded_on`, DEC-0094). DAC-E1-S2-4 requires ordering by `event_id DESC`. DEC-0065 says `event_id` decides at the `recorded_on` grain.
- **Impact**: A regression to the UTC date or to time ordering, the errors DEC-0065 exists to prevent, passes the whole suite. The mandatory TC-COMP-049, -050 and -051 tests are `WEAK`.
- **Required remediation**: Add fixtures at the SQL tier (membership as of a date, `created_on` and `as_of_before_creation`, events page) and for the fold where `recorded_at`'s UTC date differs from `recorded_on`. For example, `recorded_on` D with `recorded_at` D+1 02:00Z, which is 21:00 CDT on D and matches the column default. Add others where a higher `event_id` carries an earlier `recorded_at`. Mutants manual:1, :5, :7, :8 and :17 must be killed.

### IR-003 — TC-COMP-117 reverses the planned retired-instrument fixture, so the "already a member, then retired" case is untested

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-15, DAC-E1-9
- **Tasks**: T003 (d)
- **Files**: `tests/integration/test_universe_as_of.py:51-59` (`_instrument` sets `retired_at` to D1 minus 30 days), `180-194` (ZZ added on D2)
- **Claim challenged**: T003 (d): "a `lifecycle='retired'` instrument ... that was added before it was retired is returned by the current read and by a past `as_of` with `lifecycle == 'retired'`".
- **Observed evidence**: The only retired instrument has `retired_at` 2026-09-01 12:00Z and is added on 2026-10-02, after it retired. No test has a member whose instrument retired after it joined. Reviewer mutant manual:18, which adds `AND (i.retired_at IS NULL OR i.retired_at < m.recorded_at)` and so drops members whose instrument retired after they joined, survived. The blanket exclusion mutant manual:14 was killed.
- **Expected evidence/behavior**: DAC-E1-9 says a retired stock "MAY be added or MAY already be a member; it MUST remain a member". AC-15 (membership side) says a retired instrument is never excluded from a universe for that reason. The fixture is set by T003 (d).
- **Impact**: The common AC-15 case, a stock that acquisition retires while it is already a member, has no regression test. The plan deviation is not recorded anywhere.
- **Required remediation**: Add the planned fixture: `member_added` recorded before the instrument's `retired_at`. Assert that the instrument replays as a member with `lifecycle == 'retired'` for the current read and for past `as_of` dates before and after `retired_at`. Keep the added-while-retired case. Mutant manual:18 must be killed.

### IR-004 — The `Decimal`-from-`str` conversion of thresholds is not pinned

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (supports the Origin consumed by CAP-002-E1-S5 and S6)
- **Tasks**: T006 (b)
- **Files**: `src/factorflow/universes/replay.py:140`; `tests/unit/test_universe_replay.py:261-282`; `tests/integration/test_universe_as_of.py:262-288`
- **Claim challenged**: T006 (b): threshold values are "`Decimal` built from `str(value)`".
- **Observed evidence**: Reviewer mutant manual:4 (`Decimal(str(value))` changed to `Decimal(value)`) survived. The only test values, 80 and 0.5, are exact in binary floating point, so `Decimal(0.5) == Decimal("0.5")`.
- **Expected evidence/behavior**: The conversion that T006 (b) describes should be verified.
- **Impact**: A bound such as `0.1` would read back as `Decimal('0.1000000000000000055511151231257827021181583404541015625')` without any test failing. The code is correct today and no acceptance criterion in this story depends on it, hence MEDIUM.
- **Required remediation**: Add a threshold that is not exact in binary (for example `0.1`) and assert `Decimal("0.1")`. Mutant manual:4 must be killed.

### IR-005 — The America/Chicago "today" test catches a session-time-zone regression only part of each day

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-8
- **Tasks**: T003 (f)
- **Files**: `tests/integration/test_universe_as_of.py:226-241`; `src/factorflow/universes/sql/current_state.sql:11`
- **Claim challenged**: Test (f) shows that current membership uses today's America/Chicago date (DEC-0065).
- **Observed evidence**: Reviewer mutant manual:9 (`CURRENT_DATE AS today`) was killed in this run at 04:20Z, when the container's UTC date (2026-10-23) differed from Chicago's (2026-10-22). For most of the day, from 05:00Z (CDT) or 06:00Z (CST) until midnight UTC, the two dates agree and the mutant would survive.
- **Expected evidence/behavior**: Regression sensitivity should not depend on the wall clock (skill test-quality check 6: no time dependence unless explicitly controlled).
- **Impact**: A regression to the session date passes CI whenever CI runs outside the daily window.
- **Required remediation**: Make detection independent of the time of day. For example, repeat the assertion under session time zones whose date differs from Chicago's at complementary times, such as `SET TIME ZONE 'Pacific/Kiritimati'` and `'Pacific/Honolulu'`.

### IR-006 — The new SQL headers do not cite the design section number and DEC

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T008
- **Files**: `src/factorflow/universes/sql/current_state.sql:1`, `sql/events_page.sql:1`, `sql/list_universes.sql:1-2`
- **Claim challenged**: T008 asks for "a leading `--` comment citing the design section and DEC".
- **Observed evidence**: The headers say "(component design replay section; see replay.py)". They give no section number (2.5) and no DEC (DEC-0065, DEC-0093, DEC-0094). The delivered `src/factorflow/coverage/sql/*.sql` headers cite, for example, "component-design-coverage-service 2.2, 2.4" and their DECs.
- **Expected evidence/behavior**: Header citations as T008 specifies.
- **Impact**: Traceability from each statement to its governing section and decision is weaker. No behavioural effect.
- **Required remediation**: Cite design section 2.5 and the relevant DEC IDs in each of the three headers.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Evidence files.** The eight files under `CAP-002-E1-S2-evidence/` go beyond T011's list of expected paths. They are justified by T013 and are required by `check-tdd-evidence.py --require-logs`.
- **TC-COMP-051 host file.** TC-COMP-051 lives in `tests/integration/test_universe_as_of.py` rather than the design's `test_universe_maintenance.py`. The plan's Resolved Conflicts section justifies this.
- **T003 (d).** The fixture is reversed relative to the plan, with no recorded justification (IR-003).
- **T008.** The header citations are incomplete (IR-006).
- **Bookkeeping.** The cycle-3 evidence entry, listed against `tasks: [T005]`, also carries a `list_universe_rows` same-instant tie-break test, which is T004 scope. The `reviewed_patch` paths in the TDD evidence are absolute, local-machine paths; the lint accepts them, but they are not portable. Some cursor round-trip tests carry `# Implements TC-COMP-051`, an extra trace that does no harm.
- **No out-of-scope production change.** `service.py` was not created, `pyproject.toml` and `tests/conftest.py` are unchanged, and no delivered test was edited (DEC-0064).

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Using `CAP-002-E1-S2-tasks.md` and this report, add tests that kill reviewer mutants manual:3 (IR-001), manual:1, :5, :7, :8 and :17 (IR-002), and manual:18 (IR-003). Implement T003 (d) as planned. IR-004 to IR-006 are recommended in the same rework. Then rerun `$adversarial-review` against the same integration base.
- **Warnings accepted downstream**: N/A
