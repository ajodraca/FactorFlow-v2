---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S1-implementation-review
artifact_type: implementation-review
artifact_version: 6
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
story_id: "CAP-001-E3-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 6
reviewed_at: "2026-10-11T02:16:08Z"
reviewed_head: "c976dea72aafbe7af67624cd503bbb93e7076400"
review_base: "a181426c22355f2ae6ab12613bed5eb9e0867af8"
reviewed_state_revision: "sha256:c4c5e74a5a98f082baeca6eac13633984518e28e55f2558aafc3998397eaed2c"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E3-S1
    artifact_version: 1
    content_revision: sha256:0ecf0d721fa121cceb4fbc143d1d862fbea08084b99442398a8586ced8eda090
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: "2026-10-11T02:23:25Z"
  source_artifacts:
    - id: CAP-001-E3-S1
      version: "1"
    - id: CAP-001-E3-S1-tasks
      version: "1"
    - id: CAP-001-E3-S1-implementation-review
      version: "5"
    - id: CAP-001-component-design-massive-client
      version: "13"
    - id: DEC-0047
      version: "open (decided_by owner, 2026-10-11T02:00:27Z)"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S1 — Version 6

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 11/12 verified; 1 justified NOT APPLICABLE (T002) |
| Required validation | 8/8 passed (plus 2 supplementary test runs, also passed) |

This review covers the rework of v5, which returned CHANGES-REQUIRED with one HIGH and one MEDIUM finding. Both are resolved, and the evidence is in the repository:

- **v5 IR-001 (HIGH, ratios) is resolved.**
  - The owner decided on 2026-10-10 that CAP-001 does not acquire Massive ratios. massive-client v13 records the decision in §2.5, §7 ("Ratios are never requested"), §11 and §14 item 7. v13 was approved on specification review v10; `artifact-gate.py check` passes for it.
  - `fetch_financials` now issues exactly the three statement reads (`client.py:133-137`), and the ratios branch of `_financial_page` is gone (`:257-271`).
  - v5's probe P1, rerun on the real SDK request path, now returns the three statements. A provider-shaped `FinancialRatio` row was available on the ratios path, and no request was sent to `/stocks/financials/v1/ratios`.
  - Two new tests hold the §7 row, one on mocks and one on the real SDK path. Re-adding the ratios read (M-R1), requesting ratios without keeping the rows (M-R3) and restoring the pre-rework `client.py` (M-R2) each fail 7–8 tests.
- **v5 IR-002 (MEDIUM, empty paged results) is resolved by owner decision DEC-0047.**
  - Under DEC-0047, an empty successful paged read is valid no-data and returns `[]`. Only the reference read's empty result, and any 404, is `InstrumentNotFound`.
  - Each paged read now has a regression test. Raising on empty in any of the three reads, or in the pager, is killed (M-E1 to M-E4).
  - `decisions.py verify` confirms the record's two trailer commits.
- **One new LOW finding (IR-001).** The new empty-result tests pin only the `results: []` envelope. The vendor SDK also treats an envelope with no `results` key as empty, and that form is unpinned: changing the pager to index `envelope["results"]` survives the whole Massive unit suite (M-E5, M-E6). The implementation handles the form correctly today (probe P5).

Every required command passes. The full suite, PostgreSQL via testcontainers included, gives 929 passed and 0 skipped. That is 4 more than v5, which matches the rework's +5/−1 tests.

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md` (content revision `sha256:0ecf0d72…a090`, identical to v5's; the `status` change to `in-review` is outside the content revision) |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md` (`last_reworked_review: CAP-001-E3-S1-implementation-review-v5.md`) |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S1-ratios`, level with `origin/usr/alvaro-de-jodra/CAP-001-E3-S1-ratios` |
| HEAD | `c976dea72aafbe7af67624cd503bbb93e7076400` |
| Review base | `a181426c22355f2ae6ab12613bed5eb9e0867af8`, from `pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2`. It is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) and is v5's `reviewed_head` (see the note below). |
| Working tree | Clean before and after validation (`git status --porcelain --untracked-files=all` empty). No staged, unstaged or untracked files. |
| Changed files reviewed | 15 (`git diff --stat a181426..HEAD`): 7 code and test files, 3 story documents, 5 governing or review documents |
| Pipeline state (before) | `adversarial-review: READY — review changes were reworked; a new review version is required` |
| Harness inputs | DEC-0047 at `projects/factorflow-v2/decisions/DEC-0047.md`. It exists only in the ai-agents worktree `.claude/worktrees/cap-001-design-ratios-bc0e07` (branch `claude/cap-001-design-ratios-bc0e07`), staged and not yet committed. It was read in full, and `SDD_ROOT=<scratch> scripts/decisions.py verify -p factorflow-v2 DEC-0047` returned `ok (2 commit(s))`. The scratch root links that worktree's `projects/` to the main checkout's `repos/`. |

### Review-base note

`review-base` resolves to `a181426`, the merge-base of HEAD with `origin/main` (`fe65413`, whose tree equals `a181426`'s). `a181426` is also v5's `reviewed_head`. The delta `a181426..HEAD` is therefore exactly what changed since v5 reviewed the story's files. v5 recorded the story-wide base `bf3ac30`, because the story's original delivery had already landed on `main`.

Story files outside the delta are byte-identical to the state v5 reviewed. `paging.py` md5 is `0e89acc886523bd960a94386cc98fcad`, as in v5. `test_massive_reference.py`, `test_massive_client_interface.py`, `test_massive_auth.py`, `pyproject.toml` and `uv.lock` do not appear in the diff.

The branch has six commits on top of the base. Three are the rework under review:

- `75edce1`, `fix(CAP-001-E3-S1)`: the ratios read removed.
- `0669dd4`, `test(CAP-001-E3-S1)`: empty paged reads, trailer `Decision-Id: DEC-0047`.
- `c976dea`, `docs(CAP-001-E3-S1)`: evidence, task plan and story status, trailer `Decision-Id: DEC-0047`.

The other three are documents only and are the rework's governing inputs, not story implementation:

- `33e0562`: the E3-S1 and E3-S2 v5 reports.
- `2e3cc82`: massive-client v13, market-data-store v7, specification review v10.
- `7b6a82b`: the approval blocks for both designs.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/client.py` | modified (`75edce1`, `0669dd4`) | T009; v5 IR-001 remediation step 2. The ratios tuple entry and the ratios branch of `_financial_page` were removed, and the `fetch_financials` docstring cites v13. `0669dd4` changes docstrings only: each paged read states DEC-0047's empty-result semantics. md5 `4719f638bab63590cc5839f8789e5ca8`. |
| `tests/unit/test_massive_financials.py` | modified (`75edce1`, `0669dd4`) | T005; v5 IR-001 step 3; DEC-0047. The ratios-label test is replaced by `test_fetch_financials_never_requests_ratios` (`:265`) and `test_fetch_financials_sends_no_request_to_the_ratios_path` (`:316`). The TC-COMP-003 test (`:228`) and the request-kwargs test (`:334`, renamed from `…all_four…`) now cover three endpoints. The empty test is new (`:372`). |
| `tests/unit/test_massive_bars.py` | modified (`0669dd4`) | T004; DEC-0047. One test was added, `test_fetch_daily_bars_returns_no_bars_for_an_empty_range_rather_than_not_found` (`:283`). |
| `tests/unit/test_massive_actions.py` | modified (`0669dd4`) | T005; DEC-0047. One test was added, `test_fetch_corporate_actions_returns_no_actions_when_every_endpoint_is_empty` (`:366`). |
| `tests/unit/test_massive_client_governor_integration.py` | modified (`75edce1`) | T011. The financials governor-permit count goes from 4 to 3 and the test is renamed (`:106`). `list_financials_ratios` is dropped from the first-page-failure sibling list (`:188-195`). |
| `tests/unit/test_massive_sdk_config.py` | modified (`75edce1`) | T007. `list_financials_ratios` is dropped from TC-COMP-213's configured-mock list (`:128`). |
| `tests/e2e/support/massive_stub.py` | modified (`75edce1`) | Outside S1's planned paths, but massive-client v13 §14 item 7 names this file among the implementation consequences. The `/stocks/financials/v1/ratios` route was removed (1 line). Justified; see Scope and Plan Deviations. |
| `.../stories/CAP-001-E3-S1-tdd-evidence.yaml` | modified (`c976dea`) | T012. New `review_v5_rework` and `review_v5_rework_validation` blocks. |
| `.../stories/CAP-001-E3-S1-tasks.md` | modified (`c976dea`) | Rework bookkeeping: `last_reworked_review` and `updated`. |
| `.../stories/CAP-001-E3-S1.md` | modified (`c976dea`) | `status: docs-sync` → `in-review` |
| `.../stories/CAP-001-E3-S1-implementation-review-v5.md` | added (`33e0562`) | The prior review, the input to this rework |
| `.../stories/CAP-001-E3-S2-implementation-review-v5.md` | added (`33e0562`) | A sibling story's review. It is not S1 implementation and was not assessed here. |
| `.../design/component-design-massive-client.md` | modified (`2e3cc82`, `7b6a82b`) | The governing design, v13, approved 2026-10-10T23:06:40Z. v5 IR-001 remediation step 1. |
| `.../design/component-design-market-data-store.md` | modified (`2e3cc82`, `7b6a82b`) | v7: `'ratios'` stays an allowed but unused `statement_type`, with no migration. The code is consistent: no migration changed. |
| `.../specifications-review-report-v10.md` | added (`2e3cc82`) | The review evidence behind the v13 and v7 approvals |

No unjustified file.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | SATISFIED | `client.py:71-81` (reference), `:85-116` (bars), `:120-151` (fundamentals: the three statement endpoints, per v13 §2.5 and §14 item 7), `:155-238` (corporate actions) | `test_massive_reference.py:143`, `test_massive_bars.py:233`, `test_massive_financials.py:228`, `:265`, `:316`, `test_massive_actions.py:215` | v5's blocker is gone. In P1 (real SDK path), a covered instrument with ratio data available gets `['balance_sheet', 'income_statement', 'cash_flow_statement']`, and no ratios request is sent. v13 defines AC-3's "company fundamentals" as the three statements. |
| DAC-E3-1 | SATISFIED | `client.py:71`, `:85`, `:120`, `:155` | `test_massive_client_interface.py:37-75` (file unchanged) | Same signatures, one operation per data type |
| DAC-E3-10 | SATISFIED | `client.py:77-81`; `models.TickerReference` | `test_massive_reference.py:143` (TC-COMP-204) | Unchanged since v5; M10 fails 13 tests |
| DAC-E3-11 | SATISFIED | `client.py:77-81` | `test_massive_reference.py:212` (TC-COMP-205) | Unchanged since v5 |
| DAC-E3-14 | SATISFIED | `client.py:53-54`; four named methods and no generic `get` | `test_massive_client_interface.py` (TC-COMP-208) | File unchanged |
| DAC-E3-S1-1 | SATISFIED | `client.py:58-67`: `retries=0`, `pagination=False`, `trace=False`, both timeouts, `base=` | `test_massive_sdk_config.py:73-116` (TC-COMP-209); E3-S6's real-SDK checks | M2 fails 2 tests |
| DAC-E3-S1-2 | SATISFIED | `client.py:101-112` | `test_massive_bars.py:196` (TC-COMP-210) | M1 fails 1 test |
| DAC-E3-S1-3 | SATISFIED | `paging.py:58-68` (unchanged since v5); `client.py:273-280` | `test_massive_bars.py:233`, `:261`; `test_massive_client_governor_integration.py:84` | M5 fails 4 tests |
| DAC-E3-S1-4 | SATISFIED | `client.py:77` `get_ticker_details` | `test_massive_reference.py:192` (TC-COMP-212) | M10 killed |
| DAC-E3-S1-5 | SATISFIED | No call to `get_market_status` or `list_tickers` on any path | `test_massive_sdk_config.py:128` (TC-COMP-213) runs all four reads | M7 (spurious market-status call in `fetch_financials`) fails 2 tests |
| DAC-E3-S1-6 | SATISFIED | `client.py:59` passes the key to the SDK; `trace=False` at `:66` | `test_massive_auth.py:49`, `:86` (TC-COMP-013, 214); file unchanged | P1's recorded request paths carry no credential and no `apiKey` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml` `massive>=2`; `uv.lock` 2.8.0 | Unchanged since v5 |
| T002 | complete | NOT APPLICABLE | `ingestion/__init__.py`, `ingestion/massive/__init__.py` exist | As v3–v5 recorded: dependency stories supplied these files, not this diff |
| T003 | complete | VERIFIED | `test_massive_reference.py:143-229` | Unchanged since v5 |
| T004 | complete | VERIFIED | `test_massive_bars.py:196`, `:233`, `:283` | DEC-0047 empty-range test added. M-E2 kills it. |
| T005 | complete | VERIFIED | `test_massive_financials.py:228`, `:265`, `:316`, `:334`, `:372`; `test_massive_actions.py:215`, `:366` | v5 PARTIAL resolved. The financials read is now exercised with a provider-shaped `FinancialRatio` row available on the ratios endpoint, on both the mocked and the real SDK path. It returns the complete three-statement result. |
| T006 | complete | VERIFIED | `test_massive_client_interface.py` | Unchanged |
| T007 | complete | VERIFIED | `test_massive_sdk_config.py:73-128`; `test_massive_auth.py` | Mock list trimmed only; M7 and M2 killed |
| T008 | complete | VERIFIED | `test_massive_bars.py:261` | M5 kills it |
| T009 | complete | VERIFIED | `client.py:53-310` | v5 PARTIAL resolved. `fetch_financials` follows v13 §2.5 (three statement reads, each bounded by ticker and `period_end`). DEC-0047 documents the empty-result semantics, which the reads implement. |
| T010 | complete | VERIFIED | `paging.py:32-77` | Byte-identical to v5. It handles an absent `results` key (P5), although no test pins that form (IR-001). |
| T011 | complete | VERIFIED | `client.py:288-300`; `test_massive_client_governor_integration.py:67-196` | Three governed sends for financials (M-R1 makes it four, which is killed) |
| T012 | complete | VERIFIED | `CAP-001-E3-S1-tdd-evidence.yaml` `review_v5_rework` | The RED/GREEN for IR-001 is consistent with M-R2 here. The IR-002 tests are recorded as characterization tests with no RED, which is honest, since DEC-0047 keeps the existing behaviour. M-E1 (16 failed) and M-E2 (2 failed) reproduce exactly. M-R1 and M-R2 match too: the claimed 7 and 6 were counted on 168 tests at `75edce1`, and the 8 and 7 here on 171, with `0669dd4`'s empty-financials test adding one to each. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_fetch_financials_returns_a_complete_result_for_a_covered_symbol` / TC-COMP-003 (financials) | ADEQUATE | Parses one balance sheet across the three statement endpoints. If ratios is requested, the read fails on the unconfigured mock (M-R1, M-R2, M-R3 all kill it). | v5 WEAK resolved. A provider-shaped ratios row is now served by the two tests below. |
| `test_fetch_financials_never_requests_ratios` (design §7 "Ratios are never requested") | ADEQUATE | Autospecced `RESTClient`. The ratios mock returns a `FinancialRatio`-shaped row (`ticker`, `cik`, `date` and ratio values). Asserts `list_financials_ratios` is never called, each statement endpoint is called once, and the types returned are exactly the three statements in order. Kills M-R1, M-R2, M-R3, M-S1 and M-S2. | No TC-COMP ID yet: the component test specification has no case for the v13 §7 row (see Scope and Plan Deviations) |
| `test_fetch_financials_sends_no_request_to_the_ratios_path` (design §7) | ADEQUATE | Real SDK and urllib3 path through `massive_transport_fakes`, with sockets forbidden. Asserts no request goes to `/stocks/financials/v1/ratios` and exactly one goes to each statement path. Kills M-R1, M-R3, M-S1 and M7. | None |
| `test_fetch_financials_queries_the_three_statement_endpoints_for_the_symbol` | ADEQUATE | Autospecced and bound to the real SDK signature. Exact kwargs for each statement endpoint, and `list_financials_ratios.assert_not_called()`. Kills M-S3 (period bound). | Renamed. Integration automation T011 still names the old test (see Scope and Plan Deviations). |
| `test_fetch_financials_routes_each_of_the_three_statement_reads_through_the_governor` / T011 | ADEQUATE | `execute.call_count == 3` | None |
| `test_fetch_daily_bars_returns_no_bars_for_an_empty_range_rather_than_not_found` (DEC-0047) | ADEQUATE | `results: []` → `[]`. Kills M-E1 and M-E2. | Absent `results` key not pinned (IR-001) |
| `test_fetch_financials_returns_no_statements_when_every_endpoint_is_empty` (DEC-0047) | ADEQUATE | Autospecced. All three endpoints empty → `[]`. Kills M-E1 and M-E3. | Absent `results` key not pinned (IR-001) |
| `test_fetch_corporate_actions_returns_no_actions_when_every_endpoint_is_empty` (DEC-0047) | ADEQUATE | All four endpoints empty, ticker events as `{"events": []}` → `[]`. Kills M-E1 and M-E4. | Absent `results` key not pinned (IR-001) |
| `test_market_status_endpoint_is_never_called` / TC-COMP-213 | ADEQUATE | Runs all four reads. The ratios mock is left unconfigured, so a ratios request fails the test (M-R1 kills it). | None |
| Reference / TC-COMP-003, 204, 205, 212; bars / TC-COMP-003, 210, 211, T008; actions / TC-COMP-003; SDK construction / TC-COMP-209; credential / TC-COMP-013, 214; interface / TC-COMP-195, 208 | ADEQUATE | Unchanged since v5. Re-confirmed at HEAD by M1, M2, M5, M7, M8 and M10. | None |

The new tests are deterministic. They use no network: the real-SDK test installs `forbid_sockets`. The governor's sleep is a no-op, and nothing depends on the wall clock. Every mandatory TC-ID (003, 013, 195, 204, 205, 208–214) is still present in the seven story files (grep at HEAD).

## Independent Validation

Every command ran in `repos/factorflow-v2/FactorFlow-v2`, on branch `usr/alvaro-de-jodra/CAP-001-E3-S1-ratios` at `c976dea`. They ran outside the tool sandbox, because `uv` writes the ignored `.venv/` and Docker is needed for testcontainers (Docker 28.3.2). Python is 3.13.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' -p no:cacheprovider -q -rs tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py tests/unit/test_massive_client_interface.py tests/unit/test_massive_sdk_config.py tests/unit/test_massive_auth.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Story-specific command: 107 passed, no skips (v5: 103) |
| Same, plus `tests/unit/test_massive_client_governor_integration.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary, v5's eight files: 115 passed (v5: 111) |
| `uv run pytest -m 'not postgres' -p no:cacheprovider -q -rs tests/unit/test_massive_*.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary, the mutation baseline: 171 passed |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Resolved 46 packages", "Checked 43 packages" |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "184 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 47 source files" |
| `uv build --out-dir <scratchpad>/e3s1-v6/dist` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built outside the repository |
| `uv run pytest -m 'not postgres' -p no:cacheprovider -q -rs` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 658 passed, 271 deselected, 2 dependency deprecation warnings (starlette/anyio) |
| `uv run pytest -p no:cacheprovider -q -rs` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Full suite with PostgreSQL via testcontainers: 929 passed, 0 skipped, 266 s (v5: 925) |

Harness checks, run from the ai-agents main checkout, which has the same `scripts/` and `docs/` as the worktree:

| Check | Result |
|-------|--------|
| `scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | exit 0, all PASSED |
| `pipeline-state.py check … --story …/CAP-001-E3-S1.md --stage adversarial-review` | READY (reworked; a new review version is required) |
| `artifact-gate.py revision` (story) | `sha256:0ecf0d72…a090`, unchanged |
| `artifact-gate.py check` (story; massive-client design) | passed; passed |
| `decisions.py verify -p factorflow-v2 DEC-0047` (scratch `SDD_ROOT`) | `ok (2 commit(s))`: `0669dd4`, `c976dea` |

Reviewer probes and mutations ran against the repository's `.venv`, on a scratch export of HEAD (`git archive HEAD src tests pyproject.toml`). The export came first on `PYTHONPATH`, and `client.__file__` confirmed the scratch copy was the one imported. Each mutation was applied, run over `tests/unit/test_massive_*.py`, and reverted. The baseline was 171 passed before and after. No tracked file was edited.

| Probe | Target | Result |
|-------|--------|--------|
| P1 (v5's P1 on the real SDK path, through `RecordingMakeRequest`): each statement path returns one annual statement; the ratios path returns a `FinancialRatio`-shaped row | `fetch_financials` | Returns `['balance_sheet', 'income_statement', 'cash_flow_statement']`. Three requests: each carries `tickers=AAPL`, `period_end.gte=2023-01-01` and `period_end.lte=2023-12-31`. None goes to `/ratios`. (v5: `ProviderContractViolation`.) |
| P4 (v5's P4, real SDK path): every endpoint returns `results: []` (events `{"events": []}`) | three paged reads | Each returns `[]`, as DEC-0047 decides |
| P5: the aggregates envelope with no `results` key (`queryCount: 0`, `resultsCount: 0`) | `fetch_daily_bars` | Returns `[]`. The implementation is correct for this form. |
| P6: reference returns `results: {}` | `fetch_reference` | `InstrumentNotFound`. DEC-0047's other half holds. |
| P7: a paged read gets a 404 `NOT_FOUND` envelope | `fetch_daily_bars` | `InstrumentNotFound` |
| M-R1: `("ratios", list_financials_ratios)` re-added to the tuple | `client.py:133-137` | 8 failed (all 5 financials request/result tests, governor count, TC-COMP-213, E3-S6 base routing) |
| M-R2: `client.py` replaced by its `7b6a82b` (pre-rework) version | `client.py` | 7 failed |
| M-R3: ratios requested, rows discarded | `fetch_financials` | 7 failed |
| M-S1: cash-flow endpoint dropped | `client.py:136` | 4 failed |
| M-S2: income rows labelled `balance_sheet` | `client.py:135` | 1 failed (`test_fetch_financials_never_requests_ratios`) |
| M-S3: `period_end_lte` bound → `start` | `client.py:268` | 1 failed (`…queries_the_three_statement_endpoints…`) |
| M-E1: `follow_pages` raises `InstrumentNotFound` on empty rows | `paging.py:68` | 16 failed, including all three DEC-0047 tests |
| M-E2: `fetch_daily_bars` raises on empty | `client.py:116` | 2 failed |
| M-E3: `fetch_financials` raises on empty | `client.py:151` | 6 failed |
| M-E4: `fetch_corporate_actions` raises on empty | `client.py:238` | 5 failed |
| M-E5: the pager indexes the first page's `envelope["results"]` | `paging.py:59` | **171 passed: survives (IR-001)** |
| M-E6: the pager indexes `envelope["results"]` on later pages | `paging.py:65` | **171 passed: survives (IR-001)** |
| M1 `multiplier=2`; M2 `pagination=True`; M5 the pager never follows `next_url`; M7 spurious `get_market_status()`; M8 split `execution_date_gte=end`; M10 reference via `list_tickers` | `client.py`, `paging.py` | 1, 2, 4, 2, 1 and 13 failed respectively. v5's regression net holds at HEAD. |

### Validation Side Effects

- Before: clean tree at `c976dea`, `code-revision` `sha256:c4c5e74a5a98f082baeca6eac13633984518e28e55f2558aafc3998397eaed2c`. md5 values:
  - `client.py`: `4719f638bab63590cc5839f8789e5ca8`
  - `paging.py`: `0e89acc886523bd960a94386cc98fcad`
  - `test_massive_financials.py`: `e5b6ff032eaff5b00c90845e4fe6fdd0`
  - `test_massive_bars.py`: `aa71820d24b5d6f454009aca834c6170`
  - `test_massive_actions.py`: `68cb117e20ddf91dbc8076e17819c326`
- After: clean tree at `c976dea`. `git status --porcelain --untracked-files=all` is empty, all five md5 values are identical, and `code-revision` is unchanged.
- Ignored paths only:
  - `uv build` refreshed `build/bdist.macosx-15.0-arm64/`, and the validation runs refreshed `.venv/`, `src/factorflow.egg-info/`, `__pycache__/`, `.mypy_cache/` and `.ruff_cache/`.
  - `dist/` in the repository was not written; this build went to the scratchpad.
  - None of these paths enters the review set.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| IR-001 | LOW | OPEN | The empty-result regression tests do not pin an envelope with no `results` key |

### IR-001 — The empty-result regression tests do not pin an envelope with no `results` key

- **Severity**: LOW
- **Status**: OPEN (new)
- **Acceptance criteria**: N/A. AC-3 and DAC-E3-S1-3 are satisfied, and the behaviour is correct today (P5).
- **Tasks**: T010 (pager), T004/T005 (DEC-0047 tests)
- **Files**:
  - `src/factorflow/ingestion/massive/paging.py:59`, `:65` (`envelope.get("results") or []`)
  - `tests/unit/test_massive_bars.py:283`, `tests/unit/test_massive_financials.py:372`, `tests/unit/test_massive_actions.py:366`
  - `.venv/…/massive/rest/base.py` (`_get`: `if result_key not in obj: return []`)
- **Claim challenged**: DEC-0047 says "Each paged read pins this with a regression test". The TDD evidence says the IR-002 tests' strength is shown by mutation.
- **Observed evidence**:
  - All three new tests, and every other paged-read test in the Massive unit suite, serve a `results` key. The new tests serve `results: []`.
  - The locked SDK's own `_get` returns an empty result when the result key is absent. So the no-`results` form of an empty response is one the vendor client is written to expect.
  - Two mutations survive all 171 Massive unit tests: changing the pager to `list(envelope["results"])` (M-E5) or `rows.extend(envelope["results"])` (M-E6).
  - Under either mutation, an empty range sent in that form would raise a bare `KeyError`. That error is outside the typed taxonomy, and the runner's per-data-type `except (InstrumentNotFound, ProviderUnavailable, MassiveError)` (`runner.py:233`, `:253`, `:273`, `:295`) does not catch it.
- **Expected evidence/behavior**: The skill's test-quality rule (constraint 8; step E.3) says a plausible regression of the pinned behaviour should make a test fail. DEC-0047's regression intent is that an empty successful paged read returns `[]`.
- **Impact**: None today. The implementation handles the form (P5). The risk is that a future refactor silently drops the handling, and a recognised instrument's empty range then aborts its acquisition with an untyped error.
- **Required remediation**: In a later change, add one case (for example to the bars empty-range test) in which the provider envelope has no `results` key, and assert `[]`. Production code does not change. This does not block.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v5/IR-001 — fundamentals are not returned for a covered instrument whose ratios read returns a row | RESOLVED | The remediation steps are met in order. **Step 1:** the owner decision is recorded in massive-client v13 §2.5, §7, §11 and §14 item 7, approved on specification review v10 (`artifact-gate.py check` passed). **Step 2:** `fetch_financials` issues only the three statement reads, and the ratios branch is removed (`client.py:133-137`, `:257-271`). P1 on the real SDK path returns the three statements with no ratios request, where v5 raised `ProviderContractViolation`. v5's P3 (ratios ignore the range) no longer applies, because no ratios request is made. **Step 3:** the statement-shaped and empty ratios fixtures are replaced by `_financial_ratio_row()`, in the SDK's `FinancialRatio` shape, served by `test_massive_financials.py:265` and `:316`. Restoring the pre-rework code (M-R2) fails 7 tests. |
| v5/IR-002 — empty successful paged responses are not classified as not found | RESOLVED (by owner decision DEC-0047) | v5's remediation allowed "an owner decision that an empty range is a valid no-data outcome for the paged reads". DEC-0047 (`decided_by: owner`, `class: propagating`, `kind: product`) is that decision. It sits with design §8 criterion 4 and the §7 reference-data row. Per-read regression tests were added (`test_massive_bars.py:283`, `test_massive_financials.py:372`, `test_massive_actions.py:366`), and M-E1 to M-E4 kill them. Each paged read's docstring states the semantics (`client.py:86-90`, `:128-130`, `:163-164`). Residuals, none of them an S1 defect: (a) design §2.2's sequence diagram still maps "200 with an empty result set" to `InstrumentNotFound`, which DEC-0047 records as a follow-up for the next massive-client revision; (b) DEC-0047 is not yet committed (Scope and Plan Deviations); (c) one form is unpinned (IR-001 above). |

## Scope and Plan Deviations

- **Non-rework commits on the branch.** `33e0562`, `2e3cc82` and `7b6a82b` contain only documents: v5's reports, the v13 and v7 designs, specification review v10 and their approvals. They are the rework's inputs. They were read as sources of truth and not assessed as S1 implementation.
- **E2E stub edited outside the planned paths.**
  - `tests/e2e/support/massive_stub.py` lost its ratios route. Design v13 §14 item 7 names this file, so the edit is justified.
  - The stub's fallthrough answers a ratios request with 404 `NOT_FOUND` (`massive_stub.py:198`). A regression that requests ratios would therefore surface as fundamentals `not_found` in the E2E flow.
  - The Playwright E2E suite was not run. It is not in the task plan's Validation Plan.
  - `e2e-tests-automation-tasks.md` T001 still lists `ratios` among the stub's paths. That is stale text for the next automation-planning pass.
- **Renamed test referenced elsewhere.** `test_fetch_financials_queries_all_four_statement_endpoints_for_the_symbol` is now `…the_three_statement_endpoints…`, which v13 requires. `integration-tests-automation-tasks.md` still names the old test in T011 (held, unchecked) and in its TC-INT-023 row. That is for the automation planner.
- **Ratios references outside this story's ownership.** Design v13 §14 item 7 lists these as implementation consequences. v5 IR-001 scoped them out of this story ("Changes to the E3-S2 model … are outside this story unless re-planned"), so they are not findings here:
  - The `FinancialStatement` docstring in `src/factorflow/ingestion/massive/models.py` (lines 209-211 and 221) still describes four sibling endpoints, ratios included.
  - `tests/fixtures/massive/financial_quarterly.json` carries `statement_type: "ratios"` for E3-S2's TC-COMP-217 test.
  - The `"ratios"` literal at `models.py:260` is correct as it is: the DDL and market-data-store v7 still allow the value.
  - Owner: E3-S2, or doc sync for the docstring.
- **README.** `README.md:451` says "Financial statements are read from the four statement endpoints". It is now three, and DEC-0047's empty-result semantics are not described. Both are for `$doc-sync`.
- **DEC-0047 durability.**
  - The record is staged but not committed, and it exists only in the ai-agents worktree `claude/cap-001-design-ratios-bc0e07`. Its status is `status: open` and `owner_reviewed: false`.
  - The source docstrings and three test docstrings cite it. Their citation resolves only once the record is committed. Per `docs/decision-records.md`, records are git-tracked files in the harness.
  - Its derivation says the runner "records that data type as failed". The runner actually records the outcome `not_found` (`outcomes.py:141-146`). That outcome still marks the instrument as not fully acquired under AC-9, so the conclusion stands.
- **Component test specification.** The v13 §7 row "Ratios are never requested" has no TC-COMP case in `tests/component/all-component-tests.md`. The tests cite the design row directly. This is for `$test-design` at its next pass.
- **TDD evidence.** The IR-002 tests are characterization tests with no RED. The evidence says so honestly, and the mutations substitute for the missing RED. The coding agent ran its mutations in the working tree and restored each file with a `cmp` check. The tree was clean at freeze.
- **Bookkeeping.** The story is `status: in-review` and the task file `status: draft`, with every task checked. `docs_synced_review` still names v4.
- **Sibling gates.** After the rework, `pipeline-state.py check --stage adversarial-review` reports RESUME for two sibling stories, because the rework touched files their latest passing reviews cover. This review covers all of those files at `c976dea`.
  - CAP-001-E3-S2: `test_massive_actions.py`, `test_massive_bars.py`, `test_massive_financials.py`.
  - CAP-001-E3-S6: `client.py`, `test_massive_sdk_config.py`.
  - With this report in place, both checks return COMPLETE: "passing reviews of CAP-001-E3-S1 cover every change" for E3-S2, and "CAP-001-E3-S1, CAP-001-E3-S7" for E3-S6. The same check for this story reports `adversarial-review: COMPLETE` and `doc-sync: READY`.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**:
  1. Run `$doc-sync` for CAP-001-E3-S1 against this report:
     - correct `README.md:451` to three statement endpoints;
     - state that ratios are not acquired;
     - state DEC-0047's empty-result semantics;
     - set `docs_synced_review: CAP-001-E3-S1-implementation-review-v6.md`.
  2. Before this branch merges, commit `projects/factorflow-v2/decisions/DEC-0047.md` in the ai-agents harness, so that the trailers and source citations resolve.
  3. Owner follow-ups outside this story:
     - align massive-client §2.2's sequence diagram with DEC-0047 at the next design revision;
     - update the `FinancialStatement` docstring and fixture (E3-S2);
     - update the automation task plans' test name and stub path list;
     - add a component test case for the §7 ratios row.
  4. IR-001 can be addressed in any later change touching these tests.
- **Warnings accepted downstream**: IR-001
