---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S7-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E1-S7"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-31T16:45:18Z"
reviewed_head: "e7a5b15dce358e6a44148bc5e46970656fc579e1"
review_base: "f4deee3e319a7f7ef536df83d85d212b0fbf623f"
reviewed_state_revision: "sha256:cf36bf85a6144a90c720de3572e82bb6c8ed0c563dd72e1ef8615e6c1b99a07b"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S7
    artifact_version: 1
    content_revision: sha256:a97c236eb6158cea18725e6fe9bb248225808319d1e15a247b2d5cad209cd2c8
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-31T16:45:18Z
  source_artifacts:
    - id: CAP-002-E1-S7
      version: "1 (sha256:a97c236eb6158cea18725e6fe9bb248225808319d1e15a247b2d5cad209cd2c8)"
    - id: CAP-002-E1-S7-tasks
      version: "1 (updated 2026-10-31, last_reworked_review v1)"
    - id: CAP-002-E1-S7-tdd-evidence
      version: "cycle-1 to cycle-5"
    - id: CAP-002-E1-S7-implementation-review
      version: "1 (baseline, CHANGES-REQUIRED, reviewed_head 09d45049c86f5fc3c1c730b9bbb1b71a4551e3eb)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: design-system data-table design spec
      version: "stable, last_reviewed 2026-08-21"
    - id: DEC-0254
      version: "open, PROVISIONAL, amended after review v1 IR-005"
    - id: DEC-0255
      version: "open, decided_by agent (review v1)"
    - id: DEC-0256
      version: "open, PROVISIONAL, decided_by agent (rework)"
    - id: STD-UI (ui-conventions)
      version: "6"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S7 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 7/7 passed |

This re-reviews the rework of CAP-002-E1-S7. The baseline is review v1
(CHANGES-REQUIRED, `reviewed_head` `09d4504`). The rework is one commit,
`e7a5b15`, on top of the commit that carries review v1.

All seven v1 findings are resolved, each with current repository evidence:

- **v1 IR-001 (HIGH):** both nothing-found states now keep the table's column
  header row (Name, Lifecycle, Members, Created). The sentence and its reset
  are the body, in one cell spanning the four columns. The never-populated
  state still renders no table. TC-COMP-022 (b) and (c) assert this, so T008 is
  `VERIFIED` and the TC-COMP-022 test is `ADEQUATE`.
- **v1 IR-002 (MEDIUM):** the five carried survivors are now killed. These were
  the paste over a selection, the expander's `aria-controls` (two mutants), the
  `h1` level and the select's `inline` variant.
- **v1 IR-003 (MEDIUM):** the Name sort cycles ascending → descending →
  unsorted, and T010(d) pins the third and fourth activations.
- **v1 IR-004 to IR-007 (LOW):** all fixed. The fixes rest on DEC-0256 and on
  the amended DEC-0254.

Every required command passes when rerun independently:

- the focused suites (377 tests);
- the full Vitest suite (1134 tests in 55 files);
- lint, format, `tsc --noEmit` and the build;
- the TDD-evidence lint (0 errors).

The three rework patches replay onto the rework's parent and reproduce HEAD's
six `web/` files byte for byte.

**Mutation run:** 149 mutants; 141 killed, 8 survived.

- Every survivor is equivalent. The tests pin all eight behaviours the rework
  added: kept rows, `aria-busy`, the header-kept empty and error bodies, the
  sort cycle, the focus targets and the two keyed timestamp lines.
- No mandatory test is `WEAK`.

**Two new findings, neither blocking:**

- **IR-001 (MEDIUM, delta):** the rework dims the kept rows with Tailwind's
  `opacity-50`. In the default light theme that drops body text to 3.42:1 and
  muted text to 1.96:1, below STD-UI-24's 4.5:1. `opacity-50` is also a literal
  outside the theme (STD-UI-29). The delivered coverage table dims with the
  validated `text-muted-foreground` token instead. A test pins the class.
- **IR-002 (LOW, late):** the list announces no row count after the rows
  update, which `data-table` §5 asks for. The Coverage screen does announce it.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7.md` (v1, approved; `status: in-review`). Its revision `sha256:a97c236eb6158cea18725e6fe9bb248225808319d1e15a247b2d5cad209cd2c8` equals the approval's `reviewed_revision`. Unchanged since the baseline |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7-tasks.md` (16 tasks: T001, T003 to T017; no T002). Since the baseline, only `updated` and `last_reworked_review` changed |
| Component | `FactorFlow-v2` (web interface, `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S7`, three commits ahead of `origin/main`: `09d4504` (coding), `3418602` (review v1), `e7a5b15` (rework) |
| HEAD | `e7a5b15dce358e6a44148bc5e46970656fc579e1`: "feat(web): CAP-002-E1-S7 story-coding rework - review v1 findings IR-001 to IR-007". Trailers: `Decision-Id` DEC-0254, DEC-0255 and DEC-0256 |
| Review base | `origin/main` (`f4deee3`), resolved by `pipeline-state.py review-base --base-ref origin/main` to `f4deee3e319a7f7ef536df83d85d212b0fbf623f`. It is an ancestor of HEAD (`merge-base --is-ancestor` exit 0). The stale `origin/HEAD` was not used |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. The `code-revision` fingerprint was the same before and after |
| Changed files reviewed | 30 since the review base (12,778 insertions, 18 deletions). 18 changed in the rework since the baseline |
| Baseline | v1 (`CAP-002-E1-S7-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `09d45049c86f5fc3c1c730b9bbb1b71a4551e3eb`, with `-v1-mutation.json` |
| State check | `pipeline-state.py check --stage adversarial-review`: `READY` ("review changes were reworked; a new review version is required") |
| Prerequisites | `check-prerequisites.sh --project factorflow-v2 --require tech-stack`: PASSED, exit 0 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/universes/index.tsx` | added (rework modified) | T014; AC-1, AC-3, DAC-E1-S7-3, DAC-E1-S7-4, DAC-E1-S7-6. Rework: v1 IR-001, IR-004, IR-007 (DEC-0255, DEC-0256) |
| `web/src/screens/research/universes/universe-table.tsx` | added (rework modified) | T012; AC-3, DAC-E1-S7-4, DAC-E1-S7-5. Rework: v1 IR-001, IR-003, IR-004, IR-006, IR-007 |
| `web/src/screens/research/universes/create-dialog.tsx` | added (unchanged in rework) | T013; AC-1, AC-5, DAC-E1-1, DAC-E1-S7-1 to DAC-E1-S7-3 |
| `web/src/screens/research/universes/create-dialog.test.tsx` | added (rework: one test) | T003, T004, T005, T009 (TC-COMP-042, TC-COMP-006, TC-COMP-007). Rework: v1 IR-002 |
| `web/src/screens/research/universes/universes.test.tsx` | added (rework modified) | T006, T007, T008, T010 (TC-COMP-020, TC-COMP-021, TC-COMP-022). Rework: v1 IR-001 to IR-004, IR-007 |
| `web/src/screens/research/copy.ts` | modified (additive) | T011. Rework: `UNIVERSES.createdAt` and `UNIVERSE_LIFECYCLE.retiredAt` keyed, and three doc comments corrected (v1 IR-006, DEC-0256) |
| `.../stories/CAP-002-E1-S7-tasks.md` | modified (16 checkboxes ticked; `updated`, `last_reworked_review`) | T001 to T017 bookkeeping; `story-coding` rework metadata |
| `.../stories/CAP-002-E1-S7.md` | modified (`status: planning` to `in-review`) | `story-coding` status lifecycle; the content revision is unchanged |
| `.../stories/CAP-002-E1-S7-tdd-evidence.yaml` | added (rework: cycles 3 to 5) | T017 |
| `.../stories/CAP-002-E1-S7-evidence/` (19 files: five patches, four RED logs, four GREEN logs, five mutation results, one RED mutant results) | added | T017 (INV-TDD-002) |
| `.../stories/CAP-002-E1-S7-implementation-review-v1.md` and `-v1-mutation.json` | added | Review v1 and its mutation results, committed by the driver (`3418602`) |

Nothing under `web/src/app/*`, `web/src/api/*`, `web/src/screens/instruments/*` or
`copy.test.ts` was touched, which T015(b) requires.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `create-dialog.tsx` `CreateDialog`, `handleSubmit` (133-173), posting `{ name, symbols }` through `createUniverse`; the `instrument_not_acquired` refusal (160-165, 231-243); `index.tsx` `onCreated` navigates to `universeDetailPath` (223-226) | `create-dialog.test.tsx` TC-COMP-006 (172-245), TC-COMP-007 (497-541) | Client half. The server refuses uncovered stocks (CAP-002-E1-S6); the dialog names them and keeps the list. Unchanged since v1 |
| AC-3 | SATISFIED | `index.tsx` `readAllUniverses` (29-39) and the counts header (173-177); `universe-table.tsx` table, lifecycle badge and origin line | `universes.test.tsx` TC-COMP-020 (127-), TC-COMP-021 (257-303), TC-COMP-022 (305-379); T010 (381-654) | Several universes listed; retired ones separated |
| AC-5 | SATISFIED | `create-dialog.tsx` `blockedReason` (30-35); `blocked` variant, `tabIndex={0}`, `aria-describedby` (321-333); `handleSubmit` re-parses and returns while blocked (139-144) | TC-COMP-042 (`create-dialog.test.tsx` 100-154) | The "last member" half is CAP-002-E1-S9's. Unchanged since v1 |
| DAC-E1-1 | SATISFIED | `create-dialog.tsx` 160-165, 231-243 | TC-COMP-006, including one symbol without a comma and the empty-`symbols` fallback | Client half; writing nothing is the server's (E1-S6) |
| DAC-E1-S7-1 | SATISFIED | `create-dialog.tsx` 30-35, 96-98, 321-333 | TC-COMP-042: empty, malformed-only, 1001, exactly 1000, duplicates counted per entry (DEC-0104) | Focusable, described by its reason, sends nothing when clicked |
| DAC-E1-S7-2 | SATISFIED | `create-dialog.tsx` 231-243; `withLink` (38-52) to `SHELL_ROUTES.followedStocks` | TC-COMP-006 | Link phrase per DEC-0254 |
| DAC-E1-S7-3 | SATISFIED | `create-dialog.tsx` 157 `onCreated(universe.universeId)`; `index.tsx` 223-226 | TC-COMP-007: one request with the trimmed name and distinct upper-cased symbols; detail stub rendered; no dialog, status, alert or toast text | |
| DAC-E1-S7-4 | SATISFIED | `index.tsx` lifecycle select (178-191, default `active`, `data-variant="inline"`); `universe-table.tsx` `RetiredBadge` (252-273) and the muted retired name (294) | TC-COMP-020, now also asserting the `h1` and the select's `inline` variant | |
| DAC-E1-S7-5 | SATISFIED | `universe-table.tsx` `describeOrigin` (48-84), `toProvenance` (93-112), `readOrigin` (118-132) | TC-COMP-021: eight provenance cases, paging to `created`, one read per expansion, and now the expander's `aria-controls` naming the detail row | `describeOrigin` unchanged since v1; it still meets DEC-0108's contract |
| DAC-E1-S7-6 | SATISFIED | `index.tsx` 79-85 (`empty-never-populated` when both counts are zero, `shownRows` null; otherwise `empty-no-match`, `shownRows` empty), 153-166 (the nothing-found body), 209-219 | TC-COMP-022 (a), (b), (c); "drops the kept rows when a read finds no universe at all" (582-594) | The two states are distinct. Nothing found keeps the column header row (DEC-0255); never populated has no table, including after a populated selection |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | The imports in the three new files resolve: `listUniverses`, `createUniverse`, `listUniverseEvents`, `ClassificationApiError`, `UniverseSummary`, the `copy.ts` groups, `format.ts`, `parseBulkSymbols`, `ScreenState` | Verification task. Unchanged since v1 |
| T003 | complete | VERIFIED | `create-dialog.test.tsx` 100-154 | Unchanged since v1 |
| T004 | complete | VERIFIED | `create-dialog.test.tsx` 172-245 | Unchanged since v1 |
| T005 | complete | VERIFIED | `create-dialog.test.tsx` 497-541 | Unchanged since v1 |
| T006 | complete | VERIFIED | `universes.test.tsx` 127- | Now also asserts the `h1` level and the select's `data-variant="inline"` (v1 IR-002) |
| T007 | complete | VERIFIED | `universes.test.tsx` 257-303 | Now also asserts that `aria-controls` names the `TR` holding the origin line (v1 IR-002) |
| T008 | complete | VERIFIED | `universes.test.tsx` 305-379 | Resolves v1 IR-001. (b) asserts the four column headers, the sentence and **Reset filter** inside the table in a `colspan="4"` cell, no link or row header in the table, and the *2 active, 0 retired* line kept. (c) asserts the same for *No active universes.* (a) still asserts no table. The control is labelled *Reset filter*, not **Reset**: DEC-0254, amended for v1 IR-005 |
| T009 | complete | VERIFIED | `create-dialog.test.tsx` 247-495 | (a) now also pastes over a selected range (300-308), which kills v1's survivor `create-dialog.tsx:manual:10`. The `1bad` for `zzzz` deviation is still justified (v1) |
| T010 | complete | VERIFIED | `universes.test.tsx` 381-654 | (a) error under the header row, focus on the select after **Try again**; (d) ascending, descending, unsorted, ascending; (f) focus on the row's expander after the origin **Try again**; plus the kept-rows and dropped-rows tests (DEC-0256) |
| T011 | complete | VERIFIED | `copy.ts`: `UNIVERSE_LIFECYCLE.retiredAt` (84), `UNIVERSES.createdAt` (595); the doc comments of `hideDetailsFor` (550), `loading` (556) and `resetFilter` (569) now state their source. `copy.test.ts` is unchanged and its 325 tests pass | The retire-bearing `retiredAt` is in `UNIVERSE_LIFECYCLE`, as T011 and DEC-0145 require. The TC-COMP-072 scan passes unchanged |
| T012 | complete | VERIFIED | `universe-table.tsx` | Adds the `body` and `busy` props, `NEXT_SORT` (150-154) and the expander ref. `describeOrigin` is untouched: module-scope, unexported, pure, with the exact T012 signature. The dimming method is IR-001 (MEDIUM), which does not affect T012's stated contract |
| T013 | complete | VERIFIED | `create-dialog.tsx` | Unchanged since v1 |
| T014 | complete | VERIFIED | `index.tsx` | Default export `UniversesScreen`; `cancelled` flag; every page at 500; distinct empty states; `unreachable` renders `null`; never populated focuses **New universe…**; no delete. The rework adds `shownRows`, `reselect`, `retry` and the table body (DEC-0255, DEC-0256) |
| T015 | complete | VERIFIED | Default export confirmed; `universeDetailPath` produces `/research/universes/{id}`; `render.test.tsx` passes; `describeOrigin` meets (d). The change set is limited to the T015(b) list, plus the evidence directory, the story status and review v1's artifacts | |
| T016 | complete | VERIFIED | Every Validation Plan command rerun and passing (Independent Validation) | |
| T017 | complete | VERIFIED | `CAP-002-E1-S7-tdd-evidence.yaml`: five cycles, all `commit_hash: stage`. Each `diff_sha256` equals the SHA-256 of its `reviewed_patch`. Each cited log and results file matches its recorded SHA-256. `check-tdd-evidence.py --require-logs` reports 0 errors. The cycle-3 to cycle-5 patches replay onto `3418602` and reproduce HEAD | Cycle-3's RED log shows the 6 tests the rework changed failing against the v1 code. Cycle-4's RED is v1's five survivors killed by the new tests (`red-cycle-4.log`), which is meaningful because that production code was already correct. Cycle-5 is a comment-only `refactor` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `TC-COMP-042: Create is blocked for zero or over 1000 symbols` / TC-COMP-042 | ADEQUATE | Unchanged since v1. `data-variant`, focusability and `aria-describedby` text; nothing sent while blocked; the 1000 and 1001 boundaries; malformed-only; duplicates counted. Every carried mutant on `blockedReason` and the blocked button is still killed | none |
| `TC-COMP-006: the dialog names every uncovered symbol and keeps the list` / TC-COMP-006 | ADEQUATE | Unchanged since v1. Exact sentence, assertive role, link and `href`, both fields kept, no navigation, no envelope text | none |
| `TC-COMP-007: a successful create navigates to the new universe without a toast` / TC-COMP-007 | ADEQUATE | Unchanged since v1. Real `Routes` with a `useParams` stub; one call with trimmed name and distinct symbols; no toast | none |
| `TC-COMP-020: retired universes appear only under the lifecycle select` / TC-COMP-020 | ADEQUATE | As v1, plus `getByRole("heading", { level: 1, name: "Universes" })` and the select's `data-variant="inline"`. Kills the carried `index.tsx:manual:47` and `:48` | none |
| `TC-COMP-021: the origin line names each clause only when it applied` / TC-COMP-021 | ADEQUATE | As v1, plus the expander's `aria-controls` resolving to a `TR` that contains the origin line. Kills the carried `universe-table.tsx:manual:45` and `:46` | none |
| `TC-COMP-022: never populated is distinct from a lifecycle filter that matches nothing` / TC-COMP-022 | ADEQUATE | (a) no table, the sentence and its Research link, focus on **New universe…**. (b) and (c): the column header row present, the sentence and reset inside the table in a four-column cell, no data row, the count line kept, the reset target and focus on the select afterwards. Kills `v2` manual mutants 2, 3 and 5, the generated `colSpan` mutant and the reset-target swap | none (v1 IR-001 resolved) |
| `CreateDialog: parsing, focus, field errors and in-flight state` / T009 (additional) | ADEQUATE | As v1, plus a paste replacing a selected range (`setSelectionRange(6, 16)`, paste `NVDA`), asserting the field and *2 symbols recognised, 0 not recognised*. Kills the carried `create-dialog.tsx:manual:10` and this review's `manual:v2-1`, which keeps the selection before the paste | none |
| `UniversesScreen: loading, errors, paging, columns, sort and expansion` / T010 (additional) | ADEQUATE | As v1, plus: (a) the error inside the table under the header row, and focus on the select after **Try again**; (d) the full sort cycle back to the loaded order; (f) focus on the expander after the origin **Try again**; the kept-rows test (`aria-busy`, the stale link visible, the `tbody` class, cleared after the read settles, *Loading…* still polite); the dropped-rows test. Kills every delta mutant except the two equivalent ones | The kept-rows test pins the `opacity-50` class that IR-001 questions; it would need to change with IR-001's remediation |
| `withLink` | ADEQUATE | Unchanged since v1 | none |
| Existing `web/src/api/render.test.tsx` | ADEQUATE | No `dangerouslySetInnerHTML` in the tree; passes | none |

Isolation and determinism: the new tests settle deferred reads explicitly
(`answerRetired`) rather than waiting on time. They mock the fetch layer as
before and reset the doubles in `beforeEach`, and they read neither the
network nor the wall clock. The test files still assert literal strings, not
`copy.ts` imports.

### Mutation Run

- **Generated:** `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f4deee3e319a7f7ef536df83d85d212b0fbf623f..HEAD --cycle review --out $SCRATCH/v2/mutants-generated.json` produced 55 mutants: 26 off-by-one, 25 negate-boolean, 3 drop-field-copy and 1 remove-attribute.
- **Hand-written:** 27 `"operator": "manual"` mutants (`manual:v2-1` and onwards), each with a `why`:
  - 24 aim at the rework's behaviour: kept rows, the never-populated and nothing-found `shownRows`, the first-load error, both focus moves, `busy`, the error body, the polite *Loading…*, the `NEXT_SORT` entries, `aria-busy`, the `tbody` class, the `body` branch, `colSpan`, the expander focus, both timestamp lines and their `copy.ts` wording.
  - `index.tsx:manual:v2-12` and `universe-table.tsx:manual:v2-12` restate v1's `index.tsx:manual:19` (reset targets swapped) and `universe-table.tsx:manual:28` (the sort never cycles) on the rewritten lines.
  - One more targets the paste preview's first slice.
- **Scoped:** `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/v2/mutants-with-manual-2.json --since 09d45049c86f5fc3c1c730b9bbb1b71a4551e3eb --previous repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7-implementation-review-v1-mutation.json --out $SCRATCH/v2/mutants-final.json` gave 149 mutants: 100 carried, 28 delta and 21 late.
  - Four baseline mutants no longer apply, because the rework rewrote their lines: `index.tsx:161:off-by-one:1`, `universe-table.tsx:214:negate-boolean:1`, `index.tsx:manual:19` and `universe-table.tsx:manual:28`.
  - Their regenerated or restated forms are in the set: `index.tsx:129:off-by-one:1`, the generated `expanded` mutant on the moved line, and the two `v2-12` mutants.
- **Command:** `python3 scripts/mutation-run.py run --repo-dir /Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/planning-run-learnbot-cap-001-d79e92/repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/v2/mutants-final.json --jobs 4 --timeout 300 --command 'cd {workdir} && ln -sfn /Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/planning-run-learnbot-cap-001-d79e92/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules && ./node_modules/.bin/vitest run src/screens/research/universes src/screens/research/copy.test.ts' --out $SCRATCH/v2/results-final.json --logs $SCRATCH/v2/logs2 --work-root $SCRATCH/v2/work2`. Here `$SCRATCH` is `/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-planning-run-learnbot-cap-001-d79e92/96c5c236-c694-4a01-88e2-32b3ce2942aa/scratchpad`.
- **Result:** exit 3 (survivors), with all four baselines green.
  - Of 149 mutants, 141 were killed and 8 survived; none was stillborn and none timed out.
  - By scope: carried 96 killed and 4 survived; delta 26 killed and 2 survived; late 19 killed and 2 survived.
  - v1's five non-equivalent survivors (`create-dialog.tsx:manual:10`, `universe-table.tsx:manual:45`, `:46`, `index.tsx:manual:47`, `:48`) are all killed.
  - The results are persisted beside this report as `CAP-002-E1-S7-implementation-review-v2-mutation.json`.

| Survivor | Scope | Disposition | Reason (the contract that leaves it open) |
|----------|-------|-------------|--------------------------------------------|
| `create-dialog.tsx:189:negate-boolean:1` (`\|\|` → `&&` in the focus-trap null guard) | carried | equivalent | As v1: both refs are bound to elements rendered unconditionally while the dialog is mounted, so the guard only narrows types. Under `&&`, `last.focus()` no longer type-checks, so the required `tsc --noEmit` rejects the mutant. No artifact specifies behaviour for an unbound ref |
| `index.tsx:53:off-by-one:1` (`reloadToken` starts at 1) | carried | equivalent | As v1: the value is never read, only used as an effect dependency. T010(a) and T014 specify only that **Try again** re-requests |
| `index.tsx:129:off-by-one:1` (`token + 2` in `retry`) | delta | equivalent | Any change of the dependency issues the same single re-read, and focus still moves to the select. This is v1's `index.tsx:161` on its rewritten line |
| `index.tsx:193:negate-boolean:1` and `index.tsx:224:negate-boolean:1` (`setCreating(true)` in `onCreated`) | carried, late | equivalent | One mutant twice: the baseline id carried to its moved line, and the same mutant regenerated under the new line number. As v1: `onCreated` navigates to `/research/universes/:universeId`, a sibling route (classification-ui 2.1), and `UniversesScreen` renders no `Outlet`. Navigation unmounts the screen and its dialog, so UX design 1.3's "the dialog closes and the interface routes to the new universe's detail" holds |
| `universe-table.tsx:81:off-by-one:1` and `universe-table.tsx:86:off-by-one:1` (`Parameters<…>[1]`) | carried, late | equivalent | One type-only alias twice, as above. It emits no JavaScript, and the required `tsc --noEmit` rejects it |
| `index.tsx:manual:v2-9` (`tableRows = shownRows`, dropping the `populated` branch) | delta | equivalent | In the populated branch, `setShownRows(data.universes)` and `setScreenState({ kind: "populated", data, … })` run in the same promise callback. React 18 batches them into one render, so `shownRows` equals `screenState.data.universes` whenever the state is `populated`. The branch is redundant, which cycle-3's independent code review also noted. No artifact specifies which variable feeds the table |

## Independent Validation

All commands ran from the component repository root,
`repos/factorflow-v2/FactorFlow-v2`; the `scripts/` commands ran from the
harness root.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/universes web/src/screens/research/copy.test.ts web/src/api/render.test.tsx` | component repo | 0 | PASS | 4 files, 377 tests: universes 27, create-dialog 24, copy 325, render 1 |
| `npm run test` | component repo | 0 | PASS | 55 files, 1134 tests |
| `npm run lint` | component repo | 0 | PASS | Biome: 128 files, no fixes |
| `npm run format` | component repo | 0 | PASS | Biome: 128 files, no fixes |
| `npx tsc --noEmit` | component repo | 0 | PASS | `include: ["web/src"]`; strict, `noUnusedLocals`, `noUnusedParameters` |
| `npm run build` | component repo | 0 | PASS | Vite: 63 modules. `UniversesScreen` is not routed yet (CAP-002-E4-S10), so `tsc` and the tests cover it |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f4deee3e319a7f7ef536df83d85d212b0fbf623f --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate …` / `scope …` / `run …` (Mutation Run) | harness root | 0 / 0 / 3 | PASS (ran) | 149 mutants: 141 killed, 8 survived, all equivalent. Exit 3 means "survivors present" |
| Patch replay: `git archive 3418602 web/src/screens/research` into scratch, then `git apply --include='web/*'` of `cycle-3.patch`, `cycle-4.patch` and `cycle-5.patch`, then `cmp` against HEAD | scratch | 0 | PASS | All six `web/` files are byte-identical to HEAD. `shasum -a 256` of the three patches equals each cycle's `diff_sha256` (`0267566a…`, `555d69c6…`, `e62d8a3d…`), and every cited log and results file matches its recorded hash |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7.md` | harness root | 0 | PASS | `sha256:a97c236e…`, equal to the approval's `reviewed_revision` |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan excludes it: the Playwright specs and TC-E2E cases belong to later automation work and need E4-S10's route and E1-S9's detail. Not a required command for this story |

Required validation count: the six T016 commands (the focused suite, `npm run
test`, lint, format, `tsc` and the build) plus the TDD-evidence lint make
seven. All seven pass.

### Validation Side Effects

- Before: HEAD `e7a5b15`. `git status --porcelain -uall` was empty. `code-revision` was `sha256:cf36bf85a6144a90c720de3572e82bb6c8ed0c563dd72e1ef8615e6c1b99a07b`.
- After: HEAD `e7a5b15`. `git status --porcelain -uall` was empty. `code-revision` was the same value.
- Unexpected tracked-file changes: none.
  - The build writes only into the ignored `src/factorflow/api/static/` (`.gitignore` line 18).
  - The mutation runs used `--shared` clones under the session scratchpad and wrote nothing into the component repository.
  - The only files this review adds are this report and its `-mutation.json`.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | delta | The kept rows are dimmed with `opacity-50`, which drops their text below 4.5:1 contrast and is a literal outside the theme |
| IR-002 | LOW | late | The list announces no row count after its rows update (`data-table` §5) |

### IR-001 — The kept rows are dimmed with `opacity-50`, which drops their text below 4.5:1 contrast and is a literal outside the theme

- **Severity**: MEDIUM
- **Scope**: delta. Every line involved was added by the rework: `universe-table.tsx` 230 and the kept-rows test at `universes.test.tsx` 554-580.
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete)
- **Tasks**: T012, T014 (the v1 IR-004 rework); T010 (the test)
- **Files**:
  - `web/src/screens/research/universes/universe-table.tsx` 230: `<tbody className={busy ? "opacity-50" : undefined}>`.
  - `web/src/screens/research/universes/universes.test.tsx` 573 and 578: `toHaveClass("opacity-50")` while loading, `not.toHaveClass` after.
  - `projects/factorflow-v2/decisions/DEC-0256.md` (harness): its derivation reads "opacity is the minimal dimming that uses no colour token (STD-UI-29)".
- **Claim challenged**: DEC-0256 and the cycle-3 evidence claim the dimming meets `data-table` §4 and STD-UI-29.
- **Observed evidence**:
  - `opacity-50` is Tailwind's default opacity scale. The built CSS has `.opacity-50{opacity:.5}`. `tailwind.config.js` extends rather than replaces the theme, and its header says "Every value resolves to a `design-system/theme.css` custom property (STD-UI-29). No literal length, size, or colour is introduced here". No opacity token exists in `theme.css`.
  - While a new selection loads, the opacity composites the whole body over `--card`. These figures are computed from `theme.css`'s HSL values with the WCAG 2.1 relative-luminance formula:
    - Light theme, the default: `--foreground` text falls from 17.90:1 to 3.42:1. `--muted-foreground` text falls from 4.72:1 to 1.96:1; that is a retired universe's name and the *Retired* badge's text.
    - Dark theme: 5.08:1 and 2.69:1.
  - The rows stay operable while dimmed: the links, the expanders and the sort all still work. So WCAG 1.4.3's "inactive user interface component" exception does not apply.
  - The delivered `coverage-table.tsx` dims its refreshing body with `text-muted-foreground` (line 134), a validated token pair at 4.72:1 on `--card`.
- **Expected evidence/behavior**:
  - STD-UI-24: "Text MUST meet 4.5:1 contrast".
  - STD-UI-29: "No spacing, size or colour literal appears outside the theme". Its alpha allowance covers "an alpha applied to an existing token … provided the text drawn on it uses pairs already validated under STD-UI-10", which an opacity on the text itself does not meet. STD-UI-29 asks that a surface consume theme tokens, so "uses no colour token" is not what it asks for.
  - `data-table` §4 asks only that kept rows are "dim[med]"; it fixes no method.
- **Impact**:
  - For the moment a lifecycle read is in flight, the stale rows are below the project's contrast floor. A retired universe's name drops to about 2:1.
  - On the loopback deployment that moment is usually brief, so the effect is small. Small or not, it does not lower the severity.
  - The test now pins the non-conforming class, so a conforming fix must change it.
- **Required remediation**:
  - Dim the kept rows with a validated token pair. The coverage table's `text-muted-foreground` is the delivered precedent. Keep `aria-busy`.
  - Change the kept-rows test to assert the chosen treatment.
  - Amend DEC-0256's derivation to match. If the owner wants opacity, they must record a waiver of STD-UI-24 for this state; no agent decision can grant one.

### IR-002 — The list announces no row count after its rows update (`data-table` §5)

- **Severity**: LOW
- **Scope**: late. The count header (`index.tsx` 173-177) and the *Loading…* line (207) are unchanged since the baseline, and v1 could have raised this.
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014
- **Files**: `web/src/screens/research/universes/index.tsx` 169-219
- **Claim challenged**: The list follows the `data-table` contract that UX design 1.3 Component Mapping binds it to.
- **Observed evidence**:
  - After a lifecycle change or a reset, the new rows replace the old ones and *Loading…* disappears, but no polite live region states how many rows are now shown.
  - The *{n} active, {m} retired* line is not a live region and does not change with the selection.
  - The rework makes this more noticeable: the rows now update in place under a busy table instead of remounting.
- **Expected evidence/behavior**:
  - `data-table` §5 Accessibility Contract: "After the rows update, announce the new row count via a polite live region."
  - The delivered Coverage screen does this: `coverage/index.tsx` 193-195, *{n} instruments shown* in a polite region.
  - The task plan and UX design 1.3 do not mention it, so this is a component-contract gap, not a planned task.
- **Impact**: A screen-reader user who switches the lifecycle select, or presses **Reset filter**, hears *Loading…* but not the outcome.
- **Required remediation**: Optional. After each settled read, announce the shown row count in a polite live region. A new string needs a keyed `copy.ts` entry and a recorded wording decision. Alternatively, record that this table defers to the counts header.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `index.tsx` 79-85, 135-167 and 213-219 render `UniverseTable` with the nothing-found body when `shownRows` is `[]`, and no table when it is `null` (never populated). `universe-table.tsx` 231-246 replaces only the body, in a `colSpan={4}` cell. TC-COMP-022 (b) and (c) assert the four column headers, the body cell and no data row; (a) and the dropped-rows test assert no table. Mutants `index.tsx:manual:v2-2` and `:v2-3` and the generated `colSpan` mutant are killed. DEC-0255 is followed |
| v1/IR-002 (MEDIUM) | RESOLVED | The carried `create-dialog.tsx:manual:10`, `universe-table.tsx:manual:45`, `:46`, `index.tsx:manual:47` and `:48` are all killed in this review's run. The tests: `create-dialog.test.tsx` 300-308; `universes.test.tsx` the `h1` and `inline` assertions in TC-COMP-020, and `aria-controls` in TC-COMP-021 |
| v1/IR-003 (MEDIUM) | RESOLVED | `universe-table.tsx` 150-154 `NEXT_SORT` (none → ascending → descending → none), 215. T010(d) asserts the third activation gives `aria-sort="none"` and the loaded order, and the fourth gives ascending. `universe-table.tsx:manual:v2-1`, `:v2-2`, `:v2-3` and `:v2-12` are killed |
| v1/IR-004 (LOW) | RESOLVED | The kept rows remain visible, with `aria-busy` (`universe-table.tsx` 211, 230; `index.tsx` 59-61, 77, 167, 217). The error renders under the header row (`index.tsx` 136-152; T010(a)). The dimming method raises new finding IR-001 |
| v1/IR-005 (LOW) | RESOLVED | DEC-0254's question now cites "the task plan's T008(b) names the control **Reset**". Its derivation says why *Reset filter* is preferred, and its rejected alternatives list "Reset labelled 'Reset' as T008(b) writes it". The amendment is in the harness, uncommitted, for the driver to commit |
| v1/IR-006 (LOW) | RESOLVED | `copy.ts` keys `UNIVERSES.createdAt` (595) and `UNIVERSE_LIFECYCLE.retiredAt` (84), with unchanged wording, each documented as wording no design contains (DEC-0256). The `FACTORS` comment (`universe-table.tsx` 19-23) records that the `FactorName` identifiers are the labels. The `hideDetailsFor`, `loading` and `resetFilter` comments now cite T011, T010(a) and T008(b) with DEC-0254 and DEC-0103, which this review checked against those sources. Mutants `copy.ts:manual:v2-1` and `:v2-2` are killed |
| v1/IR-007 (LOW) | RESOLVED | `index.tsx` 123-131: `reselect` and `retry` focus the lifecycle select, which every rendered state keeps. `universe-table.tsx` 330-334: the origin **Try again** focuses the row's expander. TC-COMP-022 (b) and (c), T010(a) and T010(f) assert focus. `index.tsx:manual:v2-5`, `:v2-6`, `:v2-7` and `universe-table.tsx:manual:v2-9` are killed |

## Scope and Plan Deviations

- **Recorded decisions behind the rework:**
  - DEC-0255 (review v1): the nothing-found header row.
  - DEC-0256 (rework, provisional): focus targets, kept-and-dimmed rows, the header-kept error body, and the keyed timestamp lines.
  - DEC-0254 (amended): the *Reset filter* label.

  Each matches the code. IR-001 contests only DEC-0256's dimming method and its reading of STD-UI-29.
- **Justified: the reset moves focus.** `data-table` §5 says "sorting or filtering must not move focus". The reset control unmounts when activated, so focus must go somewhere. The lifecycle select is the filter control itself and stays mounted in every rendered state.
- **Behaviour change, no finding: the table now outlives a lifecycle change.** `UniverseTable` stays mounted while `shownRows` is not `null`, so the Name sort, expanded rows and cached origins persist across selections. No artifact specifies either way. T007's "one read per expansion" and the cache the plan directs are both preserved.
- **Justified deviations carried from v1:**
  - T009(a) asserts `1bad` for `zzzz`.
  - Five TDD cycles rather than the seven suggested.
  - `universeDetailPath` encodes the id.
  - *Loading…* text rather than a skeleton (T010(a), T014; DEC-0256 keeps it for the first load).
  - The story status `in-review`.
- **Bookkeeping:**
  - All 16 tasks are ticked, and all 16 are `VERIFIED`.
  - The tasks file gained `last_reworked_review` and a new `updated` date, and nothing else.
  - The cycle-3 survivor disposition (`index.tsx:129`) agrees with this review.
- **Scope leakage: none.** Every changed file is justified by a task, by T017's evidence, or by review v1's own artifacts.
- **Observations for the owner, no finding (carried from v1):**
  - The two builders of the origin line (`copy.ts` `savedFromFilter` against `describeOrigin`).
  - Esc in the Stocks field.

  Both are unchanged.
- **Harness state:** DEC-0254 (amended), DEC-0255 and DEC-0256 are uncommitted files under `projects/factorflow-v2/decisions/` in the harness. The rework commit carries their `Decision-Id` trailers, and the driver commits the files. This review records no new decision: neither finding decides the verdict.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-002-E1-S7)
- **Required action**:
  - Proceed to doc sync with IR-001 and IR-002 recorded.
  - IR-001 is worth fixing in a follow-up change, or before E4-S10 routes the screen: dim with a validated token pair and update the kept-rows test.
  - The driver's commit of this report carries no new `Decision-Id`.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW)
