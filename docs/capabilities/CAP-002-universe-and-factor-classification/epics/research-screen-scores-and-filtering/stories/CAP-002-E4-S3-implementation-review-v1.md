---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E4-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-29T02:46:56Z"
reviewed_head: "1f69e694f637ca1f38bacd54d0cd6ce708fe6650"
review_base: "7b4b5f5b4b1148cb810c3364e429348fab532d9e"
reviewed_state_revision: "sha256:f02f6b40c8e2e3b9e3e9a187631bdeb1308cad4b3390f8bd6fbb5b203cb8cba7"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-10-29T02:46:56Z
  source_artifacts:
    - id: CAP-002-E4-S3
      version: "1 (sha256:90c9165790454fa8497460289ae31476788d6599c525c1aa26f1bf4c1b1c4527)"
    - id: CAP-002-E4-S3-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E4-S3-tdd-evidence
      version: "cycle-1 to cycle-2"
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
    - id: DEC-0075, DEC-0150, DEC-0151, DEC-0152, DEC-0229, DEC-0230
      version: "as recorded in projects/factorflow-v2/decisions"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 5 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 8/14 verified |
| Required validation | 7/8 passed |

The production code renders every state the story and its decisions specify.
`FactorCell` picks the state in DEC-0151's order. An unscored cell holds no
digit and no sign anywhere in its text. A measured `0.00` prints through
`formatScore`. The mark reads *Possibly restated* with its glyph `aria-hidden`
and never renders on momentum. No delivered file changes except S2's
`copy.ts`/`copy.test.ts`, which T009 allows. The full web suite passes (861
tests in 47 files). Lint, format, `tsc` and build are clean, and the TDD-evidence
lint passes. The built CSS holds every class the two components use and both
`--seq-1` and `--seq-4` definitions.

The gate fails on test strength (skill step E.9). This reviewer ran 31 mutants:
4 from the catalogue and 27 written by hand. Fourteen survived. Thirteen of them
change behaviour that the story's designs, task plan or decision records specify.
The fourteenth (`mark-glyph-before-words`) is equivalent.

- **IR-001.** A scored cell whose bar is collapsed to zero width or zero height,
  or whose fill has no height, passes every test. So does a percentile without
  its fixed, right-aligned box. A headless Chromium probe of the built CSS
  confirms that the as-built bar is 48 × 8 px and that each mutant leaves no
  visible bar or no visible fill.
- **IR-002.** The order inside the scored cell (number, bar, mark, score) is not
  pinned.
- **IR-003.** DEC-0151's precedence is pinned for `retired` only.
- **IR-004.** DEC-0229's rule (an unrecognised reason code gets no title) is not
  pinned for a prototype-named code.
- **IR-005.** The size and corner classes of the mark and the badges are not
  pinned.

There is one MEDIUM finding (IR-006): the standardised score text lacks the
`--font-numeric` and `--text-xs` tokens the UX design's Token Usage table gives
it. There are two LOW findings. IR-007: `rounded` is Tailwind's 0.25rem literal,
not `--radius`. IR-008: DEC-0230's derivation does not cite the UX design's own
sentence on the 22 px and 52 px widths.

**By severity:** CRITICAL 0 · HIGH 5 · MEDIUM 1 · LOW 2 · **total 8**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S3` |
| HEAD | `1f69e694f637ca1f38bacd54d0cd6ce708fe6650` (one commit over the base: `feat(research): CAP-002-E4-S3 story-coding`) |
| Review base | `origin/main` → `7b4b5f5b4b1148cb810c3364e429348fab532d9e` (`pipeline-state.py review-base --base-ref origin/main`; ancestor of HEAD) |
| Working tree | clean: `git status --porcelain=v1 -uall` empty before and after validation; no staged or unstaged changes |
| Changed files reviewed | 18 (`git diff --numstat 7b4b5f5..HEAD`) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/restated-mark.tsx` | added | DAC-E4-S3-3; T010 |
| `web/src/components/patterns/restated-mark.test.tsx` | added | TC-COMP-097 (mark half); T003 |
| `web/src/components/patterns/factor-cell.tsx` | added | AC-9, AC-12, AC-14, DAC-E4-1, DAC-E4-S3-1 to -4; T011 |
| `web/src/components/patterns/factor-cell.test.tsx` | added | TC-COMP-073, -074, -097 (cell half), -109; T001, T002, T004 to T008 |
| `web/src/screens/research/copy.ts` | modified (+39 −6) | T009 (DEC-0151, DEC-0152): `incompleteDetail`, `incompleteGeneric`, `notFollowedNoDate`. The `INCOMPLETE_STATUS` constant, the `IncompleteReasonCode` type and the shared `incompleteSentence` builder (DEC-0151: "built by one function in copy.ts") are also added. `incompleteReason`'s output is unchanged (existing anchor `copy.test.ts:490-498`) |
| `web/src/screens/research/copy.test.ts` | modified (+16) | T009 anchors; TC-COMP-072 scan inputs for `CELL.incompleteGeneric` |
| `.../stories/CAP-002-E4-S3.md` | modified (status line only) | T012 (story `status: planning` → `in-review`); content revision unchanged (`sha256:90c91657…` = approval `reviewed_revision`) |
| `.../stories/CAP-002-E4-S3-tasks.md` | modified (14 checkboxes only) | T001-T014 bookkeeping |
| `.../stories/CAP-002-E4-S3-tdd-evidence.yaml` | added | T014 |
| `.../stories/CAP-002-E4-S3-evidence/{cycle-1,cycle-2}.patch`, `red-cycle-{1,2}.log`, `green-cycle-{1,2}.log`, `full-suite.log`, `mutation-cycle-{1,2}-results.json` | added | T014 (reviewed patches, RED/GREEN logs, mutation results) |

Nothing imports the two patterns outside their own tests
(`grep -rln 'patterns/factor-cell\|patterns/restated-mark' web/src`), as T012
states. The two decision records the cycle cites, DEC-0229 and DEC-0230, are in
the harness at `projects/factorflow-v2/decisions/` and are not part of this
component's change set.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 (display side) | SATISFIED | `factor-cell.tsx:140-166` `ScoredCell`: `formatPercentile` whole number in `font-numeric font-semibold` (144-149), `aria-hidden` bar filled to the printed number (150-157), the score via `formatScore` only with `showScore` (159-163, DEC-0150) | `factor-cell.test.tsx:148-181` (TC-COMP-074), `:300-358` (T006) | Bar geometry is unpinned (IR-001). Score typography is IR-006 |
| AC-12 | SATISFIED | `factor-cell.tsx:74-96`: *Incomplete* badge whose `title` is the DEC-0151 sentence from `reasonDetail` or the generic clause per input code; `reasonInput` is never read; never a number (199) | `:116-146` (TC-COMP-073), `:360-441` (T007) | The input is named through `reasonDetail` (DEC-0151, owner-upheld). The inspector carries the reason in full (E4-S7) |
| AC-14 | SATISFIED | `factor-cell.tsx:99-110`, `:191-193`: *Not enough to rank* `coverage-unknown` with the hatch, no count and no title | `:116-146`, `:485-502` (T008) | The header count is E4-S6's (DAC-E4-1 "stated once in the header") |
| DAC-E4-1 | SATISFIED | As AC-9, AC-12 and AC-14 above; this story ships only the cell's part | TC-COMP-073, T006, T007, T008 | IR-001: "a bar" is asserted to exist but not to have any size |
| DAC-E4-S3-1 | SATISFIED | `factor-cell.tsx:182-200`: only a `classified` cell with a non-null percentile reaches a number; every other state is a word, a shape and a token | `:116-146` (all seven unscored fixtures plus the classified-null case: no digit, sign or placeholder in the whole text; no bar; exact word, variant and shape; numbers carried by an Incomplete cell never read) | All related mutants are killed, including the reviewer's `percentile-zero-as-missing` |
| DAC-E4-S3-2 | SATISFIED | `factor-cell.tsx:159-163`: `formatScore(cell.score)` | `:149-180`: `0.00` with `showScore`; percentile only without it; percentile `0` is a scored cell with a `0%` fill; `+1.27` and `-0.45` | `score-zero-hidden` is killed |
| DAC-E4-S3-3 | SATISFIED | `restated-mark.tsx:21-31`: `null` on momentum; `sr-only` words from `CELL.possiblyRestated`; `aria-hidden` `R`; no role, label or title. `factor-cell.tsx:158` places it after the bar when `restatedPossible` | `restated-mark.test.tsx:21-69`; `factor-cell.test.tsx:183-225` | IR-005: the mark's `--text-xs` and corner classes are unpinned |
| DAC-E4-S3-4 | SATISFIED | Every badge has a word plus an `aria-hidden` glyph or icon (`factor-cell.tsx:92, 106, 120`). The hatch is on *Not enough to rank* only (104). No `gain`, `loss`, `factor-` or `neutral-value` class is used | `:234-298` (TC-COMP-109) | IR-001: the scored state's shape (the bar) is asserted to exist, not to be visible |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `factor-cell.test.tsx:98-146` | Every unscored state the task lists, each with and without `reasonDetail`, plus `classified` with a null percentile. Hidden text is included in the digit scan |
| T002 | complete | VERIFIED | `factor-cell.test.tsx:148-181` | Every clause, including the percentile `0` scored cell and the assertions made through `formatScore` |
| T003 | complete | PARTIAL | `restated-mark.test.tsx:21-69` | Accessible text, separate `aria-hidden` glyph, `sr-only`, the colour pair, nothing on momentum, and no role, label, title, tabindex or variant are all asserted. DEC-0075's `--text-xs` and `--radius`, which the design test row calls "the status-neutral tokens", are unpinned (IR-005) |
| T004 | complete | PARTIAL | `factor-cell.test.tsx:183-225` | One mark after the number on value and growth; none on momentum, without the flag, or on the three badges; no explanation sentence. The mark's place before the score (T011 order) is unpinned (IR-002) |
| T005 | complete | PARTIAL | `factor-cell.test.tsx:227-298` | Words, shapes, four distinct signatures, hatch placement, no polarity class, Token Usage colour pairs, and the delivered unknown shape. The scored state's shape (the bar) can collapse to zero size and the tests still pass (IR-001). The badges' `text-xs` is unpinned (IR-005) |
| T006 | complete | PARTIAL | `factor-cell.test.tsx:300-358` | `formatPercentile` text; fill width equal to the printed number; `aria-hidden` track; `--seq-4` on `--seq-1`; `font-numeric` and `font-semibold`; muted score only when asked and present; inline span without a variant. Unpinned: the fixed right-aligned box and the bar's size (IR-001), and the bar-before-score order (IR-002) |
| T007 | complete | PARTIAL | `factor-cell.test.tsx:360-441` | Title from `reasonDetail` for all three codes; generic clause per code; `reasonInput` absent from the whole `outerHTML`; no title without a cause (DEC-0229) for `null` and `"not_a_reason"`. A prototype-named code is unpinned (IR-004) |
| T008 | complete | PARTIAL | `factor-cell.test.tsx:443-503` | `retired` with a percentile → *Not followed*; null and unknown reasons → *Incomplete*; Not followed title with and without a date; a malformed date refused; *Not enough to rank* with no count or title; 50 identical cells. DEC-0151's precedence of `not_enough_stocks` over a classified percentile, and of a classified percentile over an input reason, is unpinned (IR-003) |
| T009 | complete | VERIFIED | `copy.ts:303-318, 328-354`; `copy.test.ts:65-69, 426, 499-508` | The S2 names govern (`CELL.incomplete`, `CELL.notEnoughToRank`, `CELL.notFollowed`, `CELL.possiblyRestated`). Three strings were added with doc comments naming DEC-0151 and DEC-0152, plus anchors. TC-COMP-072 scans the new entries (default representative arguments, explicit `incompleteGeneric` calls). No other string was added; `incompleteReason`'s output is unchanged |
| T010 | complete | VERIFIED | `restated-mark.tsx:1-31` | Imports React, `FactorName` and `CELL` only. No literal string. Momentum guard and doc comment as specified. Classes as T010 lists them (`rounded` vs DEC-0075's `--radius`: IR-007) |
| T011 | complete | VERIFIED | `factor-cell.tsx:1-200` | Pure, no state, effect, fetch or `dangerouslySetInnerHTML`. Selection order, badge classes, icons and titles as specified. Sizes per DEC-0230 (`w-5`, `h-2 w-7`). Deviations: the score span carries only `text-muted-foreground`, as T011 says, but not the UX design's `--font-numeric`/`--text-xs` (IR-006); no title on a cause-less Incomplete cell (DEC-0229) |
| T012 | complete | VERIFIED | `npm run test` 861/861 in 47 files; `git diff --stat` | Only the planned files, `copy.ts`/`copy.test.ts`, the status line and T014 evidence differ. `dependencies.yaml` is unchanged. Delivered tests pass unedited; `render.test.tsx` passes |
| T013 | complete | VERIFIED | lint, format, `tsc`, test, build all exit 0; built CSS `src/factorflow/api/static/assets/index-B2BGQX5s.css` | Each listed class is present as a rule, and `--seq-1:`/`--seq-4:` are each defined twice (light and dark). The build writes to `src/factorflow/api/static/`, not `dist` as the task text says; the check was made there |
| T014 | complete | VERIFIED | `CAP-002-E4-S3-tdd-evidence.yaml`; `check-tdd-evidence.py --require-logs` 0 errors | Two cycles as the plan lays out. Each has `tests_executed: true`, `APPROVED`, `drift_detected: false`, `commit_hash: stage`, RED/GREEN logs and mutation results. Each `diff_sha256` equals the SHA-256 of its `cycle-N.patch` (`0dcd848b…`, `de87ecb3…`) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `factor-cell.test.tsx` "TC-COMP-073" / TC-COMP-073 | ADEQUATE | `describe.each` over 9 unscored fixtures: whole `textContent` without digit, `NaN`, `null`, `undefined` or sign; no bar; exact visible word, `data-variant` and an `aria-hidden` shape. Plus an Incomplete cell carrying `0.0000000000` score and percentile | none |
| `factor-cell.test.tsx` "TC-COMP-074" / TC-COMP-074 | ADEQUATE | Exact `0.00`, percentile `50`, not *Incomplete*; no score element without `showScore`; percentile `0` scored with `0%` fill; signed values equal `formatScore` | none for the TC's clause |
| `restated-mark.test.tsx` "TC-COMP-097" / TC-COMP-097 (mark half) | ADEQUATE | Accessible text exactly `Possibly restated` and equal to the catalogue; `aria-hidden` `R`; `sr-only` words; `innerHTML` empty on momentum; no name override, focus or variant on any element | The TC's expected result is fully pinned. The design row's "status-neutral tokens" are covered under T003 below |
| `restated-mark.test.tsx` "carries the status-neutral tokens" (T003 tokens) | WEAK | `bg-status-neutral-muted`, `text-status-neutral` | `mark-text-xs-dropped` and `mark-rounded-dropped` survive (IR-005) |
| `factor-cell.test.tsx` "TC-COMP-097 (cell half)" / TC-COMP-097 | ADEQUATE for the TC; WEAK for T004's order | One mark following the number; none on momentum, without the flag, or on the badges; no explanation | `mark-after-score` survives (IR-002) |
| `factor-cell.test.tsx` "TC-COMP-109" / TC-COMP-109 | WEAK | Words; shape presence; four distinct signatures; hatch only on *Not enough to rank*; no polarity or factor-identity class; Token Usage colour pairs; delivered unknown shape | The scored state's shape is asserted to exist (`bar(root) ?? shape(root)`), not to have any size: `bar-track-width-dropped`, `bar-track-height-dropped` and `bar-fill-height-dropped` survive (IR-001). `badge-size-dropped` survives (IR-005) |
| `factor-cell.test.tsx` "the scored cell" (T006) | WEAK | Percentile text, fill width, `aria-hidden`, inline seq colours, numeric face and weight, muted score, inline root | `number-box-width-dropped`, `number-not-right-aligned`, the three bar mutants (IR-001) and `score-before-bar` (IR-002) survive |
| `factor-cell.test.tsx` "the Incomplete cell's reason" (T007) | WEAK | Exact titles for each code with detail and without; `reasonInput` absent from `outerHTML`; no title without a cause | `hasown-to-in` survives (IR-004) |
| `factor-cell.test.tsx` "state selection" (T008) | WEAK | Retired-with-percentile, null and unknown reasons, Not followed titles, malformed date, no count, 50 cells | `not-enough-after-scored` and `scored-requires-null-reason` survive (IR-003) |
| `copy.test.ts` T009 anchors and TC-COMP-072 scan | ADEQUATE | Exact sentences for `incompleteDetail` and `incompleteGeneric`; `notFollowedNoDate` in the verbatim list; new functions flattened into the vocabulary scan | none (`incomplete-reason-refactor-swapped` and `generic-status-not-computable-swapped` are killed) |

All four mandatory TCs carry `// Implements TC-COMP-0xx` comments
(`factor-cell.test.tsx:116, 148, 183, 234`; `restated-mark.test.tsx:21`). The
tests are pure: no network, no timers, no environment. Fixtures are plain
`FactorCell` objects built from classification-api section 2.7. No mock stands
in for the unit under test. TC-COMP-109 imports CAP-001's `PresenceBadge` to
compare shapes. That couples the test to the delivered icon on purpose, as T005
asks ("the delivered unknown shape").

The RED evidence for both cycles is an import-resolution failure ("Failed to
resolve import ./restated-mark" / "./factor-cell"; no test ran). The plan's
Phase 2 checkpoint prescribes exactly this RED for two new files, and the
coder's 59 mutants and this review's mutants then exercise the assertions. It is
accepted, with the note that such a RED proves nothing about any single
assertion.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/components/patterns/factor-cell.test.tsx web/src/components/patterns/restated-mark.test.tsx web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files, 386 tests (77 + 6 + 303). React logs the expected `RangeError` from the malformed-date test |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 47 files, 861 tests passed; delivered tests included, `render.test.tsx` included |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 110 files in 36ms. No fixes applied." |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 110 files in 22ms. No fixes applied." (check only) |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No diagnostics |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules; ignored `src/factorflow/api/static/` rebuilt (`index-B2BGQX5s.css`, `index-CsjgWT4O.js`) |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/.../stories/CAP-002-E4-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7b4b5f5b4b1148cb810c3364e429348fab532d9e --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | "0 error(s), 0 warning(s)" (ran inside the sandbox) |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7b4b5f5b4b1148cb810c3364e429348fab532d9e..HEAD --cycle review --out $SCRATCHPAD/mut/generated.json`, plus 27 reviewer mutants (`"operator": "manual"`) in `$SCRATCHPAD/mut/mutants.json`; `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCHPAD/mut/mutants.json --jobs 6 --command 'test -e node_modules \|\| ln -s $COMPONENT/node_modules node_modules; ./node_modules/.bin/vitest run src/components/patterns/factor-cell.test.tsx src/components/patterns/restated-mark.test.tsx src/screens/research/copy.test.ts' --out $SCRATCHPAD/mut/results.json --logs $SCRATCHPAD/mut/logs --work-root $SCRATCHPAD/mut/work` | harness root | 3 | FAIL | 31 mutants: 17 killed, 14 survived, 0 stillborn; all 6 baselines exit 0. 13 survivors are non-equivalent, so the E.9 gate is not met. Results: `CAP-002-E4-S3-implementation-review-v1-mutation.json` (sha256 `bbd8f0d6…`) |
| Built-CSS class and token check (Python substring search of `src/factorflow/api/static/assets/index-B2BGQX5s.css`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | T013 evidence. Every class the two components use is present as a rule; `--seq-1:`/`--seq-4:` appear twice each; `.w-5{width:var(--space-5)}` (1.5rem), `.w-7{width:var(--space-7)}` (3rem), `.h-2{height:var(--space-2)}`; `.rounded{border-radius:.25rem}` (IR-007) |
| `node $SCRATCHPAD/probe/measure.mjs $SCRATCHPAD/probe/bar.html` (Playwright Chromium from the component's `node_modules`, loading the built CSS and four bar variants) | harness root | 0 | PASS (supporting probe) | The sandbox refused Chromium ("bootstrap_check_in … Permission denied (1100)"), so it was re-run as the same plain call outside the sandbox. Output: as built, track `[48,8]`, fill `[42.2,8]` at 88%; without `w-7`, track `[0,8]`; without `h-2`, track `[48,0]`; without `h-full`, fill `[42.2,0]` |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the task plan's Validation Plan ("no screen exists"). The story's Technical Details list only the five npm/npx commands above. No route or screen imports the patterns |
| `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv build` | — | N/A | NOT RUN | Not applicable: the change set touches no Python source, test or configuration |

`$SCRATCHPAD` stands for
`/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-84bf08/6c806870-c781-4087-8897-cb0f86001033/scratchpad`.
`$COMPONENT` is the absolute path of `repos/factorflow-v2/FactorFlow-v2` in the
harness worktree.

**Mutation detail.** The catalogue yields 4 `negate-boolean` mutants on
`factor-cell.tsx`, and all are killed; it derives nothing from JSX. The
coder's cycle evidence ran 59 hand-written mutants (12 + 47), all killed. This
review wrote 27 more, avoiding repeats of the coder's set. Thirteen are killed:
`incomplete-reason-any-nonnull`, `mark-ignores-factor`,
`percentile-zero-as-missing`, `score-zero-hidden`,
`not-followed-icon-question`, `incomplete-glyph-removed`,
`not-followed-icon-removed`, `not-followed-variant-swapped`,
`detail-ignored-for-known-code`, `title-factor-fixed`, `mark-growth-hidden`,
`incomplete-reason-refactor-swapped`, `generic-status-not-computable-swapped`.

| Survivor | File | Change | Disposition |
|----------|------|--------|-------------|
| `manual:review:bar-track-width-dropped` | `factor-cell.tsx:153` | drop `w-7` from the track | non-equivalent: design 2.5 "a 52 px bar"; DEC-0230 `w-7`; DAC-E4-1 "a bar". The probe gives a 0 px track (IR-001) |
| `manual:review:bar-track-height-dropped` | `factor-cell.tsx:153` | drop `h-2` | non-equivalent: DEC-0230 `h-2`. The probe gives a 0 px high track (IR-001) |
| `manual:review:bar-fill-height-dropped` | `factor-cell.tsx:156` | drop `h-full` from the fill | non-equivalent: "filled to the percentile" (design 2.5). The probe gives a 0 px high fill (IR-001) |
| `manual:review:number-box-width-dropped` | `factor-cell.tsx:146` | drop `w-5` | non-equivalent: "right-aligned in a fixed 22 px box" (design 2.5, UX 1.1); DEC-0230 `w-5` (IR-001) |
| `manual:review:number-not-right-aligned` | `factor-cell.tsx:146` | drop `text-right` | non-equivalent: "right-aligned" (design 2.5, UX 1.1) (IR-001) |
| `manual:review:score-before-bar` | `factor-cell.tsx:150-163` | score directly after the number | non-equivalent: T011 order number, bar, mark, score (IR-002) |
| `manual:review:mark-after-score` | `factor-cell.tsx:158-163` | mark after the score | non-equivalent: T011 order; inspector design 2.5 "the percentile in weight 600 (and the mark), the standardised score" (IR-002) |
| `manual:review:not-enough-after-scored` | `factor-cell.tsx:191-198` | classified-with-percentile check before `not_enough_stocks` | non-equivalent: DEC-0151 "reasonCode first … retired, not_enough_stocks, classified with a non-null percentile"; T008 (IR-003) |
| `manual:review:scored-requires-null-reason` | `factor-cell.tsx:194` | scored only when `reasonCode === null` | non-equivalent: DEC-0151's order puts a classified cell with a percentile third, before the input reasons fall to Incomplete (IR-003) |
| `manual:review:hasown-to-in` | `factor-cell.tsx:65` | `code in CELL.incompleteStatus` | non-equivalent: DEC-0229 (no title for an unrecognised code). For `reasonCode` `"toString"` the title becomes "Incomplete: an input function toString() { [native code] }, so value can't be compared fairly. It isn't guessed." (IR-004) |
| `manual:review:mark-text-xs-dropped` | `restated-mark.tsx:7` | drop `text-xs` | non-equivalent: DEC-0075 and design 2.5 give the mark `--text-xs` (IR-005) |
| `manual:review:mark-rounded-dropped` | `restated-mark.tsx:7` | drop `rounded` | non-equivalent: T010 `rounded`; DEC-0075 names a corner radius (IR-005, IR-007) |
| `manual:review:badge-size-dropped` | `factor-cell.tsx:12` | drop `text-xs` from the shared badge classes | non-equivalent: T011 "the shared size classes … `text-xs`" (IR-005) |
| `manual:review:mark-glyph-before-words` | `restated-mark.tsx:27-28` | glyph before the `sr-only` words | **equivalent**. DEC-0075 places the glyph "beside" the words, so the order is open. `sr-only` content takes no layout, and assistive technology reads only the words |

### Validation Side Effects

- Before: HEAD `1f69e694f637ca1f38bacd54d0cd6ce708fe6650` and
  `git status --porcelain=v1 -uall` empty. Ignored build output was already
  present in `src/factorflow/api/static/`.
  `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2`,
  run from the harness root, gave
  `sha256:f02f6b40c8e2e3b9e3e9a187631bdeb1308cad4b3390f8bd6fbb5b203cb8cba7`.
- After: HEAD unchanged, porcelain status still empty before this report was
  written, and `code-revision` still
  `sha256:f02f6b40c8e2e3b9e3e9a187631bdeb1308cad4b3390f8bd6fbb5b203cb8cba7`.
  The build rebuilt the ignored static files. Mutants ran in clones under
  `$SCRATCHPAD/mut/work`, and the layout probe ran on copies under
  `$SCRATCHPAD/probe`.
- Unexpected tracked-file changes: none. The only files this review adds are
  this report and its `-v1-mutation.json`, both under `docs/`, which the
  fingerprint excludes.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | A scored cell's bar and number box can lose their size and every test still passes |
| IR-002 | HIGH | initial | The order of number, bar, mark and score inside the scored cell is not pinned |
| IR-003 | HIGH | initial | DEC-0151's state precedence is pinned for `retired` only |
| IR-004 | HIGH | initial | DEC-0229's "no title for an unrecognised reason" is not pinned for a prototype-named code |
| IR-005 | HIGH | initial | The mark's and the badges' size and corner classes are not pinned |
| IR-006 | MEDIUM | initial | The standardised score lacks the `--font-numeric` and `--text-xs` tokens the UX design gives it |
| IR-007 | LOW | initial | `rounded` is Tailwind's 0.25rem literal, not the `--radius` token DEC-0075 and the badge spec name |
| IR-008 | LOW | initial | DEC-0230's derivation does not cite the UX design's own ruling on the 22 px and 52 px widths |

### IR-001 — A scored cell's bar and number box can lose their size and every test still passes

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-9, DAC-E4-1, DAC-E4-S3-4 (the production code satisfies each one; the tests do not hold it there)
- **Tasks**: T005, T006
- **Files**: `web/src/components/patterns/factor-cell.tsx:144-157` (`ScoredCell`: number `inline-block w-5 text-right …`, track `inline-block h-2 w-7 overflow-hidden`, fill `block h-full`); `web/src/components/patterns/factor-cell.test.tsx:236-240` (TC-COMP-109 shape presence), `:300-358` (T006)
- **Claim challenged**: DAC-E4-1 says "a scored factor cell MUST show a whole-number percentile and a bar". The design and UX 1.1 specify "the percentile … right-aligned in a fixed 22 px box, then a 52 px bar". DEC-0230 sets those sizes to `w-5` and `h-2 w-7`. T005 asserts "a shape is present (the bar for scored)", so the scored state survives greyscale.
- **Observed evidence**: Five reviewer mutants survive the focused suites: `bar-track-width-dropped`, `bar-track-height-dropped`, `bar-fill-height-dropped`, `number-box-width-dropped` and `number-not-right-aligned`. The tests check that the bar element exists, its inline colours and the fill's `width` percentage, never its size classes. A headless Chromium probe loaded the built CSS. The as-built track measures 48 × 8 px with a 42.2 × 8 px fill at 88%. Without `w-7` the track is 0 px wide. Without `h-2` it is 0 px high. Without `h-full` the fill is 0 px high, so the bar never shows the percentile.
- **Expected evidence/behavior**: A test fails when the track loses its width or height token, when the fill loses its height, or when the number loses its fixed width or right alignment (design 2.5; UX 1.1; DEC-0230).
- **Impact**: jsdom has no layout, so class assertions are the only guard the suite has. A refactor that drops one of these classes would remove the bar from every scored cell on Research, universe members, Compare and evidence, and the suite would stay green. The scored state would then be a bare number, with no shape. Five later stories import this cell.
- **Required remediation**: Assert the track's width and height classes, the fill's full-height class, and the number's fixed-width and right-alignment classes, so that the five mutants above are killed. Production needs no change.

### IR-002 — The order of number, bar, mark and score inside the scored cell is not pinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S3-2, DAC-E4-S3-3 (both satisfied in production)
- **Tasks**: T004, T006 (order specified by T011)
- **Files**: `web/src/components/patterns/factor-cell.tsx:144-163`; `web/src/components/patterns/factor-cell.test.tsx:187-199` (mark follows the number), `:332-350` (score follows the number)
- **Claim challenged**: T011 builds the scored cell as the percentile, "then the `aria-hidden` … bar …, then `RestatedMark` when `cell.restatedPossible` …, then, only when `showScore` …, the `formatScore(cell.score)` text". The inspector design (classification-ui 2.5) reads "the percentile in weight 600 (and the mark), the standardised score".
- **Observed evidence**: `manual:review:mark-after-score` moves the mark after the score, and `manual:review:score-before-bar` moves the score directly after the number. Both survive. The tests compare each element only against the number (`compareDocumentPosition(...) & DOCUMENT_POSITION_FOLLOWING`). No test renders `showScore` and `restatedPossible` together.
- **Expected evidence/behavior**: With `showScore` and `restatedPossible` both set, a test asserts the full sequence: number, bar, mark, score.
- **Impact**: The inspector (E4-S7), Compare and evidence render this cell with `showScore`. A reordering would separate the mark from the percentile it qualifies, or put the score between the number and its bar, and the suite would not notice.
- **Required remediation**: Add one assertion of the complete DOM order with both flags set, killing both mutants. Production needs no change.

### IR-003 — DEC-0151's state precedence is pinned for `retired` only

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-14, DAC-E4-S3-1 (satisfied in production)
- **Tasks**: T008
- **Files**: `web/src/components/patterns/factor-cell.tsx:188-199`; `web/src/components/patterns/factor-cell.test.tsx:445-462`
- **Claim challenged**: T008 and DEC-0151 (owner-upheld) say "the state is chosen by `reasonCode` first, then `status`, in the order `retired`, `not_enough_stocks`, `classified` with a non-null `percentile`, else Incomplete".
- **Observed evidence**: `manual:review:not-enough-after-scored` moves the scored check ahead of `not_enough_stocks`, and it survives. A cell `{status: "classified", reasonCode: "not_enough_stocks", percentile: "50…"}` would then print `50` with a bar. `manual:review:scored-requires-null-reason` makes a classified cell with a percentile and an input reason render *Incomplete*, and it survives too. The test pins the precedence only for `retired` with a percentile (`:446-450`).
- **Expected evidence/behavior**: Tests fix DEC-0151's order for each rung. `not_enough_stocks` wins over a classified percentile. A classified cell with a percentile is scored whatever input reason it carries. If the owner reads "reasonCode first" as covering input reasons too, that reading changes production and DEC-0151, not only the test.
- **Impact**: The store's `factor_classification_shape` constraint (research-store 2.4, migration `0006_classifications.sql`) makes both inputs unreachable from the database today. DEC-0151 specifies them anyway, as it does for `retired` with a percentile, which is tested. These defensive rules exist so that a column under 30 stocks never shows a number (AC-14, STD-UI-4) if the read and the store ever disagree. A regression here would show a percentile on a factor that cannot be ranked.
- **Required remediation**: Add the two cases to the state-selection test so both mutants are killed. Production needs no change.

### IR-004 — DEC-0229's "no title for an unrecognised reason" is not pinned for a prototype-named code

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-12 (satisfied in production)
- **Tasks**: T007
- **Files**: `web/src/components/patterns/factor-cell.tsx:64-82` (`isIncompleteReason` uses `Object.hasOwn`); `web/src/components/patterns/factor-cell.test.tsx:92, 432-440`
- **Claim challenged**: DEC-0229 (PROVISIONAL, recorded by the coding run) says an Incomplete cell whose `reasonCode` is null or unrecognised, and whose `reasonDetail` is null, carries no title. T008 extends "unrecognised" to any value outside the five `ReasonCode` values.
- **Observed evidence**: `manual:review:hasown-to-in` replaces `Object.hasOwn(CELL.incompleteStatus, code)` with `code in CELL.incompleteStatus`, and it survives. The test's unknown code is `"not_a_reason"`. For `"toString"` the mutant titles the badge "Incomplete: an input function toString() { [native code] }, so value can't be compared fairly. It isn't guessed." (confirmed with `node -e`). The production code is correct; nothing holds it.
- **Expected evidence/behavior**: A test fails when an `Object.prototype` member name used as `reasonCode` (for example `toString` or `constructor`) produces a title (DEC-0229; STD-UI-1 forbids implementation vocabulary in owner-visible text).
- **Impact**: Swapping `Object.hasOwn` for `in` is a plausible simplification. It would surface JavaScript source text in an owner-facing tooltip, and the suite would stay green. E4-S2 review v2 raised the same gap on `failureSentence` (its IR-001).
- **Required remediation**: Add a prototype-named code to the no-title test, so the mutant is killed. Production needs no change.

### IR-005 — The mark's and the badges' size and corner classes are not pinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S3-3, DAC-E4-S3-4 (satisfied in production)
- **Tasks**: T003, T005 (classes specified by T010 and T011)
- **Files**: `web/src/components/patterns/restated-mark.tsx:6-7` (`MARK_CLASSES`); `web/src/components/patterns/factor-cell.tsx:12` (`BADGE`); `web/src/components/patterns/restated-mark.test.tsx:44-48`; `web/src/components/patterns/factor-cell.test.tsx:285-297`
- **Claim challenged**: DEC-0075 and classification-ui 2.5 give the mark "the `badge` `status-neutral` tokens (`--status-neutral` on `--status-neutral-muted`, `--radius`, `--text-xs`)". The design's test row says the mark test proves "the `status-neutral` tokens are applied". T010 and T011 list `rounded … text-xs` as the mark's and badges' classes.
- **Observed evidence**: `manual:review:mark-text-xs-dropped`, `manual:review:mark-rounded-dropped` and `manual:review:badge-size-dropped` all survive. The tests assert only the colour pair on the mark and the colour pairs on the badges.
- **Expected evidence/behavior**: A test fails when the mark or a badge loses its type-size class, or when the mark loses its corner-radius class.
- **Impact**: The mark sits beside a `--font-numeric` weight-600 number in a dense row. If it lost `text-xs` it would render at body size, and the compact *R* the blueprint draws would grow. The three badges would likewise render at the surrounding body size instead of the badge size the delivered idiom uses. No test would notice either change.
- **Required remediation**: Assert `text-xs` on the mark and on each of the three badges, and the mark's corner-radius class (whichever class IR-007 settles), so the three mutants are killed.

### IR-006 — The standardised score lacks the `--font-numeric` and `--text-xs` tokens the UX design gives it

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (AC-9 and DAC-E4-S3-2 concern the value, which is correct)
- **Tasks**: T011, T006
- **Files**: `web/src/components/patterns/factor-cell.tsx:159-163` (`<span data-testid="factor-score" className="text-muted-foreground">`)
- **Claim challenged**: The UX design's Research Token Usage table (`ux-design.md:599-609`, *Token Usage* under section 1.1, rows at lines 606 and 609) assigns "As-of line, helpers, footnotes, standardised score" to `--text-xs, --muted-foreground`, and "Percentile, standardised score, symbol" to `--font-numeric`. T011 and T006 name only `text-muted-foreground`, and the code follows the plan.
- **Observed evidence**: The score span carries `text-muted-foreground` alone, so it inherits the surrounding face and size. The percentile beside it uses `font-numeric`. Neither the plan nor a decision record notes the departure from the UX design.
- **Expected evidence/behavior**: The `showScore` rendering, which the inspector, evidence and compare consume (DEC-0150), uses the UX design's tokens for the standardised score. Otherwise the conflict between plan and design is recorded for the owner.
- **Impact**: Signed scores such as `+1.27` and `-0.45` would not align in the numeric face across inspector blocks, and would print larger than the design's `--text-xs`. Every consumer of `showScore` inherits this.
- **Required remediation**: Apply `font-numeric` and `text-xs` to the score span and pin them in T006's test, or record why the plan's narrower class list governs.

### IR-007 — `rounded` is Tailwind's 0.25rem literal, not the `--radius` token DEC-0075 and the badge spec name

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010, T011
- **Files**: `web/src/components/patterns/restated-mark.tsx:7`; `web/src/components/patterns/factor-cell.tsx:12`; `tailwind.config.js` (no `borderRadius` extension); built CSS `.rounded{border-radius:.25rem}`; `design-system/theme.css:194` `--radius: 0.5rem`
- **Claim challenged**: DEC-0075 and classification-ui 2.5 give the mark `--radius`. `design-system/components/badge/design-spec.md` §6 gives every badge "Corner radius `--radius`". STD-UI-29 says "no spacing, size or colour literal appears outside the theme".
- **Observed evidence**: T010 and T011 prescribe `rounded`, copied from CAP-001's delivered `screens/coverage/badges.tsx:5`. Because `tailwind.config.js` maps no radius to `--radius`, `rounded` resolves to Tailwind's built-in `.25rem`, half the theme's `0.5rem`. The coder followed the plan, and CAP-001's badges share the same gap.
- **Expected evidence/behavior**: The mark and badges take the theme's corner token, or the deviation from DEC-0075 is recorded.
- **Impact**: The mark and badges have smaller corners than the design system specifies, through a literal the theme does not own. The effect is cosmetic.
- **Required remediation**: Either apply the `--radius` token to this story's mark and badges, or record the deviation from DEC-0075 in the task plan's Open Gaps for the owner. CAP-001's delivered badges are outside this story.

### IR-008 — DEC-0230's derivation does not cite the UX design's own ruling on the 22 px and 52 px widths

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011
- **Files**: `projects/factorflow-v2/decisions/DEC-0230.md` (harness); `docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-design.md:239-241`; `docs/ux/design-source/P03-Research.dc.html:48, 57`
- **Claim challenged**: DEC-0230 (PROVISIONAL, open) resolves the conflict between the design's 22 px box and 52 px bar and STD-UI-29 by taking the nearest spacing tokens (`w-5` = 24 px, `w-7` = 48 px, `h-2` = 8 px). Its derivation says "a constitution standard outranks design prose".
- **Observed evidence**: The UX design already addresses this question: "No spacing, size or colour literal appears anywhere in this design; the pixel widths quoted from S03 (220 to 250 px, 300 to 340 px, 22 px, 52 px, 56 px) are the approved specification's and bind the layout, not the theme" (`ux-design.md:239-241`). The S03 design source draws the bar 52 × 6 px with a 3 px radius and the number at 22 px. DEC-0230 cites none of this. Its reading (STD-UI-29 §1.1, "This standard wins") is defensible and the decision is correctly recorded and provisional. But the owner, or the blind second opinion, would weigh it without the approved design's explicit position against it.
- **Expected evidence/behavior**: The record a reviewer of DEC-0230 sees includes the UX design's sentence and the S03 bar height and radius.
- **Impact**: There is a risk that the owner upholds the decision without seeing that the approved design reached the opposite reading. The rendered differences are 2 px, 4 px and 2 px.
- **Required remediation**: Put `ux-design.md:239-241` and the S03 bar dimensions in front of the owner with DEC-0230, for example in the task plan's Open Gaps or the driver's end-of-run questions. No code change is required by this finding.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified: `copy.ts` refactor.** `incompleteReason` now builds through the
  shared `incompleteSentence`, and `incompleteStatus` points at an `as const`
  table that also types `IncompleteReasonCode`. DEC-0151 asks for the sentence
  "built by one function in copy.ts". `incompleteReason`'s output is pinned by
  `copy.test.ts:490-498`, and the reviewer mutant that swaps its arguments is
  killed. `tsc` is clean with the narrower readonly type.
- **Justified: duplicated icons and badge size constant.** `Icon`,
  `QuestionIcon` and `BADGE` duplicate CAP-001's `screens/coverage/badges.tsx`.
  T011 directs that copy, because the delivered file is outside CAP-002's edit
  set (DEC-0084).
- **Justified: no title on a cause-less Incomplete cell (DEC-0229) and token
  sizes for the box and bar (DEC-0230).** Both are recorded as provisional and
  open, with `blocks: [CAP-002-E4-S3]`. They are not approvals. IR-008 adds
  context for DEC-0230's owner review.
- **Plan-carried deviations from the design:** the score's tokens (IR-006) and
  the corner radius (IR-007).
- **Bookkeeping:** T013 says the built CSS lands in `dist`. The build writes to
  `src/factorflow/api/static/`, and the check holds there.
- **No out-of-scope change** was found. No delivered file other than `copy.ts`
  and `copy.test.ts` changed. `dependencies.yaml` is unchanged.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework of CAP-002-E4-S3), then Adversarial Review Agent (v2)
- **Required action**: Strengthen `factor-cell.test.tsx` and `restated-mark.test.tsx` so that the 13 non-equivalent survivors in IR-001 to IR-005 are killed; production needs no change for those five. Address IR-006 by applying the UX design's score tokens or recording the deviation. IR-007 and IR-008 are non-blocking. Record the rework as a new TDD cycle in `CAP-002-E4-S3-tdd-evidence.yaml`. The next review uses this report's `reviewed_head` `1f69e694f637ca1f38bacd54d0cd6ce708fe6650` and `CAP-002-E4-S3-implementation-review-v1-mutation.json` as its baseline.
- **Warnings accepted downstream**: N/A
