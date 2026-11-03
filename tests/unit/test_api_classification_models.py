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
from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MAX_SYMBOLS_PER_REQUEST
from factorflow.api.classification_bounds import MAX_COMPARE_SYMBOLS, MIN_COMPARE_SYMBOLS
from factorflow.api.classification_models import (
    AddMembersRequest,
    ClassificationListQuery,
    CreateUniverseRequest,
    FactorCellResponse,
    FactorsResponse,
    OriginResponse,
    RenameUniverseRequest,
    SetBlock,
    Thresholds,
    _cell_response,
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


# --- classification list query and cell serialisation (CAP-002-E3-S5; T004, T006, T010) --------


def _query(**params: Any) -> ClassificationListQuery:
    return ClassificationListQuery.model_validate(params)


# Implements TC-COMP-125
@pytest.mark.parametrize("count", [0, 1, MAX_COMPARE_SYMBOLS + 1])
def test_compare_outside_the_bounds_is_refused_on_symbols(count: int) -> None:
    """DAC-E3-S5-2, DAC-E3-7: the error's location is `symbols`."""
    with pytest.raises(ValidationError) as exc:
        _query(symbols=_symbols(count))
    assert exc.value.errors()[0]["loc"] == ("symbols",)


# Implements TC-COMP-125
@pytest.mark.parametrize("count", [MIN_COMPARE_SYMBOLS, MAX_COMPARE_SYMBOLS])
def test_compare_at_the_bounds_is_accepted(count: int) -> None:
    """DAC-E3-S5-2: both ends of the range are inside it."""
    assert _query(symbols=_symbols(count)).symbols == _symbols(count)


# Implements TC-COMP-125
def test_the_compare_count_is_taken_after_upper_casing_and_de_duplication() -> None:
    """DEC-0070: `AAA` and `aaa` are one symbol, so two of them are one, which is too few."""
    with pytest.raises(ValidationError) as exc:
        _query(symbols=["AAA", "aaa"])
    assert exc.value.errors()[0]["loc"] == ("symbols",)


# Implements TC-COMP-070
def test_a_classified_cell_keeps_its_stored_precision_as_a_string() -> None:
    """DAC-E3-S5-4: trailing zeros stay; the key `restated_possible` is present."""
    cell = reader.FactorCell(
        "classified", Decimal("12.345600"), Decimal("87.500000"), None, None, None, True
    )
    response = _cell_response(cell)
    assert isinstance(response, FactorCellResponse)
    assert response.model_dump(mode="json") == {
        "status": "classified",
        "score": "12.345600",
        "percentile": "87.500000",
        "reason_code": None,
        "reason_input": None,
        "reason_detail": None,
        "restated_possible": True,
    }


# Implements TC-COMP-070
def test_a_not_classified_cell_has_null_scores_and_still_carries_restated_possible() -> None:
    """DAC-E3-S5-4: the key is present, not omitted, when false."""
    cell = reader.FactorCell(
        "not_classified", None, None, "input_missing", "book_to_price", "no filing", False
    )
    dumped = _cell_response(cell).model_dump(mode="json")
    assert dumped["score"] is None and dumped["percentile"] is None
    assert dumped["restated_possible"] is False
    assert dumped["reason_code"] == "input_missing"


# Implements TC-COMP-070
def test_a_negative_score_keeps_its_sign_and_scale() -> None:
    """DAC-E3-S5-4."""
    cell = reader.FactorCell(
        "classified", Decimal("-0.500000"), Decimal("1"), None, None, None, False
    )
    assert _cell_response(cell).model_dump(mode="json")["score"] == "-0.500000"


def test_the_list_query_has_the_documented_defaults() -> None:
    """Design 2.4: symbol order, ascending, the default page, nothing filtered."""
    query = _query()
    assert (query.sort, query.order, query.limit) == ("symbol", "asc", DEFAULT_PAGE_SIZE)
    assert query.hide_incomplete is False
    assert query.model_fields_set == set()
    assert query.universe_id is query.symbols is query.symbol is query.cursor is None
    assert all(getattr(query, name) is None for name in BOUND_NAMES)


def test_sort_is_exactly_the_reader_allowlist() -> None:
    """Design 2.4: seven keys, nothing else, however it is spelt."""
    for key in reader.SORT_ALLOWLIST:
        assert _query(sort=key).sort == key
    assert len(reader.SORT_ALLOWLIST) == 7
    for bad in ("score", "VALUE_SCORE", "value_score;--"):
        with pytest.raises(ValidationError) as exc:
            _query(sort=bad)
        assert exc.value.errors()[0]["loc"] == ("sort",)


def test_order_and_limit_are_bounded() -> None:
    """Design 2.4: `asc` or `desc`; 1 to `MAX_PAGE_SIZE`."""
    assert _query(order="desc").order == "desc"
    for params in ({"order": "up"}, {"limit": 0}, {"limit": MAX_PAGE_SIZE + 1}):
        with pytest.raises(ValidationError):
            _query(**params)
    assert _query(limit=1).limit == 1
    assert _query(limit=MAX_PAGE_SIZE).limit == MAX_PAGE_SIZE


@pytest.mark.parametrize("name", [n for n in BOUND_NAMES if "percentile" in n])
def test_a_percentile_bound_is_0_to_100_and_finite(name: str) -> None:
    """DEC-0141: 0 and 100 are accepted; -0.1, 100.1 and NaN are not."""
    assert getattr(_query(**{name: "0"}), name) == 0
    assert getattr(_query(**{name: "100"}), name) == 100
    for bad in ("-0.1", "100.1", "NaN"):
        with pytest.raises(ValidationError) as exc:
            _query(**{name: bad})
        assert exc.value.errors()[0]["loc"] == (name,)


@pytest.mark.parametrize("name", [n for n in BOUND_NAMES if "score" in n])
def test_a_score_bound_is_finite_and_may_be_negative(name: str) -> None:
    """Design 2.4: a z-score can be below zero; NaN and infinity are refused."""
    assert getattr(_query(**{name: "-1.5"}), name) == Decimal("-1.5")
    for bad in ("NaN", "Infinity"):
        with pytest.raises(ValidationError):
            _query(**{name: bad})


def test_a_bound_given_as_a_string_is_a_decimal_not_a_float() -> None:
    """The stored scale is never touched by a float round trip."""
    assert _query(value_score_min="1.5").value_score_min == Decimal("1.5")


def test_the_list_query_symbol_prefix_is_upper_cased_and_shape_checked() -> None:
    """Design 2.4: `^[A-Z][A-Z0-9.-]{0,15}$` after upper-casing."""
    assert _query(symbol="aa").symbol == "AA"
    assert _query(symbol="A" * 16).symbol == "A" * 16
    for bad in ("", "1A", "A%", "A B", "A" * 17):
        with pytest.raises(ValidationError) as exc:
            _query(symbol=bad)
        assert exc.value.errors()[0]["loc"] == ("symbol",)


def test_symbols_split_strip_upper_case_and_de_duplicate_in_first_seen_order() -> None:
    """The comma form and the list form give one list."""
    assert _query(symbols="aaa, BBB").symbols == ["AAA", "BBB"]
    assert _query(symbols=["AAA", "BBB"]).symbols == ["AAA", "BBB"]
    assert _query(symbols=["BBB,AAA", "bbb", "CCC"]).symbols == ["BBB", "AAA", "CCC"]
    with pytest.raises(ValidationError) as exc:
        _query(symbols="AAA,1BB")
    assert exc.value.errors()[0]["loc"] == ("symbols",)


@pytest.mark.parametrize("bad", ["AAA,,BBB", "AAA,BBB,", ",AAA,BBB", "AAA, ,BBB"])
def test_an_empty_symbols_entry_is_refused_on_symbols(bad: str) -> None:
    """T016 (IR-007): each split entry is shape-checked, so an empty one is refused, not dropped."""
    with pytest.raises(ValidationError) as exc:
        _query(symbols=bad)
    assert exc.value.errors()[0]["loc"] == ("symbols",)


def test_an_unknown_field_is_refused() -> None:
    """Every request model forbids unknown keys."""
    with pytest.raises(ValidationError):
        _query(foo=1)


def test_to_filters_carries_only_the_supplied_bounds() -> None:
    """The reader's `ListFilters`, with `Decimal` bounds and the paging fields as given."""
    uid = uuid4()
    filters = _query(
        universe_id=str(uid),
        sort="growth_score",
        order="desc",
        value_percentile_min="80",
        momentum_score_max="-1",
        hide_incomplete="true",
        symbol="aa",
        limit=25,
        cursor="c",
    ).to_filters()
    assert filters == reader.ListFilters(
        universe_id=uid,
        sort="growth_score",
        order="desc",
        thresholds=reader.Thresholds(
            bounds={"value_percentile_min": Decimal("80"), "momentum_score_max": Decimal("-1")},
            hide_incomplete=True,
            symbol="AA",
        ),
        limit=25,
        cursor="c",
    )


def test_to_filters_keeps_a_zero_valued_bound() -> None:
    """T010 (IR-006): `0` is a supplied bound ("score at least 0"), not an absent one."""
    bounds = _query(value_score_min="0", growth_percentile_max="0").to_filters().thresholds.bounds
    assert bounds == {"value_score_min": Decimal("0"), "growth_percentile_max": Decimal("0")}


def test_compare_conflicts_names_what_the_request_set_besides_symbols_and_limit() -> None:
    """DEC-0141: `model_fields_set` is what the request named, so defaults never conflict."""
    assert _query(symbols="AAA,BBB", limit=10).compare_conflicts() == []
    conflicts = _query(symbols="AAA,BBB", sort="symbol", value_score_min="1").compare_conflicts()
    assert sorted(conflicts) == ["sort", "value_score_min"]
