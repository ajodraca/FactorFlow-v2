---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S7-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
story_id: "CAP-001-E3-S7"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S7.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S7-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-10T19:50:59Z"
reviewed_head: "4da768dfd283b8b538d2918de0036bf35a1caaad"
review_base: "a4bcc1f6ae6438493b96afb5d7a0eac2c84e1169"
reviewed_state_revision: "sha256:b1456c109e25cf6f8818ec46ffd0eaa9a1ae53d6c06d1350f76c9420eb72dfb5"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E3-S7
    artifact_version: 3
    content_revision: sha256:dbf60d1ad3778e175857c6d7a597dd146d5c6012c8051dfc09cd62f8160a0e9c
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5-medium
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-10T19:50:59Z
  source_artifacts:
    - id: CAP-001-E3-S7
      version: "3 (sha256:dbf60d1ad3778e175857c6d7a597dd146d5c6012c8051dfc09cd62f8160a0e9c)"
    - id: CAP-001-E3-S7-tasks
      version: "1 (sha256:9611ab000ffa17c71888e6f41edd1045b258d03ab751e1e59834c5cab6a0124c)"
    - id: CAP-001-E3-S7-tdd-evidence
      version: "1"
    - id: CAP-001-component-tests
      version: "2"
    - id: CAP-001-integration-tests
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E3-S7 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 16/16 satisfied |
| Planned tasks | 19/19 verified |
| Required validation | 16/16 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | LOW | The trailer block of commit `4da768d` is malformed (stray `EOF`/`)` lines), so git sees none of its trailers |
| IR-002 | LOW | TC-COMP-381's scope test asserts literals against a constant in the same file and cannot fail |

All 16 acceptance criteria are satisfied: AC-13 has two clauses, and DAC-E3-S7-1 to S7-14 make up the rest. Every acceptance criterion has production evidence and a test that would fail on a plausible regression. The reviewer re-ran the whole required validation set, with these results:

- the full Python suite with PostgreSQL: 925 passed;
- the `not postgres` subset: 654 passed;
- ruff, the format check and mypy: clean;
- both builds and the offline wheel listing: clean;
- `npm run test:e2e`: 9 passed;
- TC-INT-027, run live against the E2E stack: the ingestion process stayed up, the stub logged 10 GET requests for the run, and the run ended `partial`.

The reviewer also checked the evidence:

- All four recorded `diff_sha256` values were recomputed from git and match.
- `cc0b410` is a verbatim cherry-pick of `b9c664c`, checked with `git range-diff`.
- Two extra mutations, not in the coder's list and run in a scratch copy, each failed the expected tests.

The two findings are LOW. One is about how evidence is recorded: the trailer block of commit `4da768d` is malformed. The other is about test strength: one scope test is a tautology. Neither leaves any acceptance criterion, task or required check incomplete.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S7.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S7-tasks.md` |
| Component | `FactorFlow-v2` (specs and code in the same repo) |
| Branch | `usr/alvaro-de-jodra/CAP-001-E3-S6-S7` |
| HEAD | `4da768dfd283b8b538d2918de0036bf35a1caaad` |
| Review base | `--base-ref a4bcc1f` → `a4bcc1f6ae6438493b96afb5d7a0eac2c84e1169` (resolved by `pipeline-state.py review-base`; ancestor of HEAD confirmed with `git merge-base --is-ancestor`) |
| Working tree | Clean: no staged, unstaged or untracked files before or after validation |
| Changed files reviewed | 10 (commits `cc0b410`, `4da768d`) |

Branch history checked: `a4bcc1f` merges `origin/main` at `dce91bb`, which carries EXP-20261010-2, into the reviewed CAP-001-E3-S6 work at `0f62e3e`. EXP-20261010-2 opens the ingestion connection with `autocommit=True`. `git diff a4bcc1f 0f62e3e --stat` shows the merge brought only the EXP-20261010-2 files in from main. `git range-diff 0f62e3e..b9c664c a4bcc1f..cc0b410` reports `b9c664c = cc0b410`, so the cherry-pick is identical.

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/ingestion_main.py` | modified | DAC-E3-S7-2 to S7-4; T013 |
| `tests/e2e/support/ingestion_e2e_main.py` | added | AC-13, DAC-E3-S7-5 to S7-10; T014 |
| `scripts/run-e2e-server.sh` | modified | AC-13, DAC-E3-S7-11, S7-14; T015 |
| `tests/unit/test_ingestion_main.py` | modified | TC-COMP-367 to 369; T002 |
| `tests/unit/test_ingestion_e2e_main.py` | added | TC-COMP-370 to 379, 382; T003 to T008, T011, T012, T017 strengthening |
| `tests/unit/test_run_e2e_server_script.py` | added | TC-COMP-380; T009 |
| `tests/unit/test_no_committed_secrets.py` | modified | TC-COMP-381; T010 |
| `.../stories/CAP-001-E3-S7-tdd-evidence.yaml` | added | T001, T016 to T019 |
| `.../stories/CAP-001-E3-S7-tasks.md` | modified | Checkbox bookkeeping only (T001 to T019 checked) |
| `.../stories/CAP-001-E3-S7.md` | modified | `status: planning` → `in-review` only; content revision unchanged and equal to the approval's `reviewed_revision` |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 (E2E key) | SATISFIED | `scripts/run-e2e-server.sh` `E2E_PROVIDER_KEY=...` line, fallback-free export, `ACQUISITION_ENV` entry; `ingestion_e2e_main.py` `_require_test_credential`, `read_test_credential` | `test_run_e2e_server_script.py`, `test_no_committed_secrets.py::test_no_tracked_file_contains_a_fixed_e2e_provider_key`, TC-COMP-376/377 | Live run: health shows `credential_present: true`; `grep -c TEST-ONLY-` on both E2E logs = 0 |
| AC-13 (release artifact) | SATISFIED | Only `src/factorflow/ingestion_main.py` changed under `src/`; it gains no `http` path | `test_release_excludes_test_paths.py` (unchanged), TC-COMP-382 tests | Offline wheel: 0 `tests/` or `ingestion_e2e_main` entries; sdist: none either; release launch with `http://127.0.0.1:8126` exits 1 `scheme must be https` |
| DAC-E3-S7-1 | SATISFIED | Procedural (TC-COMP-366), recorded in tdd-evidence cycle `in-force-check` | Reviewer re-ran the revision on harness `origin/main` `023255b` (the recorded commit, also current `origin/main`) | `sha256:82059ecd...` printed; `version: 1.2`, `approved_by` present, `reviewed_revision` equal to the pin |
| DAC-E3-S7-2 | SATISFIED | `ingestion_main.main(*, settings_factory=Settings, credential_reader=read_provider_credential)`; `__main__` unchanged | `test_main_parameters_are_keyword_only_with_release_defaults` | AST check on the `__main__` call |
| DAC-E3-S7-3 | SATISFIED | `settings = settings_factory()` inside the unchanged `except ConfigurationError` → stderr, `return 1` | `test_main_returns_1_when_settings_factory_raises` | Asserts stderr names variable, not value or key; caplog clean |
| DAC-E3-S7-4 | SATISFIED | `key = credential_reader()` before `client_factory.get_or_rebuild`, no `try` | `test_credential_reader_raising_at_first_claim_propagates` | Real `run_polling_loop`; reviewer mutation (build client before the reader) fails this test |
| DAC-E3-S7-5 | SATISFIED | `_LoopbackHttpMassiveSettings._validate_base_url` (http only when `urlsplit(...).hostname in _LOOPBACK_HOSTS`, else `super()`) | TC-COMP-370 (5 values), TC-COMP-371 (25 values incl. S6 rows), T012 rows | Reviewer probe of 20 further values (backslashes, `http:host`, fullwidth digits, `127.0.0.1.`, zone ids, etc.) accepted only loopback case and port variants |
| DAC-E3-S7-6 | SATISFIED | Accepted set fixed by DAC-E3-S7-5 | `test_accepted_values_parse_to_the_same_host` | Bracket-stripped comparison per DEC-0046 (provisional, owner-unreviewed; see Deviations) |
| DAC-E3-S7-7 | SATISFIED | `socket.getaddrinfo("localhost", ...)`; refuses on `OSError`, empty, or any non-loopback | TC-COMP-373, TC-COMP-374, `test_unresolvable_localhost_refuses` | Resolved once at start, as designed (story Open Question, FINDING-11) |
| DAC-E3-S7-8 | SATISFIED | `api_key` validator with `fullmatch` | TC-COMP-375, TC-COMP-376 (five generated keys) | Reviewer mutation (start-time validator removed) fails all five TC-COMP-376 rows; manual run with a non-test key: exit 1, key not echoed |
| DAC-E3-S7-9 | SATISFIED | `read_test_credential` passed as `credential_reader` | TC-COMP-377, TC-COMP-378, `test_read_test_credential_refuses_a_non_test_key` | Client never built with the rotated invalid key; a second test key rebuilds |
| DAC-E3-S7-10 | SATISFIED | Entry point imports only stdlib, pydantic and the two factorflow modules; ends with `sys.exit(main(settings_factory=load_settings, credential_reader=read_test_credential))` | TC-COMP-379 (a) and (b) | — |
| DAC-E3-S7-11 | SATISFIED | Script diff: lines 107–113, 122–124, 132, 140 | `test_script_generates_a_per_run_key_and_launches_the_test_entry_point` | API launch and base URL line unchanged |
| DAC-E3-S7-12 | SATISFIED | `e2e-test-key` removed from the script | TC-COMP-381 | `git grep -n "e2e-test-key" -- scripts tests src` printed nothing (exit 1) |
| DAC-E3-S7-13 | SATISFIED | No `src` import; Dockerfile has no COPY of it | `test_release_excludes_test_paths.py` (unchanged, green), TC-COMP-382 (a)/(b) | Wheel listing re-run by reviewer |
| DAC-E3-S7-14 | SATISFIED | Script launches `tests/e2e/support/ingestion_e2e_main.py` | TC-INT-027, run live by the reviewer | Ingestion pids 24439/24445 alive after health; run `b66d03bf-…` reached `partial` in 0.17 s; 10 `[massive-stub] "GET …" 200` lines; `npm run test:e2e` 9 passed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | tdd-evidence `in-force-check` | Values independently reproduced on harness `023255b` |
| T002 | complete | VERIFIED | `tests/unit/test_ingestion_main.py` TC-COMP-367/368/369 | Existing tests unchanged |
| T003 | complete | VERIFIED | `tests/unit/test_ingestion_e2e_main.py` helpers, TC-COMP-370/371 | Resolver fake fails on any non-`localhost` lookup, proving IP literals are never resolved |
| T004 | complete | VERIFIED | `test_accepted_values_parse_to_the_same_host` | Green on arrival (recorded deviation; cannot fail first) |
| T005 | complete | VERIFIED | TC-COMP-373/374 tests | — |
| T006 | complete | VERIFIED | TC-COMP-375/376 tests | Keys generated at run time; former fixed key not an input |
| T007 | complete | VERIFIED | TC-COMP-377/378 tests | Real `run_polling_loop`, env changed inside `claim_next` |
| T008 | complete | VERIFIED | TC-COMP-379 (a)/(b) | — |
| T009 | complete | VERIFIED | `tests/unit/test_run_e2e_server_script.py` | — |
| T010 | complete | VERIFIED | `test_no_committed_secrets.py` new constants and two tests | Existing four tests and constants unchanged |
| T011 | complete | VERIFIED | TC-COMP-382 (a)/(b) | Docstring exemption in (a) is a recorded, justified deviation (T013 requires the path in `main`'s docstring) |
| T012 | complete | VERIFIED | T012 (a)–(e) tests | (e) strengthened under T017 with a trailing-newline row |
| T013 | complete | VERIFIED | `src/factorflow/ingestion_main.py` diff (15+/3−) | Matches planned signature, imports, docstring; `__main__` and `_build_client_for_key` unchanged |
| T014 | complete | VERIFIED | `tests/e2e/support/ingestion_e2e_main.py` | All six parts present; `_LOOPBACK_HOSTS` imported, not copied |
| T015 | complete | VERIFIED | `scripts/run-e2e-server.sh` diff | `bash -n` exit 0 |
| T016 | complete | VERIFIED | tdd-evidence `e2e_verification` attempt 2; reviewer re-run | Proof-of-work file is written later by `sdd proof` at doc-sync (`docs/commands.md`), so its absence here is expected |
| T017 | complete | VERIFIED | tdd-evidence cycle `e2e-verification-and-mutations`; `diff_sha256` `9172c9bc…` recomputed from `git diff cc0b410 4da768d -- src tests scripts` and matches | Reviewer ran two extra mutations independently (see Validation) |
| T018 | complete | VERIFIED | tdd-evidence `validation` | Every listed command re-run by the reviewer with matching results |
| T019 | complete | VERIFIED | Four cycles with APPROVED review, `drift_detected: false`, `tests_executed: true` | Cycle 1–3 `diff_sha256` values recomputed from `git diff 0f62e3e b9c664c` per cycle path set and match (`1b171832…`, `4def7fe5…`, `29790434…`) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| TC-COMP-366 | ADEQUATE | Procedural verification, reproduced by the reviewer | none |
| `test_main_parameters_are_keyword_only_with_release_defaults` / TC-COMP-367 | ADEQUATE | Exact parameter list, kinds, identity of defaults, AST of `__main__` call | none |
| `test_main_returns_1_when_settings_factory_raises` / TC-COMP-368 | ADEQUATE | Return 1, factory called, DB/loop never reached, stderr and caplog free of value and key | none |
| `test_credential_reader_raising_at_first_claim_propagates` / TC-COMP-369 | ADEQUATE | Exception escapes the real loop; no client, no runner | none; reviewer mutation confirms sensitivity |
| `test_loopback_http_values_load` / TC-COMP-370 | ADEQUATE | Five values, base URL preserved exactly | none |
| `test_non_qualifying_values_raise` / TC-COMP-371 | ADEQUATE | 25 values; variable named, value not echoed; resolver fails on non-localhost lookups | No clause text asserted for these rows (plan Resolved Conflicts 2) |
| `test_accepted_values_parse_to_the_same_host` / TC-COMP-372 | ADEQUATE | `urlsplit` vs `parse_url` vs pool host for the accepted set | Does not load the entry point (recorded deviation); depends on DEC-0046 |
| TC-COMP-373 / TC-COMP-374 | ADEQUATE | Non-zero exit with no client/connect/loop; loopback-only starts once | none |
| TC-COMP-375 / TC-COMP-376 | ADEQUATE | Five boundary keys incl. 31-char tail and trailing newline; no echo of key or stripped key | none |
| TC-COMP-377 / TC-COMP-378 | ADEQUATE | Rotation through the real claim path; client args checked exactly | none |
| TC-COMP-379 (two tests) | ADEQUATE | Call shape via runpy; AST import allow-list, forbidden names, final statement shape | none |
| `test_script_generates_a_per_run_key_and_launches_the_test_entry_point` / TC-COMP-380 | ADEQUATE | Exact lines, ordering before migration and export, no fallback, launch lines | Text-level only, by design |
| `test_no_tracked_file_contains_a_fixed_e2e_provider_key` / TC-COMP-381 | ADEQUATE | Scans tracked files under `scripts/`, `tests/`, `src/`; patterns never self-match | none |
| `test_e2e_key_scope_covers_the_script_and_entry_point` / TC-COMP-381 | WEAK (non-mandatory helper) | Asserts two string literals start with a tuple defined in the same file | Cannot fail unless the constant is edited; see IR-002. The mandatory TC-COMP-381 behaviour is carried by the scan test above, so TC-COMP-381 as a whole is ADEQUATE |
| TC-COMP-382 (two tests) + `test_release_excludes_test_paths.py` | ADEQUATE | AST import and string scan of `src/factorflow`; Dockerfile COPY/ADD sources | Docstring exemption justified |
| T012 additional tests | ADEQUATE | Exact release messages for loopback values breaking other clauses; trailing slash; https passthrough; unresolvable localhost; reader message exact | none |
| TC-INT-027 | ADEQUATE | Re-executed live by the reviewer | none |

All tests are marked `not postgres` (`--collect-only -m postgres` on the four story files: no tests collected, 78 deselected). They are deterministic, open no sockets (`getaddrinfo` is faked), and generate every key at run time.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All checks PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-001 --story <story> --stage adversarial-review` | harness root | 0 | PASS | READY |
| `uv run pytest -m 'not postgres' -q tests/unit/test_ingestion_main.py tests/unit/test_ingestion_e2e_main.py tests/unit/test_run_e2e_server_script.py tests/unit/test_no_committed_secrets.py tests/unit/test_release_excludes_test_paths.py` | component | 0 | PASS | 82 passed in 0.97s |
| `uv sync --all-extras` | component | 0 | PASS | 43 packages checked |
| `uv run ruff check .` | component | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | component | 0 | PASS | 184 files already formatted |
| `uv run mypy src` | component | 0 | PASS | No issues in 47 source files |
| `uv run pytest -q` | component | 0 | PASS | 925 passed, 2 warnings (264.5 s; Docker/testcontainers) |
| `uv run pytest -m 'not postgres' -q` | component | 0 | PASS | 654 passed, 271 deselected |
| `uv build --out-dir "$(mktemp -d)"` | component | 0 | PASS | sdist and wheel built; sdist lists no `tests/` or `ingestion_e2e_main`. Out-dir outside the repo to avoid tree changes |
| `uv build --wheel --offline --out-dir "$(mktemp -d)"` + `python3 -m zipfile -l <wheel>` | component | 0 | PASS | 0 entries matching `tests/` or `ingestion_e2e_main`; `ingestion_main.py` present |
| `uv run pytest -m postgres --collect-only -q <four story test files>` | component | 5 | PASS | Exit 5 is pytest's "no tests collected" code: "no tests collected (78 deselected)", which is the outcome T018 requires |
| `bash -n scripts/run-e2e-server.sh` | component | 0 | PASS | — |
| `git grep -n "e2e-test-key" -- scripts tests src` / `git diff --stat a4bcc1f..HEAD -- src` | component | 1 / 0 | PASS | No matches; only `src/factorflow/ingestion_main.py` (15+/3−) |
| Release path: `FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126 uv run python -m factorflow.ingestion_main` (valid generated test key) | component | 1 | PASS | `Configuration error: FACTORFLOW_MASSIVE_BASE_URL: scheme must be https` |
| Entry point with a non-`TEST-ONLY-` key: `uv run python tests/e2e/support/ingestion_e2e_main.py` | component | 1 | PASS | `FACTORFLOW_MASSIVE_API_KEY: must be a designated test credential`; key not echoed. With `http://127.0.0.2:8126`: exit 1, `scheme must be https` |
| TC-INT-027: `PATH=gnubin:$PATH bash scripts/run-e2e-server.sh` (background), health on 8125, `pgrep -f tests/e2e/support/ingestion_e2e_main.py`, `PUT /api/settings/history-depth {"years":1}` (200), `POST /api/instruments {"symbols":["AAPL"]}` (201), `POST /api/acquisition-runs` (202), poll run | component | N/A | PASS | Ingestion alive after health; run `b66d03bf-99f9-431b-9ec4-c0e45576ab36` → `partial`, 4 `written` results; 10 `[massive-stub] "GET …" 200` lines; stack stopped; no leftover processes; `docker rm -f factorflow-e2e-postgres` → no such container |
| `PATH=gnubin:$PATH npm run test:e2e` | component | 0 | PASS | 9 passed (44.4 s), including `coverage-empty.spec.ts`; posttest removed the container |
| Reviewer mutation M1 (scratch copy via `git archive`): remove `_require_test_credential`'s check | temp dir | 1 | PASS (mutation killed) | 5 failed: all TC-COMP-376 rows |
| Reviewer mutation M2 (scratch copy): build client from `read_provider_credential()` before calling `credential_reader()` | temp dir | 1 | PASS (mutation killed) | TC-COMP-377 and TC-COMP-369 failed |
| Reviewer validator probe (scratch script outside the repo, 20 adversarial URLs) | component | 0 | PASS | Only loopback case/port variants accepted; `urlsplit` and urllib3 pool host agree for each |
| `npm ci`, `npm run build`, `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit` | — | N/A | NOT RUN | Not applicable: the story changes no frontend file, and the task Validation Plan does not list them. `npm run test` would also rewrite `src/factorflow/api/static/` |

### Validation Side Effects

- Before: branch `usr/alvaro-de-jodra/CAP-001-E3-S6-S7` at `4da768d`, working tree clean.
- After: same HEAD, `git status --porcelain` empty. No E2E processes running, no `factorflow-e2e-postgres` container. Build outputs and mutation copies went only to temp directories outside the repo.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — Commit `4da768d` has a malformed trailer block

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T019
- **Files**: commit message of `4da768dfd283b8b538d2918de0036bf35a1caaad`
- **Claim challenged**: The stage commit carries its `Co-Authored-By` and `Decision-Id: DEC-0046` trailers.
- **Observed evidence**: The message ends with `Decision-Id: DEC-0046`, then stray `EOF` and `)` lines, which look like heredoc leftovers. The body also has an unclosed parenthesis: "(the reader's fullmatch as a $-anchored re.match survived". `git log -1 --format=%B 4da768d | git interpret-trailers --parse` prints nothing. `scripts/sdd decisions show DEC-0046` lists `cc0b410` but not `4da768d`.
- **Expected evidence/behavior**: `docs/decision-records.md`, "The commit trailer": the trailer goes in the last block of the message, after other footers. Git reads trailers only from the final paragraph.
- **Impact**: Low. DEC-0046's own work, the TC-COMP-372 comparison form, is in `cc0b410`, which carries a valid trailer, so `decisions revert DEC-0046` still reaches it. `4da768d` is invisible to trailer-based tooling, and the commit record is untidy.
- **Required remediation**: No code change. Before the S6+S7 merge, the owner may reword the message so the final paragraph holds only valid trailers. Otherwise, accept and record this. The reviewer does not rewrite history.

### IR-002 — TC-COMP-381's scope test can never fail

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S7-12
- **Tasks**: T010
- **Files**: `tests/unit/test_no_committed_secrets.py::test_e2e_key_scope_covers_the_script_and_entry_point`
- **Claim challenged**: The test proves that the script and the entry point fall within the key scan.
- **Observed evidence**: The test asserts that two hard-coded path strings start with `_E2E_KEY_SCANNED_PREFIXES`, a tuple defined three lines above in the same file. It checks neither that the files exist nor that `_tracked_files()` returns them. The cycle-3 code reviewer also called it "close to a tautology".
- **Expected evidence/behavior**: T010 prescribes this exact assertion, so the test conforms to the plan. A guard that could detect a regression would assert that both paths are in `_tracked_files()`, so that deleting, renaming or untracking either one turns the test red.
- **Impact**: None today. The real scan test covers the behaviour. This helper only adds a false sense of coverage.
- **Required remediation**: Optional. Assert that both paths are in `_tracked_files()` as well as within the prefixes.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

These deviations are recorded in the TDD evidence, and the reviewer judges them justified:

- **TC-COMP-372 is green on arrival.** It never loads the entry point, so it cannot fail first.
- **TC-COMP-382 (a) exempts docstrings.** T013 requires the entry point's path in `main`'s docstring, and a docstring is never imported.
- **T012's tests carry existing TC-COMP labels.**
- **The T017 strengthening is in scope.** The trailing-newline row for the reader is the strengthening T017 asks for.

Open items and observations:

- **DEC-0046 is still open.** Its status is `contained`, `open` and `reviewed false`, and the plan's Open Gaps mark it PROVISIONAL pending owner confirmation. It fixes only the form of an assertion, not product behaviour. The owner still needs to confirm it, and `runtime-config` 2.2c item 2's next revision should state the comparison form.
- **The decision commit caches are stale.** `scripts/sdd decisions verify` reports DEC-0044, DEC-0045 and DEC-0046 as `DRIFTED`: the cached commit lists are out of date. This is harness bookkeeping, refreshed with `--fix`, and outside this story's diff. The reviewer did not change it.
- **Pre-existing, outside this story: no run can reach `succeeded`.** TC-INT-027's run ended `partial` with `instruments_named: 0`, although all four data types were written. The coder recorded the same behaviour and attributed it to `instruments_named` never being set under `src/`. TC-INT-027 requires only a terminal state, so this story is unaffected. It is a follow-up for the owner.
- **The proof of work comes later.** T016 says to record its evidence in "the proof of work". That file is derived by `scripts/sdd proof` at doc-sync, so its absence at this gate is expected.
- **No out-of-scope changes.** Every changed file traces to a task.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-001-E3-S7. Under the landing rule, merge S6 and S7 together with a merge commit. Before merging, the owner may reword `4da768d`'s trailer block (IR-001) and confirm DEC-0046.
- **Warnings accepted downstream**: IR-001, IR-002
