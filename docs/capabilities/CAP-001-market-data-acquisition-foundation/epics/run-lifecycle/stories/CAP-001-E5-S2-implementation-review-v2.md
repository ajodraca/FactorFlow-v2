---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S2-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-20
updated: 2026-09-20
story_id: "CAP-001-E5-S2"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-09-20T21:45:01Z"
reviewed_head: "ca8ed1280d3933896143e7b8be25c96a2fc603b4"
review_base: "1a0556a67a0891de703a0a1eb28654c805f63aef"
reviewed_state_revision: "sha256:1801463abadf7108b536f0ba094cc7996b9c7efebc66184bde2f93fb3ef69aaf"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E5-S2
    artifact_version: 1
    content_revision: sha256:1bf1a92b2ba9d5c36cee2d821740b0e307936d9e55d0838e4d6b944a7b33a333
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Windsurf
  tool_version: unknown
  timestamp: 2026-09-20T21:45:01Z
  source_artifacts:
    - id: CAP-001-E5-S2
      version: "1"
    - id: CAP-001-E5-S2-tasks
      version: "1"
    - id: CAP-001-E5-S2-implementation-review
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E5-S2 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 2 |
| Low findings | 3 |
| Acceptance criteria | 9/9 satisfied |
| Planned tasks | 8/8 verified |
| Required validation | 8/8 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 3 · **total 5**

This is a fresh, independent re-review at HEAD `ca8ed12`, not a delta sign-off.
I rebuilt the change set from the `origin/main` merge base, re-derived every
acceptance criterion from the story against the current code and tests, re-ran
all eight validation commands from the task plan's Validation Plan, and
re-injected five production mutants into a shadow copy of the package rather
than trusting either the coding agent's log or my own v1 record.

The reason for the re-review is discharged with direct evidence rather than
with the reported CI result. Prior finding v1/IR-002 is **RESOLVED**: at
`ca8ed12` both new test files carry a single alphabetised first-party
`factorflow.*` block, `uv run ruff check --no-cache .` exits 0, and — the part
that actually proves the fix rather than assuming it — piping the *pre-fix*
content of each file through this repository's own ruff configuration
(`git show 8214fcc:<file> | uv run ruff check --no-cache --select I
--stdin-filename <file> -`) reproduces the clean-environment `I001` failure on
both files, and ruff's suggested organisation is byte-identical to the
committed fix. The failure PR #59 reported is therefore reproducible locally
today, and the committed change is exactly what removes it. The fix is
test-file-only, two lines, and touches no production behaviour: `git show
ca8ed12` moves one import line in each file and changes nothing else.

Everything else in the story stands on re-verified evidence. `claim_next` is
still the approved `component-design-run-journal.md` section 2.3 statement —
one `UPDATE` in one transaction, `NOT EXISTS` guard, `ORDER BY requested_at`,
`FOR UPDATE SKIP LOCKED`, `RETURNING run_id, history_depth_years`, bound
`runner_id` — and all five re-injected mutants were killed by retained tests.
No production file changed since v1, so no new correctness surface exists. The
five recorded findings are process- and evidence-level (two MEDIUM, three LOW);
none makes an acceptance criterion, a required task, a mandatory test, or a
required validation command incomplete.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S2-tasks.md` |
| Component | `repos/factorflow-v2/FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E5-S2`, synchronised with `origin/usr/alvaro-de-jodra/CAP-001-E5-S2` at the same SHA |
| HEAD | `ca8ed1280d3933896143e7b8be25c96a2fc603b4` |
| Review base | `origin/main` merge base `1a0556a67a0891de703a0a1eb28654c805f63aef` |
| Working tree | clean — `git status --porcelain --untracked-files=all` empty before and after validation |
| Changed files reviewed | 8 |

Commits in the review set (`git log --oneline 1a0556a..HEAD`, 11 commits):
`37a6ac9`, `10504d0`, `05643b3`, `61b9689`, `b53b1c6`, `f073242`, `9ba5ace`,
`8214fcc`, `93427ab` (v1 review report), `6fb08c4` (doc-sync), `ca8ed12` (the
CI import fix). Three commits are new since the v1 review subject; two of them
are documentation-only. No staged, unstaged, or untracked file existed at any
point. No branch, index, or remote operation was performed — this review is
read-only, and no GitHub object was read, commented on, or mutated.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/runs/journal.py` | added | T006; AC-23, DAC-E5-2, DAC-E5-3, DAC-E5-S2-1..6 — unchanged since v1 |
| `tests/integration/test_run_queue.py` | added (import line moved by `ca8ed12`) | T002, T003, T004, T007, T008 |
| `tests/unit/test_run_journal.py` | added (import line moved by `ca8ed12`) | T005, T007, T008 |
| `docs/.../CAP-001-E5-S2.md` | modified | story bookkeeping only: `status: planning → docs-sync`, `updated: 2026-09-18 → 2026-09-20`; no AC, contract, or technical-detail text changed (verified in `git diff 1a0556a..HEAD`) |
| `docs/.../CAP-001-E5-S2-tasks.md` | modified | T001–T008 checkbox state only; every diff hunk is a `- [ ]` → `- [x]` flip with identical task text |
| `docs/.../CAP-001-E5-S2-tdd-evidence.yaml` | added | T008 evidence requirement |
| `docs/.../CAP-001-E5-S2-implementation-review-v1.md` | added | the v1 gate report itself (`93427ab`) |
| `README.md` | modified | doc-sync (`6fb08c4`): the `src/factorflow/runs/` row and a new "Run request and claim" section |

Scope check re-run from scratch at this HEAD:
`git diff --name-only 1a0556a..HEAD -- migrations src/factorflow/runs/states.py
src/factorflow/runs/__init__.py tests/conftest.py pyproject.toml uv.lock`
returns nothing, so every S1-owned asset, the dependency manifest, and the
lockfile are byte-identical to the merge base. The plan's "verify, do not
recreate" constraint holds and no dependency or configuration change
accompanies the story.

The README addition is new to this review set and I checked it as an assertion
rather than accepting it: every claim in `README.md:422-452` matches
`journal.py` (single-statement claim, `NOT EXISTS` guard, `ORDER BY
requested_at LIMIT 1`, `FOR UPDATE SKIP LOCKED`, four fields set together,
frozen `ClaimedRun` with the snapshotted depth, `None` when nothing is
claimable), and its two scope disclaimers are true in this repository —
heartbeat/cancel/finalise do not exist in `src/factorflow/runs/`, and the
wait-and-repoll loop it attributes to CAP-001-E4-S5 is indeed absent. The
`#run-request-and-claim` anchor it links resolves to the section added in the
same commit. No documentation overclaim found.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-23 | SATISFIED | `journal.py:16-20` `_REQUEST_SQL` inserts `'requested'` unconditionally — there is no rejection branch; `journal.py:26-37` `_CLAIM_SQL` `NOT EXISTS` guard + `ORDER BY requested_at` | `test_run_queue.py::test_request_queues_behind_active_run[running\|cancelling]`, `::test_claim_returns_none_while_run_active[running\|cancelling]`, `::test_claims_follow_request_order` | Queue-not-reject, start-only-after-terminal, and request order are proved separately. The FIFO test terminalises each predecessor before the next claim (`test_run_queue.py:147-152`), so "starts only after the active run reaches a terminal state" is executed rather than assumed. |
| DAC-E5-2 | SATISFIED | `journal.py:76-79` — one `cursor.execute(_CLAIM_SQL, ...)` inside one `connection.transaction()` | `test_run_journal.py::test_claim_next_maps_returned_row_in_one_statement` (`len(executed) == 1`, `transactions == 1`); `test_run_queue.py::test_claim_returns_none_while_run_active` | The single-statement property is pinned by counting executes at the psycopg seam, not by reading the source. No read-then-write window exists; nothing precedes the `UPDATE` in the transaction. |
| DAC-E5-3 | SATISFIED | `journal.py:26-37`; backstop `idx_acquisition_run_single_active` (S1 `migrations/0004_runs.sql`, unchanged) | `test_run_queue.py::test_concurrent_claims_fail_on_unique_index` | Two real connections, distinct candidates; the loser provably blocks on the winner's pending index entry (`loser_done.wait(1.0) is False`, line 299) and then raises `psycopg.errors.UniqueViolation`. `_count_active(winner) == 1` and the loser's candidate is still `requested`. |
| DAC-E5-S2-1 | SATISFIED | `ORDER BY requested_at LIMIT 1` at `journal.py:35` | `::test_claims_follow_request_order` | Rows are seeded out of insertion order (`third`, `first`, `second` at lines 141-143), so PK- or insertion-order selection cannot pass. Re-confirmed this review: a `DESC` mutant fails 2 tests. |
| DAC-E5-S2-2 | SATISFIED | `journal.py:80-81` maps no row to `None` and raises nothing | `test_run_journal.py::test_claim_next_returns_none_when_no_row`; `test_run_queue.py::test_claim_returns_none_when_nothing_requested`, `::test_claim_returns_none_while_run_active[running\|cancelling]` | The S2-owned half — a stable `None`, never an error — is satisfied. The "waits at the configured interval" half is allocated by the task plan's Resolved Conflicts to CAP-001-E4-S5 (DAC-E4-S5-6), still unimplemented; carried as IR-004. |
| DAC-E5-S2-3 | SATISFIED | `journal.py:27-29` sets `state`, `started_at`, `claimed_by`, `heartbeat_at` in the one `UPDATE` | `::test_successful_claim_sets_fields_and_returns_snapshot:196-201` | `started_at == heartbeat_at` is the assertion that distinguishes one statement from sequential writes: both take the same transaction `now()`. |
| DAC-E5-S2-4 | SATISFIED | `journal.py:36` `RETURNING run_id, history_depth_years`; mapped at `journal.py:82` | `::test_successful_claim_sets_fields_and_returns_snapshot` (row depth 7 against `owner_setting` depth 2, lines 187-195); `test_run_journal.py::test_claim_uses_snapshot_never_stated_depth` | The conflicting stated depth is the discriminator — a settings re-read would return 2 and fail. `journal.py` imports only `dataclasses`, `uuid`, `psycopg`, so no settings dependency exists to re-read. |
| DAC-E5-S2-5 | SATISFIED | `FOR UPDATE SKIP LOCKED` at `journal.py:35` | `::test_claim_skips_locked_candidate` | A second connection holds `FOR UPDATE` on the oldest candidate; the claimer (`lock_timeout=5000`) returns the newer row while the lock is still held. Re-confirmed: removing `SKIP LOCKED` fails this test rather than hanging. |
| DAC-E5-S2-6 | SATISFIED | `journal.py:22-24` `_ACTIVE_RUN_SQL`; `journal.py:58-65` insert and lookup in one `connection.transaction()` | `::test_request_queues_behind_active_run[running\|cancelling]`, `::test_request_with_no_active_run_reports_no_queue`; `test_run_journal.py::test_request_run_returns_new_id_and_queued_behind_in_one_transaction`, `::test_request_run_reports_none_when_no_active_run` | The active row is compared across all 13 `acquisition_run` columns before and after the request (`_fetch_run`, lines 108/117), so any incidental mutation of the active run fails the test. Both active states covered. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/conftest.py` (`migrated_run_schema_connection`, `postgres_connection_string`), `src/factorflow/runs/__init__.py`, `migrations/0003_coverage.sql`, `migrations/0004_runs.sql` | Re-verified at this HEAD: all named prerequisites exist and `git diff` against the merge base for those paths is empty, so S2 consumed rather than recreated them. The plan's unresolved-S1 blocker is discharged — S1 is merged into `origin/main` at the review base `1a0556a`. |
| T002 | complete | VERIFIED | `tests/integration/test_run_queue.py:99-130` | Both active states parametrised; distinct-row, `requested` state, stored depth, `queued_behind`, full 13-column active-row invariance, and the no-active `None` case all asserted. `# Implements TC-COMP-023, TC-COMP-265` present on both tests. |
| T003 | complete | VERIFIED | `tests/integration/test_run_queue.py:133-201` | Ordered `requested_at` seeds, claim-then-terminalise chain, exact FIFO list equality, empty-queue `None`, `running`/`cancelling` `None`, four-field atomic write with the returned snapshot depth. Traceability comments cover TC-COMP-237, 260, 261, 262, 263. |
| T004 | complete | VERIFIED | `tests/integration/test_run_queue.py:204-313` | Both required scenarios exist on independent connections from `postgres_connection_string`: held row lock skipped (lines 239-268) and the forced two-candidate race producing exactly one `UniqueViolation` with one active row (lines 271-313). The valid-loser `None` path is retained at line 309 — placement noted as IR-003. `# Implements TC-COMP-238` / `TC-COMP-264` present. |
| T005 | complete | VERIFIED | `tests/unit/test_run_journal.py:56-111` | Frozen `ClaimedRun`, one-statement/one-transaction, bound `runner_id`, bound `history_depth_years`, both `queued_behind` shapes, `None` mapping, SQL-contract pins, and the "never calls `read_history_depth`" proof are all implemented and all pass. |
| T006 | complete | VERIFIED | `src/factorflow/runs/journal.py:40-82` | Frozen dataclass; both signatures exactly as planned (`request_run(connection, history_depth_years) -> tuple[UUID, UUID \| None]`, `claim_next(connection, runner_id) -> ClaimedRun \| None`); claim SQL identical to design section 2.3; bound parameters throughout with no string interpolation of values; `None` on no row; no settings read. Scope correctly stops short of heartbeat/cancel/finalise. Unchanged by `ca8ed12`. |
| T007 | complete | VERIFIED | Commit `9ba5ace`; no file diff, as expected for a run-only task | Reproduced independently at this HEAD: `uv run pytest tests/unit/test_run_journal.py tests/integration/test_run_queue.py` → 16 passed; `uv run pytest` → 414 passed. The `None` signal is a plain return value with no runner-side coupling. Evidence-field defect carried as IR-002. |
| T008 | complete | VERIFIED | `CAP-001-E5-S2-tdd-evidence.yaml:150-197`; commit `9ba5ace` | Re-verified by fresh mutation injection this review (five mutants, all killed — table below), not by re-reading v1. The "no strengthening required" claim holds: each mutant already had a killing test. `git status` empty afterwards. Evidence-field defect carried as IR-002. |

No unchecked-but-implemented task and no checked-but-unimplemented task exists.
The post-review fix commit `ca8ed12` belongs to no planned task; it is a
correction of a defect this gate raised, and its lack of an evidence record is
IR-005.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_request_queues_behind_active_run` / TC-COMP-023, TC-COMP-265 | ADEQUATE | Real PostgreSQL row; asserts the new id differs from the active id, the new row is `requested` at the supplied depth, `queued_behind` equals the active id, and the entire 13-column active row is unchanged. The full-row snapshot is what makes it regression-sensitive — a stray `UPDATE` on the active row fails it (re-confirmed by the `_ACTIVE_RUN_SQL` mutant). | none |
| `test_request_with_no_active_run_reports_no_queue` / TC-COMP-023, TC-COMP-265 | ADEQUATE | Negative path: `queued_behind is None`, row persisted as `requested` at depth 3. | none |
| `test_claims_follow_request_order` / TC-COMP-237, TC-COMP-260 | ADEQUATE | Seeded out of insertion order so only `ORDER BY requested_at` passes; asserts exact list equality `[first, second, third]`. Killed the `DESC` mutant this review. | none |
| `test_claim_returns_none_when_nothing_requested` / TC-COMP-237, TC-COMP-261 | ADEQUATE | Empty-queue boundary; asserts `None`, not an exception. Killed the no-row-mapping mutant this review. | none |
| `test_claim_returns_none_while_run_active` / TC-COMP-237, TC-COMP-261 | ADEQUATE | Both active states; also asserts the queued row stays `requested`, so a claim that fired and rolled back could not pass silently. Killed the dropped-`cancelling` guard mutant this review. | none |
| `test_successful_claim_sets_fields_and_returns_snapshot` / TC-COMP-262, TC-COMP-263 | ADEQUATE | A stated depth (2) deliberately conflicting with the stored depth (7) makes the snapshot assertion discriminating rather than tautological; asserts all four claim fields plus `started_at == heartbeat_at`. | none |
| `test_claim_skips_locked_candidate` / TC-COMP-264 | ADEQUATE | Two independent connections; the claim must *complete* while the oldest candidate's lock is held, with `lock_timeout=5000` turning a blocking regression into a bounded failure instead of a hang. Deterministic: the lock is taken before the claim is issued. Killed the plain-`FOR UPDATE` mutant this review. | Bundles the post-release `None` assertion — IR-003. |
| `test_concurrent_claims_fail_on_unique_index` / TC-COMP-238 | ADEQUATE | Genuine two-connection race on a deterministic schedule: the winner's claim is held uncommitted, the loser passes the `NOT EXISTS` guard against the committed snapshot, skips the locked candidate, and blocks on the pending unique-index entry. `wait(1.0) is False` proves it blocked and errs toward passing under load rather than flaking; `UniqueViolation` count, one active row, and the loser's candidate still `requested` are all asserted. | Bundles the valid-loser `None` path — IR-003. |
| `test_claimed_run_is_frozen` | ADEQUATE | Asserts `dataclasses.FrozenInstanceError` on mutation — the immutability contract itself, not the decorator's presence. | none |
| `test_claim_next_maps_returned_row_in_one_statement` | ADEQUATE | Recording fake counts exactly one execute and one transaction and checks the bound parameter dict. The SQL substring pins are contract assertions the task plan explicitly requested; the real semantics are carried by the PostgreSQL tests, so this does not substitute for behaviour coverage. | none |
| `test_claim_next_returns_none_when_no_row` | ADEQUATE | Empty fake result maps to `None`. Killed the zero-UUID mutant this review. | none |
| `test_request_run_returns_new_id_and_queued_behind_in_one_transaction` | ADEQUATE | Asserts the returned tuple, one transaction, and the bound `(5,)` insert parameter. | none |
| `test_request_run_reports_none_when_no_active_run` | ADEQUATE | Fake returns no active row; result is `(new_id, None)`. | none |
| `test_claim_uses_snapshot_never_stated_depth` | ADEQUATE | The monkeypatch alone would not catch an indirect read, but the accompanying `"read_history_depth" not in vars(journal)` check makes the claim real, and the integration test proves the behaviour against a real conflicting setting. | Monkeypatch half is decorative; harmless. |

The import reordering in `ca8ed12` is semantically inert for test behaviour: in
`test_run_journal.py` both `from factorflow.runs import journal` and `from
factorflow.runs.journal import ...` are retained (the module object is still
needed by the `vars(journal)` assertion at line 111), and in
`test_run_queue.py` the same four symbols are still imported. Both files
re-execute identically — 6 and 10 tests pass respectively — and neither lost a
symbol or a test.

Fixtures and mocks do not bypass the unit under test: the unit-level fakes sit
strictly at the psycopg cursor/connection seam and the production functions run
unmodified, and every behavioural claim also has a real-PostgreSQL test.
Isolation is sound — `postgres_connection_string` provisions a fresh database
per test inside one session container, and every connection the contention
tests open is closed in a `finally`. No test depends on wall-clock time for its
outcome, on network access beyond the local container, or on execution order.

## Independent Validation

All commands run in `repos/factorflow-v2/FactorFlow-v2` at HEAD `ca8ed12` with a
clean tree. Docker was available, so the postgres-marked tests genuinely
executed and no `-m 'not postgres'` substitution was needed for the full-suite
requirement.

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Resolved 44 packages; checked 41 packages. |
| `uv run pytest tests/unit/test_run_journal.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 6 passed in 0.01s. |
| `uv run pytest -m postgres tests/integration/test_run_queue.py` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 10 passed in 5.28s against a PostgreSQL 16 testcontainer. |
| `uv run pytest -m 'not postgres'` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 327 passed, 87 deselected, 2 warnings in 13.01s. Run as the plan's named fallback command, not as a substitute for the full suite. |
| `uv run pytest` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 414 passed, 2 warnings in 22.58s. The two warnings are pre-existing third-party deprecations, unrelated to this change set. |
| `uv run ruff check .` (run as `--no-cache`) | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | ruff 0.16.6, "All checks passed!". `--no-cache` was used deliberately so the result cannot be a replayed cache entry — see the note below. |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 116 files already formatted. |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 34 source files (strict mode). |
| `uv build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `factorflow-0.1.0.tar.gz` and `factorflow-0.1.0-py3-none-any.whl` built into the git-ignored `dist/`. |

Frontend and end-to-end commands from `docs/constitution/tech-stack.md`
(`npm ci`, `npm run lint`, `npm run format`, `npm run test`, `npm run build`,
`npx tsc --noEmit`, `npm run test:e2e`) were **NOT RUN**, with reason: the
change set contains no frontend source, asset, or configuration file — the only
non-Python file it touches is `README.md` — and the task plan's Validation Plan
lists exactly the nine Python commands above. No required command for this
story was skipped or narrowed.

### Import-Order Regression Evidence (v1/IR-002)

The fix was verified in both directions rather than only forward:

| Check | Command | Result |
|-------|---------|--------|
| Current content is clean in a cache-free run | `uv run ruff check --no-cache .` | exit 0, "All checks passed!" |
| Pre-fix unit test content still fails today | `git show 8214fcc:tests/unit/test_run_journal.py \| uv run ruff check --no-cache --select I --stdin-filename tests/unit/test_run_journal.py -` | exit 1, `I001` at line 8 |
| Pre-fix integration test content still fails today | `git show 8214fcc:tests/integration/test_run_queue.py \| uv run ruff check --no-cache --select I --stdin-filename tests/integration/test_run_queue.py -` | exit 1, `I001` at line 9 |
| Fix matches the tool's own organisation | ruff's `help: Organize imports` diff on both pre-fix files | identical to the two lines committed in `ca8ed12` |

Note on the v1 evidence gap: v1 recorded `uv run ruff check .` as passing at
`8214fcc`, yet the same configuration and a current ruff flag that content as
`I001` when the cache is bypassed. The most likely cause is a replayed
`.ruff_cache` entry rather than a configuration difference (`[tool.ruff]` in
`pyproject.toml` is unchanged since the merge base and sets no isort
overrides). I therefore ran lint with `--no-cache` for this gate. This is an
observation about review-evidence reliability, folded into the v1/IR-002
disposition rather than raised as a new finding against the implementation.

### Independent Mutation Re-verification

The coding agent's mutation log and my own v1 table were both treated as
untrusted. Five mutants were re-injected into a copy of the package at
`/tmp/mutcheck2/factorflow` placed ahead of the editable install on
`PYTHONPATH`; I confirmed the mutant module was the one imported
(`python -c "import factorflow.runs.journal as j; print(j.__file__)"` →
`/tmp/mutcheck2/...`) before trusting any failure. The reviewed repository was
never modified, and the temporary copy was deleted afterwards.

| Mutant | Killed by | Result |
|--------|-----------|--------|
| `ORDER BY requested_at` → `ORDER BY requested_at DESC` | `test_claims_follow_request_order`, `test_concurrent_claims_fail_on_unique_index` | KILLED (2 failed, 8 passed) |
| `FOR UPDATE SKIP LOCKED` → `FOR UPDATE` | `test_claim_skips_locked_candidate` | KILLED (1 failed, 9 passed) |
| Claim guard `state IN ('running','cancelling')` → `('running')` | `test_claim_returns_none_while_run_active[cancelling]` | KILLED (1 failed, 9 passed) |
| No-row mapping `None` → zero-UUID `ClaimedRun` | `test_claim_next_returns_none_when_no_row` plus 6 integration `None` paths | KILLED (7 failed, 9 passed) |
| `_ACTIVE_RUN_SQL` `('running','cancelling')` → `('running')` | `test_request_queues_behind_active_run[cancelling]` | KILLED (1 failed, 9 passed) |

Every mutant was killed by a retained test, so the suite's regression
sensitivity on the FIFO order, the skip-locked contract, both active-state
predicates, and the no-row mapping is corroborated at this HEAD
(`TEST-TDD-005`, `TEST-TDD-006`).

### Validation Side Effects

- Before: `usr/alvaro-de-jodra/CAP-001-E5-S2` @ `ca8ed1280d3933896143e7b8be25c96a2fc603b4`, `git status --porcelain --untracked-files=all` empty.
- After: `usr/alvaro-de-jodra/CAP-001-E5-S2` @ `ca8ed1280d3933896143e7b8be25c96a2fc603b4`, `git status --porcelain --untracked-files=all` empty.
- Unexpected tracked-file changes: none. `uv build` wrote `dist/` and `build/` and pytest wrote `__pycache__`, all git-ignored. The mutation runs touched only `/tmp/mutcheck2`, outside the repository. Validation created or modified no review-relevant file, so the review set is unchanged after validation.

## Findings

| Finding | Severity | Title |
|---------|----------|-------|
| IR-001 | MEDIUM | Per-task independent review and spec-drift subagents were not dispatched; self-review was substituted |
| IR-002 | MEDIUM | Two TDD-evidence entries remain malformed against TEST-TDD-008 |
| IR-003 | LOW | Two contention tests each bundle a second behavior |
| IR-004 | LOW | DAC-E5-S2-2's wait half is unprovable in this repository until CAP-001-E4-S5 lands |
| IR-005 | LOW | The post-review fix commit is recorded in no TDD-evidence or rework entry |

### IR-001 — Per-task independent review and spec-drift subagents were not dispatched; self-review was substituted

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v1/IR-001, unchanged)
- **Acceptance criteria**: N/A (process evidence)
- **Tasks**: T001–T008 (the plan's "Per-Task Commit Gate")
- **Files**: `docs/.../CAP-001-E5-S2-tdd-evidence.yaml:2-9` (`notes`), and the `staged_diff_review` / `spec_drift_verification` field of every cycle entry
- **Claim challenged**: That each task's `staged_diff_review: PASS` and `spec_drift_verification: drift_detected: false` verdict satisfies the plan's requirement to dispatch an independent code-review subagent and an independent spec-drift verify subagent before each commit.
- **Observed evidence**: The evidence file still discloses at lines 2-9 that no subagent was dispatched — the runtime "provides no subagent-dispatch mechanism, so the independent subagent the task plan names was substituted with a checklist review" performed by the coding agent itself. Every per-task verdict is self-issued by the author of the diff. Nothing in the three commits added since v1 changes this.
- **Expected evidence/behavior**: `CAP-001-E5-S2-tasks.md:128-129` requires an independently dispatched review and spec-drift verification per task, recorded before the commit.
- **Impact**: The intended in-loop check degenerated to a one-actor check, leaving this gate as the first independent inspection. Bounded concretely: across two independent reviews the only defect the in-loop check missed was the import grouping now fixed — which is precisely the class of defect a second reviewer or a clean CI run catches. `CONST-REV` does not require a separate actor under `owner-allowed`, so this is MEDIUM, not HIGH.
- **Required remediation**: No rework of this story's code. For subsequent stories, either run the coding agent in a runtime providing subagent dispatch, or amend the task-plan template's per-task commit gate so the labelled self-review fallback is the documented permitted path. Record the choice as a decision record so future evidence files need not re-justify it.

### IR-002 — Two TDD-evidence entries remain malformed against TEST-TDD-008

- **Severity**: MEDIUM
- **Status**: OPEN (carried from v1/IR-003; not corrected by any commit since v1)
- **Acceptance criteria**: N/A (process evidence)
- **Tasks**: T007, T008
- **Files**: `docs/.../CAP-001-E5-S2-tdd-evidence.yaml:149`, `:150-197`
- **Claim challenged**: That the per-cycle evidence entries satisfy the inter-cycle evidence gate the task plan invokes.
- **Observed evidence**: Re-read at this HEAD, the file is byte-identical to the v1 subject in these respects: the `t007-integration-run` entry still records `commit_hash: "none — run-only task produced no file diff"`, which is prose rather than a hash, and the `t008-mutation-strengthening` entry still omits `tests_executed` despite recording seven mutation runs. The v1 remediation was not applied. Substantively the work is traceable — both results ride in commit `9ba5ace`, and I reproduced the 414-test run and the mutation kills independently — so this is field hygiene, not missing evidence.
- **Expected evidence/behavior**: `docs/constitutions/testing.constitution.md` TEST-TDD-008: "A new TDD cycle MUST NOT begin until the preceding cycle's tdd-evidence entry contains `tests_executed: true` and a non-empty `commit_hash`."
- **Impact**: An automated evidence audit would either reject the file or silently accept a non-hash string as a commit reference. The constitution rates TEST-TDD-008 High, but its literal gate never fired here — `t007`'s `commit_hash` is non-empty (merely not a hash), and no cycle began after `t008`, which is the entry missing `tests_executed`. The exposure is to machine auditability, not to the truth of the record, which is why this stays MEDIUM.
- **Required remediation**: Set `commit_hash: 9ba5ace` on `t007-integration-run`, moving the "no file diff" explanation into its existing `note` field, and add `tests_executed: true` to `t008-mutation-strengthening`.

### IR-003 — Two contention tests each bundle a second behavior

- **Severity**: LOW
- **Status**: OPEN (carried from v1/IR-004, unchanged)
- **Acceptance criteria**: DAC-E5-3, DAC-E5-S2-5
- **Tasks**: T004
- **Files**: `tests/integration/test_run_queue.py:261-263`, `tests/integration/test_run_queue.py:307-309`
- **Claim challenged**: That T004's instruction to "separately retain coverage for the valid loser path that returns `None` after observing the winner" was implemented as separate coverage.
- **Observed evidence**: `test_claim_skips_locked_candidate` asserts the skip behaviour and then, after `locker.rollback()`, also asserts the post-release `None` and the older row's state (lines 261-263). `test_concurrent_claims_fail_on_unique_index` asserts the forced race and then also the post-commit valid-loser `None` (line 309). Both behaviours are covered; both live inside the race tests rather than in their own test functions. (`test_claims_follow_request_order` similarly ends with a terminal `None` assertion at line 155.)
- **Expected evidence/behavior**: `docs/constitutions/testing.constitution.md` TEST-QUAL-001: each test validates one behavior or failure mode. T004's "separately retain" points the same way, though the plan's Resolved Conflicts uses "separately" to mean separate *schedules* rather than one ambiguous assertion — which the implementation does honour, hence LOW.
- **Impact**: A failure in a trailing assertion is attributed to the race test, slowing triage slightly; the concerns cannot be run or skipped independently.
- **Required remediation**: Optional. If addressed, extract the post-release and post-commit `None` assertions into their own named tests reusing the existing helpers, leaving each race test with one behavior.

### IR-004 — DAC-E5-S2-2's wait half is unprovable in this repository until CAP-001-E4-S5 lands

- **Severity**: LOW
- **Status**: OPEN (carried from v1/IR-005, unchanged)
- **Acceptance criteria**: DAC-E5-S2-2
- **Tasks**: T003, T005, T006
- **Files**: `docs/.../CAP-001-E5-S2.md:71`; `docs/.../CAP-001-E5-S2-tasks.md:173`; `docs/.../CAP-001-E5-S2-tdd-evidence.yaml:198-207`; `README.md:445-447`
- **Claim challenged**: That DAC-E5-S2-2 ("...receives no row **and waits at the configured interval** rather than erroring") is fully demonstrated by this story.
- **Observed evidence**: S2 proves the "no row / does not error" half in five tests. The "waits at the configured interval" half is allocated by the plan's Resolved Conflicts to CAP-001-E4-S5 / DAC-E4-S5-6, whose implementation still does not exist: `tests/integration/test_runner_credential.py` and `tests/unit/test_ingestion_main.py` are both absent at this HEAD (`ls` → "No such file or directory"). The doc-sync README correctly attributes the wait loop to that story rather than claiming it here.
- **Expected evidence/behavior**: The cross-story allocation is legitimate and documented; TC-COMP-261 remains owned across the pair rather than narrowed. Recorded so the capability-level coverage claim is not read as complete on S2 alone.
- **Impact**: None on this story. The risk is that TC-COMP-261 is later reported as fully covered while only half the criterion is executable today.
- **Required remediation**: None for S2. Carry forward: CAP-001-E4-S5's review must confirm its configured-wait loop consumes S2's `None` signal, and capability-level coverage reporting should not record DAC-E5-S2-2 as end-to-end proven until that story lands.

### IR-005 — The post-review fix commit is recorded in no TDD-evidence or rework entry

- **Severity**: LOW
- **Status**: OPEN (new in v2)
- **Acceptance criteria**: N/A (process evidence)
- **Tasks**: T002, T005, T008 (the files the commit edits)
- **Files**: commit `ca8ed12`; `docs/.../CAP-001-E5-S2-tdd-evidence.yaml` (no entry for it); `docs/.../CAP-001-E5-S2-tasks.md` (no rework note)
- **Claim challenged**: That the change set's evidence record describes every change made to the S2-owned test files.
- **Observed evidence**: `ca8ed12` modifies `tests/integration/test_run_queue.py` and `tests/unit/test_run_journal.py` after the `t008-mutation-strengthening` cycle closed, yet the evidence file ends at `t008` plus `final_validation` and records nothing about it. The `final_validation` block therefore describes a repository state one commit old — notably `lint: "uv run ruff check .: all checks passed"`, which is the very claim the clean CI environment contradicted. The commit message itself is accurate and explains the cause, and the change is behaviour-neutral, which is why this is LOW rather than MEDIUM.
- **Expected evidence/behavior**: The task plan's per-task commit gate and `TEST-TDD-008` establish that changes to the S2-owned test files are accompanied by recorded execution and review evidence; a reviewer reading only the evidence file would conclude the tests are as they stood at `8214fcc`.
- **Impact**: The evidence file's `final_validation` lint line is now stale and, read literally, asserts a green lint result for content that a clean environment rejects. No test or behaviour is affected.
- **Required remediation**: Append a short post-review-fix entry to `CAP-001-E5-S2-tdd-evidence.yaml` naming commit `ca8ed12`, the reason (clean-environment Ruff `I001`), the files touched, and the re-run validation, or refresh the `final_validation` block so it describes HEAD. Fold this into the same edit as IR-002.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 — Per-task review/spec-drift subagents not dispatched (MEDIUM) | STILL OPEN → re-raised as v2/IR-001 | `CAP-001-E5-S2-tdd-evidence.yaml:2-9` unchanged at `ca8ed12`; no commit since v1 alters the per-task verdict fields. Correctly left open — the v1 remediation was explicitly forward-looking and required no rework here. |
| v1/IR-002 — Both new test files violate SA-FMT-001 import grouping (MEDIUM) | **RESOLVED** | Commit `ca8ed12` moves `from factorflow.runs.journal import ...` into the single first-party block in both files (`test_run_queue.py:17-20`, `test_run_journal.py:16-17`), leaving all `factorflow.*` imports grouped and alphabetised, consistent with every other test file in the repository. Verified three ways: `uv run ruff check --no-cache .` exits 0 at HEAD; the pre-fix content of both files still raises `I001` under the same configuration when piped through `--stdin-filename`; and ruff's own "Organize imports" suggestion on the pre-fix content is identical to the committed lines. Production code untouched (`git show ca8ed12` = 2 insertions, 2 deletions, test files only), and both files still pass (6 and 10 tests). |
| v1/IR-003 — Two TDD-evidence entries malformed against TEST-TDD-008 (MEDIUM) | STILL OPEN → re-raised as v2/IR-002 | `CAP-001-E5-S2-tdd-evidence.yaml:149` still reads `commit_hash: "none — run-only task produced no file diff"`; the `t008` entry at `:150-197` still has no `tests_executed` key. No commit since v1 touches this file. |
| v1/IR-004 — Two contention tests each bundle a second behavior (LOW) | STILL OPEN → re-raised as v2/IR-003 | `tests/integration/test_run_queue.py:261-263` and `:307-309` are unchanged apart from the import-line shift; the trailing assertions remain inside the race tests. |
| v1/IR-005 — DAC-E5-S2-2's wait half unprovable until CAP-001-E4-S5 lands (LOW) | STILL OPEN → re-raised as v2/IR-004 | `tests/integration/test_runner_credential.py` and `tests/unit/test_ingestion_main.py` are still absent at `ca8ed12`; the cross-story allocation is unchanged. Not resolvable within S2. |

No finding was marked resolved without current repository evidence; the one
`RESOLVED` disposition rests on a re-executed lint run and a reproduction of
the original failure from the pre-fix blob.

## Scope and Plan Deviations

- **Justified deviation**: The task plan's per-task commit gate names an independent subagent; a disclosed in-session self-review was substituted (IR-001). `CONST-REV` does not require a second actor under `owner-allowed`.
- **Justified deviation**: T007 produced no file diff and rode in `9ba5ace` with T008. Legitimate for a run-only task; the evidence field records prose instead of the hash (IR-002).
- **Justified out-of-plan commit**: `ca8ed12` implements the remediation this gate required for v1/IR-002. It is minimal (two moved import lines in test files only), behaviour-neutral, and correctly scoped; its only defect is the missing evidence entry (IR-005).
- **Review-set additions since v1**: `93427ab` adds the v1 report and `6fb08c4` is the doc-sync commit. Both are documentation-only; the README content was checked against the code and found accurate, and the story diff is limited to `status`/`updated`. Doc-sync ran before this re-review because the v1 gate had passed — the pipeline order was not violated; the CI failure reopened the gate afterwards.
- **Bookkeeping**: All eight task checkboxes are checked and all eight are independently verified. The tasks file frontmatter remains `status: draft`, matching the established pattern in this epic (`CAP-001-E5-S1-tasks.md` is also `draft` after completion); not raised as a finding. The story is `status: docs-sync`, which now precedes a second gate pass — worth the owner's attention only as sequencing, not as a defect.
- **Scope leakage**: None. `git diff --name-only` against the merge base for `migrations/`, `src/factorflow/runs/states.py`, `src/factorflow/runs/__init__.py`, `tests/conftest.py`, `pyproject.toml`, and `uv.lock` is empty. The only production file added is the one the plan names.
- **Security review**: All SQL uses bound parameters (`%s`, `%(runner_id)s`) with no string interpolation of values (`SEC-INJ-001` satisfied). The one dynamic SQL fragment is in test-only helper `_fetch_run`, built from the module-level `_RUN_COLUMN_NAMES` literal tuple, never from input. No secrets, logging, or externally reachable surface is introduced. `assert inserted is not None` at `journal.py:62` is type narrowing for an `INSERT ... RETURNING` that cannot yield no row and follows existing repository precedent; not raised as a finding.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Doc-sync for CAP-001-E5-S2 already landed at `6fb08c4` and its content is accurate against HEAD, so the remaining action is to record this v2 gate result and close the story. IR-002 and IR-005 are a single cheap edit to `CAP-001-E5-S2-tdd-evidence.yaml` and may be folded into that pass; neither blocks the gate. IR-004 must be carried into the CAP-001-E4-S5 review.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002 (MEDIUM), IR-003 (LOW), IR-004 (LOW), IR-005 (LOW)
