"""Range planner: compute per-data-type fetch intervals for one claimed run.

Per `component-design-acquisition-runner.md` section 2.3:

- ``FetchRange`` is the typed value returned for each sub-interval.
- ``depth_start_for_run`` derives the window start from the claimed run's
  snapshotted ``history_depth_years``, never from an owner setting read at
  execution time (DAC-E4-8).  February 29 is clamped to February 28 when
  the destination year is not a leap year (tasks file §Notes).
- ``plan_fetches`` returns the sub-intervals of ``[depth_start, today]`` not
  already covered, with the trailing covered day deliberately re-fetched
  because it may have been a partial session (AC-6, DAC-E4-9).

No database, journal, roster, provider, or owner-setting access belongs here.
CAP-001-E4-S5 is the caller that supplies the claimed run and per-data-type
coverage; this module is a pure function with no I/O.
"""

from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date

from factorflow.runs.journal import ClaimedRun


@dataclass(frozen=True)
class FetchRange:
    """One contiguous interval to fetch for a named data type.

    ``start`` and ``end`` are inclusive dates that bound the fetch window.
    """

    data_type: str
    start: date
    end: date


def depth_start_for_run(run: ClaimedRun, today: date) -> date:
    """Return ``today`` minus ``run.history_depth_years`` calendar years.

    Clamping rule (recorded provisional decision 2026-09-16): when the
    calendar-year subtraction lands on February 29 in a non-leap year, the
    result is clamped to February 28.  This keeps the result a valid date
    and is the minimal deterministic interpretation of "minus … years."
    """
    years = run.history_depth_years
    target_year = today.year - years
    target_month = today.month
    target_day = today.day

    # Clamp day when the month has fewer days in the target year
    max_day = calendar.monthrange(target_year, target_month)[1]
    if target_day > max_day:
        target_day = max_day

    return date(target_year, target_month, target_day)


def plan_fetches(
    data_type: str,
    covered: list[tuple[date, date]],
    depth_start: date,
    today: date,
) -> list[FetchRange]:
    """Return the sub-ranges of ``[depth_start, today]`` not already covered.

    Algorithm (section 2.3):

    1. Clip every supplied coverage segment to the requested window
       ``[depth_start, today]``.
    2. Coalesce overlapping or adjacent clipped segments.
    3. Walk the gaps between consecutive coalesced segments; each gap becomes
       one ``FetchRange``.
    4. If coverage reaches ``today`` the result is just the trailing re-fetch
       ``[covered_to, today]`` — covered_to is re-fetched, not skipped, because
       the last covered day may have been a partial session (AC-6, DAC-E4-9).
    5. If the window is inverted (``depth_start >= today``) return an empty list.
    """
    if depth_start >= today:
        return []

    # 1. Clip each segment to [depth_start, today]
    clipped: list[tuple[date, date]] = []
    for seg_start, seg_end in covered:
        s = max(seg_start, depth_start)
        e = min(seg_end, today)
        if s < e:
            clipped.append((s, e))

    # 2. Sort and coalesce overlapping / adjacent segments
    clipped.sort()
    merged: list[tuple[date, date]] = []
    for seg in clipped:
        if merged and seg[0] <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], seg[1]))
        else:
            merged.append(list(seg))  # type: ignore[arg-type]

    # Convert any lists back to tuples (from the in-place merge above)
    coalesced: list[tuple[date, date]] = [tuple(s) for s in merged]  # type: ignore[misc]

    # 3 & 4. Build fetch ranges from the gaps + trailing
    ranges: list[FetchRange] = []
    cursor = depth_start

    for seg_start, seg_end in coalesced:
        if cursor < seg_start:
            # gap before this covered segment
            ranges.append(FetchRange(data_type=data_type, start=cursor, end=seg_start))
        # advance cursor to the covered segment end (trailing re-fetch starts here)
        cursor = seg_end

    # Trailing range: from cursor (last covered_to) to today.
    # When there is no coverage, cursor == depth_start, so this is the whole window.
    # When coverage already reaches today, cursor == today, yielding a zero-length
    # range which would be filtered — but re-fetching is deliberate so we emit it
    # only when cursor < today (i.e. there is an actual range to issue).
    # The trailing re-fetch applies when coverage exists AND cursor <= today.
    if coalesced:
        # Deliberate trailing re-fetch: start at covered_to (= cursor), end at today
        if cursor < today:
            ranges.append(FetchRange(data_type=data_type, start=cursor, end=today))
        # If cursor == today (coverage exactly reaches today) there is nothing to re-fetch
    else:
        # No coverage at all: the whole window is missing
        ranges.append(FetchRange(data_type=data_type, start=depth_start, end=today))

    return ranges
