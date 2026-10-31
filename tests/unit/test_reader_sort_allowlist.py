"""The list's sort resolves through a fixed allowlist; no request text reaches SQL (CAP-002-E3-S2).

Proves DAC-E3-S2-5 (TC-COMP-121, the allowlist half) and SEC-INP-002 without a database:
a recording fake connection captures every statement the reader sends, and
``read_set_blocks`` is replaced so the list statement is the only one recorded.
"""

import re
from datetime import UTC, date, datetime
from decimal import Decimal
from pathlib import Path
from types import SimpleNamespace
from typing import Any
from uuid import UUID

import pytest

from factorflow.classification import reader

SQL_DIR = Path(reader.__file__).parent / "sql"
SET_ID = UUID("00000000-0000-4000-8000-000000000001")
SEVEN = (
    "symbol",
    "value_score",
    "growth_score",
    "momentum_score",
    "value_percentile",
    "growth_percentile",
    "momentum_percentile",
)


class RecordingCursor:
    """Records every ``execute``; answers with the one empty-page row the list returns."""

    def __init__(self, calls: list[tuple[str, Any]]) -> None:
        self._calls = calls
        self.description = [
            SimpleNamespace(name="match_count"),
            SimpleNamespace(name="instrument_id"),
        ]

    def __enter__(self) -> "RecordingCursor":
        return self

    def __exit__(self, *exc: object) -> None:
        return None

    def execute(self, query: str, params: Any = None) -> None:
        self._calls.append((query, params))

    def fetchall(self) -> list[tuple[Any, ...]]:
        return [(0, None)]


class RecordingConnection:
    def __init__(self) -> None:
        self.calls: list[tuple[str, Any]] = []

    def cursor(self) -> RecordingCursor:
        return RecordingCursor(self.calls)


def _current_set() -> reader.CurrentSet:
    at = datetime(2026, 10, 15, 22, 0, tzinfo=UTC)
    return reader.CurrentSet(
        set_id=SET_ID,
        classification_date=date(2026, 10, 15),
        run_id=UUID("00000000-0000-4000-8000-000000000002"),
        run_started_at=at,
        run_outcome="succeeded",
        state="complete",
        started_at=at,
        ended_at=at,
        latest_trading_day=date(2026, 10, 15),
        active_instruments=1,
        factors={},
        not_current=False,
    )


@pytest.fixture
def fake(monkeypatch: pytest.MonkeyPatch) -> RecordingConnection:
    monkeypatch.setattr(reader, "read_set_blocks", lambda conn: (_current_set(), None))
    return RecordingConnection()


# Implements TC-COMP-121
def test_allowlist_has_exactly_the_seven_sorts() -> None:
    """DAC-E3-S2-5: the seven sort keys of design 2.3, each a repository constant."""
    assert set(reader.SORT_ALLOWLIST) == set(SEVEN)
    assert len(set(reader.SORT_ALLOWLIST.values())) == 7
    for key, expression in reader.SORT_ALLOWLIST.items():
        assert expression == f"m.{key}"
        assert reader.resolve_sort(key) == expression


@pytest.mark.parametrize(
    "value",
    [
        "symbol;DROP TABLE instrument",
        "score",
        "value_score; --",
        "VALUE_SCORE",
        "",
        None,
        "symbol ",
        1,
    ],
)
# Implements TC-COMP-121
def test_a_sort_outside_the_allowlist_is_refused(value: object) -> None:
    """DAC-E3-S2-5: refused by the resolver and by the filter model alike."""
    with pytest.raises(ValueError):
        reader.resolve_sort(value)
    with pytest.raises(ValueError):
        reader.ListFilters(sort=value)  # type: ignore[arg-type]


# Implements TC-COMP-121
def test_a_bad_sort_is_refused_before_any_statement(fake: RecordingConnection) -> None:
    """DAC-E3-S2-5: a sort that bypassed the model is still refused before SQL is built."""
    filters = reader.ListFilters()
    object.__setattr__(filters, "sort", "symbol;DROP TABLE instrument")

    with pytest.raises(ValueError):
        reader.list_classifications(fake, filters)  # type: ignore[arg-type]

    assert fake.calls == []


@pytest.mark.parametrize("sort", SEVEN)
@pytest.mark.parametrize("order", ["asc", "desc"])
# Implements TC-COMP-121
def test_only_the_allowlisted_expression_is_substituted(
    fake: RecordingConnection, sort: str, order: str
) -> None:
    """SEC-INP-002: the statement is the shared template with this sort's constant and the
    order keyword; every request value travels as a bound parameter."""
    thresholds = reader.Thresholds(
        bounds={"value_score_min": Decimal("87.654321")}, hide_incomplete=True, symbol="ZQX"
    )
    page = reader.list_classifications(
        fake,  # type: ignore[arg-type]
        reader.ListFilters(sort=sort, order=order, thresholds=thresholds, limit=7),
    )

    assert page.stocks == [] and page.match_count == 0
    assert len(fake.calls) == 1
    statement, params = fake.calls[0]
    expression = reader.SORT_ALLOWLIST[sort]
    assert statement == reader.LIST_SQL.format(
        sort_expr=expression, order=order.upper(), keyset="true"
    )
    for other, other_expression in reader.SORT_ALLOWLIST.items():
        if other not in (sort, "symbol"):
            assert other_expression not in statement
    for value in ("87.654321", "ZQX", str(SET_ID)):
        assert value not in statement
    assert params["value_score_min"] == Decimal("87.654321")
    assert params["symbol_pattern"] == "ZQX%"
    assert params["set_id"] == SET_ID
    assert params["limit_plus_one"] == 8


def test_list_statement_placeholders_are_the_documented_ones() -> None:
    """SEC-INP-002: the only substitution slots are {sort_expr}, {order} and {keyset}; every
    other placeholder is a %(name)s bound parameter."""
    text = (SQL_DIR / "list_classifications.sql").read_text(encoding="utf-8")

    assert set(re.findall(r"\{[^}]*\}", text)) == {"{sort_expr}", "{order}", "{keyset}"}
    assert re.findall(r"%(?!\(\w+\)s)", text) == []
    assert "||" not in text
