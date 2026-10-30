---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E4-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-29T03:14:17Z"
reviewed_head: "5a60f3a644921fabfdeadecbac13a348a11a3d92"
review_base: "7b4b5f5b4b1148cb810c3364e429348fab532d9e"
reviewed_state_revision: "sha256:5135e681174a5c639dd4770d2350629b79e9bb8ea0253110418b327ae8a5fe46"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-002-E4-S3
    artifact_version: 1
    content_revision: sha256:90c9165790454fa8497460289ae31476788d6599c525c1aa26f1bf4c1b1c4527
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-29T03:14:17Z
  source_artifacts:
    - id: CAP-002-E4-S3
      version: "1 (sha256:90c9165790454fa8497460289ae31476788d6599c525c1aa26f1bf4c1b1c4527)"
    - id: CAP-002-E4-S3-tasks
      version: "1 (updated 2026-10-28, last_reworked_review v1)"
    - id: CAP-002-E4-S3-tdd-evidence
      version: "cycle-1 to cycle-3"
    - id: CAP-002-E4-S3-implementation-review
      version: "1 (baseline, reviewed_head 1f69e694f637ca1f38bacd54d0cd6ce708fe6650)"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-classification-ui-tests
      version: "1"
    - id: STD-UI (ui-conventions)
      version: "6"
    - id: DEC-0075, DEC-0084, DEC-0150, DEC-0151, DEC-0152, DEC-0229, DEC-0230, DEC-0231
      version: "as recorded in projects/factorflow-v2/decisions"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 14/14 verified |
| Required validation | 8/8 passed |

The rework commit `5a60f3a` resolves every blocking finding of v1. It adds 15
tests and makes one production change: the standardised score now carries
`font-numeric text-xs text-muted-foreground` (`factor-cell.tsx:161`), the
tokens the UX design's Token Usage table gives it (v1/IR-006). Each of the 13
non-equivalent survivors of v1 (IR-001 to IR-005) is now killed. Two of them
had to be rewritten against the new score line. All five mutants on the line
the rework changed are killed. IR-007 is now recorded for the owner as DEC-0231.
I checked DEC-0231's factual claims against `tailwind.config.js`,
`design-system/theme.css:194` and the delivered `rounded` usage in `web/src`,
and they hold. The full web suite passes (876 tests in 47 files). Lint, format,
`tsc` and the build are clean. The TDD-evidence lint reports 0 errors. The
cycle-3 patch hashes to its `diff_sha256`, and its `web/` part is identical to
`git diff 1f69e69..HEAD -- web/`.

This review ran 49 mutants. Nine survived. One is the carried
`mark-glyph-before-words`, which is equivalent. The other eight are new mutants
from this review's own reading, on lines unchanged since v1's `reviewed_head`.
Scope tags them `late`. They are non-equivalent, so they are reported as three
MEDIUM findings, but under skill step H they cannot block and do not make a test
`WEAK`:

- **IR-001.** The size idiom of the badges, the mark and the icons is pinned
  only for `text-xs` and `rounded`.
- **IR-002.** The plan's em dash on *Incomplete* and dash-in-circle on *Not
  followed* are not pinned. The signature test cannot detect two states sharing
  one shape.
- **IR-003.** The `reasonDetail` text is not shown to reach the title verbatim
  when it contains capitals.

There are two LOW findings. IR-004 carries v1/IR-008: DEC-0230 still does not
cite `ux-design.md:239-241`, although the rework evidence says it was "carried
to the owner with DEC-0230". IR-005: one new test title cites the per-report
finding ID `IR-005`.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 2 · **total 5**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S3` |
| HEAD | `5a60f3a644921fabfdeadecbac13a348a11a3d92` (three commits over the base: `1f69e69` story-coding, `9e8ca4e` review v1, `5a60f3a` story-coding rework, trailer `Decision-Id: DEC-0231`) |
| Review base | `origin/main` → `7b4b5f5b4b1148cb810c3364e429348fab532d9e` (`pipeline-state.py review-base --base-ref origin/main`; `git merge-base --is-ancestor` confirms it is an ancestor of HEAD) |
| Working tree | clean: `git status --porcelain=v1 -uall` empty before and after validation; no staged, unstaged or untracked files |
| Changed files reviewed | 25 (`git diff --name-status 7b4b5f5..HEAD`); 10 changed since the baseline (`git diff --name-status 9e8ca4e..HEAD`) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `1f69e694f637ca1f38bacd54d0cd6ce708fe6650`, with `CAP-002-E4-S3-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/restated-mark.tsx` | added (unchanged since v1) | DAC-E4-S3-3; T010 |
| `web/src/components/patterns/restated-mark.test.tsx` | added (+9 since v1) | TC-COMP-097 (mark half); T003; v1/IR-005 |
| `web/src/components/patterns/factor-cell.tsx` | added (+5 −4 since v1: doc comment, score span classes) | AC-9, AC-12, AC-14, DAC-E4-1, DAC-E4-S3-1 to -4; T011; v1/IR-006 |
| `web/src/components/patterns/factor-cell.test.tsx` | added (+86 since v1) | TC-COMP-073, -074, -097 (cell half), -109; T001, T002, T004 to T008; v1/IR-001 to IR-006 |
| `web/src/screens/research/copy.ts` | modified (unchanged since v1) | T009 (DEC-0151, DEC-0152) |
| `web/src/screens/research/copy.test.ts` | modified (unchanged since v1) | T009 anchors; TC-COMP-072 scan inputs |
| `.../stories/CAP-002-E4-S3.md` | modified (status line only) | T012 (`planning` → `in-review`); content revision `sha256:90c91657…` equals the approval's `reviewed_revision` |
| `.../stories/CAP-002-E4-S3-tasks.md` | modified (14 checkboxes; since v1 only `updated` and `last_reworked_review`) | T001-T014 bookkeeping; rework marker read by `pipeline-state.py` |
| `.../stories/CAP-002-E4-S3-tdd-evidence.yaml` | added (cycle-3 appended since v1) | T014 |
| `.../stories/CAP-002-E4-S3-evidence/cycle-{1,2,3}.patch`, `red-cycle-{1,2,3}.log`, `green-cycle-{1,2,3}.log`, `full-suite.log`, `full-suite-cycle-3.log`, `mutation-cycle-{1,2,3}-results.json` | added | T014 (reviewed patches, RED/GREEN logs, mutation results) |
| `.../stories/CAP-002-E4-S3-implementation-review-v1.md`, `-v1-mutation.json` | added (commit `9e8ca4e`) | The baseline review and its mutation results (review artifacts, not implementation) |

Nothing imports the two patterns outside their own tests. A search of `web/src`
for `patterns/factor-cell` and `patterns/restated-mark` finds no hits; the tests
import `./factor-cell` and `./restated-mark`. `dependencies.yaml` is unchanged.
DEC-0229, DEC-0230 and DEC-0231 are untracked harness files in
`projects/factorflow-v2/decisions/` and are outside this component's change set.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 (display side) | SATISFIED | `factor-cell.tsx:141-167` `ScoredCell`: `formatPercentile` text in `inline-block w-5 text-right font-numeric font-semibold` (145-150); `aria-hidden` track `inline-block h-2 w-7 overflow-hidden` with the fill at `${printed}%` (151-158); the score through `formatScore` only with `showScore` (160-164, DEC-0150) | `factor-cell.test.tsx:149-181` (TC-COMP-074), `:311-406` (T006, now including box, bar sizes, order and score tokens) | The bar's size and the number's box are now pinned (`:369-382`) |
| AC-12 | SATISFIED | `factor-cell.tsx:74-96`: *Incomplete* badge titled by DEC-0151's sentence from `reasonDetail` or the generic clause per input code; no title without a cause (DEC-0229); `reasonInput` never read; never a number (`:200`) | `:117-146` (TC-COMP-073), `:409-499` (T007, prototype-named codes at `:490-498`) | IR-003: verbatim interpolation is not proven for mixed case (late) |
| AC-14 | SATISFIED | `factor-cell.tsx:98-110`, `:192-194`: *Not enough to rank* `coverage-unknown` with the hatch, no count and no title, ahead of any percentile | `:117-146`, `:522-533` (precedence over a classified percentile), `:571-588` | The header count belongs to E4-S6 (DAC-E4-1 "stated once in the header") |
| DAC-E4-1 | SATISFIED | As for AC-9, AC-12 and AC-14; this story ships the cell's part only | TC-COMP-073, T006, T007, T008 | None |
| DAC-E4-S3-1 | SATISFIED | `factor-cell.tsx:183-201`: only a `classified` cell with a non-null percentile, not `retired` and not `not_enough_stocks`, reaches a number | `:117-146` (nine unscored fixtures: no digit, sign or placeholder, no bar, exact word, variant and shape); `:503-520` | `percentile-zero-as-missing`, `retired-requires-unclassified` and three `negate-boolean` mutants are killed |
| DAC-E4-S3-2 | SATISFIED | `factor-cell.tsx:160-164`: `formatScore(cell.score)` | `:149-181`: `0.00` with `showScore`; percentile only without it; percentile `0` is scored with a `0%` fill; `+1.27` and `-0.45` | `score-zero-hidden` is killed |
| DAC-E4-S3-3 | SATISFIED | `restated-mark.tsx:21-31`: `null` on momentum; `sr-only` words from `CELL.possiblyRestated`; `aria-hidden` `R`; no role, label or title. `factor-cell.tsx:159` places it after the bar, before the score | `restated-mark.test.tsx:22-77`; `factor-cell.test.tsx:184-225`, `:384-395` (full order) | `mark-after-score` is killed |
| DAC-E4-S3-4 | SATISFIED | Every badge has a word plus an `aria-hidden` glyph or icon (`factor-cell.tsx:92, 106, 120`); the hatch on *Not enough to rank* only (`:104`); no `gain`, `loss`, `factor-` or `neutral-value` class | `:235-308` (TC-COMP-109) | IR-002: which shape each state draws is pinned only for *Not enough to rank* (late) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `factor-cell.test.tsx:98-146` | Every listed unscored state, with and without `reasonDetail`, and `classified` with a null percentile; hidden text included in the digit scan |
| T002 | complete | VERIFIED | `factor-cell.test.tsx:149-181` | Every clause, including the scored percentile `0` and the formatter-routed signed scores |
| T003 | complete | VERIFIED | `restated-mark.test.tsx:22-77` | Accessible text, separate `aria-hidden` glyph, `sr-only`, colour pair, and now `text-xs` and `rounded` (`:50-57`); nothing on momentum; no name override, focus or variant. Padding is unpinned (IR-001, late) |
| T004 | complete | VERIFIED | `factor-cell.test.tsx:184-225`, `:384-395` | One mark after the number on value and growth; none on momentum, without the flag or on badges; full order number, bar, mark, score with both flags set |
| T005 | complete | VERIFIED | `factor-cell.test.tsx:235-308` | Words, shapes, distinct signatures, hatch placement, no polarity class, Token Usage pairs, delivered unknown shape, and now `text-xs` and `rounded` on each badge (`:299-307`). Late gaps: IR-001 (the rest of the size idiom), IR-002 (shape per state) |
| T006 | complete | VERIFIED | `factor-cell.test.tsx:311-406` | Percentile text, fill width, `aria-hidden` track, seq colours, numeric face and weight, the number's box and right alignment and the bar's size classes (`:369-382`), the order (`:384-395`), and the score's tokens (`:397-405`) |
| T007 | complete | VERIFIED | `factor-cell.test.tsx:409-499` | Exact titles for each code with a detail and without; `reasonInput` absent from `outerHTML`; no title without a cause, including for `toString`, `constructor` and `hasOwnProperty`. Late gap: IR-003 |
| T008 | complete | VERIFIED | `factor-cell.test.tsx:502-589` | Retired with a percentile; `not_enough_stocks` above a classified percentile (`:522-533`); a classified percentile scored whatever input reason it carries (`:535-548`); null and unknown reasons; Not followed titles; malformed date refused; no count; 50 cells |
| T009 | complete | VERIFIED | `copy.ts:303-318, 328-354`; `copy.test.ts:65-69, 426, 499-508` | S2's names govern; three strings added with doc comments naming DEC-0151 and DEC-0152, plus anchors; no other string; `incompleteReason`'s output unchanged |
| T010 | complete | VERIFIED | `restated-mark.tsx:1-31` | Imports React, `FactorName` and `CELL` only; no literal string; classes as T010 lists them (`rounded` per DEC-0231) |
| T011 | complete | VERIFIED | `factor-cell.tsx:1-201` | Pure, no state, effect, fetch or `dangerouslySetInnerHTML`; selection order, badge classes, icons and titles as specified; sizes per DEC-0230. Justified deviation: the score span adds `font-numeric text-xs` to T011's `text-muted-foreground` (v1/IR-006; UX design Token Usage, `ux-design.md:606, 609`) |
| T012 | complete | VERIFIED | `npm run test` 876/876 in 47 files; `git diff --name-status 7b4b5f5..HEAD` | Only the planned files, `copy.ts`/`copy.test.ts`, the status line, T014 evidence and the v1 review artifacts differ; `dependencies.yaml` unchanged; delivered tests pass unedited, `render.test.tsx` included |
| T013 | complete | VERIFIED | lint, format, `tsc`, test and build exit 0; built CSS `src/factorflow/api/static/assets/index-B2BGQX5s.css` | Each class the two components use is a rule there, including the rework's `font-numeric` and `text-xs`; `--seq-1:` and `--seq-4:` are defined twice each. The build writes to `src/factorflow/api/static/`, not `dist` as the task text says |
| T014 | complete | VERIFIED | `CAP-002-E4-S3-tdd-evidence.yaml`; `check-tdd-evidence.py --require-logs` 0 errors | Three cycles, each with `tests_executed: true`, `APPROVED`, `drift_detected: false` and `commit_hash: stage`. Cycle 3's `diff_sha256` `a19a4823…` equals the SHA-256 of `cycle-3.patch`, whose `web/` part is identical to `git diff 1f69e69..HEAD -- web/`. Its RED (`red-cycle-3.log`) is the observed failure of the IR-006 test; the 14 test-only additions are justified by v1's survivors |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `factor-cell.test.tsx` "TC-COMP-073" / TC-COMP-073 | ADEQUATE | `describe.each` over nine unscored fixtures: whole `textContent` free of digits, `NaN`, `null`, `undefined` and signs; no bar; exact word, `data-variant` and an `aria-hidden` shape; the numbers an Incomplete cell carries are never read | none |
| `factor-cell.test.tsx` "TC-COMP-074" / TC-COMP-074 | ADEQUATE | Exact `0.00` beside `50`, not *Incomplete*; no score element without `showScore`; percentile `0` scored with a `0%` fill; signed values equal `formatScore` | none |
| `restated-mark.test.tsx` "TC-COMP-097" / TC-COMP-097 (mark half) | ADEQUATE | Accessible text exactly the catalogue's `Possibly restated`; `aria-hidden` `R`; `sr-only` words; status-neutral pair, `text-xs` and `rounded`; empty on momentum; no name override, focus or variant | Padding unpinned (IR-001, late, does not make the test `WEAK`) |
| `factor-cell.test.tsx` "TC-COMP-097 (cell half)" / TC-COMP-097 | ADEQUATE | One mark after the number; none on momentum, without the flag, or on badges; no explanation sentence; full order with the score (`:384-395`) | none |
| `factor-cell.test.tsx` "TC-COMP-109" / TC-COMP-109 | ADEQUATE | Words; shape presence; four distinct signatures; hatch only on *Not enough to rank*; no polarity or identity class; Token Usage pairs; delivered unknown shape; `text-xs` and `rounded` on the three badges | Late: IR-001 and IR-002 |
| `factor-cell.test.tsx` "the scored cell" (T006) | ADEQUATE | Percentile text and fill width; `aria-hidden` track; seq colours inline; numeric face and weight; `inline-block w-5 text-right` box; `inline-block h-2 w-7 overflow-hidden` track and `block h-full` fill; full DOM order; score `font-numeric text-xs text-muted-foreground` only when asked and present | none |
| `factor-cell.test.tsx` "the Incomplete cell's reason" (T007) | ADEQUATE | Exact titles for each code with and without detail; `reasonInput` absent from `outerHTML`; no title without a cause for `null`, `"not_a_reason"`, `toString`, `constructor`, `hasOwnProperty` | Late: IR-003 |
| `factor-cell.test.tsx` "state selection" (T008) | ADEQUATE | Each rung of DEC-0151's order: retired over a percentile, `not_enough_stocks` over a classified percentile, a classified percentile over any input reason, null and unknown reasons to *Incomplete*; Not followed titles; malformed date; no count; 50 cells | none |
| `copy.test.ts` T009 anchors and TC-COMP-072 scan | ADEQUATE | Exact sentences for `incompleteDetail` and `incompleteGeneric`; `notFollowedNoDate` in the verbatim list; new functions in the vocabulary scan | none |

All four mandatory TCs carry `// Implements TC-COMP-0xx` comments
(`factor-cell.test.tsx:116, 148, 183, 234`; `restated-mark.test.tsx:21`). The
tests are pure: no network, no timers, no environment. Fixtures are plain
`FactorCell` objects. No mock stands in for the unit under test. The 15 tests
the rework added assert observable attributes, class tokens and DOM order of
the rendered unit, and no assertion restates the implementation. Fourteen of
them passed against unchanged production. That is expected: they characterise
behaviour that already exists. Their RED is the v1 survivors they kill, and
this review's run confirms that every one of those mutants is now killed. The
fifteenth, the IR-006 score-token test, was observed failing before the class
change (`red-cycle-3.log`: "1 failed | 400 passed (401)").

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/components/patterns/factor-cell.test.tsx web/src/components/patterns/restated-mark.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 401 tests (90 + 8 + 303). React logs the expected `RangeError` from the malformed-date test |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 47 files, 876 tests passed; delivered tests and `render.test.tsx` included |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 110 files in 36ms. No fixes applied." |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 110 files in 24ms. No fixes applied." (check only) |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No diagnostics |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules; ignored `src/factorflow/api/static/` rebuilt with unchanged hashes (`index-B2BGQX5s.css`, `index-CsjgWT4O.js`) |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7b4b5f5b4b1148cb810c3364e429348fab532d9e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | "0 error(s), 0 warning(s)" |
| Mutation run: `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7b4b5f5b4b1148cb810c3364e429348fab532d9e..HEAD --cycle review --out $SCRATCHPAD/v2/mut/generated.json`; 17 reviewer mutants (`"operator": "manual"`) appended; `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCHPAD/v2/mut/mutants-pre-scope.json --since 1f69e694f637ca1f38bacd54d0cd6ce708fe6650 --previous <stories>/CAP-002-E4-S3-implementation-review-v1-mutation.json --out $SCRATCHPAD/v2/mut/mutants.json`; `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCHPAD/v2/mut/mutants.json --jobs 6 --command 'test -e node_modules \|\| ln -s $COMPONENT/node_modules node_modules; ./node_modules/.bin/vitest run src/components/patterns/factor-cell.test.tsx src/components/patterns/restated-mark.test.tsx src/screens/research/copy.test.ts' --out $SCRATCHPAD/v2/mut/results.json --logs $SCRATCHPAD/v2/mut/logs --work-root $SCRATCHPAD/v2/mut/work` | harness root | 3 (runner exits 3 on any survivor) | PASS (E.9 as scoped by H) | 49 mutants (29 carried, 5 delta, 15 late): 40 killed, 9 survived, 0 stillborn; all 6 baselines exit 0. Every carried and delta mutant is killed except the equivalent carried `mark-glyph-before-words`. The 8 other survivors are `late` (IR-001 to IR-003). Results: `CAP-002-E4-S3-implementation-review-v2-mutation.json` (sha256 `8f74ddee…`) |
| Built-CSS class and token check (Python substring search of `src/factorflow/api/static/assets/index-B2BGQX5s.css`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | T013 evidence. All 29 utility classes in the two components' `className` strings and constants are rules, among them `.font-numeric{font-family:var(--font-numeric)}`, `.text-xs{font-size:var(--text-xs)}`, `.w-5`, `.w-7`, `.h-2`, `.h-3`, `.w-3`, `.h-full`, `.text-right`, `.rounded{border-radius:.25rem}` and `.sr-only`; `--seq-1:` and `--seq-4:` occur twice each |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the task plan's Validation Plan ("no screen exists"). `tech-stack.md` records that the Playwright suite has no specs yet. No route or screen imports the patterns |
| `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv build` | — | N/A | NOT RUN | Not applicable: the change set touches no Python source, test or configuration |

`$SCRATCHPAD` stands for
`/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-84bf08/6c806870-c781-4087-8897-cb0f86001033/scratchpad`.
`$COMPONENT` is the absolute path of `repos/factorflow-v2/FactorFlow-v2` in the
harness worktree. `<stories>` is the story directory of this report. All
commands ran inside the sandbox; none needed to leave it.

**Mutation detail.** The catalogue yields 4 `negate-boolean` mutants on
`factor-cell.tsx` (lines 65, 160, 186, 195), all killed. Three of them are the
baseline's line-159/185/194 mutants, moved down one line by the doc comment;
`scope` tags the copies `late` and carries the originals. `scope` adds the
baseline's 31 mutants. Of these, 29 still apply and are `carried`. Two no longer
apply, because their `old` text held the score span's former
`className="text-muted-foreground"`: `manual:review:mark-after-score` and
`manual:review:score-before-bar`. This review re-wrote both against the current
line as `manual:review-v2:mark-after-score` and
`manual:review-v2:score-before-bar` (`delta`). Both are killed. The three
rework-line mutants (`score-font-numeric-dropped`, `score-text-xs-dropped`,
`score-muted-dropped`, all `delta`) are killed. This review's own reading added
12 `late` mutants. Four are killed: `fill-width-raw-percentile`,
`retired-requires-unclassified`, `incomplete-title-empty` and
`mark-sr-only-hidden`. Eight survive:

| Survivor | Scope | File | Change | Disposition |
|----------|-------|------|--------|-------------|
| `manual:review:mark-glyph-before-words` | carried | `restated-mark.tsx:27-28` | glyph before the `sr-only` words | **equivalent**. DEC-0075 draws the glyph "beside" the words and fixes no order. An `sr-only` child is absolutely positioned and takes no part in the inline-flex layout, and assistive technology reads only the words. This is v1's disposition and the coder's (cycle 3), re-derived here |
| `manual:review-v2:badge-padding-dropped` | late | `factor-cell.tsx:12` | `px-2 py-1` dropped from `BADGE` | non-equivalent: T011 "the shared size classes of `coverage/badges.tsx` (`inline-flex items-center gap-1 rounded px-2 py-1 text-xs`)" (IR-001) |
| `manual:review-v2:badge-gap-dropped` | late | `factor-cell.tsx:12` | `gap-1` dropped | non-equivalent: same T011 class list (IR-001) |
| `manual:review-v2:badge-inline-flex-dropped` | late | `factor-cell.tsx:12` | `inline-flex` dropped | non-equivalent: same T011 class list (IR-001) |
| `manual:review-v2:mark-padding-dropped` | late | `restated-mark.tsx:7` | `px-2 py-1` dropped from `MARK_CLASSES` | non-equivalent: T010 "the delivered badge size classes `px-2 py-1` or the compact equivalent"; no padding is neither (IR-001) |
| `manual:review-v2:icon-size-dropped` | late | `factor-cell.tsx:34` | `h-3 w-3` dropped from the SVG | non-equivalent: T011 "Copy the icon and size idiom of `web/src/screens/coverage/badges.tsx`", whose `Icon` is `h-3 w-3 shrink-0` (IR-001) |
| `manual:review-v2:incomplete-glyph-question` | late | `factor-cell.tsx:92` | the em dash replaced by `<QuestionIcon />` | non-equivalent: T011 "Incomplete `coverage-absent` (… em dash glyph …)", the delivered absent shape (`coverage/badges.tsx`, "Absent uses the em dash as its shape") (IR-002) |
| `manual:review-v2:not-followed-circle-dropped` | late | `factor-cell.tsx:58` | the circle removed from the Not followed icon | non-equivalent: T011 "a dash-in-circle icon"; what is left is a bare dash, like Incomplete's (IR-002) |
| `manual:review-v2:detail-lowercased` | late | `factor-cell.tsx:76` | `reasonDetail.toLowerCase()` passed to `incompleteDetail` | non-equivalent: DEC-0151's sentence interpolates `{reasonDetail}` as sent. The plan's Risk note says T007 pins "`reasonDetail` verbatim" (IR-003) |

### Validation Side Effects

- Before: HEAD `5a60f3a644921fabfdeadecbac13a348a11a3d92`;
  `git status --porcelain=v1 -uall` empty;
  `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2`
  (harness root) gave
  `sha256:5135e681174a5c639dd4770d2350629b79e9bb8ea0253110418b327ae8a5fe46`.
  Ignored build output was already present in `src/factorflow/api/static/`.
- After: HEAD unchanged, porcelain status still empty before this report was
  written, and `code-revision` still
  `sha256:5135e681174a5c639dd4770d2350629b79e9bb8ea0253110418b327ae8a5fe46`.
  `npm run test` (its build-output test) and `npm run build` rewrote the
  ignored static files with the same hashes. The mutants ran in clones under
  `$SCRATCHPAD/v2/mut/work`.
- Unexpected tracked-file changes: none. This review adds only this report and
  `CAP-002-E4-S3-implementation-review-v2-mutation.json`, both under `docs/`,
  which the fingerprint excludes.

## Code Quality Review

The production delta since v1 is one class string and its doc comment
(`factor-cell.tsx:133-140, 161`). The class string uses existing theme-mapped
utilities, introduces no literal (STD-UI-29), and the doc comment cites its
source. The full files were re-read against the constitutions:

- `FactorCell` is a pure function of its props. It has no state, no effect, no
  `dangerouslySetInnerHTML` and no string literal shown to the owner outside
  `copy.ts` (STD-UI-1).
- `Object.hasOwn` guards the reason-code lookup, and the test now holds it
  there.
- No function exceeds the SA-FUNC limits. `FactorCell` has 4 branches and
  `ScoredCell` takes one props object.
- There is no dead code, no TODO marker and no unused import (`biome lint`
  clean). Types are strict (`tsc` clean).
- `copy.ts` routes every Incomplete sentence through one builder, as DEC-0151
  requires.

The duplicated `Icon`, `QuestionIcon` and `BADGE` remain the copy T011 directs,
because CAP-001's `coverage/badges.tsx` lies outside CAP-002's edit set
(DEC-0084). The 15 new tests follow the file's existing helpers (`label`, `bar`,
`fill`, `mark`, `scoreElement`) and idiom. One test title cites a per-report
finding ID (IR-005).

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | late | The badge, mark and icon size idiom is pinned only for `text-xs` and `rounded` |
| IR-002 | MEDIUM | late | Incomplete's em dash and Not followed's dash-in-circle are not pinned, and the signature test cannot catch a shared shape |
| IR-003 | MEDIUM | late | `reasonDetail` is not shown to reach the title verbatim when it has capitals |
| IR-004 | LOW | carried | v1/IR-008 is still open: DEC-0230 does not cite the UX design's ruling on the 22 px and 52 px widths |
| IR-005 | LOW | delta | A new test title cites the per-report finding ID `IR-005` |

### IR-001 — The badge, mark and icon size idiom is pinned only for `text-xs` and `rounded`

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S3-3, DAC-E4-S3-4 (satisfied in production)
- **Tasks**: T003, T005 (classes specified by T010 and T011)
- **Files**: `web/src/components/patterns/factor-cell.tsx:12` (`BADGE`), `:32-38` (`Icon`, `h-3 w-3 shrink-0`); `web/src/components/patterns/restated-mark.tsx:6-7` (`MARK_CLASSES`); `web/src/components/patterns/factor-cell.test.tsx:299-307`; `web/src/components/patterns/restated-mark.test.tsx:50-57`
- **Claim challenged**: T011 gives the three badges "the shared size classes of `coverage/badges.tsx` (`inline-flex items-center gap-1 rounded px-2 py-1 text-xs`)". It also says to copy that file's "icon and size idiom", whose `Icon` is `h-3 w-3 shrink-0`. T010 gives the mark "the delivered badge size classes `px-2 py-1` or the compact equivalent".
- **Observed evidence**: Five reviewer mutants survive the focused suites. `badge-padding-dropped`, `badge-gap-dropped` and `badge-inline-flex-dropped` each remove one part of `BADGE`. `mark-padding-dropped` removes the mark's padding. `icon-size-dropped` leaves the SVG with only `viewBox` and `shrink-0`, so no rule in the built CSS gives it a size. The rework's tests assert only `text-xs` and `rounded` on the badges and the mark (v1/IR-005), and no test reads the icon's classes. All five lines are unchanged since v1's `reviewed_head`, so the five mutants are `late`.
- **Expected evidence/behavior**: A test fails when a badge or the mark loses a class of the size idiom the plan prescribes, or when an icon loses its `h-3 w-3` box.
- **Impact**: Without its size classes, an icon falls back to the browser's default size for an SVG. That is the largest of the five regressions: the *Not enough to rank* and *Not followed* icons would no longer sit at the 0.75 rem of the delivered badges in every factor cell, and no test would fail. Padding and gap losses are smaller, cosmetic changes to badges that five later stories inherit. Late scope, so non-blocking under skill step H.
- **Required remediation**: Assert the remaining size classes on the three badges and the mark, and `h-3 w-3` on the badge icons, so that the five mutants are killed. Production needs no change.

### IR-002 — Incomplete's em dash and Not followed's dash-in-circle are not pinned, and the signature test cannot catch a shared shape

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S3-4 (satisfied in production)
- **Tasks**: T005 (shapes specified by T011)
- **Files**: `web/src/components/patterns/factor-cell.tsx:54-62` (`NotFollowedIcon`), `:92` (Incomplete glyph); `web/src/components/patterns/factor-cell.test.tsx:52-64` (`signature`), `:242-258`
- **Claim challenged**: T011 draws *Incomplete* with the em dash glyph, the delivered `coverage-absent` shape, and *Not followed* with "a dash-in-circle icon". T005 says the four word-plus-shape signatures are pairwise distinct "so the states survive greyscale".
- **Observed evidence**: Two mutants survive. `incomplete-glyph-question` gives *Incomplete* the *Not enough to rank* question icon. `not-followed-circle-dropped` reduces *Not followed* to a bare dash, the same shape as *Incomplete*. `signature()` joins the label and the shape, and every state has a different label. So "pairwise distinct" holds even when two states share one shape, and only *Not enough to rank* is compared with a delivered shape (`:247-258`).
- **Expected evidence/behavior**: A test fails when *Incomplete* stops drawing the em dash, the delivered absent shape, or *Not followed* stops drawing its dash in a circle. For example, compare the shapes alone, without the words, across the four states.
- **Impact**: STD-UI-8 needs a word plus a shape for each state, and the words would remain. But the plan gives each state its own shape, and the delivered coverage badges keep the absent and unknown shapes apart (STD-UI-14). A change that drew *Incomplete* like *Not enough to rank*, or *Not followed* like *Incomplete*, would pass the suite. Late scope, so non-blocking.
- **Required remediation**: Pin the *Incomplete* em dash, for example against `PresenceBadge state="absent"` as `:247-258` already does for unknown, and the *Not followed* circle-and-line shape, so that both mutants are killed. Production needs no change.

### IR-003 — `reasonDetail` is not shown to reach the title verbatim when it has capitals

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-12 (satisfied in production)
- **Tasks**: T007
- **Files**: `web/src/components/patterns/factor-cell.tsx:74-82`; `web/src/screens/research/copy.ts:338`; `web/src/components/patterns/factor-cell.test.tsx:410-443`
- **Claim challenged**: DEC-0151, upheld by the owner, builds the title as *Incomplete: {reasonDetail}, so {factor} can't be compared fairly. It isn't guessed.*, and the task plan's Risk note says T007 pins "`reasonDetail` verbatim".
- **Observed evidence**: `detail-lowercased` passes `cell.reasonDetail.toLowerCase()` to `incompleteDetail`, and it survives. All three test details are already lower case: "operating cash flow missing", "fundamentals outdated: latest period ended 2026-03-31" and "free-cash-flow yield could not be computed". Any case-folding normalisation of the engine's text is therefore invisible to the suite.
- **Expected evidence/behavior**: At least one test uses a `reasonDetail` with capitals, such as an acronym or a proper noun, and asserts that the title carries it unchanged.
- **Impact**: The engine's owner-facing detail could lose its capitalisation ("EBITDA" read as "ebitda") in every Incomplete tooltip without a failing test. Late scope, so non-blocking.
- **Required remediation**: Add a mixed-case `reasonDetail` to T007's title test so that the mutant is killed. Production needs no change.

### IR-004 — v1/IR-008 is still open: DEC-0230 does not cite the UX design's ruling on the 22 px and 52 px widths

- **Severity**: LOW
- **Scope**: carried
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `projects/factorflow-v2/decisions/DEC-0230.md` (harness, untracked); `docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-design.md:239-241`; `CAP-002-E4-S3-tdd-evidence.yaml` cycle-3 `description`
- **Claim challenged**: The cycle-3 evidence says "IR-008 needs no code change and is carried to the owner with DEC-0230". The work-item log (`projects/factorflow-v2/work-items/CAP-002-E4-S3.jsonl`) says "rework addressed IR-001..IR-008".
- **Observed evidence**: DEC-0230 was last modified at 21:20 local on 2026-10-28. That is before review v1 was written at 21:46 and before the rework. A search for `239`, `bind the layout`, `S03` and `IR-008` finds nothing in it. The task plan's Open Gaps did not change in the rework; only two frontmatter lines did. `ux-design.md:239-241` still says the 22 px and 52 px widths "are the approved specification's and bind the layout, not the theme". DEC-0230's derivation still omits that sentence.
- **Expected evidence/behavior**: Whatever the owner reads with DEC-0230 includes the UX design's own ruling, and the S03 bar's 52 × 6 px with its 3 px radius, as v1/IR-008 required.
- **Impact**: Unchanged from v1. The owner, or the blind second opinion, may uphold DEC-0230 without seeing that the approved UX design reached the opposite reading. The rendered differences are 2 px, 4 px and 2 px.
- **Required remediation**: Put `ux-design.md:239-241` and the S03 bar dimensions in front of the owner with DEC-0230: in the record's derivation, in the task plan's Open Gaps, or in the driver's end-of-run questions. Correct the evidence's claim that this was done. No code change.

### IR-005 — A new test title cites the per-report finding ID `IR-005`

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T005
- **Files**: `web/src/components/patterns/factor-cell.test.tsx:303` ("sizes the %s badge at the delivered badge size with its corners (IR-005)")
- **Claim challenged**: TEST-QUAL-002: a test traces to a requirement, acceptance criterion or invariant. The other tests the rework added cite stable IDs: DEC-0151, DEC-0229, DEC-0230, DEC-0075 and the UX design's Token Usage.
- **Observed evidence**: Finding IDs restart in each review report (skill I.6). The `IR-005` in this title meant v1's badge-size finding. In this report, IR-005 is this finding.
- **Expected evidence/behavior**: The title cites the stable source of the requirement, T011's badge size classes or DEC-0075, as its sibling in `restated-mark.test.tsx:51` does.
- **Impact**: The title points readers at the wrong finding as soon as a later report reuses the number, as this one does. Cosmetic.
- **Required remediation**: Replace `(IR-005)` with the stable reference, for example `(T011)`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `factor-cell.test.tsx:369-382` asserts `inline-block w-5 text-right` on the number, `inline-block h-2 w-7 overflow-hidden` on the track and `block h-full` on the fill; the carried mutants `bar-track-width-dropped`, `bar-track-height-dropped`, `bar-fill-height-dropped`, `number-box-width-dropped` and `number-not-right-aligned` are killed (`-v2-mutation.json`) |
| v1/IR-002 | RESOLVED | `factor-cell.test.tsx:384-395` asserts exactly four children in the order number, bar, mark, score with both flags set; `manual:review-v2:mark-after-score` and `manual:review-v2:score-before-bar`, the v1 mutants re-written against the changed score line, are killed |
| v1/IR-003 | RESOLVED | `factor-cell.test.tsx:522-533` (`not_enough_stocks` over a classified percentile) and `:535-548` (a classified percentile scored with each input reason); carried `not-enough-after-scored` and `scored-requires-null-reason` are killed |
| v1/IR-004 | RESOLVED | `factor-cell.test.tsx:490-498` (`toString`, `constructor`, `hasOwnProperty`: no title, label *Incomplete*, no "native code"); carried `hasown-to-in` is killed |
| v1/IR-005 | RESOLVED | `factor-cell.test.tsx:299-307` (`text-xs`, `rounded` on the three badges) and `restated-mark.test.tsx:50-57` (the same on the mark); carried `mark-text-xs-dropped`, `mark-rounded-dropped` and `badge-size-dropped` are killed. The rest of the size idiom is new, late IR-001 |
| v1/IR-006 | RESOLVED | `factor-cell.tsx:161` `className="font-numeric text-xs text-muted-foreground"` per `ux-design.md:606, 609`; pinned by `factor-cell.test.tsx:397-405`, whose RED was observed (`red-cycle-3.log`); delta mutants dropping each class are killed; `.font-numeric` and `.text-xs` are rules in the built CSS |
| v1/IR-007 | RESOLVED (deviation recorded) | The second remediation was taken: DEC-0231 (provisional, `owner_reviewed: false`, `blocks: [CAP-002-E4-S3]`) records keeping `rounded` and names the one-line `tailwind.config.js` fix for the owner. Its claims hold: `tailwind.config.js` maps no radius; `design-system/theme.css:194` sets `--radius: 0.5rem`; delivered badges, buttons, inputs and cards in `web/src` use `rounded`. It is recorded as a decision rather than in the task plan's Open Gaps, which serves the same purpose of surfacing it. Corners remain 0.25rem pending the owner |
| v1/IR-008 | STILL OPEN | Carried as IR-004: DEC-0230 is unchanged since before v1 and cites no `ux-design.md:239-241`; the plan's Open Gaps are unchanged |

## Scope and Plan Deviations

- **Justified: score tokens beyond T011's text.** T011 and T006 name only
  `text-muted-foreground` for the score. The code now adds `font-numeric
  text-xs`, as v1/IR-006 required, from the UX design's Token Usage table. The
  plan body was not amended; only `updated` and `last_reworked_review` changed.
  The design is the higher source, so this is recorded as a deviation and not a
  finding.
- **Justified (unchanged since v1): `copy.ts` refactor** into one
  `incompleteSentence` builder (DEC-0151). The **duplicated icons and badge size
  constant** follow T011 and DEC-0084.
- **Provisional decisions this story rests on:** DEC-0229 (no title on a
  cause-less Incomplete cell), DEC-0230 (spacing tokens for the box and bar) and
  DEC-0231 (keep `rounded`). All three are `open`, `owner_reviewed: false`,
  `blocks: [CAP-002-E4-S3]`, `propagated_after: null`. They are not approvals.
  Whether doc sync may start before their horizon is the driver's call under
  `docs/decision-records.md`. IR-004 adds context for DEC-0230.
- **Review artifacts in the change set:** v1's report and mutation results
  (commit `9e8ca4e`) sit under `docs/`. The code fingerprint excludes them.
- **Bookkeeping:** T013 says the built CSS lands in `dist`. The build writes to
  `src/factorflow/api/static/`, and the check holds there (as in v1).
- **Evidence claim not corroborated:** the cycle-3 evidence says v1/IR-008 was
  "carried to the owner with DEC-0230". The repository shows no such change
  (IR-004).
- **No out-of-scope change.** No delivered file other than `copy.ts` and
  `copy.test.ts` changed. `dependencies.yaml` is unchanged.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync` for CAP-002-E4-S3)
- **Required action**: Proceed to doc sync with the warnings below recorded,
  subject to the driver's handling of the open provisional decisions DEC-0229,
  DEC-0230 and DEC-0231, which list this story under `blocks`. For the owner:
  read DEC-0230 together with `ux-design.md:239-241` (IR-004). IR-001 to IR-003
  are test-strength warnings that a later change to these files may close; they
  need no production change.
- **Warnings accepted downstream**: IR-001, IR-002, IR-003, IR-004, IR-005
