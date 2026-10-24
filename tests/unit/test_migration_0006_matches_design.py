"""Guards against drift between migration 0006 and research-store section 2.4.

Reads the design's own SQL block rather than a copy of it, so editing either
side fails the test. Traces to AC-20 and AC-19 (CAP-002-E2-S1).
"""

import re
from pathlib import Path

from factorflow.db.migrate_main import MIGRATIONS_DIR
from tests.unit.design_sql import REPO_ROOT, sql_block_under_heading

RESEARCH_STORE_DESIGN_PATH = (
    REPO_ROOT
    / "docs"
    / "capabilities"
    / "CAP-002-universe-and-factor-classification"
    / "design"
    / "component-design-research-store.md"
)
MIGRATION_0006_PATH: Path = MIGRATIONS_DIR / "0006_classifications.sql"


def _design_block() -> str:
    return sql_block_under_heading("### 2.4", RESEARCH_STORE_DESIGN_PATH)


def _names(pattern: str, text: str) -> list[str]:
    return re.findall(pattern, text)


def test_migration_0006_matches_design_verbatim() -> None:
    assert MIGRATION_0006_PATH.read_text() == _design_block()


def test_design_block_is_actually_read() -> None:
    """The comparison above is only meaningful if the block was really found."""
    block = _design_block()
    assert "CREATE TABLE classification_set" in block
    assert "CREATE TABLE factor_classification" in block


def test_migration_0006_names_every_table_index_and_constraint_in_the_design() -> None:
    block = _design_block()
    committed = MIGRATION_0006_PATH.read_text()

    tables = _names(r"CREATE TABLE (\w+)", block)
    indexes = _names(r"CREATE (?:UNIQUE )?INDEX (\w+)", block)
    constraints = _names(r"CONSTRAINT (\w+)", block)

    assert len(tables) == 4
    assert len(indexes) == 7
    assert len(constraints) == 16
    for name in tables:
        assert f"CREATE TABLE {name}" in committed
    for name in indexes:
        assert re.search(rf"CREATE (?:UNIQUE )?INDEX {name}\b", committed)
    for name in constraints:
        assert f"CONSTRAINT {name}" in committed
