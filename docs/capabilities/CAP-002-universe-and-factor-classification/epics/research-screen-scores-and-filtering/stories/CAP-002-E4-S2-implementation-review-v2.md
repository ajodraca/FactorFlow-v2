---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
story_id: "CAP-002-E4-S2"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-10-28T22:41:05Z"
reviewed_head: "3a1498da65f03d6ece08cd3d84b51b0397e30ff1"
review_base: "7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184"
reviewed_state_revision: "sha256:e4fb8a8b38e44785c9538a4fb224342f539ff6a1efc4276727fa40e7d0293192"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-10-28T22:41:05Z
  source_artifacts:
    - id: CAP-002-E4-S2
      version: "1 (sha256:29614f7072dd3de5bb28de7820575eb6376a5a4cee8a29e821e3458a1d1877fc)"
    - id: CAP-002-E4-S2-tasks
      version: "1 (updated 2026-10-28, last_reworked_review v1)"
    - id: CAP-002-E4-S2-tdd-evidence
      version: "cycle-1 to cycle-4"
    - id: CAP-002-E4-S2-implementation-review
      version: "1 (baseline, reviewed_head 2740a89e003f7e1e1b2886f801d65aeee7647802)"
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
    - id: DEC-0226
      version: "provisional, open, owner_reviewed false"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E4-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 1 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 8/8 passed |

This is a re-review of the rework commit `3a1498d` against the v1 baseline
(`reviewed_head` `2740a89`). All six v1 findings are resolved on current evidence:

- **v1 IR-001, IR-002, IR-003** (HIGH): new assertions now kill all nine v1
  survivors. These are the six repeated-key mutants, the two per-factor
  stale-key mutants and the UTC `Date` round trip. They also kill four further
  variants this review added.
- **v1 IR-004**: the percentile range check now compares the decimal string
  exactly (`isPercentile`, BigInt whole part and an all-zero fraction). Every one
  of the 22 delta mutants on those lines is killed. The cycle-4 RED log shows the
  float check failing on `100.00000000000000001`.
- **v1 IR-005**: TC-COMP-072 now renders and scans all 1,792 `failureSentence`
  compositions (230 unique, 16 of them retire-universe). It applies the prefix
  rule of DEC-0226, a provisional agent decision.
- **v1 IR-006**: every export of `format.ts` and `research-query.ts` now names
  its DAC.

The full web suite passes: 772 tests in 45 files. Lint, format, `tsc`, build and
the TDD-evidence lint are clean. No delivered file changed.

This review ran 173 mutants: 123 carried, 22 delta and 28 late. 166 were killed
and 3 were stillborn. Each stillborn mutant's log shows failing assertions, so
each is effectively killed. 4 survived:

- 2 carried survivors, both equivalent, as v1 dispositioned them;
- 1 late survivor, equivalent;
- 1 late survivor, not equivalent (IR-001, MEDIUM).

No carried or delta survivor is non-equivalent, so no mandatory test is `WEAK`.
Two warnings are recorded and do not block:

- **IR-001** (MEDIUM, late): a prototype-named unknown error code is not pinned to
  the fallback sentence.
- **IR-002** (LOW, delta): DEC-0226's prefix rule is not reflected in the task
  plan's T004, and it applies to every scanned string, not only composed failure
  sentences.

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 1 · **total 2**

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2.md` |
| Task plan | `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S2-tasks.md` |
| Component | `FactorFlow-v2` (web interface, `web/src/`) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E4-S2` (ahead of `origin/main` by 3 commits: `2740a89` coding, `163ec56` review v1, `3a1498d` rework) |
| HEAD | `3a1498da65f03d6ece08cd3d84b51b0397e30ff1` ("fix(web): CAP-002-E4-S2 rework — address review v1 findings") |
| Review base | `origin/main`, resolved by `pipeline-state.py review-base` to merge base `7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184`, an ancestor of HEAD |
| Working tree | clean: no staged, unstaged or untracked non-ignored files before or after validation |
| Changed files reviewed | 29 since the review base, 14 of them since the baseline's `reviewed_head` |
| Baseline | v1 (`CAP-002-E4-S2-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `2740a89e003f7e1e1b2886f801d65aeee7647802`, mutation results `CAP-002-E4-S2-implementation-review-v1-mutation.json` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `web/src/screens/research/format.ts` | added (comment-only change since baseline) | AC-9, DAC-E4-S2-3; T008, T014 |
| `web/src/screens/research/format.test.ts` | added (changed since baseline) | TC-COMP-071; T001, T005 |
| `web/src/api/research-query.ts` | added (changed since baseline: `isPercentile`, doc comments) | AC-16, DAC-E4-3, DAC-E4-S2-1, DAC-E4-S2-2; T009, T010, T014 |
| `web/src/api/research-query.test.ts` | added (changed since baseline) | TC-COMP-132, TC-COMP-133; T002, T003, T006 |
| `web/src/screens/research/copy.ts` | added (unchanged since baseline) | DAC-E4-1, DAC-E4-S2-4; T011, T012 |
| `web/src/screens/research/copy.test.ts` | added (changed since baseline) | TC-COMP-072; T004, T007 |
| `.../stories/CAP-002-E4-S2-tasks.md` | modified | 15 checkboxes, `updated`, `last_reworked_review` (word diff against base) |
| `.../stories/CAP-002-E4-S2.md` | modified | `status: planning` → `in-review` only (T013 permits the status line) |
| `.../stories/CAP-002-E4-S2-tdd-evidence.yaml` | added (cycle-4 appended since baseline) | T015 |
| `.../stories/CAP-002-E4-S2-evidence/cycle-{1,2,3,4}.patch` | added (cycle-4 since baseline) | T015 (`reviewed_patch`) |
| `.../stories/CAP-002-E4-S2-evidence/red-cycle-{1..4}.log`, `green-cycle-{1..4}.log`, `full-suite.log`, `full-suite-cycle-4.log` | added | T015 (RED/GREEN logs) |
| `.../stories/CAP-002-E4-S2-evidence/mutation-cycle-{1..4}-results.json` | added | T015 (`mutation.results`) |
| `.../stories/CAP-002-E4-S2-implementation-review-v1.md`, `-v1-mutation.json` | added (commit `163ec56`) | Review v1 and its mutation results; unchanged since |

No delivered file under `web/src/app`, `web/src/api/client.ts`,
`classification-types.ts` or `classification-client.ts` differs from the base. No
module outside the three new files and their tests imports the new modules
(`grep`; the coverage screen's `./copy` imports are its own
`web/src/screens/coverage/copy.ts`).

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-9 (display side) | SATISFIED | `format.ts:75-82` `formatScore` (two decimals, signed, zero unsigned), `formatPercentile` (whole, no sign, no `%`); `copy.ts` `COMPARE.percentile`, `COMPARE.standardisedScore`, `SELECTION.footnote` | `format.test.ts:14-53` (TC-COMP-071), `:56-115` (edge cases) | Unchanged since baseline. Rendering the pair is S3 and later |
| AC-16 (sort, filter, selection controls) | SATISFIED | `research-query.ts:156-176` decode, `:182-217` apply and encode, `:253-278` `toListParams`; `SORT_KEYS` `:62-70` matches classification-api 2.4 | `research-query.test.ts:60-104` round-trip rows, `:478-485` sort allowlist | This story owns only the URL model of the controls |
| DAC-E4-1 | SATISFIED | `copy.ts:303-330` `CELL.incomplete`, `incompleteReason`, `notEnoughToRank`, `qualified(count, needed)`, `notFollowed` | `copy.test.ts:410-441` anchors, `:443-519` templates (`CELL.qualified(12, 30)` → `12 qualified, 30 needed`) | Cell and header rendering are S3 and S6 |
| DAC-E4-3 | SATISFIED | Codec encodes and decodes sort, thresholds, scope, hide-incomplete and search; `copy.ts` `RESULTS.stocksMatch(count)` takes the server's count | TC-COMP-132 rows; T006 tests incl. repeated keys `:389-413` and per-factor key removal `:415-442` | Reading `match_count` into the heading is S6 and S9 |
| DAC-E4-S2-1 | SATISFIED | `BOUNDS` `research-query.ts:76-89`; `sentenceToBound` `:220-225`; drop rules `:119-150`, percentile range now exact on the decimal string (`isPercentile` `:123-131`) | `research-query.test.ts:102-138`; drops `:284-306` (18 rows, incl. `100.00000000000000001`, `-0.00000000000000001`, `-0.5`, `%2B100.5`); accepts `:308-328` (11 rows, incl. `100.0000000000`, `099.99999999999999999`, `-0.00`, `+100`) | v1 IR-004's float sliver is closed: reviewer probe shows `100.00000000000000001` now sends `{}` |
| DAC-E4-S2-2 | SATISFIED | `toThresholds` `research-query.ts:244-246` | `research-query.test.ts:167-196` | Unchanged since baseline |
| DAC-E4-S2-3 | SATISFIED | `format.ts:26-72` string-arithmetic rounding; `formatRate` `:90-92`; `formatTimestamp` `:107-130`; `formatDate` `:137-142` shape check and pass-through | `format.test.ts:15-52` exact strings incl. U+002D; non-calendar dates `:48-51`; three machine zones `:159-178` | The date clause now kills the UTC `Date` round trip (v1 IR-003) |
| DAC-E4-S2-4 | SATISFIED | `copy.ts`: every *retire*-bearing constant and template is in `UNIVERSE_LIFECYCLE` `:55-81` (DEC-0145); `OPERATION_LABELS["retire-universe"]` is `UNIVERSE_LIFECYCLE.retireFailed` | `copy.test.ts:161-223`: catalogue scan, self-checks, lifecycle no-stock check, and the composed-failure scan `:200-211` (230 unique compositions, 16 retire-universe) | The composed scan uses DEC-0226's prefix rule (provisional). Its breadth and the plan's silence on it are IR-002 (LOW) |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `format.test.ts:14-53` | The date rows now include `2026-02-29`, `2026-04-31` and `2026-13-01`, so "proving no conversion through `Date`" holds. `manual:review:date-through-utc-date` is killed (was PARTIAL in v1) |
| T002 | complete | VERIFIED | `research-query.test.ts:60-139` | Unchanged; carried mutants on the table killed |
| T003 | complete | VERIFIED | `research-query.test.ts:142-197` | Unchanged |
| T004 | complete | VERIFIED | `copy.test.ts:13-223` | Deviation: the allow-list rule also admits `<UNIVERSE_LIFECYCLE string>: <remainder without retire>`, per DEC-0226 (provisional). This answers v1 IR-005, but T004's text was not updated (IR-002, LOW) |
| T005 | complete | VERIFIED | `format.test.ts:55-179` | Unchanged; all carried `format.ts` mutants killed |
| T006 | complete | VERIFIED | `research-query.test.ts:199-486` | First-value rule now asserted for every key the codec reads; owned keys of all three factors asserted removed. All eight v1 survivors and three reviewer variants are killed (was PARTIAL in v1) |
| T007 | complete | VERIFIED | `copy.test.ts:225-577` | (a)-(f) present. Prototype-named unknown codes are not exercised (IR-001, MEDIUM, late) |
| T008 | complete | VERIFIED | `format.ts:1-142` | Comment-only change since baseline (DAC named on `formatAmount`, `formatDate`). Deviation `hourCycle: "h23"` as justified in v1 |
| T009 | complete | VERIFIED | `research-query.ts:21-176` | Percentile drop rule now exact (`isPercentile` `:123-131`); BigInt handles every string `PLAIN_DECIMAL` admits, including a leading `+` and leading zeros |
| T010 | complete | VERIFIED | `research-query.ts:178-278` | Unchanged since baseline |
| T011 | complete | VERIFIED | `copy.ts:34-216` | Unchanged since baseline |
| T012 | complete | VERIFIED | `copy.ts:218-540` | Unchanged since baseline; v1's verbatim check stands |
| T013 | complete | VERIFIED | `git diff --name-status 7646ab7..HEAD`; full suite | Only the six new files, the plan's checkbox and frontmatter lines, the story status line and T015/review evidence differ |
| T014 | complete | VERIFIED | `npm run format`, `lint`, `tsc`, `test`, `build` exit 0; doc comments `research-query.ts:21-50, 72`, `format.ts:94, 132-136` | Every export now names its DAC (v1 IR-006) |
| T015 | complete | VERIFIED | `CAP-002-E4-S2-tdd-evidence.yaml` cycle-4; `check-tdd-evidence.py --require-logs` 0 errors | `cycle-4.patch` sha256 `8eae0dd…` equals `git diff 2740a89 HEAD -- web/` and the cycle's `diff_sha256`; `APPROVED`, `drift_detected: false`, `commit_hash: stage` |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `format.test.ts` "TC-COMP-071" / TC-COMP-071 | ADEQUATE | Exact strings on wire-precision decimals, hyphen-minus by code point, CDT/CST, and dates passed through. The non-calendar date rows make any `Date` round trip fail. All carried `format.ts` mutants are killed, including `date-through-utc-date` and `date-through-local-date` | none |
| `format.test.ts` "format.ts edge cases" (T005) | ADEQUATE | Rounding boundaries, carry, the invalid-input matrix, midnight, DST change, offsets, three machine zones | none |
| `research-query.test.ts` "TC-COMP-132" / TC-COMP-132 | ADEQUATE | 32 round-trip rows, the twelve-bound bijection, 101 dropped with no bound sent | none |
| `research-query.test.ts` "TC-COMP-133" / TC-COMP-133 | ADEQUATE | Key-set closure, exact object, scope/sort exclusion, agreement with the list read for two queries | none |
| `research-query.test.ts` "research-query codec edge cases" (T006) | ADEQUATE | Repeated keys checked first-wins for `{factor}.measure/.direction/.value` (value, growth), `sort`, `order`, `hide_incomplete`, `symbol`, `scope`. Each factor's owned keys removed. 18 drop rows and 11 accept rows bracket the percentile range at 0 and 100 beyond float precision. All 16 delta manual and 6 delta generated mutants on `isPercentile` are killed | none |
| `copy.test.ts` "TC-COMP-072" / TC-COMP-072 | ADEQUATE | Catalogue scan, 9 bad and 5 good self-checks, 4 new prefix-rule self-checks (`:192-197`), and the composed-failure scan over all 230 unique compositions. Lifecycle strings are checked to mention no stock or following | The prefix allowance reaches catalogue literals too (IR-002, LOW) |
| `copy.test.ts` "copy.ts completeness and keying" (T007) | ADEQUATE | Code keyset, fallback with a real `ClassificationApiError`, symbol order, labels, 28 anchors, templated examples, implementation vocabulary, routes from `routes.tsx` | Prototype-named unknown codes (IR-001; a late survivor, which does not make the test `WEAK`) |

Mandatory TC traceability comments are present: `format.test.ts:12`,
`research-query.test.ts:59, 141` and `copy.test.ts:161`. Every test is pure and
deterministic. `process.env.TZ` is saved and restored, and the tests use no
network, DOM or timers.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npx vitest run web/src/screens/research/format.test.ts web/src/api/research-query.test.ts web/src/screens/research/copy.test.ts` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3 files; 420 tests (82 + 297 + 41) passed |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 45 files, 772 tests passed; includes `render.test.tsx`, shell and routes tests and the real-build test |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 106 files in 31ms. No fixes applied." |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Checked 106 files in 20ms. No fixes applied." (check only) |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No diagnostics |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 63 modules; ignored `src/factorflow/api/static/` rebuilt with the same asset names |
| `python3 scripts/check-tdd-evidence.py --evidence <abs>/CAP-002-E4-S2-tdd-evidence.yaml --repo-dir <abs>/repos/factorflow-v2/FactorFlow-v2 --base 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184 --decisions-dir <abs>/projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | "0 error(s), 0 warning(s)". In the sandbox, the first run reported `TDD-LINT-DIFF … unable to create temporary file: Operation not permitted` for cycle-1 and cycle-4. The same plain command passed outside the sandbox |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 7646ab7aa5aa9fbe04bdc7279f8c2fe22155f184..HEAD --cycle review --out $SCRATCHPAD/mut2/generated.json`, plus 25 reviewer mutants (`"operator": "manual"`); `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants $SCRATCHPAD/mut2/combined.json --since 2740a89e003f7e1e1b2886f801d65aeee7647802 --previous …/CAP-002-E4-S2-implementation-review-v1-mutation.json --out $SCRATCHPAD/mut2/mutants.json`; `python3 scripts/mutation-run.py run --repo-dir <abs component> --mutants $SCRATCHPAD/mut2/mutants.json --jobs 4 --command 'test -e node_modules \|\| ln -s $COMPONENT/node_modules node_modules; ./node_modules/.bin/vitest run src/api/research-query.test.ts src/screens/research/format.test.ts src/screens/research/copy.test.ts' --out $SCRATCHPAD/mut2/results.json --logs $SCRATCHPAD/mut2/logs --work-root $SCRATCHPAD/mut2/work` | harness root | 3 | PASS | Exit 3 means survivors exist; the E.9 gate is met. 173 mutants (123 carried, 22 delta, 28 late): 166 killed, 3 stillborn, 4 survived. 4 baselines were green. No survivor is both carried or delta and non-equivalent. Results: `CAP-002-E4-S2-implementation-review-v2-mutation.json` |
| `npm run test:e2e` | — | N/A | NOT RUN | Excluded by the task plan's Validation Plan ("no screen exists"). The story's Technical Details list only the five npm/npx commands above. No route or screen is added |
| `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv build` | — | N/A | NOT RUN | Not applicable: the change set touches no Python source, test or configuration |

`$SCRATCHPAD` stands for
`/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-pipeline-factorflow-v2-cap-002-e4-49f4f9/c761c333-5a31-48fb-940a-231d21c5d8e8/scratchpad`.
`$COMPONENT` and `<abs>` stand for the absolute path of
`repos/factorflow-v2/FactorFlow-v2` and of the harness worktree root.

**Mutation detail.** Every mutant falls into one of three scopes:

- **Carried (123).** 63 are generated and 60 are v1's hand-written mutants. Seven
  v1 mutants no longer apply because their line was replaced by `isPercentile`.
  All nine v1 non-equivalent survivors are now killed.
- **Delta (22).** 6 are generated on `isPercentile` and 16 were hand-written by
  this review on the same lines. All 22 are killed. They cover:
  - `<= 100n`, and 100 accepted with any fraction or only with a nonzero fraction;
  - `< 99n`;
  - a negative zero integer with any fraction, the fraction alone, or every
    negative rejected;
  - the sign read from the BigInt, the negative branch skipped, and `+` treated
    as negative;
  - the zero-fraction test changed to `/^0+$/`, made unanchored, or made
    empty-only;
  - the float check restored, the range unchecked, and the check applied to
    scores.
- **Late (28).** 19 are generated on lines whose content is unchanged since v1.
  This review wrote 9 more: last-value `hide_incomplete`, `scope` and `symbol`;
  value keys not owned; the prototype lookup; a 17-character symbol; the retire
  label as a literal; a fallback `;`; and the date shape check removed.

Three mutants were stillborn: `research-query.ts:115:negate-boolean:1` (carried),
`research-query.ts:135:negate-boolean:1` (late) and
`format.ts:31:off-by-one:2` (carried). Each log shows failing assertions (36, 36
and 11 failed tests) with a runtime `SyntaxError` from `BigInt`, which the
runner's stillborn pattern matched, so each is effectively killed.

| Survivor | Scope | File | Change | Disposition |
|----------|-------|------|--------|-------------|
| `manual:review:value-null-guard-removed` | carried | `research-query.ts:146` | drop `\|\| value === null` | equivalent. `PLAIN_DECIMAL.test(null)` tests the string `"null"`, which fails, so the sentence is dropped as before. This agrees with v1 and the coder's cycle-2 and cycle-4 dispositions |
| `manual:review:download-route-unencoded` | carried | `copy.ts:42` | `/runs/${runId}` | equivalent against the contract. T011 specifies `` `/runs/${runId}` ``, and run ids are UUIDs (classification-ui 2.6), for which `encodeURIComponent` is the identity. This agrees with v1 |
| `manual:review:v2:retire-label-not-from-group` | late | `copy.ts:131` | literal `"Could not retire the universe"` instead of `UNIVERSE_LIFECYCLE.retireFailed` | equivalent. The value is the identical string, and DEC-0145 and the scan judge string values, not where a literal is written |
| `manual:review:v2:error-code-prototype-lookup` | late | `copy.ts:191` | `code in ERROR_SENTENCES` | non-equivalent: T007(a) and T011 require an unknown code to fall back. Late scope makes it at most MEDIUM, and it does not make its test `WEAK` (IR-001) |

### Validation Side Effects

- Before: HEAD `3a1498da65f03d6ece08cd3d84b51b0397e30ff1`, and
  `git status --porcelain=v1 -uall` was empty. Ignored build output was present
  in `src/factorflow/api/static/`.
- After: HEAD was unchanged. The porcelain status lists only this report and its
  `-v2-mutation.json`, both under `docs/`, which the fingerprint excludes.
  `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2`,
  run from the harness root, gives
  `sha256:e4fb8a8b38e44785c9538a4fb224342f539ff6a1efc4276727fa40e7d0293192`.
  That equals `commit_revision(HEAD)`, the fingerprint of a clean checkout of
  `3a1498d`.
  - An earlier call passed `--repo-dir .` from inside the component.
  - That call returned `sha256:26938b…`, the harness worktree's fingerprint,
    because the CLI changes directory to the harness root (`os.chdir(ROOT)`).
  - That value was discarded.
- The ignored static files were rebuilt under the same names. Mutants ran in
  clones under `$SCRATCHPAD/mut2/work`, and reviewer probes ran on copies under
  `$SCRATCHPAD/probe`. Nothing ran in the component repository.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Title |
|----|----------|-------|-------|
| IR-001 | MEDIUM | late | An unknown error code named like an `Object.prototype` member is not pinned to the fallback sentence |
| IR-002 | LOW | delta | DEC-0226's prefix rule is missing from the task plan, and the scan applies it to every string |

### IR-001 — An unknown error code named like an `Object.prototype` member is not pinned to the fallback sentence

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: N/A (DAC-E4-1 and DAC-E4-S2-4 are satisfied; this is T007(a) robustness)
- **Tasks**: T007, T011
- **Files**: `web/src/screens/research/copy.ts:190-192` (`isErrorCode`, `Object.hasOwn`), `:199-216` (`failureSentence`); `web/src/screens/research/copy.test.ts:280-300` ("(a) falls back to a generic sentence …")
- **Claim challenged**: T007(a) says "an unknown code falls back to a generic sentence that does not contain the code". T011 says `failureSentence` selects its sentence by `code`.
- **Observed evidence**:
  - The reviewer mutant `manual:review:v2:error-code-prototype-lookup` replaces `Object.hasOwn(ERROR_SENTENCES, code)` with `code in ERROR_SENTENCES`, and it survives all three focused suites.
  - In a probe (Node 22.19, type stripping, on a copy), production returns `Could not load the scores: FactorFlow hit an unexpected problem. Try again.` for the codes `toString`, `constructor` and `hasOwnProperty`.
  - Under the mutant, the same codes return `"[object Object]"`, the context object (not a string), and `false`.
  - The fallback tests exercise only `weird_code` and `null`.
- **Expected evidence/behavior**: A test fails when an unknown code that names an inherited `Object.prototype` property stops falling back (T007(a)).
- **Impact**: classification-api 2.5's codes are a closed snake_case set, and none collides with a prototype member, so no screen shows this today. A refactor to the common `in` idiom would still pass the suite. The lines are unchanged since the v1 baseline, so this is `late`. It does not block and does not make the T007 test `WEAK`.
- **Required remediation**: Assert that `failureSentence` returns the fallback sentence for at least one prototype-named code, such as `toString` or `constructor`, so that the mutant is killed. Production needs no change.

### IR-002 — DEC-0226's prefix rule is missing from the task plan, and the scan applies it to every string

- **Severity**: LOW
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: DAC-E4-S2-4 (as interpreted by DEC-0145 and DEC-0226)
- **Tasks**: T004
- **Files**: `web/src/screens/research/copy.test.ts:139-159` (`retireAllowed`, `violations`), `:213-215` (catalogue scan through the same `violations`); the task plan's T004, Open Gaps 1 and 7; `projects/factorflow-v2/decisions/DEC-0226.md` (uncommitted in the harness worktree, `status: open`, `owner_reviewed: false`)
- **Claim challenged**:
  - T004 says: "A string containing `retire` / `retired` / `retiring` passes only if it is identical to one of those strings".
  - `docs/unattended-mode.md` says a provisional decision's value is marked `PROVISIONAL` in the artifact. DEC-0226 names the task plan among its artifacts.
- **Observed evidence**:
  - Since the baseline, the task plan changed only in `updated` and `last_reworked_review`. T004 and the Open Gaps still state the identical-only rule.
  - The `PROVISIONAL` mark appears only in `copy.test.ts`'s doc comment and in the TDD evidence.
  - `retireAllowed` runs inside `violations`, which the catalogue scan uses as well. The prefix allowance therefore admits any scanned string of the form `<UNIVERSE_LIFECYCLE string>: <remainder without retire>`, not only `failureSentence` compositions.
  - A reviewer probe that reproduces the test's two rules checked two strings: `Retired: AAPL is no longer followed` and `Retire…: stop following AAPL`. The v1 rule flags both; the DEC-0226 rule passes both.
  - No current catalogue string has this form, so the scan passes for the right reason today. DEC-0226's decision text words the rule for "a retire-bearing string" in general, so the test is faithful to the record.
- **Expected evidence/behavior**: The plan states the rule the scanner enforces, and the allowance is no wider than the case DEC-0226 derives it for: a composed failure sentence whose only *retire* is the allow-listed operation label.
- **Impact**:
  - CAP-002-E1-S8 and CAP-002-E1-S9 add strings to `UNIVERSE_LIFECYCLE`. Their authors read T004 and see a stricter rule than the scanner enforces.
  - A later non-group string such as `Retired: …` that is about a stock would pass TC-COMP-072.
  - The owner's review of DEC-0226 is the natural point to settle this.
- **Required remediation**:
  - Record DEC-0226 in the plan, in T004 or in Open Gaps 1 and 7, marked `PROVISIONAL`.
  - Optionally, confine the prefix allowance to the composed `failureSentence` scan.
  - No wording change in `copy.ts` is needed.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | `research-query.test.ts:389-413` asserts first-wins for `{factor}.measure`, `.direction` and `.value` (value, growth), `sort`, `order` in both orders, and `hide_incomplete` in both orders. All six v1 mutants (`sentence-value/measure/direction-last-of-repeated`, `sort-last-of-repeated`, `order-last-of-repeated`, `hide-incomplete-any-of-repeated`) are killed, as are this review's `hide-incomplete-last-of-repeated`, `scope-last-of-repeated` and `symbol-last-of-repeated` |
| v1/IR-002 (HIGH) | RESOLVED | `research-query.test.ts:415-442`: clearing all three sentences leaves exactly `tab=history`, and keeping one factor removes the other two factors' three keys. `momentum-keys-not-owned`, `growth-keys-not-owned` and this review's `value-keys-not-owned` are killed |
| v1/IR-003 (HIGH) | RESOLVED | `format.test.ts:48-51` (`2026-02-29`, `2026-04-31`, `2026-13-01` returned untouched). `date-through-utc-date` is killed |
| v1/IR-004 (MEDIUM) | RESOLVED | `research-query.ts:119-139` `isPercentile` compares the decimal string. The drop and accept rows at `research-query.test.ts:293-297, 312-316` pin it. `red-cycle-4.log` shows the float check failing on `100.00000000000000001`. A probe sends `{}` for `100.00000000000000001`, `-0.00000000000000001` and `+100.5`, and keeps `100.0`, `-0`, `0100` and `99.9999999999999999999`, consistent with the API's `Decimal` 0..100 (classification-api line 264). All 22 delta mutants are killed |
| v1/IR-005 (MEDIUM) | RESOLVED | `copy.test.ts:106-123` renders every operation × resource × code (14 codes, unknown and absent) × two contexts: 1,792 compositions, 230 unique, 16 retire-universe. They are scanned at `:200-211` under DEC-0226's prefix rule, with self-checks at `:192-197`. DEC-0226 is a recorded provisional decision (`contained`). The residual plan and breadth gap is IR-002 (LOW) |
| v1/IR-006 (LOW) | RESOLVED | DAC-naming doc comments on `Measure`, `Direction`, `ThresholdSentence`, `SortKey`, `Order`, `ResearchQuery`, `DEFAULT_RESEARCH_QUERY` and `BoundKey` (`research-query.ts:21-50, 72`), and on `formatAmount` and `formatDate` (`format.ts:94, 132-136`) |

## Scope and Plan Deviations

- **Justified**: T004's allow-list rule now follows DEC-0226 (provisional, agent,
  `contained`). The DEC-0226 record is untracked in the harness worktree, so the
  driver must commit it with this run's records. The plan's silence on it is
  IR-002.
- **Justified**: The production change for v1 IR-004 (`isPercentile`) is within
  T009's "validates and drops per Open Gap 4" and DEC-0148's "percentile 0 to
  100". No other production behaviour changed: `format.ts` changed only in
  comments, and `copy.ts` is unchanged since the baseline.
- **Carried from v1**: `hourCycle: "h23"` for the hour-24 mapping, and
  `encodeURIComponent` in `SHELL_ROUTES.download`.
- **Bookkeeping**:
  - The TDD-evidence header still says "Three cycles" above four cycle entries.
  - `red-cycle-4.log` shows 416 tests and the GREEN log 420. Drop and accept rows
    were added after RED, following the cycle's code-review note.
  - The failing RED row is the IR-004 one. The final patch's sha256 equals the
    cycle's `diff_sha256`, and the lint passes. Neither point is a finding.
- **Out of scope**: none.
- **Design-text gaps** carried from v1, not findings: Resolved Conflict 1 (the
  story cites "section 2.8"), Resolved Conflict 2 (U+2212 in the design prose) and
  Open Gap 4 / DEC-0148 (`scope` written absent).

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`)
- **Required action**: Run doc sync for CAP-002-E4-S2.
  - IR-001 and IR-002 go back to the Coding Agent at the next touch of these
    files, or to the owner during DEC-0226's review.
  - The driver should commit this report, its `-v2-mutation.json`, and
    `projects/factorflow-v2/decisions/DEC-0226.md`.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW)
