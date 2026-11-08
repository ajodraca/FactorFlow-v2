---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E1-S6"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T23:04:24Z"
reviewed_head: "330bc5592ecb7f6b10975a180c29f75086d2669f"
review_base: "1f957aab78f8edb73e8d3c3d5ea71de480f38c5e"
reviewed_state_revision: "sha256:79c72a0126334fc9a6dcddb2b559a99bddd6683ffd07856c8508dd9dccf6a389"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-08T23:20:34Z
  source_artifacts:
    - id: CAP-003-E1-S6
      version: "1 (sha256:85bed54d31f641de20e87765f0e2f9e2c97ec255c0241b77dd657a7441bb7512)"
    - id: CAP-003-E1-S6-tasks
      version: "1 (draft, updated 2026-11-06)"
    - id: CAP-003-E1-S6-tdd-evidence
      version: "cycle-1"
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
    - id: ui-conventions
      version: "6"
    - id: DEC-0309
      version: "applied (provisional, owner upheld)"
    - id: DEC-0310
      version: "applied (provisional, owner upheld)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S6 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 7/7 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 12/12 passed |

This is the initial review of `330bc55` against review base `1f957aa`, the tip of the CAP-003
integration branch. No baseline exists, so every finding is in scope.

The production code is correct:

- `format.ts` builds every instant from `Intl.DateTimeFormat` parts in `en-US`, with
  `timeZone: "America/Chicago"`, `hourCycle: "h23"` and `timeZoneName: "short"`. It reads *CDT* or
  *CST* as the instant falls and never reads the machine zone.
- `formatSessionDate` returns its input unchanged after a shape check. `formatCount` groups by
  three. `formatDownloadName` falls back from the start time to the request time inside the
  function, as DEC-0309 records.
- `presence.tsx` renders `Absent` as an `aria-hidden` em dash with `sr-only` words in
  `text-value-missing`. It renders `NotDeterminable` as S1's `coverage-unknown` badge, with the
  reason visible beside it and named by `aria-describedby`.

Only the four planned source files changed. Every delivered file T008 names is unchanged, and all
12 required validation checks pass.

The gate fails on test strength. The reviewer ran 82 mutants: the 21 the catalogue generates, the
coder's 26 and 35 of the reviewer's own. 66 are killed and 16 survive. Five survivors are
equivalent and 11 are not.

- **IR-001 (HIGH).** TC-COMP-025 is `WEAK`. It does not pin the `NotDeterminable` wrapper and
  reason classes that plan T007 fixes. Four class-removal mutants survive every focused test and
  `tsc`. This is the same gap CAP-003-E1-S3 v1 IR-003 and CAP-003-E1-S4 v1 IR-004 raised at HIGH.
- **IR-002 (MEDIUM).** T005's guard tests miss 7 non-equivalent mutants. Each one lets a
  malformed input render, or drops the input's name from the error. DEC-0309 requires that every
  malformed input "throws RangeError naming it". T005 is an additional test, not a mandatory
  TC-ID, and every input and kill it lists is present.
- **IR-003 (LOW).** Two claims in the TDD evidence are not reproducible. It says the catalogue
  generates no TypeScript mutants, but it generates 21 here and one survives. Its suite baseline
  also does not match the review base.
- **IR-004 (LOW).** The instant guard accepts impossible calendar dates. V8 rolls them over, so
  the guard is narrower than DEC-0309's "every malformed input" wording.
- **IR-005 (LOW).** Three plan deviations appear only as TDD-evidence comments, and the per-call
  formatter's code comment gives an inaccurate reason.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S6-run-20261108T150357Z` |
| HEAD | `330bc5592ecb7f6b10975a180c29f75086d2669f` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z`, the driver's integration branch passed as `--base-ref`. `pipeline-state.py review-base` resolves it to `1f957aab78f8edb73e8d3c3d5ea71de480f38c5e`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` prints nothing). The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 41 against the review base (39 added, 2 modified) in one commit, `330bc55` |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review --base-ref
usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` reports `READY — story is ready for
independent review`. Without `--base-ref` it reports `BLOCKED — story coding has not reached
in-review`, because against the remote default branch the TDD lint cannot match the evidence. Skill
A.2 requires the driver's integration branch, so the reviewer used it.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/format.ts` | added (81 lines) | AC-25, DAC-E1-9, DAC-E1-S6-1, DAC-E1-S6-2; T006; DEC-0309 |
| `web/src/components/patterns/format.test.ts` | added (132 lines) | TC-COMP-023, TC-COMP-024; T001, T002, T005 |
| `web/src/components/patterns/presence.tsx` | added (47 lines) | AC-24, DAC-E1-8, DAC-E1-S6-3; T007; DEC-0310 |
| `web/src/components/patterns/presence.test.tsx` | added (81 lines) | TC-COMP-025; T003, T004 |
| `.../stories/CAP-003-E1-S6.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S6-tasks.md` | modified (T001-T010 ticked; `git diff --word-diff` shows exactly 10 `[ ]` to `[x]` changes) | bookkeeping |
| `.../stories/CAP-003-E1-S6-tdd-evidence.yaml` | added (one cycle) | T010 |
| `.../stories/CAP-003-E1-S6-evidence/cycle-1.patch` | added | T010 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S6-evidence/red-cycle-1-2-presence-and-formatters.log` | added | T010 (`red_log`) |
| `.../stories/CAP-003-E1-S6-evidence/mutants-cycle-1.json`, `mutation-cycle-1-results.json` and `mutation-cycle-1-results-logs/*.log` (32 files) | added | T010 (`mutation:`) |

No other source file changed: `git diff --stat 1f957aa..HEAD -- . ':!docs'` lists exactly the four
planned files. `git diff --exit-code 1f957aa..HEAD -- web/src/app web/src/screens web/src/api
web/src/components/ui package.json package-lock.json tailwind.config.js tsconfig.json vite.config.ts
vitest.config.ts design-system` exits 0 (T008). The delivered `formatTimestamp` in
`web/src/app/status-region.tsx` is untouched (system design assumption 5). No file outside the two
new test files imports `patterns/format` or `patterns/presence`.

`cycle-1.patch` (sha256 `066ca65c…`, matching `diff_sha256`) is byte-identical to `git diff
1f957aa..HEAD -- web`, apart from `index` lines. The code the reviews judged is the code committed.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-24 | SATISFIED | `presence.tsx:16-23` `Absent`; `presence.tsx:29-47` `NotDeterminable` | `presence.test.tsx:14-81` | This story delivers the presence renderings. The two are distinct DOM: an `aria-hidden` dash with `sr-only` words, and the `coverage-unknown` badge with a reason. Neither renders `0` or blank |
| AC-25 | SATISFIED | `format.ts:57-60` `formatClock` gives `HH:MM:SS zone` | `format.test.ts:63`, `:93-96` | *checked {time}* formatter delivered: `17:52:10 CDT`, `00:00:30 CST` (midnight), also under `TZ=Asia/Tokyo`, `UTC` and `America/Los_Angeles` |
| DAC-E1-8 | SATISFIED | `presence.tsx:18-21` (`text-value-missing`, `aria-hidden` em dash, `sr-only` label); `:39-44` (`Badge variant="coverage-unknown"`, `aria-describedby={id}`, visible reason) | `presence.test.tsx:16-54`, `:64-72` | `coverage-unknown` carries `bg-pattern-indeterminate`, `bg-value-indeterminate-muted` and `text-value-indeterminate` from S1 (`ui/badge.tsx`). No `opacity-*` and no `text-value-missing` on the badge. A caller's label is honoured. The test is weak on plan-fixed classes (IR-001) |
| DAC-E1-9 | SATISFIED | `format.ts:19-32` (`en-US`, `America/Chicago`, `h23`, `short`); `:48-81` | `format.test.ts:10-131` | All five formatters render the stated shapes. `grep -n toLocale format.ts` prints nothing. `formatDownloadName` resolves `startedAt ?? requestedAt` itself (DEC-0309) |
| DAC-E1-S6-1 | SATISFIED | `format.ts:48-54`, `:63-68` | `format.test.ts:12-44`, `:46-66` | October gives *CDT*, January *CST*. Seconds appear only with `{ seconds: true }`. `2026-03-08` comes back unshifted, including under three foreign `TZ` values |
| DAC-E1-S6-2 | SATISFIED | `format.ts:71-76`, `:79-81` | `format.test.ts:71-89` | `1236` gives `1,236` (plus `0`, `999`, `1000` and `1234567`). With `started_at` null the name uses `requested_at`. With `started_at` set, the six-minute-apart instants make the order observable |
| DAC-E1-S6-3 | SATISFIED | `presence.tsx:36-44` | `presence.test.tsx:16-22`, `:24-35` | `getByText("Not determinable")` has the reason as its accessible description. The variant is `coverage-unknown`, never `status-good` or `coverage-absent` (`variant-good` and `variant-absent` mutants killed) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `format.test.ts:10-67`, `// Implements TC-COMP-023` | Every planned literal is present: October, January, seconds on and off, `Date` input, both sides of the autumn change, midnight `00` and `2026-03-08`. The `describe.each` TZ block copies the precedent (`research/format.test.ts:159-177`), restore included. It adds an explicit-offset case. The named kills all fail under their mutants |
| T002 | complete | VERIFIED | `format.test.ts:69-90`, `// Implements TC-COMP-024` | Every planned count and download case is present. `group-width`, `swap-fallback` and `drop-download-prefix` are killed |
| T003 | complete | VERIFIED | `presence.test.tsx:14-54`, `:63-72`, `// Implements TC-COMP-025` | Every planned assertion is present. The test is weak on the wrapper and reason classes T007 fixes (IR-001) |
| T004 | complete | VERIFIED | `presence.test.tsx:56-60`, `:74-80` | Both components are not tab stops, and `Absent` has no `img` or `status` role. The reviewer's `badge-tab-stop`, `absent-tab-stop` and `absent-role-img` mutants are killed |
| T005 | complete | VERIFIED | `format.test.ts:92-131` | Every listed input is present, and the instant messages are asserted. The three named kills fail. Inputs and messages T005 does not list are unpinned (IR-002) |
| T006 | complete | VERIFIED | `format.ts:1-81` | Implemented to DEC-0309. Deviation: the formatter is built per call (`chicago()`, `:19-32`), not as T006's one module-level instance. The deviation is recorded only in the evidence (IR-005). No `toLocale` and no unit or hex literal (`token-literals.test.ts` passes) |
| T007 | complete | VERIFIED | `presence.tsx:1-47` | Markup matches T007 exactly, to DEC-0310. Imports `Badge` from `../ui/badge` and `useId`. Doc comments cite design 2.5, UX 0.7, DAC-E1-8, STD-UI-4 and STD-UI-14 |
| T008 | complete | VERIFIED | Full suite 99 files and 2501 tests; T008's six delivered files (73 tests) pass; `git diff --exit-code` on the delivered paths exits 0 | Reviewer-run (Independent Validation) |
| T009 | complete | VERIFIED | `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build` all exit 0 | Reviewer-run, before and after `npm ci` |
| T010 | complete | VERIFIED | `CAP-003-E1-S6-tdd-evidence.yaml`: cycle-1 `APPROVED`, `drift_detected: false`, `tests_executed: true`, `commit_hash: stage`, `diff_sha256` = `reviewed_patch` hash, `red_log_sha256` and `results_sha256` match (`shasum -a 256`), harness-relative paths. `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings | Deviation: one cycle, not T010's two (permission denied the unstage). The evidence records it only in a comment (IR-005). Two of the evidence's claims do not reproduce (IR-003) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `formatInstant and formatSessionDate (TC-COMP-023)` (`format.test.ts:10-67`) / TC-COMP-023 | ADEQUATE | Independent literal strings, never another formatter's output. It kills `drop-timezone` (only under the TZ block, as planned), `long-zone`, `drop-hourcycle`, `hourcycle-h24`, `negate-seconds`, `seconds-default-on`, `session-via-date`, `locale-en-gb`, `year-2-digit`, `month-numeric`, `day-numeric`, `swap-day-month` and `year-as-month` | none |
| `formatCount and formatDownloadName (TC-COMP-024)` (`format.test.ts:69-90`) / TC-COMP-024 | ADEQUATE | `0` is a measured zero. The grouping boundaries 999 and 1000 and two groups (1234567) are covered. Kills `group-width`, `count-drop-boundary`, `count-drop-global`, `count-zero-throws`, `swap-fallback`, `drop-download-prefix` and `download-seconds` | none for the fallback and separators. Malformed `started_at` belongs to IR-002 |
| `NotDeterminable (TC-COMP-025)` and `Absent (TC-COMP-025 edge)` (`presence.test.tsx:14-72`) / TC-COMP-025 | **WEAK** | Accessible description via `toHaveAccessibleDescription`. Reason visible, outside the badge, not `sr-only`. Literal `data-variant`, the three badge classes, no dimming, the caller's label and unique ids. Absent: text, `aria-hidden`, `sr-only`, `text-value-missing`, no `0`. Kills 15 presence mutants | Four non-equivalent class-removal mutants survive: `wrapper-no-class`, `wrapper-no-gap`, `reason-not-muted` and `reason-not-xs` (IR-001) |
| `is not a tab stop` and `is not a tab stop and carries no role` (`presence.test.tsx:56-60`, `:74-80`) / T004 | ADEQUATE | `userEvent.tab()` leaves focus on `body`; `img` and `status` roles absent. Kills `badge-tab-stop`, `absent-tab-stop` and `absent-role-img` | none |
| `renders a clock with seconds and the zone` (`format.test.ts:93-96`) / T005 | ADEQUATE | `17:52:10 CDT` and midnight `00:00:30 CST` from a `Date`. Kills `clock-no-seconds` | none |
| `throws RangeError on the non-instant %j` and `on an invalid Date` (`format.test.ts:98-113`) / T005 | WEAK | RangeError plus the exact message for 5 strings, a regex message for `new Date(NaN)`. Kills `negate-iso-guard`, `drop-nan-guard`, `iso-zone-optional`, `iso-check-non-string`, the generated `:36` and `:37` mutants, and the offset-width mutants | `iso-drop-caret` survives: a signed expanded-year string renders (IR-002) |
| `throws RangeError on the non-date %j` (`format.test.ts:115-120`) / T005 | WEAK | Class only, 4 inputs. Kills `negate-date-shape`, `date-shape-drop-dollar` and the generated width mutants | `date-shape-drop-caret`, `:65:off-by-one:1` and `session-message` survive (IR-002) |
| `throws RangeError on the non-count %d` (`format.test.ts:122-127`) / T005 | WEAK | Class only, 4 inputs. Kills `negate-integer-guard` and the generated `:72` mutants | `count-isinteger` and `count-message` survive (IR-002) |
| `throws RangeError when the download instants are not instants` (`format.test.ts:129-131`) / T005 | WEAK | A malformed `requestedAt` throws | A malformed `startedAt` is not tested: `download-or` survives (IR-002) |
| Delivered `token-literals.test.ts`, `ui/vendoring.test.ts`, `api/render.test.tsx`, `app/status-region*.test.tsx` / T008 | ADEQUATE (unchanged) | The literal scan covers both new files, and the comments carry no unit or hex literal. No `dangerouslySetInnerHTML`. `formatTimestamp`'s *America/Chicago* output still passes | none |

TC-COMP-023, TC-COMP-024 and TC-COMP-025 each carry their `// Implements TC-COMP-0NN` comment
and match `tests/component/ui-components-tests.md` and the coverage-matrix rows DAC-E1-8, DAC-E1-9
and DAC-E1-S6-1 to -3. The tests are isolated and deterministic:

- The `TZ` block sets and restores `process.env.TZ` per test.
- No timer, network or clock is read.
- Each `Date` is built from a literal instant.

The RED evidence is a module-resolution failure of both test files. That is the plan's Phase 2
checkpoint ("`format.ts` and `presence.tsx` do not exist"), so it is accepted as planned.

### Mutation run (reviewer, `review` cycle)

`mutation-run.py generate --range 1f957aa..330bc55 --cycle review` writes 21 mutants (16
`off-by-one`, 5 `negate-boolean`) over `format.ts`. The coder's evidence says it writes none
(IR-003). The reviewer added:

- the coder's 26 hand-written mutants, re-tagged `review`;
- 35 of their own (`r-…`): regex anchors, every `Intl` option, the locale, the part fallback, both
  guards, both error messages, `??` versus `||`, and the wrapper, reason, badge and `Absent`
  attributes.

The run used `--jobs 4`. Its command ran the two story test files, then T008's
`token-literals.test.ts`, `ui/vendoring.test.ts` and `api/render.test.tsx`, then
`npx tsc --noEmit`. All four baselines exit 0. The results are in
`CAP-003-E1-S6-implementation-review-v1-mutation.json` (sha256
`d924b26432494a432258837afe595a5aa11e84760d0ab8952f8f6f74ac1b6ff8`).

| Mutants | Result | Equivalence judgment |
|---------|--------|----------------------|
| Coder's 26 (all six plan mutants included) | 26 killed | — |
| Generated 20 of 21 | killed | — |
| Reviewer's 20 of 35 | killed | — |
| `presence.tsx` `r-wrapper-no-class` (`<span>`), `r-wrapper-no-gap` (`inline-flex items-center`) | **survived** | Not equivalent. Plan T007 fixes `<span className="inline-flex items-center gap-2">` around the badge and the reason. UX 0.7 puts the reason "beside it", and AC-26 requires token spacing (`gap-2` is `var(--space-2)`) (IR-001) |
| `presence.tsx` `r-reason-not-muted` (`text-xs`), `r-reason-not-xs` (`text-muted-foreground`) | **survived** | Not equivalent. T007 fixes `<span id={id} className="text-xs text-muted-foreground">` (IR-001) |
| `format.ts` `r-date-shape-drop-caret` | **survived** | Not equivalent. `formatSessionDate("x2026-03-08")` returns `"x2026-03-08"`. T006 fixes `^\d{4}-\d{2}-\d{2}$`, and DEC-0309 says every malformed input throws (IR-002) |
| `format.ts:65:off-by-one:1` (`ISO-8602`), `r-session-message` (empty message) | **survived** | Not equivalent. T006 fixes `RangeError("Not an ISO-8601 date: …")`, and DEC-0309 says the RangeError names the input (IR-002) |
| `format.ts` `r-count-message` (`"Not a count"`, without `n`) | **survived** | Not equivalent. DEC-0309: "every malformed input throws RangeError naming it" (IR-002) |
| `format.ts` `r-count-isinteger` (`Number.isInteger`) | **survived** | Not equivalent. `formatCount(2 ** 53)` gives `"9,007,199,254,740,992"` and `formatCount(1e21)` gives `"1e+21"`. Both should throw: DEC-0309 says "for a non-negative safe integer", and T006 fixes `Number.isSafeInteger` (IR-002) |
| `format.ts` `r-download-or` (`startedAt \|\| requestedAt`) | **survived** | Not equivalent. `formatDownloadName("", "2026-10-15T22:46:00Z")` renders `Download 2026-10-15 17:46 CDT` instead of throwing on the malformed `started_at` (DEC-0309) (IR-002) |
| `format.ts` `r-iso-drop-caret` | **survived** | Not equivalent. `"-002026-10-15T22:46:00Z"` passes and renders `2027-10-15 16:55 GMT-5:50:36`. `"+012026-…"` renders a five-digit year. T006 restates the delivered pattern's anchored four-digit year (IR-002) |
| `format.ts` `r-iso-drop-dollar` | survived | Equivalent. In Node 22.19 (V8), every probed suffix after a complete instant makes `new Date` `NaN`: space, `Z`, `0`, `:00`, `+05:00`, `\t`, `.`, `T`, `x` and others. `toDate` then throws the same `RangeError` with the same message |
| `format.ts` `r-hour-numeric`, `r-minute-numeric`, `r-second-numeric` | survived | Equivalent. ICU's `en-US` `Hms` pattern pads hours, minutes and seconds to two digits whichever option is given. Probes of `01:05:03` and `00:00:30` print identically, so the output DAC-E1-9 specifies is unchanged |
| `format.ts` `r-part-fallback` (`?? "?"`) | survived | Equivalent. `toDate` admits only a valid `Date`, and `formatToParts` then always returns the year, month, day, hour, minute, second and `timeZoneName` parts. The fallback is unreachable |

Totals: 82 mutants, 66 killed, 16 survived (5 equivalent, 11 non-equivalent), 0 stillborn, 0
timeout. Every kill traces to a story test or `tsc`. No delivered suite alone killed anything.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261108T150357Z` | harness root | 0 | N/A | `READY`; without `--base-ref`, `BLOCKED` (see Review Subject); not counted |
| `npx vitest run --root web src/components/patterns/format.test.ts src/components/patterns/presence.test.tsx` | component root | 0 | PASS | Narrowest story suites first: 2 files, 40 tests (33 + 7) |
| `npx vitest run --root web <T008's six delivered files>` | component root | 0 | PASS | `token-literals`, `ui/vendoring`, `api/render`, and three `app/status-region*` files: 6 files, 73 tests, unedited |
| `npm run lint` | component root | 0 | PASS | Biome: 221 files, no findings, before and after `npm ci` |
| `npm run format` | component root | 0 | PASS | Biome: 221 files, no changes, before and after `npm ci` |
| `npx tsc --noEmit` | component root | 0 | PASS | No output, before and after `npm ci` |
| `npm run build` | component root | 0 | PASS | Vite build, before and after `npm ci`. Writes only ignored files under `src/factorflow/api/static/` |
| `npm run test` | component root | 0 | PASS | Three full runs. Before `npm ci`: 99 files, 2501 tests. After `npm ci`, first run: 1 failure in the delivered CAP-002 `screens/research/results-table.test.tsx` (*restarts from page one once on a stale cursor of a later page*), under a load average of 548. After `npm ci`, second run: 99 files, 2501 tests. The failing file imports neither new module, passes 97/97 in three isolated reruns, and was last changed by CAP-002 (`f26e194`). It is the load-sensitive research flake earlier reviews in this run also met. Counted PASS |
| `npm ci` | component root | 0 | PASS | 308 packages; 10 audit advisories, none introduced (`package.json` and `package-lock.json` unchanged). Run after the mutation run, because every clone links this `node_modules`; run twice, the second time to capture the package counts |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 1f957aab78f8edb73e8d3c3d5ea71de480f38c5e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. `grep -c /Users/` on the evidence file prints 0. The reviewer's `shasum -a 256` of `cycle-1.patch`, the RED log and the results file matches the recorded values |
| `git diff --exit-code 1f957aa..HEAD -- web/src/app web/src/screens web/src/api web/src/components/ui package.json package-lock.json tailwind.config.js tsconfig.json vite.config.ts vitest.config.ts design-system` | component root | 0 | PASS | Delivered files unchanged (T008) |
| `git diff --stat 1f957aa..HEAD -- . ':!docs'` | component root | 0 | PASS | Exactly the four planned source files (plan Validation Plan) |
| `grep -n "toLocale" web/src/components/patterns/format.ts` | component root | 1 | PASS | Prints nothing (plan Story-Specific Validation, DAC-E1-9) |
| `python3 scripts/mutation-run.py generate --repo-dir <component> --range 1f957aa..330bc55 --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 21 mutants |
| `python3 scripts/mutation-run.py run --repo-dir <component> --mutants <scratch>/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/work --logs <scratch>/results-logs --command 'ln -sfn <component>/node_modules node_modules && npx vitest run --root web <2 story and 3 T008 files> && npx tsc --noEmit' --out <scratch>/results.json` | harness root | 1, 3, 3 | N/A | First attempt: the work root did not exist (`FileNotFoundError`). Second: 81 mutants. Third, the run of record, adds `r-count-message`: 82 mutants, all four baselines exit 0. Exit 3 reports survivors |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed; not in the story's validation list |

### Validation Side Effects

- Before: clean working tree at `330bc55`. `pipeline-state.py code-revision` gives
  `sha256:79c72a0126334fc9a6dcddb2b559a99bddd6683ffd07856c8508dd9dccf6a389`.
- After: clean working tree at `330bc55`, with the same fingerprint. The build and the suite's Vite
  build rewrite only ignored files under `src/factorflow/api/static/`. `npm ci` rewrote only
  `node_modules/` (ignored). Mutation clones lived in the reviewer's scratchpad. This report and
  its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 3 · **total 5**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | initial | TC-COMP-025 leaves the plan-fixed wrapper and reason classes of `NotDeterminable` unpinned |
| IR-002 | MEDIUM | initial | T005's guards leave seven malformed-input and message mutants alive |
| IR-003 | LOW | initial | Two TDD-evidence claims do not reproduce |
| IR-004 | LOW | initial | The instant guard accepts impossible calendar dates, which V8 rolls over |
| IR-005 | LOW | initial | Plan deviations recorded only in TDD-evidence comments; the per-call formatter's comment misstates why |

### IR-001 — TC-COMP-025 leaves the plan-fixed wrapper and reason classes of `NotDeterminable` unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-8, DAC-E1-S6-3, AC-24 (all satisfied by the code; the mandatory test that guards them is `WEAK`)
- **Tasks**: T003 (TC-COMP-025), T007
- **Files**: `web/src/components/patterns/presence.test.tsx:16-54`; `web/src/components/patterns/presence.tsx:38`, `:42`
- **Claim challenged**: T003's TC-COMP-025 pins `NotDeterminable` as T007 renders it: the badge with its reason "beside it" as visible text.
- **Observed evidence**:
  - Four class-removal mutants survive both story suites, T008's three delivered suites and `npx tsc --noEmit`:
    - `wrapper-no-class`: `<span>` for `<span className="inline-flex items-center gap-2">`.
    - `wrapper-no-gap`: `inline-flex items-center`.
    - `reason-not-muted`: `className="text-xs"`.
    - `reason-not-xs`: `className="text-muted-foreground"`.
  - The tests read the reason's position (outside the badge, `:20`), its visibility (not `sr-only`, `:21`) and the badge's classes (`:28-34`).
  - No test reads the wrapper's classes or the reason's classes.
- **Expected evidence/behavior**:
  - Plan T007 gives both elements literally: `<span className="inline-flex items-center gap-2">` holding the badge and `<span id={id} className="text-xs text-muted-foreground">{reason}</span>`.
  - UX design 0.7 requires the reason "beside it". AC-26 and STD-UI-29 require token spacing and type: `gap-2` is `var(--space-2)`, `text-xs` is `var(--text-xs)` and `text-muted-foreground` is a theme colour.
  - Skill E.9: a mutant that changes behaviour the task plan specifies is not equivalent, and its survival makes the test that should kill it `WEAK`.
  - This capability's precedent is CAP-003-E1-S3 v1 IR-003 and CAP-003-E1-S4 v1 IR-004. Both raised plan-fixed token classes left unpinned at HIGH, and the rework closed both.
- **Impact**:
  - A later edit can drop the gap and the centring between badge and reason, or restyle the reason as body text in the foreground colour, with every test green.
  - `NotDeterminable` is the not-determinable rendering on Home, Data health, the check cards, the download summary and the taken-over screens: CAP-003-E5-S1, E5-S2, E6-S1, E6-S4 and E7-S2.
- **Required remediation**: Assert `inline-flex`, `items-center` and `gap-2` on the element that holds the badge and the reason, and `text-xs` and `text-muted-foreground` on the reason element. Each of the four mutants above must then fail. No production change is required.

### IR-002 — T005's guards leave seven malformed-input and message mutants alive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (DAC-E1-9 output for well-formed input is pinned; the gap is the malformed-input contract of DEC-0309)
- **Tasks**: T005 (tests), T006 (production it should pin)
- **Files**: `web/src/components/patterns/format.test.ts:98-131`; `web/src/components/patterns/format.ts:16`, `:64-65`, `:72-73`, `:80`
- **Claim challenged**: T005 pins the formatters' input guards. Its stated concern is that a count is a whole number and "nothing the API never sent is rendered" (STD-UI-4).
- **Observed evidence**: seven non-equivalent mutants survive (see the mutation table).
  - Malformed input renders:
    - `date-shape-drop-caret`: `formatSessionDate("x2026-03-08")` returns it unchanged.
    - `count-isinteger`: `formatCount(2 ** 53)` and `formatCount(1e21)` render, the second as `1e+21`.
    - `download-or`: an empty `startedAt` silently falls back to the request time.
    - `iso-drop-caret`: `"-002026-10-15T22:46:00Z"` renders `2027-10-15 16:55 GMT-5:50:36`.
  - Error messages: the catalogue's `:65:off-by-one:1`, `session-message` and `count-message` change or blank the session-date and count messages. Those two tests assert only `toThrow(RangeError)`. The precedent `research/format.test.ts:151-157` also asserts the message.
- **Expected evidence/behavior**: DEC-0309 (owner upheld):
  - "formatSessionDate(value: string) (YYYY-MM-DD, returned unchanged after a shape check)";
  - "formatCount(n: number) for a non-negative safe integer";
  - "every malformed input throws RangeError naming it".

  T006 fixes the anchored shape check, `Number.isSafeInteger`, the delivered `ISO_INSTANT` pattern and `RangeError("Not an ISO-8601 date: …")`.
- **Impact**:
  - The production code is correct today. A later edit can weaken any of these guards with every test green, and the screens would then render values the API never sent, such as a prefixed session date, an exponent-notation count or a request time standing in for a malformed start time.
  - Every CAP-003 screen calls these formatters: E3-S6, E3-S7, E4-S4, E5-S1, E5-S2, E6-S1, E6-S4 and E7-S5.
  - Not HIGH: T005 is an additional unit test, not a mandatory TC-ID, and every input and kill it lists is present and passing. So no acceptance criterion, required task or required validation is incomplete (skill H, severity table).
- **Required remediation**: Extend T005's guard tests so each of the seven mutants fails:
  - a prefixed session date (for example `"x2026-03-08"`) throws;
  - `formatSessionDate` and `formatCount` errors carry the message that names the input (`Not an ISO-8601 date: "…"`; the count's own text naming `n`);
  - `Number.MAX_SAFE_INTEGER + 1` throws;
  - `formatDownloadName("", <instant>)` throws;
  - a signed expanded-year instant (for example `"+002026-10-15T22:46:00Z"`) throws.

  No production change is required.

### IR-003 — Two TDD-evidence claims do not reproduce

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010
- **Files**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6-tdd-evidence.yaml:6`, `:13`
- **Claim challenged**: the evidence says (`:6`) "mutation-run.py generates no mutants for TypeScript, so all 26 are hand-written", and (`:13`) "baseline before any change was npm run test, 95 files and 2381 tests green".
- **Observed evidence**:
  - `mutation-run.py generate --range 1f957aa..330bc55` writes 21 mutants over `format.ts`, and `:65:off-by-one:1` survives (IR-002). The cycle's `score: 1.0` covers only the hand-written set.
  - The review base has 97 test files and 2461 tests: 99 − 2 and 2501 − 40. That matches CAP-003-E1-S5 v2's count at `8dc1577`, and `git diff 8dc1577 1f957aa -- web` is empty. It does not match the stated 95 and 2381.
- **Expected evidence/behavior**: evidence that a reviewer can reproduce (T010; skill constraint 2). The S5 v1 statement that the catalogue has no TypeScript operators held for `tiers.ts`, which has no digits or boolean operators. It does not hold for `format.ts`.
- **Impact**: none on the code. The coder's mutation score overstates the cycle's coverage, and the stated baseline cannot be checked against the base it names.
- **Required remediation**: In the rework cycle, run `generate` over the story's range and include its mutants in the cycle's mutation block. Record the suite baseline as measured at the review base.

### IR-004 — The instant guard accepts impossible calendar dates, which V8 rolls over

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006
- **Files**: `web/src/components/patterns/format.ts:34-40`
- **Claim challenged**: DEC-0309's decision says "every malformed input throws RangeError naming it".
- **Observed evidence**:
  - `new Date("2026-02-29T10:00:00Z")` and `new Date("2026-04-31T10:00:00Z")` are valid in V8, which rolls them over to the next month. Both strings match `ISO_INSTANT`.
  - `formatInstant("2026-02-29T10:00:00Z")` therefore renders `2026-03-01 04:00 CST` instead of throwing.
  - The code follows T006's mechanism exactly ("a string failing the pattern or … any invalid `Date`") and the delivered `research/format.ts` precedent. The owner's own blind wording of DEC-0309 ("one that does not parse, throws") is met.
- **Expected evidence/behavior**: either the guard rejects a calendar date that does not exist, or the decision's scope is worded as the code behaves.
- **Impact**: none on any value the API serialises, because the server emits real datetimes. The decision text and the code disagree at this edge.
- **Required remediation**: Optional. Either reject a string whose calendar date does not survive the round trip, or narrow DEC-0309's "every malformed input" to "a string failing the pattern or not parsing" when component design 2.5 absorbs the signatures.

### IR-005 — Plan deviations recorded only in TDD-evidence comments; the per-call formatter's comment misstates why

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006, T010
- **Files**: `CAP-003-E1-S6-tdd-evidence.yaml:3-5`; `CAP-003-E1-S6-tasks.md` T006, T010; `web/src/components/patterns/format.ts:18-19`
- **Claim challenged**: the ticked task plan is the record of what was built.
- **Observed evidence**:
  - Three deviations appear only as YAML comments:
    - one TDD cycle instead of T010's two;
    - a formatter built per call (`chicago()`) instead of T006's "one module-level `Intl.DateTimeFormat`";
    - the instant message asserted for every non-instant.
  - The plan ticks T006 and T010 unchanged.
  - The code comment says the formatter is "Built per call so the zone is always the one named here, never one cached at load". With `timeZone` set, a module-level instance renders identically. The evidence gives the real reason: only per-call construction makes the planned `drop-timezone` mutant observable under the TZ block.
- **Expected evidence/behavior**: deviations visible where the plan's reader looks (skill C.4). The precedent is CAP-003-E1-S5 v1 IR-004 and CAP-003-E1-S4 v1 IR-007.
- **Impact**: none functional. The formatter is constructed on every call. Design §5 bounds the patterns to a few hundred items, and the `virtualised` table renders a window, so the cost is small; the coder's code reviewer rated it MEDIUM.
- **Required remediation**: Optional. Note the three deviations in the plan, beside T006 and T010 or under Notes, and state the real reason for per-call construction in the code comment.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations**: all three are recorded in the evidence, not the plan (IR-005).
  - The per-call formatter (T006). It is behaviourally identical, and it makes the plan's
    `drop-timezone` mutant observable.
  - One TDD cycle instead of two (T010).
  - The instant message asserted for every non-instant (T005). This strengthens the test, and
    `drop-nan-guard` is now killed.
  - The explicit-offset case added to T001 is also a strengthening.
- **Bookkeeping**: T001-T010 are ticked, and each is verified. Story `status: in-review` is
  consistent.
- **Out-of-scope changes**: none. Only the four planned source files and the story's evidence
  changed.
- **Decision trailers**: `330bc55` carries `Decision-Id: DEC-0309` and `DEC-0310`, which
  `git log --format='%(trailers:key=Decision-Id)'` parses. Both decisions (provisional, owner
  upheld) are implemented as recorded: `Instant = Date | string`, the two positional download
  instants, `Absent({ label })`, `NotDeterminable({ reason, label? })` with the visible reason
  under `aria-describedby`, and no `className` prop.
- **Delivered flake**: `screens/research/results-table.test.tsx` failed once under heavy load, and
  passed in isolation and in the next full run. It is a CAP-002 file that this story does not touch
  (see Independent Validation). It is recorded, not raised.
- **Decisions**: this review recorded none. Every judgment above follows from the story, the plan,
  epic DAC-E1-8 and DAC-E1-9, design 2.5 and §7, UX design 0.7, STD-UI-4, STD-UI-5, STD-UI-14,
  DEC-0309, DEC-0310 and this capability's earlier reviews.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Rework the tests only, in a new TDD cycle:
    - resolve IR-001 so that `wrapper-no-class`, `wrapper-no-gap`, `reason-not-muted` and
      `reason-not-xs` fail;
    - resolve IR-002 so that its seven guard and message mutants fail.
  - Include the catalogue's `generate` mutants in the cycle's mutation block, and record the suite
    baseline as measured (IR-003).
  - IR-004 and IR-005 are optional.
  - Set `last_reworked_review` to this report, then rerun `$adversarial-review`. The next review
    takes this report and `CAP-003-E1-S6-implementation-review-v1-mutation.json` as its baseline.
- **Warnings accepted downstream**: N/A
