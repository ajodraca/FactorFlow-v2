"""The E5 schema migrations must remain the approved design SQL."""

from pathlib import Path

import pytest

from tests.unit.design_sql import REPO_ROOT, sql_block_after_migration_filename


def test_e5_migrations_match_filename_design_blocks() -> None:
    design = (
        REPO_ROOT
        / "docs/capabilities/CAP-001-market-data-acquisition-foundation"
        / "design/component-design-market-data-store.md"
    )
    for filename in ("0003_coverage.sql", "0004_runs.sql"):
        actual = (REPO_ROOT / "migrations" / filename).read_text(encoding="utf-8")
        assert actual == sql_block_after_migration_filename(filename, design)


def test_unrelated_migration_tables_do_not_cross_ownership() -> None:
    coverage = (REPO_ROOT / "migrations" / "0003_coverage.sql").read_text(encoding="utf-8")
    runs = (REPO_ROOT / "migrations" / "0004_runs.sql").read_text(encoding="utf-8")
    assert "acquisition_state" in coverage and "acquisition_run" not in coverage
    assert "acquisition_run" in runs and "acquisition_state" not in runs


def test_filename_sql_helper_rejects_missing_or_unclosed_fences(tmp_path: Path) -> None:
    missing = tmp_path / "missing.md"
    missing.write_text("**0003_coverage.sql**\n", encoding="utf-8")
    with pytest.raises(AssertionError, match="missing or unclosed"):
        sql_block_after_migration_filename("0003_coverage.sql", missing)

    unclosed = tmp_path / "unclosed.md"
    unclosed.write_text("**0003_coverage.sql**\n```sql\nSELECT 1;\n", encoding="utf-8")
    with pytest.raises(AssertionError, match="missing or unclosed"):
        sql_block_after_migration_filename("0003_coverage.sql", unclosed)

    with pytest.raises(AssertionError, match="not found"):
        sql_block_after_migration_filename("0003_coverage.sql", tmp_path / "absent.md")
