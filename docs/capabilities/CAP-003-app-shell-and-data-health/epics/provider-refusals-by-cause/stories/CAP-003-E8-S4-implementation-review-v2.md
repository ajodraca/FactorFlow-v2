---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-09
updated: 2026-11-09
story_id: "CAP-003-E8-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-09T06:23:31Z"
reviewed_head: "2d1078ffcf045673fa18c7012a5e2835dc160bbf"
review_base: "eb912cb020f511a990ec681671d90a105b286112"
reviewed_state_revision: "sha256:11c3f9f0e7a585f9c5201fe588b8f0a178fc7c24c2ab1e197b627c32b0935455"
verdict: PASS
review_subjects:
  - artifact_id: CAP-003-E8-S4
    artifact_version: 1
    content_revision: sha256:dd1f7bf07228fbdc2ac5c0254396e8cafb234e1b2558a971564c7b5c18e54cc9
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-09T06:23:31Z
  source_artifacts:
    - id: CAP-003-E8-S4
      version: "1 (sha256:dd1f7bf07228fbdc2ac5c0254396e8cafb234e1b2558a971564c7b5c18e54cc9)"
    - id: CAP-003-E8-S4-tasks
      version: "1 (updated 2026-11-09, last_reworked_review v1)"
    - id: CAP-003-E8-S4-tdd-evidence
      version: "cycle-1, cycle-2"
    - id: CAP-003-E8-S4-implementation-review
      version: "1 (baseline, reviewed_head 867a8b1)"
    - id: CAP-003-E8
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-component-design-acquisition-runner
      version: "1"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-acquisition-runner-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "2"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Implementation Review: CAP-003-E8-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 16/16 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 16/16 passed |

Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

v1's one finding, IR-001 (HIGH), is resolved. The rework commit `2d1078f` changes tests and
evidence only; `runner.py` is byte-identical at `867a8b1`, `d809d75` and `2d1078f` (blob SHA-256
`97a4c259…1d4f` at all three). It adds two TC-COMP-252 rows on the same parent-`Mock` technique:

- the claim lost during the first stock, so the second stock records `heartbeat` only and
  `start_instrument` is called once; and
- a roster with an `instrument_id` that has no `instrument` row, where a spy on
  `_symbol_for_id` sits on the same parent. Every stock, the skipped one included, records
  `heartbeat`, `cancellation_requested`, `client.start_instrument`, `symbol_lookup` in that order.

That is the placement acquisition-runner CAP-003 §2.2 and the story Description give ("after the
delivered `heartbeat` and `cancellation_requested` checks and before the symbol lookup").

My mutation run scoped against v1 kills all 20 mutants: v1's 16, now `carried`, and 4 new
`late` mutants of my own around the same exits. v1's three survivors die on the rows written
for them: `r08` on the claim-lost row, `r05` and `r12` on the missing-symbol row, each with 12
of 13 tests passing. The TDD-evidence lint is clean with `--require-logs`. The full suite
(postgres included), ruff, format, mypy and the build all pass on `2d1078f`.

The coder's choice to cite a rescored results file in cycle-1's mutation block is accepted as a
justified deviation (see *Scope and Plan Deviations*). No new finding was raised.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4.md` (status `in-review`; revision `sha256:dd1f7bf0…4cc9`, the approved revision, unchanged since v1) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tasks.md` (17 tasks, all checked; `last_reworked_review: CAP-003-E8-S4-implementation-review-v1.md`) |
| TDD evidence | `…/stories/CAP-003-E8-S4-tdd-evidence.yaml` (two cycles: `cycle-1`, `cycle-2`) |
| Component | `FactorFlow-v2` (project repo and component repo are the same) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S4` |
| HEAD | `2d1078ffcf045673fa18c7012a5e2835dc160bbf` (the rework commit) |
| Review base | `eb912cb` (supplied by the invoking agent: the CAP-003-E8-S3 tip, local only), resolved by `pipeline-state.py review-base --base-ref eb912cb` to `eb912cb020f511a990ec681671d90a105b286112`, an ancestor of HEAD. The default merge-base with origin/HEAD is wrong here because the upstream chain is unpushed |
| Working tree | clean: nothing staged, unstaged or untracked before validation |
| Changed files reviewed | 24 in `eb912cb..HEAD`: 1 production, 1 test, 1 README, 21 story documents and evidence (2 of them v1's report and mutation file). 11 of them changed since the baseline (13 less the 2 v1 files) |
| Baseline | v1 (`CHANGES-REQUIRED`), `reviewed_head` `867a8b1e48ad0fa248fa7835261cb437cd3c4157`, with `CAP-003-E8-S4-implementation-review-v1-mutation.json` |

### Changed Files

`…/stories/` is `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/`.
Files marked **Δ** changed since the baseline's `reviewed_head` (`git diff --name-status 867a8b1 HEAD`).

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/runner.py` | modified (+4), unchanged since v1 | DAC-E8-7, AC-30; T010 |
| `tests/integration/test_runner_provider_refusals.py` | added (+990); **Δ** +89 | AC-29, AC-30, DAC-E8-7 to -10, -19, -20, DAC-E8-S4-1 to -5, -7, -8; T002 to T009; Δ: v1 IR-001 (T003) |
| `README.md` | modified (+27), unchanged since v1 | DAC-E8-19, DAC-E8-S4-6; T013 |
| `…/stories/CAP-003-E8-S4.md` | modified (status `planning` → `in-review`), unchanged since v1 | Story-coding hand-off |
| `…/stories/CAP-003-E8-S4-tasks.md` | modified; **Δ** frontmatter only (`updated`, `last_reworked_review`) | Task state; story-coding G (review rework) |
| `…/stories/CAP-003-E8-S4-tdd-evidence.yaml` | added; **Δ** cycle-1 mutation block rescored, cycle-2 appended | T017; v1 IR-001 |
| `…/stories/CAP-003-E8-S4-evidence/red-cycle-1.log`, `green-cycle-1.log`, `phase4.log`, `full-suite.log`, `docs-and-static-checks.log`, `code-review-cycle-1.txt`, `spec-drift-cycle-1.txt`, `cycle-1.patch`, `mutation-cycle-1-results.json` | added, unchanged since v1 | T011 to T017 (cycle-1) |
| `…/stories/CAP-003-E8-S4-evidence/red-cycle-2.log` | added **Δ** | cycle-2 RED |
| `…/stories/CAP-003-E8-S4-evidence/green-cycle-2.log` | added **Δ** | cycle-2 GREEN |
| `…/stories/CAP-003-E8-S4-evidence/full-suite-cycle-2.log` | added **Δ** | T016 on the final bytes |
| `…/stories/CAP-003-E8-S4-evidence/code-review-cycle-2.txt` | added **Δ** | cycle-2 independent code review |
| `…/stories/CAP-003-E8-S4-evidence/spec-drift-cycle-2.txt` | added **Δ** | cycle-2 independent spec-drift review |
| `…/stories/CAP-003-E8-S4-evidence/cycle-2.patch` | added **Δ** | cycle-2 `reviewed_patch` |
| `…/stories/CAP-003-E8-S4-evidence/mutation-cycle-2-results.json` | added **Δ** | cycle-2 mutation block |
| `…/stories/CAP-003-E8-S4-evidence/mutation-cycle-1-rescored-results.json` | added **Δ** | cycle-1 mutation block (rescored) |
| `…/stories/CAP-003-E8-S4-implementation-review-v1.md`, `…-v1-mutation.json` | added (review commit `d809d75`) | This gate's v1 report and its mutation results |

No file in the change set lacks a story, task or review justification.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-29 | SATISFIED | E8-S1's `ProviderNotEntitled` path through the `runner.py` fundamentals `except` (delivered); this story adds no change to it | `test_a_real_403_plan_refusal_is_sent_once_per_stock_and_the_download_finishes_partial`; `test_a_persistent_429_…[0.0/0.999]` (d) | One balance-sheets request per stock, `[not_entitled]` reason, run `partial`, through the real SDK and urllib3 path |
| AC-30 | SATISFIED | `runner.py:216-218` starts each stock's budget; E8-S2/S3 governor and `classify_for_governor` (delivered) | `test_a_persistent_429_…[0.0]`, `[0.999]`; `test_everything_throttled_finishes_failed_never_abandoned`; `test_each_throttled_stock_waits_its_own_full_budget` | No 429 counts as an attempt (6 reference requests at jitter 0.0); `[rate_limited]` on all four types; run `partial`/`failed`, never `abandoned` |
| DAC-E8-7 | SATISFIED | `runner.py:203-229`: `heartbeat` (`:204`), the claim-lost `return` (`:205-208`), `cancellation_requested`, then the call (`:218`), then `_symbol_for_id` (`:222`) with its `continue` | The four TC-COMP-252 tests (`:535`, `:567`, `:601`, `:632`); TC-COMP-254 (d) marks; T009 | Now pinned on all four loop exits that precede a fetch: normal, cancellation, claim lost, missing symbol. Kills `r05`, `r08`, `r12` (IR-001) and the late `r17` to `r20` |
| DAC-E8-8 | SATISFIED | No change to `outcomes.py`, migrations, `config/`, `journal.py`, `reclaim.py`, `writer.py`, `plan.py`, `ingestion_main.py` (`git diff --stat eb912cb HEAD` on them is empty) | TC-COMP-253/254 (the download continues to the next type and stock); TC-COMP-256 edge ×2 (credential fails at once) | The delivered credential case passes unchanged (full suite) |
| DAC-E8-9 | SATISFIED | As AC-29 | TC-COMP-253 | `req_403_` prefix, fixed suffix, 1 balance-sheets, 0 income or cash-flow, `partial` |
| DAC-E8-10 | SATISFIED | As AC-30 | TC-COMP-254 ×2, TC-COMP-255, T009 | Sleeps per interval ≤ 300 s and interval < 900 s at both jitters; one request per read after the budget is spent; the next stock starts fresh |
| DAC-E8-19 | SATISFIED | `README.md` *Upgrading from 0.2.0* subsection; the runner only inserts (no `UPDATE` added) | TC-COMP-258 ×2 (`xmin` unchanged, literal reasons) | Upgrade notes name 0.2.0 and constraint 17 (a) to (d); unchanged since v1 |
| DAC-E8-20 | SATISFIED | n/a (test harness) | `_real_harness` | Production `MassiveSettings` (3/300.0/900.0 asserted), one `FakeClock` as `monotonic` and `now`, only `_make_request` replaced |
| DAC-E8-S4-1 | SATISFIED | `runner.py:216-218` | `test_start_instrument_is_called_once_per_stock_after_its_heartbeat_and_cancellation_check`, `test_a_stock_cancelled_before_it_is_fetched_starts_no_budget` | Literal seven-name list ×2; cancellation gives one call and `cancelled` |
| DAC-E8-S4-2 | SATISFIED | As AC-29 | TC-COMP-253 | As specified, plus `KO` fully recorded and no sleeps |
| DAC-E8-S4-3 | SATISFIED | As AC-30 | TC-COMP-254 ×2 | (a) to (e) each asserted; (d) by mark order and request index, backed behaviourally by T009 |
| DAC-E8-S4-4 | SATISFIED | Delivered outcome rule (`journal.py`) | TC-COMP-255 | Four `[rate_limited]` rows, `failed` |
| DAC-E8-S4-5 | SATISFIED | n/a | Full suite: every delivered `tests/integration/test_runner_*.py` and `tests/unit/test_runner_*.py` passes; `git diff --stat eb912cb HEAD` on them is empty | Credential case `test_runner_outcomes.py::test_rejected_credential_fails_the_run_with_its_reason` included |
| DAC-E8-S4-6 | SATISFIED | `README.md` subsection after *Upgrade, backup and rollback* | Validation Plan one-liner (exit 0); `tests/unit/test_readme_deployment.py` passes unchanged (full suite) | Unchanged since v1, where it was read against constraint 17 (a) to (d) |
| DAC-E8-S4-7 | SATISFIED | `git diff eb912cb HEAD -- runner.py` adds no `UPDATE` | TC-COMP-258 ×2; `r06` (no-op `UPDATE`) killed | `xmin` makes even a no-op rewrite visible |
| DAC-E8-S4-8 | SATISFIED | n/a | `_fetch_result_rows` selects `instrument_id, data_type, outcome, reason`; `grep -nw attempts` finds only the seeded 0.2.0 reason text (`:78`, `:903`, `:907`) | Every request count reads `harness.transport.requests` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Evidence header; the E8-S1 to S3 symbols present at the base | The GREEN of TC-COMP-252 proves this clone's source was imported: the other checkout's `runner.py` has no `start_instrument` |
| T002 | complete | VERIFIED | `test_runner_provider_refusals.py:87-499` | As v1. The rework adds `_abandon_run` (`:124-133`), copied in substance from `tests/integration/test_runner_reclaim.py:61-69` (same SQL), following the module's copy-don't-import convention |
| T003 | complete | VERIFIED | `:535-680` | The two planned tests plus the two IR-001 rows. The planned M1 to M4 are killed, and so are v1's survivors (IR-001) |
| T004 | complete | VERIFIED | `:683` | Characterization row, GREEN on arrival as planned |
| T005 | complete | VERIFIED | `:737` | (a) to (e) at both jitters |
| T006 | complete | VERIFIED | `:814` | Unchanged since v1 |
| T007 | complete | VERIFIED | `:858` | Unchanged since v1 |
| T008 | complete | VERIFIED | `:927` | Unchanged since v1 |
| T009 | complete | VERIFIED | `:966` | Unchanged since v1 |
| T010 | complete | VERIFIED | `runner.py:216-218` | Exactly the planned lines and position; unchanged since v1 |
| T011 | complete | VERIFIED | Full suite rerun; `git diff --stat eb912cb HEAD` on the delivered runner tests and `tests/unit/` is empty | |
| T012 | complete | VERIFIED | ruff, format and mypy rerun clean; the code diff is `runner.py` and the new module only | |
| T013 | complete | VERIFIED | `README.md` subsection | Unchanged since v1 |
| T014 | complete | VERIFIED | `README.md` *Massive provider failure reasons* at the base | Already satisfied by the E8-S1 and E8-S2 doc syncs, as v1 found; no edit made |
| T015 | complete | VERIFIED | Both greps rerun on `2d1078f`, both print nothing | |
| T016 | complete | VERIFIED | `full-suite-cycle-2.log` (2703 passed); rerun independently | |
| T017 | complete | VERIFIED | Lint 0 errors 0 warnings with `--require-logs`; cycle-2 appended with its own `diff_sha256`, `reviewed_patch`, RED and GREEN logs, reviews and mutation block | `cycle-2.patch` matches `git diff d809d75 2d1078f -- tests/integration/test_runner_provider_refusals.py` line for line (index lines aside). The equivalent dispositions v1 rejected are gone. The cycle-1 rescore is judged under *Scope and Plan Deviations* |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_start_instrument_is_called_once_per_stock_after_its_heartbeat_and_cancellation_check`, `test_a_stock_cancelled_before_it_is_fetched_starts_no_budget`, `test_a_stock_whose_claim_is_lost_before_it_is_fetched_starts_no_budget`, `test_a_stock_skipped_for_a_missing_symbol_starts_its_budget_before_the_symbol_lookup` / TC-COMP-252 | ADEQUATE | One parent `Mock` records the journal spies (wrapping the real functions), the client, and, in the fourth test, a `_symbol_for_id` spy patched where the runner looks it up. Each test compares a literal name list. The claim-lost row abandons the run from the first stock's last fetch, and the captured log shows `runner.py:207` "claim lost". It asserts `_ONE_STOCK + ["heartbeat"]`, one call and `abandoned`. The missing-symbol row uses id `second + 1000` (1002 in my run; each test gets its own database, so it is deterministic). It asserts the 8 + 4 + 8 sequence, 3 calls and the lookup arguments in roster order. Together they kill `r01` to `r05`, `r07` to `r20` | None. The two new rows go beyond TC-COMP-252's "None beyond the scenario". They pin DAC-E8-7 and §2.2 on exits the specification's scenario does not take, as v1 IR-001 required |
| `test_a_real_403_plan_refusal_is_sent_once_per_stock_and_the_download_finishes_partial` / TC-COMP-253 | ADEQUATE | Unchanged since v1: real SDK and urllib3 path; reason prefix and suffix, exact balance-sheets count, no income or cash-flow route, `partial` | None |
| `test_a_persistent_429_stays_inside_the_staleness_window_and_finishes_partial[0.0]`, `[0.999]` / TC-COMP-254 | ADEQUATE | Unchanged since v1: (a) to (e) | None |
| `test_everything_throttled_finishes_failed_never_abandoned` / TC-COMP-255 | ADEQUATE | Unchanged since v1 | None |
| `test_results_recorded_before_the_upgrade_are_never_updated[plan_refusal]`, `[throttled]` / TC-COMP-258 | ADEQUATE | Unchanged since v1; kills `r06` | None |
| `test_a_rejected_credential_after_a_refusal_still_fails_the_download_at_once[not-entitled]`, `[rate-limited]` / TC-COMP-256 edge | ADEQUATE | Unchanged since v1 | None |
| Delivered runner suites / TC-COMP-256 | ADEQUATE | Pass unchanged in the full suite; `git diff --stat` empty | None |
| `test_each_throttled_stock_waits_its_own_full_budget` (T009, additional) | ADEQUATE | Unchanged since v1 | None |
| README / TC-COMP-257 | ADEQUATE | Unchanged since v1; the position one-liner exits 0 and `test_readme_deployment.py` passes | None |
| Static checks / TC-COMP-259 | ADEQUATE | `grep -nw attempts` finds only the seeded 0.2.0 reason text | None |

Isolation and determinism are as in v1. Each test gets its own database in one session
`postgres:16` testcontainer on a random port. Time is the injected `FakeClock`, and jitter is
`SequenceJitter`. The two new rows use only the fixture connection and `monkeypatch`, which is
undone after each test. The module agreed across five runs, all 13 passed: my focused run, the
two mutation baselines, the coder's GREEN, and the full suite.

## Independent Validation

Harness root: `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/cool-blackburn-2ab918`.
Repo: `<harness>/repos/factorflow-v2/FactorFlow-v2`. This clone has no venv, so `<venv-python>` is
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python`,
run with `-o pythonpath=src` against the clone root. The `uv run --isolated --offline
--all-extras --locked` commands use the locked environment. Docker and uv commands ran outside
the sandbox as single plain calls. `<sp>` is this review's scratchpad,
`/private/tmp/claude-501/-Users-alvarodejodra-Projects-ai-agents--claude-worktrees-cool-blackburn-2ab918/cf10f361-cd9c-41a4-81da-9aaab2c4d910/scratchpad/e8s4-review-v2`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness | 0 | PASS | 8/8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review --base-ref eb912cb` | harness | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref eb912cb` | harness | 0 | PASS | `eb912cb020f511a990ec681671d90a105b286112`; `git merge-base --is-ancestor eb912cb HEAD` exits 0 |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base eb912cb --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness | 0 | PASS | 0 errors, 0 warnings |
| `<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q -rA --rootdir <repo> <repo>/tests/integration/test_runner_provider_refusals.py` (the plan's focused command) | repo | 0 | PASS | 13 passed in 6.77s |
| `uv run --directory <repo> --isolated --offline --all-extras --locked pytest -q -p no:cacheprovider` (full suite, `postgres` included) | repo | 0 | PASS | 2703 passed, 2 warnings in 1848.87s. The count matches the coder's `full-suite-cycle-2.log` (2701 at v1, plus the two new rows) and covers the 13 module rows, every Phase 4 file and `tests/unit/test_readme_deployment.py`. Both warnings were already present: the `StarletteDeprecationWarning` from `fastapi/testclient.py` and the anyio `BlockingPortal` alias. The `postgres` tests ran in a testcontainers `postgres:16`, which was gone afterwards (`docker ps -a`) |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff check .` | repo | 0 | PASS | All checks passed |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff format --check .` | repo | 0 | PASS | 286 files already formatted |
| `uv run --directory <repo> --isolated --offline --all-extras --locked mypy src` | repo | 0 | PASS | No issues in 61 source files |
| `uv build --directory <repo> --offline --out-dir <sp>/dist` | repo | 0 | PASS | sdist and wheel `factorflow-0.2.0` built outside the repo |
| The Validation Plan's DAC-E8-S4-6 `python3 -c` position and content one-liner | repo | 0 | PASS | Placement, release tag and date, both variables, both kinds, `[unavailable]`, the procedure named, no `docker compose` |
| `git diff eb912cb HEAD -- src/factorflow/ingestion/runner.py \| grep -nE '^\+.*\bUPDATE\b'` and `grep -nw attempts tests/integration/test_runner_provider_refusals.py \| grep -v 'consecutive attempts'` (T015) | repo | 1, 1 | PASS | Both print nothing |
| `git diff --stat eb912cb HEAD --` migrations, `config/`, `journal.py`, `reclaim.py`, `writer.py`, `plan.py`, `ingestion_main.py`, `outcomes.py`, `uv.lock`, `pyproject.toml`, the ten delivered `tests/integration/test_runner_*.py` and `tests/unit/` | repo | 0 | PASS | Prints nothing (DAC-E8-8, T011, DAC-E8-S4-5) |
| `git diff --stat 867a8b1 HEAD -- src`; `git show <rev>:src/factorflow/ingestion/runner.py \| shasum -a 256` for `867a8b1`, `d809d75`, `2d1078f` | repo | 0 | PASS | No production change since the baseline; the same runner blob at all three |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range eb912cb..HEAD --cycle review --out <sp>/mutants-generated.json`, plus 4 reviewer `manual` mutants (`<sp>/../e8s4-review-v2-scripts/build_mutants.py`, each `old` asserted unique and each mutant compiled) | harness | 0 | PASS | 0 generated (the comment and call line give the catalogue nothing). New manual mutants: `r17` (call between `heartbeat()` and the claim check), `r18` (extra call on the cancellation exit before `finalise`), `r19` (extra call on the missing-symbol exit before `continue`), `r20` (call below the lookup on the fetched path and inside its `except`, keeping one call per stock) |
| `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants <sp>/mutants-manual.json --since 867a8b1e48ad0fa248fa7835261cb437cd3c4157 --previous <stories>/CAP-003-E8-S4-implementation-review-v1-mutation.json --out <sp>/mutants-scoped.json` | harness | 0 | PASS | 20 mutants: 16 `carried` (v1's `r01` to `r16`), 4 `late` (`r17` to `r20`); 0 previous mutants no longer apply |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <sp>/mutants-scoped.json --jobs 2 --timeout 600 --command "<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q tests/integration/test_runner_provider_refusals.py" --out <sp>/results.json --logs <sp>/results-logs` | harness | 0 | PASS | **20/20 killed**, 0 survived, 0 stillborn, 0 timeout. Both baselines 13 passed. `repo_head` `2d1078f`, empty tree patch. Per-mutant logs: `r08` fails only the claim-lost row; `r05`, `r12`, `r19` and `r20` fail only the missing-symbol row; `r18` fails only the cancellation row; `r17` fails all four TC-COMP-252 rows. Copied as `CAP-003-E8-S4-implementation-review-v2-mutation.json` |
| Phase 4 command of the Validation Plan | — | N/A | NOT RUN separately | It is a subset of the full suite run above, which includes every file it names |
| Frontend `npm`/`npx` commands (tech stack) | — | N/A | NOT RUN | The story touches no frontend file, and the plan lists none |
| `uv sync --all-extras` | — | N/A | NOT RUN | It would modify an environment. `uv run --isolated --locked` resolves the same lock without one |

Required validation counted (16): prerequisites, the state check, the review base, the TDD lint,
the focused module, the full suite, ruff check, ruff format, mypy, the build, the DAC-E8-S4-6
check, the T015 greps, the scope diffs, the baseline delta check, mutant scoping and the mutation
run. All pass.

### Validation Side Effects

- Before: clean (`git status --porcelain=v1 --untracked-files=all` empty), HEAD `2d1078f`,
  `code-revision` `sha256:11c3f9f0e7a585f9c5201fe588b8f0a178fc7c24c2ab1e197b627c32b0935455`.
  Docker: the production compose project `factorflow` (`factorflow-app-1`,
  `factorflow-ingestion-1`, `factorflow-postgres-1`) up 39 hours, 39 hours and 3 weeks, plus
  four long-exited unrelated containers.
- After: HEAD unchanged (`2d1078f…`). `code-revision` unchanged (`sha256:11c3f9f0…5455`). Before this report was written, `git status --porcelain=v1 --untracked-files=all` was empty; the only files this review adds are this report and its `-mutation.json`. The production compose project's three containers were still up at their original uptimes (40 hours, 40 hours, 3 weeks; the hour rolled over during the 31-minute suite). No testcontainer was left behind.
- Unexpected tracked-file changes: none. `uv build` writes its egg-info, which git ignores, and
  put its dist in the scratchpad. The mutation clones lived under `TMPDIR`. The live provider
  was never contacted: every request went to `RecordingMakeRequest` with `forbid_sockets`
  installed, or to a `MagicMock` client.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH): TC-COMP-252 pinned the stock boundary on two of the loop's four exits; `r05`, `r08` and `r12` survived | RESOLVED | Two new TC-COMP-252 rows: `test_a_stock_whose_claim_is_lost_before_it_is_fetched_starts_no_budget` (`test_runner_provider_refusals.py:601`) and `test_a_stock_skipped_for_a_missing_symbol_starts_its_budget_before_the_symbol_lookup` (`:632`). They follow both items of v1's bounded remediation, with no owner decision needed: the second row pins §2.2's written placement. My scoped mutation run kills `r08` on the claim-lost row and `r05` and `r12` on the missing-symbol row; each log shows 1 failed, 12 passed. `runner.py` is unchanged, so this is a test-only fix of a test gap, as v1 judged it. The "equivalent" dispositions for M5 and m12 are gone from the TDD evidence: cycle-1 now records `survivors: []`, and cycle-2 kills both. The task plan's Other Notes still call M5 equivalent (see *Scope and Plan Deviations*) |

## Scope and Plan Deviations

- **Cycle-1's mutation block cites a rescored results file: justified, with a caveat.** The
  block now cites `mutation-cycle-1-rescored-results.json` (13/13, `results_sha256
  5eeea1b5…70cd`). The first scoring, `mutation-cycle-1-results.json` (11/13), is kept in the repo,
  and a YAML comment above the block names it with its hash `54980a32…171c`, which I recomputed.
  I accept the choice for four reasons:
  1. The two files hold the same 13 mutants. I compared their `old`/`new` pairs and they are
     identical.
  2. The production bytes match. The rescore ran at `d809d75`, whose `runner.py` is the same
     blob as cycle-1's commit, plus the cycle-2 test file (`tree_patch_sha256` `fc59425c…a324`,
     the same as `mutation-cycle-2-results.json`).
  3. The lint leaves no truthful alternative. `scripts/check-tdd-evidence.py:517-534` accepts a
     survivor only as `equivalent` or as an `exception` backed by a decision record. v1 refuted
     the first, and the second would invent an owner decision. Keeping the original block would
     have kept a disposition this gate had rejected.
  4. TEST-TDD-006 asks that no changed-line mutant survive at completion. The rescore shows that
     directly for cycle-1's own mutants.

  The caveat is that cycle-1's structured fields no longer describe what cycle-1's own test
  bytes killed. Only the comment and the results file's `repo_head` and `tree_patch_sha256`
  show the rescore ran after cycle-2's tests existed. Cycle-2's 25-mutant block already
  includes m5 and m12, so the rescore adds no kill evidence. It only replaces the rejected
  dispositions. No rule is broken, so this is recorded and not raised as a finding.
- **Cycle-2, a test-only cycle, records a full mutation block instead of `not_applicable`:
  justified.** story-coding C prescribes `not_applicable` for a cycle that changes no production
  behaviour. Here the cycle exists only to kill surviving production mutants, so scored results
  are stronger evidence. The lint accepts the block, and its 25 mutants all mutate `runner.py`.
- **The RED of cycle-2 is the survivors, not a failing test on HEAD: justified.** Both rows pin
  behaviour `runner.py` already delivers. `red-cycle-2.log` shows each survivor passing HEAD's
  TC-COMP-252 rows (exit 0) and failing the reworked file (exit 1) at the expected assertion
  (`:625` claim lost, `:671` missing symbol), with an unmutated control passing. My own run
  reproduces the same failing rows.
- **The task plan's Other Notes still record M5 as equivalent: a plan inconsistency, no finding.**
  The plan's M5 bullet ("whether its budget starts changes nothing a test can observe") is now
  contradicted by v1, the evidence and the missing-symbol row. The plan is the planning skill's
  artifact, and story-coding may not edit its content. The coder records this as a follow-up
  (cycle-2 `deviations` (3)). Correct it at the plan's next revision, along with v1's note on
  the Phase 2 checkpoint's 4/4 RED prediction.
- **TC-COMP-252's specification lists "None beyond the scenario" as edge cases.** The two new rows
  go beyond its scenario to pin DAC-E8-7 and acquisition-runner §2.2 on the claim-lost and
  missing-symbol exits, as v1 IR-001 required. `acquisition-runner-tests.md` could name these
  exits at its next revision. This is not drift: the cycle-2 spec-drift review and my own reading
  of §2.2, §8 criterion 1 and the story Description agree.
- **Code-review NIT left as is (cycle-2 `deviations` (4)):** the `_abandon_run` docstring reads
  "as … does" twice. Wording only.
- **Unchanged from v1:** the `# Implements CAP-003 TC-COMP-NNN` marker form, the test-harness
  extras, T014 satisfied before this story, and the out-of-scope `ingestion_main.py` logging gap.
- **Release coupling:** E8-S3 and E8-S4 land and release together (owner decision 2026-11-08).
  Nothing in this change set creates a release artifact. This verdict no longer blocks that joint
  release on this story's account.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`) with
  `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tasks.md`
  and this report.
- **Required action**: Run doc sync for CAP-003-E8-S4 against `2d1078f`. Separately, at the next
  revision of the task plan and of `acquisition-runner-tests.md`, correct the M5 note and name
  the claim-lost and missing-symbol exits under TC-COMP-252. These are not gate conditions.
- **Warnings accepted downstream**: N/A
