---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S4-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E4-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-10-30T02:09:03Z"
reviewed_head: "3a159eb8d3811205a64d45d45d6b418b8ed6b0e3"
review_base: "7688c924c554920816b60fd6af60fc81f1164174"
reviewed_state_revision: "sha256:15542d3c63dd8e49a7f5c71c08a7e68df7cd7fbb83f0c3296c5222e386ac8acf"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-30T02:09:03Z
  source_artifacts:
    - id: CAP-002-E4-S4
      version: "1 (sha256:8dc1ea3f7eab21af2983d77ae74a89396d4f0f0ebcb8c710160a9990f04af9f3)"
    - id: CAP-002-E4-S4-tasks
      version: "1 (updated 2026-10-29, last_reworked_review v2)"
    - id: CAP-002-E4-S4-tdd-evidence
      version: "cycle-1 to cycle-3, rework-1, rework-2"
    - id: CAP-002-E4-S4-implementation-review
      version: "2 (baseline, reviewed_head 1d3beef81b8a4dfa637ae5fe26aa0864ce1e39d0)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
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
      version: "provisional reviewer scope decision, review v2"
    - id: DEC-0238
      version: "provisional, open, owner_reviewed false (untracked in the harness worktree at review time)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S4 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 7/7 passed |

This re-review covers commit `3a159eb`, the rework of review v2. Its baseline is
v2 (`reviewed_head` `1d3beef`, CHANGES-REQUIRED) and v2's mutation results.
Between the two, the branch merged `origin/main` (`db9b691`); the merge changed
no line of this story's files.

**What the rework changed.** It is test-only. No production line changed since
the baseline (`git diff 1d3beef..HEAD` over the four production files and
`copy.ts`'s `SCORE_SET` block is empty). It adds 27 lines to
`as-of-line.test.tsx`, a `rework-2` TDD-evidence cycle, a plan note, and
decision record DEC-0238 in the harness.

**Every blocking item from v2 is resolved on current evidence:**

- **v2 IR-001** (HIGH): the skeleton test now pins the shared token's value,
  `min-h-7`, on the line and on the skeleton. v2's survivors `min-h-1` and
  `min-h-5` are killed in this review's run. So is a new reviewer mutant that
  enlarges the token (`min-h-9`).
- **v2 IR-003** (MEDIUM): the *Complete* badge is pinned as one filled circle
  with no stroke, and the outcome badges' `text-xs` is pinned. Both v2 survivors
  are killed, as are two new reviewer mutants (good tier drawn as a ringed dot,
  or as a square).
- **v2 IR-002** (MEDIUM): DEC-0238 restates DEC-0233's guarantee to match the
  implemented timing. It hands the owner both handoff exposures with three
  candidate rules, and the polling rule stays unchanged until the owner answers.

**Validation is green.** The full web suite passes (950 tests in 50 files).
Lint, format, `tsc` and the build are clean. The TDD-evidence lint reports 0
errors. The mutation run had 141 mutants: 137 were killed, and the 4 survivors
are equivalent (all carried, all disposed the same way in v1 or v2, and
re-judged here).

**One warning remains:** IR-001 (LOW, carried; v1 IR-008, v2 IR-004). Three
functions still exceed SA-FUNC-003's 30 lines. The coder declined it in the
plan's Notes. It does not block.

**Owner attention, not a finding:** DEC-0238 is open and provisional. It lists
`blocks: [CAP-002-E4-S4, CAP-002-E4-S9]`. If the owner picks a different polling
rule, the hook changes and this story is reworked and reviewed again.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`); the component repo is the project repo |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S4`, ahead of `origin/main` by 6 commits: `58fc558` story-coding, `00c22fd` review v1, `1d3beef` rework 1, `8271eb6` review v2, `db9b691` merge of `origin/main`, `3a159eb` rework 2 |
| HEAD | `3a159eb8d3811205a64d45d45d6b418b8ed6b0e3` ("fix(research): CAP-002-E4-S4 story-coding rework 2", trailer `Decision-Id: DEC-0238` in the last paragraph with `Co-Authored-By`) |
| Review base | `origin/main`, supplied by the driver. `pipeline-state.py review-base --base-ref origin/main` resolves it to `7688c924c554920816b60fd6af60fc81f1164174`, an ancestor of HEAD (`merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files |
| Changed files reviewed | 44 since the review base (35 under the story directory, 9 under `web/src`); 10 of this story's files since the baseline (the v2 report and its mutation JSON, and 8 from `3a159eb`) |
| Baseline | v2, `reviewed_head` `1d3beef81b8a4dfa637ae5fe26aa0864ce1e39d0`, with `CAP-002-E4-S4-implementation-review-v2-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/not-current-banner.tsx` | added (unchanged since v2) | AC-20, DAC-E4-S4-1, DAC-E4-S4-2; T011 |
| `web/src/components/patterns/not-current-banner.test.tsx` | added (unchanged since v2) | TC-COMP-174, TC-COMP-175; T001, T002, T007 |
| `web/src/components/patterns/as-of-line.tsx` | added (unchanged since v2) | AC-21, DAC-E4-S4-1, DAC-E4-S4-3, DAC-E4-S4-4; T012 |
| `web/src/components/patterns/as-of-line.test.tsx` | added; 27 lines added in `3a159eb` | TC-COMP-179, TC-COMP-176; T003, T004, T008; v2 IR-001, IR-003 |
| `web/src/components/patterns/status-badge.tsx` | added (unchanged since v2) | T011, T012; v1 IR-005 (SA-DUP-001); a justified deviation from T014's file list |
| `web/src/screens/research/use-score-set-poll.ts` | added (unchanged since v2) | AC-20, AC-22, DAC-E4-4, DAC-E4-S4-4 to -6; T013; DEC-0233, DEC-0238 |
| `web/src/screens/research/use-score-set-poll.test.ts` | added (unchanged since v2) | TC-COMP-177, TC-COMP-184; T005, T006, T009 |
| `web/src/screens/research/copy.ts` | modified: `SCORE_SET.noReasonRecorded` only (`git diff 7688c92..HEAD`) | T010; DEC-0232 |
| `web/src/screens/research/copy.test.ts` | modified: one anchor only | T010; DEC-0232 |
| `…/stories/CAP-002-E4-S4.md` | modified, `status: planning` → `in-review` | T014 status line |
| `…/stories/CAP-002-E4-S4-tasks.md` | modified: `updated`, `last_reworked_review` → v2, the *Review rework (2026-10-29)* note | T016 bookkeeping; v2 follow-up |
| `…/stories/CAP-002-E4-S4-tdd-evidence.yaml` | added; `rework-2` cycle appended | T016 |
| `…/stories/CAP-002-E4-S4-evidence/` (28 files; `3a159eb` adds `rework-2.patch`, `red-rework-2.log`, `green-rework-2.log`, `full-suite-rework-2.log`, `mutants-rework-2.json`, `mutation-rework-2-results.json`) | added | T016; `check-tdd-evidence.py --require-logs` |
| `…/stories/CAP-002-E4-S4-implementation-review-v1.md`, `-v1-mutation.json`, `-v2.md`, `-v2-mutation.json` | added by review commits `00c22fd` and `8271eb6` | Prior gate reports; not the coder's work |

Outside the component repo, the rework wrote
`projects/factorflow-v2/decisions/DEC-0238.md` in the harness. It is untracked
there at review time and the driver commits it. No other path changed.
`dependencies.yaml` is unchanged. The five new source files are imported only
by each other and their tests (`grep -rlE` over `web/src`). The merge brought
CAP-002-E4-S3's `factor-cell.tsx`, `restated-mark.tsx` and `CELL` strings in
from `origin/main`. They belong to the review base, not this change set.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-20 | SATISFIED | `not-current-banner.tsx:46-69`; `use-score-set-poll.ts:115, 143, 158-160` (the owed read after the terminal report) | `not-current-banner.test.tsx:62-155`; `use-score-set-poll.test.ts:275-383` (2.6 handoff) | Satisfied within the designs' polling model and DEC-0233. The residual handoff timing is the owner's question in DEC-0238; see Follow-Up. |
| AC-21 | SATISFIED | `as-of-line.tsx:59-81` (set sentence, linked start time), `:166-167` (outcome badge) | `as-of-line.test.tsx:100-153, 251-281` | America/Chicago with the zone; no `#`, UUID or `run_id` |
| AC-22 | SATISFIED | `use-score-set-poll.ts:150-156` (read on mount) | `use-score-set-poll.test.ts:213-273` | This story's part only: the hook supplies the never-populated summary from first load. The body is E4-S9's. |
| DAC-E4-2 | SATISFIED | `not-current-banner.tsx:47`, `as-of-line.tsx:153-161` (nothing for `set` null); the hook keeps `later` | `use-score-set-poll.test.ts:246-255, 319-347`; `not-current-banner.test.tsx:158-164` | |
| DAC-E4-4 | SATISFIED | Banner and line as above; `use-score-set-poll.ts:137-147` (one announcement and one `onNewSet` per new `setId`) | `use-score-set-poll.test.ts:129-211, 276-317`; `as-of-line.test.tsx:155-202, 298-359` | The host's reload with preserved state is E4-S6/E4-S9's, run from `onNewSet` |
| DAC-E4-S4-1 | SATISFIED | `not-current-banner.tsx:47-61`; `as-of-line.tsx:106-113` | `not-current-banner.test.tsx:62-97`; `as-of-line.test.tsx:205-231` | |
| DAC-E4-S4-2 | SATISFIED | `not-current-banner.tsx:23-34, 62-64` | `not-current-banner.test.tsx:99-155` | |
| DAC-E4-S4-3 | SATISFIED | `as-of-line.tsx:59-81` | `as-of-line.test.tsx:100-153` | |
| DAC-E4-S4-4 | SATISFIED | `as-of-line.tsx:127-133, 183-194`; `use-score-set-poll.ts:121-130, 158-159` | `as-of-line.test.tsx:155-202`; `use-score-set-poll.test.ts:465-539` | The timer stops until **Try again** (DEC-0155) |
| DAC-E4-S4-5 | SATISFIED | `use-score-set-poll.ts:137-147` | `use-score-set-poll.test.ts:129-211, 563-571` | |
| DAC-E4-S4-6 | SATISFIED | `use-score-set-poll.ts:150-160` | `use-score-set-poll.test.ts:213-273, 319-347` | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `not-current-banner.test.tsx:62-97` | |
| T002 | complete | VERIFIED | `not-current-banner.test.tsx:99-155` | Includes the DEC-0232 `endedAt`-null case |
| T003 | complete | VERIFIED | `as-of-line.test.tsx:100-153` | |
| T004 | complete | VERIFIED | `as-of-line.test.tsx:155-202` | |
| T005 | complete | VERIFIED | `use-score-set-poll.test.ts:129-211` | |
| T006 | complete | VERIFIED | `use-score-set-poll.test.ts:213-383` | Case 3 pins exactly one further read (`:267-271`) |
| T007 | complete | VERIFIED | `not-current-banner.test.tsx:157-215` | The banner body's times stay in the text face, as T007 pins. The plan's Notes record this against UX 1.2 Token Usage. |
| T008 | complete | VERIFIED | `as-of-line.test.tsx:204-409`; the skeleton test `:373-392` | v2's PARTIAL is resolved. The shared token's value is pinned (`:386-387`), and the outcome badges' `text-xs` and the good tier's filled circle are pinned (`:265, 270-281`). |
| T009 | complete | VERIFIED | `use-score-set-poll.test.ts:385-622` | (a)–(h) are present |
| T010 | complete | VERIFIED | `copy.ts:424-430`, `copy.test.ts:485-486`; DEC-0232 | Unchanged since v1 |
| T011 | complete | VERIFIED | `not-current-banner.tsx`; `status-badge.tsx` | |
| T012 | complete | VERIFIED | `as-of-line.tsx` | v2's PARTIAL is resolved. No non-equivalent changed-line mutant survives (TEST-TDD-006). |
| T013 | complete | VERIFIED | `use-score-set-poll.ts:87-163` | Matches T013 and DEC-0233's decision text. DEC-0238 now states the guarantee accurately. |
| T014 | complete | VERIFIED | full suite 950/950; `git diff --name-status 7688c92..HEAD` | Only planned paths, `status-badge.tsx` (v1 IR-005), T016 evidence and the prior reviews. No importer. `render.test.tsx` passes. |
| T015 | complete | VERIFIED | Lint, format, `tsc` and build clean. `index-BMd-gicJ.css` has `.min-h-7{min-height:var(--space-7)}`, `w-fit`, `font-numeric`, the four `status-*-muted` grounds, `text-muted-foreground`, `text-xs`, `animate-pulse` and `bg-secondary`. | |
| T016 | complete | VERIFIED | `CAP-002-E4-S4-tdd-evidence.yaml` `rework-2`; lint 0 errors | `diff_sha256` `c579c108…7bb3` equals the `shasum -a 256` of `rework-2.patch`. The patch's source hunks (`as-of-line.test.tsx`, `-tasks.md`) match `db9b691..3a159eb` line for line. Every cited log and results hash matches its file. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `not-current-banner.test.tsx` / TC-COMP-174 | ADEQUATE | Empty for `later` null; one `status-warning` badge with its triangle; builder sentence plus literals; no controls | none |
| `not-current-banner.test.tsx` / TC-COMP-175 | ADEQUATE | `status-critical` square; exact failed sentence; reason rendered as text; no controls; null-reason clause; `startedAt` fallback | none |
| `as-of-line.test.tsx` / TC-COMP-176 | ADEQUATE | Failure text inside the one `status` region and **Try again** outside it; one call per click; marks kept; the banner beside it kept | none |
| `use-score-set-poll.test.ts` / TC-COMP-177 | ADEQUATE | Exact announcement; `onNewSet` once with B, no re-fire, a separate call for C, none for a set-less read | none |
| `as-of-line.test.tsx` / TC-COMP-179 | ADEQUATE | Exact line text, link name and `href`, no UUID, CST vs CDT, the *sorted by* clause | none |
| `use-score-set-poll.test.ts` / TC-COMP-184 and the 2.6 handoff tests | ADEQUATE | Read on mount; continuation with `set` null; first completion handed over; exactly one further read after the terminal report; the handoff seen as `building` and then completed once; the in-flight case; no owed read when health was already terminal | The tests model the terminal report one full tick before the next read. The tick inside the claim window is the owner's question (DEC-0238), not a test gap. |
| `as-of-line.test.tsx` / T008 details | ADEQUATE | Badges, shapes, tokens, the tooltip, the one region with its contents and order, the announcement boundary, `font-numeric` on both times, the skeleton hidden and sharing the line's token, now with its value `min-h-7` pinned; the good tier as one filled circle with no stroke; the outcome badges' `text-xs` | none. v2's `WEAK` is resolved: `line-height-shared-collapsed`, `line-height-shared-smaller` and the new `line-height-larger` are killed. |
| `use-score-set-poll.test.ts` / T009 (a)–(h) | ADEQUATE | Cadence edges; every terminal and non-terminal state; resume after a stop; bounded `checkedAt`; failure stop and `tryAgain`; unmount; StrictMode; overlap; callback freshness | none |
| `status-badge.tsx` through the banner and line tests | ADEQUATE | Variant prefix, tier grounds, `aria-hidden` shape, title, warning, critical and active shapes; now the good tier's single filled circle and `text-xs` | none. v2's late gap is closed: `good-shape-hollow` and `badge-text-size` are killed. |
| `copy.test.ts` anchor | ADEQUATE | `noReasonRecorded` literal | none |

**Determinism and isolation.** Every hook test uses fake timers with
`shouldAdvanceTime` and a fixed system time. `checkedAt` is bounded, not exact.
The client and `useHealth` are module-mocked and reset in `beforeEach`. The
component tests render inside `MemoryRouter` and need no network. The focused
suites passed in all 6 mutation baselines and in both full runs.

**The rework's own RED.** The new assertions pass on the shipped code by
construction, because the code already carried `min-h-7`, the filled circle
and `text-xs`. `red-rework-2.log` shows the RED with the three reviewer mutants
applied: 4 failed and 20 passed, including `expected 'min-h-5' to be
'min-h-7'`. That is the TEST-TDD-006 shape for a survivor-killing rework.

**Mutation run.** `mutation-run.py generate` ran over `7688c92..3a159eb` and
produced 25 mutants (`negate-boolean` 23, `off-by-one` 2). This reviewer added
11 (`manual:review-v3:*`). `scope --since 1d3beef --previous` the v2 results
re-added 105 baseline mutants, and none of the baseline's mutants failed to
apply. That made 141 mutants: 128 carried and 13 late (this reviewer's 11, plus
the two DEC-0234 mutants, which keep their persisted `late` tag). No mutant is
delta, because no production line changed since the baseline. `run` executed
the four focused files in 6 clones, and all six baselines passed. 137 were
killed and 4 survived:

| Survivor | Scope | Equivalent? | Disposition |
|----------|-------|-------------|-------------|
| `use-score-set-poll.ts:98:negate-boolean:1` (`readWhileDownloading` starts `true`) | carried | Yes | Re-derived here. The value is read only until the mount read settles. Until then, `summary` is null, so `polling` is `!pollFailed` in both versions, and any tick returns at the in-flight guard (`:110-112`). After the read lands, `setReadWhileDownloading(issuedWhileDownloading)` overwrites it (`:143`). A rejected read sets `pollFailed`, which stops the timer. The only observable difference is the cadence's phase, by the mount read's latency. Classification-ui 2.3 and 2.6, UX design 1.2 Polling and STD-UI-25 fix a 10-second cadence and a stop rule, not the phase. |
| `use-score-set-poll.ts:102:negate-boolean:1` and `:60:negate-boolean:1` (`mountedRef` starts `false`; same line, v1 and v2 ids) | carried | Yes | The mount effect sets the ref to `true` synchronously (`:151`) before `void read()`, and every reader runs after an `await`. No observable difference. |
| `manual:review-v2:undefined-class-kept` (drop `.filter(Boolean)`) | carried | Yes | `Array.prototype.join` renders `undefined` as an empty string. The class attribute gains one extra space, and its class list is identical. |

Every other mutant was killed. That includes all of v2's: the further-read
contract (never or always owed, judged on landing, ignored, never cleared), the
frozen `downloadingRef`, the one-shot interval, the timer that ignores
`active`, tooltip and numeric-face losses, the shapes, and the shared height.
This reviewer's 11 cover: the shared height enlarged (`min-h-9`), the good tier
as a ringed dot or a square, the announcement naming the set's start instead of
its end, the banner's produced time from the set's start, *Partial* drawn
critical, the failed banner drawn as a warning, the line in `text-sm`,
`most_recent_run` null read as downloading, a failed poll that keeps the timer,
and the badge shape dropped. All 11 were killed. The persisted
`-v3-mutation.json` is the run's results file, unmodified.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All rows PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `7688c924c554920816b60fd6af60fc81f1164174` |
| `npx vitest run web/src/components/patterns/not-current-banner.test.tsx web/src/components/patterns/as-of-line.test.tsx web/src/screens/research/use-score-set-poll.test.ts web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 4 files, 377 tests (16 + 24 + 33 + 304) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 50 files, 950 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 117 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 117 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules. `index-BMd-gicJ.css` carries `.min-h-7{min-height:var(--space-7)}` and every class T015 lists. |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7688c924c554920816b60fd6af60fc81f1164174 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7688c924c554920816b60fd6af60fc81f1164174..HEAD --cycle review --out <tmp>/mutants-generated.json`, plus 11 manual mutants | harness root | 0 | PASS | 25 generated across the four production files |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <tmp>/mutants-all.json --since 1d3beef81b8a4dfa637ae5fe26aa0864ce1e39d0 --previous …/CAP-002-E4-S4-implementation-review-v2-mutation.json --out <tmp>/mutants.json` | harness root | 0 | PASS | 141 mutants: carried 128, late 13; 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <tmp>/mutants.json --jobs 6 --command '<link node_modules>; ./node_modules/.bin/vitest run <the four focused files>' --out <tmp>/results.json --logs <tmp>/results-logs --work-root <tmp>/work` | harness root | 3 | PASS (gate) | 137 killed, 4 survived; all four are equivalent (see the table above), so no test is `WEAK`. Exit 3 is the tool's code for surviving mutants. Results sha256 `89204992f44cb5da72d55c0303b0e34b6249a29cb3720dea04cba7beeb7906ce`, persisted unmodified as `-v3-mutation.json`. |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:8dc1ea3f…f9f3` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | `sha256:15542d3c…8acf` |
| `scripts/sdd decisions show --project factorflow-v2 DEC-0238` | harness root | 0 | PASS | `contained open`, `blocks CAP-002-E4-S4, CAP-002-E4-S9`, one commit carrying the trailer: `3a159eb8d` |
| `npm run test:e2e` | — | N/A | NOT RUN | Not in the story's validation list, and the plan says it is not run. No screen mounts these components yet; E4-S9 is their first importer. |
| `uv run …` (the Python commands in the tech-stack table) | — | N/A | NOT RUN | No Python file is in the change set |

The Gate Summary counts seven required validations: test, lint, format, `tsc`,
build, the TDD-evidence lint and the mutation gate. All seven passed. Every
command ran inside the sandbox.

### Validation Side Effects

- Before: `git status` clean at `3a159eb`. The ignored `node_modules/` and
  `src/factorflow/api/static/` build output were present.
- After: `git status` clean at `3a159eb`. `npm run test` (its build-output
  test) and `npm run build` added ignored, hash-named assets under
  `src/factorflow/api/static/assets/` (`index-BMd-gicJ.css`,
  `index-kmD81Xs9.js`, `index-LvcbVC8n.js`), as `tech-stack.md` records.
  Mutation clones, logs and results live in the sandbox temp directory,
  outside the component repository. This review then wrote only its report and
  `-v3-mutation.json`.
- Unexpected tracked-file changes: none

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | LOW | carried | The hook, the line and its live region still exceed SA-FUNC-003's function length |

### IR-001 — The hook, the line and its live region still exceed SA-FUNC-003's function length

- **Severity**: LOW
- **Scope**: carried (v1 IR-008, v2 IR-004)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T013
- **Files**:
  - `web/src/screens/research/use-score-set-poll.ts:87-163` (`useScoreSetPoll`, about 54 counted lines)
  - `web/src/components/patterns/as-of-line.tsx:142-197` (`AsOfLine`, about 50)
  - `web/src/components/patterns/as-of-line.tsx:83-136` (`LiveRegion`, about 43)
  - These are reviewer counts of non-blank, non-comment, non-closing lines. The
    files are unchanged since v2.
- **Claim challenged**: The plan's *Review rework (2026-10-29)* note declines
  the split. It cites the delivered `useHealthPolling` precedent and calls a
  split churn with no behaviour change.
- **Observed evidence**: The three bodies are still over 30 executable lines.
  The decline is recorded, not hidden.
- **Expected evidence/behavior**: SA-FUNC-003 allows 30 lines of executable
  code per function.
- **Impact**: The functions are harder to change separately. There is no
  behaviour risk.
- **Required remediation**: Optional. Split when the code is next changed, for
  example on the owner's DEC-0238 answer.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 | RESOLVED | `as-of-line.test.tsx:50-55` (`LINE_HEIGHT = "min-h-7"`), `:386-387` (value pinned on the line and the skeleton), with the equality at `:382` kept. In this review's run, the carried `manual:review-v2:line-height-shared-collapsed` and `-smaller` are killed, and so is the new `manual:review-v3:line-height-larger`. The `rework-2` evidence supersedes `rework-1`'s equivalence claim, and the plan's Notes say so. |
| v2/IR-002 | RESOLVED | `projects/factorflow-v2/decisions/DEC-0238.md` (harness; untracked at review time, for the driver to commit). It restates the guarantee as "0 to 10 s" after the report, landing after the claim only when the remainder exceeds the claim's delay. It names both exposures (the tick inside the 5-second claim window, and a download shorter than one 30-second health interval), and offers three candidate rules. `owner_reviewed: false`, `status: open`. The polling rule is unchanged, as v2 required, until the owner answers. DEC-0233's decision text stands, and its derivation is corrected by reference rather than edited. The residual exposure is the owner's to decide, not a defect for this gate. |
| v2/IR-003 | RESOLVED | `as-of-line.test.tsx:265` (`text-xs` on the outcome badges), `:270-281` (one `circle` with `fill="currentColor"` and no `stroke`). The late `manual:review-v2:good-shape-hollow` and `badge-text-size` are killed, and so are the new `good-shape-ringed-dot` and `good-shape-square`. |
| v2/IR-004 | STILL OPEN | v3/IR-001 (LOW, carried); the decline is recorded in the plan's Notes |

## Scope and Plan Deviations

- **Justified deviations** (unchanged since v2):
  - `web/src/components/patterns/status-badge.tsx` is a new file that is not
    in T014's file list. It is v1 IR-005's remediation, and the plan's Notes
    record it.
  - `status-badge.tsx` imports `TIER_CLASSES` from a screen module
    (`screens/runs/outcome-badge.tsx`), as the hook already imports
    `isNonTerminalRunState` from there. Moving the map would edit a delivered
    file outside CAP-002's edit set (DEC-0084).
  - Four helpers were extracted from the hook (v1 IR-008, optional).
- **Bookkeeping**:
  - All 16 tasks are checked, and all 16 are VERIFIED on current evidence.
  - The `rework-2` cycle's `commit_hash: stage` names the stage commit
    `3a159eb`, which carries the evidence file.
  - The plan's rework note says the merge "touches no `SCORE_SET` export and no
    file of this story", while listing the `CELL` additions to `copy.ts`. The
    first half holds: `git diff 7688c92..HEAD -- web/src/screens/research/copy.ts`
    is the one `noReasonRecorded` hunk, so the merge resolution is clean. The
    second half is loose wording, because `copy.ts` is a file this story
    modifies. No action is needed.
  - DEC-0238 is untracked in the harness worktree at review time, and the
    trailer that cites it is already committed in the component repo. It needs
    to land with this stage's records.
- **Context for E4-S9 (not a finding)**: v2 measured in Chromium that the
  one-row line's content is 28 px under a 48 px `min-h-7` floor. It also found
  that at 800 px, or at 1000 px while a set builds, the line wraps to 52 or
  54 px, which no fixed skeleton matches. The production code is unchanged since
  that measurement. The host's width, which E4-S9 owns, decides whether the
  wrapped case occurs.
- **Out-of-scope changes**: None.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run doc sync for
  `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md`
  against this report.
  - Commit DEC-0238 with this stage's records.
  - DEC-0238 (and DEC-0233, DEC-0232) await the owner. If the owner chooses a
    different handoff rule (a cadence restarted at the terminal report, or a
    bounded number of further ticks), `use-score-set-poll.ts` changes. This
    story then returns to coding and to this review, and so does E4-S9, which
    the record lists.
  - The next review's baseline would be this report: `reviewed_head`
    `3a159eb8d3811205a64d45d45d6b418b8ed6b0e3`, mutation results
    `CAP-002-E4-S4-implementation-review-v3-mutation.json`.
  - This review records no new decision.
- **Warnings accepted downstream**: IR-001 (LOW)
