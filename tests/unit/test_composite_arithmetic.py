"""The composite arithmetic of DEC-0053, run through the real statements (CAP-002-E2-S5).

The arithmetic exists only as SQL, so these tests run ``peer_sets.sql`` and ``classify.sql``
through ``engine._classification_stage`` on PostgreSQL and compare the rows with literal values
and with ``reference_scores``, a pure-Python oracle. Every case runs in a transaction rolled
back at its end, with the peer-set floor patched to 3 so hand-built peer sets stay small (the
floor of 30 is TC-COMP-107's). Traces to DAC-E2-S5-1, DAC-E2-3 and AC-9.
"""

import uuid
from collections.abc import Iterator, Sequence
from decimal import Decimal
from typing import NamedTuple
from unittest.mock import patch
from uuid import UUID

import psycopg
import pytest
from hypothesis import assume, given, settings
from hypothesis import strategies as st
from psycopg import sql

from factorflow.classification import constants, engine
from tests.integration.engine_classify_support import (
    SCORE_PLACES,
    add_terminal_run_and_set,
    insert_factor_inputs,
    insert_instrument,
    make_context,
    reference_composite_dispersion,
    reference_scores,
)
from tests.integration.engine_support import migrate_through_classification

pytestmark = pytest.mark.postgres

Result = tuple[Decimal, Decimal]


class Store(NamedTuple):
    conn: psycopg.Connection
    run_id: UUID
    set_id: UUID


@pytest.fixture(scope="module")
def store(_postgres_admin_connection_string: str) -> Iterator[Store]:
    """One database for the module, holding a succeeded run and its ``building`` set; the
    cases add their stocks inside transactions they roll back."""
    name = f"test_{uuid.uuid4().hex}"
    admin = psycopg.connect(_postgres_admin_connection_string, autocommit=True)
    try:
        admin.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
        base_url = _postgres_admin_connection_string.rsplit("/", 1)[0]
        conn = migrate_through_classification(f"{base_url}/{name}")
        try:
            run_id, set_id = add_terminal_run_and_set(conn)
            yield Store(conn, run_id, set_id)
        finally:
            conn.close()
    finally:
        try:
            admin.execute(
                "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
                "WHERE datname = %s AND pid <> pg_backend_pid()",
                (name,),
            )
            admin.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(name)))
        finally:
            admin.close()


def classify(store: Store, factor: str, stocks: Sequence[Sequence[Decimal]]) -> list[Result]:
    """Classify ``stocks``, each the factor's input values in ``INPUT_NAMES`` order, in a
    transaction rolled back at its end; each stock's ``(score, percentile)`` in order."""
    conn = store.conn
    results: list[Result] = []
    with conn.transaction():
        with conn.cursor() as cur:
            ids = []
            for position, values in enumerate(stocks):
                instrument_id = insert_instrument(cur, f"H{position:03d}", "active")
                insert_factor_inputs(cur, store.set_id, instrument_id, factor, values)
                ids.append(instrument_id)
            with patch.object(constants, "MIN_PEER_SET_SIZE", 3):
                engine._classification_stage(
                    conn, make_context(store.set_id, store.run_id, ids, ())
                )
            cur.execute(
                "SELECT instrument_id, status, score, percentile FROM factor_classification "
                "WHERE set_id = %s AND factor = %s",
                (store.set_id, factor),
            )
            found = {row[0]: row[1:] for row in cur.fetchall()}
        assert sorted(found) == sorted(ids)
        assert {status for status, _, _ in found.values()} == {"classified"}
        results = [(found[i][1], found[i][2]) for i in ids]
        raise psycopg.Rollback
    return results


def growth(first: Sequence[int], second: Sequence[int]) -> list[list[Decimal]]:
    """Stocks on ``growth``, the factor with two inputs: ``revenue_growth``, then
    ``eps_growth`` (``constants.INPUT_NAMES``)."""
    return [[Decimal(a), Decimal(b)] for a, b in zip(first, second, strict=True)]


def literal(*pairs: tuple[str, str]) -> list[Result]:
    return [(Decimal(score), Decimal(percentile)) for score, percentile in pairs]


def test_cases_name_the_growth_inputs_in_order() -> None:
    """DAC-E2-S5-1: the hand-built cases give ``revenue_growth`` first, ``eps_growth`` second."""
    assert constants.INPUT_NAMES["growth"] == ("revenue_growth", "eps_growth")


# Implements TC-COMP-069
def test_common_z_scores_are_already_standardised(store: Store) -> None:
    """(a) Both inputs have the same z-scores, (v - 3) / sqrt(2.5) with the sample standard
    deviation, so the composite equals them and re-standardising leaves it unchanged."""
    results = classify(store, "growth", growth([1, 2, 3, 4, 5], [10, 20, 30, 40, 50]))

    assert results == literal(
        ("-1.264911", "0"),
        ("-0.632456", "25"),
        ("0", "50"),
        ("0.632456", "75"),
        ("1.264911", "100"),
    )


# Implements TC-COMP-069
def test_uncorrelated_inputs_are_re_standardised(store: Store) -> None:
    """(b) Deviations x1 = (-2, -1, 0, 1, 2) and x2 = (1, -2, 0, 2, -1) from the mean 3 are
    uncorrelated (sum x1 * x2 = 0). The composite (x1 + x2) / (2 sqrt(2.5)) has sample
    standard deviation sqrt(2) / 2, not 1, so re-standardising rescales it to
    (x1 + x2) / sqrt(5)."""
    first, second = [1, 2, 3, 4, 5], [4, 1, 3, 5, 2]
    x1, x2 = [v - 3 for v in first], [v - 3 for v in second]
    assert sum(a * b for a, b in zip(x1, x2, strict=True)) == 0
    sums = [a + b for a, b in zip(x1, x2, strict=True)]  # -1, -3, 0, 3, 1
    composite = [Decimal(s) / (2 * Decimal("2.5").sqrt()) for s in sums]
    composite_sd = (sum((c * c for c in composite), Decimal(0)) / 4).sqrt()
    assert abs(composite_sd - Decimal(2).sqrt() / 2) < Decimal("1e-20")
    scores = [(Decimal(s) / Decimal(5).sqrt()).quantize(SCORE_PLACES) for s in sums]
    percentiles = [Decimal(p) for p in (25, 0, 50, 100, 75)]

    results = classify(store, "growth", growth(first, second))

    assert results == list(zip(scores, percentiles, strict=True))
    assert scores == [Decimal(s) for s in ("-0.447214", "-1.341641", "0", "1.341641", "0.447214")]
    oracle = reference_scores(dict(enumerate(growth(first, second))))
    assert all(
        abs(results[i][0] - oracle[i][0]) <= SCORE_PLACES and results[i][1] == oracle[i][1]
        for i in range(5)
    )


# Implements TC-COMP-069
def test_a_zero_dispersion_input_contributes_zero(store: Store) -> None:
    """(c) ``eps_growth`` is 7 for every stock: its z-score is 0, so the composite is half
    the other input's z-score, and re-standardising returns that z-score."""
    results = classify(store, "growth", growth([1, 2, 3, 4, 5], [7, 7, 7, 7, 7]))

    assert results == literal(
        ("-1.264911", "0"),
        ("-0.632456", "25"),
        ("0", "50"),
        ("0.632456", "75"),
        ("1.264911", "100"),
    )


# Implements TC-COMP-069
def test_every_input_without_dispersion_scores_zero_without_dividing_by_zero(
    store: Store,
) -> None:
    """(d) Both inputs are constant: every z-score, composite and score is 0, and the tied
    stocks all take percentile 0."""
    results = classify(store, "growth", growth([2, 2, 2, 2, 2], [9, 9, 9, 9, 9]))

    assert results == literal(*[("0", "0")] * 5)


# Implements TC-COMP-069
def test_opposite_inputs_cancel_to_a_constant_composite(store: Store) -> None:
    """(e) ``eps_growth`` is minus ``revenue_growth``: the z-scores cancel exactly, the
    composite is 0 for every stock and its zero dispersion gives score 0."""
    a = [1, 2, 4, 8, 16]

    results = classify(store, "growth", growth(a, [-v for v in a]))

    assert results == literal(*[("0", "0")] * 5)


# --- properties over random peer sets -----------------------------------------------------

VALUES = st.decimals(
    min_value=-1000, max_value=1000, places=4, allow_nan=False, allow_infinity=False
)


@st.composite
def peer_sets(draw: st.DrawFn) -> tuple[str, list[list[Decimal]]]:
    """A factor and 3 to 12 stocks, each with one value per input of the factor; every input
    column holds distinct values."""
    factor = draw(st.sampled_from(constants.FACTORS))
    n = draw(st.integers(min_value=3, max_value=12))
    columns = [
        draw(st.lists(VALUES, min_size=n, max_size=n, unique=True))
        for _ in constants.INPUT_NAMES[factor]
    ]
    return factor, [list(row) for row in zip(*columns, strict=True)]


def close(left: Sequence[Result], right: Sequence[Result]) -> bool:
    return len(left) == len(right) and all(
        abs(a[0] - b[0]) <= Decimal("2e-6") and abs(a[1] - b[1]) <= Decimal("1e-5")
        for a, b in zip(left, right, strict=True)
    )


# Implements TC-COMP-069
@settings(deadline=None, max_examples=40)
@given(case=peer_sets(), data=st.data())
def test_properties_hold_over_random_peer_sets(
    store: Store, case: tuple[str, list[list[Decimal]]], data: st.DataObject
) -> None:
    factor, stocks = case
    n = len(stocks)
    # Distinct values do not rule out inputs whose z-scores cancel, as A and -2A + 1 do. Their
    # composite is constant, numeric rounding leaves it a spread near 1e-17, and
    # re-standardising turns that into noise. That is the plan's open gap, left to the owner,
    # so the examples avoid it rather than assert on it (T013). Hand-built cases (d) and (e)
    # cover the exactly constant composite.
    assume(reference_composite_dispersion(dict(enumerate(stocks))) >= Decimal("1e-9"))
    with store.conn.transaction():
        results = classify(store, factor, stocks)

        oracle = reference_scores(dict(enumerate(stocks)))
        assert close(results, [oracle[i] for i in range(n)])

        scores = [score for score, _ in results]
        mean = sum(scores, Decimal(0)) / n
        sd = (sum(((s - mean) ** 2 for s in scores), Decimal(0)) / (n - 1)).sqrt()
        assert abs(mean) <= Decimal("1e-5")
        assert abs(sd - 1) <= Decimal("1e-5")

        ordered = sorted(results)
        assert all(0 <= percentile <= 100 for _, percentile in results)
        assert all(low[1] <= high[1] for low, high in zip(ordered, ordered[1:], strict=False))
        assert ordered[0][1] == 0
        top = max(score for score, _ in oracle.values())
        if sum(1 for score, _ in oracle.values() if score == top) == 1:
            assert ordered[-1][1] == 100  # tied top scores share the lowest rank

        # Adding a constant to one input changes no score, nor does multiplying it by a
        # positive constant. Only scores: two stocks whose composites tie exactly (one's
        # inputs are the other's, swapped between two inputs holding the same values) can
        # differ by a rounding error once one input is moved, and percent_rank orders them.
        k = data.draw(st.integers(min_value=0, max_value=len(stocks[0]) - 1), label="input")
        shift = data.draw(st.decimals(min_value=-100, max_value=100, places=4), label="shift")
        scale = data.draw(st.decimals(min_value="0.01", max_value=100, places=2), label="scale")
        for moved in (
            [[v + shift if j == k else v for j, v in enumerate(s)] for s in stocks],
            [[v * scale if j == k else v for j, v in enumerate(s)] for s in stocks],
        ):
            moved_scores = [score for score, _ in classify(store, factor, moved)]
            assert all(
                abs(after - before) <= Decimal("2e-6")
                for after, before in zip(moved_scores, scores, strict=True)
            )

        # Permuting the stocks permutes the results and changes no value.
        order = data.draw(st.permutations(range(n)), label="order")
        permuted = classify(store, factor, [stocks[i] for i in order])
        assert close(permuted, [results[i] for i in order])
        raise psycopg.Rollback
