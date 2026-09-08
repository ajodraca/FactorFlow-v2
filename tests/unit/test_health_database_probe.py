"""The database-reachability probe catches a connection failure (task plan T014).

Asserts `probe_database_reachable` returns `False` rather than propagating
the exception, per DAC-E1-S6-2.
"""

import psycopg

from factorflow.api.routes.health import probe_database_reachable


class _FailingPool:
    def connection(self, timeout: float | None = None) -> "_FailingPool":
        return self

    def __enter__(self) -> "_FailingPool":
        raise psycopg.OperationalError("connection refused")

    def __exit__(self, *exc_info: object) -> None:
        return None


def test_unreachable_database_returns_false_not_an_exception() -> None:
    assert probe_database_reachable(_FailingPool()) is False  # type: ignore[arg-type]
