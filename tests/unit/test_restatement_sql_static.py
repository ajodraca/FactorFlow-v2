"""The restatement mark's static contract (CAP-002-E2-S6). No database.

``value_inputs.sql`` and ``growth_inputs.sql`` derive each input's ``restated_possible`` with
``bool_or`` over the ``backfilled`` flag ``statements.sql`` computes (DEC-0056, DEC-0122);
``classify.sql`` carries it from ``factor_input`` onto value and growth only, behind a factor
guard naming no other factor (DAC-E2-S6-2, DEC-0119, DEC-0122). Only the ``retired`` row set
keeps the constant ``false``, and no statement takes a parameter it did not take before this
story. Traces to AC-23, DAC-E2-S6-2, DEC-0119 and DEC-0122.
"""

import re
from pathlib import Path

import pytest

from factorflow.classification import constants

SQL_DIR = Path(constants.__file__).parent / "sql"

# Each statement's %(name)s placeholders as CAP-002-E2-S3 and CAP-002-E2-S5 delivered them,
# read before this story edited the files (T001).
PARAMETERS_BEFORE = {
    "value_inputs.sql": {
        "active_ids",
        "classification_date",
        "latest_trading_day",
        "line_item_keys",
        "line_item_names",
        "line_item_signs",
        "line_item_statement_types",
        "stale_months",
        "unresolved",
        "unresolved_cause",
    },
    "growth_inputs.sql": {
        "active_ids",
        "classification_date",
        "line_item_keys",
        "line_item_names",
        "line_item_signs",
        "stale_months",
        "unresolved",
        "unresolved_cause",
    },
    "classify.sql": {
        "active_ids",
        "factor",
        "input_labels",
        "input_names",
        "min_peer_set_size",
        "retired_ids",
        "set_id",
    },
}
GUARD = re.compile(r"%\(factor\)s(?:::text)?\s+IN\s*\(([^)]*)\)", re.IGNORECASE)


def statement(name: str) -> str:
    return (SQL_DIR / name).read_text()


def code(text: str) -> str:
    """``text`` without its ``--`` comments."""
    return re.sub(r"--[^\n]*", "", text)


def top_level(text: str, pattern: str) -> list[re.Match[str]]:
    """The matches of ``pattern`` in ``text`` outside parentheses and string literals."""
    found, depth, quoted = [], 0, False
    for match in re.finditer(rf"'|\(|\)|{pattern}", text, re.IGNORECASE):
        token = match.group(0)
        if token == "'":
            quoted = not quoted
        elif quoted:
            continue
        elif token == "(":
            depth += 1
        elif token == ")":
            depth -= 1
        elif depth == 0:
            found.append(match)
    return found


def top_level_split(text: str, separator: str) -> list[str]:
    """``text`` split on ``separator`` outside parentheses and string literals."""
    parts, start = [], 0
    for match in top_level(text, separator):
        parts.append(text[start : match.start()])
        start = match.end()
    parts.append(text[start:])
    return [part.strip() for part in parts]


def select_list(select: str) -> list[str]:
    """The items of a ``SELECT ... FROM`` at the top level, in order."""
    body = top_level_split(select, r"\bFROM\b")[0]
    body = re.sub(r"^\s*SELECT\b", "", body, flags=re.IGNORECASE)
    return top_level_split(body, ",")


def inserted_columns(text: str) -> list[str]:
    match = re.search(r"INSERT\s+INTO\s+\w+\s*\(([^)]*)\)", text, re.IGNORECASE)
    assert match is not None
    return [column.strip() for column in match.group(1).split(",")]


def final_select(text: str) -> str:
    """The statement's outermost query: from its first top-level ``SELECT`` to the end."""
    first = top_level(text, r"\bSELECT\b")[0]
    return text[first.start() :]


def restated_expressions(name: str) -> list[str]:
    """The expression each row set of the statement writes as ``restated_possible``."""
    text = code(statement(name))
    if name == "value_inputs.sql":
        items = select_list(final_select(text))
        aliased = [i for i in items if re.search(r"\bAS\s+restated_possible$", i, re.I)]
        return [re.sub(r"\s+AS\s+restated_possible$", "", i, flags=re.I) for i in aliased]
    position = inserted_columns(text).index("restated_possible")
    row_sets = top_level_split(final_select(text), r"\bUNION\s+ALL\b")
    return [select_list(row_set)[position] for row_set in row_sets]


def is_constant_false(expression: str) -> bool:
    return expression.strip().lower() == "false"


def parameters(text: str) -> set[str]:
    return set(re.findall(r"%\((\w+)\)s", text))


# --- the rules can fail -----------------------------------------------------------------


def test_the_split_ignores_separators_inside_parentheses_and_literals() -> None:
    """DEC-0122: the row-set detectors split only at the top level."""
    assert top_level_split("a, f(b, c), 'd, e', g", ",") == ["a", "f(b, c)", "'d, e'", "g"]


def test_a_constant_false_row_set_is_found() -> None:
    """DEC-0122: a row set still writing the constant false is seen, by position."""
    text = (
        "INSERT INTO t (a, restated_possible) "
        "SELECT 1, coalesce(m.restated, false) FROM x UNION ALL SELECT 2, false FROM y"
    )
    position = inserted_columns(text).index("restated_possible")
    row_sets = top_level_split(final_select(text), r"\bUNION\s+ALL\b")
    found = [select_list(r)[position] for r in row_sets]
    assert [is_constant_false(e) for e in found] == [False, True]


def test_a_guard_with_another_factor_is_found() -> None:
    """DAC-E2-S6-2: the guard's factor literals are read."""
    match = GUARD.search("x AND %(factor)s::text IN ('value', 'momentum')")
    assert match is not None
    assert re.findall(r"'(\w+)'", match.group(1)) == ["value", "momentum"]


# --- the statements obey them -----------------------------------------------------------


@pytest.mark.parametrize("name", ["value_inputs.sql", "growth_inputs.sql"])
def test_input_marks_are_bool_or_over_the_backfilled_flag(name: str) -> None:
    """DEC-0056, DEC-0122: an input is marked when any statement row it lists is backfilled."""
    assert re.search(r"\bbool_or\s*\(\s*(?:\w+\.)?backfilled\s*\)", code(statement(name)))


@pytest.mark.parametrize("name", ["value_inputs.sql", "growth_inputs.sql"])
def test_no_input_row_writes_a_constant_mark(name: str) -> None:
    """AC-23: the constant false CAP-002-E2-S3 wrote until this story is gone."""
    expressions = restated_expressions(name)
    assert expressions
    assert [e for e in expressions if is_constant_false(e)] == []


def test_classify_reads_the_mark_from_factor_input_with_bool_or() -> None:
    """DEC-0119, DEC-0122: the classification's mark is any of its committed inputs' marks."""
    text = code(statement("classify.sql"))
    assert re.search(r"\bbool_or\s*\(\s*(?:\w+\.)?restated_possible\s*\)", text)
    marks = re.search(r"\bmarks\s+AS\s*\((.*?)\n\)", text, re.IGNORECASE | re.DOTALL)
    assert marks is not None
    assert re.search(r"\bFROM\s+factor_input\b", marks.group(1), re.IGNORECASE)


def test_classify_guard_names_only_value_and_growth() -> None:
    """DAC-E2-S6-2, DEC-0122: one factor guard, naming value and growth, never momentum."""
    text = code(statement("classify.sql"))
    guards = GUARD.findall(text)
    assert len(guards) == 1
    literals = re.findall(r"'(\w+)'", guards[0])
    assert sorted(literals) == ["growth", "value"]
    assert set(literals) <= set(constants.FACTORS)
    assert "'momentum'" not in text


def test_only_the_retired_row_set_writes_a_constant_false() -> None:
    """DEC-0122: the three active-stock row sets carry the mark; retired rows are false."""
    expressions = restated_expressions("classify.sql")
    assert len(expressions) == 4
    assert [is_constant_false(e) for e in expressions] == [False, False, False, True]
    retired = top_level_split(final_select(code(statement("classify.sql"))), r"\bUNION\s+ALL\b")
    assert "'retired'" in retired[-1]


@pytest.mark.parametrize("name", sorted(PARAMETERS_BEFORE))
def test_no_new_parameter(name: str) -> None:
    """DEC-0119: the mark is derived from data the statements already read."""
    assert parameters(statement(name)) <= PARAMETERS_BEFORE[name]
