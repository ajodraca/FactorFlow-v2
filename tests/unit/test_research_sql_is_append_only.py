"""Static guard: no statement mutates the universe tables once written.

`universe_event` is append-only (AC-6) and `universe` is insert-only in content
(DAC-E1-10 names both). The delivered guard in `test_sql_is_append_only.py`
fixes its table list in module constants, so this module builds the same three
patterns from its own table tuple. CAP-002-E2-S1 extends `RESEARCH_TABLES`.
"""

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_ROOT = REPO_ROOT / "src" / "factorflow"
RESEARCH_TABLES = ("universe_event", "universe")
_TABLE_PATTERN = "|".join(RESEARCH_TABLES)
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


def prohibited_research_mutations(text: str) -> list[str]:
    """Return UPDATE, DELETE and upsert statements against the research tables."""
    matches = [*MUTATION_PATTERN.finditer(text), *UPSERT_MUTATION_PATTERN.finditer(text)]
    return [match.group(0) for match in sorted(matches, key=lambda match: match.start())]


def research_source_paths() -> list[Path]:
    """Return every `.sql` and `.py` file under src/factorflow/."""
    return sorted([*SOURCE_ROOT.rglob("*.sql"), *SOURCE_ROOT.rglob("*.py")])


# Implements TC-COMP-047, DAC-E1-10
def test_research_sql_is_append_only() -> None:
    violations = {
        str(path.relative_to(REPO_ROOT)): prohibited_research_mutations(path.read_text())
        for path in research_source_paths()
        if prohibited_research_mutations(path.read_text())
    }

    assert violations == {}


# Implements TC-COMP-047
@pytest.mark.parametrize(
    ("sql", "expected"),
    (
        ("UPDATE universe_event SET name = 'x'", "UPDATE universe_event"),
        ("DELETE FROM universe_event WHERE universe_id = %s", "DELETE FROM universe_event"),
        ("DELETE FROM ONLY universe_event", "DELETE FROM ONLY universe_event"),
        ('DELETE FROM "public"."universe_event"', 'DELETE FROM "public"."universe_event"'),
        (
            "INSERT INTO universe_event (universe_id) VALUES (1) "
            "ON CONFLICT (event_id) DO UPDATE SET name = 'x'",
            "INSERT INTO universe_event (universe_id) VALUES (1) ON CONFLICT (event_id) DO UPDATE",
        ),
        ("UPDATE universe SET created_at = now()", "UPDATE universe"),
        ("DELETE FROM universe", "DELETE FROM universe"),
    ),
)
def test_guard_detects_prohibited_research_mutation(sql: str, expected: str) -> None:
    assert prohibited_research_mutations(sql) == [expected]


# Implements TC-COMP-047
def test_guard_ignores_other_tables_and_lookalike_names() -> None:
    sql = (
        "UPDATE instrument SET lifecycle = 'retired'; "
        "DELETE FROM universe_event_foo; "
        "INSERT INTO universe_event (universe_id) VALUES (1);"
    )

    assert prohibited_research_mutations(sql) == []
