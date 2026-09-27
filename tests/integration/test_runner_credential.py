"""Integration tests: credential reload and poll-interval behaviour.

- TC-COMP-023: poll interval respected on empty claim (DAC-E4-S5-6)
- TC-COMP-180: wait poll_interval_seconds then poll again on empty claim
- TC-COMP-181: changed credential rebuilds client before first fetch (DAC-E4-S5-7)
- TC-COMP-301: credential rotatable without restart (DAC-E1-10)

# Implements TC-COMP-023, TC-COMP-180, TC-COMP-181, TC-COMP-301
"""

from __future__ import annotations

from unittest.mock import MagicMock

import psycopg

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _insert_claimed_run(conn: psycopg.Connection, depth: int = 5) -> None:
    """Insert and immediately claim a run for testing credential flow."""
    import uuid

    run_id = uuid.uuid4()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO acquisition_run "
            "(run_id, state, history_depth_years, requested_at, started_at, "
            "claimed_by, heartbeat_at) "
            "VALUES (%s, 'running', %s, now(), now(), 'test-runner', now())",
            (run_id, depth),
        )
    conn.commit()


# ---------------------------------------------------------------------------
# Unit-style tests for poll interval and credential rotation
# These use controlled wait functions, no real sleep
# ---------------------------------------------------------------------------


# Implements TC-COMP-023, TC-COMP-180
def test_empty_claim_waits_poll_interval_then_polls_again() -> None:
    """When no run can be claimed, the runner waits poll_interval_seconds
    then polls again (DAC-E4-S5-6).

    Uses a controlled wait function that records call arguments.
    """
    from factorflow.ingestion.runner import run_polling_loop

    waited_durations: list[float] = []

    def controlled_wait(seconds: float) -> None:
        waited_durations.append(seconds)

    mock_claim = MagicMock(return_value=None)  # always returns None (empty)
    mock_execute = MagicMock()

    poll_interval = 5.0
    # Run two polling cycles (claim returns None twice, then stop)
    call_count = [0]

    def claim_side_effect(*args, **kwargs):
        call_count[0] += 1
        if call_count[0] >= 3:
            raise StopIteration  # stop after 2 empty polls
        return None

    mock_claim.side_effect = claim_side_effect

    try:
        run_polling_loop(
            claim_fn=mock_claim,
            execute_fn=mock_execute,
            wait_fn=controlled_wait,
            poll_interval_seconds=poll_interval,
        )
    except StopIteration:
        pass

    # Should have waited exactly poll_interval_seconds each time
    assert len(waited_durations) >= 2
    assert all(abs(d - poll_interval) < 0.001 for d in waited_durations)


# Implements TC-COMP-181, TC-COMP-301
def test_changed_credential_rebuilds_client() -> None:
    """When credential fingerprint changes at claim time, the client is
    rebuilt before the first fetch (DAC-E4-S5-7).
    """
    from factorflow.ingestion.runner import CredentialAwareClientFactory

    build_calls: list[str] = []

    def mock_build_client(key_value: str) -> MagicMock:
        build_calls.append(key_value)
        return MagicMock()

    factory = CredentialAwareClientFactory(build_client=mock_build_client)

    # First credential
    client1 = factory.get_or_rebuild("key-abc-123")
    assert len(build_calls) == 1

    # Same credential — must not rebuild
    client2 = factory.get_or_rebuild("key-abc-123")
    assert client1 is client2
    assert len(build_calls) == 1

    # Changed credential — must rebuild
    client3 = factory.get_or_rebuild("key-xyz-999")
    assert client3 is not client1
    assert len(build_calls) == 2


# Implements TC-COMP-181, TC-COMP-301
def test_unchanged_credential_preserves_existing_client() -> None:
    """When the credential fingerprint has not changed at claim time,
    the existing client is reused (DAC-E4-S5-7).
    """
    from factorflow.ingestion.runner import CredentialAwareClientFactory

    build_count = [0]

    def mock_build_client(key_value: str) -> MagicMock:
        build_count[0] += 1
        return MagicMock()

    factory = CredentialAwareClientFactory(build_client=mock_build_client)

    client_a = factory.get_or_rebuild("stable-key")
    client_b = factory.get_or_rebuild("stable-key")
    client_c = factory.get_or_rebuild("stable-key")

    assert client_a is client_b
    assert client_b is client_c
    assert build_count[0] == 1
