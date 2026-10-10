---
artifact_schema_version: 1
artifact_id: CAP-001-E3-S7-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-10T15:52:00Z
  source_artifacts:
    - id: CAP-001-E3-S7
      version: "3"
    - id: CAP-001-E3
      version: "4"
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "11"
    - id: CAP-001-component-design-acquisition-runner
      version: "8"
    - id: CAP-001-component-design-massive-client
      version: "12"
    - id: CAP-001-component-tests
      version: "2"
    - id: CAP-001-integration-tests
      version: "2"
    - id: CAP-001-coverage-matrix
      version: "2"
    - id: CAP-001-specification-review
      version: "9"
    - id: CAP-001-E3-S6-tasks
      version: "1"
    - id: CONST-SEC
      version: "1.2 (content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc)"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E3-S7 — Test-Only Ingestion Entry Point for the Loopback Provider Stub (Clause 2a)

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S7.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E3-tasks`
**Date**: 2026-10-10

## Summary

CAP-001-E3-S6 makes `MassiveSettings` accept only `https`, which leaves the E2E acquisition stack's ingestion process unable to start against the DEC-0025 stub on `http://127.0.0.1:8126`. This story makes clause 2a of `runtime-config` section 2.2c real, and keeps it out of the release artifact. `factorflow.ingestion_main.main` gains two keyword-only parameters, `settings_factory` and `credential_reader`, whose defaults keep today's behaviour (DEC-0035). A new test-only entry point, `tests/e2e/support/ingestion_e2e_main.py`, passes `main` two things. The first is a settings factory whose `MassiveSettings` subclass also accepts `http` for a host in `_LOOPBACK_HOSTS`, checks that `localhost` resolves only to loopback, and accepts only a `TEST-ONLY-` key. The second is a credential reader that refuses any non-test key at every claim. `scripts/run-e2e-server.sh` generates a key for each run, drops the literal `e2e-test-key`, and starts acquisition ingestion through the new entry point (DEC-0037). The no-committed-key test is extended to `scripts/`. Nothing under `src/` gains an `http` path, so the release artifact stays `https`-only (SEC-NDG-001, DEC-0033, DEC-0034). Under the landing rule, this story merges together with CAP-001-E3-S6.

## Acceptance Criteria Traceability

| AC | Description | Tasks | Test cases |
|----|-------------|-------|------------|
| AC-13 (E2E key) | The E2E key is generated per run, appears in no tracked file, and the ingestion process refuses any non-test key | T006, T007, T009, T010, T014, T015 | TC-COMP-375, TC-COMP-376, TC-COMP-377, TC-COMP-380, TC-COMP-381 |
| AC-13 (release artifact) | The release artifact contains no path accepting plain-HTTP; clause 2a is reachable only from `tests/` | T008, T011, T013, T014, T018 | TC-COMP-379, TC-COMP-382 |
| AC-3 | The acquisition E2E journeys reach the stub (via DAC-E3-S7-14) | T016 | TC-INT-027 |
| DAC-E1-10 | A rotated credential takes effect at the next claim (via DAC-E3-S7-9) | T007, T013 | TC-COMP-378 |
| DAC-E3-S7-1 | In-force re-check of CONST-SEC 1.2 at the start of planning and coding | T001 | TC-COMP-366 |
| DAC-E3-S7-2 | `main`'s `settings_factory` and `credential_reader` are keyword-only, default to `Settings` and `read_provider_credential`; `__main__` passes neither | T002, T013 | TC-COMP-367 |
| DAC-E3-S7-3 | A raising `settings_factory` makes `main` return 1, naming the variable, never the value | T002, T013 | TC-COMP-368 |
| DAC-E3-S7-4 | A `credential_reader` raising at the first claim propagates out of `main`; no `RESTClient` is constructed | T002, T013 | TC-COMP-369 |
| DAC-E3-S7-5 | The three loopback `http` values load; every non-qualifying form and every other rejected row raises; messages never echo the value | T003, T012, T014 | TC-COMP-370, TC-COMP-371 |
| DAC-E3-S7-6 | Every accepted value parses to the same host under `urlsplit` and urllib3 | T004, T014 | TC-COMP-372 |
| DAC-E3-S7-7 | `localhost` resolving to a non-loopback address refuses start; loopback only starts | T005, T012, T014 | TC-COMP-373, TC-COMP-374 |
| DAC-E3-S7-8 | A generated `TEST-ONLY-` key starts; five non-test key forms refuse start without echo | T006, T014 | TC-COMP-375, TC-COMP-376 |
| DAC-E3-S7-9 | A non-test key at a later claim ends the process with no client built; another test key rebuilds normally | T007, T013, T014 | TC-COMP-377, TC-COMP-378 |
| DAC-E3-S7-10 | The entry point builds the client only through `main(settings_factory=..., credential_reader=...)` and adds no transport handling | T008, T014 | TC-COMP-379 |
| DAC-E3-S7-11 | The script's single edit: per-run key, no fallback, no `e2e-test-key`, ingestion through the test entry point | T009, T015 | TC-COMP-380 |
| DAC-E3-S7-12 | No tracked file under `scripts/`, `tests/`, `src/` holds `e2e-test-key` or a `TEST-ONLY-[0-9a-f]{32,}` literal | T010, T015 | TC-COMP-381 |
| DAC-E3-S7-13 | CAP-001-E3-S6's release-exclusion test still passes; wheel and image hold no `ingestion_e2e_main.py`; no `src` module imports it | T011, T018 | TC-COMP-382 |
| DAC-E3-S7-14 | The E2E acquisition stack's ingestion process stays up and a run reaches the stub on `127.0.0.1:8126` | T016 | TC-INT-027 |

All 17 mapped component test cases, TC-COMP-366 to TC-COMP-382, and integration case TC-INT-027 are planned. TC-COMP-383 to TC-COMP-388 trace to CAP-001-E5-S1 and are not this story's.

## Phase 1: Setup

**Purpose**: Re-run the stage-entry check DAC-E3-S7-1 requires before any clause 2a file is written.

- [x] T001 Implement TC-COMP-366 as the coding stage's first action, before writing any file: in the AI-agents harness, on the default branch `main` (run `git fetch origin main` first, and if the local checkout is not on `main`, read the file with `git show origin/main:docs/constitutions/security.constitution.md` into a scratch directory instead of switching branches), run `python3 scripts/artifact-gate.py revision --repo-dir . --artifact docs/constitutions/security.constitution.md`, read `approval.reviewed_revision` from the same file, and confirm the file carries an `approval` block and both values equal the pin `sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc`. Record the three values and the `origin/main` commit in the TDD evidence file (T019) as procedural verification (DEC-0043's classification; see Other Notes). If any check fails, stop, write nothing of T003 to T018, and report: the story's Description says the condition table, the designs' pin and DEC-0036 must then be revisited. No repository file changes. Traces to DAC-E3-S7-1.

**Checkpoint**: The in-force check passed and is recorded; no clause 2a file exists yet.

---

## Phase 2: Tests (TDD)

**Purpose**: Write the 16 automated mapped component tests (TC-COMP-367 to TC-COMP-382) and the additional unit tests first. Every test function carries a `# Implements TC-COMP-NNN` comment, as existing tests do. No test carries a `postgres` marker, opens a socket or needs a container. Every provider key is generated in the test: use `generated_test_key()` from CAP-001-E3-S6's `tests/unit/massive_transport_fakes.py` (`"TEST-ONLY-" + secrets.token_hex(16)`), and derive every malformed key from `secrets` at run time. No test file may contain the literal string `e2e-test-key`. Where a test must name it, build it as `"e2e" + "-test-key"` so TC-COMP-381's scan needs no self-exclusion. Environment for every `main`-driving test: `FACTORFLOW_DATABASE_URL=postgresql://unused/unused`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, a generated key, and `FACTORFLOW_MASSIVE_BASE_URL` set or deleted explicitly with `monkeypatch`.

Expected state before Phase 3: RED for everything in T002 to T010 and T012, because `main` accepts no keyword, `tests/e2e/support/ingestion_e2e_main.py` does not exist, and the script still holds `e2e-test-key`. T011's `src` and `Dockerfile` checks are GREEN on arrival, because they guard what is already true. T017 proves they can fail.

### Mandatory Component Tests

- [x] T002 [P] Implement TC-COMP-367, TC-COMP-368 and TC-COMP-369 in `tests/unit/test_ingestion_main.py` (extend). Keep every existing test unchanged, including CAP-001-E3-S6's TC-COMP-353 test, which calls `main()` with no arguments. TC-COMP-367: `inspect.signature(factorflow.ingestion_main.main)` has exactly the parameters `settings_factory` and `credential_reader`, each `inspect.Parameter.KEYWORD_ONLY`, with `.default is Settings` and `.default is read_provider_credential` (both imported from `factorflow.config.settings`). Then parse `src/factorflow/ingestion_main.py` with `ast`, find the `if __name__ == "__main__":` block, and assert that its one `main(...)` call has no arguments and no keywords. TC-COMP-368: with an otherwise valid environment whose `FACTORFLOW_MASSIVE_BASE_URL` is `"https://" + secrets.token_hex(8) + ".example"`, patch `factorflow.ingestion_main.psycopg.connect` and `factorflow.ingestion_main.run_polling_loop` with mocks calling `pytest.fail`. Pass a `settings_factory` that records its call and raises `ConfigurationError("FACTORFLOW_MASSIVE_BASE_URL: scheme must be https")`. Assert that `main(settings_factory=factory) == 1` and the factory was called. Assert that the `capsys` stderr line names `FACTORFLOW_MASSIVE_BASE_URL` and contains neither the generated value nor the key. Assert that no `caplog` record contains either value. TC-COMP-368's "log" is the pre-logging stderr line (Resolved Conflicts 1). TC-COMP-369: patch `factorflow.ingestion.massive.client.RESTClient` with a `MagicMock`. Patch `factorflow.ingestion_main.psycopg.connect` with a `MagicMock`, and `factorflow.ingestion_main.claim_next` to return `types.SimpleNamespace(run_id=1, history_depth_years=5)` on its first call. Patch `factorflow.ingestion_main.active_instrument_ids` to return `[1]`, `factorflow.ingestion_main.AcquisitionRunner` with a `MagicMock`, and `factorflow.ingestion_main.configure_logging` with a no-op. Pass a `credential_reader` that raises a test-local `_ReaderRefused` exception. Assert that `pytest.raises(_ReaderRefused)` holds around `main(credential_reader=reader)`, the exception propagated through the real `run_polling_loop`, and `RESTClient` and `AcquisitionRunner` were never called. An uncaught exception ends a Python process with status 1, which is the "non-zero" of DAC-E3-S7-4.
- [x] T003 [P] Create `tests/unit/test_ingestion_e2e_main.py`. The module docstring cites `component-design-runtime-config.md` section 2.2c clause 2a and items 2 and 3, CONST-SEC 1.2 SEC-ENC-001, and CAP-001-E3-S7. It holds these helpers, which are not tests. `E2E_MAIN = REPO_ROOT / "tests/e2e/support/ingestion_e2e_main.py"`. `_load_entry_module()` imports `E2E_MAIN` with `importlib.util.spec_from_file_location("ingestion_e2e_main", E2E_MAIN)`; `tests/e2e/` has no `__init__.py`. `_start_entry_point()` runs `runpy.run_path(str(E2E_MAIN), run_name="__main__")` inside `pytest.raises(SystemExit)` and returns the exit code. `_fake_getaddrinfo(addresses)` returns, for host `localhost` only, one `(family, socket.SOCK_STREAM, 6, "", sockaddr)` tuple per address. For any other host it calls `pytest.fail`, which also proves the IP literals are never resolved. Install it with `monkeypatch.setattr(socket, "getaddrinfo", ...)`. Do not use S6's `forbid_sockets` here, because it fails every `getaddrinfo` call. `_patch_main_dependencies(monkeypatch)` patches `factorflow.ingestion.massive.client.RESTClient` with a `MagicMock` and returns it, and patches `factorflow.ingestion_main.psycopg.connect` with a `MagicMock`. It also patches `factorflow.ingestion_main.run_polling_loop` with a recording mock that returns `None`, so `main` returns 0 and "it starts" means the loop was entered, and patches `factorflow.ingestion_main.configure_logging` with a no-op. Then implement TC-COMP-370: with a generated key and the resolver returning only `127.0.0.1` and `::1`, `_load_entry_module().load_settings()` returns a `Settings` whose `massive.base_url` equals the input for each of `http://127.0.0.1:8126`, `http://localhost:8126` and `http://[::1]:8126`. Add `HTTP://127.0.0.1:8126` and `http://LOCALHOST:8126`, because TC-COMP-370 says host comparison ignores case. Implement TC-COMP-371: `load_settings()` raises `ConfigurationError` for each of `http://127.0.0.2`, `http://127.1`, `http://0.0.0.0`, `http://localhost.`, `http://[0:0:0:0:0:0:0:1]`, `http://[::ffff:127.0.0.1]`, `http://[::1%25lo]`, `http://::1:8126` and `http://api.massive.com`. It also raises for every value of S6's TC-COMP-351 list, and for `ftp://api.massive.com` and `api.massive.com`. Each message contains `FACTORFLOW_MASSIVE_BASE_URL` and does not contain the submitted value; skip the substring check for the empty string. Assert no particular clause text for these values; see Resolved Conflicts 2.
- [x] T004 Implement TC-COMP-372 in `tests/unit/test_ingestion_e2e_main.py` (depends on T003, same file). For each value TC-COMP-370 accepts, `urllib.parse.urlsplit(v).hostname` equals `urllib3.util.parse_url(v).host` with one enclosing pair of IP-literal brackets removed. It also equals `urllib3.PoolManager().connection_from_url(v).host`, the host urllib3's pool connects to; building a pool opens no socket. Do not assert literal equality of `"::1"` and `"[::1]"` (DEC-0046, Open Gaps). The docstring cites specification review v7 FINDING-12 (b).
- [x] T005 Implement TC-COMP-373 and TC-COMP-374 in `tests/unit/test_ingestion_e2e_main.py` (depends on T004, same file). Set `FACTORFLOW_MASSIVE_BASE_URL=http://localhost:8126` and use a generated key and `_patch_main_dependencies`. TC-COMP-373: the resolver returns `127.0.0.1` and `192.0.2.10`, a documentation address that is not loopback. `_start_entry_point()` returns a non-zero code, `RESTClient`, `psycopg.connect` and `run_polling_loop` were never called, and stderr names `FACTORFLOW_MASSIVE_BASE_URL`. TC-COMP-374: the resolver returns only `127.0.0.1` and `::1`. `_start_entry_point()` returns 0 and `run_polling_loop` was called once.
- [x] T006 Implement TC-COMP-375 and TC-COMP-376 in `tests/unit/test_ingestion_e2e_main.py` (depends on T005, same file). Set `FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126` and use `_patch_main_dependencies`. TC-COMP-375: with `generated_test_key()`, `_start_entry_point()` returns 0 and `run_polling_loop` was called. TC-COMP-376: parametrise over five keys, each generated in the test. The first is `"TEST-ONLY-" + secrets.token_hex(16)[:31]`, the 31-character boundary. The second is `"TEST-ONLY-A" + secrets.token_hex(16).upper()[1:]`, an uppercase tail with at least one letter. The third is `"test-only-" + secrets.token_hex(16)`. The fourth is `generated_test_key() + "\n"`, which `re.fullmatch` refuses while a `$`-anchored `re.match` would accept it. The fifth is `"".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))`. For each key, `_start_entry_point()` returns non-zero, `RESTClient`, `psycopg.connect` and `run_polling_loop` were never called, stderr names `FACTORFLOW_MASSIVE_API_KEY`, and neither stderr nor any `caplog` record contains the key or its stripped form. The former fixed key is not an input (DEC-0040).
- [x] T007 Implement TC-COMP-377 and TC-COMP-378 in `tests/unit/test_ingestion_e2e_main.py` (depends on T006, same file). Use `FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126`, start with `key1 = generated_test_key()`, and use the real `run_polling_loop`. Patch `factorflow.ingestion.massive.client.RESTClient` with a `MagicMock`, `factorflow.ingestion_main.psycopg.connect` with a `MagicMock`, `factorflow.ingestion_main.active_instrument_ids` to return `[1]`, `factorflow.ingestion_main.AcquisitionRunner` with a `MagicMock`, and `factorflow.ingestion_main.configure_logging` with a no-op. Patch `factorflow.ingestion_main.claim_next` with a side-effect function. Its first call returns a claim token `types.SimpleNamespace(run_id=1, history_depth_years=5)`. Its second call first `monkeypatch.setenv`s the new key and then returns run 2. Its third call raises a test-local `_StopLoop`. Run the module with `runpy.run_path(str(E2E_MAIN), run_name="__main__")`. TC-COMP-377 uses the new key `"x" + secrets.token_hex(16)`, which does not match the pattern. Assert that `ConfigurationError` propagates out of the run with no `SystemExit` and no `_StopLoop`. Assert that `RESTClient` was called exactly once, with `api_key == key1`, and never with the new value. Assert that `str(exc)` and `"".join(traceback.format_exception(exc))` name `FACTORFLOW_MASSIVE_API_KEY` and do not contain the new value. TC-COMP-378 uses the new key `key2 = generated_test_key()`. Assert that `_StopLoop` propagates, meaning the loop went on to a third claim, and that `RESTClient` was called twice, with `api_key` `key1` and then `key2`.
- [x] T008 Implement TC-COMP-379 in `tests/unit/test_ingestion_e2e_main.py` (depends on T007, same file). (a) Replace `factorflow.ingestion_main.main` with a recorder returning 0 and run `_start_entry_point()`. Assert that the exit code is 0 and the recorder was called once, with no positional arguments and exactly the keywords `settings_factory` and `credential_reader`. Those values are the module's own `load_settings` and `read_test_credential`, compared by `__name__` and `__module__`, because `runpy` re-executes the module. (b) Parse `E2E_MAIN` with `ast`. Assert that every `Import`/`ImportFrom` is a standard-library module, `pydantic`, `pydantic_core`, `factorflow.config.settings` or `factorflow.ingestion_main`; nothing from `factorflow.ingestion.massive`, `massive`, `urllib3` or `requests`. Assert that no `Name`, `Attribute` or keyword argument is `RESTClient`, `PoolManager`, `ProxyManager`, `Retry`, `retries`, `redirect` or `proxy`, case-insensitively for the last three. Assert that the module's last top-level statement is the `if __name__ == "__main__":` block whose body is `sys.exit(main(settings_factory=..., credential_reader=...))`.
- [x] T009 [P] Implement TC-COMP-380 in a new `tests/unit/test_run_e2e_server_script.py`, which reads `scripts/run-e2e-server.sh` and runs nothing else. The docstring cites `runtime-config` 2.2c item 5, DEC-0037 and CAP-001-E3-S7. `subprocess.run(["bash", "-n", script], check=True)` succeeds; the subprocess precedent is `tests/unit/test_no_committed_secrets.py`. The script text contains the exact line `E2E_PROVIDER_KEY="TEST-ONLY-$(uv run python -c 'import secrets; print(secrets.token_hex(16))')"`. That line comes before the first `factorflow.db.migrate_main` launch and before `export FACTORFLOW_MASSIVE_API_KEY`, so it precedes both stacks. The script contains `export FACTORFLOW_MASSIVE_API_KEY="$E2E_PROVIDER_KEY"` and no `FACTORFLOW_MASSIVE_API_KEY:-`, so there is no inherited fallback. `ACQUISITION_ENV` contains `"FACTORFLOW_MASSIVE_API_KEY=$E2E_PROVIDER_KEY"`. The string `"e2e" + "-test-key"` does not occur. The script contains `env "${ACQUISITION_ENV[@]}" uv run python tests/e2e/support/ingestion_e2e_main.py &` and no `-m factorflow.ingestion_main`. The acquisition API launch `env "${ACQUISITION_ENV[@]}" FACTORFLOW_API_PORT="$ACQ_PORT" \` followed by `uv run python -m factorflow.app_main &` is still present.
- [x] T010 [P] Implement TC-COMP-381 in `tests/unit/test_no_committed_secrets.py` (extend). Keep the four existing tests, `KEY_SHAPE`, `_SCANNED_PREFIXES` and `_SCANNED_FILES` unchanged. Add `_E2E_KEY_SCANNED_PREFIXES = ("scripts/", "tests/", "src/")`, which is DAC-E3-S7-12's own scope, `_FORMER_FIXED_KEY = "e2e" + "-test-key"` and `_TEST_KEY_LITERAL = re.compile(r"TEST-ONLY-[0-9a-f]{32,}")`. Add `test_no_tracked_file_contains_a_fixed_e2e_provider_key`, which reuses `_tracked_files()` and the existing read loop over files under those prefixes. It asserts that no file contains `_FORMER_FIXED_KEY` or matches `_TEST_KEY_LITERAL`. Built this way, the file's own patterns never match themselves and the file stays in scope. Add `test_e2e_key_scope_covers_the_script_and_entry_point`, which asserts that `scripts/run-e2e-server.sh` and `tests/e2e/support/ingestion_e2e_main.py` fall under the new prefixes. The docstring cites SEC-SEC-001, DEC-0037 and DEC-0040.
- [x] T011 Implement TC-COMP-382 in `tests/unit/test_ingestion_e2e_main.py` (depends on T008, same file). Do not edit CAP-001-E3-S6's `tests/unit/test_release_excludes_test_paths.py`, which must run unchanged and stay green, and whose `tests/` prefix check already covers the new file in the wheel. Add the two checks the S6 test does not make. (a) Walking every `*.py` under `src/factorflow` with `ast`, no `Import`/`ImportFrom` names a module whose last dotted part is `ingestion_e2e_main`, and no string constant contains `ingestion_e2e_main`. (b) No `COPY`/`ADD` source in the repository `Dockerfile` contains `ingestion_e2e_main`. The wheel-listing step of TC-COMP-382 is T018's recorded verification, so that a second wheel build is not added to the suite.

### Additional Unit Tests

- [x] T012 Add edge-case tests in `tests/unit/test_ingestion_e2e_main.py` (depends on T011, same file), with a generated key and the loopback-only resolver. (a) A loopback `http` value that breaks any other clause still raises, with that clause's release message from CAP-001-E3-S6's validator, proving item 2's "every other clause unchanged". `http://user@127.0.0.1:8126` gives `FACTORFLOW_MASSIVE_BASE_URL: must not carry userinfo`. `http://127.0.0.1:0` and `http://127.0.0.1:70000` give `FACTORFLOW_MASSIVE_BASE_URL: port must be an integer from 1 to 65535`. `http://127.0.0.1:8126/v3` gives `FACTORFLOW_MASSIVE_BASE_URL: must not carry a path`. `http://127.0.0.1:8126?x=1` gives `FACTORFLOW_MASSIVE_BASE_URL: must not carry a query or fragment`. `http://evil@127.0.0.1` and `http://127.0.0.1@evil.example` both raise. (b) `http://127.0.0.1:8126/` loads as `http://127.0.0.1:8126`, which is clause 6. (c) `https://api.massive.com` and `https://stub.example:8443` still load unchanged through the factory. (d) The resolver raising `socket.gaierror` for `localhost` raises `ConfigurationError` naming `FACTORFLOW_MASSIVE_BASE_URL`. (e) `read_test_credential()` returns a `SecretStr` equal to a generated valid key. For an invalid key it raises `ConfigurationError` whose message is exactly `FACTORFLOW_MASSIVE_API_KEY: must be a designated test credential`.

**Checkpoint**: T002 to T012 exist, carry traceability labels and no `postgres` marker, and the RED set above fails for the stated reason.

---

## Phase 3: Core Implementation

**Purpose**: Add the `main` parameters and the test-only entry point. These are the only Python changes the story names.

- [x] T013 Modify `factorflow.ingestion_main.main` in `src/factorflow/ingestion_main.py` to the acquisition-runner 2.1 signature `def main(*, settings_factory: Callable[[], Settings] = Settings, credential_reader: Callable[[], SecretStr] = read_provider_credential) -> int`. Add `from collections.abc import Callable`, which ruff's `UP` rules require, and `from pydantic import SecretStr` to the imports. Replace `settings = Settings()` with `settings = settings_factory()`. Keep the `except ConfigurationError` branch exactly as it is: the stderr `print(f"Configuration error: {exc}", file=sys.stderr)` before `configure_logging()`, then `return 1` (register correction 6; Resolved Conflicts 1). In `execute_fn`, replace `key = read_provider_credential()` with `key = credential_reader()`, before `client_factory.get_or_rebuild`, so a raising reader builds no client. Add no `try` around it, because `run_polling_loop` catches nothing and the exception must propagate. Extend the docstring with acquisition-runner 2.1's sentence ("Load settings with settings_factory() at start, and re-read the provider credential with credential_reader() at every claim"). Add that the parameters exist only for `tests/e2e/support/ingestion_e2e_main.py` and are not configuration (DEC-0035, DAC-E3-S7-2 to S7-4). Leave `if __name__ == "__main__": sys.exit(main())`, `_build_client_for_key` and every other line unchanged. Add no environment variable, flag or constant that selects a factory.
- [x] T014 [P] Create `tests/e2e/support/ingestion_e2e_main.py`. Its docstring follows `tests/e2e/support/massive_stub.py`'s pattern. It names `scripts/run-e2e-server.sh` as its only launcher, cites `runtime-config` 2.2c clause 2a and items 2, 3 and 6, CONST-SEC 1.2 SEC-ENC-001 conditions 1 to 4, DEC-0033, DEC-0036, DEC-0037 and CAP-001-E3-S7, and states that the release artifact never contains it. It is not collected by pytest, because it has no `test_` prefix. Contents:
  - (1) `_TEST_CREDENTIAL = re.compile(r"TEST-ONLY-[0-9a-f]{32,}")`, used only with `fullmatch`.
  - (2) `class _LoopbackHttpMassiveSettings(MassiveSettings)` overrides CAP-001-E3-S6's validator by defining `@field_validator("base_url")` `@classmethod` with the same name, `_validate_base_url`. Pydantic replaces a parent validator of the same name; verified on pydantic 2.13.5 on 2026-10-10. Let `parts = urlsplit(value)`. When `parts.scheme == "http"` and `parts.hostname in _LOOPBACK_HOSTS`, call `super()._validate_base_url("https" + value[4:])` so every other release clause applies unchanged, and return `value[:4] + result[5:]`, keeping the original scheme and removing only the one trailing `/`. Then, if `parts.hostname == "localhost"`, call `socket.getaddrinfo("localhost", parts.port or 80)`. Raise `PydanticCustomError("base_url", "localhost must resolve only to loopback addresses")` when the call raises `OSError`, returns nothing, or returns any `sockaddr[0]` for which `ipaddress.ip_address(...).is_loopback` is false. Otherwise return `super()._validate_base_url(value)` unchanged, which rejects `http` for every other host. Import `_LOOPBACK_HOSTS` from `factorflow.config.settings`; never copy it.
  - (3) A second validator, `@field_validator("api_key")` `@classmethod` `_require_test_credential`, raises `PydanticCustomError("api_key", "must be a designated test credential")` unless `_TEST_CREDENTIAL.fullmatch(value.get_secret_value())`, so start refusal renders `FACTORFLOW_MASSIVE_API_KEY: must be a designated test credential` through `_EnvNamedSettings` and never includes the input.
  - (4) `def load_settings() -> Settings: return Settings(massive=_LoopbackHttpMassiveSettings())`. A `ConfigurationError` from either model reaches `main`'s existing handler. Verified on 2026-10-10: `Settings` keeps a passed `MassiveSettings` subclass instance and still runs its timing invariants.
  - (5) `def read_test_credential() -> SecretStr`. It calls `read_provider_credential()` and returns the result if it fully matches. Otherwise it raises `ConfigurationError("FACTORFLOW_MASSIVE_API_KEY: must be a designated test credential")`, which never contains the value.
  - (6) The final statement: `if __name__ == "__main__": sys.exit(main(settings_factory=load_settings, credential_reader=read_test_credential))`, with `main` imported from `factorflow.ingestion_main`.

  Import nothing from `factorflow.ingestion.massive`, `massive` or `urllib3`. Construct no `RESTClient`. Add no redirect, retry or proxy handling (item 6, DAC-E3-S7-10). Every comment at a check cites its clause or item, as `ApiSettings._reject_non_loopback_host` does.

**Checkpoint**: T002 to T008, T011 and T012 pass; `uv run mypy src` reports no new error; `git diff src/` touches only `src/factorflow/ingestion_main.py`.

---

## Phase 4: Integration

**Purpose**: Point the E2E acquisition stack at the test entry point with a per-run key, and prove the stack reaches the stub.

- [x] T015 Edit `scripts/run-e2e-server.sh` once, as `runtime-config` 2.2c item 5 and DAC-E3-S7-11 specify. (a) Immediately before line 89's `export FACTORFLOW_DATABASE_URL=...`, and so before the migration and both stacks, add `E2E_PROVIDER_KEY="TEST-ONLY-$(uv run python -c 'import secrets; print(secrets.token_hex(16))')"`, with a comment citing DEC-0037 and saying that the key is generated per run and never written to a file. (b) Line 90 becomes `export FACTORFLOW_MASSIVE_API_KEY="$E2E_PROVIDER_KEY"`, with no `:-` fallback. (c) Line 138 becomes `"FACTORFLOW_MASSIVE_API_KEY=$E2E_PROVIDER_KEY"`. (d) Line 145 becomes `env "${ACQUISITION_ENV[@]}" uv run python tests/e2e/support/ingestion_e2e_main.py &`. Update the acquisition-stack comment so it says ingestion runs through the test-only entry point under clause 2a. Leave the base URL line 137, the acquisition API launch at lines 142 and 143, and every other line unchanged. Afterwards, `bash -n scripts/run-e2e-server.sh` passes and T009 and T010 are GREEN.
- [x] T016 Verify TC-INT-027 (DAC-E3-S7-14, AC-3) with CAP-001-E3-S6 and this story both applied, and record the evidence in the TDD evidence file and the proof of work. This needs Docker; if it is unavailable, report that rather than skipping. (1) Run `bash scripts/run-e2e-server.sh` in the background. Once `curl --fail http://127.0.0.1:8125/api/health` answers, confirm with `pgrep -f tests/e2e/support/ingestion_e2e_main.py` that the acquisition ingestion process is still running. (2) Against port 8125, `PUT /api/settings/history-depth` with `{"years": 1}` and `POST /api/instruments` with `{"symbols": ["AAPL"]}`, a symbol the stub's fixtures answer. Then `POST /api/acquisition-runs` and poll `GET /api/acquisition-runs/{id}` until the run is terminal. (3) Confirm that the script's stderr shows `[massive-stub] ... "GET /v3/...` lines (the stub's `log_message`) for that run, and that the run is terminal. (4) Stop the script and run `npm run test:e2e`, the whole Playwright suite. It includes the acquisition-stack spec `tests/e2e/coverage-empty.spec.ts` and is what the `End-to-end` CI job runs. Record its result. Any failure here blocks the story.

**Checkpoint**: The E2E acquisition stack starts, its ingestion process stays up, a run reaches the stub on `127.0.0.1:8126`, and the E2E suite passes.

---

## Phase 5: Polish

**Purpose**: Prove every guard test can fail, run the full validation set, and record TDD evidence.

- [x] T017 Make and revert each of these manual mutations, recording the test each one fails in the TDD evidence file (T019). Strengthen any test a mutation leaves green.
  - `src/factorflow/ingestion_main.py`: `settings_factory()` reverted to `Settings()` (TC-COMP-368, TC-COMP-374 and TC-COMP-375 must fail); `credential_reader()` reverted to `read_provider_credential()` (TC-COMP-369, TC-COMP-377 must fail); `__main__` changed to pass `settings_factory=Settings` (TC-COMP-367 must fail).
  - `tests/e2e/support/ingestion_e2e_main.py`: `_LOOPBACK_HOSTS` replaced by a check that the address is in `127.0.0.0/8` (TC-COMP-371 must fail); the `localhost` resolution check removed (TC-COMP-373 must fail); `fullmatch` replaced by `re.match` with a `$`-anchored pattern (TC-COMP-376's newline row must fail); the reader's check removed (TC-COMP-377 must fail); the delegation to the release clauses removed for loopback values (T012 (a) must fail); an `import urllib3` added (TC-COMP-379 must fail).
  - `src/factorflow/config/settings.py`: a temporary `import ingestion_e2e_main` inside a function (T011 (a) must fail).
  - `Dockerfile`: a temporary `COPY tests/e2e/support/ingestion_e2e_main.py ./` (T011 (b) and CAP-001-E3-S6's TC-COMP-364 (a) must fail).
  - `scripts/run-e2e-server.sh`: the `:-` fallback restored (TC-COMP-380 must fail); a temporary `# TEST-ONLY-` followed by 32 hex characters (TC-COMP-381 must fail).
- [x] T018 Run the full validation set (Validation Plan below) and record the outputs in the TDD evidence file. This includes CAP-001-E3-S6's `tests/unit/test_release_excludes_test_paths.py`, unchanged and green (TC-COMP-382 step 1). For TC-COMP-382 step 2, run `uv build --wheel --offline --out-dir "$(mktemp -d)"`, the DEC-0045 mechanism, and record that `python -m zipfile -l <wheel>` lists no `tests/` entry and no `ingestion_e2e_main`. Also run `uv run pytest -m postgres --collect-only -q tests/unit/test_ingestion_main.py tests/unit/test_ingestion_e2e_main.py tests/unit/test_run_e2e_server_script.py tests/unit/test_no_committed_secrets.py` and confirm it selects no test.
- [x] T019 After each TDD cycle in T001–T018, not once at the end, stage only that cycle's diff and dispatch an independent code-review subagent and an independent spec-drift subagent against it. Then append the cycle to `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/provider-integration-and-pacing/stories/CAP-001-E3-S7-tdd-evidence.yaml` beside this story, before the next cycle begins. Each entry records `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256`, the SHA-256 of the staged diff the reviews judged. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit that carries it: either the cycle's own commit, or `commit_hash: stage` when a driver commits once per stage, because the stage commit carries this file and cannot hold its own hash (INV-TDD-002, TEST-TDD-008; traces to no AC). Suggested cycles:
  - (0) T001's in-force check, recorded as procedural verification with no diff.
  - (1) The `main` parameters: T002 RED, then T013.
  - (2) The test entry point: T003–T008, T011 and T012 RED, then T014.
  - (3) The script and the key scan: T009 and T010 RED, then T015.
  - (4) T016's E2E verification and T017's mutations, recorded as evidence rather than as a RED phase.

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S3 | hard | `tests/e2e/support/ingestion_e2e_main.py` (T014) imports `MassiveSettings`, `Settings`, `ConfigurationError`, `_LOOPBACK_HOSTS` and `read_provider_credential` from `src/factorflow/config/settings.py`, the module CAP-001-E1-S3 created. **New edge added to `dependencies.yaml`.** It is also transitive through CAP-001-E3-S6; it is recorded directly because this story's own code imports it, following the precedent the CAP-001-E3-S6 plan set for CAP-001-E3-S3. |
| CAP-001-E3-S1 | hard | T002, T005 to T007 patch `factorflow.ingestion.massive.client.RESTClient` in `src/factorflow/ingestion/massive/client.py`, CAP-001-E3-S1's module, to observe client construction. **New edge added to `dependencies.yaml`.** It is transitive through CAP-001-E3-S6 and recorded directly for the same reason. |
| CAP-001-E3-S6 | hard | `MassiveSettings._validate_base_url`, which T014 overrides and delegates to, and `tests/unit/massive_transport_fakes.py` (`generated_test_key`) and `tests/unit/test_release_excludes_test_paths.py`, which T002 to T011 and T018 reuse. Existing edge. The two merge together (landing rule), a merge-order constraint and not a second edge. |
| CAP-001-E4-S5 | hard | `factorflow.ingestion_main.main`, `execute_fn`'s claim-time credential read and `run_polling_loop`'s wiring, which T013 modifies. Existing edge. |
| CAP-001-E5-S1 | context | Owns TC-COMP-383 to TC-COMP-388, cited only to exclude them from this story's mapped set. |

### Task Dependencies

- T001: No dependencies; it must pass before any other task writes a file.
- T002: Depends on T001.
- T003: Depends on T001 (uses CAP-001-E3-S6's `generated_test_key`). T004, T005, T006, T007, T008, T011 and T012 follow T003 in sequence, because they share one file.
- T009, T010: Depend on T001; separate files, parallel with T002 and the T003 chain.
- T013: Depends on T002 being written and RED.
- T014: Depends on T003–T008, T011 and T012 being written and RED, and on T013, because its `__main__` call needs the parameters. It is parallel with T013 only in authoring, since it is a different file.
- T015: Depends on T009, T010 RED and on T014, because the file it launches must exist.
- T016: Depends on T013, T014, T015 and on CAP-001-E3-S6's implementation being applied on the same branch.
- T017: Depends on T013–T015 and all Phase 2 tests.
- T018: Depends on T017.
- T019: Interleaved; runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: T002, the T003 chain, T009 and T010 touch four different files and can proceed in parallel after T001.
- Phase 3: T013 and T014 touch different files and can be written in parallel; T014's tests go green only once T013 is in.

### Phase Dependencies

- Phase 1 gates everything. Phase 3 starts only when its tests are RED. Phase 4 follows Phase 3. Phase 5 follows Phase 4, except T019, which runs after every cycle.

---

## Validation Plan

### Constitution-Defined Commands

- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest`
- No-container test subset: `uv run pytest -m 'not postgres'`
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`
- E2E: `npm run test:e2e` (T016)

### Story-Specific Validation

- `bash -n scripts/run-e2e-server.sh` passes.
- `uv run pytest -m 'not postgres' tests/unit/test_ingestion_main.py tests/unit/test_ingestion_e2e_main.py tests/unit/test_run_e2e_server_script.py tests/unit/test_no_committed_secrets.py tests/unit/test_release_excludes_test_paths.py` passes with no network and no container.
- With otherwise valid settings and `FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126`, `uv run python -m factorflow.ingestion_main` still exits 1 naming the variable (release path, CAP-001-E3-S6). `uv run python tests/e2e/support/ingestion_e2e_main.py` with a non-`TEST-ONLY-` key exits 1 naming `FACTORFLOW_MASSIVE_API_KEY` without echoing the key.
- `git diff --stat` touches only `src/factorflow/ingestion_main.py` under `src/`. `git grep -n "e2e-test-key" -- scripts tests src` prints nothing.
- T016's E2E evidence and every T017 mutation are recorded.

---

## Notes

### Resolved Conflicts

1. **"Log" in DAC-E3-S7-3 / TC-COMP-368 is the stderr line.** `ingestion_main.main()` prints a `ConfigurationError` to stderr before `configure_logging()` runs. `component-design-acquisition-runner.md` section 2.1 says a factory's `ConfigurationError` "is handled exactly as today", and `runtime-config` section 4 makes that stream the container log. The test specification is the lower authority, so T002 reads `capsys` stderr and also checks `caplog`, and T013 keeps the stderr behaviour. This is the same ladder outcome as the CAP-001-E3-S6 plan's Resolved Conflicts 3, which the resolution register's correction 6 also records.
2. **Unbracketed `http://::1:8126`.** The 2.2c table says "host missing"; the release validator's clause order reports "scheme must be https". In the entry point, `urlsplit` gives no hostname for this value, so it is not loopback and the release validator decides. DAC-E3-S7-5 and TC-COMP-371 require only rejection without echo, so T003 asserts no clause text for it, as the CAP-001-E3-S6 plan does.
3. **`e2e-test-key` in `runtime-config` section 7's refused-key list.** DAC-E3-S7-8 drops it as a test input (DEC-0040, specification review v7 FINDING-20). The story outranks the design and TC-COMP-376 follows the story. T006 does not use it, and no test file contains it literally (T010).
4. **"The module ends with `sys.exit(main(...))`" (story Implementation) against importability.** TC-COMP-370 loads "the settings factory of `tests/e2e/support/ingestion_e2e_main.py`", so the module must be importable without starting. The `sys.exit(main(...))` call is the body of a final `if __name__ == "__main__":` block, which still ends the module and runs exactly as the story says under `uv run python tests/e2e/support/ingestion_e2e_main.py`. It is not a conflict, because the story's wording is satisfied.
5. **DAC-E3-S7-8's "exits non-zero before constructing a `RESTClient`".** `main` builds the client lazily at the first claim, so the start-time key check sits in the settings factory: the `api_key` validator, T014 (3). The claim-time check is the reader, T014 (5). `runtime-config` 2.2c item 3 asks for exactly these two places, "at start" and "at every claim", so no artifact is contradicted.

### Open Gaps

- **Host-equality form in DAC-E3-S7-6 / TC-COMP-372: PROVISIONAL, awaiting owner confirmation (2026-10-10), DEC-0046.** No artifact says in which form the two hosts are compared. For `http://[::1]:8126`, `urlsplit` yields `::1` and urllib3 2.7.0's `parse_url` yields `[::1]`. Adopted: compare after removing one enclosing pair of IP-literal brackets, and against `PoolManager().connection_from_url(v).host`, which urllib3 normalises to `::1` itself. Derivation: RFC 3986 section 3.2.2 says brackets delimit an IP-literal and are not part of the address, and urllib3's `_normalize_host` strips them; verified in the repo venv on 2026-10-10. Literal equality would fail a value DAC-E3-S7-5 requires the entry point to accept. Flag for `runtime-config` 2.2c item 2's next revision, which should state the comparison form.
- **Offline wheel listing (T018)** reuses CAP-001-E3-S6's PROVISIONAL `uv build --wheel --offline` mechanism, DEC-0045. No new value.
- No other bound, limit, default or threshold is left undetermined. The pattern `^TEST-ONLY-[0-9a-f]{32,}$`, the key generation command, `_LOOPBACK_HOSTS`, the stub address `127.0.0.1:8126` and the script line numbers are fixed by `runtime-config` 2.2c, the story and DEC-0037. The refusal messages follow clause 9's `<VARIABLE>: <clause>` form; tests assert the variable name and absence of the value, and only T012 (e) pins the new reader message. The `getaddrinfo` failure case refuses start, because item 2 says "refuses to start unless every returned address is a loopback address" and an unresolvable name returns none. `192.0.2.10`, `requests_per_minute=60` and `history_depth_years=5` are test inputs, not product values.

### Other Notes

- **In-force check at planning (DAC-E3-S7-1, TC-COMP-366), passed 2026-10-10.** The AI-agents `origin/main` was at `5ba1068f9242ef67536253bff671f50e47021a6d`. There, `docs/constitutions/security.constitution.md` has `version: 1.2`, an `approval` block (`approved_by: "Alvaro de Jodra"`, `approved_at: 2026-10-09T21:00:28Z`) and `reviewed_revision: sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc`. `scripts/artifact-gate.py revision` printed the same value both on a copy of the `origin/main` file and on the local `main` checkout. All three equal the pin. T001 repeats the check at coding start.
- **DEC-0043 is not on the harness `main`.** The coverage matrix and the component test specification cite DEC-0043, an unattended `$test-run` decision, for TC-COMP-366's procedural classification and TC-INT-027's tier. That record exists only on an unmerged harness branch. This plan follows the test specification as written and does not depend on the record's content.
- **Producer map.** `src/factorflow/config/settings.py` (CAP-001-E1-S3), `src/factorflow/ingestion/massive/client.py` (CAP-001-E3-S1) and `src/factorflow/ingestion_main.py` (CAP-001-E4-S5) exist and are implemented. `MassiveSettings._validate_base_url`, `tests/unit/massive_transport_fakes.py` and `tests/unit/test_release_excludes_test_paths.py` are created by CAP-001-E3-S6, which is planned but not yet coded. This story is coded on top of it, on the same branch or an integration branch (landing rule).
- **Why the override delegates rather than copies.** Item 2 requires every other clause "unchanged". T014 therefore calls the release validator through `super()` on the value with its scheme replaced, instead of restating the clauses. A future change to the release clauses then reaches the test entry point automatically, and T012 (a) pins this.
- **`localhost` is resolved once, at start.** This is the story's Open Question, specification review v7 FINDING-11; it is not blocking. The approved design resolves once, and T014 does exactly that. The script's own channel uses `127.0.0.1`.
- **No README or design change.** The README's acquisition-runner section describes the release launch, which is unchanged. Documenting the test entry point is `$doc-sync`'s.
- **Landing rule.** Merge only together with CAP-001-E3-S6, by one of the two routes in the story's Description, with a merge commit. Reverting this story alone would leave the `End-to-end` job red.
- **Out of scope** (story Description): redirect and proxy handling, already guaranteed by CAP-001-E3-S6; `runtime-config` section 14 items 5 and 6; `massive-client` section 14 item 7; re-resolving `localhost` per claim; decoupling the per-run key from clause 2a (story Open Question, owner's).
