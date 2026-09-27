---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-13
updated: 2026-09-13
story_id: "CAP-001-E3-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-13T17:19:16Z"
reviewed_head: "58052fdce2cd0b9c8b3cea0c0a5af0c7d713c472"
review_base: "d1cb17449019375e1fe78250311a82e71284ea48"
reviewed_state_revision: "sha256:3b6c460384be49fa04fb9fe69d474a7dcbded2b74f0a460aabc8f0df0b92dedc"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-13T17:19:16Z
  source_artifacts:
    - id: CAP-001-E3-S4
      version: "1"
    - id: CAP-001-E3-S4-tasks
      version: "1"
    - id: CAP-001-E3-S4-implementation-review
      version: "1"
    - id: CAP-001-component-design-rate-limit-governor
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S4 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 6 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 7/7 passed |

All three v1 HIGH findings are resolved, and I verified each one by re-deriving the behavior from the repository rather than by reading the rework commit message.

**IR-001 (boundary anchoring).** The owner's decision — inject a wall-clock `now: Callable[[], float]` and anchor the boundary wait to it — is implemented literally: `rate_limit.py:97` adds the collaborator defaulting to `time.time`, and `_seconds_to_next_boundary` (`:229-237`) now reads `self._now() % 60`, with the construction-time `_boundary_epoch` field deleted entirely. The wait therefore lands on a true wall-clock `:00` second, which is the instant the provider's fixed per-minute window actually turns over. I reran the reviewer's **Probe A** from v1 (whole body replaced with `return _SECONDS_PER_MINUTE`): it now **fails** `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time`, where in v1 it left every test green. I also ran a new **Probe D** that regresses the anchor back to `self._monotonic()` — the v1 defect in its purest form — and it is killed by two tests. The boundary computation is no longer free.

**IR-002 (TC-COMP-227).** `test_successive_boundary_throttle_waits_receive_independent_jitter` (`test_governor_retry.py:165-192`) drives two boundary waits through `SequenceJitter([0.2, 0.8])` and pins both (72.0, 108.0) plus an explicit inequality assertion, and the TC-COMP-227 label moved onto it from the budget-exhaustion tests where it did not belong. The reviewer's **Probe B** (freezing the jitter draw after its first call — the literal resynchronisation defect) now **fails** that test; in v1 it survived the entire suite.

**IR-003 (settings mapping).** The owner's decision — implement `GovernorSettings.from_massive_settings()` in this story, mapping `MassiveSettings.backoff_initial_seconds` onto `GovernorSettings.initial_backoff_seconds` — is implemented exactly as directed (`rate_limit.py:66-78`), under `TYPE_CHECKING` so no runtime import cycle is created, and covered by a new `tests/unit/test_governor_settings.py` that builds from a real `MassiveSettings` instance and asserts every field, including `MassiveSettings`'s own defaults. I verified the four source field names against `settings.py:107-121` directly. Two probes of my own (**C**: remap `initial_backoff_seconds` to `timeout_seconds`; **E**: hardcode the throttle budget) are both killed.

The two MEDIUM findings the rework claims (IR-004 labels, IR-005 recorded deviation) are genuinely done: I checked all seven TC-ID headers in the two test files against `all-component-tests.md`'s TC→DAC mapping and they now agree, and the deviation is recorded in the plan's Notes, in `_boundary_wait_with_jitter`'s docstring, and in the covering test's docstring.

What remains is three MEDIUM and six LOW findings, none of which leaves an acceptance criterion, required task, mandatory test, or validation command unsatisfied. Two of the MEDIUMs (IR-001, IR-002 below) are carry-overs the rework deliberately did not attempt — note that the rework commit message classifies them as LOW, but v1 recorded both as MEDIUM. One MEDIUM is new: `CAP-001-E3-S4-tdd-evidence.yaml` was not refreshed, so the story's TDD evidence artifact now describes a pre-rework baseline. I closed that evidence gap myself with five independent mutation probes rather than treating it as a blocking task failure; the rationale is set out under IR-003 below.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md` |
| Component | `FactorFlow-v2` (reviewed in worktree `.claude/worktrees/pipeline-run-E3-S4-root/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S4` |
| HEAD | `58052fdce2cd0b9c8b3cea0c0a5af0c7d713c472` |
| Review base | merge-base with `usr/alvaro-de-jodra/CAP-001-E3-S3` = `d1cb17449019375e1fe78250311a82e71284ea48` (per the stacked-branch instruction; the same base v1 used) |
| Working tree | clean before and after validation and all five mutation probes (`git status --porcelain` empty each time) |
| Changed files reviewed | 11 (10 excluding this agent's own v1 report) |

`python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story <story> --stage adversarial-review --repo-dir .claude/worktrees/pipeline-run-E3-S4-root/FactorFlow-v2` → `READY — review changes were reworked; a new review version is required` (exit 0).

The story's content revision is `sha256:e32281e8…`, byte-identical to v1's and to the story's own recorded `approval.reviewed_revision` — the rework changed only the story's `updated` date, which is outside the hashed content. So the approved story text is still the text I reviewed against, and this is a like-for-like re-review.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/rate_limit.py` | added (modified by rework) | T001, T007, T008; rework: IR-001, IR-003, IR-005 |
| `src/factorflow/ingestion/__init__.py` | modified | T009 |
| `tests/unit/governor_fakes.py` | added | T001 (unchanged by the rework) |
| `tests/unit/test_governor_pacing.py` | added | T002, T006 (unchanged by the rework) |
| `tests/unit/test_governor_retry.py` | added (modified by rework) | T003, T004, T005; rework: IR-001, IR-002, IR-004, IR-005 |
| `tests/unit/test_governor_backoff.py` | added (modified by rework) | T004; rework: IR-004 label correction only |
| `tests/unit/test_governor_settings.py` | added by rework | IR-003 remediation (see Scope and Plan Deviations) |
| `…/CAP-001-E3-S4-tdd-evidence.yaml` | added | T010 (not refreshed by the rework — IR-003 below) |
| `…/CAP-001-E3-S4-tasks.md` | modified | task-state bookkeeping; rework: IR-005 deviation note, `last_reworked_review` |
| `…/CAP-001-E3-S4.md` | modified | status and `updated` date only |
| `…/CAP-001-E3-S4-implementation-review-v1.md` | added | this agent's own v1 report |

No unjustified file appears in the change set. `src/factorflow/config/settings.py` remains untouched, as T007 requires — the new factory reads `MassiveSettings` without modifying it. No dependency, migration, or configuration change.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `rate_limit.py:180-198` `_acquire_permit`, `:110-111` capacity/refill; `:66-78` `from_massive_settings` now carries the owner's configured budget into the bucket | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_no_virtual_minute_window_exceeds_the_configured_budget`, `test_governor_settings.py::test_from_massive_settings_maps_every_field_correctly` | The config→pacing seam v1 found missing now exists and is exercised. The per-window assertion remains weaker than the design's own AC 1 — IR-002 below, carried from v1's IR-007. |
| DAC-E3-6 | SATISFIED | `rate_limit.py:154-163` (THROTTLED branch never touches `attempts`) | `test_governor_retry.py::test_repeated_throttled_outcomes_do_not_consume_attempts`, `::test_throttled_outcomes_do_not_share_the_retry_attempt_counter` | Branch unchanged by the rework; v1's independent reproduction of recorded mutation 2 still applies. |
| DAC-E3-7 | **SATISFIED** (was PARTIAL) | `rate_limit.py:229-237` `_seconds_to_next_boundary`, anchored to injected `now` | `test_governor_retry.py::test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter` (phase 0, wait 90.0), `::test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` (phase 5s into a minute, wait 82.5) | The wait now tracks the provider's real per-minute window instead of an arbitrary phase of the governor's lifetime. A non-zero phase is tested and pinned; Probe A and Probe D are both killed. v1's IR-001 resolved. |
| DAC-E3-8 | SATISFIED | `rate_limit.py:169-176`, `:239-244` | `test_governor_retry.py::test_retryable_outcome_increments_attempts_and_retries_with_backoff`, `test_governor_backoff.py::test_backoff_delay_grows_exponentially_with_full_jitter` | Unchanged by the rework. Default limit 3 confirmed at `settings.py:113` and now also asserted through `from_massive_settings` defaults. |
| DAC-E3-9 | SATISFIED | `rate_limit.py:154-163` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises`, `::test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` | Unchanged. The wall-clock anchoring strengthens this: waits are now genuinely full-window-sized, so the budget buys the real waiting it was sized for. |
| DAC-E3-S4-1 | SATISFIED | `rate_limit.py:200-209` | `test_governor_retry.py::test_stated_delay_is_honoured_exactly_without_jitter` | Unchanged; the TC-COMP-226 label now sits on it correctly. |
| DAC-E3-S4-2 | **SATISFIED** (was PARTIAL) | `rate_limit.py:211-227` | `test_governor_retry.py::test_successive_boundary_throttle_waits_receive_independent_jitter` (TC-COMP-227) | Two boundary waits driven through a varying jitter source, both values pinned, plus an explicit inequality assertion. Probe B is killed. v1's IR-002 resolved. |
| DAC-E3-S4-3 | SATISFIED | `rate_limit.py:151-152` (bare `raise`) | `test_governor_retry.py::test_fatal_outcome_reraises_immediately_without_wait_or_retry` | Unchanged. Asserts re-raised object identity and `sleeper.calls == []`. |
| DAC-E3-S4-4 | SATISFIED | `rate_limit.py:169-173` | `test_governor_retry.py::test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_governor_backoff.py::test_no_fourth_send_after_the_default_attempt_limit` | Unchanged. |
| DAC-E3-S4-5 | SATISFIED | `rate_limit.py:110-112`, `:186-198` | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_partial_refill_credits_elapsed_virtual_time` | Unchanged. |
| DAC-E3-S4-6 | SATISFIED | `rate_limit.py:141`, `:154-163` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises` | Both bounded loops verified. v1's caveat that IR-001 let many short waits fit inside the budget no longer applies: each boundary wait is now a genuine fraction-to-full minute anchored to the provider's window. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `rate_limit.py`, `governor_fakes.py`, three test files present | Unchanged from v1. `src/factorflow/ingestion/__init__.py` pre-existed at the review base; benign deviation, as recorded in v1. |
| T002 | complete | VERIFIED | `test_governor_pacing.py:47-100` | Unchanged by the rework. Window bound remains weaker than design AC 1 (IR-002 below). |
| T003 | complete | **VERIFIED** (was PARTIAL) | `test_governor_retry.py:67-249` | TC-COMP-200, 201, 203, 226, 227 and 231 are now all implemented and correctly labelled. TC-COMP-227 has a real implementing test that kills the defect it names. |
| T004 | complete | VERIFIED | `test_governor_retry.py:255-297`, `test_governor_backoff.py:49-93` | TC-COMP-202, 228, 229 genuinely exercised; labels corrected. |
| T005 | complete | VERIFIED | `test_governor_retry.py:303-326` | Unchanged. |
| T006 | complete | VERIFIED | `test_governor_pacing.py:106-145` | Unchanged. |
| T007 | complete | **VERIFIED** (was PARTIAL) | `rate_limit.py:54-78`, `tests/unit/test_governor_settings.py` | `Outcome`, frozen `GovernorSettings`, the governor's injectable collaborators, **and** the `MassiveSettings` → `GovernorSettings` construction the task names. Field names reconciled in the factory; `settings.py` still untouched, as required. |
| T008 | complete | VERIFIED | `rate_limit.py:115-244` | Permit acquisition, `OK` return, `FATAL` re-raise, distinct THROTTLED/RETRYABLE paths, `ProviderUnavailable` on both exhaustion paths, the documented `stated_delay_seconds` parameter. Now additionally carries the wall-clock-anchored boundary (IR-001) and the documented jitter range (IR-005). |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py:15-21` | Unchanged; still exports exactly the three names with no Massive-specific delay callback. |
| T010 | complete | VERIFIED (with IR-003) | `CAP-001-E3-S4-tdd-evidence.yaml` | The six mutations T010 names are all recorded, and each still applies textually to the current code. The artifact was not refreshed after the rework, so its baseline commit and post-mutation counts are stale — recorded as IR-003 (MEDIUM). I did not downgrade the task to PARTIAL because the property T010 exists to establish is established: I independently reproduced five mutation probes against the reworked code, including two covering behavior added by the rework, and all five were killed. The finding is evidence staleness, not an unverified implementation. |

## Test Quality Assessment

All 23 governor tests are deterministic under a virtual clock, with no real sleep, no network, no shared module state, and no ordering dependence; none carries the `postgres` marker. I ran the four files alone (23 passed) and inside the full suite (289 passed) with identical results, and ran them in isolation twice to check for order coupling.

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_repeated_throttled_outcomes_do_not_consume_attempts` / TC-COMP-200 | ADEQUATE | 5 throttles under `max_attempts=2` still succeed; `send.calls == 6` | none |
| `test_throttled_outcomes_do_not_share_the_retry_attempt_counter` / TC-COMP-200 | ADEQUATE | 3 throttles then a RETRYABLE under `max_attempts=2` must still retry | none |
| `test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter` / TC-COMP-201 | ADEQUATE (was WEAK) | Wait of exactly 90.0 at wall-clock phase 0 | The degenerate-phase concern is now covered by its sibling below; docstring states the additive-jitter range, per IR-005 |
| `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` / TC-COMP-201, IR-001 | ADEQUATE (new) | Wall clock at 125.0 → 55s to the boundary → 82.5s with 0.5 jitter, pinned exactly. Deliberately chosen as a non-multiple-of-60 phase so a constant-returning implementation cannot pass | none — this is the test that kills Probe A |
| `test_successive_boundary_throttle_waits_receive_independent_jitter` / TC-COMP-227 | ADEQUATE (new) | Two boundary waits through `SequenceJitter([0.2, 0.8])`: both magnitudes pinned (72.0, 108.0) *and* asserted unequal | The wall clock does not advance between the two waits (IR-006, LOW); the jitter-independence property itself is soundly pinned |
| `test_stated_delay_is_honoured_exactly_without_jitter` / TC-COMP-226 | ADEQUATE | Wait exactly 12.5 and `jitter.calls == 0` under a 0.9 stub | none; label now correct |
| `test_boundary_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203, 231 | ADEQUATE | Raises `ProviderUnavailable`; `sleeper.calls == [60.0, 60.0]` pins count and magnitude | none; label now correct |
| `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203 | ADEQUATE | Three 10.0s waits against a 25.0s budget, then raise | none |
| `test_retryable_outcome_increments_attempts_and_retries_with_backoff` / TC-COMP-202 | ADEQUATE | Succeeds on the third send with exactly two sleeps | none |
| `test_retry_limit_exhausted_raises_and_no_fourth_send` / TC-COMP-202, 229 | ADEQUATE | `send.calls == 3` under a never-succeeding sender | none |
| `test_fatal_outcome_reraises_immediately_without_wait_or_retry` / TC-COMP-228 | ADEQUATE | Re-raised object identity plus `sleeper.calls == []` | Still no `KeyboardInterrupt`/`SystemExit` coverage (IR-001 below, carried from v1's IR-006) |
| `test_governor_does_not_inspect_exception_type_only_the_classifier` | ADEQUATE | Unrelated exception class, fixed classifier, identical behavior | none |
| `test_ok_returns_the_sender_value_without_retry` | ADEQUATE | Returns 42, no sleep, `classify` never called (`_never_classify` raises if it is) | none |
| `test_backoff_delay_grows_exponentially_with_full_jitter` / TC-COMP-202 | ADEQUATE | `[0.9 × 2.0, 0.9 × 4.0]` exactly | Pins `initial × 2**(attempts-1)` (IR-005 below, carried from v1's IR-008); label now correct |
| `test_successive_backoff_delays_are_not_identical` | ADEQUATE | `len(set(sleeper.calls)) > 1` across four jittered retries | none — the boundary path now has its own analogue |
| `test_no_fourth_send_after_the_default_attempt_limit` / TC-COMP-229 | ADEQUATE | `send.calls == 3` at the default limit | none |
| `test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill` / TC-COMP-230 | ADEQUATE | `sleeper.calls == []` and `clock() == 0.0` for `N` sends, then exactly `60/N` | none |
| `test_no_virtual_minute_window_exceeds_the_configured_budget` / AC-4 | WEAK | Asserts `count ≤ capacity + refill_rate × 60`, i.e. up to 2× the budget in a one-minute window | Unchanged from v1; see IR-002. Not a mandatory TC-ID test — TC-COMP-230's own test is the one labelled, and it is adequate |
| `test_partial_refill_credits_elapsed_virtual_time` | ADEQUATE | 15s advance at a 30s-per-token rate yields exactly a 15s wait | none |
| `test_each_send_consumes_exactly_one_permit` | ADEQUATE | Capacity sends free, the next one waits | none |
| `test_new_governor_instance_starts_with_configured_bucket_capacity` | ADEQUATE | Fresh instance grants `capacity` sends with no sleep | none |
| `test_from_massive_settings_maps_every_field_correctly` / IR-003 | ADEQUATE (new) | Builds a real `MassiveSettings` from env and asserts whole-object equality, so a mis-mapped or dropped field cannot hide behind a per-field spot check. Values (45/5/3.5/120.0) are pairwise distinct, so a transposition is detectable | none |
| `test_from_massive_settings_uses_massive_defaults` / IR-003 | ADEQUATE-with-caveat (new) | `MassiveSettings`'s own defaults (3, 2.0, 300.0) travel through the mapping unchanged | Does not `delenv` the defaulted variables, so it depends on the ambient environment — IR-004 below |

### Mutation evidence (independent verification)

I treated the rework commit message as a claim and re-derived everything. I copied `src/factorflow/ingestion/rate_limit.py` to the scratchpad, applied one mutation at a time, ran the four governor test files, restored from the copy, and confirmed after **each** probe that the file's SHA-256 returned to `15d9aabb7aab37ed74acdb71c5864bf73aecadcf1034d4dc66e4dfcb9ae0e012` and `git status --porcelain` was empty.

| Probe | Mutation | v1 result | v2 result |
|-------|----------|-----------|-----------|
| **A** (reviewer's v1 probe) | `_seconds_to_next_boundary` body → `return _SECONDS_PER_MINUTE` | all 19 tests pass — defect survives | **1 failed, 22 passed** — `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` (`90.0 != 82.5`). **Killed.** |
| **B** (reviewer's v1 probe) | boundary jitter draw frozen after its first call | all 19 tests pass — defect survives | **1 failed, 22 passed** — `test_successive_boundary_throttle_waits_receive_independent_jitter` (`index 1: 72.0 != 108.0`). **Killed.** |
| **C** (new) | `from_massive_settings`: `initial_backoff_seconds=settings.timeout_seconds` | n/a — the factory did not exist | **2 failed, 21 passed** — both settings tests. **Killed.** |
| **D** (new) | `_seconds_to_next_boundary`: `self._now()` → `self._monotonic()` (the exact v1 defect, restored) | n/a | **2 failed, 21 passed** — the wall-clock-phase test and the independent-jitter test. **Killed.** |
| **E** (new) | `from_massive_settings`: `max_throttle_wait_seconds` hardcoded to `300.0` | n/a — the factory did not exist | **1 failed, 22 passed** — `test_from_massive_settings_maps_every_field_correctly`. **Killed.** |

Probes A and B are the two mutations that v1 used as the evidence for its HIGH findings IR-001 and IR-002. Both are now caught, by tests that assert the corrected behavior rather than merely the corrected shape. Probes C, D and E are mine, chosen to test whether the rework's new code is itself pinned rather than merely present; all three are caught.

The pre-existing `CAP-001-E3-S4-tdd-evidence.yaml` mutations were verified in v1 and I re-checked that all six still apply textually to the current `rate_limit.py`; four target code the rework did not touch, and mutation 3 targets `_seconds_to_next_boundary`, whose replacement is more strongly pinned than the original (Probe A proves it). Its recorded pass/fail counts are nonetheless stale — IR-003.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest tests/unit/test_governor_pacing.py tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py tests/unit/test_governor_settings.py -q` | worktree root | 0 | PASS | 23 passed in 0.08s |
| `uv run pytest -m 'not postgres' -q` | worktree root | 0 | PASS | 230 passed, 59 deselected, 2 warnings |
| `uv run pytest -q` | worktree root | 0 | PASS | 289 passed, 2 warnings (includes postgres-marked tests; container runtime available) |
| `uv run ruff check .` | worktree root | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | worktree root | 0 | PASS | 95 files already formatted |
| `uv run mypy src` | worktree root | 0 | PASS | Success, no issues found in 28 source files |
| `uv build` | worktree root | 0 | PASS | sdist + wheel built |

Every command in the plan's Validation Plan and the tech stack's command table was rerun in full; none was substituted with a narrower form. The counts are consistent with the rework adding exactly four tests (19 → 23 governor tests; 226 → 230 and 285 → 289 in the two suite runs).

### Validation Side Effects

- Before: `git status --porcelain` empty; HEAD `58052fdce2cd0b9c8b3cea0c0a5af0c7d713c472`.
- After: `git status --porcelain` empty; HEAD unchanged. `uv build` produced `dist/factorflow-0.1.0.tar.gz` and `dist/factorflow-0.1.0-py3-none-any.whl`, both git-ignored.
- Unexpected tracked-file changes: none. All five mutation probes were restored from a scratchpad copy and each restoration confirmed by SHA-256 and a clean `git status`.

## Findings

### IR-001 — `except BaseException` hands `KeyboardInterrupt` and `SystemExit` to the caller's classifier

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v1 IR-006, not attempted in the rework)
- **Acceptance criteria**: N/A (robustness; touches design section 9's cancellation expectation)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:148-149`
- **Claim challenged**: that routing every raised exception through `classify` is safe for the cancellation path.
- **Observed evidence**: the catch is still `except BaseException`, unchanged by the rework, so `KeyboardInterrupt` and `SystemExit` are passed to `classify`. CAP-001-E3-S3's `is_fatal_for_governor` is typed for `MassiveError` inputs, so a caller's classifier needs its own fallback; a fallback of RETRYABLE or THROTTLED — the natural safe-looking defaults — would make the governor sleep and retry on a Ctrl-C. No test covers either exception type.
- **Expected evidence/behavior**: the `Callable[[BaseException], Outcome]` signature is design-mandated, so catching broadly conforms; but design section 9 expects a cancellation request to take effect.
- **Impact**: an owner interrupting a long run could see it sleep through the signal, depending on how CAP-001-E3-S1 writes its classifier. Note the boundary wait is now a genuine up-to-60s wall-clock wait, so an interrupt swallowed here is swallowed for longer than it was before the rework.
- **Required remediation**: re-raise `KeyboardInterrupt` and `SystemExit` before classification (or document the contract and assert it in a test). Non-blocking for this gate; suitable for CAP-001-E3-S1's wiring story or a follow-up.

### IR-002 — The per-window pacing test asserts a bound of twice the configured budget, and the underlying design conflict is still unresolved

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v1 IR-007, not attempted in the rework)
- **Acceptance criteria**: AC-4 (SATISFIED overall; this is a test-strength weakness, not an unmet criterion)
- **Tasks**: T002
- **Files**: `tests/unit/test_governor_pacing.py:66-100`
- **Claim challenged**: T002's claim that "no virtual one-minute window issues more than the configured budget".
- **Observed evidence**: `test_governor_pacing.py` is byte-identical to its v1 state (`git diff 58052fd~1 58052fd -- tests/unit/test_governor_pacing.py` is empty). The assertion remains `count_in_window <= capacity + refill_rate * 60.0`, which at `capacity=3` permits 6 sends in a one-minute window.
- **Expected evidence/behavior**: design acceptance criterion 1 states "Requests issue at no more than the configured budget over any one-minute window", which a bucket that starts full (required by T006) cannot satisfy in its first window. The conflict between two approved statements is still resolved only inside a test docstring.
- **Impact**: the story's headline pacing guarantee rests on an assertion that tolerates twice the budget; a regression doubling the issue rate would not fail. Against a five-call-per-minute tier this is the difference between pacing and being throttled.
- **Required remediation**: an owner decision — either the bucket starts empty (or at capacity with a documented first-window exception) and the test asserts the budget strictly, or design AC 1 is amended to the standard token-bucket bound. Then strengthen the test to match. This is the one finding carried from v1 that genuinely needs the owner rather than the coding agent; it does not block this gate.

### IR-003 — `CAP-001-E3-S4-tdd-evidence.yaml` was not refreshed after the rework and now describes a pre-rework baseline

- **Severity**: MEDIUM
- **Status**: OPEN (new in v2)
- **Acceptance criteria**: N/A (evidence quality)
- **Tasks**: T010
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tdd-evidence.yaml`
- **Claim challenged**: that the story's recorded TDD/mutation evidence describes the implementation being gated.
- **Observed evidence**: the file is unchanged by commit `58052fd` — `updated: 2026-09-12`, `manual_mutations_baseline_commit: e554152` (two commits before HEAD, and before `rate_limit.py` was modified), and `post_mutation_verification.result` records "285 passed … 226 passed, 59 deselected", whereas the reviewed HEAD measures 289 and 230. No mutation is recorded for either behavior the rework added: the wall-clock-anchored boundary (`_seconds_to_next_boundary`) or `GovernorSettings.from_massive_settings`. The plan's story-specific validation asks to "record test execution, commit hash, and manual mutation results" — the recorded commit hash no longer identifies the code under review.
- **Expected evidence/behavior**: T010's evidence artifact should describe the state being handed off, so a later reader can tell which implementation the mutations were run against.
- **Impact**: limited today, because I independently supplied the missing coverage: Probes A–E exercise exactly the two reworked behaviors and all five are killed, so no unverified implementation is passing this gate. The cost is durable rather than immediate — doc sync and release readiness will read an evidence file that points at a superseded commit.
- **Required remediation**: refresh the evidence file in the next touch of this story — bump `updated`, set the baseline to `58052fd`, correct the post-mutation counts, and add entries for the boundary-anchor and settings-mapping mutations (Probes A/D and C/E in this report are directly reusable). Non-blocking.

### IR-004 — `test_from_massive_settings_uses_massive_defaults` does not clear the environment variables whose defaults it asserts

- **Severity**: MEDIUM
- **Status**: OPEN (new in v2)
- **Acceptance criteria**: N/A (test determinism)
- **Tasks**: T007 (IR-003 remediation)
- **Files**: `tests/unit/test_governor_settings.py:46-64`
- **Claim challenged**: that the new settings tests are free from environment dependence.
- **Observed evidence**: the test sets only `FACTORFLOW_MASSIVE_API_KEY` and `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`, then asserts `max_attempts=3`, `initial_backoff_seconds=2.0`, `max_throttle_wait_seconds=300.0` — the `MassiveSettings` defaults — without clearing the three environment variables that would override them. I demonstrated the dependence: `FACTORFLOW_MASSIVE_MAX_ATTEMPTS=7 uv run pytest tests/unit/test_governor_settings.py -q` → `1 failed, 1 passed` (`max_attempts: 7 != 3`). The nearby established pattern is explicit about this: `tests/unit/test_settings_defaults.py::test_timing_defaults_match_the_canonical_set` `delenv`s all seven timing variables before asserting the same defaults, and it survives the same polluted environment.
- **Expected evidence/behavior**: the skill's test-quality gate requires tests free from environment dependence unless explicitly controlled, and the repo already demonstrates the controlled form a few files away.
- **Impact**: a developer or CI runner with a `FACTORFLOW_MASSIVE_*` override in scope gets a spurious failure. For calibration: two pre-existing tests in `test_settings_defaults.py` share this weakness, so this is a missed opportunity to follow the better local pattern rather than a novel hazard — which is why it is MEDIUM and not higher.
- **Required remediation**: add `monkeypatch.delenv(var, raising=False)` for `FACTORFLOW_MASSIVE_MAX_ATTEMPTS`, `FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS` and `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS`, matching `test_timing_defaults_match_the_canonical_set`.

### IR-005 — Backoff cap is `initial × 2**(attempts-1)`, one doubling below the design's literal wording

- **Severity**: LOW
- **Status**: OPEN (carried from v1 IR-008, deliberately not attempted)
- **Acceptance criteria**: DAC-E3-8 (SATISFIED)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:239-244`, `tests/unit/test_governor_backoff.py:49-66`
- **Observed evidence**: unchanged from v1. The cap on the first retry is `initial × 2**0 = initial`; design section 2.5 row 3 and the story's outcome table read "initial delay times two to the power of attempts".
- **Impact**: none operationally; the implementation is the conventional reading and the bound holds.
- **Required remediation**: record the interpretation in the task plan's Notes so the next design revision can align the wording.

### IR-006 — The test wall clock never advances during throttle sleeps

- **Severity**: LOW
- **Status**: OPEN (new in v2)
- **Acceptance criteria**: N/A (test fidelity)
- **Tasks**: T003
- **Files**: `tests/unit/governor_fakes.py:31-42`, `tests/unit/test_governor_retry.py:165-192`
- **Observed evidence**: `FakeSleeper` advances only the `FakeClock` it is bound to, which every test wires to `monotonic`. The injected `now` source is a separate, never-advanced `FakeClock`, so across a multi-wait throttle sequence the wall clock stays frozen and each boundary computation sees the same remainder. `test_successive_boundary_throttle_waits_receive_independent_jitter` documents this ("the wall clock never advances between them") and relies on it to isolate jitter as the only difference.
- **Expected evidence/behavior**: in production, sleeping past a boundary moves the wall clock, so the second boundary wait is computed from a new phase. No test exercises a throttle sequence in which the wall clock advances.
- **Impact**: small and containable. Freezing the wall clock is a legitimate isolation choice for the jitter test, and the phase computation itself is pinned by `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time`. But no test covers the composition — a sequence of waits each landing on a fresh wall-clock phase — which is the shape production actually takes.
- **Required remediation**: optionally bind the sleeper to both clocks, or add one test that advances the wall clock between two throttles and pins the two distinct boundary waits. Not required for this gate.

### IR-007 — The task plan's new deviation note is labelled IR-004 but records IR-005's deviation

- **Severity**: LOW
- **Status**: OPEN (new in v2)
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: N/A (plan bookkeeping)
- **Files**: `…/CAP-001-E3-S4-tasks.md:166`
- **Observed evidence**: the note opens "**Recorded deviation (IR-004 rework, review v1).**" but its content — additive boundary jitter versus design section 2.5's "full jitter over the computed delay" — is v1's IR-005. v1's IR-004 was the TC-ID mislabelling finding, which was fixed in the test files rather than recorded as a deviation.
- **Impact**: a reader reconciling the plan against the v1 report is pointed at the wrong finding. The substance of the recorded deviation is correct and complete.
- **Required remediation**: change `IR-004` to `IR-005` in that sentence.

### IR-008 — `GovernorSettings` still has no construction-time validation

- **Severity**: LOW
- **Status**: OPEN (residual from v1 IR-003's observed evidence; the owner-directed remediation is complete)
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/rate_limit.py:54-64`, `:110-111`, `:196-197`
- **Observed evidence**: `GovernorSettings` remains a plain frozen dataclass with no validators, so `GovernorSettings(requests_per_minute=0, …)` constructs successfully and then raises `ZeroDivisionError` inside `_acquire_permit` when `_refill_rate` is 0.0. v1 raised this as part of IR-003's evidence; the owner's directed remediation was the `from_massive_settings` factory, which is done.
- **Impact**: materially reduced by the rework. The intended construction path now flows through `MassiveSettings`, where `Field(ge=1)` enforces positivity at `settings.py:112`, so the `ge=1` guarantee does travel with the value for every production caller. What remains is that a direct literal construction — which only the tests do today — fails late and obscurely.
- **Required remediation**: optionally add a `__post_init__` guard rejecting `requests_per_minute < 1` and non-positive timings, so the failure names the problem. Not required; the owner-directed fix for IR-003 is complete without it.

### IR-009 — Exhaustion failures carry no structured attempt count, and the governor emits no log records

- **Severity**: LOW
- **Status**: OPEN (carried from v1 IR-009 and IR-010, deliberately not attempted; merged here because both are single follow-up decisions for a later story)
- **Acceptance criteria**: N/A for this story (design section 13's AC-10 row; design acceptance criterion 9 / AC-13)
- **Tasks**: T008 / N/A
- **Files**: `src/factorflow/ingestion/rate_limit.py:159-162`, `:171-173`; absent: `tests/unit/test_governor_logging.py`
- **Observed evidence**: unchanged from v1. Both `ProviderUnavailable` raises pass only a message string, with the attempt count interpolated into prose and `provider_request_id` defaulting to `None`. The module imports no logger and emits nothing, so design section 4's "log records name the attempt index, the delay and the status code" is unimplemented and design section 7's `test_governor_logging.py` row has no implementation. The story scopes itself to design sections 2.5 and 3 and the task plan never mentions logging, so this is outside the implemented plan rather than a missed task.
- **Impact**: CAP-001-E5 must re-derive the attempt count or carry the sentence verbatim; an operator diagnosing a slow run gets no governor signal. No AC-13 risk today, since no log record exists to leak a URL.
- **Required remediation**: confirm with the owner whether governor logging and structured exhaustion failures belong to CAP-001-E5 or a later story, and record that decision so the design section 7 row is not silently dropped.

## Previous Review Disposition

Every finding from `CAP-001-E3-S4-implementation-review-v1.md`, with current repository evidence for each disposition:

| v1 Finding | v1 Severity | Disposition | Evidence |
|------------|-------------|-------------|----------|
| IR-001 — boundary anchored to construction-time monotonic | HIGH | **RESOLVED** | `rate_limit.py:97` injects `now: Callable[[], float] = time.time`; `:229-237` computes `self._now() % 60`; `_boundary_epoch` deleted. Owner decision implemented as directed. New test pins an 82.5s wait at a 5-seconds-past-the-minute phase. Probe A now fails that test; new Probe D (regressing the anchor to `self._monotonic()`) fails two tests. |
| IR-002 — TC-COMP-227 labelled but not implemented | HIGH | **RESOLVED** | `test_governor_retry.py:165-192` `test_successive_boundary_throttle_waits_receive_independent_jitter`: two waits through `SequenceJitter([0.2, 0.8])`, both magnitudes pinned plus an explicit inequality assertion. Label moved off the budget-exhaustion tests. Probe B now fails it. |
| IR-003 — `MassiveSettings` → `GovernorSettings` construction absent | HIGH | **RESOLVED** | `rate_limit.py:66-78` `GovernorSettings.from_massive_settings`, mapping `backoff_initial_seconds` → `initial_backoff_seconds` exactly as the owner directed, imported under `TYPE_CHECKING` so no runtime cycle is introduced. `tests/unit/test_governor_settings.py` builds from a real `MassiveSettings` and asserts whole-object equality for both explicit values and `MassiveSettings` defaults. Probes C and E are killed. `settings.py` untouched. Residual: no construction-time validation on direct literal construction (v2 IR-008, LOW). |
| IR-004 — four TC-ID labels contradict the test specification | MEDIUM | **RESOLVED** | I re-checked all seven TC-ID headers in the two test files against `all-component-tests.md` lines 4407–5089. TC-COMP-226 now heads the stated-delay test, TC-COMP-203/231 the budget-exhaustion tests, TC-COMP-227 the new jitter test, and `test_governor_backoff.py:46` reads TC-COMP-202 instead of TC-COMP-228. All now agree with the specification's TC→DAC mapping. |
| IR-005 — boundary jitter is additive, not "full jitter" | MEDIUM | **RESOLVED** | Deviation recorded in three places: `…-tasks.md:166` (Notes), `_boundary_wait_with_jitter`'s docstring (`rate_limit.py:217-224`, stating the `[boundary, 2 * boundary]` range and the reasoning), and the covering test's docstring (`test_governor_retry.py:110-114`). The note's finding-ID label is wrong (v2 IR-007, LOW); its substance is correct. |
| IR-006 — `except BaseException` catches `KeyboardInterrupt`/`SystemExit` | MEDIUM | **OPEN — not attempted** | Code unchanged at `rate_limit.py:148-149`. Re-raised as v2 IR-001. Note: the rework commit message classifies this as LOW; v1 recorded it as MEDIUM and I concur with v1. |
| IR-007 — per-window pacing test tolerates 2× the budget | MEDIUM | **OPEN — not attempted** | `tests/unit/test_governor_pacing.py` byte-identical to its v1 state. Re-raised as v2 IR-002. Also classified LOW in the rework commit message; it is MEDIUM, and it is the one carry-over that needs an owner decision. |
| IR-008 — backoff cap one doubling below the design's wording | LOW | **OPEN — not attempted** | Code unchanged at `rate_limit.py:239-244`; no note added to the plan. Re-raised as v2 IR-005. |
| IR-009 — exhaustion failures carry no structured attempt count | LOW | **OPEN — not attempted** | Code unchanged at `rate_limit.py:159-162`, `:171-173`. Re-raised as part of v2 IR-009. |
| IR-010 — no governor logging; design section 7 test row unimplemented | LOW | **OPEN — not attempted** | No logging import in `rate_limit.py`; `tests/unit/test_governor_logging.py` still absent. Re-raised as part of v2 IR-009. |

Leaving IR-006 through IR-010 open was explicitly sanctioned for this rework, so none of them is a rework failure. I record the severity discrepancy only so the LOW-only framing in the commit message does not carry forward unexamined: two of the five deferred findings are MEDIUM, and IR-007/v2-IR-002 in particular still needs the owner.

## Scope and Plan Deviations

- **No scope leakage.** All eleven changed files trace to the story, its task plan, or v1's required remediations. No dependency, migration, configuration, or unrelated refactor was touched, and `src/factorflow/config/settings.py` was correctly left alone as T007 requires — the new factory reads `MassiveSettings` without modifying it, and imports it under `TYPE_CHECKING` so the ingestion package still takes no runtime dependency on the config module at import time.
- **`tests/unit/test_governor_settings.py` is a new file not named in the task plan.** It is the direct, required remediation for v1's IR-003 ("with a test that builds it from a real `MassiveSettings` instance and asserts each field lands in the right place"), so it is justified. The plan's T007 file list was not updated to name it; worth a line in the next plan touch, not a finding.
- **The `now` collaborator extends the constructor's public surface.** `RateLimitGovernor.__init__` gains a fourth keyword-only collaborator, defaulting to `time.monotonic`'s wall-clock sibling `time.time`. It is keyword-only with a default, so no existing call site breaks, and CAP-001-E3-S1 needs no change. This follows the owner's decision verbatim and is documented at `rate_limit.py:103-108`.
- **The reviewed base still predates CAP-001-E3-S3's rework.** Unchanged from v1: this branch is stacked on `d1cb1744` while `usr/alvaro-de-jodra/CAP-001-E3-S3` has advanced. v1 diffed the one affected file (`massive/errors.py`) and found the change confined to `is_rate_limited_body`, which does not touch `ProviderUnavailable` or `MassiveError.__init__` — S4's entire dependency surface. That analysis still holds; rerun the suite once after the restack regardless.
- **Task state is honest.** All ten boxes are checked and all ten have real implementation evidence. The two v1 PARTIAL results are now genuinely complete rather than re-labelled. The story's `status: in-review` is correct, and `last_reworked_review: CAP-001-E3-S4-implementation-review-v1.md` was added to the plan's frontmatter.

## Follow-Up

- **Next agent**: Doc Sync Agent, with this report and `CAP-001-E3-S4-tasks.md`.
- **Warnings accepted downstream**: IR-001 through IR-009 above (3 MEDIUM, 6 LOW), none blocking. Two need an owner decision rather than a coding pass: **IR-002** (the design-AC-1-versus-full-bucket conflict, carried from v1's IR-007) and **IR-009** (whether governor logging and structured exhaustion failures belong to CAP-001-E5 or a later story). **IR-003** (stale TDD evidence) and **IR-004** (environment-dependent settings test) are the two cheapest to close and are the ones most worth folding into the next touch of this story.
- **Required action**: none blocking this gate.
