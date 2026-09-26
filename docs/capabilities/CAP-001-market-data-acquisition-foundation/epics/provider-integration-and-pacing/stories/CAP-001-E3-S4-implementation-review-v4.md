---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-16
updated: 2026-09-16
story_id: "CAP-001-E3-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 4
reviewed_at: "2026-09-16T22:20:17Z"
reviewed_head: "7efc3299734f4a3fa83dcf99f292482ea4cb8837"
review_base: "062601a54e800609408e3e23a542c7139bfb2abd"
reviewed_state_revision: "sha256:64c2ba6470c980106f67db1301c7e897a7c8b095d13381d4a02c6c2ede92a38c"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E3-S4
    artifact_version: 1
    content_revision: sha256:e32281e86dafafc0810449706822d1a1a700a1b39eca241c1db0544c4bd6bac6
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-16T22:20:17Z
  source_artifacts:
    - id: CAP-001-E3-S4
      version: "1"
    - id: CAP-001-E3-S4-tasks
      version: "2"
    - id: CAP-001-E3-S4-implementation-review
      version: "3"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-specification-review
      version: "5"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S4 — Version 4

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 7 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 9/10 verified |
| Required validation | 7/7 passed |

**v3's blocking finding is genuinely closed.** `RateLimitGovernor.execute` no longer
accumulates the stated delay into the throttle budget; it measures budget use as
monotonic elapsed time from the first throttled outcome
(`rate_limit.py:141,155-160`). I did not accept that on the rework's word: restoring
the old `throttle_wait_used += delay` accumulation from a scratchpad copy makes
`test_zero_stated_delay_throttle_wait_is_bounded` **fail** (1 failed, 23 passed) —
and fail fast rather than hang, because the new test carries its own boundedness
guard inside `classify`. The remaining two directed rework items are also real:
the three `monkeypatch.delenv` calls in `test_governor_settings.py:55-57` (v3
IR-004) hold up under a hostile environment — I ran the file with
`FACTORFLOW_MASSIVE_MAX_ATTEMPTS=9 FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS=99
FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS=999` set and both tests still pass —
and the task plan's deviation note now reads `IR-005` (v3 IR-008). The
owner-decision item (v3 IR-003) was resolved through the governance path rather
than a coding pass: DEC-0002, governor design v7 then v8, and
`specifications-review-report-v5.md` (READY, 0 CRITICAL, 0 HIGH). Governor v8's
`approval.reviewed_revision` (`sha256:21e573a3…`) matches the artifact's current
content digest exactly, so that approval is self-consistent, and the story's own
content digest is byte-identical to the one all three prior reviews recorded.

**The gate nevertheless fails, on the same area the owner decision touched.**
DEC-0002 and governor v8 AC-1 replaced one bound with a *two-part* bound, and the
rework propagated that two-part bound into T002's text and marked T002 `[x]` —
but only renamed the test and rewrote its docstring. No assertion was added. The
second clause ("subsequent windows after drawdown issue no more than the
configured budget") and the *capacity ceiling* the first clause depends on are
both unasserted, and I demonstrated the consequence rather than arguing it:
deleting the `min(self._capacity, …)` cap from `_acquire_permit` — which lets the
bucket accumulate without limit across an idle period and then burst far past
AC-1's bound — **leaves all 24 governor tests passing**. T002 is therefore PARTIAL.
The implementation itself is correct; I confirmed empirically that a strict
post-drawdown per-window assertion would pass today at `capacity=3` over 30 sends,
so this is a required-test gap, not a behavior defect, and AC-4 remains SATISFIED.

One more substantive change arrived unannounced with the IR-001 fix and is
recorded as MEDIUM: the throttle budget's *meaning* changed from "cumulative wait
across `THROTTLED` retries" (design §2.2/§2.5, README) to "elapsed monotonic time
since the first throttle", so permit-acquisition pacing, `send()` latency and
`RETRYABLE` backoff sleeps now all debit it. Measured: at `requests_per_minute=1`
with a stated delay of 10s and a 300s budget the governor now issues 6 sends after
60s of actual throttle waiting, where the same configuration at
`requests_per_minute=60` issues 31 sends after 310s. The bound holds either way —
DAC-E3-9 and DAC-E3-S4-6 are satisfied — but the budget now scales with the
configured pacing rate, and no approved artifact says so.

All seven required validation commands pass at the reviewed state: 307 passed
(full), 248 passed / 59 deselected (`not postgres`), 24 passed (governor subset),
ruff check, ruff format, mypy and `uv build` all clean.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md` (v2) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, reviewed in place) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S4-review` |
| HEAD | `7efc3299734f4a3fa83dcf99f292482ea4cb8837` |
| Review base | `062601a54e800609408e3e23a542c7139bfb2abd` (merge base with `main` and `origin/main`, identical) |
| Working tree | **intentionally dirty**: 8 modified tracked files, 2 untracked files, 0 staged; unchanged before and after all validation and all six mutation probes |
| Changed files reviewed | 12 (2 committed since base + 8 modified + 2 untracked) |

`python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001
--story <story> --stage adversarial-review` → `adversarial-review: READY — review
changes were reworked; a new review version is required` (exit 0).

Per skill constraint 6 the review subject is the union of committed changes since
the merge base *and* the uncommitted and untracked working tree. This matters here:
the entire IR-001 fix, the three rework test edits and both specification review
reports exist only in the working tree. Nothing in this report is derived from
`HEAD` alone.

The story's content digest is `sha256:e32281e8…`, byte-identical to the digest v1,
v2 and v3 recorded and to the story's own `approval.reviewed_revision`. The only
story-file change is `status: docs-sync → in-review` and `updated`, which does not
alter the digest, so this is a like-for-like re-review of the approved story text.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `…/design/component-design-rate-limit-governor.md` | modified (committed `7efc329` → v7, then working tree → v8) | Owner decision DEC-0002 resolving v3 IR-003; v8 fixes §7's testing row and records approval against spec review v5 |
| `…/stories/CAP-001-E3-S4-implementation-review-v3.md` | added (committed `873d518`) | The prior gate report |
| `src/factorflow/ingestion/rate_limit.py` | modified (working tree) | T008; v3 IR-001 remediation |
| `tests/unit/test_governor_retry.py` | modified (working tree) | T003; v3 IR-001 regression test |
| `tests/unit/test_governor_settings.py` | modified (working tree) | v3 IR-004 remediation (environment isolation) |
| `tests/unit/test_governor_pacing.py` | modified (working tree) | T002; rename + docstring for the DEC-0002 bound |
| `…/stories/CAP-001-E3-S4-tasks.md` | modified (working tree) | v2: T002 two-part bound, v3 IR-008 label fix, `last_reworked_review`, governor source pin v6→v8 |
| `…/stories/CAP-001-E3-S4-tdd-evidence.yaml` | modified (working tree) | T010; `review_v3_rework` block, `known_limitations` resolution |
| `…/stories/CAP-001-E3-S4.md` | modified (working tree) | `status`/`updated` only; content digest unchanged |
| `…/specifications-review-report-v4.md` | untracked | Spec gate for governor v7 (READY-WITH-WARNINGS, 1 HIGH) |
| `…/specifications-review-report-v5.md` | untracked | Spec gate for governor v8 (READY, 0 HIGH); cited by v8's `approval.review_artifact` |
| `src/factorflow/config/settings.py` | **untouched** | T007 requires it; confirmed by diff |

No unjustified file. Per the owner's remediation sequence the specification review
reports and the design/task amendments are authorized scope, not leakage; I
assessed their correctness in Scope and Plan Deviations below rather than treating
them as drive-by edits. `README.md` was not touched by this rework — see IR-009.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `rate_limit.py:110-113`, `:182-200` `_acquire_permit` | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_virtual_minute_windows_stay_within_the_token_bucket_bound` | Continuous-refill bucket at `rpm/60`, one permit per send including every retry. The pacing bound is now the one DEC-0002/governor v8 approves. Doubling `_refill_rate` kills 3 pacing tests, so the rate itself is pinned. The *capacity ceiling* is not pinned — IR-001 — but the criterion itself holds: I measured 30 sends at `capacity=3` and no post-drawdown 60s window exceeded 3. |
| DAC-E3-6 | SATISFIED | `rate_limit.py:154-165` — the THROTTLED branch never touches `attempts` | `test_governor_retry.py::test_repeated_throttled_outcomes_do_not_consume_attempts`, `::test_throttled_outcomes_do_not_share_the_retry_attempt_counter` | Unchanged by the rework. The mixed THROTTLED/RETRYABLE test proves the counter is untouched, not merely tolerant. |
| DAC-E3-7 | SATISFIED | `rate_limit.py:213-239` `_boundary_wait_with_jitter` / `_seconds_to_next_boundary` | `test_governor_retry.py::test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter`, `::test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` | Wall-clock anchored (`self._now() % 60`); the mid-minute test pins 82.5s so a constant-wait regression cannot survive. |
| DAC-E3-8 | SATISFIED | `rate_limit.py:171-178`, `:241-246` `_backoff_delay` | `test_governor_retry.py::test_retryable_outcome_increments_attempts_and_retries_with_backoff`, `test_governor_backoff.py::test_backoff_delay_grows_exponentially_with_full_jitter` | Attempts increment only off the throttle path; the cap doubles and is pinned at exact values with the jitter fraction held fixed. Default limit 3. |
| DAC-E3-9 | SATISFIED | `rate_limit.py:154-165` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises`, `::test_stated_delay_throttle_wait_exhausts_the_budget_and_raises`, `::test_zero_stated_delay_throttle_wait_is_bounded` | Endless `429` raises `ProviderUnavailable` on all three sub-paths now. Removing the budget check entirely kills 3 tests; doubling the budget kills 2. |
| DAC-E3-S4-1 | SATISFIED | `rate_limit.py:202-211` `_throttle_delay` | `test_governor_retry.py::test_stated_delay_is_honoured_exactly_without_jitter` | Stated delay returned verbatim; the test also asserts `jitter.calls == 0`. The IR-001 fix left this path's *delay* semantics untouched — only the budget accounting moved. |
| DAC-E3-S4-2 | SATISFIED | `rate_limit.py:228-229` | `test_governor_retry.py::test_successive_boundary_throttle_waits_receive_independent_jitter` | Two waits through `SequenceJitter([0.2, 0.8])` pin 72.0 and 108.0 plus an explicit inequality. |
| DAC-E3-S4-3 | SATISFIED | `rate_limit.py:151-152` (bare `raise`) | `test_governor_retry.py::test_fatal_outcome_reraises_immediately_without_wait_or_retry` | Asserts object identity and `sleeper.calls == []`. |
| DAC-E3-S4-4 | SATISFIED | `rate_limit.py:171-175` | `test_governor_retry.py::test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_governor_backoff.py::test_no_fourth_send_after_the_default_attempt_limit` | `send.calls == 3` at `max_attempts=3`. Recording the failure and continuing is CAP-001-E5's responsibility, as the plan states. |
| DAC-E3-S4-5 | SATISFIED | `rate_limit.py:110-113`, `:188-200` | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_partial_refill_credits_elapsed_virtual_time` | Zero artificial delay to capacity (`sleeper.calls == []` *and* `clock() == 0.0`), then exactly `60/capacity`. No sentinel or unlimited mode. |
| DAC-E3-S4-6 | SATISFIED (was PARTIAL at v3) | `rate_limit.py:141`, `:155-165` | `test_governor_retry.py::test_zero_stated_delay_throttle_wait_is_bounded` plus the two budget-exhaustion tests | The zero-stated-delay hole is closed: the budget now advances with monotonic time, so it advances regardless of the stated delay's magnitude. Probe 1 (restore the old accumulation) kills the new test. The *semantics* of what the budget now measures changed — IR-002 — but the OPS-LOOP-001 bound the criterion asserts now holds on every sub-path. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `rate_limit.py`, `tests/unit/governor_fakes.py` + three governor test modules | `FakeClock` advances only on explicit `advance` or through a bound `FakeSleeper`; `SequenceJitter` is a fixed cycle. The 24-test governor suite runs in 0.09s, corroborating that nothing sleeps in real time. |
| T002 | complete | **PARTIAL** | `test_governor_pacing.py:67-100` | T002 v2 requires four assertions. Three are present. The fourth — "subsequent windows after drawdown issue no more than the configured budget" — is absent: lines 91-95 apply the *2×* bound to every window including post-drawdown ones, and lines 97-100 assert a whole-run average, not a steady-state window. Deleting the `min(self._capacity, …)` cap survives the entire suite. See IR-001. |
| T003 | complete | VERIFIED | `test_governor_retry.py:67-270` | All six required TC-IDs present and labelled: TC-COMP-200 (`:67`), TC-COMP-201 (`:106`), TC-COMP-227 (`:162`), TC-COMP-226 (`:195`), TC-COMP-203/231 (`:217`). The new zero-delay test sits under the TC-COMP-203/231 header. T003's wording "both throttle paths count their waits against … `max_throttle_wait_seconds`" is now only loosely true — see IR-002. |
| T004 | complete | VERIFIED | `test_governor_retry.py:276-318`, `test_governor_backoff.py:46-93` | TC-COMP-202, TC-COMP-228, TC-COMP-229 present and labelled. Untouched by this rework. |
| T005 | complete | VERIFIED | `test_governor_retry.py:324-347` | `_UnrelatedException` carries no provider knowledge; `_never_classify` raises if the OK path ever classifies, so a silent regression there fails loudly. |
| T006 | complete | VERIFIED | `test_governor_pacing.py:106-145` | Partial refill credits 15s at a 30s-per-token budget; per-send permit consumption and fresh-instance capacity both asserted. The full-start requirement this task imposes is what forced DEC-0002. |
| T007 | complete | VERIFIED | `rate_limit.py:44-78`; `tests/unit/test_governor_settings.py` | `settings.py` untouched, confirmed by diff. `MassiveSettings` imported under `TYPE_CHECKING` only. Environment isolation now correct (v3 IR-004 closed, verified under hostile env). Residual: no construction-time validation (IR-008). |
| T008 | complete | VERIFIED | `rate_limit.py:115-180` `execute`, `:182-200` `_acquire_permit` | All five outcome rows implemented; each individually probe-killed. `stated_delay_seconds` documented with the §2.5 row 1 / DAC-E3-S4-1 / TC-COMP-226 references the plan requires. IR-002 is a semantic deviation *within* this verified task, not evidence it is unimplemented. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py:16-21` | Re-exports exactly `GovernorSettings`, `Outcome`, `RateLimitGovernor`; no Massive-specific delay callback, and the docstring records why. Untouched by this rework. |
| T010 | complete | VERIFIED | `CAP-001-E3-S4-tdd-evidence.yaml` | Eight mutations plus a new `review_v3_rework` block. All six behaviors T010 names still have records, and I re-ran mutation-6 (budget doubled) at the reviewed state: still killed, 2 failed / 22 passed. Verified but with stale metadata — the file's baseline commit and `rate_limit.py` SHA-256 no longer describe the delivered code, and the new budget mechanism has no mutation. See IR-003. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_zero_stated_delay_throttle_wait_is_bounded` / TC-COMP-203, TC-COMP-231 (new) | ADEQUATE | The v3 IR-001 regression test. `stated_delay_seconds` returns `0.0` against a 1.0s budget; `ProviderUnavailable` is asserted and `send.calls == 2` pins the termination point. The `classify` guard converts what would be an infinite loop into a fast `AssertionError`, which is why Probe 1 fails in 0.1s instead of hanging CI. Probe 1 (restore `throttle_wait_used += delay`) kills it. | Termination here is driven by the `requests_per_minute=1` permit wait advancing the fake clock, not by any throttle wait; it does not pin the high-`rpm` case. IR-010. |
| `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203, TC-COMP-231 | ADEQUATE (was WEAK at v3) | Pins `[10.0, 10.0, 10.0]` against a 25s budget. v3's boundary-of-input-domain gap is now covered by the sibling test above. | none |
| `test_boundary_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203, TC-COMP-231 | ADEQUATE | Pins the exact wait sequence `[60.0, 60.0]` against a 90s budget, so the termination point is asserted rather than only the raise. Killed by both budget probes. | none |
| `test_virtual_minute_windows_stay_within_the_token_bucket_bound` / T002 (AC-4) | **WEAK** | 30 sends, sliding-window bound `capacity + refill_rate × 60`, plus a whole-run average bound at `:99-100`. The rename and docstring now describe the DEC-0002 contract accurately, and the whole-run bound does kill a rate-doubling regression (3 tests fail). | Neither the bucket's capacity ceiling nor a post-drawdown per-window budget is asserted; removing `min(self._capacity, …)` survives the whole suite. IR-001. |
| `test_from_massive_settings_uses_massive_defaults` / v1 IR-003 | ADEQUATE (was WEAK at v3) | Asserts `MassiveSettings`'s defaults travel through the mapping, now with all three `FACTORFLOW_MASSIVE_*` overrides cleared (`:55-57`). Verified by running the file with all three set to hostile values: 2 passed. | none |
| `test_from_massive_settings_maps_every_field_correctly` / v1 IR-003 | ADEQUATE | Whole-object equality against a `GovernorSettings` literal built from a real `MassiveSettings`, covering the `backoff_initial_seconds` → `initial_backoff_seconds` rename. | none |
| `test_repeated_throttled_outcomes_do_not_consume_attempts`, `test_throttled_outcomes_do_not_share_the_retry_attempt_counter` / TC-COMP-200 | ADEQUATE | Five throttles against `max_attempts=2` still succeed; the second mixes 3 THROTTLED then RETRYABLE, proving the counter is untouched rather than merely tolerant. | none |
| `test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter`, `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` / TC-COMP-201 | ADEQUATE | 90.0 at remainder 0; 82.5 constructing at wall-clock 125.0. The second makes the boundary computation non-free. | none |
| `test_successive_boundary_throttle_waits_receive_independent_jitter` / TC-COMP-227 | ADEQUATE | Two waits through `SequenceJitter([0.2, 0.8])`, both magnitudes pinned and an explicit inequality. | wall clock frozen between the two waits — IR-007 |
| `test_stated_delay_is_honoured_exactly_without_jitter` / TC-COMP-226 | ADEQUATE | Pins 12.5 exactly *and* `jitter.calls == 0`, so the jitter source is proven unused rather than coincidentally harmless. | none |
| `test_retryable_outcome_increments_attempts_and_retries_with_backoff` / TC-COMP-202 | ADEQUATE | `send.calls == 3`, two sleeps at `max_attempts=3`. | none |
| `test_backoff_delay_grows_exponentially_with_full_jitter`, `test_successive_backoff_delays_are_not_identical` / TC-COMP-202 | ADEQUATE | The jitter fraction is held at 0.9 across both draws so the cap's own doubling is isolated (`[1.8, 3.6]`); the second asserts `len(set(...)) > 1` over four draws. | the second is weaker but supporting, not primary |
| `test_fatal_outcome_reraises_immediately_without_wait_or_retry` / TC-COMP-228 | ADEQUATE | Object identity (`excinfo.value is boom`) *and* `sleeper.calls == []`; neither wrapping nor a wait can slip through. | none |
| `test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_no_fourth_send_after_the_default_attempt_limit` / TC-COMP-229 | ADEQUATE | `send.calls == 3` against `fail_count=1_000_000`, at both an explicit and the default limit. | none |
| `test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill` / TC-COMP-230 | ADEQUATE | Asserts both `sleeper.calls == []` and `clock() == 0.0` — a no-op sleeper alone could not satisfy both — then exactly `60/capacity`. TC-COMP-230 traces to DAC-E3-S4-5 only, which this covers fully. | none |
| `test_partial_refill_credits_elapsed_virtual_time`, `test_each_send_consumes_exactly_one_permit`, `test_new_governor_instance_starts_with_configured_bucket_capacity` / T006 | ADEQUATE | Token accounting at three distinct capacities. | none of them exercises an idle period, which is why IR-001's mutation survives |
| `test_governor_does_not_inspect_exception_type_only_the_classifier`, `test_ok_returns_the_sender_value_without_retry` / T005 | ADEQUATE | `_never_classify` raises if called, so the OK path cannot silently classify. | none |

Determinism and isolation remain sound: every governor test injects `monotonic`,
`sleep`, `jitter` and `now`; none touches the network, the filesystem or the real
clock; the suite ran identically across all eight executions I performed.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -q -m 'not postgres' tests/unit/test_governor_pacing.py tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py tests/unit/test_governor_settings.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 24 passed in 0.09s — narrowest story-relevant set, run first |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 248 passed, 59 deselected, 2 warnings in 12.74s (both third-party `starlette`/`anyio` deprecations) |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 307 passed in 19.84s |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 96 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 28 source files |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist + wheel built (`factorflow-0.1.0`) |
| `FACTORFLOW_MASSIVE_MAX_ATTEMPTS=9 FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS=99 FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS=999 uv run pytest -q tests/unit/test_governor_settings.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2 passed — targeted verification of the v3 IR-004 remediation |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact …/component-design-rate-limit-governor.md` | `ai-agents` | 0 | PASS | `sha256:21e573a3…`, equal to governor v8's own `approval.reviewed_revision` |
| `python3 scripts/check-artifacts.py --project factorflow-v2 --artifact …/component-design-rate-limit-governor.md --strict` | `ai-agents` | 0 | PASS | 1 warning: tech-stack pin v3 vs current v4 (spec review v5 FINDING-7, capability-wide) |

Every command in the plan's Validation Plan was run in full. None was substituted
with a narrower form. The plan's story-specific validation items were additionally
exercised as the mutation probes below.

### Independent Mutation Probes

Each applied one at a time to a scratchpad copy of `rate_limit.py`, run, then
restored with the file's SHA-256 reconfirmed as
`4df3f8014b40206ee2f7e1a5094133e7b484c1864ed82d89b65ca33499d5e552` before the next.
These are my own probes, not reproductions of the recorded evidence.

| Probe | Mutation | Result |
|-------|----------|--------|
| 1 | Restore v3's defect: `throttle_wait_used` accumulates `delay` instead of monotonic elapsed time | **KILLED** — 1 failed, 23 passed (`test_zero_stated_delay_throttle_wait_is_bounded`, via its in-test guard) |
| 2 | `_refill_rate` doubled | **KILLED** — 3 failed, 2 passed in `test_governor_pacing.py` |
| 3 | `min(self._capacity, …)` removed from `_acquire_permit` (unbounded token accumulation) | **SURVIVED** — 24 passed. Basis of IR-001 |
| 4 | Recorded mutation-6 re-run: `max_throttle_wait_seconds` → `* 2` | **KILLED** — 2 failed, 22 passed (recorded file says 2 failed, 21 passed — stale count, IR-003) |
| 5 | Throttle-budget check and its `raise` removed entirely | **KILLED** — 3 failed, 21 passed, now including the new zero-delay test |
| 6 | Behavioural probe (no mutation): `stated_delay_seconds → 0.0`, `max_throttle_wait_seconds=300`, at `rpm=1` vs `rpm=60` | Terminated in both cases. Quantifies IR-002: 6 sends / 60s of real throttle wait at `rpm=1`, versus 31 sends / 310s at `rpm=60` |

I also confirmed, outside the test suite, that a strict post-drawdown assertion
would pass against the current implementation: 30 sends at `capacity=3` produce
send times `0,0,0,20,40,60,…,540` and **no** 60-second window after `t=60` contains
more than 3 sends. IR-001 is therefore a missing assertion, not a broken bucket.

### Validation Side Effects

- Before: `git status --porcelain` = 8 modified + 2 untracked (the intentional
  rework state); `HEAD` `7efc329…`; `rate_limit.py` SHA-256 `4df3f801…`.
- After: byte-identical — same 8 modified + 2 untracked paths, same `HEAD`, same
  `rate_limit.py` SHA-256, re-verified after every probe.
- Unexpected tracked-file changes: **none.** `uv build` refreshed `dist/`, which is
  gitignored (`git status --porcelain --ignored=traditional` reports `!! dist/`).
  Per constraint 10 I left it in place.

## Findings

### IR-001 — T002's amended two-part pacing bound is only half-asserted; the bucket's capacity ceiling is untested and a cap-removal mutation survives

- **Severity**: HIGH
- **Status**: OPEN (new in v4; the successor problem to v3 IR-003, which the owner decision resolved at specification level only)
- **Acceptance criteria**: AC-4 (SATISFIED — this is a test gap, not a behavior defect)
- **Tasks**: T002 (PARTIAL)
- **Files**: `tests/unit/test_governor_pacing.py:67-100`; `src/factorflow/ingestion/rate_limit.py:192` (`min(self._capacity, …)`)
- **Claim challenged**: T002's `[x]`, and the rework's claim in `CAP-001-E3-S4-tdd-evidence.yaml` that "the pacing test name and leading description now state the approved standard token-bucket bound" is sufficient to discharge the amended requirement.
- **Observed evidence**: T002 v2 requires four assertions, the last being "subsequent windows after drawdown issue no more than the configured budget". Governor design v8 AC-1 states the same two-part bound ("a window that begins with a full bucket may … issue up to capacity plus one window's refill … and every subsequent window, once the bucket has been drawn down, is capped at the configured budget alone"), and v8's §7 Testing table repeats it verbatim as the thing `test_governor_pacing.py` must prove. The rework changed the test's name and docstring and nothing else (`git diff -- tests/unit/test_governor_pacing.py` is 3 lines removed, 3 added). Line 94 still computes `max_allowed = capacity + refill_rate * 60.0` and applies it to *every* window, drawn-down ones included; lines 99-100 assert a whole-run average, not a steady-state window. Probe 3: deleting the `min(self._capacity, …)` cap at `rate_limit.py:192` — so tokens accumulate without limit across an idle period and the next burst can exceed capacity arbitrarily — leaves **all 24 governor tests passing**. No test in the suite ever lets the governor idle, so neither half of AC-1's ceiling is exercised.
- **Expected evidence/behavior**: `CAP-001-E3-S4-tasks.md` v2 T002; `component-design-rate-limit-governor.md` v8 §8 AC-1 and §7 Testing table. A planned, checked task must have implementation evidence for the result, not for the file having been touched.
- **Impact**: the pacing guarantee that DEC-0002 was raised to make *precise* is the one guarantee no test pins. A regression removing or raising the bucket ceiling — the single most likely way to break AC-1 after an idle gap, which is exactly what a 3000-instrument run has between data types — ships green. Against a low-`requests_per_minute` tier the resulting burst is the difference between pacing and being throttled off the provider.
- **Required remediation**: add assertions covering the two clauses T002 now states: (a) after an idle period longer than one window, the bucket admits no more than `capacity` immediate sends before it must wait — this is the assertion that kills Probe 3; and (b) for windows starting after drawdown, `count_in_window <= requests_per_minute`. I verified (b) passes against the current implementation as written, so no production change is expected; if one proves necessary, that is a signal the bound and the code genuinely disagree and should come back to the owner rather than be forced.

### IR-002 — The throttle budget silently changed meaning from "cumulative throttle wait" to "elapsed time since the first throttle"

- **Severity**: MEDIUM
- **Status**: OPEN (new in v4; introduced by the v3 IR-001 remediation)
- **Acceptance criteria**: DAC-E3-9 (SATISFIED), DAC-E3-S4-6 (SATISFIED) — neither is violated; the bound still holds
- **Tasks**: T008, T003
- **Files**: `src/factorflow/ingestion/rate_limit.py:141`, `:155-160`
- **Claim challenged**: T003's "both throttle paths count **their waits** against … `max_throttle_wait_seconds`"; `README.md:309-310`'s "`max_throttle_wait_seconds` bounds the cumulative wait across `THROTTLED` retries"; design §2.2 node J and §2.5's "throttle wait budget".
- **Observed evidence**: the budget is now `self._monotonic() - throttle_wait_started_at`, anchored at the first throttled outcome and never reset. Everything that consumes time after that first throttle is billed to it: token-bucket permit waits, `send()` latency, and `RETRYABLE` backoff sleeps in a mixed sequence. Measured with the repository's own fakes (Probe 6): at `requests_per_minute=1`, a stated delay of 10s and a 300s budget, the governor issues **6 sends** having actually waited **60s** on throttles — the other 250s are permit-acquisition pacing. The identical configuration at `requests_per_minute=60` issues **31 sends** with a cumulative throttle wait of **310s**, i.e. the pre-rework semantics. So the same `max_throttle_wait_seconds=300` now means a 5× shorter throttle tolerance at `rpm=1` than at `rpm=60`. The change is acknowledged in one line of `CAP-001-E3-S4-tdd-evidence.yaml` ("permit-acquisition waits advance the budget even when the provider states a zero-second delay") but nowhere else — not in the task plan's Notes deviation list, not in the design, and `README.md` still states the superseded semantics.
- **Expected evidence/behavior**: the design and plan describe a budget over *throttle waits*. A behavioral reinterpretation of an approved, owner-configured setting belongs in the plan's recorded-deviation Notes the same way the additive-jitter deviation does.
- **Impact**: `max_throttle_wait_seconds=300` no longer means what the owner configured it to mean, and what it does mean varies with an unrelated setting. A low-`rpm` tier — precisely the case the throttle path exists for — fails instruments after far less throttling than budgeted, and a genuinely slow provider can exhaust the "throttle" budget on request latency alone. The failure direction is safe (early termination, never an unbounded loop), which is why this is MEDIUM.
- **Required remediation**: either (a) keep the elapsed-time measure and record it as a deviation in the task plan's Notes, restate it in `README.md`, and flag §2.2/§2.5 for the next design revision; or (b) restore cumulative-wait accounting and bound the zero-delay case some other way (a positive floor on a non-positive stated delay, or an iteration counter alongside the wait budget). Either result is acceptable; the current state — changed behavior, unchanged documentation — is not.

### IR-003 — The TDD evidence's mutation baseline and file digest no longer describe the delivered implementation

- **Severity**: MEDIUM
- **Status**: OPEN (supersedes and widens v3 IR-010, which was LOW)
- **Acceptance criteria**: N/A (evidence quality)
- **Tasks**: T010
- **Files**: `…/CAP-001-E3-S4-tdd-evidence.yaml:9-25` (header, `manual_mutations_baseline_commit`), `:166-191` (`post_mutation_verification`)
- **Claim challenged**: the file's own assertion that every mutation was applied to and reverted from a `rate_limit.py` whose SHA-256 is `15d9aabb7aab37ed74acdb71c5864bf73aecadcf1034d4dc66e4dfcb9ae0e012`, at baseline `58052fd`.
- **Observed evidence**: the delivered `rate_limit.py` now hashes to `4df3f8014b40206ee2f7e1a5094133e7b484c1864ed82d89b65ca33499d5e552`, and the change is uncommitted, so neither the recorded SHA nor the recorded baseline commit identifies the reviewed code. The eight mutation results are stated against a 23-test suite that is now 24 tests — I re-ran recorded mutation-6 and measured **2 failed, 22 passed** against the recorded "2 failed, 21 passed". `post_mutation_verification.result` still records 289 / 230+59 / 95 files while the actual figures are 307 / 248+59 / 96; the new `review_v3_rework.validation` block does record 307 / 248 / 96 correctly, which is what leaves two mutually inconsistent sets of totals in one artifact. No mutation covers the new elapsed-time budget mechanism, which is the behavior this rework introduced; only a prose red/green note exists.
- **Expected evidence/behavior**: T010 requires recorded manual mutations including one for "throttle-budget termination"; the plan's story-specific validation requires recording "test execution, commit hash, and manual mutation results". A commit hash and digest that point at superseded code are worse than absent, because they invite a downstream reader to trust a stale kill set.
- **Impact**: the artifact that exists to prove the tests are regression-sensitive no longer identifies the code they were run against. The substance survives — I independently re-killed mutation-6 and the recorded behaviors are still covered — but a release-readiness reader cannot confirm that without redoing the work.
- **Required remediation**: re-base the header, `manual_mutations_baseline_commit` and the SHA-256 onto the commit that lands this rework; refresh the eight recorded counts to the 24-test suite; reconcile or remove the superseded `post_mutation_verification.result` totals; and add one mutation for the elapsed-time throttle budget (for example, anchoring `throttle_wait_started_at` per-iteration instead of once) so the new mechanism has the same evidence as the old one.

### IR-004 — `except BaseException` hands `KeyboardInterrupt` and `SystemExit` to the caller's classifier

- **Severity**: MEDIUM
- **Status**: OPEN (carried unchanged from v3 IR-002, v2 IR-001, v1 IR-006; not attempted)
- **Acceptance criteria**: N/A (robustness; touches design §9's cancellation expectation)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:148-149`
- **Claim challenged**: that routing every raised exception through `classify` is safe for the cancellation path.
- **Observed evidence**: the catch is still `except BaseException`, byte-identical to the state v3 reviewed. `is_fatal_for_governor` is typed for `MassiveError` inputs, so a caller's classifier needs its own fallback; a fallback of `RETRYABLE` or `THROTTLED` would make the governor sleep and retry on a Ctrl-C. No test covers either exception type.
- **Expected evidence/behavior**: the `Callable[[BaseException], Outcome]` signature is design-mandated, so catching broadly conforms; design §9 nonetheless expects a cancellation request to take effect.
- **Impact**: an owner interrupting a long run could see it sleep through the signal, for up to a 120s boundary wait, depending on how CAP-001-E3-S1 writes its classifier.
- **Required remediation**: re-raise `KeyboardInterrupt` and `SystemExit` before classification, or document the contract and assert it in a test. Suitable for CAP-001-E3-S1's wiring story. Already documented in `README.md` as a known limitation.

### IR-005 — The throttle budget remains a soft bound: one full wait is always slept before the budget is checked

- **Severity**: LOW
- **Status**: OPEN (carried from v3 IR-005; not attempted, and slightly widened by the IR-002 change)
- **Acceptance criteria**: DAC-E3-9 (SATISFIED), DAC-E3-S4-6 (SATISFIED)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:157-165`
- **Claim challenged**: `README.md:309`'s description of `max_throttle_wait_seconds` as a bound.
- **Observed evidence**: the budget is checked *after* the sleep, so the final wait is always slept and then immediately abandoned — visible in `test_boundary_throttle_wait_exhausts_the_budget_and_raises`, which sleeps 120s against a 90s budget. Under the new elapsed-time accounting the overshoot can also include a full permit wait. v3's defence remains correct: design §2.2's flowchart places the sleep before the budget check, so this conforms to the approved design.
- **Expected evidence/behavior**: none violated.
- **Impact**: the final sleep is dead time, up to one maximum wait (≤120s on the boundary path) per exhausted instrument.
- **Required remediation**: for the next design revision — either check the budget before sleeping, or state in the design and `README.md` that the bound is soft. No code change required to pass this gate.

### IR-006 — Backoff cap is `initial × 2**(attempts-1)`, one doubling below the design's literal wording

- **Severity**: LOW
- **Status**: OPEN (carried from v3 IR-006, v2 IR-005, v1 IR-008; deliberately not attempted)
- **Acceptance criteria**: DAC-E3-8 (SATISFIED)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:241-246`, `tests/unit/test_governor_backoff.py:49-66`
- **Claim challenged**: design §2.5 row 3 and the story's outcome table, both reading "initial delay times two to the power of attempts".
- **Observed evidence**: unchanged. The cap on the first retry is `initial × 2**0 = initial`.
- **Expected evidence/behavior**: the implementation is the conventional reading and the bound holds; only the wording differs.
- **Impact**: none operationally.
- **Required remediation**: record the interpretation for the next design revision. Already documented in `README.md`.

### IR-007 — The test wall clock never advances during throttle sleeps

- **Severity**: LOW
- **Status**: OPEN (carried from v3 IR-007, v2 IR-006; not attempted)
- **Acceptance criteria**: N/A (test fidelity)
- **Tasks**: T003
- **Files**: `tests/unit/governor_fakes.py:31-42`, `tests/unit/test_governor_retry.py:46-52`
- **Observed evidence**: `FakeSleeper` advances only the `FakeClock` it is bound to, which every test wires to `monotonic`. The injected `now` source is a separate, never-advanced `FakeClock` (`:51`), so across a multi-wait throttle sequence the wall clock stays frozen and every boundary computation sees the same remainder.
- **Expected evidence/behavior**: in production, sleeping past a boundary moves the wall clock, so the second boundary wait is computed from a new phase.
- **Impact**: small. Freezing the wall clock is a legitimate isolation choice for the jitter test, and the phase computation itself is pinned elsewhere; what is missing is the composition of the two.
- **Required remediation**: optionally bind the sleeper to both clocks, or add one test that advances the wall clock between two throttles and pins the two distinct boundary waits.

### IR-008 — `GovernorSettings` still has no construction-time validation

- **Severity**: LOW
- **Status**: OPEN (carried from v3 IR-009, v2 IR-008; not attempted)
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/rate_limit.py:54-64`, `:110-111`, `:198-199`
- **Observed evidence**: `GovernorSettings` remains a plain frozen dataclass with no validators, so `GovernorSettings(requests_per_minute=0, …)` constructs successfully and then raises `ZeroDivisionError` inside `_acquire_permit`.
- **Expected evidence/behavior**: no rule requires it; the intended construction path flows through `from_massive_settings`, where `Field(ge=1)` enforces positivity.
- **Impact**: a direct literal construction — which only the tests do today — fails late and obscurely.
- **Required remediation**: optionally add a `__post_init__` guard rejecting `requests_per_minute < 1` and non-positive timings. Already documented in `README.md`.

### IR-009 — `README.md`'s governor section now describes superseded behavior

- **Severity**: LOW
- **Status**: OPEN (new in v4; a consequence of this rework, and doc-sync's to close)
- **Acceptance criteria**: N/A (documentation accuracy)
- **Tasks**: N/A
- **Files**: `README.md:309-310`, `:335-337`, `:378-383`
- **Claim challenged**: that the documented governor behavior matches the delivered governor.
- **Observed evidence**: `README.md` is untouched by this rework and still states that `max_throttle_wait_seconds` "bounds the cumulative wait across `THROTTLED` retries" (superseded by IR-002); still names the removed test `test_no_virtual_minute_window_exceeds_the_configured_budget` and presents its 2× bound as an open limitation, although DEC-0002 and governor v8 made that bound the approved contract; and still lists the settings-test environment-isolation gap as open, although `test_governor_settings.py:55-57` closed it.
- **Expected evidence/behavior**: the README known-limitations list was written by doc-sync as the durable record of this story's open items; three of its entries are now wrong in the reader's disfavour.
- **Impact**: low and downstream, but the README is the only place a non-SDD reader learns the governor's contract, and it now overstates one limitation, records two resolved ones as open, and understates the throttle budget's true semantics.
- **Required remediation**: for Doc Sync after this gate passes — refresh the three entries. No code change.

### IR-010 — The new zero-delay boundedness test proves termination only for the `requests_per_minute=1` pacing case

- **Severity**: LOW
- **Status**: OPEN (new in v4)
- **Acceptance criteria**: DAC-E3-S4-6 (SATISFIED)
- **Tasks**: T003
- **Files**: `tests/unit/test_governor_retry.py:252-270`
- **Claim challenged**: that the new test pins the general zero-stated-delay bound.
- **Observed evidence**: the test uses `_governor(1, …)`, so the fake clock advances only because the capacity-1 bucket forces a 60s permit wait on the second iteration; the throttle sleeps themselves are `0.0` and contribute nothing. Under a high `requests_per_minute` and the same fake clock, no collaborator would advance time and the loop would not terminate — production safety here rests entirely on real `time.monotonic` advancing, which is sound but is not what the test demonstrates. The test also carries no docstring and no DAC/TC annotation of its own, relying on the section header above it (consistent with its immediate sibling, so not itself a defect).
- **Expected evidence/behavior**: the plan's story-specific validation asks to demonstrate bounded throttle behavior with virtual time; the demonstration is narrower than the claim.
- **Impact**: minimal — Probe 1 confirms the test is regression-sensitive to exactly the defect it was written for. It simply proves less than its name suggests.
- **Required remediation**: optionally add a second case at a higher `requests_per_minute` with an explicit `clock.advance` in the classifier, or add a one-line docstring naming the mechanism that makes the loop terminate, so a later reader does not mistake the bound for delay-driven.

### IR-011 — Governor v8's DEC-0002 citation does not resolve inside the project repository, and its approving review is untracked

- **Severity**: LOW
- **Status**: OPEN (v8 carries this forward from v7; recorded as MEDIUM FINDING-1 in `specifications-review-report-v5.md`)
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: N/A (governance bookkeeping in authorized-scope artifacts)
- **Files**: `…/design/component-design-rate-limit-governor.md:364-368`; `…/specifications-review-report-v4.md`, `…/specifications-review-report-v5.md` (both untracked)
- **Claim challenged**: that a reader of this repository can resolve the decision and the review evidence that authorize AC-1's amendment.
- **Observed evidence**: the AC-1 amendment note directs readers to `docs/decision-records.md`, which does not exist in `FactorFlow-v2`; DEC-0002 lives only at `projects/factorflow-v2/decisions/DEC-0002.md` in the harness repository (confirmed present). Spec review v5 raised exactly this as its FINDING-1 and it is unresolved. Separately, governor v8's `approval.review_artifact` cites `specifications-review-report-v5.md`, which is still untracked — the approval's evidence is not yet in version control. The approval is otherwise sound: `artifact-gate.py revision` returns `sha256:21e573a3…`, equal to v8's recorded `reviewed_revision`, and v5's verdict is READY with 0 CRITICAL and 0 HIGH.
- **Expected evidence/behavior**: an approved artifact's normative decision and review evidence should be resolvable from the repository that carries the artifact.
- **Impact**: nothing blocks this story; the risk is that the amendment's provenance becomes unverifiable once the working tree is committed without both reports, or is committed with a citation that never resolves.
- **Required remediation**: commit both specification review reports with the rework, and either correct the DEC-0002 citation to its real location or mirror the decision into a governed project artifact. Owner/spec-review scope, not the Coding Agent's to decide alone.

## Previous Review Disposition

Every finding from `CAP-001-E3-S4-implementation-review-v3.md`, each disposition
backed by evidence I gathered at the reviewed state rather than by the rework's
claims:

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v3/IR-001 — zero stated throttle delay loops forever (HIGH) | **RESOLVED** | `rate_limit.py:141,155-160` replaces delay accumulation with monotonic elapsed time. `test_zero_stated_delay_throttle_wait_is_bounded` added at `test_governor_retry.py:252-270`. Probe 1 (restore the old accumulation) kills it: 1 failed, 23 passed. I also re-ran the zero-delay scenario directly — it now terminates. Residual, recorded separately: the budget's semantics changed (IR-002) and the new test is narrower than its name (IR-010). |
| v3/IR-002 — `except BaseException` catches `KeyboardInterrupt`/`SystemExit` (MEDIUM) | **STILL OPEN** | `rate_limit.py:148-149` byte-identical; no test for either type. Re-raised as v4 IR-004. |
| v3/IR-003 — per-window pacing test tolerates 2× the budget; design conflict unresolved (MEDIUM) | **RESOLVED at specification level; SUPERSEDED at test level** | The owner resolved the conflict through the governance path, exactly as v3 required: DEC-0002 (`projects/factorflow-v2/decisions/DEC-0002.md`), governor v7 (commit `7efc329`) then v8, approved against `specifications-review-report-v5.md` (READY, 0 HIGH), with `reviewed_revision` matching the artifact digest I computed. T002 and the test name/docstring were propagated. The 2× bound is therefore no longer a finding — it is the approved contract. What replaced it is narrower and new: the amended bound's *second* clause and the capacity ceiling remain unasserted, with a surviving mutation. Re-raised in that narrowed form as v4 IR-001. |
| v3/IR-004 — settings default test does not clear its environment variables (MEDIUM) | **RESOLVED** | `tests/unit/test_governor_settings.py:55-57` adds all three `monkeypatch.delenv` calls. Verified adversarially: running the file with `FACTORFLOW_MASSIVE_MAX_ATTEMPTS=9`, `FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS=99` and `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS=999` exported still yields 2 passed. |
| v3/IR-005 — throttle budget is a soft bound; one wait is always slept (LOW) | **STILL OPEN** | `rate_limit.py:157-165` still sleeps before checking; `test_boundary_throttle_wait_exhausts_the_budget_and_raises` still sleeps 120s against a 90s budget. Re-raised as v4 IR-005. |
| v3/IR-006 — backoff cap one doubling below the design's wording (LOW) | **STILL OPEN** | `rate_limit.py:241-246` unchanged. Re-raised as v4 IR-006. |
| v3/IR-007 — test wall clock never advances during throttle sleeps (LOW) | **STILL OPEN** | `governor_fakes.py` and `test_governor_retry.py:51` unchanged. Re-raised as v4 IR-007. |
| v3/IR-008 — plan's deviation note labelled IR-004 but records IR-005 (LOW) | **RESOLVED** | `CAP-001-E3-S4-tasks.md:166` now reads "**Recorded deviation (IR-005 rework, review v1).**"; the substance of the note is unchanged and still correct. |
| v3/IR-009 — `GovernorSettings` has no construction-time validation (LOW) | **STILL OPEN** | `rate_limit.py:54-64` is still a bare frozen dataclass. Re-raised as v4 IR-008. |
| v3/IR-010 — TDD evidence aggregate counts superseded by the merge (LOW) | **STILL OPEN, WIDENED** | The new `review_v3_rework.validation` block records 307 / 248+59 / 96, which matches my measurements exactly — but `post_mutation_verification.result` still records 289 / 230+59 / 95, and the baseline commit and `rate_limit.py` SHA-256 now point at superseded code. Re-raised, at MEDIUM, as v4 IR-003. |

Four of v3's ten findings are closed on current repository evidence. The three
items the owner directed at this rework (v3 IR-001, IR-004, IR-008) are all
genuinely closed, and v3 IR-003 was resolved through the specification path. The
new HIGH is a consequence of that specification change, not a regression in the
code.

## Scope and Plan Deviations

- **No unjustified scope leakage.** Every changed path traces to the story, the
  task plan, a v3 finding's required remediation, or the owner's remediation
  sequence. `src/factorflow/config/settings.py` remains untouched as T007 requires,
  and no dependency, migration, or configuration change was made.
- **The design and specification-review artifacts are authorized, and they hold up
  under inspection.** v3 IR-003 explicitly required "an owner decision, not a coding
  pass", and that is what happened: DEC-0002 → governor v7 (`7efc329`) → spec review
  v4 (READY-WITH-WARNINGS, 1 HIGH: v7 amended AC-1 but left §7's testing row stating
  the rejected bound) → governor v8 fixing exactly that row → spec review v5 (READY,
  0 CRITICAL, 0 HIGH). I verified the chain rather than assuming it: v8's
  `approval.reviewed_revision` equals the digest `artifact-gate.py revision` computes
  for the current file, `check-artifacts.py --strict` passes on it, and v5's own
  recorded resolution of v4 FINDING-1 matches v8's §7 text. The v7 commit's decision
  to leave `reviewed_revision` pointing at pre-amendment content until a fresh
  specification review ran was the correct call and was honoured.
- **T002's text was amended by the rework itself.** That is legitimate propagation of
  DEC-0002, but it also means the rework authored the requirement it then marked
  complete without asserting — the basis of IR-001.
- **`tests/unit/test_governor_settings.py` is still a file no task names.** It is the
  direct remediation v1's IR-003 required, so it is justified; T007's file list has
  now gone three reworks without being updated to name it. Worth one line on the next
  plan touch.
- **The task plan's `status: draft` is not an inconsistency.** All four E3 sibling
  task files carry it and it is the template default. The story's `status: in-review`
  is correct for a story sitting at this gate.
- **Both specification review reports are untracked.** They are part of the reviewed
  subject under skill constraint 6, but they must be committed with the rework or the
  approval they support becomes unverifiable — see IR-011.
- **`README.md` was not updated for this rework**, which is correct sequencing (Doc
  Sync runs after this gate), but it leaves three now-wrong entries that IR-009
  records so they are not lost.

## Follow-Up

- **Next agent**: **Coding Agent**, with `CAP-001-E3-S4-tasks.md` and this report;
  then a new adversarial review (v5).
- **Required action**: close **IR-001** — add the two pacing assertions T002 v2 and
  governor v8 AC-1 require, at minimum one that fails when the bucket's capacity cap
  is removed. That is the only blocking item.
- **Worth folding into the same pass**: **IR-002** (record the throttle-budget
  semantics change as a deviation, or restore cumulative accounting) and **IR-003**
  (re-base the TDD evidence's baseline, digest and counts, and add a mutation for the
  new budget mechanism). Both are MEDIUM and both concern work this rework performed.
- **For Doc Sync once the gate passes**: **IR-009**.
- **Needs the owner, not the Coding Agent**: **IR-011**'s DEC-0002 citation, and the
  long-standing question of whether governor logging and structured exhaustion
  failures belong to CAP-001-E5 (recorded at v2/IR-009, still unowned).
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED, so no
  findings are accepted downstream at this time. IR-002 through IR-011 should be
  re-dispositioned at v5.
