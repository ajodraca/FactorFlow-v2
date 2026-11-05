---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-05
updated: 2026-11-05
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-11-05T23:10:43Z
reviewed_state_revision: sha256:497ddf15148d7fd74b2fff28a6ecd25cf8d89733727e7a7aaf4826f8552dac56
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-e2e-tests
    artifact_version: 1
    content_revision: sha256:e529ea318ca109793c398143b5fceb6c358e3acd27a065b78a14412b85ec8667
  - artifact_id: CAP-002-e2e-tests-automation-tasks
    artifact_version: 1
    content_revision: sha256:277a3beaabce7bf0f40caa36098784f69a4853e7c95fe159e8fe2be5ae319fa7
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-05T23:10:43Z
  source_artifacts:
    - id: CAP-002-e2e-tests
      version: "1"
    - id: CAP-002-e2e-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-e2e-tests — Version 1

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **CHANGES-REQUIRED** |
| Test cases | 7/12 |
| Automation tasks | 8/13 |
| Required commands | 16/21 |
| Findings | 6 |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 2 · **total 6**

The nine executing tests are sound and pass, alone and together, and the
existing CAP-001 suite stays green. The gate does not pass because four tests
never execute: TC-E2E-001, TC-E2E-009 and TC-E2E-010 and the after-the-run half
of TC-E2E-002 skip on the DEC-0285 guard. A skipped test is not a passing test,
and the approved factor-engine design gives the automation a way to run them
without the owner's payload keys (AR-001, DEC-0289).

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`, v1, `draft`, 12 cases (TC-E2E-001 to 012).
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md`, v1, `draft`, 13 tasks all checked. Its `Branch` line names `usr/alvaro-de-jodra/CAP-002-automation`; the work is on `usr/alvaro-de-jodra/CAP-002-automation-2`.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2` (the plan's `Component(s)` line: `FactorFlow-v2`), branch `usr/alvaro-de-jodra/CAP-002-automation-2`, HEAD `dbbc6571a84a9142c0c24e0c74db9485e597df2b`.
- **Base:** `46e0219` (merge of PR #171). Change-set commits for this specification: `97b98dc` (plan), `b2b673d` (T001 to T010), `ad99025` (T005), `dbbc657` (seeding and click fixes, T011 to T013). `763517d` and `24c5053` on the same branch belong to the integration specification and are outside this review.
- **Working tree:** clean before and after review (no staged, unstaged or untracked files; `git status --porcelain` empty).
- **Decisions read:** DEC-0285 (PROVISIONAL guard; blind second opinion disagreed, `triage: review`), DEC-0288 (T013 ticked over the `npm run lint` failure on `build/`).

### Changed Files

| File | Change |
| --- | --- |
| `scripts/run-e2e-server.sh` | modified: 1 s classification poll on the acquisition stack; header lists CAP-002 cases (T001) |
| `tests/e2e/support/massive_stub.py` | modified: per-symbol price drift, `NOF*` symbols and `no-fundamentals` mode answer empty statements (T002) |
| `tests/e2e/support/acquisition.ts` | modified: CAP-002 tables added to `DATA_TABLES`; `no-fundamentals` added to `ProviderMode` (T003) |
| `tests/e2e/support/classification.ts` | added: seeding, follow, universe, retire, set-wait and guard fixtures (T004) |
| `tests/e2e/research-after-download.spec.ts` | added: TC-E2E-001, TC-E2E-002 (T005) |
| `tests/e2e/universe-by-hand.spec.ts` | added: TC-E2E-003, TC-E2E-004 (T006) |
| `tests/e2e/universe-from-result.spec.ts` | added: TC-E2E-005, TC-E2E-006 (T007) |
| `tests/e2e/compare-and-evidence.spec.ts` | added: TC-E2E-007, TC-E2E-008 (T008) |
| `tests/e2e/fix-insufficient-evidence.spec.ts` | added: TC-E2E-009, TC-E2E-010 (T009) |
| `tests/e2e/universe-maintenance.spec.ts` | added: TC-E2E-011, TC-E2E-012 (T010) |

## Test Case and Traceability Verification

Every TC-ID maps to exactly one titled test (TC-E2E-002 to two, as the plan's
Notes state), every test carries its `// Implements TC-E2E-NNN` marker, and the
plan's traceability table matches the files. Traceability is bidirectional; the
gaps below are about execution and assertion strength.

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | PARTIAL | `tests/e2e/research-after-download.spec.ts` › "TC-E2E-001: a succeeded run leaves every stock scored…" | Skipped on every run ("Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)"); never executed (AR-001). Assertions weaker than the spec (AR-004). |
| TC-E2E-002 | PARTIAL | same file › "TC-E2E-002: before any run…" and "TC-E2E-002: after a run with 20 stocks…" | Before-run half passes (Instruments screen, "No stocks have been scored yet.", no table). After-run half skipped although it needs no payload key (AR-002). |
| TC-E2E-003 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` › TC-E2E-003 | Dialog create; detail URL, heading, exactly three rows, DDD absent; same percentiles on detail and on Research scoped to Core as under All followed stocks; listed among universes. |
| TC-E2E-004 | VERIFIED | same file › TC-E2E-004 | Dialog stays open with both symbols kept; alert names ZZZ with link to `/instruments`; Universes list empty afterwards. |
| TC-E2E-005 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` › TC-E2E-005 | Same n in heading, button and dialog; toast link; n members; origin line with filter and score date; after a real run and a new set, the same sorted member list. After that run value is unscored for every stock, so the filter matches differently and the membership still holds. |
| TC-E2E-006 | VERIFIED | same file › TC-E2E-006 | "No stocks match these filters." with Clear filters; save `aria-disabled` with its reason; forced click opens no dialog; no universe exists. |
| TC-E2E-007 | PARTIAL | `tests/e2e/compare-and-evidence.spec.ts` › TC-E2E-007 | Threshold, heading count, compare (9 percentile cells) and evidence (8 inputs, 8 Known on, 8 As of) verified. The sort assertion cannot fail when the sort does nothing (AR-003). |
| TC-E2E-008 | VERIFIED | same file › TC-E2E-008 | Three columns; BBB growth Incomplete with reason in title; RRR "Not followed" on all three factors; 5 percentile cells only. RRR retired through `DELETE /api/instruments/RRR`. |
| TC-E2E-009 | PARTIAL | `tests/e2e/fix-insufficient-evidence.spec.ts` › TC-E2E-009 | Skipped on every run (AR-001); step-1 and history assertions weaker than the spec (AR-004). |
| TC-E2E-010 | PARTIAL | same file › TC-E2E-010 | Skipped on every run (AR-001). |
| TC-E2E-011 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` › TC-E2E-011 | Rename, add, remove each visible at once; History 7 events newest first, rename "Core → Core 2"; as-of view three days back lists AAA, BBB, CCC and not DDD; retire shows Retired, leaves the active list, members and 8 history rows readable. |
| TC-E2E-012 | VERIFIED | same file › TC-E2E-012 | Remove `aria-disabled` with the last-member reason and Retire… in the row; forced click changes nothing; "Not followed" ×3 before and after retirement; History links RRR with "Stock added". |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `scripts/run-e2e-server.sh` | Only `ACQUISITION_ENV` gains `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS=1`, with comment; other stacks untouched. |
| T002 | PARTIAL | `tests/e2e/support/massive_stub.py` | Drift, `NOF*` and `no-fundamentals` implemented as planned and no fundamentals field added. Drift is exercised by TC-E2E-005's real run; the `NOF*` and `no-fundamentals` paths are used only by skipped tests and have never run (AR-001). |
| T003 | VERIFIED | `tests/e2e/support/acquisition.ts` | Six CAP-002 tables in `DATA_TABLES`; comment updated; `ProviderMode` extended; exports unchanged. Isolation runs confirm the reset empties them. |
| T004 | VERIFIED | `tests/e2e/support/classification.ts` | All planned helpers present; guard skips with the stated reason (JSON reporter annotation). Unplanned helpers `followStocks`, `seedUniverseRecorded`, coverage and reference inserts noted under AR-005. |
| T005 | PARTIAL | `tests/e2e/research-after-download.spec.ts` | One of three tests executes (AR-001, AR-002, AR-004). |
| T006 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` | Matches the task. |
| T007 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` | Matches the task, `test.setTimeout(120_000)` present. |
| T008 | PARTIAL | `tests/e2e/compare-and-evidence.spec.ts` | Sort order not effectively asserted (AR-003). |
| T009 | PARTIAL | `tests/e2e/fix-insufficient-evidence.spec.ts` | Both tests skip (AR-001). |
| T010 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` | TC-E2E-011's precondition is seeded by SQL with backdated events rather than "via API" (AR-005). |
| T011 | VERIFIED | full suite rerun | 27 passed, 4 skipped, nothing else skipped: matches the plan's expected result. |
| T012 | VERIFIED | six isolated runs plus the six files together | Each file passes alone; no leftover non-terminal run observed; no unused import (tsc `--strict` clean). |
| T013 | PARTIAL | gate commands | `npm run lint` and `npm run format` exit 1 on the gitignored `build/` bundle (AR-006, DEC-0288); `npx tsc --noEmit` covers only `web/src`, so it does not type-check the changed TypeScript (AR-005). |

## Independent Validation

All commands in `repos/factorflow-v2/FactorFlow-v2` (`.`). Commands needing the
Docker socket or the `uv` cache were sent outside the sandbox as one plain call
each, using `--prefix`/`--directory` in place of `cd`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run test:e2e` | `.` | 0 | PASS | 31 tests: 27 passed, 4 skipped (the four guarded CAP-002 tests), 3.1 min. Inside the sandbox it first failed on the Docker socket (`connect: operation not permitted`); rerun outside. |
| `npx playwright test` the six CAP-002 files (via `npm run test:e2e -- <six files>`) | `.` | 0 | PASS | 13 tests: 9 passed, 4 skipped, as the plan's test-specific validation expects. |
| `npm run test:e2e -- tests/e2e/research-after-download.spec.ts` | `.` | 0 | PASS | 1 passed, 2 skipped. |
| `npm run test:e2e -- tests/e2e/universe-by-hand.spec.ts` | `.` | 0 | PASS | 2 passed. |
| `npm run test:e2e -- tests/e2e/universe-from-result.spec.ts` | `.` | 0 | PASS | 2 passed. |
| `npm run test:e2e -- tests/e2e/compare-and-evidence.spec.ts` | `.` | 0 | PASS | 2 passed. |
| `npm run test:e2e -- tests/e2e/fix-insufficient-evidence.spec.ts --reporter=json` | `.` | 0 | PASS | 0 passed, 2 skipped; annotation "Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)". |
| `npm run test:e2e -- tests/e2e/universe-maintenance.spec.ts` | `.` | 0 | PASS | 2 passed. |
| `uv run pytest` | `.` | 0 | PASS | 2555 passed, 1 xfailed in 324 s, `postgres`-marked suites included (testcontainers reached Docker outside the sandbox). |
| `uv run pytest -m 'not postgres'` | `.` | 0 | PASS | 1636 passed, 919 deselected, 1 xfailed (`test_line_items_resolved.py`); nothing under `tests/e2e/` collected. |
| `uv run ruff check .` | `.` | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | `.` | 0 | PASS | 279 files already formatted. |
| `uv run mypy src` | `.` | 0 | PASS | No issues in 61 source files. |
| `npm run test` | `.` | 0 | PASS | Vitest: 77 files, 2101 tests passed. |
| `npm run lint` | `.` | 1 | FAIL | "Checked 189 files … Found 9000 errors"; all 1000 printed diagnostics are in `build/lib/factorflow/api/static/assets/index-*.js`, the gitignored `uv build` output (`git check-ignore build` → `build`). Supplementary `npx biome lint` over every tracked file (`git ls-files`): exit 0, 180 files. |
| `npm run format` | `.` | 1 | FAIL | Only the six `build/lib/.../index-*.js` bundles reported. Supplementary `npx biome format` over every tracked file: exit 0, 180 files. |
| `npx tsc --noEmit` | `.` | 0 | PASS | `tsconfig.json` includes only `web/src`. Supplementary `npx tsc --noEmit --strict --skipLibCheck --target es2022 --module esnext --moduleResolution bundler --lib es2022,dom --types node` over the six specs, `classification.ts` and `acquisition.ts`: exit 0. |
| `npm run build` | `.` | 0 | PASS | Vite: 102 modules, built in 993 ms. Working tree still clean. |
| `uv build` | `.` | — | NOT-RUN | Inside the sandbox: "Failed to initialize cache at `/Users/alvarodejodra/.cache/uv` … Operation not permitted (os error 1)". Outside it: refused as "Run outside of the sandbox" (no permission rule names `uv build`). No packaged file is in the change set. |
| `uv sync --all-extras` | `.` | — | NOT-RUN | Dependency install, not validation; no lockfile in the change set. |
| `npm ci` | `.` | — | NOT-RUN | Dependency install, not validation; no lockfile in the change set. |

## Findings

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-001 | HIGH | `skipUnlessLineItemsResolved(test)` in `research-after-download.spec.ts:48,75` and `fix-insufficient-evidence.spec.ts:60,95`; every run reports them skipped with the DEC-0285 reason. Approved `component-design-factor-engine.md` section 7: "Fixtures declare their own payload keys and pass them to the engine, so the tests do not wait on the owner's answer." `engine.py` reads `line_items.LINE_ITEMS` at call time; `tests/integration/engine_inputs_support.py` already installs `TEST_KEYS`; `tests/e2e/support/ingestion_e2e_main.py` is an existing test-only entry-point pattern. DEC-0285 is PROVISIONAL, not owner-reviewed, and its blind second opinion disagreed. | TC-E2E-001, 009 and 010 (two P1, one P2) and half of TC-E2E-002 have no executing automation. Flows 1 and 5 are untested end to end, and the guarded assertions, the `NOF*` and `no-fundamentals` stub paths and the assumption that `no-fundamentals` ends a run `partial` have never met the product. | Make the four tests execute: serve test payload keys on the acquisition stack (for example a test-only API entry point under `tests/e2e/support/` that installs test keys into `line_items.LINE_ITEMS` before starting the app, and stub statements carrying those keys with per-symbol control for BBB and CCC), then remove the guard. The task plan encodes the guard, so route the change through `$automation-planning` before `$automation-coding`. Alternatively the owner upholds DEC-0285 and records a time-boxed waiver of this verdict. |
| AR-002 | MEDIUM | `research-after-download.spec.ts:44-69` is guarded, but `src/factorflow/classification/sql/classify.sql` rule 3 writes `not_enough_stocks` for every active stock on any unranked factor whatever the payload keys. Real builds complete with unresolved keys (TC-E2E-005 waits for one and passes). | The after-the-run half of TC-E2E-002 (AC-14, AC-22) could run and pass today but is skipped, so its assertions are unverified. | Remove the guard from this test and run it as it stands. |
| AR-003 | MEDIUM | `compare-and-evidence.spec.ts:48-87`: the default order is symbol ascending (`web/src/screens/research/results-table.tsx:550`); the four filtered stocks AAA, CCC, DDD, EEE have momentum percentiles 90, 50, 30, 10, already descending in symbol order; the test accepts ascending or descending. | A regression in which "Sort by momentum percentile" does nothing still passes TC-E2E-007's "ordered by the chosen sort" expectation. | Seed momentum so that symbol order is not monotone in momentum, and assert the specific direction the sort control produces. |
| AR-004 | MEDIUM | TC-E2E-001 (`research-after-download.spec.ts:84-110`) reads percentiles only for `F00`, never a score, never that the as-of time is America/Chicago, and matches the incomplete reason with `.+` rather than the input. TC-E2E-009 (`fix-insufficient-evidence.spec.ts:68-87`) step 1 asserts neither the missing input nor the rule, and checks only that the first Earlier scores row has a date, not newest-first order. | Once unguarded, these tests would pass with parts of the spec's expected results broken: a stock without a score, a wrong time zone, an unnamed input, misordered history. | Assert a score and a whole-number percentile for each listed stock, the Chicago time zone in the as-of line, the named input in the Incomplete reason and on the growth card with its rule, and newest-first order of Earlier scores. |
| AR-005 | LOW | `followStocks` and `seedUniverseRecorded` (`classification.ts:231-276`) insert `instrument`, `universe` and backdated `universe_event` rows by SQL; T010 says TC-E2E-011's precondition is created "via API", and T004 lists neither helper nor the `coverage_segment` and `instrument_reference` inserts in `seedScoredStore`. `tsconfig.json` `include: ["web/src"]`, so T013's `npx tsc --noEmit` does not cover `tests/e2e/`. | The plan does not describe what was built, and its type-check gate does not reach the changed TypeScript (it is clean when checked explicitly). The preconditions themselves are reasonable: the API cannot backdate an event. | Record the SQL preconditions and their reason in the task plan, and type-check `tests/e2e/` in T013 (an explicit `tsc` invocation or a tests tsconfig). |
| AR-006 | LOW | `npm run lint` and `npm run format` exit 1; every diagnostic is in the gitignored `build/lib/factorflow/api/static/assets/` bundle that `uv build` leaves behind (DEC-0288). | Two required tech-stack commands fail on this checkout for a reason outside the change set, so a green gate cannot be shown with them as written. | Outside this change set: have `biome.json` ignore `build/` through its own change, or clear `build/` before the gate. Report it as the owner follow-up DEC-0288 names. |

## Previous Review Disposition

Not applicable — initial review.

## Verdict

**Verdict:** CHANGES-REQUIRED

Back to `$automation-coding`, through `$automation-planning` first, because
AR-001 and AR-002 change what the task plan says about the guard. Resolve AR-001
to AR-004. AR-005 and AR-006 do not block. The gate decision is recorded as
DEC-0289. The owner may instead uphold DEC-0285 and waive this verdict for
AR-001.
