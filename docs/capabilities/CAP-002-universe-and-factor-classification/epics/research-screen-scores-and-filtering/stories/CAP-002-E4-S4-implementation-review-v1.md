---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E4-S4"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-29T04:20:27Z"
reviewed_head: "58fc55865f9c7907cd630c4becd3e5b4c9f7c6ff"
review_base: "7b4b5f5b4b1148cb810c3364e429348fab532d9e"
reviewed_state_revision: "sha256:ce85d21e5c99fae795d8a21f34c5e85a0e77c90c381ab15e4189cee47f477bc5"
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
  timestamp: 2026-10-29T04:20:27Z
  source_artifacts:
    - id: CAP-002-E4-S4
      version: "1 (sha256:8dc1ea3f7eab21af2983d77ae74a89396d4f0f0ebcb8c710160a9990f04af9f3)"
    - id: CAP-002-E4-S4-tasks
      version: "1 (updated 2026-10-18; checkboxes and T010 note 2026-10-28)"
    - id: CAP-002-E4-S4-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-scheduler
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0062
      version: "upheld 2026-10-17"
    - id: DEC-0082
      version: "upheld 2026-10-17"
    - id: DEC-0153
      version: "upheld 2026-10-18, E4-F27 amendment"
    - id: DEC-0154
      version: "upheld 2026-10-18, E4-F27 and E4-F28 amendments"
    - id: DEC-0155
      version: "upheld 2026-10-18, E4-F13 amendment"
    - id: DEC-0232
      version: "provisional, open, owner_reviewed false"
    - id: ui-conventions
      version: "STD-UI-2, STD-UI-5, STD-UI-8, STD-UI-24, STD-UI-25"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 2 |
| Low findings | 3 |
| Acceptance criteria | 7/11 satisfied |
| Planned tasks | 11/16 verified |
| Required validation | 6/7 passed |

This is the initial review of commit `58fc558` against `origin/main` (`7b4b5f5`).
Every finding has scope `initial`.

**Stage 1, spec compliance.** The banner, the as-of line and the hook implement
the planned props and strings. The full web suite passes: 838 tests in 48 files.
Lint, format, `tsc`, build and the TDD-evidence lint are clean. One behaviour
gap blocks the gate:

- **IR-001** (HIGH): `useScoreSetPoll` stops the moment the shell's health
  reports the download terminal, with no further read. The plan's T006 says it
  stops "after one further read". Classification-ui 2.6 draws the handoff as a
  read after that report: health reports terminal, `later` is not yet building,
  and the next 10-second poll returns `building`. The test for this case accepts
  both behaviours. A reviewer probe drove the handoff: once health turned
  terminal before a read had seen the scheduler's claim, the hook never read
  again. Over 20 simulated minutes it missed both the building set and the
  completion, populated or never-populated. AC-20, DAC-E4-2, DAC-E4-4 and
  DAC-E4-S4-6 are therefore PARTIAL.

**Mutation.** This review ran 96 mutants: 20 generated, 10 written by the
reviewer and the coder's 66 hand-written ones re-run. 91 were killed and 5
survived:

- 1 is equivalent: the initial value of `mountedRef`.
- 4 are not equivalent, and each makes the test that should kill it `WEAK`:
  - **IR-002** (HIGH): the banner's DEC-0232 fallback, which names `startedAt`
    when a failed set's `endedAt` is null, is not pinned. Two survivors.
  - **IR-003** (HIGH): the as-of line's skeleton height is not pinned to the
    line's final height, and the checked time's numeric face is not pinned. Two
    survivors.

**Stage 2, code quality** (warnings, non-blocking):

- **IR-004** (MEDIUM): the completion announcement runs into the text before it
  with no separator. Probe output: *sorted by valueScores updated to…*.
- **IR-005** (MEDIUM): the badge tier class map and the SVG shape wrapper are
  duplicated (SA-DUP-001).
- **IR-006** (LOW): two UX design 1.2 details were not carried into the code:
  the *Updating* tooltip and `--font-numeric` on the other times.
- **IR-007** (LOW): an exact `checkedAt` literal depends on real elapsed time,
  which is a latent flake.
- **IR-008** (LOW): the hook and the line exceed SA-FUNC-003's function length.

**By severity:** CRITICAL 0 · HIGH 3 · MEDIUM 2 · LOW 3 · **total 8**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`); component repo = project repo |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S4` (ahead of `origin/main` by 1 commit) |
| HEAD | `58fc55865f9c7907cd630c4becd3e5b4c9f7c6ff` ("feat(research): CAP-002-E4-S4 story-coding") |
| Review base | `origin/main` (supplied by the driver), resolved by `pipeline-state.py review-base --base-ref origin/main` to `7b4b5f5b4b1148cb810c3364e429348fab532d9e`, an ancestor of HEAD |
| Working tree | clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 27 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/not-current-banner.tsx` | added | AC-20, DAC-E4-S4-1, DAC-E4-S4-2; T011 |
| `web/src/components/patterns/not-current-banner.test.tsx` | added | TC-COMP-174, TC-COMP-175; T001, T002, T007 |
| `web/src/components/patterns/as-of-line.tsx` | added | AC-21, DAC-E4-S4-1, DAC-E4-S4-3, DAC-E4-S4-4; T012 |
| `web/src/components/patterns/as-of-line.test.tsx` | added | TC-COMP-179, TC-COMP-176; T003, T004, T008 |
| `web/src/screens/research/use-score-set-poll.ts` | added | AC-20, AC-22, DAC-E4-4, DAC-E4-S4-4 to -6; T013 |
| `web/src/screens/research/use-score-set-poll.test.ts` | added | TC-COMP-177, TC-COMP-184; T005, T006, T009 |
| `web/src/screens/research/copy.ts` | modified (+7: `SCORE_SET.noReasonRecorded`) | T010; DEC-0232 |
| `web/src/screens/research/copy.test.ts` | modified (+2: one anchor) | T010; DEC-0232 |
| `…/stories/CAP-002-E4-S4.md` | modified (`status: planning` → `in-review`) | T014 (status line) |
| `…/stories/CAP-002-E4-S4-tasks.md` | modified (16 checkboxes, T010 note) | T010, T016 bookkeeping |
| `…/stories/CAP-002-E4-S4-tdd-evidence.yaml` | added | T016 |
| `…/stories/CAP-002-E4-S4-evidence/` (16 files: 3 cycle patches, 3 red logs, 3 green logs, full-suite log, 3 mutant files, 3 mutation results) | added | T016; `check-tdd-evidence.py --require-logs` |

`git diff --name-status 7b4b5f5..HEAD` lists no other path. `dependencies.yaml`
is unchanged. No delivered production file changed except the one
`copy.ts` export, and nothing imports the three new files (`grep` over
`web/src`).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-20 | PARTIAL | `not-current-banner.tsx:73-103` (warning and critical banners, previous set kept, reason verbatim); `use-score-set-poll.ts:121-137` (continuation) | `not-current-banner.test.tsx:72-142`; `use-score-set-poll.test.ts:128-210` | The marking is right whenever the hook holds a `later` block. The hook can lose the building set at the download handoff, though (IR-001). The screen then shows the previous set unmarked while a newer one builds. |
| AC-21 | SATISFIED | `as-of-line.tsx:86-105` (set sentence, start time linked to `SHELL_ROUTES.download(runId)`, accessible name), `:178-182` (outcome badge) | `as-of-line.test.tsx:83-136` | America/Chicago with zone, CST/CDT by instant, no `#`/UUID/`run_id` |
| AC-22 | SATISFIED | `use-score-set-poll.ts:113-119` (read on mount); the summary keeps `neverClassified`/`later` for E4-S9's body | `use-score-set-poll.test.ts:214-254` | S4's part only: the hook supplies the never-populated summary from first load. The *No stocks have been scored yet.* body is E4-S9's (DAC-E4-S9-1). |
| DAC-E4-2 | PARTIAL | `not-current-banner.tsx:74`, `as-of-line.tsx:169-177` (render nothing for `set` null); hook keeps `later` | `not-current-banner.test.tsx:146-152`; `as-of-line.test.tsx:317-321`; `use-score-set-poll.test.ts:245-254` | The first set's *Updating* comes from the hook's `later` block. If the first download ends and health turns terminal before a read sees the claim, the hook never reads `later: building` (IR-001). |
| DAC-E4-4 | PARTIAL | banner and line as above; `use-score-set-poll.ts:96-110` (one announcement and `onNewSet` per new `setId`) | `use-score-set-poll.test.ts:128-210`; `as-of-line.test.tsx:138-185` | Building, failed and once-only refresh are correct for every sequence the tests drive. The completion is never seen when the hook stopped at the handoff (IR-001). |
| DAC-E4-S4-1 | SATISFIED | `not-current-banner.tsx:74-91`; `as-of-line.tsx:124-129` | `not-current-banner.test.tsx:62-97`; `as-of-line.test.tsx:188-216` | `status-warning` badge with triangle, *Updating* `status-active` ringed dot on the line |
| DAC-E4-S4-2 | SATISFIED | `not-current-banner.tsx:56-60, 92-100` | `not-current-banner.test.tsx:99-143` | Reason verbatim as text, no button or link. DEC-0232's `endedAt`-null branch is untested (IR-002). |
| DAC-E4-S4-3 | SATISFIED | `as-of-line.tsx:86-105` | `as-of-line.test.tsx:85-125` | |
| DAC-E4-S4-4 | SATISFIED | `as-of-line.tsx:143-149, 198-209`; `use-score-set-poll.ts:80-89, 122-125` | `as-of-line.test.tsx:140-184`; `use-score-set-poll.test.ts:337-411` | Failure text inside the region, **Try again** outside it; the timer stops until `tryAgain` (DEC-0155) |
| DAC-E4-S4-5 | SATISFIED | `use-score-set-poll.ts:96-110` | `use-score-set-poll.test.ts:130-209, 435-443` | One announcement and one `onNewSet` per new set, none for a repeat, StrictMode included |
| DAC-E4-S4-6 | PARTIAL | `use-score-set-poll.ts:113-137` | `use-score-set-poll.test.ts:214-271` | Polls from first load and hands the first completion to `onNewSet` when a read sees it. The first completion is lost when the hook stopped at the download handoff (IR-001), and case 3 accepts the stop. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `not-current-banner.test.tsx:62-97` | Imports the copy builder and asserts both literal phrases |
| T002 | complete | VERIFIED | `not-current-banner.test.tsx:99-143` | `<b>x</b>` as text; null reason renders `SCORE_SET.noReasonRecorded` |
| T003 | complete | VERIFIED | `as-of-line.test.tsx:83-136` | |
| T004 | complete | VERIFIED | `as-of-line.test.tsx:138-185` | |
| T005 | complete | VERIFIED | `use-score-set-poll.test.ts:128-210` | |
| T006 | complete | PARTIAL | `use-score-set-poll.test.ts:212-271` | Case 3 says polling "stops after `useHealth` is changed to return `succeeded` and a rerender (after one further read)". The test accepts `settled <= 4` (`:268`), so no further read passes. The hook performs none (IR-001). |
| T007 | complete | VERIFIED | `not-current-banner.test.tsx:145-201` | |
| T008 | complete | PARTIAL | `as-of-line.test.tsx:187-346` | The skeleton "of the line's final height" is asserted only as some `h-<digit>` class (`:327`). A collapsed `h-1` skeleton survives (IR-003). |
| T009 | complete | VERIFIED | `use-score-set-poll.test.ts:274-494` | (a)–(h) present. (c) pins an exact instant under `shouldAdvanceTime` (IR-007). |
| T010 | complete | VERIFIED | `copy.ts:391-397`, `copy.test.ts:479-480`; tasks Notes "T010 addition"; DEC-0232 | One export added, none changed |
| T011 | complete | PARTIAL | `not-current-banner.tsx` | The production code matches the plan. Its DEC-0232 `endedAt ?? startedAt` line (`:58`) has two non-equivalent survivors, and TEST-TDD-006 forbids completion while a changed-line mutant survives (IR-002). |
| T012 | complete | PARTIAL | `as-of-line.tsx` | Props, region contents, order, `aria-atomic="false"` as planned. The implicit `output` status role is a recorded, justified deviation. The skeleton height (`:174`) and checked-time face (`:187`) have non-equivalent survivors (IR-003). The announcement is glued to the preceding text (IR-004). |
| T013 | complete | PARTIAL | `use-score-set-poll.ts` | Matches T013's interface, cadence, ref and failure rules. It cannot meet T006 case 3's further read or classification-ui 2.6's handoff read (IR-001). Three effects instead of "one `useEffect`" is behaviour-equivalent and justified. |
| T014 | complete | VERIFIED | full suite 838/838; `git diff --name-status` | Only planned paths plus T016 evidence; no importer; `render.test.tsx` passes |
| T015 | complete | VERIFIED | lint/format/tsc/build clean; built CSS `index-BnbswK68.css` carries each listed class | Doc comments name the DACs |
| T016 | complete | VERIFIED | `CAP-002-E4-S4-tdd-evidence.yaml`; lint 0 errors | Three cycles with verdicts, `diff_sha256`, `commit_hash: stage` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `not-current-banner.test.tsx` / TC-COMP-174 | ADEQUATE | Empty container for `later` null, one `status-warning` badge with closed triangle, the building sentence from the builder plus literals, no button/link | none |
| `not-current-banner.test.tsx` / TC-COMP-175 (with T007) | WEAK | `status-critical` square, exact failed sentence, reason as text, no controls, null reason clause | No case has a failed `later` with `endedAt: null`. Both DEC-0232 fallback mutants survive (IR-002). |
| `as-of-line.test.tsx` / TC-COMP-176 | ADEQUATE | Failure text inside the one `status` region, **Try again** outside it, one call per click, every mark kept, banner beside it kept | none |
| `use-score-set-poll.test.ts` / TC-COMP-177 | ADEQUATE | Exact announcement, `onNewSet` once with B, no re-fire on repeated B, separate C, no fire for a set-less read | none |
| `as-of-line.test.tsx` / TC-COMP-179 | ADEQUATE | Exact line text, link name and `href`, no UUID/`#`, CST vs CDT, sorted-by clause | none |
| `use-score-set-poll.test.ts` / TC-COMP-184 | WEAK | Read on mount before timers, 10-second continuation with `set` null, first completion handed over, failed first set stops | Case 3 (`:257-271`) does not pin the plan's further read after health turns terminal (accepts 3 or 4). No test models the design 2.6 handoff, where health reports terminal before `later` builds (IR-001). |
| `as-of-line.test.tsx` / T008 details | WEAK | Badges, shapes, tokens, one region, region contents and order, skeleton present and hidden | Skeleton height only matches `/\bh-\d\b/`. The checked time's `font-numeric` is not asserted. Both survive mutation (IR-003). |
| `use-score-set-poll.test.ts` / T009 (a)–(h) | ADEQUATE | Cadence edges, all terminal/non-terminal states, `checkedAt` shape and advance, failure stop and `tryAgain`, unmount, StrictMode, overlap, callback freshness | (c) exact literal under `shouldAdvanceTime` (IR-007, LOW) |
| `copy.test.ts` anchor | ADEQUATE | `noReasonRecorded` literal pinned | none |

**Mutation run** (`mutation-run.py`, command runs the four focused files in
each clone). 96 mutants ran: 20 generated (`negate-boolean` 19, `off-by-one` 1),
10 reviewer manual and 66 coder manual re-run under cycle `review`. All six
baselines passed. 91 were killed and 5 survived:

| Survivor | Equivalent? | Disposition |
|----------|-------------|-------------|
| `use-score-set-poll.ts:60:negate-boolean:1` (`useRef(true)` → `useRef(false)`) | Yes | The mount effect sets `mountedRef.current = true` (`:114`) synchronously, before the first `await` in `read` can settle, and every reader runs after an `await`. `tryAgain` exists only after commit. No sequence observes the initial value. |
| `manual:review:ended-at-null-no-fallback` (`?? later.startedAt` → `?? ""`) | No | DEC-0232: "When a failed later carries endedAt null the banner names the attempt's startedAt instead" (IR-002) |
| `manual:review:ended-at-null-names-set-end` (`?? later.startedAt` → `?? set.endedAt`) | No | Same DEC-0232 sentence (IR-002) |
| `manual:review:skeleton-height-collapsed` (`h-7` → `h-1`) | No | UX design 1.2 States, Loading: "skeleton at final height so the table beneath does not shift"; DEC-0154 (IR-003) |
| `manual:review:checked-span-not-numeric` (drop `font-numeric` on *checked {time}*) | No | UX design 1.2 Token Usage: "`--font-numeric` for dates, times and counts" (`ux-design.md:805`) (IR-003) |

The coder's 66 manual mutants were all killed again, which corroborates the
evidence file's cycle results.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All rows PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | PASS | `READY` |
| `npx vitest run src/components/patterns/not-current-banner.test.tsx src/components/patterns/as-of-line.test.tsx src/screens/research/use-score-set-poll.test.ts src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 4 files, 363 tests (15 + 22 + 28 + 298) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 48 files, 838 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 112 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome check, 112 files |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | no output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules. `index-BnbswK68.css` contains `bg-status-warning-muted`, `bg-status-critical-muted`, `bg-status-active-muted`, `bg-status-good-muted`, `text-muted-foreground`, `font-numeric`, `animate-pulse`, `h-7` and `w-fit`. |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S4-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7b4b5f5b4b1148cb810c3364e429348fab532d9e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7b4b5f5..HEAD --cycle review --out <scratch>/mutants.json`, then 76 manual mutants appended | harness root | 0 | PASS | 20 generated across the three production files |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 6 --command '<link node_modules>; ./node_modules/.bin/vitest run <the four focused files>' --out <scratch>/results.json` | harness root | 0 | FAIL (gate) | 96 run: 91 killed, 5 survived, 4 of them not equivalent. Results sha256 `5dbadd17ed45cc7545a59f48847983819d77aedc5b40a559159cdb3c11f79409`, copied beside this report as `-v1-mutation.json`. |
| Reviewer probe `zz-review-probe.test.tsx` in a scratch clone of `58fc558`, outside the review subject: `./node_modules/.bin/vitest run src/screens/research/zz-review-probe.test.tsx` | scratch clone `…/scratchpad/ar-s4-review/probe` | 0 | Evidence | Handoff, populated: `{"readsBeforeEnd":2,"readsAfter":2,"later":null,"setId":"A","onNewSetCalls":0}` after 20 simulated minutes. Never-populated: `{"reads":2,"set":null,"later":null,"onNewSetCalls":0}`. Line text: `"… Complete · sorted by valueScores updated to …"` and `"… checked 2026-10-15 17:52:10 CDTScores updated to … Updating"`. |
| `npm run test:e2e` | — | N/A | NOT RUN | Not in the story's validation list. The plan excludes it because no screen mounts these components yet; E4-S9 is their first importer. |
| `uv run …` (Python commands in the tech-stack table) | — | N/A | NOT RUN | No Python file is in the change set |

Required validation counted in the Gate Summary: test, lint, format, `tsc`,
build, the TDD-evidence lint and the mutation gate. Six passed; the mutation
gate failed. Every command ran inside the sandbox. None needed it disabled.

### Validation Side Effects

- Before: `git status` clean. Ignored `node_modules/` and the ignored build
  output under `src/factorflow/api/static/` were present.
- After: `git status` clean. `npm run test` (its build-output test) and
  `npm run build` rewrote the ignored `src/factorflow/api/static/` assets
  (`index-BnbswK68.css`, `index-Ci01p2ir.js`, `index-Di47D7-V.js`). This is
  expected; `tech-stack.md` records it. Mutation clones and the probe clone live
  outside the component repository.
- Unexpected tracked-file changes: none

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | The poll stops on the health report that a download ended, without the further read that sees the building set |
| IR-002 | HIGH | initial | Banner tests do not pin DEC-0232's start-time fallback for a failed set with no end time |
| IR-003 | HIGH | initial | As-of line tests do not pin the skeleton's final height or the checked time's numeric face |
| IR-004 | MEDIUM | initial | The completion announcement runs into the text before it |
| IR-005 | MEDIUM | initial | Badge tier classes and the SVG shape wrapper are duplicated |
| IR-006 | LOW | initial | UX design 1.2 details missing from the plan and the code: the Updating tooltip and the numeric face on the line's other times |
| IR-007 | LOW | initial | An exact `checkedAt` literal depends on real elapsed time |
| IR-008 | LOW | initial | The hook and the line exceed SA-FUNC-003's function length |

### IR-001 — The poll stops on the health report that a download ended, without the further read that sees the building set

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-20, DAC-E4-2, DAC-E4-4, DAC-E4-S4-6
- **Tasks**: T006, T013
- **Files**: `web/src/screens/research/use-score-set-poll.ts:121-137` (`polling`, interval effect); `web/src/screens/research/use-score-set-poll.test.ts:257-271` (TC-COMP-184 case 3, `expect(settled).toBeLessThanOrEqual(4)` at `:268`)
- **Claim challenged**: T006 is complete and DAC-E4-S4-6 is covered. The hook
  "stops after `useHealth` is changed to return `succeeded` and a rerender
  (after one further read)", and polling from first load lets the
  never-populated screen learn of the first set without a reload.
- **Observed evidence**:
  - `polling` is recomputed on every render as `!pollFailed && (later.state === "building" || most_recent_run non-terminal)`.
  - The render in which health turns terminal flips it to false. The interval
    effect's cleanup clears the timer, and no read is issued. Any `later` block
    the scheduler has claimed since the previous read is never fetched.
  - The case 3 test accepts that zero further reads happen.
  - The reviewer probe reproduced this. Health was running, the last read showed
    `later: null`, and the mock was then switched to return `later: building`
    and later the completed set. Health turned terminal 7 seconds after a read.
  - Over 20 simulated minutes no read followed: `readsAfter` 2, `later` null,
    `onNewSet` 0. The never-populated store gave the same result: `set` null
    throughout, `onNewSet` 0.
- **Expected evidence/behavior**:
  - T006 case 3 says polling stops "(after one further read)".
  - Classification-ui 2.6's sequence (`component-design-classification-ui.md:648`)
    shows "health poll reports most_recent_run terminal; later not yet
    building", then a 10-second summary poll that returns
    `later {state: building}`.
  - The scheduler claims the set within one 5-second poll of the run ending
    (`component-design-classification-scheduler.md:207, 317-318`). The shell's
    health poll runs every 30 seconds (`status-region.tsx:29`). So the terminal
    report routinely arrives before any 10-second read has seen the claim.
  - DEC-0082 exists so that the never-populated screen "learns that the first
    set completed or failed without a reload" (UX design 1.2 Polling).
- **Impact**:
  - An open scored screen can miss the whole later set. It keeps showing the
    previous set with no *Not reflecting the latest download* banner and no
    *Updating* while a newer set builds, and it never refreshes when that set
    completes (AC-20, DAC-E4-4).
  - On a never-populated store the first set never appears without a reload
    (DAC-E4-2, DAC-E4-S4-6).
  - That is the stale-or-half-built-unknowingly outcome the story exists to
    prevent.
  - The miss happens whenever no 10-second read lands between the scheduler's
    claim and the health report. Under the designs' cadences (10 s summary,
    30 s health, claim within 5 s), and assuming uniform phases, that is
    roughly one handoff in four. That figure is a reviewer estimate.
  - The probe shows the defect is deterministic once that ordering occurs.
  - Even one further read misses a claim that lands after the health report.
    Whether the hook must keep polling until it observes the ended run's set
    is a reliability question the designs do not settle. It is surfaced here
    for the owner (AGT-SPEC-002), not decided.
- **Required remediation**:
  - After the shell's health reports the download terminal, the hook must
    perform at least the further read that T006 case 3 and classification-ui
    2.6 prescribe, so the handoff reaches `later: building` and then the
    completion.
  - Case 3 must pin that read: no longer accept 3 or 4.
  - A test must drive the design 2.6 handoff: health terminal before `later`
    builds, the next read returns `building`, then the completion. It must
    assert the banner input and exactly one `onNewSet`.
  - If the fix goes beyond one read, for example polling until the ended run's
    set is observed, record the choice as a decision.

### IR-002 — Banner tests do not pin DEC-0232's start-time fallback for a failed set with no end time

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S4-2 (test adequacy)
- **Tasks**: T002, T007, T010, T011
- **Files**: `web/src/components/patterns/not-current-banner.tsx:58` (`formatTimestamp(later.endedAt ?? later.startedAt)`); `web/src/components/patterns/not-current-banner.test.tsx:35-40, 99-143` (every failed fixture has `endedAt` set)
- **Claim challenged**: The cycle-1 evidence says mutation found 18 of 18
  killed and the banner tests cover the DEC-0232 behaviour.
- **Observed evidence**: Two reviewer mutants of line 58 survive the focused
  suites:
  - `?? later.startedAt` → `?? ""` makes the banner throw for a failed set with
    `endedAt: null`.
  - `?? later.startedAt` → `?? set.endedAt` names the wrong time.

  No test renders a failed `later` with `endedAt: null`. The coder's spec-drift
  review flagged this too ("the endedAt-null fallback of DEC-0232 has no test").
- **Expected evidence/behavior**: DEC-0232 says "When a failed later carries
  endedAt null the banner names the attempt's startedAt instead". Under
  TEST-TDD-006, no non-equivalent changed-line mutant may survive.
- **Impact**: The fallback the decision specifies can regress, to a crash of the
  results region or a misdated failure, with every test green. DEC-0232 says
  the branch is unreachable on the delivered wire. That goes under Impact and
  does not lower severity.
- **Required remediation**: Add a banner test for a failed `later` with
  `endedAt: null` that asserts the failure sentence names
  `formatTimestamp(later.startedAt)`. Both survivors must then be killed.

### IR-003 — As-of line tests do not pin the skeleton's final height or the checked time's numeric face

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S4-1 (test adequacy); UX design 1.2 States (Loading) and Token Usage
- **Tasks**: T008, T012
- **Files**: `web/src/components/patterns/as-of-line.tsx:174` (`h-7 …` skeleton), `:187` (`<span className="font-numeric">` around *checked {time}*); `web/src/components/patterns/as-of-line.test.tsx:327` (`/\bh-\d\b/`), `:339-345` (only the link's `font-numeric` asserted)
- **Claim challenged**: T008 is complete and asserts "a skeleton block of the
  line's final height". The cycle-2 evidence says 28 of 28 mutants were killed.
- **Observed evidence**: Two reviewer mutants survive the focused suites:
  - `h-7` → `h-1` survives: any single-digit height class satisfies the
    regex.
  - Removing `font-numeric` from the checked span survives.
- **Expected evidence/behavior**:
  - UX design 1.2 States, Loading, says the line "renders its skeleton at final
    height so the table beneath does not shift". DEC-0154 says the same.
  - UX design 1.2 Token Usage (`ux-design.md:805`) gives `--font-numeric` for
    dates, times and counts.
  - TEST-TDD-006 applies.
- **Impact**: A skeleton that no longer matches the line's height, and the table
  shift it would cause, and a checked time in the wrong face can both ship
  green.
- **Required remediation**:
  - Tie the skeleton's height to the line's own height token, so that a change
    to either is caught. For example, a shared min-height class asserted on
    both.
  - Assert `font-numeric` on the *checked {time}* element.
  - Both survivors must be killed.

### IR-004 — The completion announcement runs into the text before it

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-4 (presentation of the announced completion), AC-21
- **Tasks**: T012
- **Files**: `web/src/components/patterns/as-of-line.tsx:123` (`<span>{announcement}</span>` with no leading separator), `:183-191`; `web/src/components/patterns/as-of-line.test.tsx:304` (strips the region's text before matching, so the boundary is never asserted)
- **Claim challenged**: The line renders the announcement "in its one polite
  live region" after the outcome badge, the *sorted by* clause and *checked*.
- **Observed evidence**: The reviewer probe renders the line's text as:
  - *Complete · sorted by valueScores updated to 2026-10-15 17:46 CDT …* with
    `sortLabel`;
  - *… checked 2026-10-15 17:52:10 CDTScores updated to …* while building.

  The *Updating*, *Earlier sets…* and failure children each get a `{" "}`; the
  announcement does not. CAP-002-E4-S9 always passes `sortLabel` on Research
  (E4-S9 plan, Open Gaps E4-F17), so every completion on Research shows the
  glued text.
- **Expected evidence/behavior**: The announcement reads as its own clause, as
  UX design 1.2 Completion words it, separated from the line's other text. No
  owner-facing sentence runs words together.
- **Impact**: The visible as-of line reads as malformed text after every
  completion. Screen readers announce the region on its own, so the announcement
  itself is unaffected.
- **Required remediation**: Separate the announcement from the preceding
  content, and add an assertion on the full visible line text that covers the
  boundary.

### IR-005 — Badge tier classes and the SVG shape wrapper are duplicated

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T012
- **Files**: `web/src/components/patterns/as-of-line.tsx:47-51` (`TIER_CLASSES` for good, warning and active), and the exported `TIER_CLASSES` in `web/src/screens/runs/outcome-badge.tsx:75-81` carrying the same three strings; the SVG wrapper in `not-current-banner.tsx:23-29` against `as-of-line.tsx:72-74`; `BADGE` in both new files (`:21`, `:45`)
- **Claim challenged**: The new files reuse the delivered badge conventions
  rather than restate them. The plan says to draw the badges "as the delivered
  `web/src/screens/coverage/badges.tsx` draws them".
- **Observed evidence**:
  - The three tier class strings are restated verbatim from a delivered exported
    map.
  - The two new files each define an `aria-hidden` 12×12 SVG wrapper and a
    badge class string.
  - The coder's cycle-2 code review raised the class map as a MEDIUM
    follow-up, and it was not addressed.
  - The shapes cannot be shared with `TierIcon`, because UX design 1.2 assigns
    CAP-002 different shapes. The class map and the wrapper can be shared.
- **Expected evidence/behavior**: SA-DUP-001: no block of 3 or more lines is
  duplicated across artifacts.
- **Impact**: A token rename or tier change must be made in several places, and
  missing one reintroduces drift between CAP-001 and CAP-002 badges.
- **Required remediation**:
  - Import the delivered tier class map, or one shared map, instead of
    restating it.
  - Share one badge/shape wrapper between the banner and the line.
  - Do not change any rendered class or shape.

### IR-006 — UX design 1.2 details missing from the plan and the code: the Updating tooltip and the numeric face on the line's other times

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (UX design 1.2 detail beyond the DACs)
- **Tasks**: T012
- **Files**: `web/src/components/patterns/as-of-line.tsx:93, 127`; `web/src/components/patterns/not-current-banner.tsx:101`
- **Claim challenged**: The line and the banner follow UX design 1.2.
- **Observed evidence**:
  - The *Updating* badge has no tooltip.
  - The *Scores from {time}* time and the banner's times render in the
    surrounding face. Only the link and *checked* use `font-numeric`.
- **Expected evidence/behavior**:
  - UX design 1.2 (`ux-design.md:714`) says the building set's start time is
    carried "in the *Updating* badge's tooltip and the dialog below".
  - Token Usage (`ux-design.md:805`) gives `--font-numeric` for dates, times and
    counts.
  - Neither the story's DACs nor the plan carries these details, and the plan
    records no gap for them.
- **Impact**: The building set's start time is not available on the line, and
  the line's times render in mixed faces.
- **Required remediation**: Either implement both details or record them as plan
  gaps or decisions.

### IR-007 — An exact `checkedAt` literal depends on real elapsed time

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009
- **Files**: `web/src/screens/research/use-score-set-poll.test.ts:329` (`expect(first).toBe("2026-10-16T22:50:00.000Z")`), `:120` (`vi.useFakeTimers({ shouldAdvanceTime: true })`)
- **Claim challenged**: Tests are deterministic.
- **Observed evidence**: With `shouldAdvanceTime`, the fake clock advances in
  steps that follow real elapsed time. If 20 ms of real time pass between
  `setSystemTime` in `beforeEach` and the read resolving, the instant is no
  longer `.000Z`. The test passed in every run here, 6 parallel baselines and
  96 mutant runs included. The coder's review noted the same exposure.
- **Expected evidence/behavior**: Assertions that do not depend on real elapsed
  time. The shape regex and the advance comparison already cover (c).
- **Impact**: A latent flake on a slow or loaded runner.
- **Required remediation**: Drop the exact literal, or bound it, or freeze the
  clock around the first read.

### IR-008 — The hook and the line exceed SA-FUNC-003's function length

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T013
- **Files**: `web/src/screens/research/use-score-set-poll.ts:49-140` (`useScoreSetPoll`, about 65 executable lines); `web/src/components/patterns/as-of-line.tsx:158-212` (`AsOfLine`), `:107-152` (`LiveRegion`)
- **Claim challenged**: The new code meets the static-analysis constitution.
- **Observed evidence**: The function bodies exceed 30 executable lines.
  Biome does not enforce the limit. The delivered `useHealthPolling`
  (`status-region.tsx:103`) sets the same precedent, and the coder's review
  noted it.
- **Expected evidence/behavior**: SA-FUNC-003 limits a function to 30 lines of
  executable code.
- **Impact**: The hook's read, the continuation condition and the timer are
  harder to test and change separately.
- **Required remediation**: Optional. Extract the read and the continuation
  predicate when IR-001 is reworked.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations**:
  - The live region is an `output` with an implicit `status` role, not an
    explicit `role="status"` (T012). It is recorded in the cycle-2 evidence,
    and `getByRole("status")` finds it.
  - The hook uses three effects where T013 says "one `useEffect`":
    callback ref, mount read, interval. The behaviour is equivalent.
  - The hook imports the delivered `isNonTerminalRunState` instead of
    restating the three states.
  - The banner falls back to `startedAt` for a failed set with null `endedAt`,
    and `SCORE_SET.noReasonRecorded` was added. Both are recorded as DEC-0232
    (provisional, open) and in the plan's Notes.
  - The change set also contains the `-evidence/` directory (T016,
    `--require-logs`).
- **Bookkeeping**: All 16 tasks are checked. T006, T008, T011, T012 and T013
  are PARTIAL on current evidence (IR-001 to IR-003). The coder's evidence
  file records the T006 case 3 tolerance as a LOW note, while T006's text
  requires the further read.
- **Design ambiguity, not a finding**:
  - UX design 1.2's Polling paragraph says "While polling, the as-of line shows
    *checked {time}*", which includes polling because a download is running.
    Its Page Layout paragraph and DEC-0154 (owner-upheld) show *checked* only
    while a later set builds. The code follows DEC-0154 (`as-of-line.tsx:184`).
  - The two passages should be reconciled at classification-ui 2.6's next
    revision, together with the plan's Open Gap follow-ups.
- **Out-of-scope changes**: None.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework
  `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S4-tasks.md`
  against this report:
  - Fix IR-001: the handoff read, and a test that drives the design 2.6
    handoff.
  - Kill the four non-equivalent survivors of IR-002 and IR-003.
  - Preferably also address IR-004 and IR-005.
  - Then rerun this review. Its baseline is this report:
    `reviewed_head` `58fc55865f9c7907cd630c4becd3e5b4c9f7c6ff`, mutation results
    `CAP-002-E4-S4-implementation-review-v1-mutation.json`.
- **Warnings accepted downstream**: N/A
