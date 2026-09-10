---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-09
updated: 2026-09-09
story_id: "CAP-001-E1-S5"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S5.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-09T20:31:00Z"
reviewed_head: "163fb185118419c633a7e43cf0c9896a7f287f7f"
review_base: "fdacc94cff55aea93d44f43bde6dbbf8448d1068"
reviewed_state_revision: "sha256:2c34c92ee926d4a95620630437d3311ea947cca431b090002e6d4e5f075601c1"
verdict: PASS
review_subjects:
  - artifact_id: CAP-001-E1-S5
    artifact_version: 1
    content_revision: sha256:e80a67eeb7f3fb6d96a7e90f9a8a136f4b2b1fae89c8270d0529e6dd2d52b42e
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-09T20:31:00Z
  source_artifacts:
    - id: CAP-001-E1-S5
      version: "1"
    - id: CAP-001-E1-S5-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S5 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 22/22 verified |
| Required validation | 3/3 passed |

Every acceptance criterion traces to concrete production code and to at least one
test whose assertions would fail if the behaviour regressed. All twelve mandatory
component TC-IDs mapped to this story are implemented against the component test
specification. The three constitution-defined validation commands
(`npm run test`, `npm run lint`, `npx tsc --noEmit`) were rerun independently and
all exited 0; the full Python suite was also rerun (145 passed) to confirm this
change set does not disturb the backend.

Two areas received extra adversarial scrutiny and both survived it. First, the
designed unreachable copy was compared character-for-character against
`design/ux-design.md:621-623` rather than trusted from the task plan, and it
matches verbatim. Second, the cross-suite ordering effect described at review
launch — that running the frontend suite makes
`tests/integration/test_api_static_mount.py::test_no_bundle_yet_falls_back_to_a_bare_404`
fail — was reproduced, isolated to its true cause, and determined **not** to be a
defect in this change set. It is a pre-existing coupling introduced by
CAP-001-E1-S4, detailed under Independent Validation below.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S5.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S5-tasks.md` |
| Component | `FactorFlow-v2` (single-repo project) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S5` |
| HEAD | `163fb185118419c633a7e43cf0c9896a7f287f7f` |
| Review base | `main` @ `fdacc94cff55aea93d44f43bde6dbbf8448d1068` |
| Working tree | Clean — no staged, unstaged, or untracked non-ignored files, before and after validation |
| Changed files reviewed | 17 |

The change set is one commit (`163fb18`) ahead of `main`. `git status --porcelain=v1`
was empty at review start and again after all validation, so the committed diff is
the complete review set.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/app/status-region.tsx` | modified | T014, T015, T016, T017; AC-18, DAC-E1-13/14/17, DAC-E1-S5-1/2/4/5/6 |
| `web/src/app/shell.tsx` | modified | T018; AC-16, DAC-E1-15 |
| `web/src/api/types.ts` | added | T002 |
| `web/src/api/client.ts` | added | T003 |
| `web/src/app/status-region.test.tsx` | added | T005–T010 |
| `web/src/app/shell.status-region.test.tsx` | added | T011 |
| `web/src/app/shell.unreachable.test.tsx` | added | T012 |
| `web/src/app/status-region.a11y.test.tsx` | added | T013 |
| `web/src/app/status-region.integration.test.tsx` | added | T020 |
| `web/src/test-setup.ts` | modified | Supports T005–T013; see Scope and Plan Deviations |
| `tailwind.config.js` | modified | T014 token consumption (STD-UI-29); see Scope and Plan Deviations |
| `web/src/app/routes.test.tsx` | modified | T019 — `act()` settling for the poll this story introduces |
| `web/src/app/shell.test.tsx` | modified | T019 — same |
| `web/src/app/shell.a11y.test.tsx` | modified | T019 — same |
| `web/src/app/shell.layout.test.tsx` | modified | T019 — same |
| `docs/.../CAP-001-E1-S5-tasks.md` | modified | Task-state bookkeeping only (checkbox flips) |
| `docs/.../CAP-001-E1-S5.md` | modified | Frontmatter `status: planning` → `in-review` only |

No file in the change set lacks a story or task justification. The two doc files
carry no content edits beyond checkbox and status bookkeeping, verified by reading
the full `git diff main...HEAD -- docs/`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-18 | SATISFIED | `status-region.tsx:295-343` `StatusRegion`; mounted in the rail at `shell.tsx:63`, outside the routed region | `shell.status-region.test.tsx` "renders the region inside the rail on the initial route"; "keeps the region rendered while the owner navigates all four destinations" | The region lives in the rail, so it is present on every screen without inspecting the store. The navigation test clicks through all four destinations and re-asserts `data-liveness="answering"` each time. |
| AC-16 | SATISFIED | `shell.tsx:31-34` `MainRegion` substitutes `UnreachableState` when `liveness === "unreachable"`; copy at `status-region.tsx:42-43` | `shell.unreachable.test.tsx` — parameterised over `/coverage`, `/instruments`, `/runs`, `/runs/run-123`, `/settings` | Copy matches `design/ux-design.md:621-623` verbatim. Test asserts the state appears inside `role="main"` on all five routes. |
| DAC-E1-13 | SATISFIED | `status-region.tsx:141-144` immediate `poll()` then `setInterval(..., 30_000)`; `HEALTH_POLL_INTERVAL_MS = 30_000` at line 28; last-updated at lines 340-342 | `status-region.test.tsx` "polls again every 30 seconds while mounted"; "does not poll faster than the 30-second cadence the design records" | Cadence is asserted in both directions: a second and third call after two 30s advances, and *no* second call after 29s. The negative half is what makes this regression-sensitive. |
| DAC-E1-14 | SATISFIED | `status-region.tsx:326-332` reserved third line `data-testid="status-line-reserved"`, `aria-hidden="true"`, `h-4` | `status-region.test.tsx` "reserves a third line in the region's layout without restructuring" | Asserts exactly three `status-line-*` elements, that the reserved one is empty, and that it is hidden from assistive technology — a structural claim, not a cosmetic one. |
| DAC-E1-15 | SATISFIED | `status-region.tsx:123-137` catch branch sets `liveness: "unreachable"` and discards the error text; `UnreachableState` at lines 250-259 | `status-region.test.tsx` "reports 'Not answering' …"; `status-region.integration.test.tsx` "a transport failure renders the designed unreachable state in the main region" | The integration test throws a real `TypeError("Failed to fetch")` through the real `fetchHealth()` and asserts the rendered text does **not** match `/TypeError\|Failed to fetch/`, proving the transport error is not leaked. |
| DAC-E1-17 | SATISFIED | `status-region.tsx:270-287` `RunOutcomeLine`, null branch first | `status-region.test.tsx` "renders 'No run recorded' when most_recent_run is null"; "does not present the null run as a success or a failure" | The second test asserts the text does not match `/succeeded\|completed\|failed\|partial\|ok\b/i`, which is the "false failure / empty success" prohibition stated as an assertion rather than as prose. |
| DAC-E1-S5-1 | SATISFIED | `status-region.tsx:183-242` three distinct SVG shapes + `LIVENESS_LABEL` text | `status-region.a11y.test.tsx` "the answering and not-answering icons are different shapes, not one shape in two colours" | This test compares the two icons' `innerHTML` across renders and asserts inequality. That is a genuine greyscale check: recolouring one shape would fail it. |
| DAC-E1-S5-2 | SATISFIED | `status-region.tsx:71-91` `formatTimestamp` via `Intl.formatToParts`, `DISPLAY_TIME_ZONE = "America/Chicago"` | `status-region.test.tsx` "renders the last-updated time in ISO-8601, America/Chicago, with its zone visible" | With system time pinned to `2026-09-06T18:30:00Z`, asserts exactly `2026-09-06 13:30:00 America/Chicago` and negatively asserts absence of `/18:30\|UTC\|\bZ\b\|\d{1,2}\/\d{1,2}\/\d{4}/`. Satisfies STD-UI-5's visible-zone and no-locale-format rules. |
| DAC-E1-S5-3 | SATISFIED | `status-region.tsx:42-43` `UNREACHABLE_MESSAGE` | `status-region.test.tsx` "names the likely cause and where to look, not the transport failure" | Asserts all three required elements (container stopped, migration failed, container logs) and negatively asserts `/ECONNREFUSED\|TypeError\|Failed to fetch\|127\.0\.0\.1/i`. |
| DAC-E1-S5-4 | SATISFIED | `status-region.tsx:271-277` null branch with `data-outcome="none"` | `status-region.test.tsx` "does not present the null run as a success or a failure" | See DAC-E1-17. |
| DAC-E1-S5-5 | SATISFIED | `status-region.tsx:146-149` cleanup clears the interval and flips `mountedRef` | `status-region.test.tsx` "issues no further fetch after unmount, however far timers advance" | Advances fake timers by 300s after unmount and asserts the call count is unchanged. A companion test asserts two re-renders still produce exactly one additional fetch, covering T016's double-interval concern. |
| DAC-E1-S5-6 | SATISFIED | `status-region.tsx:302` `credentialAbsent` requires `liveness === "answering"` **and** `credential_present === false`; rendered at lines 334-338 | `status-region.test.tsx` three tests: credential absent, credential present, and API-did-not-answer | The third test is the important one: it asserts no credential state renders when the fetch rejected, so a missing credential is never inferred from a failed request. |

All twelve acceptance criteria are SATISFIED.

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `shell.tsx` and `status-region.tsx` both exist on `main` (`git log main -1 -- web/src/app/shell.tsx`) | Blocking check; CAP-001-E1-S4 had landed, so no shell was duplicated. |
| T002 | complete | VERIFIED | `web/src/api/types.ts:34-40` `HealthResponse` | Field-for-field match with the story's Technical Details contract. `RunSummary = null` is deliberately narrow so CAP-001-E7-S3's widening is a visible change. |
| T003 | complete | VERIFIED | `web/src/api/client.ts:36-53` `fetchHealth` | Throws `ApiUnreachableError` on transport failure, non-OK status, and non-JSON body; returns normally for `database: "unreachable"`. This is exactly the separation the task required. |
| T004 | complete | VERIFIED | `vi.useFakeTimers({ shouldAdvanceTime: true })` used at `status-region.test.tsx:31`; no dependency added to `package.json` | Confirmed `package.json` is unchanged in the diff. |
| T005 | complete | VERIFIED | `status-region.test.tsx:43-91` | TC-COMP-304, TC-COMP-018. |
| T006 | complete | VERIFIED | `status-region.test.tsx:99-148`, including a test literally named `test_unreachable_state` as the task specified | TC-COMP-016, TC-COMP-306. |
| T007 | complete | VERIFIED | `status-region.test.tsx:153-169` | TC-COMP-335. |
| T008 | complete | VERIFIED | `status-region.test.tsx:174-203` | TC-COMP-305, TC-COMP-336. |
| T009 | complete | VERIFIED | `status-region.test.tsx:208-228` | TC-COMP-308, TC-COMP-338. |
| T010 | complete | VERIFIED | `status-region.test.tsx:232-265` | TC-COMP-339. |
| T011 | complete | VERIFIED | `web/src/app/shell.status-region.test.tsx` | Additional unit test, at the planned path. |
| T012 | complete | VERIFIED | `web/src/app/shell.unreachable.test.tsx:46-65` | Asserts the rail keeps all four links while the unreachable state shows. |
| T013 | complete | VERIFIED | `web/src/app/status-region.a11y.test.tsx` | Additional unit test, at the planned path. |
| T014 | complete | VERIFIED | `status-region.tsx:102-153`, `183-242`, `295-343` | All four sub-requirements present: immediate + interval poll, text-plus-icon, ISO-8601 Chicago timestamp, reserved third line. |
| T015 | complete | VERIFIED | `status-region.tsx:270-287` | `data-outcome` is the documented extension seam for CAP-001-E7-S3; the null branch is not disturbed by the populated branch. |
| T016 | complete | VERIFIED | `status-region.tsx:146-149` cleanup; effect dependency list is `[enabled]` only | Verified independently by the "creates only one interval across re-renders" test, which passes. |
| T017 | complete | VERIFIED | `status-region.tsx:302`, `334-338` | The `liveness === "answering"` conjunct is what makes this correct rather than merely present. |
| T018 | complete | VERIFIED | `shell.tsx:31-34`, `51-70` | Substitutes rather than accompanies; `HealthProvider` wraps the shell so one interval serves both consumers. |
| T019 | complete | VERIFIED | Copy verified verbatim against `design/ux-design.md:621-623`; four pre-existing test files updated for `act()` settling | The rendered copy and the design text are identical. |
| T020 | complete | VERIFIED | `web/src/app/status-region.integration.test.tsx` | Task allowed manual verification; the implementer instead added a four-case test driving the real `fetchHealth()` with only `fetch` stubbed. Stronger than required. |
| T021 | complete | VERIFIED | Non-colour cue confirmed for all four states: answering/unreachable/unknown carry distinct SVG shapes plus text; credential-absent and no-run-recorded are prose | Corroborated by `status-region.a11y.test.tsx`'s six assertions rather than accepted as a claim. |
| T022 | complete | VERIFIED | All three commands rerun independently — see Independent Validation | Exit 0 for each. |

All 22 tasks are VERIFIED. No task is PARTIAL, NOT IMPLEMENTED, or NOT APPLICABLE.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `status-region.test.tsx` liveness/polling / TC-COMP-304, TC-COMP-018 | ADEQUATE | Mount-time fetch, answering render, second and third call at 30s boundaries, and no call at 29s. The 29s negative assertion is what makes a cadence regression fail. | None |
| `test_unreachable_state` + siblings / TC-COMP-016, TC-COMP-306, TC-COMP-337 | ADEQUATE | Exact designed copy; positive assertions on all three required content elements; negative assertion excluding raw transport text. Also asserts a successful `database: "unreachable"` response does **not** produce the unreachable liveness — the conflation the task plan warned about. | None |
| greyscale readability / TC-COMP-335 | ADEQUATE | Text label plus `<svg>` cue; separately, the answering and unreachable icons' `innerHTML` are compared and must differ. Recolouring a single shape fails this. | None |
| timestamp + reserved line / TC-COMP-305, TC-COMP-336 | ADEQUATE | System time pinned; asserts the exact Chicago-converted string and negatively excludes UTC, `Z`, and locale formats. Reserved line asserted as exactly-three-lines, empty, `aria-hidden`. | None |
| run outcome / TC-COMP-308, TC-COMP-338 | ADEQUATE | "No run recorded" plus a negative assertion against success/failure vocabulary and a `data-outcome="none"` attribute check. | None |
| unmount clears interval / TC-COMP-339 | ADEQUATE | Advances 300s post-unmount with call-count equality; companion test proves re-renders do not multiply intervals. | None |
| credential distinction / TC-COMP-340 | ADEQUATE | Three-way: absent, present, and not-answered. The not-answered case guards against inferring credential state from a failed request. | None |
| `shell.status-region.test.tsx` (T011) | ADEQUATE | Region containment in the rail; persistence across all four destinations via real `userEvent` clicks; and a remount check asserting the call count stays 1 across navigation, proving the poll cadence is not reset by routing. | None |
| `shell.unreachable.test.tsx` (T012) | ADEQUATE | Five routes parameterised; rail link count and labels asserted; explicitly asserts the routed content is *replaced* not accompanied (`queryByText("Coverage")` is null); and a recovery test proving the routed screen returns once health answers. | None |
| `status-region.a11y.test.tsx` (T013) | ADEQUATE | Six assertions across every rendered state plus `aria-live="polite"` and accessible-name checks. | None |
| `status-region.integration.test.tsx` (T020) | ADEQUATE | Drives `fetch` → `client.ts` → `useHealthPolling` → render for four response shapes including a 502, asserting `502`/`gateway down` never surface. This is the only test that would catch a `client.ts` mapping bug, since every other test stubs `fetchHealth` itself. | None |

**Mock validity.** Tests stub at two levels deliberately: `vi.mock("../api/client")` for
render-behaviour tests, and `vi.stubGlobal("fetch", …)` for the integration test.
The mocks do not bypass the unit under test — the polling hook, the state machine,
and the rendering all execute for real in every case. No test asserts only on mock
setup.

**Determinism and isolation.** Fake timers are scoped per file with `afterEach(() =>
vi.useRealTimers())`; system time is pinned where a timestamp is asserted; the shared
`beforeEach` in `test-setup.ts` stubs `fetch` and `afterEach` unstubs it. No network,
no filesystem, no ordering dependence within the frontend suite. I ran the frontend
suite twice with identical results.

**Regression sensitivity spot-check.** I independently probed the one behaviour no
test covers directly — React `StrictMode`'s mount→unmount→remount cycle, which the
`mountedRef` pattern can mishandle by leaving `mountedRef.current === false` after the
first cleanup. `main.tsx:13-17` wraps the app in `StrictMode`, so this is a real
production path. I wrote a temporary probe test rendering `<StrictMode><StatusRegion /></StrictMode>`
and asserting the answering state still resolves; it passed, because line 114
(`mountedRef.current = true`) re-arms the ref on each effect run. The probe file was
deleted immediately after the run and the working tree re-verified clean. No finding.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | `/Users/alvarodejodra/Projects/ai-agents` | 0 | PASS | All eight checks passed. |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story <story> --stage adversarial-review` | `/Users/alvarodejodra/Projects/ai-agents` | 0 | PASS | `READY — story is ready for independent review`. |
| `npm run test` (`vitest run`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | **11 test files, 56 tests, all passed**, 1.80s. Includes all 12 mandatory TC-IDs. |
| `npm run lint` (`biome lint .`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Checked 23 files in 20ms. No fixes applied.` |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output, no diagnostics. |
| `.venv/bin/python -m pytest tests/ -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | **145 passed.** Run with the frontend build output absent — see the ordering analysis below. |

Suite order used for the headline results: **Python suite first (clean static
directory), frontend suite second.** Both suites pass fully in that order.

### The cross-suite ordering effect — analysed, and not a defect in this change set

The review brief asked me to determine independently whether the following is a
defect here: after running the frontend suite, the Python test
`tests/integration/test_api_static_mount.py::test_no_bundle_yet_falls_back_to_a_bare_404`
fails. I reproduced it and then isolated the mechanism.

**Reproduction.** With a bundle present in `src/factorflow/api/static/`, that test
fails with `assert 200 == 404`. After `rm -rf src/factorflow/api/static/{assets,index.html}`,
the same file passes 4/4. The failure depends solely on whether the gitignored bundle
exists on disk, because the test asserts the real *absence* of a bundle
(`test_api_static_mount.py:77-88`).

**Cause.** The build is not performed by `npm run test` itself. `package.json`'s test
script is plain `vitest run`, and `vitest.config.ts` declares no `globalSetup` and no
build step. The build is performed by a single test file,
`web/src/app/build-output.test.tsx:41`, which calls `viteBuild(...)` for real to prove
TC-COMP-334 / DAC-E1-S4-6.

**Attribution.** That file is **not part of this story's change set**.
`git diff --name-only main...HEAD -- web/src/app/build-output.test.tsx` returns
nothing, and `git log --oneline main -1 -- web/src/app/build-output.test.tsx` attributes
it to `9a82655 fix(shell): preserve static-dir gitkeep and add TC-COMP-334 build-output test`
(CAP-001-E1-S4). The failing Python test is likewise untouched here, introduced by
`f6cdb89` (CAP-001-E1-S6). This story's diff contains no change to `tests/`,
`src/factorflow/`, `vite.config.ts`, `vitest.config.ts`, or `package.json`.

**Conclusion.** This is a pre-existing coupling between two earlier stories: S4's
build-output test writes a real bundle into the directory whose emptiness S6's test
asserts. It reproduces on `main` by construction, since both files and the mechanism
predate this branch. It is therefore **not a finding against CAP-001-E1-S5**, and I
have not raised it as one. It is worth a separate expedited change against the S4/S6
boundary — the natural fix being for S4's build test to build into a temporary
`outDir` rather than the real static directory, or for S6's test to pin `_STATIC_DIR`
at a controlled empty directory the way its own sibling fixtures already do — but that
work is outside this story's scope and this gate's authority.

### Validation Side Effects

- **Before**: `git status --porcelain=v1` empty. `src/factorflow/api/static/` held
  `.gitkeep`, `index.html`, and `assets/` — gitignored build output left from the
  implementer's own run (`.gitignore:18-19`).
- **After**: `git status --porcelain=v1` empty. `HEAD` unchanged at `163fb18`.
  `src/factorflow/api/static/` holds only the tracked `.gitkeep`.
- **Unexpected tracked-file changes**: none. No tracked file was created, modified, or
  deleted by any validation command.
- **Deliberate untracked-file changes by the reviewer**: I removed the gitignored build
  output (`assets/`, `index.html`) to isolate the ordering effect above, and I created
  and then deleted one temporary probe test (`web/src/app/zz-reviewer-probe.test.tsx`)
  for the StrictMode check. Both are ignored/untracked artefacts, not tracked work, and
  the tracked `.gitkeep` was preserved throughout. Regenerating the bundle is a plain
  `npm run build`. No constraint-10 restoration of tracked files was required, because
  none was touched.

## Findings

No findings.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

Three changes go slightly beyond the literal task text. I examined each for scope
leakage and consider all three justified and proportionate; none rises to a finding.

- **`web/src/test-setup.ts` (modified).** Adds a default `fetch` stub for all tests.
  Not named in any task, but directly caused by this story: the shell now polls on
  mount, and jsdom supplies no resolving `fetch`, so without it every shell-rendering
  test would emit an unhandled rejection and an `act(...)` warning. The stub is
  overridden by the specific mocks in every test that cares about health content, so it
  weakens no assertion. Supporting infrastructure for T005–T013, not new behaviour.
- **`tailwind.config.js` (modified).** Extends `height` with `--space-*` tokens and adds
  a `fontFamily` block including `--font-numeric`. Required for T014 to size the icons
  and the reserved third line from tokens rather than literals, which is STD-UI-29's
  explicit rule ("No spacing, size or colour literal appears outside the theme"). I
  verified every referenced token exists in `design-system/theme.css`
  (`--font-numeric` at line 196, `--space-1` at 218, and the rest of the scale).
  Additive only — no existing value changed.
- **Four pre-existing test files** (`routes.test.tsx`, `shell.test.tsx`,
  `shell.a11y.test.tsx`, `shell.layout.test.tsx`) gain an identical `settleHealthPoll()`
  helper and `await` it. I read the complete diff of all four specifically to check for
  weakened assertions: **no assertion was removed, relaxed, or changed.** The only edits
  are the added helper, `it(...)` callbacks becoming `async`, and one `await` per test.
  This is T019's necessary consequence of introducing a mount-time poll.

Task-plan bookkeeping is consistent: all 22 checkboxes are checked and all 22 are
independently VERIFIED, so there is no checked-but-unimplemented or
implemented-but-unchecked discrepancy.

The task plan's header records `**Branch**: usr/alvaro-de-jodra/CAP-001-epics`, while
the work was done on `usr/alvaro-de-jodra/CAP-001-E1-S5`. The actual branch is the one
conforming to `AGENTS.md`'s `usr/<name>/<capability-id>-<artifact-suffix>` convention;
the plan's header is a stale planning-time value. Noted for accuracy, not raised as a
finding, since the branch actually used is the correct one.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to Phase 6a doc sync for CAP-001-E1-S5 with this report
  as the passing gate evidence. Commit this report before doc sync, since the review
  artifact must be in version control for the stage to be recorded.
- **Warnings accepted downstream**: N/A — verdict is `PASS` with zero findings.
- **Separate, out-of-scope**: the S4/S6 static-bundle test coupling documented under
  Independent Validation warrants its own expedited change. It does not block this story.
