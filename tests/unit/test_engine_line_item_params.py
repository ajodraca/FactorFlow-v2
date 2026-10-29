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


def test_real_line_items_pass_every_key_as_none_and_every_item_unresolved() -> None:
    """Design 2.4, AC-12: while every key is REQUIRES_INPUT each is bound as None."""
    params = engine._line_item_parameters()

    assert params["line_item_names"] == NAMES
    assert by_name(params) == {
        name: (item.statement_type, None, item.sign) for name, item in LINE_ITEMS.items()
    }
    assert params["unresolved"] == NAMES
    assert params["unresolved_cause"] == UNRESOLVED_CAUSE


def test_a_resolved_item_carries_its_key_and_sign(monkeypatch: pytest.MonkeyPatch) -> None:
    """Design 2.4 LineItem, AC-7: a resolved item is bound with its own key and sign, read
    from line_items.LINE_ITEMS at call time."""
    item = LINE_ITEMS["capital_expenditure"]
    monkeypatch.setitem(
        line_items.LINE_ITEMS,
        "capital_expenditure",
        LineItem(item.label, item.statement_type, "X", -1),
    )

    resolved = by_name(engine._line_item_parameters())

    assert resolved["capital_expenditure"] == ("cash_flow_statement", "X", -1)
    assert {
        name: value[1] for name, value in resolved.items() if name != "capital_expenditure"
    } == {name: None for name in NAMES if name != "capital_expenditure"}
    assert engine._line_item_parameters()["unresolved"] == [
        name for name in NAMES if name != "capital_expenditure"
    ]


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
