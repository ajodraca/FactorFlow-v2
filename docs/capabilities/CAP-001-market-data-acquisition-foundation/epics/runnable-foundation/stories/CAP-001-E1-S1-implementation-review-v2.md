---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S1-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-07
updated: 2026-09-07
story_id: "CAP-001-E1-S1"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-07T03:39:36Z"
reviewed_head: "ef88d9d0ed5cc4a4903eafb4a9f5a2aef3bb9c7a"
review_base: "361b45aab85c161712e7bd46c17fa3dc5ac2ceb6"
reviewed_state_revision: "sha256:58255d776ed4c29fc9ece300d523066c4afffe25ff4aa4a5bdee8bd028b68fb9"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S1
    artifact_version: 2
    content_revision: sha256:525b03e8fa861729d5f6484594abcc91be3c336eb81fde1238e54aa06a6095db
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-07T03:39:36Z
  source_artifacts:
    - id: CAP-001-E1-S1
      version: "2"
    - id: CAP-001-E1-S1-tasks
      version: "1"
    - id: CAP-001-component-design-market-data-store
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S1 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 1 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 17/17 verified |
| Required validation | 7/7 passed |

All six findings from review v1 are resolved with current repository evidence. The blocking finding, IR-001, was resolved through the specification path rather than by editing the applied migration: `CAP-001-E1-S1.md` now carries the two index statements in its Technical Details SQL and states that symbol uniqueness is enforced in `0001`; `CAP-001-E2-S1.md` was amended to add no index; both were re-approved under `backlog-review-report-v6.md`, and the story's `reviewed_revision` matches its current content digest exactly. The story, the component design section 2.3, and the shipped SQL file are now three-way identical.

The remaining defects are evidence-quality and hygiene issues that leave no acceptance criterion, required task, or required validation command incomplete. The two indexes that IR-001 elevated into the story's own specification have no test asserting they exist (IR-007), and `mypy` reports three annotation errors under `tests/` — outside the required `mypy src` command, so not a validation failure (IR-008). Neither blocks Doc Sync.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S1-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-epics` |
| HEAD | `ef88d9d0ed5cc4a4903eafb4a9f5a2aef3bb9c7a` |
| Review base | `origin/main` merge-base `361b45aab85c161712e7bd46c17fa3dc5ac2ceb6` |
| Working tree | Clean — no staged, unstaged, or untracked non-ignored files |
| Changed files reviewed | 9 since merge base; full implementation re-verified as it now stands |

The merge base is the commit that recorded review v1, so the diff from base is exactly the rework. The original implementation (`migrations/0001_extensions_owner_state.sql`, `src/factorflow/db/applied_migrations.py`, `tests/integration/`, `pyproject.toml`) is already merged to `main` and was re-inspected in full at this HEAD rather than assumed unchanged from v1.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `docs/.../stories/CAP-001-E1-S1.md` | modified | IR-001 remediation — records both indexes as shipped by `0001`; re-approved at v2 |
| `docs/.../stories/CAP-001-E2-S1.md` | modified | IR-001 remediation — removes the duplicate `instrument_symbol_key` creation; re-approved at v2 |
| `docs/.../stories/CAP-001-E1-S1-tasks.md` | modified | IR-001/IR-002/IR-003 — Notes reconciled, T014 checkpoint corrected, `last_reworked_review` set |
| `docs/.../backlog-review-report-v6.md` | added | Re-approval evidence for the two amended stories |
| `tests/conftest.py` | modified | IR-004 — teardown moved into `finally` |
| `tests/unit/design_sql.py` | added | IR-005 — reads SQL blocks from the design document |
| `tests/unit/test_migration_0001_matches_design.py` | modified | IR-005 — compares against the design, not a copy; T010 |
| `tests/unit/test_applied_migrations_ddl_matches_design.py` | modified | IR-005 — same; T011 |
| `.gitignore` | modified | IR-006 — `build/`/`dist/` named under the Python section |

No unjustified files. Every change traces to a v1 finding.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-15 | SATISFIED | `migrations/0001_extensions_owner_state.sql` | `tests/integration/test_migration_idempotence.py::test_second_application_loses_no_existing_rows` | Narrow slice only, as the story scopes it: a second guarded application preserves existing rows. Full forward-evolution is CAP-001-E1-S2. |
| DAC-E1-1 | SATISFIED | Single schema; no second store anywhere in the change set | Structural — no dedicated test | Verified by inspection at this HEAD: every table is created in the one database `postgres_connection_string` provisions. Coverage-matrix bookkeeping remains imprecise — IR-009. |
| DAC-E1-2 | SATISFIED | `src/factorflow/db/applied_migrations.py:16-23` | `test_applied_migrations_table.py::test_applied_migrations_creatable_before_any_migration_file` | Table is created from a constant against an empty database, before any migration file runs. |
| DAC-E1-S1-1 | SATISFIED | `migrations/0001_extensions_owner_state.sql:1` | `test_migration_0001.py::test_applying_0001_creates_btree_gist_extension` | Asserts `btree_gist` in `pg_extension` after applying the real file. |
| DAC-E1-S1-2 | SATISFIED | `migrations/0001_extensions_owner_state.sql:9-10` | `test_instrument_constraints.py::test_lowercase_symbol_is_rejected`, `::test_symbol_over_sixteen_characters_is_rejected` | Both violating cases raise `psycopg.errors.CheckViolation` — enforced by the schema, not application code. |
| DAC-E1-S1-3 | SATISFIED | `migrations/0001_extensions_owner_state.sql:11-13` | `test_instrument_constraints.py::test_unknown_lifecycle_value_is_rejected`, `::test_retired_without_retired_at_is_rejected`, `::test_active_with_retired_at_is_rejected` | Both directions of the iff are covered, plus two accepted-case tests confirming the constraint is not over-broad. |
| DAC-E1-S1-4 | SATISFIED | `migrations/0001_extensions_owner_state.sql:19-23` | `test_owner_setting.py` (3 tests) | Column type asserted `jsonb`, `setting_key` asserted PK, arbitrary JSON round-trips. |
| DAC-E1-S1-5 | SATISFIED | `src/factorflow/db/applied_migrations.py:17-22` | `test_applied_migrations_table.py::test_applied_migrations_has_exactly_four_columns_with_version_as_pk` | Asserts the exact ordered column list and that `version` is the sole PK — an added column would fail it. |
| DAC-E1-S1-6 | SATISFIED | `migrations/0001_extensions_owner_state.sql` (guard is test-local by design) | `test_migration_idempotence.py::test_applying_0001_twice_records_exactly_one_row` | Satisfied for this story's scope; the guard lives in the test because the migrator is E1-S2. Disclosed in the plan's Notes and carried forward as a re-verification obligation — see the IR-002 disposition. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `pyproject.toml:1-49` | src layout, setuptools, `psycopg[binary]>=3`, dev extras all present. |
| T002 | complete | VERIFIED | `src/factorflow/__init__.py`, `src/factorflow/db/__init__.py` | Package markers present. |
| T003 | complete | VERIFIED | `pyproject.toml:25-29` | `postgres` marker registered; `testpaths = ["tests"]`. |
| T004 | complete | VERIFIED | `tests/conftest.py:22-69` | Session container + per-test database; teardown now in `finally` (IR-004 fix). |
| T005 | complete | VERIFIED | `tests/integration/test_applied_migrations_table.py` | TC-COMP-293 and TC-COMP-313 implemented with column/PK assertions. |
| T006 | complete | VERIFIED | `tests/integration/test_migration_0001.py` | TC-COMP-309 implemented. |
| T007 | complete | VERIFIED | `tests/integration/test_instrument_constraints.py` | All five violating cases present, one test each, as the story's Testing section requires. |
| T008 | complete | VERIFIED | `tests/integration/test_owner_setting.py` | TC-COMP-312 implemented. |
| T009 | complete | VERIFIED | `tests/integration/test_migration_idempotence.py` | TC-COMP-314 implemented within its disclosed scope limit. |
| T010 | complete | VERIFIED | `tests/unit/test_migration_0001_matches_design.py:17-26` | Now reads design section 2.3 via `sql_block_under_heading`. Mutation-verified: editing the design's index name makes this test fail. |
| T011 | complete | VERIFIED | `tests/unit/test_applied_migrations_ddl_matches_design.py:15-23` | Same mechanism against section 2.2, with a guard test confirming the SQL fence (not the directory-tree fence) was selected. |
| T011-impl | complete | VERIFIED | `src/factorflow/db/applied_migrations.py` | Exports `APPLIED_MIGRATIONS_DDL` verbatim from design 2.2. |
| T012 | complete | VERIFIED | `migrations/0001_extensions_owner_state.sql:1-23` | Was PARTIAL in v1 over the two indexes. Now byte-identical to both the amended story and design 2.3. |
| T013 | n/a | NOT APPLICABLE | — | Documented placeholder; `instrument` and `owner_setting` both live in the single file from T012. |
| T014 | complete | VERIFIED | `uv run pytest -m postgres` → 17 passed | Checkpoint text corrected to claim seven tested TC-IDs, not eight (IR-003 fix). |
| T015 | complete | VERIFIED | `migrations/README.md` | Forward-only, one-file-per-migration, never-edited conventions recorded. |
| T016 | complete | VERIFIED | Validation table below | All seven commands rerun independently and green. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_applied_migrations_table.py` / TC-COMP-293, TC-COMP-313 | ADEQUATE | Creates the table from the shipped constant against a genuinely empty database; asserts the exact ordered column list `["version","name","checksum","applied_at"]` and that `version` is the sole PK; round-trips a recorded row. An added, removed, or reordered column fails it. | None |
| `test_migration_0001.py` / TC-COMP-309 | ADEQUATE | Applies the real file, then queries `pg_extension` and `information_schema.tables`. Would fail if the extension line or either `CREATE TABLE` were removed. | None |
| `test_instrument_constraints.py` / TC-COMP-310, TC-COMP-311 | ADEQUATE | Five negative tests each expecting `CheckViolation` on a distinct violating input, plus two positive tests. The positive tests matter: they prove the constraints are not so broad that they reject valid rows, so the negatives are not passing vacuously. Boundary is exercised at 17 characters against a 16-character limit. | Boundary is tested only from the failing side; a 16-character accepted case would pin the limit exactly. Minor, not a defect. |
| `test_owner_setting.py` / TC-COMP-312 | ADEQUATE | Asserts the `jsonb` type from `information_schema`, the PK column, and a dict round-tripping through `json.dumps` back to an equal dict. A `text` column would fail the type assertion, and a non-`jsonb` column would return a string rather than a dict. | None |
| `test_migration_idempotence.py` / TC-COMP-314 | ADEQUATE for scope | Proves the guarded second application returns `False`, leaves exactly one recorded row, and preserves an `instrument` row inserted between the two attempts. | The guard under test is defined in the test module, so no production regression can fail it. Scoping is correct (the migrator is E1-S2) and now disclosed in the task plan. Carried forward — see IR-002 disposition. |
| `test_migration_0001_matches_design.py` / T010 | ADEQUATE | Reads design section 2.3's fenced SQL and compares byte-for-byte against the shipped file. **Mutation-verified during this review**: renaming `idx_instrument_symbol` in the design made the test fail with an `AssertionError`, and it passed again on restore. This is a genuine two-artifact drift guard, which the v1 version was not. | None |
| `test_applied_migrations_ddl_matches_design.py` / T011 | ADEQUATE | Same mechanism against section 2.2. The companion `test_design_block_is_actually_read` guards the real hazard in the parser — section 2.2 opens with a non-SQL fence — so a silently-empty or wrong extraction cannot leave the comparison trivially true. | None |
| TC-COMP-292 / DAC-E1-1 | MISSING (non-blocking) | No implementing test. The claim is structurally true and I re-verified it by inspection at this HEAD. | Coverage matrix still records "Covered" without distinguishing structural verification — IR-009. |

Isolation and determinism: each test receives a freshly created database inside the shared session container, so tests cannot observe each other's tables. No test depends on wall-clock time, network access beyond the container, execution order, or ambient environment. Fixtures create real schema objects rather than mocking them — there are no mocks in this suite, so mock-validity concerns do not arise.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 27 packages, checked 24. |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built `factorflow-0.1.0.tar.gz` and the wheel into git-ignored `dist/`. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 21 passed. |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 17 passed, 4 deselected, 4.54s. Docker was available, so the marked suite ran in full — no exclusion invoked. |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 16 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No issues in 3 source files. |

Additional non-required probes run for evidence, not as gate criteria:

| Probe | Exit Code | Result | Notes |
|-------|-----------|--------|-------|
| `uv run mypy tests` | 1 | 3 errors | Not a required command; the validation plan specifies `mypy src`. Recorded as IR-008. |
| Design-mutation of `idx_instrument_symbol`, then `uv run pytest tests/unit` | 1 | Guard failed as intended | Confirms IR-005's fix is real. Design file restored; `git diff` clean afterwards. |

### Validation Side Effects

- Before: `git status --porcelain` empty — clean tree at `ef88d9d`.
- After: `git status --porcelain` empty — byte-identical to the pre-validation capture.
- Unexpected tracked-file changes: none. `uv build` wrote `dist/` and `build/`, both git-ignored under the Python section following the IR-006 fix — so the build output the validation plan mandates no longer surfaces as untracked noise. The design-mutation probe was reverted and verified clean via `git diff --quiet`.

## Findings

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 1 · **total 3**

| ID | Severity | Summary |
|----|----------|---------|
| IR-007 | MEDIUM | The two indexes the story now specifies have no test asserting they exist |
| IR-008 | MEDIUM | `mypy` reports three annotation errors under `tests/`, outside the required `mypy src` scope |
| IR-009 | LOW | Coverage matrix still records TC-COMP-292 as "Covered" without marking it structurally verified |

### IR-007 — The two indexes the story now specifies have no test asserting they exist

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S1-2 (adjacent); supports AC-1 and DAC-E2-S1-3 downstream
- **Tasks**: T012, T014
- **Files**: `migrations/0001_extensions_owner_state.sql:16-17`; `tests/integration/` (absent)
- **Claim challenged**: That the resolution of IR-001 — moving symbol-uniqueness ownership into this story — is backed by test evidence commensurate with its new status.
- **Observed evidence**: `grep` for `idx_instrument`, `pg_indexes`, `indexname`, `UniqueViolation`, and `duplicate` across `tests/` returns nothing. No test asserts either index exists, and no test inserts a duplicate symbol to confirm the unique index rejects it. The only guard is `test_migration_0001_matches_design.py`, which compares file text against the design — it would catch deleting the line from the file, but proves nothing about the index's behavior in a live database.
- **Expected evidence/behavior**: The v1 review escalated these indexes precisely because ownership was ambiguous; the story was then amended to claim them. An element important enough to amend two approved stories over should have a behavioral test. The story's own Testing section does not list one, which is why this is MEDIUM rather than HIGH — no stated requirement is unmet.
- **Impact**: Low near-term risk: the migration is applied as one file, so the index cannot silently vanish while the tables succeed. The gap matters downstream — CAP-001-E2-S1's reactivation semantics (DAC-E2-S1-3) depend on this index rejecting a duplicate symbol, and its T002 is written to *verify* the index exists rather than create it. If E2-S1's verification is also text-based, the uniqueness guarantee reaches production with no test ever having inserted two rows with the same symbol.
- **Required remediation**: Not required for this gate. Add a test inserting a duplicate symbol and asserting `psycopg.errors.UniqueViolation`, and an assertion that both indexes appear in `pg_indexes` for `instrument`. This is a natural fit for CAP-001-E2-S1's T002, which already owns verifying the index — that story should discharge it behaviorally rather than by inspection.

### IR-008 — `mypy` reports three annotation errors under `tests/`

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T004, T007, T008, T009
- **Files**: `tests/integration/test_owner_setting.py:21`; `tests/integration/test_instrument_constraints.py:22`; `tests/integration/test_migration_idempotence.py:76`
- **Claim challenged**: That the type-checking validation gate covers the code this story ships.
- **Observed evidence**: `uv run mypy tests` exits 1 with three errors: two `[misc]` errors where a generator fixture is annotated `-> psycopg.Connection` instead of `Iterator[psycopg.Connection]` (both `migrated_connection` fixtures `yield`), and one `[index]` error at `test_migration_idempotence.py:76` where `cur.fetchone()[0]` indexes a value typed `tuple[Any, ...] | None` without a `None` check. The required command `uv run mypy src` passes because `tool.mypy` has no `files` setting and the plan scopes it to `src`.
- **Expected evidence/behavior**: `[tool.mypy] strict = true` signals an intent to type-check this project strictly. Roughly two-thirds of the code this story ships lives under `tests/`, and it is unchecked. The two fixture annotations are outright incorrect — they name a return type the functions do not have.
- **Impact**: No runtime defect today. `test_migration_idempotence.py:76` is the one with latent bite: if that query ever returned no row the test would raise `TypeError` rather than a readable assertion failure, though the preceding `INSERT` makes that unreachable now. The larger cost is that the strictness the constitution's tech stack selected does not actually apply to most of the story's code, and the gap widens as later stories add tests under the same unchecked tree.
- **Required remediation**: Not required for this gate — `mypy src` is the command the plan and tech stack specify, and it passes. Fix the three errors and consider whether the validation command should become `uv run mypy src tests`. That is a tech-stack decision affecting every later story, so raise it rather than changing it unilaterally in a rework.

### IR-009 — Coverage matrix still records TC-COMP-292 as "Covered"

- **Severity**: LOW
- **Status**: OPEN (partially remediated from v1/IR-003)
- **Acceptance criteria**: DAC-E1-1
- **Tasks**: T014
- **Files**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/coverage-matrix.md:324`
- **Claim challenged**: That v1/IR-003's remediation is complete.
- **Observed evidence**: IR-003 offered two remediations: add an assertion, or amend the matrix so the status distinguishes structural verification — and required correcting the T014 checkpoint either way. The checkpoint was corrected and now reads "Seven of the eight mandatory TC-IDs… have implementing tests", and a disclosing note was added to `test_migration_idempotence.py:11-13`. But `coverage-matrix.md:324` still reads `TC-COMP-292 | — | — | Covered` at P1, unchanged. Neither offered remediation was applied to the matrix itself; the docstring note is a third, weaker option.
- **Expected evidence/behavior**: The matrix is what Doc Sync and release readiness consult, and it is the artifact that says "Covered". The correction landed in the two places a reader is least likely to look.
- **Impact**: Bookkeeping only — the underlying claim is true and I verified it independently at this HEAD. Downgraded from v1's MEDIUM to LOW because the two most load-bearing statements (the task-plan checkpoint and the test file) are now accurate, so a reader reaching the matrix has two corroborating corrections nearby. The residual risk is that a later automated coverage roll-up counts TC-COMP-292 as tested.
- **Required remediation**: Amend `coverage-matrix.md:324` to a status that distinguishes structural verification from test coverage — for example `Structural (no test)` — so the gap is visible in the artifact that reports coverage. Suitable for Doc Sync to carry.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) — migration ships an index the story defers to E2-S1 | RESOLVED | Resolved via option (a), the specification path. `CAP-001-E1-S1.md:101-102` now carries both index statements in its Technical Details SQL; `:122` replaces the "deliberately **not** added here" sentence with the reasoning that uniqueness is enforced in `0001` and E2-S1 owns reactivation only. `CAP-001-E2-S1.md:90` drops the `instrument_symbol_key` creation and states no index is added. Both stories re-approved at `artifact_version: 2` under `backlog-review-report-v6.md`; `artifact-gate.py revision` returns `sha256:525b03e8…`, matching the story's own `reviewed_revision` — the amendment is approved, not merely edited. The task plan's self-contradicting Note is rewritten and cites IR-001. `CAP-001-E2-S1-tasks.md:64` (T002) verifies the index rather than creating a duplicate, so the downstream collision is closed. Story, design section 2.3, and the shipped file are byte-identical. |
| v1/IR-002 (MEDIUM) — TC-COMP-314 verified against a test-local guard | RESOLVED as recorded | No code change was required or made — correct, since the migrator is genuinely E1-S2. The remediation asked that E1-S2 re-verify against the real migrator and that the matrix not treat this proof as final. A new Note in `CAP-001-E1-S1-tasks.md:172` states the proof is "contributory, not final", that no shipped code implements the guard so no production regression can fail the test, and that E1-S2 must re-verify TC-COMP-314 alongside DAC-E1-S2-1. The obligation is now recorded where E1-S2's planner will encounter it. |
| v1/IR-003 (MEDIUM) — TC-COMP-292 recorded "Covered" with no test | PARTIALLY RESOLVED | T014's checkpoint corrected to "Seven of the eight mandatory TC-IDs (TC-COMP-293, 309–314) have implementing tests… It is not counted as a green test", and `test_migration_idempotence.py:11-13` discloses the structural satisfaction. The coverage matrix itself is unchanged. Re-raised at reduced severity as IR-009. |
| v1/IR-004 (MEDIUM) — fixture leaks databases on test failure | RESOLVED | `tests/conftest.py:55-69`: `pg_terminate_backend` and `DROP DATABASE IF EXISTS` are now inside `finally`, with a nested `finally` guaranteeing `admin_conn.close()` even if the drop raises — a stronger fix than the finding asked for. A comment at `:56-58` records why. `DROP DATABASE` gained `IF EXISTS`, so teardown after a failure that already dropped the database does not itself raise. |
| v1/IR-005 (LOW) — drift guards compare against a hardcoded copy | RESOLVED | New `tests/unit/design_sql.py` parses fenced `sql` blocks from `component-design-market-data-store.md` keyed by heading prefix, skipping non-SQL fences and stopping at the next same-or-higher heading so a missing block raises rather than silently matching a later section. Both guards now call it. **Verified by mutation**: renaming `idx_instrument_symbol` in the design made `test_migration_0001_matches_design_verbatim` fail; restoring it passed. The v1 version would have stayed green. Each guard also carries a `test_design_block_is_actually_read` companion so an empty extraction cannot pass trivially. |
| v1/IR-006 (LOW) — `dist/` git-ignored only incidentally | RESOLVED | `.gitignore:9-13` adds `build/` and `dist/` under the Python section with a comment naming `uv build` as the writer and noting the frontend entry covered only one by coincidence. Confirmed in practice: `uv build` produced both directories during this review and the tree stayed clean. |

## Scope and Plan Deviations

- **The rework is confined to the v1 findings.** All nine changed files trace to a specific finding; no unrelated production code, dependency, or configuration changed. `migrations/0001_extensions_owner_state.sql` and `src/factorflow/db/applied_migrations.py` are untouched since v1 — correct, since IR-001 was resolved by amending specifications rather than editing an applied migration file, honoring `migrations/README.md`'s never-edit rule.
- **IR-001's resolution changed two approved stories.** This is the heavier of the two options v1 offered, and it was taken through the proper path — both stories re-approved at version 2 under a fresh backlog review, with digests matching. Amending an approved artifact is legitimate here because the review explicitly identified it as a specification decision the reviewer could not make unilaterally.
- **`CAP-001-E2-S1.md` was modified by this story's rework.** Editing a different story's file would normally be scope leakage; here it is the required half of IR-001's remediation, which named that story's duplicate index explicitly. Recorded as justified, not leakage.
- **`backlog-review-report-v6.md` is a new artifact from a different agent** included in the branch range. Not attributable to this story's coding work; reviewed only as approval evidence for the two amendments.
- **T013 remains a documented placeholder** — legitimately NOT APPLICABLE, unchanged from v1.
- **`T011-impl` remains a non-sequential task ID.** Bookkeeping only; the plan explains and permits it.
- **All 17 task checkboxes are marked complete and all 17 now hold.** T012, which v1 found PARTIAL against a checked box, is now genuinely VERIFIED — the overstatement is gone because the specification moved to match the code, and that move was approved.
- **The task plan's `artifact_version` is still `1`** despite substantive Notes and checkpoint edits, with `last_reworked_review` added to mark the rework instead. Consistent with how the pipeline tracks task-plan rework; noted for completeness, not raised as a finding.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to Doc Sync for CAP-001-E1-S1 with the three warnings recorded. While syncing, amend `coverage-matrix.md:324` so TC-COMP-292's status distinguishes structural verification from test coverage (IR-009), and do not record TC-COMP-314 as finally covered — CAP-001-E1-S2 must re-verify it against the real migrator. Carry IR-007 into CAP-001-E2-S1's planning: its T002 already owns verifying `idx_instrument_symbol` and should discharge that behaviorally, by inserting a duplicate symbol and asserting `UniqueViolation`, rather than by inspection. IR-008 is a tech-stack question — whether the type-check command should cover `tests/` — and should be raised with the owner rather than settled inside a story rework.
- **Warnings accepted downstream**: IR-007 (MEDIUM), IR-008 (MEDIUM), IR-009 (LOW)
