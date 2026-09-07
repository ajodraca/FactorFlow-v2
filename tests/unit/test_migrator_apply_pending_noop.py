"""`apply_pending` returns an empty list, not `None`, when nothing is pending.

Exercised here without a database: an empty `files` list can never contain
anything to apply, so this behavior is verifiable without a connection to a
real server. `unittest.mock` stands in for a `psycopg.Connection` because a
migrator given zero files never has to open a cursor or transaction.
"""

from unittest.mock import MagicMock

from factorflow.db.migrator import apply_pending


def test_apply_pending_returns_empty_list_for_no_files() -> None:
    connection = MagicMock()

    result = apply_pending(connection, [])

    assert result == []
    assert result is not None
