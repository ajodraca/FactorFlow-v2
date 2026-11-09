---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E8-S2"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-09T00:54:42Z"
reviewed_head: "57d2332008eefde89a5f3a9eb1f88b5965e33edd"
review_base: "201442b37d064dddc5df1edb00c188b0e23b746f"
reviewed_state_revision: "sha256:b6adc0346c987cf0de770cd25183e6d5ff19813d4f7e2e39d9dfb8359d921542"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-003-E8-S2
    artifact_version: 1
    content_revision: sha256:4b4a4aafb4838112657f67af0962e6991c120f107a0e0d39ca63b7bd5d715e86
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-09T01:31:29Z
  source_artifacts:
    - id: CAP-003-E8-S2
      version: "1 (sha256:4b4a4aafb4838112657f67af0962e6991c120f107a0e0d39ca63b7bd5d715e86)"
    - id: CAP-003-E8-S2-tasks
      version: "1 (updated 2026-11-08, last_reworked_review CAP-003-E8-S2-implementation-review-v1.md)"
    - id: CAP-003-E8-S2-tdd-evidence
      version: "cycle-1, cycle-2, cycle-3"
    - id: CAP-003-E8-S2-implementation-review
      version: "1 (CHANGES-REQUIRED, reviewed_head 72c8a0e)"
    - id: CAP-003-E8
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-acquisition-runner
      version: "1"
    - id: CAP-003-rate-limit-governor-tests
      version: "1"
    - id: CAP-003-massive-client-tests
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

# Implementation Review: CAP-003-E8-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 11/11 passed |

Findings: CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 0 · **total 1**

| Finding | Severity | Scope | Status |
|---------|----------|-------|--------|
| IR-001 | MEDIUM | late | OPEN |

This is a re-review after one rework cycle. The baseline is review v1
(CHANGES-REQUIRED, `reviewed_head` `72c8a0e`). The rework commit `57d2332`
changes no production behaviour. `rate_limit.py` is byte-identical to v1's
head. The only production change is the `errors.py` module docstring
(IR-003). The commit adds two rows to `tests/unit/test_governor_retry.py`.

All three v1 findings are resolved, on evidence the reviewer reproduced:

- v1/IR-001: the new TC-COMP-237 row kills `review-reset-spent-on-raise`.
- v1/IR-002: the new production-clock row kills
  `review-throttled-at-from-wall-clock`.
- v1/IR-003: the docstring now matches massive-client CAP-003 §2.4 and §2.5.

The reviewer reran the baseline's 41 mutants (scope `carried`) and added 5 of
its own. All 41 carried mutants are killed, so no carried or delta mutant
survives. Three of the reviewer's new mutants survive. Each resets the spent
throttle total on a path other than the `ProviderRateLimited` raise: a `FATAL`
re-raise, attempt exhaustion, or any `RETRYABLE` outcome. These mutants are
not equivalent, because each lets one stock's throttle sleeps reach 540 s
between two starts (DAC-E8-5). But they mutate lines unchanged since v1's
head, and v1 could have run them just as well. They are scope `late`, so the
finding is MEDIUM and does not make a test `WEAK` (step H, *Re-review scope*).
The production code is correct on all three paths.

The TDD evidence lint is clean across three cycles. The three cycle patches rebuild HEAD's `src/` and `tests/` exactly from the base. Both cycle-3 REDs reproduce. Every focused suite passes, and so do the full suite (2661 passed, `postgres` included), lint, format, type check and build.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2.md` (status `in-review`, approved; revision `sha256:4b4a4aaf…5e86`, which equals `approval.reviewed_revision` and v1's `review_subjects`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2-tasks.md` (18 tasks, all checked; `last_reworked_review: CAP-003-E8-S2-implementation-review-v1.md`) |
| Component | `FactorFlow-v2` (project repo and component are the same repository) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S2` |
| HEAD | `57d2332008eefde89a5f3a9eb1f88b5965e33edd` (`fix(CAP-003-E8-S2): story-coding rework 1, pin the throttle budget across a raise and to the monotonic clock`) |
| Review base | `201442b` → `201442b37d064dddc5df1edb00c188b0e23b746f`, supplied by the invoking driver. `pipeline-state.py review-base --base-ref 201442b` resolves it, and `git merge-base --is-ancestor 201442b HEAD` holds. The default merge-base with the remote default branch is wrong for this unpushed chain (see v1) |
| Working tree | Clean at freeze: no staged, unstaged or untracked files. Only git-ignored caches, `build/` and `src/factorflow.egg-info/`. Three commits in `201442b..HEAD`: `72c8a0e` (story), `2c44be5` (review v1), `57d2332` (rework) |
| Changed files reviewed | 36 in `201442b..HEAD` (3 production, 6 test, 27 story documentation, evidence and review files). 13 changed since the baseline head `72c8a0e` (1 production, 1 test, 11 documentation and evidence) |
| Baseline | v1 (`CAP-003-E8-S2-implementation-review-v1.md`, CHANGES-REQUIRED, `reviewed_head` `72c8a0e0e48d653798bc632dc02cc8393e86ee61`, with `-mutation.json`) |

### Changed Files

Production and test files, whole story (`201442b..HEAD`). The changes since
the baseline are marked.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/rate_limit.py` | modified (unchanged since v1) | AC-30, DAC-E8-5, DAC-E8-6, DAC-E8-S2-8; T015 |
| `src/factorflow/ingestion/massive/errors.py` | modified (since v1: module docstring lines 18-23) | DAC-E8-4, DAC-E8-6, DAC-E8-S2-6; T013. The rework's docstring change is v1/IR-003 |
| `src/factorflow/ingestion/massive/__init__.py` | modified (unchanged since v1) | DAC-E8-S2-6; T014 |
| `tests/unit/test_governor_retry.py` | modified (since v1: +70 lines, two new tests at lines 468-493 and 633-672) | DAC-E8-S2-1 to S2-5, S2-8, DAC-E8-5; T006 to T012. The two rework rows are v1/IR-001 (T008) and v1/IR-002 (beside T012) |
| `tests/unit/test_massive_failure_reasons.py` | modified (unchanged since v1) | DAC-E8-S2-6; T002 |
| `tests/unit/test_massive_error_classification.py` | modified (unchanged since v1) | DAC-E8-S2-6; T004 |
| `tests/unit/test_massive_package_boundary.py` | modified (unchanged since v1) | DAC-E8-S2-6; T005 |
| `tests/unit/test_outcomes.py` | modified (unchanged since v1) | DAC-E8-8, DAC-E8-S2-7; T003 |
| `tests/unit/test_massive_retry.py` | modified (unchanged since v1) | T016 (Open Gaps 1, owner-confirmed 2026-11-08) |
| `…/stories/CAP-003-E8-S2.md` | modified (unchanged since v1) | Status `planning` → `in-review` |
| `…/stories/CAP-003-E8-S2-tasks.md` | modified (since v1: one frontmatter line) | Checkboxes; the rework adds `last_reworked_review: CAP-003-E8-S2-implementation-review-v1.md` (`git diff 72c8a0e..HEAD` shows no other change) |
| `…/stories/CAP-003-E8-S2-tdd-evidence.yaml` | added (since v1: header note and the `cycle-3` entry) | T018; rework cycle-3 |
| `…/stories/CAP-003-E8-S2-evidence/` (22 files; since v1: `cycle-3.patch`, `red-cycle-3.log`, `green-cycle-3.log`, `full-suite-cycle-3.log`, `mutation-cycle-3-results.json`, `code-review-cycle-3.txt`, `spec-drift-cycle-3.txt`) | added | T017, T018; cycle-3 |
| `…/stories/CAP-003-E8-S2-implementation-review-v1.md` and `-v1-mutation.json` | added (commit `2c44be5`) | The baseline review |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-30 | SATISFIED | `rate_limit.py` `execute` lines 159-197: `THROTTLED` never touches `attempts`; `ProviderRateLimited` is raised when the budget is spent. Unchanged since v1 | TC-COMP-235 to TC-COMP-242 rows; T012; the two rework rows | v1 rated it PARTIAL only through DAC-E8-5's two unpinned properties. Both are now pinned (v1/IR-001, v1/IR-002 resolved) |
| DAC-E8-4 | SATISFIED | `errors.py` `_ERROR_KIND_BY_TYPE` (six rows, `ProviderRateLimited: "rate_limited"`); `compose_failure_reason` exact-class lookup, unchanged | `test_each_of_the_six_kinds_composes_its_own_kind`, `test_rate_limited_reason_never_carries_the_credential`, `test_an_unlisted_subclass_of_a_listed_class_raises_type_error` | Carried mutants `plan-rate-limited-row-deleted`, `plan-rate-limited-kind-to-unavailable`, `review-rate-limited-gets-fixed-description` and `review-rate-limited-skips-redact` are killed |
| DAC-E8-5 | SATISFIED | `rate_limit.py` line 122 (`_throttle_spent = 0.0`), lines 124-128 (`start_throttle_budget`), lines 163-166 (charge after the permit, on `monotonic`), lines 177-182 (check before the wait, `>`; `throttled_at = self._monotonic()`) | T006, T008, T009, T012, the unchanged zero-stated-delay row; `test_a_spent_budget_stays_spent_for_every_execute_until_the_next_start`; `test_throttle_waits_are_charged_on_the_monotonic_clock_not_the_wall_clock` | "Charged across every `execute` call until the next start" is now pinned across a raise. "Measured from the start of the throttle sleep" is now pinned to `monotonic` with production-shaped clocks. Persistence across a `FATAL`, an exhausted-attempts or a `RETRYABLE` exit is unpinned. The code is correct there, and the gap is late (IR-001, MEDIUM) |
| DAC-E8-6 | SATISFIED | `rate_limit.py` line 179 `raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc`; `RETRYABLE` branch lines 184-195 and `FATAL` lines 173-174 as delivered; `errors.py` `class ProviderRateLimited(ProviderUnavailable)` | T007 (a) and (b); delivered fatal, retry-bound, backoff and pacing rows; T004 | Unchanged since v1 |
| DAC-E8-8 | SATISFIED | `outcomes.py` line 151, unchanged (`git diff --exit-code 201442b..HEAD -- src/factorflow/ingestion/outcomes.py` exits 0) | `test_provider_rate_limited_maps_to_failed_outcome` | `plan-unavailable-dropped-from-failed-tuple` killed |
| DAC-E8-S2-1 | SATISFIED | as DAC-E8-5 | `test_boundary_throttle_wait_exhausts_the_budget_and_raises` (`[60.0]`), `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` (`[10.0, 10.0]`), `test_zero_stated_delay_throttle_wait_is_bounded` unchanged | The IR-002 row derives `now` from the shared `FakeClock` plus a fixed offset, not one `FakeClock` as both clocks. This is a recorded, justified deviation from the *Given* (Scope and Plan Deviations) |
| DAC-E8-S2-2 | SATISFIED | as DAC-E8-6 | `test_spent_budget_raises_provider_rate_limited_from_the_last_exception`, `test_exhausted_attempts_raise_a_provider_unavailable_that_is_not_rate_limited` | |
| DAC-E8-S2-3 | SATISFIED | `start_throttle_budget`, instance `_throttle_spent` | `test_one_throttle_budget_spans_every_execute_until_the_next_start`; `test_a_spent_budget_stays_spent_for_every_execute_until_the_next_start` | `[60.0] * 5` totalling 300, then `[60.0]` after the restart. After a raise, a further `execute` raises after one send with no new sleep |
| DAC-E8-S2-4 | SATISFIED | check before the wait, line 178 | `test_jittered_boundary_waits_never_take_the_sleeps_past_the_budget` | |
| DAC-E8-S2-5 | SATISFIED | `RETRYABLE`, backoff and pacing unchanged | delivered rows, unedited bodies | `test_governor_backoff.py`, `test_governor_pacing.py`, `test_governor_settings.py` and `governor_fakes.py` are byte-identical to the base. The rework adds rows only after line 467 and after line 630 |
| DAC-E8-S2-6 | SATISFIED | `errors.py` class, row and `__all__`; `__init__.py` re-export | T002 (four tests), T004, T005 | |
| DAC-E8-S2-7 | SATISFIED | delivered `isinstance(error, (ProviderUnavailable, …))` branch | `test_provider_rate_limited_maps_to_failed_outcome` | |
| DAC-E8-S2-8 | SATISFIED | no `logging`, one `except BaseException`, an import of exactly two names, no hunk in `GovernorSettings` or `from_massive_settings` (base lines 54-78; the hunks are at 4, 20, 34, 42, 114, 137-159) | `test_governor_inspects_no_exception_and_logs_nothing`; delivered `test_governor_settings.py` | `plan-fatal-or-isinstance-rate-limited` killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Unchanged since v1. The evidence header records (a) to (d) and the 116-test baseline | |
| T002 | complete | VERIFIED | `test_massive_failure_reasons.py`, four tests from line 389 | Unchanged since v1 |
| T003 | complete | VERIFIED | `test_outcomes.py::test_provider_rate_limited_maps_to_failed_outcome` | Unchanged since v1 |
| T004 | complete | VERIFIED | `test_massive_error_classification.py::test_provider_rate_limited_is_a_retryable_provider_unavailable` | Unchanged since v1 |
| T005 | complete | VERIFIED | `test_massive_package_boundary.py::test_provider_rate_limited_is_identity_reexported_from_package` | Unchanged since v1 |
| T006 | complete | VERIFIED | Two delivered tests' expectations and `now=clock`; the zero-delay row untouched | Unchanged since v1 |
| T007 | complete | VERIFIED | (a) and (b) as planned | Unchanged since v1 |
| T008 | complete | VERIFIED | `test_one_throttle_budget_spans_every_execute_until_the_next_start`, plus the rework's `test_a_spent_budget_stays_spent_for_every_execute_until_the_next_start` (lines 468-493, `# Implements CAP-003 TC-COMP-237`) | The added row closes v1/IR-001 |
| T009 | complete | VERIFIED | `test_jittered_boundary_waits_never_take_the_sleeps_past_the_budget` | Unchanged since v1 |
| T010 | complete | VERIFIED | Comment only; delivered bodies unchanged | |
| T011 | complete | VERIFIED | `test_governor_inspects_no_exception_and_logs_nothing` | Unchanged since v1 |
| T012 | complete | VERIFIED | `test_retryable_backoff_and_its_permit_wait_are_not_charged_to_the_throttle_budget`, plus the rework's `test_throttle_waits_are_charged_on_the_monotonic_clock_not_the_wall_clock` (lines 633-672) under the same "what is charged" header | The budget is 119.5, not 120.0. This is a justified deviation accepted in v1. The added row closes v1/IR-002 |
| T013 | complete | VERIFIED | `errors.py` class, docstring, row and `__all__`; since v1 the module docstring (lines 18-23) also covers `ProviderRateLimited` | The rework closes v1/IR-003 |
| T014 | complete | VERIFIED | `__init__.py` import and `__all__`, in sorted order | Unchanged since v1 |
| T015 | complete | VERIFIED | `rate_limit.py` (a) line 37, (b) lines 46-48, (c) line 122, (d) lines 124-128, (e) lines 160-182, (f) the docstrings | Byte-identical to v1's head (`git diff --exit-code 72c8a0e..HEAD -- src/factorflow/ingestion/rate_limit.py` exits 0) |
| T016 | complete | VERIFIED | `test_massive_retry.py` `_governor()` budget 1.0 → 300.0 | Unchanged since v1 |
| T017 | complete | VERIFIED | `final-validation.log` and `full-suite-cycle-3.log`. The reviewer reran all of it (Independent Validation) | |
| T018 | complete | VERIFIED | Three cycles, all `commit_hash: stage`. `cycle-3` records the rework, its RED, GREEN, deviations, reviews and a 41-mutant block. The lint is clean with `--require-logs`. `cycle-1.patch`, `cycle-2.patch` and `cycle-3.patch` (sha256 `8bc13db8…7d2c`, equal to `diff_sha256`) applied in order to `git archive 201442b src tests` give a tree identical to `git archive HEAD src tests` (`diff -r` empty) | The cycle-3 code review is APPROVED and the spec-drift review reports no drift. Each is the second round after a wording fix the coder recorded |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-235 (two changed delivered rows plus the unchanged zero-delay row) | ADEQUATE | Exact sleep sequences and `ProviderRateLimited`. The zero-delay row pins that the retry's permit wait is charged. It kills `plan-check-after-wait`, `plan-charge-only-the-sleep`, `review-charge-before-permit`, `review-throttled-at-after-sleep`, `review-check-ignores-delay`, `review-stated-delay-unchecked` and the reviewer's new `review-v2-both-ends-on-wall-clock` | none |
| TC-COMP-236 (two tests) | ADEQUATE | `type(err) is`, literal message, `provider_request_id is None`, `__cause__ is raised[-1]`, two sends; a plain `ProviderUnavailable` after three sends | none |
| TC-COMP-237 (`test_one_throttle_budget_spans_every_execute_until_the_next_start`, `test_a_spent_budget_stays_spent_for_every_execute_until_the_next_start`) | ADEQUATE | Persistence across a successful `execute` and a raising one, the `>` boundary, and the restart. The new row spends the budget (`[60.0] * 5`, a raise on send 6) and then shows a further always-throttled `execute` with no new start: it raises after `after_raise.calls == 1`, with no new sleep. It kills `review-reset-spent-on-raise` (the reviewer reproduced 1 failed and 21 passed, only this row, `6 == 1`) and the reviewer's new `review-v2-auto-restart-spent-budget` | Persistence across a `FATAL`, an exhausted-attempts or a `RETRYABLE` exit is not exercised. The three `late` survivors do not make this test `WEAK` (IR-001, MEDIUM). The name says "every execute" but the row runs one further `execute`. That is enough to kill the mutant |
| TC-COMP-238 | ADEQUATE | Sum ≤ 300, and sum plus the independently computed declined delay > 300 | none |
| TC-COMP-239 | ADEQUATE | Delivered rows unchanged; they kill `plan-throttle-costs-an-attempt`, `review-drop-throttle-continue` and `plan-attempt-bound-off-by-one` | none |
| TC-COMP-240 (four tests) | ADEQUATE | Six literal reasons; credential redacted; both unlisted subclasses raise `TypeError`; subclass relation | none |
| TC-COMP-241 | ADEQUATE | `outcome`, `data_type`, `reason is r` | none |
| TC-COMP-242 | ADEQUATE | AST checks, unchanged since v1 | none |
| T004, T005 | ADEQUATE | Subclass, `__all__`, `is_fatal_for_governor` false; package identity | none |
| T012 (`test_retryable_backoff_and_its_permit_wait_are_not_charged_to_the_throttle_budget`) with the rework's `test_throttle_waits_are_charged_on_the_monotonic_clock_not_the_wall_clock` | ADEQUATE | T012 pins that the backoff and its permit wait are not charged and that `throttled_at` is cleared. The new row uses a monotonic `FakeClock` at 1000 s and `now = clock() + 1_793_999_000`, so the wall clock reads exactly 1,794,000,000 s, a whole minute. The two clocks advance together. The row asserts six sends, `[60.0] * 5` and `ProviderRateLimited`. It kills `review-throttled-at-from-wall-clock`: each charge is about −1.79e9 s, and the 20-send guard's `AssertionError` escapes `pytest.raises`. The reviewer reproduced 1 failed and 21 passed, only this row. The arithmetic is exact in binary floating point, so the row is deterministic | `review-v2-reset-spent-on-retryable` survives T012, because its second jitter value makes the declined wait 90 s under both HEAD and the mutant. That survivor is late (IR-001) |
| T016 fixture change | ADEQUATE | Unchanged since v1 | none |

All mapped TC-IDs for this story (TC-COMP-235 to TC-COMP-242) are
implemented. Each carries `# Implements CAP-003 TC-COMP-<n>`. The new IR-001
row carries `# Implements CAP-003 TC-COMP-237`. The new IR-002 row is an
additional test, like T012, and carries no TC marker. Every row is
deterministic: fake clocks, fake sleepers and scripted jitter, with no
network and no real time.

## Independent Validation

All commands ran from the harness root unless the table says otherwise.
Names used in the table:

- `VENV` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin` (the main checkout's environment). The clone has no `.venv`. A probe confirmed that `factorflow.ingestion.rate_limit` resolves to the clone's `src` under `-o pythonpath=src`.
- `COMPONENT` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/cool-blackburn-2ab918/repos/factorflow-v2/FactorFlow-v2`.
- `STORY_DIR` is `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories`.
- `SCRATCH` is the review session's scratchpad `review-e8s2-v2/`, outside every repository.
- `C1` is the plan's cycle-1 list: `tests/unit/test_massive_failure_reasons.py tests/unit/test_massive_error_classification.py tests/unit/test_massive_package_boundary.py tests/unit/test_outcomes.py`.
- `C2` is the plan's cycle-2 list: `tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py tests/unit/test_governor_pacing.py tests/unit/test_governor_settings.py tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py`.

The first row is the stage's state check. The rows after the required
validation are supporting evidence and are not counted in the Gate Summary.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story STORY_DIR/CAP-003-E8-S2.md --base-ref 201442b --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required`. `--stage story-coding` gives `COMPLETE — story status is in-review`. Without `--base-ref` the check reports `BLOCKED`, as v1 recorded |
| `python3 scripts/check-tdd-evidence.py --evidence repos/factorflow-v2/FactorFlow-v2/STORY_DIR/CAP-003-E8-S2-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 201442b --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings (three cycles) |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q C1` | COMPONENT | 0 | PASS | 86 passed |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q C2` | COMPONENT | 0 | PASS | 50 passed (v1: 48, plus the two rework rows) |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q C1 C2` (whole-story focused) | COMPONENT | 0 | PASS | 136 passed |
| `uv run --directory COMPONENT --isolated --offline --all-extras --locked pytest -p no:cacheprovider -q -rfE` (full suite, `postgres` tests included) | harness root | 0 | PASS | 2661 passed, 0 skipped, 0 failed in 2127.16 s, on CPython 3.12 with the locked packages in an isolated environment. That is v1's 2659 plus the two rework rows, and it matches the coder's `full-suite-cycle-3.log`. The 2 warnings are pre-existing deprecations (Starlette `httpx`, anyio `BlockingPortal`). The run went outside the sandbox for the Docker socket and the uv cache. The `postgres` tests ran against testcontainers PostgreSQL. The production compose project `factorflow` was not touched, and the live provider was not contacted |
| `uv build --directory COMPONENT --offline --out-dir SCRATCH/build` | harness root | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` into the scratchpad. Run outside the sandbox for the uv cache, after the full suite finished |
| `VENV/ruff check .` | COMPONENT | 0 | PASS | All checks passed |
| `VENV/ruff format --check .` | COMPONENT | 0 | PASS | 285 files already formatted |
| `VENV/mypy src` | COMPONENT | 0 | PASS | No issues found in 61 source files |
| T017 and story-specific checks: `grep -rn start_throttle_budget src`; `git diff --exit-code --stat 201442b..HEAD --` `client.py`, `outcomes.py`, `test_governor_backoff.py`, `test_governor_pacing.py`, `test_governor_settings.py`, `governor_fakes.py`, `uv.lock`, `pyproject.toml`; `git diff --exit-code 72c8a0e..HEAD --` `rate_limit.py`, `massive/__init__.py`, the story; `git diff -U0 201442b..HEAD -- src/factorflow/ingestion/rate_limit.py` hunk headers; a logging grep on that diff | COMPONENT | 0 / 0 / 0 / – / 1 | PASS | `start_throttle_budget` appears only at its definition, `rate_limit.py:124`. Every listed file is byte-identical to the base. `rate_limit.py`, `__init__.py` and the story are unchanged since v1. No hunk falls inside base lines 54-78 (`GovernorSettings`, `from_massive_settings`). No logging line was added or removed |
| Mutation gate: `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 201442b..HEAD --cycle review --out SCRATCH/generated.json`; 5 reviewer `manual` mutants added (`SCRATCH/add_manual.py`); `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants SCRATCH/with-manual.json --since 72c8a0e0e48d653798bc632dc02cc8393e86ee61 --previous repos/factorflow-v2/FactorFlow-v2/STORY_DIR/CAP-003-E8-S2-implementation-review-v1-mutation.json --out SCRATCH/mutants.json`; `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants SCRATCH/mutants.json --jobs 4 --timeout 180 --command 'VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q -x C1 C2' --out SCRATCH/results.json --logs SCRATCH/results-logs --work-root SCRATCH/work` | harness root | 0 / 0 / 3 | PASS | `generate`: 4 catalogue mutants, all in `rate_limit.py`, with the same ids as v1. `scope`: 46 mutants, 41 `carried` (the 4 catalogue mutants and v1's 37 manual ones, all still applying) and 5 `late` (the reviewer's new ones); 0 previous mutants dropped. `run`: four unmutated baselines passed, 136 tests each. 43 killed, 3 survived, all three `late` (IR-001). Exit 3 means survivors exist. No `carried` or `delta` mutant survives, so the gate does not block (step H). Results copied to `CAP-003-E8-S2-implementation-review-v2-mutation.json` (sha256 `7f54e9f2…952b`) |
| Survivor breadth: the same `run` with `--only` on the three survivors and `--command 'VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q -m "not postgres" tests --ignore=tests/unit/test_release_excludes_test_paths.py --ignore=tests/unit/test_distribution_contents.py' --out SCRATCH/results-wide.json` | harness root | 0 | supporting | Three unmutated baselines: 1697 passed, 1 skipped, 951 deselected. All 3 mutants survived with the same counts (`results-wide.json` sha256 `7f2e9ee6…af0e`). The two ignored files call `uv build`, which the sandbox's uv cache refuses inside a mutation clone. They contain no governor code |
| RED reproduction (`SCRATCH/red_repro.py`): `git archive HEAD` into one scratch copy per mutant, the mutant applied, then `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q -rf tests/unit/test_governor_retry.py` | SCRATCH | 1 / 1 / 0 / 0 / 0 | supporting | `review-reset-spent-on-raise`: 1 failed, 21 passed, only `test_a_spent_budget_stays_spent_…`. `review-throttled-at-from-wall-clock`: 1 failed, 21 passed, only `test_throttle_waits_are_charged_on_the_monotonic_clock_…`. Both match `red-cycle-3.log`. Each of the three late survivors: 22 passed |
| Late-survivor probe (`SCRATCH/probe/probe_late.py`, run in scratch copies of HEAD and of each survivor) | SCRATCH | 0 | supporting | See IR-001: HEAD keeps 300.0 s of throttle sleeps between two starts in every scenario. Each survivor reaches 540.0 s in its own scenario |

The required validation rows are the TDD lint, C1, C2, C1 with C2, the full
suite, the build, ruff check, ruff format, mypy, the T017 checks and the
mutation gate: 11/11 passed.

### Validation Side Effects

- Before: clean working tree at `57d2332` on `usr/alvaro-de-jodra/CAP-003-E8-S2`. Only ignored entries: `.hypothesis/`, `.mypy_cache/`, `.ruff_cache/`, `build/`, `src/factorflow.egg-info/` and `__pycache__/`. `pipeline-state.py code-revision`: `sha256:b6adc034…1542`.
- After: the only untracked files are this report and `CAP-003-E8-S2-implementation-review-v2-mutation.json`. The reviewer wrote both under `docs/`, which the code fingerprint excludes. `uv build` refreshed the git-ignored `build/` and `src/factorflow.egg-info/`. No `.venv` or `.pytest_cache` was created in the clone. Mutation clones, logs, RED reproductions, probes and build outputs went to the session scratchpad.
- Unexpected tracked-file changes: none. `pipeline-state.py code-revision` after validation: `sha256:b6adc0346c987cf0de770cd25183e6d5ff19813d4f7e2e39d9dfb8359d921542`, identical to the value recorded at freeze.

## Findings

### IR-001 — No test holds the spent budget across an `execute` that ends in `FATAL`, attempt exhaustion or a `RETRYABLE` outcome

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-5, AC-30 (TC-COMP-237)
- **Tasks**: T008, T012
- **Files**: `src/factorflow/ingestion/rate_limit.py` lines 173-174 (`FATAL` re-raise), 188 (`attempts += 1`), 189-192 (attempt exhaustion); `tests/unit/test_governor_retry.py` TC-COMP-237 rows and T012
- **Claim challenged**: The cycle-3 evidence says the rework pins that "raising
  `ProviderRateLimited` does not release the stock's budget". Taken together,
  the TC-COMP-237 rows claim one budget spans every `execute` between two
  starts.
- **Observed evidence**: The reviewer added three mutants. Each inserts
  `self._throttle_spent = 0.0` on a path that leaves the throttle branch:
  - `review-v2-reset-spent-on-fatal`: before the `FATAL` `raise`, line 174.
  - `review-v2-reset-spent-on-attempt-exhaustion`: before
    `raise ProviderUnavailable(`, line 190.
  - `review-v2-reset-spent-on-retryable`: after `attempts += 1`, line 188.

  All three pass the whole-story focused suite (136 tests). They also pass the whole non-`postgres` suite: 1697 passed, 1 skipped, the same as the unmutated baseline.
  No row ends an `execute` with `FATAL` or a `RETRYABLE` outcome after a
  throttle wait and then throttles again before the next
  `start_throttle_budget()`. T012 comes closest: throttled, then `RETRYABLE`,
  then a second `execute`. Its jitter `[0.0, 0.5]` makes the declined wait
  90 s under both HEAD and the reset, so it cannot tell them apart. Probe
  (`SCRATCH/probe/probe_late.py`): one start, budget 300 s, rpm 60, jitter
  `[0.0]`, a first `execute` throttled four times (240 s) and then ending as
  stated, then a second always-throttled `execute`:

  | First `execute` ends with | HEAD | Survivor that resets on that path |
  |---------------------------|------|-----------------------------------|
  | `FATAL` | 2nd `execute`: 2 sends, total 300.0 s | `reset-spent-on-fatal`: 6 sends, total **540.0 s** |
  | Attempts exhausted (three `RETRYABLE`) | 2 sends, 300.0 s | `reset-spent-on-attempt-exhaustion` and `reset-spent-on-retryable`: 6 sends, **540.0 s** |
  | One `RETRYABLE`, then success | 2 sends, 300.0 s | `reset-spent-on-retryable`: 6 sends, **540.0 s** |

- **Expected evidence/behavior**: Three sources specify this behaviour.
  - DAC-E8-5: every throttle wait "MUST be charged to it across every
    `execute` call until the next start … so the sleeps between two starts
    total at most 300 s".
  - Rate-limit-governor CAP-003 §8 criteria 2 and 3: the budget is spent
    across every request between two starts, and the sleeps between two
    starts total at most the budget.
  - The same design's §2.4: after the budget is spent, every further `429`
    for that stock raises at once.

  None of them makes an exception for an `execute` that ends in `FATAL` or
  `ProviderUnavailable`, or that passes through `RETRYABLE`. Each mutant
  changes specified behaviour, so none is equivalent.
- **Impact**: HEAD is correct on all three paths. This is a test gap, not a
  defect. A regression of this shape would let one stock wait out more than
  one budget between two heartbeats. Data types answering a `FATAL` refusal
  (`not_found`, `not_entitled`) or a transient `5xx` between `429`s would each
  release the spent total. That is the FINDING-55 condition DAC-E8-5 exists to
  prevent, past the 900 s staleness window. CAP-003-E8-S3's and -S4's reviews
  mutate only their own lines, so the governor seam stays unguarded there.
  Scope, not impact, sets the severity. The three mutated lines are unchanged
  since v1's head `72c8a0e`, and the baseline could have run these mutants
  just as well (step H, *Re-review scope*). Scope `late` caps the finding at
  MEDIUM, and it does not make TC-COMP-237 or T012 `WEAK`. It is not
  CRITICAL, because no production line is wrong.
- **Required remediation**: Non-blocking. In a later rework, or the next story
  that touches the governor, add one row or a parametrised row to
  `tests/unit/test_governor_retry.py`. After throttle waits are charged, the
  row ends an `execute` with `FATAL`, with exhausted attempts, and with a
  single `RETRYABLE` outcome. On the same governor, before
  `start_throttle_budget()`, an always-throttled `execute` must then take
  only the remaining budget, so the sleeps total at most 300 s. The row must
  kill the three mutants in `CAP-003-E8-S2-implementation-review-v2-mutation.json`.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — no test holds the spent budget across an `execute` that follows a raise | RESOLVED | `tests/unit/test_governor_retry.py::test_a_spent_budget_stays_spent_for_every_execute_until_the_next_start` (lines 468-493). Carried mutant `review-reset-spent-on-raise` is killed in this review's run. The reviewer's scratch reproduction gives 1 failed and 21 passed, only this row, on `assert after_raise.calls == 1` (6 == 1). This is the remediation v1 asked for: after the raise, a further always-throttled `execute` with no new start raises after exactly one send, with no new sleep. The sibling reset paths that v1 did not name are reported as a new `late` finding (v2/IR-001), not as this finding still open |
| v1/IR-002 (HIGH) — no test pins the throttle charge to the monotonic clock | RESOLVED | `tests/unit/test_governor_retry.py::test_throttle_waits_are_charged_on_the_monotonic_clock_not_the_wall_clock` (lines 633-672). Carried mutants `review-throttled-at-from-wall-clock` and `review-charge-end-from-wall-clock` are killed, and so is the reviewer's new two-line `review-v2-both-ends-on-wall-clock`. The reproduction gives 1 failed and 21 passed, only this row; the 20-send guard's `AssertionError` escapes `pytest.raises`. The departure from DAC-E8-S2-1's one-clock *Given* is recorded in the cycle-3 `deviations`, as v1's remediation allowed. The reviewer judges it justified (Scope and Plan Deviations) |
| v1/IR-003 (LOW) — `errors.py` module docstring said a 429 never becomes a `MassiveError` | RESOLVED | `src/factorflow/ingestion/massive/errors.py` lines 18-23. One throttled response never becomes a `MassiveError` here (DAC-E3-S3-6). Persistent throttling ends as `ProviderRateLimited`, which the governor raises and no response is classified into. This agrees with massive-client CAP-003 §2.4 (`ProviderRateLimited(ProviderUnavailable)`, raised by the governor, line 93) and §2.5 (the `rate_limited` kind). Docstring only: `git diff 72c8a0e..HEAD -- src/factorflow/ingestion/massive/errors.py` touches only lines 18-23 |

## Scope and Plan Deviations

- **The IR-002 row departs from the one-clock rule (justified, recorded).**
  Three sources say every row passes one `FakeClock` as both `monotonic` and
  `now`, except the delivered rows that pin a fixed wall-clock phase:
  DAC-E8-S2-1's *Given*, rate-limit-governor CAP-003 §7, and the
  `rate-limit-governor-tests.md` preamble (line 35).
  - The new row passes `now=lambda: clock() + _WALL_CLOCK_OFFSET` instead.
  - The rule exists so that a sleep advances the pacing and wall clocks
    together (review v14 FINDING-60). That still holds: `now` moves in
    lockstep with the shared clock.
  - The offset is a whole number of minutes, so every boundary wait is the
    one a shared clock gives.
  - One shared clock cannot tell the specified monotonic charge from a
    wall-clock one, so the departure is necessary to pin §2.3.
  - It is recorded in the cycle-3 `deviations` and accepted by both cycle-3
    reviewers. v1/IR-002 allowed this placement.

  Follow-up for the next revision of the design §7 sentence and the
  test-spec preamble: name this row as an exception. This is not a finding.
  No change to code is needed, and the specs are outside a story's write
  scope.
- **The IR-002 row builds `RateLimitGovernor` directly (justified).**
  `_governor()`'s `now` parameter is typed `FakeClock`. Building the governor
  directly leaves the helper and every delivered row unchanged, and keeps
  *Resolved Conflicts* 2 intact.
- **The task plan does not list the two rework rows.** The rework changed only
  `last_reworked_review` in the plan. The rows are traced through the cycle-3
  entry (`tasks: [T008, T012, T013]`), the test markers and the docstrings.
  This is bookkeeping only.
- **Carried from v1, unchanged and still justified.** T012's budget is 119.5
  rather than 120.0. Coder deviations (2) to (4) stand. Two delivered budget
  tests changed rather than §2.1's three, as *Resolved Conflicts* 1 settles.
  T016's `test_massive_retry.py` fixture change is owner-confirmed. The task
  plan header names the planning branch `usr/alvaro-de-jodra/CAP-003-E8-tasks`.
- **No scope leakage.** The rework changed one production docstring, two
  tests, the plan's `last_reworked_review` and the evidence. There is no new
  setting, logging or production path. `start_throttle_budget()` still has
  no caller, as the story states.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`), with this report and `STORY_DIR/CAP-003-E8-S2-tasks.md`
- **Required action**: Synchronize the component documentation for CAP-003-E8-S2. Doc sync may record the IR-002 row as the documented exception to the one-clock rule wherever component documentation restates it. The design §7 sentence and the test-spec preamble belong to the next specification revision. IR-001 (MEDIUM, late) is non-blocking: carry it to a later rework or to the next story that touches the governor, using the three mutants in `CAP-003-E8-S2-implementation-review-v2-mutation.json`
- **Warnings accepted downstream**: IR-001 (MEDIUM)
