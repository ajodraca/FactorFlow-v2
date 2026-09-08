"""The schema-version probe, in isolation (task plan T013).

Not exercised through the full HTTP stack -- see `test_api_health.py` for
that. This asserts the probe function's own contract: `None` when
`applied_migrations` is empty, the highest recorded version otherwise.
"""

import pytest

from factorflow.api.routes.health import probe_schema_version


class _FakeCursor:
    def __init__(self, row: tuple[int | None]) -> None:
        self._row = row

    def __enter__(self) -> "_FakeCursor":
        return self

    def __exit__(self, *exc_info: object) -> None:
        return None

    def execute(self, *_args: object, **_kwargs: object) -> None:
        pass

    def fetchone(self) -> tuple[int | None]:
        return self._row


class _FakeConnection:
    def __init__(self, row: tuple[int | None]) -> None:
        self._row = row

    def cursor(self) -> _FakeCursor:
        return _FakeCursor(self._row)


@pytest.mark.parametrize(
    ("row", "expected"),
    [
        ((None,), None),
        ((4,), 4),
    ],
)
def test_probe_schema_version(row: tuple[int | None], expected: int | None) -> None:
    connection = _FakeConnection(row)

    assert probe_schema_version(connection) == expected  # type: ignore[arg-type]
