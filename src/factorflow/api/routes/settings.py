"""`GET/PUT /api/settings/history-depth`.

Component design: `component-design-ingestion-api.md` sections 2.4, 11;
task plan T021. A thin HTTP surface over CAP-001-E2-S2's `settings.py`. The
`1..MAX_HISTORY_DEPTH_YEARS` bound is enforced here, at the API layer, via
`SetHistoryDepthRequest`'s Pydantic validator -- `write_history_depth`
itself enforces no upper bound (task plan Notes).
"""

from fastapi import APIRouter, Request

from factorflow.api.models import HistoryDepthResponse, SetHistoryDepthRequest
from factorflow.instruments.settings import read_history_depth, write_history_depth

router = APIRouter()


@router.get("/api/settings/history-depth", response_model=HistoryDepthResponse)
def get_history_depth(request: Request) -> HistoryDepthResponse:
    """`years` is `null`, not omitted, when the owner has never stated a
    depth (DAC-E2-S3-2)."""
    pool = request.app.state.db_pool
    with pool.connection() as connection:
        depth = read_history_depth(connection)

    if depth is None:
        return HistoryDepthResponse(years=None, updated_at=None)
    return HistoryDepthResponse(years=depth.years, updated_at=depth.updated_at)


@router.put("/api/settings/history-depth", response_model=HistoryDepthResponse)
def set_history_depth(body: SetHistoryDepthRequest, request: Request) -> HistoryDepthResponse:
    """`422` for any value outside the canonical bound is rejected by
    `SetHistoryDepthRequest` before this handler ever runs (DAC-E2-8)."""
    pool = request.app.state.db_pool
    with pool.connection() as connection:
        write_history_depth(connection, body.years)
        depth = read_history_depth(connection)

    assert depth is not None
    return HistoryDepthResponse(years=depth.years, updated_at=depth.updated_at)
