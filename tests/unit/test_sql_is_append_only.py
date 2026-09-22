"""Static guard against mutation of point-in-time observation history."""

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
OBSERVATION_TABLES = (
    "instrument_reference",
    "daily_bar",
    "fundamental_observation",
    "corporate_action",
)
_TABLE_PATTERN = "|".join(OBSERVATION_TABLES)
_QUALIFIED_TABLE_PATTERN = rf'(?:(?:"[^"]+"|\w+)\s*\.\s*)?"?(?:{_TABLE_PATTERN})"?'
MUTATION_PATTERN = re.compile(
    rf"\b(?:update\s+(?:only\s+)?|delete\s+from\s+(?:only\s+)?)"
    rf"{_QUALIFIED_TABLE_PATTERN}(?!\w)",
    re.IGNORECASE,
)
UPSERT_MUTATION_PATTERN = re.compile(
    rf"\binsert\s+into\s+(?:only\s+)?{_QUALIFIED_TABLE_PATTERN}(?!\w)"
    rf"[^;]*?\bon\s+conflict\b[^;]*?\bdo\s+update\b",
    re.IGNORECASE | re.DOTALL,
)


def prohibited_observation_mutations(text: str) -> list[str]:
    """Return observation-table UPDATE and DELETE statements found in text."""
    matches = [*MUTATION_PATTERN.finditer(text), *UPSERT_MUTATION_PATTERN.finditer(text)]
    return [match.group(0) for match in sorted(matches, key=lambda match: match.start())]


def observation_sql_paths() -> list[Path]:
    """Return every migration and Python source path covered by the guard."""
    migrations = (REPO_ROOT / "migrations").glob("*.sql")
    python_sources = (REPO_ROOT / "src" / "factorflow").rglob("*.py")
    return sorted([*migrations, *python_sources])


# Implements TC-COMP-155, TC-COMP-156
def test_observation_history_sql_is_append_only() -> None:
    violations = {
        str(path.relative_to(REPO_ROOT)): prohibited_observation_mutations(path.read_text())
        for path in observation_sql_paths()
        if prohibited_observation_mutations(path.read_text())
    }

    assert violations == {}


@pytest.mark.parametrize(
    ("sql", "expected"),
    (
        ("DELETE FROM daily_bar WHERE instrument_id = %s", "DELETE FROM daily_bar"),
        (
            "UPDATE ONLY fundamental_observation SET payload = '{}'",
            "UPDATE ONLY fundamental_observation",
        ),
        (
            "DELETE FROM ONLY corporate_action WHERE instrument_id = %s",
            "DELETE FROM ONLY corporate_action",
        ),
        (
            'DELETE FROM "public"."daily_bar" WHERE instrument_id = %s',
            'DELETE FROM "public"."daily_bar"',
        ),
        (
            "INSERT INTO daily_bar (instrument_id) VALUES (1) "
            "ON CONFLICT (instrument_id) DO UPDATE SET volume = 0",
            "INSERT INTO daily_bar (instrument_id) VALUES (1) "
            "ON CONFLICT (instrument_id) DO UPDATE",
        ),
    ),
)
def test_guard_detects_prohibited_observation_mutation(sql: str, expected: str) -> None:
    assert prohibited_observation_mutations(sql) == [expected]


def test_guard_ignores_mutations_of_non_observation_tables() -> None:
    sql = (
        "UPDATE acquisition_state SET last_success_at = now(); "
        "DELETE FROM coverage_segment; "
        "INSERT INTO owner_setting (key, value) VALUES ('x', 'y') "
        "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;"
    )

    assert prohibited_observation_mutations(sql) == []


# Implements TC-COMP-168
def test_writer_source_uses_on_conflict_do_nothing_for_all_observation_tables() -> None:
    """Every INSERT into an observation table in writer.py must use ON CONFLICT DO NOTHING.

    This test reads the writer source and asserts that:
    - Every observation-table INSERT uses ON CONFLICT DO NOTHING
    - No UPDATE, DELETE, or ON CONFLICT DO UPDATE appears against any observation table
    """
    writer_path = REPO_ROOT / "src" / "factorflow" / "ingestion" / "writer.py"
    writer_source = writer_path.read_text()

    # No mutations allowed against observation tables
    mutations = prohibited_observation_mutations(writer_source)
    assert mutations == [], f"prohibited mutations found in writer.py: {mutations}"

    # Every observation-table INSERT must have ON CONFLICT DO NOTHING
    for table in OBSERVATION_TABLES:
        insert_into_pattern = re.compile(
            rf"\binsert\s+into\s+(?:only\s+)?{table}\b",
            re.IGNORECASE,
        )
        if insert_into_pattern.search(writer_source):
            # Found an INSERT for this table -- verify it uses ON CONFLICT DO NOTHING
            on_conflict_pattern = re.compile(
                rf"\binsert\s+into\s+(?:only\s+)?{table}\b[^;]*?\bon\s+conflict\s+do\s+nothing\b",
                re.IGNORECASE | re.DOTALL,
            )
            assert on_conflict_pattern.search(writer_source), (
                f"INSERT into {table} in writer.py does not use ON CONFLICT DO NOTHING"
            )
