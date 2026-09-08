---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-07
updated: 2026-09-07
story_id: "CAP-001-E1-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-07T20:29:30Z"
reviewed_head: "f9457ea445777dd006b03a1e654c8edf7bca4672"
review_base: "50660cfb3951d2656264841e91c537e21b11f571"
reviewed_state_revision: "sha256:27506c396b08fe52395771de16974aa8c13bb33ca9b524149dbbeec8cb17f1d3"
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
  timestamp: 2026-09-07T20:29:30Z
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

# Implementation Review: CAP-001-E1-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 3 |
| Acceptance criteria | 11/12 satisfied |
| Planned tasks | 19/22 verified |
| Required validation | 3/4 passed |

The rework is substantially successful. Five of the six blocking and
near-blocking findings from v1 are genuinely resolved, verified by
re-running v1's exact probes against the current tree: `configure_logging()`
now patches `logging.Handler.handle` at the class level and redacts records
from handlers attached after it runs, from non-propagating child loggers, and
from third-party logger names (IR-002); `timeout_seconds` carries `ge=1` and
rejects `0.5` (IR-003); `_EnvNamedSettings` translates Pydantic field paths
into `FACTORFLOW_`-prefixed variable names so a missing credential now fails
with `FACTORFLOW_MASSIVE_API_KEY: Field required` (IR-004); `RedactingFilter`
scrubs `exc_info` tracebacks and caller-supplied string attributes (IR-005);
and a value-absence test was added (IR-006). The implementation quality of
these fixes is high and each is backed by a test that would fail if the fix
were reverted.

The gate nevertheless fails on the same requirement as v1: **`uv run pytest -m
'not postgres'` still exits 1**. IR-001's original cause was correctly removed
— the `sk-massive-` fixture literals were replaced with
`TEST-FIXTURE-CREDENTIAL-*` — but the same test now fails for a new reason
introduced by the rework itself. Committing
`CAP-001-E1-S3-implementation-review-v1.md` added a tracked file whose
finding text quotes the two original `sk-massive-…` literals verbatim, and the
scanner matches them there. This is not a cosmetic recurrence: the guard
standing behind AC-13's "appears in no repository file" is red, so a genuinely
committed key would be indistinguishable from this known failure, and the
structural problem is now durable — every future review report that quotes a
key-shaped value will re-break the same test.

Because a required constitution-defined validation command demonstrably fails,
the verdict is CHANGES-REQUIRED per the skill's verdict rules, notwithstanding
the strength of the rest of the rework.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S3` |
| HEAD | `f9457ea445777dd006b03a1e654c8edf7bca4672` |
| Review base | merge-base with `main`: `50660cfb3951d2656264841e91c537e21b11f571` |
| Working tree | clean — no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 16 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `pyproject.toml` | modified | T001 (`pydantic-settings` dependency) |
| `uv.lock` | modified | T001 (resolved lock for the new dependency) |
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
| `…/CAP-001-E1-S3.md` | modified | story status `planning` → `in-review`; expected at this stage |
| `…/CAP-001-E1-S3-tasks.md` | modified | task checkboxes, `updated`, `last_reworked_review` |
| `…/CAP-001-E1-S3-implementation-review-v1.md` | added | prior gate report; see IR-001 |

No unjustified files. Nothing outside `src/factorflow/config/`, `tests/unit/`,
the dependency manifests, and this story's own documents was touched.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | PARTIAL | `settings.py:79,109` (`SecretStr`); `redaction.py:38-58`; `settings.py:211-256` | `test_settings_secrecy.py` (8 cases); `test_redaction.py` (10 cases); `test_no_committed_secrets.py` | Every mechanism is implemented and independently verified. The "appears in no repository file" half is enforced by a test that currently **fails** (IR-001), so the criterion is not fully evidenced by a green gate. |
| AC-14 | SATISFIED | `settings.py:87` (default `127.0.0.1`), `:90-103` (`_reject_non_loopback_host`) | `test_settings_defaults.py:8-10`; `test_settings_validation.py:19-29` | Probe: `FACTORFLOW_API_HOST=0.0.0.0` raises `ConfigurationError` naming the variable. Both default and active rejection covered, positive and negative. |
| DAC-E1-7 | SATISFIED | `settings.py:37-73` (`_EnvNamedSettings`), `:27-34` (`ConfigurationError`) | `test_settings_required.py:13-52` (4 cases) | Reviewer probe with the key absent produced exactly `FACTORFLOW_MASSIVE_API_KEY: Field required`. Resolved from v1's IR-004. Value-absence now asserted at `:40-52`. |
| DAC-E1-8 | SATISFIED | `redaction.py:38-58` (msg, `exc_info`, `extra` attrs) | `test_redaction.py:37-49, 133-172` | Reviewer probes: formatted traceback and `record.api_key` both scrubbed (`False` for both leak checks). Resolved from v1's IR-005. |
| DAC-E1-9 | SATISFIED | `settings.py:201-208` (`credential_present`) | `test_credential_presence.py` (5 cases) | Reads `os.environ` presence only. AST test at `:29-38` statically proves no `get_secret_value()` call in the body — a genuine structural assertion, not a naming check. |
| DAC-E1-10 | SATISFIED | `settings.py:181-198` (`read_provider_credential`, `credential_fingerprint`) | `test_credential_reload.py` (5 cases) | No module-level caching; rotation observable without reimport. Client rebuild itself is correctly deferred to `acquisition-runner` per the plan's Notes. |
| DAC-E1-S3-1 | SATISFIED | `settings.py:80-81,88,111-128` (bounds), `:144-178` (invariants) | `test_settings_validation.py:32-127` | Invariant 4's one-second floor now holds for timeout, heartbeat and poll interval. Probe: `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS=0.5` rejected. Resolved from v1's IR-003. |
| DAC-E1-S3-2 | SATISFIED | `settings.py:79,109` (`SecretStr`) | `test_settings_secrecy.py:35-60` | `repr`, `str`, `model_dump()`, `model_dump_json()` all asserted for both models. |
| DAC-E1-S3-3 | SATISFIED | `settings.py:211-256` (`configure_logging`); `redaction.py:38-58` | `test_redaction.py:79-130, 175-199` | Reviewer reproduced v1's exact leak probe (`configure_logging()` then `basicConfig()` then `urllib3` warning): now emits `Bearer [redacted]`. Handler-added-after and non-propagating-child cases are covered by tests that fail against the v1 implementation. Resolved from v1's IR-002. |
| DAC-E1-S3-4 | SATISFIED | `settings.py:90-103` | `test_settings_validation.py:19-29` | Three non-loopback and three loopback hosts parametrized. |
| DAC-E1-S3-5 | SATISFIED | `settings.py:201-208` | `test_credential_presence.py:29-38` | Boolean derived from presence; empty string correctly reports `False`. |
| DAC-E1-S3-6 | SATISFIED | `settings.py:191-198` (`credential_fingerprint`) | `test_credential_reload.py:32-69` | Fingerprint is a truncated SHA-256; the substring test at `:52-59` checks every 4-char window of the value, which is a real assertion rather than a token equality check. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml:12`; `uv.lock` | Dependency present and resolved. Declared without a version bound — see IR-002 (LOW). |
| T002 | complete | VERIFIED | `src/factorflow/config/__init__.py` | Empty package marker as specified. |
| T003 | complete | VERIFIED | eight files under `tests/unit/` | All eight named files exist and carry real tests. |
| T004 | complete | VERIFIED | `tests/conftest.py` | Present; this story adds no `postgres`-marked tests, consistent with the plan. |
| T005 | complete | VERIFIED | `test_settings_required.py:13-52` | Three missing-variable cases plus the value-absence case added in rework. All four assert the full `FACTORFLOW_`-prefixed name. |
| T006 | complete | VERIFIED | `test_settings_secrecy.py` | Both models, four serialisation forms each. |
| T007 | complete | VERIFIED | `test_redaction.py:37-49` | Own-logger and third-party-style logger name both covered. |
| T008 | complete | VERIFIED | `test_settings_defaults.py:8-10`; `test_settings_validation.py:19-29` | Both halves (default and rejection) present. |
| T009 | complete | VERIFIED | `test_credential_presence.py` | Includes the AST check the task explicitly requires. |
| T010 | complete | VERIFIED | `test_credential_reload.py` | Stub client omitted; deviation justified in the module docstring and the plan's Notes. |
| T011 | complete | VERIFIED | `test_settings_validation.py:32-101` | Invariants 1–4 covered, including the sub-one-second floor cases added in rework at `:84-101`. |
| T012 | complete | VERIFIED | `test_settings_validation.py:104-127` | Port bounds (in and out of range) and both pool bounds. |
| T013 | complete | VERIFIED | `test_settings_defaults.py:13-37` | All seven canonical values asserted. |
| T014 | complete | **PARTIAL** | `test_no_committed_secrets.py` | The test exists and is well-constructed, but it **fails** in the reviewed tree (IR-001). A task whose deliverable is a red guard is not complete. |
| T015 | complete | VERIFIED | `settings.py:76-178` | All five models plus the invariant validator and the loopback validator. |
| T016 | complete | VERIFIED | `settings.py:181-198` | Re-reads `os.environ` per call; SHA-256 truncated to 16 chars. |
| T017 | complete | VERIFIED | `settings.py:201-208` | Presence only. |
| T018 | complete | VERIFIED | `redaction.py:17-58` | Extended beyond the design snippet to cover `exc_info` and `extra`; a justified strengthening (see Deviations). |
| T019 | complete | VERIFIED | `settings.py:211-256` | Class-level `Handler.handle` patch. Reviewer confirmed idempotence across three consecutive calls and correct redaction after each. Resolved from v1. |
| T020 | complete | **NOT IMPLEMENTED** | — | "Run the full Phase 2 test suite … and fix any mismatch." The suite does not pass in the reviewed tree; the checkpoint this task asserts is unmet. |
| T021 | complete | VERIFIED | `settings.py:37-73`; annotation in the tasks file | The rework replaced the "no code change required" conclusion with an actual mechanism. Reviewer probe confirmed a nested `Settings` failure with a valid credential present leaks no part of it. |
| T022 | complete | **NOT IMPLEMENTED** | — | "Run the complete validation plan and confirm every command passes." One of four required commands fails. The commit message's claim of "116/116 tests" green is contradicted by the repository. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_settings_required.py` / TC-COMP-298, TC-COMP-323 | ADEQUATE | Asserts the full environment-variable name appears in the failure text for three distinct required variables. The rework tightened these from `"api_key" in message.lower()` — which the field name satisfied vacuously — to the full `FACTORFLOW_`-prefixed string, so the test now fails if `_EnvNamedSettings` is removed. `test_malformed_present_credential_never_echoes_the_value` supplies a genuinely present value and asserts its absence, closing v1's IR-006. | None. |
| `test_settings_secrecy.py` / TC-COMP-013, 299(partial), 324 | ADEQUATE | Eight cases across two models and four rendering forms. Regression-sensitive: changing either field from `SecretStr` to `str` fails four of them. | None. |
| `test_redaction.py` / TC-COMP-299(partial), 325 | ADEQUATE | Ten cases. The three `configure_logging` tests are the strongest addition: `…handler_added_after_it_runs` and `…non_propagating_child_logger` both fail against the v1 implementation (reviewer confirmed the v1 defect independently), so they are true regression guards rather than tests written to pass. The `exc_info` case asserts against `Formatter().format(record)` — the real emission path — not the raw attribute. The `extra`-attribute case checks the scrubbed attribute directly. `test_empty_secret_values_are_ignored` correctly guards the empty-string-matches-everything failure mode. | None. |
| `test_settings_defaults.py` / TC-COMP-014, 326(default half) | ADEQUATE | Explicitly `delenv`s each variable before asserting the default, so an ambient environment cannot make the test pass spuriously. | None. |
| `test_settings_validation.py` / TC-COMP-326(rejection half), invariants | ADEQUATE | Invariants 1–3 are tested at the exact boundary (`180` against `60×3`, `660` against a computed `660`, `900` against `900`), which is stronger than testing a comfortably-violating value — an off-by-one from `<=` to `<` fails them. Invariant 2 asserts the computed threshold `660` appears in the message, matching the design's requirement that the message state the worst case. Invariant 4 covers both the non-positive and the sub-one-second floors. | MINOR: the design's section 7 "Bounds are enforced" row names `requests per minute 0 and attempts 0` among the values that must raise; neither is exercised (`FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` appears only as a valid `60` in the fixture). The `ge=1` constraints are present in code at `settings.py:111-112`, so this is untested-but-correct behavior. See IR-004 (LOW). |
| `test_credential_presence.py` / TC-COMP-300, 327 | ADEQUATE | The AST-based `test_no_code_path_unwraps_the_secret` is a genuine structural assertion about the function body rather than a naming convention check, and would catch a refactor that routed presence through a settings object. Empty-string and re-read cases both present. | None. |
| `test_credential_reload.py` / TC-COMP-301, 328 | ADEQUATE | The fingerprint substring test slides a 4-character window across the whole value rather than checking only full-string containment, which is the assertion that would actually catch a truncated-plaintext "fingerprint". | None. |
| `test_no_committed_secrets.py` | **FAILING** | Well-constructed: scans `git ls-files` output rather than the working tree, handles binary and unreadable files, and reports offending paths in the assertion message. The pattern is deliberately tight, which the module docstring correctly identifies as the source of its value. | **The test fails in the reviewed tree** (IR-001). The failure is a false positive against a documentation file, but a guard that is red provides no signal. |

All tests are isolated and deterministic: every one that touches the
environment uses `monkeypatch`, and the `configure_logging` tests remove their
handlers in `finally` blocks. No network, no clock, no ordering dependence
observed. The suite completes in 0.19s.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 1 | **FAIL** | `1 failed, 88 passed, 27 deselected`. Failure: `test_no_committed_secrets.py::test_no_tracked_file_contains_a_key_shaped_value` — `key-shaped value found in: ['docs/…/CAP-001-E1-S3-implementation-review-v1.md']`. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!` |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `41 files already formatted` |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 9 source files` |

Reviewer probes (read-only, run via `uv run python` on scratch scripts outside
the repository; no repository file created or modified):

- v1/IR-002 leak reproduction — `configure_logging()`, then
  `logging.basicConfig(level=DEBUG)`, then
  `logging.getLogger("urllib3").warning("Bearer LEAKY-KEY-VALUE")` →
  emitted `WARNING:urllib3:Bearer [redacted]`. v1 emitted the value verbatim.
- v1/IR-003 — `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS=0.5` →
  `ConfigurationError: FACTORFLOW_MASSIVE_TIMEOUT_SECONDS: Input should be
  greater than or equal to 1`. v1 accepted it.
- v1/IR-004 — `FACTORFLOW_MASSIVE_API_KEY` absent →
  `'FACTORFLOW_MASSIVE_API_KEY: Field required'`. v1 named only `api_key`.
- v1/IR-005 — formatted `exc_info` traceback leak check: `False`;
  `record.api_key` leak check: `False`. Both were `True` in v1.
- Idempotence — three consecutive `configure_logging()` calls followed by a
  warning: redacted correctly, `logging.Handler._unfiltered_handle` set once,
  no recursive wrapping.
- Nested failure path — `Settings` construction failing on
  `FACTORFLOW_API_HOST` with a valid credential present: message contains no
  substring of the credential.

### Validation Side Effects

- Before: `git status --porcelain` empty (clean tree at `f9457ea`).
- After: `git status --porcelain` empty.
- Unexpected tracked-file changes: none. No validation command or probe
  modified a tracked file.

## Findings

### IR-001 — The required test suite still fails; the repository-secret guard is red for a new reason introduced by the rework

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: AC-13
- **Tasks**: T014, T020, T022
- **Files**: `tests/unit/test_no_committed_secrets.py:16,40-53`; `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-implementation-review-v1.md:227`
- **Claim challenged**: The rework commit message — "Full suite green: 116/116 tests (including the postgres-marked suite…), ruff check, ruff format --check, mypy src" — and the still-checked T014, T020 and T022 boxes with their Phase 4 and Phase 5 checkpoints.
- **Observed evidence**: `uv run pytest -m 'not postgres'` exits 1 in the reviewed tree at `f9457ea`: `1 failed, 88 passed, 27 deselected`. The assertion reads `key-shaped value found in: ['docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-implementation-review-v1.md']`. `grep -rn "sk-massive-"` over the tracked tree returns exactly two hits: the scanner's own pattern at `test_no_committed_secrets.py:16`, and line 227 of the committed v1 review report, which quotes `sk-massive-leaked-credential-xyz789` and `sk-massive-test-credential-abc123` verbatim inside IR-001's own evidence text. The v1 fixture literals themselves were correctly replaced with `TEST-FIXTURE-CREDENTIAL-*` (`test_redaction.py:17`, `test_settings_secrecy.py:15`), so the original cause is gone; the same commit that fixed it added a new tracked file carrying the same literals.
- **Expected evidence/behavior**: The task plan's Validation Plan lists `uv run pytest -m 'not postgres'` as a constitution-defined command, and the Phase 4 and Phase 5 checkpoints require it green. The skill's verdict rules require every required validation command to pass for a passing gate.
- **Impact**: The guard standing behind AC-13's "appears in no repository file" is red, so a genuinely committed key would be indistinguishable from this known-failing state — the same functional impact as v1, reached by a different route. It is now also structurally recurring: this review report and every future one that quotes a key-shaped value will re-trip the scanner, so a fix confined to editing the offending text would fail again on the next cycle. The v1 remediation text anticipated this shape ("an explicit allowlist, not a loosened pattern") but the allowlist was never added.
- **Required remediation**: Make `uv run pytest -m 'not postgres'` pass in a way that survives future review reports. Scoping the scan to the paths where a real credential could plausibly land — source, tests, configuration and manifests, excluding `docs/` — or adding an explicit path allowlist for review reports, both achieve this; narrowing the pattern does not, and would weaken the guard. Whichever is chosen, keep the pattern's tightness and record the exclusion's rationale in the module docstring so a later reader does not mistake it for a loophole. Then re-verify the checked state of T014, T020 and T022 against a green run, and correct the record if any remains unsupported.

### IR-002 — Task bookkeeping still asserts a green suite the repository contradicts

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T014, T020, T022
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S3-tasks.md`
- **Claim challenged**: v1's Follow-Up required "correct the checked state of T011, T014, T019, T020 and T022 to match the evidence". T011 and T019 are now genuinely satisfied. T014, T020 and T022 remain checked while their checkpoints are unmet.
- **Observed evidence**: `git diff eaeeaf5..f9457ea` on the tasks file shows only two changed lines: `updated: 2026-09-06` → `2026-09-07`, and a new `last_reworked_review` key. No checkbox was revisited. T020's checkpoint ("`uv run pytest -m 'not postgres'` passes in full") and T022's ("Run the complete validation plan and confirm every command passes") are both false at `f9457ea`.
- **Expected evidence/behavior**: Skill constraint 2 — a checked box is an assertion the repository must corroborate. The v1 report named this explicitly as a required action.
- **Impact**: A downstream reader — Doc Sync in particular — takes the checked state as the record of what was validated. Left as is, the plan records a validated state that never existed. Rated MEDIUM rather than HIGH because it is a bookkeeping consequence of IR-001 and resolves with it; it is listed separately because v1 asked for it directly and it was not done.
- **Required remediation**: After IR-001 is fixed and the suite is green, confirm T014, T020 and T022 against the actual run. If any cannot be substantiated at that point, uncheck it rather than leaving the claim standing.

### IR-003 — `pydantic-settings` is still declared without a version constraint

- **Severity**: LOW
- **Status**: OPEN (carried from v1/IR-007)
- **Acceptance criteria**: N/A
- **Tasks**: T001
- **Files**: `pyproject.toml:12`
- **Claim challenged**: None — a consistency observation, restated because the rework did not address it and recorded no rationale for deferring it.
- **Observed evidence**: `pyproject.toml:12` reads `"pydantic-settings",` while its sibling at `:11` reads `"psycopg[binary]>=3",`. `uv.lock` pins the resolved version, so builds are reproducible today.
- **Expected evidence/behavior**: Consistency with the established pattern in the same dependency list.
- **Impact**: Minimal while the lock file is committed. A future `uv lock --upgrade` could pull a major version with a changed `BaseSettings` contract with no declared floor to prevent it. Non-blocking.
- **Required remediation**: Add `>=2` to match the sibling's style, or record an explicit decision to leave version bounds to the lock file. Either closes it.

### IR-004 — The design's "requests per minute 0 and attempts 0" bounds rows are unexercised

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S3-1
- **Tasks**: T012
- **Files**: `tests/unit/test_settings_validation.py:104-127`; `src/factorflow/config/settings.py:111-112`
- **Claim challenged**: The component design's section 7 row "Bounds are enforced — Pool size 0, port 0, **requests per minute 0 and attempts 0** each raise", mapped to `test_settings_validation.py`.
- **Observed evidence**: `TestFieldBounds` covers `FACTORFLOW_API_PORT` (both directions) and both `FACTORFLOW_DATABASE_POOL_*` variables. Neither `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` nor `FACTORFLOW_MASSIVE_MAX_ATTEMPTS` is tested at a rejecting value; the former appears only as a valid `60` inside `_base_env`. The constraints themselves are present and correct at `settings.py:111-112` (`Field(ge=1)` on both), so the behavior holds — it is simply not locked in.
- **Expected evidence/behavior**: The design's section 7 names four bound families for this file; two are covered.
- **Impact**: Removing `ge=1` from either field would not fail any test. Rated LOW because the code is correct today, the gap is two parametrize entries wide, and no acceptance criterion is left unevidenced overall.
- **Required remediation**: Add `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=0` and `FACTORFLOW_MASSIVE_MAX_ATTEMPTS=0` cases to `TestFieldBounds`.

### IR-005 — `FACTORFLOW_LOG_LEVEL` remains unimplemented and unassigned

- **Severity**: LOW
- **Status**: OPEN (carried from v1/IR-008)
- **Acceptance criteria**: N/A
- **Tasks**: N/A
- **Files**: `src/factorflow/config/settings.py`; `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-runtime-config.md:111`
- **Claim challenged**: The story summary's "Both containers load all configuration through this module."
- **Observed evidence**: The component design's section 2.2 variable table at line 111 lists `FACTORFLOW_LOG_LEVEL` (both processes, optional, default `INFO`, sourced to SA-LOG-001). `grep -rn "LOG_LEVEL\|log_level" src/ tests/` returns nothing. The rework added `configure_logging()` — the natural home for the setting — without it, and the task plan's Notes still assign it to no story.
- **Expected evidence/behavior**: Either a field on a settings model, or an explicit note in the task plan recording which story owns it.
- **Impact**: None on this story's acceptance criteria — it is a plan-coverage gap against the design's variable table, surfaced so it is not lost. Rated LOW for the same reason as in v1.
- **Required remediation**: Add the field to a settings model and apply it in `configure_logging()`, or record in the task plan's Notes which story owns it. A one-line note closes this.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — required test suite fails; T014/T020/T022 checked on a false claim | **STILL OPEN** (original cause resolved; new cause introduced) | The `sk-massive-` fixture literals were genuinely replaced (`test_redaction.py:17` and `test_settings_secrecy.py:15` now read `TEST-FIXTURE-CREDENTIAL-xyz789` / `-abc123`), so v1's stated cause is gone. But `uv run pytest -m 'not postgres'` still exits 1: the offender is now the committed `CAP-001-E1-S3-implementation-review-v1.md:227`, which quotes both original literals inside IR-001's evidence text. Carried forward as v2/IR-001. |
| v1/IR-002 — `configure_logging()` misses handlers; credential reaches log output | **RESOLVED** | `settings.py:211-256` replaces the `root.handlers` snapshot and the inert `root.addFilter()` with an idempotent class-level patch of `logging.Handler.handle`. Reviewer re-ran v1's exact probe (`configure_logging()` → `basicConfig()` → `urllib3` warning): output is `WARNING:urllib3:Bearer [redacted]`, where v1 emitted the value. Two new tests (`test_redaction.py:107-130` and `:175-199`) cover the handler-added-after and non-propagating-child paths and fail against the v1 implementation. |
| v1/IR-003 — invariant 4's one-second floor missing for `timeout_seconds` | **RESOLVED** | `settings.py:118` now reads `Field(default=30.0, ge=1)`, with a comment explaining the gap against the design's `gt=0` snippet. Reviewer probe: `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS=0.5` raises `ConfigurationError` naming the variable. `test_settings_validation.py:84-101` parametrizes the sub-one-second case across all three floored values. |
| v1/IR-004 — failures name the Pydantic field, not the environment variable | **RESOLVED** | `_EnvNamedSettings` (`settings.py:37-73`) catches the model's `ValidationError` and re-raises `ConfigurationError` with each `loc` element rewritten to its prefixed variable name. Reviewer probe with the key absent: `'FACTORFLOW_MASSIVE_API_KEY: Field required'`. All three `test_settings_required.py` assertions were tightened to the full variable name, so they no longer pass vacuously on the field name. The prefix-rather-than-substitute choice is documented in the code and is correct — Pydantic's "Field required" message names no field to substitute. |
| v1/IR-005 — secrets survive in `exc_info` tracebacks and `extra` attributes | **RESOLVED** | `redaction.py:44-56` pre-formats and scrubs the traceback, then clears `exc_info` so a handler's formatter uses the scrubbed `exc_text` cache, and scrubs every non-standard string attribute. Reviewer re-ran both v1 probes: formatted-traceback leak `False`, `extra`-attribute leak `False` (both were `True` in v1). Covered by `test_redaction.py:133-172`, with the traceback case asserting against `Formatter().format(record)` rather than the raw attribute. |
| v1/IR-006 — `test_settings_required.py` never asserts absence of a value | **RESOLVED** | `test_settings_required.py:40-52` adds `test_malformed_present_credential_never_echoes_the_value`, which sets a known credential value alongside a malformed sibling field and asserts the known value is absent from the error text — exactly the design's section 7 "The failure message carries no value" row. |
| v1/IR-007 — `pydantic-settings` without a version constraint | **STILL OPEN** | `pyproject.toml:12` is unchanged (`"pydantic-settings",`). No rationale for deferral was recorded. Restated as v2/IR-003 (LOW, non-blocking). |
| v1/IR-008 — `FACTORFLOW_LOG_LEVEL` unimplemented and unplanned | **STILL OPEN** | `grep -rn "LOG_LEVEL\|log_level" src/ tests/` still returns nothing, and the task plan's Notes were not amended. Restated as v2/IR-005 (LOW, non-blocking). |

## Scope and Plan Deviations

- **Justified.** `ApiSettings._reject_non_loopback_host` (`settings.py:90-103`) is absent from the component design's section 2.3 snippet. The plan flagged the gap in T015 and in its Notes before coding; DAC-E1-S3-4 and TC-COMP-326 both require active rejection. Unchanged from v1 and still correctly handled.
- **Justified.** `MassiveSettings.timeout_seconds` uses `ge=1` where the design's snippet shows `gt=0`. The design's own invariant 4 prose requires the one-second floor, so the snippet and the prose disagree and the implementation follows the prose. The code comment at `settings.py:113-117` records this explicitly. Correct resolution of a design-internal inconsistency; worth surfacing to the design owner so the snippet is corrected at its next revision.
- **Justified.** `RedactingFilter` (`redaction.py:38-58`) covers `exc_info` and `extra` attributes, which the design's section 2.5 snippet does not. This resolves v1/IR-005 and strengthens a security boundary; the design's snippet is illustrative and its surrounding prose ("Replace known secret values anywhere in a formatted log record") supports the broader reading. Same note to the design owner applies.
- **Justified.** `_EnvNamedSettings` and `ConfigurationError` are new types not named in the design. They are the mechanism for DAC-E1-7's "naming the variable" requirement, which the design states in prose (section 3) without prescribing an implementation. Applied uniformly to all five models, so the public failure mode is consistent.
- **Justified.** T010's stub `RESTClient` was not written; the module docstring explains the tests exercise the two functions directly. Unchanged from v1.
- **Bookkeeping, blocking.** T014, T020 and T022 remain checked against a red suite (IR-001, IR-002). v1 asked for this specifically.
- **Noted.** Committing the v1 review report is required by the pipeline and is not itself a defect — but it is the direct cause of IR-001, which is why the remediation must make the guard tolerant of review reports rather than edit this one.
- **No scope leakage.** Every changed file traces to a task. Nothing under `src/factorflow/db/` or any other story's territory was touched. `uv.lock`'s 127 added lines are the transitive closure of `pydantic-settings`, consistent with T001.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 (HIGH) — make `uv run pytest -m 'not postgres'` pass with a fix that does not re-break when the next review report quotes a key-shaped value, and preserve the scanner's pattern tightness. Then correct T014, T020 and T022 to match a green run (IR-002). IR-003, IR-004 and IR-005 are LOW and may be fixed or explicitly deferred with a recorded rationale. Rerun `$adversarial-review` against this tasks file for a v3 report.
- **Warnings accepted downstream**: N/A — the verdict is CHANGES-REQUIRED; no findings are accepted downstream.
