"""IR-002 regression: `get_health` must actually consult `probe_database_reachable`.

`test_api_health.py::test_health_unreachable_database` (an integration test
against a real socket) survives a mutation that hardcodes
`reachable = True`, because `health.py`'s secondary guard around the
version query produces a byte-identical `unreachable` response when that
query then fails. This test isolates `get_health` from the HTTP layer and
asserts the reachability probe itself is what decides the response --
by making the version-query path raise if it is ever reached, so the
mutation this finding names (bypassing `probe_database_reachable`) fails
here even though it does not fail the integration test.
"""

from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from starlette.requests import Request

from factorflow.api.routes import health


class _NeverReachedConnection:
    def cursor(self) -> "_NeverReachedConnection":
        raise AssertionError(
            "the version query must not run when the reachability probe "
            "reports unreachable -- this connection should never be entered"
        )

    def __enter__(self) -> "_NeverReachedConnection":
        return self

    def __exit__(self, *exc_info: object) -> None:
        return None


class _PoolThatWouldExplodeIfUsedForTheVersionQuery:
    def connection(self, timeout: float | None = None) -> "_NeverReachedConnection":
        return _NeverReachedConnection()


def _fake_request(pool: object) -> Request:
    app = FastAPI()
    app.state.db_pool = pool
    scope = {"type": "http", "app": app, "method": "GET", "path": "/api/health", "headers": []}
    return Request(scope)


def test_get_health_reports_unreachable_without_touching_the_version_query(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """When `probe_database_reachable` reports `False`, `get_health` must
    report `unreachable` from that answer alone -- never by falling into
    the version-query path and catching a second failure there. A mutation
    that bypasses the reachability probe (e.g. hardcoding it to `True`)
    would route through `_NeverReachedConnection` and fail this test's
    `AssertionError`, which `test_api_health.py`'s HTTP-level test cannot
    distinguish from the correct path.
    """
    monkeypatch.setattr(health, "probe_database_reachable", Mock(return_value=False))
    pool = _PoolThatWouldExplodeIfUsedForTheVersionQuery()

    response = health.get_health(_fake_request(pool))

    assert response.database == "unreachable"
    assert response.schema_version is None
    health.probe_database_reachable.assert_called_once_with(pool)  # type: ignore[attr-defined]
