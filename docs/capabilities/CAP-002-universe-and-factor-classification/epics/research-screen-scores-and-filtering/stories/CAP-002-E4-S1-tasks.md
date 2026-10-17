---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:30:00Z
  source_artifacts:
    - id: CAP-002-E4-S1
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E4-S1 — Classification Fetch Layer, Response Types and the requestJson Export

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S1.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E4-tasks`
**Date**: 2026-10-17

## Summary

Delivers the typed fetch layer every CAP-002 screen reads through: response types that mirror `classification-api` section 2.7 (`web/src/api/classification-types.ts`), a client with one function per universe and classification endpoint that maps the snake_case wire to camelCase and keeps decimal-string scores and `YYYY-MM-DD` dates as strings (`web/src/api/classification-client.ts`), and the one-keyword edit that exports `requestJson` from the delivered `web/src/api/client.ts` (DEC-0064, DEC-0086). An error envelope reaches the caller as a `ClassificationApiError` carrying code, operation, resource and reason without any prose being parsed, and `neverClassified`, `set` and `later` are one shape on both the list and the summary read, so the never-populated state (AC-22) and the not-current state (AC-20) are expressible before any screen exists. No screen, hook or copy is built here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-16 | Sort, filter, scope and compare reads exist as typed calls (list read with sort, order, the twelve bounds, `hide_incomplete`, `symbol`, `universe_id`, `symbols`) | T002, T005, T009, T011, T012 |
| AC-20 | The `later` block (state, failure reason, download start) and `set.notCurrent` are typed and mapped on the list, summary and set reads | T002, T004, T009, T011 |
| AC-22 | `neverClassified` and the error envelope are first-class values, so "no stocks classified" and a refusal are never an empty list | T003, T004, T007, T009, T010 |
| DAC-E4-3 | `matchCount` is mapped from `match_count`, never derived from `stocks.length`; filter inputs are sent as query parameters | T002, T005, T011 |
| DAC-E4-S1-1 | Only the `export` keyword changes in `client.ts`; every delivered client test still passes | T001, T008, T012 |
| DAC-E4-S1-2 | Envelope surfaces code, operation, resource, reason without parsing prose | T003, T007, T010 |
| DAC-E4-S1-3 | `neverClassified`, `set`, `later` are one shape | T004, T009 |
| DAC-E4-S1-4 | Every field of every section 2.7 response has a typed counterpart; decimal strings stay strings | T002, T009, T011 |

Mapped test cases (all from `tests/component/classification-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 199-202): TC-COMP-130, TC-COMP-131, TC-COMP-182, TC-COMP-183. No other component TC traces to a DAC-E4-S1-* criterion. TC-COMP-131 also lists DAC-E4-3 and AC-16; TC-COMP-006 (DAC-E1-S7-2, the create dialog) is E1-S7's and consumes the `symbols` this story exposes (see Open Gap 2).

## Phase 1: Setup

Skipped. No new dependency, configuration or directory: `web/src/api/` exists and holds `client.ts`, `types.ts` and colocated `*.test.ts` files; vitest, biome and `tsc` are already configured (`vitest.config.ts` root `web`, `tsconfig.json` includes `web/src`).

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the fetch layer's behaviour from the acceptance criteria. All tests go in one file, `web/src/api/classification-client.test.ts`, which does not exist yet. Follow the pattern in `web/src/api/client.runs.test.ts`: a local `jsonResponse(status, body)` helper and `vi.stubGlobal("fetch", ...)`. Each mandatory test carries a traceability comment (`// Implements TC-COMP-130`). Test data is made-up wire JSON written from section 2.7, never copied from a running API.

### Mandatory Component Tests

- [ ] T001 [P] Implement TC-COMP-130 (Exporting requestJson changes only the export keyword) in `web/src/api/classification-client.test.ts`: import `requestJson` from `./client`; assert it is a function, that a 200 JSON body is returned unchanged, that a 404 `{"error":{"code","message","resource","request_id"}}` body rejects with `ApiError` carrying that `code` and `requestId`, and that a rejected `fetch` rejects with `ApiUnreachableError`. "Every delivered client test still passes" is asserted by T012 (the unchanged delivered files `client.coverage.test.ts`, `client.runs.test.ts`, `render.test.tsx` and the shell tests run green, and `git diff --numstat` of `client.ts` is `1 1`)
- [ ] T002 [P] Implement TC-COMP-131 (Every API response field has a typed counterpart; scores stay strings) in `web/src/api/classification-client.test.ts`: one fixture and one mapped-result assertion per section 2.7 response, calling the matching client function with `fetch` stubbed: `UniverseListResponse`, `UniverseResponse` (with `origin` for both `by_hand` and `from_filter`, `members[].factors`, `set`), `UniverseEventsResponse`, `AddMembersResponse`, `RemoveMemberResponse`, `RetireUniverseResponse`, `ClassificationListResponse` (`match_count` 1200 with 2 `stocks` rows: `matchCount` is 1200, not 2, DAC-E4-3), `ClassificationSummaryResponse` (with `stocks_current` both object and null), `StockEvidenceResponse` (with `inputs` and `memberships`), `StockHistoryResponse`, `SetListResponse`, `SetResponse`. Assert every wire field appears under its camelCase name, that `score` and `percentile` such as `"1.2300000000"` and `"87.0000000000"` come back as the same strings (trailing zeros kept, `typeof` is `"string"`), that `classificationDate`, `runStartedAt`-adjacent dates (`asOf`, `knownOn`, `memberSince`) are unparsed strings, and that a `null` stays `null` (never `0` or `""`)
- [ ] T003 [P] Implement TC-COMP-182 (Fetch layer surfaces envelope code, operation, resource, reason) in `web/src/api/classification-client.test.ts`: stub a 409 envelope `{"error":{"code":"instrument_not_acquired","message":"MISLEADING PROSE naming QQQ","resource":"universe","request_id":"r-1","symbols":["MSFT","TSLA"]}}` for `createUniverse` and assert the thrown value is a `ClassificationApiError` (and `instanceof ApiError`) with `code` `"instrument_not_acquired"`, `reason` equal to that code, `resource` `"universe"`, `operation` equal to the operation identifier of `createUniverse`, `requestId` `"r-1"` and `symbols` `["MSFT","TSLA"]` taken from the field, not from `message`; repeat for a `404` `universe_not_found` on `getUniverse` (resource `universe`) and a `422` `validation_error` on `listClassifications`. The prose in `message` must differ from every asserted field so a parser of prose would fail the test
- [ ] T004 [P] Implement TC-COMP-183 (Types express neverClassified, set and later as one shape) in `web/src/api/classification-client.test.ts`: map a list body and a summary body with `never_classified: true`, `set: null`, `later` populated (`state: "building"`, then `"failed"` with `failure_reason`), and assert both results expose `neverClassified === true`, `set === null` and the mapped `later` (`setId`, `state`, `startedAt`, `endedAt`, `failureReason`, `runId`, `runStartedAt`). Add a type-level assertion with vitest `expectTypeOf` that `ClassificationList["later"]` and `ClassificationSummary["later"]` are the same type (`LaterSet | null`), and map a body with `set` populated, `later` populated and `not_current: true` and one with both nullable parts quiet (`later: null`, `notCurrent: false`)

### Additional Unit Tests

- [ ] T005 [P] Request encoding for reads in `web/src/api/classification-client.test.ts` (AC-16, DAC-E4-3): assert the URL `fetch` receives for `listClassifications` with each of the twelve bounds (`value_percentile_min`, `value_percentile_max`, `value_score_min`, `value_score_max`, and the `growth_*` and `momentum_*` equivalents), `hide_incomplete`, `symbol`, `universe_id`, `sort`, `order`, `limit`, `cursor` and `symbols`; only present parameters are sent; `hide_incomplete` is sent as `true` only when true; bound values are sent as the strings they were given; `symbols` is sent as one repeated `symbols` key per entry (Open Gap 3); `listUniverses` (`lifecycle`, `name`, `limit`, `cursor`), `getUniverse` (`as_of`), `listUniverseEvents`, `listClassificationSets`, `getStockHistory` send only present parameters; path segments are `encodeURIComponent`-encoded for `getUniverse`, `getStockEvidence` (`BRK.B`, `A/B`), `getStockHistory`, `getClassificationSet` and `removeUniverseMember`; the request carries `Accept: application/json` (inherited from `requestJson`)
- [ ] T006 [P] Request bodies for writes in `web/src/api/classification-client.test.ts` (AC-16): `createUniverse` by hand sends `POST /api/universes` with `{"name","symbols"}` and no `filter`; from a result sends `{"name","filter","set_id"}` with the camelCase thresholds mapped to the wire names (the twelve bounds, `hide_incomplete`, `symbol`, `null` when no search is active) and no `symbols`; `renameUniverse` sends `PATCH` `{"name"}`; `retireUniverse` sends `DELETE`; `addUniverseMembers` sends `POST .../members` `{"symbols"}`; `removeUniverseMember` sends `DELETE .../members/{symbol}`; every body carries `Content-Type: application/json` and a body-less call carries none
- [ ] T007 [P] Error-path edge cases in `web/src/api/classification-client.test.ts` (AC-22, DAC-E4-S1-2): a non-2xx response whose body is not JSON, or has no `error` object, rejects with a `ClassificationApiError` whose `code` and `reason` are `null`, `symbols` is `[]`, `requestId` is `"unknown"` and `operation` is still set; a rejected `fetch` rejects with `ApiUnreachableError`, not a `ClassificationApiError`; a 200 body that is not JSON rejects with `ApiUnreachableError` (unchanged `requestJson` behaviour); `globalThis.fetch` is the stubbed function again after a failed call and after a successful one; two concurrent failing calls (`Promise.allSettled`) each carry their own envelope's `resource` and `symbols`, never the other's

**Checkpoint**: All tests written and failing (the imports of `./classification-client` and `./classification-types` do not resolve, and `requestJson` is not exported). No production code yet.

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the smallest delivered change and two new modules.

- [ ] T008 Add the `export` keyword to `requestJson` in `web/src/api/client.ts` (line `async function requestJson<T>(` becomes `export async function requestJson<T>(`). Change nothing else in the file: no comment, no signature, no reflow (DAC-E4-S1-1). Makes T001 pass
- [ ] T009 [P] Create `web/src/api/classification-types.ts`: camelCase public types mirroring classification-api section 2.7 field for field (DAC-E4-S1-4), with scores and percentiles typed `string | null`, dates typed `string`, and timestamps typed `string`. Types: `FactorName`, `ReasonCode`, `FactorCell`, `FactorSummary`, `CurrentSet` (every `SetBlock` field: `setId`, `classificationDate`, `runId`, `runStartedAt`, `runOutcome`, `state` as `"complete"`, `startedAt`, `endedAt`, `latestTradingDay`, `activeInstruments`, `notCurrent`), `LaterSet`, `StockRow`, `ClassificationList`, `ClassificationSummary` (with `stocksCurrent: { currentCount; followedCount } | null`), `InputRow` (`factor`, `inputName`, `label`, `status` `"present" | "missing" | "outdated" | "not_computable"`, `value` `string | null`, `asOf`, `knownOn` `string | null`, `restatedPossible`, `detail: unknown`), `Membership`, `StockEvidence`, `StockHistory` and its row, `ClassificationSet` and `ClassificationSetPage` (the `SetResponse` and `SetListResponse` shapes, `state` `"building" | "complete" | "failed"`), `UniverseSummary`, `UniverseList`, `UniverseOrigin` (`kind` `"by_hand" | "from_filter"`, `setId`, `classificationDate`, `thresholds: Record<string, string> | null`, `hideIncomplete`, `symbol`), `UniverseDetail` (with `members[]` carrying `memberSince` and `factors`, and `set`), `UniverseEvent` (`eventType` `"created" | "renamed" | "member_added" | "member_removed" | "retired"`, `filterProvenance: unknown`), `UniverseEventPage`, `AddMembersResult`, `RemoveMemberResult`, `RetireUniverseResult`, the request-side `Thresholds` (twelve optional bounds as strings, `hideIncomplete`, `symbol`), `ClassificationListParams` and the `ClassificationOperation` and `ClassificationResource` literal unions. `neverClassified`, `set` and `later` have the same declared types on `ClassificationList` and `ClassificationSummary`, written once and reused (DAC-E4-S1-3). Start from the excerpt in classification-ui section 2.4 and add what section 2.7 has that the excerpt omits (Resolved Conflict 1). Do not import `ScreenState`; do not use `Date`. Makes the type assertion in T004 pass. Depends on nothing
- [ ] T010 Create `web/src/api/classification-client.ts`, error handling first (depends on T008, T009): (a) `ClassificationApiError extends ApiError` adding `operation`, `resource`, `reason` (the envelope `code`, or `null`) and `symbols` (`string[]`, `[]` when absent), constructed with the same `(message, requestId, { code, state })` shape `ApiError` takes; (b) a private `request<T>(operation, resource, input, init?)` that calls the imported `requestJson`, keeps `ApiUnreachableError` untouched, converts a caught `ApiError` into a `ClassificationApiError`, and reads the two envelope fields the delivered `toApiError` drops (`resource`, `symbols`) from a clone of the error response captured per call (Open Gap 2); the capture swaps `globalThis.fetch` only for the synchronous start of the `requestJson` call and restores it in a `finally` before awaiting, so concurrent calls cannot see each other's envelope; a response that does not parse as the envelope leaves `resource` at the operation's own resource, `symbols` `[]`. `message` is never parsed. Makes T003 and T007 pass
- [ ] T011 Add the endpoint functions and field-by-field mappers to `web/src/api/classification-client.ts` (depends on T009, T010): `listUniverses`, `createUniverse` (two call shapes: by hand, from a result), `getUniverse`, `renameUniverse`, `retireUniverse`, `listUniverseEvents`, `addUniverseMembers`, `removeUniverseMember`, `listClassifications`, `getClassificationSummary`, `listClassificationSets`, `getClassificationSet`, `getStockEvidence`, `getStockHistory`, against the paths and methods of classification-api section 11. Each maps the body explicitly (as `client.ts` does for runs), never spreads or casts a wire object onto a public type, keeps `score`, `percentile`, `value` and every date as the wire string, and builds query strings from present parameters only with `URLSearchParams`. `listClassifications` maps `match_count` to `matchCount` and `unknown_symbols` to `unknownSymbols` and never computes a count from `stocks`. One shared mapper each for `SetBlock`, `LaterBlock`, `FactorCellResponse` and the factor-summary record, reused by every response that carries them. Makes T002, T004, T005 and T006 pass

**Checkpoint**: Every test in `classification-client.test.ts` passes; `npx tsc --noEmit` is clean; `client.ts` differs from `HEAD` by one line.

---

## Phase 4: Integration

**Purpose**: Show the new module sits beside the delivered seam without changing it.

- [ ] T012 Confirm the delivered surface is unchanged (depends on T008 to T011): run the whole existing web suite (`client.coverage.test.ts`, `client.runs.test.ts`, `render.test.tsx`, the shell and routes tests) without editing any of them, run `git diff --numstat -- web/src/api/client.ts` and confirm `1	1	web/src/api/client.ts`, and `git diff --stat` shows only `client.ts`, `classification-types.ts`, `classification-client.ts`, `classification-client.test.ts` and this story's `-tasks.md` and `-tdd-evidence.yaml` as touched. Nothing imports the new modules yet (the first importers are the later E4 and E1 stories)

**Checkpoint**: DAC-E4-S1-1 holds: one keyword changed, every delivered test green.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T013 Run `npm run format` (a check; `biome format .` does not write), fix any report by running `npx biome format --write` on the four touched files only, then `npm run lint`, `npx tsc --noEmit` and `npm run build`; add short doc comments on the exported functions that name the endpoint and the AC it serves, in the style of `client.ts`. No behaviour change
- [ ] T014 After each TDD cycle in T001-T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E4-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). The three cycles are listed in Other Notes

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E1-S6 | soft | Builds the `universes` router whose responses `UniverseResponse`, `UniverseListResponse` and the envelope this client mirrors; both develop against classification-api section 2.7 and section 11 (story Dependencies). `dependencies.yaml` has no edge |
| CAP-002-E3-S5 | soft | Builds the `classifications` router whose responses this client mirrors; same approved contract, no import either way. `dependencies.yaml` has no edge |
| CAP-002-E4-S2 | reverse | `research-query.ts` produces the request parameters `listClassifications` accepts and imports `classification-types.ts`; graph edge E4-S2 depends on E4-S1 |
| CAP-002-E1-S7 | reverse | The create dialog imports this client and reads `ClassificationApiError.symbols` for `instrument_not_acquired` (TC-COMP-006); graph edge E1-S7 depends on E4-S1 |
| CAP-002-E4-S10 | context | Keeps the rest of the shell composition (`shell.tsx`, `routes.tsx`, four shell tests); this story makes only the `requestJson` export (DEC-0086). No file is shared |

No new hard edge was found; `dependencies.yaml` already lists `CAP-002-E4-S1: []` and needs no change.

### Task Dependencies

- T001, T002, T003, T004, T005, T006, T007: no dependencies (same new test file, written as one cycle each; can be authored in parallel)
- T008: depends on T001 existing (RED first); no code dependency
- T009: no code dependency; depends on T004 existing (RED first)
- T010: depends on T008, T009; T003 and T007 exist first
- T011: depends on T009, T010; T002, T004, T005, T006 exist first
- T012: depends on T008-T011
- T013: depends on T012
- T014: interleaved, runs after every TDD cycle and before the next begins

### Parallel Opportunities

- Phase 2: T001 to T007 write to one file, so they are parallel in thought and sequential in editing; assign to one agent
- Phase 3: T008 and T009 are independent and can run together; T010 and T011 follow and both edit `classification-client.ts`, so they are sequential

---

## Validation Plan

### Constitution-Defined Commands
- Build: `npm run build`
- Test: `npm run test` (single file while iterating: `npx vitest run web/src/api/classification-client.test.ts`)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit` (named in the story's Technical Details; not in the tech-stack table)

Working directory is the repository root `repos/factorflow-v2/FactorFlow-v2`. The tech-stack file's Validation Commands table lists `npm run build`, `npm run test`, `npm run test:e2e`; lint and format come from `package.json` (`biome lint .`, `biome format .`) and the story. `npm run test:e2e` is not run by this story (no screen exists).

### Story-Specific Validation
- DAC-E4-S1-1: `git diff --numstat -- web/src/api/client.ts` prints `1	1`, and `git diff -- web/src/api/client.ts` shows only the `export` keyword added; the delivered `client.*.test.ts` files are untouched and pass
- DAC-E4-S1-2: the T003 and T007 envelope assertions pass with a `message` that contradicts every field asserted
- DAC-E4-S1-3: the T004 runtime assertions and `expectTypeOf` pass; `npx tsc --noEmit` is clean
- DAC-E4-S1-4: the T002 fixtures cover all twelve section 2.7 response shapes and assert strings stay strings
- DAC-E4-3: the T002 list fixture has `match_count` larger than `stocks.length` and `matchCount` equals the former
- AC-22: a `never_classified: true` body maps to `neverClassified: true` with `set: null`, distinct from a body with `match_count: 0` and a set

---

## Notes

### Resolved Conflicts

1. **`CurrentSet` and `LaterSet` shape.** classification-ui section 2.4's excerpt of `CurrentSet` omits the `SetBlock` fields `state` and `latestTradingDay`, while classification-api section 2.7 lists them and story criterion DAC-E4-S1-4 requires "every response in classification-api section 2.7" to have a typed counterpart for each field. Governing rule: story acceptance criteria and the API contract outrank an illustrative snippet in a design ("excerpt; mirrors classification-api section 2.7" is the snippet's own heading). T009 includes both fields. No source edit is required.
2. **`state` of the current set.** Section 2.7 types `SetBlock.state` without values; the reader's `CurrentSet` carries `state: str  # complete` and selects only `state = 'complete'` rows (classification-reader section 2.x, `current_set`), and the store's CHECK allows `building`, `complete`, `failed`. The current set's `state` is therefore typed `"complete"`, and `building`/`failed` appear only on `LaterSet` and on `ClassificationSet` (`SetResponse`). Established by classification-reader and research-store; no conflict remains.
3. **Design 2.4 says the client exposes `symbols` on the error; DAC-E4-S1-1 says only the keyword changes in `client.ts`.** The delivered `toApiError` keeps `message`, `request_id`, `code`, `state` and drops `resource` and `symbols`. Not an authority conflict: both are satisfiable without editing `client.ts` (Open Gap 2). The story AC governs the file; the design governs the behaviour.

### Open Gaps

1. **Operation and reason on the error (DAC-E4-S1-2). PROVISIONAL — awaiting owner confirmation (2026-10-17).** The envelope has `code`, `message`, `resource`, `request_id`; it has no `operation` or `reason` field, and classification-api section 2.5 says the *message prose* names the operation, resource and reason, which the interface must not parse. Adopted: `operation` is a stable identifier the client itself assigns per function (a `ClassificationOperation` literal union, kebab-case of the function name, for example `"create-universe"`, `"list-classifications"`); `reason` is the envelope `code` (the code is the contract, section 2.5), `null` when absent; `resource` is the envelope's `resource`, falling back to the resource the endpoint belongs to (`universe`, `universe-member`, `classification`, `classification-set`) when the body is not an envelope. Derivation: DAC-E4-S1-2 names the four values, only `code` and `resource` exist on the wire, `copy.ts` (a later story) maps code and operation to the display sentence (classification-ui section 2.4). Follow-up: classification-ui section 2.4 should name the operation identifiers when next revised.
2. **Reading `resource` and `symbols` without editing `toApiError`. PROVISIONAL — awaiting owner confirmation (2026-10-17).** The delivered `ApiError` does not retain the envelope's `resource` or the `instrument_not_acquired` `symbols` list (classification-api section 2.5), the create dialog (TC-COMP-006, E1-S7) must name every unfollowed stock, and DAC-E4-S1-1 permits no edit to `client.ts` beyond the keyword. Adopted: the private `request` helper in `classification-client.ts` captures a clone of the error response for its own call by swapping `globalThis.fetch` for the synchronous start of the `requestJson` call (JavaScript runs `fetch(...)` inside `requestJson` before its first `await`, so the swap and restore cannot interleave with another call); T007 pins the two assumptions this rests on (restoration and no cross-talk between concurrent calls). Alternatives rejected: parsing `message` (forbidden by DAC-E4-S1-2), a second copy of the request helper (SA-DUP-001, the reason DEC-0064 exports `requestJson`), editing `toApiError` (breaks DAC-E4-S1-1 and needs a story revision). If the owner prefers, the cleaner fix is a one-line widening of `ApiError` in `client.ts`, which needs DAC-E4-S1-1 amended. Follow-up: classification-ui sections 2.2 and 2.4 and story DAC-E4-S1-1.
3. **Wire encoding of the compare `symbols` list. PROVISIONAL — awaiting owner confirmation (2026-10-17).** Section 2.4 of the API design says `symbols` is a `list[str]` query parameter and the URL of the compare route is `?symbols=AAPL,MSFT`, but no artifact states how the list crosses the API boundary (repeated key or one comma-joined value), and CAP-002-E3-S5 has no task plan yet. Adopted: one repeated `symbols` key per entry (`symbols=AAPL&symbols=MSFT`), the encoding FastAPI binds to a `list[str]` query model without custom parsing. The encoding lives in one small function so a different choice is a one-line change. Follow-up: classification-api section 2.4 / section 11 should state the encoding, and CAP-002-E3-S5's plan must match; its integration tests (TC-INT-038 to TC-INT-043 path) will fail visibly if it does not.
4. **Wire types of two free-form values. PROVISIONAL — awaiting owner confirmation (2026-10-17).** `InputRow.detail` (jsonb NOT NULL in research-store) and `UniverseEvent.filterProvenance` have no JSON shape in section 2.7, and `UniverseOrigin.thresholds` is `dict[str, Decimal]` in universe-service. Adopted: `detail` and `filterProvenance` are typed `unknown` (passed through, never indexed by this layer); `thresholds` is `Record<string, string> | null`, because section 2.7 states decimals are serialised as strings. Follow-up: classification-api section 2.7 should type these at its next revision.

### Other Notes

- **Cycle plan for T014.** Three TDD cycles, each RED then GREEN, each reviewed before the next: (1) T001 then T008; (2) T002, T004, T005, T006 then T009, T011's mappers and request builders (the success path); (3) T003, T007 then T010 and the error mapping (`ClassificationApiError`). T010 is written before T011 in the file because T011's functions call `request`, so in cycle 2 the coding agent adds a minimal `request` that only delegates to `requestJson`, and cycle 3 replaces its error handling; the cycle-2 diff must not include `ClassificationApiError`.
- **`hide_incomplete`** is sent only when true; the API default is false, so omitting it is equivalent (classification-api section 2.4).
- **Max universe name length** (`[REQUIRES INPUT]`, classification-ui section 14 question 1) is not applied here: no name bound is enforced client-side by this layer; the API is the authority and its refusal arrives as a `validation_error` envelope.
- **Neighbouring stories.** The universe and classification routers this client calls are built by CAP-002-E1-S6 and CAP-002-E3-S5 (soft: contract only). The first importers of this module are CAP-002-E4-S2 (`research-query.ts`) and CAP-002-E1-S7 (create dialog), both reverse edges already in the graph.
- **Shell test counts, `DESTINATIONS`, routes** belong to CAP-002-E4-S10 (DEC-0084, DEC-0086). Do not touch `shell.tsx`, `routes.tsx` or the four shell tests in this story.
- **`ScreenState`** is not used by the fetch layer; screens build it from a resolved value or a caught error (classification-ui section 2.4).
- **No class of user-visible text** is written here; `copy.ts` and `format.ts` are later stories. Operation identifiers are code, not display labels.
- **Risk.** The `fetch` swap in T010 is the one non-obvious mechanism. If `requestJson` is ever changed to await before calling `fetch`, T007's concurrency and restoration tests fail first. Keep the swap in a single named function with a comment citing Open Gap 2.
- **Story status.** The skill's step to set the story frontmatter to `planning` is not performed: this run may not edit stories (the owner's instruction), and an edit would invalidate the story's approval revision.
