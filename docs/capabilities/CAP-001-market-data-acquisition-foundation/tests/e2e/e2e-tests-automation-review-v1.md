---
artifact_schema_version: 1
artifact_id: CAP-001-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-11
updated: 2026-10-11
test_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-10-11T22:29:38Z
reviewed_state_revision: sha256:e6b3c59ece4c710496c50a963db29d494eb7c9652771b02c7cbd3ba5da5b9715
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
  timestamp: 2026-10-11T22:29:38Z
  source_artifacts:
    - id: CAP-001-e2e-tests
      version: "1"
    - id: CAP-001-e2e-tests-automation-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Review: CAP-001-e2e-tests — Version 1

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **PASS-WITH-WARNINGS** |
| Test cases | 10/12 fully verified (TC-E2E-005 and TC-E2E-009 PARTIAL; none missing) |
| Automation tasks | 13/16 fully verified (T009, T012, T016 PARTIAL; none not implemented) |
| Required commands | 14/14 passed |
| Findings | 5 |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 3 · **total 5**

Run unattended under `$automation-run` (`docs/unattended-mode.md`). Under
`owner-allowed` the same owner may act on this review; no second reviewer is
required. This review records evidence only and approves nothing.

## Review Subject

| Item | Value |
| --- | --- |
| Test specification | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md` (CAP-001-e2e-tests v1, draft) |
| Automation task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md` (CAP-001-e2e-tests-automation-tasks v2, draft; all 16 tasks checked) |
| Component repository | `repos/factorflow-v2/FactorFlow-v2` (`FactorFlow-v2`, the plan's only `Component(s)` entry; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-automation` at `88677f5ef2375ec7cf2cbd051453a6783492908e` |
| Working tree | Clean before and after validation (`git status --porcelain` empty); no staged, unstaged or untracked changes |
| Automation commits | `9ee0649` "test(CAP-001): automate E2E tasks T001-T007 and T014 (partial; 8 held)" and `88677f5` "test(CAP-001): automate the remaining E2E journeys (16/16)" |
| Reviewed state revision | `sha256:e6b3c59ece4c710496c50a963db29d494eb7c9652771b02c7cbd3ba5da5b9715` (`pipeline-state.py automation-revision`) |

The change set was derived from git: `git log -- docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/`
and `git log -- tests/e2e scripts/run-e2e-server.sh` identify the two commits
above as the automation commits for this specification, and
`git show --name-status` on each gives the inventory below (the task-plan
document both commits also touch is excluded as documentation). Three other
commits touched the same paths in this period under their own lanes and are
not part of this review subject: `cc0b410` (CAP-001-E3-S7: added
`tests/e2e/support/ingestion_e2e_main.py` and changed `scripts/run-e2e-server.sh`
to start it), `75edce1` (CAP-001-E3-S1: removed the stub's ratios route) and
`d776fe6` (EXP-20261011-2: scoped one badge count in `tests/e2e/cancel-run.spec.ts`).
Their effect on the reviewed files was read, and the suite was run with them in
place.

### Changed Files

| File | Change |
| --- | --- |
| `scripts/run-e2e-server.sh` | modified — acquisition stack (API 8125, runner, stub 8126), refused start on 8124, backoff for DEC-0048 |
| `tests/e2e/support/massive_stub.py` | added — stub Massive provider with ok, reject-credential, unavailable, hold, release, reset controls |
| `tests/e2e/support/acquisition.ts` | added — acquisition-stack helpers, stub controls, store reset, shared UI helpers |
| `tests/e2e/support/database.ts` | modified — optional database parameter for `sql()` |
| `tests/e2e/coverage-expansion.spec.ts` | modified — TC-E2E-003 annotation plus presence and last-acquired assertions |
| `tests/e2e/cancel-run.spec.ts` | modified — TC-E2E-008 annotation only |
| `tests/e2e/coverage-empty.spec.ts` | added — TC-E2E-004 |
| `tests/e2e/startup-refusal.spec.ts` | added — TC-E2E-012 |
| `tests/e2e/first-run.spec.ts` | added — TC-E2E-001 |
| `tests/e2e/diagnose-failure.spec.ts` | added — TC-E2E-002 and TC-E2E-005 |
| `tests/e2e/unrecognised-instrument.spec.ts` | added — TC-E2E-006 |
| `tests/e2e/cancel-in-progress.spec.ts` | added — TC-E2E-007 |
| `tests/e2e/instrument-changes.spec.ts` | added — TC-E2E-009 and TC-E2E-010 |
| `tests/e2e/startup-health.spec.ts` | added — TC-E2E-011 |

No production source file is in the change set; `playwright.config.ts` and
`package.json` are unchanged, as the plan states.

## Test Case and Traceability Verification

Every TC-E2E-001–012 appears in exactly one Playwright test title
(`grep -rhoE 'test\("TC-E2E-[0-9]{3}' tests/e2e`: 12 IDs, one each), each maps
to the tasks the plan's traceability table names, and every implementation task
maps back to at least one TC-ID. All 12 passed in the fresh `npm run test:e2e`
run below.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/first-run.spec.ts` "TC-E2E-001: a first acquisition succeeds…" | Depth, instruments and start through the UI; Succeeded on Run detail; four presence badges `coverage-present` and a covered range per instrument. End date asserted as host-local today per DEC-0049 (see AR-005) |
| TC-E2E-002 | VERIFIED | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-002: …unavailable provider…" | Unavailable-provider mode (DEC-0048; spec precondition allows it). Opens Runs then the run; Failed/Partial outcome; each instrument × data type shows Failed and an `[unavailable]` reason; Coverage shows the never-acquired copy and no rows |
| TC-E2E-003 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` "TC-E2E-003: a gap count sits in the row…" | Existing gap and expansion assertions kept; adds presence (Present / Unknown per DEC-0030) and last-acquired time |
| TC-E2E-004 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` "TC-E2E-004: …" | Never-acquired copy visible, no row headers, filter no-match copy absent |
| TC-E2E-005 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-005: …" | Re-run succeeds, earlier covered-from unchanged, one row each, earlier runs keep outcomes. The failed run's failure detail is opened but not inspected (AR-001) |
| TC-E2E-006 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` "TC-E2E-006: …" | Outcome Partial and not Failed; UNKQ Reference shows Not found with reason and request id; UQA has all four badges present |
| TC-E2E-007 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` "TC-E2E-007: …" | CXB held; Running → Cancelling → Cancelled through the dialog; CXA prices present with a range; CXC no presence and no covered-from date; `afterEach` resets holds |
| TC-E2E-008 | VERIFIED | `tests/e2e/cancel-run.spec.ts` "TC-E2E-008: a cancel that races completion…" | Annotation only, as DEC-0027 and T006 direct; existing assertions cover the case |
| TC-E2E-009 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-009: …" | ICB presence and ICA undisturbed asserted; "populated to the stated depth" is asserted only as ICB's covered-from equal to ICA's, never against the stated 1-year depth (AR-002) |
| TC-E2E-010 | VERIFIED | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-010: …" | ICC retired mid-run; Coverage shows retired badge and retained range; run 2 roster includes ICC; run 3 roster excludes it and ICC's last-acquired is unchanged |
| TC-E2E-011 | VERIFIED | `tests/e2e/startup-health.spec.ts` "TC-E2E-011: …" | Answering; outcome badge matches `GET /api/health` `most_recent_run` (or "No run recorded"); ECONNREFUSED on port 8123 at the first non-internal IPv4 |
| TC-E2E-012 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` "TC-E2E-012: …" plus `scripts/run-e2e-server.sh` exit-2 guard | Bundle from 8123 with `/api` routed to the refused 8124; unreachable message and Not answering; direct request to 8124 rejects. Suite aborts unless the production start chain exits 2 |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `tests/e2e/support/massive_stub.py` | Loopback-bound `ThreadingHTTPServer`; every client path; weekday bars per range; UNK→404; mode, hold, release, reset. Adds `unavailable` mode (DEC-0048) not described in the T001 text (AR-003). Not collected by pytest (658 passed in `-m 'not postgres'`, stub has no `test_` prefix) |
| T002 | VERIFIED | `scripts/run-e2e-server.sh` | Creates and migrates both databases, seeds the ahead-of-build row, aborts unless the refused start exits 2, starts stub, acquisition API and runner with child-only env, polls 8125 health, kills all background PIDs in `cleanup()`. Runner entry point and provider key differ from the T002 text (CAP-001-E3-S7, DEC-0037; AR-003). `docker ps -a` showed no `factorflow-e2e-postgres` after the run |
| T003 | VERIFIED | `tests/e2e/support/database.ts` | Optional `database = "factorflow"` passed as `--dbname`; existing callers unchanged |
| T004 | VERIFIED | `tests/e2e/support/acquisition.ts` | Base URL, stub controls, `resetAcquisitionStore()` truncating the ten data tables, `waitForRunState()`; every acquisition-stack spec resets in `beforeEach` |
| T005 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` | Unknown rather than the plan's "absent" for never-attempted types, per DEC-0030 (AR-003) |
| T006 | VERIFIED | `tests/e2e/cancel-run.spec.ts` | Title and header annotated; the later badge-scope change is EXP-20261011-2's, not this task's |
| T007 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` | As planned |
| T008 | VERIFIED | `tests/e2e/first-run.spec.ts` | End date today rather than latest weekday, per DEC-0049 (AR-003, AR-005) |
| T009 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` | TC-E2E-002 via `unavailable` (DEC-0048). TC-E2E-005 omits the failure-detail inspection the task names (AR-001) |
| T010 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` | As planned |
| T011 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` | As planned; hold always released via `afterEach` `resetStub()` |
| T012 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` | TC-E2E-010 complete; TC-E2E-009 depth assertion is relative only (AR-002) |
| T013 | VERIFIED | `tests/e2e/startup-health.spec.ts` | As planned |
| T014 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` | As planned |
| T015 | VERIFIED | Fresh `npm run test:e2e` below | 17 passed, 17 expected; stub log shows every provider request served on 127.0.0.1:8126; container removed afterwards |
| T016 | PARTIAL | Fresh validation commands below | All listed commands pass, but `npx tsc --noEmit` does not type-check the changed `tests/e2e` TypeScript (AR-004) |

## Independent Validation

All commands ran in `repos/factorflow-v2/FactorFlow-v2` on branch
`usr/alvaro-de-jodra/CAP-001-automation` at `88677f5`, between
2026-10-11T22:21:05Z and 2026-10-11T22:28:49Z, with Docker 28.3.2 available.
The list is the union of the task plan's Validation Plan and the tech stack's
Validation Commands table.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 46 packages resolved, 43 checked |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Install-script warnings only |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 96 files checked, no issues |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome check: 96 files, no fixes applied (check only) |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `tsconfig.json` includes `web/src` only (AR-004) |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 184 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite build into gitignored `src/factorflow/api/static/` |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vitest: 41/41 files, 297/297 tests |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel into gitignored `dist/` |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 658/658 selected passed, 274 deselected |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 932/932 passed, including postgres-marked suites (testcontainers) |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Playwright chromium: 17/17 passed in 2.9m; `posttest:e2e` ran; no `factorflow-e2e-postgres` container left |

Artifacts: all outputs went to gitignored paths (`test-results/`, `dist/`,
`build/`, `src/factorflow/api/static/`, caches); `git status --porcelain` was
empty after validation.

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | MEDIUM | `tests/e2e/diagnose-failure.spec.ts` TC-E2E-005 opens the failed run from Runs and asserts only the summary badge `Failed`; nothing checks failure detail. Spec step 1 says "inspect its failure detail"; T009 says "open that run's failure detail". DEC-0048 records that a rejected credential's run-level `failure_reason` is shown on no screen | A regression that removed or broke failure detail on a failed run would not fail TC-E2E-005; the diagnose half of "diagnosed and recovered" is unverified | Assert an owner-visible failure detail on the failed run (e.g. drive the failed run with a mode that yields per-data-type reasons, as TC-E2E-002 does), or record an owner decision and plan revision accepting that TC-E2E-005 cannot inspect detail until run-level reasons are shown |
| AR-002 | MEDIUM | `tests/e2e/instrument-changes.spec.ts` TC-E2E-009 asserts ICB's covered-from equals ICA's; `tests/e2e/first-run.spec.ts` asserts only a date pattern for covered-from. No test compares covered-from or the Depth column with the stated 1-year depth | If the stated depth were ignored (or mis-applied) for every instrument alike, TC-E2E-009's "populated to the stated depth" would still pass | Assert ICB's covered-from (or the Depth column) against the depth stated on Settings, e.g. the expected start date for a 1-year depth on the run date |
| AR-003 | LOW | Task-plan text, all tasks checked, differs from the implementation: T001 lists modes `ok` and `reject-credential` only; T002 names `python -m factorflow.ingestion_main` and key `e2e-test-key` (implementation runs `tests/e2e/support/ingestion_e2e_main.py` with a generated `TEST-ONLY-…` key); T005 says absent (Unknown asserted); T008 says latest weekday (today asserted); T009 drives TC-E2E-002 with reject-credential (unavailable used). Each deviation is covered by DEC-0030, DEC-0037, DEC-0048, DEC-0049 or CAP-001-E3-S7 | The plan no longer describes what was built; a later reader or re-plan would work from stale task text | Revise the task plan (via `$automation-planning`) to match the decided behaviour and cite the decisions |
| AR-004 | LOW | `tsconfig.json` `"include": ["web/src"]`; T016 lists `npx tsc --noEmit` as covering changed files, but no `tests/e2e/**/*.ts` file is type-checked by any validation command (Playwright transpiles without type checking; Biome lints only) | Type errors in the e2e specs and helpers would go undetected until runtime | Add a type check that covers `tests/e2e` (e.g. a tsconfig for the e2e suite run in validation), or record in the plan that e2e TypeScript is lint-only |
| AR-005 | LOW | `tests/e2e/first-run.spec.ts` asserts covered-to equals host-local today (DEC-0049), which pins the runner's requested-range behaviour that DEC-0049 notes contradicts `component-design-observation-writer.md` section 2.5; the runner's `date.today()` and the test's date are taken at different moments | The assertion will need to change when the standard-lane follow-up lands, and a run spanning local midnight could fail spuriously | Keep the DEC-0049 follow-up linked to this assertion; when coverage ranges are settled, update TC-E2E-001's end-date assertion accordingly |

## Previous Review Disposition

Not applicable — initial review.

## Verdict

**Verdict:** PASS-WITH-WARNINGS

Every required validation command, including the Docker-backed `uv run pytest`
and `npm run test:e2e`, ran fresh and passed (14/14; e2e 17/17). All 12 TC-IDs
trace to implemented, passing tests and all 16 tasks are implemented. The two
MEDIUM findings are assertion-strength gaps in TC-E2E-005 and TC-E2E-009, and the
three LOW findings concern plan drift, type-check coverage and a decision-pinned
date assertion; none is a missing test or a failing command. Direct this
verdict to the final completion check; the owner may choose to send AR-001 and
AR-002 back to `$automation-coding`.
