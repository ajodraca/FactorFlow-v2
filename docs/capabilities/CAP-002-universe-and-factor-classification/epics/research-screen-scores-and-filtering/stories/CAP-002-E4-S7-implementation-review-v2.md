---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S7-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E4-S7"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-31T15:38:41Z"
reviewed_head: "5ef8ba4842eb102d8e7c9e98e47251b76b9c85ce"
review_base: "6a5eca7213a84853d9b0b6d46ee16a65e628d32a"
reviewed_state_revision: "sha256:5a534171b232bb761cc4a19d021453d08fe517e128e615257979909f39513b17"
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
  timestamp: 2026-10-31T15:38:41Z
  source_artifacts:
    - id: CAP-002-E4-S7
      version: "1 (sha256:f03e846a8f59b235a15574c791de680002a3454b84b0e2cab67f807166e2d01a)"
    - id: CAP-002-E4-S7-tasks
      version: "1 (updated 2026-10-31, last_reworked_review v1)"
    - id: CAP-002-E4-S7-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-002-E4-S7-implementation-review
      version: "1 (baseline; reviewed_head 19bea3759e9ba663666ceae30ee4106434203864)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0165
      version: "upheld"
    - id: DEC-0247
      version: "upheld 2026-10-31"
    - id: DEC-0249
      version: "owner-decided 2026-10-31 (status open)"
    - id: DEC-0250
      version: "open, provisional"
    - id: DEC-0251
      version: "open, provisional"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S7 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 5/5 satisfied |
| Planned tasks | 14/15 verified |
| Required validation | 8/8 passed |

This re-review covers rework commit `5ef8ba4` against the v1 baseline
(`reviewed_head` `19bea37`).

- **What the rework fixed.** Every v1 finding with a code or test remedy is
  resolved:
  - all nine non-equivalent v1 survivors (IR-001, IR-002) are killed in this
    review's own mutation run;
  - the size literals are gone (IR-004);
  - **Try again** keeps focus in the inspector (IR-007);
  - the evidence counts are corrected (IR-008).

  The owner settled IR-003 in DEC-0249, so the tray needs no change. Every
  required command passes when rerun: the focused suites (489 tests), the full
  web suite (1157 tests in 55 files), lint, the format check, `tsc --noEmit`
  and the build. The TDD-evidence lint is clean, and the four cycle patches
  replay onto the base to HEAD's six code files byte for byte.
- **Why it fails (IR-001, HIGH, delta).** The rework moved the reset to
  *loading* out of the effect and into render. That move took away what used
  to overwrite a stale read. A read for the previous stock can settle after
  the new selection commits but before React runs that commit's effect
  cleanup. When that happens, the inspector now renders the previous stock
  under the new selection, and it stays there until the current read settles.
  - The reviewer reproduced it in a scratch clone. HEAD fails the probe; the
    baseline `19bea37` passes the same probe.
  - It breaks the stale-read rule that T008, T011 and DEC-0165 (owner-upheld)
    require.
  - T011 is therefore `PARTIAL`, and the T008 tests are `WEAK` for this
    ordering.
- **Non-blocking.**
  - One MEDIUM: the skeleton is a single 64 px bar, while the card design spec
    asks for one that matches the final layout. DEC-0251 says no artifact sets
    its height. This is an owner question.
  - Two LOW: the explanation box's corner is not `--radius`, and v1 IR-005 is
    carried.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 2 · **total 4**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same) at `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S7` |
| HEAD | `5ef8ba4842eb102d8e7c9e98e47251b76b9c85ce` |
| Review base | `origin/main` → `6a5eca7213a84853d9b0b6d46ee16a65e628d32a` (`pipeline-state.py review-base --base-ref origin/main`; ancestor of HEAD and equal to the merge base) |
| Working tree | clean (`git status --porcelain -uall` empty before and after) |
| Changed files reviewed | 33 since the base, in three commits (`19bea37` coding, `260139f` review v1, `5ef8ba4` rework); 11 changed by the rework |
| Baseline | v1 (`CAP-002-E4-S7-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `19bea3759e9ba663666ceae30ee4106434203864`, with `-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/selection-tray.tsx` | added (unchanged since baseline) | DAC-E4-S7-1, AC-16; T009, T010 |
| `web/src/components/patterns/selection-tray.test.tsx` | added; rework adds the outline classes and the count-first order | TC-COMP-140; T001, T002; v1 IR-001, IR-002 |
| `web/src/components/patterns/inspector-panel.tsx` | added; the rework adds the render-phase reset, the **Try again** focus, `h-8` and the swatch `rounded` | DAC-E4-S7-2/3/4, AC-16; T011, T012; v1 IR-004, IR-006, IR-007; DEC-0250, DEC-0251 |
| `web/src/components/patterns/inspector-panel.test.tsx` | added; rework adds order, class, focus and commit-probe tests | TC-COMP-141/142/143; T003 to T008; v1 IR-001, IR-002, IR-004, IR-006, IR-007 |
| `web/src/screens/research/copy.ts`, `copy.test.ts` | modified (unchanged since baseline) | T009 |
| `.../stories/CAP-002-E4-S7.md` | modified: the `status:` line only | T013 |
| `.../stories/CAP-002-E4-S7-tasks.md` | modified: checkboxes; the rework changes only `updated` and adds `last_reworked_review` | T015 bookkeeping |
| `.../stories/CAP-002-E4-S7-tdd-evidence.yaml` | added; the rework adds cycle 4 and corrects cycle 3's counts | T015; v1 IR-008 |
| `.../stories/CAP-002-E4-S7-evidence/` (22 files; the rework adds `cycle-4.patch`, `red-`, `green-`, `full-suite-cycle-4.log`, `mutants-cycle-4.json`, `mutation-cycle-4-results.json`) | added | T015 |
| `.../stories/CAP-002-E4-S7-implementation-review-v1.md`, `-v1-mutation.json` | added (review commit `260139f`) | the baseline review |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `selection-tray.tsx` `SelectionTray`; `inspector-panel.tsx` `InspectorPanel` | both test files | This story's slice is the selection controls. *Within a single universe* depends on the Members-tab mount, unassigned (plan Open Gap 8) |
| DAC-E4-S7-1 | SATISFIED | `selection-tray.tsx:51` (`COMPARE_MIN`/`COMPARE_MAX`, DEC-0070), `:60-86` (a `Link` at 2 to 6, else a focusable `blocked` button with the visible reason by `aria-describedby`) | `selection-tray.test.tsx:51-117`; the outline classes at `:104` | Unchanged since baseline; v1 IR-002's styling gap now pinned |
| DAC-E4-S7-2 | SATISFIED | `inspector-panel.tsx:323-346` (one `setTimeout(INSPECT_DEBOUNCE_MS)`, cleared on change and unmount); `:75-100` `inputsLine` | `inspector-panel.test.tsx:129-175, 516-531` | The selected stock gets one read after 150 ms, and its inputs and dates are shown. A stale read can appear first when the update is not discrete (IR-001). That breaks T008, T011 and DEC-0165, not this criterion's own clauses |
| DAC-E4-S7-3 | SATISFIED | `inspector-panel.tsx:308, 316-319` (`null` → idle during render), `:324-326` (no timer), `:378` | `inspector-panel.test.tsx:177-228` (with the card classes at `:183`) | — |
| DAC-E4-S7-4 | SATISFIED | `inspector-panel.tsx:175-202` `MembershipsLine` | `inspector-panel.test.tsx:533-584` | Unchanged since baseline |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `selection-tray.test.tsx:51-117` | Now pins the outline classes on the enabled Compare link (`:104`) |
| T002 | complete | VERIFIED | `selection-tray.test.tsx:119-219` | Now pins the count first, before Compare and Add (`:150-162`), and the classes on **Add to universe…** (`:210`) |
| T003 | complete | VERIFIED | `inspector-panel.test.tsx:129-175, 516-531` | — |
| T004 | complete | VERIFIED | `inspector-panel.test.tsx:177-228` | — |
| T005 | complete | VERIFIED | `inspector-panel.test.tsx:533-584` | — |
| T006 | complete | VERIFIED | `inspector-panel.test.tsx:586-774` | Now pins symbol before name, the inspector's top-to-bottom order, each block's `dt`, `dd`, `dd` order and the swatch classes |
| T007 | complete | VERIFIED | `inspector-panel.test.tsx:776-989` | The evidence link's outline classes are now pinned (`:974`). The box's corner is not (IR-003) |
| T008 | complete | VERIFIED | `inspector-panel.test.tsx:230-459` | Every listed assertion exists and passes. None drives a stale read that settles before the new selection's effect cleanup, which is where HEAD fails (IR-001) |
| T009 | complete | VERIFIED | `copy.ts`, `copy.test.ts` (unchanged since baseline) | — |
| T010 | complete | VERIFIED | `selection-tray.tsx` (unchanged since baseline) | v1's justified deviation (a `section` instead of a `div role="region"`) stands |
| T011 | complete | **PARTIAL** | `inspector-panel.tsx:308-346` | T011 says a response for a symbol that is no longer current is dropped. It is not when that response settles between the new selection's commit and its effect cleanup (IR-001). The **Try again** focus (DEC-0250) is a justified addition |
| T012 | complete | VERIFIED | `inspector-panel.tsx:68-274` | — |
| T013 | complete | VERIFIED | `git diff --name-status 6a5eca72..HEAD -- web` lists only the six files. Neither pattern has an importer outside its own test. Neither uses `dangerouslySetInnerHTML` or imports `results-table`. `dependencies.yaml` is unchanged | — |
| T014 | complete | VERIFIED | The built `assets/index-CL134Z5j.css` has `.h-8{height:var(--space-8)}`, `.h-2`/`.w-2` on `--space-2`, every class the patterns use, and `--factor-value:`, `--factor-growth:`, `--factor-momentum:`. It has no `.h-24` or `.rounded-sm`, and `git grep` finds neither in `web/src` | `.rounded` is still Tailwind's `0.25rem`, not `--radius` (IR-003) |
| T015 | complete | VERIFIED | `check-tdd-evidence.py … --require-logs`: 0 errors, 0 warnings. `cycle-4.patch` SHA-256 equals its `diff_sha256` `169808dc…`, and the cycle-4 log and results hashes match. Cycles 1 to 4 replay onto `6a5eca7` to HEAD's six code files | Cycle 4 is `commit_hash: stage`, carried by `5ef8ba4` (Decision-Id trailers DEC-0249, DEC-0250, DEC-0251) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `selection-tray.test.tsx` TC-COMP-140 | ADEQUATE | Blocked at 1, 7 and 8: tag, `type`, variant, `aria-disabled`, not `disabled`, focus by Tab, the reason by `aria-describedby`, no navigation. Enabled at 2, 3 and 6: anchor, exact `href`, outline classes, navigation | — (`compare-link-unstyled` killed; `compare-link-no-variant` and `blocked-unstyled` equivalent, as in v1) |
| `selection-tray.test.tsx` tray behaviour / T002 | ADEQUATE | Empty at 0; region and fill; the polite count updated in place; the count first, then Compare, then Add; encoding; the Add seam with its classes | — (`count-after-compare`, `add-unstyled`, `live-assertive` killed) |
| `inspector-panel.test.tsx` TC-COMP-141 | ADEQUATE | No read at 0 and 149 ms, one at 150, none after; one read per burst; dates printed | — |
| `inspector-panel.test.tsx` TC-COMP-142 | ADEQUATE | Exact sentence, no read, no link, status or button; the card classes | — (`card-no-classes`, `effect-null-no-return` killed) |
| `inspector-panel.test.tsx` TC-COMP-143 | ADEQUATE | *In no universe*; links, order, joins, encoding | — |
| `inspector-panel.test.tsx` loading, failure, stale / T008 | **WEAK** | The skeleton and its tokens; card classes in every state; refusal and network sentences; **Try again** re-reads once and focuses the section; a layout-effect probe and a `Profiler` probe show no previous stock or failure is committed after a change; out-of-order, stale-failure, unmount and re-selection cases | Every stale case resolves after the new selection's effect has run. None resolves between that commit and its effect cleanup, where HEAD renders the stale stock (IR-001). The reset mutants are killed: `reset-always-idle`, `reset-ignores-symbol`, `reset-ignores-attempt`, `settled-not-updated`, `initial-idle`, `initial-loading`, `deps-no-attempt`, `no-clear-timeout`, `no-ref`, `retry-focuses-button-parent` |
| `inspector-panel.test.tsx` factor blocks / T006 | ADEQUATE | Order of the parts and of each block; swatch tokens and classes; scores; grouping | — (`name-above-symbol`, `memberships-after-blocks`, `inputs-before-cell`, `badge-before-symbol` killed) |
| `inspector-panel.test.tsx` explanation box, link, footnote / T007 | ADEQUATE | Sentences equal the cells' titles; absences; retired and restated cases; the link's tag, `href` and classes; the footnote last | The box's corner is unpinned (late survivor `box-unrounded`, IR-003). A late survivor does not make the test `WEAK` |
| `copy.test.ts` T009 anchors | ADEQUATE | Exact strings | — |

Mocks and isolation are as in v1. Only `getStockEvidence` is doubled. Fake
timers are installed and reset per test, and nothing touches the network. The
new commit probes are deterministic, because testing-library's `act()` flushes
passive effects synchronously. That same flush also hides the IR-001 ordering
from every test in the suite.

### Mutation run (E.9)

How the mutants were built:

- `mutation-run.py generate --range 6a5eca72..HEAD --cycle review` produced
  30 operator mutants.
- The reviewer added 22 hand-written mutants (`manual:review-v2:*`), aimed at
  the rework's lines (reset, focus, `tabIndex`, `ref`, skeleton, swatch) and at
  the three baseline mutants whose text no longer applies.
- `scope --since 19bea37 --previous …-v1-mutation.json` added the baseline's
  mutants and tagged all 84 as 55 carried, 17 delta and 12 late. Five baseline
  mutants no longer apply because their lines were rewritten:
  `322:negate-boolean:1`, `346:off-by-one:1`, `null-no-return`,
  `retry-no-type` and `skeleton-after-wait`. Their behaviour is covered by
  `effect-null-no-return`, `retry-no-type`, `initial-idle` and
  `reset-always-idle`, and the step mutant is regenerated as
  `361:off-by-one:1`.

The run used four clones and the three focused suites. Every baseline exited 0.
Result: **68 killed, 16 survived, 0 stillborn, 0 timeout**. The results are
saved beside this report as
`CAP-002-E4-S7-implementation-review-v2-mutation.json`; their SHA-256 is
`4bdc1205b6abb753d012c79f4b9c293391aeaea741ee7b65fecf353fe7412e18`.

| Survivor | Scope | Mutation | Disposition | Contract |
|----------|-------|----------|-------------|----------|
| `inspector-panel.tsx:361:off-by-one:1` | delta | `count + 1` → `count + 2` | equivalent | Any step gives a new `attempt` and a new settled key. T011 and DEC-0165 leave the step open |
| `manual:review-v2:focus-after-retry` | delta | `setAttempt` before `focus()` | equivalent | Both run inside one click handler. React 18 applies the update after the handler returns, and the target section stays mounted either way. DEC-0250 fixes the target, not the order |
| `manual:review-v2:skeleton-not-block` | delta | drop `block` from the `output` | equivalent | The `output` is a direct child of the section's `flex flex-col`, so it is blockified as a flex item. `h-8` and `w-full` apply either way (DEC-0251 fixes the height) |
| `manual:review-v2:skeleton-no-pulse` | delta | drop `animate-pulse` | equivalent | No artifact specifies motion. The UX design 1.1 states table ("inspector skeleton (S03 §7)"), card design-spec §4, T008, T011 and DEC-0165 fix only presence, role and text |
| `manual:review-v2:swatch-not-inline-block` | delta | drop `inline-block` from the swatch | equivalent | The swatch is a flex item of the `dt` (`flex items-center`), so it is blockified and `h-2 w-2` apply either way |
| `manual:review-v2:settled-initial-null` | delta | initial settled key `{ symbol: null }` | equivalent | With a symbol at mount, the first render's reset sets *loading*, which is already the initial state. With `null` the key matches. No commit differs |
| `inspector-panel.tsx:309:off-by-one:1` | late | `useState(0)` → `useState(1)` for `attempt` | equivalent | As v1: the initial value is read only as a key |
| `manual:review-v2:skeleton-no-sr-text` | late | the loading sentence visible | equivalent | T008 and DEC-0165 require `role="status"` and the sentence, not whether it is visible |
| `manual:review-v2:section-not-flex` | late | drop `flex flex-col gap-3` from the section | equivalent | UX design 1.1 fixes the order, which is pinned, and the pane gap (`--space-4`). It gives no spacing inside the inspector. Card design-spec §6 names surface, border and radius tokens, not layout. The skeleton keeps `block` |
| `manual:review-v2:box-unrounded` | late | drop `rounded` from the explanation box | **non-equivalent** | UX design 1.1 item 4: "bordered (`--border`, `--radius`)" (IR-003, LOW; late, so no test is `WEAK`) |
| `inspector-panel.tsx:308:off-by-one:1`, `manual:review:compare-link-no-variant`, `see-link-no-variant`, `card-no-variant`, `sentence-for-scored`, `blocked-unstyled` | carried | as v1 | equivalent | v1's dispositions hold. `git grep` finds CSS keyed only on `data-[variant=blocked]` and `data-[variant=secondary]`, and button design-spec §2 gives `blocked` no visual tokens |

The run finds no non-equivalent survivor in a blocking scope. The blocking
defect, IR-001, is an ordering that jsdom tests run under `act()` cannot show.
The reviewer found it by reading the rework and confirmed it with the probe
below.

### Reviewer probe for IR-001 (scratch clone, not part of the review subject)

The probe was a vitest file added to a scratch clone of HEAD under the session
scratchpad (`review-s7-v2/replay`). It has no `act()`
(`IS_REACT_ACT_ENVIRONMENT = false`) and uses `createRoot` with real timers.
Its steps:

1. Mount `<InspectorPanel symbol="AAPL" />`, wait 250 ms, and leave AAPL's read
   pending.
2. Call `root.render` with `symbol="MSFT"`, a default-priority update like any
   update made outside a discrete event.
3. A sibling's `useLayoutEffect` on MSFT's commit resolves AAPL's read, then
   busy-waits 10 ms. That models a commit longer than the scheduler's 5 ms
   frame, so React yields before running that commit's passive effects.
4. Wait 50 ms and read the container text.

| Code under probe | Update | Observed text | Result |
|------------------|--------|---------------|--------|
| HEAD `5ef8ba4` | `root.render` (default lane) | `AAPLApple Inc.In no universeValue50+1.00…` under `symbol="MSFT"`; trace `THEN AAPL cancelled= false`, then `CLEANUP AAPL` | **FAIL**: AAPL rendered |
| HEAD `5ef8ba4` | `flushSync(() => root.render(…))` (sync lane) | `Loading the selected stock.` | PASS |
| baseline `19bea37` | `root.render` (default lane) | `Loading the selected stock.` | PASS |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2` at `5ef8ba4`. A
temporary symlink `node_modules` pointed at the main checkout's `node_modules`
for the npm, tsc and biome runs. It was removed before the mutation run, which
refuses untracked files, and was not recreated. Vitest, the mutation runner and
the probe ran outside the sandbox: the invoking driver reported `EPERM` on
`node_modules/.vite` inside it, so no in-sandbox attempt was made for those.
Lint, format, `tsc` and the build ran inside the sandbox.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm run test --prefix <repo> -- src/components/patterns/selection-tray.test.tsx src/components/patterns/inspector-panel.test.tsx src/screens/research/copy.test.ts src/components/patterns/factor-cell.test.tsx` | repo root | 0 | PASS | 4 files, 489 tests (tray 24, inspector 58, copy 317, factor-cell 90) |
| `npm run test --prefix <repo>` (`vitest run`) | repo root | 0 | PASS | 55 files, 1157 tests, including the real-build `build-output.test.tsx` |
| `npm run lint --prefix <repo>` (`biome lint .`) | repo root | 0 | PASS | 127 files, no fixes |
| `npm run format --prefix <repo>` (`biome format .`, check only) | repo root | 0 | PASS | 127 files, no fixes |
| `npx tsc --noEmit` (run as `node_modules/.bin/tsc --noEmit -p <repo>/tsconfig.json`) | repo root | 0 | PASS | strict, `include: ["web/src"]` |
| `npm run build --prefix <repo>` (`vite build`) | repo root | 0 | PASS | 63 modules; `index-CL134Z5j.css`, `index-DBwCW3u_.js` |
| Search of the built CSS for the patterns' classes, the `--factor-*` definitions, `.h-24` and `.rounded-sm` (T014) | repo root | 0 | PASS | All present. `.h-8{height:var(--space-8)}`. `.h-24` and `.rounded-sm` absent. `.rounded{border-radius:.25rem}` (IR-003) |
| `python3 scripts/check-tdd-evidence.py --evidence <S7>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 6a5eca72… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `mutation-run.py generate` + 22 manual, then `scope --since 19bea37 --previous <v1-mutation.json>`, then `run --jobs 4 --command 'test -e node_modules \|\| ln -s <main>/node_modules node_modules; ./node_modules/.bin/vitest run <three focused suites>'` | harness root | 3 (survivors present) | 16 survived / 84 | One non-equivalent survivor, in late scope (IR-003). The rest are equivalent |
| Evidence replay: clone at `6a5eca7`, `git apply` cycle-1 to cycle-4, `cmp` against HEAD | scratch clone | 0 | PASS | All six code files identical |
| Reviewer probe (above), `npm run test --prefix <scratch clone> -- src/components/patterns/zz-race-probe.test.tsx` | scratch clone | 1 on HEAD; 0 on `19bea37` | FAIL on HEAD | IR-001 |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the plan's Validation Plan: no screen mounts the patterns yet (first importer CAP-002-E4-S9) |

### Validation Side Effects

- **Before:** `usr/alvaro-de-jodra/CAP-002-E4-S7` at `5ef8ba4`, an empty
  `git status --porcelain -uall`, and code fingerprint
  `sha256:5a534171b232bb761cc4a19d021453d08fe517e128e615257979909f39513b17`.
- **After:**
  - The same HEAD, an empty status and the same fingerprint.
  - While the temporary `node_modules` symlink existed it showed as untracked
    (`?? node_modules`), because `.gitignore`'s `node_modules/` matches only
    directories. It was removed.
  - The build and `build-output.test.tsx` rewrote ignored files under
    `src/factorflow/api/static/`: `index.html` and `assets/index-CL134Z5j.css`,
    `index-DBwCW3u_.js`, `index-CDSqkzbr.js`. All of these names already
    existed.
  - The mutation clones, logs and the probe clone are in the session
    scratchpad.
- **Unexpected tracked-file changes:** none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | delta | A stale read that settles before the new selection's effect cleanup is rendered under the new selection |
| IR-002 | MEDIUM | delta | The loading skeleton is one 64 px bar, not the final layout the card spec asks for |
| IR-003 | LOW | late | The explanation box's corner is neither `--radius` nor pinned |
| IR-004 | LOW | carried | The inspector restates `FactorCell`'s private state choice and *Not followed* badge (v1 IR-005) |

### IR-001 — A stale read that settles before the new selection's effect cleanup is rendered under the new selection

- **Severity**: HIGH
- **Scope**: delta (the rework removed `setState(LOADING)` and `setState(IDLE)` from the effect and moved the reset to render, `inspector-panel.tsx:308-326`)
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S7-2, AC-16
- **Tasks**: T011 (`PARTIAL`), T008 (tests `WEAK` for this ordering)
- **Files**:
  - Production: `web/src/components/patterns/inspector-panel.tsx:313-319` (render-phase reset), `:327-345` (the `cancelled` flag, cleared only in the effect cleanup).
  - Tests: `web/src/components/patterns/inspector-panel.test.tsx:357-434`.
- **Claim challenged**:
  - The code comment at `:313-315` says the previous stock's content "is never put on the page under the new selection".
  - The cycle-4 evidence says the same for IR-006.
  - T008 says reads resolving out of order "never render AAPL content".
  - T011 says "a response for a symbol that is no longer current is dropped".
- **Observed evidence**:
  - The `cancelled` flag flips only when React runs the old effect's cleanup.
    That happens after the new selection commits. For an update outside a
    discrete event, React may yield between that commit and the cleanup.
  - A read for the previous symbol that settles in that gap still calls
    `setState({ kind: "loaded", … })`. The settled key already matches the new
    symbol, so the render-phase reset no longer fires. Nothing overwrites the
    stale state, and the previous stock is committed under the new selection.
    It stays until the current read settles, at least 150 ms later, and
    indefinitely while that read hangs. A stale failure (`:336-338`) is
    committed the same way, with **Try again**.
  - At the baseline, the new effect's own `setState(LOADING)` was queued behind
    the stale update in the same batch, so the panel ended on *loading*.
  - The reviewer probe shows it: HEAD renders `AAPL … Apple Inc.` under
    `symbol="MSFT"`, while the same probe passes on `19bea37` and passes on
    HEAD when the update is `flushSync`.
  - The suite cannot see it. Every test runs under `act()`, which flushes
    passive effects before any microtask settles a read.
- **Expected evidence/behavior**:
  - T008: "reads resolving out of order (…) never render AAPL content".
  - T011: "tracks the request with a per-effect `cancelled` flag so a response for a symbol that is no longer current is dropped".
  - DEC-0165 (owner-upheld): "A response for a symbol that is no longer current is discarded."
  - The panel is a host-agnostic pattern (plan Summary), and its props contract places no limit on how the host updates `symbol`.
- **Impact**:
  - The inspector shows another stock's symbol, scores and inputs beside the
    newly selected row.
  - It is reachable when the host changes the selection outside a discrete
    event, and the render and commit run past one scheduler frame while the
    previous read is in flight. Examples: a transition, React Router's
    `v7_startTransition`, a selection restored from the URL or after a reload,
    or a timer.
  - Row clicks and key presses are discrete, and their effects flush
    synchronously, so the window does not open for them.
- **Required remediation**:
  - Make a settled read apply only if its own (symbol, attempt) is still the
    current one. For example, check the request key against the latest key
    when the read settles, or store the key with the loaded and failed states
    and render them only when they match `settled`.
  - Add a test that drives the gap and fails on HEAD. The probe's pattern works:
    no `act()`, a default-lane update, and the stale read settled during the
    new selection's commit.

### IR-002 — The loading skeleton is one 64 px bar, not the final layout the card spec asks for

- **Severity**: MEDIUM
- **Scope**: delta (`inspector-panel.tsx:371-375`, changed by the rework under DEC-0251)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/components/patterns/inspector-panel.tsx:373`; `projects/factorflow-v2/decisions/DEC-0251.md`
- **Claim challenged**: DEC-0251's derivation says "no artifact sets its height", and on that basis picks `h-8` as the nearest token to the old 96 px.
- **Observed evidence**: The loading body is one `output` of `h-8` (`var(--space-8)`, 64 px). The loaded inspector has the symbol, name, memberships line, three factor blocks, the link and the footnote, so the card resizes on load. UX design 1.1's component mapping makes the Inspector a `card` `summary` with `design-system/components/card/design-spec.md` as its spec. That spec says, in §4, "**Loading:** show a skeleton matching the final layout, so the card does not resize on load", and, in §8, "Skeleton to the final layout | Let the card jump in size on load".
- **Expected evidence/behavior**: A skeleton shaped like the loaded inspector, built from token classes (STD-UI-29). Alternatively, the owner records that the inspector departs from card spec §4.
- **Impact**: The inspector jumps in size each time a selected stock loads. Its content's height varies by stock, so no exact match exists.
- **Required remediation**: Owner question, to be answered when DEC-0251 is confirmed: should the skeleton approximate the loaded layout, or does the single `h-8` bar stand as an accepted departure from card spec §4? Record the answer. If the skeleton is to change, build it from spacing-scale classes and pin its parts.

### IR-003 — The explanation box's corner is neither `--radius` nor pinned

- **Severity**: LOW
- **Scope**: late (`inspector-panel.tsx:255-258` is unchanged since the baseline)
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007, T012
- **Files**: `web/src/components/patterns/inspector-panel.tsx:257`; `inspector-panel.test.tsx:790`; `tailwind.config.js` (no `borderRadius`)
- **Claim challenged**: The box follows UX design 1.1 item 4.
- **Observed evidence**:
  - The box uses `rounded`. The built CSS gives `.rounded{border-radius:.25rem}`, Tailwind's default. `design-system/theme.css` defines `--radius: 0.5rem`, and no class maps it.
  - The test pins only `border border-border`, so the late mutant `box-unrounded` survives.
  - The same `rounded` is the delivered convention for cards and buttons. Card design-spec §6 and button design-spec both name `--radius` too, so this is a codebase-wide gap. The rework's spec-drift review flagged it, but no decision records it.
- **Expected evidence/behavior**: UX design 1.1 item 4: "bordered (`--border`, `--radius`)". STD-UI-29: no size literal outside the theme.
- **Impact**: The box's corner, and every delivered card's and button's, is 4 px where the theme says 8 px.
- **Required remediation**: None required in this story. Mapping `--radius` in `tailwind.config.js` is outside DEC-0084's edit set. Raise it to the owner as a theme follow-up. Once it is mapped, pin the token class on the box.

### IR-004 — The inspector restates `FactorCell`'s private state choice and *Not followed* badge (v1 IR-005)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T012
- **Files**: `web/src/components/patterns/inspector-panel.tsx:102-132, 159-172`; compare `factor-cell.tsx`
- **Claim challenged**: T009: "If S3 exports its Incomplete-sentence builder …, import it rather than writing a second".
- **Observed evidence**: Unchanged since v1. S3 exports no builder, and T013 forbids editing `factor-cell.tsx`. The cycle-4 evidence records a follow-up for a story that may edit it.
- **Expected evidence/behavior**: One source for the cell state (DEC-0151, DEC-0247).
- **Impact**: A later change to `FactorCell`'s state order can make the box explain a factor the cell draws differently.
- **Required remediation**: None required in this story. Carry the follow-up to a story that may edit `factor-cell.tsx`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `count-after-compare`, `name-above-symbol`, `memberships-after-blocks`, `inputs-before-cell` and `box-after-link` are all killed in this run. Tests: `selection-tray.test.tsx:150-162`; `inspector-panel.test.tsx:587-637` |
| v1/IR-002 (HIGH) | RESOLVED | `compare-link-unstyled`, `add-unstyled`, `see-link-unstyled` and `card-no-classes` are killed. Tests: `selection-tray.test.tsx:104, 210`; `inspector-panel.test.tsx:183, 238, 265, 639-642, 974`. The `data-variant` survivors stay equivalent |
| v1/IR-003 (MEDIUM) | RESOLVED by owner decision | DEC-0249 (`decided_by: owner`, 2026-10-31): the tray stays as built and CAP-002-E4-S9 announces the first selection. No code change. DEC-0249 is `propagating` with `propagated_after: null`, so E4-S9's plan still has to take it up |
| v1/IR-004 (MEDIUM) | RESOLVED | The skeleton is `h-8` (`var(--space-8)`) and the swatch `rounded`. `git grep` finds no `h-24` or `rounded-sm` in `web/src`. Pinned by exact class assertions at `inspector-panel.test.tsx:248, 652`, so reverting either class fails them. Choice recorded in DEC-0251 (open, provisional). See IR-002 and IR-003 for what remains |
| v1/IR-005 (LOW) | STILL OPEN | Carried as IR-004 |
| v1/IR-006 (LOW) | RESOLVED, with a regression | The one-render flash v1 described is gone. The reset is now derived during render (`:313-319`), pinned by the commit probes (`inspector-panel.test.tsx:333-388`), and `reset-always-idle`, `reset-ignores-symbol`, `reset-ignores-attempt`, `settled-not-updated` and `initial-idle` are killed. Moving the reset out of the effect introduced IR-001 |
| v1/IR-007 (LOW) | RESOLVED | **Try again** focuses the `section` (`tabIndex={-1}`, no tab stop, as card design-spec §4 requires), and focus holds through *loading* and *loaded* (`inspector-panel.test.tsx:317-331`). `retry-focuses-button-parent` and the `tabIndex` mutant are killed. Choice recorded in DEC-0250 (open, provisional) |
| v1/IR-008 (LOW) | RESOLVED | Cycle 3's `green_evidence` now reads 51 and 317, matching `green-cycle-3.log` |

## Scope and Plan Deviations

- **Justified additions in the rework, each traced to a v1 finding:**
  - the **Try again** focus and `tabIndex={-1}` (IR-007, DEC-0250);
  - the render-phase reset (IR-006);
  - `h-8` and `rounded` (IR-004, DEC-0251);
  - no tray change (IR-003, DEC-0249).
- **Decisions awaiting the owner:**
  - DEC-0250 and DEC-0251 are open provisional agent decisions.
  - DEC-0249 is owner-decided but still `open`, with propagation to E4-S9 pending.
  - DEC-0251's derivation misses card design-spec §4 (IR-002).
- **Bookkeeping:**
  - T011 and T012 still say "the loading half of T008", as noted in v1.
  - The plan does not mention DEC-0250's focus behaviour. The evidence records it.
- **Out-of-scope changes:** none. The rework changed only the three web files,
  the task plan's metadata, the TDD evidence and its cycle-4 files.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Rework with this report and `CAP-002-E4-S7-tasks.md`:
  - resolve IR-001 with a test that fails on HEAD;
  - put IR-002's skeleton question to the owner with DEC-0251, or reshape the
    skeleton.

  Then rerun this review (v3) with `CAP-002-E4-S7-implementation-review-v2-mutation.json`
  as `scope --previous`.
- **Warnings accepted downstream**: N/A
