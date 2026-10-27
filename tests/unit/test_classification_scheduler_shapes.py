"""The scheduler's public shapes (CAP-002-E2-S8; AC-10, DEC-0125); no mapped TC."""

import dataclasses
import inspect
from typing import get_type_hints
from uuid import UUID

import pytest

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
