---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S8-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-01
updated: 2026-11-01
story_id: "CAP-002-E1-S8"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S8.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S8-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-01T22:30:37Z"
reviewed_head: "a2e3f84e1ba5f99fdc29232de247cbf834f57267"
review_base: "85254d12f58d74865c59c95d9a21e986d6c79713"
reviewed_state_revision: "sha256:650f862eee13e71f14bc02824e0efa9670bb080bd8a9703e01994e341f3a16a5"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S8
    artifact_version: 1
    content_revision: sha256:63b41c7485cb4bb86af97f85e5d94d1d55b92d37d461db1bb175ee3027762b58
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.316"
  timestamp: 2026-11-01T22:59:12Z
  source_artifacts:
    - id: CAP-002-E1-S8
      version: "1 (sha256:63b41c7485cb4bb86af97f85e5d94d1d55b92d37d461db1bb175ee3027762b58)"
    - id: CAP-002-E1-S8-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E1-S8-tdd-evidence
      version: "cycle-1 to cycle-3"
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
    - id: DEC-0097
      version: "applied, owner upheld"
    - id: DEC-0105
      version: "applied, owner upheld"
    - id: DEC-0106
      version: "applied, owner upheld"
    - id: DEC-0107
      version: "applied, owner upheld"
    - id: DEC-0145
      version: "applied, owner upheld"
    - id: DEC-0159
      version: "applied, owner upheld"
    - id: DEC-0263
      version: "open, decided_by agent (this review)"
    - id: STD-UI (ui-conventions)
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S8 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 7/7 passed |

This is an initial review, so every finding is in scope and none blocks on
scope grounds. The change set is the one story commit `a2e3f84` on the frozen
integration base `85254d1`. It adds `remove-dialog.tsx`, `history-tab.tsx` and
`members-tab.tsx`, their three test files and seven `copy.ts` strings. All 13
criteria trace to production code and to tests that assert the observable
outcome. All six mapped TC-IDs (029, 043, 055, 056, 057, 119) are implemented
and carry their `Implements` comment, and all 17 tasks are verified. T011 is a
recorded no-op: E4-S5 and E4-S6 had already delivered both seams.

All seven required validation commands pass. `npm run lint` and `npm run
format` fail or hang in the shared checkout, but only on the git-ignored
`build/lib` packaging output. That directory predates the story commit and is
outside the review subject. Both commands pass unchanged on a clean clone of
`a2e3f84` whose fingerprint equals the checkout's (DEC-0263).

The TDD-evidence lint is clean. Every cited patch, log and results file matches
its hash, and the three cycle patches replay byte-identically onto the base.

The mutation run covered the whole change set: 85 generated and 69 hand-written
mutants. Of the 154, 128 were killed and 26 survived; 24 survivors are
equivalent. The other two (IR-002, IR-003) show behaviour the production code
gets right that no test pins. In both cases the test that would kill the
survivor lies outside the plan's mandatory T002–T009 set, so each is a MEDIUM
test-strength finding, not a WEAK mandatory test. The as-of line's live region
(IR-001) does not let a screen reader learn the date changed. Neither that nor
the two LOW findings makes a criterion, task or validation incomplete.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 2 · **total 5**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S8.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S8-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S8-run-20261101T205736Z` |
| HEAD | `a2e3f84e1ba5f99fdc29232de247cbf834f57267` |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261101T205736Z` → `85254d12f58d74865c59c95d9a21e986d6c79713` (resolved by `pipeline-state.py review-base --base-ref`; ancestor of HEAD, verified with `git merge-base --is-ancestor`) |
| Working tree | Clean: `git status --porcelain=v1 -uall` empty before and after validation; ignored `build/` and `src/factorflow/api/static/` outputs present (see Validation Side Effects) |
| Changed files reviewed | 22 (one commit, `a2e3f84`, "feat(web): CAP-002-E1-S8 story-coding - universe Members and History tabs, as-of view and remove dialog") |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/universes/detail/remove-dialog.tsx` | added | AC-5, AC-6, DAC-E1-7, DAC-E1-S8-4, DAC-E1-S8-5; T012 |
| `web/src/screens/research/universes/detail/remove-dialog.test.tsx` | added | TC-COMP-043, TC-COMP-057; T006, T007 |
| `web/src/screens/research/universes/detail/history-tab.tsx` | added | AC-4, AC-6, DAC-E1-S8-6; T013 |
| `web/src/screens/research/universes/detail/history-tab.test.tsx` | added | TC-COMP-029; T008, T009 |
| `web/src/screens/research/universes/detail/members-tab.tsx` | added | AC-4, AC-5, AC-6, AC-15, DAC-E1-8, DAC-E1-9, DAC-E1-S8-1 to DAC-E1-S8-4; T014 |
| `web/src/screens/research/universes/detail/members-tab.test.tsx` | added | TC-COMP-055, TC-COMP-056, TC-COMP-119; T002 to T005 |
| `web/src/screens/research/copy.ts` | modified (+36) | T010: `UNIVERSE_LIFECYCLE.lastMemberRefused`, `UNIVERSE_DETAIL.removeAction`, `asOfFiltersNote`, `malformedDate`, `noLongerMember`, `renamedDetail`, `loadMore` |
| `docs/.../stories/CAP-002-E1-S8.md` | modified | Story lifecycle `status: planning` → `in-review` (story-coding) |
| `docs/.../stories/CAP-002-E1-S8-tasks.md` | modified | T001 to T017 checkboxes ticked; no other change (`git diff --word-diff`) |
| `docs/.../stories/CAP-002-E1-S8-tdd-evidence.yaml` | added | T017 |
| `docs/.../stories/CAP-002-E1-S8-evidence/cycle-1.patch` | added | T017 (cycle-1 reviewed patch) |
| `docs/.../stories/CAP-002-E1-S8-evidence/cycle-2.patch` | added | T017 (cycle-2 reviewed patch) |
| `docs/.../stories/CAP-002-E1-S8-evidence/cycle-3.patch` | added | T017 (cycle-3 reviewed patch) |
| `docs/.../stories/CAP-002-E1-S8-evidence/red-cycle-1.log` | added | T017 (RED log) |
| `docs/.../stories/CAP-002-E1-S8-evidence/red-cycle-2.log` | added | T017 (RED log) |
| `docs/.../stories/CAP-002-E1-S8-evidence/red-cycle-3.log` | added | T017 (RED log) |
| `docs/.../stories/CAP-002-E1-S8-evidence/green-cycle-1.log` | added | T017 (GREEN log) |
| `docs/.../stories/CAP-002-E1-S8-evidence/green-cycle-2.log` | added | T017 (GREEN log) |
| `docs/.../stories/CAP-002-E1-S8-evidence/green-cycle-3.log` | added | T017 (GREEN log) |
| `docs/.../stories/CAP-002-E1-S8-evidence/mutation-cycle-1-results.json` | added | T017 (cycle mutation results) |
| `docs/.../stories/CAP-002-E1-S8-evidence/mutation-cycle-2-results.json` | added | T017 (cycle mutation results) |
| `docs/.../stories/CAP-002-E1-S8-evidence/mutation-cycle-3-results.json` | added | T017 (cycle mutation results) |

`docs/...` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance`.
No file under `web/src/app/`, `web/src/api/`, `results-table.tsx`,
`filters-pane.tsx`, `copy.test.ts` or any CAP-001 screen changed
(`git diff --stat` over those paths is empty), as T015(b) requires.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `remove-dialog.tsx:RemoveDialog`, `RemoveAction`; `members-tab.tsx:confirmRemoval` (294-310) calls `removeUniverseMember`; `history-tab.tsx:detail` (207-212) renders `old → new` for `renamed` | `members-tab.test.tsx` "removes on confirm, re-reads, announces…"; `history-tab.test.tsx` "lists events newest first and shows both names on a rename" | S8's slice of AC-4: remove a member, and the history shows a rename with both names. Add, rename and retire are E1-S9's (task plan Summary) |
| AC-5 | SATISFIED | `RemoveAction` `soleMember` → `data-variant="blocked"`, inert click, reason via `aria-describedby`, **Retire…** adjacent (212-238); `members-tab.tsx` 336 `soleMember={memberCount === 1}`; `last_member` backstop (`RemoveDialog` 107, 141-150) | `remove-dialog.test.tsx` TC-COMP-043 (a, b); `members-tab.test.tsx` "blocks the sole member's Remove… and offers Retire…", "keeps the dialog open with Retire… on the last_member backstop" | |
| AC-6 | SATISFIED | As-of view on `getUniverse(universeId, { asOf })` (`members-tab.tsx` 200-228, `AsOfMembers`); history newest first, never filtered (`history-tab.tsx`); dialog description states history stays | TC-COMP-055, TC-COMP-056, TC-COMP-057, TC-COMP-029 tests | |
| AC-15 | SATISFIED | Current view passes every row through `FactorCell` (via `ResultsTable`); no filter on lifecycle; `scopedQuery` forces `scope: universeId` (140) | `members-tab.test.tsx` TC-COMP-119 test; "renders a returned retired cell through the factor cell as Not followed" | Membership side only, as the story states |
| DAC-E1-7 | SATISFIED | `last_member` keeps the dialog with the DEC-0107 alert and **Retire…** in place of the confirm; `universe_retired` alert (`errorSentence` 10-23) | `remove-dialog.test.tsx` TC-COMP-043 (b), "renders universe_retired as the retired refusal…"; `members-tab.test.tsx` "keeps the dialog open with the retired refusal on universe_retired" | Server refusals are E1-S6's; S8 renders them by code |
| DAC-E1-8 | SATISFIED | `getUniverse` with `asOf`; `asOfBeforeCreation` → did-not-exist sentence with the America/Chicago creation date (`CHICAGO_DATE`, 53-58, 491-500) | TC-COMP-055 (a); TC-COMP-056 incl. the 03:30Z boundary | Event-replay semantics are the server's (E1-S6) |
| DAC-E1-9 | SATISFIED | A retired member stays a row and keeps its **Remove…** (`RemoveAction` per row regardless of lifecycle) | TC-COMP-119 test asserts the row, three badges and `Remove OLD from Tech` | |
| DAC-E1-S8-1 | SATISFIED | `submitAsOf` (258-271): `^\d{4}-\d{2}-\d{2}$` plus calendar check, empty is nothing; 422 → field error (220-222); line `Members as of {date}. Scores shown are from the current set.` + DEC-0105 note in a polite `output` (504-506) | `members-tab.test.tsx` T002 (a)–(e): six malformed inputs incl. `2026-02-30` and `2025-02-29`, leap day accepted, 422 keeps the previous table, no list read in the as-of view | IR-001 (live region announcement) and IR-002 (test strength) do not make it incomplete |
| DAC-E1-S8-2 | SATISFIED | `AsOfMembers` 491-500 renders only the sentence; no table, no nothing-found sentence | TC-COMP-056 tests (14:20Z and the 03:30Z Chicago boundary) | |
| DAC-E1-S8-3 | SATISFIED | `scopedQuery` (140) and `onQueryChange` keeping the URL scope (141-144): every list read carries `universeId`; `FactorCell` renders `reasonCode: "retired"` as *Not followed* | TC-COMP-119 test asserts every `listClassifications` call has `universeId: "u-tech"`; "scopes the list read to the universe whatever scope the URL carries" | Mutants m03 and m04 (scope dropped or written to the URL) are killed |
| DAC-E1-S8-4 | SATISFIED | `RemoveAction` blocked form (212-238); `RemoveDialog` `last_member` → **Retire…** (141-150); focus routed to **Retire…** (79) | TC-COMP-043 (a, b); focus tests "keeps focus on Retire…", "moves focus to Retire… when last_member arrives…" | |
| DAC-E1-S8-5 | SATISFIED | `data-variant="confirm"` (118), description (124), **Remove from universe** (159), initial focus on **Cancel** (60-66), manual Tab trap (82-105), Esc (83-87), focus restore on unmount (64) | TC-COMP-057 test and the trap, Esc, restore and pending tests in `remove-dialog.test.tsx` | Mutants r01–r15 on these lines are all killed |
| DAC-E1-S8-6 | SATISFIED | Rows in API order (newest first), never re-sorted; `previousName` (34-36), auto-read across pages while the oldest loaded name-bearing event is a rename (152-160) | TC-COMP-029 tests; T009 (e) "reads further pages on its own until a rename's old name is found" and "stops reading on when the cursor ends…" | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `CAP-002-E1-S8-tdd-evidence.yaml` header lines 15-20 record the producer names | Independently confirmed: `members[].factors` and `.name` nullable (`classification-types.ts` 222-228); `format.ts` has no Chicago date helper; `FiltersPane` has `showLookIn`, `children` and its own `<section aria-label="Filters">` (166); `ResultsTable` `extraColumns` with `placement` (82-88), rows `tr[data-symbol]` (833-834) |
| T002 | complete | VERIFIED | `members-tab.test.tsx` 213-479 | (a)–(e) all present, with literal strings |
| T003 | complete | VERIFIED | `members-tab.test.tsx` 481-513 | Includes the 03:30Z Chicago boundary |
| T004 | complete | VERIFIED | `members-tab.test.tsx` 517-543 | |
| T005 | complete | VERIFIED | `members-tab.test.tsx` 545-907 | (a)–(j). (h) exercises search and sort through the pane and URL, not a threshold row; thresholds use the same pane `setQuery` path, which E4-S5's own tests cover |
| T006 | complete | VERIFIED | `remove-dialog.test.tsx` 24-152 | |
| T007 | complete | VERIFIED | `remove-dialog.test.tsx` 154-346 | |
| T008 | complete | VERIFIED | `history-tab.test.tsx` 91-132, 273-283 | |
| T009 | complete | VERIFIED | `history-tab.test.tsx` 134-464 | (a)–(g); (h) is the repo's `web/src/api/render.test.tsx`, which scans `web/src` recursively and passes; no exception added |
| T010 | complete | VERIFIED | `copy.ts` diff (+36): seven keys added, the rest reused | The one new retire-bearing string (`lastMemberRefused`) is in `UNIVERSE_LIFECYCLE`; `copy.test.ts` unchanged and passing (358 tests) |
| T011 | complete | VERIFIED | No edit to `filters-pane.tsx` or `results-table.tsx` | Justified no-op the task itself allows; recorded in the TDD evidence (cycle-3 description) |
| T012 | complete | VERIFIED | `remove-dialog.tsx` | Props as planned |
| T013 | complete | VERIFIED | `history-tab.tsx` | Justified deviation: a local union replaces `ScreenState` (see Scope and Plan Deviations) |
| T014 | complete | VERIFIED | `members-tab.tsx` | Props as planned; IR-001, IR-002 and IR-004 are non-blocking warnings on it |
| T015 | complete | VERIFIED | Named exports `MembersTab`, `HistoryTab`, `RemoveDialog`, `RemoveAction`; change set limited as listed; `results-table.test.tsx` 97 and `filters-pane.test.tsx` 41 pass; no route, tab container or header in the files | |
| T016 | complete | VERIFIED | Independent Validation below | |
| T017 | complete | VERIFIED | `CAP-002-E1-S8-tdd-evidence.yaml`: three cycles, `commit_hash: stage`, reviews APPROVED, no drift | Lint clean; every hash matches; patches replay byte-identically to HEAD |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| "requests as_of for a typed date and labels the table with it" / TC-COMP-055 (T002 a) | ADEQUATE | `onAsOfChange` once with the date; `getUniverse("u-tech", { asOf })`; polite status text; cell texts incl. *Member since* in Chicago time; header order; no **Remove…**; **Show current members** → `null` | none (announcement timing is IR-001, not testable in jsdom) |
| "refuses %s as a field error with no request" ×6, "accepts a leap day", "treats an empty date…" / TC-COMP-055 (T002 b) | ADEQUATE | `aria-invalid`, accessible description, alert text, zero as-of reads, recovery on a valid date; `2026-02-30` and `2025-02-29` pin the calendar check | none |
| "shows a 422 on the as-of read as the field error and keeps the previous table", "shows only the field error when the first as-of read is a 422", "never keeps another universe's as-of table…" / TC-COMP-055 (T002 c) | ADEQUATE | 422 → field error, previous rows and line kept; none on first read; none across universes | The return to current members is not exercised (IR-004) |
| "does not read the list or apply filters in the as-of view, and says so once" / TC-COMP-055 (T002 d) | ADEQUATE | No list read with a filtered URL; returned order kept; filters note exactly once | none |
| "renders a member with null factors and a null name with em dashes, never a badge" / TC-COMP-055 (T002 e) | ADEQUATE | Name and three factor cells are exactly `—` in `.text-value-missing`, no `data-variant`, no bar; `AAPL` still percentiled | none |
| "replaces the as-of table with the failure sentence and Try again on another error" (coder-added; not in T002–T005) | WEAK | Sentence by code, no envelope text, Try again re-reads | Never asserts the field stays valid: mutant m19 survives (IR-002) |
| TC-COMP-056 tests (T003) | ADEQUATE | Exact sentence; no table; no nothing-found sentence; Chicago boundary | none |
| TC-COMP-119 test and "scopes the list read…" (T004) | ADEQUATE | Row present, three `status-neutral` *Not followed*, no percentile or bar, named **Remove…**, every list call scoped | none |
| T005 (a)–(j) tests | ADEQUATE | Column order and *Member since* join by symbol (two different times); `h2` count heading; named actions; retired universe; remove flow with re-reads, `onMembershipChanged` once, status text, focus to the next row (also beyond the first window) or heading; `universe_retired`, `last_member`, generic and `not_a_member` paths; search and sort via URL keeping scope; sole member blocked; one *Filters* region | Three tests end before their reads settle (IR-005) |
| TC-COMP-043 tests (T006 a, b) | ADEQUATE | `blocked`, enabled, `tabindex=0`, described by the reason, inert to click, Enter and Space, **Retire…** next in tab order in the same container; ghost form; click never reaches the row; `last_member` alert and **Retire…** in place of the confirm | none |
| TC-COMP-057 tests (T007) | ADEQUATE | `confirm` never `destructive`, `aria-modal`, title, description as accessible description, initial focus on Cancel, Esc, two-way trap, restore on unmount, pending disables the confirm only, focus kept inside through pending and `last_member`, generic and `universe_retired` alerts | none |
| TC-COMP-029 tests (T008) | ADEQUATE | Native table, `data-variant="history"`, headers, order, labels, `formatTimestamp` with zone, both names from the nearest older name-bearing event | none |
| T009 (a)–(g) tests | ADEQUATE | Links; *View members as of this event* only on `created` and member rows, passing `recordedOn` (Chicago date distinct from UTC); *Retired* with no detail; `limit` 50, **Load more**, append in order; automatic reads across pages and stop at the end; errors by code with Try again from page one; `universe_not_found` link; busy skeleton | none |
| "ignores a slower read for a universe it no longer shows" (coder-added for T013) | WEAK | First-page supersession only | A later page settling after `universeId` changes is not covered: mutant h09 survives (IR-003) |

Mandatory component mappings: all six TC-IDs mapped to S8 in the coverage
matrix (rows for DAC-E1-S8-1 to DAC-E1-S8-6) are implemented with an
`Implements TC-COMP-0NN` comment. Mocks replace only the fetch layer
(`vi.mock` of `classification-client` keeping the real `ClassificationApiError`),
so the real `ResultsTable`, `FiltersPane` and `FactorCell` run in every
members-tab test. Time is fixed by literal ISO instants and formatted in
America/Chicago, never the machine zone.

Each cycle's RED is an import-resolution failure of the new test file before
its module existed. That is the accepted precedent for new modules in this
capability (CAP-002-E1-S7), and the mutation run is the stronger evidence
that the tests discriminate.

### Mutation Run

- **Generated:** `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 85254d12f58d74865c59c95d9a21e986d6c79713..a2e3f84e1ba5f99fdc29232de247cbf834f57267 --cycle review --out $SCRATCH/mutants.json` produced 85 mutants: 51 negate-boolean, 26 off-by-one, 4 drop-defaulted-argument, 3 drop-field-copy and 1 remove-attribute. They cover every changed production file: `members-tab.tsx` 46, `history-tab.tsx` 29 and `remove-dialog.tsx` 10. The seven `copy.ts` additions are string literals and generate none; their wording is pinned by the tests' literal assertions.
- **Hand-written:** 69 `"operator": "manual"` mutants on lines the catalogue does not reach:
  - `members-tab.tsx` `m01`–`m36`: the two view branches, the forced scope, focus after removal, `not_a_member`, the retired universe, the kept 422 result and its reset, before-creation, the Chicago date and zone, the null name and null factors, the filters note, the empty submit, the error-code check, the re-reads and callbacks, the sole member, Show current members, `onResult`, `matchLabel`, the Clear-filters scope, `aria-invalid` and its description, the as-of `asOf` argument, the heading level, Try again, and the pane's children.
  - `remove-dialog.tsx` `r01`–`r15`: the trap with a disabled confirm, focus routing, initial focus and restore, propagation, the blocked click, `disabled`, `destructive`, the backstop sentence, the confirm swap, both descriptions, Escape, `aria-busy` and the stranded-confirm check.
  - `history-tab.tsx` `h01`–`h19`: the as-of events list, the old-name lookup, the automatic-read predicate, `recordedOn`, the not-found link, append order, the raw timestamp, both supersession guards, the fallback operation, the created detail, **Load more**, `limit`, table focus and focusability, the skeleton's `aria-busy`, symbol encoding, Try again and the *Retired* label.
- **Command:** `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mutants.json --jobs 3 --timeout 240 --work-root $SCRATCH/mutwork --command 'ln -sfn /home/user/AI-agents/repos/factorflow-v2/FactorFlow-v2/node_modules "{workdir}/node_modules" && npx vitest run web/src/screens/research/universes/detail' --out $SCRATCH/mutation-results.json`, where `$SCRATCH` is `/tmp/claude-0/-home-user-AI-agents/5c7a5c14-a397-54f5-9e78-e2f8e97f5200/scratchpad`. `scope` was not run: this is an initial review.
- **Result:** exit 3 (survivors present), with all three baselines green.
  - Of 154 mutants, 128 were killed and 26 survived; none was stillborn and none timed out.
  - Generated: 64 killed, 21 survived. Hand-written: 64 killed, 5 survived.
  - Results sha256 `cc33a8f46c8ee0989ee859469d868efd5780dfb7ae827f372c9f50a008dcfcaf`, persisted beside this report as `CAP-002-E1-S8-implementation-review-v1-mutation.json`.
  - m19 and h09 were reapplied together in a scratch clone of `a2e3f84`, and `npx vitest run web/src/screens/research/universes/detail` passed 85/85 again, so the survival is deterministic.

| Survivor | Scope | Disposition | Reason (the contract that leaves it open) |
|----------|-------|-------------|--------------------------------------------|
| `history-tab.tsx:83:negate-boolean:1` (`pagePending` starts `true`) | initial | equivalent | The first render is the loading body, and the first-page effect sets it `false` in the same commit before any loaded body reads it |
| `history-tab.tsx:85:negate-boolean:1` (`focusTable` starts `true`) | initial | equivalent | Consumed by its effect on mount while `tableRef` is null under the skeleton, so nothing is focused |
| `history-tab.tsx:89`, `:191`, `members-tab.tsx:146`, `:168`, `:290`, `:396` (off-by-one on `attempt`, `refreshKey`, `asOfAttempt` start or step) | initial | equivalent | Re-read triggers: only a change is read, as an effect dependency or a `refreshKey` prop. T009 (f), T005 (e) and T014 specify only that a re-read happens |
| `history-tab.tsx:91`, `:95`, `:102` (`generation` start and step) | initial | equivalent | Only compared for equality with a value captured from itself |
| `history-tab.tsx:144:negate-boolean:1` (`setPagePending(true)` on a failed page) | initial | equivalent | The body becomes the error state, which renders no **Load more** and stops the automatic read. Leaving it requires Try again, whose first-page effect resets the flag |
| `history-tab.tsx:164:negate-boolean:1` (the focus flag never cleared) | initial | equivalent | Within one `universeId` the flag can only be set once, by the last page, after which nothing more is read. Moving focus to the table after the last page is not specified by the story, the plan or UX 1.4 (a cycle-2 code-review addition) |
| `history-tab.tsx:230`, `members-tab.tsx:430` (`tabIndex` −1 → −2) | initial | equivalent | Any negative `tabIndex` is focusable by script and absent from the Tab order |
| `members-tab.tsx:164:negate-boolean:1` (`fieldError` starts `true`) | initial | equivalent | The `[asOf]` effect sets it `false` in the mount commit, before any interaction or host-set date. T002 (b, c) and DEC-0107 specify the field error only after a malformed submission or a 422 |
| `members-tab.tsx:274`, `:308:drop-defaulted-argument:1` (`pending: false` dropped) | initial | equivalent | `undefined` is read as false everywhere (`removal.pending`, `disabled={pending}`). At 308 the spread `current` already carries `pending: false`; at 274 `tsc --noEmit` rejects the missing field |
| `members-tab.tsx:295:negate-boolean:1` (`\|\|` → `&&` in `confirmRemoval`'s guard) | initial | equivalent | Only reachable from the confirm, which renders only while `removal` is non-null and is natively disabled while pending, so neither operand is true when it runs |
| `members-tab.tsx:330:drop-defaulted-argument:1` (`header: ""` dropped) | initial | equivalent | An `undefined` header renders the same empty `<th>`; `tsc --noEmit` rejects it |
| `remove-dialog.tsx:95:negate-boolean:1` (`\|\|` → `&&` in the trap's null guard) | initial | equivalent | Both refs are bound to buttons rendered unconditionally while the dialog is mounted, and a keydown reaches it only while mounted. The guard only narrows types |
| `members-tab.tsx:260:manual:m23-no-trim` | initial | equivalent | T014 fixes the shape `^\d{4}-\d{2}-\d{2}$` plus a calendar date but leaves surrounding whitespace open. The mutant is the stricter literal reading |
| `members-tab.tsx:448:manual:m28-default-match-label` | initial | equivalent | UX 1.1 (Accessibility) and the `data-table` contract require only that the match count is announced politely; the wording of the announcement is left open. UX 1.4 fixes the `h2` text, which `onResult` still drives |
| `history-tab.tsx:217:manual:h17-symbol-unencoded` | initial | equivalent | Symbols match `SYMBOL_PATTERN` `^[A-Z][A-Z0-9.-]{0,15}$` (`src/factorflow/instruments/symbols.py` 5; `research-query.ts` 92). `encodeURIComponent` changes none of those characters |
| `members-tab.tsx:220:manual:m19-any-error-is-field-error` | initial | **non-equivalent** | IR-002 |
| `history-tab.tsx:125:manual:h09-more-page-unguarded` | initial | **non-equivalent** | IR-003 |

The 21 generated survivors are the cycle evidence's own survivors, with each
disposition re-derived above. Every hand-written mutant aimed at a criterion
or planned behaviour was killed, among them:

- the forced universe scope (m03, m04) and the Chicago creation date (m13, m14);
- the null name and null factors (m15, m16) and the 422 fallback and its reset (m10, m11);
- `not_a_member` (m07, m08), the trap with a disabled confirm (r01), the backstop focus (r02) and `destructive` (r08);
- the as-of event set (h01), the old-name lookup (h02, h03) and `recordedOn` (h04).

## Independent Validation

The component commands ran from `repos/factorflow-v2/FactorFlow-v2`, except
where a row names the scratch clone. The `scripts/` commands ran from the
harness root.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/universes/detail web/src/screens/research/copy.test.ts web/src/api/render.test.tsx web/src/screens/research/results-table.test.tsx web/src/screens/research/filters-pane.test.tsx` | component repo | 0 | PASS | 7 files, 582 tests: members-tab 45, remove-dialog 20, history-tab 20, copy 358, render 1, results-table 97, filters-pane 41 (T015 c). stderr: React Router future-flag notices, and act() warnings from three tests (IR-005) |
| `npm run test` | component repo | 0 | PASS | 65 files, 1558 tests |
| `npm run lint` | component repo | 1 | FAIL (environment; outside the review subject) | "Found 60 errors", every diagnostic in `./build/lib/factorflow/api/static/assets/index-D3B1tyJe.js`. `npx biome lint --max-diagnostics=500 .` names no other file. `build/` is git-ignored (`.gitignore` 12), dated 2026-11-01T22:18:41Z (before commit `a2e3f84` at 22:19:32Z), and not in `biome.json` `files.ignore`. Not counted; see the clean-clone row and DEC-0263 |
| `npm run format` | component repo | N/A (stopped) | NOT COMPLETED (environment) | `biome format .` ran over 300 s at 99% CPU on the same `build/lib` bundles (two of them 480 KB minified) and was stopped with no output. Not counted; see the clean-clone row and DEC-0263 |
| `npm run lint` | `$SCRATCH/clean-head` (a `git clone --shared` of `a2e3f84`, `node_modules` symlinked) | 0 | PASS | "Checked 149 files … No fixes applied." Without the symlink, the clone's `code-revision` equals the checkout's (`sha256:650f862e…`) |
| `npm run format` | `$SCRATCH/clean-head` | 0 | PASS | "Checked 149 files … No fixes applied." |
| `npx tsc --noEmit` | component repo | 0 | PASS | `strict`, `noUnusedLocals`, `noUnusedParameters` |
| `npm run build` | component repo | 0 | PASS | Vite: 63 modules. The three components are not routed yet (E1-S9 mounts them, E4-S10 registers routes), so `tsc` and the tests are what cover them |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S8-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 85254d12f58d74865c59c95d9a21e986d6c79713 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `sha256sum` of the 3 patches, 6 logs and 3 results files under `CAP-002-E1-S8-evidence/` | component repo | 0 | PASS | All 12 equal the values recorded in the TDD evidence |
| Patch replay: `git archive 85254d1 web/src` into scratch, `git apply --include='web/*'` of `cycle-1.patch`, `cycle-2.patch` and `cycle-3.patch`, then `cmp` against `git show HEAD:<file>` | scratch | 0 | PASS | All seven `web/` files are byte-identical to HEAD |
| `python3 scripts/mutation-run.py generate …` / `run …` (Mutation Run) | harness root | 0 / 3 | PASS (ran) | 154 mutants: 128 killed, 26 survived, of which 24 are equivalent and 2 are non-equivalent (IR-002, IR-003). Exit 3 means "survivors present" |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S8.md` | harness root | 0 | PASS | `sha256:63b41c74…`, equal to the story approval's `reviewed_revision` |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story <story-path> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261101T205736Z` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All rows PASSED |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan excludes it: the Playwright flow needs the real API, a PostgreSQL container, E4-S10's routes and E1-S9's detail screen. Not a required command for this story |
| `uv sync --all-extras`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `npm ci` | — | N/A | NOT RUN | Not applicable: the change set contains no Python file and no `package.json` or lockfile change, and neither the story's nor the plan's Validation lists them |

Required validation: the six T016 commands (the focused suite, `npm run test`,
lint, format, `tsc` and the build) plus the TDD-evidence lint make seven. All
seven pass, with lint and format taken from the clean clone of the reviewed
commit (DEC-0263).

### Validation Side Effects

- Before: HEAD `a2e3f84`, branch `usr/alvaro-de-jodra/CAP-002-E1-S8-run-20261101T205736Z`. `git status --porcelain=v1 -uall` was empty, and `code-revision` was `sha256:650f862eee13e71f14bc02824e0efa9670bb080bd8a9703e01994e341f3a16a5`. The ignored `build/` (created 2026-11-01T22:18:41Z, before this review) and `src/factorflow/api/static/` were already present.
- After: HEAD `a2e3f84`, same branch. `git status --porcelain=v1 -uall` was empty, and `code-revision` had the same value.
- Unexpected tracked-file changes: none.
  - `npm run build` and the build-output test rewrote only the ignored `src/factorflow/api/static/` assets.
  - The stopped `biome format .` is check-only and wrote nothing.
  - The mutation run and the clean clone used `--shared` clones under the session scratchpad and wrote nothing into the component repository.
  - `build/` was left in place, as constraint 5 requires.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | initial | The as-of line's live region is mounted together with its text, so a screen reader is not told the table changed date |
| IR-002 | MEDIUM | initial | No test pins that only a 422 is the *Members as of* field error; mutant m19 survives |
| IR-003 | MEDIUM | initial | No test pins that a superseded History page is ignored; mutant h09 survives |
| IR-004 | LOW | initial | After **Show current members**, a 422 shows the as-of table of an earlier visit |
| IR-005 | LOW | initial | Three members-tab tests end before the reads they start have settled |

### IR-001 — The as-of line's live region is mounted together with its text, so a screen reader is not told the table changed date

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-1, DAC-E1-S8-2. Neither is made incomplete: the label states the date on screen.
- **Tasks**: T014; T002 (a)
- **Files**:
  - `web/src/screens/research/universes/detail/members-tab.tsx` 207: each date change resets `asOfRead` to `loading`.
  - The same file, 404-409: the loading body is a separate `<output aria-busy="true">`.
  - The same file, 489-506: `AsOfMembers` renders `<output aria-live="polite">` with its sentence already inside, for both the as-of line (504-506) and the did-not-exist sentence (493-499).
- **Claim challenged**: T002 (a) and the cycle-3 evidence say the as-of line is "a polite live region (`role="status"`)", and treat that as meeting UX 1.4's accessibility requirement.
- **Observed evidence**:
  - On entering the as-of view, and on every later date change, `asOfBody()` first returns the loading `output`, so `AsOfMembers` is not in the tree.
  - When the read settles, React mounts a new `AsOfMembers` whose `output` already holds the text. No live region exists before its content changes.
  - The tab's own removal notice (`<output aria-live="polite">{notice}</output>`, 434-436) stays mounted while its text changes. So does `results-table.tsx`'s announcement region (684-686, explained at 207-213). Both follow the working pattern.
  - The test at `members-tab.test.tsx` 234-236 asserts the role and `aria-live`, which jsdom cannot tell apart from an announced change.
- **Expected evidence/behavior**:
  - UX design 1.4, Accessibility: "The as-of label above the table is a polite live region so a screen reader learns the table changed date."
  - MDN, *ARIA live regions*: an element with `aria-live`, or a live-region role, that is added to the document already holding its content is not announced. The region must be present before its content changes.
- **Impact**:
  - A screen-reader user who picks a date is not told the table now shows a past membership, or that the universe did not exist then. The date can be typed, or chosen from History's *View members as of this event*.
  - The visual label is correct. The effect is confined to assistive technology, but the UX design names exactly this purpose.
- **Required remediation**:
  - Keep one polite live region mounted throughout the as-of view (loading, loaded, before-creation and under a 422 field error), and change its text when a read settles.
  - Add a test that the region's element persists across a date change while its text changes.

### IR-002 — No test pins that only a 422 is the *Members as of* field error; mutant m19 survives

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-1. Not made incomplete: the production code is correct.
- **Tasks**: T002 (c), T014
- **Files**:
  - `web/src/screens/research/universes/detail/members-tab.tsx` 220-222: `if (isValidationError(error)) { setFieldError(true); }`.
  - The same file, 172-175: `fieldError` is reset only when `asOf` changes.
  - `members-tab.test.tsx` 389-405: the only test of a non-422 as-of failure.
  - `members-tab.test.tsx` 334-361: T002 (c).
- **Claim challenged**: The cycle-3 evidence lists "other errors replace the as-of body with the sentence and Try again" among the behaviours its tests cover.
- **Observed evidence**:
  - The review's hand-written mutant `members-tab.tsx:220:manual:m19-any-error-is-field-error` replaces the condition with `error !== undefined`.
  - Under it, every rejected as-of read marks the field `aria-invalid` and shows the alert "Enter a date as YYYY-MM-DD." beside the failure sentence: an `internal_error`, `universe_not_found` or an unreachable API.
  - Because the reset runs only on an `asOf` change, the flag also outlives a successful **Try again**.
  - All 85 detail tests pass, both in the mutation run and when reapplied alone in a scratch clone. The test at 389 asserts the sentence, the absent envelope message, **Try again** and the re-read, but never that the field stays valid.
- **Expected evidence/behavior**:
  - DEC-0107 makes "Enter a date as YYYY-MM-DD." the field error for a malformed *Members as of* date, and T002 (c) and T014 extend it to a server 422.
  - UX 1.4 States (Error) give any other failure the operation, resource, reason and **Try again**. STD-UI-19 requires the stated reason to be the actual one.
  - So the mutant is not equivalent. It is MEDIUM rather than HIGH because no T002–T005 subtask makes a non-422 as-of failure a mandatory test, and the production code behaves correctly.
- **Impact**: A regression that tells the owner a well-formed date is malformed when the server failed for another reason, and keeps saying so after a successful retry, would pass the whole suite.
- **Required remediation**:
  - Make the non-422 test assert that the field has no `aria-invalid` and no "Enter a date as YYYY-MM-DD." alert, both after the failure and after **Try again**. An equivalent negative case in the T002 (c) group would also do.
  - Either way, m19 must be killed.

### IR-003 — No test pins that a superseded History page is ignored; mutant h09 survives

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-6, AC-6. Not made incomplete: the production code is correct.
- **Tasks**: T013; T009 (d, e)
- **Files**:
  - `web/src/screens/research/universes/detail/history-tab.tsx` 119-150: `readMore`, with the guard at 125-127. The `setBody` updater at 131-139 appends to whatever list is loaded.
  - `history-tab.test.tsx` 355-380: "ignores a slower read for a universe it no longer shows", which supersedes only the first page.
- **Claim challenged**: The cycle-2 evidence lists "superseded reads ignored" among the behaviours its tests cover.
- **Observed evidence**:
  - The hand-written mutant `history-tab.tsx:125:manual:h09-more-page-unguarded` deletes `if (current !== generation.current) { return; }` from `readMore`'s success path. All 85 tests pass, in the run and when reapplied alone.
  - Under it, a page might still be in flight when `universeId` changes: a **Load more** page, or one read automatically for a rename. That page is then appended to the new universe's list, and the new read's `pagePending` is cleared.
- **Expected evidence/behavior**:
  - The story's Description says the History tab "lists the universe's events newest first" (DAC-E1-S8-6). UX 1.4 says no event is missing and none is deleted (AC-6).
  - The mutant can place another universe's older events in this universe's history, out of order, so it is not equivalent.
  - The trigger is a prop change during an in-flight later page. No delivered screen can cause one yet; E1-S9 will mount the tab. That bears on Impact, not on severity.
  - It is MEDIUM because the plan states no supersession rule, so the test that should kill it is outside T008 and T009's mandatory list.
- **Impact**: A regression that mixes two universes' histories after a navigation would pass the suite.
- **Required remediation**:
  - Extend the supersession test, or add one, so that a later page settling after `universeId` changes is not rendered.
  - h09 must be killed.

### IR-004 — After **Show current members**, a 422 shows the as-of table of an earlier visit

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-1
- **Tasks**: T002 (c), T014
- **Files**:
  - `web/src/screens/research/universes/detail/members-tab.tsx` 166-167: `lastAsOf`.
  - The same file, 211-214: set on every successful as-of read.
  - The same file, 230-234: cleared only when `universeId` changes.
  - The same file, 411-416: the fallback under a 422.
- **Claim challenged**: T002 (c): "A server `422` … renders the same field error and keeps the previous table". The code comment at 411 says "the last result shown stays".
- **Observed evidence**:
  - The path: show the as-of view for 2026-09-30, then **Show current members**, so `asOf` becomes `null` and the results table shows. Next, the host passes a date the server answers with 422. That is reachable through the URL's `as_of`, which the host keeps and the tab never validates.
  - `asOfBody()` then falls back to `lastAsOf` and renders the 2026-09-30 table and line under the field error. The table on screen just before was the current members'.
  - With no earlier as-of result, the same path shows only the field error (test at 352-361), so the outcome depends on navigation history.
- **Expected evidence/behavior**: Under a 422 the tab keeps what was on screen (T002 c), and only that.
- **Impact**: The owner sees a past date's members they were not looking at. It is correctly labelled with its own date and no data is wrong, so LOW.
- **Required remediation**:
  - Drop the kept result when the view returns to current members, so a later 422 keeps only what was shown.
  - Add a test for the path above.

### IR-005 — Three members-tab tests end before the reads they start have settled

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002, T005 (j)
- **Files**:
  - `web/src/screens/research/universes/detail/members-tab.test.tsx` 305-313: "shows the as-of date in the field when the host sets it…".
  - The same file, 636-647: "drops the count heading while a past date is shown…".
  - The same file, 687-694: "has exactly one Filters region…".
- **Claim challenged**: The suite is isolated and deterministic (adversarial-review E.6).
- **Observed evidence**:
  - `npx vitest run web/src/screens/research/universes/detail` prints 13 "An update to MembersTab/ResultsTable inside a test was not wrapped in act(...)" warnings.
  - All 13 come from these three tests (6, 1 and 6). Each asserts synchronously and returns while `getUniverse` or `listClassifications` promises it started are still settling.
  - The rest of the file awaits its reads (for example `waitFor(() => expect(memberRows())…)`).
- **Expected evidence/behavior**: Each test waits for the asynchronous work it starts before it ends.
- **Impact**: The assertions hold today, but state updates land outside the test's assertions. A later change could make one of these tests order-dependent, or hide a rendering error in stderr. Evidence quality only.
- **Required remediation**: Await the reads each of the three tests starts, for example `findBy…` or `waitFor` on the rows or the heading, so the run prints no act() warning from them.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T011 no-op (justified).** Both seams were already delivered: `FiltersPane` `showLookIn` and `children` (E4-S5), and `ResultsTable` `extraColumns` with `placement` (E4-S6, DEC-0159). Neither file is edited, which T011 anticipates and the TDD evidence records.
- **T013 state type (justified).** `HistoryTab` keeps a local `Body` union instead of `ScreenState<{ events; nextCursor }>`. `ScreenState`'s error variant (`web/src/api/types.ts` 69) carries `message` and `requestId` but no `code`, so the code-keyed sentence that classification-ui 2.4 and STD-UI-19 require could not be selected from it. The deviation is disclosed in the cycle-2 evidence.
- **Nothing-found Clear filters (justified).** The no-match body renders *No members match these filters.* with its own **Clear filters** (`members-tab.tsx` 344-360), beside the pane's. UX 1.4 States (Empty, nothing found) pairs the two, and T010 lists the reuse. T005 (h)'s "the tab adds none of its own" refers to the pane's controls, so this is not scope leakage.
- **The em dash** reuses E4-S2's delivered `CELL.absentValue` (`—`) rather than adding a key, in line with T010 ("reuse any key T001 found").
- **Cancel while a removal is pending** is ignored (`members-tab.tsx` 473-477). T007 keeps Cancel enabled, and the `dialog` spec (Submitting) says "Never close the dialog before the result is known", so this conforms.
- **Bookkeeping.** All 17 task checkboxes are ticked, consistent with the evidence above, and the story moved `planning` → `in-review`. The plan's Other Notes still say "`status: todo` stays" and "none of the E4 producers exist", which were true at planning time. These are historical notes, not claims about the delivered state.
- **Environment (not a story change).** The git-ignored `build/` in the shared checkout predates the story commit. It makes `npm run lint` fail and `npm run format` hang there, because `biome.json`'s `files.ignore` omits `build/**`. It is outside the review subject and left untouched (DEC-0263). Every later unit in this run that lints from this checkout will meet the same failure.
- **Out of scope by the plan's Open Gaps.** The plan's Open Gaps leave the not-current banner, the as-of line of Section 1.2, the selection tray and the inspector unassigned, and the code builds none of them (`onInspect={() => {}}`). The owner follow-up the plan names still stands.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronize the component documentation for CAP-002-E1-S8 against `a2e3f84`. IR-001 to IR-005 are recorded for a later rework, expedited change or the next story touching these files. IR-001 is the one with user-facing effect.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005
- **Commit trailer**: this review rests on DEC-0263 (lint and format evidence taken from a clean clone of the reviewed commit). The commit carrying this report should end with `Decision-Id: DEC-0263`.
