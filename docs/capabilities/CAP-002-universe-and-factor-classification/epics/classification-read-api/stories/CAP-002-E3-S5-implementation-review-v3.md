---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S5-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-04
updated: 2026-11-04
story_id: "CAP-002-E3-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-11-04T17:07:38Z"
reviewed_head: "48d56a4ca9de69e5129ac0cb55a81fcfe602ea54"
review_base: "aed93bd8debe45c4c2dbc2de6a9c120d879041a9"
reviewed_state_revision: "sha256:69a316a983378ccb0928423d57a3ebdd2e6c21fd1311d5d0b6d1a113b1fe0f81"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E3-S5
    artifact_version: 1
    content_revision: sha256:b737301094032490f55bf65d3c31069652614f1747e0e66963c66c1b4bdcec87
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-04T17:07:38Z
  source_artifacts:
    - id: CAP-002-E3-S5
      version: "1 (sha256:b737301094032490f55bf65d3c31069652614f1747e0e66963c66c1b4bdcec87)"
    - id: CAP-002-E3-S5-tasks
      version: "1 (updated 2026-11-04; last_reworked_review v2)"
    - id: CAP-002-E3-S5-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-002-E3-S5-implementation-review
      version: "2 (baseline; reviewed_head d0993d42bcc4a4e45da6088a26f75126887d76df)"
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

# Implementation Review: CAP-002-E3-S5 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 16/16 satisfied |
| Planned tasks | 23/23 verified |
| Required validation | 9/9 passed |

The cycle-3 rework changes two test files and nothing in production. It
closes v2's only blocking finding:

- **T012 (2), v2 IR-001.** The match-count test now seeds `HX`, which has an
  input reason and passes the threshold, and `ZZZ`, which passes under another
  prefix. The threshold alone gives 6, `hide_incomplete=true` gives 5, and
  `symbol=h` gives 5, each asserted on two pages. This review reran v2's two
  probe mutants against that test alone, and both are now killed.
- **T012 (7), v2 IR-001.** The retired compare stock is now seeded the way
  `classify.sql` stores a retired instrument (`not_classified`, reason
  `retired`, no input). The test asserts its status and reason codes.
- **v2 IR-002.** Three new `INVALID` cursor rows reach the `AttributeError`,
  `TypeError` and `KeyError` branches of `_cursor_code`. Mutants
  `76:manual:21` to `:23`, which survived v2, are killed.

This review's gate mutation run killed all 116 mutants. Every required command
passes: `-m postgres` gives 919 passed and `-m 'not postgres'` gives 1628
passed, 1 xfailed, which is 2547 + 1 xfailed in total. Lint, format, types,
the T021 checks and the TDD lint are clean.

Two LOW findings remain, and neither blocks:

- **IR-001 (`carried`).** v2 IR-003's duplicated percentile field and
  symbol-prefix validator, which the coder chose not to fix (it was optional).
- **IR-002 (`late`).** T012 (6) seeds its retired universe member with
  classified cells, a state the engine never writes.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S5-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, this run's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S5-run-20261103T225646Z` |
| HEAD | `48d56a4ca9de69e5129ac0cb55a81fcfe602ea54` (`rework(classification): CAP-002-E3-S5 against review v2 - match-count variants, retired reason, cursor rows`) |
| Review base | `aed93bd8debe45c4c2dbc2de6a9c120d879041a9`. `pipeline-state.py review-base` resolves it as the merge base with `origin/main`. With `--base-ref usr/alvaro-de-jodra/CAP-002-E3-integration-20261103T225646Z` it resolves to the same commit, so it agrees with v2. `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` empty); code fingerprint unchanged |
| Changed files reviewed | 38 over five commits since the base: `bcdff3e` story coding, `1a27db8` review v1, `d0993d4` rework 1, `c13ba10` review v2, `48d56a4` rework 2 |
| Baseline | v2 (`CHANGES-REQUIRED`), `reviewed_head` `d0993d42bcc4a4e45da6088a26f75126887d76df`, with `CAP-002-E3-S5-implementation-review-v2-mutation.json` |

`pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story
<story> --stage adversarial-review` reports `READY — review changes were
reworked; a new review version is required`.

**Context refresh before the review.** `check-prerequisites.sh --project
factorflow-v2 --require tech-stack` first exited 2. The only failing check was
context freshness: the last run was 2026-11-03T03:44:42Z, 37 hours earlier,
against a 24-hour window. No interactive input tool was available. The review
therefore followed the owner-upheld DEC-0029 and the safeguards of DEC-0261:

1. It recorded the clone's state first: branch, HEAD `48d56a4`, `origin/main`
   `aed93bd`, merge base `aed93bd`, and a clean tree.
2. It ran `bash scripts/context_feeder.sh --project factorflow-v2 --verbose`.
   The first, sandboxed run fetched, then could not write the cache through
   the `cache/` symlink (`Operation not permitted`). The rerun outside the
   sandbox completed. The feeder only fetches a repository that is on a
   feature branch.
3. It re-ran the check, which exited 0.
4. It confirmed that the branch, HEAD, `origin/main`, the merge base and the
   clean tree were all unchanged.

No evidence in this report comes from `cache/`.

Scope comes from git. `git diff d0993d4..HEAD -- src/` is empty, so no
production line changed since the baseline. The rework changed only
`tests/integration/test_api_classifications.py` (cases 2 and 7),
`tests/unit/test_api_classification_error_mapping.py` (three `INVALID` rows),
the tasks frontmatter, the TDD evidence (cycle-3) and its evidence files.
`mutation-run.py scope --since d0993d4` tags each mutant.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/api/routes/classifications.py` | added | AC-9, AC-13, AC-16 to AC-18, AC-20 to AC-22; T017 to T019 (unchanged since v1) |
| `src/factorflow/api/classification_models.py` | modified | T015, T016 (unchanged since v2) |
| `src/factorflow/api/app.py` | modified | DAC-E3-S5-6; T020 (unchanged since v1) |
| `tests/unit/test_api_classifications_routes.py` | added | T003 to T006, T008, T011 (unchanged since v2) |
| `tests/unit/test_api_classification_models.py` | modified (additive) | T004, T006, T010 (unchanged since v2) |
| `tests/unit/test_api_classification_error_mapping.py` | modified (additive) | T007, T009; rework: `INVALID` rows `set a number`, `not an object`, `no set` (lines 449-451, v2 IR-002) |
| `tests/integration/api_classification_support.py` | added | T002 (unchanged since v2) |
| `tests/integration/test_api_classifications.py` | added | T012; rework: case (2) at lines 105-126 and case (7) at lines 174-193 (v2 IR-001) |
| `tests/integration/test_api_classification_summary.py` | added | T013 (unchanged since v2) |
| `tests/integration/test_api_classification_host_origin.py` | modified (additive) | T014 (unchanged since v1) |
| `…/stories/CAP-002-E3-S5.md` | modified | status `planning` → `in-review` (story coding hand-off, as v2) |
| `…/stories/CAP-002-E3-S5-tasks.md` | modified | 23 checkboxes; `updated: 2026-11-04`; `last_reworked_review: CAP-002-E3-S5-implementation-review-v2.md` |
| `…/stories/CAP-002-E3-S5-tdd-evidence.yaml` | added | T023 (cycle-1, cycle-2, cycle-3) |
| `…/stories/CAP-002-E3-S5-evidence/` (21 files: `cycle-{1,2,3}.patch`, `red-`, `green-`, `code-review-`, `spec-drift-cycle-{1,2,3}`, `mutation-cycle-{1,2,3}-{mutants,results}.json`) | added | T023 |
| `…/stories/CAP-002-E3-S5-implementation-review-v{1,2}.md`, `…-v{1,2}-mutation.json` | added | Reviews v1 and v2, committed by the driver |

No changed file is unjustified. `git diff aed93bd HEAD --stat -- src/ tests/`
lists exactly the ten source and test files above. The only deleted lines are
the import lines that `app.py` and `classification_models.py` extend.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `_cell_response` → E1-S6 `FactorCellResponse.from_reader`; `routes/classifications.py:_json` uses `model_dump(mode="json")` | TC-COMP-070 tests; postgres `test_the_list_carries_the_set_the_factors_and_string_scores` asserts `"1.250000"` and `"87.500000"` | Decimal strings at stored precision on the wire |
| AC-13 | SATISFIED | `ClassificationSummaryResponse.from_reader` copies `stocks_current` | postgres `test_the_summary_counts_the_current_stocks`, `test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count` | Unchanged since v2 |
| AC-16 | SATISFIED | `ClassificationListQuery`, `to_filters`, `compare_conflicts`; route `list_classifications` | T011 (a) full `ListFilters` equality; postgres `test_filters_change_the_match_count_identically_on_every_page` (6, 5, 5 on two pages); threshold, sort, scope and compare tests | v2's gap is closed: `hide_incomplete` and the prefix each change `match_count` at store level (probe mutants killed) |
| AC-17 | SATISFIED | `StockEvidenceResponse.from_reader`; `_symbol` dependency | postgres evidence tests (inputs, dates, restated, detail, retired universe omitted, DEC-0140 empty shape) | Unchanged since v2 |
| AC-18 | SATISFIED | `StockHistoryResponse.from_reader`; route `stock_history` | postgres history tests | Unchanged since v2 |
| AC-20 | SATISFIED | `_SetBlocks.parts`, `_later_block`, `SetResponse.from_reader` | TC-COMP-173; postgres `later` and sets tests | Unchanged since v2 |
| AC-21 | SATISFIED | `SetBlock` via `_set_block`; `SetResponse.run_started_at`, `ended_at` | postgres list and sets tests | Unchanged since v2 |
| AC-22 | SATISFIED | `_factor_summaries(None)` zero record (DEC-0140) | TC-COMP-173; postgres never-classified tests | Unchanged since v2 |
| DAC-E3-7 | SATISFIED | `_compare_symbols`; route calls `reader.compare` | TC-COMP-125; postgres `test_compare_reports_unknown_symbols_and_enforces_its_bounds` | `unknown_symbols == ["NOPE"]`; the retired stock is returned with `not_classified` cells whose reason is `retired` |
| DAC-E3-11 | SATISFIED | One builder, `_SetBlocks.parts` | TC-COMP-173; postgres summary currency test | Unchanged since v2 |
| DAC-E3-S5-1 | SATISFIED | `/summary` declared second | `test_summary_reaches_the_summary_handler_not_a_path_parameter`, `test_the_router_lists_summary_before_the_parameterised_paths` | Unchanged |
| DAC-E3-S5-2 | SATISFIED | `_compare_symbols` with `classification_bounds` constants | TC-COMP-125 tests | Unchanged |
| DAC-E3-S5-3 | SATISFIED | `_SetBlocks.parts`, `_factor_summaries` | `test_never_classified_list_and_summary_share_one_shape` | Unchanged |
| DAC-E3-S5-4 | SATISFIED | `FactorCellResponse` Decimal fields; `restated_possible: bool` | TC-COMP-070 tests | Unchanged |
| DAC-E3-S5-5 | SATISFIED | `REFUSALS`, `_refuse`, `_reason` | TC-COMP-148 tests | Unchanged |
| DAC-E3-S5-6 | SATISFIED | `app.py` `include_router(classifications.router)` | TC-COMP-126 tests; postgres host-origin tests pass | Unchanged |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Producers import and are used | As v2 |
| T002 | complete | VERIFIED | `api_classification_support.py:classification_app`, `building_run` | Unchanged; all 29 story postgres tests pass |
| T003 | complete | VERIFIED | routes file, TC-COMP-172 | |
| T004 | complete | VERIFIED | models and routes files, TC-COMP-125 | |
| T005 | complete | VERIFIED | routes file, TC-COMP-173 | |
| T006 | complete | VERIFIED | models file and route wire test, TC-COMP-070 | |
| T007 | complete | VERIFIED | error-mapping file, TC-COMP-148 | |
| T008 | complete | VERIFIED | routes file, TC-COMP-126 | |
| T009 | complete | VERIFIED | error-mapping file, `INVALID` lines 440-452 | Three new rows. `set a number` is `_forge(…, set=7)`, so `UUID(7)` raises `AttributeError`. `not an object` is base64 of `[1,2]`, so `payload["set"]` raises `TypeError`. `no set` is `_forge(…, set=None)`, which pops the key (`_forge` line 338), so `payload["set"]` raises `KeyError`. Each kills one of `76:manual:21` to `:23` (Mutation Run) |
| T010 | complete | VERIFIED | models file | Unchanged since v2 |
| T011 | complete | VERIFIED | routes file | Unchanged; this review's `450:manual:43` (limit not exempt) is killed by `test_symbols_accepts_a_limit` |
| T012 | complete | VERIFIED | `tests/integration/test_api_classifications.py`, 17 functions, all passing against `postgres:16` | Case (2) at lines 105-126: each filter changes `match_count`, equal on both pages. Probes `435:manual:41` and `:42` are killed by this test alone. Case (7) at lines 174-193: the retired stock is seeded as `classify.sql:130-136` stores it, and its `status` and `reason_code` are asserted. Case (6)'s seeding is noted under IR-002 (LOW) |
| T013 | complete | VERIFIED | `tests/integration/test_api_classification_summary.py` | Unchanged since v2 |
| T014 | complete | VERIFIED | host-origin classification tests | Unchanged; pass |
| T015 | complete | VERIFIED | `classification_models.py` | Unchanged; DEC-0281 deviation as v1 and v2 recorded |
| T016 | complete | VERIFIED | `ClassificationListQuery` | Unchanged since v2 |
| T017 | complete | VERIFIED | `routes/classifications.py:64-78` (`_cursor_code`) | Follows DEC-0138 as amended by E3-F07. Every exception class in the line-76 tuple is now pinned |
| T018 | complete | VERIFIED | routes lines 149-197 | Unchanged |
| T019 | complete | VERIFIED | routes lines 200-254 | Unchanged |
| T020 | complete | VERIFIED | `app.py` import block and one `include_router` line | Unchanged |
| T021 | complete | VERIFIED | Re-run by this review (Independent Validation) | |
| T022 | complete | VERIFIED | `green-cycle-3.log`; this review's runs | 919 + 1628 passed and 1 xfailed, which matches the coder's 2547 passed, 1 xfailed; lint, format and types clean |
| T023 | complete | VERIFIED | `CAP-002-E3-S5-tdd-evidence.yaml` cycle-3 | The TDD lint with `--require-logs` exits 0. `git diff d0993d4 HEAD -- src tests` hashes to the recorded `diff_sha256` `2fb06051…a504778`, which is also the hash of `cycle-3.patch`. Every cited log hash matches. RED: `red-cycle-3.log` shows each reworked test failing on one of v2's five probes, and this review's probe and gate runs corroborate it |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-172 tests | ADEQUATE | 200 from the summary double while the other reads raise; router order and six GET paths pinned | none |
| TC-COMP-125 tests | ADEQUATE | 0, 1, 7 symbols refused on `("symbols",)`; 2 and 6 reach `compare`; count after dedupe; constants imported | none |
| TC-COMP-173 tests | ADEQUATE | `never_classified`, `set`, `later`, `factors` equal on both reads; key sets pinned | none |
| TC-COMP-070 tests | ADEQUATE | Exact JSON dumps; sign and scale kept; no numeric token on the wire | none |
| TC-COMP-148 tests | ADEQUATE | Exact envelope keys, code, resource, request id; operation and symbol in the message; no leak | none |
| TC-COMP-126 tests | ADEQUATE | Foreign Host 400 before the reader; request id in header and body; JSON 404 under `/api/classifications/`; router before the `static` mount | none |
| T009 cursor rows (`INVALID`, `STALE`, history and sets) | ADEQUATE | Eleven `INVALID` rows, each failing on the rule it names. They now include a non-string `set`, a non-object payload and a missing `set`. `cursor_stale` for two well-formed cursors; history and sets always invalid; cursor text never in the body | none: v2's three unpinned branches are now pinned |
| T009 refusal, unmapped and completeness rows | ADEQUATE | As v2 | none |
| T010 query-model tests | ADEQUATE | As v2 | none |
| T011 delegation tests | ADEQUATE | As v2; also kills `450:manual:43` | none |
| T012 `test_filters_change_the_match_count_identically_on_every_page` | ADEQUATE | Eight stocks, `limit=2`, `value_percentile_min=50`. The threshold alone gives 6; `hide_incomplete` gives 5, because `HX` has an input reason; `symbol=h` gives 5, because `ZZZ` has another prefix. Each count is equal on pages 1 and 2. `value_score_min=0` keeps the six that pass it and drops `LOW1` and `LOW2`, which pins the zero bound | none. Whether the reader's bound is inclusive is the reader's rule (CAP-002-E3-S2), not this story's |
| T012 `test_compare_reports_unknown_symbols_and_enforces_its_bounds` | ADEQUATE | `unknown_symbols`; 1 and 7 symbols refused naming `symbols`. The retired instrument is returned with `lifecycle` `retired` and all three cells `not_classified` with reason `retired`, seeded as `classify.sql:130-136` writes it | none |
| T012 `test_a_universe_scopes_the_list_and_an_unknown_one_is_404` | ADEQUATE | Scope keeps the retired member; the unscoped list omits it; a retired universe still reads; an unknown id is 404 | The retired member is seeded with classified cells, a state the engine never writes (IR-002, LOW, `late`) |
| T012 other functions (14) | ADEQUATE | As v2 | none |
| T013 summary tests | ADEQUATE | As v2 | none |
| T014 host-origin tests | ADEQUATE | As v2; all pass | none |

**Isolation and determinism.** The unit tests double the reader through the
module the routes use, and open no pool. Each integration test uses a fresh
database. The rework adds no time, order or network dependence. Symbol-order
assertions such as `["H0", "H1", "H2", "H3", "HX", "ZZZ"]` follow the default
`sort=symbol`.

### Mutation Run

This review generated its mutants over every changed production file:

- `mutation-run.py generate --range aed93bd..HEAD --cycle review` gives 92
  catalogue mutants: 73 in `classification_models.py` and 19 in
  `routes/classifications.py`.
- The review added one mutant by hand, `450:manual:43`, which makes `limit`
  conflict with `symbols` (DEC-0141, T011 (c)).
- `scope --since d0993d4 --previous
  CAP-002-E3-S5-implementation-review-v2-mutation.json` added v2's 23 manual
  mutants, and none of them has stopped applying.
- `scope` tagged the 116 mutants as **112 carried and 4 late**. The late ones
  are `76:manual:21`, `:22`, `:23` and `450:manual:43`. There are no delta
  mutants, because no production line changed since v2.

The run used four jobs and the story's six focused files, three unit and three
integration, against `postgres:16`. All four baselines exited 0 with
`251 passed`.

**Result: 116 mutants, 116 killed, 0 survived.** The results file has sha256
`9d4b523c8a0b44cba90ddbdfb27a7667c52c6df191fcf12ead3759c6e9c283b8` and is copied
as `CAP-002-E3-S5-implementation-review-v3-mutation.json`. The three v2
survivors are killed by the new rows:

- `76:manual:21` by `[set a number]`;
- `:22` by `[not an object]`;
- `:23` by `[no set]`.

**Probe run, outside the gate catalogue.** This review rebuilt v2's two IR-001
probes as `435:manual:41` (`hide_incomplete=False`) and `435:manual:42`
(`symbol=None`). It ran them against
`test_filters_change_the_match_count_identically_on_every_page` and
`test_compare_reports_unknown_symbols_and_enforces_its_bounds` only. Both
baselines gave `2 passed`. Both probes are killed by the match-count test:
`{'hide_incomplete': 'true'}` and `{'symbol': 'h'}` each fail `assert 6 == 5`
at line 124. The results sha256 is
`baeddfd4fddea01623e18d5eb10f1068b73ebbebfb345f982bc2653546e4991f`. As in v2,
the probe results are not persisted, because the skill persists only the gate
run.

## Independent Validation

`R` = `repos/factorflow-v2/FactorFlow-v2`. Per adversarial-review F.4, each
`uv run` and `mutation-run.py run` was one plain call outside the sandbox. v2
recorded the sandboxed `uv` cache failure, and outside the sandbox Docker
serves `postgres:16` (`tests/conftest.py`). No postgres-marked test was
excluded.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 2, then 0 | PASS | Context stale (37 h). Refreshed with `bash scripts/context_feeder.sh --project factorflow-v2 --verbose`, which exited 0 when run outside the sandbox. Clone state was unchanged (Review Subject) |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `uv run --directory <R> --offline pytest tests/unit/test_api_classifications_routes.py tests/unit/test_api_classification_models.py tests/unit/test_api_classification_error_mapping.py -q -p no:cacheprovider` | harness root | 0 | PASS | `222 passed` (v2: 219; +3 `INVALID` rows) |
| `uv run --directory <R> --offline pytest tests/integration/test_api_classifications.py tests/integration/test_api_classification_summary.py tests/integration/test_api_classification_host_origin.py -m postgres -q -p no:cacheprovider -rf --tb=short` | harness root | 0 | PASS | `29 passed`: the story's "reads end to end" and the DAC-E3-S5-6 host checks |
| `uv run --directory <R> --offline pytest -m postgres -q -p no:cacheprovider -rf --tb=line` | harness root | 0 | PASS | `919 passed, 1629 deselected` in 301.81 s |
| `uv run --directory <R> --offline pytest -m "not postgres" -q -p no:cacheprovider` | harness root | 0 | PASS | `1628 passed, 919 deselected, 1 xfailed` in 29.30 s |
| `uv run --directory <R> --offline ruff check .` | harness root | 0 | PASS | `All checks passed!` |
| `uv run --directory <R> --offline ruff format --check .` | harness root | 0 | PASS | `278 files already formatted` |
| `uv run --directory <R> --offline mypy src` | harness root | 0 | PASS | `Success: no issues found in 61 source files` |
| T021: `grep -n "psycopg\|SELECT\|INSERT" src/factorflow/api/routes/classifications.py`; `grep -rn "massive" src/factorflow/api/routes/classifications.py src/factorflow/api/classification_models.py`; `grep -cE '^class (FactorCellResponse\|FactorsResponse\|SetBlock)\(' src/factorflow/api/classification_models.py`; `git diff aed93bd HEAD --stat -- src/ tests/`; `uv run --directory <R> --offline pytest tests/unit/test_api_isolation.py tests/unit/test_api_errors.py tests/unit/test_api_host_origin.py tests/unit/test_api_request_id.py tests/unit/test_api_runs_routes.py tests/unit/test_api_coverage_routes.py -q -p no:cacheprovider` | `<R>` | 1, 1, 0, 0, 0 | PASS | No SQL or driver import; no Massive reference; `3`; the ten planned files only; `83 passed` |
| `python3 scripts/check-tdd-evidence.py --evidence <R>/…/CAP-002-E3-S5-tdd-evidence.yaml --repo-dir <R> --base aed93bd8debe45c4c2dbc2de6a9c120d879041a9 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `python3 scripts/mutation-run.py generate --repo-dir <R> --range aed93bd…..HEAD --cycle review --out <scratch>/generated.json`, then `manual:43` appended | harness root | 0 | PASS | 92 generated + 1 manual = 93 |
| `python3 scripts/mutation-run.py scope --repo-dir <R> --mutants <scratch>/mutants-with-manual.json --since d0993d42bcc4a4e45da6088a26f75126887d76df --previous <R>/…/CAP-002-E3-S5-implementation-review-v2-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 116: 112 carried, 4 late; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <R> --mutants <scratch>/mutants.json --jobs 4 --command 'env PYTHONPATH={workdir}/src <R>/.venv/bin/python -m pytest <3 unit files> <3 integration files> -q -x -p no:cacheprovider' --out <scratch>/results.json` (unsandboxed) | harness root | 0 | PASS | 116 killed, 0 survived |
| `python3 scripts/mutation-run.py run … --mutants <scratch>/probe-mutants.json --jobs 2 --command '… -m pytest tests/integration/test_api_classifications.py::test_filters_change_the_match_count_identically_on_every_page tests/integration/test_api_classifications.py::test_compare_reports_unknown_symbols_and_enforces_its_bounds -q -x -p no:cacheprovider'` (unsandboxed) | harness root | 0 | PASS | Probe: 2 killed (v2 IR-001 evidence) |
| `uv build` | `<R>` | N/A | NOT RUN | The plan's Validation Plan runs it "only if packaging is affected"; no packaging file changed |

Nine required rows count toward the Gate Summary: the focused unit run, the
story integration run, the two pytest marker runs, ruff check, ruff format,
mypy, the T021 checks and the TDD lint. The story's Validation section names
five of them, and the plan adds the other four. The gate mutation run is the
E.9 test-quality gate, and its outcome is judged under Mutation Run.

### Validation Side Effects

- **Before.** `git status --porcelain=v1 --untracked-files=all` was empty at
  `48d56a4`, and `code-revision` gave
  `sha256:69a316a983378ccb0928423d57a3ebdd2e6c21fd1311d5d0b6d1a113b1fe0f81`.
- **After.** The tree was empty at `48d56a4`, and `code-revision` was
  unchanged.
  - The context feeder fetched `origin`, and `origin/main` stayed at
    `aed93bd`.
  - Mutants ran in clones under `$TMPDIR`.
  - Pytest ran with `-p no:cacheprovider`. `.mypy_cache`, `.ruff_cache` and
    `.hypothesis` are ignored.
  - This report and its `-mutation.json` are the only files added. Both are
    under `docs/`, which the code fingerprint excludes.
- **Unexpected tracked-file changes:** none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | LOW | carried | Duplicated percentile field and symbol-prefix validator |
| IR-002 | LOW | late | T012 (6) seeds its retired universe member in a state the engine never writes |

### IR-001 — Duplicated percentile field and symbol-prefix validator in `classification_models.py` (v2 IR-003, v1 IR-009)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T016
- **Files**:
  - `src/factorflow/api/classification_models.py:32` (`_PERCENTILE`) and `:358`
    (`_PERCENTILE_BOUND`), which are the same `Field(default=None, ge=0, le=100)`;
  - the two identical `_symbol_prefix` validators: E1-S6's `Thresholds` at
    lines 79-87 and `ClassificationListQuery` at lines 415-423.
- **Claim challenged**: the module holds one definition of each rule.
- **Observed evidence**: unchanged since v1. `git diff d0993d4 HEAD -- src/` is
  empty. The cycle-3 description says "IR-003 (optional) is not addressed".
- **Expected evidence/behavior**: one definition of the percentile bound and
  the prefix rule within the module (SA-DUP-001 spirit).
- **Impact**: the saved `Thresholds` and the list query could drift apart on a
  later edit. Today both are identical and tested.
- **Required remediation**: optional. Reuse `_PERCENTILE`, and share the prefix
  validator the way `_normalised_name` is shared.

### IR-002 — T012 (6) seeds its retired universe member in a state the engine never writes

- **Severity**: LOW
- **Scope**: late. Line 158 dates from `bcdff3e` (`git blame`) and is unchanged
  since v2's `reviewed_head`.
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (design section 3: "a universe scopes it and keeps its retired members")
- **Tasks**: T012 (6)
- **Files**: `tests/integration/test_api_classifications.py:153-171` (`test_a_universe_scopes_the_list_and_an_unknown_one_is_404`); the retired member is seeded at line 158
- **Claim challenged**: T012 (6)'s store-level test shows that a universe keeps
  a retired member as the product stores one.
- **Observed evidence**:
  - `OLD` is seeded with `seed_scored_stock(conn, set_id, "OLD", value=SCORE,
    lifecycle="retired")`. Its value cell is `classified`, and its growth and
    momentum cells are classified by default.
  - `classify.sql:130-136` writes a retired instrument's rows as
    `not_classified`, with reason `retired`, no input and `restated_possible`
    false. The seeded state therefore cannot occur.
  - A reader regression that dropped `retired`-reason rows from a scoped list
    would still pass this test.
  - The rework's own case (7) now seeds the realistic state, and the cycle-3
    code review noted this case as non-blocking item (b).
- **Expected evidence/behavior**:
  - T012 (6): "universe scope: `universe_id` scopes and keeps a retired member
    (... seed a retired instrument member)".
  - The plan does not demand the `retired` reason here, so T012 (6) is
    implemented as written.
- **Impact**: low. The reader's own suite already pins this rule with
  realistic seeding: `tests/integration/test_reader_list.py:200-233` (scoped
  read keeps `RET`, seeded `RETIRED` on all three factors) and
  `test_unscoped_list_is_active_only`. The API forwards `universe_id`, which
  T011 (a) and the gate mutants pin. Only the end-to-end evidence through the
  API uses an impossible row.
- **Required remediation**: optional (`late`, LOW). Seed `OLD` as case (7)
  does, with `("retired", None)` on all three factors.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 | RESOLVED | Case (2), `test_filters_change_the_match_count_identically_on_every_page` (lines 105-126): `HX` and `ZZZ` make each filter change the count, asserted equal on two pages. This review's probe run kills `435:manual:41` and `:42` with this test alone (`assert 6 == 5`, line 124). Case (7), `test_compare_reports_unknown_symbols_and_enforces_its_bounds` (lines 174-193): `OLD` is seeded `("retired", None)` on all three factors, matching `classify.sql:130-136`, and `status == not_classified` and `reason_code == retired` are asserted. Both tests pass against `postgres:16` |
| v2/IR-002 | RESOLVED | `INVALID` rows `set a number`, `not an object` and `no set` (error-mapping file lines 449-451). The gate run kills `76:manual:21`, `:22` and `:23`, each by its own row |
| v2/IR-003 | STILL OPEN | `classification_models.py:32` and `:358`, and lines 79-87 and 415-423, are unchanged. The coder did not address it, by choice (optional). Carried as v3 IR-001 (LOW) |

## Scope and Plan Deviations

- **Justified, still from v1 and v2 (DEC-0281):**
  - delegation to E1-S6's `from_reader`;
  - `compare_conflicts` reading query-string names;
  - the default Decimal NaN and infinity refusal;
  - no `response_model=None`.

  DEC-0281 is still `open`, decided by the agent and not yet reviewed by the
  owner. In the harness worktree it is an untracked file
  (`projects/factorflow-v2/decisions/DEC-0281.md`) that the run's records
  commit must carry.
- **Justified test support (as v2):**
  - `building_run` writes the `acquisition_run` row with raw SQL.
  - `_forge` reuses the reader's private `_cursor_check`.
  - Cycle-3 adds `active_instruments=8` to case (2)'s set, which keeps the
    set's count consistent with its eight seeded stocks.
- **Bookkeeping inconsistency:**
  - Carried from v2 and still present:
    `test_an_outdated_input_makes_a_stock_not_current_and_followed_is_the_set_count`
    (`test_api_classification_summary.py:50`) has a docstring that says
    "`outdated` and `missing` count against a stock", but the test seeds only
    `outdated`.
  - The cycle-2 spec-drift claim that v2 challenged is now true of cycle-3.
- **Process note:** the context refresh made before this review is described
  under Review Subject.
- **Out-of-scope changes:** none.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  - Run `$doc-sync` for CAP-002-E3-S5 against this report and the tasks file.
  - IR-001 and IR-002 are optional LOW improvements that may be taken up in
    any later change. Neither needs rework before doc sync.
- **Warnings accepted downstream**: IR-001, IR-002
