---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S4-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-11-08T20:54:51Z"
reviewed_head: "8f4bf76857db02d485203fe0c524c336fb5fd468"
review_base: "0795a6c7d69dedc3bc3895e1d2510ff0840b0cca"
reviewed_state_revision: "sha256:582b7fe3f56f7be7af42a6dd784fd2c4b5c7e250fed49d60e70d0634f359507b"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-08T20:54:51Z
  source_artifacts:
    - id: CAP-003-E1-S4
      version: "1 (sha256:3f21f7ed9f0122a3d7b79bd3b893662e8e880731b813e20f3e5f71e6e915e730)"
    - id: CAP-003-E1-S4-tasks
      version: "1 (draft, updated 2026-11-08, last_reworked_review v2)"
    - id: CAP-003-E1-S4-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-003-E1-S4-implementation-review
      version: "2 (baseline, reviewed_head d816080be4edb1bdc5704340f88723abc17fa19b)"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: design-system/components/data-table/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: DEC-0215
      version: "applied"
    - id: DEC-0306
      version: "applied"
    - id: DEC-0307
      version: "applied"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S4 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 4 |
| Acceptance criteria | 6/6 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 15/15 passed |

This is a re-review. Its baseline is v2 (`CHANGES-REQUIRED`, `reviewed_head` `d816080`). Scope
comes from `git diff d816080..HEAD` and `mutation-run.py scope --previous v2-mutation.json`.

The rework since v2 is test-only. It adds one test (`data-table.test.tsx:900-920`), the cycle-4
TDD evidence and the plan's `last_reworked_review`. `data-table.tsx`, `package.json` and
`package-lock.json` are byte-identical to v2's subject (`git diff --exit-code d816080..HEAD` exit 0).

v2 IR-001, the only blocking finding, is resolved. The reviewer reran v2's mutant `manual:v2d1`, which
re-renders every open row on every table render. Exactly one test now fails under it, the new one
(`1 failed | 138 passed`). Every other carried mutant is killed or, for the two binary-search
hangs v1 and v2 also saw, times out. All 15 required validation checks pass, including two full
suite runs (95 files, 2381 tests) under a load average between 240 and 860.

No finding blocks. Five remain:

- **IR-001 (MEDIUM, carried).** v2 IR-002: five plan-fixed attributes are still unpinned. Their
  survivors stay `late`, so they cannot make a test `WEAK`.
- **IR-002 (LOW, delta).** The new test prints a React `act()` warning, the defect v1 IR-008
  raised and cycle 3 fixed.
- **IR-003 (LOW, late).** The row memo does not notice expansion being turned on after the first
  render. A reviewer probe shows a header *Details* column over body rows with no expander.
- **IR-004 and IR-005 (LOW, carried).** v2 IR-003 (`aria-rowcount`) and v2 IR-004 (plan
  deviations recorded only in the TDD evidence) are still open.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S4-run-20261108T150357Z` |
| HEAD | `8f4bf76857db02d485203fe0c524c336fb5fd468` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` (the driver's integration branch, passed as `--base-ref`), resolved by `pipeline-state.py review-base` to `0795a6c7d69dedc3bc3895e1d2510ff0840b0cca`; ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before validation. After validation the only addition is this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 117 against the review base (113 added, 4 modified) in seven commits (`8e74983`, `2074989`, `12058ad`, `d816080`, `6433dca`, `56a446b`, `8f4bf76`). 7 changed since the baseline (4 added, 3 modified) |
| Baseline | v2 (`CAP-003-E1-S4-implementation-review-v2.md`), `reviewed_head` `d816080be4edb1bdc5704340f88723abc17fa19b`, mutation file `CAP-003-E1-S4-implementation-review-v2-mutation.json` |

The state check `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — review changes were
reworked; a new review version is required`. Run twice, it gave the same result both times. Run
without `--base-ref`, it resolves against the remote default branch and reports `BLOCKED — story
coding has not reached in-review`. Skill A.2 requires the driver's integration branch, so the
reviewer used that base.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/ui/data-table.tsx` | added (419 lines; unchanged since v2) | DAC-E1-S4-1, DAC-E1-S4-2, DAC-E1-S4-3, AC-25, AC-26; T008-T011 |
| `web/src/components/ui/data-table.test.tsx` | added (997 lines; +22 since v2 at l.900-920) | TC-COMP-017, TC-COMP-018, TC-COMP-019; T002-T006; v2 IR-001 |
| `package.json` | modified (+1 line, `@tanstack/react-table` `^8.21.3`) | DAC-E1-S4-3, DAC-E1-12; T007 |
| `package-lock.json` | modified (+34 lines: `@tanstack/react-table` and transitive `@tanstack/table-core` 8.21.3, both `license: MIT`) | DAC-E1-S4-3; T007 |
| `.../stories/CAP-003-E1-S4.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S4-tasks.md` | modified (T001-T014 ticked; since v2 only `last_reworked_review` v1 to v2) | bookkeeping; story-coding G |
| `.../stories/CAP-003-E1-S4-tdd-evidence.yaml` | added (cycle-4 appended since v2) | T014 |
| `.../stories/CAP-003-E1-S4-evidence/cycle-{1,2,3,4}.patch` | added (`cycle-4.patch` since v2) | T014 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S4-evidence/red-cycle-{1,2,3,4}-*.log` | added (`red-cycle-4-open-row-memo.log` since v2) | T014 (`red_log`) |
| `.../stories/CAP-003-E1-S4-evidence/mutation-cycle-{2,3}-results.json` and `-logs/*.log` | added (unchanged since v2) | T014 (`mutation:`) |
| `.../stories/CAP-003-E1-S4-implementation-review-v{1,2}.md`, `-v{1,2}-mutation.json` | added (v2 pair since the baseline) | review gates (reviewer-authored) |

No file outside the plan's ownership list (Story-Specific Validation, *Ownership*), the TDD
evidence and the review reports changed. `coverage-table.tsx`, `results-window.ts`,
`tailwind.config.js`, `design-system/`, `tsconfig.json`, `vite.config.ts`, `web/src/app` and
`web/src/api` are unchanged (`git diff --exit-code` exit 0). No screen imports `data-table` yet.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-26 | SATISFIED | Every class in `data-table.tsx` is a token class or a `var(--…)` arbitrary value: `text-sm` (l.329), `border-border` (l.149, 191, 335), `text-muted-foreground` and the cell padding (l.142, 322), `hover:bg-muted` (l.149), `bg-background` (l.335), `font-numeric` (l.176, 184, 353). The scroller height is `calc(var(--row-height) * 16)` (l.413) | `data-table.test.tsx:142-188`, `:635-707`, `:923-997`; `token-literals.test.ts` passes | Unchanged since v2. The sort button's `px-1 py-0` is still unpinned (IR-001, `late` survivor) |
| AC-25 | SATISFIED | Sort control is the vendored `Button` when `getCanSort()` (l.355-369). The expander is a `Button` named `Expand {getRowLabel}` with `aria-expanded` and `aria-controls` (l.153-162). The scroller has `tabIndex={0}` (l.411) and `overflow-y-auto` (l.412) | `:209-234` (Tab, Enter cycle), `:293-316` (Tab, Enter, Space, focus kept), `:561-569` (tab stop), `:975-996` (targets, overflow) | Unchanged since v2. IR-003 describes expansion turned on after mount, which no artifact specifies |
| DAC-E1-12 | SATISFIED | No length or colour literal in `data-table.tsx`: the reviewer's grep prints nothing. `package.json` gains only `@tanstack/react-table`, which tech stack v7 Key Libraries confirms | `token-literals.test.ts`; `:143-146`, `:173-187` | Package mutants are killed |
| DAC-E1-S4-1 | SATISFIED | `windowFor` (l.46-80); measured row height (l.269-301); prefetch (l.310-319); memo (l.209-220), shared by every variant through the one `DataTableRow` call site (l.384-395). The DOM holds 25 rows at the top and 35 mid-list | `:331-424` (TC-COMP-017), `:426-500`, `:604-633` (`windowFor`), `:502-602` (paging, expansion), `:709-777` (measuring), `:812-854` (row numbering, memo), `:900-920` (open earlier row, stable callbacks, appended page) | v2's PARTIAL is closed. `manual:v2d1` now fails `:900-920` and nothing else. Reviewer probe P1 runs the same scenario on `virtualised` (stable callbacks, open *Stock 3*, a 50-row page appended inside `act`): the open row is not re-rendered at HEAD |
| DAC-E1-S4-2 | SATISFIED | `<th scope="col">` headers with `aria-sort` only when `getIsSorted()` (l.347-353). `history` forces `rowHeader` (l.234), which renders `<th scope="row">` (l.168-181). Expander `aria-expanded` (l.156) | `:191-328` (TC-COMP-018) | Unchanged since v2. Every carried mutant on these lines is killed |
| DAC-E1-S4-3 | SATISFIED | Header and body rows carry `h-row` (l.149, 335), which resolves to `var(--row-height)`. `package.json` has one added line. The lockfile licence is MIT for both TanStack entries. The reviewer read `node_modules/@tanstack/react-table/LICENSE` (MIT License, Copyright (c) 2016 Tanner Linsley; package 8.21.3) | `:142-188` (TC-COMP-019); `token-literals.test.ts`; `vendoring.test.ts` | `h-row` to `h-8` (`r2`) is killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1's `utils.ts`, `button.tsx`, `token-literals.test.ts`, `vendoring.test.ts` and `lucide-react` are present at the base. Cycle-1 records the baseline as 94 files and 2280 tests | The current suite is 95 files and 2381 tests: that baseline plus this file's 101 |
| T002 | complete | VERIFIED | `data-table.test.tsx:141-188`, plus the token-class suite at `:923-997` | Unchanged since v2 |
| T003 | complete | VERIFIED | `:190-328` (`// Implements TC-COMP-018`): (a) to (f) | Unchanged since v2 |
| T004 | complete | VERIFIED | `:330-424` (`// Implements TC-COMP-017`), `:812-854`, and the new `:900-920` | The open-row half of "append without re-rendering earlier rows" is now pinned (v2 IR-001) |
| T005 | complete | VERIFIED | `:426-500`, `:604-633` | Every catalogue mutant in `windowFor` is killed or times out |
| T006 | complete | VERIFIED | `:502-602`, `:844-853`, `:900-920` | Cycle-4 lists T006. The new test runs on `expandable`. The row memo is variant-independent, and probe P1 covers `virtualised` |
| T007 | complete | VERIFIED | `package.json:24`; lockfile entries for `@tanstack/react-table` and `@tanstack/table-core` 8.21.3, both MIT | `npm ci` reinstalls 308 packages. None of the 10 audit advisories involves `@tanstack` (`@vitest/mocker`, `esbuild`, `postcss-selector-parser`, `react-router`, `react-router-dom`, `source-map-js`, `tinypool`, `vite`, `vite-node`, `vitest`) |
| T008 | complete | VERIFIED | `data-table.tsx:16-80` | Unchanged since v1 |
| T009 | complete | VERIFIED | `:82-119`, `:232-255`, `:321-378`, `:142-188` | `manualSorting: true` is still not set. It is inert while no sorted row model is wired. Still recorded only in the TDD evidence (IR-005) |
| T010 | complete | VERIFIED | `:151-196`, `:241`, `:253-254`, `:337-341` | `autoResetExpanded: false` is still not set (inert); `colSpan` is `columns.length + 1` (IR-005) |
| T011 | complete | VERIFIED | `:262-319`, `:380-399`, `:408-417`, `:209-220` | Both halves of the comparator's open-row clause (l.216-219) are now pinned: a changed callback reaches an open row (`:877-898`), and unchanged callbacks keep it memoised (`:900-920`). The plan text of T011 still lacks that clause (IR-005). The comparator compares neither the presence of `expansion` nor `windowed` (IR-003) |
| T012 | complete | VERIFIED | The reviewer ran the full suite twice, including `token-literals`, `vendoring`, `render.test`, `shell.tokens` and every coverage test, plus `git diff` of `package.json` and the delivered paths | One `dependencies` line added; delivered files unchanged |
| T013 | complete | VERIFIED | Reviewer run: lint, format, `tsc` and build all exit 0, before and after `npm ci` | Matches plan |
| T014 | complete | VERIFIED | `CAP-003-E1-S4-tdd-evidence.yaml`: four cycles, all `APPROVED`, no drift. Cycle-4's `diff_sha256` `5136f0f5…` equals the SHA-256 of `cycle-4.patch` and of `git diff d816080..56a446b -- web package.json package-lock.json`, and the patch is byte-identical to that diff. `red_log_sha256` `f76ee50c…` matches the log. The lint passes with `--require-logs` | Cycle-4 records `commit_hash: 56a446b…` and `mutation: {not_applicable: test-only}`, as T014 allows for a cycle with no production change. Its RED (`v2d1` applied, the new test fails, the others pass) is reproduced by the reviewer's own run |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `TC-COMP-019 …` (`:141-188`) with `data-table token classes and targets` (`:923-997`) / TC-COMP-019 | ADEQUATE | The scan covers the file. Every header and body row has `h-row` and no `h-[`. `height.row` is `var(--row-height)` and `theme.css` declares it. One MIT package and no virtualisation library. The plan's token classes, the sticky header background, the scroller overflow and the `h-5`/`w-5` targets | `late` survivors only (IR-001), which do not make it `WEAK` |
| `TC-COMP-018 …` (`:190-328`) / TC-COMP-018 | ADEQUATE | Role queries and `user-event` per variant: `columnheader` count and names, `aria-sort` only on the sorted column, the asc → desc → unsorted cycle, no control without a handler or on an unsortable column, the history row header (forced), compact on request, the expander's name, `aria-expanded`, `aria-controls`, `aria-live`, focus kept, `aria-busy` | None |
| `TC-COMP-017 …` (`:330-424`) with `windowed row numbering and the row memo` (`:812-854`) / TC-COMP-017 | ADEQUATE | 25 rows, `aria-rowcount` 3001, spacer heights; 35 rows mid-list; a measured 40 px row; an append that re-renders only new rows; `aria-rowindex` 992 and 1026 after a scroll; renumbering after a removal; new `columns` reaching kept rows; an open expansion credited to its own row | v2's gap (an open earlier row on append) is closed by `:900-920` |
| `expanded rows follow what the caller renders` (`:856-921`) / T004, T006, T011 | ADEQUATE | A changed `renderExpansion` reaches an open row and re-renders no collapsed row. A changed `getRowLabel` renames the open row's expander. With stable callbacks, appending three rows renders exactly `S0003`-`S0005`: neither the open `S0001` nor the collapsed `S0000` and `S0002`. Each half has a mutant that fails only its test (`v3l2`, `v3l1`, `v2d1`) | The new test's `rerender` is not awaited inside `act`, so it prints a React warning (IR-002) |
| `windowFor` (`:426-500`, `:604-633`) / T005 | ADEQUATE | Independent literals for top, middle, no layout, negative and NaN, short, empty, an expansion above, at and below the window, past the end, 1 px rows, an out-of-range extra | None |
| `virtualised paging, keyboard and expansion` (`:502-602`) / T006 | ADEQUATE | Prefetch boundary at rows 4 and 5, re-asking after a replacement, held back while busy or with no more rows, scroller tab stop with no name, expansion kept across an append, a collapsed height dropped | None |
| `data-table classes and structure` (`:635-707`) | ADEQUATE | Numeric alignment, `colSpan` 4, sticky and scroller only on `virtualised`, no expander column without expansion, single-column sort with Shift | None |
| `virtualised measuring` (`:709-777`) | ADEQUATE | Zero-height layout, an empty table first, the last height kept, 1 px rows and spacers, an expansion kept in the offsets out of the window | None |

Isolation and determinism: `afterEach` restores mocks and clears `renders`. No timers, network
or storage are involved. `getBoundingClientRect` is stubbed per test. The new test builds its
fixture per test and uses describe-level callbacks, so their identity is controlled. The only
`data-table` stderr in the focused run and both full runs is the IR-002 warning.

Mutation run (reviewer, `review` cycle). The reviewer generated catalogue mutants over every
changed production line and added two manual mutants, `v3l1` and `v3l2`. These target the two
halves of the open-row comparator clause. The reviewer then ran `scope --since d816080 --previous
v2-mutation.json`, which also adds v2's own mutants. Results are in
`CAP-003-E1-S4-implementation-review-v3-mutation.json`, sha256
`f4e905399141df7507345c9bd99b71f86f445e5adeff4aaee28546624ff6f03b`. The command and suites are v2's:
`components/ui/data-table`, `components/token-literals` and `components/ui/vendoring` (139
tests), then `npx tsc --noEmit`. All four baselines exit 0 (139 passed each). No mutant log shows a
vitest "Test timed out", so no kill comes from machine load. No production line changed since the
baseline, so no mutant is `delta`.

| Mutant | Scope | State | Disposition |
|--------|-------|-------|-------------|
| `manual:v2d1` `(a.expansion?.renderExpansion === b.expansion?.renderExpansion &&` → `(a.expansion === b.expansion &&` | carried | **killed** | v2 IR-001 resolved. Exactly one test fails under it, `does not re-render an open earlier row … (IR-001)`, with `expected [ 'S0001', 'S0003', 'S0004', 'S0005' ] to not include 'S0001'` (`1 failed \| 138 passed`) |
| 131 other carried mutants (60 regenerated catalogue mutants, 37 catalogue mutants carried from v2's file under their earlier line ids, 32 manual `r1`-`r32`, `v2l4`, `v2l5`) | carried | 129 killed, 2 timeout | The two timeouts are v1's and v2's binary-search hangs (`:67`, `:68` off-by-one, 600 s), which count as detected |
| `manual:v3l1` `a.expansion?.getRowLabel === b.expansion?.getRowLabel` → `true` | late | killed | Fails only `shows a changed getRowLabel on an open row's expander` |
| `manual:v3l2` `a.expansion?.renderExpansion === b.expansion?.renderExpansion` → `true` | late | killed | Fails only `shows a changed renderExpansion in an open row …` |
| `manual:v2l1` top spacer loses `aria-hidden="true"` | late | survived | Not equivalent: T011 fixes `<tr data-spacer="top" aria-hidden="true" …>` (IR-001) |
| `manual:v2l3` sort button `h-5 gap-1 px-1 py-0` → `h-5 gap-1` | late | survived | Not equivalent: T009 fixes the class string; plan Other Notes, *`button` sizing inside a row* (IR-001) |
| `manual:v2l9` table loses `data-variant` | late | survived | Not equivalent: T009 fixes `<table data-variant={variant} …>` (IR-001) |
| `manual:v2l12` *Details* header loses `scope="col"` | late | survived | Not equivalent: T009 fixes every header as `<th scope="col">` and T010 adds *Details* to that row (IR-001) |
| `manual:v2l13` unsorted sort icon loses `aria-hidden` | late | survived | Not equivalent: T009 says the sort icon "has `aria-hidden="true"`" (IR-001) |
| `manual:v2l2` expander chevrons swapped | late | survived | Equivalent against the contract, as v2 found. T010 names the `ChevronDown`/`ChevronRight` pair but not which state shows which, and DEC-0307 makes `aria-expanded` the carrier of open or closed |

Totals: 140 mutants (132 carried, 0 delta, 8 late): 132 killed, 6 survived, 2 timeout. The six
survivors were `late` in v2 and stay `late` (`mutation-run.py scope`: a previous late survivor
stays late).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | Skill prerequisite gate, not counted among the 15 required checks; all eight checks passed |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | N/A | `READY`, twice; not counted. Without `--base-ref` it reports `BLOCKED` against the default branch (see Review Subject) |
| `npm run test -- src/components/ui/data-table.test.tsx` | component root | 0 | PASS | Narrowest story suite first: 1 file, 101 tests. One React `act()` warning, from the new test (IR-002) |
| `npm run test` | component root | 0 | PASS | Two runs, before and after `npm ci`. Both green with 95 files and 2381 tests, under a load average of about 560-860 and 240-710. The only `data-table` stderr block is the IR-002 warning |
| `npm run lint` | component root | 0 | PASS | Biome: 214 files, no findings, before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 214 files, no changes, before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output, before and after `npm ci` |
| `npm run build` | component root | 0 | PASS | 102 modules, before and after `npm ci`. Writes only ignored files under `src/factorflow/api/static/` |
| `npm ci` | component root | 0 | PASS | 308 packages added. 10 audit advisories (6 moderate, 2 high, 2 critical), none in `@tanstack`. Run after the mutation run, because every mutation clone links this `node_modules` |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 0795a6c7… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. The reviewer also re-hashed `cycle-4.patch` (`5136f0f5…`) and `red-cycle-4-open-row-memo.log` (`f76ee50c…`): each matches the evidence |
| `grep -nE "\b[0-9]+(\.[0-9]+)?(px\|rem\|em\|vh\|vw)\b\|#[0-9a-fA-F]{3,8}\b" web/src/components/ui/data-table.tsx` | component root | 1 | PASS | Prints nothing (DAC-E1-S4-3 story-specific check) |
| `grep -n "react-virtual\|react-window\|react-virtuoso" package.json` | component root | 1 | PASS | Prints nothing (DEC-0215) |
| `git diff 0795a6c7..HEAD -U0 -- package.json` | component root | 0 | PASS | Exactly one added line, `"@tanstack/react-table": "^8.21.3",` in `dependencies` |
| `git diff --exit-code 0795a6c7..HEAD -- web/src/screens tailwind.config.js design-system tsconfig.json vite.config.ts web/src/app web/src/api` | component root | 0 | PASS | Delivered files unchanged |
| `git diff 0795a6c7..HEAD --stat -- . ':!docs'` | component root | 0 | PASS | Only `package.json`, `package-lock.json`, `data-table.tsx`, `data-table.test.tsx` (ownership check) |
| DOM sweep at rows 0, 500, 1500 and 2990 (`data-table.test.tsx:416-423`) | component root | 0 | PASS | At most 37 `tbody tr`; part of the suite runs |
| `node_modules/@tanstack/react-table/LICENSE` read | component root | N/A | PASS | MIT License, Copyright (c) 2016 Tanner Linsley; `package.json` `"license": "MIT"`, version 8.21.3 |
| `git diff --exit-code d816080..HEAD -- web/src/components/ui/data-table.tsx package.json package-lock.json` | component root | 0 | N/A | Scope evidence: no production or manifest change since the baseline |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 0795a6c7..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 60 catalogue mutants. The reviewer appended `v3l1` and `v3l2` |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mutants-generated-plus.json --since d816080be4edb1bdc5704340f88723abc17fa19b --previous <stories>/CAP-003-E1-S4-implementation-review-v2-mutation.json --out <scratch>/mutants.json` | harness root | 0 | N/A | 140 mutants: 132 carried, 8 late; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/work --logs <scratch>/results-logs --command 'cd {workdir} && ln -sfn <component>/node_modules node_modules && npx vitest run components/ui/data-table components/token-literals components/ui/vendoring && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 3 | N/A | 132 killed, 6 survived, 2 timeout; four baselines exit 0. The exit code reports the six `late` survivors listed above. A first attempt exited 1 before running anything because the `--work-root` directory did not exist yet |
| Reviewer probes in a scratch clone of `8f4bf76` (`web/src/components/ui/probe.test.tsx`, never in the review subject) | scratch clone | 0 | N/A | P1: `virtualised`, module-level `renderExpansion` and `getRowLabel`, expand *Stock 3* in 50 rows, append 50 (same objects) inside `act`: `renders` has no `S0003` and the detail stays. P3: `virtualised` rendered without expansion, then with stable expansion props over the same data: `thead` has 3 cells (*Details*, *Symbol*, *Name*), the first body row 2 cells, 0 expander buttons (IR-003) |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |

### Validation Side Effects

- Before: HEAD `8f4bf76`, branch `usr/alvaro-de-jodra/CAP-003-E1-S4-run-20261108T150357Z`,
  clean working tree.
  - The first `code-revision` reading, taken while the first (default-base) state check was
    still running, was `sha256:3578378e…`. It did not recur. `git status` showed no tracked or
    untracked non-ignored change then or later.
  - Twelve back-to-back readings during a second state check, and every later reading, give
    `sha256:582b7fe3…`. That is the fingerprint `commit_revision` computes for a clean checkout of
    HEAD, so `reviewed_state_revision` is HEAD's.
- After: HEAD `8f4bf76`, the same branch, `code-revision`
  `sha256:582b7fe3f56f7be7af42a6dd784fd2c4b5c7e250fed49d60e70d0634f359507b`. The only untracked
  files are this report and its mutation file under `docs/`.
- Unexpected tracked-file changes: none.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - The mutation run and the probes worked in clones under the reviewer's scratch directory. The
    results are copied beside this report as `CAP-003-E1-S4-implementation-review-v3-mutation.json`.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 4 · **total 5**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | carried | Five plan-fixed attributes are still unpinned (v2 IR-002) |
| IR-002 | LOW | delta | The new IR-001 test prints a React `act()` warning again |
| IR-003 | LOW | late | Turning expansion on after the first render leaves memoised rows without an expander |
| IR-004 | LOW | carried | `aria-rowcount` states the loaded count while more pages exist (v2 IR-003) |
| IR-005 | LOW | carried | Plan deviations are still recorded only in the TDD evidence (v2 IR-004) |

### IR-001 — Five plan-fixed attributes are still unpinned (v2 IR-002)

- **Severity**: MEDIUM
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is incomplete; AC-25, AC-26 and DAC-E1-S4-2 context)
- **Tasks**: T009, T010, T011
- **Files**: `web/src/components/ui/data-table.tsx:382` (top spacer `aria-hidden`), `:358` (`h-5 gap-1 px-1 py-0`), `:326` (`data-variant`), `:338` (*Details* `scope="col"`), `:367` (unsorted sort icon `aria-hidden`)
- **Claim challenged**: The tests pin the markup T009 to T011 fix.
- **Observed evidence**:
  - Cycle 4 left this finding open on purpose: "IR-002 cannot block".
  - The same five reviewer mutants survive: `v2l1` (top spacer `aria-hidden`), `v2l3` (`px-1 py-0`), `v2l9` (`data-variant`), `v2l12` (*Details* `scope="col"`) and `v2l13` (unsorted icon `aria-hidden`).
  - `mutation-run.py scope` keeps them `late`, because they were late survivors in v2.
- **Expected evidence/behavior**:
  - T011: `<tr data-spacer="top" aria-hidden="true" …>`.
  - T009: `className="h-5 gap-1 px-1 py-0"`, `<table data-variant={variant} …>`, every header `<th scope="col">`, and the sort icon "has `aria-hidden="true"`".
- **Impact**:
  - Without `aria-hidden`, the top spacer is exposed to assistive technology as an empty row once a `virtualised` table scrolls.
  - Without `px-1 py-0`, the sort button takes S1's wider padding inside its 24 px box.
  - The other three regressions are silent.
  - The finding carries v2's severity. Its survivors are `late`, so it does not make a test `WEAK` and cannot block.
- **Required remediation**: Optional. Assert the five attributes against the planned strings so that `v2l1`, `v2l3`, `v2l9`, `v2l12` and `v2l13` each fail. `v2l2` is equivalent and needs nothing.

### IR-002 — The new IR-001 test prints a React `act()` warning again

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T004, T006, T014
- **Files**: `web/src/components/ui/data-table.test.tsx:900-920` (the `view.rerender(...)` at `:916`)
- **Claim challenged**: Cycle 3 says "data-table.test.tsx 100 passed with no act() warning", and v2 recorded v1 IR-008 as resolved because the suites print no `data-table` stderr. Cycle 4's green evidence says only that 101 tests pass.
- **Observed evidence**:
  - The focused run and both full runs print `Warning: An update to DataTable inside a test was not wrapped in act(...)` under `does not re-render an open earlier row … (IR-001)`, with the stack at `data-table.tsx:165`.
  - The committed RED log `red-cycle-4-open-row-memo.log` contains the tail of the same warning.
  - The test calls `view.rerender(...)` with new `data` and does not await it. The append test at `:571-588` avoids the same warning by awaiting the rerender inside `act`. Its comment at `:579` explains why: TanStack resets its own page state in a microtask after `data` changes.
- **Expected evidence/behavior**: v1 IR-008's remediation, verified in v2: the `data-table` suites print no `act()` warning.
- **Impact**:
  - The warning is noise in every run.
  - TanStack's queued state update lands outside `act`, after the test's synchronous assertions, so the test judges only the synchronous render.
  - At HEAD the open row stays memoised either way: probe P1 awaits the rerender inside `act` and still sees no re-render. So no behaviour escapes, and the finding is LOW.
- **Required remediation**: Await the rerender inside `act` (`await act(async () => { view.rerender(...) })`), as `:580-582` does, so the file prints no warning again.

### IR-003 — Turning expansion on after the first render leaves memoised rows without an expander

- **Severity**: LOW
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: N/A (AC-25 and DAC-E1-S4-2 context; see Impact)
- **Tasks**: T010, T011
- **Files**: `web/src/components/ui/data-table.tsx:209-220` (comparator), `:151-164` (expander cell inside the memoised row), `:337-341` (the *Details* header, rendered outside the memo), `:384-395` (row call site)
- **Claim challenged**: The doc comment (l.201-208) says a collapsed row "reads them when it opens and stays memoised". DEC-0307 says `renderExpansion` plus `getRowLabel` "turn on per-row expansion".
- **Observed evidence**:
  - For a collapsed row, `!a.expanded` short-circuits the open-row clause. The comparator never compares whether `expansion` is present, so a collapsed row does not re-render when expansion props appear or disappear.
  - Reviewer probe P3 renders a 5-row `virtualised` table without expansion props, then rerenders it with stable ones over the same data. `thead` then has 3 cells (*Details*, *Symbol*, *Name*), the first body row has 2 cells, and there is no expander button.
  - By reading, `windowed` is passed to the row but not compared either. A row would keep or lack `aria-rowindex` after a `variant` change on the same mounted table.
- **Expected evidence/behavior**:
  - The header and body agree on the column set. T010: "A table given `renderExpansion` … gains a leading expander column whose header is a `th` with the visually hidden text *Details* … and whose cell is `<Button …>`".
  - Every row that can expand shows the named expander (DAC-E1-S4-2).
  - No artifact says whether expansion props, or the variant, may change on a mounted table.
- **Impact**:
  - Only a consumer that adds or removes expansion props, or switches variant, on a mounted table hits this.
  - No planned consumer is known to do so. CAP-003-E7-S2 puts Coverage on `virtualised` with per-row expansion (plan dependency table, DAC-E7-11). DEC-0392 (provisional) gives Followed stocks (CAP-003-E7-S3) no expansion at all.
  - It is not a CRITICAL late finding because no acceptance criterion or decision defines that runtime change. The comparator's omission also follows T011's own comparator text.
  - The lines are unchanged since v2, so the scope is `late`.
- **Required remediation**: Optional. Either compare the presence of `expansion` (and `windowed`) in the row comparator, with a test that turns expansion on after mount, or state in the doc comment and DEC-0307's owning design (`ui-components` 2.1) that both are fixed for a mounted table.

### IR-004 — `aria-rowcount` states the loaded count while more pages exist (v2 IR-003)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/ui/data-table.tsx:328`
- **Claim challenged**: `aria-rowcount={rowCount + 1}` "keep[s] the table's size announced while windowed (the CAP-002 precedent)" (plan Other Notes).
- **Observed evidence**:
  - The line is unchanged since v1.
  - Cycle 4 repeats that this is "the owner's to decide as cycle-3 recorded".
  - No decision record or follow-up about it exists under `projects/factorflow-v2/decisions/`: `grep -il aria-rowcount` finds none.
- **Expected evidence/behavior**: WAI-ARIA 1.2 `aria-rowcount`: "If the total number of rows is unknown, authors MUST set the value of aria-rowcount to -1". The CAP-002 precedent announces the server's total (`results-table.tsx:701`).
- **Impact**: While pages remain, screen-reader users hear the loaded count as the table size. T011 prescribes this behaviour, so the finding is LOW.
- **Required remediation**: Unchanged. Set `-1` while `hasMore` is true, or add a total-count prop through DEC-0307's owning design, and pin the result. If the owner is to decide, file it against component design `ui-components` 2.1, so that the question does not live only in a YAML description.

### IR-005 — Plan deviations are still recorded only in the TDD evidence (v2 IR-004)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T010, T011, T014
- **Files**: `CAP-003-E1-S4-tasks.md` (T009 `manualSorting: true`, T010 `autoResetExpanded: false`, T011 comparator, measurement and prefetch key, T014 five cycles); `CAP-003-E1-S4-tdd-evidence.yaml` header and the cycle-3 and cycle-4 descriptions; `data-table.tsx:256-258`
- **Claim challenged**: Ticked tasks describe the code as delivered.
- **Observed evidence**: Since v2, the task plan changed only in `last_reworked_review`. Cycle 4 says the "IR-004 deviations stay recorded in this file".
- **Expected evidence/behavior**: Story-coding G asks only that deviations be noted, which the evidence does. So this stays LOW.
- **Impact**: A maintainer reading T009 or DEC-0307 expects a `manualSorting` guard that is not there. Wiring a sorted row model later would sort the loaded page client-side, which spec section 4 forbids, and nothing would fail.
- **Required remediation**: Unchanged. Set `manualSorting: true` and `autoResetExpanded: false`, or note each deviation, including the T011 comparator clause, beside the task it changes.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 | RESOLVED | `data-table.test.tsx:900-920` pins an open earlier row with stable callbacks as not re-rendered on append. `manual:v2d1` is killed by that test alone (`1 failed \| 138 passed`). The RED in `red-cycle-4-open-row-memo.log` is reproduced. Probe P1 shows the same on `virtualised` at HEAD |
| v2/IR-002 | STILL OPEN | `v2l1`, `v2l3`, `v2l9`, `v2l12` and `v2l13` still survive (`late`). Carried as IR-001 |
| v2/IR-003 | STILL OPEN | `data-table.tsx:328` is unchanged and no owner question is filed. Carried as IR-004 |
| v2/IR-004 | STILL OPEN | The task plan text is unchanged and deviations appear only in the TDD evidence. Carried as IR-005 |

## Scope and Plan Deviations

- **Justified deviations, verified:**
  - The deviations v1 and v2 verified still hold: prefetch keyed by first row id and count;
    heights re-measured on every render; plan cycles 2 to 5 merged into cycle-2; `manualSorting`
    and `autoResetExpanded` omitted (inert in TanStack 8.21.3); the T011 comparator's open-row
    clause (v1 IR-005). IR-005 asks that they appear in the plan.
  - Cycle 4 is test-only and records `mutation: {not_applicable: …}`, which T014 allows for a
    cycle with no production change. The reviewer's run covers every production line anyway.
- **RED evidence:** Cycle-4's RED is meaningful. The new test fails against the v2 review's
  mutant, the regression it exists to catch. The reviewer's mutation run reproduces this
  independently.
- **Evidence integrity:** Cycle-4's `diff_sha256` matches `cycle-4.patch`. That patch is
  byte-identical to `git diff d816080..56a446b` over the code paths, and `red_log_sha256`
  matches its log.
- **Bookkeeping:** Every task is ticked and every tick has implementation behind it. The commit
  messages of `56a446b` and `8f4bf76` match their changes. Both carry `Decision-Id: DEC-0306` and
  `DEC-0307`, the decisions the story is built under.
- **Out of scope:** None. No file outside the plan's ownership list, the TDD evidence and the
  review reports changed.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`) for `CAP-003-E1-S4`.
- **Required action**:
  - Synchronize the `ui-components` documentation with `data-table.tsx` as delivered.
  - Optionally, in a later rework or through the owner:
    - quiet the IR-002 warning;
    - pin IR-001's attributes;
    - decide IR-003 (expansion props fixed per mounted table, or compared);
    - decide IR-004 (`aria-rowcount` while `hasMore`);
    - record the IR-005 deviations in the plan.
  - This review recorded no decision: every judgment above follows from the story, the plan,
    DEC-0215, DEC-0306, DEC-0307 and the data-table spec.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005
