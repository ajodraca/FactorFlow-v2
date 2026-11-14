"""Response models of the data-health-api (CAP-003-E2-S4; task plan T002, T003, T004, T008).

Component design `component-design-data-health-api.md` 2.4, system design 4.2.
The expected JSON is a hand-written literal in this file, never produced by
`from_reader`, `model_dump` or another model, so a mutant cannot cancel out on
both sides.
"""

import types
import typing
from datetime import UTC, date, datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from pydantic import BaseModel

from factorflow.api.data_health_models import (
    AttentionResponse,
    DataHealthResponse,
    ProblemPageResponse,
)
from factorflow.data_health.models import (
    Attention,
    AttentionItem,
    CompanyFinancialsCheck,
    DailyPricesCheck,
    DataHealth,
    Failure,
    GapDetectionState,
    LatestDownload,
    LatestTerminalDownload,
    ProblemPage,
    ProblemRow,
    Problems,
    Progress,
)

T0 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)
T_EST = datetime(2026, 10, 20, 16, 30, tzinfo=timezone(timedelta(hours=-5)))
D0 = date(2026, 10, 19)
RUN_A = UUID("aaaaaaaa-0000-0000-0000-000000000001")
RUN_B = UUID("bbbbbbbb-0000-0000-0000-000000000002")

ATTENTION_FULL = Attention(
    checked_at=T0,
    followed_count=3,
    prices_as_of=D0,
    credential_present=True,
    problems=Problems(2, ("AAA", "BBB"), T_EST),
    latest_download=LatestDownload(RUN_A, "running", T0, T0, None, Progress(1, 3)),
    latest_terminal_download=LatestTerminalDownload(RUN_B, "failed", T0, "provider unavailable"),
    items=(
        AttentionItem("data_problems", T_EST, None),
        AttentionItem("download_not_complete", T0, RUN_B),
    ),
)
ATTENTION_EMPTY = Attention(
    checked_at=T0,
    followed_count=0,
    prices_as_of=None,
    credential_present=False,
    problems=Problems(0, (), None),
    latest_download=None,
    latest_terminal_download=None,
    items=(AttentionItem("credential_missing", T0, None),),
)
ATTENTION_UNNAMED = Attention(
    checked_at=T0,
    followed_count=3,
    prices_as_of=D0,
    credential_present=True,
    problems=Problems(2, ("AAA", "BBB"), T_EST),
    latest_download=LatestDownload(RUN_A, "running", T0, None, None, Progress(0, None)),
    latest_terminal_download=LatestTerminalDownload(RUN_B, "failed", T0, "provider unavailable"),
    items=(
        AttentionItem("data_problems", T_EST, None),
        AttentionItem("download_not_complete", T0, RUN_B),
    ),
)
PAGE_FULL = ProblemPage(
    (
        ProblemRow(
            "AAA",
            (
                Failure("fundamentals", "not_found", None, 2, T0, RUN_B),
                Failure("prices", "failed", "provider timeout", 3, T_EST, RUN_B),
            ),
            True,
        ),
    ),
    "AAA",
)
HEALTH_FULL = DataHealth(
    checked_at=T0,
    never_acquired=False,
    followed_count=3,
    affected_count=2,
    daily_prices=DailyPricesCheck(
        "exceptions",
        1,
        None,
        1,
        D0,
        GapDetectionState(False, "fewer_than_two_instruments_with_data"),
        2,
        ("AAA", "BBB"),
    ),
    company_financials=CompanyFinancialsCheck("exceptions", 1, 1, T_EST, 2, ("AAA", "CCC")),
    problems=PAGE_FULL,
)
HEALTH_ZEROS = DataHealth(
    checked_at=T0,
    never_acquired=False,
    followed_count=1,
    affected_count=0,
    daily_prices=DailyPricesCheck("ok", 0, 0, 0, None, GapDetectionState(True, None), 0, ()),
    company_financials=CompanyFinancialsCheck("ok", 0, 0, None, 0, ()),
    problems=ProblemPage((), None),
)
HEALTH_NEVER = DataHealth(
    checked_at=T0,
    never_acquired=True,
    followed_count=0,
    affected_count=0,
    daily_prices=None,
    company_financials=None,
    problems=ProblemPage((), None),
)

EXPECTED_ATTENTION_FULL: dict[str, Any] = {
    "checked_at": "2026-10-20T21:00:00Z",
    "followed_count": 3,
    "prices_as_of": "2026-10-19",
    "credential_present": True,
    "problems": {
        "stock_count": 2,
        "symbols": ["AAA", "BBB"],
        "newest_completed_at": "2026-10-20T16:30:00-05:00",
    },
    "latest_download": {
        "run_id": "aaaaaaaa-0000-0000-0000-000000000001",
        "state": "running",
        "requested_at": "2026-10-20T21:00:00Z",
        "started_at": "2026-10-20T21:00:00Z",
        "ended_at": None,
        "progress": {"done": 1, "total": 3},
    },
    "latest_terminal_download": {
        "run_id": "bbbbbbbb-0000-0000-0000-000000000002",
        "state": "failed",
        "ended_at": "2026-10-20T21:00:00Z",
        "failure_reason": "provider unavailable",
    },
    "items": [
        {
            "kind": "data_problems",
            "recorded_at": "2026-10-20T16:30:00-05:00",
            "run_id": None,
        },
        {
            "kind": "download_not_complete",
            "recorded_at": "2026-10-20T21:00:00Z",
            "run_id": "bbbbbbbb-0000-0000-0000-000000000002",
        },
    ],
}
EXPECTED_ATTENTION_EMPTY: dict[str, Any] = {
    "checked_at": "2026-10-20T21:00:00Z",
    "followed_count": 0,
    "prices_as_of": None,
    "credential_present": False,
    "problems": {"stock_count": 0, "symbols": [], "newest_completed_at": None},
    "latest_download": None,
    "latest_terminal_download": None,
    "items": [
        {"kind": "credential_missing", "recorded_at": "2026-10-20T21:00:00Z", "run_id": None}
    ],
}
EXPECTED_ATTENTION_UNNAMED: dict[str, Any] = {
    **EXPECTED_ATTENTION_FULL,
    "latest_download": {
        "run_id": "aaaaaaaa-0000-0000-0000-000000000001",
        "state": "running",
        "requested_at": "2026-10-20T21:00:00Z",
        "started_at": None,
        "ended_at": None,
        "progress": {"done": 0, "total": None},
    },
}
EXPECTED_PAGE_FULL: dict[str, Any] = {
    "rows": [
        {
            "symbol": "AAA",
            "failures": [
                {
                    "data_type": "fundamentals",
                    "outcome": "not_found",
                    "reason": None,
                    "attempts": 2,
                    "completed_at": "2026-10-20T21:00:00Z",
                    "run_id": "bbbbbbbb-0000-0000-0000-000000000002",
                },
                {
                    "data_type": "prices",
                    "outcome": "failed",
                    "reason": "provider timeout",
                    "attempts": 3,
                    "completed_at": "2026-10-20T16:30:00-05:00",
                    "run_id": "bbbbbbbb-0000-0000-0000-000000000002",
                },
            ],
            "retryable": True,
        }
    ],
    "next_cursor": "AAA",
}
EXPECTED_HEALTH_FULL: dict[str, Any] = {
    "checked_at": "2026-10-20T21:00:00Z",
    "never_acquired": False,
    "followed_count": 3,
    "affected_count": 2,
    "checks": {
        "daily_prices": {
            "status": "exceptions",
            "absent_count": 1,
            "gap_stock_count": None,
            "behind_count": 1,
            "latest_session": "2026-10-19",
            "gap_detection": {
                "available": False,
                "reason": "fewer_than_two_instruments_with_data",
            },
            "exception_count": 2,
            "exception_symbols": ["AAA", "BBB"],
        },
        "company_financials": {
            "status": "exceptions",
            "absent_count": 1,
            "problem_count": 1,
            "as_of": "2026-10-20T16:30:00-05:00",
            "exception_count": 2,
            "exception_symbols": ["AAA", "CCC"],
        },
    },
    "problems": EXPECTED_PAGE_FULL,
}
EXPECTED_HEALTH_ZEROS: dict[str, Any] = {
    "checked_at": "2026-10-20T21:00:00Z",
    "never_acquired": False,
    "followed_count": 1,
    "affected_count": 0,
    "checks": {
        "daily_prices": {
            "status": "ok",
            "absent_count": 0,
            "gap_stock_count": 0,
            "behind_count": 0,
            "latest_session": None,
            "gap_detection": {"available": True, "reason": None},
            "exception_count": 0,
            "exception_symbols": [],
        },
        "company_financials": {
            "status": "ok",
            "absent_count": 0,
            "problem_count": 0,
            "as_of": None,
            "exception_count": 0,
            "exception_symbols": [],
        },
    },
    "problems": {"rows": [], "next_cursor": None},
}
EXPECTED_HEALTH_NEVER: dict[str, Any] = {
    "checked_at": "2026-10-20T21:00:00Z",
    "never_acquired": True,
    "followed_count": 0,
    "affected_count": 0,
    "checks": {"daily_prices": None, "company_financials": None},
    "problems": {"rows": [], "next_cursor": None},
}


def _field_names(model: type[BaseModel]) -> set[str]:
    names: set[str] = set()
    for name, field in model.model_fields.items():
        names.add(name)
        pending = [field.annotation]
        while pending:
            annotation = pending.pop()
            if isinstance(annotation, type) and issubclass(annotation, BaseModel):
                names |= _field_names(annotation)
            elif typing.get_origin(annotation) in (typing.Union, types.UnionType, list):
                pending.extend(typing.get_args(annotation))
    return names


def _string_leaves(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        return [leaf for item in value.values() for leaf in _string_leaves(item)]
    if isinstance(value, list):
        return [leaf for item in value for leaf in _string_leaves(item)]
    return []


# Implements TC-COMP-037
def test_responses_keep_the_domain_vocabulary_with_no_sentence_or_tier() -> None:
    names = (
        _field_names(AttentionResponse)
        | _field_names(DataHealthResponse)
        | _field_names(ProblemPageResponse)
    )
    assert names == {
        "checked_at",
        "followed_count",
        "prices_as_of",
        "credential_present",
        "problems",
        "stock_count",
        "symbols",
        "newest_completed_at",
        "latest_download",
        "run_id",
        "state",
        "requested_at",
        "started_at",
        "ended_at",
        "progress",
        "done",
        "total",
        "latest_terminal_download",
        "failure_reason",
        "items",
        "kind",
        "recorded_at",
        "never_acquired",
        "affected_count",
        "checks",
        "daily_prices",
        "company_financials",
        "status",
        "absent_count",
        "gap_stock_count",
        "behind_count",
        "latest_session",
        "gap_detection",
        "available",
        "reason",
        "exception_count",
        "exception_symbols",
        "problem_count",
        "as_of",
        "rows",
        "next_cursor",
        "symbol",
        "failures",
        "data_type",
        "outcome",
        "attempts",
        "completed_at",
        "retryable",
    }
    forbidden = {
        "stock",
        "stocks",
        "download",
        "downloads",
        "tier",
        "sentence",
        "message",
        "label",
        "text",
        "title",
    }
    assert names.isdisjoint(forbidden)

    tiers = {"critical", "serious", "warning", "good", "neutral"}
    for dumped in (
        AttentionResponse.from_reader(ATTENTION_FULL).model_dump(mode="json"),
        DataHealthResponse.from_reader(HEALTH_FULL).model_dump(mode="json"),
        DataHealthResponse.from_reader(HEALTH_ZEROS).model_dump(mode="json"),
    ):
        assert tiers.isdisjoint(_string_leaves(dumped))


# Implements TC-COMP-050
def test_attention_serialises_every_field_with_nulls_present() -> None:
    for fixture, expected in (
        (ATTENTION_FULL, EXPECTED_ATTENTION_FULL),
        (ATTENTION_EMPTY, EXPECTED_ATTENTION_EMPTY),
        (ATTENTION_UNNAMED, EXPECTED_ATTENTION_UNNAMED),
    ):
        assert AttentionResponse.from_reader(fixture).model_dump(mode="json") == expected


# Implements TC-COMP-050
def test_data_health_serialises_every_field_with_nulls_present() -> None:
    for fixture, expected in (
        (HEALTH_FULL, EXPECTED_HEALTH_FULL),
        (HEALTH_ZEROS, EXPECTED_HEALTH_ZEROS),
        (HEALTH_NEVER, EXPECTED_HEALTH_NEVER),
    ):
        assert DataHealthResponse.from_reader(fixture).model_dump(mode="json") == expected


# Implements TC-COMP-050
def test_problem_page_serialises_every_field() -> None:
    dumped = ProblemPageResponse.from_reader(HEALTH_FULL.problems).model_dump(mode="json")
    assert dumped == EXPECTED_PAGE_FULL


# Implements TC-COMP-050
def test_zero_counts_stay_zero_and_absent_counts_are_null() -> None:
    zeros = DataHealthResponse.from_reader(HEALTH_ZEROS).model_dump(mode="json")
    assert zeros["checks"]["daily_prices"]["gap_stock_count"] == 0
    full = DataHealthResponse.from_reader(HEALTH_FULL).model_dump(mode="json")
    assert full["checks"]["daily_prices"]["gap_stock_count"] is None
    unnamed = AttentionResponse.from_reader(ATTENTION_UNNAMED).model_dump(mode="json")
    assert unnamed["latest_download"]["progress"] == {"done": 0, "total": None}


# Implements TC-COMP-050
def test_never_acquired_serialises_checks_as_an_object_of_nulls() -> None:
    never = DataHealthResponse.from_reader(HEALTH_NEVER).model_dump(mode="json")
    assert never["never_acquired"] is True
    assert never["checks"] == {"daily_prices": None, "company_financials": None}
    full = DataHealthResponse.from_reader(HEALTH_FULL).model_dump(mode="json")
    assert full["never_acquired"] is False
    assert full["checks"]["daily_prices"] is not None
    assert full["checks"]["company_financials"] is not None


# Implements TC-COMP-050
def test_every_timestamp_carries_an_offset() -> None:
    for dumped in (
        AttentionResponse.from_reader(ATTENTION_FULL).model_dump(mode="json"),
        DataHealthResponse.from_reader(HEALTH_FULL).model_dump(mode="json"),
        ProblemPageResponse.from_reader(HEALTH_FULL.problems).model_dump(mode="json"),
    ):
        stamps = [leaf for leaf in _string_leaves(dumped) if "T" in leaf and ":" in leaf]
        assert stamps
        for stamp in stamps:
            assert datetime.fromisoformat(stamp).tzinfo is not None


def test_credential_present_is_a_json_boolean() -> None:
    assert AttentionResponse.model_fields["credential_present"].annotation is bool
    dumped = AttentionResponse.from_reader(ATTENTION_FULL).model_dump(mode="json")
    assert dumped["credential_present"] is True


# Implements TC-COMP-050
def test_an_ended_download_carries_its_end_instant() -> None:
    attention = Attention(
        checked_at=T0,
        followed_count=3,
        prices_as_of=D0,
        credential_present=True,
        problems=Problems(0, (), None),
        latest_download=LatestDownload(RUN_A, "succeeded", T0, T0, T_EST, Progress(3, 3)),
        latest_terminal_download=None,
        items=(),
    )
    dumped = AttentionResponse.from_reader(attention).model_dump(mode="json")
    assert dumped["latest_download"] == {
        "run_id": "aaaaaaaa-0000-0000-0000-000000000001",
        "state": "succeeded",
        "requested_at": "2026-10-20T21:00:00Z",
        "started_at": "2026-10-20T21:00:00Z",
        "ended_at": "2026-10-20T16:30:00-05:00",
        "progress": {"done": 3, "total": 3},
    }
