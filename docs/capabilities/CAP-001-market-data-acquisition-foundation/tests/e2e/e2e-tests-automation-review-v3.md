---
artifact_schema_version: 1
artifact_id: CAP-001-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-11
updated: 2026-10-11
test_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-10-12T01:15:00Z
reviewed_state_revision: sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3
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
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-12T01:15:00Z
  source_artifacts:
    - id: CAP-001-e2e-tests
      version: "1"
    - id: CAP-001-e2e-tests-automation-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Review: CAP-001-e2e-tests — Version 3

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 10/12 fully verified (TC-E2E-005 and TC-E2E-009 PARTIAL; none missing) |
| Automation tasks | 13/16 fully verified (T009, T012, T016 PARTIAL; none not implemented) |
| Required commands | 14/14 passed |
| Findings | 6 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 4 · **total 6**

This re-review ran unattended under an attended `$automation-run`
(`docs/unattended-mode.md`), in a fresh subagent that did not plan, code or
rework this change set. `pipeline-state.py check --stage automation-review`
reported `RESUME — automation code changed after review` for v2. Under
`owner-allowed` the same owner may act on this review; no second reviewer is
needed. This review records evidence only. It approves nothing.

## Review Subject

| Item | Value |
| --- | --- |
| Test specification | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md` (CAP-001-e2e-tests v1, draft; content revision unchanged since v1) |
| Automation task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md` (CAP-001-e2e-tests-automation-tasks v2, draft; all 16 tasks checked; content revision unchanged since v1) |
| Component repository | `repos/factorflow-v2/FactorFlow-v2` (`FactorFlow-v2`, the plan's only `Component(s)` entry; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-automation` at `9e410b2fb3ceef9176d63b74a267a678fb2110a0` |
| Working tree | Clean before and after validation (`git status --porcelain` empty); no staged, unstaged or untracked changes |
| Automation commits for this spec | `9ee0649` and `88677f5` (E2E automation), plus `9e410b2` (integration rework that changed two shared E2E support files and added a spec to the E2E suite) |
| Prior review | `e2e-tests-automation-review-v2.md`, PASS-WITH-WARNINGS at `65b95a4`, state revision `sha256:1975a3c7429c33d50606b57d65e16764bb0d3150aea1d9793f4890bdd211928b` |
| Reviewed state revision | `sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3` (`pipeline-state.py automation-revision`, identical before and after validation) |

**What changed since v2, from git.** I checked this with git rather than the
driver's summary. `git log --oneline 65b95a4..HEAD` lists three commits:
`e0dd4ae` (E2E review v2 report), `82607c5` (integration automation tasks v3)
and `9e410b2` (integration rework for TC-INT-027).
`git diff --name-status 65b95a4..HEAD` lists five paths:

- `A docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-review-v2.md`
- `M docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests-automation-tasks.md`
- `A tests/e2e/acquisition-stack-stub.spec.ts`
- `M tests/e2e/support/acquisition.ts`
- `M tests/e2e/support/massive_stub.py`

The two documents are a prior report and another specification's plan, so they
are not automation code. The three code paths are reviewed below.

- `tests/e2e/support/massive_stub.py` (+23/−2): `StubState` gains a
  lock-guarded request log (`record`, `requests`). `do_GET` answers the new
  control `GET /__stub/requests` before anything else and otherwise records
  `("GET", path)` before the existing hold and response logic. `reset()` also
  clears the log. Mode, hold, release, `UNK`→404 and response bodies are
  unchanged. Recording happens before `wait_if_held`, which still waits outside
  the lock, so a held symbol (TC-E2E-007, TC-E2E-010) cannot deadlock the new
  `requests()` call. The log only grows between resets, and every
  acquisition-stack spec resets in `beforeEach`.
- `tests/e2e/support/acquisition.ts` (+31/−2): adds `stubRequests()` (a GET to
  the new control) and `ingestionProcessIsRunning()` (`pgrep -f` on the
  ingestion entry point), and extends the header's trace list. No existing
  export changed signature or behaviour. Only the new TC-INT-027 spec calls the
  two new helpers.
- `tests/e2e/acquisition-stack-stub.spec.ts` (new, 60 lines): implements
  TC-INT-027 from the integration specification, not a TC-E2E case. It lives in
  `tests/e2e`, so `npm run test:e2e` runs it with the E2E suite. It calls
  `resetAcquisitionStore()` in `beforeEach` and waits for a terminal run state,
  so it leaves no non-terminal run behind. It ran first (`[1/18]`) in the fresh
  run, and every TC-E2E test after it passed, so it does not disturb the E2E
  journeys.

`git diff --stat 65b95a4..HEAD` is empty for `scripts/run-e2e-server.sh`,
`playwright.config.ts`, `package.json`, `tsconfig.json`, `src/`, `web/`, every
other `tests/e2e/*.spec.ts`, and the E2E specification and task plan.

Two observations on TC-INT-027 belong to the integration specification's
automation review, not to this E2E review, and are recorded here only for
handover. First, `ingestionProcessIsRunning()` matches any process on the host
whose command line contains `tests/e2e/support/ingestion_e2e_main.py`, so an
ingestion process from another concurrent checkout would satisfy it. Second,
the stub records only from `do_GET`, so the spec's assertion that every
recorded entry is a `GET` cannot fail.

### Changed Files

The reviewed change set is the E2E automation from `9ee0649` and `88677f5`
(`git show --name-status`), plus the three code paths `9e410b2` changed in the
E2E suite. Task-plan and report documents are excluded as documentation, as in
v1 and v2.

| File | Change |
| --- | --- |
| `scripts/run-e2e-server.sh` | modified (unchanged since v2): acquisition stack (API 8125, runner, stub 8126), refused start on 8124, backoff for DEC-0048 |
| `tests/e2e/support/massive_stub.py` | added; modified in `9e410b2`: stub Massive provider with ok, reject-credential, unavailable, hold, release and reset controls, plus a request log read through `GET /__stub/requests` and cleared on reset |
| `tests/e2e/support/acquisition.ts` | added; modified in `9e410b2`: acquisition-stack helpers, stub controls, store reset and shared UI helpers, plus `stubRequests()` and `ingestionProcessIsRunning()` |
| `tests/e2e/acquisition-stack-stub.spec.ts` | added in `9e410b2`: TC-INT-027 (integration specification), run by the E2E suite; reviewed here for its effect on the shared suite |
| `tests/e2e/support/database.ts` | modified (unchanged since v2): optional database parameter for `sql()` |
| `tests/e2e/coverage-expansion.spec.ts` | modified (unchanged since v2): TC-E2E-003 annotation plus presence and last-acquired assertions |
| `tests/e2e/cancel-run.spec.ts` | modified (unchanged since v2): TC-E2E-008 annotation only |
| `tests/e2e/coverage-empty.spec.ts` | added (unchanged since v2): TC-E2E-004 |
| `tests/e2e/startup-refusal.spec.ts` | added (unchanged since v2): TC-E2E-012 |
| `tests/e2e/first-run.spec.ts` | added (unchanged since v2): TC-E2E-001 |
| `tests/e2e/diagnose-failure.spec.ts` | added (unchanged since v2): TC-E2E-002 and TC-E2E-005 |
| `tests/e2e/unrecognised-instrument.spec.ts` | added (unchanged since v2): TC-E2E-006 |
| `tests/e2e/cancel-in-progress.spec.ts` | added (unchanged since v2): TC-E2E-007 |
| `tests/e2e/instrument-changes.spec.ts` | added (unchanged since v2): TC-E2E-009 and TC-E2E-010 |
| `tests/e2e/startup-health.spec.ts` | added (unchanged since v2): TC-E2E-011 |

No production source file is in the change set. `playwright.config.ts`,
`package.json` and `tsconfig.json` are unchanged.

## Test Case and Traceability Verification

`grep -rhoE 'test\("TC-E2E-[0-9]{3}' tests/e2e | sort | uniq -c` finds each of
TC-E2E-001–012 exactly once, in a Playwright test title. Each maps to the tasks
named in the plan's traceability table, and every implementation task maps back
to at least one TC-ID. The new `acquisition-stack-stub.spec.ts` carries no
TC-E2E ID, so E2E traceability is unchanged. All 12 titled tests ran and passed
in the fresh `npm run test:e2e` below (`retries: 0`, so no pass is a retry).
None of the spec files behind these results changed since v2, so the
per-assertion verification from v2 still holds; I re-read the changed support
code against each acquisition-stack journey that uses it.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/first-run.spec.ts` "TC-E2E-001: a first acquisition succeeds…" | Depth, instruments and start go through the UI. Run detail shows Succeeded. Each instrument has four presence badges, a covered-from date and covered-to equal to host-local today (DEC-0049; see AR-005). Passed `[10/18]` |
| TC-E2E-002 | VERIFIED | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-002: …unavailable provider…" | `unavailable` stub mode (DEC-0048; the spec precondition allows it). Each instrument × data type row shows Failed with an `[unavailable]` reason; Coverage shows the never-acquired copy. The stub log saw `503` answers for this test. Passed `[8/18]` |
| TC-E2E-003 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` "TC-E2E-003: a gap count sits in the row…" | Main stack, does not use the stub. Gap, expansion, presence (Present / Unknown, DEC-0030) and last-acquired assertions. Passed `[7/18]` |
| TC-E2E-004 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` "TC-E2E-004: …" | Store reset in `beforeEach` (now also clears the stub log). Never-acquired copy, zero row headers, no filter no-match copy. Passed `[6/18]` |
| TC-E2E-005 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-005: …" | The re-run succeeds, DXA covered-from is unchanged, one row each for DXA and DXB, earlier runs keep their outcomes. The failed run is opened but only the `Failed` badge is checked; failure detail is not inspected (AR-001). Passed `[9/18]` |
| TC-E2E-006 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` "TC-E2E-006: …" | Outcome Partial, not Failed. UNKQ Reference shows Not found with its reason and request id; UQA has all four badges present. Passed `[18/18]` |
| TC-E2E-007 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` "TC-E2E-007: …" | CXB held; Running → Cancelling → Cancelled through the dialog; CXA retained; CXC untouched. The new `record()` runs before `wait_if_held`, so holds behave as before. Passed `[2/18]`, immediately after the TC-INT-027 test |
| TC-E2E-008 | VERIFIED | `tests/e2e/cancel-run.spec.ts` "TC-E2E-008: a cancel that races completion…" | Annotation only (DEC-0027, T006). Main stack. Passed `[5/18]` |
| TC-E2E-009 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-009: …" | ICB presence asserted and ICA undisturbed. "Populated to the stated depth" is only ICB covered-from equal to ICA covered-from (line 69), never the 1-year depth (AR-002). Passed `[11/18]` |
| TC-E2E-010 | VERIFIED | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-010: …" | ICC retired mid-run (ICA held); retired badge and retained range; run 2 roster includes ICC; run 3 excludes it and ICC's last-acquired is unchanged. Passed `[12/18]` |
| TC-E2E-011 | VERIFIED | `tests/e2e/startup-health.spec.ts` "TC-E2E-011: …" | Answering; outcome badge matches `GET /api/health` `most_recent_run` or "No run recorded"; non-loopback connection to 8123 refused. Passed `[16/18]` |
| TC-E2E-012 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` "TC-E2E-012: …" plus the exit-2 guard in `scripts/run-e2e-server.sh` | Bundle from 8123 with `/api` routed to the refused 8124; unreachable message and Not answering; direct request to 8124 rejects. The suite aborts unless the production start chain exits 2. Passed `[17/18]` |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `tests/e2e/support/massive_stub.py` | Still a loopback-only `ThreadingHTTPServer` serving every client path, weekday bars per range, `UNK`→404, with mode, hold, release and reset. `9e410b2` adds `GET /__stub/requests` and a request log cleared on reset; the existing controlled behaviours are unchanged. The `unavailable` mode (DEC-0048) and the new control are not in the T001 text (AR-003, AR-006). Not collected by pytest (`-m 'not postgres'` selected 658, unchanged) |
| T002 | VERIFIED | `scripts/run-e2e-server.sh` | Unchanged since v2. Refused start exit-2 guard, stub, acquisition API and runner with child-only env, 8125 health poll, `cleanup()` kills all PIDs. Entry point and key differ from the T002 text (CAP-001-E3-S7, DEC-0037; AR-003). `docker ps -a --filter name=factorflow-e2e-postgres` empty after the run |
| T003 | VERIFIED | `tests/e2e/support/database.ts` | Unchanged since v2 |
| T004 | VERIFIED | `tests/e2e/support/acquisition.ts` | Base URL, stub controls, `resetAcquisitionStore()` and `waitForRunState()` unchanged. `9e410b2` adds two helpers used only by TC-INT-027 (AR-006). Every acquisition-stack spec, including the new one, resets in `beforeEach` |
| T005 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` | Unchanged since v2. Asserts Unknown, not the plan's "absent", per DEC-0030 (AR-003) |
| T006 | VERIFIED | `tests/e2e/cancel-run.spec.ts` | Unchanged since v2 |
| T007 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` | Unchanged since v2 |
| T008 | VERIFIED | `tests/e2e/first-run.spec.ts` | Unchanged since v2. End date today, per DEC-0049 (AR-003, AR-005) |
| T009 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` | Unchanged since v2. TC-E2E-005 skips the failure-detail inspection the task names (AR-001) |
| T010 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` | Unchanged since v2 |
| T011 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` | Unchanged since v2. Hold released by `resetStub()` in `afterEach` |
| T012 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` | Unchanged since v2. TC-E2E-009 depth assertion is relative only (AR-002) |
| T013 | VERIFIED | `tests/e2e/startup-health.spec.ts` | Unchanged since v2 |
| T014 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` | Unchanged since v2 |
| T015 | VERIFIED | Fresh `npm run test:e2e` below | 18 passed: the plan's 17 expected tests plus the integration specification's TC-INT-027 test, which now shares the suite (AR-006). The acquisition stack's provider base URL is `http://127.0.0.1:${STUB_PORT}` (`scripts/run-e2e-server.sh` line 143), the stub binds loopback only, and the main stack calls no provider. Container removed afterwards |
| T016 | PARTIAL | Fresh validation commands below | Every listed command passes, but `npx tsc --noEmit` still covers only `web/src`. The changed `tests/e2e/support/acquisition.ts` and the new `tests/e2e/acquisition-stack-stub.spec.ts` are not type-checked either (AR-004) |

## Independent Validation

All commands ran in `repos/factorflow-v2/FactorFlow-v2` on branch
`usr/alvaro-de-jodra/CAP-001-automation` at `9e410b2`, one after another,
between 2026-10-12T01:06:30Z and 2026-10-12T01:13:47Z, with Docker 28.3.2
available. The list is the union of the task plan's Validation Plan and the
tech stack's Validation Commands table (14 commands). Logs went to the review
session's scratchpad, outside the repository.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 46 packages resolved, 43 checked |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Install-script warnings only |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome lint: 97 files checked (v2: 96; the new spec is included), no fixes applied |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome format: 97 files checked, no fixes applied |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output. `tsconfig.json` includes `web/src` only (AR-004) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed, including the changed `massive_stub.py` |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 184 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files (`src` only; the stub is a test file) |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite build into gitignored `src/factorflow/api/static/` |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vitest: 41/41 files, 297/297 tests |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel into gitignored `dist/` |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 658/658 selected passed, 274 deselected, 2 warnings; the stub is still not collected |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 932/932 passed in 212.52s, including postgres-marked suites (testcontainers) |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Playwright chromium, 1 worker, `retries: 0`: 18/18 passed in 2.9m. All 12 TC-E2E titles ran, plus TC-INT-027. `posttest:e2e` ran, and no `factorflow-e2e-postgres` container was left |

All build and test outputs went to gitignored paths (`test-results/`, `dist/`,
`build/`, `src/factorflow/api/static/`, caches). `git status --porcelain` was
empty after validation, and `pipeline-state.py automation-revision` gave the
same fingerprint before and after.

## Findings

The five v2 findings are still open. None of the files they cite changed in
the way their remediation needs, so they keep their IDs. One new LOW finding,
AR-006, comes from the shared suite and support files that `9e410b2` extended
for the integration specification.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | MEDIUM | `tests/e2e/diagnose-failure.spec.ts` lines 100–102: TC-E2E-005 opens the failed run from Runs, but the only check is the summary badge `Failed`. Nothing checks failure detail. Spec step 1 says "inspect its failure detail", and T009 says "open that run's failure detail". DEC-0048 records that no screen shows a rejected credential's run-level `failure_reason` | If failure detail on a failed run were removed or broken, TC-E2E-005 would still pass. The "diagnosed" half of "diagnosed and recovered" is unverified | Assert an owner-visible failure detail on the failed run, for example by driving it with a mode that gives per-data-type reasons, as TC-E2E-002 does. Alternatively, record an owner decision and a plan revision accepting that TC-E2E-005 cannot inspect detail until run-level reasons are shown |
| AR-002 | MEDIUM | `tests/e2e/instrument-changes.spec.ts` line 69: TC-E2E-009 asserts ICB covered-from equals ICA covered-from. `tests/e2e/first-run.spec.ts` line 56 asserts only a date pattern for covered-from. No test compares covered-from, or the Depth column, with the 1-year depth set on Settings | If the stated depth were ignored or mis-applied the same way for every instrument, TC-E2E-009's "populated to the stated depth" would still pass | Assert ICB covered-from (or the Depth column) against the depth set on Settings, for example the expected start date for a 1-year depth on the run date |
| AR-003 | LOW | All tasks are checked, but the task-plan text no longer matches the implementation. T001 lists only modes `ok` and `reject-credential`. T002 names `python -m factorflow.ingestion_main` and key `e2e-test-key`, but the script runs `tests/e2e/support/ingestion_e2e_main.py` with a generated `TEST-ONLY-…` key. T005 says absent, but Unknown is asserted. T008 says latest weekday, but today is asserted. T009 drives TC-E2E-002 with reject-credential, but `unavailable` is used. DEC-0030, DEC-0037, DEC-0048, DEC-0049 or CAP-001-E3-S7 covers each deviation | The plan does not describe what was built. A later reader or re-plan would work from stale task text | Revise the task plan via `$automation-planning` to match the decided behaviour and cite the decisions |
| AR-004 | LOW | `tsconfig.json` has `"include": ["web/src"]`. T016 lists `npx tsc --noEmit` as covering changed files, but no validation command type-checks any `tests/e2e/**/*.ts` file. Since v2 this also leaves the changed `tests/e2e/support/acquisition.ts` (including the `error as { status?: number \| null }` cast) and the new `tests/e2e/acquisition-stack-stub.spec.ts` unchecked. Playwright transpiles without type checking, and Biome only lints | Type errors in the e2e specs and helpers go unnoticed until runtime | Add a type check that covers `tests/e2e` (for example an e2e tsconfig run in validation), or record in the plan that e2e TypeScript is lint-only |
| AR-005 | LOW | `tests/e2e/first-run.spec.ts` lines 30–34 and 59 assert covered-to equals host-local today (DEC-0049). This pins the runner's requested-range behaviour, which DEC-0049 notes contradicts `component-design-observation-writer.md` section 2.5. The runner's `date.today()` and the test's date are read at different moments | The assertion will have to change when the standard-lane follow-up lands, and a run that crosses local midnight could fail spuriously | Keep the DEC-0049 follow-up linked to this assertion. When coverage ranges are settled, update TC-E2E-001's end-date assertion |
| AR-006 | LOW | New. `9e410b2` (integration plan v3, T026–T028) added `tests/e2e/acquisition-stack-stub.spec.ts` (TC-INT-027) to the E2E suite and extended the E2E-owned `tests/e2e/support/massive_stub.py` (`GET /__stub/requests`, request log) and `tests/e2e/support/acquisition.ts` (`stubRequests()`, `ingestionProcessIsRunning()`). The E2E plan still says "Expect 17 tests passing" (T015, Validation Plan), and its T001 and T004 text do not mention the new control or helpers. The fresh run passed 18 | `npm run test:e2e` no longer has the count the E2E plan uses as its oracle, so a reader checking T015 against a run sees a mismatch. The plan also does not show that two specifications now depend on these support files, so a change for one could break the other unnoticed | When AR-003's plan revision is made, state the shared-suite count (17 E2E tests plus the integration tests in `tests/e2e`) or count only TC-E2E titles, and record in T001/T004 that the integration plan's T026/T027 extend these files |

## Previous Review Disposition

v2 is `e2e-tests-automation-review-v2.md`, reviewed at `65b95a4`. The only code
commit since then, `9e410b2`, changed `tests/e2e/support/massive_stub.py` and
`tests/e2e/support/acquisition.ts` and added `tests/e2e/acquisition-stack-stub.spec.ts`.
`git diff 65b95a4..HEAD` is empty for `tests/e2e/diagnose-failure.spec.ts`,
`tests/e2e/instrument-changes.spec.ts`, `tests/e2e/first-run.spec.ts`,
`tsconfig.json`, `scripts/run-e2e-server.sh` and the E2E task plan.

- **v2 AR-001 (MEDIUM): open, carried forward as AR-001.**
  `tests/e2e/diagnose-failure.spec.ts` is unchanged. TC-E2E-005 still checks
  only the `Failed` badge on the failed run.
- **v2 AR-002 (MEDIUM): open, carried forward as AR-002.**
  `tests/e2e/instrument-changes.spec.ts` is unchanged. The depth assertion is
  still relative (line 69).
- **v2 AR-003 (LOW): open, carried forward as AR-003.** The task plan is
  unchanged (same content revision as v1 and v2), and the stale task text
  remains. AR-006 adds a related gap.
- **v2 AR-004 (LOW): open, carried forward as AR-004, wider in scope.**
  `tsconfig.json` is unchanged (`include: ["web/src"]`). The new and changed
  TypeScript in `tests/e2e` is also not type-checked.
- **v2 AR-005 (LOW): open, carried forward as AR-005.**
  `tests/e2e/first-run.spec.ts` is unchanged. It still asserts covered-to
  equals today (DEC-0049).

## Verdict

**Verdict:** PASS-WITH-WARNINGS

The change since v2 extends two shared E2E support files and adds an
integration-specification test to the E2E suite. The extensions are additive.
No existing stub behaviour or helper signature changed. The new spec resets the
acquisition store and leaves no run in progress. All 12 TC-E2E journeys passed
in a fresh run that included the new test, with no retries. All 14 required
validation commands ran fresh against the current tree and passed, including
the Docker-backed `uv run pytest` (932/932) and `npm run test:e2e` (18/18). All
12 TC-IDs trace to implemented, passing tests, and all 16 tasks are
implemented. The two MEDIUM findings (AR-001, AR-002) are weak assertions in
TC-E2E-005 and TC-E2E-009. The four LOW findings (AR-003–AR-006) are plan
drift, missing type-check coverage, a date assertion pinned by a decision, and
the stale test count in the plan now that the suite is shared. None is a
missing test or a failing command, so none blocks.

Send this verdict to the final completion check. The owner may choose to send
AR-001 and AR-002 back to `$automation-coding`.
