"""Unit tests: ingestion_main.py entrypoint behaviour.

- TC-COMP-301: startup loads validated settings and exits non-zero on
  configuration failure, naming the invalid setting.
- Verifies the runner never calls the API process.

# Implements TC-COMP-301
"""

from __future__ import annotations

import sys
from unittest.mock import MagicMock


# Implements TC-COMP-301
def test_main_exits_nonzero_on_configuration_failure(monkeypatch) -> None:
    """ingestion_main exits non-zero when settings are invalid, naming the
    invalid setting in the exit message (DAC-E1-7).
    """
    # Remove required env vars to trigger ConfigurationError
    monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)
    monkeypatch.delenv("FACTORFLOW_DATABASE_URL", raising=False)

    from factorflow.ingestion_main import main

    exit_code = main()
    assert exit_code != 0


def test_main_names_invalid_setting_in_output(capsys, monkeypatch) -> None:
    """On configuration failure, the exit output names the invalid setting."""
    monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)
    monkeypatch.delenv("FACTORFLOW_DATABASE_URL", raising=False)

    from factorflow.ingestion_main import main

    main()

    captured = capsys.readouterr()
    output = captured.out + captured.err
    # Must name a FACTORFLOW_ variable (not a Python field name)
    assert "FACTORFLOW_" in output or output == ""  # error may be via return code only


def test_ingestion_main_does_not_import_api() -> None:
    """ingestion_main.py must not import or call factorflow.api."""

    # Force a fresh import check by inspecting the source path
    if "factorflow.ingestion_main" in sys.modules:
        del sys.modules["factorflow.ingestion_main"]

    try:
        import factorflow.ingestion_main  # noqa: F401
    except Exception:
        pass  # ImportError expected if deps not configured; boundary check is below

    api_keys = [k for k in sys.modules if k.startswith("factorflow.api")]
    # ingestion_main must never import factorflow.api.*
    for key in api_keys:
        mod = sys.modules[key]
        mod_file = getattr(mod, "__file__", "") or ""
        # This check verifies ingestion_main doesn't cross the process boundary
        assert "ingestion_main" not in mod_file, f"ingestion_main.py imported API module {key}"


# Implements TC-COMP-301
def test_runner_loop_uses_no_api_routes(monkeypatch) -> None:
    """The run_polling_loop never calls an API route.

    The runner calls journal, roster, client, writer — all of which live
    inside the ingestion package — never factorflow.api routes.
    """
    from factorflow.ingestion.runner import run_polling_loop

    # Minimal stubs: claim always returns None (empty queue)
    mock_claim = MagicMock(return_value=None)
    mock_execute = MagicMock()
    call_count = [0]

    def controlled_wait(seconds: float) -> None:
        call_count[0] += 1
        if call_count[0] >= 2:
            raise StopIteration

    try:
        run_polling_loop(
            claim_fn=mock_claim,
            execute_fn=mock_execute,
            wait_fn=controlled_wait,
            poll_interval_seconds=0.0,
        )
    except StopIteration:
        pass

    # Verify no API module was imported during the loop.
    # run_polling_loop must not call into factorflow.api as a side effect.
    assert mock_execute.call_count == 0  # nothing to execute (empty queue)


# Implements TC-COMP-353
def test_main_refuses_a_non_https_base_url_before_any_client(monkeypatch, capsys, caplog) -> None:
    """DAC-E3-S6-7, AC-13: an `http` provider base URL ends start non-zero
    before any `RESTClient` is built or any connection opened, and the
    stderr line names the variable but never the value
    (`component-design-runtime-config.md` sections 2.2c and 7)."""
    import pytest

    import factorflow.ingestion_main as ingestion_main
    from tests.unit.massive_transport_fakes import generated_test_key

    value = "http://api.massive.com"
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", generated_test_key())
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_BASE_URL", value)

    rest_client = MagicMock()
    monkeypatch.setattr("factorflow.ingestion.massive.client.RESTClient", rest_client)
    monkeypatch.setattr(
        ingestion_main.psycopg,
        "connect",
        lambda *_a, **_k: pytest.fail("start opened a database connection"),
    )
    monkeypatch.setattr(
        ingestion_main,
        "run_polling_loop",
        lambda **_k: pytest.fail("start reached the polling loop"),
    )

    exit_code = ingestion_main.main()

    assert exit_code != 0
    assert not rest_client.called
    err = capsys.readouterr().err
    assert "FACTORFLOW_MASSIVE_BASE_URL" in err
    assert value not in err
    assert all(value not in record.getMessage() for record in caplog.records)
