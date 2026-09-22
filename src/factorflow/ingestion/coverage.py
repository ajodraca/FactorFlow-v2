"""Pure coverage range arithmetic for the observation writer (CAP-001-E4-S3).

Implements DAC-E4-S3-2: merge abutting and overlapping date ranges into the
minimal non-overlapping ordered set.
"""

from __future__ import annotations

from datetime import date, timedelta


def merge_ranges(
    existing: list[tuple[date, date]],
    written: tuple[date, date],
) -> list[tuple[date, date]]:
    """Merge ``written`` into ``existing`` coverage segments.

    Coalesces any segments that overlap or abut (one-calendar-day adjacency in
    either direction) with the written range.  Disjoint segments that do not
    touch the written range are preserved unchanged.

    Args:
        existing: The current coverage segments for one instrument/data_type,
            as a list of inclusive ``(covered_from, covered_to)`` date pairs.
            May be empty or unsorted; this function sorts them internally.
        written: The ``(from, to)`` date range returned by the provider for this
            write call.  Both endpoints are inclusive.

    Returns:
        The minimal ordered list of non-overlapping ``(covered_from, covered_to)``
        pairs after merging ``written`` into ``existing``.
    """
    _one_day = timedelta(days=1)

    # Start with the written range as the candidate to merge, then sweep through
    # all existing segments sorted by start date.
    all_segments = sorted([*existing, written], key=lambda s: s[0])

    merged: list[tuple[date, date]] = []
    current_from, current_to = all_segments[0]

    for seg_from, seg_to in all_segments[1:]:
        # Two segments overlap or abut when one starts no later than the day
        # after the other ends.  This handles both overlap and one-calendar-day
        # adjacency in both directions.
        if seg_from <= current_to + _one_day:
            # Extend the current segment if this one reaches further right.
            current_to = max(current_to, seg_to)
        else:
            merged.append((current_from, current_to))
            current_from, current_to = seg_from, seg_to

    merged.append((current_from, current_to))
    return merged
