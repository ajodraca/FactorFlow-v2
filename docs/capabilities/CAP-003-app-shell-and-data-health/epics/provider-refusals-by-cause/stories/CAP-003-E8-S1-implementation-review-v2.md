---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E8-S1"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-08T22:39:42Z"
reviewed_head: "75f2162a4fcef0761c08fe870b47459baa72beac"
review_base: "0c0c7ad6ada5b161b567787e3277bc888e8a4811"
reviewed_state_revision: "sha256:c2cd65750ea53855ab71a08cbef4da360ea4178142730cfcf37711a285645969"
verdict: PASS
review_subjects:
  - artifact_id: CAP-003-E8-S1
    artifact_version: 1
    content_revision: sha256:82a1190b7fd412903ef274f296a2154ed01651ec9fcec8acaf8716559c004590
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T22:56:42Z
  source_artifacts:
    - id: CAP-003-E8-S1
      version: "1 (sha256:82a1190b7fd412903ef274f296a2154ed01651ec9fcec8acaf8716559c004590)"
    - id: CAP-003-E8-S1-tasks
      version: "1 (updated 2026-11-08; last_reworked_review CAP-003-E8-S1-implementation-review-v1.md)"
    - id: CAP-003-E8-S1-tdd-evidence
      version: "cycle-1 to cycle-5"
    - id: CAP-003-E8-S1-implementation-review
      version: "1 (baseline, reviewed_head 3888727030cda852e120825f06dec92d7693089d)"
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

# Implementation Review: CAP-003-E8-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 10/10 passed |

Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0 · **total 0**

v1's only finding, IR-001 (HIGH), is resolved. The rework commit `75f2162`
adds one parametrised negative TC-COMP-228 test,
`test_a_marker_outside_error_and_message_stays_provider_unavailable`. It has
two rows, one with the `not entitled` marker only in `status` and one with it
only in `request_id`. Both of v1's surviving non-equivalent mutants,
`reviewer-status-also-searched` and `reviewer-request-id-also-searched`, are
now killed, each by its own row. A further reviewer mutant that searches every
safe field is killed by both rows. No production file, `uv.lock` or
`pyproject.toml` changed since v1's `reviewed_head` (`git diff --exit-code
3888727..HEAD -- src uv.lock pyproject.toml` exits 0). The production change
re-verified here therefore stands as v1 found it.

Every required validation command passed when rerun independently. That
includes the full suite with the `postgres` tests, run through the tech
stack's `uv run pytest` on the locked CPython 3.12 environment. The TDD
evidence lint is clean across all five cycles. Of 38 mutants (33 carried from
v1 plus 5 new reviewer mutants), 36 are killed. The 2 survivors are the
equivalent mutants v1 already ruled on, and the contract has not changed since.
No new finding was raised, in any scope.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, the harness worktree's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S1` |
| HEAD | `75f2162a4fcef0761c08fe870b47459baa72beac` (rework commit; above `64b68c9` review v1 and `3888727` the story commit) |
| Review base | `0c0c7ad`, supplied by the invoking driver as `--base-ref` (the merge-base with `origin/HEAD` is wrong here because the upstream chain is unpushed). `pipeline-state.py review-base --base-ref 0c0c7ad` resolved it to `0c0c7ad6ada5b161b567787e3277bc888e8a4811`, and `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| Working tree | Clean at freeze: no staged, unstaged or untracked files |
| Changed files reviewed | 44 (`git diff --name-status 0c0c7ad..HEAD`): 3 production, 4 test, the task plan, the story, the TDD-evidence manifest, v1's report and mutation file, and 32 files under `CAP-003-E8-S1-evidence/` |
| Baseline | v1 (`CAP-003-E8-S1-implementation-review-v1.md`, CHANGES-REQUIRED), `reviewed_head` `3888727030cda852e120825f06dec92d7693089d`, with `CAP-003-E8-S1-implementation-review-v1-mutation.json` (sha256 `8a6ddfd3…3f6d`) |

The delta since the baseline (`git diff --stat 3888727..HEAD`) is 12 files.
Only one of them is code: 19 added lines in
`tests/unit/test_massive_error_classification.py`. The rest are the
cycle-5 evidence files, the evidence manifest's cycle-5 entry, the plan's
`last_reworked_review` field, and v1's own report and mutation file.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/errors.py` | modified | DAC-E8-1, DAC-E8-4; T010, T011 (unchanged since v1) |
| `src/factorflow/ingestion/massive/__init__.py` | modified | DAC-E8-1 (re-export); T013 (unchanged since v1) |
| `src/factorflow/ingestion/outcomes.py` | modified | DAC-E8-8; T012 (unchanged since v1) |
| `tests/unit/test_massive_error_classification.py` | modified | DAC-E8-S1-1, -2, -7; T002, T003, T008, T009; the IR-001 remediation row (delta) |
| `tests/unit/test_massive_failure_reasons.py` | modified | DAC-E8-S1-5; T006 |
| `tests/unit/test_massive_retry.py` | modified | DAC-E8-S1-3, -4, DAC-E8-20; T004, T005 |
| `tests/unit/test_outcomes.py` | modified | DAC-E8-S1-6; T007 |
| `docs/.../stories/CAP-003-E8-S1-tasks.md` | modified | T001 to T016 checkboxes (v1) plus `last_reworked_review: CAP-003-E8-S1-implementation-review-v1.md` (story-coding G, rework handoff) |
| `docs/.../stories/CAP-003-E8-S1.md` | modified | `status: planning` → `in-review` only |
| `docs/.../stories/CAP-003-E8-S1-tdd-evidence.yaml` | added | T016; cycle-5 appended for the rework |
| `docs/.../stories/CAP-003-E8-S1-evidence/` (32 files: 5 RED logs, 5 GREEN logs, 5 reviewed patches, 5 code-review and 5 spec-drift records, 5 mutation results, `final-validation.log`, `full-suite-cycle-5.log`) | added | T016 (the cited logs, patches and mutation results; `check-tdd-evidence.py --require-logs` requires them) |
| `docs/.../stories/CAP-003-E8-S1-implementation-review-v1.md`, `…-v1-mutation.json` | added | Review v1 output (commit `64b68c9`), not coder output |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-29 | SATISFIED | `errors.py:208-212` (rule), `:112-118` (type), `:348-349` (fixed reason); `outcomes.py:151`; delivered `client.py:288-300` closure makes the non-`ProviderUnavailable` `BadResponse` `FATAL` and re-raises it typed | `test_massive_retry.py::test_a_real_403_plan_refusal_is_sent_once_and_waits_nothing` (3 rows); `test_outcomes.py::test_provider_not_entitled_maps_to_failed_with_the_reason_unreworded` | One request, no wait, `[not_entitled]` reason, outcome `failed`. The runner's `except (..., MassiveError)` (`runner.py:282-294`, unchanged) composes and classifies it |
| DAC-E8-1 | SATISFIED | `errors.py:149-152` `_mentions_not_entitled` (`error`, `message`, each on its own, `.lower()`); rule after credential (`:202`), before default (`:214`); `request_id` carried (`:211`) | TC-COMP-228 (now including the two outside-field rows), TC-COMP-229, TC-COMP-230 | Field selection is now pinned in both directions: every narrowing and every widening mutant is killed |
| DAC-E8-3 | SATISFIED | Default `ProviderUnavailable` unchanged (`errors.py:190`, `:214-217`) | `test_an_unrecognised_403_is_still_retried_to_the_limit_as_unavailable` (Forbidden envelope and non-JSON body: 3 requests, `[unavailable]`); `test_a_marker_outside_error_and_message_stays_provider_unavailable` (marker in `status` or `request_id` alone → `ProviderUnavailable`) | The v1 gap (IR-001) is closed |
| DAC-E8-4 | SATISFIED | `errors.py:275-281` (exact-class table, fifth row), `:334-339` (`TypeError`), `:348-349` (fixed segment, `redact` not called) | `test_massive_failure_reasons.py` three TC-COMP-232 tests; TC-COMP-230 exact reason | Credential fixture and provider text absent |
| DAC-E8-8 | SATISFIED | `outcomes.py:151-156`; no migration, column, outcome value or timing value (`git diff --name-only 0c0c7ad..HEAD` lists none) | `test_outcomes.py` four TC-COMP-233 tests | Whole-record equality against an independent literal |
| DAC-E8-20 | SATISFIED | n/a (test harness) | `test_massive_retry.py:_production_settings`, `_real_transport_client` (one `FakeClock(_CLOCK_START)` as `monotonic` and `now`), `forbid_sockets`, `RecordingMakeRequest` | The only `403` transport tests run this path; `RESTClient` is not patched |
| DAC-E8-S1-1 | SATISFIED | as DAC-E8-1 | `test_a_not_entitled_body_in_either_field_any_case_classifies_provider_not_entitled` (5 rows), `test_a_forbidden_body_without_the_marker_stays_provider_unavailable`, `test_a_body_that_says_entitled_without_not_entitled_stays_provider_unavailable`, `test_a_marker_outside_error_and_message_stays_provider_unavailable` (2 rows) | |
| DAC-E8-S1-2 | SATISFIED | `errors.py:196-206` precede `:208` | `test_not_found_and_credential_rules_win_over_the_plan_refusal_rule`, `test_provider_not_entitled_is_fatal_and_a_massive_error` | Rule-order and base-class mutants killed |
| DAC-E8-S1-3 | SATISFIED | as AC-29 | `test_a_real_403_plan_refusal_is_sent_once_and_waits_nothing` | Exact path list, `sleeper.calls == []`, `guard.fired == []`, exact reason |
| DAC-E8-S1-4 | SATISFIED | as DAC-E8-3 | `test_an_unrecognised_403_is_still_retried_to_the_limit_as_unavailable` | Three requests, exact class, `[unavailable]` prefix; delivered TC-INT-026 test unedited (no removed line in the file's diff) |
| DAC-E8-S1-5 | SATISFIED | as DAC-E8-4 | three TC-COMP-232 tests | Identity spy makes the credential assertion meaningful |
| DAC-E8-S1-6 | SATISFIED | `outcomes.py:137-162` | `test_outcomes.py` TC-COMP-233 tests | `ValueError` and full-sentence `TypeError` asserted |
| DAC-E8-S1-7 | SATISFIED | `_safe_fields` (`errors.py:121-146`) has no diff hunk and still returns exactly `status`, `message`, `error`, `request_id`; `uv.lock`, `pyproject.toml` unchanged | `test_a_plan_refusal_carries_no_provider_free_text_or_spurious_field`; reviewer `attempts` grep over added test lines: no match | T015 (a) to (d) rerun |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Evidence header names base `0c0c7ad`; v1 reran the four files on a `git archive 0c0c7ad` tree (49 passed). The base and those files are unchanged | |
| T002 | complete | VERIFIED | `test_massive_error_classification.py` TC-COMP-228: 5 positive rows, the no-marker row, the "entitled" row, and the two outside-field rows added in cycle-5 | Task's "field-tuple mutants" claim now holds for widening as well as narrowing |
| T003 | complete | VERIFIED | `test_not_found_and_credential_rules_win_over_the_plan_refusal_rule`, `test_provider_not_entitled_is_fatal_and_a_massive_error` | |
| T004 | complete | VERIFIED | `test_massive_retry.py` real-transport harness and TC-COMP-230 | Negate-boolean is killed by T005 and the classification rows, as the cycle-4 deviation records |
| T005 | complete | VERIFIED | TC-COMP-231, two rows | Guard row, passes before and after by design |
| T006 | complete | VERIFIED | `test_massive_failure_reasons.py`, three TC-COMP-232 tests | |
| T007 | complete | VERIFIED | `test_outcomes.py`, TC-COMP-233 tests | |
| T008 | complete | VERIFIED | `test_a_plan_refusal_carries_no_provider_free_text_or_spurious_field` | |
| T009 | complete | VERIFIED | `test_provider_not_entitled_is_exported_from_errors_and_the_package` | |
| T010 | complete | VERIFIED | `errors.py:51`, `:67`, `:94`, `:112-118`, `:149-152`, `:182-186`, `:208-212` | Unchanged since v1 |
| T011 | complete | VERIFIED | `errors.py:280`, `:289-293`, `:325-339`, `:348-349` | Unchanged since v1 |
| T012 | complete | VERIFIED | `outcomes.py:33`, `:125`, `:150-151`, `:158-162` | Unchanged since v1 |
| T013 | complete | VERIFIED | `__init__.py:15`, `:41`, `:65` | `client.py` not edited |
| T014 | complete | VERIFIED | Reviewer reran every command (Independent Validation) | |
| T015 | complete | VERIFIED | Reviewer reran (a) to (d), results below | (d) also lists the evidence folder and v1's review files, all justified |
| T016 | complete | VERIFIED | `CAP-003-E8-S1-tdd-evidence.yaml`, five cycles; lint clean with `--require-logs`; `cycle-5.patch` sha256 `82a5523c…0c1f` is byte-identical to `git diff 64b68c9..75f2162 -- tests/` | Cycle-5 is test-only, with RED taken from the two review mutants (`red-cycle-5.log`) and independent code-review (APPROVED) and spec-drift (no drift) records |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-228 (`test_a_not_entitled_body_in_either_field_any_case_classifies_provider_not_entitled`, `test_a_forbidden_body_without_the_marker_stays_provider_unavailable`, `test_a_body_that_says_entitled_without_not_entitled_stays_provider_unavailable`, `test_a_marker_outside_error_and_message_stays_provider_unavailable`) | ADEQUATE | Field-by-field search, case-insensitivity, `any`, the phrase and the request id are pinned. The new rows put the marker only in `status` (`{"status": "NOT ENTITLED", "request_id": "r7"}`) or only in `request_id` (`{"status": "ERROR", "request_id": "not entitled"}`). Neither body matches rule 1 (status is not `NOT_FOUND`; `reason` is `""`) or rule 2, so each reaches rule 3 and only its field selection decides the result. The assertion is the exact class against the imported literal type | none |
| TC-COMP-229 (two tests) | ADEQUATE | `type(...) is` on both rule-order bodies; fatal and subclass assertions | none |
| TC-COMP-230 (3 rows) | ADEQUATE | Real SDK and urllib3 path; exact recorded path list; `sleeper.calls == []`; socket guard; exact reason literal; provider text absent | none |
| TC-COMP-231 (2 rows) | ADEQUATE | Exact class, three balance-sheet requests, `[unavailable]` prefix for a JSON envelope and a non-JSON body | none |
| TC-COMP-232 (three tests) | ADEQUATE | Identity spy proves `redact` is never called; five literal reasons; exact-class `TypeError` for an unlisted class and a `ProviderNotEntitled` subclass | none (the `isinstance` survivor is equivalent; see below) |
| TC-COMP-233 (four tests) | ADEQUATE | Whole-record equality; `ValueError` match; full-sentence `TypeError` match; unlisted `MassiveError` subclass | none |
| TC-COMP-234 (`test_a_plan_refusal_carries_no_provider_free_text_or_spurious_field` plus review checks) | ADEQUATE | Spurious credential-bearing field absent from `str`, `repr` and the identity-redacted reason; review steps rerun by the reviewer | none |
| `test_provider_not_entitled_is_exported_from_errors_and_the_package` (T009) | ADEQUATE | `errors.__all__`, package `__all__`, identity | none |

TC-COMP-228 to TC-COMP-234 are each implemented and carry `# Implements CAP-003
TC-COMP-<n>`. The new row is deterministic: fixed literal dicts, no clock, no
I/O. It is the only test code changed since v1.

## Independent Validation

All commands ran from the harness root unless the table says otherwise.
Names used in the table: `VENV` is
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin`
(the main checkout's environment: CPython 3.13.7, `massive` 2.8.0, `urllib3`
2.7.0, `pytest` 9.1.1, `ruff` 0.16.6, `mypy` 2.3.1, which are the locked
versions). `COMPONENT` is
`/Users/alvarodejodra/Projects/ai-agents/.claude/worktrees/cool-blackburn-2ab918/repos/factorflow-v2/FactorFlow-v2`.
`STORY_DIR` is
`docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories`.
`SCRATCH` is the review session's scratchpad `review-e8s1-v2/`, outside every
repository. `FOCUSED` is
`tests/unit/test_massive_error_classification.py tests/unit/test_massive_failure_reasons.py tests/unit/test_massive_retry.py tests/unit/test_outcomes.py tests/unit/test_massive_package_boundary.py`.
The clone has no `.venv`. The `VENV` runs used `-o pythonpath=src` or
`PYTHONPATH=src` from the clone root. Importing
`factorflow.ingestion.massive.errors` resolved to the clone's `src`. The first
row is the stage's state check. The other ten rows are the required
validation counted in the Gate Summary: the TDD-evidence lint, the plan's
focused suites, the tech stack's six Python commands that apply when a
container runtime is available, T015's review checks, and the mutation gate.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story STORY_DIR/CAP-003-E8-S1.md --stage adversarial-review --base-ref 0c0c7ad` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required`. Without `--base-ref` the check reports `BLOCKED`, because the default base is the wrong merge-base |
| `python3 scripts/check-tdd-evidence.py --evidence COMPONENT/STORY_DIR/CAP-003-E8-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 0c0c7ad --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings across cycle-1 to cycle-5 |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q FOCUSED tests/unit/test_massive_errors.py` | COMPONENT | 0 | PASS | 92 passed (v1: 90, plus the two new rows) |
| `uv sync --directory COMPONENT --all-extras --locked --dry-run --offline` | harness root | 0 | PASS | CPython 3.12.14; resolved 46 packages, would install 43; `--dry-run`, so no `.venv` was created in the clone (run outside the sandbox for the uv cache) |
| `uv build --directory COMPONENT --offline --out-dir SCRATCH/build` | harness root | 0 | PASS | Built `factorflow-0.2.0.tar.gz` and `factorflow-0.2.0-py3-none-any.whl` into the scratchpad. Run outside the sandbox for the uv cache, after the full suite finished |
| `uv run --directory COMPONENT --isolated --offline --all-extras --locked pytest -p no:cacheprovider -q -rfE` (full suite, `postgres` tests included) | harness root | 0 | PASS | 2641 passed, 0 skipped, 0 failed in 990.68 s on CPython 3.12.14, with the 43 locked packages installed from `uv.lock` into an isolated environment. That is 2639 at v1 plus the 2 new rows. The 2 warnings are pre-existing deprecations (Starlette `httpx`, anyio `BlockingPortal`). The `postgres` tests ran against a testcontainers PostgreSQL, run outside the sandbox for the Docker socket and the uv cache. The production compose project `factorflow` was not touched, and the live provider was not contacted (sockets are forbidden in the transport tests) |
| `VENV/ruff check .` | COMPONENT | 0 | PASS | All checks passed |
| `VENV/ruff format --check .` | COMPONENT | 0 | PASS | 285 files already formatted |
| `VENV/mypy src` | COMPONENT | 0 | PASS | No issues found in 61 source files |
| T015: (a) `git diff --exit-code 0c0c7ad..HEAD -- uv.lock pyproject.toml`; (b) `git diff -U0 0c0c7ad..HEAD -- src/factorflow/ingestion/massive/errors.py` hunk headers; (c) `git diff 0c0c7ad..HEAD -- tests \| grep -nE '^\+.*(\.attempts\b\|\["attempts"\]\|\battempts\s*==)'`; (d) `git diff --name-only 0c0c7ad..HEAD`; also `git diff --exit-code 0c0c7ad..HEAD --` `client.py`, `rate_limit.py`, `runner.py`, `models.py`, `paging.py`, `test_massive_package_boundary.py`, `test_massive_errors.py` | COMPONENT | 0 / – / 1 / – / 0 | PASS | (a) no change; (b) no hunk inside `_safe_fields` (its base lines 110-135 lie between the hunks at 109 and 137); (c) no match; (d) only the story's files, the evidence folder and v1's review files, and no migration; the other listed files are byte-identical to the base |
| Mutation gate: `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 0c0c7ad..HEAD --cycle review --out SCRATCH/generated.json`; 5 reviewer mutants added (`"operator": "manual"`); `python3 scripts/mutation-run.py scope --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants SCRATCH/with-manual.json --since 3888727030cda852e120825f06dec92d7693089d --previous COMPONENT/STORY_DIR/CAP-003-E8-S1-implementation-review-v1-mutation.json --out SCRATCH/mutants.json`; `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants SCRATCH/mutants.json --jobs 4 --command 'PYTHONPATH=src VENV/python -m pytest FOCUSED -q -p no:cacheprovider' --out SCRATCH/results.json --logs SCRATCH/results-logs` | harness root | 0 / 0 / 3 | PASS | `generate`: 0 catalogue mutants, since no operator matches these Python lines (as in v1). `scope`: 38 mutants, 33 `carried` and 5 `late`, and no v1 mutant dropped. `run`: 36 killed and 2 survived; exit 3 is the runner's code for survivors. Both survivors are equivalent (below), so the gate passes. The results were copied to `CAP-003-E8-S1-implementation-review-v2-mutation.json` (results sha256 `1ccf0420…6249`) |

Mutation detail:

- **IR-001 mutants (carried)**: `reviewer-status-also-searched` is killed by
  `test_a_marker_outside_error_and_message_stays_provider_unavailable[in-status]`
  alone (1 failed, 82 passed). `reviewer-request-id-also-searched` is killed by
  `[in-request-id]` alone (1 failed, 82 passed). Each failure shows
  `ProviderNotEntitled` returned where `ProviderUnavailable` was expected.
- **New reviewer mutants (`late`, all killed)**:
  - `reviewer-v2-all-safe-fields-searched` (`for name in fields`) is killed by
    both outside-field rows.
  - `reviewer-v2-marker-equality` (`in` → `==`) is killed by the in-message,
    in-error and beside-an-unrelated-error rows and by TC-COMP-230.
  - `reviewer-v2-request-id-from-status` (`provider_request_id=fields["status"]`)
    is killed by all five positive rows and by TC-COMP-234.
  - `reviewer-v2-credential-description-for-not-entitled` is killed by the
    TC-COMP-232 and TC-COMP-230 literals.
  - `reviewer-v2-contract-violation-dropped-from-failed` (the `outcomes.py`
    tuple edited by this story) is killed by the delivered
    `test_provider_contract_violation_maps_to_failed`.
- **Carried survivors, both equivalent, unchanged from v1**:
  - `coder-exact-class-to-isinstance` (`type(error) is ProviderNotEntitled` →
    `isinstance(...)` in `compose_failure_reason`) is equivalent. DAC-E8-4
    requires the kind lookup by exact class. That lookup raises `TypeError`
    before the branch for any class outside `_ERROR_KIND_BY_TYPE`, and no
    listed class subclasses `ProviderNotEntitled`. The two forms therefore
    agree on every input that reaches the branch. The task plan's *Other
    Notes* names this mutant equivalent.
  - `reviewer-compose-type-error-text-reverted` is equivalent. DAC-E8-4
    specifies the exception type, not its text. The task plan's *Resolved
    Conflicts* classifies the wording as "a docstring-and-message consequence
    of the required row, not new behaviour".

### Validation Side Effects

- Before: clean working tree at `75f2162` on `usr/alvaro-de-jodra/CAP-003-E8-S1`.
  The only ignored entries were `.hypothesis/`, `.mypy_cache/`, `.ruff_cache/`,
  `build/`, `src/factorflow.egg-info/` and `__pycache__/` folders.
- After: the only untracked files are this report and
  `CAP-003-E8-S1-implementation-review-v2-mutation.json`. The reviewer wrote
  both under `docs/`, which the code fingerprint excludes. `uv build` refreshed
  the git-ignored `build/` and `src/factorflow.egg-info/`. Mutation clones,
  mutation logs and build outputs went to the session scratchpad. The
  `uv run --isolated` environment lives in the uv cache, not in the clone.
- Unexpected tracked-file changes: none. `pipeline-state.py code-revision`
  after validation:
  `sha256:c2cd65750ea53855ab71a08cbef4da360ea4178142730cfcf37711a285645969`,
  identical to the value recorded at freeze.

## Findings

No findings.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 | RESOLVED | `tests/unit/test_massive_error_classification.py::test_a_marker_outside_error_and_message_stays_provider_unavailable` (`[in-status]`, `[in-request-id]`), added in `75f2162` and byte-identical to `CAP-003-E8-S1-evidence/cycle-5.patch`. Rerun at HEAD: both rows pass, and both `type(result) is ProviderUnavailable` assertions hold. In this review's mutation run, `reviewer-status-also-searched` and `reviewer-request-id-also-searched` (scope `carried`) are each killed by their own row, and the stricter `reviewer-v2-all-safe-fields-searched` is killed by both. No production change was needed, and none was made (`git diff --exit-code 3888727..HEAD -- src` exits 0) |

## Scope and Plan Deviations

- **IR-001 remediation, justified:** the new test sits in the TC-COMP-228
  section and carries `# Implements CAP-003 TC-COMP-228`. The specification's
  Steps 1 to 5 do not list a marker-outside-the-read-fields row. The case is
  nonetheless what the specification's harness note ("the entitlement rule
  reads only `error` and `message`") and its edge case ("`status` takes part
  only in the not-found rule") state. It is also what massive-client §2.4
  rule 3 and §4 require ("rule 3 reads two of them"). The cycle-5 spec-drift
  record already notes the Steps list could name the row. Whether to add it is
  a specification-maintenance choice for `tests/component/massive-client-tests.md`,
  not an implementation gap.
- **Rework bookkeeping:** the plan gained `last_reworked_review:
  CAP-003-E8-S1-implementation-review-v1.md` as story-coding G requires. The
  story stays `in-review`, and all 16 tasks remain checked. The cycle-5 code
  review notes a transient unstaged story-status edit while the cycle was
  staged. It is absent from HEAD, since the story is byte-identical to the
  v1 state at `3888727`.
- **Carried from v1, still true:** the evidence folder is outside T015 (d)'s
  file list but is what T016 requires. Two strengthening tests beyond plan
  trace to per-cycle code-review findings. T004 does not itself kill
  negate-boolean; T005 and the classification rows do, as the cycle-4
  deviations record. `outcomes.py:150` carries acquisition-runner §2.3's
  forward-reference comment to `ProviderRateLimited`, which CAP-003-E8-S2
  adds; if E8-S2 is descoped, the comment should be revisited.
- **Out-of-scope changes:** none. `client.py`, `rate_limit.py`, `runner.py`,
  `models.py`, `paging.py`, `uv.lock` and `pyproject.toml` are byte-identical
  to the base.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-003-E8-S1 against the component state fingerprinted here (`sha256:c2cd6575…5969` at `75f2162`). Commit this report and its mutation file on the story branch first, so the gate is visible to the next stage.
- **Warnings accepted downstream**: N/A
