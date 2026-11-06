---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-11-06T00:03:03Z
reviewed_state_revision: sha256:7c5fcf2ba4efd50ed220589d646dafb9ed3479a81273c1b8785fc8401ca5ebf1
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-e2e-tests
    artifact_version: 1
    content_revision: sha256:e529ea318ca109793c398143b5fceb6c358e3acd27a065b78a14412b85ec8667
  - artifact_id: CAP-002-e2e-tests-automation-tasks
    artifact_version: 1
    content_revision: sha256:38ebb6e8341b08299b03f9c87b4ec22b1ddbf1a4eba930c63f06a26232e4e792
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-06T00:03:03Z
  source_artifacts:
    - id: CAP-002-e2e-tests
      version: "1"
    - id: CAP-002-e2e-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-e2e-tests — Version 2

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **CHANGES-REQUIRED** |
| Test cases | 12/12 |
| Automation tasks | 6/13 |
| Required commands | 10/13 |
| Findings | 5 |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 4 · **total 5**

The rework does what review v1 asked of the code. All twelve cases now execute
against a real run and build on the acquisition stack, and none is skipped. The
full suite passes 31/31, and the CAP-002 files pass 13/13 together and alone.
v1 AR-001 to AR-004 are resolved in code.

The gate still does not pass, because the task plan was not revised. Review v1
said to route the guard removal through `$automation-planning`. The rework
instead recorded DEC-0290 and edited only `last_reworked_review`. Five checked
tasks and the Validation Plan now describe the reverse of what was built: a
guard that no longer exists, a stub that must add no financial field, and four
expected skips. Three new support pieces trace to no task (AR-007; DEC-0291).
No test code needs to change for AR-007. Only the plan does.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`, v1, `draft`, 12 cases (TC-E2E-001 to 012). Unchanged since review v1 (same content revision).
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md`, v1, `draft`, 13 tasks all checked. Since v1 it changed only by `last_reworked_review: e2e-tests-automation-review-v1.md`. Its `Branch` line still names `usr/alvaro-de-jodra/CAP-002-automation`, while the work is on `usr/alvaro-de-jodra/CAP-002-automation-2`.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2` (the plan's `Component(s)` line: `FactorFlow-v2`), branch `usr/alvaro-de-jodra/CAP-002-automation-2`, HEAD `fb9b2844a37e4f7b46c73a9df9a11a207e9d486a`.
- **Base:** `46e0219` (merge of PR #171). Change-set commits for this specification: `97b98dc` (plan), `b2b673d` (T001 to T010), `ad99025` (T005), `dbbc657` (T011 to T013), `82f61d9` (review v1) and `fb9b284` (rework of v1 AR-001 to AR-004, `Decision-Id: DEC-0290`). `763517d` and `24c5053` belong to the integration specification and are outside this review.
- **Working tree:** clean before and after the review, including after `npm run build` (`git status --porcelain` printed nothing). The fingerprint was taken before and after validation and was identical both times.
- **Decisions read:** DEC-0285 (PROVISIONAL guard; blind second opinion disagreed, `triage: review`), DEC-0288 (T013 over the `build/` lint failure), DEC-0289 (v1 gate call), DEC-0290 (PROVISIONAL: rework without a plan revision). None is owner-reviewed. This review records DEC-0291.

### Changed Files

| File | Change |
| --- | --- |
| `scripts/run-e2e-server.sh` | modified: 1 s classification poll on the acquisition stack (T001). Since v1 the acquisition API also starts through `tests/e2e/support/api_e2e_main.py` (DEC-0290) |
| `tests/e2e/support/massive_stub.py` | modified: per-symbol price drift (T002). Since v1 it serves quarterly statements carrying test payload keys, `NOF*` answers 404, `GAP*` omits diluted EPS, and new `withhold` and `restore` controls answer 503 for one symbol |
| `tests/e2e/support/acquisition.ts` | modified: CAP-002 tables in `DATA_TABLES`, `no-fundamentals` in `ProviderMode` (T003). Since v1 it adds `withholdSymbol` and `restoreSymbol` |
| `tests/e2e/support/classification.ts` | added: seeding, follow, universe, retire and set-wait fixtures (T004). Since v1 `skipUnlessLineItemsResolved` is removed |
| `tests/e2e/support/api_e2e_main.py` | added since v1: a test-only API entry point. It installs `E2E_LINE_ITEMS` into `line_items.LINE_ITEMS`, then runs `factorflow.app_main.main` |
| `tests/e2e/support/e2e_line_items.py` | added since v1: test payload keys for the seven line items |
| `tests/e2e/research-after-download.spec.ts` | added: TC-E2E-001, TC-E2E-002 (T005). Guard removed, history depth 3, assertions strengthened |
| `tests/e2e/universe-by-hand.spec.ts` | added: TC-E2E-003, TC-E2E-004 (T006) |
| `tests/e2e/universe-from-result.spec.ts` | added: TC-E2E-005, TC-E2E-006 (T007) |
| `tests/e2e/compare-and-evidence.spec.ts` | added: TC-E2E-007, TC-E2E-008 (T008). Since v1 momentum is seeded non-monotone and the sort is asserted as an exact order |
| `tests/e2e/fix-insufficient-evidence.spec.ts` | added: TC-E2E-009, TC-E2E-010 (T009). Guard removed, BBB withheld and then restored, a third run added for history order |
| `tests/e2e/universe-maintenance.spec.ts` | added: TC-E2E-011, TC-E2E-012 (T010) |
| `tests/unit/test_run_e2e_server_script.py` | modified since v1: the pinned acquisition API launch line now names `api_e2e_main.py` (TC-COMP-380). No task plans this change |

## Test Case and Traceability Verification

Every TC-ID maps to a titled test carrying `// Implements TC-E2E-NNN`.
TC-E2E-002 maps to two tests, as the plan's Notes say. Every test now executes.
TC-ID to test traceability is bidirectional. The task-side traceability fails
(AR-007).

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/research-after-download.spec.ts` › "TC-E2E-001: a succeeded run leaves every stock scored…" | Real run with 31 stocks, history depth 3, outcome Succeeded, then Research with "31 stocks match". Every drawn row has 3 whole-number percentiles, and they are not all alike. F00's evidence page shows 3 `card-score`. The as-of line matches `Scores from … C[SD]T` and links to `/runs/{runId}`. GAPAAA scores on value and momentum, reads Incomplete on growth, and its title names "earnings-per-share growth". The score is read for one stock only (AR-009). |
| TC-E2E-002 | VERIFIED | same file › "TC-E2E-002: before any run…" and "…after a run with 20 stocks…" | The before-run test is unchanged. The after-run test now executes: 20 rows, 60 cells all "Not enough to rank", no percentile, and each header reads `\d+ qualified, 30 needed`. The qualified count is not pinned to 20 (AR-009). |
| TC-E2E-003 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` › TC-E2E-003 | Unchanged since v1, passes. |
| TC-E2E-004 | VERIFIED | same file › TC-E2E-004 | Unchanged since v1, passes. |
| TC-E2E-005 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` › TC-E2E-005 | Unchanged since v1, passes. The later real run now scores value and growth through the test keys, so "the filter matches differently" happens for real and the membership still holds. |
| TC-E2E-006 | VERIFIED | same file › TC-E2E-006 | Unchanged since v1, passes. |
| TC-E2E-007 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` › TC-E2E-007 | Momentum is seeded as AAA 50, CCC 90, DDD 10, EEE 30, against symbol order AAA, CCC, DDD, EEE. The test asserts `aria-sort="ascending"` on the Momentum header and the exact order DDD, EEE, AAA, CCC. A sort that did nothing would leave AAA, CCC, DDD, EEE, so the assertion now fails on that regression. |
| TC-E2E-008 | VERIFIED | same file › TC-E2E-008 | Unchanged since v1, passes. |
| TC-E2E-009 | VERIFIED | `tests/e2e/fix-insufficient-evidence.spec.ts` › TC-E2E-009 | BBB is withheld (503), and the growth card reads exactly "Growth for BBB couldn't be scored: revenue growth is missing." plus the next-download recovery and the Data health link. After restore and a new set, growth shows a percentile and a score. Earlier scores first holds 1 Incomplete row, then after a third run 2 rows: the classified one first, the Incomplete one second, with dates in `YYYY-MM-DD` and produced times in Chicago. The Partial and Succeeded outcomes the spec names are not asserted (AR-009). |
| TC-E2E-010 | VERIFIED | same file › TC-E2E-010 | NOFCCC's statements answer 404. The growth card reads "the provider reports no…" and "No action in FactorFlow changes this." with no Data health link. After a second run the cell is still Incomplete with the same reason. |
| TC-E2E-011 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` › TC-E2E-011 | Unchanged since v1, passes. |
| TC-E2E-012 | VERIFIED | same file › TC-E2E-012 | Unchanged since v1, passes. |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `scripts/run-e2e-server.sh` | The poll interval is as planned. The API launch-line change is beyond the task (AR-007). |
| T002 | PARTIAL | `tests/e2e/support/massive_stub.py` | The task says `NOF*` answers 200 with an empty list. The code answers 404. The task also says "Do **not** vary fundamentals values or add any financial field". The stub now serves 16 quarters of varying statements under seven test keys, plus `GAP*` and `withhold`/`restore` (AR-007). The planned `no-fundamentals` mode is still there but no test uses it (AR-008). |
| T003 | VERIFIED | `tests/e2e/support/acquisition.ts` | As planned. The `withholdSymbol` and `restoreSymbol` exports are unplanned (AR-007). |
| T004 | PARTIAL | `tests/e2e/support/classification.ts` | The task still lists `skipUnlessLineItemsResolved`, which was deleted. `followStocks`, `seedUniverseRecorded` and the extra inserts are still unplanned (AR-005, AR-007). |
| T005 | PARTIAL | `tests/e2e/research-after-download.spec.ts` | The task marks TC-E2E-001 and the after-run TC-E2E-002 test as **guarded**. They are unguarded and pass. The task's "lacking one input (`NOF` prefix)" is `GAP` in the code (AR-007). |
| T006 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` | Matches the task. |
| T007 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` | Matches the task. |
| T008 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` | Matches the task. The v1 sort gap is closed. |
| T009 | PARTIAL | `tests/e2e/fix-insufficient-evidence.spec.ts` | The task says "both **guarded**" and "set the stub to `no-fundamentals`". The code is unguarded, uses `withholdSymbol("BBB")`, and adds a third run (AR-007). |
| T010 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` | Matches the task, apart from the SQL precondition already noted (AR-005). |
| T011 | PARTIAL | full suite | The task expects "the guarded tests reported as skipped with the DEC-0285 reason". The actual result is 31 passed and 0 skipped. That is the better outcome, but the plan claims the opposite (AR-007). |
| T012 | PARTIAL | isolation runs | Isolation holds: each reworked file passes alone, the six pass together, and the stub's `reset` clears `withheld`. The leftover `no-fundamentals` path was not removed (AR-008). |
| T013 | PARTIAL | gate commands | `npm run lint` and `npm run format` still exit 1 on `build/` (AR-006). `npx tsc --noEmit` still does not cover `tests/e2e/` (AR-005). |

## Independent Validation

All commands ran in `repos/factorflow-v2/FactorFlow-v2` (`.`). Commands that need
the Docker socket or the `uv` cache were sent outside the sandbox as one plain
call each, using `--prefix` or `--directory` instead of `cd`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run test:e2e` | `.` | 0 | PASS | 31 passed, 0 skipped, 3.8 min. |
| `npm run test:e2e -- <the six CAP-002 files> --reporter=list` (the plan's test-specific `npx playwright test …`) | `.` | 0 | PASS | 13 passed (54.6 s), none skipped. The plan expected 9 passed and 4 skipped (AR-007). |
| `npm run test:e2e -- tests/e2e/fix-insufficient-evidence.spec.ts --reporter=list` | `.` | 0 | PASS | 2 passed (TC-E2E-009 10.0 s, TC-E2E-010 8.3 s). The "line item … has no payload key" warnings are printed once per stack start, by the main stack on 8123. The acquisition API prints none. |
| `npm run test:e2e -- tests/e2e/research-after-download.spec.ts tests/e2e/compare-and-evidence.spec.ts --reporter=dot` | `.` | 0 | PASS | 5 passed (30.9 s). |
| `uv run --directory . --offline pytest -q` | `.` | 0 | PASS | 2555 passed, 1 xfailed in 310 s, with the `postgres` suites. Includes the updated `tests/unit/test_run_e2e_server_script.py`. |
| `uv run --directory . --offline pytest -q -m "not postgres"` | `.` | 0 | PASS | 1636 passed, 919 deselected, 1 xfailed (`test_line_items_resolved.py`, the owner signal, still xfail). Nothing under `tests/e2e/` collected. |
| `uv run --directory . --offline ruff check .` | `.` | 0 | PASS | All checks passed. This covers the new `tests/e2e/support/*.py`. |
| `uv run --directory . --offline ruff format --check .` | `.` | 0 | PASS | 281 files already formatted. |
| `uv run --directory . --offline mypy src` | `.` | 0 | PASS | No issues in 61 source files. `tests/` is outside its scope. |
| `npm run test` | `.` | 0 | PASS | Vitest: 77 files, 2101 tests passed. |
| `npm run lint` | `.` | 1 | FAIL | "Checked 190 files … Found 200 errors". Every printed diagnostic is in `./build/lib/factorflow/api/static/assets/index-*.js`, the gitignored `uv build` output (`git check-ignore build` → `build`). Supplementary `npx biome lint` over every tracked `*.ts`, `*.tsx`, `*.js` and `*.json` (`git ls-files`): exit 0, 180 files. |
| `npm run format` | `.` | 1 | FAIL | "Found 10 errors", all in the ten `./build/lib/.../index-*.js` bundles. Supplementary `npx biome format` over the same tracked files: exit 0, 180 files. |
| `npx tsc --noEmit` | `.` | 0 | PASS | Covers `web/src` only. Supplementary `npx tsc --noEmit --strict --skipLibCheck --target es2022 --module esnext --moduleResolution bundler --lib es2022,dom --types node tests/e2e/*.spec.ts tests/e2e/support/classification.ts tests/e2e/support/acquisition.ts`: exit 0. |
| `npm run build` | `.` | 0 | PASS | Vite built in 873 ms. Working tree still clean. |
| `uv build --directory . --offline` | `.` | — | NOT-RUN | Inside the sandbox: "error: Failed to initialize cache at `/Users/alvarodejodra/.cache/uv` … Operation not permitted (os error 1)". The plain call outside the sandbox was refused by the permission system ("Permission to use Bash has been denied"). No file in this change set is packaged: the wheel ships `src/` only. |
| `uv sync --all-extras`, `npm ci` | `.` | — | NOT-RUN | Dependency installs, not validation. No lockfile is in the change set. |

## Findings

New findings are numbered from AR-007 so that no ID is reused. AR-005 and
AR-006 are carried open from v1 with their IDs.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-005 | LOW | Carried from v1, unchanged. `followStocks` and `seedUniverseRecorded` (`tests/e2e/support/classification.ts`) seed preconditions by SQL. T010 says "via API", and T004 lists neither helper. T013's `npx tsc --noEmit` uses `tsconfig.json` `include: ["web/src"]`, so it does not reach `tests/e2e/` (the supplementary strict `tsc` is clean). | The plan does not describe what was built, and its type-check gate does not cover the changed TypeScript. | In the plan revision AR-007 requires, record the SQL preconditions and their reason, and type-check `tests/e2e/` in T013. |
| AR-006 | LOW | Carried from v1, unchanged. `npm run lint` and `npm run format` exit 1 only on the gitignored `build/lib/factorflow/api/static/assets/` bundles (DEC-0288). | Two required tech-stack commands cannot show green on this checkout, for a reason outside the change set. | Outside this change set: make `biome.json` ignore `build/`, or clear `build/` before the gate. This is the owner follow-up DEC-0288 names. |
| AR-007 | HIGH | `e2e-tests-automation-tasks.md` changed only by `last_reworked_review`. Checked tasks contradict the code. T002 says `NOF*` answers "`200` and an empty `results` list" and "Do **not** vary fundamentals values or add any financial field", but `massive_stub.py` answers 404 for `NOF*` and serves 16 quarters of statements under seven test keys. T004 lists `skipUnlessLineItemsResolved`, which `fb9b284` deleted. T005 and T009 say "**guarded**", and T009 says "set the stub to `no-fundamentals`", but the code is unguarded and uses `withholdSymbol`. T011 and the Validation Plan expect "9 passing … and 4 skipped with the DEC-0285 reason", but the actual result is 13 passed and 0 skipped. The Summary and Notes say "the plan neither invents the keys" and that the guard holds "until the owner resolves question 1". `api_e2e_main.py`, `e2e_line_items.py`, the `withhold`/`restore` controls, the `GAP*` rule and the edit to `tests/unit/test_run_e2e_server_script.py` trace to no task. Review v1 directed this change through `$automation-planning`. DEC-0290 skipped that step and left the plan stale on purpose. | Task-to-implementation traceability fails in both directions. Five checked tasks claim things the code contradicts, and three support pieces have no task. If this gate passed, it would close on a plan that encodes the opposite design (DEC-0285's guard) from the one shipped (DEC-0290's test keys). Neither PROVISIONAL decision is owner-reviewed. | Revise the plan through `$automation-planning`. Replace the guard with the test-payload-key approach (entry point, test keys, stub statements, `GAP*`, `NOF*` 404, `withhold`/`restore`, the unit-test launch-line update). Correct T002, T004, T005, T009, T011, the Summary, the Notes and the Validation Plan's expected result (13 passed, 0 skipped). Fix the `Branch` line. Then re-review. AR-007 requires no test-code change. The owner may also settle DEC-0285 against DEC-0290 at the same time. |
| AR-008 | LOW | `massive_stub.py` still accepts `POST /__stub/mode {"mode": "no-fundamentals"}`, and `acquisition.ts` `ProviderMode` still lists it. Since `fb9b284` no spec sets it (`grep -rn no-fundamentals tests/e2e` finds only the stub, its docstring and the type). | Dead fixture code. T012 asks to remove leftover helpers. | Remove the mode, or keep it on purpose and say so in the revised plan. |
| AR-009 | LOW | TC-E2E-009's `runAndWait` accepts `["succeeded", "partial"]` for both runs. So the spec's "after a partial acquisition run" precondition and its step 2 "waits for the run to end as succeeded" are never asserted. TC-E2E-002's after-run headers match `\d+ qualified, 30 needed`, not the 20 the test set up, although the plan's Notes say the test "asserts the count it set up". TC-E2E-001 reads the standardised score on F00's evidence page only. The Research table shows no score by design (`showScore` is set only in the inspector and the history tab). | Narrow gaps. Partial-then-Succeeded outcomes, a wrong qualified count, or one stock missing its score would not be caught by these assertions. Neighbouring assertions make the first gap unlikely to hide a real regression. | Assert the first run's outcome Partial and the second Succeeded in TC-E2E-009. Pin "20 qualified, 30 needed" in TC-E2E-002. Optionally read the score of more than one stock in TC-E2E-001. Not blocking. |

## Previous Review Disposition

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v1 AR-001 | HIGH | Resolved in code. The plan side is reopened as AR-007. | The guard is deleted. The acquisition API installs test payload keys through `tests/e2e/support/api_e2e_main.py`, so `engine.py` reads them at call time with no `src/` change, and the stub serves matching statements. TC-E2E-001, 009, 010 and the after-run half of 002 execute and pass in the full suite, in the six-file run and alone. The remediation route v1 named (through `$automation-planning`) was not followed (AR-007). |
| v1 AR-002 | MEDIUM | Resolved | The after-run TC-E2E-002 test is unguarded and passes: 60 "Not enough to rank" cells and no percentile. |
| v1 AR-003 | MEDIUM | Resolved | Momentum is seeded non-monotone in symbol order. `aria-sort="ascending"` and the exact order DDD, EEE, AAA, CCC are asserted, and a no-op sort would fail. |
| v1 AR-004 | MEDIUM | Resolved, with a LOW residual in AR-009 | TC-E2E-001 now asserts the Chicago zone (`C[SD]T`) on the as-of line and its link, three whole-number percentiles on every drawn row, the score on the evidence page, and the input named in the Incomplete title ("earnings-per-share growth"). TC-E2E-009 asserts the full statement naming the missing input ("revenue growth is missing"; for a missing input the designed statement carries no outdated-rule clause), the recovery, and newest-first order by row position over two rows. |
| v1 AR-005 | LOW | Open, carried as AR-005 | The plan was not revised and `tsconfig.json` is unchanged. |
| v1 AR-006 | LOW | Open, carried as AR-006 | `npm run lint` and `npm run format` still exit 1 on `build/` only. |

## Verdict

**Verdict:** CHANGES-REQUIRED

The automation is sound. All 12 cases execute and pass, alone and together, and
the CAP-001 suite stays green. The task plan, though, contradicts the code and
leaves new support code untraced (AR-007, HIGH). Route this to
`$automation-planning` for a plan revision, then back to `$automation-coding`
only for any plan-confirmation tick, then to a new `$automation-review`. Fixing
AR-008 and AR-009 in the same cycle would help, but neither blocks. AR-005 belongs
in the same plan revision. AR-006 is outside this change set. The gate decision
is recorded as DEC-0291.

`uv build` could not be run here (sandbox cache denial, then a refused
permission). A later passing verdict needs it run, or the owner must accept it
as not applicable to a change set with no packaged file.
