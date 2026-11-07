---
artifact_schema_version: 1
artifact_id: CAP-003-E4-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T06:32:11Z
  source_artifacts:
    - id: CAP-003-E4-S2
      version: "1"
    - id: CAP-003-E4
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: PRODUCT-UX-S02
      version: "4"
    - id: CAP-003-setup-ui-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E4-S2 — Setup Steps 1 and 2: the Step List, the Step Card, Market Data Key Presence and History Depth

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/first-run-setup/stories/CAP-003-E4-S2.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/screens/setup/`; design `setup-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Builds the first visible parts of the setup screen on top of CAP-003-E4-S1's drafts, step state and copy. `step-list.tsx` renders the left column: an optional header slot (the screen's `h1` and sub-line, which CAP-003-E4-S4 passes) and the `Stepper` `vertical` as a `nav` *Setup steps*, with `aria-current="step"` on the current step, done steps as links that call `goTo`, done state in text, and each done step's one-line summary (*Found* / *Missing*, *{y} years of history*, *{n} followed stocks*, *Download started {start time}*). The column is bounded by `LAYOUT.sideColumnMin` and `LAYOUT.sideColumnMax` and the dots are `LAYOUT.markerSize`. `step-card.tsx` renders the step card: a `section` labelled by its `h2`, *Step {n} of 4*, the explanation capped at `LAYOUT.explanationMeasure`, the controls, the info note and the footer (**← Back: {previous step title}**, *Next: {next step title}*, **Continue**). It also exports `useStepHeadingFocus(current)`, which moves focus to the `h2` when the step changes, and `StepReadError`, which renders *Couldn't read {subject}: {reason}* with **Try again**. `step-market-data.tsx` is step 1: the key line through `StatusBadge` (*Found* / *Missing* from `labelOf` and `tierOf`), the variable name and the restart line when missing, `NotDeterminable` with *FactorFlow isn't answering, so the key can't be checked.* whenever health is not answering, never *Missing*, never the key's value, and **Continue** always available (AC-4, DAC-E4-3, DEC-0203). `step-history-depth.tsx` is step 2: `form` `stacked` with `input` `numeric` and the *years* suffix in its accessible name, validated on blur, saved on **Continue** through the delivered `setHistoryDepth` (`PUT /api/settings/history-depth`). A `200` re-reads the depth and makes step 3 current; a `422` renders *History depth must be a whole number of years from 1 to 50.* as the field error with the value kept; any other failure is a field error with the value kept; a failed depth read shows *Couldn't read history depth: {reason}* with **Try again** in step 2 only (AC-17, DAC-E4-4, DAC-E4-13, DAC-E4-S2-1). The story widens CAP-003-E1-S1's literal scan to `web/src/screens/setup/` (AC-26). No delivered file is edited; `copy.ts` (CAP-003-E4-S1) gains three strings and `token-literals.test.ts` (CAP-003-E1-S1) gains one scanned directory.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | Step 1 states whether the key was found and, when missing, the variable to set; never its value | T002, T003, T011, T016 |
| AC-17 | The depth is saved through the delivered `PUT /api/settings/history-depth` with CAP-001's refusals unchanged | T005, T012, T017 |
| AC-25 | The step list is keyboard-navigable; the step card's `h2` takes focus when the step changes | T005, T008, T010, T014, T015 |
| DAC-E4-3 | Step 1's three renderings; **Continue** always available | T002, T003, T011, T016 |
| DAC-E4-4 | Step 2 saves through the PUT; a `422` is the field error with the value kept; the plan-limit note is copy | T005, T012, T017 |
| DAC-E4-13 | A failed depth read shows *Couldn't read history depth: {reason}* with **Try again** in step 2 only; a failed save is a field error with values kept | T008, T009, T011, T012, T013, T014, T017 |
| DAC-E4-S2-1 | After a `200`, step 2 reads done *{y} years of history*, step 3 is current and its `h2` has focus | T005, T014, T015, T017 |
| DAC-E4-S2-2 | Health unreachable: `coverage-unknown`, never *Missing*; no element carries the key's value | T003, T016 |
| DAC-E4-S2-3 | `web/src/screens/setup/` is in the literal scan and its non-test sources are clean | T007, T018 |
| DAC-E4-S2-4 | No DAC-E7-3 term in the visible text or accessible names of the step list, the step card and steps 1 and 2 in every state | T006, T009, T013 |
| DAC-E4-S2-5 | Key presence through `StatusBadge` with label text and an `aria-hidden` shape; *Not determinable* through `NotDeterminable` | T004, T016 |

Mapped test cases (`tests/component/setup-ui-tests.md`; `tests/coverage-matrix.md` lines 203, 204, 217-221 and the per-story count "5 of 5" at line 413):

- **TC-COMP-099** (DAC-E4-3): the epic criterion this story carries that no story-level criterion refines (coverage-matrix line 447).
- **TC-COMP-108** (DAC-E4-S2-1, DAC-E4-4, AC-17).
- **TC-COMP-109** (DAC-E4-S2-2).
- **TC-COMP-110** (DAC-E4-S2-3).
- **TC-COMP-111** (DAC-E4-S2-4).
- **TC-COMP-112** (DAC-E4-S2-5).

DAC-E4-13's state half is TC-COMP-106 (CAP-003-E4-S1). This story renders it, and T012 (h) tests the rendering. The setup-ui test specification and the coverage matrix are `status: draft`, the lowest rung of the precedence ladder; where a step is generic, the plan sharpens it from the story's criteria.

## Phase 1: Setup

**Purpose**: Confirm the upstream modules this story imports exist. No package, configuration or directory change.

- [ ] T001 From the repo root, confirm these exist in the working tree, then run `npm ci` and `npm run test` and record the suite green before any change (traces to no AC; prerequisite):
  - CAP-003-E4-S1: `web/src/screens/setup/draft.tsx`, `use-setup-state.ts` (`SetupState` with `depth`, `activeCount`, `loading`, `reread`, `goTo`, `drafts`, `setDraft`) and `copy.ts`.
  - CAP-003-E1-S1: `web/src/components/ui/badge.tsx`, `button.tsx` (with `blocked`), `card.tsx`, and `web/src/components/token-literals.test.ts` exporting `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn`.
  - CAP-003-E1-S2: `web/src/components/ui/form.tsx` (`Form`, `FormRoot`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`) and `input.tsx` (`variant="numeric"`, `suffix`), with `react-hook-form`, `zod` and `@hookform/resolvers` in `package.json`.
  - CAP-003-E1-S3: `web/src/components/ui/stepper.tsx` (`Stepper({ label, steps, markerSize })`, `StepperStep`).
  - CAP-003-E1-S5: `web/src/components/patterns/tiers.ts` (`tierOf`, `labelOf`) and `status-badge.tsx` (`StatusBadge({ tier, children })`).
  - CAP-003-E1-S6: `web/src/components/patterns/presence.tsx` (`NotDeterminable({ reason, label? })`) and `format.ts` (`formatInstant`, `formatCount`).
  - CAP-003-E3-S1: `web/src/app/shell-types.ts` (`ReadState`, `Attention`).
  - CAP-003-E3-S2: `web/src/app/layout.ts` (`LAYOUT`) and `web/src/app/health.tsx` (`HealthState` with `lastAnsweredAt`).
  - CAP-003-E3-S3: `web/src/app/shell-context.tsx` (`useShell`, `ShellContextValue`).

**Checkpoint**: Every import below resolves, and the delivered suite and every upstream CAP-003 suite are green.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the four renderings, the save, the focus rule and the literal scan.

**Shared fixtures.** Each test file declares its own fixtures, as independent literals; no shared helper module is created (it would be a scanned non-test source).

- **Shell mock.** `vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }))`, as CAP-003-E4-S1's `use-setup-state.test.ts` does. A helper `shell(overrides)` returns a full `ShellContextValue` literal (`health`, `attention`, `scores: { kind: "loading" }`, `refresh: vi.fn()`, `setTitleDetail: vi.fn()`).
- **Health fixtures** (typed `ShellContextValue["health"]`). `HEALTH_FOUND`: `liveness: "answering"`, a full `HealthResponse` literal with `credential_present: true`, both times `new Date("2026-09-06T18:30:00.000Z")`. `HEALTH_MISSING`: the same with `credential_present: false`. `HEALTH_UNREACHABLE_STALE_MISSING`: `liveness: "unreachable"`, the `HEALTH_MISSING` `health` retained (the delivered failure rule keeps the previous answer), `lastUpdated` 18:31:00Z, `lastAnsweredAt` 18:30:00Z. `HEALTH_UNKNOWN`: `{ liveness: "unknown", health: null, lastUpdated: null, lastAnsweredAt: null }`. Every `HealthResponse` literal carries one extra planted property `api_key: "SENTINEL-KEY-VALUE"` (cast through `unknown`), standing in for a leaked value.
- **Attention fixtures** (typed `ReadState<Attention>`): `{ kind: "ok", data: { …ATTENTION_BASE, latest_download }, checkedAt }` with `ATTENTION_BASE` a full `Attention` literal and `latest_download: null`; `downloadAt(started_at, requested_at)` gives a `latest_download` literal in state `running`.
- **State literal.** For the unit tests of a single component, `stateWith(overrides)` returns a full `SetupState` literal: `current`, `done`, `step4: "ready"`, `drafts` (an independent literal), `depth`, `activeCount`, `loading: false`, and `goTo`, `reread`, `setDraft` as `vi.fn()`. Only TC-COMP-108 and TC-COMP-111 use the real `useSetupState`.
- **Client mock** (step 2 only). `vi.mock("../../api/client", async (importActual) => ({ ...(await importActual()), getHistoryDepth: vi.fn(), listInstruments: vi.fn(), setHistoryDepth: vi.fn() }))`, the pattern of the delivered `web/src/screens/settings/history-depth-form.test.tsx:7`. `ApiError` and `ApiUnreachableError` stay real.
- **Vocabulary helper** (step 2 file). `visibleAndAccessibleText(container)` joins `container.textContent` with every `aria-label` and `title` value and the text of every element an `aria-labelledby` or `aria-describedby` id refers to (the CAP-003-E6-S1 plan's helper). `FORBIDDEN = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-099 (Step 1 shows Found or Missing with the variable and restart line) in a new `web/src/screens/setup/step-market-data.test.tsx`, with a `// Implements TC-COMP-099` comment. Render `<StepMarketData state={stateWith({ current: 1 })} />` with the shell mocked. Cases, `it.each` over the three health fixtures where the row says so:
  - (a) `HEALTH_FOUND`: the region `getByRole("region", { name: "Connect market data" })` holds the text *Market data key:* and a badge `[data-variant="status-good"]` whose text is exactly *Found*. Neither *Set the environment variable* nor *Restart FactorFlow after setting it.* is present.
  - (b) `HEALTH_MISSING`: a badge `[data-variant="status-critical"]` with text *Missing*; a paragraph whose `textContent` is exactly *Set the environment variable FACTORFLOW_MASSIVE_API_KEY to your Massive API key.*, holding a `code` element whose text is `FACTORFLOW_MASSIVE_API_KEY`; and a paragraph *Restart FactorFlow after setting it.*
  - (c) `HEALTH_UNREACHABLE_STALE_MISSING`: a badge `[data-variant="coverage-unknown"]` with text *Not determinable* and the reason *FactorFlow isn't answering, so the key can't be checked.* beside it.
  - (d) **Continue always available**, in all three rows: `getByRole("button", { name: "Continue" })` has `data-variant="default"` and no `aria-disabled`; clicking it calls `goTo` once with `2` (DEC-0203: a missing key never blocks).
  - (e) **No value anywhere**, in all three rows: `container.innerHTML` does not contain `SENTINEL-KEY-VALUE`.

  Kills:
  - negate-boolean on the missing-lines condition (`!credential_present`): (a) and (b).
  - swap-case on the credential status (`present: true` passed for a missing key): (b)'s `status-critical` and *Missing*.
  - a hand-written mutant that renders **Continue** `blocked` when the key is missing: (d).
  - a hand-written mutant that spreads `health.health` onto an element as `data-*` attributes: (e).

- [ ] T003 [P] Implement TC-COMP-109 (Step 1 unreachable shows Not determinable and never the key) in `web/src/screens/setup/step-market-data.test.tsx`, sequential with T002 (one file), with a `// Implements TC-COMP-109` comment. With `HEALTH_UNREACHABLE_STALE_MISSING`, whose retained `health` still says `credential_present: false`:
  - (a) The badge is `[data-variant="coverage-unknown"]`; `queryByText("Missing")` is `null`; no `[data-variant="status-critical"]` exists; the variable and restart lines are absent.
  - (b) No element's text or attribute contains `SENTINEL-KEY-VALUE`: walk `container.querySelectorAll("*")` and check each element's own text nodes and every `attributes[i].value`.
  - (c) The same with `liveness: "unreachable"` and `health: null` (never answered): the same `coverage-unknown` rendering.

  Kills:
  - a hand-written mutant that reads `health.health?.credential_present` before checking `liveness`: (a) renders *Missing* from the stale answer.
  - swap-case `NotDeterminable` → `StatusBadge tier="neutral"`: (a)'s `coverage-unknown`.

- [ ] T004 [P] Implement TC-COMP-112 (Key-presence badge through StatusBadge; Not determinable through NotDeterminable) in `web/src/screens/setup/step-market-data.test.tsx`, sequential with T003, with a `// Implements TC-COMP-112` comment.
  - (a) For `HEALTH_FOUND` and `HEALTH_MISSING`: the `status-*` badge's text is exactly the label (*Found*, *Missing*), it contains an `svg[aria-hidden="true"]` (the tier shape), and neither the badge nor its `svg` carries an `aria-label` or `title`.
  - (b) For `HEALTH_UNREACHABLE_STALE_MISSING`: the `coverage-unknown` badge's text is *Not determinable*, it has `aria-describedby` naming an element whose text is the reason (`toHaveAccessibleDescription("FactorFlow isn't answering, so the key can't be checked.")`), and no `[data-variant^="status-"]` element exists.
  - (c) No state by colour alone: every `[data-variant]` badge in every row has non-empty text.

  Kills:
  - a hand-written mutant that renders the label in a bare `span` with the status colour classes: (a), no `data-variant` badge and no `svg`.
  - drop-field-copy on the `reason` passed to `NotDeterminable`: (b).

- [ ] T005 Implement TC-COMP-108 (Successful depth save marks step 2 done and focuses step 3) in a new `web/src/screens/setup/step-history-depth.test.tsx`, with a `// Implements TC-COMP-108` comment.
  - **Harness.** A test-local `Screen` stands in for CAP-003-E4-S4's `SetupScreen`: it calls the real `useSetupState()` and `useStepHeadingFocus(state.current)`, renders `<p>loading</p>` while `state.loading`, and otherwise renders `<StepList state={state} />` and the current step: `StepMarketData` for 1, `StepHistoryDepth` for 2, and for 3 and 4 a bare `<StepCard step={n} question={n === 3 ? QUESTIONS[3] : STEP4.downloadFor("12")} onBack={() => state.goTo(n - 1)} />`. It is wrapped in `SetupDraftProvider`. The shell gives `HEALTH_FOUND` and an `ok` attention with `latest_download: null`. `listInstruments` resolves `{ rows: [], activeCount: 0, retiredCount: 0, nextCursor: null }`. `getHistoryDepth` resolves `{ years: null, updatedAt: null }` first and `{ years: 5, updatedAt: "2026-09-06T18:00:00Z" }` second.
  - **Steps (the TC's).** Await the step 2 region (*How far back should history go?*). Assert `document.activeElement` is not its `h2` (no focus on entry; Resolved Conflict 1). Type `5` into `getByRole("spinbutton", { name: "History depth years" })` and click **Continue**.
  - **Expected.** `setHistoryDepth` was called once with exactly the number `5` (`toHaveBeenCalledWith(5)`, not `"5"`). `getHistoryDepth` has 2 calls. The step list's second item holds `getByRole("link", { name: "How far back, done" })` and the text *5 years of history*. The third item has `aria-current="step"`. `document.activeElement` is the `h2` whose text is *Which stocks do you want to follow?*.
  - **TC edge case: `422`.** A fresh render where `setHistoryDepth` rejects with `new ApiError("The request did not match the expected shape: `years`.", "req-2", { code: "validation_error" })`. Type `7` and click **Continue**. `findByRole("alert")` has text exactly *History depth must be a whole number of years from 1 to 50.*; the spinbutton has value `7` and `aria-invalid="true"`; the second item still has `aria-current="step"`; `getHistoryDepth` has 1 call; focus has not moved to any `h2`. The server's message is nowhere in the document.

  Kills:
  - drop-field-copy on the `reread("depth")` after the save: the summary never reads *5 years of history*.
  - a hand-written mutant that calls `goTo(3)` before the PUT settles: the `422` case leaves step 3 current.
  - swap-case on the `422` code test (`"validation_error"` → another code): the `422` case renders the save-failure line instead.
  - a hand-written mutant that passes `years` (the string) to `setHistoryDepth`: `toHaveBeenCalledWith(5)`.

- [ ] T006 Implement TC-COMP-111 (Step list, step card, steps 1 and 2 use the display vocabulary) in `web/src/screens/setup/step-history-depth.test.tsx`, sequential with T005, with a `// Implements TC-COMP-111` comment, using T005's harness and the vocabulary helper.
  - (a) **Non-vacuity.** `FORBIDDEN` matches the planted `"one run"`, `"Runs"`, `"Retired"`, `"Instrument"`, `"acquire"` and `"Provider credential"`, and does not match `"this keeps running"` or `"Restart FactorFlow after setting it."`.
  - (b) **Every state of this story.** `it.each` over these renders; each asserts `visibleAndAccessibleText(container)` does not match `FORBIDDEN`:
    1. Step 1 current, with `HEALTH_FOUND`, `HEALTH_MISSING`, `HEALTH_UNREACHABLE_STALE_MISSING` and `HEALTH_UNKNOWN` (`StepMarketData` rendered directly with `stateWith`, since the harness shows *loading* while health is unknown).
    2. Step 2 current: empty; prefilled from a saved depth; after a blur error (`0`); after a `422`; after a save failure with `ApiError` `internal_error` and with `ApiUnreachableError`; with the depth read failed (`ApiError`, then `ApiUnreachableError`).
    3. Step 3 current after a save, so the list shows two done links with summaries.
    4. All four done, with `latest_download` `running` and `started_at` set, so the list shows *Download started …*.
  - (c) **Labels from the catalogue.** In row 1 the badge texts equal `labelOf({ of: "credential", present: true })` and `labelOf({ of: "credential", present: false })`; in rows 3 and 4 each step title equals `STEP_TITLES[n]`.

  Kills:
  - a hand-written mutant that renders the save failure's `ApiError.message` (the delivered envelope messages name instruments): row 2.
  - a hand-written mutant that writes a step title as a domain term (*Acquisition*): rows 3 and 4.

- [ ] T007 Implement TC-COMP-110 (Literal scan widened to web/src/screens/setup/) as a new `describe("setup screen is scanned (TC-COMP-110, DAC-E4-S2-3)")` block appended to `web/src/components/token-literals.test.ts` (CAP-003-E1-S1's file, which screen stories widen by design), with a `// Implements TC-COMP-110` comment, using the file's own `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn`. Do not edit any existing case.
  - (a) `SCANNED_DIRECTORIES` contains `"web/src/screens/setup/"`.
  - (b) Walking `web/src/screens/setup/` recursively finds every one of `draft.tsx`, `use-setup-state.ts`, `copy.ts`, `step-list.tsx`, `step-card.tsx`, `step-market-data.tsx` and `step-history-depth.tsx` as scanned sources, and no `*.test.ts(x)` file. `literalsIn` over each returns `[]`.
  - (c) TC step 3, planted: `literalsIn("web/src/screens/setup/planted.tsx", 'export const x = "p-[12px]";')` returns exactly `["web/src/screens/setup/planted.tsx: 12px"]`.

  RED until T018 appends the entry. Kills: drop of the appended entry: (a), and the walk in (b) then still runs but (a) fails.

### Additional Unit Tests

- [ ] T008 [P] Write the step card contract in a new `web/src/screens/setup/step-card.test.tsx` (AC-25, DAC-E4-13; setup-ui §10; UX design §1.2 step card; DEC-0350, DEC-0345). Cases:
  - (a) **Section and heading.** `<StepCard step={2} question="How far back should history go?" />` renders `getByRole("region", { name: "How far back should history go?" })`. The `h2` has `id` `STEP_HEADING_ID` (`"setup-step-heading"`) and `tabIndex` `-1`. The text *Step 2 of 4* is present.
  - (b) **Footer.** With `onBack` and `onContinue` spies: `getByRole("button", { name: "← Back: Market data" })` has `data-variant="ghost"` and calls `onBack` once; the text *Next: Stocks to follow* is present; `getByRole("button", { name: "Continue" })` has `data-variant="default"` and calls `onContinue` once. For step 3 the labels are *← Back: How far back* and *Next: Download data*.
  - (c) **Absent controls.** Step 1 with `onBack` given renders no Back button. With no `onContinue`, neither **Continue** nor a *Next:* hint renders (step 4's card).
  - (d) **Explanation and note.** `explanation="E"` renders an element with text `E` whose `style.maxWidth` is `"70ch"`; `note="N"` renders an element with text `N` and the classes `bg-muted` and `text-xs`. Without them neither element renders.
  - (e) **Focus on step change** (`useStepHeadingFocus`). A test-local `Host({ step })` calls `useStepHeadingFocus(step)` and renders `<StepCard step={step} question={"Q" + step} />`. On first render with step 1, `document.activeElement` is `document.body`. `rerender` with step 2: the active element is the `h2` with text `Q2`. Focus a test button, then `rerender` with step 2 again: the button keeps focus. `rerender` with step 1: the `h2` with text `Q1` has focus.
  - (f) **`failureReason`.** `new ApiUnreachableError("GET /api/settings/history-depth could not be reached")` gives *FactorFlow is not answering*. `new ApiError("an active instrument with this symbol already exists", "req-9", { code: "internal_error" })` and the same with `code: null` give *FactorFlow hit an unexpected problem*. No result contains the error's `message` or `requestId`.
  - (g) **`StepReadError`.** `<StepReadError subject={READ_ERRORS.subjects.depth} error={new ApiUnreachableError("x")} onRetry={spy} />` renders the exact text *Couldn't read history depth: FactorFlow is not answering* and `getByRole("button", { name: "Try again" })`; clicking it calls `spy` once.

  Kills:
  - off-by-one on the Back title index (`STEP_TITLES[step]` instead of `[step - 1]`): (b).
  - off-by-one on the Next title index: (b).
  - negate-boolean on the `step > 1` Back guard: (c).
  - negate-boolean on the hook's `previous !== current` test: (e) first render steals focus, or a change does not move it.
  - a hand-written mutant that drops the hook's `previous.current = current` update: (e)'s return to step 1.
  - swap-case of the two reasons in `failureReason`: (f).

- [ ] T009 [P] Add rows for this story's three new strings to the completeness table of `web/src/screens/setup/copy.test.ts` (CAP-003-E4-S1's T007), each against an independent literal (DEC-0345, DEC-0346): `["READ_ERRORS.notAnswering", [], "FactorFlow is not answering"]`, `["READ_ERRORS.unexpected", [], "FactorFlow hit an unexpected problem"]` and `["STEP2.saveFailed", ["FactorFlow is not answering"], "Couldn't save history depth: FactorFlow is not answering"]`. CAP-003-E4-S1's T006 scan of every export and of the file's text then covers them unchanged. Kills: drop-field-copy on any of the three: its row.

- [ ] T010 [P] Write the step list contract in a new `web/src/screens/setup/step-list.test.tsx` (AC-25, DAC-E4-1 rendering half, DAC-E4-S2-1; setup-ui §10; UX design §1.2; DEC-0348, DEC-0349, DEC-0350). Render `<StepList state={stateWith(…)} />` with the shell mocked. Cases:
  - (a) **Structure.** `getByRole("navigation", { name: "Setup steps" })` holds one `list` of four `listitem`s whose titles are, in order, *Market data*, *How far back*, *Stocks to follow*, *Download data* (DAC-E4-11's four steps).
  - (b) **Current and done.** With `done` `{ 1: true, 2: true, 3: false, 4: false }` and `current` `3`: only the third item has `aria-current="step"`; `getByRole("link", { name: "Market data, done" })` and `getByRole("link", { name: "How far back, done" })` exist, and there are exactly 2 links. With `current` `2` (a done step made current by `goTo`), *How far back* is not a link and its item has `aria-current="step"`.
  - (c) **Activation.** Clicking *How far back, done* calls `goTo` once with `2`. Each link's `href` attribute is `"#setup-step-heading"`.
  - (d) **Keyboard.** `user.tab()` from `body` focuses *Market data, done*; a second `user.tab()` focuses *How far back, done*; `{Enter}` calls `goTo` with `2`; a third `user.tab()` leaves the list (current and to-do steps are not tab stops).
  - (e) **Summaries.** All against independent literals:
    - Step 1 with `HEALTH_FOUND`: the first item contains *Found*; with `HEALTH_MISSING`: *Missing*. With `HEALTH_UNREACHABLE_STALE_MISSING` and `done[1]` still `true`: the first item contains neither *Found* nor *Missing* (DEC-0349).
    - Step 2 with `depth` `{ kind: "ok", data: { years: 12, updatedAt: "2026-09-06T18:00:00Z" }, checkedAt }`: *12 years of history*.
    - Step 3 with `activeCount` `{ kind: "ok", data: 1236, checkedAt }`: *1,236 followed stocks*.
    - Step 4 with `latest_download` `started_at` `"2026-10-15T14:30:00Z"`, `requested_at` `"2026-10-15T14:29:00Z"`: *Download started 2026-10-15 09:30 CDT*. With `started_at: null`: *Download started 2026-10-15 09:29 CDT*. With attention `{ kind: "error", error, last: { data: <that download>, checkedAt } }`: the summary is still rendered from `last`.
    - A step whose `done` is `false` shows no summary.
  - (f) **Layout values.** The list's root element has `style.minWidth` `"260px"` and `style.maxWidth` `"300px"`, and each dot (`li [aria-hidden="true"]` first match) has `style.width` `"28px"`. These test files may hold the values; the layout rule scans non-test sources only.
  - (g) **Header slot.** `header={<h1>Get set up</h1>}` renders the heading before the `navigation` in document order.

  Kills:
  - swap-case `started_at ?? requested_at` → `requested_at ?? started_at`: (e) step 4, first row.
  - a hand-written mutant that renders `String(n)` instead of `formatCount(n)`: (e) step 3.
  - negate-boolean on the "done and not current" link condition: (b).
  - swap-case `LAYOUT.markerSize` → `LAYOUT.railIconSize`: (f).
  - swap-case `sideColumnMin` ↔ `sideColumnMax`: (f).
  - negate-boolean on the step 1 summary's `liveness === "answering"` guard: (e) step 1, third row.

- [ ] T011 [P] Write step 1's further cases in `web/src/screens/setup/step-market-data.test.tsx`, sequential with T004 (DAC-E4-3, DAC-E4-13; DEC-0349):
  - (a) No **← Back** button renders on step 1.
  - (b) **In that step only.** With `depth` `{ kind: "error", error: new ApiUnreachableError("x"), last: null }` in the state, step 1 renders no *Couldn't read* text.
  - (c) **Not answered yet.** With `HEALTH_UNKNOWN`, the badge is `coverage-unknown` *Not determinable* with the same reason, and no *Found* or *Missing* text renders.

  Kills: a hand-written mutant that treats `unknown` as missing (`health === null` → *Missing*): (c).

- [ ] T012 [P] Write step 2's further cases in `web/src/screens/setup/step-history-depth.test.tsx`, sequential with T006 (DAC-E4-4, DAC-E4-13, AC-3, AC-17; DEC-0346, DEC-0347). Render `<StepHistoryDepth state={stateWith({ current: 2, … })} />` with the shell and client mocked. Cases:
  - (a) **The field.** `getByRole("spinbutton", { name: "History depth years" })` with `toHaveAccessibleDescription("Whole years, 1 to 50.")`. The note *Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.* is present. The region is named *How far back should history go?*.
  - (b) **Initial value.** Draft `yearsText` `"12"` with a saved depth of 5: the value is `12`. Draft `""` with a saved depth of 5: `5` (S02 §5 `historyYears`). Draft `""` with `years: null`: empty. Draft `""` with a failed read: empty.
  - (c) **Drafts kept.** Typing `7` into an empty field makes the last `setDraft` call `("yearsText", "7")`.
  - (d) **Blur validation, no request** (DEC-0347). For each of `0`, `51` and `5.5`: type it, `user.tab()`; `findByRole("alert")` has text *History depth must be a whole number of years from 1 to 50.*; then click **Continue**: the alert stays, the value is kept and `setHistoryDepth` was never called. An empty field and **Continue** gives the same alert and no call.
  - (e) **Bounds accepted.** `1` and then, in a fresh render, `50` with **Continue**: `setHistoryDepth` called with `1` and with `50`.
  - (f) **Success.** `setHistoryDepth` resolves `{ years: 7, updatedAt: "…" }` for `7`: `reread` called once with `"depth"` and `goTo` once with `3`. Pressing Enter in the field instead of **Continue** does the same.
  - (g) **Other save failures** (DEC-0346). `setHistoryDepth` rejects with `new ApiError("x", "req-3", { code: "internal_error" })`: the alert reads exactly *Couldn't save history depth: FactorFlow hit an unexpected problem*. With `new ApiUnreachableError("x")`: *Couldn't save history depth: FactorFlow is not answering*. In both, the value is kept, the input has `aria-invalid="true"`, and `goTo` and `reread` were not called.
  - (h) **Failed depth read** (DAC-E4-13). `depth` `{ kind: "error", error: new ApiError("x", "req-4", { code: "internal_error" }), last: null }`: the text *Couldn't read history depth: FactorFlow hit an unexpected problem* and **Try again**, which calls `reread` once with `"depth"`. The field is still rendered. With `depth` `ok`, no *Couldn't read* text renders.
  - (i) **Back.** **← Back: Market data** calls `goTo` once with `1` and sends no request.

  Kills:
  - off-by-one on the lower bound (`>= 1` → `>= 0` or `> 1`): (d) `0` and (e) `1`.
  - off-by-one on the upper bound (`<= 50` → `< 50` or `<= 51`): (d) `51` and (e) `50`.
  - negate-boolean on the whole-number test: (d) `5.5`.
  - swap-case on the initial value's precedence (saved years over the draft): (b) first row.
  - drop-field-copy on `setDraft` in the change handler: (c).
  - negate-boolean on the `validation_error` test: (g) renders the range message.
  - drop-field-copy on `onRetry` (the **Try again** handler): (h).

**Checkpoint**: T002–T012 exist and fail for the right reason: `step-card.tsx`, `step-list.tsx`, `step-market-data.tsx` and `step-history-depth.tsx` are missing, the three copy strings are missing, and `SCANNED_DIRECTORIES` lacks the setup directory. Every delivered and upstream test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The three copy strings and the four modules, each in its own TDD cycle. Every module's comments cite AC, DAC and TC in the style of the delivered `status-region.tsx`, and none writes a length, a colour, a layout value or one of the eight DAC-E7-3 terms (write "28 px" with a space where a comment needs it).

- [ ] T013 Add three strings to `web/src/screens/setup/copy.ts` (CAP-003-E4-S1's catalogue; T009 RED first), each with a doc comment saying this story adds it and no design gives its wording, as `copy.ts`'s module comment provides:
  - `READ_ERRORS.notAnswering` *FactorFlow is not answering* and `READ_ERRORS.unexpected` *FactorFlow hit an unexpected problem* (DEC-0345);
  - `STEP2.saveFailed(reason: string)` → `Couldn't save history depth: ${reason}` (DEC-0346).

  `copy.ts` keeps importing nothing and exporting no number or boolean. Makes T009 pass.

- [ ] T014 Create `web/src/screens/setup/step-card.tsx` (depends on T013; T008 RED first), to DEC-0350.
  - **Imports.** `type ReactNode`, `useEffect`, `useRef` from `"react"`; `ApiUnreachableError` and `type ApiError` from `"../../api/client"`; `Button` from `"../../components/ui/button"`; `Card` from `"../../components/ui/card"`; `LAYOUT` from `"../../app/layout"`; `type StepId` from `"./use-setup-state"`; `STEP_TITLES`, `stepPosition`, `backLabel`, `nextHint`, `CONTINUE`, `READ_ERRORS` from `"./copy"`.
  - **`STEP_HEADING_ID`** `= "setup-step-heading"`: one step card renders at a time, so one id serves the heading, its `aria-labelledby` and the done-step links' `href`.
  - **`StepCard(props: StepCardProps): JSX.Element`** with `interface StepCardProps { step: StepId; question: string; explanation?: ReactNode; note?: ReactNode; onBack?: () => void; onContinue?: () => void; children?: ReactNode }`. Renders `<section aria-labelledby={STEP_HEADING_ID}>` around `<Card variant="default" className="flex flex-col gap-5 p-4">` holding, in order:
    - `<p className="text-xs text-muted-foreground">{stepPosition(step)}</p>`;
    - `<h2 id={STEP_HEADING_ID} tabIndex={-1} className="text-xl font-semibold text-foreground focus-visible:outline-none">{question}</h2>`. A plain `h2`, not `CardTitle`, whose `text-lg` is the card-heading size, not the step question's `--text-xl` (setup-ui §10);
    - when `explanation` is given, `<p style={{ maxWidth: LAYOUT.explanationMeasure }}>{explanation}</p>`;
    - `children`;
    - when `note` is given, `<p className="rounded bg-muted p-3 text-xs">{note}</p>`;
    - the footer `<div className="flex items-center justify-between gap-4">`: at the left, when `step > 1` and `onBack` is given, `<Button variant="ghost" onClick={onBack}>{backLabel(STEP_TITLES[step - 1])}</Button>`, otherwise an empty `<span />` so the right side stays right; at the right, when `onContinue` is given, `<div className="flex items-center gap-3">` with `<span className="text-xs text-muted-foreground">{nextHint(STEP_TITLES[step + 1])}</span>` and `<Button variant="default" onClick={onContinue}>{CONTINUE}</Button>`. A step that passes `onContinue` is below 4 (step 4 has no Continue, setup-ui §10); type the index access so `tsc` accepts it without a cast to `any`.
  - **`useStepHeadingFocus(current: StepId): void`.** A `useRef(current)` holds the previous step. A `useEffect` on `[current]` focuses `document.getElementById(STEP_HEADING_ID)` and stores `current` only when `current` differs from the stored step. The first render never moves focus, so the shell's focus on the screen's `h1` on route entry stands (owner-shell §2.7; DAC-E4-S6-2). It lives in the persistent screen, not in `StepCard`, because each step component renders its own card and a step change remounts it (Other Notes). Doc comment: CAP-003-E4-S4's `SetupScreen` calls it once.
  - **`failureReason(error: ApiError | ApiUnreachableError): string`** (DEC-0345): `READ_ERRORS.notAnswering` for an `ApiUnreachableError`, `READ_ERRORS.unexpected` for every `ApiError`. It never reads `message` or `requestId`: the delivered envelope messages name domain terms (AC-19), and UX design §0.7 never shows `request_id`.
  - **`StepReadError({ subject, error, onRetry }: { subject: string; error: ApiError | ApiUnreachableError; onRetry: () => void }): JSX.Element`.** `<div className="flex flex-wrap items-center gap-3">` with `<p className="text-destructive">{READ_ERRORS.readFailed(subject, failureReason(error))}</p>` and `<Button variant="outline" onClick={onRetry}>{READ_ERRORS.tryAgain}</Button>` (DAC-E4-13; STD-UI-19: operation, resource, reason and a recovery). CAP-003-E4-S3 renders it for the followed list.

  Makes T008 pass.

- [ ] T015 Create `web/src/screens/setup/step-list.tsx` (depends on T014 for `STEP_HEADING_ID`; T010 RED first), to DEC-0348, -5 and -6.
  - **Imports.** `type ReactNode` from `"react"`; `Stepper`, `type StepperStep` from `"../../components/ui/stepper"`; `labelOf` from `"../../components/patterns/tiers"`; `formatCount`, `formatInstant` from `"../../components/patterns/format"`; `LAYOUT` from `"../../app/layout"`; `useShell` from `"../../app/shell-context"`; `type SetupState`, `type StepId` from `"./use-setup-state"`; `SCREEN`, `STEP_TITLES`, `SUMMARIES` from `"./copy"`; `STEP_HEADING_ID` from `"./step-card"`.
  - **`StepList({ state, header }: { state: SetupState; header?: ReactNode }): JSX.Element`.** Renders `<div className="flex flex-col gap-4" style={{ minWidth: LAYOUT.sideColumnMin, maxWidth: LAYOUT.sideColumnMax }}>` with `header` first, then `<Stepper label={SCREEN.stepsLabel} markerSize={LAYOUT.markerSize} steps={steps} />`.
  - **Steps.** For each `n` of `1, 2, 3, 4`: `title` `STEP_TITLES[n]`; `state` `"current"` when `n === state.current`, else `"done"` when `state.done[n]`, else `"todo"`; for a done step that is not current, `href` `` `#${STEP_HEADING_ID}` `` and `onSelect` `() => state.goTo(n)` (DEC-0348); `summary` only when `state.done[n]`:
    - 1: `labelOf({ of: "credential", present: health.health.credential_present })` when `health.liveness === "answering"` and `health.health` is not null; none otherwise (DEC-0349);
    - 2: `SUMMARIES.years(String(years))` from `state.depth` `ok`;
    - 3: `SUMMARIES.followed(formatCount(count))` from `state.activeCount` `ok`;
    - 4: `SUMMARIES.downloadStarted(formatInstant(download.started_at ?? download.requested_at))`, where `download` is `attention.data.latest_download` when `attention.kind === "ok"` and `attention.last?.data.latest_download` when `"error"` (the same reading as CAP-003-E4-S1's step 4 flag). `startedAt ?? requestedAt` follows `formatDownloadName` (ui-components §2.5; Resolved Conflict 4).
  - The stepper's own `, done`, `, current` and `, to do` suffixes carry the state in text; `copy.doneLabel` is not added on top of them (Other Notes).

  Makes T010 pass.

- [ ] T016 Create `web/src/screens/setup/step-market-data.tsx` (depends on T014; T002–T004 and T011 RED first).
  - **Imports.** `StatusBadge` from `"../../components/patterns/status-badge"`; `tierOf`, `labelOf` from `"../../components/patterns/tiers"`; `NotDeterminable` from `"../../components/patterns/presence"`; `useShell` from `"../../app/shell-context"`; `type SetupState` from `"./use-setup-state"`; `QUESTIONS`, `STEP1` from `"./copy"`; `StepCard` from `"./step-card"`.
  - **`StepMarketData({ state }: { state: SetupState }): JSX.Element`.** Reads `const { health } = useShell()`. Renders `<StepCard step={1} question={QUESTIONS[1]} onContinue={() => state.goTo(2)}>`, with no `onBack`, holding:
    - `<p className="flex flex-wrap items-center gap-2"><span>{STEP1.keyLabel}</span>{verdict}</p>`. `verdict` is, when `health.liveness === "answering"` and `health.health` is not null, `<StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge>` with `status = { of: "credential", present: health.health.credential_present }`; otherwise `<NotDeterminable reason={STEP1.notAnswering} />` (DAC-E4-S2-2; DEC-0349). `liveness` is read first, so a stale `credential_present` retained after a failed poll is never shown.
    - When answering and `credential_present` is `false`: the variable line, split once on `STEP1.KEY_VARIABLE` so the name renders in `<code className="font-mono">`, and `<p>{STEP1.restart}</p>`.
  - Only `credential_present` is read; the component passes no part of `health.health` to the DOM (AC-4; setup-ui §4). **Continue** is never `blocked` (DEC-0203; DAC-E4-10).

  Makes T002–T004 and T011 pass.

- [ ] T017 Create `web/src/screens/setup/step-history-depth.tsx` (depends on T013, T014; T005, T006 and T012 RED first), to DEC-0346 and -3.
  - **Imports.** `useForm` from `"react-hook-form"`; `zodResolver` from `"@hookform/resolvers/zod"`; `z` from `"zod"`; `setHistoryDepth`, `ApiError`, `ApiUnreachableError` from `"../../api/client"`; `Form`, `FormRoot`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` from `"../../components/ui/form"`; `Input` from `"../../components/ui/input"`; `type SetupState` from `"./use-setup-state"`; `QUESTIONS`, `STEP2`, `READ_ERRORS` from `"./copy"`; `StepCard`, `StepReadError`, `failureReason` from `"./step-card"`.
  - **Bounds.** Module constants `MIN_YEARS = 1` and `MAX_YEARS = 50`, commented as mirrors of the delivered `MIN_HISTORY_DEPTH_YEARS` and `MAX_HISTORY_DEPTH_YEARS` (`src/factorflow/api/bounds.py:9,15`), the range the copy states (*Whole years, 1 to 50.*). The server stays the authority: its `422` is still rendered.
  - **Schema.** `z.object({ years: z.string().trim().refine((text) => /^\d+$/.test(text) && Number(text) >= MIN_YEARS && Number(text) <= MAX_YEARS, STEP2.rangeError) })`.
  - **Form.** `useForm({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { years: initialYears } })`, where `initialYears` is `state.drafts.yearsText` when it is not empty, else `String(state.depth.data.years)` when `state.depth.kind === "ok"` and `years` is not null, else `""` (AC-3; S02 §5 `historyYears`; Resolved Conflict 5). `mode: "onTouched"` is the form contract's blur-then-change rule (CAP-003-E1-S2).
  - **Save** (`save({ years })`, through `form.handleSubmit`): `await setHistoryDepth(Number(years))`.
    - On success: `state.reread("depth")`, then `state.goTo(3)` (DAC-E4-S2-1).
    - On `ApiError` with `code === "validation_error"` (the delivered `422` envelope code, `src/factorflow/api/app.py:409`): `form.setError("years", { type: "server", message: STEP2.rangeError })`.
    - On any other `ApiError` or an `ApiUnreachableError`: `form.setError("years", { type: "server", message: STEP2.saveFailed(failureReason(error)) })`.
    - Anything else is rethrown. The value is never reset (DAC-E4-4, DAC-E4-13).
  - **Render.** `<StepCard step={2} question={QUESTIONS[2]} note={STEP2.planLimitNote} onBack={() => state.goTo(1)} onContinue={() => void form.handleSubmit(save)()}>` holding:
    - when `state.depth.kind === "error"`: `<StepReadError subject={READ_ERRORS.subjects.depth} error={state.depth.error} onRetry={() => state.reread("depth")} />`;
    - `<Form {...form}><FormRoot aria-label={STEP2.fieldLabel} onSubmit={form.handleSubmit(save)}>` with one `FormField` `name="years"` rendering `FormItem` → `FormLabel` (`STEP2.fieldLabel`), `FormControl` → `<Input variant="numeric" suffix={STEP2.suffix} {...field} onChange={(event) => { field.onChange(event); state.setDraft("yearsText", event.target.value); }} />`, `FormDescription` (`STEP2.description`) and `FormMessage`.
    The plan-limit note is the card's info note, copy and not a validation (DAC-E4-4; setup-ui §3).

  Makes T005, T006 and T012 pass.

**Checkpoint**: `npm run test` is green except T007; `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Bring the setup directory under the literal scan and confirm the change set is exactly the story's.

- [ ] T018 Append `"web/src/screens/setup/"` to `SCANNED_DIRECTORIES` in `web/src/components/token-literals.test.ts` (DEC-0296's widening rule; T007 RED first). Change nothing else in the file. CAP-003-E1-S1's whole-tree case and CAP-003-E3-S2's layout rule then read every setup source, including CAP-003-E4-S1's. Makes T007 pass.
- [ ] T019 Confirm scope (depends on T013–T018):
  - `git status --short` lists only `web/src/screens/setup/step-list.tsx`, `step-list.test.tsx`, `step-card.tsx`, `step-card.test.tsx`, `step-market-data.tsx`, `step-market-data.test.tsx`, `step-history-depth.tsx`, `step-history-depth.test.tsx`, `copy.ts`, `copy.test.ts` and `web/src/components/token-literals.test.ts`, plus this story's `-tasks.md`, its `-tdd-evidence.yaml` and its status line.
  - `git diff --exit-code -- web/src/app/ web/src/api/ web/src/components/ui/ web/src/components/patterns/ web/src/screens/settings/ web/src/screens/instruments/ web/src/main.tsx package.json` exits 0.
  - `git diff -- web/src/components/token-literals.test.ts` shows one added array entry and the T007 `describe` block only; `git diff -- web/src/screens/setup/copy.ts` shows only T013's three additions.

**Checkpoint**: The change set is the story's files plus the two widenings. Delivered behaviour is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T020 Run `npm run format` (a check); fix any report with `npx biome format --write` on this story's files only. Then run `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run test`, and the Story-Specific Validation greps. No behaviour change (traces to AC-26, AC-25).
- [ ] T021 After each TDD cycle in T002–T020 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E4-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T008 + T009 + T013 + T014: the copy strings and the step card.
  - (2) T010 + T015: the step list.
  - (3) T002–T004 + T011 + T016: step 1.
  - (4) T005 + T006 + T012 + T017: step 2.
  - (5) T007 + T018: the literal scan, test-only, `mutation: {not_applicable: "test-only cycle: token-literals.test.ts gains a scanned directory and adds no production code"}`.

  T019 and T020 add no behaviour and join cycle 5's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S3 | hard | `step-list.tsx` and `step-market-data.tsx` call `useShell()` from `web/src/app/shell-context.tsx`, which CAP-003-E3-S3 creates, and the tests mock that module. Added to the graph by this plan; it was already reached through CAP-003-E4-S1 |
| CAP-003-E3-S1 | hard | The tests type their attention fixtures with `Attention` and `ReadState` from `web/src/app/shell-types.ts`, which CAP-003-E3-S1 creates. Added to the graph by this plan; it was already reached through CAP-003-E4-S1 |
| CAP-003-E4-S3 | reverse | Step 3 renders its card through `StepCard` (and adds the `blocked` **Continue** it needs), and its failed count read through `StepReadError` and `failureReason`. Graph: E4-S3 depends on E4-S2 |
| CAP-003-E4-S4 | reverse | `SetupScreen` renders `StepList` with the `h1` and sub-line as its `header`, picks `StepMarketData` or `StepHistoryDepth` for steps 1 and 2, and calls `useStepHeadingFocus(state.current)` once. Step 4 renders `StepCard` with no `onContinue`. Graph: E4-S4 depends on E4-S2 |
| CAP-003-E4-S6 | context | Registers `/setup` and focuses the screen's `h1` on entry (DAC-E4-S6-2), the reason `useStepHeadingFocus` never moves focus on the first render (Resolved Conflict 1). Nothing is imported from or by it here |
| CAP-003-E4-S5 | context | Writes the first-run journey end to end (`tests/e2e/setup-first-run.spec.ts`), which drives these steps by keyboard; the reason this story runs no `npm run test:e2e`. Nothing is imported either way |
| CAP-003-E6-S1 | context | Its plan's DEC-0373 gives the two failure reasons this plan restates in setup's own catalogue (Open Gap 1). No code is shared: a screen does not import another screen's copy |

Every other import is an existing hard edge (CAP-003-E4-S1, CAP-003-E1-S1, CAP-003-E1-S2, CAP-003-E1-S3, CAP-003-E1-S5, CAP-003-E1-S6, CAP-003-E3-S2) or delivered code (`web/src/api/client.ts`, `react`).

### Task Dependencies

- T001 first.
- T002, T003, T004 and T011 share `step-market-data.test.tsx` and run in sequence.
- T005, T006 and T012 share `step-history-depth.test.tsx` and run in sequence.
- T008, T009 and T010 are separate files and can be written in parallel with the two chains above; T007 is its own file.
- T013 depends on T009 being RED. T014 depends on T013 and T008 being RED.
- T015 depends on T014 and T010 being RED. T016 depends on T014 and on T002–T004 and T011 being RED. T017 depends on T013, T014 and on T005, T006 and T012 being RED; T005's and T006's harness also needs T015 and T016.
- T018 depends on T007 being RED and on T014–T017 existing (the scan reads them).
- T019 depends on T013–T018. T020 depends on T019.
- T021 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: the test files `step-card.test.tsx`, `step-list.test.tsx`, `step-market-data.test.tsx`, `step-history-depth.test.tsx`, `copy.test.ts` and `token-literals.test.ts`.
- Phase 3: T015 and T016 in parallel after T014.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: this story mounts no route (CAP-003-E4-S6 registers `/setup`; CAP-003-E4-S5 writes the journey).

### Story-Specific Validation

- **AC-4, DAC-E4-3, DAC-E4-S2-2, DAC-E4-S2-5:** `npx vitest run web/src/screens/setup/step-market-data.test.tsx` is green, including the sentinel checks of T002 (e) and T003 (b).
- **AC-17, DAC-E4-4, DAC-E4-13, DAC-E4-S2-1, DAC-E4-S2-4:** `npx vitest run web/src/screens/setup/step-history-depth.test.tsx` is green.
- **AC-25:** `npx vitest run web/src/screens/setup/step-card.test.tsx web/src/screens/setup/step-list.test.tsx` is green.
- **DAC-E4-S2-3 and AC-26:** `npx vitest run web/src/components/token-literals.test.ts` is green. Then plant `export const x = "12px";` in a temporary `web/src/screens/setup/planted.tsx`, confirm the same command fails naming `web/src/screens/setup/planted.tsx`, and delete the file. `grep -rnE "(208|1180|260|300|28|16)px|70ch" web/src/screens/setup --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints nothing (the test files hold these values as expected literals; the sources read `LAYOUT`).
- **AC-19:** `grep -rniwE "instrument|acquisition|acquire|run|runs|retire|retired" web/src/screens/setup/step-list.tsx web/src/screens/setup/step-card.tsx web/src/screens/setup/step-market-data.tsx web/src/screens/setup/step-history-depth.tsx` prints nothing: the sources' comments and identifiers avoid the terms too, so a reviewer's grep agrees with T006's rendered scan. Name the delivered client functions only by their names (`setHistoryDepth`), which contain none of them.
- **Mutation:** `python3 scripts/mutation-run.py run` with `--command "npx vitest run web/src/screens/setup/ && npx tsc --noEmit"` over `step-card.tsx`, `step-list.tsx`, `step-market-data.tsx` and `step-history-depth.tsx`, plus the hand-written mutants in Other Notes, leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **Focus on entry against focus on step change.**
   - **The two statements.** Story AC-25 and UX design §1.2 say the step card's `h2` takes focus "when the step changes". CAP-003-E4-S6's DAC-E4-S6-2 and owner-shell §2.7 put focus on the screen's `h1` when `/setup` is entered. The register lists this as gap G2: whether the first derivation of the current step counts as a change.
   - **Governing: CAP-003-E4-S6 DAC-E4-S6-2, read with AC-25's own words.** Entering the screen is a route change, not a step change; the first render has no previous step to change from.
   - **Outcome.** `useStepHeadingFocus` moves focus only when the step differs from the one it last saw, never on its first render (T008 (e), T005).
2. **Where a failed depth read shows.** UX design §1.2 States says "that step's summary reads *Couldn't read …* with **Try again**"; the stepper's summary is text only (CAP-003-E1-S3's `StepperStep.summary: string`) and cannot hold a control. **Governing: epic DAC-E4-13** ("in that step only") with setup-ui §10 States. The line and **Try again** render in step 2's card; step 2 is current whenever its read failed (CAP-003-E4-S1's derivation), and the list shows step 2 as to do with no summary.
3. **Step 1's stale answer.** The delivered health state keeps the previous `health` on a failed poll, so `credential_present` can be stale while `liveness` is `unreachable`. **Governing: DAC-E4-S2-2** (never *Missing* while unreachable). The step reads `liveness` before `credential_present` (T003, T016).
4. **The start time while `started_at` is null.** No artifact says what *Download started {start time}* shows for a requested, not yet started download (register G9). Settled by the established precedent (constraint 9 step 5): ui-components §2.5 names a download by `formatDownloadName(startedAt ?? requestedAt)`, so the summary uses `formatInstant(started_at ?? requested_at)`. The time in America/Chicago with its zone is the confirmed permanent name (capability §7 OQ-1, answered); setup-ui §14.2 listing it open is stale.
5. **The field's initial value.** No design text says what the depth field shows when a depth is already saved. S02 §5's view model sources `historyYears` from settings, and AC-3 keeps what the owner typed. **Governing: S02 §5 with AC-3.** The draft wins when not empty, else the saved years, else empty (T012 (b)).
6. **TC-COMP-108 against this story's files.** The TC asserts the composed screen (summary, current step, focus). `SetupScreen` is CAP-003-E4-S4's `index.tsx`. **Governing: the story's Implementation list and setup-ui §2.1 placement.** T005 composes this story's components with CAP-003-E4-S1's real `useSetupState` in a test-local harness that does what `SetupScreen` will do.
7. **The step card heading size.** CAP-003-E1-S1's `CardTitle` is an `h2` at `text-lg`; setup-ui §10 sets the step question at `--text-xl`. **Governing: setup-ui §10.** `StepCard` renders a plain `h2` at `text-xl` inside `Card`.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0345.**
   - **What is undetermined.** The `{reason}` in *Couldn't read history depth: {reason}* (DAC-E4-13; register G10). No artifact gives a wording for any failure.
   - **What the plan adopts (T008 (f), T013, T014).** `failureReason(error)` returns *FactorFlow is not answering* for an `ApiUnreachableError` and *FactorFlow hit an unexpected problem* for every `ApiError`, held in `copy.ts` as `READ_ERRORS.notAnswering` and `READ_ERRORS.unexpected`. It never reads `message` or `requestId`.
   - **Derivation.**
     - UX design §0.7: the envelope's code selects the wording and `request_id` is never shown.
     - The delivered envelope messages name domain terms (*an active instrument with this symbol already exists*), which AC-19 and DAC-E4-S2-4 forbid in visible text.
     - The two reads step 2 and step 3 make answer `200`, the `500` `internal_error` envelope, or fail at the transport, so two cases exist.
     - The same two sentences are what CAP-003-E6-S1's plan adopts for Data health (DEC-0373), so one product says one thing; setup restates them in its own catalogue because a screen does not import another screen's copy.
   - **Alternatives rejected.** Rendering `error.message`: domain terms and server English. A per-code table: no other code reaches these reads. *FactorFlow isn't answering* (step 1's contraction): kept apart so the failure reason reads the same on every screen.
   - **Scope.** Propagating: CAP-003-E4-S3 renders *Couldn't read the followed list: {reason}* through `StepReadError`.
   - **Owning design to absorb it:** setup-ui §10 States (with UX design §1.2 States) at its next revision.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0346.**
   - **What is undetermined.** DAC-E4-13 and S02 §7 make a failed save "a field error naming the step and the reason, values kept"; only the `422` has a wording.
   - **What the plan adopts (T012 (g), T013, T017).** For any save failure other than the `422`: the field error *Couldn't save history depth: {reason}*, `{reason}` from Open Gap 1.
   - **Derivation.** It mirrors the pinned read-failure shape *Couldn't read {subject}: {reason}* and the step 4 refusal shape *Couldn't start the download: …*, and names the operation, the resource and the reason (STD-UI-19); **Continue** is the recovery, with the value kept.
   - **Alternatives rejected.** Reusing the `422` sentence for every failure: it would tell the owner the value is wrong when the server failed. A toast: S02 §7 says field-level.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §10 step 2 and States at its next revision.
3. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0347.**
   - **What is undetermined.** UX design §1.2 says step 2's "validation runs on blur (`input` contract)" but gives no rule or message for a value typed in the browser, nor whether an empty, fractional or out-of-range value is sent (register G11).
   - **What the plan adopts (T012 (d), (e); T017).** On blur and on **Continue**, the text must be a whole number from 1 to 50; otherwise the field error is *History depth must be a whole number of years from 1 to 50.* and no request is sent. The bounds are module constants mirroring the delivered `bounds.py`. A server `422` still renders the same sentence.
   - **Derivation.**
     - The rule's text is pinned twice: the description *Whole years, 1 to 50.* and the `422` sentence. The delivered server bounds are 1 and 50 (`bounds.py:9,15`), so client and server refuse the same values.
     - The delivered Settings form (`web/src/screens/settings/history-depth-form.tsx`) validates on blur and sends nothing for an invalid value: the local precedent (constraint 9 step 5).
     - An empty field cannot be sent at all: `setHistoryDepth` takes a number.
   - **Alternatives rejected.** Server-only validation: no blur validation, contrary to UX design §1.2, and an empty field has no request to send. A separate client message: two sentences for one rule.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §10 step 2 at its next revision.
4. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0348.**
   - **What is undetermined.** Done steps "are links" (DAC-E4-1; setup-ui §10), and S02 §5's view model gives each step an `href`, but no artifact says what the link points at (register G3).
   - **What the plan adopts (T010 (c), T015).** An in-page link: `href` is `#setup-step-heading`, the step card's heading, and activation calls `goTo(n)` with the default prevented (CAP-003-E1-S3's `onSelect`). The step is not encoded in the URL.
   - **Derivation.** DEC-0202 as the owner amended it re-derives the current step on every visit; a step in the URL would override that derivation on reload or on a shared link. The heading is where the link takes the owner, and focus follows there through `useStepHeadingFocus`.
   - **Alternatives rejected.** `/setup?step=n`: a second source for the current step. A `button` styled as a link: DAC-E4-1 and the stepper spec say links.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §2.2 [10] and §10 at its next revision.
5. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0349.**
   - **What is undetermined.** What step 1 shows before health has ever answered (`liveness` `unknown`), and what step 1's summary in the step list shows while health is not answering (register G6).
   - **What the plan adopts (T010 (e), T011 (c), T015, T016).** Step 1 renders `NotDeterminable` with *FactorFlow isn't answering, so the key can't be checked.* whenever `liveness` is not `answering`, whether `unknown` or `unreachable`. The step list shows no summary for step 1 while health is not answering, though the step stays done once health has answered (CAP-003-E4-S1).
   - **Derivation.** STD-UI-14: a value that cannot be determined renders as *Not determinable*, never as a guess; before the first answer FactorFlow has not answered, which the sentence states. In the composed screen the case does not arise: CAP-003-E4-S1's `loading` is true while `liveness` is `unknown`, so CAP-003-E4-S4 shows the skeleton, and an unreachable shell replaces the main region (owner-shell §2.8). A stale *Found* or *Missing* in the summary would contradict the card's *Not determinable*.
   - **Alternatives rejected.** A blank key line: blank means "does not apply" (STD-UI-4). *Missing* until answered: DAC-E4-S2-2.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §10 step 1 and States at its next revision.
6. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0350.**
   - **What is undetermined.** setup-ui §2.1 places `step-list.tsx`, `step-card.tsx`, `step-market-data.tsx` and `step-history-depth.tsx` but pins none of their interfaces, nor how the card's focus rule survives a step change.
   - **What the plan adopts (T014–T017).**
     - `StepList({ state, header? })`, the left column, with `header` for the screen's `h1` and sub-line.
     - `StepCard({ step, question, explanation?, note?, onBack?, onContinue?, children? })`, rendered by each step component; `STEP_HEADING_ID`.
     - `useStepHeadingFocus(current)`, called once by the screen.
     - `StepReadError({ subject, error, onRetry })` and `failureReason(error)`.
     - Step components take `{ state: SetupState }` and read the shell themselves.
   - **Derivation.** Each step owns its **Continue** (step 1 moves on, step 2 submits its form, step 3 posts, step 4 has none), so each step renders its own card. A step change then mounts a new card, so a focus effect inside the card cannot tell a change from the first render; the persistent screen can, hence the hook (Resolved Conflict 1). Passing `SetupState` whole matches setup-ui §2.2's one state object. `header` lets the screen keep its `h1` (owner-shell §2.7) in the column the side-column bounds apply to.
   - **Alternatives rejected.** One persistent card with step bodies registering their **Continue** through a context: more machinery for the same result. The card focusing its heading on mount: it would take focus from the `h1` on entry (DAC-E4-S6-2).
   - **Scope.** Propagating: CAP-003-E4-S3 renders step 3 through `StepCard` and `StepReadError`, adding the `blocked` **Continue** it needs; CAP-003-E4-S4 composes `StepList`, the step components and the hook.
   - **Owning design to absorb it:** setup-ui §2.1 at its next revision.

### Other Notes

- **The `blocked` Continue is CAP-003-E4-S3's.** Only step 3 blocks **Continue** (zero accepted with *Paste a list*). This plan adds no `blocked` path to `StepCard`; CAP-003-E4-S3 adds it with its test, through CAP-003-E1-S1's `button` `blocked`.
- **Done state in text.** CAP-003-E1-S3's stepper appends `, done`, `, current` or `, to do` to each title, so links are named *How far back, done*. `copy.doneLabel` (CAP-003-E4-S1) would double the suffix and is not used here.
- **Save order.** `reread("depth")` runs before `goTo(3)`; the override makes step 3 current at once, and the step list's step 2 summary appears when the re-read settles. A re-read that fails after a successful save leaves step 2 to do with step 3 current; the next visit re-derives step 2.
- **No in-flight guard on Continue.** A second **Continue** while the PUT is pending sends the same idempotent PUT; no artifact asks for a guard, and none is added.
- **Literal and layout scans.** After T018 every setup source is read by CAP-003-E1-S1's literal scan and CAP-003-E3-S2's layout rule. The sources read `LAYOUT.sideColumnMin`, `sideColumnMax`, `markerSize` and `explanationMeasure` only. `contentMaxWidth` is CAP-003-E4-S4's.
- **The sentinel.** No setup code can receive the key: `GET /api/health` carries `credential_present` only. The planted `api_key` property in the fixtures makes the "never the value" assertions observe something a mutant could leak.
- **Hand-written mutants** for the mutation run:
  - `web/src/screens/setup/step-market-data.tsx`: `health.liveness === "answering" && health.health !== null` → `health.health !== null`, killed by T003 (a).
  - `web/src/screens/setup/step-market-data.tsx`: `onContinue={() => state.goTo(2)}` → `onContinue={health.health?.credential_present ? () => state.goTo(2) : undefined}`, killed by T002 (d).
  - `web/src/screens/setup/step-market-data.tsx`: `<StatusBadge …>` → `<span className="text-status-good">{labelOf(status)}</span>`, killed by T004 (a).
  - `web/src/screens/setup/step-history-depth.tsx`: `setHistoryDepth(Number(years))` → `setHistoryDepth(years as unknown as number)`, killed by T005.
  - `web/src/screens/setup/step-history-depth.tsx`: `state.goTo(3)` moved before `await setHistoryDepth(…)`, killed by T005's `422` case.
  - `web/src/screens/setup/step-history-depth.tsx`: `STEP2.saveFailed(failureReason(error))` → `STEP2.saveFailed(error.message)`, killed by T006 row 2 and T012 (g).
  - `web/src/screens/setup/step-history-depth.tsx`: `initialYears` precedence swapped (saved years before the draft), killed by T012 (b).
  - `web/src/screens/setup/step-card.tsx`: in `useStepHeadingFocus`, drop `previous.current = current`, killed by T008 (e).
  - `web/src/screens/setup/step-card.tsx`: `useStepHeadingFocus`'s effect body moved into `StepCard` as a mount effect, killed by T005 (no focus on entry) and T008 (e).
  - `web/src/screens/setup/step-list.tsx`: `formatCount(count)` → `String(count)`, killed by T010 (e).
