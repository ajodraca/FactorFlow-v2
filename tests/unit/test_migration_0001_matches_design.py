"""Guards against drift between the shipped migration file and the design doc.

component-design-market-data-store.md section 2.3 states that a file that has
been applied must never be edited — a correction is a new file. This test
catches silent drift between what the design specifies and what ships, by
reading the design's own SQL block rather than a copy of it.
"""

from pathlib import Path

from tests.unit.design_sql import sql_block_under_heading

REPO_ROOT = Path(__file__).resolve().parents[2]
MIGRATION_0001_PATH = REPO_ROOT / "migrations" / "0001_extensions_owner_state.sql"


def test_migration_0001_matches_design_verbatim() -> None:
    expected = sql_block_under_heading("### 2.3")
    assert MIGRATION_0001_PATH.read_text() == expected


def test_design_block_is_actually_read() -> None:
    """The comparison above is only meaningful if the block was really found."""
    expected = sql_block_under_heading("### 2.3")
    assert "CREATE TABLE instrument" in expected
    assert "CREATE TABLE owner_setting" in expected
