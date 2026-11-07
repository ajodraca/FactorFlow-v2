---
artifact_schema_version: 1
artifact_id: CAP-003-E7-S8-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T07:20:39Z
  source_artifacts:
    - id: CAP-003-E7-S8
      version: "1"
    - id: CAP-003-E7
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-owner-web-app-tests
      version: "1"
    - id: CAP-003-E3-S4-tasks
      version: "1"
    - id: CAP-003-E6-S7-tasks
      version: "1"
    - id: DEC-0224
      version: "open"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E7-S8 — Migrate the Three SHELL_ROUTES Targets in CAP-002's research/copy.ts

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/taking-over-the-delivered-screens/stories/CAP-003-E7-S8.md`
**Component**: `FactorFlow-v2` (web interface; design `owner-web-app`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The three links CAP-002's Research screens make into the data side are one map, `SHELL_ROUTES` in `web/src/screens/research/copy.ts` (lines 41-45 as delivered). This story changes exactly its three targets and nothing else in the file (owner-web-app §2.1; DAC-E7-2):

| Key | Today | After |
|---|---|---|
| `download` | `` `/runs/${encodeURIComponent(runId)}` `` | `` `/data/downloads/${encodeURIComponent(runId)}` `` |
| `dataHealth` | `"/runs"` | `"/data"` |
| `followedStocks` | `"/instruments"` | `"/data/followed"` |

The `/data` target for *Open Data health* rests on **DEC-0224**, which follows epic DAC-E7-2 and departs from system design §4.1 and its open question 6 (`/data/downloads`). The story records the departure, and the system design is flagged for correction at its next revision (Resolved Conflict 1). The stage commit carries `Decision-Id: DEC-0224` (DAC-E7-S8-3; T010).

After the change every Research link lands directly on a route that `routes.tsx` registers, so none depends on the legacy redirects CAP-003-E3-S4 put in `legacy-redirects.tsx` (AC-18). The targets are routed by the hard dependencies: `/data/downloads/:runId` and `/data/followed` by CAP-003-E3-S4, and `/data` by CAP-003-E6-S7. The delivered tests that assert the old literal targets follow, and a new test follows each link through the shell's real route map (TC-COMP-224). No other non-test file changes (DAC-E7-S8-1; TC-COMP-223). CAP-002's routes and screens are otherwise untouched (AC-27).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-18 | The three Research link targets point at the new paths directly; none depends on the legacy redirects | T002, T003, T004, T005, T006, T007, T009 |
| AC-27 | The `SHELL_ROUTES` edit leaves every CAP-002 route and screen otherwise untouched | T008, T009, T010 |
| DAC-E7-2 | `SHELL_ROUTES` changes exactly three targets and nothing else in the file | T003, T007, T008 |
| DAC-E7-S8-1 | The only non-test file changed is `copy.ts`, and its diff is the three target strings | T008 |
| DAC-E7-S8-2 | Each of the three links, when followed, lands on the download detail, Data health at `/data` and Followed stocks, with no redirect in between | T002, T003 |
| DAC-E7-S8-3 | The task plan cites DEC-0224 for the `/data` target, so the commit carries its trailer | T010 (and this plan's Summary and Resolved Conflict 1) |

Mapped test cases (`tests/component/owner-web-app-tests.md`; `tests/coverage-matrix.md` lines 316 and 364-366, per-story count "3 of 3" at line 440):

- **TC-COMP-223** (AC-18, AC-27, DAC-E7-2, DAC-E7-S8-1): a diff inspection, T008.
- **TC-COMP-224** (AC-18, DAC-E7-S8-2): a component test, T002.
- **TC-COMP-225** (AC-27, DAC-E7-S8-3): a process check on this plan and the commit trailer, T010 (coverage-matrix note 6).

---

## Phase 1: Setup

**Purpose**: Confirm the prerequisites are in the working tree and record the baseline.

- [ ] T001 Preflight, from the project repo root (traces to AC-18; prerequisite for every later task).
  - **Hard edges present.**
    - CAP-003-E3-S4: `web/src/app/routes.tsx` exports `AppRoutes`, and it declares `path="/data/downloads/:runId"` and `path="/data/followed"`. `web/src/app/legacy-redirects.tsx` exists and declares the four legacy paths. `web/src/app/health.tsx` exports `HealthProvider`.
    - CAP-003-E6-S7: `routes.tsx` declares `path="/data"`, bound to `lazy(() => import("../screens/data-health"))`.
    - Check: `grep -nE 'path="/data(/followed|/downloads/:[A-Za-z]+)?"' web/src/app/routes.tsx` prints three lines, and `grep -c 'path="' web/src/app/legacy-redirects.tsx` prints `4`.
  - **CAP-002 present** (capability OQ-2; story *Sequencing*): `web/src/screens/research/copy.ts` exists, and `SHELL_ROUTES` still reads as in the Summary's *Today* column.
  - **Baseline.** Run `npm run test` and record the result in the cycle's RED evidence. Expect one known failure: `web/src/screens/research/copy.test.ts` case (f). It reads `routes.tsx` and expects `path="/runs/:runId"`, which CAP-003-E3-S4 moved to `legacy-redirects.tsx` (Open Gap 1). Any other failure is not this story's and is reported, not fixed here.
  - If a hard edge is missing, stop and report. Do not plan around it.

**Checkpoint**: The three target routes are registered, the legacy redirects live in their own module, and the baseline suite result is recorded.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the failing tests that pin the three new targets and prove each link lands without a redirect.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-224 (Research links land on their new targets with no redirect) in a new `web/src/screens/research/shell-links.test.tsx`, with a `// Implements TC-COMP-224` comment on the `describe` (traces to AC-18, DAC-E7-S8-2).
  - **Harness.** It follows CAP-003-E3-S4's `routes.test.tsx` harness, so the shell's real route map, `AppRoutes`, decides where each link lands.
    - **Real routes.** Import `AppRoutes` from `"../../app/routes"` and `HealthProvider` from `"../../app/health"` (CAP-003-E3-S2's module). Render `<HealthProvider><MemoryRouter initialEntries={[start]}><AppRoutes /><LocationProbe /></MemoryRouter></HealthProvider>`.
    - **`LocationProbe`.** It renders `useLocation().pathname + search` as `data-testid="location"` and `useNavigationType()` as `data-testid="nav-type"`.
    - **Stubbed data-side screens.** `vi.mock` six modules: `"../coverage"`, `"../instruments"`, `"../runs"`, `"../runs/detail"`, `"../settings"` and `"../data-health"`.
      - Each mock's default export renders `<p data-testid="stub-<key>">`, with keys `coverage`, `instruments`, `runs`, `runs/detail`, `settings` and `data-health`.
      - The `runs/detail` stub also renders `Object.values(useParams()).join(",")` as `data-param`. This does not pin CAP-003-E3-S4's parameter name.
      - The screens are stubbed because this epic's screen stories relabel them. This test is about where the links land, not about those screens.
      - `../data-health` is CAP-003-E6-S5's `web/src/screens/data-health/index.tsx`, which CAP-003-E6-S7 binds to `/data`.
    - **Real Research screens.** `../research` (`index.tsx`) and `../research/stocks` are not mocked. `AppRoutes` lazy-loads them.
    - **API mocks.** Mock the two API modules the way `research.test.tsx` (lines 31-50) and `stocks/stock-evidence.test.tsx` (lines 17-24) do, each with `importActual`.
      - `"../../api/classification-client"`: `listClassifications`, `getClassificationSummary`, `getStockEvidence`, `getStockHistory`, `listClassificationSets`, `listUniverses`, `createUniverse` and `addUniverseMembers` become `vi.fn()`.
      - `"../../api/client"`: `listAcquisitionRuns` and `fetchHealth` become `vi.fn()`.
      - `fetchHealth` resolves an independent literal `HealthResponse` with `most_recent_run: { run_id: "r1", state: "running", ended_at: null }`.
    - **Fixtures.** Use independent literals, built as the `never`, `summaryOf` and `download` helpers in `research.test.tsx` (lines 141-190) build them.
      - The never-populated list has `later` set to a `building` set.
      - One `running` download has `runId: "r1"` and `startedAt: "2026-10-15T22:30:00Z"`.
      - With these, the Research screen renders the latest-download line and *Open Data health*, as TC-COMP-185 in `research.test.tsx` (lines 293-314) asserts.
    - If a routed Research screen throws for a missing provider, wrap the tree in the provider CAP-003-E3-S4's or CAP-003-E3-S6's tests use for the same purpose. Make no other change.
  - **Cases.** Each case is a fresh render with `userEvent.setup()`.
    - (a) **The download link.**
      - Start at `/research`, then `findByRole("link", { name: "2026-10-15 17:30 CDT" })`. That is the literal `formatTimestamp` result for the fixture: CDT, America/Chicago (DEC-0083).
      - Click it. `location` reads exactly `/data/downloads/r1`, `nav-type` reads `PUSH`, `findByTestId("stub-runs/detail")` renders, and its `data-param` is `r1`.
    - (b) ***Open Data health*.**
      - Start at `/research`, then `findByRole("link", { name: "Open Data health" })`, a literal.
      - Click it. `location` reads exactly `/data`, `nav-type` reads `PUSH`, `findByTestId("stub-data-health")` renders, and `queryByTestId("stub-runs")` is null.
    - (c) **The refusal link.**
      - Start at `/research/stocks/XYZ`, with `getStockEvidence` rejecting `new ClassificationApiError("ignored envelope message", "req-1", { code: "instrument_not_found", operation: "get-stock-evidence", resource: "classification", symbols: ["XYZ"] })`. This is the delivered `apiError` shape (`stock-evidence.test.tsx` lines 107-114).
      - `findByRole("link", { name: "Followed stocks" })`, then click it.
      - `location` reads exactly `/data/followed`, `nav-type` reads `PUSH`, and `findByTestId("stub-instruments")` renders.
    - **In every case**, `queryByRole("heading", { name: "There's no page at this address." })` is null. That is CAP-003-E3-S4's not-found heading.
  - **Why `nav-type` proves "no redirect in between".** A legacy target lands through `legacy-redirects.tsx`'s `Navigate … replace`, so its final navigation type is `REPLACE`, and for `/runs` its final path is `/data/downloads`. A direct target ends on the clicked `PUSH`.
  - **Kills:**
    - **swap-case on `dataHealth`, `"/data"` → `"/data/downloads"`.** This is DEC-0224's rejected alternative. (b) lands on `stub-runs`, and `location` reads `/data/downloads`.
    - **Reverting a target to its legacy path** (hand-written mutants in Other Notes). Each of (a), (b) and (c) then ends with `nav-type` `REPLACE`. In (b) the path also becomes `/data/downloads` instead of `/data`.
    - **swap-case between `followedStocks` and `dataHealth` values.** The stub identities in (b) and (c) fail.

### Additional Unit Tests

- [ ] T003 [P] Rewrite case (f) of `web/src/screens/research/copy.test.ts` (lines 667-693, *"(f) points SHELL_ROUTES at routes the delivered router declares"*). This is CAP-002's test of the three targets, and it follows them (traces to AC-18, DAC-E7-2, DAC-E7-S8-2).
  - Keep the `it` title and the delivered `routes.tsx` reader. It collects every `path="…"` in `../../app/routes.tsx`, excludes `*`, and defines `resolves(target)` by the delivered regex.
  - Add a second reader for `../../app/legacy-redirects.tsx` with the same regex, giving `legacy`. Assert `legacy.length` is `4`, so the check below is not vacuous.
  - Replace the old expectations with independent literals:
    - `copy.SHELL_ROUTES.download("8d9a3c1e-0000-4000-8000-000000000001")` `toBe("/data/downloads/8d9a3c1e-0000-4000-8000-000000000001")`.
    - `copy.SHELL_ROUTES.download("a/b c")` `toBe("/data/downloads/a%2Fb%20c")`. The encoding is unchanged (P4), and this literal is what tells it apart from a mutant that drops `encodeURIComponent`. The delivered UUID is identical under both.
    - `copy.SHELL_ROUTES.dataHealth` `toBe("/data")`.
    - `copy.SHELL_ROUTES.followedStocks` `toBe("/data/followed")`.
    - `Object.keys(copy.SHELL_ROUTES)` `toEqual(["download", "dataHealth", "followedStocks"])`. The keys are unchanged (AC-27).
  - For each of the three targets (download with `"r1"`), assert two things:
    - `resolves(target)` is `true` against `routes.tsx`.
    - The target matches none of `legacy` under the same regex. This is "none depends on the legacy redirects" (AC-18).
  - Delete `expect(declared).toContain("/runs/:runId")`. That route is no longer in `routes.tsx` (Open Gap 1). Do not replace it with a pinned parameter name.
  - Add the comment `// CAP-003-E7-S8: targets migrated (DAC-E7-2; DEC-0224 for /data)` above the case.
  - **Kills:**
    - Each reverted target: the literal `toBe`, and the legacy check.
    - swap-case `"/data"` → `"/data/downloads"`: the literal `toBe`.
    - The dropped-`encodeURIComponent` mutant: the `"a/b c"` literal.
- [ ] T004 [P] Make the literal target assertions in CAP-002's Research tests follow the new paths (traces to AC-18). Change only the expected string on each line; every other line stays as delivered.

  | File | Line | Old expected | New expected |
  |---|---|---|---|
  | `web/src/screens/research/results-pane.test.tsx` | 536 | `"/runs/r1"` | `"/data/downloads/r1"` |
  | `web/src/screens/research/results-pane.test.tsx` | 669 | `` `/runs/${download.runId}` `` | `` `/data/downloads/${download.runId}` `` |
  | `web/src/screens/research/set-history-dialog.test.tsx` | 149 | `` `/runs/${set.runId}` `` | `` `/data/downloads/${set.runId}` `` |
  | `web/src/screens/research/research.test.tsx` | 310 | `"/runs/r1"` | `"/data/downloads/r1"` |
  | `web/src/screens/research/research.test.tsx` | 313 | `"/runs"` | `"/data"` |
  | `web/src/screens/research/universes/create-dialog.test.tsx` | 188 | `"/instruments"` | `"/data/followed"` |
  | `web/src/screens/research/universes/detail/add-stocks-dialog.test.tsx` | 118 | `"/instruments"` | `"/data/followed"` |

  Assertions that compare with `SHELL_ROUTES.*` symbolically (`results-pane.test.tsx:539`, `stocks/factor-card.test.tsx:99`, `stocks/stock-evidence.test.tsx:199`) follow on their own and are not edited. The independent literals above, T002 and T003 carry the check (Other Notes, *Test strength*).
  - **Kills:** each reverted target, at the component that renders it. For example, a reverted `followedStocks` fails both dialog tests.
- [ ] T005 [P] In `web/src/components/patterns/as-of-line.test.tsx` line 112 (TC-COMP-179, CAP-002's as-of line test), change the expected `` `/runs/${RUN_ID}` `` to `` `/data/downloads/${RUN_ID}` ``. Change nothing else (traces to AC-18). This is the download's start time in the Research as-of line, the first row of owner-web-app §2.1's table.
  - **Kills:** a reverted `download` target.
  - This line sits above line 409, where CAP-003-E1-S10's appended cases begin. That story only appends, so the two edits do not overlap (Story Dependency Classification).
- [ ] T006 [P] Make CAP-002's two end-to-end assertions of the old targets follow (traces to AC-18; Open Gap 2):
  - `tests/e2e/research-after-download.spec.ts:116`: `` `/runs/${runId}` `` becomes `` `/data/downloads/${runId}` ``.
  - `tests/e2e/universe-by-hand.spec.ts:107`: `"/instruments"` becomes `"/data/followed"`.

  Change nothing else in either spec. Lines 60 and 87 of `research-after-download.spec.ts` (*Succeeded*) belong to CAP-003-E7-S5's relabel, not to this story (register correction from CAP-003-E7-S7). They are left alone.
  - **Verification.** `npx tsc --noEmit -p tsconfig.e2e.json` passes. `npm run test:e2e` is outside this story's validation (story *Validation*), so these two lines are not run here.
  - **Mutation:** not applicable. The spec is not executed in this story's validation.

**Checkpoint**: Against the delivered `copy.ts`, T002 (all three cases), T003, T004 and T005 fail. Each fails only on a target: `nav-type` reads `REPLACE`, or an `href` reads the legacy path. Every other test is in its T001 baseline state.

---

## Phase 3: Core Implementation

**Purpose**: The one production change.

- [ ] T007 In `web/src/screens/research/copy.ts`, change exactly the three `SHELL_ROUTES` values (depends on T002–T005 being RED; traces to AC-18, DAC-E7-2; DEC-0224 for `dataHealth`):
  - line 42: `` download: (runId: string): string => `/data/downloads/${encodeURIComponent(runId)}`, ``
  - line 43: `dataHealth: "/data",`
  - line 44: `followedStocks: "/data/followed",`

  Keys, `encodeURIComponent`, `as const`, the doc comment at lines 34-40 and every other line of the file stay byte for byte (Resolved Conflict 2).

  This makes T002–T005 pass.

**Checkpoint**: `npx vitest run src/screens/research src/components/patterns/as-of-line.test.tsx` is green. The vitest root is `web`.

---

## Phase 4: Integration

**Purpose**: Prove that the shell's route tests still hold and that the change set is exactly the story's.

- [ ] T008 Implement TC-COMP-223 (the `SHELL_ROUTES` change touches `copy.ts` only, three target strings) as a scripted inspection. Record its output in the cycle's evidence (depends on T007; traces to AC-27, DAC-E7-2, DAC-E7-S8-1). Run from the project repo root, before the stage commit.
  - **Non-test files.** `git diff HEAD --name-only | grep -vE '\.test\.tsx?$|\.spec\.ts$|^docs/'` prints exactly `web/src/screens/research/copy.ts`. `git status --short --untracked-files=all | grep '^??' | grep -vE '\.test\.tsx?$|^\?\? docs/'` prints nothing.
  - **The three strings.** `git diff -U0 HEAD -- web/src/screens/research/copy.ts | grep -E '^[-+][^-+]'` prints exactly these six lines and nothing else:
    ```text
    -  download: (runId: string): string => `/runs/${encodeURIComponent(runId)}`,
    -  dataHealth: "/runs",
    -  followedStocks: "/instruments",
    +  download: (runId: string): string => `/data/downloads/${encodeURIComponent(runId)}`,
    +  dataHealth: "/data",
    +  followedStocks: "/data/followed",
    ```
  - **CAP-002 routes and screens untouched (AC-27).** `git diff --exit-code HEAD -- web/src/app/ web/src/api/ web/src/main.tsx` exits 0. So does `git diff --exit-code HEAD -- $(git ls-files 'web/src/screens/research/*' | grep -vE '\.test\.tsx?$|/copy\.ts$')`.
  - **Test files changed.** `git diff HEAD --name-only` and the untracked list name only these tests:
    - T002's new `shell-links.test.tsx`;
    - the five research test files of T003 and T004;
    - `as-of-line.test.tsx`;
    - the two e2e specs.
  - **The shell's route tests hold unchanged.** `npx vitest run src/app/routes.test.tsx src/app/legacy-redirects.test.tsx src/app/titles.test.tsx` is green with no edit.
    - CAP-003-E3-S4's T009 (c) (TC-COMP-197) renders each `SHELL_ROUTES` target through its `renderAt` and expects no not-found state.
    - With this story the targets are `/data/downloads/run-1`, `/data` and `/data/followed`, routed by CAP-003-E3-S4 and CAP-003-E6-S7.
    - If that case fails, report it to the coordinator as a conflict with CAP-003-E3-S4's plan. Do not edit `web/src/app/`.

**Checkpoint**: The non-test diff is the three strings. Every CAP-002 route and screen file is unchanged, and the shell's route tests pass without edits.

---

## Phase 5: Polish

**Purpose**: Validation, the DEC-0224 trailer, and the TDD evidence.

- [ ] T009 Run the tech-stack v7 validation commands from the project repo root (traces to AC-18, AC-27):
  - `npm run format`, a check. If it reports anything, fix it with `npx biome format --write` on this story's changed files only.
  - `npm run lint`, `npx tsc --noEmit`, `npx tsc --noEmit -p tsconfig.e2e.json` (T006) and `npm run build`.
  - `npm run test`, which must be fully green. That includes `copy.test.ts` case (f), which T001's baseline recorded as red.
- [ ] T010 Implement TC-COMP-225 (the task plan cites DEC-0224 for the `/data` target) and carry the trailer (traces to AC-27, DAC-E7-S8-3).
  - **The plan.** This plan cites DEC-0224 as the decision the `/data` target rests on (Summary, T007, Resolved Conflict 1). `grep -c 'DEC-0224' <this file>` is at least 3.
  - **The commit.** The driver commits once per stage. In the hand-off, the coding agent tells the committer that the stage commit must carry `Decision-Id: DEC-0224`.
    - Get the trailer by running `scripts/sdd decisions trailer --project factorflow-v2 DEC-0224` from the harness root. It prints `Decision-Id: DEC-0224`.
    - The trailer must sit in the commit message's last paragraph, together with the `Co-Authored-By` line. A `Decision-Id` in an earlier paragraph is not read.
  - **After the commit.** `git log -1 --format='%(trailers:key=Decision-Id,valueonly)'` prints `DEC-0224`.
  - DEC-0224 is `status: open`, `owner_verdict: null`, `triage: accepted`, and its `blocks` names this story. The trailer is how the owner's later verdict finds this change. Planning neither approves nor closes the record.
- [ ] T011 After each TDD cycle in T001–T010 — not once at the end — do the following before the next cycle begins (INV-TDD-002, TEST-TDD-008; traces to no AC):
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against the staged diff.
  - Append the cycle to `CAP-003-E7-S8-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`;
    - `spec_drift.drift_detected`;
    - `tests_executed: true`;
    - its RED/GREEN evidence;
    - the structured `mutation:` block that `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change;
    - `diff_sha256`, the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`.
  - `scripts/check-tdd-evidence.py` must pass before hand-off.
  - Never include a `REJECTED` or `drift_detected: true` cycle in a commit.
  - This story runs under a driver that commits once per stage. Every cycle therefore records `commit_hash: stage`, and no per-cycle commit is made.
  - There is one cycle: T002–T007 (RED, then GREEN). It includes T008's inspection output and T009's validation. T010's trailer check runs after the stage commit and is reported in the hand-off.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, the commit carries `Decision-Id: DEC-0224`, and the one behaviour-changing cycle is recorded in the TDD evidence.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S4 | hard | `routes.tsx` (`AppRoutes`, `path="/data/downloads/:runId"`, `path="/data/followed"`), `legacy-redirects.tsx` (the four legacy paths T003 reads) and `health.tsx` via CAP-003-E3-S2. In the graph |
| CAP-003-E6-S7 | hard | `path="/data"` in `routes.tsx`, bound to `../screens/data-health`, which T002 stubs. In the graph |
| CAP-003-E3-S2 | context | `HealthProvider` (`web/src/app/health.tsx`) wraps T002's render, as in CAP-003-E3-S4's harness. Reached through the hard edge CAP-003-E3-S4 → CAP-003-E3-S2 |
| CAP-003-E3-S6 | context | Mounts `AppRoutes` in the shell's main region. Cited only as a provider precedent for T002's harness. Reached through CAP-003-E6-S7 → CAP-003-E3-S6 |
| CAP-003-E6-S5 | context | Creates `web/src/screens/data-health/index.tsx`, the module path T002 mocks. Reached through CAP-003-E6-S7 → CAP-003-E6-S5 |
| CAP-003-E1-S10 | soft | Also edits `web/src/components/patterns/as-of-line.test.tsx`, but only by appending after line 409. This story changes line 112 only. The edits are disjoint and either order works. Neither needs the other's code |
| CAP-003-E7-S5 | context | Owns `research-after-download.spec.ts:60,87` (*Succeeded* → *Complete*), which T006 leaves alone. It shares a file with this story but no line |
| CAP-003-E7-S7 | context | Updates the eleven CAP-001 e2e specs and `tests/e2e/support/acquisition.ts`. Its plan does not edit the two CAP-002 specs T006 touches (register correction 2026-11-07, CAP-003-E7-S7) |

No new hard edge was found. This story imports only `AppRoutes` (CAP-003-E3-S4), `HealthProvider` (CAP-003-E3-S2, through CAP-003-E3-S4) and delivered CAP-002 modules. The `/data` route comes from CAP-003-E6-S7. The graph line stays `CAP-003-E7-S8: [CAP-003-E3-S4, CAP-003-E6-S7]`. Cross-capability: CAP-002's `classification-ui` has merged in this clone (owner-fixed order, capability OQ-2), and it is not a CAP-003 edge.

### Task Dependencies

- T001 runs first.
- T002, T003, T004, T005 and T006 touch different files and can run in parallel after T001.
- T007 depends on T002–T005 being RED.
- T008 depends on T007.
- T009 depends on T008.
- T010 follows T009. Its commit check runs after the stage commit.
- T011 is interleaved: it closes the single cycle before hand-off.

### Parallel Opportunities

- Phase 2: T002–T006, five different files or file groups.

---

## Validation Plan

### Constitution-Defined Commands

From tech-stack v7 **Validation Commands**, run from the project repo root:

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (a check, no modification)
- Type check: `npx tsc --noEmit`, plus `npx tsc --noEmit -p tsconfig.e2e.json` for T006's specs

`npm run test:e2e` is not in this story's validation (story *Validation*).

### Story-Specific Validation

- **AC-18, DAC-E7-S8-2:** T002 is green, with `nav-type` `PUSH` and the exact target path in each case. T003's legacy check is green.
- **AC-18, by hand:** run `npm run build` and serve the app from the API. On `/research` in the never-populated state, follow *Open Data health*. The address bar reads `/data` and the Data health screen renders, and Back returns to `/research`.
- **DAC-E7-2, DAC-E7-S8-1:** T008's six-line diff, and the single non-test file.
- **AC-27:** T008's `git diff --exit-code` over `web/src/app/` and the non-test Research files. `routes.test.tsx` is green unchanged.
- **DAC-E7-S8-3:** T010. This plan cites DEC-0224, and the commit carries the trailer.
- **Mutation:**
  - Generate: `python3 scripts/mutation-run.py generate --repo-dir . --against HEAD --cycle 1 --path web/src/screens/research/copy.ts --out "$TMPDIR/e7s8-mutants.json"`.
  - Append the hand-written mutants in Other Notes to the mutant file.
  - Run: `python3 scripts/mutation-run.py run --repo-dir . --mutants "$TMPDIR/e7s8-mutants.json" --command "npx vitest run src/screens/research src/components/patterns/as-of-line.test.tsx" --out "$TMPDIR/e7s8-results.json"`.
  - Then run `summary` for the evidence. It must leave no surviving non-equivalent mutant.

---

## Notes

### Resolved Conflicts

1. **The `dataHealth` target: `/data` or `/data/downloads`.**
   - **The conflict.** System design §4.1 (*Existing components this design changes*) and its open question 6 send `/runs` to `/data/downloads`. Epic DAC-E7-2 and owner-web-app §2.1 (the `SHELL_ROUTES` table) send it to `/data`.
   - **Governing: epic DAC-E7-2 over design prose.** This is recorded as **DEC-0224**: a contradiction, decided by agent, second opinion agreed, triage accepted, owner verdict pending.
   - **Why.** The link is named *Open Data health*, and Data health is served at `/data` (system design §4.2 *Screen registration*). `/data/downloads` would land the owner on Downloads.
   - **Outcome.** T007 writes `"/data"`. The system design is not edited. §4.1 and OQ-6 are flagged for correction at its next revision.
2. **`copy.ts`'s doc comment for `SHELL_ROUTES` (lines 34-40) names the old routes.**
   - **The conflict.** After this story the comment describes the CAP-001 routes and the future migration as if neither had happened. Epic DAC-E7-2 ("nothing else in the file") and DAC-E7-S8-1 ("its diff is the three target strings") forbid touching it. A comment is the lowest rung of the precedence ladder.
   - **Governing: DAC-E7-2 and DAC-E7-S8-1.**
   - **Outcome.** The comment stays byte for byte, and T008's six-line diff check enforces it. Flagged for owner-web-app §2.1 at its next revision: a later change outside this story's AC may refresh the comment.
3. **The story's file list against the tests that must follow.**
   - **The conflict.** The story's *Implementation* names `copy.ts` and "CAP-002's tests under `web/src/screens/research/`". Two other CAP-002 test files also assert the old literal targets: `web/src/components/patterns/as-of-line.test.tsx:112` and the e2e specs in T006 (register G15).
   - **Governing: DAC-E7-S8-1** ("the only non-test file changed is `copy.ts`"), which limits non-test files only, together with AC-18 ("none breaks").
   - **Outcome.** T005 and T006 change one expected string each. No non-test file beyond `copy.ts` changes.
4. **Download detail parameter name.** The story and TC-COMP-223 write `/data/downloads/:id`. CAP-003-E3-S4 registers `/data/downloads/:runId` (its Resolved Conflict 1, governed by epic DAC-E3-3). The URL is the same, and the target string `/data/downloads/{runId}` carries no parameter name. T002 reads `useParams()` by value and T003 asserts no parameter name, so neither pins it.

### Open Gaps

1. **`copy.test.ts` case (f) goes red at CAP-003-E3-S4 and stays red until this story.**
   - **What is undetermined.** Case (f) reads `routes.tsx` and expects `path="/runs/:runId"`, and it resolves the old targets against `routes.tsx` only. CAP-003-E3-S4 moves the four legacy paths into `legacy-redirects.tsx`. Its plan forbids any diff under `web/src/screens/` (its T015), and its T014 (b) treats failures other than lazy loading as its own defects.
   - **Why it is a gap.** No artifact says who keeps (f) green in the window between CAP-003-E3-S4 and this story. Owner-web-app §2.6 (*Delivered tests that change*) does not list CAP-002's Research tests at all.
   - **What this plan does.** T003 rewrites (f) to the migrated targets, and it adds a legacy-module check that makes AC-18 observable. T001 records the red baseline.
   - **Owning design to absorb it:** owner-web-app §2.6, which should list the CAP-002 tests that assert `SHELL_ROUTES`, and owner-shell §2.10 for the interim. This is not a value decision: nothing is adopted beyond following the targets.
   - **Coordinator note.** The coordinator should raise the red window with CAP-003-E3-S4's coder.
2. **CAP-002's e2e assertions of the old targets are in no design's test list.**
   - **What is undetermined.** Owner-web-app §2.6 lists the eleven CAP-001 specs and `acquisition.ts`. It does not list `research-after-download.spec.ts:116` or `universe-by-hand.spec.ts:107`, which assert `SHELL_ROUTES` hrefs and break when this story lands.
   - **What this plan does (T006).** It changes the two expected strings, under DAC-E7-S8-1 and AC-18 (Resolved Conflict 3). They are type-checked, not run.
   - **Owning design to absorb it:** owner-web-app §2.6 at its next revision.

No PROVISIONAL decision: every value this plan uses is fixed by DAC-E7-2, owner-web-app §2.1, DEC-0224 or a delivered file.

### Other Notes

- **Test strength.**
  - Three delivered assertions compare an `href` with `SHELL_ROUTES.*` itself (`results-pane.test.tsx:539`, `factor-card.test.tsx:99`, `stock-evidence.test.tsx:199`). That is a symmetric comparison, which a target mutant cannot fail. They are CAP-002's and are left as delivered.
  - The independent checks are T002's literal paths, T003's literals, and T004's and T005's literal `href`s.
  - The `encodeURIComponent` mutant is equivalent under a UUID. T003's `"a/b c"` literal is the observation that tells it apart.
- **Plan checks.**
  - T008's diff check reads only `copy.ts`'s changed lines. The legacy-path wording in `copy.ts`'s retained doc comment (`/runs/:runId`) therefore does not trip it.
  - T003's legacy check reads `legacy-redirects.tsx`, not `copy.ts`.
  - No plan check scans for the strings `/runs` or `/instruments` across `web/src/screens/research/`. Delivered imports such as `../../instruments/parse-bulk-symbols` and the retained comment would match such a scan.
- **What is not changed.**
  - `web/src/app/routes.test.tsx` (owner-shell's; TC-COMP-197 inside CAP-003-E3-S4's T009 (c)) keeps passing unchanged. Its comment "until CAP-003-E7-S8 migrates them" becomes historical.
  - No consumer of `SHELL_ROUTES` changes: `results-pane.tsx`, `set-history-dialog.tsx`, `stocks/index.tsx`, `stocks/factor-card.tsx`, `universes/create-dialog.tsx`, `universes/detail/add-stocks-dialog.tsx` and `components/patterns/as-of-line.tsx`.
- **T002's download link.** T002 follows the never-populated body's latest-download link. Like the as-of line's link, it is built by `SHELL_ROUTES.download`, so the routing it proves is the same, and its fixture is the smaller one. The as-of line's own `href` is pinned by T005.
- **Hand-written mutants** for the mutation run:
  - `web/src/screens/research/copy.ts`: `` `/data/downloads/${encodeURIComponent(runId)}` `` → `` `/runs/${encodeURIComponent(runId)}` ``, killed by T002 (a), T003, T004 and T005.
  - `web/src/screens/research/copy.ts`: `` `/data/downloads/${encodeURIComponent(runId)}` `` → `` `/data/downloads/${runId}` ``, killed by T003's `"a/b c"` literal.
  - `web/src/screens/research/copy.ts`: `dataHealth: "/data",` → `dataHealth: "/data/downloads",`, killed by T002 (b) and T003.
  - `web/src/screens/research/copy.ts`: `dataHealth: "/data",` → `dataHealth: "/runs",`, killed by T002 (b) (`REPLACE`, `/data/downloads`), T003 and T004 (`research.test.tsx:313`).
  - `web/src/screens/research/copy.ts`: `followedStocks: "/data/followed",` → `followedStocks: "/instruments",`, killed by T002 (c) (`REPLACE`), T003 and T004 (the two dialog tests).
- **Sequencing fact.** The story says "this clone does not yet hold `web/src/screens/research/`". It is stale: CAP-002 has merged (register G16). The precondition is met, and T001 confirms it.
