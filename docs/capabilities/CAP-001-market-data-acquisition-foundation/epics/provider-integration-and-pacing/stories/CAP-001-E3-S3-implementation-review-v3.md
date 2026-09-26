---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-16
updated: 2026-09-16
story_id: "CAP-001-E3-S3"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-09-16T17:50:27Z"
reviewed_head: "062601a54e800609408e3e23a542c7139bfb2abd"
review_base: "701e7fb636d96f6162556ca8a51b59d47c871f84"
reviewed_state_revision: "sha256:b515d4f7ae7e0bfb39d59e07a3d116452689d7894552213126cab3cbe177cbfa"
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
  timestamp: 2026-09-16T17:50:27Z
  source_artifacts:
    - id: CAP-001-E3-S3
      version: "1"
    - id: CAP-001-E3-S3-tasks
      version: "1"
    - id: CAP-001-E3-S3-implementation-review
      version: "2"
    - id: CAP-001-component-design-massive-client
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S3 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 12/12 satisfied |
| Planned tasks | 11/11 verified |
| Required validation | 7/7 passed |

This is a shared-file re-review triggered by a fingerprint change on
`src/factorflow/ingestion/massive/__init__.py`, not a rework cycle. The
question put to this review was whether sibling work merged to `main` after
the v2 gate changed anything CAP-001-E3-S3 owns. It did not — but the file
that changed is not the one the trigger named, and the answer required
checking a different file to establish.

**S3's own reviewed behavior is genuinely untouched.** Diffing S3's owned
region of `src/factorflow/ingestion/massive/errors.py` against the
v2-reviewed HEAD (`5d10e86`) yields exactly three added lines: one stdlib
import (`from collections.abc import Callable`, `errors.py:40`) and two
`__all__` entries (`errors.py:55-56`). Every S3 symbol — `MassiveError` and
its four subclasses, `_safe_fields`, `_str_or_none`, `classify_error_body`,
`is_rate_limited_body`, `is_fatal_for_governor`, `wrap_validation_error` —
is byte-identical to the state v2 passed. All twelve acceptance criteria
re-verify against unchanged production code, and all six of v2's mutation
kills reproduce at this HEAD.

Three corrections to the premises this review was handed, each established
from the repository rather than assumed:

1. **The prior review is v2, not v1.** `CAP-001-E3-S3-implementation-review-v2.md`
   exists and is committed to `main` as `d4ceddb` (393 lines,
   PASS-WITH-WARNINGS). v1's verdict was **CHANGES-REQUIRED**, not PASS. This
   report is therefore version 3, and its prior-finding dispositions are
   against v2.
2. **The sibling change is in `errors.py`, the file S3 owns — not only in
   `__init__.py`.** CAP-001-E3-S5 appended 107 lines to `errors.py`
   (`MAX_FAILURE_REASON_VARIABLE_TEXT`, `compose_failure_reason`,
   `_bound_variable_text`, `_ERROR_KIND_BY_TYPE`,
   `_CREDENTIAL_REJECTED_DESCRIPTION`), all of it below
   `wrap_validation_error`. The "S3's own code hasn't changed" premise is
   false as stated and true in substance; the distinction is why this review
   re-verified the owned region line by line instead of accepting it.
3. **CAP-001-E3-S4's rate-limit governor is not re-exported from
   `massive/__init__.py` at all.** It lives at
   `src/factorflow/ingestion/rate_limit.py` and imports *from* the taxonomy
   (`ProviderUnavailable`, `rate_limit.py:34`). The only re-export additions
   to `__init__.py` since v2 are E3-S5's two symbols.

The one substantive new finding is the one the trigger was right to ask
about even though it named the wrong file. `massive/__init__.py` — the
multi-story shared surface T010 owns — is pinned by no test whatsoever.
Deleting four of S3's five re-exported classification primitives from it
leaves the entire 247-test suite green, because every test imports
`factorflow.ingestion.massive.errors` directly and nothing imports the
package root. The re-exports are correct as they stand today; they have
simply survived two sibling edits on inspection alone. That is IR-001
(MEDIUM). It does not block the gate: T010 carries no mandatory TC-ID, and
DAC-E3-12 — the re-export criterion — belongs to CAP-001-E3-S2, not this
story.

Validation is complete and clean: all seven commands pass, including the
full `uv run pytest` with the 59 `postgres`-marked tests (306 passed), and
the working tree is byte-clean before and after every command including
`uv build` and the entire mutation session.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S3-tasks.md` |
| Component | FactorFlow-v2 (`repos/factorflow-v2/FactorFlow-v2`, the canonical repo path) |
| Branch | `main` |
| HEAD | `062601a54e800609408e3e23a542c7139bfb2abd` (`origin/main` identical) |
| Review base | story merge-base `701e7fb636d96f6162556ca8a51b59d47c871f84`; delta base for this re-review is the v2-reviewed HEAD `5d10e86ccde88670af38ee1598a2d0878e9fd7a5` |
| Working tree | clean (`git status --porcelain -uall` empty before and after all validation) |
| Changed files reviewed | 15 in the full story change set since `701e7fb`; 4 changed since the v2-reviewed HEAD |

Unlike v1 and v2, which reviewed a stacked worktree on
`usr/alvaro-de-jodra/CAP-001-E3-S3`, this review reads the canonical repo
path on `main`, where the story is merged (PR #36 `c478ca8`, PR #39
`5ce8710`). Two bases are therefore recorded. `701e7fb` is the story's
original merge base and remains an ancestor of `HEAD` (verified by
`git merge-base --is-ancestor`), so the complete story change set is still
resolvable. `5d10e86` is the state v2 passed, and is the base against which
this re-review measures what sibling work altered.

`python3 scripts/pipeline-state.py check … --stage adversarial-review`
returns `RESUME — component repository changed after the latest passing
review`, exit 0, which is the correct derived state for a shared-file
re-review and matches the trigger. This is a change from v1 and v2, both of
which recorded a spurious `BLOCKED` caused by the stacked-worktree layout;
that artifact is now gone because the story is merged.

### Changed Files

Measured since the v2-reviewed HEAD `5d10e86`. Files unchanged since v2
carry v2's dispositions forward and are re-verified below where they bear
on an acceptance criterion.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/errors.py` | modified by **CAP-001-E3-S5** (+107) | Not S3's change. S3's owned region (through `wrap_validation_error`) is byte-identical apart from `:40` and `:55-56`. See Scope and Plan Deviations. |
| `src/factorflow/ingestion/massive/__init__.py` | modified by **CAP-001-E3-S5** (+21/-4) | Not S3's change. T010's S3 re-exports are all retained and unreordered; two S5 symbols added. Basis for IR-001. |
| `docs/…/CAP-001-E3-S3-tdd-evidence.yaml` | modified at doc-sync (`a4ad726`, +83) | T012 — resolves v2/IR-002. |
| `docs/…/CAP-001-E3-S3.md` | modified at doc-sync | frontmatter only: `status: in-review` → `docs-sync`, `updated` date. |
| `docs/…/CAP-001-E3-S3-implementation-review-v2.md` | added (`d4ceddb`) | the v2 gate report. |
| `src/factorflow/ingestion/rate_limit.py` | added by **CAP-001-E3-S4** (+244) | Not S3's change. Consumes `ProviderUnavailable`; see Scope and Plan Deviations. |
| `src/factorflow/ingestion/__init__.py` | modified by **CAP-001-E3-S4** (+15) | Not S3's change; outside the `massive` package. |
| `tests/unit/test_massive_failure_reasons.py` | added by **CAP-001-E3-S5** (+278) | Not S3's change. Constructs its own error instances; never calls `classify_error_body`. |
| `tests/unit/test_governor_*.py`, `tests/unit/governor_fakes.py` | added by **CAP-001-E3-S4** (+716) | Not S3's change. |
| `tests/unit/test_massive_errors.py` | **unchanged since v2** | T003, T006 |
| `tests/unit/test_massive_error_classification.py` | **unchanged since v2** | T002, T004, T005, T007 |
| `src/factorflow/ingestion/massive/models.py` | **unchanged since v2** | E3-S2's file; confirms the S2 rework touched nothing S3 depends on. |
| 11 fixtures under `tests/fixtures/massive/` | **unchanged since v2** | T002, T003, T005, T007, T012 |
| `pyproject.toml`, `uv.lock` | **unchanged since v2** | no dependency change; S5's `Callable` import is stdlib. |
| `docs/…/CAP-001-E3-S3-tasks.md` | **unchanged since v2** | see IR-003. |

No unjustified file is present in S3's own change set. Every file changed
since v2 belongs to a merged sibling story or to this story's own doc-sync,
and none of them is scope leakage attributable to S3.

## Acceptance Criteria Verification

Every criterion is re-traced to production code at this HEAD, not carried
forward on v2's authority. Line numbers are current. Mutation results are
this review's own, reproduced independently (see Independent Mutation
Probing).

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-11 | SATISFIED | `errors.py:84-87` `InstrumentNotFound`; `errors.py:174-178` | `test_massive_errors.py:137` `test_not_found_failure_retains_safe_request_id_bearing_reason` | Production code byte-identical to the v2-reviewed state. The typed outcome lets the runner record the instrument and continue. |
| DAC-E3-2 | SATISFIED | `errors.py:68-107` — exactly four subclasses of `MassiveError` | `test_massive_error_classification.py:47` | Re-verified against the grown `__all__`: the two entries E3-S5 added (`errors.py:55-56`) are an `int` constant and a function, not a fifth failure type. `_ERROR_KIND_BY_TYPE` (`errors.py:257-262`) independently enumerates exactly the same four. |
| DAC-E3-3 | SATISFIED | `errors.py:171` `reason = fields["error"] or fields["message"] or ""`; `_safe_fields` uses `.get` throughout | `test_massive_error_classification.py:89,101,113` | Mutation M5 (narrow to `fields["error"] or ""`) kills 1 test, confirming the `message` fallback is still load-bearing here and that v2/IR-004's narrowing remains confined to the 429 predicate. |
| DAC-E3-4 | SATISFIED | `errors.py:119-125,167-168` | `test_massive_error_classification.py:126,149` | Mutation M3 (remove the non-dict guard) kills 4 tests, all four parameter cases. |
| DAC-E3-5 | SATISFIED | `errors.py:206-223` `wrap_validation_error` | `test_massive_error_classification.py:165` | Uses a real `ValidationError` from E3-S2's `DailyBar`. `models.py` verified byte-identical since v2, so the S2 rework cannot have shifted this seam. |
| DAC-E3-13 | SATISFIED | `errors.py:79-81`; `_safe_fields` whitelist at `errors.py:130-135` | `test_massive_errors.py:52,87,106` | The credential-disclosure test logs five fixtures through a real logger under `caplog` and asserts on `str`, `repr` and `caplog.text`. |
| DAC-E3-S3-1 | SATISFIED | `errors.py:174` `status == _NOT_FOUND_STATUS` | `test_massive_error_classification.py:63,73` | Mutation M6 (`_NOT_FOUND_MESSAGE_MARKER` never matches) kills 1 test; the status-only fixture isolates `status` from message text. |
| DAC-E3-S3-2 | SATISFIED | `errors.py:180-184`, markers `errors.py:63` | `test_massive_errors.py:32,42,52` | Both probe-confirmed 401 bodies are independently pinned; the credential fixture appears in neither `str` nor `repr`. |
| DAC-E3-S3-3 | SATISFIED | `errors.py:186-189` unconditional safe default; `errors.py:124-125` non-dict guard | `test_massive_error_classification.py:139,149,184` | Both the unknown-object and non-object cases classify to the safe default under tests that fail if the behavior changes. |
| DAC-E3-S3-4 | SATISFIED | `errors.py:192-203` `is_fatal_for_governor` | `test_massive_error_classification.py:198,209` | Mutation M4 (`return True`) kills 1 test. Re-verified at this HEAD that the `massive` package still imports no `Outcome` enum — `grep -rn "Outcome" src/factorflow/ingestion/massive/` matches only two docstring mentions (`errors.py:200`, `__init__.py:23`), so E3-S4 ownership holds even now that the governor exists. |
| DAC-E3-S3-5 | SATISFIED | `errors.py:172,177,183,188` | `test_massive_errors.py:66,76,87` | Mutation M2 (drop `provider_request_id` on the `ProviderUnavailable` branch) kills `test_every_taxonomy_type_carries_request_id_uniformly` — v2's strengthening survives intact. |
| DAC-E3-S3-6 | SATISFIED | `errors.py:138-151` `is_rate_limited_body` returns `bool` and constructs no `MassiveError` | `test_massive_error_classification.py:220,230` | Still a pure predicate. Re-confirmed that E3-S4's arrival did not move this decision into the governor: `rate_limit.py` never calls `is_rate_limited_body`. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `errors.py`, `test_massive_errors.py`, `test_massive_error_classification.py` all present; E3-S2's package retained | Unchanged since v2. |
| T002 | complete | VERIFIED | `test_massive_error_classification.py:47,63,73,89,101,113,126,139,149` | TC-COMP-196/197/198/220/222 present; body-only fixtures, no status code or header used. |
| T003 | complete | VERIFIED | `test_massive_errors.py:29-131` | TC-COMP-207/221/224 present with labels matching the coverage matrix. |
| T004 | complete | VERIFIED | `test_massive_error_classification.py:165` | Genuine E3-S2 `ValidationError`; `pytest.fail` guard intact; fixture comment accurate against `DailyBar.model_fields`. |
| T005 | complete | VERIFIED | `test_massive_error_classification.py:198,220` | TC-COMP-223/225 present; correctly stops at the classification seam without testing governor retry. |
| T006 | complete | VERIFIED | `test_massive_errors.py:137,155` | TC-COMP-011 asserts the reason is constructed, not the forwarded raw body. |
| T007 | complete | VERIFIED | `test_massive_error_classification.py:243,254,265` | All three named boundaries covered, including the spurious-credential-field case. |
| T008 | complete | VERIFIED | `errors.py:68-107` | Base stores only a safe message plus optional `request_id`. Byte-identical since v2. |
| T009 | complete | VERIFIED | `errors.py:110-223` | Classification order still matches design §2.4 and the story's Technical Details. Byte-identical since v2. |
| T010 | complete | VERIFIED (with IR-001) | `__init__.py:35-46,56-70` | All five S3 taxonomy types and all four classification primitives are re-exported and importable; `BadResponse` is neither imported nor re-exported anywhere in `src/`. The result is correct — but no test pins it, and the file has since been edited twice by siblings. See IR-001. |
| T012 | complete | VERIFIED | `CAP-001-E3-S3-tdd-evidence.yaml` | The original cycle's six mutations reproduce, and the `rework_cycle` block added at doc-sync (`a4ad726`) closes v2/IR-002. |

The approved plan contains no T011 (T001–T010, then T012); the gap is
inherited from the plan and is not an implementation defect. Counting the
plan's eleven actual tasks, all eleven are VERIFIED.

T010's checkpoint — "CAP-001-E3-S1 can adapt decoded provider outcomes for
the governor through the typed taxonomy" — remains *structurally* satisfied
but not yet *demonstrably* exercised, because `client.py` does not exist on
`main`; CAP-001-E3-S1 is unmerged work on a separate branch, excluded from
this review. This is unchanged from v2 and is E3-S1's dependency to
discharge, not an S3 defect. It is, however, part of why IR-001 matters: the
intended consumer that would have caught a broken re-export is not here yet.

## Test Quality Assessment

Both S3 test modules are byte-identical to the versions v2 assessed
(`git diff 5d10e86..HEAD -- tests/unit/test_massive_errors.py
tests/unit/test_massive_error_classification.py` is empty). They were
nonetheless re-read in full and their regression sensitivity re-established
independently by this review's own mutation session rather than inherited.

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_every_taxonomy_type_carries_request_id_uniformly` / TC-COMP-224 | ADEQUATE | Classifies four bodies and asserts three distinct outcomes, including `isinstance(unavailable_with_id, ProviderUnavailable)` before asserting its ID, so it cannot pass for the wrong reason if classification drifts. Mutation M2 kills it. | none |
| `test_non_object_json_classifies_as_provider_unavailable_not_a_crash` (DAC-E3-4 / DAC-E3-S3-3) | ADEQUATE | Parametrized over `[1, 2]`, `null`, `"text"`, `42` — array, null, string, number. Asserts the safe *type*, not merely absence of an exception. Mutation M3 kills all four cases. | Does not extend to non-string field *values* — IR-002. |
| `test_request_id_is_populated_when_present`, `test_request_id_is_none_when_absent_never_fabricated` / TC-COMP-224 | ADEQUATE | Distinguish a populated ID from a fabricated placeholder. | none |
| `test_unknown_api_key_classifies_as_credential_rejected`, `test_malformed_authorization_header_…`, `test_credential_rejected_never_contains_the_credential_value` / TC-COMP-221 | ADEQUATE | Both probe-confirmed 401 envelope shapes, plus the credential-absence assertion on `str` and `repr`. | none |
| `test_no_credential_fixture_in_str_repr_or_captured_log` / TC-COMP-207 | ADEQUATE | Five fixtures logged through a real `logging` logger under `caplog`; asserts on `str`, `repr` and `caplog.text`. Exercises the real logging path, not a mock. | none |
| `test_validation_error_from_a_successful_response_wraps_to_contract_violation` / TC-COMP-199 | ADEQUATE | Builds a genuine `ValidationError` from `DailyBar` and asserts no partial parsed value (`187.15`, `188.44`) reaches the safe message. | none |
| `test_rate_limited_body_is_identified_…`, `test_non_rate_limited_bodies_are_not_flagged_…` / TC-COMP-225 | ADEQUATE | A `bool` predicate, so no `MassiveError` can be constructed through the seam; the negative test sweeps four non-429 fixtures. | none |
| `test_status_not_found_alone_classifies_even_with_an_unrelated_message` / TC-COMP-220 | ADEQUATE | Asserts the fixture's message does *not* contain the not-found marker before classifying, isolating `status` from message text. | none |
| `test_classification_never_touches_a_provider_url_or_credential` (T007) | ADEQUATE | Sanity-asserts the fixture genuinely carries `SECRET_TEST_TOKEN_ABC123` before asserting its absence, so the test cannot pass vacuously. | none |
| Package re-export surface (T010) | **MISSING** | No test imports `factorflow.ingestion.massive` at all. Verified by grep across `tests/` and `src/`: every reference is to the `…massive.errors` submodule. | The whole of T010 — IR-001. |
| All remaining tests (TC-COMP-011, 196, 197, 198, 222, 223 and the two other T007 boundary tests) | ADEQUATE | Re-read at this HEAD. All 12 mandatory TC-IDs present with traceability comments. | none |

General properties re-verified at this HEAD: no mocks or patches anywhere
in either module, so no mock can make a result inevitable; the units under
test are the real functions; no network, clock, random, or environment
dependence; no shared mutable state or ordering dependence; fixture paths
resolve via `Path(__file__).resolve().parents[1]`, so the tests are
CWD-independent. Running the two modules in isolation and as part of the
full suite gives identical results.

E3-S5's new `tests/unit/test_massive_failure_reasons.py` was inspected for
coupling that could silently constrain S3's behavior. It constructs its own
`MassiveError` instances with literal message strings
(`test_massive_failure_reasons.py:48,69,94,127`) and never calls
`classify_error_body`. S3's classification messages could therefore change
without S5's suite noticing, and vice versa — the two are genuinely
decoupled, which is the correct outcome for this review's question.

### Independent Mutation Probing

Conducted by copying `src/factorflow` into a scratch directory outside the
repository, mutating the copy, and running the repository's real tests with
that directory first on `PYTHONPATH`. Shadowing was confirmed by
`inspect.getsourcefile`, which reported the scratch path. The working tree
was never modified (`git status --porcelain -uall` empty throughout and
after), and each mutation was reverted and the file diffed against its
pristine copy before the next was applied.

| # | Mutation | Outcome |
|---|----------|---------|
| M1 | `_str_or_none` → `return value` (`errors.py:127-128`) — **v2/IR-001's surviving mutation** | **SURVIVED** — 30 passed. Basis for IR-002. |
| M2 | Drop `provider_request_id=request_id` from the `ProviderUnavailable` branch (`errors.py:186-189`) | KILLED — 1 failed, 29 passed (`test_every_taxonomy_type_carries_request_id_uniformly`) |
| M3 | Remove `if not isinstance(parsed, dict): return None` (`errors.py:124-125`) | KILLED — 4 failed, 26 passed (all four parameter cases) |
| M4 | `is_fatal_for_governor` → `return True` (`errors.py:203`) | KILLED — 1 failed, 29 passed (`test_provider_unavailable_is_the_only_retryable_type`) |
| M5 | Drop the `fields["message"]` fallback in `classify_error_body` (`errors.py:171`) | KILLED — 1 failed, 29 passed (`test_not_found_message_recognised_when_status_is_absent`) |
| M6 | `_NOT_FOUND_MESSAGE_MARKER` → a never-matching string (`errors.py:61`) | KILLED — 1 failed, 29 passed |
| M7 | Delete `classify_error_body`, `is_rate_limited_body`, `is_fatal_for_governor` and `wrap_validation_error` from `__init__.py`'s import list **and** `__all__` | **SURVIVED** — 247 passed, 59 deselected, against the **full** non-postgres suite. Basis for IR-001. |

M2 through M6 reproduce v2's kills exactly, confirming that the sibling
additions did not weaken any pinned S3 behavior. M1 reproduces v2's one
survivor, confirming v2/IR-001 is still open.

M7 is this review's own probe, designed against the shared-file trigger. It
was run against the full suite rather than the two story modules, precisely
to give every test in the repository — including E3-S4's and E3-S5's new
ones — the chance to catch it. Under the mutant,
`factorflow.ingestion.massive.__all__` drops to eleven entries and
`hasattr(m, "classify_error_body")` is `False`, and the suite is still
green.

## Independent Validation

Every command was run by this reviewer at `062601a`, in the canonical repo
path. None was substituted or skipped.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_errors.py tests/unit/test_massive_error_classification.py -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 30 passed in 0.05s — identical to v2's count, consistent with both modules being unchanged |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 247 passed, 59 deselected, 2 warnings in 12.75s (211 at v2; +36 from E3-S4's and E3-S5's merged tests) |
| `uv run pytest` (full, including `postgres`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 306 passed, 2 warnings in 19.94s. A container runtime is available (`docker info` succeeds), so the constitution-defined full test command was run rather than substituted |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed! |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 96 files already formatted (89 at v2) |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 28 source files (27 at v2; +1 is `rate_limit.py`) |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` |

The two warnings are pre-existing and unrelated to this story
(`DeprecationWarning` from `starlette.testclient` via `anyio`).

### Validation Side Effects

- Before: clean — `git status --porcelain -uall` empty at `062601a`.
- After: clean — `git status --porcelain -uall` empty, re-checked after
  `uv build`, after the full `postgres` run, and after the entire mutation
  session.
- Unexpected tracked-file changes: none. `uv build` wrote to `dist/`, which
  is git-ignored. The `postgres` run started and tore down its own
  containers and left no repository artifact. All mutation work occurred in
  a scratch directory outside the repository.

## Findings

### IR-001 — The `massive/__init__.py` re-export surface is pinned by no test, on a file two sibling stories have already edited

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (T010 carries no mandatory TC-ID; DAC-E3-12 belongs to CAP-001-E3-S2)
- **Tasks**: T010
- **Files**: `src/factorflow/ingestion/massive/__init__.py:35-46,56-70`; `tests/unit/` (absence)
- **Claim challenged**: That T010's checkpoint — the taxonomy and
  classification primitives are exposed to callers through the package — is
  protected against regression, and that a fingerprint change on this file
  can be cleared by inspection alone.
- **Observed evidence**: No test anywhere imports the package root.
  `grep -rn "from factorflow.ingestion.massive import\|import
  factorflow.ingestion.massive$" tests/ src/` returns nothing; every test
  and the one internal consumer (`rate_limit.py:34`) import the
  `…massive.errors` submodule directly. Mutation M7 removed
  `classify_error_body`, `is_rate_limited_body`, `is_fatal_for_governor` and
  `wrap_validation_error` from both the import block and `__all__`; under
  the mutant `hasattr(m, "classify_error_body")` is `False` and `__all__`
  has eleven entries instead of fifteen, yet the full non-postgres suite
  returned **247 passed, 59 deselected**. The re-exports are correct at this
  HEAD — all nine S3 symbols import successfully — but nothing in the
  repository would report it if they stopped being.
- **Expected evidence/behavior**: T010 requires `__init__.py` to "expose the
  taxonomy and safe decoding/classification primitives consumed by
  `client.py`" and to "not expose the raw Massive SDK `BadResponse` type to
  callers." Both halves are assertions about the package's public surface,
  and both are currently verified only by reading the file. The task plan's
  Phase 2 defines no test for T010, so this is a plan-level gap the
  implementation inherited rather than a skipped requirement — which is why
  it is MEDIUM and not HIGH.
- **Impact**: No behavioral risk as shipped. The risk is structural and now
  demonstrated rather than hypothetical: this file is the one surface S3
  shares with every other CAP-001-E3 story, it has been modified twice since
  the v2 gate (by E3-S5), and CAP-001-E3-S1's `client.py` — the intended
  consumer whose import would fail loudly — is not yet on `main`. Until it
  lands, a sibling story that reorders, renames, or drops an S3 re-export
  ships a fully green suite. This re-review had to establish the re-exports
  were intact by inspection and mutation for exactly that reason; a test
  would have answered the trigger's question in one command.
- **Required remediation**: Add one test that imports the four
  classification primitives and five taxonomy types from
  `factorflow.ingestion.massive` (the package, not the submodule), asserts
  each is the same object as its `…massive.errors` counterpart, asserts
  `set(massive.__all__)` contains all nine S3 names, and asserts
  `BadResponse` is absent from the module namespace. One test closes T010's
  checkpoint and makes the next shared-file fingerprint change answerable by
  running the suite.

### IR-002 — The non-string field-value coercion in `_safe_fields` still has no regression test

- **Severity**: MEDIUM
- **Status**: OPEN (carried forward from v2/IR-001)
- **Acceptance criteria**: DAC-E3-4, DAC-E3-S3-3
- **Tasks**: T002, T009
- **Files**: `src/factorflow/ingestion/massive/errors.py:127-128` (`_str_or_none`), `tests/unit/test_massive_error_classification.py:149`
- **Claim challenged**: That the defensive-guard gap v2 recorded has been
  closed in the interval since the v2 gate, whether by doc-sync or by
  sibling work touching the same module.
- **Observed evidence**: It has not. Mutation M1 — replacing `return value
  if isinstance(value, str) else None` with `return value` — still leaves
  all 30 story tests passing at this HEAD, reproducing v2's result exactly.
  Every fixture and inline literal supplies string values for `status`,
  `message`, `error` and `request_id`, or omits them; none supplies a
  non-string value for a whitelisted key. E3-S5's 278 new lines of tests do
  not reach this path either, since they never call `classify_error_body`.
  The doc-sync commit `a4ad726` explicitly recorded the gap as carried
  forward rather than closing it
  (`CAP-001-E3-S3-tdd-evidence.yaml`, `known_gap_carried_forward`).
- **Expected evidence/behavior**: DAC-E3-4 and DAC-E3-S3-3 require a payload
  that presents no usable envelope to become `ProviderUnavailable`, never an
  exception escaping the provider boundary. A JSON object whose `message` is
  a nested object parses successfully and matches no known case, so it falls
  under DAC-E3-S3-3. The coercion implements that correctly; the suite
  should pin it, as v2's rework pinned the non-dict guard one level up.
- **Impact**: Unchanged from v2, and correctly accepted there. The
  implementation is right today — confirmed directly at this HEAD:
  `classify_error_body('{"message": {"a": 1}, "request_id": 7}')` returns
  `ProviderUnavailable` with `provider_request_id=None`, while against the
  mutant it raises `AttributeError: 'dict' object has no attribute 'lower'`
  from `reason.lower()`. A refactor removing the coercion — plausible, since
  it reads as defensive boilerplate — would let an unhandled `AttributeError`
  escape the component the design names its most fragile, with a green
  suite. The typed annotation `provider_request_id: str | None`
  (`errors.py:76`) is likewise enforced only by this guard.
- **Required remediation**: Unchanged from v2/IR-001. Add a classification
  test feeding a JSON object whose `message` (or `error`) is a non-string
  value and whose `request_id` is a non-string value, asserting
  `ProviderUnavailable` and `provider_request_id is None`. One test closes
  both halves.

### IR-003 — The task plan's header still misstates the branch and its own status

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: N/A (planning artifact)
- **Files**: `docs/…/stories/CAP-001-E3-S3-tasks.md:5` (`status: draft`), `:34` (`**Branch**: usr/alvaro-de-jodra/CAP-001-E2-S4`)
- **Claim challenged**: That the task plan is a reliable record of what was
  implemented and where, now that the story is merged and closed.
- **Observed evidence**: Line 34 names the branch
  `usr/alvaro-de-jodra/CAP-001-E2-S4`; the story was actually implemented on
  `usr/alvaro-de-jodra/CAP-001-E3-S3` and merged to `main` via PR #36 and
  PR #39. Line 5 still reads `status: draft` while every task box is
  checked, the story reads `status: docs-sync`, and two gate reports have
  been issued. The file is byte-identical since the v2-reviewed HEAD, so
  neither the rework nor doc-sync corrected it. v2 recorded the branch error
  under Scope Deviations; it survived doc-sync unchanged, which is why it is
  promoted to a finding here rather than left as a note.
- **Expected evidence/behavior**: A completed story's task plan should name
  the branch its work actually landed on and carry a status consistent with
  its tasks, so that a later reader reconciling the plan against history is
  not sent to an unrelated epic's branch.
- **Impact**: No behavioral or test risk whatsoever. The cost is durable
  traceability at exactly the point where it is most likely to be consulted
  — a future reviewer, a Phase 6b automation planner, or release readiness
  tracing this story back to its commits.
- **Required remediation**: Correct `**Branch**` to
  `usr/alvaro-de-jodra/CAP-001-E3-S3` and advance `status` to a value
  consistent with the completed work, and refresh `updated`. No code or test
  change. This is the task plan's owner's edit to make; this reviewer does
  not modify planning artifacts.

## Previous Review Disposition

Dispositions are against **version 2** (`d4ceddb`), the immediately
preceding report, not version 1. No disposition below is asserted from the
doc-sync commit message; each was re-derived from the repository at this
HEAD.

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (MEDIUM) — the `_str_or_none` coercion has no regression test | **STILL OPEN** | Mutation M1 reproduced at `062601a`: `return value` leaves all 30 tests passing, identical to v2's result. No test added in the interval; E3-S5's new tests do not reach the path. Re-raised in full as this report's IR-002. |
| v2/IR-002 (MEDIUM) — the TDD evidence artifact was not updated for the rework cycle | **RESOLVED** | Doc-sync commit `a4ad726` appended 83 lines to `CAP-001-E3-S3-tdd-evidence.yaml`: a `rework_cycle` block recording trigger, `baseline_commit: 18051ee`, `rework_commit: 5d10e86`, the RED observations for both v1 findings, both reproduced mutations with outcomes, and current suite counts (30 story tests, 211 non-postgres, 270 full). `updated` is now `2026-09-12`. The block is candid that the RED observations were confirmed by the v2 review rather than captured live, which is the accurate record. It also carries the v2/IR-001 gap forward explicitly under `known_gap_carried_forward`. |

Both of v2's findings are accounted for. IR-001 and IR-003 in this report
are new: IR-001 was found by mutation probing against the shared file this
re-review was triggered on, and IR-003 by re-reading the task plan header
against the merged branch history.

## Scope and Plan Deviations

- **The trigger named the wrong file; the real sibling change is in
  `errors.py`.** CAP-001-E3-S5 appended 107 lines to the module S3 owns —
  `MAX_FAILURE_REASON_VARIABLE_TEXT` (`errors.py:225`),
  `compose_failure_reason` (`:266`), `_bound_variable_text` (`:313`),
  `_ERROR_KIND_BY_TYPE` (`:257`) and `_CREDENTIAL_REJECTED_DESCRIPTION`
  (`:254`) — plus a stdlib `Callable` import and two `__all__` entries.
  Verified additive and non-invasive: `diff` of S3's owned region against
  `5d10e86` shows only those three inserted lines, every S3 symbol is
  byte-identical, and all 107 S5 lines sit below `wrap_validation_error`.
  `compose_failure_reason` consumes S3's types read-only (via `str(error)`
  and `error.provider_request_id`) and mutates nothing. No S3 finding
  arises; recorded because the premise handed to this review was that
  `errors.py` was untouched, and that is not accurate.
- **CAP-001-E3-S4's governor is not a `massive` package re-export.** It is
  `src/factorflow/ingestion/rate_limit.py`, outside the package, and imports
  `ProviderUnavailable` from `massive.errors` (`rate_limit.py:34`) to *raise*
  on retry exhaustion (`:159,171`) rather than to classify. It does not call
  `is_fatal_for_governor`, though its module docstring cites it
  (`rate_limit.py:19`) — a mild divergence from the seam S3 built, but
  entirely within E3-S4's ownership and not an S3 defect. Re-verified that
  the `massive` package still imports no `Outcome` enum, so the ownership
  boundary DAC-E3-S3-4 depends on is intact.
- **The S2 rework claim could not be corroborated, and did not need to be.**
  No commit referencing PR #43 exists in this clone; `origin/main` and local
  `main` are both `062601a` (PR #42). Per the no-destructive-Git constraint
  this review did not fetch. The question it was asked is nonetheless
  answerable and answered: `git diff 5d10e86..HEAD --
  src/factorflow/ingestion/massive/models.py` is **empty**, so `models.py` is
  byte-identical to the state v2 passed, and nothing S3 owns or depends on
  moved. If a PR #43 lands later, the only S3 surface it could touch is
  `DailyBar`'s required-field set, which `test_validation_error_from_a_successful_response_wraps_to_contract_violation`
  pins.
- **Two review bases are recorded.** v1 and v2 reviewed a stacked worktree
  against merge-base `701e7fb`; this review reads `main` at the canonical
  repo path, where merge-base-with-`main` is degenerate. `701e7fb` is
  retained as `review_base` for the complete story change set (verified still
  an ancestor of `HEAD`), and `5d10e86` is used as the delta base for
  measuring what sibling work changed. Both are stated in the Review Subject
  table.
- **Justified deviation — `ProviderContractViolation` scope.** Unchanged
  from v1 and v2: the story's Technical Details line 93 and design §2.4's
  docstring describe `ProviderContractViolation` as also covering an
  unparseable envelope, contradicting DAC-E3-4, DAC-E3-S3-3, the mandatory
  test list and the coverage matrix. The task plan Notes record the owner's
  precedence resolution in favour of `ProviderUnavailable`; the
  implementation follows it, documents it at `errors.py:22-27` and
  `:161-164`, and pins it with
  `test_classify_error_body_never_returns_contract_violation`.
- **Plan numbering.** The approved plan contains no T011. Inherited from the
  plan; no implementation gap.
- **Pipeline-state check now reads correctly.** Unlike v1 and v2, which both
  recorded a spurious `BLOCKED` from the stacked-worktree layout,
  `pipeline-state.py check … --stage adversarial-review` returns `RESUME —
  component repository changed after the latest passing review` (exit 0),
  which is the correct derived state. `reviewed_state_revision` is
  fingerprinted against the canonical repo path, not a worktree.
- **No scope leakage attributable to S3.** Every file changed since the v2
  gate belongs to a merged sibling story (E3-S4, E3-S5) or to this story's
  own doc-sync. S3 introduced no dependency, configuration, or fixture change
  in this interval; `pyproject.toml`, `uv.lock` and all eleven fixtures are
  byte-identical.

## Follow-Up

- **Next agent**: Doc Sync Agent — though note that doc sync has **already
  run** for this story (`a4ad726`, README + TDD evidence), and the story is
  at `status: docs-sync`. No further doc-sync work is required by this
  verdict; the gate is re-affirmed, not reopened.
- **Required action**: None blocking. CAP-001-E3-S3 remains passed at
  `062601a`, and the sibling additions to `errors.py` and `__init__.py`
  changed nothing this story owns. Carry IR-001, IR-002 and IR-003 forward as
  accepted warnings. IR-001 is the one worth scheduling rather than merely
  recording: a single package-root import test would close T010's checkpoint
  and let the next shared-file fingerprint change be cleared by running the
  suite instead of by a full re-review. It is a natural fit for the
  `$expedited-change` lane, or for CAP-001-E3-S1 to absorb when `client.py`
  lands and becomes the re-exports' first real consumer. IR-003 belongs to
  whoever owns the task plan.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (MEDIUM),
  IR-003 (LOW).
