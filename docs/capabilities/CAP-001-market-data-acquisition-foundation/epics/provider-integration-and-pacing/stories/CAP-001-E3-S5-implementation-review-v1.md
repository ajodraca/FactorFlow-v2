---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S5-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-13
updated: 2026-09-13
story_id: "CAP-001-E3-S5"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S5.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S5-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-13T21:05:00Z"
reviewed_head: "cb7aa10bac5d27228b693430cf28e5b4e31b29c5"
review_base: "5ce871028d3d59647141cda81fa546fd3a9afee5"
reviewed_state_revision: "sha256:1c5876465a5c2de0c6615d61b2494f5311c72efcc459e3f98cd0ca08a52ca6de"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E3-S5
    artifact_version: 1
    content_revision: sha256:fafbfe4bec0d9ed3e385139a97a568ca3f003b1431fe4a414a70722b85848257
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-13T21:05:00Z
  source_artifacts:
    - id: CAP-001-E3-S5
      version: "1"
    - id: CAP-001-E3-S5-tasks
      version: "1"
    - id: CAP-001-component-design-massive-client
      version: "7"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S5 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 3 |
| Acceptance criteria | 6/6 satisfied |
| Planned tasks | 10/10 verified |
| Required validation | 6/6 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 3 · **total 5**

| ID | Severity | Title |
|----|----------|-------|
| IR-001 | MEDIUM | `CredentialRejected`'s fixed-description rule is not pinned by any test |
| IR-002 | MEDIUM | TDD evidence records an incorrect cause for the failing suite test |
| IR-003 | LOW | Truncation assertion is a tautological disjunction |
| IR-004 | LOW | Unreachable clause in the kind-distinctness assertion |
| IR-005 | LOW | Redact-spy call-count guard is vacuous on the `CredentialRejected` path |

The implementation is correct, narrowly scoped, and genuinely tested. All six
acceptance criteria trace to concrete production code in
`src/factorflow/ingestion/massive/errors.py` and to tests whose assertions I
independently confirmed are regression-sensitive: I reproduced all six mutation
kills claimed in the TDD evidence file from scratch in an isolated worktree, and
every one behaved exactly as recorded — including the two STRENGTHEN cases,
which now die at the strengthened assertions (`:83`, `:226`) rather than
surviving. The change set is exactly the three source files the task plan names
plus task-state bookkeeping; there is no scope leakage.

Two MEDIUM findings prevent an unqualified PASS. The more substantive one
(IR-001) is a test-strength gap I found with my own mutation probe, not one the
evidence file anticipated: the `CredentialRejected` fixed-description rule —
the single rule DAC-E3-S5-2 exists to enforce — is **not pinned by any test**.
Replacing the fixed description with the error's own redacted message leaves all
13 tests green while leaking a real provider-echoed key. The shipped behavior is
correct; only its regression barrier is missing. IR-002 records that the TDD
evidence file's stated cause for the one failing suite test is demonstrably
wrong, which matters because it is the evidence a downstream gate would rely on.

Neither finding makes an acceptance criterion, a required task, or a required
validation command incomplete, so per the skill's verdict rules this is
PASS-WITH-WARNINGS rather than CHANGES-REQUIRED.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/.../stories/CAP-001-E3-S5.md` |
| Task plan | `docs/.../stories/CAP-001-E3-S5-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S5` |
| HEAD | `cb7aa10bac5d27228b693430cf28e5b4e31b29c5` |
| Review base | `main` merge-base `5ce871028d3d59647141cda81fa546fd3a9afee5` |
| Working tree | clean — no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 6 (3 source, 3 documentation) |

`pipeline-state.py check ... --stage adversarial-review` returned
`READY — story is ready for independent review`. The story's `approval.reviewed_revision`
matches the current `artifact-gate.py revision` digest
(`sha256:fafbfe4b…`), so the approved story text is the text I reviewed against.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion/massive/errors.py` | modified (+107) | T007, T008 |
| `src/factorflow/ingestion/massive/__init__.py` | modified (+21/-4) | T009 |
| `tests/unit/test_massive_failure_reasons.py` | added (+278) | T001–T006 |
| `docs/.../CAP-001-E3-S5-tdd-evidence.yaml` | added (+182) | T010 |
| `docs/.../CAP-001-E3-S5-tasks.md` | modified | Task-state bookkeeping (10 checkboxes) |
| `docs/.../CAP-001-E3-S5.md` | modified | `status: planning → in-review`, `updated` date |

No unjustified file. The source diff is confined to the `massive` package and
its new test module; the two story-document edits contain only checkbox and
status-field changes, which I verified line-by-line via
`git diff 5ce8710..HEAD -- <docs paths>` — no requirement or acceptance-criterion
text was altered.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `errors.py:306-309` (`CredentialRejected` → fixed description; all other kinds redacted via caller closure before bounding) | `test_massive_failure_reasons.py:106` (4-way parametrized), `:122` | Mutation N5 (redaction removed) kills 5 tests; N4 (raw `CredentialRejected` message) kills 2. Barrier is real. See IR-001 for the narrower N3 gap. |
| DAC-E3-13 | SATISFIED | `errors.py:301-313` — kind, symbol, data_type, request_id composed first and never truncated | `:44`, `:142` | Mutations M1/N1/N2 (omit symbol / data_type / request-id segment) each kill 3 tests. Stable fields are genuinely pinned. |
| DAC-E3-S5-1 | SATISFIED | `errors.py:301-304` — `request_id=unavailable` literal for the `None` case | `:61` | Strengthened test asserts the exact marker and `"req_" not in reason`. Mutation M2 (`unavailable → UNKNOWN`) kills it at `:83`. Reproduced. |
| DAC-E3-S5-2 | SATISFIED | `errors.py:254-258`, `:306-307` — `_CREDENTIAL_REJECTED_DESCRIPTION`, never the error's own message | `:122` | Behavior verified directly: a `CredentialRejected("Key sk-live-XYZ rejected…")` composes to `…: the provider rejected the configured credential`, dropping the raw text. Test barrier is incomplete — IR-001. |
| DAC-E3-S5-3 | SATISFIED | `errors.py:226`, `:316-327` — bound 500, `keep = 500 - len(marker)`, marker appended | `:142`, `:229` | Mutations M4 (marker dropped), M5 (`<=` → `<`), N8 (bound → 100000) each kill the intended test. Both sides of the boundary are covered. |
| DAC-E3-S5-4 | SATISFIED | `errors.py:247-252` — `_ERROR_KIND_BY_TYPE` maps all four types to distinct labels | `:165` | Mutations M6 (kind collision) and N7 (kind dropped) both kill. `not_found` is separable from the other three as AC-11 requires. |

All six criteria are SATISFIED. The AC-11 linkage asserted by the task plan's
traceability table (via DAC-E3-S5-4) holds: `_ERROR_KIND_BY_TYPE` emits
`not_found` for `InstrumentNotFound` alone, which is what lets CAP-001-E4-S6 map
a not-found outcome separately from `failed`.

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_massive_failure_reasons.py:16-23` | Imports only from `…massive.errors`. I confirmed at runtime that importing the module pulls in no `massive`/`urllib3`/`requests`/`polygon` module — the "no SDK, no provider request" constraint holds in fact, not just by inspection. |
| T002 | complete | VERIFIED | `:44`, `:61` | TC-COMP-207 and TC-COMP-232 both present and labeled; present-ID and absent-ID cases both asserted. |
| T003 | complete | VERIFIED | `:89-137` | TC-COMP-013 and TC-COMP-233 present; all four typed errors parametrized with the credential fixture. **Justified deviation** — see Scope and Plan Deviations (fixture is a module constant, not an environment variable). |
| T004 | complete | VERIFIED | `:142` | 600-char text; asserts the `…[truncated]` marker plus survival of symbol, data type and request ID. |
| T005 | complete | VERIFIED | `:165` | All four typed errors composed; distinctness asserted via `len(set(...))`. |
| T006 | complete | VERIFIED | `:201`, `:229`, `:242`, `:268` | All four promised boundary tests exist: redact-before-truncate, at-bound-not-marked, redact-callback-isolation, untyped-error rejection. |
| T007 | complete | VERIFIED | `errors.py:226-243` | Constant plus docstring. Style genuinely matches `src/factorflow/api/bounds.py` (named constant + trailing docstring), and I confirmed the cited derivation: `bounds.py:MAX_PAGE_SIZE = 500` exists as stated. |
| T008 | complete | VERIFIED | `errors.py:261-327` | Composition order is stable-fields-first; `redact` applied before `_bound_variable_text`; `CredentialRejected` mapped to fixed text; unsupported classes raise `TypeError` (`:294-299`). |
| T009 | complete | VERIFIED | `__init__.py:35-47`, `:55-71` | Both `compose_failure_reason` and `MAX_FAILURE_REASON_VARIABLE_TEXT` imported and listed in `__all__`. |
| T010 | complete | VERIFIED | `CAP-001-E3-S5-tdd-evidence.yaml` | Evidence file exists and records all six required mutation classes. I reproduced every kill independently. One recorded claim is inaccurate — IR-002. |

All ten tasks VERIFIED. The checkbox state in the task plan matches the
repository evidence in every case; I found no bookkeeping inconsistency.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_reason_includes_symbol_data_type_and_request_id_when_present` / TC-COMP-207 | ADEQUATE | Asserts all three stable fields appear. Killed by M1, N1, N2. | none |
| `test_reason_renders_absent_request_id_explicitly_not_fabricated` / TC-COMP-232 | ADEQUATE | Pins the exact `request_id=unavailable` marker and asserts no `req_` prefix leaks. Deliberately uses `InstrumentNotFound` so the kind text cannot satisfy the marker check — a real strengthening, and I confirmed M2 kills it at `:83`. | none |
| `test_no_typed_error_leaks_the_credential_fixture` / TC-COMP-013, TC-COMP-233 | ADEQUATE | Parametrized across all four typed errors with the fixture embedded in diagnostic text. Killed by N4 (2 cases) and N5 (3 cases). | Does not pin *how* `CredentialRejected` stays safe — IR-001. |
| `test_credential_rejected_states_rejection_without_echoing_any_value` / TC-COMP-233 | **WEAK** | Asserts the fixture is absent and `"rejected" in reason.lower()`. Both assertions are satisfied by an implementation that echoes the error's own redacted message, because the word "rejected" appears in that message too. | Does not distinguish fixed-description from redacted-echo. Survives mutation N3 — **IR-001**. |
| `test_pathological_diagnostic_text_is_visibly_truncated` / TC-COMP-234 | ADEQUATE | 600-char input; marker asserted; stable fields asserted to survive. Killed by M4, N8, and (for the field half) M1/N1/N2. | Assertion at `:154` is a tautological disjunction — IR-003. |
| `test_each_typed_error_yields_a_distinguishable_reason_kind` / TC-COMP-235 | ADEQUATE | `len(set(reasons.values())) == len(reasons)` carries the real weight; killed by M6 and N7. | Inner loop's `or other_marker == kind_markers[kind]` clause is unreachable — IR-004. |
| `test_diagnostic_text_is_redacted_before_truncation` / T006 | ADEQUATE | Genuinely strong: padding is computed from `MAX_FAILURE_REASON_VARIABLE_TEXT` and the marker length so the fixture straddles the exact cut index, and a 10-char-prefix assertion catches a surviving fragment. M3 kills it at `:226`. Reproduced. | none |
| `test_text_at_or_below_bound_is_not_marked_truncated` / T006 | ADEQUATE | Exactly-500-char input; killed by M5's off-by-one. | none |
| `test_redact_callback_never_receives_assembled_stable_fields` / T006 | ADEQUATE | Spy callable; asserts symbol, data-type and request-ID markers never reach `redact`. Killed by N5. | `len(seen) >= 1` is vacuous for the `CredentialRejected` path, where `redact` is never invoked — IR-005. |
| `test_composer_rejects_a_raw_exception_not_in_the_taxonomy` / T006 | ADEQUATE | Killed by N6 (accepting untyped errors). | none |

**Mandatory TC-ID traceability.** All six mandatory IDs (TC-COMP-013, 207,
232, 233, 234, 235) are present as labels in the test module and each maps to the
DAC that `tests/coverage-matrix.md:45,239,264,265,266,267` assigns it. I checked
each mapping against the matrix individually. Unlike CAP-001-E3-S3 v1
(IR-002 in that report), there is no mis-labeling here.

**Isolation and determinism.** The module uses no clock, no network, no
filesystem, no environment variable, and no shared mutable state. Three
consecutive runs produced `13 passed` identically.

## Independent Validation

All commands run by me from `repos/factorflow-v2/FactorFlow-v2`, not taken from
the coding agent's report.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest -m 'not postgres' tests/unit/test_massive_failure_reasons.py -q` | repo root | 0 | PASS | `13 passed in 0.05s` |
| `uv run pytest -m 'not postgres' -q` | repo root | 1 | **FAIL (environmental)** | `1 failed, 246 passed, 59 deselected in 12.76s`. Sole failure `tests/integration/test_api_static_mount.py::test_no_bundle_yet_falls_back_to_a_bare_404`. Cause established below; unrelated to this story. |
| `uv run ruff check .` | repo root | 0 | PASS | `All checks passed!` |
| `uv run ruff format --check .` | repo root | 0 | PASS | `96 files already formatted` |
| `uv run mypy src` | repo root | 0 | PASS | `Success: no issues found in 28 source files` |
| `uv build` | repo root | 0 | PASS | `Successfully built dist/factorflow-0.1.0.tar.gz` and the wheel |

### The one failing test — independently diagnosed

The TDD evidence file claims this failure is "pre-existing on the base branch,
confirmed via `git stash`". I did not accept that and checked it myself, and the
stated cause is wrong — though the conclusion (not this story's fault) is right.

I created a detached worktree at the merge base `5ce8710` and ran the test there:

```
$ cd <scratch>/base-wt && uv run pytest -m 'not postgres' tests/integration/test_api_static_mount.py -q
4 passed, 2 warnings in 0.58s
```

It **passes** at the base and **fails** on the branch, which is the opposite of
"pre-existing on the base branch". The actual cause is local environment state,
not either commit:

```
$ git check-ignore -v src/factorflow/api/static/index.html
.gitignore:18:src/factorflow/api/static/*	src/factorflow/api/static/index.html

$ ls -la src/factorflow/api/static/
-rw-r--r--@ 1 alvarodejodra staff 395 Sep 10 19:21 index.html
drwxr-xr-x@ 4 alvarodejodra staff 128 Sep 10 19:21 assets
```

A gitignored frontend bundle dated 2026-09-10 — three days before this story's
commit — is present in the working directory. The test asserts that *no* bundle
exists and the SPA path degrades to a bare 404; with the bundle present the
mount serves `index.html` and returns 200. The fresh worktree has no such bundle,
hence the pass. `git stash` cannot move an ignored file, so the verification the
evidence file describes could not have produced the conclusion it records.

This does not implicate the story: the story's diff touches only
`src/factorflow/ingestion/massive/` and its test module, and the failing test
exercises the API static mount. Recorded as IR-002 for evidence accuracy.

### Validation Side Effects

- Before: `git status --porcelain` empty; `errors.py` sha256 `f30a1458…`; HEAD `cb7aa10`.
- After: `git status --porcelain` empty; `errors.py` sha256 `f30a1458…` (byte-identical); HEAD `cb7aa10`.
- Unexpected tracked-file changes: none.
- `uv build` wrote to the already-gitignored `dist/`; no tracked file was affected.
- All mutation probing was performed in throwaway `git worktree` checkouts under
  the session scratchpad, never in the reviewed tree. Both worktrees were removed
  and `git worktree prune` run; `git worktree list` confirms none remain.

## Findings

### IR-001 — `CredentialRejected`'s fixed-description rule is not pinned by any test

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S5-2, AC-13
- **Tasks**: T003, T008
- **Files**: `tests/unit/test_massive_failure_reasons.py:122-136`; `src/factorflow/ingestion/massive/errors.py:306-307`
- **Claim challenged**: The task plan's checkpoint for Phase 2 asserts the secret
  boundary is covered for every typed error, and T008 requires
  `CredentialRejected` to map to "a fixed rejection description, never a supplied
  credential value". The implementation does this correctly; the claim under
  challenge is that the test suite *protects* it.
- **Observed evidence**: I applied a single-line mutation replacing
  `variable_segment = _CREDENTIAL_REJECTED_DESCRIPTION` with
  `variable_segment = _bound_variable_text(redact(str(error)))` — i.e. treating
  `CredentialRejected` like every other kind, still redacted. The full module
  returned `13 passed`. The mutant is not detected by any test. Its output for a
  realistic error:

  ```
  N3 MUTANT: [credential_rejected] symbol=AAPL data_type=daily_bars request_id=req_9: Key sk-live-XYZ rejected by upstream gateway
  CURRENT  : [credential_rejected] symbol=AAPL data_type=daily_bars request_id=req_9: the provider rejected the configured credential
  ```

  The two existing tests both survive it: `test_no_typed_error_leaks_the_credential_fixture`
  passes because `redact` still strips the *known* fixture, and
  `test_credential_rejected_states_rejection_without_echoing_any_value` passes
  because its `"rejected" in reason.lower()` assertion is satisfied by the
  echoed provider message, which also contains the word "rejected".
- **Expected evidence/behavior**: DAC-E3-S5-2 requires the reason to state the
  rejection "without echoing any part of the value", and the composer's own
  docstring (`errors.py:284-288`) states the reason this must not rely on
  redaction: "stating 'credential rejected' must not depend on trusting redaction
  to catch every way a credential could appear in provider-echoed text." A test
  should therefore fail when the fixed description is replaced by redacted
  provider text.
- **Impact**: The shipped behavior is correct, so there is no live defect. But the
  one rule DAC-E3-S5-2 exists to enforce has no regression barrier. A future
  refactor that unifies the four branches for tidiness would pass CI while
  reintroducing exactly the credential-disclosure path this story was written to
  close — and redaction would not save it, because a real provider echoes a real
  key, not the test fixture.
- **Required remediation**: Add an assertion that pins `CredentialRejected`'s
  variable segment to the fixed description independently of redaction — for
  example, compose a `CredentialRejected` carrying distinctive diagnostic text
  that the `redact` callable does **not** strip, and assert that text is absent
  from the reason. The mutation above must then fail.

### IR-002 — TDD evidence records a demonstrably incorrect cause for the failing suite test

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T010
- **Files**: `docs/.../CAP-001-E3-S5-tdd-evidence.yaml:44-48`, `:170-174`
- **Claim challenged**: "pre-existing on the base branch, confirmed via `git stash`
  before any story change was applied".
- **Observed evidence**: The test **passes** at the merge base in a clean
  worktree (`4 passed`, command and output in the Independent Validation section)
  and fails in the working checkout. The real cause is a gitignored
  `src/factorflow/api/static/` bundle dated 2026-09-10 present in the developer's
  working directory, confirmed via `git check-ignore -v` and `ls -la`. Because
  `git stash` does not touch ignored files, the described procedure could not
  have distinguished the two hypotheses.
- **Expected evidence/behavior**: Constraint 11 of the review contract and the
  task plan's Validation Plan require recorded evidence to be accurate. A recorded
  cause that cannot follow from the recorded command misdirects every later reader.
- **Impact**: No effect on the shipped code. But the inaccuracy is load-bearing
  for the gate: a reviewer trusting it would conclude the base branch is red, and
  the real cause — a stale local build artifact that will silently fail this test
  for anyone with a bundle on disk — would stay undiagnosed.
- **Required remediation**: Correct the two `full_suite_result` notes to state
  the actual cause (an ignored `src/factorflow/api/static/` bundle in the working
  directory, not a base-branch regression) and the verification that supports it.
  No code change is required.

### IR-003 — Truncation assertion is a tautological disjunction

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S5-3
- **Tasks**: T004
- **Files**: `tests/unit/test_massive_failure_reasons.py:154`
- **Claim challenged**: T004 requires asserting "the variable segment **ends with**
  `…[truncated]`".
- **Observed evidence**: The assertion is
  `assert reason.rstrip().endswith("…[truncated]") or "…[truncated]" in reason`.
  The right operand subsumes the left — any string ending with the marker also
  contains it — so the `endswith` positional check is never load-bearing. The
  test only verifies the marker appears *somewhere*.
- **Expected evidence/behavior**: T004's wording calls for a positional assertion;
  the marker's position is what makes truncation visible at the end of the text
  rather than buried mid-string.
- **Impact**: Minimal. The composer's grammar places the variable segment last, so
  the weaker check happens to hold, and M4 still kills the marker-removal mutation.
  The test is simply weaker than its own docstring claims.
- **Required remediation**: Drop the `or` operand and keep the `endswith` check.

### IR-004 — Unreachable clause in the kind-distinctness assertion

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S5-4
- **Tasks**: T005
- **Files**: `tests/unit/test_massive_failure_reasons.py:189-191`
- **Claim challenged**: That the inner collision loop adds verification beyond the
  `len(set(...))` distinctness check.
- **Observed evidence**: The clause is
  `assert other_marker not in reason or other_marker == kind_markers[kind]`,
  evaluated only when `other_kind != kind`. Since `_kind_marker` is the identity
  function and the four keys are distinct, `other_marker == kind_markers[kind]` is
  always `False`, so the disjunction reduces to `other_marker not in reason`. The
  second operand is dead.
- **Expected evidence/behavior**: Assertions should not carry clauses that cannot
  affect the outcome.
- **Impact**: None on coverage — the reduced form is the check that matters and it
  does kill M6 and N7. Readability only.
- **Required remediation**: Remove the dead `or` operand, and optionally inline
  the identity-function `_kind_marker` helper.

### IR-005 — Redact-spy test's call-count guard is vacuous on the `CredentialRejected` path

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-13
- **Tasks**: T006
- **Files**: `tests/unit/test_massive_failure_reasons.py:242-265`
- **Claim challenged**: T006's requirement that "a redact callback never receives
  the assembled symbol/data-type/request-ID fields" is checked at the boundary.
- **Observed evidence**: The test exercises only `ProviderUnavailable`. I confirmed
  at runtime that `redact` is invoked once for `ProviderUnavailable` (`['d']`) and
  **zero times** for `CredentialRejected` (`[]`). The `assert len(seen) >= 1`
  guard would therefore be unsatisfiable — not merely vacuous — if the test were
  extended to that path, so the guard does not generalize as written.
- **Expected evidence/behavior**: The isolation property is worth asserting for
  every kind that calls `redact`; the guard should express that `redact` is called
  exactly once for redacting kinds and not at all for `CredentialRejected`.
- **Impact**: None currently. Noted so a later extension of this test does not
  trip over the guard.
- **Required remediation**: Optionally parametrize across the three redacting
  error types and assert `len(seen) == 1`, keeping `CredentialRejected` as an
  explicit zero-call case. Non-blocking.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **T003 credential fixture is a module constant, not an environment variable —
  justified.** T003's wording says "set a known credential-like fixture in the
  environment"; the test instead defines `_CREDENTIAL_FIXTURE` at
  `test_massive_failure_reasons.py:25` and passes it through the `redact` closure.
  I confirmed via `grep` that the module uses no `monkeypatch`, `os.environ` or
  `setenv`. This is the correct choice and consistent with the task plan's own
  Notes ("the composer accepts a credential-aware `redact` callback … rather than
  receiving a raw credential or importing runtime configuration") and with
  T001's prohibition on configuration imports: the composer never reads the
  environment, so an environment variable would test nothing. Recorded as a
  deviation from the literal task text, not as a finding.
- **Branch field in the task plan is stale.** `CAP-001-E3-S5-tasks.md:35` records
  `**Branch**: usr/alvaro-de-jodra/CAP-001-E2-S4`; the work is on
  `usr/alvaro-de-jodra/CAP-001-E3-S5`. This is a copy-paste artifact in the
  planning document that predates coding (it is unchanged by this story's commit),
  so it is out of scope for this story's remediation. Noted for the next planning
  pass.
- **No scope leakage.** The source diff is confined to the two files T007–T009
  name plus the test module T001 names. No dependency, configuration, or
  unrelated refactor was introduced; `pyproject.toml` is untouched.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to doc sync for `CAP-001-E3-S5`. IR-001 and IR-002
  are accepted as warnings and should be addressed in a follow-up: IR-001 adds one
  assertion to `test_massive_failure_reasons.py`, IR-002 corrects two notes in the
  TDD evidence file. Neither blocks documentation synchronization, since both the
  shipped behavior and the documented contract are correct. Separately, the stale
  gitignored `src/factorflow/api/static/` bundle should be cleared from the
  working directory so `uv run pytest -m 'not postgres'` runs green locally.
- **Warnings accepted downstream**: IR-001, IR-002 (MEDIUM); IR-003, IR-004,
  IR-005 (LOW).
