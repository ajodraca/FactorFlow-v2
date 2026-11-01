"""The volume population is not degenerate (CAP-002-E2-S7).

The 3000-instrument proof of ``test_engine_volume.py`` would pass the time budget by doing less
work if its population left inputs ``missing`` or its corporate actions outside the momentum
windows. The same population at 40 stocks, built through the real stages, shows every input
present, every stock classified on every factor and the dividends and splits applied, at a cost
of seconds and in the normal ``postgres`` run (DAC-E2-S7-1, DEC-0123).
"""

from datetime import date
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import engine
from tests.integration.engine_inputs_support import (
    inputs_for,
    install_test_line_items,
    months_before,
)
from tests.integration.engine_proof_support import (
    complete_and_open_next,
    populate_volume,
    volume_sessions,
)
from tests.integration.engine_support import migrate_through_classification

STOCKS = 40
LAST_SESSION = date(2026, 11, 13)  # a Friday; the classification date, as test_engine_volume.py


def test_volume_sessions_reach_the_12_month_window() -> None:
    """DAC-E2-S7-1: 273 distinct weekdays ending on the last session and reaching back over 13
    months, so ``return_12m`` has its start bar (DEC-0055 (3))."""
    sessions = volume_sessions(LAST_SESSION)

    assert len(sessions) == 273
    assert len(set(sessions)) == 273
    assert sessions == sorted(sessions)
    assert all(day.weekday() < 5 for day in sessions)
    assert sessions[-1] == LAST_SESSION
    assert sessions[0] <= months_before(LAST_SESSION, 13)


@pytest.mark.postgres
def test_forty_stock_population_builds_with_every_input_present(
    postgres_connection_string: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E2-S7-1, DEC-0123: the heaviest path. Every input present, every stock classified,
    each stock holding 273 bars, 24 statement rows and its dividend, and the momentum inputs
    applying the dividend (and every tenth stock's split) inside their windows."""
    conn = migrate_through_classification(postgres_connection_string)
    try:
        ids, classification_date = populate_volume(conn, STOCKS, last_session=LAST_SESSION)
        set_id = complete_and_open_next(conn, classification_date)
        install_test_line_items(monkeypatch)

        result = engine.build(conn, set_id, 60)

        assert result.state == "complete", result.failure_reason
        assert classification_date == LAST_SESSION
        assert len(ids) == STOCKS
        assert _status_counts(conn, "factor_input", set_id) == [
            ("growth", "present", 2 * STOCKS),
            ("momentum", "present", 3 * STOCKS),
            ("value", "present", 3 * STOCKS),
        ]
        assert _status_counts(conn, "factor_classification", set_id) == [
            ("growth", "classified", STOCKS),
            ("momentum", "classified", STOCKS),
            ("value", "classified", STOCKS),
        ]
        held = conn.execute(
            "SELECT i.instrument_id, "
            "       (SELECT count(*) FROM daily_bar b WHERE b.instrument_id = i.instrument_id), "
            "       (SELECT count(*) FROM fundamental_observation f "
            "         WHERE f.instrument_id = i.instrument_id), "
            "       (SELECT count(*) FROM corporate_action c "
            "         WHERE c.instrument_id = i.instrument_id AND c.action_type = 'dividend') "
            "  FROM unnest(%s::bigint[]) AS i (instrument_id) ORDER BY 1",
            (ids,),
        ).fetchall()
        conn.commit()
        assert held == [(instrument_id, 273, 24, 1) for instrument_id in ids]

        for position, instrument_id in enumerate(ids, start=1):
            inputs = inputs_for(conn, set_id, instrument_id)
            for months in (3, 6, 12):
                detail = inputs[f"return_{months}m"]["detail"]
                assert len(detail["dividends"]) == 1, (instrument_id, months)
                # Every tenth stock's split is dated inside the 6- and 12-month windows only.
                split_expected = position % 10 == 0 and months in (6, 12)
                assert len(detail["splits"]) == (1 if split_expected else 0), (
                    instrument_id,
                    months,
                )
    finally:
        conn.close()


_STATUS_COUNTS_SQL = {
    "factor_input": (
        "SELECT factor, status, count(*) FROM factor_input "
        "WHERE set_id = %s GROUP BY 1, 2 ORDER BY 1, 2"
    ),
    "factor_classification": (
        "SELECT factor, status, count(*) FROM factor_classification "
        "WHERE set_id = %s GROUP BY 1, 2 ORDER BY 1, 2"
    ),
}


def _status_counts(
    conn: psycopg.Connection, table: str, set_id: UUID
) -> list[tuple[str, str, int]]:
    """Rows of the set in ``table`` by factor and status."""
    rows = conn.execute(_STATUS_COUNTS_SQL[table], (set_id,)).fetchall()
    conn.commit()
    return [(str(factor), str(status), int(count)) for factor, status, count in rows]
