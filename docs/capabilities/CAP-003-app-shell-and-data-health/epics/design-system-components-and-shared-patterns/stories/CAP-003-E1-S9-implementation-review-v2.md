---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S9-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E1-S9"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-14T15:17:43Z"
reviewed_head: "27426bfbb51c991d350772ebee60624bcacdbfdf"
review_base: "af4ef4f853422cdb650a47367c853e14d7ef688e"
reviewed_state_revision: "sha256:1cb4286181240a16d1a34cf7c30473def166342e3f891842ba2222285b665dc8"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-14T15:17:43Z
  source_artifacts:
    - id: CAP-003-E1-S9
      version: "1 (sha256:c3aab73a8ca50e1900c9a29bb252823bf3df659be4dea72e19ded2af1332c5c8)"
    - id: CAP-003-E1-S9-tasks
      version: "1 (draft, updated 2026-11-14, last_reworked_review v1)"
    - id: CAP-003-E1-S9-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E1-S9-implementation-review
      version: "1 (baseline, CHANGES-REQUIRED, reviewed_head 5d044e3)"
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

# Implementation Review: CAP-003-E1-S9 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 4/4 satisfied |
| Planned tasks | 7/7 verified |
| Required validation | 14/14 passed |

Four findings remain, none blocking: IR-001 (MEDIUM, late), IR-002 (LOW, late), IR-003 (LOW,
carried from v1 IR-005) and IR-004 (LOW, carried from v1 IR-006).

This re-review covers `27426bf` against review base `af4ef4f`. The baseline is v1
(`CHANGES-REQUIRED`, `reviewed_head` `5d044e3`).

The rework changed tests only:

- `git diff --exit-code 5d044e3..HEAD -- web/src/components/patterns/state-region.tsx` exits 0.
- `git diff --stat 5d044e3..HEAD -- . ':!docs'` lists only `state-region.test.tsx` (+67 lines).

The production code is the code v1 found correct.

v1's four required findings are resolved:

- **v1 IR-001 (HIGH).** TC-COMP-032 now has three more `@ts-expect-error` cases: a map without
  `unreachable`, an entry of `{}`, and an entry whose reason is `undefined`. It also has a JSX call
  without `onRetry`.
  - The reviewer removed all six directives in a scratch clone. `tsc` then reports exactly one
    intended error under each one: TS2322 at `:94`, `:104`, `:116`, `:126` and `:129`, and TS2741
    at `:137`.
  - `r-unreachable-optional`, `r-reason-optional` and `r-reason-undefined` now fail with `TS2578`.
- **v1 IR-002 and IR-003 (MEDIUM).** All 13 of their survivors are killed. A new `describe` block
  (`:192-230`) kills 12. The `onRetry` case in TC-COMP-032 (`:135-139`) kills the thirteenth,
  `r-onretry-optional`.
- **v1 IR-004 (MEDIUM).** Every evidence path is harness-relative. `grep -c /Users/` prints 0, and
  `check-tdd-evidence.py --require-logs` reports 0 errors.

This review ran 51 mutants:

- v1's 44, re-tagged `carried` by `scope --previous`;
- 7 of the reviewer's own, tagged `late` because the production file has not changed since `5d044e3`.

The catalogue again generates 0 mutants. 48 mutants are killed, and all 16 of v1's survivors are
among them. 3 `late` mutants survive, and none is equivalent:

- `unreachable: NotApplicable | undefined` and `onRetry: (() => void) | undefined`. These are two
  `| undefined` loosenings, the same family as v1 IR-001. They are reported as IR-001 (MEDIUM).
- The error branch's **Try again** moved before the status sentence. This is IR-002 (LOW).

A `late` survivor cannot block and does not make its test `WEAK` (skill H, *Re-review scope*).
The reviewer's probe shows that the real type refuses both `undefined` calls, so the production
code is correct.

v1's two LOW findings, IR-005 and IR-006, are still open. The rework commit says it left them
open. They carry forward as IR-003 and IR-004.

All 14 required validation commands pass. The full suite runs 100 files and 2548 tests: v1's 2532
plus the 16 new tests.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9-tasks.md` (`last_reworked_review: CAP-003-E1-S9-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S9-run-20261114T141555Z` |
| HEAD | `27426bfbb51c991d350772ebee60624bcacdbfdf` |
| Review base | The driver passed its integration branch, `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z`, as `--base-ref`. `pipeline-state.py review-base` resolves it to `af4ef4f853422cdb650a47367c853e14d7ef688e`. That commit is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) and is unchanged since v1 |
| Working tree | Clean before and after validation: `git status --porcelain=v1 --untracked-files=all` prints nothing. The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 50 against the review base (48 added, 2 modified) in three commits: `5d044e3` (story coding), `e3d245e` (review v1) and `27426bf` (rework 1). Since the baseline, 29 changed (26 added, 3 modified) |
| Baseline | v1, `CAP-003-E1-S9-implementation-review-v1.md`, `reviewed_head` `5d044e3b82d7197cc33ada8499ad7c53fc27eb50`, with `CAP-003-E1-S9-implementation-review-v1-mutation.json` |

`pipeline-state.py check --stage adversarial-review` reports `READY — review changes were
reworked; a new review version is required`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/state-region.tsx` | added (86 lines), unchanged since `5d044e3` | AC-24, DAC-E1-10; T005; DEC-0313, DEC-0314 |
| `web/src/components/patterns/state-region.test.tsx` | added (230 lines; +67 since `5d044e3`) | TC-COMP-031, TC-COMP-032; T002, T003, T004; v1 IR-001 to IR-003 rework |
| `.../stories/CAP-003-E1-S9.md` | modified (`status: planning` to `in-review`), unchanged since `5d044e3` | story-coding lifecycle |
| `.../stories/CAP-003-E1-S9-tasks.md` | modified. T001-T007 are ticked. Since `5d044e3`, only `updated: 2026-11-14` and `last_reworked_review` | bookkeeping; rework protocol |
| `.../stories/CAP-003-E1-S9-tdd-evidence.yaml` | added. Since `5d044e3`, three paths are made relative and `cycle-2` is appended | T007; v1 IR-004 |
| `.../stories/CAP-003-E1-S9-evidence/cycle-1.patch`, `red-cycle-1-state-region.log`, `mutation-cycle-1-results.json`, `mutation-cycle-1-results-logs/*.log` (16 logs) | added in `5d044e3` | T007 (cycle-1) |
| `.../stories/CAP-003-E1-S9-evidence/cycle-2.patch`, `mutants-cycle-2.json`, `red-cycle-2-review-survivors.log`, `mutation-cycle-2-results.json`, `mutation-cycle-2-results-logs/*.log` (20 logs) | added in `27426bf` | T007 (cycle-2) |
| `.../stories/CAP-003-E1-S9-implementation-review-v1.md`, `-v1-mutation.json` | added in `e3d245e` | adversarial review v1 |

No other source file changed:

- `git diff --stat af4ef4f..HEAD -- . ':!docs'` lists exactly the two planned files.
- `git diff --exit-code af4ef4f..HEAD -- web/src/api/types.ts` exits 0 (DAC-E1-10 "unchanged",
  DAC-E7-13).
- `git diff --exit-code` exits 0 over the delivered paths: `web/src/app`, `web/src/screens`,
  `web/src/api`, `web/src/components/ui`, `package.json`, `package-lock.json`,
  `tailwind.config.js`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `biome.json` and
  `design-system`.
- No file under `web/src` outside `patterns/state-region*` imports `patterns/state-region`. The
  consumer stories are reverse dependencies.

`cycle-2.patch` (sha256 `5792c4e3…`, equal to the cycle's `diff_sha256`) holds two diffs:
`mutants-cycle-2.json` and the test file. Its `web/` section is identical to
`git diff 5d044e3..27426bf -- web`, apart from `index` lines. The code the cycle's reviews judged
is the code committed.

The `red_log_sha256` and `results_sha256` values match `shasum -a 256` of their files.
`mutation-cycle-2-results.json` records `repo_head` `e3d245e` with a `tree_patch_sha256` equal to
the cycle-2 patch hash. `27426bf` carries `Decision-Id: DEC-0313` and `DEC-0314`, which
`git log --format='%(trailers:key=Decision-Id,valueonly)'` parses.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-24 | SATISFIED | `state-region.tsx:54-85`: one `case` per kind. `empty-never-populated` (`:57-58`) and `empty-no-match` (`:59-60`) dispatch to their own entries. `NotApplicable` entries render nothing (`:45-47`, `:69`) | `state-region.test.tsx:53-69`, `:172-189`, `:198-205` | Never-populated cannot collapse into no-match: mutants `:1` and `r-swap-no-match` are killed. The region-level enumeration belongs to the consumer stories |
| DAC-E1-10 | SATISFIED | `state-region.tsx:2` imports `ScreenState` as a type, unchanged. `:35-37` requires every key and accepts only `NotApplicable` for `unreachable`. `:67-78` renders the error with an `outline` **Try again**. `:79-80` renders `null` for `unreachable` | `state-region.test.tsx:53-140`, `:216-229` | The type refusal is now pinned for an omitted `error`, an omitted `unreachable`, an entry of `{}`, an `undefined` reason and a missing `onRetry`. Two `\| undefined` loosenings outside v1's set survive (IR-001, late) |
| DAC-E1-S9-1 | SATISFIED | `state-region.tsx:55-80` | `state-region.test.tsx:53-87` | Each of the seven kinds renders only its own literal, and the two empties differ. The error shows the operation and reason, and **Try again** calls the spy once on click and never on render. `unreachable` leaves the container empty. The plan's Resolved Conflict 1 is upheld: the epic's "leave the unreachable kind to the shell" governs |
| DAC-E1-S9-2 | SATISFIED | `state-region.tsx:25-27`, `:35-37`, `:39-43` | `state-region.test.tsx:90-140`, judged by `npx tsc --noEmit` (exit 0) | All six directives consume their intended errors (directive-removal check, Independent Validation). Positive control (c) type-checks |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `af4ef4f`, `ui/button.tsx` exports `Button` with `outline` and `data-variant`, and `token-literals.test.ts` exists | The reviewer reran the base suite in a scratch clone at `af4ef4f`: 99 files, 2509 tests, exit 0 |
| T002 | complete | VERIFIED | `state-region.test.tsx:51-88`, `// Implements TC-COMP-031` | All planned fixture literals and all four cases are present. All four named kills fail, and v1's swap mutants are killed |
| T003 | complete | VERIFIED | `state-region.test.tsx:90-140`, `// Implements TC-COMP-032` | Cases (a), (b) and (c) are as planned. The rework adds `:114-133` and `:135-139` (v1 IR-001, IR-003). Each declaration starts on the line after its directive and is referenced by `toBeDefined()` |
| T004 | complete | VERIFIED | `state-region.test.tsx:142-190`, `:192-230` | All five planned cases are present, plus an error-`notApplicable` case. The rework adds the wrapper contract (v1 IR-002, IR-003). The error branch's order is unpinned (IR-002, late) |
| T005 | complete | VERIFIED | `state-region.tsx:1-86`, unchanged since v1 | Exports, signatures, relative imports and dispatch match T005 and DEC-0313. No unit or hex literal, and no `dangerouslySetInnerHTML`. Deviations are as in v1: `output` for `<div role="status">`, the `never` guard in `default:`, and a `loading`-`notApplicable` busy `div` (IR-003, IR-004) |
| T006 | complete | VERIFIED | All five commands exit 0. `token-literals.test.ts` and `render.test.tsx` pass with `state-region.tsx` in their scan. The loosening experiment is reproduced | Mutant `:10` (`?:` on the mapped clause) fails `tsc` with `TS2578 Unused '@ts-expect-error' directive` at `state-region.test.tsx(93,5)` |
| T007 | complete | VERIFIED | `CAP-003-E1-S9-tdd-evidence.yaml` | `cycle-2` is `APPROVED`, with `drift_detected: false`, `tests_executed: true` and `commit_hash: stage`. Its `diff_sha256` equals the patch hash. Its mutation block (16/16 killed) matches its results file. The lint reports 0 errors and 0 warnings. Bookkeeping: `cycle-2` lists `tasks: [T004, T005]`, but it changed T003's TC-COMP-032 block and no T005 code (Scope and Plan Deviations) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `renders only the %s renderer's output` (`:53-59`) / TC-COMP-031 | ADEQUATE | Seven kinds. Each renderer interpolates its own state fields, and every other kind's literal is asserted absent. Kills `:1`, `:2`, `:7`, `r-swap-*` | none |
| `never renders never-populated as no-match, or the reverse` (`:61-69`) / TC-COMP-031 step 2 | ADEQUATE | Both directions, with an unmount between renders | none |
| `renders the error's operation and reason with Try again wired to the caller's retry` (`:71-81`) / TC-COMP-031 step 3 | ADEQUATE | Exact sentence. `data-variant="outline"`. The spy is not called on render and is called exactly once on `user.click`. Kills `:6`, `:12`, `r-error-entry-swap`, `r-error-message-only`, `r-try-again-label`, `r-retry-twice` | none |
| `leaves unreachable to the shell` (`:83-87`) / TC-COMP-031 edge | ADEQUATE | `toBeEmptyDOMElement`, with the reason absent. Kills `:8`, `r-unreachable-empty-div` | none |
| `type-level coverage (DAC-E1-S9-2)` (`:90-140`) / TC-COMP-032 | ADEQUATE | Six refusals, each consuming exactly its intended TS2322 or TS2741, plus one positive control. Kills `:10`, `:11`, `r-drop-notapplicable-union`, `r-renderer-unnarrowed`, `r-unreachable-optional`, `r-reason-optional`, `r-reason-undefined`, `r-onretry-optional`, `v2-reason-unknown`, `v2-entry-empty-record` | `v2-unreachable-undefined` and `v2-onretry-undefined` survive. They are `late`, so the test is not `WEAK` (IR-001) |
| `StateRegion wrappers (DEC-0314)` (`:142-190`) / T004 cases 1-5 | ADEQUATE | Busy loading; polite status with the button outside it and no `alert`; no `requestId`; **Try again** only on error; `notApplicable` renders nothing. Kills `:2`, `:3`, `:4`, `:5`, `:9`, `r-busy-false`, `r-busy-partial`, `r-requestid-leak`, `r-error-na-renders-button`, `v2-error-na-wrapper` | none |
| `StateRegion wrapper contract (DEC-0314, review v1 IR-002, IR-003)` (`:192-230`) / T004, T005 | ADEQUATE | Checks five things: no `[aria-busy]` ancestor for six non-loading kinds, the error included; for five plain kinds, the renderer's element is the container's only child; one busy loading wrapper holding only the skeleton; the status `aria-live` is absent or `polite`; **Try again** has `type="button"`, carries `w-fit`, and shares a `flex flex-col gap-2` parent with the status. Kills v1's 8 IR-002 and 4 IR-003 markup survivors | Order of status and button unpinned (`v2-button-before-status`, late; IR-002) |
| Delivered `token-literals.test.ts`, `api/render.test.tsx`, `ui/button.test.tsx` / T006 | ADEQUATE (unchanged) | The literal scan walks `web/src/components/`, and the raw-HTML scan walks `web/src`. Both include `state-region.tsx`. Neither file changed | none |

Traceability and isolation:

- TC-COMP-031 and TC-COMP-032 keep their `// Implements TC-COMP-0NN` comments. They match
  `tests/component/ui-components-tests.md` l.725-765 and the coverage-matrix rows AC-24 (l.59),
  DAC-E1-10 (l.75), DAC-E1-S9-1 (l.108) and DAC-E1-S9-2 (l.109).
- The new tests are isolated and deterministic. Fixtures are literals. No timer, clock or network
  is used, and each test renders into a fresh container.
- The type cases are typed constants or unrendered JSX elements, so Vitest runs them harmlessly.
- `noReason` (`:127`) is declared on its own line, so the TS2322 for `undefined` lands at `:129`,
  directly under its directive.

On cycle-2's RED evidence: a test-only rework that pins already-correct code cannot fail against
that code. The cycle instead re-applied v1's 16 survivors one at a time and logged the new test or
`TS2578` that kills each one (`red-cycle-2-review-survivors.log`). The reviewer's own run reproduces
every kill in that log. The RED is meaningful: each new assertion was shown to fail on the
regression it targets.

### Mutation run (reviewer, `review` cycle)

The reviewer ran the three stages below:

1. **Generate.** `mutation-run.py generate --range af4ef4f..HEAD --cycle review` writes 0 mutants.
   The catalogue still has no operator that matches `state-region.tsx`.
2. **Write.** The reviewer wrote 7 manual mutants (`v2-…`).
3. **Scope.** `mutation-run.py scope --since 5d044e3 --previous
   CAP-003-E1-S9-implementation-review-v1-mutation.json` added v1's 44. It tagged them 44
   `carried` and 7 `late`, and reported 0 previous mutants no longer applying.

The run command matches v1's:

- `state-region.test.tsx`;
- T006's `token-literals.test.ts` and `api/render.test.tsx`;
- then `npx tsc --noEmit`.

It ran with `--jobs 4`, and all four baselines exit 0. The results are in
`CAP-003-E1-S9-implementation-review-v2-mutation.json` (sha256
`3cd9b0161e385d8a9b3636010c4a053477192805442b15b163cbed7ed1368caf`).

| Mutants | Scope | Result | Equivalence judgment |
|---------|-------|--------|----------------------|
| v1's 28 kills | carried | 28 killed | Unchanged. `r-entry-undefined` is still stopped only by `TS2345` in `state-region.tsx` itself, a stillborn variant `tsc` cannot ship |
| v1's 16 survivors (IR-001: 3, IR-002: 8, IR-003: 5) | carried | **16 killed** | See Previous Review Disposition for the killing test or directive of each |
| `v2-reason-unknown` (`notApplicable: unknown`) | late | killed | `TS2578` at `:128` (`undefinedReason`) |
| `v2-entry-empty-record` (entry union `\| Record<string, never>`) | late | killed | `TS2578` at `:125` (`emptyEntry`), plus `TS2345` in the production file |
| `v2-error-na-wrapper` (error entry `notApplicable` renders the empty flex `div`) | late | killed | `renders nothing for an error whose entry is notApplicable` |
| `v2-renderer-any-state` (renderer parameter `any`) | late | killed (stillborn) | Stopped only by `TS6205 All type parameters are unused` in `state-region.tsx`. Not a test kill, but `tsc` is required, so it cannot ship |
| `v2-unreachable-undefined` (`{ readonly unreachable: NotApplicable \| undefined }`) | late | **survived** | Not equivalent. With it, `{ ...renderers, unreachable: undefined }` type-checks: the shell's state is passed with no reason recorded. DEC-0313 says "`unreachable`, which accepts only `{ notApplicable }`". DAC-E1-10 forbids a call that "omits a state without `{ notApplicable: "reason" }`". Production never reads `renderers.unreachable`, so the loosened file compiles (IR-001) |
| `v2-onretry-undefined` (`onRetry: (() => void) \| undefined`) | late | **survived** | Not equivalent. With it, `onRetry={undefined}` type-checks, and **Try again** then does nothing. DEC-0313 says "`onRetry` is a required top-level prop". DAC-E1-S9-1 requires **Try again** "wired to the caller's retry". The test at `:135-139` refuses only the omitted prop (IR-001) |
| `v2-button-before-status` (**Try again** rendered before the `output`) | late | **survived** | Not equivalent. T005 fixes the order: the status element, then `Button`. UX design 1.3 and 1.4 (*States*) give the error as "*Couldn't read …: {reason}.* and **Try again**". Reversed, a screen reader meets the control before the failure it recovers from. No test reads the order (IR-002) |

Totals: 51 mutants, 48 killed, 3 survived. Of the survivors, 0 are equivalent and 3 are
non-equivalent; all 3 are `late`. There were 0 timeouts. Every kill except `r-entry-undefined` and
`v2-renderer-any-state` traces to a story test or to a `tsc` error in the story's test file.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review` | harness root | 0 | N/A | `READY`; not counted |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `af4ef4f…`, ancestor of HEAD; not counted |
| `npx vitest run src/components/patterns/state-region.test.tsx --root web` | component root | 0 | PASS | Narrowest story suite first: 1 file, 39 tests (23 at v1) |
| `npx vitest run src/components/patterns/state-region.test.tsx src/components/token-literals.test.ts src/api/render.test.tsx src/components/ui/button.test.tsx` | component root | 0 | PASS | The story suite plus T006's carry-over scans and S1's `button`: 4 files, 81 tests |
| `npm run lint` | component root | 0 | PASS | Biome: 223 files, no findings |
| `npm run format` | component root | 0 | PASS | Biome: 223 files, no changes |
| `npx tsc --noEmit` | component root | 0 | PASS | No output; all six `@ts-expect-error` directives consumed |
| `npm run build` | component root | 0 | PASS | Vite build, 2150 modules. Writes only ignored files under `src/factorflow/api/static/` |
| `npm run test` | component root | 0 | PASS | 100 files, 2548 tests (base: 99 and 2509; v1: 100 and 2532) |
| `npm ci --prefix <scratch clone at 27426bf>` | scratch clone of the component repo at HEAD | 0 | PASS | Run in an identical-commit clone so the shared `node_modules`, which the mutation clones link, was not torn down. `package.json` and `package-lock.json` are unchanged since the base. `npx tsc --noEmit` and `npx vitest run src/components/patterns/` then pass against the fresh install (13 files, 421 tests, including the probe below) |
| `npx vitest run` at `af4ef4f` | scratch clone at the review base | 0 | PASS | T001 baseline: 99 files, 2509 tests |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/.../CAP-003-E1-S9-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base af4ef4f853422cdb650a47367c853e14d7ef688e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. Paths are now harness-relative (`grep -c /Users/` prints 0). The reviewer's `shasum -a 256` of `cycle-2.patch`, `red-cycle-2-review-survivors.log` and `mutation-cycle-2-results.json` matches the recorded values |
| `git diff --exit-code af4ef4f..HEAD -- web/src/api/types.ts` | component root | 0 | PASS | DAC-E1-10 "unchanged" (plan Story-Specific Validation) |
| `git diff --stat af4ef4f..HEAD -- . ':!docs'` | component root | 0 | PASS | Exactly the two story files (T006, Phase 4 checkpoint) |
| `git diff --exit-code af4ef4f..HEAD -- <delivered paths, configs and design-system>` | component root | 0 | PASS | No delivered file changed |
| T006 loosening experiment: mutant `:10` under `mutation-run.py run` | harness root (clone) | 1 (command) | PASS | `tsc` fails with `TS2578 Unused '@ts-expect-error' directive` at `state-region.test.tsx(93,5)` |
| Directive-removal check: the six `// @ts-expect-error -- ` prefixes in `state-region.test.tsx` rewritten to plain comments, then `npx tsc --noEmit` | scratch clone at HEAD | 2 | N/A | Exactly one error under each directive: TS2322 `Property 'error' is missing` (`:94`), TS2322 a function is not `NotApplicable` (`:104`), TS2322 `Property 'unreachable' is missing` (`:116`), TS2322 `{}` (`:126`), TS2322 `notApplicable: undefined` (`:129`), TS2741 `Property 'onRetry' is missing` (`:137`). The file was restored with `git checkout` in the clone |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range af4ef4f853422cdb650a47367c853e14d7ef688e..HEAD --cycle review --out <scratch>/mut/generated.json` | harness root | 0 | N/A | 0 mutants |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mut/manual.json --since 5d044e3b82d7197cc33ada8499ad7c53fc27eb50 --previous <stories>/CAP-003-E1-S9-implementation-review-v1-mutation.json --out <scratch>/mut/mutants.json` | harness root | 0 | N/A | 51 mutants: 44 `carried`, 7 `late`; 0 previous mutants dropped |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mut/mutants.json --jobs 4 --timeout 600 --work-root <scratch>/mut/work --logs <scratch>/mut/logs --command 'ln -sfn <component>/node_modules node_modules && npx vitest run --root web src/components/patterns/state-region.test.tsx src/components/token-literals.test.ts src/api/render.test.tsx && npx tsc --noEmit' --out <scratch>/mut/results.json` | harness root | 3 | N/A | 51 mutants, 48 killed, 3 survived (all `late`). Four baselines exit 0. Exit 3 reports survivors |
| Reviewer probe (`state-region.probe.test.tsx`, scratch clone only) | scratch clone at HEAD | 0 | N/A | Under the real type, `tsc` consumes `@ts-expect-error` on `{ ...R, unreachable: undefined }` and on `onRetry={undefined}`, so the production type is correct and IR-001 is a test gap only. Rendering `loading` with `loading: { notApplicable: "always ready" }` gives `<div aria-busy="true"></div>` (IR-003). The probe was deleted, and the clone is outside the review subject |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list. The story owns no integration or E2E case |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed; not in the story's validation list |

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
No command needed to leave the sandbox.

### Validation Side Effects

- Before: clean working tree at `27426bf`. `pipeline-state.py code-revision` gives
  `sha256:1cb4286181240a16d1a34cf7c30473def166342e3f891842ba2222285b665dc8`.
- After: clean working tree at `27426bf`, with the same fingerprint.
  - The build and the suite's build-output test rewrite only ignored files under
    `src/factorflow/api/static/`.
  - The mutation clones, the probe, the directive-removal check, `npm ci` and the T001 baseline
    ran in the reviewer's scratchpad.
  - This report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 3 · **total 4**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | late | TC-COMP-032 does not refuse `unreachable: undefined` or `onRetry={undefined}` |
| IR-002 | LOW | late | The error branch's order, the status sentence before **Try again**, is unpinned |
| IR-003 | LOW | carried | A `loading` entry marked `notApplicable` renders an empty busy `div`, not `null` (v1 IR-005) |
| IR-004 | LOW | carried | Plan deviations recorded only in a TDD-evidence comment; the `output` substitution's phrasing-content limit is unstated (v1 IR-006) |

### IR-001 — TC-COMP-032 does not refuse `unreachable: undefined` or `onRetry={undefined}`

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-10, DAC-E1-S9-2, DAC-E1-S9-1. The code satisfies all three; the
  gap is in the tests.
- **Tasks**: T003 (TC-COMP-032), T005
- **Files**: `web/src/components/patterns/state-region.test.tsx:114-139`;
  `web/src/components/patterns/state-region.tsx:37`, `:42`
- **Claim challenged**: After the v1 IR-001 and IR-003 rework, TC-COMP-032 makes DEC-0313's type
  contract a checked fact: every state is recorded with a renderer or a reason, and `onRetry` is
  required.
- **Observed evidence**:
  - Two `late` mutants survive the story suite, T006's two scans and `npx tsc --noEmit`:
    - `v2-unreachable-undefined`: `{ readonly unreachable: NotApplicable | undefined }`. The key is
      still required, so `omitsUnreachable` (`:116`) is still refused. But
      `{ ...renderers, unreachable: undefined }` type-checks, and production never reads
      `renderers.unreachable`.
    - `v2-onretry-undefined`: `onRetry: (() => void) | undefined`. The prop is still required, so
      `missingRetry` (`:137`) is still refused. But `onRetry={undefined}` type-checks, and
      `onClick={onRetry}` accepts it.
  - The reviewer's probe shows that the real type refuses both calls. The production code is correct.
  - Both lines are unchanged since the baseline's `5d044e3`, and v1 did not run these mutants. So
    `scope` tags them `late`. They are the `| undefined` siblings of v1's `r-reason-undefined`.
- **Expected evidence/behavior**:
  - DEC-0313 (owner upheld): "each entry is a renderer or `{ notApplicable: string }`, except
    `unreachable`, which accepts only `{ notApplicable }` … `onRetry` is a required top-level prop".
  - DAC-E1-10: refuse "a call that omits a state without `{ notApplicable: "reason" }`".
  - DAC-E1-S9-1: **Try again** "wired to the caller's retry".
  - Skill E.9: a mutant that changes behaviour a decision record specifies is not equivalent.
- **Impact**:
  - A later edit could widen either type. A region could then pass `unreachable: undefined`, a
    state recorded with no reason, which STD-UI-23's specialization forbids. Or it could render an
    error whose **Try again** does nothing (STD-UI-19's recovery action).
  - Every test would stay green. The type is the seam for eight region stories.
  - MEDIUM, not HIGH: a `late` finding cannot block and does not make TC-COMP-032 `WEAK` (skill H,
    *Re-review scope*). Found at v1, it would have joined v1 IR-001.
- **Required remediation**: Non-blocking. Add two `@ts-expect-error` cases to the TC-COMP-032
  block, each declaration on the line after its directive, so that both mutants fail `tsc` with
  `TS2578`:
  - a map with `unreachable: undefined`;
  - a `StateRegion` element with `onRetry={undefined}`.

  No production change.

### IR-002 — The error branch's order, the status sentence before **Try again**, is unpinned

- **Severity**: LOW
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: N/A. DAC-E1-S9-1's sentence and **Try again** are pinned; only their
  order is not.
- **Tasks**: T004 (tests), T005 (production)
- **Files**: `web/src/components/patterns/state-region.tsx:71-76`;
  `web/src/components/patterns/state-region.test.tsx:153-160`, `:221-229`
- **Claim challenged**: The new wrapper-contract test pins T005's error markup.
- **Observed evidence**:
  - `v2-button-before-status` renders the `Button` before the `<output>` and survives.
  - The tests check that the status and the button share a parent, that the parent is
    `flex flex-col gap-2`, and that the button is outside the status. None of them reads the order.
  - The production code renders the status first, which is correct.
- **Expected evidence/behavior**:
  - T005 fixes `<div …><div role="status">{entry(state)}</div><Button …>Try again</Button></div>`.
  - UX design 1.3 and 1.4 (*States*) give the error as "*Couldn't read …: {reason}.* and **Try
    again**".
  - UX design's error-clarity row (STD-UI-19) says every failure "names the operation, the stock
    or download and the reason, and offers the recovery".
- **Impact**: None today. A reordering edit would show **Try again** above the sentence it
  recovers from, and a screen reader would reach the control first. Every test would stay green.
- **Required remediation**: Optional. Assert that the status is the wrapper's first child and the
  button its second, for example `status.nextElementSibling === button`.

### IR-003 — A `loading` entry marked `notApplicable` renders an empty busy `div`, not `null` (carried from v1 IR-005)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T005
- **Files**: `web/src/components/patterns/state-region.tsx:55-56`
- **Claim challenged**: DEC-0313 (owner upheld): "StateRegion renders null for unreachable and for
  any kind whose entry is notApplicable".
- **Observed evidence**:
  - The production file is unchanged since v1.
  - The reviewer's probe again renders `<div aria-busy="true"></div>` for `state: loading` with
    `loading: { notApplicable: "always ready" }`.
  - The rework commit message says IR-005 was "left open", as v1 allowed.
- **Expected evidence/behavior**: Either `StateRegion` renders `null` here, or DEC-0313's wording
  is narrowed when design 2.7 absorbs it.
- **Impact**: None visible. A consumer test that expects an empty container would fail.
- **Required remediation**: Optional. Return `null` when the `loading` entry is `NotApplicable`
  and pin it with a case like T004 case 5. Or, at doc sync, record the exception against DEC-0313
  and design 2.7.

### IR-004 — Plan deviations recorded only in a TDD-evidence comment; the `output` substitution's phrasing-content limit is unstated (carried from v1 IR-006)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T005, T007
- **Files**: `CAP-003-E1-S9-tdd-evidence.yaml:1-4`; `CAP-003-E1-S9-tasks.md` T005, T007 and Notes;
  `web/src/components/patterns/state-region.tsx:17-22`, `:72`, `:81-84`;
  `web/src/components/patterns/state-region.test.tsx:39`
- **Claim challenged**: The ticked task plan is the record of what was built.
- **Observed evidence**:
  - Since v1, the plan changed only `updated` and `last_reworked_review`. Three deviations are
    still recorded only in YAML comments, or not at all:
    - one cycle for T002-T005;
    - `<output>` for `<div role="status">`;
    - the `never` guard in `default:`.
  - The doc comment still does not tell consumer stories that the `error` renderer goes inside an
    `output`, which holds phrasing content only (`screens/research/notices.tsx:105`).
  - The test fixture's error renderer still returns a `p` (`:39`).
  - The rework commit message says IR-006 was "left open", as v1 allowed.
- **Expected evidence/behavior**: Deviations visible where the plan's reader looks (skill C.4).
- **Impact**: None functional today. Consumer error renderers that return block content would
  produce non-conforming markup.
- **Required remediation**: Optional, and suited to doc sync:
  - Note the three deviations in the plan.
  - State in `StateRegion`'s doc comment that the `error` renderer returns phrasing content.
  - Alternatively, choose a wrapper that admits flow content while keeping a polite status, and
    record that choice against DEC-0314.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `state-region.test.tsx:114-133` adds three directives. With them removed, `tsc` reports TS2322 `Property 'unreachable' is missing` at `:116`, `{}` at `:126` and `notApplicable: undefined` at `:129`. In this review's run, `r-unreachable-optional` fails with `TS2578` at `:115`, `r-reason-optional` at `:125` and `:128`, and `r-reason-undefined` at `:128`. Two `\| undefined` siblings outside v1's set are new and `late` (IR-001) |
| v1/IR-002 (MEDIUM) | RESOLVED | `:193-196` (no `[aria-busy]` ancestor for non-loading kinds) kills `r-busy-never-populated`, `r-busy-no-match`, `r-busy-unavailable` and `r-busy-error`. `:198-205` (only child, unwrapped) kills `r-wrap-populated` and `r-wrap-unavailable`, and also the three `r-busy-*` on plain kinds. `:216-219` (`aria-live` absent or `polite`) kills `r-status-assertive` and `r-status-off` |
| v1/IR-003 (MEDIUM) | RESOLVED | `:135-139` kills `r-onretry-optional` (`TS2578` at `:136`). `:221-229` kills `r-button-drop-type` (`type="button"`), `r-button-no-wfit` (`w-fit`), and `r-wrapper-no-gap` and `r-wrapper-no-class` (`flex`, `flex-col`, `gap-2` on the shared parent). The order of status and button is a new `late` gap (IR-002) |
| v1/IR-004 (MEDIUM) | RESOLVED | `CAP-003-E1-S9-tdd-evidence.yaml` `red_log`, `reviewed_patch` and `mutation.results` for both cycles are `repos/factorflow-v2/FactorFlow-v2/docs/…` paths. `grep -c /Users/` prints 0. `check-tdd-evidence.py … --require-logs` exits 0 with 0 errors and 0 warnings |
| v1/IR-005 (LOW) | STILL OPEN | Production unchanged (`git diff --exit-code 5d044e3..HEAD -- web/src/components/patterns/state-region.tsx` exits 0). The probe reproduces `<div aria-busy="true"></div>`. Carried as v2 IR-003 |
| v1/IR-006 (LOW) | STILL OPEN | The plan, the doc comment and the fixture are unchanged on these points. Carried as v2 IR-004 |

## Scope and Plan Deviations

- **Justified deviations**: v1's three remain: `output` for `<div role="status">`, one TDD cycle
  for T002-T005, and the `never` guard in `default:`. They are recorded under IR-004.
  - `cycle-2` runs mutation instead of the `mutation: {not_applicable: test-only cycle}` the plan's
    Notes describe for test-only cycles. That is stronger evidence, and it is justified.
  - The rework adds tests only, which every v1 remediation said it would.
- **Bookkeeping**:
  - T001-T007 are ticked, and each is verified. Story `status: in-review` is consistent.
  - The plan records `last_reworked_review: CAP-003-E1-S9-implementation-review-v1.md`.
  - One inconsistency: `cycle-2` lists `tasks: [T004, T005]`. It changed T003's TC-COMP-032 block
    (`:114-139`) and no T005 production code, so `[T003, T004]` would describe it. Its description
    names the right findings. No lint rule reads the field, so no finding is raised.
- **Out-of-scope changes**: none. Since the baseline, only the test file and the story's evidence,
  plan metadata and v1 review changed.
- **Decision trailers**: `27426bf` and `5d044e3` both carry `Decision-Id: DEC-0313` and
  `DEC-0314`. Both decisions (provisional, owner upheld) are implemented as recorded, except at
  the `loading`-`notApplicable` edge (IR-003).
- **Commit attribution**: the rework commit's `Co-Authored-By` names a different model from the
  plan's provenance. That has no bearing on the gate.
- **Decisions**: this review recorded none. Every judgment follows from the story, the plan, epic
  DAC-E1-10, design 2.7, UX design 1.3, 1.4 and 0.7, STD-UI-19, STD-UI-23, STD-UI-24, DEC-0313,
  DEC-0314 and the adversarial-review skill's scope rules.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E1-S9 against this report. At doc sync:
  - record IR-004's deviations and the `error` renderer's phrasing-content limit;
  - record IR-003's `loading` exception against DEC-0313, or route it to a later rework;
  - note IR-001's and IR-002's test gaps for the next story that touches `state-region.test.tsx`.

  None of them blocks.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW), IR-003 (LOW), IR-004 (LOW)
