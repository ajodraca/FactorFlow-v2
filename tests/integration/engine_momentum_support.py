"""Helpers for the factor engine's momentum-stage tests (CAP-002-E2-S4).

A plain module rather than ``conftest.py``. It builds on CAP-002-E2-S2's ``engine_support``
and CAP-002-E2-S3's ``engine_inputs_support`` without editing either: S2's ``add_bar`` takes
no ``recorded_at`` and derives its hash from the close alone, so a session re-acquired with
the same close on another day could not be written twice. Every writing helper commits, so
the build's connection sees what a test wrote.
"""

import hashlib
import json
from collections.abc import Mapping
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest

from factorflow.classification import engine
from factorflow.classification.engine import BuildResult
from tests.integration.engine_inputs_support import inputs_for
from tests.integration.engine_support import (
    add_building_set,
    add_instrument,
    add_run,
    migrate_through_classification,
)

__all__ = [
    "add_bar_observed",
    "add_building_set",
    "add_close_series",
    "add_corporate_action",
    "add_instrument",
    "add_run",
    "inputs_for",
    "migrate_through_classification",
    "momentum_fixture_dates",
    "run_momentum_stages",
]


def _digest(*parts: object) -> bytes:
    return hashlib.sha256(json.dumps([str(part) for part in parts]).encode()).digest()


def add_bar_observed(
    conn: psycopg.Connection,
    instrument_id: int,
    session_date: date,
    close: Decimal | int,
    observed_on: date | None = None,
    recorded_at: datetime | None = None,
) -> None:
    """One ``daily_bar`` row; ``observed_on`` defaults to the session date and
    ``recorded_at`` to the database's ``now()``.

    ``value_hash`` covers every column written, so a session re-acquired on another day or
    at another time is a distinct row, as ingestion keeps it (C5).
    """
    observed = session_date if observed_on is None else observed_on
    conn.execute(
        "INSERT INTO daily_bar (instrument_id, session_date, observed_on, value_hash, "
        "open_price, high_price, low_price, close_price, volume, recorded_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1000, coalesce(%s, now()))",
        (
            instrument_id,
            session_date,
            observed,
            _digest(instrument_id, session_date, observed, close, recorded_at),
            close,
            close,
            close,
            close,
            recorded_at,
        ),
    )
    conn.commit()


def add_close_series(
    conn: psycopg.Connection, instrument_id: int, closes: Mapping[date, Decimal | int]
) -> None:
    """One bar per ``{session_date: close}`` entry, each observed on its session date."""
    for session_date, close in closes.items():
        add_bar_observed(conn, instrument_id, session_date, close)


def add_corporate_action(
    conn: psycopg.Connection,
    instrument_id: int,
    action_type: str,
    effective_on: date,
    payload: Mapping[str, Any],
    observed_on: date | None = None,
    recorded_at: datetime | None = None,
) -> None:
    """One ``corporate_action`` row; ``observed_on`` defaults to ``effective_on``.

    The stored payload is what ``CorporateAction.value_payload()`` writes: the action type
    and effective date beside the endpoint's own fields. A caller passes those fields as
    ingestion stores them, Decimal values as JSON strings (``{"split_from": "1"}``), or as
    JSON numbers for the variant that reads them (DEC-0117 (2)).
    """
    observed = effective_on if observed_on is None else observed_on
    text = json.dumps({"action_type": action_type, "effective_on": str(effective_on), **payload})
    conn.execute(
        "INSERT INTO corporate_action (instrument_id, action_type, effective_on, observed_on, "
        "value_hash, payload, recorded_at) "
        "VALUES (%s, %s, %s, %s, %s, %s::jsonb, coalesce(%s, now()))",
        (
            instrument_id,
            action_type,
            effective_on,
            observed,
            _digest(instrument_id, action_type, effective_on, observed, text, recorded_at),
            text,
            recorded_at,
        ),
    )
    conn.commit()


def run_momentum_stages(
    conn: psycopg.Connection, set_id: UUID, monkeypatch: pytest.MonkeyPatch
) -> BuildResult:
    """Build ``set_id`` with the fundamentals and momentum stages only.

    The fundamentals stage creates the temporary table ``inputs`` the momentum stage
    inserts into (DEC-0115). With the real ``LINE_ITEMS`` every value and growth input is
    ``missing``, which the momentum tests ignore. No classification stage runs.
    """
    monkeypatch.setattr(
        engine, "_STAGES", [engine._fundamental_inputs_stage, engine._momentum_inputs_stage]
    )
    return engine.build(conn, set_id, 60)


def momentum_fixture_dates() -> dict[str, date]:
    """The boundary targets for classification date 2026-10-17: E is one month before it,
    S_k k months before E (DEC-0055 (3))."""
    return {
        "E": date(2026, 9, 17),
        "S_3": date(2026, 6, 17),
        "S_6": date(2026, 3, 17),
        "S_12": date(2025, 9, 17),
    }
