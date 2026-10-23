---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-23
updated: 2026-10-23
story_id: "CAP-002-E1-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-23T05:03:20Z"
reviewed_head: "8771e983754178f5d11b25f8312c6dc07a760750"
review_base: "98f642f326c8746b9c4ecd581129381937a6e469"
reviewed_state_revision: "sha256:4f14625a64fc6bb56c12607fcb351b514165d796ed74d7d1aefddd14d95051b2"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S2
    artifact_version: 1
    content_revision: sha256:c56f3aa4e1780be5392fb5d46b67074a1443d393a264e22960cb648d7f5461d4
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-23T05:03:20Z
  source_artifacts:
    - id: CAP-002-E1-S2
      version: "1 (sha256:c56f3aa4e1780be5392fb5d46b67074a1443d393a264e22960cb648d7f5461d4)"
    - id: CAP-002-E1-S2-tasks
      version: "1 (sha256:22418e18a618f31343590f664c4095b6083901d1a570f179f6e844da01580d4c)"
    - id: CAP-002-E1-S2-tdd-evidence
      version: "1 (cycles 1 to 4)"
    - id: CAP-002-E1-S2-implementation-review
      version: "1"
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

# Implementation Review: CAP-002-E1-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 2 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 13/13 verified |
| Required validation | 7/7 passed |

This re-review covers the rework commit `8771e98`, which answers review v1. It also re-examines
the whole change set from the integration base. Production code is unchanged apart from the
three SQL header comments. The rework adds tests and fixtures only.

All six v1 findings are resolved, each with current evidence. The reviewer reran the nine v1
mutants that had survived (manual:1, :3, :4, :5, :7, :8, :9, :17, :18), and every one is now
killed. Further checks:

- The America/Chicago `today` test now catches a session-date regression (`CURRENT_DATE`) at
  any hour. The reviewer confirmed this at two times of day: the `UTC` case killed it at
  04:51Z, and the `Pacific/Honolulu` case killed it at 05:00Z and again at 05:01Z.
- Every required validation command passes when rerun independently: 1236 tests in the full
  suite, ruff, ruff format, mypy strict and the offline build.
- The TDD-evidence lint is clean. The cycle-4 patch is identical to the committed rework diff.

The reviewer's own mutants found four residual test-strength gaps. None of them leaves an
acceptance criterion, a planned task or a mandatory TC-ID's expected result without a killing
test, so none blocks the gate:

- **IR-001 (MEDIUM).** In `current_state.sql`, the `renamed` and `retired` laterals can lose
  their per-universe correlation and every test still passes. If that happened, one universe
  would report another universe's name or retirement.
- **IR-002 (MEDIUM).** The current-name rule, the latest `renamed` event by `event_id`
  (DEC-0065 (1)), is not pinned against ordering by `recorded_at`, in either `current_state.sql`
  or `list_universes.sql`.
- **IR-003 (LOW).** If `today` were hard-coded to a zone other than America/Chicago, the tests
  would catch it only from 00:00Z to 05:00Z (CDT).
- **IR-004 (LOW).** An empty-string cursor is not tested at the `list_events` and
  `list_universe_rows` level.

How mandatory adequacy was judged: each mandatory test was measured against the Expected Result
its TC-ID states in `universe-service-tests.md`. Two tests carry a TC-ID trace label but also
assert planned behaviour outside that Expected Result:

- `test_current_membership_uses_todays_america_chicago_date` is labelled TC-COMP-049 and also
  covers T003 (f).
- `test_events_page_rejects_a_bad_limit_or_cursor` is labelled TC-COMP-051 and also covers the
  T004 cursor refusal.

The survivors IR-003 and IR-004 fall in that extra behaviour. Every TC-ID's own Expected Result
is pinned by killed mutants, as the Test Quality Assessment shows.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S2-run-20261023T035034Z` |
| HEAD | `8771e983754178f5d11b25f8312c6dc07a760750` (`story-coding(CAP-002-E1-S2): rework review v1 (IR-001 to IR-006)`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z` = `98f642f326c8746b9c4ecd581129381937a6e469`. Resolved with `pipeline-state.py review-base --base-ref`; `git merge-base --is-ancestor` exits 0. |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. |
| Changed files reviewed | 24, across three commits: `89dfe22` (story coding), `8a9f255` (review v1), `8771e98` (rework) |

### Changed Files

`docs/...` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/universes/__init__.py` | added | T001 |
| `src/factorflow/universes/replay.py` | added | T009, T010; AC-6, AC-15, DAC-E1-8, DAC-E1-9, DAC-E1-S2-1 to -5 |
| `src/factorflow/universes/sql/membership_as_of.sql` | added | T007; DAC-E1-8, DAC-E1-9, DAC-E1-S2-1 |
| `src/factorflow/universes/sql/current_state.sql` | added; header edited in `8771e98` | T008; DAC-E1-S2-2, AC-6; header edit answers v1/IR-006 |
| `src/factorflow/universes/sql/events_page.sql` | added; header edited in `8771e98` | T008; DAC-E1-S2-4; v1/IR-006 |
| `src/factorflow/universes/sql/list_universes.sql` | added; header edited in `8771e98` | T008 (DEC-0094); v1/IR-006 |
| `tests/unit/test_universe_replay.py` | added; extended in `8771e98` | T002, T006; TC-COMP-049 (unit tier); v1/IR-002, IR-004 |
| `tests/integration/test_universe_as_of.py` | added; extended in `8771e98` | T003, T004; TC-COMP-049, -050, -051, -117; v1/IR-001, -002, -003, -005 |
| `tests/unit/test_universe_sql_safety.py` | added | T005; TC-COMP-052 |
| `docs/.../stories/CAP-002-E1-S2-tasks.md` | modified | T011 permits it. A word diff shows only the 13 checkboxes, `updated`, and the rework marker `last_reworked_review`. |
| `docs/.../stories/CAP-002-E1-S2.md` | modified | T011 permits it. Only `status` changes, from `planning` to `in-review`. |
| `docs/.../stories/CAP-002-E1-S2-tdd-evidence.yaml` | added | T013 (cycles 1 to 4) |
| `docs/.../stories/CAP-002-E1-S2-evidence/cycle-1.patch` to `cycle-4.patch` (4 files) | added | T013 (`reviewed_patch`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/red-cycle-1-pure-replay.log`, `red-cycle-2-sql-reads.log`, `red-cycle-3-sql-safety.log`, `red-cycle-4-rework-mutants.log` | added | T013 (`red_log`) |
| `docs/.../stories/CAP-002-E1-S2-evidence/mutation-cycle-1-results.json`, `-2-`, `-4-` (3 files) | added | T013 (mutation results) |
| `docs/.../stories/CAP-002-E1-S2-implementation-review-v1.md` | added | The gate's own report, written by the adversarial review rather than by the coder |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-6 | SATISFIED | `replay.py:membership_as_of` (199-206), `current_state` (209-237, members from `membership_as_of(conn, universe_id, effective)`), `list_events` (240-254). Replay reads `universe_event` only, and no write statement exists. | `test_universe_as_of.py`: differential (124-148), `test_current_state_for_a_past_date_returns_that_dates_members_not_todays` (224-242), retired universe (307-323), events pages (440-546) | `current_state(as_of=D2)` now must return `[AA, BB]` while today's members are `[AA, CC]`. Mutants v1-3 (`row["today"]` for the members), r2-04 and r2-05 are killed. |
| AC-15 | SATISFIED | `membership_as_of.sql:12-16` returns `i.lifecycle` and never filters on it | `test_a_retired_instrument_stays_a_member_and_replays_as_retired` (186-200); `test_a_member_whose_instrument_retires_later_stays_a_member_and_replays_as_retired` (203-221) | Both orders are covered: added while retired, and added before retiring. The blanket-exclusion mutant (r4-01) and the "retired after joining" mutant (v1-18) are killed. |
| DAC-E1-8 | SATISFIED | `membership_as_of.sql:9-10` (`recorded_on <= %(as_of)s`, `DISTINCT ON ... event_id DESC`); `current_state.sql:11` (`today`) | `test_the_recorded_on_date_and_event_id_decide_not_recorded_at` (245-270); differential; Chicago-today test under three session zones (336-357) | One fixture records on D2 at 02:00Z on D3, and two others invert `recorded_at` against `event_id`. Mutants v1-5, v1-7, r2-08 and r2-10 are killed. IR-003 records a residual hard-coded-zone gap in `today`. |
| DAC-E1-9 | SATISFIED | as AC-15 | as AC-15 | "MAY already be a member" is now tested with `retired_at` at D3 15:00Z, after the D1 add. Membership is asserted for D1 to D4, the current read and `current_state(as_of=D2)`. |
| DAC-E1-S2-1 | SATISFIED | `fold_members` (`replay.py:105-125`); `membership_as_of.sql` | Unit fold tests (43-137), including `test_the_recorded_on_date_is_the_grain_not_the_utc_date_of_recorded_at` (105-116); same-day SQL test (151-163) | Mutants v1-1, v1-5, r2-08, r2-09, r2-18 and r3-07 are killed. |
| DAC-E1-S2-2 | SATISFIED | `current_state.sql:7` (`c.recorded_on AS created_on`); `replay.py:223-236` | `test_a_date_before_creation_has_no_members_and_names_the_creation_date` (166-183); `test_the_creation_date_is_the_recorded_on_date_not_the_utc_date` (273-287) | The created event is recorded on D1 at 02:00Z on D2. Mutants v1-8 (`recorded_at::date`), r2-03 (`<=`) and r2-04 (`today` in the comparison) are killed. |
| DAC-E1-S2-3 | SATISFIED | `membership_as_of.sql:12-16` | Both TC-COMP-117 tests | `lifecycle == 'retired'` is asserted for current and past reads in both orders. |
| DAC-E1-S2-4 | SATISFIED | `events_page.sql:13-16`; `replay.py:list_events` (`limit + 1` lookahead, cursor from the last returned `event_id`) | `test_events_page_newest_first_with_a_stable_cursor` (440-492); `test_events_page_orders_by_event_id_whatever_recorded_at_says` (290-304); end-of-page tests | Mutants v1-17 (`recorded_at` first), r2-06 (`<=` keyset), r2-07 (cursor from the lookahead row), r2-11, r2-12, r2-20 and r4-02 are killed. IR-004 records the empty-string cursor gap, which lies outside TC-COMP-051's Expected Result. |
| DAC-E1-S2-5 | SATISFIED | Four `Final` constants read at module level (`replay.py:31-35`); every `.sql` uses `%(name)s` only, and the new headers contain no `%` | `tests/unit/test_universe_sql_safety.py` | This file is unchanged since v1. It passes on the real tree with its non-vacuity guard, and its synthetic cases fire. `membership_as_of.sql` equals design section 2.5's `sql` block byte for byte (reviewer's programmatic comparison). |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/universes/__init__.py` (docstring only) | Exports nothing. `pyproject.toml` is unchanged. |
| T002 | complete | VERIFIED | `tests/unit/test_universe_replay.py:43-137` | Every planned case is present. A rework case (105-116) now separates `recorded_on` from the UTC date of `recorded_at` (v1/IR-002). |
| T003 | complete | VERIFIED | `tests/integration/test_universe_as_of.py:124-418` | Cases (a) to (j) are present. Case (d) is now implemented as planned (203-221), and the added-while-retired case is kept (186-200). Case (a)'s "two implementations kept honest" now holds for both replay keys (245-270). IR-001 and IR-002 record residual sensitivity gaps in (e) and (h). |
| T004 | complete | VERIFIED | `test_universe_as_of.py:290-304`, `440-667` | Every planned case is present: pages of 3, 3 and 1; the interleaved append; isolation; the empty universe; the limit bounds; bad cursors; provenance passthrough; and `list_universe_rows` lifecycle, prefix, order and paging. IR-002 and IR-004 record the residual gaps. |
| T005 | complete | VERIFIED | `tests/unit/test_universe_sql_safety.py` | Checks (a), (a'), (b), (c) and (d) are implemented as specified. The file is unchanged since v1. |
| T006 | complete | VERIFIED | `test_universe_replay.py:140-343` | Part (b) now includes `growth_score_max: 0.1`, asserted as `Decimal("0.1")` (v1/IR-004). Mutant v1-4 is killed. |
| T007 | complete | VERIFIED | `sql/membership_as_of.sql` | Byte-identical to the design 2.5 block. |
| T008 | complete | VERIFIED | `sql/current_state.sql`, `sql/events_page.sql`, `sql/list_universes.sql` | The headers now cite `component-design-universe-service 2.5` and DEC-0065, DEC-0093 and DEC-0094 as applicable (v1/IR-006). The statements are unchanged. |
| T009 | complete | VERIFIED | `replay.py:31-196` | Unchanged since v1: constants, frozen dataclasses with trailing defaulted `created_on` and `filter_provenance`, `ReplayEvent`, `UniverseRow`, `fold_members`, `origin_from_provenance`, and the cursor codecs raising `runs.queries.CursorError`. |
| T010 | complete | VERIFIED | `replay.py:199-290` | Unchanged since v1. Its as-of composition is now tested (v1/IR-001). |
| T011 | complete | VERIFIED | Reviewer rerun: `test_package_data_ships_sql.py` and `test_research_sql_is_append_only.py`, 21 passed | The change set holds only planned files, the T013 evidence and the v1 review report. |
| T012 | complete | VERIFIED | Reviewer rerun of every Validation Plan command (see Independent Validation) | All pass. |
| T013 | complete | VERIFIED | `CAP-002-E1-S2-tdd-evidence.yaml` cycle-4; `CAP-002-E1-S2-evidence/cycle-4.patch`, `red-cycle-4-rework-mutants.log`, `mutation-cycle-4-results.json` | The SHA-256 values of the RED log, the results and the patch match the YAML. The patch equals `git diff 8a9f255..HEAD -- src tests`, ignoring `index` lines. Cycle-4's RED is the nine v1 mutants failing the new tests, a valid RED for a test-only rework of correct code. The lint is clean. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_universe_replay.py` fold tests / TC-COMP-049 (unit tier) | ADEQUATE | Exact `instrument_id -> member_since` maps; shuffled order; `recorded_at` inverted against `event_id`; `recorded_on` D with `recorded_at` at 02:00Z on D+1. Kills v1-1, r2-09, r2-18 and r3-07. | none |
| Differential, same-day, past-date `current_state`, `recorded_on`/`event_id` and `member_since` tests / TC-COMP-049 (integration tier) | ADEQUATE | The SQL agrees with the fold on every date of two scripted histories, one of which separates the UTC date and inverts time against id. `current_state(as_of=past)` differs from today and equals `membership_as_of`. Kills v1-3, v1-5, v1-7, r2-05, r2-08 and r2-10. | none |
| `test_a_retired_universe_keeps_its_members_and_reports_when_it_retired` / TC-COMP-049 | ADEQUATE (TC-COMP-049 property); lifecycle assertions WEAK (not mandatory) | Members kept after retirement, `lifecycle == 'retired'` and `retired_at` | Its database holds one universe, so a `retired` lateral without the universe correlation survives (r3-04). This is T003 (e) behaviour, outside TC-COMP-049's Expected Result. IR-001. |
| `test_current_membership_uses_todays_america_chicago_date` (parametrized: UTC, Kiritimati, Honolulu) / TC-COMP-049 | ADEQUATE (TC-COMP-049 property and session-date regression); hard-coded-zone sensitivity time-dependent | Today's Chicago-dated member is in and tomorrow's is out, under three session zones. `CURRENT_DATE` (r2-15) was killed at 04:51Z by `UTC` and at 05:00Z and 05:01Z by `Pacific/Honolulu`. | `(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date` (r2-14) was killed at 04:51Z but survived at 05:00Z and 05:01Z. IR-003. |
| Before-creation tests / TC-COMP-050 | ADEQUATE | Empty members, the flag, `created_on == D1` when the creation is recorded at 02:00Z on D2, the flag `False` on the creation date, and `as_of` echoed. Kills v1-8, r2-03 and r2-04. | none |
| TC-COMP-117 tests (two) | ADEQUATE | Added while retired, and added before retiring. Both assert `lifecycle == 'retired'` for current and past reads, before and after `retired_at`. Kills v1-18 and r4-01. | none |
| Events page tests / TC-COMP-051 | ADEQUATE | Pages of 3, 3 and 1; a cursor that stays stable across appends; isolation; the clean last page; raw provenance types; strict `event_id` order when `recorded_at` runs backwards. Kills v1-17, r2-06, r2-07, r2-11, r2-12, r2-20 and r4-02. | The empty-string cursor survives at list level (r3-01). That is outside TC-COMP-051's Expected Result. IR-004. |
| `test_universe_sql_safety.py` / TC-COMP-052 | ADEQUATE | Unchanged since v1. Real-tree scan with a non-vacuity guard, synthetic detection cases, and (d) file equality. The five catalogue mutants on the new header comments are equivalent. | none |
| Cursor codec tests (T006 a) | ADEQUATE | URL-safe output, `v: 1`, padding, and `CursorError` for empty, non-base64, non-object, wrong-version, missing-field, wrong-type and bool inputs | none |
| `origin_from_provenance` tests (T006 b, T003 i) | ADEQUATE | `Decimal("0.1")` from a JSON `0.1`, so v1-4 is killed; typed `UUID` and `date`; `{}` for empty thresholds; null symbol. Kills r4-07 and r4-11. | none |
| `test_the_name_is_the_latest_rename_whatever_the_as_of` (T003 h) | WEAK (not mandatory) | The latest rename wins for any `as_of`. Kills r2-13 and r4-10. | Renames are recorded in `event_id` order with rising `recorded_at`, so r2-01 survives (IR-002). The database holds one universe, so r3-03 survives (IR-001). |
| `list_universe_rows` tests (T004 second half) | ADEQUATE apart from rename order | Lifecycle sets, replayed case-sensitive prefix, literal `%`, order, stable cursor, same-instant tie-break, one row per universe. Kills r3-05, r3-06, r4-03, r4-04, r4-05, r4-08 and r4-09. | Rename by `recorded_at` (r2-02) survives (IR-002). Empty-string cursor (r3-08) survives (IR-004). |
| Purity and limit-before-I/O tests (T006 c, d) | ADEQUATE | Deep-copy equality; `None` connection with out-of-range limits and an unknown lifecycle | none |

Isolation and determinism: every integration test creates a fresh database migrated through
version 5 only. `SET TIME ZONE` applies to that test's own connection, which is closed
afterwards. `CURRENT_TIMESTAMP` is fixed for the test's single transaction, so a test passes or
fails deterministically. Shuffles use fixed seeds. Only the *sensitivity* of IR-003's mutant
depends on the wall clock. The kills of v1-5 and v1-8 rely on the test container's default
`TimeZone` (UTC), because `recorded_at::date` in a session at UTC-3 or further west would equal
`recorded_on` for these fixtures. The application sets no session zone, and the container is
UTC, so the kills are valid in CI.

## Independent Validation

All commands ran in `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2`
unless stated otherwise. In-sandbox runs used `UV_CACHE_DIR=$TMPDIR/uv-cache`, `UV_OFFLINE=1`
and `--no-sync`. The sandbox denies `~/.cache/uv` and the Docker socket, so the wheel-building
tests, the postgres suites, the build and the mutation runs ran outside the sandbox. Those runs
used `UV_OFFLINE=1`, so no network was used.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed. |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required`. |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z` | harness root | 0 | PASS | Resolves to `98f642f326c8746b9c4ecd581129381937a6e469`; `git merge-base --is-ancestor` exits 0. |
| `uv run pytest -m 'not postgres' tests/unit/test_universe_replay.py tests/unit/test_universe_sql_safety.py` (in sandbox) | component | 0 | PASS | 79 passed (focused checkpoint). |
| `uv run pytest -m 'not postgres'` (in sandbox) | component | 1 | NOT RUN (environment) | 1 failed and 2 errors, all in `test_release_excludes_test_paths.py` and `test_distribution_contents.py`. Their `uv build --wheel --offline` cannot find setuptools in the temporary uv cache. The next row supersedes this run. |
| `uv run pytest -m 'not postgres'` (outside the sandbox) | component | 0 | PASS | 909 passed, 327 deselected (24.9 s). |
| `uv run pytest -m postgres` (outside the sandbox, for Docker) | component | 0 | PASS | 327 passed, 909 deselected (208.1 s), 04:44 to 04:48Z. Includes the checkpoint `tests/integration/test_universe_as_of.py`. |
| `uv run pytest` (tech-stack constitution full suite, outside the sandbox) | component | 0 | PASS | 1236 passed (262.3 s), 04:53 to 04:57Z. |
| `uv run ruff check .` | component | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | component | 0 | PASS | 203 files already formatted. |
| `uv run mypy src` | component | 0 | PASS | No issues in 49 source files (strict). |
| `uv build` (as `uv build --offline --out-dir <scratchpad>/build`, outside the sandbox) | component | 0 | PASS | Built the sdist and the wheel. The wheel holds `factorflow/universes/__init__.py`, `replay.py` and the four `sql/*.sql` files. Output was written to the scratchpad. |
| `uv run pytest tests/unit/test_package_data_ships_sql.py tests/unit/test_research_sql_is_append_only.py` | component | 0 | PASS | 21 passed (T011). |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 98f642f326c8746b9c4ecd581129381937a6e469 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. |
| Cycle-4 integrity: `shasum -a 256` of the red log, results and patch; `diff` of the patch against `git diff 8a9f255..HEAD -- src tests`, `index` lines excluded | component | 0 | PASS | All three digests match the YAML. The patch is identical to the committed diff. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 98f642f326c8746b9c4ecd581129381937a6e469..HEAD --cycle review --out <scratchpad>/mut/mutants.json` | harness root | 0 | PASS | 43 catalogue mutants (17 negate-boolean, 26 off-by-one) over all five changed production files. The reviewer added 44 manual mutants across the batches below. |
| `python3 scripts/mutation-run.py run --jobs 4 --command 'cd {workdir} && PYTHONPATH={workdir}/src <venv>/python -m pytest -x -q -p no:cacheprovider tests/unit/test_universe_replay.py tests/unit/test_universe_sql_safety.py tests/integration/test_universe_as_of.py -m "postgres or not postgres"'` (batch 1, outside the sandbox, results in the scratchpad) | harness root | 3 | FAIL | 04:50:13 to 04:51:20Z. 70 mutants (43 catalogue and 27 manual): 58 killed, 12 survived. All 8 re-run v1 survivors were killed. The survivors were 10 equivalent catalogue mutants (listed below) and 2 non-equivalent manual mutants, r2-01 and r2-02 (IR-002). Baselines: 111 passed per worker. |
| Same runner, batch 2: `--only manual:r2-14 --only manual:r2-15`, without `-x` | harness root | not captured (piped) | FAIL | 05:01:04 to 05:01:15Z. r2-15 (`CURRENT_DATE`) was killed by `[Pacific/Honolulu]`. r2-14 (`AT TIME ZONE 'UTC'`) survived, with 111 passed (IR-003). |
| Same runner, batch 3: r2-14, r2-15 and r3-01 to r3-08 (no r3-02), without `-x` | harness root | not captured (piped) | FAIL | 05:00:39 to 05:01:07Z. Killed: r2-15, r3-05, r3-06 and r3-07. Survived: r2-14 (IR-003), r3-01 and r3-08 (IR-004), r3-03 and r3-04 (IR-001). |
| Same runner, batch 4: r4-01 to r4-11 (no r4-06) | harness root | not captured (piped) | PASS | 05:02:54 to 05:03:16Z. All 10 killed: exclude-retired, provenance dropped on events and on current state, lifecycle label swapped, case-insensitive prefix, tie-break direction, lifecycle filter, cursor from the lookahead row, rename ignored, `hide_incomplete` dropped. |

Equivalent survivors, each confirmed by the reviewer:

- **`replay.py:119` `>` to `>=`.** `event_id` is an identity primary key, so two equal ids are
  the same event.
- **`replay.py:249` and `:279` `limit + 2`.** The page is still sliced to `limit`, and the
  cursor is still decided by `len(rows) > limit`.
- **`current_state.sql:24` and `list_universes.sql:22` `LIMIT 2`.** `idx_universe_event_single_retired`
  allows at most one `retired` event per universe.
- **`current_state.sql:1` (two), `events_page.sql:1` (two) and `list_universes.sql:2` (one).**
  These change a digit inside a `--` comment, so no statement changes, and
  `MEMBERSHIP_AS_OF_SQL` is not involved.

Not generated, because it is equivalent by construction: removing
`event_type IN ('member_added', 'member_removed')` from `membership_as_of.sql`. Migration
`0005` (CHECK on line 20) gives every non-member event a null `instrument_id`, and `JOIN
instrument` drops the null `DISTINCT ON` group.

### Validation Side Effects

- Before: HEAD `8771e983754178f5d11b25f8312c6dc07a760750` on
  `usr/alvaro-de-jodra/CAP-002-E1-S2-run-20261023T035034Z`.
  `git status --porcelain --untracked-files=all` was empty.
  `code-revision` was `sha256:4f14625a64fc6bb56c12607fcb351b514165d796ed74d7d1aefddd14d95051b2`.
- After: the same HEAD and branch, an empty `git status`, and the same `code-revision`
  fingerprint. Only ignored `.hypothesis/` files exist, as they did before.
- Unexpected tracked-file changes: none. The mutants ran in isolated clones, and the build
  output was written to the session scratchpad.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 2 · **total 4**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | MEDIUM | `current_state`'s `renamed` and `retired` laterals are never tested with a second universe (r3-03, r3-04 survive) |
| IR-002 | MEDIUM | The current-name rule's `event_id` order is not pinned against `recorded_at` (r2-01, r2-02 survive) |
| IR-003 | LOW | A hard-coded non-Chicago zone for `today` is detected only from 00:00Z to 05:00Z (CDT) (r2-14) |
| IR-004 | LOW | The empty-string cursor is not tested at the `list_events` and `list_universe_rows` level (r3-01, r3-08) |

### IR-001 — `current_state`'s `renamed` and `retired` laterals are never tested with a second universe

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A. This supports AC-6 through T003 (e), but it does not affect members.
- **Tasks**: T003 (e), (h); T008 (`current_state.sql`)
- **Files**: `src/factorflow/universes/sql/current_state.sql:16`, `:22`;
  `tests/integration/test_universe_as_of.py:307-333`, `365-375`
- **Claim challenged**: T008 says `current_state.sql` reads "a universe's" `created`, latest
  `renamed` and `retired` events. T003 (e) and (h) assert the replayed `lifecycle`,
  `retired_at` and `name`.
- **Observed evidence**: Reviewer mutants r3-03 and r3-04 survived the focused suites, 111 passed
  each (batch 3).
  - r3-03 drops `e.universe_id = c.universe_id` from the `renamed` lateral, so the name becomes
    the latest rename of any universe.
  - r3-04 drops the same predicate from the `retired` lateral, so any retired universe makes
    every universe `retired`, with its `retired_at`.

  Every `current_state` test that reads `name`, `lifecycle` or `retired_at` runs in a database
  that holds one universe. The `list_universes.sql` counterparts, r3-05 and r3-06, are killed
  because the `list_universe_rows` tests use three universes.
- **Expected evidence/behavior**: Component design section 2.5 says `current_state.sql` reads
  the universe's own events. Every consumer of `current_state` relies on its name, lifecycle
  and `retired_at` belonging to that universe: CAP-002-E1-S3's `get_universe`, the
  `rename`/`retire` results of CAP-002-E1-S4 and the routes of CAP-002-E1-S6.
- **Impact**: A lost correlation predicate, a classic lateral-join slip, would show one
  universe's name or retirement on another, and no test would fail. The code is correct today,
  and no acceptance criterion's membership depends on these columns, hence MEDIUM.
- **Required remediation**: Add an integration case with two universes, A and B. Rename and
  retire B after A's events, then assert that `current_state(A)` keeps A's own name,
  `lifecycle == 'active'` and `retired_at is None`. Mutants r3-03 and r3-04 must be killed.

### IR-002 — The current-name rule's `event_id` order is not pinned against `recorded_at`

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T003 (h), T004 (`list_universe_rows`), T008
- **Files**: `src/factorflow/universes/sql/current_state.sql:17`,
  `src/factorflow/universes/sql/list_universes.sql:15`;
  `tests/integration/test_universe_as_of.py:365-375`, `549-585`
- **Claim challenged**: T008 says the name is "latest `renamed` event's `name` by `event_id DESC`".
  DEC-0065 (1) says `event_id` is the replay order and `recorded_at` is informational.
- **Observed evidence**: Reviewer mutants r2-01 and r2-02 survived batch 1, 111 passed each.
  They order the `renamed` lateral by `e.recorded_at DESC, e.event_id DESC`, in
  `current_state.sql` and in `list_universes.sql` respectively. Every rename fixture records
  renames with `recorded_at` rising along with `event_id`. The one fixture that inverts them,
  `test_events_page_orders_by_event_id_whatever_recorded_at_says` (290-304), reads only
  `list_events`. `recorded_at` defaults to `now()`, the transaction start time, so a writer that
  starts earlier but takes the advisory lock later records a higher `event_id` with an earlier
  `recorded_at`.
- **Expected evidence/behavior**: DEC-0065 (1) and T008, as quoted above. v1/IR-002 resolved
  the same substitution for membership, `created_on` and the events page. The name read is the
  remaining replay key.
- **Impact**: A regression to time ordering would surface an older name as the current name,
  and the `name_prefix` filter would follow it. No test would fail.
- **Required remediation**: Add a fixture where the later `renamed` event, by `event_id`,
  carries the earlier `recorded_at`. Assert that both `current_state(...).name` and
  `list_universe_rows` (row name and `name_prefix` match) take the later `event_id`'s name.
  Mutants r2-01 and r2-02 must be killed.

### IR-003 — A hard-coded non-Chicago zone for `today` is detected only from 00:00Z to 05:00Z (CDT)

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A. This is T003 (f) and DEC-0065 (2): `as_of` defaults to the
  current America/Chicago date.
- **Tasks**: T003 (f), T008
- **Files**: `src/factorflow/universes/sql/current_state.sql:11`;
  `tests/integration/test_universe_as_of.py:336-357`
- **Claim challenged**: v1/IR-005 asked that detection of a `today` regression not depend on
  the time of day.
- **Observed evidence**: The session-zone parametrization resolves the session-date regression.
  `CURRENT_DATE` (r2-15) is killed at any hour, as shown at 04:51Z and at 05:00Z and 05:01Z.
  Mutant r2-14, `(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date AS today`, does not depend on the
  session zone. It was killed at 04:51Z, when the UTC and Chicago dates differed, and survived
  at 05:00:39Z and 05:01:04Z, when they agreed. It can be detected only from 00:00Z to 05:00Z
  (CDT), or 06:00Z (CST). In production its effect is the reported `as_of` date during
  19:00–24:00 Chicago. Members are unaffected, because no event can carry a future
  `recorded_on`.
- **Expected evidence/behavior**: Skill test-quality check 6 (no time dependence unless
  controlled). T008 pins `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date AS today`.
- **Impact**: A hard-coded-zone regression passes about 19 of every 24 hours of CI runs.
- **Required remediation**: Optional. The current time cannot be controlled in PostgreSQL
  without changing the design the plan pins. Accepting the residual is reasonable. If it is
  closed, a deterministic check that `today` is computed in America/Chicago, for example
  beside the SQL scan, would kill r2-14 at any hour.

### IR-004 — The empty-string cursor is not tested at the list level

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T004 ("a malformed or wrong-version cursor raises `CursorError`"), T006 (a)
- **Files**: `src/factorflow/universes/replay.py:245`, `:268-270`;
  `tests/integration/test_universe_as_of.py:533-546`, `601-608`
- **Claim challenged**: `list_events` and `list_universe_rows` refuse a malformed cursor, and
  the codecs raise for an empty string.
- **Observed evidence**: Reviewer mutants r3-01 and r3-08, which change `cursor is None` to
  `not cursor` and so treat `""` as the first page, survived (batch 3). The codec-level empty
  string is tested (T006 a), but no list-level call passes `""`. CAP-001 shows the delivered
  convention: `runs/queries.py:275` and `:436` decode whenever a cursor is not `None`, and the
  decoder raises `empty cursor`.
- **Expected evidence/behavior**: The current behaviour, `""` raising `CursorError`, matches
  the CAP-001 contract and should be pinned.
- **Impact**: A request such as `?cursor=` could silently restart paging rather than be
  refused, without any test failing. The code is correct today.
- **Required remediation**: Assert that `list_events(conn, uid, 5, "")` and
  `list_universe_rows(conn, "all", None, 5, "")` raise `CursorError`. Mutants r3-01 and r3-08
  must be killed.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `test_current_state_for_a_past_date_returns_that_dates_members_not_todays` (`test_universe_as_of.py:224-242`) asserts that past members `[AA, BB]` differ from today's `[AA, CC]` and equal `membership_as_of(D2)`. Mutant v1-3 is killed (batch 1), and so are r2-04 and r2-05. |
| v1/IR-002 | RESOLVED | The fold test at `test_universe_replay.py:105-116` and the SQL-tier tests at `test_universe_as_of.py:245-270`, `273-287` and `290-304` separate `recorded_on` from the UTC date and invert `recorded_at` against `event_id`. v1-1, v1-5, v1-7, v1-8 and v1-17 are all killed (batch 1). The name lateral was not in v1's list; it is raised here as IR-002. |
| v1/IR-003 | RESOLVED | `test_a_member_whose_instrument_retires_later_stays_a_member_and_replays_as_retired` (`203-221`) adds before `retired_at`, and the added-while-retired case is kept (`186-200`). v1-18 is killed (batch 1). |
| v1/IR-004 | RESOLVED | `test_full_provenance_maps_to_a_typed_origin_with_exact_decimals` now expects `growth_score_max: Decimal("0.1")`. v1-4 is killed (batch 1). |
| v1/IR-005 | RESOLVED | The `test_current_membership_uses_todays_america_chicago_date` parametrization (UTC, `Pacific/Kiritimati`, `Pacific/Honolulu`) kills the session-date mutant `CURRENT_DATE` at any hour: by `UTC` at 04:51Z and by `Pacific/Honolulu` at 05:00Z and 05:01Z. A residual hard-coded-zone variant is raised as IR-003 (LOW). |
| v1/IR-006 | RESOLVED | `current_state.sql:1`, `events_page.sql:1` and `list_universes.sql:2` cite `component-design-universe-service 2.5` and DEC-0065, DEC-0093 and DEC-0094 as applicable. |

## Scope and Plan Deviations

- **Evidence files.** The eleven files under `CAP-002-E1-S2-evidence/` go beyond T011's list of
  paths. T013 justifies them, and `check-tdd-evidence.py --require-logs` requires them.
- **Review report in the change set.** `CAP-002-E1-S2-implementation-review-v1.md` sits on the
  story branch because the gate wrote it. It is not coder scope.
- **TC-COMP-051 host file.** The test lives in `test_universe_as_of.py`, as the plan's Resolved
  Conflicts section justifies.
- **Rework marker.** `last_reworked_review` was added to the task plan's frontmatter. It is
  bookkeeping that `pipeline-state.py` reads. No task text changed.
- **Bookkeeping.** These items, unchanged from v1, are not findings:
  - The `reviewed_patch` paths in the TDD evidence, including cycle 4, are absolute
    local-machine paths. The lint accepts them, but they are not portable.
  - Cycle 3 carries a T004 tie-break test under `tasks: [T005]`.
  - Some codec tests carry an extra `# Implements TC-COMP-051` trace.
- **No out-of-scope production change.** The rework touched production files only in three SQL
  comment lines. `service.py` is not created. `pyproject.toml` and `tests/conftest.py` are
  unchanged, and no delivered test was edited (DEC-0064).

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E1-S2 against this report, under the
  review base `usr/alvaro-de-jodra/CAP-002-E1-integration-run-20261023T035034Z`. The four
  findings are carried as accepted warnings. Closing them later needs only added tests: each
  finding's remediation names the mutants that must be killed.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004
