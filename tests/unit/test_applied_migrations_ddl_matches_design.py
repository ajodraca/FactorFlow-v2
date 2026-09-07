"""Guards against drift between the applied_migrations DDL constant and the
design doc.

component-design-market-data-store.md section 2.2 reproduces the
`applied_migrations` definition so this component's design and
CAP-001-E1-S2's schema-migrator design cannot drift. This test pins the
constant this story exports to the design's own text, read from the document
rather than copied into the test.
"""

from factorflow.db.applied_migrations import APPLIED_MIGRATIONS_DDL
from tests.unit.design_sql import sql_block_under_heading


def test_applied_migrations_ddl_matches_design_verbatim() -> None:
    expected = sql_block_under_heading("### 2.2")
    assert APPLIED_MIGRATIONS_DDL == expected


def test_design_block_is_actually_read() -> None:
    """Section 2.2 opens with a non-SQL fence; confirm the SQL one was taken."""
    expected = sql_block_under_heading("### 2.2")
    assert "CREATE TABLE IF NOT EXISTS applied_migrations" in expected
