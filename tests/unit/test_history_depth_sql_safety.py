"""Unit test that write_history_depth never string-interpolates SQL."""

import ast
import inspect
import textwrap

from factorflow.instruments import settings


def _sql_argument_literals(source: str) -> list[str]:
    """String literals passed as the first argument to a `cursor.execute(...)` call.

    Walking the AST (rather than scanning raw text for `f"`/`.format(`) avoids
    false positives from f-strings used elsewhere in the function, such as a
    ValueError message, while still catching an interpolated SQL statement.
    """
    tree = ast.parse(textwrap.dedent(source))
    literals: list[str] = []
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "execute"
            and node.args
        ):
            first_arg = node.args[0]
            if isinstance(first_arg, ast.JoinedStr):
                raise AssertionError("cursor.execute() received an f-string (SQL injection risk)")
            if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
                literals.append(first_arg.value)
    return literals


def test_write_history_depth_uses_bound_parameters_not_string_interpolation() -> None:
    """The statement passed to cursor.execute() is a plain literal using %s placeholders.

    Mirrors the injection-prevention pattern component design section 4
    requires elsewhere in this component (SEC-INP-002): every statement uses
    psycopg 3 bound parameters, never a constructed string.
    """
    source = inspect.getsource(settings.write_history_depth)

    statements = _sql_argument_literals(source)

    assert statements, "expected write_history_depth to call cursor.execute()"
    for statement in statements:
        assert ".format(" not in statement
        assert "%s" in statement, "expected bound-parameter placeholders in the SQL statement"
