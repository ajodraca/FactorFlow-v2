---
artifact_schema_version: 1
artifact_id: CAP-003-E8-S1-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-08
updated: 2026-11-08
story_id: "CAP-003-E8-S1"
story: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1.md"
tasks: "docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-08T21:58:49Z"
reviewed_head: "3888727030cda852e120825f06dec92d7693089d"
review_base: "0c0c7ad6ada5b161b567787e3277bc888e8a4811"
reviewed_state_revision: "sha256:330e9bbfce7e53491e8dd9f2104bfa125d3523cade115d01b434e54383a5f69a"
verdict: CHANGES-REQUIRED
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
  timestamp: 2026-11-08T22:11:08Z
  source_artifacts:
    - id: CAP-003-E8-S1
      version: "1 (sha256:82a1190b7fd412903ef274f296a2154ed01651ec9fcec8acaf8716559c004590)"
    - id: CAP-003-E8-S1-tasks
      version: "1 (updated 2026-11-08)"
    - id: CAP-003-E8-S1-tdd-evidence
      version: "cycle-1 to cycle-4"
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

# Implementation Review: CAP-003-E8-S1 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 0 |
| Low findings | 0 |
| Acceptance criteria | 13/13 satisfied |
| Planned tasks | 16/16 verified |
| Required validation | 8/8 passed |

The production change is correct and complete: `ProviderNotEntitled`, the
entitlement rule in its designed position, the fixed `not_entitled` reason
kept away from `redact`, the package re-export and the `failed` mapping in
`classify_provider_error` all match the story, the task plan and massive-client
CAP-003 §2.4/§2.5 and acquisition-runner §2.3. `client.py`, `rate_limit.py`,
`runner.py`, `models.py`, `paging.py`, `uv.lock` and `pyproject.toml` are
unchanged. Every required validation command passed when rerun independently,
the TDD-evidence lint is clean, and the real-transport rows prove one request,
no wait and the exact reason through the unpatched SDK and urllib3 path.

The gate fails on the mutation check alone. Of 33 mutants run against the
story's focused suites, two non-equivalent reviewer mutants survive: widening
the entitlement rule to also search `status`, or `request_id`, passes the
focused suites and the whole non-`postgres` unit suite. The contract limits
rule 3 to `error` and `message` and requires every other envelope to stay a
retryable `ProviderUnavailable` (DAC-E8-1, DAC-E8-3; massive-client §2.4 table
row 3 and §4). A surviving non-equivalent mutant makes TC-COMP-228 `WEAK`,
which is HIGH (IR-001). The fix is one negative test row; no production change
is needed.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1.md` |
| Task plan | `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories/CAP-003-E8-S1-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, the harness worktree's own clone) |
| Branch | `usr/alvaro-de-jodra/CAP-003-E8-S1` |
| HEAD | `3888727030cda852e120825f06dec92d7693089d` (the single story commit) |
| Review base | `0c0c7ad` (supplied by the invoking driver as `--base-ref`; resolved by `pipeline-state.py review-base` to `0c0c7ad6ada5b161b567787e3277bc888e8a4811`, an ancestor of HEAD, the commit recording the owner's planning answers immediately before the story commit) |
| Working tree | Clean at freeze (no staged, unstaged or untracked files) |
| Changed files reviewed | 35 (10 production, test, plan, story and evidence-manifest files; 25 files under `CAP-003-E8-S1-evidence/`) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/errors.py` | modified | DAC-E8-1, DAC-E8-4; T010, T011 |
| `src/factorflow/ingestion/massive/__init__.py` | modified | DAC-E8-1 (re-export); T013 |
| `src/factorflow/ingestion/outcomes.py` | modified | DAC-E8-8; T012 |
| `tests/unit/test_massive_error_classification.py` | modified | DAC-E8-S1-1, -2, -7; T002, T003, T008, T009 (+1 guard row, cycle-2 deviation) |
| `tests/unit/test_massive_failure_reasons.py` | modified | DAC-E8-S1-5; T006 |
| `tests/unit/test_massive_retry.py` | modified | DAC-E8-S1-3, -4, DAC-E8-20; T004, T005 |
| `tests/unit/test_outcomes.py` | modified | DAC-E8-S1-6; T007 (+1 unlisted-subclass row, cycle-3 deviation) |
| `docs/.../stories/CAP-003-E8-S1-tasks.md` | modified | Checkbox-only change for T001 to T016 (verified: no other line differs) |
| `docs/.../stories/CAP-003-E8-S1.md` | modified | `status: planning` → `in-review` only |
| `docs/.../stories/CAP-003-E8-S1-tdd-evidence.yaml` | added | T016 |
| `docs/.../stories/CAP-003-E8-S1-evidence/` (25 files: 4 RED logs, 4 GREEN logs, 4 reviewed patches, 4 code-review and 4 spec-drift records, 4 mutation results, `final-validation.log`) | added | T016 (`reviewed_patch`, logs and mutation results the evidence cites; `check-tdd-evidence.py --require-logs` requires them) |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-29 | SATISFIED | `errors.py:208-212` (rule), `:112-118` (type), `:348-349` (fixed reason); `outcomes.py:151`; delivered `client.py:288-300` makes the non-`ProviderUnavailable` `BadResponse` `FATAL` and re-raises it typed | `test_massive_retry.py::test_a_real_403_plan_refusal_is_sent_once_and_waits_nothing` (3 rows); `test_outcomes.py::test_provider_not_entitled_maps_to_failed_with_the_reason_unreworded` | One request, no wait, `[not_entitled]` reason, outcome `failed`. The runner's catch-all `except (..., MassiveError)` (`runner.py:282-294`, unchanged) composes and classifies it, so no `TypeError` reaches the download; runner-level rows are CAP-003-E8-S4's per the story |
| DAC-E8-1 | SATISFIED | `errors.py:149-152` `_mentions_not_entitled` (each of `error`, `message` on its own, `.lower()`); rule after credential (`:202`) and before default (`:214`); `request_id` carried (`:211`); `is_fatal_for_governor` unchanged | TC-COMP-228, TC-COMP-229, TC-COMP-230 rows | Behaviour correct. The tests do not pin that rule 3 reads *only* `error` and `message` (IR-001) |
| DAC-E8-3 | SATISFIED | Default `ProviderUnavailable` unchanged (`errors.py:190`, `:214-217`) | `test_massive_retry.py::test_an_unrecognised_403_is_still_retried_to_the_limit_as_unavailable` (Forbidden envelope and non-JSON body: 3 requests, `[unavailable]`); delivered TC-INT-026 test byte-identical | Probe at HEAD: `{"status": "NOT ENTITLED"}` and `{"request_id": "not entitled"}` both stay `ProviderUnavailable`, retryable. No test pins that (IR-001) |
| DAC-E8-4 | SATISFIED | `errors.py:275-281` (exact-class table, fifth row), `:334-339` (`TypeError`), `:348-349` (fixed segment, `redact` not called), `:289` description | `test_massive_failure_reasons.py` (fixed reason with spy, five kinds by exact class against literals, `_Unlisted` and `_NotEntitledSubclass` raise `TypeError`); TC-COMP-230 exact reason | Credential fixture and provider text absent |
| DAC-E8-8 | SATISFIED | `outcomes.py:151-156`; no migration, column, outcome value or timing value added (`git diff --name-only` shows none) | `test_outcomes.py` four TC-COMP-233 tests | Whole-record equality against an independent literal reason |
| DAC-E8-20 | SATISFIED | n/a (test harness) | `test_massive_retry.py:_production_settings`, `_real_transport_client` (`FakeClock(_CLOCK_START)` passed as `monotonic` and `now`, `FakeSleeper` on it, governor from `GovernorSettings.from_massive_settings`), `forbid_sockets`, `RecordingMakeRequest` | The only `403` tests in the change run this path; `RESTClient` is not patched |
| DAC-E8-S1-1 | SATISFIED | as DAC-E8-1 | `test_a_not_entitled_body_in_either_field_any_case_classifies_provider_not_entitled` (5 rows incl. owner-kept `NOT_AUTHORIZED`), `test_a_forbidden_body_without_the_marker_stays_provider_unavailable`, `test_a_body_that_says_entitled_without_not_entitled_stays_provider_unavailable` | Criterion as worded is met; mutation strength gap recorded as IR-001 |
| DAC-E8-S1-2 | SATISFIED | `errors.py:196-206` precede `:208` | `test_not_found_and_credential_rules_win_over_the_plan_refusal_rule`, `test_provider_not_entitled_is_fatal_and_a_massive_error` | `type(...) is` assertions; rule-order and base-class mutants killed |
| DAC-E8-S1-3 | SATISFIED | as AC-29 | `test_a_real_403_plan_refusal_is_sent_once_and_waits_nothing` (message, error, Forbidden+message) | Exact path list `[balance-sheets]`, `sleeper.calls == []`, `guard.fired == []`, exact reason, provider text absent |
| DAC-E8-S1-4 | SATISFIED | as DAC-E8-3 | `test_an_unrecognised_403_is_still_retried_to_the_limit_as_unavailable` | `type(err) is ProviderUnavailable`, three balance-sheet requests, `[unavailable] … request_id=unavailable: ` prefix |
| DAC-E8-S1-5 | SATISFIED | as DAC-E8-4 | `test_not_entitled_reason_carries_the_fixed_description_never_the_provider_text`, `test_each_kind_composes_its_own_reason_by_exact_class`, `test_an_unlisted_massive_error_subclass_raises_type_error` | Identity spy makes the credential assertion non-vacuous |
| DAC-E8-S1-6 | SATISFIED | `outcomes.py:137-162` | `test_outcomes.py` TC-COMP-233 tests | `ValueError` for `CredentialRejected` and `TypeError` text naming the four accepted types both asserted |
| DAC-E8-S1-7 | SATISFIED | `_safe_fields` (`errors.py:121-146`) unchanged — no diff hunk inside it, still returns exactly `status`, `message`, `error`, `request_id`; `uv.lock`, `pyproject.toml` unchanged | `test_a_plan_refusal_carries_no_provider_free_text_or_spurious_field`; reviewer grep for `attempts` reads in added test lines: none | Re-ran T015 (a) to (d) independently |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Evidence header names base `0c0c7ad`; reviewer reran the four files on a `git archive 0c0c7ad` tree: 49 passed | |
| T002 | complete | VERIFIED | `test_massive_error_classification.py` TC-COMP-228 parametrised test (5 rows) and no-marker test | Asserts `type`, request id and `str(result)`; mutation-weak against field widening (IR-001) |
| T003 | complete | VERIFIED | `test_not_found_and_credential_rules_win_over_the_plan_refusal_rule`, `test_provider_not_entitled_is_fatal_and_a_massive_error` | |
| T004 | complete | VERIFIED | `test_massive_retry.py` harness (`_CLOCK_START`, `_production_settings`, `_real_transport_client`, `_answer_balance_sheets_with`) and TC-COMP-230 | Plan's claim that T004 kills negate-boolean is wrong (absent field reads `""`); T005 and the classification rows kill it — documented in cycle-4 deviations, coverage holds |
| T005 | complete | VERIFIED | TC-COMP-231 test, two rows | Guard row as planned; TC-INT-026 test untouched |
| T006 | complete | VERIFIED | `test_massive_failure_reasons.py` three TC-COMP-232 tests | |
| T007 | complete | VERIFIED | `test_outcomes.py` TC-COMP-233 tests | Full-sentence `match` and an unlisted-subclass row beyond plan (cycle-3 deviation, strengthening) |
| T008 | complete | VERIFIED | `test_a_plan_refusal_carries_no_provider_free_text_or_spurious_field` | |
| T009 | complete | VERIFIED | `test_provider_not_entitled_is_exported_from_errors_and_the_package` | |
| T010 | complete | VERIFIED | `errors.py:51`, `:67`, `:92-95`, `:112-118`, `:149-152`, `:183-186`, `:208-212` | Docstring verbatim from §2.4; "(401/403)" removed |
| T011 | complete | VERIFIED | `errors.py:280`, `:289-293`, `:325-339`, `:348-349` | `TypeError` text names the table, as planned |
| T012 | complete | VERIFIED | `outcomes.py:33`, `:125`, `:150-151`, `:158-162` | §2.3 comment line names `ProviderRateLimited`, which CAP-003-E8-S2 adds (planned; see Scope and Plan Deviations) |
| T013 | complete | VERIFIED | `__init__.py:15`, `:41`, `:65` | `client.py` not edited |
| T014 | complete | VERIFIED | Reviewer reran every command (Independent Validation) | |
| T015 | complete | VERIFIED | Reviewer reran (a) `git diff --exit-code 0c0c7ad..HEAD -- uv.lock pyproject.toml` exit 0; (b) no hunk inside `_safe_fields`; (c) `attempts` grep prints nothing; (d) change set as listed above, no migration | (d) also lists the evidence folder, which T016 requires |
| T016 | complete | VERIFIED | `CAP-003-E8-S1-tdd-evidence.yaml`, four cycles, per-cycle reviews, patches and mutation results; lint clean | Reviewer-scope mutation result differs (IR-001) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-228 (`test_a_not_entitled_body_in_either_field_any_case_classifies_provider_not_entitled`, `test_a_forbidden_body_without_the_marker_stays_provider_unavailable`, `test_a_body_that_says_entitled_without_not_entitled_stays_provider_unavailable`) | WEAK | Field-by-field search, case-insensitivity, `any`, the phrase and the request id are pinned: every narrowing, `.lower()`, `any`→`all`, negation, combined-`error or message` and marker-widening mutant is killed | Widening the searched fields to `status` or `request_id` survives (IR-001) |
| TC-COMP-229 (two tests) | ADEQUATE | `type(...) is` on both rule-order bodies; fatal and subclass assertions; both rule-order mutants and the base-class mutant killed | none |
| TC-COMP-230 (`test_a_real_403_plan_refusal_is_sent_once_and_waits_nothing`, 3 rows) | ADEQUATE | Real SDK/urllib3 path; exact recorded path list; `sleeper.calls == []` (correctly not a sum); socket guard; exact reason literal; provider text absent; kills rule-removed, request-id-drop, kind-swap and re-export-removal mutants | none |
| TC-COMP-231 (`test_an_unrecognised_403_is_still_retried_to_the_limit_as_unavailable`, 2 rows) | ADEQUATE | Exact class, three balance-sheet requests, `[unavailable]` prefix for a JSON envelope and a non-JSON body; kills negate-boolean | `SocketGuard` not asserted, but `forbid_sockets` fails the test on any socket call; not a gap |
| TC-COMP-232 (three tests) | ADEQUATE | Identity spy proves `redact` is never called and makes the credential check meaningful; five literal reasons; exact-class `TypeError` for an unlisted class and a `ProviderNotEntitled` subclass | `isinstance` survivor is equivalent (see Independent Validation) |
| TC-COMP-233 (four tests) | ADEQUATE | Whole `InstrumentOutcomeRecord` equality; `ValueError` match; `TypeError` full-sentence match; unlisted `MassiveError` subclass; kills drop, widen, outcome-swap, not-found-branch and run-level mutants | none |
| TC-COMP-234 (`test_a_plan_refusal_carries_no_provider_free_text_or_spurious_field` plus review checks) | ADEQUATE | Spurious credential-bearing field excluded from `str`/`repr` and from the reason under identity redaction; review steps rerun by the reviewer | none |
| `test_provider_not_entitled_is_exported_from_errors_and_the_package` (T009) | ADEQUATE | `errors.__all__`, package `__all__`, identity; each declaration's removal killed | none |

Mandatory TC-IDs TC-COMP-228 to TC-COMP-234 are all implemented with
`# Implements CAP-003 TC-COMP-<n>` markers. Tests are deterministic: one
`FakeClock`, `SequenceJitter([0.0])`, no network (sockets forbidden), the
per-test key from `generated_test_key()` only feeds redaction. Assertions
compare against independent literals, not values the code under test produced.

## Independent Validation

All commands ran from `repos/factorflow-v2/FactorFlow-v2` unless noted. The
clone has no `.venv`; per the invoking driver, the main checkout's
`.venv/bin/python` (CPython 3.13.7; `massive` 2.8.0, `urllib3` 2.7.0, `pytest`
9.1.1, `ruff` 0.16.6, `mypy` 2.3.1 — the locked versions) ran with `src` first on
the path, confirmed by importing `factorflow.ingestion.massive.errors` from the
clone's `src`. Because the tech stack names Python 3.12, the focused suites were
also run under the lock on CPython 3.12.14 in an isolated uv environment.

Names used in the table: `VENV` is
`/Users/alvarodejodra/Projects/ai-agents/repos/factorflow-v2/FactorFlow-v2/.venv/bin`;
`COMPONENT` is `repos/factorflow-v2/FactorFlow-v2` under the harness root;
`STORY_DIR` is `docs/capabilities/CAP-003-app-shell-and-data-health/epics/provider-refusals-by-cause/stories`; `SCRATCH` is the review session's
scratchpad (outside every repository); `FOCUSED` is
`tests/unit/test_massive_error_classification.py tests/unit/test_massive_failure_reasons.py tests/unit/test_massive_retry.py tests/unit/test_outcomes.py tests/unit/test_massive_package_boundary.py`.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-003 --story STORY_DIR/CAP-003-E8-S1.md --stage adversarial-review --base-ref 0c0c7ad` | harness root | 0 | PASS | `READY` |
| `python3 scripts/check-tdd-evidence.py --evidence COMPONENT/STORY_DIR/CAP-003-E8-S1-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 0c0c7ad --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | 0 errors, 0 warnings |
| `PYTHONPATH=src VENV/python -m pytest FOCUSED tests/unit/test_massive_errors.py -q -p no:cacheprovider` | component | 0 | PASS | 90 passed |
| `uv run --directory COMPONENT --isolated --offline --all-extras --locked pytest FOCUSED tests/unit/test_massive_errors.py -q -p no:cacheprovider` | harness root | 0 | PASS | 90 passed on CPython 3.12.14 with the 43 locked packages installed from `uv.lock` |
| `uv sync --directory COMPONENT --all-extras --locked --dry-run --offline` | harness root | 0 | PASS | Lock resolves (46 packages); `--dry-run` so no `.venv` is created in the clone; the actual locked install is the isolated run above |
| `uv build --directory COMPONENT --offline --out-dir SCRATCH/review-build` | harness root | 0 | PASS | sdist and wheel built (run outside the sandbox: inside it uv could not open its cache, `Operation not permitted`) |
| `VENV/python -m pytest -o pythonpath=src -p no:cacheprovider -q -rfE` (full suite, `postgres` tests included, testcontainers) | component | 0 | PASS | 2639 passed, 0 skipped, 2 pre-existing deprecation warnings (Starlette `httpx`, anyio `BlockingPortal`), 844 s; `postgres` tests ran against a testcontainers PostgreSQL (run outside the sandbox for the Docker socket); production compose project `factorflow` untouched |
| `VENV/ruff check .` | component | 0 | PASS | All checks passed |
| `VENV/ruff format --check .` | component | 0 | PASS | 285 files already formatted |
| `VENV/mypy src` | component | 0 | PASS | No issues in 61 source files |
| `git diff --exit-code 0c0c7ad..HEAD -- uv.lock pyproject.toml`; `git diff -U0 0c0c7ad..HEAD -- src/factorflow/ingestion/massive/errors.py`; `git diff 0c0c7ad..HEAD -- tests \| grep -nE '^\+.*(\.attempts\b\|\["attempts"\]\|\battempts\s*==)'`; `git diff --name-only 0c0c7ad..HEAD` | component | 0 / – / 1 / – | PASS | T015 (a) to (d) reproduced |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 0c0c7ad..HEAD --cycle review --out SCRATCH/mutants.json` | harness root | 0 | PASS | 0 generated mutants: no catalogue operator matches these Python lines, as the coder reported |
| `python3 scripts/mutation-run.py run --repo-dir repos/factorflow-v2/FactorFlow-v2 --mutants SCRATCH/review-e8s1/mutants.json --jobs 4 --command 'PYTHONPATH=src VENV/python -m pytest FOCUSED -q -p no:cacheprovider' --out SCRATCH/review-e8s1/results.json` | harness root | 3 (the runner's exit for survivors; output was piped, the code follows from `mutation-run.py` line 580) | FAIL (gate) | 33 manual mutants over every changed production file (the coder's 26 distinct mutants rerun, plus 7 reviewer mutants): 29 killed, 4 survived. Results copied to `CAP-003-E8-S1-implementation-review-v1-mutation.json` (sha256 `8a6ddfd3…5bed19`) |
| Same `run` with `--only` the 4 survivors and `--command '… -m pytest tests/unit -m "not postgres" -q -p no:cacheprovider -x'` | harness root | 3 | 4 survived | Whole non-`postgres` unit suite also misses all four (run outside the sandbox: inside it `tests/unit/test_distribution_contents.py` failed its own `uv build` at the baseline) |

Survivor dispositions:

- `errors.py:manual:coder-exact-class-to-isinstance` (`type(error) is ProviderNotEntitled` → `isinstance(...)`): **equivalent**. `compose_failure_reason` looks the kind up by exact class and raises `TypeError` before the branch for any class not in `_ERROR_KIND_BY_TYPE`; no listed class subclasses `ProviderNotEntitled` (massive-client §2.5 table, including CAP-003-E8-S2's `ProviderRateLimited(ProviderUnavailable)`), so the two forms agree on every input that reaches the branch. Task plan *Other Notes* names it equivalent.
- `errors.py:manual:reviewer-compose-type-error-text-reverted` (the `TypeError` text back to "only the four typed MassiveError subclasses are accepted."): **equivalent**. DAC-E8-4 specifies the exception type, not its text; the task plan's *Resolved Conflicts* classifies this wording as "a docstring-and-message consequence of the required row, not new behaviour", pinned by no test. Contrast `classify_provider_error`, whose `TypeError` text the story does specify and which is pinned.
- `errors.py:manual:reviewer-status-also-searched` and `errors.py:manual:reviewer-request-id-also-searched`: **not equivalent** — IR-001.

### Validation Side Effects

- Before: clean working tree at `3888727` on `usr/alvaro-de-jodra/CAP-003-E8-S1`.
- After: the only untracked files are this report and `CAP-003-E8-S1-implementation-review-v1-mutation.json`, both written by the reviewer under `docs/` (excluded from the code fingerprint). `uv build` wrote `src/factorflow.egg-info/` and `build/`, both git-ignored; mutation clones and build outputs went to the session scratchpad.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — The entitlement-rule tests do not pin that only `error` and `message` are searched

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E8-1, DAC-E8-3, DAC-E8-S1-1 (behaviour correct; test strength insufficient)
- **Tasks**: T002 (TC-COMP-228)
- **Files**: `src/factorflow/ingestion/massive/errors.py:149-152` (`_mentions_not_entitled`); `tests/unit/test_massive_error_classification.py` (`test_a_not_entitled_body_in_either_field_any_case_classifies_provider_not_entitled`, `test_a_forbidden_body_without_the_marker_stays_provider_unavailable`)
- **Claim challenged**: TC-COMP-228 pins the entitlement rule's field selection ("kills … the hand-written field-tuple … mutants", task plan T002), and no non-equivalent mutant survives (T016, TEST-TDD-006).
- **Observed evidence**: The mutants `for name in ("error", "message")` → `("status", "error", "message")` and → `("error", "message", "request_id")` both survive the story's focused suites and the entire non-`postgres` unit suite (`CAP-003-E8-S1-implementation-review-v1-mutation.json`; survivor rerun above). The plan's field-tuple mutants only narrow the tuple; every row of TC-COMP-228 carries the marker in `error` or `message`, and its one negative row (`{"status": "ERROR", "request_id": "r4", "error": "Forbidden"}`) carries the marker nowhere, so no test can tell a rule that also reads `status` or `request_id`. Probe at HEAD: `classify_error_body('{"status": "NOT ENTITLED", "request_id": "r7"}')` and `classify_error_body('{"status": "ERROR", "request_id": "not entitled"}')` both return `ProviderUnavailable` (retryable) — correct today, unprotected.
- **Expected evidence/behavior**: massive-client CAP-003 §2.4 rule 3 searches "`error` **or** `message`", and §4 states "rule 3 reads two of them" (of `_safe_fields`' four); DAC-E8-1 names the `error` or `message` field; DAC-E8-3 requires an envelope matching none of the not-found, credential or entitlement rules to stay `ProviderUnavailable` and `RETRYABLE`, retried to `max_attempts`. The mutants change that behaviour, so they are not equivalent (adversarial-review E.9), and TC-COMP-228 is `WEAK`.
- **Impact**: A later edit that "searches every safe field" would turn an envelope whose marker sits outside `error`/`message` into a fatal, once-sent `[not_entitled]` refusal instead of a retried `[unavailable]` failure, contradicting DAC-E8-3, and nothing in the suite would fail. Massive's `status` values observed so far are tokens such as `ERROR`, `NOT_FOUND` and (provisionally) `NOT_AUTHORIZED`, so the effect needs an unusual body; per the skill this goes under impact and does not lower severity.
- **Required remediation**: Add a negative classification row in `tests/unit/test_massive_error_classification.py` (TC-COMP-228) whose `not entitled` marker appears only in fields rule 3 does not read — `status` and `request_id` (one body with both, or one row each) — asserting `type(result) is ProviderUnavailable`. Rerun the mutation catalogue so `reviewer-status-also-searched` and `reviewer-request-id-also-searched` are killed and record the cycle in the TDD evidence. No production change is required.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, documented by the coder:** the evidence folder `CAP-003-E8-S1-evidence/` (25 files) is not in T015 (d)'s file list but is what T016 requires (`reviewed_patch`, logs, mutation results) and what `check-tdd-evidence.py --require-logs` checks. Two strengthening tests beyond plan (`test_a_body_that_says_entitled_without_not_entitled_stays_provider_unavailable`, the `test_outcomes.py` unlisted-subclass row and full-sentence `match`) trace to per-cycle code-review findings. The T004 responder answers non-balance-sheet paths with an empty success so a continued read would be visible — within T004's intent.
- **Plan attribution error (no gap):** T004 does not kill negate-boolean on the entitlement match (the absent field reads `""`); T005's Forbidden row and the classification rows do. Recorded in cycle-4 `deviations`.
- **Forward reference, as planned:** `outcomes.py:150` carries acquisition-runner §2.3's comment "ProviderUnavailable includes its subclass ProviderRateLimited." `ProviderRateLimited` does not exist until CAP-003-E8-S2 lands; T012 asked for the line verbatim. If E8-S2 is descoped, the comment should be revisited.
- **Bookkeeping:** all 16 tasks are checked and each is verified; the story's status moved to `in-review`; no other edit to the story or plan.
- **Out-of-scope changes:** none. `client.py`, `rate_limit.py`, `runner.py`, `models.py`, `paging.py`, `uv.lock` and `pyproject.toml` are byte-identical to the base.

## Follow-Up

- **Next agent**: Coding Agent
- **Required action**: Resolve IR-001 with the task file and this report (one negative TC-COMP-228 row; rerun the focused suites and the mutation catalogue, passing this report's `-mutation.json` to the next review's `scope --previous`), then rerun this review.
- **Warnings accepted downstream**: N/A
