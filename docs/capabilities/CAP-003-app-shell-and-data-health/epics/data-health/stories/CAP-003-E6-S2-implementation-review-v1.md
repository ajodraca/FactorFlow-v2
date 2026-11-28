---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-28
updated: 2026-11-28
story_id: "CAP-003-E6-S2"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-28T04:08:59Z"
reviewed_head: "c3f9996254f9c905b8a5002daa2938b705320fad"
review_base: "985e532eb464dcac465be6ecefa13fc609aa0560"
reviewed_state_revision: "sha256:563d4bedc4c561898498d6aae83cec69f50aaa5b7907be9116181ebc9c14295c"
verdict: CHANGES-REQUIRED
reviewed_paths:
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/cycle-1.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/cycle-2.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/cycle-3.patch
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/mutants-cycle-1.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/mutants-cycle-2.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/mutation-cycle-1-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/mutation-cycle-2-results.json
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/red-cycle-1.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-evidence/red-cycle-2.log
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-tasks.md
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-tdd-evidence.yaml
  - docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2.md
  - web/src/screens/data-health/copy.ts
  - web/src/screens/data-health/download-now.test.tsx
  - web/src/screens/data-health/download-now.tsx
  - web/src/screens/data-health/stop-following-dialog.test.tsx
  - web/src/screens/data-health/stop-following-dialog.tsx
review_subjects:
  - artifact_id: CAP-003-E6-S2
    artifact_version: 1
    content_revision: sha256:5993e405e8d1eb0fb928977f99ae0b25f6b45e90b1c0db7681b3a73a2c2adc7c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-28T04:08:59Z
  source_artifacts:
    - id: CAP-003-E6-S2
      version: "1"
    - id: CAP-003-E6-S2-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E6-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 8/10 satisfied |
| Planned tasks | 13/14 verified |
| Required validation | 5/5 passed (the mutation gate in T013 is not met) |

The production code does what the story asks. Both components go through the delivered endpoints. The two `409` refusals map to their own sentence and link, and a `202` either refreshes attention or shows the queued line. The dialog is `confirm`, has the verbatim blueprint wording, puts **Cancel** first and returns focus. All five story validation commands pass, and so does the TDD-evidence lint.

The gate fails on test strength. The reviewer's mutation run found five surviving mutants that are not equivalent. Two of them sit in the stop-following dialog's state handling, where the mandatory TC-COMP-162 test file should catch them:

- The coder called `stop-following-dialog.tsx:91:negate-boolean:1` equivalent, and that claim is wrong. A scratch probe shows the mutant moves focus to a *Needs fixing* heading that reappears later (IR-001, AC-25).
- Deleting the per-symbol refusal reset survives. A scratch probe shows the mutant carries an FBXX refusal into GOOD's dialog (IR-002, DAC-E6-12).

The task plan's T013 completion condition, "no surviving non-equivalent mutant", is therefore not met. Three further survivors show that the button variants the design specifies are not pinned (IR-003, MEDIUM). Three LOW findings record evidence and plan bookkeeping.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2.md` (approved, revision `sha256:5993e405…`, matching its approval block) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S2-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/screens/data-health/`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E6-S2-run-20261128T021153Z` |
| HEAD | `c3f9996254f9c905b8a5002daa2938b705320fad` |
| Review base | `usr/alvaro-de-jodra/CAP-003-integration-20261128T021153Z`, merge base `985e532eb464dcac465be6ecefa13fc609aa0560`. It came from `pipeline-state.py review-base --base-ref` and is an ancestor of HEAD |
| Working tree | clean: nothing staged, unstaged or untracked, before and after validation |
| Changed files reviewed | 17, in four commits: `dad1fe77` cycle 1, `1aa43bc3` cycle 2, `d0dd0594` cycle 3 and `c3f99962` story-coding completed |
| Baseline | none: initial review |

The state check `pipeline-state.py check … --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261128T021153Z` returned `ready` (`ready-for-review`; mutation score 0.902 over 2 cycles). Without `--base-ref` it falls back to the default branch and reports `BLOCKED`. The driver supplied the integration branch, so the `--base-ref` result governs.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/data-health/download-now.tsx` | added | AC-15, AC-17, DAC-E6-11, DAC-E6-S2-1; T010 |
| `web/src/screens/data-health/download-now.test.tsx` | added | TC-COMP-161, 163 and 164; T002, T003, T006, T007, T008 |
| `web/src/screens/data-health/stop-following-dialog.tsx` | added | AC-14, AC-17, AC-25, DAC-E6-12, DAC-E6-S2-2; T011 |
| `web/src/screens/data-health/stop-following-dialog.test.tsx` | added | TC-COMP-162, 163 and 164; T004, T005, T006, T007, T008 |
| `web/src/screens/data-health/copy.ts` | modified | T009. It appends an S2 section; S1's import line gains `ApiError`, the only edit to S1's lines |
| `docs/…/CAP-003-E6-S2.md` | modified | `status: planning` → `in-review`, the coding stage's bookkeeping |
| `docs/…/CAP-003-E6-S2-tasks.md` | modified | T001 to T014 checkboxes only; the text is unchanged |
| `docs/…/CAP-003-E6-S2-tdd-evidence.yaml` | added | T014 |
| `docs/…/CAP-003-E6-S2-evidence/cycle-{1,2,3}.patch` | added | T014 `reviewed_patch` |
| `docs/…/CAP-003-E6-S2-evidence/mutants-cycle-{1,2}.json`, `mutation-cycle-{1,2}-results.json` | added | T013, T014 mutation evidence |
| `docs/…/CAP-003-E6-S2-evidence/red-cycle-{1,2}.log` | added | T014 RED evidence |

No `package.json`, lockfile, `src/` (Python) or other `web/` file changed.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 | SATISFIED | `download-now.tsx` `start()` l.47–71: `startAcquisitionRun()` is called with no argument, `queuedBehind === null` leads to `refresh("attention")`, and otherwise the queued outcome renders. The `QUEUED_NOTICE` `<output>` is at l.86–88 | `download-now.test.tsx` T003 (a) refresh once with `"attention"`, (b) the queued line and no refresh, (d) `mock.calls[0]` equals `[]` | The whole list is always used, and no per-stock retry exists (D-9) |
| AC-14 | SATISFIED | `stop-following-dialog.tsx`: `ConfirmDialog` with `stopFollowingTitle` and `stopFollowingDescription` (copy.ts, the blueprint sentence verbatim), `retireInstrument(target)` only from `onConfirm` | T004 (a) name and exact description, (b) `confirm` with no `alertdialog` or `destructive`, (d) Cancel calls nothing; T005 (f) a `200` closes and calls `onStopped` | History is kept per the wording; no deletion is implied (STD-UI-2) |
| AC-17 | SATISFIED | Only the delivered `startAcquisitionRun` and `retireInstrument` are called (`web/src/api/client.ts` l.560, l.231). Refusals are keyed by the delivered wire codes in `START_REFUSALS` and `STOP_REFUSAL_REASONS` | T002 (a)–(d), T005 (a), (c), (e); `retireMock` is called with exactly `"FBXX"` (T004 (e)) | CAP-001's codes are unchanged; `ApiError.message` is never rendered (T002 (e), T005 (k)) |
| AC-25 | PARTIAL | Cancel first and focused, plus the trap, come from `ConfirmDialog`. The opener is captured in `useLayoutEffect` (l.72–79). The fallback focus effect (l.84–101) focuses the heading once when the opener has left and focus is on `body`, then clears `watchRowExit` (l.91) | T004 (c) order, focus and Tab wrap; T004 (d), T005 (b), (f)–(i), (l)–(o) | The production code is correct (probe P1 passes on HEAD). No committed test pins the "clear once" at l.91 when no heading is mounted, and a mutant there moves focus later (IR-001) |
| DAC-E6-11 | SATISFIED | As AC-15, plus `START_REFUSALS` (copy.ts) with sentence, fix and path for each code. No `ConfirmDialog` import (grep clean) | T002 (a), (b), (f); T003 (c) one click posts once with no dialog; T006 (b) | The variants of the action and its fixes are unpinned (IR-003, MEDIUM) |
| DAC-E6-12 | PARTIAL | `confirm()` l.103–125: a `200` closes, calls `onStopped`, refreshes attention and announces in an always-mounted `<output aria-live="polite">` outside the dialog. A `404` or `409` keeps the dialog open with `stopFollowingFailed(target, …)`. The refusal is reset whenever `symbol` turns non-null (l.77) | T005 (a)–(f), (j), (k); T006 (d)–(f) | The production code is correct (probe P2 passes on HEAD). The per-symbol reset at l.77 is not pinned: deleting it survives every committed test, and a refusal naming FBXX then shows in GOOD's dialog (IR-002) |
| DAC-E6-S2-1 | SATISFIED | `isRefusalCode` uses `Object.hasOwn(START_REFUSALS, code)`. Any other `ApiError` or a non-Error reads as `readFailureReason(new ApiError("", ""))`, and an `ApiUnreachableError` as `readFailureReason(cause)`. **Try again** sits outside the `<output>` | T002 (a), (b): the two reasons are never interchanged and each link has its `href` and navigates. T002 (c): unreachable shows **Try again**, which posts again. T002 (d): an unknown `409` and `internal_error` read as unexpected | — |
| DAC-E6-S2-2 | SATISFIED | `onOpenChange` l.127–135: a stale-row failure calls `onRefusalClosed` once and then `onClose` | T005 (a), (b) `409` then Esc: `refusalClosed` once and focus on the row; (c) `404` then Cancel; (e) other failures call it zero times | The re-read the refusal triggers is the caller's (Resolved Conflict 3, Open Gap 4) |
| DAC-E6-S2-3 | SATISFIED | Every string comes from `copy.ts`; envelope messages are never rendered | T007 (a)/(b) term scan over 8 and 7 states, (c) the planted cases, (d) the label allow-lists | Source grep: every match is a comment (IR-006 notes a wording gap in the plan's check) |
| DAC-E6-S2-4 | SATISFIED | No `StatusBadge` or `NotDeterminable` import (grep clean). Both doc comments record that the one-tier rule is not applicable | T008 (a) no `status-*` or `coverage-unknown` variants, (b) no colour utility and non-empty text in every status element | Coverage-matrix note 7 governs the template clause |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `985e532e`, `Button` (`default`/`outline`/`ghost`, `asChild`), `ConfirmDialog(Props)`, `toast`, `useShell` with `refresh(kind)`, `TRY_AGAIN` and `readFailureReason` exist, and `download-now.tsx` is absent | The pre-change green run is not recorded anywhere (IR-004). The reviewer's full suite at HEAD is green |
| T002 | complete | VERIFIED | `download-now.test.tsx` "Download now refusals and failures (TC-COMP-161…)" (a)–(f), with `// Implements TC-COMP-161` | The `OTHER_409` message differs from the plan, a justified deviation (cycle-1 deviation 1) |
| T003 | complete | VERIFIED | "Download now 202 outcomes…" (a)–(g) | (e) also asserts that no `aria-busy` is set initially |
| T004 | complete | VERIFIED | `stop-following-dialog.test.tsx` "Stop following dialog (DAC-E6-12, AC-14, AC-25)" (a)–(e) | — |
| T005 | complete | VERIFIED | "Stop following outcomes (TC-COMP-162…)" (a)–(k), plus (l)–(o) added after mutation scoring | Every planned case exists and passes. Its test strength is the subject of IR-001 and IR-002 |
| T006 | complete | VERIFIED | `copy.ts` describes in both files (a)–(f) | (f) adds a plain-string negative |
| T007 | complete | VERIFIED | The vocabulary describes in both files (a)–(d), with `// Implements TC-COMP-163` | `visibleAndAccessibleText` reads `aria-label` and `title`, not computed names. The dialog's name and description are body text, so nothing is missed |
| T008 | complete | VERIFIED | The badge describes in both files (a), (b), with `// Implements TC-COMP-164`; doc comments for (c) | — |
| T009 | complete | VERIFIED | The `copy.ts` S2 section l.162–242: every planned export, plus private `isStopRefusalCode` and both doc comments | The token scan prints nothing |
| T010 | complete | VERIFIED | `download-now.tsx` `DownloadNow({ label = DOWNLOAD_NOW })`, the state, the `pending` ref guard, the markup and the doc comment | `<output>` is used in place of `<p role="status">` (biome `useSemanticElements`), recorded as cycle-1 deviation 2 |
| T011 | complete | VERIFIED | `stop-following-dialog.tsx` `StopFollowingDialog`: open state, `lastSymbol`, opener capture, `confirm`, `onOpenChange`, the always-mounted live region, the fallback focus and the doc comment | The `setTimeout(0)` retry and the dialog-focus exclusion are recorded as cycle-2 deviation 1. The extra type export `StopFollowingDialogProps` is harmless |
| T012 | complete | VERIFIED | Full suite green; token scan, toast/badge/navigate scan and `git diff` scope all clean | Only the five planned `web/` files changed |
| T013 | complete | PARTIAL | lint, format, tsc and build pass | Its own completion condition, "no surviving non-equivalent mutant", fails. The cycle-2 survivor at `:91` was called equivalent wrongly, and four more survive the reviewer's run (IR-001, IR-002, IR-003) |
| T014 | complete | VERIFIED | Three cycles with code-review and spec-drift verdicts, RED logs, patches and fingerprints; `check-tdd-evidence.py --require-logs` gives 0 errors | Cycle 3 has tests only, with `red_cycle: cycle-2` and `mutation: not_applicable` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `download-now.test.tsx` T002 / TC-COMP-161 | ADEQUATE | The exact sentences, link `href`s and real navigation through `MemoryRouter`. Each refusal is asserted against the other's absence. **Try again** is asserted outside the status element and posts again. The unknown code and `internal_error` are asserted. The envelope text is checked against `document.body`. The real `ApiError` and `ApiUnreachableError` classes are used | none for the AC |
| `download-now.test.tsx` T003 / TC-COMP-161 edge | ADEQUATE | `refresh` count and argument, no navigation, the queued `<output>` and no refresh, no dialog, an empty argument list, the in-flight `aria-busy` with no `disabled` and a guarded second click, the empty-state label, no toast | The variants are unpinned (IR-003) |
| `stop-following-dialog.test.tsx` T004 | ADEQUATE | Accessible name and description, `data-variant="confirm"`, `aria-modal`, no `alertdialog`, the confirm button `default`, button order, initial focus, Tab wrap, Cancel focus return, in-flight `aria-busy`, Esc and Cancel blocked, the call argument | none |
| `stop-following-dialog.test.tsx` T005 / TC-COMP-162 | WEAK | A `409` or `404` stays open with the exact sentence. Esc and Cancel each call `refusalClosed` once, and other failures call it zero times. A `200` closes, re-reads, refreshes and announces outside the dialog with no toast or alert. The focus cases cover a row that leaves later or at once, no theft, and Cancel not watching | Two non-equivalent survivors: `:91` "clear once" when no heading is mounted (IR-001) and `:77` the refusal reset on a `symbol` change (IR-002) |
| Both files T006 | ADEQUATE | Exact strings for every new export; `stopFailureReason` per error, with no message or request id leaking; `isStaleRowRefusal` true and false cases | none |
| Both files T007 / TC-COMP-163 | ADEQUATE | The whole-word, case-insensitive term scan runs over every state the story defines, with planted positives and negatives (the wire code `instrument_not_found` does not match). The label allow-lists are exact for the dialog | none |
| Both files T008 / TC-COMP-164 | ADEQUATE | No `status-*` or `coverage-unknown` variants. The variant allow-lists are exact (the dialog only `confirm`). No status or destructive colour utility, prefixed ones included. Every status or live element has text | none |

**Mutation (E.9).** `mutation-score.py score` gives 0.902 over 2 cycles: 46 of 51 killed and 5 called equivalent. The reviewer regenerated mutants over all three changed production files with the shared catalogue (35 mutants). The run added the coder's 16 hand-written mutants and 15 of the reviewer's own (`"operator": "manual"`), for 66 in all. It used the focused suite `npx vitest run web/src/screens/data-health`, with `node_modules` linked, 4 jobs and all baselines at exit 0. The result was **55 killed and 11 survived**, and is copied beside this report as `CAP-003-E6-S2-implementation-review-v1-mutation.json` (sha256 `bc6fc53b…`).

Adjudication of the 11 survivors:

| Mutant | Disposition | Contract reasoning |
|--------|-------------|--------------------|
| `stop-following-dialog.tsx:64:off-by-one:1` (serial 0 → 1) | equivalent | T011 fixes only that each stop gives the span a new key (`prev + 1`). The initial serial is left open, and the key still changes on the first stop |
| `stop-following-dialog.tsx:66:negate-boolean:1` (`watchRowExit` starts true) | equivalent | Before the first open `opener.current` is null, so `null?.isConnected === false` is false and only the clearing branch can run. T011's layout effect sets the flag false on every open |
| `stop-following-dialog.tsx:99:off-by-one:1` (`setTimeout` 0 → 1) | equivalent | No artifact specifies the retry delay. The retry itself is cycle-2 deviation 1 |
| `stop-following-dialog.tsx:112:off-by-one:1` (serial +2) | equivalent | The behaviour T011 specifies is a fresh keyed node per stop, and that is unchanged |
| `rv:close-failure-not-reset` (l.133 deleted) | equivalent | Under DEC-0379's caller contract, `onClose` makes the caller set `symbol` to null. `ConfirmDialog` (`web/src/components/ui/dialog.tsx`) has no exit animation, so the closed content is unmounted. `onOpenChange` is not called while closed, and l.77 resets the refusal on the next open |
| `rv:no-last-symbol` (l.68 deleted) | equivalent | `ConfirmDialog` has no exit animation, so the closing content unmounts in the same commit. T011 asks only that the title never render `null`, and the mutant renders an empty symbol in content that is no longer mounted |
| `stop-following-dialog.tsx:91:negate-boolean:1` | **not equivalent** | The coder's claim assumes the heading took focus. When `fallbackFocusRef.current` is null, which the plan's Other Notes expect once the card falls to *Nothing needs fixing.*, the flag stays set. The heading is then grabbed when it reappears. Probe P1 kills it (IR-001) |
| `rv:open-failure-not-reset` (l.77 deleted) | **not equivalent** | T011 requires `failure` "reset to null whenever `symbol` changes". Probe P2 kills it (IR-002) |
| `rv:download-variant-outline`, `rv:refusal-link-variant-default`, `rv:try-again-variant-default` | **not equivalent** | data-health-ui §10 maps Download now to `button` `default` ("one per region") and Try again to `outline`. T010's markup fixes `default` for the action and `outline` for both fixes (IR-003) |

The probes ran in a `git archive HEAD` export in the session scratchpad, with `node_modules` linked. File `review-probe.test.tsx` holds P1 and P2. Both pass on HEAD, P1 fails with the `:91` mutant and P2 fails with the `l.77` mutant. Nothing was written to the component repository.

Determinism: time and network are controlled through mocks and `deferred`, and every mock is reset in `beforeEach`. The `settle()` helper waits 20 ms in real time, which is enough for the `setTimeout(0)` retry; the focused files passed on every run.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All 8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261128T021153Z` | harness root | 0 | PASS | `ready-for-review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261128T021153Z` | harness root | 0 | PASS | `985e532e…`, an ancestor of HEAD |
| `npx vitest run web/src/screens/data-health/download-now.test.tsx web/src/screens/data-health/stop-following-dialog.test.tsx` | component root | 0 | PASS | 2 files, 58 tests (26 + 32) |
| `npx vitest run web/src/screens/data-health` | component root | 0 | PASS | 4 files, 144 tests |
| `npm run test` | component root | 0 | PASS | 135 files, 3846 tests |
| `npm run lint` | component root | 0 | PASS | biome checked 304 files with no diagnostics |
| `npm run format` | component root | 0 | PASS | biome checked 304 files with no changes needed |
| `npx tsc --noEmit` | component root | 0 | PASS | no output |
| `npm run build` | component root | 0 | PASS | vite built in 1.75 s; it writes ignored files under `src/factorflow/api/static/` |
| `npm ci` | component root | N/A | NOT RUN | An install step, not a check. `package.json` and the lockfile are unchanged since the base. `npm ls --depth=0` exits 0, so the installed tree is consistent. Reinstalling would replace the `node_modules` that the mutation clones link to |
| `uv …` Python commands | component root | N/A | NOT RUN | No `src/`, `tests/`, `pyproject.toml` or `uv.lock` change (`git diff --name-only` empty), as the plan's Validation Plan states |
| `npm run test:e2e` | component root | N/A | NOT RUN | No end-to-end case belongs to this story (plan Validation Plan) |
| T012 token scan `grep -nE "[0-9](px\|rem\|em\|vh\|vw)\b\|#[0-9a-fA-F]{3,8}\b\|rgb\(\|hsl\(" <3 production files>` | component root | 1 | PASS | No match |
| T012 `grep -nE "components/ui/toast\|StatusBadge\|NotDeterminable\|navigate\(" download-now.tsx stop-following-dialog.tsx` | component root | 1 | PASS | No match |
| `grep -nE "ConfirmDialog\|components/ui/dialog" download-now.tsx` | component root | 1 | PASS | No confirmation wired |
| DAC-E6-S2-3 source cross-check `grep -niE "\b(instrument\|acquisition\|acquire\|run\|runs\|retire\|retired)\b" <3 production files>` | component root | 0 | PASS (purpose) | 5 lines are printed, all comments with no string literal. Two of them (`stop-following-dialog.tsx` l.71, l.83) use *runs* as a verb and cite no delivered file (IR-006) |
| `git diff --name-only 985e532e..HEAD -- web package.json package-lock.json` | component root | 0 | PASS | Exactly the five planned `web/` files |
| `python3 scripts/check-tdd-evidence.py --evidence <story-id>-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 985e532e… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-score.py score --evidence <story-id>-tdd-evidence.yaml --project-repo repos/factorflow-v2/FactorFlow-v2` | harness root | 0 | PASS | 0.902; the project declares no minimum |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 985e532e…..HEAD --cycle review --out <scratch>/mutants.json`, plus 31 manual mutants | harness root | 0 | PASS | 35 generated (32 negate-boolean, 3 off-by-one) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/mutants.json --jobs 4 --command "ln -sfn <component>/node_modules node_modules && npx vitest run web/src/screens/data-health" --out <scratch>/results.json` | harness root | 0 | FAIL (gate evidence) | 66 mutants: 55 killed, 11 survived, of which 5 are not equivalent (IR-001, IR-002, IR-003) |
| Probe `npx vitest run web/src/screens/data-health/review-probe.test.tsx` in a scratch `git archive HEAD` export | scratch | 0 / 1 / 1 | PASS on HEAD; FAIL with `:91` and with `l.77` mutated | Evidence for IR-001 and IR-002 |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | harness root | 0 | PASS | `sha256:5993e405…`, equal to the story's `approval.reviewed_revision` |

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-003-E6-S2-run-20261128T021153Z` at `c3f99962` with a clean working tree; `code-revision` `sha256:563d4bed…`.
- After: the same branch and HEAD with a clean working tree (`git status --porcelain` empty before this report was written); `code-revision` still `sha256:563d4bed…`. The build writes only ignored files. The mutation clones, the logs and the probe export all lived in the session scratchpad.
- Unexpected tracked-file changes: none. This review adds only this report and `CAP-003-E6-S2-implementation-review-v1-mutation.json`.

## Findings

CRITICAL 0 · HIGH 2 · MEDIUM 1 · LOW 3 · **total 6**

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | The fallback focus's "clear once" is unpinned, so a reappearing heading can be grabbed |
| IR-002 | HIGH | initial | OPEN | The refusal reset on a `symbol` change is unpinned, so a stale refusal can follow the dialog to another stock |
| IR-003 | MEDIUM | initial | OPEN | The design-specified `button` variants of Download now and its fixes are unpinned |
| IR-004 | LOW | initial | OPEN | T001's pre-change green run is not recorded, and the evidence header names a stale base |
| IR-005 | LOW | initial | OPEN | **Try again** unmounts while focused, so keyboard focus falls to `body` |
| IR-006 | LOW | initial | OPEN | The plan's DAC-E6-S2-3 source cross-check prints two comment lines that cite no delivered file |

### IR-001 — The fallback focus's "clear once" is unpinned, so a reappearing heading can be grabbed

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-25; data-health-ui §10 ("focus returned to the row's **Stop following** or, when the row has left, to the *Needs fixing* heading. Polling and a row leaving announce politely and never move focus")
- **Tasks**: T005, T011, T013
- **Files**: `web/src/screens/data-health/stop-following-dialog.tsx` l.89–92 (`fallbackFocusRef.current?.focus(); watchRowExit.current = false;`); `web/src/screens/data-health/stop-following-dialog.test.tsx` T005 (g), (h), (m)
- **Claim challenged**: In the cycle-2 TDD evidence, survivor `stop-following-dialog.tsx:91:negate-boolean:1` is called equivalent, because "after the heading takes focus the flag stays true only until the effect's own setTimeout pass". T013 says no non-equivalent mutant survives.
- **Observed evidence**:
  - The equivalence argument holds only when the heading actually takes focus. The plan's Other Notes state the other case: "When the card falls to *Nothing needs fixing.* and the heading is gone, the ref is `null` and nothing is focused."
  - In that case the mutant leaves `watchRowExit` true. A later render that mounts the heading again then focuses it.
  - Probe P1 (scratch export) checks this. The card's heading exists only while rows do. FBXX is stopped, the rows go to `[]` with focus on `body`, then a new row `NEW` arrives, and the probe expects the heading not to be focused. P1 passes on HEAD and fails with the mutant: the heading is focused.
  - No committed test renders the dialog with `fallbackFocusRef.current === null`, so all 32 tests in the file pass with the mutant (reviewer run: `survived`).
- **Expected evidence/behavior**: T011 says the effect "focuses `props.fallbackFocusRef.current` and clears `watchRowExit`", and "never moves focus the owner has placed elsewhere" (STD-UI-24). The Other Notes say that with no heading "nothing is focused". The skill (E.9) makes a non-equivalent survivor turn the test that should kill it `WEAK`. This is the mandatory TC-COMP-162 focus group.
- **Impact**: Consider an owner who stops following their only problem stock. Once the card falls to *Nothing needs fixing.*, a regression of this one line passes the suite. Focus would then jump to the *Needs fixing* heading the next time a download leaves a problem, with no action by the owner. That is the unprompted focus move the design forbids for a row or region changing.
- **Required remediation**: Add a test in `stop-following-dialog.test.tsx` where `fallbackFocusRef.current` is null when the row leaves after a stop. Have it assert that nothing is focused, and that a heading mounted on a later render is not focused. Then correct the TDD-evidence disposition of `:91:negate-boolean:1` so the mutant is killed.

### IR-002 — The refusal reset on a `symbol` change is unpinned, so a stale refusal can follow the dialog to another stock

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-12 (*Couldn't stop following {SYMBOL}: {reason}.* names the stock being confirmed), DAC-E6-S2-2
- **Tasks**: T005 (d), T011, T013
- **Files**: `web/src/screens/data-health/stop-following-dialog.tsx` l.72–79 (`setFailure(null)` in the opener `useLayoutEffect`) and l.133 (`setFailure(null)` in `onOpenChange`); `web/src/screens/data-health/stop-following-dialog.test.tsx` T005 (d) "reopening clears the refusal"
- **Claim challenged**: T011 says the refusal is "reset to `null` whenever `symbol` changes", and T005 (d) is offered as its test.
- **Observed evidence**:
  - The production code resets the refusal in two places, and each covers for the other along the only path any committed test drives (Esc, then reopen).
  - Deleting l.77 survives every committed test (reviewer mutant `rv:open-failure-not-reset`).
  - Probe P2 shows the deletion is observable through the component's public `symbol` prop. It renders the dialog for FBXX, gets an `instrument_already_retired` refusal, re-renders the caller with `symbol={null}` and then `symbol="GOOD"`, and asserts that no *Couldn't stop following* text is present. P2 passes on HEAD. With l.77 deleted, GOOD's dialog shows *Couldn't stop following FBXX: you already stopped following it.*
- **Expected evidence/behavior**: Per T011 the refusal is reset whenever `symbol` changes. The `symbol` prop is the dialog's controlled open state (DEC-0379), so a caller may change it without going through `onClose`. Per the skill (E.9), a mutant that changes behaviour the plan specifies is not equivalent, even if no caller does this yet. CAP-003-E6-S3 builds on this seam.
- **Impact**: A regression that drops the per-symbol reset would pass the suite. If a caller closes or retargets the dialog itself, for example when its rows re-read, the owner would see a refusal for one stock inside another stock's confirmation. That breaks DAC-E6-12's sentence.
- **Required remediation**: Extend T005 with a case that changes `symbol` without the `onClose` path (null and then another symbol, or directly to another symbol) after a refusal. Assert that no refusal text is present, so that deleting the reset at l.77 is killed.

### IR-003 — The design-specified `button` variants of Download now and its fixes are unpinned

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. It traces to data-health-ui §10, Component mapping: "Download now; Start the first download | `button` | `default`, one per region" and "… Try again | `button` | `outline` (links where they navigate)". It also traces to T010's markup (`variant="default"` for the action, `variant="outline"` for the refusal link and **Try again**)
- **Tasks**: T003, T008, T010
- **Files**: `web/src/screens/data-health/download-now.tsx` l.78, l.92, l.100; `web/src/screens/data-health/download-now.test.tsx` T003, T008 (a)
- **Claim challenged**: T013 says no non-equivalent mutant survives in the three production files.
- **Observed evidence**:
  - Three reviewer mutants survive the focused suite: `rv:download-variant-outline` (`default` → `outline`), `rv:refusal-link-variant-default` (`outline` → `default`) and `rv:try-again-variant-default` (`outline` → `default`).
  - T008 (a) only checks that each `data-variant` belongs to `{default, outline, ghost}`. No test reads the variant of a particular control.
  - Production is correct: all three variants match the design.
- **Expected evidence/behavior**: Each control's `data-variant` is the one the design and T010 specify. In particular, the routine action is the region's single `default`, and its refusal link and **Try again** are `outline`.
- **Impact**: A regression could render the refusal fix or **Try again** as a second primary button beside **Download now**, or demote the action itself, and the suite would still pass. No acceptance criterion depends on it, which is why this is MEDIUM rather than HIGH.
- **Required remediation**: Assert `data-variant` on **Download now** (`default`), on the refusal link (`outline`) and on **Try again** (`outline`) in `download-now.test.tsx`.

### IR-004 — T001's pre-change green run is not recorded, and the evidence header names a stale base

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001, T014
- **Files**: `docs/…/CAP-003-E6-S2-tdd-evidence.yaml` header l.2 and `cycles`
- **Claim challenged**: T001 is checked as "run `npm ci` and then `npm run test`, and record the baseline as green". The evidence header says "Base: usr/alvaro-de-jodra/CAP-003-integration-20261128T021153Z (c276899f)".
- **Observed evidence**:
  - No baseline run, count or log appears in the TDD evidence or the evidence directory.
  - The cycle-1 commit `dad1fe77` has the parent `985e532e`, the integration tip after CAP-003-E6-S1's doc sync, not `c276899f`.
  - The dependency deliverables do exist at `985e532e`, and the full suite is green at HEAD (reviewer run), so nothing hides behind the gap.
- **Expected evidence/behavior**: T001 records its baseline result, and the evidence header names the base the cycles were committed on.
- **Impact**: Evidence quality only. A later reader cannot tell from the record whether the base was green before the story began.
- **Required remediation**: Record the baseline result, or state that it was not captured, and correct the header's base to `985e532e`.

### IR-005 — **Try again** unmounts while focused, so keyboard focus falls to `body`

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. It traces to STD-UI-24 ("focus MUST be managed … on content inserted into the page")
- **Tasks**: T010
- **Files**: `web/src/screens/data-health/download-now.tsx` l.50 (`setOutcome(null)`), l.97–104
- **Claim challenged**: A keyboard owner can retry with **Try again** and keep their place.
- **Observed evidence**:
  - Activating **Try again** calls `start()`, which clears `outcome` and unmounts the focused button, so `document.activeElement` becomes `body`.
  - The markup is exactly what T010 and the CAP-003-E1-S9 / DEC-0314 convention specify. The cycle-1 code review raised the same point, and it was not adopted.
- **Expected evidence/behavior**: Focus stays somewhere meaningful after a retry, such as on **Download now**, or the design records the loss as accepted.
- **Impact**: After a retry, a keyboard or screen-reader owner restarts from the top of the page. The behaviour stays usable, so this does not block.
- **Required remediation**: Either move focus to the **Download now** button when **Try again** starts a post, or record at the design level (data-health-ui 2.7 or DEC-0314) that the convention accepts it. No change is required to pass this gate.

### IR-006 — The plan's DAC-E6-S2-3 source cross-check prints two comment lines that cite no delivered file

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S2-3 (source cross-check only)
- **Tasks**: T011, Validation Plan (Story-Specific Validation, DAC-E6-S2-3)
- **Files**: `web/src/screens/data-health/stop-following-dialog.tsx` l.71 ("Runs before the dialog moves focus…"), l.83 ("…the check runs once more then")
- **Claim challenged**: The plan says "Every line it prints must be a comment line … that cites a delivered file such as `runs.py`; no printed line may hold a string literal."
- **Observed evidence**: The grep prints five lines. Three in `copy.ts` cite `runs.py` or the `acquisition-runs` path. The two dialog lines are comments that use *runs* as a verb, which the check as written does not allow. Neither holds a string literal, and neither renders (T007 (b) passes over every state).
- **Expected evidence/behavior**: The cross-check prints only comment lines that cite a delivered file.
- **Impact**: None for the owner, because comments never render. The plan's own check simply does not pass as worded.
- **Required remediation**: Reword the two comments to avoid the term, or note the exception beside the plan's check.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded in the TDD evidence.**
  - `<output>` is used in place of `<p role="status">` for the refusal and failure sentences in both components, because biome's `useSemanticElements` rejects the latter. `<output>` has the implicit role `status`, so every planned `findByRole("status")` holds.
  - The `OTHER_409` fixture message is not `"x"`, because `"x"` is a substring of *unexpected*.
  - The fallback focus also retries on `setTimeout(0)` and ignores focus inside the closing `[role="dialog"]`, which was needed for T005 (g) and (h).
  - T005 (l)–(o) and the fresh-node assertion in (j) were added after the first mutation scoring.
  - T007 (d) for the dialog is stricter than planned.
- **Minor, harmless.**
  - `stop-following-dialog.tsx` also exports the type `StopFollowingDialogProps`, beyond the plan's "exactly `DownloadNow`, `StopFollowingDialog` and the `copy.ts` additions". It is type-only and follows the precedent of `ConfirmDialogProps`.
  - `copy.ts` adds the private `isStopRefusalCode`.
  - The S1 import line in `copy.ts` gains `ApiError`. That is the only edit to S1's lines, and the new exports need it.
- **Bookkeeping.**
  - Every task is checked. T013's check is not supported, because its own mutation condition fails (IR-001, IR-002, IR-003).
  - The story's `status` moved to `in-review` in the change set, which is the coding stage's bookkeeping.
- **Out of scope.** None. No delivered file, sibling-story file, package manifest or Python file changed.
- **Upstream note, not a finding.** The blueprint §9 sentence that DAC-E6-12 mandates verbatim names *strategies*, while data-health-ui §3 says there is "no strategy wording in M1" for the consequence line. The implementation follows the approved epic. Any conflict belongs to the designs, not to this story.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of CAP-003-E6-S2 with this report and `CAP-003-E6-S2-tasks.md`)
- **Required action**:
  - Fix the blocking findings: kill `stop-following-dialog.tsx:91:negate-boolean:1` with a null-heading focus test (IR-001), and kill the deletion of the per-symbol refusal reset at l.77 with a `symbol`-change test (IR-002).
  - Correct the TDD-evidence disposition of `:91`.
  - Address IR-003 by pinning the three `data-variant`s, and IR-004 to IR-006 as noted.
  - Rerun the focused mutation pass, then request adversarial review v2. It will use this report's `reviewed_head` `c3f99962` and `CAP-003-E6-S2-implementation-review-v1-mutation.json` as its baseline.
- **Warnings accepted downstream**: N/A
