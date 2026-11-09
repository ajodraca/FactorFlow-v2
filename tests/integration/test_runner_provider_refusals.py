"""Integration tests: provider refusals through the acquisition runner (CAP-003-E8-S4).

The runner starts each stock's throttle wait budget at the checkpoint where it
refreshes that stock's heartbeat (acquisition-runner CAP-003 section 2.2;
system design section 3.6 note 4), and both provider refusals are proven end
to end through the runner: a `403` plan refusal and a persistent `429` rate
limit, the latter at the default timing set (system design constraint 16 (e)).

Implements CAP-003 TC-COMP-252 to TC-COMP-256, TC-COMP-258 and TC-COMP-259
(DAC-E8-20). Every `403` and `429` case runs the real `MassiveClient`, the real
SDK and urllib3 request path and the real `RateLimitGovernor`, built from
production `MassiveSettings`, with one `FakeClock` passed as both `monotonic`
and `now` and a `FakeSleeper` on it; only urllib3's `_make_request` is
replaced, by `tests/unit/massive_transport_fakes.py`. Request counts come from
`RecordingMakeRequest`, never from a stored result column (DAC-E8-S4-8).

Each harness is built inside the test, after the database fixture: psycopg's
sync connect resolves its host through `socket.getaddrinfo`, which
`forbid_sockets` refuses, so every read here uses the fixture's connection.
"""

from __future__ import annotations

import copy
import json
import uuid
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, Mock
from urllib.parse import parse_qs

import psycopg
import pytest

import factorflow.ingestion.runner as runner_module
from factorflow.config.settings import MassiveSettings, RunSettings
from factorflow.ingestion.massive.client import MassiveClient
from factorflow.ingestion.massive.errors import (
    CredentialRejected,
    ProviderNotEntitled,
    ProviderRateLimited,
)
from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)
from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor
from factorflow.ingestion.runner import AcquisitionRunner
from factorflow.runs import journal
from tests.unit.governor_fakes import FakeClock, FakeSleeper, SequenceJitter
from tests.unit.massive_transport_fakes import (
    FakeAnswer,
    RecordedRequest,
    RecordingMakeRequest,
    forbid_sockets,
    generated_test_key,
    json_answer,
)

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures" / "massive"

_TODAY = date(2025, 9, 22)
# A multiple of 60, so each jitter-0.0 throttle wait is exactly 60.0 s.
_CLOCK_START = 1_762_560_000.0
_PLAN_REFUSAL_TEXT = "You are not entitled to this data. Please upgrade your plan"
_FINANCIALS_PREFIX = "/stocks/financials/v1/"
_BALANCE_SHEETS = "/stocks/financials/v1/balance-sheets"
_SUCCESSFUL = {"written", "unchanged"}
_DATA_TYPES = ("corporate_actions", "fundamentals", "prices", "reference")
# The reason release 0.2.0 stored for both refusals (follow-up F1).
_PRE_UPGRADE_REASON = (
    "[unavailable] symbol={symbol} data_type=fundamentals request_id=unavailable: "
    "The provider failed 3 consecutive attempts."
)


# ---------------------------------------------------------------------------
# Store helpers (copied, as every runner test file does)
# ---------------------------------------------------------------------------


def _insert_instrument(conn: psycopg.Connection, symbol: str) -> int:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active') "
            "RETURNING instrument_id",
            (symbol,),
        )
        row = cur.fetchone()
    assert row is not None
    conn.commit()
    return int(row[0])


def _insert_claimed_run(conn: psycopg.Connection, depth: int = 5) -> uuid.UUID:
    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', %s, now(), now(), 'test-runner', now())",
            (run_id, depth),
        )
    conn.commit()
    return run_id


def _set_cancelling(conn: psycopg.Connection, run_id: uuid.UUID) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET state = 'cancelling', "
            "cancel_requested_at = now() WHERE run_id = %s",
            (run_id,),
        )
    conn.commit()


def _abandon_run(conn: psycopg.Connection, run_id: uuid.UUID) -> None:
    """Abandon the run as the reclaim sweeper does, as `_abandon_run` in
    `tests/integration/test_runner_reclaim.py` does."""
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE acquisition_run SET state = 'abandoned', ended_at = now(), "
            "claimed_by = NULL, heartbeat_at = NULL WHERE run_id = %s",
            (run_id,),
        )
    conn.commit()


def _fetch_run_state(conn: psycopg.Connection, run_id: uuid.UUID) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT state FROM acquisition_run WHERE run_id = %s", (run_id,))
        row = cur.fetchone()
    assert row is not None
    return str(row[0])


def _fetch_result_rows(conn: psycopg.Connection, run_id: uuid.UUID) -> list[dict[str, Any]]:
    """The run's results, read without the retry-count column (DAC-E8-S4-8)."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT instrument_id, data_type, outcome, reason "
            "FROM run_instrument_result "
            "WHERE run_id = %s ORDER BY instrument_id, data_type",
            (run_id,),
        )
        return [
            {
                "instrument_id": row[0],
                "data_type": row[1],
                "outcome": row[2],
                "reason": row[3],
            }
            for row in cur.fetchall()
        ]


def _rows_of(rows: list[dict[str, Any]], instrument_id: int) -> dict[str, tuple[str, str | None]]:
    return {
        r["data_type"]: (r["outcome"], r["reason"])
        for r in rows
        if r["instrument_id"] == instrument_id
    }


# ---------------------------------------------------------------------------
# Transport responders
# ---------------------------------------------------------------------------


def _load(name: str) -> Any:
    return json.loads((FIXTURES / name).read_text())


def _route(path: str) -> str:
    return path.split("?", 1)[0]


def _symbol_of(path: str) -> str | None:
    """The symbol a recorded request is for: the segment after `/tickers/` or
    `/ticker/`, otherwise the `ticker` or `tickers` query parameter."""
    route, _, query = path.partition("?")
    segments = route.split("/")
    for marker in ("tickers", "ticker"):
        if marker in segments:
            index = segments.index(marker)
            if index + 1 < len(segments) and segments[index + 1]:
                return segments[index + 1]
    params = parse_qs(query)
    for name in ("ticker", "tickers"):
        if name in params:
            return params[name][0]
    return None


def _plan_refusal_answer() -> Callable[[RecordedRequest], FakeAnswer]:
    """A fresh responder: every financial-statements request is a `403` plan
    refusal whose request id counts the refusals answered; the reference is
    `reference_active.json` for the requested symbol; ticker events are an
    empty event list; every other read is an empty result set."""
    refusals = 0

    def responder(request: RecordedRequest) -> FakeAnswer:
        nonlocal refusals
        path = request.path
        if path.startswith(_FINANCIALS_PREFIX):
            refusals += 1
            return json_answer(
                {
                    "status": "ERROR",
                    "request_id": f"req_403_{refusals}",
                    "message": _PLAN_REFUSAL_TEXT,
                },
                status=403,
            )
        if "/events" in path:
            return json_answer({"request_id": "req_ok_001", "results": {"events": []}})
        if path.startswith("/v3/reference/tickers/"):
            reference = copy.deepcopy(_load("reference_active.json"))
            reference["ticker"] = _symbol_of(path)
            return json_answer({"request_id": "req_ok_001", "results": reference})
        return json_answer({"request_id": "req_ok_001", "results": []})

    return responder


def _throttling(
    symbols: set[str], otherwise: Callable[[RecordedRequest], FakeAnswer]
) -> Callable[[RecordedRequest], FakeAnswer]:
    """Answer every request for one of `symbols` with a real `429` carrying the
    bytes of `error_rate_limited.json`; delegate every other to `otherwise`."""
    throttled_body = (FIXTURES / "error_rate_limited.json").read_bytes()

    def responder(request: RecordedRequest) -> FakeAnswer:
        if _symbol_of(request.path) in symbols:
            return FakeAnswer(
                status=429,
                body=throttled_body,
                headers={"Content-Type": "application/json"},
            )
        return otherwise(request)

    return responder


# ---------------------------------------------------------------------------
# Real-client harness with checkpoint marks
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class _Mark:
    """One checkpoint: what happened, the virtual clock, and how many sleeps
    and requests had been recorded at that moment."""

    kind: str
    clock: float
    sleeps: int
    requests: int


@dataclass
class _Harness:
    settings: MassiveSettings
    run_settings: RunSettings
    clock: FakeClock
    sleeper: FakeSleeper
    governor: RateLimitGovernor
    client: MassiveClient
    transport: RecordingMakeRequest
    marks: list[_Mark] = field(default_factory=list)

    def mark(self, kind: str) -> None:
        self.marks.append(
            _Mark(kind, self.clock(), len(self.sleeper.calls), len(self.transport.requests))
        )

    def checkpoints(self) -> list[_Mark]:
        """The heartbeat and finalise marks, in order."""
        return [m for m in self.marks if m.kind in ("heartbeat", "finalise")]

    def interval_sleeps(self) -> list[list[float]]:
        """The sleeps between consecutive checkpoints."""
        points = self.checkpoints()
        return [
            self.sleeper.calls[m.sleeps : n.sleeps]
            for m, n in zip(points, points[1:], strict=False)
        ]

    def interval_requests(self) -> list[list[RecordedRequest]]:
        """The requests between consecutive checkpoints."""
        points = self.checkpoints()
        return [
            self.transport.requests[m.requests : n.requests]
            for m, n in zip(points, points[1:], strict=False)
        ]


def _real_harness(
    monkeypatch: pytest.MonkeyPatch,
    responder: Callable[[RecordedRequest], FakeAnswer],
    *,
    jitter: float,
) -> _Harness:
    for name in (
        "FACTORFLOW_MASSIVE_BASE_URL",
        "FACTORFLOW_MASSIVE_MAX_ATTEMPTS",
        "FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS",
        "FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS",
        "FACTORFLOW_MASSIVE_TIMEOUT_SECONDS",
        "FACTORFLOW_RUN_HEARTBEAT_SECONDS",
        "FACTORFLOW_RUN_STALE_AFTER_SECONDS",
        "FACTORFLOW_RUN_POLL_INTERVAL_SECONDS",
    ):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", generated_test_key())
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    settings = MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    run_settings = RunSettings(_env_file=None)  # type: ignore[call-arg]
    # The default timing set system design constraint 16 (e) names.
    assert settings.max_attempts == 3
    assert settings.max_throttle_wait_seconds == 300.0
    assert run_settings.stale_after_seconds == 900.0

    clock = FakeClock(_CLOCK_START)
    sleeper = FakeSleeper(clock)
    governor = RateLimitGovernor(
        GovernorSettings.from_massive_settings(settings),
        monotonic=clock,
        now=clock,
        sleep=sleeper,
        jitter=SequenceJitter([jitter]),
    )
    client = MassiveClient(settings=settings, governor=governor)
    forbid_sockets(monkeypatch)
    transport = RecordingMakeRequest(responder).install(monkeypatch)
    harness = _Harness(
        settings=settings,
        run_settings=run_settings,
        clock=clock,
        sleeper=sleeper,
        governor=governor,
        client=client,
        transport=transport,
    )

    def marked_heartbeat(connection: psycopg.Connection, run_id: uuid.UUID, runner_id: str) -> bool:
        harness.mark("heartbeat")
        return journal.heartbeat(connection, run_id, runner_id)

    def marked_finalise(connection: psycopg.Connection, run_id: uuid.UUID) -> str:
        harness.mark("finalise")
        return journal.finalise(connection, run_id)

    start_budget = governor.start_throttle_budget

    def marked_start_budget() -> None:
        harness.mark("budget")
        start_budget()

    monkeypatch.setattr(runner_module, "heartbeat", marked_heartbeat)
    monkeypatch.setattr(runner_module, "finalise", marked_finalise)
    monkeypatch.setattr(governor, "start_throttle_budget", marked_start_budget)
    return harness


@dataclass
class _Download:
    run_id: uuid.UUID
    ids: dict[str, int]
    harness: _Harness


_Prepare = Callable[[psycopg.Connection, dict[str, int]], None]


def _run_download(
    conn: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
    responder: Callable[[RecordedRequest], FakeAnswer],
    *,
    jitter: float,
    roster: list[str],
    prepare: _Prepare | None,
) -> _Download:
    ids = {symbol: _insert_instrument(conn, symbol) for symbol in roster}
    if prepare is not None:
        prepare(conn, ids)
    run_id = _insert_claimed_run(conn)
    harness = _real_harness(monkeypatch, responder, jitter=jitter)
    AcquisitionRunner(connection=conn, client=harness.client, today=_TODAY).execute_claimed(
        run_id=run_id, depth_years=5, instrument_ids=[ids[symbol] for symbol in roster]
    )
    return _Download(run_id=run_id, ids=ids, harness=harness)


def _run_plan_refusal_download(
    conn: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
    *,
    prepare: _Prepare | None = None,
) -> _Download:
    """Followed stocks `AAPL` then `KO`, every financial-statements request
    refused by the plan."""
    return _run_download(
        conn,
        monkeypatch,
        _plan_refusal_answer(),
        jitter=0.0,
        roster=["AAPL", "KO"],
        prepare=prepare,
    )


def _run_throttled_download(
    conn: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
    *,
    jitter: float,
    roster: list[str],
    throttled: frozenset[str] = frozenset({"KO"}),
    prepare: _Prepare | None = None,
) -> _Download:
    """Every request for a `throttled` symbol answers `429`; every other stock
    answers as in the plan-refusal download."""
    return _run_download(
        conn,
        monkeypatch,
        _throttling(set(throttled), _plan_refusal_answer()),
        jitter=jitter,
        roster=roster,
        prepare=prepare,
    )


# ---------------------------------------------------------------------------
# Stub client for the call-order cases
# ---------------------------------------------------------------------------


def _stub_client() -> MagicMock:
    """A client returning one row per data type, as `_make_stub_client` in
    `tests/integration/test_runner_cancel.py` does."""
    client = MagicMock()
    client.fetch_reference.return_value = TickerReference.model_validate(
        {
            "ticker": "X",
            "name": "X Corp",
            "cik": "0001234567",
            "composite_figi": "BBG000B9XRY4",
            "share_class_figi": "BBG001S5N8V8",
            "active": True,
            "list_date": "2000-01-01",
            "delisted_utc": None,
        }
    )
    client.fetch_daily_bars.return_value = [
        DailyBar.model_validate(
            {
                "t": 1735776000000,
                "o": "100.00",
                "h": "105.00",
                "l": "99.00",
                "c": "103.00",
                "v": 500000,
                "vw": "101.00",
                "n": 1000,
            }
        )
    ]
    client.fetch_financials.return_value = [
        FinancialStatement.model_validate(
            {
                "cik": "0001234567",
                "tickers": ["X"],
                "period_end": "2024-12-31",
                "filing_date": "2025-02-01",
                "fiscal_year": 2024,
                "timeframe": "annual",
                "statement_type": "income_statement",
                "total_revenue": "1000000",
            }
        )
    ]
    client.fetch_corporate_actions.return_value = [
        CorporateAction.model_validate(
            {
                "action_type": "split",
                "effective_on": "2020-01-01",
                "ticker": "X",
                "split_from": 1,
                "split_to": 2,
            }
        )
    ]
    return client


def _spied_parent(monkeypatch: pytest.MonkeyPatch, client: MagicMock) -> Mock:
    """One parent `Mock` recording the client's calls and the runner's
    `heartbeat` and `cancellation_requested` calls in one order."""
    parent = Mock()
    parent.attach_mock(client, "client")
    for name in ("heartbeat", "cancellation_requested"):
        spy = Mock(wraps=getattr(journal, name))
        parent.attach_mock(spy, name)
        monkeypatch.setattr(runner_module, name, spy)
    return parent


_ONE_STOCK = [
    "heartbeat",
    "cancellation_requested",
    "client.start_instrument",
    "client.fetch_reference",
    "client.fetch_daily_bars",
    "client.fetch_financials",
    "client.fetch_corporate_actions",
]


# ---------------------------------------------------------------------------
# TC-COMP-252: the stock boundary
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements CAP-003 TC-COMP-252
def test_start_instrument_is_called_once_per_stock_after_its_heartbeat_and_cancellation_check(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E8-S4-1, DAC-E8-7: each stock's `start_instrument()` follows that
    stock's `heartbeat` and `cancellation_requested` and precedes its first
    `fetch_*`, once per stock."""
    conn = migrated_runner_connection
    first = _insert_instrument(conn, "AAPL")
    second = _insert_instrument(conn, "KO")
    run_id = _insert_claimed_run(conn)
    client = _stub_client()
    parent = _spied_parent(monkeypatch, client)

    AcquisitionRunner(connection=conn, client=client, today=_TODAY).execute_claimed(
        run_id=run_id, depth_years=5, instrument_ids=[first, second]
    )

    assert [c[0] for c in parent.mock_calls] == [
        "heartbeat",
        "cancellation_requested",
        "client.start_instrument",
        "client.fetch_reference",
        "client.fetch_daily_bars",
        "client.fetch_financials",
        "client.fetch_corporate_actions",
    ] * 2
    assert _fetch_run_state(conn, run_id) == "succeeded"


@pytest.mark.postgres
# Implements CAP-003 TC-COMP-252
def test_a_stock_cancelled_before_it_is_fetched_starts_no_budget(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E8-S4-1, DAC-E8-7: with cancellation requested during the first
    stock, the second stock is never fetched and starts no budget."""
    conn = migrated_runner_connection
    first = _insert_instrument(conn, "AAPL")
    second = _insert_instrument(conn, "KO")
    run_id = _insert_claimed_run(conn)
    client = _stub_client()
    actions = client.fetch_corporate_actions.return_value

    def cancel_then_answer(*_args: object) -> list[CorporateAction]:
        _set_cancelling(conn, run_id)
        return actions

    client.fetch_corporate_actions.side_effect = cancel_then_answer
    parent = _spied_parent(monkeypatch, client)

    AcquisitionRunner(connection=conn, client=client, today=_TODAY).execute_claimed(
        run_id=run_id, depth_years=5, instrument_ids=[first, second]
    )

    assert [c[0] for c in parent.mock_calls] == _ONE_STOCK + [
        "heartbeat",
        "cancellation_requested",
    ]
    assert client.start_instrument.call_count == 1
    assert _fetch_run_state(conn, run_id) == "cancelled"


@pytest.mark.postgres
# Implements CAP-003 TC-COMP-252
def test_a_stock_whose_claim_is_lost_before_it_is_fetched_starts_no_budget(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E8-7: with the claim lost during the first stock, the second
    stock's `heartbeat` fails, so it is never fetched and starts no budget."""
    conn = migrated_runner_connection
    first = _insert_instrument(conn, "AAPL")
    second = _insert_instrument(conn, "KO")
    run_id = _insert_claimed_run(conn)
    client = _stub_client()
    actions = client.fetch_corporate_actions.return_value

    def abandon_then_answer(*_args: object) -> list[CorporateAction]:
        _abandon_run(conn, run_id)
        return actions

    client.fetch_corporate_actions.side_effect = abandon_then_answer
    parent = _spied_parent(monkeypatch, client)

    AcquisitionRunner(connection=conn, client=client, today=_TODAY).execute_claimed(
        run_id=run_id, depth_years=5, instrument_ids=[first, second]
    )

    assert [c[0] for c in parent.mock_calls] == _ONE_STOCK + ["heartbeat"]
    assert client.start_instrument.call_count == 1
    assert _fetch_run_state(conn, run_id) == "abandoned"


@pytest.mark.postgres
# Implements CAP-003 TC-COMP-252
def test_a_stock_skipped_for_a_missing_symbol_starts_its_budget_before_the_symbol_lookup(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E8-7, acquisition-runner CAP-003 section 2.2: a roster stock with
    no `instrument` row gets its one `start_instrument()` after its
    `heartbeat` and `cancellation_requested` and before the symbol lookup
    that skips it, as every other stock does."""
    conn = migrated_runner_connection
    first = _insert_instrument(conn, "AAPL")
    second = _insert_instrument(conn, "KO")
    missing = second + 1000
    run_id = _insert_claimed_run(conn)
    client = _stub_client()
    parent = _spied_parent(monkeypatch, client)
    lookup = Mock(wraps=runner_module._symbol_for_id)
    parent.attach_mock(lookup, "symbol_lookup")
    monkeypatch.setattr(runner_module, "_symbol_for_id", lookup)

    AcquisitionRunner(connection=conn, client=client, today=_TODAY).execute_claimed(
        run_id=run_id, depth_years=5, instrument_ids=[first, missing, second]
    )

    fetched = [
        "heartbeat",
        "cancellation_requested",
        "client.start_instrument",
        "symbol_lookup",
        "client.fetch_reference",
        "client.fetch_daily_bars",
        "client.fetch_financials",
        "client.fetch_corporate_actions",
    ]
    skipped = [
        "heartbeat",
        "cancellation_requested",
        "client.start_instrument",
        "symbol_lookup",
    ]
    assert [c[0] for c in parent.mock_calls] == fetched + skipped + fetched
    assert client.start_instrument.call_count == 3
    assert [c.args[1] for c in lookup.call_args_list] == [first, missing, second]


# ---------------------------------------------------------------------------
# TC-COMP-253: a real 403 plan refusal
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements CAP-003 TC-COMP-253
def test_a_real_403_plan_refusal_is_sent_once_per_stock_and_the_download_finishes_partial(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E8-S4-2, DAC-E8-9, DAC-E8-20: each stock's fundamentals are
    recorded `[not_entitled]` after one balance-sheets request, its other
    data types are stored, and the run is `partial`."""
    conn = migrated_runner_connection
    download = _run_plan_refusal_download(conn, monkeypatch)
    harness = download.harness
    rows = _fetch_result_rows(conn, download.run_id)

    for symbol in ("AAPL", "KO"):
        stock = _rows_of(rows, download.ids[symbol])
        outcome, reason = stock["fundamentals"]
        assert outcome == "failed"
        assert reason is not None
        assert reason.startswith(
            f"[not_entitled] symbol={symbol} data_type=fundamentals request_id=req_403_"
        )
        assert reason.endswith("the provider plan is not entitled to this data")
        for data_type in ("reference", "prices", "corporate_actions"):
            assert stock[data_type][0] in _SUCCESSFUL, (symbol, data_type, stock[data_type])

        routes = [
            _route(r.path) for r in harness.transport.requests if _symbol_of(r.path) == symbol
        ]
        assert routes.count(_BALANCE_SHEETS) == 1
        assert not [r for r in routes if r.startswith("/stocks/financials/v1/income-statements")]
        assert not [r for r in routes if r.startswith("/stocks/financials/v1/cash-flow-statements")]

    # The refusal did not stop the download: the second stock was fetched.
    assert set(_rows_of(rows, download.ids["KO"])) == set(_DATA_TYPES)
    assert harness.sleeper.calls == []
    assert _fetch_run_state(conn, download.run_id) == "partial"


# ---------------------------------------------------------------------------
# TC-COMP-254: a persistent 429 at the default timing set
# ---------------------------------------------------------------------------


def _corporate_action_route(route: str, symbol: str) -> bool:
    return route in (
        "/stocks/v1/splits",
        "/stocks/v1/dividends",
        "/vX/reference/ipos",
        f"/vX/reference/tickers/{symbol}/events",
    )


@pytest.mark.postgres
@pytest.mark.parametrize("jitter", [0.0, 0.999])
# Implements CAP-003 TC-COMP-254
def test_a_persistent_429_stays_inside_the_staleness_window_and_finishes_partial(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
    jitter: float,
) -> None:
    """DAC-E8-S4-3, DAC-E8-10, DAC-E8-8, DAC-E8-20: `KO` always `429`, then
    `AAPL` refused on its financials; assertions (a) to (e)."""
    conn = migrated_runner_connection
    download = _run_throttled_download(conn, monkeypatch, jitter=jitter, roster=["KO", "AAPL"])
    harness = download.harness
    rows = _fetch_result_rows(conn, download.run_id)

    # (a) No heartbeat interval holds more than the budget of sleeps or
    # reaches the reclaim window.
    points = harness.checkpoints()
    assert [m.kind for m in points] == ["heartbeat", "heartbeat", "finalise"]
    for m, n in zip(points, points[1:], strict=False):
        assert sum(harness.sleeper.calls[m.sleeps : n.sleeps]) <= (
            harness.settings.max_throttle_wait_seconds
        )
        assert n.clock - m.clock < harness.run_settings.stale_after_seconds
    ko_sleeps, aapl_sleeps = harness.interval_sleeps()
    if jitter == 0.0:
        assert ko_sleeps == [60.0] * 5
    assert aapl_sleeps == []

    # (b) All four of KO's data types are recorded as rate limited.
    ko = _rows_of(rows, download.ids["KO"])
    assert set(ko) == set(_DATA_TYPES)
    for data_type, (outcome, reason) in ko.items():
        assert outcome == "failed"
        assert reason is not None
        assert reason.startswith(
            f"[rate_limited] symbol=KO data_type={data_type} request_id=unavailable: "
        )

    # (c) Once KO's budget is spent, each further read sends one request.
    ko_routes = [_route(r.path) for r in harness.interval_requests()[0]]
    assert len([r for r in ko_routes if r.startswith("/v2/aggs/")]) == 1
    financials = [r for r in ko_routes if r.startswith(_FINANCIALS_PREFIX)]
    assert financials == [_BALANCE_SHEETS]
    assert len([r for r in ko_routes if _corporate_action_route(r, "KO")]) == 1
    if jitter == 0.0:
        assert ko_routes.count("/v3/reference/tickers/KO") == 6

    # (d) Each stock's budget starts at its heartbeat, before any of its
    # requests, so AAPL's starts fresh.
    assert [m.kind for m in harness.marks] == [
        "heartbeat",
        "budget",
        "heartbeat",
        "budget",
        "finalise",
    ]
    for previous, current in zip(harness.marks, harness.marks[1:], strict=False):
        if current.kind == "budget":
            assert previous.kind == "heartbeat"
            assert current.requests == previous.requests
    aapl = _rows_of(rows, download.ids["AAPL"])
    for data_type in ("reference", "prices", "corporate_actions"):
        assert aapl[data_type][0] in _SUCCESSFUL, (data_type, aapl[data_type])
    outcome, reason = aapl["fundamentals"]
    assert outcome == "failed"
    assert reason is not None
    assert reason.startswith("[not_entitled] symbol=AAPL data_type=fundamentals ")

    # (e) Finalised partial, never abandoned.
    assert _fetch_run_state(conn, download.run_id) == "partial"


# ---------------------------------------------------------------------------
# TC-COMP-255: everything throttled
# ---------------------------------------------------------------------------


@pytest.mark.postgres
# Implements CAP-003 TC-COMP-255
def test_everything_throttled_finishes_failed_never_abandoned(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E8-S4-4, DAC-E8-10: `KO` alone, always `429`: four `[rate_limited]`
    rows, and the delivered outcome rule finalises the run `failed`."""
    conn = migrated_runner_connection
    download = _run_throttled_download(conn, monkeypatch, jitter=0.0, roster=["KO"])
    harness = download.harness
    rows = _fetch_result_rows(conn, download.run_id)

    assert len(rows) == 4
    ko = _rows_of(rows, download.ids["KO"])
    assert set(ko) == set(_DATA_TYPES)
    for data_type, (outcome, reason) in ko.items():
        assert outcome == "failed"
        assert reason is not None
        assert reason.startswith(
            f"[rate_limited] symbol=KO data_type={data_type} request_id=unavailable: "
        )
    assert [m.kind for m in harness.marks] == ["heartbeat", "budget", "finalise"]
    assert harness.interval_sleeps() == [[60.0] * 5]
    assert _fetch_run_state(conn, download.run_id) == "failed"


# ---------------------------------------------------------------------------
# TC-COMP-258: results recorded before the upgrade
# ---------------------------------------------------------------------------

_SNAPSHOT_SQL = (
    "SELECT xmin::text, run_id, instrument_id, data_type, outcome, reason, completed_at "
    "FROM run_instrument_result WHERE run_id = %s ORDER BY instrument_id, data_type"
)


def _snapshot(conn: psycopg.Connection, run_id: uuid.UUID) -> list[tuple[Any, ...]]:
    with conn.cursor() as cur:
        cur.execute(_SNAPSHOT_SQL, (run_id,))
        return list(cur.fetchall())


@pytest.mark.postgres
@pytest.mark.parametrize("scenario", ["plan_refusal", "throttled"])
# Implements CAP-003 TC-COMP-258
def test_results_recorded_before_the_upgrade_are_never_updated(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
    scenario: str,
) -> None:
    """DAC-E8-S4-7, DAC-E8-19: an earlier run's `[unavailable]` rows, the 0.2.0
    text, are untouched by a later download. `xmin` changes on any `UPDATE`,
    a no-op one included."""
    conn = migrated_runner_connection
    earlier_run = uuid.uuid4()
    before: list[tuple[Any, ...]] = []

    def seed_earlier_run(connection: psycopg.Connection, ids: dict[str, int]) -> None:
        with connection.cursor() as cur:
            cur.execute(
                "INSERT INTO acquisition_run "
                "(run_id, state, history_depth_years, requested_at, started_at, ended_at, "
                "claimed_by, heartbeat_at) "
                "VALUES (%s, 'failed', 5, now(), now(), now(), NULL, NULL)",
                (earlier_run,),
            )
            for symbol in ("KO", "AAPL"):
                cur.execute(
                    "INSERT INTO run_instrument_result "
                    "(run_id, instrument_id, data_type, outcome, reason) "
                    "VALUES (%s, %s, 'fundamentals', 'failed', %s)",
                    (earlier_run, ids[symbol], _PRE_UPGRADE_REASON.format(symbol=symbol)),
                )
        connection.commit()
        before.extend(_snapshot(connection, earlier_run))

    if scenario == "plan_refusal":
        download = _run_plan_refusal_download(conn, monkeypatch, prepare=seed_earlier_run)
    else:
        download = _run_throttled_download(
            conn, monkeypatch, jitter=0.0, roster=["KO", "AAPL"], prepare=seed_earlier_run
        )

    after = _snapshot(conn, earlier_run)
    assert len(before) == 2
    assert after == before
    reasons = {row[2]: row[5] for row in after}
    assert reasons == {
        download.ids["KO"]: (
            "[unavailable] symbol=KO data_type=fundamentals request_id=unavailable: "
            "The provider failed 3 consecutive attempts."
        ),
        download.ids["AAPL"]: (
            "[unavailable] symbol=AAPL data_type=fundamentals request_id=unavailable: "
            "The provider failed 3 consecutive attempts."
        ),
    }
    assert _fetch_run_state(conn, earlier_run) == "failed"


# ---------------------------------------------------------------------------
# TC-COMP-256 edge case: a rejected credential after a refusal
# ---------------------------------------------------------------------------


@pytest.mark.postgres
@pytest.mark.parametrize(
    "refusal",
    [
        pytest.param(ProviderNotEntitled("x"), id="not-entitled"),
        pytest.param(ProviderRateLimited("x"), id="rate-limited"),
    ],
)
# Implements CAP-003 TC-COMP-256
def test_a_rejected_credential_after_a_refusal_still_fails_the_download_at_once(
    migrated_runner_connection: psycopg.Connection,
    refusal: Exception,
) -> None:
    """DAC-E8-S4-5, DAC-E8-8 (acquisition-runner section 8 criterion 6): a
    plan refusal or a rate limit on the reference, then a rejected credential
    on the prices, fails the whole download at once."""
    conn = migrated_runner_connection
    first = _insert_instrument(conn, "AAPL")
    second = _insert_instrument(conn, "KO")
    run_id = _insert_claimed_run(conn)
    client = _stub_client()
    client.fetch_reference.side_effect = refusal
    client.fetch_daily_bars.side_effect = CredentialRejected(
        "api key TEST-ONLY-secret-value was rejected",
        provider_request_id="req-cr-001",
    )

    AcquisitionRunner(connection=conn, client=client, today=_TODAY).execute_claimed(
        run_id=run_id, depth_years=5, instrument_ids=[first, second]
    )

    assert _fetch_run_state(conn, run_id) == "failed"
    with conn.cursor() as cur:
        cur.execute("SELECT failure_reason FROM acquisition_run WHERE run_id = %s", (run_id,))
        row = cur.fetchone()
    assert row is not None
    assert str(row[0]).startswith("[credential_rejected] symbol=AAPL data_type=prices ")
    assert _fetch_result_rows(conn, run_id) == []
    assert client.fetch_reference.call_count == 1
    assert client.start_instrument.call_count == 1


# ---------------------------------------------------------------------------
# DAC-E8-10: the next stock's budget starts fresh, behaviourally
# ---------------------------------------------------------------------------


@pytest.mark.postgres
def test_each_throttled_stock_waits_its_own_full_budget(
    migrated_runner_connection: psycopg.Connection,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """DAC-E8-7, DAC-E8-10, DAC-E8-S4-3: two stocks, both always `429`. The
    second waits a full budget of its own, so its budget started fresh."""
    conn = migrated_runner_connection
    download = _run_throttled_download(
        conn,
        monkeypatch,
        jitter=0.0,
        roster=["KO", "PEP"],
        throttled=frozenset({"KO", "PEP"}),
    )
    harness = download.harness
    rows = _fetch_result_rows(conn, download.run_id)

    assert [m.kind for m in harness.checkpoints()] == ["heartbeat", "heartbeat", "finalise"]
    assert harness.interval_sleeps() == [[60.0] * 5, [60.0] * 5]
    routes = [_route(r.path) for r in harness.transport.requests]
    assert routes.count("/v3/reference/tickers/KO") == 6
    assert routes.count("/v3/reference/tickers/PEP") == 6
    assert len(rows) == 8
    assert all(str(r["reason"]).startswith("[rate_limited] ") for r in rows)
    assert _fetch_run_state(conn, download.run_id) == "failed"
