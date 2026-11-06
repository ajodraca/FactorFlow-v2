"""A controlled stand-in for the Massive REST API, for the e2e acquisition stack.

Started by `scripts/run-e2e-server.sh` (`uv run python
tests/e2e/support/massive_stub.py <port>`) and bound to 127.0.0.1 only, so no
e2e request ever reaches the live provider (CAP-001-e2e-tests-automation-tasks
T001; DEC-0025). It serves every endpoint `src/factorflow/ingestion/massive/
client.py` calls, with bodies shaped from `tests/fixtures/massive/*.json` and
no `next_url`. Supports TC-E2E-001, 002, 004-007, 009, 010 and TC-INT-027, and CAP-002's
TC-E2E-001, 002, 009 and 010.

Controlled behaviour, driven by the specs through `tests/e2e/support/
acquisition.ts`:

- a symbol starting `UNK` answers 404 with `error_not_found.json`;
- a symbol starting `NOF` is a stock for which the provider holds no
  fundamentals: every financial-statement path answers 404 with
  `error_not_found.json`, which the run records as `not_found`, the outcome the
  evidence reads as "the provider reports no ..." (CAP-002-e2e-tests-automation-
  tasks T002; AR-001; DEC-0290);
- a symbol starting `GAP` holds statements without diluted earnings per share, a stock
  that lacks one input (growth cannot be scored, value and momentum can) while its
  run still succeeds (TC-E2E-001);
- every symbol's price bars trend at a yearly rate derived from the symbol, so
  stocks differ in momentum;
- `POST /__stub/mode {"mode": "ok" | "reject-credential" | "unavailable" |
  "no-fundamentals"}`: `no-fundamentals` answers every financial-statement
  path with an empty `results` list for every symbol (the partial outcome
  TC-E2E-009 creates, then clears with `{"mode": "ok"}`);
  in `reject-credential` every provider path answers 401 with
  `error_credential_unknown_key.json`; in `unavailable` every provider path
  answers 503 with an envelope naming no known error, which the client
  classifies as `ProviderUnavailable` (DEC-0048);
- every other symbol's financial-statement paths answer the quarterly statements of the
  quarters inside the requested period, newest ending about two months before today,
  carrying the test payload keys of `e2e_line_items.py` (AR-001; DEC-0290), so a build
  scores value and growth when the API process installs the same keys;
- `POST /__stub/withhold {"symbol": S}` makes S's financial-statement paths answer 503
  like `unavailable`, so S's fundamentals fail and the run ends Partial, until
  `POST /__stub/restore {"symbol": S}` (TC-E2E-009's stock BBB);
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

from e2e_line_items import E2E_LINE_ITEMS

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures" / "massive"

# How long a held request waits before answering anyway, so a spec that
# forgets to release can never wedge the runner past the suite.
_HOLD_LIMIT_SECONDS = 120.0


def _fixture(name: str) -> dict[str, Any]:
    loaded: dict[str, Any] = json.loads((FIXTURES / name).read_text(encoding="utf-8"))
    return loaded


REFERENCE = _fixture("reference_active.json")
BAR = _fixture("bar_regular.json")
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
        self._withheld: set[str] = set()
        self._requests: list[dict[str, str]] = []

    def set_mode(self, mode: str) -> None:
        if mode not in ("ok", "reject-credential", "unavailable", "no-fundamentals"):
            raise ValueError(f"unknown mode {mode!r}")
        with self._lock:
            self.mode = mode

    def withhold(self, symbol: str) -> None:
        with self._lock:
            self._withheld.add(symbol)

    def restore(self, symbol: str) -> None:
        with self._lock:
            self._withheld.discard(symbol)

    def is_withheld(self, symbol: str) -> bool:
        with self._lock:
            return symbol in self._withheld

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
            self._withheld.clear()
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


_PRICE_FIELDS = ("o", "h", "l", "c", "vw")
_DRIFT_EPOCH = date(2020, 1, 1).toordinal()


def _drift(symbol: str | None, day: date) -> float:
    """A price multiplier that trends with the symbol's own yearly rate (-0.20 to +0.20).

    The rate depends on the symbol alone and the multiplier on the calendar day alone,
    so every request for a symbol agrees and stocks differ in momentum.
    """
    rate = ((sum(map(ord, symbol or "")) % 41) - 20) / 100
    return max(0.1, 1 + rate * (day.toordinal() - _DRIFT_EPOCH) / 365)


def _bars(start: date, end: date, symbol: str | None = None) -> list[dict[str, Any]]:
    bars = []
    for day in _weekdays(start, end):
        bar = copy.deepcopy(BAR)
        drift = _drift(symbol, day)
        for field in _PRICE_FIELDS:
            bar[field] = bar[field] * drift
        bar["t"] = int(datetime(day.year, day.month, day.day, tzinfo=UTC).timestamp() * 1000)
        bars.append(bar)
    return bars


_QUARTERS_HELD = 16
_REPORTING_LAG_DAYS = 45


def _quarter_ends(today: date) -> list[date]:
    """Calendar quarter ends that closed at least 45 days ago, newest first."""
    ends = []
    for year in range(today.year, today.year - 6, -1):
        for month, day in ((12, 31), (9, 30), (6, 30), (3, 31)):
            end = date(year, month, day)
            if (today - end).days >= _REPORTING_LAG_DAYS:
                ends.append(end)
    return ends[:_QUARTERS_HELD]


def _statements(symbol: str, statement_type: str, start: date, end: date) -> list[dict[str, Any]]:
    """The quarterly statements of one type a symbol holds inside [start, end].

    Every amount is positive and rises toward the newest quarter, scaled by a factor of the
    symbol, so revenue and earnings-per-share growth are positive and stocks differ.
    """
    scale = 1 + (sum(map(ord, symbol)) % 9) / 10
    rows = []
    for k, period_end in enumerate(_quarter_ends(date.today())):
        if not start <= period_end <= end:
            continue
        rise = 1 + 0.03 * (_QUARTERS_HELD - k)
        base = {
            "book_equity": 1000 * scale,
            "shares_outstanding": 100,
            "net_income": 50 * scale * rise,
            "diluted_eps": 2 * scale * rise,
            "revenue": 500 * scale * rise,
            "operating_cash_flow": 80 * scale * rise,
            "capital_expenditure": 30,
        }
        row: dict[str, Any] = {
            "cik": "0000000001",
            "tickers": [symbol],
            "period_end": period_end.isoformat(),
            "filing_date": (period_end + timedelta(days=30)).isoformat(),
            "fiscal_year": period_end.year,
            "fiscal_quarter": (period_end.month - 1) // 3 + 1,
            "timeframe": "quarterly",
            "statement_type": statement_type,
        }
        for name, (kind, key) in E2E_LINE_ITEMS.items():
            if kind == statement_type and not (name == "diluted_eps" and symbol.startswith("GAP")):
                row[key] = round(base[name], 2)
        rows.append(row)
    return rows


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
        bars = _bars(date.fromisoformat(match["start"]), date.fromisoformat(match["end"]), symbol)
        return 200, {**_envelope(bars), "ticker": symbol, "resultsCount": len(bars)}

    if _EVENTS_PATH.match(path):
        event = copy.deepcopy(TICKER_CHANGE)
        event["date"] = date.today().isoformat()
        event["ticker_change"] = {"ticker": symbol, "old_ticker": symbol}
        return 200, _envelope({"name": REFERENCE["name"], "events": [event]})

    if path in _FINANCIAL_PATHS:
        if symbol is None or STATE.mode == "no-fundamentals":
            return 200, _envelope([])
        if symbol.startswith("NOF"):
            return 404, NOT_FOUND
        if STATE.is_withheld(symbol):
            return 503, UNAVAILABLE
        start = _first(query, "period_end.gte", "period_end_gte")
        end = _first(query, "period_end.lte", "period_end_lte")
        return 200, _envelope(
            _statements(
                symbol,
                _FINANCIAL_PATHS[path],
                date.fromisoformat(start) if start else date.min,
                date.fromisoformat(end) if end else date.max,
            )
        )

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
            elif self.path == "/__stub/withhold":
                STATE.withhold(payload["symbol"])
            elif self.path == "/__stub/restore":
                STATE.restore(payload["symbol"])
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
