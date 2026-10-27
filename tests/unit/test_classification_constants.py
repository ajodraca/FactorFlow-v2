"""The classification constants (CAP-002-E2-S2). Traces to AC-10, AC-11 and AC-13."""

import re

from factorflow.classification import constants
from factorflow.db.migrate_main import MIGRATIONS_DIR


def test_constant_values() -> None:
    assert constants.MIN_PEER_SET_SIZE == 30
    assert constants.FUNDAMENTALS_STALE_AFTER_MONTHS == 6
    assert constants.MOMENTUM_LAG_MONTHS == 1
    assert constants.MOMENTUM_WINDOWS_MONTHS == (3, 6, 12)
    assert constants.FACTORS == ("value", "growth", "momentum")


def test_input_names_per_factor() -> None:
    assert constants.INPUT_NAMES == {
        "value": ("book_to_price", "earnings_yield", "fcf_yield"),
        "growth": ("revenue_growth", "eps_growth"),
        "momentum": ("return_3m", "return_6m", "return_12m"),
    }


def test_input_names_equal_the_migration_check() -> None:
    text = (MIGRATIONS_DIR / "0006_classifications.sql").read_text()
    constraint = text.split("factor_input_name_matches_factor", 1)[1].split("CONSTRAINT", 1)[0]
    in_check = set(re.findall(r"'([a-z_0-9]+)'", constraint)) - set(constants.FACTORS)
    assert in_check == {name for names in constants.INPUT_NAMES.values() for name in names}
