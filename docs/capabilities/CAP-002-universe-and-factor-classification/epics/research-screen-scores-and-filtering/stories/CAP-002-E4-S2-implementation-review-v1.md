---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E4-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-28T22:08:59Z"
reviewed_head: "2740a89e003f7e1e1b2886f801d65aeee7647802"
review_base: "7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184"
reviewed_state_revision: "sha256:4eddfdb42a2b0ea647c0177e7c752e226fe3f36afd05f0a00b53968679c87ea5"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E4-S2
    artifact_version: 1
    content_revision: sha256:29614f7072dd3de5bb28de7820575eb6376a5a4cee8a29e821e3458a1d1877fc
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-28T22:08:59Z
  source_artifacts:
    - id: CAP-002-E4-S2
      version: "1 (sha256:29614f7072dd3de5bb28de7820575eb6376a5a4cee8a29e821e3458a1d1877fc)"
    - id: CAP-002-E4-S2-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E4-S2-tdd-evidence
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
    - id: DEC-0145
      version: "upheld 2026-10-18"
    - id: DEC-0146
      version: "upheld"
    - id: DEC-0147
      version: "upheld"
    - id: DEC-0148
      version: "upheld, 2026-10-18 amendment"
    - id: DEC-0149
      version: "upheld 2026-10-18"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 13/15 verified |
| Required validation | 7/8 passed |

The production code is correct for every behaviour the story and the plan specify,
with one narrow exception (IR-004). Every delivered file is unchanged and the full web
suite passes: 761 tests in 45 files, 352 of them delivered. Lint, format, `tsc` and
build are clean, and the TDD-evidence lint passes. `format.ts` rounds on the decimal
string, never through a float. `research-query.ts` maps each sentence to exactly one
of the twelve bounds through a single table. `copy.ts` holds every design string
verbatim, checked mechanically against the designs (below).

The gate fails on test strength. This reviewer ran 130 mutants: the catalogue's 69
and 61 written by hand. Nine non-equivalent mutants survived. Each changes behaviour
the task plan specifies, so the tests that should kill them are `WEAK` (skill step
E.9):

- six survivors read the last value of a repeated URL key, where T009 requires the
  first (IR-001);
- two leave stale `growth.*` or `momentum.*` keys behind when `applyResearchQuery`
  rewrites a URL, where T006 and T010 require every owned key to be overwritten or
  removed (IR-002);
- one sends `formatDate` through a UTC `Date` round trip, which the TC-COMP-071 date
  assertions do not detect, although T001 claims they prove "no conversion through
  `Date`" (IR-003).

These survivors make TC-COMP-071 `WEAK` and leave T001 and T006 `PARTIAL`. Two MEDIUM
findings and one LOW finding are also recorded:

- a percentile bound is compared as a float (IR-004);
- `failureSentence` composes retire-bearing sentences that the TC-COMP-072 scan never
  renders, and its own DEC-0145 rule would reject them (IR-005);
- T014's doc-comment clause is partly met (IR-006).

**By severity:** CRITICAL 0 · HIGH 3 · MEDIUM 2 · LOW 1 · **total 6**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S2` (ahead of `origin/main` by 1 commit) |
| HEAD | `2740a89e003f7e1e1b2886f801d65aeee7647802` ("feat(web): CAP-002-E4-S2 story coding — research screen format, query and copy modules") |
| Review base | `origin/main`, resolved by `pipeline-state.py review-base --base-ref origin/main` to merge base `7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184`, an ancestor of HEAD |
| Working tree | clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 22 |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/format.ts` | added | AC-9, DAC-E4-S2-3; T008, T014 |
| `web/src/screens/research/format.test.ts` | added | TC-COMP-071; T001, T005 |
| `web/src/api/research-query.ts` | added | AC-16, DAC-E4-3, DAC-E4-S2-1, DAC-E4-S2-2; T009, T010, T014 |
| `web/src/api/research-query.test.ts` | added | TC-COMP-132, TC-COMP-133; T002, T003, T006 |
| `web/src/screens/research/copy.ts` | added | DAC-E4-1, DAC-E4-S2-4; T011, T012 |
| `web/src/screens/research/copy.test.ts` | added | TC-COMP-072; T004, T007 |
| `.../stories/CAP-002-E4-S2-tasks.md` | modified | T001-T015 checkboxes only (15 × `[ ]` → `[x]`, word diff) |
| `.../stories/CAP-002-E4-S2.md` | modified | `status: planning` → `in-review` only (T013 permits the status line) |
| `.../stories/CAP-002-E4-S2-tdd-evidence.yaml` | added | T015 |
| `.../stories/CAP-002-E4-S2-evidence/cycle-1.patch`, `cycle-2.patch`, `cycle-3.patch` | added | T015 (`reviewed_patch` per cycle) |
| `.../stories/CAP-002-E4-S2-evidence/red-cycle-{1,2,3}.log`, `green-cycle-{1,2,3}.log`, `full-suite.log` | added | T015 (RED/GREEN logs) |
| `.../stories/CAP-002-E4-S2-evidence/mutation-cycle-{1,2,3}-results.json` | added | T015 (`mutation.results`) |

No delivered file under `web/src/app`, `web/src/api/client.ts`,
`classification-types.ts` or `classification-client.ts` differs from the base. No
module outside the three new files and their tests imports the new modules. T013
says nothing imports them yet; `grep` confirms this.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 (display side) | SATISFIED | `format.ts:75-82` `formatScore` (two decimals, signed, zero unsigned), `formatPercentile` (whole, no sign, no `%`); `copy.ts` `COMPARE.percentile`, `COMPARE.standardisedScore`, `SELECTION.footnote` | `format.test.ts` TC-COMP-071 block (lines 14-49) and edge cases (lines 53-111) | Percentile and standardised score both have a formatter and their labels; rendering the pair is S3 and later |
| AC-16 (sort, filter, selection controls) | SATISFIED | `research-query.ts:136-156` decode, `:162-197` apply and encode, `:233-258` `toListParams`; sort allowlist `:57-65` matches classification-api 2.4 | `research-query.test.ts` TC-COMP-132 round-trip rows (lines 60-104), sort-allowlist decode (lines 418-425) | This story owns only the URL model of the controls; the controls themselves are S5 to S7 |
| DAC-E4-1 | SATISFIED | `copy.ts:303-330` `CELL.incomplete`, `incompleteReason`, `notEnoughToRank`, `qualified(count, needed)`, `notFollowed`; `formatPercentile` whole number | `copy.test.ts` (d) anchors (lines 360-391) and templates (`CELL.qualified(12, 30)` → `12 qualified, 30 needed`, `incompleteReason` example) | The cell, bar and header rendering are S3 and S6; this story supplies the words and the number |
| DAC-E4-3 | SATISFIED | `research-query.ts` codec: sort, thresholds, scope, hide-incomplete and search all encoded and decoded; `copy.ts:341` `RESULTS.stocksMatch(count)` takes the server's count as an argument | TC-COMP-132 rows for every key; T006 tests | Reading `match_count` into the heading is S6 and S9 |
| DAC-E4-S2-1 | SATISFIED | `BOUNDS` table `research-query.ts:70-83` (one entry per measure × direction × factor); `sentenceToBound` `:200-205`; drop rules `:114-130` | `research-query.test.ts:102-104` (each of the 32 rows round-trips with `toEqual`), `:106-130` (12 distinct bounds, each alone), `:132-138` (101 dropped, no bound sent), `:284-301` (14 invalid inputs dropped) | The production code is correct for every enumerated case. A float-precision sliver above 100 is sent (IR-004, MEDIUM). Repeated-key and stale-key handling are plan details, not AC clauses (IR-001, IR-002) |
| DAC-E4-S2-2 | SATISFIED | `toThresholds` `research-query.ts:224-226` | `research-query.test.ts:167-196` (only the fourteen allowed keys; never scope, sort, order, universeId, limit or cursor; equal to the list read's filter for the T003 query and the default) | |
| DAC-E4-S2-3 | SATISFIED | `format.ts` string-arithmetic rounding `:26-72`; `formatRate` decimal shift `:90-92`; `formatTimestamp` `Intl.DateTimeFormat` America/Chicago with `hourCycle: "h23"` and `timeZoneName: "short"` `:107-130`; `formatDate` shape check and pass-through `:136-141` | `format.test.ts` exact strings `+1.27`, `-0.45` (U+002D asserted), `0.00`, `84`, `1.23`, `+12.40%`, `-5.00%`, `2026-10-15 17:46 CDT`, `2026-01-15 17:46 CST`; three-zone TZ block lines 155-174 | Production meets every clause. The date clause's test does not pin pass-through against a UTC `Date` round trip (IR-003) |
| DAC-E4-S2-4 | SATISFIED | `copy.ts`: every *retire*-bearing constant and template is in `UNIVERSE_LIFECYCLE` `:55-81`, per DEC-0145 | `copy.test.ts:130-173` runs 259 cases: 245 flattened catalogue strings, the scanner self-checks, and the no-stock/follow check on 12 `UNIVERSE_LIFECYCLE` strings | Vocabulary matches STD-UI-1 everywhere. Composed retire failure sentences sit outside the allow-list and outside the scan (IR-005, MEDIUM) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | PARTIAL | `format.test.ts:14-49` | Every DAC-E4-S2-3 clause has an exact assertion. The task's stated purpose for the date rows, "proving no conversion through `Date`", is not met: a UTC `Date` round trip survives (IR-003) |
| T002 | complete | VERIFIED | `research-query.test.ts:60-139` | Table covers 12 sentence rows, none, all three, universe scope, hide-incomplete, search, 14 sort rows, and everything at once. The one-to-one mapping is asserted with 12 distinct bounds, each alone in `toListParams`. The 101 drop is asserted |
| T003 | complete | VERIFIED | `research-query.test.ts:142-197` | All clauses, including the default-query E4-F11 form |
| T004 | complete | VERIFIED | `copy.test.ts:13-173` | Flattening, the `UNIVERSE_LIFECYCLE` allow-list read from the export, the DEC-0146 bare-score rules and every self-check string the plan names. The coverage gap on composed failure sentences is recorded as IR-005 (MEDIUM) |
| T005 | complete | VERIFIED | `format.test.ts:52-175` | Half-away-from-zero cases (`0.005`, `-0.005`, `1.005`, `9.995`), unsigned zero, percentiles, amounts, 11 non-decimal inputs across all five formatters, seconds form, midnight `00`, the autumn change, explicit offsets, and `Asia/Tokyo`, `UTC` and `America/Los_Angeles` |
| T006 | complete | PARTIAL | `research-query.test.ts:200-426` | Most clauses are pinned. Two are not: "every key the codec owns is overwritten or removed" holds only for `value.*` (IR-002), and the first-value rule for a repeated key holds only for `symbol` and `scope` (IR-001) |
| T007 | complete | VERIFIED | `copy.test.ts:176-527` | (a)-(f) present. The 28 anchors are verbatim. The routes file is read with `node:fs` and is unchanged |
| T008 | complete | VERIFIED | `format.ts:1-141` | No React, no runtime import. Deviation: `hourCycle: "h23"` replaces the hour `24` → `00` mapping (recorded in tdd-evidence cycle-1; same pinned output; killed by the reviewer's `h24` mutant) |
| T009 | complete | VERIFIED | `research-query.ts:21-156` | Types, `DEFAULT_RESEARCH_QUERY` and decode as specified. `FactorName` is imported, not redefined. No `window` and no `Date`. `scope=all` and absence decode to `null`, and no UUID check is made |
| T010 | complete | VERIFIED | `research-query.ts:158-258` | `applyResearchQuery` copies its input; `order` only when `desc`; `hide_incomplete` only `true`; `scope` never `all`; a single `BOUNDS` table; `toListParams` = `toThresholds` minus defaults plus scope, sort and paging |
| T011 | complete | VERIFIED | `copy.ts:34-216` | `SHELL_ROUTES` (download, `/runs`, `/instruments`); `ERROR_SENTENCES` over the 14 codes of classification-api 2.5; `FALLBACK_ERROR`; `Record`-typed `OPERATION_LABELS` and `RESOURCE_LABELS`. `failureSentence` never reads `message` or `name` |
| T012 | complete | VERIFIED | `copy.ts:218-540` | 157 constant strings checked against the five CAP-002 design files. Every one occurs verbatim except 12 of the 14 DEC-0149 operation labels (the other two are design sentences), `UNIVERSE_LIFECYCLE.retireFailed` (the same label) and `FALLBACK_ERROR`, which T011 and DEC-0149 provide for. Every fixed template fragment occurs in the designs, except the DEC-0149 per-code sentences. The latest-download sentences assemble UX 1.1's three alternatives (*is Downloading* / *ended Complete at {time}* / *ended Failed at {time}: {reason}*). `describeQuery` builds the three-part description from a `ResearchQuery` |
| T013 | complete | VERIFIED | `git diff --name-status origin/main...HEAD`; full suite | Only new files, the plan's checkboxes, the story status line and T015 evidence differ. `render.test.tsx` scans every `web/src` file, the new ones included, and passes |
| T014 | complete | VERIFIED | `npm run format`, `lint`, `tsc`, `test`, `build` all exit 0 | Every exported function and constant carries a doc comment. Exported type aliases carry none, and two formatters name a standard rather than the DAC (IR-006, LOW) |
| T015 | complete | VERIFIED | `CAP-002-E4-S2-tdd-evidence.yaml`; `check-tdd-evidence.py --require-logs` 0 errors | Three cycles, each with RED and GREEN logs, a reviewed patch, `diff_sha256`, `APPROVED`, `drift_detected: false`, `commit_hash: stage` and mutation results |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `format.test.ts` "TC-COMP-071: score, percentile, ratio, rate and date formatting" / TC-COMP-071 | WEAK | Exact-string assertions on wire-precision decimal strings, including `0E-10`. The hyphen-minus is asserted by code point. Zone abbreviations are checked in both seasons. Every catalogue mutant on `format.ts` is killed (one stillborn, effectively killed), as are 19 of 20 reviewer mutants, including local-zone date conversion, signed zero and a missing shift | The "dates unconverted" clause is not pinned against a UTC `Date` round trip, which returns `2026-03-01` for `2026-02-29` (IR-003) |
| `format.test.ts` "format.ts edge cases" (T005) | ADEQUATE | Rounding boundaries, carry (`9.995` → `10.00`), the invalid-input matrix across five formatters with messages asserted, midnight, DST change, offsets, three machine zones | none |
| `research-query.test.ts` "TC-COMP-132" / TC-COMP-132 | ADEQUATE | 32 round-trip rows with `toEqual`; the twelve-bound bijection; the invalid sentence dropped with no bound sent. Swapping a bound in the table, normalising a value or not writing scope is killed | none for the TC's clauses |
| `research-query.test.ts` "TC-COMP-133" / TC-COMP-133 | ADEQUATE | Key-set closure, exact object, scope/sort exclusion, agreement with the list read for two queries, the default-query E4-F11 form; `thresholds-from-list-params` mutant killed | none |
| `research-query.test.ts` "research-query codec edge cases" (T006) | WEAK | 14 drop rules, 6 accepted values, sort/order rules, symbol shape and upper-casing, the literal `true`, paging, and unknown keys kept on apply | Stale-key removal is asserted for `value.*` only: two mutants that leave `growth.*` or `momentum.*` survive (IR-002). The first-value rule is asserted for `symbol` and `scope` only: six last-value mutants survive (IR-001) |
| `copy.test.ts` "TC-COMP-072" / TC-COMP-072 | ADEQUATE | 259 cases: 245 flattened catalogue strings scanned for the forbidden words and DEC-0146 bare-score patterns; self-checks on 9 bad and 5 good strings; `UNIVERSE_LIFECYCLE` read from the export; no stock/follow in lifecycle strings | No plausible vocabulary regression escapes, because operation labels and per-code sentences are each scanned. The scan's definition of "owner-facing" omits composed failure sentences (IR-005, MEDIUM) |
| `copy.test.ts` "copy.ts completeness and keying" (T007) | ADEQUATE | Code keyset, fallback (with a real `ClassificationApiError` carrying leaked `message`), symbol order, `name` not read, labels per union, 28 verbatim anchors, 26 templated-example assertions, implementation vocabulary, routes from `routes.tsx` | none |

All mandatory tests carry `// Implements TC-COMP-0xx` traceability comments
(`format.test.ts:12`, `research-query.test.ts:59, 141`, `copy.test.ts:130`). Every
test is pure and deterministic. The only environment it touches is `process.env.TZ`,
saved and restored in `beforeEach`/`afterEach`. There is no network, no DOM and no
timer.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/format.test.ts web/src/api/research-query.test.ts web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files; 409 tests (72 + 41 + 296) passed |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 45 files, 761 tests passed (352 delivered + 409 new); includes `render.test.tsx`, shell and routes tests and the real-build test |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 106 files ... No fixes applied." |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 106 files ... No fixes applied." (check only) |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No diagnostics; S1's `classification-types.ts` resolves every type import |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules, written into ignored `src/factorflow/api/static/` with the same asset names already present |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | "0 error(s), 0 warning(s)". In the sandbox the first run reported `TDD-LINT-DIFF ... unable to create temporary file: Operation not permitted`. The same plain command (absolute paths) run outside the sandbox passed |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184..HEAD --cycle review --out $SCRATCHPAD/mut/mutants.json` plus 61 reviewer mutants (`"operator": "manual"`); `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCHPAD/mut/mutants.json --jobs 4 --command 'test -e node_modules \|\| ln -s $COMPONENT/node_modules node_modules; ./node_modules/.bin/vitest run src/api/research-query.test.ts src/screens/research/format.test.ts src/screens/research/copy.test.ts' --out $SCRATCHPAD/mut/results.json --work-root $SCRATCHPAD/mut/work` | harness root | 3 | FAIL | 130 mutants: 118 killed, 1 stillborn, 11 survived. 4 baselines green. Of the survivors, 2 are equivalent and 9 are not (IR-001, IR-002, IR-003). Results: `CAP-002-E4-S2-implementation-review-v1-mutation.json` |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the task plan's Validation Plan ("no screen exists"). The story's Technical Details list only the five npm/npx commands above. The change adds no screen or route, and no Playwright spec imports the new modules |
| `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv build` | — | N/A | NOT RUN | Not applicable: the change set touches no Python source, test or configuration |

`$SCRATCHPAD` stands for
`/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-49f4f9/c761c333-5a31-48fb-940a-231d21c5d8e8/scratchpad`.
`$COMPONENT` stands for the absolute path of `repos/factorflow-v2/FactorFlow-v2` in this
worktree.

**Mutation detail.** The catalogue generated 69 mutants: 47 `off-by-one`, 19
`negate-boolean`, 2 `drop-field-copy` and 1 `drop-defaulted-argument`. 68 were killed.
One was stillborn: `format.ts:31:off-by-one:2` reads `whole` from `match[3]`. Its log
shows 11 failing assertions and a `SyntaxError` from `BigInt("undefined00")`, which
the runner's stillborn pattern matched, so it is effectively killed. The reviewer
wrote 61 mutants: 20 on `format.ts`, 25 on `research-query.ts` and 16 on `copy.ts`.
50 were killed and 11 survived:

| Mutant | File | Change | Disposition |
|--------|------|--------|-------------|
| `manual:review:sentence-value-last-of-repeated` | `research-query.ts:125` | `params.getAll(valueKey).at(-1)` | non-equivalent: T009 "uses the first value of a repeated key" (IR-001) |
| `manual:review:sentence-measure-last-of-repeated` | `research-query.ts:123` | last `{factor}.measure` | non-equivalent (IR-001) |
| `manual:review:sentence-direction-last-of-repeated` | `research-query.ts:124` | last `{factor}.direction` | non-equivalent (IR-001) |
| `manual:review:sort-last-of-repeated` | `research-query.ts:146` | last `sort` | non-equivalent (IR-001) |
| `manual:review:order-last-of-repeated` | `research-query.ts:153` | last `order` | non-equivalent (IR-001) |
| `manual:review:hide-incomplete-any-of-repeated` | `research-query.ts:150` | `getAll("hide_incomplete").includes("true")` | non-equivalent (IR-001) |
| `manual:review:momentum-keys-not-owned` | `research-query.ts:94` | `FACTORS.slice(0, 2).flatMap(sentenceKeys)` | non-equivalent: T006/T010 "every key the codec owns is overwritten or removed" (IR-002) |
| `manual:review:growth-keys-not-owned` | `research-query.ts:94` | `FACTORS.filter((f) => f !== "growth")...` | non-equivalent (IR-002) |
| `manual:review:date-through-utc-date` | `format.ts:140` | `new Date(value).toISOString().slice(0, 10)` | non-equivalent: T008 "returns the `YYYY-MM-DD` string untouched after a shape check and never constructs a `Date`" (IR-003) |
| `manual:review:value-null-guard-removed` | `research-query.ts:126` | drop `\|\| value === null` | equivalent. `URLSearchParams.get` returns `null` only for an absent key, and `PLAIN_DECIMAL.test(null)` coerces to `"null"`, which fails, so the sentence is dropped as before. No input distinguishes the two. Agrees with the coder's cycle-2 disposition |
| `manual:review:download-route-unencoded` | `copy.ts:42` | `/runs/${runId}` without `encodeURIComponent` | equivalent against the contract. T011 specifies exactly `` (runId: string) => `/runs/${runId}` ``. Classification-ui 2.6 states run ids are UUIDs (migration `0004`), for which `encodeURIComponent` is the identity. The two differ only on run ids no artifact admits |

The killed reviewer mutants cover a wide range of failure modes:

- local-zone date conversion: killed by the `America/Los_Angeles` block;
- `hourCycle: "h24"`, `timeZoneName: "shortOffset"` and an America/Denver zone;
- an optional zone in `ISO_INSTANT` and a removed `Number.isNaN` check;
- half-up rounding for negatives, a signed zero, and an unshifted rate;
- a first-only thousands separator;
- `scope` compared case-insensitively, the symbol not upper-cased, any
  `hide_incomplete` value read as true, and `order` defaulting to `desc`;
- `applyResearchQuery` mutating its input, `order=asc` always written, and `scope`
  never written;
- swapped bounds, a normalised value and `symbol: null` sent;
- `failureSentence` reading `message` or `name`, or falling back for `null` only;
- `" & "`, `", "` and capitalised clauses in `describeQuery`.

### Validation Side Effects

- Before: HEAD `2740a89e003f7e1e1b2886f801d65aeee7647802`; `git status --porcelain=v1 --untracked-files=all` empty. Ignored build output was present in `src/factorflow/api/static/` (`index.html`, `index-BFn-kDOZ.js`, `index-DThMrqZv.js`, `index-Dy0VB8M_.css`).
- After: HEAD unchanged and porcelain status empty. The ignored static files were rebuilt under the same names. `code-revision` after validation was `sha256:4eddfdb42a2b0ea647c0177e7c752e226fe3f36afd05f0a00b53968679c87ea5`. Mutants ran in clones under `$SCRATCHPAD/mut/work`, never in the component repository.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | HIGH | initial | The first-value rule for a repeated URL key is pinned only for `symbol` and `scope` |
| IR-002 | HIGH | initial | `applyResearchQuery` removing stale `growth.*` and `momentum.*` keys is not pinned |
| IR-003 | HIGH | initial | TC-COMP-071's date assertions do not prove "no conversion through `Date`" |
| IR-004 | MEDIUM | initial | A percentile bound is range-checked through a float, so a value above 100 can be sent |
| IR-005 | MEDIUM | initial | Composed retire-universe failure sentences fall outside the `UNIVERSE_LIFECYCLE` allow-list and outside the TC-COMP-072 scan |
| IR-006 | LOW | initial | T014's doc-comment clause is met for functions and constants but not for exported types |

### IR-001 — The first-value rule for a repeated URL key is pinned only for `symbol` and `scope`

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S2-1, DAC-E4-3 (decode robustness; the AC clauses themselves are satisfied)
- **Tasks**: T006, T009
- **Files**: `web/src/api/research-query.ts:121-130` (`decodeSentence`, `params.get` for measure, direction, value), `:146` (`sort`), `:150` (`hide_incomplete`), `:153` (`order`); `web/src/api/research-query.test.ts:379-382` ("uses the first value of a repeated key")
- **Claim challenged**: T009 requires `decodeResearchQuery` to use "the first value of a repeated key" for every key it reads. The production doc comment repeats this ("a key repeated is read at its first value (DAC-E4-S2-1)"). The test named for the rule asserts it for `symbol=AA&symbol=BB` and `scope=u1&scope=u2` only.
- **Observed evidence**: Six reviewer mutants survive the three focused suites. They read the last value of `{factor}.value`, `{factor}.measure`, `{factor}.direction`, `sort` or `order`, or treat `hide_incomplete` as true when any repeated value is `true` (`manual:review:sentence-value-last-of-repeated`, `-measure-`, `-direction-`, `sort-last-of-repeated`, `order-last-of-repeated`, `hide-incomplete-any-of-repeated`). Each changes the decoded query for an input such as `value.measure=percentile&value.direction=atLeast&value.value=10&value.value=90`, or `sort=symbol&order=desc&order=asc`. The production code reads the first value; nothing fails if it stops doing so.
- **Expected evidence/behavior**: A test fails when any key the codec reads (`{factor}.measure`, `{factor}.direction`, `{factor}.value`, `hide_incomplete`, `sort`, `order`) is decoded from other than its first value (T009).
- **Impact**: A later refactor of the decode path, for example to a last-wins reading, would change which threshold, sort order or hide state a hand-edited or doubly-appended URL applies. The suite would stay green. Every Research story from S5 to S9 decodes through this module.
- **Required remediation**: Extend the repeated-key test so it covers the sentence keys, `sort`, `order` and `hide_incomplete`, with distinguishing first and later values, and kills the six mutants named above. Production code needs no change.

### IR-002 — `applyResearchQuery` removing stale `growth.*` and `momentum.*` keys is not pinned

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-3, DAC-E4-S2-1 (URL rewrite; the AC clauses themselves are satisfied)
- **Tasks**: T006, T010
- **Files**: `web/src/api/research-query.ts:92-99` (`OWNED_KEYS` from `FACTORS.flatMap(sentenceKeys)`), `:162-192` (`applyResearchQuery`); `web/src/api/research-query.test.ts:235-282` ("ignores unknown keys on decode and leaves them untouched on apply")
- **Claim challenged**: T006 requires that unknown keys are left untouched "while every key the codec owns is overwritten or removed". T010 requires a copy of `params` "with only the codec's owned keys rewritten or deleted".
- **Observed evidence**: The apply test's existing parameters carry `value.*`, `scope`, `hide_incomplete`, `symbol`, `sort` and `order`. They never carry `growth.*` or `momentum.*` keys that the new query omits. The reviewer mutants `manual:review:momentum-keys-not-owned` and `manual:review:growth-keys-not-owned` drop those factors from `OWNED_KEYS`, and both survive. Under either mutant, applying `DEFAULT_RESEARCH_QUERY` to `momentum.measure=percentile&momentum.direction=atLeast&momentum.value=50` leaves the momentum sentence in the URL, and the next decode restores it.
- **Expected evidence/behavior**: A test fails when an owned key of any of the three factors survives `applyResearchQuery` for a query that no longer sets it (T006, T010).
- **Impact**: *Clear filters* (CAP-002-E4-S5 T004 expects the URL to be exactly `sort=value_percentile&order=desc` afterwards) and removing a single sentence both rely on this removal. A regression for two of the three factors would pass this story's suite.
- **Required remediation**: Add assertions that `applyResearchQuery` removes each factor's three sentence keys when the new query omits that factor's sentence, killing both mutants. Production code needs no change.

### IR-003 — TC-COMP-071's date assertions do not prove "no conversion through `Date`"

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S2-3 ("dates unconverted"; production satisfies it), AC-9
- **Tasks**: T001, T008
- **Files**: `web/src/screens/research/format.ts:136-141` (`formatDate`); `web/src/screens/research/format.test.ts:44-48` (TC-COMP-071 date rows), `:147-153` (non-date shapes), `:155-174` (machine-zone block)
- **Claim challenged**: T001 says `formatDate` returns its input "for any ISO date including `"2026-03-08"` (the US daylight-saving change day), proving no conversion through `Date`". T008 says it "returns the `YYYY-MM-DD` string untouched after a shape check and never constructs a `Date` (STD-UI-5)".
- **Observed evidence**: The reviewer mutant `manual:review:date-through-utc-date` replaces `return value` with `return new Date(value).toISOString().slice(0, 10)`, and it survives every test in the three files. ECMAScript parses a date-only ISO string as UTC midnight, so the round trip is the identity on real calendar dates, the DST-change day included. It is not the identity on every string that passes the shape check. Node 22.19 gives `2026-02-29` → `2026-03-01` and `2026-04-31` → `2026-05-01`, and `2026-13-01` throws `RangeError: Invalid time value`. The local-zone variant (`toLocaleDateString("en-CA")`) is killed by the `America/Los_Angeles` block, so the suite catches the common bug but not this conversion.
- **Expected evidence/behavior**: The mandatory TC-COMP-071 date clause fails for any conversion of the date string through `Date`, as T001 claims. For example, assert that a shape-valid string no calendar has is returned untouched, which is what T008 specifies.
- **Impact**: STD-UI-5 and DEC-0147 forbid routing calendar dates through `Date`, because a conversion can move a session date. A regression that reintroduces `Date` would pass this story's suite, and S3, S7 and S9 import `formatDate`. The API emits only real dates, so no screen shows a wrong date today. Under skill step E.9, that limits the impact, not the severity.
- **Required remediation**: Strengthen the TC-COMP-071 date assertions so that `manual:review:date-through-utc-date` is killed, keeping the existing DST and machine-zone rows. Production code needs no change.

### IR-004 — A percentile bound is range-checked through a float, so a value above 100 can be sent

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S2-1 ("an invalid key is dropped, not sent"); DEC-0148 ("percentile 0 to 100"); classification-api 2.4 (percentile thresholds 0 to 100 inclusive, compared as `Decimal`)
- **Tasks**: T009
- **Files**: `web/src/api/research-query.ts:114-119` (`isValidValue`: `Number(value) >= 0 && Number(value) <= 100`)
- **Claim challenged**: The codec drops a percentile value outside 0 to 100 rather than sending it.
- **Observed evidence**: `decodeResearchQuery(new URLSearchParams("value.measure=percentile&value.direction=atLeast&value.value=100.00000000000000001"))` keeps the sentence, and `toListParams` sends `{"valuePercentileMin":"100.00000000000000001"}` (reviewer probe, Node 22.19 with type stripping). `Number` rounds the value to `100`. The API's `Decimal` comparison refuses the same string with `422 validation_error`. The codec otherwise keeps decimal strings exact; `format.ts` avoids floats for the same reason (DEC-0147).
- **Expected evidence/behavior**: A percentile string greater than 100 or less than 0 at any precision is dropped, as the API would refuse it. For example, compare the decimal string rather than its float value.
- **Impact**: This is reachable only through a URL carrying at least 17 significant digits just above 100. The list read then fails with a validation error instead of dropping the sentence, and the owner can clear it. No realistic threshold entry is affected, which is why this is MEDIUM rather than a failed acceptance criterion. Every value the plan, TC-COMP-132 and DEC-0148 enumerate (`-1`, `0`, `100`, `100.01`, `101`, `99.5`) is classified correctly.
- **Required remediation**: Make the percentile range check exact on the decimal string and pin it with a test just above 100 that a float cannot distinguish from 100.

### IR-005 — Composed retire-universe failure sentences fall outside the `UNIVERSE_LIFECYCLE` allow-list and outside the TC-COMP-072 scan

- **Severity**: MEDIUM
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S2-4 (as interpreted by DEC-0145)
- **Tasks**: T004, T012
- **Files**: `web/src/screens/research/copy.ts:131` (`OPERATION_LABELS["retire-universe"]` = `UNIVERSE_LIFECYCLE.retireFailed`), `:199-216` (`failureSentence`), `:161-188` (`ERROR_SENTENCES` templates prefixing `${action}`); `web/src/screens/research/copy.test.ts:44-54` (`failureSentence` rendered once, for `create-universe`), `:121-128` (`violations`: a *retire*-bearing string passes only if identical to an allow-listed string)
- **Claim challenged**: DEC-0145, as amended and upheld, makes the scan reject *retire* in every owner-facing string except those in `UNIVERSE_LIFECYCLE`. The group is to hold "every universe-lifecycle string containing retire ... template functions included". T012 says the same.
- **Observed evidence**: The reviewer rendered `failureSentence` over every operation × resource × code (the 14 codes, an unknown code and `null`) × two contexts, and applied the test's own rules. Of the 1,792 compositions, 88 are flagged as "retire outside UNIVERSE_LIFECYCLE". All 88 are `retire-universe` compositions, such as `Could not retire the universe: FactorFlow hit an unexpected problem. Try again.` for a 500, or the same prefix with the validation sentence for a 422. These are the strings the retire dialog will show. They contain *retire*, are not identical to any allow-listed string, and TC-COMP-072 never renders them. Their vocabulary is correct under STD-UI-1: *retire* applies to a universe, and no stock is named. The defect is the mismatch between the allow-list mechanism and what `copy.ts` emits.
- **Expected evidence/behavior**: Either the scan covers every string `copy.ts` can emit, including `failureSentence` across operations and codes, and the allow-list rule admits these sentences explicitly, or a recorded decision amends DEC-0145 to say how composed sentences with an allow-listed prefix are treated.
- **Impact**: CAP-002-E1-S9 (the retire dialog) will render these sentences. A later story that applies the DEC-0145 rule to rendered text, or extends this scan to compositions, will fail on wording this story produced. Meanwhile the scan's pass rests on not looking at them.
- **Required remediation**: Bring the scan and the allow-list rule into agreement for composed failure sentences, either by scanning the compositions with an explicit rule for allow-listed prefixes or by recording the treatment as a DEC-0145 amendment. No wording change is needed.

### IR-006 — T014's doc-comment clause is met for functions and constants but not for exported types

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014
- **Files**: `web/src/api/research-query.ts:21-22, 31-32, 34, 67` (`Measure`, `Direction`, `SortKey`, `Order`, `ResearchQuery`, `BoundKey` have no doc comment); `web/src/screens/research/format.ts:94, 132-135` (`formatAmount` and `formatDate` cite STD-UI-6 and STD-UI-5, not DAC-E4-S2-3)
- **Claim challenged**: T014 asks for "short doc comments on each export in `format.ts` and `research-query.ts` naming the DAC it serves".
- **Observed evidence**: Every exported function and constant has a doc comment, and the module headers name DAC-E4-3. The exported type aliases and the `ResearchQuery` interface have none; its fields are commented. Two formatters name only their standard.
- **Expected evidence/behavior**: Each export's comment names the DAC it serves (T014).
- **Impact**: Evidence quality only. Later stories import these types by name, and the module header already describes them.
- **Required remediation**: Add the missing one-line comments, or note in the plan that the module header covers the type aliases.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified**: T008's `hourCycle: "h23"` replaces the planned hour `24` → `00`
  mapping. It produces the same pinned midnight output on every engine (tdd-evidence
  cycle-1), and the reviewer's `h24` mutant is killed.
- **Justified**: `SHELL_ROUTES.download` wraps `runId` in `encodeURIComponent`, beyond
  T011's literal template. This is identical for the UUIDs the contract admits.
- **Justified**: `copy.test.ts` (e) scans for three implementation words beyond the
  plan's list (`item`, `object`, `record`). This is stricter than planned, with no
  conflict.
- **Justified**: The evidence directory, with patches, logs and mutation results, is
  not in T013's file list. T015 and `--require-logs` require it.
- **Bookkeeping**: All fifteen tasks are checked. T001 and T006 are `PARTIAL` on
  current evidence (IR-001, IR-002, IR-003). The coder's cycle mutation runs reported
  0, 1 (equivalent) and 0 survivors. They did not include the repeated-key,
  per-factor removal or UTC-date mutants this review added.
- **Out of scope**: None. No delivered file is modified, and nothing imports the new
  modules yet.
- **Design-text gaps** already recorded by the plan and carried, not findings:
  - Resolved Conflict 1 (story cites "section 2.8");
  - Resolved Conflict 2 (U+2212 in design prose, against ASCII in the AC);
  - Open Gap 4 / DEC-0148 (`scope` written absent, not `all`).

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, rework mode)
- **Required action**: Resolve IR-001, IR-002 and IR-003 with tests that kill the nine
  non-equivalent survivors in `CAP-002-E4-S2-implementation-review-v1-mutation.json`.
  No production change is needed for these three. Address IR-004 and IR-005, or
  record the decision to defer them, and optionally IR-006. Record the rework as a
  new TDD-evidence cycle, then rerun `$adversarial-review`. The next review takes
  this report as its baseline: `reviewed_head` `2740a89e003f7e1e1b2886f801d65aeee7647802`
  and the mutation file above.
- **Warnings accepted downstream**: N/A
