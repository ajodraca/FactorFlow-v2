"""Pure tests for the ``filter_provenance`` a filter snapshot records (CAP-002-E1-S5).

No database. Traces to DAC-E1-3 and DAC-E1-S5-4: the provenance has exactly the five keys
design 2.4 names, carries only the bounds that were set, and its JSON encoding reads back
through ``replay.origin_from_provenance`` (S2) as the ``Decimal``s that were evaluated. The
encoding of a bound (an integral ``Decimal`` as a JSON integer, any other through ``float``)
is the owner's decision DEC-0248.
"""

import ast
import json
from datetime import date
from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid4

import pytest

from factorflow.classification import reader
from factorflow.classification.reader import Thresholds
from factorflow.universes import replay, service
from tests.unit.test_research_sql_is_append_only import prohibited_research_mutations

SET_ID = UUID("6f1c3a52-9a51-4c1e-8f43-2b0d1c9e7a10")
SET_DATE = date(2026, 10, 15)
SERVICE_PATH = Path(service.__file__)


def _provenance(thresholds: Thresholds) -> dict[str, object]:
    return service._filter_provenance(SET_ID, SET_DATE, thresholds)


# --- (a) shape -------------------------------------------------------------------------


def test_provenance_has_exactly_the_five_keys() -> None:
    provenance = _provenance(
        Thresholds(
            bounds={"value_percentile_min": Decimal("80"), "growth_score_max": Decimal("1.5")},
            hide_incomplete=True,
            symbol="AA",
        )
    )
    assert provenance == {
        "set_id": str(SET_ID),
        "classification_date": "2026-10-15",
        "thresholds": {"value_percentile_min": Decimal("80"), "growth_score_max": Decimal("1.5")},
        "hide_incomplete": True,
        "symbol": "AA",
    }


@pytest.mark.parametrize("hide_incomplete", [True, False])
def test_hide_incomplete_is_always_present(hide_incomplete: bool) -> None:
    provenance = _provenance(Thresholds(hide_incomplete=hide_incomplete))
    assert "hide_incomplete" in provenance
    assert provenance["hide_incomplete"] is hide_incomplete


def test_symbol_is_none_without_a_search() -> None:
    provenance = _provenance(Thresholds(bounds={"momentum_score_min": Decimal("0")}))
    assert "symbol" in provenance
    assert provenance["symbol"] is None


def test_no_bounds_give_an_empty_thresholds_object() -> None:
    provenance = _provenance(Thresholds())
    assert provenance["thresholds"] == {}
    assert set(provenance) == {
        "set_id",
        "classification_date",
        "thresholds",
        "hide_incomplete",
        "symbol",
    }


def test_only_the_bounds_set_are_recorded() -> None:
    provenance = _provenance(Thresholds(bounds={"momentum_percentile_max": Decimal("40")}))
    assert provenance["thresholds"] == {"momentum_percentile_max": Decimal("40")}


def test_set_id_and_date_are_strings_of_the_given_values() -> None:
    other = uuid4()
    provenance = service._filter_provenance(other, date(2025, 1, 2), Thresholds())
    assert provenance["set_id"] == str(other)
    assert provenance["classification_date"] == "2025-01-02"


# --- (b) encoding (DEC-0248) -----------------------------------------------------------


def test_plain_json_dumps_cannot_encode_a_decimal_bound() -> None:
    provenance = _provenance(Thresholds(bounds={"value_score_min": Decimal("0.5")}))
    with pytest.raises(TypeError):
        json.dumps(provenance)


@pytest.mark.parametrize("bound", [Decimal("80"), Decimal("80.000"), Decimal("-3"), Decimal("0")])
def test_an_integral_decimal_is_written_as_a_json_integer(bound: Decimal) -> None:
    text = service._dump_json({"b": bound})
    assert text == json.dumps({"b": int(bound)})
    assert isinstance(json.loads(text)["b"], int)


@pytest.mark.parametrize(
    ("bound", "written"),
    [
        (Decimal("0.5"), "0.5"),
        (Decimal("-1.25"), "-1.25"),
        (Decimal("12.345678"), "12.345678"),
    ],
)
def test_a_non_integral_decimal_is_written_as_a_json_number(bound: Decimal, written: str) -> None:
    text = service._dump_json({"b": bound})
    assert text == '{"b": ' + written + "}"
    assert isinstance(json.loads(text)["b"], float)


def test_a_value_that_is_not_a_decimal_is_refused() -> None:
    with pytest.raises(TypeError):
        service._dump_json({"b": object()})
    with pytest.raises(TypeError):
        service._json_default({1, 2})


@pytest.mark.parametrize(
    "bounds",
    [
        {"value_percentile_min": Decimal("80")},
        {"value_percentile_min": Decimal("80.000")},
        {"value_score_min": Decimal("0.5"), "growth_score_max": Decimal("-1.25")},
        {"momentum_score_max": Decimal("12.345678")},
        {},
    ],
)
def test_the_encoded_provenance_reads_back_as_the_evaluated_decimals(
    bounds: dict[str, Decimal],
) -> None:
    thresholds = Thresholds(bounds=bounds, hide_incomplete=True, symbol="AA")
    decoded = json.loads(service._dump_json(_provenance(thresholds)))
    origin = replay.origin_from_provenance(decoded)
    assert origin.kind == "from_filter"
    assert origin.set_id == SET_ID
    assert origin.classification_date == SET_DATE
    assert origin.thresholds == bounds
    assert origin.thresholds is not None
    for name, value in origin.thresholds.items():
        assert isinstance(value, Decimal)
        assert value == bounds[name]
    assert origin.hide_incomplete is True
    assert origin.symbol == "AA"


def test_a_tenth_reads_back_exactly_not_as_a_binary_float_artefact() -> None:
    decoded = json.loads(
        service._dump_json(_provenance(Thresholds(bounds={"value_score_min": Decimal("0.1")})))
    )
    origin = replay.origin_from_provenance(decoded)
    assert origin.thresholds == {"value_score_min": Decimal("0.1")}
    assert origin.thresholds is not None
    assert str(origin.thresholds["value_score_min"]) == "0.1"


def test_more_than_fifteen_significant_digits_read_back_as_the_nearest_double() -> None:
    """The precision the owner accepted with the float encoding (DEC-0248)."""
    bound = Decimal("0.12345678901234567")
    decoded = json.loads(service._dump_json({"b": bound}))
    assert decoded["b"] == float(bound)
    assert Decimal(str(decoded["b"])) != bound


# --- (c) equality and aliasing ---------------------------------------------------------


def test_equal_thresholds_give_equal_provenance_regardless_of_bound_order() -> None:
    first = Thresholds(
        bounds={"value_score_min": Decimal("1"), "growth_percentile_max": Decimal("50")}
    )
    second = Thresholds(
        bounds={"growth_percentile_max": Decimal("50"), "value_score_min": Decimal("1")}
    )
    assert _provenance(first) == _provenance(second)


def test_the_provenance_does_not_alias_the_frozen_bounds() -> None:
    thresholds = Thresholds(bounds={"value_score_min": Decimal("1")})
    provenance = _provenance(thresholds)
    recorded = provenance["thresholds"]
    assert isinstance(recorded, dict)
    assert recorded is not thresholds.bounds
    recorded["value_score_max"] = Decimal("9")
    assert thresholds.bounds == {"value_score_min": Decimal("1")}


# --- (d) the write path's source, no database ------------------------------------------


def _module() -> ast.Module:
    return ast.parse(SERVICE_PATH.read_text())


def _create_from_filter() -> ast.FunctionDef:
    for node in _module().body:
        if isinstance(node, ast.FunctionDef) and node.name == "create_from_filter":
            return node
    raise AssertionError("create_from_filter is not a top-level function of service.py")


def test_create_from_filter_has_no_update_or_delete_and_no_built_statement() -> None:
    function = _create_from_filter()
    for node in ast.walk(function):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            upper = node.value.upper()
            assert "UPDATE" not in upper and "DELETE" not in upper, node.value
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr in {"execute", "executemany"}
            and node.args
        ):
            first = node.args[0]
            assert not isinstance(first, ast.JoinedStr)
            assert not isinstance(first, ast.BinOp)
            assert not (
                isinstance(first, ast.Call)
                and isinstance(first.func, ast.Attribute)
                and first.func.attr == "format"
            )


def test_the_new_statement_constant_is_append_only_with_named_placeholders() -> None:
    statement = service._INSTRUMENTS_BY_ID_SQL
    assert prohibited_research_mutations(statement) == []
    assert statement.lstrip().upper().startswith("SELECT")
    assert "%(instrument_ids)s" in statement
    assert "%s" not in statement


def test_the_predicate_is_the_readers() -> None:
    """DEC-0076: the snapshot calls the reader's predicate and defines none of its own."""
    module = _module()
    imported = {
        alias.name
        for node in module.body
        if isinstance(node, ast.ImportFrom) and node.module == "factorflow.classification.reader"
        for alias in node.names
    }
    assert {"Thresholds", "current_set", "evaluate_filter"} <= imported
    assert getattr(service, "evaluate_filter") is reader.evaluate_filter  # noqa: B009
    for node in ast.walk(module):
        assert not (isinstance(node, ast.ClassDef) and node.name == "Thresholds")
    for node in ast.walk(_create_from_filter()):
        if isinstance(node, ast.Compare):
            names = {
                n.attr if isinstance(n, ast.Attribute) else getattr(n, "id", "")
                for n in ast.walk(node)
            }
            assert not names & {"score", "percentile"}, ast.unparse(node)
