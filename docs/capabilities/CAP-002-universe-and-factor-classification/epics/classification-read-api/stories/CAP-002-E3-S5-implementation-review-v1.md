---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-03
updated: 2026-11-03
story_id: "CAP-002-E3-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-03T23:30:35Z"
reviewed_head: "bcdff3ef63ee0dca42e0feb4af55bcd66b55e0c7"
review_base: "aed93bd8debe45c4c2dbc2de6a9c120d879041a9"
reviewed_state_revision: "sha256:28bb9f1c4bb31150fb46855f7f4ec438c0143e2dea1c0b7ea51254b4c1992ab3"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E3-S5
    artifact_version: 1
    content_revision: sha256:b737301094032490f55bf65d3c31069652614f1747e0e66963c66c1b4bdcec87
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.317"
  timestamp: 2026-11-03T23:30:35Z
  source_artifacts:
    - id: CAP-002-E3-S5
      version: "1 (sha256:b737301094032490f55bf65d3c31069652614f1747e0e66963c66c1b4bdcec87)"
    - id: CAP-002-E3-S5-tasks
      version: "1 (updated 2026-11-03)"
    - id: CAP-002-E3-S5-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-api-component-tests
      version: "1"
    - id: DEC-0138
      version: "applied, owner upheld"
    - id: DEC-0139
      version: "applied, owner upheld"
    - id: DEC-0140
      version: "applied, owner upheld"
    - id: DEC-0141
      version: "applied, owner upheld"
    - id: DEC-0281
      version: "open, decided_by agent (story coding)"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S5 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 6 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 14/16 satisfied |
| Planned tasks | 18/23 verified |
| Required validation | 6/7 passed |

The production code is sound as far as this review could test it. The router,
the query and response models and the one-line mount in `app.py` do what the
story, design 2.4 to 2.7 and DEC-0138 to DEC-0141 specify. All 92 catalogue
mutants are killed, and ruff, ruff format, mypy and the full non-postgres suite
(1607 passed) are clean.

The gate fails on the tests, for three reasons:

- **The required postgres suite fails.** The coder never ran the story's
  integration files: the TDD evidence says they were "written but never run;
  PostgreSQL and Docker are absent on this machine". This review ran them,
  unsandboxed, against the `postgres:16` testcontainer the suite starts. Docker
  is reachable here outside the sandbox. `uv run pytest -m postgres`
  reports `5 failed, 906 passed`. All five failures are the story's own tests,
  and all five fail on the same cause: they seed an `acquisition_run` in state
  `running` without a claim, which `acquisition_run_claim_agrees` refuses
  (IR-001).
- **One of the failing tests is also invalid by design.** It asserts an order
  the reader leaves open (IR-002).
- **The tests are weaker than the plan requires.** T012 and T013 omit planned
  cases (IR-003). Eight of the twelve mutants this review added by hand survive
  both the unit suites and the passing integration tests. Each survivor removes
  behaviour DEC-0138, DEC-0139, design 2.5, T010, T017 or T019 specifies
  (IR-004 to IR-007).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S5-run-20261103T225646Z` |
| HEAD | `bcdff3ef63ee0dca42e0feb4af55bcd66b55e0c7` (one commit over the base: `feat(CAP-002-E3-S5): classifications router, models and mount`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E3-integration-20261103T225646Z` → `aed93bd8debe45c4c2dbc2de6a9c120d879041a9` (`pipeline-state.py review-base --base-ref …`; ancestor of HEAD, checked with `git merge-base --is-ancestor`) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty) |
| Changed files reviewed | 20 |
| Baseline | none: initial review |

`pipeline-state.py check … --stage adversarial-review` with the driver's
`--base-ref` reports `READY — story is ready for independent review`. Without
`--base-ref` it reports `BLOCKED`, because its TDD lint then resolves the base
against the remote default branch.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/routes/classifications.py` | added | AC-9, AC-13, AC-16 to AC-18, AC-20 to AC-22; T017 to T019 |
| `src/factorflow/api/classification_models.py` | modified | AC-9, AC-16, DAC-E3-11, DAC-E3-S5-2 to S5-4; T015, T016 |
| `src/factorflow/api/app.py` | modified | DAC-E3-S5-6; T020 (the import line is wrapped by `ruff format`, which T020 allows) |
| `tests/unit/test_api_classifications_routes.py` | added | T003 to T006, T008, T011 |
| `tests/unit/test_api_classification_models.py` | modified (additive) | T004, T006, T010 |
| `tests/unit/test_api_classification_error_mapping.py` | modified (additive) | T007, T009 |
| `tests/integration/api_classification_support.py` | added | T002; `complete_set` and `later_set` are test-support additions used by T012 and T013 |
| `tests/integration/test_api_classifications.py` | added | T012 |
| `tests/integration/test_api_classification_summary.py` | added | T013 |
| `tests/integration/test_api_classification_host_origin.py` | modified (additive) | T014 |
| `…/stories/CAP-002-E3-S5.md` | modified | status `planning` → `in-review` (story coding hand-off) |
| `…/stories/CAP-002-E3-S5-tasks.md` | modified | 23 checkboxes ticked; `updated` date |
| `…/stories/CAP-002-E3-S5-tdd-evidence.yaml` | added | T023 |
| `…/stories/CAP-002-E3-S5-evidence/cycle-1.patch` | added | T023 (reviewed patch) |
| `…/stories/CAP-002-E3-S5-evidence/red-cycle-1.log` | added | T023 |
| `…/stories/CAP-002-E3-S5-evidence/green-cycle-1.log` | added | T023 |
| `…/stories/CAP-002-E3-S5-evidence/code-review-cycle-1.txt` | added | T023 |
| `…/stories/CAP-002-E3-S5-evidence/spec-drift-cycle-1.txt` | added | T023 |
| `…/stories/CAP-002-E3-S5-evidence/mutation-cycle-1-mutants.json` | added | T023 (mutation evidence) |
| `…/stories/CAP-002-E3-S5-evidence/mutation-cycle-1-results.json` | added | T023 (mutation evidence) |

No changed file is unjustified. `git diff aed93bd HEAD --stat -- src/ tests/`
lists exactly the ten source and test files above.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `classification_models.py` `FactorCellResponse` (E1-S6) via `_cell_response`; `routes/classifications.py:_json` uses `model_dump(mode="json")` | `test_api_classification_models.py::test_a_classified_cell_keeps_its_stored_precision_as_a_string`, `…negative_score…`; `test_api_classifications_routes.py::test_a_score_travels_as_a_decimal_string_on_the_wire` | `"12.345600"` stays a string with its trailing zeros. `json.loads(parse_float=refuse)` proves the wire carries no numeric token |
| AC-13 | SATISFIED | `ClassificationSummaryResponse.from_reader` copies `stocks_current` | `test_the_summary_body_carries_both_stock_counts` (unit); `test_api_classification_summary.py::test_the_summary_counts_the_current_stocks` (postgres, passes) | The API serialises the reader's count. The `outdated` case is untested (IR-003) |
| AC-16 | SATISFIED | `ClassificationListQuery`, `to_filters`, `compare_conflicts`; route `list_classifications` | `test_the_list_read_passes_every_filter_to_the_reader`, `test_symbols_with_another_filter_is_422_naming_the_filter`, TC-COMP-125/126 tests; postgres `test_thresholds_and_hide_incomplete…`, `test_sort_orders…`, `test_a_universe_scopes…`, `test_compare_reports…` (pass) | A zero-valued bound reaching the reader is not pinned (IR-006); empty compare entries are dropped (IR-007) |
| AC-17 | SATISFIED | `StockEvidenceResponse.from_reader`; `_symbol` dependency | `test_the_evidence_body_carries_every_input_field_and_the_memberships`; postgres `test_the_evidence_shows_inputs_with_their_dates_and_memberships` (passes) | The planned "before any set" and retired-universe cases are missing (IR-003) |
| AC-18 | SATISFIED | `StockHistoryResponse.from_reader`; route `stock_history` | `test_the_set_and_history_reads_serialise_their_rows`; postgres `test_the_history_lists_earlier_sets_newest_first_without_the_current_one` (passes) | The planned `sets: []` case for a never-classified stock and the `restated_possible` assertion are missing (IR-003) |
| AC-20 | PARTIAL | `_SetBlocks.parts`, `_later_block`, `SetResponse.from_reader` | Unit: TC-COMP-173 tests and `test_the_set_body_carries_every_field_of_a_failed_set` pass. Postgres: every through-the-store case for a newer `building` or `failed` set fails at seeding (`test_the_list_carries…`, `test_a_newer_set_is_carried_as_later…`, `test_the_sets_list_and_detail_agree`) | Serialisation is proven with a doubled reader only. The planned real-store evidence fails (IR-001, IR-002) |
| AC-21 | PARTIAL | `SetBlock` via `_set_block`; `SetResponse.run_started_at`, `ended_at` | Unit: `test_the_set_body_carries_every_field_of_a_failed_set`. Postgres: `test_the_sets_list_and_detail_agree` fails at seeding | The sets read is not proven against the store (IR-001) |
| AC-22 | SATISFIED | `_factor_summaries(None)` zero record (DEC-0140); `never_classified` copied | TC-COMP-173 tests; postgres `test_nothing_classified_says_so` and `test_before_any_complete_set…` pass their no-set assertions before failing at the `building` seed | "Says nothing is classified" is proven against the store. The first-set-`building` half belongs to AC-20/IR-001 |
| DAC-E3-7 | SATISFIED | `_compare_symbols` validator; route calls `reader.compare` | TC-COMP-125 tests; `test_compare_reports_unknown_symbols_and_its_stocks`; postgres `test_compare_reports_unknown_symbols_and_enforces_its_bounds` (passes) | |
| DAC-E3-11 | SATISFIED | One builder, `_SetBlocks.parts`, is the base of both responses | `test_a_current_set_with_a_newer_one_carries_equal_blocks_on_both_reads`, `test_a_first_set_that_is_not_complete_is_carried_as_later_on_both_reads` | The shape is equal by construction. The store-level equality test fails (IR-001) |
| DAC-E3-S5-1 | SATISFIED | `/summary` declared second, before every parameterised path | `test_summary_reaches_the_summary_handler_not_a_path_parameter`, `test_the_router_lists_summary_before_the_parameterised_paths` | |
| DAC-E3-S5-2 | SATISFIED | `_compare_symbols` with `classification_bounds` constants | `test_compare_outside_the_bounds_is_refused_on_symbols`, `test_compare_outside_the_bounds_is_422_and_the_reader_is_not_called` | The fixture doubles every reader read to raise, so reaching the reader would be a 500 |
| DAC-E3-S5-3 | SATISFIED | `_SetBlocks.parts`, `_factor_summaries` | `test_never_classified_list_and_summary_share_one_shape` | |
| DAC-E3-S5-4 | SATISFIED | `FactorCellResponse` Decimal fields; `restated_possible: bool` required | TC-COMP-070 tests (three in the models file, one through the route) | |
| DAC-E3-S5-5 | SATISFIED | `REFUSALS`, `_refuse`, `_reason` | `test_an_unknown_symbol_on_evidence_is_the_documented_envelope`, `test_an_unknown_symbol_on_history_names_the_history_read` | The exact envelope keys and the request id are pinned, and no class name, traceback or path appears |
| DAC-E3-S5-6 | SATISFIED | `app.py` `include_router(classifications.router)` before the middleware and the static mount | TC-COMP-126 tests (the static mount exists, so the ordering assertion runs, not skips); postgres host-origin classification tests (pass) | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Every named producer imports and is used: the reader exports, `classification_models` (E1-S6 classes with `from_reader`), `classification_bounds`, `reader_seed` | E1-S6 shipped no shared error-mapping module; the mapping is router-private, as DEC-0139 provides |
| T002 | complete | VERIFIED | `tests/integration/api_classification_support.py:classification_app` | Works: 16 of the 21 story postgres tests pass through it. The docstring says `reader_seed` commits, which matches `reader_seed.py`, where every helper calls `conn.commit()`. The added `later_set` helper carries IR-001's defect |
| T003 | complete | VERIFIED | `test_api_classifications_routes.py` lines 203–232 | TC-COMP-172 |
| T004 | complete | VERIFIED | models file `test_compare_outside_the_bounds_is_refused_on_symbols` and siblings; routes file lines 242–264 | TC-COMP-125 |
| T005 | complete | VERIFIED | routes file lines 270–330 | TC-COMP-173 |
| T006 | complete | VERIFIED | models file TC-COMP-070 tests; routes file `test_a_score_travels_as_a_decimal_string_on_the_wire` | |
| T007 | complete | VERIFIED | error-mapping file lines 340–368 | TC-COMP-148 |
| T008 | complete | VERIFIED | routes file lines 355–401 | (b) asserts the request id on the list route only, not on the summary too (IR-010) |
| T009 | complete | PARTIAL | error-mapping file lines 371–490 | Survivors `classifications.py:72:manual:1`, `73:manual:2`, `56:manual:4`, `182:manual:6`, `219:manual:5`, `47:manual:11` (IR-004, IR-005). The planned `psycopg.OperationalError` row is absent (IR-010) |
| T010 | complete | PARTIAL | models file lines 464–578 | Survivors `classification_models.py:428:manual:3` (IR-006) and `403:manual:10` (IR-007) |
| T011 | complete | VERIFIED | routes file lines 407–621 | (a) to (g) are present; the OpenAPI phrases are pinned |
| T012 | complete | PARTIAL | `tests/integration/test_api_classifications.py` | Three of twelve functions fail (IR-001), and several planned cases are absent (IR-003) |
| T013 | complete | PARTIAL | `tests/integration/test_api_classification_summary.py` | Two of three functions fail (IR-001); one asserts an unspecified order (IR-002); planned cases are absent (IR-003) |
| T014 | complete | VERIFIED | `test_api_classification_host_origin.py` lines 123–152 | All three classification tests pass against `postgres:16` |
| T015 | complete | VERIFIED | `classification_models.py` lines 325–713 | `_cell_response`, `_factors_response` and `_set_block` delegate to E1-S6's existing `from_reader` classmethods. T015's "get no classmethod" was stale, which DEC-0281 records. No E1-S6 class is changed: `grep -cE '^class (FactorCellResponse\|FactorsResponse\|SetBlock)\('` prints 3 |
| T016 | complete | VERIFIED | `ClassificationListQuery` lines 361–450 | `compare_conflicts` takes the query-string names rather than `model_fields_set`, a justified deviation (DEC-0281). Mutant `163:manual:9` (reverting to `model_fields_set`) is killed, which confirms that FastAPI fills defaults in. Score bounds rely on Pydantic's default Decimal `allow_inf_nan=False`: mutant `357:manual:12` is killed. Empty compare entries are skipped (IR-007) |
| T017 | complete | VERIFIED | `routes/classifications.py` lines 41–100 (`REFUSALS`, `_reason`, `_cursor_code`, `_refuse`) | `_cursor_code` follows DEC-0138 step by step. The reader is imported only as `reader`; there is no `psycopg`, universe-service or Massive import |
| T018 | complete | VERIFIED | routes lines 149–197 | Declared first and second; the description carries the three semantics; compare conflicts raise `RequestValidationError` per field |
| T019 | complete | VERIFIED | routes lines 200–254 | `_symbol` path dependency; four distinct operation texts; cursors passed through |
| T020 | complete | VERIFIED | `app.py` import block and `include_router(classifications.router)` after `universes` | The import line is wrapped by `ruff format` (103 characters otherwise), as T020 allows |
| T021 | complete | VERIFIED | Re-run by this review (Independent Validation) | |
| T022 | complete | PARTIAL | Lint, format and mypy are clean | "Run the full validation set" was not done: the postgres suite was never run, and it fails (IR-001) |
| T023 | complete | VERIFIED | `CAP-002-E3-S5-tdd-evidence.yaml` cycle-1; `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings | The RED is a collection `ImportError` at `64251c2`. The cycle honestly discloses the unrun integration files, but its environment claim is wrong (IR-001) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_summary_reaches_the_summary_handler…`, `test_the_router_lists_summary…` / TC-COMP-172 | ADEQUATE | 200 from the summary double, while every other read is doubled to raise; the router order and the six GET paths are pinned | none |
| `test_compare_outside_the_bounds_*`, `test_compare_at_the_bounds_*`, `…after_upper_casing_and_de_duplication` / TC-COMP-125 | ADEQUATE | 0, 1 and 7 symbols give 422 naming `symbols`, with `loc == ("symbols",)` at model level; 2 and 6 reach `compare` with exact arguments; the constants are imported | none |
| `test_never_classified_list_and_summary_share_one_shape`, `…first_set_that_is_not_complete…`, `…current_set_with_a_newer_one…` / TC-COMP-173 | ADEQUATE | `never_classified`, `set`, `later` and `factors` compared across both reads, with key sets pinned | none |
| `test_a_classified_cell_keeps_its_stored_precision_as_a_string` and siblings, plus the route wire test / TC-COMP-070 | ADEQUATE | Exact `model_dump(mode="json")` dicts; sign and scale kept; no float token on the wire | none |
| `test_an_unknown_symbol_on_evidence_is_the_documented_envelope`, `…on_history…` / TC-COMP-148 | ADEQUATE | Exact envelope keys, code, resource, request id equal to the header, operation and symbol in the message, no leak | none |
| TC-COMP-126 tests | ADEQUATE | Foreign Host gives 400 before the reader; request id in header and body; an unknown `/api/classifications/...` path gives the JSON 404; router entry precedes the `static` mount (runs, `static/` exists) | the summary route's request id is not asserted (IR-010) |
| T009 cursor rows (`INVALID`, `STALE`, history and sets) | WEAK | `_forge` does not recompute `chk`, so "unknown sort", "unknown order" and "bad key" are refused by the reader's checksum, not by the rule they are named for (the cycle's own code review noted this) | survivors `72:manual:1`, `73:manual:2` (IR-004) |
| T009 refusal rows (`test_a_missing_universe_or_set_is_a_404…`) | WEAK | Code and resource per class; the set id is in the message | universe id, list and set-detail operation text, and the cursor resource are unpinned: survivors `56:manual:4`, `182:manual:6`, `219:manual:5`, `47:manual:11` (IR-005) |
| T009 unmapped and completeness rows | ADEQUATE | 500 bodies are exactly `{code, request_id}` on all six routes; reader exception classes are enumerated by introspection | `psycopg.OperationalError` not used (IR-010) |
| T010 query-model tests | WEAK | Defaults, allowlist, bounds, NaN and infinity refusal, prefix shape, split and dedupe, `extra="forbid"`, `to_filters` equality | a `0` bound is never supplied: survivor `428:manual:3` (IR-006); empty entries: survivor `403:manual:10` (IR-007) |
| T011 delegation tests | ADEQUATE | Full `ListFilters` equality; compare exclusivity per field; page bounds; path validation; stale cursor; OpenAPI phrases; full-body serialisation of set, history, evidence and summary | none |
| T012 `tests/integration/test_api_classifications.py` | WEAK | 9 of 12 pass against `postgres:16`; 3 fail at seeding | IR-001, IR-003 |
| T013 `tests/integration/test_api_classification_summary.py` | WEAK | 1 of 3 passes; 2 fail at seeding; one asserts an unspecified order | IR-001, IR-002, IR-003 |
| T014 host-origin classification tests | ADEQUATE | Foreign Host gives 400 with a request id on five paths; loopback answers; a GET with a foreign Origin is served; POST, PATCH and DELETE give 405 `method_not_allowed` | none |

Isolation and determinism: the unit tests double the reader through the
module the routes use, never open a pool, and pin no time. The integration
tests use one fresh database per test. Only
`test_a_newer_set_is_carried_as_later_and_equals_the_list_read` depends on an
unspecified order (IR-002).

### Mutation Run

Generated by this review over every changed production file (`mutation-run.py
generate --range aed93bd..HEAD --cycle review`): 92 catalogue mutants (73 in
`classification_models.py`, 19 in `routes/classifications.py`; `app.py`'s added
lines yield none). This review added twelve by hand (`"operator": "manual"`).
Initial review, so `scope` was not run. The run used four jobs with the story's
focused suites: the three unit files plus the three integration files, minus
the five IR-001 failures, deselected so every baseline passes (all four
baselines exit 0).

Result: 104 mutants, **96 killed, 8 survived**; results sha256
`8ddca6e4d5fb705218e8fb78e3d2c71d0267f40aee15d09b3be451e2453cd9c6`, copied as
`CAP-002-E3-S5-implementation-review-v1-mutation.json`. A first run with the
unit files alone gave 94 killed and 10 survived. The integration evidence test
kills `613:manual:7` (evidence `set` dropped) and `617:manual:8` (evidence
`factors` dropped).

| Survivor | Change | Why not equivalent | Finding |
|----------|--------|--------------------|---------|
| `routes/classifications.py:72:manual:1` | `UUID(payload["set"])` → `payload["set"]` | DEC-0138: stale only when the cursor's `set` parses as a UUID. A checksummed cursor with `set: "not-a-uuid"` is accepted by `reader.decode_cursor` on its own values (demonstrated in-process), so the mutant turns `cursor_invalid` into `cursor_stale` | IR-004 |
| `routes/classifications.py:73:manual:2` | allowlist and order check → `if False:` | DEC-0138: the sort must be an allowlist key and the order `asc` or `desc`. Checksummed cursors with `sort: "bogus"` or `order: "sideways"` decode on their own values (demonstrated), so the mutant makes them stale | IR-004 |
| `routes/classifications.py:56:manual:4` | universe id dropped from the message | Design 2.5: the `UniverseNotFound` message carries "the id"; T017 says it names the owner-supplied value | IR-005 |
| `routes/classifications.py:182:manual:6` | list operation text → `"compare the stocks"` | T017 and STD-UI-19: the message names the operation | IR-005 |
| `routes/classifications.py:219:manual:5` | set-detail operation text → the set-list text | T019: "The operation text … distinguishes the evidence, history, set-detail and set-list reads" | IR-005 |
| `routes/classifications.py:47:manual:11` | `CursorError` resource → `"universe"` | DEC-0139: `CursorError` maps with resource `classification` | IR-005 |
| `classification_models.py:428:manual:3` | `… is not None` → truthiness | T010: `to_filters` carries "only the supplied bounds"; a supplied `value_score_min=0` is a real filter that the mutant drops | IR-006 |
| `classification_models.py:403:manual:10` | keep empty split entries, so they are shape-checked | T016: the validator "shape-checks each" split entry; the code skips empty ones instead | IR-007 |

## Independent Validation

`R` = `repos/factorflow-v2/FactorFlow-v2`. Run sandboxed, every `uv run` fails
before pytest starts with `error: Failed to initialize cache at
/Users/alvarodejodra/.cache/uv … Operation not permitted (os error 1)`. Per
adversarial-review F.4, each command below was therefore run as one plain
unsandboxed call (`uv run --directory <R> --offline …`). Outside the sandbox
Docker is reachable, and `tests/conftest.py` starts `PostgresContainer("postgres:16")`,
the tech stack's database. The driver's note that PostgreSQL 16 and Docker are
unavailable describes the sandbox only; no postgres-marked test was excluded.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run --directory <R> --offline pytest tests/unit/test_api_classifications_routes.py tests/unit/test_api_classification_models.py tests/unit/test_api_classification_error_mapping.py -q -p no:cacheprovider` | `<R>` | 0 | PASS | `201 passed` (TC-COMP-070, 125, 126, 148, 172, 173 and T009 to T011); no skip, so the static-mount ordering assertion ran |
| `uv run --directory <R> --offline pytest -m "not postgres" -q -p no:cacheprovider` | `<R>` | 0 | PASS | `1607 passed, 911 deselected, 1 xfailed` |
| `uv run --directory <R> --offline pytest -m postgres -q -p no:cacheprovider -rf --tb=line` | `<R>` | 1 | FAIL | `5 failed, 906 passed, 1608 deselected` in 326.73 s. All five failures are `psycopg.errors.CheckViolation: new row for relation "acquisition_run" violates check constraint "acquisition_run_claim_agrees"`: `test_api_classification_summary.py::test_a_newer_set_is_carried_as_later_and_equals_the_list_read`, `::test_before_any_complete_set_the_summary_says_nothing_is_classified`, `test_api_classifications.py::test_the_list_carries_the_set_the_factors_and_string_scores`, `::test_nothing_classified_says_so`, `::test_the_sets_list_and_detail_agree` (IR-001) |
| `uv run --directory <R> --offline pytest tests/integration/test_api_classifications.py tests/integration/test_api_classification_summary.py tests/integration/test_api_classification_host_origin.py -m postgres -q -p no:cacheprovider -rf --tb=line` | `<R>` | 1 | FAIL | Story-specific "reads end to end" and DAC-E3-S5-6 host checks: `5 failed, 16 passed`, the same five as above. Every host-origin test passes |
| `uv run --directory <R> --offline ruff check .` | `<R>` | 0 | PASS | `All checks passed!` |
| `uv run --directory <R> --offline ruff format --check .` | `<R>` | 0 | PASS | `278 files already formatted` |
| `uv run --directory <R> --offline mypy src` | `<R>` | 0 | PASS | `Success: no issues found in 61 source files` |
| T021: `grep -n "psycopg\|SELECT\|INSERT" src/factorflow/api/routes/classifications.py`; `grep -rn "massive" …/routes/classifications.py …/classification_models.py`; `grep -cE '^class (FactorCellResponse\|FactorsResponse\|SetBlock)\(' …/classification_models.py`; `git diff aed93bd HEAD --stat -- src/ tests/`; `uv run --directory <R> --offline pytest tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/unit/test_api_host_origin.py tests/unit/test_api_request_id.py tests/unit/test_api_runs_routes.py tests/unit/test_api_coverage_routes.py -q -p no:cacheprovider` | `<R>` | 1, 1, 0, 0, 0 | PASS | No SQL or driver import in the router; no Massive reference; `3`; only the ten planned source and test files; `83 passed`. `app.py` differs by the import extension and one `include_router` line |
| `python3 scripts/check-tdd-evidence.py --evidence <R>/…/CAP-002-E3-S5-tdd-evidence.yaml --repo-dir <R> --base aed93bd8debe45c4c2dbc2de6a9c120d879041a9 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `python3 scripts/mutation-run.py generate --repo-dir <R> --range aed93bd…..HEAD --cycle review --out <scratch>/mutants.json` (then 12 manual mutants appended) | harness root | 0 | PASS | 92 generated + 12 manual = 104 |
| `python3 scripts/mutation-run.py run --repo-dir <R> --mutants <scratch>/mutants.json --jobs 4 --command '<venv python> -m pytest <3 unit files> <3 integration files> -q -x -p no:cacheprovider --deselect <5 IR-001 tests>' --out <scratch>/results-combined.json` (unsandboxed) | harness root | 3 | FAIL | 96 killed, 8 survived (Mutation Run) |
| `uv build` | `<R>` | N/A | NOT RUN | The plan's Validation Plan runs it "only if packaging is affected"; no packaging file changed |

### Validation Side Effects

- Before: `git status --porcelain=v1 --untracked-files=all` empty at `bcdff3e`.
- After: empty at `bcdff3e`. Mutants ran in clones under `$TMPDIR`; pytest ran
  with `-p no:cacheprovider`; `.mypy_cache`, `.ruff_cache` and `.hypothesis` are
  ignored. This report and its `-mutation.json` are the only files added, both
  under `docs/`, which the code fingerprint excludes.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 6 · MEDIUM 1 · LOW 3 · **total 10**

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | Five story integration tests fail on a `running` run seeded without a claim |
| IR-002 | HIGH | initial | Summary currency test asserts an order the reader leaves open |
| IR-003 | HIGH | initial | Planned T012 and T013 integration cases are missing |
| IR-004 | HIGH | initial | `_cursor_code`'s DEC-0138 checks are untested; "invalid" rows fail by checksum |
| IR-005 | HIGH | initial | Refusal message and resource details are not pinned |
| IR-006 | HIGH | initial | No test supplies a zero-valued bound |
| IR-007 | MEDIUM | initial | Empty `symbols` entries are skipped instead of shape-checked |
| IR-008 | LOW | initial | A cursor test claims to implement TC-COMP-148 |
| IR-009 | LOW | initial | Duplicated percentile field and symbol-prefix validator |
| IR-010 | LOW | initial | Minor plan-named unit assertions are absent |

### IR-001 — Five of the story's integration tests fail: they seed a `running` acquisition run without a claim

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-20, AC-21, AC-22, DAC-E3-11
- **Tasks**: T012, T013, T022
- **Files**: `tests/integration/api_classification_support.py:70` (`later_set`); `tests/integration/test_api_classifications.py:196`
- **Claim challenged**: T012, T013 and T022 are ticked complete. The TDD evidence
  says the integration files "were written but never run; PostgreSQL and Docker
  are absent on this machine".
- **Observed evidence**: `uv run pytest -m postgres` (unsandboxed, `postgres:16`
  testcontainer) exits 1 with `5 failed, 906 passed`. Each failure raises
  `CheckViolation … "acquisition_run_claim_agrees"`, the constraint of
  `src/factorflow/db/migrations/0004_runs.sql:19-21`: `(state IN ('running',
  'cancelling')) = (claimed_by IS NOT NULL AND heartbeat_at IS NOT NULL)`.
  `later_set(conn, "building")` calls `insert_run(conn, "running",
  started_at=T1)`, and `test_the_sets_list_and_detail_agree` calls
  `insert_run(conn, "running", …)` directly. `reader_seed.insert_run` sets no
  claim. Every test that seeds a `building` set therefore fails before its
  first assertion about a newer or first set: list shape (1), never-classified
  with a building first set (4), sets (10), summary currency (2) and summary
  emptiness (3). The environment claim is wrong: Docker is reachable outside
  the sandbox.
- **Expected evidence/behavior**: the story's Validation section requires `uv
  run pytest -m postgres` to pass. T022 requires the full validation set to be
  run. T012 and T013 require each listed case to pass against the store.
- **Impact**: AC-20's store-level evidence (previous set marked not current,
  failed set with reason) and the sets read of AC-21 are unproven. The required
  suite is red.
- **Required remediation**: seed `building` sets so they satisfy the
  acquisition-run constraints, for example with a run state that needs no claim
  or with the claim columns set. Then run `uv run pytest -m postgres` outside
  the sandbox and record its result in the TDD evidence.

### IR-002 — The summary currency test asserts an order the reader leaves open

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-20, DAC-E3-11
- **Tasks**: T013
- **Files**: `tests/integration/test_api_classification_summary.py:47-61`; `tests/integration/api_classification_support.py:68-79`; `src/factorflow/classification/sql/current_set.sql:12-18`
- **Claim challenged**: T013 (2) is satisfied by
  `test_a_newer_set_is_carried_as_later_and_equals_the_list_read`.
- **Observed evidence**: the test loops over `("building", "failed")` and calls
  `later_set` in each iteration, so its second iteration holds a `building` set
  and a `failed` set that both have `started_at = T1`. The test then asserts
  `summary["later"]["state"] == "failed"`. The `later` CTE is `ORDER BY
  s.started_at DESC LIMIT 1` with no tie-breaker, so which set PostgreSQL
  returns for equal keys is unspecified. The reader design's "most recent set
  started after it" does not decide a tie either. IR-001 masks this defect
  today: the first iteration already fails at seeding.
- **Expected evidence/behavior**: adversarial-review E.6 requires tests to be
  deterministic. T013 (2) requires `later` to carry a `building` set and then a
  `failed` set.
- **Impact**: once IR-001 is fixed, the test can pass or fail from run to run,
  or fail every time, without any change to the code.
- **Required remediation**: give each newer set a distinct `started_at`, or
  seed the two states in separate databases or tests, so the asserted `later`
  is the only candidate.

### IR-003 — Planned T012 and T013 integration cases are missing

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-13, AC-16, AC-17, AC-18, AC-20, AC-21
- **Tasks**: T012, T013
- **Files**: `tests/integration/test_api_classifications.py`; `tests/integration/test_api_classification_summary.py`
- **Claim challenged**: T012 cases (1) to (12) and T013 cases (1) to (3) are
  implemented.
- **Observed evidence**: one function exists per case, but these planned
  assertions are absent:
  - (2) thresholds, `hide_incomplete` and the `symbol` prefix changing
    `match_count` identically on every page. This is also the design section 7
    row "Match count is over the whole set".
  - (7) a retired instrument included in a compare with its `retired` reason.
  - (8) `restated_possible` and `detail` on each input; `memberships` omitting
    a retired universe; `set` null with empty `factors` and `inputs` before any
    set (DEC-0140; design 7 row "Evidence with memberships").
  - (9) the stored `restated_possible` on history cells; a known stock with no
    earlier set returning `sets: []` and 200.
  - (10) newest-first order across the failed, building and complete sets. Only
    the last row's state is asserted.
  - (11) the default `limit` of 50; `limit=500` on history.
  - T013 (1): an `outdated` input making a stock not current; `followed_count`
    equal to `active_instruments` when it differs from the number of rows.
  - T013 (3): a `failed` first set.
  - T012 (1) also omits `ended_at`, `run_started_at`, `active_instruments`,
    `lifecycle`, the percentile string and `later.run_started_at`.
- **Expected evidence/behavior**: T012 and T013 as written in the task plan,
  and the design section 7 rows they implement.
- **Impact**: store-level regressions in these behaviours would pass the
  story's own suite.
- **Required remediation**: add the missing assertions or cases, one function
  per case as planned, and run them green against `postgres:16`.

### IR-004 — `_cursor_code`'s DEC-0138 checks are untested; the "invalid" cursor rows are refused by the checksum instead

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16
- **Tasks**: T009, T017
- **Files**: `src/factorflow/api/routes/classifications.py:72-74`; `tests/unit/test_api_classification_error_mapping.py:328-338` (`_forge`), `397-411` (`INVALID`, `STALE`)
- **Claim challenged**: T009's `cursor_invalid` rows for "unknown sort",
  "unknown order" and "bad key" prove the route's classification rule.
- **Observed evidence**: `_forge` changes a field but keeps the old `chk`, so
  the reader rejects every forged cursor as `cursor was altered` before any
  rule the row is named for applies. Mutants `72:manual:1` (no UUID parse of
  `set`) and `73:manual:2` (no allowlist or order check) survive the unit
  suites and the passing integration tests. In-process, cursors with a
  recomputed `chk` and `sort: "bogus"`, `order: "sideways"` or `set:
  "not-a-uuid"` are all accepted by `reader.decode_cursor` on their own values.
  The route returns `cursor_invalid` for them only because of lines 72 and 73.
- **Expected evidence/behavior**: DEC-0138 (owner upheld) says a cursor is
  stale only when its `set` parses as a UUID, its `sort` is a
  `SORT_ALLOWLIST` key and its `order` is `asc` or `desc`; every other cursor is
  `cursor_invalid`.
- **Impact**: deleting either check would silently relabel such cursors
  `cursor_stale`. The interface would then offer "the list changed, reload"
  for a forged or corrupt cursor.
- **Required remediation**: add rows whose cursors carry a correctly recomputed
  `chk` with a non-UUID `set`, a non-allowlist `sort` and a non-`asc`/`desc`
  `order`, each asserting `cursor_invalid`, so that both mutants are killed.

### IR-005 — Refusal envelope details that the design and DEC-0139 fix are not pinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16, AC-21
- **Tasks**: T009, T017, T019
- **Files**: `src/factorflow/api/routes/classifications.py:47, 56, 182, 219`; `tests/unit/test_api_classification_error_mapping.py:371-394` and the cursor rows
- **Claim challenged**: T009's table-driven mapping tests pin each refusal's
  code, resource and message.
- **Observed evidence**: four mutants survive the unit and integration suites:
  - `56:manual:4` drops the universe id from the `universe_not_found` message;
  - `182:manual:6` makes the list read's message name the compare operation;
  - `219:manual:5` gives the set-detail read the set-list operation text;
  - `47:manual:11` changes the `CursorError` envelope's resource to `universe`.
  The tests assert the resource only for the three not-found codes, and the
  message's value only for `SetNotFound` and `InstrumentNotFound`.
- **Expected evidence/behavior**: design 2.5 says the `UniverseNotFound`
  message carries the id. T017 and STD-UI-19 say each message names the
  operation, the resource and the owner-supplied value. T019 says the operation
  text distinguishes the evidence, history, set-detail and set-list reads.
  DEC-0139 maps `CursorError` with resource `classification`.
- **Impact**: wrong operation text or resource values can ship. These reach
  logs and any consumer that reads `resource`.
- **Required remediation**: assert the resource on every cursor refusal. Assert
  the id in the `universe_not_found` message, and the operation text of each
  read that can refuse: the list, set detail and set list, beside the evidence
  and history checks that already exist. All four mutants must be killed.

### IR-006 — No test supplies a zero-valued bound, so dropping it would pass

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16
- **Tasks**: T010, T016
- **Files**: `src/factorflow/api/classification_models.py:427-429`; `tests/unit/test_api_classification_models.py:546` (`test_to_filters_carries_only_the_supplied_bounds`)
- **Claim challenged**: T010's `to_filters` test proves that every supplied bound
  reaches the reader.
- **Observed evidence**: mutant `428:manual:3` replaces `… is not None` with
  truthiness, which drops any bound equal to `0`. It survives every unit and
  integration test, because no test supplies a `0` bound: the supplied values
  are `80`, `-1` and `90`. The production code is correct today.
- **Expected evidence/behavior**: T010 says `to_filters` returns "only the
  supplied bounds in `bounds` as `Decimal`". Design 2.4 makes a score bound any
  finite decimal, so `value_score_min=0` is a meaningful threshold.
- **Impact**: a refactor to truthiness would silently ignore "score at least 0"
  and serve unfiltered results under a filter the owner set.
- **Required remediation**: add a case where a `0` score bound, and a `0`
  percentile bound, appear in `ListFilters.thresholds.bounds`, so that the
  mutant is killed.

### IR-007 — Empty `symbols` entries are skipped instead of shape-checked

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-7
- **Tasks**: T010, T016
- **Files**: `src/factorflow/api/classification_models.py:401-404` (`if symbol and symbol not in symbols`)
- **Claim challenged**: the `symbols` validator "shape-checks each" split entry
  (T016).
- **Observed evidence**: `?symbols=AAA,,BBB` and `?symbols=AAA,BBB,` are accepted
  as two symbols, because empty parts are dropped before the shape check.
  Mutant `403:manual:10`, which keeps empty parts and so refuses them, survives.
  No test covers either behaviour. The 2-to-6 bound still holds, because empty
  parts are never counted.
- **Expected evidence/behavior**: T016 says the validator "splits each entry on
  commas, strips, upper-cases and de-duplicates in first-seen order,
  shape-checks each against `^[A-Z][A-Z0-9.-]{0,15}$`". Design 2.4 says the
  symbol shape applies to every symbol.
- **Impact**: a malformed compare request is quietly normalised rather than
  refused. This is minor, but it is behaviour the plan states otherwise.
- **Required remediation**: either refuse empty entries with `loc ("symbols",)`
  and test it, or record a decision that empty segments are ignored and pin
  that behaviour with a test.

### IR-008 — A cursor test claims to implement TC-COMP-148

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S5-5
- **Tasks**: T009
- **Files**: `tests/unit/test_api_classification_error_mapping.py:413-415`
- **Claim challenged**: each `# Implements TC-...` comment names the case the
  test implements.
- **Observed evidence**: `test_a_malformed_list_cursor_is_cursor_invalid` carries
  `# Implements TC-COMP-148`. It implements T009's DEC-0138 rows; TC-COMP-148 is
  the unknown-symbol evidence envelope (lines 340 and 360).
- **Expected evidence/behavior**: the plan's Phase 2 rule is that the TC comment
  traces to the component test specification.
- **Impact**: traceability noise only.
- **Required remediation**: remove the comment, or replace it with the task and
  DEC reference.

### IR-009 — Duplicated percentile field and symbol-prefix validator in `classification_models.py`

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T016
- **Files**: `src/factorflow/api/classification_models.py:32` and `358` (`_PERCENTILE` and `_PERCENTILE_BOUND`, identical); `:79-87` and `:415-423` (two identical `_symbol_prefix` validators)
- **Claim challenged**: the story adds models without a second copy of the
  same rule. The plan cites SA-DUP-001 for the list and summary shape.
- **Observed evidence**: the new query model redeclares a `Field` and a
  validator that already exist verbatim in the same module. The module already
  shares `_normalised_name` and `_normalised_symbols` as functions.
- **Expected evidence/behavior**: one definition of the percentile bound and
  the prefix rule within the module.
- **Impact**: the two filters, the saved `Thresholds` and the list query, can
  drift apart on a later edit.
- **Required remediation**: optional. Reuse `_PERCENTILE`, and share the prefix
  validator the way `_normalised_name` is shared.

### IR-010 — Minor plan-named assertions are absent from the unit tests

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S5-6
- **Tasks**: T008, T009
- **Files**: `tests/unit/test_api_classifications_routes.py:365-372`; `tests/unit/test_api_classification_error_mapping.py:459-472`
- **Claim challenged**: T008 (b) and T009 are implemented as written.
- **Observed evidence**: T008 (b) asks for the `X-Request-Id` check on both the
  list and the summary; only the list is checked. T009 names
  `psycopg.OperationalError` as an unmapped exception; the test uses
  `RuntimeError` and `ValueError`. The behaviour is the same, because any
  unmapped exception reaches `internal_error`.
- **Expected evidence/behavior**: the T008 (b) and T009 text.
- **Impact**: negligible; the middleware and the generic handler apply to every
  route.
- **Required remediation**: optional. Add the summary request-id assertion and a
  `psycopg.OperationalError` row.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded in DEC-0281:**
  - The three conversion helpers delegate to E1-S6's existing `from_reader`
    classmethods. T015's "get no classmethod" predates E1-S6's delivery.
  - `compare_conflicts` reads the query-string names. FastAPI's
    `_get_multidict_value` fills non-None defaults into the model, so
    `model_fields_set` would report `sort`, `order`, `hide_incomplete` and
    `limit` on every request. Mutant `163:manual:9` is killed.
  - Score bounds rely on Pydantic's default Decimal `allow_inf_nan=False`
    rather than an explicit flag. Mutant `357:manual:12` is killed.
  - The routes omit `response_model=None`; with an `Any` return annotation and
    a returned `JSONResponse`, the effect is the same.
- **Justified by the plan:** the `app.py` import line is wrapped by `ruff
  format` (T020 allows it). E3-S6's TC-COMP-089 should read this as additive,
  as the plan's Other Notes say.
- **Justified test support:** `complete_set` and `later_set` were added to
  `api_classification_support.py` beyond T002's context manager. `later_set` is
  where IR-001's defect lives.
- **Bookkeeping inconsistency:**
  - T012, T013 and T022 are ticked although their tests were never run and fail
    (IR-001).
  - The TDD evidence states that Docker is absent, but it is reachable outside
    the sandbox.
- **Not a deviation:** T017's error mapping stays router-private. E1-S6
  delivered no shared module (DEC-0139).
- **Not in scope here:** `cursor_stale`'s message, "the cursor is not one this
  read issued", is generic; design 2.5 gives cursor errors "nothing beyond the
  code".
- Out-of-scope changes: none.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: rework CAP-002-E3-S5 against this report.
  - Fix the integration seeding (IR-001) and the tied `later` sets (IR-002).
  - Add the missing T012 and T013 cases (IR-003).
  - Kill the eight surviving mutants listed in the Mutation Run table, or
    record a decision for IR-007: IR-004 to IR-007.
  - Optionally address IR-008 to IR-010.
  - Run `uv run pytest -m postgres` outside the sandbox and record it in the
    TDD evidence. Then mark the tasks file `last_reworked_review:
    CAP-002-E3-S5-implementation-review-v1.md` and request review v2.
- **Warnings accepted downstream**: N/A
