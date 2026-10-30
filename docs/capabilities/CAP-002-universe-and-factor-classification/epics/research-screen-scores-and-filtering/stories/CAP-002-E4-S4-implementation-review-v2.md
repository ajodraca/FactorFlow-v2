---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E4-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-29T05:07:36Z"
reviewed_head: "1d3beef81b8a4dfa637ae5fe26aa0864ce1e39d0"
review_base: "7b4b5f5b4b1148cb810c3364e429348fab532d9e"
reviewed_state_revision: "sha256:59603a77dfa5d0fbc27d066d70192b5719a10b1db8419f954ef36cc159062e05"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E4-S4
    artifact_version: 1
    content_revision: sha256:8dc1ea3f7eab21af2983d77ae74a89396d4f0f0ebcb8c710160a9990f04af9f3
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-29T05:07:36Z
  source_artifacts:
    - id: CAP-002-E4-S4
      version: "1 (sha256:8dc1ea3f7eab21af2983d77ae74a89396d4f0f0ebcb8c710160a9990f04af9f3)"
    - id: CAP-002-E4-S4-tasks
      version: "1 (updated 2026-10-28, last_reworked_review v1)"
    - id: CAP-002-E4-S4-tdd-evidence
      version: "cycle-1 to cycle-3, rework-1"
    - id: CAP-002-E4-S4-implementation-review
      version: "1 (baseline, reviewed_head 58fc55865f9c7907cd630c4becd3e5b4c9f7c6ff)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-scheduler
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: DEC-0153
      version: "upheld 2026-10-18, E4-F27 amendment"
    - id: DEC-0154
      version: "upheld 2026-10-18, E4-F27 and E4-F28 amendments"
    - id: DEC-0155
      version: "upheld 2026-10-18, E4-F13 amendment"
    - id: DEC-0232
      version: "provisional, open, owner_reviewed false"
    - id: DEC-0233
      version: "provisional, open, owner_reviewed false"
    - id: DEC-0234
      version: "provisional reviewer scope decision, this review"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 14/16 verified |
| Required validation | 6/7 passed |

This re-review covers commit `1d3beef`, the rework of review v1. Its baseline
is v1 (`reviewed_head` `58fc558`, CHANGES-REQUIRED) and v1's mutation results.

**What the rework fixed.** Seven of v1's eight findings are resolved on current
evidence:

- **IR-001**: the hook now performs one further read after health reports the
  download terminal, and tests drive the classification-ui 2.6 handoff.
- **IR-002**: the DEC-0232 fallback is tested, and both v1 survivors are
  killed.
- **IR-004**: the announcement now has its leading space.
- **IR-005**: one shared `StatusBadge` imports the delivered `TIER_CLASSES`.
- **IR-006**: the tooltip and the numeric face are in place, and the banner
  body is recorded as a plan gap.
- **IR-007**: the `checkedAt` literal is now bounded.
- **IR-003**: superseded (see the disposition table).

IR-008 is still open, as LOW.

Validation is green everywhere except the mutation gate:

- the full web suite passes: 845 tests in 48 files;
- lint, format, `tsc` and the build are clean;
- the TDD-evidence lint reports 0 errors.

**Stage 1, spec compliance.** Every acceptance criterion is satisfied within
the designs' polling model. One test-adequacy gap blocks the gate:

- **IR-001** (HIGH, delta). The rework fixes the line and its skeleton to one
  shared `LINE_HEIGHT` (`min-h-7`), but nothing pins its value.
  - Shrinking the value moves the line and the skeleton together, and the
    tests still pass. Two mutants survive: `min-h-1` and `min-h-5`.
  - `min-height` is a floor, not a height. In Chromium with the built CSS, the
    one-row line measures 28 px whatever the floor below that. The `min-h-1`
    skeleton is 4 px and the `min-h-5` skeleton is 24 px, so the table shifts.
    UX design 1.2 Loading and DEC-0154 forbid that shift.
  - The coder's evidence says this survivor is equivalent ("holds for any one
    shared value"). That claim is wrong.

**Stage 2, code quality and evidence** (warnings, non-blocking):

- **IR-002** (MEDIUM, delta). DEC-0233's derivation says the further read
  "lands after the claim in every ordering the designs describe". The code
  instead issues it at the running interval's next tick, 0 to 10 s after the
  terminal report.
  - A reviewer probe shows a tick landing inside the scheduler's 5-second claim
    window. The hook stops, and for 20 simulated minutes it misses both the
    building set and the completion.
  - The coder surfaced a second exposure: a download shorter than one 30-second
    health interval. It is recorded only in the plan's Notes.
  - Both are reliability exposures for the owner (AGT-SPEC-002). This review
    does not accept them.
- **IR-003** (MEDIUM, late, DEC-0234). The `StatusBadge` tests do not pin the
  good tier's filled circle or the badges' `text-xs`. The lines were moved
  verbatim from v1-reviewed code.
- **IR-004** (LOW, carried; v1 IR-008). The hook, `AsOfLine` and `LiveRegion`
  still exceed SA-FUNC-003's 30 lines.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 1 · **total 4**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`); the component repo is the project repo |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S4`, ahead of `origin/main` by 3 commits: `58fc558` story-coding, `00c22fd` review v1, `1d3beef` rework |
| HEAD | `1d3beef81b8a4dfa637ae5fe26aa0864ce1e39d0` ("fix(research): CAP-002-E4-S4 story-coding rework", trailer `Decision-Id: DEC-0233`) |
| Review base | `origin/main`, supplied by the driver. `pipeline-state.py review-base --base-ref origin/main` resolves it to `7b4b5f5b4b1148cb810c3364e429348fab532d9e`, an ancestor of HEAD (`merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 36 since the review base; 17 since the baseline (`git diff --name-status 58fc558..HEAD`) |
| Baseline | v1, `reviewed_head` `58fc55865f9c7907cd630c4becd3e5b4c9f7c6ff`, with `CAP-002-E4-S4-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/not-current-banner.tsx` | added (reworked) | AC-20, DAC-E4-S4-1, DAC-E4-S4-2; T011; v1 IR-002, IR-005 |
| `web/src/components/patterns/not-current-banner.test.tsx` | added (reworked) | TC-COMP-174, TC-COMP-175; T001, T002, T007; v1 IR-002 |
| `web/src/components/patterns/as-of-line.tsx` | added (reworked) | AC-21, DAC-E4-S4-1, DAC-E4-S4-3, DAC-E4-S4-4; T012; v1 IR-003 to IR-006 |
| `web/src/components/patterns/as-of-line.test.tsx` | added (reworked) | TC-COMP-179, TC-COMP-176; T003, T004, T008 |
| `web/src/components/patterns/status-badge.tsx` | added in the rework | T011, T012; v1 IR-005 (SA-DUP-001); not in T014's file list, a justified deviation |
| `web/src/screens/research/use-score-set-poll.ts` | added (reworked) | AC-20, AC-22, DAC-E4-4, DAC-E4-S4-4 to -6; T013; v1 IR-001, IR-008; DEC-0233 |
| `web/src/screens/research/use-score-set-poll.test.ts` | added (reworked) | TC-COMP-177, TC-COMP-184; T005, T006, T009; v1 IR-001, IR-007 |
| `web/src/screens/research/copy.ts` | modified, `SCORE_SET.noReasonRecorded` (unchanged since v1) | T010; DEC-0232 |
| `web/src/screens/research/copy.test.ts` | modified, one anchor (unchanged since v1) | T010; DEC-0232 |
| `…/stories/CAP-002-E4-S4.md` | modified, `status: planning` → `in-review` (unchanged since v1) | T014 status line |
| `…/stories/CAP-002-E4-S4-tasks.md` | modified: checkboxes, notes, `last_reworked_review`, *Review rework* note | T010, T016 bookkeeping; v1 follow-up |
| `…/stories/CAP-002-E4-S4-tdd-evidence.yaml` | added; `rework-1` cycle appended | T016 |
| `…/stories/CAP-002-E4-S4-evidence/` (22 files: 4 patches, 4 red logs, 4 green logs, 2 full-suite logs, 4 mutant files, 4 mutation results) | added | T016; `check-tdd-evidence.py --require-logs` |
| `…/stories/CAP-002-E4-S4-implementation-review-v1.md`, `…-v1-mutation.json` | added (review commit `00c22fd`) | The baseline review; not the coder's work |

No other path changed. `dependencies.yaml` is unchanged. The four new source
files are imported only by each other and their tests (`grep -rl` over
`web/src`). No delivered file is modified except the one `copy.ts` export.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-20 | SATISFIED | `not-current-banner.tsx:46-69`; `use-score-set-poll.ts:114-115, 143, 158-160` (polling continues while the latest read was issued during the download) | `not-current-banner.test.tsx:62-155`; `use-score-set-poll.test.ts:275-383` (2.6 handoff) | Satisfied within the designs' polling model and DEC-0233, which is provisional. The residual handoff timing is surfaced for the owner in IR-002, not accepted here. |
| AC-21 | SATISFIED | `as-of-line.tsx:59-81` (set sentence, linked start time), `:166-167` (outcome badge) | `as-of-line.test.tsx:93-146` | America/Chicago with the zone; no `#`, UUID or `run_id` |
| AC-22 | SATISFIED | `use-score-set-poll.ts:150-156` (read on mount) | `use-score-set-poll.test.ts:213-272` | This story's part only: the hook supplies the never-populated summary from first load. The body is E4-S9's. |
| DAC-E4-2 | SATISFIED | `not-current-banner.tsx:47`, `as-of-line.tsx:153-161` (nothing for `set` null); the hook keeps `later` | `use-score-set-poll.test.ts:319-347` (never-populated store through the handoff to its first set) | v1's PARTIAL is resolved |
| DAC-E4-4 | SATISFIED | Banner and line as above; `use-score-set-poll.ts:137-147` (one announcement and one `onNewSet` per new `setId`) | `use-score-set-poll.test.ts:129-211, 276-317`; `as-of-line.test.tsx:148-195` | One refresh, announced, through the handoff |
| DAC-E4-S4-1 | SATISFIED | `not-current-banner.tsx:57-61`; `as-of-line.tsx:106-113` | `not-current-banner.test.tsx:62-97`; `as-of-line.test.tsx:205-224` | The *Updating* badge now carries the start-time tooltip |
| DAC-E4-S4-2 | SATISFIED | `not-current-banner.tsx:23-34, 62-64` | `not-current-banner.test.tsx:99-155` | The `endedAt`-null fallback is pinned (`:145-155`) |
| DAC-E4-S4-3 | SATISFIED | `as-of-line.tsx:59-81` | `as-of-line.test.tsx:95-136` | |
| DAC-E4-S4-4 | SATISFIED | `as-of-line.tsx:127-133, 183-194`; `use-score-set-poll.ts:121-130, 158-159` | `as-of-line.test.tsx:150-195`; `use-score-set-poll.test.ts:465-540` | The timer stops until **Try again** (DEC-0155) |
| DAC-E4-S4-5 | SATISFIED | `use-score-set-poll.ts:137-147` | `use-score-set-poll.test.ts:129-211, 563-571` | |
| DAC-E4-S4-6 | SATISFIED | `use-score-set-poll.ts:150-160` | `use-score-set-poll.test.ts:213-272, 319-347` | Case 3 now pins exactly 4 reads (`:269-271`), and the never-populated handoff reaches `onNewSet` once |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `not-current-banner.test.tsx:62-97` | |
| T002 | complete | VERIFIED | `not-current-banner.test.tsx:99-155` | The DEC-0232 `endedAt`-null case is added |
| T003 | complete | VERIFIED | `as-of-line.test.tsx:93-146` | |
| T004 | complete | VERIFIED | `as-of-line.test.tsx:148-195` | |
| T005 | complete | VERIFIED | `use-score-set-poll.test.ts:129-211` | |
| T006 | complete | VERIFIED | `use-score-set-poll.test.ts:213-383` | Case 3 pins the one further read (4 reads, then none in 60 s). The 2.6 handoff is driven for populated and never-populated stores. |
| T007 | complete | VERIFIED | `not-current-banner.test.tsx:157-215` | `w-fit` is asserted. The banner body's times stay in the text face, as T007 pins, and the plan's Notes record that against UX 1.2 Token Usage. |
| T008 | complete | PARTIAL | `as-of-line.test.tsx:351-366` | The skeleton's "final height" is pinned only as "the same `min-h-*` token as the line". Its value is unpinned, and two non-equivalent mutants survive (IR-001). |
| T009 | complete | VERIFIED | `use-score-set-poll.test.ts:385-622` | (a)–(h) are present. (b) adds "resumes when a new download starts". (c) is bounded, not exact. |
| T010 | complete | VERIFIED | `copy.ts:391-397`, `copy.test.ts`; DEC-0232 | Unchanged since v1 |
| T011 | complete | VERIFIED | `not-current-banner.tsx`; `status-badge.tsx` | v1's two DEC-0232 survivors are killed. The warning and critical shapes are pinned (reviewer mutants `warning-shape-square` and `critical-shape-circle` are killed). |
| T012 | complete | PARTIAL | `as-of-line.tsx:51, 155-159, 166` | Props, region, tooltip, numeric faces and the announcement separator are correct. TEST-TDD-006 forbids completion while a changed-line mutant survives, and the shared `LINE_HEIGHT` value has two (IR-001). |
| T013 | complete | VERIFIED | `use-score-set-poll.ts:87-163` | Matches T013 and DEC-0233's decision text. DEC-0233's derivation overstates the guarantee (IR-002, non-blocking). |
| T014 | complete | VERIFIED | full suite 845/845; `git diff --name-status` | Only planned paths, the `status-badge.tsx` addition (v1 IR-005), T016 evidence and the v1 review. No importer. `render.test.tsx` passes. |
| T015 | complete | VERIFIED | lint, format, `tsc` and build clean; `index-hALUE38R.css` carries every listed class plus `min-h-7{min-height:var(--space-7)}` and `w-fit` | |
| T016 | complete | VERIFIED | `CAP-002-E4-S4-tdd-evidence.yaml` `rework-1`; lint 0 errors | `diff_sha256` `5f2e8ef3…` equals `shasum` of `rework-1.patch`. Its seven source and test hunks match `00c22fd..1d3beef` file by file. See Deviations for the one story-status hunk. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `not-current-banner.test.tsx` / TC-COMP-174 | ADEQUATE | Empty for `later` null; one `status-warning` badge with its triangle; builder sentence plus literals; no controls | none |
| `not-current-banner.test.tsx` / TC-COMP-175 | ADEQUATE | `status-critical` square, exact failed sentence, reason as text, no controls, null-reason clause; failure time from `startedAt` when `endedAt` is null | none (v1 IR-002 resolved) |
| `as-of-line.test.tsx` / TC-COMP-176 | ADEQUATE | Failure text inside the one `status` region, **Try again** outside it, one call per click, marks kept, banner beside it kept | none |
| `use-score-set-poll.test.ts` / TC-COMP-177 | ADEQUATE | Exact announcement; `onNewSet` once with B, no re-fire, a separate C, no fire for a set-less read | none |
| `as-of-line.test.tsx` / TC-COMP-179 | ADEQUATE | Exact line text, link name and `href`, no UUID, CST vs CDT, *sorted by* clause | none |
| `use-score-set-poll.test.ts` / TC-COMP-184 and the 2.6 handoff tests | ADEQUATE | Read on mount; continuation with `set` null; first completion handed over; exactly one further read after the terminal report (`:258-272`); the handoff sees `building`, keeps polling and hands the completion over once (`:276-347`); a read in flight at the report still owes one more (`:349-375`); none owed when health was terminal before mount (`:377-382`) | The tests model the terminal report one full tick before the next read. The tick-inside-the-claim-window ordering is a design question (IR-002), not a test gap. |
| `as-of-line.test.tsx` / T008 details | WEAK | Badges, shapes, tokens, tooltip, the one region and its contents and order, announcement boundary (`:325-337`), `font-numeric` on both times, skeleton hidden and sharing the line's `min-h-*` token | The shared token's value is unpinned. `min-h-1` and `min-h-5` survive (IR-001). |
| `use-score-set-poll.test.ts` / T009 (a)–(h) | ADEQUATE | Cadence edges, every terminal and non-terminal state, resume after stop, bounded `checkedAt`, failure stop and `tryAgain`, unmount, StrictMode, overlap, callback freshness | none |
| `status-badge.tsx` through the banner and line tests | ADEQUATE (late gap) | Variant prefix, tier grounds, `aria-hidden` shape, title; warning, critical and active shapes | Good tier's filled circle and `text-xs` are not pinned. These are late survivors (DEC-0234), so the test is not `WEAK` (IR-003). |
| `copy.test.ts` anchor | ADEQUATE | `noReasonRecorded` literal | none |

**Mutation run.** `mutation-run.py generate` ran over `7b4b5f5..1d3beef`; `scope`
ran with `--since 58fc558 --previous` the v1 results; `run` executed the four
focused files in 6 clones. The run had 130 mutants:

- 25 generated (`negate-boolean` 23, `off-by-one` 2);
- 34 written by this reviewer;
- 71 re-added from the baseline by `scope --previous`. Another 23 baseline
  mutants no longer apply, because their lines changed. Two baseline ids
  (`:102`, `:128`) are shadowed by regenerated mutants with the same id; their
  current counterparts (`:144`, `:77`) ran and were killed.

`scope` tagged 73 carried, 42 delta and 15 late. DEC-0234 then retags two delta
mutants as late, giving 73 carried, 40 delta and 17 late. All six baselines
passed. 122 mutants were killed and 8 survived:

| Survivor | Scope | Equivalent? | Disposition |
|----------|-------|-------------|-------------|
| `manual:review-v2:line-height-shared-collapsed` (`min-h-7` → `min-h-1`) | delta | No | UX design 1.2 States, Loading: "skeleton at final height so the table beneath does not shift"; DEC-0154. In Chromium, the skeleton is 4 px and the one-row line is 28 px (IR-001). |
| `manual:review-v2:line-height-shared-smaller` (`min-h-7` → `min-h-5`) | delta | No | As above: the skeleton is 24 px and the line is 28 px (IR-001) |
| `manual:review-v2:good-shape-hollow` (good filled circle → ring) | late (DEC-0234; tool tag delta) | No | UX design 1.2 Accessibility: "good filled circle". The line is moved verbatim from `58fc558:as-of-line.tsx` (IR-003). |
| `manual:review-v2:badge-text-size` (`text-xs` → `text-sm`) | late (DEC-0234; tool tag delta) | No | UX design 1.2 Page Layout: the as-of line is in `--text-xs`. The line traces to the delivered `coverage/badges.tsx` (IR-003). |
| `use-score-set-poll.ts:98:negate-boolean:1` (`readWhileDownloading` starts `true`) | delta | Yes | The value is read only until the first successful read. Until then, either the mount read is in flight, so every tick returns at the in-flight guard (`:110-112`), or `pollFailed` is true and stops the timer. The only difference is the cadence's phase when health turns non-terminal while the mount read is pending. Classification-ui 2.6 and STD-UI-25 fix a 10-second cadence and a stop rule, not the phase. |
| `manual:review-v2:undefined-class-kept` (drop `.filter(Boolean)`) | delta | Yes | `Array.prototype.join` renders `undefined` as an empty string. The class list is identical apart from one extra space. |
| `use-score-set-poll.ts:102:negate-boolean:1` and `:60:negate-boolean:1` (`mountedRef` starts `false`) | carried | Yes | As v1 disposed it: the mount effect sets the ref to `true` synchronously (`:151`) before the first `await` can settle, and every reader runs after an `await` |

Every other reviewer mutant was killed. These include the rework's own
contract: never or always owing the further read, judging it on landing,
ignoring it, never clearing it, a frozen `downloadingRef`, a one-shot interval,
a timer that ignores `active`, a missing tooltip or one naming the download's
start, a lost numeric face, the separator dropped, and badge stretch. The
coder's 50 earlier and 25 rework mutants that still apply were killed again. The
persisted `-v2-mutation.json` is the run's results file, with `scope` `late`,
`scope_tool` and `scope_basis` added to the two DEC-0234 ids.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All rows PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `7b4b5f5b4b1148cb810c3364e429348fab532d9e` |
| `npx vitest run web/src/components/patterns/not-current-banner.test.tsx web/src/components/patterns/as-of-line.test.tsx web/src/screens/research/use-score-set-poll.test.ts web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 4 files, 370 tests (16 + 23 + 33 + 298) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 48 files, 845 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 113 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 113 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules. `index-hALUE38R.css` has `.min-h-7{min-height:var(--space-7)}`, `w-fit`, `font-numeric`, the four `status-*-muted` grounds, `text-muted-foreground`, `animate-pulse` and `bg-secondary`. |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7b4b5f5b4b1148cb810c3364e429348fab532d9e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7b4b5f5…..HEAD --cycle review --out <scratch>/mutants-generated.json`, plus 34 manual mutants | harness root | 0 | PASS | 25 generated across the four production files |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants-all.json --since 58fc55865f9c7907cd630c4becd3e5b4c9f7c6ff --previous …/CAP-002-E4-S4-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 130 mutants: carried 73, delta 42, late 15 |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 6 --command '<link node_modules>; ./node_modules/.bin/vitest run <the four focused files>' --out <scratch>/results.json --work-root <scratch>/work` | harness root | 3 | FAIL (gate) | 122 killed, 8 survived. 2 are non-equivalent delta (IR-001), 2 non-equivalent late (IR-003) and 4 equivalent. Raw results sha256 `1f5ba2a8618ba143a96c89fdd2d83acb488bc5e384b3a4525ccee9116f2581c8`; the persisted copy with the DEC-0234 scope fields is `6b74f10ce6bfdfa666d0effca69b04336943488a731d6199bdc7261dce9866f7`. |
| Reviewer probe `zz-review-probe.test.ts` in a scratch clone of `1d3beef` (outside the review subject): `./node_modules/.bin/vitest run src/screens/research/zz-review-probe.test.ts` | `<scratch>/probe` | 0 | Evidence | Race case: `{"readsAtTwenty":3,"readsAfter":3,"later":null,"setId":"A","onNewSetCalls":0}`. Health turns terminal at t=18, the owed read fires at t=20, the claim lands at t=22, and nothing follows for 20 simulated minutes. Short-download case: `{"reads":1,"setId":"A","onNewSetCalls":0}`. |
| `node <scratch>/measure/measure.mjs …` and `widths.mjs …` (Playwright Chromium over the built CSS and markup rendered from `1d3beef`) | harness root | 0 | Evidence | In the sandbox, Chromium aborted with `bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer…: Permission denied (1100)`. Rerun as one plain call outside the sandbox. At 1000 px: line 48 / content 28 px and skeleton 48 px for `min-h-7`; skeleton 24 px for `min-h-5` and 4 px for `min-h-1`, with the line still 28 px. At 800 px, and at 1000 px while building, the line wraps to 52 or 54 px. |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:8dc1ea3f…f9f3` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `sha256:59603a77…2e05` |
| `npm run test:e2e` | — | N/A | NOT RUN | Not in the story's validation list. No screen mounts these components yet; E4-S9 is their first importer. |
| `uv run …` (the Python commands in the tech-stack table) | — | N/A | NOT RUN | No Python file is in the change set |

The Gate Summary counts seven required validations: test, lint, format, `tsc`,
build, the TDD-evidence lint and the mutation gate. Six passed; the mutation
gate failed. Every required command ran inside the sandbox. Only the optional
Chromium measurement needed to run outside it.

### Validation Side Effects

- Before: `git status` clean at `1d3beef`. The ignored `node_modules/` and
  `src/factorflow/api/static/` build output were present.
- After: `git status` clean at `1d3beef`. `npm run test` (its build-output
  test) and `npm run build` rewrote the ignored `src/factorflow/api/static/`
  assets with the same hashed names (`index-hALUE38R.css`,
  `index-DICYeVMu.js`), as `tech-stack.md` records. Mutation clones, the probe
  clone and the measurement files live in the scratchpad, outside the
  component repository.
- Unexpected tracked-file changes: none

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | delta | The as-of line's shared height token is not pinned, so a skeleton shorter than the line survives |
| IR-002 | MEDIUM | delta | DEC-0233's derivation overstates the further read's guarantee; two handoff exposures need the owner |
| IR-003 | MEDIUM | late | The shared status badge's good-tier filled circle and `text-xs` size are not pinned |
| IR-004 | LOW | carried | The hook, the line and its live region still exceed SA-FUNC-003's function length |

### IR-001 — The as-of line's shared height token is not pinned, so a skeleton shorter than the line survives

- **Severity**: HIGH
- **Scope**: delta. `as-of-line.tsx:51` was added in `1d3beef`, and `mutation-run.py scope` tags both survivors delta.
- **Status**: OPEN
- **Acceptance criteria**: N/A directly. This is T008's Loading assertion: UX design 1.2 States, Loading; DEC-0154's `loading` prop.
- **Tasks**: T008, T012
- **Files**: `web/src/components/patterns/as-of-line.tsx:51` (`const LINE_HEIGHT = "min-h-7"`), `:158` (skeleton), `:166` (line); `web/src/components/patterns/as-of-line.test.tsx:85-91` (`heightToken`), `:351-366` (skeleton test)
- **Claim challenged**: The rework says IR-003's skeleton half is resolved. The
  `rework-1` evidence disposes the survivor `line-height-value-changed-on-both`
  as equivalent: "holds for any one shared value, and no artifact fixes the
  value".
- **Observed evidence**:
  - The test asserts that the skeleton and the line carry the same single
    `min-h-*` class, and that the skeleton has no `h-N`. It never asserts which
    value.
  - Two reviewer mutants survive the focused suites: `min-h-7` → `min-h-1` and
    `min-h-7` → `min-h-5`.
  - `min-height` is a floor. The line's height is the larger of the floor and
    its content; the empty skeleton's height is the floor.
  - Measured in Chromium with the built CSS and markup rendered from `1d3beef`,
    one-row line at 1000 px:

    | Floor | Line | Skeleton |
    |---|---|---|
    | `min-h-7` (shipped) | 48 px | 48 px |
    | `min-h-5` | 28 px | 24 px |
    | `min-h-1` | 28 px | 4 px |

  - The equivalence argument is therefore false. The shared value is what
    makes the skeleton match the line, and the tests do not pin it.
- **Expected evidence/behavior**:
  - UX design 1.2 States, Loading: "The as-of line renders its skeleton at
    final height so the table beneath does not shift". DEC-0154 (owner-upheld)
    says the same. T008 asks for "a skeleton block of the line's final height".
  - Under TEST-TDD-006, no non-equivalent changed-line mutant may survive.
    Adversarial-review E.9: a mutant that changes behaviour the design
    specifies is not equivalent.
- **Impact**: A change to the shared token that shrinks it below the line's
  one-row content height ships green. The table under the line then jumps by up
  to 24 px when the first read lands, which is the shift the Loading state
  exists to prevent. As context only, not a requirement here: at 800 px, and at
  1000 px while a set builds, the line wraps to 52 or 54 px. A fixed skeleton
  cannot match a wrapped line.
- **Required remediation**:
  - Pin the shared height so that both survivors are killed. For example,
    assert the token itself (`min-h-7`) on both the line and the skeleton, as
    the suite already pins `text-xs`, `w-fit` and `font-numeric`.
  - Correct the `rework-1` equivalence disposition, or supersede it in the next
    cycle's evidence.

### IR-002 — DEC-0233's derivation overstates the further read's guarantee; two handoff exposures need the owner

- **Severity**: MEDIUM
- **Scope**: delta. `use-score-set-poll.ts:96-98, 106, 114-115, 143, 158-160` and DEC-0233 were introduced by the rework.
- **Status**: OPEN
- **Acceptance criteria**: AC-20, DAC-E4-2, DAC-E4-4, DAC-E4-S4-6, under owner-assessed timing
- **Tasks**: T013, T006
- **Files**:
  - `web/src/screens/research/use-score-set-poll.ts:75-85` (`usePollTimer`: the interval is not restarted when `downloading` turns false, because `polling` stays true through `readWhileDownloading`), `:114-115`, `:143`, `:158-160`
  - `projects/factorflow-v2/decisions/DEC-0233.md` (harness repo), `derivation`
  - `CAP-002-E4-S4-tasks.md` Notes, *Review rework (2026-10-28)*
- **Claim challenged**: DEC-0233 says the scheduler claims a set within 5 s
  of the run ending while health polls every 30 s, "so a read 10 seconds after
  the terminal report lands after the claim in every ordering the designs
  describe".
- **Observed evidence**:
  - **The read is not 10 s after the report.** The owed read is the running
    interval's next tick, which can land anywhere from 0 to 10 s after the
    terminal report. Nothing restarts the cadence at the report.
  - **The probe** used a scratch clone of `1d3beef`, outside the review
    subject:
    - health running; reads at 0 s and 10 s, each returning `later: null`;
    - at t=18 health reports terminal (the run ended about 1 s earlier);
    - the owed read fires at t=20 and still sees `later: null`;
    - the scheduler's claim lands at t=22, inside its 5-second window;
    - result: `readsAtTwenty` 3, `readsAfter` 3, `later` null, `onNewSet` 0
      over 20 simulated minutes.
  - **The decision is inconsistent with itself.** It rejects "read immediately
    when the terminal report arrives" because "a read inside the scheduler's
    5-second claim window can still precede the claim". The chosen next-tick
    read has the same exposure whenever the tick lands inside that window.
  - **A second exposure exists.** The rework's code review found that a
    download which starts and ends between two 30-second health polls is never
    seen non-terminal, so a stopped hook never reads again. The probe confirms
    it: `reads` 1, `onNewSet` 0. This is recorded only in the plan's Notes, and
    no decision record or design open question carries it.
- **Expected evidence/behavior**:
  - A provisional decision the owner will review must state its guarantee
    accurately (AGT-EVIDENCE-001). Reliability exposures must be surfaced for
    human assessment, not decided by an agent (AGT-SPEC-002).
  - Review v1 IR-001 asked for at least one further read and named the
    residual ("Even one further read misses a claim that lands after the health
    report") as the owner's question. The code meets that bar, T006 and
    DEC-0233's decision text, so this finding does not block.
- **Impact**:
  - In the probed ordering, an open scored screen shows the previous set
    unmarked while a newer one builds, and never refreshes until a reload.
    That is AC-20's "stale or half-built result unknowingly".
  - The same miss happens on a never-populated store (DAC-E4-2, DAC-E4-S4-6).
  - The window needs the health report to land within the scheduler's claim
    window and the next tick to land before the claim. This review does not
    estimate its rate and does not accept the risk.
- **Required remediation**:
  - Make DEC-0233's derivation state the guarantee the implemented timing
    actually gives, by amending or superseding it.
  - Put both exposures in front of the owner in a record the owner reviews:
    the tick inside the claim window, and the download shorter than one health
    interval. Use DEC-0233, a new decision, or a classification-ui 2.6 open
    question.
  - Any change to the polling rule follows the owner's answer. One option is a
    cadence restarted at the terminal report, which is the timing the
    derivation assumes.

### IR-003 — The shared status badge's good-tier filled circle and `text-xs` size are not pinned

- **Severity**: MEDIUM
- **Scope**: late (DEC-0234). `mutation-run.py scope` tagged both survivors
  delta, because `status-badge.tsx` is a new file. `git blame -C -C -C
  58fc558^..1d3beef` traces the lines to older code:
  - `status-badge.tsx:19` comes from `58fc558`'s `as-of-line.tsx`, which v1
    mutated;
  - `:16` comes from `7b4b5f5`'s `web/src/screens/coverage/badges.tsx`.

  The content is unchanged since the baseline, moved by the IR-005 refactor
  that v1 required.
- **Status**: OPEN
- **Acceptance criteria**: N/A (UX design 1.2 Accessibility and Page Layout)
- **Tasks**: T012
- **Files**: `web/src/components/patterns/status-badge.tsx:16` (`BADGE … text-xs`), `:19` (`good: <circle … fill="currentColor" />`); `web/src/components/patterns/as-of-line.test.tsx:244-259` (outcome badge: only "an `svg` exists")
- **Claim challenged**: The badges carry the tier shape UX design 1.2 assigns,
  in the line's text size.
- **Observed evidence**: Two mutants survive. `good-shape-hollow` turns the
  *Complete* badge's filled circle into an unfilled ring. `badge-text-size`
  turns `text-xs` into `text-sm` on every CAP-002 badge.
- **Expected evidence/behavior**:
  - UX design 1.2 Accessibility gives each tier a shape: "warning triangle,
    critical square, active ringed dot, good filled circle".
  - UX design 1.2 Page Layout puts the as-of line in `--text-xs`.
- **Impact**:
  - A *Complete* badge could ship as a hollow ring, close to the active
    ringed dot, which weakens the greyscale distinction STD-UI-8 relies on.
  - Badges could outgrow the line's text size.
  - Both would ship green. Under H the late scope keeps this a warning.
- **Required remediation**: Optional. Assert the good tier's single filled
  circle and the badge's `text-xs` class.

### IR-004 — The hook, the line and its live region still exceed SA-FUNC-003's function length

- **Severity**: LOW
- **Scope**: carried (v1 IR-008)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T013
- **Files**: `web/src/screens/research/use-score-set-poll.ts:87-163` (`useScoreSetPoll`, about 54 counted lines), `web/src/components/patterns/as-of-line.tsx:142-197` (`AsOfLine`, about 50), `:83-136` (`LiveRegion`, about 43). These are reviewer counts of non-blank, non-comment, non-closing lines.
- **Claim challenged**: The rework extracted `downloadRunning`,
  `announcementFor`, `useLatest` and `usePollTimer` to answer IR-008.
- **Observed evidence**: The extractions landed, but the three bodies are still
  over 30 executable lines. The `rework-1` evidence says so. The delivered
  `useHealthPolling` sets the same precedent.
- **Expected evidence/behavior**: SA-FUNC-003 allows 30 lines of executable
  code per function.
- **Impact**: The functions are harder to change separately. There is no
  behaviour risk.
- **Required remediation**: Optional.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `use-score-set-poll.ts:114-115, 143, 158-160`. Case 3 pins 4 reads (`use-score-set-poll.test.ts:269-271`). The 2.6 handoff tests (`:276-347`) assert the banner input (`later.state` `building`, set A kept) and exactly one `onNewSet`. DEC-0233 records the one-read choice. Reviewer mutants `never-owe-further-read`, `owed-read-ignored`, `owed-judged-at-landing` and `downloading-ref-frozen` are killed. The residual timing is a new, non-blocking IR-002. |
| v1/IR-002 | RESOLVED | `not-current-banner.test.tsx:145-155`. Carried mutants `manual:review:ended-at-null-no-fallback` and `…-names-set-end` are killed. |
| v1/IR-003 | SUPERSEDED | The checked-time face is resolved: `as-of-line.test.tsx:221`, and the carried `manual:review:checked-span-not-numeric` is killed. The skeleton now shares the line's token, and v1's `skeleton-height-collapsed` no longer applies (`h-7` is gone). The shared value is unpinned, which is v2/IR-001. |
| v1/IR-004 | RESOLVED | `as-of-line.tsx:100-105` (leading space); `as-of-line.test.tsx:325-337` pins the full visible text with and without a sort clause. The `announcement-space-dropped` mutant is killed. |
| v1/IR-005 | RESOLVED | `status-badge.tsx` imports the delivered `TIER_CLASSES` (`:2, 45`). The banner and the line render through `StatusBadge`. Rendered class sets and shapes are unchanged: the class order differs, the set is the same. |
| v1/IR-006 | RESOLVED | The *Updating* tooltip is `as-of-line.tsx:109`, asserted at `as-of-line.test.tsx:217-218`. The *Scores from* time is `font-numeric` (`:69`, asserted at `:380`). The banner body's text face is recorded as a plan gap in the tasks Notes, *Review rework*. |
| v1/IR-007 | RESOLVED | `use-score-set-poll.test.ts:454-457`: a one-second bound instead of an exact literal |
| v1/IR-008 | STILL OPEN | v2/IR-004 (LOW, optional) |

## Scope and Plan Deviations

- **Justified deviations**:
  - `web/src/components/patterns/status-badge.tsx` is a new file that is not
    in T014's file list. It is v1 IR-005's remediation, and the plan's Notes
    record it.
  - `status-badge.tsx` imports `TIER_CLASSES` from a screen module
    (`screens/runs/outcome-badge.tsx`). The hook already imports
    `isNonTerminalRunState` from the same module. Moving the map would edit a
    delivered file outside CAP-002's edit set (DEC-0084).
  - Four helpers were extracted from the hook (v1 IR-008, optional).
  - The as-of line itself now renders at a 48 px minimum, against 28 px of
    content at 1000 px and wider. This follows from sharing the skeleton's
    height, and no artifact fixes the line's own height.
- **Bookkeeping**:
  - The `rework-1` reviewed patch (`diff_sha256` `5f2e8ef3…`) includes the
    story hunk `status: in-review` → `in-progress`. The commit keeps
    `in-review`.
  - Every source and test hunk of the patch matches `00c22fd..1d3beef` file by
    file, so the difference is that one status line.
  - All 16 tasks are checked. T008 and T012 are PARTIAL on current evidence
    (IR-001).
- **Out-of-scope changes**: None.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework
  `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md`
  against this report:
  - Fix IR-001: pin the shared line height so that `min-h-1` and `min-h-5` are
    killed, and correct the `rework-1` equivalence disposition.
  - Preferably also address IR-002: correct DEC-0233's derivation, and surface
    both handoff exposures to the owner.
  - IR-003 and IR-004 are optional.
  - Then rerun this review. Its baseline is this report: `reviewed_head`
    `1d3beef81b8a4dfa637ae5fe26aa0864ce1e39d0`, mutation results
    `CAP-002-E4-S4-implementation-review-v2-mutation.json`.
  - DEC-0234 (provisional, agent) records this review's scope call on the two
    moved lines. The commit carrying this report should carry
    `Decision-Id: DEC-0234`.
- **Warnings accepted downstream**: N/A
