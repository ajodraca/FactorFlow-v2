---
artifact_schema_version: 1
artifact_id: CAP-003-ui-components-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-30T02:26:09Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-backlog
      version: "2"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# ui-components Component Test Specification

Component tests for `ui-components` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 34 cases (TC-COMP-001 to TC-COMP-034, not necessarily contiguous).

### TC-COMP-001: dataTileBadge takes the worse of verdict and score tier, tie to verdict

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-8, DAC-E1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- `dataTileBadge` from `web/src/components/patterns/worst-data-tier.ts` under test
- A verdict of warning *Mostly yes* and score states of each tier

#### Steps
1. Call `dataTileBadge(verdict=warning, scoreState=critical 'failed')`
2. Call with `scoreState=warning 'not_current'` (a tie)
3. Call with `scoreState` null, neutral `never_classified` and active `building`

#### Expected Result
- Critical score state wins with its own label *Score update failed*
- On a tie the verdict's label *Mostly yes* is returned
- Null, neutral and active score states leave the verdict's tier and label unchanged

#### Error / Edge Cases
- Verdict null: returns null for every score state (DAC-E1-3)

### TC-COMP-002: sortAttention orders by tier then newest first and is stable

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-9, AC-16, DAC-E1-7
**Priority:** P1
**Type:** functional

#### Preconditions
- Items of every tier with mixed `recordedAt` values, including equal keys

#### Steps
1. Call `sortAttention(items)`
2. Compare the result's order with the expected critical, serious, warning, good, neutral order with active beside good
3. Call twice on the same input

#### Expected Result
- Tiers in order; within a tier newest `recordedAt` first
- Equal keys keep their input order (stable)
- `sortAttention(deriveNeedsYou(...)).length` equals the count `owner-shell` and `home-ui` read

#### Error / Edge Cases
- Empty input: returns an empty list

### TC-COMP-003: tailwind.config.js gains only the vendored keys bound to existing tokens

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-11
**Priority:** P2
**Type:** functional

#### Preconditions
- `tailwind.config.js` after the change; `design-system/theme.css` tokens

#### Steps
1. Read the theme keys added to `tailwind.config.js`
2. Resolve each `hsl(var(--token) / <alpha-value>)` form against `theme.css`
3. Run the delivered `web/src/app/shell.tokens.test.tsx`

#### Expected Result
- Only `primary`, `primary-foreground`, `accent`, `accent-foreground`, `popover`, `popover-foreground`, `muted`, `ring`, `destructive`, `destructive-foreground`, `status-foreground`, `seq-1`, `borderRadius.DEFAULT` and `ringWidth.DEFAULT` are added
- Every key resolves to a token `theme.css` already defines
- `shell.tokens.test.tsx` passes

#### Error / Edge Cases
- A key naming an undefined token: the test fails naming it

### TC-COMP-004: Vendored sources use relative imports and lint as first-party code

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S1-1
**Priority:** P2
**Type:** functional

#### Preconditions
- The three vendored component sources copied into `web/src/components/ui/`

#### Steps
1. Grep the copied files for `@/` imports
2. Inspect `tsconfig.json` and `vite.config.ts` for a path alias
3. Run `npm run lint`

#### Expected Result
- No `@/` import remains; every import is a relative path
- No alias was added to either config
- Lint passes on the copied files

#### Error / Edge Cases
- A remaining `@/` import: build fails to resolve it

### TC-COMP-005: token-literals test rejects spacing, size and colour literals

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- `web/src/components/token-literals.test.ts` scanning `web/src/components/`

#### Steps
1. Run the test over the directory
2. Plant a `12px`, a `#fff`, an `rgb(` and an `hsl(` literal in a non-test `.tsx` file and re-run
3. Confirm the allow-list

#### Expected Result
- Passes on the vendored components as shipped
- Fails on each planted literal, naming the file
- Allows `0`, the `command` dialog's 560 px width and `web/src/app/layout.ts`, and exports the scanned-directory list

#### Error / Edge Cases
- A literal in a `*.test.tsx` file: ignored

### TC-COMP-006: button blocked stays focusable, aria-disabled and inert

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S1-3, DAC-E1-14, DAC-E1-15
**Priority:** P1
**Type:** functional

#### Preconditions
- `button` rendered with `blocked` and a reason

#### Steps
1. Tab to the button
2. Read its `aria-disabled` and `aria-describedby` target
3. Press Enter and Space and click it

#### Expected Result
- The button receives focus
- `aria-disabled="true"` and the description is the reason
- No handler fires

#### Error / Edge Cases
- `disabled` variant used where a precondition gates an action: rejected by review (DAC-E1-15)

### TC-COMP-007: badge variants resolve to status and coverage tokens

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S1-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `badge` rendered in each `status-<tier>` and `coverage-*` variant

#### Steps
1. Render each variant
2. Read the computed colour source class for each
3. Run `web/src/app/shell.tokens.test.tsx`

#### Expected Result
- Each variant's colour resolves to its `--status-*` or `--coverage-*` token through the new Tailwind keys
- `shell.tokens.test.tsx` passes

#### Error / Edge Cases
- A variant with no token: the tokens test fails

### TC-COMP-008: package.json adds exactly the five packages with licences

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S1-5, DAC-E1-12
**Priority:** P2
**Type:** functional

#### Preconditions
- `package.json` diff of the story

#### Steps
1. List the dependencies added
2. Check each carries its licence in the change
3. Run `web/src/api/render.test.tsx` with its glob widened to `web/src/components/`

#### Expected Result
- Exactly the five packages of the story, each with a recorded licence, nothing else
- `render.test.tsx` passes: no `dangerouslySetInnerHTML` under `web/src/components/`

#### Error / Edge Cases
- An extra package: the diff review fails the story

### TC-COMP-009: radio-group cards, select inline and checkbox keyboard contracts

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `radio-group` `cards`, `select` `inline` and `checkbox` rendered

#### Steps
1. Tab into the radio group and press ArrowDown
2. Open and close the select with the keyboard and read its roles
3. Focus the checkbox and press Space

#### Expected Result
- The group is one tab stop; arrows move the selection
- Select exposes `combobox` and `listbox` and opens and closes from the keyboard
- Checkbox toggles on Space

#### Error / Edge Cases
- Shift+Tab leaves the radio group as one stop

### TC-COMP-010: input numeric suffix in the name; form error linked and announced

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S2-2
**Priority:** P2
**Type:** functional

#### Preconditions
- `input` `numeric` with a suffix inside a `form` field with an error

#### Steps
1. Read the input's accessible name
2. Trigger the field error
3. Read `aria-describedby` and the live region

#### Expected Result
- The suffix is part of the accessible name
- The error element is referenced by `aria-describedby` and announced

#### Error / Edge Cases
- No error: `aria-describedby` references no error element

### TC-COMP-011: Six form components pass the literal scan; only seven packages added

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S2-3, DAC-E1-12
**Priority:** P2
**Type:** functional

#### Preconditions
- The six components of the story vendored

#### Steps
1. Run `token-literals.test.ts`
2. Diff `package.json`

#### Expected Result
- The scan passes over the six components
- Only the seven packages of the story are added, each with its licence

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-012: dialog confirm traps focus, Cancel first and focused, Esc restores focus

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S3-1, DAC-E1-14
**Priority:** P1
**Type:** functional

#### Preconditions
- `dialog` `confirm` opened from a trigger button

#### Steps
1. Read the dialog's role and `aria-modal`
2. Read the first control and `document.activeElement`
3. Tab around the dialog, then press Esc

#### Expected Result
- `role="dialog"` with `aria-modal`; focus is trapped
- **Cancel** is the first control and focused
- Esc closes it and focus returns to the trigger

#### Error / Edge Cases
- Click outside: focus stays trapped (Radix AlertDialog)

### TC-COMP-013: toast error and warning persist, never take focus, announce politely

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S3-2
**Priority:** P2
**Type:** functional

#### Preconditions
- `toast()` raised with `error`, `warning` and `success`

#### Steps
1. Raise each variant
2. Wait past sonner's default duration
3. Read `document.activeElement` and the live region politeness

#### Expected Result
- `error` and `warning` persist until dismissed; `success` dismisses on the default
- Focus never moves to a toast
- Announced politely

#### Error / Edge Cases
- Dismiss control: reachable by keyboard

### TC-COMP-014: progress indeterminate has no valuenow; determinate exposes range

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S3-3, DAC-E1-14
**Priority:** P2
**Type:** functional

#### Preconditions
- `progress` rendered `indeterminate` and `determinate` with props

#### Steps
1. Query the `progressbar` role in each
2. Read `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and the label

#### Expected Result
- Indeterminate carries no `aria-valuenow`
- Determinate carries `aria-valuenow`, `aria-valuemin` 0, `aria-valuemax` from props, labelled by its visible text

#### Error / Edge Cases
- `total` null passed by a caller: indeterminate

### TC-COMP-015: command dialog labelled, loops, focuses input, renders caller empty copy

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S3-4, DAC-E1-14
**Priority:** P2
**Type:** functional

#### Preconditions
- `command` opened with a caller's empty wording

#### Steps
1. Read the dialog's accessible name
2. Read the `loop` prop and `document.activeElement`
3. Type text matching nothing

#### Expected Result
- Labelled *Search FactorFlow*
- `loop` set; the input has focus
- `CommandEmpty` renders the caller's wording

#### Error / Edge Cases
- Esc: closes and restores focus (DAC-E1-14)

### TC-COMP-016: Five overlay components pass the scan with one allowed literal

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S3-5, DAC-E1-12
**Priority:** P2
**Type:** functional

#### Preconditions
- The five components of the story vendored

#### Steps
1. Run `token-literals.test.ts`
2. Diff `package.json`

#### Expected Result
- Passes with the `command` 560 px width as the one allowed literal
- Only the five packages of the story are added with their licences

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-017: data-table virtualised windows 3000 rows and appends keyset pages

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `data-table` `virtualised` with 3000 rows and a keyset page source

#### Steps
1. Render and count DOM rows
2. Scroll to the next window
3. Append a keyset page

#### Expected Result
- Only the windowed rows plus CAP-001's overscan are in the DOM
- Scrolling renders the next window
- Appending does not re-render earlier rows

#### Error / Edge Cases
- Fewer rows than the window: all rendered

### TC-COMP-018: data-table headers, history row header and expandable expander semantics

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S4-2
**Priority:** P2
**Type:** functional

#### Preconditions
- `data-table` in each variant with a sorted column

#### Steps
1. Query `columnheader` roles and `aria-sort`
2. In `history`, read the first cell's role
3. In `expandable`, activate the expander and read `aria-expanded`

#### Expected Result
- Headers are programmatic; the sorted column carries `aria-sort`
- The history variant's first cell is the row header
- The expander is a button named for its row and toggles `aria-expanded`

#### Error / Edge Cases
- Unsorted columns: no `aria-sort`

### TC-COMP-019: data-table passes the scan, row height from token, one package added

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S4-3, DAC-E1-12
**Priority:** P2
**Type:** functional

#### Preconditions
- `data-table` vendored

#### Steps
1. Run `token-literals.test.ts`
2. Read the resolved row height
3. Diff `package.json`

#### Expected Result
- Scan passes; row height resolves to `--row-height`
- Only `@tanstack/react-table` is added with its licence

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-020: tierOf and labelOf are exhaustive over the Status union

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-20, DAC-E1-S5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `tiers.ts` with its exhaustive `switch` and `never` default

#### Steps
1. Add a new kind to the `Status` union in a type-check fixture without a row
2. Run `npx tsc --noEmit`

#### Expected Result
- Type-check fails on `tierOf` and `labelOf`, so no status can render without a tier

#### Error / Edge Cases
- Row added: type-check passes

### TC-COMP-021: tiers.test asserts every UX brief 12.2 row by input, label and tier

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-12, AC-20, DAC-E1-S5-2, DAC-E1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `web/src/components/patterns/tiers.test.ts`

#### Steps
1. Run the test
2. Confirm it enumerates download, result, score, check and credential rows

#### Expected Result
- Every DAC-E1-1 row asserted: `requested`/`running`/`cancelling` *Queued*/*Downloading*/*Stopping*; `succeeded`/`partial`/`failed` *Complete*/*Partial*/*Failed*; `cancelled`/`abandoned` *Cancelled by you*/*Interrupted*; results; scores; checks `ok` labelled by the caller's check; credential *Found*/*Missing*
- `partial` is never good and `cancelled` never critical

#### Error / Edge Cases
- A row missing from the test: the audit flags it

### TC-COMP-022: StatusBadge: label in name, shape aria-hidden, shapes unique

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-20, DAC-E1-S5-3, DAC-E1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- `status-badge.test.tsx` rendering each tier

#### Steps
1. Render each tier
2. Read the accessible name and the icon's `aria-hidden`
3. Collect the shapes

#### Expected Result
- Label is in the accessible name; shape is `aria-hidden`
- No two tiers share a shape (hollow circle, ringed dot, filled circle, triangle, diamond, square)

#### Error / Edge Cases
- Greyscale rendering: tiers stay distinguishable by shape

### TC-COMP-023: formatInstant zones CDT/CST, optional seconds, session dates unshifted

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S6-1, DAC-E1-9
**Priority:** P2
**Type:** functional

#### Preconditions
- An instant in October and one in January; a `2026-03-08` session date

#### Steps
1. Call `formatInstant` on each, with and without `{ seconds: true }`
2. Call `formatSessionDate('2026-03-08')`

#### Expected Result
- October renders *CDT*, January *CST*; seconds only when asked
- The session date renders unshifted

#### Error / Edge Cases
- A locale format is never used (built from `Intl.DateTimeFormat` parts)

### TC-COMP-024: formatCount separators; formatDownloadName falls back to requested_at

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-25, DAC-E1-S6-2, DAC-E1-9
**Priority:** P2
**Type:** functional

#### Preconditions
- `formatCount` and `formatDownloadName`

#### Steps
1. Call `formatCount(1236)`
2. Call `formatDownloadName` on a download with `started_at` null

#### Expected Result
- *1,236*
- *Download {YYYY-MM-DD HH:MM zone}* from `requested_at`

#### Error / Edge Cases
- `started_at` set: it is used over `requested_at`

### TC-COMP-025: NotDeterminable carries its reason and the coverage-unknown badge

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-8, AC-24, DAC-E1-S6-3, DAC-E1-8
**Priority:** P1
**Type:** functional

#### Preconditions
- `NotDeterminable` rendered with a reason

#### Steps
1. Read the accessible description
2. Read the badge variant

#### Expected Result
- The reason is in the accessible description
- Badge is `coverage-unknown`, never `status-good`

#### Error / Edge Cases
- `Absent`: em dash with hidden words, never `0` (DAC-E1-8)

### TC-COMP-026: worst-data-tier.test covers every DAC-E1-4 row and the null cases

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-11, AC-21, DAC-E1-S7-1, DAC-E1-3, DAC-E1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- `web/src/components/patterns/worst-data-tier.test.ts`

#### Steps
1. Run the test
2. Confirm its cases

#### Expected Result
- Covers good *Yes* (0 affected), warning *Mostly yes*, critical *No* at `affectedCount >= followedCount > 0`, critical with *, and the last download failed.*, serious with *, and the last download was interrupted.*
- A `cancelled` or `partial` latest terminal download contributes no tier
- `dataTileBadge` over a null verdict returns null for `failed` and `not_current` score states

#### Error / Edge Cases
- `latestTerminalDownload` null with affected 3: null, never *Yes* (DAC-E1-3)

### TC-COMP-027: TIER_ORDER is one exported constant shared by sortAttention

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-11, DAC-E1-S7-2
**Priority:** P2
**Type:** functional

#### Preconditions
- `worst-data-tier.ts` and `needs-you.ts` sources

#### Steps
1. Grep for the tier order definition
2. Check `sortAttention`'s import

#### Expected Result
- Exactly one exported `TIER_ORDER` constant; `sortAttention` imports it

#### Error / Edge Cases
- A second order literal: review rejects it

### TC-COMP-028: deriveNeedsYou targets per kind and runId only for download kinds

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-9, DAC-E1-S8-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Attention and summary fixtures producing each of the six kinds

#### Steps
1. Call `deriveNeedsYou` for each kind
2. Read `target` and `runId`

#### Expected Result
- `/data` for `data_problems` and `score_failed`; `/data/downloads/{runId}` for `download_not_complete`, `first_download`, `first_scores`; `/settings` for `credential_missing`
- `runId` set only for the three download-bound kinds

#### Error / Edge Cases
- No user-visible string is returned (DAC-E1-6)

### TC-COMP-029: deriveNeedsYou under summary error, 404 and building

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-7, AC-9, DAC-E1-S8-2, DAC-E1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Attention with the three server items; summary in `error`, `not_served` and served states

#### Steps
1. Call with summary `error`
2. Call with summary served, `later.state` `building`, `never_classified` true
3. Call with summary `not_served` and `latest_terminal_download` null

#### Expected Result
- Error: no score-derived item, the three server items present
- Building: `first_scores` present and `first_download` absent
- 404 before any download ended: `first_download` present; `first_scores` and `score_failed` absent

#### Error / Edge Cases
- 404 after a download ended: no `first_download`

### TC-COMP-030: needs-you-item renders hidden severity tile, tag badge and one outline link

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-9, AC-20, DAC-E1-S8-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `needs-you-item.tsx` rendered with an item

#### Steps
1. Read the severity tile's `aria-hidden`
2. Read the tag badge
3. Count the action slot's children

#### Expected Result
- Tile is `aria-hidden`; tag badge carries the tier in words through `StatusBadge`
- Exactly one link styled `button` `outline`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-031: StateRegion renders each of the eight states with distinct empties

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-24, DAC-E1-S9-1, DAC-E1-10
**Priority:** P1
**Type:** functional

#### Preconditions
- `state-region.test.tsx` with one renderer per `ScreenState` kind

#### Steps
1. Render each kind
2. Compare `empty-never-populated` and `empty-no-match` copy
3. Render the error and activate **Try again**

#### Expected Result
- Each kind renders its renderer
- The two empty states render different copy
- Error renders operation, reason and **Try again** wired to the caller's retry

#### Error / Edge Cases
- Unreachable kind: left to the shell (DAC-E1-10)

### TC-COMP-032: StateRegion refuses an omitted renderer without notApplicable

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-24, DAC-E1-S9-2, DAC-E1-10
**Priority:** P2
**Type:** functional

#### Preconditions
- A `// @ts-expect-error` case in `state-region.test.tsx`

#### Steps
1. Run `npx tsc --noEmit`

#### Expected Result
- The call omitting a renderer and its `{ notApplicable }` reason fails to type-check

#### Error / Edge Cases
- With the reason: type-checks

### TC-COMP-033: AsOfLine joins parts with a middle dot in one paragraph

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S10-1, DAC-E1-13
**Priority:** P2
**Type:** functional

#### Preconditions
- `AsOfLine` rendered with three parts

#### Steps
1. Read the rendered `p`
2. Read the separators and their spacing

#### Expected Result
- One `p` with parts joined by *·* and `--space-2` either side; read as one line by a screen reader

#### Error / Edge Cases
- One part: no separator

### TC-COMP-034: CAP-002 Research as-of line keeps passing its delivered tests

**Scope:** component
**Component(s):** ui-components
**Traces to:** AC-26, DAC-E1-S10-2, DAC-E1-13
**Priority:** P1
**Type:** functional

#### Preconditions
- CAP-002's `as-of-line.test.tsx` after the generalisation

#### Steps
1. Run the delivered test file unchanged

#### Expected Result
- Every case passes; the Research line composes `AsOfLine`

#### Error / Edge Cases
- None beyond the scenario
