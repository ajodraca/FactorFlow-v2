"""Socket-free transport collaborators for Massive client tests (CAP-001-E3-S6).

The redirect, proxy, URL-recording and base-honoured tests share this one
harness (component design `component-design-massive-client.md` section 7,
DAC-E3-S6-12). Only `urllib3.connectionpool.HTTPConnectionPool._make_request`
is replaced; everything above it -- the SDK, `PoolManager.urlopen` and its
redirect and retry logic -- runs unpatched, so the tests exercise the real
request path without opening a socket.
"""

from __future__ import annotations

import json
import secrets
import socket
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import pytest
import urllib3
import urllib3.connectionpool

_REDIRECT_TARGET = "https://198.51.100.7/"


def generated_test_key() -> str:
    """A per-test provider key, so no fixed key literal is committed
    (`component-design-runtime-config.md` section 2.2c item 3)."""
    return "TEST-ONLY-" + secrets.token_hex(16)


@dataclass
class SocketGuard:
    """Records whether a patched socket entry point was ever called."""

    fired: list[str] = field(default_factory=list)


def forbid_sockets(monkeypatch: pytest.MonkeyPatch) -> SocketGuard:
    """Patch `socket.create_connection` and `socket.getaddrinfo` so any
    attempt to reach the network fails the test, and record that it did."""
    guard = SocketGuard()

    def _refuse(name: str) -> Callable[..., Any]:
        def refuse(*_args: Any, **_kwargs: Any) -> Any:
            guard.fired.append(name)
            pytest.fail(f"socket.{name} was called; the test must open no socket")

        return refuse

    monkeypatch.setattr(socket, "create_connection", _refuse("create_connection"))
    monkeypatch.setattr(socket, "getaddrinfo", _refuse("getaddrinfo"))
    return guard


@dataclass
class RecordedRequest:
    """One request that reached `_make_request`."""

    pool: Any
    scheme: str
    host: str
    port: int | None
    path: str
    authorization: str | None


@dataclass
class FakeAnswer:
    """What the fake transport answers for one request."""

    status: int
    body: bytes = b""
    headers: dict[str, str] = field(default_factory=dict)


def redirect_answer(_request: RecordedRequest) -> FakeAnswer:
    """The default responder: `302` to `https://198.51.100.7/`, empty body
    (DAC-E3-S6-12)."""
    return FakeAnswer(status=302, headers={"Location": _REDIRECT_TARGET})


def json_answer(payload: Any, status: int = 200) -> FakeAnswer:
    """A JSON answer, for responders that serve a page instead of a redirect."""
    return FakeAnswer(
        status=status,
        body=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )


class RecordingMakeRequest:
    """A replacement for `HTTPConnectionPool._make_request` (urllib3 2.7.0
    signature) that records each request and answers through `responder`.

    The returned `HTTPResponse` carries the `retries` value the fake was
    passed, as urllib3's own `_make_request` does: `PoolManager.urlopen`
    reads the redirect budget from `response.retries`, so a fake dropping it
    would let urllib3 fall back to a default budget and follow the redirect
    (specification review v7 FINDING-19 (c)).
    """

    def __init__(self, responder: Callable[[RecordedRequest], FakeAnswer] = redirect_answer):
        self.responder = responder
        self.requests: list[RecordedRequest] = []
        self.retries_passed: list[Any] = []
        self.retries_returned: list[Any] = []

    def install(self, monkeypatch: pytest.MonkeyPatch) -> RecordingMakeRequest:
        fake = self

        def _make_request(
            pool: urllib3.connectionpool.HTTPConnectionPool,
            conn: Any,
            method: str,
            url: str,
            body: Any = None,
            headers: Any = None,
            retries: Any = None,
            timeout: Any = None,
            chunked: bool = False,
            response_conn: Any = None,
            preload_content: bool = True,
            decode_content: bool = True,
            enforce_content_length: bool = True,
        ) -> urllib3.HTTPResponse:
            return fake._answer(pool, method, url, headers, retries, decode_content)

        monkeypatch.setattr(
            urllib3.connectionpool.HTTPConnectionPool, "_make_request", _make_request
        )
        return self

    def _answer(
        self,
        pool: urllib3.connectionpool.HTTPConnectionPool,
        method: str,
        url: str,
        headers: Any,
        retries: Any,
        decode_content: bool,
    ) -> urllib3.HTTPResponse:
        recorded = RecordedRequest(
            pool=pool,
            scheme=pool.scheme,
            host=pool.host,
            port=pool.port,
            path=url,
            authorization=(dict(headers or {})).get("Authorization"),
        )
        self.requests.append(recorded)
        self.retries_passed.append(retries)
        answer = self.responder(recorded)
        response = urllib3.HTTPResponse(
            body=answer.body,
            headers=answer.headers,
            status=answer.status,
            preload_content=True,
            decode_content=decode_content,
            retries=retries,
            request_method=method,
            request_url=url,
        )
        self.retries_returned.append(response.retries)
        return response
