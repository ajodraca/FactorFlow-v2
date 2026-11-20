---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S8-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-20
updated: 2026-11-20
story_id: "CAP-003-E1-S8"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-20T03:11:05Z"
reviewed_head: "97965dbe4f4776df0ec7bbaae241a2d2a106cf80"
review_base: "da291e211bbbf583566bc866d93d7f751e959b65"
reviewed_state_revision: "sha256:2a99172eb16fd5b2784807503ca3a88af636bb2f75896f3653e0b50be9eeee87"
verdict: CHANGES-REQUIRED
reviewed_paths:
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/cycle-1.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/cycle-2.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/cycle-3.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/mutation-cycle-1-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/mutation-cycle-2-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/mutation-cycle-3-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/red-cycle-1-derivation.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/red-cycle-2-sort.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-evidence/red-cycle-3-row.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-tasks.md
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-tdd-evidence.yaml
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8.md
  - web/src/components/patterns/needs-you-item.test.tsx
  - web/src/components/patterns/needs-you-item.tsx
  - web/src/components/patterns/needs-you.test.ts
  - web/src/components/patterns/needs-you.ts
  - web/src/components/patterns/status-badge.tsx
review_subjects:
  - artifact_id: CAP-003-E1-S8
    artifact_version: 1
    content_revision: sha256:f2547efc71f8e03e43c1fe112383f84b087a3d89be3f3334e81844e629960ea5
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-20T03:11:05Z
  source_artifacts:
    - id: CAP-003-E1-S8
      version: "1 (sha256:f2547efc71f8e03e43c1fe112383f84b087a3d89be3f3334e81844e629960ea5)"
    - id: CAP-003-E1-S8-tasks
      version: "1 (draft, updated 2026-11-07)"
    - id: CAP-003-E1-S8-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-003-component-design-ui-components
      version: "2"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "2.7 as read at HEAD"
    - id: CAP-003-ux-design
      version: "2"
    - id: CAP-003-ui-components-tests
      version: "TC-COMP-002, TC-COMP-027 to TC-COMP-030"
    - id: DEC-0318
      version: "agent, provisional, open"
    - id: DEC-0319
      version: "agent, provisional, open"
    - id: DEC-0320
      version: "agent, provisional, open"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S8 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 15/16 verified |
| Required validation | 8/8 passed |

Findings: CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 2 · **total 6**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | HIGH | initial | OPEN |
| IR-002 | MEDIUM | initial | OPEN |
| IR-003 | MEDIUM | initial | OPEN |
| IR-004 | MEDIUM | initial | OPEN |
| IR-005 | LOW | initial | OPEN |
| IR-006 | LOW | initial | OPEN |

The production code is correct against every acceptance criterion this review
traced: `deriveNeedsYou` produces the six kinds exactly under the causes the
story, design 2.6 and DEC-0216 state, `sortAttention` orders by the imported
`TIER_ORDER` then newest instant first and is stable by construction, and the
row renders the hidden tile, the `StatusBadge` tag and one `outline` link. All
six constitution validation commands, the plan's grep checks and the TDD
evidence lint pass, and the working tree was unchanged by validation.

The gate fails on one mandatory test. TC-COMP-002's stability test cannot tell
a stable sort from one that breaks ties by `target` or `kind` ascending: both
equal-key pairs in its fixture are already in alphabetical order, so the
reviewer's mutants `|| a.target.localeCompare(b.target)` and
`|| a.kind.localeCompare(b.kind)` survive (IR-001). The plan's own T004 claim
that the fixture kills "a non-stable tiebreak ... ordering equal keys by
target" holds only for the descending direction the coder mutated. Under the
skill's rule a non-equivalent survivor makes its mandatory test `WEAK`, which is
HIGH. Ten further survivors are recorded as MEDIUM and LOW test gaps (IR-003 to
IR-005), and IR-002 records that the severity tile's colours, as DEC-0319 and
T013 prescribe them, contradict the approved UX design 1.3 and `home-ui` §10.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8.md` (status `in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S8-tasks.md` |
| Component | `FactorFlow-v2` (`web/src/components/patterns/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S8-run-20261120T010103Z` |
| HEAD | `97965dbe4f4776df0ec7bbaae241a2d2a106cf80` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` resolved by `pipeline-state.py review-base --base-ref` to `da291e211bbbf583566bc866d93d7f751e959b65` (CAP-003-E3-S1 doc-sync), an ancestor of HEAD |
| Working tree | clean before and after validation (no staged, unstaged or untracked files) |
| Changed files reviewed | 17 (7 commits `1a0bc7e1..97965dbe`, every one naming CAP-003-E1-S8 only) |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review` without `--base-ref`
reported `BLOCKED` (it resolved the base against the remote default branch);
with the supervised run's integration ref it reported `READY — story is ready
for independent review; mutation score 0.971 over 3 cycles`, and
`--stage story-coding` reported `COMPLETE — story status is in-review`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/needs-you.ts` | added | DAC-E1-6, DAC-E1-7, DAC-E1-S8-1, DAC-E1-S8-2, AC-7, AC-9, AC-16; T010, T011 |
| `web/src/components/patterns/needs-you.test.ts` | added | TC-COMP-028, TC-COMP-029, TC-COMP-002; T002, T003, T004, T006, T007, T008 |
| `web/src/components/patterns/needs-you-item.tsx` | added | DAC-E1-S8-3 (AC-20); T013; DEC-0319 |
| `web/src/components/patterns/needs-you-item.test.tsx` | added | TC-COMP-030; T005, T009 |
| `web/src/components/patterns/status-badge.tsx` | modified | T012; DEC-0319 (`TierShape` export, badge DOM unchanged) |
| `.../stories/CAP-003-E1-S8.md` | modified | status `planning` to `in-review` only (story-coding bookkeeping) |
| `.../stories/CAP-003-E1-S8-tasks.md` | modified | the sixteen checkboxes only; T001 to T016 |
| `.../stories/CAP-003-E1-S8-tdd-evidence.yaml` | added | T016 |
| `.../CAP-003-E1-S8-evidence/cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` | added | T016 (`reviewed_patch`) |
| `.../CAP-003-E1-S8-evidence/red-cycle-1-derivation.log`, `red-cycle-2-sort.log`, `red-cycle-3-row.log` | added | T016 (`red_log`) |
| `.../CAP-003-E1-S8-evidence/mutation-cycle-1-results.json`, `-2-`, `-3-` | added | T016 (`mutation.results`) |

No change touches `web/src/app/`, `web/src/api/`, `web/src/screens/`,
`tiers.ts`, `worst-data-tier.ts`, `package.json` or `package-lock.json`
(`git diff --stat da291e21..HEAD -- <those paths>` printed nothing).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `needs-you.ts:38-129` `deriveNeedsYou` (presence exactly while each cause holds); `needs-you.ts:137-143` `sortAttention` (tier then newest first) | `needs-you.test.ts` "cause boundaries", "summary states", "sortAttention (TC-COMP-002)" | Behaviour is correct; the stability clause's test is weak (IR-001) |
| AC-16 | SATISFIED | `sortAttention` returns a new array of the same items, so its length is the derivation's | `needs-you.test.ts:571-593` length 5 for both calls; `:644-650` same objects | The two callers (CAP-003-E3-S6, CAP-003-E5-S3) do not exist yet; nothing imports the module (grep of `web/src` printed nothing), as T014 expects |
| AC-7 | SATISFIED | `needs-you.ts:109-111` served `first_download`; `needs-you.ts:120-126` the `404` variant only while `latest_terminal_download` is null | `needs-you.test.ts:145-168`, `:273-300`, `:328-339` | `requested`, `running`, `cancelling` only, through the module-local `isNonTerminal` |
| DAC-E1-6 | SATISFIED | the switch over `attention.items` (`:41-79`), the served block (`:97-119`), the `not_served` branch (`:120-126`); `loading` and `error` add nothing and `error.last` is never read | `needs-you.test.ts:249-260` (error with a `last` that would yield `first_scores`), `:315-326`, `:391-403`, key-list assertions `:86-91`, `:122-128`, `:161-167`, `:211-216` | Every tier comes from `tierOf`; the item carries only kind, tier, ISO time, route and id |
| DAC-E1-7 | SATISFIED | `needs-you.ts:4` `import { TIER_ORDER } from "./worst-data-tier"`; comparator returns 0 for equal tier and instant, and `Array.prototype.sort` is stable | `needs-you.test.ts:558-565`, `:595-599` (instants not strings), `:635-642` (active and good share a rank); `worst-data-tier.test.ts` TC-COMP-027 (c) now runs and passes | Stability holds by construction, but no test distinguishes it from an ascending `target` or `kind` tiebreak (IR-001) |
| DAC-E1-S8-1 | SATISFIED | `/data` for `data_problems` (`:49`) and `score_failed` (`:117`); `downloadTarget` for the three download-bound kinds (`:34-36`, `:70`, `:92`, `:106`); `/settings` (`:57`); `runId` only on those three | `needs-you.test.ts:67-218` (`toEqual` on whole items, `not.toHaveProperty("runId")` on the three others) | DEC-0320's fallback to `/data` when no run is known is pinned at `:503-518` |
| DAC-E1-S8-2 | SATISFIED | `error` falls through both branches; building plus `never_classified` takes the `first_scores` branch and the `else if` excludes `first_download` | `needs-you.test.ts:249-260`, `:262-271` | `:262-271` asserts with `toContain` rather than the planned literal list (IR-006); other tests pin the full list |
| DAC-E1-S8-3 | SATISFIED | `needs-you-item.tsx:49-56` tile `aria-hidden`; `:58` `StatusBadge` with `labelOf({ of: "item", kind })`; `:62-66` one `Button asChild variant="outline"` wrapping a `Link` to `item.target` | `needs-you-item.test.tsx:46-95`, `:112-133` | AC-20 through STD-UI-8: the tag badge carries the tier shape and the tag word (plan Resolved Conflict 6). Tile colours: IR-002 |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Every upstream import resolves: `npx tsc --noEmit` exit 0; `shell-types.ts` exports `Attention`, `ScoreState`, `LatestDownload`, `ScoreSummary` in the snake_case shape the plan names; `tiers.ts` `tierOf`/`labelOf` item branches; `TIER_ORDER` in `worst-data-tier.ts:19` | The baseline run and the `grep -nE` outputs the task says to record in cycle 1's evidence are not recorded (IR-006) |
| T002 | complete | VERIFIED | `needs-you.test.ts:67-218` six fixtures, literal expectations | Key-list assertion omitted for `credential_missing` and `first_scores` (both still pinned by whole-item `toEqual`) (IR-006) |
| T003 | complete | VERIFIED | `needs-you.test.ts:220-301` cases (1) to (4) | (2) uses `toContain`/`not.toContain`, not the planned literal list (IR-006) |
| T004 | complete | PARTIAL | `needs-you.test.ts:547-569` scrambled tiers, double call, unchanged input, empty input | The stability fixture cannot fail a deterministic ascending tiebreak; the plan's listed kill does not hold (IR-001) |
| T005 | complete | VERIFIED | `needs-you-item.test.tsx:44-96` (1) to (6) | (6) asserts no `img` role only; the tile's `aria-hidden` is pinned by (2) |
| T006 | complete | VERIFIED | `needs-you.test.ts:303-444` (a) to (h); (b) over a literal `Record<RunState, boolean>` | (e) uses two server items, not three (IR-006) |
| T007 | complete | VERIFIED | `needs-you.test.ts:446-536` (a) to (e) | Its listed kills hold; DEC-0320's `item.run_id` precedence over `latest_terminal_download.run_id` is not pinned (IR-003) |
| T008 | complete | VERIFIED | `needs-you.test.ts:571-650` (a) to (d) | The `localeCompare` mutant is killed by (a) |
| T009 | complete | VERIFIED | `needs-you-item.test.tsx:98-134` per-tier tile class and child tags, tile and badge `innerHTML` equal, filled good circle, `lucide-diamond` | Only the `bg-...-muted` class is asserted per tier; the shape colour is pinned for critical only (IR-004) |
| T010 | complete | VERIFIED | `needs-you.ts:1-129` exactly as planned (types-only `app/` import, local `isNonTerminal`, DEC-0318 and DEC-0320 rules) | Adds module-local `downloadTarget` and a `firstDownload` closure with an unreachable null guard; neither is exported |
| T011 | complete | VERIFIED | `needs-you.ts:131-143`; `TIER_ORDER` imported in the form TC-COMP-027 scans; no order literal of its own | — |
| T012 | complete | VERIFIED | `status-badge.tsx:31-58` `TierShape`; `StatusBadge` renders `<TierShape tier={tier} />` | `status-badge.test.tsx`, `as-of-line.test.tsx`, `not-current-banner.test.tsx` and the CAP-002 research tests pass unedited in the full suite |
| T013 | complete | VERIFIED | `needs-you-item.tsx:1-69` per T013 and DEC-0319 | Built as planned; the planned tile colours contradict UX design 1.3 and `home-ui` §10 (IR-002) |
| T014 | complete | VERIFIED | Full suite 104 files, 2700 tests; TC-COMP-027 (c) listed as passed; T014 and Validation Plan greps re-run (see Independent Validation) | — |
| T015 | complete | VERIFIED | `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run build` all exit 0 | — |
| T016 | complete | VERIFIED | Three cycles in `CAP-003-E1-S8-tdd-evidence.yaml`, each with RED log, reviewed patch, `diff_sha256`, verdicts and a `mutation:` block; `check-tdd-evidence.py --require-logs` 0 errors | Review independence cannot be corroborated from the repository beyond the recorded verdicts |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `needs-you.test.ts` "targets and runId" / TC-COMP-028 | ADEQUATE | Whole-item `toEqual` with independent literals for all six kinds; `not.toHaveProperty("runId")` and key lists where `runId` must be absent | `first_download`'s fixture has `started_at: null`, so a recency read from `started_at` survives (IR-003) |
| `needs-you.test.ts` "summary states" / TC-COMP-029 | ADEQUATE | error with a `last` that would yield `first_scores`; building; `404` before and after a terminal download | (2) asserts with `toContain` (IR-006) |
| `needs-you.test.ts` "sortAttention" / TC-COMP-002 | WEAK | Tier order, newest first, double call, input unchanged, empty list, length 5 for both callers | Equal-key pairs (`/wa` before `/wb`, `first_download`/`/a` before `first_scores`/`/g`) are in ascending order in the input, so ascending `target` or `kind` tiebreaks survive (IR-001) |
| `needs-you.test.ts` "cause boundaries" (T006) | ADEQUATE | All four score states over an all-clear read; the eight run states; two-cause case; later building after scores; loading; tier by terminal state; recency copied verbatim; no input mutation | — |
| `needs-you.test.ts` "provisional recency and target rules" (T007) | WEAK | DEC-0318 both branches; DEC-0320 fallback and the run-less item; `score_failed` without `ended_at` | No fixture has differing non-null item and terminal run ids, so swapping DEC-0320's precedence survives (IR-003) |
| `needs-you.test.ts` sort and count edges (T008) | ADEQUATE | Instants not strings; five-kind order; active and good share a rank; new array of the same objects | — |
| `needs-you-item.test.tsx` "NeedsYouItemRow" / TC-COMP-030 | ADEQUATE | `listitem` root; tile `aria-hidden`, inline size from `markerSize`, critical classes, one `rect`; exactly one `status-*` badge with text `Download`; one link with name, text, `data-variant="outline"`, `href`; title `font-semibold`; body; target for another kind | Row separator and one-line title are not pinned (IR-004) |
| `needs-you-item.test.tsx` "tile shape and colour per tier" (T009) | WEAK | Per-tier `bg-...-muted` class and child tags for tile and badge; identical `innerHTML`; filled good circle; diamond | Per-tier shape colour (`text-status-...`) pinned for critical only; tile shape size unpinned (IR-004, IR-005) |
| `worst-data-tier.test.ts` TC-COMP-027 (b), (c), (d) | ADEQUATE | (c) now runs (not skipped) and passes over `needs-you.ts`; (b) and (d) scans pass | — |
| `status-badge.test.tsx`, `tiers.test.ts`, CAP-002 badge consumers | ADEQUATE | Unedited; pass; kill the reviewer's fill, focusable, shape and `shrink-0` mutants of `status-badge.tsx` | — |
| `token-literals.test.ts`, `render.test.tsx` | ADEQUATE | Pass over both new files and the edited `status-badge.tsx` | — |

**Determinism and isolation.** Fixtures are literals; the only `Date` is a
fixed `checkedAt`; no timers, network or storage. `summary()` casts a partial
`ScoreSummary` (`stocks_current` omitted) with `as`, which the derivation never
reads; acceptable for a fixture.

**TDD evidence lint.** `check-tdd-evidence.py --require-logs` reports 0 errors
and 0 warnings. The RED logs show module-resolution failures (cycles 1 and 3)
and seven `sortAttention is not a function` failures (cycle 2), each a
meaningful RED for its cycle.

**Mutation (E.9).** The coder's score is 0.971 (34 of 35 killed, one called
equivalent). That equivalence claim holds: rendering lucide-react 1.70.0's
`Circle`, `Icon` and `Square` without the prop still prints
`aria-hidden="true"`. The reviewer regenerated mutants over
`da291e21..HEAD` (the catalogue yields 5 `negate-boolean` mutants, all in
`needs-you.ts`) and added 37 manual mutants across all three changed production
files: 42 mutants, 30 killed, 12 survived, 0 stillborn, 0 timeout, all four
baselines exit 0. Each survivor was judged against the contract and none is
equivalent:

| Survivor (`manual:review-...`) | File:line | Contract it changes | Finding |
|--------------------------------|-----------|---------------------|---------|
| `sort-tiebreak-target-asc`, `sort-tiebreak-kind` | `needs-you.ts:141` | DAC-E1-7, design 2.6, TC-COMP-002 "stable for equal keys" | IR-001 |
| `dnc-runid-precedence` | `needs-you.ts:63` | DEC-0320 `item.run_id ?? latest_terminal_download.run_id` | IR-003 |
| `first-download-recency-started` | `needs-you.ts:91` | DEC-0203, UX design 1.3 and T010: `first_download` recency `requested_at` | IR-003 |
| `row-border-dropped` | `needs-you-item.tsx:48` | UX design 1.3 and `home-ui` §10 "rows separated by `--border`"; T013 | IR-004 |
| `title-not-truncated` | `needs-you-item.tsx:59` | Blueprint §4.1, UX design 1.3 "one-line title"; T013 | IR-004 |
| `tile-warning-shape-colour`, `tile-neutral-shape-colour-dropped` | `needs-you-item.tsx:31`, `:34` | DEC-0319 and T013: tile shape colour per tier | IR-004 |
| `tile-shape-size-dropped` | `needs-you-item.tsx:55` | T013 `className="h-4 w-4"` | IR-005 |
| `shape-class-order`, `shape-class-ignored` | `status-badge.tsx:43` | T012 `className={cn("h-3 w-3 shrink-0", className)}` | IR-005 |
| `action-shrink-dropped` | `needs-you-item.tsx:62` | T013 `className="shrink-0"` | IR-005 |

## Independent Validation

All commands ran from the harness checkout
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-85e85a`
(abbreviated `H`) or the component root `H/repos/factorflow-v2/FactorFlow-v2`
(abbreviated `R`).

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | `H` | 0 | PASS | all eight checks passed |
| `python3 scripts/pipeline-state.py check ... --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` | `H` | 0 | PASS | `READY`; without `--base-ref` it reported `BLOCKED` against the default branch |
| `python3 scripts/pipeline-state.py review-base --repo-dir R --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` | `H` | 0 | PASS | `da291e21...`; `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| `npx vitest run web/src/components/patterns/needs-you.test.ts web/src/components/patterns/needs-you-item.test.tsx web/src/components/patterns/status-badge.test.tsx` | `R` | 0 | PASS | 3 files, 93 tests (40 + 14 + 39) |
| `npx vitest run web/src/components/patterns/worst-data-tier.test.ts --reporter=verbose` | `R` | 0 | PASS | 54 tests; TC-COMP-027 "sortAttention's module imports TIER_ORDER from ./worst-data-tier" passed, not skipped |
| `npm ci` | `R` | 0 | PASS | lockfile install; no package added by the story |
| `npm run test` | `R` | 0 | PASS | 104 files, 2700 tests |
| `npm run lint` | `R` | 0 | PASS | Biome, 232 files, no diagnostics |
| `npm run format` | `R` | 0 | PASS | Biome check, 232 files, no fixes |
| `npx tsc --noEmit` | `R` | 0 | PASS | no output |
| `npm run build` | `R` | 0 | PASS | Vite build into `src/factorflow/api/static/` (ignored output) |
| T014 and Validation Plan greps: `^import (type )?\{...\} from "\.\./\.\./app/"` in `needs-you.ts`; `from "[^"]*app/"` in `needs-you-item.tsx`; `(const\|let\|var) TIER_ORDER\b` over `web/src`; `from "[^"]*screens/"` and `[0-9]+(px\|rem)` in the new files | `R` | 0/1 as expected | PASS | one `import type` line; nothing; one declaration in `worst-data-tier.ts:19`; nothing; nothing. No `dangerouslySetInnerHTML` or browser storage in the changed files |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-003-E1-S8-tdd-evidence.yaml --repo-dir R --base da291e21... --decisions-dir projects/factorflow-v2/decisions --require-logs` | `H` | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-score.py score --evidence .../CAP-003-E1-S8-tdd-evidence.yaml --project-repo R` | `H` | 0 | PASS | 0.971 over 3 cycles; the project declares no minimum |
| `python3 scripts/mutation-run.py generate --repo-dir R --range da291e21..HEAD --cycle review --out <scratch>/mutants.json`, then 37 manual mutants appended | `H` | 0 | PASS | 5 catalogue mutants plus 37 manual |
| `python3 scripts/mutation-run.py run ... --jobs 4 --command "ln -sfn R/node_modules node_modules && npx vitest run web/src/components/patterns web/src/screens/research"` | `H` | 0 | SUPERSEDED | 31 killed, 11 survived; two kills came only from `results-pane.test.tsx` (TC-COMP-099) and `stock-evidence.test.tsx`, research tests that pass unmutated and flaked under four parallel workers. Rerun below without them |
| `python3 scripts/mutation-run.py run ... --jobs 4 --command "ln -sfn R/node_modules node_modules && npx vitest run web/src/components/patterns"` | `H` | 0 | 12 SURVIVORS | 30 killed, 12 survived; every kill failed a story or badge test file. Copied as `CAP-003-E1-S8-implementation-review-v1-mutation.json` |
| `npm run test:e2e` | `R` | N/A | NOT RUN | The task plan excludes it: this story owns no end-to-end case |
| Python validation commands (`uv run pytest`, `ruff`, `mypy`, `uv build`) | `R` | N/A | NOT RUN | No Python file changed; the task plan's constitution-defined commands are the frontend six |

### Validation Side Effects

- Before: HEAD `97965dbe`, branch `usr/alvaro-de-jodra/CAP-003-E1-S8-run-20261120T010103Z`, `git status --porcelain --untracked-files=all` empty, `code-revision` `sha256:2a99172eb16fd5b2784807503ca3a88af636bb2f75896f3653e0b50be9eeee87`.
- After: identical HEAD, branch, empty status and the same `code-revision` fingerprint. Mutants ran in clones under the reviewer's scratch directory.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — TC-COMP-002's stability test cannot detect a deterministic tiebreak

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-7, AC-9
- **Tasks**: T004
- **Files**: `web/src/components/patterns/needs-you.test.ts:549-565` ("orders by tier then newest first, stable for equal keys"); `web/src/components/patterns/needs-you.ts:141`
- **Claim challenged**: T004 states the test kills "a non-stable tiebreak (hand-written mutant ordering equal keys by `target`, observed by warning A before B)".
- **Observed evidence**: The mutants `Date.parse(b.recordedAt) - Date.parse(a.recordedAt) || a.target.localeCompare(b.target)` and `... || a.kind.localeCompare(b.kind)` survive the whole patterns suite. The test's two equal-key pairs are `warningA` (`/wa`) before `warningB` (`/wb`), both `data_problems`, and `active` (`first_download`, `/a`) before `good` (`first_scores`, `/g`). Both pairs are already in ascending `target` and `kind` order in the input, so an ascending tiebreak produces the expected array. The coder's cycle-2 mutant `tiebreak-target` used the descending `b.target.localeCompare(a.target)`, which is the only direction this fixture kills.
- **Expected evidence/behavior**: DAC-E1-7, design `ui-components` 2.6 and TC-COMP-002 ("Equal keys keep their input order (stable)") make stability a specified behaviour. The mandatory test must fail for any order of equal keys other than input order.
- **Impact**: The production comparator is stable today. A later change that adds a "deterministic" tiebreak, for example by `target` or `kind`, would reorder Home's equal-rank items against their input order and pass the suite. Under E.9 and H this makes a mandatory test `WEAK`.
- **Required remediation**: Make the stability fixture order-sensitive in both directions, for example an equal-key pair whose input order is descending by `target` and by `kind`, or the same equal-key pair asserted in both input orders. Then confirm both reviewer mutants above, and the coder's descending one, are killed.

### IR-002 — Severity tile colours contradict the approved UX design and `home-ui` §10

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-3 (AC-20); not a violation of its stated clauses
- **Tasks**: T013, T009
- **Files**: `web/src/components/patterns/needs-you-item.tsx:30-37` (`TILE_CLASSES`), `:53`
- **Claim challenged**: T013 and DEC-0319 specify the tile as `bg-status-<tier>-muted text-status-<tier>` ("the status pair, ui-components §10"), and cycle 3's spec-drift check reported no drift.
- **Observed evidence**: The approved UX design 1.3 *Token Usage* says "the severity tile the tier's `--status-<tier>` fill with its shape in `--status-foreground`". The approved `home-ui` §10 *Tokens* says "the severity tile `--status-<tier>` with its shape in `--status-foreground`". Blueprint §4.1 says "tier fill". The `ui-components` §10 "status pairs `--status-<tier>` on `--status-<tier>-muted`" is the badge rule. The implementation renders the reverse of the tile rule: a muted fill with the shape in the tier colour. DEC-0319 is `kind: provisional`, `status: open`, `owner_reviewed: false`, and its blind second opinion (`second_opinion_agrees: false`) stated the tile should follow "ux-design and home-ui 10: tile background `--status-<tier>`, shape in `--status-foreground`". `docs/unattended-mode.md` allows a provisional decision only where "no artifact fixes it". Cycle 3's evidence notes the difference as "informational".
- **Expected evidence/behavior**: Either the tile follows UX design 1.3 and `home-ui` §10, or the owner, reviewing DEC-0319, accepts the muted pair and the owning designs absorb it.
- **Impact**: Every *Needs you* row would render a pastel tile with a coloured glyph where the approved design calls for a saturated tile with a white or near-black glyph. Tier is still conveyed by shape and the tag word, so no accessibility criterion fails. DEC-0319 blocks CAP-003-E5-S3, the only consumer, so the owner's review of DEC-0319 happens before any screen renders the row. The coder followed the plan; this review does not reopen the recorded decision.
- **Required remediation**: Bring the conflict to the owner's DEC-0319 review. If the owner upholds UX design 1.3, change `TILE_CLASSES` to the `--status-<tier>` fill with `--status-foreground` shape and update T009's per-tier fixture. If the owner upholds DEC-0319, no code change is needed and the designs absorb it.

### IR-003 — Two specified derivation rules are not pinned by any test

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-1, AC-9 (recency key)
- **Tasks**: T002, T007
- **Files**: `web/src/components/patterns/needs-you.ts:63`, `:91`; `web/src/components/patterns/needs-you.test.ts:23-32` (`download()` sets `started_at: null`), `:94-129`, `:484-501`
- **Claim challenged**: T007 pins DEC-0320's run-id rule and T002 pins `first_download`'s recency.
- **Observed evidence**: `entry.run_id ?? terminal?.run_id` → `terminal?.run_id ?? entry.run_id` survives, because every `download_not_complete` fixture with both ids uses the same value. `recordedAt: download.requested_at` → `download.started_at ?? download.requested_at` survives, because the `download()` builder always sets `started_at: null`. The cycle-1 code review had accepted the first gap as LOW.
- **Expected evidence/behavior**: DEC-0320 fixes the item's own `run_id` first and the terminal download's as the fallback. DEC-0203, UX design 1.3 and T010 fix `first_download`'s recency as `requested_at`. A mutant that changes either is not equivalent (E.9).
- **Impact**: The two values agree on every consistent read today: reader 2.7 defines the item's `run_id` as the terminal download's, and in M1 `first_download` is alone in its rank. A regression would surface only on a contradicting read or once another active or good kind exists. The impact is small, but the gap still counts as a finding.
- **Required remediation**: Add a `download_not_complete` fixture whose item and terminal run ids differ and assert the item's own id wins. Give the `first_download` fixture a `started_at` different from `requested_at` and assert `recordedAt` is `requested_at`.

### IR-004 — Row presentation the approved design specifies is untested

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-3 (row parts), AC-20
- **Tasks**: T005, T009, T013
- **Files**: `web/src/components/patterns/needs-you-item.tsx:31`, `:34`, `:48`, `:59`; `web/src/components/patterns/needs-you-item.test.tsx:98-123`
- **Claim challenged**: T009 asserts "tile shape and colour per tier". T013's row has rows "separated by `--border`" and a title of "one line, weight 600".
- **Observed evidence**: Four mutants survive: dropping `border-b border-border` from the `li`; dropping `truncate` from the title; giving the warning tile `text-status-critical`; and dropping the neutral tile's `text-status-neutral`. T009's per-tier fixture asserts only the `bg-...-muted` class, and the shape colour is asserted for critical alone (`:52`).
- **Expected evidence/behavior**: Blueprint §4.1, UX design 1.3 and `home-ui` §10 specify the one-line title and the `--border` separators. DEC-0319 and T013 specify a shape colour for every tier.
- **Impact**: A regression could render rows without separators, wrap titles, or draw a warning glyph in the critical colour, and the suite would stay green. Fixing IR-002 may change the colour classes; whichever colour rule the owner settles still needs a test for every tier.
- **Required remediation**: Assert the row's separator class, the title's single-line class, and each tier's shape-colour class in the T009 table.

### IR-005 — Plan-specified layout classes survive mutation

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012, T013
- **Files**: `web/src/components/patterns/status-badge.tsx:43`; `web/src/components/patterns/needs-you-item.tsx:55`, `:62`
- **Claim challenged**: T012 gives `TierShape` a `className` that overrides its `h-3 w-3` default, and T013 passes `h-4 w-4` to the tile's shape and `shrink-0` to the action.
- **Observed evidence**: These mutants survive: `cn(className, "h-3 w-3 shrink-0")`, a `className` that is ignored, `<TierShape tier={item.tier} />` without the size, and the action without `shrink-0`. No test reads the tile glyph's size or the action's flex class. The badge's own `h-3 w-3 shrink-0` is pinned (`shape-shrink-dropped` is killed).
- **Expected evidence/behavior**: Only T012 and T013 specify these classes; no approved design fixes the glyph size.
- **Impact**: The tile glyph would render at the badge size (12 px rather than 16 px), or the action could shrink on a narrow row, with no failing test.
- **Required remediation**: Assert the tile's shape carries the size it is given, for example `h-4 w-4` and not `h-3`, and the action's `shrink-0`. Alternatively, record why these classes are left unpinned.

### IR-006 — Evidence bookkeeping and loosened planned assertions

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-2, DAC-E1-6
- **Tasks**: T001, T002, T003, T006, T007
- **Files**: `CAP-003-E1-S8-tdd-evidence.yaml` cycle-1; `web/src/components/patterns/needs-you.test.ts:131-143`, `:170-186`, `:262-271`, `:391-403`, `:497-500`
- **Claim challenged**: T001 asks for the baseline run and each upstream `grep -nE` output to be recorded in cycle 1's evidence. T002, T003 and T006 specify sharper assertions.
- **Observed evidence**: Cycle 1 records neither the baseline result nor the grep outputs. T003 (2) uses `toContain`/`not.toContain` instead of a literal kind list. T006 (e) uses two server items instead of three. T002's key-list assertion is absent for `credential_missing` and `first_scores`. T007 (c) uses `toMatchObject`. The reviewer's mutants found no behaviour these looser forms let through: whole-item `toEqual` elsewhere pins the same outcomes, and the upstream exports were confirmed independently by `npx tsc --noEmit`.
- **Expected evidence/behavior**: The task plan's T001 recording and its literal-list assertions.
- **Impact**: Evidence quality only.
- **Required remediation**: Optional: restore the literal assertions while reworking IR-001, and note the baseline and upstream checks in the next cycle's evidence.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- `status-badge.tsx` is outside the story's four listed files. T012 and DEC-0319 justify the change, it is DOM-neutral for `StatusBadge`, and every delivered badge test passes unedited.
- `needs-you.ts` adds the unexported helpers `downloadTarget` and a `firstDownload` closure whose `download === null` guard cannot be reached (`downloading` already implies a download). This is not scope leakage.
- The coder's per-cycle mutation commands omit the plan's `&& npx tsc --noEmit` and, for cycles 1 and 2, the row and badge test files. The evidence header says so, and `tsc` and the full suite were run separately; this review reran both.
- Bookkeeping: all sixteen tasks are checked. T004 is `PARTIAL` (IR-001). The story moved `planning` to `in-review`; the task plan stays `status: draft`, which the pipeline allows.
- The supervised integration base resolves to this story's true base: `da291e21` is CAP-003-E3-S1's doc-sync commit, and all seven commits after it name CAP-003-E1-S8 only. No base decision was needed.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework IR-001 so TC-COMP-002's stability test fails on any non-input order of equal keys, and show that the reviewer's `sort-tiebreak-target-asc` and `sort-tiebreak-kind` mutants are killed. Address IR-003 to IR-005 in the same pass where practical. Do not change `TILE_CLASSES` for IR-002 until the owner has reviewed DEC-0319. Then rerun `$adversarial-review` against this report.
- **Warnings accepted downstream**: N/A
- **Owner attention (no action by this story)**: (1) DEC-0319's tile colour clause contradicts approved UX design 1.3 and `home-ui` §10 (IR-002). (2) Outside this story's scope: `home-ui` 2.5's accessible name *See the download that failed* does not contain the visible label **See download** (WCAG 2.5.3, label in name), unlike *Fix data for ...* and *Open Settings to ...*. That copy is CAP-003-E5-S3's, not this row's.
