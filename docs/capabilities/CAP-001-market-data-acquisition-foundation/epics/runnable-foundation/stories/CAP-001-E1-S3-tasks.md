---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-07
last_reworked_review: CAP-001-E1-S3-implementation-review-v2.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T00:00:00Z
  source_artifacts:
    - id: CAP-001-E1-S3
      version: "1"
    - id: CAP-001-component-design-runtime-config
      version: "6"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S3 — Runtime Configuration and Credential Loading From the Environment

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers `src/factorflow/config/settings.py` (Pydantic settings models for the database, API bind, Massive provider, and run-timing configuration surfaces) and `src/factorflow/config/redaction.py` (a logging filter that scrubs secret values from every emitted record). Both containers load all configuration through this module. It is the capability's credential boundary: AC-13 requires the provider credential to never appear in the repository, in log output, or in any rendered view, and this story is where that becomes structurally true rather than merely intended — via `SecretStr` wrapping, the redaction filter, presence-only reporting, and rotation without restart at run-claim time (SEC-SEC-002).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | Provider credential from environment only; absent from repo, logs, and API responses | T005, T006, T007, T011, T013, T014, T017, T021 |
| AC-14 | API binds to loopback only | T008, T012, T018 |
| DAC-E1-7 | Missing required value fails start naming the variable, never its value | T005, T011 |
| DAC-E1-8 | Credential held in memory only, redacted from every log record, absent from every API response | T006, T007, T013, T014 |
| DAC-E1-9 | Credential supplied to both containers; application reads presence only | T009, T015 |
| DAC-E1-10 | Credential rotatable without restart; ingestion re-reads at claim time and rebuilds its client | T010, T016 |
| DAC-E1-S3-1 | Every required field validated at start; a type error fails the process | T005, T011 |
| DAC-E1-S3-2 | Secret-wrapping type whose `repr`/`str` never expose the value | T006, T013 |
| DAC-E1-S3-3 | Redaction filter removes any configured secret value from every record, including third-party library records | T007, T014 |
| DAC-E1-S3-4 | Bind address defaults to `127.0.0.1`; a non-loopback value is rejected at start | T008, T012, T018 |
| DAC-E1-S3-5 | Health reports credential presence as a boolean derived from whether the variable is set, never the value | T009, T015 |
| DAC-E1-S3-6 | Ingestion rebuilds its provider client at claim time when the credential fingerprint has changed | T010, T016 |

## Phase 1: Setup

**Purpose**: Add the one new dependency this story needs and its package location. No project bootstrap is included here — CAP-001-E1-S1's task plan owns creating `pyproject.toml`, the `src/` layout, and the test harness; this story only extends them.

- [x] T001 Add `pydantic-settings` to `pyproject.toml`'s dependencies (Pydantic itself is already required by the tech stack for API models; `pydantic-settings` supplies `BaseSettings`/`SettingsConfigDict` used throughout this story)
- [x] T002 [P] Create `src/factorflow/config/__init__.py` as an empty package marker
- [x] T003 [P] Create `tests/unit/` test files as empty stubs matching every filename the component design's section 7 testing table names, so Phase 2 tasks below have a fixed destination: `test_settings_required.py`, `test_settings_secrecy.py`, `test_redaction.py`, `test_settings_defaults.py`, `test_settings_validation.py`, `test_credential_reload.py`, `test_no_committed_secrets.py` (also created `test_credential_presence.py`, named by T009 but omitted from this list)
- [x] T004 [P] Confirm CAP-001-E1-S1's `tests/conftest.py` and package layout are present on this branch (this story adds no container-based tests and does not depend on the `postgres` fixture, but does depend on the `tests/unit/` package existing)

**Checkpoint**: `pydantic-settings` resolves via `uv sync --all-extras`; the seven test files exist as empty stubs; `uv run pytest -m 'not postgres'` collects them with zero test functions and exits 0.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the twelve mandatory component TC-IDs mapped from the coverage matrix, using the exact test file names and behaviors the component design's section 7 table specifies as the source of truth.

### Mandatory Component Tests

- [x] T005 [P] Implement TC-COMP-298, TC-COMP-323 (a missing required configuration value fails process start naming the variable but never its value; every required field is validated at start and a type error fails the process) in `tests/unit/test_settings_required.py` — one case for `FACTORFLOW_DATABASE_URL` absent, one for `FACTORFLOW_MASSIVE_API_KEY` absent, one for `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` absent, asserting each raises a `ValidationError` whose message names the variable and contains no value
- [x] T006 [P] Implement TC-COMP-299 (partial — memory-only holding), TC-COMP-013, TC-COMP-324 (secret-wrapping type whose `repr`/`str` never expose the value) in `tests/unit/test_settings_secrecy.py` — assert `repr()`, `str()`, `model_dump()`, and `model_dump_json()` of `DatabaseSettings` and `MassiveSettings` objects contain no substring of a known test credential value
- [x] T007 [P] Implement TC-COMP-299 (partial — log redaction), TC-COMP-325 (redaction filter removes any configured secret value from every record, including third-party library records) in `tests/unit/test_redaction.py` — install `RedactingFilter` with a known secret, log a record (including one emitted through a third-party-style logger name, e.g. `logging.getLogger("urllib3")`) whose message embeds the raw value, assert the emitted record reads `[redacted]` and not the value
- [x] T008 [P] Implement TC-COMP-014, TC-COMP-326 (bind address defaults to `127.0.0.1`; a non-loopback value is rejected at start rather than accepted silently) in `tests/unit/test_settings_defaults.py::test_default_bind_is_loopback` and `tests/unit/test_settings_validation.py::test_non_loopback_host_rejected` — assert `ApiSettings().host == "127.0.0.1"` with no environment set, and assert `FACTORFLOW_API_HOST=0.0.0.0` (or any non-loopback address) raises at load rather than being accepted
- [x] T009 [P] Implement TC-COMP-300, TC-COMP-327 (credential supplied to both containers; application reads only whether it is set; health reports a boolean derived from presence, never the value) in `tests/unit/test_credential_presence.py` — assert `credential_present()` returns `True`/`False` matching whether `FACTORFLOW_MASSIVE_API_KEY` is set, and that no code path in `credential_present()` calls `get_secret_value()`
- [x] T010 [P] Implement TC-COMP-301, TC-COMP-328 (credential rotatable without a restart; ingestion rebuilds its provider client at claim time when the fingerprint has changed) in `tests/unit/test_credential_reload.py` — using a stub client object standing in for `massive-client`'s `RESTClient` (which does not exist in this repository yet), assert: changing the environment value between two calls to `read_provider_credential()` produces a different fingerprint on the second call; an unchanged value produces the same fingerprint; the fingerprint of a known value contains no substring of it; `read_provider_credential()` reflects a changed environment without reimport

### Additional Unit Tests

- [x] T011 [P] Write a unit test asserting the four `[REQUIRES INPUT]`-turned-owner-decision timing bounds are enforced (section 2.2a invariants 1–4) in `tests/unit/test_settings_validation.py` — parametrized cases: staleness ≤ heartbeat × 3 raises (invariant 1); staleness ≤ per-instrument worst case (`max_attempts × timeout × 4 + max_throttle_wait`) raises and the message states the computed worst case (invariant 2); poll interval ≥ staleness raises (invariant 3); each of timeout/backoff/throttle-budget/heartbeat/staleness/poll set to zero or negative raises (invariant 4)
- [x] T012 [P] Write a unit test asserting `ApiSettings.port` bounds (1–65535) and `DatabaseSettings.pool_min`/`pool_max` bounds (≥1) are enforced, in `tests/unit/test_settings_validation.py`
- [x] T013 [P] Write a unit test asserting the timing and attempt defaults match the canonical set in section 2.2a exactly (timeout 30s, backoff 2s, throttle budget 300s, heartbeat 60s, staleness 900s, poll 5s, max_attempts 3) in `tests/unit/test_settings_defaults.py`
- [x] T014 [P] Write a unit test asserting no tracked file in the repository contains a value matching the Massive API key shape and no `.env` file is tracked, in `tests/unit/test_no_committed_secrets.py` — implement via `git ls-files` plus a pattern scan, per the component design's test table

**Checkpoint**: All twelve mandatory TC-ID tests and the four additional unit tests are written and fail — `src/factorflow/config/settings.py` and `src/factorflow/config/redaction.py` do not yet exist.

---

## Phase 3: Core Implementation

**Purpose**: Implement the settings models, the credential reload mechanism, and the redaction filter per the component design's section 2.3–2.5 source.

- [x] T015 Create `src/factorflow/config/settings.py` implementing `DatabaseSettings`, `ApiSettings`, `MassiveSettings`, `RunSettings`, and the top-level `Settings` model with its `_check_timing_invariants` validator, exactly per component design section 2.3 — **add a validator on `ApiSettings.host` rejecting any value that does not resolve to a loopback address** (`127.0.0.1`, `localhost`, or `::1`); the design's shown code snippet defines only the `127.0.0.1` default and does not yet show this rejection, but DAC-E1-S3-4 and TC-COMP-326 both require it, so this task adds the validator the snippet omits
- [x] T016 Add `read_provider_credential() -> SecretStr` and `credential_fingerprint(key: SecretStr) -> str` to `src/factorflow/config/settings.py` per section 2.2b — the credential is re-read from `os.environ` on every call (never cached at module level), and the fingerprint is a truncated SHA-256 digest computed via `hashlib`, never the value itself
- [x] T017 Add `credential_present() -> bool` to `src/factorflow/config/settings.py` per section 2.6 — reads only whether `FACTORFLOW_MASSIVE_API_KEY` is set in the calling process's environment, never its value, for `ingestion-api`'s `GET /api/health` to consume in a later story
- [x] T018 Create `src/factorflow/config/redaction.py` implementing `RedactingFilter` exactly per component design section 2.5

**Checkpoint**: `settings.py` and `redaction.py` exist with every function and model the design and Phase 2's tests require; T005–T014 all pass.

---

## Phase 4: Integration

**Purpose**: Install the redaction filter across every log handler in both processes, and confirm the full validation suite is green.

- [x] T019 Add a `configure_logging()` function (or extend one if CAP-001-E1-S1/S2 already started a logging setup module) in `src/factorflow/config/settings.py` or a new `src/factorflow/logging.py` that installs `RedactingFilter` on every handler at process start, seeded with the current values of `FACTORFLOW_DATABASE_URL` and `FACTORFLOW_MASSIVE_API_KEY`, per component design section 2.5 ("installed on every handler at process start, in both processes")
- [x] T020 Run the full Phase 2 test suite against the finished implementation and fix any mismatch between actual behavior and the component design's exact wording (message shapes, invariant thresholds, defaults)

**Checkpoint**: `uv run pytest -m 'not postgres'` passes in full — every test in this component runs without a container per the design's own testing section. All twelve mandatory TC-IDs (TC-COMP-013, 014, 298–301, 323–328) are green.

---

## Phase 5: Polish

**Purpose**: Confirm the credential boundary holds under the complete validation suite and close the one design gap this story fills in.

- [x] T021 Review every validation error message emitted by the settings models for accidental value leakage (e.g. Pydantic's default error formatting can echo an invalid value in some cases) — tighten any custom error construction so DAC-E1-7's "never the value" guarantee holds even for malformed-but-not-missing inputs. Probed directly: `ApiSettings.host`/`.port` malformed-input errors echo only the non-secret input (safe, since neither is a secret); `MassiveSettings` with a malformed sibling field (`requests_per_minute`) still shows no substring of a concurrently-set `api_key`; the `Settings`-level timing-invariant `ValueError`s (custom-constructed, not Pydantic's default formatting) name only variable names and computed thresholds. No code change required — `SecretStr` wraps the value before Pydantic's error formatting ever sees it, on every path tested.
- [x] T022 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv run pytest -m 'not postgres'` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001–T004 (Phase 1): T001 has no dependencies; T002–T004 can run in parallel after T001, and T004 is a blocking check on CAP-001-E1-S1's infrastructure rather than an implementation task.
- T005–T014 (Phase 2): all depend on Phase 1's package and test-file scaffolding (T002, T003); independent of each other, can run in parallel.
- T015 depends on T001 (the `pydantic-settings` dependency).
- T016, T017 depend on T015 (extend the same file).
- T018 depends on T002 only (independent file).
- T019 depends on T015 and T018 both existing (wires the filter using the settings values).
- T020 depends on T015–T019 (full implementation) to make Phase 2's tests pass.
- T021, T022 depend on T020.

### Parallel Opportunities
- Phase 1: T002, T003, T004 in parallel after T001.
- Phase 2: T005 through T014 all in parallel (distinct test files or distinct test functions within a shared file).
- Phase 3: T015/T016/T017 (one file, sequential) can proceed in parallel with T018 (a separate file).

---

## Validation Plan

### Constitution-Defined Commands
- Test: `uv run pytest -m 'not postgres'` (every test in this component runs without a container, per the component design's own testing section)
- Lint: `uv run ruff check .`
- Format check: `uv run ruff format --check .`
- Type check: `uv run mypy src`

### Story-Specific Validation
- With `FACTORFLOW_MASSIVE_API_KEY` unset, loading `MassiveSettings` (and therefore any process that constructs it) raises before any provider request is possible, naming the variable (AC-13, DAC-E1-7).
- No log record from either process, at any level, contains the provider credential or the database password, including a record deliberately constructed to embed one (AC-13, DAC-E1-8, DAC-E1-S3-3).
- `repr`, `str`, `model_dump()`, and `model_dump_json()` of every settings object contain no part of either Restricted value (AC-13, DAC-E1-S3-2).
- With no environment set, `ApiSettings().host == "127.0.0.1"`; a non-loopback value set explicitly is rejected at load rather than accepted (AC-14, DAC-E1-S3-4).
- `credential_present()` returns a boolean derived purely from whether the environment variable is set, and no code path inside it unwraps the `SecretStr` (DAC-E1-9, DAC-E1-S3-5).
- Changing the credential's environment value between two calls to `read_provider_credential()`/`credential_fingerprint()` is observable as a changed fingerprint, with no process restart and no module-level caching (DAC-E1-10, DAC-E1-S3-6).
- The four timing invariants from section 2.2a all refuse to start when violated, and each error message states the computed threshold rather than a bare rejection.

---

## Notes

- **This story does not implement `pyproject.toml` or the `src/` layout.** CAP-001-E1-S1's task plan owns that bootstrap. If this story is coded before CAP-001-E1-S1 lands on this branch, T001–T004 should be folded into whatever minimal scaffolding exists rather than duplicating it.
- **The `ApiSettings.host` loopback-rejection validator (T015) is not shown in the component design's code snippet.** Section 2.3's `ApiSettings` example defines only the `127.0.0.1` default with no validator. DAC-E1-S3-4's own wording ("a non-loopback value is rejected at start rather than accepted silently") and its mapped test TC-COMP-326 both require active rejection, not just a safe default, so this plan adds the validator the design's illustrative snippet omitted. This is a gap-fill consistent with the story's stated acceptance criteria, not an invented requirement — flagged here per constraint 7 (do not modify design documents; note gaps instead).
- **Rotation is tested against a stub client, not the real Massive client.** `massive-client`'s `RESTClient` does not exist in this repository yet (it is a separate component/story). T010 tests `read_provider_credential()` and `credential_fingerprint()` in isolation, which is everything this story owns; the actual "rebuild the client when the fingerprint changes" behavior described in section 2.2b is `acquisition-runner`'s integration to wire in once `massive-client` exists, and is out of this story's scope.
- **`credential_present()` is not wired into `GET /api/health` here.** That endpoint belongs to `ingestion-api`, a separate component design. This story delivers the function; a later story consumes it.
- **The database URL is explicitly not rotatable**, per component design section 2.2b's own scope statement — no task in this plan should add reload logic for `FACTORFLOW_DATABASE_URL`.
- **This story can be developed in parallel with CAP-001-E1-S1 and CAP-001-E1-S2**, per its own "Dependencies: None" — other stories consume this module's settings contract rather than this story consuming theirs.
- **`FACTORFLOW_LOG_LEVEL` (component design section 2.2, SA-LOG-001) was added to `Settings` during rework**, resolving implementation-review-v2's IR-005. It was absent from the original task list despite being one of this story's own variables; added as `Settings.log_level` (default `INFO`) and applied to the root logger in `configure_logging()`.
