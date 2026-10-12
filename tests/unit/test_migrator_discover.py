"""Unit tests for `discover()` (component design section 2.4 interface).

`discover` reads a directory of migration files and returns them ordered by
version, without touching a database. It raises `MigrationError` on a
malformed filename or a repeated version number, per the interface docstring.
"""

from pathlib import Path

import pytest

from factorflow.db.migrator import MigrationError, discover

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_MIGRATIONS_DIR = REPO_ROOT / "migrations"
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
