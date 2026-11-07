---
artifact_schema_version: 1
artifact_id: CAP-003-E4-S3-tasks
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
  timestamp: 2026-11-07T06:44:19Z
  source_artifacts:
    - id: CAP-003-E4-S3
      version: "1"
    - id: CAP-003-E4
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-system-design
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

# Tasks: CAP-003-E4-S3 — Setup Step 3: Paste a List, the Paste Summary with Near-Miss Fixes, Batches and Add Later

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/first-run-setup/stories/CAP-003-E4-S3.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/screens/setup/`; design `setup-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Builds setup step 3, *Which stocks do you want to follow?*, on CAP-003-E4-S1's drafts, step state and copy and CAP-003-E4-S2's step card. `summarise-paste.ts` wraps the delivered `parseBulkSymbols` (imported, never edited; DEC-0218, DAC-E7-13): `summarisePaste(parsed)` returns `accepted` (normalised first occurrences, in paste order), `duplicates` (each repeated symbol named once, never posted twice) and `unreadable` (every shape-invalid entry, with a `fix` when replacing each run of slash, space or underscore between letters by one dot yields a valid symbol); `replaceEntry` applies a fix in the textarea text. `post-in-batches.ts` posts the accepted symbols in order through the delivered `addInstruments` in batches of at most `MAX_SYMBOLS_PER_REQUEST` (1000, mirrored from `src/factorflow/api/bounds.py:25`): a `409` batch (every symbol already followed) is success; a transport failure or `500` stops the run of requests, counts the posted symbols and returns the rest. `step-stocks.tsx` renders the step through `StepCard`: the `radio-group` `cards` with exactly *Paste a list* and *Add later* and no file control; the `textarea` `list` parsed on paste and on blur, never per keystroke, upper-cased on blur, with the counter and every duplicate and unreadable entry named in a polite live region tied to the field; *Did you mean {fix}?* as `button` `outline`; the below-30 warning with **Continue** available; **Continue** `blocked` with *Paste at least one symbol, or choose Add later.* at zero accepted; *Add later* + **Continue** posting nothing and making step 4 current; already-followed entries reported as *{symbol}, already followed* from the `duplicate_active` dispositions after **Continue**; a failed batch keeping its and later entries in the textarea with the posted ones counted; and a failed count read as *Couldn't read the followed list: {reason}* with **Try again**. Every disposition is text: no status badge renders on step 3 (DAC-E4-S3-6). `step-card.tsx` (CAP-003-E4-S2) gains the `blocked` **Continue** its plan leaves to this story, and `copy.ts` (CAP-003-E4-S1) gains the strings no design gives. No delivered file is edited.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-5 | Valid entries accepted, each unreadable entry and each duplicate named; an accepted entry is never discarded because another was rejected | T002, T003, T004, T005, T010, T011, T012, T013, T015, T016, T017 |
| AC-6 | Fewer than 30 accepted: setup says no factor can be ranked and still lets the owner continue | T012, T017 |
| AC-17 | Following stocks goes through the delivered `POST /api/instruments` with CAP-001's dispositions unchanged | T003, T007, T011, T015, T017 |
| DAC-E4-5 | `summarisePaste` wraps `parseBulkSymbols` unchanged: `accepted`, `duplicates`, `unreadable` with fixes; already-followed reported after **Continue** from `duplicate_active` | T002, T007, T010, T012, T013, T015, T016, T017 |
| DAC-E4-6 | Batches of at most 1000 in order; a `409` batch is success; a transport failure or `500` keeps that batch's and later entries named, counts the posted ones and leaves the step current | T003, T005, T011, T012, T015, T017 |
| DAC-E4-7 | Zero accepted with *Paste a list*: **Continue** `blocked` with its reason; below 30: the warning with **Continue** available | T004, T012, T014, T016, T017 |
| DAC-E4-11 | Step 3 offers exactly two sources with no file control (and the setup shows four steps) | T009, T017 |
| DAC-E4-S3-1 | `BRK/B`, `BRK B`, `BRK_B` suggest `BRK.B`; `ZZZZ!` no fix; `KO` twice: one accepted, one duplicate named once, never posted twice | T002, T010, T012, T015 |
| DAC-E4-S3-2 | 2500 accepted post as 1000, 1000, 500 in order; the parse runs once on paste and once on blur, never per keystroke | T003, T005, T011, T012, T015, T017 |
| DAC-E4-S3-3 | *Add later* + **Continue**: nothing posted, `source` `later` in the drafts, step 4 current with step 3 still to do | T006, T017 |
| DAC-E4-S3-4 | Posted as a JSON array the delivered route validates per symbol; rejected entries announced with their reason through the textarea's polite live region | T007, T017 |
| DAC-E4-S3-5 | No DAC-E7-3 term in step 3's visible text or accessible names in any state; labels from `copy.ts` | T008, T014, T017 |
| DAC-E4-S3-6 | No status badge renders on step 3 (dispositions are text; the one-tier rule is recorded not applicable); no state by colour alone | T008, T017 |

Mapped test cases (`tests/component/setup-ui-tests.md`; `tests/coverage-matrix.md` lines 205-207, 211, 222-227 and the per-story count "6 of 6" at line 414):

- **TC-COMP-113** (DAC-E4-S3-1, DAC-E4-5, AC-5).
- **TC-COMP-114** (DAC-E4-S3-2, DAC-E4-6, AC-5).
- **TC-COMP-115** (DAC-E4-S3-3, DAC-E4-8, AC-2, AC-21).
- **TC-COMP-116** (DAC-E4-S3-4, AC-25).
- **TC-COMP-117** (DAC-E4-S3-5, AC-19).
- **TC-COMP-118** (DAC-E4-S3-6, AC-20).
- **TC-COMP-100** (DAC-E4-7, AC-5, AC-6): the epic criterion this story carries that no story-level criterion refines (coverage-matrix note 5 and the inventory at line 447).
- **TC-COMP-103** (DAC-E4-11, AC-3): the epic criterion this story lists; this plan implements both halves (two sources here, four steps through CAP-003-E4-S2's `StepList`).

The setup-ui test specification and the coverage matrix are `status: draft`, the lowest rung of the precedence ladder; where a TC step is generic, the plan sharpens it from the story's criteria.

## Phase 1: Setup

**Purpose**: Confirm the upstream modules this story imports exist. No package, configuration or directory change.

- [ ] T001 From the repo root, confirm these exist in the working tree, then run `npm ci` and `npm run test` and record the suite green before any change (traces to no AC; prerequisite):
  - CAP-003-E4-S1: `web/src/screens/setup/draft.tsx` (`SetupDraftProvider`, `useSetupDrafts`), `use-setup-state.ts` (`useSetupState`, `SetupState` with `activeCount`, `reread`, `goTo`, `drafts`, `setDraft`) and `copy.ts` (`QUESTIONS`, `STEP3`, `READ_ERRORS`).
  - CAP-003-E4-S2: `web/src/screens/setup/step-card.tsx` (`StepCard`, `StepReadError`, `failureReason`, `STEP_HEADING_ID`) and `step-list.tsx` (`StepList`); `copy.ts` with `READ_ERRORS.notAnswering` and `READ_ERRORS.unexpected`; `web/src/components/token-literals.test.ts` scanning `web/src/screens/setup/`.
  - CAP-003-E1-S1: `web/src/components/ui/button.tsx` (`variant="blocked"`).
  - CAP-003-E1-S2: `web/src/components/ui/form.tsx` (`Form`, `FormRoot`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `useFormField`), `textarea.tsx` (`Textarea`, `variant="list"`) and `radio-group.tsx` (`RadioGroup`, `RadioGroupCard`), with `react-hook-form` in `package.json`.
  - CAP-003-E1-S6: `web/src/components/patterns/format.ts` (`formatCount`).
  - CAP-003-E3-S1 / CAP-003-E3-S3: `web/src/app/shell-types.ts` (`ReadState`, `Attention`) and `web/src/app/shell-context.tsx` (`useShell`, `ShellContextValue`), which the tests type and mock.

**Checkpoint**: Every import below resolves, and the delivered suite and every upstream CAP-003 suite are green.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the paste summary, the batches, the blocked **Continue** and the step's renderings.

**Shared fixtures for `web/src/screens/setup/step-stocks.test.tsx`** (declared in the file as independent literals; no shared helper module, which would be a scanned non-test source):

- **Client mock.** `vi.mock("../../api/client", async (importActual) => ({ ...(await importActual()), addInstruments: vi.fn(), getHistoryDepth: vi.fn(), listInstruments: vi.fn() }))`, the pattern of the delivered `web/src/screens/settings/history-depth-form.test.tsx:7`. `ApiError` and `ApiUnreachableError` stay real. TC-COMP-116 restores the real `addInstruments` (`vi.mocked(addInstruments).mockImplementation((await vi.importActual(...)).addInstruments)`) and stubs `fetch` instead.
- **Parser spy.** `vi.mock("../instruments/parse-bulk-symbols", async (importActual) => { const actual = await importActual(); return { ...actual, parseBulkSymbols: vi.fn(actual.parseBulkSymbols) }; })`: the real parser, counted.
- **Shell mock** (TC-COMP-103, TC-COMP-115 only). `vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }))`; `shell()` returns a full `ShellContextValue` literal with `HEALTH_FOUND` (`liveness: "answering"`, a full `HealthResponse` literal with `credential_present: true`, both times `new Date("2026-09-06T18:30:00.000Z")`, `lastAnsweredAt` the same) and attention `{ kind: "ok", data: { …ATTENTION_BASE, latest_download: null }, checkedAt }`, as CAP-003-E4-S1's and CAP-003-E4-S2's tests do.
- **State literal.** `stateWith(overrides)` returns a full `SetupState` literal: `current: 3`, `done: { 1: true, 2: true, 3: false, 4: false }`, `step4: "ready"`, `drafts` `{ yearsText: "", source: "paste", pasted: "", unposted: [] }`, `depth` `ok` with `years: 5`, `activeCount` `{ kind: "ok", data: 0, checkedAt }`, `loading: false`, and `goTo`, `reread`, `setDraft` as `vi.fn()`. Because `StepStocks` reads its drafts from `state.drafts`, a test-local `Harness({ initial })` holds `drafts` in `useState` and passes `setDraft: vi.fn((key, value) => setDrafts((d) => ({ ...d, [key]: value })))`, so typing updates the field and every `setDraft` call stays observable.
- **Symbols.** `symbols(n, start = 0)` returns `Array.from({ length: n }, (_, i) => \`S${start + i}\`)`; every element matches the delivered shape.
- **Vocabulary helper.** `visibleAndAccessibleText(container)` joins `container.textContent` with every `aria-label` and `title` value and the text of every element an `aria-labelledby` or `aria-describedby` id refers to (CAP-003-E4-S2's helper). `FORBIDDEN = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-113 (summarisePaste suggests fixes, names duplicates once) in a new `web/src/screens/setup/summarise-paste.test.ts`, with a `// Implements TC-COMP-113` comment. Each case calls `summarisePaste(parseBulkSymbols(raw))` with the real, unmocked parser and compares with `toEqual` against an independent literal:
  - (a) **The three separators.** `"BRK/B"`, `"BRK B"` and `"BRK_B"` (`it.each`): `{ accepted: [], duplicates: [], unreadable: [{ input: <raw>, fix: "BRK.B" }] }`. The rendered wording *Did you mean BRK.B?* is T013's.
  - (b) **No fix.** `"ZZZZ!"`: `{ accepted: [], duplicates: [], unreadable: [{ input: "ZZZZ!", fix: null }] }`.
  - (c) **Twice.** `"KO\nKO"`: `{ accepted: ["KO"], duplicates: ["KO"], unreadable: [] }`, so `KO` is posted once.
  - (d) **TC edge: accepted kept whatever else is rejected.** `"AAPL, ZZZZ!, MSFT, BRK/B, AAPL"`: `{ accepted: ["AAPL", "MSFT"], duplicates: ["AAPL"], unreadable: [{ input: "ZZZZ!", fix: null }, { input: "BRK/B", fix: "BRK.B" }] }`.

  Kills:
  - swap-case on the separator class (underscore dropped from `[/ _]`): (a) `BRK_B`.
  - negate-boolean on the shape test of the fix: (b) would offer `ZZZZ!`.
  - a hand-written mutant that pushes every repeat into `accepted` (no seen-set): (c) and (d).
  - a hand-written mutant that drops the valid entries when any entry is invalid: (d).

- [ ] T003 [P] Implement TC-COMP-114, request half (2500 symbols post as 1000, 1000, 500) in a new `web/src/screens/setup/post-in-batches.test.ts`, with a `// Implements TC-COMP-114` comment. `vi.mock("../../api/client", …)` with `addInstruments: vi.fn()` resolving `{ added: batch.map(outcome("added")), reactivated: [], rejected: [] }` by default, where `outcome(disposition)` builds a `SymbolOutcome` literal.
  - (a) **The TC's split.** `postInBatches(symbols(2500))` calls `addInstruments` three times; the arguments' lengths are `[1000, 1000, 500]`; the first elements are `"S0"`, `"S1000"`, `"S2000"` and the last of the third call is `"S2499"` (in order, nothing reordered or dropped); the result `toEqual({ kind: "done", posted: 2500, rejected: [] })`.
  - (b) **Sequential.** With the second call's promise held by a `deferred()`, after a flush exactly two calls have been made; the third starts only after the second resolves.
  - (c) **TC edge: a `409` batch is success.** The second call rejects with `new ApiError("x", "req-1", { code: "all_duplicate" })`: three calls are made and the result is `{ kind: "done", posted: 2500, rejected: [] }`.
  - (d) **TC edge: a failed batch keeps its and later entries.** The second call rejects with `new ApiUnreachableError("x")`: exactly two calls are made; the result is `{ kind: "failed", posted: 1000, unposted: symbols(1500, 1000), error: <that instance>, rejected: [] }` with `error` `toBe` the instance.
  - (e) The same with `new ApiError("x", "req-2", { code: "internal_error" })` (a `500`) on the first call: one call; `{ kind: "failed", posted: 0, unposted: symbols(2500), … }`.

  Kills:
  - off-by-one on the batch size (`1000` → `1001`): (a) lengths.
  - swap-case `all_duplicate` → `all_malformed` in the success test: (c).
  - a hand-written mutant that continues after a failed batch: (d) call count.
  - a hand-written mutant that computes `unposted` from the next batch (`symbols.slice(i + MAX)`): (d) `unposted`.
  - a hand-written mutant that fires the batches with `Promise.all`: (b).

- [ ] T004 [P] Implement TC-COMP-100 (Zero accepted blocks Continue; below 30 warns and continues) in a new `web/src/screens/setup/step-stocks.test.tsx`, with a `// Implements TC-COMP-100` comment. Render `<Harness initial={{ source: "paste" }} />`.
  - (a) **Nothing usable.** Paste `"!!!, ???"` into `getByRole("textbox", { name: "Stock symbols" })`, then `user.tab()`. `getByRole("button", { name: "Continue" })` has `data-variant="blocked"`, `aria-disabled="true"`, is not `toBeDisabled()` and `toHaveAccessibleDescription("Paste at least one symbol, or choose Add later.")`. Clicking it and pressing Enter on it leave `addInstruments`, `goTo` and `reread` uncalled. No warning text renders.
  - (b) **Twelve.** Clear and paste `symbols(12).join(", ")`, then tab: the text *Factor scores need at least 30 stocks with complete data. With 12, no factor can be ranked yet.* is present (exact `getByText`), and **Continue** has `data-variant="default"` and no `aria-disabled`.
  - (c) **TC edge: 30.** `symbols(30)`: no element's text starts with *Factor scores need*; **Continue** `default`. With `symbols(29)`: the warning reads *… With 29, no factor can be ranked yet.*
  - (d) **Duplicates do not count.** `"KO, KO, " + symbols(29).join(", ")` gives 30 accepted: no warning; `symbols(28)` plus `KO, KO` gives 29: the warning.

  Kills:
  - off-by-one on the floor (`< 30` → `<= 30`): (c) at 30; (`< 30` → `< 29`): (c) at 29.
  - negate-boolean on the blocked condition: (a) and (b).
  - a hand-written mutant that counts parsed valid entries instead of `accepted`: (d).

- [ ] T005 Implement TC-COMP-114, screen half (parse on paste and blur only; the three requests from the step) in `web/src/screens/setup/step-stocks.test.tsx`, sequential with T004 (one file), with a `// Implements TC-COMP-114` comment.
  - (a) **Parse count.** With `source: "paste"` and an empty draft, record `vi.mocked(parseBulkSymbols).mock.calls.length` after mount as `base` (0 with an empty draft). Click the field and paste `"AAPL, MSFT"`: `base + 1`. `user.type(field, "{Enter}NVDA")` (five keystrokes): still `base + 1`, and `setDraft` was called with `"pasted"` once per keystroke. `user.tab()`: `base + 2`, and the counter reads *3 symbols recognised, 0 duplicates, 0 not recognised*.
  - (b) **The requests.** Paste `symbols(2500).join("\n")`, click **Continue**: `addInstruments` has 3 calls with lengths `[1000, 1000, 500]`, first elements `"S0"`, `"S1000"`, `"S2000"`. Then `reread` was called once with `"activeCount"` and `goTo` once with `4`, in that order (`invocationCallOrder`).
  - (c) **The counter formats.** The counter after (b)'s paste reads *2,500 symbols recognised, 0 duplicates, 0 not recognised* (`formatCount`).

  Kills:
  - a hand-written mutant that parses in `onChange` on every keystroke: (a).
  - a hand-written mutant that drops the parse in `onPaste` (parsing on blur only): (a) after the paste.
  - swap-case `goTo(4)` → `goTo(3)` on success: (b).
  - a hand-written mutant that renders `String(n)` instead of `formatCount(n)`: (c).

- [ ] T006 Implement TC-COMP-115 (Add later and Continue post nothing and make step 4 current) in `web/src/screens/setup/step-stocks.test.tsx`, sequential with T005, with a `// Implements TC-COMP-115` comment. Harness: a test-local `Host` inside `SetupDraftProvider` calls the real `useSetupState()` and renders `<p data-testid="current">{state.current}</p>`, `<p data-testid="done-3">{String(state.done[3])}</p>`, `<p data-testid="source">{String(state.drafts.source)}</p>` and, when `state.current === 3`, `<StepStocks state={state} />`. The shell gives `shell()`; `getHistoryDepth` resolves `{ years: 5, updatedAt: "2026-09-06T18:00:00Z" }`; `listInstruments` resolves `{ rows: [], activeCount: 0, retiredCount: 0, nextCursor: null }`. `const fetchSpy = vi.spyOn(globalThis, "fetch")`.
  - Await `current` reading `3`. Choose *Add later* (`getByRole("radio", { name: "Add later" })`) and click **Continue**.
  - `current` reads `4`; `done-3` reads `false`; `source` reads `later`; `addInstruments` has 0 calls and `fetchSpy` has 0 calls (the two reads are mocked, so any request at all would be the post).
  - **Not blocked.** Before choosing, with nothing chosen, **Continue** is `blocked` (DEC-0355); after choosing *Add later* it is `default`, whatever the textarea held.

  Kills:
  - a hand-written mutant that posts the accepted symbols before checking `source`: `addInstruments` called when a draft paste exists (seed `pasted: "AAPL"` through the provider before choosing).
  - swap-case `goTo(4)` → `goTo(3)` on the *Add later* path: `current` stays `3`.
  - a hand-written mutant that calls `reread("activeCount")` and lets the derived step move: `current` stays `3` (count is 0).

- [ ] T007 Implement TC-COMP-116 (Pasted symbols are sent as a JSON array; rejections announced politely) in `web/src/screens/setup/step-stocks.test.tsx`, sequential with T006, with a `// Implements TC-COMP-116` comment. The real `addInstruments` is used; `fetch` is stubbed with `vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ added: [{ input_symbol: "AAPL", normalised_symbol: "AAPL", disposition: "added", reason: null }], reactivated: [], rejected: [{ input_symbol: "KO", normalised_symbol: "KO", disposition: "duplicate_active", reason: "an active instrument with this symbol already exists" }] }), { status: 201, headers: { "Content-Type": "application/json" } }))`.
  - Paste `"aapl, KO, ZZZZ!"`, tab, click **Continue**.
  - **The request.** `fetch` has exactly one call; its URL is `"/api/instruments"`, `init.method` `"POST"`, `init.headers` include `"Content-Type": "application/json"`, and `JSON.parse(init.body)` `toEqual({ symbols: ["AAPL", "KO"] })`: an array of normalised strings, the unreadable entry not sent.
  - **The live region.** The field's `aria-describedby` names exactly two ids: the `FormDescription` (*Whether the provider knows each one is checked during the download.*) and an element with `role="status"` (implicit `aria-live="polite"`). That element's text contains *ZZZZ!, not a valid symbol format* and *KO, already followed*. The server's `reason` string is nowhere in `document.body.textContent`.
  - **The step stays** (DEC-0353): `goTo` was last called with `3` and `reread` with `"activeCount"`. A second **Continue** with `fetch` answering `409` `{"error": {"code": "all_duplicate", "message": "x", "request_id": "r"}}` calls `goTo(4)` and the already-followed lines are gone.

  Kills:
  - a hand-written mutant that renders `outcome.reason` (the server sentence): the `textContent` check and T008's scan.
  - remove-attribute of `role="status"` on the summary region: the role check.
  - drop-field-copy on the summary id in the field's `aria-describedby`: the two-ids check.
  - a hand-written mutant that posts `parsed` inputs instead of `accepted` (`"aapl"`, `"ZZZZ!"`): the body literal.

- [ ] T008 Implement TC-COMP-117 (Step 3 states use the display vocabulary) and TC-COMP-118 (Step 3 renders no status badge; one-tier rule recorded not applicable) in `web/src/screens/setup/step-stocks.test.tsx`, sequential with T007, with `// Implements TC-COMP-117` and `// Implements TC-COMP-118` comments.
  - (a) **Non-vacuity.** `FORBIDDEN` matches the planted `"one run"`, `"Runs"`, `"Retired"`, `"Instrument"`, `"acquire"` and `"Provider credential"`, and does not match `"already followed"`, `"listed more than once"` or `"not a valid symbol format"`.
  - (b) **Every state of this story** (`it.each`), each asserting `visibleAndAccessibleText(container)` does not match `FORBIDDEN`:
    1. nothing chosen (blocked);
    2. *Add later* chosen;
    3. *Paste a list* with an empty field (blocked);
    4. a summary with a duplicate, an unreadable entry with a fix and one without (`"KO, KO, BRK/B, ZZZZ!, AAPL"`), so the warning shows;
    5. after a `201` with a `duplicate_active` rejection (T007's response);
    6. after a failed batch, with `ApiError` `internal_error` and with `ApiUnreachableError` (the failure lines and the kept-for-retry line);
    7. `activeCount` `{ kind: "error", error: new ApiError("an active instrument with this symbol already exists", "req-9", { code: "internal_error" }), last: null }` (the read-error line and **Try again**).
  - (c) **Labels from the catalogue.** In row 2 the radio names are exactly `STEP3.paste.label` and `STEP3.later.label`; in row 4 the counter equals `STEP3.counter("3", "1", "2")` (independent literal *3 symbols recognised, 1 duplicates, 2 not recognised* asserted too).
  - (d) **TC-COMP-118, no badge.** In every row of (b): `container.querySelectorAll('[data-variant^="status-"], [data-variant^="coverage-"]')` has length 0, and no `svg[aria-hidden="true"]` sits inside the summary region (no tier shape).
  - (e) **TC-COMP-118, not by colour alone.** In rows 4 and 5, every `li` in the summary region has text ending in one of *, not a valid symbol format*, *, listed more than once* or *, already followed*, so each disposition is stated in words.
  - (f) **TC-COMP-118, the record.** The plan's Other Notes record that the one-tier rule is not applicable on step 3 and that no value on step 3 is undeterminable, so `NotDeterminable` is not used; `step-stocks.tsx`'s module comment repeats the record (checked in T018).

  Kills:
  - a hand-written mutant that renders the counter through `<Badge variant="status-good">`: (d).
  - a hand-written mutant that renders the read error's `message`: (b) row 7.
  - drop-field-copy on a disposition's reason text (the entry rendered alone, marked by colour): (e).

- [ ] T009 Implement TC-COMP-103 (Exactly four steps and two sources, no file control) in `web/src/screens/setup/step-stocks.test.tsx`, sequential with T008, with a `// Implements TC-COMP-103` comment.
  - (a) **Two sources.** `getByRole("radiogroup", { name: "How do you want to name them?" })` holds exactly two `radio`s, named *Paste a list* and *Add later* in that order, each with its description (`toHaveAccessibleDescription` *Paste symbols separated by commas or one per line.* and *Continue without stocks for now; you can follow them later from Data health.*).
  - (b) **No file control**, in the nothing-chosen, paste and later states: `container.querySelector('input[type="file"]')` is `null` and `queryByText(/csv/i)` is `null`.
  - (c) **Four steps.** With the shell mocked, `<StepList state={stateWith()} />` (CAP-003-E4-S2) renders exactly four `listitem`s in its `navigation` *Setup steps*, titled *Market data*, *How far back*, *Stocks to follow*, *Download data*; none mentions paper trading.

  Kills: a hand-written mutant that adds a third `RadioGroupCard` (*Upload a CSV*): (a) and (b).

### Additional Unit Tests

- [ ] T010 Write the summary's rule cases in `web/src/screens/setup/summarise-paste.test.ts`, sequential with T002 (one file) (DAC-E4-5; DEC-0218; DEC-0351, DEC-0352). Independent literals throughout:
  - (a) **Named once, counted once.** `"KO, KO, ko, KO"`: `accepted` `["KO"]`, `duplicates` `["KO"]` (one name for three repeats; case-insensitive through the parser's normalisation).
  - (b) **Order.** `"MSFT, AAPL, MSFT, NVDA, AAPL"`: `accepted` `["MSFT", "AAPL", "NVDA"]`, `duplicates` `["MSFT", "AAPL"]` (first-repeat order).
  - (c) **A repeated unreadable entry is not a duplicate.** `"ZZZZ!, ZZZZ!"`: `duplicates` `[]`, `unreadable` holds both entries.
  - (d) **Runs and letters only.** `"BRK / B"` → fix `"BRK.B"` (a run collapses to one dot); `"brk/b"` → fix `"BRK.B"` (the fix is built from the normalised form); `"BRK/B!"` → `null` (still invalid); `"A1/B"` → `null` (a digit before the slash); `"ABC 1"` → `null`; `"/BRK"` and `"BRK/"` → `null` (no letter on one side).
  - (e) **The rule as recorded** (Other Notes): `"AAPL MSFT"` → fix `"AAPL.MSFT"`.
  - (f) **Shape mirror.** For each of `"A"`, `"BRK.B"`, `"BF-B"`, `"1AB"`, `"ABCDEFGHIJKLMNOPQ"` (17 characters), `"ABCDEFGHIJKLMNOP"` (16), `"A_B"`, `"A B"`, `"A/B"`, `"a"`: `SYMBOL_SHAPE.test(x.toUpperCase())` equals `parseBulkSymbols(x)[0].valid`, so the mirrored constant cannot drift from the delivered parser.
  - (g) **`replaceEntry`.** `replaceEntry("AAPL,BRK/B;MSFT", "BRK/B", "BRK.B")` → `"AAPL,BRK.B;MSFT"` (separators kept); `replaceEntry(" BRK/B \nKO", "BRK/B", "BRK.B")` → `" BRK.B \nKO"` (surrounding spaces kept); `replaceEntry("BRK/BX, BRK/B", "BRK/B", "BRK.B")` → `"BRK/BX, BRK.B"` (a whole entry only); `replaceEntry("BRK/B\nBRK/B", "BRK/B", "BRK.B")` → `"BRK.B\nBRK.B"` (every occurrence). For the corpus `"A,B\n\tC;;D , E"`, the entries `replaceEntry` sees equal `parseBulkSymbols(...).map((e) => e.input)` (separator mirror).

  Kills:
  - remove `+` from the run class (`[/ _]` alone): (d) `"BRK / B"` gets no fix, because no single separator there sits between two letters.
  - swap-case of the letter lookbehind to `[A-Z0-9]`: (d) `"A1/B"`.
  - off-by-one on the shape's `{0,15}`: (f) at 16 and 17.
  - a hand-written mutant that treats any repeated normalised form as a duplicate: (c).
  - a hand-written mutant that replaces substrings with `String.replaceAll`: (g) `"BRK/BX"`.

- [ ] T011 Write the batch rules in `web/src/screens/setup/post-in-batches.test.ts`, sequential with T003 (DAC-E4-6, AC-17; DEC-0354):
  - (a) **Boundaries.** `symbols(1000)`: one call of 1000. `symbols(1001)`: two calls, `[1000, 1]`. `[]`: no call and `{ kind: "done", posted: 0, rejected: [] }` (an empty batch is never posted: the delivered route answers `409` to it).
  - (b) **Dispositions accumulate in order.** Batch 1 resolves with one `duplicate_active` rejection for `"S5"` and batch 2 with one for `"S1500"`: `rejected` is `[<S5 outcome>, <S1500 outcome>]`, each `toBe` the client's object.
  - (c) **Other refusals take the failure path.** `new ApiError("x", "req-3", { code: "all_malformed" })` and `{ code: "validation_error" }` on batch 1: `{ kind: "failed", posted: 0, … }`. `new ApiError("x", "req-4", { code: null })`: failed.
  - (d) **Anything else is rethrown.** `addInstruments` rejecting with `new TypeError("boom")`: `postInBatches` rejects with that error.
  - (e) **The bound is the server's.** `MAX_SYMBOLS_PER_REQUEST` `toBe(1000)`, and `readFileSync` of `src/factorflow/api/bounds.py` (resolved from `import.meta.url`, as `web/src/app/shell.tokens.test.tsx` resolves its source) matches `/^MAX_SYMBOLS_PER_REQUEST = 1000$/m`.

  Kills:
  - off-by-one on the loop bound (`i < n` → `i <= n`): (a) `[]` sends an empty batch.
  - negate-boolean on the `all_duplicate` test (every refusal treated as success): (c).
  - drop-field-copy on `rejected` accumulation: (b).
  - a hand-written mutant that swallows unknown errors as failures: (d).

- [ ] T012 Write step 3's own cases in `web/src/screens/setup/step-stocks.test.tsx`, sequential with T009 (AC-3, AC-5, AC-6, DAC-E4-5, DAC-E4-6, DAC-E4-13; DEC-0351 to -5):
  - (a) **The card.** `getByRole("region", { name: "Which stocks do you want to follow?" })`; the explanation is S02 §8's verbatim (`STEP3.explanation`); the info note *This is your followed list. You can add or stop following stocks any time in Data health. Stopping keeps their history; nothing is ever deleted.*; **← Back: How far back** calls `goTo(2)` and sends nothing.
  - (b) **Drafts.** Choosing *Paste a list* calls `setDraft("source", "paste")`; the field is absent while `source` is `null` or `"later"` and present for `"paste"`; with `initial={{ source: "paste", pasted: "AAPL\nKO" }}` the field's value is `"AAPL\nKO"` and the counter reads *2 symbols recognised, 0 duplicates, 0 not recognised* on mount (one parse, `base` 1).
  - (c) **Upper case on blur, never while typing.** Type `"aapl"`: the value is `"aapl"` after each keystroke; tab away: the value is `"AAPL"` and the last `setDraft` call is `("pasted", "AAPL")`.
  - (d) **A fix** (DEC-0352). Paste `"AAPL, BRK/B"` and tab: one `button` named *Did you mean BRK.B?* with `data-variant="outline"`, inside the summary's list item *BRK/B, not a valid symbol format*. Click it: the field's value is `"AAPL, BRK.B"`, the counter reads *2 symbols recognised, 0 duplicates, 0 not recognised*, the button is gone, `parseBulkSymbols` was called once more, and `document.activeElement` is the field.
  - (e) **Duplicates named once.** `"KO, KO, KO"`: exactly one `li` *KO, listed more than once*; the counter reads *1 symbols recognised, 1 duplicates, 0 not recognised*.
  - (f) **A failed batch** (DEC-0354). Paste `symbols(2500).join("\n")`; `addInstruments` resolves the first call and rejects the second with `new ApiUnreachableError("x")`. Click **Continue**:
    - `setDraft` was called with `("unposted", symbols(1500, 1000))` and `("pasted", symbols(1500, 1000).join("\n"))`; the field's value is that text;
    - `findByRole("alert")` contains *Couldn't save the followed list: FactorFlow is not answering* and *1,000 followed so far.*;
    - the summary region contains *1,500 not saved yet; kept in the list to try again.*;
    - `reread` was called with `"activeCount"` (1000 were followed) and `goTo` with `3` and never with `4`.
    - The same with the first call rejecting with `new ApiError("x", "r", { code: "internal_error" })`: *Couldn't save the followed list: FactorFlow hit an unexpected problem*, *0 followed so far.*, `unposted` all 2500, and `reread` not called.
    - **Retry.** `addInstruments` then resolves; **Continue** posts `symbols(1500, 1000)` in two calls, calls `setDraft("unposted", [])` and `goTo(4)`, and the alert is gone.
  - (g) **The kept line outlives the visit.** Rendering with `initial={{ source: "paste", pasted: "S1\nS2", unposted: ["S1", "S2"] }}` shows *2 not saved yet; kept in the list to try again.* and no alert.
  - (h) **In flight.** With the first call held by a `deferred()`, the field has `readOnly` (`toHaveAttribute("readonly")`, not `disabled`, per the textarea spec), and a second **Continue** click adds no call. After it settles, `readOnly` is gone.
  - (i) **Failed count read** (DAC-E4-13). `activeCount` `{ kind: "error", error: new ApiUnreachableError("x"), last: null }`: the text *Couldn't read the followed list: FactorFlow is not answering* and **Try again**, which calls `reread("activeCount")` once. The radio group is still rendered. With `activeCount` `ok`, no *Couldn't read* text.
  - (j) **Nothing chosen** (DEC-0355). `source: null`: **Continue** is `blocked` with *Paste at least one symbol, or choose Add later.*; clicking sends nothing and does not call `goTo`.
  - (k) **The warning only with Paste a list.** `initial={{ source: "later", pasted: symbols(12).join(",") }}`: no warning and **Continue** `default`.

  Kills:
  - a hand-written mutant that does not upper-case on blur: (c).
  - drop-field-copy on `setDraft("unposted", …)`: (f) and (g).
  - a hand-written mutant that leaves the textarea text unchanged after a failure: (f) value.
  - a hand-written mutant that calls `goTo(4)` when any batch was posted: (f) never `4`.
  - negate-boolean on the `readOnly={posting}` binding: (h).
  - drop-field-copy on `onRetry`: (i).
  - swap-case of `source === "paste"` → `source !== "later"` on the blocked condition: (j).

- [ ] T013 [P] Add rows for this story's new strings to the completeness table of `web/src/screens/setup/copy.test.ts` (CAP-003-E4-S1's T007), each against an independent literal (DEC-0351, DEC-0354): `["STEP3.duplicateEntry", ["KO"], "KO, listed more than once"]`, `["STEP3.alreadyFollowedEntry", ["KO"], "KO, already followed"]`, `["STEP3.saveFailed", ["FactorFlow is not answering"], "Couldn't save the followed list: FactorFlow is not answering"]`, `["STEP3.followedSoFar", ["1,000"], "1,000 followed so far."]` and `["STEP3.keptForRetry", ["1,500"], "1,500 not saved yet; kept in the list to try again."]`. CAP-003-E4-S1's T006 then scans them with every other export and the file's text, unchanged. Kills: drop-field-copy on any of the five: its row.

- [ ] T014 [P] Write the blocked **Continue** cases in `web/src/screens/setup/step-card.test.tsx` (CAP-003-E4-S2's T008 file), as a new `describe("blocked Continue (CAP-003-E4-S3, DAC-E4-7)")` block; change no existing case:
  - (a) `<StepCard step={3} question="Q" onContinue={spy} continueBlocked="Paste at least one symbol, or choose Add later." />`: `getByRole("button", { name: "Continue" })` has `data-variant="blocked"` and `aria-disabled="true"`, is focusable by `user.tab()`, and `toHaveAccessibleDescription("Paste at least one symbol, or choose Add later.")`; the reason is visible text in the footer; click, Enter and Space leave `spy` uncalled; the *Next: Download data* hint still renders.
  - (b) Without `continueBlocked`, the button is `default`, has no `aria-describedby` and calls `spy` once on click.

  Kills: drop-field-copy on the reason's `id` in `aria-describedby`: (a) description; swap-case `blocked` → `default` when the reason is set: (a).

**Checkpoint**: T002–T014 exist and fail for the right reason: `summarise-paste.ts`, `post-in-batches.ts` and `step-stocks.tsx` are missing, the five copy strings and `continueBlocked` are missing. Every delivered and upstream test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The two pure modules, the copy and step card additions, and the step, each in its own TDD cycle. Every module's comments cite AC, DAC and TC in the style of the delivered `status-region.tsx`, and none writes a length, a colour, a layout value or one of the eight DAC-E7-3 terms (no *run* or *runs* in a comment either; the delivered client names `addInstruments` and the module path `../instruments/` contain none of them as whole words).

- [ ] T015 Create `web/src/screens/setup/summarise-paste.ts` and `web/src/screens/setup/post-in-batches.ts` (T002, T003, T010 and T011 RED first; the two modules are independent of each other).
  - **`summarise-paste.ts`.** Imports `type ParsedSymbol` from `"../instruments/parse-bulk-symbols"` only (the parser is called by the step, so its calls stay countable; DAC-E4-S3-2). Exports:
    - `SYMBOL_SHAPE = /^[A-Z][A-Z0-9.-]{0,15}$/`, commented as the mirror of the delivered `parse-bulk-symbols.ts:17` and `src/factorflow/instruments/symbols.py:5` (not exported there; T010 (f) pins the equality), and `ENTRY_SEPARATOR = /([\n,\t;]+)/`, the mirror of `parse-bulk-symbols.ts:16` with a capture group so `split` keeps the separators.
    - `interface UnreadableEntry { input: string; fix: string | null }` and `interface PasteSummary { accepted: string[]; duplicates: string[]; unreadable: UnreadableEntry[] }`.
    - `summarisePaste(parsed: readonly ParsedSymbol[]): PasteSummary` (DEC-0218; DEC-0351). One pass in order: a valid entry whose `normalised` is unseen goes to `accepted` and is marked seen; a valid entry already seen adds its `normalised` to `duplicates` unless already named there; an invalid entry goes to `unreadable` with `fix: nearMiss(entry.normalised)`.
    - `nearMiss(normalised: string): string | null` (internal): `const fixed = normalised.replace(/(?<=[A-Z])[/ _]+(?=[A-Z])/g, ".")`; return `fixed` when it differs from `normalised` and `SYMBOL_SHAPE.test(fixed)`, else `null`.
    - `replaceEntry(raw: string, input: string, fix: string): string` (DEC-0352): `raw.split(ENTRY_SEPARATOR)`; each even-index part whose `trim()` equals `input` has that trimmed text replaced by `fix` with its leading and trailing whitespace kept; `join("")`.
  - **`post-in-batches.ts`.** Imports `addInstruments`, `ApiError`, `ApiUnreachableError` from `"../../api/client"` and `type SymbolOutcome` from `"../../api/types"`. Exports:
    - `MAX_SYMBOLS_PER_REQUEST = 1000`, commented as the mirror of `src/factorflow/api/bounds.py:25` (setup-ui §1).
    - `type BatchOutcome = { kind: "done"; posted: number; rejected: SymbolOutcome[] } | { kind: "failed"; posted: number; unposted: string[]; error: ApiError | ApiUnreachableError; rejected: SymbolOutcome[] }`.
    - `async function postInBatches(symbols: readonly string[]): Promise<BatchOutcome>`: for `i` from 0 while `i < symbols.length`, step `MAX_SYMBOLS_PER_REQUEST`, `await addInstruments(symbols.slice(i, i + MAX_SYMBOLS_PER_REQUEST))`, one batch at a time. A `201` appends `result.rejected` and adds the batch length to `posted`. An `ApiError` whose `code` is `"all_duplicate"` (the delivered `409`, `src/factorflow/api/routes/instruments.py:83`) adds the batch length to `posted` and continues (DAC-E4-6; system design §3.2 note 3). Any other `ApiError` or an `ApiUnreachableError` returns `{ kind: "failed", posted, unposted: symbols.slice(i), error, rejected }` (DEC-0354 for the `422` codes). Anything else is rethrown.

  Makes T002, T003, T010 and T011 pass.

- [ ] T016 Extend `web/src/screens/setup/copy.ts` and `web/src/screens/setup/step-card.tsx` (T013 and T014 RED first).
  - **`copy.ts`** gains five `STEP3` members, each with a doc comment saying CAP-003-E4-S3 adds it and which decision gives its wording, as the module comment provides: `duplicateEntry(entry)` → `${entry}, listed more than once` (DEC-0351); `alreadyFollowedEntry(entry)` → `${entry}, ${STEP3's alreadyFollowed}` (*already followed* is DAC-E4-5's pinned copy; the *{entry}, {reason}* shape is UX design §1.2's unreadable example); `saveFailed(reason)` → `Couldn't save the followed list: ${reason}`; `followedSoFar(n)` → `${n} followed so far.`; `keptForRetry(n)` → `${n} not saved yet; kept in the list to try again.` (DEC-0354). `copy.ts` keeps importing nothing and exporting no number or boolean.
  - **`step-card.tsx`**: `StepCardProps` gains `continueBlocked?: string`, documented as the reason a gated **Continue** is `blocked` (DAC-E4-7; CAP-003-E1-S1's `button` `blocked`, never `disabled`, DAC-E1-15). When it is set, the footer's **Continue** renders `<Button variant="blocked" aria-describedby={reasonId} onClick={onContinue}>` (the vendored button makes it inert) and, before the button, `<p id={reasonId} className="text-xs text-muted-foreground">{continueBlocked}</p>`; `reasonId` from `useId`. Without it, the footer is unchanged. Nothing else in the file changes.

  Makes T013 and T014 pass.

- [ ] T017 Create `web/src/screens/setup/step-stocks.tsx` (depends on T015, T016; T004–T009 and T012 RED first).
  - **Imports.** `useId`, `useRef`, `useState` from `"react"`; `useForm` from `"react-hook-form"`; `parseBulkSymbols` from `"../instruments/parse-bulk-symbols"`; `Button` from `"../../components/ui/button"`; `Form`, `FormRoot`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `useFormField` from `"../../components/ui/form"`; `Textarea` from `"../../components/ui/textarea"`; `RadioGroup`, `RadioGroupCard` from `"../../components/ui/radio-group"`; `formatCount` from `"../../components/patterns/format"`; `type SetupState` from `"./use-setup-state"`; `QUESTIONS`, `STEP3`, `READ_ERRORS` from `"./copy"`; `StepCard`, `StepReadError`, `failureReason` from `"./step-card"`; `summarisePaste`, `replaceEntry`, `type PasteSummary` from `"./summarise-paste"`; `postInBatches` from `"./post-in-batches"`.
  - **Module comment.** Step 3 (setup-ui §2.3, §10; UX design §1.2; S02 §6). It records DAC-E4-S3-6: every disposition is listed as text, no status badge renders, so the one-tier rule does not apply here, and no value on this step is undeterminable, so `NotDeterminable` is not used (register conflict with setup-ui §10's counter badges settled by the story; Resolved Conflict 1).
  - **`StepStocks({ state }: { state: SetupState }): JSX.Element`.** Local state: `summary: PasteSummary | null`, initialised lazily as `summarise(state.drafts.pasted)` when that text is not blank, else `null`; `report: string[]` (the already-followed lines of the last post); `failure: { reason: string; posted: number } | null`; `posting: boolean` with a `useRef` guard. `summarise(text)` is `summarisePaste(parseBulkSymbols(text))`, the only parse call site.
  - **Render.** `<StepCard step={3} question={QUESTIONS[3]} explanation={STEP3.explanation} note={STEP3.infoNote} onBack={() => state.goTo(2)} onContinue={onContinue} continueBlocked={blocked ? STEP3.zeroBlocked : undefined}>` holding, in order:
    - when `state.activeCount.kind === "error"`: `<StepReadError subject={READ_ERRORS.subjects.followed} error={state.activeCount.error} onRetry={() => state.reread("activeCount")} />` (DAC-E4-13);
    - `<p id={legendId} className="font-medium">{STEP3.sourceLegend}</p>` and `<RadioGroup aria-labelledby={legendId} value={state.drafts.source ?? ""} onValueChange={(value) => state.setDraft("source", value as "paste" | "later")}>` with exactly two `RadioGroupCard`s, `paste` and `later`, titles and descriptions from `STEP3.paste` and `STEP3.later` (DAC-E4-11: no third card, no file input);
    - when `source === "paste"`: `<Form {...form}><FormRoot aria-label={STEP3.fieldLabel} onSubmit={(event) => event.preventDefault()}><FormField control={form.control} name="pasted" render={() => <SymbolsField … />} /></FormRoot></Form>`, where `form = useForm<{ pasted: string }>({ defaultValues: { pasted: "" } })` exists only because the vendored `FormItem`, `FormLabel`, `FormControl` and `FormDescription` need a `FormField` context (CAP-003-E1-S2); the field's value is the session draft `state.drafts.pasted` (AC-3, DAC-E4-2), not the form's;
    - when `source === "paste"` and `1 <= accepted < 30`: `<p>{STEP3.belowFloor(formatCount(accepted))}</p>` (DAC-E4-7; AC-6; Resolved Conflict 2);
    - when `failure` is set: `<div role="alert">` with `STEP3.saveFailed(failure.reason)` and `STEP3.followedSoFar(formatCount(failure.posted))`.
  - **`SymbolsField`** (a component in the same file, rendered inside `FormItem` so it can call `useFormField()`): `FormLabel` (`STEP3.fieldLabel`); `FormControl` → `<Textarea variant="list" ref={textareaRef} value={state.drafts.pasted} placeholder={STEP3.placeholder} readOnly={posting} aria-describedby={\`${formDescriptionId} ${summaryId}\`} onPaste={…} onChange={…} onBlur={…} />` (the child's `aria-describedby` overrides the `Slot`'s, so it names both; CAP-003-E1-S2 Other Notes); `FormDescription` (`STEP3.fieldDescription`); then `<div id={summaryId} role="status" className="flex flex-col gap-2 text-sm text-muted-foreground">`, always rendered so the live region exists before it changes, holding:
    - when `summary` is set, `<p>{STEP3.counter(formatCount(accepted), formatCount(duplicates), formatCount(unreadable))}</p>`;
    - one `<ul>` of `<li className="flex flex-wrap items-center gap-2 border-l-2 border-status-warning pl-2">` (the `--status-warning` marker of setup-ui §10 Tokens, beside words, never instead of them): each duplicate `STEP3.duplicateEntry(symbol)`; each unreadable entry `STEP3.unreadable(input)` followed, when `fix` is set, by `<Button variant="outline" onClick={() => applyFix(input, fix)}>{STEP3.didYouMean(fix)}</Button>`; each `report` line;
    - when `state.drafts.unposted` is not empty, `<p>{STEP3.keptForRetry(formatCount(unposted.length))}</p>`.
  - **Field handlers** (setup-ui §5; textarea spec §4; UX design §1.2):
    - `onPaste` sets a `pendingParse` ref; `onChange` calls `state.setDraft("pasted", value)` and, only when `pendingParse` is set, clears it and sets `summary` from `summarise(value)` (one parse per paste, with the pasted value).
    - `onBlur`: `const next = state.drafts.pasted.toUpperCase()`; `setDraft("pasted", next)` when it differs; `summary` is `summarise(next)` when `next` is not blank, else `null` (one parse per blur; upper case on blur, never while typing).
    - `applyFix(input, fix)`: `next = replaceEntry(state.drafts.pasted, input, fix)`; `setDraft("pasted", next)`; `summary = summarise(next)`; then `textareaRef.current?.focus()` (DEC-0352).
  - **`blocked`** `= state.drafts.source === null || (state.drafts.source === "paste" && (summary?.accepted.length ?? 0) === 0)` (DAC-E4-7; DEC-0355).
  - **`onContinue`** (never reached while `blocked`, the button being inert):
    - `source === "later"`: `state.goTo(4)` and nothing else; no request, no draft write (DAC-E4-S3-3, DAC-E4-8).
    - `source === "paste"`: return if `posting`; set `posting`, clear `report` and `failure`; `const outcome = await postInBatches(summary.accepted)`. Then:
      - `done`: `setDraft("unposted", [])`; `state.reread("activeCount")`; `report` = each `outcome.rejected` entry mapped by disposition (`duplicate_active` → `STEP3.alreadyFollowedEntry(normalisedSymbol ?? inputSymbol)`, `malformed` → `STEP3.unreadable(inputSymbol)`; never `reason`, AC-19); `state.goTo(report.length > 0 ? 3 : 4)` (DEC-0353).
      - `failed`: `setDraft("unposted", outcome.unposted)`; `setDraft("pasted", outcome.unposted.join("\n"))`; `summary = summarise(that text)`; `failure = { reason: failureReason(outcome.error), posted: outcome.posted }`; `state.reread("activeCount")` only when `outcome.posted > 0`; `state.goTo(3)`, so the step stays current even when the re-read makes step 3 done (DAC-E4-6; DEC-0354).
      - clear `posting` in a `finally`.

  Makes T004–T009 and T012 pass.

**Checkpoint**: `npm run test` is green; `npx tsc --noEmit` is clean.

---

## Phase 4: Integration

**Purpose**: Confirm the change set is exactly the story's.

- [ ] T018 Confirm scope (depends on T015–T017):
  - `git status --short` lists only `web/src/screens/setup/summarise-paste.ts`, `summarise-paste.test.ts`, `post-in-batches.ts`, `post-in-batches.test.ts`, `step-stocks.tsx`, `step-stocks.test.tsx`, `copy.ts`, `copy.test.ts`, `step-card.tsx` and `step-card.test.tsx`, plus this story's `-tasks.md`, its `-tdd-evidence.yaml` and its status line.
  - `git diff --exit-code -- web/src/screens/instruments/ web/src/api/ web/src/app/ web/src/components/ package.json src/` exits 0 (the parser, the client and the server bound unchanged; DEC-0218, DAC-E7-13, AC-17).
  - `git diff -- web/src/screens/setup/copy.ts` shows only T016's five additions; `git diff -- web/src/screens/setup/step-card.tsx` shows only the `continueBlocked` prop, its `useId` and the footer branch.
  - `grep -n "DAC-E4-S3-6" web/src/screens/setup/step-stocks.tsx` finds the not-applicable record (T008 (f)).

**Checkpoint**: The change set is the story's files plus the two extensions. Delivered behaviour is unchanged.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T019 Run `npm run format` (a check); fix any report with `npx biome format --write` on this story's files only. Then run `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run test`, and the Story-Specific Validation greps. No behaviour change (traces to AC-26, AC-19).
- [ ] T020 After each TDD cycle in T002–T019 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E4-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T002 + T010 + the `summarise-paste.ts` half of T015: the paste summary.
  - (2) T003 + T011 + the `post-in-batches.ts` half of T015: the batches.
  - (3) T013 + T014 + T016: the copy strings and the blocked **Continue**.
  - (4) T004–T009 + T012 + T017: step 3.

  T018 and T019 add no behaviour and join cycle 4's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S6 | hard | `step-stocks.tsx` imports `formatCount` from `web/src/components/patterns/format.ts`, which CAP-003-E1-S6 creates. Added to the graph by this plan; it was already reached through CAP-003-E4-S2 |
| CAP-003-E3-S3 | hard | `step-stocks.test.tsx` mocks `web/src/app/shell-context.tsx` and types its fixtures with `ShellContextValue` for TC-COMP-103 and TC-COMP-115, which run the real `useSetupState` and `StepList`. Added to the graph by this plan; it was already reached through CAP-003-E4-S1 |
| CAP-003-E3-S1 | hard | The same test types its attention fixture with `Attention` and `ReadState` from `web/src/app/shell-types.ts`. Added to the graph by this plan; it was already reached through CAP-003-E4-S1 |
| CAP-003-E4-S4 | reverse | `SetupScreen` (`index.tsx`) renders `StepStocks` for step 3, and its `setup.test.tsx` drives step 3 forward again after going back (the repeated **Continue** this plan answers with a `409` success). Graph: E4-S4 depends on E4-S3 |
| CAP-003-E4-S5 | context | Its first-run journey (`tests/e2e/setup-first-run.spec.ts`) pastes a list and continues by keyboard through this step; the reason this story runs no `npm run test:e2e`. Nothing is imported either way |
| CAP-003-E4-S6 | context | Registers `/setup` and mounts `SetupDraftProvider` in the shell; the reason this story mounts no route and runs no e2e spec. Nothing is imported either way |
| CAP-003-E3-S2 | context | Its layout rule scans every non-test source under `web/src/`, so this story's sources carry none of the layout values (Other Notes). No file of it is imported here; `StepList`, which T009 renders, reads its `layout.ts` through CAP-003-E4-S2 |

Every other import is an existing hard edge (CAP-003-E4-S1, CAP-003-E4-S2, CAP-003-E1-S2, CAP-003-E1-S1) or delivered code (`web/src/api/client.ts`, `web/src/api/types.ts`, `web/src/screens/instruments/parse-bulk-symbols.ts`, `react`, `react-hook-form`).

### Task Dependencies

- T001 first.
- T002 and T010 share `summarise-paste.test.ts`; T003 and T011 share `post-in-batches.test.ts`; T004, T005, T006, T007, T008, T009 and T012 share `step-stocks.test.tsx` and run in that order. The three files, T013 (`copy.test.ts`) and T014 (`step-card.test.tsx`) can be written in parallel.
- T015 depends on T002, T003, T010 and T011 being RED.
- T016 depends on T013 and T014 being RED.
- T017 depends on T015 and T016, with T004–T009 and T012 RED first.
- T018 depends on T015–T017. T019 depends on T018.
- T020 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- Phase 2: the five test files.
- Phase 3: T015's two modules and T016 in parallel; T017 last.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: this story mounts no route (CAP-003-E4-S6 registers `/setup`; CAP-003-E4-S5 writes the journey). No Python file changes, so the Python commands are not required.

### Story-Specific Validation

- **AC-5, DAC-E4-5, DAC-E4-S3-1:** `npx vitest run web/src/screens/setup/summarise-paste.test.ts` is green, including T010 (f)'s mirror of the delivered shape.
- **DAC-E4-6, DAC-E4-S3-2, AC-17:** `npx vitest run web/src/screens/setup/post-in-batches.test.ts` is green, including T011 (e)'s read of `bounds.py`.
- **AC-6, DAC-E4-7, DAC-E4-11, DAC-E4-S3-3 to DAC-E4-S3-6:** `npx vitest run web/src/screens/setup/step-stocks.test.tsx web/src/screens/setup/step-card.test.tsx web/src/screens/setup/copy.test.ts` is green.
- **The parser is untouched (DEC-0218):** `git diff --exit-code -- web/src/screens/instruments/parse-bulk-symbols.ts` exits 0.
- **AC-26:** `npx vitest run web/src/components/token-literals.test.ts` is green with the three new sources scanned (CAP-003-E4-S2 widened the scan to `web/src/screens/setup/`). `grep -rnE "(208|1180|260|300|28|16)px|70ch" web/src/screens/setup --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints nothing.
- **AC-19:** `grep -rniwE "instrument|acquisition|acquire|run|runs|retire|retired" web/src/screens/setup/summarise-paste.ts web/src/screens/setup/post-in-batches.ts web/src/screens/setup/step-stocks.tsx` prints nothing (with `-w`, `addInstruments` and `../instruments/` do not match), so a reviewer's grep agrees with T008's rendered scan.
- **No storage:** `grep -rnE "localStorage|sessionStorage|indexedDB" web/src/screens/setup --include='*.ts' --include='*.tsx' | grep -v '\.test\.'` prints nothing.
- **Mutation:** `python3 scripts/mutation-run.py run` with `--command "npx vitest run web/src/screens/setup/ && npx tsc --noEmit"` over `summarise-paste.ts`, `post-in-batches.ts`, `step-stocks.tsx` and `step-card.tsx`, plus the hand-written mutants in Other Notes, leaves no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **Badges on step 3.**
   - **The conflict.** setup-ui §10 (step 3 row and Component mapping), UX design §1.2 and S02 §4 render the counter with `badge` `status-good` on the accepted count and one `badge` `status-warning` per duplicate or unreadable entry. Story DAC-E4-S3-6 says "no status badge renders on step 3 (dispositions are listed as text)", TC-COMP-118 expects "no badge renders", and coverage-matrix note 7 records the absence.
   - **Governing: story DAC-E4-S3-6** (story criteria outrank design prose; constraint 9 step 1).
   - **Outcome.** No `badge` of any variant renders on step 3. The setup-ui §10 token for rejected markers (`--status-warning`) survives as a border beside each entry's words (T017), never as the only signal. The template clause "each goes through `StatusBadge`…" is vacuous here, as coverage-matrix note 7 records.
2. **The warning at zero.** DAC-E4-7's two clauses overlap at zero accepted: "below 30 … the warning MUST show with **Continue** available" and "at zero … **Continue** MUST be `blocked`". Continue cannot be both. **Governing: the zero clause**, the more specific statement of the same criterion. The warning shows for 1 to 29 accepted with *Paste a list* chosen; at zero the blocked reason is the step's message (T004, T012 (k)).
3. **Server reason strings against the display vocabulary.** setup-ui §4 ("Server reasons render as text") and UX design §1.2 ("every `rejected` entry with its reason") against capability AC-19 and DAC-E4-S3-5: the delivered reasons read *an active instrument with this symbol already exists* and *the symbol does not match the required shape* (`src/factorflow/api/routes/instruments.py:37-40`). **Governing: capability AC-19**, with DAC-E4-5 naming the copy *already followed*. Each disposition maps to a `copy.ts` string; "render as text" is read as "never as markup" (T007, T008).
4. **What step 3 reads before Continue.** setup-ui §2.2 [11] lists a "parse summary" among the drafts; the pinned `SetupDrafts` (setup-ui §2.2 code block, CAP-003-E4-S1) holds `pasted` and `unposted` only. **Governing: the pinned interface**, the more specific statement. The summary is derived from `pasted` (one parse on mount when the draft is not blank), so going back keeps it (AC-3) without a fifth draft.
5. **The unreadable example.** UX design §1.2 writes *ZZZZ, not a valid symbol format*, but `ZZZZ` matches the delivered shape. **Governing: story DAC-E4-S3-1 and TC-COMP-113**, which use `ZZZZ!`; the UX example is illustrative.
6. **CSV upload.** S02 §3 draws *Upload a CSV*; setup-ui §14.1 and UX design §7 still list it as open. **Governing: capability §7 OQ-3 (answered no) and epic DAC-E4-11**: two sources, no file control (T009).
7. **setup-ui's body header `**Status:** draft` against its frontmatter `status: approved`.** The frontmatter, which the approval gate reads, governs.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0351.**
   - **What is undetermined.** DEC-0218 (status open) leaves three details: whether a repeated *unreadable* entry is a duplicate (its decision text says "an entry"; its agreeing second opinion says "a valid entry"); how three or more repeats are named and counted in *{d} duplicates*; and the wording that names a duplicate entry (register G5 (a), (b), (e)).
   - **What the plan adopts (T002, T010, T013, T015, T016).** Duplicates are among valid entries only; each repeated symbol is named once and counted once (`{d}` is `duplicates.length`); every invalid entry is listed under unreadable, repeats included. A duplicate is named *{symbol}, listed more than once*.
   - **Derivation.** "Named once and never posted twice" (DAC-E4-5) only has effect for a symbol that would be posted, which is a valid one; the second opinion recorded on DEC-0218 says so explicitly. Counting names keeps the counter and the list in agreement. The wording follows the *{entry}, {reason}* shape UX design §1.2 gives for an unreadable entry and avoids every DAC-E7-3 term.
   - **Alternatives rejected.** Counting every repeated occurrence: the counter would disagree with the list it summarises. *duplicate* as the reason: the counter already says *duplicates*; the entry line says what is wrong in plain words.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §2.3 (*Step 3 summary*) and §10 at its next revision, with DEC-0218's owner review.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0352.**
   - **What is undetermined.** setup-ui §2.3 says a fix "replaces the entry in the textarea and re-parses" but not which occurrences, what happens to the separators around it, or where focus goes when the button disappears (register G13).
   - **What the plan adopts (T010 (g), T012 (d), T015, T017).** Every whole entry equal to the unreadable entry's text is replaced by the fix, with separators and surrounding whitespace kept; the text is re-parsed; focus moves to the field.
   - **Derivation.** Replacing whole entries only cannot touch a different symbol that merely contains the text; replacing all equal entries gives one result for one button (a remaining copy would immediately become a duplicate of the fixed one anyway). Keeping separators is the textarea spec's "never silently reformat". The button is removed by the re-parse, so focus would otherwise fall to the document body; the field is where the fixed entry now is.
   - **Alternatives rejected.** Replacing the first occurrence only: a second identical button would remain for the same entry. Rebuilding the text one symbol per line: reformats what the owner pasted.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §2.3 at its next revision.
3. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0353.**
   - **What is undetermined.** UX design §1.2 says that after **Continue** "the response's … `rejected` entry with its reason are shown in the counter region" and also that "step 4 becomes current"; DAC-E4-5 requires already-followed entries to be reported after **Continue**, and TC-COMP-116 reads them from the textarea's live region. Step 3's card is unmounted once step 4 is current, so both cannot hold for the same post.
   - **What the plan adopts (T007, T017).** When every batch succeeds and the `201` responses carry no rejected entry, step 4 becomes current. When they carry any (`duplicate_active`, reported as *{symbol}, already followed*), step 3 stays current with those lines in its live region; the next **Continue** posts the same list again, which the delivered route answers with `409`, a success with nothing to report, and step 4 becomes current. A `409` batch has no dispositions and reports nothing. The pasted text is kept after a success.
   - **Derivation.** Every requirement is met: the report is shown where TC-COMP-116 reads it, the step moves on whenever there is nothing to report, and the repeated **Continue** is exactly what system design §3.2 note 3 describes ("re-posts the same symbols; … setup treats as success"). Keeping the text is AC-3 (going back keeps every value) and is what makes that re-post possible.
   - **Alternatives rejected.** Always moving to step 4: the already-followed entries would never be seen, against DAC-E4-5. Always staying on step 3 after a post: a second **Continue** on every first run, against UX design §1.2's "step 4 becomes current". A new draft to carry the report into step 4: the pinned `SetupDrafts` has four members (Resolved Conflict 4).
   - **Scope.** Contained in this plan (CAP-003-E4-S4 composes the step without reading these internals).
   - **Owning design to absorb it:** setup-ui §2.3 and UX design §1.2 *Step 3, Continue* at their next revision.
4. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0354.**
   - **What is undetermined.** DAC-E4-6 says a transport failure or `500` "keeps that batch's and later entries in the textarea, named, counts the posted ones"; no artifact gives the wording, says whether the posted entries stay in the textarea, or says what a `422` batch does. A `422` cannot carry per-symbol dispositions (the client rejects with `ApiError` only) and cannot be produced through this step, because the client and server symbol shapes are identical and the batch size is bounded (register G12).
   - **What the plan adopts (T011 (c), T012 (f), (g), T013, T015, T016, T017).**
     - The textarea is rewritten to the unposted entries, one per line, and `unposted` holds them, so a retry posts only those.
     - An alert reads *Couldn't save the followed list: {reason}* and *{n} followed so far.*; the live region reads *{n} not saved yet; kept in the list to try again.* while `unposted` is not empty (it survives leaving and returning).
     - `{reason}` is CAP-003-E4-S2's `failureReason` (DEC-0345).
     - Every `ApiError` other than `all_duplicate`, the `422` codes included, takes this path (constraint 9a: the minimal shape for an unreachable case).
   - **Derivation.** "Kept in the textarea for a retry" (UX design §1.2) is literal when the textarea holds exactly what remains; the posted ones are followed and are counted instead. The alert mirrors *Couldn't read the followed list: {reason}* (DAC-E4-13) and CAP-003-E4-S2's *Couldn't save history depth: {reason}*. Treating an unexpected `422` as a failure keeps every entry, which is all setup-ui §2.3 asks of it ("nothing discarded").
   - **Alternatives rejected.** Leaving the whole paste in the textarea: a retry re-posts entries already followed and the owner cannot see what remains. Listing each unposted symbol in the live region: up to 2000 names announced at once, when the field already holds them.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §2.3 (*Batches*) and §10 States at its next revision.
5. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0355.**
   - **What is undetermined.** `source` starts as `null` (setup-ui §2.2; CAP-003-E4-S1). DAC-E4-7 blocks **Continue** only "with *Paste a list* chosen"; no artifact says what **Continue** does when neither source is chosen.
   - **What the plan adopts (T012 (j), T006, T017).** **Continue** is `blocked` with the same reason, *Paste at least one symbol, or choose Add later.*, until a source is chosen.
   - **Derivation.** The pinned reason already names both ways forward, which are exactly the two choices; with neither chosen there is nothing to save and no rule to apply. Pre-selecting *Paste a list* would write a draft the owner did not choose.
   - **Alternatives rejected.** Treating no choice as *Add later*: setup would pass step 3 without the owner deciding. A separate message: a second sentence for the same remedy.
   - **Scope.** Contained in this plan.
   - **Owning design to absorb it:** setup-ui §10 step 3 at its next revision.

### Other Notes

- **The near-miss rule as recorded.** DEC-0218's rule replaces a run of slash, space or underscore *between letters*, so `AAPL MSFT` (two symbols separated by a space, which the delivered parser does not split on) is offered *Did you mean AAPL.MSFT?*. The epic's open question says the story "implements the record as it stands", and T010 (e) pins that behaviour so the owner's review of DEC-0218 sees it; the owner, not this plan, may narrow the rule.
- **One-tier rule not applicable (DAC-E4-S3-6).** No status badge renders on step 3, so the one-tier rule is recorded as not applicable; no value on step 3 is undeterminable (counts are measured from the paste, the followed count's failure is a read error with **Try again**), so `NotDeterminable` is not used. `step-stocks.tsx`'s module comment repeats this record (TC-COMP-118 step 2).
- **The `blocked` Continue lives in `StepCard`.** CAP-003-E4-S2's plan leaves it to this story ("adds it with its test"). `continueBlocked` is additive; steps 1, 2 and 4 pass nothing and are unchanged.
- **The form exists for its parts.** `useForm` is created only so `FormItem`, `FormLabel`, `FormControl` and `FormDescription` have their `FormField` context; the textarea's value is the session draft. No resolver: the step has no field validation, only the parse.
- **Upper case on blur.** UX design §1.2 ("symbols normalise to upper case on blur") and the textarea spec ("never silently reformat while the user is typing; normalise on blur") agree; only case changes, so the parse result is the same before and after.
- **No in-flight duplicate posts.** The `posting` guard and `readOnly` field (textarea spec §4: read-only, not disabled, while submitting) stop a second **Continue** from starting a second post while batches are in flight.
- **Order of calls after a post.** `reread("activeCount")` runs before `goTo`, as in CAP-003-E4-S2's save. `goTo` pins the current step, so the re-read making step 3 done does not move the card away while a failure or a report is on screen (CAP-003-E4-S1's `current = override ?? derived`).
- **Literal and vocabulary scans.** CAP-003-E1-S1's literal scan (widened by CAP-003-E4-S2) and CAP-003-E3-S2's layout rule read every setup source; `border-l-2` and `pl-2` are Tailwind scale classes with no unit literal. The copy scan of CAP-003-E4-S1 reads `copy.ts`'s new strings and comments.
- **Hand-written mutants** for the mutation run:
  - `web/src/screens/setup/summarise-paste.ts`: `/(?<=[A-Z])[/ _]+(?=[A-Z])/g` → `/(?<=[A-Z])[/ _](?=[A-Z])/g`, killed by T010 (d).
  - `web/src/screens/setup/summarise-paste.ts`: `/(?<=[A-Z])[/ _]+(?=[A-Z])/g` → `/(?<=[A-Z0-9])[/ _]+(?=[A-Z])/g`, killed by T010 (d).
  - `web/src/screens/setup/summarise-paste.ts`: duplicates computed over every entry instead of valid ones, killed by T010 (c).
  - `web/src/screens/setup/summarise-paste.ts`: `replaceEntry` as `raw.replaceAll(input, fix)`, killed by T010 (g).
  - `web/src/screens/setup/post-in-batches.ts`: `error.code === "all_duplicate"` → `error.code !== null`, killed by T011 (c).
  - `web/src/screens/setup/post-in-batches.ts`: `unposted: symbols.slice(i)` → `symbols.slice(i + MAX_SYMBOLS_PER_REQUEST)`, killed by T003 (d).
  - `web/src/screens/setup/post-in-batches.ts`: the sequential loop → `Promise.all` over every batch, killed by T003 (b).
  - `web/src/screens/setup/step-stocks.tsx`: the parse moved from the paste/blur handlers into `onChange`, killed by T005 (a).
  - `web/src/screens/setup/step-stocks.tsx`: `STEP3.alreadyFollowedEntry(…)` → `outcome.reason`, killed by T007 and T008 (b).
  - `web/src/screens/setup/step-stocks.tsx`: `state.goTo(report.length > 0 ? 3 : 4)` → `state.goTo(4)`, killed by T007.
  - `web/src/screens/setup/step-stocks.tsx`: `setDraft("pasted", outcome.unposted.join("\n"))` deleted, killed by T012 (f).
  - `web/src/screens/setup/step-stocks.tsx`: `accepted >= 1 && accepted < 30` → `accepted < 30`, killed by T004 (a)'s "no warning text" assertion.
  - `web/src/screens/setup/step-card.tsx`: `variant={continueBlocked ? "blocked" : "default"}` → `variant="default"`, killed by T014 (a).
