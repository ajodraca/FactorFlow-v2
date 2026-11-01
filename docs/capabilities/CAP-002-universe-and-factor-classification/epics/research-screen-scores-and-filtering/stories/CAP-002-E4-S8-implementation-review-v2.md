---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S8-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E4-S8"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-31T18:10:38Z"
reviewed_head: "957b78a8d42dd62d975e39c86b880cafcf2c64f6"
review_base: "f4deee3e319a7f7ef536df83d85d212b0fbf623f"
reviewed_state_revision: "sha256:c3d4eb51160de17ebe26d414fbbe04a260a2987e3d1d88f27bc523fb17013625"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E4-S8
    artifact_version: 1
    content_revision: sha256:51ac60dc6f774646fe66d84b1668a3193ebd2e4a433e9d4514c6809c9eee205f
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-31T18:10:38Z
  source_artifacts:
    - id: CAP-002-E4-S8
      version: "1 (sha256:51ac60dc6f774646fe66d84b1668a3193ebd2e4a433e9d4514c6809c9eee205f)"
    - id: CAP-002-E4-S8-tasks
      version: "1 (sha256:666276dd53c79ec0b75aa26917c7ecfcea1ca4ea563e8cf78d49436b68aa4c4b)"
    - id: CAP-002-E4-S8-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-002-E4-S8-implementation-review
      version: "1 (baseline, reviewed_head 28f5c45)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0167
      version: "upheld 2026-10-18"
    - id: DEC-0168
      version: "upheld 2026-10-18"
    - id: DEC-0169
      version: "upheld 2026-10-18, amended E4-F21"
    - id: DEC-0257
      version: "owner 2026-10-31"
    - id: DEC-0258
      version: "owner 2026-10-31"
    - id: DEC-0259
      version: "owner 2026-10-31"
    - id: design-system dialog, toast, button, form, input, select specs
      version: "current on origin/main f4deee3"
    - id: STD-UI (ui-conventions)
      version: "current on origin/main f4deee3"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S8 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 4 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 8/8 passed |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 4 · **total 5**

This is the re-review of rework commit `957b78a`. The baseline is review v1,
which reviewed `28f5c45`. The rework resolves all four v1 findings:

- **v1 IR-001.** The three surviving mutants are now killed. The
  `plain-anchor` mutant is re-expressed against the changed `Link` line.
- **v1 IR-002.** The dialogs follow the CAP-002 token map (DEC-0257).
- **v1 IR-003.** `Esc` dismisses a focused notice, and at most three notices
  show at once (DEC-0258).
- **v1 IR-004.** The frame draws an overlay. The confirm shows a visible
  pending state. Cancel, `Escape` and the overlay do nothing while a request
  is pending (DEC-0259).

I reran every required command and all of them pass. The four focused suites
run 418 tests and the full suite runs 1176 in 56 files. Lint, format,
`tsc --noEmit`, the build, the built-CSS class check and the TDD-evidence
lint (0 errors, 0 warnings) also pass. The cycle-4 patch applied to
`ec8c8b2` reproduces HEAD's `web/` tree exactly. Its SHA-256 equals the
cycle's `diff_sha256`.

My mutation run had 136 mutants: 60 generated, 23 of my own and the
baseline's carried set. 128 were killed and 8 survived. The 8 survivors are
four distinct mutants, each run once under its old id and once under its new
line. All four are equivalent, and v1 already judged them so.

No acceptance criterion, task, mandatory test or validation command fails.

Five non-blocking findings remain, all in the new overlay, scope and notice
behaviour:

- **IR-001** (MEDIUM): the overlay's stacking depends on where the host puts
  it in the DOM. CAP-002-E4-S9's plan renders the persistent notice region
  after the dialogs, so notices would sit above the overlay and could still
  be clicked.
- **IR-002** to **IR-005** (LOW): focus falls to `body` when a Save dialog
  closes under a universe scope; a held notice is announced again when it
  returns; a host-driven unmount still drops an Add failure; one test title
  is stale.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S8` |
| HEAD | `957b78a8d42dd62d975e39c86b880cafcf2c64f6` (commits since base: `28f5c45` story-coding, `ec8c8b2` review v1, `957b78a` rework 1) |
| Review base | `origin/main` = merge base `f4deee3e319a7f7ef536df83d85d212b0fbf623f` (`pipeline-state.py review-base --base-ref origin/main`; ancestor of HEAD confirmed) |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation. A temporary `node_modules` link was untracked while it existed and has been removed (see Validation Side Effects). |
| Changed files reviewed | 36 since the base (32 added, 4 modified); 17 since the baseline `28f5c45` |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `28f5c45be59a54adeca90ba2df9df71c7bdb810b`, with `CAP-002-E4-S8-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/notices.tsx` | added (reworked) | DAC-E4-S8-3, DAC-E4-S8-5; T010; DEC-0168, DEC-0258 |
| `web/src/screens/research/notices.test.tsx` | added (reworked) | T009; v1 IR-001, IR-003 |
| `web/src/screens/research/dialog-frame.tsx` | added (reworked) | T012; DEC-0257, DEC-0259 (overlay, `ConfirmProgress`) |
| `web/src/screens/research/save-as-universe-dialog.tsx` | added (reworked) | AC-2, AC-5, DAC-E4-5, DAC-E4-S8-1 to -4; T013; DEC-0257, DEC-0259 |
| `web/src/screens/research/save-as-universe-dialog.test.tsx` | added (reworked) | T001 to T004, T006, T007 (TC-COMP-008 to 011); v1 IR-002, IR-004 |
| `web/src/screens/research/add-to-universe-dialog.tsx` | added (reworked) | DAC-E4-S8-5; T014; DEC-0257, DEC-0259 |
| `web/src/screens/research/add-to-universe-dialog.test.tsx` | added (reworked) | T005, T008 (TC-COMP-033); v1 IR-001, IR-002, IR-004 |
| `web/src/screens/research/copy.ts` | modified (unchanged since v1) | T011: `DIALOGS.enterName`, `DIALOGS.universe`, `NOTICES.dismiss` |
| `web/src/screens/research/copy.test.ts` | modified (unchanged since v1) | T011: one anchor per new string |
| `docs/.../stories/CAP-002-E4-S8.md` | modified (unchanged since v1) | `status:` line only (T015) |
| `docs/.../stories/CAP-002-E4-S8-tasks.md` | modified | Checkboxes (v1); the rework adds `updated: 2026-10-31` and `last_reworked_review: CAP-002-E4-S8-implementation-review-v1.md` to the frontmatter only |
| `docs/.../stories/CAP-002-E4-S8-tdd-evidence.yaml` | added | T017; cycle-4 appended for the rework |
| `docs/.../stories/CAP-002-E4-S8-evidence/` (22 files: four cycle patches, RED, GREEN and full-suite logs, mutants and results per cycle) | added | T017; cycle-4 adds `cycle-4.patch`, `red-cycle-4.log`, `green-cycle-4.log`, `full-suite-cycle-4.log`, `mutants-cycle-4.json`, `mutation-cycle-4-results.json` |
| `docs/.../stories/CAP-002-E4-S8-implementation-review-v1.md`, `-v1-mutation.json` | added (`ec8c8b2`) | Review v1, the baseline of this review |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-2 | SATISFIED | `save-as-universe-dialog.tsx:169` posts `createUniverse({ name: trimmed, filter: toThresholds(query), setId })`, taken from the snapshot made when the dialog opened (`:68`, `:117`) | `save-as-universe-dialog.test.tsx:296-323` (real client and `toThresholds` through a stubbed `fetch`), `:495-530` | This story covers the client half. The fixed membership is the server's snapshot (CAP-002-E1). |
| AC-5 | SATISFIED | `save-as-universe-dialog.tsx:51, 57-81`: `blocked` at zero matches, focusable, with its reason; no dialog and no request | `save-as-universe-dialog.test.tsx:147-189`; an empty name sends nothing (`:560-573`); `empty_universe` shows its sentence (`:584-625`) | |
| DAC-E4-5 | SATISFIED | As AC-2 and AC-5: the same `toThresholds(query)` object the list read uses, plus the on-screen `setId` | `save-as-universe-dialog.test.tsx:296-323`: the exact body, including `symbol: null` present and `hide_incomplete: false` | |
| DAC-E4-S8-1 | SATISFIED | `save-as-universe-dialog.tsx:57-81` | `save-as-universe-dialog.test.tsx:147-189` | Under a universe scope the container is still empty when no dialog is open (`:215-231`). |
| DAC-E4-S8-2 | SATISFIED | `toThresholds` carries `symbol`; the description comes from `describeQuery` (`save-as-universe-dialog.tsx:146-152`) | `save-as-universe-dialog.test.tsx:296-393` | |
| DAC-E4-S8-3 | SATISFIED | `save-as-universe-dialog.tsx:173-177`; `notices.tsx:42-44, 104-120` | `save-as-universe-dialog.test.tsx:397-432`; router navigation `notices.test.tsx:194-212` | The router `Link` is now pinned (v1 IR-001). |
| DAC-E4-S8-4 | SATISFIED | `save-as-universe-dialog.tsx:196-197, 256-271` | `save-as-universe-dialog.test.tsx:436-494`: the sentence equals the `copy.ts` export, Save is gone, Review sits in its slot with `--primary`, and it closes without a request | |
| DAC-E4-S8-5 | SATISFIED | `add-to-universe-dialog.tsx:147-165, 174-186` | `add-to-universe-dialog.test.tsx:194-255`: with and without the already-member clause, counted from the response; the `universe_retired` wording in an alert, Add still available | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:146-247` | The outline border is now `border-input` (DEC-0257). The universe-scope case still renders an empty container (`:215-231`). |
| T002 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:250-393` | Unchanged since v1. |
| T003 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:396-432` | Unchanged since v1. |
| T004 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:435-530` | Now also pins Review's `--primary` classes. |
| T005 | complete | VERIFIED | `add-to-universe-dialog.test.tsx:194-255` | The alert class is `--destructive`. |
| T006 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:532-802` | Owner-directed change (DEC-0259): the two tests that pinned closing mid-request and a dropped late failure were replaced. Their replacements check that the dialog stays open on Escape, Cancel and the overlay, the pending state, and the scope-change paths. The test title at `:575` is stale (IR-005). |
| T007 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:804-965` | Adds the overlay tests (`:884-908`). The surface and confirm classes follow DEC-0257. |
| T008 | complete | VERIFIED | `add-to-universe-dialog.test.tsx:257-865` | v1 PARTIAL resolved. No Name field while the list loads (`:275-320`). A Tab cycle in both directions, including the `select` (`:639-662`). Pending lock, progress, and the unmount driven by the host (`:664-806`). |
| T009 | complete | VERIFIED | `notices.test.tsx:48-278` | v1 PARTIAL resolved. Router navigation (`:194-212`), Esc (`:214-250`), three newest (`:252-272`). |
| T010 | complete | VERIFIED | `notices.tsx:1-135` | DEC-0258 additions: `MAX_SHOWN = 3` (`:23`) and `slice(-3)` (`:104`). `dismissOnEscape` is on the link and on Dismiss (`:85-91, 117, 124`). DEC-0168's "no timer" is kept. The v1 justified deviations (`output`/`span`, extra exports) still hold. |
| T011 | complete | VERIFIED | `copy.ts`, `copy.test.ts` (unchanged since v1) | As v1. |
| T012 | complete | VERIFIED | `dialog-frame.tsx:1-139` | Justified deviations, owner-directed: `--popover` surface and text (DEC-0257) instead of the plan's `bg-background`; an `aria-hidden` overlay that blocks the pointer (`:91-98`) and a `ConfirmProgress` export (`:128-139`) (DEC-0259). Recorded in cycle-4. |
| T013 | complete | VERIFIED | `save-as-universe-dialog.tsx:1-276` | Justified deviation (DEC-0259): under a universe scope only the control is hidden. A pending dialog stays mounted until its result arrives (`:55-89, 133-137`). The confirm is `--primary` (`:95-96`). |
| T014 | complete | VERIFIED | `add-to-universe-dialog.tsx:1-305` | `cancel` guard (`:193-197`), pending cues (`:283, 292-298`), `--destructive` errors. |
| T015 | complete | VERIFIED | `git diff --name-status f4deee3..HEAD` | No delivered file changed except `copy.ts` and `copy.test.ts`, and those only by additions. Only the dialogs and the tests import the new files. `render.test.tsx` passes. |
| T016 | complete | VERIFIED | Commands 2 to 7 | Every class the rework adds is present in the fresh `index-DyXerSmu.css` (command 7). |
| T017 | complete | VERIFIED | `CAP-002-E4-S8-tdd-evidence.yaml`; command 8 | cycle-4 appended with `commit_hash: stage`. Every cited hash matches its file. The cycle-4 patch composes from `ec8c8b2` to HEAD. Whether the cited sub-agent reviews were independent cannot be verified from the repository. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| "TC-COMP-008" / TC-COMP-008 | ADEQUATE | Exact attributes, focusability, reason wiring, no dialog and no request on activation, and the scope and count rules. Every generated mutant on these lines was killed. | none |
| "TC-COMP-009" / TC-COMP-009 | ADEQUATE | Captures the real request body through `fetch`; compares the description lines with `describeQuery`. | none |
| "TC-COMP-010" / TC-COMP-010 | ADEQUATE | The notice as a real `NoticeRegion` renders it; the server's count and name; encoding; focus return. | none |
| "TC-COMP-011" / TC-COMP-011 | ADEQUATE | The sentence equals the export; the DOM slot; focus continuity; the snapshot taken at open; the Review token. `review-submits-v2` was killed. | none |
| "TC-COMP-033" / TC-COMP-033 | ADEQUATE | The clause on and off, counted from the response; the chosen universe's name and link; the retired sentence. | none |
| T006 "refusals, validation and request hygiene" | ADEQUATE | Field errors and alerts; the DEC-0259 lock on Escape, Cancel and the overlay; progress shown in place; failure kept and success closing after the scope changes. All `save-*` delta mutants were killed. | Title at `:575` (IR-005); no focus assertion after a close under a universe scope (IR-002) |
| T007 "dialog frame" | ADEQUATE | Frame semantics and tokens; overlay markup, its close and that it never takes focus; the Tab cycle; Escape. `overlay-*`, `popover-surface` and `spinner-not-motion-safe` were killed. | Stacking against host content cannot be shown in jsdom (IR-001) |
| T008 "states and routes" | ADEQUATE | v1 survivors `name-shown-while-loading` and `trap-skips-select` killed; the `add-*` delta mutants were killed. | none |
| T009 `notices.test.tsx` | ADEQUATE | `plain-anchor-v2` killed by router navigation; the `esc-*` and `stack-*` mutants were killed; the off-by-one on `MAX_SHOWN` was killed. | none |
| `copy.test.ts` anchors | ADEQUATE | Unchanged; reviewer mutants `copy-universe-label` and `copy-enter-name` were killed. | none |

All tests run in jsdom with doubled or stubbed network calls. Deferred
promises stand in for real time, and the tests render under `StrictMode`. The
new "Host closes" control exercises the unmount path the Add dialog's mounted
flag exists for. The full suite was green. A rerun of the focused suites under
the mutation runner's baseline passed in all 8 workers, so no order dependence
was seen.

**Mutation run (E.9).** I ran `generate` over `f4deee3..HEAD`. It produced 60
mutants in the four changed production files (40 negate-boolean, 14
off-by-one, 6 drop-field-copy); `copy.ts` adds only strings. I added 23
mutants of my own (`manual:review:*`) on the rework's new behaviour:

- the Cancel, Escape and overlay guards;
- the scope effect and how the trigger hides;
- the pending cues;
- the overlay's focus, close, `aria-hidden` and token;
- the spinner's `motion-safe`;
- the notice stack's order and bound;
- the Esc handler's key, target and focus return.

Two of them re-express baseline mutants whose line changed: `plain-anchor-v2`
and `review-submits-v2`. `scope --since 28f5c45 --previous <v1
mutation.json>` tagged 59 mutants `carried`, 28 `delta` and 49 `late`. It
reported 7 baseline mutants that no longer apply: five generated mutants now
at new line numbers and regenerated there, plus the two re-expressed above.
The run used 8 workers and the four focused suites, and the baseline passed in
every worker. Results: 128 killed, 8 survived, 0 stillborn, 0 timeout
(`CAP-002-E4-S8-implementation-review-v2-mutation.json`, sha256
`05630b36…a713b`). Every `delta` mutant was killed.

| Survivor | Scope | Disposition | Reason (artifact that leaves it open) |
|----------|-------|-------------|---------------------------------------|
| `add-to-universe-dialog.tsx:82:negate-boolean:1` (`mountedRef = useRef(true)`) | late | equivalent | The mount effect (`:90-95`) overwrites the initial value before anything reads it. Only `submit` reads it, and only on a mounted, loaded dialog. As v1. |
| `dialog-frame.tsx:74:negate-boolean:1` and its carried twin `:67` (`||` → `&&`) | late / carried | equivalent | `first` and `last` are `[0]` and `[length - 1]` of one array, so both are `undefined` exactly when it is empty. As v1. |
| `notices.tsx:49:off-by-one:1` and carried twin `:43` (counter starts at 1) | late / carried | equivalent | T010 fixes "ids from a counter ref" but no start value. Ids are opaque keys, never rendered. As v1. |
| `notices.tsx:52:off-by-one:1` and carried twin `:46` (step of 2) | late / carried | equivalent | Same artifact. Ids stay unique and increasing. As v1. |
| `manual:review:choice-keeps-field-error` | carried | equivalent | UX 1.1, T008 and DEC-0169 do not say whether changing the choice clears the Add dialog's field error. The name is unchanged, so a kept error is still true of it. As v1. |

## Independent Validation

All commands ran at HEAD `957b78a` with a clean tree. Commands 1 to 7 used a
temporary `node_modules` link to the main checkout. Its `package-lock.json` is
byte-identical to this checkout's (`cmp`). I removed the link before the
mutation run, which refuses untracked files. Vitest and the build ran with
`dangerouslyDisableSandbox`, because vitest hits EPERM on `node_modules/.vite`
inside the sandbox. The plan's commands are run from the repository root. I
ran their equivalents through `npm --prefix` (npm runs each script in that
directory) and through `tsc -p`, which reads the same configuration.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| 1. `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test -- src/screens/research/save-as-universe-dialog.test.tsx src/screens/research/add-to-universe-dialog.test.tsx src/screens/research/notices.test.tsx src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` (npm script cwd) | 0 | PASS | 4 files, 418 tests (50 + 40 + 14 + 314) |
| 2. `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test` (`npm run test`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 56 files, 1176 tests |
| 3. `npm --prefix repos/factorflow-v2/FactorFlow-v2 run lint` (`npm run lint`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 130 files, no diagnostics |
| 4. `npm --prefix repos/factorflow-v2/FactorFlow-v2 run format` (`npm run format`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 130 files, nothing to change |
| 5. `repos/factorflow-v2/FactorFlow-v2/node_modules/.bin/tsc -p repos/factorflow-v2/FactorFlow-v2 --noEmit` (`npx tsc --noEmit`) | harness root | 0 | PASS | no output |
| 6. `npm --prefix repos/factorflow-v2/FactorFlow-v2 run build` (`npm run build`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite: 63 modules; `index-DyXerSmu.css` 18.78 kB, named in the built `index.html` |
| 7. T016 CSS check: a Python search of `src/factorflow/api/static/assets/index-DyXerSmu.css` for 21 selectors | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Present: `bg-background/80` (`hsl(var(--background) / .8)`), `bg-[hsl(var(--popover))]`, `text-[hsl(var(--popover-foreground))]`, `bg-[hsl(var(--primary))]`, `text-[hsl(var(--primary-foreground))]`, `text-[hsl(var(--destructive))]`, `aria-[invalid=true]:border-[hsl(var(--destructive))]`, `aria-disabled:text-muted-foreground`, `size-4` (`var(--space-4)`), `rounded-[var(--radius)]`, `border-current`, `border-t-transparent`, `motion-safe:animate-spin` (inside `prefers-reduced-motion: no-preference`), `invisible`, `inline-flex`, `border-input`, `border-border`, `data-[variant=blocked]:text-muted-foreground`, `text-lg`, `text-sm`, `p-5` |
| 8. `python3 scripts/check-tdd-evidence.py --evidence <stories>/CAP-002-E4-S8-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f4deee3e319a7f7ef536df83d85d212b0fbf623f --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | READY | "review changes were reworked; a new review version is required" |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | `f4deee3…` | ancestor of HEAD |
| Patch composition: `GIT_INDEX_FILE=<scratch> git read-tree ec8c8b2`, `git apply --cached cycle-4.patch`, `git write-tree`, `git diff <tree> HEAD -- web/` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Empty `web/` diff. `ec8c8b2` and `28f5c45` have the same `web/`. Real index untouched. |
| `shasum -a 256` of `cycle-4.patch`, `red-`, `green-`, `full-suite-cycle-4.log`, `mutation-cycle-4-results.json` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Each equals its `*_sha256` in cycle-4. The logs show RED 22 failed / 396 passed, GREEN 418 passed, and the full suite at 1176 passed. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f4deee3e319a7f7ef536df83d85d212b0fbf623f..HEAD --cycle review --out <scratch>/ar-s8-v2/mutants-generated.json` | harness root | 0 | 60 mutants | 23 manual mutants added (`mutants-with-manual.json`) |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/ar-s8-v2/mutants-with-manual.json --since 28f5c45be59a54adeca90ba2df9df71c7bdb810b --previous <stories>/CAP-002-E4-S8-implementation-review-v1-mutation.json --out <scratch>/ar-s8-v2/mutants.json` | harness root | 0 | 136 mutants | carried 59, delta 28, late 49 |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/ar-s8-v2/mutants.json --jobs 8 --timeout 300 --command 'test -e node_modules \|\| ln -s /Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; ./node_modules/.bin/vitest run src/screens/research/save-as-universe-dialog.test.tsx src/screens/research/add-to-universe-dialog.test.tsx src/screens/research/notices.test.tsx src/screens/research/copy.test.ts' --out <scratch>/ar-s8-v2/results.json --logs <scratch>/ar-s8-v2/logs --work-root <scratch>/ar-s8-v2/work` | harness root | 3 | PASS (test-quality gate) | 128 killed, 8 survived, all equivalent. Exit 3 means survivors exist, not an environment fault. A first attempt exited 1 before running any mutant (`FileNotFoundError`: the `--work-root` folder did not exist yet). It was rerun after `mkdir`. |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan excludes it. No screen hosts the dialogs yet (CAP-002-E4-S9), and `tests/e2e/universe-from-result.spec.ts` is Phase 6b automation (Open Gap 7). |
| `npm ci` | — | N/A | NOT RUN | Dependencies were not reinstalled. `node_modules` was linked from the main checkout, whose lockfile is byte-identical. |
| `uv …` Python commands (tech-stack) | — | N/A | NOT RUN | The change set contains no Python file. The task plan names only the npm commands. |

The Gate Summary counts commands 1 to 8 as required. The mutation run is the
test-quality gate of E.9.

### Validation Side Effects

- Before: HEAD `957b78a`, clean tree, `code-revision`
  `sha256:c3d4eb51…3625`.
- During commands 1 to 7: the temporary `node_modules` symlink showed as
  untracked (`?? node_modules`). The `.gitignore` pattern `node_modules/`
  matches a directory, not a symlink. The link was removed before the
  mutation run.
- After: HEAD `957b78a`, clean tree, `code-revision`
  `sha256:c3d4eb51…3625` (identical).
- `npm run build` rewrote the git-ignored `src/factorflow/api/static/index.html`
  and added files under `assets/`. Because `emptyOutDir` is `false`, earlier
  builds' assets accumulate there.
- Unexpected tracked-file changes: none. This report and its `-mutation.json`
  are the only files written into the repository, and both are left
  uncommitted.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | delta | The overlay blocks the page only if the host renders it last |
| IR-002 | LOW | delta | Focus falls to the document body when a Save dialog closes under a universe scope |
| IR-003 | LOW | delta | A held notice that returns to the stack is announced again as if new |
| IR-004 | LOW | late | The Add dialog still drops a failure when its host unmounts it mid-request |
| IR-005 | LOW | delta | A rewritten test keeps the title of the token it no longer checks |

### IR-001 — The overlay blocks the page only if the host renders it last

- **Severity**: MEDIUM
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A (DEC-0259 requirement)
- **Tasks**: T012
- **Files**:
  - `web/src/screens/research/dialog-frame.tsx:91-98` (overlay), `:99-108` (dialog)
  - `web/src/screens/research/notices.tsx:97-103` (`fixed right-4 bottom-4` region)
  - `docs/.../stories/CAP-002-E4-S9-tasks.md:100` (the planned host order)
- **Claim challenged**: The frame's doc comment says the overlay "dims and
  blocks the page behind".
- **Observed evidence**:
  - The overlay and the dialog are `position: fixed` with no `z-index`. The
    notice region is also `fixed` with no `z-index`.
  - In one stacking context, CSS paints positioned boxes with
    `z-index: auto` in tree order. A positioned box later in the DOM is
    therefore drawn above the overlay, and it still receives the pointer.
  - CAP-002-E4-S9's plan renders `AddToUniverseDialog`, then
    `NoticeRegion … exactly once`, after the results header that holds
    `SaveAsUniverse`.
  - Notices stay until dismissed (DEC-0168). So a notice from an earlier
    save will normally be on screen when the next dialog opens.
  - jsdom has no layout, so no unit test can show this.
- **Expected evidence/behavior**: Dialog spec §3 item 1 says the overlay
  "dims and blocks the page behind". DEC-0259 asks for the overlay and says a
  pending request's outcome must not be lost.
- **Impact**: Once S9 lands as planned, notices draw undimmed above the
  overlay. Their links and Dismiss controls stay clickable while an
  `aria-modal` dialog is open. A click on a notice link during a pending
  request routes away from the Research screen. That unmounts the host that
  owns `useNotices`, so the result can be lost, which DEC-0259 rules out.
- **Required remediation**: Make the frame's blocking independent of host
  DOM order, for example by an explicit stacking order or by rendering the
  overlay and dialog at the end of `body`. Otherwise, state the ordering
  contract in the frame's and notices' doc comments, so CAP-002-E4-S9 renders
  `NoticeRegion` before any dialog.

### IR-002 — Focus falls to the document body when a Save dialog closes under a universe scope

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T013 (DEC-0259 scope behaviour)
- **Files**:
  - `web/src/screens/research/save-as-universe-dialog.tsx:55-89, 133-137`
  - `web/src/screens/research/dialog-frame.tsx:54-60`
  - `web/src/screens/research/save-as-universe-dialog.test.tsx:766-802` (no focus assertion)
- **Claim challenged**: cycle-4 lists this under "Carried to the owner, not
  changed". It is recorded only in that prose.
- **Observed evidence**:
  - When the scope becomes a universe while a save is pending, the trigger
    unmounts and the dialog stays.
  - On the later close (success, or Cancel after a failure),
    `DialogFrame`'s cleanup calls `focus()` on the stored trigger. The
    trigger is detached, so focus lands on `body`.
  - The idle path has the same end state: the scope change closes the dialog
    at once. That path dates from v1.
- **Expected evidence/behavior**: STD-UI-24: "focus MUST be managed on
  dialogs". Dialog spec §5: focus "returns to the triggering element on
  close". Neither says where focus goes when the trigger no longer exists.
- **Impact**: Narrow. The overlay and the Tab trap stop the owner changing
  the scope from the page, so this arises only from navigation (back or
  forward, or a link) while a dialog is open. A keyboard or screen-reader
  user then loses their place.
- **Required remediation**: Move focus to a stable, documented target when
  the trigger is gone, and pin it in the two scope-change tests. Otherwise,
  record the behaviour as an owner decision.

### IR-003 — A held notice that returns to the stack is announced again as if new

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S8-3, DAC-E4-S8-5 (toast rendering)
- **Tasks**: T010
- **Files**:
  - `web/src/screens/research/notices.tsx:97-104`
  - `web/src/screens/research/notices.test.tsx:252-272`
- **Claim challenged**: cycle-4 says older notices "are held … and return as
  shown ones are dismissed".
- **Observed evidence**:
  - `notices.slice(-MAX_SHOWN)` drops older items from the DOM. When a shown
    item is dismissed, a held one is re-inserted.
  - The region is a polite live region with `aria-atomic="false"`, so it
    announces added nodes. An earlier *Saved 12 stocks as Tech* is read
    again as if a save had just finished.
  - Nothing shows that held notices exist. The coder carried the "+N more"
    question to the owner.
- **Expected evidence/behavior**:
  - Toast spec §5 makes the polite announcement part of a toast's arrival.
  - Toast spec §4 says to "collapse the rest".
  - DEC-0258 bounds the stack at three. It does not decide whether held
    notices return.
- **Impact**: A screen-reader user hears a stale confirmation as if it were
  new. This happens only when more than three notices are held, which is
  likely, because nothing expires (DEC-0168).
- **Required remediation**: Make a notice announce once, on arrival, whether
  or not it is later re-shown, and pin that. Otherwise, have the owner decide
  that held notices are dropped or collapsed into a count.

### IR-004 — The Add dialog still drops a failure when its host unmounts it mid-request

- **Severity**: LOW
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S8-5
- **Tasks**: T014
- **Files**:
  - `web/src/screens/research/add-to-universe-dialog.tsx:166-187` (catch block, unchanged since `28f5c45`)
  - `add-to-universe-dialog.tsx:51-55` (contract)
  - `web/src/screens/research/add-to-universe-dialog.test.tsx:791-806` (success only)
- **Claim challenged**: The doc comment says a request that completes after
  a host-driven unmount "still notifies".
- **Observed evidence**:
  - That holds for success, which is tested.
  - A failure after a host-driven unmount lands on the unmounted instance,
    whose state setters React drops. The comment at `:170-171` says so. The
    owner is never told the stocks were not added.
  - The S9-facing contract says nothing about this case.
- **Expected evidence/behavior**: DEC-0259: "do not let a pending request's
  outcome be lost".
- **Impact**: This arises only if CAP-002-E4-S9 unmounts the dialog other
  than through `onClose`, for example on navigation. In that case a refusal
  passes silently. The lines are unchanged since the baseline, so the scope
  is `late`.
- **Required remediation**: Either state in the dialog's contract that the
  host must not unmount it while a request is pending, or report a late
  failure through the host. The owner chooses which.

### IR-005 — A rewritten test keeps the title of the token it no longer checks

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006
- **Files**: `web/src/screens/research/save-as-universe-dialog.test.tsx:575-582`
- **Claim challenged**: The test's title says "styles the field error with
  the critical status token".
- **Observed evidence**: The rework changed its assertion to
  `text-[hsl(var(--destructive))]` (DEC-0257). The title still names
  `--status-critical`. No other reference to the critical token remains in
  the story's files.
- **Expected evidence/behavior**: Test names describe the behaviour they pin.
  The RED log and the test report cite this name.
- **Impact**: Cosmetic. It misleads anyone reading the test report.
- **Required remediation**: Rename the test to name `--destructive`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | All three mutants are killed in this review's run. `name-shown-while-loading` (carried) is killed by `add-to-universe-dialog.test.tsx:275-320`. `trap-skips-select` (carried) is killed by `:639-662`. `plain-anchor` no longer applies to the changed `Link` line, so it was re-expressed as `plain-anchor-v2` (delta) and is killed by `notices.test.tsx:194-212`. |
| v1/IR-002 (MEDIUM) | RESOLVED | DEC-0257 applied. The surface and text are `--popover` and `--popover-foreground` (`dialog-frame.tsx:108`). Errors and alerts are `--destructive`, and the invalid border too (`save-as-universe-dialog.tsx:231-241`; `add-to-universe-dialog.tsx:208, 265-275`). The confirms are `--primary` on `--primary-foreground`. The outline borders are `--input`. The tests pin the classes, and command 7 shows they are built. |
| v1/IR-003 (LOW) | RESOLVED | DEC-0258 applied. `Esc` on a notice's link or Dismiss dismisses it and focuses the region (`notices.tsx:85-91`; tests `:214-250`). At most the three newest are shown (`:23, 104`; test `:252-272`). The residual is IR-003. |
| v1/IR-004 (LOW) | RESOLVED | DEC-0259 applied. The overlay is `aria-hidden` and closes a `standard` dialog when clicked (dialog spec §4) without taking focus. A spinner sits in a reserved slot, with `aria-busy` and `data-pending`. Cancel is `aria-disabled` with a muted cue. Cancel, Escape and the overlay do nothing while a request is pending. A failure stays in the open dialog. Tests: `save-as-universe-dialog.test.tsx:705-802, 884-908`; `add-to-universe-dialog.test.tsx:664-737`. The residuals are IR-001, IR-002 and IR-004. |

## Scope and Plan Deviations

- **Justified deviations, owner-directed (DEC-0257, DEC-0259) and recorded in
  cycle-4's description**:
  - T012's and T016's `bg-background`, `bg-foreground`/`text-background` and
    `text-status-critical` classes are replaced by the CAP-002 token map.
  - T013's "returns `null` under a universe scope" now hides only the
    control, while a pending dialog stays mounted.
  - The T006 and T007 tests that pinned closing mid-request and a dropped
    late failure were replaced.
  - The task plan's text was not amended. That is consistent with
    `story-coding` editing only checkboxes. The decisions and the TDD
    evidence carry the change.
- **Carried from v1, still justified**:
  - `notices.tsx` uses an `output` region with `span` items.
  - `DialogFrame` has an optional `descriptionId`.
  - `notices.tsx` has the extra exports `HeldNotice`, `NoticesBinding` and
    `universePath`.
  - The story evidence folder is outside T015's path list, which T017's
    `--require-logs` needs.
- **New export**: `ConfirmProgress` in `dialog-frame.tsx`, used by both
  dialogs (DEC-0259).
- **Bookkeeping**:
  - Every checked task has implementation evidence, and no unchecked task
    appears implemented.
  - The tasks file's frontmatter gained `updated` and `last_reworked_review`.
  - The story file is unchanged since v1.
  - `git log` shows the three Decision-Id trailers for DEC-0257 to DEC-0259
    on `957b78a`. Those decision records exist only as uncommitted files in
    the harness checkout and are `owner_reviewed: false`. Committing them is
    the driver's job.
- **Out-of-scope changes**: none. The rework touched only the story's four
  production files, their three test files and the story's own docs.
- **Observation for the owner (not a finding, because no artifact sets a
  request timeout)**: DEC-0259 and the dialog spec forbid closing before the
  result is known. The CAP-002-E4-S1 client has no timeout or abort
  (`web/src/api/*.ts`). A request that never settles therefore leaves the
  dialog and its page-blocking overlay locked until reload. cycle-4 carries
  this to the owner.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`)
- **Required action**:
  - Run doc sync against this report.
  - Fix IR-001 to IR-005 in a later change or record owner decisions for
    them.
  - Before or during CAP-002-E4-S9 planning, settle IR-001 (notice-region
    order or frame stacking) and IR-004 (the host must not unmount a pending
    Add dialog).
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005
