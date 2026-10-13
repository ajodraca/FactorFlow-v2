"""Unit tests for `discover()` (component design section 2.4 interface).

`discover` reads a directory of migration files and returns them ordered by
version, without touching a database. It raises `MigrationError` on a
malformed filename or a repeated version number, per the interface docstring.
"""

from pathlib import Path

import pytest

from factorflow.db.migrate_main import MIGRATIONS_DIR
from factorflow.db.migrator import MigrationError, discover

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_MIGRATIONS_DIR = MIGRATIONS_DIR
FIXTURES_OK_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"


def test_discover_returns_files_ordered_by_version() -> None:
    files = discover(FIXTURES_OK_DIR)

    assert [f.version for f in files] == [1, 2]
    assert [f.name for f in files] == ["extensions_owner_state", "test_only"]


def test_discover_populates_checksum_and_sql() -> None:
    files = discover(FIXTURES_OK_DIR)
    migration_0001 = next(f for f in files if f.version == 1)

    expected_text = (FIXTURES_OK_DIR / "0001_extensions_owner_state.sql").read_text()
    assert migration_0001.sql == expected_text

    import hashlib

    assert migration_0001.checksum == hashlib.sha256(expected_text.encode("utf-8")).hexdigest()


def test_discover_against_real_migrations_directory() -> None:
    """The real migrations/ directory must itself be well-formed."""
    files = discover(REAL_MIGRATIONS_DIR)
    assert len(files) >= 1
    assert files[0].version == 1


def test_discover_raises_on_malformed_filename(tmp_path: Path) -> None:
    (tmp_path / "not_a_migration.sql").write_text("SELECT 1;\n")

    with pytest.raises(MigrationError):
        discover(tmp_path)


def test_discover_raises_on_repeated_version(tmp_path: Path) -> None:
    (tmp_path / "0001_first.sql").write_text("SELECT 1;\n")
    (tmp_path / "0001_duplicate.sql").write_text("SELECT 2;\n")

    with pytest.raises(MigrationError):
        discover(tmp_path)


def test_discover_ignores_non_sql_files(tmp_path: Path) -> None:
    (tmp_path / "0001_first.sql").write_text("SELECT 1;\n")
    (tmp_path / "README.md").write_text("not a migration\n")

    files = discover(tmp_path)
    assert [f.version for f in files] == [1]


def test_discover_raises_on_missing_directory(tmp_path: Path) -> None:
    """A build that cannot find its migrations must not report zero of them (EXP-20261012-1)."""
    missing = tmp_path / "absent"

    with pytest.raises(MigrationError, match=str(missing)):
        discover(missing)


# SHA-256 of each migration file as recorded before CAP-001-E1-S8 moved the
# files into the package; the move must change no recorded checksum.
_CHECKSUMS_BEFORE_MOVE = {
    1: "36362b5787db3664ee8b055dc1baae63f59c8b9dae2f2975147542ffe38cd6bb",
    2: "5ebbcc642a83cbe471b7f2fd5ab39c6956849cb6294d91a876dabdeae5f9cf06",
    3: "90fa247a25163a27fc9ca2ba0c69de8775dd3597fc64531e811d9d829183e405",
    4: "d799992f3732ac85052d64f5297bca813cb298a0d962f7a6dd1718f17f73fa84",
}


# Implements TC-COMP-419
def test_migrations_dir_resolves_inside_the_package_with_unchanged_checksums() -> None:
    """DAC-E1-S8-6, schema-migrator section 2.1: `MIGRATIONS_DIR` is the
    `migrations` directory beside `migrate_main.py`, and the moved files keep
    the checksums an existing store recorded."""
    from factorflow.db import migrate_main

    assert (
        Path(migrate_main.__file__).resolve().parent / "migrations" == migrate_main.MIGRATIONS_DIR
    )

    files = discover(migrate_main.MIGRATIONS_DIR)
    assert {f.version: f.checksum for f in files} == _CHECKSUMS_BEFORE_MOVE
