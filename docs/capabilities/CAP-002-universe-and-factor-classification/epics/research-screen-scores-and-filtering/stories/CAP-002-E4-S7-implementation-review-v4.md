---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S7-implementation-review
artifact_type: implementation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E4-S7"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 4
reviewed_at: "2026-11-01T01:47:38Z"
reviewed_head: "23fb3f4937a5295f7a6d827a851d13ecfec2ee0b"
review_base: "8ec2a736136dd3f743fb22ac1b7eac771e28d032"
reviewed_state_revision: "sha256:a2eb81aaec235b389c916fa6be4dbe48125d864bcdb1245d986a819e954f868d"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-01T01:47:38Z
  source_artifacts:
    - id: CAP-002-E4-S7
      version: "1 (sha256:f03e846a8f59b235a15574c791de680002a3454b84b0e2cab67f807166e2d01a)"
    - id: CAP-002-E4-S7-tasks
      version: "1 (updated 2026-10-31, last_reworked_review v3)"
    - id: CAP-002-E4-S7-tdd-evidence
      version: "cycle-1 to cycle-6"
    - id: CAP-002-E4-S7-implementation-review
      version: "3 (baseline; reviewed_head 9deeeef0d15446bb2ab1ac4c54887924e3c27b9e)"
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
    - id: DEC-0247
      version: "upheld, applied"
    - id: DEC-0249
      version: "owner-decided 2026-10-31 (status open)"
    - id: DEC-0250
      version: "open, provisional (triage accepted)"
    - id: DEC-0251
      version: "upheld 2026-11-01 (blind, agreed; uncommitted in harness)"
    - id: DEC-0262
      version: "owner-decided 2026-11-01 (status open; uncommitted in harness)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S7 — Version 4

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 5/5 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 8/8 passed |

This re-review covers rework commit `23fb3f4` against the v3 baseline
(`reviewed_head` `9deeeef`). Between the two, only the v3 report commit
`14c4522` and the rework landed. The rework changes one production line (the
explanation box's corner class), the inspector's test file, the plan's
`last_reworked_review` and the TDD evidence (cycle 6).

- **What the rework fixed.**
  - **v3 IR-001 (HIGH) is resolved.** Two new tests settle a stale failure
    *after* the current read has settled (`inspector-panel.test.tsx:437-467`):
    - AAPL→MSFT, with MSFT loaded first;
    - AAPL→MSFT→AAPL, with the fresh AAPL read loaded first.

    The baseline survivor `manual:review:fail-unguarded` is now killed, and
    each of the two tests kills it on its own (mutant log: 2 failed, 420
    passed). In the second test both reads carry the key (AAPL, 0), so only
    the failure branch's `cancelled` guard can drop the late failure.
  - **v3 IR-002 (LOW) is resolved.** Each of the four act()-free race tests now
    counts the panel's commits after the move and requires two
    (`:525-532`, `:548`, `:552-553`). The reviewer closed the race by swapping
    `startTransition` for `flushSync` in a scratch clone. All four tests then
    fail with `expected 1 to be 2`.
  - **v3 IR-003 (LOW) is resolved by owner decision DEC-0262.**
    - The box now takes `rounded-[var(--radius)]` (`inspector-panel.tsx:264`).
    - The swatch keeps `rounded`, as DEC-0251 decided.
    - The built CSS has `.rounded-\[var\(--radius\)\]{border-radius:var(--radius)}`
      and `--radius: .5rem`.
    - No theme or Tailwind file changed.
    - The test pins the class and the absence of plain `rounded` (`:942-945`).
- **Every required command passes when rerun:**
  - the focused suites, 512 tests;
  - the full web suite, 1335 tests in 60 files;
  - lint, the format check, `tsc --noEmit` and the build.

  The TDD-evidence lint is clean. `cycle-6.patch` replays onto `14c4522` to
  HEAD's three changed files byte for byte.
- **Non-blocking findings:**
  - **IR-001 (MEDIUM, late).** A reviewer mutant survives:
    `fail-keeps-loaded`, under which a failure never replaces `loaded`
    content. No test drives the new selection's own read *failing* after a
    stale success settled in the commit gap. A reviewer probe shows the
    mutant is not equivalent: the panel stays on the skeleton forever. HEAD's
    code is correct. The mutated line is unchanged since the baseline, so the
    finding is `late` and cannot block.
  - **IR-002 (LOW, carried).** v1 IR-005 is still open.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S7-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same) at `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S7` |
| HEAD | `23fb3f4937a5295f7a6d827a851d13ecfec2ee0b` |
| Review base | `8ec2a73` (supplied by the driver) → `8ec2a736136dd3f743fb22ac1b7eac771e28d032` (`pipeline-state.py review-base --base-ref 8ec2a73`; an ancestor of HEAD and equal to `git merge-base HEAD 8ec2a73`) |
| Working tree | clean (`git status --porcelain -uall` empty before and after) |
| Changed files reviewed | 49 since the base: 6 web files, the story, the plan, the TDD evidence, 34 evidence files, and the v1 to v3 reports with their mutation files. Since the baseline, 12 files changed: the v3 report and its mutation file (`14c4522`), and 10 files in the rework (`23fb3f4`) |
| Baseline | v3 (`CAP-002-E4-S7-implementation-review-v3.md`, CHANGES-REQUIRED), `reviewed_head` `9deeeef0d15446bb2ab1ac4c54887924e3c27b9e`, with `-v3-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/selection-tray.tsx` | added (unchanged since baseline) | DAC-E4-S7-1, AC-16; T009, T010 |
| `web/src/components/patterns/selection-tray.test.tsx` | added (unchanged since baseline) | TC-COMP-140; T001, T002 |
| `web/src/components/patterns/inspector-panel.tsx` | added. The rework changes the box's class to `rounded-[var(--radius)]` and adds a comment citing DEC-0262 (`:261-264`) | DAC-E4-S7-2/3/4, AC-16; T011, T012; v3 IR-003 |
| `web/src/components/patterns/inspector-panel.test.tsx` | added. The rework adds two stale-failure tests (`:437-467`), a commit count in the race block (`:479-483`, `:488`, `:498`, `:525-532`, `:548`, `:552-553`), and the box's corner assertion (`:942-945`) | TC-COMP-141/142/143; T007, T008; v3 IR-001, IR-002, IR-003 |
| `web/src/screens/research/copy.ts`, `copy.test.ts` | modified (unchanged since baseline; the diff against `8ec2a73` holds only the story's additions) | T009 |
| `.../stories/CAP-002-E4-S7.md` | modified: the `status:` line only (unchanged since baseline) | T013 |
| `.../stories/CAP-002-E4-S7-tasks.md` | modified. The rework sets `last_reworked_review: …-v3.md` | T015 bookkeeping |
| `.../stories/CAP-002-E4-S7-tdd-evidence.yaml` | added. The rework adds cycle 6 | T015 |
| `.../stories/CAP-002-E4-S7-evidence/` (34 files). The rework adds `cycle-6.patch`, `red-`, `green-`, `full-suite-cycle-6.log`, `mutants-cycle-6.json` and `mutation-cycle-6-results.json` | added | T015 |
| `.../stories/CAP-002-E4-S7-implementation-review-v1.md` to `-v3.md`, and their `-mutation.json` files | added (review commits) | the earlier reviews |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `selection-tray.tsx` `SelectionTray`; `inspector-panel.tsx` `InspectorPanel` | both test files | This story's slice is the selection controls. *Within a single universe* depends on the Members-tab mount, which is unassigned (plan Open Gap 8) |
| DAC-E4-S7-1 | SATISFIED | `selection-tray.tsx:9-10` (`COMPARE_MIN`/`COMPARE_MAX`, DEC-0070), `:51`, `:60-86` | `selection-tray.test.tsx:51-117` | Unchanged since baseline. All six tray operator mutants are killed |
| DAC-E4-S7-2 | SATISFIED | `inspector-panel.tsx:329-352` (one `setTimeout(INSPECT_DEBOUNCE_MS)`, cleared on change and unmount; each callback guarded by its effect's `cancelled`), `:359-365` (key check), `:81-106` `inputsLine` | `inspector-panel.test.tsx:130-176, 668-683`; stale reads `:391-586` | One read 150 ms after the selection settles, and each input with its `as_of` and `known_on`. A stale success or failure is now pinned in both windows: before the current read settles, and after it |
| DAC-E4-S7-3 | SATISFIED | `inspector-panel.tsx:323-326` (render-phase reset), `:330-332`, `:362-363`, `:397` | `inspector-panel.test.tsx:178-229`, `:569-573` | Unchanged since baseline |
| DAC-E4-S7-4 | SATISFIED | `inspector-panel.tsx:181-208` `MembershipsLine` | `inspector-panel.test.tsx:685-736` | Unchanged since baseline |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `selection-tray.test.tsx:51-117` | Unchanged since baseline |
| T002 | complete | VERIFIED | `selection-tray.test.tsx:119-219` | Unchanged since baseline |
| T003 | complete | VERIFIED | `inspector-panel.test.tsx:130-176, 668-683` | — |
| T004 | complete | VERIFIED | `inspector-panel.test.tsx:178-229` | — |
| T005 | complete | VERIFIED | `inspector-panel.test.tsx:685-736` | — |
| T006 | complete | VERIFIED | `inspector-panel.test.tsx:738-926` | — |
| T007 | complete | VERIFIED | `inspector-panel.test.tsx:928-1144` | The box asserts `rounded-[var(--radius)]` and not `rounded` (`:942-945`). `box-rounded-4px`, `box-radius-literal`, `box-unrounded` and the re-made `box-after-link` are all killed |
| T008 | complete | VERIFIED | `inspector-panel.test.tsx:231-611` | The stale-failure gap from v3 is closed (`:437-467`). One late test gap remains (IR-001) |
| T009 | complete | VERIFIED | `copy.ts`, `copy.test.ts` (S7 lines unchanged since baseline) | — |
| T010 | complete | VERIFIED | `selection-tray.tsx` (unchanged since baseline) | v1's justified deviation (a `section` instead of a `div role="region"`) stands |
| T011 | complete | VERIFIED | `inspector-panel.tsx:314-365` | Unchanged since baseline. Both `cancelled` guards (`:337`, `:342`) are now pinned. The **Try again** focus (DEC-0250) is a justified addition |
| T012 | complete | VERIFIED | `inspector-panel.tsx:68-281` | The box corner follows UX design 1.1 item 4 (`--radius`) under DEC-0262 |
| T013 | complete | VERIFIED | `git diff --name-status 8ec2a73..HEAD -- web` lists only the six files. `git grep` finds no importer of either pattern outside its own test, no `dangerouslySetInnerHTML`, and no `results-table` import. `dependencies.yaml`, `factor-cell.tsx`, `restated-mark.tsx`, `web/src/index.css`, `tailwind.config.js` and `design-system/` are unchanged | — |
| T014 | complete | VERIFIED | The built `assets/index-CebuWwwS.css` has: `.bg-foreground`, `.text-background`, `.bg-status-neutral-muted`, `.text-xs`, `.text-xl`, `.font-numeric`, `.h-8{height:var(--space-8)}`, `.border-border`, `.animate-pulse`, `.sr-only`, `.rounded-\[var\(--radius\)\]{border-radius:var(--radius)}`, `--radius: .5rem`, and `--factor-value:`, `--factor-growth:`, `--factor-momentum:`. It has no `.h-24` or `.rounded-sm` | — |
| T015 | complete | VERIFIED | `check-tdd-evidence.py … --base 8ec2a736… --require-logs`: 0 errors, 0 warnings. `cycle-6.patch` SHA-256 equals its `diff_sha256` `4389dd16…`. The red, green, full-suite and mutation-results hashes match. `cycle-6.patch` applied to `14c4522` gives HEAD's `inspector-panel.tsx`, `inspector-panel.test.tsx` and `-tasks.md` byte for byte | Cycle 6 is `commit_hash: stage`, carried by `23fb3f4`, whose trailer block holds `Decision-Id: DEC-0262` with `Co-Authored-By` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `selection-tray.test.tsx` TC-COMP-140 | ADEQUATE | Blocked at 1, 7 and 8: tag, variant, `aria-disabled`, not `disabled`, focus by Tab, the reason by `aria-describedby`, no navigation. Enabled at 2, 3 and 6: anchor, exact `href`, outline classes | — (`compare-link-no-variant` and `blocked-unstyled` are equivalent, as in v1 to v3) |
| `selection-tray.test.tsx` tray behaviour / T002 | ADEQUATE | Empty at 0; the region; the polite count, first; encoding; the Add seam | — |
| `inspector-panel.test.tsx` TC-COMP-141 | ADEQUATE | No read at 0 or 149 ms, one at 150 ms, none after; one read per burst; dates printed | — |
| `inspector-panel.test.tsx` TC-COMP-142 | ADEQUATE | Exact sentence, no read, no other content; the card classes; an in-flight read or failure is discarded on clearing | — |
| `inspector-panel.test.tsx` TC-COMP-143 | ADEQUATE | *In no universe*; links, order, joins, encoding | — |
| `inspector-panel.test.tsx` loading, failure, Try again, out-of-order / T008 (`:231-467`, `:588-611`) | ADEQUATE | Skeleton and its tokens; refusal and network sentences; **Try again** re-reads once and focuses the section; commit probes. A stale success or failure settling before the current read (`:391-408`, `:424-435`) and after it (`:410-422`, `:437-467`). `fail-unguarded`, `load-unguarded`, `cleanup-keeps-flag`, `no-cancel-flag` and both `if (cancelled)` negations are killed | — |
| `inspector-panel.test.tsx` race tests (`:469-586`) | ADEQUATE | No `act()`, a concurrent root, real timers, a transition, and a sibling layout effect that settles AAPL's read and holds the commit. Each test now requires two commits of the panel after the move, which proves that the stale read's `setState` ran before the cleanup. Passed six consecutive runs and every mutation baseline (4 parallel workers); fail 4 of 4 when the gap is closed with `flushSync` | No test drives the new selection's own read *failing* after a stale success in the gap (IR-001, late). Observation, not a finding: the commit count also fails 4 of 4 under a behaviour-preserving refactor that checks a ref before `setState`. It fails loudly rather than passing wrongly, which is what v3 IR-002 asked for |
| `inspector-panel.test.tsx` factor blocks / T006 | ADEQUATE | Order of the parts and of each block; swatch tokens and classes (`rounded` pinned, `swatch-token-radius` killed); scores; grouping | — |
| `inspector-panel.test.tsx` explanation box, link, footnote / T007 | ADEQUATE | Sentences equal the cells' titles; absences; retired and restated cases; the box's `rounded-[var(--radius)] border border-border`, and not `rounded`; the link's tag, `href` and classes; the footnote last | — |
| `copy.test.ts` T009 anchors | ADEQUATE | Exact strings | — |

Mocks and isolation are unchanged from v3:

- Only `getStockEvidence` is doubled.
- The top-level `beforeEach` calls `read.mockReset()`.
- The race block installs real timers and sets `IS_REACT_ACT_ENVIRONMENT` to
  false. Its `afterEach` restores the flag and unmounts the root.
- The block's `commits` counter is reset in `beforeEach` and again before each
  move. The first reset is redundant but harmless.

### Mutation run (E.9)

How the mutants were built:

- `mutation-run.py generate --range 8ec2a73..HEAD --cycle review` produced 32
  operator mutants.
- The reviewer added seven hand-written mutants (`manual:review-v4:*`):
  - `box-rounded-4px`, `box-radius-literal` and `box-unrounded` target the
    rework's corner;
  - `box-after-link` re-makes the baseline's `manual:review:box-after-link`,
    whose text no longer applies;
  - `swatch-token-radius` targets DEC-0262's "the swatch keeps `rounded`";
  - `cleanup-keeps-flag` and `fail-keeps-loaded` target the guards the
    rework's tests pin.
- `scope --since 9deeeef --previous …-v3-mutation.json` added the baseline's
  mutants, giving 131: 110 carried, 4 delta and 17 late.
  - Four baseline mutants no longer apply. `inspector-panel.tsx:336` and
    `:341:negate-boolean:1` moved down one line and are regenerated as `:337`
    and `:342`, both killed. `manual:review-v2:box-unrounded` and
    `manual:review:box-after-link` matched the old class string. They are
    replaced by `manual:review-v4:box-unrounded` and
    `manual:review-v4:box-after-link`, both killed.

The run used four clones and the three focused suites. All four baselines
exited 0 (422 tests each).

**Result:** 108 killed, 23 survived, 0 stillborn, 0 timeout (exit 3).

- By scope: carried 95 killed and 15 survived; delta 4 killed; late 9 killed
  and 8 survived.
- The results are saved beside this report as
  `CAP-002-E4-S7-implementation-review-v4-mutation.json`, SHA-256
  `9f25a44ca82fd94be43f59b06c6198bf335df489d48f37b3b9d5cf39a453949a`.

| Survivor | Scope | Mutation | Disposition | Contract |
|----------|-------|----------|-------------|----------|
| `manual:review-v4:fail-keeps-loaded` | late (`:343` unchanged since `9deeeef`) | the failure branch's `setState` keeps a `loaded` state instead of replacing it | **non-equivalent** | T008: a rejected read "replaces the block with the `copy.ts` failure sentence … and a **Try again** button". DEC-0165 (owner-upheld) adds that stale responses are dropped. A reviewer probe moves AAPL to MSFT and settles AAPL's read in the gap, then MSFT's own read rejects. HEAD shows the failure and **Try again**; the mutant keeps the skeleton forever (IR-001) |
| `manual:review-v3:key-ignores-attempt`, `manual:review-v2:reset-ignores-attempt` | carried | key check / reset on `symbol` only | equivalent | As in v3: the two attempt checks cover for each other, and removing both is caught by the Profiler test (`:334-356`). Lines unchanged |
| `manual:review-v3:loaded-key-from-evidence` | carried | key the loaded state by `evidence.symbol` | equivalent | As in v3: classification-api 2.7 returns the row for the path symbol |
| `inspector-panel.tsx:316:off-by-one:1`, `:315`, `:309`, `:308` | late / late / late / carried | `useState(0)` → `useState(1)` for `attempt` (one line, under its current and former ids) | equivalent | As in v1 to v3: the initial value is only ever compared, never shown |
| `inspector-panel.tsx:380:off-by-one:1`, `:379`, `:361` | late / late / carried | `count + 1` → `count + 2` | equivalent | As in v2 and v3: any step gives a new key. T011 and DEC-0165 leave the step open |
| `manual:review-v2:focus-after-retry`, `skeleton-not-block`, `skeleton-no-pulse`, `swatch-not-inline-block`, `settled-initial-null` | carried | as in v2 | equivalent | The dispositions from v2 and v3 hold. The lines are unchanged, and DEC-0250 and DEC-0251 fix only what v2 said |
| `manual:review-v2:skeleton-no-sr-text`, `section-not-flex` | late | as in v2 | equivalent | As in v2 and v3 |
| `manual:review:compare-link-no-variant`, `see-link-no-variant`, `card-no-variant`, `blocked-unstyled`, `sentence-for-scored` | carried | as in v1 | equivalent | As in v1 to v3. `git grep` still finds CSS keyed only on `data-[variant=blocked]` and `data-[variant=secondary]` |

Every other v4 manual mutant is killed:

- `box-rounded-4px`, `box-radius-literal`, `box-unrounded` and
  `box-after-link` are killed by the box test (`:929-981`).
- `swatch-token-radius` is killed by the swatch test (`:796-812`).
- `cleanup-keeps-flag` is killed by `:410-422` and both new stale-failure
  tests.

### Reviewer probes (scratch clone of HEAD, not part of the review subject)

| Probe | Code under probe | Observed | Result |
|-------|------------------|----------|--------|
| `inspector-panel.test.tsx` six consecutive runs | `23fb3f4` | 64 passed each time | GREEN, deterministic here |
| The race block with `startTransition` replaced by `flushSync`, which closes the gap | `23fb3f4` test changed | 4 failed (`expected 1 to be 2`), 60 passed | The IR-002 (v3) gap check works |
| A behaviour-preserving refactor: both callbacks also check a ref holding the current (symbol, attempt), updated in a layout effect | refactor | 4 race tests fail (`expected 1 to be 2`), 60 passed | Observation: the gap check depends on the stale read reaching `setState`. Not a finding |
| AAPL→MSFT; AAPL's read settles in the gap; MSFT's own read rejects | `23fb3f4` / `fail-keeps-loaded` | HEAD: no `status`, **Try again** shown. Mutant: the `<output>` skeleton stays | HEAD correct; the mutant is non-equivalent (IR-001) |

## Independent Validation

All commands ran against `repos/factorflow-v2/FactorFlow-v2` at `23fb3f4`.

- A temporary `node_modules` symlink pointed at the main checkout's
  `node_modules` for the npm, tsc and biome runs. It was created after the
  mutation run, which refuses untracked files, and removed afterwards.
- Vitest, the mutation runner and the probes ran outside the sandbox, as the
  driver directed.
- Lint, format, `tsc`, the build and the CSS search ran inside the sandbox.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <S7> --stage adversarial-review` | harness root | 0 | READY | "review changes were reworked; a new review version is required" |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref 8ec2a73` | harness root | 0 | PASS | `8ec2a736136dd3f743fb22ac1b7eac771e28d032` |
| `npm run test --prefix <repo> -- src/components/patterns/selection-tray.test.tsx src/components/patterns/inspector-panel.test.tsx src/screens/research/copy.test.ts src/components/patterns/factor-cell.test.tsx` | repo root | 0 | PASS | 4 files, 512 tests (copy 334, factor-cell 90, tray 24, inspector 64) |
| `npm run test --prefix <repo> --silent -- --reporter=dot` (`vitest run`) | repo root | 0 | PASS | 60 files, 1335 tests, including the real-build `build-output.test.tsx` |
| `npm run lint` (`biome lint .`) | repo root | 0 | PASS | 139 files, no fixes |
| `npm run format` (`biome format .`, check only) | repo root | 0 | PASS | 139 files, no fixes |
| `npx tsc --noEmit` | repo root | 0 | PASS | strict, `include: ["web/src"]` |
| `npm run build` (`vite build`) | repo root | 0 | PASS | 63 modules; `index-CebuWwwS.css`, `index-OhvKkvAS.js` |
| Search of the built CSS for the patterns' classes, `.rounded-\[var\(--radius\)\]`, the `--radius` and `--factor-*` definitions, `.h-24` and `.rounded-sm` (T014) | repo root | 0 | PASS | All required entries are present; `.h-24` and `.rounded-sm` are absent |
| `python3 scripts/check-tdd-evidence.py --evidence <S7>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 8ec2a736… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `mutation-run.py generate --range 8ec2a73..HEAD`, plus 7 manual mutants; then `scope --since 9deeeef --previous <v3-mutation.json>`; then `run --jobs 4 --command 'test -e node_modules \|\| ln -s <main>/node_modules node_modules; ./node_modules/.bin/vitest run <three focused suites>'` | harness root | 3 (survivors present) | 23 survived / 131 | One non-equivalent survivor, in late scope (IR-001); the rest are equivalent |
| Evidence replay: clone, `git checkout 14c4522`, `git apply cycle-6.patch`, `cmp` against HEAD | scratch clone | 0 | PASS | All three changed files identical |
| Reviewer probes (above), via `vitest run` in the scratch clone | scratch clone | 0 on HEAD; 1 on the changed trees | as tabled | v3 IR-001 and IR-002 resolved; IR-001 (v4) test gap |
| `npm run test:e2e` | — | N/A | NOT RUN | Deferred to Phase 6b by the driver. The plan's Validation Plan also excludes it, because no screen mounts the patterns yet (first importer CAP-002-E4-S9) |

### Validation Side Effects

- **Before:** `usr/alvaro-de-jodra/CAP-002-E4-S7` at `23fb3f4`, an empty
  `git status --porcelain -uall`, and code fingerprint
  `sha256:a2eb81aaec235b389c916fa6be4dbe48125d864bcdb1245d986a819e954f868d`.
- **After:**
  - The same HEAD, an empty status and the same fingerprint.
  - While the temporary `node_modules` symlink existed it showed as untracked
    (`?? node_modules`). It was removed.
  - The build and `build-output.test.tsx` rewrote ignored files under
    `src/factorflow/api/static/`: `index.html` and the hashed `assets/`
    bundles.
  - The mutation clones, logs, the replay clone and the probe clone are in the
    session scratchpad.
- **Unexpected tracked-file changes:** none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | late | No test drives the new selection's own failure after a stale success settles in the commit gap |
| IR-002 | LOW | carried | The inspector restates `FactorCell`'s private state choice and *Not followed* badge (v1 IR-005, v2 IR-004, v3 IR-004) |

### IR-001 — No test drives the new selection's own failure after a stale success settles in the commit gap

- **Severity**: MEDIUM
- **Scope**: late. `mutation-run.py scope` tags the survivor late: the mutated
  line, `inspector-panel.tsx:343`, is unchanged since `9deeeef`. The test gap
  is in the race block, whose scenario the baseline already had. Under H, a
  late test gap is MEDIUM at most and does not make its test `WEAK`.
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S7-2
- **Tasks**: T008
- **Files**:
  - Production, correct at HEAD: `web/src/components/patterns/inspector-panel.tsx:341-345`
    (the failure branch) and `:359-365` (the key check).
  - Tests: `web/src/components/patterns/inspector-panel.test.tsx:575-585`
    covers the success counterpart only.
- **Claim challenged**: T008, in the rework's account, says stale reads never
  change what the panel shows for the current selection, and that a rejected
  read is replaced by its failure sentence and **Try again**.
- **Observed evidence**:
  - The race tests settle AAPL's read inside the gap. The masked
    `loaded`/`failed` state then carries AAPL's key.
  - The fourth test (`:575-585`) then lets MSFT's own read *resolve*. No test
    lets it *reject*.
  - The reviewer mutant `manual:review-v4:fail-keeps-loaded` changes the
    failure branch to
    `setState((prev) => prev.kind === "loaded" ? prev : { kind: "failed", … })`.
    That is a plausible defensive edit ("a failure never overwrites loaded
    content"). It survives all 422 focused tests.
  - Reviewer probe, in a scratch clone: AAPL→MSFT, AAPL's read resolves in
    the gap, then MSFT's read rejects.
    - HEAD shows the failure sentence and **Try again**.
    - The mutant keeps the stale AAPL `loaded` state. The key check renders
      it as a skeleton, which never resolves, because no read remains.
- **Expected evidence/behavior**:
  - T008: a rejected read "replaces the block with the `copy.ts` failure
    sentence … and a **Try again** button".
  - DEC-0165 (owner-upheld): stale responses are dropped, and the failure
    rule replaces the block on error.
  - Adversarial-review E.9: no non-equivalent survivor.
- **Impact**:
  - No production defect today.
  - Such an edit would pass the whole suite. A user who moves the selection
    while a read is in flight, and whose new stock's read then fails, would
    see a skeleton that never resolves and no **Try again**.
- **Required remediation**:
  - Optional, non-blocking. Add a race test in which the new selection's own
    read rejects after a stale success settled in the gap, and assert the
    failure sentence and **Try again**.
  - The test must fail under `manual:review-v4:fail-keeps-loaded`.
  - No production change is required.

### IR-002 — The inspector restates `FactorCell`'s private state choice and *Not followed* badge (v1 IR-005, v2 IR-004, v3 IR-004)

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009, T012
- **Files**: `web/src/components/patterns/inspector-panel.tsx:108-178`; compare `factor-cell.tsx`
- **Claim challenged**: T009: "If S3 exports its Incomplete-sentence builder …, import it rather than writing a second".
- **Observed evidence**:
  - Unchanged since v1.
  - S3 exports no builder, and T013 forbids editing `factor-cell.tsx`.
  - The cycle-6 evidence carries the follow-up ("IR-004 (LOW): no change").
- **Expected evidence/behavior**: One source for the cell state (DEC-0151, DEC-0247).
- **Impact**: A later change to `FactorCell`'s state order can make the box
  explain a factor that the cell draws differently.
- **Required remediation**: None in this story. Carry the follow-up to a story
  that may edit `factor-cell.tsx`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v3/IR-001 (HIGH) | RESOLVED | `inspector-panel.test.tsx:437-467` adds two stale-failure tests that settle after the current read. `manual:review:fail-unguarded` is killed in this run, and each test kills it on its own (mutant log: 2 failed, 420 passed). `cleanup-keeps-flag` is also killed. T008 is `ADEQUATE` for this gap |
| v3/IR-002 (LOW) | RESOLVED | `:479-483`, `:525-532`, `:548`, `:552-553`: each race test requires two commits after the move. In a scratch clone, closing the gap with `flushSync` fails all four tests (`expected 1 to be 2`) |
| v3/IR-003 (LOW) | RESOLVED by owner decision | DEC-0262 (`decided_by: owner`, 2026-11-01T01:29:20Z) gives the box `rounded-[var(--radius)]` and keeps the swatch on `rounded` (DEC-0251), with no theme or Tailwind change. `inspector-panel.tsx:264` applies it, and `:942-945` pins it. The built CSS maps the class to `var(--radius)`, which is `.5rem`. `git diff 8ec2a73..HEAD -- design-system/ tailwind.config.js web/src/index.css` is empty. DEC-0262's question covers only the box, so the card, buttons, skeleton and badge keep `rounded` |
| v3/IR-004 (LOW) | STILL OPEN | Carried as IR-002 |

## Scope and Plan Deviations

- **Justified changes in the rework:**
  - the two stale-failure tests (v3 IR-001);
  - the race block's commit count (v3 IR-002);
  - the box's `rounded-[var(--radius)]` and its comment (v3 IR-003, DEC-0262).

  Lint is clean, and no delivered file changed.
- **Decisions:**
  - **DEC-0262** is owner-decided and binds this story. The record is
    untracked in the harness working tree. It still says `status: open`,
    `owner_reviewed: false` and `commits: []`. The rework commit carries
    `Decision-Id: DEC-0262`, so the record's `commits` and status need
    updating when the driver commits it.
  - **DEC-0251** is owner-upheld (blind, agreed). The upheld record is still
    uncommitted in the harness.
  - **DEC-0250** is still an open provisional agent decision, with triage
    accepted.
  - **DEC-0249** is owner-decided but `open`, with propagation to E4-S9
    pending.
  - **DEC-0247** is upheld and applied.
- **Bookkeeping:**
  - T011 and T012 still say "the loading half of T008", as noted since v1.
  - The plan does not mention DEC-0250's focus behaviour, the read key or
    DEC-0262. The TDD evidence records all three.
- **Out-of-scope changes:** none.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run doc sync for CAP-002-E4-S7 with this report and
  `CAP-002-E4-S7-tasks.md`. Before that, the driver commits this report, its
  `-v4-mutation.json`, and the harness decision records DEC-0251 and
  DEC-0262.
- **Warnings accepted downstream**: IR-001 (MEDIUM, late; optional race test
  for the new selection's own failure after a stale success), IR-002 (LOW,
  carried; the `FactorCell` state-choice follow-up)
