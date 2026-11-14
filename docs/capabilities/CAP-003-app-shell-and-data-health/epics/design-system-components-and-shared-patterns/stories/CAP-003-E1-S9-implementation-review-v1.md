---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S9-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E1-S9"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-14T14:51:02Z"
reviewed_head: "5d044e3b82d7197cc33ada8499ad7c53fc27eb50"
review_base: "af4ef4f853422cdb650a47367c853e14d7ef688e"
reviewed_state_revision: "sha256:952cf91eb6802c3980df59a01d4531267ceead9166ccc70c4966b0a556089866"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-003-E1-S9
    artifact_version: 1
    content_revision: sha256:c3aab73a8ca50e1900c9a29bb252823bf3df659be4dea72e19ded2af1332c5c8
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T14:51:02Z
  source_artifacts:
    - id: CAP-003-E1-S9
      version: "1 (sha256:c3aab73a8ca50e1900c9a29bb252823bf3df659be4dea72e19ded2af1332c5c8)"
    - id: CAP-003-E1-S9-tasks
      version: "1 (draft, updated 2026-11-06)"
    - id: CAP-003-E1-S9-tdd-evidence
      version: "cycle-1"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "2"
    - id: CAP-003-component-design-ui-components
      version: "2"
    - id: CAP-003-ux-design
      version: "2"
    - id: CAP-003-ui-components-tests
      version: "2 (draft)"
    - id: CAP-003-coverage-matrix
      version: "2 (draft)"
    - id: STD-UI
      version: "6"
    - id: DEC-0313
      version: "applied (provisional, owner upheld)"
    - id: DEC-0314
      version: "applied (provisional, owner upheld)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S9 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 4/4 satisfied |
| Planned tasks | 7/7 verified |
| Required validation | 14/14 passed |

This is the initial review of `5d044e3` against review base `af4ef4f`, the tip of the CAP-003
integration branch for run `run-20261114T141555Z`. No baseline exists, so every finding is in
scope.

The production code is correct:

- `StateRegion<T>` takes the delivered `ScreenState<T>` unchanged (`web/src/api/types.ts` is
  untouched). It dispatches each kind to its own entry, so `empty-never-populated` is never
  rendered as `empty-no-match`.
- The renderer map requires all eight keys. `unreachable` accepts only `{ notApplicable }`.
  The reviewer's probe shows that the real type rejects four calls: one omitting `unreachable`,
  `error: {}`, `error: { notApplicable: undefined }`, and a call without `onRetry`.
- The error renders the caller's sentence inside a polite `output`. An `outline` **Try again**
  sits outside it and calls `onRetry` once per click. `requestId` is never read.
- `loading` is marked `aria-busy`, and `unreachable` renders nothing.

Only the two planned source files changed. All 14 required validation checks pass, and the
full suite runs 100 files and 2532 tests.

The gate fails on test strength. The reviewer ran 44 mutants: the coder's 12 and 32 of the
reviewer's own. The catalogue generates none for this file. 28 are killed and 16 survive, and
none of the 16 is equivalent.

- **IR-001 (HIGH).** TC-COMP-032 is `WEAK`. It asserts the type-level refusal for one omitted key,
  `error`. Three type loosenings survive `tsc` and the suite:
  - making `unreachable` optional;
  - making the `notApplicable` reason optional;
  - letting the reason be `undefined`.

  Each lets a call omit a state without a reason, which DAC-E1-10, DAC-E1-S9-2 and DEC-0313
  ("all eight keys required") forbid. Eight region stories build on this type.
- **IR-002 (MEDIUM).** T004 pins DEC-0314's wrapper semantics for one kind each. Eight survivors
  slip past it:
  - `aria-busy` on the two empty states, on `unavailable` and on the error;
  - a wrapper around the `populated` and `unavailable` output;
  - an `assertive` or `off` live region on the error.
- **IR-003 (MEDIUM).** No test pins the error branch's control. Five survivors slip past:
  - `onRetry` made optional, which DEC-0313 makes a required prop;
  - `type="button"` dropped, so **Try again** submits an enclosing form;
  - T005's layout classes `w-fit`, `gap-2` and `flex flex-col` removed.
- **IR-004 (MEDIUM).** The TDD evidence cites its RED log, reviewed patch and mutation results by
  absolute worktree paths. CAP-003-E1-S5 v1 IR-003 raised the same defect.
- **IR-005 (LOW).** A `loading` entry marked `notApplicable` renders an empty busy `div`, not the
  `null` that DEC-0313 states.
- **IR-006 (LOW).** Three plan deviations appear only in a TDD-evidence comment. The `output`
  substitution limits a caller's error renderer to phrasing content, and the story's own fixture
  nests a `p` inside it.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S9-run-20261114T141555Z` |
| HEAD | `5d044e3b82d7197cc33ada8499ad7c53fc27eb50` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z`, the driver's integration branch passed as `--base-ref`. `pipeline-state.py review-base` resolves it to `af4ef4f853422cdb650a47367c853e14d7ef688e`, an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain=v1 --untracked-files=all` prints nothing). The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 24 against the review base (22 added, 2 modified) in one commit, `5d044e3` |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review` reports `READY — story is ready for
independent review`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/state-region.tsx` | added (86 lines) | AC-24, DAC-E1-10; T005; DEC-0313, DEC-0314 |
| `web/src/components/patterns/state-region.test.tsx` | added (163 lines) | TC-COMP-031, TC-COMP-032; T002, T003, T004 |
| `.../stories/CAP-003-E1-S9.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S9-tasks.md` | modified (T001-T007 ticked; `git diff --word-diff=porcelain` shows exactly 7 `[ ]` to `[x]` changes and nothing else) | bookkeeping |
| `.../stories/CAP-003-E1-S9-tdd-evidence.yaml` | added (one cycle) | T007 |
| `.../stories/CAP-003-E1-S9-evidence/cycle-1.patch` | added | T007 (`reviewed_patch`) |
| `.../stories/CAP-003-E1-S9-evidence/red-cycle-1-state-region.log` | added | T007 (`red_log`) |
| `.../stories/CAP-003-E1-S9-evidence/mutation-cycle-1-results.json` and `mutation-cycle-1-results-logs/*.log` (17 files) | added | T007 (`mutation:`) |

No other source file changed. `git diff --stat af4ef4f..HEAD -- . ':!docs'` lists exactly the two
planned files. `git diff --exit-code af4ef4f..HEAD -- web/src/api/types.ts` exits 0 (DAC-E1-10
"unchanged", DAC-E7-13). `git diff --exit-code` over `web/src/app`, `web/src/screens`,
`web/src/api`, `web/src/components/ui`, `package.json`, `package-lock.json`, `tailwind.config.js`,
`tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `biome.json` and `design-system` exits 0.
No file outside the new test file imports `patterns/state-region`. That is expected, because the
consuming region stories are reverse dependencies.

`cycle-1.patch` (sha256 `6f78f3ba…`, matching `diff_sha256`) is identical to `git diff
af4ef4f..HEAD -- web`, apart from `index` lines. The code the cycle's reviews judged is the code
committed. The commit carries `Decision-Id: DEC-0313` and `DEC-0314`, which `git log
--format='%(trailers:key=Decision-Id,valueonly)'` parses.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-24 | SATISFIED | `state-region.tsx:54-85`: one `case` per kind, `empty-never-populated` (`:57-58`) and `empty-no-match` (`:59-60`) on their own entries; `NotApplicable` entries render nothing (`:45-47`, `:69`) | `state-region.test.tsx:53-69`, `:145-162` | This story delivers the eight-state pattern. Each region's own enumeration belongs to the consumer stories. Never-populated cannot collapse into no-match: the reviewer's and the coder's swap mutants are killed |
| DAC-E1-10 | SATISFIED | `state-region.tsx:2` imports `ScreenState` as a type, unchanged; `:35-37` requires every key, `unreachable` only as `NotApplicable`; `:67-78` error with `outline` **Try again**; `:79-80` `unreachable` renders `null` | `state-region.test.tsx:53-113` | "The error with its three parts" is the caller's sentence (DEC-0314). The type-level refusal holds for every key in the code (reviewer probe), but the test pins it for `error` only (IR-001) |
| DAC-E1-S9-1 | SATISFIED | `state-region.tsx:55-80` | `state-region.test.tsx:53-87` | Seven kinds each render only their own literal. The two empties differ. The error shows the operation and reason, and **Try again** calls the spy once on click and never on render. `unreachable` leaves the container empty. The plan's Resolved Conflict 1 reads "each of the eight kinds" with the epic's "leave the unreachable kind to the shell". The reviewer agrees: epic criteria govern |
| DAC-E1-S9-2 | SATISFIED | `state-region.tsx:35-37` | `state-region.test.tsx:93-104`, run by `npx tsc --noEmit` | Both directives consume the intended errors. With them removed, `tsc` reports `TS2322 Property 'error' is missing` at `:94` and `TS2322 '() => JSX.Element' is not assignable to type 'NotApplicable'` at `:104`. Weak against three loosenings (IR-001) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `af4ef4f`, `ui/button.tsx` exports `Button` with `outline` and `data-variant`, and `token-literals.test.ts` exists | The reviewer reran the base suite in a scratch clone at `af4ef4f`: 99 files, 2509 tests, exit 0. The coder's evidence does not record its own baseline. |
| T002 | complete | VERIFIED | `state-region.test.tsx:51-88`, `// Implements TC-COMP-031` | Every planned fixture literal and all four cases are present. All four named kills fail |
| T003 | complete | VERIFIED | `state-region.test.tsx:90-113`, `// Implements TC-COMP-032` | Cases (a), (b) and (c) are as planned, each declaration on the line after its directive and referenced by `toBeDefined()`. All three named kills fail (coder `:10`, `:11`, reviewer `r-drop-notapplicable-union`). Weak against three loosenings the plan did not list (IR-001) |
| T004 | complete | VERIFIED | `state-region.test.tsx:115-163` | All five planned cases are present, plus an error-`notApplicable` case. All the plan's named kills fail. Pins DEC-0314's wrappers for one kind each (IR-002) |
| T005 | complete | VERIFIED | `state-region.tsx:1-86` | Exports, signatures, relative imports and dispatch match T005 and DEC-0313. Two deviations: an `output` replaces `<div role="status">` (IR-006), and the `never` guard sits in a `default:` branch that renders nothing. No unit or hex literal, and no `dangerouslySetInnerHTML`. A `loading` entry marked `notApplicable` renders an empty busy `div` (IR-005) |
| T006 | complete | VERIFIED | All five commands exit 0. `token-literals.test.ts` and `render.test.tsx` scan the new file. Loosening experiment reproduced | The coder's mutant `:10` (`?:` on the mapped clause) fails `tsc` with `TS2578 Unused '@ts-expect-error' directive` at `state-region.test.tsx(93,5)` in the reviewer's run |
| T007 | complete | VERIFIED | `CAP-003-E1-S9-tdd-evidence.yaml`: cycle-1 `APPROVED`, `drift_detected: false`, `tests_executed: true`, `commit_hash: stage`, `diff_sha256` equals the `reviewed_patch` hash; `red_log_sha256` and `results_sha256` match (`shasum -a 256`). `check-tdd-evidence.py … --require-logs` reports 0 errors and 0 warnings | Deviation: one cycle for T002-T005, not the four test-only and production cycles the plan's Notes describe. It is recorded only in a comment (IR-006). The three evidence paths are absolute (IR-004) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `renders only the %s renderer's output` (`:53-59`) / TC-COMP-031 | ADEQUATE | Seven kinds. Each renderer interpolates its own state fields, so a misrouted state shows. Every other kind's literal is asserted absent. Kills coder `:1`, `:2` and `:7`, and `r-swap-no-match`, `r-swap-partial`, `r-swap-unavailable` and `r-swap-loading` | none |
| `never renders never-populated as no-match, or the reverse` (`:61-69`) / TC-COMP-031 step 2 | ADEQUATE | Both directions, with an unmount between renders | none |
| `renders the error's operation and reason with Try again wired to the caller's retry` (`:71-81`) / TC-COMP-031 step 3 | ADEQUATE | Exact sentence; `data-variant="outline"`; spy not called on render, exactly once on `user.click`. Kills coder `:6` and `:12`, and `r-error-entry-swap`, `r-error-message-only`, `r-try-again-label` and `r-retry-twice` | Control details are IR-003 |
| `leaves unreachable to the shell` (`:83-87`) / TC-COMP-031 edge | ADEQUATE | `toBeEmptyDOMElement` and the reason absent. Kills coder `:8` and `r-unreachable-empty-div` | none |
| `type-level coverage (DAC-E1-S9-2)` (`:90-113`) / TC-COMP-032 | **WEAK** | (a) omitted `error` and (b) a renderer for `unreachable` are refused; (c) a reason for `partial` is accepted. Kills coder `:10` and `:11`, `r-drop-notapplicable-union` and `r-renderer-unnarrowed` | `r-unreachable-optional`, `r-reason-optional` and `r-reason-undefined` survive (IR-001) |
| `marks the loading skeleton busy` / `does not mark populated busy` (`:116-124`) / T004 case 1 | WEAK | `closest('[aria-busy="true"]')` on loading and on populated. Kills coder `:3` and `r-busy-false` | `aria-busy` on never-populated, no-match and unavailable survives (IR-002) |
| `announces the error politely with Try again outside the announcement` (`:126-133`) / T004 case 2 | WEAK | `getByRole("status")` with exact text, no button inside, no `alert`. Kills coder `:4` and `:5` | `r-status-assertive`, `r-status-off` and `r-busy-error` survive. The role check cannot see `aria-live` or `aria-busy` (IR-002) |
| `never shows the envelope's request id` (`:135-138`) / T004 case 3 | ADEQUATE | `textContent` lacks `req-7f3a`. Kills `r-requestid-leak` | none |
| `offers no Try again for %s` (`:140-143`) / T004 case 4 | ADEQUATE | Six non-error kinds | none |
| `renders nothing for a kind whose entry is notApplicable` / `… for an error whose entry is notApplicable` (`:145-162`) / T004 case 5 | ADEQUATE | `partial` and `error` maps; container empty; reason absent. Kills coder `:2` and `:9`, `r-busy-partial` and `r-error-na-renders-button` | Unwrapped output is pinned through this case for `partial` only. `r-wrap-populated` and `r-wrap-unavailable` survive (IR-002) |
| Error-branch markup and the `onRetry` prop (T005; DEC-0313) | WEAK | No assertion on the button's `type`, on `w-fit`, on the wrapper's `flex flex-col gap-2`, or on `onRetry` being required | `r-onretry-optional`, `r-button-drop-type`, `r-button-no-wfit`, `r-wrapper-no-gap` and `r-wrapper-no-class` survive (IR-003) |
| Delivered `token-literals.test.ts`, `api/render.test.tsx`, `ui/button.test.tsx` / T006 | ADEQUATE (unchanged) | The literal scan walks `web/src/components/`, and the raw-HTML scan walks `web/src`. Both include `state-region.tsx`. Neither file changed | none |

TC-COMP-031 and TC-COMP-032 each carry their `// Implements TC-COMP-0NN` comment and match
`tests/component/ui-components-tests.md` l.725-765 and the coverage-matrix rows AC-24 (l.59),
DAC-E1-10 (l.75), DAC-E1-S9-1 (l.108) and DAC-E1-S9-2 (l.109). The tests are isolated and
deterministic:

- The fixtures are literals, never derived from `StateRegion`.
- No timer, clock or network is used.
- Each test renders into a fresh container.

React logs no nesting warning for the `p` inside the `output`, so the content-model issue in
IR-006 does not show in the logs.

The RED evidence is a module-resolution failure of `./state-region`. That matches the plan's
Phase 2 checkpoint ("fails at import"), so it is accepted as planned. The failing frame's
column, 49 on line 5, matches the committed test file's import line.

### Mutation run (reviewer, `review` cycle)

`mutation-run.py generate --range af4ef4f..5d044e3 --cycle review` writes 0 mutants, so the
catalogue has no operator that matches `state-region.tsx`. The coder's evidence agrees: all 12
of its mutants are hand-written. The reviewer ran:

- the coder's 12 hand-written mutants, re-tagged `review`;
- 32 of their own (`r-…`). These cover:
  - every type-level clause: the `unreachable` key, the reason's type, the entry union, the
    renderer's narrowing, and `onRetry`;
  - every dispatch case;
  - the loading wrapper and the unwrapped kinds;
  - the error wrapper's live region, content, guard, label, retry count, button type and classes.

The run used `--jobs 4`. Its command ran `state-region.test.tsx`, then T006's `token-literals.test.ts`
and `api/render.test.tsx`, then `npx tsc --noEmit`. All four baselines exit 0. The results are in
`CAP-003-E1-S9-implementation-review-v1-mutation.json` (sha256
`5e99f534005c8ea85bd73271ad66c0f3d6de2f64b77fabca50a356a55abebbd2`).

| Mutants | Result | Equivalence judgment |
|---------|--------|----------------------|
| Coder's 12 (all six plan mutants included) | 12 killed | Coder `:10` is killed by `TS2578` at the test's `:93` directive, as T006 intends. Its loosened keys also break the production file's own `renderEntry` calls |
| Reviewer's 16 of 32 | killed | `r-entry-undefined` (`StateRenderer<T, K> \| undefined`) is killed only by `TS2345` in `state-region.tsx` itself. It is a stillborn variant the compiler stops, not a test kill; `tsc` is a required validation, so it cannot ship |
| `r-unreachable-optional` (`{ readonly unreachable?: NotApplicable }`) | **survived** | Not equivalent. DEC-0313 says "all eight keys required" and rejects "Omit unreachable from the renderer map". Design 2.7 says "for each of the eight kinds". DAC-E1-10 requires refusing "a call that omits a state without `{ notApplicable: "reason" }`" (IR-001) |
| `r-reason-optional` (`notApplicable?: string`), `r-reason-undefined` (`notApplicable: string \| undefined`) | **survived** | Not equivalent. `error: {}` or `error: { notApplicable: undefined }` then type-checks: a state omitted with no reason. DAC-E1-10's `{ notApplicable: "reason" }`, DEC-0313's `{ notApplicable: string }`, and STD-UI-23's "record why one does not apply" all forbid that (IR-001) |
| `r-busy-never-populated`, `r-busy-no-match`, `r-busy-unavailable` | **survived** | Not equivalent. DEC-0314 says "Other kinds = renderer output unwrapped", and T004 case 1 says "no other kind's output has one". `aria-busy="true"` tells assistive technology the region is still updating, so a finished empty or unavailable state reads as loading (IR-002) |
| `r-busy-error` (`aria-busy` on the error wrapper) | **survived** | Not equivalent. DEC-0314 marks only loading busy. A busy ancestor can hold back the polite announcement DEC-0314 and STD-UI-24 require (IR-002) |
| `r-wrap-populated`, `r-wrap-unavailable` (`<>…</>` to `<div>…</div>`) | **survived** | Not equivalent. DEC-0314 says "Other kinds = renderer output unwrapped". An extra block element changes the caller's layout context, for example rows or grid children a renderer returns (IR-002) |
| `r-status-assertive`, `r-status-off` (explicit `aria-live` on the `output`) | **survived** | Not equivalent. DEC-0314 chose a polite status over `alert` for STD-UI-24 ("Content updated by polling MUST announce politely"). `assertive` interrupts, and `off` silences. The role-only assertions cannot tell (IR-002) |
| `r-onretry-optional` (`onRetry?: () => void`) | **survived** | Not equivalent. DEC-0313: "onRetry is a required top-level prop". A caller could then render an error whose **Try again** does nothing, against DAC-E1-S9-1's "wired to the caller's retry" and STD-UI-19's recovery action (IR-003) |
| `r-button-drop-type` (`type="button"` removed) | **survived** | Not equivalent. T005 fixes `type="button"`. S1's `Button` forwards no default `type`, so the element becomes a submit button inside any enclosing form (IR-003) |
| `r-button-no-wfit`, `r-wrapper-no-gap`, `r-wrapper-no-class` | **survived** | Not equivalent. T005 fixes `<div className="flex flex-col gap-2">` and `className="w-fit"`. Without `w-fit`, the button stretches across the column. Without `gap-2` (`var(--space-2)`), the sentence and the button touch. Without the flex classes, the inline `output` and the button share a line (IR-003) |

Totals: 44 mutants, 28 killed, 16 survived (0 equivalent, 16 non-equivalent), 0 stillborn by the
runner's patterns, 0 timeout. Every kill except `r-entry-undefined` traces to a story test or to a
`tsc` error in the story's test file.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review` | harness root | 0 | N/A | `READY`; not counted |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `af4ef4f…`, ancestor of HEAD; not counted |
| `npx vitest run src/components/patterns/state-region.test.tsx` | component root | 0 | PASS | Narrowest story suite first: 1 file, 23 tests |
| `npx vitest run src/components/patterns/state-region.test.tsx src/components/token-literals.test.ts src/api/render.test.tsx src/components/ui/button.test.tsx` | component root | 0 | PASS | Story suite plus T006's carry-over scans and S1's `button`: 4 files, 65 tests |
| `npm run lint` | component root | 0 | PASS | Biome: 223 files, no findings |
| `npm run format` | component root | 0 | PASS | Biome: 223 files, no changes |
| `npx tsc --noEmit` | component root | 0 | PASS | No output; both `@ts-expect-error` directives consumed |
| `npm run build` | component root | 0 | PASS | Vite build. Writes only ignored files under `src/factorflow/api/static/` |
| `npm run test` | component root | 0 | PASS | 100 files, 2532 tests (the review base has 99 and 2509: one file and 23 tests added) |
| `npm ci` (as `npm ci --prefix <scratch clone at 5d044e3>`) | scratch clone of the component repo at HEAD | 0 | PASS | 308 packages; 10 audit advisories, none introduced (`package.json` and `package-lock.json` unchanged since the base). Run in an identical-commit clone so the run's shared `node_modules`, which later stages and the mutation clones link, was not torn down. The story suite (23 tests), `tsc` and `biome lint` then pass against the fresh install |
| `npx vitest run --root web` at `af4ef4f` | scratch clone at the review base | 0 | PASS | T001 baseline: 99 files, 2509 tests |
| `python3 scripts/check-tdd-evidence.py --evidence <story>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base af4ef4f853422cdb650a47367c853e14d7ef688e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. The reviewer's `shasum -a 256` of `cycle-1.patch`, the RED log and the results file matches the recorded values. It passes only because the absolute paths point into this worktree (IR-004) |
| `git diff --exit-code af4ef4f..HEAD -- web/src/api/types.ts` | component root | 0 | PASS | DAC-E1-10 "unchanged" (plan Story-Specific Validation) |
| `git diff --stat af4ef4f..HEAD -- . ':!docs'` | component root | 0 | PASS | Exactly the two story files (T006, Phase 4 checkpoint) |
| `git diff --exit-code af4ef4f..HEAD -- <delivered paths, configs and design-system>` | component root | 0 | PASS | No delivered file changed |
| T006 loosening experiment: coder mutant `:10` under `mutation-run.py run` | harness root (clone) | 1 (command) | PASS | `tsc` fails with `TS2578 Unused '@ts-expect-error' directive` at `state-region.test.tsx(93,5)` |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range af4ef4f..HEAD --cycle review --out <scratch>/mutants-generated.json` | harness root | 0 | N/A | 0 mutants |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mut/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/mut/work --logs <scratch>/mut/results-logs --command 'ln -sfn <component>/node_modules node_modules && npx vitest run --root web src/components/patterns/state-region.test.tsx src/components/token-literals.test.ts src/api/render.test.tsx && npx tsc --noEmit' --out <scratch>/mut/results.json` | harness root | 1, then 3 | N/A | First attempt: the work root did not exist (`FileNotFoundError`), as CAP-003-E1-S6 v1 also met. Second, the run of record: 44 mutants, four baselines exit 0. Exit 3 reports survivors |
| Reviewer probes (`state-region.probe.test.tsx`, scratch clone only) | scratch clone at HEAD | 0 | N/A | Under the real type, `tsc` consumes four `@ts-expect-error` directives: a map omitting `unreachable`, `error: {}`, `error: { notApplicable: undefined }`, and a call without `onRetry`. A `loading` entry marked `notApplicable` renders `<div aria-busy="true"></div>` (IR-005). The probe was deleted, and the clone discarded from the review |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed; not in the story's validation list |

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
No command needed to leave the sandbox.

### Validation Side Effects

- Before: clean working tree at `5d044e3`. `pipeline-state.py code-revision` gives
  `sha256:952cf91eb6802c3980df59a01d4531267ceead9166ccc70c4966b0a556089866`.
- After: clean working tree at `5d044e3`, with the same fingerprint.
  - The build and the suite's build-output test rewrite only ignored files under
    `src/factorflow/api/static/`.
  - Mutation clones, the probe and `npm ci` ran in the reviewer's scratchpad.
  - This report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 1 · MEDIUM 3 · LOW 2 · **total 6**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | HIGH | initial | TC-COMP-032 pins the type-level refusal for `error` only; `unreachable` and the reason itself are unpinned |
| IR-002 | MEDIUM | initial | T004 pins DEC-0314's busy, unwrapped and polite semantics for one kind each |
| IR-003 | MEDIUM | initial | The error branch's control is unpinned: required `onRetry`, `type="button"` and T005's layout classes |
| IR-004 | MEDIUM | initial | TDD evidence cites its RED log, patch and mutation results by absolute worktree paths |
| IR-005 | LOW | initial | A `loading` entry marked `notApplicable` renders an empty busy `div`, not `null` |
| IR-006 | LOW | initial | Plan deviations recorded only in a TDD-evidence comment; the `output` substitution's phrasing-content limit is unstated |

### IR-001 — TC-COMP-032 pins the type-level refusal for `error` only; `unreachable` and the reason itself are unpinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-10, DAC-E1-S9-2, AC-24. The code satisfies all three. The mandatory test that guards them is `WEAK`.
- **Tasks**: T003 (TC-COMP-032), T005
- **Files**: `web/src/components/patterns/state-region.test.tsx:90-113`; `web/src/components/patterns/state-region.tsx:25-27`, `:35-37`
- **Claim challenged**: TC-COMP-032 makes the type-level refusal "a checked fact" (plan Summary): a call that omits a state without `{ notApplicable: "reason" }` fails `npx tsc --noEmit`.
- **Observed evidence**:
  - Three type loosenings survive the story suite, T006's two delivered scans and `npx tsc --noEmit`:
    - `r-unreachable-optional`: `{ readonly unreachable?: NotApplicable }`. A map with no `unreachable` key type-checks.
    - `r-reason-optional`: `readonly notApplicable?: string`. `error: {}` type-checks.
    - `r-reason-undefined`: `readonly notApplicable: string | undefined`. `error: { notApplicable: undefined }` type-checks.
  - The test's only refusal of an omission is case (a), which omits `error` (`:93-102`). Case (b) refuses a renderer for `unreachable`, which is a different property.
  - The reviewer's probe shows that the real type refuses all three calls, so the production code is correct. Only the test leaves it unpinned.
- **Expected evidence/behavior**:
  - DAC-E1-10 says `StateRegion` "MUST refuse to type-check a call that omits a state without `{ notApplicable: "reason" }`". DAC-E1-S9-2 and TC-COMP-032 restate it.
  - Design 2.7 says "a caller passes either a renderer or `{ notApplicable: "reason" }` for each of the eight kinds".
  - DEC-0313 (owner upheld) says "all eight keys required … `{ notApplicable: string }`". It lists "Omit unreachable from the renderer map" among the rejected alternatives.
  - Skill E.9: a mutant that changes behaviour a decision record specifies is not equivalent, "even when nothing in the system as built can observe the difference yet", and its survival makes the test `WEAK`. A `WEAK` mandatory test is at least HIGH (skill H).
- **Impact**:
  - The type is the seam for eight region stories: CAP-003-E4-S4, E5-S3, E6-S5 and E7-S1 to E7-S5.
  - A later edit could make `unreachable` optional, since it "is never rendered anyway", or let the reason go. Every region could then drop a state with no recorded reason, which is what STD-UI-23's specialization forbids, and every test would stay green.
- **Required remediation**: Add `@ts-expect-error` cases to the TC-COMP-032 block, each declaration on the line after its directive, so that each of the three mutants fails `tsc` with `TS2578`:
  - a map that omits `unreachable` but has every other key;
  - a map whose entry is `{}`, with no reason;
  - a map whose entry is `{ notApplicable: undefined }`.

  No production change is required.

### IR-002 — T004 pins DEC-0314's busy, unwrapped and polite semantics for one kind each

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. DAC-E1-10 and DAC-E1-S9-1 are pinned; the gap is DEC-0314's wrapper contract.
- **Tasks**: T004 (tests), T005 (the production code they should pin)
- **Files**: `web/src/components/patterns/state-region.test.tsx:116-133`, `:145-153`; `web/src/components/patterns/state-region.tsx:56-66`, `:71-72`
- **Claim challenged**: T004 pins DEC-0314: "Loading = caller's skeleton wrapped in aria-busy="true". Other kinds = renderer output unwrapped", and the error "inside role="status"", polite rather than assertive.
- **Observed evidence**: eight non-equivalent mutants survive.
  - `aria-busy="true"` wrapped around the output of `empty-never-populated`, `empty-no-match` or `unavailable`, or added to the error wrapper. Case 1 checks only that loading is busy and populated is not.
  - A `div` wrapped around the `populated` or `unavailable` output. Unwrapped output is pinned only for `partial`, through case 5's empty container.
  - `aria-live="assertive"` or `aria-live="off"` on the `output`. Case 2 checks the `status` role and the absence of `alert`. An explicit `aria-live` changes neither, yet it overrides the implicit polite live region.
- **Expected evidence/behavior**:
  - DEC-0314 (owner upheld) states the wrapper rules above.
  - T004 case 1: "no other kind's output has one".
  - STD-UI-24: "Content updated by polling MUST announce politely".
  - Skill E.9: these survivors are not equivalent.
- **Impact**:
  - The production code is correct today. A later edit could mark finished empty or unavailable regions as loading, or let a busy ancestor hold back the error announcement. It could also wrap renderer output that a caller lays out as rows or grid children, or turn the polite announcement assertive or silent. Every test would stay green.
  - Every region story renders through these wrappers.
  - Not HIGH: T004 is an additional unit test, not a mandatory TC-ID, and every case and kill it lists is present and passing. This follows CAP-003-E1-S6 v1 IR-002.
- **Required remediation**: Extend T004 so each of the eight mutants fails:
  - assert no `aria-busy` ancestor for every non-loading kind, the error included;
  - assert that each unwrapped kind's renderer output is the container's direct child;
  - assert that the error's status element carries no `aria-live` other than polite, or the equivalent observable for the chosen element.

  No production change is required.

### IR-003 — The error branch's control is unpinned: required `onRetry`, `type="button"` and T005's layout classes

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. DAC-E1-S9-1's "Try again wired to the caller's retry" is pinned for the click itself.
- **Tasks**: T002 case 3 and T004 (tests); T005 (production)
- **Files**: `web/src/components/patterns/state-region.tsx:42`, `:71`, `:73`; `web/src/components/patterns/state-region.test.tsx:71-81`, `:126-133`
- **Claim challenged**: the error branch renders T005's markup, `<div className="flex flex-col gap-2">` with a `<Button type="button" variant="outline" className="w-fit" onClick={onRetry}>`. Per DEC-0313, `onRetry` is a required prop.
- **Observed evidence**: five non-equivalent mutants survive.
  - `r-onretry-optional`: `onRetry?: () => void`. Every test passes `onRetry`, and no `@ts-expect-error` refuses a call without it. The reviewer's probe shows that the real type refuses such a call.
  - `r-button-drop-type`: `type="button"` removed. S1's `Button` (`ui/button.tsx:39-58`) sets no default `type`.
  - `r-button-no-wfit`, `r-wrapper-no-gap` and `r-wrapper-no-class`: the classes T005 fixes, removed.
- **Expected evidence/behavior**:
  - DEC-0313 (owner upheld): "onRetry is a required top-level prop".
  - T005 fixes the markup and classes literally. AC-26 requires token spacing, and `gap-2` is `var(--space-2)`.
  - Skill E.9: a mutant that changes behaviour the task plan specifies is not equivalent.
- **Impact**:
  - With `onRetry` optional, a caller could render an error whose **Try again** does nothing. STD-UI-19 requires a working recovery action.
  - Without `type="button"`, **Try again** submits any enclosing form. Setup's step states (CAP-003-E4-S4) render through `StateRegion`.
  - Without the classes, the button stretches across the column, or touches the sentence, or shares its line.
  - Every test stays green for each of these. Not HIGH: no mandatory TC-ID covers these details, and every planned case passes.
- **Required remediation**: Add tests so each of the five mutants fails:
  - a `@ts-expect-error` call to `StateRegion` without `onRetry`;
  - **Try again**'s `type` attribute equals `button`;
  - the button carries `w-fit`;
  - the element holding the status and the button carries `flex`, `flex-col` and `gap-2`.

  No production change is required.

### IR-004 — TDD evidence cites its RED log, patch and mutation results by absolute worktree paths

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9-tdd-evidence.yaml:11`, `:22`, `:26`
- **Claim challenged**: T007 says the evidence names each cycle's RED log, reviewed patch and mutation results, so that `check-tdd-evidence.py --require-logs` can verify them.
- **Observed evidence**:
  - `red_log`, `reviewed_patch` and `mutation.results` are absolute paths under `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b/`.
  - `check-tdd-evidence.py` resolves them with `os.path.join(ROOT, …)` (l.434), and an absolute path overrides `ROOT`.
  - CAP-003-E1-S5 (after its v1 IR-003) and CAP-003-E1-S6 use harness-relative `repos/factorflow-v2/…` paths. `grep -c /Users/` prints 0 for both, and 3 for S9.
- **Expected evidence/behavior**: evidence paths resolvable from any harness checkout, as `--require-logs` intends: "counts that point at nothing are not evidence". CAP-003-E1-S5 v1 IR-003 raised the same defect at MEDIUM, and the rework resolved it.
- **Impact**:
  - Once this run's worktree is removed, the lint fails from any other checkout, on files that exist in the repository.
  - `pipeline-state.py` runs that lint while no passing review exists, so the story would read `story-coding: RESUME` there.
- **Required remediation**: Record all three paths as harness-relative `repos/factorflow-v2/FactorFlow-v2/docs/…` paths, as S6's evidence does, and keep the lint passing.

### IR-005 — A `loading` entry marked `notApplicable` renders an empty busy `div`, not `null`

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T005
- **Files**: `web/src/components/patterns/state-region.tsx:55-56`
- **Claim challenged**: DEC-0313 (owner upheld) says "StateRegion renders null for unreachable and for any kind whose entry is notApplicable".
- **Observed evidence**:
  - The reviewer's probe renders `state: loading` with `loading: { notApplicable: "always ready" }`. The container holds `<div aria-busy="true"></div>`.
  - Every other kind, the error included, renders nothing in this case.
  - The code follows T005's literal markup (`<div aria-busy="true">{renderEntry(...)}</div>`). The plan and the decision disagree at this edge.
- **Expected evidence/behavior**: either `StateRegion` renders `null` for a `loading` entry marked `notApplicable`, or DEC-0313's wording is narrowed when design 2.7 absorbs it.
- **Impact**: none visible. An empty element marked busy is left in a region that declared loading inapplicable. A consumer test that expects an empty container would fail.
- **Required remediation**: Optional. Return `null` when the `loading` entry is `NotApplicable`, and pin it with a case like T004 case 5. Or record the exception against DEC-0313.

### IR-006 — Plan deviations recorded only in a TDD-evidence comment; the `output` substitution's phrasing-content limit is unstated

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T005, T007
- **Files**: `CAP-003-E1-S9-tdd-evidence.yaml:1-4`; `CAP-003-E1-S9-tasks.md` T005, T007 and Notes; `web/src/components/patterns/state-region.tsx:17-22`, `:72`, `:81-84`; `web/src/components/patterns/state-region.test.tsx:39`
- **Claim challenged**: the ticked task plan is the record of what was built.
- **Observed evidence**:
  - Three deviations appear only in YAML comments or not at all:
    - one TDD cycle for T002-T005, not the four the plan's Notes describe;
    - `<output>` (implicit `role="status"`) for T005's `<div role="status">`, because Biome's `a11y/useSemanticElements` rejects the latter;
    - the `never` guard in a `default:` branch, not after the switch. This one is not recorded anywhere.
  - The plan ticks T005 and T007 unchanged.
  - The `output` follows repository precedent (`app/status-region.tsx:253-256`, `screens/research/notices.tsx:94-97`) and keeps DEC-0314's polite semantics.
  - But `notices.tsx:105` records that "an `output` holds phrasing content only". `StateRegion` places the caller's whole error renderer inside it, and the story's own fixture returns a `p` (`state-region.test.tsx:39`). The doc comment does not tell the eight consumer stories that the error renderer must return phrasing content.
- **Expected evidence/behavior**: deviations visible where the plan's reader looks (skill C.4). Precedent: CAP-003-E1-S5 v1 IR-004 and CAP-003-E1-S6 v1 IR-005.
- **Impact**: none functional today. React logs no nesting warning. Consumer error renderers that return block content would produce non-conforming markup.
- **Required remediation**: Optional.
  - Note the three deviations in the plan, beside T005 and T007 or under Notes.
  - State in `StateRegion`'s doc comment that the `error` renderer returns phrasing content, and make the fixture return phrasing content.
  - Alternatively, choose a wrapper that admits flow content while keeping a polite status, and record the choice against DEC-0314.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations**: the three in IR-006.
  - `output` for `<div role="status">`. It carries the same implicit role and follows repository precedent and Biome's rule.
  - One TDD cycle instead of four. The tests and the production file form one new pair, so test-only cycles would have had nothing to mutate.
  - The `never` guard in `default:`. That branch renders nothing, so no state falls through to a rendering.

  The extra error-`notApplicable` case in T004 is a strengthening.
- **Bookkeeping**: T001-T007 are ticked, and each is verified. Story `status: in-review` is
  consistent.
- **Out-of-scope changes**: none. Only the two planned source files and the story's evidence
  changed.
- **Resolved conflicts in the plan**: the reviewer checked all three against the sources and
  agrees.
  - `unreachable` is left to the shell: epic DAC-E1-10 over story DAC-E1-S9-1.
  - STD-UI-23's *stale* is rendered inside `populated` and `partial`.
  - The skeleton is the caller's, so `state-region.tsx` imports only S1's `Button`.
- **Decision trailers**: `5d044e3` carries `Decision-Id: DEC-0313` and `DEC-0314`. Both
  decisions (provisional, owner upheld) are implemented as recorded, with one exception: the
  `loading`-`notApplicable` edge in IR-005.
- **Source versions**: the plan cites component design and capability v1. Both are now v2. The
  design 2.7 and epic DAC-E1-10 text the plan quotes is unchanged in the current versions.
- **Decisions**: this review recorded none. Every judgment above follows from the story, the plan,
  epic DAC-E1-10, design 2.7 and §7, UX design 0.5 and 0.7, STD-UI-19, STD-UI-23, STD-UI-24,
  DEC-0313, DEC-0314 and this capability's earlier reviews.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**:
  - Rework the tests only, in a new TDD cycle:
    - resolve IR-001 so that `r-unreachable-optional`, `r-reason-optional` and
      `r-reason-undefined` fail `tsc`;
    - resolve IR-002 so that its eight wrapper mutants fail;
    - resolve IR-003 so that its five control mutants fail.
  - Make the evidence paths harness-relative (IR-004). IR-005 and IR-006 are optional.
  - Set `last_reworked_review` to this report, then rerun `$adversarial-review`. The next review
    takes this report and `CAP-003-E1-S9-implementation-review-v1-mutation.json` as its baseline.
- **Warnings accepted downstream**: N/A
