"""Helpers for the classification stage's database tests (CAP-002-E2-S5).

A plain module beside ``engine_support.py``, which CAP-002-E2-S2 owns: it is imported here and
never edited (T002). The committing helpers commit, so a second connection sees their rows;
the ``insert_*`` variants take a cursor and leave the transaction to the caller, for the
property tests that roll every example back. ``reference_scores`` is a pure-Python oracle of
DEC-0053, written independently of the SQL it checks.
"""

import decimal
from collections.abc import Collection, Mapping, Sequence
from datetime import date
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest
from psycopg.rows import dict_row

from factorflow.classification import constants, engine
from tests.integration.engine_support import add_bar, add_building_set, add_instrument, add_run

INPUTS_BY_FACTOR = constants.INPUT_NAMES
CLASSIFICATION_DATE = date(2026, 10, 3)
SESSION_DATE = date(2026, 10, 2)
SCORE_PLACES = Decimal("0.000001")  # score and percentile are stored to 6 decimal places
_VALUE_PLACES = Decimal("1E-10")  # factor_input.value is numeric(30, 10)

_INSERT_INPUT = (
    "INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, value, "
    "as_of, known_on, detail) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, '{}'::jsonb)"
)

Row = tuple[UUID, int, str, str, str, Decimal | None, date, date]


def _default_value(instrument_id: int, position: int) -> Decimal:
    return (Decimal(position + 1) + Decimal(instrument_id) / 1000).quantize(_VALUE_PLACES)


def _input_rows(
    set_id: UUID,
    instrument_id: int,
    factor: str,
    statuses: Mapping[str, str],
    values: Mapping[str, Decimal],
    omit: Collection[str],
) -> list[Row]:
    rows: list[Row] = []
    for position, name in enumerate(INPUTS_BY_FACTOR[factor]):
        if name in omit:
            continue
        status = statuses.get(name, "present")
        value = values.get(name, _default_value(instrument_id, position))
        rows.append(
            (
                set_id,
                instrument_id,
                factor,
                name,
                status,
                value if status == "present" else None,  # the CHECK and DEC-0116 (5)
                SESSION_DATE,
                SESSION_DATE,
            )
        )
    return rows


def add_factor_inputs(
    conn: psycopg.Connection,
    set_id: UUID,
    instrument_id: int,
    factor: str,
    statuses: Mapping[str, str] | None = None,
    values: Mapping[str, Decimal] | None = None,
    omit: Collection[str] = (),
) -> None:
    """One ``factor_input`` row per input of the factor, every one ``present`` unless
    ``statuses`` says otherwise; ``omit`` names inputs that get no row at all."""
    rows = _input_rows(set_id, instrument_id, factor, statuses or {}, values or {}, omit)
    with conn.cursor() as cur:
        cur.executemany(_INSERT_INPUT, rows)
    conn.commit()


def roster_value(i: int, k: int, n: int) -> Decimal:
    """Input ``k`` (of the eight, in ``FACTORS`` order) of roster stock ``i`` of ``n``: no two
    inputs are perfectly correlated and no two stocks share a value."""
    return (Decimal((i * (k + 3)) % n) / n + Decimal(i) / (10 * n * n)).quantize(_VALUE_PLACES)


def add_roster_inputs(conn: psycopg.Connection, set_id: UUID, active_ids: Sequence[int]) -> None:
    """``present`` rows on all eight inputs for each stock, valued by ``roster_value``."""
    n = len(active_ids)
    rows: list[Row] = []
    for i, instrument_id in enumerate(active_ids):
        k = 0
        for factor in constants.FACTORS:
            values: dict[str, Decimal] = {}
            for name in INPUTS_BY_FACTOR[factor]:
                values[name] = roster_value(i, k, n)
                k += 1
            rows += _input_rows(set_id, instrument_id, factor, {}, values, ())
    with conn.cursor() as cur:
        cur.executemany(_INSERT_INPUT, rows)
    conn.commit()


def add_full_roster(
    conn: psycopg.Connection, set_id: UUID, n_active: int, n_retired: int = 0, prefix: str = "S"
) -> tuple[list[int], list[int]]:
    """``n_active`` active stocks with a bar on ``SESSION_DATE`` (so ``latest_trading_day`` is
    defined) and every input ``present``, and ``n_retired`` retired stocks with no input."""
    active = [add_instrument(conn, f"{prefix}{i:03d}") for i in range(n_active)]
    for instrument_id in active:
        add_bar(conn, instrument_id, SESSION_DATE)
    retired = [add_instrument(conn, f"{prefix}R{i:02d}", "retired") for i in range(n_retired)]
    add_roster_inputs(conn, set_id, active)
    return active, retired


def add_active_stock(conn: psycopg.Connection, symbol: str) -> int:
    """An active stock with a bar on ``SESSION_DATE`` and no input yet."""
    instrument_id = add_instrument(conn, symbol)
    add_bar(conn, instrument_id, SESSION_DATE)
    return instrument_id


def add_terminal_run_and_set(conn: psycopg.Connection) -> tuple[UUID, UUID]:
    """A succeeded run and its ``building`` set: ``(run_id, set_id)``."""
    run_id = add_run(conn)
    return run_id, add_building_set(conn, run_id, CLASSIFICATION_DATE)


def run_classification_build(
    conn: psycopg.Connection, set_id: UUID, monkeypatch: pytest.MonkeyPatch
) -> engine.BuildResult:
    """``engine.build`` with only the classification stage, so no input stage runs."""
    monkeypatch.setattr(engine, "_STAGES", [engine._classification_stage])
    return engine.build(conn, set_id, 60)


def classifications_for(
    conn: psycopg.Connection, set_id: UUID
) -> dict[tuple[int, str], dict[str, Any]]:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            "SELECT instrument_id, factor, status, score, percentile, reason_code, reason_input, "
            "reason_detail, restated_possible FROM factor_classification WHERE set_id = %s",
            (set_id,),
        )
        rows = cur.fetchall()
    conn.commit()
    return {(row["instrument_id"], row["factor"]): row for row in rows}


def factor_counts_for(conn: psycopg.Connection, set_id: UUID) -> dict[str, tuple[int, bool]]:
    rows = conn.execute(
        "SELECT factor, qualified_count, ranked FROM classification_set_factor WHERE set_id = %s",
        (set_id,),
    ).fetchall()
    conn.commit()
    return {factor: (count, ranked) for factor, count, ranked in rows}


def input_values(
    conn: psycopg.Connection, set_id: UUID, factor: str, instrument_ids: Collection[int]
) -> dict[int, list[Decimal]]:
    """The stored values of the factor's inputs per stock, in ``INPUT_NAMES`` order: the
    oracle's input, read back so it sees exactly what the statements read."""
    rows = conn.execute(
        "SELECT instrument_id, input_name, value FROM factor_input "
        "WHERE set_id = %s AND factor = %s AND instrument_id = ANY(%s)",
        (set_id, factor, list(instrument_ids)),
    ).fetchall()
    conn.commit()
    by_stock: dict[int, dict[str, Decimal]] = {}
    for instrument_id, name, value in rows:
        by_stock.setdefault(instrument_id, {})[name] = value
    return {
        instrument_id: [values[name] for name in INPUTS_BY_FACTOR[factor]]
        for instrument_id, values in by_stock.items()
    }


def scores_of(
    rows: Mapping[tuple[int, str], Mapping[str, Any]], factor: str
) -> dict[int, tuple[Decimal, Decimal]]:
    """``(score, percentile)`` of each ``classified`` row of the factor."""
    return {
        instrument_id: (row["score"], row["percentile"])
        for (instrument_id, row_factor), row in rows.items()
        if row_factor == factor and row["status"] == "classified"
    }


def matches_reference(
    actual: Mapping[int, tuple[Decimal, Decimal]],
    expected: Mapping[int, tuple[Decimal, Decimal]],
    score_tolerance: Decimal = SCORE_PLACES,
    percentile_tolerance: Decimal = SCORE_PLACES,
) -> bool:
    """The same stocks, each score and percentile within the tolerance (6 decimals)."""
    return actual.keys() == expected.keys() and all(
        abs(actual[i][0] - expected[i][0]) <= score_tolerance
        and abs(actual[i][1] - expected[i][1]) <= percentile_tolerance
        for i in expected
    )


# --- non-committing variants, for examples rolled back by the caller ----------------------


def insert_instrument(cur: psycopg.Cursor[Any], symbol: str, lifecycle: str) -> int:
    cur.execute(
        "INSERT INTO instrument (symbol, lifecycle, retired_at) "
        "VALUES (%s, %s, CASE WHEN %s = 'retired' THEN now() END) RETURNING instrument_id",
        (symbol, lifecycle, lifecycle),
    )
    row = cur.fetchone()
    assert row is not None
    return int(row[0])


def insert_factor_inputs(
    cur: psycopg.Cursor[Any],
    set_id: UUID,
    instrument_id: int,
    factor: str,
    values: Sequence[Decimal],
) -> None:
    """``present`` rows for the first ``len(values)`` inputs of the factor, the k-th value
    being input ``INPUT_NAMES[factor][k]``."""
    names = INPUTS_BY_FACTOR[factor]
    given = dict(zip(names[: len(values)], values, strict=True))
    cur.executemany(
        _INSERT_INPUT,
        _input_rows(set_id, instrument_id, factor, {}, given, omit=names[len(values) :]),
    )


def make_context(
    set_id: UUID, run_id: UUID, active_ids: Sequence[int], retired_ids: Sequence[int]
) -> engine.BuildContext:
    return engine.BuildContext(
        set_id=set_id,
        run_id=run_id,
        classification_date=CLASSIFICATION_DATE,
        latest_trading_day=SESSION_DATE,
        active_ids=tuple(active_ids),
        retired_ids=tuple(retired_ids),
    )


# --- the oracle ---------------------------------------------------------------------------


def _mean(values: Sequence[Decimal]) -> Decimal:
    return sum(values, Decimal(0)) / len(values)


def _sample_sd(values: Sequence[Decimal]) -> Decimal:
    mean = _mean(values)
    return (sum(((v - mean) ** 2 for v in values), Decimal(0)) / (len(values) - 1)).sqrt()


def _standardised(values: Sequence[Decimal]) -> list[Decimal]:
    """z-scores with the sample mean and sample standard deviation; 0 when it is zero."""
    mean, sd = _mean(values), _sample_sd(values)
    return [Decimal(0) if sd == 0 else (v - mean) / sd for v in values]


def _composite(peer: Mapping[int, Sequence[Decimal]], ids: Sequence[int]) -> list[Decimal]:
    """Each stock's equal-weight mean of its inputs' z-scores, in ``ids`` order."""
    columns = [_standardised(column) for column in zip(*(peer[i] for i in ids), strict=True)]
    return [_mean([column[row] for column in columns]) for row in range(len(ids))]


def reference_composite_dispersion(peer: Mapping[int, Sequence[Decimal]]) -> Decimal:
    """The sample standard deviation of the oracle's composite, before re-standardising."""
    with decimal.localcontext() as context:
        context.prec = 40
        return _sample_sd(_composite(peer, sorted(peer)))


def reference_scores(peer: Mapping[int, Sequence[Decimal]]) -> dict[int, tuple[Decimal, Decimal]]:
    """DEC-0053 at 40 significant digits: per input column the sample z-score (a zero standard
    deviation gives 0), the equal-weight mean of a stock's z-scores, that composite
    re-standardised the same way, and ``percent_rank`` x 100 as ``(rank - 1) / (n - 1)`` with
    ties sharing the lowest rank. Keys are instrument ids; values are ``(score, percentile)``."""
    with decimal.localcontext() as context:
        context.prec = 40
        ids = sorted(peer)
        n = len(ids)
        scores = _standardised(_composite(peer, ids))
        result: dict[int, tuple[Decimal, Decimal]] = {}
        for row, instrument_id in enumerate(ids):
            rank = 1 + sum(1 for other in scores if other < scores[row])
            percentile = Decimal(0) if n == 1 else Decimal(100) * (rank - 1) / (n - 1)
            result[instrument_id] = (scores[row], percentile)
    return result
