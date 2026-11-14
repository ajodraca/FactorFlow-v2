---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S5"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T21:46:12Z"
reviewed_head: "43b4278603833c94f6a355f23efaca6252f7082a"
review_base: "f0b8e010429b144350e710c34f71a06d652bd003"
reviewed_state_revision: "sha256:255bc7f03a5a90fe0c916129a4e461f5c5d2a68ce4442043def853b379ea4ad8"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-08T21:46:12Z
  source_artifacts:
    - id: CAP-003-E1-S5
      version: "1 (sha256:aae6f1fbd086bbc691039d932007a8edff160f2943d11bbf68a3fd28e3eb4b82)"
    - id: CAP-003-E1-S5-tasks
      version: "1 (draft, updated 2026-11-06)"
    - id: CAP-003-E1-S5-tdd-evidence
      version: "cycle-1 to cycle-2"
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

# Implementation Review: CAP-003-E1-S5 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 7/8 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 11/11 passed |

This is an initial review, so every finding has scope `initial` and may block.

The production code is correct. `tierOf` and `labelOf` return every UX brief §12.2 row that
DAC-E1-1 restates, plus the DEC-0203 item rows and the DEC-0308 check rows. Each `switch` ends in
`assertNever`. `StatusBadge` composes S1's `badge` `status-<tier>` variant with an `aria-hidden`
lucide shape per tier. Only the four planned source files changed. Every delivered CAP-002
caller and test passes unedited. All 11 required validation checks pass, including two full-suite
runs (97 files, 2448 tests) before and after `npm ci`.

The gate fails on test strength. The reviewer wrote 86 mutants over the two changed production
files, because the shared catalogue generates none for TypeScript. 72 are killed. Of the 14
survivors, two are equivalent. The other 12 are not:

- **IR-001 (HIGH).** TC-COMP-020 pins the `never` default of only 5 of the 13 `switch`es. Replace
  any of the other 8 with a literal and the suite and `tsc` stay green. A new download state,
  result outcome, check status, check name or item kind would then type-check clean in that
  function. DAC-E1-S5-1 forbids that.
- **IR-002 (HIGH).** `status-badge.test.tsx` checks markup, not shapes, in three places. A
  filled `CircleDot` makes active the same filled disc as good in greyscale, and the
  "no two tiers share a shape" test still passes. A zero-radius or off-canvas good circle leaves
  good with no visible shape. A label-copying `title` default also passes. DAC-E1-S5-3 is
  therefore `PARTIAL`.
- **IR-003 (MEDIUM).** The TDD evidence cites its mutation results by absolute paths into this
  run's temporary worktree.
- **IR-004 (LOW).** Two plan deviations are recorded only as comments in the TDD evidence.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S5-run-20261108T150357Z` |
| HEAD | `43b4278603833c94f6a355f23efaca6252f7082a` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z`, the driver's integration branch passed as `--base-ref`. `pipeline-state.py review-base` resolves it to `f0b8e010429b144350e710c34f71a06d652bd003`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` prints nothing). The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 97 against the review base (94 added, 3 modified) in one commit, `43b4278` |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — story is ready for
independent review`. Without `--base-ref`, it resolves against the remote default branch, where the
TDD lint cannot match the evidence, and reports `BLOCKED — story coding has not reached
in-review`. Skill A.2 requires the driver's integration branch, so the reviewer used that base.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/tiers.ts` | added (207 lines) | AC-19, AC-20, AC-12, DAC-E1-1, DAC-E1-S5-1; T006 |
| `web/src/components/patterns/tiers.test.ts` | added (235 lines) | TC-COMP-020, TC-COMP-021; T002, T003 |
| `web/src/components/patterns/status-badge.tsx` | modified (rewritten in place, 66 lines changed) | DAC-E1-2, AC-20; T007; Resolved Conflict 3 |
| `web/src/components/patterns/status-badge.test.tsx` | added (147 lines) | TC-COMP-022; T004, T005 |
| `.../stories/CAP-003-E1-S5.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S5-tasks.md` | modified (T001-T010 ticked; `git diff --word-diff` shows 10 `[ ]` to `[x]` and nothing else) | bookkeeping |
| `.../stories/CAP-003-E1-S5-tdd-evidence.yaml` | added (two cycles) | T010 |
| `.../stories/CAP-003-E1-S5-evidence/cycle-{1,2}.patch` | added | T010 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S5-evidence/red-cycle-1-2-tiers-and-badge.log` | added | T010 (`red_log`) |
| `.../stories/CAP-003-E1-S5-evidence/mutants-cycle-{1,2}.json`, `mutation-cycle-{1,2}-results.json` and `-logs/*.log` (87 files) | added | T010 (`mutation:`) |

No source file other than the four above changed. `git diff --exit-code f0b8e01..HEAD -- web/src/screens
web/src/app web/src/api package.json package-lock.json tailwind.config.js tsconfig.json
vite.config.ts vitest.config.ts design-system` exits 0, so no CAP-002 caller, screen, shell file,
manifest or `web/src/api/types.ts` was edited (T008).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-19 | SATISFIED | `tiers.ts:122-207` `labelOf` returns only display labels. Download outcomes match STD-UI-1's table row by row: *Complete* / *Partial* / *Failed* / *Cancelled by you* / *Interrupted* (`ui-conventions.md` l.165). `StatusBadge` renders `children` only (`status-badge.tsx:52-55`) | `tiers.test.ts:223-226` (29 rows by label); `status-badge.test.tsx:40-51` (name is exactly the label) | No domain term or generic word in any label. Each label swap the reviewer wrote, including domain-term swaps such as *Complete* to *Succeeded* and *Interrupted* to *Abandoned*, is killed |
| AC-20 | SATISFIED | `tiers.ts:42-120` maps each status to one `Tier`; `status-badge.tsx:31-57` renders label plus `aria-hidden` shape on `Badge variant={status-${tier}}` | `tiers.test.ts:217-235`; `status-badge.test.tsx:38-147` | The code is right. IR-002 covers the shape tests' gaps |
| AC-12 | SATISFIED | `tiers.ts:54-55` `partial` warning; `:60-61` `abandoned` serious | `tiers.test.ts:134,137` fixture rows; `:228-230` partial never good | `partial`-to-good and `abandoned`-to-warning mutants are killed |
| DAC-E1-1 | SATISFIED | Every row of the epic's enumeration: download l.45-64, result l.66-73, scores l.75-88, check l.90-97 (DEC-0308), credential l.99, and the labels at l.125-186 | `tiers.test.ts:129-215` independent literal fixtures, `it.each` at `:223-226`; guards at `:228-234` | Matches UX brief §12.2 (l.764-785) and design 2.3. Check `not_current` has no row (plan Resolved Conflict 1). `not_determinable` is rejected at the type level (`tiers.test.ts:109-126`) |
| DAC-E1-2 | SATISFIED | `status-badge.tsx:21-38`: neutral `Circle` (hollow), active `CircleDot`, good one-circle `Icon` filled, warning `Triangle`, serious `Diamond`, critical `Square` (filled), each with `aria-hidden="true" focusable="false"`; `Badge` from `../ui/badge` (`:52`) | `status-badge.test.tsx:40-113`, `:117-122` | The rendered shapes are right. IR-002 shows the tests would not notice two of them losing their shape |
| DAC-E1-S5-1 | SATISFIED | All 13 `switch`es end `default: return assertNever(...)` (`tiers.ts:63,72,87,96,115,118,143,152,167,178,183,202,205`), and `assertNever(value: never)` (l.38). The reviewer planted a new kind, result outcome, item kind and check name; each fails `tsc` and TC-COMP-020 case 1 | `tiers.test.ts:79-127` (TC-COMP-020) | The production behaviour holds. The test pins only 5 of the 13 defaults (IR-001) |
| DAC-E1-S5-2 | SATISFIED | n/a (test criterion) | `tiers.test.ts:129-235`: 29 rows by input, label and tier. Check `ok` is labelled per check (`:178-187`). Credential *Found* / *Missing* (`:198-199`) | Every row and label mutant is killed |
| DAC-E1-S5-3 | PARTIAL | n/a (test criterion) | `status-badge.test.tsx:40-51` (name, `aria-hidden`), `:53-101` (fixture), `:103-113` (signatures) | The label-in-name and `aria-hidden` halves hold. "No two tiers share a shape" is checked by comparing markup strings (`fill` attribute plus `innerHTML`), not shapes. A filled `CircleDot` gives active the same filled disc as good, and the check still passes (IR-002) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At the base, `web/src/components/ui/badge.tsx` exports `Badge` with the six `status-<tier>` variants, `web/src/components/ui/utils.ts` exists, and `lucide-react` `^1.70.0` is in `package.json` (installed 1.70.0). The plan's `grep -nE "declare const (Circle\|CircleDot\|Triangle\|Diamond\|Square\|Icon)\b"` finds all six exports | Cycle-1 records a baseline of 95 files and 2381 tests. The current 97 files and 2448 tests are that baseline plus this story's 2 files and 67 tests |
| T002 | complete | VERIFIED | `tiers.test.ts:15-127`: compiler-API harness with the real `tsconfig.json` and `types: []`, AST splices (`plant`, `statusUnion`, `scoresStateUnion`), cases (1)-(3), 30 s timeout, and the two `@ts-expect-error` guards | Implemented as planned. The planned plants (one new kind, one new scores state) reach only 5 of the 13 defaults (IR-001). The guards sit on the `status:` line of a multi-line call wrapped in `expect(...).toThrow()` (IR-004) |
| T003 | complete | VERIFIED | `tiers.test.ts:129-235`: `Record<RunState,…>`, `Record<"not_found"\|"failed",…>`, `Record<…scores state…>` and `Record<NeedsYouKind,…>` fixtures, four check rows, two credential rows, and explicit `failed: false` and `failed: true` item rows (29); two named guards | The plan said 28 rows. The extra `failed: true` row is added coverage, recorded only in the evidence (IR-004) |
| T004 | complete | VERIFIED | `status-badge.test.tsx:38-114`: link-name query, one `svg` with `aria-hidden` and `focusable`, per-tier shape fixture, six distinct signatures | Implemented as planned, plus filled-shape and size-and-order tests (`:89-101`). The planned fixture does not pin good's geometry or active's hollow ring (IR-002) |
| T005 | complete | VERIFIED | `status-badge.test.tsx:116-147`: (a) variant and token classes per tier, (b) `title` and `className` forwarded, (c) no tab stop and no role, (d) no import from `screens` | (b) asserts forwarding but not absence (IR-002) |
| T006 | complete | VERIFIED | `tiers.ts:1-207`: exports `Tier`, `NeedsYouKind`, `Status` (with DEC-0308's `check` field), `tierOf`, `labelOf`. `RunState` is a type-only import. Nested `switch`es end in `assertNever`, booleans use conditionals. Module doc comment carries no unit literal or hex | Matches the plan. `token-literals.test.ts` passes over it |
| T007 | complete | VERIFIED | `status-badge.tsx:1-57`: `StatusTier = Tier` kept; `TIER_ICON: Record<Tier, JSX.Element>` with the planned icons and props; `FILLED_CIRCLE` one-circle `iconNode`; `Badge variant={status-${tier}} title className`; no `TIER_CLASSES` or `screens/` import (`grep -n "screens/"` prints nothing) | Matches the plan. The `aria-hidden` prop is redundant: lucide 1.70 adds `aria-hidden="true"` itself when no a11y prop is passed (`hasA11yProp`, `buildLucideIconNode.mjs`) |
| T008 | complete | VERIFIED | The reviewer ran the plan's ten delivered files (as-of-line, not-current-banner, results-pane, research, set-history-dialog, factor-card, history-tab, token-literals, badge, render): 10 files, 312 tests passed. `git diff --stat f0b8e01..HEAD -- . ':!docs'` lists only the four planned files | Unchanged callers compile against the widened `Tier` and `StatusTier` |
| T009 | complete | VERIFIED | Reviewer reran lint, format, `tsc` and build (all exit 0). The manual plant ran as mutant `t009-planted-kind` (`\| { of: "planted" }` added to `Status`): killed, with TC-COMP-020 case 1 failing on diagnostics in `tierOf` and `labelOf` | Matches plan |
| T010 | complete | VERIFIED | `CAP-003-E1-S5-tdd-evidence.yaml`: two cycles, both `APPROVED`, no drift, `commit_hash: stage`, `diff_sha256`/`reviewed_patch`, `red_log_sha256`, `mutation:` blocks. `check-tdd-evidence.py … --require-logs` passes (0 errors, 0 warnings) | The `results:` paths are absolute into this run's worktree (IR-003). Cycle-2's one survivor, `aria-hidden-removed`, is equivalent as recorded: lucide adds the attribute itself |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `Status exhaustiveness (TC-COMP-020, DAC-E1-S5-1)` (`tiers.test.ts:79-127`) / TC-COMP-020 | WEAK | Real compiler program over the repo `tsconfig.json`. AST splices change the source. Diagnostics must fall inside each function's range. The unspliced source type-checks clean. `@ts-expect-error` plus `toThrow` reject `not_determinable` and `not_current` at type level and at runtime. Kills `assertNever(value: unknown)`, a silent `assertNever` and the outer and scores defaults | 8 non-equivalent survivors: the download, result and item defaults of `tierOf` and the download, result, check-name, check-status and item defaults of `labelOf` (IR-001) |
| `Tier table (TC-COMP-021, DAC-E1-1)` (`tiers.test.ts:129-235`) / TC-COMP-021 | ADEQUATE | Independent literal fixtures, typed so a missing kind or state fails `tsc`. 29 rows assert tier and label from production. `partial` and `cancelled` guards. All 46 tier and label swaps, 4 branch swaps and the `failed`-undefined mutant are killed | None |
| `StatusBadge words and shapes (TC-COMP-022, DAC-E1-S5-3)` (`status-badge.test.tsx:38-114`) / TC-COMP-022 | WEAK | Accessible name equals the label (icon contributes nothing). One `svg` with `aria-hidden` and `focusable="false"`. Tags per tier, lucide class per tier, svg `fill` for neutral and the three filled tiers, size classes, icon before label. Kills icon swaps, `fill` changes on neutral, tier-fixed icon, `aria-hidden="false"`, `focusable="true"` and size changes | `active-filled`, `good-radius-zero` and `good-outside-viewbox` survive. The signature check compares markup, not shapes (IR-002) |
| `StatusBadge composition (DAC-E1-2)` (`status-badge.test.tsx:116-147`) / T005 | WEAK | Variant and token classes per tier, `title` and `className` forwarded alongside tier classes, not a tab stop, no role, no `screens` import. Kills the serious-to-critical variant mutant | `title-defaults-to-label` survives: the test proves a given title is forwarded, not that none is added (IR-002) |
| Delivered CAP-002 tests and scans (T008 list, 312 tests) | ADEQUATE | Run unedited; kill the tier-fixed icon, `aria-hidden="false"` and critical-triangle mutants through `as-of-line.test.tsx` and `not-current-banner.test.tsx` | None for this story |

Isolation and determinism: Vitest `globals: true` gives Testing Library its automatic cleanup. The
uniqueness test also unmounts each render. The compiler-API test reads only repository files and
takes 0.8-7 s under load, within its 30 s timeout. There are no timers, no network and no storage.
Two delivered CAP-002 files this story does not change failed under a load average of 88-750.
`results-pane.test.tsx` failed a polling `findByText` in 4 of 86 mutant runs, and
`set-history-dialog.test.tsx` failed in 1. In two of the results-pane runs nothing else failed, so
the reviewer reran both on the story suites (see the mutation section). In the other three,
`tiers.test.ts` also failed, so they are kills either way. Both files passed in both full-suite
runs.

### Mutation run (reviewer, `review` cycle)

`mutation-run.py generate --range f0b8e01..HEAD` writes 0 mutants: the catalogue has no TypeScript
operators, as the coder's evidence says. The reviewer therefore wrote 86 `manual` mutants from
their own reading (`make_mutants.py` in the reviewer scratchpad):

- a plausible-mistake swap of every tier and label return;
- a literal in place of every `assertNever` default;
- branch swaps and `!== false` on both ternaries;
- `assertNever` widened or made silent;
- four type-level widenings and four planted union members;
- 12 `status-badge.tsx` mutants of geometry, fill, props, title and variant.

The command ran the plan's T004/T005 and T008 suites (12 files, 379 tests), then
`npx tsc --noEmit`. All four baselines exit 0. Results:
`CAP-003-E1-S5-implementation-review-v1-mutation.json` (sha256
`a532b14d6c2dd859e77c98e496b3f8783a0e3453dca5e7f04e33482946e24edc`).

In two mutant runs (`tiers.ts:183` default and `tiers.ts:186` `!== false`), the only failure was
`results-pane.test.tsx`. Results-pane does not call `labelOf`, so those were not kills. Both were
rerun with `--only` on `tiers.test.ts`, `status-badge.test.tsx` and `tsc`, and both survived. The
results file keeps the first run under `first_run` and records the rerun under `reruns`.

| Mutant | Scope | State | Disposition |
|--------|-------|-------|-------------|
| 46 tier and label swaps (`tiers.ts:47-200`, `swap`) | initial | killed | Each fails `tiers.test.ts` |
| Ternary swaps `:99`, `:105`, `:186`; `:105` `failed !== false` | initial | killed | Fail `tiers.test.ts` |
| `assertNever-unknown`, `assertNever-silent`, `check-accepts-not-determinable` | initial | killed | Fail TC-COMP-020 |
| `item-failed-required`, `tier-seventh` | initial | killed | Fail `tsc` (test fixtures, `TIER_ICON` record) |
| `t009-planted-kind`, `planted-item-kind`, `planted-result-outcome`, `planted-check-name` | initial | killed | Production rejects each new member (TC-COMP-020 case 1 and `tsc`) |
| Defaults `:87`, `:96`, `:118`, `:167`, `:205` → literal | initial | killed | Scores and outer defaults by cases 2-3; `tierOf` check default by the runtime `toThrow` at `tiers.test.ts:109-126` |
| Defaults `:63`, `:72`, `:115` (`tierOf` download, result, item) → `"neutral"` | initial | **survived** | Not equivalent: DAC-E1-S5-1 requires a new state to fail to type-check in `tierOf`, and plan T006 requires every `switch` to end in `assertNever` (IR-001) |
| Defaults `:143`, `:152`, `:178`, `:183`, `:202` (`labelOf` download, result, check name, check status, item) → `""` | initial | **survived** | Not equivalent, same contract (IR-001). For the check name, DEC-0308 makes `labelOf` the only function that switches on it |
| `:99`, `:186` `status.present !== false` | initial | survived | Equivalent: `present: boolean` is required (`tiers.ts:35`; design 2.3; design §4 "The credential badge receives a boolean only"), so `!== false` equals `present` for every input that type-checks |
| `good-radius-zero` (`FILLED_CIRCLE` `r: "10"` → `"0"`), `good-outside-viewbox` (`cx: "12"` → `"48"`) | initial | **survived** | Not equivalent: plan T007 fixes `cx: "12", cy: "12", r: "10"`, and DAC-E1-2 requires good's filled circle to be visible (IR-002) |
| `active-filled` (`<CircleDot fill="currentColor" …>`) | initial | **survived** | Not equivalent: DAC-E1-2 and design 2.3 require a ringed dot, distinct from good's filled circle in greyscale. Plan Other Notes fills only warning, serious and critical (IR-002) |
| `title-defaults-to-label` (`title={title ?? children}`) | initial | **survived** | Not equivalent: plan T007 fixes `title={title}`, and the prop doc makes `title` a tooltip only where the caller passes one (IR-002) |
| `neutral-filled`, `icon-fixed-good`, `serious-variant-critical`, `icon-shrinks`, `aria-hidden-false`, `focusable-true`, `serious-square`, `critical-triangle` | initial | killed | Fail `status-badge.test.tsx` and, for some, the delivered as-of-line or banner tests |

Totals: 86 mutants, 72 killed, 14 survived (12 non-equivalent, 2 equivalent), 0 stillborn, 0
timeout. The coder's own runs (54/54 and 20/21, one equivalent survivor) are consistent with this.
They killed every mutant they wrote. They wrote no nested-default, geometry or hollow-ring mutant,
apart from the plan's scores-case default.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | N/A | `READY`; without `--base-ref`, `BLOCKED` (see Review Subject); not counted |
| `npm run test -- src/components/patterns/tiers.test.ts src/components/patterns/status-badge.test.tsx` | component root | 0 | PASS | Narrowest story suites first: 2 files, 67 tests (36 + 31) |
| `npm run test -- <T008's ten delivered files>` | component root | 0 | PASS | 10 files, 312 tests, unedited (T008). Only React Router future-flag warnings on stderr |
| `npm run lint` | component root | 0 | PASS | Biome: 217 files, no findings, before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 217 files, no changes, before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output, before and after `npm ci`; enforces the `@ts-expect-error` guards and the `Record` fixtures |
| `npm run build` | component root | 0 | PASS | 2150 modules (lucide-react's ESM barrel), before and after `npm ci`. Writes only ignored files under `src/factorflow/api/static/` |
| `npm run test` | component root | 0 | PASS | Two runs, before and after `npm ci`: 97 files, 2448 tests each, under load averages of 238-748 and 452-671 |
| `npm ci` | component root | 0 | PASS | 308 packages. 10 audit advisories, none introduced: `package.json` and `package-lock.json` are unchanged. Run after the mutation run, because every mutation clone links this `node_modules` |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f0b8e01… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. It passes only from this worktree (IR-003) |
| `git diff --exit-code f0b8e01..HEAD -- web/src/screens web/src/app web/src/api package.json package-lock.json tailwind.config.js tsconfig.json vite.config.ts vitest.config.ts design-system` | component root | 0 | PASS | Delivered files unchanged (T008) |
| `git diff --stat f0b8e01..HEAD -- . ':!docs'` | component root | 0 | PASS | Exactly the four planned source files (T008) |
| `grep -n "screens/" web/src/components/patterns/status-badge.tsx` | component root | 1 | PASS | Prints nothing (plan Story-Specific Validation, AC-20 takeover) |
| T009 manual plant, as mutant `t009-planted-kind` with `npx tsc --noEmit` | reviewer clone | 1 | PASS | `tsc` and TC-COMP-020 case 1 fail on `tierOf` and `labelOf`; the clone was discarded, nothing reverted in the repo |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range f0b8e01..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 0 mutants: no TypeScript operators |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/work --logs <scratch>/results-logs --command 'ln -sfn <component>/node_modules node_modules && npx vitest run --root web <12 story and T008 files> && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 3 | N/A | 86 mutants; exit 3 reports survivors. Four baselines exit 0 |
| `python3 scripts/mutation-run.py run … --only …tiers.ts:183:manual:default-literal --only …tiers.ts:186:manual:undefined-as-true --command '… npx vitest run --root web src/components/patterns/tiers.test.ts src/components/patterns/status-badge.test.tsx && npx tsc --noEmit' --out <scratch>/results-rerun.json` | harness root | 3 | N/A | Both survive; merged into the mutation file |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed; not in the story's validation list |

### Validation Side Effects

- Before: clean working tree at `43b4278`.
- After: clean working tree at `43b4278`. The build and the suite's Vite build rewrite only
  ignored files under `src/factorflow/api/static/`. `npm ci` rewrote only `node_modules/`
  (ignored). The report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — TC-COMP-020 leaves 8 of the 13 `never` defaults unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S5-1, AC-20
- **Tasks**: T002 (TC-COMP-020)
- **Files**: `web/src/components/patterns/tiers.test.ts:79-127`; `web/src/components/patterns/tiers.ts:63,72,115,143,152,178,183,202`
- **Claim challenged**: T002 says TC-COMP-020 makes a new kind or state fail to type-check in `tierOf` and `labelOf`. It names "swap-case of a nested `default: return assertNever(...)` for `default: return "neutral"`" as a mutant it kills.
- **Observed evidence**:
  - The test plants exactly two values: a new `Status` kind (`:89-97`) and a new scores state (`:99-107`). The runtime `toThrow` guard (`:109-126`) also exercises `tierOf`'s check default.
  - Replacing any of the other eight defaults with a literal survives all 379 focused tests and `npx tsc --noEmit`. These are `tierOf` download (`:63`), result (`:72`) and item (`:115`), and `labelOf` download (`:143`), result (`:152`), check name (`:178`), check status (`:183`) and item (`:202`).
  - The plan's named kill holds only for the scores `switch` (`:87`, `:167`).
- **Expected evidence/behavior**:
  - DAC-E1-S5-1: "When a new kind or state is added without a row, Then `tierOf` and `labelOf` fail to type-check (exhaustive `switch` with a `never` default)".
  - Plan T006: "every `switch` ends `default: return assertNever(x)`".
  - Each `switch` whose discriminated union can gain a value is part of that contract. Those unions are the download member's `RunState`, the result `outcome`, the check `status`, the check `check` (`labelOf` only, DEC-0308) and the item `kind` (`NeedsYouKind`).
- **Impact**:
  - A later edit that softens one of these defaults passes the whole gate. After it, adding a value to `RunState` (the `api/types.ts` wire enum), to `NeedsYouKind` (which CAP-003-E1-S8 imports) or to a check field compiles clean in that function and renders a fixed tier or an empty label.
  - That is the "status rendered without a tier" the criterion exists to prevent. The `assertNever` runtime guard (plan Other Notes, *Runtime guard*) is lost with it.
- **Required remediation**:
  - Extend TC-COMP-020 so each of these unions gets a planted value. Each plant must produce a diagnostic inside every function that switches on that union, so each of the eight mutants above fails.
  - The planted unions are the download `state`, the result `outcome`, the check `status`, the check `check` (`labelOf` only) and the item `kind`.
  - Splicing the union in `tiers.ts` by AST, as the existing harness does, is sufficient. No production change is required.

### IR-002 — The badge tests check markup, not the shape each tier must show

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S5-3 (PARTIAL), DAC-E1-2, AC-20
- **Tasks**: T004 (TC-COMP-022), T005
- **Files**: `web/src/components/patterns/status-badge.test.tsx:62-75,103-113,124-134`; `web/src/components/patterns/status-badge.tsx:21-23,33,52`
- **Claim challenged**: T004 says TC-COMP-022's per-tier fixture and six-signature set prove that "no two tiers share a shape" and that greyscale rendering keeps tiers distinguishable. T005 (b) says `title` forwarding is pinned.
- **Observed evidence**: four non-equivalent mutants survive every focused test and `tsc`.
  - `active-filled` (`<CircleDot fill="currentColor" …>`) fills the ring. Active then renders the same filled disc as good's. Its signature still differs, because the svg `fill` attribute and the second `circle` differ in markup. "active is a ring and a dot" (`:62-66`) checks only the two `circle` tags.
  - `good-radius-zero` (`r: "0"`) and `good-outside-viewbox` (`cx: "48"` in a 24-unit viewBox) leave good with no visible shape. "good is one filled circle" (`:68-75`) checks only the tag, `fill` and the absent `stroke`.
  - `title-defaults-to-label` (`title={title ?? children}`) gives every untitled badge a `title` repeating its label. `:124-134` only passes an explicit title.
- **Expected evidence/behavior**:
  - DAC-E1-S5-3: the test proves "no two tiers share a shape".
  - DAC-E1-2 and design 2.3: active is a ringed dot and good a filled circle, so greyscale keeps every tier distinguishable (STD-UI-8).
  - Plan T007 fixes `FILLED_CIRCLE` at `cx: "12", cy: "12", r: "10"`, active as plain `<CircleDot />` (Other Notes, *Filled vs hollow*: only warning, serious and critical are filled), and `title={title}`.
- **Impact**:
  - Under `active-filled`, *Downloading* and *Complete* look identical in greyscale while the test that exists to catch it passes.
  - Under the geometry mutants, good is carried by colour alone.
  - Every later surface (Home, Data health, toasts, taken-over screens) renders its status through this badge.
- **Required remediation**:
  - Pin good's circle geometry, so a filled circle inside the viewBox is required.
  - Pin active's ring as unfilled: svg `fill="none"`, or no `fill` on the ring.
  - Base the distinctness check on the shape fixture (tag, geometry, fill) rather than raw markup. Then two tiers that render the same visible shape fail it.
  - Assert that a badge rendered without `title` has no `title` attribute.
  - Each of the four mutants above must fail.

### IR-003 — TDD evidence cites mutation results by absolute worktree paths

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010
- **Files**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5-tdd-evidence.yaml:28,57`
- **Claim challenged**: T010 says the evidence names each cycle's mutation results so that `check-tdd-evidence.py --require-logs` can verify them.
- **Observed evidence**:
  - Both `mutation.results` values are absolute paths under `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b/`.
  - `check-tdd-evidence.py` resolves paths with `os.path.join(ROOT, path)` (l.434), and an absolute path overrides `ROOT`. So the lint passes only while this run's worktree exists.
  - S1 and S2 cite their results by harness-relative `repos/factorflow-v2/…` paths. S3 and S4, from this same run, use the same absolute form; their reviews did not raise it.
- **Expected evidence/behavior**: Evidence paths resolvable from any harness checkout, as `--require-logs` intends: "counts that point at nothing are not evidence".
- **Impact**:
  - Once the run worktree is removed, the lint fails from any other checkout on files that exist in the repository.
  - `pipeline-state.py` runs that lint while no passing review exists, so this story would read `story-coding: RESUME` there.
- **Required remediation**: Record both `results:` values as harness-relative paths, like the `red_log` and `reviewed_patch` entries in the same file, and keep the lint passing.

### IR-004 — Plan deviations recorded only in TDD-evidence comments

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002, T003
- **Files**: `CAP-003-E1-S5-tdd-evidence.yaml:3-4`; `CAP-003-E1-S5-tasks.md` T002, T003, Story-Specific Validation ("T003 passes (28 rows)")
- **Claim challenged**: The task plan is the record of what was built.
- **Observed evidence**:
  - T003's table has 29 rows, not the plan's 28: an explicit `failed: true` item row is added.
  - T002's `@ts-expect-error` guards sit on the `status:` property line of a multi-line call wrapped in `expect(() => …).toThrow()`.
  - Both are stated only in YAML comments. The plan still says 28 rows.
- **Expected evidence/behavior**: Deviations visible where the plan's reader looks (skill C.4: compare planned and actual and record deviations).
- **Impact**: None functional. Both deviations strengthen the tests. A reader of the plan meets a count that does not match.
- **Required remediation**: Optional. Note both deviations in the task plan, for example beside T002 and T003 or under Notes.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- No unjustified change: the four source files are the plan's ownership list, and the remaining
  93 files are story status, plan checkboxes and T010's evidence.
- Justified, beyond the plan: three extra badge tests, "is a filled shape" (`:89-93`) and "12 px
  square and comes before the label" (`:95-101`). They pin the plan's filled shapes, the icon
  classes and icon-before-label order. The `failed: true` row and the runtime `toThrow` wrappers
  are covered by IR-004.
- The redundant `aria-hidden` prop (T007) is harmless: lucide 1.70 adds it itself. Cycle-2 records
  its removal mutant as equivalent, and the reviewer agrees.
- `StatusBadge` now merges `className` through `cn` (tailwind-merge) after the variant classes. The
  delivered badge appended the tier classes last. No delivered caller passes a class that
  conflicts (only `w-fit`), and every delivered test passes.
- Decision trailers: `43b4278` carries `Decision-Id: DEC-0203` and `DEC-0308`, which
  `git log --format='%(trailers:key=Decision-Id)'` parses. DEC-0308 (provisional, second opinion
  agrees) is implemented exactly as recorded: `check` field, `tierOf` ignores it, `labelOf` uses it
  for `ok` only.
- This review recorded no decision. Every judgment above follows from the story, the plan, the
  epic, design 2.3, UX brief §12.2, STD-UI-1, STD-UI-8, STD-UI-12, DEC-0203 and DEC-0308.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Rework the tests only, in a new TDD cycle: resolve IR-001 and IR-002 so that each of the 12
    non-equivalent survivors listed in the mutation section fails.
  - Fix the evidence paths (IR-003).
  - Optionally record IR-004's deviations in the plan.
  - Set `last_reworked_review` to this report, then rerun `$adversarial-review`. The next review
    takes this report and `CAP-003-E1-S5-implementation-review-v1-mutation.json` as its baseline.
- **Warnings accepted downstream**: N/A
