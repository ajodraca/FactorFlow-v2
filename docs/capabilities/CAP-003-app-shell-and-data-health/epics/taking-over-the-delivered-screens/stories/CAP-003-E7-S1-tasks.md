---
artifact_schema_version: 1
artifact_id: CAP-003-E7-S1-tasks
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
  timestamp: 2026-11-07T06:33:02Z
  source_artifacts:
    - id: CAP-003-E7-S1
      version: "1"
    - id: CAP-003-E7
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-owner-web-app-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E7-S1 — Settings Under the Shell: Market Data Key, Open Setup and the Relabelled Depth Form

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/taking-over-the-delivered-screens/stories/CAP-003-E7-S1.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/screens/settings/`; design module `owner-web-app`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Takes over the delivered Settings screen (`web/src/screens/settings/*`) at `/settings` and rebuilds it from `ui-components` in the product's words, changing no request, refusal or cadence (owner-web-app 2.1, 2.3, 2.5, 2.6, 4, 7; UX design 1.9; epic DAC-E7-7). Under the `h1` *Settings* the screen gains *Walk through setup again to check the market data key, history depth and followed stocks.* with **Open setup**, a link to `/setup` styled `button` `outline`. The history depth form is rebuilt on `form` + `input` `numeric` (suffix *years*) with its delivered behaviour unchanged: one `GET` on mount, validate and `PUT` on blur, the same validation and save messages, a `422` as a field error with the value kept; only its description is relabelled to *Whole years, 1 to 50. Required before the first download.* The *Provider credential* region becomes the *Market data key* `card` `summary`: *Market data key:* with `StatusBadge` *Found* (good) or *Missing* (critical), never a value; when missing, *Set the environment variable `FACTORFLOW_MASSIVE_API_KEY` to your Massive API key, then restart FactorFlow.*; while health is not answering, `NotDeterminable` (`coverage-unknown`) *Not determinable*, never *Missing*. Health is read from `useShell().health` (owner-web-app 11; system design constraint 10) instead of the delivered `status-region` hook, and both regions render their states through `StateRegion`. The three delivered tests follow the labels and components, a new screen test covers the screen-level criteria, and `web/src/components/token-literals.test.ts` widens its scan to `web/src/screens/settings/`.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | Settings states whether the key was found and, when missing, the variable to set; never its value | T003, T006, T007, T009 |
| AC-17 | Every action, confirmation and refusal CAP-001 accepted on Settings remains at `/settings` with the same outcome | T005, T006, T008, T009, T010 |
| AC-19 | Every user-visible label is the STD-UI-1 display label | T003, T005, T006, T007, T008 |
| AC-20 | Every status renders as its single tier with label and shape | T004, T007 |
| AC-24 | The eight-state table, relabelled, through `StateRegion` | T005, T006, T007, T008 |
| AC-25 | Every Settings operation completable by keyboard | T006, T008, T009 |
| AC-26 | Built from `ui-components` at `--measure-prose` inside the shell's main region | T002, T006, T007, T008, T009 |
| DAC-E7-7 | Setup sentence with **Open setup**; *Market data key* region as stated; depth form unchanged | T003, T005, T006, T007, T008, T009 |
| DAC-E7-S1-1 | Health unreachable: `coverage-unknown` *Not determinable*, no *Missing*, no key value in text or attributes | T003, T006, T007 |
| DAC-E7-S1-2 | Literal scan widened to `web/src/screens/settings/` and passing | T002, T010 |
| DAC-E7-S1-3 | No banned term in populated, empty and error states; DAC-E7-4 delta applied | T006, T007, T008, T009 |
| DAC-E7-S1-4 | *Found* / *Missing* through `StatusBadge` with label and `aria-hidden` shape; not determinable through `NotDeterminable` | T004, T007 |
| DAC-E7-S1-5 | Delivered requests, refusals and cadence unchanged; eight states through `StateRegion` over the unchanged `ScreenState` | T005, T006, T008, T009 |

## Phase 1: Setup

**Purpose**: Confirm the upstream modules this story imports exist in the working tree before any test is written.

- [ ] T001 Confirm the hard prerequisites are present (no file is created or edited by this task): `web/src/components/ui/button.tsx`, `card.tsx`, `badge.tsx` and `web/src/components/token-literals.test.ts` exporting `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn` (CAP-003-E1-S1; DEC-0296, DEC-0297); `web/src/components/ui/form.tsx` (`Form`, `FormRoot`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`) and `input.tsx` (`variant="numeric"`, `suffix`) with `react-hook-form`, `zod` and `@hookform/resolvers` in `package.json` (CAP-003-E1-S2; DEC-0299, -2); `web/src/components/patterns/tiers.ts` (`tierOf`, `labelOf`, `Status` with `{ of: "credential"; present: boolean }`) and the taken-over `status-badge.tsx` (`StatusBadge { tier, children }`) (CAP-003-E1-S5); `web/src/components/patterns/presence.tsx` (`NotDeterminable({ reason, label? })`) (CAP-003-E1-S6); `web/src/components/patterns/state-region.tsx` (`StateRegion`, `StateRenderers`, props `{ state, renderers, onRetry }`; DEC-0313) (CAP-003-E1-S9); `web/src/app/health.tsx` (`HealthState`, `Liveness`) and `web/src/app/shell-context.tsx` (`useShell`, `ShellContextValue`) (CAP-003-E3-S2 through CAP-003-E3-S3); `/settings` registered in `web/src/app/routes.tsx` (CAP-003-E3-S4); and `web/src/app/shell.tsx` mounting `ShellProvider` with `web/src/app/status-region.tsx` deleted (CAP-003-E3-S6, the edge this plan adds: Other Notes, *Why CAP-003-E3-S6 is hard*). If any is missing, stop and report the missing story rather than stubbing it (traces to no AC: prerequisite check)

**Checkpoint**: Every imported module exists; `npm run test` is green on the tree before this story's first change.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that pin the relabelled screen, its two regions' states and the unchanged depth-form behaviour.

Shared fixtures, written as independent literals in each test file that needs them (never derived from the code under test): `ANSWERING_PRESENT: HealthState = { liveness: "answering", health: { status: "ok", database: "reachable", credential_present: true, schema_version: 4, most_recent_run: null }, lastUpdated: new Date("2026-10-15T22:30:00Z"), lastAnsweredAt: new Date("2026-10-15T22:30:00Z") }`; `ANSWERING_MISSING` (the same with `credential_present: false`); `UNREACHABLE_STALE_MISSING` (`liveness: "unreachable"`, `health` the `ANSWERING_MISSING` body kept as the last value, as CAP-003-E3-S2's provider keeps it); `UNKNOWN` (`liveness: "unknown"`, every other field `null`). The exact strings `KEY_MISSING_SENTENCE = "Set the environment variable FACTORFLOW_MASSIVE_API_KEY to your Massive API key, then restart FactorFlow."`, `SETUP_SENTENCE = "Walk through setup again to check the market data key, history depth and followed stocks."`, `DEPTH_DESCRIPTION = "Whole years, 1 to 50. Required before the first download."` and `KEY_UNKNOWN_REASON = "Market data key presence is unknown while the product is not answering."` (Open Gaps 2) are literals in the tests.

Screen-level harness (`index.test.tsx` only): `vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }))` and a helper `shellWith(health: HealthState): ShellContextValue` returning `health` plus inert `attention`, `scores` (the initial values CAP-003-E3-S3's `shell-types.ts` defines), `refresh: vi.fn()` and `setTitleDetail: vi.fn()`; `vi.mock("../../api/client", …importActual…)` with `getHistoryDepth`, `setHistoryDepth` and `fetchHealth` replaced by `vi.fn()`; render `<MemoryRouter initialEntries={["/settings"]}><SettingsScreen /></MemoryRouter>`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-188 (Literal scan widened to `web/src/screens/settings/`) in `web/src/components/token-literals.test.ts`, with a `// Implements TC-COMP-188` comment: append `"web/src/screens/settings/"` to the exported `SCANNED_DIRECTORIES` (CAP-003-E1-S1's interface, DEC-0296: repo-root-relative, trailing slash; do not edit S1's existing entries, helpers or cases), and add a `describe("settings screen is scanned and clean (TC-COMP-188, DAC-E7-S1-2)")` block asserting against the independent literal list `web/src/screens/settings/index.tsx`, `credential-status.tsx`, `history-depth-form.tsx`: each file exists, `isScannedSource(path)` is true, `SCANNED_DIRECTORIES.some((d) => path.startsWith(d))` is true and `literalsIn(path, readFileSync(path, "utf8"))` equals `[]`; `isScannedSource("web/src/screens/settings/credential-status.test.tsx")` is false; and the planted source `export const x = "12px";` passed as `literalsIn("web/src/screens/settings/planted.tsx", …)` returns exactly one offender containing `web/src/screens/settings/planted.tsx` (TC step 3) (traces to AC-26, DAC-E7-S1-2) — kills: remove-attribute on the appended `SCANNED_DIRECTORIES` entry (the `startsWith` assertion fails), and an inline `style={{ gap: "8px" }}` mutant in `index.tsx` (the clean-file assertion names it)
- [ ] T003 [P] Implement TC-COMP-185 (key-region half) and TC-COMP-187 (key region while unreachable: Not determinable, no value) by rewriting `web/src/screens/settings/credential-status.test.tsx`, with `// Implements TC-COMP-185` and `// Implements TC-COMP-187` comments, rendering `<CredentialStatus liveness=… credentialPresent=… />` (the delivered prop names are kept). Cases: (a) `liveness="answering"`, `credentialPresent={true}`: `getByRole("region", { name: "Market data key" })` exists; inside it `getByText("Market data key:")` and the badge `getByText("Found").closest("[data-variant]")` has `data-variant="status-good"`; `queryByText("Missing")` and `queryByText(KEY_MISSING_SENTENCE)` are null; (b) `credentialPresent={false}`: `getByText("Missing").closest("[data-variant]")` has `data-variant="status-critical"` and the region's text contains `KEY_MISSING_SENTENCE` exactly (whitespace-normalised `textContent` of its paragraph, because the variable sits in a `code` element); (c) `liveness="unreachable"`, `credentialPresent={null}`: `getByText("Not determinable").closest("[data-variant]")` has `data-variant="coverage-unknown"` and `toHaveAccessibleDescription(KEY_UNKNOWN_REASON)`; `queryByText("Missing")`, `queryByText("Found")` and every `[data-variant^="status-"]` element are absent; (d) `liveness="unknown"`, `credentialPresent={null}` renders the same as (c) (delivered `badgeFor` precedent); (e) `liveness="unreachable"`, `credentialPresent={false}` (a stale last answer) still renders (c), never *Missing*; (f) no value anywhere: the region contains no `textbox`, no `input` of any type and no element whose text or any attribute value matches `/\*{2,}|•{2,}|last.?four/i`; the text *Provider credential* appears nowhere (traces to AC-4, AC-19, DAC-E7-7, DAC-E7-S1-1) — kills: swap-case `status-good` ↔ `status-critical` on the presence status (cases a, b); negate-boolean on the `liveness === "answering"` guard (case e shows *Missing*); swap-case `unavailable` → `populated` in the key-state mapping (case c)
- [ ] T004 [P] Implement TC-COMP-190 (Key-presence badge carries shape) by rewriting `web/src/screens/settings/credential-badge.test.tsx`, with a `// Implements TC-COMP-190` comment, replacing the delivered *Good*/*Critical*/*Unknown* label cases (Resolved Conflicts 3). For *Found* (`answering`, `true`) and *Missing* (`answering`, `false`): the badge element (`getByText(label).closest("[data-variant]")`) contains exactly one `svg` with `aria-hidden="true"`, and its text content is exactly the label (so the label is text, not only an icon title); *Found*'s `svg` holds a `circle` with `fill="currentColor"` and no `rect`; *Missing*'s `svg` holds a `rect` and no `circle` (good filled circle vs critical square, ui-components 2.3; a same-shape-recoloured mutant fails); each badge's `className` contains `bg-status-<tier>-muted` (a real style rule, IR-007 kept). For not determinable (`unreachable`, `null`): the element with `data-variant="coverage-unknown"` carries `bg-pattern-indeterminate` and holds no `svg` (`NotDeterminable` is not a tier, CAP-003-E1-S6 Other Notes) (traces to AC-20, DAC-E7-S1-4) — kills: swap-case on the tier passed to `StatusBadge` (shape assertions), remove-attribute of the `StatusBadge` icon (svg count), swap-case `NotDeterminable` → `StatusBadge` for the unknown case (svg absent)
- [ ] T005 [P] Implement TC-COMP-191 (depth-form half: behaviour preserved, states through `StateRegion`) by editing `web/src/screens/settings/history-depth-form.test.tsx`, with a `// Implements TC-COMP-191` comment, keeping every delivered case and its observable outcome and relabelling only what DAC-E7-4 and the component swap change. Delivered cases kept: TC-COMP-132's non-positive (`0`) and non-integer (`2.5`) blur errors (`findByRole("alert")` text matching `/setting history depth/i`, `/history depth/i`, `/must be a positive whole number/i`; `setHistoryDepth` not called); the AC-2 round trip, with the description now `getByText(DEPTH_DESCRIPTION)` before and absent after, `setHistoryDepth` called with the number `5` and the field showing `5`; blur-only validation; the failed read, now `await findByRole("status")` with text exactly `Reading history depth failed: the request could not be completed` (Resolved Conflicts 2), `DEPTH_DESCRIPTION` absent. New cases: (a) the field is `getByRole("spinbutton", { name: "History depth years" })` exactly (suffix in the name, DEC-0299); (b) loading: while `getHistoryDepth` is a pending promise, no `spinbutton` exists and an element with `aria-busy="true"` does; (c) error retry: after the failed read, `getByRole("button", { name: "Try again" })`; clicking it calls `getHistoryDepth` a second time and, resolved with `{ years: 3, updatedAt: "2026-10-01T00:00:00Z" }`, the field shows `3`; (d) `422`: `setHistoryDepth` rejects with `new ApiError("years must be between 1 and 50", "req-1", { code: "validation_error" })` after typing `60` and tabbing; the `alert` reads `Setting history depth failed: years must be between 1 and 50` and the field keeps `60` (value kept, UX 1.9); (e) focus is not pulled back: after typing `0` and `user.tab()`, `document.activeElement` is not the field; (f) Enter does not save: typing `5` then `{Enter}` leaves `setHistoryDepth` uncalled (the delivered field had no form to submit; Resolved Conflicts 1); (g) cadence: with `vi.useFakeTimers({ shouldAdvanceTime: true })`, after the first read and `vi.advanceTimersByTimeAsync(60_000)`, `getHistoryDepth` has been called exactly once (no poll, UX 1.9 States *stale not applicable*) (traces to AC-17, AC-19, AC-24, DAC-E7-7, DAC-E7-S1-5) — kills: remove-attribute of the field's blur-save handler (round trip fails), swap-case `empty-never-populated` → `populated` for `years === null` (description absent), negate-boolean on the empty-value early return (an empty blur would `PUT`; covered by the blur-only case asserting no call after clearing), remove-attribute of the submit `preventDefault` guard routing Enter to save (case f)
- [ ] T006 [P] Implement TC-COMP-183 (Settings slice), TC-COMP-184 (Settings slice), TC-COMP-185 (screen half), TC-COMP-189 and TC-COMP-191 (screen half) in a new `web/src/screens/settings/index.test.tsx`, with `// Implements TC-COMP-183`, `// Implements TC-COMP-184`, `// Implements TC-COMP-185`, `// Implements TC-COMP-189` and `// Implements TC-COMP-191` comments, using the screen-level harness. Cases: (1) layout and order (TC-COMP-185 step 1): the one `h1` is *Settings*; the next text is `SETUP_SENTENCE`; `getByRole("link", { name: "Open setup" })` has `href="/setup"` and `data-variant="outline"`; document order is `h1`, setup line, the history depth field, the *Market data key* region (`compareDocumentPosition`); the root element carries `max-w-prose` (`--measure-prose`, AC-26); (2) links (TC-COMP-183 slice): the set of every `a[href]` in the screen equals `["/setup"]`, so none targets `/coverage`, `/instruments` or `/runs`; (3) labels (TC-COMP-184 slice): *Market data key* present, *Provider credential* absent, *History depth* kept; (4) vocabulary scan (TC-COMP-189, DAC-E7-S1-3) in each of the states populated (`getHistoryDepth` → `{ years: 5 }`, `ANSWERING_PRESENT`), empty (`{ years: null }`, `ANSWERING_MISSING`), read error (rejects `new Error("the request could not be completed")`, `UNREACHABLE_STALE_MISSING`), and field error (populated, then `0` typed and blurred): with `TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`, `container.textContent` does not match `TERMS`, and for every element in `container.querySelectorAll("*")`, `expect(el).not.toHaveAccessibleName(TERMS)` (jest-dom, no new package); the dialog state is not applicable (Open Gaps 1); (5) health source (TC-COMP-191 step 1): `useShell` is called and the key region follows `shellWith(…)` (Found / Missing / Not determinable for the three fixtures), and `fetchHealth` is never called by the screen; (6) eight states (TC-COMP-191 step 2): loading (`aria-busy` present, no spinbutton), never populated (`DEPTH_DESCRIPTION`), populated (field value), error (status text and **Try again**), unavailable (key region `coverage-unknown` with `UNREACHABLE_STALE_MISSING`); nothing found, partial and unreachable render nothing of their own (`StateRegion` `notApplicable` entries; type-checked by `npx tsc --noEmit`); (7) no key value (DAC-E7-S1-1): with `shellWith({ ...ANSWERING_PRESENT, health: { ...ANSWERING_PRESENT.health, credential: "sk-SENTINEL-1234" } as HealthResponse })`, `container.innerHTML` does not contain `SENTINEL`; (8) keyboard (AC-25): from `document.body`, the first `user.tab()` focuses **Open setup**, the next focuses the depth field; typing `7` and `user.tab()` calls `setHistoryDepth(7)` with no pointer event (traces to AC-4, AC-17, AC-19, AC-24, AC-25, AC-26, DAC-E7-7, DAC-E7-S1-1, DAC-E7-S1-3, DAC-E7-S1-5) — kills: swap-case `to="/setup"` → another path (case 2), remove-attribute of `asChild` (the link becomes a `button`, case 1 `getByRole("link")` fails), the hand-written mutant reverting `useShell().health` to `useHealth()` (case 5, `fetchHealth` called), swap-case of the region order (case 1)

### Additional Unit Tests

None beyond T003–T006: the key-state mapping and the depth-form save are private and are pinned through rendering, as the delivered tests pinned `badgeFor` and `handleBlur`.

**Checkpoint**: T003–T006 fail for the right reason (old labels, no `StateRegion`, no **Open setup**, `useShell` not read); T002's clean-file assertion may already pass on the delivered settings sources, which hold no literal, and is recorded as such in the TDD evidence.

---

## Phase 3: Core Implementation

**Purpose**: Rebuild the three settings modules on `ui-components` until Phase 2 passes.

- [ ] T007 Rewrite `web/src/screens/settings/credential-status.tsx` (makes T003, T004 pass). Keep `export function CredentialStatus({ liveness, credentialPresent }: { liveness: Liveness; credentialPresent: boolean | null })`, with `Liveness` now `import type` from `../../app/health` (the `status-region` import is gone). Keep `const CREDENTIAL_ENV_VAR = "FACTORFLOW_MASSIVE_API_KEY"`. A private `keyState(liveness, credentialPresent): ScreenState<boolean>` returns `{ kind: "populated", data: credentialPresent, fetchedAt }` only when `liveness === "answering" && credentialPresent !== null`, else `{ kind: "unavailable", reason: KEY_UNKNOWN_REASON }` (the delivered `badgeFor` rule: anything but an answer with a value is not determinable; UX 1.9 States *unavailable*). Render `<Card variant="summary" role="region" aria-labelledby={titleId}>` with `<CardHeader><CardTitle id={titleId}>Market data key</CardTitle></CardHeader>` and `<CardContent>` holding `<StateRegion state={keyState(…)} renderers={…} onRetry={noop} />`, whose renderers are: `populated` → `<CardSummaryList><dt>Market data key:</dt><dd><StatusBadge tier={tierOf(status)}>{labelOf(status)}</StatusBadge></dd></CardSummaryList>` with `status = { of: "credential", present: s.data }`, followed when `!s.data` by `<p>Set the environment variable <code>{CREDENTIAL_ENV_VAR}</code> to your Massive API key, then restart FactorFlow.</p>`; `unavailable` → the same `dt` with `<dd><NotDeterminable reason={s.reason} /></dd>`; `loading`, `empty-never-populated`, `empty-no-match`, `partial` and `error` → `{ notApplicable: "…" }` naming why (the region is derived from the shell's health read, which is never loading here because `unknown` maps to unavailable, has no empty or partial form, and never errors per screen); `unreachable` → `{ notApplicable: "The shell replaces the main region (AC-23)" }`. `noop` carries a comment that **Try again** never renders because `error` is not applicable. Delete the hand-built `CredentialIcon`, `BADGE_CLASS_NAME`, `badgeFor`, `data-testid` hooks and the *Provider credential* copy. Rewrite the doc comment: owner-web-app 2.3 and 4, UX design 1.9, AC-4, DAC-E7-S1-1, DAC-E7-S1-4; no unit literal or hex in it (T002 scans comments)
- [ ] T008 Rebuild `web/src/screens/settings/history-depth-form.tsx` on `form` + `input` `numeric` (makes T005 pass). `HistoryDepthForm()` holds `const [state, setState] = useState<ScreenState<HistoryDepth>>({ kind: "loading" })` and a `reloadToken`; an effect (deps `[reloadToken]`, `cancelled` guard as `instruments/index.tsx` does) calls `getHistoryDepth()` once per token and sets `empty-never-populated` when `years === null`, else `populated` with `fetchedAt: new Date().toISOString()`, and calls `form.reset({ years: depth.years === null ? "" : String(depth.years) })`; a rejection sets `{ kind: "error", message: cause instanceof Error ? cause.message : "the request could not be completed", requestId: cause instanceof ApiError ? cause.requestId : "unknown" }` (the delivered message fallback; `instruments/index.tsx` precedent). `const form = useForm<{ years: string }>({ resolver: zodResolver(DEPTH_SCHEMA), mode: "onBlur", reValidateMode: "onBlur", defaultValues: { years: "" } })` lives in `HistoryDepthForm`, outside `StateRegion`, so the field's value and error survive the never-populated → populated switch. `DEPTH_SCHEMA = z.object({ years: z.string().refine((v) => v.trim() === "" || (Number.isInteger(Number(v)) && Number(v) > 0), "Setting history depth failed: history depth must be a positive whole number.") })` (the delivered rule and message, unchanged). `commit()`: `if (!(await form.trigger("years"))) return;` (`trigger` validates without moving focus); read `years`; return when it is blank (delivered: an empty blur neither errors nor saves); `await setHistoryDepth(Number(years))`; on success `form.reset({ years: String(depth.years ?? "") })` and set `populated` (or `empty-never-populated` if the answer is `null`); on failure `form.setError("years", { type: "server", message: \`Setting history depth failed: ${reason}\` })` with the value left as typed. Render `<StateRegion state={state} renderers={…} onRetry={() => setReloadToken((t) => t + 1)} />` with: `loading` → the label *History depth* and an `aria-hidden` field-shaped skeleton (`h-7 w-full rounded bg-muted`), no input (UX 1.9 *skeleton on the depth field*; this replaces the delivered native `disabled`); `empty-never-populated` and `populated` → `<DepthFields form={form} onCommit={commit} describe={kind === "empty-never-populated"} />`; `error` → `<p>Reading history depth failed: {s.message}</p>` (delivered wording); `empty-no-match`, `partial`, `unavailable` → `{ notApplicable: … }` (a single record; UX 1.9 States); `unreachable` → `{ notApplicable: "The shell replaces the main region (AC-23)" }`. `DepthFields` renders `<Form {...form}><FormRoot variant="stacked" aria-label="History depth" onSubmit={(event) => event.preventDefault()}><FormField control={form.control} name="years" render={({ field }) => (<FormItem><FormLabel>History depth</FormLabel><FormControl><Input variant="numeric" suffix="years" min={1} {...field} onBlur={() => { field.onBlur(); void onCommit(); }} /></FormControl>{describe ? <FormDescription>Whole years, 1 to 50. Required before the first download.</FormDescription> : null}<FormMessage /></FormItem>)} /></FormRoot></Form>`; no **Save** button (Resolved Conflicts 1). The submit handler only prevents the browser's navigation, so Enter saves nothing, as before. Doc comment: owner-web-app 2.3 *the history depth form is unchanged*, UX design 1.9, DAC-E7-7, DAC-E7-S1-5, Resolved Conflicts 1 and 2 of this plan; no unit literal. Depends on T001
- [ ] T009 Rewrite `web/src/screens/settings/index.tsx` (makes T006 pass). `SettingsScreen()` reads `const { health } = useShell()` from `../../app/shell-context` (the `status-region` import is removed) and renders, inside `<div className="flex max-w-prose flex-col gap-5">` (delivered layout: `--measure-prose`, `--space-5`): `<h1 className="text-xl">Settings</h1>`; a `<div className="flex flex-col gap-3">` holding `<p>Walk through setup again to check the market data key, history depth and followed stocks.</p>` and `<Button variant="outline" asChild><Link to="/setup">Open setup</Link></Button>` (`Link` from `react-router-dom`; `/setup` is registered by CAP-003-E4-S6, and until then the link reaches the not-found state, which DAC-E7-S1 accepts by asserting the path); `<HistoryDepthForm />`; `<CredentialStatus liveness={health.liveness} credentialPresent={health.liveness === "answering" ? (health.health?.credential_present ?? null) : null} />`. Doc comment: owner-web-app 2.3, UX design 1.9, AC-4, AC-17, AC-26, DAC-E7-7; it no longer cites `useHealth`. Depends on T007, T008

**Checkpoint**: T003–T006 pass; `npx tsc --noEmit` is clean, including every `StateRegion` renderer map (each of the eight kinds has a renderer or a `notApplicable` reason).

---

## Phase 4: Integration

**Purpose**: Prove the screen works where it is mounted and that nothing else regressed.

- [ ] T010 From the repo root run `npx vitest run web/src/components/token-literals.test.ts web/src/screens/settings web/src/app` and confirm: T002 passes with the three rewritten sources scanned; CAP-003-E3-S4's `routes.test.tsx` (`/settings` stub binding) and CAP-003-E3-S6's rewritten `shell*.test.tsx` pass with the real Settings module mounted under `ShellProvider`; `grep -rn "status-region" web/src/screens/settings` prints nothing; `git diff --stat` touches only `web/src/screens/settings/*` and `web/src/components/token-literals.test.ts`, and `web/src/api/types.ts` and `web/src/api/client.ts` are unchanged (DAC-E7-13; constraint 2) (traces to AC-17, AC-26, DAC-E7-S1-2)

**Checkpoint**: Settings renders inside the shell at `/settings`, reading health from the shell context, with no delivered test outside this story's files changed.

---

## Phase 5: Polish

**Purpose**: Validation, mutation strength and TDD evidence.

- [ ] T011 Run the tech stack v7 validation commands from the repo root (`npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run build`) and fix only this story's files until all pass; then run `python3 scripts/mutation-run.py run` (from the harness root) with `--command "npx vitest run web/src/screens/settings web/src/components/token-literals.test.ts"` over `web/src/screens/settings/index.tsx`, `credential-status.tsx` and `history-depth-form.tsx`, plus the hand-written mutants in Other Notes, and leave no surviving non-equivalent mutant (record any equivalent one with its reason) (traces to AC-17, AC-26)
- [ ] T012 After each TDD cycle in T002–T011 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E7-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry with `commit_hash: stage`.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S6 | hard | **New edge.** `useShell()` throws `useShell() must be called inside <ShellProvider>` (CAP-003-E3-S3 plan T006 (f), DEC-0326), and `ShellProvider` is mounted only by CAP-003-E3-S6's `shell.tsx` rewrite (CAP-003-E3-S3 Summary: "Nothing is mounted"); after CAP-003-E3-S4 the routes still render inside the delivered `shell.tsx` (CAP-003-E3-S4 Open Gap 1), whose `shell.unreachable.test.tsx` renders the real `/settings` screen. Without E3-S6, T009's `useShell()` breaks `/settings` (AC-17) and the delivered suite. E3-S6 also deletes `status-region.tsx`, the module Settings imports today |
| CAP-003-E3-S3 | hard | `useShell`, `ShellContextValue` from `web/src/app/shell-context.tsx` (T006, T009); existing edge |
| CAP-003-E3-S4 | hard | `/settings` route in the new map (T010); existing edge |
| CAP-003-E1-S1 | hard | `button` (`outline`, `asChild`), `card` (`summary`, `CardSummaryList`), `badge`, `token-literals.test.ts` (T002, T007, T009); existing edge |
| CAP-003-E1-S2 | hard | `form` family and `input` `numeric` with `suffix` (T008); existing edge |
| CAP-003-E1-S5 | hard | `StatusBadge`, `tierOf`, `labelOf` (T007); existing edge |
| CAP-003-E1-S6 | hard | `NotDeterminable` (T007); existing edge |
| CAP-003-E1-S9 | hard | `StateRegion` (T007, T008); existing edge |
| CAP-003-E3-S2 | context | `HealthState` and `Liveness` types from `web/src/app/health.tsx`, reached through CAP-003-E3-S3 (which depends on it); type imports only |
| CAP-003-E4-S6 | context | Registers `/setup`, the target of **Open setup**; this story asserts the link's path only (story Description), so no implementation prerequisite |
| CAP-003-E7-S6 | reverse | Its five-screen vocabulary sweep renders this story's Settings; graph edge E7-S6 → E7-S1 present |
| CAP-003-E7-S7 | reverse | `tests/e2e/support/acquisition.ts` `stateHistoryDepth` locates the field by the name *History depth, in years*, which T008 changes to *History depth years*; E7-S7 owns that file and must follow (owner-web-app 2.6); graph edge E7-S7 → E7-S1 present |

### Task Dependencies
- T001: first; everything else waits on it
- T002, T003, T004, T005, T006: depend on T001; different files, run in parallel
- T007: depends on T003, T004 (RED first)
- T008: depends on T005 (RED first)
- T009: depends on T006, T007, T008
- T010: depends on T002, T009
- T011: depends on T010
- T012: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T002–T006 in parallel (five files)
- Phase 3: T007 and T008 in parallel; T009 after both

---

## Validation Plan

### Constitution-Defined Commands
Tech stack v7, run from the repo root:
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not this story's command (the e2e specs and their support file are CAP-003-E7-S7's); see Other Notes for the locator it must follow.

### Story-Specific Validation
- AC-4, DAC-E7-S1-1: T003 cases (c)–(f) and T006 case (7) pass; `grep -rn "credential_present" web/src/screens/settings/*.tsx | grep -v test` shows the boolean read only in `index.tsx`.
- DAC-E7-7: T006 case (1) passes; T005's delivered cases pass with only the relabels listed in T005.
- DAC-E7-S1-2: T002 passes; temporarily add `export const x = "12px";` to a new `web/src/screens/settings/planted.tsx`, confirm `npx vitest run web/src/components/token-literals.test.ts` fails naming that file, then delete it.
- DAC-E7-S1-3: T006 case (4) passes in all four states.
- DAC-E7-S1-4: T004 passes.
- DAC-E7-S1-5, AC-24: T005 (g) shows one `GET` and no poll; T006 case (5) shows no `fetchHealth` call from the screen; `npx tsc --noEmit` accepts both renderer maps.
- AC-25: T006 case (8) passes.
- Plan self-consistency: no check above forbids what a task requires. The words *Settings*, *setup* and *download* in the sources match no banned term; the source comments cite design sections and decision ids, which contain no unit literal.

---

## Notes

### Resolved Conflicts

1. **A **Save** button on the depth form.** UX design 1.9 (*History depth … **Save** (`button` `default`)*) and owner-web-app 10's component mapping row (*History depth form; Save*) list a **Save** button, carried from CAP-001 UX design v5 §1.3. The delivered form has none: it validates and saves on blur (`history-depth-form.tsx`), and CAP-001 accepted it that way. Epic DAC-E7-7 says the depth form "MUST be unchanged", TC-COMP-185 compares it "with the delivered one", and story DAC-E7-S1-5 requires the delivered tests to keep their outcome. **Governing: epic DAC-E7-7 and story DAC-E7-S1-5** (epic and story criteria outrank design prose; UX 1.9 itself calls the form "unchanged"). No **Save** is added, and Enter in the field still saves nothing (T005 (f), T008). For UX design 1.9 and owner-web-app 10 at their next revision.
2. **The read failure's role.** The delivered test finds the failed read by `role="alert"`; `StateRegion` renders the caller's error sentence in a polite `role="status"` region with **Try again** outside it (CAP-003-E1-S9 plan T004 case 2). **Governing: story AC-24 and DAC-E7-S1-5** (the eight states through `StateRegion`) and owner-web-app 2.6 (the delivered tests follow the components). The relabelled test asserts `role="status"` and the retry; the wording *Reading history depth failed: {reason}* is kept. Field-level validation and save errors stay `role="alert"` through `FormMessage`, as delivered.
3. **Delivered labels and comments.** The delivered badge reads *Good*, *Critical*, *Unknown* and the region *Provider credential supplied* / *missing*; the description reads *Required before the first acquisition run.*; the doc comments cite CAP-001 sections. **Governing: DAC-E7-4, DAC-E7-7, UX design 1.9 and ui-components 2.3** (*Found* good, *Missing* critical; `NotDeterminable` for not determinable). Comments carry no authority and are rewritten with the strings (T007–T009).
4. **Where the Open setup assertion lives.** Owner-web-app 7 puts *Open setup links to `/setup`* in `credential-status.test.tsx`, but `CredentialStatus` renders only the key region. The assertion is about the screen, so it sits in the new `index.test.tsx` (T006 case 1), and the key-region assertions stay in `credential-status.test.tsx` (T003). No artifact changes; the story's Implementation line ("their tests") covers the new test file for `index.tsx`.

### Open Gaps

1. **The *dialog* state for Settings.** DAC-E7-S1-3 and TC-COMP-189 scan Settings "in its populated, empty, error and dialog states", but Settings has no dialog in the delivered screen or in UX design 1.9. No artifact says what the dialog state means here. The plan scans populated, empty, read error and field error (T006 case 4) and records the dialog state as not applicable. No value is adopted, so no owner decision is pending. For owner-web-app 7 (and the epic's DAC-E7-3 wording) at their next revision. (Resolution register gap G17.)
2. **The reason beside *Not determinable*.** UX design 0.7 requires `NotDeterminable` to carry its reason, and CAP-003-E1-S6's `NotDeterminable` takes a required `reason`, but UX design 1.9 gives no wording for the key region. Resolved by established local precedent (constraint 9 step 5): the delivered sentence *Provider credential presence is unknown while the product is not answering.* with the STD-UI-1 display label substituted, *Market data key presence is unknown while the product is not answering.* (T007). It is used for both `unknown` and `unreachable` liveness, as the delivered `badgeFor` treated them alike. For UX design 1.9 at its next revision.

### Other Notes

- **Why CAP-003-E3-S6 is hard (edge added).** The story's Dependencies name CAP-003-E3-S3 for `useShell().health`, but providing the context is CAP-003-E3-S6's work, and `useShell()` throws outside it. The graph line now reads `CAP-003-E7-S1: [CAP-003-E3-S4, CAP-003-E3-S3, CAP-003-E1-S1, CAP-003-E1-S2, CAP-003-E1-S5, CAP-003-E1-S6, CAP-003-E1-S9, CAP-003-E3-S6]`. No cycle: CAP-003-E3-S6's own dependencies reach no E7 story, and CAP-003-E7-S6 and CAP-003-E7-S7, which depend on this story, already sit after E3-S6 or are unaffected.
- **Not determinable while unreachable is unreachable in the product.** While health is unreachable, the shell replaces the main region (AC-23; CAP-003-E3-S6), so a viewer never sees Settings' key region in that state. DAC-E7-S1-1 still ships, as constraint 9a requires: T007 implements it and T003 proves it at the component.
- **Accessible name of the depth field.** CAP-003-E1-S2's `Input` `suffix` joins the label and suffix through `aria-labelledby` (DEC-0299), so the name changes from the delivered *History depth, in years* to *History depth years*. Unit tests here use the new name; `tests/e2e/support/acquisition.ts:122` uses the old one exactly and is CAP-003-E7-S7's to follow (owner-web-app 2.6: "locators by the old labels become the new labels").
- **`disabled` removed.** The delivered field was natively `disabled` while its first read was in flight. The loading state now renders a skeleton and no field (UX 1.9 States), so no `disabled` control remains and the `blocked`-not-`disabled` rule (owner-web-app 3) is not engaged.
- **`react-hook-form` settings.** `mode` and `reValidateMode` are `onBlur` so validation still runs only on blur, as delivered (not the form spec's blur-then-change default). `form.trigger` validates without focusing the field, so tabbing away from an invalid value does not pull focus back (T005 (e)).
- **No request changes.** The screen issues `GET /api/settings/history-depth` once per mount and once per **Try again**, `PUT` on a valid, non-empty blur, and no health request of its own; endpoints, `types.ts` and `client.ts` are untouched (DAC-E7-13; system design constraint 2).
- **Hand-written mutants** for T011's mutation run:
  - `web/src/screens/settings/index.tsx`: `const { health } = useShell();` → `const health = useHealth();` with `import { useHealth } from "../../app/health"` (killed by T006 case 5: `fetchHealth` is called by the fallback poll)
  - `web/src/screens/settings/credential-status.tsx`: `liveness === "answering" && credentialPresent !== null` → `credentialPresent !== null` (killed by T003 case e)
  - `web/src/screens/settings/history-depth-form.tsx`: `onBlur={() => { field.onBlur(); void onCommit(); }}` → `onBlur={field.onBlur}` (killed by T005 round trip)
  - `web/src/screens/settings/history-depth-form.tsx`: `onSubmit={(event) => event.preventDefault()}` → `onSubmit={(event) => { event.preventDefault(); void onCommit(); }}` (killed by T005 case f)
  - `web/src/screens/settings/history-depth-form.tsx`: `describe={kind === "empty-never-populated"}` → `describe={true}` (killed by T005 round trip: the description must clear)
  - `web/src/screens/settings/index.tsx`: `<Link to="/setup">` → `<Link to="/settings">` (killed by T006 case 2)
