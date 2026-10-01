"""Guards against drift between the shipped gap statement and the design doc.

component-design-coverage-service.md section 2.3 pins three load-bearing
properties of ``gaps.sql``: the trading-day set is the union across instruments
(DAC-E6-2), a gap lies inside the instrument's own covered range (DAC-E6-3), and
the availability predicate is evaluated inside the statement (DAC-E6-S2-3). The
shipped file must be the design's block byte for byte, read from the design
itself rather than from a copy (CAP-001-E6-S2, T010).
"""

from pathlib import Path

from tests.unit.design_sql import sql_block_under_heading

REPO_ROOT = Path(__file__).resolve().parents[2]
GAPS_SQL_PATH = REPO_ROOT / "src" / "factorflow" / "coverage" / "sql" / "gaps.sql"
COVERAGE_DESIGN_PATH = (
    REPO_ROOT
    / "docs"
    / "capabilities"
    / "CAP-001-market-data-acquisition-foundation"
    / "design"
    / "component-design-coverage-service.md"
)


def test_gaps_sql_matches_design_verbatim() -> None:
    expected = sql_block_under_heading("### 2.3", path=COVERAGE_DESIGN_PATH)
    assert GAPS_SQL_PATH.read_text() == expected


def test_design_block_is_actually_read() -> None:
    """The comparison above is only meaningful if the block was really found."""
    expected = sql_block_under_heading("### 2.3", path=COVERAGE_DESIGN_PATH)
    assert "availability AS" in expected
    assert "(SELECT available FROM availability)" in expected
