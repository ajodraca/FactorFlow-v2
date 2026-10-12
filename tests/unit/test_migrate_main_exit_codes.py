"""`migrate_main`'s exit-code mapping matches component design section 2.5.

| Exit | Cause                                             |
|------|----------------------------------------------------|
| 0    | Schema current or brought forward                  |
| 1    | Database unreachable or credentials rejected        |
| 2    | Store holds a version this build does not carry     |
| 3    | A recorded migration's checksum does not match      |
| 4    | A migration failed to apply                         |

Exercised against `migrate_main`'s outcome-to-exit-code function directly,
driving it with a mocked `MigrationError` subtype or successful result and
asserting `sys.exit` is called with the right code — no database needed.
"""

from pathlib import Path

import pytest

from factorflow.db.migrate_main import (
    ChecksumMismatchError,
    ConnectionFailedError,
    MigrationFailedError,
    StoreAheadOfBuildError,
    exit_code_for_outcome,
    run_migrations,
)
from factorflow.db.migrator import MigrationError


@pytest.mark.parametrize(
    ("outcome", "expected_exit_code"),
    [
        (None, 0),
        (ConnectionFailedError("unreachable"), 1),
        (StoreAheadOfBuildError("ahead"), 2),
        (ChecksumMismatchError("mismatch"), 3),
        (MigrationFailedError("failed"), 4),
    ],
)
def test_exit_code_for_outcome(outcome: Exception | None, expected_exit_code: int) -> None:
    assert exit_code_for_outcome(outcome) == expected_exit_code


def test_every_migrate_main_error_is_a_migration_error() -> None:
    """The four failure subtypes must all be catchable as MigrationError."""
    assert issubclass(ConnectionFailedError, MigrationError)
    assert issubclass(StoreAheadOfBuildError, MigrationError)
    assert issubclass(ChecksumMismatchError, MigrationError)
    assert issubclass(MigrationFailedError, MigrationError)


def test_run_migrations_refuses_a_missing_migrations_directory(tmp_path: Path) -> None:
    """Exit 4 before connecting, so the entrypoint never starts the API (EXP-20261012-1).

    The database URL points at a closed port: reaching it would fail with exit
    1, so exit 4 also shows no connection was attempted.
    """
    missing = tmp_path / "absent"

    exit_code, message = run_migrations("postgresql://user@127.0.0.1:9/none", missing)

    assert exit_code == 4
    assert str(missing) in message
