---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-30
updated: 2026-09-30
story_id: "CAP-001-E6-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-30T04:36:58Z"
reviewed_head: "5077fcf5052174cfabf6f3bee6529096eea24779"
review_base: "8e3f562bc20547e61a55ddddc555314c0542809b"
reviewed_state_revision: "sha256:912f6f387a3a8c56b87dc4abbfbc4a709929baecc9e21803c69b13035ba70456"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E6-S3
    artifact_version: 1
    content_revision: sha256:a062d7bae4216bcf58a6d81ee201712d69412e9c7d52b9bc0ffe8722d1611d4a
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-30T04:36:58Z
  source_artifacts:
    - id: CAP-001-E6-S3
      version: "1"
    - id: CAP-001-E6-S3-tasks
      version: "1"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E6-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 3 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 10/10 passed |

The route is genuinely thin, and the thinness is what makes the story verifiable:
`src/factorflow/api/routes/coverage.py` contains no arithmetic, no SQL and no
provider import (confirmed by reading every line of its 137 lines — the only
non-mapping logic is the two pre-database validations the plan names). Every
acceptance criterion traces to a real HTTP-level assertion against a real
PostgreSQL container, not to a mock of the service: the presence map is asserted
as a full four-key dict with all three states, `gap_count` is asserted `is None`
**and** `!= 0` on an unavailable view, the empty store and a
nothing-matching filter are asserted to differ, and 501 is asserted `!= 200`
as well as `== 422`, so a silent clamp cannot pass.

I independently reran every validation command in the task plan and the tech
stack. All ten exited 0, including the full 248-test `postgres` suite (186s,
with the 3000-instrument volume test actually executing — nothing in
`pyproject.toml` deselects `slow`) and the container-free 462-test suite.
`ruff format --check`, `ruff check` and `mypy src` are clean. The working tree
was clean before validation and clean after it; `uv build` wrote only the
git-ignored `dist/`.

The three LOW findings are evidence-quality and documentation items, none of
which blocks Doc Sync: an approved-story example that the implementation
deliberately and correctly contradicts, a plan citation naming a guard test that
guards something else, and a cost note about gap detection running twice on an
expansion request. No CRITICAL, HIGH or MEDIUM finding exists, so the gate
passes with these recorded.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S3-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E6-S3-run-20260930T025827Z` |
| HEAD | `5077fcf5052174cfabf6f3bee6529096eea24779` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E6-integration-20260930T025827Z` → `8e3f562bc20547e61a55ddddc555314c0542809b` (resolved with `pipeline-state.py review-base --base-ref <integration-branch>`; confirmed an ancestor of HEAD with `git merge-base --is-ancestor`) |
| Working tree | clean — `git status --porcelain` empty; no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 8 (one commit, `5077fcf`) |

The whole change set is a single commit. There is no working-tree work to
separate from it, so the story's change set is unambiguous.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/routes/coverage.py` | added | AC-7, AC-8, AC-17, DAC-E6-10, DAC-E6-S3-1…5; T015, T017 |
| `src/factorflow/api/models.py` | modified (+73/-2) | T014 — appended `# Coverage models — CAP-001-E6-S3` section, `date` import, module docstring line. Nothing existing altered. |
| `src/factorflow/api/app.py` | modified (+2/-1) | T016 — one import name, one `include_router` after `runs.router` and before `_add_static_mount`. Nothing else. |
| `tests/integration/test_api_coverage.py` | added | T001–T009, T011, T012 (TC-COMP-007, 008, 017, 036, 054, 055, 057, 058) |
| `tests/integration/test_api_pagination.py` | added | T010 (TC-COMP-056) |
| `tests/unit/test_api_coverage_routes.py` | added | T013 |
| `…/stories/CAP-001-E6-S3-tasks.md` | modified | T001–T018 checkbox bookkeeping only — verified the diff contains no prose change (`git diff` shows 18 `- [ ]` → `- [x]` lines and nothing else) |
| `…/stories/CAP-001-E6-S3.md` | modified | `status: planning` → `in-review`, one line. Matches the precedent set by `04ac6cc` (CAP-001-E6-S2) and `216d668` (S1). |

No unjustified file. No dependency change, no migration, no `.sql` file, no
`pyproject.toml` change — consistent with the plan's Phase 1 "none required".

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `routes/coverage.py:111-127` (row mapping: `presence` → `data_types`, `covered_from`/`covered_to`, `last_acquired_at`); `models.py:CoverageInstrument` | `test_api_coverage.py::test_coverage_reports_presence_ranges_and_last_acquired` (TC-COMP-007); `test_api_coverage_routes.py::test_fields_map_onto_the_contract` | The integration test asserts the data-type map as a **full dict** (`present`/`present`/`absent`/`unknown`), so a dropped key or a collapsed third state fails, and asserts `covered_from`/`covered_to` as the exact ISO strings and `last_acquired_at` as the exact instant (`2024-01-05T22:14:03Z`, the later of two `acquisition_state` rows). `set(row) == ROW_KEYS` pins the row shape both ways. |
| AC-8 | SATISFIED | `routes/coverage.py:122` (`gap_count=row.gaps.missing_days`), `:128-130` (`gap_detection` built from exactly `available` + `reason`) | `test_api_coverage.py::test_coverage_reports_gap_counts_and_availability` (TC-COMP-008); `test_date_bounds_narrow_gaps` | Three instruments, one missing 2024-01-04: counts asserted `== 0`, `== 0`, `== 1` (measured zeros, not falsy), `gap_detection` asserted as the exact two-key dict so S2's internal whole-view `missing_days` cannot leak, and `expand=CSCO` returns exactly `["2024-01-04"]`. |
| AC-17 | SATISFIED | `routes/coverage.py:127` (`never_acquired=view.never_acquired`, copied unchanged; nothing in the route synthesises it) | `test_empty_store_is_never_acquired` + `test_filter_matching_nothing_is_not_never_acquired` (both TC-COMP-017) | The pair is what matters: the empty store gives `true` with `gap_detection` unavailable **and** the reason, while `symbol=ZZ` on a populated store gives `false` with the same empty `instruments` list. A route that derived the flag from `len(instruments)` fails the second test. |
| DAC-E6-10 | SATISFIED | `routes/coverage.py:41-51` (all six declared parameters, `from`/`to` aliased), `:88-96` (all six forwarded) | `test_symbol_filter_is_a_prefix`, `test_date_bounds_narrow_gaps`, `test_cursor_pages_through_every_instrument_once`, `test_volume_read_of_3000_instruments` (TC-COMP-036); `test_api_coverage_routes.py::test_coverage_route_is_registered_with_its_parameters`, `::test_query_passes_through_to_the_service` | Paging is proven by traversal, not by inspection: five instruments at `limit=2` yield pages of exactly `[2, 2, 1]` whose concatenation equals the ascending five, each once, following `next_cursor` verbatim; at 3000 instruments `limit=500` yields exactly 6 pages and 3000 unique symbols. The unit test asserts the forwarded kwargs as an **exact dict**, so a dropped or renamed parameter fails. |
| DAC-E6-S3-1 | SATISFIED | `routes/coverage.py:122`, `:128-130`; `models.py:CoverageInstrument.gap_count: int \| None` | `test_unavailable_detection_reports_reason_and_null_counts` (TC-COMP-054) | With one instrument holding bars, detection is unavailable: `gap_detection == {"available": False, "reason": "fewer_than_two_instruments_with_data"}`, and **every** row asserts `"gap_count" in row`, `is None` and `!= 0` — absent, present as a key, and not zero, which is exactly the AC's three-way requirement. `expand=AAPL` returns `gap_dates is None`, not `[]`. |
| DAC-E6-S3-2 | SATISFIED | `routes/coverage.py:132-137` (`expanded` built only when `expand` was supplied; `exclude={"expanded"}` on the default path) | `test_gap_dates_only_behind_expansion` (TC-COMP-055); `test_volume_read_of_3000_instruments`; `test_api_coverage_routes.py::test_expansion_is_opt_in` | The negative half is genuinely enforced: the default body asserts `"expanded" not in body` and walks `row.values()` asserting **no value is a list**, so no date list can ride on a collapsed row — including at 3000 instruments, where the default read is also asserted to return 50 rows. The positive half ties the expansion to the count (`len(gap_dates) == gap_count == 2`) so the two cannot drift. The unit test proves `read_gap_dates` is not even called without `expand`. |
| DAC-E6-S3-3 | SATISFIED | `routes/coverage.py:48` (`Query(default=DEFAULT_PAGE_SIZE, gt=0, le=MAX_PAGE_SIZE)`); no clamping expression anywhere in the module | `test_api_pagination.py::test_coverage_page_size_defaults_and_caps` (TC-COMP-056) | 51 seeded instruments: no `limit` → exactly `DEFAULT_PAGE_SIZE` rows and a non-null cursor; `limit=500` → 200 with 51; `limit=501` → asserted **`!= 200`** and `== 422` with `resource == "coverage"`; `limit=0` → 422. The `!= 200` assertion is the one that would catch a clamp. Bounds are imported from `factorflow.api.bounds`, not hard-coded. |
| DAC-E6-S3-4 | SATISFIED | `routes/coverage.py:44-45` (`lifecycle` omitted by default, `Literal["active","retired"]`), `:91` (forwarded unchanged) | `test_lifecycle_filter_and_default_includes_retired` (TC-COMP-057) | MSFT is retired through the real `DELETE /api/instruments/MSFT` endpoint, not by direct INSERT, so the test proves retirement-through-the-API keeps coverage. Default returns both rows with MSFT's `covered_from`/`covered_to` unchanged; `lifecycle=active` and `lifecycle=retired` each return exactly one; `lifecycle=archived` is 422 `validation_error`. |
| DAC-E6-S3-5 | SATISFIED | `routes/coverage.py:67-75` (checked before `request.app.state.db_pool` is touched) | `test_inverted_range_is_rejected` (TC-COMP-058); `test_api_coverage_routes.py::test_inverted_range_is_rejected_before_the_service` | The envelope is asserted in full — `code`, `resource == "coverage"`, a message naming both `` `from` `` and `` `to` ``, and a non-empty `request_id`. The equal-bounds case (`from == to`) returns 200, so the comparison is `>` and not `>=`. The unit test asserts the `read_coverage` spy has **zero** calls, proving rejection precedes the service rather than merely preceding the response. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/integration/test_api_coverage.py:1-161` | Docstring cites the story and design sections 2.4a/7/11 and lists the eight TCs. `pytestmark = pytest.mark.postgres` at module level. `coverage_env` applies every `migrations/*.sql` in sorted order and commits, sets `FACTORFLOW_DATABASE_URL`, opens `TestClient(create_app())` as a context manager (so the lifespan opens the pool) and yields `(client, seed_conn)` with a separate `psycopg.connect`, closed in `finally`. All four seed helpers exist and commit; `_instrument` sets `retired_at = now()` only for `retired`, satisfying `instrument_retired_at_agrees`; `_bars` uses a 32-byte `sha256(...).digest()`; `_state` sets `last_run_id = uuid.uuid4()`. All four constants present with the values the plan names. `tests/conftest.py` is untouched, as required. |
| T002 | complete | VERIFIED | `test_coverage_reports_presence_ranges_and_last_acquired:165-211` | Arrangement matches the plan (both instruments get `reference` + `prices` over the same range and bars on all four days; AAPL alone gets `prices`/`written` and `fundamentals`/`not_found` state and no fundamentals segment; no `corporate_actions` row at all). All eight planned assertions present, including `set(body) == TOP_KEYS` and row ordering `["AAPL","MSFT"]`. |
| T003 | complete | VERIFIED | `test_coverage_reports_gap_counts_and_availability:215-231` | Exact-dict `gap_detection` comparison and exact-dict `expanded` comparison, both as planned. Counts compared `== 0` / `== 1`, not truthiness. |
| T004 | complete | VERIFIED | `test_empty_store_is_never_acquired:235-247`; `test_filter_matching_nothing_is_not_never_acquired:251-262` | Both planned cases implemented, split across two functions. Case (a) asserts the reason as well as `available: False` (Resolved Conflicts #4), and I confirmed the reason is genuinely produced by `coverage/service.py:78,159` (`_UNAVAILABLE` on the never-acquired branch) rather than patched in by the route — the route copies `view.gap_detection` verbatim. The "two responses must differ" property is proven by the pair of assertions across the two tests. |
| T005 | complete | VERIFIED | `test_unavailable_detection_reports_reason_and_null_counts:266-285` | Arrangement matches (AAPL with prices+bars missing 01-03; BABA with a fundamentals segment only, so two rows but one data-holding instrument). Every planned assertion present, including the explicit `!= 0` guard and the `gap_dates is None` expansion check. |
| T006 | complete | VERIFIED | `test_gap_dates_only_behind_expansion:289-307` | `_priced("BABA", [D2, D4])` expresses "lacks 01-03 and 01-05" over a 01-02..01-05 segment — equivalent to the plan's wording. All five planned assertions present, including the `row.values()` list walk on both the default and the expanded read. |
| T007 | complete | VERIFIED | `test_lifecycle_filter_and_default_includes_retired:311-332` | Retirement via the real `DELETE` endpoint (status asserted 200), all four planned assertions present. Lives in `test_api_coverage.py` as the plan's "Retire-keeps-coverage test placement" note directs, because `test_api_instruments.py`'s fixture applies migration 0001 only — I confirmed that at `tests/conftest.py:131-146`. |
| T008 | complete | VERIFIED | `test_inverted_range_is_rejected:336-351` | All five planned assertions present, including the equal-bounds 200 and the malformed `from=2024-13-01` → 422. |
| T009 | complete | VERIFIED | `test_symbol_filter_is_a_prefix:355-364`; `test_date_bounds_narrow_gaps:368-381`; `test_cursor_pages_through_every_instrument_once:385-404` | All three planned groups implemented: prefix `symbol=AA` → `["AAL","AAPL"]`; bounded gap count 1 vs unbounded 2 with the bounded expansion returning `["2024-01-03"]`; three pages of `[2,2,1]` following `next_cursor` verbatim. "The last page has `next_cursor is None`" is proven by the loop's termination condition rather than a separate assertion — equivalent, since the loop cannot exit otherwise. |
| T010 | complete | VERIFIED | `tests/integration/test_api_pagination.py:1-75` | New file with its own fully-migrated `TestClient` fixture and the `postgres` mark, 51 seeded instruments each with a `prices` segment. All four planned assertions present; `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE` imported rather than hard-coded, as the plan requires. |
| T011 | complete | VERIFIED | `test_volume_read_of_3000_instruments:409-449` | Marked `@pytest.mark.slow` **in addition to** the module's `postgres` mark. 3000 instruments and their segments seeded in one `INSERT … SELECT` each; bars for the first three only. Asserts exactly 6 pages, 3000 unique symbols, a 50-row default, `ROW_KEYS` and no list value, and `"expanded" not in body`. No elapsed-time assertion, per the plan's Open Gap 5. I confirmed this test actually executed: `pyproject.toml` declares the `slow` marker but no `addopts` deselecting it, and the verbose run lists it as PASSED. |
| T012 | complete | VERIFIED | `test_omitted_range_covers_everything:453-466`; `test_depth_shortfall_is_null_when_met:470-482`; `test_expansion_errors_and_normalisation:486-505` | All three planned groups implemented. The depth test is the one I checked hardest, because it only discriminates if the shortfall is computed from segment extent rather than observed bars: DEEP and SHAL are given **identical** bar sets and differing segment ranges, and DEEP asserts `None` while SHAL asserts an `int > 0`. I traced this to `coverage.sql:19-21` (`acquired_from`/`acquired_to` are the unfiltered segment min/max) and `service.py:81-91`, confirming the test genuinely distinguishes the two derivations. The exact integer is deliberately not pinned. |
| T013 | complete | VERIFIED | `tests/unit/test_api_coverage_routes.py:1-206` | Follows the `_FakePool` / `TestClient(app, raise_server_exceptions=False)` precedent with no lifespan. Every one of the plan's seven bullet groups is implemented: route registration with the exact parameter-name set (pinning the `from`/`to` aliases); field mapping for all five mappings including `None`→`null` and `0`→`0` for `gap_count` and the two-key `gap_detection`; exact-dict pass-through; inverted range with a zero-call spy; `psycopg.OperationalError` → 500 `internal_error` with `"driver detail xyz" not in response.text`; `InstrumentNotFound` → 404; and expansion opt-in with a one-call, correct-argument check. The spies return **real** `CoverageView` / `InstrumentCoverage` / `GapDetection` / `Presence` instances, so the pydantic mapping is genuinely exercised rather than bypassed. |
| T014 | complete | VERIFIED | `models.py:250-316` | All five models with the plan's field names and types. `Literal["present","absent","unknown"]` is expressed once as the `PresenceState` alias and reused — equivalent, and mypy confirms. `date` imported beside `datetime`; module docstring's contributing-stories list updated; docstrings cite the story, design section 11 and Open Gaps 1–2. Appended after the run models; nothing existing modified. |
| T015 | complete | VERIFIED | `routes/coverage.py:1-137` | Handler signature matches the plan parameter for parameter, including `response_model=None` and the `from`/`to` aliases. Both pre-database validations are in the planned order and genuinely precede `db_pool` access. `read_coverage` and `read_gap_dates` are imported into the module namespace (`:27`), which is what makes T013's monkeypatching possible. No cursor handler is added, correctly: I checked `coverage/service.py` and it exposes no cursor exception, which is the plan's "otherwise add no handler" branch. No bare `except ValueError` and no `except psycopg.Error` anywhere, so a database failure propagates to `internal_error_handler` (OPS-ERR-001) — proven by T013's 500 test. `model_dump(mode="json", exclude=…)` is exactly as specified. No coverage arithmetic, no SQL, no `massive_client` import. |
| T016 | complete | VERIFIED | `app.py:25`, `app.py:312` | `coverage` added to the existing routes import; `include_router(coverage.router)` placed after `runs.router` and before `_add_static_mount(app)`, so `/api/coverage` is matched ahead of the SPA fallback. Nothing else touched. `_resource_for_path` needs no entry — I verified its last-segment fallback at `app.py:279` yields `"coverage"` for `/api/coverage`, and the integration tests assert `resource == "coverage"` on two distinct 422 paths, so this is proven rather than assumed. |
| T017 | complete | VERIFIED | `routes/coverage.py:52-65` (handler docstring), `:67` (DAC-E6-S3-5 comment), `:44` (DAC-E6-S3-4 / AC-21 comment) | Both PROVISIONAL contract choices are recorded in the handler docstring citing Open Gaps 1–2, and both required one-line comments are present with the cited AC IDs. |
| T018 | complete | VERIFIED | See Independent Validation | I reran all five commands myself rather than trusting the claim. All exited 0. |

Phase checkpoints: Phase 1's `uv sync --all-extras` exits 0 on this branch;
Phase 3's and Phase 4's checkpoints are subsumed by the passing unit and
`postgres` suites; Phase 5's "every validation command exits 0" is confirmed
below. Task dependency order (T014 → T015 → T016/T017 → T018) is consistent
with the single commit's content.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_coverage_reports_presence_ranges_and_last_acquired` / TC-COMP-007 | ADEQUATE | Proves the route reports all three presence states for all four data types from a real store, the exact covered range, and the **latest** of two `acquisition_state` timestamps. Full-dict and `set(row) == ROW_KEYS` equality mean a dropped key, an extra key or a collapsed state all fail. | none |
| `test_coverage_reports_gap_counts_and_availability` / TC-COMP-008 | ADEQUATE | Proves per-instrument counts are distinct (0/0/1) and that the view-level object serialises to exactly two keys — the assertion that catches S2's internal `missing_days` leaking into the HTTP contract. The expansion names the exact missing date. | none |
| `test_empty_store_is_never_acquired` + `test_filter_matching_nothing_is_not_never_acquired` / TC-COMP-017 | ADEQUATE | Together they are the regression-sensitive pair: both return `instruments == []`, and only the flag and `gap_detection` differ. Any implementation that inferred `never_acquired` from an empty list fails the second. | none |
| `test_unavailable_detection_reports_reason_and_null_counts` / TC-COMP-054 | ADEQUATE | Iterates **every** row rather than sampling one, and asserts key-presence, `is None` and `!= 0` separately, so a falsy check, an omitted key and a zero are three distinguishable failures. | The `!= 0` assertion is logically implied by `is None`; harmless, and the plan asked for it explicitly. |
| `test_gap_dates_only_behind_expansion` / TC-COMP-055 | ADEQUATE | The `row.values()` list walk is the right shape of assertion for a "must not contain" requirement — it fails for any future date list added to a row, not merely for a key named `gap_dates`. Count and expansion are tied (`len == gap_count == 2`). | none |
| `test_lifecycle_filter_and_default_includes_retired` / TC-COMP-057 | ADEQUATE | Retires through the real API rather than by INSERT, so it also covers design AC 2 and the "Retire keeps coverage" case, and asserts the covered range is unchanged after retirement — the property AC-21 actually cares about. All three filter states plus the invalid one. | none |
| `test_inverted_range_is_rejected` / TC-COMP-058 | ADEQUATE | Asserts the whole envelope, not just the status, and the `from == to` case pins the comparison operator. | none |
| `test_symbol_filter_is_a_prefix`, `test_date_bounds_narrow_gaps`, `test_cursor_pages_through_every_instrument_once` / TC-COMP-036 | ADEQUATE | Paging is verified by actually traversing with the returned cursor and asserting page sizes and the full ascending union — a keyset bug that skipped or duplicated an instrument fails. The date-bound case is the strongest: the same instrument yields `gap_count == 1` bounded and `== 2` unbounded, so a bound silently ignored fails. | none |
| `test_volume_read_of_3000_instruments` / TC-COMP-036, TC-COMP-055 | ADEQUATE | Exact page count (6), exact unique-symbol count (3000), and the row-shape/no-list invariant re-asserted at volume. Deterministic: generated symbols, fixed dates, no clock, no randomness, no elapsed-time assertion. | No latency bound — correct, per Open Gap 5. |
| `test_coverage_page_size_defaults_and_caps` / TC-COMP-056 | ADEQUATE | The `!= 200` assertion is what distinguishes "rejected" from "clamped"; 51 seeded rows make the `limit=500` acceptance observable rather than vacuous. Bounds imported, so the test tracks the constants. | none |
| `test_omitted_range_covers_everything` / T012 | ADEQUATE | A March-2022 gap is reported on an unbounded read, which is exactly the false negative a trailing-window default would produce. | none |
| `test_depth_shortfall_is_null_when_met` / T012 | ADEQUATE | Identical bar sets with differing segment ranges make the test fail for any implementation that derived depth from observed bars; asserts `None` (not `0`) for the met case and only `int > 0` for the short case, correctly refusing to pin S1's PROVISIONAL rounding. | none |
| `test_expansion_errors_and_normalisation` / T012 | ADEQUATE | Covers all three expansion outcomes the Open Gap 1 contract declares — unknown → 404 with code and resource, malformed → 422, lowercase → 200 with the normalised symbol. | none |
| `test_api_coverage_routes.py` (7 tests) / T013 | ADEQUATE | Mocks do not make the result inevitable: the spies return real service dataclasses, so pydantic validation, `.value` extraction and JSON date/datetime rendering all genuinely execute. The two zero-call assertions (`read_coverage` on an inverted range, `read_gap_dates` without `expand`) verify *absence* of work, which no integration test can. The 500 test asserts the driver string is absent from the whole response text, not merely from one field. Isolated and deterministic: no container, no network, no clock. | Pass-through asserts `kwargs` only; the connection argument is positional and unasserted. Immaterial — the `_FakePool` is the only possible source. |

Mandatory mapping: every TC-ID the coverage matrix assigns to this story's ACs
(TC-COMP-007, 008, 017, 036, 054, 055, 056, 057, 058) is implemented, carries an
`# Implements TC-COMP-0nn` comment, and sits in the file the ingestion-api design
section 7 names for it — including TC-COMP-056 in `test_api_pagination.py`.

## Independent Validation

Every command was run by me in this session at HEAD `5077fcf`. None was
substituted for a narrower one.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 46 packages, checked 43. Phase 1 checkpoint. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and the wheel into the git-ignored `dist/`. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 170 files already formatted. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files. The one `# type: ignore[arg-type]` (`routes/coverage.py:115`) is justified: the service types `lifecycle` as `str` while the model needs the `Literal`, and `migrations/0001…sql:11` (`instrument_lifecycle_known`) plus pydantic validation make the narrowing sound. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 462 passed, 248 deselected, 13.34s. |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 248 passed, 462 deselected, 186.38s, against a real `postgres:16` testcontainer. Includes the `slow` 3000-instrument test — nothing deselects it. |
| `uv run pytest -m postgres tests/integration/test_api_coverage.py tests/integration/test_api_pagination.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 16 passed, individually named in the verbose output. A superset of the plan's per-AC `-k 007/008/017/036/054/055/057/058` commands, run as whole files rather than eight narrower slices. |
| `uv run pytest tests/unit/test_api_coverage_routes.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 7 passed. Plan's "contract and error mapping without a container". |
| `uv run pytest tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/integration/test_api_binding.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 11 passed. Plan's regression set, with the new route registered. |

`uv run pytest` (the tech stack's "Test (full)") was not issued as a separate
command. It is fully accounted for: the `postgres` and `not postgres` marker sets
are complementary and disjoint, and 462 + 248 = 710 is the whole collected
suite, so both runs together are the full suite rather than a narrower subset.

Nothing was excluded. In particular, no `postgres`-marked test was skipped:
Docker was available (`docker info` succeeded) and the container-backed suite ran
in full.

### Validation Side Effects

- Before: `git status --porcelain` empty; HEAD `5077fcf`; branch `usr/alvaro-de-jodra/CAP-001-E6-S3-run-20260930T025827Z`.
- After: `git status --porcelain` empty; HEAD unchanged.
- Unexpected tracked-file changes: none. `uv build` wrote `dist/` and `build/`, both matched by `.gitignore:13,17`, so no tracked file was created or modified and no review-relevant file appeared. No restoration was necessary or performed.

## Findings

### IR-001 — The story's example JSON still shows `depth_short_by_years: 0`, which the implementation deliberately contradicts

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-7
- **Tasks**: T012, T014
- **Files**: `docs/…/stories/CAP-001-E6-S3.md:91`; `src/factorflow/api/models.py:CoverageInstrument.depth_short_by_years`; `tests/integration/test_api_coverage.py:480`
- **Claim challenged**: That the approved story's `200` example describes the response this story ships.
- **Observed evidence**: The story's contract example shows `"depth_short_by_years": 0`. The implementation returns `null` when the stated depth is met (`models.py` types the field `int | None`; `routes/coverage.py:123` copies `row.depth_shortfall_years`, which `coverage/service.py:85-91` returns as `None` when met), and `test_depth_shortfall_is_null_when_met` asserts exactly that. So a reader of the approved story sees a value the API never produces for a met depth.
- **Expected evidence/behavior**: The implementation is correct, not the story. `component-design-coverage-service.md` section 2.4 and its AC 7, DAC-E6-S1-3, and STD-UI-4 ("Zero MUST represent only a measured zero") all require `null`, and the task plan resolves the conflict explicitly (Resolved Conflicts #1: "An illustrative snippet ranks below normative design prose and acceptance criteria… The example's value should be corrected at the story's next revision"). This finding exists so the correction is not lost.
- **Impact**: Documentation only. A consumer of the story — notably CAP-001-E6-S4's Coverage screen — could code against `0` and render "0 years short" where the product means "depth met".
- **Required remediation**: None in code. Record the correction for the story's next revision (Doc Sync is the right place), changing the example's `depth_short_by_years` to `null`. Do not change the implementation.

### IR-002 — T015's "no provider import" constraint cites a guard test that guards something else

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (constraint C1)
- **Tasks**: T015
- **Files**: `docs/…/stories/CAP-001-E6-S3-tasks.md:427-428`; `tests/unit/test_api_isolation.py:1-30`; `src/factorflow/api/routes/coverage.py:12-29`
- **Claim challenged**: The task plan's final T015 bullet — "Do no coverage arithmetic, run no SQL, and do not import `massive_client` (C1, `tests/unit/test_api_isolation.py`)" — which implies a named test enforces the constraint.
- **Observed evidence**: The constraint itself holds: I read every import in `routes/coverage.py` and there is no `massive`, no provider and no SQL, and `mypy`/`ruff` confirm the module's dependency set. But `tests/unit/test_api_isolation.py` asserts only that no route declares a `Security`/`Depends` dependency (DAC-E1-S6-6); it never inspects imports. `tests/unit/test_massive_package_boundary.py` checks the Massive package's own exports, not API route imports. No automated test would fail if a future edit imported a provider client into a route module.
- **Expected evidence/behavior**: Either a guard test that actually enforces the constraint the plan cites, or a plan that does not name a test as its evidence. Constraint 2 of this review forbids accepting a cited test as proof without reading it.
- **Impact**: None today — the constraint is satisfied. The risk is that a later story trusts the citation and assumes regression protection that does not exist.
- **Required remediation**: Optional and out of this story's scope. If addressed, prefer one shared import-boundary test covering every module under `factorflow.api.routes` (asserting no transitive import of `factorflow.ingestion.massive`), as its own change rather than a local edit here.

### IR-003 — An expansion request runs whole-store gap detection twice

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S3-2
- **Tasks**: T015
- **Files**: `src/factorflow/api/routes/coverage.py:88-101`; `src/factorflow/coverage/service.py:184,235`
- **Claim challenged**: The task plan's Open Gap 1 derivation that "A single-symbol parameter costs one `read_gap_dates` call per expansion, whereas page-wide dates would cost up to 500 whole-view gap queries."
- **Observed evidence**: `read_coverage` already calls `gaps.detect_gaps` internally (`service.py:184`), and `read_gap_dates` calls it again (`service.py:235`). A `GET /api/coverage?expand=X` therefore performs two full `gaps.sql` executions over the resolved range for the whole store, not one detection plus a cheap per-instrument lookup. The costing in the plan's derivation counts only the second call.
- **Expected evidence/behavior**: `component-design-ingestion-api.md:320` names coverage at 3000 instruments as the heaviest read in the product, and the story's own Description says it is why the screen does not auto-poll — so the true cost of an expansion is worth stating accurately.
- **Impact**: An expansion request is roughly twice as expensive as the plan's derivation implies. No correctness consequence, no acceptance criterion affected, and no latency target exists to breach (Open Gap 5). The volume test passes.
- **Required remediation**: None in this story's code — the route calls S2's interface exactly as the plan mandates, and avoiding the duplication requires changing `read_gap_dates`'s contract, which is out of scope. Record the corrected cost against Open Gap 1 when ingestion-api section 11 absorbs the `expand` contract, and treat any reuse of a single detection result as its own coverage-service change.

## Previous Review Disposition

Not applicable — initial review.

Note: the LIKE-wildcard property of the `symbol` prefix filter (`_` and `%` in
the supplied prefix act as wildcards) is deliberately **not** re-raised here. It
is already recorded as a LOW against CAP-001-E6-S1
(`CAP-001-E6-S1-implementation-review-v2.md`, IR-004), lives in
`coverage/sql/coverage.sql` rather than in any file this story changed, and this
story's plan explicitly directs passing the filter through raw to follow the
`GET /api/instruments` precedent. Restating it would be double-counting a
pre-existing, owned finding.

## Scope and Plan Deviations

- **No scope leakage.** All eight changed files are justified. The two production files this story did not create (`models.py`, `app.py`) were touched additively only: `models.py` gains an appended section plus one import and one docstring line; `app.py` gains one import name and one `include_router` call. No existing symbol, signature or behaviour was altered, so no backward-compatibility question arises.
- **Justified deviation (T014):** the plan specifies `Literal["present","absent","unknown"]` on each of the four presence fields; the implementation declares it once as `PresenceState` and reuses it. Type-identical, and it follows the file's existing style. Accepted.
- **Justified deviation (T004):** the plan's two cases (a) and (b) are implemented as two test functions rather than one. Both sets of assertions are present and the contrast the plan requires is preserved across the pair. Accepted.
- **Justified deviation (T009):** "the last page has `next_cursor is None`" is enforced by the traversal loop's exit condition rather than a standalone assertion. Logically equivalent. Accepted.
- **Bookkeeping consistent.** All 18 tasks are checked and all 18 are independently VERIFIED — no checked-but-unimplemented task and no unchecked-but-implemented task. The `status: planning` → `in-review` change to the story is the established story-coding convention in this repo (`04ac6cc`, `216d668`) and is not treated as an unjustified edit.
- **Artifact status note, non-blocking:** `CAP-001-E6-S3-tasks.md` still carries `status: draft` in its frontmatter while every task is complete. Consistent with S1 and S2 at the same stage; recorded for Doc Sync rather than as a finding.
- **No unattended-mode decision was required.** Every question this review raised was answerable from the story, the task plan, the component designs, the coverage matrix, the constitution or the repository itself. Nothing was assumed, so no decision record is owed.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to Doc Sync for CAP-001-E6-S3 with the three LOW findings recorded. IR-001 gives Doc Sync a concrete documentation correction (the story's `depth_short_by_years: 0` example, and the `expand` / `expanded` contract to absorb into `component-design-ingestion-api.md` section 11 and system design 4.2 per Open Gap 1). IR-002 and IR-003 need no code change; carry them forward as recorded notes.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
