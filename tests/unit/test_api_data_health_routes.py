"""The data-health-api router on a minimal app (CAP-003-E2-S4; task plan T005 to T008).

Component design `component-design-data-health-api.md` 2.3, 3, 4, 7. The router
is registered by CAP-003-E2-S6's predecessor (E2-S5), so these tests mount it on
a bare `FastAPI()` carrying the delivered validation handler. The three reader
functions are replaced where the router looks them up.
"""

import inspect
import logging
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import psycopg
import pytest
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from factorflow.api import app as app_module
from factorflow.api.routes import data_health
from factorflow.data_health.models import ProblemPage
from tests.unit.test_api_data_health_models import (
    ATTENTION_EMPTY,
    ATTENTION_FULL,
    EXPECTED_ATTENTION_FULL,
    EXPECTED_HEALTH_FULL,
    EXPECTED_PAGE_FULL,
    HEALTH_FULL,
    HEALTH_NEVER,
)

_CONN = object()


class _FakePool:
    def __init__(self) -> None:
        self.checkouts = 0

    @contextmanager
    def connection(self) -> Iterator[object]:
        self.checkouts += 1
        yield _CONN


class _Spy:
    def __init__(self, result: Any = None, raises: Exception | None = None) -> None:
        self.calls: list[tuple[tuple[Any, ...], dict[str, Any]]] = []
        self._result = result
        self._raises = raises

    def __call__(self, *args: Any, **kwargs: Any) -> Any:
        self.calls.append((args, kwargs))
        if self._raises is not None:
            raise self._raises
        return self._result


def _unreached(name: str) -> Any:
    def _fail(*args: Any, **kwargs: Any) -> Any:
        raise AssertionError(f"{name} reached")

    return _fail


def _install(
    monkeypatch: pytest.MonkeyPatch,
    *,
    attention: Any = None,
    health: Any = None,
    problems: Any = None,
) -> None:
    monkeypatch.setattr(
        "factorflow.api.routes.data_health.read_attention",
        attention or _unreached("read_attention"),
    )
    monkeypatch.setattr(
        "factorflow.api.routes.data_health.read_data_health",
        health or _unreached("read_data_health"),
    )
    monkeypatch.setattr(
        "factorflow.api.routes.data_health.read_problems",
        problems or _unreached("read_problems"),
    )


def _client(pool: _FakePool, *, raise_server_exceptions: bool = True) -> TestClient:
    app = FastAPI()
    app.add_exception_handler(RequestValidationError, app_module._validation_error_handler)
    app.include_router(data_health.router)
    app.state.db_pool = pool
    return TestClient(
        app, base_url="http://127.0.0.1:8000", raise_server_exceptions=raise_server_exceptions
    )


def _problems_refusal(resource: str, message: str) -> dict[str, Any]:
    return {
        "error": {
            "code": "validation_error",
            "message": message,
            "resource": resource,
            "request_id": "unknown",
        }
    }


# Implements TC-COMP-051
@pytest.mark.parametrize("query", ["limit=0", "limit=501"])
def test_a_limit_outside_one_to_five_hundred_is_refused_and_never_echoed(
    monkeypatch: pytest.MonkeyPatch, query: str
) -> None:
    _install(monkeypatch)
    pool = _FakePool()
    response = _client(pool).get(f"/api/data-health/problems?{query}")
    assert response.status_code == 422
    assert response.json() == _problems_refusal(
        "problems", "The request did not match the expected shape: `limit`."
    )
    assert "501" not in response.text
    assert pool.checkouts == 0


# Implements TC-COMP-051
@pytest.mark.parametrize("query", ["cursor=not%20a%20symbol", "cursor="])
def test_a_cursor_that_is_not_a_symbol_is_refused_and_never_echoed(
    monkeypatch: pytest.MonkeyPatch, query: str
) -> None:
    _install(monkeypatch)
    pool = _FakePool()
    response = _client(pool).get(f"/api/data-health/problems?{query}")
    assert response.status_code == 422
    assert response.json() == _problems_refusal("data-health", "`cursor` must be a stock symbol.")
    assert "not a symbol" not in response.text
    assert "NOT A SYMBOL" not in response.text
    assert pool.checkouts == 0


# Implements TC-COMP-051
def test_a_lower_case_cursor_is_normalised_before_the_reader(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    spy = _Spy(ProblemPage((), None))
    _install(monkeypatch, problems=spy)
    response = _client(_FakePool()).get("/api/data-health/problems?cursor=ko")
    assert response.status_code == 200
    assert len(spy.calls) == 1
    assert spy.calls[0][1]["cursor"] == "KO"


# Implements TC-COMP-052
def test_attention_delegates_once_with_one_connection(monkeypatch: pytest.MonkeyPatch) -> None:
    spy = _Spy(ATTENTION_FULL)
    _install(monkeypatch, attention=spy)
    pool = _FakePool()
    response = _client(pool).get("/api/attention")
    assert response.status_code == 200
    assert response.json() == EXPECTED_ATTENTION_FULL
    assert len(spy.calls) == 1
    args, kwargs = spy.calls[0]
    assert len(args) == 1
    assert args[0] is _CONN
    assert kwargs == {}
    assert pool.checkouts == 1


# Implements TC-COMP-052
def test_data_health_delegates_once_with_one_connection(monkeypatch: pytest.MonkeyPatch) -> None:
    spy = _Spy(HEALTH_FULL)
    _install(monkeypatch, health=spy)
    pool = _FakePool()
    response = _client(pool).get("/api/data-health")
    assert response.status_code == 200
    assert response.json() == EXPECTED_HEALTH_FULL
    assert len(spy.calls) == 1
    args, kwargs = spy.calls[0]
    assert len(args) == 1
    assert args[0] is _CONN
    assert kwargs == {}
    assert pool.checkouts == 1


# Implements TC-COMP-052
def test_problems_delegates_once_with_one_connection(monkeypatch: pytest.MonkeyPatch) -> None:
    spy = _Spy(HEALTH_FULL.problems)
    _install(monkeypatch, problems=spy)
    pool = _FakePool()
    response = _client(pool).get("/api/data-health/problems?cursor=AAA&limit=7")
    assert response.status_code == 200
    assert response.json() == EXPECTED_PAGE_FULL
    assert len(spy.calls) == 1
    args, kwargs = spy.calls[0]
    assert len(args) == 1
    assert args[0] is _CONN
    assert kwargs == {"cursor": "AAA", "limit": 7}
    assert isinstance(kwargs["limit"], int)
    assert pool.checkouts == 1


# Implements TC-COMP-052
def test_an_empty_store_answers_zero_counts_and_never_acquired(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _install(
        monkeypatch,
        attention=_Spy(ATTENTION_EMPTY),
        health=_Spy(HEALTH_NEVER),
    )
    client = _client(_FakePool())
    attention = client.get("/api/attention")
    assert attention.status_code == 200
    assert attention.json()["problems"]["stock_count"] == 0
    assert attention.json()["followed_count"] == 0
    assert attention.json()["latest_terminal_download"] is None
    health = client.get("/api/data-health")
    assert health.status_code == 200
    assert health.json()["never_acquired"] is True
    assert health.json()["checks"] == {"daily_prices": None, "company_financials": None}


# Implements TC-COMP-052
@pytest.mark.parametrize(
    ("path", "reader"),
    [
        ("/api/attention", "attention"),
        ("/api/data-health", "health"),
        ("/api/data-health/problems", "problems"),
    ],
)
def test_a_database_error_propagates_uncaught(
    monkeypatch: pytest.MonkeyPatch, path: str, reader: str
) -> None:
    err = psycopg.OperationalError("connection lost")
    _install(monkeypatch, **{reader: _Spy(raises=err)})
    client = _client(_FakePool(), raise_server_exceptions=True)
    with pytest.raises(psycopg.Error) as excinfo:
        client.get(path)
    assert excinfo.value is err


# Implements TC-COMP-053
def test_only_validated_values_reach_the_reader(monkeypatch: pytest.MonkeyPatch) -> None:
    spy = _Spy(ProblemPage((), None))
    _install(monkeypatch, problems=spy)
    client = _client(_FakePool())
    assert client.get("/api/data-health/problems").status_code == 200
    assert client.get("/api/data-health/problems?limit=1").status_code == 200
    assert client.get("/api/data-health/problems?limit=500").status_code == 200
    assert client.get("/api/data-health/problems?cursor=%20brk.b%20").status_code == 200
    assert [kwargs for _, kwargs in spy.calls] == [
        {"cursor": None, "limit": 50},
        {"cursor": None, "limit": 1},
        {"cursor": None, "limit": 500},
        {"cursor": "BRK.B", "limit": 50},
    ]


# Implements TC-COMP-053
def test_the_router_holds_no_sql_and_no_logging() -> None:
    source = inspect.getsource(data_health)
    assert ".execute(" not in source
    assert "import logging" not in source
    assert "getLogger" not in source
    assert "print(" not in source


# Implements TC-COMP-053
def test_the_handlers_log_nothing(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    _install(
        monkeypatch,
        attention=_Spy(ATTENTION_FULL),
        health=_Spy(HEALTH_FULL),
        problems=_Spy(ProblemPage((), None)),
    )
    client = _client(_FakePool())
    caplog.set_level(logging.DEBUG)
    client.get("/api/attention")
    client.get("/api/data-health")
    client.get("/api/data-health/problems")
    client.get("/api/data-health/problems?cursor=not%20a%20symbol")
    assert [r.name for r in caplog.records if r.name.startswith("factorflow")] == []


def test_the_route_table_is_three_reads() -> None:
    table = {
        (route.path, frozenset(route.methods))
        for route in data_health.router.routes
        if isinstance(route, APIRoute)
    }
    assert table == {
        ("/api/attention", frozenset({"GET"})),
        ("/api/data-health", frozenset({"GET"})),
        ("/api/data-health/problems", frozenset({"GET"})),
    }


def test_problems_is_served_by_the_problems_handler(monkeypatch: pytest.MonkeyPatch) -> None:
    spy = _Spy(ProblemPage((), None))
    _install(monkeypatch, problems=spy)
    assert _client(_FakePool()).get("/api/data-health/problems").status_code == 200
    assert len(spy.calls) == 1
