"""The seven fundamentals line items and their unresolved payload keys (CAP-002-E2-S2).

Traces to AC-7 and DAC-E2-S2-5.
"""

import dataclasses

import pytest

from factorflow.classification import line_items
from factorflow.classification.line_items import (
    LINE_ITEMS,
    REQUIRES_INPUT,
    UNRESOLVED_CAUSE,
    LineItem,
    unresolved,
)

EXPECTED_STATEMENTS = {
    "book_equity": "balance_sheet",
    "shares_outstanding": "balance_sheet",
    "net_income": "income_statement",
    "diluted_eps": "income_statement",
    "revenue": "income_statement",
    "operating_cash_flow": "cash_flow_statement",
    "capital_expenditure": "cash_flow_statement",
}


EXPECTED_LABELS = {
    "book_equity": "book equity",
    "shares_outstanding": "shares outstanding",
    "net_income": "net income",
    "diluted_eps": "diluted earnings per share",
    "revenue": "revenue",
    "operating_cash_flow": "operating cash flow",
    "capital_expenditure": "capital expenditure",
}


def test_line_items_are_the_seven_of_the_design() -> None:
    assert {name: item.statement_type for name, item in LINE_ITEMS.items()} == EXPECTED_STATEMENTS


def test_labels_are_product_vocabulary() -> None:
    """Design 2.4: the label is rendered by the interface, so it is words, not identifiers."""
    assert {name: item.label for name, item in LINE_ITEMS.items()} == EXPECTED_LABELS


def test_the_sentinel_is_the_designs_text() -> None:
    assert REQUIRES_INPUT == "[REQUIRES INPUT: Massive payload key]"


def test_every_key_is_unresolved_and_every_sign_positive() -> None:
    for item in LINE_ITEMS.values():
        assert item.payload_key == REQUIRES_INPUT
        assert item.sign == 1
    assert sorted(unresolved()) == sorted(EXPECTED_STATEMENTS)


def test_a_resolved_key_is_no_longer_reported(monkeypatch: pytest.MonkeyPatch) -> None:
    patched = dict(LINE_ITEMS)
    patched["revenue"] = dataclasses.replace(patched["revenue"], payload_key="X")
    monkeypatch.setattr(line_items, "LINE_ITEMS", patched)
    assert sorted(unresolved()) == sorted(set(EXPECTED_STATEMENTS) - {"revenue"})


def test_unresolved_cause_is_the_shared_constant() -> None:
    assert UNRESOLVED_CAUSE == "line_item_mapping_unresolved"


def test_line_item_is_frozen() -> None:
    with pytest.raises(dataclasses.FrozenInstanceError):
        LINE_ITEMS["revenue"].sign = -1  # type: ignore[misc]
    assert isinstance(LINE_ITEMS["revenue"], LineItem)
