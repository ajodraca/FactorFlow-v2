---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-09
updated: 2026-11-09
story_id: "CAP-003-E8-S4"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-09T05:10:13Z"
reviewed_head: "867a8b1e48ad0fa248fa7835261cb437cd3c4157"
review_base: "eb912cb020f511a990ec681671d90a105b286112"
reviewed_state_revision: "sha256:c197765f7c3336da0db62b2bda83b8db492e1b5c049923dd1b130ce953496a5a"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-09T05:10:13Z
  source_artifacts:
    - id: CAP-003-E8-S4
      version: "1 (sha256:dd1f7bf07228fbdc2ac5c0254396e8cafb234e1b2558a971564c7b5c18e54cc9)"
    - id: CAP-003-E8-S4-tasks
      version: "1 (updated 2026-11-08)"
    - id: CAP-003-E8-S4-tdd-evidence
      version: "cycle-1"
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

# Implementation Review: CAP-003-E8-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 16/16 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 14/15 passed (the E.9 mutation gate failed: 3 survivors) |

Findings: CRITICAL 0 · HIGH 1 · MEDIUM 0 · LOW 0 · **total 1**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | HIGH | initial | OPEN |

The production change is correct. `runner.py:216-218` is the design's two comment lines and
`self._client.start_instrument()`, character for character as acquisition-runner CAP-003 §2.2
and T010 give them. The call sits after the `cancellation_requested` block and before
`# --- Fetch symbol ---`. No other production line, outcome value, column, timing value or
migration changed. `outcomes.py`, `journal.py`, `reclaim.py`, `writer.py`, `plan.py`,
`ingestion_main.py`, `config/`, `uv.lock` and `pyproject.toml` are untouched.

The new module drives both refusals end to end. It runs the real `MassiveClient`, governor, SDK
and urllib3 path at the default timing set. Its assertions are independent literals: call-name
lists, `[60.0] * 5`, reason prefixes, request counts and exact mark sequences. Every delivered
runner test is unchanged. The README subsection meets DAC-E8-S4-6 item by item. T014's
taxonomy text was already current at the base. The TDD-evidence lint is clean. My `r01`
mutant (the call deleted) reproduces the coder's RED split exactly: the same 8 tests fail and
the same 3 pass.

The gate fails on E.9 of the skill. Three non-equivalent mutants survive. Each changes which
stocks `start_instrument()` is called for on one of the loop's two other exits that send no
request:

- `r08` adds the call on the claim-lost exit.
- `r05` (the plan's M5) and `r12` (the coder's m12) drop the call for a stock skipped because
  its symbol is missing.

DAC-E8-7 and acquisition-runner §2.2 and §8 criterion 1 specify the call on both exits. It
comes once per stock, after the heartbeat and the cancellation check and before the symbol
lookup. So a stock whose claim is lost starts no budget, and a stock skipped at the symbol
lookup still gets its one call. TC-COMP-252 pins only the normal path and the
cancellation exit. The mandatory test is therefore `WEAK`, which is HIGH (IR-001). Nothing
observable at the provider or in the store differs today. That is the finding's Impact; it does
not lower the severity (skill E.9).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4.md` (status `in-review`, approved revision `sha256:dd1f7bf0…4cc51cbfaac`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tasks.md` (17 tasks, all checked) |
| TDD evidence | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tdd-evidence.yaml` (one cycle, `cycle-1`) |
| Component | `FactorFlow-v2` (project repo and component repo are the same) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S4` |
| HEAD | `867a8b1e48ad0fa248fa7835261cb437cd3c4157` (the story commit) |
| Review base | `eb912cb` (supplied by the invoking agent: the CAP-003-E8-S3 tip, local only), resolved by `pipeline-state.py review-base --base-ref eb912cb` to `eb912cb020f511a990ec681671d90a105b286112`, an ancestor of HEAD. The default merge-base with origin/HEAD is wrong here because the upstream chain is unpushed. |
| Working tree | clean: nothing staged, unstaged or untracked before validation |
| Changed files reviewed | 15 (1 production, 1 test, 1 README, 12 story documents and evidence) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/runner.py` | modified (+4) | DAC-E8-7, AC-30; T010 |
| `tests/integration/test_runner_provider_refusals.py` | added (+901) | AC-29, AC-30, DAC-E8-7 to -10, -19, -20, DAC-E8-S4-1 to -5, -7, -8; T002 to T009 |
| `README.md` | modified (+27) | DAC-E8-19, DAC-E8-S4-6; T013 |
| `…/stories/CAP-003-E8-S4.md` | modified (status `planning` → `in-review`) | Story-coding hand-off |
| `…/stories/CAP-003-E8-S4-tasks.md` | modified (17 boxes checked, no other edit) | Task state |
| `…/stories/CAP-003-E8-S4-tdd-evidence.yaml` | added | T017 |
| `…/stories/CAP-003-E8-S4-evidence/red-cycle-1.log` | added | T017 (RED) |
| `…/stories/CAP-003-E8-S4-evidence/green-cycle-1.log` | added | T017 (GREEN), T012 |
| `…/stories/CAP-003-E8-S4-evidence/phase4.log` | added | T011, T012 |
| `…/stories/CAP-003-E8-S4-evidence/full-suite.log` | added | T016 |
| `…/stories/CAP-003-E8-S4-evidence/docs-and-static-checks.log` | added | T013 to T015 |
| `…/stories/CAP-003-E8-S4-evidence/code-review-cycle-1.txt` | added | T017 (independent code review) |
| `…/stories/CAP-003-E8-S4-evidence/spec-drift-cycle-1.txt` | added | T017 (independent spec-drift review) |
| `…/stories/CAP-003-E8-S4-evidence/cycle-1.patch` | added | T017 (`reviewed_patch`) |
| `…/stories/CAP-003-E8-S4-evidence/mutation-cycle-1-results.json` | added | T017 (mutation block) |

`…/stories/` is `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/`.
No file in the change set lacks a story or task justification.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-29 | SATISFIED | E8-S1's `ProviderNotEntitled` path through `runner.py` fundamentals `except` (delivered); this story adds no change to it | `test_a_real_403_plan_refusal_is_sent_once_per_stock_and_the_download_finishes_partial`; `test_a_persistent_429_…[0.0/0.999]` (d) | One balance-sheets request per stock, `[not_entitled]` reason, run `partial`, through the real SDK and urllib3 path |
| AC-30 | SATISFIED | `runner.py:216-218` starts each stock's budget; E8-S2/S3 governor and `classify_for_governor` (delivered) | `test_a_persistent_429_…[0.0]`, `[0.999]`; `test_everything_throttled_finishes_failed_never_abandoned`; `test_each_throttled_stock_waits_its_own_full_budget` | No 429 is an attempt (6 reference requests at jitter 0.0); `[rate_limited]` on all four types; run `partial`/`failed`, never `abandoned` |
| DAC-E8-7 | SATISFIED | `runner.py:204-218`: `heartbeat`, claim check, `cancellation_requested`, then the call, then `_symbol_for_id` at `:222` | Both TC-COMP-252 tests; TC-COMP-254 (d) marks; T009 | Production correct on every path. The test pins the normal path and the cancellation exit only; the claim-lost and missing-symbol exits are unpinned (IR-001) |
| DAC-E8-8 | SATISFIED | No change to `outcomes.py`, migrations, `config/`, `journal.py` (`git diff --stat eb912cb HEAD` empty) | TC-COMP-253/254 (download continues to the next type and stock); TC-COMP-256 edge ×2 (credential fails at once) | Delivered credential case passes unchanged (full suite) |
| DAC-E8-9 | SATISFIED | As AC-29 | TC-COMP-253 | `req_403_` prefix, fixed suffix, 1 balance-sheets, 0 income or cash-flow, `partial` |
| DAC-E8-10 | SATISFIED | As AC-30 | TC-COMP-254 ×2, TC-COMP-255, T009 | Sleeps per interval ≤ 300 s and interval < 900 s at both jitters; one request per read after the budget is spent; the next stock starts fresh |
| DAC-E8-19 | SATISFIED | `README.md:1239-1265`; the runner only inserts (no `UPDATE` added) | TC-COMP-258 ×2 (`xmin` unchanged, literal reasons) | Upgrade notes name 0.2.0 and constraint 17 (a) to (d) |
| DAC-E8-20 | SATISFIED | n/a (test harness) | `_real_harness` (`test_runner_provider_refusals.py:293-358`) | Production `MassiveSettings` (3/300.0/900.0 asserted), one `FakeClock` as `monotonic` and `now`, only `_make_request` replaced |
| DAC-E8-S4-1 | SATISFIED | `runner.py:216-218` | `test_start_instrument_is_called_once_per_stock_after_its_heartbeat_and_cancellation_check`, `test_a_stock_cancelled_before_it_is_fetched_starts_no_budget` | Literal seven-name list ×2; cancellation gives one call and `cancelled`. The criterion's two givens are both tested; IR-001 concerns DAC-E8-7's other exits |
| DAC-E8-S4-2 | SATISFIED | As AC-29 | TC-COMP-253 | As specified, plus `KO` fully recorded and no sleeps |
| DAC-E8-S4-3 | SATISFIED | As AC-30 | TC-COMP-254 ×2 | (a) to (e) each asserted; (d) by mark order and request index, backed behaviourally by T009 |
| DAC-E8-S4-4 | SATISFIED | Delivered outcome rule (`journal.py`) | TC-COMP-255 | Four `[rate_limited]` rows, `failed` |
| DAC-E8-S4-5 | SATISFIED | n/a | Full suite: every delivered `tests/integration/test_runner_*.py` and `tests/unit/test_runner_*.py` passes; `git diff --stat` on them is empty | Credential case `test_runner_outcomes.py::test_rejected_credential_fails_the_run_with_its_reason` included |
| DAC-E8-S4-6 | SATISFIED | `README.md:1239-1265` | Validation Plan one-liner (exit 0); `tests/unit/test_readme_deployment.py` 3 passed unchanged; read against constraint 17 | See TC-COMP-257 row below |
| DAC-E8-S4-7 | SATISFIED | `git diff eb912cb HEAD -- runner.py` adds no `UPDATE` | TC-COMP-258 ×2; my `r06` (no-op `UPDATE`) killed by both | `xmin` makes even a no-op rewrite visible |
| DAC-E8-S4-8 | SATISFIED | n/a | `_fetch_result_rows` selects `instrument_id, data_type, outcome, reason`; `grep -nw attempts` finds only the seeded 0.2.0 reason text (lines 78, 814, 818) | Every request count reads `harness.transport.requests` |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Evidence header; `errors.py` `ProviderNotEntitled`/`ProviderRateLimited`, `rate_limit.py:124` `start_throttle_budget`, `client.py:100` `start_instrument` present at the base | `PYTHONPATH=src` resolves to this clone. The other checkout's `runner.py` has no `start_instrument`, so the GREEN of T003 proves which source was imported |
| T002 | complete | VERIFIED | `test_runner_provider_refusals.py:87-428` | Matches the plan. Justified extras: a responder factory (each download counts `req_403_` from 1), a `prepare` hook (T007) and `throttled` (T009) |
| T003 | complete | VERIFIED | `:521-584` | As planned, plus `succeeded` in test 1. The planned M1 to M4 are killed. The task is done as written; its TC is `WEAK` beyond the plan's kill list (IR-001) |
| T004 | complete | VERIFIED | `:592-628` | Characterization row, GREEN on arrival as planned |
| T005 | complete | VERIFIED | `:645-715` | (a) to (e) at both jitters; path checks compare the route exactly, which is stricter than the plan's "starts with" |
| T006 | complete | VERIFIED | `:723-747` | Fails RED on its planned `budget` mark (plan checkpoint inconsistency, see Deviations) |
| T007 | complete | VERIFIED | `:754-821` | `xmin` plus every column except the retry count, literal reasons, earlier run still `failed` |
| T008 | complete | VERIFIED | `:829-868` | Fails RED on its planned `start_instrument.call_count == 1` (see Deviations) |
| T009 | complete | VERIFIED | `:876-901` | Two full budgets, 6 reference requests per stock, 8 `[rate_limited]` rows, `failed` |
| T010 | complete | VERIFIED | `runner.py:216-218` | Exactly the planned lines and position |
| T011 | complete | VERIFIED | Full suite rerun, see Independent Validation; `git diff --stat` on the delivered runner tests and `tests/unit/` is empty | |
| T012 | complete | VERIFIED | ruff, format and mypy rerun clean; code diff is `runner.py` and the new module only | |
| T013 | complete | VERIFIED | `README.md:1239-1265` | Placement, release, (a) to (d), "no migration, new variable or manual action", procedure referenced not restated, no `docker compose` |
| T014 | complete | VERIFIED | `README.md:510`, `:534-544` at the base | Already satisfied by the E8-S1 and E8-S2 doc syncs (`201442b`, `52ecfbd`): "six typed", "six-type taxonomy", the fixed `not_entitled` text and `rate_limited` with `request_id=unavailable`. No edit was needed, and none was made |
| T015 | complete | VERIFIED | Both greps rerun, both print nothing | |
| T016 | complete | VERIFIED | `full-suite.log`; rerun independently | |
| T017 | complete | VERIFIED | Lint 0 errors 0 warnings with `--require-logs`; the cited log hashes match | The M5 and m12 "equivalent" dispositions are not accepted (IR-001) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_start_instrument_is_called_once_per_stock_after_its_heartbeat_and_cancellation_check` and `test_a_stock_cancelled_before_it_is_fetched_starts_no_budget` / TC-COMP-252 | **WEAK** | One parent `Mock` records the journal spies (wrapping the real functions) and the client, in one order. The tests compare literal name lists and pin the normal path and the cancellation exit. They kill `r01`-`r04`, `r07`, `r09`-`r11`, `r13`-`r16`. | Exits the tests never take survive. `r08` adds a call on the claim-lost exit. `r05` and `r12` drop the call for a stock whose symbol lookup fails. All three survive (IR-001) |
| `test_a_real_403_plan_refusal_is_sent_once_per_stock_and_the_download_finishes_partial` / TC-COMP-253 | ADEQUATE | Real SDK and urllib3 path. Reason prefix and fixed suffix, exact balance-sheets count, no income or cash-flow route, the other three types stored, `KO` fully recorded, no sleeps, `partial` | None. It is a characterization row; its kill (E8-S1's entitlement check) lies outside this diff |
| `test_a_persistent_429_stays_inside_the_staleness_window_and_finishes_partial[0.0]`, `[0.999]` / TC-COMP-254 | ADEQUATE | (a) Sleeps per heartbeat interval ≤ 300 s and < 900 s, with `[60.0] * 5` at jitter 0.0. (b) Literal `[rate_limited]` prefixes. (c) One request per read after the budget is spent. (d) Literal mark order plus "no request before a budget mark". (e) `partial`. Kills `r01`-`r04`, `r09`-`r11` and `r13`-`r16`. `r07` changes only the order against `cancellation_requested`, which these marks do not record, and TC-COMP-252 kills it | None of its own |
| `test_everything_throttled_finishes_failed_never_abandoned` / TC-COMP-255 | ADEQUATE | Four `[rate_limited]` rows, marks, `[[60.0] * 5]`, `failed` | None |
| `test_results_recorded_before_the_upgrade_are_never_updated[plan_refusal]`, `[throttled]` / TC-COMP-258 | ADEQUATE | Snapshot with `xmin` taken before and after, literal reasons, earlier run still `failed`; kills `r06` (no-op `UPDATE`) | None. The "byte for byte" wording is honoured without reading the retry column, as the plan's Resolved Conflict 1 directs |
| `test_a_rejected_credential_after_a_refusal_still_fails_the_download_at_once[not-entitled]`, `[rate-limited]` / TC-COMP-256 edge | ADEQUATE | `failed`, `[credential_rejected] symbol=AAPL data_type=prices ` prefix, no result rows, the second stock never started | None. `MagicMock` refusals are right here: DAC-E8-20 governs `403`/`429` responses, and this row tests the credential edge |
| Delivered runner suites / TC-COMP-256 | ADEQUATE | Pass unchanged in the full suite; `git diff --stat` empty | None |
| `test_each_throttled_stock_waits_its_own_full_budget` (T009, additional) | ADEQUATE | Behavioural proof that the next stock starts fresh: two full budgets and 6 reference requests each; kills `r01`, `r03`, `r04`, `r10` and `r14`-`r16` without the spy | None |
| README / TC-COMP-257 | ADEQUATE | Read against DAC-E8-S4-6 (a) to (d) and constraint 17; the plan's position one-liner exits 0; `test_readme_deployment.py` passes unchanged | None |
| Static checks / TC-COMP-259 | ADEQUATE | `_fetch_result_rows` never selects the retry column; `grep -nw attempts` finds only the seeded 0.2.0 reason text | None |

Isolation and determinism: each test gets its own database in one session `postgres:16`
testcontainer on a random port. The harness is built after the database fixture, so
`forbid_sockets` never blocks a psycopg connect. `RecordingMakeRequest` and the runner
monkeypatches are undone by `monkeypatch`. Time is the injected `FakeClock`, and jitter is
`SequenceJitter`. Three runs of the module agreed: the coder's, mine and the mutation baselines.

## Independent Validation

Harness root: `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/cool-blackburn-2ab918`.
Repo: `<harness>/repos/factorflow-v2/FactorFlow-v2`. This clone has no venv, so `<venv-python>` is
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python`,
always run from the clone root with `-o pythonpath=src`. The `uv run --isolated --offline
--all-extras --locked` commands use the locked environment. Docker and uv commands ran
outside the sandbox as single plain calls.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness | 0 | PASS | 8/8 checks passed |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story <story> --stage adversarial-review` | harness | 1 | (expected) | `BLOCKED`, because with the default base the TDD lint reaches E8-S3's unnamed commits. This is the wrong merge-base the invoking agent warned of |
| same, with `--base-ref eb912cb` | harness | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref eb912cb` | harness | 0 | PASS | `eb912cb020f511a990ec681671d90a105b286112`; `git merge-base --is-ancestor eb912cb HEAD` exits 0 |
| `python3 scripts/check-tdd-evidence.py --evidence <tdd-evidence.yaml> --repo-dir repos/factorflow-v2/FactorFlow-v2 --base eb912cb --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness | 0 | PASS | 0 errors, 0 warnings |
| `<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q -rA tests/integration/test_runner_provider_refusals.py` (the plan's focused command) | repo | 0 | PASS | 11 passed in 15.00s |
| `<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q tests/unit/test_readme_deployment.py tests/unit/test_massive_client_governor_integration.py tests/unit/test_massive_client_interface.py tests/unit/test_outcomes.py` | repo | 0 | PASS | 35 passed (the plan's Phase 5 command plus the client-side seams the call relies on) |
| `uv run --directory <repo> --isolated --offline --all-extras --locked pytest -q -p no:cacheprovider` (full suite, `postgres` included) | repo | 0 | PASS | 2701 passed, 2 warnings in 1081.81s. The count matches the coder's `full-suite.log`, and covers the 11 new rows and every Phase 4 file. Both warnings were already present: the `StarletteDeprecationWarning` from `fastapi/testclient.py` and the anyio `BlockingPortal` alias. The `postgres` tests ran in a testcontainers `postgres:16`, which was gone afterwards (`docker ps -a`) |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff check .` | repo | 0 | PASS | All checks passed |
| `uv run --directory <repo> --isolated --offline --all-extras --locked ruff format --check .` | repo | 0 | PASS | 286 files already formatted |
| `uv run --directory <repo> --isolated --offline --all-extras --locked mypy src` | repo | 0 | PASS | No issues in 61 source files |
| `uv build --directory <repo> --offline --out-dir <scratchpad>/e8s4-review/dist` | repo | 0 | PASS | sdist and wheel `factorflow-0.2.0` built outside the repo |
| The Validation Plan's DAC-E8-S4-6 `python3 -c` position and content one-liner | repo | 0 | PASS | Placement, release tag and date, both variables, both kinds, `[unavailable]`, the procedure named, no `docker compose` |
| `git diff eb912cb HEAD -- src/factorflow/ingestion/runner.py \| grep -nE '^\+.*\bUPDATE\b'` and `grep -nw attempts tests/integration/test_runner_provider_refusals.py \| grep -v 'consecutive attempts'` (T015) | repo | 1, 1 | PASS | Both print nothing |
| `git diff --stat eb912cb HEAD --` migrations, `config/`, `journal.py`, `reclaim.py`, `writer.py`, `plan.py`, `ingestion_main.py`, `outcomes.py`, `uv.lock`, `pyproject.toml`; and the ten delivered `tests/integration/test_runner_*.py` plus `tests/unit/` | repo | 0 | PASS | Both print nothing (DAC-E8-8, T011, DAC-E8-S4-5) |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range eb912cb..HEAD --cycle review --out <scratchpad>/e8s4-review/mutants.json`, plus 16 reviewer `manual` mutants (`<scratchpad>/e8s4-review/build_mutants.py`, each `old` asserted unique and each mutant compiled) | harness | 0 | PASS | 0 generated (the comment and call line give the catalogue nothing). Manual: `r01`-`r16`. `r01`-`r06` re-derive the plan's M1 to M6. `r09`, `r12`, `r13` and `r14` re-derive the coder's m10, m12, m11 and m9. Six are new: `r07` (call between the claim check and the cancellation check), `r08` (extra call on the claim-lost exit), `r10` and `r11` (call skipped for the last or the first stock), `r15` (call under a false guard) and `r16` (call only for a skipped symbol) |
| `python3 scripts/mutation-run.py run --repo-dir <repo> --mutants <scratchpad>/e8s4-review/mutants-with-manual.json --jobs 2 --timeout 600 --command "<venv-python> -m pytest -o pythonpath=src -p no:cacheprovider -q tests/integration/test_runner_provider_refusals.py" --out <scratchpad>/e8s4-review/results.json --logs <scratchpad>/e8s4-review/results-logs` | harness | 3 | **FAIL** | **13/16 killed, 3 survived**: `review-r05-call-after-symbol-lookup`, `review-r08-extra-call-on-claim-loss`, `review-r12-call-inside-reference-helper`. 0 stillborn, 0 timeout. Both baselines exited 0. `repo_head` `867a8b1`, empty tree patch. `r01` reproduces the RED split (8 failed, 3 passed, the same tests). Copied as `CAP-003-E8-S4-implementation-review-v1-mutation.json` |
| Phase 4 command of the Validation Plan | — | N/A | NOT RUN separately | It is a subset of the full suite run above, which includes every file it names |
| Frontend `npm`/`npx` commands (tech stack) | — | N/A | NOT RUN | The story touches no frontend file, and the plan lists none |
| `uv sync --all-extras` | — | N/A | NOT RUN | It would modify an environment. `uv run --isolated --locked` resolves the same lock without one |

Required validation counted: prerequisites, the state check, the review base, the TDD lint,
the focused module, the Phase 5 file, the full suite, ruff check, ruff format, mypy, the build,
the DAC-E8-S4-6 check, the T015 greps and the scope diffs pass. The mutation gate fails.

### Validation Side Effects

- Before: clean (`git status --porcelain=v1 --untracked-files=all` empty), HEAD `867a8b1`,
  `code-revision` `sha256:c197765f7c3336da0db62b2bda83b8db492e1b5c049923dd1b130ce953496a5a`.
  Docker: the production compose project `factorflow` (`factorflow-app-1`,
  `factorflow-ingestion-1`, `factorflow-postgres-1`) up 38 hours, 38 hours and 3 weeks.
- After: HEAD unchanged (`867a8b1…`). `code-revision` unchanged
  (`sha256:c197765f…96a5a`). The only untracked files are this report and its
  `-mutation.json`. The production compose project's three containers were still up, at their
  original uptimes (39 hours, 39 hours, 3 weeks). No testcontainer was left behind.
- Unexpected tracked-file changes: none. `uv build` writes its egg-info, which git ignores, and
  put its dist in the scratchpad. The mutation clones lived under `TMPDIR`. The live provider
  was never contacted: every request went to `RecordingMakeRequest`, and `forbid_sockets`
  was installed.

## Findings

### IR-001 — TC-COMP-252 pins the stock boundary on two of the loop's four exits: three non-equivalent mutants survive

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-7 (AC-30); DAC-E8-S4-1
- **Tasks**: T003, T017
- **Files**: `src/factorflow/ingestion/runner.py:204-229` (`execute_claimed` top-of-stock checkpoint and symbol lookup); `tests/integration/test_runner_provider_refusals.py:521-584` (TC-COMP-252); `CAP-003-E8-S4-tdd-evidence.yaml` `mutation.survivors`
- **Claim challenged**: The task plan (Other Notes, M5) and the TDD evidence record M5 and m12
  as equivalent. The plan says "whether its budget starts changes nothing a test can
  observe". The evidence says "pinning either placement there would pick one reading of
  DAC-E8-7". The code-review subagent accepted both.
- **Observed evidence**: My mutation run over the focused module kills 13 of 16 mutants. Three
  survive, each with 11 of 11 tests passing:
  - `review-r08-extra-call-on-claim-loss` adds `self._client.start_instrument()` before the
    `return` of the `if not hb_ok:` block (`runner.py:205-208`). A stock whose claim is lost
    then starts a budget before, and without, its `cancellation_requested` check.
  - `review-r05-call-after-symbol-lookup` (the plan's M5) moves the call below the `try:
    _symbol_for_id … except ValueError: … continue` block (`:220-229`). A stock skipped for a
    missing `instrument` row then never gets the call.
  - `review-r12-call-inside-reference-helper` (the coder's m12) moves the call to the first
    line of `_fetch_reference` (`:366`). The effect is the same as `r05`.

  The cause is the same for all three. TC-COMP-252 drives the normal path and the cancellation
  exit only (`_spied_parent` with a two-stock roster, cancelled through `_set_cancelling`). No
  test in the module makes `heartbeat` return `False`, and none passes an `instrument_id` with
  no `instrument` row. `test_runner_reclaim.py` drives the claim-lost exit, but no delivered
  test asserts on `start_instrument`.
- **Expected evidence/behavior**: Each of the three changes behaviour the contract specifies,
  so none is equivalent (skill E.9).
  - DAC-E8-7 says `acquisition-runner` "MUST call `start_instrument()` exactly once per stock,
    after that stock's `heartbeat` and `cancellation_requested` … so a stock that is never
    fetched starts no budget". `r08` calls it for a stock that is never fetched, and before
    its `cancellation_requested`.
  - On the skipped stock, the story Description and acquisition-runner §2.2 both place the
    call "after the delivered `heartbeat` and `cancellation_requested` checks and before the
    symbol lookup". §2.2 gives the code block and the sentence "before the symbol lookup".
    Design §8 criterion 1 requires the call "at the top of each stock … exactly once".
    `r05` and `r12` give that stock zero calls.
  - The ambiguity the evidence cites does not leave this open. §2.2 assigns DAC-E8-7's
    "a stock that is never fetched starts no budget" to the cancellation check: "The call sits
    after the cancellation check so a stock that is never fetched starts no budget, and before
    the symbol lookup so every provider request of the stock … is charged to one budget". The
    plan itself says "The design's placement before the lookup is kept as written".
  - The plan's claim that "nothing a test can observe" changes is incorrect. The client seam
    is observable, and TC-COMP-252's own parent-`Mock` technique would show the difference.
- **Impact**: No request is sent and no row is written differently today. `start_throttle_budget()`
  only zeroes `_throttle_spent`, and the next stock zeroes it again before its first request.
  Skill E.9 places that under Impact and does not lower the severity. The runner→client call
  sequence is the seam later stories build on. If `start_instrument()` gains a per-stock effect,
  or the claim-lost runner's client is reused, a stock that is never fetched would start a
  budget unnoticed. The mandatory test TC-COMP-252 is `WEAK`, which is at least HIGH (skill H).
- **Required remediation**: Make TC-COMP-252 pin DAC-E8-7 on the two exits it does not take, so
  that `r05`, `r08` and `r12` are killed. Then rerun the mutants and record the new cycle in the
  TDD evidence. Bounded result:
  1. **Claim lost before the second stock.** Follow the `_abandon_run` precedent in
     `tests/integration/test_runner_reclaim.py`, triggered from a first-stock client side
     effect as `_set_cancelling` is in test 2. The parent call names are then the seven-name
     first stock followed by `["heartbeat"]`, and `client.start_instrument.call_count == 1`.
  2. **A stock skipped for a missing symbol.** Use a roster that includes an `instrument_id`
     with no `instrument` row. Its iteration then records `heartbeat`, `cancellation_requested`
     and `client.start_instrument` with no `fetch_*`, as the story Description and §2.2 place
     the call before the lookup.

     If the owner instead reads DAC-E8-7 as giving that skipped stock no budget, that reading
     contradicts §2.2's placement. It needs an owner decision record under
     `docs/decision-records.md`. Then either the line moves and the test pins the decided
     behaviour, or the record states that the case is unspecified, which would make `r05` and
     `r12` equivalent with that record named.

  In either case, replace the evidence's "equivalent" dispositions for M5 and m12.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **RED split 8/3 instead of the plan's 4/4: justified, a plan inconsistency.** The Phase 2
  checkpoint and T017 predict that T006 and T008 pass on arrival. Those tasks' own assertions
  cannot hold without T010: T006's `["heartbeat", "budget", "finalise"]` marks and T008's
  `start_instrument.call_count == 1`. The RED log shows each failing only at that assertion,
  after the characterization assertions above it held: `:745` for T006 and `:868` for T008.
  My `r01` reproduces the same 8 failures and 3 passes. The RED is meaningful, and every
  failure is the missing call. The plan's checkpoint wording should be corrected at its next
  revision; no finding is raised against the coder.
- **`# Implements CAP-003 TC-COMP-NNN` markers instead of `# Implements TC-COMP-NNN`:
  justified.** CAP-001 already uses bare `TC-COMP-253` and `TC-COMP-254 through TC-COMP-259`
  (`tests/unit/test_run_states.py:8,34`; `tests/integration/test_run_constraints.py:8`). The
  prefix removes the collision, and E8-S1 to S3 set the precedent
  (`tests/unit/test_governor_retry.py`, `test_massive_retry.py` and others). No harness script
  or constitution rule parses the bare form.
- **M5 and m12 recorded as equivalent: not accepted.** See IR-001.
- **T014 satisfied before this story: justified.** The README section was already current at
  `eb912cb` (`201442b`, `52ecfbd`). The checked box records the outcome, and the evidence header
  says no edit was made.
- **Test-harness extras: justified.** The responder factory, `prepare` hook and `throttled`
  parameter serve T007 and T009 and add no behaviour. T009 carries no `# Implements` marker
  because it is an additional test with no TC id.
- **Out of scope, not reviewed as a defect:** the `ingestion_main.py` logging gap (the plan's
  Other Notes, *Logging*).
- **Release coupling:** E8-S3 and E8-S4 land and release together (owner decision 2026-11-08).
  Nothing in this change set creates a release artifact. This verdict blocks that joint release
  until IR-001 is resolved.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, rework), with
  `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S4-tasks.md`
  and this report.
- **Required action**: Resolve IR-001. Extend TC-COMP-252 to the claim-lost exit and the
  missing-symbol skip, or record the owner's decision on the skipped stock first. Kill `r05`,
  `r08` and `r12`, or record each with a named artifact that leaves it open. Append the rework
  cycle to the TDD evidence, then request implementation review v2. v2's baseline is this
  report, with `reviewed_head` `867a8b1` and `CAP-003-E8-S4-implementation-review-v1-mutation.json`.
- **Warnings accepted downstream**: N/A
