"""The universes router without a database (CAP-002-E1-S6; task plan T003-T008, T010).

Component design `component-design-classification-api.md` sections 2.4 to 2.7 and 11.
The app is built by `create_app()`, so the mount, the Host and Origin middleware, the
request id and the delivered handlers are the real ones. `factorflow.universes.service`,
`factorflow.universes.replay.list_universe_rows` and
`factorflow.classification.reader.list_classifications` are doubled through their modules,
the way the routes call them.
"""

import ast
import inspect
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
from factorflow.api.routes import universes
from factorflow.classification import reader
from factorflow.classification.reader import (
    ClassificationPage,
    CurrentSet,
    FactorCell,
    ListFilters,
    StockRow,
    Thresholds,
)
from factorflow.universes import service
from factorflow.universes.replay import Member, Origin, Universe, UniverseEvent, UniverseRow

UID = UUID("11111111-2222-3333-4444-555555555555")
SET_ID = UUID("aaaaaaaa-0000-0000-0000-000000000001")
T0 = datetime(2026, 10, 15, 21, 0, tzinfo=UTC)
T1 = datetime(2026, 10, 16, 14, 30, tzinfo=UTC)
TODAY = date(2026, 10, 16)
BY_HAND = Origin("by_hand", None, None, None, None, None)
SERVICE_FUNCTIONS = (
    "create_by_hand",
    "create_from_filter",
    "rename",
    "retire",
    "add_members",
    "remove_member",
    "get_universe",
    "list_universes",
    "list_events",
)


class _FakePool:
    """A pool that never opens a connection and counts the requests for one."""

    def __init__(self) -> None:
        self.calls = 0

    @contextmanager
    def connection(self) -> Iterator[object]:
        self.calls += 1
        yield object()


@dataclass
class Spy:
    """A double recording its calls; returns ``result`` or raises ``raises``."""

    result: Any = None
    raises: Exception | None = None
    calls: list[tuple[Any, ...]] = field(default_factory=list)

    def __call__(self, *args: Any) -> Any:
        self.calls.append(args[1:])  # drop the connection
        if self.raises is not None:
            raise self.raises
        return self.result


@pytest.fixture
def pool() -> _FakePool:
    return _FakePool()


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch, pool: _FakePool) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
    for name in SERVICE_FUNCTIONS:
        monkeypatch.setattr(service, name, Spy(raises=AssertionError(f"service.{name} reached")))
    monkeypatch.setattr(reader, "list_classifications", Spy(result=_page()))
    monkeypatch.setattr("factorflow.universes.replay.list_universe_rows", Spy(result=([], None)))
    app = create_app()
    app.state.db_pool = pool
    return TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)


def _double(monkeypatch: pytest.MonkeyPatch, name: str, **kwargs: Any) -> Spy:
    spy = Spy(**kwargs)
    monkeypatch.setattr(service, name, spy)
    return spy


def _member(symbol: str, instrument_id: int = 1, lifecycle: str = "active") -> Member:
    return Member(instrument_id, symbol, lifecycle, T0)


def _universe(
    *symbols: str,
    name: str = "Mine",
    retired_at: datetime | None = None,
    origin: Origin = BY_HAND,
    as_of: date = TODAY,
    before_creation: bool = False,
) -> Universe:
    return Universe(
        universe_id=UID,
        name=name,
        lifecycle="retired" if retired_at else "active",
        created_at=T0,
        retired_at=retired_at,
        members=[_member(s, i) for i, s in enumerate(symbols, start=1)],
        origin=origin,
        as_of=as_of,
        as_of_before_creation=before_creation,
        created_on=T0.date(),
    )


def _cell(score: str = "1.250000", percentile: str = "87.50") -> FactorCell:
    return FactorCell("classified", Decimal(score), Decimal(percentile), None, None, None, False)


def _stock(symbol: str, name: str | None = "Company") -> StockRow:
    return StockRow(
        instrument_id=1,
        symbol=symbol,
        name=name,
        lifecycle="active",
        factors={"value": _cell(), "growth": _cell("-0.5", "10"), "momentum": _cell("0", "50")},
    )


CURRENT = CurrentSet(
    set_id=SET_ID,
    classification_date=date(2026, 10, 15),
    run_id=UUID("cccccccc-0000-0000-0000-000000000003"),
    run_started_at=T0,
    run_outcome="succeeded",
    state="complete",
    started_at=T0,
    ended_at=T1,
    latest_trading_day=date(2026, 10, 15),
    active_instruments=3000,
    factors={},
    not_current=True,
)


def _page(
    *stocks: StockRow, current: CurrentSet | None = None, next_cursor: str | None = None
) -> ClassificationPage:
    return ClassificationPage(
        set=current,
        never_classified=current is None,
        later=None,
        match_count=len(stocks),
        stocks=list(stocks),
        unknown_symbols=[],
        next_cursor=next_cursor,
    )


def _envelope(response: Any) -> dict[str, Any]:
    error = response.json()["error"]
    assert error["message"]
    assert error["resource"]
    assert error["request_id"] == response.headers["X-Request-Id"]
    assert "Traceback" not in response.text
    assert 'File "' not in response.text
    return dict(error)


# --- TC-COMP-004: uncovered symbols on create -------------------------------------------


# Implements TC-COMP-004
def test_create_with_uncovered_symbols_names_every_one_in_a_list_field(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    spy = _double(
        monkeypatch, "create_by_hand", raises=service.InstrumentNotAcquired(["ZZZ", "BBB"])
    )

    response = client.post(
        "/api/universes", json={"name": "Mine", "symbols": ["aaa", "zzz", "bbb", "ccc"]}
    )

    assert response.status_code == 409
    error = _envelope(response)
    assert error["code"] == "instrument_not_acquired"
    assert error["resource"] == "universe"
    assert error["symbols"] == ["BBB", "ZZZ"]
    message = error["message"]
    assert "create" in message and "universe" in message
    assert "BBB" in message and "ZZZ" in message
    assert "AAA" not in message and "CCC" not in message
    assert spy.calls == [("Mine", ["AAA", "ZZZ", "BBB", "CCC"])]


# --- TC-COMP-005: out of bounds is refused before the service ---------------------------


OVERSIZE = {"symbols": [f"S{i}" for i in range(1001)]}


# Implements TC-COMP-005
@pytest.mark.parametrize(
    ("method", "path", "body", "field_name"),
    [
        ("POST", "/api/universes", {"name": "U", **OVERSIZE}, "symbols"),
        ("POST", f"/api/universes/{UID}/members", OVERSIZE, "symbols"),
        ("GET", "/api/universes?limit=501", None, "limit"),
        ("GET", "/api/universes?limit=0", None, "limit"),
        ("GET", f"/api/universes/{UID}/events?limit=501", None, "limit"),
        ("GET", f"/api/universes/{UID}/events?limit=0", None, "limit"),
        ("GET", "/api/universes?lifecycle=bogus", None, "lifecycle"),
        ("GET", f"/api/universes/{UID}?as_of=2026-13-40", None, "as_of"),
        ("GET", "/api/universes/not-a-uuid", None, "universe_id"),
        ("PATCH", "/api/universes/not-a-uuid", {"name": "U"}, "universe_id"),
        ("DELETE", "/api/universes/not-a-uuid", None, "universe_id"),
        ("GET", "/api/universes/not-a-uuid/events", None, "universe_id"),
        ("POST", "/api/universes/not-a-uuid/members", {"symbols": ["AAA"]}, "universe_id"),
        ("DELETE", "/api/universes/not-a-uuid/members/AAA", None, "universe_id"),
        ("POST", "/api/universes", {"name": "U", "symbols": ["A B"]}, "symbols"),
        ("POST", f"/api/universes/{UID}/members", {"symbols": []}, "symbols"),
        ("PATCH", f"/api/universes/{UID}", {"name": "  "}, "name"),
    ],
)
def test_out_of_bounds_requests_never_reach_the_service_or_the_pool(
    client: TestClient,
    pool: _FakePool,
    method: str,
    path: str,
    body: dict[str, Any] | None,
    field_name: str,
) -> None:
    response = client.request(method, path, json=body)

    assert response.status_code == 422
    error = _envelope(response)
    assert error["code"] == "validation_error"
    assert f"`{field_name}`" in error["message"]
    assert pool.calls == 0


# --- TC-COMP-027: already_member is a 200 field -----------------------------------------


# Implements TC-COMP-027
def test_already_member_is_reported_in_the_200_body(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    spy = _double(monkeypatch, "add_members", result=(["CCC"], ["AAA"]))

    response = client.post(f"/api/universes/{UID}/members", json={"symbols": ["aaa", "CCC"]})

    assert response.status_code == 200
    assert response.json() == {"added": ["CCC"], "already_member": ["AAA"]}
    assert spy.calls == [(UID, ["AAA", "CCC"])]


# --- TC-COMP-028: mounted behind the middleware, ahead of static ------------------------


# Implements TC-COMP-028
def test_the_router_is_mounted_behind_the_middleware_and_ahead_of_static(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    _double(monkeypatch, "list_universes", result=([], None))
    create = _double(monkeypatch, "create_by_hand", raises=AssertionError("reached"))

    listed = client.get("/api/universes")
    assert listed.status_code == 200
    assert listed.headers["X-Request-Id"]
    assert listed.headers["content-type"].startswith("application/json")
    assert "universes" in listed.json()

    foreign_host = client.get("/api/universes", headers={"Host": "evil.example:8000"})
    assert foreign_host.status_code == 400
    assert foreign_host.json()["error"]["code"] == "host_not_allowed"
    assert foreign_host.headers["X-Request-Id"]

    foreign_origin = client.post(
        "/api/universes",
        json={"name": "U", "symbols": ["AAA"]},
        headers={"Origin": "https://evil.example"},
    )
    assert foreign_origin.status_code == 403
    assert foreign_origin.json()["error"]["code"] == "origin_not_allowed"
    assert create.calls == []

    unknown = client.get("/api/universes/not-a-uuid/nope")
    assert unknown.status_code == 404
    assert unknown.json()["error"]["code"] == "not_found"


# Implements TC-COMP-028
def test_create_app_includes_the_universes_router_before_the_static_mount(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
    app = create_app()
    expected = {
        (route.path, method)
        for route in universes.router.routes
        if isinstance(route, APIRoute)
        for method in route.methods
    }
    assert expected == {
        ("/api/universes", "GET"),
        ("/api/universes", "POST"),
        ("/api/universes/{universe_id}", "GET"),
        ("/api/universes/{universe_id}", "PATCH"),
        ("/api/universes/{universe_id}", "DELETE"),
        ("/api/universes/{universe_id}/events", "GET"),
        ("/api/universes/{universe_id}/members", "POST"),
        ("/api/universes/{universe_id}/members/{symbol}", "DELETE"),
    }
    # FastAPI keeps an included router as one entry wrapping it (`original_router`).
    included = [
        index
        for index, route in enumerate(app.routes)
        if getattr(route, "original_router", None) is universes.router
    ]
    assert len(included) == 1, "create_app includes the universes router exactly once"
    mounts = [i for i, route in enumerate(app.routes) if isinstance(route, Mount)]
    assert mounts, "the static mount is present"
    assert included[0] < min(mounts)


# --- TC-COMP-041: the last member -------------------------------------------------------


# Implements TC-COMP-041
def test_removing_the_sole_member_is_last_member(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    spy = _double(monkeypatch, "remove_member", raises=service.LastMember("x"))

    response = client.delete(f"/api/universes/{UID}/members/aaa")

    assert response.status_code == 409
    error = _envelope(response)
    assert error["code"] == "last_member"
    assert error["resource"] == "universe-member"
    assert "AAA" in error["message"]
    assert "retir" in error["message"].lower()
    assert spy.calls == [(UID, "AAA")]


# --- T010 (a): status codes and the write bodies ---------------------------------------


def test_create_by_hand_is_201_with_the_replayed_universe(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    _double(monkeypatch, "create_by_hand", result=_universe("AAA", "BBB"))

    response = client.post("/api/universes", json={"name": " Mine ", "symbols": ["AAA", "BBB"]})

    assert response.status_code == 201
    body = response.json()
    assert body["universe_id"] == str(UID)
    assert body["member_count"] == 2
    assert [m["symbol"] for m in body["members"]] == ["AAA", "BBB"]


def test_rename_is_200_with_the_universe(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    spy = _double(monkeypatch, "rename", result=_universe("AAA", name="New"))

    response = client.patch(f"/api/universes/{UID}", json={"name": " New "})

    assert response.status_code == 200
    assert response.json()["name"] == "New"
    assert spy.calls == [(UID, "New")]


def test_retire_returns_the_services_retired_at(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    spy = _double(monkeypatch, "retire", result=_universe("AAA", retired_at=T1))

    response = client.delete(f"/api/universes/{UID}")

    assert response.status_code == 200
    assert response.json() == {"lifecycle": "retired", "retired_at": "2026-10-16T14:30:00Z"}
    assert spy.calls == [(UID,)]


def test_remove_member_returns_the_services_removed_at(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    spy = _double(monkeypatch, "remove_member", result=T1)

    response = client.delete(f"/api/universes/{UID}/members/brk.b")

    assert response.status_code == 200
    assert response.json() == {"removed_at": "2026-10-16T14:30:00Z"}
    assert spy.calls == [(UID, "BRK.B")]


# --- T010 (b): which create the route calls --------------------------------------------


def test_a_filter_body_calls_create_from_filter_with_the_reader_thresholds(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from_filter = _double(monkeypatch, "create_from_filter", result=_universe("AAA"))
    by_hand = _double(monkeypatch, "create_by_hand", raises=AssertionError("reached"))

    response = client.post(
        "/api/universes",
        json={
            "name": "Mine",
            "filter": {
                "value_percentile_min": "80",
                "growth_score_max": 1.5,
                "hide_incomplete": True,
                "symbol": "aa",
            },
            "set_id": str(SET_ID),
        },
    )

    assert response.status_code == 201
    assert by_hand.calls == []
    [(name, set_id, thresholds)] = from_filter.calls
    assert (name, set_id) == ("Mine", SET_ID)
    assert isinstance(thresholds, Thresholds)
    assert thresholds == Thresholds(
        bounds={"value_percentile_min": Decimal("80"), "growth_score_max": Decimal("1.5")},
        hide_incomplete=True,
        symbol="AA",
    )


def test_an_empty_symbols_list_reaches_create_by_hand(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    by_hand = _double(monkeypatch, "create_by_hand", raises=service.EmptyUniverse("x"))
    from_filter = _double(monkeypatch, "create_from_filter", raises=AssertionError("reached"))

    response = client.post("/api/universes", json={"name": "Empty", "symbols": []})

    assert response.status_code == 422
    error = _envelope(response)
    assert error["code"] == "empty_universe"
    assert "no symbol" in error["message"]
    assert by_hand.calls == [("Empty", [])]
    assert from_filter.calls == []


# --- T010 (c): the universe response ----------------------------------------------------


def test_members_carry_the_readers_name_and_cells_or_null(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    by_filter = Origin(
        "from_filter",
        SET_ID,
        date(2026, 10, 15),
        {"value_percentile_min": Decimal("80.0")},
        True,
        "AA",
    )
    _double(monkeypatch, "get_universe", result=_universe("AAA", "BBB", "CCC", origin=by_filter))
    first = _page(_stock("AAA", "Alpha Inc"), current=CURRENT, next_cursor="p2")
    second = _page(_stock("CCC", None), current=CURRENT)
    pages = Spy()
    results = iter([first, second])
    monkeypatch.setattr(
        reader, "list_classifications", lambda conn, filters: pages(conn, filters) or next(results)
    )

    response = client.get(f"/api/universes/{UID}")

    assert response.status_code == 200
    body = response.json()
    assert pages.calls == [
        (ListFilters(universe_id=UID, limit=MAX_PAGE_SIZE),),
        (ListFilters(universe_id=UID, limit=MAX_PAGE_SIZE, cursor="p2"),),
    ]
    members = {m["symbol"]: m for m in body["members"]}
    assert members["AAA"]["name"] == "Alpha Inc"
    assert members["AAA"]["factors"]["value"] == {
        "status": "classified",
        "score": "1.250000",
        "percentile": "87.50",
        "reason_code": None,
        "reason_input": None,
        "reason_detail": None,
        "restated_possible": False,
    }
    assert members["AAA"]["factors"]["growth"]["score"] == "-0.5"
    assert members["CCC"]["name"] is None
    assert members["CCC"]["factors"]["momentum"]["percentile"] == "50"
    assert members["BBB"] == {
        "symbol": "BBB",
        "name": None,
        "lifecycle": "active",
        "member_since": "2026-10-15T21:00:00Z",
        "factors": None,
    }
    assert body["member_count"] == 3
    assert body["set"]["set_id"] == str(SET_ID)
    assert body["set"]["not_current"] is True
    assert body["set"]["ended_at"] == "2026-10-16T14:30:00Z"
    assert body["origin"] == {
        "kind": "from_filter",
        "set_id": str(SET_ID),
        "classification_date": "2026-10-15",
        "thresholds": {"value_percentile_min": "80.0"},
        "hide_incomplete": True,
        "symbol": "AA",
    }
    assert body["as_of"] == "2026-10-16"
    assert body["as_of_before_creation"] is False
    assert body["lifecycle"] == "active"
    assert body["retired_at"] is None
    assert body["created_at"] == "2026-10-15T21:00:00Z"


def test_a_never_classified_store_gives_a_null_set_and_null_cells(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    _double(monkeypatch, "get_universe", result=_universe("AAA"))

    body = client.get(f"/api/universes/{UID}").json()

    assert body["set"] is None
    assert body["members"][0]["factors"] is None
    assert body["members"][0]["name"] is None
    assert body["origin"] == {
        "kind": "by_hand",
        "set_id": None,
        "classification_date": None,
        "thresholds": None,
        "hide_incomplete": None,
        "symbol": None,
    }


# --- T010 (d): as_of ------------------------------------------------------------------


def test_as_of_reaches_get_universe_as_a_date(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    spy = _double(
        monkeypatch,
        "get_universe",
        result=_universe(as_of=date(2020, 1, 1), before_creation=True),
    )

    body = client.get(f"/api/universes/{UID}?as_of=2020-01-01").json()
    client.get(f"/api/universes/{UID}")

    assert spy.calls == [(UID, date(2020, 1, 1)), (UID, None)]
    assert body["members"] == []
    assert body["member_count"] == 0
    assert body["as_of_before_creation"] is True
    assert body["as_of"] == "2020-01-01"


# --- T010 (e): the list -----------------------------------------------------------------


def _row(n: int) -> UniverseRow:
    return UniverseRow(UUID(int=n), f"U{n}", "active", T0, None)


def test_the_list_passes_its_parameters_and_counts_every_page(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    listed = _double(
        monkeypatch,
        "list_universes",
        result=([_universe("AAA", "BBB"), _universe(name="Gone", retired_at=T1)], "next"),
    )
    counted = {
        ("active", None): ([_row(1), _row(2)], "a2"),
        ("active", "a2"): ([_row(3)], None),
        ("retired", None): ([_row(4)], None),
    }
    rows = Spy()
    monkeypatch.setattr(
        "factorflow.universes.replay.list_universe_rows",
        lambda conn, lifecycle, prefix, limit, cursor: (
            rows(conn, lifecycle, prefix, limit, cursor) or counted[(lifecycle, cursor)]
        ),
    )

    response = client.get("/api/universes?name=Te&limit=7&cursor=c1&lifecycle=all")

    assert response.status_code == 200
    body = response.json()
    assert listed.calls == [("all", "Te", 7, "c1")]
    assert sorted(rows.calls, key=str) == sorted(
        [
            ("active", None, MAX_PAGE_SIZE, None),
            ("active", None, MAX_PAGE_SIZE, "a2"),
            ("retired", None, MAX_PAGE_SIZE, None),
        ],
        key=str,
    )
    assert body["active_count"] == 3
    assert body["retired_count"] == 1
    assert body["next_cursor"] == "next"
    assert body["universes"] == [
        {
            "universe_id": str(UID),
            "name": "Mine",
            "lifecycle": "active",
            "member_count": 2,
            "created_at": "2026-10-15T21:00:00Z",
            "retired_at": None,
        },
        {
            "universe_id": str(UID),
            "name": "Gone",
            "lifecycle": "retired",
            "member_count": 0,
            "created_at": "2026-10-15T21:00:00Z",
            "retired_at": "2026-10-16T14:30:00Z",
        },
    ]


def test_the_list_defaults(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    listed = _double(monkeypatch, "list_universes", result=([], None))

    body = client.get("/api/universes").json()

    assert listed.calls == [("active", None, DEFAULT_PAGE_SIZE, None)]
    assert body == {"universes": [], "active_count": 0, "retired_count": 0, "next_cursor": None}


# --- T010 (f): events -------------------------------------------------------------------


PROVENANCE = {
    "set_id": "aaaaaaaa-0000-0000-0000-000000000001",
    "classification_date": "2026-10-15",
    "thresholds": {"value_percentile_min": 80, "growth_score_max": 1.5},
    "hide_incomplete": True,
    "symbol": "AA",
}


def test_events_copy_every_field_and_the_raw_provenance(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    created = UniverseEvent(1, "created", "Mine", None, T0, date(2026, 10, 15), PROVENANCE)
    added = UniverseEvent(2, "member_added", None, "AAA", T1, date(2026, 10, 16), None)
    spy = _double(monkeypatch, "list_events", result=([added, created], "c2"))

    response = client.get(f"/api/universes/{UID}/events?limit=2&cursor=c1")

    assert response.status_code == 200
    body = response.json()
    assert spy.calls == [(UID, 2, "c1")]
    assert body["next_cursor"] == "c2"
    assert body["events"] == [
        {
            "event_id": 2,
            "event_type": "member_added",
            "name": None,
            "symbol": "AAA",
            "recorded_at": "2026-10-16T14:30:00Z",
            "recorded_on": "2026-10-16",
            "filter_provenance": None,
        },
        {
            "event_id": 1,
            "event_type": "created",
            "name": "Mine",
            "symbol": None,
            "recorded_at": "2026-10-15T21:00:00Z",
            "recorded_on": "2026-10-15",
            "filter_provenance": PROVENANCE,
        },
    ]
    thresholds = body["events"][1]["filter_provenance"]["thresholds"]
    assert isinstance(thresholds["value_percentile_min"], int)
    assert isinstance(thresholds["growth_score_max"], float)


def test_events_default_page_size(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    spy = _double(monkeypatch, "list_events", result=([], None))
    assert client.get(f"/api/universes/{UID}/events").json() == {"events": [], "next_cursor": None}
    assert spy.calls == [(UID, DEFAULT_PAGE_SIZE, None)]


# --- T010 (g): a malformed path symbol ----------------------------------------------------


@pytest.mark.parametrize("symbol", ["1ABC", "A" * 17, "A%20B"])
def test_a_malformed_path_symbol_is_refused_before_the_service(
    client: TestClient, pool: _FakePool, symbol: str
) -> None:
    response = client.delete(f"/api/universes/{UID}/members/{symbol}")

    assert response.status_code == 422
    error = _envelope(response)
    assert error["code"] == "validation_error"
    assert error["resource"] == "universe-member"
    assert "`symbol`" in error["message"]
    assert pool.calls == 0


# --- T010 (h): what the route module imports ----------------------------------------------


def test_the_route_module_reaches_the_store_only_through_the_domain_modules() -> None:
    tree = ast.parse(inspect.getsource(universes))
    imported: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.module:
            imported.add(node.module)
            imported.update(f"{node.module}.{alias.name}" for alias in node.names)
        elif isinstance(node, ast.Import):
            imported.update(alias.name for alias in node.names)
    assert "factorflow.universes.service" in imported
    assert "factorflow.classification.reader" in imported
    # psycopg only for the connection type; no SQL composition and no ingestion client.
    assert not any(name.startswith(("psycopg.sql", "factorflow.ingestion")) for name in imported)
    assert "SELECT" not in inspect.getsource(universes)


def test_a_retired_universe_reads_with_its_retired_at(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    _double(monkeypatch, "get_universe", result=_universe("AAA", retired_at=T1))

    body = client.get(f"/api/universes/{UID}").json()

    assert body["lifecycle"] == "retired"
    assert body["retired_at"] == "2026-10-16T14:30:00Z"
    assert [m["symbol"] for m in body["members"]] == ["AAA"]


def test_a_page_of_one_is_accepted(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    listed = _double(monkeypatch, "list_universes", result=([], None))
    events = _double(monkeypatch, "list_events", result=([], None))

    assert client.get("/api/universes?limit=1").status_code == 200
    assert client.get(f"/api/universes/{UID}/events?limit=500").status_code == 200
    assert client.get(f"/api/universes/{UID}/events?limit=1").status_code == 200
    assert client.get("/api/universes?limit=500").status_code == 200
    assert [call[2] for call in listed.calls] == [1, 500]
    assert [call[1] for call in events.calls] == [500, 1]
