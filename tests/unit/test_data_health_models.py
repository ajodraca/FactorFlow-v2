"""Unit tests: the data-health-reader models mirror RD 2.2 (CAP-003-E2-S1).

The field lists below are written from component-design-data-health-reader.md
2.2, in order, because ``data-health-api`` (E2-S4) mirrors them field for field.
Version 1 shape: ``Failure`` has no ``cause`` (CAP-003-E8-S6 adds it).
"""

import dataclasses
from datetime import UTC, datetime
from uuid import UUID

import pytest

from factorflow.data_health import models

RUN_ID = UUID("00000000-0000-0000-0000-000000000001")
WHEN = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)

EXPECTED_FIELDS: dict[str, list[str]] = {
    "Progress": ["done", "total"],
    "LatestDownload": [
        "run_id",
        "state",
        "requested_at",
        "started_at",
        "ended_at",
        "progress",
    ],
    "LatestTerminalDownload": ["run_id", "state", "ended_at", "failure_reason"],
    "Problems": ["stock_count", "symbols", "newest_completed_at"],
    "AttentionItem": ["kind", "recorded_at", "run_id"],
    "Attention": [
        "checked_at",
        "followed_count",
        "prices_as_of",
        "credential_present",
        "problems",
        "latest_download",
        "latest_terminal_download",
        "items",
    ],
    "Failure": ["data_type", "outcome", "reason", "attempts", "completed_at", "run_id"],
    "ProblemRow": ["symbol", "failures", "retryable"],
    "ProblemPage": ["rows", "next_cursor"],
    "GapDetectionState": ["available", "reason"],
    "DailyPricesCheck": [
        "status",
        "absent_count",
        "gap_stock_count",
        "behind_count",
        "latest_session",
        "gap_detection",
        "exception_count",
        "exception_symbols",
    ],
    "CompanyFinancialsCheck": [
        "status",
        "absent_count",
        "problem_count",
        "as_of",
        "exception_count",
        "exception_symbols",
    ],
    "DataHealth": [
        "checked_at",
        "never_acquired",
        "followed_count",
        "affected_count",
        "daily_prices",
        "company_financials",
        "problems",
    ],
}


@pytest.mark.parametrize("name", sorted(EXPECTED_FIELDS))
def test_model_fields_match_the_design_in_order(name: str) -> None:
    cls = getattr(models, name)

    assert [f.name for f in dataclasses.fields(cls)] == EXPECTED_FIELDS[name]


@pytest.mark.parametrize("name", sorted(EXPECTED_FIELDS))
def test_every_model_is_a_frozen_dataclass(name: str) -> None:
    cls = getattr(models, name)

    assert dataclasses.is_dataclass(cls)
    assert cls.__dataclass_params__.frozen is True


def test_failure_rejects_assignment() -> None:
    failure = models.Failure("prices", "failed", "timeout", 3, WHEN, RUN_ID)

    with pytest.raises(dataclasses.FrozenInstanceError):
        failure.attempts = 4  # type: ignore[misc]


def test_problem_row_and_page_reject_assignment() -> None:
    failure = models.Failure("prices", "not_found", None, 1, WHEN, RUN_ID)
    row = models.ProblemRow("AAA", (failure,), False)
    page = models.ProblemPage((row,), None)

    with pytest.raises(dataclasses.FrozenInstanceError):
        row.retryable = True  # type: ignore[misc]
    with pytest.raises(dataclasses.FrozenInstanceError):
        page.next_cursor = "AAA"  # type: ignore[misc]


def test_models_module_declares_exactly_the_design_dataclasses() -> None:
    declared = {
        name
        for name, value in vars(models).items()
        if isinstance(value, type) and dataclasses.is_dataclass(value)
    }

    assert declared == set(EXPECTED_FIELDS)
