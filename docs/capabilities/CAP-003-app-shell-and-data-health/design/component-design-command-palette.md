---
artifact_schema_version: 1
artifact_id: CAP-003-component-design-command-palette
artifact_type: component-design
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
ai_provenance:
  agent_id: design-decomposition-agent
  agent_version: "1.1"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-25T02:50:00Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: PRODUCT-UX
      version: "6"
    - id: tech-stack
      version: "6"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Component: Command Palette

**Status:** draft
**Capability:** CAP-003
**Owner:** Alvaro de Jodra
**Last Updated:** 2026-10-25

This design was produced in an unattended `$design-run`. It applies DEC-0205
and DEC-0207 without re-deciding them; decisions live under
`projects/factorflow-v2/decisions/` in the harness repository. Positions
resting on a decision are marked **PROVISIONAL**. It records no decision of
its own.

## 1. Overview

`command-palette` is the `command` `dialog` the shell opens from `⌘K` or
`Ctrl+K` and from the top bar's *Search* opener, on every route. It finds
followed stocks (searched on the server by symbol prefix), universes (when
CAP-002's routes are registered) and pages (the shipped rail destinations and
the three `/data` sub-pages), and every item navigates. It never offers an
action, and in particular never one that places or stops trading (AC-22;
blueprint §3.4, §10; DEC-0207, PROVISIONAL).

Use cases addressed: jump to a followed stock, a universe or a page from
anywhere (capability flow 4, step 4; AC-22).

Support matrix: as the shell. Dependencies: `ui-components`' `command`
(cmdk inside Radix Dialog, PROVISIONAL per DEC-0205); the delivered
`listInstruments` in `web/src/api/client.ts`; `classification-api`'s
`GET /api/universes` as published; `owner-shell`'s `DESTINATIONS`.

## 2. Design Details

### 2.1 Placement

```
web/src/app/command-palette/index.tsx          <CommandPalette open onOpenChange />
web/src/app/command-palette/use-stock-search.ts debounced server search, at most 8
web/src/app/command-palette/universes.ts        fetchActiveUniverses(): GET /api/universes?lifecycle=active
web/src/app/command-palette/pages.ts            pages from DESTINATIONS plus /data sub-pages
web/src/app/command-palette/targets.ts          stockTarget(symbol), universeTarget(id) (DEC-0207)
web/src/app/command-palette/copy.ts             every owner-facing string
web/src/app/command-palette/command-palette.test.tsx
web/src/app/command-palette/use-stock-search.test.ts
tests/e2e/command-palette.spec.ts
```

All new. The shell owns the listener and the opener; this component owns the
dialog and its contents (system design §4.2 *Palette dialog*).

### 2.2 Search flow

The sequence shows one search from opening to navigation. The actors are the
owner, the shell, this dialog, the instruments endpoint and the universes
endpoint. The decision points are whether the owner has typed anything,
whether CAP-002's routes are registered (which decides both whether the
Universes group exists and where a stock opens), and whether a read fails.
The outcome is a navigation to the chosen stock, universe or page, with the
dialog closed and focus returned, and never a mutation.

```mermaid
sequenceDiagram
    autonumber
    participant O as Owner
    participant SH as owner-shell
    participant CP as command-palette
    participant INS as GET /api/instruments
    participant UNI as GET /api/universes

    O->>SH: Cmd+K / Ctrl+K outside a text field, or Search
    SH->>CP: open = true
    opt research routes registered
        CP->>UNI: lifecycle=active (once per open)
    end
    CP-->>O: input focused; Stocks hint row; Pages listed; Universes when read
    O->>CP: types "KO"
    CP-->>O: Stocks: Searching...
    CP->>INS: symbol=KO&lifecycle=active&limit=8 (after 250 ms without typing)
    alt answers
        INS-->>CP: up to 8 instruments
        CP-->>O: KO, KOF ...; Pages and Universes filtered locally
    else fails
        CP-->>O: Stocks: Couldn't search followed stocks: {reason}. Pages and Universes stay usable
    end
    O->>CP: Enter on an item
    CP->>SH: navigate(target); open = false; focus back to the opener
```

### 2.3 Groups and targets (DEC-0207, PROVISIONAL)

| Group | Items | Source | Target |
|-------|-------|--------|--------|
| *Stocks* | followed stocks whose symbol starts with the typed text, at most 8, each its symbol | `listInstruments({ symbol: prefix, lifecycle: "active", limit: 8 })`, debounced 250 ms, `shouldFilter={false}` on this group | `/research/stocks/{symbol}` while the research routes are registered, else `/data/coverage?symbol={symbol}` |
| *Universes* | active universes by name, filtered locally | `GET /api/universes?lifecycle=active`, once per open | `/research/universes/{id}` |
| *Pages* | the shipped destinations plus *Coverage*, *Followed stocks*, *Downloads*, filtered locally | `DESTINATIONS` and the three `/data` sub-pages | the route |

"Registered" is read from one constant the shell exports beside
`DESTINATIONS` (`RESEARCH_REGISTERED`, true exactly when the Research entry is
in the list), so the palette never detects routes at run time (DEC-0204). The
universes fetch lives here rather than in CAP-002's client so the palette
works whichever capability lands first; it uses the delivered `requestJson`
(exported per DEC-0211). There is no Actions group in M1 (blueprint §10).

### 2.4 States (UX design 1.1)

| State | Rendering |
|-------|-----------|
| Loading | Stocks: `Command.Loading` *Searching…* while a search runs; Universes: its heading appears when the read answers |
| Empty, never populated | Before typing: one `aria-disabled` hint row *Type a symbol to find a followed stock*; Pages lists every shipped page |
| Empty, nothing found | `CommandEmpty` *No stocks or pages match "{text}".* |
| Partial | When the server reports more than 8 matches, a last `aria-disabled` row *Showing the first 8. Keep typing to narrow.* |
| Stale | Not applicable: stocks are re-read per settled keystroke, universes once per open |
| Unavailable | Not applicable: no check runs here |
| Error | *Couldn't search followed stocks: {reason}.* in the Stocks group; *Couldn't read universes: {reason}.* in the Universes group; the other groups stay usable |
| Unreachable | The palette still opens; Stocks and Universes say they cannot search; Pages stays usable |

"More than 8" is known from the delivered response's `next_cursor` being
non-null.

### 2.5 Messages

N/A, not applicable for this component.

## 3. Constraints and Assumptions

- **Navigation only** (AC-22): no item mutates; no trading action exists or
  is reserved (constraint 14).
- **Server search for stocks** because the followed list reaches 3000
  (STD-UI-30); local filtering for pages and universes, which are few.
- **The `command` spec is the contract**: dialog label *Search FactorFlow*,
  `loop` set, `CommandEmpty` wording naming the groups searched (UX design
  0.8 records the label as a departure from the brief).
- **No company name in M1.** The delivered `GET /api/instruments` rows carry
  `instrument_id`, `symbol` and `lifecycle` and no name (`web/src/api/types.ts`
  `Instrument`), so a stock item shows its symbol alone; UX design 1.1 shows
  the name only "where the followed list holds one", and it holds none. The
  symbol filter is the delivered prefix match.

## 4. Security

- Typed text reaches the server only as the `symbol` query parameter, which
  the delivered route normalises and validates (SEC-INP-001).
- No storage; nothing typed is kept after the dialog closes.
- No `dangerouslySetInnerHTML`; every label renders as text.

## 5. Scalability and Performance

- One request per settled keystroke (250 ms debounce), at most 8 rows; an
  in-flight search is aborted with `AbortController` when the text changes,
  so a stale answer never overwrites a newer one.
- One universes read per open.

## 6. Upgrade

- New component. When the research routes are registered, the Universes group
  appears and stock targets switch to the evidence page in the same change.
- Later capabilities add Strategies and an Actions group (blueprint §3.4); M1
  reserves nothing for them.

## 7. Testing

| Test | File | What it proves |
|------|------|----------------|
| Opens and closes | `web/src/app/command-palette/command-palette.test.tsx` | Focus in the input on open; `Esc` closes and restores focus to the opener (AC-22; STD-UI-24) |
| Groups | `web/src/app/command-palette/command-palette.test.tsx` | Stocks, Universes (only when registered) and Pages in that order; no Actions group; no item names trading |
| Targets | `web/src/app/command-palette/command-palette.test.tsx` | A stock opens `/data/coverage?symbol=KO` without research routes and `/research/stocks/KO` with them (DEC-0207) |
| Search mechanics | `web/src/app/command-palette/use-stock-search.test.ts` | Debounce 250 ms; abort on new text; `limit=8`, `lifecycle=active`; *Showing the first 8* when `next_cursor` is set |
| States | `web/src/app/command-palette/command-palette.test.tsx` | Hint row before typing; `CommandEmpty` wording; per-group errors leave other groups usable (AC-24) |
| Keyboard journey | `tests/e2e/command-palette.spec.ts` | From two screens, `Ctrl+K`, type a symbol, `Enter` lands on the target; from a text field the shortcut types instead (AC-22, AC-25) |

## 8. Acceptance Criteria

1. The palette opens from the keyboard and from the top bar on every route
   and returns focus on close.
2. It finds followed stocks by symbol prefix, universes when registered, and
   the shipped pages.
3. Every item navigates; none places or stops trading or changes any state.
4. A failed stock search names the operation and reason and leaves Pages
   usable.

## 9. Workflows

Capability flow 4, step 4: the owner presses the shortcut, types part of a
symbol or a page name and jumps there. It intersects every screen, since it
opens from all of them.

## 10. UX / GUI

From UX design §1.1.

**Layout.** A `command` `dialog` centred at the 560 px width the vendored
component ships, overlay `--foreground` at 40%. `CommandInput` with the
placeholder *Jump to a stock or page* and the accessible label *Search
FactorFlow*; `CommandList` holding `CommandGroup` *Stocks*, `CommandGroup`
*Universes* (only while CAP-002's universes routes are registered),
`CommandGroup` *Pages*, separated by `CommandSeparator`; `CommandEmpty` when
no group has an item. Each item shows its primary text (symbol, universe
name, page name) at `--text-base`; a page item adds a hint at `--text-xs`
`--muted-foreground`, its route group (*Data health › Coverage*). Stock items
carry no hint in M1 because the followed list holds no company name.

**Component mapping.**

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| The palette | `command` | `dialog` | `design-system/components/command/design-spec.md` |
| Loading row | `command` `Command.Loading` | *Searching…* | `design-system/components/command/design-spec.md` §4 |
| Opener (owned by the shell) | `button` | `outline` | `design-system/components/button/design-spec.md` |

**Interaction.** `ArrowDown` and `ArrowUp` move and wrap (`loop`); `Enter`
runs the active item; `Esc` closes; pointer hover activates and click
selects.

**Tokens.** `--popover` / `--popover-foreground`; `--accent` /
`--accent-foreground` for the active item; `--muted-foreground` at
`--text-xs` for headings, hints and the shortcut; overlay `--foreground` at
40%; `--radius` (command spec §6).

**Accessibility.** cmdk's combobox and listbox inside Radix Dialog, which
traps focus and restores it; the dialog labelled *Search FactorFlow*; group
headings announced; the empty state and error rows are text; the hint and
*Showing the first 8* rows are `aria-disabled` and skipped by arrow
navigation.

**Internationalization.** None.

## 11. API Endpoints

Consumed only; none exposed.

| Endpoint | Method/Operation | Auth/Privilege | Request | Response | Notes |
|----------|-----------------|----------------|---------|----------|-------|
| `/api/instruments` | GET | none, loopback | `symbol` prefix, `lifecycle=active`, `limit=8` | instruments, `next_cursor` | `ingestion-api`, unchanged |
| `/api/universes` | GET | none, loopback | `lifecycle=active` | names and ids | `classification-api`, as published; only when registered |

## 12. References

| Type | Document Name | Description | Link |
|------|---------------|-------------|------|
| UX design | CAP-003 v1 | §1.1 Command palette, §0.8 label departure | `docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-design.md` |
| System design | CAP-003 v1 | §3.5, §4.2 *Palette dialog* | `docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md` |
| Design system | `command` spec | Interaction, labelling, empty state | `design-system/components/command/design-spec.md` |
| Blueprint | PRODUCT-UX v6 | §3.4 palette, §10 M1 groups | `docs/ux/product-ux-blueprint.md` |
| Decisions | DEC-0204, DEC-0205, DEC-0207, DEC-0211 | Registration, packages, groups and targets, `requestJson` export | `projects/factorflow-v2/decisions/` (harness repository) |

## 13. Traceability

| Capability AC | System Design Element | Component Design Element | Section |
|--------------|----------------------|--------------------------|---------|
| AC-22 | `command-palette`; no trading action | Three groups, navigation-only items | 2.3, 3 |
| AC-24 | States per region | Palette states table | 2.4 |
| AC-25 | Keyboard | cmdk keyboard contract; e2e journey | 7, 10 |
| AC-26 | Built from `ui-components` | `command` `dialog` | 10 |
| AC-27 | Research routes unchanged | Universe and stock targets into `/research` when registered | 2.3 |

## 14. Open Questions

1. **The universes read's `lifecycle` filter.** The palette relies on
   `classification-api` accepting `lifecycle=active` as system design §4.2
   records; if CAP-002 delivers it otherwise, the palette filters locally.
   *Owner: CAP-002's owner. Blocks: nothing in M1 until research routes are
   registered.*
