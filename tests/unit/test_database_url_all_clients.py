"""Every database client confines its URL before connecting (CAP-001-E1-S8).

Component design: `component-design-runtime-config.md` section 2.3 ("Every
process that connects to the store loads its URL through `DatabaseSettings`")
and section 8 criterion 14; CONST-SEC 1.3 SEC-ENC-001 host-local loopback
exception, condition H7. The three clients are the migrator, the API's pool
and the ingestion process; each reaches its database call with a loopback
URL, and none opens a connection on a refused one (DAC-E1-19, DAC-E1-S8-8,
DAC-E1-S8-9).
"""

import ast
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from factorflow import ingestion_main
from factorflow.api import app as api_app
from factorflow.db import migrate_main
from tests.unit.massive_transport_fakes import generated_test_key

_VAR = "FACTORFLOW_DATABASE_URL"
_PASSWORD = "s3cretpw"
_LOOPBACK_URL = f"postgresql://u:{_PASSWORD}@127.0.0.1:5432/d"
_REFUSED_URL = f"postgresql://u:{_PASSWORD}@10.0.0.5/d"

SRC_PACKAGE = Path(__file__).resolve().parents[2] / "src" / "factorflow"


class _Reached(Exception):
    """Raised by a recording double to stop a client at its database call."""


@pytest.fixture(autouse=True)
def _environment(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("PGHOST", "PGHOSTADDR", "PGSERVICE", "PGSERVICEFILE"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", generated_test_key())
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")


def _fail_if_called(name: str) -> Any:
    def fail(*_args: Any, **_kwargs: Any) -> None:
        pytest.fail(f"{name} was called")

    return fail


# Implements TC-COMP-391
def test_all_three_clients_reach_their_database_call_on_a_loopback_url(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(_VAR, _LOOPBACK_URL)
    reached: dict[str, str] = {}

    def record_migrations(database_url: str, _migrations_dir: Path) -> tuple[int, str]:
        reached["migrator"] = database_url
        return 0, "schema current at version 4"

    def record_pool(*, conninfo: str, **_kwargs: Any) -> None:
        reached["api"] = conninfo
        raise _Reached

    def record_connect(conninfo: str, **_kwargs: Any) -> None:
        reached["ingestion"] = conninfo
        raise _Reached

    monkeypatch.setattr(migrate_main, "run_migrations", record_migrations)
    monkeypatch.setattr(api_app, "ConnectionPool", record_pool)
    monkeypatch.setattr(ingestion_main.psycopg, "connect", record_connect)

    assert migrate_main.main() == 0
    with pytest.raises(_Reached), TestClient(api_app.create_app()):
        pass
    with pytest.raises(_Reached):
        ingestion_main.main()

    assert reached == {"migrator": _LOOPBACK_URL, "api": _LOOPBACK_URL, "ingestion": _LOOPBACK_URL}


# Implements TC-COMP-421
def test_ingestion_exits_nonzero_on_a_refused_url_before_connecting(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    monkeypatch.setenv(_VAR, _REFUSED_URL)
    monkeypatch.setattr(ingestion_main.psycopg, "connect", _fail_if_called("psycopg.connect"))

    assert ingestion_main.main() != 0

    reported = capsys.readouterr().err
    assert _VAR in reported
    assert _REFUSED_URL not in reported
    assert _PASSWORD not in reported


# Implements TC-COMP-422
def test_api_startup_fails_on_a_refused_url_before_opening_a_pool(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(_VAR, _REFUSED_URL)
    monkeypatch.setattr(api_app, "ConnectionPool", _fail_if_called("ConnectionPool"))

    with pytest.raises(Exception) as excinfo, TestClient(api_app.create_app()):
        pass

    message = str(excinfo.value)
    assert _VAR in message
    assert _REFUSED_URL not in message
    assert _PASSWORD not in message


def _reads_of_database_url(tree: ast.AST) -> list[int]:
    """Line numbers of environment reads of the variable: `os.environ[...]`,
    `os.environ.get/pop(...)`, `os.getenv(...)`, or the same through a bare
    `environ` / `getenv` imported from `os`; the name given as a literal, a
    `key=` argument, a module constant holding it, or the canonical
    `_DATABASE_URL_VAR` constant, imported or referenced as an attribute."""
    names_holding_var = {"_DATABASE_URL_VAR"}
    environ_names: set[str] = set()
    getenv_names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Constant):
            if node.value.value == _VAR:
                names_holding_var |= {t.id for t in node.targets if isinstance(t, ast.Name)}
        elif isinstance(node, ast.ImportFrom):
            for alias in node.names:
                bound = alias.asname or alias.name
                if alias.name == "_DATABASE_URL_VAR":
                    names_holding_var.add(bound)
                elif node.module == "os" and alias.name == "environ":
                    environ_names.add(bound)
                elif node.module == "os" and alias.name == "getenv":
                    getenv_names.add(bound)

    def is_var(node: ast.AST | None) -> bool:
        return (
            (isinstance(node, ast.Constant) and node.value == _VAR)
            or (isinstance(node, ast.Name) and node.id in names_holding_var)
            or (isinstance(node, ast.Attribute) and node.attr == "_DATABASE_URL_VAR")
        )

    def is_environ(node: ast.AST) -> bool:
        return (isinstance(node, ast.Attribute) and node.attr == "environ") or (
            isinstance(node, ast.Name) and node.id in environ_names
        )

    def is_getenv(func: ast.AST) -> bool:
        return (isinstance(func, ast.Attribute) and func.attr == "getenv") or (
            isinstance(func, ast.Name) and func.id in getenv_names
        )

    lines = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Subscript) and is_environ(node.value) and is_var(node.slice):
            lines.append(node.lineno)
        elif isinstance(node, ast.Call):
            named = node.args[0] if node.args else None
            keyed = next((k.value for k in node.keywords if k.arg == "key"), None)
            if not (is_var(named) or is_var(keyed)):
                continue
            func = node.func
            if is_getenv(func) or (
                isinstance(func, ast.Attribute)
                and func.attr in ("get", "pop")
                and is_environ(func.value)
            ):
                lines.append(node.lineno)
    return lines


# Implements TC-COMP-423
def test_only_settings_reads_the_database_url_from_the_environment() -> None:
    readers = {
        str(path.relative_to(SRC_PACKAGE))
        for path in sorted(SRC_PACKAGE.rglob("*.py"))
        if _reads_of_database_url(ast.parse(path.read_text(), filename=str(path)))
    }
    assert readers <= {"config/settings.py"}


def test_the_source_scan_detects_each_read_form() -> None:
    """TC-COMP-423's scan is not vacuous."""
    for source in (
        f'import os\nos.environ.get("{_VAR}")',
        f'import os\nos.environ["{_VAR}"]',
        f'import os\nos.getenv("{_VAR}")',
        f'import os\nNAME = "{_VAR}"\nos.environ.get(NAME)',
        "import os\nfrom factorflow.config.settings import _DATABASE_URL_VAR\n"
        "os.environ.get(_DATABASE_URL_VAR)",
        "import os\nfrom factorflow.config.settings import _DATABASE_URL_VAR as V\nos.getenv(V)",
        "import os\nfrom factorflow.config import settings\nos.environ[settings._DATABASE_URL_VAR]",
        f'from os import environ\nenviron.get("{_VAR}")',
        f'from os import environ as env\nenv["{_VAR}"]',
        f'from os import getenv\ngetenv("{_VAR}")',
        f'import os\nos.environ.get(key="{_VAR}")',
    ):
        assert _reads_of_database_url(ast.parse(source)), source
