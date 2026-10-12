"""A controlled stand-in for the Massive REST API, for the e2e acquisition stack.

Started by `scripts/run-e2e-server.sh` (`uv run python
tests/e2e/support/massive_stub.py <port>`) and bound to 127.0.0.1 only, so no
e2e request ever reaches the live provider (CAP-001-e2e-tests-automation-tasks
T001; DEC-0025). It serves every endpoint `src/factorflow/ingestion/massive/
client.py` calls, with bodies shaped from `tests/fixtures/massive/*.json` and
no `next_url`. Supports TC-E2E-001, 002, 004-007, 009, 010 and TC-INT-027.

Controlled behaviour, driven by the specs through `tests/e2e/support/
acquisition.ts`:

- a symbol starting `UNK` answers 404 with `error_not_found.json`;
- `POST /__stub/mode {"mode": "ok" | "reject-credential" | "unavailable"}`:
  in `reject-credential` every provider path answers 401 with
  `error_credential_unknown_key.json`; in `unavailable` every provider path
  answers 503 with an envelope naming no known error, which the client
  classifies as `ProviderUnavailable` (DEC-0048);
- `POST /__stub/hold {"symbol": S}` makes S's requests block until
  `POST /__stub/release {"symbol": S}`;
- `GET /__stub/requests` answers `{"requests": [{"method", "path"}, ...]}`,
  every provider request received since the last reset, in arrival order,
  path only with no query string (CAP-001-integration-tests-automation-tasks
  T026);
- `POST /__stub/reset` restores mode `ok`, releases every hold and clears
  the request log.

A test fixture, not a product contract. Not collected by pytest (no `test_`
prefix) or Playwright (not `*.spec.ts`).
"""

from __future__ import annotations

import copy
import json
import re
import sys
import threading
from datetime import UTC, date, datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlsplit

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures" / "massive"

# How long a held request waits before answering anyway, so a spec that
# forgets to release can never wedge the runner past the suite.
_HOLD_LIMIT_SECONDS = 120.0


def _fixture(name: str) -> dict[str, Any]:
    loaded: dict[str, Any] = json.loads((FIXTURES / name).read_text(encoding="utf-8"))
    return loaded


REFERENCE = _fixture("reference_active.json")
BAR = _fixture("bar_regular.json")
FINANCIAL = _fixture("financial_annual.json")
SPLIT = _fixture("action_split.json")
DIVIDEND = _fixture("action_dividend.json")
IPO = _fixture("action_ipo.json")
TICKER_CHANGE = _fixture("action_ticker_change.json")
NOT_FOUND = _fixture("error_not_found.json")
CREDENTIAL_REJECTED = _fixture("error_credential_unknown_key.json")
UNAVAILABLE = {
    "status": "ERROR",
    "request_id": "req_e2e_unavailable",
    "error": "Service temporarily unavailable.",
}

_TICKER_PATH = re.compile(r"^/v3/reference/tickers/(?P<symbol>[^/]+)$")
_AGGS_PATH = re.compile(
    r"^/v2/aggs/ticker/(?P<symbol>[^/]+)/range/1/day/(?P<start>[^/]+)/(?P<end>[^/]+)$"
)
_EVENTS_PATH = re.compile(r"^/vX/reference/tickers/(?P<symbol>[^/]+)/events$")
_FINANCIAL_PATHS = {
    "/stocks/financials/v1/balance-sheets": "balance_sheet",
    "/stocks/financials/v1/income-statements": "income_statement",
    "/stocks/financials/v1/cash-flow-statements": "cash_flow_statement",
}
_ACTION_PATHS = {
    "/stocks/v1/splits": (SPLIT, "execution_date"),
    "/stocks/v1/dividends": (DIVIDEND, "ex_dividend_date"),
    "/vX/reference/ipos": (IPO, "listing_date"),
}


class StubState:
    """The stub's controlled behaviour, shared by every request thread."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.mode = "ok"
        self._holds: dict[str, threading.Event] = {}
        self._requests: list[dict[str, str]] = []

    def set_mode(self, mode: str) -> None:
        if mode not in ("ok", "reject-credential", "unavailable"):
            raise ValueError(f"unknown mode {mode!r}")
        with self._lock:
            self.mode = mode

    def hold(self, symbol: str) -> None:
        with self._lock:
            self._holds.setdefault(symbol, threading.Event())

    def release(self, symbol: str) -> None:
        with self._lock:
            event = self._holds.pop(symbol, None)
        if event is not None:
            event.set()

    def record(self, method: str, path: str) -> None:
        with self._lock:
            self._requests.append({"method": method, "path": path})

    def requests(self) -> list[dict[str, str]]:
        with self._lock:
            return [dict(entry) for entry in self._requests]

    def reset(self) -> None:
        with self._lock:
            self.mode = "ok"
            held = list(self._holds.values())
            self._holds.clear()
            self._requests.clear()
        for event in held:
            event.set()

    def wait_if_held(self, symbol: str) -> None:
        with self._lock:
            event = self._holds.get(symbol)
        if event is not None:
            event.wait(_HOLD_LIMIT_SECONDS)


STATE = StubState()


def _envelope(results: Any) -> dict[str, Any]:
    return {"status": "OK", "request_id": "req_e2e_stub", "results": results}


def _weekdays(start: date, end: date) -> list[date]:
    days = []
    current = start
    while current <= end:
        if current.weekday() < 5:
            days.append(current)
        current += timedelta(days=1)
    return days


def _bars(start: date, end: date) -> list[dict[str, Any]]:
    bars = []
    for day in _weekdays(start, end):
        bar = copy.deepcopy(BAR)
        bar["t"] = int(datetime(day.year, day.month, day.day, tzinfo=UTC).timestamp() * 1000)
        bars.append(bar)
    return bars


def _first(query: dict[str, list[str]], *names: str) -> str | None:
    for name in names:
        values = query.get(name)
        if values:
            return values[0]
    return None


def _symbol_of(path: str, query: dict[str, list[str]]) -> str | None:
    for pattern in (_TICKER_PATH, _AGGS_PATH, _EVENTS_PATH):
        match = pattern.match(path)
        if match:
            return match.group("symbol")
    return _first(query, "ticker", "tickers")


def provider_response(path: str, query: dict[str, list[str]]) -> tuple[int, dict[str, Any]]:
    """The status and body a provider path answers with, under the current mode."""
    symbol = _symbol_of(path, query)
    if STATE.mode == "reject-credential":
        return 401, CREDENTIAL_REJECTED
    if STATE.mode == "unavailable":
        return 503, UNAVAILABLE
    if symbol is not None and symbol.startswith("UNK"):
        return 404, NOT_FOUND

    match = _TICKER_PATH.match(path)
    if match:
        return 200, _envelope({**REFERENCE, "ticker": symbol})

    match = _AGGS_PATH.match(path)
    if match:
        bars = _bars(date.fromisoformat(match["start"]), date.fromisoformat(match["end"]))
        return 200, {**_envelope(bars), "ticker": symbol, "resultsCount": len(bars)}

    if _EVENTS_PATH.match(path):
        event = copy.deepcopy(TICKER_CHANGE)
        event["date"] = date.today().isoformat()
        event["ticker_change"] = {"ticker": symbol, "old_ticker": symbol}
        return 200, _envelope({"name": REFERENCE["name"], "events": [event]})

    if path in _FINANCIAL_PATHS:
        period_end = _first(query, "period_end.gte", "period_end_gte") or FINANCIAL["period_end"]
        row = {
            **FINANCIAL,
            "tickers": [symbol],
            "statement_type": _FINANCIAL_PATHS[path],
            "period_end": period_end,
            "filing_date": period_end,
            "fiscal_year": date.fromisoformat(period_end).year,
        }
        return 200, _envelope([row])

    if path in _ACTION_PATHS:
        body, date_field = _ACTION_PATHS[path]
        on = _first(query, f"{date_field}.gte", f"{date_field}_gte") or body[date_field]
        return 200, _envelope([{**body, "ticker": symbol, date_field: on}])

    return 404, NOT_FOUND


class StubHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 -- BaseHTTPRequestHandler's naming
        parts = urlsplit(self.path)
        if parts.path == "/__stub/requests":
            self._send(200, {"requests": STATE.requests()})
            return
        STATE.record("GET", parts.path)
        query = parse_qs(parts.query)
        symbol = _symbol_of(parts.path, query)
        if symbol is not None:
            STATE.wait_if_held(symbol)
        status, body = provider_response(parts.path, query)
        self._send(status, body)

    def do_POST(self) -> None:  # noqa: N802 -- BaseHTTPRequestHandler's naming
        length = int(self.headers.get("Content-Length") or 0)
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
            if self.path == "/__stub/mode":
                STATE.set_mode(payload["mode"])
            elif self.path == "/__stub/hold":
                STATE.hold(payload["symbol"])
            elif self.path == "/__stub/release":
                STATE.release(payload["symbol"])
            elif self.path == "/__stub/reset":
                STATE.reset()
            else:
                self._send(404, {"error": f"unknown control {self.path}"})
                return
        except (KeyError, TypeError, ValueError) as exc:
            self._send(400, {"error": str(exc)})
            return
        self._send(200, {"mode": STATE.mode})

    def _send(self, status: int, body: dict[str, Any]) -> None:
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 -- base signature
        sys.stderr.write(f"[massive-stub] {format % args}\n")


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: massive_stub.py <port>", file=sys.stderr)
        return 2
    server = ThreadingHTTPServer(("127.0.0.1", int(argv[1])), StubHandler)
    server.daemon_threads = True
    try:
        server.serve_forever()
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
