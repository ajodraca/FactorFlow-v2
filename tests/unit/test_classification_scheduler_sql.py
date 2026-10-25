"""The scheduler's SQL and source stay inside their contract (CAP-002-E2-S8).

Traces to AC-10, AC-20, DAC-E2-4 and DAC-E2-12; no mapped TC.
"""

import re
from pathlib import Path

import factorflow.classification

PACKAGE = Path(factorflow.classification.__file__).parent
SQL_DIR = PACKAGE / "sql"
APPEND_ONLY_TABLES = (
    "universe_event",
    "classification_set_factor",
    "factor_input",
    "factor_classification",
)


def _sql(name: str) -> str:
    return (SQL_DIR / name).read_text()


def test_qualifying_run_selects_oldest_succeeded_or_partial_run_without_a_set() -> None:
    text = _sql("qualifying_run.sql")
    assert "FROM acquisition_run" in text
    assert re.search(r"state\s+IN\s*\(\s*'succeeded'\s*,\s*'partial'\s*\)", text)
    assert re.search(r"NOT\s+EXISTS\s*\(.*classification_set.*run_id\s*=\s*r\.run_id", text, re.S)
    assert re.search(r"ORDER\s+BY\s+r\.ended_at\s+ASC", text)
    assert re.search(r"LIMIT\s+1\b", text)


def test_claim_set_is_a_single_building_insert_stamped_in_chicago() -> None:
    text = _sql("claim_set.sql")
    assert text.count("INSERT INTO classification_set") == 1
    assert "'building'" in text
    assert re.search(r"RETURNING\s+set_id", text)
    assert "America/Chicago" in text


def test_reclaim_updates_only_building_rows_to_failed() -> None:
    text = _sql("reclaim_interrupted.sql")
    assert re.search(r"WHERE\s+state\s*=\s*'building'", text)
    assert re.search(r"SET\s+state\s*=\s*'failed'", text)


def test_nothing_deletes_and_scheduler_source_leaves_the_append_only_tables_alone() -> None:
    for path in SQL_DIR.glob("*.sql"):
        assert "DELETE" not in path.read_text().upper(), path.name
    source = (PACKAGE / "scheduler.py").read_text()
    assert "DELETE FROM" not in source.upper()
    for table in APPEND_ONLY_TABLES:
        assert not re.search(rf"UPDATE\s+(ONLY\s+)?{table}\b", source, re.I), table


def test_scheduler_module_does_not_import_asyncio() -> None:
    source = (PACKAGE / "scheduler.py").read_text()
    assert not re.search(r"^\s*(import asyncio|from asyncio)", source, re.M)


def test_interruption_reason_is_fixed_and_avoids_relabelled_interface_terms() -> None:
    """AC-20, DAC-E2-12: the shipped reason, and none of the terms STD-UI v5/v6 relabelled."""
    text = _sql("reclaim_interrupted.sql")
    match = re.search(r"failure_reason\s*=\s*'([^']*)'", text)
    assert match is not None
    reason = match.group(1)
    assert reason == "interrupted: the application restarted during the build"
    for term in ("stock", "download", "incomplete", "score"):
        assert term not in reason.lower()
