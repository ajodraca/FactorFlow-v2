---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S1-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
last_reworked_review: CAP-003-E8-S1-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:35:20Z
  source_artifacts:
    - id: CAP-003-E8-S1
      version: "1"
    - id: CAP-003-E8
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-acquisition-runner
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

# Tasks: CAP-003-E8-S1 — A Plan Refusal Is Sent Once and Recorded as not_entitled

**Story**: `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1.md`
**Component**: `FactorFlow-v2` (modules `massive-client` and `acquisition-runner`'s `outcomes.py`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-E8-tasks`
**Date**: 2026-11-08

## Summary

Production stored a Massive `403` "You are not entitled to this data" as `[unavailable] … The provider failed 3 consecutive attempts.` because `classify_error_body` (`src/factorflow/ingestion/massive/errors.py` lines 154-189) recognises no entitlement marker and falls to the retryable `ProviderUnavailable`. This story adds `ProviderNotEntitled(MassiveError)` and the entitlement rule (marker `not entitled` searched in `error` and in `message`, each on its own, case-insensitively), placed after the delivered not-found and credential rules and before the default; the `not_entitled` row of `_ERROR_KIND_BY_TYPE` with the fixed description *the provider plan is not entitled to this data*, never passed to `redact`; the package re-export; and the one-line `classify_provider_error` mapping to `failed` in `src/factorflow/ingestion/outcomes.py`, without which the runner would receive a type that mapping rejects with `TypeError`. No change to `client.py` is needed: the delivered classifier closure in `MassiveClient._through_governor` (`client.py` lines 288-300) already makes every non-`ProviderUnavailable` `BadResponse` `FATAL` and re-raises it as `classify_error_body(...)`, so once the rule exists the refused request is sent once. A socket-free spike through `tests/unit/massive_transport_fakes.py` on the unchanged tree reproduced production exactly (three requests to `/stocks/financials/v1/balance-sheets`, `ProviderUnavailable("The provider failed 3 consecutive attempts.")`, `provider_request_id` `None`), which is the RED this plan's real-transport row turns GREEN.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-29 | A plan refusal is sent once and recorded under its own reason | T002, T003, T004, T006, T007, T008, T010, T011, T012, T013, T015 |
| DAC-E8-1 | `not entitled` in `error` or `message`, any case → `ProviderNotEntitled` with `request_id`; after not-found and credential, before default; `FATAL`, one request, no wait | T002, T003, T004, T009, T010, T013 |
| DAC-E8-3 | Unrecognised envelope and non-JSON body stay `ProviderUnavailable`, retried to 3, kind `unavailable`, pinned by a real-transport test | T002, T005, T010 |
| DAC-E8-4 | Kind by exact class; `[<kind>] ` prefix; `TypeError` for an unlisted subclass; exact `[not_entitled] …` reason, never provider text, no credential (this story: the `not_entitled` row) | T004, T006, T008, T011 |
| DAC-E8-8 | `classify_provider_error` records `ProviderNotEntitled` as `failed` with the reason unreworded; no outcome value, column, timing value or migration | T007, T012, T015 |
| DAC-E8-20 | Every `403` test runs through the real SDK and urllib3 path with production `MassiveSettings` and one `FakeClock` as `monotonic` and `now` | T004, T005 |
| DAC-E8-S1-1 | Marker in `message`, `error`, upper case, beside unrelated `error` → `ProviderNotEntitled` with `request_id`; no marker → `ProviderUnavailable` (TC-COMP-228) | T002, T010 |
| DAC-E8-S1-2 | Credential and not-found rules win; `ProviderNotEntitled` fatal and a `MassiveError` (TC-COMP-229) | T003, T010 |
| DAC-E8-S1-3 | Real `403` plan refusal: one request, none to income or cash-flow, no wait, exact reason; parametrised over the field (TC-COMP-230) | T004, T010, T011, T013 |
| DAC-E8-S1-4 | Real `403` `Forbidden`: three requests, plain `ProviderUnavailable`, kind `unavailable`; TC-INT-026 row untouched (TC-COMP-231) | T005, T010 |
| DAC-E8-S1-5 | Fixed description, `redact` never called with the text, `[not_entitled] ` prefix, no credential; delivered kinds unchanged; unlisted subclass `TypeError` (TC-COMP-232) | T006, T011 |
| DAC-E8-S1-6 | `classify_provider_error(ProviderNotEntitled("x"), …)` → `failed`, reason exactly `r`; `CredentialRejected` `ValueError`; unknown `TypeError` (TC-COMP-233) | T007, T012 |
| DAC-E8-S1-7 | `_safe_fields` unchanged, no provider free text, no package, no test reads `attempts` (TC-COMP-234) | T001, T008, T015 |

## Phase 1: Setup

**Purpose**: Fix the baseline the review checks compare against. No package, fixture, configuration or migration is added (SEC-DEP-001; story *Data Changes*).

- [x] T001 Record the baseline on the unchanged tree: run the focused suite (Validation Plan; expect 49 passed on `tests/unit/test_massive_error_classification.py`, `tests/unit/test_massive_failure_reasons.py`, `tests/unit/test_massive_retry.py`, `tests/unit/test_outcomes.py`) and note `git rev-parse HEAD` as the base commit T015 compares `uv.lock`, `pyproject.toml` and `_safe_fields` against; no file is modified (traces to DAC-E8-S1-7)

**Checkpoint**: Baseline green; base commit recorded in the first TDD-evidence cycle's notes.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define expected behavior from acceptance criteria. Each test carries `# Implements CAP-003 TC-COMP-<n>` (the repository's precedent for another capability's IDs, e.g. `# Implements CAP-002 TC-INT-007`): these four files already hold CAP-001 IDs, and CAP-001's TC-COMP-232 and TC-INT-026 are different cases from CAP-003's (coverage matrix note 13). Assertions compare against independent literals, never against a value the code under test also produced.

### Mandatory Component Tests
- [x] T002 [P] Implement TC-COMP-228 (a not-entitled body in either field, any case, classifies ProviderNotEntitled) in `tests/unit/test_massive_error_classification.py`: one `pytest.mark.parametrize` test over five bodies passed as `json.dumps(...)` to `classify_error_body` — (1) `{"status": "ERROR", "request_id": "r1", "message": "You are not entitled to this data. Please upgrade your plan"}`, (2) the same text in `error`, (3) `{"error": "NOT ENTITLED", "request_id": "r2"}`, (4) `{"error": "Forbidden", "message": "You are not entitled to this data", "request_id": "r3"}`, (5) row 1 with `"status": "NOT_AUTHORIZED"` and `request_id` `"r5"` (the spec's PROVISIONAL edge row; Notes) — each asserting `type(result) is ProviderNotEntitled`, `result.provider_request_id ==` the literal id, and `str(result) == "The provider plan is not entitled to this data."`; plus a separate assertion that `{"status": "ERROR", "request_id": "r4", "error": "Forbidden"}` gives `type(result) is ProviderUnavailable` — kills: negate-boolean on `_NOT_ENTITLED_MARKER in (fields[name] or "").lower()` (rows 1-5 stop classifying and the no-marker body starts to), drop-defaulted-argument on `provider_request_id=request_id` (the id reads `None`), and the hand-written field-tuple and `.lower()` mutants (Other Notes: row 2/3 kill `("message",)`, rows 1/4/5 kill `("error",)`, row 3 kills the dropped `.lower()`, row 4 kills `any` → `all`)
- [x] T003 Implement TC-COMP-229 (rule order keeps not-found and credential first; ProviderNotEntitled is fatal) in `tests/unit/test_massive_error_classification.py`: `{"error": "Unknown API Key", "message": "not entitled"}` → `type(result) is CredentialRejected`; `{"status": "NOT_FOUND", "message": "not entitled"}` → `type(result) is InstrumentNotFound`; `is_fatal_for_governor(ProviderNotEntitled("x")) is True`; `issubclass(ProviderNotEntitled, MassiveError)` and `not issubclass(ProviderNotEntitled, ProviderUnavailable)` (depends on T002 only for the shared file) — kills: the hand-written rule-order mutants (entitlement block moved above the credential block, or above the not-found block: the first or second body becomes `ProviderNotEntitled`) and the hand-written base-class mutant `ProviderNotEntitled(MassiveError)` → `ProviderNotEntitled(ProviderUnavailable)` (`is_fatal_for_governor` turns `False`); `type(...) is` rather than `isinstance` so a classifier returning the wrong sibling cannot pass
- [x] T004 [P] Implement TC-COMP-230 (a real 403 plan refusal is sent once, waits nothing and composes the fixed reason) in `tests/unit/test_massive_retry.py`. First add the real-transport harness beside the delivered helpers, which stay for TC-INT-025 and TC-INT-026: `_CLOCK_START = 1_800_000_000.0` (a multiple of 60; assert it once); `_production_settings(monkeypatch)` deleting `FACTORFLOW_MASSIVE_BASE_URL`, `_MAX_ATTEMPTS`, `_BACKOFF_INITIAL_SECONDS`, `_MAX_THROTTLE_WAIT_SECONDS` and `_TIMEOUT_SECONDS`, setting `FACTORFLOW_MASSIVE_API_KEY` to `generated_test_key()` and `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, returning `MassiveSettings(_env_file=None)` (precedent: `tests/unit/test_massive_redirects.py` `_settings`); `_real_transport_client(settings)` returning the client, the `FakeClock(_CLOCK_START)` and its `FakeSleeper`, the governor built `RateLimitGovernor(GovernorSettings.from_massive_settings(settings), monotonic=clock, sleep=sleeper, jitter=SequenceJitter([0.0]), now=clock)` with collaborators from `tests/unit/governor_fakes.py`; extend the module docstring with the CAP-003 real-transport rows. Then one test parametrised over three bodies, each answered `json_answer(body, status=403)` on `/stocks/financials/v1/balance-sheets` by a `RecordingMakeRequest` responder after `forbid_sockets(monkeypatch)`: `{"status": "ERROR", "request_id": "req_403_001", "message": "You are not entitled to this data. Please upgrade your plan"}`, the text in `error`, and `error` `"Forbidden"` plus the text in `message`. Run `client.fetch_financials("KO", date(2021, 1, 1), date(2025, 12, 31))` under `pytest.raises` and assert: `type(err) is ProviderNotEntitled` (imported from the package `factorflow.ingestion.massive`, the boundary callers use); `err.provider_request_id == "req_403_001"`; `[r.path.split("?", 1)[0] for r in transport.requests] == ["/stocks/financials/v1/balance-sheets"]` (exactly one request, none to income or cash-flow); `sleeper.calls == []`; `guard.fired == []`; and `compose_failure_reason(err, symbol="KO", data_type="fundamentals", redact=lambda t: t.replace(key, "[redacted]")) == "[not_entitled] symbol=KO data_type=fundamentals request_id=req_403_001: the provider plan is not entitled to this data"`, with `"Please upgrade your plan" not in` the reason. No `attempts` value is read; counts come from `RecordingMakeRequest` — kills: negate-boolean on the entitlement match (three requests, `ProviderUnavailable`), drop-defaulted-argument on `provider_request_id=request_id` (the reason reads `request_id=unavailable`), swap-case on the `not_entitled` table value, and the hand-written removal of the package re-export (the import fails). The no-wait assertion is `sleeper.calls == []`, not `sum(sleeper.calls) == 0`: the spike showed the unchanged code's two backoff sleeps are `0.0` under jitter `[0.0]`, so a sum cannot tell the retried mutant from the real code (wrong-property check)
- [x] T005 Implement TC-COMP-231 (an unrecognised 403 envelope is still retried to the limit as unavailable) in `tests/unit/test_massive_retry.py`, reusing T004's harness (depends on T004): parametrised over `json_answer({"status": "ERROR", "request_id": "r1", "error": "Forbidden"}, status=403)` and a non-JSON `FakeAnswer(status=403, body=b"Forbidden", headers={"Content-Type": "text/plain"})` (the spec's edge row, system design constraint 16 (c)); run the same `fetch_financials("KO", …)` and assert `type(err) is ProviderUnavailable` and `not isinstance(err, ProviderNotEntitled)`, three recorded requests all to `/stocks/financials/v1/balance-sheets` (`max_attempts` from production settings, never read from a stored `attempts`), and `compose_failure_reason(err, symbol="KO", data_type="fundamentals", redact=…)` starting `"[unavailable] symbol=KO data_type=fundamentals request_id=unavailable: "`. The delivered `test_timeouts_and_server_errors_retry_to_the_attempt_limit` (CAP-001 TC-INT-026) is not edited — kills: negate-boolean on the entitlement match (with `not in`, `"forbidden"` matches and the read stops after one request) and the hand-written rule-order mutants' effect on the default rule; this row characterises delivered behaviour and passes before the change too, so its cycle's RED comes from T004 (Notes)
- [x] T006 [P] Implement TC-COMP-232 (the not_entitled reason carries the fixed description, never the provider's text or the credential) in `tests/unit/test_massive_failure_reasons.py`, importing `MassiveError` and `ProviderNotEntitled`: (a) a spy `redact` that appends each argument to a list and returns it unchanged, `compose_failure_reason(ProviderNotEntitled(f"Please upgrade your plan {_CREDENTIAL_FIXTURE}", provider_request_id="req_ne_001"), symbol="KO", data_type="fundamentals", redact=spy)` `== "[not_entitled] symbol=KO data_type=fundamentals request_id=req_ne_001: the provider plan is not entitled to this data"`, the spy's list `== []`, `_CREDENTIAL_FIXTURE not in` it and `"Please upgrade" not in` it; (b) a parametrised test over the four delivered classes and `ProviderNotEntitled`, each built `(cls("diag text", provider_request_id="r1"))` and composed with `symbol="AAPL", data_type="prices"`, asserting the whole reason equals a literal: `[not_found] … r1: diag text`, `[credential_rejected] … r1: the provider rejected the configured credential`, `[unavailable] … r1: diag text`, `[contract_violation] … r1: diag text`, `[not_entitled] … r1: the provider plan is not entitled to this data`; (c) a test-local `class _Unlisted(MassiveError)` and a test-local `class _NotEntitledSubclass(ProviderNotEntitled)` each raise `TypeError` under `pytest.raises(TypeError)` (exact class lookup) — kills: swap-case on the `_ERROR_KIND_BY_TYPE` value `"not_entitled"` → `"unavailable"` (prefix differs), negate-boolean on `type(error) is ProviderNotEntitled` (every delivered `diag text` row gets the fixed description and the `not_entitled` row gets the message), and the hand-written mutant that routes the fixed description through `redact` (the spy's list is no longer empty). The identity-returning spy means a removed branch would leak `_CREDENTIAL_FIXTURE`, so the credential assertion is not vacuous
- [x] T007 [P] Implement TC-COMP-233 (classify_provider_error records ProviderNotEntitled as failed with the reason unreworded) in `tests/unit/test_outcomes.py`: with the independent literal `r = "[not_entitled] symbol=KO data_type=fundamentals request_id=req_403_001: the provider plan is not entitled to this data"` (not produced by `compose_failure_reason`), assert `classify_provider_error(ProviderNotEntitled("x"), data_type="fundamentals", reason=r) == InstrumentOutcomeRecord(data_type="fundamentals", outcome="failed", reason=r)`; `CredentialRejected("x")` still raises `ValueError` matching `"CredentialRejected"`; an unrecognised `Exception` subclass raises `TypeError` whose message matches `"ProviderNotEntitled"` (the text names the accepted types) — kills: the hand-written removal of `ProviderNotEntitled` from the `failed` tuple (raises `TypeError`, the record is never returned) and swap-case of the record's outcome (`"failed"` → `"not_found"`, the dataclass equality fails); the `TypeError` match fails until T012 rewrites the message

### Additional Unit Tests
- [x] T008 Implement TC-COMP-234's automatable half (the plan-refusal change keeps `_safe_fields`, carries no provider free text) in `tests/unit/test_massive_error_classification.py` (depends on T003 for the shared file): `{"status": "ERROR", "request_id": "req_leak_403", "message": "You are not entitled to this data. Please upgrade your plan", "debug_request_url": "https://api.massive.com/v3/reference/tickers/KO?apiKey=SECRET_TEST_TOKEN_ABC123"}` classifies `type(result) is ProviderNotEntitled` with `provider_request_id == "req_leak_403"`; `SECRET_TEST_TOKEN_ABC123`, `massive.com` and `Please upgrade` appear in neither `str(result)` nor `repr(result)`; and `compose_failure_reason(result, symbol="KO", data_type="fundamentals", redact=lambda t: t)` (identity, so nothing is hidden by redaction) contains none of `SECRET_TEST_TOKEN_ABC123`, `You are not entitled` or `Please upgrade`. Steps 1, 3 and 4 of TC-COMP-234 are review checks, planned as T015 — kills: the hand-written mutant that composes `redact(str(error))` for `ProviderNotEntitled` (no free text, by construction, only while the fixed branch exists) and any widening of `_safe_fields` that let `debug_request_url` reach the message (traces to DAC-E8-S1-7, AGT-PROHIB-003, SEC-INP-001)
- [x] T009 Add `test_provider_not_entitled_is_exported_from_errors_and_the_package` to `tests/unit/test_massive_error_classification.py` (depends on T008 for the shared file), importing `factorflow.ingestion.massive` inside the test: `"ProviderNotEntitled" in errors.__all__`, `"ProviderNotEntitled" in boundary.__all__` and `boundary.ProviderNotEntitled is errors.ProviderNotEntitled` — kills: the hand-written removals of the `errors.__all__` entry and of the package import or `__all__` entry (each assertion observes one declaration Python would not infer). The delivered `tests/unit/test_massive_package_boundary.py` then also checks the new export originates below `factorflow.` without edit (traces to DAC-E8-1; story Description `__all__` and re-export)

**Checkpoint**: All tests written and failing (no production code yet), except T005, which pins delivered behaviour and passes on the unchanged tree by design.

---

## Phase 3: Core Implementation

**Purpose**: Add the entitlement rule, the error type and its reason kind in `errors.py`, and the outcome mapping in `outcomes.py`.

- [x] T010 In `src/factorflow/ingestion/massive/errors.py`: add `_NOT_ENTITLED_MARKER = "not entitled"` beside the other markers with the design comment `# production 403 text, 2026-11-07 (CAP-002 manifest B1)`; add `class ProviderNotEntitled(MassiveError)` after `ProviderContractViolation`, with massive-client CAP-003 §2.4's docstring verbatim; add `def _mentions_not_entitled(fields: dict[str, str | None]) -> bool` returning `any(_NOT_ENTITLED_MARKER in (fields[name] or "").lower() for name in ("error", "message"))`; in `classify_error_body`, after the credential rule and before the default, `if _mentions_not_entitled(fields): return ProviderNotEntitled("The provider plan is not entitled to this data.", provider_request_id=request_id)`, and add one docstring sentence naming the rule and its place; add `"ProviderNotEntitled"` to `__all__` after `"ProviderContractViolation"`; remove "(401/403)" from the `CredentialRejected` docstring (§2.4: the taxonomy discriminates on the body). Rules 1 and 2 keep reading `error or message` as delivered; `_safe_fields`, `is_rate_limited_body`, `is_fatal_for_governor` and `wrap_validation_error` are untouched (makes T002, T003 pass; depends on T002, T003)
- [x] T011 In `src/factorflow/ingestion/massive/errors.py` (depends on T010): add `ProviderNotEntitled: "not_entitled"` as the fifth row of `_ERROR_KIND_BY_TYPE`; add `_NOT_ENTITLED_DESCRIPTION = "the provider plan is not entitled to this data"` after `_CREDENTIAL_REJECTED_DESCRIPTION`, with a docstring stating it is never built from the provider's text and never passed to `redact` (AGT-PROHIB-003); in `compose_failure_reason`, between the `CredentialRejected` branch and the `else`, `elif type(error) is ProviderNotEntitled: variable_segment = _NOT_ENTITLED_DESCRIPTION` (§2.5 snippet); in the docstring add the `ProviderNotEntitled` fixed-description paragraph and change "one of the four typed `MassiveError` subclasses" and the `TypeError` text "only the four typed MassiveError subclasses are accepted." to name the table instead of a count ("only the typed MassiveError subclasses in its kind table are accepted.") so CAP-003-E8-S2's sixth row does not make it wrong again (Notes) (makes T006, T008 pass)
- [x] T012 [P] In `src/factorflow/ingestion/outcomes.py`: import `ProviderNotEntitled` from `factorflow.ingestion.massive.errors`; extend the `failed` branch to `isinstance(error, (ProviderUnavailable, ProviderContractViolation, ProviderNotEntitled))` with acquisition-runner CAP-003 §2.3's comment line; in the `classify_provider_error` docstring add "``ProviderNotEntitled`` (a plan refusal, per data type, AC-29) maps to ``\"failed\"``"; change the `TypeError` text to "only InstrumentNotFound, ProviderUnavailable, ProviderContractViolation and ProviderNotEntitled are accepted as per-data-type outcomes." `CredentialRejected` keeps its `ValueError`; no outcome value, column, timing value or migration is added (DAC-E8-8) (makes T007 pass; depends on T007 and on T010 for the type)

**Checkpoint**: T002, T003, T006, T007, T008 pass; T004 and T009 still fail only on the package re-export; `uv run mypy src` clean.

---

## Phase 4: Integration

**Purpose**: Expose the new type at the package boundary and prove the plan refusal end to end through the unpatched SDK and urllib3 path, with `client.py` untouched.

- [x] T013 In `src/factorflow/ingestion/massive/__init__.py`: add `ProviderNotEntitled` to the import from `factorflow.ingestion.massive.errors` and to `__all__` (keeping the existing alphabetical order, after `"MassiveError"`); in the module docstring change "the five `MassiveError` types" to "the `MassiveError` types" for the same reason as T011 (makes T004, T009 pass; depends on T010). Do not edit `client.py`: if T004 fails after this task for a reason other than the import, the delivered closure did not behave as `client.py` lines 288-300 and §2.3 state — stop and report rather than lift `classify_for_governor`, which is CAP-003-E8-S3's

**Checkpoint**: The whole focused suite passes; T004 and T005 pass through the real SDK and urllib3 path with `src/factorflow/ingestion/massive/client.py`, `src/factorflow/ingestion/rate_limit.py` and `src/factorflow/ingestion/runner.py` unchanged.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [x] T014 Run the tech stack's Python validation on the final bytes: `uv run ruff format --check .`, `uv run ruff check .`, `uv run mypy src`, and `uv run pytest` (or `uv run pytest -m 'not postgres'` with the exclusion reported when no container runtime is available); the delivered `tests/unit/test_massive_package_boundary.py`, `tests/unit/test_massive_errors.py` and every runner test pass unedited (traces to AC-29)
- [x] T015 Run TC-COMP-234's review checks against the T001 base commit (traces to DAC-E8-S1-7): (a) `git diff --exit-code <base> -- uv.lock pyproject.toml` exits 0 (SEC-DEP-001); (b) `git diff <base> -- src/factorflow/ingestion/massive/errors.py` has no hunk touching `_safe_fields` (base lines 110-135) and it still returns exactly the keys `status`, `message`, `error`, `request_id` (SEC-INP-001); (c) `git diff <base> -- tests | grep -nE '^\+.*(\.attempts\b|\["attempts"\]|\battempts\s*==)'` prints nothing — the pattern deliberately does not match `max_attempts` or the prose word "attempts", which T004's harness and docstrings legitimately contain (self-contradiction check); (d) `git diff --name-only <base>` lists only `errors.py`, `__init__.py`, `outcomes.py`, the four test files, this plan, the story (status) and `CAP-003-E8-S1-tdd-evidence.yaml`; no migration file is added (DAC-E8-8)
- [x] T016 After each TDD cycle in T002–T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E8-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Story coding is attended and makes one commit for the story, which carries the code and this evidence file together and so cannot hold its own hash: every cycle records `commit_hash: stage`, which `check-tdd-evidence.py` resolves to that one story commit (INV-TDD-002, TEST-TDD-008; traces to no AC). The four cycles are C1 (T002, T003 → T010), C2 (T006, T008 → T011), C3 (T007 → T012) and C4 (T009, T004, T005 → T013); each cycle's mutation run uses that cycle's focused command and the hand-written mutants listed under Other Notes

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E8-S2 | reverse | Its graph entry depends on this story; it adds `ProviderRateLimited` and the `rate_limited` row to the `_ERROR_KIND_BY_TYPE` and `__all__` this plan extends, and its six-kind test asserts this story's `not_entitled` row |
| CAP-003-E8-S3 | reverse | Its graph entry depends on this story; it lifts the classifier into `classify_for_governor` in `client.py`, which this plan leaves untouched, and its DAC-E8-S3-7 (TC-COMP-249) reruns this plan's T004 and T005 rows through the lifted classifier |
| CAP-003-E8-S4 | reverse | Its graph entry depends on this story; its runner integration rows record `[not_entitled]` through the `outcomes.py` mapping T012 adds and read `ProviderNotEntitled` from T013's export |
| CAP-003-E8-S6 | soft | Reads the leading `[not_entitled] ` kind from stored reasons (massive-client §2.5 read contract); its tests seed reason strings and import nothing this plan creates |

This story has no hard edge, and planning found none to add: every file it edits was delivered by CAP-001 and exists on the branch.

### Task Dependencies
- T001: No dependencies; runs first
- T002, T004, T006, T007: No dependencies (different files; can be written in parallel)
- T003: After T002 (same file); T008 after T003; T009 after T008 (same file)
- T005: Depends on T004 (shares its harness)
- T010: Depends on T002, T003
- T011: Depends on T010, T006, T008
- T012: Depends on T007, T010
- T013: Depends on T010, T004, T009
- T014: Depends on T013, T011, T012
- T015: Depends on T014 and T001's base commit
- T016: Interleaved — runs after every TDD cycle, before the next cycle begins

Execution is per TDD cycle, each cycle writing its tests, recording RED, implementing, recording GREEN and then T016: C1 = T002, T003 → T010; C2 = T006, T008 → T011; C3 = T007 → T012; C4 = T009, T004, T005 → T013. All of `errors.py`'s edits land in C1 and C2, so the file is staged twice; stage hunks per cycle (`git add -p`) so each reviewed diff is only its cycle's.

### Parallel Opportunities
- Phase 2: T002, T004, T006 and T007 touch four different files and can be written in parallel
- Phase 3: T012 (`outcomes.py`) can run in parallel with T011 (`errors.py`) once T010 is in
- Phase 5: T014 and T015 are read-only and can run together once T013 is green

---

## Validation Plan

### Constitution-Defined Commands
- Build: `uv sync --all-extras` then `uv build`
- Test: `uv run pytest` (or `uv run pytest -m 'not postgres'` with the exclusion reported when no container runtime is available; never reported as a green suite)
- Focused tests, per phase: `uv run pytest tests/unit/test_massive_error_classification.py tests/unit/test_massive_failure_reasons.py tests/unit/test_massive_retry.py tests/unit/test_outcomes.py` — run at every phase checkpoint and passed to `mutation-run.py run --command`; per cycle the narrower command is C1 `uv run pytest tests/unit/test_massive_error_classification.py`, C2 `uv run pytest tests/unit/test_massive_failure_reasons.py tests/unit/test_massive_error_classification.py`, C3 `uv run pytest tests/unit/test_outcomes.py`, C4 `uv run pytest tests/unit/test_massive_retry.py tests/unit/test_massive_error_classification.py tests/unit/test_massive_package_boundary.py`; the full test command runs on the final bytes
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- AC-29 / DAC-E8-1 / DAC-E8-S1-3: T004 shows one recorded request to `/stocks/financials/v1/balance-sheets`, `sleeper.calls == []`, `ProviderNotEntitled` with `req_403_001`, for all three body shapes, through the unpatched SDK and urllib3
- DAC-E8-3 / DAC-E8-S1-4: T005 shows three requests and plain `ProviderUnavailable` with kind `unavailable` for a `Forbidden` JSON body and a non-JSON body; CAP-001's TC-INT-026 test is byte-identical to the base
- DAC-E8-4 / DAC-E8-S1-5: T006's literal reasons for all five kinds and its empty `redact` spy
- DAC-E8-8 / DAC-E8-S1-6: T007's record equality; T015 (d) shows no migration
- DAC-E8-S1-7: T008 and T015 (a) to (c)
- No change outside the story's files: T015 (d); `client.py`, `rate_limit.py`, `runner.py`, `models.py`, `paging.py` unchanged

---

## Notes

### Resolved Conflicts

- **Mandatory test cases versus the epic-level rows of the coverage matrix.** The matrix lists, against DAC-E8-3, DAC-E8-4, DAC-E8-8 and DAC-E8-20, cases that refine other stories' derived criteria: TC-COMP-249 (DAC-E8-S3-7, needs `classify_for_governor`), TC-COMP-240 and TC-COMP-241 (the `rate_limited` row and `ProviderRateLimited`), TC-COMP-243, TC-COMP-251, TC-COMP-253, TC-COMP-254 and TC-COMP-256 (`429` and runner rows). The story's own scope statement ("This story delivers the `not_entitled` row; the `rate_limited` row is CAP-003-E8-S2's") and the matrix's story rows (DAC-E8-S1-1 to DAC-E8-S1-7 → TC-COMP-228 to TC-COMP-234, "7 of 7") govern: those cases are planned by their own stories, and this plan's mandatory set is TC-COMP-228 to TC-COMP-234. Precedence: story AC > test specifications.
- **"`classify_provider_error`'s TypeError text names the accepted types" versus the delivered `compose_failure_reason` text "only the four typed MassiveError subclasses".** The story requires accepted types to be named only for `classify_provider_error`; for `compose_failure_reason` it requires only the new row. The count "four" becomes false the moment the fifth row lands, so T011 rewords it to name the table rather than a number. This is a docstring-and-message consequence of the required row, not new behaviour; no test asserts the old wording (the delivered test accepts `TypeError` or `ValueError` without a match).
- **Where the plan-refusal tests read the package export.** The design lists `__init__.py`'s re-export but no test of it; the package docstring states callers import the taxonomy from the package. T004 imports `ProviderNotEntitled` from `factorflow.ingestion.massive` and T009 asserts identity, so the re-export is observable (constraint 9 step 5: `tests/unit/test_massive_package_boundary.py` is the local precedent for identity re-export checks). `tests/unit/test_massive_package_boundary.py` itself is not edited, keeping the change inside the story's listed files.

### Open Gaps

- **TC-COMP-228's `NOT_AUTHORIZED` status row (owner confirmed 2026-11-08: keep the row).** The test specification marks this edge row PROVISIONAL: the shape comes from the coordinator's production diagnosis and no approved artifact records the production `403` body (system design assumption 9; massive-client §14 open question 3). Recommendation: keep the row in T002. Derivation: rule 3 reads only `error` and `message`, and `status` takes part only in the not-found rule (massive-client §2.4 table), so the row pins behaviour the approved rule already implies; it costs one parametrised case and protects against a later edit that makes `status` gate the rule. If the owner declines, drop row 5 from T002; nothing else changes. Owning artifact for the next revision: `tests/component/massive-client-tests.md` TC-COMP-228 (drop the PROVISIONAL marker once confirmed) and, when a body is captured, massive-client §14 open question 3.
- **The real-transport clock start.** No artifact fixes the value beyond "a multiple of 60"; T004 uses `1_800_000_000.0` (an epoch-like wall-clock value divisible by 60) and asserts the divisibility, so the row is valid whatever value a later story's harness prefers. Not an owner decision: any multiple of 60 satisfies DAC-E8-20 and the spec equally.

### Other Notes

- **RED evidence.** A socket-free spike on the unchanged tree (production `MassiveSettings` from the environment at 60 requests per minute, real SDK and urllib3, `FakeClock` as `monotonic` and `now`) gave three requests to `/stocks/financials/v1/balance-sheets`, `ProviderUnavailable("The provider failed 3 consecutive attempts.")`, `provider_request_id` `None` and sleeper calls `[0.0, 0.0]`: T004's RED, and the reason T004 asserts `sleeper.calls == []` rather than a zero sum.
- **T005 is a guard test.** It passes before and after the change (DAC-E8-3 pins delivered behaviour). Its cycle, C4, takes RED from T004 and T009; record T005 in the evidence as passing at RED with this reason rather than forcing a failure.
- **RED by import.** C1 to C4's tests import `ProviderNotEntitled`, so at each RED the module fails at collection with an `ImportError` naming it, including the delivered rows in that file; record the collection error as the RED, then GREEN restores every delivered row. Keep the new imports at module level, as the files' existing imports are.
- **No `client.py` change.** The delivered closure in `_through_governor` returns `FATAL` for any `BadResponse` whose classified type is not a `ProviderUnavailable`, and its `except BadResponse` re-raises `classify_error_body(str(exc))`, which carries the body's `request_id`. CAP-003-E8-S3 later replaces the closure with `classify_for_governor` and keeps both behaviours; its TC-COMP-249 reruns T004 and T005.
- **Coordination with CAP-003-E8-S2 and CAP-003-E8-S3 in `errors.py`, `__init__.py` and `tests/unit/test_massive_retry.py`.** Those stories extend `_ERROR_KIND_BY_TYPE`, `__all__` and the re-export after this one lands (hard edges in the graph). T004's helpers (`_production_settings`, `_real_transport_client`, `_CLOCK_START`) are the CAP-003 real-transport harness of massive-client §7; the later rows should reuse them rather than add a second set.
- **Equivalent mutant.** `type(error) is ProviderNotEntitled` → `isinstance(error, ProviderNotEntitled)` in `compose_failure_reason` is equivalent: the exact-class table lookup above it raises `TypeError` for any subclass before the branch is reached (T006 (c) proves it), and `ProviderNotEntitled` has no subclass in the taxonomy.
- **Hand-written mutants** for the coding agent to add to each cycle's mutation run beside the generated ones:
  - `src/factorflow/ingestion/massive/errors.py: for name in ("error", "message") → for name in ("message",)` (C1; killed by T002 rows 2, 3)
  - `src/factorflow/ingestion/massive/errors.py: for name in ("error", "message") → for name in ("error",)` (C1; killed by T002 rows 1, 4, 5)
  - `src/factorflow/ingestion/massive/errors.py: _NOT_ENTITLED_MARKER in (fields[name] or "").lower() → _NOT_ENTITLED_MARKER in (fields[name] or "")` (C1; killed by T002 row 3)
  - `src/factorflow/ingestion/massive/errors.py: return any( → return all(` in `_mentions_not_entitled` (C1; killed by T002 rows 1 to 5, each with the marker in one field only)
  - `src/factorflow/ingestion/massive/errors.py: entitlement rule block → moved above the credential rule` (C1; killed by T003 first body)
  - `src/factorflow/ingestion/massive/errors.py: entitlement rule block → moved above the not-found rule` (C1; killed by T003 second body)
  - `src/factorflow/ingestion/massive/errors.py: class ProviderNotEntitled(MassiveError) → class ProviderNotEntitled(ProviderUnavailable)` (C1; killed by T003 and T004)
  - `src/factorflow/ingestion/massive/errors.py: variable_segment = _NOT_ENTITLED_DESCRIPTION → variable_segment = _bound_variable_text(redact(_NOT_ENTITLED_DESCRIPTION))` (C2; killed by T006 (a), the spy's list)
  - `src/factorflow/ingestion/outcomes.py: (ProviderUnavailable, ProviderContractViolation, ProviderNotEntitled) → (ProviderUnavailable, ProviderContractViolation)` (C3; killed by T007)
  - `src/factorflow/ingestion/massive/__init__.py: "ProviderNotEntitled", → (entry removed from __all__)` (C4; killed by T009)
- **Running in this clone.** The worktree clone has no `.venv`; until `uv sync --all-extras` creates one, the focused commands run as `PYTHONPATH=<repo> /Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin/python -m pytest <paths>`. The full validation in T014 uses the tech stack's `uv run` commands.
- **The reason prefix is a read contract.** The leading `[not_entitled] ` T011 makes `compose_failure_reason` write is the kind CAP-003-E8-S6's `cause_of` matches at position 0 (massive-client §2.5; system design open question 16), so T006's literal reasons pin the exact spelling, including the trailing space.
- **Upgrade notes.** The operator-facing `README.md` upgrade subsection for all three ingestion changes is CAP-003-E8-S4's (DAC-E8-19); this story writes none.
