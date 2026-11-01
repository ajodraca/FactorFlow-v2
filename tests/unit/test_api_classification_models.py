"""The classification API's request models and bounds (CAP-002-E1-S6; task plan T004, T009).

Component design `component-design-classification-api.md` sections 2.4 and 2.7. The
universes cases are this story's; CAP-002-E3-S5 appends the classification cases.
"""

from dataclasses import fields
from datetime import UTC, date, datetime
from decimal import Decimal
from typing import Any
from uuid import uuid4

import pytest
from pydantic import ValidationError

from factorflow.api import classification_bounds
from factorflow.api.bounds import MAX_SYMBOLS_PER_REQUEST
from factorflow.api.classification_models import (
    AddMembersRequest,
    CreateUniverseRequest,
    FactorCellResponse,
    FactorsResponse,
    OriginResponse,
    RenameUniverseRequest,
    SetBlock,
    Thresholds,
)
from factorflow.classification import reader
from factorflow.classification.constants import FACTORS

BOUND_NAMES = [
    f"{factor}_{metric}_{end}"
    for factor in FACTORS
    for metric in ("score", "percentile")
    for end in ("min", "max")
]


def _fields(exc: pytest.ExceptionInfo[ValidationError]) -> list[str]:
    return [".".join(str(part) for part in error["loc"]) for error in exc.value.errors()]


def _symbols(n: int) -> list[str]:
    return [f"S{i}" for i in range(n)]


# --- bounds --------------------------------------------------------------------------


def test_the_bounds_module_declares_the_compare_bounds_and_no_name_length() -> None:
    assert classification_bounds.MIN_COMPARE_SYMBOLS == 2
    assert classification_bounds.MAX_COMPARE_SYMBOLS == 6
    assert classification_bounds.MAX_UNIVERSE_NAME_LENGTH is None
    doc = classification_bounds.__doc__ or ""
    assert "MAX_SYMBOLS_PER_REQUEST" in doc  # imported from bounds.py, never redeclared
    assert not hasattr(classification_bounds, "MAX_SYMBOLS_PER_REQUEST")


# --- TC-COMP-005: out-of-bounds requests fail model validation ------------------------


# Implements TC-COMP-005
def test_out_of_bounds_symbol_lists_are_rejected_naming_symbols() -> None:
    assert MAX_SYMBOLS_PER_REQUEST == 1000
    over = _symbols(MAX_SYMBOLS_PER_REQUEST + 1)
    with pytest.raises(ValidationError) as create:
        CreateUniverseRequest.model_validate({"name": "U", "symbols": over})
    assert _fields(create) == ["symbols"]
    assert create.value.errors()[0]["type"] == "too_long"
    assert create.value.errors()[0]["ctx"]["max_length"] == MAX_SYMBOLS_PER_REQUEST
    with pytest.raises(ValidationError) as add:
        AddMembersRequest.model_validate({"symbols": over})
    assert _fields(add) == ["symbols"]
    assert add.value.errors()[0]["type"] == "too_long"
    assert add.value.errors()[0]["ctx"]["max_length"] == MAX_SYMBOLS_PER_REQUEST


# Implements TC-COMP-005
@pytest.mark.parametrize(
    ("body", "field"),
    [
        ({"value_percentile_min": "100.01"}, "value_percentile_min"),
        ({"growth_percentile_max": "-0.01"}, "growth_percentile_max"),
        ({"momentum_score_min": "NaN"}, "momentum_score_min"),
        ({"value_score_max": "Infinity"}, "value_score_max"),
        ({"symbol": "1ABC"}, "symbol"),
        ({"bogus_bound": "1"}, "bogus_bound"),
    ],
)
def test_out_of_bounds_thresholds_are_rejected(body: dict[str, Any], field: str) -> None:
    with pytest.raises(ValidationError) as exc:
        Thresholds.model_validate(body)
    assert _fields(exc) == [field]


# Implements TC-COMP-005
def test_an_empty_rename_is_rejected() -> None:
    with pytest.raises(ValidationError) as exc:
        RenameUniverseRequest.model_validate({"name": "   "})
    assert _fields(exc) == ["name"]


# --- T009 (a): CreateUniverseRequest --------------------------------------------------


def test_exactly_one_of_symbols_or_filter() -> None:
    set_id = str(uuid4())
    with pytest.raises(ValidationError) as both:
        CreateUniverseRequest.model_validate(
            {"name": "U", "symbols": ["AAA"], "filter": {}, "set_id": set_id}
        )
    assert "filter" in _fields(both)
    with pytest.raises(ValidationError) as neither:
        CreateUniverseRequest.model_validate({"name": "U"})
    assert "filter" in _fields(neither)
    with pytest.raises(ValidationError) as empty_and_filter:
        CreateUniverseRequest.model_validate(
            {"name": "U", "symbols": [], "filter": {}, "set_id": set_id}
        )
    assert "filter" in _fields(empty_and_filter)


def test_set_id_goes_with_and_only_with_filter() -> None:
    with pytest.raises(ValidationError) as missing:
        CreateUniverseRequest.model_validate({"name": "U", "filter": {}})
    assert _fields(missing) == ["set_id"]
    with pytest.raises(ValidationError) as extra:
        CreateUniverseRequest.model_validate(
            {"name": "U", "symbols": ["AAA"], "set_id": str(uuid4())}
        )
    assert _fields(extra) == ["set_id"]
    set_id = uuid4()
    ok = CreateUniverseRequest.model_validate(
        {"name": "U", "filter": {"value_percentile_min": "80"}, "set_id": str(set_id)}
    )
    assert ok.set_id == set_id
    assert ok.symbols is None
    assert ok.filter is not None


@pytest.mark.parametrize(
    "model_body",
    [
        (CreateUniverseRequest, {"name": "U", "symbols": ["AAA"], "extra": 1}),
        (RenameUniverseRequest, {"name": "U", "extra": 1}),
        (AddMembersRequest, {"symbols": ["AAA"], "extra": 1}),
        (Thresholds, {"extra": 1}),
    ],
)
def test_every_request_model_forbids_unknown_keys(model_body: tuple[Any, dict[str, Any]]) -> None:
    model, body = model_body
    with pytest.raises(ValidationError) as exc:
        model.model_validate(body)
    assert _fields(exc) == ["extra"]


@pytest.mark.parametrize("model", [CreateUniverseRequest, RenameUniverseRequest])
def test_names_are_trimmed_and_must_not_be_empty(model: Any) -> None:
    extra = {"symbols": ["AAA"]} if model is CreateUniverseRequest else {}
    assert model.model_validate({"name": "  Tech  ", **extra}).name == "Tech"
    for blank in ("", "   ", "\t\n"):
        with pytest.raises(ValidationError) as exc:
            model.model_validate({"name": blank, **extra})
        assert _fields(exc) == ["name"]
    long_name = "N" * 10_000
    assert model.model_validate({"name": long_name, **extra}).name == long_name


@pytest.mark.parametrize("model", [CreateUniverseRequest, RenameUniverseRequest])
def test_the_name_length_bound_is_one_constant(model: Any, monkeypatch: pytest.MonkeyPatch) -> None:
    extra = {"symbols": ["AAA"]} if model is CreateUniverseRequest else {}
    monkeypatch.setattr(classification_bounds, "MAX_UNIVERSE_NAME_LENGTH", 5)
    assert model.model_validate({"name": " Fives ", **extra}).name == "Fives"
    with pytest.raises(ValidationError) as exc:
        model.model_validate({"name": "Sixsix", **extra})
    assert _fields(exc) == ["name"]
    assert all("Sixsix" not in error["msg"] for error in exc.value.errors())


def test_an_empty_symbols_list_on_create_is_the_by_hand_branch() -> None:
    body = CreateUniverseRequest.model_validate({"name": "U", "symbols": []})
    assert body.symbols == []
    assert body.filter is None
    assert body.set_id is None


def test_create_symbols_cap_is_max_symbols_per_request() -> None:
    at_cap = CreateUniverseRequest.model_validate(
        {"name": "U", "symbols": _symbols(MAX_SYMBOLS_PER_REQUEST)}
    )
    assert at_cap.symbols is not None
    assert len(at_cap.symbols) == MAX_SYMBOLS_PER_REQUEST


def test_add_members_needs_one_to_max_symbols() -> None:
    with pytest.raises(ValidationError) as empty:
        AddMembersRequest.model_validate({"symbols": []})
    assert _fields(empty) == ["symbols"]
    at_cap = AddMembersRequest.model_validate({"symbols": _symbols(MAX_SYMBOLS_PER_REQUEST)})
    assert len(at_cap.symbols) == MAX_SYMBOLS_PER_REQUEST


@pytest.mark.parametrize("model", [CreateUniverseRequest, AddMembersRequest])
def test_symbols_are_trimmed_and_upper_cased(model: Any) -> None:
    extra = {"name": "U"} if model is CreateUniverseRequest else {}
    body = model.model_validate({"symbols": [" aaa ", "Brk.b", "aaa"], **extra})
    assert body.symbols == ["AAA", "BRK.B", "AAA"]  # de-duplication is the service's


@pytest.mark.parametrize("bad", ["1ABC", "A B", "A" * 17, "", "   "])
@pytest.mark.parametrize("model", [CreateUniverseRequest, AddMembersRequest])
def test_malformed_symbols_are_rejected_naming_symbols_only(model: Any, bad: str) -> None:
    extra = {"name": "Secretive name"} if model is CreateUniverseRequest else {}
    with pytest.raises(ValidationError) as exc:
        model.model_validate({"symbols": ["AAA", bad], **extra})
    assert _fields(exc) == ["symbols"]
    for error in exc.value.errors():
        assert "Secretive" not in error["msg"]
        if bad.strip():
            assert bad not in error["msg"]


# --- T009 (b): Thresholds -------------------------------------------------------------


def test_thresholds_default_to_nothing_set() -> None:
    model = Thresholds.model_validate({})
    assert model.hide_incomplete is False
    assert model.symbol is None
    assert all(getattr(model, name) is None for name in BOUND_NAMES)
    assert model.to_reader() == reader.Thresholds(bounds={}, hide_incomplete=False, symbol=None)


def test_the_twelve_bounds_are_the_reader_names() -> None:
    assert len(BOUND_NAMES) == 12
    assert set(Thresholds.model_fields) == {*BOUND_NAMES, "hide_incomplete", "symbol"}


@pytest.mark.parametrize("name", BOUND_NAMES)
def test_each_bound_is_accepted(name: str) -> None:
    model = Thresholds.model_validate({name: "50"})
    assert getattr(model, name) == Decimal("50")


@pytest.mark.parametrize("name", [n for n in BOUND_NAMES if "_percentile_" in n])
def test_percentiles_are_zero_to_one_hundred_inclusive(name: str) -> None:
    assert getattr(Thresholds.model_validate({name: 0}), name) == Decimal(0)
    assert getattr(Thresholds.model_validate({name: "100"}), name) == Decimal(100)
    for out in ("-0.01", "100.01"):
        with pytest.raises(ValidationError) as exc:
            Thresholds.model_validate({name: out})
        assert _fields(exc) == [name]


@pytest.mark.parametrize("name", [n for n in BOUND_NAMES if "_score_" in n])
def test_scores_must_be_finite(name: str) -> None:
    assert getattr(Thresholds.model_validate({name: "-12.5"}), name) == Decimal("-12.5")
    assert getattr(Thresholds.model_validate({name: 1e6}), name) == Decimal("1000000.0")
    for out in ("NaN", "Infinity", "-Infinity"):
        with pytest.raises(ValidationError) as exc:
            Thresholds.model_validate({name: out})
        assert _fields(exc) == [name]


def test_the_symbol_prefix_is_upper_cased_and_shape_checked() -> None:
    assert Thresholds.model_validate({"symbol": "aa"}).symbol == "AA"
    assert Thresholds.model_validate({"symbol": " brk.b "}).symbol == "BRK.B"
    for bad in ("1A", "A B", "A" * 17, ""):
        with pytest.raises(ValidationError) as exc:
            Thresholds.model_validate({"symbol": bad})
        assert _fields(exc) == ["symbol"]


def test_hide_incomplete_must_be_a_boolean() -> None:
    assert Thresholds.model_validate({"hide_incomplete": True}).hide_incomplete is True
    for bad in ("maybe", [], {"a": 1}):
        with pytest.raises(ValidationError) as exc:
            Thresholds.model_validate({"hide_incomplete": bad})
        assert _fields(exc) == ["hide_incomplete"]


# --- T009 (d): conversion to the reader's Thresholds ----------------------------------


def test_to_reader_carries_only_the_set_bounds_and_every_other_field() -> None:
    model = Thresholds.model_validate(
        {
            "value_percentile_min": "80",
            "growth_score_max": "1.5",
            "hide_incomplete": True,
            "symbol": "aa",
        }
    )
    converted = model.to_reader()
    assert isinstance(converted, reader.Thresholds)
    assert converted == reader.Thresholds(
        bounds={"value_percentile_min": Decimal("80"), "growth_score_max": Decimal("1.5")},
        hide_incomplete=True,
        symbol="AA",
    )


def test_to_reader_keeps_a_zero_bound() -> None:
    converted = Thresholds.model_validate({"momentum_score_min": 0}).to_reader()
    assert converted.bounds == {"momentum_score_min": Decimal(0)}


# --- T015: decimals on the wire ---------------------------------------------------------


def test_scores_and_percentiles_serialise_as_decimal_strings_at_stored_precision() -> None:
    cell = FactorCellResponse(
        status="classified",
        score=Decimal("1.250000"),
        percentile=Decimal("87.50"),
        reason_code=None,
        reason_input=None,
        reason_detail=None,
        restated_possible=False,
    )
    dumped = cell.model_dump(mode="json")
    assert dumped["score"] == "1.250000"
    assert dumped["percentile"] == "87.50"
    origin = OriginResponse(
        kind="from_filter",
        set_id=uuid4(),
        classification_date=None,
        thresholds={"value_percentile_min": Decimal("80.0")},
        hide_incomplete=False,
        symbol=None,
    )
    assert origin.model_dump(mode="json")["thresholds"] == {"value_percentile_min": "80.0"}


# --- T015: response models built from the reader's types -------------------------------


def _cell(**overrides: Any) -> reader.FactorCell:
    values: dict[str, Any] = {
        "status": "not_classified",
        "score": Decimal("-0.123456"),
        "percentile": Decimal("12.5"),
        "reason_code": "input_missing",
        "reason_input": "book_value",
        "reason_detail": "no filing",
        "restated_possible": True,
    }
    values.update(overrides)
    return reader.FactorCell(**values)


def test_factor_cells_copy_every_reader_field() -> None:
    cell = _cell()
    response = FactorCellResponse.from_reader(cell)
    assert response.model_dump() == {f.name: getattr(cell, f.name) for f in fields(cell)}


def test_factors_map_each_factor_to_its_own_cell() -> None:
    cells = {
        factor: _cell(score=Decimal(index), reason_detail=factor)
        for index, factor in enumerate(FACTORS)
    }
    response = FactorsResponse.from_reader(cells)
    for index, factor in enumerate(FACTORS):
        cell = getattr(response, factor)
        assert cell.score == Decimal(index)
        assert cell.reason_detail == factor


def test_the_set_block_copies_every_current_set_field_but_the_factor_summaries() -> None:
    current = reader.CurrentSet(
        set_id=uuid4(),
        classification_date=date(2026, 10, 15),
        run_id=uuid4(),
        run_started_at=datetime(2026, 10, 15, 22, 30, tzinfo=UTC),
        run_outcome="partial",
        state="complete",
        started_at=datetime(2026, 10, 15, 23, 0, tzinfo=UTC),
        ended_at=datetime(2026, 10, 15, 23, 5, tzinfo=UTC),
        latest_trading_day=date(2026, 10, 14),
        active_instruments=2999,
        factors={},
        not_current=True,
    )
    block = SetBlock.from_reader(current)
    expected = {f.name: getattr(current, f.name) for f in fields(current) if f.name != "factors"}
    assert block.model_dump() == expected
