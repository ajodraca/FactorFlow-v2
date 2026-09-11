---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
story_id: "CAP-001-E2-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-11T01:17:24Z"
reviewed_head: "84d37dd36170b56c78ee033bb1cfffa703394b50"
review_base: "7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d"
reviewed_state_revision: "sha256:a5699164d15ea6a34edfba1c5d20a420bb80d896f517045a0468d0c8a4163f26"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E2-S4
    artifact_version: 1
    content_revision: sha256:5b0c20c9706393d898b1ec0eca9ffb0c739682c6b702078e55e7571e11f3db39
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-11T01:17:24Z
  source_artifacts:
    - id: CAP-001-E2-S4
      version: "1"
    - id: CAP-001-E2-S4-tasks
      version: "1"
    - id: CAP-001-E2-S4-implementation-review
      version: "1"
    - id: CAP-001-component-design-owner-web-app
      version: "approved"
    - id: CAP-001-ux-design
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E2-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 4 |
| Low findings | 6 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 34/34 verified |
| Required validation | 5/5 passed |

All three HIGH findings from v1 are resolved against current repository evidence, not merely claimed resolved.

1. **IR-001 (pagination)** — `InstrumentTable` now holds `nextCursor` in state and renders a "Load more" control that calls `listInstruments({ ..., cursor })` and *appends* the returned rows (`instrument-table.tsx:33, 92-113, 226-235`). This is a real end-to-end fix, not a client-side illusion: `src/factorflow/api/routes/instruments.py:143-177` forwards `cursor` into `InstrumentFilters`, and `src/factorflow/instruments/service.py:149-172` implements genuine symbol-keyset paging (`symbol > %s`, `LIMIT page_size + 1`, `next_cursor` from the last kept row). The new test asserts the second page's row is added *while the first page's row is still present* and that the control vanishes when `nextCursor` is `null` — it fails against the pre-rework component, which had no such control.
2. **IR-002 (unreachable in-flight sentence)** — the `hasActiveRun` prop is gone; the sentence renders unconditionally (`retire-dialog.tsx:102-105`), which is one of the two remediations v1 authorised, and the deviation is disclosed in the component doc comment and the commit message. Crucially, the new test in `instrument-table.test.tsx` opens the dialog *through the real row action*, so the assertion now runs over the production path rather than a directly constructed component. See IR-201 for the residual concern with the verbatim copy.
3. **IR-003 (bare `disabled` controls)** — the one persistent, reachable "cannot be used" state, the all-rejected bulk preview, now renders `data-variant="blocked"` with `tabIndex={0}`, no `disabled`, and an `aria-describedby` reason (`bulk-add.tsx:112-138`), asserted by a new TC-COMP-130 test that resolves the described-by id and checks no API call on click. The three remaining `disabled` controls are all sub-second in-flight states, which v1's own remediation text explicitly permitted subject to a per-control justification; each now carries that justification in code.

The four v1 MEDIUMs that describe observable behaviour (IR-004, IR-005, IR-006, IR-007) are all resolved with genuine regression-sensitive tests. IR-008 is resolved in its reporting half. IR-013 is corrected.

The full declared validation suite was rerun independently and is green: `npm run test` (105/105, up from 93), `npm run test:e2e` (1/1 against a real PostgreSQL container and the real API), `npm run lint`, `npm run format`, `npx tsc --noEmit`. The working tree was clean before and after every command.

No CRITICAL or HIGH finding survives, and every acceptance criterion, task, and mandatory test now carries adequate evidence, so the gate passes. Ten findings are recorded as warnings. Four are MEDIUM and merit an owner decision before this epic closes: the retire dialog now asserts *"A run is in progress"* as a present-tense fact when no run may be in progress (IR-201); "Load more" has no cancellation guard, so a filter changed mid-request appends the previous filter's rows to the new result set (IR-202); the component design's windowed rendering is still absent, so the DOM is unbounded once many pages are loaded (IR-203); and IR-009's cross-suite pytest ordering failure is unchanged and still reproduces (IR-204).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4-tasks.md` |
| Component | `FactorFlow-v2` (repo also hosts the project artifacts) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E2-S4` |
| HEAD | `84d37dd36170b56c78ee033bb1cfffa703394b50` |
| Review base | `main` merge-base `7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d` |
| Working tree | Clean — no staged, unstaged, or untracked non-ignored files at review start or after validation |
| Changed files reviewed | 35 across the merge base (34 story files + the v1 review report), of which 12 changed in the rework commit `84d37dd` |

The branch also carries CAP-001-E2-S3's merged commits (`c53bcad` and ancestors) between the merge base and `HEAD`. Those are that story's own reviewed change set (`CAP-001-E2-S3-implementation-review-v2.md`, PASS-WITH-WARNINGS) and are excluded from this story's file table; they were read only where this story consumes their API contract, and `src/factorflow/instruments/service.py` was read specifically to confirm the cursor this story now sends is a real keyset parameter rather than an ignored one.

### Changed Files

Files marked *(rework)* changed in `84d37dd`; the remainder are unchanged since v1 and were re-verified, not assumed.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/instruments/instrument-table.tsx` | modified *(rework)* | T019; AC-1, DAC-E2-10, DAC-E2-S4-4; IR-001, IR-004 |
| `web/src/screens/instruments/retire-dialog.tsx` | modified *(rework)* | T022; AC-25, DAC-E2-11, DAC-E2-S4-2; IR-002, IR-004, IR-006 |
| `web/src/screens/instruments/bulk-add.tsx` | modified *(rework)* | T021; DAC-E2-3, DAC-E2-S4-1; IR-003, IR-008 |
| `web/src/screens/instruments/add-field.tsx` | modified *(rework)* | T020; AC-1; IR-003 disposition comment only |
| `web/src/screens/settings/credential-status.tsx` | modified *(rework)* | T025; AC-13 (inherited), DAC-E2-S4-7; IR-007 |
| `web/src/screens/settings/history-depth-form.tsx` | modified *(rework)* | T024; AC-2, DAC-E2-S4-5; IR-003, IR-005 |
| `web/src/screens/instruments/instrument-table.test.tsx` | modified *(rework)* | T009, T018; TC-COMP-131; IR-001, IR-002, IR-004, IR-006 |
| `web/src/screens/instruments/retire-dialog.test.tsx` | modified *(rework)* | T008; TC-COMP-109, TC-COMP-129; IR-002, IR-004, IR-006 |
| `web/src/screens/instruments/bulk-add.test.tsx` | modified *(rework)* | T006; TC-COMP-101, TC-COMP-128, TC-COMP-130; IR-003, IR-008 |
| `web/src/screens/settings/credential-badge.test.tsx` | modified *(rework)* | T013; TC-COMP-134; IR-007 |
| `web/src/screens/settings/history-depth-form.test.tsx` | modified *(rework)* | T011, T012, T015; TC-COMP-132; IR-005 |
| `docs/.../CAP-001-E2-S4-tasks.md` | modified *(rework)* | IR-013 — `status: in-review`, correct branch, `last_reworked_review` |
| `web/src/screens/instruments/index.tsx` | added | T023; AC-1, DAC-E2-S4-6 |
| `web/src/screens/instruments/parse-bulk-symbols.ts` | added | T021, T014; DAC-E2-3 |
| `web/src/screens/instruments/badges.tsx` | added | T019, T013; DAC-E2-S4-4, DAC-E2-S4-7 |
| `web/src/screens/instruments/start-action.tsx` | added | T027; DAC-E2-9, DAC-E2-S4-3 |
| `web/src/screens/settings/index.tsx` | added | T026; AC-2 |
| `web/src/screens/instruments/start-action.test.tsx` | added | T007; TC-COMP-107, TC-COMP-130 |
| `web/src/screens/instruments/empty-states.test.tsx` | added | T010; TC-COMP-133 |
| `web/src/screens/instruments/badges.test.tsx` | added | T013; TC-COMP-134 |
| `web/src/screens/instruments/parse-bulk-symbols.test.ts` | added | T014 |
| `web/src/screens/instruments/add-field.test.tsx` | added | T017 |
| `web/src/screens/settings/credential-status.test.tsx` | added | T016 |
| `web/src/api/types.ts` | modified | T002 (plus `ScreenState<T>`, see Scope and Plan Deviations) |
| `web/src/api/client.ts` | modified | T003 |
| `web/src/app/routes.tsx` | modified | T001 |
| `web/src/app/routes.test.tsx` | modified | T030 |
| `tests/e2e/instruments-add-retire.spec.ts` | added | T029 |
| `playwright.config.ts` | added | T029 (harness; `npm run test:e2e` had no config before) |
| `scripts/run-e2e-server.sh` | added | T029 (harness) |
| `package.json` | modified | T029 (`posttest:e2e` container cleanup) |
| `tailwind.config.js` | modified | T033; exposes existing `theme.css` tokens only |
| `.gitignore` | modified | T029; Playwright run artifacts |
| `docs/.../CAP-001-E2-S4.md` | modified | `status: in-review`, `updated` |
| `docs/.../CAP-001-E2-S4-implementation-review-v1.md` | added | The v1 gate report |

No unjustified file appears in the change set, and the rework introduced no new file and no new dependency. The rework's only non-test, non-comment production additions are the load-more control, the dialog's focus trap and error region, the bulk-add blocked treatment and outcome region, the history-depth load-error region, and the credential icon/badge classes — each traceable to a named v1 finding.

Token discipline re-verified for the rework's new class names: `bg-status-good-muted`, `text-status-good`, `bg-status-critical-muted`, `text-status-critical`, `bg-secondary`, `text-secondary-foreground` are all mapped in `tailwind.config.js` to custom properties that exist in `design-system/theme.css` in both the light and dark blocks (`--status-good` :154, `--status-good-muted` :155, `--status-critical` :160, `--status-critical-muted` :161, `--secondary` :54, `--secondary-foreground` :55; dark equivalents at :255-256, :291-298). `tailwind.config.js` itself was not modified by the rework. STD-UI-29 holds: no value outside the token scale was introduced.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | SATISFIED | `instruments/index.tsx:73-111`; `instrument-table.tsx:92-113, 140-235`; `add-field.tsx:43-111` | `instrument-table.test.tsx` "consumes nextCursor via a load-more control…"; `add-field.test.tsx` (5 tests); `tests/e2e/instruments-add-retire.spec.ts` | v1's PARTIAL is discharged: every instrument in the filtered result set is now reachable through the cursor-consuming Load more control, so "the current list is visible" no longer stops at the server's 50-row default. No config file is involved anywhere on the path. |
| AC-2 | SATISFIED | `settings/history-depth-form.tsx:32-65, 85-106` | `history-depth-form.test.tsx:47-68` — asserts `setHistoryDepth(5)`, the field reflecting `5`, and the "Required before the first acquisition run" description clearing | Read/write round trip against `GET`/`PUT /api/settings/history-depth` via the typed client. A failed read is now distinguished from an unset value (IR-005 resolved). |
| AC-25 | SATISFIED | `retire-dialog.tsx:102-105` — sentence rendered on every open; `instrument-table.tsx:237-247` passes no run-state literal | `instrument-table.test.tsx` "shows the retire dialog's in-flight-run sentence through the real row action"; `retire-dialog.test.tsx` "always states that an in-flight run still finishes…" | The criterion's text ("states that a run already under way still finishes with the instrument included") is met on the production path, proven by a test that drives the real row action. The verbatim present-tense copy is a separate, non-blocking concern — IR-201. |
| DAC-E2-11 | SATISFIED | As AC-25 | As AC-25 | Same evidence; the v1 gap is closed. |
| DAC-E2-3 | SATISFIED | `parse-bulk-symbols.ts:16, 36-44`; `bulk-add.tsx:39-41, 92-106` | `parse-bulk-symbols.test.ts:8-19` (all four separators combined); `bulk-add.test.tsx:29-44` — asserts `addInstruments` **not** called before the preview renders | Recognised/rejected reported before anything is added. Unchanged by the rework and re-verified. |
| DAC-E2-9 | SATISFIED | `start-action.tsx:20-46` — `data-variant="blocked"`, `tabIndex={0}`, no `disabled`, reason in `aria-describedby` | `start-action.test.tsx:10-22` — asserts not `disabled`, `tabIndex` 0, and the reason resolved through the `aria-describedby` id | The action is present, not absent, and blocked rather than disabled. See IR-207 for its inert non-blocked state. |
| DAC-E2-10 | SATISFIED | `instrument-table.tsx:44-83` (server-side filter, debounced) and `:92-113` (cursor paging); `client.ts:216-253` sends `symbol`/`lifecycle`/`cursor` as query parameters; `service.py:141-172` applies all three server-side | `instrument-table.test.tsx:48-78` (both filters assert a server-side call) and the load-more test | Filtering and search are genuinely server-side across the whole set, and the remainder of a 3000-row result is now reachable. The DOM is not windowed once many pages are loaded — IR-203, a design-conformance gap rather than an unmet criterion. |
| DAC-E2-S4-1 | SATISFIED | `bulk-add.tsx:30-31, 43-68, 97-106` — rejected entries listed individually; `handleSubmit` sends only `recognised` | `bulk-add.test.tsx:46-60` — asserts `addInstruments(["AAPL","MSFT","GOOG"])` after a paste containing `1BAD` | A rejection never discards the accepted symbols. Post-submit outcomes are now reported too (IR-008 resolved). |
| DAC-E2-S4-2 | SATISFIED | `retire-dialog.tsx:86-94` — `data-variant="confirm"`, title *Stop acquiring SYMBOL?*, confirm labelled **Stop acquiring**, initial focus on cancel | `retire-dialog.test.tsx:31-40` — asserts `confirm`, the absence of `/delete\|remove/i` anywhere in the dialog, and cancel focus | Retirement wording, not deletion. The dialog is now genuinely modal (IR-006 resolved). |
| DAC-E2-S4-3 | SATISFIED | `bulk-add.tsx:37, 112-138` — the persistent all-rejected state renders `blocked`, focusable, with a linked reason; `start-action.tsx:24-46` | `bulk-add.test.tsx` "renders blocked, not disabled, with a reason exposed via aria-describedby"; `start-action.test.tsx:10-22` | The rule now holds for every state in which a control cannot be used for an owner-visible reason. Four sub-second in-flight `disabled` states remain by an explicit, in-code disposition that v1's own remediation text authorised; the criterion's rationale (a hidden reason) does not apply to them. Recorded as IR-205/IR-206 for owner ratification, not as an unmet criterion. |
| DAC-E2-S4-4 | SATISFIED | `instrument-table.tsx:188-223` — one `<table>`, lifecycle column, `text-muted-foreground` on retired symbols; `badges.tsx:35-45` — `secondary` variant for retired | `instrument-table.test.tsx:30-38` — asserts both rows in one table, `data-variant="secondary"`, and the muted class scoped to the retired row | Retired rows present and distinguishable, never omitted. |
| DAC-E2-S4-5 | SATISFIED | `history-depth-form.tsx:51-53` — *Setting history depth failed: history depth must be a positive whole number.* | `history-depth-form.test.tsx:19-44` — asserts operation, resource and reason separately, for both `0` and `2.5`, and that `setHistoryDepth` was not called | STD-UI-19 shape: operation, resource, reason. |
| DAC-E2-S4-6 | SATISFIED | `instruments/index.tsx:106` *No instruments named yet.* driven by `activeCount + retiredCount > 0`; `instrument-table.tsx:173-186` *No instrument matches this filter.* with a reset control | `empty-states.test.tsx:25-51` — the two states asserted from genuinely different fixtures, with add-field focus asserted for the never-populated case | The two empty states are distinct in copy and in trigger, which is AC-17's actual failure mode. |
| DAC-E2-S4-7 | SATISFIED | `badges.tsx:10-45` (filled/hollow `<rect>` plus text label); `credential-status.tsx:32-66, 84-95` — three distinct SVG shapes plus a real status class per variant | `badges.test.tsx:8-24`; `credential-badge.test.tsx` "renders a distinguishing icon/shape for each state, not colour alone" and "attaches an actual style rule to each variant" | v1's PARTIAL is discharged: the credential badge now carries a filled circle / cross / dashed circle and `status-good`/`status-critical`/`secondary` treatment, and the test asserts the rendered shape rather than the `data-variant` hook alone. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `web/src/app/routes.tsx:2-3, 31, 34` | Both routes swapped from `ScreenPlaceholder` to the real default exports. |
| T002 | complete | VERIFIED | `web/src/api/types.ts:56-126` | `addedAt`/`retiredAt` omitted from `Instrument`; justified — `InstrumentResponse` carries only `instrument_id`, `symbol`, `lifecycle`. Disclosed in the type's doc comment. |
| T003 | complete | VERIFIED | `web/src/api/client.ts:216-253` and `requestJson`, `addInstruments`, `retireInstrument`, `getHistoryDepth`, `setHistoryDepth`, `ApiError`, `toApiError` | `limit` and `cursor` are sent when supplied; non-2xx maps to `ApiError`, transport failure to `ApiUnreachableError`; `toApiError` degrades to a generic message when the envelope is absent, as the task plan's Notes require. |
| T004 | complete | VERIFIED | `web/src/app/shell.tsx:33`; `routes.tsx`; `types.ts:56-64` | Shell and routing present. `ScreenState<T>` was added by `bfcc2cd` rather than confirmed as pre-existing — see Scope and Plan Deviations; unchanged from v1. |
| T005 | complete | VERIFIED | `src/factorflow/api/routes/instruments.py`, `routes/settings.py`; the e2e run exercises both against the real API | Endpoints present on this branch. |
| T006 | complete | VERIFIED | `bulk-add.test.tsx` (4 tests) | Paste mixes all four separators with one malformed entry; asserts no API call before the preview; extended in the rework with the blocked-control and post-submit-outcome cases. |
| T007 | complete | VERIFIED | `start-action.test.tsx` | Both blocked and unblocked branches asserted. |
| T008 | complete | VERIFIED | `retire-dialog.test.tsx` (6 tests) | The in-flight sentence, the error region, the focus trap and Escape are all asserted; the production-path assertion lives in `instrument-table.test.tsx`. v1's WEAK rating for TC-COMP-109 is discharged. |
| T009 | complete | VERIFIED | `instrument-table.test.tsx:30-43` | One table, `secondary` badge, muted styling, scoped to the retired row. |
| T010 | complete | VERIFIED | `empty-states.test.tsx` | Distinct copy and distinct triggers. |
| T011 | complete | VERIFIED | `history-depth-form.test.tsx:19-44` | Non-positive and non-integer both covered. |
| T012 | complete | VERIFIED | `history-depth-form.test.tsx:47-68` | Round trip plus description clearing. |
| T013 | complete | VERIFIED | `badges.test.tsx`; `credential-badge.test.tsx` (3 tests) | v1's PARTIAL is discharged for the credential badge: icon shape and an actual style rule per variant are now implemented and asserted. The provider-recognition badge remains unimplemented; that omission is justified (no recognition field exists in `GET /api/instruments`, and AC-11 makes recognition unknowable before a run reaches the instrument) and disclosed. |
| T014 | complete | VERIFIED | `parse-bulk-symbols.ts`; `parse-bulk-symbols.test.ts` | Pure function, five tests, including blank-entry and case-normalisation boundaries. |
| T015 | complete | VERIFIED | `history-depth-form.test.tsx:71-83` | Asserts no `alert` while typing, then one after `tab`. |
| T016 | complete | VERIFIED | `credential-status.test.tsx:38-43` | Asserts no mask, no bullet run, no "last four" anywhere in the rendered container. |
| T017 | complete | VERIFIED | `add-field.test.tsx:44-85` | Duplicate-active is a field error with `aria-invalid`; duplicate-retired is a notice and explicitly not `aria-invalid`. |
| T018 | complete | VERIFIED | `instrument-table.test.tsx:48-78` | Both filters assert a client call with the filter in the payload, not a local array filter. |
| T019 | complete | VERIFIED | `instrument-table.tsx:33, 44-83, 92-113, 140-235` | v1's PARTIAL is discharged: keyset pagination is implemented, consumes `listInstruments`'s `cursor`, and a fresh filter/refresh correctly replaces rather than accumulates. Windowed rendering, named in component design section 2.6 but not in this task's text, is still absent (IR-203). |
| T020 | complete | VERIFIED | `add-field.tsx:43-116` | Submits on `Enter` via native form submit, one-element array, both duplicate paths distinguished. |
| T021 | complete | VERIFIED | `bulk-add.tsx:20-161` | Pure parser, preview before submission, only recognised symbols submitted (deduplicated), and the API's per-symbol outcome now reported after submission. |
| T022 | complete | VERIFIED | `retire-dialog.tsx:31-131` | v1's PARTIAL is discharged: the in-flight sentence is reachable from production, and the dialog now supplies its own Tab-cycle trap, Escape-to-close and focus restoration, so `aria-modal="true"` matches implemented behaviour. |
| T023 | complete | VERIFIED | `instruments/index.tsx:20-113` | `loading`, `empty-never-populated`, `populated` and `error` (body replaced, retry offered, add field preserved) all render; `empty-no-match` is delegated to `InstrumentTable` and `unreachable` to the shell — both defensible; see IR-208. |
| T024 | complete | VERIFIED | `history-depth-form.tsx:15-124` | Blur validation, unset description, STD-UI-19 error, `years` in the accessible name, and a read failure now reported distinctly. |
| T025 | complete | VERIFIED | `credential-status.tsx:19-106` | Presence only; names `FACTORFLOW_MASSIVE_API_KEY` when missing; `coverage-unknown` when liveness is not `answering`, never "missing"; now with the mapped badge treatment. |
| T026 | complete | VERIFIED | `settings/index.tsx:16` — `max-w-prose` (→ `--measure-prose`) with `gap-5` (→ `--space-5`) | Matches ux-design section 1.3's Page Layout. |
| T027 | complete | VERIFIED | `start-action.tsx` mounted at `instruments/index.tsx:77` | Narrower reading taken per the task plan's own Notes, and disclosed. See IR-207 for the unblocked-state consequence. |
| T028 | complete | VERIFIED | Independent rerun: 22 files, 105 tests, all passing | Rendered copy matches the UX design's exact strings where the tests assert them, with the IR-201 exception on conditionality. |
| T029 | complete | VERIFIED | `tests/e2e/instruments-add-retire.spec.ts`; `playwright.config.ts`; `scripts/run-e2e-server.sh` | Independent rerun passed against a real PostgreSQL container and the real API; the spec asserts the row stays visible and flips to `retired`, never removed. |
| T030 | complete | VERIFIED | `web/src/app/routes.test.tsx:100-138` | Real screens inside the shell; `aria-current="page"` moves to Settings and leaves Instruments. |
| T031 | complete | VERIFIED | `bulk-add.tsx:37, 112-138`; `start-action.tsx`; `retire-dialog.tsx:92`; `instrument-table.tsx:197-221` | v1's PARTIAL is discharged: `dialog` `confirm`-not-`destructive` holds, no row-click navigation was introduced, and the `blocked`-not-`disabled` half now holds for the persistent case with a written disposition for each in-flight exception. IR-205 records the one control that got no disposition. |
| T032 | complete | VERIFIED | `add-field.tsx:79-81` "Instrument symbol"; `instrument-table.tsx:212` `aria-label={` + "`Stop acquiring ${row.symbol}`" + `}` | Both accessible-name rules met and asserted (`add-field.test.tsx:18-21`; the e2e locator `"Stop acquiring AAPL"`; and the new focus-restoration test, which locates the trigger by that same row-scoped name). |
| T033 | complete | VERIFIED | `tailwind.config.js` diff against `design-system/theme.css`; the rework's new status classes re-checked against both theme blocks | Every mapping resolves to an existing token; the two non-Tailwind sizing choices (`rows={4}`, `size={4}`) are documented as deliberate avoidance of off-scale values. |
| T034 | complete | VERIFIED | See Independent Validation | All five declared commands rerun and passing at this HEAD. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `instrument-table.test.tsx` "consumes nextCursor via a load-more control…" / TC-COMP-131, IR-001 | ADEQUATE | Two distinct `mockResolvedValueOnce` pages. Asserts MSFT absent before the click, `listInstruments` last called with `cursor: "cursor-2"`, MSFT present after, **AAPL still present** (so a replace-instead-of-append regression fails it), and the control removed once `nextCursor` is `null`. It cannot pass against the pre-rework component, which rendered no such control. | Does not assert the accumulated count against the toolbar's own totals, nor cover a failed second page. |
| `instrument-table.test.tsx` "shows the retire dialog's in-flight-run sentence through the real row action" / TC-COMP-109 | ADEQUATE | Drives the row's `Stop acquiring AAPL` button and asserts the sentence in the resulting dialog. This is the assertion v1 found missing: it runs over the production path, so reintroducing a literal gate would fail it. | None for the criterion. The copy's truthfulness is not something a test can settle (IR-201). |
| `instrument-table.test.tsx` "reports a failed retirement…" / IR-004 | ADEQUATE | Rejects `retireInstrument`, then asserts the alert names operation *and* symbol *and* the underlying reason, that the dialog is **still open**, and that `listInstruments` was **not** called — three independent ways the old swallow-and-close behaviour would fail. | None. |
| `instrument-table.test.tsx` "returns focus to the triggering row action…" / IR-006 | ADEQUATE | Captures the trigger element before opening, cancels, and asserts `toHaveFocus()` on that exact element. A focus-restoration regression fails it. | Only the cancel path. Focus after a *successful* confirm is untested, and the row's trigger is unmounted by then (IR-209). |
| `retire-dialog.test.tsx` (6 tests) / TC-COMP-109, TC-COMP-129, IR-004, IR-006 | ADEQUATE | `confirm` variant, no `/delete\|remove/i`, cancel focused, confirm label, the unconditional sentence, the error region present and absent, Tab from confirm wrapping to cancel, and Escape invoking `onCancel`. | Shift+Tab wrapping is implemented (`retire-dialog.tsx:71-73`) but untested; focus entering from outside the two buttons is not trapped (IR-209). |
| `bulk-add.test.tsx` "renders blocked, not disabled…" / TC-COMP-130 | ADEQUATE | Real `userEvent.paste` of an all-malformed batch, then asserts `data-variant="blocked"`, `not.toHaveAttribute("disabled")`, `tabIndex === 0`, resolves the `aria-describedby` id to an element whose text names the reason, and asserts clicking it does **not** call the API. This is the second control v1 required, so TC-COMP-130 is now discharged beyond `StartAction`. | Does not cover the depth input or the add/load-more in-flight controls, which remain natively disabled by disposition. |
| `bulk-add.test.tsx` "reports rejected symbols with their reasons…" / IR-008 | ADEQUATE | Mocks a genuinely mixed `AddInstrumentsResult` and asserts the `1 added, 0 reactivated, 1 rejected` line, the rejected symbol, and its server-supplied reason string — the old discard-the-response behaviour fails all three. | The `reactivated` array is only asserted through its count, never with a non-empty value. |
| `bulk-add.test.tsx` (mixed-separator tests) / TC-COMP-101, TC-COMP-128 | ADEQUATE | Pastes `"AAPL,1BAD\nMSFT\tGOOG"` through real `userEvent.paste`, asserts `addInstruments` was *not* called before the preview, that counts and the rejected entry render, and that submission sends exactly the three recognised symbols. | Semicolon is covered in the parser test instead; acceptable given `parse-bulk-symbols.test.ts:8-19`. |
| `parse-bulk-symbols.test.ts` / TC-COMP-101 | ADEQUATE | All four separators in one string, consecutive/trailing separators, case and whitespace normalisation, a malformed entry preserving its neighbours, and blank input. Pure function, no mocks, deterministic. | None. |
| `history-depth-form.test.tsx` "reports a failed read distinctly…" / IR-005 | ADEQUATE | Rejects `getHistoryDepth`, asserts an alert naming the resource and the reason, **and** asserts the "Required before the first acquisition run" description is absent — the second assertion is what makes read-failure genuinely distinct from unset, and is exactly what the old code would fail. | Does not assert the absence of an unhandled rejection directly; the `.catch` is visible in source (`history-depth-form.tsx:39-41`). |
| `history-depth-form.test.tsx` (TC-COMP-132 block) | ADEQUATE | Three separate substring assertions (operation, resource, reason) rather than one whole-string match, plus `setHistoryDepth` not called on an invalid value; the blur-versus-keystroke test asserts the negative before the positive. | None. |
| `credential-badge.test.tsx` (3 tests) / TC-COMP-134 | ADEQUATE | v1's WEAK rating is discharged: the icon test asserts a distinct shape per state (`circle` for good, `path` for critical **with `circle` explicitly absent**, dashed `circle` for unknown), so same-shape-recoloured fails it; a third test asserts a real `status-good` class rather than the `data-variant` hook alone. | Greyscale legibility itself is still not machine-checked; distinct geometry is a sound proxy. |
| `badges.test.tsx` / TC-COMP-134 | ADEQUATE | Asserts the text label, the variant, and `fill="none"` on the retired shape. | None for the lifecycle badge. |
| `instrument-table.test.tsx` (filter tests) / T018 | ADEQUATE | Clears the mock after first render, drives real `userEvent` input, and asserts the call payload contains the filter — a client-side-only filter fails it. | None. |
| `empty-states.test.tsx` / TC-COMP-133 | ADEQUATE | The two states come from genuinely different fixtures (`activeCount: 0` versus `activeCount: 3` with `rows: []`), so collapsing them into one code path fails the test. Focus on the add field is asserted, not assumed. | None. |
| `credential-status.test.tsx` / T016 | ADEQUATE | The three presence states plus a negative assertion scanning the whole rendered container for masks, bullet runs and "last four". `coverage-unknown` is asserted *with* a negative on "missing". | None. |
| `add-field.test.tsx` / T017, T020 | ADEQUATE | Five tests: accessible name, `Enter` submission with case normalisation asserted through the call payload, duplicate-active as `aria-invalid`, duplicate-retired as a notice with an explicit `not.toHaveAttribute("aria-invalid")`, and a rejected `ApiError` producing an operation-naming message. | None. |
| `start-action.test.tsx` / TC-COMP-107, TC-COMP-130 | ADEQUATE | Asserts `data-variant="blocked"`, absence of `disabled`, `tabIndex === 0`, and resolves `aria-describedby` to an element naming the reason. | Does not assert that the non-blocked state does anything (IR-207). |
| `routes.test.tsx` (T030 block) | ADEQUATE | Asserts the real screens' contents inside the shell (heading plus a screen-specific control, so a placeholder would fail), and that `aria-current` moves and vacates. | None. |
| `tests/e2e/instruments-add-retire.spec.ts` / T029 | ADEQUATE | Real API, real PostgreSQL, no mocks. Adds, asserts `active`, opens the dialog through the row-scoped accessible name, confirms, then asserts the same row still visible and now `retired`. | Single spec; the bulk path, pagination and Settings are not covered end to end, which matches the story's Testing section. |

Mock validity across the suite remains sound: every `vi.mock` spreads `importActual` and replaces only the network functions, so components under test execute their own logic. The rework's new tests follow the same pattern and none asserts on mock setup alone. Tests are deterministic — no real timers, no network, no ordering dependence between files — with the exception recorded as IR-204, which concerns the Python suite's dependence on the TypeScript suite's build side effect and is not introduced by this story.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 22 files, 105 tests passed, 3.17s. Includes a real Vite build (`build-output.test.tsx`). Matches the 105 the commit message claims. |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 test passed (4.9s) against a real PostgreSQL container started by `scripts/run-e2e-server.sh` and the real API on `127.0.0.1:8123`; `posttest:e2e` removed the container. |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 47 files, no diagnostics, no fixes applied. |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Check only, no fixes applied — the constitution requires format commands not to rewrite. |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output. |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Install step, not a check. `node_modules` present and the five checks above ran against it; running it would mutate the tree without adding evidence. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Run as a regression check although this story touches no Python. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 23 source files, no issues. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 1 | FAIL | 1 failed, 132 passed, 59 deselected. `tests/integration/test_api_static_mount.py::test_no_bundle_yet_falls_back_to_a_bare_404`. Not in this story's Validation Plan; `git log c53bcad..HEAD -- tests/integration/test_api_static_mount.py` returns no commits, so the file is untouched by this story. Cause is cross-suite ordering — IR-204. |

### Validation Side Effects

- Before: `git status --porcelain` empty; branch `usr/alvaro-de-jodra/CAP-001-E2-S4` at `84d37dd`.
- After: `git status --porcelain` empty; same HEAD, re-checked after each command.
- Unexpected tracked-file changes: none. `npm run test` wrote a Vite bundle into `src/factorflow/api/static/` (`index.html`, `assets/`); `git check-ignore -v` confirms `.gitignore:18` excludes that path, so no tracked file changed. Nothing was restored or reverted.

## Findings

### IR-201 — The retire dialog now asserts that a run is in progress when none may be

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-25, DAC-E2-11 (satisfied in letter)
- **Tasks**: T022
- **Files**: `web/src/screens/instruments/retire-dialog.tsx:102-105`
- **Claim challenged**: That rendering the in-flight sentence unconditionally is a complete resolution of v1/IR-002.
- **Observed evidence**: The dialog renders, on every open, *"A run is in progress and will still acquire `SYMBOL` this time. Retirement takes effect from the next run."* — a present-tense assertion of fact, not a statement of the rule. No run-status source exists anywhere in the product today (v1 confirmed `RunSummary` is hardcoded `null` and no runs endpoint exists), so the first sentence is currently false on every single open, and will remain false whenever no run is active after runs land.
- **Expected evidence/behavior**: `ux-design.md` section 1.2 is explicit about the conditionality: "When a run is under way, the dialog adds a sentence: *A run is in progress and will still acquire `SYMBOL` this time…*". AC-25 requires the confirmation to state that a run *already under way* still finishes with the instrument included — a conditional rule, which conditional phrasing states just as well.
- **Impact**: The owner is told a run is in progress every time they retire anything. The most likely reading is that they have interrupted something, which may deter a retirement they intended; the least bad reading is that they learn to ignore the sentence, which defeats the purpose AC-25 was written for. v1 authorised unconditional rendering as one of two remediations, and the implementer disclosed the choice — but v1 authorised *rendering the sentence*, not preserving copy whose first clause becomes untrue once decoupled from its condition.
- **Required remediation**: Owner's call, and not a gate blocker. The bounded fix is to rephrase the unconditional sentence so it states the rule rather than a state — e.g. *"If a run is already under way, it will still acquire `SYMBOL` this time. Retirement takes effect from the next run."* — and to restore the conditional copy verbatim once a real run-status source exists.

### IR-202 — "Load more" has no cancellation guard, so a filter changed mid-request appends the previous filter's rows

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-10 (adjacent)
- **Tasks**: T019
- **Files**: `web/src/screens/instruments/instrument-table.tsx:92-113` (compare the guarded effect at `:44-83`)
- **Claim challenged**: That the load-more path introduced for v1/IR-001 is correct under concurrent state changes.
- **Observed evidence**: The filter effect carries a `cancelled` flag and clears its timer on teardown (`:44-83`), so a superseded filter request cannot write state. `handleLoadMore` has no equivalent: it is a plain `async` function whose `setRows((current) => (current ?? []).concat(page.rows))`, `setActiveCount`, `setRetiredCount` and `setNextCursor` all run unconditionally when the promise resolves, regardless of what happened to `symbolFilter`/`lifecycleFilter` in the meantime. Both write to the same `rows` state.
- **Expected evidence/behavior**: The component design's section 2.6 rationale for server-side filtering is that "filtering only the loaded page produces a silently wrong ranking"; a result set mixing two different filters is the same class of silently wrong result. The component's own effect already demonstrates the correct guard pattern, so this is an internal inconsistency, not an invented requirement.
- **Impact**: Concrete scenario: the owner clicks "Load more" on the unfiltered list, then types `AAP` in the symbol filter before the request returns. The effect replaces `rows` with the `AAP` page; the load-more response then appends 50 unfiltered symbols beneath them, and overwrites `nextCursor` with a cursor belonging to the unfiltered query, so the next "Load more" pages the wrong sequence. Nothing in the UI indicates the mixture. The window is one network round trip, which at 3000 instruments is not negligible.
- **Required remediation**: Guard `handleLoadMore`'s state writes the way the effect guards its own — ignore a response whose filter no longer matches current state (or cancel in-flight load-more on any filter change) — and add a test that changes the filter between the click and the resolution.

### IR-203 — Windowed rendering is still absent, so the DOM is unbounded once pages accumulate

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-10 (adjacent), AC-4 (capability sizing case)
- **Tasks**: T019
- **Files**: `web/src/screens/instruments/instrument-table.tsx:188-223`
- **Claim challenged**: That keyset pagination alone discharges the component design's table-volume approach.
- **Observed evidence**: Every loaded row is rendered: `rows.map(...)` over the accumulated array with no virtualisation, no windowing and no upper bound on `rows.length`. Repeated "Load more" at the server's `DEFAULT_PAGE_SIZE = 50` therefore grows the DOM linearly to the full 3000 rows.
- **Expected evidence/behavior**: `component-design-owner-web-app.md` section 2.6: "This design implements the table as a keyset-paginated list with **windowed rendering over the loaded pages**", and section 5: "Keyset pagination plus windowed rendering keeps the DOM bounded regardless of the result set." Section 14's open question 2 records STD-UI-30 as only partially discharged precisely because windowed rendering is the part the `data-table` component does not supply.
- **Impact**: At AC-4's sizing case a fully paged table holds 3000 rows in the DOM, which is the condition the design explicitly set out to avoid. This is materially less severe than v1/IR-001: every instrument is now *reachable*, and server-side filtering means the normal path to a specific instrument is a filter rather than 60 clicks. It is a performance and design-conformance gap, not an unreachable-data gap. v1's own remediation text named "a 'load more' control, incremental page accumulation, or the windowed rendering component design section 2.6 describes" as acceptable alternatives, so the implementer met the stated bar.
- **Required remediation**: Owner's call. Either accept load-more accumulation as this story's delivery and record the divergence from section 2.6/5 against the existing STD-UI-30 open question, or schedule windowed rendering with the story that owns Coverage's tables, which face the same sizing case.

### IR-204 — The Python suite still fails after the TypeScript suite runs, through a stale "no bundle exists" assumption

- **Severity**: MEDIUM
- **Status**: OPEN (carried forward unchanged from v1/IR-009)
- **Acceptance criteria**: N/A
- **Tasks**: N/A (pre-existing; not introduced or touched by this change set)
- **Files**: `tests/integration/test_api_static_mount.py:77-88`; `web/src/app/build-output.test.tsx`
- **Claim challenged**: That the repository's validation commands are order-independent.
- **Observed evidence**: Independently reproduced at this HEAD: `uv run pytest -m 'not postgres'` exits 1 with `test_no_bundle_yet_falls_back_to_a_bare_404` failing (1 failed, 132 passed) after `npm run test`. `git log c53bcad..HEAD -- tests/integration/test_api_static_mount.py` returns nothing, so this story did not touch the file. `ls src/factorflow/api/static/` shows `index.html` and `assets/`, written by the real Vite build `npm run test` drives, and `git check-ignore -v` confirms both are ignored.
- **Expected evidence/behavior**: A validation command's result should not depend on which other validation command ran first. The premise the test encodes — that no frontend bundle exists on this branch — stopped being true when CAP-001-E1-S4 landed the frontend.
- **Impact**: `uv run pytest` cannot be trusted after a frontend test run, which is the normal order for a full-stack sweep on this repo. Not a blocker for this story: the assertion is outside this change set, the command is not in this story's Validation Plan, and the failure is a stale premise rather than a regression.
- **Required remediation**: Owner's call, and better handled outside this story — point the test at a controlled empty directory, as `client_with_bundle` already does for its positive case, so it stops depending on whether a build has run.

### IR-205 — The new "Load more" control carries a bare `disabled` with no recorded disposition

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-3
- **Tasks**: T019, T031
- **Files**: `web/src/screens/instruments/instrument-table.tsx:226-235`
- **Claim challenged**: That the rework's per-control disposition of the `blocked`-not-`disabled` rule is complete.
- **Observed evidence**: `grep -n "disabled" web/src/screens/**` returns four production `disabled` bindings. Three (`add-field.tsx:111`, `history-depth-form.tsx:84`, `bulk-add.tsx:122`) carry an explicit comment recording why that in-flight state stays natively disabled. The fourth, `disabled={loadingMore}` on the Load more button added by this same rework, carries none — it was introduced after the disposition was written and never folded into it.
- **Expected evidence/behavior**: DAC-E2-S4-3 states the rule categorically; the rework's own convention is that every retained `disabled` states its justification in place.
- **Impact**: Evidence quality. The control belongs to the same sub-second in-flight class the other three do and the reason is self-evident from the button's own "Loading more…" label, so no user-facing information is hidden. The gap is that a future reader cannot tell whether it was considered or overlooked.
- **Required remediation**: Add the same one-line disposition comment, or give it the `blocked` treatment for consistency with `bulk-add.tsx`.

### IR-206 — The in-flight `disabled` disposition rests on the reviewer's remediation text, not an owner ruling

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-3
- **Tasks**: T027, T031
- **Files**: `web/src/screens/instruments/add-field.tsx:106-111`; `web/src/screens/settings/history-depth-form.tsx:78-84`; `web/src/screens/instruments/bulk-add.tsx:32-37`
- **Claim challenged**: That "a sub-second in-flight state may remain natively disabled" is a settled reading of DAC-E2-S4-3.
- **Observed evidence**: The criterion's text is unqualified — "never a bare disabled control". The qualification the implementation relies on originates in v1's own remediation paragraph ("a sub-second in-flight state may well qualify"), which is a reviewer's judgement, not an owner ruling or a design-document statement. This review accepts it: the criterion's stated rationale is that "a disabled control hides its reason from keyboard and screen-reader users", and for a control disabled only while its own submit is in flight the reason is the action the user just took, so nothing is durably hidden. DAC-E2-S4-3 is therefore recorded as SATISFIED.
- **Expected evidence/behavior**: Where an acceptance criterion is worded categorically and the implementation takes a narrower reading, the reading should be ratified by the criterion's owner rather than inherited from a review report.
- **Impact**: None to users. The risk is that a later gate, reading the criterion literally, reverses this call and re-opens work that has already passed.
- **Required remediation**: Owner to confirm the reading, ideally by noting the in-flight exception in the story or the component design so it stops depending on review-report prose.

### IR-207 — The Start action is still an inert control once history depth is set

- **Severity**: LOW
- **Status**: OPEN (carried forward unchanged from v1/IR-010)
- **Acceptance criteria**: DAC-E2-9
- **Tasks**: T027
- **Files**: `web/src/screens/instruments/start-action.tsx:24-40`; `web/src/screens/instruments/index.tsx:77`
- **Claim challenged**: That mounting `StartAction` on Instruments is a complete reading of T027.
- **Observed evidence**: Unchanged at this HEAD. When `historyDepthYears !== null` the button renders `data-variant="default"`, is fully enabled, reads "Start acquisition run", and its `onClick` body runs only `if (blocked) event.preventDefault()` — that is, nothing at all.
- **Expected evidence/behavior**: The task plan's Notes take the narrower reading deliberately — starting a run belongs to whichever story owns Coverage (1.1) — and that reading is sound. It implies the blocked pattern, not a shipped control that claims to start a run and does not.
- **Impact**: An owner who sets history depth is offered a button that appears to start an acquisition run and silently does nothing. Cosmetic today (no Coverage screen exists), confusing as soon as anyone uses the screen.
- **Required remediation**: Render the action only in its blocked state, or point it at the real start path once Coverage lands. It should not ship as an enabled control with an empty handler.

### IR-208 — `ScreenState` variants remain used inconsistently with the union's own stated contract

- **Severity**: LOW
- **Status**: OPEN (carried forward unchanged from v1/IR-011)
- **Acceptance criteria**: N/A
- **Tasks**: T023
- **Files**: `web/src/screens/instruments/index.tsx:21-23, 56-65, 96`; `web/src/api/types.ts:28-33, 56-64`
- **Claim challenged**: T023's "implementing the `ScreenState<T>` variants from the component design section 2.4".
- **Observed evidence**: Unchanged at this HEAD. `InstrumentsScreen`'s state never takes `empty-no-match`, `partial`, `unavailable` or `unreachable`; the no-match case is handled inside `InstrumentTable` with its own local state, and the `unreachable` branch at line 96 remains dead. The `catch` at lines 56-65 maps *every* rejection — `ApiUnreachableError` included — to `kind: "error"`, while `types.ts:28-33` states the unreachable and error cases "must not be collapsed into one code path".
- **Expected evidence/behavior**: Component design section 2.4's union, as reproduced in `types.ts`.
- **Impact**: Minimal in practice: `shell.tsx:33` substitutes the whole route for the designed unreachable state once the health poll reports `unreachable`, so the collapsed branch is reachable only in a brief race. The screen's user-visible behaviour is correct; the internal contract is not what the type documents.
- **Required remediation**: Optional. Either narrow the catch so an `ApiUnreachableError` produces the `unreachable` variant, or record in the component why this screen delegates it to the shell and drop the dead branch.

### IR-209 — The focus trap is partial: entry from outside is not recaptured, and focus is lost after a successful retirement

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-2 (adjacent), AC-25
- **Tasks**: T022
- **Files**: `web/src/screens/instruments/retire-dialog.tsx:47-78`; `web/src/screens/instruments/instrument-table.tsx:121-130, 209-218`
- **Claim challenged**: That the IR-006 remediation makes the dialog fully modal.
- **Observed evidence**: Two residual gaps in an otherwise genuine fix. (a) The trap only acts when `document.activeElement` is exactly the cancel or the confirm button (`:71-76`); if focus is elsewhere — the page behind, reached by a background click, since `<dialog open>` renders no inert backdrop — Tab moves freely through the page behind the dialog. (b) The unmount cleanup calls `previouslyFocused?.focus?.()` on the element captured at mount. On a *successful* retirement, `instrument-table.tsx` clears `retireTarget` and reloads; the row's "Stop acquiring" trigger is then removed from the DOM because the row is retired, so `focus()` on the detached element is a no-op and focus falls to `document.body`. Only the cancel path is tested.
- **Expected evidence/behavior**: `ux-design.md` section 1.2's Accessibility subsection: "Dialog focus is trapped and returns to the triggering row action on close."
- **Impact**: Materially better than v1, where neither the trap nor the restoration existed at all. The residual cases are narrower: a keyboard user who never leaves the dialog is correctly trapped and correctly restored on cancel; a user who clicks behind the dialog, or who completes a retirement, ends up outside it.
- **Required remediation**: Optional and bounded. Recapture focus on a `focusin` outside the dialog, and after a successful confirm move focus to a stable element that survives the reload (the toolbar filter, or the retired row itself) rather than to the removed trigger.

### IR-210 — Bulk add still clears the textarea outright, and its outcome region is not announced

- **Severity**: LOW
- **Status**: OPEN (residual of v1/IR-008)
- **Acceptance criteria**: DAC-E2-3, DAC-E2-S4-1 (both satisfied)
- **Tasks**: T021
- **Files**: `web/src/screens/instruments/bulk-add.tsx:59-62, 141-158`
- **Claim challenged**: That v1/IR-008's remediation was carried out in full.
- **Observed evidence**: The reporting half is done and tested: `submitResult` is retained and rendered with added/reactivated/rejected counts and each rejected symbol's server-supplied reason. The second half of IR-008's remediation — "do not clear the input in a way that loses entries the store did not accept" — is not: `handleSubmit` still calls `setRaw("")` and `setParsed(null)` unconditionally at `:60-61`. The outcome region is also a plain `<div>` with no `role="status"` or `aria-live`, unlike the error paths elsewhere in the same file, so a screen-reader user gets no announcement that the submit produced a result at all.
- **Expected evidence/behavior**: v1/IR-008's stated remediation, and the file's own convention of announcing state changes (`bulk-add.tsx:107-111` uses `role="alert"` for the submit error).
- **Impact**: Small. A rejected symbol is listed on screen and so is recoverable by reading, but it must be retyped rather than re-edited, and a non-sighted user is not told the batch completed. At AC-4's volume, retyping a handful of rejected symbols out of 3000 is an annoyance, not a loss.
- **Required remediation**: Either retain the un-accepted symbols in the textarea after submission, or mark the outcome region `role="status"` so the result is at least announced. Owner's call which.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — no pagination, only the first server page reachable (HIGH) | RESOLVED | `instrument-table.tsx:33, 92-113, 226-235` — `nextCursor` held in state, a Load more control calls `listInstruments({..., cursor})` and appends rows, control hidden when the cursor is null. Server side verified genuine: `routes/instruments.py:143-177`, `instruments/service.py:149-172` (`symbol > %s`, `LIMIT page_size + 1`). Test: `instrument-table.test.tsx` "consumes nextCursor via a load-more control…", which asserts the first page's row survives the append. Residual design gap recorded separately as IR-203; a new concurrency gap as IR-202. |
| v1/IR-002 — in-flight-run sentence could never render (HIGH) | RESOLVED | `retire-dialog.tsx:102-105` — the `hasActiveRun` prop is removed and the sentence renders on every open; the deviation is disclosed in the component doc comment (`:13-22`) and the commit message. Proven on the production path by `instrument-table.test.tsx` "shows the retire dialog's in-flight-run sentence through the real row action", which drives the row button rather than constructing the component. Copy-truthfulness residual recorded as IR-201. |
| v1/IR-003 — three bare `disabled` controls (HIGH) | RESOLVED | `bulk-add.tsx:37, 112-138` — the persistent all-rejected state now renders `data-variant="blocked"`, `tabIndex={0}`, no `disabled`, `aria-describedby` reason at `:134-138`. Test: `bulk-add.test.tsx` "renders blocked, not disabled, with a reason exposed via aria-describedby", which also asserts no API call on click, so TC-COMP-130 is discharged beyond `StartAction`. The two in-flight controls retain `disabled` with an explicit in-code disposition (`add-field.tsx:106-111`, `history-depth-form.tsx:78-84`), which v1's own remediation permitted. Residuals: IR-205, IR-206. |
| v1/IR-004 — a failed retirement was swallowed (MEDIUM) | RESOLVED | `instrument-table.tsx:121-130` — `handleRetireConfirm` now clears the dialog and bumps the reload token **only after** a successful `retireInstrument`; a rejection sets `retireError`, surfaced at `retire-dialog.tsx:106-110` as *Stopping acquisition for SYMBOL failed: …*. Test asserts the alert text, that the dialog is still open, and that `listInstruments` was not called. |
| v1/IR-005 — failed depth read produced an unhandled rejection (MEDIUM) | RESOLVED | `history-depth-form.tsx:32-43` — a real `.catch` sets `loadError`; `:108-116` renders *Reading history depth failed: …* in place of, not alongside, the "Required before the first acquisition run" description, and `:88-96` wires the `aria-describedby` accordingly. Test asserts both the alert **and** the absence of the unset description. |
| v1/IR-006 — dialog non-modal, no focus trap or restoration (MEDIUM) | RESOLVED | `retire-dialog.tsx:47-78` — mount captures `document.activeElement` and focuses cancel; unmount restores it; `handleKeyDown` implements Escape-to-close and a Tab/Shift-Tab cycle between cancel and confirm. Tests: the Tab-wrap and Escape cases in `retire-dialog.test.tsx`, and the focus-restoration case in `instrument-table.test.tsx` asserting `toHaveFocus()` on the exact trigger element. Partial residual recorded as IR-209. |
| v1/IR-007 — credential badge had no icon, shape or style (MEDIUM) | RESOLVED | `credential-status.tsx:32-52` — `CredentialIcon` renders a filled circle, a cross `path`, or a dashed circle per state; `:62-66, 87` attach real `status-good`/`status-critical`/`secondary` classes to the variant. All three map to `theme.css` tokens present in both the light and dark blocks. Tests assert shape distinctness (`circle` explicitly absent for critical) and the presence of a real status class. |
| v1/IR-008 — bulk add discarded the API's per-symbol outcomes (MEDIUM) | RESOLVED (with residual) | `bulk-add.tsx:54-59, 141-158` — `AddInstrumentsResult` is retained and rendered with counts and each rejected symbol's reason; test asserts all three. The remediation's second half (not clearing the input in a way that loses un-accepted entries) was not done — recorded as IR-210, LOW. |
| v1/IR-009 — pytest fails after the TypeScript suite runs (MEDIUM) | STILL OPEN | Not touched, as the commit message states. Independently reproduced at this HEAD: `uv run pytest -m 'not postgres'` exits 1 on `test_no_bundle_yet_falls_back_to_a_bare_404`. Pre-existing, outside this change set and outside this story's Validation Plan. Carried forward as IR-204. |
| v1/IR-010 — Start action inert once depth is set (LOW) | STILL OPEN | `start-action.tsx:32-36` unchanged; the `onClick` body still does nothing when not blocked. Owner-call item, as v1 recorded. Carried forward as IR-207. |
| v1/IR-011 — `ScreenState` variants used inconsistently (LOW) | STILL OPEN | `instruments/index.tsx:56-65, 96` unchanged; every rejection still maps to `kind: "error"` and the `unreachable` branch is still dead. Carried forward as IR-208. |
| v1/IR-012 — three UX-design details absent (LOW) | STILL OPEN | Re-verified unchanged: no gap-detection consequence sentence in `retire-dialog.tsx`; no last-updated/Stale line in `instruments/index.tsx` despite `fetchedAt` being set at `:52`; the row retire action at `instrument-table.tsx:209-217` still carries no `ghost` variant attribute. None were planned tasks; owner's call whether they belong to this story or a follow-up. Not re-raised as a separate finding in this report — the v1 record stands. |
| v1/IR-013 — stale task-plan `status: draft` and wrong branch (LOW) | RESOLVED | `CAP-001-E2-S4-tasks.md:6, 11, 40` — `status: in-review`, `last_reworked_review: CAP-001-E2-S4-implementation-review-v1.md`, and **Branch**: `usr/alvaro-de-jodra/CAP-001-E2-S4`. Confirmed in the rework diff. |

## Scope and Plan Deviations

- **In-flight-run sentence rendered unconditionally (T008, T022).** A disclosed deviation from the task plan's conditional reading, taken because no run-status source exists; it is one of the two remediations v1 authorised and is documented in `retire-dialog.tsx:13-22`, in the test file's header comment, and in the commit message. Accepted. The copy that came with it is IR-201.
- **`ScreenState<T>` was added by `bfcc2cd`, while T004 is checked as a confirmation that it already existed.** Unchanged since v1 and recorded there. The union is reproduced faithfully from component design section 2.4 and is not duplicated elsewhere, so the outcome is correct and the deviation is disclosed — but T004 as a *blocking check* was not honoured as written. Recorded, not raised as a finding.
- **`Instrument.addedAt` / `retiredAt` omitted (T002).** Justified: `InstrumentResponse` from CAP-001-E2-S3 carries only `instrument_id`, `symbol`, `lifecycle`. Disclosed in the type's doc comment.
- **Provider-recognition badge not implemented (T013, ux-design 1.2 Component Mapping).** Justified: no recognition field exists in `GET /api/instruments`, and AC-11 makes recognition unknowable until a run reaches the instrument. Disclosed.
- **Start action mounted on Instruments (T007, T027).** The task plan's own Notes anticipated and permitted the narrower reading. Disclosed. See IR-207.
- **Load-more accumulation instead of windowed rendering (T019).** Meets v1's stated remediation and T019's own wording; diverges from component design sections 2.6 and 5. Disclosed in the commit message only as "Load more", not as a divergence from section 2.6. Raised as IR-203.
- **Playwright harness (`playwright.config.ts`, `scripts/run-e2e-server.sh`, `posttest:e2e`, `.gitignore`) is in scope**: `npm run test:e2e` is a validation command in this story's plan and had no config or specs before, so T029 could not be satisfied without it.
- **IR-013's task-plan metadata correction is a documentation-only edit inside this story's own artifacts** and is in scope.
- No scope leakage found in the rework. No dependency was added, no unrelated refactor appears in `84d37dd`, and no debug artifact, commented-out code, or skipped test is present. Every claim in the rework commit message was checked against the repository; each was accurate, including the 105-test count.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to documentation synchronisation for CAP-001-E2-S4 at `84d37dd`. Before this epic closes, put IR-201 (retire-dialog copy asserting a run is in progress), IR-202 (load-more cancellation guard) and IR-203 (windowed rendering versus load-more accumulation) to the owner — IR-202 is the one with a concrete wrong-data failure mode and is the strongest candidate for a follow-up fix. IR-204 should be scheduled outside this story.
- **Warnings accepted downstream**: IR-201, IR-202, IR-203, IR-204 (MEDIUM); IR-205, IR-206, IR-207, IR-208, IR-209, IR-210 (LOW). v1/IR-012 remains open on the v1 record and is not re-raised here.
