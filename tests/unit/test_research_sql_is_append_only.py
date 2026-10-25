"""Static guard: no statement mutates the universe tables once written.

`universe_event` is append-only (AC-6) and `universe` is insert-only in content
(DAC-E1-10 names both). The delivered guard in `test_sql_is_append_only.py`
fixes its table list in module constants, so this module builds the same three
patterns, plus MERGE, from its own table tuple. CAP-002-E2-S1 extends `RESEARCH_TABLES`
with the three append-only classification tables and adds the rule that every
`UPDATE classification_set` carries a `state = 'building'` guard (AC-19, AC-20).
"""

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_ROOT = REPO_ROOT / "src" / "factorflow"
RESEARCH_TABLES = (
    "universe_event",
    "universe",
    "classification_set_factor",
    "factor_input",
    "factor_classification",
)
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
MERGE_MUTATION_PATTERN = re.compile(
    rf"\bmerge\s+into\s+(?:only\s+)?{_QUALIFIED_TABLE_PATTERN}(?!\w)"
    rf"[^;]*?\bthen\s+(?:update|delete)\b",
    re.IGNORECASE | re.DOTALL,
)


def prohibited_research_mutations(text: str) -> list[str]:
    """Return UPDATE, DELETE, upsert and MERGE statements against the research tables."""
    matches = [
        *MUTATION_PATTERN.finditer(text),
        *UPSERT_MUTATION_PATTERN.finditer(text),
        *MERGE_MUTATION_PATTERN.finditer(text),
    ]
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
        ("UPDATE ONLY universe_event SET name = 'x'", "UPDATE ONLY universe_event"),
        (
            "MERGE INTO universe_event e USING src s ON e.event_id = s.event_id "
            "WHEN MATCHED THEN UPDATE SET name = s.name",
            "MERGE INTO universe_event e USING src s ON e.event_id = s.event_id "
            "WHEN MATCHED THEN UPDATE",
        ),
        (
            "MERGE INTO universe u USING src s ON u.universe_id = s.universe_id "
            "WHEN MATCHED THEN DELETE",
            "MERGE INTO universe u USING src s ON u.universe_id = s.universe_id "
            "WHEN MATCHED THEN DELETE",
        ),
    ),
)
def test_guard_detects_prohibited_research_mutation(sql: str, expected: str) -> None:
    assert prohibited_research_mutations(sql) == [expected]


# Implements TC-COMP-047
def test_guard_ignores_other_tables_and_lookalike_names() -> None:
    sql = (
        "UPDATE instrument SET lifecycle = 'retired'; "
        "DELETE FROM universe_event_foo; "
        "INSERT INTO universe_event (universe_id) VALUES (1); "
        "MERGE INTO universe_event e USING src s ON e.event_id = s.event_id "
        "WHEN NOT MATCHED THEN INSERT (universe_id) VALUES (s.universe_id);"
    )

    assert prohibited_research_mutations(sql) == []


CLASSIFICATION_SET_UPDATE_PATTERN = re.compile(
    r"\bupdate\s+(?:only\s+)?(?:(?:\"[^\"]+\"|\w+)\s*\.\s*)?\"?classification_set\"?(?!\w)"
    r"[^;\"]*",
    re.IGNORECASE | re.DOTALL,
)
CLASSIFICATION_SET_DELETE_PATTERN = re.compile(
    r"\bdelete\s+from\s+(?:only\s+)?(?:(?:\"[^\"]+\"|\w+)\s*\.\s*)?\"?classification_set\"?(?!\w)",
    re.IGNORECASE,
)
BUILDING_GUARD_PATTERN = re.compile(
    r"\bwhere\b.*\bstate\s*=\s*'building'", re.IGNORECASE | re.DOTALL
)


def unguarded_classification_set_updates(text: str) -> list[str]:
    """Return `DELETE FROM classification_set` and `UPDATE classification_set` statements
    lacking a `state = 'building'` guard (a set is never deleted)."""
    updates = [
        match
        for match in CLASSIFICATION_SET_UPDATE_PATTERN.finditer(text)
        if not BUILDING_GUARD_PATTERN.search(match.group(0))
    ]
    matches = [*updates, *CLASSIFICATION_SET_DELETE_PATTERN.finditer(text)]
    return [match.group(0) for match in sorted(matches, key=lambda match: match.start())]


# Implements TC-COMP-047, DAC-E2-10
def test_every_classification_set_update_is_guarded_by_building_state() -> None:
    violations = {
        str(path.relative_to(REPO_ROOT)): unguarded_classification_set_updates(path.read_text())
        for path in research_source_paths()
        if unguarded_classification_set_updates(path.read_text())
    }

    assert violations == {}


# Implements TC-COMP-047
@pytest.mark.parametrize(
    "sql",
    (
        "UPDATE classification_set SET state = 'complete'",
        "UPDATE classification_set SET state = 'complete' WHERE set_id = %(set_id)s",
        "UPDATE classification_set SET state = 'building' WHERE set_id = %(set_id)s",
        "UPDATE ONLY classification_set SET failure_reason = 'x'",
        "DELETE FROM classification_set",
    ),
)
def test_guard_detects_an_unguarded_classification_set_update(sql: str) -> None:
    assert unguarded_classification_set_updates(sql) == [sql]


# Implements TC-COMP-047
@pytest.mark.parametrize(
    "sql",
    (
        "UPDATE classification_set SET state = 'complete', ended_at = now() "
        "WHERE set_id = %(set_id)s AND state = 'building'",
        "UPDATE classification_set SET state = 'failed', ended_at = now(), "
        "failure_reason = 'interrupted: the application restarted during the build' "
        "WHERE state = 'building' RETURNING set_id, run_id",
        "UPDATE classification_set_factor_other SET x = 1",
    ),
)
def test_guard_allows_a_guarded_or_unrelated_update(sql: str) -> None:
    assert unguarded_classification_set_updates(sql) == []


# Implements TC-COMP-047, DAC-E2-10
@pytest.mark.parametrize(
    ("sql", "expected"),
    (
        ("UPDATE factor_input SET value = 1", "UPDATE factor_input"),
        ("UPDATE factor_classification SET score = 1", "UPDATE factor_classification"),
        ("DELETE FROM classification_set_factor", "DELETE FROM classification_set_factor"),
    ),
)
def test_guard_covers_the_classification_tables(sql: str, expected: str) -> None:
    assert prohibited_research_mutations(sql) == [expected]


# Implements TC-COMP-047
def test_guard_rejects_a_delete_even_when_it_names_the_building_state() -> None:
    sql = "DELETE FROM classification_set WHERE state = 'building'"

    assert unguarded_classification_set_updates(sql) == ["DELETE FROM classification_set"]
