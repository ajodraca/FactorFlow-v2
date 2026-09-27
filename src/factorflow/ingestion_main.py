"""Ingestion container entrypoint (CAP-001-E4-S5, T010).

Loads ``Settings``, configures structured/redacted logging, constructs
runner dependencies, and repeatedly invokes the runner loop so an empty
claim waits ``settings.run.poll_interval_seconds`` before the next attempt.

This module must not import ``factorflow.api``.  It is the independent
ingestion process; it shares only the database with the API container.
"""

from __future__ import annotations

import logging
import socket
import sys
import time
from datetime import date
from typing import Any

import psycopg

from factorflow.config.settings import (
    ConfigurationError,
    Settings,
    configure_logging,
    read_provider_credential,
)
from factorflow.ingestion.runner import (
    AcquisitionRunner,
    CredentialAwareClientFactory,
    run_polling_loop,
)
from factorflow.instruments.service import active_instrument_ids
from factorflow.runs.journal import ClaimedRun, claim_next

log = logging.getLogger(__name__)

_RUNNER_ID_PREFIX = "ingestion-runner"


def _make_runner_id() -> str:
    """Build a stable runner ID from the container hostname (DAC-E4-S5)."""
    try:
        return f"{_RUNNER_ID_PREFIX}-{socket.gethostname()}"
    except Exception:
        return _RUNNER_ID_PREFIX


def main() -> int:
    """Load settings, build dependencies, and start the polling loop.

    Returns a non-zero exit code naming the invalid setting on configuration
    failure (DAC-E1-7); returns 0 only if the loop exits normally (which it
    does not in production).
    """
    try:
        settings = Settings()
    except ConfigurationError as exc:
        # DAC-E1-7: name the variable, never its value
        print(f"Configuration error: {exc}", file=sys.stderr)
        return 1

    configure_logging()

    runner_id = _make_runner_id()
    log.info("Starting ingestion runner: runner_id=%s", runner_id)

    db_url = settings.database.url.get_secret_value()

    connection = psycopg.connect(db_url)

    # CredentialAwareClientFactory: rebuilds the provider client only when the
    # API key fingerprint changes at claim time (DAC-E4-S5-7, DAC-E1-10, IR-001).
    # The factory's build_client receives the raw key value so it can construct
    # a MassiveClient using that exact credential (not the startup-time value).
    client_factory = CredentialAwareClientFactory(
        build_client=lambda key_value: _build_client_for_key(key_value, settings)
    )

    def claim_fn() -> tuple[ClaimedRun, list[int]] | None:
        """Claim the next run and snapshot the roster at claim time."""
        claimed = claim_next(connection, runner_id)
        if claimed is None:
            return None
        # Roster snapshot: read exactly once at claim time (DAC-E4-12)
        instrument_ids = active_instrument_ids(connection)
        return (claimed, instrument_ids)

    def execute_fn(token: tuple[ClaimedRun, list[int]]) -> None:
        """Execute one claimed run token."""
        claimed, instrument_ids = token
        today = date.today()
        # Re-read the credential at claim time; rebuild client only when
        # the key value changes (DAC-E4-S5-7, DAC-E1-10).
        key = read_provider_credential()
        key_value = key.get_secret_value()
        client = client_factory.get_or_rebuild(key_value)
        # Build a redaction callable from the live key value so provider
        # error messages containing the credential are scrubbed before
        # storage (AC-13, IR-003).

        def redact(s: str) -> str:
            return s.replace(key_value, "[redacted]") if key_value else s

        runner = AcquisitionRunner(
            connection=connection,
            client=client,
            today=today,
            runner_id=runner_id,
            redact=redact,
        )
        runner.execute_claimed(
            run_id=claimed.run_id,
            depth_years=claimed.history_depth_years,
            instrument_ids=instrument_ids,
        )

    run_polling_loop(
        claim_fn=claim_fn,
        execute_fn=execute_fn,
        wait_fn=time.sleep,
        poll_interval_seconds=settings.run.poll_interval_seconds,
    )
    return 0


def _build_client_for_key(key_value: str, settings: Settings) -> Any:
    """Construct a MassiveClient using the given credential value.

    Called by ``CredentialAwareClientFactory`` only when the key changes at
    claim time (DAC-E4-S5-7).  Imported here (not at module top) so that the
    boundary test ``test_ingestion_main_does_not_import_api`` can verify the
    entrypoint never touches ``factorflow.api`` at import time.

    ``key_value`` is the raw secret string re-read from the environment.
    ``settings`` provides all other MassiveSettings (base_url, rate limits,
    timeouts); only ``api_key`` is overridden with the freshly read value.
    """
    from pydantic import SecretStr

    from factorflow.ingestion.massive.client import MassiveClient
    from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor

    # Rebuild MassiveSettings with the live key, keeping all other settings
    # from the startup configuration.
    live_massive = settings.massive.model_copy(update={"api_key": SecretStr(key_value)})
    governor_settings = GovernorSettings.from_massive_settings(live_massive)
    governor = RateLimitGovernor(governor_settings)
    return MassiveClient(settings=live_massive, governor=governor)


if __name__ == "__main__":
    sys.exit(main())
