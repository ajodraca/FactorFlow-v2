"""Static guard against mutation of point-in-time observation history."""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OBSERVATION_TABLES = (
    "instrument_reference",
    "daily_bar",
    "fundamental_observation",
    "corporate_action",
)
_TABLE_PATTERN = "|".join(OBSERVATION_TABLES)
MUTATION_PATTERN = re.compile(
    rf"\b(?:update\s+|delete\s+from\s+)(?:\w+\.)?[\"']?(?:{_TABLE_PATTERN})[\"']?\b",
    re.IGNORECASE,
)


def prohibited_observation_mutations(text: str) -> list[str]:
    """Return observation-table UPDATE and DELETE statements found in text."""
    return [match.group(0) for match in MUTATION_PATTERN.finditer(text)]


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


def test_guard_detects_prohibited_observation_mutation() -> None:
    sql = "DELETE FROM daily_bar WHERE instrument_id = %s"

    assert prohibited_observation_mutations(sql) == ["DELETE FROM daily_bar"]


def test_guard_ignores_mutations_of_non_observation_tables() -> None:
    sql = "UPDATE acquisition_state SET last_success_at = now(); DELETE FROM coverage_segment;"

    assert prohibited_observation_mutations(sql) == []
