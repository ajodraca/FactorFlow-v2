---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-12
updated: 2026-09-12
story_id: "CAP-001-E3-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-12T20:14:54Z"
reviewed_head: "5d10e86ccde88670af38ee1598a2d0878e9fd7a5"
review_base: "701e7fb636d96f6162556ca8a51b59d47c871f84"
reviewed_state_revision: "sha256:da51ec6a1e71a48bbd3b9df0e86978f0e1e1dbb8531f41e831934e94a3b81ed2"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-09-12T20:14:54Z
  source_artifacts:
    - id: CAP-001-E3-S3
      version: "1"
    - id: CAP-001-E3-S3-tasks
      version: "1"
    - id: CAP-001-E3-S3-implementation-review
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 0 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 11/11 verified |
| Required validation | 6/6 passed |

This is a rework verification of the five findings in
`CAP-001-E3-S3-implementation-review-v1.md`. All five are resolved, and each
resolution was re-derived from the repository rather than accepted from the
rework commit message.

The blocking finding, v1/IR-001, is genuinely closed. The strengthened
`test_every_taxonomy_type_carries_request_id_uniformly` now classifies
`error_missing_message_and_error.json`, asserts the result is a
`ProviderUnavailable`, and asserts its `provider_request_id` equals
`req_missing_001`. Re-running v1's exact surviving mutation — deleting
`provider_request_id=request_id` from the `ProviderUnavailable` branch of
`classify_error_body` — now fails that test (1 failed, 29 passed), where it
previously survived all 26 tests. v1/IR-003 is closed the same way: the new
parametrized `test_non_object_json_classifies_as_provider_unavailable_not_a_crash`
kills the `isinstance(parsed, dict)` guard-removal mutation in four of four
parameter cases. v1/IR-002's TC-ID labels now match the coverage matrix and the
component test specification exactly. v1/IR-004 was resolved by taking the
finding's second option — narrowing `is_rate_limited_body` to the documented
`error` field — which matches design §2.6a's probe-confirmed 429 row, and
v1/IR-005's fixture comment is now accurate against `DailyBar`'s real required
fields.

Validation is stronger than at v1: the one gap v1 recorded — `uv run pytest`
including the 59 `postgres`-marked tests — was closed in this session, because a
container runtime is available here. All 270 tests pass, and the working tree is
clean before and after every command.

Two MEDIUM findings remain, neither of which makes any acceptance criterion,
required task, mandatory test, or required validation command incomplete. IR-001
(v2) records that the `_str_or_none` coercion in `_safe_fields` — the guard that
keeps a non-string `message` from raising `AttributeError` out of the provider
boundary — is still unpinned by any test; it is the same class of defensive-guard
gap as v1/IR-003, one level deeper, and was found by fresh mutation probing
rather than inherited. IR-002 (v2) records that
`CAP-001-E3-S3-tdd-evidence.yaml` was not updated for the rework cycle, so the
durable TDD record still ends at commit `18051ee` and claims 207 passing tests
while the tree now has 211 (`not postgres`) and 30 story tests. Both are
recorded as warnings accepted downstream.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tasks.md` |
| Component | FactorFlow-v2 (reviewed in worktree `.claude/worktrees/pipeline-run-E3-S3-root/FactorFlow-v2`) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S3` |
| HEAD | `5d10e86ccde88670af38ee1598a2d0878e9fd7a5` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E3-S2` merge-base `701e7fb636d96f6162556ca8a51b59d47c871f84` |
| Working tree | clean (`git status --porcelain -uall` empty before and after all validation) |
| Changed files reviewed | 19 since the base; 4 changed by the rework commit |

The base is the merge-base with `usr/alvaro-de-jodra/CAP-001-E3-S2`, not `main`,
because this branch is stacked on E3-S2's unmerged `models.py`. Six commits now
compose the story: `bca62bc` (Phase 1), `4783790` (Phase 2 RED), `43c3526`
(Phase 3 GREEN), `18051ee` (Phase 4), `d1cb174` (Phase 5), `c7a2d93` (the v1
review report), and the rework `5d10e86`.

### Changed Files

Only the four files below changed since the v1-reviewed HEAD (`d1cb174`). The
remaining fifteen files were verified unchanged by `git diff d1cb174..HEAD` and
carry v1's dispositions forward.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `tests/unit/test_massive_errors.py` | modified by rework | T003 — v1/IR-001 strengthening, v1/IR-002 TC-ID relabelling |
| `tests/unit/test_massive_error_classification.py` | modified by rework | T002/T009 — v1/IR-003 new test; T004 — v1/IR-005 comment fix |
| `src/factorflow/ingestion/massive/errors.py` | modified by rework | T009 — v1/IR-004 narrowing of `is_rate_limited_body` |
| `…/CAP-001-E3-S3-tasks.md` | modified by rework | frontmatter only: `updated` date and `last_reworked_review` |
| `…/CAP-001-E3-S3-implementation-review-v1.md` | added (`c7a2d93`) | the v1 gate report |
| `src/factorflow/ingestion/massive/__init__.py` | unchanged since v1 | T010 |
| 11 fixtures under `tests/fixtures/massive/` | unchanged since v1 | T002, T003, T005, T007, T012 |
| `…/CAP-001-E3-S3.md` | unchanged since v1 | `status: in-review` |
| `…/CAP-001-E3-S3-tdd-evidence.yaml` | unchanged since v1 | T012 — see IR-002 |

No unjustified file is present. The rework introduced no new dependency, no
configuration change, and no file outside the story's declared surface;
`pyproject.toml` and `uv.lock` remain untouched. No fixture was added by the
rework — the IR-001 strengthening reuses `error_missing_message_and_error.json`
exactly as v1's remediation note suggested, and the IR-003 test uses inline
literals.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `errors.py:81` `InstrumentNotFound`; `errors.py:171-175` | `test_massive_errors.py:137` `test_not_found_failure_retains_safe_request_id_bearing_reason` | Unchanged since v1. Mutation disabling the not-found branch still kills 5 tests. |
| DAC-E3-2 | SATISFIED | `errors.py:65-104` — exactly four subclasses of `MassiveError` | `test_massive_error_classification.py:47` | `__all__` (`errors.py:44-54`) exports no fifth failure type. |
| DAC-E3-3 | SATISFIED | `errors.py:168` `reason = fields["error"] or fields["message"] or ""`; `_safe_fields` uses `.get` throughout | `test_massive_error_classification.py:89,101,113` | Re-verified the `message` fallback is load-bearing here: narrowing it to `fields["error"] or ""` in `classify_error_body` kills a test (1 failed). v1/IR-004's narrowing was applied **only** inside `is_rate_limited_body`, not here. |
| DAC-E3-4 | SATISFIED | `errors.py:116-122,164-165` | `test_massive_error_classification.py:126,149` | Strengthened by the rework: the new non-object-JSON test now also covers the "parses but is not an envelope" case. Mutation making an unparseable body `InstrumentNotFound` kills 5 tests. |
| DAC-E3-5 | SATISFIED | `errors.py:203-220` `wrap_validation_error` | `test_massive_error_classification.py:165` | Uses a real `ValidationError` from E3-S2's `DailyBar`; fixture comment now accurate (v1/IR-005). |
| DAC-E3-13 | SATISFIED | `errors.py:76-78`; `_safe_fields` whitelist at `errors.py:127-132` | `test_massive_errors.py:52,87,106` | The request-ID half is no longer weak: the `ProviderUnavailable` populated case is now asserted. The credential-disclosure test is correctly labelled TC-COMP-207 / DAC-E3-13. |
| DAC-E3-S3-1 | SATISFIED | `errors.py:171` `status == _NOT_FOUND_STATUS` | `test_massive_error_classification.py:63,73` | Breaking `_NOT_FOUND_MESSAGE_MARKER` kills 1 test; the status-only test isolates `status` from message text. |
| DAC-E3-S3-2 | SATISFIED | `errors.py:177-181`, markers `errors.py:60` | `test_massive_errors.py:32,42,52` | Dropping `"authorization header"` from the marker tuple kills 1 test, so both probe-confirmed 401 bodies are independently pinned. |
| DAC-E3-S3-3 | SATISFIED | `errors.py:183-186` unconditional safe default; `errors.py:121-122` non-dict guard | `test_massive_error_classification.py:139,149,184` | Both the unknown-object and the non-object cases now classify to the safe default with tests that fail if the behavior changes. |
| DAC-E3-S3-4 | SATISFIED | `errors.py:189-200` `is_fatal_for_governor` | `test_massive_error_classification.py:198,209` | `return True` mutation kills 1 test. No `Outcome` import anywhere in the package, so E3-S4 ownership holds. |
| DAC-E3-S3-5 | SATISFIED | `errors.py:169,174,180,185` | `test_massive_errors.py:66,76,87` | **Resolved from v1.** Dropping `provider_request_id` on the `ProviderUnavailable` branch now fails `test_every_taxonomy_type_carries_request_id_uniformly`; dropping it on the `InstrumentNotFound` branch fails 3 tests; on `CredentialRejected`, 1 (v1). |
| DAC-E3-S3-6 | SATISFIED | `errors.py:135-148` `is_rate_limited_body` returns `bool` and constructs no `MassiveError` | `test_massive_error_classification.py:220,230` | Narrowing the reason lookup to `error` matches design §2.6a line 488, whose probe-confirmed 429 body carries `error`. Forcing the predicate to `False` kills 1 test. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `bca62bc`; both test modules and `errors.py` exist, E3-S2's package retained | Unchanged since v1. |
| T002 | complete | VERIFIED | `test_massive_error_classification.py:47,63,73,89,101,113,126,139,149` | TC-COMP-196/197/198/220/222 present, body-only fixtures, no status code or header used. v1/IR-003 closed by the added non-object-JSON test. |
| T003 | complete | **VERIFIED** (was PARTIAL at v1) | `test_massive_errors.py:29-131` | Both reasons for the v1 PARTIAL are gone: the request-ID-when-present case for `ProviderUnavailable` is asserted (`:93,98,99`) and the three TC-ID labels match the coverage matrix. |
| T004 | complete | VERIFIED | `test_massive_error_classification.py:165` | Genuine E3-S2 `ValidationError`, `pytest.fail` guard intact; fixture comment corrected. |
| T005 | complete | VERIFIED | `test_massive_error_classification.py:198,220` | TC-COMP-223/225 present; still stops at the classification seam without testing governor retry. |
| T006 | complete | VERIFIED | `test_massive_errors.py:137,155` | TC-COMP-011 asserts the reason is constructed, not the forwarded raw body. |
| T007 | complete | VERIFIED | `test_massive_error_classification.py:243,254,265` | All three named boundaries covered, including the spurious-credential-field case. |
| T008 | complete | VERIFIED | `errors.py:65-104` | Base stores only message + optional `request_id`. |
| T009 | complete | VERIFIED | `errors.py:107-220` | Classification order still matches §2.4 and the story's Technical Details. The one production change — `errors.py:147` — narrows only the 429 predicate and is design-conformant. |
| T010 | complete | VERIFIED | `__init__.py:26-58` | Unchanged; `BadResponse` neither imported nor re-exported anywhere in the package. |
| T012 | complete | VERIFIED (with IR-002) | `CAP-001-E3-S3-tdd-evidence.yaml` | The original cycle's six mutations are documented and all six results reproduce. The file was not extended for the rework cycle — IR-002. |

The approved plan contains no T011 (T001–T010, then T012); the gap is inherited
from the plan. Counting the plan's eleven actual tasks, all eleven are VERIFIED.

## Test Quality Assessment

Only the tests the rework touched or added are re-assessed in depth; the
remainder were re-read and re-confirmed ADEQUATE against v1's assessment, with
their mutation sensitivity re-established independently below.

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_every_taxonomy_type_carries_request_id_uniformly` / TC-COMP-224 | **ADEQUATE** (was WEAK) | Now classifies four bodies and asserts three distinct outcomes: `InstrumentNotFound` → `req_notfound_001`, `CredentialRejected` → `req_cred_001`, `ProviderUnavailable` from `error_missing_message_and_error.json` → `req_missing_001`, and `ProviderUnavailable` from `error_unknown_shape.json` → `None`. The `isinstance(unavailable_with_id, ProviderUnavailable)` assertion prevents the test passing for the wrong reason if classification drifts. The name and docstring now match what the body proves. | none |
| `test_non_object_json_classifies_as_provider_unavailable_not_a_crash` (DAC-E3-4 / DAC-E3-S3-3) | ADEQUATE | Parametrized over `[1, 2]`, `null`, `"text"`, `42` — an array, a null, a string and a number, which are the four non-object JSON shapes. Asserts the safe type rather than merely "no exception", so it pins behavior and not just absence of a crash. | Does not extend to non-string *field values* — IR-001. |
| `test_request_id_is_populated_when_present`, `test_request_id_is_none_when_absent_never_fabricated` / TC-COMP-224 | ADEQUATE | Unchanged assertions; labels corrected. `parsed.get("request_id")` → `parsed.get("requestId")` mutation kills 3 tests. | none |
| `test_unknown_api_key_classifies_as_credential_rejected`, `test_malformed_authorization_header…`, `test_credential_rejected_never_contains_the_credential_value` / TC-COMP-221 | ADEQUATE | Unchanged assertions; labels corrected to TC-COMP-221 / DAC-E3-S3-2, matching `coverage-matrix.md:253` and `all-component-tests.md:4869`. | none |
| `test_no_credential_fixture_in_str_repr_or_captured_log` / TC-COMP-207 | ADEQUATE | Unchanged: five fixtures logged through a real `logging` logger under `caplog`, asserting on `str`, `repr` and `caplog.text`. Label corrected to TC-COMP-207 / DAC-E3-13, matching `coverage-matrix.md:239` and `all-component-tests.md:4561`. | none |
| `test_validation_error_from_a_successful_response_wraps_to_contract_violation` / TC-COMP-199 | ADEQUATE | Unchanged logic; the fixture comment now lists only `l/c/v/vw/n`, verified against `DailyBar.model_fields` (required aliases `t,o,h,l,c,v,vw,n`; the fixture supplies `t,o,h`). | none |
| `test_rate_limited_body_is_identified…`, `test_non_rate_limited_bodies_are_not_flagged…` / TC-COMP-225 | ADEQUATE | Still a `bool` predicate, so no `MassiveError` can be constructed through the seam. v1/IR-004's unpinned `message` fallback no longer exists, so there is no longer an unreachable branch to pin. | none |
| All other tests (TC-COMP-011, 196, 197, 198, 220, 222, 223 and the three T007 boundary tests) | ADEQUATE | Re-read at the reworked HEAD; byte-identical to the v1-reviewed versions apart from the comment fix. All 12 mandatory TC-IDs are present with traceability comments (verified by grep: TC-COMP-011, 196–199, 207, 220–225). | none |

General properties re-verified at this HEAD: no mocks or patches anywhere in
either module, so no mock can make a result inevitable; the units under test are
the real functions; no network, clock, random, or environment dependence; no
shared mutable state or ordering dependence; fixture paths resolve via
`Path(__file__).resolve().parents[1]`, so tests are CWD-independent. The one new
test is parametrized over literals and touches no filesystem at all.

### Independent Mutation Probing

Conducted by copying `src/factorflow` into a scratch directory outside the
repository, mutating the copy, and running the repository's real tests with that
directory first on `PYTHONPATH`. Shadowing was confirmed by
`inspect.getsourcefile`, which reported the scratch path. The working tree was
never modified (`git status --porcelain -uall` empty throughout and after).
Ten mutations, each applied and reverted individually:

| Mutation | Outcome |
|----------|---------|
| Drop `provider_request_id=request_id` from the `ProviderUnavailable` branch (`errors.py:183-186`) — **v1/IR-001's surviving mutation** | **KILLED** — 1 failed, 29 passed (`test_every_taxonomy_type_carries_request_id_uniformly`) |
| Remove `if not isinstance(parsed, dict): return None` (`errors.py:121-122`) — **v1/IR-003's surviving mutation** | **KILLED** — 4 failed, 26 passed (all four parameter cases of the new test) |
| `is_rate_limited_body` reason forced to `""` | KILLED — 1 failed, 29 passed |
| Drop the `fields["message"]` fallback in `classify_error_body` (`errors.py:168`) | KILLED — 1 failed, 29 passed (confirms the narrowing was correctly confined to the 429 predicate) |
| Drop `provider_request_id=request_id` from the `InstrumentNotFound` branch | KILLED — 3 failed, 27 passed |
| `is_fatal_for_governor` → `return True` | KILLED — 1 failed, 29 passed |
| `_NOT_FOUND_MESSAGE_MARKER` → a never-matching string | KILLED — 1 failed, 29 passed |
| `_API_KEY_ERROR_MARKERS` → `("api key",)` only | KILLED — 1 failed, 29 passed |
| Unparseable body → `InstrumentNotFound` instead of `ProviderUnavailable` | KILLED — 5 failed, 25 passed |
| `_str_or_none` → `return value` (pass non-strings through, `errors.py:124-125`) | **SURVIVED** — 30 passed. Basis for IR-001. |

For the surviving mutation, the guard was confirmed load-bearing rather than
decorative: against the mutant,
`classify_error_body('{"message": {"a": 1}, "request_id": 7}')` raises
`AttributeError: 'dict' object has no attribute 'lower'`, while the real module
returns `ProviderUnavailable` with `provider_request_id=None`.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_errors.py tests/unit/test_massive_error_classification.py -q` | worktree root | 0 | PASS | 30 passed in 0.07s (26 at v1; +4 from the parametrized non-object test) |
| `uv run pytest -m 'not postgres' -q` | worktree root | 0 | PASS | 211 passed, 59 deselected, 2 warnings in 12.72s (warnings pre-existing, from `starlette.testclient`/`anyio`) |
| `uv run pytest` (full, including `postgres`) | worktree root | 0 | PASS | 270 passed, 2 warnings in 19.75s. **Closes the validation gap v1 recorded as NOT RUN** — a container runtime is available in this session, so the constitution-defined full test command was run rather than substituted. |
| `uv run ruff check .` | worktree root | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | worktree root | 0 | PASS | 89 files already formatted |
| `uv run mypy src` | worktree root | 0 | PASS | Success: no issues found in 27 source files |
| `uv build` | worktree root | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` |

Every command in the task plan's Validation Plan was run; none was substituted
or skipped.

### Validation Side Effects

- Before: clean — `git status --porcelain -uall` empty at `5d10e86`.
- After: clean — `git status --porcelain -uall` empty, re-checked after `uv build`,
  after the full `postgres` run, and after the entire mutation session.
- Unexpected tracked-file changes: none. `uv build` wrote to `dist/`, which is
  git-ignored. The `postgres` run started and tore down its own containers and
  left no repository artifact.

## Findings

### IR-001 — The non-string field-value coercion in `_safe_fields` has no regression test

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-4, DAC-E3-S3-3
- **Tasks**: T002, T009
- **Files**: `src/factorflow/ingestion/massive/errors.py:124-125` (`_str_or_none`), `tests/unit/test_massive_error_classification.py:149`
- **Claim challenged**: That the rework's non-object-JSON test closes the
  defensive-guard class of gap v1/IR-003 opened. It closes the top-level half
  only.
- **Observed evidence**: Replacing `return value if isinstance(value, str) else
  None` with `return value` leaves all 30 tests passing. Every fixture and every
  inline literal supplies string values for `status`, `message`, `error` and
  `request_id`, or omits them; none supplies a non-string value for one of the
  four whitelisted keys. Against that mutant,
  `classify_error_body('{"message": {"a": 1}, "request_id": 7}')` raises
  `AttributeError: 'dict' object has no attribute 'lower'` from
  `reason.lower()`; the real module returns `ProviderUnavailable` with
  `provider_request_id=None`, which was confirmed directly.
- **Expected evidence/behavior**: DAC-E3-4 and DAC-E3-S3-3 require a payload that
  does not present a usable envelope to become `ProviderUnavailable`, never an
  exception escaping the provider boundary. A JSON object whose `message` is a
  nested object parses successfully and matches no known case, so it falls
  squarely under DAC-E3-S3-3. The coercion implements that correctly; the suite
  should pin it, exactly as the rework pinned the non-dict guard one level up.
  A second consequence is typed: `provider_request_id` is annotated `str | None`
  (`errors.py:76`), and without the coercion a numeric `request_id` would be
  stored as an `int`, so the annotation is enforced only by this guard.
- **Impact**: The implementation is correct today, so no acceptance criterion is
  violated and nothing downstream is at risk as shipped. But a refactor removing
  the coercion — plausible, since it reads as defensive boilerplate — would let an
  unhandled `AttributeError` escape the component the design names its most
  fragile, with a fully green suite. This is the same failure class the module
  exists to prevent.
- **Required remediation**: Add a classification test feeding a JSON object whose
  `message` (or `error`) is a non-string value and whose `request_id` is a
  non-string value, asserting `ProviderUnavailable` and
  `provider_request_id is None`. One test closes both halves.

### IR-002 — The TDD evidence artifact was not updated for the rework cycle

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T012
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tdd-evidence.yaml`
- **Claim challenged**: The rework commit message's claim to have "verified each
  new/strengthened test fails against the pre-fix code by reproducing the
  reviewer's mutations in a scratch copy", and the task plan's Validation Plan
  requirement to "record test execution, commit hash, and manual mutation results
  in `CAP-001-E3-S3-tdd-evidence.yaml`".
- **Observed evidence**: `git show --stat 5d10e86` lists four files; the evidence
  file is not among them. The file still reads `updated: 2026-09-11`,
  `manual_mutations_baseline_commit: 18051ee`, and a
  `post_mutation_verification.result` of "207 passed, 59 deselected". The tree at
  `5d10e86` yields 211 passed / 59 deselected and 30 story tests, and the two
  mutations the rework was written to kill (v1/IR-001's and v1/IR-003's) appear
  nowhere in the file. The rework's RED observation for the new and strengthened
  tests therefore exists only in a commit message.
- **Expected evidence/behavior**: The task plan's Story-Specific Validation
  requires the RED → GREEN → MUTATE → STRENGTHEN → REFACTOR record — test
  execution, commit hash, and manual mutation results — to live in the versioned
  evidence artifact, which is what survives the commit log for doc-sync and
  Phase 6b. T012's checkpoint makes the same demand.
- **Impact**: No behavioral risk, and no test or validation gap: this reviewer
  reproduced both mutation kills independently, so the substance the record would
  have asserted is established by this report instead. The cost is durable
  traceability — the evidence artifact now understates the suite and omits the
  rework cycle entirely, and a future reader reconciling it against the tree will
  find counts that do not match.
- **Required remediation**: Append a rework cycle to
  `CAP-001-E3-S3-tdd-evidence.yaml` recording baseline commit `5d10e86`, the RED
  observation for the strengthened and added tests, the two reproduced mutations
  with their outcomes, and the current suite counts; refresh `updated`. No test
  or production change is required.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — TC-COMP-224/DAC-E3-S3-5 does not test request-ID propagation on the `ProviderUnavailable` path | **RESOLVED** | `tests/unit/test_massive_errors.py:87-100` now classifies `error_missing_message_and_error.json`, asserts `isinstance(..., ProviderUnavailable)` and `provider_request_id == "req_missing_001"`, and keeps the absent case on a second fixture. v1's surviving mutation (drop `provider_request_id=request_id` at `errors.py:183-186`) now fails that test: 1 failed, 29 passed. The docstring was rewritten to match what the test proves. |
| v1/IR-002 (MEDIUM) — Mandatory TC-ID traceability comments mis-mapped | **RESOLVED** | `test_massive_errors.py:29,33,43` → TC-COMP-221 / DAC-E3-S3-2; `:63,67,77,88` → TC-COMP-224 / DAC-E3-S3-5; `:103,109` → TC-COMP-207 / DAC-E3-13. Independently checked against `coverage-matrix.md:239,253,256` and the TC headings at `all-component-tests.md:4561,4869,4935`. All 12 mandatory TC-IDs are present in the two modules. |
| v1/IR-003 (MEDIUM) — Non-object-JSON guard in `_safe_fields` has no regression test | **RESOLVED** | `test_massive_error_classification.py:149-159`, parametrized over `[1, 2]`, `null`, `"text"`, `42`. Removing `if not isinstance(parsed, dict): return None` now fails 4 of 30 tests, where it previously survived all 26. The deeper field-value half of the same guard remains untested — raised separately as v2/IR-001, not a failure of this disposition. |
| v1/IR-004 (LOW) — `is_rate_limited_body`'s `message` fallback unreachable and unpinned | **RESOLVED** | `errors.py:147` is now `reason = fields["error"] or ""`. The finding offered narrowing as an explicit alternative to adding a fixture, and the narrowing matches design §2.6a line 488, whose probe-confirmed 429 body carries the text under `error`. Verified the change is confined to the 429 predicate: `classify_error_body` at `errors.py:168` still reads `fields["error"] or fields["message"] or ""`, and dropping that fallback kills a test. All 429 tests still pass and forcing the predicate false kills one. |
| v1/IR-005 (LOW) — Inaccurate inline comment on the validation-failure fixture | **RESOLVED** | `test_massive_error_classification.py:170` now reads `# missing l/c/v/vw/n`. Verified against `DailyBar.model_fields`: required aliases are `t,o,h,l,c,v,vw,n`; the fixture supplies `t,o,h`, so exactly `l,c,v,vw,n` are absent. |

No v1 finding is carried forward as STILL OPEN. Both v2 findings are new:
IR-001 was found by fresh mutation probing at this HEAD, and IR-002 by comparing
the rework commit's file list against the task plan's evidence requirement.

## Scope and Plan Deviations

- **Production change in a test-only rework — justified.** The rework commit
  message frames the pass as test corrections, but it does change production
  code at `errors.py:147`. That change is v1/IR-004's own second remediation
  option, it narrows rather than widens behavior, it matches the design's
  probe-confirmed envelope, and it is confined to the 429 predicate. Verified by
  mutation that the `message` fallback in `classify_error_body` was not touched.
  Correctly handled, but worth naming because the commit message understates it.
- **Justified deviation — `ProviderContractViolation` scope.** Unchanged from v1:
  the story's Technical Details line 93 and design §2.4's docstring describe
  `ProviderContractViolation` as also covering an unparseable envelope, which
  contradicts DAC-E3-4, DAC-E3-S3-3, the mandatory test list and the coverage
  matrix. The task plan Notes record the owner's precedence resolution in favour
  of `ProviderUnavailable`; the implementation follows it, documents it at
  `errors.py:22-27` and `:156-161`, and pins it with
  `test_classify_error_body_never_returns_contract_violation`.
- **Plan numbering.** The approved plan contains no T011. Inherited from the plan;
  no implementation gap.
- **Stale task-plan header.** `CAP-001-E3-S3-tasks.md:34` still names the branch
  as `usr/alvaro-de-jodra/CAP-001-E2-S4`; the actual branch is
  `usr/alvaro-de-jodra/CAP-001-E3-S3`. A pre-existing planning-artifact error,
  untouched by the rework, and not this agent's to edit. Recorded again so it is
  not lost at doc sync.
- **Pipeline-state check reads the wrong tree.** `python3 scripts/pipeline-state.py
  check --project factorflow-v2 --capability CAP-001 --story … --stage
  adversarial-review` again exits 1 with "BLOCKED — story coding has not reached
  in-review", because it reads `repos/factorflow-v2/FactorFlow-v2`, which is not
  on this branch. At the reviewed HEAD in this worktree the story reads
  `status: in-review` (`CAP-001-E3-S3.md:14`, set by `d1cb174`). The block is an
  artifact of the stacked-worktree layout, not a real state failure, so the
  review proceeded against the worktree. `reviewed_state_revision` was therefore
  fingerprinted against the worktree, not the canonical repo path.
- No scope leakage: every changed file maps to a planned task or to this review
  cycle's own artifacts, and nothing in the E3-S2 baseline was altered or
  removed. The two sibling stacked worktrees (E3-S2, E3-S4) were neither read nor
  modified.

## Follow-Up

- **Next agent**: Doc Sync Agent.
- **Required action**: Proceed to doc sync for `massive-client` at
  `5d10e86`. Carry IR-001 and IR-002 forward as accepted warnings; neither blocks
  the gate, and neither requires a production change. IR-001 is one test;
  IR-002 is an append to the existing evidence YAML. The stale branch name in the
  task plan header should be corrected by whoever owns that artifact.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (MEDIUM).
