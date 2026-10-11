---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S1-implementation-review
artifact_type: implementation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
story_id: "CAP-001-E3-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 5
reviewed_at: "2026-10-10T20:50:13Z"
reviewed_head: "a181426c22355f2ae6ab12613bed5eb9e0867af8"
review_base: "bf3ac30b7ac3a2475a68f06abf106e08ea0b830f"
reviewed_state_revision: "sha256:b1456c109e25cf6f8818ec46ffd0eaa9a1ae53d6c06d1350f76c9420eb72dfb5"
verdict: CHANGES-REQUIRED
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
  timestamp: "2026-10-10T20:59:04Z"
  source_artifacts:
    - id: CAP-001-E3-S1
      version: "1"
    - id: CAP-001-E3-S1-tasks
      version: "1"
    - id: CAP-001-E3-S1-implementation-review
      version: "4"
    - id: CAP-001-component-design-massive-client
      version: "12"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S1 — Version 5

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 10/11 satisfied (AC-3 PARTIAL) |
| Planned tasks | 9/12 verified; 2 PARTIAL (T005, T009); 1 justified NOT APPLICABLE (T002) |
| Required validation | 8/8 passed (plus 1 supplementary story command, also passed) |

This is a shared-file re-review on `main`, not a rework cycle. v4 passed at `7795735` and doc sync confirmed it (`docs_synced_review: CAP-001-E3-S1-implementation-review-v4.md`). The derived state then reopened the gate:

```
adversarial-review: RESUME — component repository changed after the latest passing review,
in files no other passing review covers: tests/unit/test_massive_actions.py,
tests/unit/test_massive_bars.py, tests/unit/test_massive_client_governor_integration.py,
tests/unit/test_massive_financials.py, tests/unit/test_massive_reference.py
```

**The trigger itself is benign.** Every post-v4 change to those five files is attributed below. They are E3-S2 model tests (`5e7f04c`), integration-automation `# Implements TC-INT-0xx` annotations and corporate-actions request assertions (`26cfe3c`), the EXP-20261009-1 autospec rewrite of the financials request test (`16fe009`, `f7baf77`), and one S1-labelled fix (`93ec4ca`). None weakens an S1 assertion. Fresh mutations M1–M11 are all killed at HEAD. Every required command passes: 925 tests, no skips.

**The verdict changes because AC-3 does not hold for fundamentals.** v4 rated it SATISFIED. The evidence since v4 says otherwise:
- `fetch_financials` validates every ratios row as a `FinancialStatement`. Massive's ratios endpoint returns `FinancialRatio` rows (massive 2.8.0, the locked SDK). These lack all five required statement fields.
- A provider-shaped ratios row therefore makes `fetch_financials` raise `ProviderContractViolation`, and the three statements fetched with it are discarded (probe P1).
- The ratios read also ignores the requested range (P3).
- The S1 tests cannot see this. They serve ratios as empty or as statement-shaped rows.

At v4's own reviewed head the ratios path was already broken for every instrument, in two ways that v4's mocks accepted. The SDK rejects the call's `tickers=` argument, and the model rejects its `"ratio"` label. Both are now fixed (`f7baf77`, `93ec4ca`). What remains is IR-001.

The component design records the root cause as an owner-open question that "Blocks: the ratios read and AC-3's fundamentals for ratios" (massive-client v12 §14 item 7; specification review v9 FINDING-2, HIGH, owner-open). The rework therefore starts with an owner decision, not with code.

v4/IR-001 (empty paged responses not classified as not found) is unchanged and is carried forward as IR-002.

**Verdict:** CHANGES-REQUIRED — CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1.md` (content revision `sha256:0ecf0d72…a090`, identical to v4's) |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S1-tasks.md` |
| Component | `FactorFlow-v2` (also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S1-S2-rereview`, created by the owner for this re-review. It has no commits of its own, and its tree equals `origin/main` (`fe65413`, tree `4aa7ad26`). |
| HEAD | `a181426c22355f2ae6ab12613bed5eb9e0867af8`, the PR #101 head. `origin/main`'s merge `fe65413` has it as second parent and has the same tree. |
| Review base | `bf3ac30b7ac3a2475a68f06abf106e08ea0b830f`, the base the landed story commits were built on (see the note below). It is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0). |
| Working tree | Clean before and after validation (`git status --porcelain --untracked-files=all` empty). No staged, unstaged or untracked files. The sibling E3-S2 v5 report had not appeared at freeze or before this report was written. |
| Changed files reviewed | 12 story-delivered implementation files: all non-`docs/` paths in `bf3ac30..146b78c`. Every later commit touching them is attributed below. |
| Pipeline state (before) | `adversarial-review: RESUME`, trigger as quoted above |

### Review-base note

`pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2` resolves to HEAD itself (`a181426`), because the story has been on `main` since PR #47/#48. That base gives an empty diff. The CAP-001-E1-S6 v6 precedent handled the same situation in three steps:
- keep the story's original base;
- scope the review to the story-delivered files as they are at HEAD;
- attribute every later commit that touched them.

That approach is sound here, with one correction to the base.

v1–v4 recorded `5c21451` as their base. That was the merge-base of the **pre-rebase** branch. The branch was rebased onto `bf3ac30` before PR #47 merged. As a result:
- v4's reviewed head `7795735` is not an ancestor of HEAD (`--is-ancestor` exit 1).
- Its landed equivalent is `1791d3d`.

On the 12 story files, `7795735` and `1791d3d` differ only in `test_massive_bars.py` (+59/−9 lines) and `test_massive_financials.py` (+43). Those are exactly the line counts of `e78af9f`, the CAP-001-E3-S2 rework that lies in `5c21451..bf3ac30`.

Keeping `5c21451` would therefore attribute E3-S2's rework to this story. `bf3ac30` is the parent of the first landed S1 commit (`0f47030`), and it equals `git merge-base 3742eb1 bf3ac30`. The story's own diff, `bf3ac30..146b78c`, has the same 12 files and the same 1651 insertions as v4's `5c21451..7795735`.

So `review_base` is `bf3ac30`, and changes are attributed from the story's landed head `146b78c`. The docs commits `5fd7011`, `3742eb1` and `146b78c` touch none of the 12 files.

### Changed Files

Commits are listed for `146b78c..HEAD`, non-merge, per file.

| File | State since v4 | Story/Task Justification |
|------|----------------|--------------------------|
| `src/factorflow/ingestion/massive/client.py` | modified, three changes. (1) `93ec4ca` (PR #57, `fix(CAP-001-E3-S1)`): ratios label `"ratio"` → `"ratios"`. (2) `f7baf77` (EXP-20261009-1): ratios called as `ticker=symbol, raw=True`, plus a docstring fix. Its `base=` addition was reverted by `16cad2a`. (3) `0eb02b9` (CAP-001-E3-S6): `base=settings.base_url` plus a docstring line. md5 `3055b8e9…2cc0`. | T009, T011. Change (1) is an S1 defect fix with no review until this one. Change (2) is covered by EXP-20261009-1 review v2 (PASS-WITH-WARNINGS). Change (3) is covered by CAP-001-E3-S6 review v1 (PASS-WITH-WARNINGS at `0eb02b9`; file unchanged since). |
| `src/factorflow/ingestion/massive/paging.py` | unchanged since v4 (md5 `0e89acc8…fcad`) | T010 |
| `tests/unit/test_massive_reference.py` | modified by `26cfe3c`: three comment lines, `# Implements TC-INT-021` (×2) and `TC-INT-025` | T003. Annotations justified by `integration-tests-automation-tasks.md` T009. No assertion changed. |
| `tests/unit/test_massive_bars.py` | modified by `5e7f04c` (E3-S2: self-verifying TZ pin and September 2003 millis-bound test, both `DailyBar` model tests) and `26cfe3c` (two `# Implements TC-INT-022`) | T004, T008 for the S1 functions, which are unchanged apart from the annotations. The model tests belong to E3-S2 (its v4 review is at `5e7f04c`). The annotations belong to automation T010. |
| `tests/unit/test_massive_financials.py` | modified by `93ec4ca` (new `test_fetch_financials_labels_ratios_rows_with_the_ddl_statement_type`), `5e7f04c` (E3-S2: parametrized statement types), and `16fe009`/`f7baf77` (EXP-20261009-1: `test_fetch_financials_queries_all_four_statement_endpoints_for_the_symbol` autospecs `RESTClient` and binds each call to the real SDK signature) | T005. The `93ec4ca` test is S1 scope and is reviewed here (see IR-001). The EXP rewrite is covered by EXP-20261009-1 review v2, and it strengthens the request assertions. |
| `tests/unit/test_massive_actions.py` | modified by `5e7f04c` (E3-S2: each known action type accepted; ticker-change payload keys) and `26cfe3c` (`# Implements TC-INT-024`, plus `assert_called_once_with` request assertions on splits, dividends, IPOs and ticker events) | T005. The request assertions are justified by automation T012 and T020, and they strengthen S1's TC-COMP-003 actions test (M8 is now killed). |
| `tests/unit/test_massive_client_interface.py` | unchanged since v4 | T006 |
| `tests/unit/test_massive_sdk_config.py` | modified by `0eb02b9` (+138: E3-S6 tests TC-COMP-354/356/357 using `tests/unit/massive_transport_fakes.py`). The `16fe009` additions were reverted by `16cad2a` (net 0). | T007 for the S1 functions, which are unchanged. The E3-S6 tests are covered by E3-S6 review v1. |
| `tests/unit/test_massive_auth.py` | unchanged since v4 | T007 |
| `tests/unit/test_massive_client_governor_integration.py` | modified by `26cfe3c`: one `# Implements TC-INT-025` comment between the `parametrize` decorator and the `def` | T011. Annotation justified by automation T013. |
| `pyproject.toml` | modified by `129e972` (E4-S4: `hypothesis` dev dependency), `9d1e819` (E4-S7: `slow` marker) and `4d7473d` (E6-S1: `package-data`) | T001. S1's `massive>=2` dependency and the mypy override for `massive.*` are unchanged. |
| `uv.lock` | modified by `129e972` (`hypothesis`, `sortedcontainers`). `massive` is still locked at 2.8.0 (`uv.lock:561-562`). | T001 |

No unjustified file. Two dependencies of S1 also changed after v4, both owned by other stories: `models.py` (`5e7f04c`, a comment-only edit) and `config/settings.py` (`0eb02b9`, base-URL validation). Story docs changed only through `61e658a`, which added `docs_synced_review` to the task file.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-3 | PARTIAL | `client.py:71-81`, `:85-112` and `:149-231` deliver reference data, bars and corporate actions. `:116-145` with `:250-268` delivers fundamentals only when the ratios response is empty. | `test_massive_reference.py:143`, `test_massive_bars.py:233`, `test_massive_actions.py:215`, `test_massive_financials.py:221` | IR-001. A covered instrument with ratio data gets no fundamentals: P1 raises `ProviderContractViolation`. Ratios ignore the range (P3). The financials test serves ratios as empty. |
| DAC-E3-1 | SATISFIED | `client.py:71`, `:85`, `:116`, `:149` | `test_massive_client_interface.py:37-75` | Interface unchanged since v4; the file is identical. Ratios' range handling is under AC-3. |
| DAC-E3-10 | SATISFIED | `client.py:77-81`; `models.TickerReference` | `test_massive_reference.py:143` (TC-COMP-204) | M10 (list form) fails 10 tests, including this one. |
| DAC-E3-11 | SATISFIED | `client.py:77-81` | `test_massive_reference.py:212` (TC-COMP-205) | Unchanged. |
| DAC-E3-14 | SATISFIED | `client.py:53-54`; four named methods, no generic `get` | `test_massive_client_interface.py:75` onward (TC-COMP-208) | File identical to v4. |
| DAC-E3-S1-1 | SATISFIED | `client.py:58-67`: `retries=0`, `pagination=False`, `trace=False`, both timeouts, plus E3-S6's mandatory `base=` | `test_massive_sdk_config.py:73-116` (TC-COMP-209); E3-S6's real-SDK test `:230` | M2, M3, M6 and M11 each fail 2–3 tests. |
| DAC-E3-S1-2 | SATISFIED | `client.py:97-108` | `test_massive_bars.py:196` (TC-COMP-210) | M1 killed. |
| DAC-E3-S1-3 | SATISFIED | `paging.py:58-68` (unchanged); `client.py:270-277` | `test_massive_bars.py:233`, `:261`; `test_massive_client_governor_integration.py:84` | M5 fails 4 tests. |
| DAC-E3-S1-4 | SATISFIED | `client.py:77` `get_ticker_details` | `test_massive_reference.py:192` (TC-COMP-212) | M10 killed. |
| DAC-E3-S1-5 | SATISFIED | No call to `get_market_status` or `list_tickers` on any path | `test_massive_sdk_config.py:128` (TC-COMP-213), which runs all four reads | M7 killed. |
| DAC-E3-S1-6 | SATISFIED | `client.py:59` passes the key to the SDK; `trace=False` at `:66` | `test_massive_auth.py:49`, `:86` (TC-COMP-013, 214) | `test_massive_auth.py` is identical to v4. Real-SDK header path. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml:16` `massive>=2`; `uv.lock:561-562` 2.8.0 | Later edits are other stories' additions. |
| T002 | complete | NOT APPLICABLE | `ingestion/__init__.py`, `ingestion/massive/__init__.py` exist | As v3 and v4 recorded: supplied by dependency stories, not this diff. |
| T003 | complete | VERIFIED | `test_massive_reference.py:143-229` | Annotations only since v4. |
| T004 | complete | VERIFIED | `test_massive_bars.py:196`, `:216`, `:233` | S1 functions unchanged. |
| T005 | complete | PARTIAL | `test_massive_financials.py:221`, `:243`, `:265`; `test_massive_actions.py:215` | The financials read's "complete result for a covered symbol" is never exercised with a provider-shaped ratios response. `:221` and `:265` serve ratios as empty, and `:243` serves a statement-shaped `financial_quarterly.json` (IR-001). The actions half is strengthened by `26cfe3c`. |
| T006 | complete | VERIFIED | `test_massive_client_interface.py` | Identical to v4. |
| T007 | complete | VERIFIED | `test_massive_sdk_config.py:73-128`; `test_massive_auth.py` | S1 functions unchanged. The E3-S6 tests sit in the same file. |
| T008 | complete | VERIFIED | `test_massive_bars.py:261` | M5 kills it ("DID NOT RAISE"). |
| T009 | complete | PARTIAL | `client.py:53-307` | Reference, bars and actions are verified. `fetch_financials` cannot return fundamentals for an instrument with ratio rows, and it returns ratios outside the range (IR-001). The empty-result semantics are IR-002. |
| T010 | complete | VERIFIED | `paging.py:32-77` | Identical to v4. |
| T011 | complete | VERIFIED | `client.py:285-297`; `test_massive_client_governor_integration.py:67-172` | One governed send per request (P1: 4 sends for 4 financial endpoints). |
| T012 | complete | VERIFIED | `CAP-001-E3-S1-tdd-evidence.yaml` mutations 1–11 | Re-confirmed at HEAD by M1–M11. The `93ec4ca` fix has no TDD-evidence entry (see Scope and Plan Deviations). |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_fetch_reference_returns_product_shaped_reference` / TC-COMP-003 (reference), 204 | ADEQUATE | Parsed `TickerReference` with CIK and both FIGIs | None |
| `test_fetch_daily_bars_returns_all_rows_from_a_two_page_response_in_order` / TC-COMP-003 (bars), 211 | ADEQUATE | Two pages, ordered rows; M5 kills it | None |
| `test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol` / TC-COMP-003 (actions) | ADEQUATE | All four action types, now with exact request arguments (`26cfe3c`). M8 (split lower bound → `end`) kills it. | None |
| `test_fetch_financials_returns_a_complete_result_for_a_covered_symbol` / TC-COMP-003 (financials) | WEAK | Proves one balance sheet parses while ratios is empty. | IR-001: no provider-shaped ratios row is ever served, so the test passes while P1 shows the real path fails. TC-COMP-003's expected result ("company fundamentals … for each named instrument the provider covers") is untested for any instrument with ratio data. |
| `test_fetch_financials_labels_ratios_rows_with_the_ddl_statement_type` (`93ec4ca`, no TC-ID) | ADEQUATE for its stated purpose | Pins the `ratios` label (M4 kills it) | Its ratios fixture is statement-shaped, which the provider never sends (EXP-20261009-1 review v2 ER-002). Part of IR-001's remediation. |
| `test_fetch_financials_queries_all_four_statement_endpoints_for_the_symbol` | ADEQUATE | Autospecced, signature-bound kwargs for all four endpoints; M9 kills it | Request side only. |
| Reference endpoint / TC-COMP-212; bars parameters / TC-COMP-210; later-page failure (T008) | ADEQUATE | Killed by M10, M1 and M5 | None |
| SDK construction / TC-COMP-209 | ADEQUATE | Explicit kwargs, plus E3-S6's real-SDK check of both pools | None |
| Forbidden endpoints / TC-COMP-213 | ADEQUATE | Runs all four reads, then asserts neither forbidden endpoint was called; M7 kills it | None |
| Credential / TC-COMP-013, 214 | ADEQUATE | Real SDK header path; no URL or query key | None (file identical to v4) |
| Interface / TC-COMP-195, 208 | ADEQUATE | Exact operation set and signatures | None (file identical to v4) |
| Governor routing / T011 | ADEQUATE | Per-request permit counts; typed first-page failures | None |

The suites are deterministic: no network, a no-op governor sleep, and `TZ` pinned through `monkeypatch`. Mandatory TC-IDs 003, 013, 195, 204, 205 and 208–214 are all still present.

## Independent Validation

Working directory for every command: `repos/factorflow-v2/FactorFlow-v2`, on branch `usr/alvaro-de-jodra/CAP-001-E3-S1-S2-rereview` at `a181426`. The commands ran outside the tool sandbox, because `uv` writes the ignored `.venv/`. Docker 28.3.2 was available.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' -p no:cacheprovider -q tests/unit/test_massive_reference.py tests/unit/test_massive_bars.py tests/unit/test_massive_financials.py tests/unit/test_massive_actions.py tests/unit/test_massive_client_interface.py tests/unit/test_massive_sdk_config.py tests/unit/test_massive_auth.py tests/unit/test_massive_client_governor_integration.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Supplementary narrowest run (v3/v4's eight files): 111 passed (v4: 90) |
| `uv run pytest -m 'not postgres' -p no:cacheprovider -q -rs` over the task plan's seven story files | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Story-specific command: 103 passed, no skips |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 46 packages; checked 43 |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "184 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 47 source files" |
| `uv build --out-dir <scratchpad>/e3s1-v5/dist` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel built, written outside the repository |
| `uv run pytest -m 'not postgres' -p no:cacheprovider -q -rs` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 654 passed, 271 deselected, 2 dependency deprecation warnings (starlette/anyio) |
| `uv run pytest -p no:cacheprovider -q -rs` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Full suite including PostgreSQL via testcontainers: 925 passed, 0 skipped, 219 s |

Reviewer probes ran against the repository's own `.venv`. Mutations were applied only to a scratch export of HEAD (`git archive HEAD src tests pyproject.toml`), loaded first on `PYTHONPATH`; `client.__file__` confirmed the scratch copy was imported. No tracked file was edited.

| Probe | Target | Result |
|-------|--------|--------|
| P1: autospecced `RESTClient`; balance sheets return one `financial_annual.json` row; ratios return one row with exactly `FinancialRatio`'s 23 fields (`ticker`, `cik`, `date`, ratio values) | `fetch_financials` at HEAD | `ProviderContractViolation: … FinancialStatement failed model validation (5 field(s))`. The fields are `filing_date`, `fiscal_year`, `period_end`, `tickers` and `timeframe`. The balance sheet is not returned. 4 governed sends; ratios kwargs `{'ticker': 'AAPL', 'raw': True}`. |
| P2: as P1, ratios empty | `fetch_financials` | Returns `['balance_sheet']` |
| P3: ratios returns a statement-shaped row with `period_end` 2010-03-31; range 2023-01-01..2023-12-31 | `fetch_financials` | Returns `[('ratios', '2010-03-31')]`: no range filter on ratios |
| P4: every endpoint returns `results: []` | `fetch_daily_bars`, `fetch_financials`, `fetch_corporate_actions` | Each returns `[]`, with no `InstrumentNotFound` (IR-002) |
| Baseline (scratch, no mutation) | eight S1 files | 111 passed |
| M1 `multiplier=1` → `2` | `client.py:101` | 1 failed (`test_fetch_daily_bars_requests_multiplier_1_day_timespan_and_inclusive_dates`) |
| M2 `pagination=False` → `True` | `client.py:65` | 2 failed (`…pagination_disabled`, `…retries_pagination_and_trace_are_off_on_both_clients`) |
| M3 `retries=0` → `3` | `client.py:62` | 2 failed |
| M4 ratios label `"ratios"` → `"ratio"` (the pre-`93ec4ca` code) | `client.py:130` | 1 failed (`test_fetch_financials_labels_ratios_rows_with_the_ddl_statement_type`) |
| M5 pager never follows `next_url` | `paging.py:60,66` | 4 failed (two-page, later-page failure, governor next-page, E3-S6 base routing) |
| M6 `trace=False` → `True` | `client.py:66` | 2 failed |
| M7 spurious `get_market_status()` in `fetch_financials` | `client.py:124` | 1 failed (`test_market_status_endpoint_is_never_called`) |
| M8 split `execution_date_gte=start` → `end` | `client.py:168` | 1 failed (`test_fetch_corporate_actions_returns_a_complete_result_for_a_covered_symbol`); this mutation would have survived at v4 |
| M9 ratios call back to `tickers=…, period_end_gte=…` (the pre-`f7baf77` code) | `client.py:260` | 2 failed (`…queries_all_four_statement_endpoints…`, E3-S6 base routing) |
| M10 reference via `list_tickers` | `client.py:77` | 10 failed |
| M11 `base=` dropped | `client.py:61` | 3 failed (E3-S6 tests) |
| M12 extra `limit=50000` on `get_aggs` | `client.py:103` | 111 passed. Survives; no requirement constrains `limit`. Informational only. |

### Validation Side Effects

- Before: clean tree at `a181426`. `code-revision` was `sha256:b1456c10…eb5`. md5 values: `client.py` `3055b8e90b8e6a7a898b80dfcf0c2cc0`, `paging.py` `0e89acc886523bd960a94386cc98fcad`, `test_massive_financials.py` `80ccf3f5fe972d6a1d4dd681b614af74`, `test_massive_bars.py` `367553882ba059f3929270f468412ecd`.
- After: clean tree at `a181426`. `git status --porcelain --untracked-files=all` is empty, and all four md5 values are identical. `code-revision` is unchanged (`sha256:b1456c109e25cf6f8818ec46ffd0eaa9a1ae53d6c06d1350f76c9420eb72dfb5`).
- Ignored artifacts were refreshed: `.venv/`, `src/factorflow.egg-info/`, `__pycache__/`, `.mypy_cache/` and `.ruff_cache/`. `dist/` was also refreshed at 20:54Z, probably by the concurrent E3-S2 re-review, since this review's build wrote to the scratchpad. None enters the review set.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| IR-001 | HIGH | OPEN | Fundamentals are not returned for a covered instrument whose ratios read returns a row |
| IR-002 | MEDIUM | OPEN | Empty successful paged responses are not classified as not found |

### IR-001 — Fundamentals are not returned for a covered instrument whose ratios read returns a row

- **Severity**: HIGH
- **Status**: OPEN. New in this story's review series. The same root cause is recorded upstream as specification review v6–v9 FINDING-2 (HIGH, owner-open), EXP-20261009-1 review v1 ER-003 and review v2 ER-002, and massive-client v12 §14 item 7.
- **Acceptance criteria**: AC-3 (PARTIAL), with TC-COMP-003's financials half
- **Tasks**: T009 (PARTIAL), T005 (PARTIAL)
- **Files**:
  - `src/factorflow/ingestion/massive/client.py:116-145` (`fetch_financials`) and `:250-268` (`_financial_page`)
  - `tests/unit/test_massive_financials.py:221`, `:243`, `:265`
  - `.venv/…/massive/rest/models/financials.py:812-863` (`FinancialRatio`) and `massive/rest/financials.py:191-247` (`list_financials_ratios`, massive 2.8.0)
- **Claim challenged**: v1–v4 rated AC-3 SATISFIED: "Four parsed historical reads", on four client success tests.
- **Observed evidence**:
  - `fetch_financials` validates every row from all four endpoints, ratios included, as `models.FinancialStatement`, labelled `"ratios"` (`client.py:126-143`).
  - massive 2.8.0 (locked, `uv.lock:561-562`) deserialises `GET /stocks/financials/v1/ratios` into `FinancialRatio`. That type has 23 fields (`ticker`, `cik`, `date` and 20 ratio values) and none of `tickers`, `period_end`, `filing_date`, `fiscal_year` or `timeframe`.
  - P1: one such row, alongside a valid balance sheet, raises `ProviderContractViolation` for exactly those five fields, and the balance sheet is discarded with it. P2: with ratios empty, the same call returns the balance sheet.
  - The ratios request carries no range (`client.py:257-260`, `{'ticker': 'AAPL', 'raw': True}`), and no client-side filter applies. P3: a 2010 ratios row is returned for a 2023 range.
  - The tests cannot see any of this:
    - `:221` (TC-COMP-003) and `:265` serve ratios as `results: []`.
    - `:243` (added by `93ec4ca`) serves the statement fixture `financial_quarterly.json` as a ratios row.
    - The E2E stub serves statement-shaped ratios (EXP-20261009-1 follow-ups).
    - Integration automation T011 (TC-INT-023, fundamentals) is held.
  - The defect is not new since v4. At v4's reviewed head `7795735` (same massive 2.8.0 lock), the ratios call passed `tickers=`/`period_end_*` arguments, which `list_financials_ratios` rejects with `TypeError`. That error is classified retryable and ends in `ProviderUnavailable` after three attempts (EXP-20261009-1 RED evidence). The label was also `"ratio"`, which the model rejects (`93ec4ca`'s message). v4's bare `MagicMock` accepted both.
  - massive-client v12 §14 item 7, approved 2026-10-10, says "Open; nothing is decided here … Blocks: the ratios read and AC-3's fundamentals for ratios". `projects/factorflow-v2/decisions/` holds no decision about ratios.
  - Live-provider confirmation was not possible in this review: no credential, and live probes are excluded by design §7. The evidence rests on the vendor SDK's own response model, the same basis as specification reviews v6–v9.
- **Expected evidence/behavior**: AC-3 says a run "MUST provide, for each named instrument the provider covers, … company fundamentals … over the stated history depth". TC-COMP-003's expected result says the same. Design §2.3 has `fetch_financials(symbol, start, end)` return the instrument's financials over the range.
- **Impact**: In a live run, every instrument with ratio data records fundamentals as `failed` (`ProviderContractViolation`) after one ratios request. The three statements fetched for it are lost as well, so no fundamentals reach the store for those instruments. With a "Financials & Ratios" plan, that is likely to be most covered instruments. The failure is typed and fail-closed: nothing is written partially (design §8 criterion 6), so there is no data-integrity risk. That, and the fact that three of the four data types are delivered, is why this is HIGH rather than CRITICAL. Green unit and E2E suites hide the gap.
- **Required remediation**:
  1. The owner resolves massive-client §14 item 7. That means deciding the ratios request contract, the range bound and how a `FinancialRatio` row maps to `fundamental_observation`. Alternatively, the owner records a decision that removes ratios from AC-3 for this capability. Either way, the decision goes through design and specification review.
  2. The Coding Agent then makes `fetch_financials` return fundamentals for a covered instrument with ratio data over the requested range, or stop requesting ratios if they are excluded.
  3. Replace the statement-shaped and empty ratios fixtures with the SDK's `FinancialRatio` shape, so that TC-COMP-003's financials test fails if this regresses.

  Changes to the E3-S2 model or `market-data-store` follow the owner's decision and are outside this story unless re-planned.

### IR-002 — Empty successful paged responses are not classified as not found

- **Severity**: MEDIUM
- **Status**: OPEN (carried forward from v4/IR-001 and v3/IR-001, unchanged)
- **Acceptance criteria**: component-design-massive-client §8 criterion 4 (AC-3's unknown-instrument counterpart). No story AC is unmet by this finding alone.
- **Tasks**: T009
- **Files**: `src/factorflow/ingestion/massive/paging.py:58-68`; `src/factorflow/ingestion/massive/client.py:112`, `:145`, `:231` (only `:79-80` converts an empty result, for reference)
- **Claim challenged**: That a successful empty result is handled per the documented unknown-instrument contract.
- **Observed evidence**: `paging.py` is byte-identical to v4. P4 shows bars, financials and corporate actions each return `[]` for an all-empty provider response, with no `InstrumentNotFound`. Design v12 is unchanged on the point: §2.2 maps "404, or 200 with an empty result set" to `InstrumentNotFound`, while the §7 row scopes its empty-result test to "reference data". No owner decision defines a valid-empty outcome per data type.
- **Expected evidence/behavior**: Explicit, tested empty-result semantics per read, consistent with design §2.2 and §8 criterion 4, or an owner decision that an empty range is a valid no-data outcome for the paged reads.
- **Impact**: An instrument the provider does not know, but whose reference read did not run or did not fail, could record three data types as a successful empty acquisition. In the runner's normal order the reference read surfaces `InstrumentNotFound` first, which limits the practical exposure.
- **Required remediation**: Unchanged from v4. Make per-read empty-result behavior explicit, either through the design or an owner decision for valid-empty data types, and add focused regression tests. This is not blocking on its own.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v4/IR-001 — empty successful paged responses are not classified as not found | STILL OPEN | `paging.py` md5 `0e89acc8…fcad` is identical to v4's reviewed state; `client.py:79-80` is the only empty-result conversion; P4 returns `[]` for all three paged reads. Carried forward as IR-002. |

## Scope and Plan Deviations

- **Shared-file re-review on `main`.** The review branch has no commits of its own. The subject is S1's 12 delivered files at `a181426`, with `review_base` corrected to `bf3ac30` (see the review-base note). v1–v4's `5c21451` and `7795735` belong to the pre-rebase branch.
- **Why the gate reopened.** The five trigger files changed through `5e7f04c` (E3-S2, whose v4 review is at that commit, before the later annotations) and `26cfe3c` (integration automation, which has no automation review yet), and in the financials file also through `93ec4ca` and EXP-20261009-1. No other passing review covers them as they are now.
- **`93ec4ca` landed outside the gate.** It is an S1-labelled production fix (PR #57, 2026-09-20). It had no S1 review, no task-plan rework and no TDD-evidence entry. This review covers it: the label matches the `fundamental_statement_known` DDL, and M4 kills the reversion. Its test's statement-shaped ratios fixture belongs to IR-001.
- **S1's test files now host other stories' tests.**
  - E3-S2 model tests are in `test_massive_bars.py`, `test_massive_financials.py` and `test_massive_actions.py`.
  - E3-S6's base-URL tests are in `test_massive_sdk_config.py`.
  - Those parts are judged by their own reviews. Only the S1 functions, and changes to them, are assessed here.
- **TC-INT annotations on unit tests.** `26cfe3c` marks mocked-SDK unit tests as implementing TC-INT-021/022/024/025, per integration automation tasks T009, T010, T012, T013 and DEC-0024. Whether that satisfies the integration specification is for the automation review. It does not change any S1 assertion. T011 (TC-INT-023, fundamentals) stays held, which is consistent with IR-001.
- **Bookkeeping.** The story is `status: docs-sync` and the task file `status: draft`, with every task checked. This is unchanged since v4 and not raised again.
- **Validation environment.** Python 3.13 locally (`requires-python >=3.12`), Docker 28.3.2 for testcontainers, and no live-provider access.

## Follow-Up

- **Next agent**: Coding Agent, after an owner decision
- **Required action**:
  1. The owner resolves massive-client §14 item 7 / specification review v9 FINDING-2: the ratios contract, range bound and storage mapping, or a recorded exclusion of ratios from AC-3. The design and specification review are updated first.
  2. `$story-coding` reworks `fetch_financials` and its tests against the real `FinancialRatio` shape (IR-001), with this report as the rework input. It should set `last_reworked_review: CAP-001-E3-S1-implementation-review-v5.md` when done.
  3. Adversarial review v6 follows.

  Doc sync stays blocked. `docs_synced_review` still names v4, which this report supersedes. IR-002 may be addressed in the same rework or by owner decision.
- **Warnings accepted downstream**: N/A
