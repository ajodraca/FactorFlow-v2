"""Static guards: the data-health-reader reads only (CAP-003-E2-S1).

- TC-COMP-039 (DAC-E2-S1-1): ``queries.py`` and ``reader.py`` hold no write or
  DDL token, scanned over the whole text, comments and docstrings included.
- TC-COMP-042, static half (DAC-E2-S1-4): every statement constant is one
  ``SELECT``/``WITH`` read with bound parameters only (SEC-INP-002).
"""

import re
from pathlib import Path

import pytest

from factorflow.data_health import queries, reader

WRITE_TOKENS = ("INSERT", "UPDATE", "DELETE", "TRUNCATE", "ALTER", "DROP")
_WRITE_PATTERN = re.compile(r"\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP)\b", re.IGNORECASE)
_UNBOUND_PERCENT = re.compile(r"%(?!\([a-z_]+\)s)")
_LIMIT_BOUND = re.compile(r"LIMIT\s+%\(limit_plus_one\)s")
_SUBQUERY_ORDERED_BEFORE_LIMIT = re.compile(
    r"SELECT DISTINCT i2\.symbol.*?ORDER BY i2\.symbol\s+LIMIT\s+%\(limit_plus_one\)s", re.DOTALL
)
_FIRST_KEYWORD = re.compile(r"\s*(\w+)")

SOURCES = {
    "queries.py": Path(queries.__file__),
    "reader.py": Path(reader.__file__),
}


def write_tokens(text: str) -> list[str]:
    """Every write or DDL token in text, in source order, upper-cased."""
    return [match.group(1).upper() for match in _WRITE_PATTERN.finditer(text)]


def _statements() -> dict[str, str]:
    return {
        name: value
        for name, value in vars(queries).items()
        if name.endswith("_SQL") and isinstance(value, str)
    }


# Implements TC-COMP-039
@pytest.mark.parametrize("name", sorted(SOURCES))
def test_sources_hold_no_write_or_ddl_token(name: str) -> None:
    found = write_tokens(SOURCES[name].read_text(encoding="utf-8"))

    assert found == [], f"{name} holds write tokens: {found}"


# Implements TC-COMP-039
@pytest.mark.parametrize("token", WRITE_TOKENS)
def test_guard_finds_a_planted_token(token: str) -> None:
    assert write_tokens(f"SELECT 1 FROM instrument; {token} x") == [token]


# Implements TC-COMP-039
def test_guard_scans_comments_and_respects_word_boundaries() -> None:
    assert write_tokens("SELECT 1 -- update in a comment") == ["UPDATE"]
    assert write_tokens('"""Never drops a row."""') == []
    assert write_tokens("updated_at, alternatively") == []


# Implements TC-COMP-042
def test_statement_constants_exist() -> None:
    assert {"PROBLEM_ROWS_SQL", "PROBLEM_COUNT_SQL"} <= set(_statements())


# Implements TC-COMP-042
@pytest.mark.parametrize("name", sorted(_statements()))
def test_statements_are_bound_selects(name: str) -> None:
    text = _statements()[name]
    first = _FIRST_KEYWORD.match(text)

    assert "{" not in text.replace("'{}'", ""), f"{name} interpolates"
    assert _UNBOUND_PERCENT.search(text) is None, f"{name} holds an unbound percent"
    assert first is not None
    assert first.group(1).upper() in {"SELECT", "WITH"}, f"{name} is not a read"


# Implements TC-COMP-042
def test_problem_rows_binds_cursor_and_limit() -> None:
    text = queries.PROBLEM_ROWS_SQL

    assert "%(cursor)s" in text
    assert _LIMIT_BOUND.search(text) is not None


# Implements TC-COMP-040
def test_problem_rows_subquery_orders_symbols_before_the_limit() -> None:
    assert _SUBQUERY_ORDERED_BEFORE_LIMIT.search(queries.PROBLEM_ROWS_SQL) is not None
