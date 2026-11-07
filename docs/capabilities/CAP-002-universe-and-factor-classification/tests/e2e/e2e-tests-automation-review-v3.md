---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests-automation-review
artifact_type: automation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
test_spec: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md
automation_tasks: docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md
reviewed_at: 2026-11-06T05:28:02Z
reviewed_state_revision: sha256:8592392378628719a8a4fbf512a20d090c1e204797202a7a11263f643acd4688
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-e2e-tests
    artifact_version: 1
    content_revision: sha256:e529ea318ca109793c398143b5fceb6c358e3acd27a065b78a14412b85ec8667
  - artifact_id: CAP-002-e2e-tests-automation-tasks
    artifact_version: 1
    content_revision: sha256:d84d3ab3fe5b3e4972148dea1edb3fe6b77bc538947f6c6286680d25056c1314
ai_provenance:
  agent_id: automation-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-06T05:28:02Z
  source_artifacts:
    - id: CAP-002-e2e-tests
      version: "1"
    - id: CAP-002-e2e-tests-automation-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Automation Review: CAP-002-e2e-tests — Version 3

## Gate Summary

| Field | Result |
| --- | --- |
| Verdict | **CHANGES-REQUIRED** |
| Test cases | 8/12 |
| Automation tasks | 9/13 |
| Required commands | 13/13 (every command exits 0; 4 required tests skip inside `npm run test:e2e`, AR-010) |
| Findings | 4 |

**By severity:** CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 2 · **total 4**

The rework `c15c923` brings the code back to the task plan under DEC-0285, which
the owner upheld after a blind review that agreed with it. The plan and the code
now agree again, so v2's AR-007 is resolved, and so are AR-006, AR-008 and
AR-009. The full Playwright suite exits 0 with 27 passed and 4 skipped, which is
the result the plan expects.

The gate still cannot pass, for two reasons:

- **The skips (AR-010).** TC-E2E-001, TC-E2E-009, TC-E2E-010 and the after-run
  half of TC-E2E-002 skip on every run. The skill passes a gate only when all
  required tests pass, and no gate waiver is recorded. Under the upheld DEC-0285
  only the owner can clear this, by resolving system design section 8 question 1
  or by recording a time-boxed waiver of this verdict.
- **A design defect (AR-011).** TC-E2E-009 and TC-E2E-010 rest on a stub
  behaviour that the product reads differently. A provider answer of 200 with an
  empty list is "no data, unchanged" (DEC-0047), not "not found" and not a
  failure. So once the guard lifts, those two tests fail against a correct
  product. This is fixable now, without inventing a payload key.

## Review Subject

- **Test specification:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md`, v1, `draft`, 12 cases (TC-E2E-001 to 012). Unchanged since v1 (same content revision).
- **Task plan:** `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests-automation-tasks.md`, v1, `draft`, 13 tasks, all checked. Since v2 it changed only in `last_reworked_review: e2e-tests-automation-review-v2.md` and the `Branch` line, which now names `usr/alvaro-de-jodra/CAP-002-automation-rework` and matches the checkout.
- **Component repository:** `repos/factorflow-v2/FactorFlow-v2` (the plan's `Component(s)` line: `FactorFlow-v2`), branch `usr/alvaro-de-jodra/CAP-002-automation-rework`, HEAD `c15c923e02b4b81fbdb219181a8dcf497280ad37`.
- **Base:** `46e0219` (merge of PR #171). The change-set commits for this specification are `97b98dc` (plan), `b2b673d`, `ad99025` and `dbbc657` (T001 to T013), `fb9b284` (v1 rework, DEC-0290) and `c15c923` (v2 rework). The review commits are `82f61d9` and `e1283ed`. The integration-specification commits on the same branch (`763517d`, `24c5053`, `d39bee0`, `2edbfcf`, `acb6ee3`, `6b57538`, `712952e`, `4ce26f7`) are outside this review.
- **Rework scope:** `c15c923` reverts `fb9b284`'s test-support changes. `git diff dbbc657 c15c923` shows no difference in `tests/e2e/support/`, `scripts/` or `tests/unit/`. `tests/unit/test_run_e2e_server_script.py` is back to its base content, and `api_e2e_main.py` and `e2e_line_items.py` are gone. Only three things change against the v1-reviewed state: the two guarded spec files keep v1's stronger assertions, `compare-and-evidence.spec.ts` keeps its non-monotone sort, and `biome.json` ignores `build/**`.
- **Working tree:** clean before and after validation (`git status --porcelain` printed nothing). The ignored `build/` directory was present throughout, which is the condition that made `npm run lint` fail in v1 and v2. The fingerprint was identical before and after validation.
- **Decisions read:**
  - DEC-0285: owner-reviewed and upheld (`review_mode: blind`, `blind_verdict: agreed`). The guard is kept and no payload key is invented in the stub.
  - DEC-0288: T013 over the lint failure on `build/`.
  - DEC-0289 and DEC-0291: the v1 and v2 gate calls.
  - DEC-0290: rework without a plan revision. It is superseded in effect by `c15c923` and is still open and unreviewed.
  - DEC-0047: owner decision in CAP-001, cited by `src/factorflow/ingestion/massive/client.py`. An empty successful read is valid no-data.
- **Gate waiver:** none recorded for this specification.

### Changed Files

| File | Change |
| --- | --- |
| `biome.json` | modified (in `c15c923`): `files.ignore` gains `build/**`, so Biome no longer reads the gitignored `uv build` output (v2 AR-006). No task plans it (AR-005). |
| `scripts/run-e2e-server.sh` | modified: 1 s classification poll on the acquisition stack, and the header lists CAP-002 cases (T001). The acquisition API again starts through `python -m factorflow.app_main`. |
| `tests/e2e/support/massive_stub.py` | modified: per-symbol price drift. `NOF*` symbols and the `no-fundamentals` mode answer 200 with an empty `results` list (T002). |
| `tests/e2e/support/acquisition.ts` | modified: the CAP-002 tables are in `DATA_TABLES`, and `no-fundamentals` is in `ProviderMode` (T003). |
| `tests/e2e/support/classification.ts` | added: seeding, follow, universe, retire, set-wait and `skipUnlessLineItemsResolved` fixtures (T004). |
| `tests/e2e/research-after-download.spec.ts` | added: TC-E2E-001 and TC-E2E-002 (T005). Two of its three tests are guarded. |
| `tests/e2e/universe-by-hand.spec.ts` | added: TC-E2E-003 and TC-E2E-004 (T006). |
| `tests/e2e/universe-from-result.spec.ts` | added: TC-E2E-005 and TC-E2E-006 (T007). |
| `tests/e2e/compare-and-evidence.spec.ts` | added: TC-E2E-007 and TC-E2E-008 (T008). |
| `tests/e2e/fix-insufficient-evidence.spec.ts` | added: TC-E2E-009 and TC-E2E-010 (T009). Both are guarded. |
| `tests/e2e/universe-maintenance.spec.ts` | added: TC-E2E-011 and TC-E2E-012 (T010). |

## Test Case and Traceability Verification

Every TC-ID maps to a test whose title carries the ID and whose body carries
`// Implements TC-E2E-NNN`. TC-E2E-002 maps to two tests, as the plan's Notes
say. The plan's traceability table matches the files, and no implemented test
or support file lacks a task, apart from the items in AR-005. Traceability is
bidirectional. The gaps are about execution (AR-010) and the design of the
guarded tests (AR-011).

| TC ID | Result | Automated Test Evidence | Notes |
| --- | --- | --- | --- |
| TC-E2E-001 | PARTIAL | `tests/e2e/research-after-download.spec.ts` › "TC-E2E-001: a succeeded run leaves every stock scored…" | Skipped on every run with the DEC-0285 reason, so it has never executed (AR-010). The assertions match the spec: 31 rows, three whole-number percentiles on each drawn row, scores on three evidence pages, `C[SD]T` on the as-of line, and a link to `/runs/{runId}`. The stock "lacking one input" is `NOFAAA`, which lacks every fundamental (AR-012). |
| TC-E2E-002 | PARTIAL | same file › "…before any run…" (passes) and "…after a run with 20 stocks…" (skipped) | The before-run half passes. The after-run half now pins "20 qualified, 30 needed" on all three headers. Value and growth reach 20 only when statements are mapped, so the guard really applies to this half now (`classify.sql` rule 3 reports the qualified count, which is 0 with unresolved keys). Never executed (AR-010). |
| TC-E2E-003 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` › TC-E2E-003 | Unchanged since v1. Passes in the full suite and in the six-file run. |
| TC-E2E-004 | VERIFIED | same file › TC-E2E-004 | Unchanged since v1. Passes. |
| TC-E2E-005 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` › TC-E2E-005 | Unchanged since v1. Passes. A real run follows the save, and with unresolved keys it scores no value, so the filter matches differently and the membership still holds. |
| TC-E2E-006 | VERIFIED | same file › TC-E2E-006 | Unchanged since v1. Passes. |
| TC-E2E-007 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` › TC-E2E-007 | Unchanged since v2. The non-monotone momentum seed gives the exact order DDD, EEE, AAA, CCC, and the test asserts `aria-sort="ascending"`. A sort that did nothing would fail it. Passes. |
| TC-E2E-008 | VERIFIED | same file › TC-E2E-008 | Unchanged since v1. Passes. |
| TC-E2E-009 | PARTIAL | `tests/e2e/fix-insufficient-evidence.spec.ts` › TC-E2E-009 | Skipped on every run (AR-010). The first run is asserted `partial`, but the `no-fundamentals` mode cannot produce that outcome (AR-011). The third run is unplanned (AR-005). |
| TC-E2E-010 | PARTIAL | same file › TC-E2E-010 | Skipped on every run (AR-010). It asserts "the provider reports no" and no Data health link. The 200-with-empty-list `NOFCCC` cannot produce those (AR-011). |
| TC-E2E-011 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` › TC-E2E-011 | Unchanged since v1. Passes. The precondition is seeded by SQL (AR-005). |
| TC-E2E-012 | VERIFIED | same file › TC-E2E-012 | Unchanged since v1. Passes. |

## Task Verification

| Task | Result | Evidence | Notes |
| --- | --- | --- | --- |
| T001 | VERIFIED | `scripts/run-e2e-server.sh` | Only `ACQUISITION_ENV` gains the 1 s poll, and the header comment is extended. The API launch line is back to `factorflow.app_main`. |
| T002 | PARTIAL | `tests/e2e/support/massive_stub.py` | The code matches the task to the letter: drift, `NOF*` and `no-fundamentals` answer 200 with an empty list, and no financial field is added. The task's premise is wrong, though. An empty list is recorded `unchanged`, not `not_found` and not `failed`, so it gives neither "the provider holds no fundamentals" nor a partial run (AR-011). |
| T003 | VERIFIED | `tests/e2e/support/acquisition.ts` | As planned. `withholdSymbol` and `restoreSymbol` are removed. |
| T004 | VERIFIED | `tests/e2e/support/classification.ts` | Every planned helper is present. `skipUnlessLineItemsResolved` is restored as T004 describes, and the JSON reporter shows the annotation "Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)". `followStocks`, `seedUniverseRecorded` and the coverage and reference inserts are still unplanned (AR-005). |
| T005 | PARTIAL | `tests/e2e/research-after-download.spec.ts` | It is built as the task says: one unguarded test and two guarded ones. Only one of the three executes (AR-010). AR-012 covers the `NOFAAA` variant. |
| T006 | VERIFIED | `tests/e2e/universe-by-hand.spec.ts` | Matches the task. |
| T007 | VERIFIED | `tests/e2e/universe-from-result.spec.ts` | Matches the task. |
| T008 | VERIFIED | `tests/e2e/compare-and-evidence.spec.ts` | Matches the task. |
| T009 | PARTIAL | `tests/e2e/fix-insufficient-evidence.spec.ts` | Both tests are guarded and use `no-fundamentals` then `ok`, as the task says. Neither executes (AR-010), and the planned mechanism cannot give the outcomes asserted (AR-011). The task does not describe the third run (AR-005). |
| T010 | VERIFIED | `tests/e2e/universe-maintenance.spec.ts` | Matches the task, apart from the SQL precondition (AR-005). |
| T011 | VERIFIED | full suite | 27 passed and 4 skipped with the DEC-0285 reason, and nothing else skipped. This is exactly what the task expects. |
| T012 | VERIFIED | six-file run, guarded-file run, full suite | The six files pass together (9 passed, 4 skipped). The two guarded files pass together (1 passed, 4 skipped). The four unguarded files are unchanged since v2, where each passed alone. No run is left non-terminal, and no helper is left over (`no-fundamentals` is used again). |
| T013 | PARTIAL | gate commands | `npm run lint` and `npm run format` now exit 0 with `build/` present. `npx tsc --noEmit` still covers only `web/src`, though the supplementary strict `tsc` over the changed TypeScript is clean (AR-005). |

## Independent Validation

All commands ran in `repos/factorflow-v2/FactorFlow-v2` (`.`). Every command
that needs the Docker socket or the `uv` cache ran outside the sandbox as one
plain call, with `--prefix` or `--directory` in place of `cd`.

| Command | Working Directory | Exit Code | Result | Notes |
| --- | --- | --- | --- | --- |
| `npm run test:e2e` | `.` | 0 | PASS | 31 tests: 27 passed and 4 skipped (TC-E2E-001, TC-E2E-002 after the run, TC-E2E-009, TC-E2E-010), 3.2 min. A green exit, but not a green CAP-002 result (AR-010). |
| `npm run test:e2e -- <the six CAP-002 files> --reporter=list` (the plan's test-specific `npx playwright test …`) | `.` | 0 | PASS | 13 tests: 9 passed and 4 skipped (24.6 s). This matches the plan's "Expected result today". |
| `npm run test:e2e -- tests/e2e/research-after-download.spec.ts tests/e2e/fix-insufficient-evidence.spec.ts --reporter=json` | `.` | 0 | PASS | Stats show expected 1, skipped 4, unexpected 0 and flaky 0. Each skip carries the annotation "Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)". |
| `uv run --directory . --offline pytest -q` | `.` | 0 | PASS | 2578 passed, 1 xfailed in 418 s, with the `postgres` suites included (testcontainers reached Docker outside the sandbox). This includes `tests/unit/test_run_e2e_server_script.py`, which pins the `factorflow.app_main` launch line again. |
| `uv run --directory . --offline pytest -q -m "not postgres"` | `.` | 0 | PASS | 1636 passed, 942 deselected and 1 xfailed (`test_line_items_resolved.py`, the owner signal). Nothing under `tests/e2e/` is collected. |
| `uv run --directory . --offline ruff check .` | `.` | 0 | PASS | All checks passed. |
| `uv run --directory . --offline ruff format --check .` | `.` | 0 | PASS | 283 files already formatted. |
| `uv run --directory . --offline mypy src` | `.` | 0 | PASS | No issues found in 61 source files. |
| `npm run test` | `.` | 0 | PASS | Vitest: 77 files, 2101 tests passed. |
| `npm run lint` | `.` | 0 | PASS | "Checked 180 files … No fixes applied", with the ignored `build/lib/factorflow/api/static/assets/index-*.js` bundles on disk. v2 AR-006 is resolved. |
| `npm run format` | `.` | 0 | PASS | "Checked 180 files … No fixes applied." |
| `npx tsc --noEmit` | `.` | 0 | PASS | Covers `web/src` only (`tsconfig.json` `include`). The supplementary `npx tsc --noEmit --strict --skipLibCheck --target es2022 --module esnext --moduleResolution bundler --lib es2022,dom --types node` over the six specs, `classification.ts` and `acquisition.ts` also exits 0. |
| `npm run build` | `.` | 0 | PASS | Vite: 102 modules, built in 1.05 s. The working tree is still clean. |
| `uv build --directory . --offline` | `.` | 0 | PASS | "Successfully built dist/factorflow-0.1.0.tar.gz" and "dist/factorflow-0.1.0-py3-none-any.whl". This was not run in v1 or v2. After it, `npm run lint` still exits 0 with the refreshed `build/` present. |
| `uv sync --all-extras`, `npm ci` | `.` | — | NOT-RUN | These are dependency installs, not validation, and no lockfile is in the change set. |

## Findings

New findings are numbered from AR-010, so no ID is reused. AR-005 is carried
open from v1 with its ID.

| ID | Severity | Evidence | Impact | Required Remediation |
| --- | --- | --- | --- | --- |
| AR-005 | LOW | Carried from v1, with new items. `followStocks` and `seedUniverseRecorded` (`tests/e2e/support/classification.ts`) seed preconditions by SQL. T010 says "via API", and T004 lists neither helper. T013's `npx tsc --noEmit` uses `tsconfig.json` `include: ["web/src"]`, so it does not reach `tests/e2e/`. New since v2: TC-E2E-009's third run (`fix-insufficient-evidence.spec.ts:107-126`) and the `biome.json` `build/**` ignore trace to no task, and the plan was not revised. | The plan does not fully describe what was built, and its type-check gate does not cover the changed TypeScript (the supplementary strict `tsc` is clean). | In the plan revision that AR-011 needs, record the SQL preconditions and their reason, the third TC-E2E-009 run and the `biome.json` change, and type-check `tests/e2e/` in T013. |
| AR-010 | HIGH | Four required tests skip on every run: `research-after-download.spec.ts:54,81` and `fix-insufficient-evidence.spec.ts:74,134` call `skipUnlessLineItemsResolved(test)`. `line_items.unresolved()` is non-empty, and the JSON report shows 4 skipped with the DEC-0285 annotation. The skill passes a gate only when all required tests pass. DEC-0285 is owner-upheld, and no gate waiver is recorded. | TC-E2E-001 (P1), TC-E2E-009 (P1), TC-E2E-010 (P2) and half of TC-E2E-002 (P1) have no executing automation. Flows 1 and 5 are untested end to end, and no assertion in those four tests has ever met the product. | Under the upheld DEC-0285, `$automation-coding` cannot remove the guard. The owner clears this in one of two ways. (a) Resolve system design section 8 question 1, so the guard lifts and the tests run. That also needs the stub task the plan's Notes name, and the AR-011 fix. (b) Record a time-boxed waiver of this blocking verdict with `scripts/artifact-gate.py waive`, with a rationale and an expiry. |
| AR-011 | HIGH | The guarded TC-E2E-009 and TC-E2E-010 rely on a stub behaviour that the product reads differently. `massive_stub.py` answers 200 with an empty `results` list for `NOF*` and in `no-fundamentals` mode. `client.fetch_financials` returns `[]` for an empty successful read, "not `InstrumentNotFound` (`DEC-0047`)". `outcomes.classify_write_result` records fundamentals `"unchanged"` when nothing is appended. `runs/journal.py` finalises `succeeded` when every row is `written` or `unchanged`, and `partial` only when a row is `failed`, `not_found` or `skipped`. The product reads "the provider reports no …" only when the input's `last_acquisition.outcome === "not_found"` (`web/src/screens/research/stocks/factor-card.tsx` `providerHoldsNoData`, DEC-0181); otherwise the card says "… is missing" and offers the Data health recovery. Two assertions fail as a result: `fix-insufficient-evidence.spec.ts:81` (`runAndWait(…, ["partial"])` after `no-fundamentals`, where the run ends `succeeded`) and `:144-146` (`NOFCCC`: "the provider reports no", "No action in FactorFlow changes this.", no Data health link). In v2, with `NOF*` answering 404 and BBB answering 503, both tests executed and passed, which shows that these outcomes need a 404 and a failure. T002 ("the provider holding no fundamentals") and T009 ("so TC-E2E-009 can create a partial outcome") encode the wrong premise. The stub task the plan's Notes name is about payload keys only and would not change this. | When the guard lifts, two required cases fail for test-infrastructure reasons against a correct product. The T004 doc and the spec headers claim they "run unchanged once it is resolved", and for these two that is false. This is incorrect required test design, independent of the skip. | Through `$automation-planning`, revise T002 and T009 so that the stub produces the outcomes the product reads. `NOF*` statement paths should answer 404, recorded as `not_found`. For TC-E2E-009's first run, BBB's statement paths should fail (for example 503 for one symbol, recorded as `failed`, so the run ends Partial) and be restored for the second run. Neither change invents a payload key, so DEC-0285 does not forbid it. Then implement it in `$automation-coding`. Note for the same revision: the `ok`-mode statement row is dated at the request's `period_end.gte`, the start of the history window. The stub task that serves keys must also serve recent and earlier quarters, or value and growth will read outdated or uncomputable. |
| AR-012 | LOW | The spec's TC-E2E-001 step 4 reads "a stock that lacks one input" and expects "Incomplete" on "the affected factor" while "its other factors still show scores". The test uses `NOFAAA`, which lacks every fundamental, and asserts Incomplete on value and growth with only momentum scoring (`research-after-download.spec.ts:118-130`). The `GAP*` stock from v2 (one line item missing, growth alone affected) was removed with the test keys. | A regression in which one missing input voids both fundamental factors would not be caught. The test also reads a weaker case than the spec describes. Non-blocking. | When the stub serves statements carrying payload keys (AR-010 (a)), use a stock that lacks a single line item, so that exactly one factor reads Incomplete and the other two score. Record it in the plan. |

## Previous Review Disposition

| Prior Finding | Severity | Disposition | Evidence |
| --- | --- | --- | --- |
| v2 AR-005 | LOW | Open, carried as AR-005 with new items | The plan body is unchanged, and `tsconfig.json` is unchanged. |
| v2 AR-006 | LOW | Resolved | `biome.json` ignores `build/**`. `npm run lint` and `npm run format` exit 0 with `build/` on disk. |
| v2 AR-007 | HIGH | Resolved | The code is back to the plan: `skipUnlessLineItemsResolved` is restored (T004), and the guards are in place (T005, T009). `NOF*` and `no-fundamentals` answer 200 with an empty list (T002). `withhold`, `restore`, `GAP*`, `api_e2e_main.py` and `e2e_line_items.py` are removed, and `tests/unit/test_run_e2e_server_script.py` is back to base. T011's "27 passed, 4 skipped" and the Validation Plan's "9 passing, 4 skipped" match fresh output. The `Branch` line is corrected. The owner settled DEC-0285 in favour of the guard. The plan's premise behind T002 and T009 is reopened separately as AR-011. |
| v2 AR-008 | LOW | Resolved | `no-fundamentals` is used again by TC-E2E-009 (`fix-insufficient-evidence.spec.ts:80`). AR-011 covers whether it can do what TC-E2E-009 needs. |
| v2 AR-009 | LOW | Resolved in code, unexecuted | TC-E2E-009 asserts `["partial"]` and then `["succeeded"]` (`:81`, `:94`, `:109`). TC-E2E-002 pins "20 qualified, 30 needed" (`:71-74`). TC-E2E-001 reads `card-score` ×3 on F00, F15 and F29 (`:107-110`). All of them are in guarded tests and have never run (AR-010). The `partial` assertion is correct against the spec, but the stub cannot satisfy it (AR-011). |
| v1 AR-001 to AR-004 | HIGH, MEDIUM | Disposed in v2. The v1 AR-001 concern returns as AR-010 under the owner-upheld DEC-0285. | In v2 the code resolved them by removing the guard. `c15c923` restored the guard on the owner's decision. The assertion strengthening (v1 AR-003 and AR-004) is kept. v1 AR-002's reasoning (the after-run TC-E2E-002 needs no key) no longer holds, because the test now pins 20 qualified on value and growth. |

## Verdict

**Verdict:** CHANGES-REQUIRED

Two HIGH findings block the gate.

- **AR-011** is fixable now through `$automation-planning` and then
  `$automation-coding`. It changes only the stub's status codes for `NOF*` and
  for BBB's first run, invents no payload key, and so stays within DEC-0285.
  AR-005 and AR-012 belong in the same plan revision.
- **AR-010** needs the owner, because the upheld DEC-0285 keeps the four tests
  guarded. The owner either resolves system design section 8 question 1 or
  records a time-boxed waiver of this verdict. A waiver alone, without the
  AR-011 fix, would accept two tests that are known to fail once the guard
  lifts.

After both are handled, run a new `$automation-review`.
