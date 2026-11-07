---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 6
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-11-07T15:35:26Z
reviewed_state_revision: sha256:b35e025162254ea0c2f059a57b0b5b642de8a5c073661ae9484b2332ebbea295
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
  timestamp: 2026-11-07T15:35:26Z
  source_artifacts:
    - id: CAP-002-e2e-tests
      version: "1"
    - id: CAP-002-e2e-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-e2e-tests — Version 6

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 12/12 |
| Automation tasks | 14/14 |
| Required commands | 15/15 |
| Findings | 2 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

This review rebinds the gate to the repository as it now stands. Review v5
recorded `sha256:a0b0c397…659f`. Since then two approved expedited changes
merged, and `pipeline-state.py check` reported `RESUME — automation code changed
after review`. The current fingerprint is the one recorded above, at HEAD
`829c9e1`.

- **Neither change touches this specification's automation.** No commit since
  v5's HEAD `b8ff14b` (nor since `efac1ab`) changes anything under `tests/e2e/`,
  `scripts/run-e2e-server.sh`, `playwright.config.ts`, `tsconfig.e2e.json`,
  `biome.json` or `tests/unit/test_massive_stub.py`. The test specification and
  the task plan have the same content revisions as in v5.
- **What did change:** EXP-20261107-2 (PR #178) idles the classification
  scheduler in the `client` fixture of `tests/integration/test_api_universes.py`.
  EXP-20261107-3 (PR #179) sets version 0.2.0 in `pyproject.toml`, `uv.lock`,
  `package.json` and `package-lock.json`. It also updates two README tag
  examples and adds `tests/unit/test_version_agreement.py`. Both records are
  `status: approved`. None of these files is read by the e2e stack except the
  manifests, and the version string plays no part in any e2e assertion.
- **A fresh `npm run test:e2e` passed:** 31 tests, 31 passed and 0 skipped,
  in 4.2 min. All 13 CAP-002 tests and all 18 CAP-001 and stack tests are among
  them. Every other required command exits 0.

The two LOW findings from v5 (AR-013 and AR-014) still apply unchanged, because
the plan and the spec files have not changed. Neither blocks the gate.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`, v1, `draft`, 12 cases (TC-E2E-001 to 012). Its content revision is unchanged since v4.
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md`, v1, `draft`, 14 tasks, all checked, `last_reworked_review: e2e-tests-automation-review-v4.md`. Its content revision is the same as in v5. The `Branch` line (`usr/alvaro-de-jodra/CAP-002-automation-rework`) matches the checkout.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2` (the plan's `Component(s)` line: `FactorFlow-v2`), branch `usr/alvaro-de-jodra/CAP-002-automation-rework`, HEAD `829c9e1684c19f61ca015a82f6853fe769be4b26`, equal to `origin/main`. No branch was switched.
- **Since v5 (`b8ff14b`):**
  - `4290833` and `080f67d` are documentation: review reports, and the stories moved to `done`.
  - `0620fbd` is EXP-20261107-2. It patches `app_module.run_classification_loop` with `_idle_scheduler` in the integration `client` fixture and adds `test_the_client_runs_no_classification_scheduler`. Its review v1 is PASS-WITH-WARNINGS, and the record is approved at 2026-11-07T14:07:00Z.
  - `1cf97bb` is EXP-20261107-3: the version bump, the README tag examples, and `tests/unit/test_version_agreement.py`. Its review v1 is PASS-WITH-WARNINGS, and the record is approved at 2026-11-07T14:20:49Z.
  - `c27d19d` and `829c9e1` are merge commits.
  - These changes were reviewed in their own expedited lane. This review reads them only to confirm that they do not reach the e2e automation, and does not take them into its own change set.
- **This specification's change set:** the same 13 files as v5, all unchanged since `b8ff14b` (`git diff --stat b8ff14b..HEAD` over them is empty). I re-read all six CAP-002 spec files in full, along with the `skipUnlessLineItemsResolved` guard in `classification.ts` and the structure and docstring of `massive_stub.py`. I re-verified each case against the specification below.
- **Working tree:** clean before validation (`git status --porcelain` printed nothing). Afterwards the only entries were untracked review reports: this one, and the concurrent integration review's. The fingerprint was taken before validation, and `npm run build`, `uv build` and the Vitest build-output test left the tree clean.
- **Decisions:** DEC-0295 (`decided_by: owner`, `status: open`, `owner_reviewed: false`, which is the blind-review bookkeeping) and DEC-0285 (`owner_verdict: upheld`, `status: applied`) are as v5 read them. No governing document has changed since v5: `docs/constitution/`, and the capability's specification and design files.
- **Gate waiver:** none recorded, and none is needed.
- **Prerequisites:** `scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` exited 0. Every check passed, including context freshness (last run 10 h ago). The STALE note in v5 no longer applies.
- **Production stack:** the FactorFlow stack on 127.0.0.1:8000 and :5432 (compose project `factorflow`) was neither stopped nor contacted. Before the run, ports 8123 to 8126 and 55433 were free. The e2e stack bound only those ports, and `posttest:e2e` removed only `factorflow-e2e-postgres`.

### Changed Files

| File | Change |
| --- | --- |
| `biome.json` | modified (in `c15c923`): `files.ignore` gains `build/**` (T013). Unchanged since v4. |
| `scripts/run-e2e-server.sh` | modified: 1 s classification poll on the acquisition stack, and the header lists the CAP-002 cases (T001). Unchanged since v4. |
| `tests/e2e/support/massive_stub.py` | modified: per-symbol drift, `NOF*` statements answer 404, withheld statements 503, `NEW*` bars start 300 days ago (T002), and quarterly statements under the `LINE_ITEMS` keys (T014, `b8ff14b`). Unchanged since v5. |
| `tests/e2e/support/acquisition.ts` | modified: CAP-002 tables in `DATA_TABLES`, `withholdSymbol` and `restoreSymbol`, and `ProviderMode` without `no-fundamentals` (T003). Unchanged since v4. |
| `tests/e2e/support/classification.ts` | added: seeding, follow, universe, retire, set-wait and `skipUnlessLineItemsResolved` fixtures (T004). Unchanged since v4. |
| `tests/e2e/research-after-download.spec.ts` | added: TC-E2E-001 and TC-E2E-002 (T005). Unchanged since v4. |
| `tests/e2e/universe-by-hand.spec.ts` | added: TC-E2E-003 and TC-E2E-004 (T006). Unchanged since v4. |
| `tests/e2e/universe-from-result.spec.ts` | added: TC-E2E-005 and TC-E2E-006 (T007). Unchanged since v4. |
| `tests/e2e/compare-and-evidence.spec.ts` | added: TC-E2E-007 and TC-E2E-008 (T008). Unchanged since v4. |
| `tests/e2e/fix-insufficient-evidence.spec.ts` | added: TC-E2E-009 and TC-E2E-010 (T009). Unchanged since v4. |
| `tests/e2e/universe-maintenance.spec.ts` | added: TC-E2E-011 and TC-E2E-012 (T010). Unchanged since v4. |
| `tests/unit/test_massive_stub.py` | added (in `9d93e3b`) and extended in `b8ff14b`: 20 tests of the stub (T002, T014). Unchanged since v5. |
| `tsconfig.e2e.json` | added (in `9d93e3b`): type-checks `tests/e2e` and `playwright.config.ts` (T013). Unchanged since v4. |

## Test Case and Traceability Verification

Every TC-ID maps to a test whose title carries the ID and whose body carries
`// Implements TC-E2E-NNN`. TC-E2E-002 maps to two tests. Every implemented test
and support file traces to a planned task, and every task traces to the cases it
names. Traceability is bidirectional. The run numbers in brackets are from this
review's `npm run test:e2e`.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/research-after-download.spec.ts` › "TC-E2E-001: a succeeded run leaves every stock scored…" | Passes [20/31] and is not skipped. Thirty `F*` followers and `NEWAAA`, a 3-year depth, and the run must end `Succeeded`. The test asserts "31 stocks match", three whole-number percentiles per drawn row that are not all alike, and `card-score` ×3 on F00, F15 and F29. The as-of line is in C[SD]T, with its link `href` equal to `/runs/{runId}`. `NEWAAA` has value and growth percentiles and momentum Incomplete, titled "Incomplete: 12-month total return …, so momentum …". This covers each of the spec's three expected results. |
| TC-E2E-002 | VERIFIED | same file › "…before any run…" and "…after a run with 20 stocks…" | Both pass [18/31, 19/31]. Before the run, the test asserts "No stocks have been scored yet." and no table. After the run, it asserts 20 rows, 60 cells that each read "Not enough to rank", no percentile, and "20 qualified, 30 needed" in all three factor headers. |
| TC-E2E-003 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` › TC-E2E-003 | Passes [25/31]. The universe is created through the dialog. The test asserts the detail URL, the "Core" heading, 3 members (no DDD) whose percentiles equal those read under All followed stocks, "Core" in the active list, and the same 3 stocks with the same percentiles when Research is scoped to Core. |
| TC-E2E-004 | VERIFIED | same file › TC-E2E-004 | Passes [26/31]. The dialog stays open, and its alert names ZZZ and "doesn't follow" with a link to `/instruments`. The field keeps AAA and ZZZ, and "No universes yet" shows with no "Core" link. |
| TC-E2E-005 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` › TC-E2E-005 | Passes [27/31]. The heading, the button and the dialog all carry the same n. The test asserts the toast link, n members, and an origin line with the date and both bounds. After a real run and a new set, the sorted member list is identical. The "matches differently" condition is still not asserted (AR-014). |
| TC-E2E-006 | VERIFIED | same file › TC-E2E-006 | Passes [28/31]. The test asserts "No stocks match these filters." and Clear filters. Save is `aria-disabled` with its reason, and a forced click opens no dialog. No universe exists afterwards. |
| TC-E2E-007 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` › TC-E2E-007 | Passes [6/31]. The test asserts `aria-sort` ascending, "4 stocks match", and an order (DDD, EEE, AAA, CCC) that only a working sort reaches. Compare shows 3 columns and 9 percentiles. The evidence page shows 8 input values, 8 "Known on" and 8 "As of". The server logs `classification build failed: ValueError: no price data held for any active instrument` during this seeded test. As in v5, that is the background scheduler meeting a seeded store with no bars (DEC-0114), not a test failure. |
| TC-E2E-008 | VERIFIED | same file › TC-E2E-008 | Passes [7/31]. The test asserts 3 columns and 9 cells. BBB's growth reads Incomplete with "revenue growth missing" in its title. RRR's three cells read "Not followed". Exactly 5 percentiles appear. RRR is retired through `retireInstrument` after it joins the universe. |
| TC-E2E-009 | VERIFIED | `tests/e2e/fix-insufficient-evidence.spec.ts` › TC-E2E-009 | Passes [13/31] and is not skipped. The server log shows BBB's balance-sheet request answering 503 on three tries in the first run, then all three statement paths answering 200 in the second. The test asserts the first run `partial` with the missing-input sentence, the recovery sentence and the Data health link. It asserts the second run `succeeded` with a growth percentile and `card-score`. Earlier scores shows 1 Incomplete row with a date, then after a third run 2 rows, newest first, with a date and a C[SD]T time. |
| TC-E2E-010 | VERIFIED | same file › TC-E2E-010 | Passes [14/31] and is not skipped. The server log shows NOFCCC's balance-sheet request answering 404 in both runs. The test asserts both runs `partial`, "the provider reports no" and "No action in FactorFlow changes this." twice, no Data health link, and the growth cell Incomplete after the second run. |
| TC-E2E-011 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` › TC-E2E-011 | Passes [29/31]. The test covers the rename, the add and the remove, each shown at once. History shows 7 events, newest first, including "Core → Core 2". Members as of 3 days ago are AAA, BBB and CCC, without DDD. After the universe is retired, the header shows "Retired" and the active list is empty, while the 3 members and 8 history rows remain readable. |
| TC-E2E-012 | VERIFIED | same file › TC-E2E-012 | Passes [30/31]. Remove is `aria-disabled` with the last-member sentence, and a forced click opens no dialog. "Not followed" ×3 shows before and after the retirement. The universe is retired, and History still links RRR with "Stock added". |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `scripts/run-e2e-server.sh` | Unchanged. The acquisition stack classified within each test's timeout. |
| T002 | VERIFIED | `tests/e2e/support/massive_stub.py`, `tests/unit/test_massive_stub.py` | Unchanged. All 14 T002 unit tests pass, and the server log shows the 404 for `NOF*` and the 503 for a withheld symbol. The "Do not … add any financial field" sentence is superseded by T014 (AR-013). |
| T003 | VERIFIED | `tests/e2e/support/acquisition.ts` | Unchanged. |
| T004 | VERIFIED | `tests/e2e/support/classification.ts` | Unchanged. `skipUnlessLineItemsResolved` finds 0 unresolved keys and skips nothing: the output has 0 "skipped" lines. |
| T005 | VERIFIED | `tests/e2e/research-after-download.spec.ts` | All three tests pass. |
| T006 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` | Both tests pass. |
| T007 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` | Both tests pass (AR-014). |
| T008 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` | Both tests pass. |
| T009 | VERIFIED | `tests/e2e/fix-insufficient-evidence.spec.ts` | Both tests pass within their 240 s and 180 s timeouts. |
| T010 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` | Both tests pass. |
| T011 | VERIFIED | full suite | 31 passed and 0 skipped. The task text still expects guarded skips (AR-013). The Validation Plan's post-resolution expectation, all 13 tests passing with no skip, is what holds. |
| T012 | VERIFIED | full suite | No spec or helper file has changed, so isolation is as v4 and v5 found it. The single-worker run with `resetAcquisitionStore` per test passes, with the CAP-002 specs interleaved among the CAP-001 specs. `posttest:e2e` ran, and the suite exited 0. |
| T013 | VERIFIED | gate commands | `tsc -p tsconfig.json`, `tsc -p tsconfig.e2e.json`, `npm run lint`, `npm run format`, `ruff check`, `ruff format --check`, `mypy src`, the stub unit test and `pytest -m 'not postgres'` all exit 0. |
| T014 | VERIFIED | `tests/e2e/support/massive_stub.py`, `tests/unit/test_massive_stub.py` | Unchanged since v5, which verified it against the task text and the product's reader. All 6 T014 unit tests pass. In this run every follower's statement request in `ok` mode answered 200, including 112 income-statement requests for `F*` symbols, the same count as v5. T014 is still missing from the Dependencies section (AR-013). |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2`, written `.` below.
Commands that need Docker, the `uv` cache or `node_modules` ran outside the
sandbox as one plain call. `uv` took the absolute repository path through
`--directory`, `npm` through `--prefix`, and `tsc` was the repository's own
`node_modules/.bin/tsc` with an absolute `-p`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run test:e2e` | `.` | 0 | PASS | 31 tests: **31 passed, 0 skipped** (4.2 min). This covers all 13 CAP-002 tests and all 18 CAP-001 and stack tests. The output has 0 "skipped" lines and 0 "has no payload key" lines. |
| `uv run --directory . --offline pytest -q -m postgres` | `.` | 0 | PASS | 951 passed and 1659 deselected in 862.07 s, through testcontainers. It ran beside a concurrent integration review, which may explain why it took longer than v5's 407.85 s. The count includes EXP-20261107-2's `test_the_client_runs_no_classification_scheduler`. With the not-postgres run below, the two partitions cover the whole of `uv run pytest`: 2610 passed. |
| `uv run --directory . --offline pytest -q -m "not postgres"` | `.` | 0 | PASS | 1659 passed and 951 deselected in 34.55 s. That is one more than v5's 1658: the new `test_version_agreement.py`. One test moved into the postgres partition, so 951 are now deselected, against 950 in v5: `test_the_client_runs_no_classification_scheduler`. |
| `uv run --directory . --offline pytest tests/unit/test_massive_stub.py tests/unit/test_line_items_resolved.py tests/unit/test_line_items.py tests/unit/test_version_agreement.py -v` | `.` | 0 | PASS | 29 passed: 20 stub tests, `test_every_line_item_payload_key_is_resolved`, 7 `line_items` tests and the version-agreement test. |
| `uv run --directory . --offline ruff check .` | `.` | 0 | PASS | All checks passed. |
| `uv run --directory . --offline ruff format --check .` | `.` | 0 | PASS | 285 files already formatted, one more than v5: `test_version_agreement.py`. |
| `uv run --directory . --offline mypy src` | `.` | 0 | PASS | No issues in 61 source files. |
| `npm run test` | `.` | 0 | PASS | Vitest: 77 files, 2101 tests passed. |
| `npm run lint` | `.` | 0 | PASS | Checked 180 files. No fixes applied. |
| `npm run format` | `.` | 0 | PASS | Checked 180 files. No fixes applied. |
| `npx tsc --noEmit -p tsconfig.json` | `.` | 0 | PASS | No diagnostics. |
| `npx tsc --noEmit -p tsconfig.e2e.json` | `.` | 0 | PASS | No diagnostics. |
| `npm run build` | `.` | 0 | PASS | Vite: 102 modules. The working tree stayed clean. |
| `uv build --directory . --offline` | `.` | 0 | PASS | Built `dist/factorflow-0.2.0.tar.gz` and `dist/factorflow-0.2.0-py3-none-any.whl`, which reflects EXP-20261107-3's version. |
| `git status --porcelain` (after validation) | `.` | 0 | PASS | Two untracked files and nothing else: this report, and `integration-tests-automation-review-v5.md`, which the concurrent integration review wrote. No implementation file was modified. |
| `uv sync --all-extras`, `npm ci` | `.` | — | NOT-RUN | These install dependencies and are not validation. The lockfile change is the version field alone. |

The plan's test-specific `npx playwright test <six CAP-002 files>` was not run
separately. The full `npm run test:e2e` run covers those 13 tests in the same
single-worker order, and all of them passed with no skip.

## Findings

No new findings. AR-013 and AR-014 are carried forward from v5 unchanged,
because neither the plan nor any spec file has changed since.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-013 | LOW | The plan still describes the key-less state outside its "Resolved 2026-11-07" paragraph. The Summary (lines 47-52) calls every payload key `[REQUIRES INPUT]`. T002 (line 134) forbids adding any financial field. Checked T011 (line 213) expects "the guarded tests reported as skipped". *Task Dependencies* (lines 225-231) omits T014. The Validation Plan's "Expected result today" (line 254) is 9 passed and 4 skipped. The Notes bullet (lines 263-269) says `line_items.py` "keeps all seven … at `REQUIRES_INPUT`", and the Notes call the `xfail` in `test_line_items_resolved.py` something resolution "also removes", though that test now simply passes. The docstrings of `research-after-download.spec.ts` (lines 22-25) and `fix-insufficient-evidence.spec.ts` (lines 25-28) still say the tests skip and that serving the keys "is a further stub task". The fresh result is 31 passed and 0 skipped. | No design is misstated, and traceability holds both ways. But a checked task (T011) and the stated expected result contradict the evidence, and T014 is not placed in the execution order. | Refresh the plan through `$automation-planning`. Rewrite the Summary and the Notes bullet for the resolved state. Mark T002's prohibition as superseded by T014. Change T011 and the Validation Plan to expect 31 passed, with 13 CAP-002 tests passed and 0 skipped. Add "T014 depends on T002; T011 depends on T005 to T010 and T014". In `$automation-coding`, update the two spec docstrings. That is a comment change only, with no assertion change. |
| AR-014 | LOW | TC-E2E-005 expects the universe to keep its n members "even if the filter now matches different stocks". The later run in `universe-from-result.spec.ts` (line 87, `stateHistoryDepth(page, 1)`) builds real scores from stub statements whenever its one-year window holds four filed quarters. Today (2026-11-07) it does, because the 2026-09-30 quarter was filed 2026-11-04. In the weeks before a filing date it does not. Whether the filter's matches change is therefore incidental and depends on the date, and the test never checks it (lines 86-98 assert only that the sorted list is unchanged). The plan's Notes (TC-E2E-005 membership, lines 303-306) say the stronger condition "is exercised once the keys resolve", but nothing exercises it. | The test still asserts that the member list is unchanged. But a regression that re-derived a filter-built universe from its filter at read time would pass whenever the later set happened to match the same stocks. | In `$automation-coding`, after `waitForNewSet`, reapply the same filter on Research and assert that its match list differs from `members` before asserting the universe is unchanged. Alternatively, choose seeded scores so the later stub-built set cannot match the same stocks. Otherwise, record in the plan why the condition is left unasserted. |

## Previous Review Disposition

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v5 AR-013 | LOW | Open, carried forward | The plan's content revision is unchanged (`sha256:43c48e39…5d3a`), and the two spec docstrings are unchanged. |
| v5 AR-014 | LOW | Open, carried forward | `universe-from-result.spec.ts` is unchanged since v4. The test passes [27/31], and the "matches differently" condition is still unasserted. |
| v4 AR-010 | HIGH | Resolved in v5, still resolved | `test_every_line_item_payload_key_is_resolved` passes. `npm run test:e2e`: 31 passed, 0 skipped. TC-E2E-001, TC-E2E-002 after the run, TC-E2E-009 and TC-E2E-010 executed and passed. |
| v3 AR-005, AR-011, AR-012 | LOW, HIGH, LOW | Resolved in v4, still resolved | The 503 path (TC-E2E-009), the 404 path (TC-E2E-010) and `NEWAAA`'s momentum-only Incomplete (TC-E2E-001) pass by execution again. |
| v2 AR-005 to AR-009, v1 AR-001 to AR-004 | HIGH, MEDIUM, LOW | Disposed in v2 to v4 | No change since v5 reopens them. |

## Verdict

**Verdict:** PASS-WITH-WARNINGS

The two expedited changes merged since v5 do not reach this specification's
automation. No e2e file, plan or specification has changed, and the fingerprint
moved only because of files outside this change set. All 12 cases (13 tests)
pass with no skip in a fresh `npm run test:e2e`, the CAP-001 specs still pass
beside them, and every required command exits 0. AR-013 and AR-014 remain LOW
and do not block the gate. They can be taken up in the next
`$automation-planning` or `$automation-coding` pass. The next step is the final
completion check and the owner's approval decision. This review approves
nothing.
