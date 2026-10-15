---
artifact_schema_version: 1
artifact_id: CAP-001-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-15
updated: 2026-10-15
test_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-10-15T02:39:49Z
reviewed_state_revision: sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7
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
  tool: Windsurf
  tool_version: unknown
  timestamp: 2026-10-15T02:39:49Z
  source_artifacts:
    - id: CAP-001-e2e-tests
      version: "1"
    - id: CAP-001-e2e-tests-automation-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Automation Review: CAP-001-e2e-tests — Version 4

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
(`docs/unattended-mode.md`). It ran in a fresh subagent that did not plan, code
or rework this change set. `pipeline-state.py check --stage automation-review`
reported `RESUME — automation code changed after review` for v3. Under
`owner-allowed` the same owner may act on this review, and no second reviewer is
needed. This review records evidence only. It approves nothing.

**Why the gate reopened.** `pipeline-state.py automation-revision` fingerprints
the whole component repository. v3 recorded
`sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3`. The
merges of EXP-20261012-1, CAP-001-E1-S7, CAP-001-E1-S8 and CAP-001-E1-S9 onto
the branch changed production code, so the current fingerprint differs. Only two
E2E automation files changed, and both changes are comments (see below).

## Review Subject

| Item | Value |
| --- | --- |
| Test specification | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md` (CAP-001-e2e-tests v1, draft; content revision unchanged since v1) |
| Automation task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests-automation-tasks.md` (CAP-001-e2e-tests-automation-tasks v2, draft; all 16 tasks checked; content revision unchanged since v1) |
| Component repository | `repos/factorflow-v2/FactorFlow-v2` (`FactorFlow-v2`, the plan's only `Component(s)` entry; also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-automation` at `2e892d154603fda3e04d4429cd86ee96bd3ed909` (merge of PR #117, CAP-001-E1-S9) |
| Working tree | Clean before and after validation (`git status --porcelain` empty); no staged, unstaged or untracked changes |
| Prior review | `e2e-tests-automation-review-v3.md`, PASS-WITH-WARNINGS. Its review subject was `9e410b2`, and the report was committed in `192584d` |
| Reviewed state revision | `sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7` (`pipeline-state.py automation-revision`, identical before and after validation) |

**Baseline for the diff.** The coordinator gave the v3 baseline as `ef2dd7c`
(`43ef0e1`). In git, v3's report commit `192584d` and its subject `9e410b2` both
come before `43ef0e1` and `ef2dd7c`, and all four are ancestors of `HEAD`.
`git diff --stat 9e410b2 ef2dd7c -- tests/e2e scripts/run-e2e-server.sh playwright.config.ts`
is empty. The E2E diff is therefore the same from either baseline, and I checked
both.

**What changed since v3, from git.**
`git diff ef2dd7c HEAD -- tests/e2e scripts/run-e2e-server.sh playwright.config.ts`
touches two files, both in `c8dd959` (CAP-001-E1-S8, "ship the migrations as
package data"):

- `tests/e2e/fixtures/coverage-seed.sql` (+1/−1): a comment now cites
  `src/factorflow/db/migrations/0001-0003` instead of `migrations/0001-0003`.
  The SQL is unchanged.
- `tests/e2e/support/acquisition.ts` (+1/−1): the doc comment on `DATA_TABLES`
  now cites `src/factorflow/db/migrations/0001`-`0004`. The table list and
  every export are unchanged.

`scripts/run-e2e-server.sh`, `playwright.config.ts`, `package.json`,
`tsconfig.json`, every `tests/e2e/*.spec.ts`, `tests/e2e/support/massive_stub.py`,
`tests/e2e/support/database.ts` and `tests/e2e/support/ingestion_e2e_main.py`
are unchanged since v3.

**Production changes the E2E stacks depend on.** I read these against the
three stacks in `scripts/run-e2e-server.sh`:

- CAP-001-E1-S7 (`src/factorflow/api/app.py`) adds `_add_host_origin_middleware`.
  It returns `400 host_not_allowed` unless `Host` is `127.0.0.1`, `localhost` or
  `[::1]` on `ApiSettings().port`. It returns `403 origin_not_allowed` for a
  state-changing request whose `Origin` is not one of those three origins. The
  script exports `FACTORFLOW_API_PORT=8123` for the main API and passes
  `FACTORFLOW_API_PORT="$ACQ_PORT"` to the acquisition API. Each stack's own
  `Host` and `Origin` (`http://127.0.0.1:8123`, `http://127.0.0.1:8125`)
  therefore pass. Every acquisition-stack journey that starts a run, sets the
  depth or adds an instrument through the browser passed fresh.
- CAP-001-E1-S8 moves the migrations into the package
  (`src/factorflow/db/migrations/`) and confines `FACTORFLOW_DATABASE_URL` to
  loopback unless `verify-full` is set. Every URL in the script is
  `127.0.0.1:${DB_PORT}`. All three `migrate_main` calls succeeded, and the
  refused start still exited 2, or the script would have aborted the suite.
- CAP-001-E1-S9 rewrites `Dockerfile` as a multi-stage release image. The `CMD`
  (`sh -c "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"`)
  is byte-identical to the chain the script runs for TC-E2E-012 (line 127).
  TC-E2E-012 therefore still exercises the production start chain.

### Changed Files

The reviewed change set is the E2E automation from v3's table, plus
`tests/e2e/fixtures/coverage-seed.sql`, which `c8dd959` touched since v3. As in
v1–v3, task-plan and report documents are excluded because they are
documentation. Production files changed by E1-S7, E1-S8 and E1-S9 belong to
those stories and their own reviews, so they are not listed here.

| File | Change |
| --- | --- |
| `scripts/run-e2e-server.sh` | modified (unchanged since v3): acquisition stack (API 8125, runner, stub 8126), refused start on 8124, backoff for DEC-0048 |
| `tests/e2e/support/massive_stub.py` | added (unchanged since v3): stub Massive provider with ok, reject-credential, unavailable, hold, release and reset controls, plus the request log at `GET /__stub/requests` |
| `tests/e2e/support/acquisition.ts` | added; modified in `c8dd959` (comment only: migrations path now `src/factorflow/db/migrations/`): acquisition-stack helpers, stub controls, store reset and shared UI helpers |
| `tests/e2e/fixtures/coverage-seed.sql` | modified in `c8dd959` (comment only: migrations path now `src/factorflow/db/migrations/`): TC-E2E-003 seed, SQL unchanged |
| `tests/e2e/acquisition-stack-stub.spec.ts` | added (unchanged since v3): TC-INT-027 (integration specification), run by the E2E suite |
| `tests/e2e/support/database.ts` | modified (unchanged since v3): optional database parameter for `sql()` |
| `tests/e2e/coverage-expansion.spec.ts` | modified (unchanged since v3): TC-E2E-003 annotation plus presence and last-acquired assertions |
| `tests/e2e/cancel-run.spec.ts` | modified (unchanged since v3): TC-E2E-008 annotation only |
| `tests/e2e/coverage-empty.spec.ts` | added (unchanged since v3): TC-E2E-004 |
| `tests/e2e/startup-refusal.spec.ts` | added (unchanged since v3): TC-E2E-012 |
| `tests/e2e/first-run.spec.ts` | added (unchanged since v3): TC-E2E-001 |
| `tests/e2e/diagnose-failure.spec.ts` | added (unchanged since v3): TC-E2E-002 and TC-E2E-005 |
| `tests/e2e/unrecognised-instrument.spec.ts` | added (unchanged since v3): TC-E2E-006 |
| `tests/e2e/cancel-in-progress.spec.ts` | added (unchanged since v3): TC-E2E-007 |
| `tests/e2e/instrument-changes.spec.ts` | added (unchanged since v3): TC-E2E-009 and TC-E2E-010 |
| `tests/e2e/startup-health.spec.ts` | added (unchanged since v3): TC-E2E-011 |

`playwright.config.ts`, `package.json` and `tsconfig.json` are unchanged and
are not in the change set.

## Test Case and Traceability Verification

`grep -rhoE 'test\("TC-E2E-[0-9]{3}' tests/e2e | sort | uniq -c` finds each of
TC-E2E-001 to 012 exactly once, in a Playwright test title. Each maps to the
tasks in the plan's traceability table, and every implementation task maps back
to at least one TC-ID. All 12 titled tests ran and passed in the fresh
`npm run test:e2e` below (`retries: 0`, so no pass is a retry), now against the
E1-S7 Host/Origin middleware and the E1-S8 packaged migrations. I re-read every
spec file against the specification.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | VERIFIED | `tests/e2e/first-run.spec.ts` "TC-E2E-001: a first acquisition succeeds…" | Depth, instruments and the start all go through the UI. Run detail shows Succeeded. Each instrument has four present badges, a covered-from date, and covered-to equal to host-local today (DEC-0049; AR-005). The stub log shows the requested range `2025-10-14`–`2026-10-14` while UTC was already 2026-10-15, which confirms the host-local dependence. Passed `[10/18]` |
| TC-E2E-002 | VERIFIED | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-002: …unavailable provider…" | `unavailable` stub mode (DEC-0048; the spec precondition allows it). Each instrument × data type row shows Failed with an `[unavailable]` reason, and Coverage shows the never-acquired copy with no DFA/DFB rows. Passed `[8/18]` |
| TC-E2E-003 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` "TC-E2E-003: a gap count sits in the row…" | Main stack. Gap count, expansion to 2024-01-04, presence (Present / Unknown, DEC-0030) and last-acquired assertions. The seed's SQL is unchanged. Passed `[7/18]` |
| TC-E2E-004 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` "TC-E2E-004: …" | Store reset in `beforeEach`. Never-acquired copy, zero row headers, and no filter no-match copy. Passed `[6/18]` |
| TC-E2E-005 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` "TC-E2E-005: …" | The re-run succeeds, DXA covered-from is unchanged, there is one row each for DXA and DXB, and earlier runs keep their outcomes. The failed run is opened, but only its `Failed` badge is checked. Failure detail is not inspected (AR-001). Passed `[9/18]` |
| TC-E2E-006 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` "TC-E2E-006: …" | The outcome is Partial, not Failed. UNKQ Reference shows Not found with its reason and `req_notfound_001`, and UQA has all four badges present. Passed `[18/18]` |
| TC-E2E-007 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` "TC-E2E-007: …" | CXB is held. The run goes Running → Cancelling → Cancelled through the dialog (a POST now subject to the E1-S7 Origin check, which passes on the stack's own origin). CXA coverage is retained and CXC has none. Passed `[2/18]` |
| TC-E2E-008 | VERIFIED | `tests/e2e/cancel-run.spec.ts` "TC-E2E-008: a cancel that races completion…" | Annotation only (DEC-0027, T006). Main stack. Passed `[5/18]` |
| TC-E2E-009 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-009: …" | ICB presence is asserted and ICA is undisturbed. "Populated to the stated depth" is checked only as ICB covered-from equal to ICA covered-from (line 69), never against the 1-year depth (AR-002). Passed `[11/18]` |
| TC-E2E-010 | VERIFIED | `tests/e2e/instrument-changes.spec.ts` "TC-E2E-010: …" | ICC is retired mid-run (ICA held). The retired badge and retained range show, run 2's roster includes ICC, and run 3 excludes it with ICC's last-acquired unchanged. Passed `[12/18]` |
| TC-E2E-011 | VERIFIED | `tests/e2e/startup-health.spec.ts` "TC-E2E-011: …" | Answering. The outcome badge matches `GET /api/health` `most_recent_run` or shows "No run recorded". A non-loopback connection to 8123 is refused. Passed `[16/18]` |
| TC-E2E-012 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` "TC-E2E-012: …" plus the exit-2 guard in `scripts/run-e2e-server.sh` | The bundle loads from 8123 with `/api` routed to the refused 8124. The page shows the unreachable message and Not answering, and a direct request to 8124 rejects. The guarded chain is byte-identical to the E1-S9 `Dockerfile` `CMD`. Passed `[17/18]` |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `tests/e2e/support/massive_stub.py` | Unchanged since v3. Loopback-only `ThreadingHTTPServer` serving every client path, weekday bars per range and `UNK`→404, with mode, hold, release and reset controls. The `unavailable` mode and `/__stub/requests` control are not in the T001 text (AR-003, AR-006). Not collected by pytest (`--collect-only` lists no `massive_stub` item) |
| T002 | VERIFIED | `scripts/run-e2e-server.sh` | Unchanged since v3. Refused-start exit-2 guard, stub, acquisition API and runner with child-only env, 8125 health poll, and `cleanup()` kills every PID. Per-stack `FACTORFLOW_API_PORT` keeps each stack inside the E1-S7 Host allow-list. The entry point and key differ from the T002 text (AR-003). `docker ps -a --filter name=factorflow-e2e-postgres` was empty after the run |
| T003 | VERIFIED | `tests/e2e/support/database.ts` | Unchanged since v3 |
| T004 | VERIFIED | `tests/e2e/support/acquisition.ts` | Only a comment changed (`c8dd959`). `DATA_TABLES` still lists the ten data tables. Every acquisition-stack spec resets in `beforeEach`. The T004 text still cites `migrations/0001`–`0004` (AR-003) |
| T005 | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` | Unchanged since v3. Asserts Unknown, not the plan's "absent", per DEC-0030 (AR-003) |
| T006 | VERIFIED | `tests/e2e/cancel-run.spec.ts` | Unchanged since v3 |
| T007 | VERIFIED | `tests/e2e/coverage-empty.spec.ts` | Unchanged since v3 |
| T008 | VERIFIED | `tests/e2e/first-run.spec.ts` | Unchanged since v3. The end date is today, per DEC-0049 (AR-003, AR-005) |
| T009 | PARTIAL | `tests/e2e/diagnose-failure.spec.ts` | Unchanged since v3. TC-E2E-005 skips the failure-detail inspection the task names (AR-001) |
| T010 | VERIFIED | `tests/e2e/unrecognised-instrument.spec.ts` | Unchanged since v3 |
| T011 | VERIFIED | `tests/e2e/cancel-in-progress.spec.ts` | Unchanged since v3. `resetStub()` in `afterEach` releases the hold |
| T012 | PARTIAL | `tests/e2e/instrument-changes.spec.ts` | Unchanged since v3. The TC-E2E-009 depth assertion is relative only (AR-002) |
| T013 | VERIFIED | `tests/e2e/startup-health.spec.ts` | Unchanged since v3 |
| T014 | VERIFIED | `tests/e2e/startup-refusal.spec.ts` | Unchanged since v3 |
| T015 | VERIFIED | Fresh `npm run test:e2e` below | 18 passed: the plan's 17 expected tests plus the integration specification's TC-INT-027 test (AR-006). Every stub request in the log is from the loopback stub on 8126, and the main stack calls no provider. Container removed afterwards |
| T016 | PARTIAL | Fresh validation commands below | Every listed command passes, but `npx tsc --noEmit` still covers only `web/src`. No `tests/e2e/**/*.ts` file is type-checked (AR-004) |

## Independent Validation

All commands ran in `repos/factorflow-v2/FactorFlow-v2` on branch
`usr/alvaro-de-jodra/CAP-001-automation` at `2e892d1`, one after another,
between 2026-10-15T02:31:24Z and 2026-10-15T02:39:49Z, with Docker 28.3.2
available. The list is the union of the task plan's Validation Plan and the
tech stack's Validation Commands table (14 commands). The coordinator named
nine of them; I also ran the other five the tech stack requires. Logs went to
`/tmp/ar-v4/`, outside the repository.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome lint: 97 files checked, no fixes applied |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome format: 97 files checked, no fixes applied |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output. `tsconfig.json` includes `web/src` only (AR-004) |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite build into the gitignored `src/factorflow/api/static/` |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Playwright chromium, 1 worker, `retries: 0`: 18/18 passed in 3.0m. All 12 TC-E2E titles ran, plus TC-INT-027. `posttest:e2e` ran and left no `factorflow-e2e-postgres` container |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 193 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 47 source files |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 786 passed, 274 deselected, 2 warnings. The stub is not collected |
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 46 packages resolved, 43 checked |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Install-script warnings only |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vitest: 297/297 tests |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist and wheel into the gitignored `dist/` |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1060/1060 passed in 235.67s, including the postgres-marked suites (testcontainers) |

All build and test outputs went to gitignored paths (`test-results/`, `dist/`,
`build/`, `src/factorflow/api/static/`, caches). `git status --porcelain` was
empty after validation. `pipeline-state.py automation-revision` gave
`sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7`
before and after.

## Findings

All six v3 findings are still open, and they keep their IDs. The only E2E code
change since v3 is two comments, which address none of them. AR-003 gains one
item: since `c8dd959`, the T004 text cites a migrations path that no longer
exists. There are no new findings.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | MEDIUM | `tests/e2e/diagnose-failure.spec.ts` lines 100–102: TC-E2E-005 opens the failed run from Runs, but checks only the summary badge `Failed`. Nothing checks failure detail. Spec step 1 says "inspect its failure detail", and T009 says "open that run's failure detail". DEC-0048 records that no screen shows a rejected credential's run-level `failure_reason` | If failure detail on a failed run were removed or broken, TC-E2E-005 would still pass. The "diagnosed" half of "diagnosed and recovered" is unverified | Assert an owner-visible failure detail on the failed run, for example by driving it with a mode that gives per-data-type reasons, as TC-E2E-002 does. Alternatively, record an owner decision and a plan revision accepting that TC-E2E-005 cannot inspect detail until run-level reasons are shown |
| AR-002 | MEDIUM | `tests/e2e/instrument-changes.spec.ts` line 69: TC-E2E-009 asserts ICB covered-from equals ICA covered-from. `tests/e2e/first-run.spec.ts` line 56 asserts only a date pattern for covered-from. No test compares covered-from, or the Depth column, with the 1-year depth set on Settings | If the stated depth were ignored or mis-applied the same way for every instrument, TC-E2E-009's "populated to the stated depth" would still pass | Assert ICB covered-from (or the Depth column) against the depth set on Settings, for example the expected start date for a 1-year depth on the run date |
| AR-003 | LOW | All tasks are checked, but the task-plan text no longer matches the implementation. T001 lists only the modes `ok` and `reject-credential`. T002 names `python -m factorflow.ingestion_main` and the key `e2e-test-key`, but the script runs `tests/e2e/support/ingestion_e2e_main.py` with a generated `TEST-ONLY-…` key. T005 says absent, but Unknown is asserted. T008 says latest weekday, but today is asserted. T009 drives TC-E2E-002 with reject-credential, but `unavailable` is used. New since v3: T004 and the Test Infrastructure section cite `migrations/0001`–`0004`, which `c8dd959` (CAP-001-E1-S8) moved to `src/factorflow/db/migrations/`. DEC-0030, DEC-0037, DEC-0048, DEC-0049, CAP-001-E3-S7 or CAP-001-E1-S8 covers each deviation | The plan does not describe what was built. A later reader or re-plan would work from stale task text and a path that no longer exists | Revise the task plan via `$automation-planning` to match the decided behaviour and current paths, and cite the decisions |
| AR-004 | LOW | `tsconfig.json` has `"include": ["web/src"]` (unchanged). T016 lists `npx tsc --noEmit` as covering changed files, but no validation command type-checks any `tests/e2e/**/*.ts` file, including `tests/e2e/support/acquisition.ts` and `tests/e2e/acquisition-stack-stub.spec.ts`. Playwright transpiles without type checking, and Biome only lints | Type errors in the E2E specs and helpers go unnoticed until runtime | Add a type check that covers `tests/e2e` (for example an E2E tsconfig run in validation), or record in the plan that E2E TypeScript is lint-only |
| AR-005 | LOW | `tests/e2e/first-run.spec.ts` lines 30–34 and 59 assert covered-to equals host-local today (DEC-0049). This pins the runner's requested-range behaviour, which DEC-0049 notes contradicts `component-design-observation-writer.md` section 2.5. The runner's `date.today()` and the test's date are read at different moments. This run requested `…/2026-10-14` while UTC was 2026-10-15, so the assertion depends on the host's local calendar | The assertion will have to change when the standard-lane follow-up lands, and a run that crosses local midnight could fail spuriously | Keep the DEC-0049 follow-up linked to this assertion. When coverage ranges are settled, update TC-E2E-001's end-date assertion |
| AR-006 | LOW | `tests/e2e/acquisition-stack-stub.spec.ts` (TC-INT-027) still runs in the E2E suite, and the E2E-owned `tests/e2e/support/massive_stub.py` and `tests/e2e/support/acquisition.ts` still carry the integration plan's `GET /__stub/requests`, `stubRequests()` and `ingestionProcessIsRunning()`. The E2E plan still says "Expect 17 tests passing" (T015, Validation Plan), and T001 and T004 do not mention the shared use. The fresh run passed 18 | `npm run test:e2e` does not produce the count the E2E plan uses as its oracle. The plan does not show that two specifications depend on these support files, so a change for one could break the other unnoticed | When AR-003's plan revision is made, state the shared-suite count (17 E2E tests plus the integration tests in `tests/e2e`) or count only TC-E2E titles, and record in T001/T004 that the integration plan's T026/T027 extend these files |

## Previous Review Disposition

v3 is `e2e-tests-automation-review-v3.md` (review subject `9e410b2`, report
commit `192584d`). Since then, the only E2E automation change is `c8dd959`,
which edited one comment in `tests/e2e/support/acquisition.ts` and one in
`tests/e2e/fixtures/coverage-seed.sql`. `git diff 9e410b2 HEAD` is empty for
`tests/e2e/diagnose-failure.spec.ts`, `tests/e2e/instrument-changes.spec.ts`,
`tests/e2e/first-run.spec.ts`, `tests/e2e/acquisition-stack-stub.spec.ts`,
`tests/e2e/support/massive_stub.py`, `tsconfig.json`,
`scripts/run-e2e-server.sh` and the E2E task plan (same content revision).

- **v3/AR-001 (MEDIUM): open, carried forward as AR-001.**
  `tests/e2e/diagnose-failure.spec.ts` is unchanged. TC-E2E-005 still checks
  only the `Failed` badge on the failed run.
- **v3/AR-002 (MEDIUM): open, carried forward as AR-002.**
  `tests/e2e/instrument-changes.spec.ts` is unchanged. The depth assertion is
  still relative (line 69).
- **v3/AR-003 (LOW): open, carried forward as AR-003, with one item added.** The
  task plan is unchanged, and the stale task text remains. `c8dd959` adds a
  stale migrations path to T004.
- **v3/AR-004 (LOW): open, carried forward as AR-004.** `tsconfig.json` is
  unchanged (`include: ["web/src"]`).
- **v3/AR-005 (LOW): open, carried forward as AR-005.**
  `tests/e2e/first-run.spec.ts` is unchanged. It still asserts covered-to
  equals today (DEC-0049).
- **v3/AR-006 (LOW): open, carried forward as AR-006.** The shared suite still
  runs 18 tests, and the plan still expects 17.

## Verdict

**Verdict:** PASS-WITH-WARNINGS

The gate reopened because the repository-wide fingerprint moved when the
EXP-20261012-1, CAP-001-E1-S7, CAP-001-E1-S8 and CAP-001-E1-S9 work merged.
The E2E automation changed in only two comments. The production changes it now
runs against were each checked against the E2E stacks: the E1-S7 Host/Origin
middleware, the E1-S8 packaged migrations and loopback database-URL
confinement, and the E1-S9 `Dockerfile` with an unchanged `CMD`. All 12
TC-E2E journeys passed in a fresh run with no retries. All 14 required
validation commands ran fresh against the current tree and passed, including
the Docker-backed `uv run pytest` (1060/1060) and `npm run test:e2e` (18/18).
All 12 TC-IDs trace to implemented, passing tests, and all 16 tasks are
implemented. The two MEDIUM findings (AR-001, AR-002) are weak assertions in
TC-E2E-005 and TC-E2E-009. The four LOW findings (AR-003 to AR-006) are plan
drift, missing type-check coverage, a date assertion pinned by a decision, and
the stale test count in the plan. None is a missing test or a failing command,
so none blocks.

Send this verdict to the final completion check. The owner may choose to send
AR-001 and AR-002 back to `$automation-coding`.
