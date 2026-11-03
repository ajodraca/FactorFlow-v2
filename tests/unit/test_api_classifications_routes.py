"""The classifications router without a database (CAP-002-E3-S5; task plan T003-T005, T008, T011).

Component design `component-design-classification-api.md` sections 2.4 to 2.7 and 11. The app
is built by `create_app()`, so the mount, the Host and Origin middleware, the request id and the
delivered handlers are the real ones. The reader functions are doubled through the reader module,
the way the routes call them, and the pool is a fake that never opens a connection.
"""

import json
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import UTC, date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

import pytest
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from starlette.routing import Mount

from factorflow.api.app import create_app
from factorflow.api.bounds import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from factorflow.api.classification_bounds import MAX_COMPARE_SYMBOLS, MIN_COMPARE_SYMBOLS
from factorflow.api.routes import classifications
from factorflow.classification import reader
from factorflow.classification.reader import (
    ClassificationPage,
    CurrentSet,
    FactorCell,
    FactorSummary,
    HistoryRow,
    InputRow,
    LaterSet,
    Membership,
    SetRow,
    StockEvidence,
    StockRow,
    StocksCurrent,
    Summary,
)
from factorflow.runs.queries import CursorError

SET_ID = UUID("aaaaaaaa-0000-0000-0000-000000000001")
RUN_ID = UUID("cccccccc-0000-0000-0000-000000000003")
T0 = datetime(2026, 10, 15, 21, 0, tzinfo=UTC)
T1 = datetime(2026, 10, 16, 14, 30, tzinfo=UTC)
FACTORS = ("value", "growth", "momentum")
ZERO_FACTORS = {
    name: {"qualified_count": 0, "ranked": False, "min_peer_set_size": 30} for name in FACTORS
}
SET_BLOCK_KEYS = {
    "set_id",
    "classification_date",
    "run_id",
    "run_started_at",
    "run_outcome",
    "state",
    "started_at",
    "ended_at",
    "latest_trading_day",
    "active_instruments",
    "not_current",
}
LATER_KEYS = {
    "set_id",
    "state",
    "started_at",
    "ended_at",
    "failure_reason",
    "run_id",
    "run_started_at",
}


class _FakePool:
    @contextmanager
    def connection(self) -> Iterator[object]:
        yield object()


@dataclass
class Spy:
    """A double recording its calls (the connection dropped); returns or raises."""

    result: Any = None
    raises: BaseException | None = None
    calls: list[tuple[Any, ...]] = field(default_factory=list)

    def __call__(self, *args: Any) -> Any:
        self.calls.append(args[1:])
        if self.raises is not None:
            raise self.raises
        return self.result


def _unreached(name: str) -> Spy:
    return Spy(raises=AssertionError(f"reader.{name} reached"))


READS = (
    "list_classifications",
    "compare",
    "summary",
    "stock_evidence",
    "stock_history",
    "list_sets",
    "get_set",
)


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
    for name in READS:
        monkeypatch.setattr(reader, name, _unreached(name))
    app = create_app()
    app.state.db_pool = _FakePool()
    return TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)


def _double(monkeypatch: pytest.MonkeyPatch, name: str, **kwargs: Any) -> Spy:
    spy = Spy(**kwargs)
    monkeypatch.setattr(reader, name, spy)
    return spy


def _cell(score: str = "1.250000", percentile: str = "87.500000") -> FactorCell:
    return FactorCell("classified", Decimal(score), Decimal(percentile), None, None, None, False)


def _stock(symbol: str, score: str = "12.345600") -> StockRow:
    return StockRow(
        instrument_id=1,
        symbol=symbol,
        name="Company",
        lifecycle="active",
        factors={
            "value": _cell(score),
            "growth": _cell("-0.5", "10"),
            "momentum": _cell("0", "50"),
        },
    )


def _current(not_current: bool = False) -> CurrentSet:
    summary = FactorSummary(qualified_count=40, ranked=True, min_peer_set_size=30)
    return CurrentSet(
        set_id=SET_ID,
        classification_date=date(2026, 10, 15),
        run_id=RUN_ID,
        run_started_at=T0,
        run_outcome="succeeded",
        state="complete",
        started_at=T0,
        ended_at=T1,
        latest_trading_day=date(2026, 10, 15),
        active_instruments=3000,
        factors={name: summary for name in FACTORS},
        not_current=not_current,
    )


def _later(state: str) -> LaterSet:
    failed = state == "failed"
    return LaterSet(
        set_id=UUID("bbbbbbbb-0000-0000-0000-000000000002"),
        state=state,
        run_id=RUN_ID,
        run_started_at=T1,
        started_at=T1,
        ended_at=T1 if failed else None,
        failure_reason="boom" if failed else None,
    )


def _page(
    *stocks: StockRow,
    current: CurrentSet | None = None,
    later: LaterSet | None = None,
    unknown: list[str] | None = None,
    next_cursor: str | None = None,
) -> ClassificationPage:
    return ClassificationPage(
        set=current,
        never_classified=current is None,
        later=later,
        match_count=len(stocks),
        stocks=list(stocks),
        unknown_symbols=unknown or [],
        next_cursor=next_cursor,
    )


def _summary(current: CurrentSet | None = None, later: LaterSet | None = None) -> Summary:
    return Summary(set=current, never_classified=current is None, later=later, stocks_current=None)


# --- TC-COMP-172: /summary is routed to the summary handler ------------------------------


# Implements TC-COMP-172
def test_summary_reaches_the_summary_handler_not_a_path_parameter(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E3-S5-1: the literal `/summary` is never captured by a path parameter."""
    spy = _double(monkeypatch, "summary", result=_summary())
    response = client.get("/api/classifications/summary")
    assert response.status_code == 200
    assert response.json()["never_classified"] is True
    assert len(spy.calls) == 1


# Implements TC-COMP-172
def test_the_router_lists_summary_before_the_parameterised_paths() -> None:
    """DAC-E3-S5-1: declaration order decides, so the order is pinned, and each path is GET once."""
    routes = [route for route in classifications.router.routes if isinstance(route, APIRoute)]
    paths = [route.path for route in routes]
    expected = [
        "/api/classifications",
        "/api/classifications/summary",
        "/api/classifications/sets",
        "/api/classifications/sets/{set_id}",
        "/api/classifications/stocks/{symbol}",
        "/api/classifications/stocks/{symbol}/history",
    ]
    assert sorted(paths) == sorted(expected)
    assert all(route.methods == {"GET"} for route in routes)
    summary = paths.index("/api/classifications/summary")
    assert summary < paths.index("/api/classifications/stocks/{symbol}")
    assert summary < paths.index("/api/classifications/sets/{set_id}")


# --- TC-COMP-125: compare outside 2 to 6 is refused before the reader --------------------


def _symbols(count: int) -> str:
    return ",".join(f"S{i}" for i in range(count))


# Implements TC-COMP-125
@pytest.mark.parametrize("query", ["symbols=AAA", "symbols=", f"symbols={_symbols(7)}"])
def test_compare_outside_the_bounds_is_422_and_the_reader_is_not_called(
    client: TestClient, query: str
) -> None:
    """DAC-E3-S5-2, DAC-E3-7: 0, 1 and 7 symbols are refused naming `symbols`."""
    response = client.get(f"/api/classifications?{query}")
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert "`symbols`" in error["message"]


# Implements TC-COMP-125
@pytest.mark.parametrize("count", [MIN_COMPARE_SYMBOLS, MAX_COMPARE_SYMBOLS])
def test_compare_at_the_bounds_reaches_the_reader(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, count: int
) -> None:
    """DAC-E3-S5-2: 2 and 6 symbols are accepted and passed as given."""
    spy = _double(monkeypatch, "compare", result=_page())
    response = client.get(f"/api/classifications?symbols={_symbols(count)}")
    assert response.status_code == 200
    assert spy.calls == [([f"S{i}" for i in range(count)],)]


# --- TC-COMP-173: list and summary share the never-classified shape ----------------------


def _shapes(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, current: CurrentSet | None, later: Any
) -> tuple[dict[str, Any], dict[str, Any]]:
    _double(monkeypatch, "list_classifications", result=_page(current=current, later=later))
    _double(monkeypatch, "summary", result=_summary(current, later))
    listed = client.get("/api/classifications")
    summarised = client.get("/api/classifications/summary")
    assert listed.status_code == summarised.status_code == 200
    return listed.json(), summarised.json()


# Implements TC-COMP-173
def test_never_classified_list_and_summary_share_one_shape(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E3-S5-3, DAC-E3-11: no set: `set` and `later` are null, `factors` is the zero record."""
    listed, summarised = _shapes(client, monkeypatch, None, None)
    for body in (listed, summarised):
        assert body["never_classified"] is True
        assert body["set"] is None
        assert body["later"] is None
        assert body["factors"] == ZERO_FACTORS
    assert (listed["match_count"], listed["stocks"], listed["unknown_symbols"]) == (0, [], [])
    assert listed["next_cursor"] is None
    assert summarised["stocks_current"] is None
    assert "stocks" not in summarised


# Implements TC-COMP-173
@pytest.mark.parametrize("state", ["building", "failed"])
def test_a_first_set_that_is_not_complete_is_carried_as_later_on_both_reads(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, state: str
) -> None:
    """DAC-E3-S5-3: `later` is identical on both reads and carries the seven keys."""
    listed, summarised = _shapes(client, monkeypatch, None, _later(state))
    assert listed["later"] == summarised["later"]
    assert set(listed["later"]) == LATER_KEYS
    assert listed["later"]["state"] == state
    assert listed["later"]["failure_reason"] == ("boom" if state == "failed" else None)
    assert listed["set"] is None and summarised["set"] is None
    assert listed["never_classified"] is True


# Implements TC-COMP-173
def test_a_current_set_with_a_newer_one_carries_equal_blocks_on_both_reads(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E3-11: `set` and `later` are equal objects on the list and the summary."""
    listed, summarised = _shapes(
        client, monkeypatch, _current(not_current=True), _later("building")
    )
    assert listed["set"] == summarised["set"]
    assert set(listed["set"]) == SET_BLOCK_KEYS
    assert listed["set"]["not_current"] is True
    assert listed["later"] == summarised["later"]
    assert listed["factors"] == summarised["factors"]
    assert listed["factors"]["value"] == {
        "qualified_count": 40,
        "ranked": True,
        "min_peer_set_size": 30,
    }


# --- TC-COMP-070 through the route -------------------------------------------------------


# Implements TC-COMP-070
def test_a_score_travels_as_a_decimal_string_on_the_wire(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E3-S5-4: the raw text holds the score as a string at stored precision, never a number."""
    _double(monkeypatch, "list_classifications", result=_page(_stock("AAA"), current=_current()))
    response = client.get("/api/classifications")
    assert response.json()["stocks"][0]["factors"]["value"]["score"] == "12.345600"
    assert '"score":"12.345600"' in response.text.replace(" ", "")

    def refuse(token: str) -> float:
        raise AssertionError(f"a numeric token {token} is on the wire")

    json.loads(response.text, parse_float=refuse)


# --- TC-COMP-126: mounted behind the middleware and ahead of the static mount -------------


# Implements TC-COMP-126
@pytest.mark.parametrize("path", ["/api/classifications", "/api/classifications/summary"])
def test_a_foreign_host_is_refused_before_the_reader(client: TestClient, path: str) -> None:
    """DAC-E3-S5-6: the Host check wraps the classification routes."""
    response = client.get(path, headers={"Host": "evil.example:8000"})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "host_not_allowed"


# Implements TC-COMP-126
def test_the_request_id_wraps_an_error_from_the_router(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E3-S5-6: the envelope's id is the response header's id."""
    _double(monkeypatch, "list_classifications", raises=CursorError("x"))
    response = client.get("/api/classifications?cursor=x")
    assert response.headers["X-Request-Id"]
    assert response.json()["error"]["request_id"] == response.headers["X-Request-Id"]


# Implements TC-COMP-126
def test_an_unknown_classification_path_is_the_json_envelope_not_the_spa(
    client: TestClient,
) -> None:
    """DAC-E3-S5-6: an `/api` path never falls through to the static mount."""
    response = client.get("/api/classifications/no-such-path")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


# Implements TC-COMP-126
def test_every_classification_route_precedes_the_static_mount() -> None:
    """DAC-E3-S5-6: ahead of the `/` mount, or the bundle would answer first."""
    routes = create_app().router.routes
    mounts = [
        i for i, route in enumerate(routes) if isinstance(route, Mount) and route.name == "static"
    ]
    if not mounts:
        pytest.skip("no static mount: the bundle directory is absent")
    # FastAPI wraps an included router in one entry that keeps it as `original_router`.
    classification = [
        i
        for i, r in enumerate(routes)
        if getattr(r, "original_router", None) is classifications.router
    ]
    assert len(classification) == 1
    assert max(classification) < mounts[0]


# --- delegation (T011) ---------------------------------------------------------------------


def test_the_list_read_passes_every_filter_to_the_reader(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-16: query parameters become one `ListFilters`; compare is not called."""
    uid = UUID("11111111-2222-3333-4444-555555555555")
    spy = _double(monkeypatch, "list_classifications", result=_page())
    response = client.get(
        f"/api/classifications?universe_id={uid}&sort=value_percentile&order=desc"
        "&value_percentile_min=80&hide_incomplete=true&symbol=aa&limit=10&cursor=c"
    )
    assert response.status_code == 200
    assert spy.calls == [
        (
            reader.ListFilters(
                universe_id=uid,
                sort="value_percentile",
                order="desc",
                thresholds=reader.Thresholds(
                    bounds={"value_percentile_min": Decimal("80")},
                    hide_incomplete=True,
                    symbol="AA",
                ),
                limit=10,
                cursor="c",
            ),
        )
    ]


def test_compare_reports_unknown_symbols_and_its_stocks(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E3-7: the page's stocks and `unknown_symbols` reach the body."""
    spy = _double(
        monkeypatch,
        "compare",
        result=_page(_stock("AAA"), _stock("BBB"), current=_current(), unknown=["NOPE"]),
    )
    body = client.get("/api/classifications?symbols=AAA,BBB").json()
    assert spy.calls == [(["AAA", "BBB"],)]
    assert [s["symbol"] for s in body["stocks"]] == ["AAA", "BBB"]
    assert body["unknown_symbols"] == ["NOPE"]


@pytest.mark.parametrize(
    "extra",
    [
        "universe_id=11111111-2222-3333-4444-555555555555",
        "symbol=A",
        "sort=value_score",
        "order=desc",
        "cursor=c",
        "hide_incomplete=true",
        "value_score_min=1",
    ],
)
def test_symbols_with_another_filter_is_422_naming_the_filter(
    client: TestClient, extra: str
) -> None:
    """DEC-0141: compare takes symbols alone, so a mixed request is refused, not half-honoured."""
    response = client.get(f"/api/classifications?symbols=AAA,BBB&{extra}")
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert f"`{extra.split('=')[0]}`" in error["message"]


def test_symbols_accepts_a_limit(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """DEC-0141: `limit` is the one parameter compare tolerates."""
    _double(monkeypatch, "compare", result=_page())
    assert client.get("/api/classifications?symbols=AAA,BBB&limit=500").status_code == 200


def test_repeated_symbols_parameters_give_the_same_list(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The comma form and the repeated form are one list."""
    spy = _double(monkeypatch, "compare", result=_page())
    client.get("/api/classifications?symbols=AAA&symbols=BBB")
    client.get("/api/classifications?symbols=AAA,BBB")
    assert spy.calls == [(["AAA", "BBB"],), (["AAA", "BBB"],)]


@pytest.mark.parametrize(
    "path", ["/api/classifications/sets", "/api/classifications/stocks/AAA/history"]
)
@pytest.mark.parametrize("limit", [0, MAX_PAGE_SIZE + 1])
def test_page_bounds_are_422_before_the_reader(client: TestClient, path: str, limit: int) -> None:
    """Design 2.4: a limit outside 1 to `MAX_PAGE_SIZE` never reaches the reader."""
    response = client.get(f"{path}?limit={limit}")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_sets_and_history_pass_limit_and_cursor_and_return_the_readers_cursor(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The default limit is `DEFAULT_PAGE_SIZE`, 500 is accepted, `next_cursor` is the reader's."""
    sets = _double(monkeypatch, "list_sets", result=([], "next-sets"))
    history = _double(monkeypatch, "stock_history", result=([], "next-history"))
    assert client.get("/api/classifications/sets").json() == {
        "sets": [],
        "next_cursor": "next-sets",
    }
    client.get("/api/classifications/sets?limit=500&cursor=c")
    assert sets.calls == [(DEFAULT_PAGE_SIZE, None), (500, "c")]
    body = client.get("/api/classifications/stocks/aaa/history?cursor=c").json()
    assert body == {"symbol": "AAA", "sets": [], "next_cursor": "next-history"}
    assert history.calls == [("AAA", DEFAULT_PAGE_SIZE, "c")]


def test_a_malformed_set_id_or_symbol_is_422_and_does_not_reach_the_reader(
    client: TestClient,
) -> None:
    """Design 2.4: path parameters are validated before the reader."""
    for path in (
        "/api/classifications/sets/not-a-uuid",
        "/api/classifications/stocks/a%20b",
        "/api/classifications/stocks/1AB",
        "/api/classifications/stocks/a%20b/history",
    ):
        response = client.get(path)
        assert response.status_code == 422, path
        assert response.json()["error"]["code"] == "validation_error"
    assert "`symbol`" in client.get("/api/classifications/stocks/1AB").json()["error"]["message"]


def test_a_lower_case_symbol_is_upper_cased_before_the_reader(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.4: the reader sees the normalised symbol."""
    spy = _double(
        monkeypatch,
        "stock_evidence",
        result=StockEvidence(None, "AAPL", None, "active", {}, [], []),
    )
    body = client.get("/api/classifications/stocks/aapl").json()
    assert spy.calls == [("AAPL",)]
    assert body["set"] is None and body["factors"] == {} and body["inputs"] == []


def test_a_stale_cursor_from_the_list_is_cursor_stale(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0138: a cursor the reader would decode for the set it names is stale, not invalid."""
    cursor = reader.encode_cursor(SET_ID, "symbol", "asc", "AAA", False, "AAA")
    _double(monkeypatch, "list_classifications", raises=CursorError("other set"))
    response = client.get(f"/api/classifications?cursor={cursor}")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "cursor_stale"


def test_the_set_and_history_reads_serialise_their_rows(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.7: set rows and history rows carry every documented field."""
    row = SetRow(
        set_id=SET_ID,
        state="complete",
        classification_date=date(2026, 10, 15),
        run_id=RUN_ID,
        run_started_at=T0,
        run_outcome="succeeded",
        started_at=T0,
        ended_at=T1,
        failure_reason=None,
        latest_trading_day=date(2026, 10, 15),
        active_instruments=3000,
        factors={"value": FactorSummary(40, True, 30)},
    )
    _double(monkeypatch, "get_set", result=row)
    body = client.get(f"/api/classifications/sets/{SET_ID}").json()
    assert body["set_id"] == str(SET_ID)
    assert body["factors"]["value"] == {
        "qualified_count": 40,
        "ranked": True,
        "min_peer_set_size": 30,
    }
    assert body["failure_reason"] is None
    _double(
        monkeypatch,
        "stock_history",
        result=(
            [
                HistoryRow(
                    set_id=SET_ID,
                    classification_date=date(2026, 10, 15),
                    run_id=RUN_ID,
                    run_outcome="succeeded",
                    ended_at=T1,
                    factors={"value": _cell(), "growth": _cell(), "momentum": _cell()},
                )
            ],
            None,
        ),
    )
    history = client.get("/api/classifications/stocks/AAA/history").json()
    assert history["sets"][0]["run_outcome"] == "succeeded"
    assert history["sets"][0]["factors"]["value"]["score"] == "1.250000"


# The three read semantics of design section 3, as the route's OpenAPI description states them.
SEMANTICS = (
    "never `not_enough_stocks` and never `retired`",
    "active instruments only",
    "only stocks classified on that factor that fail it",
)


def test_the_openapi_description_states_the_three_read_semantics() -> None:
    """Design 3, T011(g): the list route documents what `hide_incomplete`, scope and bounds mean."""
    schema = create_app().openapi()
    description = schema["paths"]["/api/classifications"]["get"]["description"]
    for phrase in SEMANTICS:
        assert phrase in description


# --- complete bodies: every field the reader holds reaches the wire (mutation hardening) ----


def test_the_list_body_carries_names_a_later_set_and_the_next_cursor(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.7: `name`, `next_cursor` and the failed set's `ended_at` are copied across."""
    _double(
        monkeypatch,
        "list_classifications",
        result=_page(_stock("AAA"), current=_current(), later=_later("failed"), next_cursor="more"),
    )
    body = client.get("/api/classifications").json()
    assert body["stocks"][0]["name"] == "Company"
    assert body["stocks"][0]["lifecycle"] == "active"
    assert body["next_cursor"] == "more"
    assert body["later"]["ended_at"] == "2026-10-16T14:30:00Z"
    assert body["later"]["run_id"] == str(RUN_ID)


def test_the_summary_body_carries_both_stock_counts(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-13: the reader's count is served as given."""
    summary = Summary(
        set=_current(), never_classified=False, later=None, stocks_current=StocksCurrent(2990, 3000)
    )
    _double(monkeypatch, "summary", result=summary)
    body = client.get("/api/classifications/summary").json()
    assert body["stocks_current"] == {"current_count": 2990, "followed_count": 3000}


def test_the_evidence_body_carries_every_input_field_and_the_memberships(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-17: each input shows its value and the date it was known."""
    uid = UUID("11111111-2222-3333-4444-555555555555")
    inputs = [
        InputRow(
            factor="value",
            input_name="book_to_price",
            label="book-to-price",
            status="present",
            value=Decimal("0.123400"),
            as_of=date(2026, 6, 30),
            known_on=date(2026, 8, 1),
            restated_possible=True,
            detail={"filing": "10-Q"},
        )
    ]
    evidence = StockEvidence(
        _current(),
        "AAA",
        "Alpha Inc",
        "active",
        {"value": _cell()},
        inputs,
        [Membership(uid, "Mine")],
    )
    _double(monkeypatch, "stock_evidence", result=evidence)
    body = client.get("/api/classifications/stocks/AAA").json()
    assert body["name"] == "Alpha Inc" and body["symbol"] == "AAA"
    assert body["inputs"] == [
        {
            "factor": "value",
            "input_name": "book_to_price",
            "label": "book-to-price",
            "status": "present",
            "value": "0.123400",
            "as_of": "2026-06-30",
            "known_on": "2026-08-01",
            "restated_possible": True,
            "detail": {"filing": "10-Q"},
        }
    ]
    assert body["memberships"] == [{"universe_id": str(uid), "name": "Mine"}]


def test_the_set_body_carries_every_field_of_a_failed_set(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """AC-20, AC-21: failure and reason, the run's start, the set's day and size."""
    row = SetRow(
        set_id=SET_ID,
        state="failed",
        classification_date=date(2026, 10, 15),
        run_id=RUN_ID,
        run_started_at=T0,
        run_outcome="failed",
        started_at=T0,
        ended_at=T1,
        failure_reason="boom",
        latest_trading_day=date(2026, 10, 14),
        active_instruments=2999,
        factors={},
    )
    _double(monkeypatch, "get_set", result=row)
    assert client.get(f"/api/classifications/sets/{SET_ID}").json() == {
        "set_id": str(SET_ID),
        "state": "failed",
        "classification_date": "2026-10-15",
        "run_id": str(RUN_ID),
        "run_started_at": "2026-10-15T21:00:00Z",
        "run_outcome": "failed",
        "started_at": "2026-10-15T21:00:00Z",
        "ended_at": "2026-10-16T14:30:00Z",
        "failure_reason": "boom",
        "latest_trading_day": "2026-10-14",
        "active_instruments": 2999,
        "factors": {},
    }


@pytest.mark.parametrize("symbol", ["A", "AB", "ABC", "ABCD"])
def test_a_stale_cursor_is_recognised_whatever_padding_it_needs(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, symbol: str
) -> None:
    """DEC-0138: the reader strips `=`, so the route restores 0 to 3 of them before decoding."""
    cursor = reader.encode_cursor(SET_ID, "symbol", "asc", symbol, False, symbol)
    _double(monkeypatch, "list_classifications", raises=CursorError("other set"))
    response = client.get("/api/classifications", params={"cursor": cursor})
    assert response.json()["error"]["code"] == "cursor_stale"


def test_a_limit_of_one_is_accepted(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """Design 2.4: the page bounds are 1 to `MAX_PAGE_SIZE`."""
    _double(monkeypatch, "list_sets", result=([], None))
    assert client.get("/api/classifications/sets?limit=1").status_code == 200
