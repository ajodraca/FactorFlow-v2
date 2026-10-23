"""Replay semantics on in-memory event sequences, cursors and provenance.

``fold_members`` is the pure statement of the rule the SQL implements
(``membership_as_of.sql``); ``tests/integration/test_universe_as_of.py`` proves
the two agree. Satisfies AC-6, DAC-E1-8, DAC-E1-S2-1.
"""

import base64
import copy
import json
import random
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from uuid import UUID

import pytest

from factorflow.api.bounds import MAX_PAGE_SIZE
from factorflow.runs.queries import CursorError
from factorflow.universes import replay
from factorflow.universes.replay import ReplayEvent, fold_members

D = date(2026, 10, 1)
_NEXT_ID = iter(range(1, 10_000))


def _at(day: date, hour: int = 12) -> datetime:
    return datetime(day.year, day.month, day.day, hour, tzinfo=UTC)


def _event(
    event_type: str, instrument_id: int | None, day: date, *, recorded_at: datetime | None = None
) -> ReplayEvent:
    return ReplayEvent(
        event_id=next(_NEXT_ID),
        event_type=event_type,
        instrument_id=instrument_id,
        recorded_at=recorded_at or _at(day),
        recorded_on=day,
    )


# Implements TC-COMP-049
def test_add_and_remove_on_the_same_date_is_not_membership() -> None:
    events = [_event("member_added", 1, D), _event("member_removed", 1, D)]

    assert fold_members(events, D) == {}
    assert fold_members(events, D + timedelta(days=1)) == {}


# Implements TC-COMP-049
@pytest.mark.parametrize("offset", [0, 1, 30])
def test_a_member_added_on_d_is_a_member_from_d_onward(offset: int) -> None:
    added = _event("member_added", 1, D)

    assert fold_members([added], D + timedelta(days=offset)) == {1: added.recorded_at}


# Implements TC-COMP-049
def test_a_member_is_not_one_before_the_day_it_was_added() -> None:
    assert fold_members([_event("member_added", 1, D)], D - timedelta(days=1)) == {}


# Implements TC-COMP-049
def test_removal_ends_membership_on_its_own_date_but_not_the_day_before() -> None:
    removal_day = D + timedelta(days=5)
    added = _event("member_added", 1, D)
    events = [added, _event("member_removed", 1, removal_day)]

    assert fold_members(events, removal_day) == {}
    assert fold_members(events, removal_day - timedelta(days=1)) == {1: added.recorded_at}


# Implements TC-COMP-049
def test_a_re_add_makes_a_member_again_since_the_second_add() -> None:
    events = [
        _event("member_added", 1, D),
        _event("member_removed", 1, D + timedelta(days=3)),
        _event("member_added", 1, D + timedelta(days=9)),
    ]
    second = events[-1]

    assert fold_members(events, D + timedelta(days=9)) == {1: second.recorded_at}


# Implements TC-COMP-049
def test_event_id_decides_not_recorded_at_and_not_list_order() -> None:
    # The later event carries the earlier recorded_at, and the list is shuffled.
    added = _event("member_added", 1, D, recorded_at=_at(D, 20))
    removed = _event("member_removed", 1, D, recorded_at=_at(D, 1))
    assert added.event_id < removed.event_id
    ordered = [added, removed]

    for seed in range(5):
        shuffled = ordered[:]
        random.Random(seed).shuffle(shuffled)
        assert fold_members(shuffled, D) == {}

    # And the opposite order of ids is a member.
    removed_first = _event("member_removed", 2, D, recorded_at=_at(D, 20))
    added_second = _event("member_added", 2, D, recorded_at=_at(D, 1))
    assert fold_members([added_second, removed_first], D) == {2: added_second.recorded_at}


# Implements TC-COMP-049
def test_the_recorded_on_date_is_the_grain_not_the_utc_date_of_recorded_at() -> None:
    # Recorded 21:00 America/Chicago on D, which is 02:00 UTC on D + 1 (DEC-0065).
    late = _at(D + timedelta(days=1), 2)
    added = _event("member_added", 1, D, recorded_at=late)
    next_day = _event("member_added", 2, D + timedelta(days=1), recorded_at=_at(D, 23))

    assert fold_members([added, next_day], D) == {1: late}
    assert fold_members([added, next_day], D + timedelta(days=1)) == {
        1: late,
        2: next_day.recorded_at,
    }


# Implements TC-COMP-049
def test_events_recorded_after_as_of_are_ignored() -> None:
    added = _event("member_added", 1, D)
    events = [added, _event("member_removed", 1, D + timedelta(days=2))]

    assert fold_members(events, D + timedelta(days=1)) == {1: added.recorded_at}


# Implements TC-COMP-049
def test_created_renamed_and_retired_never_add_or_remove_a_member() -> None:
    added = _event("member_added", 1, D)
    events = [
        _event("created", None, D),
        added,
        _event("renamed", None, D + timedelta(days=1)),
        _event("retired", None, D + timedelta(days=2)),
    ]

    assert fold_members(events, D + timedelta(days=3)) == {1: added.recorded_at}


# Implements TC-COMP-049
def test_an_empty_sequence_has_no_members() -> None:
    assert fold_members([], D) == {}


# Implements TC-COMP-049
def test_several_instruments_fold_independently() -> None:
    a = _event("member_added", 1, D)
    b = _event("member_added", 2, D)
    removed_a = _event("member_removed", 1, D + timedelta(days=1))

    assert fold_members([a, b, removed_a], D + timedelta(days=1)) == {2: b.recorded_at}


def test_fold_members_is_pure() -> None:
    events = [_event("member_added", 1, D), _event("member_removed", 1, D + timedelta(days=1))]
    snapshot = copy.deepcopy(events)

    first = fold_members(events, D)
    assert events == snapshot
    assert fold_members(events, D) == first


# Implements TC-COMP-051
def test_event_cursor_round_trips_as_a_versioned_url_safe_string() -> None:
    cursor = replay.encode_event_cursor(12345)

    assert replay.decode_event_cursor(cursor) == 12345
    payload = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    assert payload["v"] == 1
    assert set(cursor) <= set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")


# Implements TC-COMP-051
@pytest.mark.parametrize("event_id", [1, 12, 123, 1234, 12345, 123456, 10**12])
def test_event_cursor_round_trips_whatever_its_padding(event_id: int) -> None:
    assert replay.decode_event_cursor(replay.encode_event_cursor(event_id)) == event_id


@pytest.mark.parametrize(
    "value",
    (
        replay.Member(1, "AA", "active", _at(D)),
        replay.Origin("by_hand", None, None, None, None, None),
        replay.Universe(
            UUID(int=1),
            "u",
            "active",
            _at(D),
            None,
            [],
            replay.Origin("by_hand", None, None, None, None, None),
            D,
            False,
        ),
        replay.UniverseEvent(1, "created", "u", None, _at(D), D),
        ReplayEvent(1, "created", None, _at(D), D),
        replay.UniverseRow(UUID(int=1), "u", "active", _at(D), None),
    ),
)
def test_the_replayed_types_are_immutable(value: object) -> None:
    with pytest.raises(AttributeError):
        value.__setattr__(next(iter(vars(value))), None)


# Implements TC-COMP-051
def test_universe_cursor_round_trips() -> None:
    created_at = datetime(2026, 10, 1, 12, 30, 45, 123456, tzinfo=UTC)
    universe_id = UUID("6f1c2a54-0000-4000-8000-00000000abcd")

    cursor = replay.encode_universe_cursor(created_at, universe_id)

    assert replay.decode_universe_cursor(cursor) == (created_at, universe_id)
    payload = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    assert payload["v"] == 1


def _raw(payload: object) -> str:
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")


@pytest.mark.parametrize(
    "cursor",
    (
        "",
        "!!! not base64 !!!",
        _raw([1, 2]),
        _raw({"v": 2, "id": 5}),
        _raw({"v": 1}),
        _raw({"v": 1, "id": "five"}),
        _raw({"v": 1, "id": True}),
    ),
)
def test_a_bad_event_cursor_raises_cursor_error(cursor: str) -> None:
    with pytest.raises(CursorError):
        replay.decode_event_cursor(cursor)


@pytest.mark.parametrize(
    "cursor",
    (
        "",
        "!!! not base64 !!!",
        _raw([1, 2]),
        _raw(
            {
                "v": 2,
                "ts": "2026-10-01T00:00:00+00:00",
                "id": "6f1c2a54-0000-4000-8000-00000000abcd",
            }
        ),
        _raw({"v": 1, "ts": "2026-10-01T00:00:00+00:00"}),
        _raw({"v": 1, "id": "6f1c2a54-0000-4000-8000-00000000abcd"}),
        _raw({"v": 1, "ts": "not a date", "id": "6f1c2a54-0000-4000-8000-00000000abcd"}),
        _raw({"v": 1, "ts": "2026-10-01T00:00:00+00:00", "id": "not a uuid"}),
        _raw({"v": 1, "ts": "2026-10-01T00:00:00+00:00", "id": 5}),
        _raw({"v": 1, "ts": 5, "id": "6f1c2a54-0000-4000-8000-00000000abcd"}),
    ),
)
def test_a_bad_universe_cursor_raises_cursor_error(cursor: str) -> None:
    with pytest.raises(CursorError):
        replay.decode_universe_cursor(cursor)


def test_no_provenance_is_by_hand_with_every_other_field_none() -> None:
    assert replay.origin_from_provenance(None) == replay.Origin(
        kind="by_hand",
        set_id=None,
        classification_date=None,
        thresholds=None,
        hide_incomplete=None,
        symbol=None,
    )


def test_full_provenance_maps_to_a_typed_origin_with_exact_decimals() -> None:
    provenance = {
        "set_id": "6f1c2a54-0000-4000-8000-00000000abcd",
        "classification_date": "2026-10-15",
        "thresholds": {
            "value_percentile_min": 80,
            "momentum_score_min": 0.5,
            "growth_score_max": 0.1,
        },
        "hide_incomplete": True,
        "symbol": "AA",
    }

    origin = replay.origin_from_provenance(provenance)

    assert origin.kind == "from_filter"
    assert origin.set_id == UUID("6f1c2a54-0000-4000-8000-00000000abcd")
    assert origin.classification_date == date(2026, 10, 15)
    assert origin.thresholds == {
        "value_percentile_min": Decimal("80"),
        "momentum_score_min": Decimal("0.5"),
        "growth_score_max": Decimal("0.1"),
    }
    assert origin.thresholds is not None
    assert all(isinstance(v, Decimal) for v in origin.thresholds.values())
    assert origin.hide_incomplete is True
    assert origin.symbol == "AA"


def test_provenance_with_no_search_prefix_has_symbol_none() -> None:
    origin = replay.origin_from_provenance(
        {
            "set_id": "6f1c2a54-0000-4000-8000-00000000abcd",
            "classification_date": "2026-10-15",
            "thresholds": {},
            "hide_incomplete": False,
            "symbol": None,
        }
    )

    assert origin.symbol is None
    assert origin.hide_incomplete is False


def test_empty_thresholds_object_is_empty_not_none() -> None:
    origin = replay.origin_from_provenance(
        {
            "set_id": "6f1c2a54-0000-4000-8000-00000000abcd",
            "classification_date": "2026-10-15",
            "thresholds": {},
            "hide_incomplete": False,
            "symbol": None,
        }
    )

    assert origin.thresholds == {}


def test_an_out_of_range_limit_is_refused_before_the_connection_is_touched() -> None:
    for limit in (0, -1, MAX_PAGE_SIZE + 1):
        with pytest.raises(ValueError):
            replay.list_events(None, UUID(int=1), limit, None)  # type: ignore[arg-type]
        with pytest.raises(ValueError):
            replay.list_universe_rows(None, "all", None, limit, None)  # type: ignore[arg-type]


def test_an_unknown_lifecycle_is_refused_before_the_connection_is_touched() -> None:
    with pytest.raises(ValueError):
        replay.list_universe_rows(None, "everything", None, 5, None)  # type: ignore[arg-type]
