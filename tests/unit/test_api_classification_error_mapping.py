"""Service refusals map to the documented status and code (CAP-002-E1-S6; task plan T007).

Component design `component-design-classification-api.md` section 2.5. The universes rows
are this story's; CAP-002-E3-S5 appends the classification rows. Every service function is
doubled, so the mapping is pinned without a database; the app is built by `create_app()`
so the request id and the delivered handlers are the real ones.
"""

import base64
import inspect
import json
from collections.abc import Iterator
from contextlib import contextmanager
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg
import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app
from factorflow.api.routes import classifications, universes
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


# --- classification reads (CAP-002-E3-S5; task plan T007, T009) -------------------------------

SET_ID = UUID("aaaaaaaa-0000-0000-0000-000000000001")
OTHER_SET_ID = UUID("bbbbbbbb-0000-0000-0000-000000000002")
READER_READS = (
    "list_classifications",
    "compare",
    "summary",
    "stock_evidence",
    "stock_history",
    "list_sets",
    "get_set",
)
CLASSIFICATION_PATHS = {
    "list_classifications": "/api/classifications",
    "summary": "/api/classifications/summary",
    "stock_evidence": "/api/classifications/stocks/NOPE",
    "stock_history": "/api/classifications/stocks/NOPE/history",
    "list_sets": "/api/classifications/sets",
    "get_set": f"/api/classifications/sets/{SET_ID}",
}


@pytest.fixture
def reads(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", f"postgresql://{SENTINEL}@127.0.0.1/unused")
    for name in READER_READS:
        monkeypatch.setattr(reader, name, _unexpected(name))
    app = create_app()
    app.state.db_pool = _FakePool()
    return TestClient(app, base_url="http://127.0.0.1:8000", raise_server_exceptions=False)


def _reader_raises(monkeypatch: pytest.MonkeyPatch, name: str, exc: Exception) -> None:
    monkeypatch.setattr(reader, name, _raising(exc))


def _forge(cursor: str, *, resign: bool = True, **changes: Any) -> str:
    """Change fields of a reader-issued cursor and re-encode it the reader's way.

    The checksum is recomputed unless ``resign`` is false, so a changed field is judged by the
    rule it breaks and not by the checksum the change leaves stale (IR-004).
    """
    payload = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    for key, value in changes.items():
        if value is None:
            payload.pop(key, None)
        else:
            payload[key] = value
    if resign and "chk" in payload:
        payload["chk"] = reader._cursor_check(payload)
    text = json.dumps(payload, separators=(",", ":"))
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


# Implements TC-COMP-148
def test_an_unknown_symbol_on_evidence_is_the_documented_envelope(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DAC-E3-S5-5, DEC-0139: 404 `instrument_not_found` in resource `classification`."""
    _reader_raises(monkeypatch, "stock_evidence", reader.InstrumentNotFound("NOPE"))
    response = reads.get("/api/classifications/stocks/NOPE")
    assert response.status_code == 404
    body = response.json()
    assert set(body) == {"error"}
    error = body["error"]
    assert set(error) == {"code", "message", "resource", "request_id"}
    assert error["code"] == "instrument_not_found"
    assert error["resource"] == "classification"
    assert error["request_id"] == response.headers["X-Request-Id"]
    assert "NOPE" in error["message"] and "evidence" in error["message"]
    for leak in ("InstrumentNotFound", "Traceback", 'File "', ".py"):
        assert leak not in response.text


# Implements TC-COMP-148
def test_an_unknown_symbol_on_history_names_the_history_read(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0139: the same code and resource, the message naming the history read."""
    _reader_raises(monkeypatch, "stock_history", reader.InstrumentNotFound("NOPE"))
    error = reads.get("/api/classifications/stocks/NOPE/history").json()["error"]
    assert (error["code"], error["resource"]) == ("instrument_not_found", "classification")
    assert "history" in error["message"] and "NOPE" in error["message"]


def test_a_missing_universe_or_set_is_a_404_in_its_own_resource(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.5: each missing thing is a 404 in its own code and resource."""
    _reader_raises(monkeypatch, "list_classifications", reader.UniverseNotFound(OTHER_SET_ID))
    response = reads.get("/api/classifications")
    assert response.status_code == 404
    error = response.json()["error"]
    assert (error["code"], error["resource"]) == ("universe_not_found", "universe")
    _reader_raises(monkeypatch, "get_set", reader.SetNotFound(SET_ID))
    response = reads.get(f"/api/classifications/sets/{SET_ID}")
    assert response.status_code == 404
    error = response.json()["error"]
    assert (error["code"], error["resource"]) == (
        "classification_set_not_found",
        "classification-set",
    )
    assert str(SET_ID) in error["message"]


def test_a_missing_universe_names_its_id_and_the_list_read(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Design 2.5, STD-UI-19: the message names the operation and the owner-supplied value."""
    _reader_raises(monkeypatch, "list_classifications", reader.UniverseNotFound(OTHER_SET_ID))
    message = reads.get("/api/classifications").json()["error"]["message"]
    assert message == f"Could not list the classifications: no universe has the id {OTHER_SET_ID}."


def test_each_read_that_can_refuse_names_its_own_operation(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """T019: the operation text tells the list, compare, set detail and set list apart."""
    cases = (
        ("compare", "/api/classifications?symbols=AAA,BBB", "compare the stocks"),
        ("get_set", f"/api/classifications/sets/{SET_ID}", "read the classification set"),
        ("list_sets", "/api/classifications/sets", "list the classification sets"),
    )
    for name, path, operation in cases:
        _reader_raises(monkeypatch, name, CursorError("x"))
        message = reads.get(path).json()["error"]["message"]
        assert message.startswith(f"Could not {operation}:"), (name, message)


@pytest.mark.parametrize("cursor", ["!!", "STALE"])
def test_every_cursor_refusal_is_in_the_classification_resource(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch, cursor: str
) -> None:
    """DEC-0139: invalid and stale cursors alike carry resource `classification`."""
    if cursor == "STALE":
        cursor = reader.encode_cursor(SET_ID, "symbol", "asc", "AAA", False, "AAA")
    _reader_raises(monkeypatch, "list_classifications", CursorError(cursor))
    error = reads.get("/api/classifications", params={"cursor": cursor}).json()["error"]
    assert error["resource"] == "classification"


def _list_cursor(sort: str = "symbol") -> str:
    if sort == "symbol":
        return reader.encode_cursor(SET_ID, "symbol", "asc", "AAA", False, "AAA")
    return reader.encode_cursor(SET_ID, sort, "desc", Decimal("12.345600"), False, "AAA")


INVALID = {
    "not base64": "!!",
    "no version": _forge(_list_cursor(), v=None),
    "no symbol": _forge(_list_cursor(), sym=None),
    "bad key": _forge(_list_cursor("value_score"), key="abc"),
    "unknown sort": _forge(_list_cursor("value_score"), sort="bogus"),
    "unknown order": _forge(_list_cursor("value_score"), order="sideways"),
    "set not a UUID": _forge(_list_cursor("value_score"), set="not-a-uuid"),
    "altered checksum": _forge(_list_cursor("value_score"), resign=False, sym="ZZZ"),
    "set a number": _forge(_list_cursor(), set=7),
    "not an object": base64.urlsafe_b64encode(b"[1,2]").decode().rstrip("="),
    "no set": _forge(_list_cursor(), set=None),
}
STALE = {
    "symbol sort": _list_cursor(),
    "null key, another set": reader.encode_cursor(
        OTHER_SET_ID, "value_score", "desc", None, True, "AAA"
    ),
}


# Implements T009 (DEC-0138 rows)
@pytest.mark.parametrize("cursor", INVALID.values(), ids=INVALID.keys())
def test_a_malformed_list_cursor_is_cursor_invalid(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch, cursor: str
) -> None:
    """DEC-0138: anything the reader's own decoder refuses is invalid, never stale."""
    _reader_raises(monkeypatch, "list_classifications", CursorError(cursor))
    response = reads.get("/api/classifications", params={"cursor": cursor})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "cursor_invalid"
    assert cursor not in response.text


def test_a_cursor_error_without_a_cursor_is_cursor_invalid(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """DEC-0138: with no cursor to inspect the helper cannot call it stale."""
    _reader_raises(monkeypatch, "list_classifications", CursorError("x"))
    assert reads.get("/api/classifications").json()["error"]["code"] == "cursor_invalid"


@pytest.mark.parametrize("cursor", STALE.values(), ids=STALE.keys())
def test_a_well_formed_cursor_for_another_set_is_cursor_stale(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch, cursor: str
) -> None:
    """DEC-0138: well formed by the reader's rules against the set and order it names."""
    _reader_raises(monkeypatch, "list_classifications", CursorError("other set"))
    response = reads.get("/api/classifications", params={"cursor": cursor})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "cursor_stale"
    assert cursor not in response.text


@pytest.mark.parametrize("name", ["stock_history", "list_sets"])
@pytest.mark.parametrize("cursor", STALE.values(), ids=STALE.keys())
def test_history_and_sets_cursors_are_always_invalid(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch, name: str, cursor: str
) -> None:
    """DEC-0138: those cursors carry no set, so a `CursorError` there is never stale."""
    _reader_raises(monkeypatch, name, CursorError("x"))
    response = reads.get(CLASSIFICATION_PATHS[name], params={"cursor": cursor})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "cursor_invalid"


@pytest.mark.parametrize("name", list(CLASSIFICATION_PATHS))
@pytest.mark.parametrize(
    "exc",
    [
        RuntimeError("password=hunter2 secret path /tmp/x"),
        ValueError(SENTINEL),
        psycopg.OperationalError("connection to server at 10.0.0.1 failed"),
    ],
)
def test_an_unmapped_exception_is_the_bare_internal_error(
    reads: TestClient, monkeypatch: pytest.MonkeyPatch, name: str, exc: Exception
) -> None:
    """SEC-ERR-001: 500 with the code and the request id and nothing else."""
    _reader_raises(monkeypatch, name, exc)
    response = reads.get(CLASSIFICATION_PATHS[name])
    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "request_id": response.headers["X-Request-Id"]}
    }
    assert "hunter2" not in response.text and SENTINEL not in response.text


def test_every_reader_exception_is_mapped_or_deliberately_unmapped() -> None:
    """A new reader exception cannot reach the owner unmapped by accident."""
    defined = {
        cls
        for _, cls in inspect.getmembers(reader, inspect.isclass)
        if issubclass(cls, Exception) and cls.__module__ == reader.__name__
    }
    unmapped_on_purpose: set[type[Exception]] = set()
    mapped = set(classifications.REFUSALS)
    assert defined == {reader.UniverseNotFound, reader.InstrumentNotFound, reader.SetNotFound}
    assert defined <= mapped | unmapped_on_purpose
    resources = {}
    for _status, code, resource in classifications.REFUSALS.values():
        assert resources.setdefault(code, resource) == resource
