---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S6"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T23:50:00Z"
reviewed_head: "f1cc0e7199ab77795d5e89aa2f745e6754faf77a"
review_base: "1f957aab78f8edb73e8d3c3d5ea71de480f38c5e"
reviewed_state_revision: "sha256:e8285bea8e9efc5b81bc03dc828e5c915f409d6a909b031fd3e9ef32aedb900c"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E1-S6
    artifact_version: 1
    content_revision: sha256:85bed54d31f641de20e87765f0e2f9e2c97ec255c0241b77dd657a7441bb7512
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-09T00:01:09Z
  source_artifacts:
    - id: CAP-003-E1-S6
      version: "1 (sha256:85bed54d31f641de20e87765f0e2f9e2c97ec255c0241b77dd657a7441bb7512)"
    - id: CAP-003-E1-S6-tasks
      version: "1 (draft, updated 2026-11-08, last_reworked_review v1)"
    - id: CAP-003-E1-S6-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E1-S6-implementation-review
      version: "1 (baseline, reviewed_head 330bc5592ecb7f6b10975a180c29f75086d2669f)"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1 (draft)"
    - id: CAP-003-coverage-matrix
      version: "1 (draft)"
    - id: DEC-0309
      version: "applied (provisional, owner upheld)"
    - id: DEC-0310
      version: "applied (provisional, owner upheld)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S6 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 12/12 passed |

This re-review covers `f1cc0e7`, the rework of v1's CHANGES-REQUIRED. The review base is still
`1f957aa`. The baseline is v1 (`reviewed_head` `330bc55`), with its 82-mutant results file.

The rework changes tests only. `git diff 330bc55 HEAD -- . ':!docs'` lists only `format.test.ts`
(+29 −4) and `presence.test.tsx` (+9). `format.ts` and `presence.tsx` are byte-identical to what
v1 judged correct.

- **v1 IR-001 (HIGH) is resolved.** `presence.test.tsx:24-31` asserts `inline-flex`,
  `items-center` and `gap-2` on the element that holds the badge and the reason. It asserts
  `text-xs` and `text-muted-foreground` on the reason. All four class-removal mutants fail, and so do
  the reviewer's new `flex`, `gap-1`, `items-start`, `text-sm` and `text-foreground` substitutions.
  TC-COMP-025 is now `ADEQUATE`.
- **v1 IR-002 (MEDIUM) is resolved.** All seven guard and message survivors are killed.
- **v1 IR-003 (LOW) is resolved.** The evidence now runs the catalogue's 21 mutants, and its
  baseline of 97 files and 2461 tests reproduces.

The reviewer ran 97 mutants: the 82 carried from the baseline plus 15 of their own. 88 are killed.
The 5 carried survivors are the 5 that v1 judged equivalent, and their probes still hold. The 4 new
survivors are all `late`: they sit on production lines unchanged since `330bc55`, which v1 could
have mutated just as well. So they cap at MEDIUM and make no test `WEAK` (skill H).

- **IR-001 (MEDIUM, late).** No test passes a fractional-second instant or a minute-precision
  instant. A guard that rejected `2026-10-15T22:46:00.123456+00:00` would pass every test, yet that
  is the shape the delivered precedent asserts for wire timestamps.
- **IR-002 (LOW, late).** Nothing pins that the visible reason stays in the accessibility tree, or
  that it follows the badge.
- **IR-003 and IR-004 (LOW, carried).** These are v1 IR-004 and IR-005, optional and not taken
  up.

All 12 required validation checks pass. The coverage-table flake is described under Independent
Validation.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6-tasks.md` (`last_reworked_review: CAP-003-E1-S6-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S6-run-20261108T150357Z` |
| HEAD | `f1cc0e7199ab77795d5e89aa2f745e6754faf77a` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z`, the driver's integration branch passed as `--base-ref`. `pipeline-state.py review-base` resolves it to `1f957aab78f8edb73e8d3c3d5ea71de480f38c5e`. That commit is an ancestor of HEAD (`git merge-base --is-ancestor` exits 0) |
| Working tree | Clean before and after validation: `git status --porcelain=v1 -uall` prints nothing. The only new files are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 72 against the review base (70 added, 2 modified) in three commits: `330bc55` (coding), `40f3330` (v1 review) and `f1cc0e7` (rework). The rework alone is 35 files against the baseline (31 added, 4 modified) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `330bc5592ecb7f6b10975a180c29f75086d2669f`, with `CAP-003-E1-S6-implementation-review-v1-mutation.json` |

`pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — review changes were
reworked; a new review version is required`. Without `--base-ref`, it reports `BLOCKED — story
coding has not reached in-review`: against the remote default branch, the TDD lint cannot match the
evidence. v1 saw the same split. Skill A.2 requires the driver's integration branch, so the reviewer
used it.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/format.ts` | added in `330bc55`; unchanged since the baseline | AC-25, DAC-E1-9, DAC-E1-S6-1, DAC-E1-S6-2; T006; DEC-0309 |
| `web/src/components/patterns/format.test.ts` | added in `330bc55`; modified in `f1cc0e7` (+29 −4) | TC-COMP-023, TC-COMP-024; T001, T002, T005; v1 IR-002 |
| `web/src/components/patterns/presence.tsx` | added in `330bc55`; unchanged since the baseline | AC-24, DAC-E1-8, DAC-E1-S6-3; T007; DEC-0310 |
| `web/src/components/patterns/presence.test.tsx` | added in `330bc55`; modified in `f1cc0e7` (+9) | TC-COMP-025; T003, T004; v1 IR-001 |
| `.../stories/CAP-003-E1-S6.md` | modified in `330bc55` (`status: planning` to `in-review`); unchanged since | story-coding lifecycle |
| `.../stories/CAP-003-E1-S6-tasks.md` | modified: T001-T010 ticked in `330bc55`; `updated` and `last_reworked_review` in `f1cc0e7` | bookkeeping; rework hand-off |
| `.../stories/CAP-003-E1-S6-tdd-evidence.yaml` | added in `330bc55`; `f1cc0e7` corrects the header and cycle-1 baseline and adds cycle-2 | T010; v1 IR-003 |
| `.../stories/CAP-003-E1-S6-evidence/cycle-1.patch`, `red-cycle-1-2-…log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, `mutation-cycle-1-results-logs/*.log` (32 files) | added in `330bc55` | T010, cycle-1 |
| `.../stories/CAP-003-E1-S6-evidence/cycle-2.patch`, `red-cycle-2-review-survivors.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, `mutation-cycle-2-results-logs/*.log` (25 files) | added in `f1cc0e7` | T010, cycle-2 (rework) |
| `.../stories/CAP-003-E1-S6-implementation-review-v1.md`, `…-v1-mutation.json` | added in `40f3330` | the baseline review |

No other source file changed. `git diff --stat 1f957aa HEAD -- . ':!docs'` lists exactly the four
planned files. `git diff --exit-code 1f957aa HEAD -- web/src/app web/src/screens web/src/api
web/src/components/ui package.json package-lock.json tailwind.config.js tsconfig.json vite.config.ts
vitest.config.ts design-system` exits 0 (T008). No file outside `web/src/components/patterns/`
imports `patterns/format` or `patterns/presence`. A `grep` for them exits 1.

The `web` section of `cycle-2.patch` (sha256 `4797d993…`, equal to cycle-2's `diff_sha256`) is
identical to `git diff 330bc55 HEAD -- web`, apart from `index` lines. The code the cycle-2 reviews
judged is the code committed.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-24 | SATISFIED | `presence.tsx:16-23` `Absent`; `presence.tsx:29-47` `NotDeterminable` | `presence.test.tsx:15-90` | This story delivers the presence renderings, and they are distinct DOM. `Absent` is an `aria-hidden` dash with `sr-only` words. `NotDeterminable` is the `coverage-unknown` badge with a visible reason. Neither renders `0` or blank |
| AC-25 | SATISFIED | `format.ts:57-60` `formatClock` gives `HH:MM:SS zone` | `format.test.ts:63`, `:93-96` | Delivers the *checked {time}* formatter: `17:52:10 CDT` and `00:00:30 CST`, the second at midnight. Both also hold under `TZ=Asia/Tokyo`, `UTC` and `America/Los_Angeles` |
| DAC-E1-8 | SATISFIED | `presence.tsx:18-21` (`text-value-missing`, `aria-hidden` em dash, `sr-only` label); `:38-44` (row, `Badge variant="coverage-unknown"`, `aria-describedby={id}`, visible reason) | `presence.test.tsx:16-44`, `:46-51`, `:73-81` | `coverage-unknown` carries `bg-pattern-indeterminate`, `bg-value-indeterminate-muted` and `text-value-indeterminate`. The badge has no `opacity-*` and no `text-value-missing`. A caller's label is honoured. The row and reason classes are now pinned (`:24-31`) |
| DAC-E1-9 | SATISFIED | `format.ts:13-32` (`en-US`, `America/Chicago`, `h23`, `short`); `:48-81` | `format.test.ts:10-153` | All five formatters render the stated shapes. `grep -n toLocale format.ts` prints nothing. `formatDownloadName` resolves `startedAt ?? requestedAt` itself (DEC-0309) |
| DAC-E1-S6-1 | SATISFIED | `format.ts:48-54`, `:63-68` | `format.test.ts:12-44`, `:46-66` | October gives *CDT* and January *CST*. Seconds appear only with `{ seconds: true }`. `2026-03-08` comes back unshifted, also under the three foreign `TZ` values |
| DAC-E1-S6-2 | SATISFIED | `format.ts:71-76`, `:79-81` | `format.test.ts:71-89`, `:147-152` | `1236` gives `1,236`; `0`, `999`, `1000` and `1234567` are also checked. With `started_at` null, the name uses `requested_at`. With `started_at` set, it uses the start time; the two instants are six minutes apart, so the order is observable. An empty `started_at` now throws instead of falling back |
| DAC-E1-S6-3 | SATISFIED | `presence.tsx:36-44` | `presence.test.tsx:16-22`, `:33-44` | `getByText("Not determinable")` has the reason as its accessible description. The variant is `coverage-unknown`, never `status-good` or `coverage-absent` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `format.test.ts:10-67`, `// Implements TC-COMP-023` | Unchanged since v1. Every planned literal and the `describe.each` TZ block are present. Every named kill fails under its mutant. Fractional and minute-precision instants are not covered (IR-001, late) |
| T002 | complete | VERIFIED | `format.test.ts:69-90`, `// Implements TC-COMP-024` | Unchanged since v1. `group-width`, `swap-fallback` and `drop-download-prefix` are killed |
| T003 | complete | VERIFIED | `presence.test.tsx:15-63`, `// Implements TC-COMP-025` | `:24-31` was added by the rework (v1 IR-001). Every planned assertion is present, and the plan-fixed row and reason classes are pinned |
| T004 | complete | VERIFIED | `presence.test.tsx:65-69`, `:83-89` | Unchanged since v1. `badge-tab-stop`, `absent-tab-stop` and `absent-role-img` are killed |
| T005 | complete | VERIFIED | `format.test.ts:92-153` | Extended by the rework (v1 IR-002). The session-date and count guards now assert the message that names the input. The new cases are `"x2026-03-08"`, `Number.MAX_SAFE_INTEGER + 1`, `1e21`, three signed expanded-year instants and an empty `started_at`. Every listed input and kill is present |
| T006 | complete | VERIFIED | `format.ts:1-81` | Unchanged since v1 and implemented to DEC-0309. Deviation: the formatter is built per call (`chicago()`, `:19-32`). That deviation is still recorded only in the evidence (IR-004). There is no `toLocale` and no unit or hex literal; `token-literals.test.ts` passes |
| T007 | complete | VERIFIED | `presence.tsx:1-47` | Unchanged since v1. The markup matches T007 exactly, to DEC-0310 |
| T008 | complete | VERIFIED | Full suite: 99 files and 2509 tests. T008's six delivered files pass, 73 tests. `git diff --exit-code` on the delivered paths exits 0 | Reviewer-run (Independent Validation) |
| T009 | complete | VERIFIED | `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build` all exit 0 | Reviewer-run, before and after `npm ci` |
| T010 | complete | VERIFIED | `CAP-003-E1-S6-tdd-evidence.yaml` cycle-2 has `APPROVED`, `drift_detected: false`, `tests_executed: true` and `commit_hash: stage`. `diff_sha256` equals the reviewer's `shasum -a 256` of `cycle-2.patch`. `red_log_sha256` and `results_sha256` match their files. `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings | Cycle-2 is a test-only rework. Its RED re-applies the 11 v1 survivors, and each fails a new test; the reviewer's run reproduces all 11 kills. The cycle-1 one-cycle deviation is still recorded only in a comment (IR-004) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `formatInstant and formatSessionDate (TC-COMP-023)` (`format.test.ts:10-67`) / TC-COMP-023 | ADEQUATE | Independent literal strings, never another formatter's output. It kills `drop-timezone` (only under the TZ block, as planned), `long-zone`, `drop-hourcycle`, `hourcycle-h24`, `negate-seconds`, `seconds-default-on`, `session-via-date`, `locale-en-gb`, `year-2-digit`, `month-numeric`, `day-numeric`, `swap-day-month` and `year-as-month`. It also kills the reviewer's new `r2-short-generic` (`CT` instead of `CDT`), and the explicit-offset case kills `r2-iso-offset-plus-only` and `r2-iso-z-only` | Late: no fractional-second or minute-precision instant (IR-001) |
| `formatCount and formatDownloadName (TC-COMP-024)` (`format.test.ts:69-90`) / TC-COMP-024 | ADEQUATE | `0` is a measured zero. It covers the grouping boundaries 999 and 1000 and two groups (1234567). Kills `group-width`, `count-drop-boundary`, `count-drop-global`, `count-zero-throws`, `swap-fallback`, `drop-download-prefix` and `download-seconds` | none |
| `NotDeterminable (TC-COMP-025)` and `Absent (TC-COMP-025 edge)` (`presence.test.tsx:15-81`) / TC-COMP-025 | ADEQUATE | Accessible description via `toHaveAccessibleDescription`. The reason is visible, outside the badge and not `sr-only`. `:24-31` pins the row's `inline-flex items-center gap-2`, the reason's `text-xs text-muted-foreground`, and that the row holds the badge. Also pinned: the literal `data-variant`, the three badge classes, no dimming, the caller's label and unique ids. For Absent: the text, `aria-hidden`, `sr-only`, `text-value-missing` and no `0`. All v1 presence mutants are killed, plus `r2-row-flex`, `r2-row-gap-1`, `r2-row-items-start`, `r2-reason-sm` and `r2-reason-foreground` | Late: `r2-reason-aria-hidden` and `r2-reason-before-badge` survive (IR-002) |
| `is not a tab stop` and `is not a tab stop and carries no role` (`presence.test.tsx:65-69`, `:83-89`) / T004 | ADEQUATE | `userEvent.tab()` leaves focus on `body`, and the `img` and `status` roles are absent | none |
| `renders a clock with seconds and the zone` (`format.test.ts:93-96`) / T005 | ADEQUATE | `17:52:10 CDT` and the midnight `00:00:30 CST`, from a `Date`. Kills `clock-no-seconds` | none |
| `throws RangeError on the non-instant %j` and `on an invalid Date` (`format.test.ts:98-113`) / T005 | ADEQUATE | Asserts `RangeError` and the exact message for 5 strings, and a regex message for `new Date(NaN)`. Kills `negate-iso-guard`, `drop-nan-guard`, `iso-zone-optional`, `iso-check-non-string`, the generated `:36` and `:37` mutants and the offset-width mutants. Also kills `r2-nan-guard-dates-only` (via `"2026-13-45T99:00:00Z"`) and `r2-instant-message-unquoted` | Late: the guard's optional parts (IR-001) |
| `throws RangeError naming the non-date %j` (`format.test.ts:115-123`) / T005 | ADEQUATE | 5 inputs, now including `"x2026-03-08"`, with the exact message. Kills `date-shape-drop-caret`, `date-shape-drop-dollar`, `session-message`, `:65:off-by-one:1` and the generated width mutants | none |
| `throws RangeError naming the non-count %d` (`format.test.ts:125-131`) / T005 | ADEQUATE | 6 inputs, now including `2 ** 53` and `1e21`, with the message naming `n`. Kills `count-isinteger`, `count-message`, `negate-integer-guard`, `r2-count-negative-ok` and the generated `:72` mutants | none |
| `throws RangeError on the signed expanded-year instant %j` (`format.test.ts:133-141`) / T005 | ADEQUATE | `-00…`, `+00…` and `+01…` year forms, with the message. Kills `iso-drop-caret` | none |
| `throws RangeError when the download instants are not instants` and `throws on a malformed start time…` (`format.test.ts:143-152`) / T005 | ADEQUATE | A malformed `requestedAt` with a null start, and an empty `startedAt`, which must throw with the instant message rather than fall back. Kills `download-or` | none |
| Delivered `token-literals.test.ts`, `ui/vendoring.test.ts`, `api/render.test.tsx`, `app/status-region*.test.tsx` / T008 | ADEQUATE (unchanged) | The literal scan covers both new files. No `dangerouslySetInnerHTML`. `formatTimestamp`'s *America/Chicago* output still passes | none |

TC-COMP-023, TC-COMP-024 and TC-COMP-025 each keep their `// Implements TC-COMP-0NN` comment. They
match `tests/component/ui-components-tests.md` and the coverage-matrix rows DAC-E1-8, DAC-E1-9 and
DAC-E1-S6-1 to -3. The new tests are isolated and deterministic. They render fresh components and
call pure functions with literal inputs, and they read no clock, timer or network. The added
`toThrow(string)` assertions are substring matches, which is enough: each expected string ends with
the `JSON.stringify` or `String` of the input, so a blank, unquoted or renamed message fails.

### Mutation run (reviewer, `review` cycle)

The reviewer generated, scoped and ran the mutants as follows.

- `mutation-run.py generate --range 1f957aa..HEAD --cycle review` writes 21 mutants over
  `format.ts`: 16 `off-by-one` and 5 `negate-boolean`. These are the same 21 v1 generated.
- The reviewer added 15 hand-written mutants of their own (`r2-…`):
  - the instant pattern's optional fraction, optional seconds, offset sign and `Z`-only;
  - the NaN guard restricted to `Date` input, and the instant message unquoted;
  - `shortGeneric`, and the count guard's negative bound;
  - the row's `flex`, `gap-1` and `items-start`;
  - the reason's `text-sm`, `text-foreground` and `aria-hidden`, and the reason before the badge.
- `scope --since 330bc55 --previous CAP-003-E1-S6-implementation-review-v1-mutation.json` tags
  82 as `carried` (the 21 generated, the coder's 26 and v1's 35) and the 15 new ones as `late`.
  None of the previous mutants has stopped applying.

The run used `--jobs 4`. Its command ran the two story test files, then T008's
`token-literals.test.ts`, `ui/vendoring.test.ts` and `api/render.test.tsx`, then
`npx tsc --noEmit`. All four baselines exit 0. The results are in
`CAP-003-E1-S6-implementation-review-v2-mutation.json` (sha256
`9cbf6cd916c5ed3dc60d11cd31412b79c4585f6964ffc97c28d68642ab42ba56`).

| Mutants | Scope | Result | Equivalence judgment |
|---------|-------|--------|----------------------|
| v1's 11 non-equivalent survivors (`r-wrapper-no-class`, `r-wrapper-no-gap`, `r-reason-not-muted`, `r-reason-not-xs`, `r-date-shape-drop-caret`, `:65:off-by-one:1`, `r-session-message`, `r-count-message`, `r-count-isinteger`, `r-download-or`, `r-iso-drop-caret`) | carried | **all killed** | — (v1 IR-001, IR-002 resolved) |
| The other 66 carried mutants (v1's kills) | carried | all killed | — |
| `format.ts` `r-iso-drop-dollar` | carried | survived | Equivalent, as v1 found. In Node 22.19 (V8), every probed suffix after a complete instant makes `new Date` `NaN`, re-probed here: space, `\n`, `\r`, NBSP, `Zx`, `Z0`, `ZZ`, `+05:00:00` and ` extra`. `toDate` then throws the same `RangeError` with the same message |
| `format.ts` `r-hour-numeric`, `r-minute-numeric`, `r-second-numeric` | carried | survived | Equivalent, as v1 found. ICU's `en-US` `Hms` pattern pads to two digits whichever option is given. Re-probed: `01:05:03 CST` and `00:00:30 CST` print identically under each option |
| `format.ts` `r-part-fallback` | carried | survived | Equivalent, as v1 found. `toDate` admits only a valid `Date`, and `formatToParts` then always returns every part read. The fallback is unreachable |
| 11 of the reviewer's 15 `r2-…` | late | killed | — |
| `format.ts` `r2-iso-no-fraction` (`(?::\d{2}(?:\.\d+)?)?` → `(?::\d{2})?`) | late | **survived** | Not equivalent. `formatInstant("2026-10-15T22:46:00.123456+00:00")` would throw instead of rendering `2026-10-15 17:46 CDT`. T006 restates the delivered `ISO_INSTANT`, which admits a fraction, and the delivered precedent asserts that wire shape (`research/format.test.ts:138`) (IR-001) |
| `format.ts` `r2-iso-seconds-required` (seconds no longer optional) | late | **survived** | Not equivalent. `"2026-10-15T22:46Z"` would throw instead of rendering. T006's restated pattern admits it (IR-001) |
| `presence.tsx` `r2-reason-aria-hidden` (`aria-hidden="true"` on the reason) | late | **survived** | Not equivalent. T007 fixes the reason element's markup, which carries no `aria-hidden`. The mutant removes the reason from the reading order, so it would reach a screen reader only through the badge's description (IR-002) |
| `presence.tsx` `r2-reason-before-badge` (reason first, badge second) | late | **survived** | Not equivalent. T007 lists the badge, then the reason, and component design 2.5 and UX design 0.7 put the reason "beside" the badge (IR-002) |

Totals: 97 mutants, 88 killed, 9 survived (5 equivalent, 4 non-equivalent), 0 stillborn, 0
timeout. Every carried non-equivalent mutant is killed. The 4 non-equivalent survivors are `late`,
so none makes its test `WEAK` (skill E.9, H).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | N/A | `READY`. Without `--base-ref` it reports `BLOCKED` (see Review Subject). Not counted |
| `npx vitest run --root web src/components/patterns/format.test.ts src/components/patterns/presence.test.tsx` | component root | 0 | PASS | The narrowest story suites, run first: 2 files and 48 tests (40 + 8) |
| `npx vitest run --root web src/components/token-literals.test.ts src/components/ui/vendoring.test.ts src/api/render.test.tsx src/app/status-region` | component root | 0 | PASS | T008's six delivered files, unedited: 6 files, 73 tests |
| `npm run lint` | component root | 0 | PASS | Biome: 221 files, no findings. Run before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 221 files, no changes. Run before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output. Run before and after `npm ci` |
| `npm run build` | component root | 0 | PASS | Vite build, before and after `npm ci`. It writes only ignored files under `src/factorflow/api/static/` |
| `npm run test` | component root | 0 | PASS | Three full runs. Before `npm ci`: 99 files and 2509 tests pass. After `npm ci`, first run: 1 failure, in the delivered CAP-001 `screens/coverage/coverage-table.test.tsx` (*TC-COMP-063 … filters server-side, scrolls in its own container, and replaces pages*). It took 5858 ms at a load average of 685. After `npm ci`, second run: 99 files and 2509 tests pass. The failing file imports neither new module and was last changed by CAP-001 (`d0a124b`). It passes 4/4 in isolation. It is a load-sensitive delivered test, like the research flake v1 met, so the command is counted PASS |
| `npm ci` | component root | 0 | PASS | 308 packages added, 309 audited. `package.json` and `package-lock.json` are unchanged. Run after the mutation run, because every clone links this `node_modules` |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 1f957aab78f8edb73e8d3c3d5ea71de480f38c5e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. `grep -c /Users/` on the evidence file prints 0. The reviewer's `shasum -a 256` of `cycle-2.patch`, `red-cycle-2-review-survivors.log` and `mutation-cycle-2-results.json` matches the recorded values |
| `git diff --exit-code 1f957aa HEAD -- web/src/app web/src/screens web/src/api web/src/components/ui package.json package-lock.json tailwind.config.js tsconfig.json vite.config.ts vitest.config.ts design-system` | component root | 0 | PASS | The delivered files are unchanged (T008) |
| `git diff --stat 1f957aa HEAD -- . ':!docs'` | component root | 0 | PASS | Exactly the four planned source files (plan Validation Plan) |
| `grep -n "toLocale" web/src/components/patterns/format.ts` | component root | 1 | PASS | Prints nothing (plan Story-Specific Validation, DAC-E1-9) |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 1f957aa..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | N/A | 21 mutants |
| `python3 scripts/mutation-run.py scope --repo-dir <component> --mutants <scratch>/with-manual.json --since 330bc5592ecb… --previous <v1 -mutation.json> --out <scratch>/mutants.json` | harness root | 0 | N/A | 97 mutants: 82 `carried`, 15 `late` |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/work --logs <scratch>/results-logs --command 'ln -sfn <component>/node_modules node_modules && npx vitest run --root web <2 story and 3 T008 files> && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 3 | N/A | 97 mutants; all four baselines exit 0. Exit 3 reports survivors |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed, and none is in the story's validation list |

### Validation Side Effects

- Before: clean working tree at `f1cc0e7`. `pipeline-state.py code-revision` gives
  `sha256:e8285bea8e9efc5b81bc03dc828e5c915f409d6a909b031fd3e9ef32aedb900c`.
- After: clean working tree at `f1cc0e7`, with the same fingerprint. The build and the suite's own
  Vite build rewrite only ignored files under `src/factorflow/api/static/`, and `npm ci` rewrites only
  `node_modules/` (ignored). The mutation clones lived in the reviewer's scratchpad. This report and
  its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 3 · **total 4**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | late | No test passes a fractional-second or minute-precision instant, so the guard's optional parts are unpinned |
| IR-002 | LOW | late | The reason's place in the accessibility tree and its order after the badge are unpinned |
| IR-003 | LOW | carried | The instant guard accepts impossible calendar dates, which V8 rolls over (v1 IR-004) |
| IR-004 | LOW | carried | Plan deviations are recorded only in TDD-evidence comments, and the per-call formatter's comment misstates why (v1 IR-005) |

### IR-001 — No test passes a fractional-second or minute-precision instant, so the guard's optional parts are unpinned

- **Severity**: MEDIUM
- **Scope**: late. The line `format.ts:16` is unchanged since the baseline's `reviewed_head`
  `330bc55`, and `mutation-run.py scope` tags both survivors `late`. So this caps at MEDIUM and does
  not make TC-COMP-023 or T005 `WEAK`.
- **Status**: OPEN
- **Acceptance criteria**: N/A. DAC-E1-9 output for the tested forms is pinned. The gap is in the
  input forms that DEC-0309 and T006 admit.
- **Tasks**: T001, T005 (tests); T006 (the production code they should pin)
- **Files**: `web/src/components/patterns/format.ts:16`; `web/src/components/patterns/format.test.ts:10-67`, `:98-141`
- **Claim challenged**: The tests pin the instant forms `formatInstant` accepts, not only the forms
  it rejects.
- **Observed evidence**:
  - Every accepted instant in `format.test.ts` has whole seconds and either `Z` or `-05:00`.
  - Two non-equivalent mutants survive both story suites, T008's three delivered suites and `tsc`:
    - `r2-iso-no-fraction` drops `(?:\.\d+)?`, so `"2026-10-15T22:46:00.123456+00:00"` throws
      `RangeError`.
    - `r2-iso-seconds-required` makes the seconds mandatory, so `"2026-10-15T22:46Z"` throws.
  - The production code is correct. V8 parses both strings (`new Date(…).getTime()` is
    `1792104360123` and `1792104360000`), and the unmutated pattern admits them.
- **Expected evidence/behavior**:
  - T006 restates the delivered `ISO_INSTANT` of `research/format.ts:100`, which admits a fraction
    and optional seconds.
  - DEC-0309 accepts "an ISO-8601 instant with `Z` or an offset".
  - The delivered precedent pins the fraction for wire values:
    `research/format.test.ts:138` asserts
    `formatTimestamp("2026-10-15T22:46:00.123456+00:00")` is `"2026-10-15 17:46 CDT"`. The
    API's `requested_at`, `started_at` and `ended_at` are Python `datetime` fields
    (`src/factorflow/api/models.py:217-219`).
  - Skill E.9: a mutant that changes behaviour the task plan specifies is not equivalent.
- **Impact**: none today. A later edit to the pattern could reject microsecond wire timestamps with
  every test green. Every screen that formats a download time, a *checked* time or an as-of instant
  would then throw on real data: E3-S6, E3-S7, E4-S4, E5-S1, E5-S2, E6-S1, E6-S4 and E7-S5.
  Minute-precision instants are not on the wire, so the second mutant matters less.
- **Required remediation**: Optional (non-blocking). Add accepted-form cases to T001 or T005 so
  both mutants fail, for example:
  - `formatInstant("2026-10-15T22:46:00.123456+00:00")` is `"2026-10-15 17:46 CDT"`;
  - `formatInstant("2026-10-15T22:46Z")` is `"2026-10-15 17:46 CDT"`.

  No production change is required.

### IR-002 — The reason's place in the accessibility tree and its order after the badge are unpinned

- **Severity**: LOW
- **Scope**: late. `presence.tsx:39-44` is unchanged since `330bc55`, and both survivors are tagged
  `late`.
- **Status**: OPEN
- **Acceptance criteria**: N/A. DAC-E1-S6-3 (the reason as the accessible description) holds and is
  pinned.
- **Tasks**: T003 (test); T007 (markup)
- **Files**: `web/src/components/patterns/presence.tsx:39-44`; `web/src/components/patterns/presence.test.tsx:16-31`
- **Claim challenged**: TC-COMP-025 pins `NotDeterminable` as T007 renders it.
- **Observed evidence**:
  - `r2-reason-aria-hidden` adds `aria-hidden="true"` to the reason element, and it survives.
    `toHaveAccessibleDescription` still passes, because a description computed through
    `aria-describedby` includes hidden content. `getByText` does not filter `aria-hidden`.
  - `r2-reason-before-badge` swaps the two children, and it survives. `toContainElement` and
    `closest("[data-variant]")` do not read order.
- **Expected evidence/behavior**:
  - T007 gives the markup literally. `<Badge …>{label}</Badge>` comes first, then
    `<span id={id} className="text-xs text-muted-foreground">{reason}</span>`, with no
    `aria-hidden`.
  - Plan Resolved Conflict 2 chose a visible reason so that every viewer gets it beside the badge.
  - UX design 0.7 puts the reason "beside it or one interaction away".
- **Impact**: small. With the reason hidden, a screen reader could reach it only through the
  badge's description. On a non-focusable `span`, many screen readers do not announce that in
  browse mode. A swapped order would read the reason before the label.
- **Required remediation**: Optional. Assert that the reason has no `aria-hidden` attribute and
  appears after the badge in its row, for example with `compareDocumentPosition` or
  `row.lastElementChild === reason`.

### IR-003 — The instant guard accepts impossible calendar dates, which V8 rolls over (v1 IR-004)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006
- **Files**: `web/src/components/patterns/format.ts:34-40`, `:79-81`
- **Claim challenged**: DEC-0309's decision text says "every malformed input throws RangeError
  naming it".
- **Observed evidence**:
  - Unchanged since v1. `"2026-02-29T10:00:00Z"` matches `ISO_INSTANT`, and V8 rolls it over, so
    `formatInstant` renders `2026-03-01 04:00 CST` instead of throwing.
  - A further instance of the same wording gap comes from reading `:80`. When `startedAt` is
    non-null, `requestedAt` is never examined. So `formatDownloadName("2026-01-15T23:46:00Z",
    "not a time")` returns a name. This is exactly T006's expression and the owner's blind
    wording of DEC-0309 (`` `Download ${formatInstant(startedAt ?? requestedAt)}` ``).
- **Expected evidence/behavior**: Either the guard rejects an impossible calendar date, or the
  decision's scope is worded as the code behaves.
- **Impact**: none on any value the API serialises, because the server emits real datetimes and
  always sends `requested_at`. The decision text and the code disagree at these edges.
- **Required remediation**: Optional. Either reject a string whose calendar date does not survive
  the round trip, or narrow DEC-0309's "every malformed input" when component design 2.5 absorbs
  the signatures.

### IR-004 — Plan deviations are recorded only in TDD-evidence comments, and the per-call formatter's comment misstates why (v1 IR-005)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006, T010
- **Files**: `CAP-003-E1-S6-tdd-evidence.yaml:3-5`; `CAP-003-E1-S6-tasks.md` T006, T010; `web/src/components/patterns/format.ts:18`
- **Claim challenged**: the ticked task plan is the record of what was built.
- **Observed evidence**: The rework changed the plan only in `updated` and `last_reworked_review`.
  The cycle-2 description says IR-005 is "not taken up". Three deviations are still recorded only as
  YAML comments:
  - one TDD cycle for the coding stage instead of T010's two;
  - a formatter built per call instead of one module-level instance;
  - the instant message asserted for every non-instant.

  The code comment at `format.ts:18` still says "never one cached at load". The evidence gives the
  real reason: per-call construction is what lets the `drop-timezone` mutant be observed.
- **Expected evidence/behavior**: Deviations are visible where the plan's reader looks (skill C.4).
- **Impact**: none on behaviour.
- **Required remediation**: Optional. Note the deviations in the plan, beside T006 and T010 or
  under Notes. State the real reason for per-call construction in the code comment at the next
  change to `format.ts`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `presence.test.tsx:24-31` asserts `text-xs` and `text-muted-foreground` on the reason, and `inline-flex`, `items-center` and `gap-2` on its parent. It also asserts that the parent contains the badge. `r-wrapper-no-class`, `r-wrapper-no-gap`, `r-reason-not-muted` and `r-reason-not-xs` are killed in the reviewer's run, as are the new class substitutions `r2-row-flex`, `r2-row-gap-1`, `r2-row-items-start`, `r2-reason-sm` and `r2-reason-foreground`. TC-COMP-025 is `ADEQUATE` |
| v1/IR-002 | RESOLVED | The seven survivors are all killed in the reviewer's run: `r-date-shape-drop-caret`, `:65:off-by-one:1`, `r-session-message`, `r-count-message`, `r-count-isinteger`, `r-download-or` and `r-iso-drop-caret`. The tests: `format.test.ts:115-123` (`"x2026-03-08"` and the exact date message), `:125-131` (`2 ** 53`, `1e21`, the count message), `:133-141` (signed expanded years) and `:147-152` (empty `started_at`). The reviewer also reproduced the RED in `red-cycle-2-review-survivors.log` |
| v1/IR-003 | RESOLVED | The evidence header (`tdd-evidence.yaml:6`) now says the catalogue generates 21 TypeScript mutants. Cycle-2's `mutation:` block runs those 21, all killed, from `mutation-cycle-2-results.json` (baselines exit 0, `repo_head` `40f3330` plus the staged tree patch). The reviewer's `generate` writes the same 21, all killed. The cycle-1 baseline now reads 97 files and 2461 tests, which equals today's 99 files and 2509 tests minus the story's 2 files and 48 tests |
| v1/IR-004 | STILL OPEN | `format.ts:34-40` is unchanged. The cycle-2 description says IR-004 is optional and not taken up. Carried as IR-003 |
| v1/IR-005 | STILL OPEN | The plan and `format.ts:18` are unchanged on these points. Carried as IR-004 |

## Scope and Plan Deviations

- **Justified deviations**: these are unchanged from v1 and still recorded only in the evidence
  (IR-004).
  - The per-call formatter (T006). It is behaviourally identical, and it makes the plan's
    `drop-timezone` mutant observable.
  - One coding-stage cycle instead of two (T010). Cycle-2 is the review rework, not the plan's
    second cycle.
  - The instant message asserted for every non-instant (T005), and the explicit-offset case
    (T001). Both strengthen the tests.
- **Rework scope**: tests and evidence only, as v1's Follow-Up directed. No production file
  changed since `330bc55`.
- **Bookkeeping**: T001-T010 stay ticked and are each verified. The story is `status: in-review`,
  and the plan's `last_reworked_review` names v1, consistent with this re-review.
  - Cycle-1's description was edited after the fact, but only to restate the baseline v1 asked for
    (v1 IR-003). Its `diff_sha256`, patch and logs are unchanged.
- **Out-of-scope changes**: none.
- **Decision trailers**: `f1cc0e7` carries `Decision-Id: DEC-0309` and `DEC-0310` in the same
  paragraph as `Co-Authored-By`. `git log --format='%(trailers:key=Decision-Id)'` parses both.
- **Delivered flake**: `screens/coverage/coverage-table.test.tsx` (CAP-001) failed once at a load
  average of 685. It passed in isolation and in the next full run. This story does not touch it.
  It is recorded, not raised.
- **Decisions**: this review recorded none, because every judgment above follows from the sources
  below:
  - the story and the task plan;
  - epic DAC-E1-8 and DAC-E1-9;
  - component design 2.5 and UX design 0.7;
  - DEC-0309 and DEC-0310;
  - the delivered `research/format.ts` precedent and its tests;
  - v1 and skill H's scope rules.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E1-S6 against this report. The open findings are
  warnings and do not return the story to coding.
  - IR-001 and IR-002 are test additions that a later rework or the screen stories can take up.
  - IR-003 belongs to component design 2.5's next revision, when it absorbs DEC-0309.
  - IR-004 is a plan note and a code-comment correction, for whoever next changes the plan or
    `format.ts`.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW), IR-003 (LOW), IR-004 (LOW)
