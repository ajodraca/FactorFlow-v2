---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T17:40:57Z"
reviewed_head: "b5f180d94188abc6d5aeca2f970c15bf38cebd65"
review_base: "4f168da97da41a7f6a7e2587b51ea98c5c3f4389"
reviewed_state_revision: "sha256:471e6a6ef0424f1af79479836164088342ba68b2a05b74991d5261a8ba7d816b"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E1-S3
    artifact_version: 1
    content_revision: sha256:e9c3c5812cf977784a20014d40c152f11aeca809c0901a58fd3b65097b971250
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T17:40:57Z
  source_artifacts:
    - id: CAP-003-E1-S3
      version: "1 (sha256:e9c3c5812cf977784a20014d40c152f11aeca809c0901a58fd3b65097b971250)"
    - id: CAP-003-E1-S3-tasks
      version: "1 (updated 2026-11-08; last_reworked_review CAP-003-E1-S3-implementation-review-v1.md)"
    - id: CAP-003-E1-S3-tdd-evidence
      version: "cycle-1 to cycle-7"
    - id: CAP-003-E1-S3-implementation-review
      version: "1 (baseline; reviewed_head f864d0ea8ba4d018bd038ac8e8573d158b38ac5f)"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: design-system/components/dialog/design-spec.md
      version: "stable, last_reviewed 2026-08-21"
    - id: design-system/components/command/design-spec.md
      version: "beta, last_reviewed 2026-10-15"
    - id: design-system/components/toast/design-spec.md
      version: "stable, last_reviewed 2026-09-05"
    - id: design-system/components/progress/design-spec.md
      version: "beta, last_reviewed 2026-10-15"
    - id: design-system/components/stepper/design-spec.md
      version: "beta, last_reviewed 2026-10-15"
    - id: DEC-0301
      version: "applied (owner upheld)"
    - id: DEC-0302
      version: "applied (owner upheld)"
    - id: DEC-0303
      version: "applied (owner upheld)"
    - id: DEC-0304
      version: "applied (owner upheld)"
    - id: DEC-0305
      version: "open (owner review pending)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 19/19 verified |
| Required validation | 14/14 passed |

This is a re-review. The baseline is v1 (`CHANGES-REQUIRED`, `reviewed_head` `f864d0e`).

The rework resolves every blocking finding from v1. The reviewer reran all 79 of v1's mutants
against the reworked suites. All 31 v1 survivors are now killed, and so are the 48 mutants v1
already killed. The two production changes since v1 are a focus ring on the palette input wrapper
(v1 IR-005) and a 24 px toast dismiss control (v1 IR-006). Both resolve to tokens in the built CSS.
The reviewer's six mutants on those lines are all killed. All 14 required validation checks pass:
94 files and 2280 tests, lint, format, `tsc`, build, `npm ci`, the TDD-evidence lint, and seven
story-specific checks. The suites no longer print React `act()` warnings or jsdom navigation errors.

Two non-blocking findings remain:

- **IR-001 (MEDIUM, late).** The reviewer added 18 new mutants on lines unchanged since v1, and all
  of them survive. Each changes a class that T012 to T016, a design-system spec or the
  Phase 3 preamble fixes. Examples are the cmdk root surface, the palette radius, `CommandLoading`
  and `CommandSeparator` (no test renders either), the confirm title and description faces, the
  toast description and action tokens, the progress track's clipping and the done-step label
  colour. v1 could have found these just as well, so under skill H they are `late` and cannot
  block.
- **IR-002 (LOW, carried).** v1 IR-008 is still open. `underline-offset-4` is accepted in the TDD
  evidence, but the plan and DEC-0305 do not record it as the remediation asked.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S3-run-20261108T150357Z` |
| HEAD | `b5f180d94188abc6d5aeca2f970c15bf38cebd65` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` (the driver's integration branch, passed as `--base-ref`), merge base `4f168da97da41a7f6a7e2587b51ea98c5c3f4389`; ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files (this report and its mutation file are the only files the reviewer adds) |
| Changed files reviewed | 131 against the review base (127 added, 4 modified) in four commits: `f864d0e`, `150e981`, `a6c5606`, `b5f180d`. 54 of them changed since the baseline |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `f864d0ea8ba4d018bd038ac8e8573d158b38ac5f`, mutation file `CAP-003-E1-S3-implementation-review-v1-mutation.json` |

State check: `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — review changes were
reworked; a new review version is required`.

### Changed Files

Since the baseline (`git diff f864d0e..b5f180d`):

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/ui/command.tsx` | modified (lines 85-88) | v1 IR-005: the `CommandInput` wrapper gains `focus-within:ring focus-within:ring-inset focus-within:ring-ring`; T013; AC-25 |
| `web/src/components/ui/toast.tsx` | modified (lines 28-29) | v1 IR-006: `toastOptions.classNames.closeButton: "!size-5"` with a comment; T014; DAC-E1-S3-2 |
| `web/src/components/ui/command.test.tsx` | modified (+83 lines, 139-220) | v1 IR-002, IR-003, IR-005; T005 |
| `web/src/components/ui/dialog.test.tsx` | modified (+47 lines, 195-240) | v1 IR-002, IR-003; T002, T007 |
| `web/src/components/ui/progress.test.tsx` | modified (+32 lines, 111-141) | v1 IR-002, IR-003, IR-004; T009 |
| `web/src/components/ui/stepper.test.tsx` | modified (+99/-4 lines) | v1 IR-001 to IR-004, IR-009; T008 |
| `web/src/components/ui/toast.test.tsx` | modified (+74/-10 lines) | v1 IR-002, IR-003, IR-006, IR-009; T003, T010 |
| `docs/.../stories/CAP-003-E1-S3-tasks.md` | modified | `updated` and `last_reworked_review: CAP-003-E1-S3-implementation-review-v1.md` only |
| `docs/.../stories/CAP-003-E1-S3-tdd-evidence.yaml` | modified | T019: cycle-7 appended |
| `docs/.../stories/CAP-003-E1-S3-evidence/` (43 files) | added | T019: `cycle-7.patch`, `red-cycle-7-review-survivors.log`, cycle-7 mutation results and 40 logs |
| `docs/.../stories/CAP-003-E1-S3-implementation-review-v1.md` and `-v1-mutation.json` | added | v1 review, committed by the driver (`150e981`) |

The rest of the change set against the review base is as v1 recorded and unchanged since `f864d0e`:

- `dialog.tsx`, `progress.tsx` and `stepper.tsx`;
- `package.json` and `package-lock.json` (`git diff --exit-code f864d0e..HEAD`, exit 0);
- the story (`status: in-review`, revision equal to its approval's `reviewed_revision`);
- cycles 1 to 6 of the evidence.

No path outside the story's file list changed. `tailwind.config.js`, `design-system/`,
`web/src/app/`, `web/src/api/`, `web/src/test-setup.ts`, `token-literals.test.ts` and
`vendoring.test.ts` are untouched against the review base (`git diff --exit-code`, exit 0).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-25 | SATISFIED | Radix AlertDialog supplies the `confirm` trap and Esc (`dialog.tsx:56-102`). Radix Dialog and cmdk supply the palette (`command.tsx:52-77`), and the input wrapper now draws a `--ring` ring at `--focus-ring-width` on `:focus-within` (`command.tsx:85-88`). Sonner's close button is a tab stop (`toast.tsx:21`), now 24 px (`toast.tsx:29`). The stepper's done step is a native link with a `--focus-ring-width` ring (`stepper.tsx:76-88`) | `dialog.test.tsx:55-93`, `command.test.tsx:59-89` and `:209-220`, `toast.test.tsx:72-99` and `:174-183`, `stepper.test.tsx:62-71`, `:148-155` and `:195-209` | v1 IR-001 and IR-005 are resolved. The ring mutants on the done link (`stepper.tsx:manual:3`) and on the palette wrapper (`command.tsx:manual:v2-1` to `v2-3`) are killed |
| AC-26 | SATISFIED | Every class in the five files resolves to a theme token in the built CSS. The exceptions are the plan-accepted `h-px` and `border` hairlines, the allowed `max-w-[560px]`, and `underline-offset-4` (IR-002). The new `!size-5` resolves to `var(--space-5)!important`, and the `focus-within:ring*` classes to `--focus-ring-width` and `--ring` | `command.test.tsx:92-137` (TC-COMP-016) and `:147-220`, `dialog.test.tsx:202-240`, `toast.test.tsx:133-184`, `progress.test.tsx:118-141`, `stepper.test.tsx:130-210`, `token-literals.test.ts` | All 11 v1 shipped-literal survivors and all 16 v1 spec-token survivors are killed. Some plan-fixed classes on unchanged lines remain unpinned (IR-001, late) |
| DAC-E1-14 | SATISFIED | `dialog.tsx:88-101` (Cancel first, Radix focuses it); `stepper.tsx:63` (`aria-current="step"`); `progress.tsx:34-41` (`progressbar`, `aria-labelledby` pass-through); `command.tsx:62-70` (`loop`, opener restore) | `dialog.test.tsx:55-80`, `stepper.test.tsx:27-33`, `progress.test.tsx:13-25`, `command.test.tsx:59-89` | Unchanged since v1. All carried behaviour mutants are killed again |
| DAC-E1-15 | SATISFIED | `dialog.tsx` has no `variant` prop and no destructive class. Confirm is `Button variant="default"` (`dialog.tsx:92-100`) | `dialog.test.tsx:177-192` | `rg -n -e 'bg-destructive' -e 'variant="destructive"' dialog.tsx` prints nothing |
| DAC-E1-S3-1 | SATISFIED | `dialog.tsx:63-77`: `role="dialog"`, `aria-modal="true"`, the opener recorded on open and refocused on close. The overlay closes through its own `onClick` (`:58-62`) | `dialog.test.tsx:55-93` (TC-COMP-012) and `:96-192` (T007) | Unchanged since v1. All 13 carried behaviour mutants on `dialog.tsx` are killed |
| DAC-E1-S3-2 | SATISFIED | `toast.tsx:42-48`: `warning` and `error` pass `duration: Number.POSITIVE_INFINITY`; `success` keeps sonner's default. There is no `info` and no `important` option. The dismiss control is now `!size-5` (24 px), which beats sonner's `[data-sonner-toast][data-styled=true] [data-close-button]{width:20px;height:20px}` | `toast.test.tsx:47-99` (TC-COMP-013), `:102-124` (T010), `:174-183` | v1 IR-006 is resolved. `toast.tsx:manual:v2-4` to `v2-6` (`!size-4`, `!h-5`, `size-5` without `!`) are killed |
| DAC-E1-S3-3 | SATISFIED | `progress.tsx:30-53`: indeterminate when `value` or `max` is `null`. Radix then receives `value={null}`. `max` is passed through, and the type requires `aria-labelledby` | `progress.test.tsx:12-51` (TC-COMP-014), `:53-109` (T009), `:118-141` | Unchanged since v1. The indeterminate motion is now pinned (v1 IR-004) |
| DAC-E1-S3-4 | SATISFIED | `command.tsx:67-72`: hidden `DialogPrimitive.Title` *Search FactorFlow* and `<Command loop label="Search FactorFlow">`. `CommandEmpty` renders the caller's children | `command.test.tsx:59-89` (TC-COMP-015) | Unchanged since v1 |
| DAC-E1-S3-5 | SATISFIED | `max-w-[560px]` is the only length literal in the five files (`command.tsx:57`). The new `toast.tsx:28` comment writes "20 px" and "24 px" with spaces, so the scan does not match it. `package.json` gains exactly the five packages, and the lock entries are MIT | `command.test.tsx:92-137` (TC-COMP-016), `token-literals.test.ts`, `vendoring.test.ts` | The plan's planted `max-h-[300px]` still fails both `token-literals` and `command`, naming `web/src/components/ui/command.tsx: 300px` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1's `cn`, `Button`, the 560 px allowance and the vendoring rules are unchanged at the base (`git diff --exit-code` over `token-literals.test.ts` and `vendoring.test.ts`, exit 0). v1 ran the suite at the base: 89 files, 2227 tests | Unchanged since v1 |
| T002 | complete | VERIFIED | `dialog.test.tsx:53-93` (TC-COMP-012), plus `:202-240` for the content and overlay tokens and the absent shipped literals | Now `ADEQUATE`: `dialog.tsx:manual:14` to `17` are killed |
| T003 | complete | VERIFIED | `toast.test.tsx:45-100` (TC-COMP-013), plus `:133-184` for the `toaster group` marker, the surface tokens and absent shadow, the per-outcome accents and the dismiss size | Now `ADEQUATE`: `toast.tsx:manual:7` to `12` are killed. The placeholder `expect(user).toBeDefined()` is gone (v1 IR-009) |
| T004 | complete | VERIFIED | `progress.test.tsx:11-51` | Unchanged and adequate |
| T005 | complete | VERIFIED | `command.test.tsx:57-90` (TC-COMP-015), plus `:147-220` for the content and scrim, list cap, input height, item, heading tokens and the input focus ring | Now `ADEQUATE`: `command.tsx:manual:6` to `12` are killed. Late gaps: IR-001 |
| T006 | complete | VERIFIED | `command.test.tsx:92-137` | Unchanged and adequate |
| T007 | complete | VERIFIED | `dialog.test.tsx:96-192` | Unchanged; it shares `dialog.test.tsx`'s new token block with T002 |
| T008 | complete | VERIFIED | `stepper.test.tsx:17-120`, plus `:130-210` for `ol`, the link's ring width and colour, the dot fills and outlines, the numeric face, the title weights, the summary face, and the default-prevented click with `onSelect` | Now `ADEQUATE`: `stepper.tsx:manual:3` to `10` and `13` to `15` are killed. `:88-108` no longer lets jsdom attempt navigation |
| T009 | complete | VERIFIED | `progress.test.tsx:53-109`, plus `:118-141` for the `h-2` and `rounded` track, absent `h-4` and `rounded-full`, and `motion-safe:animate-pulse` | Now `ADEQUATE`: `progress.tsx:manual:6` to `8` are killed |
| T010 | complete | VERIFIED | `toast.test.tsx:102-124` | Unchanged and adequate |
| T011 | complete | VERIFIED | `package.json` and `package-lock.json` are unchanged since v1. Exactly the five MIT packages are added against the base | Unchanged since v1 |
| T012 | complete | VERIFIED | `dialog.tsx:23-106` | Unchanged since v1. Late gaps on the title, description and footer classes: IR-001 |
| T013 | complete | VERIFIED | `command.tsx:26-190`. The wrapper at `:85-88` adds the IR-005 focus ring | The ring departs from T013's wrapper class list. It is justified by v1 IR-005 and recorded in the cycle-7 evidence. Late gaps: IR-001 |
| T014 | complete | VERIFIED | `toast.tsx:16-50`. `:28-29` add `closeButton: "!size-5"` | This departs from T014's `classNames` list. It is justified by v1 IR-006 and toast spec section 5, and recorded in the cycle-7 evidence |
| T015 | complete | VERIFIED | `progress.tsx:21-57` | Unchanged since v1. Late gaps on `overflow-hidden` and `transition-all`: IR-001 |
| T016 | complete | VERIFIED | `stepper.tsx:19-105` | Unchanged since v1. The `aria-label` deviation is now recorded in the evidence (v1 IR-007). `underline-offset-4`: IR-002 |
| T017 | complete | VERIFIED | Full suite green: 94 files, 2280 tests. The `package.json` diff against the base is exactly five `dependencies` lines, with no `devDependencies` change. The protected-path diff is empty | Matches plan |
| T018 | complete | VERIFIED | The reviewer reran lint, format, `tsc` and build: all exit 0 | Matches plan |
| T019 | complete | VERIFIED | `CAP-003-E1-S3-tdd-evidence.yaml` has seven cycles, all `APPROVED`, with no drift. Cycle-7 cites `cycle-7.patch` (its `diff_sha256` is checked by the lint), a RED log of the 31 v1 survivors and the two new failing tests, and a mutation block (36 generated, 36 killed). `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings | Cycle-7 records `commit_hash: a6c5606…` rather than the plan's `stage`. It names the real commit, which carries `Decision-Id: DEC-0302` and `DEC-0305` as parsed trailers |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `dialog.test.tsx` / TC-COMP-012 and T007 | ADEQUATE | Real Radix AlertDialog, unmocked. v1's behaviour assertions are unchanged. The new block splits the content's `class` into tokens and asserts `max-w-prose`, `rounded`, `border`, `border-border`, `bg-popover`, `text-popover-foreground` and `p-6`. It also asserts the absence of `max-w-lg`, `rounded-lg`, `shadow-lg`, `bg-background` and `text-foreground`, and checks the overlay for `bg-foreground/40` without `bg-black/80`. All 23 carried `dialog.tsx` mutants are killed | Late: title, description and footer classes, and a `shadow-*` other than `shadow-lg` (IR-001) |
| `toast.test.tsx` / TC-COMP-013 and T010 | ADEQUATE | Real sonner store with fake timers. `afterEach` now dismisses, then runs sonner's removal timers inside `act`, then cleans up, so no `act()` warning prints. The new block asserts the region's `toaster` and `group`, the four `group-[.toaster]:` surface tokens, the absence of three shipped classes, the exact `data-icon` accent per outcome, and `!size-5` on `[data-close-button]`. All 12 carried and 3 delta `toast.tsx` mutants are killed | Late: `description` and `actionButton` class names (IR-001) |
| `progress.test.tsx` / TC-COMP-014 and T009 | ADEQUATE | Real Radix Progress. The new block asserts the track's `h-2` and `rounded` without `h-4` or `rounded-full`, and the indeterminate indicator's `motion-safe:animate-pulse`. All 12 carried `progress.tsx` mutants are killed | Late: `overflow-hidden` and `transition-all` (IR-001) |
| `command.test.tsx` "command dialog labelled…" / TC-COMP-015 | ADEQUATE | Real cmdk and Radix Dialog. The new block opens the real palette and asserts the content and scrim tokens and the absent shadow and black scrim. It also asserts the list cap and absent `max-h-80`, the input's absent `h-11`, the item's `rounded px-2 py-2` and accent selection with the shipped forms absent, the heading face, and the wrapper's three `focus-within:` ring tokens. All 12 carried and 3 delta `command.tsx` mutants are killed | Late: cmdk root surface, palette radius, `CommandEmpty`, disabled-item classes. No test renders `CommandLoading` or `CommandSeparator` (IR-001) |
| `command.test.tsx` "overlay family scan and packages" / TC-COMP-016 | ADEQUATE | Unchanged since v1. The planted `max-h-[300px]` fails it, naming the file | None |
| `stepper.test.tsx` / T008 (no TC; Open Gap 6) | ADEQUATE | Native DOM, no mocks. The new block asserts the `ol` tag name, the link's `focus-visible:ring` and `ring-ring` with `outline-none` and without `ring-4`, and the done, current and to-do dot tokens. It also asserts `font-numeric` and `text-xs` on every dot, the current title's weight and the to-do title's muted colour, and the summary face. A document bubble listener sees `defaultPrevented` true after React's handler when `onSelect` is given. React's root listener fires before `document`, so a `stopPropagation` mutant never reaches the listener and fails. All 20 carried `stepper.tsx` mutants are killed, by tests rather than `tsc` alone | Late: done label colour, `hover:underline`, `data-state`, list gap (IR-001) |
| `token-literals.test.ts`, `vendoring.test.ts` (S1, unchanged) | ADEQUATE | Both scan the five files and the new packages without edits | None |

The tests are deterministic and isolated. No Radix, cmdk or sonner module is mocked. The new
assertions read `class` tokens with a shared `tokensOf` helper. That is the only observation jsdom
offers for Tailwind classes, and it is the pattern CAP-003-E1-S1 and S2 use. The full-suite run
prints no `stderr` block for any of the five files.

**Mutation run (E.9).**

1. `generate` over `4f168da..HEAD` produced the same 15 catalogue mutants as v1: 8 `negate-boolean`
   and 7 `off-by-one`. No catalogue operator matches the two new production lines.
2. The reviewer added 24 hand-written mutants (`:manual:v2-1` to `v2-24`):
   - six on the lines changed since v1 (`command.tsx:85-88`, `toast.tsx:29`);
   - 18 more on unchanged lines, probing classes that T012 to T016 or a spec fix and that no test
     yet names.
3. `scope --since f864d0e --previous CAP-003-E1-S3-implementation-review-v1-mutation.json` (sha256
   `8d0aea7beed17739c5ac90ce57c1e12e47a902297bd15dbee19b94f121c3efb2`) added v1's 64 manual
   mutants. All 79 of v1's mutants still apply ("0 previous mutant(s) no longer apply"). It tagged
   79 `carried`, 6 `delta` and 18 `late`.
4. `run` used 4 jobs. The command was `cd {workdir} && ln -sfn <component>/node_modules
   node_modules && npx vitest run components/ui components/token-literals && npx tsc --noEmit`,
   the same command as v1.

All four baselines were green, with 17 files and 179 tests. Result: 103 mutants, 85 killed, 18
survived. Every survivor is `late`. Each survivor's log shows all 179 tests passing and `tsc`
passing. The results are in `CAP-003-E1-S3-implementation-review-v2-mutation.json` beside this
report (sha256 `703d611252ec89c95261aba5f702fa9ffc0b5975d4c326d45f3d56bc9fe105fa`).

The plan's planted literal ran separately, as in v1, because it tests the scan rather than the
component suites.

| Mutant | Scope | State | Equivalence judgement |
|--------|-------|-------|-----------------------|
| 15 catalogue mutants (`dialog.tsx:42,51(×2),61,68,96`; `progress.tsx:32,47(×3)`; `stepper.tsx:69(×2),71,75,79`) | carried | killed | n/a |
| v1's 48 killed manual mutants (role, `aria-modal`, Cancel order and label, pending guards, opener restore, `loop`, labels, persistence, `closeButton`, options type, null total, `max`, `aria-labelledby`, `aria-current`, state text) | carried | killed | n/a |
| v1's 31 survivors: `dialog.tsx:manual:14-17`; `command.tsx:manual:6-12`; `toast.tsx:manual:7-12`; `progress.tsx:manual:6-8`; `stepper.tsx:manual:3-10,13-15` | carried | killed | n/a. Every one fails a cycle-7 test. `stepper.tsx:manual:2` (deleting `event.preventDefault();`) now fails `stepper.test.tsx:195` before `tsc` runs |
| `command.tsx:manual:v2-1` (`focus:` in place of `focus-within:`), `v2-2` (`ring-primary`), `v2-3` (`ring-2`) | delta | killed | n/a. Each fails `command.test.tsx:209` |
| `toast.tsx:manual:v2-4` (`!size-4`), `v2-5` (`!h-5`), `v2-6` (`size-5` without `!`) | delta | killed | n/a. Each fails `toast.test.tsx:174` |
| `command.tsx:manual:v2-7` (cmdk root `bg-background text-foreground`) | late | survived | Not equivalent. Command spec section 6: surface `--popover`/`--popover-foreground`; T013 (IR-001) |
| `command.tsx:manual:v2-8` (palette content `rounded-lg`) | late | survived | Not equivalent. Command spec section 6: radius `--radius`. The Phase 3 preamble maps `rounded-*` to `rounded` (IR-001) |
| `command.tsx:manual:v2-9` (`CommandLoading` loses `text-xs text-muted-foreground`) | late | survived | Not equivalent. T013 fixes these classes, and no test renders `CommandLoading` (IR-001) |
| `command.tsx:manual:v2-10` (`CommandSeparator` `bg-foreground`) | late | survived | Not equivalent. T013 fixes `bg-border`, and no test renders `CommandSeparator` (IR-001) |
| `command.tsx:manual:v2-11` (`CommandEmpty` `py-6 text-sm`) | late | survived | Not equivalent. T013 fixes `py-5 text-center text-base` (IR-001) |
| `command.tsx:manual:v2-12` (disabled-item classes removed) | late | survived | Not equivalent. T013 fixes `data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50` (IR-001) |
| `dialog.tsx:manual:v2-13` (title loses `font-semibold`) | late | survived | Not equivalent. T012 fixes `text-lg font-semibold` (IR-001) |
| `dialog.tsx:manual:v2-14` (description loses `text-muted-foreground`) | late | survived | Not equivalent. T012 fixes `text-base text-muted-foreground` (IR-001) |
| `dialog.tsx:manual:v2-15` (footer loses `justify-end`) | late | survived | Not equivalent. T012 fixes `flex justify-end gap-2` (IR-001) |
| `dialog.tsx:manual:v2-16` (content adds `shadow-md`) | late | survived | Not equivalent. The Phase 3 preamble removes every `shadow-*`. The new test rejects only `shadow-lg` (IR-001) |
| `toast.tsx:manual:v2-17` (`description` class removed) | late | survived | Not equivalent. T014 fixes `group-[.toast]:text-muted-foreground` (IR-001) |
| `toast.tsx:manual:v2-18` (`actionButton` class removed) | late | survived | Not equivalent. T014 fixes `group-[.toast]:bg-primary group-[.toast]:text-primary-foreground` (IR-001) |
| `progress.tsx:manual:v2-19` (track loses `overflow-hidden`) | late | survived | Not equivalent. T015 fixes it. Without it, the `translateX(-P%)` indicator draws outside the fully rounded track (progress spec section 3) (IR-001) |
| `progress.tsx:manual:v2-20` (indicator loses `transition-all`) | late | survived | Not equivalent. T015 fixes it (IR-001) |
| `stepper.tsx:manual:v2-21` (done title `text-muted-foreground`) | late | survived | Not equivalent. Stepper spec section 3: the done label is `--foreground` (IR-001) |
| `stepper.tsx:manual:v2-22` (link loses `hover:underline`) | late | survived | Not equivalent. T016 fixes it as the done link's pointer affordance (stepper spec section 4) (IR-001) |
| `stepper.tsx:manual:v2-23` (`li` loses `data-state`) | late | survived | Not equivalent. T016 fixes `data-state={state}` (IR-001) |
| `stepper.tsx:manual:v2-24` (`ol` loses `gap-4`) | late | survived | Not equivalent. T016 fixes `flex flex-col gap-4` (IR-001) |

Equivalent by artifact, not run: dropping `theme="light"` from `Toaster` (plan Other Notes; sonner
2.0.8 defaults to `light`). This is as in v1.

## Independent Validation

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
`<component>` is `repos/factorflow-v2/FactorFlow-v2` under it. The npm commands ran with the
component root as their working directory (`npm --prefix <component>`; `npx --prefix <component>
tsc --noEmit -p <component>/tsconfig.json`), as the tech stack's working directory `.` requires.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir <component> --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `4f168da97da41a7f6a7e2587b51ea98c5c3f4389` |
| `git merge-base --is-ancestor 4f168da9 HEAD` | component root | 0 | PASS | The review base is an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir <component> --base 4f168da9... --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings (seven cycles) |
| `npm run test -- src/components/ui/{dialog,command,toast,progress,stepper}.test.tsx` | component root | 0 | PASS | Narrowest story suites first: 5 files, 53 tests (v1: 33). No `stderr` block |
| `npm run test` | component root | 0 | PASS | 94 files, 2280 tests, before and again after `npm ci` (v1: 2260; the rework adds 20). No `stderr` block for the five files |
| `npm run lint` | component root | 0 | PASS | Biome: 212 files, no findings (before and after `npm ci`) |
| `npm run format` | component root | 0 | PASS | Biome: 212 files, no changes (before and after `npm ci`) |
| `npx tsc --noEmit -p <component>/tsconfig.json` | component root | 0 | PASS | No output, before and after `npm ci`. The four `@ts-expect-error` cases type-check |
| `npm run build` | component root | 0 | PASS | 102 modules, `index-DWATjBil.css`, before and after `npm ci`. Writes only ignored files under `src/factorflow/api/static/` |
| `npm ci` | component root | 0 | PASS | 306 packages. The same 10 audit advisories as v1, none in the five added packages. Run after the mutation run, because every mutation clone links this `node_modules` |
| Built CSS `index-DWATjBil.css` checked for the classes changed since v1 (`rg -o`) | component root | 0 | PASS | `.\!size-5{width:var(--space-5)!important;height:var(--space-5)!important}`; `focus-within:ring` to `calc(var(--focus-ring-width) + …)`; `focus-within:ring-inset`; `focus-within:ring-ring` to `hsl(var(--ring) …)`. `--space-5` is `1.5rem` (24 px) in `design-system/theme.css:224`. The other classes are unchanged since v1's full resolution |
| Planted `max-h-[300px]` in `CommandList`, run through `mutation-run.py run` against `npm run test -- token-literals` and, separately, `npm run test -- command` | mutation clones | 1 | PASS | Both fail on the plant and pass on the baseline. `token-literals.test.ts` reports `+ "web/src/components/ui/command.tsx: 300px"`, and `command.test.tsx` (TC-COMP-016) reports the same entry |
| `git diff 4f168da9..HEAD -- package.json`; `git diff --exit-code f864d0e..HEAD -- package.json package-lock.json` | component root | 0 | PASS | Exactly five `dependencies` lines added against the base, and no `devDependencies` change. Nothing changed since v1, whose lock and `LICENSE` checks (all MIT) therefore still hold |
| `git diff --exit-code 4f168da9..HEAD -- tailwind.config.js design-system web/src/app web/src/api web/src/test-setup.ts web/src/components/token-literals.test.ts web/src/components/ui/vendoring.test.ts` | component root | 0 | PASS | T017: nothing protected changed |
| `rg -n -e 'bg-destructive' -e 'variant="destructive"' web/src/components/ui/dialog.tsx` | component root | 1 | PASS | No match (DAC-E1-15) |
| `rg -n -e '#[0-9a-fA-F]{3,8}\b' -e dangerouslySetInnerHTML <five files>` | component root | 1 | PASS | No match (AC-26; component design 4) |
| `rg -n -e '\b[0-9]+(\.[0-9]+)?(px\|rem\|em\|vh\|vw)\b' <five files>` | component root | 0 | PASS | One match only, `command.tsx:57` `max-w-[560px]` (DAC-E1-S3-5). The new comment's "20 px" and "24 px" carry a space |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 4f168da9..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 15 catalogue mutants; the reviewer appended 24 manual mutants |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mutants-with-manual.json --since f864d0ea… --previous <v1 -mutation.json> --out <scratch>/mutants.json` | harness root | 0 | N/A | 103 mutants: 79 carried, 6 delta, 18 late |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 300 --work-root <scratch>/work --logs <scratch>/results-logs --command '<focused suites + tsc>' --out <scratch>/results.json` | harness root | 3 | N/A | 85 killed, 18 survived (all `late`); see the table above |
| `python3 scripts/pipeline-state.py code-revision --repo-dir <component>` | harness root | 0 | N/A | `sha256:471e6a6ef0424f1af79479836164088342ba68b2a05b74991d5261a8ba7d816b`, the same before and after validation |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | N/A | `sha256:e9c3c5812cf977784a20014d40c152f11aeca809c0901a58fd3b65097b971250`, equal to the story approval's `reviewed_revision` |
| AC-25 manual check after `npm run build` | — | N/A | NOT RUN | The plan's Story-Specific Validation says "none required beyond the tests". No screen renders the five components yet |
| `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | component root | N/A | NOT RUN | No Python file changed. Neither the story's validation list nor the plan's includes them |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |

The Gate Summary counts 14 required validation entries, and all pass:

- the six tech-stack frontend commands: `npm ci`, test, lint, format, `tsc` and build;
- the TDD-evidence lint;
- seven story-specific checks:
  - built CSS resolution of the changed classes;
  - the planted literal;
  - the package and licence diff;
  - the protected-path diff;
  - the DAC-E1-15 grep;
  - the AC-26 hex and raw-HTML grep;
  - the length-literal grep.

No command was refused by the sandbox, so none needed a retry outside it. The mutation runner
refused to clone while this report was untracked in the component repository ("untracked files
would be missing from the clones"). The reviewer moved its own draft to its scratch directory for
the planted-literal runs and moved it back. It staged nothing.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-003-E1-S3-run-20261108T150357Z` at
  `b5f180d94188abc6d5aeca2f970c15bf38cebd65`. No staged, unstaged or untracked non-ignored files.
  `code-revision` was `sha256:471e6a6ef0424f1af79479836164088342ba68b2a05b74991d5261a8ba7d816b`.
- **After.** Same HEAD, and the same `code-revision`.
  - The only untracked files are this report and its `-mutation.json`, both under `docs/`, which
    the fingerprint excludes.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - Mutants and the planted literal ran only in clones under the reviewer's scratch directory.
- **Unexpected tracked-file changes.** None.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | late | Eighteen plan- and spec-fixed classes on lines unchanged since v1 are still unpinned |
| IR-002 | LOW | carried | `underline-offset-4` is accepted only in the TDD evidence (v1 IR-008) |

### IR-001 — Eighteen plan- and spec-fixed classes on lines unchanged since v1 are still unpinned

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-26 (and AC-25 for the done link's hover affordance)
- **Tasks**: T002, T003, T005, T008, T009 (tests); T012 to T016 (the classes they fix)
- **Files**:
  - `command.tsx:33,57,123,135,159,172`
  - `dialog.tsx:69,80,83,88`
  - `toast.tsx:27,30`
  - `progress.tsx:39,46`
  - `stepper.tsx:42,58,62,79`
  - their test files
- **Claim challenged**: The cycle-7 tests claim to pin each component's design-system tokens. T012
  to T016 fix each class named below.
- **Observed evidence**: The reviewer's 18 late mutants all survive the 17 focused files (179 tests)
  and `tsc`. They split into two groups.
  - Six change a value a design-system spec or the Phase 3 preamble names:
    - the cmdk root surface (`v2-7`, command spec 6 `--popover`);
    - the palette content radius `rounded-lg` (`v2-8`, command spec 6 `--radius`);
    - a `shadow-md` on the confirm dialog (`v2-16`). The preamble removes every `shadow-*`, but the
      test rejects only `shadow-lg`;
    - the progress track's `overflow-hidden` (`v2-19`), without which the translated indicator
      draws outside the track;
    - the done-step label colour (`v2-21`, stepper spec 3 `--foreground`);
    - the done link's `hover:underline` (`v2-22`).
  - Twelve change a class only T012 to T016 fix:
    - `CommandLoading` (`v2-9`) and `CommandSeparator` (`v2-10`). No test renders either, although
      T013 and the story list both as exports;
    - `CommandEmpty`'s face (`v2-11`) and the disabled-item classes (`v2-12`);
    - the confirm title weight, description colour and footer alignment (`v2-13` to `v2-15`);
    - the toast `description` and `actionButton` tokens (`v2-17`, `v2-18`);
    - the indicator's `transition-all` (`v2-20`), the `li`'s `data-state` (`v2-23`) and the list
      gap (`v2-24`).
- **Expected evidence/behavior**: Skill E.9: no non-equivalent mutant survives. Component design
  3: "Every variant used is one its spec defines". AC-26: theme tokens only.
- **Impact**: A later edit or re-vendor could change any of these without failing the suite. Under
  E.9 they would make their tests `WEAK`. They are on lines unchanged since v1 and v1 could have run
  them, so skill H scopes them `late`: MEDIUM at most, and they do not block. None is a production
  defect: the code matches the plan on every one.
- **Required remediation**: Optional for this gate. In a later touch of these files, make each
  listed mutant fail a test. In particular, render `CommandLoading` and `CommandSeparator` once, and
  reject any `shadow-*` token rather than `shadow-lg` alone.

### IR-002 — `underline-offset-4` is accepted only in the TDD evidence (v1 IR-008)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T016
- **Files**: `web/src/components/ui/stepper.tsx:79`; built CSS
  `.underline-offset-4{text-underline-offset:4px}`;
  `CAP-003-E1-S3-tdd-evidence.yaml` cycle-7 `description`
- **Claim challenged**: v1 IR-008 asked for either a token-backed offset or a record accepting the
  offset alongside the hairlines, in the plan or as a DEC-0305 follow-up.
- **Observed evidence**: The class is unchanged. Cycle-7's description says "IR-008 is accepted,
  not fixed … the owner can fold it in with the hairlines under DEC-0305". The plan (`git diff
  f864d0e..HEAD` changes only `updated` and `last_reworked_review`) and DEC-0305 say nothing about
  it.
- **Expected evidence/behavior**: AC-26 and component design 3: no size literal outside the theme.
  The Phase 3 preamble names the accepted hairlines, and this offset is not among them.
- **Impact**: Negligible visually. A reader of the plan or DEC-0305 cannot tell this 4 px literal
  was knowingly kept.
- **Required remediation**: Optional. Record the accepted offset in the plan's Resolved Conflicts or
  in DEC-0305's follow-up at the owner's next review of DEC-0305, or use a token-backed offset.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `stepper.test.tsx:148-155` asserts `focus-visible:ring`, `focus-visible:ring-ring` and `focus-visible:outline-none`, and the absence of `focus-visible:ring-4`. `stepper.tsx:manual:3` is killed |
| v1/IR-002 (HIGH) | RESOLVED | All 11 survivors are killed: `dialog.tsx:manual:14`, `15` and `16`; `command.tsx:manual:6` and `9` to `12`; `toast.tsx:manual:11`; `progress.tsx:manual:7`; `stepper.tsx:manual:5`. The tests are `dialog.test.tsx:210-240`, `command.test.tsx:155-195`, `toast.test.tsx:141-160`, `progress.test.tsx:129-135` and `stepper.test.tsx:157-173` |
| v1/IR-003 (HIGH) | RESOLVED | All 16 survivors are killed: `dialog.tsx:manual:17`; `command.tsx:manual:7` and `8`; `toast.tsx:manual:7` to `10` and `12`; `progress.tsx:manual:6`; `stepper.tsx:manual:4`, `6` to `10` and `13`. The tests are `dialog.test.tsx:210-232`, `command.test.tsx:175-207`, `toast.test.tsx:134-172`, `progress.test.tsx:129-135` and `stepper.test.tsx:157-193` |
| v1/IR-004 (HIGH) | RESOLVED | `stepper.tsx:manual:14` (`ul`) is killed by `stepper.test.tsx:143-146`. `stepper.tsx:manual:15` (`stopPropagation`) and `:manual:2` (deletion) are killed by `:195-209`, the deletion now by a test as well as `tsc`. `progress.tsx:manual:8` is killed by `progress.test.tsx:137-140` |
| v1/IR-005 (MEDIUM) | RESOLVED | `command.tsx:85-88` adds `focus-within:ring focus-within:ring-inset focus-within:ring-ring`. In the built CSS that is `--focus-ring-width` and `hsl(var(--ring))`. `command.test.tsx:209-220` pins it. The reviewer's `command.tsx:manual:v2-1` to `v2-3` (`focus:` instead of `focus-within:`, `ring-primary`, `ring-2`) are killed |
| v1/IR-006 (MEDIUM) | RESOLVED | `toast.tsx:29` sets `closeButton: "!size-5"`. The built CSS has `.\!size-5{width:var(--space-5)!important;height:var(--space-5)!important}`, and `--space-5` is `1.5rem` (24 px). The `!important` beats sonner's (0,3,0) 20 px rule. `toast.test.tsx:174-183` pins it. The reviewer's `toast.tsx:manual:v2-4` to `v2-6` are killed |
| v1/IR-007 (LOW) | RESOLVED | Cycle-7's description records both deviations. It records the done link's `aria-label` (with the jsdom reason, flagging DEC-0304's wording for its follow-up). It also records that cycle-1's RED script was not kept and that T006 was staged with cycle-3 |
| v1/IR-008 (LOW) | STILL OPEN | `stepper.tsx:79` is unchanged. It is accepted in the evidence only (IR-002 here) |
| v1/IR-009 (LOW) | RESOLVED | The full suite prints no `stderr` block for the five files: no `act()` warning and no "Not implemented: navigation". `toast.test.tsx:10-23` runs sonner's timers inside `act`, and `stepper.test.tsx:99-104` prevents the navigation after recording. The placeholder assertion is removed |

## Scope and Plan Deviations

- **IR-005 and IR-006 fixes depart from T013 and T014's class lists.** The palette input wrapper
  gains a `focus-within` ring, and `toastOptions.classNames` gains `closeButton`. Both are justified
  by v1's findings and by UX design 0.6 and toast spec section 5. Cycle-7 records them. The plan's
  text was not updated, so doc sync should describe the code, not T013 and T014 as written.
- **IR-008 accepted, not fixed.** See IR-002.
- **Cycle-7 `commit_hash`.** It records the real commit `a6c5606` rather than the plan's `stage`.
  The lint accepts it, and it is accurate.
- **Decision trailers.** `a6c5606` and `b5f180d` carry `Decision-Id: DEC-0302` and `Decision-Id:
  DEC-0305` as the final paragraph, which git parses as trailers. DEC-0305 is still `open`
  (`owner_reviewed: false`). Its three values are now pinned by tests (`dialog.tsx:manual:14`,
  `command.tsx:manual:6` and `stepper.tsx:manual:5` are killed), so an owner change to them would
  now fail a test until the tests follow.
- **Bookkeeping.** The story is `in-review` and unchanged since v1. All 19 tasks are ticked, and each
  tick has evidence. `last_reworked_review` names v1.
- **Out-of-scope changes.** None. No dependency, configuration or protected file changed since v1.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`).
- **Required action**: Synchronize the `ui-components` documentation with the five components as
  built. Describe the palette input's `focus-within` ring and the 24 px toast dismiss control from
  the code, since T013 and T014's text predates them. Optionally, close IR-001 and IR-002 in a later
  touch of these files.
- **Warnings accepted downstream**: IR-001, IR-002.
