"""Container entrypoint: connects, migrates, and exits before uvicorn binds.

Runs as `python -m factorflow.db.migrate_main`, chained with `&&` before the
uvicorn exec in the application container's entrypoint (component design
section 2.1), so a non-zero exit here means the API never binds its socket —
the whole of AC-16.

The database URL is loaded through `runtime-config`'s `DatabaseSettings`
(component design section 2.5, CAP-001-E1-S8), which refuses a plaintext URL
to any address off the host before this process connects: the migrator is
the first client on the application container's database channel (CONST-SEC
1.3 SEC-ENC-001 host-local loopback exception, condition H7).

Every exit path here logs through the structured logger at `error` level
(SA-LOG-001, DAC-E1-S2-6) — never `print` — carrying the migration version as
a field. A connection failure's message is built from known-safe fields
(host, database) rather than the raw driver exception, which can carry the
full connection string, password included (AC-13, DAC-E1-S2-7).
"""

import logging
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

import psycopg

from factorflow.config.settings import ConfigurationError, DatabaseSettings
from factorflow.db.migrator import MigrationError, apply_pending, discover

_LOGGER = logging.getLogger("factorflow.db.migrator")

# The migrations are package data of `factorflow.db` (schema-migrator section
# 2.1), so a source checkout and the installed image resolve the same files.
MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"


class ConnectionFailedError(MigrationError):
    """Database unreachable or credentials rejected. Exit code 1."""


class StoreAheadOfBuildError(MigrationError):
    """Store holds a version this build does not carry. Exit code 2."""


class ChecksumMismatchError(MigrationError):
    """A recorded migration's checksum does not match the file. Exit code 3."""


class MigrationFailedError(MigrationError):
    """A migration failed to apply. Exit code 4."""


_EXIT_CODES: dict[type[Exception] | None, int] = {
    None: 0,
    ConnectionFailedError: 1,
    StoreAheadOfBuildError: 2,
    ChecksumMismatchError: 3,
    MigrationFailedError: 4,
}


def exit_code_for_outcome(outcome: Exception | None) -> int:
    """Map a migrator outcome to its exit code per component design section 2.5."""
    if outcome is None:
        return 0
    for error_type, code in _EXIT_CODES.items():
        if error_type is not None and isinstance(outcome, error_type):
            return code
    # A MigrationError raised by migrator.py itself (store-ahead, checksum
    # mismatch, or migration failure) that was not reclassified by
    # run_migrations should never reach here; this is a defensive fallback,
    # not a normal path.
    return 4


def _connection_failure_message(host: str, database: str, error: psycopg.OperationalError) -> str:
    """Build a connection-failure message from known-safe fields only.

    Never formats `error` directly: a `psycopg.OperationalError` can embed the
    full connection string it tried, password included.
    """
    return f"database unreachable: host={host} database={database}"


def _schema_current_message(version: int) -> str:
    return f"schema current at version {version}"


def _applied_message(versions: list[int]) -> str:
    return "applied migrations: " + ", ".join(str(v) for v in versions)


def _log_failure(message: str, version: int | None) -> None:
    _LOGGER.error(message, extra={"version": version})


def run_migrations(database_url: str, migrations_dir: Path) -> tuple[int, str]:
    """Run the full migrate decision flow. Never raises; always returns (exit_code, message).

    Split out from `main()` so tests can drive it directly without a process
    boundary.
    """
    parsed = urlsplit(database_url)
    host = parsed.hostname or "unknown"
    database = (parsed.path or "").lstrip("/") or "unknown"

    try:
        files = discover(migrations_dir)
    except MigrationError as exc:
        message = str(exc)
        _log_failure(message, version=None)
        return 4, message

    try:
        connection = psycopg.connect(database_url)
    except psycopg.OperationalError as exc:
        message = _connection_failure_message(host=host, database=database, error=exc)
        _log_failure(message, version=None)
        return 1, message

    try:
        try:
            applied = apply_pending(connection, files)
        except MigrationError as exc:
            reclassified = _reclassify(exc)
            message = str(reclassified)
            version = _version_from_message(message)
            _log_failure(message, version=version)
            return exit_code_for_outcome(reclassified), message
    finally:
        connection.close()

    if applied:
        message = _applied_message(applied)
    else:
        highest = max((f.version for f in files), default=0)
        message = _schema_current_message(version=highest)

    return 0, message


def _reclassify(error: MigrationError) -> MigrationError:
    """Map a plain MigrationError from migrator.py to its specific exit-code subtype.

    migrator.py's `apply_pending` raises the base `MigrationError` for all
    three of its failure causes, distinguished only by message text, because
    it has no reason to know about entrypoint exit codes. This narrows that
    back to the specific cause `exit_code_for_outcome` maps to codes 2-4.
    """
    text = str(error)
    if "this build carries up to" in text:
        return StoreAheadOfBuildError(text)
    if "different definition" in text:
        return ChecksumMismatchError(text)
    return MigrationFailedError(text)


def _version_from_message(message: str) -> int | None:
    match = re.search(r"\bmigration (\d+)\b|\bversion (\d+)\b", message)
    if match is None:
        return None
    group = match.group(1) or match.group(2)
    return int(group)


def main() -> int:
    try:
        settings = DatabaseSettings()  # type: ignore[call-arg]
    except ConfigurationError as exc:
        # Names FACTORFLOW_DATABASE_URL and the rule, never the value (AC-13).
        _log_failure(str(exc), version=None)
        return 1

    exit_code, message = run_migrations(settings.url.get_secret_value(), MIGRATIONS_DIR)
    if exit_code == 0:
        _LOGGER.info(message)
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
