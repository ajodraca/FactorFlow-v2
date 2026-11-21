---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-20
updated: 2026-11-20
story_id: "CAP-003-E3-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-20T07:25:13Z"
reviewed_head: "5695f47fc689edfb349f6240d3b8a103fcc9d922"
review_base: "26a1cfc97754302dd74024f258e03a05d54ad81a"
reviewed_state_revision: "sha256:3cbaaaeaaf5bdd1a459909358ec6574ccdb082d49ee40c56058a77d4d0de5b81"
verdict: PASS-WITH-WARNINGS
reviewed_paths:
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/cycle-1.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/cycle-2.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/cycle-3.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/green-cycle-1-shell-context.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/green-cycle-2-full-suite.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/green-cycle-3-full-suite.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutants-cycle-1.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutants-cycle-2.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutants-cycle-3.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutation-cycle-1-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutation-cycle-2-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutation-cycle-3-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/red-cycle-1-shell-context.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/red-cycle-2-use-data-health.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/red-cycle-3-mutants.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-implementation-review-v1-mutation.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-implementation-review-v1.md
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-tasks.md
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-tdd-evidence.yaml
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3.md
  - web/src/app/shell-context.test.tsx
  - web/src/app/shell-context.tsx
  - web/src/app/use-data-health.test.tsx
  - web/src/app/use-data-health.ts
review_subjects:
  - artifact_id: CAP-003-E3-S3
    artifact_version: 1
    content_revision: sha256:4ebcba6dcfce910bcb94961c62012b1c8d4d60f805418aa9b2fb88047a97b65a
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-20T07:25:13Z
  source_artifacts:
    - id: CAP-003-E3-S3
      version: "1 (sha256:4ebcba6dcfce910bcb94961c62012b1c8d4d60f805418aa9b2fb88047a97b65a)"
    - id: CAP-003-E3-S3-tasks
      version: "1 (draft, updated 2026-11-20, last_reworked_review v1)"
    - id: CAP-003-E3-S3-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-003-E3-S3-implementation-review
      version: "1 (baseline, reviewed_head 98c652748a04039cf88056dab11c79b75d5fd9f9)"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003-component-design-owner-shell
      version: "2"
    - id: CAP-003-owner-shell-tests
      version: "TC-COMP-059, TC-COMP-064, TC-COMP-073 to TC-COMP-076"
    - id: DEC-0323
      version: "agent, provisional, open; second opinion disagrees"
    - id: DEC-0324
      version: "agent, provisional, open"
    - id: DEC-0325
      version: "agent, provisional, open"
    - id: DEC-0326
      version: "agent, provisional, open; second opinion disagrees"
    - id: testing-constitution
      version: "1.9 (TEST-TDD-005, TEST-TDD-006, TEST-TDD-008)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E3-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 0 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 13/13 verified |
| Required validation | 13/13 passed |

Findings: CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 0 · **total 2**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | MEDIUM | carried | OPEN |
| IR-002 | MEDIUM | late | OPEN |

This re-review uses v1 (`CHANGES-REQUIRED`, `reviewed_head` `98c65274`) as its baseline. Since then the branch has two new commits. `c815752d` is the driver's commit of the v1 report. `5695f47f` is the coder's rework cycle 3, which changes tests, evidence and the plan's frontmatter only. `git diff 98c65274..HEAD -- web/src/app/shell-context.tsx web/src/app/use-data-health.ts` is empty, so the production code is the code v1 found correct.

Both v1 blocking findings are resolved. The new T005 case (`shell-context.test.tsx:514-524`) kills `manual:loading-to-not-served`, which fails at `:520`. The new T008 case (`use-data-health.test.tsx:339-361`) kills `manual:unreachable-not-mapped`, which fails at `:344` with an unhandled `ApiUnreachableError`. v1's IR-004 is resolved: the rework commit carries `Decision-Id: DEC-0323` to `DEC-0326` in its last paragraph, and `git log --format=%(trailers:key=Decision-Id)` parses all four. v1's IR-005 is also resolved: cycle 3 ran the plan's two missing hand-written mutants, and my run kills both again.

Every required command passes on a clean tree. The full Vitest suite runs 108 files and 2 844 tests. Lint, format, `tsc` and the build also pass, and the TDD lint reports 0 errors and 0 warnings. My mutation run has 63 mutants: the 50 carried from v1 and 13 new hand-written ones. It kills 59. Three survivors are the equivalent mutants v1 already named, and I agree with all three. The fourth survivor is new and `late`.

Two MEDIUM findings remain, and neither blocks:

- **IR-001 (carried from v1 IR-003):** the rework sequenced only the 40 000 ms answers in `T001 (c)`. The mount answers still depend on attention settling first. My order probe delays attention's read by eight microtasks. It still fails exactly the five `T001 (c)` rows, at `shell-context.test.tsx:291`, as in v1.
- **IR-002 (late):** `manual:value-not-memoised` survives. It replaces the `useMemo` on the context value with a plain object. T009 specifies that memo, and DEC-0323 depends on it so that a crumb change does not re-render every `useShell()` consumer. That production line is unchanged since v1, so this finding cannot block.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/app/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E3-S3-run-20261120T010103Z` |
| HEAD | `5695f47fc689edfb349f6240d3b8a103fcc9d922` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z`, which `pipeline-state.py review-base --base-ref` resolves to `26a1cfc97754302dd74024f258e03a05d54ad81a` (*CAP-003-E3-S2 doc-sync: completed*). It is an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain` empty). No staged, unstaged or untracked files. The build writes only ignored paths (`src/factorflow/api/static/`) |
| Changed files reviewed | 24, from 4 commits: `075cddaf` cycle 1, `98c65274` cycle 2, `c815752d` the v1 report and `5695f47f` cycle 3. Each names CAP-003-E3-S3 and no other story |
| Baseline | v1 (`CAP-003-E3-S3-implementation-review-v1.md`), `reviewed_head` `98c652748a04039cf88056dab11c79b75d5fd9f9`, with `-v1-mutation.json` (50 mutants) |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/app/shell-context.tsx` | added | T009; AC-8, AC-25, AC-28, DAC-E3-6, DAC-E3-18, DAC-E3-S3-1 to DAC-E3-S3-4; DEC-0323, DEC-0326. Unchanged since the baseline |
| `web/src/app/shell-context.test.tsx` | added | T001 to T006; TC-COMP-073, 074, 075, 076, 059. Since the baseline: `T001 (c)` sequences its 40 000 ms answers (`:285-295`), and a new T005 case covers `loading` (`:514-524`). Both are v1 IR-003 and IR-001 rework |
| `web/src/app/use-data-health.ts` | added | T010; AC-28, DAC-E3-19; DEC-0324, DEC-0325. Unchanged since the baseline |
| `web/src/app/use-data-health.test.tsx` | added | T007, T008; TC-COMP-064. Since the baseline: an `"unreachable"` answer in the harness (`:91`, `:104-106`), the `ApiUnreachableError` import (`:6`), and a new T008 case (`:339-361`). All are v1 IR-002 rework |
| `docs/.../stories/CAP-003-E3-S3.md` | modified | Status line only (`planning` to `in-review`), as T011 allows. Unchanged since the baseline |
| `docs/.../stories/CAP-003-E3-S3-tasks.md` | modified | Checkboxes T001 to T013. Since the baseline, only frontmatter changed: `updated: 2026-11-20` and `last_reworked_review: CAP-003-E3-S3-implementation-review-v1.md` (story-coding G) |
| `docs/.../stories/CAP-003-E3-S3-tdd-evidence.yaml` | added | T013; TEST-TDD-005, TEST-TDD-008. Since the baseline, a `cycle-3` entry was added |
| `docs/.../stories/CAP-003-E3-S3-evidence/cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` | added | T013 `reviewed_patch` for each cycle |
| `docs/.../stories/CAP-003-E3-S3-evidence/red-cycle-1-shell-context.log`, `red-cycle-2-use-data-health.log`, `red-cycle-3-mutants.log` | added | T013 RED evidence |
| `docs/.../stories/CAP-003-E3-S3-evidence/green-cycle-1-shell-context.log`, `green-cycle-2-full-suite.log`, `green-cycle-3-full-suite.log` | added | T013 GREEN evidence, T012 |
| `docs/.../stories/CAP-003-E3-S3-evidence/mutants-cycle-{1,2,3}.json`, `mutation-cycle-{1,2,3}-results.json` | added | T013 `mutation:` blocks |
| `docs/.../stories/CAP-003-E3-S3-implementation-review-v1.md`, `-v1-mutation.json` | added | The baseline review and its mutation results (adversarial-review I.4, I.5), committed by the driver in `c815752d` |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-25 | SATISFIED | `shell-context.tsx:106-117`: both reads run on `usePolledRead`, so each answer carries `checkedAt`. `:119`, `:160-164`: `health` is passed through with `lastAnsweredAt`. `:26-33`: the cadences, recorded with their sources | `shell-context.test.tsx:607-618`: literal instants at 18:30:00Z and 18:31:00Z for attention and scores, and `lastAnsweredAt` for health | This is the context half. Rendering the *checked {time}* lines belongs to the consumers (E3-S6, E4, E6). `manual:attention-checkedAt-epoch` and `served-checkedAt-epoch` are killed |
| AC-28 | SATISFIED | `shell-context.tsx` never imports `fetchDataHealth`. `use-data-health.ts:105-130` reads only on mount, on a terminal transition and on `retry()`. Neither file sets a timer or listens to `visibilitychange` (grep returns nothing) | `shell-context.test.tsx:635-645`: 0 aggregate calls over 600 s idle plus a running-to-succeeded transition. `use-data-health.test.tsx:180-204`: no read during 600 s and 180 s of polling | `manual:provider-reads-aggregate` is killed by 24 tests (`:644`, `use-data-health.test.tsx:184`, …) |
| AC-8 | SATISFIED | `shell-context.tsx:127-142` maps the one summary read to `useShell().scores` | `shell-context.test.tsx:504-566`, `:607-618` | Home itself belongs to CAP-003-E4. This story provides the read Home must use |
| DAC-E3-6 | SATISFIED | `shell-context.tsx:128-142`. `loading` stays `loading`. An `ok` not-served answer becomes `{ kind: "not_served" }`. An error keeps `last` as the last served `ScoreSummary`, or `null`. Attention keeps `error.last` through `usePolledRead` | `shell-context.test.tsx:504-512`: a `404` gives exactly `{ kind: "not_served" }`. `:514-524` (new): `loading` before the first answer, never `not_served`. `:526-532`, `:534-556`: a `500` keeps `last: SUMMARY_SET`, then the read recovers. `:558-566`: not served, then a `500`, gives `last: null`. `:568-588`: attention `500` and network failure keep `last` | v1 IR-001 resolved: `manual:loading-to-not-served` is killed at `:520` |
| DAC-E3-18 | SATISFIED | `shell-context.tsx:51-62`: `ShellContextValue`, the five members verbatim from owner-shell §2.3. `:160-164` | `shell-context.test.tsx:592-605`: `Object.keys(latest).sort()` and `expectTypeOf<keyof ShellContextValue>().toEqualTypeOf<…>()` | `tsc --noEmit` type-checks the test file |
| DAC-E3-19 | SATISFIED | `use-data-health.ts:105-111`: mount. `:116-126`: consecutive successful answers going from non-terminal to one of the five outcomes. `:128-130`: `retry`. `:76-92`: `ApiError` and `ApiUnreachableError` map to the `ReadState` error. No timer | `use-data-health.test.tsx:180-204` (TC-COMP-064 steps 1 to 4), `:253-265` (15 transition pairs), `:267-279`, `:281-293`, `:295-306`, `:308-337`, `:339-361` (new: unreachable gives `error`, `last: null`, then keeps `last`), `:363-381`, `:383-400`, `:402-414`. `:206-228`: importers outside `web/src/screens/data-health/` are flagged, with a planted record | v1 IR-002 resolved: `manual:unreachable-not-mapped` is killed at `:344` |
| DAC-E3-S3-1 | SATISFIED | `shell-context.tsx:36-40`, `:77-82` (the joint condition), `:106-117`: each interval follows the other read's last answer through `attentionLast`/`scoresLast`, and a not-served summary stays at 60 s | `shell-context.test.tsx:229-243` (60 s, with 59 999/60 000 boundaries), `:245-274` (10 s for `requested`, `running`, `cancelling`, observed on the summary), `:276-304` (back to 60 s, five outcomes), `:306-325` (building, observed on attention), `:327-338`, `:340-354` | Every cadence mutant is killed. The `:276-304` rows still depend on settle order at mount (IR-001) |
| DAC-E3-S3-2 | SATISFIED | `shell-context.tsx:144-155`: a stable dispatch to each read's own `refresh` | `shell-context.test.tsx:359-372` (reads at once, skips the old 60 s mark, next read at +80 s), `:374-390` (a second refresh during an in-flight read adds nothing), `:392-400`, `:402-414`, `:416-423` (identity stable) | No overlap and rescheduling come from `startPolling` (CAP-003-E3-S2), re-proved here through the context. `manual:health-refresh-dropped` is killed at `:408` |
| DAC-E3-S3-3 | SATISFIED | `shell-context.tsx:157-158` (stable setter), `:166-170` (`TitleDetailContext` provider), `:188-190` (`useTitleDetail`) | `shell-context.test.tsx:438-454`: held across 180 s of polling, effect ran once, cleared when the screen unmounts. `:456-464`: `"X"`, then `null` | The screen's cleanup clears the detail on unmount, as DEC-0214 has screens do |
| DAC-E3-S3-4 | SATISFIED | `shell-context.tsx:53`: `health: HealthState`, passed through unmapped | `shell-context.test.tsx:479-489`: at the type level, the only credential-like deep key is `credential_present`, and it is `boolean`. `:491-499`: at runtime, for `true` and `false` | `manual:credential-member-added` fails `tsc` at `shell-context.test.tsx:485` and `:603` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `shell-context.test.tsx:227-355`, with `// Implements TC-COMP-073` | Cases (a), (b), (d) and (e) are as planned, with (d) split into building and later-failed. Case (c) now `defer`s the 40 000 ms answers (`:287-295`), but its mount answers are still unsequenced (IR-001) |
| T002 | complete | VERIFIED | `shell-context.test.tsx:357-424`, with `// Implements TC-COMP-074` | Cases (a) to (e) are present, with per-path counts |
| T003 | complete | VERIFIED | `shell-context.test.tsx:426-465`, with `// Implements TC-COMP-075` | `DetailScreen` takes a stable `onEffect` prop, so the effect count still proves that `setTitleDetail` is stable |
| T004 | complete | VERIFIED | `shell-context.test.tsx:467-500`, with `// Implements TC-COMP-076` | `DeepKeys<T>`, both `toEqualTypeOf` lines and the runtime regex are as planned |
| T005 | complete | VERIFIED | `shell-context.test.tsx:502-589`, with `// Implements TC-COMP-059` | Cases (a) to (e) are present, plus the rework's `loading` case (`:514-524`), which now pins T009's `loading` rule |
| T006 | complete | VERIFIED | `shell-context.test.tsx:591-667` | Cases (a) to (f) are present. (f) asserts the exact DEC-0326 message |
| T007 | complete | VERIFIED | `use-data-health.test.tsx:178-247`, with `// Implements TC-COMP-064` | Steps 1 to 4 are present. So is the static importer check, with non-vacuity (more than 50 files, including `use-data-health.ts`) and the planted `home` record |
| T008 | complete | VERIFIED | `use-data-health.test.tsx:252-415` | Cases (a), (b), (d) to (h) and the rework's unreachable case (`:339-361`) are present. TC-COMP-064 step 3 covers (c), as the plan says |
| T009 | complete | VERIFIED | `shell-context.tsx` | The code matches every T009 bullet, and every rule now has a killing test except the memoised context value, a `late` gap (IR-002) |
| T010 | complete | VERIFIED | `use-data-health.ts` | The code matches every T010 bullet. The `ApiUnreachableError` mapping is now pinned (v1 IR-002 resolved) |
| T011 | complete | VERIFIED | `git diff --name-only 26a1cfc9..HEAD` lists 24 paths, each justified above. `git diff --exit-code` over the delivered files exits 0. The importer grep prints only `web/src/app/use-data-health.ts` | Nothing mounts `ShellProvider` |
| T012 | complete | VERIFIED | Lint, format, `tsc`, build and test all pass (see Independent Validation) | Neither source has a `px` length, browser storage or `dangerouslySetInnerHTML` (grep returns nothing) |
| T013 | complete | VERIFIED | `check-tdd-evidence.py --require-logs` reports 0 errors and 0 warnings. Each of the three cycles has `code_review_verdict: APPROVED`, `drift_detected: false`, `tests_executed: true`, a structured `mutation:` block and a `reviewed_patch`, and is committed with `commit_hash: stage` (TEST-TDD-008 v1.9) | Cycle 3 is a test-only rework. Its RED is the new tests failing against the four review mutants (`red-cycle-3-mutants.log`) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| ShellProvider cadences / TC-COMP-073 (T001) | ADEQUATE | Exact 59 999/60 000 and 9 999/10 000 boundaries on both paths. The joint condition is observed on the read that does not carry it: the summary for a running download, attention for building scores. Kills `requested-dropped`, `running-dropped`, `cancelling-cancelled`, `building-failed`, the four interval-constant off-by-ones, `not-served-branch-off`, `attention-ref-not-set`, `scores-ref-not-set`, both "interval ignores the other read" mutants and `summary-null-guard-dropped` | The `:276-304` rows still depend on settle order at mount (IR-001) |
| ShellProvider refresh / TC-COMP-074 (T002) | ADEQUATE | Per-path counts for each kind. The old schedule is cancelled. An in-flight refresh adds no read. `refresh` identity is checked with `toBe`. Kills all three dispatch swaps, `health-refresh-dropped` and `refresh-not-stable` | none |
| setTitleDetail / TC-COMP-075 (T003) | ADEQUATE | Exact crumb text, held over 180 s of polling with one effect run. `"null"` after the screen unmounts. Direct set and clear. Kills `detail-keeps-previous`, `detail-not-stable`, `detail-value-null`, `detail-default-empty` | No assertion that a crumb change leaves the `useShell()` value unchanged (IR-002, `late`, so the test is not WEAK) |
| credential_present / TC-COMP-076 (T004) | ADEQUATE | Type-level deep-key extraction plus `boolean` equality. Runtime `typeof` and value for `true` and `false`. `credential-member-added` fails `tsc` | none |
| Score and attention states / TC-COMP-059 (T005) | ADEQUATE | A `404` gives exactly `{ kind: "not_served" }`. The new case defers the first summary answer and asserts exactly `{ kind: "loading" }`, then `served` with the literal instant. First-read and later `500`s give `error` with the right `last`. Recovery replaces the value. Attention keeps `last` for a `500` and for a network failure. Kills `loading-to-not-served` (v1 survivor), `not-served-to-error`, `served-kind`, `last-null-dropped`, `scores-memo-frozen` and the generated `last` mutants | none |
| Shape, freshness, pause, on-demand, unmount, no provider (T006) | ADEQUATE | Exact keys at runtime and at the type level. Literal `checkedAt` instants. The hidden page pauses, and each read runs once on show. Zero aggregate reads. No read after unmount. Exact throw message, and a `null` detail outside a provider. Kills `served-checkedAt-epoch`, `attention-checkedAt-epoch`, `provider-reads-aggregate` and `provider-missing-guard` | none |
| useDataHealth on demand / TC-COMP-064 (T007) | ADEQUATE | Read counts for mount, `retry`, 600 s of terminal-to-terminal polling, the transition and the 180 s after it. Exact `ok` state with `checkedAt`. Importer rule with non-vacuity and a planted record. Kills `interval-added`, `mount-read-removed`, `transition-deps-empty`, `ok-checkedAt-epoch`, `drop-was-active`, `drop-is-terminal` | none |
| useDataHealth transitions, ordering and edges (T008 a-d, f-h) | ADEQUATE | All 15 non-terminal-to-terminal pairs. `cancelling` to `running`, no download to `succeeded` and `succeeded` to `succeeded` do not read. The comparison holds across a failed attention read. Late mount works. Two in-flight retries give one trailing read, and its answer is the one shown. No read after unmount with a pending retry. Shape and a stable `retry`. Kills `pending-deleted`, `pending-not-cleared`, `ok-drops-pending`, `inflight-guard-off`, `inflight-not-cleared`, `previous-never-advances`, `no-download-sentinel-running`, `trailing-unmount-guard-off`, `unmount-cleanup-removed`, `error-attention-not-skipped`, `transition-reads-twice`, `retry-not-stable` | The `console.error` spy in (g) cannot fail under React 18.3. The call count carries the test, as v1 noted |
| useDataHealth error state (T008 e + rework case) | ADEQUATE | First-read `500` gives `last: null` with `code` `internal_error`. `ok` then `500` keeps `{ data, checkedAt }`. Error then error keeps the same `last`. New: a thrown `fetch` gives `error: expect.any(ApiUnreachableError)` with `last: null`, then `ok`, then a second unreachable read keeps `{ data: DATA_HEALTH, checkedAt: NOW }`. Kills `unreachable-not-mapped` (v1 survivor), `last-dropped`, `error-last-from-error-null`, `error-last-keeps-old-checkedAt-epoch` and both generated `instanceof` mutants | none |

**Mutation run (E.9).** I regenerated the mutants with `mutation-run.py generate --range 26a1cfc9..HEAD --cycle review` over both changed production files: 27 mutants, 25 negate-boolean and 2 drop-field-copy. I added 13 hand-written mutants from my own reading. `mutation-run.py scope --since 98c65274 --previous <v1 -mutation.json>` brought in v1's 23 hand-written mutants and tagged 50 `carried`. It tagged my 13 `late`, because no production line changed since the baseline. I ran all 63 with both focused suites and `tsc`: 59 were killed and 4 survived, with 0 stillborn and 0 timeouts. The results are beside this report as `CAP-003-E3-S3-implementation-review-v2-mutation.json`.

Survivors and their dispositions:

| Mutant | Scope | Disposition | Reason |
|--------|-------|-------------|--------|
| `web/src/app/shell-context.tsx:manual:value-not-memoised` | late | **Not equivalent (IR-002)** | T009: "The context value. It is `useMemo`'d over `health`, `attention`, `scores`, `refresh` and `setTitleDetail`." The plan's Open Gap 1 and DEC-0323 justify the private `TitleDetailContext` because "a separate context keeps a crumb change from re-rendering every `useShell()` consumer". Without the memo, every `setTitleDetail` gives a new `ShellContext` value and re-renders every consumer |
| `web/src/app/use-data-health.ts:46:negate-boolean:1` (`mounted = useRef(true)`) | carried | Equivalent | The initial value is never read. `run` is reached only from the mount effect, which sets `mounted.current = true` first, from the transition effect declared after it, and from `retry` after commit. T010 specifies the guard, not the ref's initial value. I agree with v1 and the coder |
| `web/src/app/use-data-health.ts:manual:unmounted-guard-off` | carried | Equivalent | Without `:68-70`, the code calls `setState` on an unmounted component, which React 18.3.1 drops silently. It could also rethrow a non-API rejection, which `requestJson` never produces. The trailing-read guard at `:97` is separate and is killed. I agree with v1 and the coder |
| `web/src/app/shell-context.tsx:manual:swap-poll-order` | carried | Equivalent | The plan's Other Notes (*Equivalent-mutant risk*) name this mutant. The two reads are coupled only through `attentionLast` and `scoresLast`. Their settle order comes from the fetch path, not from hook declaration order |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story docs/.../CAP-003-E3-S3.md --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` | harness root | 0 | PASS | `READY`: "review changes were reworked; a new review version is required". Score 0.963 over 3 cycles |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` | harness root | 0 | PASS | `26a1cfc97754302dd74024f258e03a05d54ad81a`, an ancestor of HEAD |
| `npx vitest run web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2 files, 62 tests (34 + 28) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 108 files, 2 844 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 241 files with no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 241 files, and none needed changes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Includes the type assertions of T004, T006 and T008 |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite builds into the ignored `src/factorflow/api/static/` |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not required. The story's *Validation* lists five commands without it, and the plan excludes it because the story mounts nothing and changes no rendered surface or e2e spec |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-003-E3-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 26a1cfc9… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-score.py score --evidence .../CAP-003-E3-S3-tdd-evidence.yaml --project-repo repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | 0.963: 52 of 54 killed, 2 called equivalent, 0 unresolved. Informational, because the project declares no minimum |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 26a1cfc9…..HEAD --cycle review --out <scratch>/generated.json`, plus 13 manual mutants | harness root | 0 | PASS | 27 generated mutants |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/with-manual.json --since 98c652748a04039cf88056dab11c79b75d5fd9f9 --previous .../CAP-003-E3-S3-implementation-review-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | 63 mutants: 50 `carried`, 13 `late`. 0 baseline mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --timeout 240 --command "… npx vitest run web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx && npx tsc --noEmit" --out <scratch>/results.json` | harness root | 3 | PASS | 59 killed, 4 survived. All four baselines exit 0. No `carried` or `delta` survivor is non-equivalent. The three carried survivors are equivalent, and the one `late` survivor is a non-blocking warning (IR-002; TEST-TDD-006 v1.6; skill H). Exit 3 means only that survivors exist |
| Order probe: a mutant that delays `attentionRead` by eight microtasks after `fetchAttention()` resolves, run with the focused suites | harness root | 1 | INFO | Not part of the gate set. Exactly the five `T001 (c)` rows fail: `expected 1 to be 5` at `shell-context.test.tsx:291`. The other 57 pass. This is the same result as v1, and it supports IR-001 |
| `grep -nE "setTimeout\|setInterval\|visibilitychange" web/src/app/shell-context.tsx web/src/app/use-data-health.ts` | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | No match |
| `grep -c "toMatchTypeOf" web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | `0` for both files |
| `grep -rn "fetchDataHealth" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Only `shell-client.ts:18` (the definition) and `use-data-health.ts:4,64` |
| `grep -rlE "from \"\./(shell-context\|use-data-health)\"\|app/(shell-context\|use-data-health)\"" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Only `web/src/app/use-data-health.ts` (T011) |
| `git diff --exit-code 26a1cfc9..HEAD -- web/src/app/shell.tsx web/src/app/routes.tsx web/src/app/status-region.tsx web/src/app/shell-client.ts web/src/app/shell-types.ts web/src/app/use-polled-read.ts web/src/app/health.tsx web/src/api/ web/src/screens/ web/src/main.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No delivered file is touched (T011) |
| `git -C repos/factorflow-v2/FactorFlow-v2 log --format='%h %(trailers:key=Decision-Id,valueonly,separator=%x2C)' 26a1cfc9..HEAD` | harness root | 0 | INFO | `5695f47f DEC-0323,DEC-0324,DEC-0325,DEC-0326`. `c815752d`, `98c65274` and `075cddaf` have none |

The Gate Summary counts 13 required validations, the same set as v1: the focused suites, `npm run test`, lint, format, `tsc`, the build, the TDD lint, the mutation run and the five story-specific checks. The story-specific checks are: no timer, no `toMatchTypeOf`, the `fetchDataHealth` callers, the importers, and delivered files unchanged. All 13 pass.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-003-E3-S3-run-20261120T010103Z`, HEAD `5695f47f`, `git status --porcelain` empty. Ignored: `node_modules/`, `src/factorflow/api/static/assets/`, `src/factorflow/api/static/index.html`.
- After: same HEAD and the same `git status --porcelain --ignored` listing (`diff` of the two listings is empty). The build rewrote only the ignored static output.
- Unexpected tracked-file changes: none. Mutants and the probe ran in clones under the reviewer's scratch directory, outside the component repository.

## Findings

### IR-001 — `T001 (c)` still depends on attention settling first at mount (carried from v1 IR-003)

- **Severity**: MEDIUM
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S3-1
- **Tasks**: T001 (c)
- **Files**: `web/src/app/shell-context.test.tsx:276-304` (mount at `:279-282`, assertion at `:291`)
- **Claim challenged**: The cycle-3 commit subject reads "cadence case independent of settle order (IR-003)". The cycle-3 evidence says "T001 (c) sequences the terminal attention answer and the summary answer with defer instead of relying on attention settling first (IR-003)".
- **Observed evidence**: The rework added `defer` only for the reads at 40 000 ms (`:287-295`). The case still mounts with standing answers and no `defer` (`:279-282`). At 40 000 ms it asserts five summary calls (`:291`). That holds only if the summary's first delay saw attention's `running` answer, so attention must settle first at mount. My order probe delays `attentionRead` by eight microtasks. That change does not alter the cadence contract, but exactly these five rows fail with `expected 1 to be 5` at `:291`, and the other 57 tests pass. This is the same failure v1 recorded.
- **Expected evidence/behavior**: Plan, shared harness *Read order*: "Where a case depends on which read answers first, it uses `defer` and resolves attention, flushes, then resolves the summary. No assertion relies on two same-tick reads settling in a particular order." v1 IR-003 remediation: "Sequence the mount answers and the terminal answer with `defer` as (b) does".
- **Impact**: There is no production defect. The test still pins one arrival order of two network reads at mount. Any change to the fetch path's microtask depth breaks these five rows and says nothing about the cadence, including the poll-order change the plan calls equivalent.
- **Required remediation**: Sequence the mount answers of `T001 (c)` with `defer`, as `T001 (b)` does at `:250-258` (resolve attention, flush, then the summary). Alternatively, count the summary's 10 s spacing from its own first answer and not from mount.

### IR-002 — No test pins the memoised context value, so a crumb change can re-render every `useShell()` consumer (T009, DEC-0323)

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S3-3 (the crumb), DAC-E3-18 (the context value)
- **Tasks**: T009 (the rule), T003 (where its test belongs)
- **Files**: `web/src/app/shell-context.tsx:161-164` (`const value = useMemo<ShellContextValue>(…, [health, attention, scores, refresh, setTitleDetail])`); `web/src/app/shell-context.test.tsx:436-465`
- **Claim challenged**: T009 is marked complete, and cycle 1's mutation block records no survivor on this rule.
- **Observed evidence**: `manual:value-not-memoised` replaces `:161-164` with `const value: ShellContextValue = { health, attention, scores, refresh, setTitleDetail };`. All 62 focused tests and `tsc` stay green (survived, exit 0). No test compares `useShell()`'s value before and after `setTitleDetail`. T003's `DetailScreen` depends only on `setTitleDetail` and `onEffect`, and `Probe` re-renders on a crumb change anyway, because it also reads `useTitleDetail()`.
- **Expected evidence/behavior**: T009: "The context value. It is `useMemo`'d over `health`, `attention`, `scores`, `refresh` and `setTitleDetail`." Plan Open Gap 1 and DEC-0323 justify the private `TitleDetailContext`: "A separate context keeps a crumb change from re-rendering every `useShell()` consumer." That holds only while a crumb change leaves the `ShellContext` value unchanged.
- **Impact**: A regression that drops the memo would ship green. Every `setTitleDetail` from the download and universe detail screens (DEC-0214, CAP-003-E7-S5) would then re-render every `useShell()` consumer: the rail chips, Home, the toast watcher and `useDataHealth`. This defeats the reason DEC-0323 gives for a second context. This finding is `late`: the line has not changed since v1, so it cannot block (skill H; TEST-TDD-006 v1.6).
- **Required remediation**: Add an assertion that kills `manual:value-not-memoised`. For example, after mount, take `const before = latest`, call `act(() => latest.setTitleDetail("X"))`, and assert `latest` `toBe(before)`. The mutant definition is in `CAP-003-E3-S3-implementation-review-v2-mutation.json`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH, the `loading` branch of the score mapping is not pinned) | RESOLVED | `shell-context.test.tsx:514-524` defers the first summary answer and asserts `latest.scores` `toEqual({ kind: "loading" })`, then `served`. My run kills `manual:loading-to-not-served` (exit 1) at `:520`: `expected { kind: 'not_served' } to deeply equal { kind: 'loading' }` |
| v1/IR-002 (HIGH, no test for an unreachable aggregate read) | RESOLVED | The `use-data-health.test.tsx` harness now answers `"unreachable"` with a thrown `TypeError` (`:91`, `:104-106`). The case at `:339-361` asserts `error: expect.any(ApiUnreachableError)` with `last: null`, then `ok`, then `last: { data: DATA_HEALTH, checkedAt: NOW }`. My run kills `manual:unreachable-not-mapped` (exit 1) at `:344`, with an unhandled `ApiUnreachableError` |
| v1/IR-003 (MEDIUM, `T001 (c)` depends on same-tick settle order) | STILL OPEN, carried as IR-001 | Partly reworked. The 40 000 ms answers are now deferred and sequenced (`shell-context.test.tsx:287-295`). The mount answers are not (`:279-282`). The order probe still fails exactly the five `T001 (c)` rows at `:291` |
| v1/IR-004 (MEDIUM, no `Decision-Id:` trailers for DEC-0323 to DEC-0326) | RESOLVED | The rework commit `5695f47f` carries `Decision-Id: DEC-0323` to `DEC-0326` in the same paragraph as `Co-Authored-By`, and git's trailer parser returns all four. v1 asked the coder for exactly that. It left relabelling `075cddaf` and `98c65274`, which hold the decision-driven production code, to the owner, because cycle commits are not reworded. That residual stays with the owner and is not a coder finding |
| v1/IR-005 (LOW, coder's runs left out two plan-listed hand-written mutants) | RESOLVED | `mutants-cycle-3.json` includes `manual:provider-reads-aggregate` and `manual:credential-member-added`. `mutation-cycle-3-results.json` records both killed (exit 1 and exit 2). My run kills both again: 24 tests fail, and `tsc` fails at `shell-context.test.tsx:485` and `:603` |

## Scope and Plan Deviations

- **Justified deviation, T001 (c):** the terminal answer comes at the 40 s read, not the 30 s one. This is equivalent for the return to 60 s, as v1 accepted. The 40 s answers are now sequenced. The unsequenced mount is IR-001.
- **Justified deviation, T001 (d):** the summary's building answer resolves before attention's. The plan's own cross-read note requires this, as v1 accepted.
- **Justified deviation, T013:** each cycle is committed as it ends, with `commit_hash: stage`, per TEST-TDD-008 v1.9. The plan's "no per-cycle commit is made" predates that version.
- **Justified additions, T005 and T008 (cycle 3):** the `loading` case and the unreachable-aggregate case are not in the plan's case lists. They are v1's required remediations and pin rules that T009 and T010 already state. Story-coding C.5 forbids duplicate task-plan entries, so no new task was added.
- **Justified additions, T008 (e) and (g) (cycle 2):** an error-to-error retry case and a pending `retry()` at unmount, as v1 accepted.
- **Bookkeeping:** every checked box from T001 to T013 has implementation evidence. Since the baseline, the plan changed only in its frontmatter (`updated`, `last_reworked_review`), as story-coding G requires for a rework.
- **Claim accuracy:** the cycle-3 commit subject and evidence describe `T001 (c)` as independent of settle order. That is true only from 40 000 ms on (IR-001).
- **Out-of-scope changes:** none. The 24 paths are the four planned sources, the story's status line, the plan's checkboxes and frontmatter, the TDD evidence that T013 requires, and the baseline review the driver committed.
- **Open decisions this story implements:** DEC-0323 (contested), DEC-0324, DEC-0325 and DEC-0326 (contested) remain provisional and await the owner. The implementation follows the approved task plan, which adopts all four, so they are not findings against the code.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E3-S3 against this component state (`reviewed_state_revision` `sha256:3cbaaaeaaf5bdd1a459909358ec6574ccdb082d49ee40c56058a77d4d0de5b81`). IR-001 and IR-002 are test-strength warnings and can go to a later rework: sequence the `T001 (c)` mount answers with `defer`, and add an identity assertion that kills `manual:value-not-memoised`. Neither needs a production change. The owner still holds DEC-0323 to DEC-0326, and the choice whether to relabel `075cddaf` and `98c65274`.
- **Warnings accepted downstream**: IR-001, IR-002
