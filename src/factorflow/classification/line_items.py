"""The seven fundamentals line items the value and growth inputs are derived from.

Implements ``component-design-factor-engine.md`` section 2.4. The Massive payload key
for each item is an open owner question (system design section 8 question 1), so every
key is ``REQUIRES_INPUT`` and none is guessed.
"""

from dataclasses import dataclass
from typing import Final

REQUIRES_INPUT: Final = (
    "[REQUIRES INPUT: Massive payload key]"  # system design section 8 question 1
)
UNRESOLVED_CAUSE: Final = "line_item_mapping_unresolved"


@dataclass(frozen=True)
class LineItem:
    label: str  # product vocabulary, rendered by the interface (STD-UI-1)
    statement_type: str  # balance_sheet | income_statement | cash_flow_statement
    payload_key: str  # the Massive statement field, owner input
    sign: int  # +1, or -1 when the provider reports an outflow negative


LINE_ITEMS: dict[str, LineItem] = {
    "book_equity": LineItem("book equity", "balance_sheet", REQUIRES_INPUT, 1),
    "shares_outstanding": LineItem("shares outstanding", "balance_sheet", REQUIRES_INPUT, 1),
    "net_income": LineItem("net income", "income_statement", REQUIRES_INPUT, 1),
    "diluted_eps": LineItem("diluted earnings per share", "income_statement", REQUIRES_INPUT, 1),
    "revenue": LineItem("revenue", "income_statement", REQUIRES_INPUT, 1),
    "operating_cash_flow": LineItem(
        "operating cash flow", "cash_flow_statement", REQUIRES_INPUT, 1
    ),
    "capital_expenditure": LineItem(
        "capital expenditure", "cash_flow_statement", REQUIRES_INPUT, 1
    ),
}


def unresolved() -> list[str]:
    return [name for name, item in LINE_ITEMS.items() if item.payload_key == REQUIRES_INPUT]
