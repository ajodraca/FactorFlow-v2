"""The migrator loads its database URL through `DatabaseSettings`
(CAP-001-E1-S8).

Component design: `component-design-schema-migrator.md` section 2.5,
*Database URL confinement (H7)*. `migrate_main` is the first client on the
application container's database channel, so it must refuse a plaintext URL
to another address before it ever connects, exiting 1 with a message that
names the variable and never its value (AC-13, AC-16).
"""

import logging
from pathlib import Path
from typing import Any

import pytest

from factorflow.db import migrate_main

_VAR = "FACTORFLOW_DATABASE_URL"
_PASSWORD = "s3cretpw"


@pytest.fixture(autouse=True)
def _no_connection(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("PGHOST", "PGHOSTADDR", "PGSERVICE", "PGSERVICEFILE"):
        monkeypatch.delenv(name, raising=False)

    def refuse_to_connect(*_args: Any, **_kwargs: Any) -> None:
        pytest.fail("psycopg.connect was called")

    monkeypatch.setattr(migrate_main.psycopg, "connect", refuse_to_connect)


def _error_messages(caplog: pytest.LogCaptureFixture) -> list[str]:
    return [
        record.getMessage()
        for record in caplog.records
        if record.name == "factorflow.db.migrator" and record.levelno == logging.ERROR
    ]


# Implements TC-COMP-416
@pytest.mark.parametrize(
    ("url", "environment"),
    [
        (f"postgresql://u:{_PASSWORD}@10.0.0.5/d", {}),
        (f"postgresql://u:{_PASSWORD}@db.example.com/d", {}),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d?host=10.0.0.5", {}),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d?hostaddr=10.0.0.5", {}),
        (f"postgresql://u:{_PASSWORD}@127.0.0.1/d", {"PGHOST": "10.0.0.5"}),
    ],
)
def test_refused_url_exits_1_without_connecting(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
    url: str,
    environment: dict[str, str],
) -> None:
    monkeypatch.setenv(_VAR, url)
    for name, value in environment.items():
        monkeypatch.setenv(name, value)

    with caplog.at_level(logging.ERROR, logger="factorflow.db.migrator"):
        assert migrate_main.main() == 1

    messages = _error_messages(caplog)
    assert messages, "no error record was logged"
    for message in messages:
        assert _VAR in message
        assert url not in message
        assert _PASSWORD not in message


# Implements TC-COMP-417
def test_unset_url_exits_1_without_connecting(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    monkeypatch.delenv(_VAR, raising=False)

    with caplog.at_level(logging.ERROR, logger="factorflow.db.migrator"):
        assert migrate_main.main() == 1

    messages = _error_messages(caplog)
    assert messages and all(_VAR in message for message in messages)


# Implements TC-COMP-418
def test_loopback_url_reaches_run_migrations(monkeypatch: pytest.MonkeyPatch) -> None:
    url = f"postgresql://u:{_PASSWORD}@127.0.0.1:5432/d"
    monkeypatch.setenv(_VAR, url)
    calls: list[tuple[str, Path]] = []

    def recording_run_migrations(database_url: str, migrations_dir: Path) -> tuple[int, str]:
        calls.append((database_url, migrations_dir))
        return 0, "schema current at version 4"

    monkeypatch.setattr(migrate_main, "run_migrations", recording_run_migrations)

    assert migrate_main.main() == 0
    assert calls == [(url, migrate_main.MIGRATIONS_DIR)]
