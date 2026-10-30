---
artifact_schema_version: 1
artifact_id: CAP-003-command-palette-tests
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

# command-palette Component Test Specification

Component tests for `command-palette` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 7 cases (TC-COMP-062 to TC-COMP-086, not necessarily contiguous).

### TC-COMP-062: Palette hint, empty, first-8 and per-group error states

**Scope:** component
**Component(s):** command-palette
**Traces to:** AC-24, DAC-E3-12
**Priority:** P1
**Type:** functional

#### Preconditions
- Palette rendered with the stock search and universes reads mocked

#### Steps
1. Open without typing
2. Type text matching nothing
3. Answer the stock search with `next_cursor` set
4. Fail the stock search, then the universes read
5. Open with health unreachable

#### Expected Result
- An `aria-disabled` hint row before typing
- `CommandEmpty` *No stocks or pages match "{text}".*
- *Showing the first 8. Keep typing to narrow.* row
- *Couldn't search followed stocks: {reason}.* / *Couldn't read universes: {reason}.* leave the other groups usable
- Palette still opens and Pages stays usable

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-081: Stock search debounces 250 ms and aborts the stale request

**Scope:** component
**Component(s):** command-palette
**Traces to:** AC-22, AC-27, DAC-E3-S5-1, DAC-E3-11
**Priority:** P1
**Type:** functional

#### Preconditions
- `useStockSearch` with fake timers and `fetch` mocked

#### Steps
1. Type *K* then *KO* within 250 ms
2. Advance past the debounce

#### Expected Result
- One request with `symbol=KO&lifecycle=active&limit=8`
- An earlier in-flight request is aborted so a stale answer never overwrites a newer one

#### Error / Edge Cases
- Clearing the text: no request

### TC-COMP-082: Universes group only while research routes are registered

**Scope:** component
**Component(s):** command-palette
**Traces to:** AC-22, AC-27, DAC-E3-S5-2, DAC-E3-11
**Priority:** P2
**Type:** functional

#### Preconditions
- Palette with `RESEARCH_REGISTERED` false, then true

#### Steps
1. Open the palette and count universes requests
2. Repeat with it true and type

#### Expected Result
- False: no universes request, no Universes group
- True: one request per open; the group filtered locally

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-083: Closing the palette restores focus and discards typed text

**Scope:** component
**Component(s):** command-palette
**Traces to:** AC-25, DAC-E3-S5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- Palette opened from a focused element

#### Steps
1. Type text and press Esc
2. Reopen
3. Open, choose an item

#### Expected Result
- Focus returns to the previously focused element; nothing typed is kept
- Choosing an item closes and restores focus likewise

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-084: Literal scan widened to web/src/app/command-palette/

**Scope:** component
**Component(s):** command-palette
**Traces to:** AC-26, DAC-E3-S5-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/app/command-palette/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- The `command` 560 px width stays allowed

### TC-COMP-085: Palette groups, rows, hint, empty and error states use the display vocabulary

**Scope:** component
**Component(s):** command-palette
**Traces to:** AC-19, DAC-E3-S5-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Palette rendered in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-086: Palette renders no status badge; one-tier rule recorded not applicable

**Scope:** component
**Component(s):** command-palette
**Traces to:** AC-20, DAC-E3-S5-6
**Priority:** P2
**Type:** functional

#### Preconditions
- Palette rendered with stocks, universes and pages

#### Steps
1. Search the rendered rows for any `StatusBadge` or tier colour
2. Read the story's not-applicable record

#### Expected Result
- No status is rendered; the one-tier rule applies vacuously and is recorded as not applicable; stale and unavailable states recorded not applicable per command-palette 2.4
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario
