"""Guards against drift between migration 0005 and research-store design section 2.3.

Like the 0001 guard, this reads the design's own SQL block rather than a copy
of it, so a change on either side fails the test.
"""

from pathlib import Path

import pytest

from factorflow.db.migrate_main import MIGRATIONS_DIR
from tests.unit.design_sql import sql_block_under_heading

REPO_ROOT = Path(__file__).resolve().parents[2]
RESEARCH_STORE_DESIGN_PATH = (
    REPO_ROOT
    / "docs"
    / "capabilities"
    / "CAP-002-universe-and-factor-classification"
    / "design"
    / "component-design-research-store.md"
)
MIGRATION_0005_PATH = MIGRATIONS_DIR / "0005_universes.sql"

TABLES = ("universe", "universe_event")
COLUMNS = (
    "universe_id",
    "created_at",
    "event_id",
    "event_type",
    "instrument_id",
    "name",
    "filter_provenance",
    "recorded_at",
    "recorded_on",
)
CONSTRAINTS = (
    "universe_event_type_known",
    "universe_event_member_has_instrument",
    "universe_event_name_agrees",
    "universe_event_name_trimmed",
    "universe_event_provenance_only_on_created",
)
INDEXES = (
    "idx_universe_event_universe",
    "idx_universe_event_instrument",
    "idx_universe_event_single_created",
    "idx_universe_event_single_retired",
)


def _design_block() -> str:
    return sql_block_under_heading("### 2.3", path=RESEARCH_STORE_DESIGN_PATH)


# Implements TC-COMP-017
def test_migration_0005_matches_design_verbatim() -> None:
    assert MIGRATION_0005_PATH.read_text(encoding="utf-8") == _design_block()


# Implements TC-COMP-017
def test_design_block_is_actually_read() -> None:
    """The comparison above is only meaningful if the block was really found."""
    block = _design_block()
    assert "CREATE TABLE universe (" in block
    assert "CREATE TABLE universe_event (" in block


# Implements TC-COMP-017
@pytest.mark.parametrize("name", [*TABLES, *COLUMNS, *CONSTRAINTS, *INDEXES])
def test_migration_0005_names_every_element_of_section_2_3(name: str) -> None:
    assert name in MIGRATION_0005_PATH.read_text(encoding="utf-8")


# Implements TC-COMP-017
def test_migration_0005_invents_no_name_length_bound() -> None:
    text = MIGRATION_0005_PATH.read_text(encoding="utf-8").lower()
    assert "octet_length" not in text
    assert "length(" not in text
