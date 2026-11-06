"""The test payload keys of the seven fundamentals line items, for the e2e acquisition stack.

The real Massive payload keys are the owner's open question (system design section 8
question 1), so `src/factorflow/classification/line_items.py` keeps every key
`REQUIRES_INPUT`. The factor-engine design (section 7) has fixtures declare their own
keys instead of waiting: `api_e2e_main.py` installs these into the acquisition stack's
API process, and `massive_stub.py` serves statements carrying them, so a real run and a
real build can score value and growth (CAP-002-e2e-tests-automation-tasks, AR-001;
DEC-0290). A test fixture, never a Massive contract. Plain data: no import of the product.
"""

from __future__ import annotations

# line item -> (statement type, test payload key)
E2E_LINE_ITEMS: dict[str, tuple[str, str]] = {
    "book_equity": ("balance_sheet", "e2e_book_equity"),
    "shares_outstanding": ("balance_sheet", "e2e_shares_outstanding"),
    "net_income": ("income_statement", "e2e_net_income"),
    "diluted_eps": ("income_statement", "e2e_diluted_eps"),
    "revenue": ("income_statement", "e2e_revenue"),
    "operating_cash_flow": ("cash_flow_statement", "e2e_operating_cash_flow"),
    "capital_expenditure": ("cash_flow_statement", "e2e_capital_expenditure"),
}
