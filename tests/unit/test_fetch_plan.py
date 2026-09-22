"""Unit tests for src/factorflow/ingestion/plan.py.

Tests are table-driven pure-function cases covering the mapped TC-IDs.
No PostgreSQL container or owner-setting dependency is required.

Trace comments map each case to the test-specification ID that demands it.
"""

from datetime import date
from uuid import UUID

from hypothesis import given, settings
from hypothesis import strategies as st

from factorflow.ingestion.plan import FetchRange, depth_start_for_run, plan_fetches
from factorflow.runs.journal import ClaimedRun

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_RUN_ID = UUID("00000000-0000-0000-0000-000000000001")
TODAY = date(2026, 1, 15)


def claimed_run(depth_years: int) -> ClaimedRun:
    return ClaimedRun(run_id=_RUN_ID, history_depth_years=depth_years)


# ---------------------------------------------------------------------------
# T002 — TC-COMP-003, TC-COMP-006, TC-COMP-022, TC-COMP-140, TC-COMP-141,
#         TC-COMP-142, TC-COMP-143, TC-COMP-169 through TC-COMP-174
# T003 — labelled FetchRange sequences and independent data types
# ---------------------------------------------------------------------------


# Implements TC-COMP-169 / DAC-E4-S4-1: no coverage → whole range
def test_no_coverage_yields_whole_range() -> None:
    depth_start = date(2025, 1, 15)
    result = plan_fetches("prices", [], depth_start, TODAY)
    assert result == [FetchRange(data_type="prices", start=depth_start, end=TODAY)]


# Implements TC-COMP-170 / DAC-E4-S4-2: full coverage → only trailing range
def test_full_coverage_yields_trailing_range_only() -> None:
    depth_start = date(2025, 1, 15)
    covered_to = date(2026, 1, 10)
    result = plan_fetches("prices", [(depth_start, covered_to)], depth_start, TODAY)
    assert result == [FetchRange(data_type="prices", start=covered_to, end=TODAY)]


# Implements TC-COMP-143 / DAC-E4-9: trailing range starts at covered_to (re-fetch)
def test_trailing_range_starts_at_covered_to_not_day_after() -> None:
    """The last covered day is re-fetched deliberately (may have been partial)."""
    depth_start = date(2025, 6, 1)
    covered_to = date(2026, 1, 14)
    result = plan_fetches("prices", [(depth_start, covered_to)], depth_start, TODAY)
    assert len(result) == 1
    assert result[0].start == covered_to  # re-fetches covered_to, not covered_to + 1


# Implements TC-COMP-141 / DAC-E4-7: coverage starting later than depth_start → earlier gap
def test_earlier_gap_when_coverage_starts_after_depth_start() -> None:
    depth_start = date(2025, 1, 15)
    coverage_start = date(2025, 6, 1)
    covered_to = date(2026, 1, 10)
    result = plan_fetches("prices", [(coverage_start, covered_to)], depth_start, TODAY)
    expected = [
        FetchRange(data_type="prices", start=depth_start, end=coverage_start),
        FetchRange(data_type="prices", start=covered_to, end=TODAY),
    ]
    assert result == expected


# Implements TC-COMP-171 / DAC-E4-S4-3: interior gap yields two separate ranges
def test_interior_gap_yields_two_ranges() -> None:
    depth_start = date(2025, 1, 15)
    seg1 = (depth_start, date(2025, 3, 31))
    seg2 = (date(2025, 7, 1), date(2026, 1, 10))
    result = plan_fetches("prices", [seg1, seg2], depth_start, TODAY)
    # gap between seg1.end and seg2.start, plus trailing from seg2.end
    assert len(result) == 2
    assert result[0] == FetchRange(
        data_type="prices", start=date(2025, 3, 31), end=date(2025, 7, 1)
    )
    assert result[1] == FetchRange(data_type="prices", start=date(2026, 1, 10), end=TODAY)


# Implements TC-COMP-022 / AC-22: deepening backfill — AC-22 scenario
def test_deepening_backfill_fetches_earlier_range() -> None:
    """Coverage starts 2 years ago; new depth is 5 years — gap at the beginning."""
    today = date(2026, 1, 15)
    old_depth_start = date(2024, 1, 15)
    new_depth_start = date(2021, 1, 15)
    coverage_start = old_depth_start
    covered_to = date(2026, 1, 10)
    result = plan_fetches("prices", [(coverage_start, covered_to)], new_depth_start, today)
    assert result[0].start == new_depth_start
    assert result[0].end == coverage_start


# Implements TC-COMP-006 / AC-6: no re-request of interior covered period
def test_no_re_request_of_held_interior_data() -> None:
    depth_start = date(2025, 1, 1)
    covered = [(depth_start, date(2025, 12, 31))]
    result = plan_fetches("prices", covered, depth_start, TODAY)
    # only trailing; no interior range re-requested
    assert len(result) == 1
    assert result[0].start == date(2025, 12, 31)


# Implements TC-COMP-003 / AC-3: independent planning per data type
def test_data_types_planned_independently() -> None:
    """Implements TC-COMP-173 / DAC-E4-S4-5."""
    depth_start = date(2025, 1, 1)
    prices_covered = [(depth_start, date(2026, 1, 10))]
    reference_covered: list[tuple[date, date]] = []  # no coverage for reference
    prices = plan_fetches("prices", prices_covered, depth_start, TODAY)
    reference = plan_fetches("reference", reference_covered, depth_start, TODAY)
    # reference starts from depth_start; prices only re-fetches trailing
    assert reference[0].start == depth_start
    assert prices[0].start == date(2026, 1, 10)
    assert prices[0].data_type == "prices"
    assert reference[0].data_type == "reference"


# Implements TC-COMP-174 / DAC-E4-S4-6: depth_start > today → empty plan
def test_inverted_window_yields_empty_plan() -> None:
    depth_start = date(2027, 1, 1)  # future date > today
    result = plan_fetches("prices", [], depth_start, TODAY)
    assert result == []


# depth_start == today → empty plan (edge)
def test_depth_start_equals_today_yields_empty_plan() -> None:
    result = plan_fetches("prices", [], TODAY, TODAY)
    assert result == []


# Implements TC-COMP-140 / DAC-E4-6: coverage outside requested window is ignored
def test_coverage_outside_window_is_clipped() -> None:
    depth_start = date(2025, 6, 1)
    # coverage starts before depth_start — should be clipped to window
    old_seg = (date(2024, 1, 1), date(2025, 7, 1))
    result = plan_fetches("prices", [old_seg], depth_start, TODAY)
    # from 2025-07-01 to TODAY (trailing re-fetch from covered_to clipped to window)
    assert all(r.start >= depth_start for r in result)


# ---------------------------------------------------------------------------
# T004 — depth-snapshot and boundary tests
# ---------------------------------------------------------------------------


# Implements TC-COMP-142 / DAC-E4-8: depth_start derives from the claimed run snapshot
def test_depth_start_for_run_uses_snapshotted_depth() -> None:
    """depth_start_for_run reads ClaimedRun.history_depth_years, never a setting."""
    run = claimed_run(3)
    today = date(2026, 1, 15)
    ds = depth_start_for_run(run, today)
    assert ds == date(2023, 1, 15)


# Implements TC-COMP-172 / DAC-E4-S4-4: changed owner setting does not affect queued run
def test_queued_run_uses_its_own_snapshotted_depth() -> None:
    run_with_old_depth = claimed_run(2)
    today = date(2026, 1, 15)
    ds = depth_start_for_run(run_with_old_depth, today)
    # Regardless of what a "current setting" might say, the result is from the run
    assert ds == date(2024, 1, 15)


# February-29 clamping: depth across a leap year boundary
def test_depth_start_feb29_clamps_to_feb28_in_non_leap_year() -> None:
    today = date(2024, 2, 29)  # 2024 is a leap year
    run = claimed_run(1)
    ds = depth_start_for_run(run, today)
    # 2023 is not a leap year, so Feb 29 → Feb 28
    assert ds == date(2023, 2, 28)


# Inverted window from depth_start computation: empty result
def test_plan_fetches_empty_when_depth_start_after_today() -> None:
    run = claimed_run(1)
    today = date(2026, 1, 15)
    depth_start = depth_start_for_run(run, today)
    # now artificially pass a today earlier than depth_start
    result = plan_fetches("prices", [], depth_start, date(2025, 1, 1))
    assert result == []


# ---------------------------------------------------------------------------
# T005 — Hypothesis property test
# ---------------------------------------------------------------------------


def _sorted_non_overlapping(
    dates: list[date],
) -> list[tuple[date, date]]:
    """Build non-overlapping (start, end) pairs from a sorted pool of dates."""
    segments: list[tuple[date, date]] = []
    it = iter(sorted(set(dates)))
    try:
        while True:
            start = next(it)
            end = next(it)
            if end > start:
                segments.append((start, end))
    except StopIteration:
        pass
    return segments


_date_strategy = st.dates(min_value=date(2020, 1, 1), max_value=date(2028, 12, 31))


@settings(max_examples=200)
@given(
    data_type=st.sampled_from(["reference", "prices", "fundamentals", "corporate_actions"]),
    raw_dates=st.lists(_date_strategy, min_size=0, max_size=10),
    depth_start=_date_strategy,
    today=_date_strategy,
)
def test_property_no_non_trailing_range_overlaps_coverage(
    data_type: str,
    raw_dates: list[date],
    depth_start: date,
    today: date,
) -> None:
    """Every yielded range is within the window, ordered, and non-overlapping with
    held coverage — except for the deliberate trailing range starting at the final
    covered_to.
    """
    covered = _sorted_non_overlapping(raw_dates)
    result = plan_fetches(data_type, covered, depth_start, today)

    if depth_start >= today:
        assert result == [], "Inverted window must produce empty plan"
        return

    # Determine the final covered_to that falls within the window, if any
    window_covered = [
        (max(s, depth_start), min(e, today)) for (s, e) in covered if e > depth_start and s < today
    ]
    window_covered = [(s, e) for (s, e) in window_covered if s < e]
    final_covered_to = window_covered[-1][1] if window_covered else None

    for _i, fr in enumerate(result):
        # Each range must be within the requested window
        assert fr.start >= depth_start, f"Range starts before depth_start: {fr}"
        assert fr.end <= today, f"Range ends after today: {fr}"
        assert fr.start < fr.end, f"Range is inverted or zero-length: {fr}"
        assert fr.data_type == data_type

        # Each range must not overlap any held coverage interior (except trailing)
        is_trailing = final_covered_to is not None and fr.start == final_covered_to
        if not is_trailing:
            for seg_start, seg_end in window_covered:
                # The fetch range must not span an interior covered interval
                assert not (fr.start < seg_end and fr.end > seg_start), (
                    f"Non-trailing range {fr} overlaps held coverage [{seg_start}, {seg_end}]"
                )

    # Ranges must be ordered (no backtracking)
    for i in range(len(result) - 1):
        assert result[i].end <= result[i + 1].start, "Ranges are not ordered"


# ---------------------------------------------------------------------------
# T008 — CAP-001-E4-S5 boundary documentation test
# ---------------------------------------------------------------------------


def test_e4_s5_boundary_depth_start_for_run_then_plan_per_data_type() -> None:
    """Documents the CAP-001-E4-S5 consumption boundary.

    S5 supplies the ClaimedRun to depth_start_for_run, then calls plan_fetches
    once per data type with only that type's coverage.  plan.py has no journal,
    database, roster, provider, or owner-setting access.
    """
    run = claimed_run(2)
    today = date(2026, 6, 15)
    depth_start = depth_start_for_run(run, today)
    assert depth_start == date(2024, 6, 15)

    prices_cov: list[tuple[date, date]] = [(date(2025, 1, 1), date(2026, 6, 1))]
    ref_cov: list[tuple[date, date]] = []

    prices_plan = plan_fetches("prices", prices_cov, depth_start, today)
    ref_plan = plan_fetches("reference", ref_cov, depth_start, today)

    # prices: gap at the beginning + trailing
    assert prices_plan[0].data_type == "prices"
    assert prices_plan[0].start == depth_start

    # reference: whole range
    assert ref_plan == [FetchRange(data_type="reference", start=depth_start, end=today)]
