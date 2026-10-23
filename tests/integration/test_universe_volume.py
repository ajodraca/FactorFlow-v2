"""A 3000-member universe created in three calls and replayed (CAP-002-E1-S3).

- TC-COMP-003 (DAC-E1-S3-8): created through ``create_by_hand`` and two ``add_members`` calls
  (a request is capped at ``MAX_SYMBOLS_PER_REQUEST``), then replayed correctly.

Correctness only. No elapsed-time bound is asserted: design section 5 states no latency target
and the suite configures no timeout, as ``test_coverage_volume.py`` does.
"""

from datetime import date, timedelta

import psycopg
import pytest

from factorflow.api.bounds import MAX_SYMBOLS_PER_REQUEST
from factorflow.universes import service
from tests.integration.test_universe_create import conn as conn  # fixture
from tests.integration.test_universe_create import count_events

pytestmark = [pytest.mark.postgres, pytest.mark.slow]

SCALE = 3_000


def _seed(conn: psycopg.Connection) -> list[str]:
    """Seed SCALE covered instruments S0001..S3000 and return their symbols."""
    conn.execute(
        "INSERT INTO instrument (symbol, lifecycle) "
        "SELECT 'S' || lpad(n::text, 4, '0'), 'active' FROM generate_series(1, %s) AS n",
        (SCALE,),
    )
    conn.execute(
        "INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to) "
        "SELECT instrument_id, 'prices', '2024-01-01', '2024-12-31' FROM instrument"
    )
    conn.commit()
    return [f"S{n:04d}" for n in range(1, SCALE + 1)]


def test_a_3000_member_universe_is_created_in_three_calls_and_replayed(
    conn: psycopg.Connection,
) -> None:
    """Implements TC-COMP-003."""
    symbols = _seed(conn)
    chunk = MAX_SYMBOLS_PER_REQUEST
    first, second, third = (symbols[i : i + chunk] for i in range(0, SCALE, chunk))

    created = service.create_by_hand(conn, "Everything", first)
    conn.commit()
    assert len(created.members) == chunk
    for batch in (second, third):
        added, already = service.add_members(conn, created.universe_id, batch)
        conn.commit()
        assert len(added) == chunk
        assert already == []

    universe = service.get_universe(conn, created.universe_id)
    assert [m.symbol for m in universe.members] == symbols
    assert universe.members[0].symbol == "S0001"
    assert universe.members[-1].symbol == "S3000"
    assert count_events(conn) == 1 + SCALE
    created_events = conn.execute(
        "SELECT count(*) FROM universe_event WHERE event_type = 'created'"
    ).fetchone()
    assert created_events == (1,)

    before = count_events(conn)
    for i in range(0, SCALE, chunk):
        added, already = service.add_members(conn, created.universe_id, symbols[i : i + chunk])
        conn.commit()
        assert added == []
        assert len(already) == chunk
    assert count_events(conn) == before

    assert universe.created_on is not None
    today = service.get_universe(conn, created.universe_id, as_of=universe.created_on)
    assert today.members == universe.members
    day_before = service.get_universe(
        conn, created.universe_id, as_of=universe.created_on - timedelta(days=1)
    )
    assert day_before.members == []
    assert day_before.as_of_before_creation is True
    assert isinstance(universe.created_on, date)
