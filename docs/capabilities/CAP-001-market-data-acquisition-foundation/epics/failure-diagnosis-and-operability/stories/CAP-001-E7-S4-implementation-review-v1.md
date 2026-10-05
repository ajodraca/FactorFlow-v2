---
artifact_schema_version: 1
artifact_id: CAP-001-E7-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: adversarial-review-agent
owner_github: ajodraca
created: 2026-10-05
updated: 2026-10-05
story_id: "CAP-001-E7-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-05T00:11:24Z"
reviewed_head: "f59b77a3fefb7642a691bbe20ed7e882b6e95fb1"
review_base: "25aa48fbfb00853c738b39d7118b375d376a1325"
reviewed_state_revision: "sha256:dc8f68d639cd40720bfcf47b8779281fced37557e3b034fa3c6efaf59b6bab22"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E7-S4
    artifact_version: 1
    content_revision: sha256:0eaa264114519a251cc73fba02b1665c042f672b174bea6627f68711b9a63942
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: unknown
  timestamp: "2026-10-05T00:11:24Z"
  source_artifacts:
    - id: CAP-001-E7-S4
      version: "1"
    - id: CAP-001-E7-S4-tasks
      version: "1"
    - id: DEC-0015
      version: "1"
    - id: DEC-0016
      version: "1"
    - id: DEC-0017
      version: "1"
    - id: DEC-0018
      version: "1"
    - id: DEC-0019
      version: "1"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E7-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 3 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 27/27 verified |
| Required validation | 10/10 passed |

Every acceptance criterion traces to production code I read and to at least one
test whose assertions I read and judged non-vacuous. All fourteen mandatory
TC-IDs carry `// Implements` trace comments and are implemented with concrete,
AC-sharpened assertions rather than the component spec's boilerplate steps. I
reran the full validation plan independently — unit suite, type check, lint,
format, build, Playwright end to end against a real API and PostgreSQL
container, and the Postgres-marked contract test for the E7-S1 endpoint this
screen consumes — and every command exited 0 with no tracked-file side effects.

The plan's hard precondition (T001: CAP-001-E7-S1 must have landed) is
independently confirmed: `OutcomeCounts`, `RunCounts.results_by_outcome` and
`ResultRow.symbol` exist in `src/factorflow/api/models.py`, and E7-S1's branch
is merged into the review base's ancestry (commit `2c28d53`).

The three findings are LOW: an `aria-controls` target that includes the
controlling row, truthiness rather than presence tests on the two query
filters, and the absence of page controls in the `empty-no-match` state. None
touches an acceptance criterion, a required task, or a required validation
command, so the gate passes with these recorded as warnings.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 3 · **total 3**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/failure-diagnosis-and-operability/stories/CAP-001-E7-S4-tasks.md` |
| Component | `FactorFlow-v2` (same repo as the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E7-S4-run-20261004T220203Z` |
| HEAD | `f59b77a3fefb7642a691bbe20ed7e882b6e95fb1` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E7-integration-20261004T220203Z` = `25aa48fbfb00853c738b39d7118b375d376a1325` (confirmed ancestor of HEAD) |
| Working tree | Clean — no staged, unstaged or untracked non-ignored files, before and after validation |
| Changed files reviewed | 26 (8 commits: `0cf8125`, `7a2dbb7`, `c9b2148`, `f156ed7`, `4244ae9`, `557093e`, `9f6fc6b`, `f59b77a`) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/api/types.ts` | modified | AC-10, DAC-E7-S4-7; T018 — additive `DataType`, `ResultOutcome`, `OutcomeCounts`, `RunResult`, `RunDetail`; no existing type touched |
| `web/src/api/client.ts` | modified | AC-10, DAC-E7-S4-5, DAC-E7-S4-7; T019 — `RunDetailFilters`, `WireRunResult`, `toRunResult`, `getAcquisitionRun` |
| `web/src/api/client.runs.test.ts` | modified | T011 — 8 new `getAcquisitionRun` cases appended; every pre-existing case unchanged |
| `web/src/api/render.test.tsx` | added | DAC-E7-S4-5; T015 — characterization, no `dangerouslySetInnerHTML` under `web/src` |
| `web/src/screens/runs/outcome-badge.tsx` | modified | T020 — `export` added to `TierIcon` and `TIER_CLASSES`; no behaviour change |
| `web/src/screens/runs/run-controls.tsx` | modified | DAC-E7-S4-2; T021 — optional `label` prop defaulting to `Start acquisition run` |
| `web/src/screens/runs/run-controls.test.tsx` | modified | T013 — 3 new label cases appended; pre-existing cases unchanged |
| `web/src/screens/runs/cancel-run.tsx` | modified | DAC-E7-S4-3; T021 — the DEC-0018 `null` branch in the `settled` path |
| `web/src/screens/runs/cancel.test.tsx` | modified | T013 — 2 new DEC-0018 cases appended; pre-existing cases unchanged |
| `web/src/screens/runs/detail/result-outcome-badge.tsx` | added | DAC-E7-2, DAC-E7-S4-4, DAC-E7-11; T020 |
| `web/src/screens/runs/detail/result-outcome-badge.test.tsx` | added | T012 |
| `web/src/screens/runs/detail/run-summary.tsx` | added | AC-19, AC-26, DAC-E7-S4-1, DAC-E7-S4-2, DAC-E7-11; T022 |
| `web/src/screens/runs/detail/instrument-roster.tsx` | added | AC-10, AC-11, DAC-E7-9, DAC-E7-2, DAC-E7-S4-5; T023 |
| `web/src/screens/runs/detail/index.tsx` | added | AC-10/11/19/26, DAC-E7-9, DAC-E7-S4-3/6/7; T024 |
| `web/src/screens/runs/run-detail.test.tsx` | added | T002–T005, T007–T009 (10 mandatory TC-IDs) |
| `web/src/screens/runs/run-detail.reason.test.tsx` | added | DAC-E7-S4-5; T006 (TC-COMP-096) |
| `web/src/screens/runs/run-detail.polling.test.tsx` | added | DAC-E7-S4-6; T010 (TC-COMP-097) |
| `web/src/app/routes.tsx` | modified | AC-10, DAC-E7-9; T025 — placeholder replaced, paths unchanged |
| `web/src/app/routes.test.tsx` | modified | T014 — `getAcquisitionRun` mock plus one new case; five-route assertion unchanged |
| `tests/e2e/support/database.ts` | added | T016 — `sql()` seeding helper |
| `tests/e2e/cancel-run.spec.ts` | added | AC-19, AC-26, DAC-E7-S4-3; T016 |
| `tests/e2e/run-detail.spec.ts` | added | AC-10, AC-11, DAC-E7-9, DAC-E7-2, DAC-E7-S4-2/7; T017 |
| `playwright.config.ts` | modified | `workers: 1`, justified by the plan's Other Notes, "E2E seeding" ("The specs share one database and run serially in file order") — see Scope and Plan Deviations |
| `docs/.../CAP-001-E7-S4.md` | modified | `status: planning` → `in-review`; pipeline bookkeeping |
| `docs/.../CAP-001-E7-S4-tasks.md` | modified | T001–T027 checkbox state only; no plan text altered (verified by diff) |
| `docs/.../CAP-001-E7-S4-tdd-evidence.yaml` | added | T027 — 7 cycles, all `APPROVED` / `drift_detected: false`, each with a `commit_hash` matching a real commit on this branch |

No backend (`src/factorflow/**`) file changed, as the plan states. No file in the
change set lacks a story or task justification.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-10 | SATISFIED | `web/src/screens/runs/detail/instrument-roster.tsx:45` `detailText` (`Acquiring {type} for {symbol} failed: {reason}`), rendered at `:137` per data-type row; `index.tsx:195` mounts the roster | `run-detail.test.tsx:222` (TC-COMP-010) asserts the exact STD-UI-19 sentence inside AAPL's group; `tests/e2e/run-detail.spec.ts:68` asserts it against the real API | Three STD-UI-19 parts (operation, resource, reason) in one sentence |
| AC-11 | SATISFIED | `instrument-roster.tsx:50-53` — `not_found` never reads as a failure; `result-outcome-badge.tsx:16` warning tier | `run-detail.test.tsx:229` (TC-COMP-011) asserts ZZZZ's group matches no `/failed/i` and MSFT's `written` rows still render | Run visibly continued past the unrecognised instrument |
| AC-19 | SATISFIED | `run-summary.tsx:101` always-mounted `CancelRunControl` keyed on `runId`; `cancel-run.tsx:177` DEC-0018 `null` branch; `index.tsx:78` poll keeps the state fresh | `run-detail.test.tsx:423` (TC-COMP-019) — exactly one `Cancelling` badge, `status-warning`, action withdrawn; `cancel-run.spec.ts:54` end to end | The "not two badges" assertion (`toHaveLength(1)`) kills the Open Gap P4 mutant |
| AC-26 | SATISFIED | `run-summary.tsx:21` `Timestamp` em dash + `sr-only` *Not recorded*; dialog copy inherited from `cancel-run.tsx` | `run-detail.test.tsx:444` (TC-COMP-026) — heading *Cancel this queued run?*, `Cancelled`/`status-neutral`, `Started` = `—` + `sr-only`, body never matches `/Cancelling/`; `cancel-run.spec.ts:31` end to end | |
| DAC-E7-9 | SATISFIED | `instrument-roster.tsx:95-145` one `tbody` per instrument, data-type rows only when `open`; `DATA_TYPE_ORDER` at `:6` | `run-detail.test.tsx:156` (TC-COMP-074) — 50 collapsed rows from a 3000-named run, zero data-type rows, expansion by click and by `Enter`, fixed label order from deliberately unordered API rows, other rows stay collapsed, re-collapse works | Fixture rows are supplied in `corporate_actions, fundamentals, prices, reference` order, so the fixed-order assertion cannot pass by accident |
| DAC-E7-11 | SATISFIED | `result-outcome-badge.tsx:44` word + `TierIcon`; `outcome-badge.tsx` for run states | `run-detail.test.tsx:318` (TC-COMP-076) — `it.each` over all eight `RunState`s and all five outcomes, each asserting non-empty text equal to the label plus an `svg[data-icon]`; `:353` asserts `failed` and `not_found` icons differ | STD-UI-8 greyscale survivability asserted, not assumed |
| DAC-E7-2 | SATISFIED | `result-outcome-badge.tsx:13-19` tier map | `run-detail.test.tsx:276` (TC-COMP-067/095) — text, `data-variant` and `svg[data-icon]` all three differ, on expanded and collapsed rows alike | |
| DAC-E7-S4-1 | SATISFIED | `run-summary.tsx:67-74` — `ABANDONED_EXPLANATION` verbatim plus default-label `StartRunControl` | `run-detail.test.tsx:367` (TC-COMP-092) — explanation text, `status-serious` badge, *Start acquisition run* present, re-run absent | |
| DAC-E7-S4-2 | SATISFIED | `run-summary.tsx:56,107-112` — `failed`/`partial` only, `RERUN_SENTENCE` then `StartRunControl label="Re-run acquisition"`; `run-controls.tsx:46,125` renders the label | `run-detail.test.tsx:380` (TC-COMP-093) — `data-variant="default"`, sentence present, one `startAcquisitionRun` call, navigation to `/runs/r-9`; `:398` asserts absence for the five non-recoverable states and for `abandoned` | Negative coverage across all eight states, not just the positive case |
| DAC-E7-S4-3 | SATISFIED | `cancel-run.tsx:177` keeps the `409` branch while suppressing the stale `202` badge; `run-summary.tsx:101` always-mounted control preserves it across the refetch | `run-detail.test.tsx:468` (TC-COMP-094) — *This run had already completed.* with `["Succeeded","Succeeded"]` and body matching neither `/Cancelled/` nor `/Cancelling/`; `cancel.test.tsx:218` at the control level; `cancel-run.spec.ts:75` end to end with a real race | |
| DAC-E7-S4-4 | SATISFIED | `result-outcome-badge.tsx:16-17` | `result-outcome-badge.test.tsx:31,38,54` — tier/label map pinned per outcome and constrained to the three ux-design §1.5 variants | Kills the DEC-0015 swap mutants named in T026 |
| DAC-E7-S4-5 | SATISFIED | `client.ts:479-556` field-by-field mapping drops non-contract fields; `instrument-roster.tsx:137` renders reasons as React text children | `run-detail.reason.test.tsx:73` (TC-COMP-096) exercises the **real** client through a stubbed `fetch`: *Fundamentals* label, `req-e7s4-001` visible, `document.body.innerHTML` free of the synthetic secret, markup reason rendered literally with no `img` element; `client.runs.test.ts` "drops every field outside the contract"; `render.test.tsx` characterizes the absence of `dangerouslySetInnerHTML` | The reason test deliberately does not mock the client, so the mapping cannot be bypassed |
| DAC-E7-S4-6 | SATISFIED | `index.tsx:11` `RUN_DETAIL_POLL_INTERVAL_MS = 10_000`; `:78-80` single chained `setTimeout` only while `isNonTerminalRunState`; `:100-103` cleanup clears it | `run-detail.polling.test.tsx:86` — no call at 9 999 ms, exactly one at 10 000 ms, none over a further 30 000 ms once terminal; `:129` terminal-on-arrival never polls; `:139` a rejected poll shows the error and stops; `:155` unmount clears; `:166` expansion survives a poll; `:185` *Last updated* advances (STD-UI-25) | Pure fake timers; the 9 999/10 000 boundary kills the `5_000` mutant |
| DAC-E7-S4-7 | SATISFIED | `client.ts:490-499` sends only present filters and never a `limit`; `index.tsx:43-62,108-111,203-224` filter + cursor-stack paging, filter change resets to page 1, each page replaces the rows | `run-detail.test.tsx:516` asserts the first call is `("r-1", {})` with zero keys; `:526` server-side filter, focus retained on the `select`, polite `2 instruments shown`, filtered expansion shows only returned rows; `:550` empty-filter copy and `Reset filter`; `:568` forward/back paging with page replacement and reset to page 1; `run-detail.polling.test.tsx:107` the poll re-requests `{outcome, cursor}`; `run-detail.spec.ts:88` end to end | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/api/models.py:226,242,254` (`OutcomeCounts`, `results_by_outcome`, `ResultRow.symbol`); E7-S1 merge `2c28d53` in the base's ancestry; `tdd-evidence.yaml:11-33` baseline | I re-derived the seam check rather than trusting it; the hard stop was correctly not triggered |
| T002 | complete | VERIFIED | `run-detail.test.tsx:149-193` | All five bullets asserted |
| T003 | complete | VERIFIED | `run-detail.test.tsx:219-248` | |
| T004 | complete | VERIFIED | `run-detail.test.tsx:273-314` | Collapsed-row assertion present |
| T005 | complete | VERIFIED | `run-detail.test.tsx:316-359` | |
| T006 | complete | VERIFIED | `run-detail.reason.test.tsx` | Client not mocked, as required |
| T007 | complete | VERIFIED | `run-detail.test.tsx:364-408` | Includes the re-run-absent matrix |
| T008 | complete | VERIFIED | `run-detail.test.tsx:419-497` | |
| T009 | complete | VERIFIED | `run-detail.test.tsx:503-604` | All five bullet groups asserted |
| T010 | complete | VERIFIED | `run-detail.polling.test.tsx` | All eight bullets asserted |
| T011 | complete | VERIFIED | `web/src/api/client.runs.test.ts:185-312` | Path/query, mapping, unknown-field drop, `404`, message-less `500`, transport failure |
| T012 | complete | VERIFIED | `web/src/screens/runs/detail/result-outcome-badge.test.tsx` | Tier table and badge markup pinned |
| T013 | complete | VERIFIED | `run-controls.test.tsx:192-224`; `cancel.test.tsx:192-237` | Appended as separately named cases; no existing case modified (verified by diff) |
| T014 | complete | VERIFIED | `routes.test.tsx:22-43` mock, `:188-208` new case | Five-route source assertion untouched |
| T015 | complete | VERIFIED | `web/src/api/render.test.tsx` | Non-vacuous: asserts `files.length > 0` and self-excludes; recorded as characterization in the evidence file |
| T016 | complete | VERIFIED | `tests/e2e/support/database.ts`; `tests/e2e/cancel-run.spec.ts` | `execFileSync` arguments match the plan verbatim; serial mode and the `afterEach` slot-freeing cleanup present |
| T017 | complete | VERIFIED | `tests/e2e/run-detail.spec.ts` | All six assertions present; both instruments added via the API, results seeded by SQL |
| T018 | complete | VERIFIED | `web/src/api/types.ts:268-325` | Purely additive; `RunSummary`/`HealthResponse` untouched |
| T019 | complete | VERIFIED | `web/src/api/client.ts:465-556` | No `limit`; doc comment names E5-S5, E7-S1, DAC-E7-10, `404`/`422`; `toApiError` unchanged |
| T020 | complete | VERIFIED | `outcome-badge.tsx:53,75` exports; `detail/result-outcome-badge.tsx` | All four exports present with the DEC-0015 values |
| T021 | complete | VERIFIED | `run-controls.tsx:21,46,125`; `cancel-run.tsx:177-179` | Both additive; every pre-existing case in the two suites still passes unmodified |
| T022 | complete | VERIFIED | `detail/run-summary.tsx` | All nine required regions present, including the always-mounted keyed `CancelRunControl` |
| T023 | complete | VERIFIED | `detail/instrument-roster.tsx` | `groupByInstrument` groups consecutive rows and preserves server order; I confirmed against `src/factorflow/runs/queries.py:486-489` that the API emits each instrument's rows consecutively, so the grouping assumption holds |
| T024 | complete | VERIFIED | `detail/index.tsx` | State, polling, rendering, paging and error contract as specified; see Scope and Plan Deviations for the inner-component refactor |
| T025 | complete | VERIFIED | `web/src/app/routes.tsx:6,27` | `RunDetailPlaceholder` deleted, `ScreenPlaceholder` retained, path strings unchanged |
| T026 | complete | VERIFIED | `run-detail.test.tsx:260-271` (server-order pin), `:568-603` (page replacement), `polling.test.tsx:96-99,166-183`, `result-outcome-badge.test.tsx:31-52`, `render.test.tsx` | I checked each named mutant class against a concrete assertion that would fail: tier swap, 5 000 ms interval, polling on terminal, missing `clearTimeout`, dropped `cursor`/`outcome`, page accumulation, `expanded` reset, alphabetical re-sort, synthesised rows, default label, conditional mount, dropped P4 branch, `dangerouslySetInnerHTML`. Every one is covered |
| T027 | complete | VERIFIED | `CAP-001-E7-S4-tdd-evidence.yaml` — 7 cycles | Every cycle carries `code_review_verdict: APPROVED`, `spec_drift.drift_detected: false`, `tests_executed: true` and a `commit_hash` I matched to a real commit on this branch; the T015 cycle is recorded as `green-on-arrival` characterization rather than a fabricated RED |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `Roster at 3000 instruments` / TC-COMP-074 | ADEQUATE | Proves one collapsed row per instrument at page scale, zero data-type rows before expansion, keyboard and pointer activation, fixed data-type order independent of API order, sibling rows unaffected, and re-collapse | none |
| `Per-instrument, per-data-type reasons` / TC-COMP-010, 011 | ADEQUATE | Proves the exact STD-UI-19 sentence and that an unrecognised instrument's group contains no form of the word *failed* while a later `written` instrument still renders | none |
| `not_found is distinguishable from failed` / TC-COMP-067, 095 | ADEQUATE | Proves divergence in all three channels (text, `data-variant`, icon) on both row levels, and pins the collapsed badge sequence `["Failed","Written"]` | none |
| `Every status carries a word and an icon` / TC-COMP-076 | ADEQUATE | `it.each` over 8 run states and 5 outcomes with label equality (not mere presence) and icon presence; plus an explicit icon-inequality assertion | none |
| `Recovery paths` / TC-COMP-092, 093 | ADEQUATE | Positive and negative matrices over all eight run states; navigation observed through a real `useLocation` probe, not a mocked navigate | none |
| `Cancelling from Run detail` / TC-COMP-019, 026, 094 | ADEQUATE | Badge count, variant, action withdrawal, dialog copy, em-dash + `sr-only` started cell, and absence assertions on `document.body` for the forbidden words | none |
| `A reason …` / TC-COMP-096 | ADEQUATE | Deliberately unmocked client over a stubbed `fetch`; asserts on `document.body.innerHTML` for the secret and on `document.querySelector("img")` for injection, so neither can pass vacuously | none |
| `Run detail polling` / TC-COMP-097 | ADEQUATE | Pure fake timers with exact 9 999/10 000 ms boundary, request-shape equality on the poll, stop-on-terminal, stop-on-error, unmount cleanup, expansion persistence, freshness advance | none |
| `Filter and paging` / TC-COMP-098 | ADEQUATE | Asserts the initial call has zero filter keys (so no `limit` can leak), exact filter/cursor arguments per interaction, page **replacement** (absence of the previous page's rows), control visibility rules, focus retention, polite announcement, and reset-to-page-1 | none |
| `result-outcome-badge.test.tsx` / T012 | ADEQUATE | Key-set completeness, per-outcome tier and label equality, tier-domain restriction, order array, and rendered markup per outcome | none |
| `client.runs.test.ts` `getAcquisitionRun` block / T011 | ADEQUATE | Percent-encoded path, exact query entry list, full `toEqual` on the mapped object (so a missing or extra field fails), `JSON.stringify` leak check, `404` code/request id, message-less `500` request id, `ApiUnreachableError` | none |
| `run-controls.test.tsx` label block / T013 | ADEQUATE | Label as accessible name, absence of the default name, blocked/queued/navigation behaviour retained under a custom label, and the no-label default | none |
| `cancel.test.tsx` DEC-0018 block / T013 | ADEQUATE | Re-render transitions `running → cancelling → cancelled` assert the badge disappears and the text is gone; the `409` path asserts the message and outcome survive a terminal prop | none |
| `routes.test.tsx` run-detail case / T014 | ADEQUATE | Asserts the real heading inside `main`, the placeholder text's absence, and `aria-current` on Runs | none |
| `render.test.tsx` / T015 | ADEQUATE | Guards against vacuity with a non-empty file-list assertion and self-exclusion | none |
| `tests/e2e/cancel-run.spec.ts` / T016 | ADEQUATE | Three serial scenarios against the real API and database, including a genuine cancel-versus-completion race driven by an out-of-band SQL update, plus a real poll observed through `waitForResponse` | none |
| `tests/e2e/run-detail.spec.ts` / T017 | ADEQUATE | Real seeded `partial` run, collapsed/expanded assertions, verbatim failure sentence, badge variants, re-run visibility, server-side filter | none |

Isolation and determinism: every suite resets its mocks in `beforeEach`; the
polling suite uses pure fake timers with a pinned system time; timestamp
assertions depend on the application's own `America/Chicago` constant
(`web/src/app/status-region.tsx:34`), not on the host zone, matching existing
precedent in `runs-screen.polling.test.tsx` and `coverage.polling.test.tsx`. No
test reaches the network: the only `fetch` use is an explicit `vi.stubGlobal`.
The e2e specs are serialised (`workers: 1`, `mode: "serial"`) and free the
single-active-run slot in `afterEach`, which I confirmed by running the whole
Playwright suite — including the pre-existing `runs-start-cancel.spec.ts`
*after* the new specs — green in one pass.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story …/CAP-001-E7-S4.md --stage adversarial-review` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-001-E7-integration-20261004T220203Z` | harness root | 0 | PASS | `25aa48f…`; `git merge-base --is-ancestor` confirmed |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Lockfile install clean; warnings only about unapproved postinstall scripts (pre-existing project policy). Full unit suite rerun afterwards, still 291/291 |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules; bundle written to `src/factorflow/api/static/` (ignored path), tracked tree unchanged |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 41 files, 291 tests passed |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 7 Playwright tests passed in 41.7 s against the real API plus a real PostgreSQL container (Docker available); includes `cancel-run.spec.ts` (3), `run-detail.spec.ts` (1) and the pre-existing `runs-start-cancel.spec.ts`, `coverage-expansion.spec.ts`, `instruments-add-retire.spec.ts` |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 87 files checked, no fixes applied |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 87 files checked, no fixes applied (no file rewritten) |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No diagnostics |
| `npx vitest run web/src/screens/runs web/src/api web/src/app/routes.test.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Story-specific narrow run: 13 files, 157 tests passed |
| `uv run pytest -m postgres tests/integration/test_api_runs.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 28 Postgres-marked tests passed; confirms the E7-S1 run-detail contract this screen consumes is green on the branch |

Nothing in the Validation Plan was skipped. Postgres-marked tests and the
Playwright suite both ran: Docker was available in this environment, so neither
is reported as excluded. No command was substituted by a narrower one — the
narrow `vitest` run is in addition to the full `npm run test`.

### Validation Side Effects

- Before: `git status --porcelain` empty; `HEAD = f59b77a3…` on `usr/alvaro-de-jodra/CAP-001-E7-S4-run-20261004T220203Z`.
- After: `git status --porcelain` empty; `HEAD = f59b77a3…` on the same branch.
- Unexpected tracked-file changes: none. `npm run build` wrote into
  `src/factorflow/api/static/` and `npm ci` rebuilt `node_modules/`; both are
  ignored paths and left no tracked modification. `npm run test:e2e`'s
  `posttest:e2e` hook removed its own PostgreSQL container. No branch switch,
  reset, fetch or index change was performed.

## Findings

| Finding | Severity | Status | Summary |
|---------|----------|--------|---------|
| IR-001 | LOW | OPEN | The instrument expander's `aria-controls` names the `tbody` that also contains the expander's own row, so the referenced region is never hidden |
| IR-002 | LOW | OPEN | `getAcquisitionRun` guards its `outcome` and `cursor` query parameters by truthiness rather than presence |
| IR-003 | LOW | OPEN | Page controls are not rendered in the `empty-no-match` state, so a filtered page beyond the first that empties offers only *Reset filter* |

### IR-001 — The expander's `aria-controls` points at a region that contains the expander itself

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E7-9 (not impaired)
- **Tasks**: T023
- **Files**: `web/src/screens/runs/detail/instrument-roster.tsx:102,108`
- **Claim challenged**: that `aria-controls={groupId}` identifies the region whose visibility the button toggles.
- **Observed evidence**: `groupId` is the id of the whole `<tbody>`, which holds both the always-visible collapsed row (and therefore the button itself) and the conditionally rendered data-type rows. The referenced region is never hidden.
- **Expected evidence/behavior**: the plan requires only "`aria-expanded`, `aria-controls`", so the attribute is literally present as specified; STD-UI-24 keeps the screen-reader semantics mandatory, and a disclosure's `aria-controls` is conventionally the disclosed content.
- **Impact**: cosmetic for assistive technology — `aria-expanded` still conveys state correctly, and the tests navigate the relationship successfully. No AC is affected.
- **Required remediation**: optional. If revisited, give the disclosed rows their own identified container (or omit `aria-controls`, which is permitted for a disclosure whose content follows it) rather than pointing at the row group that contains the control.

### IR-002 — The two query filters are tested for truthiness rather than presence

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E7-S4-7 (not impaired)
- **Tasks**: T019
- **Files**: `web/src/api/client.ts:490,493`
- **Claim challenged**: that `getAcquisitionRun` sends "only the present filters as query parameters".
- **Observed evidence**: the guards are `if (filters.outcome)` and `if (filters.cursor)`, so an explicitly supplied empty string would be silently dropped rather than sent. `index.tsx:56-62` builds the filter object by presence, so no current caller can reach this, and the sibling `listAcquisitionRuns` uses the same idiom.
- **Expected evidence/behavior**: "only the filters that are present become query parameters" (T019, and the doc comment at `client.ts:475`) reads as a presence test; `!== undefined` would express it exactly.
- **Impact**: none today; a latent trap for a future caller that passes `cursor: ""`.
- **Required remediation**: optional. Prefer `!== undefined` guards, or keep the idiom for consistency with `listAcquisitionRuns` and leave it.

### IR-003 — Page controls disappear in the `empty-no-match` state

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E7-S4-7 (not impaired)
- **Tasks**: T024
- **Files**: `web/src/screens/runs/detail/index.tsx:162-173,190-227`
- **Claim challenged**: that the owner can always retreat from a later page.
- **Observed evidence**: the *Previous page* / *Page n* / *Next page* block renders only under `screenState.kind === "populated"`. If a filtered page beyond the first returns no results — reachable only when the underlying data changes between a page advance and a poll — the owner is offered just *Reset filter*, which clears the filter as well as the cursor stack.
- **Expected evidence/behavior**: the plan specifies exactly this empty-state copy and *Reset filter* (T024, T009 "Empty filter"), and specifies the page controls only for the populated body, so the implementation matches the plan. No artifact defines paging behaviour for an empty later page.
- **Impact**: a rare, self-recoverable dead end; the owner reaches a working view in one click, losing only the filter.
- **Required remediation**: optional. If the owner wants it addressed, render the page controls (or at least *Previous page*) in the `empty-no-match` state as well, and record the copy in ux-design §1.5.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified — `playwright.config.ts` gains `workers: 1`.** Not named by any
  task, but required by the plan's Other Notes, "E2E seeding"
  ("The specs share one database and run serially in file order… a leftover
  `cancelling` run would occupy the single-active slot"). `fullyParallel: false`
  alone does not bound cross-file workers. The in-file comment cites the plan.
  I confirmed the whole suite, old specs included, passes in one serialised run.
- **Justified — `RunDetailScreen` delegates to an inner `RunDetailView` keyed on
  `runId`** (`detail/index.tsx:20-23`). T024 specified a single default-export
  component. The wrapper is behaviour-preserving and documented at `:15-18`: it
  guarantees a clean filter, page and expansion when the route id changes, which
  T024's own "Keep `expanded` across polls" and DAC-E7-S4-2's navigation to a new
  run both depend on. No contract or exported name changes.
- **Justified — additional tests beyond the named task bullets**: the roster
  server-order case (`run-detail.test.tsx:260`) and the load-failure case
  (`:606`). Both are T026 mutation-kill work (the "Reorder `groupByInstrument`
  alphabetically" mutant and the ux-design §1.5 "summary retained" state).
- **Justified — `tests/e2e/diagnose-failure.spec.ts` not created.** The plan's
  Resolved Conflicts section explains why (its entry point is the status region,
  which E1 owns, and a completing re-run needs a runner the e2e server does not
  start), and assigns it to the E2E automation plan.
- **Justified — the `instruments_named` backend defect is not compensated for.**
  The plan's Other Notes assign the fix to E5-S1/E5-S3/E4-S6 and state that this
  screen renders the persisted counts as served. `run-summary.tsx:89-91` does
  exactly that. This remains an open backlog item for the owner, outside this
  story's scope, and is not a finding against it.
- **Justified — the progress indicator is absent.** The story's Open Question and
  ux-design §3 leave the component spec open; `run-summary.tsx:33-39` documents
  the omission.
- **Bookkeeping**: all 27 task checkboxes are checked and all 27 are verified
  here; the tasks file's `status: draft` matches the precedent of E7-S1/S2/S3,
  whose plans also remained `draft` after completion. No checkbox is checked
  without evidence, and no unchecked task appears implemented.
- **Unjustified changes**: none found.
- **Unattended-mode note**: no question arose that required an owner. The five
  plan decisions this story rests on (DEC-0015 … DEC-0019) all exist as records
  under `projects/factorflow-v2/decisions/`, so nothing was resolved on an
  unrecorded assumption. They remain PROVISIONAL pending owner confirmation,
  which is the plan's declared state and not a review finding.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: proceed to `$doc-sync` for CAP-001-E7-S4 with this report
  as the gate evidence. The three LOW findings need no rework; carry them forward
  as recorded warnings, and keep the PROVISIONAL DEC-0015 … DEC-0019 values on
  the owner's confirmation list for absorption into `ux-design.md` §1.5 and
  `component-design-owner-web-app.md` §2.3/§2.5/§2.6.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
