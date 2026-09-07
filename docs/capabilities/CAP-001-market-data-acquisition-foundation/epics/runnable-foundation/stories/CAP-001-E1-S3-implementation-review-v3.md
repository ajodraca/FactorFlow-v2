---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S3-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-07
updated: 2026-09-07
story_id: "CAP-001-E1-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-09-07T22:14:00Z"
reviewed_head: "d77342e6ffdb809a7ef9499ab80a1f7e0b671c43"
review_base: "50660cfb3951d2656264841e91c537e21b11f571"
reviewed_state_revision: "sha256:e4dbc0d11a3ccd5eb03c0fbe52042d0e3ec73f34a1435ff410c50803467a8752"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-07T22:14:00Z
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

# Implementation Review: CAP-001-E1-S3 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 22/22 verified |
| Required validation | 4/4 passed |

All five v2 findings are resolved against current repository evidence, and the
gate's blocking condition is cleared: `uv run pytest -m 'not postgres'` now
exits 0 with `97 passed, 27 deselected` at `d77342e`, where v1 and v2 both
exited 1. The other three required commands (`ruff check`, `ruff format
--check`, `mypy src`) also pass, with no tracked-file side effects.

The HIGH finding (v2/IR-001) was fixed structurally rather than by weakening
the detection pattern, which v2 explicitly ruled out. `test_no_committed_secrets.py`
now scopes the scan to an allowlist of locations where a real credential could
land (`src/`, `tests/`, `migrations/`, plus named manifest files) and excludes
`docs/`, so a future review report quoting a key-shaped fixture value cannot
re-trip it. This reviewer verified the guard is not merely quiet but still
live: writing `sk-massive-ABCDEFGHIJKLMNOP123` into a newly tracked
`src/factorflow/_leakprobe.py` made the test fail with
`key-shaped value found in: ['src/factorflow/_leakprobe.py']` (exit 1); the
probe file was then removed and the working tree confirmed clean. Two new
guard tests pin both halves of the fix — that this story's own shipped files
stay in scope, and that the `docs/` exclusion holds.

Every acceptance criterion was re-traced against the current tree by direct
probe rather than by reading test names: `repr`/`str`/`model_dump()`/
`model_dump_json()` of a loaded `Settings` leak nothing (all four `False`); a
`urllib3` warning formatting the raw credential after `configure_logging()`
emits `Authorization: Bearer [redacted]`; a rotated environment value produces
a different fingerprint in-process with no restart, and the fingerprint
contains no substring of the value; `FACTORFLOW_API_HOST=0.0.0.0` is rejected
at load; and absent required variables fail with
`FACTORFLOW_MASSIVE_API_KEY: Field required; FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE: Field required`.

Two LOW findings remain, both concerning the `FACTORFLOW_LOG_LEVEL` addition
made during this rework: an invalid level passes settings validation and
fails later inside `configure_logging()` with a raw `ValueError` rather than
the module's own `ConfigurationError` (IR-001), and `Settings.log_level` is
read by no production code, since `configure_logging()` reads the environment
variable directly (IR-002). Neither blocks an acceptance criterion, a required
task, or a required validation command; both are recorded for the next
touch of this module.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S3` |
| HEAD | `d77342e6ffdb809a7ef9499ab80a1f7e0b671c43` |
| Review base | `main` merge-base `50660cfb3951d2656264841e91c537e21b11f571` |
| Working tree | clean — no staged, unstaged, or untracked files before or after validation |
| Changed files reviewed | 17 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `pyproject.toml` | modified | T001; `pydantic-settings>=2` (v2/IR-003) |
| `uv.lock` | modified | T001; lock resync for the version floor |
| `src/factorflow/config/__init__.py` | added | T002 |
| `src/factorflow/config/settings.py` | added | T015, T016, T017, T019; `log_level` per v2/IR-005 |
| `src/factorflow/config/redaction.py` | added | T018 |
| `tests/unit/test_settings_required.py` | added | T005 (TC-COMP-298, 323) |
| `tests/unit/test_settings_secrecy.py` | added | T006 (TC-COMP-299, 013, 324) |
| `tests/unit/test_redaction.py` | added | T007 (TC-COMP-299, 325); log-level cases per v2/IR-005 |
| `tests/unit/test_settings_defaults.py` | added | T008, T013 (TC-COMP-014, 326) |
| `tests/unit/test_settings_validation.py` | added | T008, T011, T012 (TC-COMP-326); bounds cases per v2/IR-004 |
| `tests/unit/test_credential_presence.py` | added | T009 (TC-COMP-300, 327) |
| `tests/unit/test_credential_reload.py` | added | T010 (TC-COMP-301, 328) |
| `tests/unit/test_no_committed_secrets.py` | added | T014; scope fix per v2/IR-001 |
| `…/CAP-001-E1-S3.md` | modified | status `planning` → `in-review`; bookkeeping |
| `…/CAP-001-E1-S3-tasks.md` | modified | task checkboxes, `last_reworked_review`, Notes entry |
| `…/CAP-001-E1-S3-implementation-review-v1.md` | added | prior gate report; pipeline-required |
| `…/CAP-001-E1-S3-implementation-review-v2.md` | added | prior gate report; pipeline-required |

No file in the change set lacks a story or task justification. No dependency,
refactor, or behavior change outside the story's declared surface was found.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `settings.py:80,110` (`SecretStr`); `redaction.py:38-58`; `settings.py:219-268` (`configure_logging`) | `test_settings_secrecy.py` (8 cases); `test_redaction.py` (12 cases); `test_no_committed_secrets.py` (4 cases) | The repository half is now green and still live: reviewer's injected `sk-massive-…` in `src/` made the guard fail (exit 1). Log half probed directly — `urllib3` warning emits `Bearer [redacted]`. Serialisation half probed — `repr`/`str`/`model_dump`/`model_dump_json` all `False` for leakage. Resolves v2/IR-001. |
| AC-14 | SATISFIED | `settings.py:88` (default `127.0.0.1`), `:91-104` (`_reject_non_loopback_host`) | `test_settings_defaults.py:9-10`; `test_settings_validation.py:25-35,113-122` | Probe: `FACTORFLOW_API_HOST=0.0.0.0` raises `ConfigurationError` naming the variable and listing the allowed loopback set. |
| DAC-E1-7 | SATISFIED | `settings.py:38-74` (`_EnvNamedSettings`), `:28-35` (`ConfigurationError`) | `test_settings_required.py:13-52` (4 cases) | Probe with all `FACTORFLOW_*` cleared: `FACTORFLOW_MASSIVE_API_KEY: Field required; FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE: Field required` and `FACTORFLOW_DATABASE_URL: Field required`. Value absence asserted at `:40-52`. |
| DAC-E1-8 | SATISFIED | `redaction.py:38-58` (msg, `exc_info`, caller `extra` attrs) | `test_redaction.py:37-49,133-172` | Message, formatted traceback, and `extra` string attributes are all scrubbed. Carried forward as resolved from v1/IR-005; unchanged by this rework and re-confirmed green. |
| DAC-E1-9 | SATISFIED | `settings.py:209-216` (`credential_present`) | `test_credential_presence.py:17-47` (5 cases) | Reads `os.environ.get(...)` into a `bool` only; never constructs a settings object and never unwraps. An AST test at `:29-38` asserts no `get_secret_value` call in the body. |
| DAC-E1-10 | SATISFIED | `settings.py:189-206` (`read_provider_credential`, `credential_fingerprint`) | `test_credential_reload.py` (5 cases) | Probe: changing the env value between calls yields a different fingerprint in one process, no reimport. No module-level cache exists. |
| DAC-E1-S3-1 | SATISFIED | `settings.py:81-82,89,112-121,127-129` (bounds); `:152-186` (invariants) | `test_settings_validation.py:25-148` (28 cases) | Invariants 1–3 tested at the exact boundary; invariant 4 covers both non-positive and the sub-one-second floor. Bound rejection for `requests_per_minute=0` and `max_attempts=0` added at `:135-148`, closing v2/IR-004. |
| DAC-E1-S3-2 | SATISFIED | `settings.py:80` (`url: SecretStr`), `:110` (`api_key: SecretStr`) | `test_settings_secrecy.py` (8 cases) | Reviewer probe across all four serialisation surfaces returned `False` for leakage on a loaded top-level `Settings`, not only on the sub-models the tests exercise. |
| DAC-E1-S3-3 | SATISFIED | `settings.py:259-268` (class-level patch of `logging.Handler.handle`); `redaction.py:38-58` | `test_redaction.py:79-130,175-199` | Third-party logger name, handler-attached-after, and non-propagating-child paths each covered by a test that fails against the pre-fix implementation. Reviewer reproduced the third-party probe: `[redacted]`. |
| DAC-E1-S3-4 | SATISFIED | `settings.py:91-104` | `test_settings_defaults.py:9-10`; `test_settings_validation.py:25-35` | Default and active rejection both present; the validator is the gap-fill T015 flagged against the design's illustrative snippet. |
| DAC-E1-S3-5 | SATISFIED | `settings.py:209-216` | `test_credential_presence.py:29-38` | Boolean derived from presence; the value never enters a return path. |
| DAC-E1-S3-6 | SATISFIED | `settings.py:199-206` (`credential_fingerprint`, truncated SHA-256) | `test_credential_reload.py` (5 cases) | Fingerprint of a known value contains no substring of it (probed), is stable for an unchanged value, and changes on rotation. Client rebuild itself is `acquisition-runner`'s wiring, correctly scoped out by the plan's Notes. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml:12` (`pydantic-settings>=2`); `uv.lock:266` | Version floor added during this rework, closing v2/IR-003. |
| T002 | complete | VERIFIED | `src/factorflow/config/__init__.py` | Empty package marker present. |
| T003 | complete | VERIFIED | eight `tests/unit/test_*.py` files | All seven named files plus `test_credential_presence.py` exist and are populated. |
| T004 | complete | VERIFIED | `tests/conftest.py`; `src/` layout on branch | Confirmed present; suite collects and runs. |
| T005 | complete | VERIFIED | `test_settings_required.py:13-52` | Three required variables plus the value-absence case. |
| T006 | complete | VERIFIED | `test_settings_secrecy.py` (8 cases) | All four serialisation surfaces asserted. |
| T007 | complete | VERIFIED | `test_redaction.py:37-49,79-105` | Includes a `urllib3`-named third-party logger case. |
| T008 | complete | VERIFIED | `test_settings_defaults.py:9-10`; `test_settings_validation.py:25-35` | Default and rejection both covered. |
| T009 | complete | VERIFIED | `test_credential_presence.py:17-47` | Includes the AST no-unwrap assertion. |
| T010 | complete | VERIFIED | `test_credential_reload.py` (5 cases) | Stub client per the plan's documented scoping. |
| T011 | complete | VERIFIED | `test_settings_validation.py:38-110` | Invariants 1–4, boundary-exact; invariant 2 asserts the computed `660` appears in the message. |
| T012 | complete | VERIFIED | `test_settings_validation.py:113-133` | Port 1–65535 and pool bounds. |
| T013 | complete | VERIFIED | `test_settings_defaults.py:26-54` | Canonical timing set asserted verbatim. |
| T014 | complete | **VERIFIED** | `test_no_committed_secrets.py` (4 cases) | Was PARTIAL in v2 because the test was red. Now green **and** proven still-live by the reviewer's injected-leak probe (exit 1, offender named). Two added guard tests pin the scope fix. Resolves v2/IR-001. |
| T015 | complete | VERIFIED | `settings.py:77-186` | All five models plus `_check_timing_invariants` and the loopback validator. |
| T016 | complete | VERIFIED | `settings.py:189-206` | Re-read per call; no module-level cache; truncated SHA-256. |
| T017 | complete | VERIFIED | `settings.py:209-216` | Presence-only. |
| T018 | complete | VERIFIED | `redaction.py:17-58` | Broader than the design snippet (traceback + `extra`); justified below. |
| T019 | complete | VERIFIED | `settings.py:219-268` | Class-level `Handler.handle` patch, idempotent; now also sets the root level. |
| T020 | complete | **VERIFIED** | `uv run pytest -m 'not postgres'` → exit 0, `97 passed` | Was PARTIAL in v2 against a red suite. Substantiated by the reviewer's own run. |
| T021 | complete | VERIFIED | `settings.py:38-74`; tasks-file T021 narrative | The recorded "no code change required" conclusion was re-probed: a malformed sibling field alongside a set credential produces no substring of the credential. |
| T022 | complete | **VERIFIED** | four commands, all exit 0 | Was PARTIAL in v2. All four required commands rerun independently by this reviewer. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_settings_required.py` / TC-COMP-298, 323 | ADEQUATE | Asserts the full `FACTORFLOW_`-prefixed variable name in the failure text for three variables, so removing `_EnvNamedSettings` fails them rather than passing vacuously on the field name. `test_malformed_present_credential_never_echoes_the_value` supplies a real value and asserts its absence. | None. |
| `test_settings_secrecy.py` / TC-COMP-299(partial), 013, 324 | ADEQUATE | Four serialisation surfaces across both secret-bearing models; asserts substring absence of a known fixture value rather than equality against a redaction marker, so a partial leak fails. | None. |
| `test_redaction.py` / TC-COMP-299(partial), 325 | ADEQUATE | Twelve cases: message, `exc_info` traceback asserted against `Formatter().format(record)` rather than the raw attribute, `extra` attributes, third-party logger name, handler-added-after, non-propagating child. The last two fail against the pre-v2 implementation, which is the regression sensitivity the gate wants. Two new cases assert the root level under a set and an unset `FACTORFLOW_LOG_LEVEL`, each restoring the original level in a `finally`. | None. |
| `test_settings_defaults.py` / TC-COMP-014, 326(default half) | ADEQUATE | Loopback default with no environment; canonical timing set verbatim; `max_attempts` 3. Log-level default and override cases added. | None. |
| `test_settings_validation.py` / TC-COMP-326(rejection half), invariants | ADEQUATE | Invariants tested at the exact boundary (`180` vs `60×3`, `660` vs computed `660`, `900` vs `900`), so an off-by-one from `<=` to `<` fails them. Invariant 2 asserts the computed threshold appears in the message. The two bound cases the design's section 7 names — `requests per minute 0` and `attempts 0` — are now exercised at `:135-148`, closing v2/IR-004. | None. |
| `test_credential_presence.py` / TC-COMP-300, 327 | ADEQUATE | Set/unset/empty-string tri-state, an AST assertion that the body calls no `get_secret_value`, and an environment-reflects-change case ruling out an import-time snapshot. | None. |
| `test_credential_reload.py` / TC-COMP-301, 328 | ADEQUATE | Rotation observable, unchanged value stable, fingerprint contains no substring of the value, no module-level caching. Stub client is the correct boundary given `massive-client` does not exist in this repository. | None. |
| `test_no_committed_secrets.py` | ADEQUATE | Scans `git ls-files` rather than the working tree, handles binary and unreadable files, names offenders in the assertion. The scope narrowing is itself guarded by two tests: `test_scanned_scope_still_covers_this_story_own_files` and `test_scanned_scope_excludes_docs`. Reviewer confirmed the guard still fires on a real in-scope leak. | MINOR: the allowlist form means paths outside `src/`, `tests/`, `migrations/` and four named files — `README.md`, `design-system/**`, and any future top-level script or compose file — are unscanned, which is broader than the `docs/` exclusion the code comment describes. See IR-002's sibling note in Scope and Plan Deviations. Not a finding against a named requirement; the design's section 7 row is satisfied for every location a credential is plausibly written by this component. |

All tests are isolated and deterministic: every environment mutation goes
through `monkeypatch`, `configure_logging` tests restore the root level in a
`finally`, and no test touches the network, the clock, or a container. Suite
runtime 0.15s across 97 selected tests, consistent with no hidden I/O.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `97 passed, 27 deselected in 0.15s` (124 collected). Exited 1 in both v1 and v2. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!` |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `41 files already formatted` |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 9 source files` |

Additional reviewer probes, beyond the task plan's commands:

- **v2/IR-001 injected-leak probe** — wrote `sk-massive-ABCDEFGHIJKLMNOP123`
  into a newly `git add -N` tracked `src/factorflow/_leakprobe.py`;
  `test_no_committed_secrets.py` failed, exit 1, offender named. File removed
  from the index and deleted; `git status --porcelain` empty afterwards.
- **Scope-coverage probe** — enumerated `_in_scanned_scope()` over every
  tracked path: `src/`, `tests/`, `migrations/`, `pyproject.toml`, `uv.lock`,
  `Dockerfile`, `.gitignore` in scope; `docs/`, `README.md`,
  `design-system/**` out.
- **AC-13 serialisation and log probe** — `repr`/`str`/`model_dump`/
  `model_dump_json` leakage all `False`; `urllib3` warning emitted
  `Authorization: Bearer [redacted]`.
- **DAC-E1-7 probe** — all `FACTORFLOW_*` cleared →
  `FACTORFLOW_MASSIVE_API_KEY: Field required; FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE: Field required`.
- **DAC-E1-10 probe** — fingerprint differs across a rotated value in one
  process; fingerprint contains no substring of the value.
- **AC-14 probe** — `FACTORFLOW_API_HOST=0.0.0.0` → `ConfigurationError`.
- **IR-001 log-level probe** — `FACTORFLOW_LOG_LEVEL=NOT_A_LEVEL` loads
  `Settings` successfully (`log_level == 'NOT_A_LEVEL'`), then
  `configure_logging()` raises `ValueError: Unknown level: 'NOT_A_LEVEL'`.

### Validation Side Effects

- Before: clean working tree at `d77342e`; `git status --porcelain` empty.
- After: clean working tree at `d77342e`; `git status --porcelain` empty.
- Unexpected tracked-file changes: none. The one reviewer-created file
  (`src/factorflow/_leakprobe.py`, for the injected-leak probe) was removed
  from the index and deleted, and the empty status was re-confirmed.

## Findings

### IR-001 — An invalid `FACTORFLOW_LOG_LEVEL` passes settings validation and fails later outside the module's own error contract

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (no AC governs log level; DAC-E1-7 governs required values, and `FACTORFLOW_LOG_LEVEL` is optional)
- **Tasks**: T019 (as extended during v2/IR-005 rework)
- **Files**: `src/factorflow/config/settings.py:150` (`log_level: str = "INFO"`), `:257` (`logging.getLogger().setLevel(os.environ.get(_LOG_LEVEL_VAR, "INFO"))`)
- **Claim challenged**: that the `FACTORFLOW_LOG_LEVEL` addition made during this rework is validated on the same terms as every other setting in this module.
- **Observed evidence**: reviewer probe with `FACTORFLOW_LOG_LEVEL=NOT_A_LEVEL` set alongside a valid environment: `Settings(_env_file=None)` loads successfully and reports `log_level == 'NOT_A_LEVEL'`; the subsequent `configure_logging()` raises `ValueError: Unknown level: 'NOT_A_LEVEL'` from `logging`, not the module's `ConfigurationError`, and the message names neither the environment variable nor the fact that it is a FactorFlow setting. `log_level` is declared as a bare `str` with no enum, `Literal`, or validator.
- **Expected evidence/behavior**: this module's own stated contract — `ConfigurationError`'s docstring at `settings.py:28-35` ("every message names the environment variable a process operator would actually set") and `_EnvNamedSettings`'s purpose — is that a bad value fails at load with a message naming `FACTORFLOW_LOG_LEVEL`. Every other constrained setting in the file follows that pattern (`ge=`/`le=` bounds, the loopback validator, the timing invariants).
- **Impact**: a typo in the log level produces a `ValueError` from the standard library at the moment logging is configured, rather than a settings-load failure naming the variable. The failure is still loud and still at start, which is why this is LOW rather than blocking — no credential is exposed and no acceptance criterion is missed.
- **Required remediation**: constrain `Settings.log_level` to the accepted level names (a `Literal` or a field validator) so an invalid value raises `ConfigurationError` naming `FACTORFLOW_LOG_LEVEL` at load, and add a case to `tests/unit/test_settings_validation.py` asserting the rejection. Alternatively, record an explicit deferral rationale in the task plan's Notes.

### IR-002 — `Settings.log_level` is read by no production code

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T019 (as extended during v2/IR-005 rework)
- **Files**: `src/factorflow/config/settings.py:150`, `:257`
- **Claim challenged**: the rework commit's statement that `FACTORFLOW_LOG_LEVEL` was "added as `Settings.log_level` … **and** wired into `configure_logging()`", implying one path.
- **Observed evidence**: `grep -n "log_level\|_LOG_LEVEL_VAR" src/factorflow/config/settings.py` returns exactly three lines — the constant at `:25`, the field at `:150`, and `:257`, which reads `os.environ.get(_LOG_LEVEL_VAR, "INFO")` directly rather than the field. `grep -rn "log_level" src` finds no other reader; `Settings` is constructed nowhere in `src/` (only in tests). The field and the applied value are therefore two independent reads of the same variable, and only the second one takes effect.
- **Expected evidence/behavior**: the component design's section 2.2 lists `FACTORFLOW_LOG_LEVEL` as one configuration variable, and this module is described in its own docstring as the single place both containers load configuration through. One variable should have one authoritative accessor.
- **Impact**: `Settings.log_level` is currently dead as far as behavior is concerned — `test_default_log_level_is_info` and `test_log_level_overridden_from_environment` assert a field that nothing consumes, so they would keep passing if the field diverged from what `configure_logging()` actually applies. Low impact today because both read the same variable with the same default; the risk is drift once one of them is changed. Also note this is the reason IR-001 is possible: a validator on the field would not currently protect `configure_logging()`.
- **Required remediation**: have `configure_logging()` obtain the level from the settings model (or drop the unused field and keep the direct environment read as the single accessor), so the tested value and the applied value are the same one. If the split is deliberate — for example to keep `configure_logging()` callable before a `Settings` instance exists — record that rationale in the code and in the task plan's Notes.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (HIGH) — required test suite still fails; the repository-secret guard is red because the committed v1 review report quotes the `sk-massive-*` fixture literals | **RESOLVED** | `uv run pytest -m 'not postgres'` now exits 0 (`97 passed, 27 deselected`), rerun by this reviewer at `d77342e`. The fix is structural, not a pattern narrowing (which v2 ruled out): `test_no_committed_secrets.py:18-36` adds `_SCANNED_PREFIXES = ("src/", "tests/", "migrations/")` and `_SCANNED_FILES = {"pyproject.toml", "uv.lock", "Dockerfile", ".gitignore"}`, and `:60` filters `_tracked_files()` through `_in_scanned_scope()`. `KEY_SHAPE` at `:16` is unchanged. Verified still-live rather than merely quiet: a `sk-massive-ABCDEFGHIJKLMNOP123` written into a newly tracked `src/factorflow/_leakprobe.py` made the test fail, exit 1, `key-shaped value found in: ['src/factorflow/_leakprobe.py']`; probe removed and tree confirmed clean. Two new guard tests (`:75-92`) pin both directions of the scope. A future review report quoting a key-shaped value cannot re-trip it. |
| v2/IR-002 (MEDIUM) — T014, T020, T022 checked against a red suite | **RESOLVED** | The claims are now substantiated rather than merely still checked. T014's deliverable is green and proven live (above). T020's checkpoint verified by this reviewer's own `pytest` run, exit 0. T022's checkpoint verified by rerunning all four required commands independently: `pytest` 0, `ruff check` 0, `ruff format --check` 0, `mypy src` 0. |
| v2/IR-003 (LOW) — `pydantic-settings` declared without a version constraint | **RESOLVED** | `pyproject.toml:12` now reads `"pydantic-settings>=2"`, matching the sibling `psycopg[binary]>=3` style. `uv.lock:266` resynced to `{ name = "pydantic-settings", specifier = ">=2" }`. Confirmed by `git show d77342e -- pyproject.toml uv.lock`. |
| v2/IR-004 (LOW) — the design's "requests per minute 0 and attempts 0" bounds rows unexercised | **RESOLVED** | `test_settings_validation.py:135-141` (`test_requests_per_minute_zero_rejected`) and `:143-148` (`test_max_attempts_zero_rejected`) each set the variable to `0` and assert `ConfigurationError`. Both cited the design's section 7 row in their docstrings and both pass in the reviewer's run. The `ge=1` constraints they cover are at `settings.py:112-113`. |
| v2/IR-005 (LOW) — `FACTORFLOW_LOG_LEVEL` unimplemented and unassigned | **RESOLVED**, with two new LOW findings | The variable is now implemented: `settings.py:25` (`_LOG_LEVEL_VAR`), `:150` (`Settings.log_level`, default `INFO`), `:257` (root level applied in `configure_logging()`), with four tests (`test_settings_defaults.py:13-29`, `test_redaction.py:201-233`). The task plan's Notes records the addition. The finding as stated — unimplemented and unassigned — is closed. The implementation introduced two new LOW issues raised fresh in this report as IR-001 (no validation of the level string) and IR-002 (`Settings.log_level` read by no production code); neither existed to be found in v2. |

## Scope and Plan Deviations

- **Justified.** `ApiSettings._reject_non_loopback_host` (`settings.py:91-104`) and `MassiveSettings.timeout_seconds`'s `ge=1` (`:119`) both exceed the component design's illustrative section 2.3 snippet. Each is required by a named acceptance criterion (DAC-E1-S3-4 / TC-COMP-326, and section 2.2a invariant 4 respectively), each is flagged in the task plan's Notes or in a code comment, and the design document itself was correctly left unmodified. Unchanged from v2's assessment.
- **Justified.** `RedactingFilter` (`redaction.py:38-58`) covers `exc_info` and caller-supplied `extra` attributes, which section 2.5's snippet does not. This resolved v1/IR-005 and strengthens a security boundary; the surrounding prose ("Replace known secret values anywhere in a formatted log record") supports the broader reading. A note to the design owner remains appropriate.
- **Justified, with a scope note.** The `test_no_committed_secrets.py` allowlist is the v2/IR-001 fix and is sound for its purpose. Two observations for the design owner rather than findings against this story: (a) the code comment at `:18-30` describes the change as excluding `docs/`, but the allowlist form actually excludes everything outside four prefixes and four named files — `README.md`, `design-system/**`, and any future top-level script or compose file are unscanned; (b) the component design's section 7 row states "No tracked file contains a value matching the provider key shape", which the scoped scan no longer literally implements. Neither is raised as a finding: the design's intent (SEC-SEC-001, no committed credential) is met for every location this component writes a credential to, the narrowing is deliberate and documented, and the guard is proven to still fire. Worth revisiting if this repository later grows a top-level deployment or compose file.
- **Bookkeeping: consistent.** All 22 tasks are checked and all 22 are independently verified in this review. The tasks file's `last_reworked_review` correctly points at `CAP-001-E1-S3-implementation-review-v2.md`, and the Notes entry recording the `FACTORFLOW_LOG_LEVEL` addition matches the code. The story's `status: in-review` is correct for a story awaiting this gate.
- **Noted.** The committed v1 and v2 review reports are pipeline-required artifacts, not defects. They are no longer the cause of a failing guard.
- **No scope leakage.** Every changed file traces to a task or is a pipeline-required artifact. No unrelated refactor, no debug artifact, no dependency change beyond the one planned in T001.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to `$doc-sync` for CAP-001-E1-S3. Both LOW findings (IR-001, IR-002) concern the `FACTORFLOW_LOG_LEVEL` field added during this rework and are accepted downstream; fix them on the next touch of `src/factorflow/config/settings.py`, or record an explicit deferral rationale in the task plan's Notes. Neither requires a rework cycle or a further review before Doc Sync.
- **Warnings accepted downstream**: IR-001 (LOW), IR-002 (LOW)
