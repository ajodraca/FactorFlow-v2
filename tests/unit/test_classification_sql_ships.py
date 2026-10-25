"""The engine's three statements exist and are loaded at import (CAP-002-E2-S2).

Whether the wheel ships ``classification/sql`` is ``test_package_data_ships_sql.py``'s
question alone (DEC-0088). Traces to AC-10 and AC-11.
"""

import dataclasses
from datetime import date
from pathlib import Path
from uuid import UUID

import pytest

from factorflow.classification import engine

SQL_DIR = Path(engine.__file__).parent / "sql"


@pytest.mark.parametrize(
    ("file_name", "constant"),
    [
        ("set_context.sql", "_SET_CONTEXT_SQL"),
        ("complete_set.sql", "_COMPLETE_SET_SQL"),
        ("fail_set.sql", "_FAIL_SET_SQL"),
    ],
)
def test_statement_exists_and_is_loaded_at_import(file_name: str, constant: str) -> None:
    text = (SQL_DIR / file_name).read_text()
    assert text.strip()
    assert getattr(engine, constant) == text


def test_build_context_and_result_are_frozen() -> None:
    """Stages share one context; none may rebind its fields (factor-engine design 2.3)."""
    context = engine.BuildContext(
        set_id=UUID(int=1),
        run_id=UUID(int=2),
        classification_date=date(2026, 10, 3),
        latest_trading_day=None,
        active_ids=(),
        retired_ids=(),
    )
    result = engine.BuildResult(UUID(int=1), "complete", None, 0, {})
    with pytest.raises(dataclasses.FrozenInstanceError):
        context.active_ids = (1,)  # type: ignore[misc]
    with pytest.raises(dataclasses.FrozenInstanceError):
        result.state = "failed"  # type: ignore[misc]
