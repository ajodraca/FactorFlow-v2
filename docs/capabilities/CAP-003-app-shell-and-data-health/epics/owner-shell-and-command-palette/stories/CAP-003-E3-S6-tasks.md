---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S6-tasks
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
  timestamp: 2026-11-07T06:48:46Z
  source_artifacts:
    - id: CAP-003-E3-S6
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: CAP-003-owner-shell-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E3-S6 — The Shell Frame: Rail with Count Chips, Top Bar with the Palette Opener, Unreachable State and the Retired Status Region

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S6.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`; design `owner-shell`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Rewrites `web/src/app/shell.tsx` as owner-shell §2.2 and §2.7 compose it: `HealthProvider` (CAP-003-E3-S2) outside `ShellProvider` (CAP-003-E3-S3), then the frame. The frame has three parts:

- **The rail.** It is `LAYOUT.railWidth` wide from `md` up and stacks above the content below 768 px. It holds the *FactorFlow* brand mark, the `primary` group, a flexible gap and the `data` group, all rendered from CAP-003-E3-S4's `DESTINATIONS` inside a `nav` labelled *Main*. Each item is a `NavLink` with a 16 px `lucide-react` icon (`LAYOUT.railIconSize`), and `aria-current="page"` comes from the router. An entry with a `count` renders a count chip, and one polite live region announces chip changes.
- **The sticky top bar.** It is a `banner` holding CAP-003-E3-S4's `useTitle()` crumbs and the *Search* `button` `outline` opener, named *Open the command palette*, with *⌘K* or *Ctrl+K*. Nothing sits between them.
- **The main region.** It renders the unreachable state while health is `unreachable`, else `AppRoutes`.

The frame also mounts CAP-003-E1-S3's `Toaster`, CAP-003-E3-S5's `CommandPalette` and one `keydown` listener on `document`. Focus moves to the routed screen's `h1` when the path changes.

New modules:

- `count-chip.tsx`: the chip value, name, stale name and announcement (DAC-E3-7).
- `unreachable-state.tsx`: the designed card with *Last answered* (DAC-E3-8).
- `copy.ts`: the shell's own strings (DAC-E3-S6-6).

The delivered status region and its four tests, plus `shell.status-region.test.tsx`, are deleted (DEC-0204, DEC-0211; DAC-E3-15). The remaining delivered importers of `status-region.tsx` are repointed to `health.tsx` and `unreachable-state.tsx` (Open Gap 1). The four delivered shell tests and the two startup specs are rewritten as owner-shell §2.10 lists, scoped to what exists at this story (DAC-E3-S6-3). `token-literals.test.ts` scans `web/src/app/` (DAC-E3-S6-5). `shell.tokens.test.tsx`, `build-output.test.tsx`, `routes.tsx`, `main.tsx` and `client.ts` are unchanged. `SetupDraftProvider` is not mounted here (DEC-0227; CAP-003-E4-S6 mounts it). At this story `DESTINATIONS` holds Research and Settings only, so the rail renders no chip until CAP-003-E5-S5 and CAP-003-E6-S7 add the counted destinations. The chip is therefore tested directly and through the rail with a test destination list.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-1 | Every screen renders inside one shell; the rail groups primary destinations apart from Data health and Settings, in order; an unshipped destination is absent, not disabled | T005, T007, T009, T014, T018 |
| AC-16 | The two counts are absent when zero | T002, T003, T008, T012 |
| AC-22 | The palette opens from the keyboard and from the top bar on every screen | T006, T014 |
| AC-23 | When the product stops answering, the main region alone becomes the unreachable state; when it answers again the screen returns without a reload | T004, T013, T014, T019 |
| AC-25 | Every operation is completable by keyboard | T002, T003, T006, T008, T009, T014 |
| AC-26 | Built from `ui-components`, theme tokens only, layout dimensions from `layout.ts` | T009, T010, T012, T013, T014 |
| DAC-E3-7 | Chip values, names, stale name and polite announcement | T002, T003, T008, T011, T012 |
| DAC-E3-8 | Unreachable `card` with a `section role="status"`, three texts, announced once on entry and once on recovery; the routed screen remounts at the same URL and refetches | T004, T011, T013, T014 |
| DAC-E3-10 | One `keydown` listener for `⌘K`/`Ctrl+K` ignoring text fields; the opener shows the platform shortcut and is named *Open the command palette* | T006, T014 |
| DAC-E3-15 | Status-region files deleted; delivered shell tests and startup specs rewritten; `shell.tokens.test.tsx` and `build-output.test.tsx` unchanged | T004, T005, T007, T008, T009, T015, T016, T018, T019, T020 |
| DAC-E3-17 | The top bar leaves the environment region and kill-switch place empty | T009, T014 |
| DAC-E3-S6-1 | The rail lists Research (only when registered) and Settings, in two groups, no disabled item; `shell.test.tsx` enumerates `DESTINATIONS` | T005, T014 |
| DAC-E3-S6-2 | `⌘K` in an `input`, `textarea`, `select` or `contenteditable` does not open; on `document` it opens and `Esc` returns focus to the opener | T006, T014 |
| DAC-E3-S6-3 | The two startup specs assert the frame, the `/` redirect by URL and the unreachable text with *Last answered*, nothing about later screens | T007, T018, T019 |
| DAC-E3-S6-4 | Below 768 px the rail stacks above the content and every item stays reachable | T009, T014 |
| DAC-E3-S6-5 | `token-literals.test.ts` scans `web/src/app/` and passes | T010 |
| DAC-E3-S6-6 | No DAC-E7-3 term in the rail, chips, top bar, unreachable state or toast container; labels from `labelOf` or `copy.ts` | T003, T005, T011 |
| DAC-E3-S6-7 | Chip badges go through `StatusBadge` with label text and an `aria-hidden` shape; no undeterminable value; never colour alone | T002, T004, T012, T013 |

Mapped test cases (`tests/component/owner-shell-tests.md`; `tests/coverage-matrix.md` lines 152, 153, 155, 160, 162, 187-193 and the per-story count "7 of 7" at line 408):

- **TC-COMP-087, TC-COMP-088, TC-COMP-089, TC-COMP-090, TC-COMP-091, TC-COMP-092 and TC-COMP-093** cover the seven story-level criteria.
- **TC-COMP-060** (DAC-E3-7), **TC-COMP-061** (DAC-E3-8) and **TC-COMP-063** (DAC-E3-17) cover the three epic criteria that no story-level criterion refines (coverage-matrix note at line 447).
- **TC-COMP-088** also covers DAC-E3-10, and **TC-COMP-089** also covers DAC-E3-15.

Other test cases on this story's capability ACs belong to other stories and are not implemented here:

- TC-COMP-057 belongs to CAP-003-E3-S4.
- TC-COMP-071 belongs to CAP-003-E3-S2.
- TC-COMP-081 to TC-COMP-086 belong to CAP-003-E3-S5.
- TC-COMP-147 and TC-COMP-182 belong to CAP-003-E6.
- TC-INT-001, TC-INT-041 to TC-INT-046 and TC-E2E-007 to TC-E2E-010 belong to CAP-003-E3-S8 and Phase 6b.

## Phase 1: Setup

**Purpose**: Confirm the inputs. No package, configuration or directory is added: CAP-003-E1 installs `lucide-react`, `sonner`, `cmdk` and the Radix packages (DEC-0205, DEC-0215), and this story adds no dependency of its own (owner-shell §4).

- [ ] T001 Confirm the hard prerequisites are in the working tree before Phase 2. No file is created or edited by this task; record the `grep -n` outputs in the first TDD cycle's evidence.
  - CAP-003-E1-S1: `web/src/components/ui/button.tsx` (`Button`, `outline`, `ghost`, `asChild`), `card.tsx` (`Card`, `variant`, `data-variant`) and `badge.tsx` (`data-variant`). Also `web/src/components/token-literals.test.ts` exporting `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn` (DEC-0296).
  - CAP-003-E1-S3: `web/src/components/ui/toast.tsx` (`Toaster`), and `command.tsx`, whose `CommandDialog` records the opener in `onOpenAutoFocus` and refocuses it in `onCloseAutoFocus`.
  - CAP-003-E1-S5: `web/src/components/patterns/status-badge.tsx` (`StatusBadge({ tier, children: string })`, rendering `badge` `status-<tier>` with an `aria-hidden` shape).
  - CAP-003-E1-S6: `web/src/components/patterns/format.ts` (`formatInstant(value, { seconds })`, `formatClock`, `formatCount`).
  - CAP-003-E1-S8: `web/src/components/patterns/needs-you.ts` (`deriveNeedsYou(attention, scores)`).
  - CAP-003-E3-S1: `web/src/app/shell-types.ts` (`Attention`, `ScoreState`, `ReadState`).
  - CAP-003-E3-S2: `web/src/app/health.tsx` (`HealthProvider`, `useHealth` with `lastAnsweredAt`, `formatTimestamp`, `Liveness`, `HealthState`, `UNREACHABLE_MESSAGE`) and `web/src/app/layout.ts` (`LAYOUT`).
  - CAP-003-E3-S3: `web/src/app/shell-context.tsx` (`ShellProvider`, `useShell`).
  - CAP-003-E3-S4: `web/src/app/destinations.ts` (`DESTINATIONS`, `Destination`, `RESEARCH_REGISTERED`), `titles.ts` (`useTitle`, `Crumb`) and `routes.tsx` (`AppRoutes`, lazy screens).
  - CAP-003-E3-S5: `web/src/app/command-palette/index.tsx` (`CommandPalette({ open, onOpenChange })`).
  - CAP-003-E2-S5: the data-health routes are served (only the e2e specs in T018 and T019 need this).
  - Also run `npm run test` and record the baseline as green.

**Checkpoint**: Every listed module exists with the named exports, and the suite is green before this story's first edit.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that fix the chip, the unreachable state, the frame, the keyboard paths, the layout and the scan.

**Shared conventions for the rewritten shell tests.** Each file defines its own helpers, as the delivered files do; there is no shared helper module.

- **`routedFetch(overrides?)`** is a `vi.fn` passed to `vi.stubGlobal("fetch", …)` in `beforeEach`. It answers by URL pathname:
  - `/api/health`: `HEALTH_OK` (`most_recent_run: null`).
  - `/api/attention`: an `ATTENTION_CLEAR` literal typed `Attention`, with `problems.stock_count: 0`, `items: []` and `latest_download: null`.
  - `/api/classifications/summary`: `404` with the `not_found` envelope, so `scores` is `not_served`.
  - `/api/universes`: `{ universes: [], active_count: 0, retired_count: 0, next_cursor: null }`.
  - Anything else: `404` `not_found`.

  `overrides` replaces one route's answer, or a queue of answers.
- **Screen stubs.** `vi.mock` the delivered screen modules a test visits (`../screens/settings`, `../screens/instruments`, `../screens/coverage`, `../screens/research`). Each default export renders `<h1>{name} stub</h1>` with **no** `tabIndex`, so the focus rule's attribute path is exercised. It also calls a module-level `mounts[name]++` in a mount effect, which counts remounts.
- **Settling.** `settle()` awaits `getByRole("main")` having `data-liveness="answering"`. This is the "test hook" owner-shell §2.10 names for the liveness wait: the main region exposes `useHealth().liveness` as `data-liveness`.
- **cmdk under jsdom.** Wherever the palette opens: stub `ResizeObserver` and `Element.prototype.scrollIntoView` per test, as CAP-003-E3-S5's tests do.
- **Unmount** at the end of every test, so no shell read outlives it.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-060 (rail chips) and TC-COMP-093 (chip badges carry tier shape) in a new `web/src/app/count-chip.test.tsx`, with `// Implements TC-COMP-060` and `// Implements TC-COMP-093` comments. It imports `chipCount`, `readChip`, `chipName`, `CountChip` and `ChipAnnouncer` from `./count-chip` (T012).
  - **Fixtures.** `ATTENTION_3_2`: `problems.stock_count: 3`, plus `items` holding `data_problems` and `credential_missing`, and `latest_download: null`. Combined with `scores: { kind: "not_served" }`, `deriveNeedsYou` yields exactly two items by CAP-003-E1-S8's causes, so the expected Home count is the literal `2`. It is not computed by calling `deriveNeedsYou` in the test. `ATTENTION_ZERO` has `stock_count: 0` and `items: []`.
  - **(a) Counts (step 1).**
    - `chipCount("needs-you", ATTENTION_3_2, NOT_SERVED)` is `2`.
    - `chipCount("problems", ATTENTION_3_2, NOT_SERVED)` is `3`.
    - A third fixture adds `latest_download: { state: "running", … }` with `scores` served `never_classified: true, later: null`. That adds `first_download`, so the needs-you count becomes the literal `3` while `problems` stays `3`. This shows the Home count follows `deriveNeedsYou`, not `items.length`.
  - **(b) Names in words.** `chipName("Home", "needs-you", { count: 2, staleSince: null })` is `"Home, 2 items need you"`. `chipName("Data health", "problems", { count: 3, staleSince: null })` is `"Data health, 3 stocks with problems"`.
  - **(c) Absent at zero (step 2).** `render(<CountChip count={0} />)` leaves `container` empty. `chipName("Home", "needs-you", { count: 0, staleSince: null })` is `"Home"`.
  - **(d) Stale (step 3).** `readChip("problems", { kind: "error", error: new ApiUnreachableError("x"), last: { data: ATTENTION_3_2, checkedAt: new Date("2026-10-15T22:52:10Z") } }, NOT_SERVED)` `toEqual({ count: 3, staleSince: new Date("2026-10-15T22:52:10Z") })`. `chipName` over it is `"Data health, 3 stocks with problems, as of 17:52:10 CDT"`. This is the independent literal of `formatClock` (DEC-0335).
  - **(e) Announcement (step 4).** Render `<ChipAnnouncer readings={…} />` with `[{ label: "Data health", kind: "problems", reading: { count: 3, staleSince: null } }]`, then rerender with `count: 4`.
    - `getByTestId("chip-announcer")` has `role="status"` and `aria-live="polite"`.
    - Its text is `""` after the first render (a first known value is not announced), and `"Data health, 4 stocks with problems"` after the change.
    - Only one element with `data-testid="chip-announcer"` exists.
  - **(f) TC-COMP-093.** `render(<CountChip count={3} />)`:
    - the chip element has `data-variant="status-warning"` and text exactly `3`;
    - it contains exactly one `svg`, which has `aria-hidden="true"`;
    - its accessible text is the count, so the state is not carried by colour alone;
    - no element carries `data-variant="coverage-unknown"`.

    With `count={1236}`, the text is `1,236` (`formatCount`; UX design §0.7).

  Kills:
  - swap-case on the chip kind (`"needs-you"` ↔ `"problems"` in `chipCount`): (a).
  - off-by-one on the zero test (`count > 0` → `count >= 0`): (c).
  - drop-field-copy on `last.checkedAt` into `staleSince`: (d).
  - remove-attribute on `aria-hidden` of the shape: (f). This is CAP-003-E1-S5's attribute; the test proves the chip goes through `StatusBadge`.
  - a hand-written mutant that announces on the first render: (e).
  - a hand-written mutant that renders `<Badge variant="status-warning">` without the shape: (f)'s `svg` count.
- [ ] T003 Write the chip edge cases in `web/src/app/count-chip.test.tsx` (DAC-E3-7, DAC-E3-S6-6, DAC-E3-S6-7; DEC-0335), sequential with T002 (one file).
  - **(a) Singular.**
    - `chipName("Home", "needs-you", { count: 1, staleSince: null })` is `"Home, 1 item needs you"`.
    - The `problems` form with count 1 is `"Data health, 1 stock with problems"`.
  - **(b) Before the first answer** (ux-brief §12.4 shell row, *Loading*: "chips absent until the first attention answer").
    - `readChip(kind, { kind: "loading" }, scores)` is `null`, and so is `readChip(kind, { kind: "error", error, last: null }, scores)`.
    - `CountChip` is only rendered for a non-null reading with a count above 0, so no chip and no not-determinable badge appear (Resolved Conflict 2).
  - **(c) Zero announcement.** In `ChipAnnouncer`, a change from `count: 2` to `count: 0` announces `"Home, nothing needs you right now"` for `needs-you`. The same change for `problems` announces `"Data health, nothing needs fixing"`.
  - **(d) No announcement without a change.**
    - Going from a fresh reading to a stale reading with the same count leaves the announcer text unchanged.
    - A rerender with an identical reading array leaves it unchanged.
    - When both counts change in one render, the text is the two names joined by `"; "`, in the order of the readings.
  - **(e) Vocabulary (DAC-E3-S6-6).**
    - Every string from `chipName` for counts 0, 1 and 2, stale and fresh, both kinds, passes `forbiddenTerms` and returns `[]`. So do the two zero announcements and every leaf string of `SHELL_COPY`.
    - `forbiddenTerms(text)` is `/\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/gi`.
    - Non-vacuity: `forbiddenTerms("2 runs need you")` is `["runs"]`.
  - **(f) The split unreachable copy stays the delivered sentence (register C13).** `` `${SHELL_COPY.unreachable.heading} ${SHELL_COPY.unreachable.cause}` `` equals `UNREACHABLE_MESSAGE` imported from `./health`.

  Kills:
  - off-by-one on the singular test (`n === 1` → `n <= 1`): (a) with count 0 through the announcer's zero path, and (c).
  - negate-boolean on `last === null` in `readChip`: (b).
  - a hand-written mutant that announces whenever `staleSince` changes: (d).
- [ ] T004 [P] Rewrite `web/src/app/shell.unreachable.test.tsx` whole (owner-shell §2.10: "the three main-region cases stay; the status-region case becomes the *Last answered* line; the restore case stays"). Implement TC-COMP-061 with a `// Implements TC-COMP-061` comment, and the unreachable half of TC-COMP-093.
  - **Harness.** `vi.mock("../api/client", …)` with `importActual`, replacing `fetchHealth` only, as the delivered file does. Attention, summary and universes come from `routedFetch`.
  - **Time.** `vi.useFakeTimers({ shouldAdvanceTime: true })` and `vi.setSystemTime(new Date("2026-09-06T18:30:00.000Z"))`.
  - **Cases.**
    - **(a) The main region alone is replaced on every route.** Health rejects with `ApiUnreachableError`. `it.each` over `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/run-123` and `/settings`:
      - `within(main).findByTestId("unreachable-state")` renders;
      - the stub's `h1` is absent;
      - `getByRole("navigation", { name: "Main" })` and `getByRole("banner")` are present.
    - **(b) Structure (DAC-E3-8).** The `unreachable-state` element has `data-variant="default"` (`Card`). Its only child is a `SECTION` with `role="status"`. Within the section:
      - the `h2` text is exactly `FactorFlow is not answering.`;
      - the paragraph is exactly `The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.`;
      - the third line is exactly `Not yet answered since this page opened`, because health never answered (TC edge case).
      - TC-COMP-093: no element in the card has a `data-variant` starting with `status-` or equal to `coverage-unknown`. The status is carried by its words.
    - **(c) *Last answered* (TC steps 1 and 2).** Render at `/data/followed`.
      - The first health read answers at `18:30:00Z`. The next, at `+30 s`, rejects.
      - The section's third line reads exactly `Last answered 2026-09-06 13:30:00 CDT`, the independent literal of `formatInstant(…, { seconds: true })` for `lastAnsweredAt`.
    - **(d) Announced once on entry.** Capture the `role="status"` section after (c). After another failed read 30 s later, `within(main).getByRole("status")` is the same node (`toBe`) and its text is unchanged. Also, `getByTestId("recovery-announcer")` text is `""`.
    - **(e) Recovery remounts at the same URL and refetches (TC step 3).**
      - Continue (d) with the next read resolving `HEALTH_OK`. The unreachable state disappears and the `instruments` stub's `h1` renders again.
      - `mounts.instruments` has risen by exactly 1.
      - A `LocationProbe` still reads `/data/followed`.
      - The rail `nav` element is the same node as before the outage, so the frame never unmounted and the page was not reloaded.
    - **(f) Announced once on recovery** (DEC-0336). After (e), `getByTestId("recovery-announcer")` has `role="status"` and text exactly `FactorFlow is answering again.`.
      - After a later successful read, the text is unchanged and was not re-set. A `MutationObserver` on the announcer records zero mutations after the first.
      - After a new outage, the text is `""` again, and the `unreachable-state` renders.
    - **(g) The first answer is not a recovery.** Health answers on the first read. `recovery-announcer` text stays `""`.

  Kills:
  - negate-boolean on the main region's `liveness === "unreachable"`: (a).
  - drop-field-copy on `lastAnsweredAt` (rendering `lastUpdated`): (c), since the failure time `13:30:30` differs.
  - swap-case on the two third-line forms: (b) and (c).
  - a hand-written mutant that keys the `UnreachableState` on `lastUpdated`, which remounts it every poll: (d).
  - a hand-written mutant that sets the recovery text on `unknown` → `answering`: (g).
  - a hand-written mutant that renders the unreachable state around `AppRoutes` instead of in place of it: (a) and (e)'s mount count.

- [ ] T005 [P] Rewrite `web/src/app/shell.test.tsx` whole. Implement TC-COMP-087 (rail: Research when registered, Settings, no disabled item) and TC-COMP-092 (shell surfaces use the display vocabulary), with `// Implements TC-COMP-087` and `// Implements TC-COMP-092` comments. Use the shared conventions.
  - **(a) Two groups enumerated from `DESTINATIONS` (DAC-E3-S6-1).**
    - `const nav = getByRole("navigation", { name: "Main" })`. `within(nav).getAllByRole("list")` has length 2.
    - The first list's link names `toEqual(DESTINATIONS.filter((d) => d.group === "primary").map((d) => d.label))`, and its hrefs equal the matching `to` values. The second list does the same for `group === "data"`.
    - The test never writes a fixed label list. The independent literal of `DESTINATIONS` lives in CAP-003-E3-S4's TC-COMP-057. CAP-003-E5-S5 and CAP-003-E6-S7 extend the rail by adding entries and need no edit here.
  - **(b) Research exactly when registered.** `within(nav).queryByRole("link", { name: "Research" }) !== null` equals `RESEARCH_REGISTERED`.
  - **(c) Unshipped destinations are absent, not disabled (AC-1).**
    - No link named `/Strategies|Portfolio/` exists.
    - No element in `nav` has `aria-disabled`, `disabled` or `data-variant="blocked"`.
    - `within(nav).queryAllByRole("button")` is `[]`.
  - **(d) Brand mark.** The rail's first text is `FactorFlow`, and it is not a heading.
  - **(e) No principal is assumed (AC-14; delivered TC-COMP-303).** The delivered case is kept with its comment and forbidden pattern, now over `routedFetch`.
  - **(f) TC-COMP-092, vocabulary in every state.** Render the shell answering at `/settings`, then unreachable. Also render `<Rail destinations={TEST_DESTINATIONS} />` in a `ShellProvider` whose attention answers `ATTENTION_3_2` and then fails, so fresh and stale chips render.
    - `TEST_DESTINATIONS` is `DESTINATIONS` plus `{ group: "primary", label: "Home", to: "/home", count: "needs-you" }` first and `{ group: "data", label: "Data health", to: "/data", count: "problems" }` before Settings.
    - In each state, gather four regions: the rail (`data-testid="nav-rail"`), the `banner`, the `unreachable-state` when present, and the toast container (sonner's `section[aria-label^="Notifications"]`).
    - For each region, take its `textContent`, every `aria-label`, and the accessible name of every link and button. `forbiddenTerms` over the union is `[]`.
    - Non-vacuity: a planted `<a aria-label="Runs">` in the same scan returns `["Runs"]`.

  Kills:
  - swap-case on the group filter in the rail (`"primary"` ↔ `"data"`): (a).
  - remove-attribute on `aria-label="Main"`: (a)'s query.
  - a hand-written mutant that renders the rail from a fixed array instead of `DESTINATIONS`: (a), after T014 adds an entry in a scratch run. It is also killed by (f), since `TEST_DESTINATIONS` passed as a prop is ignored.
- [ ] T006 Implement TC-COMP-088 (`⌘K` ignored in text fields, opens on `document`, `Esc` restores focus) in `web/src/app/shell.test.tsx`, with a `// Implements TC-COMP-088` comment, sequential with T005 (one file). Owner-shell §7 *Palette shortcut*. Render the shell at `/settings`, `settle()`, and stub cmdk's jsdom gaps.
  - **(a) Text fields (step 1).** Append these to `document.body`, each removed afterwards: an `input`, a `textarea`, a `select`, and a `div contenteditable="true"` holding a `span`. For each one, `fireEvent.keyDown(target, { key: "k", metaKey: true, bubbles: true })`, then the same with `ctrlKey: true`. For the `contenteditable`, also fire on the inner `span`. After each, `queryByRole("dialog", { name: "Search FactorFlow" })` is `null`.
  - **(b) On `document` (step 2).** Focus `getByRole("button", { name: "Open the command palette" })`. `fireEvent.keyDown(document, { key: "k", metaKey: true })` opens the dialog, and the event's `defaultPrevented` is `true`.
  - **(c) `Esc` returns focus (step 3).** `user.keyboard("{Escape}")` closes the dialog, and the opener has focus.
  - **(d) Ctrl+K (TC edge case) from a rail link.** Focus the Settings rail link. `user.keyboard("{Control>}k{/Control}")` opens the dialog. `{Escape}` returns focus to that link ("or the previously focused element", DAC-E3-10).
  - **(e) The opener on every route (AC-22).** `it.each` over `/settings`, `/data/coverage`, `/research` and `/no/such/page`: clicking the opener opens the dialog, and `{Escape}` returns focus to it.
  - **(f) The opener's name and hint (DAC-E3-10).**
    - The opener's accessible name is exactly `Open the command palette`, and its visible text is `Search⌘K` when `vi.spyOn(navigator, "platform", "get")` returns `"MacIntel"`.
    - The visible text is `SearchCtrl+K` for `"Win32"` and for `"Linux x86_64"`.
    - The opener carries `data-variant="outline"`.
  - **(g) One listener.** Spy on `document.addEventListener` before rendering. Exactly one call has type `"keydown"`. After unmount, `removeEventListener` was called with that same handler.
  - **(h) Plain `k` does nothing.** `fireEvent.keyDown(document, { key: "k" })` opens nothing.

  Kills:
  - negate-boolean on the text-field guard: (a) or (b).
  - `&&` ↔ `||` in `key === "k" && (metaKey || ctrlKey)`: (h).
  - swap-case on the hint (`"⌘K"` ↔ `"Ctrl+K"`): (f).
  - remove-attribute on `preventDefault()`: (b)'s `defaultPrevented`.
  - a hand-written mutant that drops the `[contenteditable]` ancestor check (testing `target.isContentEditable`, which jsdom leaves `undefined`): (a)'s inner `span`.
  - a hand-written mutant that adds the listener in an effect without cleanup: (g).
- [ ] T007 Implement TC-COMP-089 (startup specs rewritten to the frame, redirect URLs and unreachable text) and the DAC-E3-15 file checks in `web/src/app/shell.test.tsx`, with a `// Implements TC-COMP-089` comment, sequential with T006. The case is RED until T016, T018 and T019. Read the files with `node:fs` from `import.meta.url`, as the delivered `shell.tokens.test.tsx` does. The repo root is `../../../` from `web/src/app/`.
  - **(a) Deleted (DAC-E3-15).** `existsSync` is `false` for:
    - `web/src/app/status-region.tsx`, `status-region.test.tsx`, `status-region.a11y.test.tsx` and `status-region.integration.test.tsx`;
    - `shell.status-region.test.tsx`.
  - **(b) No importer remains.** A walk over every `.ts`/`.tsx` under `web/src/` (more than 50 files, so not vacuous), excluding `shell.test.tsx` itself, finds no file matching `/app\/status-region["']|\.\/status-region["']/`. The regex matches a module specifier ending at the quote, so (a)'s path strings (`status-region.tsx"`) do not trip it.
  - **(c) `startup-health.spec.ts` (DAC-E3-S6-3).**
    - It contains `toHaveURL(` together with both `/setup` and `/home`.
    - It contains `getByRole("navigation", { name: "Main" })` and `getByRole("button", { name: "Open the command palette" })`.
    - It contains none of `liveness-state`, `run-outcome`, `status-region`, `outcome-badge`, `Get set up`, `Needs you` and `Recent downloads`.
  - **(d) `startup-refusal.spec.ts`.**
    - It contains `FactorFlow is not answering.`, the cause paragraph, `Not yet answered since this page opened` and `Last answered`.
    - It contains none of the (c) forbidden tokens.
  - These text checks are the TC's "read the specs' assertions". The specs' behaviour is proven by running them (Validation Plan).

  Kills:
  - a hand-written mutant that restores `liveness-state` in `startup-health.spec.ts`: (c).
  - a hand-written mutant that leaves one screen importing `app/status-region` with a shim file: (a) and (b).
- [ ] T008 [P] Rewrite `web/src/app/shell.a11y.test.tsx` whole (owner-shell §2.10: "Tab order over the new rail; `nav` named *Main*; `aria-current` on the current item; chips named in words"; §7 *Focus on navigation*).
  - **(a) Tab order.**
    - Render at `/settings` and `settle()`.
    - The rail's links come first in tab order: `user.tab()` once per `DESTINATIONS` entry focuses each rail link in DOM order. The DOM order is `primary` then `data`, each in `DESTINATIONS` order.
    - The next tab stop is the opener, `Open the command palette`.
  - **(b) `aria-current`.**
    - At `/settings`, the Settings link has `aria-current="page"`, and no other rail link has it.
    - At `/research/stocks/KO`, the Research link has it, because `NavLink` matches the `/research` ancestor.
  - **(c) Chips named in words (DAC-E3-7, AC-16).** Render `<Rail destinations={TEST_DESTINATIONS} />` (T005 (f)) inside `HealthProvider`, `ShellProvider` and `MemoryRouter`.
    - Attention answers `ATTENTION_3_2` and the summary is not served. The links are named exactly `Home, 2 items need you`, `Research`, `Data health, 3 stocks with problems` and `Settings`.
    - Each chip's text is visible: `2` and `3`.
    - With `ATTENTION_ZERO`, the names are `Home` and `Data health`, and no `[data-variant="status-warning"]` exists in the rail.
    - When the next attention read fails, the names gain `, as of 13:30:00 CDT`, the fixed system time `18:30:00Z` of the last success. The chip values stay `2` and `3`.
    - `within(rail).getByTestId("chip-announcer")` is the only polite live region in the rail.
  - **(d) Focus on route change (UX design §0.6; STD-UI-24; DEC-0337).**
    - **First load.** Render at `/settings`. After the stub resolves, `document.activeElement` is `document.body`, so focus is not moved.
    - **Rail navigation.** Click the Research rail link. `await waitFor` until `document.activeElement` is the `research` stub's `h1`. The stub resolves through `React.lazy` behind CAP-003-E3-S4's `Suspense` fallback. The `h1` now carries `tabindex="-1"`.
    - **Not-found.** Navigating to `/no/such/page` focuses `NotFound`'s `h1`, which already has `tabIndex={-1}` (CAP-003-E3-S4).
    - **Search only.** The `settings` stub renders a button that calls `setSearchParams({ x: "1" })`. Clicking it changes `location.search`, and focus stays on that button.
  - **(e) Toasts never take focus.** With the opener focused, calling `toast.error("x")` (CAP-003-E1-S3) inside `act` leaves focus on the opener.

  Kills:
  - remove-attribute on the `tabindex` setter: (d), where the stub `h1` cannot take focus.
  - a hand-written mutant that keys the focus effect on `location.key`: (d), search only.
  - a hand-written mutant that focuses on first load: (d), first load.
  - drop-field-copy on the chip name into `aria-label`: (c).
- [ ] T009 [P] Rewrite `web/src/app/shell.layout.test.tsx` whole. Implement TC-COMP-063 (the top bar leaves the environment and kill-switch place empty) and TC-COMP-090 (below 768 px the rail stacks above the content and stays reachable), with `// Implements TC-COMP-063` and `// Implements TC-COMP-090` comments. Owner-shell §2.10: "asserts rail, top bar and main region; the status-region slot assertions are removed".
  - **(a) Frame structure.**
    - `getByTestId("nav-rail")` contains `getByRole("navigation", { name: "Main" })`.
    - `getByRole("banner")` and `getByRole("main")` are not inside the rail, and they share one parent.
    - The rail precedes that parent in document order (`compareDocumentPosition` has `DOCUMENT_POSITION_FOLLOWING`).
    - Exactly one `main` and one `banner` exist.
    - No element with `data-testid` matching `/status-region|liveness-state|run-outcome/` exists.
  - **(b) TC-COMP-063 (DAC-E3-17).**
    - The banner has exactly two element children: the title container (`data-testid="top-bar-title"`) and the opener.
    - Nothing in the banner has `disabled`, `aria-disabled`, `data-variant="blocked"`, or a name or text matching `/environment|paper|live|kill|stop trading|trading/i`.
    - This holds at `/settings` and at `/` before health answers.
  - **(c) Top-bar title.**
    - At `/data/downloads/abc`, the title container's text is `Data health › Downloads › Download`. Its two ancestor crumbs are links with `href` `/data` and `/data/downloads`, and the last crumb is not a link.
    - At `/` before the first answer, the title container is empty.
  - **(d) TC-COMP-090 (DAC-E3-S6-4).** jsdom computes no layout, so this asserts the responsive classes and the layout value instead. The real-browser check is in the Validation Plan.
    - The frame root's `classList` contains `flex-col` and `md:flex-row`.
    - The rail's `classList` contains `w-full` and `md:w-[var(--rail-width)]`, and `rail.style.getPropertyValue("--rail-width")` is the literal `"208px"` (DAC-E3-16; T014).
    - The rail's item container has `flex-row`, `overflow-x-auto` and `md:flex-col`.
    - The banner has `flex-wrap`.
    - TC step 2: `user.tab()` reaches every rail link, as in T008 (a).
  - **(e) Rail icons** (DEC-0334).
    - Every rail link contains exactly one `svg` with `aria-hidden="true"`, `width="16px"` and `height="16px"` (`LAYOUT.railIconSize`).
    - Every `DESTINATIONS` `to` is a key of the exported `RAIL_ICONS`.
    - The four keys `"/home"`, `"/research"`, `"/data"` and `"/settings"` map to the `lucide-react` exports `House`, `FlaskConical`, `Activity` and `Settings`, compared by identity against imports in the test.

  Kills:
  - swap-case on `md:flex-row` ↔ `md:flex-col` on the frame root: (d).
  - drop-field-copy on `--rail-width`: (d).
  - a hand-written mutant that inserts `<Button variant="blocked">Live</Button>` between title and opener: (b).
  - remove-attribute on `aria-hidden` of the icon: (e).
- [ ] T010 [P] Implement TC-COMP-091 (literal scan widened to `web/src/app/`) in `web/src/components/token-literals.test.ts`, with a `// Implements TC-COMP-091` comment, in a new `describe("app scan (TC-COMP-091, DAC-E3-S6-5)")`.
  - **Widen.** Append `"web/src/app/"` to the exported `SCANNED_DIRECTORIES`, after the entries already there, without reordering or removing any. CAP-003-E3-S5's `"web/src/app/command-palette/"` stays.
  - **(a) Coverage.**
    - `SCANNED_DIRECTORIES` contains `"web/src/app/"`.
    - Walking it with the file's own walker finds more than 15 scanned sources, including `shell.tsx`, `count-chip.tsx`, `unreachable-state.tsx`, `copy.ts`, `routes.tsx` and `health.tsx`.
    - `isScannedSource` is false for `shell.test.tsx`.
    - E1-S1's TC-COMP-005 pass over all directories is green unchanged.
  - **(b) A planted literal fails, naming the file (TC step 3).** `literalsIn("web/src/app/planted.tsx", 'const x = "12px";')` is exactly `["web/src/app/planted.tsx: 12px"]`. `rem`, `vh`, `#fff` and `rgb(0, 0, 0)` behave the same way.
  - **(c) `layout.ts` excluded by name (TC edge case).**
    - `literalsIn("web/src/app/layout.ts", 'railWidth: "208px"')` is `[]`.
    - The same source at `web/src/app/layout-copy.ts` returns one offender.

  Kills:
  - a hand-written mutant that drops the appended entry: (a).
  - Real mutation of the scan helpers is CAP-003-E1-S1's. Here the hand-written mutant is a planted literal (T021).

**Checkpoint**: T002 to T009 exist and fail for the right reason. `count-chip.tsx`, `unreachable-state.tsx` and `copy.ts` are missing. The rewritten shell tests fail against the delivered rail and status region. TC-COMP-089 fails while `status-region.tsx` exists. T010 widens a scan over a tree that already holds no literal, so it may be green at once. Record that in its cycle's evidence: its RED is T017's planted literal. Every other delivered test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The three new modules, then the frame.

- [ ] T011 [P] Create `web/src/app/copy.ts` (DAC-E3-S6-6: "this component's `copy.ts`"; depends on T002 and T003 being RED). It holds the shell's own strings and nothing else. `export const SHELL_COPY` has these entries:
  - `brand: "FactorFlow"`;
  - `navLabel: "Main"`;
  - `opener: { label: "Search", name: "Open the command palette", macHint: "⌘K", otherHint: "Ctrl+K" }`;
  - `unreachable: { heading: "FactorFlow is not answering.", cause: "The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.", lastAnswered: (when: string) => \`Last answered ${when}\`, neverAnswered: "Not yet answered since this page opened", recovered: "FactorFlow is answering again." }`. The `recovered` string is DEC-0336;
  - `chips`, holding the four count phrases and the two zero announcements of DEC-0335: `"item needs you"` / `"items need you"`, `"stock with problems"` / `"stocks with problems"`, `"nothing needs you right now"` and `"nothing needs fixing"`, plus `asOf: (time: string) => \`, as of ${time}\``.

  Also:
  - T003 (f) checks that `heading` and `cause` join to the delivered `UNREACHABLE_MESSAGE` word for word.
  - The module doc comment cites UX design §0.1, §0.2 and §0.5, owner-shell §2.7 and §2.8, AC-19 and DAC-E3-S6-6.
  - Write no length and no hex, comments included.
- [ ] T012 Create `web/src/app/count-chip.tsx` (DAC-E3-7, DAC-E3-S6-7; owner-shell §2.7; depends on T011; makes T002 and T003 pass).
  - **Imports:** `StatusBadge` from `"../components/patterns/status-badge"`; `deriveNeedsYou` from `"../components/patterns/needs-you"`; `formatClock` and `formatCount` from `"../components/patterns/format"`; `type { Attention, ReadState, ScoreState }` from `"./shell-types"`; `type { Destination }` from `"./destinations"`; `SHELL_COPY` from `"./copy"`; and `useEffect`, `useRef` and `useState` from `"react"`.
  - **`export type ChipKind = NonNullable<Destination["count"]>`.**
  - **`export function chipCount(kind: ChipKind, attention: Attention, scores: ScoreState): number`.**
    - `needs-you` returns `deriveNeedsYou(attention, scores).length`. This is the same call `home-ui` makes (DEC-0203; epic DAC-E3-7; Resolved Conflict 3).
    - `problems` returns `attention.problems.stock_count`.
  - **`export interface ChipReading { count: number; staleSince: Date | null }`.**
  - **`export function readChip(kind, attention: ReadState<Attention>, scores): ChipReading | null`.**
    - `ok` returns `{ count, staleSince: null }`.
    - `error` with `last` returns `{ count: chipCount(kind, last.data, scores), staleSince: last.checkedAt }`.
    - `loading`, and `error` with `last: null`, return `null`. This follows ux-brief §12.4: the chips are absent until the first answer, and the shell has no chip error of its own.
  - **`export function chipName(label: string, kind: ChipKind, reading: ChipReading | null): string`.**
    - A `null` reading or a zero count returns `label`.
    - Otherwise it returns `` `${label}, ${formatCount(n)} ${n === 1 ? singular : plural}` ``, plus `SHELL_COPY.chips.asOf(formatClock(staleSince))` when `staleSince` is set.
  - **`export function CountChip({ count }: { count: number }): JSX.Element | null`.**
    - It returns `null` when `count <= 0`.
    - Otherwise it returns `<StatusBadge tier="warning" className="ml-auto font-numeric">{formatCount(count)}</StatusBadge>`. This is the design's `badge` `status-warning` at `--text-xs` (the badge base is `text-xs`) with its `aria-hidden` triangle, and the count as its text (Resolved Conflict 1).
  - **`export function ChipAnnouncer({ readings }: { readings: readonly { label: string; kind: ChipKind; reading: ChipReading | null }[] }): JSX.Element`.**
    - It keeps a `useRef<Map<string, number>>` of the last known count per label.
    - In an effect over `readings`, it collects every reading whose count is non-null and differs from a previously known count. Each one becomes `chipName(…)` with `staleSince: null`, or the zero announcement when the count is 0. The texts are joined with `"; "`, and the state is set only when that list is non-empty.
    - A first known value updates the map without announcing.
    - It renders `<div data-testid="chip-announcer" role="status" aria-live="polite" className="sr-only">{message}</div>`.
  - **Comments.** Each rule is commented with DAC-E3-7, AC-16, ux-brief §12.4, TC-COMP-060 and TC-COMP-093. Write no layout value and no `px` in comments.
- [ ] T013 [P] Create `web/src/app/unreachable-state.tsx` (DAC-E3-8; owner-shell §2.8; UX design §0.5; depends on T011; makes T004 (b) and (c) pass once T014 mounts it).
  - **Signature.** `export function UnreachableState(): JSX.Element`, taking no props. It is the same export name the delivered `status-region.tsx` had, so the CAP-002 screen that renders it needs only its import line repointed (T015).
  - **Data.** It reads `const { lastAnsweredAt } = useHealth()` from `"./health"`.
  - **Rendering.** `<Card variant="default" data-testid="unreachable-state">` holds `<section role="status" className="flex flex-col gap-3 p-5">`, which contains:
    - `<h2 className="text-lg font-semibold">{SHELL_COPY.unreachable.heading}</h2>`;
    - `<p>{cause}</p>`;
    - `<p className="font-numeric text-sm text-muted-foreground">`, holding `lastAnswered(formatInstant(lastAnsweredAt, { seconds: true }))` when set, else `neverAnswered`.
  - **Stable node.** The component holds no key derived from time, so a poll that keeps it unreachable re-renders the same node and does not re-announce it.
  - **Doc comment.** It cites DAC-E3-8, AC-23, DEC-0204, owner-shell §2.8 and UX design §0.5. It says the `testid` is kept for the delivered CAP-002 test `research/stocks/stock-evidence.test.tsx`.
  - **Imports:** `Card` from `"../components/ui/card"`, `formatInstant` from `"../components/patterns/format"`, `useHealth` from `"./health"` and `SHELL_COPY` from `"./copy"`.
- [ ] T014 Rewrite `web/src/app/shell.tsx` whole (owner-shell §2.2, §2.7, §10; depends on T012 and T013; T004 to T009 RED). It must stay free of any `\d+(px|rem|em)` match, comments included, because the delivered `shell.tokens.test.tsx` is unchanged.
  - **Imports:**
    - `type CSSProperties`, `type JSX`, `useEffect`, `useRef` and `useState` from `"react"`;
    - `Link`, `NavLink` and `useLocation` from `"react-router-dom"`;
    - `type LucideIcon`, `House`, `FlaskConical`, `Activity` and `Settings` from `"lucide-react"`;
    - `Button` from `"../components/ui/button"` and `Toaster` from `"../components/ui/toast"`;
    - `CommandPalette` from `"./command-palette"`;
    - `ChipAnnouncer`, `CountChip`, `chipName` and `readChip` from `"./count-chip"`;
    - `SHELL_COPY` from `"./copy"`;
    - `DESTINATIONS` and `type Destination` from `"./destinations"`;
    - `HealthProvider` and `useHealth` from `"./health"`;
    - `LAYOUT` from `"./layout"`;
    - `AppRoutes` from `"./routes"`;
    - `ShellProvider` and `useShell` from `"./shell-context"`;
    - `useTitle` from `"./titles"`;
    - `UnreachableState` from `"./unreachable-state"`.

    Nothing is imported from `screens/setup`, because CAP-003-E4-S6 mounts `SetupDraftProvider` (DEC-0227).
  - **`export const RAIL_ICONS: Readonly<Record<string, LucideIcon>>`** maps `"/home"` to `House`, `"/research"` to `FlaskConical`, `"/data"` to `Activity` and `"/settings"` to `Settings` (DEC-0334). An entry without an icon fails T009 (e).
  - **`export function Rail({ destinations = DESTINATIONS }: { destinations?: readonly Destination[] }): JSX.Element`.** The defaulted prop is the test seam for the counted destinations later stories add. `Shell` passes nothing. The rail renders:
    - `<div data-testid="nav-rail" className="flex w-full flex-col border-border border-b bg-background md:w-[var(--rail-width)] md:border-r md:border-b-0" style={{ "--rail-width": LAYOUT.railWidth } as CSSProperties}>`;
    - `<p className="p-3 text-base font-semibold">{SHELL_COPY.brand}</p>`;
    - `<nav aria-label={SHELL_COPY.navLabel} className="flex flex-1 flex-row gap-2 overflow-x-auto p-3 md:flex-col">`, holding the `primary` `<ul>`, an `aria-hidden` spacer `<div className="hidden md:block md:flex-1" />` and the `data` `<ul>`, each `ul` with `flex flex-row gap-1 md:flex-col`.
    - Each `<li>` holds a `<NavLink to={d.to} aria-label={chip ? name : undefined} className={…}>`. The class string is the `button` `ghost` token classes plus `flex items-center gap-2 rounded px-3 py-2 text-foreground aria-[current=page]:bg-background aria-[current=page]:ring-1 aria-[current=page]:ring-border`.
    - Inside the link: `<Icon aria-hidden="true" size={LAYOUT.railIconSize} className="shrink-0 text-muted-foreground group-aria-[current=page]:text-foreground" />`, then `{d.label}`, then `<CountChip count={reading?.count ?? 0} />`.
    - The readings come from `const { attention, scores } = useShell()`: `reading = d.count ? readChip(d.count, attention, scores) : null`.
    - Finally `<ChipAnnouncer readings={counted} />`, where `counted` is the destinations with a `count`.
  - **`TopBar({ onOpenPalette })`** (private) renders `<header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-border border-b bg-background px-5 py-3">` with exactly two children:
    - **Title.** `<div data-testid="top-bar-title" className="text-base font-semibold">` renders `useTitle()`. Every crumb but the last is a `<Link to={c.to}>`, the last is a `<span>`, and between them is `<span className="px-2 text-muted-foreground">›</span>`. A `null` title renders nothing.
    - **Opener.** `<Button variant="outline" aria-label={SHELL_COPY.opener.name} onClick={onOpenPalette}>{SHELL_COPY.opener.label}<span className="text-xs text-muted-foreground">{isMac() ? macHint : otherHint}</span></Button>`.
    - `isMac()` returns `/^Mac/.test(navigator.platform)` and is evaluated at render, not at import.
    - Nothing else goes in the header (DAC-E3-17).
  - **`MainRegion()`** (private).
    - `const { liveness } = useHealth()`.
    - It renders `<main data-liveness={liveness} className="flex min-w-0 flex-1 flex-col gap-5 bg-muted/50 p-5">`, containing `liveness === "unreachable" ? <UnreachableState /> : <AppRoutes />`. While `unknown`, the routed screen renders, as delivered.
  - **`RecoveryAnnouncer()`** (private; DEC-0336).
    - A `useRef` holds the previous liveness. On a change from `unreachable` to `answering`, it sets the text to `SHELL_COPY.unreachable.recovered`. On a change to `unreachable`, it sets `""`.
    - It renders `<p data-testid="recovery-announcer" role="status" className="sr-only">`.
  - **`usePaletteShortcut(open: () => void)`** (private). One `useEffect(…, [])` adds a single `keydown` listener to `document` and removes it on cleanup. The handler returns unless `event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)`. It also returns when `isTextField(event.target)`. Otherwise it calls `event.preventDefault()` and `open()`. `isTextField(t)` is true when `t` is an `Element` and either:
    - `t.closest("input, textarea, select")` is non-null; or
    - `t.closest('[contenteditable]:not([contenteditable="false"])')` is non-null. The second test exists because jsdom does not implement `isContentEditable` (Other Notes).

    The open function is held in a ref, so the effect never re-subscribes.
  - **`useFocusHeadingOnPathChange(mainRef)`** (private; DEC-0337).
    - It reads `useLocation().pathname` and skips the first render.
    - On each later pathname change, it finds `mainRef.current?.querySelector("h1")`. When it is absent, as while CAP-003-E3-S4's `Suspense` fallback shows (DEC-0328), it waits with a `MutationObserver` (`childList`, `subtree`) on the main element until an `h1` appears.
    - It then sets `tabindex="-1"` when the `h1` has none, and calls `focus()`.
    - The observer is disconnected on the next change and on unmount.
    - `MainRegion` is given a `ref` to its `main` element for this hook.
  - **`Frame()`** (private).
    - `const [paletteOpen, setPaletteOpen] = useState(false)`. It calls `usePaletteShortcut(() => setPaletteOpen(true))` and `useFocusHeadingOnPathChange(mainRef)`.
    - It renders `<div className="flex min-h-screen flex-col bg-background text-foreground text-base md:flex-row">` holding:
      - `<Rail />`;
      - `<div className="flex min-w-0 flex-1 flex-col">`, containing `<TopBar onOpenPalette={() => setPaletteOpen(true)} />` and `<MainRegion ref={mainRef} />`;
      - `<RecoveryAnnouncer />`;
      - `<CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />`;
      - `<Toaster />`.

    CAP-003-E3-S7 adds the toast watcher's mount line here, and CAP-003-E4-S6 adds `SetupDraftProvider` around the frame's content, inside `ShellProvider`.
  - **`export function Shell(): JSX.Element`** returns `<HealthProvider><ShellProvider><Frame /></ShellProvider></HealthProvider>` (owner-shell §2.2: `HealthProvider` outermost).
  - **Doc comment.** It replaces the delivered one and cites:
    - owner-shell §2.2, §2.7, §2.8 and §10, and UX design §0.1, §0.2, §0.5 and §0.6;
    - AC-1, AC-14, AC-16, AC-22, AC-23, AC-25 and AC-26;
    - DAC-E3-7, DAC-E3-8, DAC-E3-10, DAC-E3-17 and DAC-E3-S6-1 to DAC-E3-S6-7;
    - DEC-0204, DEC-0211 and DEC-0227.

    Write layout values only as `LAYOUT.*` reads. In prose, write a space before any unit (`768 px`).

  This makes T004 to T006, T008 and T009 pass. T005 (f) and T007 still wait on T015, T016, T018 and T019.

**Checkpoint**: `npx vitest run src/app/count-chip.test.tsx src/app/shell.unreachable.test.tsx src/app/shell.a11y.test.tsx src/app/shell.layout.test.tsx` is green, and `shell.test.tsx` is green except T007. `npx tsc --noEmit` is clean, because `status-region.tsx` still exists for its importers until T015 and T016.

---

## Phase 4: Integration

**Purpose**: Retire the status region without breaking its importers, rewrite the two startup specs, and confirm the change set.

- [ ] T015 Repoint every remaining importer of `web/src/app/status-region.tsx` (DEC-0333; Open Gap 1; depends on T013 and T014).
  - **Find the importers.** Run `grep -rln 'app/status-region"' web/src`. At planning time the matches are these 13 files. CAP-003-E7-S1, CAP-003-E7-S2 or CAP-003-E7-S5 may already have removed some of them; edit only the ones still present.
    - Sources: `screens/research/results-pane.tsx`, `research/use-score-set-poll.ts`, `research/stocks/index.tsx`, `settings/index.tsx`, `settings/credential-status.tsx`, `runs/index.tsx`, `runs/run-table.tsx`, `runs/detail/run-summary.tsx`, `coverage/index.tsx` and `coverage/cells.tsx`.
    - Tests: `research/results-pane.test.tsx`, `research/use-score-set-poll.test.ts` and `runs/runs-screen.test.tsx`.
  - **The change** in each file is the module specifier only:
    - `useHealth`, `HealthProvider`, `HealthState`, `Liveness` and `formatTimestamp` come from `…/app/health`;
    - `UnreachableState` (only `research/stocks/index.tsx`) comes from `…/app/unreachable-state`;
    - `vi.mock("../../app/status-region", …)` in `use-score-set-poll.test.ts` becomes `vi.mock("../../app/health", …)`.
  - **The one non-specifier edit.** The `health()` fixture in `use-score-set-poll.test.ts` gains `lastAnsweredAt: new Date()`, because CAP-003-E3-S2's `HealthState` requires the field and `tsc` checks test files. No assertion changes, and no other line changes.
  - **Confirm.**
    - `git diff -U0 -- web/src/screens/` shows only import or `vi.mock` specifier lines, plus that one fixture line.
    - The CAP-002 tests `research/stocks/stock-evidence.test.tsx` (its unreachable case, through the kept `data-testid`), `results-pane.test.tsx` and `use-score-set-poll.test.ts`, and the CAP-001 `runs-screen.test.tsx`, pass unchanged apart from these lines.
- [ ] T016 Delete the status region (DAC-E3-15; DEC-0204, DEC-0211; depends on T015). Delete:
  - `web/src/app/status-region.tsx`, `status-region.test.tsx`, `status-region.a11y.test.tsx` and `status-region.integration.test.tsx`;
  - `web/src/app/shell.status-region.test.tsx`.

  The delivered `HealthProvider` polling, unknown-state and cleanup cases already live in `health.test.tsx` (CAP-003-E3-S2 T007), so nothing is lost. Then run `npx tsc --noEmit` and `npm run test`. T007 (a) and (b) now pass.
- [ ] T017 Confirm `web/src/components/token-literals.test.ts` (T010) is green over the final `web/src/app/` tree: no deleted file, `shell.tsx`, `count-chip.tsx`, `unreachable-state.tsx` and `copy.ts` all scanned (depends on T016).
  - Plant `export const x = "12px";` in a temporary `web/src/app/planted.tsx`.
  - Confirm the scan fails naming `web/src/app/planted.tsx: 12px`, and that CAP-003-E3-S2's layout rule stays green.
  - Delete the file. Record both runs in the evidence (TC-COMP-091 step 3).
- [ ] T018 [P] Rewrite `tests/e2e/startup-health.spec.ts` (DAC-E3-S6-3, DAC-E3-15; owner-shell §2.10; depends on T014). Keep the test title's TC-E2E-011 reference, the loopback-only probe (`firstExternalIPv4`, `connectionError`, `ECONNREFUSED` on 8123) and the `GET /api/health` read. Remove `RUN_STATE_LABEL` and the `liveness-state` and `run-outcome` assertions. Then:
  - `await page.goto("/")`.
  - `await expect(page).toHaveURL(mostRecent === null ? /\/setup$/ : /\/home$/)` asserts the redirect by URL only. The screens at those paths are registered by CAP-003-E4-S6 and CAP-003-E5-S5, which also add §2.10's latest-outcome assertion.
  - The frame renders: `getByRole("navigation", { name: "Main" })`, `getByRole("banner")`, `getByRole("button", { name: "Open the command palette" })` and `getByRole("main")` are visible.
  - Assert nothing about the content of `/setup`, `/home` or `/data`.
  - The doc comment cites TC-E2E-011, AC-1, AC-2, AC-14, DAC-E3-S6-3 and backlog review v2 FINDING-2.
- [ ] T019 [P] Rewrite `tests/e2e/startup-refusal.spec.ts` (DAC-E3-S6-3, DAC-E3-8, AC-23; depends on T014). Keep `REFUSED_BASE_URL`, the `page.route("**/api/**", …)` forwarding to 8124 and the final "no API surface" assertion. Replace the `UNREACHABLE_MESSAGE` constant with the three literal texts. Its comment now cites `web/src/app/copy.ts`.
  - **Test 1, TC-E2E-012 (never answered).**
    - `goto("/")`, then wait for `getByRole("navigation", { name: "Main" })`.
    - Install the route, then `reload()`.
    - `getByTestId("unreachable-state")` contains the heading `FactorFlow is not answering.`, the cause paragraph and `Not yet answered since this page opened`.
    - The rail and the banner stay visible.
  - **Test 2, *Last answered* after a lost answer** (owner-shell §2.10: "its *Last answered* line").
    - `await page.clock.install()` before `goto("/")`. Playwright 1.47 is delivered and has `page.clock`.
    - Wait for the main region to show `data-liveness="answering"`, then install the route without reloading.
    - `await page.clock.fastForward(30_000)`, which is the health cadence.
    - `getByTestId("unreachable-state")` contains `FactorFlow is not answering.` and matches `/Last answered \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} C[DS]T/`. The rail and banner remain.
  - Assert nothing about later screens.
- [ ] T020 Confirm scope (depends on T015 to T019).
  - **Changed files.** `git status --short` lists only:
    - the new `web/src/app/count-chip.tsx`, `count-chip.test.tsx`, `unreachable-state.tsx` and `copy.ts`;
    - the rewritten `shell.tsx`, `shell.test.tsx`, `shell.a11y.test.tsx`, `shell.layout.test.tsx` and `shell.unreachable.test.tsx`;
    - the five deletions;
    - `web/src/components/token-literals.test.ts`;
    - the two startup specs;
    - T015's screen import lines;
    - this story's `-tasks.md`, `-tdd-evidence.yaml` and status line.
  - **Unchanged files.** `git diff --exit-code -- web/src/app/shell.tokens.test.tsx web/src/app/build-output.test.tsx web/src/app/routes.tsx web/src/app/routes.test.tsx web/src/app/destinations.ts web/src/app/titles.ts web/src/app/health.tsx web/src/app/layout.ts web/src/app/shell-context.tsx web/src/app/command-palette/ web/src/main.tsx web/src/api/ web/src/components/ui/ web/src/components/patterns/ package.json package-lock.json` exits 0 (DAC-E3-15; owner-shell §2.1 "`main.tsx` is unchanged"; §4 no dependency).
  - **No setup imports.** `grep -rn "screens/setup" web/src/app` prints nothing (DEC-0227).

**Checkpoint**: The status region is gone, nothing imports it, and the two startup specs describe the new frame. The diff is exactly the story's files plus T015's specifier lines.

---

## Phase 5: Polish

**Purpose**: Validation, formatting and the TDD evidence.

- [ ] T021 Run `npm run format`, which is a check. Fix any report with `npx biome format --write` on this story's files only. Then run `npm run lint`, `npx tsc --noEmit`, `npx tsc --noEmit -p tsconfig.e2e.json` (the e2e specs), `npm run build` and `npm run test`.
  - `build-output.test.tsx` stays green, unchanged.
  - Run `npm run test:e2e -- tests/e2e/startup-health.spec.ts tests/e2e/startup-refusal.spec.ts`. It needs `npx playwright install` and a container runtime, and the Bash sandbox blocks Docker, so it may need the sandbox disabled.
  - If either is unavailable, report the exclusion and never call a partial run green.
  - Run the mutation command in the Validation Plan, with the hand-written mutants in Other Notes.
  - No behaviour change.
- [ ] T022 After each TDD cycle in T002 to T021 — not once at the end — do the following before the next cycle begins:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E3-S6-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.

  `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC).

  The cycles are:
  - (1) T002 + T003 + T011 + T012: the chip and the shell copy.
  - (2) T004 (b) and (c), rendered against `UnreachableState` inside a `HealthProvider`, + T013: the unreachable card.
  - (3) T004 (the rest) + T005 + T006 + T008 + T009 + T014: the frame.
  - (4) T007 + T015 + T016 + T018 + T019: retiring the status region and the two specs.
  - (5) T010 + T017: the widened scan. This cycle is test-only, with `mutation: {not_applicable: "test-only change"}`.

  T020 and T021 add no behaviour and join cycle 4's validation evidence.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S1 | hard | **New edge.** `count-chip.tsx` imports `type { Attention, ReadState, ScoreState }` from `web/src/app/shell-types.ts`. Already implied through CAP-003-E3-S3 |
| CAP-003-E3-S2 | hard | **New edge.** `shell.tsx` imports `HealthProvider` and `useHealth` from `health.tsx`, and `LAYOUT` from `layout.ts`. `unreachable-state.tsx` reads `lastAnsweredAt`. T015 repoints screens to `health.tsx`. Already implied through CAP-003-E3-S3 and CAP-003-E3-S4 |
| CAP-003-E1-S5 | hard | **New edge.** `count-chip.tsx` renders `StatusBadge` as rewritten to the six-tier `badge` `status-<tier>` with its shape (CAP-003-E1-S5 plan T007). Already implied through CAP-003-E1-S8 |
| CAP-003-E3-S7 | reverse | Adds the download-toast watcher's mount line to this story's `shell.tsx`. Graph: E3-S7 depends on E3-S6 |
| CAP-003-E3-S8 | reverse | Its e2e specs drive the frame, the palette and the unreachable state. Graph: E3-S8 depends on E3-S6 |
| CAP-003-E4-S6 | reverse | Mounts `SetupDraftProvider` in this story's `shell.tsx` and extends `startup-health.spec.ts`. Graph: E4-S6 depends on E3-S6 |
| CAP-003-E5-S5 | reverse | Adds the counted Home destination this rail renders through `count-chip.tsx`, and extends `shell.test.tsx` by entry. Graph: E5-S5 depends on E3-S6 |
| CAP-003-E6-S7 | reverse | Adds the counted Data health destination. Graph: E6-S7 depends on E3-S6 |
| CAP-003-E7-S1 | reverse | Its plan reads `useShell()` under the `ShellProvider` this story mounts, and imports `Liveness` from `app/health`. Graph: E7-S1 depends on E3-S6 |
| CAP-003-E7-S2 | context | Rewrites `coverage/index.tsx` and `cells.tsx`, removing the `formatTimestamp` import T015 repoints. Whichever lands second sees the other's import line. Neither imports the other |
| CAP-003-E7-S5 | context | Rewrites `runs/detail/run-summary.tsx` and removes the import T015 repoints, as for CAP-003-E7-S2 |
| CAP-003-E7-S7 | context | Fixes the delivered e2e specs that the rail and route change leave red (backlog review v4 FINDING-5). Not a prerequisite here |

The graph's other hard edges cover the remaining imports. They are CAP-003-E3-S3, E3-S4, E3-S5, E1-S1, E1-S3, E1-S6 and E1-S8, plus CAP-003-E2-S5 for the two real-stack specs.

### Task Dependencies

- T001 comes first.
- T002 and T003 share `count-chip.test.tsx` and run in sequence. T005, T006 and T007 share `shell.test.tsx` and run in sequence.
- T002, T004, T005, T008, T009 and T010 touch different files and can be written in parallel.
- T011 depends on T002 and T003 being RED. T012 depends on T011. T013 depends on T011 and can run in parallel with T012.
- T014 depends on T012 and T013.
- T015 depends on T013 and T014. T016 depends on T015. T017 depends on T016.
- T018 and T019 depend on T014 and can run in parallel with T015 to T017.
- T020 depends on T015 to T019. T021 depends on T020.
- T022 is interleaved: it runs after every TDD cycle, before the next begins.

### Parallel Opportunities

- **Phase 2:** the six test files.
- **Phase 3:** T012 and T013.
- **Phase 4:** T018 and T019, beside T015 to T017.

---

## Validation Plan

### Constitution-Defined Commands

These come from tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`; for the e2e specs also `npx tsc --noEmit -p tsconfig.e2e.json`
- End to end: `npm run test:e2e -- tests/e2e/startup-health.spec.ts tests/e2e/startup-refusal.spec.ts`. This needs Docker and `npx playwright install`. Report any exclusion.

The rest of the delivered e2e suite is not this story's validation. Specs that assert old paths are red from CAP-003-E3-S4 until CAP-003-E7-S7 (Other Notes).

### Story-Specific Validation

- **AC-1, DAC-E3-S6-1:** T005 is green.
- **AC-16, DAC-E3-7, DAC-E3-S6-7:** T002, T003 and T008 (c) are green.
- **AC-22, DAC-E3-10, DAC-E3-S6-2:** T006 is green.
  - By hand on the built app, `⌘K` on a Mac (or `Ctrl+K` elsewhere) opens the palette.
  - Inside the Coverage screen's symbol filter, the same key does not open it.
- **AC-23, DAC-E3-8:** T004 is green. T019 test 2 passes against the real stack.
- **AC-25 focus:** T008 (d) is green. By hand, clicking Settings in the rail moves focus to its `h1`, and typing in Coverage's filter keeps focus in the field.
- **AC-26, DAC-E3-S6-4, DAC-E3-S6-5:**
  - T009 and T010 are green.
  - By hand, run the built app at a 700 px viewport. The rail is a horizontal row above the content, and every rail item is reachable by Tab. At 1280 px the rail sits beside the content at 208 px.
  - `grep -nE '[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b' web/src/app/shell.tsx web/src/app/count-chip.tsx web/src/app/unreachable-state.tsx web/src/app/copy.ts` prints nothing.
- **DAC-E3-15:**
  - T007 is green.
  - `git diff --exit-code -- web/src/app/shell.tokens.test.tsx web/src/app/build-output.test.tsx` exits 0.
  - `grep -rnE "(app/|\./)status-region['\"]" web/src tests` prints nothing. It matches import and `vi.mock` specifiers only; T007 (a)'s `status-region.tsx"` path strings do not match.
- **DAC-E3-17:** T009 (b) is green.
- **DAC-E3-S6-3:** T007 (c) and (d) are green, and T018 and T019 pass.
- **DAC-E3-S6-6:** T003 (e) and T005 (f) are green.
- **Mutation:** run `python3 scripts/mutation-run.py run --command "npx vitest run web/src/app/count-chip.test.tsx web/src/app/shell.test.tsx web/src/app/shell.a11y.test.tsx web/src/app/shell.layout.test.tsx web/src/app/shell.unreachable.test.tsx && npx tsc --noEmit"`. It runs over `web/src/app/shell.tsx`, `count-chip.tsx`, `unreachable-state.tsx` and `copy.ts`, plus the hand-written mutants below, and must leave no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **The chip "through `StatusBadge`" (DAC-E3-S6-7) against the plain `badge` `status-warning` of owner-shell §2.7 and UX design §0.2.** This is backlog review v4 FINDING-4.
   - **Governing: the story criterion, read so that it also satisfies epic DAC-E3-7 and the design.**
     - CAP-003-E1-S5's plan keeps `StatusBadge({ tier, children: string })` (its T007).
     - So `<StatusBadge tier="warning">{count}</StatusBadge>` renders exactly the design's `badge` `status-warning`, with the warning triangle `aria-hidden` and the count as its text.
     - No `Status` union member is needed, so FINDING-4's premise does not hold under the planned API.
   - **Outcome.** T012 renders the chip this way, and T002 (f) proves it.
   - The unreachable section carries no tiered status, so the clause has nothing to apply to there. Coverage-matrix note 7 treats the same template clause this way. T004 (b) asserts that no status badge renders in it.
2. **"A value no artifact can determine goes through `NotDeterminable`" (DAC-E3-S6-7; TC-COMP-093 step 2, "render an undeterminable value").**
   - **Governing: ux-brief §12.4's shell row, normative design, and DAC-E3-S6-7 read as conditional.** That row fixes the chips' states:
     - *Loading*: "chips absent until the first attention answer";
     - *Unavailable*: "n/a";
     - *Error*: "no chip error of its own".
   - The unreachable state's never-answered line has its own designed copy, *Not yet answered since this page opened* (DAC-E3-8).
   - So no shell surface at this story holds a not-determinable value, and the clause has nothing to apply to. The test specification step is the lower authority.
   - **Outcome.** T003 (b) and T004 (b) assert that no `coverage-unknown` badge appears in any state.
3. **How the Home count is computed.** UX design §0.2 says "the length of the merged list computed by the same `sortAttention`".
   - **Governing: epic DAC-E3-7**, `deriveNeedsYou(attention, scores).length`.
   - `sortAttention` only orders, so the value is identical (register C3). The story's "`deriveNeedsYou` and `sortAttention` … (one call)" is satisfied by the one `deriveNeedsYou` call.
4. **TC-COMP-063 traces to AC-10; the story retraces DAC-E3-17 to AC-1 and system design constraint 14** (backlog review v3 FINDING-7). The criterion's text is the same. T009 (b) asserts the empty place either way.
5. **Owner-shell §2.10's latest-outcome assertion for `startup-health.spec.ts` against DAC-E3-S6-3.**
   - **Governing: the story criterion and its Description** ("added by E4-S6 and E5-S5", backlog review v2 FINDING-2), over the design table.
   - **Outcome.** T018 asserts the frame and the redirect URL only.
6. **The register's G4, G13 and G10** were closed by earlier plans: CAP-003-E3-S1, CAP-003-E3-S2 and CAP-003-E3-S3. G2 and G11 belong to CAP-003-E3-S5. None of them is reopened here.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0333.**
   - **What is undetermined.** DAC-E3-15 and owner-shell §2.1 delete `web/src/app/status-region.tsx`, and the story's validation requires `tsc`, `build` and `test` to pass. But 13 delivered files under `web/src/screens/` still import from it: 10 sources and 3 tests (T015's list). `research/stocks/index.tsx` imports its `UnreachableState`. DEC-0211 gives `web/src/screens/` to `owner-web-app`. No E3 or E7 story lists repointing these imports, and the story's file list excludes them.
   - **What the plan adopts (T013, T015).**
     - Each remaining importer's module specifier moves to `app/health` or `app/unreachable-state`. The delivered names are unchanged: CAP-003-E3-S2 copied them into `health.tsx`.
     - The new `UnreachableState` keeps the delivered export name, takes no props and keeps `data-testid="unreachable-state"`.
     - One test fixture gains `lastAnsweredAt`, a field `tsc` requires.
     - No other screen line changes.
   - **Derivation.**
     - The deletion is an acceptance criterion, and the suite must stay green. Repointing a specifier is the smallest edit that satisfies both.
     - CAP-003-E3-S2's plan already names this story as the one that repoints the importers (its Other Notes, *The two health providers coexist*).
     - CAP-003-E7-S1's plan already expects `Liveness` from `../../app/health`.
     - CAP-003-E3-S4's DEC-0327 set the precedent of minimal edits to delivered files to keep the suite green.
   - **Alternatives rejected.**
     - A re-export shim at `status-region.tsx`: it contradicts DAC-E3-15's deletion and TC-COMP-089.
     - Leaving the suite red until E7: it fails the story's validation.
     - Rewriting the screens' use of these values: that is E7's takeover, not this story's.
   - **Scope.** Propagating. CAP-003-E7-S1, CAP-003-E7-S2 and CAP-003-E7-S5 edit or remove these import lines. CAP-002's research files keep their behaviour with a new specifier.
   - **Owning design to absorb it:** owner-shell §2.1 and §2.10, and owner-web-app §2.1 (the import lines its files carry), at their next revision.
2. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0334.**
   - **What is undetermined.** UX design §0.1 and owner-shell §2.7 require a 16 px `lucide-react` stroke icon per rail item and name none. The epic Open Questions and owner-shell §14.2 leave the choice to "the implementing story's review".
   - **What the plan adopts (T009 (e), T014).** `RAIL_ICONS` in `shell.tsx`, keyed by destination path:
     - `/home`: `House`;
     - `/research`: `FlaskConical`;
     - `/data`: `Activity`;
     - `/settings`: `Settings`.

     All four are decided now. T009 (e) fails any destination added without an icon.
   - **Derivation.**
     - These are generic stroke glyphs from the approved package (DEC-0205).
     - `House` is lucide's name for the home glyph (`Home` is its alias).
     - `Settings` matches its label.
     - `FlaskConical` reads as research without colliding with the palette's search glyph.
     - `Activity` reads as health and is not a warning shape, so it cannot be confused with the chip's triangle (STD-UI-8).
     - Keying by path keeps owner-shell §2.6's pinned `Destination` shape (`group`, `label`, `to`, `count?`) unaltered (constraint 9a, additive).
   - **Alternatives rejected.**
     - An `icon` field on `Destination`: it alters a pinned shape.
     - Leaving `/home` and `/data` for later stories: it would push the same decision onto CAP-003-E5-S5 and CAP-003-E6-S7.
   - **Scope.** Propagating. CAP-003-E5-S5 and CAP-003-E6-S7 rely on the `/home` and `/data` entries.
   - **Owning design to absorb it:** owner-shell §2.7 and §14.2, and UX design §0.1, at their next revision.
3. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0335.**
   - **What is undetermined.** DAC-E3-7 and UX design §0.2 give the plural names (*Home, 4 items need you*; *Data health, 3 stocks with problems*) and the stale suffix *, as of {time}*. No artifact gives:
     - the singular forms;
     - the `{time}` format;
     - what the "one polite live region" says;
     - when a change counts as one.
   - **What the plan adopts (T002, T003, T011, T012).**
     - **Singulars.** *Home, 1 item needs you* and *Data health, 1 stock with problems*.
     - **Counts.** They render through `formatCount`.
     - **`{time}`.** `formatClock` of the last successful attention answer's `checkedAt`: `HH:MM:SS zone`, as in *as of 17:52:10 CDT*.
     - **Announcements.** The announcer says the item's new name when a known count changes between two readings. Several changes are joined with *; *.
     - **Zero.** A drop to zero says *Home, nothing needs you right now* or *Data health, nothing needs fixing*.
     - **No announcement** for the first known value, or for a stale marking with an unchanged count.
   - **Derivation.**
     - The singulars are English agreement on the given plurals.
     - `formatClock`: the *checked {time}* lines on Home and Data health "stand for" the chips (capability §5.4 STD-UI-25 specialization) and render `HH:MM:SS zone` (UX design §0.4). The stale time is the same instant, so it reads the same way.
     - The zero phrases reuse each destination's designed empty copy: Home's *Nothing needs you right now.* (S01 §7) and Data health's *Nothing needs fixing.* (ux-brief §12.4). So no new copy is invented.
     - Announcing the first value would make every page load speak, which "announced politely … without moving focus" does not ask for.
   - **Alternatives rejected.**
     - `formatInstant` with the date: it is longer, and it differs from the line that stands for the chip.
     - Silence at zero: "a changed count MUST be announced".
     - Announcing the bare count: it says nothing about which destination changed.
   - **Scope.** Propagating. CAP-003-E5-S5, CAP-003-E6-S7 and CAP-003-E3-S8's specs assert these names.
   - **Owning design to absorb it:** owner-shell §2.7 and UX design §0.2, at their next revision.
4. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0336.**
   - **What is undetermined.** DAC-E3-8, UX design §0.5 and ux-brief §6 require the unreachable state to be "announced once on entry and once on recovery". On entry the `role="status"` section itself announces. On recovery that section unmounts, and no artifact gives the mechanism or the words.
   - **What the plan adopts (T004 (d) and (f), T014).**
     - One visually hidden `role="status"` paragraph sits in the frame, outside the main region, so it survives the swap.
     - It holds *FactorFlow is answering again.* from an `unreachable` → `answering` transition until the next outage, which clears it.
     - It never speaks on the first answer.
   - **Derivation.**
     - The region must outlive the main region's swap to announce at all.
     - The sentence mirrors the designed heading *FactorFlow is not answering.* and uses none of the DAC-E7-3 terms.
     - Holding the text (rather than re-setting it) keeps it to one announcement per recovery.
   - **Alternatives rejected.**
     - Moving focus to the remounted screen's `h1`: AC-23 is not a route change, and stealing focus on a poll contradicts "never move focus".
     - Reusing the chip announcer: DAC-E3-7 reserves that one region for counts.
   - **Scope.** Contained in `shell.tsx` and `copy.ts`.
   - **Owning design to absorb it:** owner-shell §2.8 and UX design §0.5, at their next revision.
5. **PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0337.**
   - **What is undetermined.** Owner-shell §2.7 moves focus to "the routed screen's `h1` (rendered with `tabIndex={-1}`)" on route change. No artifact says:
     - what counts as a route change;
     - whether the first load moves focus;
     - how to wait for a lazily loaded screen (DEC-0328);
     - what to do with the delivered screens' `h1`s, which carry no `tabIndex` (`coverage/index.tsx:146`, `instruments/index.tsx:75`, `runs/index.tsx:121`, `runs/detail/index.tsx:139`, `settings/index.tsx:17`). Those screens are `owner-web-app`'s.
   - **What the plan adopts (T008 (d), T014).**
     - A change of `pathname`, not of `search` or `hash`, is a route change.
     - The first load does not move focus.
     - The shell waits for `main h1` with a `MutationObserver`.
     - It sets `tabindex="-1"` on that `h1` when absent, then focuses it.
   - **Derivation.**
     - Coverage's filter writes `?symbol=` as the owner types (DAC-E7-6). Treating a search change as a route change would pull focus out of the field on every keystroke.
     - Moving focus on the first load would skip the page's natural start.
     - Setting the attribute at runtime gives every delivered and CAP-002 screen the designed behaviour without editing screen files. A screen that already renders `tabIndex={-1}` is untouched.
   - **Alternatives rejected.**
     - Editing each screen's `h1`: crosses DEC-0211 for an attribute the shell can supply.
     - Focusing `main`: the design names the `h1`.
     - A timeout wait: a race against chunk loading.
   - **Scope.** Contained in `shell.tsx`. Screens may add `tabIndex={-1}` themselves later, with no change here.
   - **Owning design to absorb it:** owner-shell §2.7 and UX design §0.6, at their next revision.

### Other Notes

- **No chip renders at this story.** `DESTINATIONS` is Research and Settings (CAP-003-E3-S4), so the rail renders no chip until CAP-003-E5-S5 and CAP-003-E6-S7 add the counted entries. The chip is tested directly (T002, T003) and through `Rail`'s defaulted `destinations` prop (T005 (f), T008 (c)). `Shell` passes nothing.
- **`copy.ts`** is created because DAC-E3-S6-6 names "this component's `copy.ts`" as the source of the shell's labels, though owner-shell §2.1's placement does not list it. Destination labels stay in `destinations.ts` and titles in `titles.ts` (CAP-003-E3-S4). Both are this component's static copy.
- **`UNREACHABLE_MESSAGE` stays in `health.tsx`.** CAP-003-E3-S2 moved it there. The rendered state splits it into heading and cause (register C13), and T011's check keeps the two equal to it word for word.
- **jsdom and `contenteditable`.** jsdom does not implement `HTMLElement.isContentEditable`, so `isTextField` uses `closest('[contenteditable]:not([contenteditable="false"])')`. This works in the browser too, and covers a child of an editable element.
- **Platform hint.** `navigator.platform` is what the story names, so the plan uses it, although it is deprecated. It is read at render so tests can stub it.
- **The stock-evidence screen's unreachable state.** CAP-002's `research/stocks/index.tsx` renders `UnreachableState` when its own read fails with `ApiUnreachableError`. After T015 it renders the new card, with *Last answered* from `useHealth()`. Its delivered test asserts only the `testid` and that no `region` role renders. The card is a `div` and its section has an explicit `status` role, so the test passes.
- **Registered later.** `/` redirects to `/setup` or `/home`, which render the not-found state until CAP-003-E4-S6 and CAP-003-E5-S5 register them. T018 asserts URLs only, as DAC-E3-S6-3 and CAP-003-E3-S4's Other Notes say.
- **The e2e red window.** The delivered specs that assert `/runs/{uuid}` URLs or old labels stay red until CAP-003-E7-S7 (backlog review v4 FINDING-5). This story runs only its two startup specs.
- **Plan checks.**
  - T007 (b)'s importer scan matches import specifiers (`app/status-region"`), not prose, so a comment that mentions "the status region" does not trip it.
  - The AC-26 grep in the Validation Plan reads only this story's four new or rewritten sources.
  - `shell.tokens.test.tsx` reads comments too, so `shell.tsx` writes units with a space.
  - T009 (e)'s `width="16px"` is a test expectation in a test file, which the scans exclude.
- **Hand-written mutants** for the mutation run:
  - `web/src/app/count-chip.tsx`: `if (count <= 0) return null;` → `if (count < 0) return null;`, killed by T002 (c).
  - `web/src/app/count-chip.tsx`: `staleSince: last.checkedAt` → `staleSince: null`, killed by T002 (d).
  - `web/src/app/count-chip.tsx`: in `ChipAnnouncer`, a first known value announced (`previous === undefined ||` added to the change test), killed by T002 (e).
  - `web/src/app/unreachable-state.tsx`: `lastAnsweredAt` → `useHealth().lastUpdated`, killed by T004 (c).
  - `web/src/app/shell.tsx`: `isTextField(event.target)` → `false`, killed by T006 (a).
  - `web/src/app/shell.tsx`: `/^Mac/.test(navigator.platform)` → `true`, killed by T006 (f).
  - `web/src/app/shell.tsx`: `[location.pathname]` → `[location.key]` in the focus effect, killed by T008 (d).
  - `web/src/app/shell.tsx`: `group === "primary"` → `group === "data"` in the first list, killed by T005 (a).
  - `web/src/app/shell.tsx`: `<RecoveryAnnouncer />` set on `unknown → answering`, killed by T004 (g).
  - `web/src/components/token-literals.test.ts`: planted `web/src/app/planted.tsx` with `12px`, killed by T010 (b) and T017.
- **Equivalent-mutant risk.** Reordering `CommandPalette`, `Toaster` and `RecoveryAnnouncer` inside the frame is unobservable, because each is a portal or a hidden region. Record it as equivalent if the generator produces it.
