---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S7-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-31
updated: 2026-10-31
story_id: "CAP-002-E1-S7"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-31T16:14:12Z"
reviewed_head: "09d45049c86f5fc3c1c730b9bbb1b71a4551e3eb"
review_base: "f4deee3e319a7f7ef536df83d85d212b0fbf623f"
reviewed_state_revision: "sha256:7d4012ceb5ee63081eb36b718e94e7601b33597b58fa4b8eef7d4f0bf89a976a"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-31T16:14:12Z
  source_artifacts:
    - id: CAP-002-E1-S7
      version: "1 (sha256:a97c236eb6158cea18725e6fe9bb248225808319d1e15a247b2d5cad209cd2c8)"
    - id: CAP-002-E1-S7-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E1-S7-tdd-evidence
      version: "cycle-1 to cycle-2"
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
    - id: design-system data-table, dialog, textarea, button design specs
      version: "as on origin/main f4deee3"
    - id: DEC-0101
      version: "upheld 2026-10-18"
    - id: DEC-0102
      version: "upheld 2026-10-18"
    - id: DEC-0103
      version: "upheld 2026-10-18"
    - id: DEC-0104
      version: "upheld 2026-10-18, amended E1-F23"
    - id: DEC-0108
      version: "upheld 2026-10-18"
    - id: DEC-0109
      version: "upheld 2026-10-18, amended E1-F18, E1-F22, E1-F24"
    - id: DEC-0145
      version: "upheld 2026-10-18, amended E4-F05"
    - id: DEC-0254
      version: "open, PROVISIONAL, decided_by agent 2026-10-31"
    - id: DEC-0255
      version: "open, decided_by agent 2026-10-31 (this review)"
    - id: STD-UI (ui-conventions)
      version: "6"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S7 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 4 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 15/16 verified |
| Required validation | 7/7 passed |

This is the initial review of CAP-002-E1-S7, so there is no baseline and every
finding has scope `initial`.

The story adds three files under `web/src/screens/research/universes/`:

- `index.tsx`, the Universes screen;
- `universe-table.tsx`, the expandable table with the origin line;
- `create-dialog.tsx`, the *New universe* dialog.

It also adds two test files and eleven `copy.ts` keys. The implementation is
largely sound. Every acceptance criterion has production and test evidence, and
`describeOrigin` meets the cross-story contract DEC-0108 pins.

Every required command passes when rerun independently:

- the focused suites (371 tests);
- the full Vitest suite (1128 tests in 55 files);
- lint, format, `tsc --noEmit` and the build;
- the TDD-evidence lint (0 errors).

The two cycle patches replay onto the base and reproduce HEAD's six `web/`
files byte for byte.

The gate fails on one HIGH finding. **IR-001:** task T008(b), which carries
mandatory test TC-COMP-022, says that in the nothing-found state "the table
header and the *2 active, 0 retired* line stay". The implementation renders no
table in that state, and the test asserts that no table is rendered. The coder
read "table header" as the card header and noted that reading in the TDD
evidence, but recorded no decision. This review settles the reading in
DEC-0255: the data-table's column header row stays. It derives that from two
sources:

- T008(a) says the never-populated state has "no table", while T008(b) says
  the table header stays.
- The `data-table` design spec, which UX design 1.3 binds the list to, makes
  the header row required. Its empty state replaces only the body.

T008 is therefore `PARTIAL`, and the TC-COMP-022 test is `WEAK`.

**Mutation run:** 104 mutants (54 generated, 50 hand-written); 94 killed,
10 survived.

- Five survivors are equivalent; each is dispositioned below.
- The other five are not equivalent, and they are what IR-002 (MEDIUM) reports.
  They show four unpinned behaviours, each specified by the plan or the UX
  design. All sit in the additional, non-mandatory tests:
  - the parse preview after a paste over a selection;
  - the expander's `aria-controls` link (two mutants);
  - the `h1` level of the page title;
  - the lifecycle select's `inline` variant.

**The other findings:**

- **IR-003 (MEDIUM):** the Name sort never returns to unsorted, which the
  `data-table` contract requires, and a test pins the contrary behaviour.
- **IR-004 (LOW):** the `data-table` loading and error states.
- **IR-005 (LOW):** DEC-0254's premise omits the plan's **Reset** label.
- **IR-006 (LOW):** `copy.ts` catalogue conventions.
- **IR-007 (LOW):** focus is lost after **Reset filter** and **Try again**.

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 4 · **total 7**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7.md` (v1, approved; `status: in-review`). Its revision `sha256:a97c236eb6158cea18725e6fe9bb248225808319d1e15a247b2d5cad209cd2c8` equals the approval's `reviewed_revision` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7-tasks.md` (16 tasks: T001, T003 to T017; no T002) |
| Component | `FactorFlow-v2` (web interface, `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S7`, one commit ahead of `origin/main` |
| HEAD | `09d45049c86f5fc3c1c730b9bbb1b71a4551e3eb`: "feat(web): CAP-002-E1-S7 story-coding - Universes screen, table and create dialog". Trailers: `Decision-Id` DEC-0254, DEC-0101, DEC-0102, DEC-0103, DEC-0104, DEC-0108, DEC-0109 and DEC-0145 |
| Review base | `origin/main` (`f4deee3`), resolved by `pipeline-state.py review-base --base-ref origin/main` to `f4deee3e319a7f7ef536df83d85d212b0fbf623f`. It is an ancestor of HEAD (`merge-base --is-ancestor` exit 0). The default resolution, `1d166f7` from the stale `origin/HEAD`, was not used |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. The `code-revision` fingerprint was the same before and after |
| Changed files reviewed | 17 (7508 insertions, 17 deletions) |
| Baseline | none: initial review |
| State check | `pipeline-state.py check --stage adversarial-review`: `READY` |
| Prerequisites | `check-prerequisites.sh --project factorflow-v2 --require tech-stack`: PASSED, exit 0 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/universes/index.tsx` | added | T014; AC-1, AC-3, DAC-E1-S7-3, DAC-E1-S7-4, DAC-E1-S7-6 |
| `web/src/screens/research/universes/universe-table.tsx` | added | T012; AC-3, DAC-E1-S7-4, DAC-E1-S7-5 |
| `web/src/screens/research/universes/create-dialog.tsx` | added | T013; AC-1, AC-5, DAC-E1-1, DAC-E1-S7-1, DAC-E1-S7-2, DAC-E1-S7-3 |
| `web/src/screens/research/universes/create-dialog.test.tsx` | added | T003, T004, T005, T009 (TC-COMP-042, TC-COMP-006, TC-COMP-007) |
| `web/src/screens/research/universes/universes.test.tsx` | added | T006, T007, T008, T010 (TC-COMP-020, TC-COMP-021, TC-COMP-022) |
| `web/src/screens/research/copy.ts` | modified (+31 lines, additive keys in `UNIVERSES`) | T011 |
| `.../stories/CAP-002-E1-S7-tasks.md` | modified (16 checkboxes ticked, no other change) | T001 to T017 bookkeeping |
| `.../stories/CAP-002-E1-S7.md` | modified (`status: planning` to `in-review`) | `story-coding` status lifecycle; the content revision is unchanged |
| `.../stories/CAP-002-E1-S7-tdd-evidence.yaml` | added | T017 |
| `.../stories/CAP-002-E1-S7-evidence/` (8 files: two patches, two RED logs, two GREEN logs, two mutation results) | added | T017 (INV-TDD-002) |

Nothing outside `web/src/app/*`, `web/src/api/*`, `parse-bulk-symbols.ts` or
`copy.test.ts` was touched, which T015(b) required.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `create-dialog.tsx` `CreateDialog`, `handleSubmit` (lines 133-173), posting `{ name, symbols }` through `createUniverse`; the `instrument_not_acquired` refusal (lines 160-165, 231-243); `index.tsx` `onCreated` navigates to `universeDetailPath` (lines 192-195) | `create-dialog.test.tsx` TC-COMP-006 (171-223), TC-COMP-007 (486-531) | Client half. The server refuses uncovered stocks (CAP-002-E1-S6); the dialog names them and keeps the list |
| AC-3 | SATISFIED | `index.tsx` reads every page per lifecycle (`readAllUniverses`, lines 29-39) and keeps the counts header; `universe-table.tsx` shows the list, the lifecycle badge and the origin line | `universes.test.tsx` TC-COMP-020 (121-168), TC-COMP-021 (249-291), TC-COMP-022 (293-354); T010 (356-578) | Several universes listed; retired ones separated |
| AC-5 | SATISFIED | `create-dialog.tsx` `blockedReason` (30-35); `blocked` variant, `tabIndex={0}` and `aria-describedby` (321-333); `handleSubmit` re-parses and returns while blocked (139-144) | TC-COMP-042 (`create-dialog.test.tsx` 100-154) | The "last member" half is CAP-002-E1-S9's |
| DAC-E1-1 | SATISFIED | `create-dialog.tsx` 160-165 and 231-243: every symbol of the error's `symbols` is named through `failureSentence`; Name and Stocks are kept | TC-COMP-006, including one symbol without a comma and the empty-`symbols` fallback | Client half: the names, the link and the kept list. Writing nothing is the server's (E1-S6) |
| DAC-E1-S7-1 | SATISFIED | `create-dialog.tsx` 30-35, 96-98, 321-333 | TC-COMP-042: empty, malformed-only, 1001, exactly 1000 (not blocked, sends 1000), duplicates counted per entry (DEC-0104) | Focusable (`tabIndex` 0, enabled), described by its reason, and sends nothing when clicked |
| DAC-E1-S7-2 | SATISFIED | `create-dialog.tsx` 231-243; `withLink` (38-52) links "Follow them on Data health" to `SHELL_ROUTES.followedStocks` (`/instruments`) | TC-COMP-006: an assertive alert with the exact sentence, the link `href` `/instruments`, both fields kept, no `RAW-SERVER-PROSE` | Link phrase per DEC-0254 |
| DAC-E1-S7-3 | SATISFIED | `create-dialog.tsx` line 157 `onCreated(universe.universeId)`; `index.tsx` 192-195 | TC-COMP-007: one request with the trimmed name and distinct upper-cased symbols; the detail stub rendered; no dialog, status, alert or `created`/`saved` text | |
| DAC-E1-S7-4 | SATISFIED | `index.tsx` lifecycle select (122-134, default `active`); `universe-table.tsx` `RetiredBadge` (226-246, `data-variant="secondary"`, text and icon) and the muted retired name (266) | TC-COMP-020 | |
| DAC-E1-S7-5 | SATISFIED | `universe-table.tsx` `describeOrigin` (43-79), `toProvenance` (88-107), `readOrigin` (113-127) | TC-COMP-021: eight cases, including all clauses, thresholds only, hidden only, maxima with an unknown key dropped, every bound, by hand, paging to `created` and one read per expansion | |
| DAC-E1-S7-6 | SATISFIED | `index.tsx` 72-78 (`empty-never-populated` when both counts are zero, otherwise `empty-no-match`), 169-184 | TC-COMP-022 (a), (b), (c) | The two states are distinct. How the nothing-found state is rendered is IR-001, a task deviation, not a failure of this criterion |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | The imports in the three new files resolve: `listUniverses`, `createUniverse`, `listUniverseEvents`, `ClassificationApiError` (`.symbols`, `.code`), `UniverseSummary`, `copy.ts` groups, `format.ts`, `parseBulkSymbols`, `ScreenState` | Verification task. `filterProvenance` is passed through as stored (`classification-client.ts` line 670), so no camel-case mapping is needed |
| T003 | complete | VERIFIED | `create-dialog.test.tsx` 99-154 | `A0001`-style symbols; 1001 blocked, 1000 not blocked and sent |
| T004 | complete | VERIFIED | `create-dialog.test.tsx` 171-223 | |
| T005 | complete | VERIFIED | `create-dialog.test.tsx` 486-531 | |
| T006 | complete | VERIFIED | `universes.test.tsx` 121-168 | |
| T007 | complete | VERIFIED | `universes.test.tsx` 170-291 | Every T007 case plus three more; ASCII minus asserted |
| T008 | complete | **PARTIAL** | `universes.test.tsx` 293-354 | (b) asserts that **no table** is rendered (line 328), where T008(b) says "the table header ... stay": IR-001, DEC-0255. The control is labelled *Reset filter*, not **Reset** (DEC-0254; IR-005) |
| T009 | complete | VERIFIED | `create-dialog.test.tsx` 246-479 | (a) asserts `1bad`, not `zzzz`: `parseBulkSymbols` upper-cases before the shape check, so `zzzz` is valid. A justified deviation. The paste-over-selection gap is IR-002 |
| T010 | complete | VERIFIED | `universes.test.tsx` 356-578 | (d) pins a third activation as ascending (IR-003). The unpinned `h1` level, select variant and `aria-controls` are IR-002 |
| T011 | complete | VERIFIED | `copy.ts` lines 539-569: eleven keys in `UNIVERSES`. The retire-bearing strings reuse `UNIVERSE_LIFECYCLE.counts`, `.retiredLabel` and `.noRetired`; `copy.test.ts` is unchanged and its 322 tests pass | The factor labels print the `FactorName` identifiers, as `copy.ts`'s own `sentenceClause` does, and no keyed entry was added (IR-006) |
| T012 | complete | VERIFIED | `universe-table.tsx` | `describeOrigin` is a module-scope, unexported, pure `function` with exactly the T012 signature. The bound keys are enumerated, so an unknown key is dropped. Numbers go through `formatPercentile` and `formatScore` with `String(value)`. Events are paged at 500 until `created`, and the result is cached per universe. `universeDetailPath` encodes the id: identical for UUIDs, and consistent with `SHELL_ROUTES.download` |
| T013 | complete | VERIFIED | `create-dialog.tsx` | Native `<dialog open aria-modal>`, `data-variant="standard"`; manual Tab trap; Esc cancels; focus restored on unmount; initial focus on Name; parses on paste and blur only; blur rewrite per DEC-0254; DEC-0104 count rule; distinct symbols sent; in-flight disabled; failures rendered by code, never `message` |
| T014 | complete | VERIFIED | `index.tsx` | Default export `UniversesScreen`; `cancelled` flag; every page at 500; `empty-never-populated` versus `empty-no-match`; `unreachable` renders `null`; never-populated focuses **New universe…**; no delete |
| T015 | complete | VERIFIED | Default export confirmed; `universeDetailPath` produces `/research/universes/{id}`; `render.test.tsx` passes; `describeOrigin` meets (d); the change set is limited to the T015(b) list plus the evidence directory and the story status | |
| T016 | complete | VERIFIED | Every Validation Plan command rerun and passing (Independent Validation) | |
| T017 | complete | VERIFIED | `CAP-002-E1-S7-tdd-evidence.yaml`: two cycles with `commit_hash: stage`. Each `diff_sha256` equals the SHA-256 of its `reviewed_patch`; `check-tdd-evidence.py --require-logs` reports 0 errors; the patches replay to HEAD | Two cycles grouped by file, rather than the seven suggested. The plan says "suggested", so this is allowed |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `TC-COMP-042: Create is blocked for zero or over 1000 symbols` / TC-COMP-042 | ADEQUATE | Checks `data-variant`, `toBeEnabled`, `tabindex=0` and the `aria-describedby` text; that clicking sends nothing; the 1000 and 1001 boundaries; malformed-only entries; duplicates counted. Kills `MAX_SYMBOLS` → 1001, the `> MAX` versus `>=` boundary, `recognised === 0` → 1, and the manual "submit ignores blocked", "never blocked variant" and "no describedby" mutants | none |
| `TC-COMP-006: the dialog names every uncovered symbol and keeps the list` / TC-COMP-006 | ADEQUATE | Checks the exact sentence (anchored regex), the assertive role, the link inside the alert and its `href`, both fields kept, no navigation, no envelope text, the destructive token and focus; one symbol; empty `symbols`. Kills the `dataHealth` link swap and the `symbols.length >` mutants | none |
| `TC-COMP-007: a successful create navigates to the new universe without a toast` / TC-COMP-007 | ADEQUATE | Real `Routes` with a `useParams` stub. Checks one call with the trimmed name and the distinct upper-cased symbols, the detail rendered, no dialog, status, alert or toast text. Kills "send duplicates", "untrimmed name" and "no navigation" | none |
| `TC-COMP-020: retired universes appear only under the lifecycle select` / TC-COMP-020 | ADEQUATE | Covers request parameters per selection, the option list, the accessible name per selection, the badge selected by `[data-variant=secondary]` only on the retired row, the counts unchanged, and the muted retired name. Kills the badge-on-every-row and counts-swapped mutants | none |
| `TC-COMP-021: the origin line names each clause only when it applied` / TC-COMP-021 | ADEQUATE | Eight provenance cases with exact strings; one plain text node; no U+2212 and no unknown key; two event pages with the exact cursor parameters; one read per expansion across collapse and re-expand; paging stops at `created`. Kills the factor-order, measure-formatter, direction-label, join, cursor, event-type and re-read mutants | none |
| `TC-COMP-022: never populated is distinct from a lifecycle filter that matches nothing` / TC-COMP-022 | **WEAK** | (a) checks the sentence with its Research link and the focus; (b) and (c) check the two nothing-found sentences, their resets and the request counts. Kills the reset-target, sentence-swap and focus-target mutants | (b) asserts `queryByRole("table")` absent (line 328), the inverse of T008(b)'s "the table header ... stay": IR-001 |
| `CreateDialog: parsing, focus, field errors and in-flight state` / T009 (additional) | WEAK | (a) to (h) as planned: polite counter, no per-keystroke parse, paste at the cursor, blur rewrite, Tab trap, Esc, focus restore, `universe_name_in_use` with the trimmed name, empty name, generic fallback, in-flight guard, re-parse on submit, dialog semantics | Paste over a **selected range** is unpinned. Survivor `create-dialog.tsx:manual:10` swaps `selectionEnd` for `selectionStart`: IR-002 |
| `UniversesScreen: loading, errors, paging, columns, sort and expansion` / T010 (additional) | WEAK | (a) to (h) as planned, plus stale-read cancellation and the no-delete check | The `h1` level (manual:47), the select's `inline` variant (manual:48) and the expander's `aria-controls` link (manual:45, manual:46) are unpinned: IR-002. (d) pins a third activation as ascending, contrary to `data-table` §4: IR-003 |
| `withLink` | ADEQUATE | A phrase at index 0 and a sentence without the phrase. Kills the generated `at <= 0` and `at < 1` mutants; the `slice(1, …)` mutant is killed by TC-COMP-006 and TC-COMP-022 | none |
| Existing `web/src/api/render.test.tsx` | ADEQUATE | No `dangerouslySetInnerHTML` in the tree; passes | none |

Isolation and determinism: every test mocks the fetch layer with
`vi.mock(... importActual ...)` and resets the doubles in `beforeEach`. No
test reads the network or the wall clock. The Created-date and timestamp
assertions use fixed instants rendered in a fixed zone (America/Chicago,
through `Intl`), so the host zone cannot change the result. The test files
assert literal strings, not `copy.ts` imports, as the plan directs.

### Mutation Run

- **Generated:** `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range f4deee3e319a7f7ef536df83d85d212b0fbf623f..HEAD --cycle review --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-planning-run-learnbot-cap-001-d79e92/96c5c236-c694-4a01-88e2-32b3ce2942aa/scratchpad/mutants.json` produced 54 mutants: 25 off-by-one, 25 negate-boolean, 3 drop-field-copy and 1 remove-attribute. The `copy.ts` additions are string-only and yield none.
- **Hand-written:** 50 `"operator": "manual"` mutants over `create-dialog.tsx`, `index.tsx` and `universe-table.tsx`. Each has a `why`.
- **Command:** `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-planning-run-learnbot-cap-001-d79e92/96c5c236-c694-4a01-88e2-32b3ce2942aa/scratchpad/mutants.json --jobs 4 --timeout 300 --command 'cd {workdir} && ln -sfn /Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/planning-run-learnbot-cap-001-d79e92/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules && ./node_modules/.bin/vitest run src/screens/research/universes src/screens/research/copy.test.ts' --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-planning-run-learnbot-cap-001-d79e92/96c5c236-c694-4a01-88e2-32b3ce2942aa/scratchpad/results-final.json`
- **Result:** exit 3 (survivors), with all four baselines green. Of 104 mutants, 94 were killed, 10 survived, none was stillborn and none timed out. The results are persisted beside this report as `CAP-002-E1-S7-implementation-review-v1-mutation.json`.
- **Supplementary run:** the first 98 mutants were also run with `./node_modules/.bin/tsc --noEmit &&` before Vitest and `--stillborn-pattern 'error TS[0-9]+'`: 81 killed, 13 stillborn, 4 survived. Every mutant stillborn there was killed by Vitest alone, except two. `create-dialog.tsx:189:negate-boolean:1` and `universe-table.tsx:81:off-by-one:1` fail the type check, which is how the dispositions below settle them.

| Survivor | Disposition | Reason (the contract that leaves it open) |
|----------|-------------|--------------------------------------------|
| `create-dialog.tsx:189:negate-boolean:1` (`\|\|` → `&&` in the focus-trap null guard) | equivalent | Both refs are bound to elements rendered unconditionally (`create-dialog.tsx` 252, 322), and `keydown` reaches the dialog only while it is mounted. The guard only narrows types, and the required `tsc --noEmit` rejects the mutant (stillborn in the supplementary run). No artifact specifies behaviour for an unbound ref |
| `index.tsx:53:off-by-one:1` (`reloadToken` starts at 1) | equivalent | The value is never read. It is an effect dependency whose change triggers one re-read; T014 and T010(a) specify only that **Try again** re-requests |
| `index.tsx:161:off-by-one:1` (`token + 2`) | equivalent | As above: any change of the dependency issues the same single re-read |
| `index.tsx:193:negate-boolean:1` (`setCreating(true)` in `onCreated`) | equivalent | `onCreated` then navigates to `/research/universes/:universeId`. That is a sibling `Route` of `/research/universes` (classification-ui 2.1, DEC-0068), and `UniversesScreen` renders no `Outlet`, so navigation unmounts the screen and its dialog. UX design 1.3's "the dialog closes and the interface routes to the new universe's detail" holds under the mutant |
| `universe-table.tsx:81:off-by-one:1` (`Parameters<…>[1]`) | equivalent | A type-only alias with no emitted JavaScript; `tsc --noEmit`, a required command, rejects it (stillborn in the supplementary run) |
| `create-dialog.tsx:manual:10` (paste preview keeps the replaced selection) | **not equivalent** | UX design 1.3 and the `textarea` `list` contract (§4: "parsing runs on blur and on paste, so a pasted list reports its count immediately") specify the counter after a paste: IR-002 |
| `universe-table.tsx:manual:45` (no `aria-controls`) | **not equivalent** | T012 specifies the expander's `aria-expanded`/`aria-controls`/`aria-label`: IR-002 |
| `universe-table.tsx:manual:46` (detail row loses its `id`) | **not equivalent** | Same contract: `aria-controls` must name an element: IR-002 |
| `index.tsx:manual:47` (`h1` → `h2`) | **not equivalent** | UX design 1.3 Page Layout and T014 specify "`h1` *Universes*": IR-002 |
| `index.tsx:manual:48` (select loses `data-variant="inline"`) | **not equivalent** | UX design 1.3 Page Layout and Component Mapping specify the lifecycle `select` `inline`: IR-002 |

## Independent Validation

All commands ran from the component repository root,
`repos/factorflow-v2/FactorFlow-v2`; the `scripts/` commands ran from the
harness root. `npm --prefix repos/factorflow-v2/FactorFlow-v2` runs the package script with the repository
as its working directory.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/universes web/src/screens/research/copy.test.ts web/src/api/render.test.tsx` | component repo | 0 | PASS | 4 files, 371 tests: universes 25, create-dialog 23, copy 322, render 1 |
| `npm run test` | component repo | 0 | PASS | 55 files, 1128 tests |
| `npm run lint` | component repo | 0 | PASS | Biome: 128 files, no fixes |
| `npm run format` | component repo | 0 | PASS | Biome: 128 files, no fixes |
| `npx tsc --noEmit` | component repo | 0 | PASS | strict, `noUnusedLocals`, `noUnusedParameters` |
| `npm run build` | component repo | 0 | PASS | Vite: 63 modules. `UniversesScreen` is not routed yet (CAP-002-E4-S10), so `tsc` and the tests are what cover it |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base f4deee3e319a7f7ef536df83d85d212b0fbf623f --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate …` / `run …` (Mutation Run) | harness root | 0 / 3 | PASS (ran) | 104 mutants: 94 killed, 10 survived (5 equivalent, 5 not, IR-002). Exit 3 means "survivors present" |
| Patch replay: `git archive f4deee3 web/src/screens/research` into scratch, then `git apply --include='web/*'` of `cycle-1.patch` then `cycle-2.patch`, then `cmp` against HEAD | scratch | 0 | PASS | All six `web/` files are byte-identical to HEAD. `shasum -a 256` of the patches equals each cycle's `diff_sha256` (`f5db0664…`, `d3ac437d…`) |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S7.md` | harness root | 0 | PASS | `sha256:a97c236e…`, equal to the approval's `reviewed_revision` |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan excludes it: the Playwright specs and TC-E2E cases belong to later automation work, and need E4-S10's route and E1-S9's detail. Not a required command for this story |

Required validation count: the six T016 commands (the focused suite, `npm run
test`, lint, format, `tsc` and the build) plus the TDD-evidence lint make
seven. All seven pass.

### Validation Side Effects

- Before: HEAD `09d4504`. `git status --porcelain -uall` was empty. `code-revision` was `sha256:7d4012ceb5ee63081eb36b718e94e7601b33597b58fa4b8eef7d4f0bf89a976a`.
- After: HEAD `09d4504`. `git status --porcelain -uall` was empty. `code-revision` was the same value.
- Unexpected tracked-file changes: none. The build writes only into the ignored `src/factorflow/api/static/`. The mutation runs used `--shared` clones under the session scratchpad, and wrote nothing into the component repository.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | The nothing-found state drops the table header that T008(b) requires, and its test asserts the opposite (DEC-0255) |
| IR-002 | MEDIUM | initial | Five non-equivalent mutants survive: paste over a selection, the expander's `aria-controls` link, the `h1` level and the select's `inline` variant are unpinned |
| IR-003 | MEDIUM | initial | The Name sort never returns to unsorted, contrary to `data-table` §4, and a test pins it |
| IR-004 | LOW | initial | A re-filter collapses the table to *Loading…*, and the error state removes the table, unlike `data-table` §4 |
| IR-005 | LOW | initial | DEC-0254 says no artifact fixes the reset control's label, but T008(b) names it **Reset** |
| IR-006 | LOW | initial | `copy.ts` catalogue conventions: unkeyed factor and timestamp labels, and doc comments that misstate their source |
| IR-007 | LOW | initial | Focus is lost to `<body>` after **Reset filter** and **Try again** (STD-UI-24) |

### IR-001 — The nothing-found state drops the table header that T008(b) requires, and its test asserts the opposite

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S7-6, AC-3 (the criterion itself is satisfied; the planned rendering of its state is not)
- **Tasks**: T008 (PARTIAL), T014
- **Files**:
  - `web/src/screens/research/universes/index.tsx` 173-188: the `empty-no-match` branch renders only the sentence and the reset, and `UniverseTable` renders only in `populated`.
  - `web/src/screens/research/universes/universes.test.tsx` 314-336: line 328 is `expect(screen.queryByRole("table")).not.toBeInTheDocument()`.
- **Claim challenged**: T008 is ticked complete. The TDD evidence (cycle-2 `green_evidence`) says "the plan's T008(b) 'table header' is read as the card header".
- **Observed evidence**:
  - After *Retired* returns no rows, the screen shows *No retired universes.* and **Reset filter** with no `<table>`.
  - The (c) variant, *No active universes.*, renders the same way.
  - The mandatory TC-COMP-022 test pins the absence of the table.
  - The reading is recorded only in the evidence prose. No decision record covers it, although this is an unattended run (`docs/unattended-mode.md`).
- **Expected evidence/behavior**:
  - T008(b): "the screen shows *No retired universes.* with a **Reset** control …, the table header and the *2 active, 0 retired* line stay". T008(a), by contrast, has "no table" for the never-populated state.
  - UX design 1.3 Component Mapping binds the Universe list to `design-system/components/data-table/design-spec.md`. Its §3 Anatomy makes the header row required, and makes the empty state one that "replaces the body when zero rows match".
  - DEC-0255 (this review, `decided_by: agent`, medium confidence) records this reading and the rejected card-header reading.
- **Impact**:
  - Switching the lifecycle select to a selection that matches nothing makes the column headers vanish, so the nothing-found state looks like a different screen rather than the same table with an empty body.
  - The suite now rejects the planned behaviour: a coder who implements T008(b) as written turns TC-COMP-022 red.
  - An interpretation that decides a mandatory test was taken silently.
- **Required remediation**:
  - In both nothing-found states (*No retired universes.* and *No active universes.*), keep the universes table's column header row (Name, Lifecycle, Members, Created) rendered. The empty-state sentence and its reset take the place of the body.
  - Keep the never-populated state without a table.
  - Change TC-COMP-022 (b), and (c) for consistency, to assert that the four column headers are present and that no data row is rendered.
  - Record a decision for any further interpretation the change needs.

### IR-002 — Five non-equivalent mutants survive: behaviour the plan and the UX design specify is not pinned by the additional tests

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete)
- **Tasks**: T009, T010 (tests); T012, T013, T014 (the behaviour)
- **Files**:
  - `create-dialog.tsx` 125-131: `handlePaste`.
  - `universe-table.tsx` 270 and 292: `aria-controls` and the detail row's `id`.
  - `index.tsx` 116 and 124: the `h1` and the select's `data-variant`.
  - The tests: `create-dialog.test.tsx` 248-298 and `universes.test.tsx` 356-578.
- **Claim challenged**: The TDD evidence reports a mutation score of 1.0 for both cycles. It lists "no paste test replaces a selected range" only as a carried LOW follow-up.
- **Observed evidence**: Five mutants survive the focused suites:
  - `create-dialog.tsx:manual:10` replaces `field.value.slice(field.selectionEnd)` with `slice(field.selectionStart)`. A paste over a selected range then counts the replaced text in the preview, and the counter and **Create**'s blocked state are wrong until blur.
  - `universe-table.tsx:manual:45` and `:manual:46` remove the expander's `aria-controls`, or the `id` it names.
  - `index.tsx:manual:47` renders the title as `h2`.
  - `index.tsx:manual:48` drops the select's `inline` variant.

  Each is undetected because the tests check heading presence by name only, check the toggle only by name and `aria-expanded`, and paste only at a collapsed cursor.
- **Expected evidence/behavior**:
  - UX design 1.3 and `textarea` §4 (parsing on paste "so a pasted list reports its count immediately").
  - T012's expander "`aria-expanded`/`aria-controls`/`aria-label`".
  - UX design 1.3 Page Layout and T014: "`h1` *Universes*".
  - UX design 1.3: "the lifecycle `select` `inline`".
  - adversarial-review E.9: a survivor that is not equivalent makes the test that should kill it `WEAK`.
- **Impact**:
  - The production code is correct today.
  - A regression in any of these four behaviours would pass the suite. The paste regression would show a wrong recognised count, and possibly a wrong blocked reason, to a keyboard or screen-reader user after paste-replacing a selection.
- **Required remediation**: Make each of the five mutants fail a test:
  - a paste that replaces a selected range and asserts the resulting count;
  - the expander's `aria-controls` naming the expanded row's `id`;
  - the title's heading level 1;
  - the select's `data-variant="inline"`.

### IR-003 — The Name sort never returns to unsorted, contrary to the `data-table` contract, and a test pins it

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010(d), T012
- **Files**: `web/src/screens/research/universes/universe-table.tsx` 190-196 (the `setSort` toggle); `universes.test.tsx` 457-458
- **Claim challenged**: T010(d) and T012 are complete. The sort follows the `data-table` pattern.
- **Observed evidence**:
  - The sort control alternates ascending ↔ descending: `sort === "ascending" ? "descending" : "ascending"`.
  - After the first activation, the server order (`aria-sort="none"`) cannot be restored without reloading.
  - The test asserts that the third activation gives `aria-sort="ascending"`.
- **Expected evidence/behavior**:
  - UX design 1.3 Component Mapping binds the list to `data-table`. Its §4 Interaction Contract says `Enter`/`Space` on a sort control "Cycles ascending → descending → unsorted".
  - T010(d) fixes only the first two activations, so nothing in the plan overrides the contract for the third.
- **Impact**: A keyboard or pointer user cannot get back to the default order. The test would reject a correct implementation of the component contract.
- **Required remediation**: Make the third activation return to `aria-sort="none"` and the loaded order, and change T010(d)'s test to match. If the two-state cycle is intended, record a decision that overrides `data-table` §4 for this table.

### IR-004 — A re-filter collapses the table to *Loading…*, and the error state removes the table, unlike `data-table` §4

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014, T010(a)
- **Files**: `web/src/screens/research/universes/index.tsx` 63-101 (line 65 sets `loading` on every selection change), 150-167, 186-188
- **Claim challenged**: The loading and error states follow the design.
- **Observed evidence**:
  - On every lifecycle change the screen state becomes `loading`, the table unmounts and *Loading…* replaces it.
  - In the error state the table is absent and only the card header remains.
- **Expected evidence/behavior**:
  - `data-table` §4: "On re-sort or re-filter, keep existing rows visible and dim them; never collapse the table to a spinner", and "Error: keep the header and toolbar rendered, replace the body with the error and a retry action".
  - UX design 1.3 States: "Error | Header kept, body replaced …".
  - T010(a) and T014 say only "header kept" and direct *Loading…* text for the first load, so the plan's wording is ambiguous here, and this finding does not block.
- **Impact**: Each lifecycle switch flashes the table away, and the owner loses their place. The error body does not sit under the table header the contract describes.
- **Required remediation**:
  - Keep the loaded rows (dimmed) while a new lifecycle selection loads.
  - Render the error body under the table header row.
  - Or record a decision that the plan's "header kept" means the card header.

### IR-005 — DEC-0254 says no artifact fixes the reset control's label, but T008(b) names it **Reset**

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T008
- **Files**: `projects/factorflow-v2/decisions/DEC-0254.md` (harness); `copy.ts` `UNIVERSES.resetFilter`; `index.tsx` 176-182
- **Claim challenged**: DEC-0254's question says the label of the nothing-found reset is unfixed: "UX 1.3 says 'a reset to Active', DEC-0103 'a reset to All'".
- **Observed evidence**:
  - T008(b) of the task plan, the artifact DEC-0254 cites, specifies "a **Reset** control". Bold marks a control's label throughout this plan, as in **Create**, **Try again** and **New universe…**.
  - The implementation labels it *Reset filter*.
- **Expected evidence/behavior**: `docs/decision-records.md`: a record's question states what the artifacts say, so the owner can judge it again later.
- **Impact**: The owner's review of DEC-0254 would weigh the delivered precedent (*Reset filter* on Instruments and Coverage) against design silence, not against the plan's own **Reset**.
- **Required remediation**: Amend DEC-0254's question and derivation to cite T008(b)'s **Reset** and say why *Reset filter* is preferred. No code change is required unless the owner overrides the record.

### IR-006 — `copy.ts` catalogue conventions: unkeyed factor and timestamp labels, and doc comments that misstate their source

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T012
- **Files**:
  - `universe-table.tsx` 19 and 62: `FACTORS` printed as display text.
  - `universe-table.tsx` 295-297: `` `${UNIVERSES.columns.created} ${…}` `` and `` `${UNIVERSE_LIFECYCLE.retiredLabel} ${…}` ``.
  - `copy.ts` 539-549: `hideDetailsFor`, `loading`, `resetFilter`.
- **Claim challenged**: T011 says every owner-facing string the story needs is one keyed `copy.ts` entry. Its list includes "the factor labels *value*, *growth*, *momentum*".
- **Observed evidence**:
  - The origin line prints the factor identifiers from a local array. `copy.ts`'s own `sentenceClause` does the same, so this is consistent with the catalogue owner's practice, but no keyed entry exists.
  - The expanded row composes *Created {timestamp}* and *Retired {timestamp}* in the component. The wording is a reasonable derivation from existing labels, but UX design 1.3 gives no label for these lines, and neither a keyed entry nor a decision records it.
  - `copy.ts`'s header requires a message no design contains to say so in its doc comment. `loading` and `resetFilter` do not.
  - `hideDetailsFor` cites "UX 1.3 Accessibility", which gives only *Show details for Tech*.
- **Expected evidence/behavior**:
  - classification-ui 2.1: `copy.ts` holds "every owner-facing string".
  - T011.
  - The `copy.ts` header convention (CAP-002-E4-S2 Open Gap 6).
- **Impact**: A later change to these labels needs edits outside the catalogue, and the doc comments misstate where three strings come from.
- **Required remediation**:
  - Key the two expanded-row lines in `copy.ts`, or record their wording.
  - Either key the lowercase factor labels or note that the `FactorName` identifiers are the labels, as `sentenceClause` does.
  - Correct the three doc comments.

### IR-007 — Focus is lost to `<body>` after **Reset filter** and **Try again**

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014, T012
- **Files**: `index.tsx` 159-165, 176-182; `universe-table.tsx` 322-328
- **Claim challenged**: The screen meets the shared accessibility rules.
- **Observed evidence**: Each control unmounts when activated, as the state returns to `loading`, and nothing receives focus afterwards. The TDD evidence notes this as a carried LOW, and the delivered Instruments and Coverage screens behave the same way.
- **Expected evidence/behavior**: STD-UI-24: "focus MUST be managed on dialogs and on content inserted into the page".
- **Impact**: A keyboard user who resets the filter or retries loses their place and starts again from the top of the document.
- **Required remediation**: After a reset or a retry, move focus to a stable control, such as the lifecycle select or the table, or keep the activated control mounted.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified: T009(a) asserts `1bad` rather than the plan's `zzzz`.** CAP-001's `parseBulkSymbols` upper-cases before the shape check, so `zzzz` is a valid symbol. UX design 1.3's example reason cannot be produced with that input.
- **Justified: Two TDD cycles instead of the seven suggested.** T017 calls its list "suggested". Each cycle's patch, reviews, `diff_sha256` and mutation block are present, and they lint clean.
- **Justified: `universeDetailPath` encodes the id.** The plan's literal is `/research/universes/${id}`. The two are identical for UUIDs, and `SHELL_ROUTES.download` follows the same convention.
- **Justified: The loading state is *Loading…* text, not UX design 1.3's skeleton.** T010(a) and T014 direct it.
- **Justified: The story status changed from `planning` to `in-review`.** That is the `story-coding` lifecycle, and the story's content revision is unchanged.
- **Recorded decision: The reset control is labelled *Reset filter*.** DEC-0254 (provisional) chose it; IR-005 covers its premise.
- **Bookkeeping:**
  - All 16 tasks are ticked. T008 is `PARTIAL` (IR-001); the other 15 are `VERIFIED`.
  - The cycle-1 survivor disposition in the evidence (`create-dialog.tsx:189`) agrees with this review.
  - The cycle-2 dispositions of `index.tsx:53`, `:161`, `:193` and `universe-table.tsx:81` also agree.
- **Scope leakage: none.** Every changed file is justified by a task or by T017's evidence.
- **Observation for the owner, no finding: two builders of the origin line.** `copy.ts`'s `savedFromFilter` (CAP-002-E4-S2, unused in production; `copy.test.ts` only) and this story's `describeOrigin` disagree in two cases:
  - Hidden-only: `savedFromFilter` gives *Saved from a filter on D: stocks …*, `describeOrigin` gives *Saved from a filter on D; stocks …*.
  - No clauses: `savedFromFilter` leaves a trailing `: `.

  DEC-0108 rejected a duplicate builder because "two wordings of one line drift". This story's T007(c) pins `describeOrigin`'s form. Retiring or aligning `savedFromFilter` belongs to CAP-002-E4-S2 or CAP-002-E4-S8, not to this story.
- **Observation for the owner, no finding: Esc in the Stocks field.** It closes the dialog and discards the list. `dialog` §4 says Esc closes `standard`, and T009(c) directs Esc to `onCancel`. But `textarea` §4 says Esc "does nothing … because discarding a long paste on a single keystroke is unrecoverable". The two component contracts do not say how they compose, so the plan's choice stands.
- **Harness state:** DEC-0254 (the coder's) and DEC-0255 (this review's) are new, uncommitted files under `projects/factorflow-v2/decisions/` in the harness. The driver commits them.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of CAP-002-E1-S7), then the Adversarial Review Agent for v2
- **Required action**:
  - Resolve IR-001: keep the column header row in both nothing-found states, and change TC-COMP-022 (b) and (c) to assert it.
  - Rerun the Validation Plan and update the TDD evidence with a new cycle.
  - IR-002 and IR-003 (MEDIUM) should be fixed in the same rework. v2 scopes them `carried`.
  - IR-004 to IR-007 (LOW) are optional. Any fix that changes owner-facing wording needs a recorded decision.
  - The rework commit, or the driver's stage commit, carries `Decision-Id: DEC-0255`.
- **Warnings accepted downstream**: N/A
