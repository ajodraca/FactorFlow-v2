---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S6-implementation-review
artifact_type: implementation-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-08
updated: 2026-09-08
story_id: "CAP-001-E1-S6"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md"
component: "FactorFlow-v2"
review_version: 4
reviewed_at: "2026-09-08T22:07:17Z"
reviewed_head: "5e6a9af5417ac1585f60e8e6d085696bb710956b"
review_base: "d0b01577741e58cdc2968cb88e08f943e09892d7"
reviewed_state_revision: "sha256:71bf84a6e79ead5f323a97cc600342c2dc05d82ca1b396d2e1934f3b1a6b7cb9"
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
  timestamp: 2026-09-08T22:07:17Z
  source_artifacts:
    - id: CAP-001-E1-S6
      version: "1"
    - id: CAP-001-E1-S6-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S6 — Version 4

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 2 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 25/25 verified |
| Required validation | 5/5 passed |

This is the third rework review. Its narrow purpose is to determine whether the single commit added since v3 (`5e6a9af`) genuinely closes IR-301 and IR-302, whether IR-201 remains protected, and whether the rest of the change set is still sound.

**IR-301 and IR-302 are genuinely RESOLVED, verified by direct observation rather than by reading the new comments.** The commit's claim is that `routes.health.credential_present` — a function `get_health` really calls while handling the request — is monkeypatched to log the secret as a side effect, placing the record inside the request-id middleware's `ContextVar` scope. An independent probe replicating the test's setup and printing the `ContextVar` *at the moment of the in-request call* returned a real UUID (`c177e521-…`), not the `None` that v3 observed; the captured record carried `request_id` equal to that UUID, and the response's `X-Request-Id` header matched it exactly. The mechanism is sound: `routes/health.py:19` imports `credential_present` into the module namespace and `routes/health.py:93` calls it as a bare name, so `monkeypatch.setattr(health_module, …)` genuinely intercepts the in-request call.

**The new assertion has real discriminating power — it is not decorative.** Moving the `logger.info(...)` call back outside the request (reverting to exactly the v3 shape) makes the test **FAIL**, so the test would not pass if the secret were logged outside request handling as before.

**IR-201 remains protected.** The mutation v2 specified as its closing condition — deleting `configure_logging()` from `_lifespan` — was re-applied and still **fails** the test (`1 failed, 2 passed` on the file; `1 failed, 114 passed` on the full non-postgres suite, identical to v3). The failure is precisely the credential disclosure: `AssertionError: assert 'SECRETKEY789' not in 'leaking SECRETKEY789 here'`. The refactor did not weaken the IR-201 guarantee.

**IR-202 is materially improved but not fully closed, so it is downgraded rather than resolved.** The new assertion now catches IR-202's mutation (stamping only `factorflow.api.routes.health` records), which v3's version did not — failing with `assert None == '566e519d-…'`. However `tests/unit/test_api_request_id.py` (TC-COMP-345 itself) is byte-identical to its v2 state and **still passes alone** under that same mutation. The suite as a whole now catches the regression; the mandatory TC-ID's own assertion still does not. IR-202 is therefore carried forward at reduced severity (MEDIUM → LOW, IR-402) rather than marked resolved.

No production code has changed since v2. All 145 tests pass, and all five required validation commands pass.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S6-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S6` |
| HEAD | `5e6a9af5417ac1585f60e8e6d085696bb710956b` |
| Remote | `origin/usr/alvaro-de-jodra/CAP-001-E1-S6` at the same SHA — pushed, no divergence. PR #21 open. |
| Review base | `main` merge-base `d0b01577741e58cdc2968cb88e08f943e09892d7` |
| Working tree | clean — no staged, unstaged, or untracked files, before and after all validation and all five mutation experiments |
| Commits on branch | 8 (`94a5bba`, `1fa8b49`, `f6cdb89`, `14dc744`, `d6be516`, `0c0a141`, `1dc70cb`, `5e6a9af`) |
| Changed files reviewed | 29 across the full `base..HEAD` range (2438 insertions, 49 deletions) |
| Pipeline state | `adversarial-review: RESUME — component repository changed after the latest passing review` |

### Evidence Caveat — stale context cache

`bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` exited **2**: context freshness STALE, last feeder run `2026-09-07T16:58:31Z` (29h against a 24h `freshness_window_hours`). Every other prerequisite row passed — project config, approval policy `owner-allowed`, project repo, 4 constitution files, product charter, tech stack, and git hooks.

On the owner's explicit instruction, this review proceeded without refreshing, and the context feeder was **not** run — deliberately, to avoid a network fetch across project repos as a side effect of a read-only review. This is the same reasoning v3 recorded, and the staleness has now widened from 28h to 29h.

This does not weaken the evidence below. Every finding in this report derives from the component repository working tree, its Git history, and commands executed against it in this session — not from `cache/`. The IR-301/IR-302 and IR-201 verifications in particular are direct mutation-and-execute and runtime-probe experiments against `src/factorflow/api/app.py` and the test file, which the cache does not participate in. The staleness is recorded because the skill requires the gap to be explicit, not because any conclusion depends on it.

### Change Set

The complete `base..HEAD` set is 29 files. Only **one file** changed since v3's HEAD (`0c0a141`), plus the v3 report itself which was added by `1dc70cb`.

| File | State | Delta since v3 | Story/Task Justification |
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
| `tests/unit/test_api_request_id_redaction_composition.py` | added | **modified in `5e6a9af`** | IR-001 regression; IR-201 fix; **IR-301/IR-302 fix** |
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
| `README.md` | modified | — | Doc Sync after the v2 gate |
| `docs/constitution/tech-stack.md` | modified | — | Doc Sync — `psycopg_pool` recorded (user-approved) |
| `.../CAP-001-E1-S6-tasks.md` | modified | — | `last_reworked_review` → v2 (see IR-403) |
| `.../CAP-001-E1-S6.md` | modified | — | `status` → `docs-sync` |
| `.../CAP-001-E1-S6-implementation-review-v1.md` | added | — | v1 gate report |
| `.../CAP-001-E1-S6-implementation-review-v2.md` | added | — | v2 gate report |
| `.../CAP-001-E1-S6-implementation-review-v3.md` | added | **added in `1dc70cb`** | v3 gate report |

No unjustified files. `git diff --name-only f6cdb89..HEAD -- src/` is **empty**: no production file has changed since v2, so every v2/v3 conclusion about production code carries forward without re-derivation.

The v1, v2, and v3 report files were **not** modified by `5e6a9af` — verified by `git diff --name-only 14dc744..HEAD -- '*implementation-review-v1.md' '*implementation-review-v2.md'` returning empty, and by the v3 report appearing only as an addition in `1dc70cb`.

`5e6a9af` is minimal and on-target: one test file, 32 insertions and 15 deletions, no production code, no dependency change, no unrelated test touched.

## Previous Review Disposition

Every finding from `CAP-001-E1-S6-implementation-review-v3.md` is dispositioned below with current repository evidence gathered independently in this review.

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v3/IR-301 — the test's docstring/comment claimed request-id coverage it did not provide | **RESOLVED** | Runtime probe: `ContextVar` inside the call = `c177e521-c2d2-4e15-8c85-96de06fd0bd5`; `record.request_id` = same; `X-Request-Id` header = same; `MATCH = True`. Reverting the log call to outside the request **fails** the test. Detail below. |
| v3/IR-302 — v2's IR-201 remediation asked for an in-request record; the delivered test logged outside | **RESOLVED** | The "from within a request" clause is now met literally — the record is emitted from inside `get_health`'s call to `credential_present()`. All four clauses of IR-201's remediation text are now satisfied. |
| v3/IR-202 — TC-COMP-345's "every record" quantifier ranges over one record | **STILL OPEN (downgraded)** | The composition test now catches IR-202's mutation (`assert None == '566e519d-…'`), but `tests/unit/test_api_request_id.py` is byte-identical to v2 and still passes alone under it (`2 passed`). Carried forward as IR-402 at LOW. |
| v3/IR-203 — a repeat `configure_logging()` call drops request-id stamping | **STILL OPEN** | `src/factorflow/config/settings.py` unchanged since v2 (`git diff f6cdb89..HEAD` empty); the `_unfiltered_handle` asymmetry is intact at `settings.py:259-262`. Latent and unreachable in current code. Carried forward as IR-401. |

### IR-301 / IR-302 — verification detail

The claim under challenge is that the secret is now logged from genuinely inside request handling, not merely asserted to be.

**Mechanism check first.** `src/factorflow/api/routes/health.py:19` does `from factorflow.config.settings import credential_present`, binding the name into the `health` module's own namespace, and line 93 calls it as a bare `credential_present()`. A `monkeypatch.setattr(health_module, "credential_present", …)` therefore rebinds exactly the name `get_health` resolves at call time. Had the route instead called `settings.credential_present()` through the module object, the patch would have been a no-op and the test vacuous. It does not.

**Direct runtime probe.** An independent script (written outside the repository) replicated the test's setup and printed the `ContextVar` at the moment of the in-request log call, plus the resulting record's attributes:

```
CTXVAR_INSIDE = c177e521-c2d2-4e15-8c85-96de06fd0bd5
STATUS        = 200
MSG           = leaking [redacted] here
SECRET_IN_MSG = False
REC_RID       = c177e521-c2d2-4e15-8c85-96de06fd0bd5
HDR_RID       = c177e521-c2d2-4e15-8c85-96de06fd0bd5
MATCH         = True
```

Under v3 the equivalent probe returned `ctxvar = None` and `has rid = False`. The scope is now genuinely open when the record is emitted, and the record's id matches the response header. This is observation of the running system, not a reading of the new comment.

**Sensitivity check — would the test fail if the fix were absent?** The `logger.info(...)` call was moved back outside the request, restoring exactly the v3 arrangement (`logger.info` after `client.get()` inside the `with` block, monkeypatch removed):

```
uv run pytest tests/unit/test_api_request_id_redaction_composition.py -q
FAILED tests/unit/test_api_request_id_redaction_composition.py::test_lifespan_installs_redaction_end_to_end
1 failed, 2 passed
```

The test genuinely discriminates. The new `assert getattr(record, "request_id", None) == response.headers["x-request-id"]` is load-bearing, not decorative — the arrangement v3 found deficient no longer passes.

The docstring and inline comment now match what the test does: they state the health route is monkeypatched to log "genuinely from inside request handling" and that the record is checked "for both the redacted message and a request id bound while the middleware's `ContextVar` scope is still open." Both claims were verified true above. The overstatement IR-301 recorded is gone.

### IR-201 — re-verification detail

The v2 closing condition was re-applied to confirm the IR-301/IR-302 refactor did not weaken it. Baseline `md5 src/factorflow/api/app.py` = `c80c845bdb6374791bfd5fb29d1d65a3`, matching both v2's and v3's recorded values and confirming production code is unchanged.

Mutation applied — `configure_logging()` removed from `_lifespan`, leaving `_install_request_id_patch()`:

```
uv run pytest tests/unit/test_api_request_id_redaction_composition.py -q
FAILED tests/unit/test_api_request_id_redaction_composition.py::test_lifespan_installs_redaction_end_to_end
1 failed, 2 passed

uv run pytest -m 'not postgres' -q
FAILED tests/unit/test_api_request_id_redaction_composition.py::test_lifespan_installs_redaction_end_to_end
1 failed, 114 passed, 30 deselected
```

Identical to v3's result. The failure reason was inspected rather than assumed, and is precisely the credential disclosure the test exists to catch:

```
>       assert secret not in record.getMessage()
E       AssertionError: assert 'SECRETKEY789' not in 'leaking SECRETKEY789 here'
INFO     factorflow.api.test.lifespan_redaction:...:147 leaking SECRETKEY789 here
```

The two pre-existing direct-call tests stayed green under the mutation (`2 passed`), confirming the discriminating power still comes from the lifespan test alone. Restored from a pre-mutation copy; `md5` returned to `c80c845bdb6374791bfd5fb29d1d65a3` and `git status --porcelain` was empty.

### IR-202 — scope of the improvement

The commit message claims the new assertion closes "IR-202's gap for this test as a side effect". That is accurate as written, and the qualifier "for this test" matters. IR-202's mutation — restricting stamping at `app.py:78` to records named `factorflow.api.routes.health` — was applied twice, with different scopes:

| Scope run under the IR-202 mutation | Result | Meaning |
|---|---|---|
| `test_api_request_id.py` + composition file | **3 failed, 2 passed** | The suite now catches the regression |
| `test_api_request_id.py` alone (TC-COMP-345) | **2 passed** | The mandatory TC-ID's own assertion still does not |

The composition test's failure is precisely the new assertion: `assert None == '566e519d-99d2-49fc-877f-5ad0738c1fca'`. So regression protection for DAC-E1-S6-5 genuinely exists now where it did not under v3. But TC-COMP-345 — the test the coverage matrix maps to that criterion — is unchanged and retains the single-record quantifier v2 identified. The gap is narrower and lower-risk, not eliminated, and is carried forward as IR-402 at LOW rather than closed.

## Acceptance Criteria Verification

No production code changed since v2, so each criterion's production evidence is unchanged. Test evidence for DAC-E1-9 and DAC-E1-S6-5 is strengthened by this commit.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-14 (loopback-only bind) | SATISFIED | `app_main.py:16-30` `build_server` reads `ApiSettings().host` | `test_api_binding.py:52-88` | Unchanged since v2. Full suite reports 0 skips, so the non-loopback assertion executed on this host. |
| AC-18 (health reports running state without inspecting store) | SATISFIED | `routes/health.py:65-96` | `test_api_health.py`; `test_health_route_unreachable.py` | Unchanged since v2. |
| DAC-E1-16 (liveness, db reachability, credential bool, schema version) | SATISFIED | `models.py:32-36`; `routes/health.py:90-96` | `test_api_health.py::test_health_reachable_database` (postgres-marked, 30 passed) | Container-backed; `docker info` confirmed available. |
| DAC-E1-9 (credential presence is a boolean, never the value) | SATISFIED | `routes/health.py:93`; `models.py:34`; `app.py:101` `configure_logging()` | `test_api_no_secrets.py:21-23`; `test_api_request_id_redaction_composition.py` (all three tests) | **Strengthened again.** The log channel is now protected at the real startup path *and* the disclosure is exercised from inside genuine request handling, which is the realistic shape of the v1 field defect (a driver exception or library debug line emitted mid-request). |
| DAC-E1-S6-1 (reachable db reports highest applied version) | SATISFIED | `routes/health.py:30-40` | `test_api_health.py`; `test_health_schema_version.py` | Unchanged since v2. |
| DAC-E1-S6-2 (unreachable db still 200, reports unreachable) | SATISFIED | `routes/health.py:46-83` | `test_health_route_unreachable.py`; `test_api_health.py::test_health_unreachable_database` | Unchanged since v2. |
| DAC-E1-S6-3 (`most_recent_run` present as `null`) | SATISFIED | `models.py:36` typed `None` | `test_api_health.py::test_health_most_recent_run_is_null`; `test_api_models.py:21` | Unchanged since v2. |
| DAC-E1-S6-4 (factory mounts the built frontend bundle) | SATISFIED | `app.py:145-176` | `test_api_static_mount.py:52-75` | Unchanged since v2. |
| DAC-E1-S6-5 (request id in every log record for that request) | SATISFIED | `app.py:39-82`, `119-142` | `test_api_request_id.py`; `test_api_request_id_redaction_composition.py:164` | **Strengthened.** A second, independent logger (`factorflow.api.test.lifespan_redaction`) is now confirmed to be stamped in-request, and the suite fails under IR-202's mutation. TC-COMP-345's own quantifier limitation persists (IR-402). |
| DAC-E1-S6-6 (no endpoint declares an auth requirement) | SATISFIED | `app.py:183` `FastAPI(lifespan=...)` with no `dependencies` | `test_api_isolation.py:18-30`; `test_api_binding.py:91-107` | Unchanged since v2. |

## Task Completion Verification

All 25 tasks were VERIFIED in v2 and v3 against production code that has not changed since. Re-verified here that no task regressed and that the sole edit is a test file.

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `api/__init__.py`, `api/routes/__init__.py`, `api/static/.gitkeep` | Unchanged since v2. |
| T002 | complete | VERIFIED | `models.py:32-36` | Unchanged since v2. |
| T003 | complete | VERIFIED | `errors.py:23-63` | Unchanged since v2. |
| T004 | complete | VERIFIED | `config/settings.py`, `db/applied_migrations.py` present and imported | Unchanged since v2. |
| T005 | complete | VERIFIED | `tests/unit/test_api_request_id.py` | Unchanged since v2. IR-402 remains open against it. |
| T006 | complete | VERIFIED | `tests/integration/test_api_binding.py` | Unchanged since v2. |
| T007 | complete | VERIFIED | `test_api_health.py:14-45` | Container-backed; 30 postgres tests pass. |
| T008 | complete | VERIFIED | `test_api_health.py:48-66` + `test_health_route_unreachable.py` | Unchanged since v2. |
| T009 | complete | VERIFIED | `test_api_no_secrets.py` | Unchanged since v2. |
| T010 | complete | VERIFIED | `test_api_health.py:69-82` | Unchanged since v2. |
| T011 | complete | VERIFIED | `test_api_static_mount.py` | Unchanged since v2. |
| T012 | complete | VERIFIED | `test_api_isolation.py` | Unchanged since v2. |
| T013 | complete | VERIFIED | `test_health_schema_version.py` | Unchanged since v2. |
| T014 | complete | VERIFIED | `test_health_database_probe.py` | Unchanged since v2. |
| T015 | complete | VERIFIED | `test_api_models.py` | Unchanged since v2. |
| T016 | complete | VERIFIED | `routes/health.py`; `md5` `262f7f3773f751c11f99b92cb5c2b665` | Unchanged since v2. Its `credential_present` call site (line 93) is now the in-request hook the new test uses. |
| T017 | complete | VERIFIED | `app.py:179-192` | Unchanged since v2. |
| T018 | complete | VERIFIED | `app.py:85-116` | Unchanged since v2. |
| T019 | complete | VERIFIED | `app.py:145-176` | Unchanged since v2. |
| T020 | complete | VERIFIED | `app.py:39-82`, `119-142` | Unchanged since v2. Now regression-protected at the real startup path *and* in-request, via a logger other than `routes.health`. |
| T021 | complete | VERIFIED | `app_main.py:13-38` | Unchanged since v2. |
| T022 | complete | VERIFIED | Full suite rerun below | 145 tests pass independently, matching v3. |
| T023 | complete | VERIFIED | `Dockerfile:26` `migrate_main && exec python -m factorflow.app_main` | Unchanged since v2. |
| T024 | complete | VERIFIED | `errors.py:48-63`; `routes/health.py`; `app.py:101` | **Strengthened** — the log-disclosure concern is now exercised on the realistic in-request path. |
| T025 | complete | VERIFIED | Commands rerun below | All five pass. |

All 25 tasks VERIFIED; no PARTIAL or NOT IMPLEMENTED. All 25 boxes remain checked with supporting evidence, and no unchecked task exists. The task file's `last_reworked_review` was **not** advanced to v3 — recorded as IR-403.

## Test Quality Assessment

Only the composition file changed since v3. Tests unchanged since v2 retain their prior assessment and are listed for completeness; the modified test is assessed in full.

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_api_request_id_redaction_composition.py::test_lifespan_installs_redaction_end_to_end` (**modified**) | ADEQUATE | Constructs the app via `create_app()` and enters `TestClient` as a context manager, so the real `_lifespan` runs. Monkeypatches `health_module.credential_present` with a wrapper that logs the secret and delegates to the original — verified to intercept the real in-request call, since `routes/health.py:19` imports the name into the module namespace and line 93 calls it bare. Asserts `200`, a record was captured, the secret is absent, the message equals `"leaking [redacted] here"`, and `record.request_id == response.headers["x-request-id"]`. Runtime probe confirms the `ContextVar` is genuinely set at the call (`c177e521-…`, not `None`). Three independent mutations all fail it: deleting `configure_logging()` from `_lifespan`; narrowing stamping to `routes.health` records; and moving the log call back outside the request. Autouse fixture clears both sentinels, so no pass can come from leaked global state. Passes in isolation and in both file orders. | The wrapper's `return original_credential_present()` delegation is not load-bearing for this test's assertions (replacing it with `return False` still passes) — but `credential_present`'s own value is covered by `test_api_no_secrets.py` and `test_api_health.py`, so this is not a coverage gap. |
| `test_api_request_id_redaction_composition.py::test_redaction_then_request_id_compose` | ADEQUATE | Direct install order A; asserts redacted *and* stamped. | Unchanged since v2. Cannot observe the app's own call site — which is why the lifespan test exists. |
| `test_api_request_id_redaction_composition.py::test_request_id_then_redaction_compose` | ADEQUATE | Direct install order B; asserts redacted *and* stamped. | Unchanged since v2. |
| `test_api_request_id.py` / TC-COMP-345 | ADEQUATE | Captures at root; requires every `factorflow.api.*` record to carry the id; second test asserts two requests differ. | Unchanged since v2. IR-402 open: run alone under the stamping mutation it still reports `2 passed`. The suite now catches that regression elsewhere. |
| `test_health_route_unreachable.py` | ADEQUATE | Isolates `get_health` with a pool raising if the version query is reached. | Unchanged since v2. |
| `test_api_binding.py::test_server_binds_to_loopback_only` / TC-COMP-014 | ADEQUATE | Drives `app_main.build_server`; asserts loopback reachable and real non-loopback IPv4 refused. | Unchanged since v2. |
| `test_api_binding.py::test_no_route_declares_an_authentication_dependency` / TC-COMP-346 | ADEQUATE | Dependency-name check plus absence of `securitySchemes`. | Unchanged since v2. |
| `test_api_health.py::test_health_reachable_database` / TC-COMP-307, 341 | ADEQUATE | Real container, seeded rows, asserts `max` version. | Unchanged since v2. |
| `test_api_health.py::test_health_unreachable_database` / TC-COMP-342, 018 | ADEQUATE | HTTP-level 200/`unreachable`/`schema_version is None`. | Unchanged since v2; paired with the unit test for sensitivity. |
| `test_api_health.py::test_health_most_recent_run_is_null` / TC-COMP-343 | ADEQUATE | Key presence and `is None` separately. | Unchanged since v2. |
| `test_api_no_secrets.py` / TC-COMP-300 | ADEQUATE | Secret substring absent from raw `response.text`. | Unchanged since v2. |
| `test_api_static_mount.py` (4 tests) / TC-COMP-344 | ADEQUATE | Fixture bundle with nested asset; unconditional SPA fallback; `not_found` envelope under `/api`. | Unchanged since v2. |
| `test_api_isolation.py` | ADEQUATE | Empty router and per-route dependency lists. | Unchanged since v2. |
| `test_health_schema_version.py` | ADEQUATE | Parametrised over empty/populated. | Unchanged since v2. |
| `test_health_database_probe.py` | ADEQUATE | Fake pool raises on `__enter__`. | Unchanged since v2. Single case. |
| `test_api_models.py` | ADEQUATE | JSON round-trip, boolean identity, `most_recent_run is None`. | Unchanged since v2. |

All nine mandatory TC-IDs (TC-COMP-014, 018, 300, 307, 341–346) remain implemented and ADEQUATE. No WEAK or MISSING mandatory test.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "All checks passed!" |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "59 files already formatted" |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | "Success: no issues found in 16 source files" (`strict = true`) |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 115 passed, 30 deselected, 0 skipped |
| `uv run pytest -m postgres` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 30 passed, 115 deselected. `docker info` confirmed available, so container-backed cases genuinely ran. |

Combined: **145 tests pass**, matching the commit message's claim of "145 passed" exactly. The claim was verified, not accepted.

Mutation and reproduction experiments performed independently. Each was applied to a working-tree copy, run, then restored from a pre-mutation copy held outside the repository, with `md5` confirmed identical and `git status` confirmed clean after each:

| Experiment | Target | Result |
|------------|--------|--------|
| Runtime probe of the in-request record | no file modified | `ContextVar` = `c177e521-…` (not `None`), `record.request_id` = same, `X-Request-Id` = same, `MATCH = True` — **IR-301/IR-302 genuinely fixed** |
| **Move the log call back outside the request** (revert to the v3 shape) | composition test | **1 failed, 2 passed** — the new assertion genuinely discriminates |
| **Delete `configure_logging()` from `_lifespan`** (v2's IR-201 condition) | `app.py` | **1 failed, 2 passed** on the file; **1 failed, 114 passed** full non-postgres — **IR-201 still protected**; failure is the literal secret disclosure |
| Stamp only `factorflow.api.routes.health` records (IR-202) | `app.py` | **3 failed, 2 passed** with the composition file included — now caught |
| Same mutation, `test_api_request_id.py` alone | `app.py` | **2 passed** — TC-COMP-345's own gap persists (IR-402) |
| Break the wrapper's delegation (`return False`) | composition test | 3 passed — delegation not load-bearing for these assertions |
| Composition file in isolation | no file modified | 1 passed — not dependent on suite ordering |
| Three logging-sensitive files, order A then reversed | no file modified | 6 passed both ways — order-independent, no global patch leakage |

### Validation Side Effects

- Before: working tree clean at `5e6a9af`, no untracked files. `md5 src/factorflow/api/app.py` = `c80c845bdb6374791bfd5fb29d1d65a3`; `routes/health.py` = `262f7f3773f751c11f99b92cb5c2b665`; composition test = `7427e4c9858c8901f9e08b8f69e43a1d`.
- After: working tree clean at `5e6a9af`, no untracked files. All three `md5` values identical to the pre-review values, and the two production values match those recorded in v2 and v3.
- Unexpected tracked-file changes: none. No validation command modified a tracked file. All mutation experiments were restored from pre-mutation copies held outside the repository; all scratch scripts were written outside the repository.

## Findings

### IR-401 — A repeat `configure_logging()` call would drop request-id stamping

- **Severity**: LOW
- **Status**: OPEN (carried forward from v2/IR-203, v3)
- **Acceptance criteria**: DAC-E1-S6-5 (currently SATISFIED)
- **Tasks**: T020
- **Files**: `src/factorflow/config/settings.py:259-262`; `src/factorflow/api/app.py:71-82`
- **Claim challenged**: That the two `logging.Handler.handle` patches compose safely under any call sequence.
- **Observed evidence**: `settings.py` is byte-identical to its v2 state (`git diff f6cdb89..HEAD -- src/factorflow/config/settings.py` empty). `_install_request_id_patch` stores its own baseline under `_request_id_unstamped_handle` and wraps whatever `Handler.handle` currently is, whereas `configure_logging` rebuilds from the pristine `_unfiltered_handle` at `settings.py:259-262`. A second `configure_logging()` call after the request-id patch is installed would therefore rebuild from the pristine original and discard the stamping wrapper.
- **Expected evidence/behavior**: Symmetric composition, so neither patch can silently disable the other regardless of call order or repetition.
- **Impact**: None in current code — `configure_logging()` is called exactly once, in `_lifespan`, before `_install_request_id_patch()`. The risk is latent: a future story adding a re-configuration path would silently lose request-id stamping with no test failing.
- **Required remediation**: None for this story. Arguably CAP-001-E1-S3's to own, since the asymmetry lives in `settings.py`. If addressed, make `configure_logging` wrap the current `Handler.handle` from its own sentinel the way `_install_request_id_patch` already does.

### IR-402 — TC-COMP-345's "every record" quantifier still ranges over a single record

- **Severity**: LOW (downgraded from MEDIUM at v2/v3 IR-202)
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S6-5 (SATISFIED on other evidence)
- **Tasks**: T005
- **Files**: `tests/unit/test_api_request_id.py`
- **Claim challenged**: That TC-COMP-345 verifies the request id appears in *every* log record emitted while handling a request.
- **Observed evidence**: The file is byte-identical to its v2 state. During a `GET /api/health` request the only `factorflow.api.*` record is the one from `routes.health`, so the `for record in component_records` loop ranges over one element. Under the mutation restricting stamping to `record.name == "factorflow.api.routes.health"`, running this file alone still reports `2 passed`.
- **Expected evidence/behavior**: The mandatory test for DAC-E1-S6-5 should fail when stamping is narrowed to a single logger, since the criterion says "every log record for that request."
- **Impact**: Reduced from v3. The suite as a whole now **does** catch this regression — the composition test fails under the same mutation with `assert None == '566e519d-…'`, because its record comes from `factorflow.api.test.lifespan_redaction`, a different logger stamped in-request. So DAC-E1-S6-5 has genuine regression protection today; what remains is that the mandatory TC-ID's own assertion is not the thing providing it, which is a traceability weakness rather than a coverage hole. Downgraded to LOW accordingly.
- **Required remediation**: None blocking. If tightened later, have `test_api_request_id.py` emit a record from a second `factorflow.api.*` logger during the request and assert both carry the id, so the quantifier is exercised at the mandatory TC-ID rather than incidentally.

### IR-403 — `last_reworked_review` still points at v2 after a v3-driven rework

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A (bookkeeping only)
- **Tasks**: N/A
- **Files**: `docs/.../CAP-001-E1-S6-tasks.md:11`
- **Claim challenged**: That the task file records which review the latest rework responded to.
- **Observed evidence**: `last_reworked_review: CAP-001-E1-S6-implementation-review-v2.md`. Commit `5e6a9af` explicitly reworks v3's IR-301 and IR-302 ("Per v3 review findings IR-301/IR-302"), but the pointer was not advanced to v3. Unlike `0c0a141`, which did advance it v1 → v2, this commit touched only the test file.
- **Expected evidence/behavior**: The pointer should name the review whose findings the most recent rework addressed, so the rework chain is reconstructable from the artifact alone.
- **Impact**: Documentation only. No acceptance criterion, task, or test is affected, and the commit message records the linkage unambiguously. The risk is that a later reader reconstructing the rework history from frontmatter alone under-counts the cycles.
- **Required remediation**: Advance `last_reworked_review` to `CAP-001-E1-S6-implementation-review-v3.md`. Safe to fold into the next commit that touches the story directory; does not warrant a commit of its own.

## Scope and Plan Deviations

- **No production code changed since v2.** `git diff --name-only f6cdb89..HEAD -- src/` is empty across three commits. Every production-code conclusion from v2 and v3 carries forward, and the two mutation experiments re-confirmed the two production behaviors that matter most here.
- **`5e6a9af` is minimal and on-target.** One test file, 32 insertions and 15 deletions. No production file, no unrelated test, no dependency change, no report edit. Precisely the remediation IR-301 specified as its second option ("move the `logger.info(...)` call to somewhere genuinely inside request handling … and add an assertion on `record.request_id`").
- **Prior reports untouched.** v1, v2, and v3 are unmodified; v3 was added by `1dc70cb` and not edited by `5e6a9af`.
- **IR-402 and IR-401 correctly left open.** The commit message claims only that it closes IR-301/IR-302 and improves IR-202 "for this test" — a precise and accurate scope statement, confirmed by the two-scope mutation above. Nothing overclaims.
- **Story `status` is `docs-sync`, task file `status` is `in-progress`.** The same minor inconsistency v2 and v3 accepted; the final `done` transition was noted in `d6be516` as waiting on Phase 6b automation review. Not re-raised as a new finding.
- **Context cache staleness (29h) is recorded as an evidence caveat**, not a finding, since no conclusion in this report derives from the cache.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Doc Sync already ran for this story at `d6be516`. The only changes since are a test file and gate reports, none of which alters documented behavior, so a further Doc Sync pass is expected to be a no-op — confirm and close, or proceed to Phase 6b automation for CAP-001-E1-S6. IR-403's one-line frontmatter correction can be folded in if Doc Sync touches the story directory.
- **Warnings accepted downstream**: IR-401 (LOW — latent asymmetry in `settings.py`; unreachable in current code; arguably CAP-001-E1-S3's), IR-402 (LOW — TC-COMP-345's own quantifier still ranges over one record, though the suite now catches the regression via the composition test), IR-403 (LOW — `last_reworked_review` bookkeeping). None blocks the gate, and none has a claim asserting it is fixed.
