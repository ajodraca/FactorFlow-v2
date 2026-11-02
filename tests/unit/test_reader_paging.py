"""History and set-list paging and lookup checks before any SQL (CAP-002-E3-S4).

Design section 2.3 and DEC-0136 (PROVISIONAL): ``limit`` outside 1 to ``MAX_PAGE_SIZE`` raises
``ValueError`` and a malformed cursor raises the reader's ``CursorError``, both before a statement
reaches the connection; the cursor is ``factorflow.runs.queries``' ``(timestamp, id)`` wire
format, one definition (SA-DUP-001); ``SetNotFound`` is a ``LookupError``.
"""

import base64
import json
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

import pytest

from factorflow.api.bounds import MAX_PAGE_SIZE
from factorflow.classification import reader
from factorflow.runs import queries

TS = datetime(2026, 10, 14, 22, 35, 1, 123456, tzinfo=UTC)
SET_ID = UUID("0b0e8e7c-1111-4222-8333-444455556666")


class RecordingConnection:
    """A fake connection (the ``governor_fakes`` pattern): it records each statement and its
    parameters and returns no rows, as an empty store would."""

    def __init__(self) -> None:
        self.executed: list[tuple[str, Any]] = []

    def cursor(self) -> "RecordingCursor":
        return RecordingCursor(self.executed)


class RecordingCursor:
    description = None

    def __init__(self, executed: list[tuple[str, Any]]) -> None:
        self._executed = executed

    def __enter__(self) -> "RecordingCursor":
        return self

    def __exit__(self, *exc: object) -> None:
        return None

    def execute(self, query: str, params: Any = None) -> "RecordingCursor":
        self._executed.append((query, params))
        return self

    def fetchone(self) -> None:
        return None

    def fetchall(self) -> list[Any]:
        return []


def _history(fake: RecordingConnection, limit: int, cursor: str | None = None) -> Any:
    return reader.stock_history(fake, "AAPL", limit=limit, cursor=cursor)  # type: ignore[arg-type]


def _sets(fake: RecordingConnection, limit: int, cursor: str | None = None) -> Any:
    return reader.list_sets(fake, limit=limit, cursor=cursor)  # type: ignore[arg-type]


READS: list[Callable[..., Any]] = [_history, _sets]


def _raw(payload: Any) -> str:
    text = json.dumps(payload, separators=(",", ":"))
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


@pytest.mark.parametrize("read", READS)
@pytest.mark.parametrize("limit", [0, -1, MAX_PAGE_SIZE + 1, True, 1.5])
def test_limit_out_of_bounds_is_refused_before_any_statement(
    read: Callable[..., Any], limit: Any
) -> None:
    fake = RecordingConnection()

    with pytest.raises(ValueError, match="limit"):
        read(fake, limit)
    assert fake.executed == []


def test_limit_at_either_bound_passes_the_check() -> None:
    for limit in (1, MAX_PAGE_SIZE):
        fake = RecordingConnection()
        assert _sets(fake, limit) == ([], None)
        assert fake.executed[-1][0] == reader.SETS_SQL
        assert fake.executed[-1][1]["page_size"] == limit + 1
        fake = RecordingConnection()
        with pytest.raises(reader.InstrumentNotFound):  # the empty store knows no symbol
            _history(fake, limit)
        assert fake.executed[-1][0] == reader.HISTORY_SQL
        assert fake.executed[-1][1]["page_size"] == limit + 1


MALFORMED = [
    "",
    "!!",
    base64.urlsafe_b64encode(b"not json").decode(),
    _raw(["v", 1]),
    _raw({"v": 2, "ts": TS.isoformat(), "id": str(SET_ID)}),
    _raw({"v": 1, "ts": TS.isoformat(), "id": "not-a-uuid"}),
    _raw({"v": 1, "ts": "yesterday", "id": str(SET_ID)}),
    _raw({"v": 1, "id": str(SET_ID)}),
    # Fields of the wrong JSON type (review v1 IR-002).
    _raw({"v": 1, "ts": 5, "id": str(SET_ID)}),
    _raw({"v": 1, "ts": None, "id": str(SET_ID)}),
    _raw({"v": 1, "ts": TS.isoformat(), "id": 5}),
    _raw({"v": 1, "ts": TS.isoformat(), "id": None}),
]


@pytest.mark.parametrize("read", READS)
@pytest.mark.parametrize("cursor", MALFORMED)
def test_malformed_cursor_is_refused_before_any_statement(
    read: Callable[..., Any], cursor: str
) -> None:
    fake = RecordingConnection()

    with pytest.raises(reader.CursorError):
        read(fake, 10, cursor)
    assert fake.executed == []


def test_the_reader_cursor_error_is_the_runs_cursor_error() -> None:
    """The class the API already maps to 422."""
    assert reader.CursorError is queries.CursorError


def test_runs_cursor_round_trips_a_timestamp_and_an_id() -> None:
    assert queries.decode_cursor(queries.encode_cursor(TS, SET_ID)) == (TS, SET_ID)


def test_reads_accept_the_runs_cursor_and_bind_its_keyset() -> None:
    """One wire format (SA-DUP-001): the position reaches SQL only as bound parameters."""
    cursor = queries.encode_cursor(TS, SET_ID)

    fake = RecordingConnection()
    _sets(fake, 10, cursor)
    params = fake.executed[-1][1]
    assert (params["after_started_at"], params["after_set_id"]) == (TS, SET_ID)
    assert params["set_id"] is None

    fake = RecordingConnection()
    with pytest.raises(reader.InstrumentNotFound):
        _history(fake, 10, cursor)
    params = fake.executed[-1][1]
    assert (params["after_ended_at"], params["after_set_id"]) == (TS, SET_ID)


def test_first_page_binds_no_keyset() -> None:
    fake = RecordingConnection()
    _sets(fake, 10)
    params = fake.executed[-1][1]
    assert (params["after_started_at"], params["after_set_id"]) == (None, None)

    fake = RecordingConnection()
    with pytest.raises(reader.InstrumentNotFound):
        _history(fake, 10)
    params = fake.executed[-1][1]
    assert (params["after_ended_at"], params["after_set_id"]) == (None, None)
    assert params["symbol"] == "AAPL"
    assert params["current_set_id"] is None
    assert params["factor_order"] == list(reader.FACTORS)


def test_get_set_binds_the_id_and_one_row() -> None:
    fake = RecordingConnection()

    with pytest.raises(reader.SetNotFound) as raised:
        reader.get_set(fake, SET_ID)  # type: ignore[arg-type]
    assert fake.executed == [
        (
            reader.SETS_SQL,
            {"set_id": SET_ID, "after_started_at": None, "after_set_id": None, "page_size": 1},
        )
    ]
    assert raised.value.set_id == SET_ID


def test_set_not_found_is_a_lookup_error_distinct_from_instrument_not_found() -> None:
    assert issubclass(reader.SetNotFound, LookupError)
    assert not issubclass(reader.InstrumentNotFound, reader.SetNotFound)
    assert not issubclass(reader.SetNotFound, reader.InstrumentNotFound)
