---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E8-S2"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T23:52:43Z"
reviewed_head: "72c8a0e0e48d653798bc632dc02cc8393e86ee61"
review_base: "201442b37d064dddc5df1edb00c188b0e23b746f"
reviewed_state_revision: "sha256:03336451bff08efa1b1c04f3f59a6594a47c8d55273556b15b82b79b94eff67f"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-003-E8-S2
    artifact_version: 1
    content_revision: sha256:4b4a4aafb4838112657f67af0962e6991c120f107a0e0d39ca63b7bd5d715e86
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-09T00:12:30Z
  source_artifacts:
    - id: CAP-003-E8-S2
      version: "1 (sha256:4b4a4aafb4838112657f67af0962e6991c120f107a0e0d39ca63b7bd5d715e86)"
    - id: CAP-003-E8-S2-tasks
      version: "1 (updated 2026-11-08)"
    - id: CAP-003-E8-S2-tdd-evidence
      version: "cycle-1, cycle-2"
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

# Implementation Review: CAP-003-E8-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 2 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 11/13 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 11/12 passed |

Findings: CRITICAL 0 · HIGH 2 · MEDIUM 0 · LOW 1 · **total 3**

| Finding | Severity | Status |
|---------|----------|--------|
| IR-001 | HIGH | OPEN |
| IR-002 | HIGH | OPEN |
| IR-003 | LOW | OPEN |

The production code is correct. It follows rate-limit-governor CAP-003 §2.2
nearly line for line, and every planned task is in place. The TDD evidence
lint is clean, the two cycle patches rebuild HEAD's `src/` and `tests/` exactly
from the base, both REDs reproduce, and every focused suite, the full suite,
lint, format, type check and build pass.

The gate fails on the mutation check (E.9). The reviewer ran 41 mutants: the
4 catalogue mutants, the task plan's 16 hand-written ones, and 21 of the
reviewer's own. Two of the reviewer's mutants survive. Both change behaviour
the story and the design specify:

- **`review-reset-spent-on-raise`** zeroes the spent total when the governor
  raises `ProviderRateLimited`. A second `execute` for the same stock, before
  the next `start_throttle_budget()`, then waits out a whole new budget. That
  is 600 s of throttle sleeps between two starts, against the 300 s DAC-E8-5
  allows. No test calls `execute` after a raise without a new start (IR-001).
- **`review-throttled-at-from-wall-clock`** measures the throttle charge
  against the wall clock `now` instead of `monotonic`. Every row the story
  adds passes one `FakeClock` as both clocks, so no test can tell them apart.
  With production clocks (`time.time` against `time.monotonic`), the charge is
  about −1.76e9 s, the budget is never spent, and throttling never ends
  (IR-002).

Neither survivor is equivalent. Both make a DAC-E8-5 test `WEAK`, so each is
HIGH, scope `initial`. The story returns to story coding for test-only
rework. No production change is required.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2.md` (status `in-review`, approved, revision `sha256:4b4a4aaf…5e86`, which equals `approval.reviewed_revision`) |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2-tasks.md` (18 tasks, all checked) |
| Component | `FactorFlow-v2` (project repo and component are the same repository) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S2` |
| HEAD | `72c8a0e0e48d653798bc632dc02cc8393e86ee61` (`feat(CAP-003-E8-S2): one throttle wait budget per stock, checked before each wait, and ProviderRateLimited`) |
| Review base | `201442b` → `201442b37d064dddc5df1edb00c188b0e23b746f`, supplied by the invoking driver (the CAP-003-E8-S1 doc-sync tip this story was cut from). `pipeline-state.py review-base --base-ref 201442b` resolves it, and `git merge-base --is-ancestor 201442b HEAD` holds. The default merge-base with the remote default branch is wrong for this unpushed chain: without `--base-ref`, the stage check reports `BLOCKED`, because the TDD lint then spans CAP-003-E8-S1's commits |
| Working tree | Clean at freeze (no staged, unstaged or untracked files; only git-ignored caches, `build/` and `src/factorflow.egg-info/`). One commit, `201442b..HEAD` |
| Changed files reviewed | 27 (3 production, 6 test, 18 story documentation and evidence) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/rate_limit.py` | modified | AC-30, DAC-E8-5, DAC-E8-6, DAC-E8-S2-8; T015 |
| `src/factorflow/ingestion/massive/errors.py` | modified | DAC-E8-4, DAC-E8-6, DAC-E8-S2-6; T013 |
| `src/factorflow/ingestion/massive/__init__.py` | modified | DAC-E8-S2-6; T014 |
| `tests/unit/test_governor_retry.py` | modified | DAC-E8-S2-1 to S2-5, S2-8, DAC-E8-5; T006 to T012 |
| `tests/unit/test_massive_failure_reasons.py` | modified | DAC-E8-S2-6; T002 |
| `tests/unit/test_massive_error_classification.py` | modified | DAC-E8-S2-6; T004 |
| `tests/unit/test_massive_package_boundary.py` | modified | DAC-E8-S2-6; T005 |
| `tests/unit/test_outcomes.py` | modified | DAC-E8-8, DAC-E8-S2-7; T003 |
| `tests/unit/test_massive_retry.py` | modified | T016 (Open Gaps 1, owner-confirmed 2026-11-08) |
| `…/stories/CAP-003-E8-S2.md` | modified | Status `planning` → `in-review` (story-coding hand-off) |
| `…/stories/CAP-003-E8-S2-tasks.md` | modified | Checkboxes only (18 × `[ ]` → `[x]`; word diff shows no other change) |
| `…/stories/CAP-003-E8-S2-tdd-evidence.yaml` | added | T018 |
| `…/stories/CAP-003-E8-S2-evidence/` (15 files: two cycle patches, RED, GREEN and final logs, three mutation results files, two code-review and two spec-drift records) | added | T017, T018 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-30 | PARTIAL | `rate_limit.py` `execute` lines 159-197: `THROTTLED` never touches `attempts`; `ProviderRateLimited` is raised when the budget is spent | TC-COMP-235 to TC-COMP-242 rows; T012 | The governor's half is implemented correctly. It is PARTIAL only through DAC-E8-5's two unpinned properties (IR-001, IR-002) |
| DAC-E8-4 | SATISFIED | `errors.py` `_ERROR_KIND_BY_TYPE` lines 284-291 (six rows, `ProviderRateLimited: "rate_limited"`); `compose_failure_reason` exact-class lookup, unchanged | `test_each_of_the_six_kinds_composes_its_own_kind` (six literals), `test_rate_limited_reason_never_carries_the_credential`, `test_an_unlisted_subclass_of_a_listed_class_raises_type_error` | Mutants `plan-rate-limited-row-deleted`, `plan-rate-limited-kind-to-unavailable`, `review-rate-limited-gets-fixed-description` and `review-rate-limited-skips-redact` are killed |
| DAC-E8-5 | PARTIAL | `rate_limit.py` lines 122, 124-128 (`start_throttle_budget`), 163-166 (charge after the permit), 177-182 (check before the wait, `>`) | T006, T008, T009, T012 and the unchanged zero-stated-delay row | The code satisfies every clause. Two clauses are unpinned. "Charged across every `execute` call until the next start" is not tested after a raise (IR-001). "Measured from the start of the throttle sleep", which story, design §2.3 and T015 define as `monotonic()`, is indistinguishable from the wall clock in every row (IR-002) |
| DAC-E8-6 | SATISFIED | `rate_limit.py` line 179 `raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc`; `RETRYABLE` branch lines 184-195 byte-identical to the base; `FATAL` line 173-174 unchanged; `errors.py` `class ProviderRateLimited(ProviderUnavailable)` | T007 (a) and (b); delivered fatal, retry-bound, backoff and pacing rows; T004 | `type(err) is`, literal message, `provider_request_id is None`, `__cause__ is raised[-1]` |
| DAC-E8-8 | SATISFIED | `outcomes.py` line 151, unchanged (`git diff --exit-code 201442b..HEAD -- src/factorflow/ingestion/outcomes.py` exits 0) | `test_provider_rate_limited_maps_to_failed_outcome` | `record.reason is r`; `plan-unavailable-dropped-from-failed-tuple` killed |
| DAC-E8-S2-1 | SATISFIED | as DAC-E8-5 | `test_boundary_throttle_wait_exhausts_the_budget_and_raises` (`[60.0]`), `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` (`[10.0, 10.0]`), `test_zero_stated_delay_throttle_wait_is_bounded` unchanged | Both changed rows now pass `now=clock`; only expectations changed |
| DAC-E8-S2-2 | SATISFIED | as DAC-E8-6 | `test_spent_budget_raises_provider_rate_limited_from_the_last_exception`, `test_exhausted_attempts_raise_a_provider_unavailable_that_is_not_rate_limited` | |
| DAC-E8-S2-3 | SATISFIED | `start_throttle_budget`, instance `_throttle_spent` | `test_one_throttle_budget_spans_every_execute_until_the_next_start` | The derived scenario is tested exactly as written: `[60.0] * 5`, total 300, then `[60.0]` after the restart. The gap in IR-001 lies beyond this scenario |
| DAC-E8-S2-4 | SATISFIED | check before the wait, line 178 | `test_jittered_boundary_waits_never_take_the_sleeps_past_the_budget` | Declined delay from the literal formula. Reviewer trace: four sleeps of about 240.12 s, declined delay about 119.70 s |
| DAC-E8-S2-5 | SATISFIED | `RETRYABLE`, backoff and pacing unchanged | delivered rows, unedited bodies | `git diff` shows only comment lines in `test_governor_retry.py` above the TC-COMP-200 header. `test_governor_backoff.py`, `test_governor_pacing.py` and `test_governor_settings.py` are byte-identical to the base |
| DAC-E8-S2-6 | SATISFIED | `errors.py` class, row and `__all__`; `__init__.py` re-export | T002 (four tests), T004, T005 | |
| DAC-E8-S2-7 | SATISFIED | delivered `isinstance(error, (ProviderUnavailable, …))` branch | `test_provider_rate_limited_maps_to_failed_outcome` | |
| DAC-E8-S2-8 | SATISFIED | no `logging`, one `except BaseException`, import of exactly two names, no hunk in `GovernorSettings` or `from_massive_settings` (base lines 54-78; the hunks are at 4, 20, 34, 42, 114, 137-159) | `test_governor_inspects_no_exception_and_logs_nothing`; delivered `test_governor_settings.py` | `plan-fatal-or-isinstance-rate-limited` killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `git show 201442b:` errors.py has `ProviderNotEntitled` at 112, its `__all__` entry at 51, the row at 280, and the count-free `TypeError` text at 338; `__init__.py` re-exports it at 41/65; `outcomes.py` line 151 | The evidence header records (a) to (d) and the 116-test baseline |
| T002 | complete | VERIFIED | `test_massive_failure_reasons.py` four tests from line 389 | Hand-written literals; imports inside the functions |
| T003 | complete | VERIFIED | `test_outcomes.py::test_provider_rate_limited_maps_to_failed_outcome` | |
| T004 | complete | VERIFIED | `test_massive_error_classification.py::test_provider_rate_limited_is_a_retryable_provider_unavailable` | Also kills `review-fatal-by-exact-class` |
| T005 | complete | VERIFIED | `test_massive_package_boundary.py::test_provider_rate_limited_is_identity_reexported_from_package` | |
| T006 | complete | VERIFIED | two delivered tests' expectations and `now=clock`; zero-delay row untouched; `# Implements CAP-003 TC-COMP-235` above the header | |
| T007 | complete | VERIFIED | (a) and (b) as planned | Local recording sender with the 20-send guard |
| T008 | complete | VERIFIED | `test_one_throttle_budget_spans_every_execute_until_the_next_start` | Implemented as planned. The planned scenario does not kill `review-reset-spent-on-raise` (IR-001) |
| T009 | complete | VERIFIED | `test_jittered_boundary_waits_never_take_the_sleeps_past_the_budget` | |
| T010 | complete | VERIFIED | comment only; delivered bodies unchanged | `plan-throttle-costs-an-attempt` and `plan-attempt-bound-off-by-one` killed |
| T011 | complete | VERIFIED | `test_governor_inspects_no_exception_and_logs_nothing` | |
| T012 | complete | VERIFIED | `test_retryable_backoff_and_its_permit_wait_are_not_charged_to_the_throttle_budget` | Justified deviation: budget 119.5, not 120.0 (see Scope and Plan Deviations). Does not distinguish the monotonic clock from the wall clock (IR-002) |
| T013 | complete | VERIFIED | `errors.py` lines 106-111 (docstring identical to massive-client §2.4), row at 290, `__all__` at 50 | `compose_failure_reason` and `is_fatal_for_governor` unchanged |
| T014 | complete | VERIFIED | `__init__.py` import line 42, `__all__` line 67, sorted order | Docstring has no count (T001 (b)) |
| T015 | complete | VERIFIED | `rate_limit.py` (a) line 37, (b) 46-48, (c) 122, (d) 124-128, (e) 160-182, (f) module and `execute` docstrings | Matches design §2.2. The message literal was joined by `ruff format`, with identical text |
| T016 | complete | VERIFIED | `test_massive_retry.py` `_governor()` budget 1.0 → 300.0 plus a one-line comment | Owner-confirmed (Open Gaps 1). Deterministic: no-op sleep, every delay under 120 s |
| T017 | complete | VERIFIED | `final-validation.log`; reviewer reran all of it (Independent Validation) | |
| T018 | complete | VERIFIED | two cycles, `commit_hash: stage`; lint clean with `--require-logs`; `cycle-1.patch` (sha256 `2e693764…7c47`) then `cycle-2.patch` (sha256 `3a28bfe4…c0c6`) applied to `git archive 201442b src tests` gives a tree identical to `git archive HEAD src tests` (`diff -r` empty) | Independent code-review (APPROVED) and spec-drift (no drift) records per cycle |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-235 (two changed delivered rows plus the unchanged zero-delay row) | ADEQUATE | Exact sleep sequences and `ProviderRateLimited`. The zero-delay row pins that the retry's permit wait is charged. Kills `plan-check-after-wait`, `plan-charge-only-the-sleep`, `review-charge-before-permit`, `review-throttled-at-after-sleep`, `review-check-ignores-delay` and `review-stated-delay-unchecked` | The two changed rows carry no send guard, so a never-charging mutant loops up to 1,000,000 sends before failing (it still fails; noted by the cycle-2 code review) |
| TC-COMP-236 (two tests) | ADEQUATE | `type(err) is`, literal message, `provider_request_id is None`, `__cause__ is raised[-1]`, two sends; plain `ProviderUnavailable` after three sends | none |
| TC-COMP-237 (`test_one_throttle_budget_spans_every_execute_until_the_next_start`) | WEAK | Pins persistence across a successful `execute` and a raising one, the `>` boundary, and the restart. Kills `review-reset-spent-on-success`, `plan-per-request-budget`, `review-overwrite-not-accumulate` and the `drop-field-copy` mutants | It never calls `execute` after the raise and before the next start, so `review-reset-spent-on-raise` survives (IR-001) |
| TC-COMP-238 | ADEQUATE | Sum ≤ 300 and sum plus the independently computed declined delay > 300 | none |
| TC-COMP-239 | ADEQUATE | Delivered rows unchanged; they kill `plan-throttle-costs-an-attempt`, `review-drop-throttle-continue` and `plan-attempt-bound-off-by-one` | none |
| TC-COMP-240 (four tests) | ADEQUATE | Six literal reasons; credential redacted; both unlisted subclasses `TypeError`; subclass relation | none |
| TC-COMP-241 | ADEQUATE | `outcome`, `data_type`, `reason is r` | none |
| TC-COMP-242 | ADEQUATE | AST: one `BaseException` handler, no `isinstance`/`issubclass`/`type` call, import of exactly two names, every `ProviderRateLimited` name inside a `raise`, no logging, no URL or credential literal, `GovernorSettings` field list | none |
| T004, T005 | ADEQUATE | Subclass, `__all__`, `is_fatal_for_governor` false; package identity | none |
| T012 (`test_retryable_backoff_and_its_permit_wait_are_not_charged_to_the_throttle_budget`) | WEAK | Pins that the backoff and its permit wait are not charged and that `throttled_at` is cleared after the charge; kills `plan-charge-the-backoff-sleep`, `plan-keep-throttled-at-after-charge` and `review-init-budget-nonzero` | Its `monotonic` and `now` are one `FakeClock`, as in every row this story adds, so the clock the charge is measured on is unpinned: `review-throttled-at-from-wall-clock` survives (IR-002) |
| T016 fixture change | ADEQUATE | The delivered TC-INT-025 row passes deterministically at 300 s; its RED at 1.0 s is in `red-cycle-2-t016.log` | none |

All mapped TC-IDs for this story (TC-COMP-235 to TC-COMP-242) are implemented
and carry `# Implements CAP-003 TC-COMP-<n>`. Every new row is deterministic:
fake clocks, fake sleepers and scripted jitter, with no network and no real
time.

## Independent Validation

All commands ran from the harness root unless the table says otherwise.
Names used in the table:

- `VENV` is `/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin` (the main checkout's environment, CPython 3.13.7). The clone has no `.venv`. With `-o pythonpath=src`, a pytest probe confirmed that `factorflow.ingestion.rate_limit` and `factorflow.ingestion.massive.errors` resolved to the clone's `src`.
- `COMPONENT` is `/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/cool-blackburn-2ab918/repos/factorflow-v2/FactorFlow-v2`.
- `STORY_DIR` is `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories`.
- `SCRATCH` is the review session's scratchpad `review-e8s2-v1/`, outside every repository.
- `C1` is the plan's cycle-1 list: `tests/unit/test_massive_failure_reasons.py tests/unit/test_massive_error_classification.py tests/unit/test_massive_package_boundary.py tests/unit/test_outcomes.py`.
- `C2` is the plan's cycle-2 list: `tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py tests/unit/test_governor_pacing.py tests/unit/test_governor_settings.py tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py`.

The first row is the stage's state check. The other twelve rows are the
required validation counted in the Gate Summary.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story STORY_DIR/CAP-003-E8-S2.md --stage adversarial-review --base-ref 201442b` | harness root | 0 | PASS | `READY — story is ready for independent review`. Without `--base-ref` it reports `BLOCKED — story coding has not reached in-review`, because the default base is the wrong merge-base |
| `python3 scripts/check-tdd-evidence.py --evidence COMPONENT/STORY_DIR/CAP-003-E8-S2-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 201442b --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q C1` | COMPONENT | 0 | PASS | 86 passed |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q C2` | COMPONENT | 0 | PASS | 48 passed |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q C1 C2` (whole-story focused) | COMPONENT | 0 | PASS | 134 passed |
| `uv sync --directory COMPONENT --all-extras --locked --dry-run --offline` | harness root | 0 | PASS | CPython 3.12.14; resolved 46 packages, would install 43; `--dry-run`, so no `.venv` was created in the clone (run outside the sandbox for the uv cache) |
| `uv build --directory COMPONENT --offline --out-dir SCRATCH/build` | harness root | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` into the scratchpad. Run outside the sandbox for the uv cache, after the full suite finished |
| `uv run --directory COMPONENT --isolated --offline --all-extras --locked pytest -p no:cacheprovider -q -rfE` (full suite, `postgres` tests included) | harness root | 0 | PASS | 2659 passed, 0 skipped, 0 failed in 1096.62 s, on CPython 3.12.14 with the locked packages in an isolated environment. This matches the coder's 2659. The 2 warnings are pre-existing deprecations (Starlette `httpx`, anyio `BlockingPortal`). The `postgres` tests ran against a testcontainers PostgreSQL, outside the sandbox for the Docker socket and the uv cache. The production compose project `factorflow` was not touched, and the live provider was not contacted |
| `VENV/ruff check .` | COMPONENT | 0 | PASS | All checks passed |
| `VENV/ruff format --check .` | COMPONENT | 0 | PASS | 285 files already formatted |
| `VENV/mypy src` | COMPONENT | 0 | PASS | No issues found in 61 source files |
| T017 and story-specific checks: `grep -rn start_throttle_budget src`; `git diff --exit-code --stat 201442b..HEAD --` `client.py`, `outcomes.py`, `test_governor_backoff.py`, `test_governor_pacing.py`, `test_governor_settings.py`, `governor_fakes.py`, `uv.lock`, `pyproject.toml`; `git diff -U0 201442b..HEAD -- src/factorflow/ingestion/rate_limit.py` hunk headers; logging grep on that diff; `git diff --word-diff=porcelain` of the task plan | COMPONENT | 0 / 0 / – / 1 / – | PASS | Only the definition at `rate_limit.py:124`. Every listed file is byte-identical to the base. No hunk falls inside base lines 54-78 (`GovernorSettings`, `from_massive_settings`). No added or removed logging line. The plan diff is checkboxes only. `_ERROR_KIND_BY_TYPE` holds six rows |
| Mutation gate: `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 201442b..HEAD --cycle review --out SCRATCH/generated.json`; 37 manual mutants added (16 from the task plan's *Other Notes*, 21 reviewer mutants); `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants SCRATCH/mutants.json --jobs 4 --timeout 180 --command 'VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q -x C1 C2' --out SCRATCH/results.json --logs SCRATCH/results-logs --work-root SCRATCH/work` | harness root | 0 / 0 | FAIL | `generate`: 4 catalogue mutants (two `drop-field-copy`, one `negate-boolean`, one `off-by-one`, all in `rate_limit.py`). `run`: four unmutated baselines passed with 134 tests each; 41 mutants, 39 killed, 2 survived. `scope` was not run (initial review). Results copied to `CAP-003-E8-S2-implementation-review-v1-mutation.json` (sha256 `d1a0e0fd…a2a9`) |

Mutation detail:

- **Catalogue (4, all killed)**: `drop-field-copy` at lines 122 and 128,
  `negate-boolean` at 164, `off-by-one` (`>` → `>=`) at 178.
- **Task plan's hand-written mutants (16, all killed)**: check-after-wait,
  raise plain `ProviderUnavailable`, drop `from exc`, charge only the sleep,
  keep `throttled_at` after the charge, per-request budget, `FATAL or
  isinstance`, throttle costs an attempt, attempt exhaustion raises
  `ProviderRateLimited`, charge the backoff sleep, attempt bound off by one;
  the kind row deleted, the kind changed to `unavailable`, the base class
  changed to `MassiveError`, the package `__all__` entry deleted, and
  `ProviderUnavailable` dropped from `outcomes.py`'s tuple.
- **Reviewer mutants (21, 19 killed)**: `errors.py` `__all__` entry deleted;
  the package import deleted; `is_fatal_for_governor` by exact class; a fixed
  description for `rate_limited`; `redact` skipped for `rate_limited`; reset
  on success; charge before the permit; overwrite instead of accumulate;
  charge end on the wall clock; check ignores the spent total; check ignores
  the delay; `throttled_at` after the sleep; a `provider_request_id` on the
  raise; `from None`; the delivered message; a nonzero start; a nonzero
  initial value; a dropped `continue`; the stated-delay path unchecked.
- **Survivors (2, neither equivalent)**:
  - `src/factorflow/ingestion/rate_limit.py:manual:review-reset-spent-on-raise`
    inserts `self._throttle_spent = 0.0` before line 179's raise (IR-001).
  - `src/factorflow/ingestion/rate_limit.py:manual:review-throttled-at-from-wall-clock`
    changes line 180 to `throttled_at = self._now()` (IR-002).

  Both also survive the whole non-`postgres` suite:
  `--command 'VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q -m "not postgres" tests --ignore=tests/unit/test_release_excludes_test_paths.py --ignore=tests/unit/test_distribution_contents.py'`
  gave 1695 passed for the baseline and for each survivor. The two ignored
  files call `uv build`, which the sandbox's uv cache refuses inside a
  mutation clone. They contain no governor code.
- **Observable effect**, from a reviewer probe run outside the repository
  against scratch copies of HEAD and of each mutant
  (`SCRATCH/probe_scenarios.py`):

  | Scenario | HEAD | `reset-spent-on-raise` | `throttled-at-from-wall-clock` |
  |----------|------|------------------------|--------------------------------|
  | A. One `start_throttle_budget()`, then two always-throttled `execute` calls (budget 300 s, rpm 60, jitter `[0.0]`) | 1st: 6 sends, 300.0 s; 2nd: 1 send, total still 300.0 s | 2nd: 6 sends, total **600.0 s** | as HEAD |
  | B. Always throttled; `now` is the same `FakeClock` offset by +1.762e9 s (production-shaped `time.time` against `time.monotonic`) | `ProviderRateLimited` after 6 sends, 280.0 s | as HEAD | never raises: the 20-send guard stops it after 21 sends and **1180.0 s** |

- **Reproduced coder claims**:
  - Cycle-1 RED: HEAD's tests against the base `errors.py`, `__init__.py`
    and `rate_limit.py` give 11 failed and 75 passed, as recorded.
  - Cycle-2 RED: HEAD's tests against the base `rate_limit.py` and
    `test_massive_retry.py` give 7 failed and 41 passed. The seven failures
    are the ones the evidence names.
  - T012 deviation: at the plan's 120.0, `plan-charge-the-backoff-sleep`
    passes T012 (1 passed). At 119.5 it is killed.

### Validation Side Effects

- Before: clean working tree at `72c8a0e` on `usr/alvaro-de-jodra/CAP-003-E8-S2`; ignored entries only (`.hypothesis/`, `.mypy_cache/`, `.ruff_cache/`, `build/`, `src/factorflow.egg-info/`, `__pycache__/`). `pipeline-state.py code-revision`: `sha256:03336451…f67f`.
- After: the only untracked files are this report and `CAP-003-E8-S2-implementation-review-v1-mutation.json`. The reviewer wrote both under `docs/`, which the code fingerprint excludes. `uv build` refreshed the git-ignored `build/` and `src/factorflow.egg-info/`. No `.venv` or `.pytest_cache` was created in the clone. Mutation clones, logs, RED reproductions, probes and build outputs went to the session scratchpad.
- Unexpected tracked-file changes: none. `pipeline-state.py code-revision` after validation: `sha256:03336451bff08efa1b1c04f3f59a6594a47c8d55273556b15b82b79b94eff67f`, identical to the value recorded at freeze.

## Findings

### IR-001 — No test holds the spent budget across an `execute` that follows a raise

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-5, AC-30 (TC-COMP-237)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py` lines 178-179; `tests/unit/test_governor_retry.py::test_one_throttle_budget_spans_every_execute_until_the_next_start`
- **Claim challenged**: T008 and the cycle-2 evidence say TC-COMP-237 proves
  "one budget spans every execute between two starts". The cycle's mutation
  run reports no survivor.
- **Observed evidence**: The reviewer mutant `review-reset-spent-on-raise`
  inserts `self._throttle_spent = 0.0` immediately before
  `raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc`. It
  passes the whole-story focused suite (134 tests) and the whole non-`postgres`
  suite (1695 tests). T008's second `execute` raises, and the test then calls
  `start_throttle_budget()` before the third `execute`. No row anywhere calls
  `execute` after a raise without a new start. Probe scenario A: under the
  mutant, a second always-throttled `execute` for the same stock takes five
  more 60 s waits, so the sleeps between two starts total 600 s.
- **Expected evidence/behavior**: Three sources specify this behaviour.
  - DAC-E8-5: the throttle wait "MUST be charged to it across every `execute`
    call until the next start … so the sleeps between two starts total at most
    300 s".
  - Rate-limit-governor CAP-003 §2.4: "After the budget is spent, every further
    `429` for that stock raises at once, so the stock's remaining data types
    each cost one request and no wait".
  - The same design's §8 criteria 2 and 3, and system design §3.6 note 3.

  The mutant changes that behaviour, so it is not equivalent. A test of this
  story's governor must fail when a raise releases the stock's budget.
- **Impact**: The regression this story exists to prevent goes unguarded:
  FINDING-55's several budgets per stock. A stock with four throttled data
  types could wait up to four budgets between two heartbeats, past the
  900 s staleness window, and the sweeper would reclaim a live download as
  `abandoned`. CAP-003-E8-S3's TC-COMP-245 will observe this through the
  client once it lands, but that review mutates only S3's lines. Until then
  the governor seam is unpinned. Under *Impact*, not severity: no production
  path reaches the throttle branch before CAP-003-E8-S3.
- **Required remediation**: Add an assertion to TC-COMP-237's row, or a new
  row in `tests/unit/test_governor_retry.py`, that kills
  `review-reset-spent-on-raise`. It must show that after the governor raises
  `ProviderRateLimited`, a further always-throttled `execute` on the same
  governor, before `start_throttle_budget()`, raises `ProviderRateLimited`
  after exactly one send and with no new sleep. Record the cycle in the TDD
  evidence with a mutation block that includes this mutant.

### IR-002 — No test pins the throttle charge to the monotonic clock

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-5, AC-30
- **Tasks**: T012 (the additional "what is charged" test), T015 (e)
- **Files**: `src/factorflow/ingestion/rate_limit.py` lines 165 and 180; `tests/unit/test_governor_retry.py::test_retryable_backoff_and_its_permit_wait_are_not_charged_to_the_throttle_budget` and every row this story adds
- **Claim challenged**: The cycle-2 evidence says the governor charges "the
  charge from the sleep's start to the retried request's permit", and that
  every cycle-2 mutant was killed.
- **Observed evidence**: The reviewer mutant
  `review-throttled-at-from-wall-clock` changes `throttled_at =
  self._monotonic()` to `throttled_at = self._now()`. It passes the focused
  suite and the whole non-`postgres` suite. The reason is the clocks the tests
  use:
  - Every row this story adds passes one `FakeClock` as both `monotonic` and
    `now`.
  - The delivered rows that use the helper's default `now` (a `FakeClock`
    frozen at 0) start their monotonic clock at 0 too. Their first
    `throttled_at` is the same under either clock.
  - The two rows that pin a wall-clock phase (`now=wall_clock`, lines 131
    and 159) throttle once under a 1000 s budget, so they never spend it.

  Probe scenario B uses production-shaped clocks: a wall clock 1.762e9 s
  ahead of the monotonic clock, both advancing together. There the mutant
  charges about −1.76e9 s per wait and never raises. HEAD raises
  `ProviderRateLimited` after 280 s.
- **Expected evidence/behavior**: Four sources fix the clock.
  - The story's Description: "records `throttled_at = monotonic()` … the
    elapsed `monotonic() - throttled_at` is charged".
  - Rate-limit-governor CAP-003 §2.3: "the monotonic time from the start of
    the throttle sleep to the moment the retried request holds its permit".
  - §2.2's `execute`.
  - The task plan's T015 (e).

  The `now` collaborator is reserved for the minute-boundary wait (delivered
  comment, `rate_limit.py` lines 110-115). A clock swap therefore changes
  specified behaviour, and the mutant is not equivalent.
- **Impact**: With production collaborators (`time.time` and
  `time.monotonic`), a regression of this kind would make the budget
  unspendable. A persistently throttled stock would wait without bound. That
  breaks DAC-E8-5 and AC-30 ("past one stock's wait budget it is recorded under
  its own reason") and OPS-LOOP-001, and the stale heartbeat would get the
  download reclaimed. The fake-clock harness hides this whole class of
  regression. Under *Impact*, not severity: the code at HEAD is correct, and
  no production path reaches the branch before CAP-003-E8-S3.
- **Required remediation**: Add a governor test that kills
  `review-throttled-at-from-wall-clock`: a throttle scenario in which the
  wall clock `now` and `monotonic` differ but advance together. One way is a
  `now` derived from the same `FakeClock` with a fixed offset. The test must
  assert that the budget is still spent at the expected point, for example the
  sleep sequence and the `ProviderRateLimited` raise. DAC-E8-S2-1's *Given*
  asks every row of `test_governor_retry.py` to pass one `FakeClock` as both
  clocks. Place the row where that *Given* is not contradicted, or record the
  placement as a plan deviation or decision. Record the cycle in the TDD
  evidence with a mutation block that includes this mutant.

### IR-003 — `errors.py` module docstring still says a 429 never becomes a `MassiveError`

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A (documentation accuracy; massive-client CAP-003 §2.4)
- **Tasks**: T013
- **Files**: `src/factorflow/ingestion/massive/errors.py` module docstring, lines 16-20
- **Claim challenged**: T013 adds `ProviderRateLimited` "with the design's
  docstring" and leaves the rest of the module as delivered.
- **Observed evidence**: The module docstring still says a `429` "must never
  become a `MassiveError` at all -- it is flow control for the rate-limit
  governor, not a failure". From this story on, a `429` that persists past the
  stock's budget becomes `ProviderRateLimited`, a `MassiveError`. The cycle-1
  code review raised the same point as non-blocking.
- **Expected evidence/behavior**: Massive-client CAP-003 §2.4 and §2.5 now
  give persistent throttling a `MassiveError` type of its own. The rule
  DAC-E3-S3-6 still holds for one throttled response, which
  `classify_error_body` never turns into an error. The docstring should say
  that rather than the absolute statement.
- **Impact**: A maintainer reading the module could conclude that
  `ProviderRateLimited` is a contradiction, or "fix" it away. No runtime
  effect.
- **Required remediation**: Reword the sentence to cover the governor's
  `ProviderRateLimited`, in the rework or at doc sync. Not blocking.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T012 budget 119.5 instead of 120.0 (justified).** The reviewer reproduced
  the reason. At 120.0 the plan's own `charge-the-backoff-sleep` mutant
  survives T012, because the mutated total 60 + 1 + 59 = 120 is not
  greater than 120. At 119.5 the correct sequence `[60.0, 1.0, 59.0]` holds
  and the mutant is killed. The deviation is recorded in the cycle-2
  `deviations`, accepted by both cycle reviewers, and explained in the test's
  docstring. The task plan's T012 text still reads 120.0. The evidence
  records the deviation, so this is not a finding.
- **Coder deviations (2) to (4) (justified).**
  - (2) `ruff format` joined the message literal; the text is identical.
  - (3) The plan's 20-send guard is implemented as `_THROTTLE_SEND_GUARD` and
    `_guarded_throttle`.
  - (4) T016's comment is shortened to the 100-character limit.
- **Design §2.1 "three delivered budget tests"** against the story's two is
  settled in the plan's *Resolved Conflicts* 1. Two changed, and the
  zero-stated-delay row is byte-identical to the base.
- **`tests/unit/test_massive_retry.py` (T016)** is not in the story's file
  list. It is justified by the plan's *Open Gaps* 1, owner-confirmed
  2026-11-08, and is necessary to keep the delivered TC-INT-025 row green.
- **No scope leakage.** Every changed production and test line traces to
  T002-T016. The story and plan edits are status and checkbox bookkeeping.
  `client.py`, `outcomes.py`, `GovernorSettings`, `from_massive_settings`,
  `uv.lock` and `pyproject.toml` are unchanged. `start_throttle_budget()` has
  no caller, as the story states (CAP-003-E8-S3, CAP-003-E8-S4).
- **Bookkeeping.** The task plan header names the planning branch
  `usr/alvaro-de-jodra/CAP-003-E8-tasks`. The work is on
  `usr/alvaro-de-jodra/CAP-003-E8-S2`. This is informational only.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding` rework), with this report and `STORY_DIR/CAP-003-E8-S2-tasks.md`
- **Required action**: Make test-only changes that kill
  `review-reset-spent-on-raise` (IR-001) and
  `review-throttled-at-from-wall-clock` (IR-002). Both are in
  `CAP-003-E8-S2-implementation-review-v1-mutation.json`, with their
  `old`/`new` text. Record a rework cycle in the TDD evidence with its RED (the
  new assertions fail under each mutant), independent reviews and mutation
  block. Set `last_reworked_review: CAP-003-E8-S2-implementation-review-v1.md`
  in the task plan. IR-003 may be addressed in the same rework or left to
  doc sync. The rework must not change production behaviour. Then rerun this
  review, with this report as the baseline.
- **Warnings accepted downstream**: N/A
