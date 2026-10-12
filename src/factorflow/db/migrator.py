"""Discovery, checksum comparison, and transactional application of migrations.

Per `component-design-schema-migrator.md` sections 2.2-2.4: filenames are
`NNNN_snake_case_name.sql`, four digits, ascending, no gaps. One file is one
transaction that `apply_pending` opens, so a file must not contain `BEGIN` or
`COMMIT`. A file that has been applied is never edited — a correction is a new
file, guarded here by comparing the recorded checksum (SHA-256 of the file
bytes) against the file this build carries before applying anything.

`apply_pending` holds a PostgreSQL advisory lock (component design section
3, "one writer") for its full duration, so two containers starting
concurrently serialise rather than racing to apply the same DDL.
"""

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path

import psycopg

from factorflow.db.applied_migrations import APPLIED_MIGRATIONS_DDL
from factorflow.db.constants import ADVISORY_LOCK_KEY

_FILENAME_PATTERN = re.compile(r"^(\d{4})_([a-z0-9_]+)\.sql$")


class MigrationError(Exception):
    """Raised when the store cannot be brought forward to this build."""


@dataclass(frozen=True)
class MigrationFile:
    version: int
    name: str
    checksum: str
    sql: str


def discover(directory: Path) -> list[MigrationFile]:
    """Return every migration this build carries, ordered by version.

    Raises MigrationError when the directory does not exist (a build that
    cannot find its migrations must not report that it carries none), a
    filename is malformed, a version repeats, or a file contains `BEGIN` or
    `COMMIT` (the migrator opens the transaction; the file must not).
    """
    if not directory.is_dir():
        raise MigrationError(f"migrations directory not found: {directory}")

    files: list[MigrationFile] = []
    seen_versions: dict[int, str] = {}

    for path in sorted(directory.glob("*.sql")):
        match = _FILENAME_PATTERN.match(path.name)
        if match is None:
            raise MigrationError(
                f"malformed migration filename: {path.name!r}, expected NNNN_snake_case_name.sql"
            )

        version = int(match.group(1))
        name = match.group(2)

        if version in seen_versions:
            raise MigrationError(
                f"migration version {version} is defined twice: "
                f"{seen_versions[version]!r} and {path.name!r}"
            )
        seen_versions[version] = path.name

        text = path.read_text(encoding="utf-8")
        upper = text.upper()
        if "BEGIN" in upper or "COMMIT" in upper:
            raise MigrationError(
                f"migration {path.name!r} must not contain BEGIN or COMMIT; "
                "the migrator opens the transaction"
            )

        checksum = hashlib.sha256(text.encode("utf-8")).hexdigest()
        files.append(MigrationFile(version=version, name=name, checksum=checksum, sql=text))

    files.sort(key=lambda f: f.version)
    return files


def apply_pending(connection: psycopg.Connection, files: list[MigrationFile]) -> list[int]:
    """Apply every file not recorded in applied_migrations, in order.

    Returns the versions applied, empty when the schema is already current.
    Raises MigrationError when the store is ahead of this build, when a
    recorded checksum does not match, or when a file fails to apply.
    """
    with connection.cursor() as cur:
        cur.execute("SELECT pg_advisory_lock(%s)", (ADVISORY_LOCK_KEY,))
    connection.commit()

    try:
        with connection.cursor() as cur:
            cur.execute(APPLIED_MIGRATIONS_DDL)
        connection.commit()

        with connection.cursor() as cur:
            cur.execute("SELECT version, checksum FROM applied_migrations ORDER BY version")
            recorded = {version: checksum for version, checksum in cur.fetchall()}

        highest_known = max((f.version for f in files), default=0)
        for recorded_version in recorded:
            if recorded_version > highest_known:
                raise MigrationError(
                    f"store is at version {recorded_version}, this build carries up to "
                    f"{highest_known}; deploy a build that knows version {recorded_version}"
                )

        for file in files:
            if file.version in recorded and recorded[file.version] != file.checksum:
                raise MigrationError(
                    f"migration {file.version} was applied with a different definition "
                    "than this build carries"
                )

        applied: list[int] = []
        for file in files:
            if file.version in recorded:
                continue

            try:
                with connection.cursor() as cur:
                    cur.execute(file.sql)
                    cur.execute(
                        "INSERT INTO applied_migrations (version, name, checksum) "
                        "VALUES (%s, %s, %s)",
                        (file.version, file.name, file.checksum),
                    )
                connection.commit()
            except psycopg.Error as exc:
                connection.rollback()
                raise MigrationError(
                    f"migration {file.version} failed: {exc}; no change was committed"
                ) from exc

            applied.append(file.version)

        return applied
    finally:
        with connection.cursor() as cur:
            cur.execute("SELECT pg_advisory_unlock(%s)", (ADVISORY_LOCK_KEY,))
        connection.commit()
