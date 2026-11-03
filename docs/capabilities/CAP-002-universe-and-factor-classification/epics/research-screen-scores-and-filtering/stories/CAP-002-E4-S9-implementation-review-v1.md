---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S9-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-03
updated: 2026-11-03
story_id: "CAP-002-E4-S9"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S9.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S9-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-03T04:49:05Z"
reviewed_head: "7624593e27bce49cc07b3f511757ea9ef7491ecb"
review_base: "aed93bd8debe45c4c2dbc2de6a9c120d879041a9"
reviewed_state_revision: "sha256:e67264f6fdc02b73c08c078db6114d4deba63905c1564182111d98a7850f40bd"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E4-S9
    artifact_version: 1
    content_revision: sha256:b96ebd7ef2b3fa55b89d291b25a941f046df5765dd8315a054a281a9b0485b13
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-03T04:49:05Z
  source_artifacts:
    - id: CAP-002-E4-S9
      version: "1 (sha256:b96ebd7ef2b3fa55b89d291b25a941f046df5765dd8315a054a281a9b0485b13)"
    - id: CAP-002-E4-S9-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E4-S9-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: DEC-0170
      version: "owner-upheld 2026-10-18"
    - id: DEC-0171
      version: "owner-upheld 2026-10-18 (amended E4-F36)"
    - id: DEC-0172
      version: "owner-upheld 2026-10-18"
    - id: STD-UI (ui-conventions)
      version: "current at review base"
    - id: tech-stack
      version: "current at review base"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S9 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 3 |
| Acceptance criteria | 16/16 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 7/7 passed |

The Research screen (`index.tsx`), the Results pane with the never-populated and nothing-found bodies (`results-pane.tsx`) and the Earlier sets dialog (`set-history-dialog.tsx`) implement every acceptance criterion as the plan and the owner-upheld DEC-0170, DEC-0171 and DEC-0172 specify. The production code is correct on every path this review walked. Every required command passed when rerun independently. The TDD evidence lint is clean, and the five mandatory TC tests (TC-COMP-185, 144, 145, 180, 099) are adequate.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 3 · **total 6**

The mutation run had 78 mutants: the 38 the catalogue generates over every changed production file, plus 40 written by hand for the contract. 70 were killed. Of the 8 survivors, 4 are equivalent. The other 4 are not, and each sits in an additional (non-TC) test: the banner's `set` source (2 mutants, IR-001), DEC-0171's `run_id` re-read trigger (IR-002), and the dialog's by-code failure sentence (IR-003). They make those additional tests `WEAK` and are MEDIUM, because the production code is right and no criterion is left incomplete. The CAP-002-E1-S7 v1 review rated its IR-002 the same way. Three LOW findings cover evidence and consistency.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S9.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S9-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S9-run-20261103T034434Z` |
| HEAD | `7624593e27bce49cc07b3f511757ea9ef7491ecb` (`feat(research): CAP-002-E4-S9 story-coding`, one commit over the base) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` (supplied by the supervised driver as `--base-ref`), merge base `aed93bd8debe45c4c2dbc2de6a9c120d879041a9`, an ancestor of HEAD; resolved with `pipeline-state.py review-base --base-ref` |
| Working tree | Clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 33 (11 source/test/doc files plus 22 TDD evidence files) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/index.tsx` | added | T014; AC-16, AC-20, DAC-E4-3, DAC-E4-4, DAC-E4-S9-3 |
| `web/src/screens/research/results-pane.tsx` | added | T013; AC-12, AC-20, AC-21, AC-22, DAC-E4-2, DAC-E4-3, DAC-E4-S9-1, DAC-E4-S9-2, DAC-E4-S9-5 |
| `web/src/screens/research/set-history-dialog.tsx` | added | T012; AC-21, DAC-E4-S9-4 |
| `web/src/screens/research/research.test.tsx` | added | T001, T003, T005 (screen half), T007, T008, T009 |
| `web/src/screens/research/results-pane.test.tsx` | added | T001 (body half), T002, T005, T006, T007 (a)-(d), (g) |
| `web/src/screens/research/set-history-dialog.test.tsx` | added | T004, T010 |
| `web/src/screens/research/copy.ts` | modified (+34) | T011: `RESULTS.title`, `RESULTS.sortLabels`, four latest-download sentences, `SCORE_SET.showMore`, `SCORE_SET.close`, each with a doc comment citing its design section and decision |
| `web/src/screens/research/copy.test.ts` | modified (+43) | T011 anchors for every added string |
| `.../stories/CAP-002-E4-S9-tasks.md` | modified | Checkbox flips for T001 to T017 only (word diff confirms no other change) |
| `.../stories/CAP-002-E4-S9.md` | modified | `status: planning` to `in-review` only |
| `.../stories/CAP-002-E4-S9-tdd-evidence.yaml` | added | T017 |
| `.../stories/CAP-002-E4-S9-evidence/` (22 files: `cycle-1..4.patch`, `red-cycle-1..4.log`, `green-cycle-1..4.log`, `mutants-cycle-1..4.json`, `mutation-cycle-1..4-results.json`, `full-suite.log`, `build.log`) | added | T017 evidence cited by the TDD evidence file |

`web/src/app/routes.tsx`, `shell.tsx` and every delivered test file are unchanged (T015; DEC-0084). `dependencies.yaml` already carries the two edges added at planning (`CAP-002-E4-S9: [E4-S1, S2, S4, S5, S6, S7, S8]`) and is not touched by this change.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 | SATISFIED | `results-pane.tsx` renders scores only through `ResultsTable` (S6); `index.tsx:58` `InspectorPanel symbol={selected}` | `research.test.tsx` "(a) calls the inspector once, 150 ms after the last selection change"; footnote screen test with the inspector open | The host renders no raw score. Cell formatting is S3 and S6's |
| AC-11 | SATISFIED | The pane adds no per-row work; `ResultsTable` is passed through unmodified (`results-pane.tsx:293-304`) | `results-pane.test.tsx` "stays one after a sort, a 3000-row count and a refresh"; S6's TC-COMP-093 (`results-table.test.tsx:277-333`) bounds the DOM | The host half only. The 3000-row volume E2E is Phase 6b (plan Open Gap 5) |
| AC-12 | SATISFIED | `results-pane.tsx:305-307` renders the STD-UI-18 footnote `CELL.coverageStatement` once, only for scored rows | TC-COMP-099 in `results-pane.test.tsx:268-314` and `research.test.tsx:438-448` | Absent in the never-populated and nothing-found states |
| AC-14 | SATISFIED | The host adds and hides nothing; the header's *{n} qualified, 30 needed* is S6's (`results-table.tsx` `FactorHeader`) | S6's `results-table.test.tsx:1339` | Nothing host-side to test beyond pass-through |
| AC-16 | SATISFIED | `index.tsx:25` one `useResearchQuery`; `index.tsx:29-30` `selected`/`checked` by symbol; tray `Compare` link (S7) | TC-COMP-145 (`research.test.tsx:366-435`); T009 (b) sort, scope and threshold survival; Compare link `/research/compare?symbols=AAPL,MSFT` | |
| AC-20 | SATISFIED | `results-pane.tsx:236` `later = summary ? summary.later : (result?.later ?? null)`; `:265` banner; `NeverPopulatedBody` first-set state `:127-146`; no retry for a failed set | T006 (b) (`results-pane.test.tsx:348-376`); T008 (`research.test.tsx:550-606`); pane-level failed-first-set tests | The banner's `set` source is not pinned by a test (IR-001); the code is correct |
| AC-21 | SATISFIED | `AsOfLine set={result?.set ?? null}` (`:271-281`); `SetHistoryDialog` (`set-history-dialog.tsx`) | T006 (c); TC-COMP-180 (`set-history-dialog.test.tsx:122-202`); T008 line-changes-only-after-new-page | |
| AC-22 | SATISFIED | `NeverPopulatedBody` (`results-pane.tsx:155-211`) through `empty("never-populated")` | TC-COMP-185 (`research.test.tsx:292-363`; `results-pane.test.tsx:518-622`) | |
| DAC-E4-2 | SATISFIED | The never-populated body reads `later` through the banner's expression (`:240`) | TC-COMP-185; "uses the list result's later until the first summary poll lands" | |
| DAC-E4-3 | SATISFIED | `h1` from `result.matchCount` (`:268-270`); URL-held query (`index.tsx:25`) | TC-COMP-144, TC-COMP-145 | |
| DAC-E4-4 | SATISFIED | `useScoreSetPoll({ onNewSet: bump })` (`index.tsx:26-27`); `refreshKey` to the table | T008: exactly one more list call, dimmed rows kept, one announcement, selection, checks and URL preserved, no further call after 30 s | |
| DAC-E4-S9-1 | SATISFIED | `empty()` returns two distinct bodies (`results-pane.tsx:238-258`) | TC-COMP-185 both files, including the populated nothing-found case | |
| DAC-E4-S9-2 | SATISFIED | `RESULTS.stocksMatch(result.matchCount)` | TC-COMP-144: 3000 with 50 rows, 12 with 3 rows and a cursor, 0, the title before a result and when never populated | |
| DAC-E4-S9-3 | SATISFIED | `useResearchQuery` is the only state home; no storage | TC-COMP-145: every key into the request and the pane, reload, back, `Storage.prototype` spies not called | |
| DAC-E4-S9-4 | SATISFIED | `SetHistoryDialog` over `DialogFrame`; Download cell `Link` with `aria-label` *Open the download started {time}* | TC-COMP-180: modal, labelled, API order, one request, start-time links, focus back on Close, Escape and a keyboard open | |
| DAC-E4-S9-5 | SATISFIED | `results-pane.tsx:305-307` | TC-COMP-099 | |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `research.test.tsx:292-363`; `results-pane.test.tsx:518-622` | The body assertions also run at pane level (cycle 3), a justified deviation recorded in the TDD evidence |
| T002 | complete | VERIFIED | `results-pane.test.tsx:217-265` | |
| T003 | complete | VERIFIED | `research.test.tsx:366-435` | Camel-case partial match per Open Gap 6 |
| T004 | complete | VERIFIED | `set-history-dialog.test.tsx:122-202` | |
| T005 | complete | VERIFIED | `results-pane.test.tsx:268-314`; `research.test.tsx:438-448` | |
| T006 | complete | VERIFIED | `results-pane.test.tsx:317-515` | (a) to (h) present. The test is WEAK on the banner's `set` source: IR-001 |
| T007 | complete | VERIFIED | `results-pane.test.tsx:624-943`; `research.test.tsx:451-547` | (a) to (g) present, partly at pane level (recorded). The test is WEAK on the `run_id` re-read trigger: IR-002 |
| T008 | complete | VERIFIED | `research.test.tsx:550-672` | Scoped refresh case and scope-free Save `setId` case both present |
| T009 | complete | VERIFIED | `research.test.tsx:675-840` | Justified deviation: (c) focus return and notice link and (d) two-notice stacking are covered by S8's `notices.test.tsx:104-135` and `add-to-universe-dialog.test.tsx:624`. The host's one-region concern is pinned (manual mutants `ix-two-notice-regions` and `ix-dismiss-noop` killed). The deviation is recorded only in the TDD evidence, and the test title overclaims: IR-004 |
| T010 | complete | VERIFIED | `set-history-dialog.test.tsx:205-468` | (a) to (h) present. (e) is WEAK on rendering by code: IR-003 |
| T011 | complete | VERIFIED | `copy.ts` +34 lines and anchors; `results-pane.tsx:18-43` doc comment | Strings and names reconciled. The run screens' words for `cancelling`, `cancelled` and `abandoned` match (`screens/runs/outcome-badge.tsx:28-33`), so no substitution was owed. The doc comment omits two items the task asked it to record: IR-005 |
| T012 | complete | VERIFIED | `set-history-dialog.tsx` | Justified deviation: State and outcome badges use S4's `StatusBadge`, which imports `TIER_CLASSES` from `outcome-badge.tsx` and draws UX design 1.2's tier shapes, rather than `TierIcon`. That is the plan's own "import it if S4 exports it" path, and it adds no third copy |
| T013 | complete | VERIFIED | `results-pane.tsx` | Every prop, source expression, body and ordering as specified |
| T014 | complete | VERIFIED | `index.tsx` | One of each hook; `NoticeRegion` once; inspector given the immediate symbol |
| T015 | complete | VERIFIED | `git diff --stat aed93bd..HEAD` | Only the planned files changed. No routed module imports `screens/research` (grep). `render.test.tsx` passes in the full suite |
| T016 | complete | VERIFIED | Lint, format, tsc, test and build all pass; the built CSS contains `bg-foreground`, `text-background`, `border-border`, `text-xs`, `text-lg`, `text-muted-foreground`, `gap-4`, `flex-wrap`, `bg-status-active-muted`, `bg-status-critical-muted`, `min-w-[40rem]`, `max-h-[60vh]` | Per-export DAC doc comments are incomplete: IR-005 |
| T017 | complete | VERIFIED | `CAP-002-E4-S9-tdd-evidence.yaml`, 4 cycles; lint 0 errors, 0 warnings with `--require-logs` | Each cycle names its patch, logs, review verdicts and mutation results |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `TC-COMP-185: the never-populated body is distinct from the nothing-found body` (both files) / TC-COMP-185 | ADEQUATE | `copy.ts` sentences; the `status-active` and `status-critical` badges; the first-set sentence built from `formatTimestamp`; latest-download sentence, link `href` and Data health link; no table, row, as-of line, Save, footnote, no-match text or retry; the populated zero-match case shows only the nothing-found body and issues no runs read | none |
| `TC-COMP-144: the heading shows the server's matchCount` / TC-COMP-144 | ADEQUATE | 3000 with 50 rows and a cursor; changed query 7; 12 with 3 rows; 0; title before a result and when never populated; one `h1` | none |
| `TC-COMP-145: reload and back restore state from the URL` / TC-COMP-145 | ADEQUATE | First request's camelCase params; every pane field; sort clause; storage spies; reload equality; back returns the field and the next request | none |
| `TC-COMP-180: the Earlier sets dialog opens and returns focus` / TC-COMP-180 | ADEQUATE | `dialog`, `aria-modal`, accessible name; API order; one request; link names and `href`s; no UUID, `#n` or `run-1`; focus to the opener after Close, Escape and a keyboard open; only **Close** when fully loaded | none |
| `TC-COMP-099: the absence-judges-presence footnote appears once` (both files) / TC-COMP-099 | ADEQUATE | Exactly one; classes; inside Results; after the table, before the tray; one after a sort and refresh, with 3000 and with 1 match; absent when nothing is found and when never populated; one across the screen with the inspector open | none |
| `results pane states and props` / T006 (additional) | WEAK | (a) order; (b) building and failed banners, no retry; (c) the line's set, `later` from the summary or the list, skeleton rules; (d) Save's count and `setId` from the list, no *including*; (e) Clear filters with focus to the `h1`; (h) eight sort-label cases | The banner's `set` source (`results-pane.tsx:265`) is unpinned. Manual mutants `rp-banner-set-summary-first` and `rp-banner-set-list-only` survive: IR-001 |
| `the latest download line` and `polling` (b) / T007 (additional) | WEAK | All eight run states and their sentences; the `requestedAt` fallback; no-reason fallback; `{ limit: 1 }` once on mount; omission with no run or a failed read; re-read on `later.state` and `later.runId`; re-read on health `state` through `HealthProvider`; stale and late answers ignored; unmount guard; poll-failure status and **Try again** placement | The `most_recent_run.run_id` trigger is unpinned. Manual mutant `rp-signal-no-runid` survives: IR-002 |
| `reloads page one once on completion…`, `Save carries the list's set id…` / T008 (additional) | ADEQUATE | One extra list call with equal params; held page shows dimmed rows and the old set; one announcement; selection, checks, tray and URL kept; no call after 30 s; unchanged and failed summaries reload nothing; Save `setId` `s-1` then `s-2`, `classification_set_changed` path | none |
| `(a)`–`(h)` screen wiring / T009 (additional) | ADEQUATE | Inspector called once at 150 ms, once for ten ArrowDowns; tray and Compare; selection and checks across sort, scope and threshold; Add with checked symbols in order; one notices region; Save absent under scope; history dialog leaves the screen intact; selection kept off-result; summary failing on mount | Test title overclaims (IR-004); the host concern itself is killed by mutants |
| `set history dialog details` / T010 (additional) | WEAK | Column order and `scope`; `history` variant; state badges with shapes; Started and Ended cells; Reason as text; outcome badge; qualified counts; bare first read, Show more once, de-duplication, focus kept or moved to Close; skeleton and `aria-busy`; alert by sentence and recovery; network fallback; page failure keeps rows; Tab trap; unmount; hostile reason rendered as text | (e) uses `internal_error`, whose sentence equals the fallback (`copy.ts:201` vs `:222`). Manual mutant `sh-errorcode-null` survives: IR-003 |
| `copy.ts` anchors (`copy.test.ts:642-683`) / T011 | ADEQUATE | Every added string; partial is never *Complete*; TC-COMP-072 scan still passes | none |

Mock validity: every test doubles only at the client boundary (`classification-client`, `client`) and keeps the real `ClassificationApiError`. The real S4 to S8 components are mounted. No assertion reads a mock's setup back as its result. Determinism: fake timers wrap every poll and debounce test, through `vi.advanceTimersByTimeAsync`; no real network, clock or storage is used. Regression sensitivity is measured below.

### Mutation run

Generated with `scripts/mutation-run.py generate --range aed93bd..HEAD --cycle review` over every changed production file: 38 mutants (29 negate-boolean, 9 off-by-one, none in `copy.ts`). 40 manual mutants were added for the sources of truth, the re-read signal, the copy mapping, focus, wiring, the error path and `copy.ts`. All 78 were run with the four focused suites. Baselines passed on 4/4 workers. Results: 70 killed, 8 survived. The results file sits beside this report as `CAP-002-E4-S9-implementation-review-v1-mutation.json` (sha256 `7da004310fb0fef1e1b9c3201851292e9debbe5376f66caf32395daa579cbe5f`).

| Survivor | Disposition | Reason |
|----------|-------------|--------|
| `index.tsx:26:off-by-one:1` (`key + 2`) | equivalent | `refreshKey` is an opaque reload trigger. `ResultsTable`'s contract (`results-table.tsx:95`, "Bumped by the host to reload page one once") compares it only for change; it is never rendered or ordered on. Every bump still changes it once |
| `index.tsx:26:off-by-one:2` (initial `1`) | equivalent | Same contract: the initial value is never observed, only its changes |
| `set-history-dialog.tsx:97:negate-boolean:1` (`useRef(false)`) | equivalent | The mount effect (`:139`) sets `true` before it issues the first read, so no read can settle against the initial value |
| `set-history-dialog.tsx:142:negate-boolean:1` (cleanup sets `true`) | equivalent | After unmount React 18.3 discards the late state updates without a warning, and `moreRef.current` is `null`, so the focus branch (`:117`) cannot fire. T010 (g) defines the observable as "no act warning", which holds |
| `manual:rp-banner-set-summary-first` | **not equivalent** | IR-001 |
| `manual:rp-banner-set-list-only` | **not equivalent** | IR-001 |
| `manual:rp-signal-no-runid` | **not equivalent** | IR-002 |
| `manual:sh-errorcode-null` | **not equivalent** | IR-003 |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review` (no base ref) | harness root | 1 | N/A | `BLOCKED — story coding has not reached in-review`: the default base is the remote default branch, so the TDD lint runs against the wrong range |
| `python3 scripts/pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261103T034433Z` | harness root | 0 | PASS | `aed93bd8debe45c4c2dbc2de6a9c120d879041a9`, equal to `git merge-base` |
| `npx vitest run web/src/screens/research/research.test.tsx web/src/screens/research/results-pane.test.tsx web/src/screens/research/set-history-dialog.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 4 files, 489 tests (32 + 60 + 21 + 376) |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 72 files, 1829 tests |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .`: 163 files, no fixes |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .`: 163 files, no fixes |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite build. The built CSS holds every class T016 names plus `min-w-[40rem]`, `max-h-[60vh]`, `animate-pulse` and `bg-card` |
| `python3 scripts/check-tdd-evidence.py --evidence …/CAP-002-E4-S9-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base aed93bd8debe45c4c2dbc2de6a9c120d879041a9 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range aed93bd8debe45c4c2dbc2de6a9c120d879041a9..HEAD --cycle review --out $SCRATCH/mutants.json` (`$SCRATCH` is the reviewer session's scratchpad, outside the component repo) | harness root | 0 | PASS | 38 mutants; 40 manual mutants appended |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCH/mutants.json --jobs 4 --command 'ln -s $PWD/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; npx vitest run web/src/screens/research/research.test.tsx web/src/screens/research/results-pane.test.tsx web/src/screens/research/set-history-dialog.test.tsx web/src/screens/research/copy.test.ts' --out $SCRATCH/mutation-results.json` (the `--command` was given with the absolute harness path; the full command is recorded in the copied results file) | harness root | 3 | PASS (evidence) | Exit 3 signals survivors. 70 killed, 8 survived, dispositioned above. Results outside the component repo, then copied beside this report |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the plan's Validation Plan and the story's Validation list: the Playwright specs the story names are Phase 6b automation, and the `/research` route is CAP-002-E4-S10's. No routed module imports any `screens/research` file (grep of `web/src/app` and the routed screens), so the E2E suite cannot reach this change. Same treatment as the CAP-002-E1-S9 v1 review |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact …/CAP-002-E4-S9.md` | harness root | 0 | PASS | `sha256:b96ebd7e…5b13`, equal to the story's approved `reviewed_revision` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after validation) | harness root | 0 | PASS | `sha256:e67264f6fdc02b73c08c078db6114d4deba63905c1564182111d98a7850f40bd` both times |

### Validation Side Effects

- Before: clean working tree at `7624593`; fingerprint `sha256:e67264f6…40bd`.
- After: clean working tree at `7624593`; same fingerprint. `npm run build` and the build-output test write into the git-ignored `src/factorflow/api/static/`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | initial | The banner's `set` source is not pinned; two non-equivalent mutants survive |
| IR-002 | MEDIUM | initial | DEC-0171's `most_recent_run.run_id` re-read trigger is not pinned; mutant `rp-signal-no-runid` survives |
| IR-003 | MEDIUM | initial | The history dialog's failure sentence "by code" is not pinned; mutant `sh-errorcode-null` survives |
| IR-004 | LOW | initial | T009 (c) and (d) are partly delegated without a plan record, and a test title overclaims |
| IR-005 | LOW | initial | The T011 and T016 doc-comment records are incomplete |
| IR-006 | LOW | initial | The never-populated body's download link has a bare timestamp as its accessible name |

### IR-001 — The banner's `set` source is not pinned; two non-equivalent mutants survive

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete; the behaviour serves AC-20, AC-21, DAC-E4-4)
- **Tasks**: T006 (test); T013 (the behaviour)
- **Files**: `web/src/screens/research/results-pane.tsx:265` `NotCurrentBanner set={result?.set ?? summary?.set ?? null}`; `web/src/screens/research/results-pane.test.tsx:378-387` "(c) the line's set is the list result's, the banner's later is the summary's"
- **Claim challenged**: Cycle 2's TDD evidence reports mutation score 1.0 for `results-pane.tsx`, and T006 (c) claims to pin the pane's sources.
- **Observed evidence**: Two mutants on line 265 pass the four focused suites:
  - `manual:rp-banner-set-summary-first` makes it `summary?.set ?? result?.set ?? null`.
  - `manual:rp-banner-set-list-only` makes it `result?.set ?? null`.

  The T006 (c) test builds the exact case that tells them apart, a summary naming `set-9` (ended 2026-10-14) with a building `later` over a list result naming `set-1`. It then asserts only that the banner exists, not which set its sentence names.
- **Expected evidence/behavior**: T013 fixes the expression `result?.set ?? summary?.set ?? null`. DEC-0170 says the figures beside the rows describe the rows on screen. The banner's sentence names that set: *Showing scores produced {time} from the download started {time}* (UX design 1.2, banner table). The plan's Risk note names the two sources of truth for the set as the largest risk. Under adversarial-review E.9, a survivor that is not equivalent makes the test that should kill it `WEAK`.
- **Impact**: The production code is correct today. If precedence were swapped, the banner would name a set that is not on screen. That happens when a completion poll and a newly building set arrive before the refreshed first page, so the summary carries `{set: S2, later: S3 building}` while the rows still show S1. Dropping the fallback would hide the banner while the first list page is pending, even though the summary already reports a building or failed later set. Both regressions would pass the suite.
- **Required remediation**: Make both mutants fail a test. Assert the banner's text (for example, its *Showing scores produced …* time) against the list result's set when the two sets differ. Also assert the banner renders from `summary.set` while `result` is still `null`.

### IR-002 — DEC-0171's `most_recent_run.run_id` re-read trigger is not pinned; mutant `rp-signal-no-runid` survives

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete; the behaviour serves AC-22, DAC-E4-2, DAC-E4-S9-1)
- **Tasks**: T007 (b) (test); T013 (the behaviour)
- **Files**: `web/src/screens/research/results-pane.tsx:167` `signal = [recent?.run_id, recent?.state, later?.state, later?.runId].join("|")`; `web/src/screens/research/results-pane.test.tsx:778-813` "(b) reads again when the shell's health reports the download changed"
- **Claim challenged**: The TDD evidence reports cycle 3 at mutation score 1.0 with "again when the health run or the first set changes".
- **Observed evidence**: `manual:rp-signal-no-runid`, which removes `recent?.run_id` from the signal, passes every focused suite. The only health-driven test moves `most_recent_run` from `{r1, running}` to `{r1, succeeded}`, which changes the state alone. The other three components of the signal each kill their own mutant (`rp-signal-no-recent-state`, `rp-signal-no-later-state`, `rp-signal-no-later-runid`).
- **Expected evidence/behavior**: DEC-0171 (owner-upheld) says the body "reads it again when useHealth().health.most_recent_run (run_id or state) or later (state or runId) changes". T013 repeats it: "again when `useHealth().health?.most_recent_run`'s `run_id` or `state` … changes".
- **Impact**: The production code is correct today. If the trigger were dropped, a download that fails and is followed by a new one within one 30-second health interval would go unnoticed. The health read moves from `{r1, running}` to `{r2, running}`, and no first set is produced, so `later` does not change. The never-populated body would keep reading *The latest download, started {r1's time}, is Downloading* about a download that has ended. The suite would not catch it.
- **Required remediation**: Make `rp-signal-no-runid` fail a test. For example, change the health double's `most_recent_run.run_id` while its `state` stays the same, and assert exactly one further `listAcquisitionRuns` read and the new line.

### IR-003 — The history dialog's failure sentence "by code" is not pinned; mutant `sh-errorcode-null` survives

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (no criterion is made incomplete; the behaviour serves AC-21, DAC-E4-S9-4)
- **Tasks**: T010 (e) (test); T012 (the behaviour)
- **Files**: `web/src/screens/research/set-history-dialog.tsx:146-150` and `:253-256` `errorCode`; `web/src/screens/research/set-history-dialog.test.tsx:373-390` "(e) states a failed read by code in an alert and recovers on Try again"; `web/src/screens/research/copy.ts:201` and `:221-223`
- **Claim challenged**: The test title says the failure is stated "by code"; the cycle-1 evidence reports mutation score 1.0 for the dialog.
- **Observed evidence**: `manual:sh-errorcode-null`, which makes `errorCode` return `null` for every failure, passes the focused suites. The test's only coded failure is `internal_error`, and `ERROR_SENTENCES.internal_error` (`copy.ts:201`) yields `${action}: ${FALLBACK_ERROR}`, the same sentence `failureSentence` returns for a `null` code (`copy.ts:221-223`). The test therefore cannot tell rendering by code from the fallback.
- **Expected evidence/behavior**: classification-ui 2.7: "Refusals render by code through `copy.ts`". UX design 1.1 States, Error: "the operation, the resource and the reason". T012: "Failures render `failureSentence`". T010 (e) names the `failureSentence` for the sets read. The sets read can return `cursor_invalid`, `cursor_stale` or `validation_error`, and each has its own sentence (`copy.ts:193-200`).
- **Impact**: The production code is correct today. A regression that dropped the code would show *FactorFlow hit an unexpected problem* for a stale **Show more** cursor or a validation refusal, losing the reason the design requires. The suite would not catch it.
- **Required remediation**: Make `sh-errorcode-null` fail a test. Reject the read with a `ClassificationApiError` whose code has a distinct sentence, for example `cursor_stale` on **Show more**, and assert that sentence.

### IR-004 — T009 (c) and (d) are partly delegated without a plan record, and a test title overclaims

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T009
- **Files**: `web/src/screens/research/research.test.tsx:770-790` "(d)/(e) one notices region stacks Save and Add notices, each dismissed alone"; `CAP-002-E4-S9-tdd-evidence.yaml` cycle-4 description; `CAP-002-E4-S9-tasks.md` T009 `[x]`
- **Claim challenged**: T009 is checked complete, and the test title claims Save and Add notices stack and are each dismissed alone.
- **Observed evidence**: The test raises one notice (Save) and dismisses it. No Add notice is raised in it, and no assertion covers two stacked notices or the status-region inventory. T009 (c)'s focus return to **Add to universe…** and its notice-link assertion are also absent. The TDD evidence says these were "Not added", because S8's and S7's own tests cover them. The task plan carries no deviation note.
- **Expected evidence/behavior**: T009 (c) and (d) as written. Adversarial-review C.5 asks that a checked task with partial evidence be flagged.
- **Impact**: Minimal. The deviation is justified in substance: `notices.test.tsx:104-135` covers stacking and dismiss-own, `add-to-universe-dialog.test.tsx:624` covers focus return, and the host's one-region concern is pinned (`ix-two-notice-regions` and `ix-dismiss-noop` were killed). The test title misdescribes what it proves.
- **Required remediation**: Rename the test to what it asserts, or make it raise both notices. Record the T009 (c)/(d) delegation in the task plan beside the task.

### IR-005 — The T011 and T016 doc-comment records are incomplete

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T016
- **Files**: `web/src/screens/research/results-pane.tsx:18-43`, `:48`, `:213`; `web/src/screens/research/set-history-dialog.tsx:88`
- **Claim challenged**: T011 asks `results-pane.tsx`'s doc comment to record four things: the S1 to S8 exports used, which of S4's badge helpers exist for T012, the variant and classes the shipped `AsOfLine` gives its **Try again** (reused by `NeverPopulatedBody`), and the run-screen word check. T016 asks for a doc comment on each export naming the DAC it serves.
- **Observed evidence**: The doc comment records the `onResult` payload, `incompleteCount = null`, the required `onInspect` and five component names. It does not mention `StatusBadge` (the S4 helper T012 actually uses), the reuse of `AsOfLine`'s **Try again** classes, or the run-screen word check. `ResultsPane`, `ResultsPaneProps` and `SetHistoryDialog`'s function carry no DAC-naming doc comment of their own; the file-level comments name the DACs.
- **Expected evidence/behavior**: T011 and T016 as written.
- **Impact**: Evidence quality only. The behaviour is correct: the classes match `as-of-line.tsx:189`, and the run-screen words match `outcome-badge.tsx:28-33`.
- **Required remediation**: Complete the doc-comment records when the file is next touched.

### IR-006 — The never-populated body's download link has a bare timestamp as its accessible name

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (AC-22, DAC-E4-S9-1 are satisfied)
- **Tasks**: T013
- **Files**: `web/src/screens/research/results-pane.tsx:112-125` `LatestDownload`
- **Claim challenged**: A download is named the same way on every CAP-002 surface.
- **Observed evidence**: The latest-download link's accessible name is its text, for example *2026-10-15 17:30 CDT*. The as-of line (`as-of-line.tsx:74`) and the history dialog (`set-history-dialog.tsx:67`) name their download links *Open the download started {time}*.
- **Expected evidence/behavior**: UX design 1.2 Accessibility: "The download link's accessible name is *Open the download started 2026-10-15 17:30 CDT*". Section 1.2 covers the never-scored condition too. The plan's T001 and T007 do not require it, and the enclosing sentence gives the link its purpose in context (WCAG 2.1 2.4.4). This is an improvement, not a defect.
- **Impact**: In a screen reader's links list the link reads as a bare time, unlike the two other download links on the same screen.
- **Required remediation**: Optional. Give the link `aria-label={SCORE_SET.openDownload(started)}` and update the tests that find it by name.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- T001 and T007 (a), (c), (d), (g) are asserted at the `ResultsPane` level as well as, or instead of, in `research.test.tsx`. This is justified, since the body lives in the pane, and is recorded in the TDD evidence's cycle 3. The screen-level halves exist.
- T009 (c) focus return and notice link, and (d) two-notice stacking and the status-region inventory, are delegated to S8's tests. This is justified in substance and recorded only in the TDD evidence (IR-004).
- T012 uses S4's `StatusBadge` for state and outcome badges instead of `TierIcon`. This is justified: it is the S4 export the plan prefers, and it imports `TIER_CLASSES` rather than copying it.
- The cycle plan in the TDD evidence differs slightly from the plan's Other Notes (T011 is spread over the cycles that needed each string, and T005's screen half falls in cycle 4). This is recorded in the evidence header.
- The state check without `--base-ref` reports `BLOCKED`, because it lints TDD evidence against the remote default branch. With the driver's integration branch it reports `READY`. This is an observation about invocation, not a defect in the change.
- Bookkeeping: none beyond IR-004. The task checkboxes and the story status line are the only plan or story edits. No out-of-scope file, dependency or configuration change.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-002-E4-S9 against reviewed HEAD `7624593e27bce49cc07b3f511757ea9ef7491ecb`. The MEDIUM test-strength findings IR-001 to IR-003 and the LOW findings IR-004 to IR-006 are carried as warnings; none blocks the gate.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005, IR-006
