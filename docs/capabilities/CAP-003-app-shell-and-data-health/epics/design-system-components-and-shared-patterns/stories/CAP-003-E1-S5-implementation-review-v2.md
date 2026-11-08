---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S5-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S5"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T22:23:29Z"
reviewed_head: "8dc15777006221f44ef21b73a5e0e76e83766623"
review_base: "f0b8e010429b144350e710c34f71a06d652bd003"
reviewed_state_revision: "sha256:e916e595c90d5cff60de2d0f61765a494ad7b98bc75029f5f41d8c8bee9fa87c"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E1-S5
    artifact_version: 1
    content_revision: sha256:aae6f1fbd086bbc691039d932007a8edff160f2943d11bbf68a3fd28e3eb4b82
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T22:23:29Z
  source_artifacts:
    - id: CAP-003-E1-S5
      version: "1 (sha256:aae6f1fbd086bbc691039d932007a8edff160f2943d11bbf68a3fd28e3eb4b82)"
    - id: CAP-003-E1-S5-tasks
      version: "1 (draft, updated 2026-11-08, last_reworked_review v1)"
    - id: CAP-003-E1-S5-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-003-E1-S5-implementation-review
      version: "1 (baseline, CHANGES-REQUIRED, reviewed_head 43b4278)"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1 (draft)"
    - id: CAP-003-coverage-matrix
      version: "1 (draft)"
    - id: ui-conventions
      version: "6"
    - id: DEC-0203
      version: "applied"
    - id: DEC-0308
      version: "applied (provisional)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S5 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 13/13 passed |

This is a re-review. Its baseline is v1 (`CHANGES-REQUIRED`, `reviewed_head` `43b4278`). Scope
comes from `git diff 43b4278..HEAD` and `mutation-run.py scope --previous v1-mutation.json`.

The rework, commit `8dc1577`, is test-only. It changes the two test files, adds the cycle-3 TDD
evidence, makes the cycle-1 and cycle-2 `results:` paths harness-relative, and sets the plan's
`last_reworked_review`. `tiers.ts` and `status-badge.tsx` are byte-identical to v1's subject
(`git diff --exit-code 43b4278..HEAD -- <both files>` exit 0).

Every blocking finding of v1 is resolved:

- **v1 IR-001 (HIGH).** TC-COMP-020 now plants a value in the download state, the result outcome,
  the check status, the check name and the item kind. Each of the 8 nested `never` defaults v1
  replaced with a literal is now killed, by exactly the new test for its union.
- **v1 IR-002 (HIGH).** The badge tests now pin each tier's drawn shape (tag, geometry, effective
  fill). The distinctness test uses that shape, and a new test asserts an untitled badge has no
  `title`. `active-filled`, `good-radius-zero`, `good-outside-viewbox` and
  `title-defaults-to-label` are all killed.
- **v1 IR-003 (MEDIUM).** The evidence cites its mutation results by harness-relative paths. The
  TDD lint passes.

The reviewer reran all 86 v1 mutants plus 6 of its own: 92 in all, 86 killed, 6 survived. Every
kill traces to a story test or `tsc`, never to a load-flaky delivered suite alone. The two carried
survivors are v1's equivalent `present !== false` mutants. The four new survivors are `late`.
`mutation-run.py scope` tagged them so, because they mutate production lines unchanged since v1.
They therefore cannot block or make a test `WEAK`. All 13 required validation checks pass,
including two full-suite runs (97 files, 2461 tests) before and after `npm ci`.

No finding blocks. Three remain:

- **IR-001 (MEDIUM, late).** The shape fixture records fill but not stroke. Neutral and active
  are drawn by stroke alone, so a neutral or active icon with no stroke passes every test.
- **IR-002 (MEDIUM, late).** Nothing pins the credential `present` field as required. A
  `present?: boolean` widening passes every test and `tsc`.
- **IR-003 (LOW, carried).** v1 IR-004 is still open: plan deviations appear only in the TDD
  evidence. The rework adds two more of the same kind.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5-tasks.md` (`last_reworked_review: CAP-003-E1-S5-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S5-run-20261108T150357Z` |
| HEAD | `8dc15777006221f44ef21b73a5e0e76e83766623` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z`, the driver's integration branch passed as `--base-ref`. `pipeline-state.py review-base` resolves it to `f0b8e010429b144350e710c34f71a06d652bd003`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before validation, after validation and after the mutation run (`git status --porcelain=v1 --untracked-files=all` prints nothing). The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 101 against the review base (98 added, 3 modified) in three commits (`43b4278`, `92bcba7`, `8dc1577`); 8 since the baseline (4 added, 4 modified) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `43b4278603833c94f6a355f23efaca6252f7082a`, with `CAP-003-E1-S5-implementation-review-v1-mutation.json` |

`pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — review changes were
reworked; a new review version is required`, and `--stage story-coding` reports `COMPLETE`.
Without `--base-ref`, the check resolves against the remote default branch and reports
`BLOCKED — story coding has not reached in-review`, as v1 recorded. Skill A.2 requires the
driver's integration branch, so the reviewer used that base.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/tiers.ts` | added (207 lines; unchanged since v1) | AC-19, AC-20, AC-12, DAC-E1-1, DAC-E1-S5-1; T006 |
| `web/src/components/patterns/tiers.test.ts` | added (286 lines; +55/-4 since v1) | TC-COMP-020, TC-COMP-021; T002, T003; v1 IR-001 |
| `web/src/components/patterns/status-badge.tsx` | modified (rewritten in place; unchanged since v1) | DAC-E1-2, AC-20; T007; plan Resolved Conflict 3 |
| `web/src/components/patterns/status-badge.test.tsx` | added (199 lines; +57/-5 since v1) | TC-COMP-022; T004, T005; v1 IR-002 |
| `.../stories/CAP-003-E1-S5.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S5-tasks.md` | modified (T001-T010 ticked; since v1 only `updated` and `last_reworked_review`) | bookkeeping |
| `.../stories/CAP-003-E1-S5-tdd-evidence.yaml` | added (three cycles; since v1 cycle 3 and two path fixes) | T010; v1 IR-003 |
| `.../stories/CAP-003-E1-S5-evidence/cycle-{1,2,3}.patch` | added | T010 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S5-evidence/red-cycle-1-2-tiers-and-badge.log`, `red-cycle-3-review-survivors.log` | added | T010 (`red_log`) |
| `.../stories/CAP-003-E1-S5-evidence/mutants-cycle-{1,2}.json`, `mutation-cycle-{1,2}-results.json` and `-logs/*.log` (87 files) | added | T010 (`mutation:`) |
| `.../stories/CAP-003-E1-S5-implementation-review-v1.md` and `-v1-mutation.json` | added | the baseline review |

No source file other than the four above changed. `git diff --exit-code f0b8e01..HEAD --
web/src/screens web/src/app web/src/api package.json package-lock.json tailwind.config.js
tsconfig.json vite.config.ts vitest.config.ts design-system` exits 0. So no CAP-002 caller, screen,
shell file, manifest or `web/src/api/types.ts` was edited (T008). The rework commit carries no
`Decision-Id` trailer and rests on no decision.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-19 | SATISFIED | `tiers.ts:122-207` `labelOf` returns only display labels. Download outcomes match STD-UI-1's labels: *Complete* / *Partial* / *Failed* / *Cancelled by you* / *Interrupted*. `StatusBadge` renders `children` as its only text (`status-badge.tsx:50-57`) | `tiers.test.ts:274-277` (29 rows by label); `status-badge.test.tsx:72-83` (the name is exactly the label) | Every carried label swap is killed, including the domain-term swaps *Complete* to *Succeeded* and *Interrupted* to *Abandoned* |
| AC-20 | SATISFIED | `tiers.ts:42-120` maps each status to one `Tier`. `status-badge.tsx:31-57` renders the label plus an `aria-hidden` shape on `Badge variant={status-${tier}}` | `tiers.test.ts:268-286`; `status-badge.test.tsx:70-199` | IR-001 notes a late gap in pinning the stroked shapes |
| AC-12 | SATISFIED | `tiers.ts:54-55` `partial` warning; `:60-61` `abandoned` serious | `tiers.test.ts:185,188` fixture rows; `:279-281` partial never good | The `partial`-to-good and `abandoned`-to-warning mutants are killed |
| DAC-E1-1 | SATISFIED | Every row of the epic's enumeration and of UX brief §12.2: download `:45-64`, result `:66-73`, scores `:75-88`, check `:90-97` (DEC-0308), credential `:99`, item `:101-116` (DEC-0203), and the labels at `:125-203` | `tiers.test.ts:180-266` independent literal fixtures, `it.each` at `:274-277`; guards at `:279-285` | The reviewer re-read §12.2 (`ux-brief.md:753-793`) row by row against `tiers.ts`. Check `not_current` has no row (plan Resolved Conflict 1). `not_determinable` is rejected at the type level (`tiers.test.ts:160-177`) |
| DAC-E1-2 | SATISFIED | `status-badge.tsx:21-38`: neutral `Circle` (hollow), active `CircleDot`, good a one-circle `Icon` with fill, warning `Triangle`, serious `Diamond` and critical `Square` filled. Each has `aria-hidden="true" focusable="false"`. `Badge` comes from `../ui/badge` (`:52`) | `status-badge.test.tsx:72-159` (`SHAPE` fixture `:57-68`), `:163-168` | The rendered shapes are right. IR-001: the tests would not notice neutral or active losing its stroke |
| DAC-E1-S5-1 | SATISFIED | All 13 `switch`es end `default: return assertNever(...)` (`tiers.ts:63,72,87,96,115,118,143,152,167,178,183,202,205`), and `assertNever(value: never)` is at `:38` | `tiers.test.ts:108-178`: a new kind (`:118-126`), scores state (`:128-136`), and download state, result outcome, check status, check name and item kind (`:141-158`) | All 13 default-to-literal mutants are killed, 8 of them by the rework's `it.each`. The planted kind, item kind, result outcome and check name (T009) are killed too |
| DAC-E1-S5-2 | SATISFIED | n/a (test criterion) | `tiers.test.ts:180-286`: 29 rows by input, label and tier. Check `ok` is labelled per check (`:229-238`). Credential *Found* / *Missing* (`:249-250`) | Every row and label mutant is killed |
| DAC-E1-S5-3 | SATISFIED | n/a (test criterion) | `status-badge.test.tsx:72-83` (name, `aria-hidden`); `:135-142` (each tier's drawn shape against `SHAPE`); `:144-148` (active ring unfilled); `:150-159` (six distinct drawn shapes) | Was `PARTIAL` in v1. Distinctness now compares tag, geometry and effective fill, so a filled active ring, which draws good's disc, fails it. IR-001 (late) leaves stroke out of that comparison |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At HEAD, `web/src/components/ui/badge.tsx:17-22` defines the six `status-<tier>` variants, `web/src/components/ui/utils.ts` exists, and `package.json:28` has `lucide-react` `^1.70.0` (installed 1.70.0). The plan's `grep -nE` finds all six lucide exports in `lucide-react.d.ts` | Cycle-1 records the baseline: 95 files, 2381 tests. The current 97 files and 2461 tests add this story's 2 files and 80 tests |
| T002 | complete | VERIFIED | `tiers.test.ts:15-178`: compiler-API harness with the real `tsconfig.json` and `types: []`. Plants are made by AST (`plant`, `memberType`, `statusUnion`, `scoresStateUnion`, `needsYouKindUnion`). Seven plant cases, the clean case, a 30 s timeout and the two `@ts-expect-error` guards | The rework widens `plant` to any `TypeNode`, so `RunState` can be extended by reference. `memberType` throws when its member is missing, so a renamed field fails loudly rather than passing vacuously. The plan names two plants; seven exist (IR-003) |
| T003 | complete | VERIFIED | `tiers.test.ts:180-286`: `Record<RunState,…>`, `Record<"not_found"\|"failed",…>`, scores and `Record<NeedsYouKind,…>` fixtures. Four check rows, two credential rows, explicit `failed: false` and `failed: true` item rows (29), and two named guards | Unchanged since v1. The plan still says 28 rows (IR-003) |
| T004 | complete | VERIFIED | `status-badge.test.tsx:70-160`: link-name query, one `svg` with `aria-hidden` and `focusable`, per-tier tag and class checks, and each tier's drawn shape against `SHAPE` via `shapeOf`. Active's svg `fill="none"` is checked, and the six drawn shapes are pairwise distinct | The planned distinctness signature (`fill` plus `innerHTML`) is replaced by `shapeOf`, as v1 IR-002 asked. The plan text is not updated (IR-003). `shapeOf` omits stroke (IR-001) |
| T005 | complete | VERIFIED | `status-badge.test.tsx:162-199`: (a) variant and token classes per tier; (b) `title` and `className` forwarded, and no `title` when none is passed (`:182-186`); (c) no tab stop and no role; (d) no import from `screens` | `title-defaults-to-label` is now killed |
| T006 | complete | VERIFIED | `tiers.ts:1-207` exports `Tier`, `NeedsYouKind`, `Status` (with DEC-0308's `check` field), `tierOf` and `labelOf`. `RunState` is a type-only import. Nested `switch`es end in `assertNever` and booleans use conditionals. The module doc comment has no unit literal or hex | Unchanged since v1; `token-literals.test.ts` passes over it. IR-002: the `present: boolean` type is not pinned by a test |
| T007 | complete | VERIFIED | `status-badge.tsx:1-57`: `StatusTier = Tier` kept, `TIER_ICON: Record<Tier, JSX.Element>` with the planned icons and props, the `FILLED_CIRCLE` one-circle `iconNode`, and `Badge variant={status-${tier}} title className`. No `TIER_CLASSES` or `screens/` import (`grep -n "screens/"` exit 1) | Unchanged since v1. The explicit `aria-hidden` is redundant with lucide 1.70's own (cycle-2 equivalent survivor) |
| T008 | complete | VERIFIED | The reviewer ran the plan's ten delivered files (as-of-line, not-current-banner, results-pane, research, set-history-dialog, factor-card, history-tab, token-literals, badge, render): 10 files, 312 tests passed. `git diff --stat f0b8e01..HEAD -- . ':!docs'` lists only the four planned files | Unchanged callers compile against the widened `Tier` and `StatusTier` |
| T009 | complete | VERIFIED | The reviewer reran lint, format, `tsc` and build before and after `npm ci`, all exit 0. The manual plant ran as carried mutant `t009-planted-kind`: killed by TC-COMP-020 | Matches plan |
| T010 | complete | VERIFIED | `CAP-003-E1-S5-tdd-evidence.yaml`: three cycles, all `APPROVED`, no drift, `commit_hash: stage`, `diff_sha256` and `reviewed_patch`, `red_log_sha256`. Cycles 1 and 2 have `mutation:` blocks; cycle 3 has `mutation: {not_applicable: …}`. The reviewer's `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings. `cycle-3.patch` hashes to its `diff_sha256` and has the same `+`/`-` lines as `git diff 43b4278..HEAD -- web/` | Cycle 3 changes tests only, which plan T010 allows to record `not_applicable`. Its RED log lists v1's 12 survivors, each failing a named new test, and the reviewer's run reproduces each (Mutation run) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `Status exhaustiveness (TC-COMP-020, DAC-E1-S5-1)` (`tiers.test.ts:108-178`) / TC-COMP-020 | ADEQUATE | A real compiler program over the repo `tsconfig.json`. AST plants change the source (`not.toBe(source)`). Diagnostics must fall inside each function that switches on the planted union; for check name, that is `labelOf` only, per DEC-0308. The unspliced source type-checks clean. `@ts-expect-error` plus `toThrow` reject `not_determinable` and `not_current`. All 13 default-to-literal mutants, `assertNever(value: unknown)`, a silent `assertNever` and the four planted members are killed | None |
| `Tier table (TC-COMP-021, DAC-E1-1)` (`tiers.test.ts:180-286`) / TC-COMP-021 | ADEQUATE | Independent literal fixtures, typed so a missing kind or state fails `tsc`. 29 rows assert tier and label from production. `partial` and `cancelled` guards. All 46 tier and label swaps, the 4 branch swaps and the `failed`-undefined mutant are killed | IR-002 (late): `present` could become optional and the credential rows would still pass |
| `StatusBadge words and shapes (TC-COMP-022, DAC-E1-S5-3)` (`status-badge.test.tsx:70-160`) / TC-COMP-022 | ADEQUATE | Accessible name equals the label. One `svg` with `aria-hidden` and `focusable="false"`. Each tier's drawn shape (tag, `cx`/`cy`/`r`/`d`/`x`/`y`/`width`/`height`, own-or-inherited fill) equals an independent fixture. The six drawn shapes are distinct. Active's svg fill is `none`. It also checks sizes and icon-before-label. It kills icon swaps, fill changes on neutral, active and good, good's geometry, the tier-fixed icon, `aria-hidden="false"` and `focusable="true"` | IR-001 (late): stroke is not part of the drawn shape, so `stroke="none"` or `strokeWidth: 0` on the stroked tiers survives. A late survivor does not make this test `WEAK` (skill H) |
| `StatusBadge composition (DAC-E1-2)` (`status-badge.test.tsx:162-199`) / T005 | ADEQUATE | Variant and token classes per tier. `title` and `className` are forwarded alongside the tier classes, and no `title` appears without one. Not a tab stop, no role, no `screens` import. Kills the serious-to-critical variant and `title ?? children` | None |
| Delivered CAP-002 tests and scans (T008 list, 312 tests) | ADEQUATE | Run unedited. They also kill the tier-fixed icon, `aria-hidden="false"`, critical-triangle and good-fill-none mutants through `as-of-line.test.tsx` and `not-current-banner.test.tsx` | None for this story |

Isolation and determinism: Vitest `globals: true` gives Testing Library its automatic cleanup, and
the distinctness test also unmounts each render. TC-COMP-020 now builds eight compiler programs,
one per test. There were 99 runs of `tiers.test.ts`: the story run, two full suites, four mutation
baselines and 92 mutant runs. Under load averages of 36-360, the whole file took 1.3-21.9 s
(median 5.8 s). The slowest single test took 6.2 s against its 30 s timeout, and no log records a
timeout. There are no timers, no network and no storage.

One delivered CAP-002 test this story does not change failed under load: `research.test.tsx`
TC-COMP-145 could not find `[data-testid="as-of-line"]` on one of four mutation baselines (load
average 215-354). The other three baselines passed, and the immediate rerun's four baselines all
passed. Both full suites passed too. v1 saw the same flakiness in `results-pane.test.tsx`.

### Mutation run (reviewer, `review` cycle)

`mutation-run.py generate --range f0b8e01..HEAD` writes 0 mutants: the catalogue still has no
TypeScript operators. The reviewer added 6 `manual` mutants of its own (`make_mutants.py` in the
reviewer scratchpad):

- `v2-credential-present-optional`: `present: boolean` to `present?: boolean`.
- `v2-neutral-no-stroke` and `v2-active-no-stroke`: `stroke="none"` on the stroked icons.
- `v2-icon-stroke-width-zero`: `strokeWidth: 0` in `ICON_PROPS`.
- `v2-good-cy-outside`: `cy: "12"` to `"48"`.
- `v2-good-fill-none`: good's circle `fill` to `none`.

`scope --since 43b4278 --previous …-v1-mutation.json` added v1's 86 mutants. All of them still
apply, and none was dropped. It tagged them 86 `carried` and the reviewer's 6 `late`. The 6 are
late because `tiers.ts` and `status-badge.tsx` are unchanged since 43b4278.

The command matches v1's: the plan's T004/T005 and T008 suites (12 files, 392 tests), then
`npx tsc --noEmit`. The first attempt stopped before any mutant ran, because one baseline hit the
`research.test.tsx` flake above. The immediate rerun's four baselines exit 0. Results are in
`CAP-003-E1-S5-implementation-review-v2-mutation.json` (sha256
`8ade60dd782428dffa2f309b76f327ae3565169ce3a332d53861c7ef666ccfcb`).

Every kill was attributed from its log to the failing test files and `tsc`. No kill rests only on
the load-flaky research suites. The one kill that also failed `results-pane.test.tsx`
(`tiers.ts:152`) failed `tiers.test.ts` as well.

| Mutant | Scope | State | Disposition |
|--------|-------|-------|-------------|
| 46 tier and label swaps (`tiers.ts:47-200`, `swap`) | carried | killed | Each fails `tiers.test.ts` |
| Ternary swaps `:99`, `:105`, `:186`; `:105` `failed !== false` | carried | killed | Fail `tiers.test.ts` |
| Defaults `:63`, `:72`, `:115` (`tierOf` download, result, item) to `"neutral"` | carried | killed | v1 survivors. Each fails exactly "a new download state" / "result outcome" / "item kind fails to type-check inside every function that switches on it" |
| Defaults `:143`, `:152`, `:178`, `:183`, `:202` (`labelOf` download, result, check name, check status, item) to `""` | carried | killed | v1 survivors. Each fails the new plant for its union (download state, result outcome, check name, check status, item kind) |
| Defaults `:87`, `:96`, `:118`, `:167`, `:205` to a literal | carried | killed | Scores and outer defaults by the original two plants. `:96` is now also killed by the check-status plant |
| `assertNever-unknown`, `assertNever-silent`, `check-accepts-not-determinable`, `t009-planted-kind`, `planted-item-kind`, `planted-result-outcome`, `planted-check-name` | carried | killed | Fail TC-COMP-020 |
| `item-failed-required`, `tier-seventh` | carried | killed | Fail `tsc` (the test fixtures; the `TIER_ICON` record) |
| `:99`, `:186` `status.present !== false` | carried | survived | Equivalent, as v1 recorded: design 2.3 types `present: boolean`, required, so `!== false` equals `present` for every input that type-checks. The equivalence holds only while that type does, which nothing pins (IR-002) |
| `good-radius-zero`, `good-outside-viewbox` | carried | killed | v1 survivors. Fail "good draws its fixed shape" |
| `active-filled` | carried | killed | v1 survivor. Fails "active draws its fixed shape" and "active's ring is not filled" |
| `title-defaults-to-label` | carried | killed | v1 survivor. Fails "has no title attribute when the caller passes none" |
| `neutral-filled`, `icon-fixed-good`, `serious-variant-critical`, `icon-shrinks`, `aria-hidden-false`, `focusable-true`, `serious-square`, `critical-triangle` | carried | killed | Fail `status-badge.test.tsx` and, for some, the delivered as-of-line or banner tests |
| `v2-good-cy-outside`, `v2-good-fill-none` | late | killed | Fail the shape fixture; `good-fill-none` also fails `as-of-line.test.tsx` |
| `v2-neutral-no-stroke`, `v2-active-no-stroke`, `v2-icon-stroke-width-zero` | late | **survived** | Not equivalent. Neutral and active draw with stroke alone (svg `fill="none"`), so each makes that icon draw nothing. DAC-E1-2 requires the hollow circle and ringed dot as visible shapes, and plan T007 fixes neutral as "stroke only, hollow" (IR-001). Late: no test is made `WEAK` |
| `v2-credential-present-optional` | late | **survived** | Not equivalent: design 2.3 and plan T006 type the member `{ of: "credential"; present: boolean }`. Under the mutant `{ of: "credential" }` compiles and renders *Missing* / critical (IR-002). Late: no test is made `WEAK` |

Totals: 92 mutants, 86 killed, 6 survived (2 equivalent, 4 non-equivalent late), 0 stillborn, 0
timeout. Of the carried mutants, 84 are killed and the 2 survivors are the equivalents. v1's 12
non-equivalent survivors are all killed. The cycle-3 RED log names the same failing test for each
of the 12, and this run reproduces it.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | N/A | `READY`; without `--base-ref`, `BLOCKED` (see Review Subject); not counted |
| `npm run test -- src/components/patterns/tiers.test.ts src/components/patterns/status-badge.test.tsx` | component root | 0 | PASS | Narrowest story suites first: 2 files, 80 tests (41 + 39) |
| `npm run test -- <T008's ten delivered files>` | component root | 0 | PASS | 10 files, 312 tests, unedited (T008) |
| `npm run lint` | component root | 0 | PASS | Biome: 217 files, no findings, before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 217 files, no changes, before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output, before and after `npm ci`. Enforces the `@ts-expect-error` guards and the `Record` fixtures |
| `npm run build` | component root | 0 | PASS | 2150 modules, before and after `npm ci`. Writes only ignored files under `src/factorflow/api/static/` |
| `npm run test` | component root | 0 | PASS | Two runs, before and after `npm ci`: 97 files, 2461 tests each, under load averages of 68-450 and 248-360 |
| `npm ci` | component root | 0 | PASS | 308 packages. 10 audit advisories, none introduced: `package.json` and `package-lock.json` are unchanged. Run after the mutation run, because every mutation clone links this `node_modules` |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f0b8e010429b144350e710c34f71a06d652bd003 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. `grep -c /Users/` on the evidence file prints 0. The reviewer's `shasum -a 256` of `cycle-3.patch`, `red-cycle-3-review-survivors.log` and both cycle results files matches the recorded values |
| `git diff --exit-code f0b8e01..HEAD -- web/src/screens web/src/app web/src/api package.json package-lock.json tailwind.config.js tsconfig.json vite.config.ts vitest.config.ts design-system` | component root | 0 | PASS | Delivered files unchanged (T008) |
| `git diff --stat f0b8e01..HEAD -- . ':!docs'` | component root | 0 | PASS | Exactly the four planned source files (T008) |
| `grep -n "screens/" web/src/components/patterns/status-badge.tsx` | component root | 1 | PASS | Prints nothing (plan Story-Specific Validation, AC-20 takeover) |
| T009 manual plant, as carried mutant `t009-planted-kind` | reviewer clone | 1 | PASS | TC-COMP-020 fails on `tierOf` and `labelOf`. The clone was discarded; nothing was reverted in the repo |
| `git diff --exit-code 43b4278..HEAD -- web/src/components/patterns/tiers.ts web/src/components/patterns/status-badge.tsx` | component root | 0 | N/A | Production unchanged since the baseline; scope evidence, not counted |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range f0b8e01..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 0 mutants: no TypeScript operators |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/mutants-manual.json --since 43b4278… --previous …-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | N/A | 92 mutants: 86 carried, 6 late; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/work --logs <scratch>/results-logs --command 'ln -sfn <component>/node_modules node_modules && npx vitest run --root web <12 story and T008 files> && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 1, 1, then 3 | N/A | First attempt: the work root did not exist yet (`FileNotFoundError`). Second: one baseline hit the research flake, so no mutant ran. Third: four baselines exit 0, then 92 mutants; exit 3 reports survivors |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed; not in the story's validation list |

### Validation Side Effects

- Before: clean working tree at `8dc1577`.
- After: clean working tree at `8dc1577`. The build and the suite's Vite build rewrite only ignored
  files under `src/factorflow/api/static/`, and `npm ci` rewrote only `node_modules/` (ignored).
  `pipeline-state.py code-revision` gives
  `sha256:e916e595c90d5cff60de2d0f61765a494ad7b98bc75029f5f41d8c8bee9fa87c` before and after. The
  report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 1 · **total 3**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | late | The shape fixture leaves out stroke, so neutral and active can stop drawing |
| IR-002 | MEDIUM | late | Nothing pins the credential `present` field as required |
| IR-003 | LOW | carried | Plan deviations are still recorded only in the TDD evidence (v1 IR-004) |

### IR-001 — The shape fixture leaves out stroke, so neutral and active can stop drawing

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-2, DAC-E1-S5-3, AC-20
- **Tasks**: T004, T007
- **Files**: `web/src/components/patterns/status-badge.test.tsx:38-68` (`GEOMETRY`, `shapeOf`, `SHAPE`), `:85-98`; `web/src/components/patterns/status-badge.tsx:25-33`
- **Claim challenged**: Cycle 3 says `shapeOf` records "what a tier draws". On that claim, two tiers
  that draw the same thing look the same in greyscale, and the fixture fails.
- **Observed evidence**:
  - Neutral (`Circle`) and active (`CircleDot`) are drawn by stroke alone. Their svg has
    `fill="none"`, and lucide supplies `stroke="currentColor"` and `stroke-width="2"`.
  - `shapeOf` records tag, geometry and fill. It does not record stroke.
  - Three reviewer mutants survive all 392 focused tests and `tsc`:
    - `v2-neutral-no-stroke` (`<Circle stroke="none" …>`): neutral draws nothing.
    - `v2-active-no-stroke` (`<CircleDot stroke="none" …>`): active draws nothing.
    - `v2-icon-stroke-width-zero` (`strokeWidth: 0` in `ICON_PROPS`): both draw nothing, while the
      filled tiers still do.
  - The distinctness test also passes under each mutant, because the strings still differ in
    geometry and fill.
- **Expected evidence/behavior**:
  - DAC-E1-2: the tier shape, "neutral hollow circle, active ringed dot", is shown "so greyscale
    rendering keeps every tier distinguishable".
  - STD-UI-8: a state carries "a text label plus an icon or shape".
  - Plan T007 fixes neutral as `<Circle />` "(stroke only, hollow)" and active as `<CircleDot />`.
- **Impact**:
  - Under any of the three mutants, every neutral badge (*Queued*, *Cancelled by you*,
    *No scores yet*) and every active one (*Downloading*, *Updating*, the *Download* and *Scores*
    item tags) shows its label with no shape. Neutral and active then differ only by colour.
  - The production code draws both strokes correctly today. This is a test gap, not a defect.
  - Scope: `mutation-run.py scope` tags all three `late`. `status-badge.tsx` is unchanged since
    `43b4278`, and v1 could have written these mutants. A late survivor does not make TC-COMP-022
    `WEAK`, and this finding cannot block.
- **Required remediation**:
  - Pin the stroke of the stroked tiers. Either record the effective stroke and stroke width
    (own or inherited) in `shapeOf` and `SHAPE`, or assert that the neutral and active svgs have
    a stroke other than `none` and a positive `stroke-width`.
  - Each of the three mutants above must fail.

### IR-002 — Nothing pins the credential `present` field as required

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-1 (credential row), AC-20
- **Tasks**: T003, T006
- **Files**: `web/src/components/patterns/tiers.ts:35`; `web/src/components/patterns/tiers.test.ts:249-250`
- **Claim challenged**: T006 types the credential member `{ of: "credential"; present: boolean }`,
  as design 2.3 does. v1 and this review dispose of the `:99` and `:186` `present !== false`
  mutants as equivalent on the strength of that type.
- **Observed evidence**:
  - `v2-credential-present-optional` (`present?: boolean`) survives every focused test and `tsc`.
  - Under it, `tierOf({ of: "credential" })` and `labelOf({ of: "credential" })` compile and
    return critical and *Missing*.
  - The credential rows (`tiers.test.ts:249-250`) always pass `present`, so they cannot tell.
- **Expected evidence/behavior**: Component design `ui-components` 2.3 and plan T006 fix
  `{ of: "credential"; present: boolean }`, a required boolean.
- **Impact**:
  - A later caller that omits `present` would render *Missing* / critical for a key that may be
    present, instead of failing to compile. Before the credential read resolves is one such case.
  - Under the widening, the two `!== false` mutants would no longer be equivalent.
  - The production type is right today. Scope: tagged `late` (`tiers.ts:35` unchanged since
    `43b4278`), so this cannot block or make TC-COMP-021 `WEAK`.
- **Required remediation**:
  - Add a type-level guard that fails when `present` becomes optional. For example, put
    `// @ts-expect-error` on `tierOf({ of: "credential" })`, as T002 does for
    `not_determinable`.
  - `v2-credential-present-optional` must fail `tsc`.

### IR-003 — Plan deviations are still recorded only in the TDD evidence

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002, T003, T004
- **Files**: `CAP-003-E1-S5-tdd-evidence.yaml:3-4` and cycle-3 `description`; `CAP-003-E1-S5-tasks.md` T002, T003, T004 and Story-Specific Validation ("T003 passes (28 rows)")
- **Claim challenged**: The task plan is the record of what was built.
- **Observed evidence**:
  - v1 IR-004's two deviations are unchanged. T003 has 29 rows, not 28. T002's
    `@ts-expect-error` guards sit inside `expect(() => …).toThrow()` on the `status:` line.
  - The rework adds two more of the same kind:
    - T002 now plants seven values, not the plan's two.
    - T004 (4)'s planned distinctness signature, `fill` plus `innerHTML`, is replaced by
      `shapeOf`.
  - The plan's only change since v1 is its frontmatter (`updated`, `last_reworked_review`). The
    deviations appear only in YAML comments and the cycle-3 description.
- **Expected evidence/behavior**: Deviations visible where the plan's reader looks (skill C.4:
  compare planned and actual and record deviations).
- **Impact**:
  - None functional. Every deviation strengthens the tests, and v1 IR-001 and IR-002 asked for
    the two new ones.
  - A reader of the plan still meets a row count and a uniqueness check that do not match the
    code.
- **Required remediation**: Optional. Note the four deviations in the task plan, for example
  beside T002, T003 and T004 or under Notes.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `tiers.test.ts:141-158` plants a value in the download state (`RunState` by reference), result outcome, check status, check name and item kind. Each plant needs a diagnostic in every function that switches on it. All 8 v1 survivors (`:63`, `:72`, `:115`, `:143`, `:152`, `:178`, `:183`, `:202`) are killed, each by the plant for its own union. The RED in `red-cycle-3-review-survivors.log` is reproduced |
| v1/IR-002 | RESOLVED | `status-badge.test.tsx:135-142` pins each tier's drawn shape against `SHAPE`. `:144-148` pins active's unfilled svg, `:150-159` checks distinctness on the drawn shape, and `:182-186` asserts no `title`. `active-filled`, `good-radius-zero`, `good-outside-viewbox` and `title-defaults-to-label` are all killed. DAC-E1-S5-3 is now `SATISFIED`. Stroke is a separate late gap (IR-001) |
| v1/IR-003 | RESOLVED | Both `mutation.results` values are harness-relative `repos/factorflow-v2/…` paths (`tdd-evidence.yaml:28,57`). `grep -c /Users/` prints 0. The lint passes with `--require-logs`, and the cited sha256 values match the files |
| v1/IR-004 | STILL OPEN | The plan text is unchanged; the cycle-3 description says IR-004 "is not changed". Carried as IR-003 with the rework's two further deviations |

## Scope and Plan Deviations

- No unjustified change. The four source files are the plan's ownership list. Since v1, only the
  two test files, the TDD evidence (cycle 3 and two path fixes), the plan's frontmatter and the
  cycle-3 evidence files changed, plus the committed v1 review.
- Justified deviations from the plan text, all asked for by v1:
  - TC-COMP-020's five extra plants (v1 IR-001).
  - `shapeOf`/`SHAPE` in place of the `innerHTML` signature, the active-fill test and the
    no-title test (v1 IR-002).
  - The plan text does not record them (IR-003).
- `SHAPE` pins lucide 1.70's triangle and diamond `d` strings. A lucide upgrade that redraws either
  icon will fail the fixture. That is intended pinning while `package-lock.json` fixes the
  version, and it is not a finding.
- The `aria-hidden` prop, the `cn` class merge and the `font-semibold` badge weight are unchanged
  since v1, which judged them harmless.
- Decision trailers: `43b4278` carries `Decision-Id: DEC-0203` and `DEC-0308`. `8dc1577` carries
  none and needs none, because the rework implements v1's findings only. DEC-0308 is still
  implemented exactly as recorded.
- This review recorded no decision. Every judgment above follows from the story, the plan, the
  epic, design 2.3, UX brief §12.2, STD-UI-1, STD-UI-8, STD-UI-12, DEC-0203, DEC-0308, the v1
  review and skill H's scope rules.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`) for `CAP-003-E1-S5`.
- **Required action**:
  - Synchronize the `ui-components` documentation with `tiers.ts` and `status-badge.tsx` as
    delivered.
  - Optionally, in a later rework:
    - pin the stroked tiers' stroke (IR-001);
    - add a type guard for `present` (IR-002);
    - record the plan deviations (IR-003).
- **Warnings accepted downstream**: IR-001, IR-002, IR-003
