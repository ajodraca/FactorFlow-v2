---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S7-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E4-S7"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-11-01T01:24:34Z"
reviewed_head: "9deeeef0d15446bb2ab1ac4c54887924e3c27b9e"
review_base: "8ec2a736136dd3f743fb22ac1b7eac771e28d032"
reviewed_state_revision: "sha256:8771225876c37a60e1b30a88ca9ad94c5dc57cec845adfb9f55fdeeb1848cd05"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E4-S7
    artifact_version: 1
    content_revision: sha256:f03e846a8f59b235a15574c791de680002a3454b84b0e2cab67f807166e2d01a
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-01T01:24:34Z
  source_artifacts:
    - id: CAP-002-E4-S7
      version: "1 (sha256:f03e846a8f59b235a15574c791de680002a3454b84b0e2cab67f807166e2d01a)"
    - id: CAP-002-E4-S7-tasks
      version: "1 (updated 2026-10-31, last_reworked_review v2)"
    - id: CAP-002-E4-S7-tdd-evidence
      version: "cycle-1 to cycle-5"
    - id: CAP-002-E4-S7-implementation-review
      version: "2 (baseline; reviewed_head 5ef8ba4842eb102d8e7c9e98e47251b76b9c85ce)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0164
      version: "upheld"
    - id: DEC-0165
      version: "upheld"
    - id: DEC-0247
      version: "upheld 2026-10-31"
    - id: DEC-0249
      version: "owner-decided 2026-10-31 (status open)"
    - id: DEC-0250
      version: "open, provisional (triage accepted)"
    - id: DEC-0251
      version: "upheld 2026-11-01 (blind, agreed)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S7 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 3 |
| Acceptance criteria | 5/5 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 8/8 passed |

This re-review covers rework commit `9deeeef` against the v2 baseline
(`reviewed_head` `5ef8ba4`). Between the two, `origin/main` (`8ec2a73`) was
merged in as `46ff3cd`, with no conflict resolution. The base is `8ec2a73`, so
the change set holds this story's commits only.

- **What the rework fixed.**
  - v2 IR-001 is fixed in production. A settled read now stores the
    (symbol, attempt) it was issued for, and a loaded or failed state is
    rendered only while that key is current (`inspector-panel.tsx:31-41, 337,
    342, 358-364`).
  - The reviewer reproduced the fix:
    - HEAD's tests run against the v2 production file fail the three gap tests
      and pass the other 59.
    - The v2 reviewer's default-lane probe now passes on HEAD and still fails
      on `5ef8ba4`.
    - A new probe that moves A→B→A also passes on HEAD.
  - The owner answered v2 IR-002 by upholding DEC-0251 (blind review,
    agreed), so the `h-8` skeleton stands.
  - The explanation box's corner class is now pinned.
  - Every required command passes when rerun:
    - the focused suites, 510 tests;
    - the full web suite, 1333 tests in 60 files;
    - lint, the format check, `tsc --noEmit` and the build.
  - The TDD-evidence lint is clean, and `cycle-5.patch` replays onto `46ff3cd`
    to HEAD's six code files byte for byte.
- **Why it fails (IR-001, HIGH, carried).** The new key check hides a stale
  failure that lands while the current read is still pending. Every existing
  stale-failure test settles the stale failure in exactly that window. As a
  result, the guard that drops a late failure, `if (!cancelled)` on the failure
  branch, is no longer pinned by any test.
  - The baseline's own mutant `manual:review:fail-unguarded` was killed in v2.
    It now survives.
  - A reviewer probe shows the mutant is not equivalent. When the old stock's
    failure lands after the new stock has loaded, the mutant does one of two
    things:
    - it wipes the new stock into a permanent skeleton; or
    - on A→B→A, it replaces a fresh read with a stale failure and **Try
      again**.
  - HEAD's code is correct. The test that should pin it is `WEAK`.
- **Non-blocking (three LOW findings):**
  - the new gap tests do not check that the gap actually opened;
  - the box corner is still not `--radius`, though E4-S8 has since delivered a
    token class for it;
  - v1 IR-005 is carried.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 3 · **total 4**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same) at `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S7` |
| HEAD | `9deeeef0d15446bb2ab1ac4c54887924e3c27b9e` |
| Review base | `8ec2a73` (current `origin/main`, supplied by the driver) → `8ec2a736136dd3f743fb22ac1b7eac771e28d032` (`pipeline-state.py review-base --base-ref 8ec2a73`; ancestor of HEAD and equal to `git merge-base HEAD 8ec2a73`) |
| Working tree | clean (`git status --porcelain -uall` empty before and after) |
| Changed files reviewed | 41 since the base: 6 web files, the story, the plan, the TDD evidence, 28 evidence files, and the v1 and v2 reports with their mutation files. The rework commit `9deeeef` changed 10 of them. The merge `46ff3cd` changed no story file (`git show --cc 46ff3cd` is empty) |
| Baseline | v2 (`CAP-002-E4-S7-implementation-review-v2.md`, CHANGES-REQUIRED), `reviewed_head` `5ef8ba4842eb102d8e7c9e98e47251b76b9c85ce`, with `-v2-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/selection-tray.tsx` | added (unchanged since baseline) | DAC-E4-S7-1, AC-16; T009, T010 |
| `web/src/components/patterns/selection-tray.test.tsx` | added (unchanged since baseline) | TC-COMP-140; T001, T002 |
| `web/src/components/patterns/inspector-panel.tsx` | added; the rework adds `ReadKey`, keys the loaded and failed states, derives `current`, and drops the `biome-ignore` | DAC-E4-S7-2/3/4, AC-16; T011, T012; v2 IR-001 |
| `web/src/components/patterns/inspector-panel.test.tsx` | added; the rework adds four act()-free gap tests (`:437-538`) and pins `rounded` on the box (`:897`) | TC-COMP-141/142/143; T003 to T008; v2 IR-001, IR-003 |
| `web/src/screens/research/copy.ts`, `copy.test.ts` | modified. The story's own additions are unchanged since baseline, and the diff against `8ec2a73` holds only them. The other lines changed since `5ef8ba4` came in through the merge (E4-S8, E1-S7) | T009 |
| `.../stories/CAP-002-E4-S7.md` | modified: the `status:` line only | T013 |
| `.../stories/CAP-002-E4-S7-tasks.md` | modified: checkboxes, `updated`; the rework sets `last_reworked_review: …-v2.md` | T015 bookkeeping |
| `.../stories/CAP-002-E4-S7-tdd-evidence.yaml` | added; the rework adds cycle 5 | T015 |
| `.../stories/CAP-002-E4-S7-evidence/` (28 files; the rework adds `cycle-5.patch`, `red-`, `green-`, `full-suite-cycle-5.log`, `mutants-cycle-5.json`, `mutation-cycle-5-results.json`) | added | T015 |
| `.../stories/CAP-002-E4-S7-implementation-review-v1.md`, `-v1-mutation.json`, `-v2.md`, `-v2-mutation.json` | added (review commits `260139f`, `502b8c1`) | the earlier reviews |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `selection-tray.tsx` `SelectionTray`; `inspector-panel.tsx` `InspectorPanel` | both test files | This story's slice is the selection controls. *Within a single universe* depends on the Members-tab mount, which is unassigned (plan Open Gap 8) |
| DAC-E4-S7-1 | SATISFIED | `selection-tray.tsx:9-10` (`COMPARE_MIN`/`COMPARE_MAX`, DEC-0070), `:51`, `:60-86` (a `Link` at 2 to 6, otherwise a focusable `blocked` button with the visible reason by `aria-describedby`) | `selection-tray.test.tsx:51-117` | Unchanged since baseline |
| DAC-E4-S7-2 | SATISFIED | `inspector-panel.tsx:328-351` (one `setTimeout(INSPECT_DEBOUNCE_MS)`, cleared on change and unmount), `:358-364` (key check), `:81-106` `inputsLine` | `inspector-panel.test.tsx:130-176, 620-635`; stale reads `:391-538` | One read 150 ms after the selection settles, and each input with its `as_of` and `known_on`. Stale reads are dropped in every ordering the reviewer drove (probes below). The test gap in IR-001 leaves this criterion's behaviour correct |
| DAC-E4-S7-3 | SATISFIED | `inspector-panel.tsx:322-325` (render-phase reset to idle), `:329-331`, `:361-362`, `:396` | `inspector-panel.test.tsx:178-229`, `:521-525` | A stale read settling after the selection is cleared now leaves the empty sentence |
| DAC-E4-S7-4 | SATISFIED | `inspector-panel.tsx:181-208` `MembershipsLine` | `inspector-panel.test.tsx:637-688` | Unchanged since baseline |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `selection-tray.test.tsx:51-117` | Unchanged since baseline |
| T002 | complete | VERIFIED | `selection-tray.test.tsx:119-219` | Unchanged since baseline |
| T003 | complete | VERIFIED | `inspector-panel.test.tsx:130-176, 620-635` | — |
| T004 | complete | VERIFIED | `inspector-panel.test.tsx:178-229` | — |
| T005 | complete | VERIFIED | `inspector-panel.test.tsx:637-688` | — |
| T006 | complete | VERIFIED | `inspector-panel.test.tsx:690-878` | — |
| T007 | complete | VERIFIED | `inspector-panel.test.tsx:880-1096` | The box's `rounded` is now pinned (`:897`); `box-unrounded` is killed |
| T008 | complete | VERIFIED | `inspector-panel.test.tsx:231-619` | Every assertion T008 lists exists and passes, and the four gap tests are added. The stale-failure tests are `WEAK` (IR-001) |
| T009 | complete | VERIFIED | `copy.ts:495-522` (in `SELECTION`), `copy.test.ts` (S7 lines unchanged since baseline) | — |
| T010 | complete | VERIFIED | `selection-tray.tsx` (unchanged since baseline) | v1's justified deviation (a `section` instead of a `div role="region"`) stands |
| T011 | complete | VERIFIED | `inspector-panel.tsx:313-364` | A response for a (symbol, attempt) that is no longer current is dropped, including one that settles between the new selection's commit and the previous effect's cleanup (v2 IR-001 resolved). The **Try again** focus (DEC-0250) is a justified addition |
| T012 | complete | VERIFIED | `inspector-panel.tsx:68-280` | Unchanged since baseline |
| T013 | complete | VERIFIED | `git diff --name-status 8ec2a73..HEAD -- web` lists only the six files. `git grep` finds no importer of either pattern outside its own test, no `dangerouslySetInnerHTML` and no `results-table` import in either. `dependencies.yaml` is unchanged | — |
| T014 | complete | VERIFIED | The built `assets/index-CebuWwwS.css` has `.bg-foreground`, `.text-background`, `.bg-status-neutral-muted`, `.text-xs`, `.text-xl`, `.font-numeric`, `.h-8{height:var(--space-8)}`, `.h-2`/`.w-2` on `--space-2`, `.animate-pulse`, `.bg-secondary`, `.sr-only`, `.bg-card`, `.text-card-foreground`, and `--factor-value:`, `--factor-growth:`, `--factor-momentum:`. It has no `.h-24` or `.rounded-sm` | `.rounded` is still `.25rem` (IR-003) |
| T015 | complete | VERIFIED | `check-tdd-evidence.py … --base 8ec2a73 … --require-logs`: 0 errors, 0 warnings. The SHA-256 of `cycle-5.patch` equals its `diff_sha256` `20489dd3…`. The red, green, full-suite and mutation-results hashes match. `cycle-5.patch` applied to `46ff3cd` gives HEAD's six code files byte for byte | Cycle 5 is `commit_hash: stage`, carried by `9deeeef` (Decision-Id trailer DEC-0251) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `selection-tray.test.tsx` TC-COMP-140 | ADEQUATE | Blocked at 1, 7 and 8 (tag, variant, `aria-disabled`, not `disabled`, focus by Tab, the reason by `aria-describedby`, no navigation). Enabled at 2, 3 and 6 (anchor, exact `href`, outline classes) | — (`compare-link-no-variant`, `blocked-unstyled` equivalent, as in v1 and v2) |
| `selection-tray.test.tsx` tray behaviour / T002 | ADEQUATE | Empty at 0; the region; the polite count, first; encoding; the Add seam | — |
| `inspector-panel.test.tsx` TC-COMP-141 | ADEQUATE | No read at 0 and 149 ms, one at 150 ms, none after; one read per burst; dates printed | — |
| `inspector-panel.test.tsx` TC-COMP-142 | ADEQUATE | Exact sentence, no read, no other content; the card classes; in-flight read and failure discarded on clearing | — (`reset-removed` killed here) |
| `inspector-panel.test.tsx` TC-COMP-143 | ADEQUATE | *In no universe*; links, order, joins, encoding | — |
| `inspector-panel.test.tsx` loading, failure, Try again, out-of-order / T008 (`:231-436`, `:540-619`) | **WEAK** | Skeleton and its tokens; refusal and network sentences; **Try again** re-reads once and focuses the section; commit probes; a stale success after MSFT loads (`:410-422`) | Every stale-failure test (`:219-228`, `:424-435`, `:515-519`) settles the stale failure while the current read is still pending. In that window the key check already renders the skeleton, so none of them reaches the `cancelled` guard on the failure branch. Survivor `manual:review:fail-unguarded`, carried, non-equivalent (IR-001) |
| `inspector-panel.test.tsx` gap tests (review v2 IR-001) (`:437-538`) | ADEQUATE | No `act()`, a concurrent root, real timers, a transition, a sibling layout effect that settles AAPL's read and holds the commit past 5 ms. They cover a stale success and a stale failure under MSFT, a stale success under `null`, and MSFT's own read afterwards. They fail 3 of 4 on `5ef8ba4`'s production file, alone and in the full file. They passed six consecutive runs and every mutation baseline (4 parallel workers). They kill `current-is-state`, `key-ignores-symbol`, `key-check-loaded-only`, `key-check-failed-only`, `mismatch-always-loading` and `mismatch-always-idle` | Nothing asserts that the gap opened (IR-002, LOW) |
| `inspector-panel.test.tsx` factor blocks / T006 | ADEQUATE | Order of the parts and of each block; swatch tokens and classes; scores; grouping | — |
| `inspector-panel.test.tsx` explanation box, link, footnote / T007 | ADEQUATE | Sentences equal the cells' titles; absences; retired and restated cases; the box's `rounded border border-border`; the link's tag, `href` and classes; the footnote last | — (`box-unrounded` now killed) |
| `copy.test.ts` T009 anchors | ADEQUATE | Exact strings | — |

Mocks and isolation are as in v1 and v2. Only `getStockEvidence` is doubled, and
the top-level `beforeEach` calls `read.mockReset()`, so the gap tests'
`mockReturnValue` does not leak. The gap block installs real timers and sets
`IS_REACT_ACT_ENVIRONMENT` to false. Its `afterEach` restores the flag and
unmounts the root.

### Mutation run (E.9)

How the mutants were built:

- `mutation-run.py generate --range 8ec2a73..HEAD --cycle review` produced 32
  operator mutants.
- The reviewer added 12 hand-written mutants (`manual:review-v3:*`). They
  target the rework's key check, the keyed `setState` calls and the
  render-phase reset.
- `scope --since 5ef8ba4 --previous …-v2-mutation.json` added the baseline's
  mutants, giving 119: 79 carried, 13 delta and 27 late.
  - One baseline mutant no longer applies: `inspector-panel.tsx:331:negate-boolean:1`.
    Its line moved, and it is regenerated as `:336` and `:341`, both killed.
  - Line-numbered baseline mutants whose lines shifted by six run twice, under
    their old and new ids. The two copies behave the same.

The run used four clones and the three focused suites. All four baselines
exited 0. Result: **98 killed, 21 survived, 0 stillborn, 0 timeout** (exit 3).
The results are saved beside this report as
`CAP-002-E4-S7-implementation-review-v3-mutation.json`; their SHA-256 is
`4791f9851bde24a7e12145c7ec749fc844fbfb1dce6cd4b05db73fd59214b8f3`.

| Survivor | Scope | Mutation | Disposition | Contract |
|----------|-------|----------|-------------|----------|
| `manual:review:fail-unguarded` | carried (v2: killed; its line `:342` changed in the rework) | `if (!cancelled)` → `if (true)` on the failure branch | **non-equivalent** | T011: the per-effect `cancelled` flag drops "a response for a symbol that is no longer current". DEC-0165 (owner-upheld): such a response "is discarded". The reviewer probe below shows the mutant wiping the current stock (IR-001) |
| `manual:review-v3:key-ignores-attempt` | delta | key check on `symbol` only | equivalent | An earlier attempt's key can differ from the current one only after **Try again**. **Try again** is offered only once that attempt's one read has settled, so no read is in flight. The render-phase reset already turns the failure into *loading* on that commit (pinned by the Profiler test, `:334-356`). T011 and DEC-0165 fix the outcome, not which of the two checks makes it |
| `manual:review-v2:reset-ignores-attempt` | carried (v2: killed) | render-phase reset on `symbol` only | equivalent | The mirror image of the row above. After **Try again** the stored failure keeps its old attempt, so `current` renders *loading* on the same commit. The two attempt checks cover for each other; removing both is caught by `:334-356` |
| `manual:review-v3:loaded-key-from-evidence` | delta | key the loaded state by `evidence.symbol` | equivalent | It differs only when the response's `symbol` differs from the path's. classification-api 2.7 and its performance note ("each is a primary-key read") return the row for the path symbol, and no artifact lets the two differ. DEC-0164's host passes row symbols |
| `inspector-panel.tsx:315:off-by-one:1`, `:309:off-by-one:1`, `:308:off-by-one:1` | late / late / carried | `useState(0)` → `useState(1)` for `attempt` | equivalent | As in v1 and v2: the initial value is only ever compared, never shown |
| `inspector-panel.tsx:379:off-by-one:1`, `:361:off-by-one:1` | late / carried | `count + 1` → `count + 2` | equivalent | As in v2: any step gives a new key. T011 and DEC-0165 leave the step open |
| `manual:review-v2:focus-after-retry`, `skeleton-not-block`, `skeleton-no-pulse`, `swatch-not-inline-block`, `settled-initial-null` | carried | as v2 | equivalent | v2's dispositions hold. The lines are unchanged, and DEC-0250 and DEC-0251 (both still in force) fix only what v2 said |
| `manual:review-v2:skeleton-no-sr-text`, `section-not-flex` | late | as v2 | equivalent | As in v2 |
| `manual:review:compare-link-no-variant`, `see-link-no-variant`, `card-no-variant`, `blocked-unstyled`, `sentence-for-scored` | carried | as v1 | equivalent | As in v1 and v2. `git grep` still finds CSS keyed only on `data-[variant=blocked]` and `data-[variant=secondary]` |

Every other v3 manual mutant is killed:

- `current-is-state`, `key-ignores-symbol`, `key-check-loaded-only`,
  `key-check-failed-only`, `mismatch-always-loading` and `mismatch-always-idle`
  are killed by the gap tests.
- `reset-removed` is killed by `:208-228`.
- `loaded-key-wrong-attempt`, `failed-key-wrong-attempt` and
  `failed-key-null-symbol` are killed by the load and failure tests.

### Reviewer probes (scratch clone of HEAD, not part of the review subject)

| Probe | Code under probe | Observed | Result |
|-------|------------------|----------|--------|
| HEAD's `inspector-panel.test.tsx` against `5ef8ba4`'s production file (full file, and the gap block alone with `-t`) | `5ef8ba4` | 3 failed (the stale success, the stale failure and the stale success under `null`), 59 passed; the gap block alone fails the same 3 | RED confirmed, and it does not depend on test order |
| The same file against HEAD's production file, six consecutive runs | `9deeeef` | 62 passed each time | GREEN, deterministic here |
| v2's default-lane probe: plain `root.render` (no transition); AAPL's read settles in MSFT's commit, which is held 10 ms | `9deeeef` / `5ef8ba4` | `Loading the selected stock.` / `AAPLApple Inc.…` | PASS on HEAD; FAIL on the baseline. The fix does not depend on the lane |
| AAPL settles in the gap under MSFT, then the selection returns to AAPL | `9deeeef` | Skeleton until the new read settles; reads `AAPL, AAPL`; the first read's content never shown | PASS (no cached content, one read per selection) |
| Stale failure after the current read settled: (a) AAPL→MSFT, MSFT loads, AAPL rejects; (b) AAPL→MSFT→AAPL, the second AAPL read loads, the first rejects | `9deeeef` | (a) `MSFT Microsoft Corp.…` stays; (b) `AAPL Apple Inc.…` stays, no **Try again** | PASS |
| The same two cases, with `manual:review:fail-unguarded` applied | mutant | (a) `Loading the selected stock.` replaces Microsoft and stays, because no read remains; (b) `Could not load the stock's scores and inputs: … Try again.` with **Try again** replaces the fresh AAPL read | FAIL: the mutant is non-equivalent (IR-001) |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2` at `9deeeef`.

- A temporary symlink `node_modules` pointed at the main checkout's
  `node_modules` for the npm, tsc and biome runs. It was created after the
  mutation run, which refuses untracked files, and removed afterwards.
- Vitest, the mutation runner and the probes ran outside the sandbox, as the
  driver directed.
- Lint, format, `tsc`, the build and the CSS search ran inside the sandbox.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <S7> --stage adversarial-review` | harness root | 0 | READY | "review changes were reworked; a new review version is required" |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref 8ec2a73` | harness root | 0 | PASS | `8ec2a736136dd3f743fb22ac1b7eac771e28d032` |
| `npm run test --prefix <repo> -- src/components/patterns/selection-tray.test.tsx src/components/patterns/inspector-panel.test.tsx src/screens/research/copy.test.ts src/components/patterns/factor-cell.test.tsx` | repo root | 0 | PASS | 4 files, 510 tests (copy 334, factor-cell 90, tray 24, inspector 62) |
| `npm run test --prefix <repo>` (`vitest run`) | repo root | 0 | PASS | 60 files, 1333 tests, including the real-build `build-output.test.tsx` |
| `npm run lint` (`biome lint .`) | repo root | 0 | PASS | 139 files, no fixes |
| `npm run format` (`biome format .`, check only) | repo root | 0 | PASS | 139 files, no fixes |
| `npx tsc --noEmit` (also `node_modules/.bin/tsc --noEmit -p tsconfig.json`) | repo root | 0 | PASS | strict, `include: ["web/src"]` |
| `npm run build` (`vite build`) | repo root | 0 | PASS | 63 modules; `index-CebuWwwS.css`, `index-OhvKkvAS.js` |
| Search of the built CSS for the patterns' classes, the `--factor-*` definitions, `.h-24` and `.rounded-sm` (T014) | repo root | 0 | PASS | All required entries present; `.h-24` and `.rounded-sm` absent; `.rounded{border-radius:.25rem}`; `.rounded-\[var\(--radius\)\]` present from E4-S8 (IR-003) |
| `python3 scripts/check-tdd-evidence.py --evidence <S7>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 8ec2a736… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `mutation-run.py generate --range 8ec2a73..HEAD` + 12 manual mutants, then `scope --since 5ef8ba4 --previous <v2-mutation.json>`, then `run --jobs 4 --command 'test -e node_modules \|\| ln -s <main>/node_modules node_modules; ./node_modules/.bin/vitest run <three focused suites>'` | harness root | 3 (survivors present) | 21 survived / 119 | One non-equivalent survivor, in carried scope (IR-001); the rest are equivalent |
| Evidence replay: clone, `git checkout 46ff3cd`, `git apply cycle-5.patch`, `cmp` against HEAD | scratch clone | 0 | PASS | All six code files identical |
| Reviewer probes (above), via `vitest run` in the scratch clone | scratch clone | 0 on HEAD; 1 on `5ef8ba4` and on the mutant | as tabled | IR-001 (v2) fixed; IR-001 (v3) test gap |
| `npm run test:e2e` | — | N/A | NOT RUN | Deferred to Phase 6b by the driver. The plan's Validation Plan also excludes it, because no screen mounts the patterns yet (first importer CAP-002-E4-S9) |

### Validation Side Effects

- **Before:** `usr/alvaro-de-jodra/CAP-002-E4-S7` at `9deeeef`, an empty
  `git status --porcelain -uall`, and code fingerprint
  `sha256:8771225876c37a60e1b30a88ca9ad94c5dc57cec845adfb9f55fdeeb1848cd05`.
- **After:**
  - The same HEAD, an empty status and the same fingerprint.
  - While the temporary `node_modules` symlink existed it showed as untracked
    (`?? node_modules`). It was removed.
  - The build and `build-output.test.tsx` wrote ignored files under
    `src/factorflow/api/static/`: `index.html` and the hashed `assets/`
    bundles, including `index-CebuWwwS.css` and `index-OhvKkvAS.js`.
  - The mutation clones, logs, the replay clone and the probes are in the
    session scratchpad.
- **Unexpected tracked-file changes:** none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | carried | No test catches a stale failure that settles after the current read, so the failure branch's `cancelled` guard is unpinned |
| IR-002 | LOW | delta | The gap tests do not check that the gap opened |
| IR-003 | LOW | carried | The explanation box's corner is still not `--radius` (v2 IR-003) |
| IR-004 | LOW | carried | The inspector restates `FactorCell`'s private state choice and *Not followed* badge (v1 IR-005, v2 IR-004) |

### IR-001 — No test catches a stale failure that settles after the current read, so the failure branch's `cancelled` guard is unpinned

- **Severity**: HIGH
- **Scope**: carried. `mutation-run.py scope` tags the survivor carried
  because the baseline ran it, and v2 killed it. The mutated span includes
  `inspector-panel.tsx:342`, which the rework changed.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S7-2, AC-16
- **Tasks**: T008 (tests `WEAK`), T011
- **Files**:
  - Production, correct at HEAD: `web/src/components/patterns/inspector-panel.tsx:340-344`
    (the failure branch's `if (!cancelled)`) and `:358-364` (the key check
    that now hides a stale failure).
  - Tests: `web/src/components/patterns/inspector-panel.test.tsx:219-228`,
    `:424-435`, `:515-519`.
- **Claim challenged**:
  - Cycle 5 says the rework leaves "the cancelled flag … as [it was]" and that
    stale reads are pinned.
  - v2 recorded `fail-unguarded` as killed.
  - T008 promises tests that stale reads are dropped.
- **Observed evidence**:
  - Since the rework, a stale `failed` state carries its old (symbol, attempt),
    and `current` renders *loading* for it whenever the key is no longer
    current.
  - All three stale-failure tests settle the stale failure while the current
    read is still pending, or after the selection is cleared. In that window
    the masked state renders exactly the skeleton or empty sentence those
    tests expect. Each test therefore passes whether or not the `cancelled`
    guard on the failure branch exists.
  - The baseline mutant `manual:review:fail-unguarded` (`if (!cancelled)` →
    `if (true)`) now survives all 420 focused tests. v2 killed it.
  - The loaded branch's twin, `manual:review:load-unguarded`, is still killed.
    The kill comes from "never renders an earlier read that resolves last"
    (`:410-422`), which settles the stale read after MSFT has loaded. The
    failure branch has no such test.
  - The reviewer probe shows the mutant is not equivalent:
    - AAPL→MSFT, MSFT loads, then AAPL's read rejects: Microsoft's content is
      replaced by *Loading the selected stock.* and stays, because no read
      remains.
    - AAPL→MSFT→AAPL, the second AAPL read loads, then the first rejects: the
      fresh content is replaced by the failure sentence and **Try again**.
  - HEAD's code passes both probes.
- **Expected evidence/behavior**:
  - T011: "tracks the request with a per-effect `cancelled` flag so a response for a symbol that is no longer current is dropped".
  - DEC-0165 (owner-upheld): "A response for a symbol that is no longer current is discarded."
  - T008: stale reads never change what the panel shows for the current selection.
  - Adversarial-review E.9: a survivor that cannot be shown equivalent makes the test that should kill it `WEAK`.
- **Impact**:
  - No production defect today.
  - Deleting or inverting the guard on the failure branch passes the whole
    suite. If that happened, a slow failure from an earlier selection would
    replace the inspector's current stock. The panel would either show a
    skeleton that never resolves or a failure for a read that in fact
    succeeded.
  - Both cases are reachable with plain clicks or arrow keys while a read is in
    flight.
- **Required remediation**:
  - Add a test in which a stale read rejects after the current selection's
    read has settled, and assert that the current stock stays on screen with no
    **Try again**. Either ordering works: A→B with B loaded first, or A→B→A.
  - The test must fail with `manual:review:fail-unguarded` applied.
  - No production change is required.

### IR-002 — The gap tests do not check that the gap opened

- **Severity**: LOW
- **Scope**: delta (`inspector-panel.test.tsx:437-538`, added by the rework)
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S7-2
- **Tasks**: T008
- **Files**: `web/src/components/patterns/inspector-panel.test.tsx:437-538`
- **Claim challenged**: The cycle-5 evidence says the four tests "drive that
  gap".
- **Observed evidence**:
  - The tests reach the gap through two things:
    - React 18's scheduler yields after a 10 ms busy-wait, longer than its
      5 ms frame, so the read's microtask runs before the passive effects;
    - `startTransition` keeps the update off the discrete lane.
  - They reach it today. They fail on `5ef8ba4`, and they kill
    `current-is-state` and the other key-check mutants.
  - Nothing in them observes that the stale callback ran before the previous
    effect's cleanup. If a React or scheduler upgrade flushed passive effects
    before the microtask, the `cancelled` flag would drop the read. Tests 1 to
    3 would then pass with or without the key check. Test 4 checks only
    MSFT's own read.
- **Expected evidence/behavior**: Adversarial-review E.3 says a test must not
  pass without executing the intended path.
- **Impact**: A dependency upgrade could silently remove the regression
  protection for v2 IR-001.
- **Required remediation**: Optional. Make the tests fail when the gap does not
  open. For example, a `Profiler` around the panel can require the extra
  commit that the stale read's `setState` causes after the transition commit.

### IR-003 — The explanation box's corner is still not `--radius` (v2 IR-003)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007, T012
- **Files**:
  - `web/src/components/patterns/inspector-panel.tsx:263`;
  - `inspector-panel.test.tsx:894-897`;
  - for comparison, `web/src/screens/research/notices.tsx:112` and
    `dialog-frame.tsx:134-135`.
- **Claim challenged**: The test comment at `:894-896` says "the theme maps no
  `--radius` class yet".
- **Observed evidence**:
  - The box keeps `rounded`, which builds to `.rounded{border-radius:.25rem}`.
    The rework pins it, so `box-unrounded` is killed.
  - The merge brought in CAP-002-E4-S8's `rounded-[var(--radius)]`, used in
    `notices.tsx:112` and `dialog-frame.tsx`. The built CSS has
    `.rounded-\[var\(--radius\)\]`.
  - So a class carrying the theme token now ships without a
    `tailwind.config.js` change. The comment is true only of the Tailwind
    theme.
  - The card, the buttons and every other pattern still use `rounded`.
  - The `--radius` follow-up is recorded only in the TDD evidence, not in a
    decision record or the backlog.
- **Expected evidence/behavior**: UX design 1.1 item 4: "bordered (`--border`, `--radius`)". STD-UI-29.
- **Impact**: The box's corner, and every delivered card's and button's, is
  4 px where the theme says 8 px. The test now pins the 4 px class.
- **Required remediation**: None required in this story. The owner should
  record whether the patterns adopt `rounded-[var(--radius)]` as E4-S8 did,
  for the box alone or with the card and buttons.

### IR-004 — The inspector restates `FactorCell`'s private state choice and *Not followed* badge (v1 IR-005, v2 IR-004)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T012
- **Files**: `web/src/components/patterns/inspector-panel.tsx:108-178`; compare `factor-cell.tsx`
- **Claim challenged**: T009: "If S3 exports its Incomplete-sentence builder …, import it rather than writing a second".
- **Observed evidence**: Unchanged since v1. S3 exports no builder, and T013
  forbids editing `factor-cell.tsx`. The cycle-5 evidence carries the
  follow-up.
- **Expected evidence/behavior**: One source for the cell state (DEC-0151, DEC-0247).
- **Impact**: A later change to `FactorCell`'s state order can make the box
  explain a factor the cell draws differently.
- **Required remediation**: None required in this story. Carry the follow-up
  to a story that may edit `factor-cell.tsx`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (HIGH) | RESOLVED, with a test regression | The production fix is at `inspector-panel.tsx:31-41, 337, 342, 358-364`. HEAD's tests fail 3 on `5ef8ba4`'s file and pass on HEAD (six runs). v2's default-lane probe passes on HEAD and fails on `5ef8ba4`. `current-is-state` and the other key-check mutants are killed. T011 is now `VERIFIED`. The rework also left the failure branch's guard unpinned (IR-001) |
| v2/IR-002 (MEDIUM) | RESOLVED by owner decision | DEC-0251 is `owner_reviewed: true`, `owner_verdict: upheld`, `review_mode: blind`, `blind_verdict: agreed`, `owner_decided_at: 2026-11-01T00:16:08Z`, so the single `h-8` skeleton stands. The upheld record is uncommitted in the harness working tree. Its question and derivation still say no artifact sets the height and do not name card design-spec §4. The cycle-5 evidence records the owner's answer as the accepted departure |
| v2/IR-003 (LOW) | STILL OPEN | Carried as IR-003. The box's `rounded` is now pinned and `box-unrounded` killed. The corner is still not `--radius`, and E4-S8's token class shows a route that needs no theme change |
| v2/IR-004 (LOW) | STILL OPEN | Carried as IR-004 |

## Scope and Plan Deviations

- **Justified additions in the rework:**
  - the keyed `loaded` and `failed` states and the derived `current` (v2
    IR-001);
  - the `rounded` assertion (v2 IR-003);
  - removing the `biome-ignore`, which is correct now that the effect reads
    `attempt`. Lint is clean.
- **Merge:** `46ff3cd` brought `origin/main` (E4-S8, E1-S7, E2-S7,
  EXP-20261031-1) into the branch without conflict resolution. No story file
  changed in it.
- **Decisions:**
  - DEC-0251 is now owner-upheld; the upheld record is uncommitted in the
    harness.
  - DEC-0250 is still an open provisional agent decision, with triage accepted.
  - DEC-0249 is owner-decided but `open`, with propagation to E4-S9 pending.
  - The commit carries `Decision-Id: DEC-0251`.
- **Bookkeeping:**
  - T011 and T012 still say "the loading half of T008", as noted in v1.
  - The plan does not mention DEC-0250's focus behaviour or the read key. The
    evidence records both.
- **Out-of-scope changes:** none.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework with this report and `CAP-002-E4-S7-tasks.md`:
  - resolve IR-001 with a stale-failure test that fails under
    `manual:review:fail-unguarded`;
  - optionally, address IR-002.

  Then rerun this review (v4) with `CAP-002-E4-S7-implementation-review-v3-mutation.json`
  as `scope --previous`.
- **Warnings accepted downstream**: N/A
