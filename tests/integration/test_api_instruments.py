"""`GET/POST /api/instruments`, `DELETE /api/instruments/{symbol}` against a
real PostgreSQL instance.

Component design section 11; task plan T006-T009, T012-T014, T023.
"""

import pytest
from fastapi.testclient import TestClient

from factorflow.api.app import create_app


@pytest.fixture
def client(migrated_connection_string: str, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", migrated_connection_string)
    with TestClient(create_app()) as test_client:
        yield test_client


@pytest.mark.postgres
# Implements TC-INT-003
def test_add_status_codes(client: TestClient) -> None:
    """TC-COMP-102: `201` with at least one added/reactivated, `409` all
    duplicate, `422` all malformed."""
    first = client.post("/api/instruments", json={"symbols": ["AAPL", "MSFT"]})
    assert first.status_code == 201

    duplicates = client.post("/api/instruments", json={"symbols": ["AAPL", "MSFT"]})
    assert duplicates.status_code == 409
    duplicates_envelope = duplicates.json()["error"]
    assert duplicates_envelope["code"] == "all_duplicate"

    malformed = client.post("/api/instruments", json={"symbols": ["1BAD", "$$$"]})
    assert malformed.status_code == 422
    malformed_envelope = malformed.json()["error"]
    assert malformed_envelope["code"] == "all_malformed"

    for envelope in (duplicates_envelope, malformed_envelope):
        assert envelope["resource"] == "instruments"
        assert envelope["message"]
        assert envelope["request_id"]


@pytest.mark.postgres
# Implements TC-INT-002
def test_add_mixed_batch_response_shape(client: TestClient) -> None:
    """TC-COMP-123/DAC-E2-S3-1: a mixed batch reports every disposition
    group separately, each rejection carrying a reason."""
    client.post("/api/instruments", json={"symbols": ["AAPL"]})
    retire = client.delete("/api/instruments/AAPL")
    assert retire.status_code == 200
    client.post("/api/instruments", json={"symbols": ["MSFT"]})

    response = client.post(
        "/api/instruments",
        json={"symbols": ["GOOG", "AAPL", "MSFT", "1BAD"]},
    )

    assert response.status_code == 201
    body = response.json()
    assert [o["normalised_symbol"] for o in body["added"]] == ["GOOG"]
    assert [o["normalised_symbol"] for o in body["reactivated"]] == ["AAPL"]
    rejected_by_symbol = {o["input_symbol"]: o for o in body["rejected"]}
    assert rejected_by_symbol["MSFT"]["reason"]
    assert rejected_by_symbol["1BAD"]["reason"]


@pytest.mark.postgres
# Implements TC-INT-004
# Implements TC-INT-005
def test_retire_status_codes(client: TestClient) -> None:
    """TC-COMP-103: `404` unknown, `409` already retired, `200` otherwise."""
    unknown = client.delete("/api/instruments/NOPE")
    assert unknown.status_code == 404
    unknown_code = unknown.json()["error"]["code"]
    assert unknown_code == "instrument_not_found"

    client.post("/api/instruments", json={"symbols": ["AAPL"]})

    active = client.delete("/api/instruments/AAPL")
    assert active.status_code == 200
    body = active.json()
    assert body["lifecycle"] == "retired"
    assert body["retired_at"]

    already_retired = client.delete("/api/instruments/AAPL")
    assert already_retired.status_code == 409
    already_retired_code = already_retired.json()["error"]["code"]
    assert already_retired_code == "instrument_already_retired"
    assert unknown_code != already_retired_code


@pytest.mark.postgres
# Implements TC-INT-001
def test_list_filters_and_counts(client: TestClient) -> None:
    """TC-COMP-108/DAC-E2-10: prefix filter, lifecycle filter, and counts."""
    client.post("/api/instruments", json={"symbols": ["AAPL", "AMZN", "MSFT"]})
    client.delete("/api/instruments/MSFT")

    prefix = client.get("/api/instruments", params={"symbol": "A"})
    assert prefix.status_code == 200
    prefix_symbols = {row["symbol"] for row in prefix.json()["instruments"]}
    assert prefix_symbols == {"AAPL", "AMZN"}

    retired_only = client.get("/api/instruments", params={"lifecycle": "retired"})
    retired_symbols = {row["symbol"] for row in retired_only.json()["instruments"]}
    assert retired_symbols == {"MSFT"}

    everything = client.get("/api/instruments")
    body = everything.json()
    assert body["active_count"] == 2
    assert body["retired_count"] == 1


@pytest.mark.postgres
def test_list_rejects_unrecognised_lifecycle(client: TestClient) -> None:
    """DAC-E2-10/adversarial review v1, IR-003: an unrecognised `lifecycle`
    value is rejected with `422`, not silently matched against nothing."""
    response = client.get("/api/instruments", params={"lifecycle": "bogus-value"})

    assert response.status_code == 422


@pytest.mark.postgres
# Implements TC-INT-005
def test_error_envelope_shape(client: TestClient) -> None:
    """TC-COMP-125/DAC-E2-S3-3: every non-2xx response from this route
    carries the shared error envelope."""
    not_found = client.delete("/api/instruments/NOPE")
    assert not_found.status_code == 404
    envelope = not_found.json()["error"]
    assert envelope["code"]
    assert envelope["message"]
    assert envelope["resource"]
    assert envelope["request_id"]

    client.post("/api/instruments", json={"symbols": ["AAPL"]})
    already_retired_setup = client.delete("/api/instruments/AAPL")
    assert already_retired_setup.status_code == 200
    conflict = client.delete("/api/instruments/AAPL")
    assert conflict.status_code == 409
    conflict_envelope = conflict.json()["error"]
    assert conflict_envelope["code"]
    assert conflict_envelope["message"]
    assert conflict_envelope["resource"]
    assert conflict_envelope["request_id"]

    # Adversarial review v1, IR-001: a `422` from this route previously
    # reported `resource: null`, since `_validation_error_handler` is
    # registered application-wide in `app.py` and omitted the argument.
    invalid = client.get("/api/instruments", params={"limit": 501})
    assert invalid.status_code == 422
    invalid_envelope = invalid.json()["error"]
    assert invalid_envelope["code"]
    assert invalid_envelope["message"]
    assert invalid_envelope["resource"]
    assert invalid_envelope["request_id"]


@pytest.mark.postgres
def test_list_limit_over_bound_rejected(client: TestClient) -> None:
    """TC-COMP-126/DAC-E2-S3-4: a `limit` above `MAX_PAGE_SIZE` is rejected,
    never silently clamped."""
    response = client.get("/api/instruments", params={"limit": 501})

    assert response.status_code == 422


@pytest.mark.postgres
def test_list_limit_at_bound_accepted(client: TestClient) -> None:
    """DAC-E2-S3-4/adversarial review v1, IR-005: `MAX_PAGE_SIZE` (500) is
    inclusive, so the boundary value itself must be accepted, not just the
    value one above it rejected -- otherwise an `le`-to-`lt` regression on
    the bound would pass unnoticed."""
    response = client.get("/api/instruments", params={"limit": 500})

    assert response.status_code == 200


@pytest.mark.postgres
# Implements TC-INT-001
def test_list_cursor_pagination(client: TestClient) -> None:
    """TC-COMP-127/DAC-E2-S3-5: a cursor from one page continues to the next
    with stable ordering and no duplicate or skipped instrument."""
    symbols = [f"SYM{i:02d}" for i in range(5)]
    client.post("/api/instruments", json={"symbols": symbols})

    first_page = client.get("/api/instruments", params={"limit": 2})
    assert first_page.status_code == 200
    first_body = first_page.json()
    assert len(first_body["instruments"]) == 2
    assert first_body["next_cursor"] is not None

    second_page = client.get(
        "/api/instruments", params={"limit": 2, "cursor": first_body["next_cursor"]}
    )
    second_body = second_page.json()

    third_page = client.get(
        "/api/instruments", params={"limit": 2, "cursor": second_body["next_cursor"]}
    )
    third_body = third_page.json()

    seen = [row["symbol"] for row in first_body["instruments"]]
    seen += [row["symbol"] for row in second_body["instruments"]]
    seen += [row["symbol"] for row in third_body["instruments"]]
    assert seen == sorted(symbols)
    assert len(seen) == len(set(seen))
