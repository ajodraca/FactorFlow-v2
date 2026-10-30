---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-29
updated: 2026-10-29
story_id: "CAP-002-E4-S5"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-29T06:11:27Z"
reviewed_head: "8fb44bc9e31717240f00372eea486c9fcebde447"
review_base: "7b4b5f5b4b1148cb810c3364e429348fab532d9e"
reviewed_state_revision: "sha256:3aba4a55e00f4c20747288ae37c40f7261025b3eac85b27da475b2af943f7b5e"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E4-S5
    artifact_version: 1
    content_revision: sha256:802d8702842d0485687f1df970dc28b9a2a19b66c9acc29e4aba07bf1eccbdde
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-29T06:11:27Z
  source_artifacts:
    - id: CAP-002-E4-S5
      version: "1 (sha256:802d8702842d0485687f1df970dc28b9a2a19b66c9acc29e4aba07bf1eccbdde)"
    - id: CAP-002-E4-S5-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E4-S5-tdd-evidence
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
    - id: DEC-0156
      version: "upheld 2026-10-18"
    - id: DEC-0157
      version: "upheld 2026-10-18, amended E4-F14 and E4-F31"
    - id: DEC-0158
      version: "upheld 2026-10-18"
    - id: STD-UI (ui-conventions)
      version: "current on origin/main 7b4b5f5"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S5 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 4 |
| Medium findings | 3 |
| Low findings | 4 |
| Acceptance criteria | 4/6 satisfied |
| Planned tasks | 9/14 verified |
| Required validation | 8/8 passed |

This is the initial review of the story-coding commit `8fb44bc`, so every
finding has scope `initial`. Every required validation command passes when
rerun independently. The full web suite passes (871 tests in 48 files), as do
lint, format, `tsc --noEmit`, the build, the built-CSS token check of T013 and
the TDD-evidence lint (0 errors). The three cycle patches, applied in order to
the review base, reproduce HEAD's `web/src` exactly.

The verdict is CHANGES-REQUIRED for two defects in production code and two
groups of test gaps:

- **IR-001** (HIGH): **Clear filters** leaves a threshold row's uncommitted
  draft, and its field error, on screen when that row had no committed
  sentence. The URL and the request are reset correctly, but T004 and T011
  require every control back at its default. DAC-E4-S5-3 is therefore
  `PARTIAL`.
- **IR-002** (HIGH): the threshold value does not commit on `Enter`, although
  DEC-0157 (owner-upheld) and the plan's Open Gap 2 say *the threshold value
  and Find a stock commit on blur or Enter*.
- **IR-003** and **IR-004** (HIGH): 10 non-equivalent mutants survive the story's
  focused suites. They cover the re-sync of controls on back navigation, the
  swatch and field-error colour tokens, Esc with an uncommitted search, the
  active-only universe list and coded universe-list failures. No existing test
  pins any of these.

This review ran 69 mutants: 23 generated and 46 written by hand, across all four
changed production files. 55 were killed, none was stillborn and 14 survived.
Four survivors are equivalent and are dispositioned below. The other 10 are
the findings above.

Three MEDIUM findings record design-contract gaps the plan did not foresee:

- only the first page of active universes reaches *Look in*;
- `w-14` is a size literal outside the theme (STD-UI-29);
- the *Hide incomplete* checkbox is not sized to its 16 px box and 24 px target.

Four LOW findings record plan-evidence and maintainability notes.

**By severity:** CRITICAL 0 · HIGH 4 · MEDIUM 3 · LOW 4 · **total 11**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S5`, one commit ahead of `origin/main` |
| HEAD | `8fb44bc9e31717240f00372eea486c9fcebde447` ("feat(research): CAP-002-E4-S5 story-coding") |
| Review base | `origin/main` (`7b4b5f5`), resolved by `pipeline-state.py review-base --base-ref origin/main` to `7b4b5f5b4b1148cb810c3364e429348fab532d9e`, an ancestor of HEAD |
| Working tree | Clean before and after validation: no staged, unstaged or untracked non-ignored files. Validation wrote only to the ignored `node_modules/.vite/` and `src/factorflow/api/static/`. |
| Changed files reviewed | 27 (16,458 insertions, 16 deletions) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/use-research-query.ts` | added | T008; DEC-0156 |
| `web/src/screens/research/use-research-query.test.tsx` | added | T007 |
| `web/src/screens/research/threshold-sentence.tsx` | added | T010; DAC-E4-S5-1, DAC-E4-S5-4 |
| `web/src/screens/research/threshold-sentence.test.tsx` | added | T001 (TC-COMP-134), T002 (TC-COMP-137), T005 |
| `web/src/screens/research/filters-pane.tsx` | added | T011; AC-16, DAC-E4-3, DAC-E4-S5-2, DAC-E4-S5-3 |
| `web/src/screens/research/filters-pane.test.tsx` | added | T003 (TC-COMP-135), T004 (TC-COMP-136), T006 |
| `web/src/screens/research/copy.ts` | modified (+28/−1) | T009 (Open Gap 4): `FILTERS.valueThresholdFor`, `FILTERS.unavailableUniverse`, `thresholdFieldError`; `Measure` type import |
| `web/src/screens/research/copy.test.ts` | modified (+13) | T009 anchor lines |
| `docs/.../stories/CAP-002-E4-S5-tdd-evidence.yaml` | added | T014 |
| `docs/.../stories/CAP-002-E4-S5-evidence/cycle-{1,2,3}.patch` | added | T014 (`reviewed_patch`; see IR-011) |
| `docs/.../stories/CAP-002-E4-S5-evidence/{red,green}-cycle-{1,2,3}.log` | added (6) | T014 (TEST-TDD-002) |
| `docs/.../stories/CAP-002-E4-S5-evidence/mutants-cycle-{1,2,3}.json` | added (3) | T014 (TEST-TDD-005) |
| `docs/.../stories/CAP-002-E4-S5-evidence/mutation-cycle-{1,2,3}-results.json` | added (3) | T014 (TEST-TDD-006) |
| `docs/.../stories/CAP-002-E4-S5-evidence/full-suite.log` | added | T012, T013 |
| `docs/.../stories/CAP-002-E4-S5-tasks.md` | modified | Checkbox bookkeeping T001 to T014 only (word diff: 14 × `[ ]`→`[x]`) |
| `docs/.../stories/CAP-002-E4-S5.md` | modified | `status: planning` → `in-review` only |

In this table, `docs/.../` abbreviates `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/`.

No file under `web/src/app/` changed, and no delivered file other than
`copy.ts` and `copy.test.ts` changed (T012). `dependencies.yaml` already carries
`CAP-002-E4-S5: [CAP-002-E4-S1, CAP-002-E4-S2]` on `origin/main` (line 35).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `filters-pane.tsx:47-264` `FiltersPane` (Look in 181-223, three `ThresholdSentence` rows 225-235, hide-incomplete 237-251, `showLookIn=false` mode 66-68, 122, 138); `threshold-sentence.tsx:73-196` | `filters-pane.test.tsx:104` TC-COMP-135 (a)-(e), including two factors at once in (c); `:338` (d) universe-detail mode; `threshold-sentence.test.tsx:146-207` | The filter controls work across all stocks and within a universe. *Look in* is complete only up to the API's first page of 50 active universes (IR-005, MEDIUM). |
| DAC-E4-3 | PARTIAL | `use-research-query.ts:30-51`: the URL is the only state; push navigation (line 40); query memoised on the search string (line 33). Controls re-sync from the URL: `threshold-sentence.tsx:85-92`, `filters-pane.tsx:86-90` | `use-research-query.test.tsx:76` push and back; `filters-pane.test.tsx:478` (h) back navigation restores *Look in* and the checkbox only | The pane's share of this criterion (filters live in the URL and survive back navigation) is correct. Reviewer probes P3 and P4 restored a threshold value and a search correctly. But no test pins re-syncing a threshold row or *Find a stock* on back navigation: 4 non-equivalent mutants survive (IR-003, IR-004). The `match_count` heading belongs to the results host (CAP-002-E4-S9), not this pane. |
| DAC-E4-S5-1 | SATISFIED | `threshold-sentence.tsx:23-35` `validateThresholdValue` delegates to `decodeResearchQuery`, so the rule is the codec's; `:94-115` `commit`: field error, no `onCommit`, blank commits `null` only when a sentence existed | `threshold-sentence.test.tsx:37-143` TC-COMP-134 (a)-(d), the exact DEC-0157 wording, `aria-invalid`, `aria-describedby`, zero commits; `:231` codec-agreement table | The behaviour holds. The error's `--destructive` colour is not pinned by any test (IR-003). `Enter` does not validate or commit (IR-002). |
| DAC-E4-S5-2 | SATISFIED | Every change is one `setQuery` (`filters-pane.tsx:95, 103, 113, 119, 193, 244`); equal writes navigate nowhere (`use-research-query.ts:37-39`) | `filters-pane.test.tsx:104` counts exactly one probe request per change and none while typing; `:167` blanking a threshold; `:184` the pane never requests the list | Through DEC-0156's probe host |
| DAC-E4-S5-3 | PARTIAL | `filters-pane.tsx:116-125` `clearFilters`: defaults plus `sort`, `scope` kept when `showLookIn` is false, focus to *Find a stock* | `filters-pane.test.tsx:198, 227, 243` | URL, request and sort handling are correct. A threshold row with no committed sentence keeps its uncommitted text, its field error and non-default selects after **Clear filters** (probes P1, P2; IR-001). |
| DAC-E4-S5-4 | SATISFIED | `threshold-sentence.tsx:130-131, 143-182`: names read from `copy.ts`; value row verbatim; growth and momentum rows *Value threshold for {factor}* (DEC-0157) | `threshold-sentence.test.tsx:146-207` TC-COMP-137; `filters-pane.test.tsx:253` reads the pane's control names in order | The swatch's identity colour is not pinned (IR-003), but it is `aria-hidden` and outside this criterion |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `threshold-sentence.test.tsx:37-143` | (a)-(d) as specified; the `--destructive` colour was not asked for and is not pinned (IR-003) |
| T002 | complete | VERIFIED | `threshold-sentence.test.tsx:146-207` | Names, option order, placeholder, `w-14`, one `<p>`, hidden swatch. The swatch colour was not asked for and is not pinned (IR-003). `w-14` is plan-mandated (IR-006). |
| T003 | complete | VERIFIED | `filters-pane.test.tsx:104-194` | (a)-(e), call counts by `mock.calls.length` |
| T004 | complete | PARTIAL | `filters-pane.test.tsx:198-248` | "Every control is back to its default" is asserted only from a fully committed start state. An uncommitted threshold draft is not exercised, and production fails that case (IR-001). |
| T005 | complete | PARTIAL | `threshold-sentence.test.tsx:211-436` | (a)-(e) and (g) are present. (f) covers only the transitions to `undefined` and from `undefined`, so a re-sync keyed on two of the three parts survives (IR-003). |
| T006 | complete | PARTIAL | `filters-pane.test.tsx:252-552` | (a), (c), (d), (e), (g) and (i) are adequate. The following do not pin their behaviour, and their mutants survive (IR-004): (b), *active* universes; (f), Esc with an uncommitted draft; (h), back navigation of a threshold or the search; (j), a coded `ClassificationApiError`. |
| T007 | complete | VERIFIED | `use-research-query.test.tsx:49-161` | All 5 hand-written hook mutants were killed. The one-tick test asserts "full rewrite" rather than the plan's composition (IR-009). |
| T008 | complete | VERIFIED | `use-research-query.ts:1-51` | The functional `setSearchParams` form does not compose two writes in one tick under react-router 6.30 (`node_modules/react-router-dom/dist/index.js:1031`). This is documented only in the evidence (IR-009). |
| T009 | complete | VERIFIED | `copy.ts:248-253, 260-265, 268-281`; `copy.test.ts:56-59, 440, 450-457` | `FACTOR_LABELS` (`copy.ts:219`) and `UNIVERSES.invalidSymbol` (`copy.ts:489`) are reused, not duplicated, as T009 directs. `OPERATION_LABELS` and `RESOURCE_LABELS` are untouched. |
| T010 | complete | PARTIAL | `threshold-sentence.tsx:1-196` | Built as planned: draft, re-sync, codec-backed validation, copy names, inline token styles, never `disabled`. Missing: `Enter` commit, per DEC-0157 and Open Gap 2 (IR-002). |
| T011 | complete | PARTIAL | `filters-pane.tsx:1-264` | Built as planned except that **Clear filters** does not reset the threshold rows' uncommitted drafts (IR-001). Only the first universe page is read (IR-005). A valid scope reads *Unavailable universe* while the list loads (IR-008). |
| T012 | complete | VERIFIED | `npm run test`: 48 files, 871 tests pass; `git diff --stat origin/main...HEAD` | Nothing under `web/src/app/`; `render.test.tsx` (no `dangerouslySetInnerHTML`) passes |
| T013 | complete | VERIFIED | format, lint, `tsc`, test and build all exit 0; the built `index-DzA3ppzL.css` defines `--factor-value`, `--factor-growth` and `--factor-momentum` (light and dark) | Doc comments name DACs (`use-research-query.ts:17-29`, `threshold-sentence.tsx:16-22, 63-72`, `filters-pane.tsx:36-46`) |
| T014 | complete | VERIFIED | `CAP-002-E4-S5-tdd-evidence.yaml`; `check-tdd-evidence.py --require-logs`: 0 errors | Three cycles. Each `diff_sha256` equals the `shasum -a 256` of its patch, and the patches applied in order reproduce HEAD's `web/src`. See IR-011 for the self-embedded patch. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `threshold-sentence.test.tsx:37` describe block / TC-COMP-134 | WEAK | Field error on blur for 9 invalid inputs, with the exact wording, `aria-invalid`, `aria-describedby` and zero commits; valid edges commit once; blank after a committed value commits `null`; an always-blank field commits nothing. Deterministic, no timers. | The error's `--destructive` colour (classification-ui 2.5; UX 1.1 item 3) is unpinned: survivor `manual:review:ts-error-not-destructive` (IR-003) |
| `filters-pane.test.tsx:103` describe block / TC-COMP-135 | ADEQUATE | One probe request per change with exact `toListParams` objects, accumulated across five changes; none while typing; `search` string asserted | none |
| `filters-pane.test.tsx:197` describe block / TC-COMP-136 | WEAK | One request with the defaults plus the sort; `search` exact; unowned `tab` kept; controls reset from a committed state; Find a stock draft reset; absent for a sort alone | An uncommitted threshold draft is not exercised, and production fails that case (IR-001) |
| `threshold-sentence.test.tsx:146` describe block / TC-COMP-137 | WEAK | Names on all three rows, option order, placeholder, one `<p>`, hidden swatch, then name, then blanks | The swatch's per-factor token (UX 1.1 item 3; STD-UI-7) is unpinned: survivors `manual:review:ts-swatch-one-colour` and `manual:review:ts-swatch-no-colour` (IR-003). jsdom keeps the inline style (probe P6), so a test can observe it. |
| `threshold-sentence.test.tsx:211` describe block / T005 (additional) | WEAK | Codec agreement, text and decimal input, select commits, measure-invalidation error, blur-only validation, error clearing, re-sync, never disabled | (f) does not change one part of the sentence alone: survivors `ts-effect-ignores-raw` and `ts-effect-ignores-measure` (IR-003) |
| `filters-pane.test.tsx:252` describe block / T006 (additional) | WEAK | Structure and order; no typed strings; options; scope removal; universe-detail mode; Clear visibility; focus; the unlisted scope; failure without the envelope message | Survivors `fp-lists-all-lifecycles` (b), `fp-escape-keeps-draft` (f), `fp-symbol-effect-no-draft-resync` and `fp-symbol-effect-keeps-error` (h), and `fp-api-error-ignores-code` (j) (IR-004) |
| `use-research-query.test.tsx:49` describe block / T007 (additional) | ADEQUATE | Decode, write with unknown keys kept, push, back, equal write, clear keeps sort, one-tick pushes, memoised identity; all 5 hand-written hook mutants killed | none blocking (IR-009 is a plan-text note) |
| `copy.test.ts:56-59, 440, 450-457` / T009 anchors | ADEQUATE | Exact strings for `valueThresholdFor`, `thresholdFieldError` (both measures), *Unavailable universe*; forbidden-vocabulary scan over the new exports; all 4 copy mutants killed | none |

Isolation and determinism: each suite resets its `vi.fn` mocks in `beforeEach`,
uses `MemoryRouter` and `userEvent.setup()`, and makes no network or timer use.
The universe-list mock ignores its arguments. That is why the lifecycle
survivor lives (IR-004).

**Mutation run** (`scripts/mutation-run.py`, catalogue `generate` over
`7b4b5f5..HEAD` plus 46 manual mutants over all four changed production files):
69 mutants, 55 killed, 0 stillborn, 14 survived. The baseline passed on all four
workers, with the tree patch empty. Results:
`CAP-002-E4-S5-implementation-review-v1-mutation.json`.

| Survivor | Disposition | Reason (artifact that fixes or leaves it open) |
|----------|-------------|-----------------------------------------------|
| `filters-pane.tsx:82:negate-boolean:1` (cleanup `cancelled = false`) | equivalent | DEC-0156 fixes `showLookIn` per host (Research `true`, universe detail `false`), so the effect never re-runs while mounted. Its cleanup runs only on unmount, where React 18.3 discards the update. The coder's disposition is upheld. |
| `threshold-sentence.tsx:87:negate-boolean:1` and `:2` | equivalent | `ThresholdSentenceProps.value?: Sentence` (`threshold-sentence.tsx:58`) has three required fields: all three are defined or none is. The coder's disposition is upheld. |
| `manual:review:fp-lists-without-lifecycle` | equivalent | classification-api section 11 (line 839): `GET /api/universes` `lifecycle` defaults to `active` |
| `manual:review:ts-effect-ignores-raw`, `ts-effect-ignores-measure` | **not equivalent** | T010 re-syncs "keyed on the value prop's three parts, so ... back navigation reset it"; DAC-E4-3 → IR-003 |
| `manual:review:ts-swatch-one-colour`, `ts-swatch-no-colour` | **not equivalent** | UX 1.1 item 3 and Token Usage (`--factor-value`, `--factor-growth`, `--factor-momentum`; STD-UI-7); T010 → IR-003 |
| `manual:review:ts-error-not-destructive` | **not equivalent** | classification-ui 2.5 and UX 1.1 item 3: "field error in `--destructive`"; T010 → IR-003 |
| `manual:review:fp-lists-all-lifecycles` | **not equivalent** | UX 1.1 item 2 "each active universe"; DEC-0158 → IR-004 |
| `manual:review:fp-api-error-ignores-code` | **not equivalent** | T006 (j) "the S2 failure sentence"; `copy.ts:194-199` selects it "by `code` alone" → IR-004 |
| `manual:review:fp-escape-keeps-draft` | **not equivalent** | T006 (f) "`Esc` empties the field"; UX 1.1 item 1 → IR-004 |
| `manual:review:fp-symbol-effect-no-draft-resync`, `fp-symbol-effect-keeps-error` | **not equivalent** | DAC-E4-3 (search survives back navigation); T006 (h) "the controls show the earlier values"; DEC-0157 ties the error to the text kept in the field → IR-004 |

## Independent Validation

All commands ran from `repos/factorflow-v2/FactorFlow-v2` unless stated, inside
the sandbox, with no sandbox refusal.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | Context last run 1h ago; all rows PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md --stage adversarial-review` | harness root | 0 | PASS | `READY` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref origin/main` | harness root | 0 | PASS | `7b4b5f5b4b1148cb810c3364e429348fab532d9e`, an ancestor of HEAD |
| `npx vitest run src/screens/research/use-research-query.test.tsx src/screens/research/threshold-sentence.test.tsx src/screens/research/filters-pane.test.tsx src/screens/research/copy.test.ts` | component | 0 | PASS | 4 files, 396 tests |
| `npm run test` | component | 0 | PASS | 48 files, 871 tests |
| `npm run lint` | component | 0 | PASS | `biome lint .`: 112 files, no diagnostics |
| `npm run format` | component | 0 | PASS | `biome format .`, check only: 112 files, nothing to fix |
| `npx tsc --noEmit` | component | 0 | PASS | no output |
| `npm run build` | component | 0 | PASS | `vite build`, 63 modules; writes the ignored `src/factorflow/api/static/` |
| `grep -o -E -- "--factor-(value\|growth\|momentum):[^;}]*" src/factorflow/api/static/assets/index-DzA3ppzL.css` | component | 0 | PASS | Each token defined twice (light and dark): T013's gate holds |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7b4b5f5b4b1148cb810c3364e429348fab532d9e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7b4b5f5b4b1148cb810c3364e429348fab532d9e..HEAD --cycle review --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-84bf08/6c806870-c781-4087-8897-cb0f86001033/scratchpad/mutants.json`, plus 46 manual mutants | harness root | 0 | PASS | 23 generated, 69 in all |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-84bf08/6c806870-c781-4087-8897-cb0f86001033/scratchpad/mutants.json --jobs 4 --timeout 600 --command 'test -e node_modules || ln -s /Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/pipeline-factorflow-v2-cap-002-e4-84bf08/repos/factorflow-v2/FactorFlow-v2/node_modules node_modules; ./node_modules/.bin/vitest run src/screens/research/use-research-query.test.tsx src/screens/research/threshold-sentence.test.tsx src/screens/research/filters-pane.test.tsx src/screens/research/copy.test.ts' --out /private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-84bf08/6c806870-c781-4087-8897-cb0f86001033/scratchpad/mutation-results.json` | harness root | 3 | FAIL (test-quality gate) | 55 killed, 14 survived (4 equivalent, 10 not: IR-003, IR-004). Exit 3 means survivors, not an environment fault. |
| `git apply` of `cycle-1.patch`, `cycle-2.patch` and `cycle-3.patch` onto `7b4b5f5` in a scratch `--shared` clone, then `git diff --cached --stat 8fb44bc -- web/src` | scratch clone | 0 | PASS | No `web/src` difference: the reviewed diffs are the shipped code |
| Reviewer probes P1 to P8 (`vitest run` of two probe files in a scratch `--shared` clone at `8fb44bc`; nothing written to the component repository) | scratch clone | 0 | PASS (observations) | P1 and P2 confirm IR-001; P8 confirms IR-002; P3, P4 and P6 show the code correct and the gaps testable; P5 confirms IR-005; P7 confirms IR-008 |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the task plan's Validation Plan and T013: no screen mounts the pane yet, and nothing reaches it end to end |
| `npm ci` | — | N/A | NOT RUN | `package.json` and `package-lock.json` are unchanged; it would rewrite `node_modules`, which validation must not do (constraint 10) |
| `uv sync`, `uv build`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | — | N/A | NOT RUN | No Python file is in the change set, and the task plan's Validation Plan scopes validation to the web commands |

The Gate Summary counts eight required commands: the focused suites, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run build`, T013's CSS check and the TDD-evidence lint. The mutation run is the test-quality gate of step E.9, not one of the eight; its survivors are IR-003 and IR-004.

### Validation Side Effects

- Before: `usr/alvaro-de-jodra/CAP-002-E4-S5` at `8fb44bc`; `git status --porcelain --untracked-files=all` empty; code fingerprint `sha256:3aba4a55e00f4c20747288ae37c40f7261025b3eac85b27da475b2af943f7b5e`.
- After: the same HEAD, the same empty status and the same fingerprint, rechecked after the build and again after the mutation run. The build added `assets/index-DzA3ppzL.css` under the ignored `src/factorflow/api/static/`, and vitest updated the ignored `node_modules/.vite/vitest/results.json`.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | Clear filters leaves uncommitted threshold drafts and their field errors on screen |
| IR-002 | HIGH | initial | The threshold value does not commit on Enter, contrary to DEC-0157 |
| IR-003 | HIGH | initial | Threshold-sentence tests let five non-equivalent mutants survive |
| IR-004 | HIGH | initial | Filters-pane tests let five non-equivalent mutants survive |
| IR-005 | MEDIUM | initial | Look in reads only the first page of active universes |
| IR-006 | MEDIUM | initial | `w-14` introduces a size literal outside the theme (STD-UI-29) |
| IR-007 | MEDIUM | initial | The Hide incomplete checkbox is not sized to the checkbox contract's 16 px box and 24 px target |
| IR-008 | LOW | initial | A valid URL scope reads "Unavailable universe" while the list loads or after it fails |
| IR-009 | LOW | initial | T007 and T008 claim a same-tick composition the hook does not deliver |
| IR-010 | LOW | initial | `validateThresholdValue` returns the value row's wording whatever the factor |
| IR-011 | LOW | initial | `cycle-3.patch` embeds an earlier 6,922-line copy of itself |

### IR-001 — Clear filters leaves uncommitted threshold drafts and their field errors on screen

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S5-3 (and AC-16)
- **Tasks**: T004, T010, T011
- **Files**: `web/src/screens/research/filters-pane.tsx:116-125` (`clearFilters`); `web/src/screens/research/threshold-sentence.tsx:78-92` (draft state, and an effect keyed only on the `value` prop's parts); `web/src/screens/research/filters-pane.test.tsx:198-241`
- **Claim challenged**: The tdd-evidence (cycle 3) says **Clear filters** "resets every control including an uncommitted Find a stock draft".
- **Observed evidence**: `clearFilters` resets the *Find a stock* draft explicitly (lines 117-118). It relies on each `ThresholdSentence` re-syncing when its `value` prop changes (`threshold-sentence.tsx:85-92`). A row whose sentence was already `undefined` sees no prop change, so its draft and error survive. Two reviewer probes in a scratch clone at HEAD confirm this:
  - **P1**: start at `?scope=u1`, type `abc` into *Value threshold for growth*, press Tab, activate **Clear filters**. The search is `""`, but the field still holds `abc` with `aria-invalid="true"`, and the alert *Could not set the growth threshold: a percentile is a number from 0 to 100.* is still shown.
  - **P2**: start at `?symbol=AA`, set growth to *standardised score* and *at most* with a blank value, activate **Clear filters**. The growth selects still read `standardisedScore` and `atMost`.

  TC-COMP-136 starts only from a fully committed URL, so it does not exercise this case.
- **Expected evidence/behavior**: T004: "every control is back to its default (... the six threshold controls show their defaults and empty fields ...)". T011: **Clear filters** "resets every filter". UX design 1.1 item 5: "resetting all of them and the URL to the defaults". DAC-E4-S5-3: "all filters reset".
- **Impact**: Right after **Clear filters** the owner can see a field error and a half-built sentence that applies to nothing. **Clear filters** is the recovery action, and here it leaves an error on screen while every filter is off. The same stale draft persists after a back navigation that leaves the row's sentence `undefined`.
- **Required remediation**: After **Clear filters**, every threshold row must show *percentile*, *at least*, an empty field and no error, whether or not it had a committed sentence. Extend TC-COMP-136 with a case for an uncommitted draft (an invalid value with its error, and a select-only change) that fails on the current code.

### IR-002 — The threshold value does not commit on Enter, contrary to DEC-0157

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S5-1, DAC-E4-S5-2 (commit points)
- **Tasks**: T010 (and T001 and T005, which test blur only)
- **Files**: `web/src/screens/research/threshold-sentence.tsx:171-182`: the value `input` has `onChange` and `onBlur` but no key handler
- **Claim challenged**: T010 is checked complete, and the evidence says DEC-0157 was applied.
- **Observed evidence**: Reviewer probe **P8** renders the value row, types `80` and presses `Enter`. `onCommit` was not called and focus stayed in the field. With `801` typed, `Enter` shows no field error; validation and the commit happen only on the following Tab. *Find a stock* does commit on `Enter` (`filters-pane.tsx:159-162`).
- **Expected evidence/behavior**: DEC-0157 (owner-upheld 2026-10-18): "selects commit on change; **the threshold value and Find a stock commit on blur or Enter**". The plan's Open Gap 2 says the same: "the value and search on blur or Enter". T010's own sentence names only "a select change and ... blur", which is narrower than the decision it cites. The decision governs.
- **Impact**: A keyboard user who types a threshold and presses `Enter` sees nothing happen. No request is made and no error appears until focus leaves the field. That departs from a binding commit point.
- **Required remediation**: `Enter` in a threshold field runs the same validation and commit as blur: a valid changed sentence commits once, an invalid value shows the field error and writes nothing, and blank behaves as on blur. A following blur with nothing changed must not commit again. Add tests for these that fail on the current code. If the owner instead wants blur-only for thresholds, DEC-0157 must say so; the coder cannot narrow it.

### IR-003 — Threshold-sentence tests let five non-equivalent mutants survive

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-3, DAC-E4-S5-1, DAC-E4-S5-4 (design tokens of AC-16's controls)
- **Tasks**: T001, T002, T005, T010
- **Files**: `web/src/screens/research/threshold-sentence.tsx:92` (effect dependencies), `:140` (swatch style), `:189` (error colour); `web/src/screens/research/threshold-sentence.test.tsx:185-207, 370-412`
- **Claim challenged**: The evidence says cycle 2's mutation score is 1.0 and that only two equivalent survivors remain.
- **Observed evidence**: Each of these mutants passes the four focused suites:
  - `ts-effect-ignores-raw` (`[measure, direction, raw]` → `[measure, direction]`) and `ts-effect-ignores-measure` (→ `[direction, raw]`). Tests (f) change all three parts at once, so a re-sync that misses a single-part change goes undetected. On the real code, probe **P3** (back from `value=90` to `value=80`) shows the field correctly reading `80`, which the mutant would leave at `90`.
  - `ts-swatch-one-colour` (every row `--factor-value`) and `ts-swatch-no-colour` (style removed). jsdom keeps `background-color: hsl(var(--factor-growth))` (probe **P6**), so the token is observable, but no test reads it.
  - `ts-error-not-destructive` (the `--destructive` style removed from the field error).
- **Expected evidence/behavior**:
  - TEST-TDD-006 and adversarial-review E.9: no non-equivalent survivor.
  - T010: re-sync "keyed on the value prop's three parts, so ... back navigation reset it"; swatch "filled by inline `style` ... per factor"; error "in `--destructive`".
  - UX 1.1 item 3 and Token Usage: per-factor swatch tokens (STD-UI-7).
  - classification-ui 2.5: field error in `--destructive`.
- **Impact**: A regression that leaves a stale threshold on screen after back navigation, paints every swatch alike, or drops the error colour would pass the suite. The first misstates the filter in effect. TC-COMP-134, TC-COMP-137 and T005 are `WEAK`.
- **Required remediation**: Strengthen the tests so all five mutants are killed:
  - a re-sync where only the value changes, and one where only the measure changes;
  - each row's swatch token;
  - the field error's `--destructive` colour.

  Then rerun `mutation-run.py` over these lines.

### IR-004 — Filters-pane tests let five non-equivalent mutants survive

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-3, AC-16
- **Tasks**: T006 (b), (f), (h), (j); T011
- **Files**: `web/src/screens/research/filters-pane.tsx:30-34` (`universesFailure`), `:70` (`listUniverses({ lifecycle: "active" })`), `:86-90` (symbol re-sync effect), `:162-164` (Esc); `web/src/screens/research/filters-pane.test.tsx:301-336, 414-427, 478-495, 512-552`
- **Claim challenged**: The evidence says cycle 3's mutation score is 1.0 with one equivalent survivor.
- **Observed evidence**: Each of these mutants passes the four focused suites:
  - `fp-lists-all-lifecycles` (`lifecycle: "all"`): the `listUniverses` mock ignores its argument and no test asserts the call.
  - `fp-api-error-ignores-code` (always the code-less fallback): the only `ClassificationApiError` test uses `code: null`, whose sentence equals the fallback.
  - `fp-escape-keeps-draft`: the only Esc test starts with `symbol=AA` in the URL, so the URL re-sync empties the field even without the explicit `setSymbolDraft("")`.
  - `fp-symbol-effect-no-draft-resync` and `fp-symbol-effect-keeps-error`: test (h) navigates back over *Look in* and the checkbox only, never over a search. On the real code, probe **P4** (back from `MS` to `AA`) shows the field correctly reading `AA`.
- **Expected evidence/behavior**:
  - TEST-TDD-006 and E.9: no non-equivalent survivor.
  - T006 (b): "each active universe"; UX 1.1 item 2 and DEC-0158 likewise.
  - T006 (j): "the S2 failure sentence for operation and resource", which `failureSentence` selects by `code` (`copy.ts:194-199`).
  - T006 (f): "`Esc` empties the field and commits `symbol: null`".
  - T006 (h): "the controls show the earlier values"; DAC-E4-3: search survives back navigation.
  - DEC-0157: the error belongs to the text kept in the field, so it must clear when the URL replaces that text.
- **Impact**: Any of these could regress unnoticed, for example retired universes offered in *Look in*, or a typed search that Esc does not clear. T006 is `WEAK`.
- **Required remediation**: Strengthen the T006 tests so all five mutants are killed:
  - assert the `listUniverses` call argument;
  - render a failure whose code has its own sentence (for example `validation_error`);
  - press Esc on an uncommitted draft with no `symbol` in the URL;
  - navigate back over a search change, and over a search change with a shown field error.

  Then rerun `mutation-run.py` over these lines.

### IR-005 — Look in reads only the first page of active universes

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (filter within a single universe)
- **Tasks**: T011
- **Files**: `web/src/screens/research/filters-pane.tsx:65-84`: one `listUniverses` call; `nextCursor` is ignored
- **Claim challenged**: T011: *Look in* lists the active universes. The evidence carries the gap only as a LOW "follow-up" (cycle 3), with no decision record or tracked item.
- **Observed evidence**: `GET /api/universes` pages at `limit` default 50, max 500 (classification-api line 839), and returns `next_cursor`. Reviewer probe **P5** mocks a first page with `nextCursor: "c1"`, `activeCount: 3` and a URL scope `u3`. It shows exactly one call (`[{"lifecycle":"active"}]`), the options *All followed stocks, Tech, Dividend growers, Unavailable universe*, and the name *Look in: Unavailable universe*.
- **Expected evidence/behavior**: UX 1.1 item 2 and classification-ui 2.5 say the options are "each active universe". UX 1.3 says "the universe count has no committed volume", so nothing caps the count at one page.
- **Impact**: With more than 50 active universes, the rest cannot be chosen in *Look in*. A shared link to one of them reads *Unavailable universe* although it exists and the request filters by it. That misstates the filter in effect, the outcome DEC-0158 exists to prevent. AC-16's within-universe filtering stays reachable through universe detail (CAP-002-E1-S8). This scalability limit is surfaced here for the owner's assessment (AGT-SPEC-002); the reviewer does not accept the risk.
- **Required remediation**: Either list every active universe, by following `nextCursor` or by another means the owner chooses, with a test over two pages; or record the owner's decision to accept the limit, citing it in the plan.

### IR-006 — `w-14` introduces a size literal outside the theme (STD-UI-29)

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T002, T010
- **Files**: `web/src/screens/research/threshold-sentence.tsx:181` (`w-14`); `web/src/screens/research/threshold-sentence.test.tsx:182` asserts it
- **Claim challenged**: The evidence's cycle-2 code review raised this as MEDIUM and "carried [it] as a follow-up, not changed". No decision record or plan note captures it.
- **Observed evidence**: `tailwind.config.js` extends spacing only for 1 to 8, each a `var(--space-N)`. `w-14` therefore falls back to Tailwind's default `3.5rem` (the built CSS has `.w-14{width:3.5rem}`). No delivered file on `origin/main` uses a spacing step outside the token scale (`git grep` over `web/src`).
- **Expected evidence/behavior**: STD-UI-29 (`docs/constitution/standards/ui-conventions.md:579-592`): "No spacing, size or colour literal appears outside the theme ... It MAY NOT introduce a value." The design asks for 56 px, and the plan mandated `w-14`. The value is right, but no theme token carries it.
- **Impact**: This is the first non-token size in `web/src`. The width is now outside the density tokens, so it will not follow a density-tier change.
- **Required remediation**: Surface the conflict between the plan, the design and STD-UI-29 for an owner decision, recorded under `docs/decision-records.md`. Supplying a token touches `theme.css` or `tailwind.config.js`, outside DEC-0084's edit set. Until then, do not assert the literal class as the contract.

### IR-007 — The Hide incomplete checkbox is not sized to the checkbox contract's 16 px box and 24 px target

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (the filter controls)
- **Tasks**: T011
- **Files**: `web/src/screens/research/filters-pane.tsx:238-247`
- **Claim challenged**: T011 says the pane renders the `checkbox` `default` *Hide stocks with an incomplete score*.
- **Observed evidence**: The native `<input type="checkbox">` has no class or style. Its label is `flex items-center gap-2 text-sm`. `--control-min-target` (`design-system/theme.css:238`, 24 px) is referenced by no changed file. The box therefore renders at the user agent's default size, and no rule gives it or its label a 24 px minimum.
- **Expected evidence/behavior**: Two sources set the size:
  - `design-system/components/checkbox/design-spec.md` sections 3 and 5: "16 px box (target at least 24 px)" and "target at least 24×24 CSS pixels";
  - UX 1.1 Accessibility: "Checkboxes and sort controls are at least 24 by 24 CSS pixels (`--control-min-target`)".
- **Impact**: Nothing in the change makes the pane's only checkbox meet the design's target-size contract (WCAG 2.5.8) for pointer and touch users. The reviewer did not measure the rendered size, because no screen mounts the pane yet.
- **Required remediation**: Size the box and its hit target from the theme tokens, using the plan's inline `var(--token)` mechanism if no utility maps them. Add a test asserting the token is applied.

### IR-008 — A valid URL scope reads "Unavailable universe" while the list loads or after it fails

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `web/src/screens/research/filters-pane.tsx:127-133, 210`
- **Claim challenged**: T011: "Loading `listUniverses` shows the select with *All followed stocks* only". DEC-0158: "the pane does not clear the scope or judge it".
- **Observed evidence**: Reviewer probe **P7** keeps `listUniverses` pending with `?scope=u1`. The options are *All followed stocks* and *Unavailable universe*, and the name is *Look in: Unavailable universe*. The same label stays after a failed list. The coder noted this as a LOW follow-up in the evidence.
- **Expected evidence/behavior**: DEC-0158 reserves *Unavailable universe* for a scope that names "a retired or unknown universe". A scope not yet checked is neither.
- **Impact**: For the length of the request, a valid universe reads *Unavailable*. After a failed list the label stays, which can mislead.
- **Required remediation**: Do not label a scope *Unavailable* before the list confirms it is absent. The wording for "not yet known" needs a recorded decision if no artifact supplies it.

### IR-009 — T007 and T008 claim a same-tick composition the hook does not deliver

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-3
- **Tasks**: T007, T008
- **Files**: `web/src/screens/research/use-research-query.ts:17-23, 40`; `web/src/screens/research/use-research-query.test.tsx:126-147`
- **Claim challenged**: Two tasks are checked complete with claims the hook does not meet:
  - T007: two `setQuery` calls in one tick "each apply to the latest URL, not to a stale snapshot";
  - T008: "the functional form so two writes in a tick compose".
- **Observed evidence**: react-router 6.30's `setSearchParams` calls the updater with the render's `searchParams` (`node_modules/react-router-dom/dist/index.js:1031`). A second write in the same tick therefore starts from the stale snapshot, and because hosts pass whole queries built from `query`, the first write's change is lost unless the second repeats it. The test was retitled to "each a full rewrite", with a comment stating the limitation. The tdd-evidence cycle 1 records this, but the task plan and the hook's doc comment ("writes `applyResearchQuery` over the current params") do not. Production `main.tsx` also enables `v7_startTransition`, which can delay the re-render between two events.
- **Expected evidence/behavior**: Plan deviations are recorded where the plan's readers will see them. Hosts (CAP-002-E4-S9, CAP-002-E1-S8) rely on the hook's doc comment.
- **Impact**: No defect in this pane: each of its writes is a full query built from a fresh render. A host that writes twice in one tick would lose the first write without warning.
- **Required remediation**: Record the deviation in the plan's Notes, and state the limitation in the hook's doc comment for hosts.

### IR-010 — `validateThresholdValue` returns the value row's wording whatever the factor

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010
- **Files**: `web/src/screens/research/threshold-sentence.tsx:23-35, 95-96`; `web/src/screens/research/threshold-sentence.test.tsx:248-251`
- **Claim challenged**: The function is documented as "The field error for `raw` under `measure`", and its test is titled "an invalid value's error names the factor and the measure's rule".
- **Observed evidence**: The function takes no factor and always returns `thresholdFieldError("value", measure)`. The component discards that text and recomputes it with the row's factor (line 96).
- **Expected evidence/behavior**: An exported function's result should be correct for every caller. T010 describes `validateThresholdValue(measure, raw): string | null` as the error.
- **Impact**: A later importer would show *the value threshold* on the growth or momentum row. This is a maintainability trap only; no behaviour is wrong today.
- **Required remediation**: Make the exported contract truthful: either return a validity verdict, or take the factor.

### IR-011 — `cycle-3.patch` embeds an earlier 6,922-line copy of itself

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014
- **Files**: `docs/.../CAP-002-E4-S5-evidence/cycle-3.patch`, lines 1923-8850 (a `new file` diff of `cycle-3.patch`, blob `f744876`)
- **Claim challenged**: The evidence header says each `reviewed_patch` is that cycle's own staged diff.
- **Observed evidence**: The patch adds a stale earlier version of itself, which makes up about two thirds of its 10,417 lines. Its `diff_sha256` still matches, and the code it carries is correct: the patches applied in order reproduce HEAD.
- **Expected evidence/behavior**: TEST-TDD-008: `diff_sha256` fingerprints "the cycle's staged diff that those reviews judged". The per-task reviews judged a diff padded with this artefact.
- **Impact**: About 7,000 lines of repository bloat, and noise for any reviewer reading the reviewed patch.
- **Required remediation**: Do not stage a cycle's own patch file when generating it. The coder decides whether to regenerate this one; it is not required for the gate.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviations.**
  - `validateThresholdValue` delegates to S2's `decodeResearchQuery` instead of duplicating the regex. T010 anticipated this ("if S2 exports its own validator ... import it"). The codec's validity therefore governs: percentile `+50` and `-0` are valid, as S2's DEC-0148 rule makes them. T005 (a) pins the agreement.
  - The symbol error reuses `UNIVERSES.invalidSymbol` (`copy.ts:489`), and the factor names reuse `FACTOR_LABELS` (`copy.ts:219`), as T009 directs, so no second key exists.
  - `ResearchQueryBinding` is an exported interface naming the hook's return shape; the cycle-1 spec-drift review accepted it.
- **Bookkeeping.** All of T001 to T014 are checked. T004, T005, T006, T010 and T011 are checked but only partly evidenced (IR-001 to IR-004). Nothing is implemented but left unchecked.
- **Out-of-scope changes.** None. Every changed file traces to a task, and no delivered file other than `copy.ts` and `copy.test.ts` (T009) changed.
- **Not raised.**
  - SA-FUNC-003 (30-line functions) is not raised against the `FiltersPane` and `ThresholdSentence` components: delivered React components on `origin/main` (for example `HistoryDepthForm`, `web/src/screens/settings/history-depth-form.tsx:15`) set the same precedent, and earlier reviews in this epic did not apply the limit to JSX components.
  - The input `numeric` contract's arrow-key stepping is not raised: no artifact defines an increment for thresholds, and plan Resolved Conflict 2 settles the input type.
- **Evidence method.** The reviewer probes ran only in a scratch `git clone --shared` at HEAD, outside the component repository. The reviewer wrote no test and no code into the reviewed repository.

## Follow-Up

- **Next agent**: Coding Agent (story-coding rework)
- **Required action**: Resolve IR-001 to IR-004 with failing-first tests and the
  production changes they require. Each rework cycle needs a tdd-evidence entry
  and a mutation run over the changed lines. Then rerun this review, which
  will use this report and
  `CAP-002-E4-S5-implementation-review-v1-mutation.json` as its baseline.
  IR-005 and IR-006 each need an owner decision, or a recorded provisional one,
  before or during rework. IR-007 to IR-011 should be addressed in the same
  rework where they are cheap.
- **Warnings accepted downstream**: N/A
