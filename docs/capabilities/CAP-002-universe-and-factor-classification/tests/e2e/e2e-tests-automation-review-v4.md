---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-11-06T15:14:41Z
reviewed_state_revision: sha256:31ee97825a8de3e732e7b9ef7966612cc4501f633faf261cd569f88e9b203d88
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-e2e-tests
    artifact_version: 1
    content_revision: sha256:e529ea318ca109793c398143b5fceb6c358e3acd27a065b78a14412b85ec8667
  - artifact_id: CAP-002-e2e-tests-automation-tasks
    artifact_version: 1
    content_revision: sha256:bb2ac4d0f62485843db51ae09a4ba52c66eb00771dab6453f5539360aafd67bc
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-06T15:14:41Z
  source_artifacts:
    - id: CAP-002-e2e-tests
      version: "1"
    - id: CAP-002-e2e-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-e2e-tests — Version 4

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **CHANGES-REQUIRED** |
| Test cases | 8/12 |
| Automation tasks | 11/13 |
| Required commands | 16/16 (every command exits 0; 4 required tests skip inside `npm run test:e2e`, AR-010) |
| Findings | 1 |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0 · **total 1**

The owner asked for v3's AR-011 to be fixed now. The plan refinement `485a96d`
and the code rework `9d93e3b` do that, and they also clear AR-005 and AR-012.

- **AR-011 is resolved.** The stub now produces the two outcomes the guarded
  flow 5 cases need through status codes alone. A `NOF*` stock's statement
  paths answer 404, and a withheld stock's statement paths answer 503 until it
  is restored. I followed both answers through the product code. The 404
  becomes `InstrumentNotFound`, the fundamentals row is recorded `not_found`,
  the run ends `partial`, and the evidence card reads "the provider reports
  no …" with no recovery. The 503 becomes `ProviderUnavailable` once the
  retries run out, the row is recorded `failed`, the run ends `partial`, and
  the card offers the next-download recovery and the Data health link. No
  payload key is invented, so the change stays inside DEC-0285. A new unit test
  checks the stub's codes without waiting on the guard.
- **AR-012 is resolved.** TC-E2E-001's stock lacking one input is now `NEWAAA`,
  whose prices start 300 days ago. Under the momentum SQL only
  `return_12m` is missing, so momentum alone reads Incomplete, and the asserted
  title matches the engine's `reason_detail`.
- **AR-005 is resolved.** The plan now records the SQL-seeded preconditions,
  TC-E2E-009's third run and the `biome.json` ignore. `tsconfig.e2e.json`
  type-checks all of `tests/e2e/` and `playwright.config.ts`, and exits 0.

The gate still cannot pass, because of AR-010. TC-E2E-001, TC-E2E-009,
TC-E2E-010 and the after-the-run half of TC-E2E-002 skip on every run under
the owner-upheld DEC-0285. The skill passes a gate only when all required tests
pass, and no gate waiver is recorded. Only the owner can clear this.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`, v1, `draft`, 12 cases (TC-E2E-001 to 012). Unchanged since v1 (same content revision as v3).
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md`, v1, `draft`, 13 tasks, all checked. `485a96d` revised T002 to T005 and T009 to T013, the Summary, the Validation Plan and the Notes, and unticked the revised tasks. `9d93e3b` ticked them again and set `last_reworked_review: e2e-tests-automation-review-v3.md`. The `Branch` line names `usr/alvaro-de-jodra/CAP-002-automation-rework`, which matches the checkout. The content revision changed from v3's `sha256:d84d3ab3…` to the one recorded above.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2` (the plan's `Component(s)` line: `FactorFlow-v2`), branch `usr/alvaro-de-jodra/CAP-002-automation-rework`, HEAD `9d93e3b28c8e83a1ebcc1241838c418e870f06b2`.
- **Base:** `46e0219` (merge of PR #171). The change-set commits for this specification are `97b98dc`, `b2b673d`, `ad99025`, `dbbc657`, `fb9b284`, `c15c923`, `485a96d` (plan refinement) and `9d93e3b` (v3 rework). The review commits are `82f61d9`, `e1283ed` and `61b7aee`. The integration-specification commits on the same branch (`763517d`, `24c5053`, `d39bee0`, `2edbfcf`, `acb6ee3`, `6b57538`, `712952e`, `4ce26f7`) are outside this review.
- **Rework scope:** `9d93e3b` changes `tests/e2e/support/massive_stub.py`, `tests/e2e/support/acquisition.ts`, the two guarded spec files and the plan's checkboxes. It adds `tests/unit/test_massive_stub.py` and `tsconfig.e2e.json`. The four unguarded spec files, `classification.ts`, `scripts/run-e2e-server.sh` and `biome.json` are unchanged since v3.
- **Working tree:** clean before and after validation (`git status --porcelain` printed nothing). The ignored `build/` and `dist/` directories were present throughout, and `uv build` refreshed them. The fingerprint was identical before and after validation.
- **Decisions read:**
  - DEC-0285: `owner_reviewed: true`, `owner_verdict: upheld`, `review_mode: blind`, `blind_verdict: agreed`. The guard stays, and no payload key is invented in the stub.
  - DEC-0047: an empty successful read is valid no-data and is recorded `unchanged`. The rework now relies on it correctly.
  - DEC-0181: the evidence card reads "the provider reports no …" only for a `not_found` input.
  - DEC-0290: still `open` and unreviewed. `c15c923` superseded it in effect, and nothing in this rework relies on it.
- **Gate waiver:** none recorded for this specification.

### Changed Files

| File | Change |
| --- | --- |
| `biome.json` | modified (in `c15c923`): `files.ignore` gains `build/**`. Now planned in T013. |
| `scripts/run-e2e-server.sh` | modified: 1 s classification poll on the acquisition stack, and the header lists the CAP-002 cases (T001). Unchanged since v3. |
| `tests/e2e/support/massive_stub.py` | modified: per-symbol price drift. `NOF*` statement paths answer 404 `NOT_FOUND`. The `withhold` and `restore` controls make one symbol's statement paths answer 503 `UNAVAILABLE`, and `reset` clears them. `NEW*` bars start 300 days before today. The `no-fundamentals` mode is removed (T002). |
| `tests/e2e/support/acquisition.ts` | modified: the CAP-002 tables are in `DATA_TABLES`, `withholdSymbol` and `restoreSymbol` are added, and `ProviderMode` is back to `"ok" \| "reject-credential" \| "unavailable"` (T003). |
| `tests/e2e/support/classification.ts` | added: seeding, follow, universe, retire, set-wait and `skipUnlessLineItemsResolved` fixtures (T004). Unchanged since v3. |
| `tests/e2e/research-after-download.spec.ts` | added: TC-E2E-001 and TC-E2E-002 (T005). Two of its three tests are guarded. TC-E2E-001 now uses `NEWAAA`. |
| `tests/e2e/universe-by-hand.spec.ts` | added: TC-E2E-003 and TC-E2E-004 (T006). |
| `tests/e2e/universe-from-result.spec.ts` | added: TC-E2E-005 and TC-E2E-006 (T007). |
| `tests/e2e/compare-and-evidence.spec.ts` | added: TC-E2E-007 and TC-E2E-008 (T008). |
| `tests/e2e/fix-insufficient-evidence.spec.ts` | added: TC-E2E-009 and TC-E2E-010 (T009). Both are guarded. TC-E2E-009 withholds and restores BBB, and TC-E2E-010 pins both `NOFCCC` runs to `partial`. |
| `tests/e2e/universe-maintenance.spec.ts` | added: TC-E2E-011 and TC-E2E-012 (T010). |
| `tests/unit/test_massive_stub.py` | added (in `9d93e3b`): 14 unit tests of the stub's 404, 503, restore, reset, `NEW*` and removed-mode behaviour, run without a socket or container (T002). |
| `tsconfig.e2e.json` | added (in `9d93e3b`): extends `tsconfig.json` with `types: ["node"]` over `tests/e2e` and `playwright.config.ts` (T013). |

## Test Case and Traceability Verification

Every TC-ID maps to a test whose title carries the ID and whose body carries
`// Implements TC-E2E-NNN`. TC-E2E-002 maps to two tests, as the plan's Notes
say. Every implemented test and support file now traces to a planned task. The
SQL helpers, the third TC-E2E-009 run, `biome.json`, `tsconfig.e2e.json` and
`test_massive_stub.py` are all in the revised plan. Traceability is
bidirectional. The only gap is execution (AR-010).

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | PARTIAL | `tests/e2e/research-after-download.spec.ts` › "TC-E2E-001: a succeeded run leaves every stock scored…" | Skipped on every run with the DEC-0285 reason (AR-010). `NEWAAA` now lacks exactly one input. `momentum_inputs.sql` puts E one month before the set date and S₁₂ twelve months before E, so it falls before `NEWAAA`'s first bar. That makes `return_12m` missing while `return_3m` and `return_6m` are present. `classify.sql` writes `reason_detail` "12-month total return missing", and `CELL.incompleteDetail` makes the title "Incomplete: 12-month total return missing, so momentum can't be compared fairly…", which the asserted regex matches. Prices are still `written`, so the run can end `Succeeded`. AR-012 is resolved. |
| TC-E2E-002 | PARTIAL | same file › "…before any run…" (passes) and "…after a run with 20 stocks…" (skipped) | The before-run half passes. The after-run half is unchanged since v3 and never executed (AR-010). |
| TC-E2E-003 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` › TC-E2E-003 | Unchanged. Passes in the full suite and in the six-file run. |
| TC-E2E-004 | VERIFIED | same file › TC-E2E-004 | Unchanged. Passes. |
| TC-E2E-005 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` › TC-E2E-005 | Unchanged. Passes. |
| TC-E2E-006 | VERIFIED | same file › TC-E2E-006 | Unchanged. Passes. |
| TC-E2E-007 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` › TC-E2E-007 | Unchanged. Passes. |
| TC-E2E-008 | VERIFIED | same file › TC-E2E-008 | Unchanged. Passes. |
| TC-E2E-009 | PARTIAL | `tests/e2e/fix-insufficient-evidence.spec.ts` › TC-E2E-009 | Skipped on every run (AR-010). The mechanism now fits the assertions. `withholdSymbol("BBB")` gives a 503 on BBB's statement paths, which becomes `ProviderUnavailable` after the governor's retries (`rate_limit.py`, `max_attempts`). `classify_provider_error` records it `failed`, and `finalise` gives `partial`, which matches `:87`. `qualifying_run.sql` accepts `partial`, so a set is built. `acquisition_state.last_outcome` is `failed`, so `providerHoldsNoData` is false. The card then gives "…is missing" with the next-download line and the Data health link (`:89-96`). `restoreSymbol` and the second run give `succeeded` (`:100`). |
| TC-E2E-010 | PARTIAL | same file › TC-E2E-010 | Skipped on every run (AR-010). The mechanism now fits the assertions. `NOFCCC`'s 404 `NOT_FOUND` body becomes `InstrumentNotFound` (`classify_error_body`), which the governor does not retry. It is recorded `not_found`, and both runs end `partial` (`:146`, `:152`). `insert_inputs.sql` copies the `not_found` outcome into the missing input's `detail.last_acquisition`, so `providerHoldsNoData` is true. The card then reads "the provider reports no …" and "No action in FactorFlow changes this.", with no Data health link (`:148-150`, `:155-156`). |
| TC-E2E-011 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` › TC-E2E-011 | Unchanged. Passes. The SQL precondition is now planned (T004, T010). |
| TC-E2E-012 | VERIFIED | same file › TC-E2E-012 | Unchanged. Passes. |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `scripts/run-e2e-server.sh` | Unchanged since v3. |
| T002 | VERIFIED | `tests/e2e/support/massive_stub.py`, `tests/unit/test_massive_stub.py` | (a) The drift is unchanged. (b) `NOF*` statement paths answer `404, NOT_FOUND`, and the other paths answer 200. (c) `withhold` and `restore` are handled in `StubHandler`, `is_withheld` gives 503 `UNAVAILABLE` on statement paths only, and `reset` clears `_withheld`. (d) For `NEW*`, aggregates start at `max(start, today − 300 d)`. (e) `set_mode` refuses `no-fundamentals`. No financial field is added. The unit test covers (b) to (e) and passes (14 tests). Reverting (b) or (c) to an empty 200 would fail it. |
| T003 | VERIFIED | `tests/e2e/support/acquisition.ts` | `withholdSymbol` and `restoreSymbol` sit beside `holdSymbol` over `stubControl`, and `ProviderMode` drops `no-fundamentals`. No other export changes. `diagnose-failure.spec.ts` still uses `setProviderMode` with the three remaining modes. |
| T004 | VERIFIED | `tests/e2e/support/classification.ts` | Every export (`seedScoredStore`, `spreadStocks`, `fillerStocks`, `followStocks`, `followerSymbols`, `seedUniverseRecorded`, `createUniverseViaApi`, `addMembersViaApi`, `removeMemberViaApi`, `retireInstrument`, `currentSetId`, `waitForNewSet`, `skipUnlessLineItemsResolved`) is now named in T004. The skip annotation reads "Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)". |
| T005 | PARTIAL | `tests/e2e/research-after-download.spec.ts` | Built as the revised task says, with `NEWAAA` and momentum-only Incomplete. Only one of its three tests executes (AR-010). |
| T006 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` | Matches the task. |
| T007 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` | Matches the task. |
| T008 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` | Matches the task. |
| T009 | PARTIAL | `tests/e2e/fix-insufficient-evidence.spec.ts` | Built as the revised task says: withhold and restore BBB, three runs, `NOFCCC` `partial` twice, and timeouts of 240 s and 180 s. Neither test executes (AR-010). |
| T010 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` | Matches the revised task, including `seedUniverseRecorded("Core", …, 5)`. |
| T011 | VERIFIED | full suite | 31 tests: 27 passed and 4 skipped with the DEC-0285 reason, and nothing else skipped. This is what the task expects. |
| T012 | VERIFIED | six-file run, guarded-file run, full suite | The six files pass together (9 passed, 4 skipped). The two guarded files pass together (1 passed, 4 skipped). The four unguarded files and `classification.ts` are unchanged since v2, where each file passed alone. `acquisition.ts` changed only additively, apart from `ProviderMode`, and `tsc` confirms nothing uses the removed member. No helper is left over. `setProviderMode` is no longer imported by the CAP-002 specs, and `no-fundamentals` appears nowhere outside the unit test that checks it is refused. |
| T013 | VERIFIED | gate commands | `npx tsc --noEmit -p tsconfig.e2e.json` covers all 22 files under `tests/e2e/` plus `playwright.config.ts` (`--listFilesOnly`) and exits 0. `npm run lint` and `npm run format` exit 0 with `build/` on disk. The Python gates and `tests/unit/test_massive_stub.py` pass. |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2` (`.`). Every
command that needs the Docker socket, the `uv` cache or `node_modules` ran
outside the sandbox as one plain call, with `--prefix`, `--directory` or `-p`
in place of `cd`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm --prefix . run test:e2e` | `.` | 0 | PASS | 31 tests: 27 passed and 4 skipped (TC-E2E-001, TC-E2E-002 after the run, TC-E2E-009, TC-E2E-010), 3.1 min. A green exit, but not a green CAP-002 result (AR-010). |
| `npm --prefix . run test:e2e -- <the six CAP-002 files> --reporter=list` (the plan's test-specific `npx playwright test …`) | `.` | 0 | PASS | 13 tests: 9 passed and 4 skipped (16.8 s). This matches the plan's "Expected result today". |
| `npm --prefix . run test:e2e -- tests/e2e/research-after-download.spec.ts tests/e2e/fix-insufficient-evidence.spec.ts --reporter=json` | `.` | 0 | PASS | Stats show expected 1, skipped 4, unexpected 0 and flaky 0. Each skip carries the annotation "Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)" from `classification.ts:383`. |
| `uv run --directory . --offline pytest -q` | `.` | 0 | PASS | 2592 passed, 1 xfailed in 322.66 s, with the `postgres` suites included (testcontainers reached Docker outside the sandbox). That is 14 more than v3, which are the new stub tests. |
| `uv run --directory . --offline pytest -q -m "not postgres"` | `.` | 0 | PASS | 1650 passed, 942 deselected and 1 xfailed (`test_line_items_resolved.py`, the owner signal). That is 1636 plus the 14 stub tests. Nothing under `tests/e2e/` is collected. |
| `uv run --directory . --offline pytest tests/unit/test_massive_stub.py -v` | `.` | 0 | PASS | 14 passed in 0.33 s: three 404 paths, other `NOF*` data types 200, three 503 paths, withholding scoped to one symbol and to statements, restore, reset, `NEW*` bars from 300 days ago, `NEW*` statements served, and `no-fundamentals` refused. |
| `uv run --directory . --offline ruff check .` | `.` | 0 | PASS | All checks passed. |
| `uv run --directory . --offline ruff format --check .` | `.` | 0 | PASS | 284 files already formatted. One more than v3, which is `tests/unit/test_massive_stub.py`. |
| `uv run --directory . --offline mypy src` | `.` | 0 | PASS | No issues found in 61 source files. |
| `npm --prefix . run test` | `.` | 0 | PASS | Vitest: 77 files, 2101 tests passed. |
| `npm --prefix . run lint` | `.` | 0 | PASS | "Checked 180 files … No fixes applied", with `build/` on disk. |
| `npm --prefix . run format` | `.` | 0 | PASS | "Checked 180 files … No fixes applied." |
| `npx --prefix . tsc --noEmit -p tsconfig.json` | `.` | 0 | PASS | Covers `web/src` (`include`). |
| `npx --prefix . tsc --noEmit -p tsconfig.e2e.json` | `.` | 0 | PASS | No diagnostics. `--listFilesOnly` shows every `tests/e2e/**/*.ts` file and `playwright.config.ts`. v3's AR-005 type-check gap is closed. |
| `npm --prefix . run build` | `.` | 0 | PASS | Vite: 102 modules, built in 869 ms. The working tree is still clean. |
| `uv build --directory . --offline` | `.` | 0 | PASS | "Successfully built dist/factorflow-0.1.0.tar.gz" and "dist/factorflow-0.1.0-py3-none-any.whl". |
| `uv sync --all-extras`, `npm ci` | `.` | — | NOT-RUN | These are dependency installs, not validation, and no lockfile is in the change set. |

## Findings

AR-010 is carried open with its ID. No new finding is raised, so no ID is
issued.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-010 | HIGH | Carried from v3. Four required tests skip on every run: `research-after-download.spec.ts:54,81` and `fix-insufficient-evidence.spec.ts:80,140` call `skipUnlessLineItemsResolved(test)`. `line_items.unresolved()` is non-empty, and the server logs "line item … has no payload key" for all seven items. The JSON report shows 4 skipped with the DEC-0285 annotation. The skill passes a gate only when all required tests pass. DEC-0285 is owner-upheld, and no gate waiver is recorded. | TC-E2E-001 (P1), TC-E2E-009 (P1), TC-E2E-010 (P2) and half of TC-E2E-002 (P1) have no executing automation. Flows 1 and 5 are untested end to end. The AR-011 and AR-012 fixes are verified here by reading the product code and by the stub's unit test, not by any run of those four tests. | Under the upheld DEC-0285, `$automation-coding` cannot remove the guard. The owner clears this in one of two ways. (a) Resolve system design section 8 question 1, so the guard lifts and the tests run. That also needs the stub task the plan's Notes name: serve statements that carry the resolved keys, dated over recent and earlier quarters. (b) Record a time-boxed waiver of this blocking verdict with `scripts/artifact-gate.py waive`, with a rationale and an expiry. AR-011 no longer stands in the way of either path. |

## Previous Review Disposition

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v3 AR-005 | LOW | Resolved | The plan now records `followStocks` and `followerSymbols` (T004 and Notes), `seedUniverseRecorded` (T004, T010 and Notes), `currentSetId`, `spreadStocks`, `fillerStocks` and the coverage and reference inserts (T004). It also records the third TC-E2E-009 run (T009) and the `biome.json` `build/**` ignore (T013). `tsconfig.e2e.json` brings `tests/e2e/` under `tsc`, and the run exits 0. |
| v3 AR-010 | HIGH | Open, carried as AR-010 | There is no change to the guard, which DEC-0285 requires. There is no waiver, and the payload keys are still unresolved. |
| v3 AR-011 | HIGH | Resolved (code-verified, unexecuted) | T002 and T009 were revised in `485a96d` and implemented in `9d93e3b`. `NOF*` statement paths answer 404 and withheld statement paths answer 503. Both follow through `classify_error_body`, the governor, `classify_provider_error`, `finalise`, `qualifying_run.sql`, `insert_inputs.sql` and `factor-card.tsx` `statementFor` to the asserted outcomes (see TC-E2E-009 and TC-E2E-010). `no-fundamentals` is removed. The v3 note about statement dating is carried into the plan's Notes for the future key-serving stub task. |
| v3 AR-012 | LOW | Resolved (code-verified, unexecuted) | TC-E2E-001 uses `NEWAAA`. Only `return_12m` is missing, momentum alone is asserted Incomplete with the 12-month total return named, and value and growth are asserted to carry percentiles. A regression that voided another factor would now fail the test once it runs. |
| v2 AR-005 to AR-009, v1 AR-001 to AR-004 | HIGH, MEDIUM, LOW | Disposed in v2 and v3 | No change since v3 reopens them. |

## Verdict

**Verdict:** CHANGES-REQUIRED

AR-011, AR-012 and AR-005 are resolved, and every validation command exits 0.
One HIGH finding still blocks the gate: AR-010, the four required tests that
DEC-0285 keeps skipped. Nothing is left for `$automation-coding` to fix under
the current owner record. The next step is the owner's: resolve system design
section 8 question 1 (then add the key-serving stub task and run a new
`$automation-review`), or record a time-boxed waiver of this verdict.
