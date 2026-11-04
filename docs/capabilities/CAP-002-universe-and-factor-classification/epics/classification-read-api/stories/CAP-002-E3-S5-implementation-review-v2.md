---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S5-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-04
updated: 2026-11-04
story_id: "CAP-002-E3-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-04T00:06:30Z"
reviewed_head: "d0993d42bcc4a4e45da6088a26f75126887d76df"
review_base: "aed93bd8debe45c4c2dbc2de6a9c120d879041a9"
reviewed_state_revision: "sha256:23c53f547aba796d06f828e24e67d537531729cd41a6b719f91634f7f570b89c"
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
  timestamp: 2026-11-04T00:06:30Z
  source_artifacts:
    - id: CAP-002-E3-S5
      version: "1 (sha256:b737301094032490f55bf65d3c31069652614f1747e0e66963c66c1b4bdcec87)"
    - id: CAP-002-E3-S5-tasks
      version: "1 (updated 2026-11-03; last_reworked_review v1)"
    - id: CAP-002-E3-S5-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-002-E3-S5-implementation-review
      version: "1 (baseline; reviewed_head bcdff3ef63ee0dca42e0feb4af55bcd66b55e0c7)"
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

# Implementation Review: CAP-002-E3-S5 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 16/16 satisfied |
| Planned tasks | 22/23 verified |
| Required validation | 9/9 passed |

The rework fixes everything that made v1's validation fail:

- The required postgres suite is green: `919 passed` against the `postgres:16`
  testcontainer, unsandboxed. The story's three integration files give
  `29 passed`.
- The tied `later` sets are gone.
- All seven v1 survivors that still apply are killed. IR-007's empty compare
  entries are now refused, as T016 says. The rework's only production change
  is that one line, `classification_models.py:403`.
- 112 of this review's 115 mutants are killed, including every `carried` and
  every `delta` mutant.

The gate still fails on one carried finding. Two of the T012 cases that v1's
IR-003 listed are still not implemented as planned (IR-001):

- **T012 (2).** The new match-count test's `hide_incomplete` and
  `symbol`-prefix variants cannot change `match_count`. Two probe mutants drop
  each filter outright, and that test still passes.
- **T012 (7).** The retired compare stock is seeded with classified cells,
  which the engine never stores, and its `retired` reason is not asserted.

T012 is therefore PARTIAL. Also recorded, without blocking: three `late`
survivors in `_cursor_code`'s exception tuple (IR-002, MEDIUM), and v1's
optional duplication note (IR-003, LOW).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S5-run-20261103T225646Z` |
| HEAD | `d0993d42bcc4a4e45da6088a26f75126887d76df` (`rework(classification): CAP-002-E3-S5 against review v1 - seeding, missing cases, mutants`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-E3-integration-20261103T225646Z` → `aed93bd8debe45c4c2dbc2de6a9c120d879041a9` (`pipeline-state.py review-base --base-ref …`; ancestor of HEAD, checked with `git merge-base --is-ancestor`) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty); code fingerprint unchanged |
| Changed files reviewed | 29 (three commits over the base: `bcdff3e` story coding, `1a27db8` review v1, `d0993d4` rework) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `bcdff3ef63ee0dca42e0feb4af55bcd66b55e0c7`, with `CAP-002-E3-S5-implementation-review-v1-mutation.json` |

`pipeline-state.py check … --stage adversarial-review --base-ref <integration
branch>` reports `READY — review changes were reworked; a new review version is
required`. Without `--base-ref` it reports `BLOCKED`. Its TDD lint then
resolves the base against the remote default branch, which pulls in other
stories' commits (`d222185`, CAP-002-E1-S9).

Scope comes from git: `git diff bcdff3e..HEAD -- src/` changes one production
line, `classification_models.py:403`. `mutation-run.py scope --since bcdff3e`
tags each mutant.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/routes/classifications.py` | added | AC-9, AC-13, AC-16 to AC-18, AC-20 to AC-22; T017 to T019 (unchanged since v1) |
| `src/factorflow/api/classification_models.py` | modified | T015, T016; line 403 changed by the rework (v1 IR-007, T016 "shape-checks each") |
| `src/factorflow/api/app.py` | modified | DAC-E3-S5-6; T020 (unchanged since v1) |
| `tests/unit/test_api_classifications_routes.py` | added | T003 to T006, T008, T011; rework: T008 (b) on the summary too (v1 IR-010) |
| `tests/unit/test_api_classification_models.py` | modified (additive) | T004, T006, T010; rework: empty entries, zero bound (v1 IR-006, IR-007) |
| `tests/unit/test_api_classification_error_mapping.py` | modified (additive) | T007, T009; rework: re-signed cursor rows, refusal details, `psycopg.OperationalError` (v1 IR-004, IR-005, IR-008, IR-010) |
| `tests/integration/api_classification_support.py` | added | T002; rework: `building_run` claims the run, `later_set(started_at=…)` (v1 IR-001, IR-002) |
| `tests/integration/test_api_classifications.py` | added | T012; rework: v1 IR-001, IR-003 cases |
| `tests/integration/test_api_classification_summary.py` | added | T013; rework: v1 IR-001, IR-002, IR-003 cases |
| `tests/integration/test_api_classification_host_origin.py` | modified (additive) | T014 (unchanged since v1) |
| `…/stories/CAP-002-E3-S5.md` | modified | status `planning` → `in-review` (story coding hand-off) |
| `…/stories/CAP-002-E3-S5-tasks.md` | modified | 23 checkboxes; `updated`; `last_reworked_review: CAP-002-E3-S5-implementation-review-v1.md` |
| `…/stories/CAP-002-E3-S5-tdd-evidence.yaml` | added | T023 (cycle-1, cycle-2) |
| `…/stories/CAP-002-E3-S5-evidence/` (14 files: `cycle-{1,2}.patch`, `red-`, `green-`, `code-review-`, `spec-drift-cycle-{1,2}`, `mutation-cycle-{1,2}-{mutants,results}.json`) | added | T023 |
| `…/stories/CAP-002-E3-S5-implementation-review-v1.md`, `…-v1-mutation.json` | added | Review v1 (the baseline), committed by the driver |

No changed file is unjustified. `git diff aed93bd HEAD --stat -- src/ tests/`
lists exactly the ten source and test files above. Its only deleted lines are
the two import lines that `app.py` and `classification_models.py` extend.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `_cell_response` → E1-S6 `FactorCellResponse.from_reader`; `routes/classifications.py:_json` uses `model_dump(mode="json")` | TC-COMP-070 tests; postgres `test_the_list_carries_the_set_the_factors_and_string_scores` asserts `"1.250000"` and `"87.500000"` | Scores and percentiles are decimal strings at stored precision on the wire |
| AC-13 | SATISFIED | `ClassificationSummaryResponse.from_reader` copies `stocks_current` | postgres `test_the_summary_counts_the_current_stocks` (`missing` not current, `not_computable` current) and `test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` (`outdated`; `followed_count` 5 against 2 rows) | v1's `outdated` gap is closed |
| AC-16 | SATISFIED | `ClassificationListQuery`, `to_filters`, `compare_conflicts`; route `list_classifications` | T011 (a) full `ListFilters` equality; `test_to_filters_keeps_a_zero_valued_bound`; postgres threshold, sort, scope, compare, match-count tests | Behaviour is correct and pinned at unit level. The store-level match-count row is only partly proven (IR-001) |
| AC-17 | SATISFIED | `StockEvidenceResponse.from_reader`; `_symbol` dependency | postgres `test_the_evidence_shows_inputs…`, `test_the_evidence_carries_restated_and_detail_and_omits_a_retired_universe`, `test_a_known_stock_before_any_set_has_no_set_factors_or_inputs` | Retired universe omitted; DEC-0140 empty shape is 200 |
| AC-18 | SATISFIED | `StockHistoryResponse.from_reader`; route `stock_history` | postgres `test_the_history_lists_earlier_sets…`, `test_the_history_carries_the_stored_restated_flag_and_a_new_stock_has_none` | Stored `restated_possible` per factor; `sets: []` with 200 for a never-classified stock |
| AC-20 | SATISFIED | `_SetBlocks.parts`, `_later_block`, `SetResponse.from_reader` | TC-COMP-173; postgres `test_the_list_carries…` (newer `building`), `test_a_newer_set_is_carried_as_later_and_equals_the_list_read[building\|failed]`, `test_a_failed_first_set_leaves_the_summary_never_classified`, `test_the_sets_list_and_detail_agree` | v1's store-level failures are fixed; `set.not_current` and `later` pass against the store |
| AC-21 | SATISFIED | `SetBlock` via `_set_block`; `SetResponse.run_started_at`, `ended_at` | postgres list test asserts `run_started_at`, `ended_at`, `active_instruments` and `later.run_started_at`; sets test asserts `run_started_at` on every row | |
| AC-22 | SATISFIED | `_factor_summaries(None)` zero record (DEC-0140) | TC-COMP-173; postgres `test_nothing_classified_says_so`, `test_before_any_complete_set…`, `test_a_failed_first_set…` | |
| DAC-E3-7 | SATISFIED | `_compare_symbols`; route calls `reader.compare` | TC-COMP-125; postgres `test_compare_reports_unknown_symbols_and_enforces_its_bounds` (`unknown_symbols == ["NOPE"]`; a retired instrument returned) | The planned `retired` reason assertion is T012's, not this criterion's (IR-001) |
| DAC-E3-11 | SATISFIED | One builder, `_SetBlocks.parts` | TC-COMP-173; postgres summary currency test asserts `set` and `later` equal to the list read's, per state | |
| DAC-E3-S5-1 | SATISFIED | `/summary` declared second | `test_summary_reaches_the_summary_handler_not_a_path_parameter`, `test_the_router_lists_summary_before_the_parameterised_paths` | Unchanged since v1 |
| DAC-E3-S5-2 | SATISFIED | `_compare_symbols` with `classification_bounds` constants | TC-COMP-125 tests; `test_an_empty_symbols_entry_is_refused_on_symbols` | |
| DAC-E3-S5-3 | SATISFIED | `_SetBlocks.parts`, `_factor_summaries` | `test_never_classified_list_and_summary_share_one_shape` | Unchanged since v1 |
| DAC-E3-S5-4 | SATISFIED | `FactorCellResponse` Decimal fields; `restated_possible: bool` | TC-COMP-070 tests | Unchanged since v1 |
| DAC-E3-S5-5 | SATISFIED | `REFUSALS`, `_refuse`, `_reason` | TC-COMP-148 tests | Unchanged since v1 |
| DAC-E3-S5-6 | SATISFIED | `app.py` `include_router(classifications.router)` | TC-COMP-126 tests, now with the summary request id; postgres host-origin tests pass | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Producers import and are used | As v1 |
| T002 | complete | VERIFIED | `api_classification_support.py:classification_app`; `building_run` (lines 68-81) | The `running` run now carries `claimed_by` and `heartbeat_at`, as `acquisition_run_claim_agrees` requires. All 29 story postgres tests pass |
| T003 | complete | VERIFIED | routes file, TC-COMP-172 | |
| T004 | complete | VERIFIED | models and routes files, TC-COMP-125 | |
| T005 | complete | VERIFIED | routes file, TC-COMP-173 | |
| T006 | complete | VERIFIED | models file and route wire test, TC-COMP-070 | |
| T007 | complete | VERIFIED | error-mapping file, TC-COMP-148 | |
| T008 | complete | VERIFIED | routes file; `test_the_request_id_wraps_an_error_from_the_router` (line 372) now parametrised over the list and the summary | v1 IR-010 closed |
| T009 | complete | VERIFIED | error-mapping file lines 329-523 | `_forge` re-signs `chk`, so `unknown sort`, `unknown order`, `set not a UUID` and `bad key` fail on the rule they name. `altered checksum` keeps the old digest on purpose. Resource, universe id and four operation texts are pinned. `psycopg.OperationalError` row added. Three exception branches of `_cursor_code` are untested (IR-002, `late`, not blocking) |
| T010 | complete | VERIFIED | models file; `test_to_filters_keeps_a_zero_valued_bound` (line 582); `test_an_empty_symbols_entry_is_refused_on_symbols` (line 541) | Mutant `428:manual:3` is killed |
| T011 | complete | VERIFIED | routes file | Unchanged since v1 |
| T012 | complete | PARTIAL | `tests/integration/test_api_classifications.py`, 17 functions, all passing against `postgres:16` | Cases (1), (3) to (6) and (8) to (12) are implemented. Case (2)'s `hide_incomplete` and prefix variants cannot change the count; case (7) asserts no `retired` reason (IR-001) |
| T013 | complete | VERIFIED | `tests/integration/test_api_classification_summary.py`, 5 functions (6 tests), all passing | (1) `missing`, `outdated`, `not_computable`, `followed_count` ≠ rows; (2) one newer set per test; (3) no set, `building` and `failed` first sets |
| T014 | complete | VERIFIED | host-origin classification tests | Unchanged since v1; pass |
| T015 | complete | VERIFIED | `classification_models.py` | Unchanged since v1; DEC-0281 deviation as v1 recorded |
| T016 | complete | VERIFIED | `ClassificationListQuery`; line 403 `if symbol not in symbols:` | Every split entry, an empty one included, now reaches the shape check, as T016 says. Delta mutant `403:manual:28`, which restores the skip, is killed |
| T017 | complete | VERIFIED | `routes/classifications.py:41-100` | Follows DEC-0138 as amended by E3-F07. In-process, a reader-refused cursor with `set` a number, a JSON list, or an object without `set` reaches lines 72 to 76 and returns `cursor_invalid`. The tests do not pin this (IR-002) |
| T018 | complete | VERIFIED | routes lines 149-197 | Unchanged since v1 |
| T019 | complete | VERIFIED | routes lines 200-254 | Operation texts are now pinned: mutants `219:manual:5` and `182:manual:6` are killed |
| T020 | complete | VERIFIED | `app.py` import block and one `include_router` line | Unchanged since v1 |
| T021 | complete | VERIFIED | Re-run by this review (Independent Validation) | |
| T022 | complete | VERIFIED | `green-cycle-2.log`; this review's runs | The full validation set is green: `-m postgres` 919 passed, `-m 'not postgres'` 1625 passed and 1 xfailed, lint, format and types clean. The coder's 2544 + 1 xfailed matches |
| T023 | complete | VERIFIED | `CAP-002-E3-S5-tdd-evidence.yaml` cycle-2 | `check-tdd-evidence.py … --require-logs` exits 0 with 0 errors and 0 warnings. RED `red-cycle-2.log` shows the four empty-entry tests failing against the line at `bcdff3e`. This review's delta mutant `403:manual:28` corroborates it |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-172 tests | ADEQUATE | 200 from the summary double while the other reads raise; router order and six GET paths pinned | none |
| TC-COMP-125 tests | ADEQUATE | 0, 1, 7 symbols refused on `("symbols",)`; 2 and 6 reach `compare`; count after dedupe; constants imported | none |
| TC-COMP-173 tests | ADEQUATE | `never_classified`, `set`, `later`, `factors` equal on both reads; key sets pinned; non-zero factor counts from a current set | none |
| TC-COMP-070 tests | ADEQUATE | Exact JSON dumps; sign and scale kept; no numeric token on the wire | none |
| TC-COMP-148 tests | ADEQUATE | Exact envelope keys, code, resource, request id; operation and symbol in the message; no leak | none |
| TC-COMP-126 tests | ADEQUATE | Foreign Host 400 before the reader; request id in header and body on the list and the summary; JSON 404 for an unknown `/api/classifications/...`; router precedes the `static` mount | none |
| T009 cursor rows (`INVALID`, `STALE`, history and sets) | ADEQUATE | Each re-signed row now fails on its named rule; `cursor_stale` for two well-formed cursors; history and sets always invalid; the cursor text never in the body; resource `classification` on both codes | Exception branches `KeyError`, `TypeError`, `AttributeError` unpinned: `late` survivors (IR-002), which do not make this test WEAK |
| T009 refusal rows | ADEQUATE | Code and resource per class; exact universe message; operation text of list, compare, set detail, set list, evidence, history | none |
| T009 unmapped and completeness rows | ADEQUATE | 500 is exactly `{code, request_id}` for `RuntimeError`, `ValueError`, `psycopg.OperationalError` on all six routes; reader exceptions enumerated | none |
| T010 query-model tests | ADEQUATE | Defaults, allowlist, bounds, NaN/inf, prefix, split/dedupe, empty entries refused, `extra="forbid"`, `to_filters` equality, zero bounds kept | none |
| T011 delegation tests | ADEQUATE | As v1 | none |
| T012 `test_filters_change_the_match_count_identically_on_every_page` | WEAK | The threshold variant proves a filtered count (4 of 6) on two pages. `value_score_min=0` keeps the four non-negative stocks | Every seeded stock is classified, and the four that pass the threshold all start with `H`. So `hide_incomplete=true` and `symbol=h` leave the count unchanged. Probe mutants that drop either filter survive this test (IR-001) |
| T012 `test_compare_reports_unknown_symbols_and_enforces_its_bounds` | WEAK | `unknown_symbols`, bounds and a retired instrument returned with `lifecycle == "retired"` | The retired stock is seeded with classified cells. No `retired` reason is seeded or asserted (IR-001) |
| T012 other functions (15) | ADEQUATE | List shape with `ended_at`, `run_started_at`, `active_instruments`, `lifecycle`, percentile string, `later.run_started_at`; whole-set paging; hide-incomplete rule; never classified; sort and 422s; scope; evidence with restated, detail, retired universe and the pre-set empty shape; history with stored restated and `sets: []`; sets in full newest-first order with distinct start times; page bounds incl. history 500 and default 50; cursor misuse | none |
| T013 summary tests | ADEQUATE | Current count over `missing`, `outdated` and `not_computable`; `followed_count` from `active_instruments`; `later` per state with `set.not_current` and equality with the list; zero record; `failed` first set with its reason | The currency test asserts `later.state` and equality with the list. `failure_reason` and `run_started_at` are pinned at store level by the failed-first-set and list tests. No finding |
| T014 host-origin tests | ADEQUATE | As v1; all pass | none |

Isolation and determinism: the unit tests double the reader through the module
the routes use and open no pool. The integration tests use one fresh database
per test. v1's only order-dependent test (IR-002) is now one test per state.
`test_the_sets_list_and_detail_agree` gives the failed and building sets
distinct `started_at` values, so its full-order assertion is deterministic.
`_forge` re-signs with `reader._cursor_check`, a private reader function: one
digest algorithm, not a copy, and a rename fails at import.

### Mutation Run

Generated by this review over every changed production file:
`mutation-run.py generate --range aed93bd..HEAD --cycle review` gives 92
catalogue mutants (73 in `classification_models.py`, 19 in
`routes/classifications.py`). This review added twelve by hand
(`manual:21` to `manual:32`). `scope --since bcdff3e --previous
CAP-002-E3-S5-implementation-review-v1-mutation.json` added v1's eleven manual
mutants that still apply; `403:manual:10` no longer applies, because its
mutation is now the code. It tagged the 115 mutants **103 carried, 2 delta, 10
late**.

The run used four jobs and the story's six focused files: three unit, three
integration, against `postgres:16`. All four baselines exited 0.

Result: 115 mutants, **112 killed, 3 survived**, every survivor `late`. Results
sha256 `15cf53bc973dd3d8526140acce777e2865b01a2123679ba657cfc4f31dcfd002`,
copied as `CAP-002-E3-S5-implementation-review-v2-mutation.json`. Every v1
survivor that still applies is killed: `72:manual:1`, `73:manual:2`,
`56:manual:4`, `182:manual:6`, `219:manual:5`, `47:manual:11` and
`428:manual:3`. The two delta mutants on line 403 are killed:
`manual:27`, no de-duplication, and `manual:28`, which restores the
empty-entry skip.

| Survivor | Scope | Change | Why not equivalent | Finding |
|----------|-------|--------|--------------------|---------|
| `routes/classifications.py:76:manual:21` | late | drop `AttributeError` from the except tuple | T017: an `AttributeError` in steps (1) to (3) returns `cursor_invalid`. A cursor whose `set` is a number is refused by the reader (`cursor fields are not the expected ones`), then `UUID(123)` raises `AttributeError` in `_cursor_code` (demonstrated in-process). The mutant makes it a 500 | IR-002 |
| `routes/classifications.py:76:manual:22` | late | drop `TypeError` | T017, DEC-0138. A cursor that is a base64 JSON list is refused by the reader (`payload is not a JSON object`), then `payload["set"]` raises `TypeError` (demonstrated) | IR-002 |
| `routes/classifications.py:76:manual:23` | late | drop `KeyError` | T017, DEC-0138. A cursor that is `{"v": 1}` is refused by the reader, then `payload["set"]` raises `KeyError` (demonstrated) | IR-002 |

**Probe run, outside the gate catalogue.** Two further manual mutants test
`test_filters_change_the_match_count_identically_on_every_page` alone:

- `classification_models.py:435:manual:41` sets `hide_incomplete=False` in
  `to_filters`.
- `435:manual:42` sets `symbol=None`.

Both survive. Results sha256
`9d21bd894041bc4e8d91bf83d4550446d6185835ddd541e7c8682340a72312dc`; not
persisted, because the skill persists only the gate run. The unit suite kills
the same changes in the gate run: `435:drop-field-copy:1` and
`435:manual:31`. So the forwarding is pinned, but this store-level test cannot
observe either filter (IR-001).

## Independent Validation

`R` = `repos/factorflow-v2/FactorFlow-v2`. Run sandboxed, `uv run` fails before
pytest starts: `error: Failed to initialize cache at
/Users/alvarodejodra/.cache/uv … failed to open file
/Users/alvarodejodra/.cache/uv/sdists-v9/.git: Operation not permitted (os
error 1)` (exit 2). Per adversarial-review F.4, each `uv run` and
`mutation-run.py run` below was run as one plain unsandboxed call.

Outside the sandbox Docker is reachable. `tests/conftest.py` starts
`PostgresContainer("postgres:16")`, the tech stack's database. The driver's
note that PostgreSQL 16 and Docker are unavailable describes the sandbox only.
No postgres-marked test was excluded.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-E3-integration-20261103T225646Z --json` | harness root | 0 | PASS | `ready`: review changes were reworked |
| `uv run --directory <R> --offline pytest tests/unit/test_api_classifications_routes.py tests/unit/test_api_classification_models.py tests/unit/test_api_classification_error_mapping.py -q -p no:cacheprovider` | `<R>` | 0 | PASS | `219 passed` (v1: 201; +18 rework tests) |
| `uv run --directory <R> --offline pytest tests/integration/test_api_classifications.py tests/integration/test_api_classification_summary.py tests/integration/test_api_classification_host_origin.py -m postgres -q -p no:cacheprovider -rf --tb=short` | `<R>` | 0 | PASS | `29 passed`: the story's "reads end to end" and DAC-E3-S5-6 host checks |
| `uv run --directory <R> --offline pytest -m postgres -q -p no:cacheprovider -rf --tb=line` | `<R>` | 0 | PASS | `919 passed, 1626 deselected` in 282.46 s (v1: 5 failed) |
| `uv run --directory <R> --offline pytest -m "not postgres" -q -p no:cacheprovider` | `<R>` | 0 | PASS | `1625 passed, 919 deselected, 1 xfailed` in 23.55 s |
| `uv run --directory <R> --offline ruff check .` | `<R>` | 0 | PASS | `All checks passed!` |
| `uv run --directory <R> --offline ruff format --check .` | `<R>` | 0 | PASS | `278 files already formatted` |
| `uv run --directory <R> --offline mypy src` | `<R>` | 0 | PASS | `Success: no issues found in 61 source files` |
| T021: `grep -n "psycopg\|SELECT\|INSERT" …/routes/classifications.py`; `grep -rn "massive" …/routes/classifications.py …/classification_models.py`; `grep -cE '^class (FactorCellResponse\|FactorsResponse\|SetBlock)\(' …/classification_models.py`; `git diff aed93bd HEAD --stat -- src/ tests/`; `uv run --directory <R> --offline pytest tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/unit/test_api_host_origin.py tests/unit/test_api_request_id.py tests/unit/test_api_runs_routes.py tests/unit/test_api_coverage_routes.py -q -p no:cacheprovider` | `<R>` | 1, 1, 0, 0, 0 | PASS | No SQL or driver import; no Massive reference; `3`; the ten planned files only; `83 passed` |
| `python3 scripts/check-tdd-evidence.py --evidence <R>/…/CAP-002-E3-S5-tdd-evidence.yaml --repo-dir <R> --base aed93bd8debe45c4c2dbc2de6a9c120d879041a9 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `python3 scripts/mutation-run.py generate --repo-dir <R> --range aed93bd…..HEAD --cycle review --out <scratch>/generated.json` (then 12 manual mutants appended) | harness root | 0 | PASS | 92 generated + 12 manual = 104 |
| `python3 scripts/mutation-run.py scope --repo-dir <R> --mutants <scratch>/mutants-with-manual.json --since bcdff3ef63ee0dca42e0feb4af55bcd66b55e0c7 --previous <R>/…/CAP-002-E3-S5-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 115: 103 carried, 2 delta, 10 late; `403:manual:10` no longer applies |
| `python3 scripts/mutation-run.py run --repo-dir <R> --mutants <scratch>/mutants.json --jobs 4 --command 'env PYTHONPATH={workdir}/src <R>/.venv/bin/python -m pytest <3 unit files> <3 integration files> -q -x -p no:cacheprovider' --out <scratch>/results.json` (unsandboxed) | harness root | 3 | FAIL | 112 killed, 3 survived, all `late` (Mutation Run); no survivor blocks |
| `python3 scripts/mutation-run.py run … --mutants <scratch>/probe-mutants.json --jobs 2 --command '… -m pytest tests/integration/test_api_classifications.py::test_filters_change_the_match_count_identically_on_every_page -q -x -p no:cacheprovider'` (unsandboxed) | harness root | 3 | FAIL | Probe: 2 survived (IR-001 evidence) |
| `uv build` | `<R>` | N/A | NOT RUN | The plan's Validation Plan runs it "only if packaging is affected"; no packaging file changed |

Required validation counted in the Gate Summary: the nine PASS rows from the
two pytest marker runs through the TDD lint. The story's Validation section
names five of them; the plan adds the focused unit run, the story integration
run, the T021 checks and the TDD lint. The mutation run is the E.9 test-quality
gate; its outcome is judged in Mutation Run.

### Validation Side Effects

- Before: `git status --porcelain=v1 --untracked-files=all` empty at `d0993d4`;
  `code-revision` `sha256:23c53f54…f570b89c`.
- After: empty at `d0993d4`; `code-revision` unchanged. Mutants ran in clones
  under `$TMPDIR`. Pytest ran with `-p no:cacheprovider`. `.mypy_cache`,
  `.ruff_cache` and `.hypothesis` are ignored. This report and its
  `-mutation.json` are the only files added, both under `docs/`, which the
  code fingerprint excludes.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 1 · **total 3**

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | carried | T012 cases (2) and (7) are still not implemented as planned |
| IR-002 | MEDIUM | late | Three `_cursor_code` exception branches are untested |
| IR-003 | LOW | carried | Duplicated percentile field and symbol-prefix validator |

### IR-001 — T012 cases (2) and (7) are still not implemented as planned (v1 IR-003, narrowed)

- **Severity**: HIGH
- **Scope**: carried (v1 IR-003 listed both cases)
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (design section 7 row "Match count is over the whole set", S03-2); T012's AC-15 reach for case (7)
- **Tasks**: T012
- **Files**: `tests/integration/test_api_classifications.py:105-122` (`test_filters_change_the_match_count_identically_on_every_page`), `:170-183` (`test_compare_reports_unknown_symbols_and_enforces_its_bounds`, retired stock at 177-180)
- **Claim challenged**: the cycle-2 description says the rework adds "the
  missing T012/T013 cases", and the cycle-2 spec-drift review says the patch
  "matches … T012 (cases 1, 2, 6, 7, 8, 9, 10, 11)".
- **Observed evidence**:
  - **Case (2).** The test seeds six stocks, all classified. Four pass
    `value_percentile_min=50` (`H0` to `H3`), and the same four start with
    `H`. The `hide_incomplete=true` and `symbol=h` variants therefore return
    the same 4 as the threshold alone, so neither shows that filter changing
    `match_count`. The probe proves it: with `to_filters` forced to
    `hide_incomplete=False` (`435:manual:41`) or `symbol=None`
    (`435:manual:42`), the test still passes. No other postgres test asserts
    `match_count` under `hide_incomplete` or a prefix.
    `test_thresholds_and_hide_incomplete_follow_the_documented_rule` checks
    the stocks returned, not the count.
  - **Case (7).** `OLD` is seeded with
    `seed_scored_stock(…, value=SCORE, lifecycle="retired")`, so all three of
    its cells are `classified`. The test asserts
    `kept["stocks"][1]["lifecycle"] == "retired"` and nothing about a reason.
    The reader design (section on `stocks_current`, lines 477-478) and
    factor-engine section 7 say the engine stores a retired instrument as
    `not_classified` rows with reason `retired`. The seeded state cannot
    occur, and the planned assertion is absent.
- **Expected evidence/behavior**:
  - T012 (2): "thresholds, `hide_incomplete` and `symbol` prefix change the
    count identically on every page". The design section 7 row says:
    "thresholds and `hide_incomplete` change it; `symbol` prefix changes it".
  - T012 (7): "a retired instrument is included with its `retired` reason".
- **Impact**: at the store level, the API's `hide_incomplete` and prefix
  effect on `match_count` is unproven, and so is a retired stock's reason in
  compare. Today the unit suite pins the forwarding, and the reader computes
  page and count from one `matched` CTE, so no current defect follows. The
  plan's end-to-end evidence is still missing, though, and the rework's claim
  that it is present is inaccurate.
- **Required remediation**:
  - **Case (2).** Seed so that each variant changes the count. For example,
    add a stock with an input reason that passes the threshold, so
    `hide_incomplete=true` lowers the count, and a stock that passes the
    threshold under another prefix, so `symbol=h` lowers it. Then assert each
    variant's count, equal on every page. Run alone, the test must fail on
    probe mutants `435:manual:41` and `435:manual:42`.
  - **Case (7).** Seed the retired compare stock as the engine stores it
    (`not_classified`, `reason_code` `retired`, for example through
    `seed_scored_stock`'s reason tuples) and assert the reason code on its
    cells, beside `lifecycle`.

### IR-002 — Three `_cursor_code` exception branches are untested

- **Severity**: MEDIUM
- **Scope**: late (line 76 is unchanged since `bcdff3e`; new reviewer mutants)
- **Status**: OPEN
- **Acceptance criteria**: AC-16
- **Tasks**: T009, T017
- **Files**: `src/factorflow/api/routes/classifications.py:72-76`; `tests/unit/test_api_classification_error_mapping.py:440-449` (`INVALID`)
- **Claim challenged**: T009's `cursor_invalid` rows cover every path by which
  `_cursor_code` returns `cursor_invalid`.
- **Observed evidence**: three mutants survive the unit and integration
  suites. Each removes one class from
  `except (ValueError, KeyError, TypeError, AttributeError, CursorError)`:
  `76:manual:21` drops `AttributeError`, `:22` drops `TypeError`, and `:23`
  drops `KeyError`.

  In-process, the reader refuses all three of these cursors with
  `CursorError`, so the route reaches `_cursor_code`, where step (2) raises:
  - a cursor whose `set` is a number raises `AttributeError`;
  - a base64 JSON list raises `TypeError`;
  - `{"v": 1}` raises `KeyError`.

  Each mutant would turn that 422 `cursor_invalid` into a 500
  `internal_error`. No `INVALID` row has a non-string `set`, a non-object
  payload, or an object without `set`.
- **Expected evidence/behavior**: T017: "Any `ValueError`, `KeyError`,
  `TypeError`, `AttributeError` or `reader.CursorError` raised in steps (1) to
  (3), a `None` cursor included, returns `cursor_invalid`". DEC-0138: every
  cursor that is not stale is `cursor_invalid`.
- **Impact**: narrowing the except tuple would make some malformed,
  owner-supplied cursors give a 500 instead of the documented 422. The code is
  correct today.
- **Required remediation**: optional at this gate (`late`). Add `INVALID` rows
  for a cursor whose `set` is a number, one that is a JSON list, and one that
  is an object without `set`, so all three mutants are killed.

### IR-003 — Duplicated percentile field and symbol-prefix validator in `classification_models.py` (v1 IR-009)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T016
- **Files**: `src/factorflow/api/classification_models.py:32` and `358` (`_PERCENTILE`, `_PERCENTILE_BOUND`); the two identical `_symbol_prefix` validators (E1-S6's `Thresholds`, lines 79-87, and `ClassificationListQuery`, lines 415-423)
- **Claim challenged**: the module holds one definition of each rule.
- **Observed evidence**: unchanged since v1. The cycle-2 description says
  IR-009 "(optional) is not addressed".
- **Expected evidence/behavior**: one definition of the percentile bound and
  the prefix rule within the module (SA-DUP-001 spirit).
- **Impact**: the saved `Thresholds` and the list query can drift apart on a
  later edit.
- **Required remediation**: optional. Reuse `_PERCENTILE`, and share the
  prefix validator the way `_normalised_name` is shared.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `api_classification_support.py:building_run` inserts a `running` run with `claimed_by` and `heartbeat_at`. `pytest -m postgres`: `919 passed`. The five v1 failures pass |
| v1/IR-002 | RESOLVED | `test_a_newer_set_is_carried_as_later_and_equals_the_list_read` is parametrised over `building` and `failed`, one newer set per test. `later_set` takes `started_at`, and the sets test uses distinct times |
| v1/IR-003 | STILL OPEN (narrowed) | Resolved: T012 (1), (8), (9), (10), (11); T013 (1), (3). Still open: T012 (2) and (7), carried as v2 IR-001 |
| v1/IR-004 | RESOLVED | `_forge` recomputes `chk`. Rows `unknown sort`, `unknown order` and `set not a UUID` now fail on lines 72 and 73. Mutants `72:manual:1` and `73:manual:2` are killed |
| v1/IR-005 | RESOLVED | `test_a_missing_universe_names_its_id_and_the_list_read`, `test_each_read_that_can_refuse_names_its_own_operation` and `test_every_cursor_refusal_is_in_the_classification_resource`. Mutants `56:manual:4`, `182:manual:6`, `219:manual:5` and `47:manual:11` are killed |
| v1/IR-006 | RESOLVED | `test_to_filters_keeps_a_zero_valued_bound`, plus the postgres `value_score_min=0` assertion. Mutant `428:manual:3` is killed |
| v1/IR-007 | RESOLVED | `classification_models.py:403` no longer skips empty parts. `test_an_empty_symbols_entry_is_refused_on_symbols` covers four forms, and `red-cycle-2.log` shows them failing before the change. Delta mutant `403:manual:28` is killed |
| v1/IR-008 | RESOLVED | The comment is now `# Implements T009 (DEC-0138 rows)` (error-mapping file line 458) |
| v1/IR-009 | STILL OPEN | Unchanged and optional; carried as v2 IR-003 (LOW) |
| v1/IR-010 | RESOLVED | The T008 (b) request-id test covers the summary. The T009 unmapped rows include `psycopg.OperationalError` |

## Scope and Plan Deviations

- **Justified:**
  - The one production change, `classification_models.py:403`, implements
    T016's "shape-checks each" and design 2.4's "every symbol". It is the
    first remedy v1 IR-007 offered, so no decision record was needed. The web
    client sends one repeated `symbols` key per entry
    (`web/src/api/classification-client.ts:729`), so no caller in this branch
    sends empty entries.
- **Justified test support:**
  - `building_run` writes the `acquisition_run` row with raw SQL, because
    `reader_seed.insert_run` sets no claim.
  - `_forge` reuses `reader._cursor_check`, a private reader function. T009's
    re-encoding recipe predates the cursor checksum (DEC-0246). Reusing the
    reader's digest keeps one algorithm, and a rename fails at import.
- **Still justified from v1 (DEC-0281):** delegation to E1-S6's
  `from_reader`; `compare_conflicts` reading query-string names; the default
  Decimal NaN and infinity refusal; no `response_model=None`.
- **Bookkeeping inconsistency:**
  - The cycle-2 spec-drift review states the patch matches T012 cases 2 and
    7, which this review does not confirm (IR-001).
  - The `test_an_outdated_input_…` docstring says "`outdated` and `missing`
    count against a stock", but the test seeds only `outdated`. `missing` is
    in the sibling test.
- **Corrected since v1:** the TDD evidence header no longer claims Docker is
  absent.
- **Out-of-scope changes:** none.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: rework CAP-002-E3-S5 against this report.
  - Implement T012 (2) so that the `hide_incomplete` and prefix variants each
    change `match_count`, equal on every page, and fail on probe mutants
    `435:manual:41` and `435:manual:42` when run alone.
  - Implement T012 (7) with the retired compare stock seeded as `not_classified`
    with reason `retired`, and assert that reason (IR-001).
  - Optionally add the three IR-002 cursor rows, and address IR-003.
  - Run `uv run pytest -m postgres` outside the sandbox and record cycle-3 in
    the TDD evidence.
  - Then set the tasks file to `last_reworked_review:
    CAP-002-E3-S5-implementation-review-v2.md` and request review v3. v3's
    baseline is this report and its `-mutation.json`.
- **Warnings accepted downstream**: N/A
