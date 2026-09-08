"""Pydantic response models for the ingestion API.

Component design: `component-design-ingestion-api.md` sections 2.1, 11.
`HealthResponse` is this story's (CAP-001-E1-S6) contribution; later stories
add the request and response models for the other endpoints in section 11's
table.
"""

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """`GET /api/health`'s response body (component design section 11).

    `credential_present` is a boolean only, never the credential value
    (AC-13, DAC-E1-9): no field here is capable of carrying the secret
    itself.

    `most_recent_run`'s real shape belongs to CAP-001-E7-S3 (component
    design section 11, story notes); this story hardcodes the field to
    `None`. IR-006: an earlier version typed it `RunSummary | None` with
    `RunSummary = Any`, which collapses to `Any` -- `mypy --strict` would
    not flag a future assignment of a wrong shape, defeating the point of
    naming it at all. Typing it `None` exactly expresses the current
    contract precisely and forces CAP-001-E7-S3 to widen the type as a
    deliberate, reviewable change rather than one silently already
    permitted.
    """

    status: Literal["ok"]
    database: Literal["reachable", "unreachable"]
    credential_present: bool
    schema_version: int | None
    most_recent_run: None = None
