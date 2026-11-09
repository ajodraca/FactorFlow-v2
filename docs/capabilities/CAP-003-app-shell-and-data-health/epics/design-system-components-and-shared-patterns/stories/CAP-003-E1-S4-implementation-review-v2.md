---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T20:00:30Z"
reviewed_head: "d816080be4edb1bdc5704340f88723abc17fa19b"
review_base: "0795a6c7d69dedc3bc3895e1d2510ff0840b0cca"
reviewed_state_revision: "sha256:9dabf4539a6eda7054c15c2765f265a6494ac00d5f927389b51d7b208b907b5e"
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
  timestamp: 2026-11-08T20:00:30Z
  source_artifacts:
    - id: CAP-003-E1-S4
      version: "1 (sha256:3f21f7ed9f0122a3d7b79bd3b893662e8e880731b813e20f3e5f71e6e915e730)"
    - id: CAP-003-E1-S4-tasks
      version: "1 (draft, updated 2026-11-08, last_reworked_review v1)"
    - id: CAP-003-E1-S4-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-003-E1-S4-implementation-review
      version: "1 (baseline, reviewed_head 8e74983541bf32f9a91c32fe54b9c4f05b075bf5)"
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

# Implementation Review: CAP-003-E1-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 5/6 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 15/15 passed |

This is a re-review. Its baseline is v1 (`CHANGES-REQUIRED`, `reviewed_head` `8e74983`), and
scope comes from `git diff 8e74983..HEAD` and `mutation-run.py scope`.

The rework closed what v1 blocked on. All 18 v1 survivors are now killed. They cover the windowed
`aria-rowindex`, the memo's `index` and `columns` checks, the expansion-height index, the
scroller's overflow, the 24 px targets, the hidden *Details* header and the ten spec section 6
token classes (v1 IR-001 to IR-004). v1 IR-005 is fixed in production: an open row now follows a
changed `renderExpansion` or `getRowLabel`, and two tests that fail against the v1 code pin it.
v1 IR-008 is fixed: the suites print no `act()` warning from `data-table`. All 15 required
validation checks pass. Two delivered tests outside this change set failed once each under
extreme machine load and passed on rerun (see Independent Validation).

The gate fails on one new delta finding in the rework's own production lines:

- **IR-001 (HIGH, delta).** The new comparator clause (`data-table.tsx:216-219`) re-renders an open
  row only when `renderExpansion` or `getRowLabel` changes. No test pins the "only". The
  reviewer mutant `manual:v2d1` re-renders every open row on every table render. It survives
  all 100 `data-table` tests and `tsc`. That mutant breaks DAC-E1-S4-1 ("keyset pages append
  without re-rendering earlier rows") for an open earlier row. A reviewer probe confirms that
  the code under review keeps that row memoised.

IR-002 (MEDIUM, late) groups five non-equivalent survivors on lines unchanged since v1. They are
plan-fixed attributes such as the top spacer's `aria-hidden` and the sort button's `px-1 py-0`.
They cannot block. IR-003 and IR-004 (LOW) carry v1 IR-006 and IR-007, which are still open.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S4-run-20261108T150357Z` |
| HEAD | `d816080be4edb1bdc5704340f88723abc17fa19b` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` (the driver's integration branch, passed as `--base-ref`), resolved by `pipeline-state.py review-base` to `0795a6c7d69dedc3bc3895e1d2510ff0840b0cca`; ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. This report and its mutation file are the only files the reviewer adds |
| Changed files reviewed | 113 against the review base (109 added, 4 modified) in four commits (`8e74983`, `2074989`, `12058ad`, `d816080`); 36 since the baseline (32 added, 4 modified) |
| Baseline | v1 (`CAP-003-E1-S4-implementation-review-v1.md`), `reviewed_head` `8e74983541bf32f9a91c32fe54b9c4f05b075bf5`, mutation file `CAP-003-E1-S4-implementation-review-v1-mutation.json` |

State check: `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — review changes were
reworked; a new review version is required`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/ui/data-table.tsx` | added (419 lines; +7/-3 since v1 at l.205-207 doc comment and l.216-219 comparator) | DAC-E1-S4-1, DAC-E1-S4-2, DAC-E1-S4-3, AC-25, AC-26; T008-T011; v1 IR-005 |
| `web/src/components/ui/data-table.test.tsx` | added (975 lines; +203/-3 since v1 at l.576-582 and l.778-975) | TC-COMP-017, TC-COMP-018, TC-COMP-019; T002-T006; v1 IR-001 to IR-005, IR-008 |
| `package.json` | modified (+1 line, `@tanstack/react-table` `^8.21.3`) | DAC-E1-S4-3, DAC-E1-12; T007 |
| `package-lock.json` | modified (+34 lines: `@tanstack/react-table` and transitive `@tanstack/table-core` 8.21.3, both `license: MIT`) | DAC-E1-S4-3; T007 |
| `.../stories/CAP-003-E1-S4.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S4-tasks.md` | modified (T001-T014 ticked; since v1 only `updated` and `last_reworked_review`) | bookkeeping; story-coding G |
| `.../stories/CAP-003-E1-S4-tdd-evidence.yaml` | added (cycle-3 appended since v1) | T014 |
| `.../stories/CAP-003-E1-S4-evidence/cycle-{1,2,3}.patch` | added | T014 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S4-evidence/red-cycle-{1,2,3}-*.log` | added | T014 (`red_log`) |
| `.../stories/CAP-003-E1-S4-evidence/mutation-cycle-{2,3}-results.json` and `-logs/*.log` (69 + 27 files) | added | T014 (`mutation:`) |
| `.../stories/CAP-003-E1-S4-implementation-review-v1.md`, `-v1-mutation.json` | added | v1 review gate (reviewer-authored) |

No file outside the plan's ownership list (Story-Specific Validation, *Ownership*), the TDD
evidence and the review reports changed. `coverage-table.tsx`, `results-window.ts`,
`tailwind.config.js`, `design-system/`, `tsconfig.json`, `vite.config.ts`, `web/src/app` and
`web/src/api` are unchanged (`git diff --exit-code` exit 0). No screen imports `data-table` yet.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-26 | SATISFIED | Every class in `data-table.tsx` is a token class or a `var(--…)` arbitrary value: `text-sm` (l.329), `border-border` (l.149, 191, 335), `text-muted-foreground` and the cell padding (l.142, 322), `hover:bg-muted` (l.149), `bg-background` (l.335), `font-numeric` (l.176, 184, 353). The scroller height is `calc(var(--row-height) * 16)` (l.413) | `data-table.test.tsx:148-171` (h-row, config, theme), `:636-658` (numeric), `:901-975` (table, rows, cells, row header, detail row, sticky header, targets); `token-literals.test.ts` passes | v1 IR-004 survivors `r19`-`r25`, `r29`-`r31` are killed. The sort button's `px-1 py-0` is still unpinned; that survivor is `late` (IR-002) |
| AC-25 | SATISFIED | Sort control is the vendored `Button` when `getCanSort()` (l.355-369). The expander is a `Button` named `Expand {getRowLabel}` with `aria-expanded` and `aria-controls` (l.153-162). The scroller has `tabIndex={0}` (l.411) and `overflow-y-auto` (l.412) | `:209-234` (Tab, Enter cycle), `:293-316` (Tab, Enter, Space, focus kept), `:561-569` (tab stop), `:964-974` (overflow), `:953-962` (targets) | v1 IR-003 survivors `r26`, `r27`, `r28`, `r32` are killed |
| DAC-E1-12 | SATISFIED | No length or colour literal in `data-table.tsx`: the reviewer's grep prints nothing. `package.json` gains only `@tanstack/react-table`, which tech stack v7 Key Libraries confirms | `token-literals.test.ts`; `:143-146`, `:173-187` | Package mutants are killed |
| DAC-E1-S4-1 | PARTIAL | `windowFor` (l.46-80); measured row height (l.269-301); prefetch (l.310-319); memo (l.209-220). The DOM holds 25 rows at the top and 35 mid-list. Probe P1 shows that, at HEAD, an open earlier row with stable callbacks is not re-rendered on append | `:349-423` (TC-COMP-017), `:426-500`, `:604-633` (`windowFor`), `:520-601` (paging, expansion), `:709-777` (measuring), `:812-854` (row numbering, memo, expansion index) | v1 gaps are closed: `r4`, `r5`, `r7`, `r9` and `r32` are killed. Not pinned: an open earlier row not re-rendering on append, which the rework's comparator clause provides (IR-001) |
| DAC-E1-S4-2 | SATISFIED | `<th scope="col">` headers with `aria-sort` only when `getIsSorted()` (l.347-353). `history` forces `rowHeader` (l.234), which renders `<th scope="row">` (l.168-181). Expander `aria-expanded` (l.156) | `:192-207`, `:236-291`, `:293-316`, `:318-327` (TC-COMP-018) | Every carried mutant on these lines is killed, and so is the reviewer's `v2l4` (`scope="row"` removed) |
| DAC-E1-S4-3 | SATISFIED | Header and body rows carry `h-row` (l.149, 335), which resolves to `var(--row-height)`. `package.json` has one added line. The lockfile licence is MIT, and the reviewer read `node_modules/@tanstack/react-table/LICENSE` (MIT, Tanner Linsley, 8.21.3) | `:148-187` (TC-COMP-019); `token-literals.test.ts`; `vendoring.test.ts` | `h-row` → `h-8` (`r2`) is killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1's `utils.ts`, `button.tsx`, `token-literals.test.ts`, `vendoring.test.ts` and `lucide-react` are present at the base. Evidence cycle-1 records the baseline as 94 files and 2280 tests | The current suite is 95 files and 2380 tests, which is that baseline plus this file's 100 |
| T002 | complete | VERIFIED | `data-table.test.tsx:141-188`, plus the token-class suite at `:901-975` | v1 IR-003 and IR-004 are closed |
| T003 | complete | VERIFIED | `:190-328` (`// Implements TC-COMP-018`): (a) to (f) | Unchanged since v1 |
| T004 | complete | VERIFIED | `:330-424` (`// Implements TC-COMP-017`), plus `:812-842` (row index after a scroll, renumbering, new columns) | The open-row half of "append without re-rendering earlier rows" is unpinned (IR-001) |
| T005 | complete | VERIFIED | `:426-500`, `:604-633` | Every catalogue mutant in `windowFor` is killed or times out |
| T006 | complete | VERIFIED | `:502-602`, plus `:844-853` (expansion credited to its own row) | (d) now expands with `{Enter}` as planned (v1 IR-008) |
| T007 | complete | VERIFIED | `package.json:24`; lockfile entries for `@tanstack/react-table` and `@tanstack/table-core` 8.21.3, both MIT | `npm ci` reinstalls 308 packages. None of the 10 audit advisories involves `@tanstack` |
| T008 | complete | VERIFIED | `data-table.tsx:16-80` | Unchanged since v1 |
| T009 | complete | VERIFIED | `:82-119`, `:232-255`, `:321-378`, `:142-188` | `manualSorting: true` is still not set. It is inert in TanStack 8.21.3: `table-core` `index.esm.js:2740` reads it only alongside a sorted row model, and none is wired. Still recorded only in the TDD evidence (IR-004) |
| T010 | complete | VERIFIED | `:151-196`, `:241`, `:253-254`, `:337-341` | `autoResetExpanded: false` is still not set. It is inert: `_autoResetExpanded` is called only from the grouped row model (`index.esm.js:3377`). `colSpan` is `columns.length + 1` (IR-004) |
| T011 | complete | VERIFIED | `:262-319`, `:380-399`, `:408-417`, `:209-220` | The rework adds the open-row clause to T011's comparator (l.216-219) for v1 IR-005. The plan text of T011 was not amended; the doc comment (l.201-208) states the new contract. Its "unchanged callbacks keep an open row memoised" half is unpinned (IR-001) |
| T012 | complete | VERIFIED | The reviewer ran the full suite, including `token-literals`, `vendoring`, `render.test`, `shell.tokens` and every coverage test, plus `git diff` of `package.json` and the delivered paths | One `dependencies` line added; delivered files unchanged |
| T013 | complete | VERIFIED | Reviewer run: lint, format, `tsc` and build all exit 0, before and after `npm ci` | Matches plan |
| T014 | complete | VERIFIED | `CAP-003-E1-S4-tdd-evidence.yaml`: three cycles, all `APPROVED`, no drift. Cycle-3's `diff_sha256` `62bcc5af…` equals both the SHA-256 of `cycle-3.patch` and that of `git diff 8e74983..12058ad -- web package.json package-lock.json`. The lint passes with `--require-logs` | Cycle-3 records `commit_hash: 12058ad…`, not the plan's `stage`, which is more precise. Cycle-3 RED: the two IR-005 tests fail against the v1 code (`red-cycle-3-review-survivors.log`: 2 failed, 98 passed) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `TC-COMP-019 …` (`:141-188`) with `data-table token classes and targets` (`:901-975`) / TC-COMP-019 | ADEQUATE | The scan covers the file. Every header and body row has `h-row` and no `h-[`. `height.row` is `var(--row-height)` and `theme.css` declares it. One MIT package and no virtualisation library. The plan's token classes on the table, rows, header cells, body cells, row header, detail row, expander cell, *Details* header (`sr-only`), sticky header (`bg-background`), the scroller overflow and the `h-5`/`w-5` targets | `late` gaps only (IR-002), which do not make it `WEAK` |
| `TC-COMP-018 …` (`:190-328`) / TC-COMP-018 | ADEQUATE | Role queries and `user-event` per variant: `columnheader` count and names, `aria-sort` only on the sorted column, the asc → desc → unsorted cycle, no control without a handler or on an unsortable column, the history row header (forced), compact on request, the expander's name, `aria-expanded`, `aria-controls`, `aria-live`, focus kept, `aria-busy` | None in its scope |
| `TC-COMP-017 …` (`:330-424`) with `windowed row numbering and the row memo` (`:812-854`) / TC-COMP-017 | WEAK | 25 rows, `aria-rowcount` 3001, spacer heights; 35 rows mid-list; a measured 40 px row; an append that re-renders only new rows; `aria-rowindex` 992 and 1026 after a scroll; renumbering after a removal; new `columns` reaching kept rows; an open expansion credited to its own row | "Appending does not re-render earlier rows" is never shown for an open earlier row, so `manual:v2d1` survives (IR-001, `delta`) |
| `expanded rows follow what the caller renders` (`:856-899`) / T011, v1 IR-005 | WEAK | A changed `renderExpansion` reaches an open row and re-renders no collapsed row. A changed `getRowLabel` renames the open row's expander. Both fail against the v1 code (RED log) | Does not show that an open row with unchanged callbacks stays memoised (IR-001) |
| `windowFor` (`:426-500`, `:604-633`) / T005 | ADEQUATE | Independent literals for top, middle, no layout, negative and NaN, short, empty, an expansion above, at and below the window, past the end, 1 px rows, an out-of-range extra | None |
| `virtualised paging, keyboard and expansion` (`:502-602`) / T006 | ADEQUATE | Prefetch boundary at rows 4 and 5, re-asking after a replacement, held back while busy or with no more rows, scroller tab stop with no name, expansion kept across an append (expanded with `{Enter}`, rerender awaited in `act`), a collapsed height dropped | None beyond IR-001 |
| `data-table classes and structure` (`:635-707`) | ADEQUATE | Numeric alignment, `colSpan` 4, sticky and scroller only on `virtualised`, no expander column without expansion, single-column sort with Shift | None |
| `virtualised measuring` (`:709-777`) | ADEQUATE | Zero-height layout, an empty table first, the last height kept, 1 px rows and spacers, an expansion kept in the offsets out of the window | None |

Isolation and determinism: `afterEach` restores mocks and clears `renders`. No timers, network
or storage are involved. `getBoundingClientRect` is stubbed per test. The focused run (100
tests) and both green full runs print no `data-table` stderr. The only remaining `act()`
warnings come from the delivered `members-tab.test.tsx`.

Mutation run (reviewer, `review` cycle). The reviewer generated catalogue mutants over every
changed production line, added nine manual mutants, then ran `scope --since 8e74983 --previous
v1-mutation.json`. Results are in `CAP-003-E1-S4-implementation-review-v2-mutation.json`, sha256
`b1df3655281059fc858fc532468026207892338b1fb03985bd1b8dfe16c49e71`. The command and suites are
v1's: `components/ui/data-table`, `components/token-literals` and `components/ui/vendoring`,
then `npx tsc --noEmit`. All four baselines exit 0. No mutant log shows a vitest "Test timed out",
so no kill comes from machine load.

| Mutant | Scope | State | Disposition |
|--------|-------|-------|-------------|
| 91 baseline mutants (59 catalogue, 32 manual `r1`-`r32`) | carried | 89 killed, 2 timeout | All 18 v1 survivors (`r4`, `r5`, `r7`, `r9`, `r19`-`r32`) are killed, each with a test failure (exit 1). The two timeouts are v1's binary-search hangs (`:67`, `:68` off-by-one), which count as detected |
| `:217:negate-boolean:1` (`(!a.expanded ||` → `(a.expanded ||`) | delta | killed | — |
| `manual:v2d1` `(a.expansion?.renderExpansion === b.expansion?.renderExpansion &&` → `(a.expansion === b.expansion &&` | delta | **survived** | Not equivalent. `expansion` is a new object on every `DataTable` render (l.237-239), so an open row then re-renders on every table render. DAC-E1-S4-1 says pages append "without re-rendering earlier rows". Plan *Stable inputs* says stable inputs keep that property. The doc comment (l.205-207) says an open row follows the callbacks, which means it re-renders when they change. Probe P1 shows the difference (IR-001) |
| 37 catalogue mutants regenerated on lines after l.219 | late | killed | The same mutations as carried catalogue mutants, renumbered by the 4 added lines |
| `manual:v2l4` row header loses `scope="row"` | late | killed | — |
| `manual:v2l5` ascending icon shows `ArrowDown` | late | killed | Killed only by `tsc` (unused `ArrowUp` import), not by a test |
| `manual:v2l1` top spacer loses `aria-hidden="true"` | late | **survived** | Not equivalent: T011 fixes `<tr data-spacer="top" aria-hidden="true" …>` (IR-002) |
| `manual:v2l3` sort button `h-5 gap-1 px-1 py-0` → `h-5 gap-1` | late | **survived** | Not equivalent: T009 fixes the class string. Plan Other Notes, *`button` sizing inside a row*, says `py-0` and the padding override S1's `px-3 py-2` (IR-002) |
| `manual:v2l9` table loses `data-variant` | late | **survived** | Not equivalent: T009 fixes `<table data-variant={variant} …>` (IR-002) |
| `manual:v2l12` *Details* header loses `scope="col"` | late | **survived** | Not equivalent: T009 fixes every header as `<th scope="col">`, and T010 adds the *Details* header to that row (IR-002) |
| `manual:v2l13` unsorted sort icon loses `aria-hidden` | late | **survived** | Not equivalent: T009 says the sort icon "has `aria-hidden="true"`" (IR-002) |
| `manual:v2l2` expander chevrons swapped | late | survived | Equivalent against the contract. T010 names the `ChevronDown`/`ChevronRight` pair but not which state each shows, and DEC-0307 makes `aria-expanded` the carrier of open or closed |

Totals: 138 mutants (91 carried, 2 delta, 45 late): 129 killed, 7 survived, 2 timeout.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | Skill prerequisite gate, not counted among the 15 required checks; all eight checks passed |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | N/A | `READY`; not counted |
| `npm run test -- src/components/ui/data-table.test.tsx` | component root | 0 | PASS | Narrowest story suite first: 1 file, 100 tests, no stderr and no `act()` warning |
| `npm run test` | component root | 0 | PASS | Four runs; runs 2 and 4 are green with 95 files and 2380 tests (run 4 after `npm ci`). Run 1 (load average about 138) failed one test: the delivered `src/app/build-output.test.tsx` real Vite build hit its 5000 ms timeout (`npm run build` alone took 4.28 s at that load). Run 3 (load average about 192) failed one test: the delivered `stock-evidence.test.tsx` "reads Not followed …" could not find `Not followed`. Run alone three times, that file passed 31/31 each time. Neither file is in the change set, `web/src/screens` and `web/src/app` are unchanged since the base, and no module imports `data-table`. Both failures are load flakes in delivered tests, not story behaviour |
| `npm run lint` | component root | 0 | PASS | Biome: 214 files, no findings, before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 214 files, no changes, before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output, before and after `npm ci` |
| `npm run build` | component root | 0 | PASS | 102 modules. Writes only ignored files under `src/factorflow/api/static/` |
| `npm ci` | component root | 0 | PASS | 308 packages added. 10 audit advisories (6 moderate, 2 high, 2 critical), none in `@tanstack`. Run after the mutation run, because every mutation clone links this `node_modules` |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 0795a6c7… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. The reviewer also re-hashed `cycle-3.patch` (`62bcc5af…`), `red-cycle-3-review-survivors.log` (`391e2af2…`) and `mutation-cycle-3-results.json` (`cfe35ae0…`): each matches the evidence |
| `grep -nE "\b[0-9]+(\.[0-9]+)?(px\|rem\|em\|vh\|vw)\b\|#[0-9a-fA-F]{3,8}\b" web/src/components/ui/data-table.tsx` | component root | 1 | PASS | Prints nothing (DAC-E1-S4-3 story-specific check) |
| `grep -n "react-virtual\|react-window\|react-virtuoso" package.json` | component root | 1 | PASS | Prints nothing (DEC-0215) |
| `git diff 0795a6c7..HEAD -U0 -- package.json` | component root | 0 | PASS | Exactly one added line, `"@tanstack/react-table": "^8.21.3",` in `dependencies` |
| `git diff --exit-code 0795a6c7..HEAD -- web/src/screens tailwind.config.js design-system tsconfig.json vite.config.ts web/src/app web/src/api` | component root | 0 | PASS | Delivered files unchanged |
| `git diff 0795a6c7..HEAD --stat -- . ':!docs'` | component root | 0 | PASS | Only `package.json`, `package-lock.json`, `data-table.tsx`, `data-table.test.tsx` (ownership check) |
| DOM sweep at rows 0, 500, 1500 and 2990 (`data-table.test.tsx:416-423`) | component root | 0 | PASS | At most 37 `tbody tr`; part of the suite run |
| `node_modules/@tanstack/react-table/LICENSE` read | component root | N/A | PASS | MIT License, Copyright (c) 2016 Tanner Linsley; `package.json` `"license": "MIT"`, version 8.21.3 |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 0795a6c7..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 60 catalogue mutants. The reviewer appended nine manual mutants (`v2d1`, `v2l1`-`v2l5`, `v2l9`, `v2l12`, `v2l13`) |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mutants-generated-plus.json --since 8e74983541bf32f9a91c32fe54b9c4f05b075bf5 --previous <stories>/CAP-003-E1-S4-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | N/A | 138 mutants: 91 carried, 2 delta, 45 late; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 400 --work-root <scratch>/work --logs <scratch>/results-logs --command 'cd {workdir} && ln -sfn <component>/node_modules node_modules && npx vitest run components/ui/data-table components/token-literals components/ui/vendoring && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 3 | N/A | 129 killed, 7 survived, 2 timeout; four baselines exit 0. The exit code reports the survivors listed above |
| Reviewer probe in a scratch clone of `d816080` (`web/src/components/ui/probe.test.tsx`, never in the review subject) | scratch clone | 0, then 1 under `v2d1` | N/A | P1: with module-level `renderExpansion` and `getRowLabel`, expand *Stock 3* in a 50-row `virtualised` table, then append 50 rows (same objects). At HEAD the open row is not re-rendered (`renders` `[]`). With `v2d1` applied, `renders` is `["S0003"]`, P1 fails, and all 100 `data-table` tests still pass. P2: with inline callbacks, the open row re-renders on append, which is the documented trade-off of the IR-005 fix |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |

### Validation Side Effects

- Before: HEAD `d816080`, branch `usr/alvaro-de-jodra/CAP-003-E1-S4-run-20261108T150357Z`,
  clean working tree, `reviewed_state_revision`
  `sha256:9dabf4539a6eda7054c15c2765f265a6494ac00d5f927389b51d7b208b907b5e`.
- After: HEAD `d816080`, the same branch, a clean working tree and the same `code-revision`
  fingerprint.
- Unexpected tracked-file changes: none.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - The mutation run and the probe worked in clones under the reviewer's scratch directory. The
    results are copied beside this report as `CAP-003-E1-S4-implementation-review-v2-mutation.json`.

## Findings

CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 2 · **total 4**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | delta | An open row that keeps its callbacks is not pinned to stay memoised on append |
| IR-002 | MEDIUM | late | Five plan-fixed attributes on lines unchanged since v1 are unpinned |
| IR-003 | LOW | carried | `aria-rowcount` states the loaded count while more pages exist (v1 IR-006) |
| IR-004 | LOW | carried | Plan deviations are still recorded only in the TDD evidence (v1 IR-007) |

### IR-001 — An open row that keeps its callbacks is not pinned to stay memoised on append

- **Severity**: HIGH
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S4-1
- **Tasks**: T004, T006, T011
- **Files**: `web/src/components/ui/data-table.tsx:216-219` (the open-row clause added in cycle 3), `:237-239` (a new `expansion` object on every render), `:201-208` (doc comment); `web/src/components/ui/data-table.test.tsx:385-406`, `:571-588`, `:856-899`
- **Claim challenged**: Cycle 3 says "an expanded row now also compares renderExpansion and getRowLabel in the row memo … collapsed rows stay memoised". The doc comment says "An open row also follows `renderExpansion` and `getRowLabel`". Together these claim that an open row re-renders when its callbacks change, and only then.
- **Observed evidence**:
  - `manual:v2d1` replaces the `renderExpansion` identity check with `a.expansion === b.expansion`. That object is rebuilt on every `DataTable` render, so every open row then re-renders on every table render. The mutant survives all 100 `data-table` tests and `tsc`.
  - The IR-005 tests (`:877-898`) prove only that a *changed* callback reaches an open row and that collapsed rows stay memoised.
  - The append tests either have no open row (`:385-406`) or pass fresh closures on every render (`:571-588`, through `expansionProps(true)`), so they cannot tell the two apart.
  - Reviewer probe P1 (stable callbacks, open *Stock 3*, a 50-row page appended): at HEAD `renders` is `[]`; under `v2d1` it is `["S0003"]`.
- **Expected evidence/behavior**:
  - DAC-E1-S4-1 and TC-COMP-017: "keyset pages append without re-rendering earlier rows".
  - Plan Other Notes, *Stable inputs*: callers that keep their inputs stable keep "the 'earlier rows are not re-rendered' property".
  - The rework's own clause exists only to separate "callbacks changed" from "callbacks unchanged". Only the first half is pinned.
- **Impact**: If the clause regressed to "open rows always re-render", nothing would fail. Each open row's `renderExpansion` would then run again on every scroll event (`setScrollTop`), every appended page, every `busy` toggle and every measurement update of the layout effect. That holds even for callers that keep their callbacks stable, as DEC-0307's consumers can. CAP-003-E7-S2 and CAP-003-E7-S3 put row expansion inside the 3000-row `virtualised` lists. The scope is `delta`: the line was added by this rework.
- **Required remediation**: Add one assertion that fails under `manual:v2d1`. For example, use module-level (stable) `renderExpansion` and `getRowLabel`, open an earlier row, rerender with an appended page of the same objects, and assert that `renders` holds no id of the open row (as probe P1 does). Record the test under T004 or T006 in a new TDD cycle. No production change is needed: the code under review already behaves this way.

### IR-002 — Five plan-fixed attributes on lines unchanged since v1 are unpinned

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is incomplete; AC-25, AC-26 and DAC-E1-S4-2 context)
- **Tasks**: T009, T010, T011
- **Files**: `web/src/components/ui/data-table.tsx:382` (top spacer `aria-hidden`), `:358` (`h-5 gap-1 px-1 py-0`), `:326` (`data-variant`), `:338` (*Details* `scope="col"`), `:363-367` (sort icon `aria-hidden`)
- **Claim challenged**: The tests pin the markup T009 to T011 fix.
- **Observed evidence**: Five reviewer mutants survive:
  - `v2l1`: the top spacer loses `aria-hidden`.
  - `v2l3`: the sort button loses `px-1 py-0`.
  - `v2l9`: the table loses `data-variant`.
  - `v2l12`: the *Details* header loses `scope="col"`.
  - `v2l13`: the unsorted icon loses `aria-hidden`.

  The bottom spacer's `aria-hidden` is asserted (`:358`), the top spacer's is not. The sort button is asserted for `h-5` only (`:959-962`).
- **Expected evidence/behavior**:
  - T011: `<tr data-spacer="top" aria-hidden="true" …>`.
  - T009: `className="h-5 gap-1 px-1 py-0"`, `<table data-variant={variant} …>`, every header `<th scope="col">`, and the sort icon "has `aria-hidden="true"`".
  - Plan Other Notes, *`button` sizing inside a row*: `py-0` and the padding override S1's base `px-3 py-2`.
- **Impact**:
  - Without `aria-hidden`, the top spacer is exposed to assistive technology as an empty row once a `virtualised` table scrolls.
  - Without `px-1 py-0`, the sort button takes S1's wider padding inside its 24 px box.
  - The other three regressions are silent.
  - Each line is unchanged since v1, so the scope is `late`: this finding cannot block.
- **Required remediation**: Optionally assert these attributes, so that each of `v2l1`, `v2l3`, `v2l9`, `v2l12` and `v2l13` fails. Matching against the planned strings is enough. `v2l2` (chevron direction) is equivalent and needs nothing.

### IR-003 — `aria-rowcount` states the loaded count while more pages exist (v1 IR-006)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/ui/data-table.tsx:328`
- **Claim challenged**: `aria-rowcount={rowCount + 1}` "keep[s] the table's size announced while windowed (the CAP-002 precedent)" (plan Other Notes).
- **Observed evidence**: Unchanged since v1. `rowCount` is the loaded row count, and `DataTable` has no total-count prop. Cycle 3's description defers the change to the owner ("a -1 or a total-count prop is a change to DEC-0307's owning design"). No decision record or owner question is filed for it under `projects/factorflow-v2/decisions/`.
- **Expected evidence/behavior**: WAI-ARIA 1.2 `aria-rowcount`: "If the total number of rows is unknown, authors MUST set the value of aria-rowcount to -1". The CAP-002 precedent announces the server's total (`results-table.tsx:701`).
- **Impact**: While pages remain, screen-reader users hear the loaded count as the table size. T011 prescribes this behaviour, so the finding is LOW.
- **Required remediation**: Unchanged from v1. Set `-1` while `hasMore` is true, or add a total-count prop through DEC-0307's owning design, and pin the result. If the owner is to decide, file it as a follow-up against component design `ui-components` 2.1 so the question is not held only in a YAML description.

### IR-004 — Plan deviations are still recorded only in the TDD evidence (v1 IR-007)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T010, T011, T014
- **Files**: `CAP-003-E1-S4-tasks.md` (T009 `manualSorting: true`, T010 `autoResetExpanded: false`, T011 comparator, measurement and prefetch key, T014 five cycles); `CAP-003-E1-S4-tdd-evidence.yaml` header and cycle-3 `description`; `data-table.tsx:256-258`
- **Claim challenged**: Ticked tasks describe the code as delivered.
- **Observed evidence**: Since v1, the task plan changed only in `updated` and `last_reworked_review`. The deviations are restated in cycle-3's description, which says "recorded here (IR-007)". The list covers `manualSorting` and `autoResetExpanded` (still absent, still inert), `colSpan`, layout-effect measurement, the prefetch key and the merged cycles. T011's comparator now also has the open-row clause (v1 IR-005), which the plan's text does not show.
- **Expected evidence/behavior**: v1 asked either for `manualSorting: true` (and `autoResetExpanded: false`) as T009, T010 and DEC-0307 name them, or for each deviation to be recorded beside the tasks it changes. Story-coding G asks only that deviations be noted, which the evidence does. So this stays LOW.
- **Impact**: A maintainer reading T009 or DEC-0307 expects a `manualSorting` guard that is not there. Wiring a sorted row model later would sort the loaded page client-side, which spec section 4 forbids, and nothing would fail.
- **Required remediation**: Unchanged from v1. Set `manualSorting: true` and `autoResetExpanded: false`, or note each deviation, including the T011 comparator clause, in the task plan beside the task it changes.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `manual:r4`, `r5` and `r7` are killed (exit 1). Tests `:813-819` (`aria-rowindex` 992 and 1026 after a scroll), `:821-829` (renumbered after a removal) and `:831-842` (new `columns` reach kept rows) |
| v1/IR-002 | RESOLVED | `manual:r9` is killed. Test `:844-853` scrolls inside row 40's open detail and expects `S0030`; crediting row 41 gives `S0031` |
| v1/IR-003 | RESOLVED | `manual:r26`, `r27`, `r28` and `r32` are killed. Tests `:953-957` (`sr-only`, `h-5 w-5 p-0`), `:959-962` (`h-5`), `:964-974` (`overflow-y-auto`) |
| v1/IR-004 | RESOLVED | `manual:r19`-`r25` and `r29`-`r31` are killed. Tests `:904-951`, `:964-974` |
| v1/IR-005 | RESOLVED | `data-table.tsx:216-219` re-renders an open row when `renderExpansion` or `getRowLabel` changes. Tests `:877-898` fail against the v1 code (`red-cycle-3-review-survivors.log`) and pass now; reviewer `c1`-`c4` and `:217:negate-boolean:1` are killed. The "only when they change" half is unpinned (new IR-001) |
| v1/IR-006 | STILL OPEN | `data-table.tsx:328` unchanged; carried as IR-003 |
| v1/IR-007 | STILL OPEN | Task plan text unchanged; deviations only in the TDD evidence; carried as IR-004 |
| v1/IR-008 | RESOLVED | The focused run and both green full runs print no `data-table` stderr. `:576-577` expands with focus and `{Enter}`, and `:580-582` awaits the rerender inside `act` |

## Scope and Plan Deviations

- **Justified deviations, verified:**
  - The deviations v1 verified still hold: prefetch keyed by first row id and count; heights
    re-measured on every render; plan cycles 2 to 5 merged into cycle-2; `manualSorting` and
    `autoResetExpanded` omitted (inert in TanStack 8.21.3). IR-004 asks that they appear in the
    plan.
  - New in cycle 3: the T011 comparator gains the open-row clause. It answers v1 IR-005 and is
    pinned in one direction (IR-001).
- **RED evidence:** Cycle-3's RED is meaningful for the production change: the two IR-005
  tests fail against the v1 code (2 failed, 98 passed). The other new tests pin behaviour the code
  already had. The reviewer's mutation run shows that they fail when that behaviour is removed.
- **Evidence integrity:** Cycle-3's `diff_sha256` matches `cycle-3.patch`, which is byte-identical
  to `git diff 8e74983..12058ad` over the code paths. The cycle-3 mutation block (23 generated,
  23 killed) matches its results file.
- **Bookkeeping:** Every task is ticked and every tick has implementation behind it. The
  commit message of `12058ad` matches the change.
- **Out of scope:** None. No file outside the plan's ownership list, the TDD evidence and the
  review reports changed.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, review rework) with `CAP-003-E1-S4-tasks.md` and this report.
- **Required action**:
  - Add the IR-001 test so `manual:v2d1` fails: an open earlier row with stable callbacks is not re-rendered when a page is appended. Record it as a new TDD cycle. No production change is needed.
  - Optionally pin IR-002's attributes, and decide IR-003 and IR-004.
  - Then rerun `$adversarial-review`. v3 will scope against this report's `reviewed_head` (`d816080`) and `CAP-003-E1-S4-implementation-review-v2-mutation.json`.
- **Warnings accepted downstream**: N/A
