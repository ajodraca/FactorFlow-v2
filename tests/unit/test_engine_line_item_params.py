"""The line-item parameters the fundamentals stage binds (CAP-002-E2-S3).

Traces to AC-7 and SEC-INP-002: payload keys reach SQL as bound parameters, never
interpolated, and the ``REQUIRES_INPUT`` sentinel never reaches SQL at all.
"""

from typing import Any

import pytest

from factorflow.classification import engine, line_items
from factorflow.classification.line_items import (
    LINE_ITEMS,
    REQUIRES_INPUT,
    UNRESOLVED_CAUSE,
    LineItem,
)

NAMES = list(LINE_ITEMS)


def by_name(params: dict[str, Any]) -> dict[str, tuple[str, str | None, int]]:
    return {
        name: (statement_type, key, sign)
        for name, statement_type, key, sign in zip(
            params["line_item_names"],
            params["line_item_statement_types"],
            params["line_item_keys"],
            params["line_item_signs"],
            strict=True,
        )
    }


def strings(value: object) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        return [s for v in value.values() for s in strings(v)]
    if isinstance(value, list | tuple):
        return [s for v in value for s in strings(v)]
    return []


def test_real_line_items_bind_every_key_and_none_is_unresolved() -> None:
    """Design 2.4, DEC-0295: every line item is bound with its Massive key and sign."""
    params = engine._line_item_parameters()

    assert params["line_item_names"] == NAMES
    assert by_name(params) == {
        name: (item.statement_type, item.payload_key, item.sign)
        for name, item in LINE_ITEMS.items()
    }
    assert params["line_item_magnitudes"] == [item.magnitude for item in LINE_ITEMS.values()]
    assert params["line_item_less_keys"] == [item.less_key for item in LINE_ITEMS.values()]
    assert params["unresolved"] == []
    assert params["unresolved_cause"] == UNRESOLVED_CAUSE


def test_dec_0295_binds_shares_capex_and_book_equity() -> None:
    """DEC-0295: shares from the income statement, capex by magnitude, book equity less
    preferred stock."""
    assert LINE_ITEMS["shares_outstanding"].statement_type == "income_statement"
    assert LINE_ITEMS["shares_outstanding"].payload_key == "diluted_shares_outstanding"
    assert LINE_ITEMS["capital_expenditure"].magnitude is True
    assert LINE_ITEMS["book_equity"].less_key == "preferred_stock"


def test_an_unresolved_item_is_bound_as_none(monkeypatch: pytest.MonkeyPatch) -> None:
    """Design 2.4, AC-12: an item set back to REQUIRES_INPUT is bound as None and named
    unresolved, read from line_items.LINE_ITEMS at call time; the rest keep their keys."""
    item = LINE_ITEMS["capital_expenditure"]
    monkeypatch.setitem(
        line_items.LINE_ITEMS,
        "capital_expenditure",
        LineItem(item.label, item.statement_type, REQUIRES_INPUT, -1),
    )

    resolved = by_name(engine._line_item_parameters())

    assert resolved["capital_expenditure"] == ("cash_flow_statement", None, -1)
    assert resolved["revenue"] == ("income_statement", "revenue", 1)
    assert engine._line_item_parameters()["unresolved"] == ["capital_expenditure"]


def test_a_replaced_mapping_is_read_at_call_time(monkeypatch: pytest.MonkeyPatch) -> None:
    """T016: the module attribute is read at call time, never a name imported into engine."""
    replaced = {
        name: LineItem(item.label, item.statement_type, f"k_{name}", item.sign)
        for name, item in LINE_ITEMS.items()
    }
    monkeypatch.setattr(line_items, "LINE_ITEMS", replaced)

    params = engine._line_item_parameters()

    assert params["line_item_keys"] == [f"k_{name}" for name in NAMES]
    assert params["unresolved"] == []


def test_the_sentinel_never_appears_in_the_parameters() -> None:
    """SEC-INP-002, design 2.4: the REQUIRES_INPUT sentinel never reaches SQL."""
    assert REQUIRES_INPUT not in strings(engine._line_item_parameters())


def test_the_fundamentals_stage_is_registered_once() -> None:
    """T016, DEC-0121: the stage is in the build's stage list, once; CAP-002-E2-S4 and S5
    add their own stages beside it."""
    assert engine._STAGES.count(engine._fundamental_inputs_stage) == 1
