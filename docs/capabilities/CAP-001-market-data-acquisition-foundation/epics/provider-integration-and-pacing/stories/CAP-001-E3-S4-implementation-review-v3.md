---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-16
updated: 2026-09-16
story_id: "CAP-001-E3-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-09-16T18:02:57Z"
reviewed_head: "062601a54e800609408e3e23a542c7139bfb2abd"
review_base: "d1cb17449019375e1fe78250311a82e71284ea48"
reviewed_state_revision: "sha256:b515d4f7ae7e0bfb39d59e07a3d116452689d7894552213126cab3cbe177cbfa"
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
  timestamp: 2026-09-16T18:02:57Z
  source_artifacts:
    - id: CAP-001-E3-S4
      version: "1"
    - id: CAP-001-E3-S4-tasks
      version: "1"
    - id: CAP-001-E3-S4-implementation-review
      version: "2"
    - id: CAP-001-component-design-rate-limit-governor
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S4 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 3 |
| Low findings | 6 |
| Acceptance criteria | 10/11 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 6/6 passed |

This re-review was triggered by the shared-file fingerprint check, and the trigger turns out to be a false alarm in exactly the way the reviewer was asked to test for: **nothing CAP-001-E3-S4 owns changed.** `src/factorflow/ingestion/rate_limit.py` and all five governor test files are byte-identical to the state review v2 gated (`git diff 58052fd HEAD` over those paths is empty; `rate_limit.py` still hashes to `15d9aabb7aab37ed74acdb71c5864bf73aecadcf1034d4dc66e4dfcb9ae0e012`). The shared file that moved is `massive/errors.py`, and both edits to it belong to other owners: CAP-001-E3-S5 appended `compose_failure_reason` and `MAX_FAILURE_REASON_VARIABLE_TEXT` purely additively, and CAP-001-E3-S3's rework narrowed `is_rate_limited_body`'s reason lookup. Neither touches `ProviderUnavailable`, `MassiveError.__init__`, or `is_fatal_for_governor` — S4's entire dependency surface on that module. So this is the same situation S3's own re-review found. Note for accuracy: CAP-001-E3-S5 has landed only review **v1**, not a re-review.

What this review *can* do that v1 and v2 structurally could not is settle the caveat both of them left open. Both reviewed a branch stacked on `d1cb1744`, ahead of S3's rework, and both wrote "rerun the suite once after the restack regardless." That restack has now happened — S3, S4 and S5 are all merged into `main` — and I ran the full suite against the merged result: **306 passed** (full), **247 passed / 59 deselected** (`not postgres`), lint, format, `mypy` and `uv build` all clean. The restack caveat is discharged.

I did not take v2's resolution claims on trust. I re-derived them with eight of my own mutation probes against current `HEAD`, and **all eight are killed** — including the two that were free in v1 (constant boundary wait; boundary anchored to `monotonic()`), which now fail `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time`. I also re-checked all seven TC-ID headers against `all-component-tests.md` myself; they agree with the specification's TC→DAC mapping. v2's three HIGH resolutions are genuinely resolved, and the doc-sync commit `3a3c3e1` genuinely closed v2's IR-003 — I spot-verified the refreshed mutation entries against my own probe results and they match exactly, not approximately.

The gate nevertheless fails, on a defect neither prior review probed. **`RateLimitGovernor.execute` loops forever when the provider-stated throttle delay is `0`.** `throttle_wait_used` accumulates the returned delay, so a stated delay of `0.0` never advances the budget and the exhaustion check can never fire. I demonstrated it rather than reasoning about it: 6,631,843 `send()` calls in five seconds with `throttle_wait_used` pinned at `0.0` against a 300s budget. In production `_acquire_permit` would pace this to the configured requests-per-minute forever, so the run hammers the provider and never fails the instrument. This contradicts the component design's own section 3 constraint — "Both the attempt counter and the throttle wait budget have ceilings, so **no path** retries indefinitely" — and leaves DAC-E3-S4-6 `PARTIAL`. It is latent rather than live (CAP-001-E3-S1 passes no `stated_delay_seconds` callback, and Massive sends no `Retry-After`), which is why it is HIGH and not CRITICAL, but the story deliberately retains and tests this path precisely because the governor is provider-agnostic, and `Retry-After: 0` is a response real servers send.

The other nine findings are all carried from v2, unchanged in substance, with two of them re-confirmed against current code rather than assumed.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, reviewed in place) |
| Branch | `main`, up to date with `origin/main` |
| HEAD | `062601a54e800609408e3e23a542c7139bfb2abd` |
| Review base | `d1cb17449019375e1fe78250311a82e71284ea48` (parent of `ce26702`, the story's first commit; the same base v1 and v2 used) |
| Working tree | clean before and after validation and all eight mutation probes (`git status --porcelain` empty each time) |
| Changed files reviewed | 11 |

This is a **post-merge re-review on `main`**, not a branch review: `usr/alvaro-de-jodra/CAP-001-E3-S4` merged at `1b6d8f3` (PR #37) and no feature branch remains. The story's change set is therefore the union of its seven attributable commits (`ce26702`, `08f3fcd`, `0b3e47c`, `e554152`, `0825bd7`, `58052fd`, `3a3c3e1`), which I enumerated by file rather than diffing the whole `d1cb1744..HEAD` range — that range also carries S2, S3, S5 and the E4/E5 planning artifacts, which are not this story's to answer for.

`python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story <story> --stage adversarial-review` → `adversarial-review: RESUME — component repository changed after the latest passing review` (exit 0). The story's content revision is `sha256:e32281e8…`, byte-identical to the digests v1 and v2 recorded and to the story's own `approval.reviewed_revision`, so the approved story text is unchanged and this is a like-for-like re-review.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/rate_limit.py` | added (last modified by `58052fd`) | T001, T007, T008; v1 rework IR-001/IR-003/IR-005 |
| `src/factorflow/ingestion/__init__.py` | modified | T009 |
| `tests/unit/governor_fakes.py` | added | T001 |
| `tests/unit/test_governor_pacing.py` | added | T002, T006 |
| `tests/unit/test_governor_retry.py` | added (modified by rework) | T003, T004, T005; v1 rework IR-001/IR-002/IR-004/IR-005 |
| `tests/unit/test_governor_backoff.py` | added (modified by rework) | T004; v1 rework IR-004 label correction |
| `tests/unit/test_governor_settings.py` | added by rework | v1 IR-003 remediation |
| `…/CAP-001-E3-S4-tdd-evidence.yaml` | added, refreshed by `3a3c3e1` | T010; v2 IR-003 remediation |
| `…/CAP-001-E3-S4-tasks.md` | modified | plan Notes (v1 IR-005 deviation), `last_reworked_review` frontmatter |
| `…/CAP-001-E3-S4.md` | modified | `status` / `updated` only; content revision unchanged |
| `README.md` | modified by `3a3c3e1` | doc-sync: governor documentation + v2 known limitations |

No file outside this set is attributable to the story. `src/factorflow/config/settings.py` was correctly left untouched, as T007 requires.

**One stale artifact, not a finding.** `tests/unit/__pycache__/test_massive_client_governor_integration.cpython-313-pytest-9.1.1.pyc` exists with no corresponding `.py`. Its source lives only on the unmerged `CAP-001-E3-S1` branch (`3820cb5`); the path is gitignored (`git status --porcelain --ignored=matching` reports `!!`), so it is local build residue, not repository state and not scope leakage.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `rate_limit.py:180-198` `_acquire_permit`; `:110-111` capacity/refill | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_no_virtual_minute_window_exceeds_the_configured_budget` | Continuous-refill bucket at `rpm/60` tokens/s, one permit per send including every retry. Probe on permit debit kills 4 tests. The per-window assertion is weaker than design AC 1 — see IR-003; the criterion itself holds. |
| DAC-E3-6 | SATISFIED | `rate_limit.py:154-163` — the THROTTLED branch never touches `attempts` | `test_governor_retry.py::test_repeated_throttled_outcomes_do_not_consume_attempts`, `::test_throttled_outcomes_do_not_share_the_retry_attempt_counter` | My Probe D (`attempts += 1` inside the THROTTLED branch) kills `test_throttled_outcomes_do_not_share_the_retry_attempt_counter`: 1 failed, 22 passed. The strengthening test mixes THROTTLED and RETRYABLE, so it proves the counter is untouched, not merely tolerant. |
| DAC-E3-7 | SATISFIED | `rate_limit.py:211-237` `_boundary_wait_with_jitter` / `_seconds_to_next_boundary` | `test_governor_retry.py::test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter`, `::test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` | v1's PARTIAL is closed. The wait is anchored to the injected wall clock (`self._now() % 60`), and the 5-seconds-past-the-minute test pins 82.5s. Probes A (constant) and B (`monotonic()` anchor) both fail this test. |
| DAC-E3-8 | SATISFIED | `rate_limit.py:169-176`, `:239-244` `_backoff_delay` | `test_governor_retry.py::test_retryable_outcome_increments_attempts_and_retries_with_backoff`, `test_governor_backoff.py::test_backoff_delay_grows_exponentially_with_full_jitter` | Attempts increment only on the non-throttle path; the cap doubles per attempt and is asserted at exact values with the jitter fraction held fixed, isolating the cap's own growth. Default limit 3 confirmed at `settings.py:113`. |
| DAC-E3-9 | SATISFIED | `rate_limit.py:158-162` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises`, `::test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` | For the live (no-`Retry-After`) path, endless `429` raises `ProviderUnavailable`. Probe F (budget check removed) kills both tests. The zero-stated-delay hole is recorded against DAC-E3-S4-6 rather than double-counted here. |
| DAC-E3-S4-1 | SATISFIED | `rate_limit.py:200-209` `_throttle_delay` | `test_governor_retry.py::test_stated_delay_is_honoured_exactly_without_jitter` | The stated delay is returned verbatim, and the test also asserts `jitter.calls == 0`, so a misapplied jitter cannot hide behind a coincidental value. |
| DAC-E3-S4-2 | SATISFIED | `rate_limit.py:226-227` | `test_governor_retry.py::test_successive_boundary_throttle_waits_receive_independent_jitter` | v1's PARTIAL is closed. Two waits through `SequenceJitter([0.2, 0.8])` pin 72.0 and 108.0 plus an explicit inequality. Probe C (jitter dropped entirely — the literal resynchronisation defect) kills 3 tests. |
| DAC-E3-S4-3 | SATISFIED | `rate_limit.py:151-152` (bare `raise`) | `test_governor_retry.py::test_fatal_outcome_reraises_immediately_without_wait_or_retry` | Asserts the re-raised object is identical (`excinfo.value is boom`) and `sleeper.calls == []`, so neither wrapping nor a wait can slip in. Probe E (FATAL falls through) kills it. |
| DAC-E3-S4-4 | SATISFIED | `rate_limit.py:169-173` | `test_governor_retry.py::test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_governor_backoff.py::test_no_fourth_send_after_the_default_attempt_limit` | `send.calls == 3` at `max_attempts=3` proves the fourth request is never issued. Probe G (off-by-one) kills both. Recording the failure and continuing the run is CAP-001-E5's responsibility, as the plan states. |
| DAC-E3-S4-5 | SATISFIED | `rate_limit.py:110-113`, `:186-198` | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_partial_refill_credits_elapsed_virtual_time` | Zero artificial delay up to capacity (`sleeper.calls == []` and `clock() == 0.0`), then exactly the refill wait (`60/capacity`). No sentinel or unlimited mode exists, per the owner resolution in the plan's Notes. |
| DAC-E3-S4-6 | **PARTIAL** | `rate_limit.py:155-163` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises`, `::test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` | The boundary sub-path is genuinely bounded (`_seconds_to_next_boundary` returns a value in `(0, 60]`, so the budget always advances). The stated-delay sub-path is **not** bounded when the provider states `0`: `throttle_wait_used` never advances and the exhaustion check can never fire. Both covering tests use a positive stated delay (10.0), so neither reaches the boundary of that input domain. See IR-001. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `rate_limit.py`, `tests/unit/governor_fakes.py` + the three governor test modules | `FakeClock`, `FakeSleeper`, `SequenceJitter` are real deterministic doubles: `FakeClock` advances only on explicit `advance`, `FakeSleeper` records every delay and advances its bound clock instead of blocking. No test sleeps in real time; the whole 23-test governor suite runs in 0.06s, which is itself corroboration. |
| T002 | complete | VERIFIED | `test_governor_pacing.py:47-100` | TC-COMP-230 implemented. Capacity-`N` sends assert both `sleeper.calls == []` and `clock() == 0.0`; the `N+1` send asserts exactly `60/capacity`. The sustained-window assertion is present but weaker than the plan's wording — recorded as IR-003, not as task incompleteness. |
| T003 | complete | VERIFIED | `test_governor_retry.py:67-249` | All six required TC-IDs present and correctly labelled: TC-COMP-200 (`:67`), TC-COMP-201 (`:106`), TC-COMP-227 (`:162`), TC-COMP-226 (`:195`), TC-COMP-203/231 (`:217`). I verified each label against `all-component-tests.md:4407-5093`. |
| T004 | complete | VERIFIED | `test_governor_retry.py:252-298`, `test_governor_backoff.py:46-93` | TC-COMP-202, TC-COMP-228, TC-COMP-229 present across both files and correctly labelled. Probes E and G kill the fatal and attempt-limit tests respectively. |
| T005 | complete | VERIFIED | `test_governor_retry.py:303-326` | `_UnrelatedException` carries no provider knowledge and behaves identically, proving the governor never inspects exception type. `test_ok_returns_the_sender_value_without_retry` uses `_never_classify`, which raises `AssertionError` if called — so an accidental classify on the success path fails loudly rather than silently. |
| T006 | complete | VERIFIED | `test_governor_pacing.py:106-145` | Partial refill credits 15s of elapsed virtual time at a 30s-per-token budget; per-send permit consumption and fresh-instance capacity both asserted. |
| T007 | complete | VERIFIED | `rate_limit.py:44-78` `Outcome`, frozen `GovernorSettings`, `from_massive_settings` | `settings.py` untouched, confirmed by diff. `MassiveSettings` imported under `TYPE_CHECKING` only, so no runtime import cycle. Probe H (wrong source field) kills both settings tests. Residual: no construction-time validation (IR-008). |
| T008 | complete | VERIFIED | `rate_limit.py:115-178` `execute`, `:180-198` `_acquire_permit` | All five outcome rows implemented and individually probe-killed. `stated_delay_seconds` added as the plan directs, documented in the docstring with the design §2.5 row 1 / DAC-E3-S4-1 / TC-COMP-226 references the plan requires. IR-001 is a defect *within* this verified task, not evidence the task is unimplemented. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py:15-21` | Re-exports exactly `GovernorSettings`, `Outcome`, `RateLimitGovernor`. No Massive-specific delay callback added, exactly as T009 requires, and the docstring records why. |
| T010 | complete | VERIFIED | `CAP-001-E3-S4-tdd-evidence.yaml` (refreshed by `3a3c3e1`) | Eight mutations recorded against baseline `58052fd`, the commit that last touched `rate_limit.py`. I independently reproduced five of them and the kill sets match exactly — see Independent Validation. The aggregate suite counts are now superseded by the merge (IR-010). |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_repeated_throttled_outcomes_do_not_consume_attempts` / TC-COMP-200 | ADEQUATE | Five throttles against `max_attempts=2` still succeed; asserts `send.calls == 6`. | none |
| `test_throttled_outcomes_do_not_share_the_retry_attempt_counter` / TC-COMP-200 | ADEQUATE | Mixes 3 THROTTLED then RETRYABLE at `max_attempts=2`. Proves the counter is *untouched*, not merely tolerant — the stronger claim DAC-E3-6 actually makes. Probe D kills it. | none |
| `test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter` / TC-COMP-201 | ADEQUATE | Pins 90.0 = 60s boundary + 0.5×60 additive jitter. | exercises only the `remainder == 0` phase; covered by the next test |
| `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` / TC-COMP-201 | ADEQUATE | Constructs at wall-clock 125.0 and pins 82.5 = 55s + 0.5×55. This is the test that makes the boundary computation non-free: Probes A and B both fail here. | none |
| `test_successive_boundary_throttle_waits_receive_independent_jitter` / TC-COMP-227 | ADEQUATE | Two waits through `SequenceJitter([0.2, 0.8])`, both magnitudes pinned *and* an explicit inequality assertion. Probe C kills it. | frozen wall clock isolates jitter deliberately — IR-006 |
| `test_stated_delay_is_honoured_exactly_without_jitter` / TC-COMP-226 | ADEQUATE | Pins 12.5 exactly *and* asserts `jitter.calls == 0`, so the jitter source is proven unused rather than coincidentally harmless. | does not cover a stated delay of `0` — **the gap behind IR-001** |
| `test_boundary_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203, TC-COMP-231 | ADEQUATE | Pins the exact wait sequence `[60.0, 60.0]` against a 90s budget, so the termination point is asserted, not just the raise. Probe F kills it. | none |
| `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203, TC-COMP-231 | **WEAK** | Pins `[10.0, 10.0, 10.0]` against a 25s budget and the raise. Genuine, but uses only a positive stated delay. | **no non-positive stated delay** — the boundary of the input domain, where the bound fails outright (IR-001) |
| `test_retryable_outcome_increments_attempts_and_retries_with_backoff` / TC-COMP-202 | ADEQUATE | `send.calls == 3`, two sleeps at `max_attempts=3`. | none |
| `test_retry_limit_exhausted_raises_and_no_fourth_send` / TC-COMP-229 | ADEQUATE | `send.calls == 3` against `fail_count=1_000_000`. Probe G kills it. | none |
| `test_fatal_outcome_reraises_immediately_without_wait_or_retry` / TC-COMP-228 | ADEQUATE | Asserts object identity (`excinfo.value is boom`) *and* `sleeper.calls == []`. Neither wrapping nor a wait can slip through. Probe E kills it. | none |
| `test_backoff_delay_grows_exponentially_with_full_jitter` / TC-COMP-202 | ADEQUATE | Holds the jitter fraction at 0.9 across both draws so the cap's own doubling is isolated: `[1.8, 3.6]`. | none |
| `test_successive_backoff_delays_are_not_identical` / TC-COMP-202 | ADEQUATE | Four draws through `[0.9, 0.1, …]`, asserts `len(set(...)) > 1`. | weaker than the retry-jitter test, but it is a supporting test, not the TC's primary |
| `test_no_fourth_send_after_the_default_attempt_limit` / TC-COMP-229 | ADEQUATE | `send.calls == 3` at the default limit. Probe G kills it. | none |
| `test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill` / TC-COMP-230 | ADEQUATE | Asserts both `sleeper.calls == []` and `clock() == 0.0` — a no-op sleeper alone could not satisfy both — then exactly `60/capacity`. | none |
| `test_no_virtual_minute_window_exceeds_the_configured_budget` / TC-COMP-230 | **WEAK** | 30 sends, sliding-window check. Bound is `capacity + refill_rate × 60`, i.e. 2× the configured budget. | tolerates twice the budget; a regression doubling the issue rate passes (IR-003) |
| `test_partial_refill_credits_elapsed_virtual_time`, `test_each_send_consumes_exactly_one_permit`, `test_new_governor_instance_starts_with_configured_bucket_capacity` / T006 | ADEQUATE | Token accounting at three distinct capacities. | none |
| `test_governor_does_not_inspect_exception_type_only_the_classifier`, `test_ok_returns_the_sender_value_without_retry` / T005 | ADEQUATE | `_never_classify` raises if called, so the OK path cannot silently classify. | none |
| `test_from_massive_settings_maps_every_field_correctly` / v1 IR-003 | ADEQUATE | Whole-object equality against a `GovernorSettings` literal, built from a real `MassiveSettings`. Probe H kills it. | none |
| `test_from_massive_settings_uses_massive_defaults` / v1 IR-003 | **WEAK** | Asserts `MassiveSettings`'s own defaults travel through the mapping. | does not `delenv` the three `FACTORFLOW_MASSIVE_*` overrides it depends on (IR-004) |

Determinism and isolation are otherwise sound throughout: every governor test injects `monotonic`, `sleep`, `jitter` and `now`; none touches the network, the filesystem, or the real clock; the full governor suite runs in 0.06s and passed identically across all ten runs I performed.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_governor_pacing.py tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py tests/unit/test_governor_settings.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 23 passed in 0.07s — the narrowest story-relevant set, run first |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 247 passed, 59 deselected, 2 warnings in 12.71s (both warnings are third-party deprecations from `starlette`/`fastapi`) |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 306 passed in 22.40s — **the post-restack run v1 and v2 both asked for and could not perform** |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 96 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 28 source files |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist + wheel built (`factorflow-0.1.0`) |

Every command in the plan's Validation Plan was run. None was substituted with a narrower form.

### Independent Mutation Probes

Run one at a time against `HEAD`, each reverted from a scratchpad copy with the SHA-256 reconfirmed as `15d9aabb…` before the next. These are my own probes, not reproductions of the recorded evidence, though five of them happen to cover the same targets and I note the agreement.

| Probe | Mutation | Result |
|-------|----------|--------|
| A | `_seconds_to_next_boundary` body → `return _SECONDS_PER_MINUTE` | **KILLED** — 1 failed, 22 passed (`test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time`) |
| B | boundary anchored to `self._monotonic()` instead of `self._now()` — v1's IR-001 defect in its purest form | **KILLED** — 2 failed, 21 passed |
| C | `_boundary_wait_with_jitter` → `return boundary_wait` (jitter dropped) | **KILLED** — 3 failed, 20 passed |
| D | `attempts += 1` added to the THROTTLED branch (DAC-E3-6 violation) | **KILLED** — 1 failed, 22 passed |
| E | `Outcome.FATAL` branch `raise` → `pass` (falls through to retry) | **KILLED** — 1 failed, 22 passed |
| F | throttle-budget check removed entirely | **KILLED** — 2 failed, 21 passed |
| G | attempt-limit off-by-one (one extra send) | **KILLED** — 2 failed, 21 passed |
| H | `from_massive_settings` maps the wrong source field onto `initial_backoff_seconds` | **KILLED** — 2 failed, 21 passed |

Probes A, B, D, G and H target the same behaviors as recorded mutations 7, 7(D), 2, 5 and 8, and my kill sets match the recorded ones test-for-test. That is the corroboration that lets me treat the refreshed TDD evidence as accurate rather than merely present.

### Validation Side Effects

- Before: `git status --porcelain` empty; `HEAD` `062601a5…`; `rate_limit.py` SHA-256 `15d9aabb7aab37ed74acdb71c5864bf73aecadcf1034d4dc66e4dfcb9ae0e012`.
- After: `git status --porcelain` empty; same `HEAD`; same `rate_limit.py` SHA-256.
- Unexpected tracked-file changes: **none.** `uv build` created `dist/`, which is gitignored (`git status --porcelain --ignored=traditional` reports `!! dist/`). Per constraint 10 I left it in place rather than restoring; it is a build artifact of a required validation command, not a modification to reviewed state.

## Findings

### IR-001 — A provider-stated throttle delay of `0` makes `execute` retry forever; the throttle budget never advances

- **Severity**: HIGH
- **Status**: OPEN (new in v3)
- **Acceptance criteria**: DAC-E3-S4-6 (PARTIAL); relates to DAC-E3-9
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:154-163` (`execute`, THROTTLED branch), `:200-209` (`_throttle_delay`)
- **Claim challenged**: the component design's section 3 constraint that "Both the attempt counter and the throttle wait budget have ceilings, so **no path** retries indefinitely" (OPS-LOOP-001), and DAC-E3-S4-6's claim that the throttle wait budget "bounds the throttled path".
- **Observed evidence**: the budget is accumulated from the delay itself —

  ```python
  delay = self._throttle_delay(exc, stated_delay_seconds)
  self._sleep(delay)
  throttle_wait_used += delay
  if throttle_wait_used > self._settings.max_throttle_wait_seconds:
      raise ProviderUnavailable(...)
  continue
  ```

  When `stated_delay_seconds` returns `0.0`, `_throttle_delay` returns it verbatim (`:205-208`, `if stated is not None`), so `throttle_wait_used` stays at `0.0` forever and the exhaustion check can never fire. I ran it rather than inferring it: with `max_throttle_wait_seconds=300.0` and a classifier returning `THROTTLED` with `stated_delay_seconds=lambda exc: 0.0`, the call did not terminate within 5 seconds, having made **6,631,843 `send()` calls** with `throttle_wait_used` still `0.0`. The boundary sub-path is safe by contrast: `_seconds_to_next_boundary` returns `60 - (t % 60)`, always in `(0, 60]`, so the budget always advances there.
- **Expected evidence/behavior**: component design section 3 ("no path retries indefinitely", OPS-LOOP-001) and DAC-E3-S4-6 ("Given the throttle wait budget, When it is configured, Then it bounds the throttled path so `OPS-LOOP-001`'s unbounded-loop failure cannot occur"). The bound must hold for **both** rows of the design's section 2.5 throttle table, not only the no-stated-delay row.
- **Impact**: latent, not live — CAP-001-E3-S1 passes no `stated_delay_seconds` callback and Massive sends no `Retry-After`, so this cannot occur against the only provider this capability has today, which is why this is HIGH rather than CRITICAL. But the story retains and tests this path *specifically* because the governor is provider-agnostic (DAC-E3-S4-1: "This path is dead code against Massive and is retained because the governor is provider-agnostic"). `Retry-After: 0` is a legitimate response meaning "retry immediately", and an HTTP-date `Retry-After` already in the past computes to zero or negative. Against such a provider, `_acquire_permit` would pace the loop to the configured requests-per-minute and the run would hammer the provider indefinitely, never failing the instrument and never advancing — precisely the OPS-LOOP-001 failure the budget exists to prevent. A negative stated delay is differently bad but fails fast: `time.sleep` raises `ValueError`.
- **Required remediation**: make the throttled path advance or terminate regardless of the stated delay's magnitude. A bounded result, not a prescribed design: either clamp a non-positive stated delay to a positive floor before it is slept and billed, or count throttle iterations alongside the wait budget so a zero-cost throttle still consumes something finite. Cover it with a test that returns `0.0` from `stated_delay_seconds` and asserts `ProviderUnavailable` is raised after a bounded number of sends — the existing `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises` is the natural home, since it already owns TC-COMP-203/231.

### IR-002 — `except BaseException` hands `KeyboardInterrupt` and `SystemExit` to the caller's classifier

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v2 IR-001, itself carried from v1 IR-006; not attempted)
- **Acceptance criteria**: N/A (robustness; touches design section 9's cancellation expectation)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:148-149`
- **Claim challenged**: that routing every raised exception through `classify` is safe for the cancellation path.
- **Observed evidence**: the catch is still `except BaseException`, byte-identical to the state v2 reviewed. `is_fatal_for_governor` (`massive/errors.py:192`) is typed for `MassiveError` inputs, so a caller's classifier needs its own fallback; a fallback of `RETRYABLE` or `THROTTLED` — the natural safe-looking defaults — would make the governor sleep and retry on a Ctrl-C. No test covers either exception type.
- **Expected evidence/behavior**: the `Callable[[BaseException], Outcome]` signature is design-mandated, so catching broadly conforms; but design section 9 expects a cancellation request to take effect.
- **Impact**: an owner interrupting a long run could see it sleep through the signal, depending on how CAP-001-E3-S1 writes its classifier. The boundary wait is a genuine up-to-120s wall-clock wait, so an interrupt swallowed here is swallowed for a while.
- **Required remediation**: re-raise `KeyboardInterrupt` and `SystemExit` before classification, or document the contract and assert it in a test. Suitable for CAP-001-E3-S1's wiring story. Documented as a known limitation in `README.md`.

### IR-003 — The per-window pacing test asserts a bound of twice the configured budget; the design conflict is still unresolved

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v2 IR-002, itself carried from v1 IR-007; not attempted)
- **Acceptance criteria**: AC-4 (SATISFIED overall; this is a test-strength weakness, not an unmet criterion)
- **Tasks**: T002
- **Files**: `tests/unit/test_governor_pacing.py:67-100`
- **Claim challenged**: T002's claim that "no virtual one-minute window issues more than the configured budget".
- **Observed evidence**: `test_governor_pacing.py` is byte-identical to its v1 state. The assertion is `count_in_window <= capacity + refill_rate * 60.0`, which at `capacity=3` permits 6 sends in a one-minute window.
- **Expected evidence/behavior**: design acceptance criterion 1 states "Requests issue at no more than the configured budget over any one-minute window", which a bucket that starts full (required by T006) cannot satisfy in its first window. The conflict between two approved statements is still resolved only inside a test docstring.
- **Impact**: the story's headline pacing guarantee rests on an assertion that tolerates twice the budget; a regression doubling the issue rate would not fail. Against a five-request-per-minute tier this is the difference between pacing and being throttled.
- **Required remediation**: **an owner decision, not a coding pass.** Either the bucket starts empty (or at capacity with a documented first-window exception) and the test asserts the budget strictly, or design AC 1 is amended to the standard token-bucket bound; then strengthen the test to match. Recorded in `README.md` and in the TDD evidence's `known_limitations`.

### IR-004 — `test_from_massive_settings_uses_massive_defaults` does not clear the environment variables whose defaults it asserts

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v2 IR-004; not attempted)
- **Acceptance criteria**: N/A (test determinism)
- **Tasks**: T007
- **Files**: `tests/unit/test_governor_settings.py:46-64`
- **Claim challenged**: that the settings tests are free from environment dependence.
- **Observed evidence**: the file is byte-identical to its v2 state. The test sets only `FACTORFLOW_MASSIVE_API_KEY` and `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` (`:53-54`), then asserts `max_attempts=3`, `initial_backoff_seconds=2.0`, `max_throttle_wait_seconds=300.0` without clearing the three variables that would override them. The nearby established pattern is explicit about this: `tests/unit/test_settings_defaults.py::test_timing_defaults_match_the_canonical_set` `delenv`s all seven timing variables before asserting the same defaults.
- **Expected evidence/behavior**: the review's test-quality gate requires tests free from environment dependence unless explicitly controlled, and the repository already demonstrates the controlled form a few files away.
- **Impact**: a developer or CI runner with a `FACTORFLOW_MASSIVE_*` override in scope gets a spurious failure. Two pre-existing tests in `test_settings_defaults.py` share this weakness, so this is a missed opportunity to follow the better local pattern rather than a novel hazard — hence MEDIUM.
- **Required remediation**: add `monkeypatch.delenv(var, raising=False)` for `FACTORFLOW_MASSIVE_MAX_ATTEMPTS`, `FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS` and `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS`. Cheapest finding on this list to close.

### IR-005 — The throttle budget is a soft bound: the governor sleeps one full wait it has already no budget for

- **Severity**: LOW
- **Status**: OPEN (new in v3; v1 noted the ordering as design-conformant but did not quantify the cost)
- **Acceptance criteria**: DAC-E3-9 (SATISFIED), DAC-E3-S4-6 (PARTIAL for the separate reason in IR-001)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:155-163`
- **Claim challenged**: `README.md`'s statement that `max_throttle_wait_seconds` "bounds the cumulative wait across `THROTTLED` retries".
- **Observed evidence**: the budget is checked *after* the sleep, so the final wait is always slept and then immediately abandoned. Measured at `HEAD`: budget 300s with unjittered boundary waits sleeps 360s (**+20%**); budget 300s with jitter at 0.99 sleeps 358.2s (**+19%**); budget 90s sleeps 120s (**+33%**). The overshoot is bounded by one maximum wait (up to 2×60s on the boundary path), so the loop still terminates — this is a cost finding, not a correctness one. I verified v1's defence and it is correct: design section 2.2's flowchart places node I ("sleep, and do NOT count an attempt") *before* node J ("Throttle wait budget exceeded?"), so the implementation is faithful to the approved design.
- **Expected evidence/behavior**: none violated — this conforms to the design. Recorded because the design itself appears not to have considered the cost, and no artifact currently states that the budget is soft.
- **Impact**: the final sleep is pure dead time: the governor waits up to 120s and then raises unconditionally. Against an exhausted monthly quota across a 3000-instrument run (the story's own stated scale), that is up to 100 hours of avoidable waiting spread across the run, on top of the budgeted waits.
- **Required remediation**: for the next design revision rather than this story — either check the budget before sleeping (so the governor fails immediately once the remaining budget cannot cover the next wait), or state in the design and `README.md` that the bound is soft and may be exceeded by one wait. No code change is required to pass this gate.

### IR-006 — Backoff cap is `initial × 2**(attempts-1)`, one doubling below the design's literal wording

- **Severity**: LOW
- **Status**: OPEN (carried from v2 IR-005, itself carried from v1 IR-008; deliberately not attempted)
- **Acceptance criteria**: DAC-E3-8 (SATISFIED)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:239-244`, `tests/unit/test_governor_backoff.py:49-66`
- **Observed evidence**: unchanged. The cap on the first retry is `initial × 2**0 = initial`; design section 2.5 row 3 and the story's own outcome table read "initial delay times two to the power of attempts".
- **Impact**: none operationally; the implementation is the conventional reading and the bound holds.
- **Required remediation**: record the interpretation for the next design revision so the wording is aligned. Already documented in `README.md`.

### IR-007 — The test wall clock never advances during throttle sleeps

- **Severity**: LOW
- **Status**: OPEN (carried from v2 IR-006; not attempted)
- **Acceptance criteria**: N/A (test fidelity)
- **Tasks**: T003
- **Files**: `tests/unit/governor_fakes.py:31-42`, `tests/unit/test_governor_retry.py:165-192`
- **Observed evidence**: `FakeSleeper` advances only the `FakeClock` it is bound to, which every test wires to `monotonic`. The injected `now` source is a separate, never-advanced `FakeClock` (`test_governor_retry.py:51`), so across a multi-wait throttle sequence the wall clock stays frozen and every boundary computation sees the same remainder.
- **Expected evidence/behavior**: in production, sleeping past a boundary moves the wall clock, so the second boundary wait is computed from a new phase.
- **Impact**: small and containable. Freezing the wall clock is a legitimate isolation choice for the jitter test — it is what lets that test attribute the whole difference to jitter — and the phase computation itself is pinned by `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time`. What is missing is the composition of the two.
- **Required remediation**: optionally bind the sleeper to both clocks, or add one test that advances the wall clock between two throttles and pins the two distinct boundary waits.

### IR-008 — The task plan's deviation note is labelled IR-004 but records IR-005's deviation

- **Severity**: LOW
- **Status**: OPEN (carried from v2 IR-007; not attempted)
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: N/A (plan bookkeeping)
- **Files**: `…/CAP-001-E3-S4-tasks.md:166`
- **Observed evidence**: the note still opens "**Recorded deviation (IR-004 rework, review v1).**" while its content — additive boundary jitter versus design section 2.5's "full jitter over the computed delay" — is v1's IR-005. v1's IR-004 was the TC-ID mislabelling finding, which was fixed in the test files rather than recorded as a deviation.
- **Impact**: a reader reconciling the plan against the v1 report is pointed at the wrong finding. The substance of the recorded deviation is correct and complete.
- **Required remediation**: change `IR-004` to `IR-005` in that sentence. A one-word fix carried across two reviews now.

### IR-009 — `GovernorSettings` still has no construction-time validation

- **Severity**: LOW
- **Status**: OPEN (carried from v2 IR-008; the owner-directed remediation for v1's IR-003 is complete)
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/rate_limit.py:54-64`, `:110-111`, `:196-197`
- **Observed evidence**: `GovernorSettings` remains a plain frozen dataclass with no validators, so `GovernorSettings(requests_per_minute=0, …)` constructs successfully and then raises `ZeroDivisionError` inside `_acquire_permit` when `_refill_rate` is `0.0`.
- **Impact**: materially reduced by the `from_massive_settings` factory. The intended construction path flows through `MassiveSettings`, where `Field(ge=1)` enforces positivity at `settings.py:112`, so the guarantee travels with the value for every production caller. What remains is that a direct literal construction — which only the tests do today — fails late and obscurely.
- **Required remediation**: optionally add a `__post_init__` guard rejecting `requests_per_minute < 1` and non-positive timings, so the failure names the problem. Note this would also make IR-001 harder to reintroduce.

### IR-010 — The refreshed TDD evidence's aggregate suite counts are superseded by the merge

- **Severity**: LOW
- **Status**: OPEN (new in v3; consequence of the merge, not of any coding error)
- **Acceptance criteria**: N/A (evidence quality)
- **Tasks**: T010
- **Files**: `…/CAP-001-E3-S4-tdd-evidence.yaml` (`post_mutation_verification.result`)
- **Claim challenged**: that the recorded validation counts describe the state a downstream reader will measure.
- **Observed evidence**: the file records "289 passed (full suite); 230 passed, 59 deselected (not postgres); ruff format --check: 95 files already formatted". At current `HEAD` I measure **306**, **247 passed / 59 deselected**, and **96 files**. The divergence is entirely explained by S3's and S5's tests arriving with the merge — the per-mutation kill sets, which are what the artifact exists to prove, remain exactly correct, and I reproduced five of them. The file is also explicit that its baseline is `58052fd`, so it is not misrepresenting itself.
- **Expected evidence/behavior**: the plan's story-specific validation asks to "record test execution, commit hash, and manual mutation results".
- **Impact**: low and purely downstream. Release readiness or a later reader comparing the recorded totals against a fresh run will see a mismatch and have to re-derive why. The mutation evidence itself is sound — `rate_limit.py` still hashes to the `15d9aabb…` value the file records, which I confirmed independently.
- **Required remediation**: on the next touch of this story, update `post_mutation_verification.result` to the post-merge totals, or add one line noting that the aggregate counts are as-of `58052fd` on the pre-merge branch while the per-mutation results remain valid at any `HEAD` where `rate_limit.py` hashes to `15d9aabb…`.

## Previous Review Disposition

Every finding from `CAP-001-E3-S4-implementation-review-v2.md`, each disposition backed by current repository evidence rather than by v2's own claims:

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 — `except BaseException` catches `KeyboardInterrupt`/`SystemExit` (MEDIUM) | **STILL OPEN** | `rate_limit.py:148-149` byte-identical to v2's state. Re-raised as v3 IR-002. Now documented in `README.md` as a known limitation, which is a genuine improvement in visibility but not a fix. |
| v2/IR-002 — per-window pacing test tolerates 2× the budget (MEDIUM) | **STILL OPEN** | `git diff 58052fd HEAD -- tests/unit/test_governor_pacing.py` is empty; the assertion at `:94` is unchanged. Re-raised as v3 IR-003. Recorded in `README.md` and in the TDD evidence's `known_limitations`, and correctly flagged there as needing an owner decision. |
| v2/IR-003 — TDD evidence not refreshed, describes a pre-rework baseline (MEDIUM) | **RESOLVED** | Doc-sync commit `3a3c3e1` rebased `manual_mutations_baseline_commit` to `58052fd`, re-based mutations 1-6's counts to the 23-test suite, and added mutations 7-8 for the two rework-introduced behaviors (boundary anchoring, settings mapping) that previously had no coverage. I did not take this on trust: my Probes A, B, D, G and H target those same behaviors and my kill sets match the recorded ones test-for-test, and the recorded `rate_limit.py` SHA-256 `15d9aabb…` matches what I measured. Residual and much weaker: the aggregate suite counts are now superseded by the merge (v3 IR-010, LOW). |
| v2/IR-004 — settings default test does not clear its environment variables (MEDIUM) | **STILL OPEN** | `tests/unit/test_governor_settings.py` byte-identical; `:46-64` still sets only two variables and no `delenv`. Re-raised as v3 IR-004. |
| v2/IR-005 — backoff cap one doubling below the design's wording (LOW) | **STILL OPEN** | `rate_limit.py:239-244` unchanged. Re-raised as v3 IR-006. Now documented in `README.md`. |
| v2/IR-006 — test wall clock never advances during throttle sleeps (LOW) | **STILL OPEN** | `governor_fakes.py` and `test_governor_retry.py:51` unchanged. Re-raised as v3 IR-007. Now documented in `README.md`. |
| v2/IR-007 — plan's deviation note labelled IR-004 but records IR-005 (LOW) | **STILL OPEN** | `CAP-001-E3-S4-tasks.md:166` still reads "Recorded deviation (IR-004 rework, review v1)". Re-raised as v3 IR-008. |
| v2/IR-008 — `GovernorSettings` has no construction-time validation (LOW) | **STILL OPEN** | `rate_limit.py:54-64` is still a bare frozen dataclass. Re-raised as v3 IR-009. Now documented in `README.md`. |
| v2/IR-009 — no structured attempt count on exhaustion; no governor logging (LOW) | **STILL OPEN** | Both `ProviderUnavailable` raises (`:159-162`, `:171-173`) still pass only a message string with the count interpolated into prose; the module imports no logger; `tests/unit/test_governor_logging.py` is still absent. Documented in `README.md` as an open owner decision. Not re-raised as a separate v3 finding — it is unchanged, correctly recorded downstream, and outside this story's plan; it remains an owner question about whether it belongs to CAP-001-E5. |

Nothing in this dispositions table caused the CHANGES-REQUIRED verdict. Eight of v2's nine findings were explicitly accepted downstream as warnings, and the ninth was closed by doc sync. The verdict rests solely on IR-001, which is new.

## Scope and Plan Deviations

- **No scope leakage.** All 11 files attributable to the story's seven commits trace to the story, its task plan, or a prior review's required remediation. No dependency, migration, or configuration change; no unrelated refactor; `src/factorflow/config/settings.py` correctly untouched.
- **The shared-file trigger is a different owner's change, confirmed by diff.** `massive/errors.py` moved twice since v2's reviewed `HEAD`. CAP-001-E3-S5 added `compose_failure_reason`, `MAX_FAILURE_REASON_VARIABLE_TEXT` and `_bound_variable_text` — purely additive (+108/−1). CAP-001-E3-S3's rework accounts for the single deletion, narrowing `is_rate_limited_body`'s reason lookup from `fields["error"] or fields["message"] or ""` to `fields["error"] or ""`. Neither touches `ProviderUnavailable`, `MassiveError.__init__`, or `is_fatal_for_governor`. S4's only runtime import from that module is `ProviderUnavailable` (`rate_limit.py:34`); `is_fatal_for_governor` appears in S4 solely as a docstring reference (`:19`), and `Outcome` is defined by `rate_limit.py` itself (`:44`), not by `errors.py`. The dependency surface is intact, and the full suite passes against the merged result.
- **`tests/unit/test_governor_settings.py` remains a file not named in the task plan.** It is the direct remediation v1's IR-003 required, so it is justified; T007's file list was never updated to name it. Worth a line on the next plan touch, as v2 also observed.
- **`status: draft` in the tasks frontmatter is not an inconsistency.** All four E3 sibling task files carry it, and it is the value in `docs/templates/story-tasks.md`. The story's own `status: docs-sync` is set correctly.
- **Doc-sync ran before this review, which is the expected order** given v2 passed. Its README section is accurate: I checked the outcome table, the two-budget description, the wall-clock anchoring paragraph and the additive-jitter deviation against the code, and it documents all eight of v2's open findings honestly rather than quietly dropping them. One phrase now needs qualifying — "bounds the cumulative wait across `THROTTLED` retries" — per IR-005 and IR-001.
- **The doc-sync commit's own claim about story status is sound.** It sets `docs-sync` rather than `done` because CAP-001's automation-review gate is blocked, which matches what I see in the repository.

## Follow-Up

- **Next agent**: **Coding Agent**, with `CAP-001-E3-S4-tasks.md` and this report; then a new adversarial review (v4).
- **Required action**: close **IR-001** — make the throttled path advance or terminate for any stated delay, including `0`, and add a test that pins bounded termination for a zero stated delay. That is the only blocking item.
- **Worth folding into the same pass** (cheap, mechanical, and carried across two reviews already): **IR-004** (three `monkeypatch.delenv` lines) and **IR-008** (a one-word label fix in the plan's Notes). **IR-009**'s `__post_init__` guard is optional but would harden the same area IR-001 sits in.
- **Needs the owner, not the Coding Agent**: **IR-003** (the design-AC-1-versus-full-bucket conflict, now carried through three reviews) and the open question recorded under v2/IR-009 (whether governor logging and structured exhaustion failures belong to CAP-001-E5 or a later story). Neither blocks this gate, and neither should be silently resolved by a coding pass.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED, so no findings are being accepted downstream at this time. IR-002 through IR-010 should be re-dispositioned at v4.
- **Discharged by this review**: the "rerun the suite once after the restack" caveat that v1 and v2 both left open. S3, S4 and S5 are merged and the full suite passes (306 passed). No further restack verification is needed.
