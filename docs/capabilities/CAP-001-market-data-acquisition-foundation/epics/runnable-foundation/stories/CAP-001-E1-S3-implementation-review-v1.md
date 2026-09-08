---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-07
updated: 2026-09-07
story_id: "CAP-001-E1-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-07T20:09:13Z"
reviewed_head: "eaeeaf56eb5fcd870451a3a3f3e249524ceb9760"
review_base: "50660cfb3951d2656264841e91c537e21b11f571"
reviewed_state_revision: "sha256:e4a8dfc5691194ce0321e4a82627460c1ab0badafe1f7ccb61786f95f41ba2fb"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E1-S3
    artifact_version: 1
    content_revision: sha256:dca7d9c226d424baacebe45a7a30d7e2954af65e9e32aaf9f0b1c61dd5905f9c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-07T20:09:13Z
  source_artifacts:
    - id: CAP-001-E1-S3
      version: "1"
    - id: CAP-001-E1-S3-tasks
      version: "1"
    - id: CAP-001-component-design-runtime-config
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 3 |
| Low findings | 2 |
| Acceptance criteria | 7/12 satisfied |
| Planned tasks | 17/22 verified |
| Required validation | 3/4 passed |

The settings models, `SecretStr` wrapping, presence-only reporting, loopback
rejection and credential-reload functions are implemented well and are backed by
tests that genuinely exercise production behaviour. Three defects block the gate.

First, the required validation command `uv run pytest -m 'not postgres'` **fails
in this exact tree** — `tests/unit/test_no_committed_secrets.py::test_no_tracked_file_contains_a_key_shaped_value`
reports two offenders. The task plan checks T014, T020 and T022 complete, T022
with the explicit claim "confirm every command passes". That claim is false
against the reviewed revision.

Second, `configure_logging()` does not deliver DAC-E1-S3-3. It snapshots the root
logger's handlers at call time, so any handler installed afterwards (including the
`logging.basicConfig()` a normal process start uses) carries no filter, and the
`root.addFilter()` call it also makes is inert for records propagated from
third-party loggers — precisely the case the acceptance criterion names. A direct
probe emitted the provider credential in plaintext.

Third, section 2.2a invariant 4 is only partly enforced: the design requires
`timeout` to be at least 1 second and the implementation accepts 0.5.

Lint, format and type checks all pass, and the credential-leakage probes behind
T021 hold up: no settings error message on any path tested exposed a Restricted
value.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S3` |
| HEAD | `eaeeaf56eb5fcd870451a3a3f3e249524ceb9760` |
| Review base | `main` / `origin/main` merge-base `50660cfb3951d2656264841e91c537e21b11f571` |
| Working tree | clean — no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 15 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `pyproject.toml` | modified | T001 |
| `uv.lock` | modified | T001 (lock refresh for `pydantic-settings`) |
| `src/factorflow/config/__init__.py` | added | T002 |
| `src/factorflow/config/settings.py` | added | T015, T016, T017, T019 |
| `src/factorflow/config/redaction.py` | added | T018 |
| `tests/unit/test_settings_required.py` | added | T005 |
| `tests/unit/test_settings_secrecy.py` | added | T006 |
| `tests/unit/test_redaction.py` | added | T007 |
| `tests/unit/test_settings_defaults.py` | added | T008, T013 |
| `tests/unit/test_settings_validation.py` | added | T008, T011, T012 |
| `tests/unit/test_credential_presence.py` | added | T009 |
| `tests/unit/test_credential_reload.py` | added | T010 |
| `tests/unit/test_no_committed_secrets.py` | added | T014 |
| `.../stories/CAP-001-E1-S3-tasks.md` | modified | task-state bookkeeping |
| `.../stories/CAP-001-E1-S3.md` | modified | `status: planning` → `in-review` |

No unjustified files. No scope leakage into unrelated modules.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | PARTIAL | `settings.py:DatabaseSettings.url`, `MassiveSettings.api_key` (`SecretStr`); `redaction.py:RedactingFilter`; `settings.py:credential_present` | `test_settings_secrecy.py` (8 cases), `test_redaction.py`, `test_no_committed_secrets.py` | The "no repository file" limb is asserted by a test that **currently fails** (IR-001). The "no log record" limb is not delivered at process level (IR-002). The serialisation limb is satisfied and well tested. |
| AC-14 | SATISFIED | `settings.py:ApiSettings.host` default plus `_reject_non_loopback_host` | `test_settings_defaults.py::test_default_bind_is_loopback`; `test_settings_validation.py::TestNonLoopbackHostRejected` (6 parametrized cases) | Default and active rejection both verified; `0.0.0.0`, `10.0.0.5`, `example.com` rejected, three loopback forms accepted. |
| DAC-E1-7 | PARTIAL | `MassiveSettings.api_key` / `requests_per_minute` / `DatabaseSettings.url` required, no defaults | `test_settings_required.py` (3 cases) | The "never its value" half is confirmed by direct probe (see Independent Validation). The "naming the variable" half is not met: the raised message names the Pydantic **field** (`api_key`), not the environment variable `FACTORFLOW_MASSIVE_API_KEY`. See IR-004. |
| DAC-E1-8 | PARTIAL | `SecretStr` fields; `RedactingFilter`; `configure_logging` | `test_settings_secrecy.py`; `test_redaction.py` | Memory-only holding and serialisation safety satisfied. "Redacted from every log record" is not achieved at process level — IR-002. |
| DAC-E1-9 | SATISFIED | `settings.py:credential_present` reads `os.environ` only | `test_credential_presence.py` (5 cases, incl. an AST check that `get_secret_value` is never called) | The static AST assertion is a genuinely strong guard against a future regression. |
| DAC-E1-10 | SATISFIED | `settings.py:read_provider_credential`, `credential_fingerprint` | `test_credential_reload.py` (5 cases) | Client rebuild itself is correctly scoped out (no `massive-client` in this repo); what this story owns — uncached re-read and change-detecting fingerprint — is implemented and proven. |
| DAC-E1-S3-1 | PARTIAL | Field types and constraints on all four models; `Settings._check_timing_invariants` | `test_settings_required.py`, `test_settings_validation.py` (23 cases) | Type errors do fail the process. Invariant 4's lower bounds are incompletely enforced — IR-003. |
| DAC-E1-S3-2 | SATISFIED | `SecretStr` on `DatabaseSettings.url` and `MassiveSettings.api_key` | `test_settings_secrecy.py`, all four render forms on both models | Verified independently: `repr`, `str`, `model_dump()`, `model_dump_json()` all clean. |
| DAC-E1-S3-3 | NOT SATISFIED | `settings.py:configure_logging` | `test_redaction.py::test_configure_logging_redacts_a_third_party_logger` | The filter class is correct; its installation is not. The one test covering installation passes only because it attaches its handler *before* calling `configure_logging()`. IR-002. |
| DAC-E1-S3-4 | SATISFIED | `ApiSettings.host` default `127.0.0.1` and `_reject_non_loopback_host` model validator | `test_settings_defaults.py`, `test_settings_validation.py::TestNonLoopbackHostRejected` | The task plan's flagged design gap-fill is implemented as planned and the deviation is documented in the plan's Notes. |
| DAC-E1-S3-5 | SATISFIED | `settings.py:credential_present` | `test_credential_presence.py` | Boolean derived from presence; empty string correctly reports `False`. |
| DAC-E1-S3-6 | SATISFIED | `credential_fingerprint` — truncated SHA-256, never the value | `test_credential_reload.py::test_fingerprint_contains_no_substring_of_the_value` (sliding 4-char window) | Fingerprint-change detection is the whole of this story's share; the rebuild is `acquisition-runner`'s. |

The story owns twelve criteria: six under "From Capability / EPIC" and six
"Derived". Seven are SATISFIED. Four are PARTIAL (AC-13, DAC-E1-7, DAC-E1-8,
DAC-E1-S3-1) and one is NOT SATISFIED (DAC-E1-S3-3).

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml` `dependencies` gains `pydantic-settings`; `uv.lock` updated | Unpinned; see IR-007. |
| T002 | complete | VERIFIED | `src/factorflow/config/__init__.py` (empty) | — |
| T003 | complete | VERIFIED | All eight named test files present | Plan text amended in-place to record the eighth file (`test_credential_presence.py`); honest and correctly annotated. |
| T004 | complete | VERIFIED | `tests/conftest.py`, `tests/unit/` present from CAP-001-E1-S1 | Check task, satisfied. |
| T005 | complete | VERIFIED | `test_settings_required.py`, 3 cases | Assertions are weaker than the task text asks — see IR-004 and IR-006. |
| T006 | complete | VERIFIED | `test_settings_secrecy.py`, 8 cases across both models | Strong: all four render forms, both Restricted values. |
| T007 | complete | VERIFIED | `test_redaction.py`, 6 cases incl. `urllib3.connectionpool` | The filter unit is well tested; the *installation* test is weak — IR-002. |
| T008 | complete | VERIFIED | `test_settings_defaults.py::test_default_bind_is_loopback`; `test_settings_validation.py::TestNonLoopbackHostRejected` | Exceeds the plan (3 rejection + 3 acceptance cases). |
| T009 | complete | VERIFIED | `test_credential_presence.py`, 5 cases | The AST check for `get_secret_value` is implemented as specified. |
| T010 | complete | VERIFIED | `test_credential_reload.py`, 5 cases | The stub client the task names was not written; the module docstring states why and the omission is correct — the tests do not need it. Justified deviation. |
| T011 | complete | PARTIAL | `test_settings_validation.py::TestTimingInvariants` | Invariants 1–3 covered with correct boundary values (exactly-3x, exactly-660, equal poll/stale). Invariant 4 is tested only for zero/negative, never for the design's "at least 1 second" floor, and `timeout_seconds` fails that floor. IR-003. |
| T012 | complete | VERIFIED | `test_settings_validation.py::TestFieldBounds` | Port 0/65536/-1 rejected, 1/8000/65535 accepted, pool bounds rejected below 1. |
| T013 | complete | VERIFIED | `test_settings_defaults.py::test_timing_defaults_match_the_canonical_set` | All seven canonical values asserted; the test correctly clears the environment first. |
| T014 | complete | PARTIAL | `test_no_committed_secrets.py` exists and is well written | The test **fails** on this tree. Written but not satisfied. IR-001. |
| T015 | complete | VERIFIED | `settings.py` — four models plus `Settings._check_timing_invariants`, plus the planned `_reject_non_loopback_host` | Matches design section 2.3 field-for-field. |
| T016 | complete | VERIFIED | `settings.py:read_provider_credential`, `credential_fingerprint` | Reads `os.environ` per call, no module-level cache; SHA-256 truncated to 16 hex chars. |
| T017 | complete | VERIFIED | `settings.py:credential_present` | — |
| T018 | complete | VERIFIED | `redaction.py:RedactingFilter` | Matches design section 2.5 verbatim, with one safe addition (re-reading `message` inside the loop so multiple secrets compose). |
| T019 | complete | NOT IMPLEMENTED | `settings.py:configure_logging` | The function exists but does not achieve its stated result ("installs `RedactingFilter` on every handler at process start"). IR-002. |
| T020 | complete | PARTIAL | — | The suite was evidently run, but it does not pass; the checkpoint "`uv run pytest -m 'not postgres'` passes in full" is not met. |
| T021 | complete | VERIFIED | Plan text records the probe results | Independently re-probed and confirmed: no Restricted value leaked on any of the paths described. This annotation is accurate. |
| T022 | complete | NOT IMPLEMENTED | — | The claim "confirm every command passes" is contradicted by the reviewed tree. IR-001. |

17 of 22 tasks VERIFIED. Five are not: T011 PARTIAL, T014 PARTIAL,
T019 NOT IMPLEMENTED, T020 PARTIAL, T022 NOT IMPLEMENTED.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_settings_required.py` (3) / TC-COMP-298, TC-COMP-323 | WEAK | Asserts a `ValidationError` is raised and that the field name appears in the message. Genuinely fails if a field were given a default. | Asserts the *field* name (`api_key`), not the environment variable the criterion requires (IR-004). Never asserts the absence of a value in the message, though the task text asks for it (IR-006). |
| `test_settings_secrecy.py` (8) / TC-COMP-013, TC-COMP-299 (partial), TC-COMP-324 | ADEQUATE | All four render forms on both Restricted fields, against known planted values. Would fail immediately if either field were changed to `str`. | None. |
| `test_redaction.py` (6) / TC-COMP-299 (partial), TC-COMP-325 | WEAK | Filter-unit cases are strong: own logger, third-party logger name, no-secret passthrough, empty-secret guard, `filter()` returns `True`. | `test_configure_logging_redacts_a_third_party_logger` attaches its handler *before* calling `configure_logging()`, which is the one ordering under which the implementation works. It therefore cannot fail on the real defect (IR-002). |
| `test_settings_defaults.py` (2) / TC-COMP-014 (default half) | ADEQUATE | Clears the relevant variables before asserting; all seven canonical timings checked. | None. |
| `test_settings_validation.py` (23) / TC-COMP-326 | ADEQUATE for TC-COMP-326 | Boundary values chosen correctly throughout — exactly 3×heartbeat, exactly the 660s worst case, poll equal to stale. Invariant 2 asserts the computed `660` appears in the message, which is the design's actual requirement. | Invariant 4's sub-1-second floor untested (IR-003). |
| `test_credential_presence.py` (5) / TC-COMP-300, TC-COMP-327 | ADEQUATE | Presence true/false/empty-string, environment-reflecting, plus an AST assertion that the body never calls `get_secret_value`. | The AST check inspects only `credential_present`'s own source, not its callees; adequate here since the body is two lines. |
| `test_credential_reload.py` (5) / TC-COMP-301, TC-COMP-328 | ADEQUATE | Change/no-change fingerprint behaviour, sliding-window substring absence, uncached re-read. Would fail if a module-level cache were introduced. | None for this story's scope. |
| `test_no_committed_secrets.py` (2) | ADEQUATE (as a test) / FAILING | Real `git ls-files` scan, no mocking, genuinely regression-sensitive. | It is currently red (IR-001). The `.env` case excludes `.env.example`, which is correct. |

All tests are isolated and deterministic (`monkeypatch` throughout, no network,
no time dependence, no ordering dependence). The full suite ran twice with
identical results. `test_redaction.py` mutates root-logger state but restores it
in a `finally` block.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 1 | **FAIL** | 1 failed, 80 passed, 27 deselected. `test_no_committed_secrets.py::test_no_tracked_file_contains_a_key_shaped_value` — `key-shaped value found in: ['tests/unit/test_redaction.py', 'tests/unit/test_settings_secrecy.py']`. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 41 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 9 source files. |
| `uv run pytest tests/unit/test_credential_presence.py tests/unit/test_credential_reload.py -v` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 10 passed — confirms both files collect and run (they are not silently skipped). |

### Story-Specific Probes (reviewer-run, in-process)

| Probe | Result |
|-------|--------|
| Missing `FACTORFLOW_MASSIVE_API_KEY` error text | Raises `ValidationError`; message reads `api_key / Field required` — names the field, **not** the environment variable. |
| Malformed `requests_per_minute` with a set `api_key` | Message echoes only `'notanumber'`; the credential does not appear. T021's claim holds. |
| Malformed `pool_min` with a set `FACTORFLOW_DATABASE_URL` | Password does not appear in the message. |
| `Settings` construction with a non-loopback host and both Restricted values set | Neither Restricted value appears in the error. |
| `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS=0.5` | **Accepted** — `massive.timeout_seconds == 0.5`, contrary to invariant 4's 1-second floor. |
| `FACTORFLOW_RUN_HEARTBEAT_SECONDS=0.5`, `FACTORFLOW_RUN_POLL_INTERVAL_SECONDS=0.5` | Both correctly rejected (`ge=1`). |
| `configure_logging()` then `logging.basicConfig()`, then `logging.getLogger("urllib3").warning(...)` embedding the credential | **Credential emitted in plaintext.** |
| `configure_logging()` with the handler filter removed, leaving only `root.addFilter(...)` | **Credential emitted in plaintext** — the root-logger filter is inert for propagated records. |
| `RedactingFilter` against a record carrying the secret in `exc_info` | Secret survives into the formatted traceback. |
| `RedactingFilter` against a record carrying the secret in an `extra` attribute | Secret survives on the attribute. |

### Validation Side Effects

- Before: `git status --porcelain` empty (clean tree at `eaeeaf5`).
- After: `git status --porcelain` empty; `--untracked-files=all` also empty.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — The required test suite fails; T014/T020/T022 are checked complete on a false claim

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-13
- **Tasks**: T014, T020, T022
- **Files**: `tests/unit/test_no_committed_secrets.py:37-53`, `tests/unit/test_redaction.py:18`, `tests/unit/test_settings_secrecy.py:17`
- **Claim challenged**: T022 — "Run the complete validation plan and confirm every command passes" — and the Phase 4 and Phase 5 checkpoints stating that `uv run pytest -m 'not postgres'` passes in full.
- **Observed evidence**: `uv run pytest -m 'not postgres'` exits 1 in the reviewed tree. `test_no_tracked_file_contains_a_key_shaped_value` reports `['tests/unit/test_redaction.py', 'tests/unit/test_settings_secrecy.py']`. The cause is that the two test files use literals matching their own sibling test's key-shape pattern: `sk-massive-leaked-credential-xyz789` and `sk-massive-test-credential-abc123` both satisfy `\bsk-massive-[A-Za-z0-9_-]{16,}\b`.
- **Expected evidence/behavior**: The task plan's Validation Plan lists `uv run pytest -m 'not postgres'` as a constitution-defined command; the Phase 4 and Phase 5 checkpoints require it green. A checked task box must correspond to a satisfied checkpoint.
- **Impact**: The story's own repository-secret guard — the mechanism standing behind AC-13's "appears in no repository file" — is red. Any future genuinely committed key would be indistinguishable from this pre-existing failure, so the guard provides no signal while it stays broken. Downstream Doc Sync would record a passing state that does not exist.
- **Required remediation**: Make `uv run pytest -m 'not postgres'` pass. Either choose fixture credential literals that do not collide with the scanner's own pattern, or have the scanner exclude the test files that legitimately carry shaped-but-fake values (an explicit allowlist, not a loosened pattern — the pattern's tightness is what gives it value). Then re-verify the checked state of T014, T020 and T022 against a green run.

### IR-002 — `configure_logging()` does not install the filter on every handler; the credential reaches log output at process start

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-13, DAC-E1-8, DAC-E1-S3-3
- **Tasks**: T019
- **Files**: `src/factorflow/config/settings.py:157-173` (`configure_logging`); `tests/unit/test_redaction.py:78-104`
- **Claim challenged**: T019 — "installs `RedactingFilter` on every handler at process start" — and DAC-E1-S3-3, "a redaction filter removes any configured secret value from every record, including records emitted by third-party libraries".
- **Observed evidence**: Two reviewer probes. (a) Calling `configure_logging()` and then `logging.basicConfig(level=DEBUG)` — the ordinary process-start sequence — followed by `logging.getLogger("urllib3").warning("Bearer LEAKY-KEY-VALUE")` emitted the value verbatim: `WARNING:urllib3:Bearer LEAKY-KEY-VALUE`, and the captured record's `getMessage()` still contained the secret. (b) With the handler-level filter removed and only the `root.addFilter(...)` from line 171 in place, the same record was emitted unredacted. `logging.Logger.filter()` is invoked only on the logger where the call originates, never on ancestors during propagation, so `root.addFilter()` cannot see a record from `urllib3` — the exact case the criterion names.
- **Expected evidence/behavior**: Component design section 2.5: "The filter is installed on every handler at process start, in both processes." DAC-E1-S3-3 requires coverage of third-party library records.
- **Impact**: The second line of defence AC-13 depends on is absent in any realistic startup, because handler configuration normally happens after or independently of this call. The `SecretStr` boundary still protects the settings object, so this is a defence-in-depth failure rather than a guaranteed leak — but it is the specific defence this acceptance criterion requires, and any library that logs an Authorization header would leak the credential.
- **Required remediation**: Make redaction hold regardless of when handlers are added. Filtering at the point every record is formatted — rather than snapshotting `root.handlers` once — is the shape that satisfies "every handler at process start". Remove or replace the `root.addFilter()` call, which is currently inert for the propagated case. Then strengthen `test_configure_logging_redacts_a_third_party_logger` so it attaches its handler *after* `configure_logging()`; as written it passes under the one ordering the implementation happens to handle and cannot detect this defect.

### IR-003 — Timing invariant 4's one-second floor is enforced for heartbeat and poll but not for timeout

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S3-1
- **Tasks**: T011, T015
- **Files**: `src/factorflow/config/settings.py:66` (`MassiveSettings.timeout_seconds`); `tests/unit/test_settings_validation.py:71-93`
- **Claim challenged**: T011 — "each of timeout/backoff/throttle-budget/heartbeat/staleness/poll set to zero or negative raises (invariant 4)" — read against the design's actual invariant 4.
- **Observed evidence**: Component design section 2.2a, invariant 4: "Every value is greater than zero, and `timeout`, `heartbeat` and `poll_interval` are each **at least 1 second**." `RunSettings.heartbeat_seconds` and `poll_interval_seconds` correctly use `ge=1`, and a probe confirmed `0.5` is rejected for both. `MassiveSettings.timeout_seconds` uses `gt=0`; a probe with `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS=0.5` was **accepted**, yielding `timeout_seconds == 0.5`. The task plan restated invariant 4 as zero-or-negative only, so the test written to it cannot catch the gap.
- **Expected evidence/behavior**: `timeout_seconds` should carry `ge=1`, matching the two sibling values whose floors were implemented.
- **Impact**: A sub-second request timeout would fail nearly every provider call while passing validation — the intermittent-failure-instead-of-loud-refusal outcome that section 2.2a says these invariants exist to prevent. The inconsistency (two of three floors present) suggests an oversight rather than a decision.
- **Required remediation**: Change `MassiveSettings.timeout_seconds` to `Field(default=30.0, ge=1)` and add a case to `TestTimingInvariants::test_invariant_4_*` asserting a sub-one-second timeout is rejected, alongside equivalent floor cases for heartbeat and poll interval.

### IR-004 — Required-value failures name the Pydantic field, not the environment variable DAC-E1-7 requires

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-7
- **Tasks**: T005, T015
- **Files**: `src/factorflow/config/settings.py:27-31, 60-68`; `tests/unit/test_settings_required.py:15-41`
- **Claim challenged**: DAC-E1-7 — "fails with a message naming the variable" — and the T005 assertion that the message "names the variable".
- **Observed evidence**: A probe with `FACTORFLOW_MASSIVE_API_KEY` absent raised `1 validation error for MassiveSettings / api_key / Field required`. The string `FACTORFLOW_MASSIVE_API_KEY` does not appear. The test asserts `"api_key" in message.lower()`, which the field name satisfies, so the test passes without the criterion being met.
- **Expected evidence/behavior**: Component design section 3: "The process exits non-zero with a message naming the variable." Design section 2.2's Settings-load contract and the story's DAC-E1-7 both say the variable. The owner reading a container log needs `FACTORFLOW_MASSIVE_API_KEY`, not `api_key` on a model whose prefix they must reconstruct.
- **Impact**: The diagnosability this criterion exists for is weakened. The mapping from `MassiveSettings.api_key` to `FACTORFLOW_MASSIVE_API_KEY` is mechanical but requires the reader to know the prefix scheme. Rated MEDIUM rather than HIGH because the process does fail loudly and the field name is a recognisable stem of the variable.
- **Required remediation**: Surface the full environment-variable name in the start-up failure — a wrapper around `Settings` construction that translates Pydantic's field paths into `FACTORFLOW_`-prefixed names before the process exits is sufficient, and keeps the models themselves untouched. Then tighten the three `test_settings_required.py` assertions to require the full variable name.

### IR-005 — The redaction filter leaves secrets in `exc_info` tracebacks and `extra` attributes

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: AC-13, DAC-E1-8
- **Tasks**: T018
- **Files**: `src/factorflow/config/redaction.py:18-25`
- **Claim challenged**: DAC-E1-8, "the credential is redacted" from any emitted log record.
- **Observed evidence**: `RedactingFilter.filter()` rewrites only `record.msg` after `getMessage()`. Probes: a record whose `exc_info` carried `ValueError("boom with LEAKY-KEY-VALUE")` formatted with the secret intact; a record with `record.api_key = SECRET` retained the attribute unchanged. Structured formatters routinely serialise both.
- **Expected evidence/behavior**: DAC-E1-8 states "any log record". The design's section 2.5 snippet has the same limitation, so this is a design-level gap the implementation faithfully reproduced rather than a deviation — which is why it is MEDIUM and not HIGH.
- **Impact**: An exception raised from code that interpolated the credential — a provider client error carrying an Authorization header, for instance — would emit it. This is the realistic leak path once `massive-client` exists.
- **Required remediation**: Extend `RedactingFilter` to scrub the formatted exception text and any string-valued record attributes it did not itself set, or record a deliberate deferral against the component design so a later story owns it. Add the two probe cases as tests either way.

### IR-006 — `test_settings_required.py` never asserts the absence of a value, though the task specifies it

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-7
- **Tasks**: T005
- **Files**: `tests/unit/test_settings_required.py:15-41`
- **Claim challenged**: T005 — "asserting each raises a `ValidationError` whose message names the variable **and contains no value**".
- **Observed evidence**: All three tests assert only that a field name appears in the message. None asserts that a credential value is absent. Reviewer probes confirmed the behaviour is in fact correct on every path tested (and T021's annotation documents this accurately) — but no test locks it in.
- **Expected evidence/behavior**: The task's explicit second assertion, and the design's section 7 row "The failure message carries no value" mapped to this same file.
- **Impact**: The "never its value" half of DAC-E1-7 currently rests on manual probing rather than on a regression-sensitive test. Changing a field from `SecretStr` to `str`, or adding a custom validator that echoes input, would not be caught here — `test_settings_secrecy.py` guards serialisation, not error text.
- **Required remediation**: Add a case per the design's section 7 row: set a Restricted variable to a known malformed value alongside a second failing field, and assert the known value does not appear in `str(exc_info.value)`.

### IR-007 — `pydantic-settings` is added without a version constraint

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T001
- **Files**: `pyproject.toml:12`
- **Claim challenged**: None — a consistency observation.
- **Observed evidence**: The new dependency is declared as bare `"pydantic-settings"`, while its sibling on the line above is `"psycopg[binary]>=3"`. `uv.lock` pins the resolved version, so builds are reproducible today.
- **Expected evidence/behavior**: Consistency with the established pattern in the same list.
- **Impact**: Minimal while the lock file is committed. A future `uv lock --upgrade` could pull a major version with a changed `BaseSettings` contract without any declared floor to prevent it.
- **Required remediation**: Add a lower bound (`>=2`) to match the sibling's style. Non-blocking.

### IR-008 — `FACTORFLOW_LOG_LEVEL` from the design's variable table is unimplemented and unplanned

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: N/A
- **Files**: `src/factorflow/config/settings.py`
- **Claim challenged**: The story summary's "Both containers load all configuration through this module."
- **Observed evidence**: Component design section 2.2 lists `FACTORFLOW_LOG_LEVEL` (both processes, default `INFO`, sourced to SA-LOG-001). `grep -rn "LOG_LEVEL\|log_level" src/ tests/` returns nothing. No task in the plan covers it, and no story acceptance criterion names it.
- **Expected evidence/behavior**: Either a field on a settings model, or an explicit note assigning it to another story.
- **Impact**: None on this story's acceptance criteria — it is a plan-coverage gap against the design's variable table, surfaced so it is not lost. Rated LOW because no criterion this story owns depends on it.
- **Required remediation**: Add the field alongside the `configure_logging()` rework in IR-002 (natural, since that function is where the level would be applied), or record in the task plan's Notes which story owns it.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified.** `ApiSettings._reject_non_loopback_host` is not in the component design's section 2.3 snippet. The task plan flagged this gap in T015 and in its Notes before coding; DAC-E1-S3-4 and TC-COMP-326 both require active rejection. Correctly handled — the plan noted the gap rather than editing the approved design.
- **Justified.** T010's stub `RESTClient` was not written. The test module's docstring explains that the tests exercise `read_provider_credential()` and `credential_fingerprint()` directly and the stub would document nothing. Omitting unused scaffolding is the right call.
- **Justified.** `RedactingFilter.filter()` re-reads `message` inside the loop, which the design's snippet does not. This makes multiple secrets in one record compose correctly; without it the second secret would be matched against stale text. A strict improvement over the snippet.
- **Bookkeeping, benign.** T003's text was amended in-place to record the eighth test file (`test_credential_presence.py`), which the plan named in T009 but omitted from T003's list. Transparently annotated.
- **Bookkeeping, blocking.** T014, T019, T020 and T022 are checked complete against results the repository does not support (IR-001, IR-002).
- **In scope.** The story frontmatter moved `planning` → `in-review` and `updated` to 2026-09-07. Expected for this stage.
- **No scope leakage.** Every changed file traces to a task. Nothing under `src/factorflow/db/` was touched.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001, IR-002 and IR-003 (HIGH). Address IR-004, IR-005 and IR-006 (MEDIUM) or record an explicit rationale for deferring each. Re-run the full validation plan and correct the checked state of T011, T014, T019, T020 and T022 to match the evidence. Then rerun `$adversarial-review` against this tasks file for a v2 report.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED; no findings are accepted downstream.
