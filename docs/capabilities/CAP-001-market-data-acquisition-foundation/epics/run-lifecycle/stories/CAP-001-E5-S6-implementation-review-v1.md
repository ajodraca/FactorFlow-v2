---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-02
updated: 2026-10-02
story_id: "CAP-001-E5-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-02T02:57:40Z"
reviewed_head: "1a0eb78704f2a7f3f840563e7b17d0a4605cb738"
review_base: "c97311d49058cb8d1f7ab669d1072af898e7dea4"
reviewed_state_revision: "sha256:61cf66a849460bb682c0a660a0833800f13b696e6e8afbbfbc90024a53092c05"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E5-S6
    artifact_version: 1
    content_revision: sha256:510698ec413a6926515a886ef16ff21f4fb2a388f28ab58f1d76e06329a714fb
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-02T02:57:40Z
  source_artifacts:
    - id: CAP-001-E5-S6
      version: "1"
    - id: CAP-001-E5-S6-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 20/20 verified |
| Required validation | 13/13 passed |

Every acceptance criterion traces to production code and to at least one test whose
assertions would fail if the behaviour regressed. The eight-state tier mapping, the
abandoned-run sentence, both blocked-precondition sentences, the queued notice, the two
cancel-dialog texts and the `409` race copy were each compared character-for-character
against `ux-design.md` sections 1.1, 1.4, 1.5 and 5 rather than against the task plan's
restatement, and all match. All thirteen validation commands from the task plan's
Validation Plan and `docs/constitution/tech-stack.md` were rerun independently and all
exited 0, including the Playwright suite against real PostgreSQL (2 passed) and the full
710-test Python suite. The component repository was clean before validation and clean
after it. No finding reaches HIGH: the four recorded items are one untested failure path
during polling and three non-blocking quality or wording items, none of which leaves an
acceptance criterion, a planned task or a required validation incomplete.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6-tasks.md` (v2) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S6-run-20261002T022520Z` |
| HEAD | `1a0eb78704f2a7f3f840563e7b17d0a4605cb738` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E5-integration-20261002T022520Z` → `c97311d49058cb8d1f7ab669d1072af898e7dea4` (verified ancestor of HEAD with `git merge-base --is-ancestor`) |
| Working tree | Clean — `git status --porcelain` empty before and after all validation; no staged, unstaged or untracked file |
| Changed files reviewed | 21 (1 commit, `1a0eb78`, carrying `Decision-Id: DEC-0004/0005/0006`) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `tailwind.config.js` | modified | T001 — exactly the six `status-neutral/active/serious` pairs, nothing else |
| `web/src/api/types.ts` | modified | T002 — run contract appended after `HistoryDepth`; `RunSummary = null` untouched (line 20) |
| `web/src/api/client.ts` | modified | T011 — additive `ApiError` details, `RunListFilters`, three run calls |
| `web/src/api/client.runs.test.ts` | added | T008 |
| `web/src/screens/runs/outcome-badge.tsx` | added | T012 |
| `web/src/screens/runs/outcome-badge.test.tsx` | added | T003 |
| `web/src/screens/runs/run-controls.tsx` | added | T013 |
| `web/src/screens/runs/run-controls.test.tsx` | added | T009 |
| `web/src/screens/coverage/start-run.test.tsx` | added | T006 |
| `web/src/screens/runs/cancel-run.tsx` | added | T014 |
| `web/src/screens/runs/cancel.test.tsx` | added | T007 |
| `web/src/screens/runs/run-table.tsx` | added | T015 |
| `web/src/screens/runs/index.tsx` | added | T015 |
| `web/src/screens/runs/runs-screen.test.tsx` | added | T004 |
| `web/src/screens/runs/runs-screen.polling.test.tsx` | added | T005 |
| `web/src/app/routes.tsx` | modified | T016 — only the `/runs` element; `ScreenPlaceholder`, `/runs/:runId` and the five-route shape unchanged |
| `web/src/app/routes.test.tsx` | modified | T010 — one added mock entry and one added case; existing cases untouched |
| `tests/e2e/runs-start-cancel.spec.ts` | added | T018 |
| `.../stories/CAP-001-E5-S6-tdd-evidence.yaml` | added | T020 |
| `.../stories/CAP-001-E5-S6-tasks.md` | modified | T001–T020 checkbox bookkeeping only (20 `[ ]`→`[x]`); no prose changed |
| `.../stories/CAP-001-E5-S6.md` | modified | `status: planning` → `in-review`, the handoff `story-coding` SKILL.md step G prescribes |

No file outside the plan's named paths was touched; no production file belonging to
another story (`screens/instruments/start-action.tsx`, `retire-dialog.tsx`,
`web/src/test-setup.ts`, `shell.*.test.tsx`) was modified.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `screens/runs/outcome-badge.tsx:13-34` (`RUN_STATE_TIER`, `RUN_STATE_LABEL`); `run-table.tsx:70-77` | `outcome-badge.test.tsx:29-34,54-67`; `runs-screen.test.tsx:76-99` | Each of the five terminal outcomes renders its own word and variant in a row; explicit guards that `partial` is not `status-good` and reads no *Succeeded* |
| AC-23 | SATISFIED | `run-controls.tsx:72-78,130` — `onStarted`, then `setQueued(true)` and no `navigate` when `queuedBehind !== null`; button stays `data-variant="default"` with no `disabled` | `start-run.test.tsx:96-114`; `run-controls.test.tsx:70-81` | Asserts the `role="status"` notice text, the unchanged location through a `useLocation` probe, and that a second click calls the API again |
| AC-24 | SATISFIED | `run-controls.tsx:10,60-64,125-129` | `start-run.test.tsx:66-78` | `blocked`, not `disabled`; reason text resolved through `aria-describedby`; click makes no call |
| DAC-E5-16 | SATISFIED | `outcome-badge.tsx:13-22` | `outcome-badge.test.tsx:29-34,59-67` | Table compared verbatim with `ux-design.md:704-713`; `abandoned` distinct from `failed` and `cancelled` |
| DAC-E5-17 | SATISFIED | `outcome-badge.tsx:37-38` (`ABANDONED_EXPLANATION`); `run-table.tsx:72-76` | `runs-screen.test.tsx:104-114` | Sentence byte-compared with `ux-design.md:556-562`; the *Start acquisition run* button is asserted present on the same screen |
| DAC-E5-S6-1 | SATISFIED | `screens/runs/index.tsx:16,89-91,111-114` — chained `setTimeout` only when the latest response holds a non-terminal run; cleared on unmount, filter change and terminal data; no `setInterval` | `runs-screen.polling.test.tsx:78-122` | Cadence proved at the exact boundary (9 999 ms → 1 call, +1 ms → 2 calls); ten quiet minutes after an all-terminal response → no further call; unmount clears the timer |
| DAC-E5-S6-2 | SATISFIED | `outcome-badge.tsx:13-22` | `outcome-badge.test.tsx:6-15,29-42` | All eight states asserted individually, plus six pairwise-distinct icon shapes (STD-UI-8) |
| DAC-E5-S6-3 | SATISFIED | `run-controls.tsx:7-8,59,120-124` | `start-run.test.tsx:49-63,80-91` | Depth reason distinct from the instruments reason; both present, depth first in DOM and in `aria-describedby`, when both hold |
| DAC-E5-S6-4 | SATISFIED | `run-table.tsx:62-69` — `th[scope=row]` holding a `Link`; no row handler | `runs-screen.test.tsx:119-134`; `routes.test.tsx` Runs case; `tests/e2e/runs-start-cancel.spec.ts` | Asserts `tagName === "A"`, `href=/runs/<id>`, and that no `<tr>` carries `onclick` or `role="link"` |
| DAC-E5-S6-5 | SATISFIED | `cancel-run.tsx:84-91,116` | `cancel.test.tsx:38-74` | Both titles and bodies byte-compared with `ux-design.md:515-535`; the two dialogs' `textContent` asserted unequal |
| DAC-E5-S6-6 | SATISFIED | `cancel-run.tsx:153-166,172-179` — keyed on `ApiError.code`/`state`, guarded by `isRunState` | `cancel.test.tsx:147-167`; `client.runs.test.ts:49-66` | Asserts *This run had already completed.* with a `succeeded` badge and that the document contains no *Cancelled*/*Cancelling* anywhere |
| DAC-E5-S6-7 | SATISFIED | `screens/runs/index.tsx:84-88,157-175` | `runs-screen.test.tsx:139-167` | Never-run sentence with no `<table>`; filtered-empty uses different copy plus *Reset filter*, and the filter is asserted on the call arguments |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tailwind.config.js:+18-19,+22-23,+28-29` | Exactly six tokens in the file's `hsl(var(--x) / <alpha-value>)` form; all six CSS vars confirmed to pre-exist in `design-system/theme.css:150-159,287-296` (selected, not introduced — STD-UI-29) |
| T002 | complete | VERIFIED | `web/src/api/types.ts:128-193` | All five types with the exact field names and nullability listed; `export type RunSummary = null` still at line 20 and still used by `most_recent_run` |
| T003 | complete | VERIFIED | `outcome-badge.test.tsx` | `// Implements TC-COMP-251/286/009` present; all three regression guards present |
| T004 | complete | VERIFIED | `runs-screen.test.tsx` | `// Implements TC-COMP-252/288/291/009`; columns, `formatTimestamp` value asserted literally as `2026-09-01 10:00:00 America/Chicago`, em dash + `sr-only` *Not recorded*, pinned in-progress row, error alert, truncation sentence both ways |
| T005 | complete | VERIFIED | `runs-screen.polling.test.tsx` | `// Implements TC-COMP-285`; all three non-terminal states exercised. Documented timer deviation — see Scope and Plan Deviations |
| T006 | complete | VERIFIED | `screens/coverage/start-run.test.tsx` | `// Implements TC-COMP-287/024/023`; rendered standalone in a `MemoryRouter` with no Runs-screen state, which is what the Coverage-composability claim requires; does not mock `../runs/run-controls` |
| T007 | complete | VERIFIED | `cancel.test.tsx` | `// Implements TC-COMP-289/290`; initial focus on *Cancel*, Escape closes with no call and restores focus to the trigger, in both states |
| T008 | complete | VERIFIED | `client.runs.test.ts` | `ApiError` two-arg shape, `409` with and without `state`, non-JSON `500`, query-string construction, snake→camel mapping, `a%2Fb` encoding, `ApiUnreachableError` |
| T009 | complete | VERIFIED | `run-controls.test.tsx` | Post-202 routing and ordering, refusal override keyed on `code` with the API's own message asserted absent, override cleared on prop change, unknown preconditions, two failure shapes, single-submit with `aria-busy` and no `disabled` |
| T010 | complete | VERIFIED | `routes.test.tsx:+21,+100-123` | Adds the mock and the `/runs`-inside-shell case; the "declares exactly five routes" case and the `/runs/:runId` sibling are untouched in the diff |
| T011 | complete | VERIFIED | `client.ts:52-73,82-108,313-398` | `ApiError` extended additively with an optional third parameter, so `new ApiError(msg, "unknown")` still compiles and `instanceof` is unchanged; `toApiError` keeps its degrade-to-generic path; three calls go through the private `requestJson` |
| T012 | complete | VERIFIED | `outcome-badge.tsx` | All seven named exports present, `data-testid`/`data-variant`/`data-icon` as specified, classes follow `screens/instruments/badges.tsx` |
| T013 | complete | VERIFIED | `run-controls.tsx` | Props and copy constants exactly as pinned; `tabIndex={0}`, never `disabled`; `preventDefault()` when blocked; refusal override from `error.code` only; `screens/instruments/start-action.tsx` unmodified |
| T014 | complete | VERIFIED | `cancel-run.tsx` | `<dialog open aria-modal data-variant="confirm">`, manual trap copied rather than imported from `instruments/`, dialog stays open with `aria-busy` while submitting, trigger withdrawn after a result |
| T015 | complete | VERIFIED | `run-table.tsx`, `screens/runs/index.tsx` | Header order, `th[scope=row]` link, right-aligned `font-numeric` counts, stable non-terminal pinning with `border-l-status-active`, `ScreenState` docstring on the never-produced variants, `RUNS_POLL_INTERVAL_MS` exported, no `CancelRunControl` on `/runs` |
| T016 | complete | VERIFIED | `routes.tsx:+3,+33` | Only the `/runs` element changed; `ScreenPlaceholder` retained for `/coverage` |
| T017 | complete | VERIFIED | full `npm run test` rerun by this review: 29 files, 184 tests passed, and `grep -ci "not wrapped in act"` over the full output returned 0 | No existing test file needed editing, which the diff confirms |
| T018 | complete | VERIFIED | `tests/e2e/runs-start-cancel.spec.ts`; `npm run test:e2e` rerun green (2 passed) | Arranges depth and instruments through `request`, starts through the UI, asserts the `/runs/<uuid>` route, the row link `href`, *Requested*, then the API cancel and *Cancelled* within one poll |
| T019 | complete | VERIFIED (by assertion inspection) | Each of the nine mutations the task names has a matching assertion that would fail: tier values (`outcome-badge.test.tsx:29-34,54-67`), cadence (`polling:93-96`), poll condition incl. `cancelling` (`polling:78`), terminal state in the condition (`polling:98-111`), `disabled` on blocked (`start-run.test.tsx:55,72`), reason order (`start-run.test.tsx:84-91`), row `onClick` vs `Link` (`runs-screen.test.tsx:124-134`), dialog branch (`cancel.test.tsx:38-74`), `409` branch (`cancel.test.tsx:164`), queued 202 navigation (`start-run.test.tsx:110`) | The mutation runs themselves cannot be reproduced without editing implementation code, which this gate may not do; the claim is corroborated by the assertions and by `CAP-001-E5-S6-tdd-evidence.yaml:114-131` |
| T020 | complete | VERIFIED | `CAP-001-E5-S6-tdd-evidence.yaml` — six cycles, each with `red`, `green`, `code_review_verdict`, `spec_drift.drift_detected` (+ resolution where true) and `tests_executed: true`; two drift findings recorded as resolved/reverted, no `REJECTED` cycle | Commit granularity deviates (one stage commit, `commit_hash: stage commit (see header)`) under recorded decision `DEC-0006`, whose `commits` list names `1a0eb78`; the commit carries the `Decision-Id` trailers for DEC-0004/0005/0006 |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `outcome-badge.test.tsx` / TC-COMP-251, TC-COMP-286, TC-COMP-009 (presentation half) | ADEQUATE | Drives all eight states through the real component, asserting variant, word, per-tier `aria-hidden` icon and six pairwise-distinct shapes; the three negative guards fail on the exact tier inversions the AC forbids | none |
| `runs-screen.test.tsx` / TC-COMP-252, TC-COMP-288, TC-COMP-291, TC-COMP-009 (list half) | ADEQUATE | Mocks only the client module, rendering the real screen, table and badges; asserts the abandoned sentence verbatim, anchor semantics, the absence of row targets, never-run vs filtered-empty copy with the filter argument, column order and `scope`, a literal Chicago timestamp, em dash + `sr-only`, in-progress pinning, the error alert with a working *Retry*, and the truncation sentence present and absent | Failure of a *poll* (as opposed to the initial load) is untested — IR-001 |
| `runs-screen.polling.test.tsx` / TC-COMP-285 | ADEQUATE | Pure fake timers make the 10 000 ms boundary exact rather than approximate; all three non-terminal states start polling, polling stops on terminal data, the timer is cleared on unmount, and a poll in flight keeps the rows with `aria-busy="true"` and no loading message | Deterministic and isolated; `afterEach` restores real timers |
| `start-run.test.tsx` / TC-COMP-287, TC-COMP-024, TC-COMP-023 | ADEQUATE | Renders the control standalone, which is the claim under test; resolves `aria-describedby` to real text rather than asserting the attribute, checks keyboard reachability with `userEvent.tab()`, and proves the route did not change with a `useLocation` probe | none |
| `cancel.test.tsx` / TC-COMP-289, TC-COMP-290 | ADEQUATE | Exercises both dialog variants, the focus contract, the `cancelling` vs `cancelled` distinction, the busy-until-resolved dialog, the `409` race, and a generic failure alert inside the dialog; asserts the trigger is withdrawn rather than merely disabled, and `it.each` covers all six non-offered states | none |
| `client.runs.test.ts` | ADEQUATE | Stubs `fetch` only, so the real `requestJson`, `toApiError` and mappers run; asserts no `Content-Type` is sent, `init.body` undefined, exact URLs, full field mapping and the transport-failure class for all three calls | none |
| `run-controls.test.tsx` | ADEQUATE | Covers ordering (`onStarted` before navigation), the refusal override including that the API's own sentence is *absent*, override clearing, and single-submit against a deliberately pending promise | none |
| `routes.test.tsx` (Runs case) | ADEQUATE | Asserts the real screen inside the real shell, the placeholder text gone, and `aria-current="page"` on the rail item | none |
| `tests/e2e/runs-start-cancel.spec.ts` | ADEQUATE | Real API and PostgreSQL; the final assertion can only pass if the 10 s poll actually refetches, so it covers DAC-E5-S6-1 end to end | Queued and `409` paths are unreachable without a runner, correctly delegated to T006/T007/T009 |

No test asserts only mock setup, and none reproduces implementation logic: every behavioural
expectation is a literal string, attribute or call-argument value written independently of
the module under test.

## Independent Validation

All commands were run from `repos/factorflow-v2/FactorFlow-v2` (the repository root, which
is the working directory `tech-stack.md` specifies).

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `git merge-base --is-ancestor c97311d4 HEAD` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Frozen integration base confirmed as an ancestor of HEAD |
| `npx tsc --noEmit` | `.` | 0 | PASS | No output |
| `npm run lint` | `.` | 0 | PASS | Biome: checked 60 files, no fixes applied |
| `npm run format` | `.` | 0 | PASS | Biome format check: 60 files, no fixes applied |
| `npm run test` | `.` | 0 | PASS | 29 files, 184 tests passed in 3.00 s; `grep -ci "not wrapped in act"` over the full output = 0; rerun a second time, also green |
| `npm run build` | `.` | 0 | PASS | Vite production build, 52 modules, writes `src/factorflow/api/static/` (expected per `tech-stack.md`); `git status --porcelain` empty afterwards |
| `npm run test:e2e` | `.` | 0 | PASS | Playwright/Chromium against the real API and a PostgreSQL container: 2 passed (`runs-start-cancel`, `instruments-add-retire`) in 16.2 s; Docker available and container removed by `posttest:e2e` |
| `npm ci` | `.` | 0 | PASS | Lockfile install reproduces cleanly (run after the suites, so no suite depended on a hand-modified tree) |
| `uv sync --all-extras` | `.` | 0 | PASS | Resolved 46 packages, checked 43 |
| `uv build` | `.` | 0 | PASS | sdist and wheel built |
| `uv run pytest` | `.` | 0 | PASS | 710 passed in 220.52 s — the full suite including `postgres`-marked tests, so the narrower `-m 'not postgres'` form was not needed |
| `uv run ruff check .` | `.` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `.` | 0 | PASS | 170 files already formatted |
| `uv run mypy src` | `.` | 0 | PASS | No issues in 47 source files |

Story-specific validation from the task plan's Validation Plan section was verified by
assertion inspection rather than by a separate command, and is recorded per criterion in
the Acceptance Criteria Verification table above. Nothing was excluded: every command in
the task plan's Validation Plan and every command in `tech-stack.md`'s Validation Commands
table was run.

### Validation Side Effects

- Before: `git status --porcelain` empty; HEAD `1a0eb78`.
- After: `git status --porcelain` empty; HEAD `1a0eb78`.
- Unexpected tracked-file changes: none. `npm run build` and `npm run test` write
  `src/factorflow/api/static/` and `uv build` writes `dist/`; both are ignored paths and
  the tracked static marker was left intact (asserted by `app/build-output.test.tsx`).

## Findings

### IR-001 — A poll that fails is never exercised by a test

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S6-1
- **Tasks**: T004, T005, T015
- **Files**: `web/src/screens/runs/index.tsx:93-102`; `web/src/screens/runs/runs-screen.polling.test.tsx`; `web/src/screens/runs/runs-screen.test.tsx:222-237`
- **Claim challenged**: that the polling behaviour required by DAC-E5-S6-1 is fully covered
  by T005's specification.
- **Observed evidence**: the only failure case tested is a rejection of the *first*
  `listAcquisitionRuns` call (`runs-screen.test.tsx:225`, `mockRejectedValueOnce` before
  mount). No test rejects a later, polled call. Reading
  `index.tsx:93-102`, a rejected poll replaces the populated state with `error`, which
  discards the rows already shown and — because the next `setTimeout` is scheduled only in
  the `then` branch — permanently ends polling until the owner presses *Retry* or changes
  the filter.
- **Expected evidence/behavior**: DAC-E5-S6-1 requires polling "every 10 seconds" while a
  run is non-terminal; `ux-design.md:462-472` specifies the Error state as "Body replaced,
  retry offered", so the rendering itself is contract-legal, but the transition from a
  healthy polling screen into that state, and whether polling may stop on a single
  transient failure, is asserted nowhere.
- **Impact**: a regression that stops the poll loop on any transient response — or one that
  leaves a stale table rendered while the fetch is failing — would pass the whole suite.
  The behaviour is also the one path where a long-lived screen can go quiet without the
  owner acting.
- **Required remediation**: add a test to `runs-screen.polling.test.tsx` that resolves a
  non-terminal first response and rejects the poll at 10 000 ms, pinning the chosen
  behaviour (error alert shown, and whether polling resumes or requires *Retry*). If the
  intended behaviour is "stop and wait for *Retry*", state that in the `index.tsx` polling
  docstring so it reads as a decision rather than an omission.

### IR-002 — *Not yet loaded* is shown after a load has already happened

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (STD-UI-2)
- **Tasks**: T015
- **Files**: `web/src/screens/runs/index.tsx:145-149`
- **Claim challenged**: that the toolbar's last-updated text describes the screen's actual
  condition in every state.
- **Observed evidence**: the text is `Last updated …` only for `kind === "populated"`, and
  literally `Not yet loaded` for every other state — including `error` reached from a failed
  poll after a successful load, and `empty-no-match` after a successful filtered request.
- **Expected evidence/behavior**: STD-UI-2 (`docs/constitution/standards/ui-conventions.md:161-164`)
  requires messages to describe what the product actually did. A request that was made and
  answered is not "not yet loaded". The coding agent's own cycle-5 reviewer raised this and
  it was left unchanged (`CAP-001-E5-S6-tdd-evidence.yaml:96-99`).
- **Impact**: cosmetic and local; the owner may read a failed refresh as a screen that never
  tried.
- **Required remediation**: distinguish "never attempted" from "attempted, nothing to show"
  in that one string, or keep the last successful `fetchedAt` for display while the body
  shows the error. No new copy should be invented without an absorbing UX revision.

### IR-003 — `CancelRunControl` has no production consumer in this change set

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E5-S6-5, DAC-E5-S6-6 (both satisfied by component tests)
- **Tasks**: T014
- **Files**: `web/src/screens/runs/cancel-run.tsx`
- **Claim challenged**: that every file added by this story is reachable in the shipped
  application.
- **Observed evidence**: `cancel-run.tsx` is imported only by `cancel.test.tsx`. No screen
  mounts it, by design: the task plan's Resolved Conflict 4 places cancellation on Run
  detail, which `CAP-001-E7-S4` owns, and T015 explicitly forbids mounting it on `/runs`.
- **Expected evidence/behavior**: the story's Description says it delivers "the cancel
  controls", and no story AC names the screen, so the decision is traceable and consistent
  with `ux-design.md` 1.5 and owner-web-app 2.5/9. The residual risk is only that 210 lines
  of behaviour sit behind tests alone until E7-S4 lands.
- **Impact**: if `CAP-001-E7-S4` slips or chooses to rebuild the control, this file becomes
  dead code that still passes every gate.
- **Required remediation**: none in this story. Carry it as a tracked dependency on
  `CAP-001-E7-S4` (the task plan's Other Notes already records that E7-S4's
  `dependencies.yaml` entry lacks the hard edge to this story), and let doc-sync raise that
  edge.

### IR-004 — The tasks file's `updated` date and `artifact_version` were not advanced

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001–T020 (bookkeeping)
- **Files**: `docs/capabilities/.../CAP-001-E5-S6-tasks.md:6,10`
- **Claim challenged**: that the task plan's frontmatter reflects its current content.
- **Observed evidence**: the commit flipped all twenty checkboxes but left
  `status: draft` and `updated: 2026-10-01`. The story moved to `in-review` in the same
  commit.
- **Expected evidence/behavior**: `story-coding` SKILL.md step G requires the checkbox and
  story-status updates, which were made, and requires an `updated` bump only in
  review-rework mode, which this was not. So this is an evidence-quality nit, not a rule
  violation; it is recorded because a reader comparing the two frontmatters will see a
  plan still marked `draft` behind an implemented story.
- **Impact**: none functional.
- **Required remediation**: none required for this gate; doc-sync may align the plan's
  status and date with the story's lifecycle.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T005 fake-timer setup (justified).** The plan prescribed
  `vi.useFakeTimers({ shouldAdvanceTime: true })`; the test uses plain `vi.useFakeTimers()`
  with `act` + `advanceTimersByTimeAsync`. `CAP-001-E5-S6-tdd-evidence.yaml:90-94` records
  that real milliseconds leaking into the fake clock fired the poll before the 9 999 ms
  assertion. The implemented form proves the same behaviour more strictly (an exact
  boundary rather than an approximate one), and this review reran the file green.
- **T020 commit granularity (justified by decision).** One story-coding stage commit
  instead of one commit per cycle, under `projects/factorflow-v2/decisions/DEC-0006.md`
  (class `contained`, `decided_by: agent`, confidence high), whose `commits` field names
  `1a0eb78`. The commit carries `Decision-Id: DEC-0004`, `DEC-0005` and `DEC-0006`, so the
  work is revertable as `docs/unattended-mode.md` requires.
- **Provisional plan values in force.** DEC-0004 (Start control interface) and DEC-0005
  (Open Gaps 3–11: cancel interface, fetch-layer names, 50-row disclosure, poll scope,
  columns/labels/icons, E2E shape, failed precondition read, failure copy, both-reasons
  order) remain `owner_reviewed: false`. The implementation matches them exactly; a later
  owner verdict against any of them would be a change request on this story, not a defect
  found here.
- **Bookkeeping inconsistencies**: none — every checked task has corroborating evidence, and
  no unchecked task appears implemented.
- **Scope leakage**: none found.
- **Follow-ups already recorded by the plan** (not findings against this story):
  `screens/instruments/start-action.tsx` keeps its non-UX copy and depth-only reason;
  `ScreenPlaceholder` stays for `/coverage` until `CAP-001-E6-S4`; the E5-S5 API 409
  message text still diverges from `ingestion-api` section 10.
- **Noted but not raised as a finding**: the `instruments/empty-states.test.tsx` flake the
  coding agent recorded (`tdd-evidence.yaml:95`) did not reproduce — that file passed in
  both full-suite runs performed here.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: run `$doc-sync` for `CAP-001-E5-S6` against component state
  `sha256:61cf66a849460bb682c0a660a0833800f13b696e6e8afbbfbc90024a53092c05`. Absorb the
  provisional values behind DEC-0004/DEC-0005 into their named documents
  (owner-web-app 2.1/2.5/7, ux-design 1.1/1.4/1.5 and section 5), and raise the missing
  `CAP-001-E7-S4 → CAP-001-E5-S6` hard edge in `dependencies.yaml`. IR-001 should be fixed
  by the Coding Agent in this story or carried as an explicit, owner-visible test debt
  item; IR-002, IR-003 and IR-004 are accepted downstream.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002, IR-003, IR-004 (LOW).
