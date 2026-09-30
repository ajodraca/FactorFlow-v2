"""Unit tests for the coverage read shapes (CAP-001-E6-S1). No container needed.

- TC-COMP-037 (DAC-E6-11): the interface's pinned shapes, and presence's three states.
- TC-COMP-041 (DAC-E6-S1-1): each data type is present, absent or unknown.
- DAC-E6-S1-3: a shortfall is absent (``None``), never zero, when depth is met.
"""

import dataclasses
from datetime import date, timedelta
from enum import StrEnum

import pytest

from factorflow.coverage.service import (
    UNAVAILABLE_REASON,
    CoverageView,
    GapDetection,
    InstrumentCoverage,
    Presence,
    _depth_shortfall_years,
)


# Implements TC-COMP-037
# Implements TC-COMP-041
def test_presence_has_exactly_three_states() -> None:
    assert issubclass(Presence, StrEnum)
    assert [p.value for p in Presence] == ["present", "absent", "unknown"]


# Implements TC-COMP-037
@pytest.mark.parametrize(
    ("shape", "fields"),
    [
        (GapDetection, ["available", "reason", "missing_days"]),
        (
            InstrumentCoverage,
            [
                "symbol",
                "lifecycle",
                "presence",
                "covered_from",
                "covered_to",
                "last_acquired_at",
                "depth_shortfall_years",
                "gaps",
            ],
        ),
        (CoverageView, ["never_acquired", "gap_detection", "instruments", "next_cursor"]),
    ],
)
def test_shapes_are_frozen_with_design_fields(shape: type, fields: list[str]) -> None:
    assert dataclasses.is_dataclass(shape)
    assert shape.__dataclass_params__.frozen  # type: ignore[attr-defined]
    assert [f.name for f in dataclasses.fields(shape)] == fields


def test_depth_met_carries_none_not_zero() -> None:
    row = InstrumentCoverage(
        symbol="AAPL",
        lifecycle="active",
        presence={"prices": Presence.PRESENT},
        covered_from=date(2020, 1, 1),
        covered_to=date(2024, 12, 31),
        last_acquired_at=None,
        depth_shortfall_years=None,
        gaps=GapDetection(available=True, reason=None, missing_days=None),
    )

    assert row.depth_shortfall_years is None


_START = date(2020, 1, 1)


def _covered(days: int) -> tuple[date, date]:
    return _START, _START + timedelta(days=days - 1)


@pytest.mark.parametrize(
    ("covered", "stated_years", "expected"),
    [
        (_covered(3 * 365), 5, 2),
        (_covered(5 * 365), 5, None),
        (_covered(6 * 365), 5, None),
        (_covered(3 * 365), None, None),
        ((None, None), 5, None),
    ],
)
def test_depth_shortfall_years(
    covered: tuple[date | None, date | None], stated_years: int | None, expected: int | None
) -> None:
    assert _depth_shortfall_years(covered[0], covered[1], stated_years) == expected


def test_unavailable_reason_constant() -> None:
    assert UNAVAILABLE_REASON == "fewer_than_two_instruments_with_data"
