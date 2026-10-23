"""Every universe statement is parameterised, append-only and loaded once at import.

Design section 4 (SEC-INP-002) requires this module to assert that every
``.sql`` file and every SQL string in ``src/factorflow/universes/`` uses
placeholders only. The scan discovers statements rather than listing them, so
CAP-002-E1-S3, S4 and S5 add theirs by writing them. Satisfies DAC-E1-S2-5,
DAC-E1-10.
"""

import ast
import re
from pathlib import Path
from typing import TypeGuard

import pytest

from factorflow.universes import replay
from tests.unit.test_research_sql_is_append_only import prohibited_research_mutations

UNIVERSES_DIR = Path(__file__).resolve().parents[2] / "src" / "factorflow" / "universes"
SQL_DIR = UNIVERSES_DIR / "sql"
UNNAMED_PLACEHOLDER = re.compile(r"%(?!\(\w+\)s)")
LOCK_STATEMENT = "SELECT pg_advisory_xact_lock(%s)"
EXECUTE_NAMES = frozenset({"execute", "executemany"})


def _sql_files() -> list[Path]:
    return sorted(SQL_DIR.glob("*.sql"))


def _python_files() -> list[Path]:
    return sorted(UNIVERSES_DIR.glob("*.py"))


def sql_strings_held_in_python(source: str) -> list[str]:
    """Module-level ``*_SQL`` string constants and literal first arguments of execute calls."""
    tree = ast.parse(source)
    found: list[str] = []
    for node in tree.body:
        target: ast.expr | None = None
        value: ast.expr | None = None
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            target, value = node.targets[0], node.value
        elif isinstance(node, ast.AnnAssign):
            target, value = node.target, node.value
        if (
            isinstance(target, ast.Name)
            and target.id.endswith("_SQL")
            and isinstance(value, ast.Constant)
            and isinstance(value.value, str)
        ):
            found.append(value.value)
    for call in ast.walk(tree):
        if _is_execute_call(call) and call.args:
            first = call.args[0]
            if isinstance(first, ast.Constant) and isinstance(first.value, str):
                found.append(first.value)
    return found


def _is_execute_call(node: ast.AST) -> TypeGuard[ast.Call]:
    return (
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr in EXECUTE_NAMES
    )


def statement_problems(text: str) -> list[str]:
    """Why a SQL text is not an allowed universe statement; empty when it is."""
    problems = [f"mutation: {m}" for m in prohibited_research_mutations(text)]
    if text.strip() != LOCK_STATEMENT and UNNAMED_PLACEHOLDER.search(text):
        problems.append("a % that does not start a named placeholder %(name)s")
    return problems


def interpolation_problems(source: str) -> list[str]:
    """Execute calls built by interpolation, and ``read_text`` outside module level."""
    tree = ast.parse(source)
    problems: list[str] = []
    for call in ast.walk(tree):
        if _is_execute_call(call) and call.args:
            first = call.args[0]
            if isinstance(first, ast.JoinedStr):
                problems.append("execute() receives an f-string")
            elif (
                isinstance(first, ast.Call)
                and isinstance(first.func, ast.Attribute)
                and first.func.attr == "format"
            ):
                problems.append("execute() receives a .format() call")
            elif isinstance(first, ast.BinOp):
                problems.append("execute() receives a computed expression")
    for scope in ast.walk(tree):
        if isinstance(scope, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
            for inner in ast.walk(scope):
                if (
                    isinstance(inner, ast.Call)
                    and isinstance(inner.func, ast.Attribute)
                    and inner.func.attr == "read_text"
                ):
                    problems.append("read_text() is called inside a function or class body")
    return problems


def module_level_read_text_targets(source: str) -> list[str]:
    """The ``*.sql`` names a module reads at import via ``(<dir> / "name.sql").read_text()``."""
    tree = ast.parse(source)
    names: list[str] = []
    for node in tree.body:
        for inner in ast.walk(node):
            if (
                isinstance(inner, ast.Call)
                and isinstance(inner.func, ast.Attribute)
                and inner.func.attr == "read_text"
            ):
                names.extend(
                    c.value
                    for c in ast.walk(inner.func.value)
                    if isinstance(c, ast.Constant) and isinstance(c.value, str)
                )
    return names


# Implements TC-COMP-052
def test_there_are_universe_sql_files_to_scan() -> None:
    assert _sql_files(), (
        "no *.sql under src/factorflow/universes/sql/: the scan would pass vacuously"
    )


# Implements TC-COMP-052
@pytest.mark.parametrize("path", _sql_files() or [SQL_DIR / "missing.sql"], ids=lambda p: p.name)
def test_every_sql_file_is_append_only_and_uses_named_placeholders_only(path: Path) -> None:
    assert statement_problems(path.read_text()) == []


# Implements TC-COMP-052
@pytest.mark.parametrize("path", _python_files(), ids=lambda p: p.name)
def test_every_sql_string_held_in_python_is_append_only_and_named(path: Path) -> None:
    for text in sql_strings_held_in_python(path.read_text()):
        assert statement_problems(text) == [], text


# Implements TC-COMP-052
@pytest.mark.parametrize("path", _python_files(), ids=lambda p: p.name)
def test_no_module_interpolates_sql_or_reads_a_file_after_import(path: Path) -> None:
    assert interpolation_problems(path.read_text()) == []


# Implements TC-COMP-052
def test_every_sql_file_is_read_by_exactly_one_module_level_read_text() -> None:
    reads: list[str] = []
    for path in _python_files():
        reads.extend(module_level_read_text_targets(path.read_text()))
    for sql_file in _sql_files():
        assert reads.count(sql_file.name) == 1, sql_file.name


# Implements TC-COMP-052
def test_the_membership_statement_is_importable_and_equals_its_file() -> None:
    assert isinstance(replay.MEMBERSHIP_AS_OF_SQL, str)
    assert replay.MEMBERSHIP_AS_OF_SQL == (SQL_DIR / "membership_as_of.sql").read_text()


# Implements TC-COMP-052
@pytest.mark.parametrize(
    ("source", "expected"),
    (
        ('def f(c, n):\n    c.execute(f"SELECT {n}")\n', "execute() receives an f-string"),
        (
            'def f(c, n):\n    c.execute("SELECT {}".format(n))\n',
            "execute() receives a .format() call",
        ),
        (
            'def f(c, n):\n    c.execute("SELECT %s" % n)\n',
            "execute() receives a computed expression",
        ),
        (
            'def f(c, n):\n    c.execute("SELECT " + n)\n',
            "execute() receives a computed expression",
        ),
        ('def f(c, n):\n    c.executemany(f"SELECT {n}", [])\n', "execute() receives an f-string"),
        (
            "def f(p):\n    return p.read_text()\n",
            "read_text() is called inside a function or class body",
        ),
        (
            "class C:\n    SQL = P.read_text()\n",
            "read_text() is called inside a function or class body",
        ),
    ),
)
def test_the_interpolation_scan_fires(source: str, expected: str) -> None:
    assert expected in interpolation_problems(source)


# Implements TC-COMP-052
def test_the_interpolation_scan_passes_a_clean_module() -> None:
    clean = 'Q = (D / "q.sql").read_text()\ndef f(c):\n    c.execute(Q, {"a": 1})\n'

    assert interpolation_problems(clean) == []


# Implements TC-COMP-052
@pytest.mark.parametrize(
    "text",
    (
        "UPDATE universe_event SET name = %(n)s",
        "DELETE FROM universe WHERE universe_id = %(u)s",
        "SELECT 1 WHERE a = %s",
        "SELECT %d",
        "SELECT '100%'",
    ),
)
def test_the_statement_scan_fires(text: str) -> None:
    assert statement_problems(text) != []


# Implements TC-COMP-052
def test_the_statement_scan_allows_named_placeholders_and_the_advisory_lock_only() -> None:
    assert statement_problems("SELECT 1 WHERE a = %(a)s AND b = %(b_2)s") == []
    assert statement_problems(LOCK_STATEMENT) == []
    assert statement_problems("  " + LOCK_STATEMENT + "\n") == []
    assert statement_problems("SELECT pg_advisory_xact_lock(%s), %s") != []


# Implements TC-COMP-052
def test_the_python_string_scan_collects_constants_and_literal_execute_arguments() -> None:
    source = (
        '_X_SQL = "SELECT 1 WHERE a = %s"\n'
        '_Y_SQL: str = "SELECT %d"\n'
        '_Z_SQL = "UPDATE universe_event SET name = %(n)s"\n'
        '_LOCK_SQL = "SELECT pg_advisory_xact_lock(%s)"\n'
        "_FILE_SQL = (D / 'f.sql').read_text()\n"
        "OTHER = 'SELECT %s'\n"
        "def f(c):\n"
        '    c.execute("SELECT %s", (1,))\n'
        '    c.executemany("SELECT %(a)s", [])\n'
    )

    found = sql_strings_held_in_python(source)

    assert "SELECT 1 WHERE a = %s" in found
    assert "SELECT %d" in found
    assert "UPDATE universe_event SET name = %(n)s" in found
    assert LOCK_STATEMENT in found
    assert "SELECT %s" in found and "SELECT %(a)s" in found
    assert len(found) == 6
    flagged = [text for text in found if statement_problems(text)]
    assert LOCK_STATEMENT not in flagged
    assert len(flagged) == 4


# Implements TC-COMP-052
def test_the_read_text_scan_names_the_files_a_module_loads_at_import() -> None:
    source = (
        '_A = (_SQL_DIR / "a.sql").read_text()\n'
        '_B: Final = (_SQL_DIR / "b.sql").read_text()\n'
        "def f():\n"
        "    return 1\n"
    )

    assert sorted(module_level_read_text_targets(source)) == ["a.sql", "b.sql"]
