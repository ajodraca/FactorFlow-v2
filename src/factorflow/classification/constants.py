"""The numbers and names the factor classification is built on (CAP-002).

Every value cites its source; no other number belongs here.
"""

from typing import Final

MIN_PEER_SET_SIZE: Final = 30  # AC-14, owner decision 2026-10-12
FUNDAMENTALS_STALE_AFTER_MONTHS: Final = 6  # AC-13
MOMENTUM_LAG_MONTHS: Final = 1  # capability section 2: skip the most recent month
MOMENTUM_WINDOWS_MONTHS: Final = (3, 6, 12)  # capability section 2

FACTORS: Final = ("value", "growth", "momentum")  # capability section 2

# Mirrors the factor_input_name_matches_factor CHECK in migration 0006 (DEC-0112).
INPUT_NAMES: Final[dict[str, tuple[str, ...]]] = {
    "value": ("book_to_price", "earnings_yield", "fcf_yield"),
    "growth": ("revenue_growth", "eps_growth"),
    "momentum": ("return_3m", "return_6m", "return_12m"),
}

# Source: factor-engine section 10, reader design 2.6, UX brief section 2 item 9 (DEC-0120).
INPUT_LABELS: Final[dict[str, str]] = {
    "book_to_price": "book-to-price",
    "earnings_yield": "earnings yield",
    "fcf_yield": "free-cash-flow yield",
    "revenue_growth": "revenue growth",
    "eps_growth": "earnings-per-share growth",
    "return_3m": "3-month total return",
    "return_6m": "6-month total return",
    "return_12m": "12-month total return",
}
