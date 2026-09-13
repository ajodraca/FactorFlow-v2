---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-12
updated: 2026-09-12
story_id: "CAP-001-E3-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-12T19:53:25Z"
reviewed_head: "d1cb17449019375e1fe78250311a82e71284ea48"
review_base: "701e7fb636d96f6162556ca8a51b59d47c871f84"
reviewed_state_revision: "sha256:2e48d5a19ebf42ffd511d0f7cd21fb8a829cad07e39bb19a5190afc1ba164b99"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-001-E3-S3
    artifact_version: 1
    content_revision: sha256:1535999a38b48c5d48069cf1f8e05c70f3ee94daa1c67f8aed3e445f2005dc4e
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-12T19:53:25Z
  source_artifacts:
    - id: CAP-001-E3-S3
      version: "1"
    - id: CAP-001-E3-S3-tasks
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 2 |
| Low findings | 2 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 10/11 verified |
| Required validation | 6/6 passed |

The taxonomy module is genuinely well built. The classification order matches
`component-design-massive-client.md` §2.4 exactly, every marker constant traces
to a probe-confirmed envelope in §2.6a, the credential-leak boundary is real
rather than asserted (`_safe_fields` whitelists four fields and discards
everything else, and no classified message ever interpolates provider text), and
all six required validation commands pass independently with the working tree
clean before and after.

The gate nonetheless fails on one mandatory test that does not hold. TC-COMP-224
/ DAC-E3-S3-5 requires `provider_request_id` to be populated from the response
for **every** typed error when present. The `ProviderUnavailable` branch of
`classify_error_body` — the taxonomy's default and highest-traffic path — has no
test asserting the populated case, and the test that names itself
`test_every_taxonomy_type_carries_request_id_uniformly` feeds that branch a
fixture carrying no `request_id` at all, so it asserts only `None`. A mutation
deleting `provider_request_id=request_id` from that branch survives the entire
26-test suite (IR-001). Production behavior is correct — verified directly — so
no acceptance criterion is violated in the shipped code; what is missing is the
regression guard the story's own test list and T003 require. Per the gate's
rules a WEAK mandatory test is at least HIGH, and T003 is correspondingly
PARTIAL.

Two MEDIUM findings follow: the mandatory TC-ID traceability comments in
`test_massive_errors.py` mis-map TC-COMP-207/221/224 against the coverage matrix
(IR-002), and the non-object-JSON guard in `_safe_fields` is untested despite
being the only thing standing between a non-dict payload and an `AttributeError`
escaping the provider boundary (IR-003).

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tasks.md` |
| Component | FactorFlow-v2 (reviewed in worktree `.claude/worktrees/pipeline-run-E3-S3-root/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S3` |
| HEAD | `d1cb17449019375e1fe78250311a82e71284ea48` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E3-S2` merge-base `701e7fb636d96f6162556ca8a51b59d47c871f84` |
| Working tree | clean (no staged, unstaged, or untracked non-ignored files, before and after validation) |
| Changed files reviewed | 18 |

The base is the merge-base with `usr/alvaro-de-jodra/CAP-001-E3-S2` rather than
`main`, because this branch is stacked on E3-S2's unmerged
`src/factorflow/ingestion/massive/models.py`. E3-S2 carries its own passed gate
(`CAP-001-E3-S2-implementation-review-v1.md`) and is deliberately excluded from
this change set. Five commits compose the story: `bca62bc` (Phase 1), `4783790`
(Phase 2 RED), `43c3526` (Phase 3 GREEN), `18051ee` (Phase 4), `d1cb174`
(Phase 5).

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/errors.py` | added | T008, T009 |
| `src/factorflow/ingestion/massive/__init__.py` | modified | T010 (additive re-export only; no E3-S2 export removed) |
| `tests/unit/test_massive_error_classification.py` | added | T002, T004, T005, T007 |
| `tests/unit/test_massive_errors.py` | added | T003, T006 |
| `tests/fixtures/massive/error_not_found.json` | added | T002 (§2.6a 404 row) |
| `tests/fixtures/massive/error_not_found_status_only.json` | added | T012 STRENGTHEN step for mutation-1 |
| `tests/fixtures/massive/error_not_found_message_only.json` | added | T007 |
| `tests/fixtures/massive/error_credential_unknown_key.json` | added | T003 (§2.6a 401 row) |
| `tests/fixtures/massive/error_credential_malformed_header.json` | added | T003 (§2.6a malformed-auth row) |
| `tests/fixtures/massive/error_rate_limited.json` | added | T005 (§2.6a 429 row) |
| `tests/fixtures/massive/error_malformed.txt` | added | T002 (DAC-E3-4) |
| `tests/fixtures/massive/error_unknown_shape.json` | added | T002 (DAC-E3-S3-3) |
| `tests/fixtures/massive/error_missing_message_and_error.json` | added | T002, T007 (DAC-E3-3 "requiring neither") |
| `tests/fixtures/massive/error_no_request_id.json` | added | T003 (DAC-E3-S3-5 absent case) |
| `tests/fixtures/massive/error_with_spurious_credential_field.json` | added | T003, T007 (DAC-E3-13) |
| `…/CAP-001-E3-S3-tasks.md` | modified | task checkbox state only |
| `…/CAP-001-E3-S3.md` | modified | `status: planning` → `in-review` only |
| `…/CAP-001-E3-S3-tdd-evidence.yaml` | added | T012 |

No unjustified file is present. Nothing outside the story's declared surface was
touched, no dependency or configuration change was introduced, and
`pyproject.toml`/`uv.lock` are untouched.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `errors.py:81` `InstrumentNotFound`; `errors.py:171-175` classification | `test_massive_errors.py:132` `test_not_found_failure_retains_safe_request_id_bearing_reason` | The typed failure carries a safe reason plus `request_id`, so the runner can record the instrument and continue. |
| DAC-E3-2 | SATISFIED | `errors.py:65-104` — exactly the four subclasses of `MassiveError` | `test_massive_error_classification.py:47` | Structural test confirms all four derive from `MassiveError`; `__all__` exports no fifth failure type. |
| DAC-E3-3 | SATISFIED | `errors.py:168` `reason = fields["error"] or fields["message"] or ""`; `_safe_fields` uses `.get` throughout | `test_massive_error_classification.py:89,101,113` | All three cases proven: `message` only, `error` only, and neither (no `KeyError`). |
| DAC-E3-4 | SATISFIED | `errors.py:116-120,164-165` — `JSONDecodeError`/`UnicodeDecodeError` → `ProviderUnavailable` with no `request_id` | `test_massive_error_classification.py:126` | Asserts `ProviderUnavailable` **and** explicitly `not isinstance(..., InstrumentNotFound)`, as the story requires. Mutation-3 in the TDD evidence is independently plausible and this test kills it. |
| DAC-E3-5 | SATISFIED | `errors.py:203-220` `wrap_validation_error` → `ProviderContractViolation` | `test_massive_error_classification.py:152` | Uses a real `ValidationError` from E3-S2's `DailyBar`, and asserts no partial parsed value (`187.15`, `188.44`) reaches the message. |
| DAC-E3-13 | SATISFIED | `errors.py:76-78` stores only message + `request_id`; `_safe_fields` whitelist at `errors.py:127-132` | `test_massive_errors.py:51,65,101` | Production boundary verified: no classified message interpolates provider text, so a credential cannot reach `str()`/`repr()`/a log record. Test strength for the `ProviderUnavailable` request-ID half is weak — see IR-001. |
| DAC-E3-S3-1 | SATISFIED | `errors.py:171` `status == _NOT_FOUND_STATUS` | `test_massive_error_classification.py:63,73` | The second test isolates `status` from message text, so status alone drives classification. |
| DAC-E3-S3-2 | SATISFIED | `errors.py:177-181`, markers `errors.py:60` | `test_massive_errors.py:31,41,51` | Both probe-confirmed 401 bodies covered, plus the no-credential-in-output assertion. |
| DAC-E3-S3-3 | SATISFIED | `errors.py:183-186` — unconditional safe default | `test_massive_error_classification.py:139,171` | Also asserts the default is never `ProviderContractViolation`, pinning the owner's precedence resolution. |
| DAC-E3-S3-4 | SATISFIED | `errors.py:189-200` `is_fatal_for_governor` | `test_massive_error_classification.py:185,196` | All four types asserted; `ProviderUnavailable` is the only retryable one. No `Outcome` import, so E3-S4 ownership is preserved. |
| DAC-E3-S3-5 | SATISFIED | `errors.py:169,174,180,185` — `request_id` threaded into every constructed error; verified at runtime that `error_missing_message_and_error.json` yields `req_missing_001` | `test_massive_errors.py:65,75,86` | Production behavior is correct and was executed directly. The mandatory test is WEAK: the `ProviderUnavailable` populated case is unasserted — IR-001. |
| DAC-E3-S3-6 | SATISFIED | `errors.py:135-148` `is_rate_limited_body` returns `bool`, constructs no `MassiveError` | `test_massive_error_classification.py:207,217` | Flow-control seam is a predicate, so a 429 cannot become a failure through it. Negative test confirms no other fixture is flagged. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `bca62bc` creates `errors.py` + both test modules; `models.py` and the package survive | E3-S2's package retained as required. |
| T002 | complete | VERIFIED | `test_massive_error_classification.py:47,63,89,101,113,126,139` | TC-COMP-196/197/198/220/222 all present with body-only fixtures; no status code or header used. |
| T003 | complete | **PARTIAL** | `test_massive_errors.py:31-126` | All three behaviors appear, but the `request_id`-when-present case is unproven for `ProviderUnavailable` (IR-001) and the TC-ID labels are mis-mapped (IR-002). |
| T004 | complete | VERIFIED | `test_massive_error_classification.py:152` | Uses a genuine E3-S2 `ValidationError`, not a stub; `pytest.fail` guards fixture meaningfulness. |
| T005 | complete | VERIFIED | `test_massive_error_classification.py:185,207` | TC-COMP-223/225 present; correctly stops at the classification seam without testing governor retry. |
| T006 | complete | VERIFIED | `test_massive_errors.py:132,150` | TC-COMP-011 asserts the reason is constructed, not the forwarded raw body. |
| T007 | complete | VERIFIED | `test_massive_error_classification.py:230,241,252` | All three named boundaries covered, including the spurious-credential-field case. |
| T008 | complete | VERIFIED | `errors.py:65-104` | Base stores only message + optional `request_id`; no raw SDK body or credential retained. |
| T009 | complete | VERIFIED | `errors.py:107-220` | Classification order matches §2.4 and the story's Technical Details exactly. |
| T010 | complete | VERIFIED | `__init__.py:26-58` | Taxonomy and all four primitives exported; `BadResponse` is neither imported nor re-exported anywhere in the package. |
| T012 | complete | VERIFIED | `CAP-001-E3-S3-tdd-evidence.yaml` | Six mutations documented; mutation-1's honest "NOT CAUGHT" plus the STRENGTHEN step is corroborated by `error_not_found_status_only.json` and the test at line 73 existing in the tree. Results reproduce. |

There is no T011 in the approved plan (it runs T001–T010 then T012); the gap is
inherited from the plan, not a missing implementation.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_all_four_taxonomy_types_exist_and_derive_from_massive_error` / TC-COMP-196 | ADEQUATE | Structural: all four subclass `MassiveError`, which subclasses `Exception`. Appropriate for a type-existence criterion. | none |
| `test_status_not_found_classifies_as_instrument_not_found`, `…_status_only…` / TC-COMP-220 | ADEQUATE | The second isolates `status` from message text (and pre-asserts the fixture lacks the not-found text), so `status` alone is proven to drive classification. Kills mutation-1. | none |
| `test_message_field_is_accepted_for_not_found`, `test_error_field_is_accepted_for_credential_rejection`, `test_neither_message_nor_error_is_required` / TC-COMP-197 | ADEQUATE | Each pre-asserts fixture shape before classifying, so the test cannot pass for the wrong reason. Covers both field names and the neither case. | none |
| `test_malformed_json_classifies_as_provider_unavailable_never_not_found` / TC-COMP-198 | ADEQUATE | Asserts the positive type **and** the negated dangerous type, matching the story's explicit instruction. | none |
| `test_valid_json_of_unknown_shape_classifies_as_provider_unavailable` / TC-COMP-222 | ADEQUATE | Valid JSON object of unknown shape → safe default. | Non-object JSON (`[1,2]`, `null`) unexercised — IR-003. |
| `test_validation_error_from_a_successful_response_wraps_to_contract_violation` / TC-COMP-199 | ADEQUATE | Real Pydantic `ValidationError`, `request_id` propagation, and two leak assertions on parsed values. A mutation returning `ProviderUnavailable` is killed; so is one forcing `provider_request_id=None`. | none |
| `test_classify_error_body_never_returns_contract_violation` | ADEQUATE | Pins the owner's precedence resolution so a future drift back to the design's illustrative prose fails. | none |
| `test_contract_violation_is_fatal_for_the_governor_classifier`, `test_provider_unavailable_is_the_only_retryable_type` / TC-COMP-223 | ADEQUATE | All four types asserted with exact `is True`/`is False`. | none |
| `test_rate_limited_body_is_identified_without_constructing_any_massive_error`, `test_non_rate_limited_bodies_are_not_flagged…` / TC-COMP-225 | ADEQUATE | Positive plus four negatives. Because the seam returns `bool`, no `MassiveError` can be constructed through it; a short-circuit mutation is killed. | `message`-field fallback unpinned — IR-004. |
| `test_unknown_api_key_classifies_as_credential_rejected`, `test_malformed_authorization_header…`, `test_credential_rejected_never_contains_the_credential_value` / TC-COMP-221 (labeled TC-COMP-207) | ADEQUATE | Both probe-confirmed 401 bodies; marker-removal mutation kills three tests. | Mis-labeled TC-ID — IR-002. |
| `test_request_id_is_populated_when_present`, `test_request_id_is_none_when_absent_never_fabricated`, `test_every_taxonomy_type_carries_request_id_uniformly` / TC-COMP-224 (labeled TC-COMP-221) | **WEAK** | Proves the populated case for `InstrumentNotFound` and `CredentialRejected` and the absent case. For `ProviderUnavailable` it asserts only `is None`, using a fixture that carries no `request_id`, so "uniformly" is not established. | Populated `ProviderUnavailable` case — IR-001. Mis-labeled TC-ID — IR-002. |
| `test_no_credential_fixture_in_str_repr_or_captured_log` / TC-COMP-207 (labeled TC-COMP-224) | ADEQUATE | Loops five fixtures, logs each through a real `logging` logger under `caplog`, and asserts on `str`, `repr` and `caplog.text`. Genuinely exercises the disclosure boundary rather than mock setup. | Mis-labeled TC-ID — IR-002. |
| `test_not_found_failure_retains_safe_request_id_bearing_reason`, `test_not_found_reason_never_exposes_the_raw_sdk_response_body` / TC-COMP-011 | ADEQUATE | Asserts the raw body is absent and that no `{` or `request_id` text appears, so forwarding the envelope verbatim would fail. | none |
| `test_not_found_message_recognised_when_status_is_absent`, `test_absent_message_and_error_still_produces_provider_unavailable`, `test_classification_never_touches_a_provider_url_or_credential` (T007) | ADEQUATE | The third pre-asserts the fixture really contains `SECRET_TEST_TOKEN_ABC123`, then asserts its absence from `str`/`repr` plus the absence of the host — a correctly constructed leak test. | none |

General properties verified across both modules: no mocks or patches are used at
all (fixtures are real files, the unit under test is the real function), so no
mock can make a result inevitable; there is no network, clock, random, or
environment dependence; no shared mutable state or ordering dependence exists;
and `uv run pytest -p no:randomly` is unnecessary because every test is
self-contained. Fixture paths resolve via `Path(__file__).resolve().parents[1]`,
so tests are CWD-independent.

### Independent Mutation Probing

Conducted by copying the module to a scratch directory outside the repository
and loading the mutant via `PYTHONPATH` against the repository's real tests; the
working tree was never modified (confirmed clean after every run, and mutant
activation confirmed by `inspect.getsource`).

| Mutation | Outcome |
|----------|---------|
| Drop `provider_request_id=request_id` from the `ProviderUnavailable` branch (`errors.py:183-186`) | **SURVIVED** — 26 passed. Basis for IR-001. |
| Remove the `if not isinstance(parsed, dict): return None` guard (`errors.py:121-122`) | **SURVIVED** — 26 passed. Basis for IR-003. |
| `reason = fields["error"] or fields["message"] or ""` → `fields["error"] or ""` in `is_rate_limited_body` | **SURVIVED** — 26 passed. Basis for IR-004. |
| Drop `provider_request_id=request_id` from the `CredentialRejected` branch | killed (1 failed) |
| Force `wrap_validation_error` to pass `provider_request_id=None` | killed (1 failed) |
| Disable the not-found branch entirely | killed (5 failed) |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_errors.py tests/unit/test_massive_error_classification.py -q` | worktree root | 0 | PASS | 26 passed in 0.06s |
| `uv run pytest -m 'not postgres' -q` | worktree root | 0 | PASS | 207 passed, 59 deselected, 2 warnings in 12.83s (warnings pre-existing, from `starlette.testclient`/`anyio`) |
| `uv run ruff check .` | worktree root | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | worktree root | 0 | PASS | 89 files already formatted |
| `uv run mypy src` | worktree root | 0 | PASS | Success: no issues found in 27 source files |
| `uv build` | worktree root | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` |
| `uv run pytest` (full, including `postgres`) | worktree root | N/A | NOT RUN | The 59 `postgres`-marked tests require a live database container not available in this environment. The story's own Validation section requires only the `not postgres` subset; this story's module performs no I/O and imports nothing database-related, so the deselected set cannot be affected by it. Recorded as a validation gap, not as evidence of a defect. |

All figures reproduce the TDD evidence file's claims independently. The evidence
records "206 passed" at GREEN and "207 passed" after the mutation session added
the strengthened test; the current tree yields 207, consistent with that
sequence.

### Validation Side Effects

- Before: clean — `git status --porcelain -uall` empty.
- After: clean — `git status --porcelain -uall` empty, re-checked after `uv build`.
- Unexpected tracked-file changes: none. `uv build` wrote to `dist/`, which is
  git-ignored and produced no tracked-file modification.

## Findings

### IR-001 — TC-COMP-224/DAC-E3-S3-5 does not test request-ID propagation on the `ProviderUnavailable` path

- **Severity**: HIGH
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S3-5, DAC-E3-13
- **Tasks**: T003
- **Files**: `tests/unit/test_massive_errors.py:86` (`test_every_taxonomy_type_carries_request_id_uniformly`), `src/factorflow/ingestion/massive/errors.py:183-186`
- **Claim challenged**: T003's claim to have implemented TC-COMP-224, and the
  test's own name and docstring — "DAC-E3-S3-5 applies to every typed error, not
  only `InstrumentNotFound`".
- **Observed evidence**: The test exercises `ProviderUnavailable` via
  `error_unknown_shape.json`, which contains no `request_id`, and asserts
  `unavailable.provider_request_id is None`. No test anywhere asserts a populated
  `provider_request_id` on a `ProviderUnavailable`, even though
  `error_missing_message_and_error.json` already routes to that branch carrying
  `req_missing_001` (confirmed at runtime). Deleting
  `provider_request_id=request_id` from `errors.py:185` leaves all 26 tests
  passing.
- **Expected evidence/behavior**: DAC-E3-S3-5 and TC-COMP-224 require that for
  **every** typed error `provider_request_id` is populated from the response when
  present. The story's Testing section lists "`provider_request_id` is populated
  when present and `None` when absent" as a minimum test, and DAC-E3-13 makes the
  `request_id` the identifier carried on every stored failure reason.
- **Impact**: The default and highest-traffic classification path can silently
  lose the provider's `request_id` without any test failing. That is precisely
  the identifier DAC-E3-13 exists to preserve for provider-side tracing, and
  `ProviderUnavailable` is the one type the governor retries, so its failure
  records are the ones most likely to need tracing.
- **Required remediation**: Assert a populated `provider_request_id` on a
  `ProviderUnavailable` produced by `classify_error_body` from a parseable
  envelope that carries one (`error_missing_message_and_error.json` suffices, no
  new fixture needed), so that removing the propagation fails a test. Align the
  `…_uniformly` test's assertions with its stated claim, or narrow its name.

### IR-002 — Mandatory TC-ID traceability comments are mis-mapped against the coverage matrix

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-13, DAC-E3-S3-2, DAC-E3-S3-5
- **Tasks**: T003 (Phase 2 checkpoint)
- **Files**: `tests/unit/test_massive_errors.py:28`, `:62`, `:98`
- **Claim challenged**: The Phase 2 checkpoint's claim that "TC-COMP-011,
  196–199, 207, and 220–225 have traceability comments".
- **Observed evidence**: The coverage matrix
  (`docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/coverage-matrix.md:239,253,256`)
  and the test specification
  (`tests/component/all-component-tests.md:4561,4869,4935`) map TC-COMP-207 →
  DAC-E3-13, TC-COMP-221 → DAC-E3-S3-2 (API-key → `CredentialRejected`, no
  credential disclosed), and TC-COMP-224 → DAC-E3-S3-5 (`request_id` present/
  absent). The test file labels the API-key section `TC-COMP-207 / DAC-E3-S3-2`
  (line 28), the request-ID section `TC-COMP-221 / DAC-E3-S3-5` (line 62), and
  the credential/log section `TC-COMP-224` (line 98). TC-COMP-221 and TC-COMP-224
  are therefore swapped, and TC-COMP-207 is attached to the wrong DAC.
- **Expected evidence/behavior**: Traceability comments must match the component
  test specification's TC-ID → requirement mapping, per the Phase 2 checkpoint
  and the constraint that mandatory TC-IDs "retain traceability to the component
  test specification".
- **Impact**: All three behaviors are in fact covered, so no criterion is
  untested. But doc-sync and the Phase 6b automation traceability inherit these
  IDs, and a future reader verifying DAC-E3-S3-5 is pointed at the credential-leak
  test rather than the request-ID test — which is exactly the mapping that
  concealed IR-001.
- **Required remediation**: Relabel the three section comments so TC-COMP-207
  names DAC-E3-13, TC-COMP-221 names DAC-E3-S3-2, and TC-COMP-224 names
  DAC-E3-S3-5. No test logic need change.

### IR-003 — The non-object-JSON guard in `_safe_fields` has no regression test

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-4, DAC-E3-S3-3
- **Tasks**: T002, T009
- **Files**: `src/factorflow/ingestion/massive/errors.py:121-122`, `tests/unit/test_massive_error_classification.py:139`
- **Claim challenged**: That the malformed/unknown-envelope tests cover the
  module's safe-default path.
- **Observed evidence**: Removing `if not isinstance(parsed, dict): return None`
  leaves all 26 tests passing. Every fixture is either a JSON object or
  unparseable text; none is valid JSON that is not an object. Without the guard,
  `parsed.get(...)` raises `AttributeError` — verified that the current code
  correctly returns `ProviderUnavailable` for `[1,2]`, `null`, `"text"` and `42`.
- **Expected evidence/behavior**: DAC-E3-4 and DAC-E3-S3-3 require a payload that
  does not present a usable envelope to become `ProviderUnavailable`, never an
  escaping exception. The guard implements that; the test suite should pin it.
- **Impact**: The implementation is correct today, so no criterion is violated.
  But a refactor deleting the guard would let an unhandled `AttributeError`
  escape the provider boundary instead of producing the safe default — the class
  of failure this module exists to prevent — with a fully green suite.
- **Required remediation**: Add a classification test feeding valid JSON that is
  not an object (a JSON array or scalar) and asserting `ProviderUnavailable`.

### IR-004 — `is_rate_limited_body`'s `message` fallback is unreachable by any fixture and unpinned by any test

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S3-6
- **Tasks**: T005, T009
- **Files**: `src/factorflow/ingestion/massive/errors.py:147`
- **Claim challenged**: That the rate-limit predicate's inputs are all exercised.
- **Observed evidence**: `reason = fields["error"] or fields["message"] or ""`.
  Narrowing this to `fields["error"] or ""` leaves all 26 tests passing. Design
  §2.6a records the 429 body as carrying `error`, and `error_rate_limited.json`
  matches; no fixture carries a rate-limit text under `message`.
- **Expected evidence/behavior**: Either the fallback covers a real provider
  shape and a test pins it, or it is speculative and AGENTS.md's "no speculative
  features" rule applies.
- **Impact**: Minor. A small amount of untested, currently unreachable branch
  logic in the component the design names its most fragile.
- **Required remediation**: Either add a fixture with the rate-limit text under
  `message` and assert `is_rate_limited_body` is `True`, or narrow the expression
  to the documented `error` field.

### IR-005 — Inaccurate inline comment on the validation-failure fixture

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T004
- **Files**: `tests/unit/test_massive_error_classification.py:157`
- **Claim challenged**: The comment `# missing h/l/c/v/vw/n`.
- **Observed evidence**: The dict is `{"t": …, "o": 187.15, "h": 188.44}` — `h`
  is present, so the comment lists a field the fixture supplies. The test itself
  is correct and meaningful (guarded by `pytest.fail`).
- **Expected evidence/behavior**: Comments should describe the fixture they
  annotate.
- **Impact**: None on behavior; a small maintenance trap in the module the design
  flags as carrying the most tests.
- **Required remediation**: Correct the comment to list only the absent fields.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified deviation — `ProviderContractViolation` scope.** The story's
  Technical Details (line 93) and design §2.4's `ProviderContractViolation`
  docstring both describe it as also covering an unparseable error envelope,
  which contradicts DAC-E3-4, DAC-E3-S3-3, the mandatory test list and the
  coverage matrix. The task plan Notes record the owner's precedence resolution
  in favour of `ProviderUnavailable`, naming the conflicting lines non-normative.
  The implementation follows the resolution, documents it at `errors.py:22-27`
  and `:157-161`, and pins it with
  `test_classify_error_body_never_returns_contract_violation`. Correctly handled.
- **Plan numbering.** The approved plan contains no T011 (T001–T010, then T012).
  Inherited from the plan; no implementation gap.
- **Stale task-plan header.** `CAP-001-E3-S3-tasks.md:33` names the branch as
  `usr/alvaro-de-jodra/CAP-001-E2-S4`; the actual branch is
  `usr/alvaro-de-jodra/CAP-001-E3-S3`. A pre-existing planning-artifact error,
  not introduced by this story's coding, and the task plan is not this agent's to
  edit.
- **Pipeline-state check reads the wrong tree.**
  `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability
  CAP-001 --story … --stage adversarial-review` exits 1 with "BLOCKED — story
  coding has not reached in-review", because it reads
  `repos/factorflow-v2/FactorFlow-v2`, which sits on
  `usr/alvaro-de-jodra/CAP-001-E5-tasks` where the story still reads
  `status: planning`. At the reviewed HEAD in this worktree the story reads
  `status: in-review` (set by `d1cb174`). The block is an artifact of the
  stacked-worktree layout, not a real state failure, so the review proceeded
  against the worktree. It will clear once this branch is merged or checked out
  in the canonical repo.
- **Environment discrepancy recorded for the orchestrator.** This session's
  declared primary working directory was the `pipeline-run-E3-S4-root` worktree
  while the task directed a review of CAP-001-E3-S3. The review was performed
  entirely in `.claude/worktrees/pipeline-run-E3-S3-root/FactorFlow-v2` on
  `usr/alvaro-de-jodra/CAP-001-E3-S3`; no sibling worktree was read or modified.
- No scope leakage: every changed file maps to a planned task, and nothing in the
  E3-S2 baseline was altered or removed.

## Follow-Up

- **Next agent**: Coding Agent, then Adversarial Review Agent for v2.
- **Required action**: Resolve IR-001 (blocking). Address IR-002 and IR-003 in
  the same rework pass — both are small, IR-002 is comment-only, and IR-002 is
  what made IR-001 easy to miss. IR-004 and IR-005 are optional. No production
  logic change is required by any finding: `errors.py` behaves correctly on every
  path probed, and the rework is confined to test strength and traceability
  labels.
- **Warnings accepted downstream**: N/A — verdict is CHANGES-REQUIRED.
