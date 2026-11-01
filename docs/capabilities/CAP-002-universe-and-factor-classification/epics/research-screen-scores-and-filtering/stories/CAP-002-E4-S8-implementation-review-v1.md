---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S8-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E4-S8"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T16:43:26Z"
reviewed_head: "28f5c45be59a54adeca90ba2df9df71c7bdb810b"
review_base: "f4deee3e319a7f7ef536df83d85d212b0fbf623f"
reviewed_state_revision: "sha256:08da130f9fd03d4942a01389a4d6c5af796cd696bde9880cbcc6ecfb36dcaa4f"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-31T16:43:26Z
  source_artifacts:
    - id: CAP-002-E4-S8
      version: "1 (sha256:51ac60dc6f774646fe66d84b1668a3193ebd2e4a433e9d4514c6809c9eee205f)"
    - id: CAP-002-E4-S8-tasks
      version: "1 (sha256:7586e0f94d13dc37c09d35b481e2912fa3e94402c13b7dd78278c93ecbb51678)"
    - id: CAP-002-E4-S8-tdd-evidence
      version: "cycle-1 to cycle-3"
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
    - id: STD-UI (ui-conventions)
      version: "current on origin/main f4deee3"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S8 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 15/17 verified |
| Required validation | 8/8 passed |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 2 · **total 4**

This is the initial review of the story-coding commit `28f5c45`, so every
finding has scope `initial`. I reran every required validation command and
all of them pass. The full web suite passes (1163 tests in 56 files), as do
lint, format, `tsc --noEmit`, the build, T016's built-CSS class check and the
TDD-evidence lint (0 errors, 0 warnings). Applied in order to the review base,
the three cycle patches reproduce HEAD's `web/` tree exactly. Each patch's
SHA-256 equals its cycle's `diff_sha256`.

The production code meets every acceptance criterion. The save request
carries the displayed filter and set through the real client. The blocked
state, the conflict swap, the notices and the Add routes all behave as the
story, the designs and DEC-0167 to DEC-0169 require.

The verdict is CHANGES-REQUIRED because of one test-quality gap:

- **IR-001** (HIGH): three non-equivalent mutants survive the story's focused
  suites. They are a Name field shown while the universe list loads, a focus
  trap that skips the Add dialog's `select`, and a notice link that is a plain
  anchor rather than a router `Link`. Each is a contract the plan or the
  designs state. Each is observable: probes P1 to P3 pass on HEAD and fail
  under the mutant. So T008 and T009 are `WEAK`.

There is also one MEDIUM finding and two LOW findings. They are non-blocking
departures from the design-system and CAP-002 token contracts, which the plan
inherited from the CAP-001 retire dialog or left out.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S8-tasks.md` |
| Component | `FactorFlow-v2` (project repo and component repo are the same) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S8` |
| HEAD | `28f5c45be59a54adeca90ba2df9df71c7bdb810b` |
| Review base | `origin/main` = merge base `f4deee3e319a7f7ef536df83d85d212b0fbf623f` (`pipeline-state.py review-base --base-ref origin/main`; ancestor of HEAD confirmed) |
| Working tree | clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 28 (one commit, `28f5c45`) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/notices.tsx` | added | DAC-E4-S8-3, DAC-E4-S8-5; T010; DEC-0168 |
| `web/src/screens/research/notices.test.tsx` | added | T009 |
| `web/src/screens/research/dialog-frame.tsx` | added | T012 |
| `web/src/screens/research/save-as-universe-dialog.tsx` | added | AC-2, AC-5, DAC-E4-5, DAC-E4-S8-1 to -4; T013 |
| `web/src/screens/research/save-as-universe-dialog.test.tsx` | added | T001 to T004, T006, T007 (TC-COMP-008 to 011) |
| `web/src/screens/research/add-to-universe-dialog.tsx` | added | DAC-E4-S8-5; T014 |
| `web/src/screens/research/add-to-universe-dialog.test.tsx` | added | T005, T008 (TC-COMP-033) |
| `web/src/screens/research/copy.ts` | modified | T011: `DIALOGS.enterName` (no empty-name key existed at the base, verified by `git grep`; DEC-0169), `DIALOGS.universe`, `NOTICES.dismiss` |
| `web/src/screens/research/copy.test.ts` | modified | T011: one anchor for each new string |
| `docs/.../stories/CAP-002-E4-S8.md` | modified | `status: planning` → `in-review` only (T015 allows the status line) |
| `docs/.../stories/CAP-002-E4-S8-tasks.md` | modified | checkboxes only (17 lines) |
| `docs/.../stories/CAP-002-E4-S8-tdd-evidence.yaml` | added | T017 |
| `docs/.../stories/CAP-002-E4-S8-evidence/` (16 files: three cycle patches, RED/GREEN/full-suite logs, mutants and mutation results per cycle) | added | T017; the logs, patches and results the TDD evidence cites (`--require-logs`) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-2 | SATISFIED | `save-as-universe-dialog.tsx:149` posts `createUniverse({ name: trimmed, filter: toThresholds(query), setId })` from the open-time snapshot (`:69`, `:105`) | `save-as-universe-dialog.test.tsx:296-323` (real client and `toThresholds` through a stubbed `fetch`), `:491-524` | This story covers the client half (the dialog). The fixed membership is the server's snapshot (CAP-002-E1). |
| AC-5 | SATISFIED | `save-as-universe-dialog.tsx:56-80`: `blocked` at zero matches, focusable, with its reason; no dialog and no request | `save-as-universe-dialog.test.tsx:147-189`; empty name sends nothing (`:556-569`); `empty_universe` renders its sentence (`:599-620`) | |
| DAC-E4-5 | SATISFIED | As AC-2 and AC-5: the same `toThresholds(query)` object the list read uses (`research-query.ts:244`), plus the on-screen `setId` | `save-as-universe-dialog.test.tsx:296-323`: the exact body, including `symbol: null` present and `hide_incomplete: false` | |
| DAC-E4-S8-1 | SATISFIED | `save-as-universe-dialog.tsx:60-80` | `save-as-universe-dialog.test.tsx:147-179`: type, `data-variant`, `aria-disabled`, not `disabled`, Tab-reachable, reason as next sibling, no dialog or request by click, Enter or Space | |
| DAC-E4-S8-2 | SATISFIED | `toThresholds` carries `symbol`; the description comes from `describeQuery` (`save-as-universe-dialog.tsx:126-132`) | `save-as-universe-dialog.test.tsx:296-349` | |
| DAC-E4-S8-3 | SATISFIED | `save-as-universe-dialog.tsx:152-158`; `notices.tsx:36-38, 94-100` | `save-as-universe-dialog.test.tsx:397-431`: closes, link `/research/universes/u-9`, server's count and name, encoded id, focus back on the control | The router-`Link` nature of the link is not pinned (IR-001, survivor 3); the link itself is. |
| DAC-E4-S8-4 | SATISFIED | `save-as-universe-dialog.tsx:180, 237-253` | `save-as-universe-dialog.test.tsx:436-489`: sentence in an alert equal to the `copy.ts` export, Save absent, Review in the same slot, closes without a request, focus kept | |
| DAC-E4-S8-5 | SATISFIED | `add-to-universe-dialog.tsx:151-163, 172-184` | `add-to-universe-dialog.test.tsx:191-249`: with and without the already-member clause, counted from the response; `universe_retired` wording in an alert with Add still available | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:146-247` | Every assertion the plan lists. Also covers `setId === null` and closing for good when the scope becomes a universe. |
| T002 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:250-393` | Real `createUniverse` and `toThresholds`. Exact body, `symbol: null` present. Title and description lines; `including` clause only for a known count above 0. `vi.stubGlobal` is reset by vitest per file; no leak observed (the full suite is green). |
| T003 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:396-432` | Server count (11 against a header of 12) and encoded `a/b`. |
| T004 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:435-525` | Includes props read at open and a rerender while the dialog is open. |
| T005 | complete | VERIFIED | `add-to-universe-dialog.test.tsx:190-250` | |
| T006 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:528-731` | Field error on name in use and on empty; trimming; 300 characters with no `maxlength`; failure sentences; fallback; double submit; retry. |
| T007 | complete | VERIFIED | `save-as-universe-dialog.test.tsx:734-862` | Native dialog, labels, focus, order, Escape/Cancel, Tab trap both ways, empty on reopen. |
| T008 | complete | PARTIAL | `add-to-universe-dialog.test.tsx:253-735` | Thorough on routes, failures, focus and StrictMode. Two surviving mutants show gaps (IR-001): nothing pins that no Name field shows while the list loads, and no test presses Tab or Shift+Tab inside the Add dialog. |
| T009 | complete | PARTIAL | `notices.test.tsx:48-198` | Region, order, dismiss, focus, timers, unmounted caller, markup safety. The link is checked only by `href`, so a plain `<a>` passes where T009 requires "a router link" (IR-001). |
| T010 | complete | VERIFIED | `notices.tsx:1-117` | Justified deviation, recorded in the evidence: an `output` (implicit `status` role) with `span` items, instead of `div role="status"`. Biome rejects `role` on a `div`, and the repo's status regions use `output`. Extra exports `HeldNotice`, `NoticesBinding` and `universePath` support the planned ones. |
| T011 | complete | VERIFIED | `copy.ts:516-538` (`DIALOGS.enterName` :522, `DIALOGS.universe` :528, `NOTICES` :536-538); `copy.test.ts:466-468`; doc comments in both dialogs | No empty-name key existed at `f4deee3`, so `DIALOGS.enterName` was added once (DEC-0169). The export names used and the `createUniverse` call shapes are recorded in the dialogs' doc comments. |
| T012 | complete | VERIFIED | `dialog-frame.tsx:1-97` | Planned classes, Escape, Tab cycle computed at keydown, focus restore, `aria-busy`. Added an optional `descriptionId` for the dialog spec's `aria-describedby` (justified). Probe P2 shows the trap works for the Add dialog's `select` on HEAD. |
| T013 | complete | VERIFIED | `save-as-universe-dialog.tsx:1-258` | Every clause of T013 is present. |
| T014 | complete | VERIFIED | `add-to-universe-dialog.tsx:1-289` | Every clause of T014 is present. The initial focus rests on Cancel until the list arrives, then moves to the select or the Name field, unless the owner has moved focus first. |
| T015 | complete | VERIFIED | `git diff --name-only f4deee3..HEAD` | Only the planned files plus the story's evidence folder. `classification-client.ts`, `research-query.ts`, `dependencies.yaml` and the patterns are untouched. Only the dialogs and the tests import the new files. `render.test.tsx` scans every source file and passes. |
| T016 | complete | VERIFIED | Commands 2 to 7 below | Every listed class is present in `index-Bc9ZKO1z.css`, as are `min-h-5`/`min-w-5` (`var(--space-5)`), the arbitrary `--popover`/`--radius` classes and `data-[variant=blocked]:`. |
| T017 | complete | VERIFIED | `CAP-002-E4-S8-tdd-evidence.yaml`; command 8 | Three cycles, `commit_hash: stage`, RED and GREEN logs present and hashed. The patches compose to HEAD. Whether the cited sub-agent reviews were independent cannot be verified from the repository. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `save-as-universe-dialog.test.tsx` "TC-COMP-008" / TC-COMP-008 | ADEQUATE | Exact attributes, focusability, reason wiring and position, no dialog or request by three activations, scope and count rules. All generated mutants on `:56`, `:68` were killed. | none |
| "TC-COMP-009" / TC-COMP-009 | ADEQUATE | Captures the real wire body through `fetch`, so a regression in the payload builder or the dialog's arguments fails. Description lines are compared with `describeQuery`. | none |
| "TC-COMP-010" / TC-COMP-010 | ADEQUATE | Notice as rendered by a real `NoticeRegion`; server's count and name; encoding; focus return. | Router-`Link` nature (owned by T009; IR-001) |
| "TC-COMP-011" / TC-COMP-011 | ADEQUATE | Sentence equals the export; DOM slot; focus continuity; no resubmission by Enter; open-time snapshot. | none |
| "TC-COMP-033" / TC-COMP-033 | ADEQUATE | Clause on and off, counted from the response; chosen universe's name and link; retired sentence; recovery. | none |
| T006 "refusals, validation and request hygiene" | ADEQUATE | Field error and alert paths, trimming, no maximum, envelope never shown, pending guards, late success and late failure. | none |
| T007 "dialog frame" | ADEQUATE | Frame semantics, classes, focus, Escape and Cancel, both Tab directions, swap of the confirm. | Covers the Save dialog only (see T008). |
| T008 "states and routes" | WEAK | Broad: list call, skeleton, order, defaults, reveal and hide, both routes, failures, StrictMode, focus, pending, symbol snapshot. | Survivors `manual:review:name-shown-while-loading` and `manual:review:trap-skips-select` (IR-001) |
| T009 `notices.test.tsx` | WEAK | Region semantics, item variant and tokens, order, dismiss by id with focus return, no timer, unmounted caller, text-not-markup. | Survivor `manual:review:plain-anchor` (IR-001) |
| `copy.test.ts` anchors | ADEQUATE | Literal anchors for `enterName`, `universe`, `NOTICES.dismiss`. The reviewer mutants of the first two were killed. | none |

All tests run in jsdom with doubled or stubbed network calls. They use
deferred promises and fake timers rather than real time, and render under
`StrictMode` where effects matter. The full suite and the focused suites were
green and showed no order dependence.

**Mutation run (E.9).** `generate` over `f4deee3..HEAD` produced 58 mutants
in the four changed production files; `copy.ts` adds only strings, so it had
none. I added 8 mutants of my own (`manual:review:*`). That makes 66 mutants,
run against the four focused suites with 8 workers. The baseline passed in
every worker. Results: 57 killed, 9 survived, 0 stillborn, 0 timeout
(`CAP-002-E4-S8-implementation-review-v1-mutation.json`).

| Survivor | Disposition | Reason (artifact that leaves it open, or why it is observable) |
|----------|-------------|-----------------------------------------------------------------|
| `add-to-universe-dialog.tsx:80:negate-boolean:1` | equivalent | `mountedRef`'s initial value is overwritten by the mount effect before anything reads it. Only `submit` reads it, and that needs a mounted dialog with a loaded list. StrictMode's remount sets it again. |
| `save-as-universe-dialog.tsx:112:negate-boolean:1` | equivalent | Same as above. `submit` needs the mounted dialog. |
| `dialog-frame.tsx:67:negate-boolean:1` | equivalent | `first` and `last` are `[0]` and `[length - 1]` of one array, so both are `undefined` exactly when it is empty. |
| `notices.tsx:43:off-by-one:1` | equivalent | T010 fixes "ids from a counter ref" but no start value. Ids are opaque keys, compared only for equality and never rendered. |
| `notices.tsx:46:off-by-one:1` | equivalent | Same artifact. A step of 2 keeps ids unique and increasing. |
| `manual:review:choice-keeps-field-error` | equivalent | UX 1.1, T008 and DEC-0169 say when the Add dialog's field error is raised, but not whether changing the choice clears it. The toggle does not change the name, so a kept error is still true of the field's value. |
| `manual:review:name-shown-while-loading` | **not equivalent** | IR-001 |
| `manual:review:trap-skips-select` | **not equivalent** | IR-001 |
| `manual:review:plain-anchor` | **not equivalent** | IR-001 |

## Independent Validation

All commands ran at HEAD `28f5c45` with a clean tree. I linked
`node_modules` temporarily from the main checkout; its `package-lock.json` is
byte-identical (`cmp`). The link was removed before the mutation run, which
refuses untracked files. Vitest runs used `dangerouslyDisableSandbox`, because
the driver reports EPERM on `node_modules/.vite` inside the sandbox.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| 1. `npx vitest run src/screens/research/save-as-universe-dialog.test.tsx src/screens/research/add-to-universe-dialog.test.tsx src/screens/research/notices.test.tsx src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 4 files, 405 tests (46 + 35 + 10 + 314) |
| 2. `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 56 files, 1163 tests |
| 3. `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome: 130 files, no diagnostics |
| 4. `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome check: 130 files, nothing to change |
| 5. `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | no output |
| 6. `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite: 63 modules; `index-Bc9ZKO1z.css` 17.91 kB |
| 7. T016 CSS check: a Python search of `src/factorflow/api/static/assets/index-Bc9ZKO1z.css` for 12 selectors | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `min-h-5`, `min-w-5`, `border-status-good`, `bg-[hsl(var(--popover))]`, `text-[hsl(var(--popover-foreground))]`, `rounded-[var(--radius)]`, `data-[variant=blocked]:text-muted-foreground`, `animate-pulse`, `text-status-critical`, `border-input`, `bg-foreground`, `text-background`: all present |
| 8. `python3 scripts/check-tdd-evidence.py --evidence <stories>/CAP-002-E4-S8-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f4deee3e319a7f7ef536df83d85d212b0fbf623f --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story> --stage adversarial-review` | harness root | 0 | READY | story is ready for independent review |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | `f4deee3…` | ancestor of HEAD |
| Patch composition: `GIT_INDEX_FILE=<temp> git read-tree f4deee3`, then `git apply --cached cycle-{1,2,3}.patch`, then `git diff <tree> HEAD -- web/` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Empty `web/` diff. Patch SHA-256s equal the three `diff_sha256` values. Real index untouched. |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f4deee3e319a7f7ef536df83d85d212b0fbf623f..HEAD --cycle review --out <scratch>/ar-s8-v1/mutants.json` | harness root | 0 | 58 mutants | 39 negate-boolean, 13 off-by-one, 6 drop-field-copy; 8 manual mutants added |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/ar-s8-v1/mutants.json --jobs 8 --timeout 300 --command 'test -e node_modules \|\| ln -s /Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; ./node_modules/.bin/vitest run src/screens/research/save-as-universe-dialog.test.tsx src/screens/research/add-to-universe-dialog.test.tsx src/screens/research/notices.test.tsx src/screens/research/copy.test.ts' --out <scratch>/ar-s8-v1/results.json --logs <scratch>/ar-s8-v1/logs --work-root <scratch>/ar-s8-v1/work` | harness root | 3 | FAIL (test-quality gate) | 57 killed, 9 survived (6 equivalent, 3 not: IR-001). Exit 3 means survivors, not an environment fault. Results sha256 `12a00083…f666`. |
| Reviewer probes P1 to P3 (`zz-review-probes.test.tsx` in a scratch clone at `28f5c45`, never in the component repo) | scratch clone | 0, then 1 under each mutant | PASS on HEAD; each fails under its mutant | P1: no Name textbox while `listUniverses` is pending. P2: Shift+Tab from the loaded `select` keeps focus in the dialog, on Add. P3: clicking the notice link inside `MemoryRouter` renders the `/research/universes/:universeId` route. |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan excludes it. No screen hosts the dialogs yet (CAP-002-E4-S9), and `tests/e2e/universe-from-result.spec.ts` is Phase 6b automation (Open Gap 7). |
| `npm ci` | — | N/A | NOT RUN | Dependencies were not reinstalled. `node_modules` was linked from the main checkout, whose lockfile is byte-identical. |
| `uv …` Python commands (tech-stack) | — | N/A | NOT RUN | The change set contains no Python file. The task plan names only the npm commands. |

The Gate Summary counts commands 1 to 8 as required. The mutation run is the
test-quality gate of E.9 and its result is IR-001.

### Validation Side Effects

- Before: HEAD `28f5c45`, clean tree, `code-revision` `sha256:08da130f…aa4f`.
- After: HEAD `28f5c45`, clean tree, `code-revision` `sha256:08da130f…aa4f`
  (identical). `npm run build` rewrote the git-ignored
  `src/factorflow/api/static/index.html` and `assets/`.
- Unexpected tracked-file changes: none. The temporary `node_modules` link was
  removed. This report and its `-mutation.json` are the only files written
  into the repository, and both are left uncommitted.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | Three non-equivalent mutants survive the Add-dialog and notices tests |
| IR-002 | MEDIUM | initial | The dialogs use the CAP-001 retire dialog's tokens, not CAP-002's token map |
| IR-003 | LOW | initial | The notice region omits the toast contract's Esc-to-dismiss and three-item stack |
| IR-004 | LOW | initial | The dialog frame has no overlay and no visible submitting state |

### IR-001 — Three non-equivalent mutants survive the Add-dialog and notices tests

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S8-3, DAC-E4-S8-5 (via T008, T009)
- **Tasks**: T008, T009 (the tests); T010, T012, T014 (the lines mutated)
- **Files**:
  - `web/src/screens/research/add-to-universe-dialog.tsx:239`
  - `web/src/screens/research/dialog-frame.tsx:12-13` (`FOCUSABLE`)
  - `web/src/screens/research/notices.tsx:97-99`
  - `web/src/screens/research/add-to-universe-dialog.test.tsx:271-359`
  - `web/src/screens/research/notices.test.tsx:59-82`
- **Claim challenged**: The TDD evidence gives each cycle a mutation score of
  1.0, with only equivalent survivors.
- **Observed evidence**: Each mutant below passes all four focused suites (66
  run, 57 killed).
  - **`manual:review:name-shown-while-loading`**:
    `{loaded && isNew ? (` → `{isNew ? (`. While `listUniverses` is pending,
    the choice is still `NEW_UNIVERSE`, so a **Name** field renders under the
    skeleton. It then vanishes when a non-empty list arrives. The skeleton
    test (`:271-301`) checks only that no `combobox` exists. Probe P1 finds no
    textbox on HEAD and finds one under the mutant.
  - **`manual:review:trap-skips-select`**: `select:not([disabled]), ` is
    removed from `FOCUSABLE`. The Add dialog's first focusable control is then
    not in the cycle, so Shift+Tab from the initially focused `select` leaves
    the dialog for the opener. No test presses Tab inside the Add dialog. The
    frame's trap tests (`save-as-universe-dialog.test.tsx:815-847`) use the
    Save dialog, which has no `select`. Probe P2 keeps focus inside the dialog
    on HEAD and loses it under the mutant.
  - **`manual:review:plain-anchor`**: the router `Link` becomes
    `<a href={notice.to}>`. Every notice-link assertion checks only `href`,
    and a plain anchor satisfies it. Probe P3 navigates on HEAD and stays on
    the page under the mutant.
- **Expected evidence/behavior**:
  - TEST-TDD-006 and adversarial-review E.9: no non-equivalent survivor.
  - DEC-0169 and T008: *New universe*, with its Name field, is the initial
    choice only "when the list is empty". Choosing *New universe* "reveals"
    the Name field.
  - UX 1.1 Accessibility: "Dialogs trap focus". Dialog design spec §4: "`Tab`
    cycles within the dialog only; focus never leaves while open". T012: the
    cycle runs over "the focusable descendants it finds".
  - T009: "when `to` is given, a router link with that `href`". T010: "a
    react-router `Link` when `to` is set".
- **Impact**: Each regression would pass the suite:
  - a Name field that flashes during loading and can take typed text that
    then disappears;
  - focus escaping the Add dialog behind an `aria-modal` dialog
    (STD-UI-24);
  - toast links that reload the whole application instead of routing.
  T008 and T009 are `WEAK`. The mandatory TC tests are unaffected.
- **Required remediation**: Strengthen the tests so all three mutants are
  killed, then rerun `mutation-run.py` over these lines:
  - assert that no Name field is present while the universe list is pending;
  - in the Add dialog, assert Tab from **Add** wraps to the `select` and
    Shift+Tab from the `select` wraps to **Add**, with focus never leaving the
    dialog;
  - assert that activating a notice link navigates through the router, for
    example by rendering the destination route inside `MemoryRouter`.

  No production change is needed: all three behaviours are correct on HEAD.

### IR-002 — The dialogs use the CAP-001 retire dialog's tokens, not CAP-002's token map

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no acceptance criterion names a token)
- **Tasks**: T012, T013, T014, T016
- **Files**:
  - `web/src/screens/research/dialog-frame.tsx:89` (`bg-background`)
  - `save-as-universe-dialog.tsx:217, 222` and `add-to-universe-dialog.tsx:199, 258, 265` (`text-status-critical` on field errors and alerts)
  - `save-as-universe-dialog.tsx:241, 249` and `add-to-universe-dialog.tsx:281` (confirm `bg-foreground text-background`)
  - `save-as-universe-dialog.tsx:72` (the `outline` trigger's `border-border`)
- **Claim challenged**: T012 says to use the "same Tailwind classes as the
  delivered dialog". T016 says to confirm `text-status-critical`,
  `bg-foreground` and `text-background`.
- **Observed evidence**: The coder followed the plan exactly, and the tests
  pin these classes. The plan copied `screens/instruments/retire-dialog.tsx`
  (CAP-001). In the same directory, the CAP-002-E4-S5 sibling renders field
  errors in `hsl(var(--destructive))` (`filters-pane.tsx:198, 241`;
  `threshold-sentence.tsx:199`). This story's own toast was moved to
  `--popover` after its cycle-1 spec-drift review, but its dialog surface was
  not.
- **Expected evidence/behavior**:
  - UX design 1.1 Token Usage (`ux-design.md:616, 619`): "errors
    `--destructive`" and "Dialog and toast surfaces `--popover` /
    `--popover-foreground`".
  - classification-ui §10 (`component-design-classification-ui.md:1157-1161`):
    "primary actions `--primary` on `--primary-foreground`", "dialogs and
    toasts `--popover` / `--popover-foreground`" and "field errors
    `--destructive`".
  - Button spec §6: outline border `--input`. Form spec §6: error text
    `--destructive`. Dialog spec §6: surface `--popover`.
  - No decision record overrides these for CAP-002.
- **Impact**: The visual difference is small: `--popover` equals
  `--background` in the light theme, and `--destructive` and
  `--status-critical` differ by 5% lightness. But the dark theme diverges, and
  the Research screen's dialogs will not match its own filters' error colour.
  The plan contradicts the approved design without a recorded decision.
- **Required remediation**: Either render the frame surface, the error text,
  the confirm and the outline border with the tokens the designs name (as
  arbitrary-value classes, as `notices.tsx` does) and update the class
  assertions, or have the owner record that the CAP-001 dialog precedent
  governs CAP-002 dialogs.

### IR-003 — The notice region omits the toast contract's Esc-to-dismiss and three-item stack

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S8-3, DAC-E4-S8-5 (toast rendering)
- **Tasks**: T010
- **Files**: `web/src/screens/research/notices.tsx:64-117`
- **Claim challenged**: The TDD evidence says these are "carried as owner
  follow-ups".
- **Observed evidence**: `Esc` on a focused notice or its Dismiss control does
  nothing, and any number of notices stack. The follow-up exists only as prose
  in `CAP-002-E4-S8-tdd-evidence.yaml`. Neither DEC-0168 nor the plan records
  it.
- **Expected evidence/behavior**: UX 1.1 maps the `toast` `success` to
  `design-system/components/toast/design-spec.md`. Its §4 says "`Esc` |
  Dismisses the focused toast" (line 43) and "Stack at most three; collapse
  the rest" (line 48). DEC-0168 (owner-upheld) waives only the auto-dismiss
  timer.
- **Impact**: This is minor in practice. A keyboard user must Tab to Dismiss,
  and repeated saves can stack notices over the screen.
- **Required remediation**: Implement both rules with tests, or record the
  waiver in a decision record (or as an amendment to DEC-0168) so the follow-up
  is durable.

### IR-004 — The dialog frame has no overlay and no visible submitting state

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T006, T012, T013, T014
- **Files**:
  - `web/src/screens/research/dialog-frame.tsx:80-95`
  - `save-as-universe-dialog.tsx:226-253`
  - `add-to-universe-dialog.tsx:269-285`
- **Claim challenged**: T012 says the frame is "the `dialog open` frame
  `retire-dialog.tsx` establishes".
- **Observed evidence**:
  - `<dialog open>` is non-modal and draws no backdrop, so the page behind
    stays pointer-interactive although `aria-modal="true"` is set.
  - While a request is pending, **Save**/**Add** gets only `aria-disabled`
    and the frame `aria-busy`. No class responds to either, so nothing
    changes visibly.
  - **Cancel** and `Escape` stay active and close the dialog before the
    result is known. A late failure is then dropped silently, which the tests
    pin at `save-as-universe-dialog.test.tsx:700-714`.
- **Expected evidence/behavior**: Dialog spec §3 item 1: "Overlay — dims and
  blocks the page behind". Dialog spec §4: "Submitting: disable the confirm
  action and show progress in place. Never close the dialog before the result
  is known". Form spec §4: "While submitting, disable the submit action and
  show progress".
- **Impact**: This is low for routine, fast writes. The owner sees no
  feedback during a slow request and can dismiss it without learning whether
  it failed. The gap is inherited from the CAP-001 precedent that the plan
  directed.
- **Required remediation**: Show a visible pending state on the confirm, for
  example a `data-pending`/`aria-disabled` style. Then either block dismissal
  while a request is pending, or record why `Escape` may close a `standard`
  dialog mid-request. The overlay can be deferred to a shared frame decision
  if the owner prefers.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations**:
  - `notices.tsx` uses an `output` region with `span` items instead of
    `div role="status"`. The evidence records this: Biome rejects `role` on a
    `div`, and the repo's status regions use `output`.
  - `DialogFrame` gained an optional `descriptionId`, for the dialog spec's
    `aria-describedby`.
  - `notices.tsx` exports `HeldNotice`, `NoticesBinding` and `universePath`
    in addition to the planned exports. Both dialogs use `universePath`.
  - The story evidence folder, with its 16 files, is outside T015's listed
    paths. T017's `--require-logs` evidence needs it.
- **Additions beyond the plan's wording, supported by tests**:
  - Save is also `blocked` while `setId === null`, which T013 allows.
  - An open Save dialog closes for good when the scope becomes a universe.
  - A late success is still notified, without closing a reopened dialog.
  - StrictMode rendering throughout.
  - The Add dialog's choice is fixed while a request is pending.
- **Bookkeeping**: every checked task has implementation evidence. T008 and
  T009 are `PARTIAL` only because of IR-001. No unchecked task appears
  implemented. The story's status line moved from `planning` to `in-review`.
- **Out-of-scope changes**: none. No delivered file other than `copy.ts` and
  `copy.test.ts` changed, and those two changed only through additions.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework), then Adversarial
  Review v2
- **Required action**: Strengthen T008 and T009 so the three IR-001 mutants
  are killed. Rerun the mutation run over the changed lines and append a
  rework cycle to `CAP-002-E4-S8-tdd-evidence.yaml`. Address IR-002 by
  aligning the tokens or by an owner decision. IR-003 and IR-004 may be fixed
  or recorded as decisions. v2 should pass this report's `-mutation.json` as
  `scope --previous` and `28f5c45` as `--since`.
- **Warnings accepted downstream**: N/A
