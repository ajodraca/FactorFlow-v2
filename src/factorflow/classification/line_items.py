"""The seven fundamentals line items the value and growth inputs are derived from.

Implements ``component-design-factor-engine.md`` section 2.4. The Massive payload keys
are the owner's answer to system design section 8 question 1 (DEC-0295): the statement
field names of the provider's schema. ``REQUIRES_INPUT`` stays as the guard a key that is
ever unset again would trip.
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
    magnitude: bool = False  # read |value|: the field's sign carries no meaning (DEC-0295)
    less_key: str | None = None  # a field of the same statement subtracted; absent or null is 0


LINE_ITEMS: dict[str, LineItem] = {
    # Common equity: parent equity includes preferred stock (DEC-0295).
    "book_equity": LineItem(
        "book equity",
        "balance_sheet",
        "total_equity_attributable_to_parent",
        1,
        less_key="preferred_stock",
    ),
    # Massive's balance sheet carries no share count; value_inputs.sql reads this from the
    # single most recent quarterly income statement and never sums it (DEC-0295).
    "shares_outstanding": LineItem(
        "shares outstanding", "income_statement", "diluted_shares_outstanding", 1
    ),
    "net_income": LineItem(
        "net income", "income_statement", "net_income_loss_attributable_common_shareholders", 1
    ),
    "diluted_eps": LineItem(
        "diluted earnings per share", "income_statement", "diluted_earnings_per_share", 1
    ),
    "revenue": LineItem("revenue", "income_statement", "revenue", 1),
    "operating_cash_flow": LineItem(
        "operating cash flow", "cash_flow_statement", "net_cash_from_operating_activities", 1
    ),
    # Reported "typically" negative; a purchase is an outflow whatever its sign (DEC-0295).
    "capital_expenditure": LineItem(
        "capital expenditure",
        "cash_flow_statement",
        "purchase_of_property_plant_and_equipment",
        1,
        magnitude=True,
    ),
}


def unresolved() -> list[str]:
    return [name for name, item in LINE_ITEMS.items() if item.payload_key == REQUIRES_INPUT]
