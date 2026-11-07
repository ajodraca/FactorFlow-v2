---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-11-07T04:51:46Z
reviewed_state_revision: sha256:a0b0c3979ba271e608544b8a2e8faf81dd7a48c95d280e337c8b0ff090d9659f
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-e2e-tests
    artifact_version: 1
    content_revision: sha256:e529ea318ca109793c398143b5fceb6c358e3acd27a065b78a14412b85ec8667
  - artifact_id: CAP-002-e2e-tests-automation-tasks
    artifact_version: 1
    content_revision: sha256:43c48e39bca9832a278668cdb3dd649754f41efef1c2f4f5eb46702c9fda5d3a
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-07T04:51:46Z
  source_artifacts:
    - id: CAP-002-e2e-tests
      version: "1"
    - id: CAP-002-e2e-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-e2e-tests — Version 5

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 12/12 |
| Automation tasks | 14/14 |
| Required commands | 15/15 |
| Findings | 2 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

Review v4 blocked the gate on AR-010 alone: four required tests skipped under
the DEC-0285 guard. The owner has since resolved the payload keys in DEC-0295,
and the approved expedited change EXP-20261107-1 binds them in `line_items.py`.
Commit `b8ff14b` adds plan task T014 and makes the stub serve quarterly
statements under those keys.

- **AR-010 is resolved.** `line_items.unresolved()` is empty, and the guard is
  unchanged. A fresh `npm run test:e2e` ran 31 tests: 31 passed, 0 skipped. The
  output contains no "skipped" and no "has no payload key" line. TC-E2E-001,
  the after-the-run half of TC-E2E-002, TC-E2E-009 and TC-E2E-010 now execute
  and pass.
- **The assertions are not weakened.** `git diff 6144a19..HEAD -- tests/e2e`
  touches only `tests/e2e/support/massive_stub.py`. No spec file and neither
  helper file (`acquisition.ts`, `classification.ts`) has changed since v4,
  so the four tests run exactly as v4 read them.
- **The stub is a fair stand-in for what the product reads, within limits
  DEC-0295 itself names.** See *Stub fidelity* below.
- **The CAP-001 e2e specs still pass with the new stub.** All 18 non-CAP-002
  tests are among the 31 passed.

Two LOW findings remain, and neither blocks the gate. AR-013: the plan's
narrative still describes the guarded, key-less state. AR-014: TC-E2E-005's
"even if the filter now matches different stocks" depended on value staying
unscored, and with the keys resolved nothing guarantees or asserts it.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`, v1, `draft`, 12 cases (TC-E2E-001 to 012). Unchanged since v1. Its content revision is the same as in v4.
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md`, v1, `draft`, 14 tasks, all checked. `b8ff14b` adds T014 and a "Resolved 2026-11-07 (DEC-0295)" paragraph. It appends one sentence to the Notes and sets `last_reworked_review: e2e-tests-automation-review-v4.md`. The content revision changed from v4's `sha256:bb2ac4d0…` to the one recorded above. The `Branch` line matches the checkout.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2` (the plan's `Component(s)` line: `FactorFlow-v2`), branch `usr/alvaro-de-jodra/CAP-002-automation-rework`, HEAD `b8ff14b50bdd95a19b708c66fafc45c46fcedf7d`. No branch was switched.
- **Since v4 (`6144a19`):**
  - **DEC-0295 and EXP-20261107-1, outside this specification's change set:** `56a8162`, `3e006b5`, `d344858` and `e0b479d` (designs and specification review v5). `ae525ff`, `29cf026`, `e39341d`, `f5cca52`, `b3512b9`, `5250267` and `46b97f0` are EXP-20261107-1, reviewed separately and owner-approved (`status: approved`, 2026-11-07T04:14:46Z). They change `line_items.py`, `value_inputs.sql`, `engine.py` and their tests. I read `line_items.py`, `statements.sql`, `value_inputs.sql` and `growth_inputs.sql` only to judge the stub against them.
  - **This specification's rework:** `b8ff14b`, which changes the plan, `tests/e2e/support/massive_stub.py` and `tests/unit/test_massive_stub.py`.
- **Working tree:** clean before and after validation (`git status --porcelain` printed nothing). The fingerprint was taken before validation, and `npm run build` and `uv build` left the tree clean.
- **Decisions read:**
  - DEC-0295: `decided_by: owner`, `status: open`, `owner_reviewed: false`. The owner made the decision attended. The open owner-review field is the blind-review bookkeeping, not an open question. It binds the seven keys, the capex magnitude, preferred stock subtracted with absent or null read as zero, and shares from the latest quarterly income statement. It leaves Q4 coverage to the first real run.
  - DEC-0285: `owner_verdict: upheld`, `status: applied`. The guard stays, and it now passes because the keys are bound, not because anyone removed it.
  - DEC-0047 and DEC-0181: as in v4.
- **Gate waiver:** none recorded, and none is needed.
- **Prerequisites:** `scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` exited 2: context freshness STALE, last run 2026-11-05T18:43:01Z, 33 h ago against a 24 h window. Every other check passed. The context feeder was not run. It moves `repos/`, and the launcher said not to switch branches there. This review reads the component repository directly at a frozen HEAD and reruns every command. It reads nothing from the cached context summaries, so the stale cache affects no evidence here. This is recorded so the owner can see it, not assumed silently.

### Changed Files

| File | Change |
| --- | --- |
| `biome.json` | modified (in `c15c923`): `files.ignore` gains `build/**` (T013). Unchanged since v4. |
| `scripts/run-e2e-server.sh` | modified: 1 s classification poll on the acquisition stack, and the header lists the CAP-002 cases (T001). Unchanged since v4. |
| `tests/e2e/support/massive_stub.py` | modified: per-symbol drift. `NOF*` statements answer 404, withheld statements 503, and `NEW*` bars start 300 days ago (T002). In `b8ff14b` the `ok`-mode statement paths answer one quarterly row per calendar quarter end in the window, filed 35 days later, under the `LINE_ITEMS` keys of that statement type (T014). |
| `tests/e2e/support/acquisition.ts` | modified: CAP-002 tables in `DATA_TABLES`, `withholdSymbol` and `restoreSymbol`, and `ProviderMode` without `no-fundamentals` (T003). Unchanged since v4. |
| `tests/e2e/support/classification.ts` | added: seeding, follow, universe, retire, set-wait and `skipUnlessLineItemsResolved` fixtures (T004). Unchanged since v4. |
| `tests/e2e/research-after-download.spec.ts` | added: TC-E2E-001 and TC-E2E-002 (T005). Unchanged since v4. |
| `tests/e2e/universe-by-hand.spec.ts` | added: TC-E2E-003 and TC-E2E-004 (T006). Unchanged since v4. |
| `tests/e2e/universe-from-result.spec.ts` | added: TC-E2E-005 and TC-E2E-006 (T007). Unchanged since v4. |
| `tests/e2e/compare-and-evidence.spec.ts` | added: TC-E2E-007 and TC-E2E-008 (T008). Unchanged since v4. |
| `tests/e2e/fix-insufficient-evidence.spec.ts` | added: TC-E2E-009 and TC-E2E-010 (T009). Unchanged since v4. |
| `tests/e2e/universe-maintenance.spec.ts` | added: TC-E2E-011 and TC-E2E-012 (T010). Unchanged since v4. |
| `tests/unit/test_massive_stub.py` | added (in `9d93e3b`): 14 tests of the stub's status codes (T002). In `b8ff14b`: 6 more tests of the quarterly statements (T014), and the single-row assertion becomes `>= 8`. 20 tests in all. |
| `tsconfig.e2e.json` | added (in `9d93e3b`): type-checks `tests/e2e` and `playwright.config.ts` (T013). Unchanged since v4. |

## Stub fidelity

I compared the T014 stub against what the product sends and reads:
`ingestion/massive/client.py` `fetch_financials`, `models.FinancialStatement`,
`writer._derive_fiscal_period`, `statements.sql`, `value_inputs.sql`,
`growth_inputs.sql`, and the massive 2.8.0 SDK models in `.venv`.

**What matches the product:**

- **Request shape.** The product calls each statement endpoint with `tickers=<symbol>` and `period_end.gte` / `period_end.lte`. The server log shows exactly that, for example `GET /stocks/financials/v1/income-statements?tickers=F00&period_end.gte=2023-11-06&period_end.lte=2026-11-06`. The stub reads both, through `_first(query, "ticker", "tickers")` and `_first(query, "period_end.gte", "period_end_gte")`.
- **Row shape.** `FinancialStatement` requires `cik`, `tickers`, `period_end`, `filing_date`, `fiscal_year` and `timeframe`, and takes an optional `fiscal_quarter`. The stub supplies all of them, and `timeframe: "quarterly"` plus `fiscal_quarter` lets the writer derive a non-FY `fiscal_period`.
- **Line items.** They are flat top-level numbers under the same names the SDK's flat models declare: `FinancialBalanceSheet.total_equity_attributable_to_parent`, `FinancialIncomeStatement.diluted_shares_outstanding`, `net_income_loss_attributable_common_shareholders`, `diluted_earnings_per_share` and `revenue`, and `FinancialCashFlowStatement.net_cash_from_operating_activities` and `purchase_of_property_plant_and_equipment`.
- **No hard-coded keys.** The stub takes its keys from `LINE_ITEMS` itself, so a key change cannot leave the stub and the engine disagreeing silently.
- **Windows.** A three-year window gives 11 to 12 calendar quarters, and `statements.sql` needs 8 consecutive ones (DEC-0221: at most 4 months apart). The latest quarter served ends at most about 127 days (92 + 35) before the request's end. That is inside the 6-month `FUNDAMENTALS_STALE_AFTER_MONTHS`, so value and growth are never read outdated.
- **Values.** Values grow every quarter, so `prior_sum > 0` and growth is computable. Capital expenditure is served negative, as Massive "typically" reports it, and the engine reads its magnitude (DEC-0295).
- **Filing lag.** The stub serves no row before its filing date. That is the provider's real behaviour for an unfiled quarter.

**Where the stub is narrower than the real provider.** These are noted, not findings. Each is outside this specification's control, or is covered elsewhere.

- **Q4 rows.** The stub serves a quarterly Q4 row every year. DEC-0295 says Q4 quarter coverage "is confirmed at the first real run". If Massive answers a 10-K quarter with no quarterly row, no window ever forms in production. These e2e tests cannot reveal that, because the stub encodes the optimistic answer. That residual risk is the owner's, and DEC-0295 already records it.
- **Annual rows.** The stub serves no annual rows, so the `fiscal_period <> 'FY'` exclusion is not exercised end to end. Integration tests cover it.
- **Edge-case keys.** `preferred_stock` is never served, so it reads as zero, and capex is never positive. The `less_key` subtraction and the either-sign capex are therefore exercised only by the integration tests (`test_book_equity_is_parent_equity_less_preferred_stock`, `test_unreadable_preferred_stock_makes_book_equity_absent` and `test_capital_expenditure_is_read_by_magnitude` in `tests/integration/test_engine_inputs_fundamentals.py`).
- **Symbol spread.** Per-symbol variation hashes `sum(map(ord, symbol))`. Anagram symbols collide, so `F00` to `F29` collapse to 12 distinct fundamentals profiles (h = 166 to 177). Percentiles therefore tie in groups of up to three. TC-E2E-001's "not all alike" assertion still holds, and no assertion needs distinct values.
- **Shared fields.** Every symbol carries the same CIK, and the response is one page with no `next_url`. Both are unchanged from v4. Neither field is part of any natural key the engine reads.

## Test Case and Traceability Verification

Every TC-ID maps to a test whose title carries the ID and whose body carries
`// Implements TC-E2E-NNN`. TC-E2E-002 maps to two tests. Every implemented test
and support file traces to a planned task, and T014 traces to the four cases it
names. Traceability is bidirectional.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/research-after-download.spec.ts` › "TC-E2E-001: a succeeded run leaves every stock scored…" | Executes and passes ([20/31]). The assertions are unchanged since v4. "31 stocks match", and each drawn row has 3 whole-number percentiles, not all alike. `card-score` ×3 on F00, F15 and F29. The as-of line is in C[SD]T with a link to `/runs/{runId}`. `NEWAAA` has value and growth percentiles and momentum Incomplete, titled "12-month total return …". The run must end `Succeeded`. That happens because every follower now gets 200s carrying data, and `NEW*` statements are served as for any symbol. |
| TC-E2E-002 | VERIFIED | same file › "…before any run…" and "…after a run with 20 stocks…" | Both execute and pass ([18/31], [19/31]). After the run, the test asserts 60 cells reading "Not enough to rank", no percentile, and "20 qualified, 30 needed" per factor header. With keys resolved, 20 stocks qualify for value and growth too, so the header assertion is meaningful for all three factors, not only momentum. |
| TC-E2E-003 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` › TC-E2E-003 | Unchanged. Passes. |
| TC-E2E-004 | VERIFIED | same file › TC-E2E-004 | Unchanged. Passes. |
| TC-E2E-005 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` › TC-E2E-005 | Unchanged. Passes. The "matches differently" condition is no longer guaranteed (AR-014). |
| TC-E2E-006 | VERIFIED | same file › TC-E2E-006 | Unchanged. Passes. |
| TC-E2E-007 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` › TC-E2E-007 | Unchanged. Passes. The server logs one `classification build failed: ValueError: no price data held for any active instrument` during this seeded test. That is the background scheduler finding a seeded store with no bars (DEC-0114). It is not a test failure, and the stub change does not cause it. |
| TC-E2E-008 | VERIFIED | same file › TC-E2E-008 | Unchanged. Passes. |
| TC-E2E-009 | VERIFIED | `tests/e2e/fix-insufficient-evidence.spec.ts` › TC-E2E-009 | Executes and passes ([13/31]). The assertions are unchanged since v4. The first run ends `partial`, and growth reads "Growth for BBB couldn't be scored: revenue growth is missing.", with the next-download line and the Data health link. After `restoreSymbol`, the run ends `succeeded`, and growth shows a percentile and a `card-score`. Earlier scores shows 1 row, then 2, newest first, each with a date and C[SD]T time. The second run now scores BBB's growth for real from 12 served quarters. That is the path v4 could only trace in code. |
| TC-E2E-010 | VERIFIED | same file › TC-E2E-010 | Executes and passes ([14/31]). The assertions are unchanged since v4. Both runs end `partial`. "the provider reports no" and "No action in FactorFlow changes this." appear twice, with no Data health link, and the growth cell reads Incomplete. The 30 followers now score, so NOFCCC's Incomplete is the 404 case, not a set-wide absence. |
| TC-E2E-011 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` › TC-E2E-011 | Unchanged. Passes. |
| TC-E2E-012 | VERIFIED | same file › TC-E2E-012 | Unchanged. Passes. |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `scripts/run-e2e-server.sh` | Unchanged. |
| T002 | VERIFIED | `tests/e2e/support/massive_stub.py`, `tests/unit/test_massive_stub.py` | (a) to (e) are unchanged in behaviour. The `NOF*` and withheld branches run before `_statements`, so they still return 404 and 503 (unit tests pass). The task's "Do not … add any financial field" sentence is now superseded by T014 (AR-013). |
| T003 | VERIFIED | `tests/e2e/support/acquisition.ts` | Unchanged. |
| T004 | VERIFIED | `tests/e2e/support/classification.ts` | Unchanged. `skipUnlessLineItemsResolved` now finds `0` and does not skip. |
| T005 | VERIFIED | `tests/e2e/research-after-download.spec.ts` | All three tests execute and pass. |
| T006 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` | Unchanged. Passes. |
| T007 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` | Unchanged. Passes (AR-014). |
| T008 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` | Unchanged. Passes. |
| T009 | VERIFIED | `tests/e2e/fix-insufficient-evidence.spec.ts` | Both tests execute and pass within their 240 s and 180 s timeouts. |
| T010 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` | Unchanged. Passes. |
| T011 | VERIFIED | full suite | 31 passed, 0 skipped. The task text still expects "the guarded tests reported as skipped" (AR-013). The Validation Plan's post-resolution expectation, "all 12 cases (13 tests) must pass with no skip", is what holds. |
| T012 | VERIFIED | full suite | No spec or helper file changed, so isolation is as v4 found it. The full suite (one worker, `resetAcquisitionStore` per test) passes with the guarded tests now executing between the CAP-001 specs. That includes `diagnose-failure`, `first-run`, `run-detail`, `instrument-changes` and `unrecognised-instrument`, which acquire fundamentals from the changed stub. No run is left non-terminal: the `posttest:e2e` cleanup ran, and the suite exited 0. |
| T013 | VERIFIED | gate commands | `tsc -p tsconfig.e2e.json`, `npm run lint`, `npm run format`, `ruff check`, `ruff format --check`, `mypy src`, the stub unit test and `pytest -m 'not postgres'` all exit 0. |
| T014 | VERIFIED | `tests/e2e/support/massive_stub.py` (`_quarter_ends`, `_line_item_values`, `_statements`, `provider_response`), `tests/unit/test_massive_stub.py` | The implementation matches the task text. Each row is one calendar quarter end in `[gte, lte]`, kept only when `filed = end + 35 d <= lte`. Each carries `timeframe`, `fiscal_quarter`, `fiscal_year`, `period_end`, `filing_date`, `tickers`, `statement_type` and exactly that type's `LINE_ITEMS` keys. Values are a deterministic function of symbol and quarter, positive apart from a negative capex, with revenue and EPS strictly increasing in `k`. The unit tests check each type's keys (a subset, and no other type's keys), at least 8 consecutive filed quarters with the latest within 183 days, positivity, monotonic revenue, differing symbols, negative capex, positive OCF and repeatability. `NOF*` and withheld symbols keep their 404 and 503. Reverting `_statements` to the old single row fails `test_a_three_year_window_holds_eight_consecutive_filed_quarters`. Dropping a key fails `test_each_statement_carries_its_types_resolved_keys`. T014 is missing from the Dependencies section (AR-013). |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2`, written `.` below.
Commands that need Docker, the `uv` cache or `node_modules` ran outside the
sandbox as one plain call. The repository was the shell's working directory, and
`--directory` gave the absolute repository path to `uv`. One first attempt at the
postgres command passed the harness-relative `--directory
repos/factorflow-v2/FactorFlow-v2` from the component directory. It exited 2
with "No such file or directory" before any test ran, and the absolute-path rerun
below is the result.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run test:e2e` | `.` | 0 | PASS | 31 tests: **31 passed, 0 skipped** (3.8 min). This covers all 13 CAP-002 tests and all 18 CAP-001 and stack tests. The output has 0 "skipped" lines and 0 "has no payload key" lines. Every follower's statement requests answer 200 (112 income-statement requests for `F*` symbols). |
| `uv run --directory . --offline pytest -m postgres` | `.` | 0 | PASS | 950 passed and 1658 deselected in 407.85 s, through testcontainers. That includes the EXP-20261107-1 integration tests the stub-fidelity notes rely on: preferred stock, capex magnitude and income-statement shares. With the not-postgres run below, the two partitions cover the whole of `uv run pytest`: 2608 passed and 0 xfailed. |
| `uv run --directory . --offline pytest -q -m "not postgres"` | `.` | 0 | PASS | 1658 passed and 950 deselected in 34.37 s. v4 had 1650 passed and 1 xfailed. The xfail in `test_line_items_resolved.py` now passes, as the plan's Notes said resolution would make it, and 6 stub tests are new. |
| `uv run --directory . --offline pytest tests/unit/test_massive_stub.py tests/unit/test_line_items_resolved.py tests/unit/test_line_items.py -v` | `.` | 0 | PASS | 28 passed: 20 stub tests (14 from T002 and 6 from T014), `test_every_line_item_payload_key_is_resolved`, and 7 `line_items` tests. |
| `uv run --directory . --offline ruff check .` | `.` | 0 | PASS | All checks passed. |
| `uv run --directory . --offline ruff format --check .` | `.` | 0 | PASS | 284 files already formatted. |
| `uv run --directory . --offline mypy src` | `.` | 0 | PASS | No issues in 61 source files. |
| `npm run test` | `.` | 0 | PASS | Vitest: 77 files, 2101 tests passed. |
| `npm run lint` | `.` | 0 | PASS | Checked 180 files. No fixes applied. |
| `npm run format` | `.` | 0 | PASS | Checked 180 files. No fixes applied. |
| `npx tsc --noEmit -p tsconfig.json` | `.` | 0 | PASS | No diagnostics. |
| `npx tsc --noEmit -p tsconfig.e2e.json` | `.` | 0 | PASS | No diagnostics. |
| `npm run build` | `.` | 0 | PASS | Vite: 102 modules. The working tree stayed clean. |
| `uv build --directory . --offline` | `.` | 0 | PASS | Built `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl`. |
| `git status --porcelain` (after validation) | `.` | 0 | PASS | Empty. |
| `uv sync --all-extras`, `npm ci` | `.` | — | NOT-RUN | These install dependencies and are not validation. No lockfile is in the change set. |

The plan's test-specific `npx playwright test <six CAP-002 files>` was not run
separately. The full `npm run test:e2e` run covers those 13 tests in the same
single-worker order, and all of them passed with no skip.

## Findings

AR-010 is resolved. Two new LOW findings take the next IDs.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-013 | LOW | `b8ff14b` added T014 and a "Resolved 2026-11-07" paragraph, but the plan's other text still describes the key-less state. The Summary (lines 47-52) says every payload key "is `[REQUIRES INPUT]` … still open". T002 (line 134) says "Do **not** vary fundamentals values or add any financial field beyond what `financial_annual.json` already contains". Checked T011 (line 213) expects "the guarded tests reported as skipped with the DEC-0285 reason". *Task Dependencies* (line 231) omits T014, so T011 depends only on T005 to T010. The Validation Plan's "Expected result today" (line 254) is 9 passed and 4 skipped. The Notes' "Open payload keys" bullet says `line_items.py` "keeps all seven … at `REQUIRES_INPUT`". The docstrings of `research-after-download.spec.ts` and `fix-insufficient-evidence.spec.ts` say the tests "skip" and that serving the keys "is a further stub task". The fresh result is 31 passed, 0 skipped. | No design is misstated: the added Resolved paragraph and the Validation Plan's post-resolution sentence give the correct state, and traceability holds both ways. But a checked task (T011) and the stated expected result contradict the evidence, and T014 is not placed in the execution order. | Refresh the plan through `$automation-planning`. Rewrite the Summary and the Notes bullet for the resolved state. Mark T002's prohibition as superseded by T014. Change T011 and the Validation Plan to expect 31 passed and 13 CAP-002 passed with 0 skipped. Add "T014 depends on T002; T011 depends on T005 to T010 and T014". Update the two spec docstrings in `$automation-coding`. Comments only, no assertion change. |
| AR-014 | LOW | TC-E2E-005 expects the universe to keep its n members "even if the filter now matches different stocks". Reviews v1 to v3 verified that condition because the later real run left value unscored, so the filter necessarily matched differently. With the keys resolved, the later run in `universe-from-result.spec.ts` (`stateHistoryDepth(page, 1)`) builds real value scores from stub statements whenever its one-year window holds four filed quarters. On 2026-11-06 it holds four, because the Sep 30 quarter was filed Nov 4. In the weeks before a filing date it holds three, and the trailing window does not form. Whether the filter's matches change is now incidental and date-dependent, and the test never checks it. The plan's Notes (TC-E2E-005 membership) say the stronger condition "is exercised once the keys resolve", and nothing does so. | The test still passes and still asserts the same sorted member list. But a regression that re-derives a filter-built universe from its filter at read time would pass whenever the later set happens to match the same stocks. | In `$automation-coding`, after `waitForNewSet`, reapply the same filter on Research and assert that its match list differs from `members` before asserting that the universe is unchanged. Alternatively, choose the seeded scores so the later stub-built set cannot match the same stocks. Otherwise record in the plan why the condition is left unasserted. |

## Previous Review Disposition

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v4 AR-010 | HIGH | Resolved | DEC-0295 resolves system design section 8 question 1. EXP-20261107-1 (approved) binds the keys, and `line_items.unresolved()` is empty (`test_every_line_item_payload_key_is_resolved` passes). The guard in `classification.ts` is unchanged and no longer skips. T014 (`b8ff14b`) serves dated quarterly statements under the bound keys, which is the stub task v4's remediation (a) required. `npm run test:e2e`: 31 passed, 0 skipped. TC-E2E-001, TC-E2E-002 (after the run), TC-E2E-009 and TC-E2E-010 executed and passed, with assertions unchanged since v4 (`git diff 6144a19..HEAD -- tests/e2e` touches only the stub). |
| v3 AR-005, AR-011, AR-012 | LOW, HIGH, LOW | Resolved in v4, still resolved | AR-011 and AR-012 were code-verified but unexecuted in v4. They are now verified by execution: TC-E2E-009's 503 path, TC-E2E-010's 404 path and `NEWAAA`'s momentum-only Incomplete all pass. |
| v2 AR-005 to AR-009, v1 AR-001 to AR-004 | HIGH, MEDIUM, LOW | Disposed in v2 to v4 | No change since v4 reopens them. |

## Verdict

**Verdict:** PASS-WITH-WARNINGS

AR-010 is resolved. All 12 cases (13 tests) execute and pass with no skip, and
the CAP-001 specs still pass with the new stub. Every required command exits 0.
Two LOW findings remain and do not block the gate. AR-013 is stale plan and
docstring narrative. AR-014 is TC-E2E-005's unasserted "matches differently"
condition. Both can be taken up in the next `$automation-planning` or
`$automation-coding` pass. The next step is the final completion check and the
owner's approval decision. This review approves nothing.
