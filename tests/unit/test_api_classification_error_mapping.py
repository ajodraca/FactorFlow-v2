"""Service refusals map to the documented status and code (CAP-002-E1-S6; task plan T007).

Component design `component-design-classification-api.md` section 2.5. The universes rows
are this story's; CAP-002-E3-S5 appends the classification rows. Every service function is
doubled, so the mapping is pinned without a database; the app is built by `create_app()`
so the request id and the delivered handlers are the real ones.
"""

import inspect
from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.api.routes import universes
from factorflow.classification import reader
from factorflow.runs.queries import CursorError
from factorflow.universes import service

SENTINEL = "secret-sentinel-4f1c"
UID = UUID("11111111-2222-3333-4444-555555555555")
REQUESTED = UUID("aaaaaaaa-0000-0000-0000-000000000001")
CURRENT = UUID("bbbbbbbb-0000-0000-0000-000000000002")

CREATE = ("POST", "/api/universes", {"name": "Mine", "symbols": ["AAA"]})
CREATE_FILTER = (
    "POST",
    "/api/universes",
    {"name": "Mine", "filter": {"value_percentile_min": "80"}, "set_id": str(REQUESTED)},
)
GET = ("GET", f"/api/universes/{UID}", None)
RENAME = ("PATCH", f"/api/universes/{UID}", {"name": "Renamed"})
RETIRE = ("DELETE", f"/api/universes/{UID}", None)
EVENTS = ("GET", f"/api/universes/{UID}/events", None)
LIST = ("GET", "/api/universes", None)
ADD = ("POST", f"/api/universes/{UID}/members", {"symbols": ["AAA"]})
REMOVE = ("DELETE", f"/api/universes/{UID}/members/AAA", None)

# (request, service function doubled, exception, status, code, resource)
ROWS: list[tuple[tuple[str, str, Any], str, Exception, int, str, str]] = [
    (CREATE, "create_by_hand", service.UniverseNameInUse(SENTINEL), 409,
     "universe_name_in_use", "universe"),
    (RENAME, "rename", service.UniverseNameInUse(SENTINEL), 409,
     "universe_name_in_use", "universe"),
    (REMOVE, "remove_member", service.LastMember(SENTINEL), 409, "last_member",
     "universe-member"),
    (RENAME, "rename", service.UniverseRetired(SENTINEL), 409, "universe_retired", "universe"),
    (ADD, "add_members", service.UniverseRetired(SENTINEL), 409, "universe_retired",
     "universe-member"),
    (REMOVE, "remove_member", service.UniverseRetired(SENTINEL), 409, "universe_retired",
     "universe-member"),
    (RETIRE, "retire", service.UniverseRetired(SENTINEL), 409, "universe_retired", "universe"),
    (CREATE, "create_by_hand", service.EmptyUniverse(SENTINEL), 422, "empty_universe",
     "universe"),
    (CREATE_FILTER, "create_from_filter", service.EmptyUniverse(SENTINEL), 422,
     "empty_universe", "universe"),
    (CREATE_FILTER, "create_from_filter", service.ClassificationSetChanged(REQUESTED, CURRENT),
     409, "classification_set_changed", "universe"),
    (CREATE, "create_by_hand", service.InstrumentNotAcquired(["ZZZ", "BBB"]), 409,
     "instrument_not_acquired", "universe"),
    (ADD, "add_members", service.InstrumentNotAcquired(["ZZZ", "BBB"]), 409,
     "instrument_not_acquired", "universe-member"),
    (GET, "get_universe", service.UniverseNotFound(SENTINEL), 404, "universe_not_found",
     "universe"),
    (RENAME, "rename", service.UniverseNotFound(SENTINEL), 404, "universe_not_found",
     "universe"),
    (RETIRE, "retire", service.UniverseNotFound(SENTINEL), 404, "universe_not_found",
     "universe"),
    (EVENTS, "list_events", service.UniverseNotFound(SENTINEL), 404, "universe_not_found",
     "universe"),
    (ADD, "add_members", service.UniverseNotFound(SENTINEL), 404, "universe_not_found",
     "universe"),
    (REMOVE, "remove_member", service.UniverseNotFound(SENTINEL), 404, "universe_not_found",
     "universe"),
    (REMOVE, "remove_member", service.NotAMember(SENTINEL), 404, "not_a_member",
     "universe-member"),
    (LIST, "list_universes", CursorError(SENTINEL), 422, "cursor_invalid", "universe"),
    (EVENTS, "list_events", CursorError(SENTINEL), 422, "cursor_invalid", "universe"),
]  # fmt: skip

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
    """Records how each connection block ended: `None`, or the exception that left it."""

    def __init__(self) -> None:
        self.exits: list[BaseException | None] = []

    @contextmanager
    def connection(self) -> Iterator[object]:
        try:
            yield object()
        except BaseException as exc:
            self.exits.append(exc)
            raise
        self.exits.append(None)


@pytest.fixture
def pool() -> _FakePool:
    return _FakePool()


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch, pool: _FakePool) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", f"postgresql://{SENTINEL}@127.0.0.1/unused")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", SENTINEL)
    for name in SERVICE_FUNCTIONS:
        monkeypatch.setattr(f"factorflow.universes.service.{name}", _unexpected(name))
    app = create_app()
    app.state.db_pool = pool
    return TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)


def _unexpected(name: str) -> Any:
    def double(*_args: object, **_kwargs: object) -> None:
        raise AssertionError(f"service.{name} reached")

    return double


def _raising(exc: Exception) -> Any:
    def double(*_args: object, **_kwargs: object) -> None:
        raise exc

    return double


def _assert_clean(text: str) -> None:
    assert "Traceback" not in text
    assert 'File "' not in text
    assert ".py" not in text
    assert SENTINEL not in text


# Implements TC-COMP-040
@pytest.mark.parametrize(
    ("call", "function", "exc", "status", "code", "resource"),
    ROWS,
    ids=[f"{row[4]}-{row[1]}" for row in ROWS],
)
def test_each_refusal_maps_to_its_status_and_code(
    client: TestClient,
    pool: _FakePool,
    monkeypatch: pytest.MonkeyPatch,
    call: tuple[str, str, Any],
    function: str,
    exc: Exception,
    status: int,
    code: str,
    resource: str,
) -> None:
    monkeypatch.setattr(f"factorflow.universes.service.{function}", _raising(exc))
    method, path, body = call

    response = client.request(method, path, json=body)

    assert response.status_code == status
    assert pool.exits == [exc], "the refusal left the connection block, so the pool rolled back"
    error = response.json()["error"]
    assert error["code"] == code
    assert error["resource"] == resource
    assert error["request_id"] == response.headers["X-Request-Id"]
    assert error["message"]
    _assert_clean(response.text)
    assert type(exc).__name__ not in response.text
    if code == "instrument_not_acquired":
        assert error["symbols"] == ["BBB", "ZZZ"]
        assert "BBB" in error["message"] and "ZZZ" in error["message"]
    else:
        assert "symbols" not in error
    if code == "classification_set_changed":
        assert str(REQUESTED) in error["message"]
        assert str(CURRENT) in error["message"]
    message = error["message"]
    if code in {"universe_not_found", "universe_retired", "not_a_member", "last_member"}:
        assert str(UID) in message
    if code in {"not_a_member", "last_member"}:
        assert "AAA" in message
    if code == "last_member":
        assert "retir" in message.lower()
    if code == "universe_name_in_use":
        assert body["name"] in message
    if code == "empty_universe":
        assert ("filter" in message) == (function == "create_from_filter")


# Implements TC-COMP-040
def test_a_stale_set_with_no_complete_set_names_the_requested_id(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        "factorflow.universes.service.create_from_filter",
        _raising(service.ClassificationSetChanged(REQUESTED, None)),
    )
    method, path, body = CREATE_FILTER
    response = client.request(method, path, json=body)
    assert response.status_code == 409
    assert str(REQUESTED) in response.json()["error"]["message"]


# Implements TC-COMP-040
def test_an_unmapped_exception_is_a_bare_internal_error(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        "factorflow.universes.service.get_universe",
        _raising(RuntimeError(f"boom with {SENTINEL}")),
    )

    response = client.get(f"/api/universes/{UID}")

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "request_id": response.headers["X-Request-Id"]}
    }
    _assert_clean(response.text)


# Implements TC-COMP-040
def test_an_unmapped_value_error_is_not_mistaken_for_a_refusal(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A plain `ValueError` (the service's shape failures) is no row of the table."""
    monkeypatch.setattr(
        "factorflow.universes.service.create_by_hand", _raising(ValueError(SENTINEL))
    )
    method, path, body = CREATE
    response = client.request(method, path, json=body)
    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"


# Implements TC-COMP-040
def test_every_service_exception_is_mapped() -> None:
    defined = [
        cls
        for _, cls in inspect.getmembers(service, inspect.isclass)
        if issubclass(cls, Exception) and cls.__module__ == service.__name__
    ]
    assert len(defined) == 8
    for cls in defined:
        assert cls in universes.REFUSALS, f"{cls.__name__} has no row in the mapping table"
    assert universes.REFUSALS[CursorError] == (422, "cursor_invalid")
    assert set(universes.REFUSALS) == {*defined, CursorError}


def test_the_mapping_table_is_the_design_table() -> None:
    assert {cls.__name__: entry for cls, entry in universes.REFUSALS.items()} == {
        "UniverseNotFound": (404, "universe_not_found"),
        "UniverseRetired": (409, "universe_retired"),
        "UniverseNameInUse": (409, "universe_name_in_use"),
        "EmptyUniverse": (422, "empty_universe"),
        "LastMember": (409, "last_member"),
        "NotAMember": (404, "not_a_member"),
        "InstrumentNotAcquired": (409, "instrument_not_acquired"),
        "ClassificationSetChanged": (409, "classification_set_changed"),
        "CursorError": (422, "cursor_invalid"),
    }


def test_the_reader_is_not_reached_on_a_refusal(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(
        "factorflow.universes.service.rename", _raising(service.UniverseRetired(SENTINEL))
    )
    monkeypatch.setattr(reader, "list_classifications", _unexpected("reader"))
    method, path, body = RENAME
    assert client.request(method, path, json=body).status_code == 409
