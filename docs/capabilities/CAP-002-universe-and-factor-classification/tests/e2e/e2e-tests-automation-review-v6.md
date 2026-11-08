---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 6
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-11-08T01:28:36Z
reviewed_state_revision: sha256:7d091c138764d9cbfe850d09f8fa100e893cb74d076d1d3823b203bf14fd854e
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
  tool_version: "2.1.318"
  timestamp: 2026-11-08T01:28:36Z
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

Version 5 passed with two LOW findings. Pipeline state now marks it stale
("automation code changed after review").

**What changed since v5.** No e2e automation file changed.
`git diff --stat 4290833 HEAD` over `tests/e2e`,
`tests/unit/test_massive_stub.py`, `scripts/run-e2e-server.sh`, `biome.json`,
`tsconfig.e2e.json`, `playwright.config.ts` and `web` is empty. The test
specification and the task plan are byte-identical to the ones v5 reviewed.

**Why pipeline state flagged it anyway.** The review fingerprint
(`pipeline-state.py` `repository_revision`) hashes every tracked file in the
component outside `docs/` and the root readme, not only the plan's own files.
Eleven such files changed after v5 was written (`4290833`), so the
fingerprint moved from `sha256:a0b0c397…` to `sha256:7d091c13…`:

- EXP-20261107-3 (release 0.2.0) changed `pyproject.toml`, `uv.lock`,
  `package.json`, `package-lock.json` and `README.md`, and added
  `tests/unit/test_version_agreement.py`.
- EXP-20261107-2 changed `tests/integration/test_api_universes.py`.
- Story CAP-002-E2-S10 changed `src/factorflow/classification/sql/momentum_inputs.sql`,
  `tests/integration/engine_support.py`, `tests/integration/engine_proof_support.py`,
  `tests/integration/test_engine_inputs_momentum.py` and
  `tests/integration/test_runner_acquires.py`.

**What of that is e2e-relevant.** Only the production SQL. The e2e suite runs
the real API, runner and classification engine against a stubbed provider.
Five CAP-002 tests build real classification sets: TC-E2E-001, TC-E2E-002
(after the run), TC-E2E-005 (the later run), TC-E2E-009 and TC-E2E-010. Under
DEC-0397, a momentum window is now `missing` unless a `corporate_actions`
coverage segment contains it. The e2e stacks never seed coverage for the
stocks they build. That coverage comes from the real runner. On a successful
corporate-actions fetch, it records one segment from the history-depth start
to the run date (`runner.py:330`, `corporate_actions_range=(depth_start,
self._today)`). That is the same range it requests for prices. Any momentum
window whose start bar was acquired is therefore covered. For TC-E2E-001 that
holds at three years of depth, and NEWAAA keeps its boundary cause (bars start
300 days ago), which ranks before the coverage cause. The version bump
reaches no e2e assertion. No CAP-002 or CAP-001 e2e file mentions a version
string.

A fresh `npm run test:e2e` ran 31 tests: 31 passed and 0 skipped. That
includes TC-E2E-001 with three `card-score` cells on F00, F15 and F29.
Momentum is therefore still scored from stub-acquired data under the new
coverage rule. This review confirms that the B3 change left the e2e cases
meaningful and passing. It does not supply any new e2e behaviour.

The two LOW findings, AR-013 and AR-014, are carried unchanged from v5.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`, v1, `draft`, 12 cases (TC-E2E-001 to 012). Content revision `sha256:e529ea31…`, unchanged since v1. It names no corporate action or coverage segment.
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md`, v1, `draft`, 14 tasks, all checked, `last_reworked_review: e2e-tests-automation-review-v4.md`. Content revision `sha256:43c48e39…`, the same as in v5.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2` (the plan's `Component(s)` line: `FactorFlow-v2`). The branch is `usr/alvaro-de-jodra/CAP-002-E2-S10` and HEAD is `17eac3a`. That is `7c771fc` (S10 doc sync) plus the integration automation review v5 commit, which is documentation only. The run was directed to this branch, so the plan's `Branch:` line (`…-CAP-002-automation-rework`) no longer matches the checkout. That is recorded as an observation, not a finding. No branch was switched.
- **Since v5:** v5 reviewed `b8ff14b`. Its code is identical to that of `4290833` (`git diff --stat b8ff14b 4290833 -- . ':!docs'` is empty). The 11 files listed above are the whole non-docs difference to HEAD.
- **Out of this review's coverage:** `momentum_inputs.sql` and the S10 integration tests (S10 implementation review v2, PASS). `tests/integration/test_api_universes.py` (EXP-20261107-2; integration automation review v5). The version manifests and `tests/unit/test_version_agreement.py` (EXP-20261107-3). This review read the SQL and `runner.py` only to judge their effect on the e2e cases.
- **Working tree:** `git status --porcelain` is empty before and after validation. This clone had no `node_modules`. `npm ci --offline` installed the locked dependencies from the local npm cache, with no network fetch, into the git-ignored `node_modules/`. It changed no tracked file, and the fingerprint is `sha256:7d091c13…` before and after. `npm run build` wrote only to the ignored `src/factorflow/api/static/`, and `uv build` wrote to the scratchpad.
- **Decisions read:** DEC-0397 (momentum requires corporate-actions coverage of its window; the order of missing causes) and DEC-0398 (CAP-002 relies on CAP-001's released coverage contract). DEC-0295, DEC-0285, DEC-0047 and DEC-0181 as in v5.
- **Prerequisites:** `scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` passed every check, with context freshness at 20 h.
- **Production stack:** untouched. The suite uses its own container `factorflow-e2e-postgres` on 55433 and ports 8123 to 8126, none of which overlaps 8000 or 5432.

### Changed Files

The e2e automation's change set is unchanged since v5. The rows below are
v5's files, re-read at HEAD.

| File | Change |
| --- | --- |
| `biome.json` | modified (in `c15c923`): `files.ignore` gains `build/**` (T013). Unchanged since v5. |
| `scripts/run-e2e-server.sh` | modified: 1 s classification poll on the acquisition stack, and the header lists the CAP-002 cases (T001). Unchanged since v5. |
| `tests/e2e/support/massive_stub.py` | modified: per-symbol drift, `NOF*` 404, withheld 503, `NEW*` bars from 300 days ago (T002), and quarterly statements under the `LINE_ITEMS` keys (T014). Unchanged since v5. Its splits and dividends endpoints answer 200 for every symbol in `ok` mode. With the runner, that gives every stub-acquired stock a `corporate_actions` segment over the requested range. |
| `tests/e2e/support/acquisition.ts` | modified: CAP-002 tables in `DATA_TABLES` (including `coverage_segment`, so each test starts from an empty store), `withholdSymbol`, `restoreSymbol` (T003). Unchanged since v5. |
| `tests/e2e/support/classification.ts` | added: seeding, follow, universe, retire, set-wait and `skipUnlessLineItemsResolved` fixtures (T004). Unchanged since v5. `seedScoredStore` seeds `prices` coverage only, and that is still enough: seeded sets are written directly and never built, and universe acceptance counts any data type (`coverage_check.sql`). |
| `tests/e2e/research-after-download.spec.ts` | added: TC-E2E-001 and TC-E2E-002 (T005). Unchanged since v5. |
| `tests/e2e/universe-by-hand.spec.ts` | added: TC-E2E-003 and TC-E2E-004 (T006). Unchanged since v5. |
| `tests/e2e/universe-from-result.spec.ts` | added: TC-E2E-005 and TC-E2E-006 (T007). Unchanged since v5. |
| `tests/e2e/compare-and-evidence.spec.ts` | added: TC-E2E-007 and TC-E2E-008 (T008). Unchanged since v5. |
| `tests/e2e/fix-insufficient-evidence.spec.ts` | added: TC-E2E-009 and TC-E2E-010 (T009). Unchanged since v5. |
| `tests/e2e/universe-maintenance.spec.ts` | added: TC-E2E-011 and TC-E2E-012 (T010). Unchanged since v5. |
| `tests/unit/test_massive_stub.py` | added: 20 tests of the stub (T002, T014). Unchanged since v5. |
| `tsconfig.e2e.json` | added: type-checks `tests/e2e` and `playwright.config.ts` (T013). Unchanged since v5. |

## Test Case and Traceability Verification

Every TC-ID maps to a test whose title carries the ID and whose body carries
`// Implements TC-E2E-NNN`. TC-E2E-002 maps to two tests. No spec or support
file changed, so traceability is as v5 verified it: bidirectional, with T014
tracing to TC-E2E-001, 002, 009 and 010. Step numbers below are from the fresh
run's `[n/31]` lines.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/research-after-download.spec.ts` › "TC-E2E-001: a succeeded run leaves every stock scored…" | Built set; affected by DEC-0397. Passed ([20/31]). At three years of depth, the runner's corporate-actions segment runs from the depth start to the run date and contains the 3-, 6- and 12-month windows. Momentum therefore stays scored: three percentiles per drawn row, and `card-score` ×3 on F00, F15 and F29. NEWAAA still reads momentum Incomplete, "12-month total return …". Its S_12 bar is absent, and a missing boundary ranks before the coverage cause (DEC-0397), so the title is unchanged. |
| TC-E2E-002 | VERIFIED | same file › "…before any run…" and "…after a run with 20 stocks…" | Both passed ([18/31], [19/31]). After the run, 20 covered stocks qualify on every factor, so "20 qualified, 30 needed" and the 60 "Not enough to rank" cells hold for momentum as before. |
| TC-E2E-003 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` › TC-E2E-003 | Seeded set; unaffected. Passed ([25/31]). |
| TC-E2E-004 | VERIFIED | same file › TC-E2E-004 | Seeded; unaffected. Passed ([26/31]). |
| TC-E2E-005 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` › TC-E2E-005 | Passed ([27/31]). The later run uses one year of depth. The runner covers corporate actions from that depth start, which is also where the stub's bars start. So a window whose S_k bar exists is covered, and one without that bar already failed on its boundary before B3. The later set's momentum is therefore the same as before DEC-0397, and AR-014's analysis is unchanged. |
| TC-E2E-006 | VERIFIED | same file › TC-E2E-006 | Seeded; unaffected. Passed ([28/31]). |
| TC-E2E-007 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` › TC-E2E-007 | Seeded; unaffected. Passed ([6/31]). |
| TC-E2E-008 | VERIFIED | same file › TC-E2E-008 | Seeded; unaffected. Passed ([7/31]). |
| TC-E2E-009 | VERIFIED | `tests/e2e/fix-insufficient-evidence.spec.ts` › TC-E2E-009 | Built sets; affected by DEC-0397. Passed ([13/31]). Withholding answers 503 on BBB's statements only, and its splits and dividends still answer 200, so BBB's momentum stays covered. The incomplete factor is still growth alone. After `restoreSymbol`, growth scores, and Earlier scores lists 1 row, then 2. |
| TC-E2E-010 | VERIFIED | same file › TC-E2E-010 | Built sets; affected by DEC-0397. Passed ([14/31]). `NOF*` gets 404 on statements only, so its momentum stays covered and the growth cell is the only Incomplete one, as asserted. |
| TC-E2E-011 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` › TC-E2E-011 | Seeded; unaffected. Passed ([29/31]). |
| TC-E2E-012 | VERIFIED | same file › TC-E2E-012 | Seeded; unaffected. Passed ([30/31]). |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `scripts/run-e2e-server.sh` | Unchanged. |
| T002 | VERIFIED | `tests/e2e/support/massive_stub.py`, `tests/unit/test_massive_stub.py` | Unchanged; the stub unit tests pass. The "do not add any financial field" sentence is still superseded by T014 (AR-013). |
| T003 | VERIFIED | `tests/e2e/support/acquisition.ts` | Unchanged. `coverage_segment` is in `DATA_TABLES`, so no test inherits coverage from another. |
| T004 | VERIFIED | `tests/e2e/support/classification.ts` | Unchanged. `skipUnlessLineItemsResolved` does not skip. |
| T005 | VERIFIED | `tests/e2e/research-after-download.spec.ts` | All three tests pass. |
| T006 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` | Unchanged; passes. |
| T007 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` | Unchanged; passes (AR-014). |
| T008 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` | Unchanged; passes. |
| T009 | VERIFIED | `tests/e2e/fix-insufficient-evidence.spec.ts` | Both tests pass within their timeouts. |
| T010 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` | Unchanged; passes. |
| T011 | VERIFIED | full suite | 31 passed, 0 skipped. The checked task text still expects guarded skips (AR-013). |
| T012 | VERIFIED | full suite | One worker, `resetAcquisitionStore` per test. The suite passed with the five building tests interleaved among the CAP-001 specs, and the `posttest:e2e` cleanup ran. |
| T013 | VERIFIED | gate commands | `tsc -p tsconfig.e2e.json`, `npm run lint`, `npm run format`, `ruff check`, `ruff format --check`, `mypy src`, the stub unit tests and `pytest -m 'not postgres'` all exit 0. |
| T014 | VERIFIED | `tests/e2e/support/massive_stub.py`, `tests/unit/test_massive_stub.py` | Unchanged since v5, which verified it against the task text. Still missing from the Dependencies section (AR-013). |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2`, written `.`
below. In the sandbox, `uv` could not open its cache ("Failed to initialize
cache … Operation not permitted"), and Docker refused the socket ("connect:
operation not permitted"). So every `uv`, Docker-backed and `npm` command
that needed them ran outside the sandbox as one plain call, with the directory
given by `--directory` or `--prefix`. `-p no:cacheprovider` kept pytest from
writing `.pytest_cache`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run test:e2e` | `.` | 0 | PASS | 31 tests: **31 passed, 0 skipped** (3.9 min). This is all 13 CAP-002 tests and all 18 CAP-001 and stack tests. The output has 0 "skipped" lines and 0 "has no payload key" lines. The stub served 163 split and 156 dividend requests and 110 `F*` income-statement requests. Its status lines are 1536 × 200, 6 × 404 (`NOF*`/not-found paths) and 27 × 503 (withheld or unavailable). `posttest:e2e` removed the e2e container. |
| `uv run pytest` | `.` | 0 | PASS | 2629 passed in 467.67 s, through testcontainers, including `postgres` and `slow`. No skip or xfail. |
| `uv run pytest -m 'not postgres'` | `.` | 0 | PASS | 1659 passed, 970 deselected (v5: 1658; `test_version_agreement.py` is new) |
| `uv run pytest tests/unit/test_massive_stub.py tests/unit/test_line_items_resolved.py tests/unit/test_line_items.py tests/unit/test_version_agreement.py` | `.` | 0 | PASS | 29 passed: v5's 28 plus the version-agreement test |
| `uv run ruff check .` | `.` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `.` | 0 | PASS | 285 files already formatted |
| `uv run mypy src` | `.` | 0 | PASS | No issues in 61 source files |
| `npm run test` | `.` | 0 | PASS | Vitest: 77 files, 2101 tests passed, in four consecutive runs and one more `npx vitest run`. The first run, started while the full `uv run pytest` was loading the machine, reported 1 failed and 2100 passed (exit 1). Its output was captured only through `tail`, so the failing test's name was lost. It did not recur in five reruns. No frontend or Vitest file changed since v5. See the observations. |
| `npm run lint` | `.` | 0 | PASS | Checked 180 files. No fixes applied. |
| `npm run format` | `.` | 0 | PASS | Checked 180 files. No fixes applied. |
| `npx tsc --noEmit -p tsconfig.json` | `.` | 0 | PASS | No diagnostics |
| `npx tsc --noEmit -p tsconfig.e2e.json` | `.` | 0 | PASS | No diagnostics |
| `npm run build` | `.` | 0 | PASS | Vite build; output to the ignored `src/factorflow/api/static/` |
| `uv build` (`--out-dir <scratchpad>/dist`) | `.` | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` |
| `git status --porcelain` (after validation) | `.` | 0 | PASS | Empty |
| `npm ci --offline` | `.` | 0 | n/a | Environment setup, not validation: 250 packages from the local cache into the ignored `node_modules/`. `allow-scripts` skipped the install scripts of `@biomejs/biome`, `esbuild` and `fsevents`, and every command above still ran. |
| `uv sync --all-extras` | `.` | — | NOT-RUN | Installs dependencies; not validation. `.venv` was already present. |

The plan's test-specific `npx playwright test <six CAP-002 files>` was not run
separately. The full `npm run test:e2e` run covers those 13 tests in the same
single-worker order, and all of them passed with no skip.

## Findings

Both findings are carried from v5. The plan and every e2e file are
byte-identical, so the evidence for each is unchanged.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-013 | LOW | Carried from v5, unchanged. The plan's Summary and Notes bullet still describe the key-less state. T002 still forbids adding financial fields. The checked T011 still expects "the guarded tests reported as skipped". *Task Dependencies* still omits T014. The Validation Plan's "Expected result today" is still 9 passed and 4 skipped. The docstrings of `research-after-download.spec.ts` and `fix-insufficient-evidence.spec.ts` still say the tests "skip". The fresh result is 31 passed, 0 skipped. | No design is misstated, and traceability holds. But a checked task and the stated expected result contradict the evidence, and T014 is not placed in the execution order. | As in v5: refresh the plan through `$automation-planning` for the resolved state. Change T011 and the Validation Plan to expect 31 passed and 13 CAP-002 passed with 0 skipped. Add the T014 dependency lines. Update the two spec docstrings in `$automation-coding` (comments only). |
| AR-014 | LOW | Carried from v5. TC-E2E-005 expects the universe to keep its members "even if the filter now matches different stocks", and the test never checks that the later set matches differently. DEC-0397 does not change this. At the later run's one year of depth, corporate-actions coverage starts where the stub's bars start, so every momentum window that has its start bar is covered. The later set's momentum, and so the filter's later matches, are what they were in v5. Whether the matches differ is still incidental and date-dependent. | The test passes and asserts the same sorted member list. But a regression that re-derives a filter-built universe from its filter at read time would pass whenever the later set happens to match the same stocks. | As in v5: in `$automation-coding`, after `waitForNewSet`, reapply the filter on Research and assert that its matches differ from `members` before asserting that the universe is unchanged. Or seed scores the later stub-built set cannot reproduce, or record in the plan why the condition is left unasserted. |

Observations, none a finding:

- **No e2e case covers the uncovered side of DEC-0397.** No CAP-002 e2e test
  shows a stock whose momentum is missing because corporate actions were not
  covered, or the data health message for it. The coverage matrix maps
  DAC-E2-13 and DAC-E2-S10-1 to -7 to component tests only (TC-COMP-381 to
  387), with no TC-E2E column. `web/` has no reference to
  `corporate_actions_not_covered`, so how the interface words that cause is
  not proven end to end. Adding such a case is `$test-design`'s call.
- **Stub coverage is optimistic.** Every `ok`-mode corporate-actions request
  succeeds. The e2e suite therefore never meets a stock whose corporate
  actions failed while its prices succeeded. DEC-0398 assigns that path to
  CAP-001's runner contract, which TC-COMP-387 guards.
- **Transient Vitest failure.** One unidentified Vitest test failed once,
  under heavy concurrent load, and then passed five times. The suite is
  outside this specification's change set, and no web file changed since v5.
  If it recurs, the owner should capture the test name in full output and
  treat it as a separate flake.
- **Plan `Branch:` line.** It names `usr/alvaro-de-jodra/CAP-002-automation-rework`,
  while this review ran on `usr/alvaro-de-jodra/CAP-002-E2-S10` as directed.
  The automation is unchanged, so this does not affect the evidence.

## Previous Review Disposition

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v5 AR-013 | LOW | Still open, carried | Plan content revision unchanged (`sha256:43c48e39…`); spec docstrings unchanged |
| v5 AR-014 | LOW | Still open, carried | `universe-from-result.spec.ts` unchanged. DEC-0397 leaves the later set's momentum as before (see the TC-E2E-005 row). |
| v4 AR-010 | HIGH | Resolved in v5, still resolved | `npm run test:e2e`: 31 passed, 0 skipped |
| v3 AR-005, AR-011, AR-012; v2 AR-005 to AR-009; v1 AR-001 to AR-004 | HIGH, MEDIUM, LOW | Disposed in v2 to v5 | No e2e file changed since v5, so none reopens |

The staleness is resolved by this review. The fingerprint moved because of
code outside this specification's automation. The one e2e-relevant part, the
DEC-0397 momentum SQL, leaves every CAP-002 e2e case passing with unchanged
assertions.

## Verdict

**Verdict:** PASS-WITH-WARNINGS

No e2e automation file, test specification or task plan changed since v5. The
fingerprint moved because of S10's production SQL and integration seeds,
EXP-20261107-2's integration fixture and EXP-20261107-3's version bump. Of
these, only the momentum SQL reaches the e2e cases. They still pass, 31 of 31
with no skip, because the real runner records corporate-actions coverage over
the range it acquires. All 15 required commands exit 0. The two LOW findings
from v5 remain and do not block the gate. The next step is the final
completion check and the owner's approval decision. This review approves
nothing.
