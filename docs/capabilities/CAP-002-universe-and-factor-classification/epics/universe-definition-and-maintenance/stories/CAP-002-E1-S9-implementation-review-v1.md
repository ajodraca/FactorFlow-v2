---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S9-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-02
updated: 2026-11-02
story_id: "CAP-002-E1-S9"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S9.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S9-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-02T06:13:40Z"
reviewed_head: "d222185364f5da2f2a30b2fc3d8fd1dcea0c1111"
review_base: "fadf2c4f53c5367102004d5d387204dc83a32b81"
reviewed_state_revision: "sha256:67bb21e5ec7eee6f4b9f44b56a0e70e12a05a88e01d61a64413d08deb1d5436c"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E1-S9
    artifact_version: 1
    content_revision: sha256:8204045fc759ef5c5ecd42553e156ece0660042c72ac0bf75bb6d6401d5f4461
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.316"
  timestamp: 2026-11-02T06:13:40Z
  source_artifacts:
    - id: CAP-002-E1-S9
      version: "1 (sha256:8204045fc759ef5c5ecd42553e156ece0660042c72ac0bf75bb6d6401d5f4461)"
    - id: CAP-002-E1-S9-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E1-S9-tdd-evidence
      version: "cycle-1 to cycle-4"
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
    - id: DEC-0104
      version: "applied at planning"
    - id: DEC-0108
      version: "applied at planning"
    - id: DEC-0109
      version: "applied at planning"
    - id: DEC-0145
      version: "applied at planning"
    - id: DEC-0167
      version: "applied at planning"
    - id: DEC-0169
      version: "applied at planning"
    - id: DEC-0270
      version: "open, decided_by agent (story coding)"
    - id: DEC-0271
      version: "open, decided_by agent (story coding)"
    - id: DEC-0272
      version: "open, decided_by agent (this review)"
    - id: STD-UI (ui-conventions)
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E1-S9 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 19/19 verified |
| Required validation | 8/8 passed |

The story delivers what it promises. `UniverseDetailScreen` (`detail/index.tsx`)
does the following:

- reads `:universeId`;
- keeps `tab` and `as_of` in the URL without disturbing the Research keys;
- mounts CAP-002-E1-S8's `MembersTab` and `HistoryTab` with the pinned props;
- re-reads the header after every write and after `onMembershipChanged`;
- remounts Members only after Add stocks;
- sends both confirmations to one polite status region (DEC-0109).

The header, the Add stocks dialog and the Retire dialog meet every acceptance
criterion and every task as written. The two plan deviations are each recorded
with a sound derivation. DEC-0270 covers the parser's separators; DEC-0271
covers the local read union in place of `ScreenState`.

All required commands pass on the reviewed tree. This includes the full Vitest
suite (69 files, 1702 tests), `tsc`, the build, and lint and format. Lint and
format were taken from a clean export of HEAD, because an ignored `build/`
bundle breaks them in the shared checkout (DEC-0272). The TDD-evidence lint is
clean.

The mutation run covered the whole change set: 72 generated and 43
reviewer-written mutants. Of the 115, 96 were killed and 19 survived. Sixteen of
the survivors are equivalent. The other three show behaviour the code gets
right that no test pins (IR-001, IR-002). For each, a probe test in a scratch
copy passes on the reviewed code and fails on the mutant. The tests that would
kill them are plan-additional (T006) or coder-added (T010(f) area), not mapped
TC tests. So these are MEDIUM test-strength findings, not WEAK mandatory tests,
as in CAP-002-E1-S7 v1 IR-002 and CAP-002-E1-S8 v1 IR-002 and IR-003.

The other findings:

- **IR-003 (MEDIUM):** the History panel is not refreshed by a header write
  made while History is the open tab, although UX design 1.4 says a rename
  shows a *Renamed* event there.
- **Two LOW findings:** a test-convention slip and an evidence misstatement.

No acceptance criterion, required task or required validation is made
incomplete.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 2 · **total 5**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S9.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S9-tasks.md` |
| Component | `FactorFlow-v2` (`web/src/screens/research/universes/detail/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E1-S9-run-20261102T034017Z` |
| HEAD | `d222185364f5da2f2a30b2fc3d8fd1dcea0c1111` (one commit over the base) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261102T034017Z` resolved by `pipeline-state.py review-base --base-ref …` to `fadf2c4f53c5367102004d5d387204dc83a32b81`; `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean: `git status --porcelain=v1 -uall` empty before and after validation. Git-ignored `build/` and `src/factorflow/api/static/` outputs present (see Validation Side Effects) |
| Changed files reviewed | 49 (9 code and test files, 3 plan, story and evidence files, 36 files in `CAP-002-E1-S9-evidence/`, 1 export-keyword edit) |
| Baseline | none: initial review |

### Changed Files

Paths under `stories/` are relative to
`docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/`.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/universes/detail/index.tsx` | added | T016; T009, T010; AC-4, AC-6, DAC-E1-S9-4, DAC-E1-S9-5 |
| `web/src/screens/research/universes/detail/index.test.tsx` | added | T009 (TC-COMP-058), T007 page half (TC-COMP-044), T010 |
| `web/src/screens/research/universes/detail/summary-header.tsx` | added | T015, T012 adapter; DAC-E1-S9-1, DAC-E1-4, AC-4, AC-6 |
| `web/src/screens/research/universes/detail/summary-header.test.tsx` | added | T002 (TC-COMP-030), T003 |
| `web/src/screens/research/universes/detail/add-stocks-dialog.tsx` | added | T014; DAC-E1-S9-2, DAC-E1-S9-3, DAC-E1-6 |
| `web/src/screens/research/universes/detail/add-stocks-dialog.test.tsx` | added | T004 (TC-COMP-031), T005 (TC-COMP-032), T006 |
| `web/src/screens/research/universes/detail/retire-dialog.tsx` | added | T013; DAC-E1-S9-4, DAC-E1-7 |
| `web/src/screens/research/universes/detail/retire-dialog.test.tsx` | added | T007 (TC-COMP-044), T008 |
| `web/src/screens/research/copy.ts` | modified (+27, additive) | T011: `UNIVERSE_DETAIL.addedStocks`, `allAlreadyMembers`, `addNotFollowed`, `breadcrumb` |
| `web/src/screens/research/universes/universe-table.tsx` | modified (1 line) | T012: `export` keyword on `describeOrigin` only (DEC-0108) |
| `stories/CAP-002-E1-S9-tasks.md` | modified | T001–T019 checkboxes only (word diff shows nothing else) |
| `stories/CAP-002-E1-S9.md` | modified | `status: planning` → `in-review` (story-coding lifecycle) |
| `stories/CAP-002-E1-S9-tdd-evidence.yaml` | added | T019 |
| `stories/CAP-002-E1-S9-evidence/` (36 files: 4 cycle patches, 4 RED and 4 GREEN logs, 4 mutation results, 20 review logs) | added | T019 (cited evidence) |

`dependencies.yaml` is unchanged; it already lists CAP-002-E1-S7 for this
story, as the evidence states. Nothing under `web/src/app/`, `web/src/api/`,
`members-tab.tsx`, `copy.test.ts` or any CAP-001 file changed (T017(c)).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `index.tsx` `rename` (220-233, `renameUniverse`), `addStocks` (235-249, `addUniverseMembers`), `retire` (251-270, `retireUniverse`); `summary-header.tsx` inline rename (160-180) | `index.test.tsx` "renames through PATCH…", "an Add stocks success re-reads…", "retires on confirm…"; `summary-header.test.tsx` TC-COMP-030 block | Every write goes through CAP-002-E4-S1's client; no store access. Rename sends only the name, so history is untouched by construction. Server-side append-only is CAP-002-E1-S6's |
| AC-5 | SATISFIED | `add-stocks-dialog.tsx` `blockedReason` (36-41), `handleSubmit` (168-177); `index.tsx` `onRetire` (397) opens `RetireDialog` | `add-stocks-dialog.test.tsx` "is blocked, focusable and described while no symbol parses…"; `index.test.tsx` "opens the retire dialog from the Members tab's onRetire…" | Add with zero recognised symbols sends nothing. The `last_member` refusal's retire path reaches this story's dialog. T017(a) confirms `members-tab.tsx` 478-481 closes Remove before `onRetire` |
| AC-6 | SATISFIED | `summary-header.tsx` retired branch (205-212, 254-260, 272-274); `index.tsx` both tabs mounted for a retired universe (387-404) | `index.test.tsx` TC-COMP-058 "shows the retired header with no write control, and both tabs readable"; `summary-header.test.tsx` retired tests | Retirement is a `DELETE` that only retires (client 641-649). Members and History stay mounted and readable |
| DAC-E1-4 | SATISFIED | `summary-header.tsx` `renameErrorFor` (50-59) maps `universe_name_in_use` to `UNIVERSES.nameInUse(trimmed)`; trim at 162 | `summary-header.test.tsx` "keeps the field open with the name-in-use error…", "names the trimmed name in the name-in-use error" | Uniqueness is enforced by the server; this story attaches the refusal to the field. The shared entry follows DEC-0109 |
| DAC-E1-6 | SATISFIED | `add-stocks-dialog.tsx` `addResultSentence` (44-48); `index.tsx` 240 puts it in the polite status region | `add-stocks-dialog.test.tsx` TC-COMP-031 block; `index.test.tsx` "an Add stocks success…announces the result" | `already_member` is never an alert; the sentence wording follows DEC-0109 |
| DAC-E1-7 | SATISFIED | `retire-dialog.tsx` (whole); `index.tsx` `onRetire` (397); every write's `universe_retired` re-reads (226, 245-247, 259-261) | `retire-dialog.test.tsx` TC-COMP-044; `index.test.tsx` TC-COMP-058 stale-write test, "states universe_retired in the dialog and re-reads the header", "a refused rename … re-reads the header" | `last_member` is CAP-002-E1-S8's refusal; the retirement it offers is this story's dialog |
| DAC-E1-S9-1 | SATISFIED | `summary-header.tsx` 149-190 (open, Enter/**Rename** submit, Escape cancel, empty and unchanged names) | `summary-header.test.tsx` TC-COMP-030 (7 tests); `index.test.tsx` "renames through PATCH…" asserts `renameUniverse("u1","Growth")` | Escape is ignored while the request is pending, so the field cannot close mid-request |
| DAC-E1-S9-2 | SATISFIED | `add-stocks-dialog.tsx` 44-48, 188-190; `index.tsx` 356-358 | `add-stocks-dialog.test.tsx` "reports one added and one already a member as a status, never an alert", "reports every symbol already a member without an error" | — |
| DAC-E1-S9-3 | SATISFIED | `index.tsx` `addErrorFor` (69-79); `add-stocks-dialog.tsx` `ErrorAlert` (52-61) | `add-stocks-dialog.test.tsx` TC-COMP-032 (2 tests); `index.test.tsx` "states an uncovered symbol in the Add stocks dialog and keeps it open" | Names every symbol in the envelope's order, links to `SHELL_ROUTES.followedStocks`, keeps the list and allows a retry |
| DAC-E1-S9-4 | SATISFIED | `retire-dialog.tsx` 98-107 (`confirm`), 50-56 (Cancel first); `index.tsx` 264-269 | `retire-dialog.test.tsx` TC-COMP-044; `index.test.tsx` TC-COMP-044 (page) "retires on confirm…" | After `200` the header shows *Retired* with the time, the actions leave, *Retired Tech* is announced and focus moves to the `h1` |
| DAC-E1-S9-5 | SATISFIED | `summary-header.tsx` retired branch; `index.tsx` re-read on `universe_retired` | `index.test.tsx` TC-COMP-058 (2 tests) | A stale page's Add shows the `universe_retired` sentence, and the header turns Retired with no actions |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Evidence header lines 32-40: the producer names T001 records match the tree (`getUniverse`, `renameUniverse`, `addUniverseMembers`, `retireUniverse` at client 613-690; `ClassificationApiError.code`/`symbols` at 407-433; the `copy.ts` keys; `describeOrigin` snake_case shape; `members-tab.tsx` 478-481) | Read-only verification; I confirmed each named symbol exists as recorded |
| T002 | complete | VERIFIED | `summary-header.test.tsx` 90-171 | Empty-name sentence is `DIALOGS.enterName` (DEC-0167/0169), asserted as a literal |
| T003 | complete | VERIFIED | `summary-header.test.tsx` 173-447 | (e) asserts the whole origin sentence literally, stronger than the plan asked |
| T004 | complete | VERIFIED | `add-stocks-dialog.test.tsx` 64-101 | Comma-separated input per DEC-0270 (the delivered parser does not split on spaces; confirmed at `parse-bulk-symbols.ts:16`) |
| T005 | complete | VERIFIED | `add-stocks-dialog.test.tsx` 103-136 | The kept list is read after the blur rewrite (DEC-0270) |
| T006 | complete | VERIFIED | `add-stocks-dialog.test.tsx` 138-394 | (a)–(f) present; see IR-002 for the survivors these tests leave |
| T007 | complete | VERIFIED | `retire-dialog.test.tsx` 23-42; page half `index.test.tsx` 194-319 | — |
| T008 | complete | VERIFIED | `retire-dialog.test.tsx` 44-186 | Renders lack the plan's `MemoryRouter` wrapper (IR-004) |
| T009 | complete | VERIFIED | `index.test.tsx` 159-192 | — |
| T010 | complete | VERIFIED | `index.test.tsx` 194-791 | (a)–(h) present; see IR-001 for the retry survivor |
| T011 | complete | VERIFIED | `copy.ts` 681-707 (4 additive entries); all other strings reused, no new *retire* string | `npm run test -- copy` passes unchanged (362 tests); scanner untouched |
| T012 | complete | VERIFIED | `universe-table.tsx` 48 (`export` only); adapter `originToProvenance` at `summary-header.tsx` 37-47 | `universes.test.tsx` 27/27 pass |
| T013 | complete | VERIFIED | `retire-dialog.tsx` | Never `destructive`; no overlay; alert by code |
| T014 | complete | VERIFIED | `add-stocks-dialog.tsx` | Imports `parseBulkSymbols` and `withLink`; the `result` prop renders the polite sentence. The host passes `null` because it closes on success and moves the sentence to the page region (T016) |
| T015 | complete | VERIFIED | `summary-header.tsx` | — |
| T016 | complete | VERIFIED | `index.tsx` | Local read union instead of `ScreenState` (DEC-0271; `ScreenState`'s `error` holds only `message`/`requestId`, `api/types.ts:62-70`). Only the active panel is mounted, as T016 requires; see IR-003 |
| T017 | complete | VERIFIED | (a) `members-tab.tsx` 478-481 closes Remove then calls `onRetire`, so no edit is needed and no case is added; props type-check (`npx tsc --noEmit` exit 0 with the real imports in `index.tsx`). (b) `index.tsx` 107 default export. (c) the change set matches the allowed list. (d) rerun: 4 files, 189 tests pass | The evidence misstates where (c) and (d) are recorded (IR-005) |
| T018 | complete | VERIFIED | Independent rerun of every Validation Plan command (below) | The coder used Biome with the VCS ignore file in place of `npm run lint`/`format` and said so plainly; I reran the exact commands on a clean export (DEC-0272) |
| T019 | complete | VERIFIED | `CAP-002-E1-S9-tdd-evidence.yaml`, four cycles, `commit_hash: stage`; `check-tdd-evidence.py … --require-logs` 0 errors and 0 warnings | Final-round review logs: APPROVED with LOW notes only and drift false in every cycle |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `summary-header.test.tsx` "TC-COMP-030: inline rename" (7) / TC-COMP-030 | ADEQUATE | Open with the name selected and focused; Enter and **Rename** send the typed name once; Escape restores the name, sends nothing and refocuses; `universe_name_in_use` stays open, invalid and described, with focus in the field; empty and whitespace-only names refused without a request | none |
| `summary-header.test.tsx` "SummaryHeader" (28) / T003 | ADEQUATE | Trim and unchanged-name rules; retired, generic and non-client refusals; pending disable and double-Enter guard; Escape ignored while pending; focus moves; single `h1`; labelled `section`; `dl` terms and values with zone; by-hand and filter origin sentences; action variants; retired header; plain text | none |
| `add-stocks-dialog.test.tsx` "TC-COMP-031" (5) / TC-COMP-031 | ADEQUATE | Submit once in order; result sentences anchored with `^…$` for 1/1, 0/2 and 2/0; no alert and no error variant | none |
| `add-stocks-dialog.test.tsx` "TC-COMP-032" (2) / TC-COMP-032 | ADEQUATE | Exact refusal sentence naming MSFT, TSLA in order; link `href="/instruments"`; list kept; Add enabled; second attempt sends again | none |
| `add-stocks-dialog.test.tsx` "AddStocksDialog" (27) / T006 (additional) | WEAK | Structure, initial focus, Escape/Cancel, Tab cycle, focus restore, blocked at 0 and 1001, not blocked at 1000, duplicates counted and sent once, malformed entries listed, paste merge, normalise on blur, refusals keep the list, pending disable and progress, plain text | Every submit goes through a blur first. Activation without a blur is unpinned: survivors `add-stocks-dialog.tsx:manual:review-34` and `:manual:review-35` (IR-002) |
| `retire-dialog.test.tsx` "is the confirm variant…" / TC-COMP-044 | ADEQUATE | `DIALOG` `open`, `aria-modal`, `data-variant="confirm"`, no `destructive`, accessible description, Cancel focused, confirm calls `onConfirm` once | none |
| `retire-dialog.test.tsx` T008 group (19) | ADEQUATE | Escape and Cancel, both Tab wraps, focus restore, pending disable and `aria-busy`, focus rescue from the disabled confirm, alerts by code, no overlay and no outside-click close, plain text | Renders are not wrapped in a `MemoryRouter` (IR-004; no effect on what is proved) |
| `index.test.tsx` "TC-COMP-058" (2) / TC-COMP-058 | ADEQUATE | Retired header, no write controls, Members stub given `lifecycle: "retired"` and count 3, History mounts with the id; stale Add refused `universe_retired`, dialog sentence, header re-read turns Retired, 2 reads | none |
| `index.test.tsx` "TC-COMP-044 (page): retiring" (10) / TC-COMP-044 | ADEQUATE | `DELETE` with the id; dialog closes; Retired with time; actions gone; status *Retired Tech*; `h1` focused once only; shown before the read returns; `universe_retired` and generic refusals; pending keeps the dialog; opened from `onRetire` | none |
| `index.test.tsx` "UniverseDetailScreen" (39) / T010 (b)–(h) (additional) | WEAK | Tablist roles, roving `tabIndex`, arrows/Home/End with `preventDefault`; URL writes leave Research keys; one navigation for `onViewMembersAsOf`; re-read vs remount counters; History fresh mount; skeleton, error, `universe_not_found`; breadcrumb; one status region; rename via PATCH and supersession; later-read failure kept on the page | A **failed** Try again after a later read failure is untested: survivor `index.tsx:manual:review-19` (IR-001) |

**TDD evidence lint** (`check-tdd-evidence.py --require-logs`, run by me):
0 errors, 0 warnings. Each cycle's RED is a vitest module-resolution failure
(no production file yet), which is the plan's Phase 2 model. The mutation run
below is the evidence that the assertions bite.

**Mutation run (E.9)** over every changed production file:

- **Mutants.** 72 generated: negate-boolean 40, off-by-one 29,
  drop-field-copy 2, remove-attribute 1. `universe-table.tsx`'s keyword edit
  yields none. To these I added 43 reviewer mutants (`"operator": "manual"`):
  statement removals, wrong branches and stale-closure swaps across all five
  files.
- **Command:** `npx vitest run web/src/screens/research/universes/detail web/src/screens/research/copy.test.ts`,
  with 4 workers. Baselines exited 0.
- **Result:** 96 killed, 19 survived, 0 stillborn, 0 timeout.
- **Results file:** sha256 `b7622b3e98175d5eb1da2cdab771b5bcf47dbc5c95f93f69f910d83d5813edb5`,
  copied beside this report as `CAP-002-E1-S9-implementation-review-v1-mutation.json`.

Three survivors are **not equivalent** (IR-001, IR-002). I proved each with a
probe test written only in a scratch export of HEAD and never committed. Each
probe passes on the reviewed code and fails on the mutant:

- `review-19`: "Unable to find an accessible element with the role heading".
- `review-34`: `onSubmit` not called with `["AAPL","MSFT"]`.
- `review-35`: Add still `blocked`.

The sixteen equivalent survivors, each judged against the contract:

| Survivor | Why equivalent |
|----------|----------------|
| `index.tsx:113:off-by-one:1`, `index.tsx:138:off-by-one:1` | `generation` is compared only with a value captured from itself. Its start and step change nothing; no artifact specifies them |
| `index.tsx:115:off-by-one:1`, `index.tsx:310:off-by-one:1` | `attempt` is an effect trigger; only its change matters |
| `index.tsx:116:off-by-one:1`, `index.tsx:241:off-by-one:1` | `membersKey` is a React key; any change remounts (T016 asks only that it change after Add stocks) |
| `index.tsx:385:off-by-one:1` | The digit is inside a JSX comment |
| `retire-dialog.tsx:65:negate-boolean:1`, `:65:negate-boolean:2` | These differ only with `pending` false and focus on the confirm, which the `[pending]` effect never sees: on mount focus is on Cancel, and on true→false the confirm was disabled throughout |
| `retire-dialog.tsx:85:negate-boolean:1` | Both refs are attached while the dialog is mounted; the guard only narrows types |
| `summary-header.tsx:37:off-by-one:1` | Changes a type annotation only; no runtime difference (`tsc` rejects it) |
| `summary-header.tsx:38:negate-boolean:1` | Differs only for a `by_hand` origin with a date or a `from_filter` origin without one. `UniverseOrigin`'s contract (`classification-types.ts:203-207`; DEC-0065) excludes both |
| `summary-header.tsx:202:off-by-one:1` | `tabIndex` −2 and −1 behave identically (focusable by script, absent from the Tab order) |
| `index.tsx:manual:review-23` (drops `aria-current` from the current crumb) | UX design 1.4 Page Layout and T010(g)/T016 specify the breadcrumb's label, text and two links only; `aria-current` is left open |
| `summary-header.tsx:manual:review-28` (opening keeps a previous error) | Unreachable. Every path that closes the field (Escape, success, unchanged name) clears the error. The one that does not (retired while editing) removes the rename control, so the field cannot reopen |
| `retire-dialog.tsx:manual:review-42` (Escape default not prevented) | A `<dialog open>` shown without `showModal()` has no Escape default action. T013 specifies only "Esc cancels", which still happens |

## Independent Validation

`$C` = `/home/user/AI-agents/repos/factorflow-v2/FactorFlow-v2`.
`$X` = the clean export of HEAD (`git archive HEAD`, 2548 files equal to `git ls-files`, no `export-ignore` attributes) under the session scratchpad, with `$C/node_modules` symlinked in.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks PASSED |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261102T034017Z` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261102T034017Z` | harness root | 0 | PASS | `fadf2c4f53c5367102004d5d387204dc83a32b81`; ancestor of HEAD |
| `npm run test -- web/src/screens/research/universes/detail` | `$C` | 0 | PASS | 7 files, 225 tests (the story's four files: 51 + 35 + 34 + 20) |
| `npm run test -- copy` (T011) | `$C` | 0 | PASS | `copy.test.ts` 362 tests; TC-COMP-072 scan unchanged |
| `npm run test -- web/src/screens/research/universes/universes.test.tsx` (T012) | `$C` | 0 | PASS | 27 tests |
| `npm run test -- web/src/screens/research/universes/universes.test.tsx web/src/screens/research/universes/create-dialog.test.tsx results-table filters-pane` (T017(d)) | `$C` | 0 | PASS | All four target files listed; 189 tests |
| `npm run test` | `$C` | 0 | PASS | 69 files, 1702 tests |
| `npx tsc --noEmit` | `$C` | 0 | PASS | No output |
| `npm run build` | `$C` | 0 | PASS | 63 modules; writes the ignored `src/factorflow/api/static/` (expected per tech-stack) |
| `npm run lint` | `$C` | 1 | FAIL (environment; outside the review subject) | `Found 100 errors` (36234 more not shown). Every printed diagnostic is in `./build/lib/factorflow/api/static/assets/*.js`, a git-ignored setuptools copy of the bundle (`.gitignore` 12; refreshed 2026-11-02T05:31:22Z). `biome.json` `files.ignore` omits `build/**`. Not counted; see DEC-0272 and the `$X` row |
| `npm run format` | `$C` | 124 (killed by `timeout 180`) | NOT COMPLETED (environment) | Still formatting `./build/lib/…/index-Ne9aQVAM.js` at 180 s. Not counted; see DEC-0272 and the `$X` row |
| `npm run lint` | `$X` | 0 | PASS | "Checked 157 files … No fixes applied." No `build/` in the export |
| `npm run format` | `$X` | 0 | PASS | "Checked 157 files … No fixes applied." |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E1-S9-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base fadf2c4f53c5367102004d5d387204dc83a32b81 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range fadf2c4f53c5367102004d5d387204dc83a32b81..HEAD --cycle review --out <scratch>/mutants.json` | harness root | 0 | PASS | 72 mutants; 43 manual appended |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --timeout 300 --command 'ln -sfn $C/node_modules node_modules && npx vitest run web/src/screens/research/universes/detail web/src/screens/research/copy.test.ts' --out <scratch>/mutation-results.json` | harness root (clones under the scratchpad) | 3 | COMPLETED | Exit 3 signals survivors; all 4 baselines exit 0. 96 killed, 19 survived |
| Reviewer probes `zz-review-probe-add.test.tsx`, `zz-review-probe-index.test.tsx` (scratch only) | `$X` | 0 on HEAD; 1 on each of review-19/34/35 | EVIDENCE | Prove the three non-equivalent survivors; files never placed in `$C` |
| `npm run test:e2e` | — | N/A | NOT RUN | The plan's Validation Plan excludes Playwright flow 6 (needs the route of CAP-002-E4-S10 and the real API). The suite needs a Docker daemon, which this environment lacks |
| `uv run pytest`, `uv run pytest -m 'not postgres'`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv build`, `uv sync --all-extras` | — | N/A | NOT RUN (not applicable) | The change set holds no Python file, and the plan's Validation Plan names only the npm/npx commands |
| `npm ci` | — | N/A | NOT RUN (not applicable) | `package.json` and `package-lock.json` are unchanged; the installed `node_modules` was used. Running it would rewrite the shared checkout's dependencies |

Required validation counted in the Gate Summary has eight entries:

- the plan's five commands: `npm run build`, `npm run test`, `npm run lint`,
  `npm run format`, `npx tsc --noEmit`;
- its three task-specific commands: T011, T012, T017(d).

Lint and format count from `$X` (DEC-0272).

### Validation Side Effects

- **Before:** HEAD `d222185`, branch `usr/alvaro-de-jodra/CAP-002-E1-S9-run-20261102T034017Z`.
  - `git status --porcelain=v1 -uall` was empty.
  - `code-revision` was `sha256:67bb21e5ec7eee6f4b9f44b56a0e70e12a05a88e01d61a64413d08deb1d5436c`.
  - The ignored `build/` and `src/factorflow/api/static/` were already present.
- **After:** HEAD, branch and `git status` were unchanged (empty), and
  `code-revision` was identical. `npm run build` and `npm run test` rewrote the
  ignored `src/factorflow/api/static/index.html` (05:49:54Z), as `tech-stack.md`
  documents. `build/` was left in place.
- **Unexpected tracked-file changes:** none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | initial | A failed Try again after a later read failure is untested; mutant `index.tsx:manual:review-19` survives |
| IR-002 | MEDIUM | initial | Add stocks activated without a blur is untested; mutants `add-stocks-dialog.tsx:manual:review-34` and `:manual:review-35` survive |
| IR-003 | MEDIUM | initial | A header write made while History is the open tab leaves the History panel stale |
| IR-004 | LOW | initial | `retire-dialog.test.tsx` renders without the `MemoryRouter` the plan's test conventions require |
| IR-005 | LOW | initial | The TDD evidence says T017 (c) and (d) are recorded in the task plan; they are not |

### IR-001 — A failed Try again after a later read failure is untested; mutant `index.tsx:manual:review-19` survives

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete)
- **Tasks**: T010(f) (tests); T016 (behaviour)
- **Files**:
  - `web/src/screens/research/universes/detail/index.tsx` 137-156 (`reread`), 344-355 (the later-read failure line and its **Try again**, `onClick={() => void reread()}` at 349).
  - `web/src/screens/research/universes/detail/index.test.tsx` 680-705.
- **Claim challenged**: Cycle-4 evidence states the fix for drift round 1: "once loaded, a later read's failure keeps the page and shows its sentence with Try again under the header". It also reports every survivor as equivalent.
- **Observed evidence**:
  - The reviewer mutant replaces that **Try again** handler with the first-load handler, `setAttempt((count) => count + 1)`. It survives the focused suites.
  - Under the mutant, **Try again** drops the loaded page to the skeleton. If the retry fails, the whole page is replaced by the failure sentence: header, breadcrumb and tabs are gone.
  - A scratch probe confirms this. It loads the page, fails a later read, clicks **Try again**, fails again, then expects **Try again** and the `h1` "Tech". It passes on HEAD and fails on the mutant: "Unable to find an accessible element with the role heading".
  - The existing tests cover only a later failure ("keeps the loaded page…") and a successful retry ("clears the later read's failure…").
- **Expected evidence/behavior**:
  - UX design 1.4 States, Error: "Header retained; the active panel's body replaced by the operation, resource, reason and **Try again**". This is the rule the coder's own drift review enforced in cycle 4.
  - adversarial-review E.9: a survivor that is not equivalent makes the test that should kill it `WEAK`.
- **Impact**:
  - The production code is correct today.
  - A regression that reuses the first-load retry for the later-read failure would pass the suite. That regression would drop the header on a second failure (or, in a browser, could leave the skeleton showing), and it would remount the Members panel on every retry.
- **Required remediation**: Add a test that makes `index.tsx:manual:review-19` fail. For example, a later read fails, **Try again** fails again, and the header and **Try again** are still shown. Optionally also assert that a successful retry does not remount the Members stub.

### IR-002 — Add stocks activated without a blur is untested; mutants `add-stocks-dialog.tsx:manual:review-34` and `:manual:review-35` survive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete)
- **Tasks**: T006(b) (tests); T014 (behaviour)
- **Files**:
  - `web/src/screens/research/universes/detail/add-stocks-dialog.tsx` 168-177 (`handleSubmit`: "Re-parse the current text, so a preview older than the field cannot send").
  - `web/src/screens/research/universes/detail/add-stocks-dialog.test.tsx` 197-249 and the TC-COMP-031/032 submits.
- **Claim challenged**: The cycle-2 mutation block reports 48/48 killed and lists no follow-up for the submit-time re-parse.
- **Observed evidence**:
  - `review-34` makes the submit decision from the preview (`if (blocked !== null)`) rather than a fresh parse of the field. It survives.
  - `review-35` drops the submit-time `showParse(raw)`, so **Add**'s blocked state and reason are not refreshed. It survives.
  - Every test activates **Add** with `user.click` after typing, which blurs the textarea and refreshes the preview first.
  - A scratch probe types `AAPL, MSFT`, keeps focus in the field and activates **Add** with `fireEvent.click`, a click that moves no focus, as an assistive-technology activation can. It then expects `onSubmit(["AAPL","MSFT"])` and **Add** not `blocked`. It passes on HEAD and fails on each mutant. Under `review-34` nothing is sent; under `review-35` **Add** still reads `blocked`, *Enter at least one stock.*.
- **Expected evidence/behavior**:
  - T014: **Add** is `blocked` "at zero or more than 1000 recognised entries" of the field, and `onSubmit(symbols)` receives the field's distinct upper-case symbols.
  - T006(b): the reason shows "while the field parses to zero symbols".
  - STD-UI-24: every operation completable without a pointer.
  - adversarial-review E.9.
- **Impact**:
  - The production code is correct today.
  - A regression to preview-based submission would pass the suite. It would refuse to send a field holding valid symbols, showing *Enter at least one stock.*, to a user whose activation does not move focus. The same gap exists in CAP-002-E1-S7 v1 IR-002 for the create dialog's paste path.
- **Required remediation**: Add a test that activates **Add** without moving focus out of the textarea (for example `fireEvent.click`, or `requestSubmit` on the form). It must assert that the typed symbols are sent and that **Add**'s blocked state reflects the field. Both mutants must then fail.

### IR-003 — A header write made while History is the open tab leaves the History panel stale

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (AC-6 stays satisfied: reopening History shows every event)
- **Tasks**: T016
- **Files**:
  - `web/src/screens/research/universes/detail/index.tsx` 399-404: `HistoryTab` is rendered with no `key`, and `rename`, `addStocks` and `retire` never remount it.
  - `web/src/screens/research/universes/detail/history-tab.tsx` 101-117: it reads only on `[universeId, attempt]`.
- **Claim challenged**: T016: "Only the active panel is mounted, so `HistoryTab` is fresh on each open". The evidence claims the screen confirms every write.
- **Observed evidence**:
  - The summary header, with **Rename**, **Add stocks…** and **Retire…**, renders above the tabs on both tabs.
  - With History open, a successful rename, add or retire re-reads only the universe. `HistoryTab`'s props are unchanged, so it neither remounts nor re-reads.
  - The open History table therefore lacks the *Renamed*, *Stock added* or *Retired* event the write just appended, until the owner switches tabs and back.
  - No test exercises a header write with History active. The index tests' History stub would show a mount count of 1.
- **Expected evidence/behavior**: UX design 1.4 Renaming: "On `200` the new name renders and nothing else changes; the History tab shows a *Renamed* event". UX 1.4 Removing likewise says the History tab "gains the event". T016 makes History fresh on open but does not address a write made while it is open.
- **Impact**: An owner who renames, adds or retires while reading the history sees a history that omits the change they just made. Nothing is lost, and reopening the tab shows it.
- **Required remediation**: After a successful rename, Add stocks or retire, an open History panel must show the new event. For example, key `HistoryTab` on a counter the three writes increment, as `MembersTab` is keyed for Add. Add a test with the History tab active asserting the stub remounts (or re-reads) after each write.

### IR-004 — `retire-dialog.test.tsx` renders without the `MemoryRouter` the plan's test conventions require

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T007, T008
- **Files**: `web/src/screens/research/universes/detail/retire-dialog.test.tsx` 10-20 (`renderDialog`), 140-145 (`rerender`)
- **Claim challenged**: The plan's Phase 2 conventions: "every render in a `MemoryRouter`".
- **Observed evidence**:
  - `render(<RetireDialog {...props} />)` has no router.
  - The other three test files wrap every render. The cycle-3 drift review raised the same point for `summary-header.test.tsx`, and it was fixed there only.
- **Expected evidence/behavior**: Task plan, Phase 2, Mandatory Component Tests conventions.
- **Impact**: None today, since `RetireDialog` uses no router API. A later link in the dialog (for example a *View history* link) would fail in these tests for an environmental reason.
- **Required remediation**: Wrap `renderDialog`'s renders and rerenders in `MemoryRouter`, matching the sibling files.

### IR-005 — The TDD evidence says T017 (c) and (d) are recorded in the task plan; they are not

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T017, T019
- **Files**: `CAP-002-E1-S9-tdd-evidence.yaml` 295-296 (cycle-4 `description`); `CAP-002-E1-S9-tasks.md`
- **Claim challenged**: The cycle-4 description says "(c) and (d) are recorded under T017 in the task plan".
- **Observed evidence**:
  - `git diff --word-diff fadf2c4..HEAD -- …/CAP-002-E1-S9-tasks.md` changes only the nineteen checkboxes.
  - The (c) and (d) outcomes are recorded in the evidence file's header comment, lines 20-25.
  - My reruns confirm both outcomes.
- **Expected evidence/behavior**: Constraint 2 and T019: evidence statements match the repository.
- **Impact**: A reader following the pointer finds nothing in the plan. The outcomes themselves are true.
- **Required remediation**: Correct the cycle-4 description to point at the header comment, or record (c) and (d) under T017 as stated.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded:**
  - DEC-0270: the Add stocks test inputs are comma-separated. The plan's space-separated literals contradict T014's delivered `parseBulkSymbols`, which splits on newline, comma, tab and semicolon (`parse-bulk-symbols.ts:16`). T005's kept list is read after the T006(c) blur rewrite.
  - DEC-0271: the read state is a local union, because `ScreenState`'s `error` variant cannot carry the code T010(f) and T016 select by.
  - Both premises were verified against the delivered files.
- **Justified, by the plan:**
  - Native-button tabs instead of Radix (`tabs` spec §4 says "Radix handles this"). No Radix tabs component is vendored, and T016 prescribes native buttons.
  - Only the active panel mounted, against `tabs` spec §4's "keep it mounted afterwards". T016 requires it.
- **Host `result` prop:** the host always passes `result={null}`, closing the dialog on success and moving the sentence to the page's status region. T016 and T010(h) direct this. The dialog-level `result` rendering is exercised only by T004's seam tests, as T004 intends.
- **Bookkeeping:** every task checkbox is ticked, and each has corroborating evidence. IR-005 notes one misdirected evidence pointer.
- **No scope leakage:** every changed file maps to a task. `copy.ts` gains only the four entries T011 allows. `universe-table.tsx` changes by the `export` keyword alone.
- **Environment, not a story change:**
  - The git-ignored `build/` in the shared checkout makes `npm run lint` fail and `npm run format` stall there, because `biome.json` `files.ignore` omits `build/**`. Its `build/lib` copy was refreshed at 05:31:22Z during coding, probably by a packaging step, before the story commit.
  - It is outside the review subject and was left untouched. Lint and format were taken from a clean export of HEAD (DEC-0272, following DEC-0263 for CAP-002-E1-S8).
  - Every later unit that lints from this checkout will meet the same failure. Adding `build/**` to `biome.json` `files.ignore` is a project-level fix outside this story.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to `$doc-sync` for CAP-002-E1-S9 with this report.
  - IR-001 to IR-003 (MEDIUM) and IR-004 and IR-005 (LOW) are recorded warnings for a later rework or follow-up story.
  - IR-003 is the one production behaviour gap. IR-001 and IR-002 are test-only.
  - The commit carrying this report should end with `Decision-Id: DEC-0272`.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005
