"""Unit tests: the test-only ingestion entry point for the loopback stub.

`tests/e2e/support/ingestion_e2e_main.py` implements clause 2a of
`component-design-runtime-config.md` section 2.2c, with items 2 and 3: plain
`http` only for a host in `_LOOPBACK_HOSTS`, `localhost` resolving only to
loopback, and a designated test credential at start and at every claim
(CONST-SEC 1.2 SEC-ENC-001; CAP-001-E3-S7). Nothing here opens a socket or
needs a container.
"""

from __future__ import annotations

import ast
import importlib.util
import runpy
import secrets
import socket
import string
import sys
import traceback
import types
import urllib.parse
from collections.abc import Callable
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock

import pytest
import urllib3
from pydantic import SecretStr

from factorflow.config.settings import ConfigurationError, Settings
from tests.unit.massive_transport_fakes import generated_test_key

REPO_ROOT = Path(__file__).resolve().parents[2]
E2E_MAIN = REPO_ROOT / "tests/e2e/support/ingestion_e2e_main.py"

_BASE_URL_VAR = "FACTORFLOW_MASSIVE_BASE_URL"
_KEY_VAR = "FACTORFLOW_MASSIVE_API_KEY"
_LOOPBACK_ONLY = ("127.0.0.1", "::1")


# --- helpers (not tests) -----------------------------------------------------


def _load_entry_module() -> types.ModuleType:
    spec = importlib.util.spec_from_file_location("ingestion_e2e_main", E2E_MAIN)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _start_entry_point() -> Any:
    with pytest.raises(SystemExit) as exit_info:
        runpy.run_path(str(E2E_MAIN), run_name="__main__")
    return exit_info.value.code


def _fake_getaddrinfo(addresses: tuple[str, ...]) -> Any:
    def getaddrinfo(host: Any, port: Any, *_args: Any, **_kwargs: Any) -> list[Any]:
        if host != "localhost":
            pytest.fail(f"getaddrinfo called for {host!r}; only localhost is resolved")
        result = []
        for address in addresses:
            if ":" in address:
                result.append((socket.AF_INET6, socket.SOCK_STREAM, 6, "", (address, port, 0, 0)))
            else:
                result.append((socket.AF_INET, socket.SOCK_STREAM, 6, "", (address, port)))
        return result

    return getaddrinfo


def _env(monkeypatch: pytest.MonkeyPatch, *, base_url: str, key: str | None = None) -> str:
    key = generated_test_key() if key is None else key
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    monkeypatch.setenv(_KEY_VAR, key)
    monkeypatch.setenv(_BASE_URL_VAR, base_url)
    return key


def _resolver(monkeypatch: pytest.MonkeyPatch, addresses: tuple[str, ...] = _LOOPBACK_ONLY) -> None:
    monkeypatch.setattr(socket, "getaddrinfo", _fake_getaddrinfo(addresses))


def _patch_main_dependencies(monkeypatch: pytest.MonkeyPatch) -> dict[str, MagicMock]:
    import factorflow.ingestion_main as ingestion_main

    mocks = {
        "rest_client": MagicMock(),
        "connect": MagicMock(),
        "run_polling_loop": MagicMock(return_value=None),
    }
    monkeypatch.setattr("factorflow.ingestion.massive.client.RESTClient", mocks["rest_client"])
    monkeypatch.setattr(ingestion_main.psycopg, "connect", mocks["connect"])
    monkeypatch.setattr(ingestion_main, "run_polling_loop", mocks["run_polling_loop"])
    monkeypatch.setattr(ingestion_main, "configure_logging", lambda: None)
    return mocks


def _load_error(monkeypatch: pytest.MonkeyPatch, value: str) -> str:
    _env(monkeypatch, base_url=value)
    with pytest.raises(ConfigurationError) as exc_info:
        _load_entry_module().load_settings()
    return str(exc_info.value)


_ACCEPTED = [
    "http://127.0.0.1:8126",
    "http://localhost:8126",
    "http://[::1]:8126",
    "HTTP://127.0.0.1:8126",
    "http://LOCALHOST:8126",
]


# --- TC-COMP-370 / DAC-E3-S7-5: the three loopback forms load ---------------


# Implements TC-COMP-370
@pytest.mark.parametrize("value", _ACCEPTED)
def test_loopback_http_values_load(monkeypatch: pytest.MonkeyPatch, value: str) -> None:
    """Clause 2a: `http` loads for a host in `_LOOPBACK_HOSTS`, host compared
    without regard to case, and the value is kept as given."""
    _env(monkeypatch, base_url=value)
    _resolver(monkeypatch)
    settings = _load_entry_module().load_settings()
    assert isinstance(settings, Settings)
    assert settings.massive.base_url == value


# --- TC-COMP-371 / DAC-E3-S7-5: everything else still raises ----------------


# Implements TC-COMP-371
@pytest.mark.parametrize(
    "value",
    [
        "http://127.0.0.2",
        "http://127.1",
        "http://0.0.0.0",
        "http://localhost.",
        "http://[0:0:0:0:0:0:0:1]",
        "http://[::ffff:127.0.0.1]",
        "http://[::1%25lo]",
        "http://::1:8126",
        "http://api.massive.com",
        # CAP-001-E3-S6's TC-COMP-351 rows
        "https://",
        "https:///v3",
        "https:api.massive.com",
        "https://user:pw@api.massive.com",
        "https://api.massive.com:0",
        "https://api.massive.com:70000",
        "https://api.massive.com:abc",
        "https://api.massive.com/v3",
        "https://api.massive.com//",
        "https://api.massive.com?x=1",
        "https://api.massive.com#f",
        "",
        " https://api.massive.com",
        "https://api.massive.com\x7f",
        "ftp://api.massive.com",
        "api.massive.com",
    ],
)
def test_non_qualifying_values_raise(monkeypatch: pytest.MonkeyPatch, value: str) -> None:
    """Only the three loopback hosts gain `http`; every other rejected row of
    the 2.2c table still raises, naming the variable and never the value (no
    clause text is asserted; Resolved Conflicts 2)."""
    _resolver(monkeypatch)
    message = _load_error(monkeypatch, value)
    assert _BASE_URL_VAR in message
    if value:
        assert value not in message


# --- TC-COMP-372 / DAC-E3-S7-6: one host under urlsplit and urllib3 ---------


def _strip_ip_literal_brackets(host: str) -> str:
    return host[1:-1] if host.startswith("[") and host.endswith("]") else host


# Implements TC-COMP-372
@pytest.mark.parametrize("value", _ACCEPTED)
def test_accepted_values_parse_to_the_same_host(value: str) -> None:
    """Specification review v7 FINDING-12 (b): the validator and the transport
    agree on the host that receives the credential. Compared as an address,
    one pair of IP-literal brackets removed (DEC-0046); building a pool opens
    no socket."""
    hostname = urllib.parse.urlsplit(value).hostname
    parsed = urllib3.util.parse_url(value).host
    assert parsed is not None
    assert hostname == _strip_ip_literal_brackets(parsed)
    assert hostname == urllib3.PoolManager().connection_from_url(value).host


# --- TC-COMP-373 / TC-COMP-374 / DAC-E3-S7-7: localhost must be loopback ----


# Implements TC-COMP-373
def test_localhost_resolving_to_non_loopback_refuses_start(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    _env(monkeypatch, base_url="http://localhost:8126")
    _resolver(monkeypatch, ("127.0.0.1", "192.0.2.10"))
    mocks = _patch_main_dependencies(monkeypatch)

    assert _start_entry_point() != 0
    assert not mocks["rest_client"].called
    assert not mocks["connect"].called
    assert not mocks["run_polling_loop"].called
    assert _BASE_URL_VAR in capsys.readouterr().err


# Implements TC-COMP-374
def test_localhost_resolving_only_to_loopback_starts(monkeypatch: pytest.MonkeyPatch) -> None:
    _env(monkeypatch, base_url="http://localhost:8126")
    _resolver(monkeypatch)
    mocks = _patch_main_dependencies(monkeypatch)

    assert _start_entry_point() == 0
    assert mocks["run_polling_loop"].call_count == 1


# --- TC-COMP-375 / TC-COMP-376 / DAC-E3-S7-8: test credential at start ------


# Implements TC-COMP-375
def test_generated_test_key_starts(monkeypatch: pytest.MonkeyPatch) -> None:
    _env(monkeypatch, base_url="http://127.0.0.1:8126")
    mocks = _patch_main_dependencies(monkeypatch)

    assert _start_entry_point() == 0
    assert mocks["run_polling_loop"].called


def _refused_keys() -> list[str]:
    return [
        "TEST-ONLY-" + secrets.token_hex(16)[:31],
        "TEST-ONLY-A" + secrets.token_hex(16).upper()[1:],
        "test-only-" + secrets.token_hex(16),
        generated_test_key() + "\n",
        "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32)),
    ]


# Implements TC-COMP-376
@pytest.mark.parametrize(
    "index",
    range(5),
    ids=["31-char-tail", "uppercase-tail", "lowercase-prefix", "trailing-newline", "random"],
)
def test_non_test_keys_refuse_start_without_echo(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    caplog: pytest.LogCaptureFixture,
    index: int,
) -> None:
    key = _refused_keys()[index]
    _env(monkeypatch, base_url="http://127.0.0.1:8126", key=key)
    mocks = _patch_main_dependencies(monkeypatch)

    assert _start_entry_point() != 0
    assert not mocks["rest_client"].called
    assert not mocks["connect"].called
    assert not mocks["run_polling_loop"].called
    err = capsys.readouterr().err
    assert _KEY_VAR in err
    for form in (key, key.strip()):
        assert form not in err
        assert all(form not in record.getMessage() for record in caplog.records)


# --- TC-COMP-377 / TC-COMP-378 / DAC-E3-S7-9: test credential at every claim


class _StopLoop(Exception):
    pass


def _patch_claim_path(monkeypatch: pytest.MonkeyPatch, new_key: str) -> MagicMock:
    import factorflow.ingestion_main as ingestion_main

    rest_client = MagicMock()
    monkeypatch.setattr("factorflow.ingestion.massive.client.RESTClient", rest_client)
    monkeypatch.setattr(ingestion_main.psycopg, "connect", MagicMock())
    monkeypatch.setattr(ingestion_main, "active_instrument_ids", lambda _conn: [1])
    monkeypatch.setattr(ingestion_main, "AcquisitionRunner", MagicMock())
    monkeypatch.setattr(ingestion_main, "configure_logging", lambda: None)
    calls = [0]

    def claim_next(_connection: Any, _runner_id: str) -> Any:
        calls[0] += 1
        if calls[0] == 1:
            return types.SimpleNamespace(run_id=1, history_depth_years=5)
        if calls[0] == 2:
            monkeypatch.setenv(_KEY_VAR, new_key)
            return types.SimpleNamespace(run_id=2, history_depth_years=5)
        raise _StopLoop

    monkeypatch.setattr(ingestion_main, "claim_next", claim_next)
    return rest_client


# Implements TC-COMP-377
def test_non_test_key_at_a_later_claim_ends_the_process(monkeypatch: pytest.MonkeyPatch) -> None:
    key1 = _env(monkeypatch, base_url="http://127.0.0.1:8126")
    new_key = "x" + secrets.token_hex(16)
    rest_client = _patch_claim_path(monkeypatch, new_key)

    with pytest.raises(ConfigurationError) as exc_info:
        runpy.run_path(str(E2E_MAIN), run_name="__main__")

    assert rest_client.call_count == 1
    assert rest_client.call_args.kwargs["api_key"] == key1
    assert all(call.kwargs["api_key"] != new_key for call in rest_client.call_args_list)
    exc = exc_info.value
    rendered = "".join(traceback.format_exception(exc))
    for text in (str(exc), rendered):
        assert _KEY_VAR in text
        assert new_key not in text


# Implements TC-COMP-378
def test_another_test_key_at_a_later_claim_rebuilds_the_client(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    key1 = _env(monkeypatch, base_url="http://127.0.0.1:8126")
    key2 = generated_test_key()
    rest_client = _patch_claim_path(monkeypatch, key2)

    with pytest.raises(_StopLoop):
        runpy.run_path(str(E2E_MAIN), run_name="__main__")

    assert [call.kwargs["api_key"] for call in rest_client.call_args_list] == [key1, key2]


# --- TC-COMP-379 / DAC-E3-S7-10: the client only through main() -------------


# Implements TC-COMP-379
def test_entry_point_calls_main_with_its_factory_and_reader(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """(a) The entry point calls `main` once, with exactly its own settings
    factory and credential reader. `runpy` re-executes the module, so they are
    compared by `__name__` and `__module__`."""
    import factorflow.ingestion_main as ingestion_main

    recorder = MagicMock(return_value=0)
    monkeypatch.setattr(ingestion_main, "main", recorder)

    assert _start_entry_point() == 0
    recorder.assert_called_once()
    assert recorder.call_args.args == ()
    kwargs = recorder.call_args.kwargs
    assert set(kwargs) == {"settings_factory", "credential_reader"}
    assert kwargs["settings_factory"].__name__ == "load_settings"
    assert kwargs["credential_reader"].__name__ == "read_test_credential"
    assert kwargs["settings_factory"].__module__ == "__main__"
    assert kwargs["credential_reader"].__module__ == "__main__"


_ALLOWED_IMPORT_ROOTS = {"pydantic", "pydantic_core"}
_ALLOWED_FACTORFLOW_MODULES = {"factorflow.config.settings", "factorflow.ingestion_main"}
_FORBIDDEN_NAMES = {"RESTClient", "PoolManager", "ProxyManager", "Retry"}
_FORBIDDEN_NAMES_ANY_CASE = {"retries", "redirect", "proxy"}


def _imported_modules(tree: ast.Module) -> list[str]:
    modules: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            modules.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            modules.append(node.module or "")
    return modules


# Implements TC-COMP-379
def test_entry_point_adds_no_transport_handling() -> None:
    """(b) The module imports only the standard library, pydantic and the two
    factorflow modules it needs; it names no client, pool, retry, redirect or
    proxy; and it ends with the `sys.exit(main(...))` launch (item 6)."""
    tree = ast.parse(E2E_MAIN.read_text(encoding="utf-8"))

    for module in _imported_modules(tree):
        root = module.split(".")[0]
        assert (
            root in sys.stdlib_module_names
            or root in _ALLOWED_IMPORT_ROOTS
            or module in _ALLOWED_FACTORFLOW_MODULES
        ), f"unexpected import {module!r}"

    names: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            names.append(node.id)
        elif isinstance(node, ast.Attribute):
            names.append(node.attr)
        elif isinstance(node, ast.keyword) and node.arg:
            names.append(node.arg)
        elif isinstance(node, ast.alias):
            names.append(node.asname or node.name.split(".")[-1])
    for name in names:
        assert name not in _FORBIDDEN_NAMES, name
        assert name.lower() not in _FORBIDDEN_NAMES_ANY_CASE, name

    last = tree.body[-1]
    assert isinstance(last, ast.If)
    assert isinstance(last.test, ast.Compare)
    assert isinstance(last.test.left, ast.Name) and last.test.left.id == "__name__"
    comparator = last.test.comparators[0]
    assert isinstance(comparator, ast.Constant) and comparator.value == "__main__"
    assert len(last.body) == 1
    statement = last.body[0]
    assert isinstance(statement, ast.Expr) and isinstance(statement.value, ast.Call)
    exit_call = statement.value
    assert ast.unparse(exit_call.func) == "sys.exit"
    assert len(exit_call.args) == 1 and isinstance(exit_call.args[0], ast.Call)
    main_call = exit_call.args[0]
    assert ast.unparse(main_call.func) == "main"
    assert main_call.args == []
    assert {keyword.arg for keyword in main_call.keywords} == {
        "settings_factory",
        "credential_reader",
    }


# --- TC-COMP-382 / DAC-E3-S7-13: nothing in the release reaches it ----------


def _is_docstring(node: ast.AST, parents: dict[ast.AST, ast.AST]) -> bool:
    parent = parents.get(node)
    owner = parents.get(parent) if parent is not None else None
    return (
        isinstance(parent, ast.Expr)
        and isinstance(owner, ast.Module | ast.ClassDef | ast.FunctionDef | ast.AsyncFunctionDef)
        and owner.body[0] is parent
    )


# Implements TC-COMP-382
def test_no_src_module_imports_or_names_the_entry_point() -> None:
    """(a) No module under `src/factorflow` imports `ingestion_e2e_main`, and
    no string constant other than a docstring names it, so it cannot be
    reached by a dynamic import either. Docstrings are excluded because
    `ingestion_main.main`'s docstring names its one caller (T013), and a
    docstring is never evaluated as a module name."""
    offenders: list[str] = []
    for path in sorted((REPO_ROOT / "src/factorflow").rglob("*.py")):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        rel = path.relative_to(REPO_ROOT)
        for module in _imported_modules(tree):
            if module.split(".")[-1] == "ingestion_e2e_main":
                offenders.append(f"{rel}: import {module}")
        for node in ast.walk(tree):
            if isinstance(node, ast.alias) and node.name.split(".")[-1] == "ingestion_e2e_main":
                offenders.append(f"{rel}: import {node.name}")
            if (
                isinstance(node, ast.Constant)
                and isinstance(node.value, str)
                and "ingestion_e2e_main" in node.value
                and not _is_docstring(node, parents)
            ):
                offenders.append(f"{rel}: string constant")
    assert offenders == []


# Implements TC-COMP-382
def test_dockerfile_copies_no_entry_point() -> None:
    """(b) No `COPY`/`ADD` source in the repository `Dockerfile` names the
    entry point. The wheel listing is T018's recorded verification."""
    lines = (REPO_ROOT / "Dockerfile").read_text(encoding="utf-8").replace("\\\n", " ").splitlines()
    sources: list[str] = []
    for line in lines:
        words = line.split()
        if words and words[0].upper() in {"COPY", "ADD"}:
            args = [word for word in words[1:] if not word.startswith("--")]
            sources.extend(args[:-1])
    assert sources, "the Dockerfile has no COPY or ADD instruction to check"
    assert all("ingestion_e2e_main" not in source for source in sources)


# --- Additional unit tests (T012) --------------------------------------------


# Implements TC-COMP-371
@pytest.mark.parametrize(
    ("value", "message"),
    [
        ("http://user@127.0.0.1:8126", f"{_BASE_URL_VAR}: must not carry userinfo"),
        ("http://127.0.0.1:0", f"{_BASE_URL_VAR}: port must be an integer from 1 to 65535"),
        ("http://127.0.0.1:70000", f"{_BASE_URL_VAR}: port must be an integer from 1 to 65535"),
        ("http://127.0.0.1:8126/v3", f"{_BASE_URL_VAR}: must not carry a path"),
        ("http://127.0.0.1:8126?x=1", f"{_BASE_URL_VAR}: must not carry a query or fragment"),
    ],
)
def test_loopback_http_still_applies_every_other_clause(
    monkeypatch: pytest.MonkeyPatch, value: str, message: str
) -> None:
    """Item 2: a loopback `http` value breaking any other clause raises with
    that clause's release message (the delegation to the release validator)."""
    _resolver(monkeypatch)
    assert _load_error(monkeypatch, value) == message


# Implements TC-COMP-371
@pytest.mark.parametrize("value", ["http://evil@127.0.0.1", "http://127.0.0.1@evil.example"])
def test_userinfo_around_a_loopback_host_raises(
    monkeypatch: pytest.MonkeyPatch, value: str
) -> None:
    _resolver(monkeypatch)
    message = _load_error(monkeypatch, value)
    assert _BASE_URL_VAR in message
    assert value not in message


# Implements TC-COMP-370
def test_loopback_trailing_slash_is_removed(monkeypatch: pytest.MonkeyPatch) -> None:
    """Clause 6 applies to a loopback `http` value too."""
    _env(monkeypatch, base_url="http://127.0.0.1:8126/")
    _resolver(monkeypatch)
    assert _load_entry_module().load_settings().massive.base_url == "http://127.0.0.1:8126"


# Implements TC-COMP-370
@pytest.mark.parametrize("value", ["https://api.massive.com", "https://stub.example:8443"])
def test_https_values_still_load_unchanged(monkeypatch: pytest.MonkeyPatch, value: str) -> None:
    _env(monkeypatch, base_url=value)
    _resolver(monkeypatch)
    assert _load_entry_module().load_settings().massive.base_url == value


# Implements TC-COMP-373
def test_unresolvable_localhost_refuses(monkeypatch: pytest.MonkeyPatch) -> None:
    """Item 2: start is refused unless every returned address is loopback, and
    an unresolvable name returns none."""

    def unresolvable(*_args: Any, **_kwargs: Any) -> Any:
        raise socket.gaierror("no such host")

    monkeypatch.setattr(socket, "getaddrinfo", unresolvable)
    assert _BASE_URL_VAR in _load_error(monkeypatch, "http://localhost:8126")


# Implements TC-COMP-375
def test_read_test_credential_accepts_a_generated_key(monkeypatch: pytest.MonkeyPatch) -> None:
    key = generated_test_key()
    monkeypatch.setenv(_KEY_VAR, key)
    result = _load_entry_module().read_test_credential()
    assert isinstance(result, SecretStr)
    assert result.get_secret_value() == key


# Implements TC-COMP-377
@pytest.mark.parametrize(
    "make_key",
    [lambda: secrets.token_hex(16), lambda: generated_test_key() + "\n"],
    ids=["no-prefix", "trailing-newline"],
)
def test_read_test_credential_refuses_a_non_test_key(
    monkeypatch: pytest.MonkeyPatch, make_key: Callable[[], str]
) -> None:
    key = make_key()
    monkeypatch.setenv(_KEY_VAR, key)
    with pytest.raises(ConfigurationError) as exc_info:
        _load_entry_module().read_test_credential()
    assert str(exc_info.value) == f"{_KEY_VAR}: must be a designated test credential"
