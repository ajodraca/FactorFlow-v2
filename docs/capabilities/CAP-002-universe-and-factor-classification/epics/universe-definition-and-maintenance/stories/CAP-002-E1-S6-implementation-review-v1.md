---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-01
updated: 2026-11-01
story_id: "CAP-002-E1-S6"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S6.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-01T01:07:41Z"
reviewed_head: "46cef4059f0b9bb6a55c240afc82b9395063cb47"
review_base: "8ec2a736136dd3f743fb22ac1b7eac771e28d032"
reviewed_state_revision: "sha256:d0565bd884db8303ada580062c111120d98aa1b750e335ffe55f2278c0564f96"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S6
    artifact_version: 1
    content_revision: sha256:919cb905f38f1217754cb4f5e192338312810206cd7b21ff90d94619fc883e58
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-01T01:07:41Z
  source_artifacts:
    - id: CAP-002-E1-S6
      version: "1 (sha256:919cb905f38f1217754cb4f5e192338312810206cd7b21ff90d94619fc883e58)"
    - id: CAP-002-E1-S6-tasks
      version: "1"
    - id: CAP-002-E1-S6-tdd-evidence
      version: "1 (cycles 1 to 3)"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-api-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0260
      version: "agent-decided 2026-11-01T00:40:43Z"
    - id: DEC-0261
      version: "agent-decided (this review: context refresh before the review)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 22/22 verified |
| Required validation | 7/7 passed |

The nine universe operations are implemented in `src/factorflow/api/routes/universes.py`, with the request and response models in `classification_models.py`, the bounds in `classification_bounds.py`, and a single additive `include_router` in `app.py`. Every acceptance criterion traces to production code and to tests that assert the observable outcome: the error envelope, the `symbols` list field, the status codes and the rows written or not written in a real PostgreSQL store. All six mandatory TC-COMP cases are implemented and adequate. The full Python suite passes (835 postgres-marked, 1428 others plus one pre-existing xfail), and lint, format, type check, build and the TDD-evidence lint are clean. The review regenerated 115 catalogue mutants over every changed production line and added 7 manual ones. Of the 122, 121 were killed. The single survivor changes the default of a private keyword that no request path reaches, so it is equivalent.

Two non-blocking findings remain. IR-001 (MEDIUM): the route's "the pool commits, the service never commits" premise is false under psycopg 3. The service's own `conn.transaction()` block is the outer transaction and commits, so a failure while the create or rename response is being shaped returns an error for a write that is already committed. A reviewer probe reproduced this. IR-002 (LOW): when a newer set completes while the route is paging the reader internally, the request is refused as `422 cursor_invalid` even though the caller sent no cursor.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S6.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's private clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S6` |
| HEAD | `46cef4059f0b9bb6a55c240afc82b9395063cb47` (`feat(api): CAP-002-E1-S6 story-coding`, trailer `Decision-Id: DEC-0260`) |
| Review base | `origin/main` → `8ec2a736136dd3f743fb22ac1b7eac771e28d032` (`pipeline-state.py review-base --base-ref origin/main`; `git merge-base --is-ancestor` exit 0; one commit in range). The default resolution without `--base-ref` returned `1d166f7`, 130 commits back, because this clone's `origin/HEAD` points at `origin/usr/alvaro-de-jodra/tech-stack-v7`, so the driver's stated base `origin/main` was used. |
| Working tree | clean before and after validation (`git status --porcelain --untracked-files=all` empty) |
| Changed files reviewed | 22 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/app.py` | modified | T019; story *Implementation* (the one delivered file edited): import line plus one `include_router` line, nothing else |
| `src/factorflow/api/classification_bounds.py` | added | T002; DAC-E1-S6-4 |
| `src/factorflow/api/classification_models.py` | added | T014, T015; DAC-E1-S6-4, AC-1 |
| `src/factorflow/api/routes/universes.py` | added | T016, T017, T018; all ACs |
| `tests/unit/test_api_universes_routes.py` | added | T003, T004, T005, T006, T008, T010 |
| `tests/unit/test_api_classification_models.py` | added | T004, T009 |
| `tests/unit/test_api_classification_error_mapping.py` | added | T007 |
| `tests/integration/test_api_universes.py` | added | T003, T005, T008, T011, T012 |
| `tests/integration/test_api_classification_host_origin.py` | added | T013 |
| `.../stories/CAP-002-E1-S6-tdd-evidence.yaml` | added | T022 |
| `.../stories/CAP-002-E1-S6-evidence/cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` | added | T022 (reviewed patches) |
| `.../stories/CAP-002-E1-S6-evidence/red-cycle-1-models.log`, `red-cycle-2-routes.log`, `red-cycle-3-integration.log` | added | T022 (RED logs) |
| `.../stories/CAP-002-E1-S6-evidence/mutants-cycle-1.json`, `mutants-cycle-2.json`, `mutation-cycle-1-results.json`, `mutation-cycle-2-results.json` | added | T022 (mutation evidence) |
| `.../stories/CAP-002-E1-S6-tasks.md` | modified | Task checkboxes T001–T022 ticked; no other line changed (diff filtered for non-checkbox lines is empty) |
| `.../stories/CAP-002-E1-S6.md` | modified | `status: planning` → `in-review`, `updated`; the content revision `sha256:919cb905…` still equals the approval's `reviewed_revision`, and `artifact-gate.py check` passes |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `universes.py:create_universe` (305–326) delegates to `service.create_by_hand` / `create_from_filter`; `_refuse` maps `InstrumentNotAcquired` to 409 with `symbols` (138–141) | `tests/integration/test_api_universes.py::test_create_by_hand_returns_and_reads_the_replayed_universe`, `::test_create_naming_uncovered_symbols_is_refused_whole`, `::test_create_from_a_result_saves_the_filter_match_with_provenance` | Covered stocks create; an uncovered one refuses the whole request with zero rows written |
| AC-4 | SATISFIED | `rename_universe` (329–343), `add_members` (360–375), `remove_member` (378–403), `retire_universe` (346–357) | `test_api_universes.py::test_rename_keeps_the_id_and_the_history` (events after rename = `renamed` + the earlier history unchanged), `::test_add_and_remove_keep_the_dated_record`, `::test_retire_keeps_members_and_events_and_refuses_every_write` | Rename keeps `universe_id` and the earlier events byte-for-byte |
| AC-5 | SATISFIED | `CreateUniverseRequest.symbols` has no minimum (113), so `[]` reaches the service; `EmptyUniverse` → 422 `empty_universe` (65); `LastMember` → 409 (66) | `test_api_universes.py::test_an_empty_create_is_empty_universe_and_writes_nothing`, `::test_a_filter_matching_nothing_is_empty_universe`, `::test_removing_the_sole_member_is_refused_then_retired_refuses_writes` | Nothing written in each refusal (`written(conn)` unchanged) |
| AC-6 | SATISFIED | `get_universe` passes `as_of` (252–264); `list_events` (267–299) | `test_api_universes.py::test_as_of_reads_past_membership`, `::test_add_and_remove_keep_the_dated_record` (`member_removed` event at the returned `removed_at`), `::test_retire_keeps_members_and_events_and_refuses_every_write`; unit `test_api_universes_routes.py::test_as_of_reaches_get_universe_as_a_date` | Past-date replay is S2's; the route passes `as_of` through and the integration test reads today and a pre-creation date |
| DAC-E1-1 | SATISFIED | `_reason` lists `exc.symbols` (89); `symbols` field (140) | `test_api_universes.py::test_create_naming_uncovered_symbols_is_refused_whole` (`["BBB","ZZZ"]`, covered AAA/CCC absent, `(0, 0)` rows), `::test_a_create_with_one_uncovered_symbol_writes_nothing`; `test_api_classification_error_mapping.py` ADD row (`add_members`) | API side of the service rule; the add-members refusal is pinned at the mapping level |
| DAC-E1-4 | SATISFIED | Route passes the trimmed name; rule is the service's | `test_api_universes.py::test_names_are_unique_among_active_universes_after_trimming` (create and PATCH refused; reusable after retire) | |
| DAC-E1-6 | SATISFIED | `add_members` returns `AddMembersResponse(added, already_member)` in a 200 (375) | `test_api_universes.py::test_adding_a_current_member_reports_already_member_and_appends_no_event` (exactly one new event; second call adds none) | |
| DAC-E1-7 | SATISFIED | `LastMember` 409 with the retirement alternative (108); `UniverseRetired` 409 on every write (63) | `test_api_universes.py::test_removing_the_sole_member_is_refused_then_retired_refuses_writes`, `::test_retire_keeps_members_and_events_and_refuses_every_write` (PATCH, POST members, DELETE member, second DELETE all 409, no rows) | Message names the id, not the name (DEC-0260; see deviations) |
| DAC-E1-S6-1 | SATISFIED | `_refuse` message `"Could not create a universe: these stocks are not followed: BBB, ZZZ."` (134) | TC-COMP-004 integration and unit twin | Operation, resource and every symbol named; nothing written |
| DAC-E1-S6-2 | SATISFIED | `REFUSALS` (61–71); messages built from request values and exception attributes only (79–109) | TC-COMP-040, `test_api_classification_error_mapping.py` (21 parametrised rows plus six further tests) | The body carries no traceback, file path, exception class name or sentinel credential |
| DAC-E1-S6-3 | SATISFIED | as DAC-E1-6 | TC-COMP-027 integration and unit twin | |
| DAC-E1-S6-4 | SATISFIED | Pydantic models with `extra="forbid"`, `max_length=MAX_SYMBOLS_PER_REQUEST`, `Query(gt=0, le=MAX_PAGE_SIZE)`, `Literal` lifecycle, `UUID` / `date` params; path symbol checked before the pool (381–389) | TC-COMP-005: `test_api_universes_routes.py::test_out_of_bounds_requests_never_reach_the_service_or_the_pool` (17 cases, `pool.calls == 0`), `::test_a_malformed_path_symbol_is_refused_before_the_service`; model-level cases in `test_api_classification_models.py` | |
| DAC-E1-S6-5 | SATISFIED | `app.py:462` `include_router(universes.router)` before `_add_host_origin_middleware` / `_add_request_id_middleware` / `_add_static_mount` | TC-COMP-028: `test_api_universes_routes.py::test_the_router_is_mounted_behind_the_middleware_and_ahead_of_static`, `::test_create_app_includes_the_universes_router_before_the_static_mount`; `test_api_classification_host_origin.py` (3 tests) | |
| DAC-E1-S6-6 | SATISFIED | `LastMember` → 409 `last_member`, resource `universe-member` (66, 125) | TC-COMP-041 integration (events unchanged, `AAA` still listed) and unit twin (service receives `AAA` from path `aaa`) | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Every producer imported by the new modules exists and the suites import it: `service` exceptions and functions, `replay.list_universe_rows`, `UniverseEvent.filter_provenance`, `reader.Thresholds` / `ListFilters` / `list_classifications` / `CurrentSet` / `StockRow`, `CursorError`; helpers imported from S3 and S5 test modules | Verification task; no producer was edited |
| T002 | complete | VERIFIED | `classification_bounds.py:9–23` | `MAX_UNIVERSE_NAME_LENGTH: int \| None = None` with `[REQUIRES INPUT]`; no `bounds.py` value redeclared (unit test asserts it) |
| T003 | complete | VERIFIED | TC-COMP-004 in both files with `# Implements TC-COMP-004` | |
| T004 | complete | VERIFIED | TC-COMP-005 route and model tests | Every case listed by the plan is present; route cases assert `pool.calls == 0` |
| T005 | complete | VERIFIED | TC-COMP-027 in both files | |
| T006 | complete | VERIFIED | TC-COMP-028 (two unit tests) | Mount position read from `app.routes` (`original_router`), not from `app.py` text |
| T007 | complete | VERIFIED | `test_api_classification_error_mapping.py` | Every design 2.5 row reachable from the universes routes; 500 for an unmapped exception and for a plain `ValueError`; completeness asserted with `inspect` over the service module |
| T008 | complete | VERIFIED | TC-COMP-041 in both files | |
| T009 | complete | VERIFIED | `test_api_classification_models.py` (a)–(d) | |
| T010 | complete | VERIFIED | `test_api_universes_routes.py` (a)–(h) | (f)'s malformed-cursor case is in the error-mapping file (`cursor_invalid-list_events`) and in integration T011(i) |
| T011 | complete | VERIFIED | `test_api_universes.py` (a)–(k) | |
| T012 | complete | VERIFIED | `test_api_universes.py` filter-path tests (a)–(g) | (a) reads names from `instrument_reference`, not `instrument.name`: the instrument table has no name column and DEC-0245 makes `instrument_reference.company_name` the reader's source. Justified |
| T013 | complete | VERIFIED | `test_api_classification_host_origin.py` (a)–(d) | |
| T014 | complete | VERIFIED | `classification_models.py:34–167` | `is None` exactly-one test (131); `set_id` with and only with `filter` (137–144); add-members 1–1000 (162); messages never echo a submitted value |
| T015 | complete | VERIFIED | `classification_models.py:173–321`, `Thresholds.to_reader` (88–97) | Decimals serialised as strings through `model_dump(mode="json")` (`universes.py:145–147`) |
| T016 | complete | VERIFIED | `universes.py:61–142` | `str(exc)` never used; unmapped exceptions propagate to the delivered 500. `universe_retired` names the id (DEC-0260) |
| T017 | complete | VERIFIED | `universes.py:150–299` | Counts page `list_universe_rows` from a `None` cursor to exhaustion (DEC-0098); member name and cells from the reader or null (DEC-0097) |
| T018 | complete | VERIFIED | `universes.py:305–403` | Implemented as written; the plan's premise "(the service never commits)" does not hold (IR-001) |
| T019 | complete | VERIFIED | `app.py:28`, `app.py:462` | `git diff app.py` shows only those two lines |
| T020 | complete | VERIFIED | Guard suites pass in the full `-m 'not postgres'` run; imports in both orders succeed in a fresh interpreter (command below); scope matches the plan | |
| T021 | complete | VERIFIED | All Validation Plan commands rerun green (below) | |
| T022 | complete | VERIFIED | `CAP-002-E1-S6-tdd-evidence.yaml`, three cycles; `check-tdd-evidence.py --require-logs` 0 errors; the three patches applied in order onto `8ec2a73` reproduce HEAD byte-for-byte for all nine code and test files | The plan's five suggested cycles are merged into three, with the reason recorded in the evidence header (the router cannot be unit-tested before it is mounted) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-004 (`test_create_naming_uncovered_symbols_is_refused_whole`, `test_create_with_uncovered_symbols_names_every_one_in_a_list_field`) | ADEQUATE | Real store: 409, `symbols == ["BBB","ZZZ"]` (sorted, upper-cased; ZZZ has no row, BBB no segment), the message names the operation and both symbols, covered symbols absent, `(0, 0)` rows. Unit: `symbols` is a list field, and the service receives the upper-cased list exactly once | none |
| TC-COMP-005 (`test_out_of_bounds_requests_never_reach_the_service_or_the_pool`, model tests) | ADEQUATE | 17 out-of-bounds requests return 422 `validation_error` naming the field, and the pool is never asked for a connection; at the model level, 1001 symbols fail as `too_long` with `max_length == 1000`; percentile, NaN/Infinity, a malformed prefix and an unknown key are each rejected naming their field | none |
| TC-COMP-027 (integration and unit) | ADEQUATE | 200 `{"added":["CCC"],"already_member":["AAA"]}`, exactly one new `member_added` for CCC; an all-member request appends none | none |
| TC-COMP-028 (two unit tests; host/origin integration) | ADEQUATE | JSON body with `universes`, `X-Request-Id`, 400 `host_not_allowed`, 403 `origin_not_allowed` with the service untouched, the 404 envelope for an unknown sub-path, the router entry before the static `Mount`; the injected RED (router unmounted) failed 26 integration tests | none |
| TC-COMP-040 (`test_each_refusal_maps_to_its_status_and_code` ×21 and six further tests) | ADEQUATE | Status, code and resource per row; `request_id` equals the header; no traceback, `.py`, exception class name or sentinel; `symbols` only on `instrument_not_acquired`; both set ids; id, symbol and retirement wording; a bare 500 for `RuntimeError` and for plain `ValueError`; the table equals the design table and covers every service exception | Messages are prose; the code is the contract (design 2.5) |
| TC-COMP-041 (integration and unit) | ADEQUATE | 409 `last_member`, `universe-member`, `AAA` and "retire" in the message, events unchanged, member still listed, then `universe_retired` after retirement; the unit twin proves path upper-casing | none |
| T009 / T010 additional unit tests | ADEQUATE | Exactly-one with `[]`, `set_id` rules, `extra="forbid"`, name trim and the one-constant bound, symbol caps and shapes, the to-reader conversion including a zero bound, decimal strings, the member name/factors null rule, two-page reader paging with `MAX_PAGE_SIZE`, list counts over two pages, raw `filter_provenance` types | `hide_incomplete` is a lax boolean on purpose (the model comment says E3-S5 parses it from query strings); not a gap against the plan |
| T011 / T012 / T013 integration tests | ADEQUATE | Real store, real service, replay and reader through `create_app()`; each refusal asserts no rows written | No test drives a failure after the service returns (IR-001) |
| Mutation (this review) | — | 115 catalogue mutants over every changed production line + 7 manual (validator guards, raw symbols, member-route resources, path-symbol check, one-page count). The focused unit and integration suites (162 tests per baseline, all six baselines exit 0) killed 121 of 122. Survivor `universes.py:121:negate-boolean:1` (default of `_refuse`'s `from_filter` keyword) is **equivalent**: `from_filter` is read only for `EmptyUniverse`; only `create_by_hand` and `create_from_filter` raise it (universe-service design 2.3; an empty `add_members` is a no-op, DEC-0095); `create_universe` always passes it explicitly; and no artifact specifies the private helper's default (task plan T016 gives `_refuse` no such parameter; design 2.5 fixes only the message content) | none |

Determinism: unit tests use fixed instants and UUIDs; integration tests compute "today" in America/Chicago, matching the replay. Each test gets a fresh database, and no test depends on order.

## Independent Validation

Shorthand in the commands below: `<component>` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/pipeline-factorflow-v2-cap-002-e1-0036dc/repos/factorflow-v2/FactorFlow-v2`; `<scratchpad>` is this review session's scratchpad directory outside both repositories; `<tdd-evidence.yaml>` is `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S6-tdd-evidence.yaml`; `<3 unit files>` are `tests/unit/test_api_universes_routes.py tests/unit/test_api_classification_error_mapping.py tests/unit/test_api_classification_models.py` and `<2 integration files>` are `tests/integration/test_api_universes.py tests/integration/test_api_classification_host_origin.py`. Commands that needed Docker, the uv cache or the network ran outside the Bash sandbox as single plain calls.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 2, then 0 | PASS | First run: context STALE (25h, window 24h). Refreshed under DEC-0261 with `bash scripts/context_feeder.sh --project factorflow-v2 --verbose` (exit 0; fetch only, the clone is on a non-default branch); HEAD, `origin/main`, branch and tree unchanged; the re-run passed all eight checks |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S6.md --stage adversarial-review` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `8ec2a736…`; ancestor of HEAD |
| `python3 scripts/artifact-gate.py revision` / `check` (story) | harness root | 0 / 0 | PASS | `sha256:919cb905…` equals the approval's `reviewed_revision`; gate passed |
| `uv run --directory <component> --offline pytest -m "not postgres" -q tests/unit/test_api_universes_routes.py tests/unit/test_api_classification_models.py tests/unit/test_api_classification_error_mapping.py` | component | 0 | PASS | 136 passed |
| `uv run --directory <component> --offline pytest -m postgres -q tests/integration/test_api_universes.py tests/integration/test_api_classification_host_origin.py` | component | 0 | PASS | 26 passed |
| `uv run --directory <component> --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS | 835 passed, 1429 deselected, 281.98s (Docker available) |
| `uv run --directory <component> --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS | 1428 passed, 835 deselected, 1 xfailed (pre-existing `tests/unit/test_line_items_resolved.py::test_every_line_item_payload_key_is_resolved`, `[REQUIRES INPUT]` Massive payload keys; not in this change set). Includes the T020 guard suites |
| `uv run --directory <component> --offline ruff check .` | component | 0 | PASS | All checks passed |
| `uv run --directory <component> --offline ruff format --check .` | component | 0 | PASS | 267 files already formatted |
| `uv run --directory <component> --offline mypy src` | component | 0 | PASS | no issues in 60 source files |
| `uv build --directory <component> --offline --out-dir <scratchpad>/dist` | component | 0 | PASS | sdist and wheel built outside the repo; the wheel contains the three new modules |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 8ec2a736… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `git apply` of `cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` onto `git archive 8ec2a73` (scratchpad), then `cmp` against HEAD | scratchpad | 0 | PASS | All nine code and test files identical to HEAD |
| `uv run --directory <component> --offline python -c "import factorflow.universes.service, factorflow.api.routes.universes, factorflow.api.app; …subprocess (reverse order)"` | component | 0 | PASS | No import cycle in either order |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 8ec2a73..HEAD --cycle review --out <scratchpad>/mutants.json` | harness root | 0 | PASS | 115 mutants; 7 manual added |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratchpad>/mutants.json --jobs 6 --timeout 300 --command "cd {workdir} && PYTHONPATH={workdir}/src <component>/.venv/bin/python -m pytest -q -x -p no:cacheprovider <3 unit files> <2 integration files>" --out <scratchpad>/mutation-results.json` | harness root | 3 | PASS | 122: 121 killed, 1 survived (equivalent, above). Exit 3 is the runner reporting a survivor. Results copied beside this report as `CAP-002-E1-S6-implementation-review-v1-mutation.json` |
| Reviewer probe `<scratchpad>/probe/test_probe_commit_point.py` (`reader.list_classifications` raising after `POST /api/universes`), run with `uv run --directory <component> --offline python -m pytest -p tests.conftest -s` | component | 0 | PASS (probe ran) | Observed: `500 internal_error`, then `universe` rows = 1 and events = 2, then retry → `409 universe_name_in_use` (IR-001) |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `sha256:d0565bd8…` before and after validation |
| `npm ci`, `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | — | N/A | NOT RUN | No TypeScript or frontend file is in the change set; not in the task plan's Validation Plan |
| `uv sync --all-extras` | — | N/A | NOT RUN | `pyproject.toml` and `uv.lock` unchanged; the existing locked environment ran every command offline |

### Validation Side Effects

- Before: HEAD `46cef40`, branch `usr/alvaro-de-jodra/CAP-002-E1-S6`, working tree clean, code fingerprint `sha256:d0565bd8…`.
- After: HEAD, branch and fingerprint unchanged; working tree clean. Only ignored paths were written (`src/factorflow.egg-info/` by `uv build`, plus caches). Mutant clones, results, logs, the probe and the build output all live in the session scratchpad.
- Unexpected tracked-file changes: none. The context refresh fetched remote refs into the clone (`origin/main` still `8ec2a73`) and rewrote `cache/`, under DEC-0261.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | MEDIUM | initial | OPEN | Create and rename commit inside the service, so a failure while shaping the response reports an error for a committed write |
| IR-002 | LOW | initial | OPEN | A set change between the route's internal reader pages is reported as the client's `cursor_invalid` |

### IR-001 — Create and rename commit inside the service, so a failure while shaping the response reports an error for a committed write

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is left unsatisfied)
- **Tasks**: T018 (and the task plan's *Other Notes* on `_universe_response`)
- **Files**: `src/factorflow/api/routes/universes.py:11–14` (module docstring), `create_universe` (309–317), `rename_universe` (335–338); `src/factorflow/universes/service.py:260` (`with conn.transaction():` in `create_by_hand`, likewise in `rename`); `.venv/.../psycopg/transaction.py:215` and `:188–190`
- **Claim challenged**: The route docstring says each handler's single `with pool.connection()` block makes the pool commit on normal exit and roll back on an exception, "which is the 'caller commits' the service expects". T018 says the same and adds "(the service never commits)". The plan's *Other Notes* say `_universe_response` is called inside the block so that a failure while reading cells does not follow a committed write.
- **Observed evidence**: The pool hands out an idle connection. On an idle connection, psycopg 3 makes `conn.transaction()` the outer transaction (`_outer_transaction = pgconn.transaction_status == IDLE`), which sends `COMMIT` when the block exits. So `service.create_by_hand` and `service.rename` commit before the route calls `_universe_response`. A reviewer probe made `reader.list_classifications` raise after a real `POST /api/universes`. The response was `500 internal_error`, yet `universe` held 1 row and `universe_event` 2. Retrying the same request returned `409 universe_name_in_use` for the universe the first call had reported as failed. The unit `_FakePool` assertion `pool.exits == [exc]` ("so the pool rolled back") checks a mechanism that does not protect the real stack. Typed refusals still write nothing, but only because the service's own block rolls back.
- **Expected evidence/behavior**: universe-service design 2.3 (line 284): "The caller commits." The task plan has the route (the caller) own that commit, and calls the response helper inside the block so that the write and the response read succeed or fail together.
- **Impact**: This happens only when something fails after the service returns: a database error, or the reader race in IR-002, which turns into a `422` on a committed create. The owner then sees "could not create" for a universe that exists, and a retry is refused as a name conflict. A rename that is retried appends a second `renamed` event (DEC-0096). The store stays internally consistent. No acceptance criterion fails, because AC-11's failure scenario only requires a 500 with code and request id.
- **Required remediation**: Either make the write and `_universe_response` share one transaction that the route owns, so the service's blocks nest as savepoints, and add an integration test that fails the reader after the service returns and asserts nothing was written. Or, if committing before the response is shaped is accepted, as design 2.6's sequence diagram also draws it, correct the route docstring, the T018 premise and the fake-pool assertion so that none of them claims a rollback the stack does not perform.

### IR-002 — A set change between the route's internal reader pages is reported as the client's `cursor_invalid`

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T016, T017
- **Files**: `src/factorflow/api/routes/universes.py:160–176` (`_universe_response` paging), `:258–263`, `:310–325`, `:336–342` (the `_REFUSABLE` catch around it); `src/factorflow/classification/reader.py:425–445` (`decode_cursor` raises `CursorError` for a cursor naming another set)
- **Claim challenged**: In design 2.5, `cursor_invalid` refuses a cursor the client supplied.
- **Observed evidence**: For a universe with more than `MAX_PAGE_SIZE` (500) current members, `_universe_response` pages the reader using cursors it creates itself. If a newer set completes between two pages, the reader raises `CursorError` ("cursor was issued for another set…"). The handler's `except _REFUSABLE` catches it and returns `422 cursor_invalid` with "the cursor is not one this list issued". This happens on `GET /api/universes/{id}`, which carries no cursor, and on `POST` and `PATCH` after the write has committed (IR-001).
- **Expected evidence/behavior**: A refusal code describes something the client sent. An internal paging conflict should be retried against the new set, or fail as a server-side condition. It should not be attributed to the caller.
- **Impact**: This is a rare race, needing a set to complete during the read of a universe with more than 500 members. The interface would show an invalid-cursor state for a request that had no cursor.
- **Required remediation**: Keep `CursorError` raised inside `_universe_response` out of the client-cursor mapping, for example by restarting the paging once on the new set. Then pin the behaviour with a unit test in which the doubled reader raises `CursorError` on page two.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **`universe_retired` message names the id, not the universe name** (design 2.5's "message carries" column). Recorded as DEC-0260, which is agent-decided, `contained` and still open for owner review. The service exception carries no name. T016 limits messages to values in the request or the exception, and design 2.5 makes the code the contract, because the interface never shows `message` raw. Justified. The decision record is untracked in the harness repository at review time, and the driver must commit it with its records.
- **TDD cycles 5 → 3**: merged, with the reason recorded in the evidence header. Justified.
- **T012(a) name source**: `instrument_reference` (DEC-0245) instead of the plan's `SELECT name FROM instrument`, a column that does not exist. Justified.
- **Bookkeeping**: the task plan's front matter still says `status: draft` and **Branch** `usr/alvaro-de-jodra/CAP-002-E1-tasks`, as every sibling CAP-002-E1 plan does. This is not a finding.
- **Out-of-scope changes**: none. `git diff app.py` shows only the import line and one `include_router` line. No delivered test file is edited, and `api/` holds no SQL.
- **Review context**: DEC-0261 (this review) refreshed stale context before the review started. HEAD and the merge base were recorded before the refresh and were unchanged after it.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `doc-sync` for CAP-002-E1-S6 against this report. IR-001 and IR-002 stay recorded for a later rework or owner decision.
- **Warnings accepted downstream**: IR-001, IR-002
