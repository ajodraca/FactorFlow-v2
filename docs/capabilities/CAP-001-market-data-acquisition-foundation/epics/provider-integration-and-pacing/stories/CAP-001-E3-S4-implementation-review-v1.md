---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-12
updated: 2026-09-12
story_id: "CAP-001-E3-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-12T20:14:47Z"
reviewed_head: "0825bd76c72d5b980385143a6e24a71597f2bc0f"
review_base: "d1cb17449019375e1fe78250311a82e71284ea48"
reviewed_state_revision: "sha256:82bbd9b39acd4f0523ed5722ee678e132b0ec9b13abd0fa4f03b1718cc425405"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E3-S4
    artifact_version: 1
    content_revision: sha256:e32281e86dafafc0810449706822d1a1a700a1b39eca241c1db0544c4bd6bac6
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-12T20:14:47Z
  source_artifacts:
    - id: CAP-001-E3-S4
      version: "1"
    - id: CAP-001-E3-S4-tasks
      version: "1"
    - id: CAP-001-component-design-rate-limit-governor
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 4 |
| Low findings | 3 |
| Acceptance criteria | 9/11 satisfied |
| Planned tasks | 8/10 verified |
| Required validation | 6/6 passed |

The governor is a genuinely good piece of work: it is provider-agnostic, synchronous, imports no SDK type, keeps throttling strictly outside the attempt budget, and bounds both loops. Every required validation command passes, and the manual mutation evidence in `CAP-001-E3-S4-tdd-evidence.yaml` is credible — I reproduced two of the six recorded mutations and got byte-identical failure sets (same failing test names, same pass/fail counts).

Three HIGH findings block the gate. First, the "next minute boundary" the throttled path waits for is computed from a per-instance epoch fixed at governor construction (`rate_limit.py:94`, `:200-203`), not from any instant the provider shares, so the wait lands at an arbitrary phase inside the provider's real per-minute window and can be a fraction of a second — the exact failure design section 2.5 says the boundary wait exists to avoid. No test exercises any non-zero phase: replacing the whole computation with the constant `60.0` leaves all 19 governor tests green. Second, TC-COMP-227 / DAC-E3-S4-2 (queued retries must not resynchronise onto the same instant) has no implementing test; the label sits on two budget-exhaustion tests that pin jitter to `0.0`, and a mutation that freezes the jitter draw after its first call — the literal resynchronisation defect — survives the entire suite. Third, T007's settings half is absent: nothing in `src/` constructs `GovernorSettings` from `MassiveSettings`, and the two field names do not even correspond (`backoff_initial_seconds` vs `initial_backoff_seconds`), so the seam the plan names is neither implemented nor exercised.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md` |
| Component | `FactorFlow-v2` (reviewed in worktree `.claude/worktrees/pipeline-run-E3-S4-root/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S4` |
| HEAD | `0825bd76c72d5b980385143a6e24a71597f2bc0f` |
| Review base | merge-base with `usr/alvaro-de-jodra/CAP-001-E3-S3` = `d1cb17449019375e1fe78250311a82e71284ea48` (per the stacked-branch instruction; the `main` merge-base `7ed6d7c114ddd4d5fd1415e7c7602a2808b2ba5d` would pull in S2 and S3 work that carries its own reviews) |
| Working tree | clean before and after validation (`git status --porcelain` empty both times); `uv build` wrote only ignored `dist/` artifacts |
| Changed files reviewed | 9 |

`python3 scripts/pipeline-state.py check --repo-dir .claude/worktrees/pipeline-run-E3-S4-root/FactorFlow-v2 --capability CAP-001 --story <story> --stage adversarial-review` → `READY — story is ready for independent review` (exit 0). The same check run against `repos/factorflow-v2/FactorFlow-v2` returns `BLOCKED`, because that checkout sits on `usr/alvaro-de-jodra/CAP-001-E5-tasks` where the story still reads `status: planning`; the branch actually under review carries `status: in-review`. The reviewed revision `sha256:e32281e8…` matches the story's recorded `approval.reviewed_revision` exactly, so the approved story text is the text I reviewed against.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/rate_limit.py` | added | T001, T007, T008 |
| `src/factorflow/ingestion/__init__.py` | modified | T009 (re-exports only; the file pre-existed at the review base, so T001's "create" half is not applicable to it) |
| `tests/unit/governor_fakes.py` | added | T001 |
| `tests/unit/test_governor_pacing.py` | added | T002, T006 |
| `tests/unit/test_governor_retry.py` | added | T003, T004, T005 |
| `tests/unit/test_governor_backoff.py` | added | T004 |
| `…/CAP-001-E3-S4-tdd-evidence.yaml` | added | T010 |
| `…/CAP-001-E3-S4-tasks.md` | modified | task-state bookkeeping (T010 checkbox) |
| `…/CAP-001-E3-S4.md` | modified | status `in-progress` → `in-review`, `updated` date |

No unjustified file appears in the change set. No dependency, configuration, migration, or unrelated refactor was touched.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `rate_limit.py:161-179` `_acquire_permit`, `:86-88` capacity/refill | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_no_virtual_minute_window_exceeds_the_configured_budget` | Continuous-refill bucket at `rpm/60` tokens/s, one permit per send including each retry. The sustained-rate assertion holds; the per-window assertion is weaker than the design's own AC 1 — see IR-007. |
| DAC-E3-6 | SATISFIED | `rate_limit.py:135-144` (THROTTLED branch never touches `attempts`) | `test_governor_retry.py::test_repeated_throttled_outcomes_do_not_consume_attempts`, `::test_throttled_outcomes_do_not_share_the_retry_attempt_counter` | Independently confirmed by reproducing recorded mutation 2 (`attempts += 1` inside the THROTTLED branch): 1 failed, 18 passed, failing on the strengthening test exactly as recorded. |
| DAC-E3-7 | PARTIAL | `rate_limit.py:192-203` | `test_governor_retry.py::test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter` | The wait is to the next 60s multiple from governor construction, not from any instant tied to the provider's window, and only the degenerate `elapsed == 0` phase is ever tested. See IR-001. |
| DAC-E3-8 | SATISFIED | `rate_limit.py:150-157`, `:205-210` | `test_governor_retry.py::test_retryable_outcome_increments_attempts_and_retries_with_backoff`, `test_governor_backoff.py::test_backoff_delay_grows_exponentially_with_full_jitter` | Attempts increment only on the non-throttle path; cap doubles per attempt, asserted at exact values with a fixed jitter fraction. Default limit 3 confirmed at `settings.py:113` and in `test_no_fourth_send_after_the_default_attempt_limit`. |
| DAC-E3-9 | SATISFIED | `rate_limit.py:138-143` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises`, `::test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` | Endless 429 raises `ProviderUnavailable`; both throttle sub-paths are covered. Budget check follows the sleep, which matches the design flowchart (section 2.2 node J), so the overshoot of at most one wait is design-conformant. |
| DAC-E3-S4-1 | SATISFIED | `rate_limit.py:181-190` | `test_governor_retry.py::test_stated_delay_is_honoured_exactly_without_jitter` | Stated delay returned verbatim; the test also asserts `jitter.calls == 0`, so a misapplied jitter cannot hide. Recorded mutation 4 covers the inverse. |
| DAC-E3-S4-2 | PARTIAL | `rate_limit.py:192-198` | `test_governor_retry.py::test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter` | Jitter is applied and its magnitude is pinned, but nothing asserts that two boundary waits differ, which is the criterion's actual requirement. A frozen-jitter mutation survives all 19 tests. See IR-002. |
| DAC-E3-S4-3 | SATISFIED | `rate_limit.py:132-133` (bare `raise`) | `test_governor_retry.py::test_fatal_outcome_reraises_immediately_without_wait_or_retry` | Asserts the re-raised object is identical (`excinfo.value is boom`) and `sleeper.calls == []`, so neither wrapping nor a wait can slip in. |
| DAC-E3-S4-4 | SATISFIED | `rate_limit.py:151-154` | `test_governor_retry.py::test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_governor_backoff.py::test_no_fourth_send_after_the_default_attempt_limit` | `send.calls == 3` at `max_attempts=3` proves the fourth request is never issued. Recording the failure and continuing the run is CAP-001-E5's responsibility, as the task plan states. |
| DAC-E3-S4-5 | SATISFIED | `rate_limit.py:86-88`, `:167-175` | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_partial_refill_credits_elapsed_virtual_time` | Zero artificial delay up to capacity (`sleeper.calls == []`, `clock() == 0.0`), then exactly the refill wait (`60/capacity`). No sentinel or unlimited mode exists, per the owner resolution in the plan's Notes. |
| DAC-E3-S4-6 | SATISFIED | `rate_limit.py:122`, `:138-143` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises` | Both bounded loops verified; recorded mutation 6 (doubling the budget) is killed. Note IR-001 increases how many iterations fit inside the budget but does not remove the bound. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `rate_limit.py`, `governor_fakes.py`, three test files all present (`git diff --summary` shows `create mode` for five of six) | `src/factorflow/ingestion/__init__.py` already existed at the review base (created by CAP-001-E3-S3), so it was modified rather than created. Benign deviation. Fakes provide `FakeClock`, `FakeSleeper`, `SequenceJitter` and never touch real time. |
| T002 | complete | VERIFIED | `test_governor_pacing.py:47-100` | Capacity-`N` no-delay, `N+1` refill wait, and a per-window bound are all present. The window bound is weaker than the design's AC 1 (IR-007). |
| T003 | complete | PARTIAL | `test_governor_retry.py:63-169` | TC-COMP-200, 201, 203, 226 and 231 are implemented. TC-COMP-227 is labelled but not implemented (IR-002), and four TC-ID labels are misassigned against the spec's TC→DAC mapping (IR-004). |
| T004 | complete | VERIFIED | `test_governor_retry.py:175-217`, `test_governor_backoff.py:49-93` | TC-COMP-202, 228, 229 all genuinely exercised: attempts increment, no fourth send, FATAL re-raised with no sleep. |
| T005 | complete | VERIFIED | `test_governor_retry.py:223-246` | `_UnrelatedException` with a fixed classifier proves no type inspection; `test_ok_returns_the_sender_value_without_retry` asserts the `OK` path returns the sender's value with no sleep. `_never_classify` raising `AssertionError` is a good touch — it proves `classify` is not called on success. |
| T006 | complete | VERIFIED | `test_governor_pacing.py:106-145` | Partial refill credits elapsed virtual time (15s advance → exactly a 15s wait), one permit per send, fresh instance starts at capacity. |
| T007 | complete | PARTIAL | `rate_limit.py:41-94` | `Outcome` (StrEnum), frozen `GovernorSettings`, and the governor with injectable `monotonic`/`sleep`/`jitter` all match design section 2.3. The task's other half — constructing `GovernorSettings` from `MassiveSettings` — has no implementation anywhere in `src/` (IR-003). `settings.py` was correctly left untouched. |
| T008 | complete | VERIFIED | `rate_limit.py:96-210` | Permit acquisition, `OK` return, `FATAL` re-raise, distinct THROTTLED and RETRYABLE paths, `ProviderUnavailable` from CAP-001-E3-S3 on both exhaustion paths, and the documented `stated_delay_seconds` parameter citing design section 2.5 row 1, DAC-E3-S4-1 and TC-COMP-226 (`:109-116`). Carries IR-001 and IR-005. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py:15-21` | Exports exactly `GovernorSettings`, `Outcome`, `RateLimitGovernor`; no Massive-specific delay callback added, as instructed. |
| T010 | complete | VERIFIED | `CAP-001-E3-S4-tdd-evidence.yaml` | See "Mutation evidence" below — spot-checks reproduce exactly. The post-mutation command results I reran all match. |

## Test Quality Assessment

All 19 governor tests are deterministic and isolated: virtual clock only, no `sleep`, no network, no shared module state, no ordering dependence, no `postgres` marker (correct per design section 7). I reran the three files alone (19 passed) and inside the full suite (285 passed) with identical results.

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_repeated_throttled_outcomes_do_not_consume_attempts` / TC-COMP-200 | ADEQUATE | 5 throttles under `max_attempts=2` still succeed; `send.calls == 6` | none |
| `test_throttled_outcomes_do_not_share_the_retry_attempt_counter` / TC-COMP-200 | ADEQUATE | The stronger form: 3 throttles then a RETRYABLE under `max_attempts=2` must still retry, so the throttle path cannot have partially spent the counter | none — this is the test that kills mutation 2, and it is the reason that mutation was caught |
| `test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter` / TC-COMP-201 | WEAK | Asserts one wait of exactly 90.0 (60 boundary + 0.5 × 60 jitter) | Only the `elapsed == 0` phase is exercised, so the boundary computation itself is unpinned (IR-001); does not show two waits differing (IR-002) |
| `test_stated_delay_is_honoured_exactly_without_jitter` / TC-COMP-226 | ADEQUATE | Wait is exactly 12.5 and `jitter.calls == 0` with a 0.9 jitter stub that would visibly perturb it | none (label reads TC-COMP-203 — IR-004) |
| `test_boundary_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203, 231 | ADEQUATE | Raises `ProviderUnavailable`; `sleeper.calls == [60.0, 60.0]` pins both the count and the magnitude of the waits that spend the budget | none (labels read TC-COMP-226/227 — IR-004) |
| `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203 | ADEQUATE | Three 10.0s waits against a 25.0s budget, then raise | none |
| `test_retryable_outcome_increments_attempts_and_retries_with_backoff` / TC-COMP-202 | ADEQUATE | Succeeds on the third send with exactly two sleeps | none |
| `test_retry_limit_exhausted_raises_and_no_fourth_send` / TC-COMP-202, 229 | ADEQUATE | `send.calls == 3` under a sender that never succeeds | none |
| `test_fatal_outcome_reraises_immediately_without_wait_or_retry` / TC-COMP-228 | ADEQUATE | Identity of the re-raised exception plus `sleeper.calls == []` | Does not cover `KeyboardInterrupt`/`SystemExit` reaching `classify` (IR-006) |
| `test_governor_does_not_inspect_exception_type_only_the_classifier` | ADEQUATE | Unrelated exception class, fixed classifier, identical behavior | none |
| `test_ok_returns_the_sender_value_without_retry` | ADEQUATE | Returns 42, no sleep, `classify` never called | none |
| `test_backoff_delay_grows_exponentially_with_full_jitter` / TC-COMP-202 | ADEQUATE | `[0.9 × 2.0, 0.9 × 4.0]` exactly; fixing the jitter fraction isolates the cap's growth | Pins `initial × 2**(attempts-1)`, which differs from the design's literal wording (IR-008). Label reads TC-COMP-228 (IR-004) |
| `test_successive_backoff_delays_are_not_identical` | ADEQUATE | `len(set(sleeper.calls)) > 1` across four jittered retries | Covers the backoff path only; the boundary path has no analogue (IR-002) |
| `test_no_fourth_send_after_the_default_attempt_limit` / TC-COMP-229 | ADEQUATE | `send.calls == 3` at the default limit | none |
| `test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill` / TC-COMP-230 | ADEQUATE | `sleeper.calls == []` and `clock() == 0.0` for `N` sends, then exactly `60/N` | none |
| `test_no_virtual_minute_window_exceeds_the_configured_budget` / AC-4 | WEAK | Asserts `count ≤ capacity + refill_rate × 60`, i.e. up to 2× the budget in a one-minute window | Cannot detect a pacing regression up to double the budget (IR-007) |
| `test_partial_refill_credits_elapsed_virtual_time` | ADEQUATE | 15s advance at a 30s-per-token rate yields exactly a 15s wait | none |
| `test_each_send_consumes_exactly_one_permit` | ADEQUATE | Capacity sends free, the next one waits | none |
| `test_new_governor_instance_starts_with_configured_bucket_capacity` | ADEQUATE | Fresh instance grants `capacity` sends with no sleep | none |

### Mutation evidence (independent verification of T010)

I treated `CAP-001-E3-S4-tdd-evidence.yaml` as a claim and reproduced two of its six mutations against the same file, restoring from a scratchpad copy after each and confirming the SHA-256 of `rate_limit.py` returned to `3fa141ba1845416d75aca5e4e189d17239c8cbfdc8368c003db631c710b87388` with `git status` clean:

- **Recorded mutation 2** (`attempts += 1` inside the THROTTLED branch): observed `1 failed, 18 passed`, failing `test_throttled_outcomes_do_not_share_the_retry_attempt_counter` with `ProviderUnavailable: The provider failed 4 consecutive attempts.` — matches the recorded result exactly, including the count and the test name.
- **Recorded mutation 3** (`_SECONDS_PER_MINUTE - remainder` → `remainder`): observed `2 failed, 17 passed`, failing `test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter` and `test_boundary_throttle_wait_exhausts_the_budget_and_raises` — matches exactly.

The baseline the evidence names (`e554152`) is genuine: `rate_limit.py` is byte-identical between `e554152` and `HEAD`, and the final commit's only test change is the strengthening test the evidence and commit message both disclose. The recorded full-validation results also match what I measured independently. I consider the mutation evidence credible.

I then ran two probe mutations of my own, which the recorded session did not cover:

- **Probe A** — `_seconds_to_next_boundary` body replaced with `return _SECONDS_PER_MINUTE`: **all 19 tests pass**. The boundary computation is entirely unpinned (evidence for IR-001).
- **Probe B** — the boundary jitter draw frozen after its first call (every throttled caller then resynchronises onto the same offset): **all 19 tests pass**. This is the literal defect TC-COMP-227 exists to catch (evidence for IR-002).

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest tests/unit/test_governor_pacing.py tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py -q` | worktree root | 0 | PASS | 19 passed in 0.05s |
| `uv run pytest -m 'not postgres' -q` | worktree root | 0 | PASS | 226 passed, 59 deselected, 2 warnings |
| `uv run pytest -q` | worktree root | 0 | PASS | 285 passed (includes postgres-marked tests; container runtime available) |
| `uv run ruff check .` | worktree root | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | worktree root | 0 | PASS | 94 files already formatted |
| `uv run mypy src` | worktree root | 0 | PASS | Success, no issues found in 28 source files |
| `uv build` | worktree root | 0 | PASS | sdist + wheel built |

Every command in the plan's Validation Plan and the tech stack's command table was rerun in full; none was substituted with a narrower form.

### Validation Side Effects

- Before: `git status --porcelain` empty; HEAD `0825bd76c72d5b980385143a6e24a71597f2bc0f`.
- After: `git status --porcelain` empty; HEAD unchanged. `uv build` produced `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl`, which are git-ignored.
- Unexpected tracked-file changes: none. My mutation probes were reverted from a scratchpad copy and verified by SHA-256 and a clean `git diff`.

## Findings

### IR-001 — The throttled path's "minute boundary" is anchored to governor construction, not to the provider's window, and can produce a near-zero wait

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-7 (PARTIAL); affects DAC-E3-S4-6
- **Tasks**: T008, T003
- **Files**: `src/factorflow/ingestion/rate_limit.py:90-94` (`_boundary_epoch`), `:200-203` (`_seconds_to_next_boundary`)
- **Claim challenged**: that the no-delay throttle path "waits to the next minute boundary, matching the fixed per-minute window the provider actually enforces".
- **Observed evidence**: `_boundary_epoch` is set to `monotonic()` at construction, and the wait is `60 - ((monotonic() - _boundary_epoch) % 60)`. The epoch therefore has no relationship to any instant the provider shares, and the computed wait falls anywhere in `(0, 60]` depending on how long the governor has been alive when the 429 arrives — for instance ~0.5s if the throttle lands just before a 60s multiple of the process's own lifetime. The in-code comment acknowledges the choice and justifies it by the injected `monotonic` collaborator, i.e. a test-seam constraint is driving production behavior. Probe A (body replaced with `return _SECONDS_PER_MINUTE`) leaves all 19 tests green, so no test pins any of this: every existing test throttles at `clock() == 0.0`, the one phase where the formula coincidentally yields a full 60s.
- **Expected evidence/behavior**: design section 2.5 row 2 and the story's DAC-E3-7 require the wait to reach the provider's next per-minute refill, on the explicit reasoning that "exponential backoff would either wait far past the refill, idling the run, or retry before it and consume a second 429". A wait of a fraction of a second is precisely the second failure mode, reached through a different route.
- **Impact**: under sustained throttling the governor can retry well inside the provider's current window, consuming extra 429s and spending the 300s throttle budget on waits that cannot succeed, so an instrument can fail as "persistently throttled" after far less real waiting than the budget implies. It also silently weakens DAC-E3-S4-6's bound in practice, because many short waits fit where five 60s waits were intended.
- **Required remediation**: anchor the boundary wait to an instant that tracks the provider's window (a wall-clock source injected alongside `monotonic` is the obvious route, keeping determinism), or — if the owner decides the provider's window phase is genuinely unobservable — replace the boundary computation with the deliberate, documented behavior that is actually wanted and record the deviation from design section 2.5 in the task plan. Either way, add a test that throttles at a non-zero phase and pins the resulting wait, so the computation is no longer free.

### IR-002 — TC-COMP-227 / DAC-E3-S4-2 has no implementing test; a frozen-jitter mutation survives the whole suite

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S4-2 (PARTIAL)
- **Tasks**: T003
- **Files**: `tests/unit/test_governor_retry.py:99-112` (the test labelled DAC-E3-S4-2), `:137-153` (where the TC-COMP-227 label actually sits), `src/factorflow/ingestion/rate_limit.py:192-198`
- **Claim challenged**: the task plan's claim that TC-COMP-227 is implemented, and the test-file comment at line 137 that maps it onto the budget-exhaustion tests.
- **Observed evidence**: the two tests under the TC-COMP-227 label both construct `SequenceJitter([0.0])`, so they cannot observe jitter variation at all. The only boundary-jitter test asserts a single wait of 90.0 with a fixed stub of 0.5. Probe B — freezing the jitter draw after its first call, so every throttled caller resumes at the identical offset — leaves all 19 tests passing. No test anywhere asserts that two boundary waits differ; `test_successive_backoff_delays_are_not_identical` covers the exponential-backoff path only.
- **Expected evidence/behavior**: TC-COMP-227's expected result is that "full jitter is applied so they do not resynchronise onto the same instant"; design section 7 states it as "two callers throttled in the same window do not resume at the identical instant"; the story's Testing section asks for "asserting successive computed delays are not identical". The skill's gate requires mandatory TC-IDs to be implemented, not merely labelled.
- **Impact**: the component's anti-resynchronisation property is unverified, and a regression that fixes or caches the jitter draw — the defect the criterion names — would ship green. For a single-threaded runner the present consequence is modest, but the criterion exists for the concurrent-fetch path design section 5 anticipates.
- **Required remediation**: add a test on the boundary path that drives at least two throttled waits through a varying jitter source and asserts the computed waits differ, and move the TC-COMP-227 label onto it.

### IR-003 — T007's `MassiveSettings` → `GovernorSettings` construction does not exist, and the field names do not correspond

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-4, DAC-E3-S4-5 (both traced to T007 by the plan's traceability table)
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/rate_limit.py:51-61`, `src/factorflow/config/settings.py:107-121`
- **Claim challenged**: T007's checked claim to "construct `GovernorSettings` from the existing positive `MassiveSettings.requests_per_minute`, attempt limit, initial backoff, and throttle-wait fields".
- **Observed evidence**: grepping `src/` and `tests/` for `GovernorSettings` finds only its definition, the `__init__.py` re-export, and the three test helpers that build it literally. Nothing maps `MassiveSettings` onto it — no classmethod, no factory, no caller — and the names diverge: `MassiveSettings.backoff_initial_seconds` versus `GovernorSettings.initial_backoff_seconds`. `GovernorSettings` is a plain frozen dataclass with no validation, so the `ge=1` guarantee that `settings.py:112` enforces does not travel with the value; constructing it with `requests_per_minute=0` yields `ZeroDivisionError` inside `_acquire_permit` (`_refill_rate` is 0.0 at `:87`, and `:178` divides by it) rather than a clear construction-time failure.
- **Expected evidence/behavior**: T007 names the construction explicitly, and AC-4/DAC-E3-S4-5 depend on the owner's configured budget actually reaching the bucket. Either the mapping exists and is tested, or the plan's attribution of it to T007 is wrong and that belongs in a recorded deviation.
- **Impact**: the one seam between configuration and pacing is unimplemented and unexercised, with a name mismatch sitting in it — a transposition CAP-001-E3-S1 would have to notice unaided. Nothing today proves the governor can be built from the owner's settings at all.
- **Required remediation**: either add the construction (a `GovernorSettings.from_massive_settings` classmethod or equivalent) with a test that builds it from a real `MassiveSettings` instance and asserts each field lands in the right place, or record a justified deviation stating that CAP-001-E3-S1 owns the mapping — and in that case reconcile the field names or note the divergence where S1 will see it. I read the plan's wording as asking for the former, but the choice is legitimately the owner's.

### IR-004 — Four TC-ID labels in the test files contradict the component test specification's TC→DAC mapping

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: T003, T004
- **Files**: `tests/unit/test_governor_retry.py:115`, `:137`, `tests/unit/test_governor_backoff.py:46`
- **Claim challenged**: that the mandatory TC-IDs retain traceability to `docs/.../tests/component/all-component-tests.md`.
- **Observed evidence**: per the specification, TC-COMP-203 traces to DAC-E3-9 (throttle-wait bound) and TC-COMP-226 to DAC-E3-S4-1 (stated delay). The files have them swapped: line 115 reads `TC-COMP-203 / DAC-E3-S4-1` above the stated-delay test, and line 137 reads `TC-COMP-226 / TC-COMP-227 / TC-COMP-231` above the budget-exhaustion tests. In `test_governor_backoff.py`, line 46 labels the backoff-growth test `TC-COMP-228 / DAC-E3-8`, but TC-COMP-228 is the FATAL re-raise case (DAC-E3-S4-3) and DAC-E3-8 is TC-COMP-202. TC-COMP-227 appears only where its behavior is not exercised (see IR-002).
- **Expected evidence/behavior**: the plan's mandatory-test tasks enumerate specific TC-IDs per file, and the coverage matrix is read downstream by doc sync and release readiness.
- **Impact**: anyone auditing coverage by TC-ID gets the wrong answer in four places, and the mislabelling is what let IR-002's gap pass unnoticed.
- **Required remediation**: correct the four labels against the specification's mapping.

### IR-005 — Boundary jitter is additive, not "full jitter over the computed delay" as design section 2.5 states

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-7, DAC-E3-S4-2
- **Tasks**: T003, T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:192-198`
- **Claim challenged**: T003's and T008's wording that the no-delay throttle path uses "full jitter".
- **Observed evidence**: the boundary wait is `boundary_wait + jitter() * boundary_wait`, i.e. uniform over `[boundary, 2 × boundary]`. The backoff path at `:205-210` does use full jitter (`jitter() * cap`, uniform over `[0, cap)`), so the two paths read the same in the plan but differ in the code.
- **Expected evidence/behavior**: design section 2.5 closes with "Jitter is full jitter over the computed delay".
- **Impact**: this is almost certainly the right engineering call — true full jitter over a boundary wait would often retry before the quota refills, which the same design section argues against — but it is an undeclared divergence from an approved design sentence, and it changes the throttle budget arithmetic (a single wait can reach ~120s against a 300s budget, so as few as three waits exhaust it rather than five).
- **Required remediation**: record the deviation in the task plan's notes for the next design revision, and state the intended range in the code comment and the test so the choice is deliberate rather than incidental.

### IR-006 — `except BaseException` hands `KeyboardInterrupt` and `SystemExit` to the caller's classifier

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (robustness; touches design section 9's cancellation expectation)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:129-130`
- **Claim challenged**: that routing every raised exception through `classify` is safe for the cancellation path.
- **Observed evidence**: the catch is `except BaseException`, so `KeyboardInterrupt` and `SystemExit` are passed to `classify`. CAP-001-E3-S3's `is_fatal_for_governor` is typed for `MassiveError` inputs, so a caller's classifier will need its own fallback for anything else; a fallback of RETRYABLE or THROTTLED — the natural safe-looking defaults — would make the governor sleep and retry on a Ctrl-C. No test covers either exception type.
- **Expected evidence/behavior**: the `Callable[[BaseException], Outcome]` signature is design-mandated, so catching broadly conforms; but design section 9 expects a cancellation request to take effect, and a long backoff that swallows the interrupt contradicts that.
- **Impact**: an owner interrupting a long run could see it sleep through the signal, depending on how CAP-001-E3-S1 writes its classifier. The governor is the component that chooses to hand those exceptions over, so the guard belongs here.
- **Required remediation**: re-raise `KeyboardInterrupt` and `SystemExit` before classification (or document the contract and assert it in a test), so cancellation cannot depend on a caller's fallback branch.

### IR-007 — The per-window pacing test asserts a bound of twice the configured budget

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-4
- **Tasks**: T002
- **Files**: `tests/unit/test_governor_pacing.py:67-100`
- **Claim challenged**: T002's claim that "no virtual one-minute window issues more than the configured budget".
- **Observed evidence**: the assertion is `count_in_window <= capacity + refill_rate * 60.0`, which at `capacity=3` permits 6 sends in a one-minute window — double the budget. The test's own docstring explains why the stronger claim is false for a continuously refilling bucket that starts full, which T006 requires. The weaker bound is mathematically correct but would not fail until a regression doubled the issue rate.
- **Expected evidence/behavior**: design acceptance criterion 1 states "Requests issue at no more than the configured budget over any one-minute window", and design section 2.4 chose a token bucket specifically to avoid "a burst at each boundary that a provider's own limiter will reject". With a bucket that starts at capacity, the first window can legitimately carry `capacity` burst plus a window's refill, so the design's AC 1 and T006's full-bucket start cannot both hold as written.
- **Impact**: the story's headline pacing guarantee rests on an assertion that tolerates twice the budget, and a real tension between two approved statements is resolved only inside a test docstring. Against the Basic tier's five calls per minute this is the difference between pacing and being throttled.
- **Required remediation**: raise the conflict for an owner decision and record it — either the bucket starts empty (or at capacity with a documented first-window exception) and the test asserts the budget strictly, or design AC 1 is amended to the standard token-bucket bound. Strengthen the test to match whichever is chosen; a steady-state window assertion after the initial burst would pin far more than the present bound.

### IR-008 — Backoff cap is `initial × 2**(attempts-1)`, one doubling below the design's literal wording

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-8
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:205-210`, `tests/unit/test_governor_backoff.py:49-66`
- **Claim challenged**: conformance to "initial delay times two to the power of attempts".
- **Observed evidence**: the cap on the first retry is `initial × 2**0 = initial` (2.0s at the configured default), and the test pins exactly that. Design section 2.5 row 3, the flowchart's node N, and the story's own outcome table all read "initial delay times two to the power of attempts", which taken literally gives `2 × initial` on the first retry.
- **Expected evidence/behavior**: the design's literal arithmetic, or a recorded deviation.
- **Impact**: none operationally — the implementation is the conventional reading and the bound still holds — but the design text and the code disagree, and the test now freezes the code's reading.
- **Required remediation**: record the interpretation in the task plan's notes so the next design revision can align the wording.

### IR-009 — Exhaustion failures carry no structured attempt count or request id

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A for this story (design section 13's AC-10 row)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:140-143`, `:152-154`
- **Claim challenged**: design section 13's traceability row "Typed exhaustion failures carrying attempt count and status".
- **Observed evidence**: both raises pass only a message string; the attempt count appears as interpolated text (`f"The provider failed {attempts} consecutive attempts."`) and `provider_request_id` defaults to `None`. `MassiveError.__init__` does accept `provider_request_id`.
- **Expected evidence/behavior**: a structured attempt count would let the runner compose a failure reason without parsing prose. The governor genuinely cannot know the request id, since it never inspects the exception.
- **Impact**: CAP-001-E5 must either re-derive the count or carry the sentence verbatim into a stored reason.
- **Required remediation**: note it for the runner story or the next design revision; no change required in this story.

### IR-010 — Design section 7's `test_governor_logging.py` row has no implementation, and the governor emits no log records at all

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A for this story (design acceptance criterion 9, AC-13)
- **Tasks**: N/A
- **Files**: absent (`tests/unit/test_governor_logging.py`), `src/factorflow/ingestion/rate_limit.py` (no logging import)
- **Claim challenged**: design section 4's statement that "Log records name the attempt index, the delay and the status code".
- **Observed evidence**: the module imports no logger and emits nothing, so the described retry logging does not exist and the test row in design section 7 is unimplemented. The story scopes itself to design sections 2.5 and 3, and the task plan never mentions logging, so this is outside the implemented plan rather than a missed task.
- **Expected evidence/behavior**: design sections 4 and 7 describe retry log records and a test proving no URL appears in them.
- **Impact**: none to AC-13 today — no log record exists to leak a URL — but an operator diagnosing a slow run gets no governor signal, and a later story that adds logging inherits an unwritten test.
- **Required remediation**: confirm with the owner whether governor logging belongs to a later story, and record that decision so the design section 7 row is not silently dropped.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **No scope leakage.** All nine changed files trace to the story or its task plan; no dependency, migration, configuration, or unrelated refactor was touched, and `src/factorflow/config/settings.py` was correctly left alone as T007 requires.
- **T001 bookkeeping.** `src/factorflow/ingestion/__init__.py` already existed at the review base (CAP-001-E3-S3 created it), so T001's instruction to create it is not applicable for that one path; T009 modified it as planned. Benign.
- **The reviewed base predates CAP-001-E3-S3's rework.** This branch is stacked on `d1cb1744`, while `usr/alvaro-de-jodra/CAP-001-E3-S3` has since advanced by two commits, one of which edits `src/factorflow/ingestion/massive/errors.py`. I diffed that file between the two states: the only change is inside `is_rate_limited_body` (`fields["error"] or fields["message"] or ""` → `fields["error"] or ""`). It does not touch `ProviderUnavailable` or `MassiveError.__init__`, which is S4's entire dependency surface, so this story's validation evidence survives restacking. Worth re-running the suite once after the restack regardless.
- **Interface gap already recorded by the plan.** The `stated_delay_seconds` callback added to `execute` is a documented, owner-resolved addition to design section 2.3's signature, disclosed in the plan's Notes and in the code's docstring. Not a finding; it should reach the next design revision.
- **Task state is otherwise honest.** All ten boxes are checked and all ten have real implementation evidence; the two PARTIAL results are incomplete work, not miscounted bookkeeping. The story's `status: in-review` is correct.

## Follow-Up

- **Next agent**: Coding Agent, with this report and `CAP-001-E3-S4-tasks.md`.
- **Required action**: resolve IR-001, IR-002 and IR-003, which block the gate. IR-001 needs an owner decision on what the boundary should be anchored to before code changes; IR-003 needs a one-line decision on whether the settings mapping belongs to this story or to CAP-001-E3-S1. IR-004 through IR-007 are cheap to address in the same pass and two of them (IR-004, IR-007) are what let the HIGH gaps hide. Then rerun `$adversarial-review` for a v2 report.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED, so nothing proceeds to Doc Sync.
