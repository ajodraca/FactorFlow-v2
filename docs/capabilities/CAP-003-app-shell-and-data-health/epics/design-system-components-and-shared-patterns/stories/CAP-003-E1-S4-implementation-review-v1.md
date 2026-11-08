---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T19:02:12Z"
reviewed_head: "8e74983541bf32f9a91c32fe54b9c4f05b075bf5"
review_base: "0795a6c7d69dedc3bc3895e1d2510ff0840b0cca"
reviewed_state_revision: "sha256:d509dc9c44e25680e7ef5a01b703739299e294b084b7da932a9c5adf117d2a93"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-003-E1-S4
    artifact_version: 1
    content_revision: sha256:3f21f7ed9f0122a3d7b79bd3b893662e8e880731b813e20f3e5f71e6e915e730
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:02:12Z
  source_artifacts:
    - id: CAP-003-E1-S4
      version: "1 (sha256:3f21f7ed9f0122a3d7b79bd3b893662e8e880731b813e20f3e5f71e6e915e730)"
    - id: CAP-003-E1-S4-tasks
      version: "1 (draft, updated 2026-11-06)"
    - id: CAP-003-E1-S4-tdd-evidence
      version: "cycle-1 and cycle-2"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: design-system/components/data-table/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: DEC-0215
      version: "applied"
    - id: DEC-0306
      version: "applied (owner upheld)"
    - id: DEC-0307
      version: "applied (owner upheld)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 4 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 3/6 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 15/15 passed |

This is an initial review, so every finding has scope `initial`.

The production code does what the story asks. `web/src/components/ui/data-table.tsx` vendors one
controlled `DataTable` on `@tanstack/react-table` 8.21.3 (MIT, the one package added) with the
four variants, the props of DEC-0307 and the windowing of DEC-0306. The window arithmetic is
correct, and the reviewer killed every mutant on it. The reviewer also killed every mutant on
`aria-sort`, the sort cycle, the history row header, the expander's name, `aria-expanded`,
`aria-controls`, the polite live region, `busy`, the prefetch guard and the "append without
re-rendering" memo. All 15 required validation checks pass. They include the full suite (95
files, 2367 tests) before and after `npm ci`, lint, format, `tsc`, build, the TDD-evidence lint
and seven story-specific checks.

The gate fails on test strength. The reviewer ran 91 mutants: the 59 catalogue mutants and 32 of
its own over `data-table.tsx`. The 32 include the plan's five applicable hand-written mutants.
71 are killed, 2 time out (detected) and 18 survive. None of the 18 is equivalent. Each changes
something the task plan, DEC-0306 or the data-table spec fixes:

- **IR-001.** The windowed rows' `aria-rowindex` after a scroll, and the memo's `index` and
  `columns` checks, are not pinned.
- **IR-002.** The mapping that attaches an open expansion's measured height to its row's index
  is not pinned.
- **IR-003.** The scroller's `overflow-y-auto` is not pinned, and neither are the 24 px sort and
  expander targets or the hidden *Details* header. Without the overflow, the `virtualised` table
  never scrolls in a browser.
- **IR-004.** Ten spec section 6 token classes that the plan fixes are not pinned. They cover
  the text size, separators, header colour, cell padding, hover and the sticky header
  background.

IR-005 (MEDIUM) is a production weakness the reviewer confirmed with a probe test in a scratch
clone. An expanded row ignores a changed `renderExpansion`. So the detail that the delivered
Coverage pattern loads into caller state stays at its first render.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S4-run-20261108T150357Z` |
| HEAD | `8e74983541bf32f9a91c32fe54b9c4f05b075bf5` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` (the driver's integration branch, passed as `--base-ref`), merge base `0795a6c7d69dedc3bc3895e1d2510ff0840b0cca`; ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. This report and its mutation file are the only files the reviewer adds |
| Changed files reviewed | 81 against the review base (77 added, 4 modified) in one commit, `8e74983` |
| Baseline | none: initial review |

State check: `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — story is ready for
independent review`. Without `--base-ref` it reports `BLOCKED`, because the TDD-evidence lint
against the remote default branch sees sibling stories' commits. The supervised driver supplies
the integration branch, so the ref check is the one that applies.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/ui/data-table.tsx` | added (415 lines) | DAC-E1-S4-1, DAC-E1-S4-2, DAC-E1-S4-3, AC-25, AC-26; T008-T011 |
| `web/src/components/ui/data-table.test.tsx` | added (775 lines) | TC-COMP-017, TC-COMP-018, TC-COMP-019; T002-T006 |
| `package.json` | modified (+1 line, `@tanstack/react-table` `^8.21.3`) | DAC-E1-S4-3, DAC-E1-12; T007 |
| `package-lock.json` | modified (+34 lines: `@tanstack/react-table` and transitive `@tanstack/table-core` 8.21.3, both `license: MIT`) | DAC-E1-S4-3; T007 |
| `.../stories/CAP-003-E1-S4.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S4-tasks.md` | modified (T001-T014 ticked; no other text changed) | bookkeeping |
| `.../stories/CAP-003-E1-S4-tdd-evidence.yaml` | added | T014 |
| `.../stories/CAP-003-E1-S4-evidence/cycle-1.patch`, `cycle-2.patch` | added | T014 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S4-evidence/red-cycle-1-packages.log`, `red-cycle-2-data-table.log` | added | T014 (`red_log`) |
| `.../stories/CAP-003-E1-S4-evidence/mutation-cycle-2-results.json` | added | T014 (`mutation:`) |
| `.../stories/CAP-003-E1-S4-evidence/mutation-cycle-2-results-logs/*.log` | added (69 files) | T014 (mutant and baseline logs) |

No file outside the plan's ownership list (Story-Specific Validation, *Ownership*) and the TDD
evidence changed. `coverage-table.tsx`, `results-window.ts`, `tailwind.config.js`,
`design-system/`, `tsconfig.json`, `vite.config.ts`, `web/src/app` and `web/src/api` are
unchanged (`git diff --exit-code` exit 0).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-26 | PARTIAL | Every class in `data-table.tsx` is a token class or `var(--…)` arbitrary value. Examples are `text-sm` (l.325), `border-border` (l.149, 191, 331), `text-muted-foreground` (l.318), `px-[var(--cell-padding-x)] py-[var(--cell-padding-y)]` (l.142, 318), `hover:bg-muted` (l.149), `bg-background` (l.331) and `font-numeric` (l.176, 184, 349). The scroller height is `calc(var(--row-height) * 16)` (l.409) | `data-table.test.tsx:148-171` (h-row, config, theme), `:634-656` (numeric classes), `:666-684` (sticky, scroller height); `token-literals.test.ts` passes | The rows' `h-row` and the numeric classes are pinned. Ten spec section 6 token classes the plan fixes can be deleted with every test green (IR-004) |
| AC-25 | PARTIAL | The sort control is the vendored `Button` (l.352-365) when `getCanSort()`. The expander is a `Button` named `Expand {getRowLabel}` with `aria-expanded` and `aria-controls` (l.153-162). The scroller has `tabIndex={0}` (l.407) and `overflow-y-auto` (l.408) | `data-table.test.tsx:209-234` (Tab, Enter cycle), `:293-316` (Tab, Enter, Space, focus kept), `:561-569` (scroller tab stop) | Keyboard reach and names are pinned. The scroller's `overflow-y-auto` is not, so the arrow and page keys that AC-25's scroller relies on would scroll nothing (IR-003) |
| DAC-E1-12 | SATISFIED | No length or colour literal in `data-table.tsx`. The reviewer's grep (plan Story-Specific Validation) prints nothing. `package.json` gains only `@tanstack/react-table`, which tech stack v7 Key Libraries confirms | `token-literals.test.ts`; `data-table.test.tsx:143-146` (scanned), `:173-187` (one MIT package, no virtualisation library) | Catalogue and plan mutants on the package entry are killed |
| DAC-E1-S4-1 | PARTIAL | `windowFor` (l.46-80): 15 + 10 rows of overscan, spacer heights, extra heights of open expansions. Measured row height (l.265-273). Prefetch at `end + 20 >= rowCount` once per loaded key (l.303-315). Memo by record identity (l.208-216). The DOM holds 25 rows at the top and 35 mid-list | `data-table.test.tsx:349-423` (TC-COMP-017), `:426-500` and `:602-631` (`windowFor`), `:520-599` (paging, expansion), `:707-774` (measuring) | Window counts, spacers, prefetch, append-without-re-render and measured height are pinned. Not pinned: position after scroll and memo invalidation (IR-001), the expansion-height index mapping (IR-002), and the overflow that makes scrolling possible (IR-003) |
| DAC-E1-S4-2 | SATISFIED | `<th scope="col">` headers, with `aria-sort` only when `getIsSorted()` (l.343-349). `history` forces `rowHeader` (l.230), which renders `<th scope="row">` for the first data cell (l.168-181). The expander `Button` has `aria-expanded` (l.153-160) | `data-table.test.tsx:192-207`, `:236-291`, `:293-316`, `:318-327` (TC-COMP-018) | Every catalogue and reviewer mutant on these lines is killed: `aria-sort` swap, history forcing, `defaultColumn`, `enableSorting`, `sortDescFirst`, `enableMultiSort`, label, `aria-controls` and `aria-live` |
| DAC-E1-S4-3 | SATISFIED | Header and body rows carry `h-row` (l.149, 331), which resolves to `var(--row-height)` (`tailwind.config.js` `height.row`). `package.json` has one added line. The lockfile licence is MIT, and the reviewer read `node_modules/@tanstack/react-table/LICENSE` (MIT, Tanner Linsley) | `data-table.test.tsx:148-187` (TC-COMP-019); `token-literals.test.ts`; `vendoring.test.ts` | The plan's `h-row` → `h-8` mutant is killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `utils.ts`, `button.tsx` (`ghost`), `token-literals.test.ts` (`SCANNED_DIRECTORIES`), `vendoring.test.ts` and `lucide-react` are all present at the base. Evidence cycle-1 records the baseline as 94 files and 2280 tests | The current suite is 95 files and 2367 tests, which is that baseline plus this file's 87 |
| T002 | complete | VERIFIED | `data-table.test.tsx:141-188` (`// Implements TC-COMP-019`) | Steps 1 to 3 as planned. The test is weak on token classes (IR-004) |
| T003 | complete | VERIFIED | `data-table.test.tsx:190-328` (`// Implements TC-COMP-018`): (a) to (f) | (e) as planned (Tab, Enter, Space, focus, `aria-controls`, `aria-live`) |
| T004 | complete | VERIFIED | `data-table.test.tsx:330-424` (`// Implements TC-COMP-017`): cases (1) to (5) and the 37-row sweep | Literals as planned. `aria-rowindex` is asserted only in the first window (IR-001) |
| T005 | complete | VERIFIED | `data-table.test.tsx:426-500`, plus edges at `:602-631` | Every planned case, each against an independent literal. Every catalogue mutant in `windowFor` is killed, or times out (detected) |
| T006 | complete | VERIFIED | `data-table.test.tsx:502-600`: (a) to (e), plus two tests for the loaded key | (d) clicks the expander where the plan says `{Enter}` (IR-008). The id-to-index mapping is not pinned (IR-002) |
| T007 | complete | VERIFIED | `package.json:24`; `package-lock.json` entries for `@tanstack/react-table` and `@tanstack/table-core` 8.21.3, both MIT | The licence was verified by the reviewer as well. `npm ci` reinstalls 308 packages. Its 10 audit advisories involve no `@tanstack` package |
| T008 | complete | VERIFIED | `data-table.tsx:16-80`: the three constants with DEC-0306 doc comments, `VisibleWindow`, `windowFor` | `topOf` counts extras at indexes `< i`. Binary search for the last top `<= scrollTop`. NaN, negative and zero-height inputs fall back to the top window |
| T009 | complete | VERIFIED | `data-table.tsx:82-119` (augmentation, `DataTableProps`), `:228-251` (`useReactTable`), `:317-375` (headers), `:142-188` (cells, row header) | Deviation: `manualSorting: true` is not set. The reviewer confirmed it is inert: TanStack 8.21.3 reads it only when a sorted row model is wired (`table-core` `index.esm.js:2740`), and none is. Recorded only in the TDD evidence (IR-007) |
| T010 | complete | VERIFIED | `data-table.tsx:151-196` (expander, detail row), `:237`, `:249-250` (state, `getRowCanExpand`), `:333-337` (*Details* header) | Deviation: `autoResetExpanded: false` is not set. It is inert: `_autoResetExpanded` is called only from the grouped row model (`index.esm.js:3377`), which is not wired. `colSpan` is `columns.length + 1`, not the visible column count (IR-007) |
| T011 | complete | VERIFIED | `data-table.tsx:258-315` (scroll state, measurement, window, prefetch), `:376-395` (spacers), `:400-414` (scroller), `:208-216` (memo) | Deviations: heights are re-measured in a layout effect on every render, not "when the loaded row count changes from 0" and not in a ref callback. The prefetch is keyed by first row id and count, not count alone; that is justified by a re-sort with as many rows, and tested at `:529-548`. The memo comparator is the plan's own (IR-005) |
| T012 | complete | VERIFIED | Reviewer run: the full suite including `token-literals`, `vendoring`, `render.test`, `shell.tokens` and every coverage test. `git diff` of `package.json` and of the delivered paths | One `dependencies` line added; `devDependencies` unchanged; delivered files unchanged |
| T013 | complete | VERIFIED | Reviewer run: lint, format, `tsc`, build all exit 0 | Matches plan |
| T014 | complete | VERIFIED | `CAP-003-E1-S4-tdd-evidence.yaml`: two cycles, both `APPROVED`, no drift, `commit_hash: stage`. The lint passes with `--require-logs` | Deviation: the plan's cycles 2 to 5 are one cycle, recorded in the evidence header. Because one stage commit carries every cycle and every cycle edits the same two files, `--staged` fingerprints would be cumulative and could not be replayed in order. The cycle-2 RED is the missing module (IR-007) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `TC-COMP-019 …` (`data-table.test.tsx:141-188`) / TC-COMP-019 | WEAK | Proves the scan covers the file, every header and body row has `h-row` (no `h-[`), `height.row` is `var(--row-height)`, `theme.css` declares it, and one MIT package with no virtualisation library. Kills `h-row` → `h-8` and the package mutants | Ten plan-fixed spec token classes, the scroller overflow, the 24 px targets and the `sr-only` header can each be deleted with every test green (IR-003, IR-004) |
| `TC-COMP-018 …` (`:190-328`) / TC-COMP-018 | ADEQUATE | Role queries and `user-event` for each variant. Proves the `columnheader` count and names, `aria-sort` only on the sorted column, the asc → desc → unsorted cycle (including the numeric column), no control without a handler or on an unsortable column, the history row header (forced), the compact row header on request, the expander name, `aria-expanded`, `aria-controls` → the detail row, `aria-live`, focus kept, and `aria-busy` | None in its scope. Every mutant on these lines is killed |
| `TC-COMP-017 …` (`:330-424`) / TC-COMP-017 | WEAK | Proves 25 rows, `aria-rowcount` 3001, the first row's `aria-rowindex` 2, and spacer heights at the top. Then 35 rows and spacers mid-list, a measured 40 px row height, an append that re-renders only the new rows, all rows when there are fewer than the window, and at most 37 rows across a sweep | `aria-rowindex` is never read after a scroll. Rows whose index or `columns` change are never shown to re-render (IR-001). The scroller overflow is unpinned (IR-003) |
| `windowFor` (`:426-500`, `:602-631`) / T005 | ADEQUATE | Independent literals for top, middle, no layout, negative and NaN, short, empty, an expansion above, at and below the window, past the end, 1 px rows and an out-of-range extra | None: every catalogue mutant is killed or times out |
| `virtualised paging, keyboard and expansion` (`:502-600`) / T006 | WEAK | Proves the prefetch boundary at rows 4 and 5, re-asking after a replacement, holding back while busy or with no more rows, the scroller's tab stop and lack of a name, expansion kept across an append, and a collapsed height dropped | The open expansion's height can be credited to the next row with every test green (IR-002). (d) clicks instead of pressing `{Enter}`, and its `act()` wrapper prints a React warning (IR-008) |
| `data-table classes and structure` (`:633-705`) | ADEQUATE for what it asserts | Numeric alignment on headers, cells and the row header; `colSpan` 4; sticky `top-0` and scroller only on `virtualised`; no expander column without expansion; single-column sort with Shift | Does not assert the other plan-fixed classes (IR-004) |
| `virtualised measuring` (`:707-774`) | ADEQUATE | Zero-height layout, an empty table first, the last height kept when a later measure is zero, 1 px rows and spacers, and an expansion kept in the offsets once out of the window | None beyond IR-002 |

Isolation and determinism: `afterEach` restores mocks and clears `renders`. No timers, network or
storage. `getBoundingClientRect` is stubbed per test because jsdom has no layout, which the plan
anticipates. Fixtures are built per test, so record identity is controlled.

Mutation run (reviewer, `review` cycle, all changed production lines). Results:
`CAP-003-E1-S4-implementation-review-v1-mutation.json`, sha256
`1280a9d8d2a44857aa83e4882d3adcb50832622a2d4a6b286228f289ee2d1933`. The command runs the
focused suites `components/ui/data-table`, `components/token-literals` and
`components/ui/vendoring` (125 tests), then `npx tsc --noEmit`.

| Mutant | Scope | State | Disposition |
|--------|-------|-------|-------------|
| 59 catalogue mutants (`off-by-one`, `negate-boolean`, `drop-defaulted-argument`) | initial | 57 killed, 2 timeout | Both timeouts are infinite loops in the binary search (`:67 while (low <= high)`, `:68 / 3`). A hang counts as detected. The evidence called `:266:negate-boolean:1` and `:301:drop-defaulted-argument:1` equivalent; here `tsc` kills both (TS18047, TS2322) |
| `manual:r1` memo compares `Row` objects (plan) | initial | killed | — |
| `manual:r2` body row `h-row` → `h-8` (plan) | initial | killed | — |
| `manual:r3` `aria-sort` mapping swapped | initial | killed | — |
| `manual:r4` memo drops `a.index === b.index` | initial | **survived** | Not equivalent. T011 fixes the comparator. A caller that removes a row by filtering the same objects (unfollowing in Followed stocks) leaves later rows' `aria-rowindex` one too high (IR-001) |
| `manual:r5` memo drops `a.columns === b.columns` | initial | **survived** | Not equivalent. T011 and plan Other Notes, *Stable inputs*, fix it. New `columns` would not reach rendered rows (IR-001) |
| `manual:r6` memo drops `a.expanded === b.expanded` | initial | killed | — |
| `manual:r7` `index={offset}` (window-relative) | initial | **survived** | Not equivalent. T011 sets `aria-rowindex={index + 2}` on every data row, and plan Other Notes say `aria-rowindex` keeps the size announced while windowed. After scrolling to row 1000, row `S0990` would announce 2 instead of 992. A reviewer probe confirms that the code under review gives 992 (IR-001) |
| `manual:r8` extra-height change ignored when the open set is unchanged | initial | killed | — |
| `manual:r9` `next.set(index + 1, extra)` | initial | **survived** | Not equivalent. DEC-0306 adds an open expansion's height "to the offsets of the rows after it". T005 defines the key as the expanded row's own index (IR-002) |
| `manual:r10` `enableSorting: true` | initial | killed | — |
| `manual:r11` `aria-live="off"` | initial | killed | — |
| `manual:r12` fire `onEndReached` on every render | initial | killed | — |
| `manual:r13` collapsed heights kept | initial | killed | — |
| `manual:r14` row height measured from the header row | initial | killed | — |
| `manual:r15` loaded key is the count only | initial | killed | — |
| `manual:r16` `aria-controls` dropped | initial | killed | — |
| `manual:r17` expander label uses the row id | initial | killed | — |
| `manual:r18` expansion row not marked for measurement | initial | killed | — |
| `manual:r19` table loses `text-sm` | initial | **survived** | Not equivalent. T009 fixes `w-full caption-bottom text-sm`; spec section 6 sets dense body text to `--text-sm` (IR-004) |
| `manual:r20` header row loses `border-b border-border` | initial | **survived** | Not equivalent. T009; spec section 6: header separators are `--border` (IR-004) |
| `manual:r21` header cells lose `text-muted-foreground` | initial | **survived** | Not equivalent. T009; spec section 6: header text is `--muted-foreground` (IR-004) |
| `manual:r22` header cells lose the cell padding tokens | initial | **survived** | Not equivalent. T009; spec section 6: `--cell-padding-x`/`-y` (IR-004) |
| `manual:r23` body rows lose `hover:bg-muted` | initial | **survived** | Not equivalent. T009; spec section 6: row hover is `--muted` (IR-004) |
| `manual:r24` body rows lose `border-b border-border` | initial | **survived** | Not equivalent. T009; spec section 6 (IR-004) |
| `manual:r25` body cells lose the cell padding tokens | initial | **survived** | Not equivalent. T009 ("cells … with the header's padding classes"); spec section 6 (IR-004) |
| `manual:r26` sort `Button` loses `h-5` | initial | **survived** | Not equivalent. T009 sets the target to `--space-5`, the 24 by 24 px minimum of spec section 5. Plan Other Notes say the size keeps the row at `--row-height` (IR-003) |
| `manual:r27` expander loses `h-5 w-5` | initial | **survived** | Not equivalent. T010 `h-5 w-5 p-0`. Without it the target is the 16 px icon, under the 24 px minimum (IR-003) |
| `manual:r28` *Details* header loses `sr-only` | initial | **survived** | Not equivalent. T010: "visually hidden text *Details* (`sr-only`)" (IR-003) |
| `manual:r29` sticky header loses `bg-background` | initial | **survived** | Not equivalent. T011 `sticky top-0 bg-background`. Without it, rows show through the header as they scroll beneath it (IR-004) |
| `manual:r30` row header loses `font-medium` | initial | **survived** | Not equivalent. T009: the row header has "the same classes plus `text-left font-medium`" (IR-004) |
| `manual:r31` detail row loses `border-b border-border` | initial | **survived** | Not equivalent. T010 `className="border-b border-border"` (IR-004) |
| `manual:r32` scroller loses `overflow-y-auto` | initial | **survived** | Not equivalent. T011 fixes `className="overflow-y-auto"`. Without it, the fixed-height scroller overflows instead of scrolling, so in a browser no `scroll` event fires and the window never advances (IR-003) |

The plan lists six hand-written mutants. Five are run as `r1`, `r2` and catalogue `:246:negate-boolean:1`,
`:309:off-by-one:1` and `:230:negate-boolean:2`, and all five are killed. The sixth, on
`autoResetExpanded: false`, has no line to mutate (T010 deviation).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | Skill prerequisite gate, not counted among the 15 required checks; all eight checks passed |
| `npm run test -- src/components/ui/data-table.test.tsx` | component root | 0 | PASS | Narrowest story suite first: 1 file, 87 tests. One React `act()` warning from `keeps an expansion open across an appended page` (IR-008) |
| `npm run test` | component root | 0 | PASS | 95 files, 2367 tests, before and again after `npm ci`. The only `data-table` stderr block is the IR-008 warning |
| `npm run lint` | component root | 0 | PASS | Biome: 214 files, no findings (before and after `npm ci`) |
| `npm run format` | component root | 0 | PASS | Biome: 214 files, no changes (before and after `npm ci`) |
| `npx tsc --noEmit` | component root | 0 | PASS | No output, before and after `npm ci` |
| `npm run build` | component root | 0 | PASS | 102 modules; no screen imports `data-table` yet. Writes only ignored files under `src/factorflow/api/static/` |
| `npm ci` | component root | 0 | PASS | 308 packages. 10 audit advisories (`vite`, `vitest`, `esbuild`, `react-router`, and others), none in `@tanstack`. Run after the mutation run, because every mutation clone links this `node_modules` |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 0795a6c7… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `grep -nE "\b[0-9]+(\.[0-9]+)?(px\|rem\|em\|vh\|vw)\b\|#[0-9a-fA-F]{3,8}\b" web/src/components/ui/data-table.tsx` | component root | 1 | PASS | Prints nothing (DAC-E1-S4-3 story-specific check) |
| `grep -n "react-virtual\|react-window\|react-virtuoso" package.json` | component root | 1 | PASS | Prints nothing (DEC-0215) |
| `git diff 0795a6c7..HEAD -U0 -- package.json` | component root | 0 | PASS | Exactly one added line, `"@tanstack/react-table": "^8.21.3",` in `dependencies` |
| `git diff --exit-code 0795a6c7..HEAD -- web/src/screens tailwind.config.js design-system tsconfig.json vite.config.ts web/src/app web/src/api` | component root | 0 | PASS | Delivered files unchanged |
| `git diff 0795a6c7..HEAD --stat -- . ':!docs'` | component root | 0 | PASS | Only `package.json`, `package-lock.json`, `data-table.tsx`, `data-table.test.tsx` (ownership check) |
| DOM sweep at rows 0, 500, 1500 and 2990 (`data-table.test.tsx:416-423`) | component root | 0 | PASS | At most 37 `tbody tr`, part of the suite run |
| `node_modules/@tanstack/react-table/LICENSE` read | component root | N/A | PASS | MIT License, Copyright (c) 2016 Tanner Linsley; `package.json` `"license": "MIT"` |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 0795a6c7..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 59 catalogue mutants; the reviewer appended 32 manual mutants (`old`/`new`) |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 300 --work-root <scratch>/work --logs <scratch>/results-logs --command 'cd {workdir} && ln -sfn <component>/node_modules node_modules && npx vitest run components/ui/data-table components/token-literals components/ui/vendoring && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 3 | N/A | 91 mutants: 71 killed, 18 survived, 2 timeout. The four baselines pass (exit 0). The exit code reports the survivors; the table above lists them |
| Reviewer probe in a scratch clone of `8e74983` (`web/src/components/ui/probe.test.tsx`, never in the review subject) | scratch clone | 1 | N/A | 3 probes. The `aria-rowindex` after a scroll is 992 (correct), and an expansion's grown height is re-measured on re-render (correct). A `renderExpansion` reading caller state stays at `"Loading gap dates"` after that state changes (IR-005) |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |

### Validation Side Effects

- Before: HEAD `8e74983`, clean working tree, `reviewed_state_revision`
  `sha256:d509dc9c44e25680e7ef5a01b703739299e294b084b7da932a9c5adf117d2a93`.
- After: HEAD `8e74983`, clean working tree, the same `code-revision` fingerprint.
- Unexpected tracked-file changes: none.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - The mutation run worked in clones under the reviewer's scratch directory. Its results are copied beside this report as `CAP-003-E1-S4-implementation-review-v1-mutation.json`.

## Findings

CRITICAL 0 · HIGH 4 · MEDIUM 1 · LOW 3 · **total 8**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | initial | Windowed `aria-rowindex` after a scroll, and memo invalidation on `index` and `columns`, are unpinned |
| IR-002 | HIGH | initial | Attaching an open expansion's height to its own row's index is unpinned |
| IR-003 | HIGH | initial | The scroller's overflow, the 24 px sort and expander targets and the hidden *Details* header are unpinned |
| IR-004 | HIGH | initial | Ten spec section 6 token classes the plan fixes are unpinned |
| IR-005 | MEDIUM | initial | An expanded row ignores a changed `renderExpansion`, so caller-held detail state never reaches it |
| IR-006 | LOW | initial | `aria-rowcount` states the loaded count while more pages exist |
| IR-007 | LOW | initial | Plan deviations are recorded only in the TDD evidence, not reconciled with the ticked tasks |
| IR-008 | LOW | initial | The append-expansion test prints a React `act()` warning and clicks where the plan says `{Enter}` |

### IR-001 — Windowed `aria-rowindex` after a scroll, and memo invalidation on `index` and `columns`, are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-1, AC-25
- **Tasks**: T004, T011
- **Files**: `web/src/components/ui/data-table.tsx:148` (`aria-rowindex`), `:384` (`index={visible.start + offset}`), `:208-216` (memo comparator); `web/src/components/ui/data-table.test.tsx:349-406`
- **Claim challenged**: TC-COMP-017 and T011 pin the windowed row contract: "every data row `aria-rowindex={index + 2}`", and a memo that compares `row.original`, `expanded`, `index`, `columns` and `rowHeader`.
- **Observed evidence**: Three mutants survive the focused suites and `tsc`:
  - `manual:r7` passes the window offset as `index`, so `aria-rowindex` restarts at 2 in every window.
  - `manual:r4` drops `a.index === b.index`.
  - `manual:r5` drops `a.columns === b.columns`.

  The only `aria-rowindex` assertion reads the first row of the first window (`:357`), where offset and index agree. No test changes a row's index or the `columns` identity while keeping the same records. A probe confirms that the code under review is correct: after scrolling to row 1000, row `S0990` has `aria-rowindex="992"`.
- **Expected evidence/behavior**: T011 sets `aria-rowindex={index + 2}`, with `index` as the row's position in the loaded list, and specifies the memo comparator in full. Plan Other Notes say `aria-rowcount`/`aria-rowindex` "keep the table's size announced while windowed". *Stable inputs* names `index` and `columns` among the inputs whose change re-renders a row.
- **Impact**: A regression to window-relative numbering would make every windowed row past the first window announce the wrong position. A comparator that drops `index` would leave stale positions once a caller filters a row out of `data`, as unfollowing in Followed stocks (CAP-003-E7-S3) would. A comparator that drops `columns` would freeze cells against a new column set. No test would fail in any of these cases.
- **Required remediation**: Add assertions that fail for `r7`, `r4` and `r5`: `aria-rowindex` of the first rendered row after a scroll; a rerender with one record removed (same objects) that checks later rows' `aria-rowindex`; and a rerender with a new `columns` array whose cell output differs, checking the body cells. Record them under T004 or T006.

### IR-002 — Attaching an open expansion's height to its own row's index is unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-1
- **Tasks**: T006, T011
- **Files**: `web/src/components/ui/data-table.tsx:284-290` (`next.set(index, extra)`); `web/src/components/ui/data-table.test.tsx:571-599`, `:757-774`
- **Claim challenged**: T006 and the measuring tests prove that windowing with per-row expansion follows DEC-0306.
- **Observed evidence**: `manual:r9` credits the measured height to `index + 1` and survives. The component-level expansion tests place the expanded row (index 3) far above the window, where crediting row 4 instead gives the same window (`S0037`, `S0040`). `windowFor`'s own tests take `extraHeights` directly, so they never exercise the id-to-index mapping.
- **Expected evidence/behavior**: DEC-0306 adds open expansion heights "to the offsets of later rows", that is, of the rows after the expanded one. T005 defines `extraHeights` as "row index → measured height of that row's open expansion".
- **Impact**: With an off-by-one mapping, the window is one row late when the scroll position falls inside an open expansion. An expansion on the last loaded row would also drop out of the bottom spacer, because index `rowCount` is ignored, so the scroll height would be short by the detail's height. No test would fail.
- **Required remediation**: Add a component-level case that tells the expanded row from its successor. For example, expand a mid-list row, scroll to a position inside its detail, and assert the first rendered id. Or expand the last loaded row and assert the bottom spacer.

### IR-003 — The scroller's overflow, the 24 px sort and expander targets and the hidden *Details* header are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-25, DAC-E1-S4-1, AC-26
- **Tasks**: T002, T009, T010, T011
- **Files**: `web/src/components/ui/data-table.tsx:408` (`overflow-y-auto`), `:354` (`h-5 gap-1 px-1 py-0`), `:155` (`h-5 w-5 p-0`), `:335` (`sr-only`)
- **Claim challenged**: TC-COMP-019 and the structure tests pin the classes T009 to T011 fix.
- **Observed evidence**: `manual:r32` (no `overflow-y-auto`), `manual:r26` (sort button without `h-5`), `manual:r27` (expander without `h-5 w-5`) and `manual:r28` (*Details* visible) all survive. The test at `:666-684` asserts the scroller's height style, not its overflow, and no test reads the button classes or the `sr-only` span.
- **Expected evidence/behavior**:
  - T011: `<div data-slot="data-table-scroller" tabIndex={0} className="overflow-y-auto" …>`. The code's own comment ties the scroller to AC-25 ("a keyboard user scrolls the window with the arrow and page keys").
  - T009 and T010: the sort and expander targets are `--space-5`, "the 24 by 24 px minimum the spec sets" (data-table spec section 5). Plan Other Notes say these sizes keep the row at `--row-height`.
  - T010: the expander column header is "visually hidden text *Details* (`sr-only`)".
- **Impact**: Without `overflow-y-auto`, the fixed-height scroller overflows instead of scrolling. In a browser no `scroll` event fires, so the `virtualised` table never moves past its first 25 rows, by mouse or by keyboard. The jsdom tests set `scrollTop` and fire `scroll` by hand, so they stay green. Without the size classes, the expander target shrinks to the 16 px icon, and the sort button grows the row past `--row-height`.
- **Required remediation**: Assert `overflow-y-auto` on the scroller, the `h-5` (and `w-5`) classes on the sort and expander buttons, and `sr-only` on the *Details* header text, so each of `r26`, `r27`, `r28` and `r32` fails.

### IR-004 — Ten spec section 6 token classes the plan fixes are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T002, T009, T010, T011
- **Files**: `web/src/components/ui/data-table.tsx:325` (`text-sm`), `:331` (header separator, `bg-background`), `:318` (`text-muted-foreground`, header padding), `:149` (`border-b border-border hover:bg-muted`), `:142` (cell padding), `:175` (`font-medium`), `:191` (detail separator)
- **Claim challenged**: TC-COMP-019 proves the table consumes the theme tokens data-table spec section 6 lists. That is the AC-26 half of TC-COMP-019.
- **Observed evidence**: Ten class-removal mutants survive: `r19` (`text-sm`), `r20` (header `border-b border-border`), `r21` (`text-muted-foreground`), `r22` (header padding), `r23` (`hover:bg-muted`), `r24` (row `border-b border-border`), `r25` (cell padding), `r29` (sticky `bg-background`), `r30` (row header `font-medium`) and `r31` (detail row separator). Of the classes in the file, the tests pin only `h-row`, `text-right font-numeric`, `sticky top-0` and the scroller height.
- **Expected evidence/behavior**: T009 to T011 give each of these classes literally. Data-table spec section 6 assigns the tokens behind them: `--border` for separators, `--muted-foreground` for header text, `--muted` for hover, `--cell-padding-x`/`-y`, and `--text-sm` for dense body text. AC-26 requires the surface to consume them. The precedent is CAP-003-E1-S3 v1 IR-003, which raised the same gap at HIGH and saw it closed.
- **Impact**: Any of these token bindings can be removed with every test green. The vendored table then drifts from the design system that E6-S4 and E7-S2 to E7-S5 consume.
- **Required remediation**: Assert the plan's classes on the table, the header row and cells, the body rows and cells, the row header, the detail row and the sticky header, so each surviving class mutant fails. Matching against the planned class strings is enough.

### IR-005 — An expanded row ignores a changed `renderExpansion`, so caller-held detail state never reaches it

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion of this story is incomplete; DEC-0306 and DEC-0307 consumers)
- **Tasks**: T010, T011
- **Files**: `web/src/components/ui/data-table.tsx:201-216` (memo comparator and its doc comment), `:233-235` (a new `expansion` object every render)
- **Claim challenged**: The memo keeps earlier rows from re-rendering on an appended page without breaking the expansion contract of DEC-0307: "`renderExpansion` plus `getRowLabel` turn on per-row expansion … its detail content is announced politely".
- **Observed evidence**: The comparator does not compare `expansion`, and the doc comment accepts that "a row shows the closures it last rendered with". A probe in a scratch clone of `8e74983` used a host that holds loaded detail text in its own state and renders it from `renderExpansion`, which is the delivered Coverage pattern. After expanding *Stock 1* and updating that state, the detail row still read `"Loading gap dates"`. The delivered `coverage-table.tsx:60-61, 109-116, 140-141` keeps the gap-dates cache in the parent and passes it into the row. DEC-0306's derivation keeps that behaviour unchanged for CAP-003-E7-S2 ("gap dates fetched once per row").
- **Expected evidence/behavior**: A row's `aria-live` detail updates when the content its caller renders changes. A polite live region is useful only if its content can change after the row opens. Otherwise the contract must state, and the types should steer, that `renderExpansion` has to return a self-updating component.
- **Impact**: A consumer that ports Coverage's loading, loaded and error detail directly will show a detail stuck at its first render, with no test to catch it. The plan's comparator caused this, which is why it does not block this gate. CAP-003-E7-S2 and CAP-003-E7-S3 build on this seam.
- **Required remediation**: Make an expanded row re-render when `renderExpansion` (and `getRowLabel`) change. One way is to compare them for expanded rows only, which keeps collapsed rows memoised. Pin it with a test like the probe, and amend T011's comparator text to match. Alternatively, record an owner-approved contract that `renderExpansion` must be stable, in DEC-0307's owning design, and keep the doc comment.

### IR-006 — `aria-rowcount` states the loaded count while more pages exist

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/ui/data-table.tsx:324`
- **Claim challenged**: `aria-rowcount={rowCount + 1}` "keep[s] the table's size announced while windowed (the CAP-002 precedent)" (plan Other Notes).
- **Observed evidence**: `rowCount` is the loaded row count. With `hasMore` true, a 3000-row Coverage list paged in fifties announces 51, then 101, and so on. The CAP-002 precedent announces the server's total (`results-table.tsx:701`, `matchCount + 1`). `DataTable` has no total-count prop.
- **Expected evidence/behavior**: WAI-ARIA 1.2 `aria-rowcount`: "If the total number of rows is unknown, authors MUST set the value of aria-rowcount to -1."
- **Impact**: Screen-reader users hear a table size that is wrong while pages remain. This behaviour is what T011 prescribes, so it is LOW.
- **Required remediation**: Set `-1` while `hasMore` is true, or add a total-count prop through DEC-0307's owning design. Either way, pin the result.

### IR-007 — Plan deviations are recorded only in the TDD evidence, not reconciled with the ticked tasks

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T010, T011, T014
- **Files**: `CAP-003-E1-S4-tasks.md` (T009 `manualSorting: true`, T010 `autoResetExpanded: false`, T011 measurement and prefetch key, T014 five cycles); `CAP-003-E1-S4-tdd-evidence.yaml` header comments; `data-table.tsx:192`, `:252-254`
- **Claim challenged**: Ticked tasks describe the code as delivered.
- **Observed evidence**:
  - `manualSorting` and `autoResetExpanded` are absent, although T009 and T010 (ticked) prescribe them. DEC-0307's owner decision also names "TanStack `manualSorting`". The reviewer confirmed in `@tanstack/table-core` 8.21.3 that both are inert without a sorted or grouped row model (`index.esm.js:2740`, `:3377`).
  - Other deviations: `colSpan` uses `columns.length + 1`, not the visible column count. Expansion heights are measured in a layout effect, not a ref callback. The prefetch key is first id plus count. Cycles 2 to 5 are merged.
  - All of these are explained only in YAML comments.
- **Expected evidence/behavior**: Task-plan deviations are visible beside the tasks they change. DEC-0307 names `manualSorting` as the guard that the component never sorts client-side.
- **Impact**: A later maintainer reading T009 or DEC-0307 expects a guard that is not there. Adding a sorted row model, for example from the shadcn recipe, would then sort the loaded page client-side, which spec section 4 forbids. Nothing would fail.
- **Required remediation**: Either set `manualSorting: true` (and `autoResetExpanded: false`) as T009, T010 and DEC-0307 say, or record each deviation in the task plan's Notes beside the tasks it changes.

### IR-008 — The append-expansion test prints a React `act()` warning and clicks where the plan says `{Enter}`

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006
- **Files**: `web/src/components/ui/data-table.test.tsx:571-586`
- **Claim challenged**: The suites run clean and T006 (d) is implemented as planned.
- **Observed evidence**: `keeps an expansion open across an appended page` wraps `user.click` in `act(async …)`. Both the focused and the full run print "An update to DataTable inside a test was not wrapped in act(...)" for it, with a stack at `data-table.tsx:165`. T006 (d) says to expand with `{Enter}`, but the test clicks.
- **Expected evidence/behavior**: No `act()` noise from the new suite. CAP-003-E1-S3 v1 IR-009 asked for the same and v2 confirmed it. T006 (d) uses `{Enter}`.
- **Impact**: The noise hides real warnings in later runs. Keyboard expansion is covered elsewhere (`:293-316`).
- **Required remediation**: Drop the redundant `act()` wrapper, or otherwise silence the warning, and expand with `{Enter}` as planned.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations, verified:**
  - Prefetch keyed by first row id and count, not count alone. This lets a re-sort with as many rows ask again; tested at `:529-548`.
  - Heights re-measured on every render, a superset of the plan's "when the loaded row count changes from 0".
  - Cycles 2 to 5 merged into one. With one stage commit and two shared files, `--staged` fingerprints would be cumulative and `check-tdd-evidence.py` could not replay them in order.
  - `manualSorting` and `autoResetExpanded` omitted; inert, as verified in TanStack 8.21.3.

  IR-007 asks that these be visible in the plan.
- **RED evidence:** The cycle-2 RED is the test file failing to import the missing module (0 tests collected). It is observed (TEST-TDD-002) but proves nothing per behaviour. Because the cycle was merged, the reviewer leans on the mutation run instead, which is where IR-001 to IR-004 come from.
- **Equivalence claims in the evidence:** Under this review's command, which includes `tsc`, `:266:negate-boolean:1` and `:301:drop-defaulted-argument:1` are killed rather than equivalent.
- **Commit message:** It says "59 of 65 mutants killed". The evidence and its results file say 61 killed, 2 survived and 2 timed out. The evidence is correct.
- **Bookkeeping:** Every task is ticked and every tick has implementation behind it. No unticked task appears implemented.
- **Out of scope:** None. No file outside the plan's ownership list and the TDD evidence changed.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, review rework) with `CAP-003-E1-S4-tasks.md` and this report.
- **Required action**:
  - Strengthen `data-table.test.tsx` so that every survivor fails: `manual:r4`, `r5`, `r7`, `r9`, `r19` to `r32` (IR-001 to IR-004). The definitions are in `CAP-003-E1-S4-implementation-review-v1-mutation.json`. Record the rework as a new TDD cycle.
  - Address IR-005, ideally in the same cycle, and decide IR-006 to IR-008.
  - Then rerun `$adversarial-review`. v2 will scope against this report's `reviewed_head` and mutation file.
- **Warnings accepted downstream**: N/A
