"""The seven fundamentals line items and their payload keys (CAP-002-E2-S2; DEC-0295).

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
    "shares_outstanding": "income_statement",  # DEC-0295: no share count on the balance sheet
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


EXPECTED_KEYS = {
    "book_equity": "total_equity_attributable_to_parent",
    "shares_outstanding": "diluted_shares_outstanding",
    "net_income": "net_income_loss_attributable_common_shareholders",
    "diluted_eps": "diluted_earnings_per_share",
    "revenue": "revenue",
    "operating_cash_flow": "net_cash_from_operating_activities",
    "capital_expenditure": "purchase_of_property_plant_and_equipment",
}


def test_every_key_is_the_owners_and_every_sign_positive() -> None:
    """DEC-0295: the Massive keys; capex is a magnitude, book equity less preferred stock."""
    assert {name: item.payload_key for name, item in LINE_ITEMS.items()} == EXPECTED_KEYS
    assert {item.sign for item in LINE_ITEMS.values()} == {1}
    assert [n for n, item in LINE_ITEMS.items() if item.magnitude] == ["capital_expenditure"]
    assert {n: item.less_key for n, item in LINE_ITEMS.items() if item.less_key} == {
        "book_equity": "preferred_stock"
    }
    assert unresolved() == []


def test_an_unset_key_is_reported(monkeypatch: pytest.MonkeyPatch) -> None:
    patched = dict(LINE_ITEMS)
    patched["revenue"] = dataclasses.replace(patched["revenue"], payload_key=REQUIRES_INPUT)
    monkeypatch.setattr(line_items, "LINE_ITEMS", patched)
    assert unresolved() == ["revenue"]


def test_unresolved_cause_is_the_shared_constant() -> None:
    assert UNRESOLVED_CAUSE == "line_item_mapping_unresolved"


def test_line_item_is_frozen() -> None:
    with pytest.raises(dataclasses.FrozenInstanceError):
        LINE_ITEMS["revenue"].sign = -1  # type: ignore[misc]
    assert isinstance(LINE_ITEMS["revenue"], LineItem)
