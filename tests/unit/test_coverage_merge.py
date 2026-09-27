"""Unit tests for coverage range merge arithmetic (CAP-001-E4-S3).

These tests cover the pure merge_ranges function independently of the database.
They do NOT mark postgres because no container is required.

Implements TC-COMP-163, TC-COMP-164 (pure-function portion).
"""

from datetime import date

# Import will fail (RED) until src/factorflow/ingestion/coverage.py exists.
from factorflow.ingestion.coverage import merge_ranges


def d(s: str) -> date:
    """Parse a date string for test readability."""
    return date.fromisoformat(s)


# Implements TC-COMP-163
def test_merge_disjoint_ranges_preserved() -> None:
    # Implements TC-COMP-163
    existing = [(d("2025-01-01"), d("2025-03-31"))]
    written = (d("2025-06-01"), d("2025-09-30"))
    result = merge_ranges(existing, written)
    assert result == [
        (d("2025-01-01"), d("2025-03-31")),
        (d("2025-06-01"), d("2025-09-30")),
    ]


def test_merge_overlapping_ranges_coalesced() -> None:
    # Implements TC-COMP-163
    existing = [(d("2025-01-01"), d("2025-06-30"))]
    written = (d("2025-04-01"), d("2025-12-31"))
    result = merge_ranges(existing, written)
    assert result == [(d("2025-01-01"), d("2025-12-31"))]


def test_merge_enclosing_range_absorbed() -> None:
    # Implements TC-COMP-163
    existing = [(d("2025-03-01"), d("2025-06-30"))]
    written = (d("2025-01-01"), d("2025-12-31"))
    result = merge_ranges(existing, written)
    assert result == [(d("2025-01-01"), d("2025-12-31"))]


def test_merge_enclosed_range_absorbed() -> None:
    # Implements TC-COMP-163
    existing = [(d("2025-01-01"), d("2025-12-31"))]
    written = (d("2025-03-01"), d("2025-06-30"))
    result = merge_ranges(existing, written)
    assert result == [(d("2025-01-01"), d("2025-12-31"))]


def test_merge_preceding_one_day_adjacency() -> None:
    # Implements TC-COMP-163
    # written ends the day before existing starts
    existing = [(d("2025-06-01"), d("2025-12-31"))]
    written = (d("2025-01-01"), d("2025-05-31"))
    result = merge_ranges(existing, written)
    assert result == [(d("2025-01-01"), d("2025-12-31"))]


def test_merge_following_one_day_adjacency() -> None:
    # Implements TC-COMP-163
    # written starts the day after existing ends
    existing = [(d("2025-01-01"), d("2025-05-31"))]
    written = (d("2025-06-01"), d("2025-12-31"))
    result = merge_ranges(existing, written)
    assert result == [(d("2025-01-01"), d("2025-12-31"))]


def test_merge_unsorted_existing_segments_sorted_before_merge() -> None:
    # Implements TC-COMP-163
    existing = [
        (d("2025-07-01"), d("2025-09-30")),
        (d("2025-01-01"), d("2025-03-31")),
    ]
    written = (d("2025-04-01"), d("2025-06-30"))
    result = merge_ranges(existing, written)
    # April-June is adjacent to both existing segments -- should coalesce all three
    assert result == [(d("2025-01-01"), d("2025-09-30"))]


def test_merge_empty_existing() -> None:
    # Implements TC-COMP-163
    result = merge_ranges([], (d("2025-01-01"), d("2025-12-31")))
    assert result == [(d("2025-01-01"), d("2025-12-31"))]


def test_merge_multiple_existing_all_disjoint_with_written() -> None:
    # Implements TC-COMP-163
    # Use segments with a gap of 2+ days so they are genuinely disjoint (not adjacent).
    existing = [
        (d("2023-01-01"), d("2023-06-30")),
        (d("2023-08-01"), d("2023-12-31")),
    ]
    written = (d("2025-01-01"), d("2025-12-31"))
    result = merge_ranges(existing, written)
    assert result == [
        (d("2023-01-01"), d("2023-06-30")),
        (d("2023-08-01"), d("2023-12-31")),
        (d("2025-01-01"), d("2025-12-31")),
    ]


def test_merge_result_is_minimal_non_overlapping_set() -> None:
    # Implements TC-COMP-164
    existing = [
        (d("2025-01-01"), d("2025-04-30")),
        (d("2025-06-01"), d("2025-09-30")),
    ]
    written = (d("2025-03-01"), d("2025-07-31"))
    result = merge_ranges(existing, written)
    # written overlaps both existing segments -- they all merge
    assert result == [(d("2025-01-01"), d("2025-09-30"))]
    # Verify no two result segments overlap
    for i in range(len(result) - 1):
        assert result[i][1] < result[i + 1][0], "result contains overlapping segments"


def test_merge_same_range_written_again_is_idempotent() -> None:
    existing = [(d("2025-01-01"), d("2025-12-31"))]
    written = (d("2025-01-01"), d("2025-12-31"))
    result = merge_ranges(existing, written)
    assert result == [(d("2025-01-01"), d("2025-12-31"))]
