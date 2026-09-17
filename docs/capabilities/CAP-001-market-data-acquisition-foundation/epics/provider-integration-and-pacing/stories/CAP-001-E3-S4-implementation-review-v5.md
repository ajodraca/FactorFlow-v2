---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S4-implementation-review
artifact_type: implementation-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-17
updated: 2026-09-17
story_id: "CAP-001-E3-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 5
reviewed_at: "2026-09-17T00:10:03Z"
reviewed_head: "7efc3299734f4a3fa83dcf99f292482ea4cb8837"
review_base: "062601a54e800609408e3e23a542c7139bfb2abd"
reviewed_state_revision: "sha256:860556d07bc4f975b28a2aed600bff8e60d607fc1fe21d8782f8e62e55fb95f1"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-17T00:10:03Z
  source_artifacts:
    - id: CAP-001-E3-S4
      version: "1"
    - id: CAP-001-E3-S4-tasks
      version: "2"
    - id: CAP-001-E3-S4-implementation-review
      version: "4"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-specification-review
      version: "5"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S4 — Version 5

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 3 |
| Low findings | 9 |
| Acceptance criteria | 11/11 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 8/8 passed |

**v4's blocking finding is closed, and I proved it with the exact probe v4 said
would decide it.** The rework added two things to `tests/unit/test_governor_pacing.py`
and nothing else to the implementation — `rate_limit.py` is byte-identical to the
state v4 reviewed (`sha256:4df3f801…`), so this is a pure test-strengthening pass
with no new production risk to assess.

- **Probe A — remove the `min(self._capacity, …)` refill ceiling:** at v4 this
  mutation **survived all 24 governor tests**. It is now **KILLED**, failing
  `test_refill_never_exceeds_bucket_capacity` at `test_governor_pacing.py:119`
  ("Right contains one more item: 20.0"): 1 failed, 24 passed. The test is not
  loosely tuned either — **Probe B**, a ceiling of `capacity + 1.0` rather than no
  ceiling at all, also dies at the same line, so the assertion sits on the exact
  token boundary.
- **The DEC-0002 / governor-v8 two-part bound is now fully asserted, and I measured
  the slack rather than reading the code.** Clause 2 ("subsequent windows after
  drawdown are capped at the configured budget alone") is `:96-97`, and it is
  neither vacuous nor loose: over the test's 30 sends it executes for **25**
  post-drawdown windows and **every one of them contains exactly 3 sends against a
  capacity of 3 — zero slack**, so any increase in the steady-state issue rate
  fails it. Clause 1's overhang allowance is genuinely exercised by the same run:
  the 5 pre-drawdown windows contain 3, 4 and 5 sends against the `capacity +
  refill_rate × 60 = 6` bound, which is why that clause exists. Clause 1's *premise*
  — that the bucket cannot accumulate past capacity while idle — is what Probes A
  and B now pin.

Everything else in the change set is documentation. All three of v4's MEDIUM
findings are carried unattempted, and three of the four LOW items I raised at v4
about this story's own bookkeeping are still open, with two new LOW items created by
this rework: the strengthened test's docstring now contradicts the assertions
directly beneath it, and the task plan's `artifact_version` stayed at `2` across a
second material amendment of T002.

I re-ran every required command myself rather than trusting the rework's recorded
figures; they match exactly — **308** full, **249 passed / 59 deselected**
(`not postgres`), **25** governor tests, ruff check, ruff format (96 files), mypy
(28 source files) and `uv build` all clean. I also re-ran the v4 IR-004 environment
regression check under hostile `FACTORFLOW_MASSIVE_*` values: 2 passed.

No acceptance criterion, planned task, mandatory test or required validation command
is unsatisfied, and no finding is CRITICAL or HIGH, so the gate passes with the
twelve findings below recorded as warnings.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S4-tasks.md` (frontmatter v2, `last_reworked_review: …-v4.md`) |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, reviewed in place) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S4-review` |
| HEAD | `7efc3299734f4a3fa83dcf99f292482ea4cb8837` (unchanged since v4 — the rework is entirely uncommitted) |
| Review base | `062601a54e800609408e3e23a542c7139bfb2abd` (merge base with `main` and `origin/main`, identical) |
| Working tree | **intentionally dirty**: 8 modified tracked files, 3 untracked files, 0 staged; byte-identical before and after all validation and all four probes |
| Changed files reviewed | 13 (2 committed since base + 8 modified + 3 untracked) |

`python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001
--story <story> --stage adversarial-review` → `adversarial-review: READY — review
changes were reworked; a new review version is required` (exit 0).

`pipeline-state.py code-revision` returns `sha256:860556d0…`, different from the
`sha256:64c2ba64…` v4 recorded, while `HEAD` and `rate_limit.py`'s digest are both
unchanged — which localises the entire rework to test and documentation files before
any diff is read. Per skill constraint 6 the reviewed subject is the union of
committed changes since the merge base and the staged, unstaged and untracked working
tree; the whole rework exists only in the working tree.

The story's content digest is `sha256:e32281e8…`, byte-identical to the digest all
four prior reviews recorded and to the story's own `approval.reviewed_revision`.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `tests/unit/test_governor_pacing.py` | modified (working tree) | **The v4 rework.** T002: post-drawdown budget assertion at `:96-97`, new `test_refill_never_exceeds_bucket_capacity` at `:105-119`; v4 IR-001 remediation |
| `…/stories/CAP-001-E3-S4-tasks.md` | modified (working tree) | **The v4 rework.** T002 amended to name the refill ceiling; `last_reworked_review` → v4 |
| `…/stories/CAP-001-E3-S4-tdd-evidence.yaml` | modified (working tree) | **The v4 rework.** New `review_v4_rework` block with mutation and validation evidence |
| `src/factorflow/ingestion/rate_limit.py` | modified (working tree) | T008; v3 IR-001 remediation. **Byte-identical to the state v4 reviewed** (`sha256:4df3f801…`) |
| `tests/unit/test_governor_retry.py` | modified (working tree) | T003; v3 IR-001 regression test. Unchanged since v4 |
| `tests/unit/test_governor_settings.py` | modified (working tree) | v3 IR-004 remediation. Unchanged since v4 |
| `…/design/component-design-rate-limit-governor.md` | modified (committed `7efc329` → v7, working tree → v8) | Owner decision DEC-0002; approved against spec review v5. Unchanged since v4 |
| `…/stories/CAP-001-E3-S4.md` | modified (working tree) | `status`/`updated` only; content digest unchanged |
| `…/stories/CAP-001-E3-S4-implementation-review-v3.md` | added (committed `873d518`) | Prior gate report |
| `…/stories/CAP-001-E3-S4-implementation-review-v4.md` | untracked | Prior gate report — still uncommitted |
| `…/specifications-review-report-v4.md` | untracked | Spec gate for governor v7 |
| `…/specifications-review-report-v5.md` | untracked | Spec gate for governor v8; cited by v8's `approval.review_artifact` |
| `README.md` | **untouched** | Doc Sync scope; see IR-008 |
| `src/factorflow/config/settings.py` | **untouched** | T007 requires it; confirmed by diff |

No unjustified file. Nothing outside T002's remediation moved in this rework, which
is the surgical scope v4's Follow-Up asked for.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-4 | SATISFIED | `rate_limit.py:110-113`, `:182-200` `_acquire_permit`, `:192` `min(self._capacity, …)` | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_virtual_minute_windows_stay_within_the_token_bucket_bound`, `::test_refill_never_exceeds_bucket_capacity` | Now pinned on all three axes of the approved bound: the capacity ceiling (Probes A and B both killed), the full-bucket window overhang (observed counts 3–5 against a bound of 6), and the post-drawdown steady state (25 windows, all exactly at capacity, zero slack). Doubling `_refill_rate` still kills 3 pacing tests. |
| DAC-E3-6 | SATISFIED | `rate_limit.py:154-165` — the THROTTLED branch never touches `attempts` | `test_governor_retry.py::test_repeated_throttled_outcomes_do_not_consume_attempts`, `::test_throttled_outcomes_do_not_share_the_retry_attempt_counter` | Unchanged since v4. The mixed THROTTLED/RETRYABLE test proves the counter is untouched, not merely tolerant. |
| DAC-E3-7 | SATISFIED | `rate_limit.py:213-239` `_boundary_wait_with_jitter` / `_seconds_to_next_boundary` | `test_governor_retry.py::test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter`, `::test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` | Unchanged. Wall-clock anchored; the mid-minute test pins 82.5s so a constant-wait regression cannot survive. |
| DAC-E3-8 | SATISFIED | `rate_limit.py:171-178`, `:241-246` `_backoff_delay` | `test_governor_retry.py::test_retryable_outcome_increments_attempts_and_retries_with_backoff`, `test_governor_backoff.py::test_backoff_delay_grows_exponentially_with_full_jitter` | Unchanged. Attempts increment only off the throttle path; the cap doubles and is pinned at exact values with the jitter fraction fixed. |
| DAC-E3-9 | SATISFIED | `rate_limit.py:154-165` | `test_governor_retry.py::test_boundary_throttle_wait_exhausts_the_budget_and_raises`, `::test_stated_delay_throttle_wait_exhausts_the_budget_and_raises`, `::test_zero_stated_delay_throttle_wait_is_bounded` | Unchanged since v4, where I killed the budget check by removal (3 tests) and by doubling (2 tests). |
| DAC-E3-S4-1 | SATISFIED | `rate_limit.py:202-211` `_throttle_delay` | `test_governor_retry.py::test_stated_delay_is_honoured_exactly_without_jitter` | Unchanged. Pins 12.5 exactly and asserts `jitter.calls == 0`. |
| DAC-E3-S4-2 | SATISFIED | `rate_limit.py:228-229` | `test_governor_retry.py::test_successive_boundary_throttle_waits_receive_independent_jitter` | Unchanged. Two waits pin 72.0 and 108.0 plus an explicit inequality. |
| DAC-E3-S4-3 | SATISFIED | `rate_limit.py:151-152` (bare `raise`) | `test_governor_retry.py::test_fatal_outcome_reraises_immediately_without_wait_or_retry` | Unchanged. Object identity and `sleeper.calls == []`. |
| DAC-E3-S4-4 | SATISFIED | `rate_limit.py:171-175` | `test_governor_retry.py::test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_governor_backoff.py::test_no_fourth_send_after_the_default_attempt_limit` | Unchanged. `send.calls == 3` at `max_attempts=3`. |
| DAC-E3-S4-5 | SATISFIED | `rate_limit.py:110-113`, `:188-200` | `test_governor_pacing.py::test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill`, `::test_partial_refill_credits_elapsed_virtual_time`, `::test_refill_never_exceeds_bucket_capacity` | Strengthened by this rework: zero artificial delay is now asserted both for a fresh bucket and for a bucket refilled after a 120s idle interval, with the following send taking exactly `60/capacity`. |
| DAC-E3-S4-6 | SATISFIED | `rate_limit.py:141`, `:155-165` | `test_governor_retry.py::test_zero_stated_delay_throttle_wait_is_bounded` plus the two budget-exhaustion tests | Unchanged since v4. The OPS-LOOP-001 bound holds on every sub-path. What the budget now *measures* changed at the v3 rework and is still undocumented — IR-001 — but the criterion itself is met. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py`, `rate_limit.py`, `tests/unit/governor_fakes.py` + three governor test modules | Unchanged. `FakeClock` advances only on explicit `advance` or through a bound `FakeSleeper`; the 25-test governor suite runs in 0.06s, corroborating that nothing sleeps in real time. |
| T002 | complete | **VERIFIED** (was PARTIAL at v4) | `test_governor_pacing.py:47-119` | All five assertions T002 v2 now names are present and load-bearing: zero delay to capacity (`:58-59`), the `N+1` refill wait (`:63-64`), the refill ceiling (`:105-119`, kills Probes A and B), the full-bucket window overhang (`:94-95`, exercised at counts 4 and 5), and the post-drawdown budget (`:96-97`, 25 windows at zero slack). The docstring above them is now stale — IR-011, LOW. |
| T003 | complete | VERIFIED | `test_governor_retry.py:67-270` | Unchanged. All six required TC-IDs present and labelled. T003's wording "both throttle paths count **their waits** against `max_throttle_wait_seconds`" is still only loosely true — IR-001. |
| T004 | complete | VERIFIED | `test_governor_retry.py:276-318`, `test_governor_backoff.py:46-93` | Unchanged. TC-COMP-202, TC-COMP-228, TC-COMP-229 present and labelled. |
| T005 | complete | VERIFIED | `test_governor_retry.py:324-347` | Unchanged. `_UnrelatedException` carries no provider knowledge; `_never_classify` raises if the OK path ever classifies. |
| T006 | complete | VERIFIED | `test_governor_pacing.py:122-164` | Unchanged, and now complemented rather than contradicted: the full-start requirement T006 imposes is exactly what DEC-0002 legitimised, and `test_refill_never_exceeds_bucket_capacity` bounds it. |
| T007 | complete | VERIFIED | `rate_limit.py:44-78`; `tests/unit/test_governor_settings.py` | Unchanged. `settings.py` untouched; `MassiveSettings` under `TYPE_CHECKING` only; environment isolation re-verified under hostile overrides. Residual: no construction-time validation (IR-007). |
| T008 | complete | VERIFIED | `rate_limit.py:115-180` `execute`, `:182-200` `_acquire_permit` | Unchanged from v4, where every outcome row was individually probe-killed. IR-001 is a semantic deviation within this verified task. |
| T009 | complete | VERIFIED | `src/factorflow/ingestion/__init__.py:16-21` | Unchanged. Re-exports exactly the three names; no Massive-specific delay callback. |
| T010 | complete | VERIFIED | `CAP-001-E3-S4-tdd-evidence.yaml` | The new `review_v4_rework.mutation_evidence` claim is accurate — my Probe A reproduces its stated failure mode and location exactly. Verified but with stale metadata carried from v4: baseline commit, `rate_limit.py` SHA-256 and `post_mutation_verification` totals still describe superseded code, and the eight mutation counts are now two suites out of date. See IR-002. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_refill_never_exceeds_bucket_capacity` / T002 (AC-4), new | **ADEQUATE** | Drains the bucket, idles 120s — long enough to refill 6 tokens into a 3-token bucket — then asserts the next 3 sends are free (`sleeper.calls == []`) *and* that the 4th waits exactly `60/capacity`. That second assertion is what makes it non-free: with the ceiling removed the 4th send is also free, so the recorded call list is empty instead of `[20.0]`. Probe A **KILLED** (1 failed, 24 passed); Probe B (ceiling `capacity + 1.0`) **KILLED** at the same line, so the boundary is exact, not approximate. | No docstring or explicit AC/T002 annotation, consistent with its T006 siblings in the same file — not a defect on its own |
| `test_virtual_minute_windows_stay_within_the_token_bucket_bound` / T002 (AC-4) | **ADEQUATE** (was WEAK at v4) | 30 sends at capacity 3. Three layered bounds: the DEC-0002 overhang bound `capacity + refill_rate × 60` on every window, the post-drawdown bound `count <= capacity` for `t >= 60`, and a whole-run average bound. I measured both regimes: 5 pre-drawdown windows reach counts of 4 and 5 (so the overhang allowance is genuinely needed, not a fudge), and 25 post-drawdown windows sit at exactly 3 of 3 — the assertion has zero slack, so any steady-state rate increase fails it. Doubling `_refill_rate` kills 3 tests in this file. | Its docstring still argues *against* the stronger per-window claim the code now asserts — IR-011 |
| `test_capacity_n_sends_incur_no_delay_and_the_next_waits_for_refill` / TC-COMP-230 | ADEQUATE | Asserts both `sleeper.calls == []` and `clock() == 0.0` — a no-op sleeper alone could not satisfy both — then exactly `60/capacity`. Killed by Probe C (permit wait scaled 0.75) among others. | none |
| `test_zero_stated_delay_throttle_wait_is_bounded` / TC-COMP-203, TC-COMP-231 | ADEQUATE | Unchanged since v4, where restoring the v3 accumulation defect killed it (1 failed, 23 passed) via its in-test boundedness guard. | Termination is driven by the `rpm=1` permit wait, not by a throttle wait; narrower than its name — IR-009 |
| `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises`, `test_boundary_throttle_wait_exhausts_the_budget_and_raises` / TC-COMP-203, TC-COMP-231 | ADEQUATE | Unchanged. Exact wait sequences pinned (`[10,10,10]` against 25s; `[60,60]` against 90s), so the termination point is asserted rather than only the raise. | none |
| `test_repeated_throttled_outcomes_do_not_consume_attempts`, `test_throttled_outcomes_do_not_share_the_retry_attempt_counter` / TC-COMP-200 | ADEQUATE | Unchanged. The second mixes 3 THROTTLED then RETRYABLE at `max_attempts=2`, proving the counter is untouched. | none |
| `test_no_delay_throttle_waits_to_next_minute_boundary_with_full_jitter`, `test_no_delay_throttle_wait_tracks_wall_clock_phase_not_construction_time` / TC-COMP-201 | ADEQUATE | Unchanged. 90.0 at remainder 0; 82.5 constructing at wall-clock 125.0. | none |
| `test_successive_boundary_throttle_waits_receive_independent_jitter` / TC-COMP-227 | ADEQUATE | Unchanged. Both magnitudes pinned plus an explicit inequality. | wall clock frozen between the two waits — IR-006 |
| `test_stated_delay_is_honoured_exactly_without_jitter` / TC-COMP-226 | ADEQUATE | Unchanged. Pins 12.5 and `jitter.calls == 0`. | none |
| `test_retryable_outcome_increments_attempts_and_retries_with_backoff` / TC-COMP-202 | ADEQUATE | Unchanged. `send.calls == 3`, two sleeps. | none |
| `test_backoff_delay_grows_exponentially_with_full_jitter`, `test_successive_backoff_delays_are_not_identical` / TC-COMP-202 | ADEQUATE | Unchanged. Jitter held at 0.9 across both draws isolates the cap's doubling (`[1.8, 3.6]`). | the second is supporting, not primary |
| `test_fatal_outcome_reraises_immediately_without_wait_or_retry` / TC-COMP-228 | ADEQUATE | Unchanged. Object identity and `sleeper.calls == []`. | none |
| `test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_no_fourth_send_after_the_default_attempt_limit` / TC-COMP-229 | ADEQUATE | Unchanged. `send.calls == 3` at both an explicit and the default limit. | none |
| `test_partial_refill_credits_elapsed_virtual_time`, `test_each_send_consumes_exactly_one_permit`, `test_new_governor_instance_starts_with_configured_bucket_capacity` / T006 | ADEQUATE | Unchanged. Token accounting at three capacities; the first two are killed by Probe C. | the idle-then-burst case they never covered is now covered by the new test |
| `test_from_massive_settings_maps_every_field_correctly`, `test_from_massive_settings_uses_massive_defaults` / v1 IR-003 | ADEQUATE | Unchanged since v4. Whole-object equality plus defaults with all three `FACTORFLOW_MASSIVE_*` overrides cleared; re-verified with all three exported to hostile values (2 passed). | none |
| `test_governor_does_not_inspect_exception_type_only_the_classifier`, `test_ok_returns_the_sender_value_without_retry` / T005 | ADEQUATE | Unchanged. `_never_classify` raises if called. | none |

Every mandatory component test mapped to this story is ADEQUATE. Determinism and
isolation remain sound: every governor test injects `monotonic`, `sleep`, `jitter`
and `now`; none touches the network, the filesystem or the real clock; results were
identical across all six suite executions I performed.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -q -m 'not postgres' tests/unit/test_governor_pacing.py tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py tests/unit/test_governor_settings.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | **25 passed** in 0.06s — narrowest story-relevant set, run first; matches the rework's claim |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | **249 passed, 59 deselected**, 2 warnings in 12.71s (both third-party `starlette`/`anyio` deprecations) |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | **308 passed** in 22.22s |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 96 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 28 source files |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | sdist + wheel built (`factorflow-0.1.0`) |
| `FACTORFLOW_MASSIVE_MAX_ATTEMPTS=9 FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS=99 FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS=999 uv run pytest -q tests/unit/test_governor_settings.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 2 passed — v4 IR-004 regression check, repeated |
| `python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact <story>` | `ai-agents` | 0 | PASS | `sha256:e32281e8…`, unchanged across all five reviews |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | `ai-agents` | 0 | PASS | `sha256:860556d0…` |

Every command in the plan's Validation Plan was run in full at the reviewed state.
None was substituted with a narrower form, and none of the rework's recorded figures
was accepted without being reproduced — all seven match to the digit.

### Independent Mutation Probes

Each applied one at a time to a scratchpad copy of `rate_limit.py`, run, then
restored with the file's SHA-256 reconfirmed as
`4df3f8014b40206ee2f7e1a5094133e7b484c1864ed82d89b65ca33499d5e552` before the next.

| Probe | Mutation | Result |
|-------|----------|--------|
| A | `min(self._capacity, …)` removed from `_acquire_permit` — **the mutation that survived at v4** | **KILLED** — 1 failed, 24 passed (`test_refill_never_exceeds_bucket_capacity`, `test_governor_pacing.py:119`, "Right contains one more item: 20.0") |
| B | Ceiling loosened to `capacity + 1.0` (one spare token, not an unbounded bucket) | **KILLED** — 1 failed, 5 passed in `test_governor_pacing.py`, same test and line: the assertion is exact, not approximate |
| C | `wait_seconds` scaled by 0.75 in `_acquire_permit` | **KILLED** — 4 failed, 2 passed in `test_governor_pacing.py`. Instructive: the refill loop re-checks after sleeping, so a short wait costs extra sleeps rather than raising the issue rate — which is why the window test correctly does *not* fail here while the exact-wait tests do |
| D | Behavioural measurement (no mutation): window occupancy across the 30-send run | 25 post-drawdown windows, all at exactly 3 of capacity 3 (**zero slack**); 5 pre-drawdown windows at 3, 4 and 5 against the bound of 6 |

Probes A and B are the decisive evidence for v4 IR-001. Probe D establishes that
`:96-97` is non-vacuous and tight rather than a bound that happens to hold with room
to spare.

### Validation Side Effects

- Before: `git status --porcelain` = 8 modified + 3 untracked (the intentional rework
  state); `HEAD` `7efc329…`; `rate_limit.py` SHA-256 `4df3f801…`.
- After: byte-identical — same paths, same `HEAD`, same `rate_limit.py` SHA-256,
  re-verified after every probe.
- Unexpected tracked-file changes: **none.** `uv build` refreshed `dist/`, which is
  gitignored. Per constraint 10 I left it in place.

## Findings

### IR-001 — The throttle budget's meaning is still "elapsed time since the first throttle", still undocumented

- **Severity**: MEDIUM
- **Status**: OPEN (carried unchanged from v4 IR-002; not attempted)
- **Acceptance criteria**: DAC-E3-9 (SATISFIED), DAC-E3-S4-6 (SATISFIED) — neither is violated
- **Tasks**: T008, T003
- **Files**: `src/factorflow/ingestion/rate_limit.py:141`, `:155-160`; `README.md:309-310`; `…/CAP-001-E3-S4-tasks.md` Notes
- **Claim challenged**: T003's "both throttle paths count **their waits** against … `max_throttle_wait_seconds`"; `README.md:309-310`'s "`max_throttle_wait_seconds` bounds the cumulative wait across `THROTTLED` retries"; design §2.2 node J and §2.5's "throttle wait budget".
- **Observed evidence**: `rate_limit.py` is byte-identical to the state v4 reviewed, so the elapsed-time accounting stands, and neither the task plan's recorded-deviation Notes nor `README.md:309-310` was touched by this rework. My v4 measurement therefore still holds: at `requests_per_minute=1` with a stated delay of 10s and a 300s budget the governor issues 6 sends having actually waited 60s on throttles, while the identical configuration at `requests_per_minute=60` issues 31 sends after 310s of real throttle waiting. Permit-acquisition pacing, `send()` latency and `RETRYABLE` backoff sleeps all debit the budget once the first throttle has occurred. The change is acknowledged in one line of `review_v3_rework.implementation` in the TDD evidence and nowhere else.
- **Expected evidence/behavior**: the design and plan describe a budget over *throttle waits*. A behavioural reinterpretation of an owner-configured setting belongs in the plan's recorded-deviation Notes, as the additive-jitter deviation already is.
- **Impact**: `max_throttle_wait_seconds=300` no longer means what the owner configured, and what it does mean varies with `requests_per_minute`. A low-`rpm` tier fails instruments after less throttling than budgeted. The failure direction is safe — early termination, never an unbounded loop — which is why this is MEDIUM and does not block.
- **Required remediation**: either record it as a deviation in the task plan's Notes and restate `README.md:309-310`, flagging §2.2/§2.5 for the next design revision; or restore cumulative-wait accounting and bound the zero-delay case another way. Documentation alone discharges it; Doc Sync can carry the README half.

### IR-002 — The TDD evidence's mutation baseline, file digest and aggregate totals still describe superseded code

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v4 IR-003; not attempted, and now one suite further out of date)
- **Acceptance criteria**: N/A (evidence quality)
- **Tasks**: T010
- **Files**: `…/CAP-001-E3-S4-tdd-evidence.yaml:9-25` (header, `manual_mutations_baseline_commit`), `:166-191` (`post_mutation_verification`), `:205-247` (`review_v3_rework`, `review_v4_rework`)
- **Claim challenged**: the file's assertion that every mutation was applied to and reverted from a `rate_limit.py` whose SHA-256 is `15d9aabb…`, at baseline `58052fd`.
- **Observed evidence**: the delivered `rate_limit.py` hashes to `4df3f801…` and the change is still uncommitted, so neither the recorded SHA nor `manual_mutations_baseline_commit: 58052fd` identifies the reviewed code. The eight mutation results are stated against a 23-test suite; the suite is now **25** tests, so every recorded pass count is wrong by two — at v4 I re-ran recorded mutation-6 and measured 2 failed / 22 passed against the recorded 2 failed / 21 passed, and the same run today would report 23 passed. `post_mutation_verification.result` still records 289 / 230+59 / 95 while the measured values are 308 / 249+59 / 96. The file now carries **three** mutually inconsistent sets of totals: `post_mutation_verification` (289/230/95), `review_v3_rework.validation` (307/248/96) and `review_v4_rework.validation` (308/249/96). No mutation record covers the elapsed-time throttle budget introduced at the v3 rework.
- **Expected evidence/behavior**: T010 requires recorded manual mutations, and the plan's story-specific validation requires recording "test execution, commit hash, and manual mutation results". A commit hash and digest pointing at superseded code invite a downstream reader to trust a stale kill set.
- **Impact**: the artifact that exists to prove regression sensitivity no longer identifies the code it was measured against. The substance survives — the `review_v4_rework.mutation_evidence` claim is accurate, my Probe A reproduces its stated failure exactly, and I re-killed recorded mutation-6 at v4 — but a release-readiness reader cannot confirm that without redoing the work.
- **Required remediation**: re-base the header, `manual_mutations_baseline_commit` and the SHA-256 onto the commit that lands this rework; refresh the eight recorded counts to the 25-test suite; collapse or reconcile the three totals blocks; and add one mutation for the elapsed-time throttle budget.

### IR-003 — `except BaseException` hands `KeyboardInterrupt` and `SystemExit` to the caller's classifier

- **Severity**: MEDIUM
- **Status**: OPEN (carried unchanged from v4 IR-004, v3 IR-002, v2 IR-001, v1 IR-006; not attempted)
- **Acceptance criteria**: N/A (robustness; touches design §9's cancellation expectation)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:148-149`
- **Claim challenged**: that routing every raised exception through `classify` is safe for the cancellation path.
- **Observed evidence**: the catch is still `except BaseException`, byte-identical across four reviews. `is_fatal_for_governor` is typed for `MassiveError` inputs, so a caller's classifier needs its own fallback; a fallback of `RETRYABLE` or `THROTTLED` would make the governor sleep and retry on a Ctrl-C. No test covers either exception type.
- **Expected evidence/behavior**: the `Callable[[BaseException], Outcome]` signature is design-mandated, so catching broadly conforms; design §9 nonetheless expects a cancellation request to take effect.
- **Impact**: an owner interrupting a long run could see it sleep through the signal, for up to a 120s boundary wait, depending on how CAP-001-E3-S1 writes its classifier.
- **Required remediation**: re-raise `KeyboardInterrupt` and `SystemExit` before classification, or document the contract and assert it in a test. Suitable for CAP-001-E3-S1's wiring story; already documented in `README.md` as a known limitation.

### IR-004 — The throttle budget remains a soft bound: one full wait is always slept before the budget is checked

- **Severity**: LOW
- **Status**: OPEN (carried from v4 IR-005, v3 IR-005; not attempted)
- **Acceptance criteria**: DAC-E3-9 (SATISFIED), DAC-E3-S4-6 (SATISFIED)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:157-165`
- **Observed evidence**: unchanged. The budget is checked after the sleep, so the final wait is always slept and then abandoned — visible in `test_boundary_throttle_wait_exhausts_the_budget_and_raises`, which sleeps 120s against a 90s budget. Design §2.2's flowchart places the sleep before the budget check, so this conforms to the approved design.
- **Expected evidence/behavior**: none violated.
- **Impact**: up to one maximum wait (≤120s on the boundary path) of dead time per exhausted instrument.
- **Required remediation**: for the next design revision — check the budget before sleeping, or state that the bound is soft. No code change required to pass this gate.

### IR-005 — Backoff cap is `initial × 2**(attempts-1)`, one doubling below the design's literal wording

- **Severity**: LOW
- **Status**: OPEN (carried from v4 IR-006, v3 IR-006, v2 IR-005, v1 IR-008; deliberately not attempted)
- **Acceptance criteria**: DAC-E3-8 (SATISFIED)
- **Tasks**: T008
- **Files**: `src/factorflow/ingestion/rate_limit.py:241-246`, `tests/unit/test_governor_backoff.py:49-66`
- **Observed evidence**: unchanged. The cap on the first retry is `initial × 2**0 = initial`, while design §2.5 row 3 and the story's outcome table read "initial delay times two to the power of attempts".
- **Expected evidence/behavior**: the implementation is the conventional reading and the bound holds; only the wording differs.
- **Impact**: none operationally.
- **Required remediation**: record the interpretation for the next design revision. Already documented in `README.md`.

### IR-006 — The test wall clock never advances during throttle sleeps

- **Severity**: LOW
- **Status**: OPEN (carried from v4 IR-007, v3 IR-007, v2 IR-006; not attempted)
- **Acceptance criteria**: N/A (test fidelity)
- **Tasks**: T003
- **Files**: `tests/unit/governor_fakes.py:31-42`, `tests/unit/test_governor_retry.py:46-52`
- **Observed evidence**: unchanged. `FakeSleeper` advances only the `FakeClock` bound to `monotonic`; the injected `now` source is a separate, never-advanced `FakeClock` (`:51`), so across a multi-wait throttle sequence every boundary computation sees the same remainder.
- **Expected evidence/behavior**: in production, sleeping past a boundary moves the wall clock, so the second boundary wait is computed from a new phase.
- **Impact**: small. Freezing the wall clock is a legitimate isolation choice for the jitter test, and the phase computation is pinned elsewhere; the composition of the two is what is missing.
- **Required remediation**: optionally bind the sleeper to both clocks, or add one test that advances the wall clock between two throttles and pins the two distinct boundary waits.

### IR-007 — `GovernorSettings` still has no construction-time validation

- **Severity**: LOW
- **Status**: OPEN (carried from v4 IR-008, v3 IR-009, v2 IR-008; not attempted)
- **Acceptance criteria**: N/A
- **Tasks**: T007
- **Files**: `src/factorflow/ingestion/rate_limit.py:54-64`, `:110-111`, `:198-199`
- **Observed evidence**: unchanged. `GovernorSettings(requests_per_minute=0, …)` constructs successfully and then raises `ZeroDivisionError` inside `_acquire_permit`.
- **Expected evidence/behavior**: no rule requires it; the intended path flows through `from_massive_settings`, where `Field(ge=1)` enforces positivity.
- **Impact**: a direct literal construction — which only the tests do today — fails late and obscurely.
- **Required remediation**: optionally add a `__post_init__` guard. Already documented in `README.md`.

### IR-008 — `README.md`'s governor section describes superseded behavior, and this rework added a fourth stale entry

- **Severity**: LOW
- **Status**: OPEN (carried from v4 IR-009; widened by this rework; Doc Sync scope)
- **Acceptance criteria**: N/A (documentation accuracy)
- **Tasks**: N/A
- **Files**: `README.md:309-310`, `:330-340`, `:378-383`
- **Claim challenged**: that the documented governor contract matches the delivered governor.
- **Observed evidence**: `README.md` is untouched by both the v3 and v4 reworks (`git diff -- README.md` empty). It still states that `max_throttle_wait_seconds` "bounds the cumulative wait across `THROTTLED` retries" (superseded, IR-001); still names the deleted test `test_no_virtual_minute_window_exceeds_the_configured_budget` at `:335` and presents its 2× bound as an item "**needing an owner decision**", although DEC-0002 and governor v8 settled it and this rework added the strict post-drawdown assertion that discharges it; still lists the settings-test environment-isolation gap as open, although `test_governor_settings.py:55-57` closed it two reworks ago; and now also omits `test_refill_never_exceeds_bucket_capacity` and the capacity ceiling it pins, so the README understates the pacing guarantees the code actually carries.
- **Expected evidence/behavior**: the README known-limitations list is the durable record of this story's open items for a non-SDD reader; four of its entries are now wrong.
- **Impact**: low and downstream, but it is the only place the governor's contract is described outside the SDD tree, and it now records two resolved items as open, one superseded semantic, and one missing guarantee.
- **Required remediation**: Doc Sync's first task on this story — refresh the four entries. No code change.

### IR-009 — The zero-delay boundedness test proves termination only for the `requests_per_minute=1` pacing case

- **Severity**: LOW
- **Status**: OPEN (carried from v4 IR-010; not attempted)
- **Acceptance criteria**: DAC-E3-S4-6 (SATISFIED)
- **Tasks**: T003
- **Files**: `tests/unit/test_governor_retry.py:252-270`
- **Observed evidence**: unchanged. The test uses `_governor(1, …)`, so the fake clock advances only because the capacity-1 bucket forces a 60s permit wait on the second iteration; the throttle sleeps are `0.0` and contribute nothing. Under a high `requests_per_minute` with the same fake clock no collaborator would advance time. Production safety rests on real `time.monotonic` advancing, which is sound but is not what the test demonstrates.
- **Expected evidence/behavior**: the plan's story-specific validation asks to demonstrate bounded throttle behavior over virtual time; the demonstration is narrower than the claim.
- **Impact**: minimal — v4's Probe 1 confirmed the test is regression-sensitive to exactly the defect it was written for. It proves less than its name suggests.
- **Required remediation**: optionally add a higher-`rpm` case with an explicit `clock.advance` in the classifier, or a one-line docstring naming the mechanism that terminates the loop.

### IR-010 — Governor v8's DEC-0002 citation does not resolve inside the project repository, and three review artifacts remain untracked

- **Severity**: LOW
- **Status**: OPEN (carried from v4 IR-011; not attempted)
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: N/A (governance bookkeeping)
- **Files**: `…/design/component-design-rate-limit-governor.md:364-368`; `…/specifications-review-report-v4.md`, `…/specifications-review-report-v5.md`, `…/CAP-001-E3-S4-implementation-review-v4.md` (all untracked)
- **Observed evidence**: the AC-1 amendment note still directs readers to `docs/decision-records.md`, which does not exist in `FactorFlow-v2`; DEC-0002 lives only at `projects/factorflow-v2/decisions/DEC-0002.md` in the harness repository. Spec review v5 raised this as its own MEDIUM FINDING-1 and it is unresolved. Governor v8's `approval.review_artifact` cites `specifications-review-report-v5.md`, still untracked, and v4's implementation review — the gate report this rework answers — is untracked too. The approval itself remains sound: `artifact-gate.py revision` returns `sha256:21e573a3…`, equal to v8's recorded `reviewed_revision`.
- **Expected evidence/behavior**: an approved artifact's normative decision and review evidence should be resolvable from the repository that carries the artifact.
- **Impact**: nothing blocks the story; the risk is that the amendment's provenance and this story's review chain become unverifiable if the working tree is committed without all three reports.
- **Required remediation**: commit all three reports with the rework, and either correct the DEC-0002 citation or mirror the decision into a governed project artifact. Owner/spec-review scope.

### IR-011 — The strengthened window test's docstring now argues against the assertion directly beneath it

- **Severity**: LOW
- **Status**: OPEN (new in v5; introduced by this rework)
- **Acceptance criteria**: AC-4 (SATISFIED)
- **Tasks**: T002
- **Files**: `tests/unit/test_governor_pacing.py:68-78`; `…/CAP-001-E3-S4-tdd-evidence.yaml:193-203`
- **Claim challenged**: that the test's own documentation describes what it now asserts.
- **Observed evidence**: the docstring still reads "this asserts exactly that bound rather than the stronger, and for a continuously-refilling bucket false, claim that a bare `capacity` is never exceeded in any sliding window" — while `:96-97`, added by this rework, asserts precisely that stronger claim for every window at `t >= 60`. The docstring's parenthetical "and for a continuously-refilling bucket false" is also now misleading: the claim is false only for windows overlapping the initial full bucket, which is why the new assertion is correctly gated on `t >= 60.0`. Separately, the TDD evidence's `known_limitations` entry retains the id `pacing-window-bound-tolerates-2x-budget` and describes the resolution as the 2× bound alone, mentioning neither the post-drawdown assertion nor `test_refill_never_exceeds_bucket_capacity` — the two assertions that actually discharge T002.
- **Expected evidence/behavior**: a test docstring is the first thing a maintainer reads before changing an assertion; one that argues the opposite of the code invites the assertion's removal as "incorrect".
- **Impact**: low but self-inflicted — the most likely way v4 IR-001 gets reintroduced is a future reader trusting this docstring and deleting `:96-97`.
- **Required remediation**: rewrite the docstring's final sentence to describe the two-regime bound the test now enforces, and refresh the `known_limitations` entry's id and description to name both new assertions.

### IR-012 — The task plan's `artifact_version` stayed at `2` across a second material amendment

- **Severity**: LOW
- **Status**: OPEN (new in v5)
- **Acceptance criteria**: N/A (traceability)
- **Tasks**: N/A (plan bookkeeping)
- **Files**: `…/CAP-001-E3-S4-tasks.md:5`, `:11`, `:75`
- **Claim challenged**: that `artifact_version` identifies the plan's content.
- **Observed evidence**: at the v4 review the plan was `artifact_version: 2` with `last_reworked_review: …-v3.md` and a T002 line naming three bounds. It is now `artifact_version: 2` with `last_reworked_review: …-v4.md` and a T002 line naming four ("refill never accumulates above bucket capacity" was inserted). Two materially different plan texts therefore share one version number, and this report's `ai_provenance.source_artifacts` can only record `version: "2"` for a document different from the one v4 recorded under the same version. The `updated` date is unchanged at `2026-09-16` and the provenance timestamp moved only from `22:01:57Z` to `22:27:04Z`, so nothing but the diff distinguishes them.
- **Expected evidence/behavior**: `docs/artifact-contract.md` treats `artifact_version` as the identifier a reviewer and downstream artifact cite; two different contents under one version defeat that.
- **Impact**: low today because every review pins the working tree by digest, but the version-to-content mapping for this plan is now ambiguous in the record.
- **Required remediation**: bump the plan to `artifact_version: 3` when this rework is committed, and note in the frontmatter or Notes which review each amendment answered.

## Previous Review Disposition

Every finding from `CAP-001-E3-S4-implementation-review-v4.md`, each disposition
backed by evidence gathered at the reviewed state rather than by the rework's claims:

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v4/IR-001 — T002's two-part DEC-0002 bound only half-asserted; capacity-ceiling mutation survives (HIGH) | **RESOLVED** | Both halves are now asserted and both are load-bearing. `test_governor_pacing.py:96-97` adds `count_in_window <= capacity` for `t >= 60`, which Probe D shows executes for **25** windows at **zero slack** (every window exactly 3 of 3). `test_refill_never_exceeds_bucket_capacity` (`:105-119`) pins the ceiling: **Probe A**, the mutation that survived all 24 tests at v4, now **kills** it (1 failed, 24 passed), and **Probe B** (`capacity + 1.0`) kills it too, so the boundary is exact. T002's text was amended to name the refill ceiling. The rework's own recorded mutation evidence matches my Probe A failure mode and location exactly. |
| v4/IR-002 — throttle budget silently changed meaning to elapsed time (MEDIUM) | **STILL OPEN** | `rate_limit.py` byte-identical (`sha256:4df3f801…`); the task plan's Notes gained no deviation entry and `README.md:309-310` is untouched. Re-raised as v5 IR-001. |
| v4/IR-003 — TDD evidence baseline, digest and totals describe superseded code (MEDIUM) | **STILL OPEN, WIDENED** | `manual_mutations_baseline_commit: 58052fd`, SHA `15d9aabb…` and `post_mutation_verification.result` (289/230/95) all unchanged, while the delivered file is `4df3f801…` and the measured totals are 308/249/96. The mutation counts are now two tests stale (23-test basis versus a 25-test suite), and the new `review_v4_rework.validation` block makes three inconsistent totals in one file. Re-raised as v5 IR-002. |
| v4/IR-004 — `except BaseException` catches `KeyboardInterrupt`/`SystemExit` (MEDIUM) | **STILL OPEN** | `rate_limit.py:148-149` unchanged; no test for either type. Re-raised as v5 IR-003. |
| v4/IR-005 — throttle budget is a soft bound; one wait always slept (LOW) | **STILL OPEN** | `rate_limit.py:157-165` unchanged. Re-raised as v5 IR-004. |
| v4/IR-006 — backoff cap one doubling below the design's wording (LOW) | **STILL OPEN** | `rate_limit.py:241-246` unchanged. Re-raised as v5 IR-005. |
| v4/IR-007 — test wall clock never advances during throttle sleeps (LOW) | **STILL OPEN** | `governor_fakes.py` and `test_governor_retry.py:51` unchanged. Re-raised as v5 IR-006. |
| v4/IR-008 — `GovernorSettings` has no construction-time validation (LOW) | **STILL OPEN** | `rate_limit.py:54-64` still a bare frozen dataclass. Re-raised as v5 IR-007. |
| v4/IR-009 — `README.md` describes superseded behavior (LOW) | **STILL OPEN, WIDENED** | `git diff -- README.md` is empty. Its `:335` entry now names a test that no longer exists and calls settled the one question DEC-0002 answered, and it omits the new capacity guarantee entirely. Re-raised as v5 IR-008. |
| v4/IR-010 — zero-delay test proves termination only at `rpm=1` (LOW) | **STILL OPEN** | `tests/unit/test_governor_retry.py` unchanged since v4. Re-raised as v5 IR-009. |
| v4/IR-011 — DEC-0002 citation unresolvable; spec reviews untracked (LOW) | **STILL OPEN** | Design `:364-368` unchanged; both spec review reports and now v4's own report are untracked. Re-raised as v5 IR-010. |

One of v4's eleven findings is closed, and it is the only one that blocked the gate.
The ten carried findings are all MEDIUM or LOW and were all explicitly listed at v4
as non-blocking; the rework's decision to address only the HIGH is consistent with
v4's Follow-Up, though IR-001 and IR-002 were both named there as "worth folding into
the same pass" and were not.

## Scope and Plan Deviations

- **No scope leakage.** The rework touched exactly three files — the pacing test, the
  task plan's T002 line and frontmatter, and the TDD evidence — all of which trace
  directly to v4 IR-001's required remediation. `rate_limit.py` was correctly left
  alone: v4 IR-001 was diagnosed as a test gap and I confirmed at v4 that the strict
  post-drawdown bound already held against the implementation, so no production change
  was warranted and none was made. `src/factorflow/config/settings.py` remains
  untouched as T007 requires.
- **T002's text was amended a second time by the rework that implements it.** Adding
  "refill never accumulates above bucket capacity" is legitimate — it names the
  premise governor v8 AC-1 depends on and the new test asserts — but it is the second
  consecutive review cycle in which the plan text and its implementation moved
  together, which is why IR-012 asks for a version bump to keep the record legible.
- **`tests/unit/test_governor_settings.py` is still a file no task names.** Justified
  as v1 IR-003's direct remediation; T007's file list has now gone four reworks without
  naming it. Worth one line on the next plan touch.
- **The task plan's `status: draft` is not an inconsistency.** All four E3 sibling task
  files carry it and it is the template default. The story's `status: in-review` is
  correct for a story at this gate; Doc Sync will move it.
- **Three review artifacts remain untracked** and are part of the reviewed subject
  under skill constraint 6 — see IR-010. They must be committed for this story's gate
  chain and governor v8's approval evidence to be verifiable.
- **The design and specification-review chain re-verified.** Governor v8's
  `approval.reviewed_revision` still equals the digest `artifact-gate.py revision`
  computes, and spec review v5 remains READY with 0 CRITICAL and 0 HIGH. Nothing in
  this rework touched that chain.

## Follow-Up

- **Next agent**: **Doc Sync Agent**, with `CAP-001-E3-S4-tasks.md` and this report.
- **Required action for Doc Sync**: correct the four stale `README.md` entries
  (**IR-008**) and, in the same pass, restate `README.md:309-310` to describe the
  throttle budget the code actually implements (**IR-001**'s documentation half).
  Both are documentation-only and neither requires reopening the code.
- **Should be closed on the next touch of this story, not deferred indefinitely**:
  **IR-002** (re-base the TDD evidence's baseline, digest and counts, collapse the
  three totals blocks, add a mutation for the elapsed-time budget), **IR-011** (the
  contradictory docstring — the most likely route to reintroducing v4 IR-001), and
  **IR-012** (bump the plan's `artifact_version`).
- **Belongs to CAP-001-E3-S1's wiring story**: **IR-003** (`KeyboardInterrupt` /
  `SystemExit` handling), where the classifier that decides the outcome is written.
- **For the next design revision**: **IR-004** (soft throttle bound), **IR-005**
  (backoff wording), and the semantic half of **IR-001** if the owner prefers to keep
  the elapsed-time measure.
- **Needs the owner**: **IR-010**'s DEC-0002 citation, and the long-standing question
  of whether governor logging and structured exhaustion failures belong to CAP-001-E5
  (recorded at v2/IR-009, still unowned).
- **Warnings accepted downstream**: **IR-001** through **IR-012** — all MEDIUM or LOW,
  each with a named owner above. None blocks Doc Sync.
- **Before Doc Sync commits**: the rework is entirely uncommitted and `HEAD` is
  unchanged from v4, so this gate's evidence lives only in the working tree. Commit
  the rework together with this report and the three untracked review artifacts, and
  push the branch.
