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

from factorflow.config.settings import ConfigurationError, Settings, configure_logging
from factorflow.ingestion.runner import AcquisitionRunner, run_polling_loop
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
        runner = AcquisitionRunner(
            connection=connection,
            client=_build_client(settings),
            today=today,
            runner_id=runner_id,
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


def _build_client(settings: Settings) -> Any:
    """Construct a MassiveClient from settings.

    Imported here (not at module top) so that the boundary test
    ``test_ingestion_main_does_not_import_api`` can verify the entrypoint
    never touches ``factorflow.api`` at import time.
    """
    from factorflow.ingestion.massive.client import MassiveClient
    from factorflow.ingestion.rate_limit import GovernorSettings, RateLimitGovernor

    governor_settings = GovernorSettings.from_massive_settings(settings.massive)
    governor = RateLimitGovernor(governor_settings)
    return MassiveClient(settings=settings.massive, governor=governor)


if __name__ == "__main__":
    sys.exit(main())
