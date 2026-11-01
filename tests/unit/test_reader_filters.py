"""The filter models and the import-order guard (CAP-002-E3-S2).

Proves the model half of DAC-E3-S2-7 and DAC-E3-2 (TC-COMP-122): an empty ``Thresholds``
constrains nothing, and ``Thresholds`` and ``ListFilters`` refuse every value the reader
design section 4 bounds (SEC-INP-001). ``ListFilters.symbols`` is size- and shape-checked by
CAP-002-E3-S3 (DEC-0127, DEC-0132): DAC-E3-S3-1, TC-COMP-123.
"""

import dataclasses
import subprocess
import sys
from decimal import Decimal
from itertools import product

import pytest

from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.classification import reader

TWELVE = [
    f"{factor}_{metric}_{end}"
    for factor, metric, end in product(reader.FACTORS, ("score", "percentile"), ("min", "max"))
]


# Implements TC-COMP-122
def test_empty_thresholds_constrain_nothing() -> None:
    """DAC-E3-S2-7: all bounds null and hide_incomplete false."""
    thresholds = reader.Thresholds()
    assert thresholds.bounds == {}
    assert thresholds.hide_incomplete is False
    assert thresholds.symbol is None
    assert thresholds.factors_constrained() == set()


def test_thresholds_accept_the_twelve_bounds() -> None:
    assert len(TWELVE) == 12
    thresholds = reader.Thresholds(bounds={name: Decimal("50") for name in TWELVE})
    assert thresholds.factors_constrained() == set(reader.FACTORS)


@pytest.mark.parametrize(
    ("bounds", "constrained"),
    [
        ({"value_score_min": Decimal("1")}, {"value"}),
        ({"growth_percentile_max": Decimal("70")}, {"growth"}),
        (
            {"momentum_score_max": Decimal("0"), "value_percentile_min": Decimal("0")},
            {"momentum", "value"},
        ),
    ],
)
def test_factors_constrained_names_exactly_the_bounded_factors(
    bounds: dict[str, Decimal], constrained: set[str]
) -> None:
    assert reader.Thresholds(bounds=bounds).factors_constrained() == constrained


@pytest.mark.parametrize(
    "bounds",
    [
        {"value_rank_min": Decimal("1")},
        {"price_score_min": Decimal("1")},
        {"value_score": Decimal("1")},
        {"value_score_min": 1.5},
        {"value_score_min": 1},
        {"value_score_min": True},
        {"value_score_min": "1"},
        {"value_score_min": Decimal("NaN")},
        {"value_score_max": Decimal("Infinity")},
        {"growth_score_min": Decimal("-Infinity")},
        {"value_percentile_min": Decimal("-0.1")},
        {"momentum_percentile_max": Decimal("100.1")},
        {"growth_percentile_min": Decimal("NaN")},
    ],
)
def test_thresholds_refuse_bad_bounds(bounds: dict[str, object]) -> None:
    with pytest.raises(ValueError):
        reader.Thresholds(bounds=bounds)  # type: ignore[arg-type]


@pytest.mark.parametrize("edge", [Decimal("0"), Decimal("100")])
def test_percentile_bounds_are_inclusive_of_0_and_100(edge: Decimal) -> None:
    reader.Thresholds(bounds={"value_percentile_min": edge, "value_percentile_max": edge})


def test_hide_incomplete_must_be_a_boolean() -> None:
    assert reader.Thresholds(hide_incomplete=True).hide_incomplete is True
    with pytest.raises(ValueError):
        reader.Thresholds(hide_incomplete=1)  # type: ignore[arg-type]


def test_symbol_prefix_is_upper_cased() -> None:
    assert reader.Thresholds(symbol="aa").symbol == "AA"
    assert reader.Thresholds(symbol="brk.b").symbol == "BRK.B"
    assert reader.Thresholds(symbol="A" * 16).symbol == "A" * 16


@pytest.mark.parametrize("prefix", ["", "1A", "A%", "A_", "A B", "A" * 17, "-A", 7])
def test_symbol_prefix_outside_the_symbol_shape_is_refused(prefix: object) -> None:
    with pytest.raises(ValueError):
        reader.Thresholds(symbol=prefix)  # type: ignore[arg-type]


def test_list_filters_defaults() -> None:
    filters = reader.ListFilters()
    assert filters.universe_id is None
    assert filters.symbols is None
    assert filters.sort == "symbol"
    assert filters.order == "asc"
    assert filters.thresholds == reader.Thresholds()
    assert filters.limit == DEFAULT_PAGE_SIZE
    assert filters.cursor is None


@pytest.mark.parametrize("limit", [1, MAX_PAGE_SIZE])
def test_limit_bounds_are_inclusive(limit: int) -> None:
    assert reader.ListFilters(limit=limit).limit == limit


@pytest.mark.parametrize("limit", [0, -1, MAX_PAGE_SIZE + 1, True, 1.0])
def test_limit_outside_the_bounds_is_refused(limit: object) -> None:
    with pytest.raises(ValueError):
        reader.ListFilters(limit=limit)  # type: ignore[arg-type]


@pytest.mark.parametrize("order", ["ASC", "up", "", None, "asc "])
def test_order_outside_the_enumeration_is_refused(order: object) -> None:
    with pytest.raises(ValueError):
        reader.ListFilters(order=order)  # type: ignore[arg-type]


def test_order_desc_is_accepted() -> None:
    assert reader.ListFilters(order="desc").order == "desc"


def test_escape_like_makes_wildcards_literal() -> None:
    """Defence in depth behind the symbol shape check (task plan Resolved Conflicts)."""
    assert reader.escape_like("A%_\\") == "A\\%\\_\\\\"
    assert reader.escape_like("BRK.B") == "BRK.B"


def test_input_reasons_are_the_three_input_codes() -> None:
    """DAC-E3-4: what incomplete means (DEC-0079)."""
    assert reader.INPUT_REASONS == ("input_missing", "input_outdated", "input_not_computable")


def test_reader_does_not_import_the_universe_service() -> None:
    """CAP-002-E1-S5 imports the reader from the service; the reverse would be a cycle."""
    code = (
        "import sys, factorflow.classification.reader; "
        "assert 'factorflow.universes.service' not in sys.modules"
    )
    subprocess.run([sys.executable, "-I", "-c", code], check=True)


@pytest.mark.parametrize(
    "instance",
    [
        reader.Thresholds(),
        reader.ListFilters(),
        reader.FactorCell("classified", Decimal("1"), Decimal("50"), None, None, None, False),
        reader.StockRow(1, "AA", None, "active", {}),
        reader.ClassificationPage(None, True, None, 0, [], [], None),
    ],
)
def test_list_models_are_frozen(instance: object) -> None:
    """The read models are values: a caller cannot alter a filter after validation."""
    field = dataclasses.fields(instance)[0].name  # type: ignore[arg-type]
    with pytest.raises(dataclasses.FrozenInstanceError):
        setattr(instance, field, None)


# --- CAP-002-E3-S3: the compare bound, symbol shape and normalisation -------------------------


@pytest.mark.parametrize("symbols", [["AAA"], ["A", "B", "C", "D", "E", "F", "G"], []])
def test_symbols_outside_two_to_six_are_refused(symbols: list[str]) -> None:
    """DAC-E3-S3-1: fewer than 2 or more than 6 raises before any SQL (DEC-0127)."""
    with pytest.raises(ValueError):
        reader.ListFilters(symbols=symbols)


@pytest.mark.parametrize("symbols", [["AAA", "BBB"], ["A", "B", "C", "D", "E", "F"], None])
def test_symbols_two_to_six_or_none_are_accepted(symbols: list[str] | None) -> None:
    assert reader.ListFilters(symbols=symbols).symbols == symbols


@pytest.mark.parametrize(
    "symbols",
    [["AAA", "A%"], ["AAA", "a"], ["AAA", "1A"], ["AAA", "A B"], ["AAA", 7], ["AAA", "A" * 17]],
)
def test_each_symbol_must_match_the_instrument_symbol_shape(symbols: list[object]) -> None:
    """Reader design section 4 (SEC-INP-001); DEC-0132: checked as stored, never rewritten."""
    with pytest.raises(ValueError):
        reader.ListFilters(symbols=symbols)  # type: ignore[arg-type]


def test_the_compare_bound_has_one_definition() -> None:
    from factorflow.api import classification_bounds

    assert reader.MIN_COMPARE_SYMBOLS is classification_bounds.MIN_COMPARE_SYMBOLS
    assert reader.MAX_COMPARE_SYMBOLS is classification_bounds.MAX_COMPARE_SYMBOLS


class _NoStatementConnection:
    """A connection that fails the test if the reader touches it."""

    def cursor(self) -> object:
        raise AssertionError("the reader ran a statement")

    def execute(self, *args: object, **kwargs: object) -> object:
        raise AssertionError("the reader ran a statement")


@pytest.mark.parametrize(
    "symbols",
    [["A"], ["A"] * 7, ["aapl", "AAPL"], [], [1, 2], ["AAA", "a b"], ["AAA", "1A"]],
)
def test_compare_refuses_a_bad_request_before_any_statement(symbols: list[object]) -> None:
    with pytest.raises(ValueError):
        reader.compare(_NoStatementConnection(), symbols)  # type: ignore[arg-type]


def test_normalise_symbols_upper_cases_and_deduplicates_in_first_seen_order() -> None:
    assert reader._normalise_symbols(["b", "a", "B"]) == ["B", "A"]
    assert reader._normalise_symbols(["AAA", "BBB"]) == ["AAA", "BBB"]
    with pytest.raises(ValueError):
        reader._normalise_symbols(["A", 1])  # type: ignore[list-item]
