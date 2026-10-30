"""The scheduler's public shapes (CAP-002-E2-S8, CAP-002-E2-S9; AC-10, DEC-0125); no mapped TC."""

import ast
import dataclasses
import inspect
from pathlib import Path
from typing import get_type_hints
from uuid import UUID

import pytest

from factorflow.classification import scheduler
from factorflow.classification.scheduler import (
    ClaimedSet,
    ReclaimedSet,
    claim_next_set,
    reclaim_interrupted_sets,
)


@pytest.mark.parametrize("cls", [ClaimedSet, ReclaimedSet])
def test_result_types_are_frozen_dataclasses_of_set_id_and_run_id(cls: type) -> None:
    assert dataclasses.is_dataclass(cls)
    assert cls.__dataclass_params__.frozen  # type: ignore[attr-defined]
    assert [f.name for f in dataclasses.fields(cls)] == ["set_id", "run_id"]
    hints = get_type_hints(cls)
    assert hints == {"set_id": UUID, "run_id": UUID}


def test_claim_next_set_takes_a_keyword_only_at_defaulting_to_none() -> None:
    params = inspect.signature(claim_next_set).parameters
    assert list(params) == ["pool", "at"]
    assert params["at"].kind is inspect.Parameter.KEYWORD_ONLY
    assert params["at"].default is None


def test_reclaim_interrupted_sets_takes_only_the_pool() -> None:
    assert list(inspect.signature(reclaim_interrupted_sets).parameters) == ["pool"]


def _scheduler_tree() -> ast.Module:
    return ast.parse(Path(scheduler.__file__).read_text())


def test_run_classification_loop_is_a_coroutine_with_the_design_parameters() -> None:
    """AC-10, design 2.4 (CAP-002-E2-S9): the lifespan task awaits it with the pool and the
    settings; the three test seams are optional and default to None."""
    loop = scheduler.run_classification_loop
    assert inspect.iscoroutinefunction(loop)
    params = inspect.signature(loop).parameters
    assert list(params) == ["pool", "settings", "wait_fn", "dispatch_fn", "stop_event"]
    assert params["pool"].default is inspect.Parameter.empty
    assert params["settings"].default is inspect.Parameter.empty
    assert [params[name].default for name in ("wait_fn", "dispatch_fn", "stop_event")] == [
        None,
        None,
        None,
    ]


def test_build_claimed_set_takes_the_pool_the_set_and_the_timeout() -> None:
    """AC-11, design 2.4 (CAP-002-E2-S9)."""
    params = inspect.signature(scheduler.build_claimed_set).parameters
    assert list(params) == ["pool", "set_id", "timeout_seconds"]


def test_scheduler_never_sleeps_a_thread_and_imports_neither_threading_nor_ingestion() -> None:
    """AC-10, design 2.4 and constraint 1 (CAP-002-E2-S9): no blocking sleep on the event
    loop, no hand-made thread, and nothing from the ingestion process."""
    imported: list[str] = []
    sleeps: list[int] = []
    for node in ast.walk(_scheduler_tree()):
        if isinstance(node, ast.Import):
            imported.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            imported.append(node.module or "")
            imported.extend(f"{node.module}.{alias.name}" for alias in node.names)
            if node.module == "time":
                sleeps.extend(node.lineno for alias in node.names if alias.name == "sleep")
        elif (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "sleep"
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "time"
        ):
            sleeps.append(node.lineno)
    assert imported, "the parse found no imports, so the check would be vacuous"
    assert sleeps == []
    assert [name for name in imported if name.split(".")[0] == "threading"] == []
    assert [
        name
        for name in imported
        if name == "factorflow.ingestion" or name.startswith("factorflow.ingestion.")
    ] == []


def test_every_await_in_the_loop_is_a_dispatch_or_a_wait() -> None:
    """AC-10, DAC-E2-S9-1, design 2.4 (CAP-002-E2-S9): the loop awaits only the dispatcher
    and the waiter, so no synchronous database call runs on the event loop."""
    loops = [
        node
        for node in ast.walk(_scheduler_tree())
        if isinstance(node, ast.AsyncFunctionDef) and node.name == "run_classification_loop"
    ]
    assert len(loops) == 1
    awaited = []
    for node in ast.walk(loops[0]):
        if isinstance(node, ast.Await):
            assert isinstance(node.value, ast.Call), ast.unparse(node)
            assert isinstance(node.value.func, ast.Name), ast.unparse(node)
            awaited.append(node.value.func.id)
    assert awaited, "the loop awaits nothing, so the check would be vacuous"
    assert set(awaited) <= {"dispatch", "wait"}
    assert {"dispatch", "wait"} <= set(awaited)
