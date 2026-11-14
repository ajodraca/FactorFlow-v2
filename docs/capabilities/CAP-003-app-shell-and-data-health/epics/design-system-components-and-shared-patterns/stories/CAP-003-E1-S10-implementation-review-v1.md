---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S10-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-14
updated: 2026-11-14
story_id: "CAP-003-E1-S10"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S10.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S10-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-14T16:11:34Z"
reviewed_head: "ac8a2a709264f55b27e1e8c2e4480785eca62d08"
review_base: "1ba1100559fbe17200604141d57cd33fa3d46ee0"
reviewed_state_revision: "sha256:77976daab3384c26d22f013ced515e859c956254e9bb861b23ad83ceddff1bf0"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E1-S10
    artifact_version: 1
    content_revision: sha256:7ec84fb4e89ff3c646aea958896c11a3a87f6c1a4ac622bfb92df8f99087411c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-14T16:11:34Z
  source_artifacts:
    - id: CAP-003-E1-S10
      version: "1 (sha256:7ec84fb4e89ff3c646aea958896c11a3a87f6c1a4ac622bfb92df8f99087411c)"
    - id: CAP-003-E1-S10-tasks
      version: "1 (draft, updated 2026-11-06)"
    - id: CAP-003-E1-S10-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "2"
    - id: CAP-003-component-design-ui-components
      version: "2"
    - id: CAP-003-ux-design
      version: "2"
    - id: CAP-003-ui-components-tests
      version: "2 (draft)"
    - id: CAP-003-coverage-matrix
      version: "2 (draft)"
    - id: PRODUCT-UX
      version: "6"
    - id: STD-UI
      version: "6"
    - id: DEC-0315
      version: "applied (provisional, open, owner_reviewed false)"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E1-S10 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 4/4 satisfied |
| Planned tasks | 9/9 verified |
| Required validation | 13/13 passed |

This is the initial review of `ac8a2a7` against review base `1ba1100`, the tip of the run's
integration branch.

The story is implemented as planned:

- `AsOfLine` gains the generic `parts` form fixed by DEC-0315: one `p` at `text-xs text-muted-foreground`,
  each part after the first preceded by an `inline-block px-2` span holding ` · `.
- The delivered Research line now composes that form. Its body becomes the module-private `ResearchAsOfLine`,
  and the null and skeleton handling is unchanged.
- No caller, screen, configuration or end-to-end file changed.
- The delivered `as-of-line.test.tsx` was only appended to. Its first 409 lines are byte-identical to
  the base file, sha256 `54e38f09…`.

The checks behind that:

- All 13 required checks pass. The full suite runs 100 files and 2559 tests, all passing.
- Every delivered case passes unchanged. TC-COMP-033 and TC-COMP-034 are implemented and meaningful:
  TC-COMP-034 was RED against the delivered line.
- The reviewer ran 28 mutants, the 2 catalogue mutants plus 26 manual ones. 27 are killed. The one
  survivor is equivalent against the contract (Mutation run).

Two findings remain, neither blocking:

- **IR-001 (MEDIUM).** The `inline-block` separator removes its own spaces in real Chromium, from
  both `innerText` and the accessibility tree. The reviewer measured this. It contradicts the
  separator's doc comment and the plan's claim that "the accessible text … [is] unchanged". The
  delivered Research line's accessible text changes from ` · from the download started ` to
  `·` + `from the download started `. No acceptance criterion as written is broken: the line still
  reads as one line, and every delivered assertion holds.
- **IR-002 (LOW).** T001's fingerprint and baseline, and the TypeScript RED that cycle 1 claims, are
  not in the committed evidence. The reviewer reproduced all three independently.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S10.md` (`status: in-review`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S10-tasks.md` (`status: draft`, T001-T009 ticked) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, web interface under `web/src/`; design module `ui-components`) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E1-S10-run-20261114T141555Z` |
| HEAD | `ac8a2a709264f55b27e1e8c2e4480785eca62d08` |
| Review base | The driver passed its integration branch, `usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z`, as `--base-ref`. `pipeline-state.py review-base` resolves it to `1ba1100559fbe17200604141d57cd33fa3d46ee0`, which is the branch tip and an ancestor of HEAD (`git merge-base --is-ancestor` exit 0) |
| Working tree | Clean before and after validation: `git status --porcelain=v1 --untracked-files=all` prints nothing. The only additions are this report and its mutation file under `docs/`, which the code fingerprint excludes |
| Changed files reviewed | 30 against the review base (26 added, 4 modified) in two commits: `e49e68e` (story-coding cycle 1) and `ac8a2a7` (cycle 2). Both carry `Decision-Id: DEC-0315`, which `git log --format='%(trailers:key=Decision-Id,valueonly)'` parses |
| Baseline | none: initial review |

`pipeline-state.py check --stage adversarial-review --base-ref <integration branch>` reports
`READY — story is ready for independent review`. Without `--base-ref` it reports `BLOCKED`. The
TDD-evidence lint inside the check then diffs against the default branch, which is not this run's
base.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/components/patterns/as-of-line.tsx` | modified (+101/−17) | AC-26, DAC-E1-13, DAC-E1-S10-1, DAC-E1-S10-2; T005, T006; DEC-0315 |
| `web/src/components/patterns/as-of-line.test.tsx` | modified (+148, appended after line 409 only) | TC-COMP-033, TC-COMP-034; T002, T003, T004 |
| `.../stories/CAP-003-E1-S10.md` | modified (`status: planning` to `in-review`) | story-coding lifecycle |
| `.../stories/CAP-003-E1-S10-tasks.md` | modified (T001-T009 ticked; nothing else) | bookkeeping |
| `.../stories/CAP-003-E1-S10-tdd-evidence.yaml` | added | T009 |
| `.../stories/CAP-003-E1-S10-evidence/cycle-1.patch`, `red-cycle-1-generic-form.log`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`, `mutation-cycle-1-results-logs/*.log` (10 logs) | added in `e49e68e` | T009 (cycle-1) |
| `.../stories/CAP-003-E1-S10-evidence/cycle-2.patch`, `red-cycle-2-research-composition.log`, `mutants-cycle-2.json`, `mutation-cycle-2-results.json`, `mutation-cycle-2-results-logs/*.log` (7 logs) | added in `ac8a2a7` | T009 (cycle-2) |

No other source file changed:

- `git diff --stat 1ba1100..HEAD -- . ':!docs'` lists exactly the two planned files.
- `git diff --exit-code 1ba1100..HEAD` exits 0 over `web/src/screens`, `web/src/app`, `web/src/api`,
  `package.json`, `package-lock.json`, `tailwind.config.js`, `design-system` and `tests`. No caller,
  configuration or end-to-end spec was edited (T007; plan Resolved Conflict 2).
- `results-pane.tsx:271-281` is still the only caller. It passes the Research props unchanged.

Each cycle patch's `web/` section is identical to its commit's diff, apart from `index` lines:
`cycle-1.patch` to `git diff 1ba1100..e49e68e -- web/`, and `cycle-2.patch` to
`git diff e49e68e..ac8a2a7 -- web/`. The code the cycle reviews judged is the code committed.
`shasum -a 256` of both patches, both RED logs and both results files equals the recorded
`diff_sha256`, `red_log_sha256` and `results_sha256`.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-26 | SATISFIED | `as-of-line.tsx:266-281`: one exported `AsOfLine` serves both shapes. `:216-237`: the Research line renders through it. The generic form imports no screen | `as-of-line.test.tsx:424-484`, `:533-558`; `token-literals.test.ts` (30 tests) passes over the edited file | The as-of line is now one pattern; Home (E5-S1) and Data health are its later consumers. The Research branch keeps its `screens/research` imports, which plan Resolved Conflict 1 justifies |
| DAC-E1-13 | SATISFIED | `as-of-line.tsx:160-239` (`ResearchAsOfLine` returns `<AsOfLine parts={…} className={LINE_HEIGHT} />`), `:266-281` | The 24 delivered cases (`:1-409`) pass unchanged at HEAD, as they do at base. TC-COMP-034 (`:533-558`) pins the composition: its separator spans exist only because the line goes through the generic form | Composition is observable rather than claimed: `r-sort-into-part2-text` and `c2-sort-as-text` are killed by TC-COMP-034 and by delivered cases |
| DAC-E1-S10-1 | SATISFIED | `as-of-line.tsx:267-278`: one `p`, `cn("text-xs text-muted-foreground", className)`, and `<span className="inline-block px-2">{SEPARATOR}</span>` before each part after the first (`SEPARATOR = " · "`, `:257`). `px-2` resolves to `var(--space-2)` (`tailwind.config.js:60`) | TC-COMP-033 (`:424-484`): one `p`; exact collapsed text; two separators with `inline-block`, `px-2` and no `aria-hidden`; no `br`, `div` or nested `p`; `text-xs` and `text-muted-foreground`; the one-part edge case | Holds as written: Chromium computes `display: inline-block; padding 8px/8px` per separator, inside one paragraph. Word boundaries in the accessible text are not as the doc comment claims (IR-001); the AC does not state them |
| DAC-E1-S10-2 | SATISFIED | `as-of-line.tsx:160-239` keeps the `set === null` and skeleton handling, `OUTCOME`, `LiveRegion`, `LINE_HEIGHT` and every copy import | `npm run test`: `as-of-line.test.tsx` 35 (24 delivered), `results-pane.test.tsx` 60, `research.test.tsx` 32, `stock-evidence.test.tsx` 31, `copy.test.ts` 405, `not-current-banner.test.tsx` 16, `render.test.tsx` 1, all passing | `git diff -U0` of the test file has a single hunk, `@@ -409,0 +410,148 @@`, with no removed line. The HEAD file's first 409 lines hash to the base file's `54e38f09…` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | At `1ba1100`: `ui/utils.ts` exports `cn()`; `token-literals.test.ts:142` has `SCANNED_DIRECTORIES = ["web/src/components/"]` | The reviewer reran T001's five suites at the base in a scratch clone: 5 files, 177 tests, exit 0. The test file's sha256 there is `54e38f09…`. The coder's own fingerprint and baseline are not recorded anywhere in the evidence (IR-002) |
| T002 | complete | VERIFIED | `as-of-line.test.tsx:424-484`; each case carries `// Implements TC-COMP-033` | Assertions (a) to (e) and the one-part edge are present, as planned. The named kills fail: off-by-one `:273:1` (`index >= 0`) and `c1-padding` (`px-1`) |
| T003 | complete | VERIFIED | `as-of-line.test.tsx:533-558`; each case carries `// Implements TC-COMP-034` | Both cases reuse `renderLine` and `BASE`. Without a sort label: one span, between `2026-10-15 17:46 CDT` and `from the download started `. With `sortLabel: "value"`: two spans, the second before `sorted by value`, plus the exact collapsed literal. RED against the delivered line (0 spans) is shown in `red-cycle-2-research-composition.log` |
| T004 | complete | VERIFIED | `as-of-line.test.tsx:499-531` | (1) element parts stay direct children in order, with one separator between them. (2) host `min-h-7` is added and the pattern's classes remain. (3) `@ts-expect-error` on `parts={[]}`. Kills: `c1-reverse-parts`, `c1-host-class` and `g-parts-widened` (`TS2578`). The `describe` sits before T003's block, not after it; order is immaterial |
| T005 | complete | VERIFIED | `as-of-line.tsx:1`, `:6`, `:241-281` | `AsOfLinePartsProps` matches DEC-0315 exactly. `AsOfLineProps` (`:36-50`) is byte-identical to the base. The signature is `AsOfLine(props: AsOfLineProps \| AsOfLinePartsProps): JSX.Element \| null`, dispatching on `"parts" in props`. The `biome-ignore` on the index key is as planned. The doc comment states the planned rationale, which is inaccurate in Chromium (IR-001) |
| T006 | complete | VERIFIED | `as-of-line.tsx:64-99` (`ScoresFromPart`, `DownloadPart`), `:156-239` (`ResearchAsOfLine`), `:30-33` (takeover note) | The parts and the tail order are as planned. The tail (checked time, `LiveRegion`, **Try again**) follows the last part with no separator, as the delivered order had it. `grep -n "SCORE_SET.separator" as-of-line.tsx` prints nothing. `textContent` is character-for-character the delivered text; Chromium's rendered and accessible text is not (IR-001) |
| T007 | complete | VERIFIED | Full suite: 100 files, 2559 tests. `git diff -U0` shows the test file was only appended to. `git diff --exit-code -- web/src/screens web/src/app web/src/api` exits 0 | All eight named suites pass (counts in AC table). `tests/e2e/research-after-download.spec.ts:114`'s `/^Scores from \S+ \S+ C[SD]T/` stops at the zone, so the separator change cannot reach it |
| T008 | complete | VERIFIED | `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build` all exit 0 | `tsc` accepts `BASE: AsOfLineProps` and `Partial<AsOfLineProps>` against the widened signature, and consumes T004's directive |
| T009 | complete | VERIFIED | `CAP-003-E1-S10-tdd-evidence.yaml`: two cycles, both `APPROVED`, `drift_detected: false`, `tests_executed: true`, with mutation blocks (6/6 and 3/3) | `check-tdd-evidence.py --require-logs`: 0 errors, 0 warnings. Paths are harness-relative. Cycle 1 was committed on its own (`e49e68e`), where the plan expected `commit_hash: stage` for every cycle. That is a justified deviation, explained in the evidence header (Scope and Plan Deviations) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `holds every part in exactly one paragraph` (`:426-439`) / TC-COMP-033 | ADEQUATE | Exactly one `p` in the container, and every literal part is inside it. Kills `g-div` | none |
| `reads as one line joined by middle dots` (`:442-447`) / TC-COMP-033 | ADEQUATE | Exact collapsed `textContent` equality. Kills off-by-one `:1`, `g-sep-no-spaces`, `g-sep-bullet`, `c1-separator-spaces` | `textContent` cannot see CSS whitespace trimming. jsdom has no layout, and the plan says so. See IR-001 |
| `gives each of the two separators the --space-2 padding and keeps the dot readable` (`:450-459`) / TC-COMP-033 | ADEQUATE | Two separator spans, each `inline-block` and `px-2`, none `aria-hidden`. Kills `g-sep-no-inline-block`, `g-sep-aria-hidden`, `c1-padding` | none |
| `contains no break, block or second paragraph` (`:462-466`) / TC-COMP-033 | ADEQUATE | `querySelector("br, div, p")` is null inside the line | none |
| `is a muted extra-small line` (`:469-474`) / TC-COMP-033 | ADEQUATE | `text-xs` and `text-muted-foreground`. Kills `g-drop-text-xs`, `g-drop-muted` | none |
| `shows one part with no separator` (`:477-483`) / TC-COMP-033 edge | ADEQUATE | One part: exact text and zero separators. Kills off-by-one `:1` | none |
| `keeps element parts as direct children in order with one separator between` (`:500-514`) / T004 (1) | ADEQUATE | Child test ids in order `["part-m", null, "part-l"]`, and the middle child is the separator. Kills `c1-reverse-parts`, `g-wrap-part` | none |
| `adds the host's classes and keeps the pattern's own and the test id` (`:516-522`) / T004 (2) | ADEQUATE | `min-h-7` is added, the pattern's classes stay, and the line is found by `data-testid`. Kills `c1-host-class`, `g-no-testid` | Conflict precedence between host and pattern classes is unpinned. No artifact specifies it (`g-host-first`, equivalent) |
| `refuses an empty parts list at the type level` (`:524-530`) / T004 (3) | ADEQUATE | `@ts-expect-error` on `parts={[]}`, judged by `npx tsc --noEmit`. Widening `parts` to `readonly ReactNode[]` fails with `TS2578` (`g-parts-widened` killed) | Before T005 this directive is consumed by the "`parts` unknown" error, so the case cannot be RED by construction. The mutant shows it is meaningful |
| `joins its two parts with one separator span and no sort clause` (`:535-544`) / TC-COMP-034 | ADEQUATE | One span, its classes, and its exact previous and next siblings. RED before T006. Kills `r-tail-own-part` (with delivered cases) | none |
| `adds a second separator immediately before the sort clause` (`:547-558`) / TC-COMP-034 | ADEQUATE | Two spans, the second immediately before `sorted by value`, and the exact collapsed literal. RED before T006. Kills `r-sort-into-part2-text` (alone), `r-tail-before-sort` | none |
| Delivered `as-of-line.test.tsx:1-409` (24 cases) / TC-COMP-034 step 1 | ADEQUATE (unchanged) | Text, link, badges, checked time, the one live region, skeleton, height token. They kill most Research mutants: `r-sort-drop-tail`, `r-nosort-drop-tail`, `r-scores-numeric`, `r-badge-tier`, `c2-*` | none |

Traceability and isolation:

- TC-COMP-033 and TC-COMP-034 carry `// Implements TC-COMP-0NN` on every case. They match
  `tests/component/ui-components-tests.md:769-808` and the coverage-matrix rows AC-26 (`:61`),
  DAC-E1-13 (`:78`), DAC-E1-S10-1 (`:110`) and DAC-E1-S10-2 (`:111`).
- Fixtures are literals. No timer, clock or network is used, and each case renders into a fresh
  container.
- The type case is an uncalled arrow function, so Vitest runs it harmlessly.

On RED evidence:

- `red-cycle-1-generic-form.log` shows the 8 new runtime cases failing (`Cannot read properties of
  undefined (reading 'runOutcome')`), with 25 passing: the 24 delivered cases and the type case.
- `red-cycle-2-research-composition.log` shows both TC-COMP-034 cases failing with 0 separator
  spans, and 33 passing.
- The cycle-1 claim "tsc reported parts unknown" has no log (IR-002).

### Mutation run (reviewer, `review` cycle)

The reviewer ran three steps:

1. **Generate.** `mutation-run.py generate --range 1ba1100..HEAD --cycle review` writes 2 catalogue
   mutants, the off-by-one pair at `as-of-line.tsx:273`.
2. **Write.** The reviewer wrote 19 manual mutants (`g-*` for the generic form, `r-*` for the Research
   composition).
3. **Re-run.** The reviewer re-ran the coder's 7 manual mutants (`c1-*`, `c2-*`) against HEAD. One
   of them, `c2-sort-as-text`, does not do what the plan's mutant list describes. The reviewer's
   `r-sort-into-part2-text` is the planned "sort clause appended to part 2 as text".

The run took the story's focused suites with `--jobs 4`: `as-of-line.test.tsx`,
`results-pane.test.tsx`, `research.test.tsx` and `stock-evidence.test.tsx`, then `npx tsc --noEmit`.
All four baselines exit 0. `tree_patch_sha256` is the empty-tree hash, so the clean HEAD was
mutated. The results are in `CAP-003-E1-S10-implementation-review-v1-mutation.json` (sha256
`619059a23b60e8f43af385af1d00948cb81a7b43cd4cf8e2bed2c5f99c390e24`).

A first run included a malformed `g-div` that changed only the opening tag. It failed to compile,
which is not a kill. The reviewer fixed the mutant to swap both tags and re-ran all 28. The file
above is the second run. No mutant in it fails to transform or compile.

| Mutants | Result | Killed by / equivalence judgment |
|---------|--------|----------------------------------|
| `:273:off-by-one:1` (`index >= 0`), `:273:off-by-one:2` (`index > 1`) | killed, killed | TC-COMP-033 exact text and one-part edge; delivered TC-COMP-179 text |
| `g-no-testid`, `g-drop-text-xs`, `g-drop-muted`, `g-div`, `g-role-status` | 5 killed | Delivered height/skeleton and class cases; TC-COMP-033 (a) and (e); `role="status"` on the `p` breaks the delivered one-live-region cases (TC-COMP-176) |
| `g-sep-no-inline-block`, `g-sep-aria-hidden`, `g-sep-no-spaces`, `g-sep-bullet`, `g-wrap-part` | 5 killed | TC-COMP-033 (c); delivered `visibleText` cases; T004 (1) |
| `g-parts-widened` (`parts: readonly ReactNode[]`) | killed | `TS2578 Unused '@ts-expect-error' directive` in `as-of-line.test.tsx`; Vitest 158/158 |
| `g-host-first` (`cn(props.className, "text-xs text-muted-foreground")`) | **survived** | **Equivalent.** It changes only which class wins when a host passes one that conflicts with `text-xs` or `text-muted-foreground`. No artifact specifies that precedence. DEC-0315 gives `className` one purpose, Research's non-conflicting `min-h-7`, and T004 (2) requires only that host classes are added while `text-xs` and `text-muted-foreground` remain, which the mutant also does. Blueprint §4.8 fixes every as-of line at `--text-xs` `--muted-foreground`, so no artifact sanctions a host overriding them |
| `r-sort-into-part2-text`, `r-sort-drop-tail`, `r-tail-before-sort`, `r-tail-own-part`, `r-nosort-drop-tail`, `r-scores-numeric`, `r-badge-tier` | 7 killed | TC-COMP-034 (both cases); delivered live-region, checked-time, badge and numeric-face cases |
| Coder's `c1-separator-spaces`, `c1-padding`, `c1-host-class`, `c1-reverse-parts`, `c2-sort-as-text`, `c2-class-lost`, `c2-drop-space` | 7 killed | As the coder's cycle results record |

Totals: 28 mutants, 27 killed, 1 survived. The survivor is equivalent, as judged above; no survivor
is non-equivalent. There were 0 timeouts and 0 stillborn mutants. No mandatory test is `WEAK`.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | N/A | All checks PASSED; not counted |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `READY`; not counted. Without `--base-ref` the check reports `BLOCKED`, because its embedded TDD lint then diffs against the default branch |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-003-integration-20261114T141555Z` | harness root | 0 | N/A | `1ba1100…`, ancestor of HEAD; not counted |
| `npm --prefix repos/factorflow-v2/FactorFlow-v2 run test -- src/components/patterns/as-of-line.test.tsx` | component root (npm prefix) | 0 | PASS | Narrowest story suite first: 1 file, 35 tests (24 delivered, 11 new) |
| `npm run lint` | component root | 0 | PASS | Biome: 223 files, no findings |
| `npm run format` | component root | 0 | PASS | Biome: 223 files, no changes |
| `npx tsc --noEmit` (run as `node_modules/.bin/tsc --noEmit -p <component>/tsconfig.json`) | component root | 0 | PASS | No output. T004's directive is consumed |
| `npm run build` | component root | 0 | PASS | Vite build, 2150 modules. Writes only ignored files under `src/factorflow/api/static/` |
| `npm run test` | component root | 0 | PASS | 100 files, 2559 tests. All eight suites T007 names pass |
| `npm ci --prefix <scratch clone at ac8a2a7>` | scratch clone of the component repo at HEAD | 0 | PASS | Run in an identical-commit clone so the shared `node_modules` that the mutation clones link was not torn down. `package.json` and `package-lock.json` are unchanged since the base. Against the fresh install, `npm run build`, `tsc --noEmit` and `vitest run src/components/patterns/` (12 files, 430 tests) all pass |
| `npm run test -- <T001's five suites>` at `1ba1100` | scratch clone at the review base (fresh `node_modules` linked) | 0 | PASS | T001 baseline: 5 files, 177 tests, with `as-of-line.test.tsx` at 24 tests |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/.../CAP-003-E1-S10-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 1ba1100559fbe17200604141d57cd33fa3d46ee0 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings. The reviewer's `shasum -a 256` of both patches, both RED logs and both results files matches the recorded values |
| `git diff -U0 1ba1100..HEAD -- web/src/components/patterns/as-of-line.test.tsx` | component root | 0 | PASS | One hunk, `@@ -409,0 +410,148 @@`, with no `-` line (T007, DAC-E1-S10-2). The 409-line prefix hashes to `54e38f09…`, the same as the base file |
| `git diff --exit-code 1ba1100..HEAD -- web/src/screens web/src/app web/src/api package.json package-lock.json tailwind.config.js design-system tests` | component root | 0 | PASS | No caller, configuration or end-to-end file changed (T007; Resolved Conflict 2) |
| `grep -n "SCORE_SET.separator" web/src/components/patterns/as-of-line.tsx` | component root | 1 (no match) | PASS | Prints nothing, as the plan's DAC-E1-13 check requires |
| `git diff --stat 1ba1100..HEAD -- . ':!docs'` | component root | 0 | PASS | Exactly the two story files (Phase 4 checkpoint) |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 1ba1100559fbe17200604141d57cd33fa3d46ee0..HEAD --cycle review --out <scratch>/s10/generated.json` | harness root | 0 | N/A | 2 mutants (`off-by-one`) |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <scratch>/s10/mutants.json --jobs 4 --work-root <scratch>/s10/work --command 'cd {workdir} && ln -sfn <component>/node_modules node_modules && npx vitest run web/src/components/patterns/as-of-line.test.tsx web/src/screens/research/results-pane.test.tsx web/src/screens/research/research.test.tsx web/src/screens/research/stocks/stock-evidence.test.tsx && npx tsc --noEmit' --out <scratch>/s10/results.json` | harness root | 3 | N/A | 28 mutants, 27 killed, 1 survived (equivalent). Four baselines exit 0. Exit 3 reports the survivor |
| Reviewer probe 1 (`a11y-probe-real.mjs`, Playwright Chromium from the component's `node_modules`) | scratchpad | 0 | N/A | Uses the markup `AsOfLine` actually renders, dumped from jsdom by a scratch-clone test at HEAD and at base, styled by the stylesheet `npm run build` compiles. It prints `innerText`, computed separator style and the accessibility tree's `StaticText` leaves (evidence for IR-001). The scratch-clone probe tests are outside the review subject |
| Reviewer probe 2 (`a11y-probe.mjs`, hand-written equivalent markup with inline styles) | scratchpad | 0 | N/A | Gives the same result. As a control, a padded plain inline `span` (not `inline-block`) keeps the spaces in `innerText` |
| `npm run test:e2e` | component root | N/A | NOT RUN | Not in the story's or the plan's validation list, and the story owns no integration or E2E case. The one E2E assertion on the line (`research-after-download.spec.ts:114`) was analysed under T007 |
| Python commands (`uv …`) | component root | N/A | NOT RUN | No Python file changed; not in the story's validation list |

Harness root is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/factorflow-v2-cap-003-run-67252b`.
`<scratch>` is the reviewer's session scratchpad. No command needed to leave the sandbox.

### Validation Side Effects

- Before: clean working tree at `ac8a2a7`. `pipeline-state.py code-revision` gives
  `sha256:77976daab3384c26d22f013ced515e859c956254e9bb861b23ad83ceddff1bf0`.
- After: clean working tree at `ac8a2a7`, with the same fingerprint.
  - The build and the suite's build-output test rewrite only ignored files under
    `src/factorflow/api/static/`.
  - The mutation clones, `npm ci`, the T001 baseline and both probes ran in the reviewer's
    scratchpad.
  - This report and its mutation file are the only new files.
- Unexpected tracked-file changes: none.

## Findings

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

| Finding | Severity | Scope | Title |
|---------|----------|-------|-------|
| IR-001 | MEDIUM | initial | The `inline-block` separator removes its spaces from Chromium's rendered and accessible text, contrary to its doc comment and the plan |
| IR-002 | LOW | initial | T001's fingerprint and baseline, and cycle 1's `tsc` RED, are claimed but not in the evidence |

### IR-001 — The `inline-block` separator removes its spaces from Chromium's rendered and accessible text, contrary to its doc comment and the plan

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S10-1 and DAC-E1-13. Both hold as written; the gap is in a
  claimed property they do not state.
- **Tasks**: T005 (separator markup and its doc comment), T006 ("character-for-character the
  delivered text"), T002 (c)
- **Files**: `web/src/components/patterns/as-of-line.tsx:251-257` (`SEPARATOR` and its doc comment),
  `:273` (the separator span); plan *Other Notes*, "The separator's spacing is new for Research" and
  "Why `inline-block`"
- **Claim challenged**:
  - The doc comment at `:251-256`: "The spaces sit inside an `inline-block`: they keep the word
    boundaries in the text a screen reader and `textContent` read".
  - The plan: "The text, the accessible text and every delivered assertion are unchanged; only the
    visible gap widens".
- **Observed evidence**: Reviewer probe 1 used Playwright's Chromium on the markup `AsOfLine`
  renders, styled by the compiled stylesheet. Each separator computes to `inline-block`, padding
  `8px/8px`. CSS removes the collapsible spaces at the start and end of the inline-block's own
  line, so those spaces leave the rendered text:
  - Generic line, `innerText`: `Market closed·prices current to 2026-10-15·checked 18:52:14 CDT`.
    Accessibility-tree leaves: `Market closed`, `·`, `prices current to 2026-10-15`, `·`,
    `checked 18:52:14 CDT`.
  - Research line at HEAD (`sortLabel: "value"`), `innerText`:
    `Scores from 2026-10-15 17:46 CDT·from the download started 2026-10-15 17:30 CDT … Complete·sorted by value`.
    Leaves: `·` alone, then `from the download started ` and `sorted by value`.
  - The delivered line at `1ba1100`, same props, `innerText`:
    `Scores from 2026-10-15 17:46 CDT · from the download started … Complete · sorted by value`.
    Leaves: ` · from the download started ` and ` · sorted by value`.
  - `textContent` keeps the spaces in every case. That is why TC-COMP-033 (b), TC-COMP-034 and
    every delivered assertion still pass: jsdom has no layout.
  - Control: a padded plain inline `span` keeps the spaces in `innerText`.
- **Expected evidence/behavior**: The property the separator's own doc comment and the plan claim,
  that word boundaries survive in what a screen reader reads, and that the Research line's
  accessible text is unchanged. Component design `ui-components` 2.1 has the Research line
  "rendering what it rendered before". Blueprint §4.8 draws the line's text with the dot set off by
  spaces (*15:00 CDT · checked 18:52:14*).
- **Impact**:
  - Chromium exposes no space on either side of the dot to assistive technology, where the
    delivered Research line exposed ` · `. Copying the line gives `CDT·from the download started`.
  - The reviewer drove no screen reader, so whether a given one voices the neighbouring words as
    joined is not established.
  - The pattern is the seam later stories build on. CAP-003-E5-S1's Home header and the Data health
    verdict line inherit it.
  - Doc sync would copy the inaccurate rationale into `docs/reference/component-patterns.md`.
- **Required remediation**: Do one of the following:
  - Make the separator keep a space on each side of the *·* in Chromium's rendered text and
    accessibility tree, keep the visible `--space-2` either side, and keep every delivered assertion
    passing. Pin the space with a check that does not rely on `textContent` alone.
  - Keep the markup, correct the doc comment and the plan's note to say what Chromium exposes, and
    record the change in the delivered Research line's accessible text for the owner.

### IR-002 — T001's fingerprint and baseline, and cycle 1's `tsc` RED, are claimed but not in the evidence

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A. DAC-E1-S10-2 is verified independently.
- **Tasks**: T001, T009
- **Files**: `.../stories/CAP-003-E1-S10-tdd-evidence.yaml:12-13`;
  `.../stories/CAP-003-E1-S10-evidence/red-cycle-1-generic-form.log`
- **Claim challenged**:
  - T001 is ticked. It says to run five named suites and "record that [they] pass before any change",
    and to "record `sha256sum web/src/components/patterns/as-of-line.test.tsx` as the delivered
    fingerprint used by T007".
  - cycle-1's `red_evidence` says "tsc reported parts unknown".
- **Observed evidence**:
  - No fingerprint appears in the committed story documents (`grep -rl 54e38f09` over the stories
    directory finds nothing), and no baseline log for the five suites is committed.
  - `red-cycle-1-generic-form.log` holds Vitest output only, with no `TS` error line.
- **Expected evidence/behavior**: Ticked tasks are backed by the records they say they make (skill
  C.5). TDD claims are backed by their logs, which is the intent of `--require-logs`.
- **Impact**: Evidence quality only. The reviewer reproduced all three:
  - The base suites pass: 177 tests.
  - The delivered file's sha256 is `54e38f09…`, and HEAD keeps those 409 lines byte for byte.
  - Before T005, the new generic JSX cannot type-check, because `parts` is not a prop of
    `AsOfLineProps`.
- **Required remediation**: Record T001's baseline result and fingerprint in the story's evidence.
  Then either commit cycle-1's `tsc` output beside its RED log or drop the `tsc` clause from
  `red_evidence`.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Cycle 1 committed on its own.** T009 planned `commit_hash: stage` for every cycle with no
  per-cycle commit. Cycle 1 records its own commit, `e49e68e`. The evidence header states why: it
  isolates each cycle's reviewed patch. This is justified, and stronger evidence than planned.
- **No caller edited.** The story's Implementation bullet reads "CAP-002's Research as-of line caller
  updated to compose `AsOfLine`". The plan's Resolved Conflict 2 recomposes the line inside
  `as-of-line.tsx` instead. `results-pane.tsx:271` already renders `AsOfLine`, and DEC-0211 gives
  `web/src/screens/` to `owner-web-app`. This is justified, and DAC-E1-13 holds.
- **Layering exception.** `as-of-line.tsx` still imports `screens/research/copy` and `format`,
  where component design 2.2 says "nothing imports a screen". Resolved Conflict 1 justifies keeping
  them, because the delivered test must pass unchanged. The generic form imports no screen. The plan
  names the 2.2 follow-up.
- **`SCORE_SET.separator` is orphaned.** `web/src/screens/research/copy.ts:496` keeps
  `separator: " · "`. No file reads it any longer, because the line now uses the pattern's own
  `SEPARATOR`. T006 intends this, and the copy catalogue is `owner-web-app`'s (DEC-0211), so the
  story correctly leaves it. It is a follow-up for that component, not a finding.
- **Falsy parts.** `parts` entries are `ReactNode`, so `null` or `false` is accepted. A conditional
  part would still be preceded by a separator. No artifact specifies dropping empty parts: DEC-0315
  is silent, and its blind second opinion, which disagreed with the decision, proposed dropping them.
  This is not a finding. It is noted for E5-S1, the first consumer, and for the owner's review of
  DEC-0315.
- **Bookkeeping.** The tasks file's `updated:` stays `2026-11-06` although its checkboxes changed.
  T004's `describe` precedes T003's in the file, where the plan said "after T003". Neither affects
  behaviour.
- **Reference documentation.** `docs/reference/component-patterns.md` "The as-of line" (`:342`)
  still describes the delivered inline `p`. Updating it belongs to doc sync, as the plan says.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Synchronise `docs/reference/component-patterns.md` with the composed
  `AsOfLine` (two prop shapes, DEC-0315). Do not carry the `inline-block` word-boundary rationale
  into the reference until IR-001 is resolved. Record IR-001 and IR-002 as open warnings.
  - DEC-0315 is still provisional and contested (`second_opinion_agrees: false`,
    `owner_reviewed: false`).
  - If the owner chooses the second opinion's shape (`parts: ReactNode[]` plus a `children` tail,
    empty parts dropped), the generic API changes before CAP-003-E5-S1 consumes it.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW)
