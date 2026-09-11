---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Adversarial Review Agent
owner_github: ajodraca
created: 2026-09-10
updated: 2026-09-10
story_id: "CAP-001-E2-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-10T20:05:00Z"
reviewed_head: "bfcc2cdf17d05c9d80c1d44f717f209e07fef97e"
review_base: "7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d"
reviewed_state_revision: "sha256:ad71d2b69d3cb33a3405f9e39f7d197e70067c9a7662de0823cb3dc4a0075d6f"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-09-10T20:05:00Z
  source_artifacts:
    - id: CAP-001-E2-S4
      version: "1"
    - id: CAP-001-E2-S4-tasks
      version: "1"
    - id: CAP-001-component-design-owner-web-app
      version: "approved"
    - id: CAP-001-ux-design
      version: "approved"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E2-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 6 |
| Low findings | 4 |
| Acceptance criteria | 8/14 satisfied |
| Planned tasks | 30/34 verified |
| Required validation | 5/5 passed |

Both screens exist, are routed, and the full declared validation suite is genuinely green when rerun independently: `npm run test` (93/93), `npm run test:e2e` (1/1 against a real PostgreSQL container and the real API), `npm run lint`, `npm run format`, and `npx tsc --noEmit` all pass, and the working tree is clean before and after. The bulk-entry parser, the two distinct empty states, the `dialog` `confirm` retirement wording, the STD-UI-19-shaped depth error, and the credential region's no-value rule are all implemented and tested with assertions that would fail on a plausible regression.

The verdict is nevertheless `CHANGES-REQUIRED`, on three HIGH findings, each of which is a requirement the story or its referenced design states and the code does not meet:

1. The instrument table implements no pagination at all. `listInstruments` is called with no `limit` and no `cursor`, and the returned `nextCursor` is discarded, so the server's `DEFAULT_PAGE_SIZE = 50` silently truncates the list while the toolbar reports the full active/retired counts. T019 names "keyset pagination consuming `listInstruments`" and component design section 2.6 specifies "a keyset-paginated list with windowed rendering over the loaded pages". At AC-4's 3000 instruments the owner can reach 50 rows.
2. The retire dialog's in-flight-run sentence — AC-25 and DAC-E2-11, this story's only capability-level retirement criterion — can never render in the shipped product: `InstrumentTable` passes `hasActiveRun={false}` as a literal. The passing test supplies the prop directly, so it exercises a branch no production path can reach. This deviation is not among the three the commit message records; the message states the opposite.
3. Three bare `disabled` controls ship on these two screens, which DAC-E2-S4-3 and component design section 2.5's load-bearing note forbid categorically. TC-COMP-130 is asserted only against `StartAction`, the one control where the rule is honoured, so the mandatory test passes while the rule is violated elsewhere on the same screens.

None of the three is a security, privacy, or data-integrity risk, so no finding is CRITICAL.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4-tasks.md` |
| Component | `FactorFlow-v2` (repo also hosts the project artifacts) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E2-S4` |
| HEAD | `bfcc2cdf17d05c9d80c1d44f717f209e07fef97e` |
| Review base | `main` merge-base `7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d` |
| Working tree | Clean — no staged, unstaged, or untracked non-ignored files at review start or after validation |
| Changed files reviewed | 34 (this story's single commit `bfcc2cd`) |

The branch also carries CAP-001-E2-S3's merged commits (`c53bcad` and ancestors) between the merge base and `HEAD`. Those are that story's reviewed change set (`CAP-001-E2-S3-implementation-review-v2.md`, PASS-WITH-WARNINGS) and are excluded from this story's file table; they were read only where this story consumes their API contract.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/instruments/index.tsx` | added | T023; AC-1, DAC-E2-S4-6 |
| `web/src/screens/instruments/instrument-table.tsx` | added | T019; AC-1, DAC-E2-10, DAC-E2-S4-4 |
| `web/src/screens/instruments/add-field.tsx` | added | T020; AC-1 |
| `web/src/screens/instruments/bulk-add.tsx` | added | T021; DAC-E2-3, DAC-E2-S4-1 |
| `web/src/screens/instruments/parse-bulk-symbols.ts` | added | T021, T014; DAC-E2-3 |
| `web/src/screens/instruments/retire-dialog.tsx` | added | T022; AC-25, DAC-E2-11, DAC-E2-S4-2 |
| `web/src/screens/instruments/badges.tsx` | added | T019, T013; DAC-E2-S4-4, DAC-E2-S4-7 |
| `web/src/screens/instruments/start-action.tsx` | added | T027; DAC-E2-9, DAC-E2-S4-3 |
| `web/src/screens/settings/index.tsx` | added | T026; AC-2 |
| `web/src/screens/settings/history-depth-form.tsx` | added | T024; AC-2, DAC-E2-S4-5 |
| `web/src/screens/settings/credential-status.tsx` | added | T025; AC-13 (inherited), DAC-E2-S4-7 |
| `web/src/screens/instruments/bulk-add.test.tsx` | added | T006; TC-COMP-101, TC-COMP-128 |
| `web/src/screens/instruments/start-action.test.tsx` | added | T007; TC-COMP-107, TC-COMP-130 |
| `web/src/screens/instruments/retire-dialog.test.tsx` | added | T008; TC-COMP-109, TC-COMP-129 |
| `web/src/screens/instruments/instrument-table.test.tsx` | added | T009, T018; TC-COMP-131 |
| `web/src/screens/instruments/empty-states.test.tsx` | added | T010; TC-COMP-133 |
| `web/src/screens/instruments/badges.test.tsx` | added | T013; TC-COMP-134 |
| `web/src/screens/instruments/parse-bulk-symbols.test.ts` | added | T014 |
| `web/src/screens/instruments/add-field.test.tsx` | added | T017 |
| `web/src/screens/settings/history-depth-form.test.tsx` | added | T011, T012, T015; TC-COMP-132 |
| `web/src/screens/settings/credential-status.test.tsx` | added | T016 |
| `web/src/screens/settings/credential-badge.test.tsx` | added | T013; TC-COMP-134 |
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
| `docs/.../CAP-001-E2-S4-tasks.md` | modified | Task-state bookkeeping |
| `docs/.../CAP-001-E2-S4.md` | modified | `status: in-review`, `updated` |

No unjustified file appears in the change set. Every `tailwind.config.js` colour, `maxWidth`, and spacing entry added resolves to a variable already defined in `design-system/theme.css` (verified: `--input`, `--card`, `--card-foreground`, `--muted-foreground`, `--secondary`, `--secondary-foreground`, `--status-good`, `--status-warning`, `--status-critical` and their `-muted` pairs, `--measure-prose: 75ch`), so STD-UI-29 holds: no value outside the token scale was introduced.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-1 | PARTIAL | `web/src/screens/instruments/index.tsx:73-111`; `instrument-table.tsx:94-178`; `add-field.tsx:43-74` | `add-field.test.tsx` (5 tests); `instrument-table.test.tsx:30-43`; `tests/e2e/instruments-add-retire.spec.ts` | Adding, retiring and rendering the list work with no config file. "the current list is visible" does not hold past the server's 50-row default page: no pagination control and `nextCursor` discarded (IR-001). |
| AC-2 | SATISFIED | `web/src/screens/settings/history-depth-form.tsx:24-53, 86-90` | `history-depth-form.test.tsx:47-68` — asserts `setHistoryDepth(5)`, the field reflecting `5`, and the "Required before the first acquisition run" description clearing | Read/write round trip against `GET`/`PUT /api/settings/history-depth` via the typed client. |
| AC-25 | PARTIAL | `retire-dialog.tsx:52-57` renders the sentence; `instrument-table.tsx:183` passes `hasActiveRun={false}` as a literal | `retire-dialog.test.tsx:29-37` — passes the prop directly | The copy exists in the component but no production path can set the flag, so the confirmation never states it (IR-002). |
| DAC-E2-11 | PARTIAL | As AC-25 | As AC-25 | Same evidence; same gap. |
| DAC-E2-3 | SATISFIED | `parse-bulk-symbols.ts:16, 36-44`; `bulk-add.tsx:30-32, 77-96` | `parse-bulk-symbols.test.ts:8-19` (all four separators combined); `bulk-add.test.tsx:29-44` — asserts `addInstruments` **not** called before the preview renders | Recognised/rejected reported before anything is added, as DAC-E2-3 requires. |
| DAC-E2-9 | SATISFIED | `start-action.tsx:20-46` — `data-variant="blocked"`, `tabIndex={0}`, no `disabled`, reason in `aria-describedby` | `start-action.test.tsx:10-22` — asserts not `disabled`, `tabIndex` 0, and reason text resolved through the `aria-describedby` id | The action is present, not absent, and blocked rather than disabled. |
| DAC-E2-10 | PARTIAL | `instrument-table.tsx:41-75` — every filter change issues a fresh `listInstruments` request; `client.ts` `listInstruments` sends `symbol`/`lifecycle` as query parameters | `instrument-table.test.tsx:48-78` — both filters assert a server-side call | Filter/search are genuinely server-side. The table as a whole is not usable at 3000 instruments because only the first 50 rows are reachable (IR-001). |
| DAC-E2-S4-1 | SATISFIED | `bulk-add.tsx:27-28, 82-91` — rejected entries listed individually with a reason; `handleSubmit` sends only `recognised` | `bulk-add.test.tsx:46-60` — asserts `addInstruments(["AAPL","MSFT","GOOG"])` after a paste containing `1BAD` | A rejection never discards the accepted symbols. |
| DAC-E2-S4-2 | SATISFIED | `retire-dialog.tsx:37-74` — `data-variant="confirm"`, title *Stop acquiring SYMBOL?*, confirm labelled **Stop acquiring**, initial focus on cancel | `retire-dialog.test.tsx:12-27` — asserts `confirm`, absence of `/delete\|remove/i` anywhere in the dialog, and cancel focus | Retirement wording, not deletion. |
| DAC-E2-S4-3 | NOT SATISFIED | `bulk-add.tsx:100` `disabled={recognised.length === 0 \|\| submitting}`; `history-depth-form.tsx:66` `disabled={loading}`; `add-field.tsx:106` `disabled={submitting}` | `start-action.test.tsx` asserts the rule only for `StartAction` | Three bare `disabled` controls on this story's own screens, none carrying a `blocked` variant or an `aria-describedby` reason (IR-003). |
| DAC-E2-S4-4 | SATISFIED | `instrument-table.tsx:142-177` — one `<table>`, lifecycle column, `text-muted-foreground` on retired symbols; `badges.tsx:35-45` — `secondary` variant for retired | `instrument-table.test.tsx:30-38` — asserts both rows in one table, `data-variant="secondary"`, and the `text-muted-foreground` class on the retired symbol | Retired rows present and distinguishable, never omitted. |
| DAC-E2-S4-5 | SATISFIED | `history-depth-form.tsx:37-42` — *Setting history depth failed: history depth must be a positive whole number.* | `history-depth-form.test.tsx:19-44` — asserts operation, resource and reason separately, for both `0` and `2.5`, and that `setHistoryDepth` was not called | STD-UI-19 shape: operation, resource, reason. |
| DAC-E2-S4-6 | SATISFIED | `index.tsx:106` *No instruments named yet.* driven by `activeCount + retiredCount > 0`; `instrument-table.tsx:128-140` *No instrument matches this filter.* with a reset control | `empty-states.test.tsx:25-51` — the two states asserted from different fixtures, with add-field focus asserted for the never-populated case | The two empty states are distinct in copy and in trigger, which is AC-17's actual failure mode. |
| DAC-E2-S4-7 | PARTIAL | `badges.tsx:10-45` — lifecycle badge carries a filled/hollow `<rect>` plus its text label | `badges.test.tsx:8-24` — asserts label, variant, and `fill="none"` on the retired shape; `credential-badge.test.tsx:9-18` asserts labels only | The lifecycle badge fully satisfies the criterion. The credential badge carries a text label but no icon, no shape and no visual badge treatment at all; its `data-variant` has no styling attached (IR-007). |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `web/src/app/routes.tsx:2-3, 31, 34` | Both routes swapped from `ScreenPlaceholder` to the real default exports. |
| T002 | complete | VERIFIED | `web/src/api/types.ts:56-126` | `addedAt`/`retiredAt` omitted from `Instrument`; justified — `InstrumentResponse` (CAP-001-E2-S3) carries only `instrument_id`, `symbol`, `lifecycle`. Deviation disclosed in the commit message and in the type's own doc comment. |
| T003 | complete | VERIFIED | `web/src/api/client.ts` — `requestJson`, `addInstruments`, `retireInstrument`, `listInstruments`, `getHistoryDepth`, `setHistoryDepth`, `ApiError`, `toApiError` | Non-2xx maps to `ApiError` (message + `request_id`), transport failure to `ApiUnreachableError`; `toApiError` degrades to a generic message when the envelope is absent, exactly as the task plan's Notes require. |
| T004 | complete | VERIFIED | `web/src/app/shell.tsx:33`; `routes.tsx`; `types.ts:56-64` | Shell and routing present. `ScreenState<T>` was **added by this commit**, not confirmed as pre-existing — see Scope and Plan Deviations. |
| T005 | complete | VERIFIED | `src/factorflow/api/routes/instruments.py`, `routes/settings.py`; e2e run exercises both against the real API | Endpoints present on this branch. |
| T006 | complete | VERIFIED | `web/src/screens/instruments/bulk-add.test.tsx` | Paste mixes all four separators with one malformed entry; asserts no API call before the preview. |
| T007 | complete | VERIFIED | `web/src/screens/instruments/start-action.test.tsx` | Both blocked and unblocked branches asserted. |
| T008 | complete | VERIFIED | `web/src/screens/instruments/retire-dialog.test.tsx` | Four tests; covers the in-flight sentence present and absent. The component is correct — its wiring is not (IR-002). |
| T009 | complete | VERIFIED | `web/src/screens/instruments/instrument-table.test.tsx:30-43` | One table, `secondary` badge, `--muted-foreground` styling. |
| T010 | complete | VERIFIED | `web/src/screens/instruments/empty-states.test.tsx` | Distinct copy and distinct triggers. |
| T011 | complete | VERIFIED | `web/src/screens/settings/history-depth-form.test.tsx:19-44` | Non-positive and non-integer both covered. |
| T012 | complete | VERIFIED | `web/src/screens/settings/history-depth-form.test.tsx:47-68` | Round trip plus description clearing. |
| T013 | complete | PARTIAL | `badges.test.tsx`; `credential-badge.test.tsx` | The task names three badges. The lifecycle badge is asserted for label **and** icon; the credential badge is asserted for label only and renders no icon or shape (IR-007); the provider-recognition badge is neither implemented nor tested — that omission is justified (no recognition field exists in `GET /api/instruments`; AC-11 makes it unknowable before a run) and is disclosed in the commit message. |
| T014 | complete | VERIFIED | `parse-bulk-symbols.ts`; `parse-bulk-symbols.test.ts` | Pure function, five tests, including blank-entry and case-normalisation boundaries. |
| T015 | complete | VERIFIED | `history-depth-form.test.tsx:71-83` | Asserts no `alert` while typing, then one after `tab`. |
| T016 | complete | VERIFIED | `credential-status.test.tsx:38-43` | Asserts no mask, no bullet run, no "last four" anywhere in the rendered container. |
| T017 | complete | VERIFIED | `add-field.test.tsx:44-85` | Duplicate-active is a field error with `aria-invalid`; duplicate-retired is a notice and explicitly not `aria-invalid`. |
| T018 | complete | VERIFIED | `instrument-table.test.tsx:48-78` | Both filters assert a client call, not a local array filter. |
| T019 | complete | PARTIAL | `instrument-table.tsx:27-178` | Toolbar, `select` lifecycle filter, count line, server-side filtering and lifecycle column all present. **Keyset pagination, named explicitly in this task, is absent**: `listInstruments({symbol, lifecycle})` sends no `limit`/`cursor`, and `page.nextCursor` is never read (IR-001). |
| T020 | complete | VERIFIED | `add-field.tsx:43-111` | Submits on `Enter` via native form submit, one-element array, both duplicate paths distinguished. |
| T021 | complete | VERIFIED | `bulk-add.tsx:19-107` | Pure parser, preview before submission, only recognised symbols submitted (deduplicated). |
| T022 | complete | PARTIAL | `retire-dialog.tsx:13-76` | Copy, confirm label, `confirm` variant and initial cancel focus all exact. The conditional in-flight sentence is implemented but never reachable (IR-002), and ux-design section 1.2's "focus is trapped and returns to the triggering row action on close" is not implemented (IR-006). |
| T023 | complete | VERIFIED | `index.tsx:20-112` | `loading`, `empty-never-populated`, `populated` and `error` (body replaced, retry offered, add field preserved) all render. `empty-no-match` is delegated to `InstrumentTable` and `unreachable` to the shell — both defensible; see IR-011. |
| T024 | complete | VERIFIED | `history-depth-form.tsx:15-96` | Blur validation, unset description, STD-UI-19 error, `years` in the accessible name (`aria-label="History depth, in years"`). |
| T025 | complete | VERIFIED | `credential-status.tsx:19-62` | Presence only; names `FACTORFLOW_MASSIVE_API_KEY` when missing; `coverage-unknown` when liveness is not `answering`, never "missing". |
| T026 | complete | VERIFIED | `settings/index.tsx:16` — `max-w-prose` (→ `--measure-prose`) with `gap-5` (→ `--space-5`) | Matches ux-design section 1.3's Page Layout. |
| T027 | complete | VERIFIED | `start-action.tsx` mounted at `index.tsx:77` | Narrower reading taken, per the task plan's own Notes, and disclosed. See IR-010 for the unblocked-state consequence. |
| T028 | complete | VERIFIED | Independent rerun: 22 files, 93 tests, all passing | Rendered copy matches the UX design's exact strings where the tests assert them. |
| T029 | complete | VERIFIED | `tests/e2e/instruments-add-retire.spec.ts`; `playwright.config.ts`; `scripts/run-e2e-server.sh` | Independent rerun passed against a real PostgreSQL container and the real API; the spec asserts the row stays visible and flips to `retired`, never removed. |
| T030 | complete | VERIFIED | `web/src/app/routes.test.tsx:100-138` | Real screens inside the shell; `aria-current="page"` moves to Settings and leaves Instruments. |
| T031 | complete | PARTIAL | `start-action.tsx`; `retire-dialog.tsx` | `dialog` `confirm`-not-`destructive` holds, and no row-click navigation was introduced. The `button` `blocked`-not-`disabled` half of the review missed three bare `disabled` controls shipped on these screens (IR-003). |
| T032 | complete | VERIFIED | `add-field.tsx:79-81` "Instrument symbol"; `instrument-table.tsx:166` `aria-label={\`Stop acquiring ${row.symbol}\`}` | Both accessible-name rules met and asserted (`add-field.test.tsx:18-21`; e2e locator `"Stop acquiring AAPL"`). |
| T033 | complete | VERIFIED | `tailwind.config.js` diff against `design-system/theme.css` | Every added mapping resolves to an existing token; the two non-Tailwind sizing choices (`rows={4}`, `size={4}`) are documented as deliberate avoidance of off-scale values. |
| T034 | complete | VERIFIED | See Independent Validation | All five declared commands rerun and passing. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `bulk-add.test.tsx` / TC-COMP-101, TC-COMP-128 | ADEQUATE | Pastes `"AAPL,1BAD\nMSFT\tGOOG"` — comma, newline and tab in one string — through real `userEvent.paste`, then asserts `addInstruments` was *not* called before the preview, that counts and the rejected entry with its reason render, and that submission sends exactly the three recognised symbols. Removing the "report before adding" ordering, or letting a rejection discard the batch, fails it. | Semicolon is covered in the parser test rather than here; acceptable given `parse-bulk-symbols.test.ts:8-19` covers all four combined. |
| `parse-bulk-symbols.test.ts` / TC-COMP-101 | ADEQUATE | All four separators in one string, consecutive/trailing separators, case and whitespace normalisation, a malformed entry preserving its neighbours, and blank input. Pure function, no mocks, deterministic. | None. |
| `start-action.test.tsx` / TC-COMP-107, TC-COMP-130 | ADEQUATE for `StartAction`, but does not discharge TC-COMP-130 | Asserts `data-variant="blocked"`, absence of `disabled`, `tabIndex === 0`, and resolves `aria-describedby` to an element whose text names the reason — a genuine observable-outcome assertion, not a mock check. | TC-COMP-130's requirement is "a control that cannot be used", not "the Start action". No test covers the other unusable controls on these screens, all three of which violate the rule (IR-003). |
| `retire-dialog.test.tsx` / TC-COMP-109, TC-COMP-129 | WEAK for TC-COMP-109; ADEQUATE for TC-COMP-129 | TC-COMP-129 is proven: `confirm` variant, no `/delete\|remove/i` in the dialog, cancel focused, confirm labelled "Stop acquiring". TC-COMP-109 is asserted only by passing `hasActiveRun={true}` directly to the component. | No test exercises the dialog through `InstrumentTable`, which is where the literal `false` lives, so TC-COMP-109 passes over a branch production cannot reach (IR-002). |
| `instrument-table.test.tsx` / TC-COMP-131 | ADEQUATE | Renders a mixed page, locates the retired row through its symbol's `<tr>`, and asserts the `secondary` badge and `text-muted-foreground` class within that row — scoped assertions that a wrong-row regression fails. Filter tests clear the mock, drive real `userEvent` input, and assert the call payload. | The 3000-instrument volume case named by DAC-E2-10 is exercised only through a two-row fixture; no test would catch the missing pagination (IR-001). |
| `empty-states.test.tsx` / TC-COMP-133 | ADEQUATE | The two states come from genuinely different fixtures (`activeCount: 0` versus `activeCount: 3` with `rows: []`), so the test would fail if the screen collapsed them into one code path — which is AC-17's exact failure. Focus on the add field is asserted, not assumed. | None. |
| `history-depth-form.test.tsx` / TC-COMP-132 | ADEQUATE | Three separate substring assertions (operation, resource, reason) rather than one whole-string match, plus `setHistoryDepth` not called on an invalid value; the blur-versus-keystroke test asserts the negative before the positive. | No test covers a failed `getHistoryDepth` read, which is the unhandled-rejection path (IR-005). |
| `badges.test.tsx` / TC-COMP-134 | ADEQUATE | Asserts the text label, the variant, and — for retired — `fill="none"` on the shape, so "same shape recoloured" would fail it. | None for the lifecycle badge. |
| `credential-badge.test.tsx` / TC-COMP-134 | WEAK | Asserts only that each of the three states renders a distinguishing text label. | The task's own wording is "a text label alongside their shape/icon"; the component renders neither, and the test cannot detect that (IR-007). |
| `credential-status.test.tsx` / T016 | ADEQUATE | The three presence states plus a negative assertion scanning the whole rendered container for masks, bullet runs and "last four". `coverage-unknown` is asserted *with* a negative on "missing", which is the substantive rule. | None. |
| `add-field.test.tsx` / T017, T020 | ADEQUATE | Five tests: accessible name, `Enter` submission with case normalisation asserted through the call payload, duplicate-active as `aria-invalid` error, duplicate-retired as a notice with an explicit `not.toHaveAttribute("aria-invalid")`, and a rejected `ApiError` producing an operation-naming message. | Mocks replace only the client module; the component's own logic runs. |
| `routes.test.tsx` (T030 block) | ADEQUATE | Asserts the real screens' contents inside the shell (heading plus a screen-specific control, so a placeholder would fail), and that `aria-current` moves and vacates. | None. |
| `tests/e2e/instruments-add-retire.spec.ts` / T029 | ADEQUATE | Real API, real PostgreSQL, no mocks. Adds, asserts `active`, opens the dialog through the row-scoped accessible name, confirms, then asserts the same row still visible and now `retired` — the "never removed" rule of AC-21. | Single spec; the bulk path and Settings are not covered end to end, which matches the story's Testing section. |

Mock validity across the suite is sound: every `vi.mock` spreads `importActual` and replaces only the network functions, so the components under test execute their own logic. No test asserts on mock setup alone. Tests are deterministic — no real timers, no network, no ordering dependence between files — with the exception noted in IR-009, which concerns the Python suite's dependence on the TypeScript suite's build side effect.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 22 files, 93 tests passed, 2.92s. Includes a real Vite build (`build-output.test.tsx`). |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1 test passed (4.9s) against a real PostgreSQL container started by `scripts/run-e2e-server.sh` and the real API on `127.0.0.1:8123`; `posttest:e2e` removed the container. |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 47 files, no diagnostics. |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Check only, no fixes applied — constitution requires format commands not to rewrite. |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output. |
| `npm ci` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Install step, not a check. `node_modules` present and the five checks above ran against it; running it would mutate the tree without adding evidence. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Run as a regression check although this story touches no Python. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 23 source files, no issues. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 1 | FAIL | 1 failed, 132 passed. `tests/integration/test_api_static_mount.py::test_no_bundle_yet_falls_back_to_a_bare_404`. Not in this story's Validation Plan; cause is cross-suite ordering, not this change set — see IR-009. |

### Validation Side Effects

- Before: `git status --porcelain` empty; branch `usr/alvaro-de-jodra/CAP-001-E2-S4` at `bfcc2cd`.
- After: `git status --porcelain` empty; same HEAD.
- Unexpected tracked-file changes: none. `npm run test` wrote a Vite bundle into `src/factorflow/api/static/` (`index.html`, `assets/`), which `.gitignore` already excludes — an expected, recorded behaviour of that command per `tech-stack.md`. Nothing was restored or reverted.

## Findings

### IR-001 — The instrument table implements no pagination, so only the first server page is reachable

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-1, DAC-E2-10
- **Tasks**: T019
- **Files**: `web/src/screens/instruments/instrument-table.tsx:46-49, 50-58`; `web/src/api/client.ts` (`listInstruments`, `InstrumentListFilters`); `src/factorflow/api/bounds.py:18`; `src/factorflow/api/routes/instruments.py:149-150`
- **Claim challenged**: T019 is checked complete and names "keyset pagination consuming `listInstruments` (T003)" among its deliverables.
- **Observed evidence**: `InstrumentTable` calls `listInstruments({ symbol, lifecycle })` — no `limit`, no `cursor`. The resolved `page.nextCursor` is never assigned to state and never read; only `page.rows`, `page.activeCount` and `page.retiredCount` are. No "load more", no page control, and no virtualised window exists anywhere in the component. The typed client fully supports `limit` and `cursor`, so the capability exists and is simply unused. The API defaults to `DEFAULT_PAGE_SIZE = 50` when `limit` is absent.
- **Expected evidence/behavior**: T019 requires keyset pagination. Component design section 2.6 states: "This design implements the table as a keyset-paginated list with windowed rendering over the loaded pages", and records STD-UI-30 conformance as partial precisely because the `data-table` specification offers pagination. AC-1 requires "the current list is visible"; DAC-E2-10 sizes the table at 3000 instruments.
- **Impact**: With the story's own sizing case of 3000 instruments, the owner sees 50 rows. The toolbar simultaneously reports "3000 active, 0 retired", so the truncation is silent and actively misleading — the screen asserts a count it does not render and offers no affordance to reach the remainder. An instrument added beyond the first page cannot be confirmed or retired from this screen at all.
- **Required remediation**: Consume `nextCursor` — a "load more" control, incremental page accumulation, or the windowed rendering component design section 2.6 describes — so every instrument in the filtered result set is reachable, and add a test that fails when a second page exists and is not reachable.

### IR-002 — The retire confirmation's in-flight-run sentence can never render in the product

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-25, DAC-E2-11
- **Tasks**: T008, T022
- **Files**: `web/src/screens/instruments/instrument-table.tsx:183`; `web/src/screens/instruments/retire-dialog.tsx:52-57`; `web/src/screens/instruments/retire-dialog.test.tsx:29-37`
- **Claim challenged**: The commit message states the dialog is "carrying the in-flight-run sentence when a run is active", and T008/T022 are checked complete with a passing test for that branch.
- **Observed evidence**: `InstrumentTable` renders `<RetireDialog ... hasActiveRun={false} ... />` with a literal `false`. No state, prop, or fetch in the change set can make it `true`; no run-status source is consulted anywhere on these screens. The passing test constructs `RetireDialog` directly with `hasActiveRun={true}`, so it exercises a branch that no production code path can reach.
- **Expected evidence/behavior**: AC-25 and DAC-E2-11 both state that the retire confirmation states a run already under way still finishes with the instrument included. `ux-design.md` section 1.2 gives the copy and its rationale: saying nothing "leaves them to discover an observation written after they retired the instrument and read it as a defect rather than as the stated scope rule".
- **Impact**: The single capability-level acceptance criterion this story owns for retirement is not met in the shipped product. An owner who retires an instrument mid-run will see an observation written afterwards and has been told nothing about why. The literal `false` also makes the condition invisible to future maintenance: nothing marks it as a stub.
- **Required remediation**: Either wire `hasActiveRun` to a real run-status source, or — if no such source exists yet, which appears to be the case (`RunSummary` is typed `null` and no runs endpoint exists) — render the sentence unconditionally, which AC-25's and DAC-E2-11's own wording permits, and record the choice as a deviation. A hardcoded `false` that silently suppresses an acceptance criterion is not an acceptable third option; whichever is chosen, the deviation must be disclosed rather than described as implemented.

### IR-003 — Three bare `disabled` controls ship on these screens, contradicting the load-bearing `blocked`-not-`disabled` rule

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-3 (TC-COMP-130)
- **Tasks**: T027, T031
- **Files**: `web/src/screens/instruments/bulk-add.tsx:100`; `web/src/screens/settings/history-depth-form.tsx:66`; `web/src/screens/instruments/add-field.tsx:106`
- **Claim challenged**: T031 is checked complete and reads "`button` `blocked` never `disabled`"; the commit message records no exception.
- **Observed evidence**:
  - `bulk-add.tsx:100`: `disabled={recognised.length === 0 || submitting}` on a visible button reading "Add 0 instruments". This is a persistent, reachable state — paste an all-malformed batch and the preview renders with a bare-disabled submit carrying no `blocked` variant and no `aria-describedby`.
  - `history-depth-form.tsx:66`: `disabled={loading}` on the depth input while `getHistoryDepth` is in flight, with no reason exposed.
  - `add-field.tsx:106`: `disabled={submitting}` on the Add button.

  None of the three carries `data-variant="blocked"` or an `aria-describedby` reason. `start-action.tsx` — the one control the mandatory test covers — does both correctly.
- **Expected evidence/behavior**: DAC-E2-S4-3 states the rule categorically and gives its reason: "never a bare disabled control, because a disabled control hides its reason from keyboard and screen-reader users". Component design section 2.5 lists `button` `blocked`, not `disabled` as one of three usages that "must survive implementation unchanged".
- **Impact**: A keyboard or screen-reader user who reaches the Add-many region with an all-rejected paste finds an unfocusable button and no announced reason — exactly the failure the rule was written to prevent. The mandatory test passes because it asserts the rule only where it holds, which means the gate's own evidence is misleading about the screens' conformance.
- **Required remediation**: Render each control that cannot currently be used with the `blocked` treatment — focusable, with its reason visible and linked by `aria-describedby` — or justify per control why it falls outside DAC-E2-S4-3 (a sub-second in-flight state may well qualify; an all-rejected preview does not). Extend TC-COMP-130's coverage to at least the bulk-add submit control so the rule is asserted where it is at risk.

### IR-004 — A failed retirement is swallowed: the dialog closes and the failure is never reported

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-1 (indirectly)
- **Tasks**: T019, T022
- **Files**: `web/src/screens/instruments/instrument-table.tsx:77-84`
- **Claim challenged**: That the retire path handles its error conditions.
- **Observed evidence**: `handleRetireConfirm` wraps `await retireInstrument(symbol)` in `try { ... } finally { setRetireTarget(null); setReloadToken(...) }` with no `catch`. A rejected `retireInstrument` — `404` unknown symbol or `409` already retired, both documented in the client, or any transport failure — closes the dialog, triggers a reload, and discards the error. The rejected promise then surfaces only as an unhandled rejection.
- **Expected evidence/behavior**: The component's own load path reports failures (`loadError`, `role="alert"`); `ux-design.md` section 1.2's States table requires an error to be reported rather than absorbed. Explicit error handling is a standing review dimension.
- **Impact**: The owner confirms retirement, the dialog closes as though it succeeded, the table reloads and the instrument is still active. The interface has silently told them the opposite of what happened.
- **Required remediation**: Catch the failure, keep or restore a visible error naming the operation and the symbol, and do not present a failed retirement as a completed one.

### IR-005 — A failed history-depth read produces an unhandled rejection and no error state

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-2
- **Tasks**: T024
- **Files**: `web/src/screens/settings/history-depth-form.tsx:24-31`
- **Claim challenged**: That the Settings screen implements its designed states.
- **Observed evidence**: `getHistoryDepth().then(...).finally(() => setLoading(false))` — no `.catch`. `.finally` does not handle a rejection, so a failed `GET /api/settings/history-depth` leaves the promise rejected (unhandled) and the form renders an empty field with the "Required before the first acquisition run" description, indistinguishable from a genuinely unset depth. No error is rendered anywhere on Settings for a read failure. The write path, by contrast, handles its error correctly at lines 49-52.
- **Expected evidence/behavior**: `ux-design.md` section 1.3's States table: "Error | Field-level error through `form`, values preserved". The Instruments screen distinguishes an unset value from a failed read (`index.tsx:30-36` comments that Settings "is where that failure is reported in full") — which it is not.
- **Impact**: A transient API failure makes a configured history depth look unset. If the owner then types a value, the write silently overwrites a depth they could not see. The unhandled rejection is also a lint-invisible defect that will surface as a console error in the browser.
- **Required remediation**: Handle the rejected read, render the designed field-level error, and distinguish "not yet stated" from "could not be read".

### IR-006 — The retire dialog is non-modal: focus is not trapped and does not return to the triggering row action

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-2 (adjacent), AC-25
- **Tasks**: T022, T032
- **Files**: `web/src/screens/instruments/retire-dialog.tsx:27-44, 58-74`; `web/src/screens/instruments/instrument-table.tsx:180-187`
- **Claim challenged**: T022's "per the `dialog` contract" and the component's own comment presenting `<dialog open>` as sufficient.
- **Observed evidence**: The dialog renders `<dialog open aria-modal="true">`. As the component's own comment concedes, `open` (rather than `showModal()`) renders it non-modal: no browser focus trap, no inert backdrop, and no native Escape-to-close. Initial focus is driven manually onto cancel, but nothing traps focus inside the dialog, nothing closes it on Escape, and neither `onCancel` nor `onConfirm` restores focus to the row's "Stop acquiring" button — `instrument-table.tsx` simply sets `retireTarget` to `null`, and focus lands nowhere.
- **Expected evidence/behavior**: `ux-design.md` section 1.2's Accessibility subsection: "Dialog focus is trapped and returns to the triggering row action on close." `aria-modal="true"` on a non-modal dialog also asserts semantics the implementation does not provide, which is worse for a screen-reader user than not asserting them.
- **Impact**: A keyboard user tabbing past the confirm button lands in the page behind an ostensibly modal dialog, and on close has no focus position at all — they must tab from the document start to return to a 3000-row table.
- **Required remediation**: Provide the trap and the focus return the UX design specifies (or use `showModal()`), and ensure `aria-modal` matches the behaviour actually implemented.

### IR-007 — The credential badge renders no icon or shape and no visual badge treatment

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S4-7 (TC-COMP-134)
- **Tasks**: T013, T025
- **Files**: `web/src/screens/settings/credential-status.tsx:42-52`; `web/src/screens/settings/credential-badge.test.tsx`
- **Claim challenged**: T013's "assert the lifecycle badge, the provider-recognition badge, and the credential-status badge each render a text label alongside their shape/icon".
- **Observed evidence**: The credential badge is a `<span data-variant={variant} className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs">` containing a bare word. `data-variant` has no corresponding style rule anywhere — unlike `badges.tsx:40`, which pairs the attribute with `data-[variant=secondary]:bg-secondary`. There is no `<svg>`, no shape, and in fact no colour, so the variant exists purely as a test hook. The test asserts only the three text labels, so it cannot detect this.
- **Expected evidence/behavior**: DAC-E2-S4-7 requires "a text label plus icon or shape". `ux-design.md` section 1.3 and component design section 2.5 map this element to `badge` `status-good` / `status-critical`.
- **Impact**: The criterion's purpose — greyscale legibility — is trivially met, since the badge is text only, so this is not a HIGH. But the badge is not the mapped design-system rendering, the three states are visually undifferentiated, and `data-variant` as a pure test hook means the assertion proves nothing about what a user sees.
- **Required remediation**: Give the credential badge the shape/icon and status treatment its mapping specifies, and assert the rendered distinction rather than the `data-variant` attribute alone.

### IR-008 — Bulk add discards the API's per-symbol outcomes after submission

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-3, DAC-E2-S4-1
- **Tasks**: T021
- **Files**: `web/src/screens/instruments/bulk-add.tsx:34-53`
- **Claim challenged**: That the Add-many region reports what was and was not added.
- **Observed evidence**: `handleSubmit` awaits `addInstruments(symbols)` and then unconditionally clears `raw` and `parsed` and calls `onAdded()`. The resolved `AddInstrumentsResult` — whose `rejected` array carries `duplicate_active` and `malformed` outcomes, and whose `reactivated` array is separate by design — is never read. `AddField` handles the same response carefully (`add-field.tsx:54-65`); `BulkAdd` throws it away.
- **Expected evidence/behavior**: The client's own doc comment states the call "Resolves with the per-symbol disposition on `201` — including a batch with some rejections, which is not a transport-level error". `types.ts:79-90` records that the three arrays are kept separate "so a mixed batch's outcome is legible without the caller re-deriving it". The pre-submit preview discharges only the shape check the client can do locally.
- **Impact**: Paste 3000 symbols of which 200 are already active and 50 reactivate former instruments: the textarea clears and the owner is told nothing. They cannot tell which symbols the store accepted, and the reactivation case — which `AddField` treats as noteworthy — is invisible in the path that actually reaches AC-4's volume.
- **Required remediation**: Report the response's `added`/`reactivated`/`rejected` outcomes after submission, and do not clear the input in a way that loses entries the store did not accept.

### IR-009 — The Python suite fails after the TypeScript suite runs, through a stale "no bundle exists" assumption

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: N/A (pre-existing; not introduced by this change set)
- **Files**: `tests/integration/test_api_static_mount.py:77-88`; `web/src/app/build-output.test.tsx`
- **Claim challenged**: That the repository's validation commands are order-independent.
- **Observed evidence**: `uv run pytest -m 'not postgres'` fails on `test_no_bundle_yet_falls_back_to_a_bare_404` (1 failed, 132 passed) when run after `npm run test`. The test's own docstring says "No frontend bundle exists on this branch yet (task plan Notes)" and asserts `GET /coverage` returns a non-JSON 404 against the default `client` fixture, whose `_STATIC_DIR` is the real `src/factorflow/api/static/`. `npm run test` drives a real Vite build (`build-output.test.tsx`) that writes `index.html` and `assets/` into that directory — a documented behaviour in `tech-stack.md` — after which the SPA fallback correctly serves `index.html` and the assertion fails. Directory listing confirms `index.html` and `assets/` present; both are gitignored, so no tracked file changed.
- **Expected evidence/behavior**: A validation command's result should not depend on which other validation command ran first. The premise the test encodes — that no bundle exists on this branch — stopped being true when CAP-001-E1-S4 landed the frontend.
- **Impact**: `uv run pytest` cannot be trusted after a frontend test run, which is the normal order for a full-stack validation sweep on this repo. Not a blocker for this story: the failing assertion is outside this change set, the command is not in this story's Validation Plan, and the failure is a stale premise rather than a regression.
- **Required remediation**: Owner's call, and better handled outside this story — point the test at a controlled empty directory (as `client_with_bundle` already does for the positive case) so it stops depending on whether a build has run.

### IR-010 — The Start action is an inert control once history depth is set

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-9
- **Tasks**: T027
- **Files**: `web/src/screens/instruments/start-action.tsx:24-40`; `web/src/screens/instruments/index.tsx:77`
- **Claim challenged**: That mounting `StartAction` on Instruments is a complete reading of T027.
- **Observed evidence**: When `historyDepthYears !== null` the button renders `data-variant="default"` with an `onClick` that does nothing at all. It reads "Start acquisition run" and is fully enabled.
- **Expected evidence/behavior**: The task plan's Notes take the narrower reading deliberately — starting a run belongs to whichever story owns Coverage (1.1) — and that reading is sound. But it implies the blocked pattern, not a shipped control that claims to start a run and does not.
- **Impact**: An owner who sets history depth is offered a button that appears to start an acquisition run and silently does nothing. Cosmetic today (no Coverage screen exists), confusing as soon as anyone uses the screen.
- **Required remediation**: Render the action only in its blocked state, or point it at the real start path once Coverage lands. Whichever is chosen, it should not ship as an enabled control with an empty handler.

### IR-011 — `ScreenState` variants are used inconsistently with the union's own stated contract

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T023
- **Files**: `web/src/screens/instruments/index.tsx:21-23, 56-65, 96`; `web/src/api/types.ts:28-33, 56-64`
- **Claim challenged**: T023's "implementing the `ScreenState<T>` variants from the component design section 2.4".
- **Observed evidence**: `InstrumentsScreen`'s state never takes `empty-no-match`, `partial`, `unavailable` or `unreachable`; the no-match case is handled inside `InstrumentTable` with its own local state, and the `unreachable` branch at line 96 is dead. The `catch` at lines 56-65 maps *every* rejection — including `ApiUnreachableError` — to `kind: "error"`, while `types.ts:28-33` states the unreachable and error cases "must not be collapsed into one code path".
- **Expected evidence/behavior**: Component design section 2.4's union, as reproduced in `types.ts`.
- **Impact**: Minimal in practice: `shell.tsx:33` substitutes the whole route for the designed unreachable state once the health poll reports `unreachable`, so the collapsed branch is reachable only in a brief race. The screen's user-visible behaviour is correct; the internal contract is not what the type documents.
- **Required remediation**: Optional. Either narrow the catch so an `ApiUnreachableError` produces the `unreachable` variant, or record in the component why this screen delegates it to the shell and drop the dead branch.

### IR-012 — Three UX-design details for these screens are absent, none of them carried into the task plan

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T019, T022
- **Files**: `web/src/screens/instruments/retire-dialog.tsx`; `web/src/screens/instruments/instrument-table.tsx:163-171`; `web/src/screens/instruments/index.tsx`
- **Claim challenged**: Completeness of the screens against `ux-design.md` section 1.2 rather than against the task plan alone.
- **Observed evidence**: (a) "Retiring the last active instrument holding data in a range makes gap detection unavailable. The dialog says so when it applies" — not implemented and not mentioned in T022. (b) The States table's Stale row ("Last-updated time") is not rendered, although `ScreenState.populated` carries `fetchedAt` and the screen sets it. (c) The row retire action is mapped to `button` `ghost`; it renders as an unmarked `<button>` with no variant attribute, unlike every other mapped element in the change set.
- **Expected evidence/behavior**: `ux-design.md` section 1.2 Interaction Flows, States and Component Mapping.
- **Impact**: Small individually. (a) is the most substantive — it is a consequence the owner cannot see from this screen — but it depends on coverage data no endpoint currently exposes.
- **Required remediation**: Owner's call whether these belong to this story or to a follow-up; they were not planned tasks, so they do not block this gate. Worth an explicit decision rather than silence.

### IR-013 — Task-plan bookkeeping is stale: `status: draft` and a wrong branch name

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: N/A
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4-tasks.md:6, 39`
- **Claim challenged**: That the task plan's own metadata reflects the work it records.
- **Observed evidence**: The frontmatter still reads `status: draft` while all 34 task boxes are checked and `updated: 2026-09-10`. The header records **Branch**: `usr/alvaro-de-jodra/CAP-001-epics`, which is the epic-generation branch, not `usr/alvaro-de-jodra/CAP-001-E2-S4` where the work landed.
- **Expected evidence/behavior**: Task-plan metadata should identify the branch the work is on and a status consistent with its checkbox state.
- **Impact**: Evidence quality only. A reader resolving the plan to a branch is sent to the wrong one.
- **Required remediation**: Correct both fields when the implementation is reworked.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **`ScreenState<T>` was added by this commit, while T004 is checked as a confirmation that it already existed.** `web/src/api/types.ts:56-64` is new in `bfcc2cd`; T004's text is "Confirm ... `ScreenState<T>` union are present and importable on this branch; block if not yet landed, rather than duplicating them here". The commit message discloses this ("was not yet present after CAP-001-E1-S4/E2-S3, folded in here as authorized"). The union is reproduced faithfully from component design section 2.4 and is not duplicated elsewhere, so the outcome is correct and the deviation is disclosed — but T004 as a *blocking check* was not honoured as written. Recorded, not raised as a finding, because the alternative (blocking the story) would have been worse and the disclosure is explicit.
- **`Instrument.addedAt` / `retiredAt` omitted (T002).** Justified: `InstrumentResponse` from CAP-001-E2-S3 carries only `instrument_id`, `symbol`, `lifecycle`. Disclosed in the commit message and in the type's doc comment.
- **Provider-recognition badge not implemented (T013, ux-design 1.2 Component Mapping).** Justified: no recognition field exists in `GET /api/instruments`, and AC-11 makes recognition unknowable until a run reaches the instrument. Disclosed.
- **Start action mounted on Instruments (T007, T027).** The task plan's own Notes anticipated and permitted the narrower reading. Disclosed. See IR-010 for the unblocked-state consequence.
- **Undisclosed deviation: `hasActiveRun={false}` (IR-002).** The commit message lists three deviations and describes the in-flight sentence as delivered. It is not.
- **Undisclosed deviation: no pagination (IR-001).** T019 names it; the commit message does not mention its absence.
- **Playwright harness (`playwright.config.ts`, `scripts/run-e2e-server.sh`, `posttest:e2e`, `.gitignore`) is in scope**: `npm run test:e2e` is a validation command in this story's plan and had no config or specs before, so T029 could not be satisfied without it. The harness runs against a real container and the real API rather than a mock, matching component design section 7.
- No scope leakage found. No dependency was added; no unrelated refactor appears in the diff; no debug artifact, commented-out code, or skipped test is present.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Address IR-001, IR-002 and IR-003, which block this gate, and decide on IR-004 through IR-008 (all objectively supported, and IR-004 and IR-005 both hide a failure from the owner). IR-009 through IR-013 need an owner decision but not necessarily code. Then rerun `$adversarial-review` against this task file and this report; a v2 review will require current repository evidence for each disposition.
- **Warnings accepted downstream**: N/A — the verdict is `CHANGES-REQUIRED`, so nothing proceeds to Doc Sync.
