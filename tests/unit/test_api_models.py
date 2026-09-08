"""`HealthResponse` round-trips through JSON with real booleans (task plan T015)."""

import json

from factorflow.api.models import HealthResponse


def test_health_response_serializes_credential_present_as_json_boolean() -> None:
    model = HealthResponse(
        status="ok",
        database="reachable",
        credential_present=True,
        schema_version=3,
        most_recent_run=None,
    )

    payload = json.loads(model.model_dump_json())

    assert payload["credential_present"] is True
    assert isinstance(payload["credential_present"], bool)
    assert payload["most_recent_run"] is None
