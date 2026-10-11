---
artifact_schema_version: 1
artifact_id: CAP-001-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-11
updated: 2026-10-11
test_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-10-11T23:05:37Z
reviewed_state_revision: sha256:1975a3c7429c33d50606b57d65e16764bb0d3150aea1d9793f4890bdd211928b
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-e2e-tests
    artifact_version: 1
    content_revision: sha256:7b5ef5a7e799872fc703a2191e72a28ed85a7a864d6aafcc36b56ae2ac9954c3
  - artifact_id: CAP-001-e2e-tests-automation-tasks
    artifact_version: 2
    content_revision: sha256:e0c225c7b856bc76a92e9c279fc761a226fa6b74a8ba4be3710a4598b586edce
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-11T23:05:37Z
  source_artifacts:
    - id: CAP-001-e2e-tests
      version: "1"
    - id: CAP-001-e2e-tests-automation-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Review: CAP-001-e2e-tests — Version 2

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 10/12 fully verified (TC-E2E-005 and TC-E2E-009 PARTIAL; none missing) |
| Automation tasks | 13/16 fully verified (T009, T012, T016 PARTIAL; none not implemented) |
| Required commands | 14/14 passed |
| Findings | 5 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 3 · **total 5**

This re-review ran unattended under `$automation-run` (`docs/unattended-mode.md`).
It was triggered by `pipeline-state.py` reporting "automation code changed
after review" for v1. Under `owner-allowed` the same owner may act on this
review, and no second reviewer is needed. This review records evidence only. It
approves nothing.

## Review Subject

| Item | Value |
| --- | --- |
| Test specification | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md` (CAP-001-e2e-tests v1, draft; content revision unchanged since v1) |
| Automation task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md` (CAP-001-e2e-tests-automation-tasks v2, draft; all 16 tasks checked; content revision unchanged since v1) |
| Component repository | `repos/factorflow-v2/FactorFlow-v2` (`FactorFlow-v2`, the plan's only `Component(s)` entry; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-automation` at `65b95a4a1b5f689fde332ddca3ac857b5597faa5` |
| Working tree | Clean before and after validation (`git status --porcelain` empty); no staged, unstaged or untracked changes |
| Automation commits for this spec | `9ee0649` and `88677f5` (unchanged from v1) |
| Prior review | `e2e-tests-automation-review-v1.md`, PASS-WITH-WARNINGS at `88677f5`, state revision `sha256:e6b3c59ece4c710496c50a963db29d494eb7c9652771b02c7cbd3ba5da5b9715` |
| Reviewed state revision | `sha256:1975a3c7429c33d50606b57d65e16764bb0d3150aea1d9793f4890bdd211928b` (`pipeline-state.py automation-revision`) |

**What changed since v1, from git.** I checked this with git and did not rely
on the driver's summary. `git log --oneline 88677f5..HEAD` lists three commits:
`82db294` (E2E review v1 report), `6937e5a` (integration review v1 report) and
`65b95a4` (integration rework, AR-002 partial). `git diff --name-status 88677f5..HEAD`
lists exactly three paths:

- `A docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-review-v1.md`
- `A docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-review-v1.md`
- `M tests/unit/test_massive_retry.py`

The only code change is in `tests/unit/test_massive_retry.py`. The single line
`# Implements TC-INT-026` moved from above the `@pytest.mark.parametrize`
decorator to between the decorator and
`def test_timeouts_and_server_errors_retry_to_the_attempt_limit`. No executable
line changed. That file is a pytest unit test for the integration
specification. No Playwright spec, E2E helper or E2E server script imports it,
runs it or depends on it. `git diff --stat 88677f5..HEAD -- tests/e2e scripts/run-e2e-server.sh playwright.config.ts package.json`
is empty, and so is the diff for `src/` and `web/`. So every E2E automation
file is byte-identical to the state v1 reviewed. The fingerprint changed only
because `repository_revision` hashes every implementation path in the repo.

The E2E automation itself is therefore unchanged. I still re-read it in full
and reran every validation command against the current tree, including the
moved comment. The moved comment does not touch the E2E automation, so it is
not part of this review's change set. It belongs to the integration
specification's automation review.

### Changed Files

The reviewed change set is the E2E automation from `9ee0649` and `88677f5`
(`git show --name-status`). The task-plan document is excluded as
documentation, as in v1. Nothing changed in these files since v1.

| File | Change |
| --- | --- |
| `scripts/run-e2e-server.sh` | modified: acquisition stack (API 8125, runner, stub 8126), refused start on 8124, backoff for DEC-0048 |
| `tests/e2e/support/massive_stub.py` | added: stub Massive provider with ok, reject-credential, unavailable, hold, release and reset controls |
| `tests/e2e/support/acquisition.ts` | added: acquisition-stack helpers, stub controls, store reset and shared UI helpers |
| `tests/e2e/support/database.ts` | modified: optional database parameter for `sql()` |
| `tests/e2e/coverage-expansion.spec.ts` | modified: TC-E2E-003 annotation plus presence and last-acquired assertions |
| `tests/e2e/cancel-run.spec.ts` | modified: TC-E2E-008 annotation only |
| `tests/e2e/coverage-empty.spec.ts` | added: TC-E2E-004 |
| `tests/e2e/startup-refusal.spec.ts` | added: TC-E2E-012 |
| `tests/e2e/first-run.spec.ts` | added: TC-E2E-001 |
| `tests/e2e/diagnose-failure.spec.ts` | added: TC-E2E-002 and TC-E2E-005 |
| `tests/e2e/unrecognised-instrument.spec.ts` | added: TC-E2E-006 |
| `tests/e2e/cancel-in-progress.spec.ts` | added: TC-E2E-007 |
| `tests/e2e/instrument-changes.spec.ts` | added: TC-E2E-009 and TC-E2E-010 |
| `tests/e2e/startup-health.spec.ts` | added: TC-E2E-011 |

No production source file is in the change set. `playwright.config.ts`,
`package.json` and `tsconfig.json` are unchanged.

## Test Case and Traceability Verification

`grep -rhoE 'test\("TC-E2E-[0-9]{3}' tests/e2e | sort | uniq -c` finds each of
TC-E2E-001–012 exactly once, in a Playwright test title. Each one maps to the
tasks named in the plan's traceability table, and every implementation task
maps back to at least one TC-ID. All 12 titled tests ran and passed in the
fresh `npm run test:e2e` below.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/first-run.spec.ts` "TC-E2E-001: a first acquisition succeeds…" | Depth, instruments and start all go through the UI. Run detail shows Succeeded. Each instrument has four `coverage-present` presence badges, a covered-from date and covered-to equal to host-local today (DEC-0049; see AR-005) |
| TC-E2E-002 | VERIFIED | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-002: …unavailable provider…" | Uses the `unavailable` stub mode (DEC-0048; the spec precondition allows it). Opens Runs, then the run. Outcome Failed/Partial. Each instrument × data type row shows Failed and an `[unavailable]` reason. Coverage shows the never-acquired copy and no rows |
| TC-E2E-003 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` "TC-E2E-003: a gap count sits in the row…" | Keeps the existing gap and expansion assertions, and adds presence (Present / Unknown, DEC-0030) and last-acquired time |
| TC-E2E-004 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` "TC-E2E-004: …" | Store reset in `beforeEach`. Never-acquired copy visible, zero row headers, no filter no-match copy |
| TC-E2E-005 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-005: …" | The re-run succeeds, DXA covered-from is unchanged, there is exactly one row each for DXA and DXB, and earlier runs keep their outcomes. Lines 100–102 open the failed run, but the only check is the `Failed` summary badge. Failure detail is never inspected (AR-001) |
| TC-E2E-006 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` "TC-E2E-006: …" | Outcome Partial, not Failed. UNKQ Reference shows Not found with its reason and request id. UQA has all four badges present |
| TC-E2E-007 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` "TC-E2E-007: …" | CXB is held. Running → Cancelling → Cancelled through the dialog. CXA prices present with a range. CXC has no presence and no covered-from date. `afterEach` resets holds |
| TC-E2E-008 | VERIFIED | `tests/e2e/cancel-run.spec.ts` "TC-E2E-008: a cancel that races completion…" | Annotation only, as DEC-0027 and T006 direct. The existing assertions cover the case |
| TC-E2E-009 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-009: …" | ICB presence is asserted and ICA is undisturbed. "Populated to the stated depth" is only checked as ICB covered-from equal to ICA covered-from (line 69), never against the 1-year depth (AR-002) |
| TC-E2E-010 | VERIFIED | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-010: …" | ICC is retired mid-run. Coverage shows the retired badge and the retained range. Run 2's roster includes ICC. Run 3's roster excludes it, and ICC's last-acquired is unchanged |
| TC-E2E-011 | VERIFIED | `tests/e2e/startup-health.spec.ts` "TC-E2E-011: …" | Answering. The outcome badge matches `GET /api/health` `most_recent_run`, or shows "No run recorded". Connecting to port 8123 on the first non-internal IPv4 address gives ECONNREFUSED |
| TC-E2E-012 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` "TC-E2E-012: …" plus the exit-2 guard in `scripts/run-e2e-server.sh` (lines 124–132) | The bundle loads from 8123 with `/api` routed to the refused 8124. The unreachable message and Not answering are shown, and a direct request to 8124 rejects. The suite aborts unless the production start chain exits 2 |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `tests/e2e/support/massive_stub.py` | `ThreadingHTTPServer` bound to `127.0.0.1`. Serves every client path, weekday bars per range, and UNK→404. Supports mode, hold, release and reset. Adds an `unavailable` mode (DEC-0048) that the T001 text does not describe (AR-003). pytest does not collect it (no `test_` prefix; `-m 'not postgres'` selected 658) |
| T002 | VERIFIED | `scripts/run-e2e-server.sh` | Creates and migrates both databases and seeds the ahead-of-build row. Aborts unless the refused start exits 2. Starts the stub, the acquisition API and the runner with child-only env, polls 8125 health, and kills all background PIDs in `cleanup()`. The runner entry point and provider key differ from the T002 text (CAP-001-E3-S7, DEC-0037; AR-003). `docker ps -a --filter name=factorflow-e2e-postgres` was empty after the run |
| T003 | VERIFIED | `tests/e2e/support/database.ts` | Optional `database = "factorflow"` passed as `--dbname`. Existing callers unchanged |
| T004 | VERIFIED | `tests/e2e/support/acquisition.ts` | Base URL, stub controls, `resetAcquisitionStore()` (`TRUNCATE … RESTART IDENTITY CASCADE` on the acquisition database) and `waitForRunState()`. Every acquisition-stack spec resets in `beforeEach` |
| T005 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` | Asserts Unknown, not the plan's "absent", for never-attempted types, per DEC-0030 (AR-003) |
| T006 | VERIFIED | `tests/e2e/cancel-run.spec.ts` | Title and header annotated |
| T007 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` | As planned |
| T008 | VERIFIED | `tests/e2e/first-run.spec.ts` | End date is today rather than the latest weekday, per DEC-0049 (AR-003, AR-005) |
| T009 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` | TC-E2E-002 uses `unavailable` (DEC-0048). TC-E2E-005 skips the failure-detail inspection the task names (AR-001) |
| T010 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` | As planned |
| T011 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` | As planned. The hold is always released by `resetStub()` in `afterEach` |
| T012 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` | TC-E2E-010 is complete. The TC-E2E-009 depth assertion is relative only (AR-002) |
| T013 | VERIFIED | `tests/e2e/startup-health.spec.ts` | As planned |
| T014 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` | As planned |
| T015 | VERIFIED | Fresh `npm run test:e2e` below | 17 passed of 17 expected. The provider base URL is `http://127.0.0.1:8126`, the stub binds loopback only, and the main stack calls no provider. The container was removed afterwards |
| T016 | PARTIAL | Fresh validation commands below | Every listed command passes, but `npx tsc --noEmit` still covers only `web/src` (`tsconfig.json` `include`). The changed `tests/e2e` TypeScript is not type-checked (AR-004) |

## Independent Validation

All commands ran in `repos/factorflow-v2/FactorFlow-v2` on branch
`usr/alvaro-de-jodra/CAP-001-automation` at `65b95a4`, one after another,
between 2026-10-11T22:58:16Z and 2026-10-11T23:05:26Z, with Docker 28.3.2
available. The list is the union of the task plan's Validation Plan and the
tech stack's Validation Commands table (14 commands). Logs went to
`/tmp/e2e-review-v2/`, outside the repository.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 46 packages resolved, 43 checked |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Install-script warnings only |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome lint: 96 files checked, no fixes applied |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome format: 96 files checked, no fixes applied |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output. `tsconfig.json` includes `web/src` only (AR-004) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 184 files already formatted, including the moved comment in `tests/unit/test_massive_retry.py` |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite build into gitignored `src/factorflow/api/static/` |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vitest: 41/41 files, 297/297 tests |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel into gitignored `dist/` |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 658/658 selected passed, 274 deselected, 2 warnings |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 932/932 passed in 225.62s, including postgres-marked suites (testcontainers) and `tests/unit/test_massive_retry.py` |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Playwright chromium, 1 worker: 17/17 passed in 2.9m, with all 12 TC-E2E titles in the run. `posttest:e2e` ran, and no `factorflow-e2e-postgres` container was left |

All build and test outputs went to gitignored paths (`test-results/`, `dist/`,
`build/`, `src/factorflow/api/static/`, caches). `git status --porcelain` was
empty after validation.

## Findings

All five v1 findings are still open. The files they cite have not changed, so
they are carried forward with the same IDs. No new finding was raised.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | MEDIUM | `tests/e2e/diagnose-failure.spec.ts` lines 100–102: TC-E2E-005 opens the failed run from Runs, but the only check is the summary badge `Failed`. Nothing checks failure detail. Spec step 1 says "inspect its failure detail", and T009 says "open that run's failure detail". DEC-0048 records that no screen shows a rejected credential's run-level `failure_reason` | If failure detail on a failed run were removed or broken, TC-E2E-005 would still pass. The "diagnosed" half of "diagnosed and recovered" is unverified | Assert an owner-visible failure detail on the failed run, for example by driving it with a mode that gives per-data-type reasons, as TC-E2E-002 does. Alternatively, record an owner decision and a plan revision accepting that TC-E2E-005 cannot inspect detail until run-level reasons are shown |
| AR-002 | MEDIUM | `tests/e2e/instrument-changes.spec.ts` line 69: TC-E2E-009 asserts ICB covered-from equals ICA covered-from. `tests/e2e/first-run.spec.ts` line 56 asserts only a date pattern for covered-from. No test compares covered-from, or the Depth column, with the 1-year depth set on Settings | If the stated depth were ignored or mis-applied the same way for every instrument, TC-E2E-009's "populated to the stated depth" would still pass | Assert ICB covered-from (or the Depth column) against the depth set on Settings, for example the expected start date for a 1-year depth on the run date |
| AR-003 | LOW | All tasks are checked, but the task-plan text no longer matches the implementation. T001 lists only modes `ok` and `reject-credential`. T002 names `python -m factorflow.ingestion_main` and key `e2e-test-key`, but the script runs `tests/e2e/support/ingestion_e2e_main.py` with a generated `TEST-ONLY-…` key. T005 says absent, but Unknown is asserted. T008 says latest weekday, but today is asserted. T009 drives TC-E2E-002 with reject-credential, but `unavailable` is used. DEC-0030, DEC-0037, DEC-0048, DEC-0049 or CAP-001-E3-S7 covers each deviation | The plan does not describe what was built. A later reader or re-plan would work from stale task text | Revise the task plan via `$automation-planning` to match the decided behaviour and cite the decisions |
| AR-004 | LOW | `tsconfig.json` has `"include": ["web/src"]`. T016 lists `npx tsc --noEmit` as covering changed files, but no validation command type-checks any `tests/e2e/**/*.ts` file. Playwright transpiles without type checking, and Biome only lints | Type errors in the e2e specs and helpers go unnoticed until runtime | Add a type check that covers `tests/e2e` (for example an e2e tsconfig run in validation), or record in the plan that e2e TypeScript is lint-only |
| AR-005 | LOW | `tests/e2e/first-run.spec.ts` lines 30–34 and 59 assert covered-to equals host-local today (DEC-0049). This pins the runner's requested-range behaviour, which DEC-0049 notes contradicts `component-design-observation-writer.md` section 2.5. The runner's `date.today()` and the test's date are read at different moments | The assertion will have to change when the standard-lane follow-up lands, and a run that crosses local midnight could fail spuriously | Keep the DEC-0049 follow-up linked to this assertion. When coverage ranges are settled, update TC-E2E-001's end-date assertion |

## Previous Review Disposition

v1 is `e2e-tests-automation-review-v1.md`, reviewed at `88677f5`. No commit
since then touches any file the v1 findings cite (`git diff 88677f5..HEAD` is
empty for `tests/e2e`, `scripts/run-e2e-server.sh`, `tsconfig.json` and the task
plan). The only code change, `65b95a4`, moved a comment in
`tests/unit/test_massive_retry.py` for the integration specification's AR-002,
and it does not affect any of these findings.

- **v1 AR-001 (MEDIUM): open, carried forward as AR-001.**
  `tests/e2e/diagnose-failure.spec.ts` is unchanged. TC-E2E-005 still checks
  only the `Failed` badge on the failed run.
- **v1 AR-002 (MEDIUM): open, carried forward as AR-002.**
  `tests/e2e/instrument-changes.spec.ts` is unchanged. The depth assertion is
  still relative (line 69).
- **v1 AR-003 (LOW): open, carried forward as AR-003.** The task plan is
  unchanged (its content revision is the same as v1), and the stale task text
  remains.
- **v1 AR-004 (LOW): open, carried forward as AR-004.** `tsconfig.json` is
  unchanged (`include: ["web/src"]`).
- **v1 AR-005 (LOW): open, carried forward as AR-005.**
  `tests/e2e/first-run.spec.ts` is unchanged. It still asserts covered-to
  equals today (DEC-0049).

## Verdict

**Verdict:** PASS-WITH-WARNINGS

The change since v1 is a comment move in an integration unit test. It does not
touch the E2E automation, and every E2E automation file is byte-identical to the
reviewed v1 state. All 14 required validation commands, including the
Docker-backed `uv run pytest` (932/932) and `npm run test:e2e` (17/17), ran
fresh against the current tree and passed. All 12 TC-IDs trace to implemented,
passing tests, and all 16 tasks are implemented. The two MEDIUM findings
(AR-001, AR-002) are weak assertions in TC-E2E-005 and TC-E2E-009. The three
LOW findings (AR-003–AR-005) are plan drift, missing type-check coverage, and a
date assertion pinned by a decision. None is a missing test or a failing
command, so none blocks.

Send this verdict to the final completion check. The owner may choose to send
AR-001 and AR-002 back to `$automation-coding`.
