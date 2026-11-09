---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S2"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T15:32:51Z"
reviewed_head: "5fa4bfd9004d1541122966602af7b2453998049f"
review_base: "44a2dfef0551baed9a29da666a8ed800e950d311"
reviewed_state_revision: "sha256:f2c4de41f3894b4401bf558a497840c6b4949e76b69a7d6d64e0b740c1ef573d"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-08T15:47:12Z
  source_artifacts:
    - id: CAP-003-E1-S2
      version: "1 (sha256:b784ede7bee859cc50a651b38f61212c819575f73402fd3bf91a5ede294cebd1)"
    - id: CAP-003-E1-S2-tasks
      version: "1 (updated 2026-11-07; 23 tasks ticked at ad1c43c)"
    - id: CAP-003-E1-S2-tdd-evidence
      version: "cycle-1 to cycle-9"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: design-system/components/form/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/input/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/select/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/textarea/design-spec.md
      version: "beta, last_reviewed 2026-09-05"
    - id: design-system/components/checkbox/design-spec.md
      version: "beta, last_reviewed 2026-10-15"
    - id: design-system/components/radio-group/design-spec.md
      version: "beta, last_reviewed 2026-10-15"
    - id: DEC-0299
      version: "provisional, open (owner review pending)"
    - id: DEC-0300
      version: "provisional, applied (owner upheld 2026-11-07)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 4 |
| Medium findings | 0 |
| Low findings | 3 |
| Acceptance criteria | 2/6 satisfied |
| Planned tasks | 23/23 verified |
| Required validation | 12/12 passed |

This is an initial review, so every finding has scope `initial`.

The production code is sound. All six components are vendored as the plan and DEC-0299/DEC-0300
describe. Every class resolves to a theme token, and exactly the seven packages are added, each
MIT and checked against its `LICENSE` file. All 12 required validation checks pass: `npm ci`,
test (89 files, 2221 tests), lint, format, `tsc`, build, the TDD-evidence lint, and five
story-specific checks. The keyboard and labelling contracts DAC-E1-S2-2 names are pinned: every
mutant on the suffix name, `aria-describedby`, `aria-invalid` and `role="alert"` is killed.

The gate fails on test strength. The reviewer ran 41 mutants: the 8 catalogue mutants and 33 of
the reviewer's own, over all six production files. 20 survive, and none is equivalent. Each
survivor changes behaviour that the plan, a design-system spec or an acceptance criterion
specifies:

- **IR-001.** The visible focus ring can be deleted from `input`, `textarea` and the `select`
  trigger.
- **IR-002.** Nine of the shipped Tailwind-default literals the plan names as removed can be put
  back undetected (`ring-2`, `ring-offset-2`, `md:text-sm`, `shadow-md`, `max-h-96`,
  `rounded-sm py-1.5 pl-8`, `h-3.5 w-3.5`).
- **IR-003.** Six of the design-system spec section 6 token choices are unpinned.
- **IR-004.** Radio arrow wrap-around (`loop`) and the empty unchecked checkbox are unpinned.

Under skill E.9 each survivor makes its test `WEAK`, which is HIGH. Three of the four tests are
mandatory TC-COMP-009 files.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S2-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S2-run-20261108T150357Z` |
| HEAD | `5fa4bfd9004d1541122966602af7b2453998049f` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` (the driver's integration branch, passed as `--base-ref`), merge base `44a2dfef0551baed9a29da666a8ed800e950d311`; ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 160 (11 commits `79c2fba`, `5180212`, `0bfeadb`, `001bbf2`, `7bf9bb9`, `5da802a`, `57906d2`, `12b446e`, `ebac20f`, `ad1c43c`, `5fa4bfd`) |
| Baseline | none: initial review |

State check: `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — story is ready for
independent review`. Without `--base-ref` the same check reports `BLOCKED — story coding has not
reached in-review`, because the default base is the remote default branch, which does not
contain the integration branch's sibling work. The driver supplied the integration branch, so
the reviewer used it, as skill A.2 requires.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/ui/form.tsx` | added | AC-25, DAC-E1-S2-2; T015 (DEC-0299, DEC-0300) |
| `web/src/components/ui/input.tsx` | added | AC-25, AC-26, DAC-E1-S2-2; T016 (DEC-0299, DEC-0300) |
| `web/src/components/ui/textarea.tsx` | added | AC-25, AC-26; T017 (DEC-0300) |
| `web/src/components/ui/checkbox.tsx` | added | AC-25, DAC-E1-S2-1; T018 (DEC-0300) |
| `web/src/components/ui/radio-group.tsx` | added | AC-25, DAC-E1-S2-1; T019 (DEC-0300) |
| `web/src/components/ui/select.tsx` | added | AC-25, DAC-E1-S2-1; T020 (DEC-0300) |
| `web/src/components/ui/form.test.tsx` | added | TC-COMP-010; T007, T008 |
| `web/src/components/ui/input.test.tsx` | added | TC-COMP-010; T009 |
| `web/src/components/ui/textarea.test.tsx` | added | AC-25; T010 (mislabelled TC, IR-007) |
| `web/src/components/ui/checkbox.test.tsx` | added | TC-COMP-009; T006, T013 |
| `web/src/components/ui/radio-group.test.tsx` | added | TC-COMP-009; T004, T011 |
| `web/src/components/ui/select.test.tsx` | added | TC-COMP-009; T005, T012 |
| `web/src/components/token-literals.test.ts` | modified (+28 appended) | TC-COMP-011 scan half; T003 |
| `web/src/components/ui/vendoring.test.ts` | modified (+41 appended) | TC-COMP-011 packages half; T002 |
| `package.json` | modified | DAC-E1-12, DAC-E1-S2-3; T014 (exactly seven `dependencies` added; `devDependencies` unchanged) |
| `package-lock.json` | modified | DAC-E1-12, DAC-E1-S2-3; T014 (the seven plus 38 transitive packages, 44 MIT and `tslib` 0BSD; root `dependencies` updated; `@types/react-dom` flag `dev` changed to `devOptional` by npm) |
| `.../CAP-003-E1-S2.md` | modified | `status: planning` to `in-review` (story-coding hand-off) |
| `.../CAP-003-E1-S2-tasks.md` | modified | 23 checkboxes ticked; no other change |
| `.../CAP-003-E1-S2-tdd-evidence.yaml` | added | T023 |
| `.../CAP-003-E1-S2-evidence/**` (141 files) | added | T023: nine cycle patches, nine RED logs, seven mutation results files and their logs |

The reviewer confirmed that these protected paths are untouched (`git diff --exit-code` exit 0):

- `tailwind.config.js` and `design-system/theme.css`;
- `tsconfig.json` and `vite.config.ts`;
- `web/src/app`, `web/src/api` and `web/src/screens`;
- `web/src/test-setup.ts`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-26 | PARTIAL | `input.tsx:22-23`, `textarea.tsx:26-28`, `checkbox.tsx:27-29`, `radio-group.tsx:28,56-58,64,67,71-75`, `select.tsx:30-32,81-82,90-92,109,122,127,143`, `form.tsx:47-55,129,145-149,184,203`. Every spacing, size, radius, ring and colour class resolves to a theme token. Spacing and height 1-8 map to `--space-*`, `h-row` to `--row-height` and `text-*` to `--text-*`. `rounded` maps to `--radius`, `ring` to `--focus-ring-width` and colours to `hsl(var(--token))`. The built CSS has `.h-7{height:var(--space-7)}`, `.h-row{height:var(--row-height)}` and `.ring{… var(--focus-ring-width) …}` | `token-literals.test.ts:266-280` scans all six and finds no literal. Class assertions are in every `*.test.tsx` | 6 plants fail the scan. But class-name literals the scan cannot see are unpinned (IR-002), and so are spec token choices (IR-003) |
| AC-25 | PARTIAL | Radix supplies the radio, select and checkbox keyboard contracts (`radio-group.tsx:25`, `select.tsx:15,27`, `checkbox.tsx:24`). Every control carries a focus-visible ring class (`input.tsx:23`, `textarea.tsx:27`, `checkbox.tsx:28`, `radio-group.tsx:57`, `select.tsx:31`) | `radio-group.test.tsx:60-96`, `select.test.tsx:70-99`, `checkbox.test.tsx:35-51,97-110`, `textarea.test.tsx:34-58`, `input.test.tsx:75-82`, `form.test.tsx:151-164` | The keyboard paths are pinned. The focus ring on input, textarea and the select trigger is not (IR-001), and neither is radio wrap-around (IR-004) |
| DAC-E1-12 | PARTIAL | No literal in the six sources. `package.json` adds only the seven packages. Each lock licence is MIT, matching `node_modules/<pkg>/LICENSE` (the reviewer opened all seven). Transitive licences are identified in the lock (44 MIT, `tslib` 0BSD) | `vendoring.test.ts:111-138` and `token-literals.test.ts:266-280`. The reviewer diffed `package.json` against the base | The no-literal half is `PARTIAL`: nine restored shipped literals survive (IR-002) |
| DAC-E1-S2-1 | PARTIAL | Radio: `radio-group.tsx:25-30` leaves `orientation` unset and keeps Radix's default `loop = true`. Select: `select.tsx:15,27-40,77-98`. Checkbox: `checkbox.tsx:24-40` | `radio-group.test.tsx:60-96,118-124`, `select.test.tsx:70-99`, `checkbox.test.tsx:35-51` (TC-COMP-009). Killed: the `orientation="vertical"` and `orientation="horizontal"` mutants, the Indicator removal, and the coder's 13 radio and 17 select mutants | `loop={false}` survives: arrows stop at the last card (IR-004) |
| DAC-E1-S2-2 | SATISFIED | `input.tsx:37-39,50` names the field by `aria-labelledby` = label id then suffix id (DEC-0299). `form.tsx:117,144,166-168` give the `FormLabel` id, `aria-labelledby`, `aria-describedby` with the message only in error, and `aria-invalid`. `form.tsx:202` sets `role="alert"` only while an error shows | `form.test.tsx:98-131` (TC-COMP-010): name *History depth years*; no-error edge; error id in `aria-describedby`; accessible description; cleared on change. `input.test.tsx:28-68` | Killed: order swap, filter drop, negated suffix, suffix id removal, negated describedby ternary, inverted `aria-invalid`, `role` always alert, `role` removed, and every item sharing one id |
| DAC-E1-S2-3 | SATISFIED | The six files exist under `web/src/components/ui/`. `package.json` diff: exactly seven added `dependencies` lines (plus the trailing comma on `tailwind-merge`) | `token-literals.test.ts:266-280` (TC-COMP-011 scan half), `vendoring.test.ts:111-138` (packages half) | Planted `min-h-[80px]` (`textarea.tsx`), `min-w-[8rem]` (`select.tsx`), `px-[0.75rem]` (`input.tsx`), `bg-[#ffffff]` (`checkbox.tsx`), `p-[1rem]` (`radio-group.tsx`) and `text-[13px]` (`form.tsx`) each fail the scan, naming the file |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | The reviewer ran `npm run test` at the review base in a scratch clone: 83 files, 2167 tests green. S1's deliverables (`utils.ts`, the scan's exports, `vendoring.test.ts`, the colour, radius and ring keys) are present at the base | No baseline log persisted (bookkeeping only); the reviewer's run supplies it |
| T002 | complete | VERIFIED | `vendoring.test.ts:99-138`: independent fixture; (a) in `dependencies`, (b) lock licence, (c) not in `devDependencies`. S1's blocks are unedited | Adequate |
| T003 | complete | VERIFIED | `token-literals.test.ts:254-280`: independent list of six; `isScannedSource`, directory prefix, `literalsIn` equals `[]`. S1's cases are unedited | Adds a planted `min-h-[80px]` case. Adequate |
| T004 | complete | VERIFIED | `radio-group.test.tsx:60-96`: Tab path, ArrowDown and ArrowUp move focus and check, `changeSpy` values, one tab stop, Shift+Tab to the checked card | Holds the key down until Radix's frame check settles (cycle-5 note). The planned `loop` kill is not achieved (IR-004) |
| T005 | complete | VERIFIED | `select.test.tsx:70-99`: combobox name, `aria-expanded`, Enter opens with the current value highlighted, ArrowDown and Enter select, focus returns, Space reopens, Escape closes without change | jsdom gaps defined in the file, as planned. The `:fullscreen`/`:modal` shim is an addition the evidence records. Trigger focus ring unpinned (IR-001) |
| T006 | complete | VERIFIED | `checkbox.test.tsx:35-51`: Tab focus, Space toggles both ways, spy values, Enter ignored | Adequate for the keyboard contract. Unchecked mark unpinned (IR-004) |
| T007 | complete | VERIFIED | `form.test.tsx:98-131`: steps (1) to (4) as planned | Adequate |
| T008 | complete | VERIFIED | `form.test.tsx:135-256`: (a) variants and `novalidate`; (b) and (c) two errors at once, first focused, value kept; (d) radio group named by `FormLabel`; (e) label error colour. Additions: a valid submit, valid-state children, and the hint and error tokens | (b) types `0` in *years* instead of leaving both fields empty, which lets (c) be checked in the same test. Adequate |
| T009 | complete | VERIFIED | `input.test.tsx:9-96`: (a) to (g) as planned | `WEAK`: focus ring, the restored ring and breakpoint literals, and the placeholder token survive (IR-001, IR-002, IR-003) |
| T010 | complete | VERIFIED | `textarea.test.tsx:21-70`: variant, `rows="4"`, `resize-none`, Enter, Escape, Tab, caller rows, ref | `WEAK`: focus ring, ring literals, body size, placeholder and surface tokens survive (IR-001 to IR-003). TC label: IR-007 |
| T011 | complete | VERIFIED | `radio-group.test.tsx:98-153`: name and description, block title and description, `aria-hidden` indicator box, `data-variant="cards"` and grid classes, no `aria-orientation`, checked ring, whole-card click | `WEAK`: indicator fill token survives (IR-003) |
| T012 | complete | VERIFIED | `select.test.tsx:101-190`: trigger variant and classes, content and option tokens, no `animate-`, popper wrapper and viewport, group label and separator, typeahead | `WEAK`: shadow, max height, item and indicator literals, and trigger text size survive (IR-002, IR-003) |
| T013 | complete | VERIFIED | `checkbox.test.tsx:53-110`: label click, `mixed`, `data-variant` and contract classes (not `border-primary`), check and dash icons, Space in a form | `WEAK`: an added `ring-offset-2` and a forced indicator survive (IR-002, IR-004) |
| T014 | complete | VERIFIED | `package.json` and `package-lock.json`. Versions: `react-hook-form` 7.91.0 (React 18), `zod` 4.6.7, `@hookform/resolvers` 7.0.3 (5 or later for zod 4, as required). The reviewer checked each `LICENSE` file: all MIT | `npm ci` reports 10 audit advisories. All are in packages that predate this story; none is in the 45 added |
| T015 | complete | VERIFIED | `form.tsx:1-211`: `Form`, `FormRoot` (cva variants, `data-variant`, `noValidate`), `FormField`, `useFormField` with `formLabelId`, `FormItem` (`space-y-2`, `useId`), `FormLabel` on `@radix-ui/react-label` with id and error colour, `FormControl` (`aria-labelledby`, `aria-describedby`, `aria-invalid`), `FormDescription`, `FormMessage` (`role="alert"` in error). The doc comment states `mode: "onTouched"` and Slot precedence | Matches plan and DEC-0299/DEC-0300. No `label.tsx` (Resolved Conflict 1) |
| T016 | complete | VERIFIED | `input.tsx:17-57`: `variant` text or numeric, numeric gives `type="number"`, `inputMode="numeric"` and `text-right font-numeric`; `suffix` wrapper and `aria-labelledby` join; plan base classes | Matches plan |
| T017 | complete | VERIFIED | `textarea.tsx:16-34`: `list` default, `rows = 4`, `resize-none`, cell-padding tokens, no key handler; the doc comment places the counter in the consumer | Matches plan (Resolved Conflict 2) |
| T018 | complete | VERIFIED | `checkbox.tsx:18-43`: `default` variant, `border-input`, `rounded-none`, primary fill when checked or mixed, Check or Minus icon | Matches plan (Resolved Conflict 4). Target size: IR-006 |
| T019 | complete | VERIFIED | `radio-group.tsx:19-81`: `cards` root with no `orientation`, grid classes; `RadioGroupCard` with `aria-labelledby` title and `aria-describedby` description, `aria-hidden` indicator box | Matches plan (Resolved Conflict 3) |
| T020 | complete | VERIFIED | `select.tsx:15-147`: all ten parts; trigger `inline` and its classes; popper content without shadow or animation classes; viewport; item `h-row`; label; separator | Matches plan. The group label lacks the spec's muted colour (IR-005) |
| T021 | complete | VERIFIED | Whole suite green (89 files, 2221 tests). The `package.json` diff is exactly seven lines. The protected-path diff is empty. `grep -rn '"@/' web/src/components/ui` exits 1 (no match) | Matches plan |
| T022 | complete | VERIFIED | The reviewer reran lint, format, `tsc` and build: all exit 0 | Matches plan |
| T023 | complete | VERIFIED | `CAP-003-E1-S2-tdd-evidence.yaml`: nine cycles, all `APPROVED`, no drift. `check-tdd-evidence.py --require-logs` reports 0 errors and 0 warnings. Six mutation blocks (cycles 2-7 and 9), each with every mutant killed; cycles 1 and 8 are `not_applicable` as planned | Deviations: per-cycle commits instead of `commit_hash: stage`, and an unplanned cycle 9 (formatting). Decision commits carry `Decision-Id` trailers that git parses. See Scope and Plan Deviations |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `radio-group.test.tsx` / TC-COMP-009 (radio part) | WEAK | Real Tab and Shift+Tab focus path; arrow keys move focus and check; `onValueChange` values; one tab stop; no `aria-orientation`; exact name and description; card classes; whole-card click. Killed: vertical and horizontal orientation, Indicator removal, and the coder's 13 | `loop={false}` survives (IR-004). The indicator fill `text-primary` to `text-foreground` survives (IR-003) |
| `select.test.tsx` / TC-COMP-009 (select part) | WEAK | Combobox name; `aria-expanded`; Enter and Space open; current value highlighted; arrow and Enter select; focus returns on select and Escape; typeahead; content and option tokens; popper geometry classes | Survivors: trigger focus ring removed (IR-001); `ring-2 ring-offset-2`, `shadow-md`, `max-h-96`, `rounded-sm py-1.5 pl-8`, indicator `h-3.5 w-3.5` (IR-002); trigger `text-sm` (IR-003) |
| `checkbox.test.tsx` / TC-COMP-009 (checkbox part) | WEAK | Tab focus; Space toggles both ways with spy values; Enter ignored; label click; `mixed`; contract classes and not `border-primary`; Check and Minus icons; Space in a form does not submit | An added `focus-visible:ring-offset-2` survives (IR-002). A forced Indicator that draws a check while unchecked survives (IR-004) |
| `form.test.tsx` / TC-COMP-010 | ADEQUATE | Name *History depth years*; `aria-invalid`; no message element without an error; describedby ids never contain the error copy; error on blur with `role="alert"`, id in `aria-describedby` and accessible description; cleared on change; variants; `novalidate`; two errors at once, first focused, value kept; valid submit; radio group named by `FormLabel`; label error colour; valid children not announced; hint and error tokens | None found: all 7 generated or reviewer `form.tsx` mutants and the coder's 23 are killed |
| `input.test.tsx` / TC-COMP-010 (suffix half) | WEAK | Variant `data-variant`, `type`, `inputmode`, `text-right font-numeric`; suffix in the name in label-then-suffix order; native labelling intact without a suffix; pass-through `aria-labelledby`; suffix-only name; invalid border; Escape keeps the value; ref forwarding | Survivors: focus ring removed (IR-001); `ring-2 ring-offset-2` and `md:text-sm` restored (IR-002); placeholder token (IR-003) |
| `textarea.test.tsx` (T010, mislabelled TC-COMP-010) | WEAK | `rows="4"`; `resize-none`; padding tokens; Enter inserts a newline without submitting; Escape; Tab leaves with no tab character; caller rows; ref | Survivors: focus ring removed (IR-001); `ring-2 ring-offset-2` (IR-002); `text-sm` body, placeholder token, surface dropped (IR-003). TC label: IR-007 |
| `token-literals.test.ts` "form family is scanned and clean" / TC-COMP-011 | ADEQUATE | Independent list of six; `isScannedSource`; directory prefix; no literal; planted `min-h-[80px]` | None. Six reviewer plants (one per file) fail the scan, naming the file |
| `vendoring.test.ts` "form family packages" / TC-COMP-011 | ADEQUATE | The seven in `dependencies` against an independent fixture; lock licence per package; none in `devDependencies` | None. The "only seven" half is a diff check the reviewer ran |

The tests are deterministic. They use `userEvent` and stub `ResizeObserver` in `beforeEach`. The
`select` file installs the prototype methods in `beforeAll` and restores `matches` in `afterAll`.
Every test asserts rendered roles, attributes, values or classes, not mock setup. Radix runs
unmocked.

**Mutation run (E.9).**

1. `generate` over `44a2dfe..HEAD` produced 8 catalogue mutants: 6 `negate-boolean`, 1
   `drop-field-copy` and 1 `off-by-one`.
2. The reviewer added 33 hand-written mutants (`review-*`) over all six production files.
3. This is an initial review, so `scope` was not run.
4. `run` used 4 jobs. The command was `ln -sfn <component>/node_modules node_modules && npx vitest run components/ui components/token-literals && npx tsc --noEmit`.

All four baselines were green, with 12 files and 120 tests. Every survivor's log shows the same
12 files and 120 tests passing, plus `tsc` passing. The results are in
`CAP-003-E1-S2-implementation-review-v1-mutation.json` beside this report (sha256
`0be16e0ba3a72f5ad0235f43826b71b5cf1bb7c6317ddaa5e5aa1b0bfb14cc4f`).

The six literal plants ran separately against `npx vitest run components/token-literals`, because
they test the scan, not the component suites. All six were killed. Those results are not part of
the carried mutation file.

| Mutant | State | Equivalence judgement |
|--------|-------|-----------------------|
| `form.tsx:107:negate-boolean:1`, `:115:drop-field-copy:1`, `:147:negate-boolean:1`, `:195:negate-boolean:1` | killed | n/a |
| `input.tsx:40:negate-boolean:1`, `:44:negate-boolean:1` | killed | n/a |
| `select.tsx:82:negate-boolean:1` | killed | n/a |
| `textarea.tsx:21:off-by-one:1` (`rows = 5`) | killed | n/a |
| `input.tsx:manual:review-5` (suffix before label), `-6` (no `filter(Boolean)`), `-7` (negated suffix condition), `-8` (no suffix id) | killed | n/a |
| `radio-group.tsx:manual:review-2` (`orientation="vertical"`), `-4` (Indicator removed) | killed | n/a |
| `form.tsx:manual:review-1` (every item shares one id), `-2` (negated describedby), `-3` (inverted `aria-invalid`), `-4` (message ignores the error), `-5` (always `role="alert"`), `-6` (inline variant ignored), `-7` (label error colour never applied) | killed | n/a |
| `input.tsx:manual:review-1` (focus ring removed) | survived | Not equivalent. Input spec section 4: "`Tab` — Focuses the field; visible focus ring required". T016 fixes `focus-visible:ring focus-visible:ring-ring`. AC-25 (IR-001) |
| `textarea.tsx:manual:review-1` (focus ring removed) | survived | Not equivalent. Textarea spec section 4: "visible focus ring required". T017 fixes the ring classes. AC-25 (IR-001) |
| `select.tsx:manual:review-1` (trigger focus ring removed) | survived | Not equivalent. Select spec section 6: focus ring `--ring`. T020 fixes `focus:ring focus:ring-ring`. AC-25 (IR-001) |
| `input.tsx:manual:review-2` (`ring-2` + `ring-offset-2`) | survived | Not equivalent. T016 and Other Notes name both as removed shipped literals. `ring-2` and `ring-offset-2` resolve to Tailwind's default 2 px, not `--focus-ring-width`. DAC-E1-12 (IR-002) |
| `input.tsx:manual:review-3` (`md:text-sm` restored) | survived | Not equivalent. T016 and Other Notes name `md:text-sm` as a removed breakpoint literal. DAC-E1-12 (IR-002) |
| `textarea.tsx:manual:review-2` (`ring-2` + `ring-offset-2`) | survived | Not equivalent. Same as `input.tsx:manual:review-2`, T017 (IR-002) |
| `checkbox.tsx:manual:review-1` (adds `focus-visible:ring-offset-2`) | survived | Not equivalent. T018 names `ring-offset-*` as replaced; it is Tailwind's default 2 px offset. DAC-E1-12 (IR-002) |
| `select.tsx:manual:review-2` (trigger `ring-2` + `ring-offset-2`) | survived | Not equivalent. T020 names both as replaced. DAC-E1-12 (IR-002) |
| `select.tsx:manual:review-3` (content `shadow-md`) | survived | Not equivalent. T020 and Other Notes: "`shadow-md` (a literal shadow; the popover is bounded by `border-border`)". DAC-E1-12 (IR-002) |
| `select.tsx:manual:review-4` (content `max-h-96`) | survived | Not equivalent. T020 names `max-h-96` as replaced. It resolves to Tailwind's default `24rem`; the scan cannot see it. DAC-E1-12 (IR-002) |
| `select.tsx:manual:review-5` (item `rounded-sm py-1.5 pl-8`) | survived | Not equivalent. T020 names `pl-8`, `py-1.5` and `rounded-sm` as translated. `py-1.5` and `rounded-sm` resolve to Tailwind defaults outside the theme. `pl-8` is `--space-8` (4rem), twice the shipped indent. DAC-E1-12 (IR-002) |
| `select.tsx:manual:review-6` (indicator `h-3.5 w-3.5`) | survived | Not equivalent. T020 names `h-3.5 w-3.5` as translated. `3.5` is not a theme key, so it resolves to Tailwind's default `0.875rem`. DAC-E1-12 (IR-002) |
| `input.tsx:manual:review-4` (placeholder `text-foreground`) | survived | Not equivalent. Input spec section 6: "Placeholder and affixes — `--muted-foreground`". Section 7: placeholders never substitute for the label (IR-003) |
| `textarea.tsx:manual:review-3` (body `text-sm`) | survived | Not equivalent. Textarea spec section 6: "Body text size — `--text-base`". `--text-sm` is the dense-table size (`theme.css:206`) (IR-003) |
| `textarea.tsx:manual:review-4` (placeholder `text-foreground`) | survived | Not equivalent. Textarea spec section 6: "Placeholder and counter text — `--muted-foreground`" (IR-003) |
| `textarea.tsx:manual:review-5` (surface `bg-background` dropped) | survived | Not equivalent. Textarea spec section 6: "Field surface — `--background`". On a `card` the field would take `--card` (IR-003) |
| `radio-group.tsx:manual:review-3` (indicator `text-foreground`) | survived | Not equivalent. Radio-group spec section 6: "Indicator border / fill — `--input` / `--primary`" (IR-003) |
| `select.tsx:manual:review-7` (trigger `text-sm`) | survived | Not equivalent. T020 replaces the shipped `text-sm` with `text-base`. UX design 0.7 and `theme.css:206-207` make `--text-base` the interface default and `--text-sm` the dense-table size (IR-003) |
| `radio-group.tsx:manual:review-1` (`loop={false}`) | survived | Not equivalent. Radio-group spec section 4: "`loop` defaults to true". The WAI-ARIA radio pattern it cites wraps from last to first. DAC-E1-S2-1: "arrow keys move the selection". T004 names this mutant as one to kill (IR-004) |
| `checkbox.tsx:manual:review-2` (`forceMount` on the Indicator) | survived | Not equivalent. Checkbox spec section 3 and T018: a check when checked, a dash when indeterminate, nothing otherwise. Under the mutant an unchecked box shows a check while `aria-checked="false"` (IR-004) |

## Independent Validation

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
`<component>` is `repos/factorflow-v2/FactorFlow-v2` under it. The npm and npx commands ran
from the component root, as the tech stack's working directory `.` requires.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `READY — story is ready for independent review` (without `--base-ref`: `BLOCKED`; see Review Subject) |
| `python3 scripts/pipeline-state.py review-base --repo-dir <component> --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `44a2dfef0551baed9a29da666a8ed800e950d311` |
| `git merge-base --is-ancestor 44a2dfef HEAD` | component root | 0 | PASS | The review base is an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir <component> --base 44a2dfef... --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings (nine cycles) |
| `npm ci` | component root | 0 | PASS | 301 packages added. 10 audit advisories, all in packages that predate this story (vitest, vite, esbuild, react-router and their dependencies) |
| `npx vitest run src/components/ui/{form,input,textarea,checkbox,radio-group,select}.test.tsx src/components/ui/vendoring.test.ts src/components/token-literals.test.ts` | component root | 0 | PASS | Narrowest story suites first: 8 files, 82 tests |
| `npm run test` | component root | 0 | PASS | 89 files, 2221 tests. The base has 83 files and 2167 tests, so this story adds 6 files and 54 tests |
| `npm run lint` | component root | 0 | PASS | Biome: 202 files, no findings |
| `npm run format` | component root | 0 | PASS | Biome: 202 files, no changes |
| `npx tsc --noEmit` | component root | 0 | PASS | No output (test harness generics type-check) |
| `npm run build` | component root | 0 | PASS | 102 modules. Writes only ignored files under `src/factorflow/api/static/` |
| Built CSS `index-mV7nGlvM.css` inspected for `.h-7`, `.h-row`, `.ring`, `.text-sm`, `font-numeric`, `aria-[invalid=true]`, `ring-foreground`, `bg-popover`, `translate-y-1` | component root | 0 | PASS | `.h-7{height:var(--space-7)}` (story-specific AC-26 check). Every inspected rule resolves to a `var(--…)` token. `h-px` is `1px`, the plan's accepted hairline |
| `git diff --exit-code 44a2dfef -- tailwind.config.js design-system/theme.css tsconfig.json vite.config.ts web/src/app web/src/api web/src/screens web/src/test-setup.ts` | component root | 0 | PASS | T021: nothing outside the story's files changed |
| `grep -rn '"@/' web/src/components/ui` | component root | 1 | PASS | No match (T021) |
| `git diff 44a2dfef -- package.json`, lock entries, and `node_modules/<pkg>/LICENSE` for the seven | component root | 0 | PASS | Exactly seven `dependencies` added; `devDependencies` unchanged; every lock licence and `LICENSE` file is MIT (DAC-E1-S2-3, T021) |
| Planted literal in each of the six files, run as `plant-*` mutants in clones against `npx vitest run components/token-literals` | mutation clones | 1 | PASS | All 6 killed. The plan's own plant `min-h-[80px]` in `textarea.tsx` fails both the TC-COMP-011 case and S1's whole-tree scan, naming the file |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 44a2dfef..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 8 catalogue mutants; the reviewer appended 33 manual mutants |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --work-root <scratch>/work --command '<focused suites + tsc>' --out <scratch>/review-v1-results.json` | harness root | 3 | N/A | 21 killed, 20 survived; see the table above |
| `npm run --prefix <scratch>/base-clone test` (review base `44a2dfef`, `node_modules` linked) | scratch clone | 0 | PASS | 83 files, 2167 tests: the T001 baseline |
| `python3 scripts/pipeline-state.py code-revision --repo-dir <component>` | harness root | 0 | N/A | `sha256:f2c4de41f3894b4401bf558a497840c6b4949e76b69a7d6d64e0b740c1ef573d` |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | N/A | `sha256:b784ede7bee859cc50a651b38f61212c819575f73402fd3bf91a5ede294cebd1`, equal to the story approval's `reviewed_revision` |
| AC-25 manual keyboard pass in a served build (plan Story-Specific Validation) | — | N/A | NOT RUN | The plan marks it "STD-UI-24 verification is human review", so it is not an agent gate command. No screen renders the six components yet. The keyboard paths it names are exercised by the TC-COMP-009 and TC-COMP-010 tests above |
| `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | component root | N/A | NOT RUN | No Python file changed. Neither the story's validation list nor the task plan's includes them |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the task plan's validation list. The plan records that the story owns no integration or E2E case. The suite needs PostgreSQL and Playwright browsers |

The Gate Summary counts 12 required validation entries, and all pass:

- the six tech-stack frontend commands: `npm ci`, test, lint, format, `tsc` and build;
- the TDD-evidence lint;
- five story-specific checks: built CSS token, protected-path diff, alias grep, package and
  licence diff, and planted literal.

No command was refused by the sandbox, so none needed a retry outside it.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-003-E1-S2-run-20261108T150357Z` at `5fa4bfd9004d1541122966602af7b2453998049f`. No staged, unstaged or untracked non-ignored files. Ignored `node_modules/` and build output under `src/factorflow/api/static/` were present.
- **After.** Same HEAD, and still no staged, unstaged or untracked non-ignored files.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - Mutants, plants and the base-commit run ran only in clones under the reviewer's scratch directory.
- **Unexpected tracked-file changes.** None.

## Findings

CRITICAL 0 · HIGH 4 · MEDIUM 0 · LOW 3 · **total 7**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | initial | The visible focus ring on `input`, `textarea` and the `select` trigger is unpinned |
| IR-002 | HIGH | initial | Nine shipped Tailwind-default literals the plan removes can be restored undetected |
| IR-003 | HIGH | initial | Six design-system spec token choices are unpinned |
| IR-004 | HIGH | initial | Radio arrow wrap-around and the empty unchecked checkbox are unpinned |
| IR-005 | LOW | initial | `SelectLabel` does not use the select spec's group-label token |
| IR-006 | LOW | initial | The checkbox spec's 24 px target is neither provided nor documented for consumers |
| IR-007 | LOW | initial | `textarea.test.tsx` claims TC-COMP-010 and DAC-E1-S2-1, which do not cover it |

### IR-001 — The visible focus ring on `input`, `textarea` and the `select` trigger is unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-25 (DAC-E1-S2-1 for the select trigger)
- **Tasks**: T005, T009, T010, T012 (T016, T017, T020)
- **Files**: `web/src/components/ui/input.tsx:23` (`focus-visible:ring focus-visible:ring-ring`), `textarea.tsx:27` (same), `select.tsx:31` (`focus:ring focus:ring-ring`); tests `input.test.tsx:9-17`, `textarea.test.tsx:21-27`, `select.test.tsx:101-107`
- **Claim challenged**: Every control "shows the `--ring` focus ring" (task plan, AC-25 validation). Each contract test pins the control's keyboard contract.
- **Observed evidence**: Three mutants delete the ring classes and leave `focus-visible:outline-none` (or `focus:outline-none`). A focused control then has no visible indicator. All three survive the focused suites plus `tsc`: `input.tsx:manual:review-1`, `textarea.tsx:manual:review-1` and `select.tsx:manual:review-1`. No test in these three files mentions a ring class. The checkbox and radio card tests do pin theirs (`checkbox.test.tsx:80-81`, `radio-group.test.tsx:140-141`).
- **Expected evidence/behavior**: Input spec section 4 and textarea spec section 4: "Focuses the field; visible focus ring required". Select spec section 6: focus ring `--ring`. T016, T017 and T020 fix these classes. AC-25 needs every operation completable by keyboard, and a keyboard user must be able to see where focus is.
- **Impact**: The ring could be lost from the three most used form controls with the suite green. Setup step 2's years field, step 3's symbols list and the E7 filters would then show no focus to a keyboard user. This story is the seam those screens build on, and their reviews mutate only their own lines. S1 review v1 IR-004 raised the same gap for `button`.
- **Required remediation**: Make the three surviving mutants fail. Pin the focus indicator classes on the input, the textarea and the select trigger, as the checkbox and radio card tests already do.

### IR-002 — Nine shipped Tailwind-default literals the plan removes can be restored undetected

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-12, AC-26
- **Tasks**: T009, T010, T012, T013 (T016, T017, T018, T020)
- **Files**: `input.tsx:23`, `textarea.tsx:27`, `checkbox.tsx:28`, `select.tsx:31,81,122,127`; tests `input.test.tsx`, `textarea.test.tsx`, `checkbox.test.tsx:66-86`, `select.test.tsx:101-149`
- **Claim challenged**: Every shipped class that resolves to a Tailwind default literal is "replaced or dropped" (T016 to T020; Other Notes, *Removed shipped classes*). This matters because the AC-26 literal scan "does not match class names" (Other Notes, *1 px values*).
- **Observed evidence**: Each of these restores a class the plan names as removed. Each survives the focused suites plus `tsc`:
  - `input.tsx:manual:review-2`: `ring-2` + `ring-offset-2`.
  - `input.tsx:manual:review-3`: `md:text-sm`.
  - `textarea.tsx:manual:review-2`: `ring-2` + `ring-offset-2`.
  - `checkbox.tsx:manual:review-1`: an added `focus-visible:ring-offset-2`. The test asserts presence of classes only, never absence.
  - `select.tsx:manual:review-2`: trigger `ring-2` + `ring-offset-2`.
  - `select.tsx:manual:review-3`: content `shadow-md`.
  - `select.tsx:manual:review-4`: content `max-h-96`.
  - `select.tsx:manual:review-5`: item `rounded-sm py-1.5 pl-8`.
  - `select.tsx:manual:review-6`: indicator `h-3.5 w-3.5`.

  The config extends only spacing and height 1-8, `row`, `borderRadius.DEFAULT` and `ringWidth.DEFAULT` (`tailwind.config.js:52-96`). So `ring-2`, `ring-offset-2`, `shadow-md`, `max-h-96`, `py-1.5`, `rounded-sm`, `h-3.5` and the `md:` breakpoint all fall back to Tailwind's literal defaults. The coder's tests already pin some removals, for example `checkbox.test.tsx:85` (`not.toHaveClass("border-primary")`) and `select.test.tsx:119` (no `animate-`), but not these.
- **Expected evidence/behavior**: DAC-E1-12: "No vendored component MUST contain a spacing, size or colour literal outside the theme". T016 to T020 and Other Notes name each class above as replaced. S1 review v1 IR-003 established that restored shipped literals must fail a test, because the scan cannot see them.
- **Impact**: Re-vendoring or editing these components could bring back shadcn's literal ring width and offset, shadow, maximum height, item padding and radius, and icon size. Neither the AC-26 scan nor the component tests would object. Every consuming E4 and E7 screen would inherit the drift.
- **Required remediation**: Make the nine surviving mutants fail. Pin the token-backed classes that replace each shipped literal, or the absence of the shipped class, through the component tests or an automated check that rejects classes resolving outside the theme's keys.

### IR-003 — Six design-system spec token choices are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T009, T010, T011, T012 (T016, T017, T019, T020)
- **Files**: `input.tsx:23` (`placeholder:text-muted-foreground`), `textarea.tsx:27` (`bg-background`, `text-base`, `placeholder:text-muted-foreground`), `radio-group.tsx:67` (`text-primary`), `select.tsx:31` (`text-base`)
- **Claim challenged**: Each component uses the tokens its design-system spec section 6 assigns (T016 to T020; DEC-0300 derivation: "design-system specs … tokens").
- **Observed evidence**: Six mutants swap a specified token for another theme token. All survive:
  - `input.tsx:manual:review-4`: placeholder to `--foreground`.
  - `textarea.tsx:manual:review-3`: body text to `text-sm`.
  - `textarea.tsx:manual:review-4`: placeholder to `--foreground`.
  - `textarea.tsx:manual:review-5`: the `--background` surface dropped.
  - `radio-group.tsx:manual:review-3`: indicator fill to `--foreground`.
  - `select.tsx:manual:review-7`: trigger text to `text-sm`.

  The radio test pins the indicator box's border (`radio-group.test.tsx:114`) but not its fill. The textarea test pins the padding tokens (`textarea.test.tsx:29-32`) but not the size, surface or placeholder.
- **Expected evidence/behavior**: Input spec section 6: placeholder `--muted-foreground`. Textarea spec section 6: placeholder `--muted-foreground`, surface `--background`, body size `--text-base`. Radio-group spec section 6: indicator fill `--primary`. For the select trigger, T020 replaces shipped `text-sm` with `text-base`, and UX design 0.7 makes `--text-base` the interface default and `--text-sm` the dense-table size.
- **Impact**: A placeholder in `--foreground` reads as a typed value, which input spec section 7 forbids. A field without its own surface takes the `card` colour on the setup step card. A smaller trigger or textarea size departs from the UX design's type scale. None of this would fail a test.
- **Required remediation**: Make the six surviving mutants fail. Pin each listed token class against its spec section 6 row.

### IR-004 — Radio arrow wrap-around and the empty unchecked checkbox are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S2-1, AC-25
- **Tasks**: T004, T013 (T018, T019)
- **Files**: `radio-group.tsx:25-30` (Radix `loop` left at its default `true`); `checkbox.tsx:33-39` (`CheckboxPrimitive.Indicator`); tests `radio-group.test.tsx:60-96`, `checkbox.test.tsx:88-95`
- **Claim challenged**: T004: the radio test kills "negate-boolean on Radix `loop`/roving". T013 and T018: the checkbox draws a check when checked and a dash when indeterminate.
- **Observed evidence**:
  - `radio-group.tsx:manual:review-1` adds `loop={false}` to the root and survives. The test never presses an arrow key at the last or first card. The planned kill was folded into the native-button roving mutant, which is a different mutant.
  - `checkbox.tsx:manual:review-2` adds `forceMount` to the Indicator, so the check icon renders while `aria-checked="false"`. It survives, because `checkbox.test.tsx:88-95` renders only `checked` and `indeterminate` and never an unchecked box.
- **Expected evidence/behavior**: Radio-group spec section 4: "`loop` defaults to true". It cites the WAI-ARIA radio pattern, where ArrowDown on the last option moves to and checks the first. DAC-E1-S2-1: "arrow keys move the selection". T004 names the `loop` kill. Checkbox spec section 3 and T018: a check when checked, a dash when indeterminate, and so no mark when unchecked.
- **Impact**: Setup step 3's two cards could stop wrapping, so ArrowDown on *Add later* would do nothing, with the suite green. A checkbox could show a check to sighted users while assistive technology reads it as unchecked.
- **Required remediation**: Make both surviving mutants fail. Pin the wrap from the last card to the first (and back), and pin that an unchecked box renders no mark.

### IR-005 — `SelectLabel` does not use the select spec's group-label token

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T020
- **Files**: `web/src/components/ui/select.tsx:109` (`py-1 pl-6 pr-2 text-base font-semibold`); `select.test.tsx:170-176`
- **Claim challenged**: T020 translates the shipped `SelectLabel` classes to token-backed ones per the select spec.
- **Observed evidence**: The label has no colour class, so it renders in the inherited `--popover-foreground`. The plan's T020 class list also omits a colour, and the test pins the list as written.
- **Expected evidence/behavior**: Select spec section 6: "Group label — `--muted-foreground`".
- **Impact**: Small. CAP-003 deliberately leaves the `grouped` variant unused (component design 10), so no current screen renders a group label. The exported part would still contradict its spec for the first later consumer.
- **Required remediation**: Give `SelectLabel` the spec's group-label token, or record why the vendored part departs from select spec section 6.

### IR-006 — The checkbox spec's 24 px target is neither provided nor documented for consumers

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-25 (STD-UI-24 via component design 10)
- **Tasks**: T018
- **Files**: `web/src/components/ui/checkbox.tsx:6-16` (doc comment), `:28` (`h-4 w-4`)
- **Claim challenged**: The vendored `checkbox` `default` meets its spec's accessibility contract.
- **Observed evidence**: The component is a 16 px Radix button with no enlarged hit area. Its doc comment does not tell consumers to supply a target. The theme defines `--control-min-target: 1.5rem` (`theme.css:238`). The delivered *Hide stocks with an incomplete score* checkbox meets the target through its label row (`web/src/screens/research/filters-pane.tsx:262-265`, `minHeight: "var(--control-min-target)"`).
- **Expected evidence/behavior**: Checkbox spec section 3: "16 px box (target at least 24 px)". Section 5: "target at least 24×24 CSS pixels". UX brief: control targets follow the component specifications, `--control-min-target`.
- **Impact**: Small. An associated label can carry the target, and the plan's anatomy leaves the label to the consumer. An E7 screen that swaps in the vendored checkbox without the label row's minimum height would regress below 24 px, and nothing would flag it.
- **Required remediation**: Either size the checkbox target from `--control-min-target`, or state in the doc comment that the consumer's label row must carry it, as the delivered precedent does.

### IR-007 — `textarea.test.tsx` claims TC-COMP-010 and DAC-E1-S2-1, which do not cover it

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: T010
- **Files**: `web/src/components/ui/textarea.test.tsx:7-8`
- **Claim challenged**: The test file's TC comment and `describe` title trace it to its specification.
- **Observed evidence**: The file carries `// Implements TC-COMP-010` and the title `textarea list (DAC-E1-S2-1, AC-25)`. TC-COMP-010 covers the `input` suffix and the `form` error. DAC-E1-S2-1 covers radio, select and checkbox. The plan maps T010 to AC-25 only, and lists TC-COMP-009 to TC-COMP-011 as the story's only mapped cases.
- **Expected evidence/behavior**: Test design traceability: a `// Implements TC-…` comment names a case the file implements. T010 traces to AC-25.
- **Impact**: Small. A coverage audit by TC-ID or DAC would count this file as evidence for criteria it does not test.
- **Required remediation**: Drop the TC-COMP-010 claim and the DAC-E1-S2-1 tag from `textarea.test.tsx`, keeping AC-25.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Per-cycle commits.** T023 planned `commit_hash: stage` and no per-cycle commit. Each of the
  nine cycles has its own commit, recorded with its real hash. This is more traceable than
  planned. Every commit whose work rests on DEC-0299 or DEC-0300 carries a `Decision-Id` trailer
  in its last paragraph, which git's trailer parser reads (cycles 2-7 and the two story-coding
  commits). The cycle 1, 8 and 9 commits carry none: packages, a test-only scan block and
  formatting. Accepted.
- **Unplanned cycle 9.** `biome format --write` on `input.tsx`, `select.tsx` and `select.test.tsx`
  after `npm run format` flagged them (T022). It changes whitespace and trailing commas only, and
  its four hand-written mutants are recorded and killed. Accepted.
- **T008(b) fixture.** The two-error test types `0` in *years* rather than leaving both fields
  empty, so that (c), value kept on failure, is checked in the same test. Both errors still
  report at once. Accepted.
- **`select.test.tsx` `matches` shim.** The file answers `:fullscreen` and `:modal` directly so
  that jsdom's selector engine does not recurse. It restores the original method in `afterAll`
  and does not touch the shared `test-setup.ts`. Accepted.
- **Story status.** Moved from `planning` to `in-review` by the story-coding hand-off. The plan
  file is still `status: draft`, with `updated: 2026-11-07`, and only its checkboxes changed.
  Bookkeeping only.
- **DEC-0299 is still `open`** (PROVISIONAL; owner review pending). The implementation applies
  it as recorded, and its consumers (CAP-003-E4-S2, CAP-003-E7-S1) remain gated on it.
- **Out-of-scope changes.** None. The `package-lock.json` change is confined to the 45 added
  packages and the root `dependencies`, plus npm's `dev` to `devOptional` flag on
  `@types/react-dom`, a side effect of the Radix peer ranges.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework the tests so that the 20 surviving mutants recorded in `CAP-003-E1-S2-implementation-review-v1-mutation.json` fail (IR-001 to IR-004). No production change is required for those. Optionally address IR-005 to IR-007. Record the rework as a TDD-evidence cycle, set `last_reworked_review` in the task file to this report, then rerun this review. The next review passes this report's mutation file to `mutation-run.py scope --previous`.
- **Warnings accepted downstream**: N/A
