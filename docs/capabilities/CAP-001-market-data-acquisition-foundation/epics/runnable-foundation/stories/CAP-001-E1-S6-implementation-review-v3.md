---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-08
updated: 2026-09-08
story_id: "CAP-001-E1-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-09-08T21:51:26Z"
reviewed_head: "0c0a1415783f48f0d8d6986881b980d0c3c498e6"
review_base: "d0b01577741e58cdc2968cb88e08f943e09892d7"
reviewed_state_revision: "sha256:9153e97af09fb70b05164c82f0da9ca5c2e7cbe5eec0bea9ee06271233359c6c"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S6
    artifact_version: 1
    content_revision: sha256:a7cdcf3a31a9e610d5abe7a75596593cb29a01eb79b45c07fa8ecd8c3a6bec26
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-08T21:51:26Z
  source_artifacts:
    - id: CAP-001-E1-S6
      version: "1"
    - id: CAP-001-E1-S6-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S6 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 2 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 25/25 verified |
| Required validation | 5/5 passed |

This is the second rework review. Its narrow purpose is to determine whether the single commit added since v2 (`0c0a141`) genuinely closes IR-201, and whether the rest of the change set remains sound.

**IR-201 is genuinely RESOLVED.** The mutation the v2 report specified as the closing condition — deleting the `configure_logging()` call from `_lifespan` in `app.py` — was re-applied in this review and now **fails** the new test, where under v2 it left the entire suite green. This was verified twice: against the composition file alone (`1 failed, 2 passed`) and against the full non-postgres suite (`1 failed, 114 passed`, versus v2's `114 passed`). The new test has the discriminating power the two direct-call tests lack, exactly as the commit message claims.

**IR-202 and IR-203 remain correctly OPEN and are not claimed as fixed.** Neither the commit message, the task file, nor any code comment asserts otherwise. `tests/unit/test_api_request_id.py` and `src/factorflow/config/settings.py` are byte-identical to their v2 state (`git diff f6cdb89..HEAD` is empty for both), and IR-202's mutation was re-run and still passes, confirming the gap is unchanged rather than incidentally closed.

Two new findings are recorded, both non-blocking. IR-301 (LOW) is that the new test's own docstring and inline comment overstate what it exercises: they claim it covers request-id stamping "together" with redaction, but the log call sits *after* the request returns, so the record carries no request id at all — verified directly. The test's redaction assertion, which is the part IR-201 required, is sound; only the claim about the second half is wrong. IR-302 (LOW) records that v2's IR-201 remediation text asked for a record emitted "from within a request", which this test does not quite do.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S6` |
| HEAD | `0c0a1415783f48f0d8d6986881b980d0c3c498e6` |
| Remote | `origin/usr/alvaro-de-jodra/CAP-001-E1-S6` at the same SHA — pushed, no divergence. PR #21 open. |
| Review base | `main` merge-base `d0b01577741e58cdc2968cb88e08f943e09892d7` |
| Working tree | clean — no staged, unstaged, or untracked files, before and after all validation and all mutation experiments |
| Commits on branch | 6 (`94a5bba`, `1fa8b49`, `f6cdb89`, `14dc744`, `d6be516`, `0c0a141`) |
| Changed files reviewed | 28 across the full `base..HEAD` range |
| Pipeline state | `adversarial-review: RESUME — component repository changed after the latest passing review` |

### Evidence Caveat — stale context cache

`bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` exited **2**: context freshness STALE, last feeder run `2026-09-07T16:58:31Z` (28h against a 24h `freshness_window_hours`). Every other prerequisite row passed.

On the owner's explicit instruction, this review proceeded without refreshing, and the context feeder was **not** run — deliberately, to avoid a network fetch across project repos as a side effect of a read-only review.

This does not weaken the evidence below. Every finding in this report derives from the component repository working tree, its Git history, and commands executed against it in this session — not from `cache/`. The IR-201 verification in particular is a direct mutation-and-execute experiment on `src/factorflow/api/app.py`, which the cache does not participate in. The staleness is recorded here because the skill requires the gap to be explicit, not because any specific conclusion depends on it.

### Change Set

The complete `base..HEAD` set is 28 files (2077 insertions, 49 deletions). Only 6 files changed since v2's HEAD (`f6cdb89`), across two commits.

| File | State | Delta since v2 | Story/Task Justification |
|------|-------|----------------|--------------------------|
| `src/factorflow/api/__init__.py` | added | — | T001 |
| `src/factorflow/api/routes/__init__.py` | added | — | T001 |
| `src/factorflow/api/static/.gitkeep` | added | — | T001 |
| `src/factorflow/api/models.py` | added | — | T002 |
| `src/factorflow/api/errors.py` | added | — | T003 |
| `src/factorflow/api/routes/health.py` | added | — | T016 |
| `src/factorflow/api/app.py` | added | — | T017–T020 |
| `src/factorflow/app_main.py` | added | — | T021 |
| `tests/unit/test_api_request_id.py` | added | — | T005 (TC-COMP-345) |
| `tests/unit/test_api_request_id_redaction_composition.py` | added | **modified in `0c0a141`** | IR-001 regression; **IR-201 fix** |
| `tests/unit/test_health_route_unreachable.py` | added | — | IR-002 regression test |
| `tests/integration/test_api_binding.py` | added | — | T006 (TC-COMP-014, 346) |
| `tests/integration/test_api_health.py` | added | — | T007, T008, T010 |
| `tests/integration/test_api_static_mount.py` | added | — | T011 (TC-COMP-344) |
| `tests/unit/test_api_no_secrets.py` | added | — | T009 (TC-COMP-300) |
| `tests/unit/test_api_isolation.py` | added | — | T012 |
| `tests/unit/test_health_schema_version.py` | added | — | T013 |
| `tests/unit/test_health_database_probe.py` | added | — | T014 |
| `tests/unit/test_api_models.py` | added | — | T015 |
| `pyproject.toml` | modified | — | Dependencies |
| `uv.lock` | modified | — | Lockfile |
| `Dockerfile` | modified | — | T021/T023 |
| `README.md` | modified | **modified in `d6be516`** | Doc Sync after the v2 gate |
| `docs/constitution/tech-stack.md` | modified | **modified in `d6be516`** | Doc Sync — `psycopg_pool` recorded (user-approved) |
| `.../CAP-001-E1-S6-tasks.md` | modified | **modified in `0c0a141`** | `last_reworked_review` → v2 |
| `.../CAP-001-E1-S6.md` | modified | **modified in `d6be516`** | `status` → `docs-sync` |
| `.../CAP-001-E1-S6-implementation-review-v1.md` | added | — | v1 gate report |
| `.../CAP-001-E1-S6-implementation-review-v2.md` | added | **added in `14dc744`** | v2 gate report |

No unjustified files. The v1 and v2 report files were **not** modified by either new commit — verified by `git diff f6cdb89..HEAD` listing neither.

The two commits since v2 are cleanly separated by purpose: `d6be516` is the Doc Sync work the v2 PASS-WITH-WARNINGS gate authorized, and `0c0a141` is the IR-201 fix. Neither touches production code.

## Previous Review Disposition

Every finding from `CAP-001-E1-S6-implementation-review-v2.md` is dispositioned below with current repository evidence gathered in this review. The nine v1 findings were dispositioned in v2 and are not re-litigated here; no v1 finding regressed, since no production file changed since v2.

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-201 — the `configure_logging()` lifespan call site is untested | **RESOLVED** | Mutation re-applied: `1 failed, 114 passed` (was `114 passed` under v2). See detail below. |
| v2/IR-202 — TC-COMP-345's "every record" quantifier ranges over one record | **STILL OPEN** | `tests/unit/test_api_request_id.py` byte-identical to v2 (`git diff f6cdb89..HEAD` empty). Mutation re-run: still `2 passed`. Correctly not claimed as fixed. |
| v2/IR-203 — a repeat `configure_logging()` call drops request-id stamping | **STILL OPEN** | `src/factorflow/config/settings.py` and `src/factorflow/api/app.py:71-82` byte-identical to v2. Correctly not claimed as fixed. |

### IR-201 — verification detail

The v2 report specified the exact closing condition: *"Deleting `configure_logging()` from `_lifespan` must fail that test."* That mutation was re-applied in this review.

Baseline before mutation — `md5 src/factorflow/api/app.py` = `c80c845bdb6374791bfd5fb29d1d65a3`, matching the value v2 recorded, confirming the production file is unchanged since v2:

```
uv run pytest tests/unit/test_api_request_id_redaction_composition.py -q
3 passed
```

Mutation applied — the `configure_logging()` line removed from `_lifespan`, leaving `_install_request_id_patch()`:

```
uv run pytest tests/unit/test_api_request_id_redaction_composition.py -q
FAILED tests/unit/test_api_request_id_redaction_composition.py::test_lifespan_installs_redaction_end_to_end
1 failed, 2 passed
```

```
uv run pytest -m 'not postgres' -q
FAILED tests/unit/test_api_request_id_redaction_composition.py::test_lifespan_installs_redaction_end_to_end
1 failed, 114 passed, 30 deselected
```

Under v2 this identical mutation produced `114 passed` with nothing failing. The captured log output during the mutated run shows the credential in the clear, which is precisely the disclosure the test now catches:

```
INFO  factorflow.api.test.lifespan_redaction:...:139 leaking SECRETKEY789 here
```

versus the unmutated run, where the same call emits `leaking [redacted] here`.

The two pre-existing direct-call tests stayed green under the mutation (`2 passed`), confirming the commit's claim that the new test supplies discriminating power the others structurally cannot: they call `settings_module.configure_logging()` themselves, so they can never observe whether the *application* calls it.

Restored from a pre-mutation copy; `md5` returned to `c80c845bdb6374791bfd5fb29d1d65a3` and `git status --porcelain` was empty.

**Mechanism review, not just the mutation result.** The test drives `TestClient(create_app())` as a context manager, which is what runs `_lifespan` — a bare `TestClient(app)` without `with` would not, and would have made the test vacuous. The `with` block is present (line 133). The `_reset_handler_patches` autouse fixture deletes both sentinels before and after each test, so the assertion cannot be satisfied by redaction left installed by an earlier test in the same process. Order-independence was confirmed by running the file first and last against the two other logging-sensitive test files (`6 passed` both ways).

### IR-202 — verification detail

Re-applied v2's mutation — restricting the stamping condition at `app.py:78` to records named `factorflow.api.routes.health`:

```
uv run pytest tests/unit/test_api_request_id.py -q
2 passed
```

Unchanged from v2. The finding stands exactly as written: during a `GET /api/health` request the only `factorflow.api.*` record is the one from `routes.health`, so the `for record in component_records` quantifier ranges over a single element. Restored and verified clean.

### IR-203 — verification detail

`src/factorflow/config/settings.py` is unchanged since v2, and `_install_request_id_patch` still stores its own baseline while `configure_logging` still rebuilds from the pristine `_unfiltered_handle`. The asymmetry v2 described is intact. As v2 noted, this is latent and unreachable in current code, and is arguably CAP-001-E1-S3's to own.

## Acceptance Criteria Verification

No production code changed since v2, so each criterion's production evidence is unchanged. The test evidence for DAC-E1-9 is strengthened by the new lifespan test.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 (loopback-only bind) | SATISFIED | `app_main.py:16-30` `build_server` reads `ApiSettings().host` | `test_api_binding.py:52-88` | Unchanged since v2. Full suite reports no skip, so the non-loopback assertion executed on this host. |
| AC-18 (health reports running state without inspecting store) | SATISFIED | `routes/health.py:65-96` | `test_api_health.py`; `test_health_route_unreachable.py` | Unchanged since v2. |
| DAC-E1-16 (liveness, db reachability, credential bool, schema version) | SATISFIED | `models.py:32-36`; `routes/health.py:90-96` | `test_api_health.py::test_health_reachable_database` (postgres-marked, 30 passed) | Container-backed; Docker confirmed available. |
| DAC-E1-9 (credential presence is a boolean, never the value) | SATISFIED | `routes/health.py:93`; `models.py:34`; `app.py:101` `configure_logging()` | `test_api_no_secrets.py:21-23`; `test_api_request_id_redaction_composition.py` (all three tests) | **Strengthened since v2.** The log channel is now protected at the application's real startup path, not only at the direct-call level. |
| DAC-E1-S6-1 (reachable db reports highest applied version) | SATISFIED | `routes/health.py:30-40` | `test_api_health.py`; `test_health_schema_version.py` | Unchanged since v2. |
| DAC-E1-S6-2 (unreachable db still 200, reports unreachable) | SATISFIED | `routes/health.py:46-83` | `test_health_route_unreachable.py`; `test_api_health.py::test_health_unreachable_database` | Unchanged since v2. |
| DAC-E1-S6-3 (`most_recent_run` present as `null`) | SATISFIED | `models.py:36` typed `None` | `test_api_health.py::test_health_most_recent_run_is_null`; `test_api_models.py:21` | Unchanged since v2. |
| DAC-E1-S6-4 (factory mounts the built frontend bundle) | SATISFIED | `app.py:145-176` | `test_api_static_mount.py:52-75` | Unchanged since v2. |
| DAC-E1-S6-5 (request id in every log record for that request) | SATISFIED | `app.py:39-82`, `119-142` | `test_api_request_id.py` | Unchanged since v2. The new lifespan test does **not** add stamping coverage despite its comment saying so — see IR-301. IR-202's limitation still applies. |
| DAC-E1-S6-6 (no endpoint declares an auth requirement) | SATISFIED | `app.py:183` `FastAPI(lifespan=...)` with no `dependencies` | `test_api_isolation.py:18-30`; `test_api_binding.py:91-107` | Unchanged since v2. |

## Task Completion Verification

All 25 tasks were VERIFIED in v2 against production code that has not changed since. Re-verified here that no task regressed and that the task file's only edit is bookkeeping.

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `api/__init__.py`, `api/routes/__init__.py`, `api/static/.gitkeep` | Unchanged since v2. |
| T002 | complete | VERIFIED | `models.py:32-36` | Unchanged since v2. |
| T003 | complete | VERIFIED | `errors.py:23-63` | Unchanged since v2. |
| T004 | complete | VERIFIED | `config/settings.py`, `db/applied_migrations.py` present and imported | Unchanged since v2. |
| T005 | complete | VERIFIED | `tests/unit/test_api_request_id.py` | Unchanged since v2. IR-202 remains open against it. |
| T006 | complete | VERIFIED | `tests/integration/test_api_binding.py` | Unchanged since v2. |
| T007 | complete | VERIFIED | `test_api_health.py:14-45` | Container-backed, 30 postgres tests pass. |
| T008 | complete | VERIFIED | `test_api_health.py:48-66` + `test_health_route_unreachable.py` | Unchanged since v2. |
| T009 | complete | VERIFIED | `test_api_no_secrets.py` | Unchanged since v2. |
| T010 | complete | VERIFIED | `test_api_health.py:69-82` | Unchanged since v2. |
| T011 | complete | VERIFIED | `test_api_static_mount.py` | Unchanged since v2. |
| T012 | complete | VERIFIED | `test_api_isolation.py` | Unchanged since v2. |
| T013 | complete | VERIFIED | `test_health_schema_version.py` | Unchanged since v2. |
| T014 | complete | VERIFIED | `test_health_database_probe.py` | Unchanged since v2. |
| T015 | complete | VERIFIED | `test_api_models.py` | Unchanged since v2. |
| T016 | complete | VERIFIED | `routes/health.py` | Unchanged since v2; `md5` `262f7f3773f751c11f99b92cb5c2b665`. |
| T017 | complete | VERIFIED | `app.py:179-192` | Unchanged since v2. |
| T018 | complete | VERIFIED | `app.py:85-116` | Unchanged since v2. |
| T019 | complete | VERIFIED | `app.py:145-176` | Unchanged since v2. |
| T020 | complete | VERIFIED | `app.py:39-82`, `119-142` | Unchanged since v2. Now additionally protected at the lifespan call site. |
| T021 | complete | VERIFIED | `app_main.py:13-38` | Unchanged since v2. |
| T022 | complete | VERIFIED | Full suite rerun below | 145 tests pass independently (144 in v2, +1 new). |
| T023 | complete | VERIFIED | `Dockerfile:26` `migrate_main && exec python -m factorflow.app_main` | Unchanged since v2. |
| T024 | complete | VERIFIED | `errors.py:48-63`; `routes/health.py`; `app.py:101` | **Strengthened** — this task's log-disclosure concern is now regression-protected at the real startup path. |
| T025 | complete | VERIFIED | Commands rerun below | All five pass. |

All 25 tasks VERIFIED; no PARTIAL or NOT IMPLEMENTED. The task file's `last_reworked_review` was correctly advanced to `CAP-001-E1-S6-implementation-review-v2.md`, and all boxes remain checked with supporting evidence.

## Test Quality Assessment

Only the composition file changed since v2. Tests unchanged since v2 retain their v2 assessment and are listed for completeness; the new test is assessed in full.

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_api_request_id_redaction_composition.py::test_lifespan_installs_redaction_end_to_end` (**new**) | ADEQUATE | Constructs the app via `create_app()` and enters `TestClient` as a context manager, so the real `_lifespan` runs. Asserts `response.status_code == 200`, that a record was captured, that the secret is absent from `getMessage()`, and that the message equals `"leaking [redacted] here"` exactly. Mutation (delete `configure_logging()` from `_lifespan`) → FAILED, while the two direct-call tests stay green. Autouse fixture clears both sentinels, so the pass cannot come from leaked global state. Order-independent across three logging-sensitive files. | Does not exercise request-id stamping despite its comment claiming to — the log call is outside the request scope, so the record carries no id (IR-301). Redaction — the part IR-201 required — is genuinely covered. |
| `test_api_request_id_redaction_composition.py::test_redaction_then_request_id_compose` | ADEQUATE | Direct install order A; asserts redacted *and* stamped. | Unchanged from v2. Cannot observe the app's own call site — which is why the new test was needed. |
| `test_api_request_id_redaction_composition.py::test_request_id_then_redaction_compose` | ADEQUATE | Direct install order B; asserts redacted *and* stamped. | Unchanged from v2. |
| `test_api_request_id.py` / TC-COMP-345 | ADEQUATE | Captures at root; requires every `factorflow.api.*` record to carry the id; second test asserts two requests differ. | Unchanged from v2. IR-202 open: the quantifier ranges over one record; mutation still passes. |
| `test_health_route_unreachable.py` | ADEQUATE | Isolates `get_health` with a pool raising if the version query is reached. | Unchanged from v2. |
| `test_api_binding.py::test_server_binds_to_loopback_only` / TC-COMP-014 | ADEQUATE | Drives `app_main.build_server`; asserts loopback reachable and real non-loopback IPv4 refused. | Unchanged from v2. |
| `test_api_binding.py::test_no_route_declares_an_authentication_dependency` / TC-COMP-346 | ADEQUATE | Dependency-name check plus absence of `securitySchemes`. | Unchanged from v2. |
| `test_api_health.py::test_health_reachable_database` / TC-COMP-307, 341 | ADEQUATE | Real container, seeded rows, asserts `max` version. | Unchanged from v2. |
| `test_api_health.py::test_health_unreachable_database` / TC-COMP-342, 018 | ADEQUATE | HTTP-level 200/`unreachable`/`schema_version is None`. | Unchanged from v2; paired with the unit test for sensitivity. |
| `test_api_health.py::test_health_most_recent_run_is_null` / TC-COMP-343 | ADEQUATE | Key presence and `is None` separately. | Unchanged from v2. |
| `test_api_no_secrets.py` / TC-COMP-300 | ADEQUATE | Secret substring absent from raw `response.text`. | Unchanged from v2. |
| `test_api_static_mount.py` (4 tests) / TC-COMP-344 | ADEQUATE | Fixture bundle with nested asset; unconditional SPA fallback; `not_found` envelope under `/api`. | Unchanged from v2. |
| `test_api_isolation.py` | ADEQUATE | Empty router and per-route dependency lists. | Unchanged from v2. |
| `test_health_schema_version.py` | ADEQUATE | Parametrised over empty/populated. | Unchanged from v2. |
| `test_health_database_probe.py` | ADEQUATE | Fake pool raises on `__enter__`. | Unchanged from v2. Single case. |
| `test_api_models.py` | ADEQUATE | JSON round-trip, boolean identity, `most_recent_run is None`. | Unchanged from v2. |

All nine mandatory TC-IDs (TC-COMP-014, 018, 300, 307, 341–346) remain implemented and ADEQUATE. No WEAK or MISSING mandatory test.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "59 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 16 source files" (`strict = true`) |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 115 passed, 30 deselected, 0 skipped |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 30 passed, 115 deselected. `docker info` confirmed available, so container-backed cases genuinely ran. |

Combined: **145 tests pass**, matching the commit message's claim of "145 passed (up from 144)" exactly. The claim was verified, not accepted.

Mutation and reproduction experiments performed independently. Each was applied to a working-tree copy, run, then restored from a pre-mutation copy, with `md5` confirmed identical and `git status` confirmed clean:

| Experiment | Target | Result |
|------------|--------|--------|
| **Delete `configure_logging()` from `_lifespan`** (v2's specified IR-201 condition) | `app.py` | **1 failed, 2 passed** on the composition file; **1 failed, 114 passed** on the full non-postgres suite — IR-201 now protected (was `114 passed` under v2) |
| Stamp only `factorflow.api.routes.health` records | `app.py` | 2 passed — IR-202 still open, unchanged from v2 |
| New test in isolation | no file modified | 1 passed — not dependent on suite ordering |
| New test file first, then `test_api_request_id.py`, `test_api_no_secrets.py` | no file modified | 6 passed — no global patch leakage |
| Reverse file order of the same three | no file modified | 6 passed — order-independent |
| Direct probe of the record captured by the new test | no file modified | `msg = leaking [redacted] here`, `has request_id = False`, `ContextVar = None` — redaction covered, stamping not (IR-301) |

### Validation Side Effects

- Before: working tree clean at `0c0a141`, no untracked files. `md5 src/factorflow/api/app.py` = `c80c845bdb6374791bfd5fb29d1d65a3`.
- After: working tree clean at `0c0a141`, no untracked files. `md5 src/factorflow/api/app.py` = `c80c845bdb6374791bfd5fb29d1d65a3`; `md5 src/factorflow/api/routes/health.py` = `262f7f3773f751c11f99b92cb5c2b665`. Both match their pre-review values and v2's recorded values.
- Unexpected tracked-file changes: none. No validation command modified a tracked file. All mutation experiments were restored from pre-mutation copies held outside the repository; scratch scripts were written outside the repository.

## Findings

### IR-301 — The new test's docstring and comment claim request-id coverage the test does not provide

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S6-5 (currently SATISFIED on other evidence)
- **Tasks**: T005, T020
- **Files**: `tests/unit/test_api_request_id_redaction_composition.py:133-147`
- **Claim challenged**: The test's inline comment at lines 134-137 states the emitted record is "inside the request-id middleware's `ContextVar` scope -- exercising both halves (redaction and stamping) together, the way a genuine in-request log call would." The commit message likewise describes "a record logged from within that request."
- **Observed evidence**: The `logger.info(...)` call at line 139 executes *after* `client.get("/api/health")` has returned. The middleware resets the `ContextVar` token in its `finally` block (`app.py:139-140`) when the response completes, so by the time the log call runs the scope is gone. Probed directly against the unmutated tree:

  ```
  msg      = leaking [redacted] here
  has rid  = False
  ctxvar   = None
  ```

  The record is redacted but carries no `request_id` attribute at all. Being inside the `with TestClient(app)` block keeps the *lifespan* open, which is what the redaction assertion needs; it does not place the call inside a *request*. The test asserts nothing about `request_id`, so it passes correctly — the defect is in the description, not the assertions.
- **Expected evidence/behavior**: A comment stating a test exercises a behavior should be accurate, since future maintainers rely on it to know what is covered. This is the same class of overstatement v2's IR-201 recorded against the commit message.
- **Impact**: Documentation only; no acceptance criterion is affected and no assertion is wrong. The risk is that a reader takes DAC-E1-S6-5 to be covered end-to-end by this test when it is not, and IR-202's genuine gap is already the open record of that. Worth correcting so the two findings do not appear to overlap.
- **Required remediation**: Either correct the comment and docstring to say the test covers redaction installation only, or move the `logger.info(...)` call to somewhere genuinely inside request handling (a test-only route, or a dependency) and add an assertion on `record.request_id` — which would also close IR-202.

### IR-302 — v2's IR-201 remediation asked for an in-request record; the delivered test logs outside the request

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (evidence-quality only; IR-201's substance is resolved)
- **Tasks**: T024
- **Files**: `tests/unit/test_api_request_id_redaction_composition.py:133-147`; `CAP-001-E1-S6-implementation-review-v2.md:333`
- **Claim challenged**: The commit states it closes IR-201. IR-201's required remediation read: *"Add a test that drives the app through its lifespan (e.g. `with TestClient(create_app()):`) with a secret set, emits a record carrying that secret **from within a request**, and asserts it is redacted. Deleting `configure_logging()` from `_lifespan` must fail that test."*
- **Observed evidence**: Three of the four clauses are met exactly — the lifespan is driven via `with TestClient(create_app())`, the secret is set via `monkeypatch.setenv`, and the mutation fails the test (verified above). The "from within a request" clause is not met, per IR-301's probe.
- **Expected evidence/behavior**: The operative clause of IR-201 was the mutation-sensitivity condition, which is satisfied. Redaction is installed process-wide by `configure_logging()`, so a record logged after the request is emitted through the same patched `Handler.handle` and tests the same install; logging in-request would not make the redaction assertion stronger.
- **Impact**: None on the gate. IR-201 is genuinely closed on its substance. Recorded so the divergence between the remediation text and the delivered test is on the record rather than discovered later as an apparent gap.
- **Required remediation**: None required. Folding this into IR-301's remediation would satisfy both, and would close IR-202 at the same time.

## Scope and Plan Deviations

- **No production code changed since v2.** `git diff f6cdb89..HEAD` touches only `README.md`, `docs/constitution/tech-stack.md`, the v2 report, the story, the task file, and one test file. Every finding v2 recorded against production code therefore stands unchanged unless re-verified above.
- **`d6be516` (Doc Sync) is authorized, not scope leakage.** v2's verdict was PASS-WITH-WARNINGS with "Next agent: Doc Sync Agent", so README, tech-stack, and the story `status: in-review → docs-sync` transition are the expected product of that gate. The `psycopg_pool` addition to tech-stack Key Libraries is recorded as user-approved in the commit message and matches an actual dependency in `pyproject.toml`.
- **`0c0a141` is minimal and on-target.** Two files: the test that closes IR-201, and the `last_reworked_review` pointer advanced v1 → v2. No production file, no unrelated test, no dependency change.
- **IR-202 and IR-203 correctly left open.** Neither the commit message, the task file, nor any code comment claims either is fixed. The commit message is explicit that it closes IR-201 only. This is accurate bookkeeping.
- **Story `status` is `docs-sync`.** Consistent with v2 having passed and Doc Sync having run. The task file `status` remains `in-progress`, which is a minor inconsistency but matches the state v2 accepted; the final `done` transition is noted in `d6be516` as waiting on Phase 6b automation review.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Doc Sync already ran for this story at `d6be516` (README, tech-stack, story status). The only change since is a test file and a bookkeeping pointer, neither of which alters documented behavior, so a further Doc Sync pass is likely a no-op — confirm and close, or proceed to Phase 6b automation for CAP-001-E1-S6.
- **Warnings accepted downstream**: IR-202 (MEDIUM — TC-COMP-345's "every record" assertion ranges over a single record in practice; mutation still passes), IR-203 (LOW — a repeat `configure_logging()` call would drop request-id stamping; not reachable in current code), IR-301 (LOW — the new test's comment overstates its request-id coverage), IR-302 (LOW — the delivered test logs outside the request where IR-201's remediation text said within; substance of IR-201 nonetheless met). IR-202 remains the one with real regression value: a single remediation that emits an additional `factorflow.api.*` record from inside a request would close IR-202, IR-301, and IR-302 together.
