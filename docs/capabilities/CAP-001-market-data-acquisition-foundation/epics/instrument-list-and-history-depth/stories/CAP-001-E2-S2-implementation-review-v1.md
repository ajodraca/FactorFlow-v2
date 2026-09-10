---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S2-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-10
updated: 2026-09-10
story_id: "CAP-001-E2-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-09-10T00:00:00Z"
reviewed_head: "417e897ec8cfd14caf1c07f7022074b823142b77"
review_base: "feeda63b99fc01fbab77fa5b896b48342aef9b75"
reviewed_state_revision: "sha256:b8edbf1589788a0c90d4b07d7feb5344ab86d92d691d45e3c4b374eb5578d860"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E2-S2
    artifact_version: 1
    content_revision: sha256:b7658c6ea01a211d2982daceb8ad3d046a5c680e3197b56c4762ff6ea262690c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-10T00:00:00Z
  source_artifacts:
    - id: CAP-001-E2-S2
      version: "1"
    - id: CAP-001-E2-S2-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E2-S2 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 8/8 satisfied |
| Planned tasks | 15/15 verified |
| Required validation | 6/6 passed |

`src/factorflow/instruments/settings.py` implements the read and write of the history depth setting exactly as the approved task plan specifies: `HISTORY_DEPTH_KEY`, a frozen `HistoryDepth` dataclass carrying `years` and `updated_at`, `read_history_depth` returning `HistoryDepth | None`, and `write_history_depth` performing a bound-parameter upsert into `owner_setting` with `ValueError` below 1 and no upper cap. Every acceptance criterion traces to production code and to at least one meaningful test.

The verdict is evidence-backed rather than inferred from the checked boxes. I reran all six required validation commands independently (all pass, 170 tests total), and I mutation-probed the four load-bearing behaviors — unset-reads-as-`None`, positive-integer validation, no-silent-cap, and SQL bound parameters. Every mutation was caught by a named test, so the suite genuinely constrains the implementation rather than merely accompanying it.

The three findings are all non-blocking. The one MEDIUM records that `read_history_depth` is outside the reach of the SQL-safety test that guards its sibling; the two LOWs record a stale task-plan branch reference and an untested `updated_at` type assertion. None of these leaves an acceptance criterion, a required task, or a required validation command unsatisfied.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S2-tasks.md` |
| Component | FactorFlow-v2 |
| Branch | `usr/alvaro-de-jodra/CAP-001-E2-S2` |
| HEAD | `417e897ec8cfd14caf1c07f7022074b823142b77` |
| Review base | `origin/main` @ `feeda63b99fc01fbab77fa5b896b48342aef9b75` |
| Working tree | clean — no staged, unstaged, or untracked files |
| Changed files reviewed | 7 |

**Note on base selection.** The local `main` ref is stale at `c3b79f6` and predates the merge of sibling story CAP-001-E2-S1 (PR #26, merge commit `feeda63`). Using the local `main` merge base would have pulled S1's entire change set into this review. `origin/main` is current at `feeda63`, which is the true parent of this story's single commit `417e897`, so `feeda63` is the correct review base and isolates exactly this story's work.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/instruments/settings.py` | added | T010, T011, T014; DAC-E2-S2-1..5, AC-2, DAC-E2-7, DAC-E2-12 |
| `tests/integration/test_history_depth.py` | added | T002–T007, T012, T013; TC-COMP-105, 118–122 |
| `tests/unit/test_history_depth_types.py` | added | T008; DAC-E2-S2-4 |
| `tests/unit/test_history_depth_sql_safety.py` | added | T009; component design section 4 (SEC-INP-002) |
| `tests/unit/test_scope_boundaries.py` | deleted | T010 — obsolete sibling-story scope fence; see Scope and Plan Deviations |
| `.../CAP-001-E2-S2-tasks.md` | modified | T001–T015 checkbox state plus a deviation note |
| `.../CAP-001-E2-S2.md` | modified | `status: planning` → `in-review` |

No unjustified file appears in the change set. No dependency, configuration, migration, or unrelated source file was touched.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-2 | SATISFIED | `settings.py:33-52` `read_history_depth` returns `None` when no row exists | `test_history_depth.py::test_read_before_any_write_returns_none_distinct_from_zero` | Supplies the absent-vs-set distinction the run precondition consumes. No default and no fallback exists in the module. |
| DAC-E2-7 | SATISFIED | `settings.py:48-49` early `return None` on `row is None` | same as AC-2, asserted with `assert result is None` | Asserted with `is None`, not a falsy check, so a regression to `0` fails. Mutation-verified. |
| DAC-E2-12 | SATISFIED | `settings.py:64` validates only the lower bound; no ceiling exists | `test_fifty_years_is_recorded_unchanged_with_no_cap_enforced` | 50 is stored and read back unchanged. Shortfall handling is correctly absent from this module. |
| DAC-E2-S2-1 | SATISFIED | `settings.py:64-65` rejects non-`int`, `bool`, and `years < 1` | `test_write_rejects_zero_negative_and_non_integer_values` | Covers `0`, `-5`, `3.5`, `"5"`. The explicit `isinstance(years, bool)` exclusion is a correct and non-obvious guard, since `bool` is an `int` subclass and `True` would otherwise store as depth 1. |
| DAC-E2-S2-2 | SATISFIED | `settings.py:70-77` upsert keyed `HISTORY_DEPTH_KEY` with `Json({"years": years})` | `test_write_stores_years_as_jsonb_keyed_by_setting_key` | Test queries `owner_setting` directly rather than round-tripping through the module, so it proves the stored shape rather than self-consistency. |
| DAC-E2-S2-3 | SATISFIED | `settings.py:73-74` `ON CONFLICT ... DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = now()` | `test_overwriting_replaces_value_and_advances_updated_at` | Asserts the new value, `updated_at` strictly increasing, and `count(*) == 1` — the row-count assertion rules out a second row being created. |
| DAC-E2-S2-4 | SATISFIED | `settings.py:25-30` `HistoryDepth` dataclass; `settings.py:52` returns both fields | `test_read_carries_updated_at_alongside_value`; `test_history_depth_types.py` | See IR-003 on the strength of the `updated_at` assertion. |
| DAC-E2-S2-5 | SATISFIED | `settings.py:55-77` — no upper bound anywhere in the write path | `test_fifty_years_is_recorded_unchanged_with_no_cap_enforced` | Mutation-verified: injecting `min(years, 5)` fails this test. |

### On the 50-year bound

The task plan's Notes flag a real tension: `component-design-instrument-list-service.md` Open Question 3 says "`write_history_depth` accepts an integer in 1..50," which reads as placing the cap in this module. I checked the authoritative location the same note names, and the design resolves against itself in favor of the plan's reading:

- `component-design-ingestion-api.md:221` defines `MAX_HISTORY_DEPTH_YEARS = 50` and scopes it to `PUT /api/settings/history-depth`, describing it as "a sanity bound against typos, not plan enforcement."
- `component-design-ingestion-api.md:458` specifies the endpoint returns `422` when the value is "not a positive integer or above 50."
- `component-design-ingestion-api.md:373` places the test for the bound in `tests/integration/test_api_settings.py`, an ingestion-api test file.

The enforcement point is therefore the HTTP layer, which is CAP-001-E2-S3, not this story. Open Question 3's phrasing is loose about which function holds the check, but every concrete artifact — the constant, the status code, the test location — puts it at the API. This also agrees with DAC-E2-S2-5, which is explicit that this module "enforces no cap." The implementation is correct as written, and I raise no finding. Worth carrying forward: CAP-001-E2-S3's review should confirm the `422` above 50 actually lands, since this module deliberately does not provide it.

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED (no-op, correctly) | `tests/conftest.py` unchanged by this story | The task said "if needed." I confirmed `migrated_instrument_connection` applies `0001_extensions_owner_state.sql`, which creates `owner_setting`, so no extension was needed. Claiming it complete without editing the file is correct, not bookkeeping drift. |
| T002 | complete | VERIFIED | `test_read_before_any_write_returns_none_distinct_from_zero` | TC-COMP-105. Uses `is None`. |
| T003 | complete | VERIFIED | `test_write_rejects_zero_negative_and_non_integer_values` | TC-COMP-118. All four rejection cases present. |
| T004 | complete | VERIFIED | `test_write_stores_years_as_jsonb_keyed_by_setting_key` | TC-COMP-119. Direct table query. |
| T005 | complete | VERIFIED | `test_overwriting_replaces_value_and_advances_updated_at` | TC-COMP-120. Exceeds the plan by also asserting row count. |
| T006 | complete | VERIFIED | `test_read_carries_updated_at_alongside_value` | TC-COMP-121. See IR-003. |
| T007 | complete | VERIFIED | `test_fifty_years_is_recorded_unchanged_with_no_cap_enforced` | TC-COMP-122. |
| T008 | complete | VERIFIED | `tests/unit/test_history_depth_types.py` (2 tests) | Asserts the dataclass shape and the `HistoryDepth \| None` return annotation, which is what the plan asked for. |
| T009 | complete | VERIFIED | `tests/unit/test_history_depth_sql_safety.py` | AST-based rather than text-scanning; genuinely catches an f-string. See IR-001 on its scope. |
| T010 | complete | VERIFIED | `settings.py:22, 25-30, 33-52` | `HISTORY_DEPTH_KEY`, `HistoryDepth`, `read_history_depth` all present as specified. |
| T011 | complete | VERIFIED | `settings.py:55-77` | Upsert, `ValueError` below 1, no upper bound — matches the task text exactly. |
| T012 | complete | VERIFIED | `uv run pytest -m postgres` → 46 passed | Reran independently. |
| T013 | complete | VERIFIED | `test_history_depth_and_instrument_service_share_one_connection_scope` | Calls `add_symbols` and `write_history_depth` on one connection and asserts both persisted — proves the cross-module scoping claim rather than restating it. |
| T014 | complete | VERIFIED | `settings.py:34-40, 56-62` | Both docstrings state `None` is a real state and that no upper bound is enforced, as the task required. |
| T015 | complete | VERIFIED | All six commands rerun below | Deviation note recorded in the plan; see Scope and Plan Deviations. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_read_before_any_write_returns_none_distinct_from_zero` / TC-COMP-105 | ADEQUATE | Runs against a real empty `owner_setting`; `assert result is None`. Mutation returning `HistoryDepth(years=0, ...)` fails it. | none |
| `test_write_rejects_zero_negative_and_non_integer_values` / TC-COMP-118 | ADEQUATE | Four distinct `pytest.raises(ValueError)` cases spanning zero, negative, float, and string. Replacing the guard with `if years is None` fails it. | Does not assert on the exception message, but the story requires rejection, not a message contract. |
| `test_write_stores_years_as_jsonb_keyed_by_setting_key` / TC-COMP-119 | ADEQUATE | Reads `owner_setting` with its own cursor, asserting `setting_key == "history_depth_years"` and `setting_value == {"years": 5}`. Independent of the module's own read path, so a symmetric read/write bug cannot hide. | none |
| `test_overwriting_replaces_value_and_advances_updated_at` / TC-COMP-120 | ADEQUATE | Asserts the replaced value, `second_updated_at > first_updated_at`, and `count(*) == 1`. The strict `>` is safe because `now()` in separate transactions advances. | none |
| `test_read_carries_updated_at_alongside_value` / TC-COMP-121 | ADEQUATE | Asserts `result.years == 7` and that `updated_at` is present. | `assert result.updated_at is not None` is weaker than a type assertion — see IR-003. |
| `test_fifty_years_is_recorded_unchanged_with_no_cap_enforced` / TC-COMP-122 | ADEQUATE | Writes 50 and reads back 50. Mutation injecting `min(years, 5)` fails it. | none |
| `test_history_depth_and_instrument_service_share_one_connection_scope` (T013) | ADEQUATE | Exercises `add_symbols` and the settings write through one connection, then asserts both the depth and the instrument row persisted. | none |
| `test_history_depth_carries_years_and_updated_at_not_a_bare_optional_int` (T008) | ADEQUATE | Confirms dataclass-ness and both field types. | Constructs `HistoryDepth` directly rather than via the read; the read path is covered by TC-COMP-121, so this is a reasonable split. |
| `test_read_history_depth_return_annotation_is_optional_history_depth` (T008) | ADEQUATE | Asserts the return annotation is `HistoryDepth \| None`, which is precisely the plan's "not a bare `Optional[int]`" requirement. | Annotation-string comparison is somewhat brittle, but it accepts both the string and the runtime union form, so it is not fragile in practice. |
| `test_write_history_depth_uses_bound_parameters_not_string_interpolation` (T009) | ADEQUATE | Walks the AST of `write_history_depth`, rejecting an `ast.JoinedStr` first argument to `.execute()` and requiring `%s` placeholders. Mutation-verified: converting the statement to an f-string fails it. | Covers only `write_history_depth` — see IR-001. |

**Determinism and isolation.** Every integration test takes `migrated_instrument_connection`, which creates a uniquely named database per test inside a session-scoped container and drops it in a `finally` block. No test depends on ordering, wall-clock values, network access, or another test's rows. The one time-sensitive assertion (`second_updated_at > first_updated_at`) compares two server-side `now()` values from distinct transactions, which is deterministic. The unit tests touch no database.

**Regression sensitivity.** I did not rely on the tests' names or on the green result reported upstream. I applied four independent mutations to `settings.py` and confirmed each was caught by the expected test; the working tree was restored to a clean state after each and verified with `git status --porcelain`.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `All checks passed!` |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `72 files already formatted` — check only, no rewrite |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `Success: no issues found in 20 source files` |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `124 passed, 46 deselected, 2 warnings in 12.64s` |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `46 passed, 124 deselected, 2 warnings in 6.79s` |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `170 passed, 2 warnings in 19.45s` |

Docker was available, so the container-backed suite ran in full. No required command was skipped or narrowed. The two warnings are third-party deprecation notices from `starlette`/`fastapi` test client imports, unrelated to this story.

### Validation Side Effects

- Before: clean working tree at `417e897`
- After: clean working tree at `417e897`
- Unexpected tracked-file changes: none. `git status --porcelain` returned empty output both before and after the full validation run and again after each mutation probe was reverted.

## Findings

### IR-001 — SQL-safety test does not cover `read_history_depth`

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A (component design section 4, SEC-INP-002)
- **Tasks**: T009
- **Files**: `tests/unit/test_history_depth_sql_safety.py:41`; `src/factorflow/instruments/settings.py:42-45`
- **Claim challenged**: That the injection-prevention guard the component design requires covers this module's SQL surface.
- **Observed evidence**: The test calls `inspect.getsource(settings.write_history_depth)` and inspects only that function. `read_history_depth` also issues a `cursor.execute` with a parameterized `WHERE setting_key = %s` and is not inspected. I verified the gap by confirming the test file names only `write_history_depth`.
- **Expected evidence/behavior**: `component-design-instrument-list-service.md` section 4 (SEC-INP-002) states "Every statement uses `psycopg` 3 bound parameters." The guard is written per-function, so a module-level guarantee needs the read covered too.
- **Impact**: Low in practice — the current read is correct, and its only interpolatable value is a module constant. But the test's value is as a standing regression fence, and a future edit to the read (for example adding a caller-supplied key) would not be caught by it.
- **Required remediation**: Extend the AST check to cover `read_history_depth` as well, most simply by inspecting the module source or by parameterizing the existing test over both functions. No production change is needed.

### IR-002 — Task plan header names a branch that does not correspond to this work

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: N/A (plan metadata)
- **Files**: `docs/.../CAP-001-E2-S2-tasks.md:33`
- **Claim challenged**: That the task plan's recorded branch identifies where this story was implemented.
- **Observed evidence**: The plan header reads ``**Branch**: `usr/alvaro-de-jodra/CAP-001-epics` ``. The story was actually implemented on `usr/alvaro-de-jodra/CAP-001-E2-S2` (commit `417e897`). The named branch does not exist locally or on the remote — `git branch -a` lists only `main`, `usr/alvaro-de-jodra/CAP-001-E2-S1`, and `usr/alvaro-de-jodra/CAP-001-E2-S2`.
- **Expected evidence/behavior**: The plan's branch field should identify the branch carrying the implementation, so the plan remains a reliable pointer for anyone reconstructing the change set.
- **Impact**: Evidence-quality only. It cost me an extra step to establish the true review base and could mislead a later reader; it does not affect behavior. This value was inherited from the planning stage rather than introduced by coding.
- **Required remediation**: Correct the branch field to `usr/alvaro-de-jodra/CAP-001-E2-S2`.

### IR-003 — `updated_at` assertion in TC-COMP-121 is weaker than the criterion it covers

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E2-S2-4
- **Tasks**: T006
- **Files**: `tests/integration/test_history_depth.py:99`
- **Claim challenged**: That the read demonstrably carries a usable `updated_at` timestamp.
- **Observed evidence**: The assertion is `assert result.updated_at is not None`. Because `HistoryDepth` is a plain dataclass with no runtime type enforcement, this would still pass if `updated_at` were populated with a non-timestamp truthy value from a malformed row mapping.
- **Expected evidence/behavior**: DAC-E2-S2-4 requires the read to carry "the `updated_at` timestamp," and the story's stated purpose is that "the interface can show when it was last changed" — which needs an actual datetime.
- **Impact**: Minor. `tests/unit/test_history_depth_types.py` does assert `isinstance(depth.updated_at, datetime)`, but on a directly constructed instance rather than on a value that came back from the database, so no test currently proves the read path yields a datetime.
- **Required remediation**: Strengthen the integration assertion to `isinstance(result.updated_at, datetime)`, or additionally assert it is close to the write time.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

**Deletion of `tests/unit/test_scope_boundaries.py` — assessed independently, and correct.**

I did not accept the plan's note at face value; I reconstructed the fence's origin and purpose from Git history. The file was added by sibling story CAP-001-E2-S1 under its task T011, which reads: "Write a unit test asserting `write history depth` is out of scope for this story ... assert `src/factorflow/instruments/settings.py` does not exist ... This guards against scope creep into CAP-001-E2-S2, which owns history depth." Recovered content at `feeda63`:

```python
def test_history_depth_settings_are_not_part_of_this_story() -> None:
    """CAP-001-E2-S2, rather than this story, owns history-depth settings."""
    settings_path = Path("src/factorflow/instruments/settings.py")
    assert not settings_path.exists()
```

The deletion is correct on four independently checked grounds:

1. **The fence's stated purpose was to reserve this file for this story.** Its own docstring and its originating task name CAP-001-E2-S2 as the owner. This story's approved task plan T010 creates `src/factorflow/instruments/settings.py` as its central deliverable. The fence's condition is now satisfied by the correct story doing the correct work — the guard succeeded and expired, rather than being violated or circumvented.
2. **It could not have been weakened instead.** The file contained exactly one test with exactly one assertion, `assert not settings_path.exists()`, and that assertion is unconditionally false once the file legitimately exists. There is no narrower form of the check that retains meaning. Retaining it would have required deleting the assertion, leaving an empty test — strictly worse than removing the file.
3. **Nothing else depends on it.** I grepped the repository for `test_scope_boundaries` and `scope_boundaries` across Python, Markdown, and TOML sources: no reference exists outside the deleted file itself and the task-plan note documenting its removal. No pytest configuration, CI job, or other test imports it.
4. **The deletion is in scope for this story specifically.** A scope-fence naming story X can only expire when story X runs. No other story could correctly remove it, and leaving it would have left `main` with a permanently red test.

One process observation, not a finding: this cleanup is a real consequence of T010 but was not an anticipated task in the approved plan. It was recorded as a deviation note in the plan's Notes section and, per the launch context, owner-approved. That is the right handling. The generalizable lesson for future stories is that a scope-fence test should ideally be planned for removal by the story it reserves work for, so the retirement is a planned task rather than a validation-time discovery.

**Other deviations.**

- The task-plan checkbox state (T001–T015 all marked complete) matches the evidence in every case. I found no checked task lacking implementation and no unchecked task that was in fact implemented.
- The story frontmatter advanced `status: planning` → `in-review`, which is the correct state for a story entering this gate.
- T005's test exceeds its plan text by additionally asserting `count(*) == 1`. This is a strengthening within the criterion's intent (DAC-E2-S2-3's "replaces the previous one"), not scope leakage.
- No production code outside `settings.py` was modified, no dependency or configuration changed, and no migration was touched.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to documentation synchronization for CAP-001-E2-S2. Carry IR-001, IR-002, and IR-003 as accepted warnings; none blocks the gate.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (LOW), IR-003 (LOW)
- **Note for CAP-001-E2-S3**: The 50-year upper bound is deliberately absent from `settings.py` and belongs to the ingestion-api HTTP layer (`MAX_HISTORY_DEPTH_YEARS`, `422` above 50, per `component-design-ingestion-api.md` sections 2.4a and the API table). That story's review should confirm the bound actually lands there, since no lower layer provides it.
