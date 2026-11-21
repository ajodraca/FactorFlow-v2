---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-20
updated: 2026-11-20
story_id: "CAP-003-E3-S3"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-20T06:57:17Z"
reviewed_head: "98c652748a04039cf88056dab11c79b75d5fd9f9"
review_base: "26a1cfc97754302dd74024f258e03a05d54ad81a"
reviewed_state_revision: "sha256:1ce79c96af742deac05d4b1c9cd7c32d189155dae1ecfcac241ecfcf44866d13"
verdict: CHANGES-REQUIRED
reviewed_paths:
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/cycle-1.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/cycle-2.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/green-cycle-1-shell-context.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/green-cycle-2-full-suite.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutants-cycle-1.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutants-cycle-2.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutation-cycle-1-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/mutation-cycle-2-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/red-cycle-1-shell-context.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-evidence/red-cycle-2-use-data-health.log
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
  timestamp: 2026-11-20T06:57:17Z
  source_artifacts:
    - id: CAP-003-E3-S3
      version: "1 (sha256:4ebcba6dcfce910bcb94961c62012b1c8d4d60f805418aa9b2fb88047a97b65a)"
    - id: CAP-003-E3-S3-tasks
      version: "1 (draft, updated 2026-11-07)"
    - id: CAP-003-E3-S3-tdd-evidence
      version: "cycle-1 to cycle-2"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003-component-design-owner-shell
      version: "2"
    - id: CAP-003-owner-shell-tests
      version: "TC-COMP-059, TC-COMP-064, TC-COMP-073 to TC-COMP-076"
    - id: DEC-0214
      version: "agent, provisional"
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

# Implementation Review: CAP-003-E3-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 11/13 verified |
| Required validation | 12/13 passed |

Findings: CRITICAL 0 · HIGH 2 · MEDIUM 2 · LOW 1 · **total 5**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | HIGH | initial | OPEN |
| IR-002 | HIGH | initial | OPEN |
| IR-003 | MEDIUM | initial | OPEN |
| IR-004 | MEDIUM | initial | OPEN |
| IR-005 | LOW | initial | OPEN |

The production code is correct. `ShellProvider`, `useShell()`, `useTitleDetail()` and `useDataHealth()` do what the story, owner-shell §2.3 and §2.4, the epic's *Cadences* NFR and the task plan ask, including the four provisional plan decisions (DEC-0323 to DEC-0326). All ten acceptance criteria have production evidence and passing tests. Every required command passes on a clean tree: the full Vitest suite (108 files, 2 842 tests), lint, format, `tsc` and the build. The TDD lint reports 0 errors and 0 warnings. The change set is exactly the plan's four source files plus the story's plan, status line and evidence. No delivered file is touched, and nothing imports the new modules except `use-data-health.ts` itself.

The gate fails on the mutation check. TEST-TDD-006 says a task is not complete while a changed-line mutant survives, and E.9 of the review skill says no non-equivalent mutant may survive anywhere in the change set. My run of 50 mutants (27 generated, 23 hand-written) over both production files has 5 survivors. Three are equivalent, as recorded under Test Quality. The other two change behaviour that owner-shell §2.3, DEC-0324 and the task plan specify, and no test notices:

- **IR-001:** `ShellProvider` maps a summary read that has not answered yet (`loading`) to `{ kind: "loading" }` (T009). `manual:loading-to-not-served` maps it to `{ kind: "not_served" }` instead, and every test stays green. `not_served` means "the summary answered `404`" (owner-shell §2.3), and Home and Data health render it as *Not determinable* and *FactorFlow can't read scores yet.*
- **IR-002:** `useDataHealth()` maps an `ApiUnreachableError` to `{ kind: "error", error, last }` (T010, DEC-0324). `manual:unreachable-not-mapped` rethrows it instead, so a network failure or a non-JSON body leaves the aggregate in its previous state and raises an unhandled rejection. No `use-data-health` test drives an unreachable read.

Also reported: IR-003 (MEDIUM), the five `T001 (c)` rows depend on attention settling before the summary in the same tick, which the plan's harness rule forbids; IR-004 (MEDIUM), the two cycle commits that carry DEC-0323 to DEC-0326's code have no `Decision-Id:` trailer, and two of those decisions are contested by their second opinions; IR-005 (LOW), the coder's mutation runs left out two of the plan's seven hand-written mutants. I ran both, and both are killed.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/app/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E3-S3-run-20261120T010103Z` |
| HEAD | `98c652748a04039cf88056dab11c79b75d5fd9f9` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` resolved by `pipeline-state.py review-base --base-ref` to `26a1cfc97754302dd74024f258e03a05d54ad81a` (*CAP-003-E3-S2 doc-sync: completed*), an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation (`git status --porcelain` empty). No staged, unstaged or untracked files. The build writes only ignored paths (`src/factorflow/api/static/`) |
| Changed files reviewed | 17 (2 commits: `075cddaf` cycle 1, `98c65274` cycle 2; both name CAP-003-E3-S3 and no other story) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/app/shell-context.tsx` | added | T009; AC-8, AC-25, AC-28, DAC-E3-6, DAC-E3-18, DAC-E3-S3-1 to DAC-E3-S3-4; DEC-0323, DEC-0326 |
| `web/src/app/shell-context.test.tsx` | added | T001 to T006; TC-COMP-073, 074, 075, 076, 059 |
| `web/src/app/use-data-health.ts` | added | T010; AC-28, DAC-E3-19; DEC-0324, DEC-0325 |
| `web/src/app/use-data-health.test.tsx` | added | T007, T008; TC-COMP-064 |
| `docs/.../stories/CAP-003-E3-S3.md` | modified | Status line only (`planning` to `in-review`), as T011 allows |
| `docs/.../stories/CAP-003-E3-S3-tasks.md` | modified | Checkboxes T001 to T013 only (26 lines, no wording change) |
| `docs/.../stories/CAP-003-E3-S3-tdd-evidence.yaml` | added | T013; TEST-TDD-005, TEST-TDD-008 |
| `docs/.../stories/CAP-003-E3-S3-evidence/cycle-1.patch`, `cycle-2.patch` | added | T013 `reviewed_patch` per cycle |
| `docs/.../stories/CAP-003-E3-S3-evidence/red-cycle-1-shell-context.log`, `red-cycle-2-use-data-health.log` | added | T013 RED evidence |
| `docs/.../stories/CAP-003-E3-S3-evidence/green-cycle-1-shell-context.log`, `green-cycle-2-full-suite.log` | added | T013 GREEN evidence, T012 |
| `docs/.../stories/CAP-003-E3-S3-evidence/mutants-cycle-1.json`, `mutants-cycle-2.json`, `mutation-cycle-1-results.json`, `mutation-cycle-2-results.json` | added | T013 `mutation:` blocks |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-25 | SATISFIED | `shell-context.tsx:106-117` (both reads on `usePolledRead`, so each answer carries `checkedAt`); `:160-164` (`health` passed through with `lastUpdated`/`lastAnsweredAt`); `:26-33` (cadences recorded with their sources) | `shell-context.test.tsx:590-601` "carries the instant of every answer (AC-25)": literal instants at 18:30:00Z and 18:31:00Z for attention and scores, `lastAnsweredAt` for health | The context half. Rendering the *checked {time}* lines is the consumers' (E3-S6, E4, E6) |
| AC-28 | SATISFIED | `shell-context.tsx` never imports `fetchDataHealth`; `use-data-health.ts:105-130` reads only on mount, on a terminal transition and on `retry()`; no timer or `visibilitychange` (grep empty) | `shell-context.test.tsx:618-628` (0 aggregate calls over 600 s idle plus a running-to-succeeded transition); `use-data-health.test.tsx:177-201` (no read across 600 s and 180 s of polling) | `manual:provider-reads-aggregate` (planted aggregate read in the provider) is killed |
| AC-8 | SATISFIED | `shell-context.tsx:127-142` maps the one summary read to `useShell().scores` | `shell-context.test.tsx:499-571`, `:590-601` | Home itself is CAP-003-E4's; the context provides the read it must use |
| DAC-E3-6 | SATISFIED | `shell-context.tsx:132-141`: an `ok` not-served answer becomes `{ kind: "not_served" }`; an error keeps `last` as the last served `ScoreSummary` or `null`; attention keeps `error.last` through `usePolledRead` | `shell-context.test.tsx:499-507` (404 gives exactly `{ kind: "not_served" }`), `:509-515`, `:517-539` (served, `500` keeps `last: SUMMARY_SET`, then recovery), `:541-549` (not-served then `500` gives `last: null`), `:551-571` (attention `500` and network failure keep `last`) | The `404` and failure paths are pinned. The `loading` branch of the same mapping is not (IR-001) |
| DAC-E3-18 | SATISFIED | `shell-context.tsx:51-62` (`ShellContextValue`, the five members verbatim from owner-shell §2.3), `:161-164` | `shell-context.test.tsx:575-588`: `Object.keys(latest).sort()` and `expectTypeOf<keyof ShellContextValue>().toEqualTypeOf<…>()` | `tsc --noEmit` type-checks the test file (`tsconfig.json` includes `web/src`) |
| DAC-E3-19 | SATISFIED | `use-data-health.ts:105-111` (mount), `:116-126` (consecutive successful answers, non-terminal to one of the five outcomes), `:128-130` (`retry`), no timer | `use-data-health.test.tsx:177-201` (TC-COMP-064 steps 1 to 4), `:250-262` (15 transition pairs), `:264-276`, `:278-290`, `:292-303`; `:203-225` (importers limited to `web/src/screens/data-health/`, with a planted record) | The read rules are pinned. The error mapping for an unreachable read is not (IR-002) |
| DAC-E3-S3-1 | SATISFIED | `shell-context.tsx:36-40`, `:77-82` (joint condition), `:106-117` (attention follows the summary's last answer and vice versa through `attentionLast`/`scoresLast`; a not-served summary stays at 60 s) | `shell-context.test.tsx:229-243` (60 s with 59 999/60 000 boundaries), `:245-274` (10 s for `requested`, `running`, `cancelling`, observed on the summary), `:276-299` (back to 60 s, five outcomes), `:301-320` (building, observed on attention), `:322-333`, `:335-349` | Every cadence mutant is killed. The `:276-299` rows are order-dependent (IR-003) |
| DAC-E3-S3-2 | SATISFIED | `shell-context.tsx:144-155` (stable dispatch to the read's own `refresh`) | `shell-context.test.tsx:354-367` (at once; old 60 s mark passes; next at +80 s), `:369-385` (second refresh during an in-flight read adds nothing), `:387-395`, `:397-409`, `:411-418` (identity stable) | No overlap and rescheduling are `startPolling`'s (CAP-003-E3-S2), re-proved here through the context |
| DAC-E3-S3-3 | SATISFIED | `shell-context.tsx:157-158` (stable setter), `:166-170` (`TitleDetailContext` provider), `:188-190` (`useTitleDetail`) | `shell-context.test.tsx:433-449` (held across 180 s of polling, effect ran once, cleared when the screen unmounts), `:451-459` (`"X"` then `null`) | Clearing on unmount is the screen's cleanup, as DEC-0214 has screens do ("cleared on unmount") |
| DAC-E3-S3-4 | SATISFIED | `shell-context.tsx:53` (`health: HealthState`, passed through unmapped) | `shell-context.test.tsx:474-484` (type-level: the only credential-like deep key is `credential_present`, and it is `boolean`), `:486-494` (runtime, `true` and `false`) | `manual:credential-member-added` (adds `credential?: string \| null`) fails `tsc` at `shell-context.test.tsx:480` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `shell-context.test.tsx:227-350`, with `// Implements TC-COMP-073` | Cases (a), (b), (d), (e) as planned, (d) split into building and later-failed. Case (c) puts the terminal answer at the 40 s read instead of the 30 s one (equivalent for the return to 60 s) and does not sequence the answers with `defer`, so it depends on same-tick settle order (IR-003) |
| T002 | complete | VERIFIED | `shell-context.test.tsx:352-419`, with `// Implements TC-COMP-074` | Cases (a) to (e) present with per-path counts |
| T003 | complete | VERIFIED | `shell-context.test.tsx:421-460`, with `// Implements TC-COMP-075` | `DetailScreen` takes `onEffect` as a prop and in its deps; the prop is a stable `vi.fn`, so the effect count still proves `setTitleDetail` is stable |
| T004 | complete | VERIFIED | `shell-context.test.tsx:462-495`, with `// Implements TC-COMP-076` | `DeepKeys<T>` and both `toEqualTypeOf` lines as planned; runtime regex as planned |
| T005 | complete | VERIFIED | `shell-context.test.tsx:497-572`, with `// Implements TC-COMP-059` | Cases (a) to (e) present, asserting literal fixtures. The planned cases do not cover the `loading` branch T009 specifies (IR-001) |
| T006 | complete | VERIFIED | `shell-context.test.tsx:574-650` | Cases (a) to (f) present. (f) asserts the exact DEC-0326 message |
| T007 | complete | VERIFIED | `use-data-health.test.tsx:175-244`, with `// Implements TC-COMP-064` | Steps 1 to 4, the static importer check with non-vacuity (more than 50 files; includes `use-data-health.ts`) and the planted `home` record |
| T008 | complete | VERIFIED | `use-data-health.test.tsx:249-388` | Cases (a), (b), (d) to (h) present; (c) is covered by TC-COMP-064 step 3, as the plan says. (e) adds an error-to-error retry. No case drives an unreachable read (IR-002) |
| T009 | complete | PARTIAL | `shell-context.tsx` | The code matches every T009 bullet: cadence constants, `NON_TERMINAL`, ref wiring, the joint condition, both intervals with the not-served override, the `ScoreState` mapping, `refresh`, the private `TitleDetailContext`, the memoised value and the throwing `useShell`. But its "`loading` stays `{ kind: "loading" }`" rule has no test that kills a mutant of it (IR-001) |
| T010 | complete | PARTIAL | `use-data-health.ts` | The code matches every T010 bullet: `ReadState` rules, rethrow of non-API rejections, `inFlight`/`pending`/`mounted`, one trailing read, a stable `retry`, the terminal-transition effect and no timer. But its mapping of an `ApiUnreachableError` to the error state has no test that kills a mutant of it (IR-002) |
| T011 | complete | VERIFIED | `git diff --name-only 26a1cfc9..HEAD` (17 paths, all justified above); `git diff --exit-code` over the delivered files exits 0; the import grep prints only `web/src/app/use-data-health.ts` | Nothing mounts `ShellProvider` |
| T012 | complete | VERIFIED | Lint, format, `tsc`, build and test all pass (Independent Validation) | No `px` length, browser storage or `dangerouslySetInnerHTML` in either source |
| T013 | complete | VERIFIED | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings. Two cycles, each `code_review_verdict: APPROVED`, `drift_detected: false`, `tests_executed: true`, a structured `mutation:` block and a `reviewed_patch` | Each cycle is committed as it ends with `commit_hash: stage`, per TEST-TDD-008 v1.9 (the plan's "no per-cycle commit" predates it). The runs left out two plan-listed mutants (IR-005) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| ShellProvider cadences / TC-COMP-073 (T001) | ADEQUATE | Exact 59 999/60 000 and 9 999/10 000 boundaries on both paths. The joint condition is observed on the read that does not carry it: the summary for a running download, attention for building scores. Kills `requested-dropped`, `running-dropped`, `cancelling-cancelled`, `building-failed`, the four interval-constant off-by-ones, `not-served-branch-off`, `attention-ref-not-set`, `scores-ref-not-set`, and both "interval ignores the other read" mutants | The `:276-299` rows depend on same-tick settle order (IR-003) |
| ShellProvider refresh / TC-COMP-074 (T002) | ADEQUATE | Per-path counts for each kind; old schedule cancelled; in-flight refresh adds no read; `refresh` identity `toBe`. Kills all three dispatch swaps and `refresh-not-stable` | In (b) the deferred read resolves at the same fake instant as the refresh, so "60 s after the resolution" and "60 s after the refresh" coincide. Case (a) and CAP-003-E3-S2's own tests cover rescheduling, so no finding |
| setTitleDetail / TC-COMP-075 (T003) | ADEQUATE | Exact crumb text, held over 180 s of polling with one effect run, `"null"` after the screen unmounts, direct set and clear. Kills `detail-keeps-previous`, `detail-not-stable`, `detail-value-null`, `detail-default-empty` | none |
| credential_present / TC-COMP-076 (T004) | ADEQUATE | Type-level deep-key extraction plus `boolean` equality, runtime `typeof` and value for `true` and `false`. `credential-member-added` fails `tsc` | none |
| Score and attention states / TC-COMP-059 (T005) | WEAK | `404` gives exactly `{ kind: "not_served" }`; first-read and later `500`s give `error` with the right `last`; recovery replaces the value; attention keeps `last` for `500` and network failure. Kills `not-served-to-error`, `served-kind`, `last-null-dropped` and the generated `last` mutants | No assertion on `scores` before the first answer: `loading-to-not-served` survives (IR-001) |
| Shape, freshness, pause, on-demand, unmount, no provider (T006) | ADEQUATE | Exact keys at runtime and type level; literal `checkedAt` instants; hidden-page pause and one read each on show; zero aggregate reads; no read after unmount; exact throw message and `null` detail outside a provider. Kills `served-checkedAt-epoch`, `provider-reads-aggregate`, `provider-missing-guard` | none |
| useDataHealth on demand / TC-COMP-064 (T007) | ADEQUATE | Read counts for mount, `retry`, 600 s of terminal-to-terminal polling, the transition and 180 s after; exact `ok` state with `checkedAt`; importer rule with non-vacuity and a planted record. Kills `interval-added`, `mount-read-removed`, `transition-deps-empty`, `ok-checkedAt-epoch`, `drop-was-active`, `drop-is-terminal` | none |
| useDataHealth transitions, ordering and edges (T008 a-d, f-h) | ADEQUATE | All 15 non-terminal-to-terminal pairs; `cancelling` to `running`, no download to `succeeded` and `succeeded` to `succeeded` do not read; comparison across a failed attention read; late mount; one trailing read for two in-flight retries, with the trailing answer shown; no read after unmount with a pending retry; shape and stable `retry`. Kills `pending-deleted`, `inflight-guard-off`, `previous-never-advances`, `no-download-sentinel-running`, `trailing-unmount-guard-off` | The `console.error` spy in (g) cannot fail under React 18.3, which no longer warns on a state update after unmount. The call count carries the test |
| useDataHealth error state (T008 e) | WEAK | First-read `500` gives `last: null` with `code` `internal_error`; ok then `500` keeps `{ data, checkedAt }`; error then error keeps the same `last`. Kills `last-dropped`, `error-last-from-error-null`, both generated `instanceof` mutants | No case drives an `ApiUnreachableError`: `unreachable-not-mapped` survives (IR-002) |

**Mutation run (E.9).** Generated with `mutation-run.py generate --range 26a1cfc9..HEAD --cycle review` over both changed production files (27 mutants: 25 negate-boolean, 2 drop-field-copy), plus 23 hand-written ones from my reading and from the plan's Other Notes. Run with both focused suites and `tsc`. Result: 50 mutants, 45 killed, 5 survived, 0 stillborn, 0 timeout. Results are beside this report as `CAP-003-E3-S3-implementation-review-v1-mutation.json`.

Survivors and their dispositions:

| Mutant | Disposition | Reason |
|--------|-------------|--------|
| `web/src/app/shell-context.tsx:manual:loading-to-not-served` | **Not equivalent (IR-001)** | Owner-shell §2.3 defines `not_served` as "`GET /api/classifications/summary` answered 404" and keeps a separate `loading` variant. T009 says "`loading` stays `{ kind: "loading" }`" |
| `web/src/app/use-data-health.ts:manual:unreachable-not-mapped` | **Not equivalent (IR-002)** | Owner-shell §2.3's `ReadState` error carries `ApiError \| ApiUnreachableError`. DEC-0324 fixes the return type as `ReadState<DataHealth>`, and T010 rethrows only rejections that are neither |
| `web/src/app/use-data-health.ts:46:negate-boolean:1` (`mounted = useRef(true)`) | Equivalent | `run` is reached only from the mount effect (`:105-111`, which sets `mounted.current = true` first), from the transition effect declared after it (effects run in declaration order) and from `retry`, which can be called only after commit. The initial value is never read. T010 specifies the guard, not the ref's initial value. I agree with the coder's claim |
| `web/src/app/use-data-health.ts:manual:unmounted-guard-off` | Equivalent | Without `:68-70` the code calls `setState` on an unmounted component, which React 18.3.1 (`package.json` `^18.3.1`) drops silently, and it could rethrow a non-API rejection, which `requestJson` (`web/src/api/client.ts:154-181`) never produces. The trailing-read guard at `:97` is separate and is killed. I agree with the coder's claim |
| `web/src/app/shell-context.tsx:manual:swap-poll-order` | Equivalent | The plan's Other Notes (*Equivalent-mutant risk*) name it. The two reads are coupled only through `attentionLast` and `scoresLast`, and their settle order is set by the fetch path (in the tests, `fetchScoreSummary`'s extra `await`), not by hook declaration order |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story docs/.../CAP-003-E3-S3.md --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` | harness root | 0 | PASS | `READY`; story score 0.960 over 2 cycles, 48 of 50 killed, 2 called equivalent, no project minimum |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261120T010103Z` | harness root | 0 | PASS | `26a1cfc97754302dd74024f258e03a05d54ad81a`, an ancestor of HEAD |
| `npx vitest run web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2 files, 60 tests (33 + 27) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 108 files, 2 842 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 241 files, no diagnostics |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome, 241 files, no changes needed |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Includes T004's, T006's and T008's type assertions |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite build into the ignored `src/factorflow/api/static/` |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not required: the story's *Validation* lists five commands without it, and the plan excludes it because the story mounts nothing and changes no rendered surface or e2e spec |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-003-E3-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 26a1cfc9… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-score.py score --evidence .../CAP-003-E3-S3-tdd-evidence.yaml --project-repo repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | 0.960; informational, since the project declares no minimum |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 26a1cfc9…..HEAD --cycle review --out <scratch>/mutants.json`, plus 23 manual mutants | harness root | 0 | PASS | 27 generated mutants, 50 in all |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --command "… npx vitest run web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx && npx tsc --noEmit" --timeout 240 --out <scratch>/results2.json` | harness root | 3 | FAIL | 45 killed, 5 survived. Two survivors are not equivalent (IR-001, IR-002). The plan's *Validation Plan* requires "no surviving non-equivalent mutant" |
| Order probe: one manual mutant that delays `attentionRead` by eight microtasks after `fetchAttention()` resolves, run with the focused suites | harness root | 1 | INFO | Not part of the gate set. Exactly the five `T001 (c)` rows fail: `expected 1 to be 5` at `shell-context.test.tsx:291`. Supports IR-003 |
| `grep -nE "setTimeout\|setInterval\|visibilitychange" web/src/app/shell-context.tsx web/src/app/use-data-health.ts` | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | No match: neither module sets a timer or listens for visibility |
| `grep -c "toMatchTypeOf" web/src/app/shell-context.test.tsx web/src/app/use-data-health.test.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 1 | PASS | `0` for both files |
| `grep -rn "fetchDataHealth" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Only `shell-client.ts:18` (definition) and `use-data-health.ts:4,64` |
| `grep -rlE "from \"\./(shell-context\|use-data-health)\"\|app/(shell-context\|use-data-health)\"" web/src --include='*.ts' --include='*.tsx' \| grep -v '\.test\.'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Only `web/src/app/use-data-health.ts` (T011) |
| `git diff --exit-code 26a1cfc9..HEAD -- web/src/app/shell.tsx web/src/app/routes.tsx web/src/app/status-region.tsx web/src/app/shell-client.ts web/src/app/shell-types.ts web/src/app/use-polled-read.ts web/src/app/health.tsx web/src/api/ web/src/screens/ web/src/main.tsx` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No delivered file touched (T011) |

Required validation counted in the Gate Summary (13): the focused suites, `npm run test`, lint, format, `tsc`, build, the TDD lint, the mutation run, and the five story-specific checks (no timer, no `toMatchTypeOf`, `fetchDataHealth` callers, importers, delivered files unchanged). Twelve pass. The mutation run fails.

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-003-E3-S3-run-20261120T010103Z`, HEAD `98c65274`, `git status --porcelain` empty.
- After: same HEAD, `git status --porcelain` empty. Ignored only: `node_modules/`, `src/factorflow/api/static/assets/`, `src/factorflow/api/static/index.html` (build output).
- Unexpected tracked-file changes: none. Mutants ran in clones under the reviewer's scratch directory, outside the component repository.

## Findings

### IR-001 — The score mapping's `loading` branch is not pinned: a summary that has not answered can read as `not_served` (T009, TC-COMP-059)

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-6 (`not_served` must mean a `404`); AC-8; TEST-TDD-006
- **Tasks**: T009 (the rule), T005 (where its test belongs)
- **Files**: `web/src/app/shell-context.tsx:127-131` (`if (scoresState.kind === "loading") { return { kind: "loading" }; }`); `web/src/app/shell-context.test.tsx:497-572`
- **Claim challenged**: T009 is marked complete, and cycle 1's mutation block records 23 of 23 mutants killed.
- **Observed evidence**: `manual:loading-to-not-served` changes `:130` to `return { kind: "not_served" };`. All 60 focused tests and `tsc` stay green (survived, exit 0). No test reads `latest.scores` before the summary's first answer: every case calls `mount()`, which flushes the first answers, or checks only call counts before a deferred read resolves.
- **Expected evidence/behavior**: Owner-shell §2.3 defines `ScoreState` with a separate `{ kind: "loading" }` and annotates `{ kind: "not_served" }` as "GET /api/classifications/summary answered 404". T009: "`loading` stays `{ kind: "loading" }`". TEST-TDD-006: a task is not complete while a non-equivalent changed-line mutant survives.
- **Impact**: A regression that reports the summary as not served before it has answered would ship green. Data-health-ui's *Factor scores* card would then show `coverage-unknown` *Not determinable* and *FactorFlow can't read scores yet.* on every visit, and Home's tile an em dash with *not determinable*, until the first answer arrives (data-health-ui §2.4, row *Factor scores*; home-ui §2.4, *Data tile*). `deriveNeedsYou(attention, scores)` would also see a not-served state that never happened.
- **Required remediation**: Add an assertion that kills `manual:loading-to-not-served`. For example, defer the first summary answer and assert `latest.scores` `toEqual({ kind: "loading" })` before it resolves.

### IR-002 — `useDataHealth()` has no test for an unreachable read: the `ApiUnreachableError` mapping is not pinned (T010, DEC-0324)

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-19 (the hook's state, per DEC-0324's `ReadState<DataHealth>`); TEST-TDD-006
- **Tasks**: T010 (the rule), T008 (e) (where its test belongs)
- **Files**: `web/src/app/use-data-health.ts:76-92` (`instanceof ApiError || instanceof ApiUnreachableError`, then `setState` with `last`); `web/src/app/use-data-health.test.tsx:305-334`
- **Claim challenged**: T010 is marked complete, and cycle 2's mutation block records no unresolved survivor.
- **Observed evidence**: `manual:unreachable-not-mapped` changes `:80` so that an `ApiUnreachableError` takes the rethrow branch: `error instanceof ApiError || (error instanceof ApiUnreachableError && false)`. All 60 focused tests and `tsc` stay green (survived, exit 0). The `use-data-health` harness's `Answer` type (`:91`) cannot express a thrown `fetch`, and no case drives one. The shell-context harness can (`"unreachable"`, `shell-context.test.tsx:112-125`), and T005 (e) uses it for attention, but nothing does so for the aggregate.
- **Expected evidence/behavior**: Owner-shell §2.3: `ReadState`'s error is `{ kind: "error"; error: ApiError | ApiUnreachableError; last }`. DEC-0324: `useDataHealth(): { state: ReadState<DataHealth>; retry(): void }`. T010: on failure the state is `{ kind: "error", error, last }`, and only "a rejection that is not `ApiError` or `ApiUnreachableError` is rethrown". `requestJson` (`web/src/api/client.ts:154-181`) rejects with `ApiUnreachableError` for both a transport failure and a body that is not JSON.
- **Impact**: A regression that rethrows unreachable reads would ship green. Data health would then stay on its loading skeleton forever after a failed first read (or keep showing the old aggregate with no stale marker after a failed retry), with no **Try again** state, plus an unhandled promise rejection. Losing the network is the most likely failure of this read.
- **Required remediation**: Add a case that kills `manual:unreachable-not-mapped`. A thrown `fetch` for `/api/data-health` on the mount read should give `{ kind: "error", error: <ApiUnreachableError>, last: null }`, and one after a success should keep `last` with that success's `checkedAt`.

### IR-003 — `T001 (c)` depends on attention settling before the summary in the same tick, which the plan's harness forbids

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S3-1
- **Tasks**: T001 (c)
- **Files**: `web/src/app/shell-context.test.tsx:276-299`
- **Claim challenged**: The plan's shared harness (*Read order*): "Where a case depends on which read answers first, it uses `defer` and resolves attention, flushes, then resolves the summary. No assertion relies on two same-tick reads settling in a particular order." T001 (c) says "Continuing (b)", and (b) sequences with `defer`.
- **Observed evidence**: Case (c) mounts with standing answers and no `defer`. It asserts the summary at exactly 10 s spacing from mount (`:291`, five summary calls by 40 000 ms) and exactly 60 s after the terminal answer (`:292-297`). Both hold only if attention's answer lands first, at mount and at 40 000 ms. Today that order comes from `fetchScoreSummary`'s extra `await` (`shell-client.ts`), not from anything the plan or the design fixes. My order probe delays `attentionRead` by eight microtasks, a change the cadence contract does not distinguish. Exactly these five rows fail (`expected 1 to be 5` at `:291`), and the other 55 tests pass. The coder's second code review raised the same point as an accepted LOW warning, and the TDD evidence records the deviation from the 30 s read.
- **Expected evidence/behavior**: Plan, shared harness *Read order*, quoted above. Plan Other Notes (*Cross-read cadence*): "A change in one read takes effect for the other when that other read next settles", and "The tests sequence first answers with `defer` so they never depend on same-tick settle order."
- **Impact**: No production defect. Owner-shell §2.4 and the plan accept that the summary follows attention from its own next answer. But the test pins one arrival order of two network reads. Any change to the fetch path's microtask depth, including one the plan calls equivalent, breaks these rows and gives no information about the cadence.
- **Required remediation**: Make case (c) independent of same-tick order. Sequence the mount answers and the terminal answer with `defer` as (b) does, or assert the summary's return to 60 s from its own next answer, as the plan words it ("After the summary's next answer, the summary is also back on 60 s spacing").

### IR-004 — The commits that carry DEC-0323 to DEC-0326's code have no `Decision-Id:` trailer

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: T009 (DEC-0323, DEC-0326), T010 (DEC-0324, DEC-0325), T013
- **Files**: commits `075cddaf` (cycle 1: `useTitleDetail` and `TitleDetailContext` for DEC-0323, `shell-context.tsx:66-71,157-158,166-170,187-190`; the throwing `useShell` for DEC-0326, `:173-185`) and `98c65274` (cycle 2: the return type for DEC-0324, `use-data-health.ts:41`; the pending flag and trailing read for DEC-0325, `:44-45,50-102`)
- **Claim challenged**: `docs/unattended-mode.md` (*Commits made under a decision*): "Every commit containing such work carries the trailer `Decision-Id: DEC-NNNN`". "A driver that invoked a stage under a decision puts the trailer on that commit itself."
- **Observed evidence**: `git log --format=%B 26a1cfc9..HEAD` shows two commits with a subject line only, with no `Decision-Id` and no `Co-Authored-By`. All four decisions are `kind: provisional`, `status: open`, `owner_reviewed: false`, `commits: []`. DEC-0323's second opinion disagrees (`second_opinion_agrees: false`, preferring a sixth `titleDetail` member on `ShellContextValue` to a private context). So does DEC-0326's. On the same integration branch, CAP-003-E1-S8's coding commits and CAP-003-E3-S2's rework commit `9ed5cb72` carry their decision trailers. CAP-003-E3-S2 v1 IR-004 raised the same gap.
- **Expected evidence/behavior**: The code written because of DEC-0323 to DEC-0326 can be found by `Decision-Id`. If the owner overturns a decision, `revert` then reaches its code and not only the plan.
- **Impact**: DEC-0323 is contested, and three of the four decisions propagate to E3-S4, E3-S6, E3-S7 and E6. If the owner adopts DEC-0323's second opinion, a revert by decision cannot find `TitleDetailContext` or `useTitleDetail`. They would stay in `shell-context.tsx`, unlabelled, beside a new `titleDetail` member.
- **Required remediation**: The rework cycle commits and the stage commit carry `Decision-Id: DEC-0323`, `DEC-0324`, `DEC-0325` and `DEC-0326`, in the same paragraph as `Co-Authored-By` (the driver can use `sdd unit end --decision-id`). Whether to relabel `075cddaf` and `98c65274` is the owner's call, because cycle commits are not reworded.

### IR-005 — The coder's mutation runs left out two of the plan's seven hand-written mutants

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-28, DAC-E3-S3-4 (the behaviours those mutants target)
- **Tasks**: T013; plan *Validation Plan*, Mutation
- **Files**: `docs/.../CAP-003-E3-S3-evidence/mutants-cycle-1.json`
- **Claim challenged**: The plan's *Validation Plan* runs the mutants over both sources "plus the hand-written mutants in Other Notes". Cycle 1's evidence says its 15 hand-written mutants come "from the plan's kill lists".
- **Observed evidence**: Other Notes lists seven hand-written mutants. `mutants-cycle-1.json` contains neither "a planted `useEffect(() => { void fetchDataHealth(); }, [attention])` in the provider" nor "`ShellContextValue`: an added `credential?: string | null` member" (`grep -c "credential\|fetchDataHealth"` gives 0). I ran both. `manual:provider-reads-aggregate` is killed by Vitest (exit 1), and `manual:credential-member-added` is killed by `tsc` at `shell-context.test.tsx:480` (exit 2). The outcome holds. The record is incomplete.
- **Expected evidence/behavior**: The cycle's `mutation:` block covers every hand-written mutant the plan names, or says why one was dropped.
- **Impact**: Evidence quality only. The two highest-stakes properties of the provider, that it never reads the aggregate (AC-28) and that it carries no credential value (AC-4), had no mutation evidence until this review.
- **Required remediation**: In the rework cycle, include the plan's remaining hand-written mutants in the run (or carry this review's results). Do not retroactively edit cycle 1's evidence.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviation, T001 (c):** the terminal answer is at the 40 s read rather than the 30 s one. This is equivalent for the return to 60 s, and the TDD evidence records it. The missing `defer` sequencing is not justified (IR-003).
- **Justified deviation, T001 (d):** the summary's building answer resolves before attention's. The plan's own cross-read note requires this order, because attention's delay must already see the summary building. The TDD evidence records it.
- **Justified deviation, T013:** each cycle was committed as it ended, with `commit_hash: stage`. The plan's "no per-cycle commit is made" follows TEST-TDD-008 v1.5. The current v1.9 (2026-11-14) requires a commit per cycle.
- **Justified addition, T008 (e):** an error-to-error retry case beyond the plan, which kills `error-last-from-error-null`.
- **Justified addition, T008 (g):** a pending `retry()` at unmount, which kills `trailing-unmount-guard-off`.
- **Bookkeeping:** every checked box T001 to T013 has implementation evidence. T009 and T010 are PARTIAL only on their untested rules (IR-001, IR-002).
- **Out-of-scope changes:** none. The 17 paths are the four planned sources, the story's status line, its task checkboxes and the TDD evidence that T013 requires.
- **Open decisions this story implements:** DEC-0323 (contested), DEC-0324, DEC-0325 and DEC-0326 (contested) remain provisional and await the owner. The implementation follows the approved task plan, which adopts all four, so they are not findings against the code. IR-004 concerns only their traceability in Git.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework `CAP-003-E3-S3-tasks.md` against this report. Kill `manual:loading-to-not-served` (IR-001) and `manual:unreachable-not-mapped` (IR-002) with tests. The mutant definitions are in `CAP-003-E3-S3-implementation-review-v1-mutation.json`. Make `T001 (c)` independent of same-tick settle order (IR-003). Carry `Decision-Id:` trailers for DEC-0323 to DEC-0326 on the rework and stage commits (IR-004), and include the plan's two missing hand-written mutants in the rework cycle's run (IR-005). No production change is required. Then rerun this review (v2), which will use this report as its baseline.
- **Warnings accepted downstream**: N/A
