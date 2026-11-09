---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
last_reworked_review: CAP-003-E8-S2-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-11-08T19:35:46Z
  source_artifacts:
    - id: CAP-003-E8-S2
      version: "1"
    - id: CAP-003-E8-S1
      version: "1"
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

# Tasks: CAP-003-E8-S2 — One Throttle Wait Budget per Stock, Checked Before Each Wait, and ProviderRateLimited

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S2.md`
**Component**: `FactorFlow-v2` (modules `rate-limit-governor`, `massive-client` errors; `acquisition-runner` outcome mapping exercised, not edited)
**Branch**: `usr/alvaro-de-jodra/CAP-003-E8-tasks`
**Date**: 2026-11-08

## Summary

Production showed Massive `429` rate-limit answers stored as `[unavailable] … failed 3 consecutive attempts` (F1). This story makes the governor's half of AC-30 ready: `src/factorflow/ingestion/massive/errors.py` gains `ProviderRateLimited(ProviderUnavailable)` with the design's docstring, its `_ERROR_KIND_BY_TYPE` row `rate_limited` (variable segment redacted then bounded, as delivered) and its `__all__` entry, and `src/factorflow/ingestion/massive/__init__.py` re-exports it. `src/factorflow/ingestion/rate_limit.py` gains one float of instance state, `self._throttle_spent`, set to zero at construction and by the new `start_throttle_budget()`; `execute`'s `THROTTLED` branch computes the delay as delivered, raises `ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc` without sleeping when `self._throttle_spent + delay > max_throttle_wait_seconds`, otherwise records `throttled_at = monotonic()` and sleeps, and the elapsed `monotonic() - throttled_at` is charged once the retried request holds its permit (rate-limit-governor CAP-003 §2.2, §2.3). The `RETRYABLE` bound, backoff, the `FATAL` re-raise, pacing and the stated-delay path are unchanged, and attempt exhaustion still raises plain `ProviderUnavailable`. Nothing calls `start_throttle_budget()` yet (CAP-003-E8-S3 adds `MassiveClient.start_instrument()`, CAP-003-E8-S4 the runner's per-stock call), so until they land the budget starts at construction and spans the cached client, the conservative reading of design §3; production behaviour is unchanged because a real `429` still reaches the governor as `RETRYABLE` until CAP-003-E8-S3. **Hard dependency: CAP-003-E8-S1 must be coded and merged first** — this plan extends the `_ERROR_KIND_BY_TYPE` table, `__all__` and re-exports that CAP-003-E8-S1 changes, and the six-kind test asserts S1's `ProviderNotEntitled` row (T001 checks it).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-30 | A rate limit is not an attempt; past one stock's wait budget it is recorded under its own reason | T002, T003, T006, T007, T008, T009, T010, T012, T013, T014, T015 |
| DAC-E8-4 | A spent budget composes `[rate_limited] … request_id=unavailable: <governor text>`, never `unavailable`, no credential; six kinds by exact class | T002, T004, T005, T013, T014 |
| DAC-E8-5 | `start_throttle_budget()` zeroes the spent wait; every throttle wait (sleep to permit) is charged across `execute` calls; checked before each wait; sleeps total at most the budget with jitter | T006, T008, T009, T012, T015 |
| DAC-E8-6 | `ProviderRateLimited` is a `ProviderUnavailable` with the fixed message, no `request_id`, `__cause__` the last exception; `THROTTLED` never an attempt; `RETRYABLE`, `FATAL`, pacing, backoff, stated delay unchanged | T004, T006, T007, T010, T011, T015, T016 |
| DAC-E8-8 | `classify_provider_error` records `ProviderRateLimited` as `failed` with the reason unreworded | T003, T013 |
| DAC-E8-S2-1 | Two delivered exhaustion tests take `[60.0]` and `[10.0, 10.0]` then `ProviderRateLimited`; zero stated delay unchanged (TC-COMP-235) | T006, T015 |
| DAC-E8-S2-2 | Always `THROTTLED` raises `ProviderRateLimited` (fixed message, `request_id` `None`, `__cause__` last exception); always `RETRYABLE` raises a plain `ProviderUnavailable` after `max_attempts` (TC-COMP-236) | T007, T015 |
| DAC-E8-S2-3 | One 300 s budget spans `execute` calls (180 s then two waits, raise on the third); `start_throttle_budget()` restarts it (TC-COMP-237) | T008, T015 |
| DAC-E8-S2-4 | With jitter `[0.999]` the sleeps total at most 300 s and the unslept next delay would cross it (TC-COMP-238) | T009, T015 |
| DAC-E8-S2-5 | Delivered throttle-no-attempt, retry-bound and backoff rows pass unchanged (TC-COMP-239) | T010, T016 |
| DAC-E8-S2-6 | Six kinds by exact class; `rate_limited` with `request_id=unavailable`; `[<kind>] ` prefix; unlisted subclass `TypeError`; no credential; subclass of `ProviderUnavailable` (TC-COMP-240) | T002, T004, T005, T013, T014 |
| DAC-E8-S2-7 | `classify_provider_error(ProviderRateLimited("x"), …)` returns `failed` with `reason` exactly `r` (TC-COMP-241) | T003, T013 |
| DAC-E8-S2-8 | The governor inspects no exception, imports `ProviderRateLimited` only to raise it, logs nothing new, no URL or credential, settings unchanged (TC-COMP-242) | T011, T015, T017 |

## Phase 1: Setup

**Purpose**: Confirm the hard producer, CAP-003-E8-S1, has landed and bind the exact names it left, before any test is written.

- [x] T001 Verify, without editing, that CAP-003-E8-S1 is merged on this branch, and record what later tasks depend on. If any of (a) to (d) is missing, STOP: the hard edge CAP-003-E8-S1 is unmet and this plan must not be coded yet. (a) `src/factorflow/ingestion/massive/errors.py` defines `ProviderNotEntitled(MassiveError)`, lists it in `__all__`, and `_ERROR_KIND_BY_TYPE` holds five rows including `ProviderNotEntitled: "not_entitled"`; `compose_failure_reason` returns the fixed `_NOT_ENTITLED_DESCRIPTION` for it. Record the exact wording S1 left in `compose_failure_reason`'s docstring line "Raises `TypeError` if `error` is not one of the four typed…" and its `TypeError` text "only the four typed MassiveError subclasses are accepted." (T013 brings the count to six, or leaves a count-free wording alone). (b) `src/factorflow/ingestion/massive/__init__.py` re-exports `ProviderNotEntitled`; record the docstring's count of re-exported `MassiveError` types ("the five `MassiveError` types" before S1). (c) `src/factorflow/ingestion/outcomes.py` `classify_provider_error` maps `ProviderNotEntitled` to `failed`, and `ProviderUnavailable` is still matched by `isinstance` (record the exact line, which T003's mutant targets). (d) Record the test names S1 added to `tests/unit/test_massive_failure_reasons.py`, `tests/unit/test_massive_error_classification.py` and `tests/unit/test_outcomes.py`, so T002, T003 and T004 add beside them without duplicating. Then run the story's focused command (Validation Plan) once and record it green as the baseline.

**Checkpoint**: S1's `ProviderNotEntitled` row, re-export and outcome mapping are present; the focused suite is green before any change.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define expected behavior from acceptance criteria. The story runs as **two TDD cycles** (see Other Notes): cycle 1 is T002–T005 (RED) then T013–T014 (GREEN); cycle 2 is T006–T012 (RED) then T015–T016 (GREEN). Write cycle 2's tests only after cycle 1 is GREEN and recorded (T018). Every new test carries a `# Implements CAP-003 TC-COMP-NNN` comment where it implements a mapped case, as the repository's later capabilities do (`tests/integration/test_api_classification_summary.py`); the bare `TC-COMP-235` labels already in these files are CAP-001's and are left as they are. In cycle 1, import `ProviderRateLimited` inside each new test function (the precedent `tests/unit/test_outcomes.py` already follows for `classify_provider_error`), so RED fails only the new tests and not the module's collection.

### Mandatory Component Tests — cycle 1
- [x] T002 [P] Implement TC-COMP-240 (Six kinds by exact class; ProviderRateLimited composes rate_limited without the credential) in `tests/unit/test_massive_failure_reasons.py`, cycle 1: (a) `test_each_of_the_six_kinds_composes_its_own_kind`, parametrised over the six classes with an expected literal per row — `InstrumentNotFound("x", provider_request_id="r1")` → starts `[not_found] symbol=AAPL data_type=reference request_id=r1: `, `CredentialRejected` → `[credential_rejected] `, `ProviderUnavailable` → `[unavailable] `, `ProviderContractViolation` → `[contract_violation] `, `ProviderNotEntitled("other text", provider_request_id="r5")` → `[not_entitled] … request_id=r5: the provider plan is not entitled to this data`, and `ProviderRateLimited("The provider kept rate-limiting requests until this stock's throttle wait budget was spent.")` → **exactly** `[rate_limited] symbol=AAPL data_type=reference request_id=unavailable: The provider kept rate-limiting requests until this stock's throttle wait budget was spent.`; every expected value is a hand-written literal, never another call to `compose_failure_reason`; assert the `ProviderRateLimited` reason does not start `[unavailable]`. (b) `test_rate_limited_reason_never_carries_the_credential`: `ProviderRateLimited(f"throttled near {_CREDENTIAL_FIXTURE}")` composed with `_redact_fixture` gives a reason without `_CREDENTIAL_FIXTURE` and containing `[redacted]` (proves the delivered redact-then-bound branch ran, CAP-001 AC-13). (c) `test_an_unlisted_subclass_of_a_listed_class_raises_type_error`: a local `class _UnlistedUnavailable(ProviderUnavailable)` and a local `class _UnlistedMassiveError(MassiveError)` each raise `TypeError` (the lookup is by exact class, so `ProviderRateLimited` never falls back to its parent). (d) `assert issubclass(ProviderRateLimited, ProviderUnavailable)` (step 4) — kills: swap-case on the `_ERROR_KIND_BY_TYPE` value `"rate_limited"` → `"unavailable"` in `errors.py` (the exact literal differs in its first bracket), and the hand-written row deletion in Other Notes (raises `TypeError` instead of composing)
- [x] T003 [P] Implement TC-COMP-241 (classify_provider_error records ProviderRateLimited as failed through the delivered branch) in `tests/unit/test_outcomes.py`, cycle 1: `test_provider_rate_limited_maps_to_failed_outcome` builds `r = "[rate_limited] symbol=KO data_type=reference request_id=unavailable: x"` as a literal, calls `classify_provider_error(ProviderRateLimited("x"), data_type="reference", reason=r)` and asserts `record.outcome == "failed"`, `record.data_type == "reference"` and `record.reason is r` (unreworded, the same object) — kills: the hand-written mutant dropping `ProviderUnavailable` from `classify_provider_error`'s `isinstance` tuple in `outcomes.py` (Other Notes), observed as `TypeError` instead of a `failed` record; no `outcomes.py` source change is planned, the subclass reaches `failed` through the delivered branch

### Additional Unit Tests — cycle 1
- [x] T004 [P] Add `test_provider_rate_limited_is_a_retryable_provider_unavailable` in `tests/unit/test_massive_error_classification.py` (story's "subclass row"; massive-client CAP-003 §7 *Fatal and subclass*), cycle 1: `issubclass(ProviderRateLimited, ProviderUnavailable)`, `issubclass(ProviderRateLimited, MassiveError)`, `"ProviderRateLimited" in factorflow.ingestion.massive.errors.__all__`, and `is_fatal_for_governor(ProviderRateLimited("x")) is False` (design §2.4: `is_fatal_for_governor` is unchanged and would treat it as retryable; the classifier never sees one) — kills: the hand-written base-class mutant `class ProviderRateLimited(ProviderUnavailable)` → `class ProviderRateLimited(MassiveError)` (observed as `issubclass` false and `is_fatal_for_governor` true)
- [x] T005 [P] Add `test_provider_rate_limited_is_identity_reexported_from_package` in `tests/unit/test_massive_package_boundary.py`, cycle 1: `"ProviderRateLimited" in massive_boundary.__all__` and `massive_boundary.ProviderRateLimited is factorflow.ingestion.massive.errors.ProviderRateLimited`; the delivered `test_every_public_export_is_product_owned` then covers it unchanged — kills: the hand-written mutant deleting `"ProviderRateLimited"` from `__init__.py`'s `__all__` (observed by the membership assertion)

### Mandatory Component Tests — cycle 2
- [x] T006 Implement TC-COMP-235 (The budget is checked before each wait in the two delivered exhaustion tests) in `tests/unit/test_governor_retry.py`, cycle 2: change only the two delivered tests' expectations, keeping their names and scenarios. `test_boundary_throttle_wait_exhausts_the_budget_and_raises`: pass `now=clock` to `_governor(...)` (one `FakeClock` as `monotonic` and `now`, DAC-E8-S2-1), `pytest.raises(ProviderRateLimited)`, and `sleeper.calls == [pytest.approx(60.0)]`; update its comment (the second 60 s wait would reach 120 s > 90 s and is not taken). `test_stated_delay_throttle_wait_exhausts_the_budget_and_raises`: pass `now=clock`, `pytest.raises(ProviderRateLimited)`, `sleeper.calls == [pytest.approx(10.0), pytest.approx(10.0)]`. Leave `test_zero_stated_delay_throttle_wait_is_bounded` byte-for-byte unchanged (it still expects `ProviderUnavailable`, which `ProviderRateLimited` is, and `send.calls == 2` because the retry's 60 s permit wait is charged, §2.3). Add `# Implements CAP-003 TC-COMP-235` above the three tests' section header comment, not inside the unchanged test body — kills: the hand-written check-after-wait mutant (Other Notes), observed as `[60.0, 60.0]` and `[10.0, 10.0, 10.0]`; and the zero-stated-delay row kills the hand-written "charge only the sleep" mutant (`self._throttle_spent += delay`), which never charges a zero delay and trips that test's `AssertionError` guard
- [x] T007 Implement TC-COMP-236 (Exhaustion raises ProviderRateLimited; a retry bound raises a plain ProviderUnavailable) in `tests/unit/test_governor_retry.py`, cycle 2. (a) `test_spent_budget_raises_provider_rate_limited_from_the_last_exception`: a local recording sender that raises a fresh `RuntimeError(f"attempt {n} failed")` each call and appends it to a list; `_governor(60, clock, sleeper, max_throttle_wait=90.0, jitter=SequenceJitter([0.0]), now=clock)`; a classifier returning `THROTTLED` that raises `AssertionError` once more than 20 sends were made (the delivered zero-delay test's guard, so a mutant that never charges the budget fails instead of looping). Assert `type(err) is ProviderRateLimited`, `isinstance(err, ProviderUnavailable)`, `err.provider_request_id is None`, `str(err) == "The provider kept rate-limiting requests until this stock's throttle wait budget was spent."` (literal), `err.__cause__ is raised[-1]` and `len(raised) == 2`. (b) `test_exhausted_attempts_raise_a_provider_unavailable_that_is_not_rate_limited`: `max_attempts=3`, always `RETRYABLE`; `send.calls == 3`, `type(err) is ProviderUnavailable`, `not isinstance(err, ProviderRateLimited)`, `str(err) == "The provider failed 3 consecutive attempts."`. The FATAL edge case is the delivered `test_fatal_outcome_reraises_immediately_without_wait_or_retry`, kept unchanged (T010) — kills: hand-written `raise ProviderRateLimited(...)` → `raise ProviderUnavailable(...)` in the `THROTTLED` branch (observed by `type(err) is`), the hand-written `from exc` removal (observed as `__cause__` not the last exception), and the hand-written swap that raises `ProviderRateLimited` on attempt exhaustion (observed by `not isinstance`)
- [x] T008 Implement TC-COMP-237 (One budget spans every execute between two starts) in `tests/unit/test_governor_retry.py`, cycle 2: `test_one_throttle_budget_spans_every_execute_until_the_next_start` with `_governor(60, clock, sleeper, max_throttle_wait=300.0, jitter=SequenceJitter([0.0]), now=clock)`. Call `governor.start_throttle_budget()`; `execute(FlakySender(fail_count=3), always THROTTLED)` returns `"ok"` and `sleeper.calls == [60.0] * 3`; a second `execute` with an always-failing sender and the 20-send guard raises `ProviderRateLimited`, after which `sleeper.calls == [60.0] * 5` and `sum(sleeper.calls) == pytest.approx(300.0)` (the 240 + 60 = 300 wait is taken: the check is `>`, not `>=`); `governor.start_throttle_budget()`; a third `execute(FlakySender(fail_count=1), …)` returns `"ok"` and `sleeper.calls[5:] == [60.0]` (verified against the design's `execute` in a scratch probe, Other Notes) — kills: off-by-one `>` → `>=` on `self._throttle_spent + delay > self._settings.max_throttle_wait_seconds` (observed as four sleeps totalling 240 s), drop-field-copy deleting `self._throttle_spent = 0.0` in `start_throttle_budget` (third `execute` raises instead of waiting), and the hand-written per-request reset of the spent total at the top of `execute` (second `execute` takes five waits)
- [x] T009 Implement TC-COMP-238 (Jitter never takes the sleeps past the budget) in `tests/unit/test_governor_retry.py`, cycle 2: `test_jittered_boundary_waits_never_take_the_sleeps_past_the_budget` with `max_throttle_wait=300.0`, `jitter=SequenceJitter([0.999])`, `now=clock`, rpm 60, always `THROTTLED` with the 20-send guard. After `ProviderRateLimited` is raised, compute the next delay independently of the governor from the literal formula `boundary = 60.0 - clock() % 60.0; next_delay = boundary + 0.999 * boundary` (never by calling `_boundary_wait_with_jitter`, which would also consume the jitter sequence), then assert `sum(sleeper.calls) <= 300.0` and `sum(sleeper.calls) + next_delay > 300.0`. The scratch probe gives four sleeps totalling about 240.12 s and a declined delay of about 119.70 s — kills: the hand-written check-after-wait mutant (the delivered order), observed as a sleep total above 300 s
- [x] T010 Implement TC-COMP-239 (Throttling costs no attempt and the retry and backoff rows pass unchanged) by running, without editing, `test_repeated_throttled_outcomes_do_not_consume_attempts`, `test_throttled_outcomes_do_not_share_the_retry_attempt_counter`, `test_retryable_outcome_increments_attempts_and_retries_with_backoff`, `test_retry_limit_exhausted_raises_and_no_fourth_send`, `test_fatal_outcome_reraises_immediately_without_wait_or_retry` in `tests/unit/test_governor_retry.py` and every test in `tests/unit/test_governor_backoff.py`, `tests/unit/test_governor_pacing.py` and `tests/unit/test_governor_settings.py`; confirm with `git diff` that none of their bodies changed. Add one `# Implements CAP-003 TC-COMP-239` comment above the `TC-COMP-200 / DAC-E3-6` section header; no test body changes. These pass before and after cycle 2 (regression guard, no RED expected) — kills: off-by-one on `attempts >= self._settings.max_attempts` (observed as `send.calls == 4` in the retry-limit row), and the hand-written mutant adding `attempts += 1` to the `THROTTLED` branch (observed as `ProviderUnavailable` in the two throttle-no-attempt rows)
- [x] T011 Implement TC-COMP-242 (The governor still inspects no exception, logs nothing new and keeps its settings) in `tests/unit/test_governor_retry.py`, cycle 2: `test_governor_inspects_no_exception_and_logs_nothing` parses `src/factorflow/ingestion/rate_limit.py` (path from `factorflow.ingestion.rate_limit.__file__`) with `ast` and asserts: the module's only `ExceptHandler` catches `BaseException`; no `Call` to `isinstance`, `issubclass` or `type`; the `ImportFrom` of `factorflow.ingestion.massive.errors` names exactly `{"ProviderRateLimited", "ProviderUnavailable"}`; every `Name` node `ProviderRateLimited` outside that import sits in the `exc` of an `ast.Raise`; no `import logging` and no `getLogger` call; no string constant contains `://`, `api_key` or `Bearer`; and `[f.name for f in dataclasses.fields(GovernorSettings)] == ["requests_per_minute", "max_attempts", "initial_backoff_seconds", "max_throttle_wait_seconds"]` (literal). `from_massive_settings` stays proven by the delivered `tests/unit/test_governor_settings.py` (T010) and by the T017 diff review. Checked against the code T015 describes: its docstrings name `ProviderRateLimited` only as text, never as a `Name` node, and contain no URL — kills: the hand-written mutant `if outcome is Outcome.FATAL or isinstance(exc, ProviderRateLimited):` (observed as an `isinstance` call and a `ProviderRateLimited` name outside a `raise`)

### Additional Unit Tests — cycle 2
- [x] T012 Add `test_retryable_backoff_and_its_permit_wait_are_not_charged_to_the_throttle_budget` in `tests/unit/test_governor_retry.py`, cycle 2 (design §2.3 last paragraph; DAC-E8-5 "measured from the start of the throttle sleep to the moment the retried request holds its permit"): `_governor(60, clock, sleeper, max_throttle_wait=120.0, initial_backoff=2.0, jitter=SequenceJitter([0.0, 0.5]), now=clock)`; a first `execute` with `FlakySender(fail_count=2)` whose classifier returns `THROTTLED` for send 1 and `RETRYABLE` for send 2 returns `"ok"`; a second `execute`, always `THROTTLED` with the 20-send guard, raises `ProviderRateLimited`; assert `sleeper.calls == [pytest.approx(60.0), pytest.approx(1.0), pytest.approx(59.0)]` (60 s throttle charged; 1.0 s backoff not charged; at 61 s the next boundary wait is 59 s and 60 + 59 = 119 ≤ 120 is taken; the following 90 s wait is declined; verified in the scratch probe) — kills: the hand-written mutant deleting `throttled_at = None` after the charge (the retry's permit re-charges 61 s, so the second `execute` raises with no sleep: `[60.0, 1.0]`) and the hand-written mutant charging the backoff sleep

**Checkpoint**: Cycle 1's tests fail for the missing `ProviderRateLimited` and nothing else; cycle 2's T006–T009, T011 and T012 fail against the delivered per-request, check-after-wait governor, and T010 passes throughout.

---

## Phase 3: Core Implementation

**Purpose**: Add the error type and kind, then the per-stock budget checked before each wait.

- [x] T013 Add `ProviderRateLimited` to `src/factorflow/ingestion/massive/errors.py`, cycle 1: the class `ProviderRateLimited(ProviderUnavailable)` directly after `ProviderUnavailable`, with the docstring of massive-client CAP-003 §2.4 (raised by the rate-limit governor when the provider keeps throttling past the stock's throttle wait budget, AC-30; a `ProviderUnavailable`, so every delivered `except ProviderUnavailable` still catches it; never built from a response, so it never carries a provider `request_id`); the `_ERROR_KIND_BY_TYPE` row `ProviderRateLimited: "rate_limited"` after S1's `not_entitled` row; `"ProviderRateLimited"` in `__all__` beside `ProviderUnavailable`. `compose_failure_reason`'s body is unchanged — the default branch already gives `_bound_variable_text(redact(str(error)))`, "redacted then bounded, as delivered" — but bring the count in its docstring ("one of the four typed `MassiveError` subclasses") and its `TypeError` text to six, or leave them if T001 found a count-free wording. `is_fatal_for_governor` is unchanged (depends on T001)
- [x] T014 Re-export `ProviderRateLimited` from `src/factorflow/ingestion/massive/__init__.py`, cycle 1: add it to the `from factorflow.ingestion.massive.errors import (...)` list and `__all__` in their existing sorted order, and bring the module docstring's count of re-exported `MassiveError` types up by one from the value T001 recorded (depends on T013)
- [x] T015 Implement the per-stock throttle budget in `src/factorflow/ingestion/rate_limit.py`, cycle 2, following rate-limit-governor CAP-003 §2.2 and §2.3: (a) import `ProviderRateLimited` beside `ProviderUnavailable` from `factorflow.ingestion.massive.errors`; (b) module constant `_THROTTLE_BUDGET_SPENT_MESSAGE = "The provider kept rate-limiting requests until this stock's throttle wait budget was spent."` beside `_SECONDS_PER_MINUTE`; (c) in `__init__`, `self._throttle_spent = 0.0` with the design's comment (seconds of throttle wait charged to the current stock); (d) new public `start_throttle_budget(self) -> None` setting it to `0.0`, docstring per §2.2 (starts a new stock's throttle wait budget, CAP-003 system design §3.6 note 3; spent across every `execute` call until the next call, never per request); (e) in `execute`, replace `throttle_wait_started_at` with `throttled_at: float | None = None`; after `self._acquire_permit()`, when `throttled_at is not None`, add `self._monotonic() - throttled_at` to `self._throttle_spent` and reset `throttled_at = None`; in the `THROTTLED` branch compute `delay = self._throttle_delay(exc, stated_delay_seconds)`, then `if self._throttle_spent + delay > self._settings.max_throttle_wait_seconds: raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc`, else `throttled_at = self._monotonic()`, `self._sleep(delay)`, `continue`. Keep the delivered `RETRYABLE` branch, its comment, its message and backoff byte-for-byte; keep `_acquire_permit`, `_throttle_delay`, `_boundary_wait_with_jitter`, `_seconds_to_next_boundary`, `_backoff_delay`, `Outcome`, `GovernorSettings` and `from_massive_settings` untouched. (f) Docstrings: `execute`'s "Raises" paragraph says it raises `ProviderUnavailable` when attempts are exhausted and `ProviderRateLimited`, a `ProviderUnavailable`, when a throttle wait would take the stock's spent throttle wait past the budget; the module docstring's last paragraph says the governor raises `ProviderUnavailable` on exhausted attempts and its subclass `ProviderRateLimited` when the per-stock throttle wait budget is spent, and that `ProviderRateLimited` is imported only to be raised; add `CAP-003-E8-S2` and rate-limit-governor CAP-003 §2.2–2.3 to its design and story references. No logging, no new setting (depends on T013)

**Checkpoint**: Cycle 1 GREEN after T013–T014; after T015 every cycle 2 test passes except the delivered patched `429` test T016 adapts.

---

## Phase 4: Integration

**Purpose**: Keep the delivered client-side suite green until CAP-003-E8-S3 replaces its patched `429` test. No production caller of `start_throttle_budget()` is added here (CAP-003-E8-S3, CAP-003-E8-S4).

- [x] T016 In `tests/unit/test_massive_retry.py`, cycle 2, change only the `_governor()` helper's `max_throttle_wait_seconds=1.0` to `max_throttle_wait_seconds=300.0`, with a one-line comment that the budget is now checked before each wait and is the production default (`FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS`); no test body changes. Reason: the delivered `test_rate_limited_responses_are_paced_without_consuming_attempts` (TC-INT-025, patched `RESTClient` raising `BadResponse` for a `429`, classified `THROTTLED`) passes a no-op `sleep` and the real `time.time` as `now`, so its first boundary wait (up to 120 s) exceeds a 1.0 s budget the moment the check moves before the wait; a scratch probe running the delivered suite against the design's `execute` fails exactly this test beside the two T006 expectations. **Owner confirmed 2026-11-08** (Open Gaps 1). The helper's other user, `test_timeouts_and_server_errors_retry_to_the_attempt_limit` (TC-INT-026), never throttles and is unaffected (depends on T015)

**Checkpoint**: The focused command for cycle 2 is green, including every delivered `tests/unit/test_massive_*.py` row.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [x] T017 Run the Validation Plan's full commands once on the final bytes, the per-cycle mutation run on each cycle's focused command, and the DAC-E8-S2-8 review: `git diff` of the story's change to `src/factorflow/ingestion/rate_limit.py` shows no hunk inside `GovernorSettings` or `from_massive_settings`, no `logging` import and no new message other than `_THROTTLE_BUDGET_SPENT_MESSAGE`; `grep -n "start_throttle_budget" src` shows only its definition (no caller yet, by design); `uv run mypy src` accepts `self._throttle_spent: float` and `throttled_at: float | None` (traces to DAC-E8-S2-8 and every AC above)
- [x] T018 After each TDD cycle in T002–T016 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E8-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). This story is coded attended with **one commit for the whole story**, which carries both cycles and this evidence file, so both entries record `commit_hash: stage`, naming that story commit; no per-cycle commit is planned. The two cycles are listed in Other Notes

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E8-S1 | hard | Existing graph edge. `errors.py`'s `ProviderNotEntitled`, its `not_entitled` row in `_ERROR_KIND_BY_TYPE`, `__all__`, the `__init__.py` re-export and the `outcomes.py` mapping are S1's; T002's six-kind test asserts S1's row and T013–T014 extend the table and lists S1 leaves |
| CAP-003-E8-S3 | reverse | Consumes this story: `MassiveClient.start_instrument()` calls `start_throttle_budget()`, its real-transport rows expect `ProviderRateLimited`, and it replaces the patched TC-INT-025 test whose `_governor()` helper T016 edits (its plan should expect the helper at 300.0) |
| CAP-003-E8-S4 | reverse | Consumes this story: the runner's per-stock `start_instrument()` call starts this budget, and its rows record `ProviderRateLimited` as `[rate_limited]` through the outcome mapping T003 pins |

### Task Dependencies
- T001: none; blocks everything (hard edge CAP-003-E8-S1)
- T002, T003, T004, T005: depend on T001; parallel (four files)
- T013: depends on T002–T005 being RED
- T014: depends on T013
- T018 (cycle 1 entry): after T013–T014 are GREEN, before T006 starts
- T006 → T007 → T008 → T009 → T010 → T011 → T012: sequential (one file, `tests/unit/test_governor_retry.py`); depend on cycle 1 recorded
- T015: depends on T006–T009, T011 and T012 being RED (T010 stays green)
- T016: depends on T015
- T018 (cycle 2 entry): after T015–T016 are GREEN
- T017: depends on T016; runs on the final bytes before the story commit
- T018: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2, cycle 1: T002, T003, T004, T005 (four different test files)
- Cycle 2's tests share one file and are written in sequence; cycles never overlap

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv build`
- Test: `uv run pytest` (or `uv run pytest -m 'not postgres'` when no container runtime is available, reported as an exclusion)
- Focused tests, per phase: cycle 1 — `uv run pytest tests/unit/test_massive_failure_reasons.py tests/unit/test_massive_error_classification.py tests/unit/test_massive_package_boundary.py tests/unit/test_outcomes.py`; cycle 2 — `uv run pytest tests/unit/test_governor_retry.py tests/unit/test_governor_backoff.py tests/unit/test_governor_pacing.py tests/unit/test_governor_settings.py tests/unit/test_massive_retry.py tests/unit/test_massive_client_governor_integration.py`; whole story (T001 baseline and before hand-off) — both lists in one `uv run pytest` call. Each is run at its checkpoint and passed as the mutation runner's `--command`; the full test command runs once, on the final bytes. In this clone, which has no `.venv`, the same paths run as `PYTHONPATH=<repo> /Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python -m pytest <paths>`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- DAC-E8-4 / DAC-E8-S2-6: T002's literal `[rate_limited] symbol=AAPL data_type=reference request_id=unavailable: The provider kept rate-limiting requests until this stock's throttle wait budget was spent.` passes; `_ERROR_KIND_BY_TYPE` has exactly six rows (read the dict after T013)
- DAC-E8-5 / DAC-E8-S2-3, S2-4: T008's sleeps are `[60.0] * 5` totalling 300.0 before the raise and one 60 s wait after `start_throttle_budget()`; T009's sum is ≤ 300 and sum plus the declined delay is > 300
- DAC-E8-6 / DAC-E8-S2-1, S2-2, S2-5: T006's two changed expectations and the unchanged zero-stated-delay row pass; T007's `type(err) is` checks pass; `git diff` shows the T010 rows' bodies untouched
- DAC-E8-8 / DAC-E8-S2-7: T003 passes with no change to `src/factorflow/ingestion/outcomes.py` in this story's diff
- DAC-E8-S2-8: T011 passes and T017's diff review finds no hunk in `GovernorSettings` or `from_massive_settings` and no logging
- Production unchanged: `grep -rn "start_throttle_budget" src` lists only the definition; `src/factorflow/ingestion/massive/client.py` is not in the diff

---

## Notes

### Resolved Conflicts

1. **How many delivered budget tests change.** Rate-limit-governor CAP-003 §2.1's file table says "three delivered budget tests take the new expectations"; the same design's §7 table, the story's DAC-E8-S2-1 and TC-COMP-235 say two change and `test_zero_stated_delay_throttle_wait_is_bounded` passes unchanged. Story ACs outrank design prose (constraint 9 ladder, step 1), and the design's own §7 agrees: T006 changes two. The §2.1 wording should read "two" at the design's next revision.
2. **"Every row passing one `FakeClock` as both `monotonic` and `now`" against the delivered helper.** `_governor()` in `tests/unit/test_governor_retry.py` defaults `now` to a fresh, never-advanced `FakeClock`, and `test_successive_boundary_throttle_waits_receive_independent_jitter` depends on that fixed phase (its 108.0 s second wait). DAC-E8-S2-1 excepts "the delivered rows that pin a fixed wall-clock phase", and DAC-E8-S2-5 / TC-COMP-239 require the delivered rows to pass unchanged, so the helper's default is left alone and every row this story adds or changes (T006–T009, T012) passes `now=clock` explicitly. Changing the default would alter a delivered row's expectation.
3. **The design snippet drops delivered comments.** §2.2's illustrative `execute` omits the delivered `RETRYABLE`-branch comment and docstring paragraphs. Snippets are illustrative (step 1): T015 keeps the delivered branch byte-for-byte and edits only the `THROTTLED` path, `__init__` and docstrings.
4. **Stale counts in delivered text.** `compose_failure_reason`'s docstring and `TypeError` text say "four typed" subclasses and the package docstring counts five `MassiveError` types; after this story the table holds six and the package re-exports one more. These are documentation of the table's size, not contracts: T013–T014 update the counts relative to what CAP-003-E8-S1 left (T001 records it).

### Open Gaps

1. **The delivered patched `429` test breaks under this story, and no artifact assigns its adaptation here.** `tests/unit/test_massive_retry.py::test_rate_limited_responses_are_paced_without_consuming_attempts` (TC-INT-025) builds its governor with `max_throttle_wait_seconds=1.0`, a no-op `sleep` and the real `time.time` as `now`. Under the delivered check-after-wait the measured elapsed time stayed near zero, so four throttles passed; with the check before the wait, the first boundary wait (60 s minus the wall-clock remainder, plus additive jitter, so up to 120 s) exceeds 1.0 s and the test raises `ProviderRateLimited`. Verified: a scratch probe running the delivered suite against the design's §2.2 `execute` failed exactly this test plus the two T006 expectations. CAP-003-E8-S3 replaces the test with real-transport rows, but the story commit for CAP-003-E8-S2 must leave the suite green. **Plan adopts (T016): raise that helper's budget from 1.0 to 300.0.** Derivation: with a no-op `sleep` the charged elapsed time stays at microseconds, and each computed delay is below 120 s, so any budget of at least 120 s passes deterministically; 300.0 is the production default `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS`, so the fixture reads as production. The alternative, leaving the test red until CAP-003-E8-S3, breaks the releasable-state rule the backlog's sequencing relies on. **Owner confirmed 2026-11-08: raise to 300 s**. For the next revision of `component-design-rate-limit-governor.md` §2.1 (or `component-design-massive-client.md` §2.1): list `tests/unit/test_massive_retry.py`'s `_governor()` helper among the files the governor change touches.

### Other Notes

- **TDD cycles.** Cycle 1, the error type and kind: tests T002–T005, production T013–T014 (`errors.py`, `__init__.py`); RED is the missing `ProviderRateLimited` import in the four new tests. Cycle 2, the per-stock budget: tests T006–T012, production T015 (`rate_limit.py`) and the fixture adaptation T016; RED is T006–T009, T011 and T012 failing against the delivered per-request, check-after-wait governor (T010 is a regression guard and stays green). Both cycles change behaviour, so both carry a `mutation:` block; both record `commit_hash: stage`, naming the single story commit.
- **Scratch verification.** Every expected sleep sequence in T006–T009 and T012 was computed by running the planned scenarios against the design's §2.2 `execute` monkeypatched onto the delivered governor in a scratch directory outside the repository (no repository file was changed): T008 `[60.0] * 5` then `[60.0]`; T009 four sleeps totalling about 240.12 s with a declined delay of about 119.70 s; T012 `[60.0, 1.0, 59.0]`; T007 raises after two sends with `__cause__` the second send's exception.
- **The 20-send guard.** T007, T008, T009 and T012's always-throttled classifiers raise `AssertionError` once more than 20 sends were made, the delivered zero-delay test's pattern. The real code raises within six sends in every row; a mutant that stops charging the budget would otherwise loop forever. Pass `--timeout` to `mutation-run.py run` as a backstop.
- **Hand-written mutants** (add to each cycle's mutation run beside the generated ones):
  - Cycle 1:
    - `src/factorflow/ingestion/massive/errors.py`: `    ProviderRateLimited: "rate_limited",` → (line deleted) — killed by T002 (`TypeError`)
    - `src/factorflow/ingestion/massive/errors.py`: `ProviderRateLimited: "rate_limited"` → `ProviderRateLimited: "unavailable"` — killed by T002's literal
    - `src/factorflow/ingestion/massive/errors.py`: `class ProviderRateLimited(ProviderUnavailable):` → `class ProviderRateLimited(MassiveError):` — killed by T002 (d), T004
    - `src/factorflow/ingestion/massive/__init__.py`: `    "ProviderRateLimited",` → (line deleted from `__all__`) — killed by T005
    - `src/factorflow/ingestion/outcomes.py`: `ProviderUnavailable` removed from `classify_provider_error`'s `isinstance` tuple (the line T001 recorded) — killed by T003
  - Cycle 2:
    - `src/factorflow/ingestion/rate_limit.py`: the budget check moved after `self._sleep(delay)` (check-after-wait) — killed by T006, T009
    - `src/factorflow/ingestion/rate_limit.py`: `raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc` → `raise ProviderUnavailable(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc` — killed by T007
    - `src/factorflow/ingestion/rate_limit.py`: `raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE) from exc` → `raise ProviderRateLimited(_THROTTLE_BUDGET_SPENT_MESSAGE)` — killed by T007 (`__cause__` is then the implicit context, not set by `from`; assert `err.__cause__ is raised[-1]`)
    - `src/factorflow/ingestion/rate_limit.py`: `self._throttle_spent += self._monotonic() - throttled_at` → `self._throttle_spent += delay` (charge only the sleep; needs `delay` hoisted) — killed by the unchanged zero-stated-delay row (T006)
    - `src/factorflow/ingestion/rate_limit.py`: `throttled_at = None` (after the charge) → (line deleted) — killed by T012
    - `src/factorflow/ingestion/rate_limit.py`: `self._throttle_spent = 0.0` added at the top of `execute` (per-request budget) — killed by T008
    - `src/factorflow/ingestion/rate_limit.py`: `if outcome is Outcome.FATAL:` → `if outcome is Outcome.FATAL or isinstance(exc, ProviderRateLimited):` — killed by T011
    - `src/factorflow/ingestion/rate_limit.py`: `attempts += 1` added before `continue` in the `THROTTLED` branch — killed by T010's delivered throttle-no-attempt rows
- **No equivalent mutant identified.** `negate-boolean` on `if throttled_at is not None` subtracts `None` on the first pass and fails every test; `drop-field-copy` on `self._throttle_spent = 0.0` in `__init__` raises `AttributeError` on the first throttle.
- **Import cycle.** `rate_limit.py` already imports `massive.errors`, and `errors.py` imports nothing from the governor, so the new import adds no cycle.
- **No provisional value other than Open Gaps 1.** The message text, the budget (300 s default, unchanged), and every test parameter are fixed by the story, the design or TC-COMP-235 to TC-COMP-242; no bound, limit or threshold was left to planning.
- **Mapped component cases owned by sibling stories** (not planned here): TC-COMP-230, TC-COMP-232 and TC-COMP-233 (CAP-003-E8-S1), TC-COMP-243 to TC-COMP-246 (CAP-003-E8-S3), TC-COMP-254 and TC-COMP-256 (CAP-003-E8-S4). They trace to the epic-level DAC-E8-4, DAC-E8-5, DAC-E8-6 and DAC-E8-8 this story also lists, but each implements another story's derived criterion and lives in that story's files.
