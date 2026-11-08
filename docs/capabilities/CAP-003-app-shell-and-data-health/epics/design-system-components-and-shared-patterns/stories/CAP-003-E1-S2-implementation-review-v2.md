---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S2"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T16:07:50Z"
reviewed_head: "15ee9b4037a07d5cfa39f0865bd701da79995309"
review_base: "44a2dfef0551baed9a29da666a8ed800e950d311"
reviewed_state_revision: "sha256:b76a5bd1bdb353154e54a5a119648aac582b33e7bac24a8953c06f1d5d7945f3"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E1-S2
    artifact_version: 1
    content_revision: sha256:b784ede7bee859cc50a651b38f61212c819575f73402fd3bf91a5ede294cebd1
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T16:11:34Z
  source_artifacts:
    - id: CAP-003-E1-S2
      version: "1 (sha256:b784ede7bee859cc50a651b38f61212c819575f73402fd3bf91a5ede294cebd1)"
    - id: CAP-003-E1-S2-tasks
      version: "1 (updated 2026-11-08; last_reworked_review CAP-003-E1-S2-implementation-review-v1.md)"
    - id: CAP-003-E1-S2-tdd-evidence
      version: "cycle-1 to cycle-10"
    - id: CAP-003-E1-S2-implementation-review-v1
      version: "1 (baseline; reviewed_head 5fa4bfd9004d1541122966602af7b2453998049f)"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: design-system/components/input/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/select/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/checkbox/design-spec.md
      version: "beta, last_reviewed 2026-10-15"
    - id: design-system/components/radio-group/design-spec.md
      version: "beta, last_reviewed 2026-10-15"
    - id: DEC-0299
      version: "provisional, owner_reviewed false"
    - id: DEC-0300
      version: "provisional, owner upheld"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 6/6 satisfied |
| Planned tasks | 23/23 verified |
| Required validation | 12/12 passed |

This is a re-review. Its baseline is review v1 (`CHANGES-REQUIRED`, reviewed head `5fa4bfd`).
The rework is cycle 10 (`18e7d13`) plus a bookkeeping commit (`15ee9b4`).

All seven v1 findings are resolved, and the repository shows it:

- **v1 IR-001 to IR-004.** The reviewer reran all 41 baseline mutants against the current
  tests. All 41 are killed, including the 20 that survived in v1.
- **v1 IR-005.** `SelectLabel` now carries `text-muted-foreground`. A test pins it, and the
  reviewer's mutant that reverts it is killed.
- **v1 IR-006 and IR-007.** The checkbox doc comment now hands the 24 px target to the
  consumer. `textarea.test.tsx` no longer claims TC-COMP-010 or DAC-E1-S2-1.

All 12 required validation checks pass: `npm ci`, the full suite (89 files, 2227 tests), lint,
format, `tsc`, build, the TDD-evidence lint, and five story-specific checks. The working tree
was clean before and after.

The reviewer also ran 13 new mutants. One is `delta` and is killed. The other 12 are `late`:
7 are killed and 5 survive. The survivors change behaviour the plan or a design-system spec
fixes, so none is equivalent. Each sits on a production line unchanged since v1, so v1 could
have found it. Under skill H, *Re-review scope*, each is MEDIUM at most and none makes its test
`WEAK`. The production code is correct on every one of them.

- **IR-001 (MEDIUM, late).** The checkbox mark colour and the input suffix text size are unpinned.
- **IR-002 (MEDIUM, late).** Three size or offset literals can be added undetected: the checkbox
  icon, the radio dot and the radio card ring offset.
- **IR-003 (LOW, delta).** The cycle-10 evidence records no RED and no mutant for its one
  production change.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S2-run-20261108T150357Z` |
| HEAD | `15ee9b4037a07d5cfa39f0865bd701da79995309` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z`, passed as `--base-ref` by the supervised driver. Merge base `44a2dfef0551baed9a29da666a8ed800e950d311`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 189 since the review base: 13 commits from `79c2fba` to `15ee9b4`. 38 files changed since the baseline head |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `5fa4bfd9004d1541122966602af7b2453998049f`, mutation file `CAP-003-E1-S2-implementation-review-v1-mutation.json`. `git merge-base --is-ancestor 5fa4bfd HEAD` exit 0 |

State check: `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — review changes were
reworked; a new review version is required`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/ui/form.tsx` | added | AC-25, DAC-E1-S2-2; T015 (DEC-0299, DEC-0300). Unchanged since v1 |
| `web/src/components/ui/input.tsx` | added | AC-25, AC-26, DAC-E1-S2-2; T016. Unchanged since v1 |
| `web/src/components/ui/textarea.tsx` | added | AC-25, AC-26; T017. Unchanged since v1 |
| `web/src/components/ui/checkbox.tsx` | added | AC-25, DAC-E1-S2-1; T018. Delta: doc comment lines 17-20, the v1 IR-006 remediation |
| `web/src/components/ui/radio-group.tsx` | added | AC-25, DAC-E1-S2-1; T019. Unchanged since v1 |
| `web/src/components/ui/select.tsx` | added | AC-25, DAC-E1-S2-1; T020. Delta: line 109 `SelectLabel` gains `text-muted-foreground`, the v1 IR-005 remediation (select spec section 6) |
| `web/src/components/ui/form.test.tsx` | added | TC-COMP-010; T007, T008. Unchanged since v1 |
| `web/src/components/ui/input.test.tsx` | added | TC-COMP-010; T009. Delta: lines 19-36 (v1 IR-001, IR-002, IR-003) |
| `web/src/components/ui/textarea.test.tsx` | added | AC-25; T010. Delta: lines 7-8 relabelled (v1 IR-007) and lines 29-44 (v1 IR-001 to IR-003) |
| `web/src/components/ui/checkbox.test.tsx` | added | TC-COMP-009; T006, T013. Delta: lines 86-87 and 90-94 (v1 IR-002, IR-004) |
| `web/src/components/ui/radio-group.test.tsx` | added | TC-COMP-009; T004, T011. Delta: lines 84-101 and 166-174 (v1 IR-004, IR-003) |
| `web/src/components/ui/select.test.tsx` | added | TC-COMP-009; T005, T012. Delta: lines 109-116, 129-148 and 195 (v1 IR-001, IR-002, IR-003, IR-005) |
| `web/src/components/token-literals.test.ts` | modified (+28 appended) | TC-COMP-011 scan half; T003. Unchanged since v1 |
| `web/src/components/ui/vendoring.test.ts` | modified (+41 appended) | TC-COMP-011 packages half; T002. Unchanged since v1 |
| `package.json` | modified | DAC-E1-12, DAC-E1-S2-3; T014. Exactly seven `dependencies` added. Unchanged since v1 |
| `package-lock.json` | modified | DAC-E1-12, DAC-E1-S2-3; T014. Unchanged since v1 |
| `.../CAP-003-E1-S2.md` | modified | `status: in-review` (story-coding hand-off). Unchanged since v1 |
| `.../CAP-003-E1-S2-tasks.md` | modified | 23 ticks; delta: `updated: 2026-11-08` and `last_reworked_review: CAP-003-E1-S2-implementation-review-v1.md` |
| `.../CAP-003-E1-S2-tdd-evidence.yaml` | added | T023. Delta: cycle 10 appended |
| `.../CAP-003-E1-S2-implementation-review-v1.md` and `-v1-mutation.json` | added | The baseline review and its mutation results (reviewer-authored, commit `254fe73`) |
| `.../CAP-003-E1-S2-evidence/**` (168 files) | added | T023. Delta: `cycle-10.patch`, `red-cycle-10-review-survivors.log`, `mutation-cycle-10-results.json` and its 25 logs |

The reviewer confirmed that these protected paths are untouched since the review base
(`git diff --exit-code` exit 0):

- `tailwind.config.js` and `design-system/theme.css`;
- `tsconfig.json` and `vite.config.ts`;
- `web/src/app`, `web/src/api` and `web/src/screens`;
- `web/src/test-setup.ts`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-26 | SATISFIED | Every spacing, size, radius, ring and colour class in the six files resolves to a theme token. Examples: `input.tsx:23`, `textarea.tsx:27`, `checkbox.tsx:32`, `radio-group.tsx:28,57,64,67`, `select.tsx:31,81,109,122,127` and `form.tsx:50-51,129,146,184,203`. The built `index-mV7nGlvM.css` has `.h-7{height:var(--space-7)}` and `.h-row{height:var(--row-height)}`. Its `.ring` uses `var(--focus-ring-width)` and its colours use `hsl(var(--token))` | `token-literals.test.ts:254-280` finds no literal in any of the six. The spec token choices are pinned at `input.test.tsx:19-36`, `textarea.test.tsx:29-44`, `radio-group.test.tsx:166-174` and `select.test.tsx:109-116,129-148,193-200` | The six v1 IR-003 token mutants and nine v1 IR-002 literal mutants are now killed. Late gaps IR-001 and IR-002 are non-blocking |
| AC-25 | SATISFIED | Radix supplies the radio, select and checkbox keyboard contracts (`radio-group.tsx:25`, `select.tsx:15,27`, `checkbox.tsx:28`). Every control carries a `--ring` focus class (`input.tsx:23`, `textarea.tsx:27`, `checkbox.tsx:32`, `radio-group.tsx:57`, `select.tsx:31`) | Focus ring pinned on input, textarea and the select trigger (`input.test.tsx:22-31`, `textarea.test.tsx:31-41`, `select.test.tsx:111-113`). Keyboard paths: `radio-group.test.tsx:60-115`, `select.test.tsx:70-99`, `checkbox.test.tsx:35-51,105-118`, `textarea.test.tsx:51-75`, `form.test.tsx:151-164` | v1 IR-001's three focus-ring mutants and IR-004's `loop={false}` are killed |
| DAC-E1-12 | SATISFIED | No literal in the six sources. `package.json` adds only the seven packages. Each lock licence is MIT, and the reviewer opened each `node_modules/<pkg>/LICENSE`: all MIT | `vendoring.test.ts:99-138`, `token-literals.test.ts:254-280`. Shipped-literal absence is pinned at `input.test.tsx:34-35`, `textarea.test.tsx:43`, `checkbox.test.tsx:87`, `select.test.tsx:115,130,143,146` | All nine v1 IR-002 restorations are killed. Three new late literal additions survive (IR-002), but the code contains none of them |
| DAC-E1-S2-1 | SATISFIED | Radio: `radio-group.tsx:25-30` leaves `orientation` unset and keeps Radix's default `loop`. Select: `select.tsx:15,27-40,72-100`. Checkbox: `checkbox.tsx:28-44` | `radio-group.test.tsx:60-101` covers one tab stop, both arrow axes, and wrap in both directions. `select.test.tsx:70-99`. `checkbox.test.tsx:35-51` (Space toggles, Enter ignored) and `:90-94` (no mark when unchecked) | `loop={false}` and Indicator `forceMount` are killed. The wrap test fails under `loop={false}` (log checked) |
| DAC-E1-S2-2 | SATISFIED | `input.tsx:37-39,50` names the field by `aria-labelledby` = label id then suffix id (DEC-0299). `form.tsx:117,144,166-168` set the label id, `aria-labelledby`, `aria-describedby` (message only in error) and `aria-invalid`. `form.tsx:202` sets `role="alert"` only while an error shows | `form.test.tsx:98-131` (TC-COMP-010), `input.test.tsx:47-87` | All 7 `form.tsx` and 8 `input.tsx` naming mutants from v1 are killed. So are the plan's hand-written `aria-labelledby`, `noValidate`, `role` and suffix-id mutants |
| DAC-E1-S2-3 | SATISFIED | The six files are under `web/src/components/ui/`. The `package.json` diff from the base is exactly seven added `dependencies` lines | `token-literals.test.ts:254-280` (scan half), `vendoring.test.ts:99-138` (packages half) | Six planted literals fail the scan, each naming its file, among them the plan's `min-h-[80px]` in `textarea.tsx` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | The reviewer cloned the review base `44a2dfef` into scratch and ran `npm run test` there: 83 files, 2167 tests, exit 0. S1's `utils.ts`, the scan exports and `vendoring.test.ts` are present at the base | Baseline reproduced independently |
| T002 | complete | VERIFIED | `vendoring.test.ts:99-138` uses an independent fixture. It checks (a) each package in `dependencies`, (b) its lock licence, and (c) none in `devDependencies` | Unchanged since v1. Adequate |
| T003 | complete | VERIFIED | `token-literals.test.ts:254-280` takes an independent list of six and checks `isScannedSource`, the directory prefix, and that `literalsIn` equals `[]` | Unchanged since v1. Six plants killed |
| T004 | complete | VERIFIED | `radio-group.test.tsx:60-115`: Tab path, both arrow axes, `changeSpy` values, one tab stop, Shift+Tab to the checked card. Lines 84-101 add wrap from the last card to the first and back | The planned `loop` kill is now achieved (carried `radio-group.tsx:manual:review-1` killed) |
| T005 | complete | VERIFIED | `select.test.tsx:70-99`: combobox name, `aria-expanded`, Enter opens with the current value highlighted, ArrowDown and Enter select, focus returns, Space reopens, Escape closes | Unchanged since v1. Adequate |
| T006 | complete | VERIFIED | `checkbox.test.tsx:35-51`: Tab focus, Space toggles both ways, spy values, Enter ignored | Unchanged since v1. Adequate |
| T007 | complete | VERIFIED | `form.test.tsx:98-131`: steps (1) to (4) as planned | Unchanged since v1. Adequate |
| T008 | complete | VERIFIED | `form.test.tsx:135-256`: (a) to (e), plus valid submit, valid-state children, and hint and error tokens | Unchanged since v1. Adequate |
| T009 | complete | VERIFIED | `input.test.tsx:9-115`: (a) to (g). Lines 19-36 add the focus ring, the text and placeholder tokens, and the absence of the shipped ring and breakpoint classes | All 8 carried `input.tsx` mutants are killed. Late gap: suffix size (IR-001) |
| T010 | complete | VERIFIED | `textarea.test.tsx:21-87`: variant, rows, `resize-none`, Enter, Escape, Tab, caller rows, ref. Lines 29-44 add the focus ring, surface, size and placeholder tokens and the absence of the shipped ring classes | All 5 carried `textarea.tsx` mutants are killed. TC label corrected (v1 IR-007) |
| T011 | complete | VERIFIED | `radio-group.test.tsx:117-182`: name and description, title and description blocks, `aria-hidden` indicator box, `cards` grid, no `aria-orientation`, checked ring, indicator fill `text-primary` (lines 166-174), whole-card click | Carried `review-3` (fill token) is killed. Late gaps: dot size and card ring offset (IR-002) |
| T012 | complete | VERIFIED | `select.test.tsx:101-214`. Lines 109-116 add the trigger focus ring and text size and the absence of `ring-2` and `ring-offset`. Lines 129-148 add no shadow or numeric `max-h`, the tokenised max height, item padding and radius, and the indicator box and mark size. Line 195 adds the group label token | All 7 carried `select.tsx` mutants and delta `review2-1` are killed |
| T013 | complete | VERIFIED | `checkbox.test.tsx:53-118`: label click, `mixed`, contract classes, no `border-primary`, no `ring-offset-` (line 87), no mark while unchecked (lines 90-94), check and dash icons, Space in a form | Carried `review-1` and `review-2` are killed. Late gaps: mark colour (IR-001) and icon size (IR-002) |
| T014 | complete | VERIFIED | `package.json` and `package-lock.json`: `react-hook-form` 7.91.0, `zod` 4.6.7, `@hookform/resolvers` 7.0.3, `@radix-ui/react-label` 2.1.17, `-radio-group` 1.5.1, `-checkbox` 1.4.1, `-select` 2.4.1. Every lock entry and `LICENSE` file is MIT | Unchanged since v1 |
| T015 | complete | VERIFIED | `form.tsx:1-211` as planned (DEC-0299, DEC-0300) | Unchanged since v1 |
| T016 | complete | VERIFIED | `input.tsx:17-57` as planned | Unchanged since v1 |
| T017 | complete | VERIFIED | `textarea.tsx:16-34` as planned | Unchanged since v1 |
| T018 | complete | VERIFIED | `checkbox.tsx:22-47` as planned. Doc comment lines 17-20 now state that the consumer's label row carries the 24 px target with `minHeight: "var(--control-min-target)"`, as `filters-pane.tsx:265` does | Delta is comment-only; the literal scan still passes (units written with a space) |
| T019 | complete | VERIFIED | `radio-group.tsx:19-81` as planned | Unchanged since v1 |
| T020 | complete | VERIFIED | `select.tsx:15-147` as planned. `SelectLabel` (line 109) now adds `text-muted-foreground` | A justified addition to T020's class list: select spec section 6, "Group label — `--muted-foreground`" (v1 IR-005) |
| T021 | complete | VERIFIED | Whole suite green: 89 files, 2227 tests. The `package.json` diff is exactly seven lines, the protected-path diff is empty, and `grep -rn '"@/' web/src/components/ui` exits 1 | Reviewer rerun |
| T022 | complete | VERIFIED | The reviewer reran lint, format, `tsc` and build: all exit 0 | Reviewer rerun |
| T023 | complete | VERIFIED | `CAP-003-E1-S2-tdd-evidence.yaml` has ten cycles, all `APPROVED`, none with drift. `check-tdd-evidence.py --require-logs` reports 0 errors and 0 warnings. Cycle 10's `cycle-10.patch` matches `git diff 254fe73 18e7d13` line for line (ignoring `index` lines). Its mutation file scores 20 of 20 killed | Cycle 10 records no RED and no mutant for its production change (IR-003, LOW) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `radio-group.test.tsx` / TC-COMP-009 (radio part) | ADEQUATE | Real Tab and Shift+Tab focus path. Both arrow axes move focus and check. Wrap from last to first and back. `onValueChange` values; one tab stop; no `aria-orientation`; exact name and description; card, ring and indicator-fill classes; whole-card click. Killed: `loop={false}`, both orientations, Indicator removal, fill token swap, card `aria-labelledby` removal | Late, non-blocking (IR-002): restored `h-2.5 w-2.5` dot and added card `focus-visible:ring-offset-2` survive |
| `select.test.tsx` / TC-COMP-009 (select part) | ADEQUATE | Combobox name; `aria-expanded`; Enter and Space open; current value highlighted; arrows and Enter select; focus returns; Escape closes without change; typeahead. Trigger, content, option, indicator, label and separator token classes, and the absence of each shipped literal. Killed: all 7 carried, the catalogue `position` mutant and delta `review2-1` | None found |
| `checkbox.test.tsx` / TC-COMP-009 (checkbox part) | ADEQUATE | Tab focus; Space toggles both ways with spy values; Enter ignored; label click; `mixed`; contract classes; no `border-primary`; no `ring-offset-`; no mark while unchecked; Check and Minus icons; Space in a form does not submit. Killed: carried `review-1`, `review-2`, and plan `border-primary` | Late, non-blocking: mark colour (IR-001) and icon size (IR-002) survive |
| `form.test.tsx` / TC-COMP-010 | ADEQUATE | Name *History depth years*; no error element without an error; describedby ids never hold the error copy; error on blur with `role="alert"`, its id in `aria-describedby`, and the accessible description; cleared on change; variants; `novalidate`; two errors at once with the first focused and the value kept; radio group named by `FormLabel`; label error colour; hint and error tokens | None found. All 11 `form.tsx` mutants are killed: 4 catalogue, 7 carried manual and 3 plan mutants (`aria-labelledby`, `noValidate`, `role`) |
| `input.test.tsx` / TC-COMP-010 (suffix half) | ADEQUATE | Variant and type mapping; numeric classes; suffix in the name in label-then-suffix order; native labelling intact; pass-through `aria-labelledby`; suffix-only name; invalid border; Escape; ref; focus ring, text and placeholder tokens; no `ring-2`, `ring-offset` or `md:` | Late, non-blocking: suffix `text-base` to `text-sm` survives (IR-001) |
| `textarea.test.tsx` (T010; `// Implements AC-25`) | ADEQUATE | `rows="4"`; `resize-none`; padding, surface, size and placeholder tokens; focus ring; no `text-sm`, `ring-2` or `ring-offset`; Enter inserts a newline without submitting; Escape; Tab; caller rows; ref | None found. All 5 carried and the catalogue `rows = 5` mutant are killed |
| `token-literals.test.ts` "form family is scanned and clean" / TC-COMP-011 | ADEQUATE | Independent list of six; `isScannedSource`; directory prefix; no literal; planted `min-h-[80px]` | None. Six reviewer plants (one per file) fail the scan, naming the file |
| `vendoring.test.ts` "form family packages" / TC-COMP-011 | ADEQUATE | The seven in `dependencies` against an independent fixture; lock licence per package; none in `devDependencies` | None. The "only seven" half is a diff check the reviewer reran |

The tests are deterministic. The reviewer ran the five changed component test files three more
times, and each run passed 41 of 41. Radix runs unmocked. Only the jsdom gaps are stubbed:
`ResizeObserver` in `beforeEach`, and the pointer, scroll and `matches` shims in `beforeAll`,
which `afterAll` restores. Every new assertion is on a rendered role, attribute, element or class
of the component under test, never on mock setup.

**Mutation run (E.9).**

1. `generate` over `44a2dfef..HEAD` produced 8 catalogue mutants: 6 `negate-boolean`, 1
   `drop-field-copy` and 1 `off-by-one`.
2. The reviewer added 13 manual mutants. Six are its own (`review2-*`), one on the delta line and
   five from reading lines the baseline did not mutate. Seven are from the plan's *Hand-written
   mutants* list (`plan-*`) that v1 did not run in that form.
3. `scope --since 5fa4bfd --previous <v1 mutation file>` added v1's 33 manual mutants. All 41 v1
   mutants still apply.
4. The scoped set is 54 mutants: 41 `carried`, 1 `delta` and 12 `late`.
5. `run` used 4 jobs with the command `ln -sfn <component>/node_modules node_modules && npx vitest
   run components/ui components/token-literals && npx tsc --noEmit`.

All four baselines were green, with 12 files and 126 tests. Result: 49 killed and 5 survived, all
5 `late`. Every survivor's log shows 12 files and 126 tests passing, plus `tsc` passing. The results
are in `CAP-003-E1-S2-implementation-review-v2-mutation.json` beside this report (sha256
`89204bd9752dae969fdc655c0d78993da295433a212dc5618e63f6d9bc45c4fb`).

The six literal plants ran separately against `npx vitest run components/token-literals`, because
they test the scan, not the component suites. All six were killed. Those results are not part of
the carried mutation file.

| Mutant | Scope | State | Equivalence judgement |
|--------|-------|-------|-----------------------|
| All 8 catalogue mutants (`form.tsx:107,115,147,195`, `input.tsx:40,44`, `select.tsx:82`, `textarea.tsx:21`) | carried | killed | n/a |
| v1 manual `input.tsx:manual:review-1` to `-8`, `textarea.tsx:manual:review-1` to `-5`, `checkbox.tsx:manual:review-1`, `-2`, `radio-group.tsx:manual:review-1` to `-4`, `select.tsx:manual:review-1` to `-7`, `form.tsx:manual:review-1` to `-7` (33) | carried | killed | n/a. Includes all 20 v1 survivors |
| `select.tsx:manual:review2-1` (`SelectLabel` `text-muted-foreground` dropped) | delta | killed | n/a. `select.test.tsx:193-200` fails |
| `form.tsx:manual:plan-1` (`aria-labelledby` deleted), `plan-2` (`noValidate` deleted), `plan-3` (`role={undefined}`) | late | killed | n/a |
| `input.tsx:manual:plan-4` (suffix id dropped from `aria-labelledby`) | late | killed | n/a |
| `radio-group.tsx:manual:plan-5` (card `aria-labelledby` deleted), `plan-6` (`orientation="horizontal"`) | late | killed | n/a |
| `checkbox.tsx:manual:plan-7` (`border-input` to `border-primary`) | late | killed | n/a |
| `checkbox.tsx:manual:review2-2` (Indicator `text-current` to `text-primary`) | late | survived | Not equivalent. Checkbox spec section 6: "Checked fill / mark — `--primary` / `--primary-foreground`". The root fills with `--primary` (`checkbox.tsx:32`), so a `--primary` mark is invisible on it (IR-001) |
| `input.tsx:manual:review2-6` (suffix `text-base` to `text-sm`) | late | survived | Not equivalent. T016 fixes the suffix span as `text-base text-muted-foreground`. UX design 0.7 makes `--text-sm` the dense-table size (IR-001) |
| `checkbox.tsx:manual:review2-3` (Check icon `h-4 w-4` to `h-3.5 w-3.5`) | late | survived | Not equivalent. T018 fixes `Check` at `h-4 w-4`. `3.5` is not a theme key, so it resolves to Tailwind's default `0.875rem`, a size literal outside the theme (DAC-E1-12) (IR-002) |
| `radio-group.tsx:manual:review2-4` (dot `h-2 w-2` to shadcn's `h-2.5 w-2.5`) | late | survived | Not equivalent. T019 fixes `h-2 w-2`. Other Notes: fractional steps such as `h-2.5` "round to the nearest key". `2.5` resolves to Tailwind's default `0.625rem` (DAC-E1-12) (IR-002) |
| `radio-group.tsx:manual:review2-5` (card gains `focus-visible:ring-offset-2`) | late | survived | Not equivalent. Other Notes, *Removed shipped classes*: `ring-offset-*` is "a literal offset". shadcn's radio item ships `focus-visible:ring-offset-2` (DAC-E1-12) (IR-002) |

## Independent Validation

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
`<component>` is `repos/factorflow-v2/FactorFlow-v2` under it. The npm and npx commands ran
from the component root, as the tech stack's working directory `.` requires.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir <component> --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `44a2dfef0551baed9a29da666a8ed800e950d311` |
| `git merge-base --is-ancestor 44a2dfef… HEAD` and `… 5fa4bfd… HEAD` | component root | 0 | PASS | The review base and the baseline head are both ancestors of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir <component> --base 44a2dfef… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings (ten cycles) |
| `npm ci --prefix <component>` | harness root | 0 | PASS | 10 audit advisories, all in packages that predate this story (none of the 45 added). An `allow-scripts` warning lists the biome, esbuild and fsevents install scripts. Lint, format and build pass afterwards |
| `npx vitest run src/components/ui/{form,input,textarea,checkbox,radio-group,select}.test.tsx src/components/ui/vendoring.test.ts src/components/token-literals.test.ts` | component root | 0 | PASS | Narrowest story suites first: 8 files, 88 tests (v1 had 82; the rework adds 6) |
| `npm run test` | component root | 0 | PASS | 89 files, 2227 tests. The base has 83 files and 2167 tests |
| `npm run lint` | component root | 0 | PASS | Biome: 202 files, no findings |
| `npm run format` | component root | 0 | PASS | Biome: 202 files, no changes |
| `npx tsc --noEmit` | component root | 0 | PASS | No output |
| `npm run build` | component root | 0 | PASS | 102 modules. Writes only ignored files under `src/factorflow/api/static/` |
| Built CSS `index-mV7nGlvM.css` inspected for `.h-7`, `.h-row`, `.ring`, `.text-muted-foreground`, `placeholder:text-muted-foreground`, `focus-visible:ring-ring`, `focus:ring-ring` | component root | 0 | PASS | `.h-7{height:var(--space-7)}` (story-specific AC-26 check). Every inspected rule resolves to a `var(--…)` token |
| `git diff --exit-code 44a2dfef… -- tailwind.config.js design-system/theme.css tsconfig.json vite.config.ts web/src/app web/src/api web/src/screens web/src/test-setup.ts` | component root | 0 | PASS | T021: nothing outside the story's files changed |
| `grep -rn '"@/' web/src/components/ui` | component root | 1 | PASS | No match (T021) |
| `git diff 44a2dfef… -- package.json`, the seven lock entries, and `node_modules/<pkg>/LICENSE` | component root | 0 | PASS | Exactly seven `dependencies` added, `devDependencies` unchanged, and every lock licence and `LICENSE` file is MIT (DAC-E1-S2-3, T021) |
| Planted literal in each of the six files, run as `plant` mutants in clones against `npx vitest run components/token-literals` | mutation clones | 1 | PASS | All 6 killed. The plan's `min-h-[80px]` in `textarea.tsx` fails both the TC-COMP-011 case and S1's whole-tree scan, naming `web/src/components/ui/textarea.tsx: 80px` |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 44a2dfef..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | N/A | 8 catalogue mutants; the reviewer appended 13 manual mutants |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mutants-unscoped.json --since 5fa4bfd… --previous <v1 mutation file> --out <scratch>/mutants.json` | harness root | 0 | N/A | 54 mutants: 41 carried, 1 delta, 12 late. No previous mutant dropped |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --work-root <scratch>/work --command '<focused suites + tsc>' --out <scratch>/review-v2-results.json` | harness root | 0 | N/A | 49 killed, 5 survived (all late); see the table above |
| `npm run --prefix <scratch>/base-clone test` (review base `44a2dfef`, `node_modules` linked) | scratch clone | 0 | PASS | 83 files, 2167 tests: the T001 baseline |
| Changed component files rerun three times (`radio-group`, `select`, `checkbox`, `input`, `textarea`) | component root | 0 | PASS | 41 of 41 each time (determinism) |
| `python3 scripts/pipeline-state.py code-revision --repo-dir <component>` | harness root | 0 | N/A | `sha256:b76a5bd1bdb353154e54a5a119648aac582b33e7bac24a8953c06f1d5d7945f3` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | N/A | `sha256:b784ede7bee859cc50a651b38f61212c819575f73402fd3bf91a5ede294cebd1`, equal to the story approval's `reviewed_revision` |
| AC-25 manual keyboard pass in a served build (plan Story-Specific Validation) | — | N/A | NOT RUN | The plan marks it "STD-UI-24 verification is human review", so it is not an agent gate command. No screen renders the six components yet. The keyboard paths it names are exercised by the TC-COMP-009 and TC-COMP-010 tests |
| `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | component root | N/A | NOT RUN | No Python file changed. Neither the story's validation list nor the task plan's includes them |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The plan records that the story owns no integration or E2E case |

The Gate Summary counts the same 12 required validation entries as v1, and all pass:

- the six tech-stack frontend commands: `npm ci`, test, lint, format, `tsc` and build;
- the TDD-evidence lint;
- five story-specific checks: built CSS token, protected-path diff, alias grep, package and
  licence diff, and planted literal.

No command was refused by the sandbox, so none needed a retry outside it.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-003-E1-S2-run-20261108T150357Z` at
  `15ee9b4037a07d5cfa39f0865bd701da79995309`. No staged, unstaged or untracked non-ignored
  files. The ignored `node_modules/` and the build output under `src/factorflow/api/static/` were
  present.
- **After.** Same HEAD, and still no staged, unstaged or untracked non-ignored files.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - Mutants, plants and the base-commit run ran only in clones under the reviewer's scratch
    directory.
- **Unexpected tracked-file changes.** None.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 1 · **total 3**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | late | The checkbox mark colour and the input suffix text size are unpinned |
| IR-002 | MEDIUM | late | Three Tailwind-default size or offset literals can be added undetected |
| IR-003 | LOW | delta | Cycle 10 records no RED and no mutant for its production change |

### IR-001 — The checkbox mark colour and the input suffix text size are unpinned

- **Severity**: MEDIUM
- **Scope**: late. Both survivors are on production lines unchanged since v1's head `5fa4bfd`: `checkbox.tsx:37` (v1 line 33) and `input.tsx:50`. `mutation-run.py scope` tagged both `late`.
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T013, T009 (T018, T016)
- **Files**:
  - `web/src/components/ui/checkbox.tsx:37` (`CheckboxPrimitive.Indicator` `text-current`, which inherits the root's `data-[state=checked]:text-primary-foreground`);
  - `web/src/components/ui/input.tsx:50` (suffix span `text-base text-muted-foreground`);
  - tests `checkbox.test.tsx:96-103` and `input.test.tsx:47-59`.
- **Claim challenged**: Each component uses the tokens its design-system spec section 6 and the plan's class lists fix (T016, T018). The checkbox mark is visible when checked.
- **Observed evidence**:
  - `checkbox.tsx:manual:review2-2` swaps the Indicator's `text-current` for `text-primary`. It survives the focused suites plus `tsc`. Under it the check and dash draw in `--primary` on the `--primary` fill.
  - `input.tsx:manual:review2-6` swaps the suffix's `text-base` for `text-sm`. It survives.
  - `checkbox.test.tsx:96-103` asserts only that a `lucide-check` or `lucide-minus` SVG exists. `input.test.tsx:57` asserts only the suffix's colour.
- **Expected evidence/behavior**: Checkbox spec section 6: "Checked fill / mark — `--primary` / `--primary-foreground`". T016 fixes the suffix span as `text-base text-muted-foreground`, and UX design 0.7 makes `--text-base` the interface default.
- **Impact**: A checked or mixed box could lose its visible mark for sighted users while assistive technology still reads it as checked. The *years* suffix could shrink to the dense-table size beside a `--text-base` field. The production code is correct on both. These are test gaps on lines the baseline could have mutated, so this finding is non-blocking. The checkbox is a seam later stories build on, and their reviews mutate only their own lines.
- **Required remediation**: Make both surviving mutants fail. Pin the mark colour (the Indicator, or the rendered SVG, takes `--primary-foreground` while checked) and the suffix's `text-base`. Recommended, not required for this gate.

### IR-002 — Three Tailwind-default size or offset literals can be added undetected

- **Severity**: MEDIUM
- **Scope**: late. All three survivors are on production lines unchanged since `5fa4bfd`: `checkbox.tsx:41` (v1 line 37), `radio-group.tsx:57` and `radio-group.tsx:67`. `mutation-run.py scope` tagged all three `late`.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-12, AC-26
- **Tasks**: T011, T013 (T018, T019)
- **Files**:
  - `web/src/components/ui/checkbox.tsx:41` (`<Check className="h-4 w-4" />`);
  - `web/src/components/ui/radio-group.tsx:57` (card classes);
  - `web/src/components/ui/radio-group.tsx:67` (`Circle` `h-2 w-2 fill-current text-primary`);
  - tests `checkbox.test.tsx:96-103`, `radio-group.test.tsx:145-174`.
- **Claim challenged**: Every shipped class that resolves to a Tailwind default literal is replaced or dropped, and fractional steps round to the nearest theme key (T018, T019; Other Notes, *Spacing keys 5-8* and *Removed shipped classes*). The rework pinned shipped-literal absence on `input`, `textarea`, `checkbox` and the select parts.
- **Observed evidence**: Each mutant survives the focused suites plus `tsc`:
  - `checkbox.tsx:manual:review2-3`: Check icon `h-3.5 w-3.5`.
  - `radio-group.tsx:manual:review2-4`: dot `h-2.5 w-2.5`, the size shadcn ships.
  - `radio-group.tsx:manual:review2-5`: card gains `focus-visible:ring-offset-2`, the offset shadcn's radio item ships.

  `tailwind.config.js:58-89` extends spacing and height only for keys 1-8 and `row`, so `3.5`, `2.5` and `ring-offset-2` fall back to Tailwind's literal defaults. The AC-26 scan does not match class names (plan Other Notes, *1 px values*). The radio tests pin the dot's `fill-current text-primary` and the card's ring, but neither the dot size nor the absence of an offset. The checkbox test pins the root's absence of `ring-offset-` but not the icon size.
- **Expected evidence/behavior**: DAC-E1-12: "No vendored component MUST contain a spacing, size or colour literal outside the theme". T018 fixes `Check` at `h-4 w-4` and T019 fixes the `Circle` at `h-2 w-2`. Other Notes names `h-2.5` among the fractional steps that round to a key, and `ring-offset-*` as a removed literal offset.
- **Impact**: This is the same class of drift v1 IR-002 raised, on three lines v1 did not mutate. Re-vendoring or editing the radio cards or the checkbox could bring back shadcn's literal dot size or ring offset with every test green. The production code holds none of these literals today, so this finding is non-blocking.
- **Required remediation**: Make the three surviving mutants fail. Pin the checkbox icon and radio dot sizes, and the absence of `ring-offset-` on the radio card, as the rework already does for the checkbox root and the select item indicator. Recommended, not required for this gate.

### IR-003 — Cycle 10 records no RED and no mutant for its production change

- **Severity**: LOW
- **Scope**: delta. Cycle 10's evidence entry and `select.tsx:109` both changed since `5fa4bfd`.
- **Status**: OPEN
- **Acceptance criteria**: N/A (TDD evidence quality)
- **Tasks**: T023 (T012, T020)
- **Files**: `CAP-003-E1-S2-tdd-evidence.yaml` cycle-10 entry; `CAP-003-E1-S2-evidence/red-cycle-10-review-survivors.log`; `CAP-003-E1-S2-evidence/mutation-cycle-10-results.json`; `web/src/components/ui/select.tsx:109`; `select.test.tsx:195`
- **Claim challenged**: T023: each cycle carries its own RED/GREEN evidence, and a mutation block scoring the cycle's production change.
- **Observed evidence**:
  - Cycle 10 makes one production change: `SelectLabel` gains `text-muted-foreground` (v1 IR-005).
  - Its `red_log` holds only v1's 20 survivor runs, which precede the change. No log shows `select.test.tsx:195` failing before `select.tsx:109` changed.
  - Its mutation file runs only those 20 mutants. None reverts line 109.
  - The lint passes because the cited log exists.
  - The reviewer's delta mutant `select.tsx:manual:review2-1`, which reverts the change, is killed. So the RED is reproducible, but the cycle evidence does not record it.
- **Expected evidence/behavior**: T023 and INV-TDD-002: a cycle records the RED that motivated its production change, and its mutation block covers that change.
- **Impact**: Small. An evidence audit of cycle 10 cannot see that the group-label test was written before the fix, or that it kills a revert. The reviewer's run supplies that evidence here.
- **Required remediation**: For future cycles that mix test strengthening with a production fix, record a RED for the fix and include a mutant reverting it. No change is required for this gate.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (focus ring on `input`, `textarea` and the `select` trigger unpinned) | RESOLVED | The three carried mutants `input.tsx:manual:review-1`, `textarea.tsx:manual:review-1` and `select.tsx:manual:review-1` are killed. The tests are `input.test.tsx:19-36`, `textarea.test.tsx:29-44` and `select.test.tsx:109-116` |
| v1/IR-002 (nine restorable shipped literals) | RESOLVED | All nine carried mutants are killed: `input.tsx` `review-2` and `-3`, `textarea.tsx` `review-2`, `checkbox.tsx` `review-1`, and `select.tsx` `review-2` to `-6`. The absence assertions are `input.test.tsx:34-35`, `textarea.test.tsx:43`, `checkbox.test.tsx:87` and `select.test.tsx:115,130,143,146`. Three further late literals are raised as IR-002 (MEDIUM) |
| v1/IR-003 (six spec token choices unpinned) | RESOLVED | All six carried mutants are killed: `input.tsx` `review-4`, `textarea.tsx` `review-3` to `-5`, `radio-group.tsx` `review-3`, and `select.tsx` `review-7` |
| v1/IR-004 (radio wrap and empty unchecked checkbox unpinned) | RESOLVED | `radio-group.tsx:manual:review-1` (`loop={false}`) fails `radio-group.test.tsx:84-101`. `checkbox.tsx:manual:review-2` (`forceMount`) fails `checkbox.test.tsx:90-94` ("expected SVGSVGElement … to be null"). Both logs were checked |
| v1/IR-005 (`SelectLabel` lacks the group-label token) | RESOLVED | `select.tsx:109` adds `text-muted-foreground`, matching select spec section 6. It is pinned at `select.test.tsx:195`, and the delta revert mutant `review2-1` is killed |
| v1/IR-006 (checkbox 24 px target neither provided nor documented) | RESOLVED | `checkbox.tsx:17-20` takes the second remediation v1 offered. The doc comment says the consumer's row carries the target with `minHeight: "var(--control-min-target)"`, citing the Research filters pane (`filters-pane.tsx:265` confirmed) |
| v1/IR-007 (`textarea.test.tsx` claims TC-COMP-010 and DAC-E1-S2-1) | RESOLVED | `textarea.test.tsx:7-8` reads `// Implements AC-25` and `describe("textarea list (AC-25)")`. The TC-COMP-010 claim and the DAC-E1-S2-1 tag are gone. The repository already uses `// Implements` for non-TC targets, for example `notices.test.tsx:47` |

## Scope and Plan Deviations

- **Cycle 10 is a rework cycle outside T023's planned list of eight.** It is recorded with a real
  commit hash (`18e7d13`), like cycles 1-9, and its patch matches the commit. It changes:
  - tests in five files;
  - one production class list (`select.tsx:109`, justified by select spec section 6 and v1
    IR-005);
  - one doc comment (`checkbox.tsx:17-20`, v1 IR-006).

  Accepted.
- **No `Decision-Id` trailer on `18e7d13`.** Its changes rest on review v1 and the design-system
  specs, not on DEC-0299 or DEC-0300. The IR-006 choice was one of the two remediations v1
  offered, and it follows the delivered `filters-pane.tsx` precedent. No new decision was needed.
  The TDD-evidence lint, run with `--decisions-dir`, passes.
- **Task plan bookkeeping.** Only `updated` and `last_reworked_review` changed. The plan is still
  `status: draft`, as in v1. Bookkeeping only.
- **DEC-0299 is still provisional** (`owner_reviewed: false`). The implementation applies it as
  recorded, and its consumers (CAP-003-E4-S2, CAP-003-E7-S1) remain gated on it. DEC-0300 is
  owner-upheld.
- **Out-of-scope changes.** None. The 38 files changed since the baseline are the rework, its
  evidence, and the v1 report and its mutation file.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E1-S2 against `15ee9b4`. Optionally, before or
  with the next change to these components, make the five late survivors in
  `CAP-003-E1-S2-implementation-review-v2-mutation.json` fail (IR-001, IR-002).
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (MEDIUM), IR-003 (LOW)
