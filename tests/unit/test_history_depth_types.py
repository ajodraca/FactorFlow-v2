"""Type-level test that the history depth read distinguishes unset from set."""

import dataclasses
from datetime import datetime

from factorflow.instruments.settings import HistoryDepth, read_history_depth


def test_history_depth_carries_years_and_updated_at_not_a_bare_optional_int() -> None:
    """The return type is a dataclass carrying updated_at, not a bare int."""
    depth = HistoryDepth(years=5, updated_at=datetime.now())

    assert dataclasses.is_dataclass(depth)
    assert depth.years == 5
    assert isinstance(depth.updated_at, datetime)


def test_read_history_depth_return_annotation_is_optional_history_depth() -> None:
    """The function is annotated to return HistoryDepth | None, not int | None."""
    annotation = read_history_depth.__annotations__["return"]

    assert annotation in ("HistoryDepth | None", HistoryDepth | None)
