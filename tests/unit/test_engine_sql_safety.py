"""The classification package is isolated from ingestion and append-only (CAP-002-E2-S2).

Satisfies AC-19, DAC-E2-S2-6 and TC-COMP-160 in two scopes. The package-wide rules cover
every file under ``classification/``, which the scheduler and reader share. The engine-only
rules cover the factor-engine design 2.1 file set, each file checked when it exists, so a
later story adds its files without editing this test.
"""

import ast
import re
from pathlib import Path

import pytest

from tests.unit.test_sql_is_append_only import prohibited_observation_mutations

PACKAGE = Path(__file__).resolve().parents[2] / "src" / "factorflow" / "classification"

_ENGINE_MODULES = ("engine.py", "line_items.py", "constants.py")
_ENGINE_SQL_FILES = (
    "set_context.sql",
    "statements.sql",
    "value_inputs.sql",
    "growth_inputs.sql",
    "momentum_inputs.sql",
    "insert_inputs.sql",
    "peer_sets.sql",
    "classify.sql",
    "complete_set.sql",
    "fail_set.sql",
)
_GUARDED_FILES = ("complete_set.sql", "fail_set.sql")

_CLASSIFICATION_MUTATION = re.compile(
    r"\b(?:UPDATE|DELETE\s+FROM)\s+(?:classification_set_factor|factor_input|"
    r"factor_classification|universe_event)\b",
    re.IGNORECASE,
)
_UPDATE_SET = re.compile(r"UPDATE\s+classification_set\b(?!_)[^;]*", re.IGNORECASE)


def ingestion_imports(source: str) -> list[str]:
    found: list[str] = []
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, ast.Import):
            found += [
                a.name
                for a in node.names
                if a.name == "factorflow.ingestion.massive"
                or a.name.startswith("factorflow.ingestion.massive.")
            ]
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            if module == "factorflow.ingestion.massive" or module.startswith(
                "factorflow.ingestion.massive."
            ):
                found.append(module)
            elif module == "factorflow.ingestion" and any(a.name == "massive" for a in node.names):
                found.append("factorflow.ingestion.massive")
    return found


def built_executes(source: str) -> list[str]:
    """First arguments to ``.execute(`` that are an f-string, a ``%`` or a ``+`` expression."""
    found: list[str] = []
    for node in ast.walk(ast.parse(source)):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "execute"
            and node.args
        ):
            first = node.args[0]
            if isinstance(first, ast.JoinedStr) or (
                isinstance(first, ast.BinOp) and isinstance(first.op, ast.Mod | ast.Add)
            ):
                found.append(ast.unparse(first))
    return found


def format_executes(source: str) -> list[str]:
    """First arguments to ``.execute(`` that are a ``.format(`` call."""
    found: list[str] = []
    for node in ast.walk(ast.parse(source)):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "execute"
            and node.args
        ):
            first = node.args[0]
            if (
                isinstance(first, ast.Call)
                and isinstance(first.func, ast.Attribute)
                and first.func.attr == "format"
            ):
                found.append(ast.unparse(first))
    return found


def history_mutations(text: str) -> list[str]:
    return [
        *prohibited_observation_mutations(text),
        *(m.group(0) for m in _CLASSIFICATION_MUTATION.finditer(text)),
    ]


def unguarded_set_updates(text: str) -> list[str]:
    return [
        m.group(0) for m in _UPDATE_SET.finditer(text) if "state = 'building'" not in m.group(0)
    ]


def engine_sql_violations(text: str) -> list[str]:
    problems: list[str] = []
    if re.search(r"\{[^}]*\}", text):
        problems.append("brace placeholder")
    if "||" in text:
        problems.append("concatenation")
    if re.search(r"%(?!\(\w+\)s)", text):
        problems.append("placeholder other than %(name)s")
    return problems


def package_files(*suffixes: str) -> list[Path]:
    return sorted(p for p in PACKAGE.rglob("*") if p.is_file() and p.suffix in suffixes)


# --- the rules can fail -----------------------------------------------------------------


@pytest.mark.parametrize(
    "source",
    [
        "import factorflow.ingestion.massive.client",
        "from factorflow.ingestion.massive import client",
        "from factorflow.ingestion import massive",
    ],
)
def test_ingestion_import_is_detected(source: str) -> None:
    assert ingestion_imports(source)


def test_other_ingestion_imports_are_allowed() -> None:
    assert not ingestion_imports("from factorflow.ingestion import runner")


@pytest.mark.parametrize(
    "source",
    ['cur.execute(f"SELECT {x}")', 'cur.execute("SELECT %s" % x)', 'cur.execute("A" + x)'],
)
def test_built_execute_is_detected(source: str) -> None:
    assert built_executes(source)


def test_constant_execute_is_allowed() -> None:
    assert not built_executes("cur.execute(SQL, {'a': 1})")


def test_format_execute_is_detected() -> None:
    assert format_executes('cur.execute("SELECT {a}".format(a=1))')
    assert not format_executes("cur.execute(SQL)")


@pytest.mark.parametrize(
    "text",
    [
        "DELETE FROM factor_input WHERE set_id = %(set_id)s",
        "UPDATE factor_classification SET score = 1",
        "UPDATE universe_event SET kind = 'x'",
        "DELETE FROM daily_bar",
    ],
)
def test_history_mutation_is_detected(text: str) -> None:
    assert history_mutations(text)


def test_unguarded_set_update_is_detected_and_guarded_ones_allowed() -> None:
    assert unguarded_set_updates("UPDATE classification_set SET state = 'complete'")
    guarded = (
        "UPDATE classification_set SET state = 'complete', ended_at = now() "
        "WHERE set_id = %(set_id)s AND state = 'building'"
    )
    reclaim = (
        "UPDATE classification_set SET state = 'failed', ended_at = now(), failure_reason = "
        "'interrupted: the application restarted during the build' WHERE state = 'building' "
        "RETURNING set_id, run_id"
    )
    assert not unguarded_set_updates(guarded)
    assert not unguarded_set_updates(reclaim)
    assert not history_mutations(guarded)
    assert not history_mutations(reclaim)


@pytest.mark.parametrize(
    "text", ["ORDER BY {sort_expr}", "SELECT 'a' || b", "WHERE a = %s", "WHERE a = 5 % 2"]
)
def test_engine_sql_violation_is_detected(text: str) -> None:
    assert engine_sql_violations(text)


def test_named_placeholders_are_allowed() -> None:
    assert not engine_sql_violations("WHERE set_id = %(set_id)s")


# --- the package obeys them -------------------------------------------------------------


# Implements TC-COMP-160
def test_no_package_module_imports_the_ingestion_client() -> None:
    assert {p.name: ingestion_imports(p.read_text()) for p in package_files(".py")} == {
        p.name: [] for p in package_files(".py")
    }


# Implements TC-COMP-160
def test_no_package_statement_is_built_by_interpolation() -> None:
    for path in package_files(".py"):
        assert built_executes(path.read_text()) == [], path.name


# Implements TC-COMP-160
def test_package_never_mutates_history_or_observation_tables() -> None:
    for path in package_files(".py", ".sql"):
        assert history_mutations(path.read_text()) == [], path.name


# Implements TC-COMP-160
def test_every_classification_set_update_is_guarded_by_building() -> None:
    for path in package_files(".py", ".sql"):
        assert unguarded_set_updates(path.read_text()) == [], path.name


def test_terminal_statements_are_guarded_by_set_id() -> None:
    for name in _GUARDED_FILES:
        path = PACKAGE / "sql" / name
        if path.exists():
            assert "set_id = %(set_id)s" in path.read_text(), name


def test_engine_modules_do_not_format_statements() -> None:
    for name in _ENGINE_MODULES:
        path = PACKAGE / name
        if path.exists():
            assert format_executes(path.read_text()) == [], name


def test_engine_sql_files_use_named_parameters_only() -> None:
    for name in _ENGINE_SQL_FILES:
        path = PACKAGE / "sql" / name
        if path.exists():
            assert engine_sql_violations(path.read_text()) == [], name
