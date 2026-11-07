---
artifact_schema_version: 1
artifact_id: CAP-003-E3-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T05:46:11Z
  source_artifacts:
    - id: CAP-003-E3-S1
      version: "1"
    - id: CAP-003-E3
      version: "2"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E3-S1 — Shell Types, the One Fetch Module and the requestJson Export

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/owner-shell-and-command-palette/stories/CAP-003-E3-S1.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/app/`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Creates the two modules every CAP-003 screen reads the shell's data through. `web/src/app/shell-types.ts` declares `ReadState<T>` and `ScoreState` exactly as owner-shell §2.3 writes them, plus `Attention`, `DataHealth` and `ProblemPage` mirroring `data-health-api`'s `AttentionResponse`, `DataHealthResponse` and `ProblemPageResponse` field for field (data-health-api §2.4; system design §4.2), and `ScoreSummary` mirroring `classification-api`'s published `ClassificationSummaryResponse` field for field (snake_case, as served). `web/src/app/shell-client.ts` holds `fetchAttention()`, `fetchScoreSummary()` (a `404 not_found` resolves to `{ kind: "not_served" }`), `fetchDataHealth()` and `fetchProblems(cursor, limit)`, all through the delivered `requestJson`. The `requestJson` export DAC-E7-12 places here is already present: CAP-002-E4-S1 added it (commit `f530341`; `web/src/api/client.ts:154` reads `export async function requestJson`), so DAC-E3-S1-1's second clause applies and this story edits `client.ts` not at all. No screen, hook, provider or route is built here; CAP-003-E3-S2, CAP-003-E3-S3, CAP-003-E1-S8, CAP-003-E3-S5, CAP-003-E6-S1 and CAP-003-E6-S3 consume what this story exports.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-8 | The shell exposes `attention` and `scores` to Home's tile through typed reads: `Attention` and `ScoreSummary` are typed and fetched | T004, T005, T007, T008, T010, T011 |
| AC-16 | `Attention` carries `problems.stock_count` for the Data health chip | T004, T005, T008, T010 |
| DAC-E3-18 | `Attention` mirrors `AttentionResponse` field for field and `ScoreSummary` the published summary, neither redefined; `shell-client.ts` is the one fetch module for the three data-health routes and the summary | T004, T005, T006, T007, T008, T010, T011, T012 |
| DAC-E7-12 | `client.ts` exports `requestJson` unless CAP-002 already did (it did) | T001, T012 |
| DAC-E3-S1-1 | Only the `export` keyword would change; given CAP-002-E4-S1 already exported it, `client.ts` is not edited and the three delivered tests pass unchanged | T001, T012 |
| DAC-E3-S1-2 | `fetchScoreSummary()` resolves `{ kind: "not_served" }` on a summary `404`; any other `ApiError` or `ApiUnreachableError` rejects as delivered (traces to AC-24) | T002, T007, T011 |
| DAC-E3-S1-3 | `fetchProblems(cursor, limit)` requests `GET /api/data-health/problems` with `limit` and, only when set, `cursor`, and returns `ProblemPage` with `next_cursor` as served (traces to AC-13) | T003, T006, T010 |
| DAC-E3-S1-4 | `Attention.latest_terminal_download` carries the recorded terminal `state` and `failure_reason`; no field added or renamed from the wire shape | T004, T005, T008 |

Mapped test cases (all from `tests/component/owner-shell-tests.md`, confirmed in `tests/coverage-matrix.md` lines 165-168 and the per-story count at line 403, "4 of 4"): **TC-COMP-065, TC-COMP-066, TC-COMP-067, TC-COMP-068**. TC-COMP-068 also traces to DAC-E3-18, AC-8 and AC-16. The coverage-matrix row for epic DAC-E3-18 (line 163) lists TC-COMP-068 for the epic criterion's whole text; its `Shell context` clause (`health`, `refresh`, `setTitleDetail`) is CAP-003-E3-S3's and is not planned here. TC-COMP-220 (`requestJson` import type-checks) is CAP-003-E7-S6's, not this story's.

## Phase 1: Setup

Skipped. No dependency, configuration or directory is added: `web/src/app/` exists, vitest, biome and `tsc` are configured (`vitest.config.ts` root `web`, jsdom; `tsconfig.json` includes `web/src`, so test files are type-checked by `npx tsc --noEmit`), and `package.json` is `ui-components`' file (DEC-0211), untouched here.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the wire mirror, the request encoding and the `404` mapping before any production code exists.

All tests go in one new file, `web/src/app/shell-client.test.ts` (the story's file list). Follow `web/src/api/classification-client.test.ts`: a local `jsonResponse(status, body)` helper, `vi.stubGlobal("fetch", vi.fn(...))`, `afterEach(() => vi.unstubAllGlobals())`, and `expectTypeOf` from `vitest` for type-level assertions. Each mandatory test carries a traceability comment (`// Implements TC-COMP-066`). Every fixture is a made-up literal written from data-health-api §2.4, system design §4.2 and `src/factorflow/api/classification_models.py:455-585`, never produced by the code under test (no symmetric comparison). Type-level assertions use `expectTypeOf<X>().toEqualTypeOf<Literal>()` against an **independent literal type written out in the test**, never `toMatchTypeOf` (which accepts an added field, the wrong property for "no field added") and never a type imported from `shell-types.ts` on both sides. Type assertions are enforced by `npx tsc --noEmit`, which type-checks the test file; vitest's runtime treats them as no-ops, so every type-level mutant below is observed through `tsc`.

### Mandatory Component Tests

- [ ] T001 Implement TC-COMP-065 (client.ts export change is one keyword; delivered tests unchanged) as a recorded check, not a new test file: the export already exists at `web/src/api/client.ts:154`, so DAC-E3-S1-1's second clause applies and the expected diff is empty. Record in the TDD evidence (no cycle; `mutation: {not_applicable: "client.ts is not edited"}`) the output of `git diff --exit-code $(git merge-base HEAD origin/main) -- web/src/api/client.ts web/src/api/client.coverage.test.ts web/src/api/client.runs.test.ts web/src/api/render.test.tsx` together with `git diff --exit-code HEAD -- <same four files>` (both exit 0), and a green `npx vitest run web/src/api/client.coverage.test.ts web/src/api/client.runs.test.ts web/src/api/render.test.tsx`. Add no `export`, comment or reflow to `client.ts` — kills: remove-attribute on the `export` modifier of `requestJson` (`web/src/api/client.ts:154`, hand-written mutant in Other Notes), observed as `npx tsc --noEmit` failing on `shell-client.ts`'s `import { ApiError, requestJson } from "../api/client"` (TS2459, not exported)
- [ ] T002 [P] Implement TC-COMP-066 (fetchScoreSummary resolves not_served on 404 and rejects otherwise) in `web/src/app/shell-client.test.ts`: (a) stub `fetch` to answer `404` with the delivered envelope `{"error":{"code":"not_found","message":"No resource exists at this path.","resource":"classifications","request_id":"req-404"}}` (the shape `src/factorflow/api/app.py:338-347` serves for an unmatched `/api` path) and assert `await fetchScoreSummary()` `toEqual({ kind: "not_served" })` and that the stub was called once with `"/api/classifications/summary"`; (b) answer `500` with `{"error":{"code":"internal_error","message":"x","request_id":"req-500"}}` and assert the promise rejects with an `ApiError` whose `code` is `"internal_error"` and `requestId` `"req-500"`; (c) make `fetch` throw `new TypeError("network down")` and assert it rejects with `ApiUnreachableError` (not `ApiError`) — kills: negate-boolean on `caught.code === "not_found"` in `fetchScoreSummary` (the `!==` mutant resolves the 500 to `not_served` and rejects the 404, so (a) and (b) both fail) and swap-case on the `"not_served"` literal (observed by the exact `toEqual`)
- [ ] T003 [P] Implement TC-COMP-067 (fetchProblems sends limit and cursor only when set) in `web/src/app/shell-client.test.ts`: stub `fetch` to answer `200` with the literal `{"rows":[{"symbol":"KO","failures":[{"data_type":"prices","outcome":"failed","reason":"provider timeout","attempts":3,"completed_at":"2026-10-15T22:31:00+00:00","run_id":"6f1c2a0e-0000-4000-8000-000000000001"}],"retryable":true}],"next_cursor":"KO"}`; call `fetchProblems(undefined, 50)` and parse the URL the stub received with `new URL(input, "http://localhost")`: `pathname` is `"/api/data-health/problems"`, `searchParams.get("limit")` is `"50"` and `searchParams.has("cursor")` is `false`; call `fetchProblems("KO", 50)`: `limit` is `"50"` and `cursor` is `"KO"`; assert each call resolves `toEqual` the literal fixture, so `next_cursor` is `"KO"` as served (and, with a second fixture whose `next_cursor` is `null`, stays `null`, never `undefined` or `""`) — kills: negate-boolean on the cursor guard (`cursor != null` → `cursor == null`: the first request then carries `cursor`, the second lacks it) and drop-defaulted-argument on the `limit` parameter append (`limit=50` looks like the server default; observed as `searchParams.get("limit")` being `null`)
- [ ] T004 [P] Implement TC-COMP-068 (shell-types mirror the wire shape without added or renamed fields) in `web/src/app/shell-client.test.ts`: write out, in the test, the literal type of the data-health-api §2.4 `AttentionResponse` from the field list in Notes → Other Notes ("Wire shapes") and assert `expectTypeOf<Attention>().toEqualTypeOf<AttentionLiteral>()`; additionally assert `expectTypeOf<Attention["latest_terminal_download"]>().toEqualTypeOf<{ run_id: string; state: "succeeded" | "partial" | "failed" | "cancelled" | "abandoned"; ended_at: string; failure_reason: string | null } | null>()` and `expectTypeOf<Attention["problems"]["stock_count"]>().toEqualTypeOf<number>()` (AC-16) — kills: swap-case on a `latest_terminal_download.state` union member (e.g. `"abandoned"` → `"running"`) and drop-field-copy on the `failure_reason` member (deleting the field), each observed as `npx tsc --noEmit` failing on the `toEqualTypeOf` line

### Additional Unit Tests

- [ ] T005 [P] Type mirror of the other wire shapes and the two state unions in `web/src/app/shell-client.test.ts` (DAC-E3-18, DAC-E3-S1-4): independent literal types and `toEqualTypeOf` for `DataHealth` (data-health-api §2.4 `DataHealthResponse`, with `checks.daily_prices` and `checks.company_financials` each `| null` and the `DailyPricesCheckResponse`/`CompanyFinancialsCheckResponse` fields including `exception_count`), `ProblemPage` (`ProblemPageResponse`), `ScoreSummary` (the `ClassificationSummaryResponse` of `classification_models.py:455-585`, snake_case: `never_classified`, `set` with its eleven `SetBlock` fields incl. `not_current`, `later` with `state: "building" | "failed"`, `factors` keyed `value`/`growth`/`momentum`, `stocks_current` `| null`), and `ReadState<T>` and `ScoreState` exactly as owner-shell §2.3 writes them (`last: { data: T; checkedAt: Date } | null` for `ReadState`; `last: ScoreSummary | null` for `ScoreState`) — kills: swap-case on `DailyPricesCheck.status`'s `"not_determinable"` member and drop-field-copy on `ScoreSummary.stocks_current`, observed as `tsc` failing
- [ ] T006 [P] Request encoding edge cases in `web/src/app/shell-client.test.ts` (DAC-E3-S1-3, DAC-E3-18): `fetchProblems(null, 50)` sends no `cursor` (the value data-health-ui holds when `next_cursor` is null); `fetchProblems("BRK/B", 7)` sends `cursor` decoding back to `"BRK/B"` and `limit` `"7"` (sent as given, never clamped or defaulted client-side; the server refuses out-of-range values with `422`, data-health-api §2.3); every function's request carries `Accept: application/json` (inherited from `requestJson`) and method `GET` (no `init.method` set) — kills: drop-field-copy on the `cursor` value passed to `URLSearchParams` (observed as `searchParams.get("cursor")` not equal to `"BRK/B"`)
- [ ] T007 [P] `fetchScoreSummary` success and non-`not_found` 404 paths in `web/src/app/shell-client.test.ts` (DAC-E3-S1-2, AC-8): a `200` with a literal `ClassificationSummaryResponse` body resolves `toEqual` that literal (the summary itself, with no `kind` key added and no field renamed to camelCase); a `404` whose envelope `code` is not `"not_found"` (e.g. `"universe_not_found"`) rejects with that `ApiError`; a `404` whose body is not the envelope (plain text) rejects with an `ApiError` whose `code` is `null` (the `404 not_found` contract is the envelope's, see Resolved Conflicts 2) — kills: negate-boolean on the `instanceof ApiError` test (the mutant rethrows a matching `ApiError` and catches nothing else) and drop-field-copy on the success return (observed by `toEqual` on the literal)
- [ ] T008 [P] `fetchAttention` and `fetchDataHealth` in `web/src/app/shell-client.test.ts` (AC-8, AC-16, DAC-E3-18): each requests its exact path (`"/api/attention"`, `"/api/data-health"`, asserted on the stub's first argument, not by substring) and resolves `toEqual` a literal fixture with every nullable populated once and `null` once (`prices_as_of`, `latest_download`, `latest_terminal_download`, `items[].run_id`, `progress.total`, `checks.daily_prices`, `checks.company_financials`, `gap_stock_count`); a `500` envelope rejects with `ApiError` and a thrown `fetch` with `ApiUnreachableError` — kills: swap-case on the route literal (`"/api/data-health"` ↔ `"/api/attention"`, hand-written mutant in Other Notes), observed as the exact-path assertion failing

**Checkpoint**: Every test in `shell-client.test.ts` fails (the imports of `./shell-types` and `./shell-client` do not resolve; `tsc` reports them). T001's check already passes (nothing to change). No production code yet.

---

## Phase 3: Core Implementation

**Purpose**: The type module, then the fetch module.

- [ ] T009 Create `web/src/app/shell-types.ts` (depends on T004, T005 existing — RED first): `import type { ApiError, ApiUnreachableError } from "../api/client"`, `import type { DataType, RunState } from "../api/types"` and `import type { FactorName, LaterSet, RunOutcome } from "../api/classification-types"` (types only; no runtime import). Declare and export `ReadState<T>` and `ScoreState` verbatim from owner-shell §2.3. Declare and export `Attention`, `DataHealth`, `ProblemPage` and `ScoreSummary` with the exact fields, nesting and nullability listed in Notes → Other Notes ("Wire shapes"), snake_case as served (DAC-E3-18; story *Implementation*). Nested shapes may be exported as named interfaces using only names the designs already give them: data-health-reader §2.2's dataclass names (`Problems`, `LatestDownload`, `LatestTerminalDownload`, `Progress`, `AttentionItem`, `Failure`, `ProblemRow`, `GapDetectionState`, `DailyPricesCheck`, `CompanyFinancialsCheck`); no other new type name. Timestamps and dates are `string` (the wire's ISO-8601 text, never `Date`, as `web/src/api/types.ts` and `classification-types.ts` do; STD-UI-5); only `ReadState`'s `checkedAt` is `Date`, as §2.3 writes it. No field is added, renamed, made optional or widened. Doc comment on each exported type naming its wire model and section. Makes T004 and T005 pass
- [ ] T010 Create `web/src/app/shell-client.ts` with `fetchAttention()`, `fetchDataHealth()` and `fetchProblems(cursor, limit)` (depends on T009; T003, T006, T008 exist first): `import { ApiError, requestJson } from "../api/client"`. `fetchAttention(): Promise<Attention>` is `requestJson<Attention>("/api/attention")`; `fetchDataHealth(): Promise<DataHealth>` is `requestJson<DataHealth>("/api/data-health")`; `fetchProblems(cursor: string | null | undefined, limit: number): Promise<ProblemPage>` builds `new URLSearchParams()`, always appends `limit` as `String(limit)`, appends `cursor` only when `cursor != null`, and calls `requestJson<ProblemPage>(\`/api/data-health/problems?${params}\`)`. No `init` is passed, so the delivered `Accept` header and `GET` apply; no body is mapped, cast field by field or re-keyed (the wire is the type). Makes T003, T006 and T008 pass
- [ ] T011 Add `fetchScoreSummary()` to `web/src/app/shell-client.ts` (depends on T010; T002, T007 exist first): `fetchScoreSummary(): Promise<ScoreSummary | Extract<ScoreState, { kind: "not_served" }>>` calls `requestJson<ScoreSummary>("/api/classifications/summary")`, and in its `catch` returns `{ kind: "not_served" }` exactly when `caught instanceof ApiError && caught.code === "not_found"`; every other value, including `ApiUnreachableError` and any other `ApiError`, is rethrown unchanged (DAC-E3-S1-2; Resolved Conflicts 2). Comment the mapping with its derivation (system design §4.2 and owner-shell §3 "answers `404 not_found`"; `app.py:338-347`; `ApiError` carries `code`, not the HTTP status) and the AC and TC it serves, as `client.ts` comments do. Do not import or call CAP-002's `getClassificationSummary` (it maps to camelCase; Resolved Conflicts 3). Makes T002 and T007 pass

**Checkpoint**: Every test in `shell-client.test.ts` passes; `npx tsc --noEmit` is clean (all `toEqualTypeOf` assertions hold); `client.ts` is unchanged.

---

## Phase 4: Integration

**Purpose**: Show the new modules sit beside the delivered seam without changing it.

- [ ] T012 Confirm the delivered surface is unchanged and the fetch-module rule holds (depends on T009-T011): run the whole web suite (`npm run test`) without editing any delivered test; re-run T001's two `git diff --exit-code` commands; `git status --short` lists only `web/src/app/shell-types.ts`, `web/src/app/shell-client.ts`, `web/src/app/shell-client.test.ts`, this story's `-tasks.md` and `-tdd-evidence.yaml` (and the story's status line) as touched; and `grep -rlE "[\"'\`]/api/(attention|data-health|classifications/summary)" web/src --include='*.ts' --include='*.tsx' | grep -v '\.test\.' | sort` (request paths as string or template literals, not prose in comments) prints exactly `web/src/api/classification-client.ts` and `web/src/app/shell-client.ts` (the CAP-002 file is delivered and kept unchanged under AC-27, and `web/src/screens/research/use-score-set-poll.ts` reaches the summary only through it; Resolved Conflicts 3). Before this story the same command prints only `web/src/api/classification-client.ts`. Nothing imports the new modules yet (E3-S2, E3-S3, E1-S8, E6-S1 and E6-S3 are the first importers)

**Checkpoint**: DAC-E3-S1-1 holds (no edit to `client.ts`, delivered tests green) and `shell-client.ts` is the only new module reading the four routes.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [ ] T013 Run `npm run format` (a check; `biome format .` writes nothing) and fix any report with `npx biome format --write` on the three new files only; then `npm run lint`, `npx tsc --noEmit` and `npm run build`. Doc comments on each exported function name its endpoint and the AC it serves, in the style of `client.ts`. No behaviour change
- [ ] T014 After each TDD cycle in T002–T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E3-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC). The three cycles are listed in Other Notes

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E4-S1 | context | Already added `export` to `requestJson` (commit `f530341`, story status `docs-sync`), which is why this story leaves `client.ts` untouched (DAC-E3-S1-1 second clause; DAC-E7-12 "unless CAP-002 has already added the export"). Delivered; nothing to wait for |
| CAP-003-E2-S4 | soft | Builds the Pydantic `AttentionResponse`, `DataHealthResponse` and `ProblemPageResponse` that `shell-types.ts` mirrors. Both stories develop against the approved data-health-api §2.4 and system design §4.2 field lists; no import crosses them (this story doubles `fetch`). `dependencies.yaml` has no edge |
| CAP-003-E2-S5 | context | Registers the data-health routes on the running app; this story's tests double `fetch`, so the routes need not exist. Only the real-stack specs depend on it |
| CAP-003-E1-S8 | reverse | `deriveNeedsYou(attention: Attention, scores: ScoreState)` imports both types from `shell-types.ts` (ui-components §2.6, §11). Graph: E1-S8 depends on E3-S1 |
| CAP-003-E3-S2 | reverse | `usePolledRead` returns `ReadState<T>` from `shell-types.ts`. Graph: E3-S2 depends on E3-S1 |
| CAP-003-E3-S3 | reverse | `ShellProvider` calls `fetchAttention`, `fetchScoreSummary` and `fetchDataHealth` and maps `fetchScoreSummary`'s `{ kind: "not_served" }` into `ScoreState`. Graph: E3-S3 depends on E3-S1 |
| CAP-003-E3-S5 | reverse | The palette's `universes.ts` imports the exported `requestJson` this story confirms. Graph: E3-S5 depends on E3-S1 |
| CAP-003-E6-S1 | reverse | Imports the `DataHealth` type. Graph: E6-S1 depends on E3-S1 |
| CAP-003-E6-S3 | reverse | Calls `fetchProblems(cursor, 50)` for **Show more**. Graph: E6-S3 depends on E3-S1 |
| CAP-003-E7-S6 | reverse | Confirms the `requestJson` export and the unchanged delivered client tests (DAC-E7-S6-3, TC-COMP-220). Graph: E7-S6 depends on E3-S1 |

No new hard edge was found: the story imports only delivered CAP-001/CAP-002 modules (`web/src/api/client.ts`, `types.ts`, `classification-types.ts`). `dependencies.yaml` keeps `CAP-003-E3-S1: []`.

### Task Dependencies

- T001: no dependencies (a check against the delivered files; can run first)
- T002, T003, T004, T005, T006, T007, T008: no code dependencies (one new test file; authored as the RED half of their cycles)
- T009: depends on T004, T005 existing (RED first)
- T010: depends on T009; T003, T006, T008 exist first
- T011: depends on T010; T002, T007 exist first
- T012: depends on T009-T011
- T013: depends on T012
- T014: interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: T002 to T008 are parallel in thought but write one file; assign them to one agent, cycle by cycle
- Phase 3: sequential (T010 and T011 both edit `shell-client.ts`; both import T009's types)

---

## Validation Plan

### Constitution-Defined Commands

From `docs/constitution/tech-stack.md` (v7) **Validation Commands**, run from the repository root:

- Install: `npm ci` (only if `node_modules` is absent; this story adds no package)
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: this story adds no e2e spec and changes no rendered behaviour.

### Story-Specific Validation

- DAC-E3-S1-1 / DAC-E7-12: `git diff --exit-code $(git merge-base HEAD origin/main) -- web/src/api/client.ts web/src/api/client.coverage.test.ts web/src/api/client.runs.test.ts web/src/api/render.test.tsx` and `git diff --exit-code HEAD -- <same four files>` exit 0; `grep -n "^export async function requestJson" web/src/api/client.ts` prints line 154; the three delivered test files pass
- DAC-E3-S1-2: T002 and T007 green
- DAC-E3-S1-3: T003 and T006 green
- DAC-E3-S1-4 / DAC-E3-18: `npx tsc --noEmit` clean with T004 and T005's `toEqualTypeOf` assertions present; `grep -c "toMatchTypeOf" web/src/app/shell-client.test.ts` prints `0`
- DAC-E3-18 (one fetch module): T012's `grep` prints exactly the two files listed there. It matches a path only when it opens a string or template literal, so the prose mentions in `classification-types.ts:107`, `use-score-set-poll.ts:14` and the new modules' doc comments (written as `` `GET /api/attention` ``, path after the method) do not match; `shell-types.ts` holds no request path. The check does not contradict any task
- Mutation: `python3 scripts/mutation-run.py run` with `--command "npx vitest run web/src/app/shell-client.test.ts && npx tsc --noEmit"`, so type-level mutants in `shell-types.ts` are judged by `tsc` and runtime mutants in `shell-client.ts` by vitest; add the hand-written mutants in Other Notes

---

## Notes

### Resolved Conflicts

1. **`ScoreSummary` casing versus CAP-002's delivered camelCase type.** CAP-002's `ClassificationSummary` (`web/src/api/classification-types.ts:108-111`) and `getClassificationSummary()` rename every wire field to camelCase, and CAP-002's snake_case `WireClassificationSummary` (`classification-client.ts:115`) is not exported. **Governing:** epic DAC-E3-18 and the story's DAC-E3-18 ("`ScoreSummary` mirroring `classification-api`'s published summary, neither redefined") and the story's *Implementation* ("Snake_case wire fields are kept as published"), with owner-shell §2.3 naming the wire fields (`never_classified`, `set`, `later`, `factors`, `stocks_current`) and ui-components §2.6 reading `later.state` and `never_classified`. `ScoreSummary` is declared in `shell-types.ts` as the snake_case mirror of `ClassificationSummaryResponse`; CAP-002's literal unions (`FactorName`, `RunOutcome`, `LaterSet["state"]`) are reused by type import so nothing is re-modelled. CAP-002's files are not edited (DEC-0211; AC-27).
2. **"A `404`" versus the delivered `ApiError`, which carries no HTTP status.** owner-shell §2.1 and DAC-E3-S1-2 say a summary `404` maps to `not_served`; `ApiError` (`client.ts:63-85`) exposes `requestId`, `code` and `state`, not the status. **Governing (ladder step 4, contract already pinned):** system design §4.2 (`GET /api/classifications/summary`: "`404 not_found` before the route is deployed") and owner-shell §3's assumption ("answers `404 not_found` until its route is deployed"), served by `app.py:338-347` (every unmatched `/api` path answers `404` with envelope `code: "not_found"`) and copied by `toApiError` (`client.ts:107-109`). The mapping is `caught instanceof ApiError && caught.code === "not_found"`. Reading the status through a private fetch wrapper would bypass `requestJson`, which owner-shell §1 names as this component's dependency. Not a gap and not a provisional decision; the residual (a `404` with no envelope rejects instead of resolving) is outside the stated contract and is pinned by T007.
3. **"The one fetch module for … the summary" versus CAP-002's own summary read.** `web/src/screens/research/use-score-set-poll.ts:120` already reads `GET /api/classifications/summary` through CAP-002's `getClassificationSummary`. **Governing:** capability AC-27 (CAP-002's routes and screens kept unchanged) and DEC-0211 (`web/src/screens/**` and `web/src/api/*` are not owner-shell's), above epic DAC-E3-18's wording. DAC-E3-18 is read as: within CAP-003, `shell-client.ts` is the one module that reads these routes, so no CAP-003 screen opens its own request. T012's check lists the delivered CAP-002 client explicitly rather than forbidding it.

### Open Gaps

None. Every fact this plan needs is fixed by an artifact or the delivered code: the field lists by data-health-api §2.4 and data-health-reader §2.2 (nullability), the summary by `classification_models.py:455-585`, the types `ReadState`/`ScoreState` by owner-shell §2.3, the `404` mapping by Resolved Conflict 2, and the export by `client.ts:154`. No bound, limit or default is set here: `limit` is passed through as the caller gives it (data-health-ui passes 50) and the server owns the 1-500 bound.

### Other Notes

- **Wire shapes (the field lists T004, T005 and T009 use).** All timestamps and dates are `string`; `?` is never used — a nullable field is `| null`.
  - `Attention` (data-health-api §2.4 `AttentionResponse`; system design §4.2; reader §2.2 for nullability): `checked_at: string`; `followed_count: number`; `prices_as_of: string | null`; `credential_present: boolean`; `problems: { stock_count: number; symbols: string[]; newest_completed_at: string | null }`; `latest_download: { run_id: string; state: RunState; requested_at: string; started_at: string | null; ended_at: string | null; progress: { done: number; total: number | null } } | null`; `latest_terminal_download: { run_id: string; state: "succeeded" | "partial" | "failed" | "cancelled" | "abandoned"; ended_at: string; failure_reason: string | null } | null`; `items: { kind: "data_problems" | "download_not_complete" | "credential_missing"; recorded_at: string; run_id: string | null }[]`.
  - `ProblemPage` (`ProblemPageResponse`): `rows: { symbol: string; failures: { data_type: DataType; outcome: "failed" | "not_found"; reason: string | null; attempts: number; completed_at: string; run_id: string }[]; retryable: boolean }[]`; `next_cursor: string | null`.
  - `DataHealth` (`DataHealthResponse`): `checked_at: string`; `never_acquired: boolean`; `followed_count: number`; `affected_count: number`; `checks: { daily_prices: DailyPricesCheck | null; company_financials: CompanyFinancialsCheck | null }`; `problems: ProblemPage`. `DailyPricesCheck`: `status: "ok" | "exceptions" | "not_determinable"`; `absent_count: number`; `gap_stock_count: number | null`; `behind_count: number`; `latest_session: string | null`; `gap_detection: { available: boolean; reason: string | null }`; `exception_count: number`; `exception_symbols: string[]`. `CompanyFinancialsCheck`: `status: "ok" | "exceptions"`; `absent_count: number`; `problem_count: number`; `as_of: string | null`; `exception_count: number`; `exception_symbols: string[]`.
  - `ScoreSummary` (`ClassificationSummaryResponse`, `classification_models.py:455-585`): `never_classified: boolean`; `set: { set_id: string; classification_date: string; run_id: string; run_started_at: string; run_outcome: RunOutcome; state: "complete"; started_at: string; ended_at: string; latest_trading_day: string; active_instruments: number; not_current: boolean } | null`; `later: { set_id: string; state: LaterSet["state"]; started_at: string; ended_at: string | null; failure_reason: string | null; run_id: string; run_started_at: string } | null`; `factors: Record<FactorName, { qualified_count: number; ranked: boolean; min_peer_set_size: number }>`; `stocks_current: { current_count: number; followed_count: number } | null`. The narrowings (`state: "complete"`, `RunOutcome`, `LaterSet["state"]`) are CAP-002's own published wire narrowings (`classification-client.ts:70-92`), not new ones.
- **`fetchScoreSummary`'s success value.** The story fixes only the `404` value; the success value is the summary itself (the function's name and owner-shell §2.1 "fetchScoreSummary()"), so the return type is `ScoreSummary | Extract<ScoreState, { kind: "not_served" }>`. The two are told apart by `"kind" in value` (the wire summary has no `kind` key). `ShellProvider` (CAP-003-E3-S3) wraps a served value as `{ kind: "served", data, checkedAt }`; `checkedAt` is client time, so it is not this module's to set.
- **TDD cycles** (T014): cycle 1 — T004, T005 RED → T009 GREEN (types; mutation judged by `tsc`); cycle 2 — T003, T006, T008 RED → T010 GREEN; cycle 3 — T002, T007 RED → T011 GREEN. T001 and T012 are checks with no production change and add no cycle (`client.ts` is not edited). T013 is a polish pass; if it changes no behaviour it records `mutation: {not_applicable: "format and doc comments only"}` within cycle 3 or as its own cycle.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/api/client.ts: export async function requestJson → async function requestJson` (killed by `tsc` on `shell-client.ts`'s import; revert immediately — `client.ts` must stay unchanged in the committed diff)
  - `web/src/app/shell-client.ts: "/api/data-health" → "/api/attention"` (killed by T008's exact-path assertion)
  - `web/src/app/shell-client.ts: caught.code === "not_found" → caught.code === "not_served"` (killed by T002(a))
- **The backend is not needed.** The data-health response models are built by CAP-003-E2-S4 and the routes registered by CAP-003-E2-S5; neither exists in this clone (no `src/factorflow/api/routes/data_health.py`). Every test here doubles `fetch`, and the types follow the approved data-health-api §2.4, which governs if the delivered Pydantic models ever differ.
- **No browser storage, no new dependency, no `dangerouslySetInnerHTML`** (owner-shell §4): the modules only type and fetch.
- **Concurrency.** No hard dependency's plan exists to stay consistent with; the consumers above plan against owner-shell §2.3 and this file. The `fetchProblems(cursor: string | null | undefined, limit: number)` signature accepts the `next_cursor` value (`string | null`) data-health-ui holds and the `undefined` TC-COMP-067 passes.
