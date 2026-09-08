"""Pydantic response models for the ingestion API.

Component design: `component-design-ingestion-api.md` sections 2.1, 11.
`HealthResponse` is this story's (CAP-001-E1-S6) contribution; later stories
add the request and response models for the other endpoints in section 11's
table.
"""

from typing import Any, Literal

from pydantic import BaseModel

# `most_recent_run`'s real shape belongs to CAP-001-E7-S3 (component design
# section 11, story notes). This story hardcodes the field to `None`.
# `HealthResponse.most_recent_run` is typed `Any | None` -- deliberately
# loose -- so that story can populate it with a real shape, or extend it,
# without adding a new field to this model. See the task plan's Notes
# section for the full reasoning.
RunSummary = Any


class HealthResponse(BaseModel):
    """`GET /api/health`'s response body (component design section 11).

    `credential_present` is a boolean only, never the credential value
    (AC-13, DAC-E1-9): no field here is capable of carrying the secret
    itself.
    """

    status: Literal["ok"]
    database: Literal["reachable", "unreachable"]
    credential_present: bool
    schema_version: int | None
    most_recent_run: RunSummary | None = None
