"""Filename and file-content well-formedness for migration files.

Component design section 2.2: filenames are `NNNN_snake_case_name.sql`, four
digits, ascending, no gaps. A file is one transaction that the migrator opens,
so the file itself must not contain `BEGIN` or `COMMIT`. Section 3 additionally
prohibits non-transactional-DDL statements such as `CREATE INDEX CONCURRENTLY`
or `VACUUM`, which would break the one-file-one-transaction guarantee.
"""

import re
from pathlib import Path

import pytest

from factorflow.db.migrator import MigrationError, discover

REPO_ROOT = Path(__file__).resolve().parents[2]
REAL_MIGRATIONS_DIR = REPO_ROOT / "migrations"

FILENAME_PATTERN = re.compile(r"^\d{4}_[a-z0-9_]+\.sql$")
NON_TRANSACTIONAL_STATEMENTS = ("CREATE INDEX CONCURRENTLY", "VACUUM")


def _real_migration_files() -> list[Path]:
    return sorted(REAL_MIGRATIONS_DIR.glob("*.sql"))


def test_every_real_migration_filename_matches_pattern() -> None:
    files = _real_migration_files()
    assert files, "expected at least one migration file"
    for path in files:
        assert FILENAME_PATTERN.match(path.name), f"malformed filename: {path.name}"


def test_real_migration_versions_are_contiguous_from_one() -> None:
    files = discover(REAL_MIGRATIONS_DIR)
    versions = [f.version for f in files]
    assert versions == list(range(1, len(versions) + 1))


def test_e5_real_migration_inventory_is_contiguous_through_four() -> None:
    assert [path.name for path in _real_migration_files()] == [
        "0001_extensions_owner_state.sql",
        "0002_observations.sql",
        "0003_coverage.sql",
        "0004_runs.sql",
    ]


def test_no_real_migration_file_contains_begin_or_commit() -> None:
    for path in _real_migration_files():
        text = path.read_text(encoding="utf-8")
        assert "BEGIN" not in text.upper(), f"{path.name} contains BEGIN"
        assert "COMMIT" not in text.upper(), f"{path.name} contains COMMIT"


def test_no_real_migration_file_contains_non_transactional_statement() -> None:
    for path in _real_migration_files():
        text = path.read_text(encoding="utf-8").upper()
        for statement in NON_TRANSACTIONAL_STATEMENTS:
            assert statement not in text, f"{path.name} contains {statement}"


def test_discover_rejects_a_file_containing_begin(tmp_path: Path) -> None:
    (tmp_path / "0001_has_begin.sql").write_text("BEGIN;\nSELECT 1;\n")

    with pytest.raises(MigrationError):
        discover(tmp_path)


def test_discover_rejects_a_file_containing_commit(tmp_path: Path) -> None:
    (tmp_path / "0001_has_commit.sql").write_text("SELECT 1;\nCOMMIT;\n")

    with pytest.raises(MigrationError):
        discover(tmp_path)
