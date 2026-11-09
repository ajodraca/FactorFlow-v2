---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T16:52:50Z"
reviewed_head: "f864d0ea8ba4d018bd038ac8e8573d158b38ac5f"
review_base: "4f168da97da41a7f6a7e2587b51ea98c5c3f4389"
reviewed_state_revision: "sha256:3328e85cb0d696afb368f71a391b952b395aac486d3e3c431c6255c2bc2991ab"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-08T16:52:50Z
  source_artifacts:
    - id: CAP-003-E1-S3
      version: "1 (sha256:e9c3c5812cf977784a20014d40c152f11aeca809c0901a58fd3b65097b971250)"
    - id: CAP-003-E1-S3-tasks
      version: "1 (updated 2026-11-07; 19 tasks ticked at f864d0e)"
    - id: CAP-003-E1-S3-tdd-evidence
      version: "cycle-1 to cycle-6"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-coverage-matrix
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
      version: "provisional, applied (owner upheld 2026-11-07)"
    - id: DEC-0302
      version: "provisional, applied (owner upheld 2026-11-07)"
    - id: DEC-0303
      version: "provisional, applied (owner upheld 2026-11-07)"
    - id: DEC-0304
      version: "provisional, applied (owner upheld 2026-11-07)"
    - id: DEC-0305
      version: "provisional, open (owner review pending)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 4 |
| Medium findings | 2 |
| Low findings | 3 |
| Acceptance criteria | 7/9 satisfied |
| Planned tasks | 19/19 verified |
| Required validation | 14/14 passed |

This is an initial review, so every finding has scope `initial`.

The production code does what the story asks. All five components are vendored as the plan and
DEC-0301 to DEC-0305 describe. Every acceptance criterion's behaviour is pinned by a test. The
reviewer killed every mutant on the role, `aria-modal`, Cancel order and label, the pending
guards, the focus restore, `loop`, the palette label, toast persistence and type, the progress
range, and `aria-current`. Exactly five packages are added, each MIT, and the reviewer opened each
`LICENSE` file. All 14 required validation checks pass: `npm ci`, the full suite (94 files, 2260
tests), lint, format, `tsc`, build, the TDD-evidence lint, and seven story-specific checks.

The gate fails on test strength, the same failure as CAP-003-E1-S2 v1. The reviewer ran 79
mutants: the 15 catalogue mutants, the plan's nine hand-written mutants and 55 of the reviewer's
own, over all five production files. 31 survive, and none is equivalent. Each survivor changes
something the task plan, a decision record, a design-system spec or the UX design fixes:

- **IR-001.** The visible focus ring can be deleted from the stepper's done-step link.
- **IR-002.** Eleven shipped Tailwind-default literals the plan replaces can be put back undetected.
- **IR-003.** Sixteen design-system spec token and anatomy choices are unpinned.
- **IR-004.** The `ol`, the indeterminate motion and the `preventDefault` before `onSelect` are
  unpinned.

Under skill E.9 each survivor makes its test `WEAK`, which is HIGH. Four of the five test files
hold mandatory TC-COMP-012 to TC-COMP-015 cases; the fifth holds the plan's stepper test (T008).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S3-run-20261108T150357Z` |
| HEAD | `f864d0ea8ba4d018bd038ac8e8573d158b38ac5f` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` (the driver's integration branch, passed as `--base-ref`), merge base `4f168da97da41a7f6a7e2587b51ea98c5c3f4389`; ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 86 (82 added, 4 modified) in one commit, `f864d0e` |
| Baseline | none: initial review |

State check: `pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — story is ready for
independent review`. Without `--base-ref` the same check reports `BLOCKED — story coding has not
reached in-review`. The default base is the remote default branch, which lacks the integration
branch's sibling work, so the TDD-evidence lint inside the check fails against it. The driver
supplied the integration branch, so the reviewer used it, as skill A.2 requires.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/ui/dialog.tsx` | added | DAC-E1-S3-1, DAC-E1-14, DAC-E1-15; T012 (DEC-0301, DEC-0305) |
| `web/src/components/ui/dialog.test.tsx` | added | TC-COMP-012; T002, T007 |
| `web/src/components/ui/command.tsx` | added | DAC-E1-S3-4, DAC-E1-S3-5; T013 (DEC-0305) |
| `web/src/components/ui/command.test.tsx` | added | TC-COMP-015, TC-COMP-016; T005, T006 |
| `web/src/components/ui/toast.tsx` | added | DAC-E1-S3-2; T014 (DEC-0302) |
| `web/src/components/ui/toast.test.tsx` | added | TC-COMP-013; T003, T010 |
| `web/src/components/ui/progress.tsx` | added | DAC-E1-S3-3; T015 (DEC-0303) |
| `web/src/components/ui/progress.test.tsx` | added | TC-COMP-014; T004, T009 |
| `web/src/components/ui/stepper.tsx` | added | DAC-E1-14 stepper half; T016 (DEC-0304, DEC-0305) |
| `web/src/components/ui/stepper.test.tsx` | added | DAC-E1-14 stepper half (no TC, Open Gap 6); T008 |
| `package.json` | modified | DAC-E1-S3-5; T011: five `dependencies` lines |
| `package-lock.json` | modified | DAC-E1-S3-5; T011: five package entries, each `"license": "MIT"`; no new transitive package |
| `docs/.../stories/CAP-003-E1-S3.md` | modified | Story-coding handoff: `status: planning` to `in-review` (one line) |
| `docs/.../stories/CAP-003-E1-S3-tasks.md` | modified | 19 task checkboxes ticked; no other change |
| `docs/.../stories/CAP-003-E1-S3-tdd-evidence.yaml` | added | T019 |
| `docs/.../stories/CAP-003-E1-S3-evidence/` (71 files) | added | T019: six cycle patches, six RED logs, five mutation results files with their logs |

No path outside the story's file list changed. `tailwind.config.js`, `design-system/`,
`web/src/app/`, `web/src/api/`, `web/src/test-setup.ts`, `token-literals.test.ts` and
`vendoring.test.ts` are untouched (`git diff --exit-code`, exit 0).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-25 | PARTIAL | Radix AlertDialog supplies the `confirm` trap and Esc (`dialog.tsx:56-102`). Radix Dialog and cmdk supply the palette (`command.tsx:52-77`). Sonner's close button is a tab stop (`toast.tsx:21`). `progress` is not focusable. The stepper's done step is a native link (`stepper.tsx:75-88`) | `dialog.test.tsx:55-93` (Tab wrap both ways, Esc, overlay), `command.test.tsx:59-89` (arrows, wrap, Esc), `toast.test.tsx:68-95` (Tab to close, Enter), `stepper.test.tsx:62-71` (Tab, Enter, Tab leaves) | The keyboard paths are pinned. The done link's visible focus ring is not (IR-001). The palette input suppresses its outline with no replacement (IR-005) |
| AC-26 | PARTIAL | Every class in the five files resolves to a theme token in the built CSS (`index-YG8ZF9nu.css`), apart from the plan-accepted `h-px` and `border` hairlines, the allowed `max-w-[560px]`, and `underline-offset-4` (IR-008) | `command.test.tsx:92-119` (TC-COMP-016 scan), `token-literals.test.ts` (unchanged), class assertions in each `*.test.tsx` | The scan catches unit-joined literals only. Eleven shipped Tailwind-default literals (IR-002) and sixteen spec token choices (IR-003) can be restored or swapped undetected |
| DAC-E1-14 | SATISFIED | `dialog.tsx:89-100` (Cancel first, Radix focuses it); `stepper.tsx:63` (`aria-current="step"`); `progress.tsx:34-41` (`progressbar`, `aria-labelledby` pass-through); `command.tsx:62-70` (`loop`, opener restore) | `dialog.test.tsx:67-69`, `stepper.test.tsx:27-33`, `progress.test.tsx:13-25`, `command.test.tsx:73-88` | Killed: Cancel and confirm swapped, Cancel relabelled, `aria-current` on the done step, `loop` removed, opener refocus removed in both dialogs |
| DAC-E1-15 | SATISFIED | `dialog.tsx` has no `variant` prop and no destructive class; confirm is `Button variant="default"` (`dialog.tsx:92-100`) | `dialog.test.tsx:177-192` | `grep -nE 'bg-destructive\|variant="destructive"' dialog.tsx` prints nothing. The `variant="secondary"` mutant is killed |
| DAC-E1-S3-1 | SATISFIED | `dialog.tsx:63-77`: `role="dialog"`, `aria-modal="true"`, opener recorded on open and refocused on close; the overlay closes through its own `onClick` (Resolved Conflict 3) | `dialog.test.tsx:55-93` (TC-COMP-012) and `:96-175` (T007) | Killed: role override removed (Radix renders `alertdialog`), `aria-modal` removed, opener refocus removed, overlay `onClick` removed, pending guard negated or dropped, `aria-busy` leaking `false` |
| DAC-E1-S3-2 | SATISFIED | `toast.tsx:40-46`: `warning` and `error` pass `duration: Number.POSITIVE_INFINITY`; `success` keeps sonner's 4000 ms; no `info` and no `important`; sonner's `section` is `aria-live="polite"` | `toast.test.tsx:41-66` (TC-COMP-013), `:68-95` (dismiss by keyboard), `:99-119` (T010) | Killed: either persistence dropped, `success` made persistent, `warning` calling `error`, `closeButton` removed, options widened (by `tsc`) |
| DAC-E1-S3-3 | SATISFIED | `progress.tsx:32-49`: indeterminate when `value` or `max` is `null`, Radix gets `value={null}` then; `max` passed through; `aria-labelledby` required by the type | `progress.test.tsx:13-50` (TC-COMP-014), `:54-108` (T009) | Killed: the null-total test dropped, `max` not passed, `value` passed while indeterminate, the `/ max` division dropped, `aria-labelledby` made optional (by `tsc`) |
| DAC-E1-S3-4 | SATISFIED | `command.tsx:67-72`: hidden `DialogPrimitive.Title` *Search FactorFlow*, `<Command loop label="Search FactorFlow">`; `CommandEmpty` renders the caller's children | `command.test.tsx:59-89` (TC-COMP-015) | Killed: title text changed, `label` removed, `loop` removed, opener refocus removed, width swapped |
| DAC-E1-S3-5 | SATISFIED | `max-w-[560px]` is the only length literal in the five files (`command.tsx:57`). `package.json` gains exactly the five packages; lock and `LICENSE` files are MIT | `command.test.tsx:92-136` (TC-COMP-016), `token-literals.test.ts`, `vendoring.test.ts` | The plan's planted `max-h-[300px]` in `CommandList` fails both `npm run test -- token-literals` and `npm run test -- command`, each naming `web/src/components/ui/command.tsx: 300px` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | S1's `cn` (`utils.ts:20`), `Button` with `asChild` and the four variants (`button.tsx:20-51`), the 560 px allowance (`token-literals.test.ts:146-148`) and the vendoring rules (`vendoring.test.ts:79-84`) are present at the base. The reviewer ran the suite at the base in a scratch clone: 89 files, 2227 tests green | No baseline log persisted (bookkeeping only); the reviewer's run supplies it |
| T002 | complete | VERIFIED | `dialog.test.tsx:53-93`: role and name, `aria-modal`, `data-variant`, no `alertdialog`, description, button order literal, Cancel focused, Tab wrap both ways, Esc and opener focus, overlay close and opener focus | `WEAK` for the dialog's token classes (IR-002, IR-003) |
| T003 | complete | VERIFIED | `toast.test.tsx:39-96`: fake timers as planned, focus never moves, success gone after 6000 ms, error and warning stay, polite region, no assertive region, no `alert`, close button reached by Tab, Enter dismisses only that toast | `WEAK` for the toast's accent, surface and literal classes (IR-002, IR-003). Test noise: IR-009 |
| T004 | complete | VERIFIED | `progress.test.tsx:11-51`: determinate range and name, indeterminate without `aria-valuenow`, null total indeterminate | Adequate for TC-COMP-014; the file's token gaps are under T009 |
| T005 | complete | VERIFIED | `command.test.tsx:57-90`: name, `max-w-[560px]`, input focus, name and placeholder, selected *Home*, ArrowUp wraps to *Settings*, ArrowDown back, empty wording absent then shown, no options, Esc and opener focus | `WEAK` for the palette's token classes (IR-002, IR-003) |
| T006 | complete | VERIFIED | `command.test.tsx:92-136`: the five sources read, the length regex yields only `command.tsx: 560px`, no hex and no colour function, five packages with MIT lock licences | Adequate. Staged with cycle 3, not cycle 6 as T019 planned; the evidence records why |
| T007 | complete | VERIFIED | `dialog.test.tsx:96-192`: (a) one `onConfirm`, stays open; (b) pending blocks Esc, Cancel, overlay and confirm, `aria-disabled`, `aria-busy`; (c) children between description and buttons; (d) `data-variant="default"`, no `bg-destructive` | Adds idle `aria-busy` absence and the omitted-`pending` default. `WEAK` as T002 |
| T008 | complete | VERIFIED | `stepper.test.tsx:17-115`: labelled nav, one list of four, one `aria-current="step"`, done link name and `href`, *Found*, no link on current and to-do, hidden suffixes, `aria-hidden` dots sized by `markerSize`, check and numbers, Tab and Enter, only done-with-`href` links | `WEAK`: focus ring, ring literal, dot and label tokens, `ol` and `preventDefault` survive (IR-001 to IR-004) |
| T009 | complete | VERIFIED | `progress.test.tsx:53-108`: (a) `translateX(-75%)`; (b) `bg-seq-1`, `bg-status-active`, `bg-pattern-indeterminate`; (c) `@ts-expect-error` on a missing `aria-labelledby` | Adds the default maximum case. `WEAK`: track height, `rounded-full` and the motion survive (IR-002 to IR-004) |
| T010 | complete | VERIFIED | `toast.test.tsx:98-119`: (a) `data-type` per message; (b) two `@ts-expect-error` cases checked by `tsc` | Adequate for the call shape; token gaps are under T003 |
| T011 | complete | VERIFIED | `package.json`: `@radix-ui/react-alert-dialog` ^1.2.1, `@radix-ui/react-dialog` ^1.3.1, `@radix-ui/react-progress` ^1.2.1, `cmdk` ^1.1.1, `sonner` ^2.0.8; each React 18 compatible. Lock entries `"license": "MIT"`; `LICENSE`/`LICENSE.md` MIT in all five | Matches plan. `npm audit` lists 10 advisories, all in packages that predate this story |
| T012 | complete | VERIFIED | `dialog.tsx:23-106`: `ConfirmDialog` and its props only; close filter; overlay `data-slot`, classes and `onClick`; content role, `aria-modal`, `data-variant`, `aria-busy`, `max-w-prose`, opener capture and restore; header, `children`, footer with Cancel then a plain confirm `Button` | Matches plan and DEC-0301 |
| T013 | complete | VERIFIED | `command.tsx:26-187`: the nine exports; `CommandDialog` on Radix Dialog with the hidden title, `aria-describedby={undefined}`, opener restore, `<Command loop label="Search FactorFlow">`; `CommandList` `max-h-[calc(var(--row-height)*10)]`; `CommandLoading` over `Command.Loading`; no `CommandShortcut` | Matches plan. The input's `outline-none` follows T013 but conflicts with UX design 0.6 (IR-005) |
| T014 | complete | VERIFIED | `toast.tsx:16-48`: `Toaster` with `theme="light"`, `closeButton`, `toaster group`, token class names; `toast` with three wrappers and `ToastOptions = Pick<ExternalToast, "description" \| "action">` | Matches plan and DEC-0302. Close button size: IR-006 |
| T015 | complete | VERIFIED | `progress.tsx:21-57`: props type, `indeterminate`, Radix value and max, `data-variant`, track and indicator classes, transform from `value / (max ?? 100)` | Matches plan and DEC-0303 |
| T016 | complete | VERIFIED | `stepper.tsx:19-105`: types, `nav` and `ol`, `data-state`, `aria-current`, `aria-hidden` dot with inline size, state-keyed dot and title classes, done-with-`href` link with `onSelect` and `preventDefault`, hidden suffix, summary | The done link carries its state through `aria-label`, not the planned hidden span (IR-007). `underline-offset-4`: IR-008 |
| T017 | complete | VERIFIED | Whole suite green (94 files, 2260 tests). `git diff` of `package.json` against the base shows exactly five added `dependencies` lines and no `devDependencies` change. The protected-path diff is empty | Matches plan |
| T018 | complete | VERIFIED | The reviewer reran lint, format, `tsc` and build: all exit 0 | Matches plan |
| T019 | complete | VERIFIED | `CAP-003-E1-S3-tdd-evidence.yaml`: six cycles, all `APPROVED`, no drift, `commit_hash: stage`. `check-tdd-evidence.py --require-logs` reports 0 errors and 0 warnings. Cycles 2 to 6 carry mutation blocks with every mutant killed; cycle 1 is `not_applicable` as planned | The commit carries `Decision-Id` trailers for DEC-0301 to DEC-0305, which git parses. Cycle 1's RED comes from an unpersisted script (IR-007) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `dialog.test.tsx` / TC-COMP-012 and T007 | WEAK | Real Radix AlertDialog, unmocked. Asserts role, name, `aria-modal`, `data-variant`, accessible description, literal button order, Cancel focus, Tab wrap both ways, Esc and overlay closes with opener focus, pending blocking all four exits, `aria-busy`, `aria-disabled`, children order, confirm and Cancel variants. All 6 catalogue and 13 hand-written behaviour mutants killed | Survivors: shipped `max-w-lg`, `bg-black/80`, `rounded-lg` plus `shadow-lg` (IR-002); surface and body `--popover` tokens swapped for shadcn's (IR-003) |
| `toast.test.tsx` / TC-COMP-013 and T010 | WEAK | Real sonner store with fake timers that advance with real time. Asserts focus never moves, 4000 ms default for success, persistence of error and warning past 6000 ms, polite region, no assertive region or `alert`, close button reachable by Tab and dismissing only its toast, `data-type` per wrapper, two type-level cases | Survivors: `shadow-lg` added (IR-002); error, warning and success accents, surface tokens and the `group` marker (IR-003). Noise: IR-009 |
| `progress.test.tsx` / TC-COMP-014 and T009 | WEAK | Real Radix Progress. Asserts name from the visible text, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `data-state`, `data-variant`, null total, the indicator transform for a non-100 maximum and the default maximum, track and indicator tokens, the hatch, the type-level label requirement. 4 catalogue and 5 hand-written behaviour mutants killed | Survivors: `rounded-full` (IR-002); `h-4` track (IR-003); indeterminate motion removed (IR-004) |
| `command.test.tsx` "command dialog labelled…" / TC-COMP-015 | WEAK | Real cmdk and Radix Dialog, with `ResizeObserver` and `scrollIntoView` stubbed per test. Asserts dialog name, width class, input focus, input name, caller placeholder, initial selection, wrap up and back, empty wording absent then shown, no options, Esc and opener focus. 5 hand-written behaviour mutants killed | Survivors: `max-h-80`, overlay `bg-black/80`, `shadow-lg`, `h-11`, `rounded-sm py-1.5` (IR-002); active-item and heading tokens (IR-003) |
| `command.test.tsx` "overlay family scan and packages" / TC-COMP-016 | ADEQUATE | Reads the five sources, runs an independent length regex (exactly one match, `command.tsx: 560px`), hex and colour-function regexes, five packages against an independent fixture with lock licences | None for the scan. The plan's planted `max-h-[300px]` fails it, naming the file. The "only five" half is the reviewer's `package.json` diff |
| `stepper.test.tsx` / T008 (no TC; Open Gap 6) | WEAK | Native DOM, no mocks. Asserts nav name and variant, one list of four, one `aria-current="step"`, link name and `href`, summary, no link on current and to-do, hidden suffixes, `aria-hidden` dots with inline size, check and numbers, Tab and Enter, href-only-on-done, href followed without `onSelect`, dot shape. 5 catalogue and 3 hand-written behaviour mutants killed | Survivors: focus ring width removed (IR-001); `ring-4` (IR-002); current ring, done dot, to-do outline, label weight and colour, step-number font, summary tokens (IR-003); `ol` to `ul`, `preventDefault` before `onSelect` (IR-004) |
| `token-literals.test.ts`, `vendoring.test.ts` (S1, unchanged) | ADEQUATE | Both scan the five new files and the new packages without edits (`git diff --exit-code`) | None |

The tests are deterministic and isolated. `toast.test.tsx` restores real timers and dismisses
sonner's module-global store after each test. `command.test.tsx` restores `scrollIntoView` and
re-stubs `ResizeObserver`, which `test-setup.ts` unstubs. Every test asserts rendered roles,
attributes, focus or classes, not mock setup. No Radix, cmdk or sonner module is mocked.

**Mutation run (E.9).**

1. `generate` over `4f168da..HEAD` produced 15 catalogue mutants: 8 `negate-boolean` and 7
   `off-by-one`.
2. The reviewer added 64 hand-written mutants over all five production files. Nine are the task
   plan's own list (Other Notes, *Hand-written mutants*); 55 are the reviewer's.
3. This is an initial review, so `scope` was not run.
4. `run` used 4 jobs. The command was `cd {workdir} && ln -sfn <component>/node_modules
   node_modules && npx vitest run components/ui components/token-literals && npx tsc --noEmit`.
   The `tsc` step kills the type-level mutants the plan routes to `tsc` (T009 (c), T010 (b)).

All four baselines were green, with 17 files and 159 tests. Every survivor's log shows the same
17 files and 159 tests passing, plus `tsc` passing. Result: 79 mutants, 48 killed, 31 survived.
The results are in `CAP-003-E1-S3-implementation-review-v1-mutation.json` beside this report
(sha256 `8d0aea7beed17739c5ac90ce57c1e12e47a902297bd15dbee19b94f121c3efb2`).

`stepper.tsx:manual:2` deleted `event.preventDefault();`. It was killed only by `tsc` (`TS6133:
'event' is declared but its value is never read`), with all 159 tests passing, so it is a
compile-level kill, not a test kill. `stepper.tsx:manual:15` makes the same change while keeping
`event` read (`event.stopPropagation();`), and it survives.

The plan's planted literal ran separately, because it tests the scan rather than the component
suites. Its results are not part of the carried mutation file.

| Mutant | State | Equivalence judgement |
|--------|-------|-----------------------|
| All 15 catalogue mutants: `dialog.tsx:42,51(×2),61,68,96`, `progress.tsx:32,47(×3)`, `stepper.tsx:69(×2),71,75,79` | killed | n/a |
| Plan list: `dialog.tsx:manual:1` (role), `:2` (pending guard), `:3` (opener refocus); `command.tsx:manual:1` (`loop`); `toast.tsx:manual:1` (error persistence), `:2` (warning calls error); `progress.tsx:manual:1` (null total), `:2` (`/ max`); `stepper.tsx:manual:1` (`aria-current` on done) | killed | n/a |
| `dialog.tsx:manual:4-13` (`aria-modal`, `data-variant`, `aria-busy={pending}`, `aria-disabled`, overlay `onClick`, `children`, Cancel label, footer order, unguarded confirm, `variant="secondary"`) | killed | n/a |
| `command.tsx:manual:2-5` (title text, `label`, opener refocus, `max-w-lg` width) | killed | n/a |
| `toast.tsx:manual:3-6` (`closeButton`, warning persistence, persistent success, `ExternalToast` options by `tsc`) | killed | n/a |
| `progress.tsx:manual:3-5` (`max` dropped, `value` while indeterminate, optional label by `tsc`) | killed | n/a |
| `stepper.tsx:manual:11,12` (link `aria-label` removed, hidden suffix removed) | killed | n/a |
| `stepper.tsx:manual:2` (`event.preventDefault();` deleted) | killed by `tsc` only | Not a test kill: see above and `stepper.tsx:manual:15` |
| `stepper.tsx:manual:3` (`focus-visible:ring` removed from the done link) | survived | Not equivalent. With `focus-visible:outline-none` kept, the link has no focus indicator. T016 fixes `focus-visible:outline-none focus-visible:ring focus-visible:ring-ring`; UX design 0.6: "Visible focus is never suppressed anywhere"; component design 10: focus `--ring` at `--focus-ring-width` (IR-001) |
| `dialog.tsx:manual:14` (`max-w-prose` to `max-w-lg`) | survived | Not equivalent. DEC-0305 fixes `max-w-prose` and names `max-w-lg` as the rejected shipped literal (32rem in Tailwind's default theme) (IR-002) |
| `dialog.tsx:manual:15` (overlay `bg-foreground/40` to `bg-black/80`) | survived | Not equivalent. The Phase 3 preamble names `bg-black/80` to `bg-foreground/40`; `black` is Tailwind's literal `#000` (IR-002) |
| `dialog.tsx:manual:16` (`rounded-lg` and `shadow-lg`) | survived | Not equivalent. The preamble maps `rounded-*` to `rounded` and removes `shadow-*`; both resolve to Tailwind-default literals (IR-002) |
| `command.tsx:manual:6` (`CommandList` `max-h-80`) | survived | Not equivalent. DEC-0305 fixes `max-h-[calc(var(--row-height)*10)]` and names `max-h-80` as a rejected literal-backed alternative (20rem) (IR-002) |
| `command.tsx:manual:9` (overlay `bg-black/80`) | survived | Not equivalent. UX design 1.1 and command spec section 6: overlay `--foreground` at 40% (IR-002) |
| `command.tsx:manual:10` (`shadow-lg` on the content) | survived | Not equivalent. The preamble removes `shadow-*` (IR-002) |
| `command.tsx:manual:11` (input `h-11`) | survived | Not equivalent. The preamble replaces `h-11` (2.75rem, a Tailwind-default key above 8) (IR-002) |
| `command.tsx:manual:12` (item `rounded-sm py-1.5`) | survived | Not equivalent. The preamble replaces `rounded-sm` and half steps such as `py-1.5` (IR-002) |
| `toast.tsx:manual:11` (`group-[.toaster]:shadow-lg`) | survived | Not equivalent. The preamble removes `shadow-*`; shadcn's sonner ships `shadow-lg` (IR-002) |
| `progress.tsx:manual:7` (track `rounded-full`) | survived | Not equivalent. `rounded-full` is Tailwind's literal `9999px`; the preamble maps radii to `rounded`. Visually alike at 8 px tall, but it reintroduces a literal AC-26 forbids (IR-002) |
| `stepper.tsx:manual:5` (current ring `ring-4`) | survived | Not equivalent. DEC-0305 fixes the ring width as `ring` (`--focus-ring-width`); `ring-4` is Tailwind's literal 4 px (IR-002) |
| `dialog.tsx:manual:17` (surface and body to `bg-background text-foreground`) | survived | Not equivalent. Dialog spec section 6: surface `--popover`, body text `--popover-foreground` (IR-003) |
| `command.tsx:manual:7` (active item `bg-muted text-foreground`) | survived | Not equivalent. Command spec section 6: active item `--accent` / `--accent-foreground` (IR-003) |
| `command.tsx:manual:8` (group heading loses `text-xs` and `text-muted-foreground`) | survived | Not equivalent. Command spec section 6 and UX design 1.1: headings `--muted-foreground` at `--text-xs` (IR-003) |
| `toast.tsx:manual:7` (error accent `--status-serious`) | survived | Not equivalent. Toast spec section 6 and UX design 0.6: error accent `--status-critical` (IR-003) |
| `toast.tsx:manual:8` (warning accent removed) | survived | Not equivalent. Toast spec section 6: warning accent `--status-warning` (IR-003) |
| `toast.tsx:manual:9` (success accent `--status-active`) | survived | Not equivalent. Toast spec section 6: success accent `--status-good` (IR-003) |
| `toast.tsx:manual:10` (surface `bg-background text-foreground`) | survived | Not equivalent. Toast spec section 6: surface `--popover` / `--popover-foreground` (IR-003) |
| `toast.tsx:manual:12` (`className="toaster"`, no `group`) | survived | Not equivalent. Every `group-[.toaster]:` class compiles to `.group.toaster .x` (built CSS), so the surface, text, border and radius tokens stop applying and sonner's own colours return (IR-003) |
| `progress.tsx:manual:6` (track `h-4`) | survived | Not equivalent. Progress spec section 3: track 6-8 px; `h-4` is `--space-4`, 16 px. T015 chose `h-2` for that reason (IR-003) |
| `stepper.tsx:manual:4` (current dot loses its ring) | survived | Not equivalent. Stepper spec section 3: current is an `--status-active` outline with a `--status-active-muted` ring (IR-003) |
| `stepper.tsx:manual:6` (done dot `bg-status-good`) | survived | Not equivalent. Stepper spec sections 3 and 6: done dot filled `--foreground` (IR-003) |
| `stepper.tsx:manual:7` (to-do dot loses its outline) | survived | Not equivalent. Stepper spec section 3: to-do dot outlined in `--border` (IR-003) |
| `stepper.tsx:manual:8` (current label not `font-semibold`) | survived | Not equivalent. Stepper spec section 3: current label weight 600 (IR-003) |
| `stepper.tsx:manual:9` (to-do label `text-foreground`) | survived | Not equivalent. Stepper spec section 3: to-do label `--muted-foreground` (IR-003) |
| `stepper.tsx:manual:10` (step number loses `font-numeric`) | survived | Not equivalent. Stepper spec section 6: step number `--font-numeric`; component design 10: `--font-numeric` for every count (IR-003) |
| `stepper.tsx:manual:13` (summary loses `text-xs text-muted-foreground`) | survived | Not equivalent. T016 fixes the summary at `text-xs text-muted-foreground`; component design 10: `--text-xs` for sub-lines (IR-003) |
| `progress.tsx:manual:8` (`motion-safe:animate-pulse` removed) | survived | Not equivalent. Progress spec section 4: `indeterminate` animates; Resolved Conflict 4 and T015 make the pulse its motion (IR-004) |
| `stepper.tsx:manual:14` (`ol` to `ul`) | survived | Not equivalent. Story Implementation: "a native `ol`"; component design 2.1: "bespoke, native `<ol>`"; stepper spec section 5: `<ol>` inside a `<nav>` (IR-004) |
| `stepper.tsx:manual:15` (`preventDefault` replaced by `stopPropagation`) | survived | Not equivalent. DEC-0304: a done link "whose click calls onSelect (preventDefault) when given". Without it the document navigates to `href` and drops setup's in-memory drafts (IR-004) |

Equivalent by artifact, not run: dropping `theme="light"` from `Toaster`. The plan's Other Notes
record it as equivalent, and sonner 2.0.8 defaults `theme = 'light'`
(`node_modules/sonner/dist/index.mjs`, the `Toaster` props).

## Independent Validation

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
`<component>` is `repos/factorflow-v2/FactorFlow-v2` under it. The npm and npx commands ran with
the component root as their working directory (`npm --prefix <component>`; `npx tsc -p
<component>/tsconfig.json`), as the tech stack's working directory `.` requires.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `READY — story is ready for independent review` (without `--base-ref`: `BLOCKED`; see Review Subject) |
| `python3 scripts/pipeline-state.py review-base --repo-dir <component> --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | PASS | `4f168da97da41a7f6a7e2587b51ea98c5c3f4389`, equal to the integration branch tip |
| `git merge-base --is-ancestor 4f168da9 HEAD` | component root | 0 | PASS | The review base is an ancestor of HEAD |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir <component> --base 4f168da9... --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings (six cycles) |
| `npx vitest run src/components/ui/{dialog,command,toast,progress,stepper}.test.tsx` | component root | 0 | PASS | Narrowest story suites first: 5 files, 33 tests |
| `npm ci` | component root | 0 | PASS | 306 packages. 10 audit advisories (vitest, vite, esbuild, tinypool, react-router, postcss-selector-parser, source-map-js), none in the five added packages. Run after the mutation run, because every mutation clone links this `node_modules`. The same lockfile also installed cleanly in a scratch copy first |
| `npm run test` | component root | 0 | PASS | 94 files, 2260 tests, before and again after `npm ci`. The base has 89 files and 2227 tests, so this story adds 5 files and 33 tests |
| `npm run lint` | component root | 0 | PASS | Biome: 212 files, no findings (before and after `npm ci`) |
| `npm run format` | component root | 0 | PASS | Biome: 212 files, no changes (before and after `npm ci`) |
| `npx tsc --noEmit` | component root | 0 | PASS | No output; the four `@ts-expect-error` cases type-check |
| `npm run build` | component root | 0 | PASS | 102 modules. Writes only ignored files under `src/factorflow/api/static/` |
| Built CSS `index-YG8ZF9nu.css` resolved for every class in the five files (reviewer script) | component root | 0 | PASS | Every class resolves; spacing to `--space-*`, `rounded` to `--radius`, `ring` to `--focus-ring-width`, colours to `hsl(var(--token))`, `max-w-prose` to `--measure-prose`, `max-h-[calc(var(--row-height)*10)]`. Literal-backed: `max-w-[560px]` (allowed), `h-px` and `border` 1 px (accepted hairlines), `underline-offset-4` 4 px (IR-008) |
| Planted `max-h-[300px]` in `CommandList`, run in a clone against `npm run test -- token-literals` and `npm run test -- command` | mutation clones | 1 | PASS | Both fail, naming `web/src/components/ui/command.tsx: 300px` (plan Story-Specific Validation, DAC-E1-S3-5) |
| `git diff 4f168da9..HEAD -- package.json` and `package-lock.json`; `node_modules/<pkg>/LICENSE*` for the five | component root | 0 | PASS | Exactly five `dependencies` lines added; `devDependencies` unchanged; five lock entries, each MIT; no new transitive package; all five `LICENSE` files MIT |
| `git diff --exit-code 4f168da9..HEAD -- tailwind.config.js design-system web/src/app web/src/api web/src/test-setup.ts web/src/components/token-literals.test.ts web/src/components/ui/vendoring.test.ts` | component root | 0 | PASS | T017: nothing protected changed |
| `rg -n -e 'bg-destructive' -e 'variant="destructive"' web/src/components/ui/dialog.tsx` | component root | 1 | PASS | No match (DAC-E1-15) |
| `rg -n -e '#[0-9a-fA-F]{3,8}\b' web/src/components/ui/{dialog,command,toast,progress,stepper}.tsx`; `rg -n dangerouslySetInnerHTML web/src/components/ui/` | component root | 1 | PASS | No match (AC-26; component design 4) |
| `npm --prefix <scratch>/base-clone run test` (review base `4f168da9`, `node_modules` linked) | scratch clone | 0 | PASS | 89 files, 2227 tests: the T001 baseline |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 4f168da9..HEAD --cycle review --out <scratch>/mutants.json` | harness root | 0 | N/A | 15 catalogue mutants; the reviewer appended 64 manual mutants |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 300 --work-root <scratch>/work --command '<focused suites + tsc>' --out <scratch>/results.json` | harness root | 3 | N/A | 48 killed, 31 survived; see the table above |
| `python3 scripts/pipeline-state.py code-revision --repo-dir <component>` | harness root | 0 | N/A | `sha256:3328e85cb0d696afb368f71a391b952b395aac486d3e3c431c6255c2bc2991ab`, the same before and after validation |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | N/A | `sha256:e9c3c5812cf977784a20014d40c152f11aeca809c0901a58fd3b65097b971250`, equal to the story approval's `reviewed_revision` |
| AC-25 manual check after `npm run build` | — | N/A | NOT RUN | The plan's Story-Specific Validation says "none required beyond the tests"; no screen renders the five components yet |
| `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | component root | N/A | NOT RUN | No Python file changed. Neither the story's validation list nor the plan's includes them |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The plan records that the story owns no integration or E2E case |

The Gate Summary counts 14 required validation entries, and all pass:

- the six tech-stack frontend commands: `npm ci`, test, lint, format, `tsc` and build;
- the TDD-evidence lint;
- seven story-specific checks: built CSS resolution, planted literal, package and licence diff,
  protected-path diff, the DAC-E1-15 grep, the AC-26 hex and raw-HTML grep, and the T001 baseline
  at the review base.

No command was refused by the sandbox, so none needed a retry outside it.

### Validation Side Effects

- **Before.** Branch `usr/alvaro-de-jodra/CAP-003-E1-S3-run-20261108T150357Z` at
  `f864d0ea8ba4d018bd038ac8e8573d158b38ac5f`. No staged, unstaged or untracked non-ignored files.
  Ignored `node_modules/` and build output under `src/factorflow/api/static/` were present.
- **After.** Same HEAD, still no staged, unstaged or untracked non-ignored files, and the same
  `code-revision` fingerprint.
  - `npm ci` reinstalled the ignored `node_modules/`.
  - `npm run test` and `npm run build` rewrote ignored files under `src/factorflow/api/static/`.
  - Mutants, the planted literal and the base run ran only in clones under the reviewer's
    scratch directory.
- **Unexpected tracked-file changes.** None.

## Findings

CRITICAL 0 · HIGH 4 · MEDIUM 2 · LOW 3 · **total 9**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | initial | The stepper done link's visible focus ring is unpinned |
| IR-002 | HIGH | initial | Eleven shipped Tailwind-default literals the plan replaces can be restored undetected |
| IR-003 | HIGH | initial | Sixteen design-system spec token and anatomy choices are unpinned |
| IR-004 | HIGH | initial | The stepper's `ol` and `preventDefault`, and the indeterminate motion, are unpinned |
| IR-005 | MEDIUM | initial | `CommandInput` suppresses its focus outline with no replacement |
| IR-006 | MEDIUM | initial | The toast dismiss control is 20 px, below the toast spec's 24 px minimum |
| IR-007 | LOW | initial | Two plan deviations are recorded only in code or not at all |
| IR-008 | LOW | initial | `underline-offset-4` resolves to a Tailwind-default 4 px literal |
| IR-009 | LOW | initial | The new suites print React `act()` warnings and a jsdom navigation error |

### IR-001 — The stepper done link's visible focus ring is unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-25, DAC-E1-14
- **Tasks**: T008, T016
- **Files**: `web/src/components/ui/stepper.tsx:79`; `web/src/components/ui/stepper.test.tsx:105-114`
- **Claim challenged**: T008 and the test "pins the dot shape and the link's focus ring to tokens"
  claim the link's focus ring is pinned.
- **Observed evidence**: The test asserts only `link.className` contains `focus-visible:ring-ring`,
  the ring colour. Mutant `stepper.tsx:manual:3` deletes `focus-visible:ring`, the width, and
  keeps `focus-visible:outline-none`. All 159 focused tests and `tsc` pass, yet the link then has
  no focus indicator at all.
- **Expected evidence/behavior**: T016 fixes `focus-visible:outline-none focus-visible:ring
  focus-visible:ring-ring`. UX design 0.6: "Visible focus is never suppressed anywhere."
  Component design 10: focus `--ring` at `--focus-ring-width`. Stepper spec section 4: `Tab`
  focuses each done step's link.
- **Impact**: The done link is the stepper's only tab stop. A regression that hides its focus
  would pass the suite, and a keyboard user would lose their place in setup.
- **Required remediation**: Pin the ring width as well as its colour, so that a mutant removing
  `focus-visible:ring` (or the colour) fails a test.

### IR-002 — Eleven shipped Tailwind-default literals the plan replaces can be restored undetected

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-26 (and DAC-E1-12, which DAC-E1-S3-5 traces to)
- **Tasks**: T002, T003, T005, T007, T008, T009 (tests); T012 to T016 (the classes they fix)
- **Files**: `dialog.tsx:60,69`; `command.tsx:54,57,90,106,169`; `toast.tsx:26`; `progress.tsx:39`;
  `stepper.tsx:37`; their test files
- **Claim challenged**: The Phase 3 preamble claims "every class that resolves to a Tailwind default
  literal [is] replaced by a token-backed class", and the tests claim to pin each component's
  token contract.
- **Observed evidence**: Eleven survivors restore exactly what the preamble, Resolved Conflict 5 and
  DEC-0305 name as removed. In `dialog.tsx`: `max-w-lg` (`:manual:14`), `bg-black/80`
  (`:manual:15`), `rounded-lg` and `shadow-lg` (`:manual:16`). In `command.tsx`: `max-h-80`
  (`:manual:6`), overlay `bg-black/80` (`:manual:9`), `shadow-lg` (`:manual:10`), input `h-11`
  (`:manual:11`), item `rounded-sm py-1.5` (`:manual:12`). Also `toast.tsx:manual:11`
  (`shadow-lg`), `progress.tsx:manual:7` (`rounded-full`) and `stepper.tsx:manual:5` (`ring-4`).
  Each resolves to a literal in Tailwind's default theme (for example `max-w-lg` 32rem, `max-h-80`
  20rem, `ring-4` 4 px, `rounded-full` 9999px, `black` `#000`), which no unit-joined regex can see.
  So TC-COMP-016 and `token-literals.test.ts` pass, and no component test asserts the class.
- **Expected evidence/behavior**: AC-26 and component design 3: no spacing, size or colour literal
  outside the theme. The preamble names each replacement. DEC-0305 fixes `max-w-prose`,
  `max-h-[calc(var(--row-height)*10)]` and `ring`, and rejects `max-w-lg` and `max-h-80`.
- **Impact**: AC-26 is enforced in this layer by tests, not by review (system design constraint
  13). A re-vendor or copy-paste from shadcn/ui that brings any of these back would pass the gate
  and bypass the theme.
- **Required remediation**: Make each listed survivor fail a test, for example by asserting the
  token-backed class and the absence of the shipped one, as CAP-003-E1-S2's rework did.

### IR-003 — Sixteen design-system spec token and anatomy choices are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T002, T003, T005, T008, T009 (tests); T012 to T016
- **Files**: `dialog.tsx:69`; `command.tsx:71,169`; `toast.tsx:22-31`; `progress.tsx:39`;
  `stepper.tsx:35-45,69,97`; their test files
- **Claim challenged**: The plan's tasks fix each component's tokens from its design-system spec
  (T012 to T016 cite those sections), and the tests claim to pin them.
- **Observed evidence**: Sixteen survivors swap a token or anatomy value the spec names:
  - `dialog.tsx:manual:17`: surface and body to `bg-background text-foreground` (dialog spec 6:
    `--popover`, `--popover-foreground`).
  - `command.tsx:manual:7`: active item to `bg-muted text-foreground` (command spec 6:
    `--accent`, `--accent-foreground`).
  - `command.tsx:manual:8`: headings lose `text-xs` and `text-muted-foreground` (command spec 6;
    UX design 1.1).
  - `toast.tsx:manual:7`, `:8`, `:9`: the error accent becomes `--status-serious`, the warning
    accent is removed, the success accent becomes `--status-active` (toast spec 6; UX design 0.6).
  - `toast.tsx:manual:10`: surface to `bg-background text-foreground` (toast spec 6: `--popover`).
  - `toast.tsx:manual:12`: `toaster group` loses `group`. Every `group-[.toaster]:` class
    compiles to `.group.toaster .x` in the built CSS, so all four surface tokens stop applying.
  - `progress.tsx:manual:6`: the track becomes `h-4`, 16 px (progress spec 3: 6-8 px).
  - `stepper.tsx:manual:4`, `:6`, `:7`: the current ring is removed, the done dot becomes
    `bg-status-good`, the to-do outline is removed (stepper spec 3 and 6).
  - `stepper.tsx:manual:8`, `:9`: the current label loses weight 600, the to-do label becomes
    `text-foreground` (stepper spec 3).
  - `stepper.tsx:manual:10`: the step number loses `font-numeric` (stepper spec 6; component
    design 10).
  - `stepper.tsx:manual:13`: the summary loses `text-xs text-muted-foreground` (T016; component
    design 10).
- **Expected evidence/behavior**: Component design 3: "Every variant used is one its spec
  defines". Each spec's section 3 or 6 names the value; T012 to T016 fix the classes.
- **Impact**: The toast accents carry the outcome's tier next to its wording (UX design 0.6). The
  stepper's dots and label weights carry done, current and to do to sighted users (STD-UI-26). A
  regression on any of them passes the suite.
- **Required remediation**: Make each listed survivor fail a test. The `group` marker needs an
  assertion that the toaster element carries both `toaster` and `group`.

### IR-004 — The stepper's `ol` and `preventDefault`, and the indeterminate motion, are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-25, DAC-E1-14 (stepper half), DAC-E1-S3-3 (indeterminate rendering)
- **Tasks**: T008, T009 (tests); T015, T016
- **Files**: `stepper.tsx:58,80-85`; `progress.tsx:43`; `stepper.test.tsx:62-71`;
  `progress.test.tsx:89-100`
- **Claim challenged**: T008 claims the stepper contract is tested, and DEC-0304 claims a done link
  with `onSelect` prevents navigation. T009 claims the indeterminate rendering is tested.
- **Observed evidence**:
  - `stepper.tsx:manual:15` replaces `event.preventDefault();` with `event.stopPropagation();`
    and survives. The Enter test asserts only that `onSelect` was called once, not that the click
    was default-prevented. The sibling deletion (`:manual:2`) was killed only by `tsc`'s unused
    parameter, not by any test.
  - `stepper.tsx:manual:14` renders the list as `ul` and survives. `getByRole("list")` matches
    both elements.
  - `progress.tsx:manual:8` removes `motion-safe:animate-pulse` and survives. The test checks only
    `bg-pattern-indeterminate`.
- **Expected evidence/behavior**: DEC-0304: a done step "renders `<a href>` whose click calls
  onSelect (preventDefault) when given". Story Implementation and component design 2.1: "a native
  `ol`". Stepper spec 5: `<ol>` inside a `<nav>`. Progress spec 4: `indeterminate` animates;
  Resolved Conflict 4 and T015 make `motion-safe:animate-pulse` that motion.
- **Impact**: Without `preventDefault` the browser follows `href` as well as calling `onSelect`.
  Setup's step drafts live only in React memory (DEC-0202, AC-3), so they would be lost on every
  revisit of a done step, and no test would notice. Without the `ol`, the stepper is no longer an
  ordered list. Without the motion, a running download with an unknown total looks frozen when
  motion is allowed.
- **Required remediation**: Assert that the activating click is default-prevented when `onSelect`
  is given. Assert that the list is an `ol`. Assert the indeterminate indicator's motion class.

### IR-005 — `CommandInput` suppresses its focus outline with no replacement

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-25 (supporting)
- **Tasks**: T013
- **Files**: `web/src/components/ui/command.tsx:90`
- **Claim challenged**: T013 prescribes `outline-none` on the palette input, as shadcn/ui ships it.
- **Observed evidence**: The input's classes are `flex w-full bg-transparent py-3 text-base
  outline-none placeholder:text-muted-foreground`, and its wrapper adds no `focus-within`
  indicator. When the palette opens, focus is in a field whose only cue is the caret.
- **Expected evidence/behavior**: UX design 0.6: "Visible focus is never suppressed anywhere."
  Component design 10: focus `--ring` at `--focus-ring-width`. The plan and the UX design disagree
  here, and the plan records no resolution.
- **Impact**: Low in practice, because the modal palette always holds focus in this input. But it
  is the one control in this story that removes the browser's indicator without a token-backed
  replacement.
- **Required remediation**: Either give the input (or its wrapper) a token-backed focus indicator,
  or record why the caret suffices in the plan's Resolved Conflicts and in a decision.

### IR-006 — The toast dismiss control is 20 px, below the toast spec's 24 px minimum

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S3-2 (supporting)
- **Tasks**: T014
- **Files**: `web/src/components/ui/toast.tsx:18-36`; `node_modules/sonner/dist/index.mjs`
  (`[data-close-button]{…height:20px;width:20px…}`)
- **Claim challenged**: T014's doc comment cites toast spec sections 4-5 as implemented.
- **Observed evidence**: `Toaster` passes no `closeButton` class, so sonner draws its default
  20 x 20 px close button.
- **Expected evidence/behavior**: Toast spec section 5: "dismiss control at least 24×24 CSS
  pixels." Component design 6 rules out restyling at a call site, so only this component can meet
  it.
- **Impact**: Under DAC-E1-S3-2, `error` and `warning` toasts persist until dismissed, so this
  control is the only way to clear them, and it is below the spec's minimum target.
- **Required remediation**: Give the close button a token-backed size of at least 24 px (for
  example `--space-5`, which is 24 px) through `toastOptions.classNames.closeButton`, and pin it.
  Or record the departure from spec section 5 in a decision.

### IR-007 — Two plan deviations are recorded only in code or not at all

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T016, T019
- **Files**: `stepper.tsx:7-11,76-78`; `CAP-003-E1-S3-tdd-evidence.yaml` (cycle-1);
  `CAP-003-E1-S3-evidence/red-cycle-1-packages.log`
- **Claim challenged**: T016 and DEC-0304 call for a visually hidden suffix span on each title, and
  T011 depends on T006's package assertion being written first.
- **Observed evidence**:
  - The done link names its state through `aria-label` instead of the hidden span. The reason is
    sound: the reviewer confirmed that jsdom's name computation gives `"Market data , done"` for
    the span form. But the deviation is recorded only in the doc comment. The plan is ticked as
    written, and the evidence's cycle-6 description says only "state in text".
  - Cycle 1's RED and GREEN come from a script that is neither in the repository nor in the
    evidence. T006's assertion, which the plan orders first, was first staged in cycle 3.
- **Expected evidence/behavior**: Skill C.4: plan deviations are recorded. The evidence should let
  a reader rerun each RED.
- **Impact**: None on behaviour. The aria-label form meets DEC-0304's outcome, and the accessible
  name starts with the visible title (WCAG 2.5.3). A reader of the plan or the decision would
  still expect a span.
- **Required remediation**: Record both deviations in the evidence (and, for the stepper, flag
  DEC-0304's wording for its follow-up).

### IR-008 — `underline-offset-4` resolves to a Tailwind-default 4 px literal

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-26
- **Tasks**: T016
- **Files**: `web/src/components/ui/stepper.tsx:79`; built CSS
  `.underline-offset-4{text-underline-offset:4px}`
- **Claim challenged**: The Phase 3 preamble replaces every class that resolves to a Tailwind
  default literal.
- **Observed evidence**: T016 itself prescribes `underline-offset-4`, which resolves to 4 px from
  Tailwind's default theme, not a token. The plan is inconsistent with itself, and the coder
  followed the task.
- **Expected evidence/behavior**: AC-26 and component design 3: no size literal outside the theme.
  The accepted 1 px hairlines (`h-px`, `border`) are a precedent the plan names; this one is not
  named.
- **Impact**: Negligible visually. It is a literal that the scan cannot see.
- **Required remediation**: Either use a token-backed offset or record the offset as accepted
  alongside the hairlines (plan or DEC-0305 follow-up).

### IR-009 — The new suites print React `act()` warnings and a jsdom navigation error

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T003, T008, T010
- **Files**: `web/src/components/ui/toast.test.tsx:41-66,68-95,99-107`;
  `web/src/components/ui/stepper.test.tsx:88-103`
- **Claim challenged**: The new tests are clean.
- **Observed evidence**:
  - Every `toast.test.tsx` run prints about 25 "An update to ForwardRef(Toaster) inside a test
    was not wrapped in act(...)" warnings.
  - The stepper test "follows the href when no onSelect is given" prints jsdom's "Error: Not
    implemented: navigation (except hash changes)".
  - `toast.test.tsx:64-65` asserts `expect(user).toBeDefined()` only to use a variable.
- **Expected evidence/behavior**: `web/src/test-setup.ts` states the suite's rule: noise "hides a
  real failure rather than reporting one".
- **Impact**: None on correctness. It makes real warnings in these files harder to see.
- **Required remediation**: Flush sonner's timer-driven updates inside `act`. Stop the navigation
  after observing `defaultPrevented` (for example with a capturing listener that prevents it after
  recording). Drop the placeholder assertion.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T006 staged with cycle 3, not cycle 6.** Staging is per file, and T005 and T006 share
  `command.test.tsx`. The evidence's cycle-3 description records this. Justified.
- **T017 and T018 joined cycle 6**, as T019 plans. Justified.
- **Stepper done link `aria-label`** instead of a hidden span (IR-007). Justified technically, not
  recorded in the plan or evidence.
- **Cycle 1 RED by an unpersisted script** (IR-007). The plan's own ordering (T011 after T006)
  conflicts with its cycle list (T006 in cycle 6).
- **`CommandInput` `outline-none`** follows T013 but conflicts with UX design 0.6 (IR-005).
- **`underline-offset-4`** follows T016 but conflicts with the Phase 3 preamble (IR-008).
- **DEC-0305** (`max-w-prose`, the `CommandList` height and the stepper ring width) is still `open`,
  awaiting owner review. The implementation follows it as written. Its owner review is outside
  this gate, but its values are among the unpinned survivors (IR-002), so a later owner change
  would also go untested.
- **Bookkeeping.** The story moved from `planning` to `in-review` and all 19 tasks are ticked. Each
  tick has implementation evidence. No unchecked task appears implemented.
- **Out-of-scope changes.** None. No dependency beyond the five, no configuration or protected
  file changed.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, rework mode).
- **Required action**: Resolve IR-001 to IR-004 so that every survivor listed in this report's
  mutation table fails a test. Run them again with
  `CAP-003-E1-S3-implementation-review-v1-mutation.json`, which the next review passes to
  `mutation-run.py scope --previous`. Address IR-005 and IR-006 by a fix or a recorded decision.
  IR-007 to IR-009 are optional. Then set the task plan's `last_reworked_review` to this report
  and rerun `$adversarial-review`.
- **Warnings accepted downstream**: N/A
