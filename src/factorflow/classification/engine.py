"""The factor engine's build transaction (CAP-002-E2-S2).

Implements ``component-design-factor-engine.md`` sections 2.2 and 2.3. ``build`` runs an
ordered list of stages inside one ``REPEATABLE READ`` transaction with a local
``statement_timeout``, completes the set in that transaction, and on any exception rolls
back every row of the attempt and records the set ``failed`` in a new transaction, so no
reader sees half a set. No factor is computed here: this story supplies the spine.

Satisfies AC-10, AC-11, AC-15, AC-19, AC-20, DAC-E2-9, DAC-E2-10 and DAC-E2-S2-1 through
DAC-E2-S2-6.
"""

import logging
import math
from collections.abc import Callable
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Final
from uuid import UUID

import psycopg

log = logging.getLogger(__name__)

_SQL_DIR = Path(__file__).parent / "sql"
_SET_CONTEXT_SQL: Final = (_SQL_DIR / "set_context.sql").read_text()
_COMPLETE_SET_SQL: Final = (_SQL_DIR / "complete_set.sql").read_text()
_FAIL_SET_SQL: Final = (_SQL_DIR / "fail_set.sql").read_text()
_QUALIFIED_COUNTS_SQL: Final = (
    "SELECT factor, qualified_count FROM classification_set_factor WHERE set_id = %(set_id)s"
)


@dataclass(frozen=True)
class BuildContext:
    set_id: UUID
    run_id: UUID
    classification_date: date
    latest_trading_day: date | None
    active_ids: tuple[int, ...]
    retired_ids: tuple[int, ...]


@dataclass(frozen=True)
class BuildResult:
    set_id: UUID
    state: str
    failure_reason: str | None
    active_instruments: int
    qualified_counts: dict[str, int]


Stage = Callable[[psycopg.Connection, BuildContext], None]

_STAGES: list[Stage] = []
"""Stages run in the design 2.2 order: inputs, peer sets, classification.

Registration rule (DEC-0121, amending DEC-0112): CAP-002-E2-S5 registers
``_classification_stage`` with ``_STAGES.append(_classification_stage)`` as the last
statement of this module. An input-producing stage (CAP-002-E2-S3's
``_fundamental_inputs_stage``, then CAP-002-E2-S4's ``_momentum_inputs_stage``) is
registered above that line when it is present, and appended at the end of the module
otherwise. Tests replace the list with monkeypatch.
"""


def _read_context(cur: psycopg.Cursor, set_id: UUID) -> BuildContext:
    cur.execute(_SET_CONTEXT_SQL, {"set_id": set_id})
    row = cur.fetchone()
    if row is None:
        raise LookupError(f"classification set {set_id} does not exist")
    return BuildContext(
        set_id=row[0],
        run_id=row[1],
        classification_date=row[2],
        latest_trading_day=row[3],
        active_ids=tuple(row[4]),
        retired_ids=tuple(row[5]),
    )


def _reason(exc: Exception) -> str:
    message = str(exc).splitlines()[0] if str(exc) else ""
    return f"{type(exc).__name__}: {message}"


def build(conn: psycopg.Connection, set_id: UUID, timeout_seconds: float) -> BuildResult:
    """Build the set in one transaction; return its terminal state, never raising for a failure.

    A failure while recording the failure itself (the connection is lost) is not caught: the
    scheduler's start-up reclaim records it (DEC-0067).
    """
    if timeout_seconds <= 0:
        raise ValueError("timeout_seconds must be positive")
    if conn.autocommit:
        raise ValueError("build needs a connection with autocommit off")
    if conn.info.transaction_status != psycopg.pq.TransactionStatus.IDLE:
        raise ValueError("build needs a connection that is not inside a transaction")

    # statement_timeout = 0 disables the timeout, so round up to at least one millisecond.
    timeout_ms = str(max(1, math.ceil(timeout_seconds * 1000)))
    try:
        conn.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")  # DEC-0111
        conn.execute("SELECT set_config('statement_timeout', %(ms)s, true)", {"ms": timeout_ms})
        with conn.cursor() as cur:
            context = _read_context(cur, set_id)
        if context.latest_trading_day is None:
            raise ValueError("no price data held for any active instrument")  # DEC-0114
        for stage in _STAGES:
            stage(conn, context)
        with conn.cursor() as cur:
            cur.execute(
                _COMPLETE_SET_SQL,
                {
                    "set_id": set_id,
                    "latest_trading_day": context.latest_trading_day,
                    "active_instruments": len(context.active_ids),
                },
            )
            if cur.rowcount != 1:
                raise RuntimeError("classification set is no longer building")
            cur.execute(_QUALIFIED_COUNTS_SQL, {"set_id": set_id})
            qualified_counts = {factor: int(count) for factor, count in cur.fetchall()}
        conn.commit()
    except Exception as exc:
        conn.rollback()
        reason = _reason(exc)
        log.error("classification build failed: %s", reason, extra={"set_id": str(set_id)})
        with conn.cursor() as cur:
            cur.execute(_FAIL_SET_SQL, {"set_id": set_id, "reason": reason})
        conn.commit()
        return BuildResult(
            set_id=set_id,
            state="failed",
            failure_reason=reason,
            active_instruments=0,
            qualified_counts={},
        )
    return BuildResult(
        set_id=set_id,
        state="complete",
        failure_reason=None,
        active_instruments=len(context.active_ids),
        qualified_counts=qualified_counts,
    )
