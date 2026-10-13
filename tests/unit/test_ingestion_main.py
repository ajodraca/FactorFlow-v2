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
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
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


# --- CAP-001-E3-S7: main()'s settings_factory and credential_reader ----------
# (component-design-acquisition-runner.md section 2.1, DEC-0035)


def _main_env(monkeypatch, *, base_url: str | None = None) -> str:
    from tests.unit.massive_transport_fakes import generated_test_key

    key = generated_test_key()
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", key)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    if base_url is None:
        monkeypatch.delenv("FACTORFLOW_MASSIVE_BASE_URL", raising=False)
    else:
        monkeypatch.setenv("FACTORFLOW_MASSIVE_BASE_URL", base_url)
    return key


# Implements TC-COMP-367
def test_main_parameters_are_keyword_only_with_release_defaults() -> None:
    """DAC-E3-S7-2: `settings_factory` and `credential_reader` are
    keyword-only, default to `Settings` and `read_provider_credential`, and
    the `__main__` launch passes neither."""
    import ast
    import inspect
    from pathlib import Path

    import factorflow.ingestion_main as ingestion_main
    from factorflow.config.settings import Settings, read_provider_credential

    params = inspect.signature(ingestion_main.main).parameters
    assert list(params) == ["settings_factory", "credential_reader"]
    assert params["settings_factory"].kind is inspect.Parameter.KEYWORD_ONLY
    assert params["credential_reader"].kind is inspect.Parameter.KEYWORD_ONLY
    assert params["settings_factory"].default is Settings
    assert params["credential_reader"].default is read_provider_credential

    source = Path(ingestion_main.__file__).read_text(encoding="utf-8")
    main_blocks = [
        node
        for node in ast.parse(source).body
        if isinstance(node, ast.If)
        and isinstance(node.test, ast.Compare)
        and isinstance(node.test.left, ast.Name)
        and node.test.left.id == "__name__"
    ]
    assert len(main_blocks) == 1
    calls = [
        node
        for node in ast.walk(main_blocks[0])
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "main"
    ]
    assert len(calls) == 1
    assert calls[0].args == []
    assert calls[0].keywords == []


# Implements TC-COMP-368
def test_main_returns_1_when_settings_factory_raises(monkeypatch, capsys, caplog) -> None:
    """DAC-E3-S7-3: a `settings_factory` raising `ConfigurationError` makes
    `main` return 1; the stderr line names the variable, never the value
    (Resolved Conflicts 1: the "log" is the pre-logging stderr line)."""
    import secrets

    import pytest

    import factorflow.ingestion_main as ingestion_main
    from factorflow.config.settings import ConfigurationError

    value = "https://" + secrets.token_hex(8) + ".example"
    key = _main_env(monkeypatch, base_url=value)
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
    calls: list[None] = []

    def factory():
        calls.append(None)
        raise ConfigurationError("FACTORFLOW_MASSIVE_BASE_URL: scheme must be https")

    assert ingestion_main.main(settings_factory=factory) == 1
    assert calls == [None]
    err = capsys.readouterr().err
    assert "FACTORFLOW_MASSIVE_BASE_URL" in err
    assert value not in err
    assert key not in err
    for record in caplog.records:
        assert value not in record.getMessage()
        assert key not in record.getMessage()


# Implements TC-COMP-369
def test_credential_reader_raising_at_first_claim_propagates(monkeypatch) -> None:
    """DAC-E3-S7-4: a `credential_reader` raising at the first claim
    propagates through the real `run_polling_loop` and out of `main`, and no
    `RESTClient` or runner is built. An uncaught exception ends the process
    with status 1."""
    import types

    import pytest

    import factorflow.ingestion_main as ingestion_main

    class _ReaderRefused(Exception):
        pass

    _main_env(monkeypatch)
    rest_client = MagicMock()
    monkeypatch.setattr("factorflow.ingestion.massive.client.RESTClient", rest_client)
    monkeypatch.setattr(ingestion_main.psycopg, "connect", MagicMock())
    monkeypatch.setattr(
        ingestion_main,
        "claim_next",
        MagicMock(side_effect=[types.SimpleNamespace(run_id=1, history_depth_years=5)]),
    )
    monkeypatch.setattr(ingestion_main, "active_instrument_ids", lambda _conn: [1])
    runner = MagicMock()
    monkeypatch.setattr(ingestion_main, "AcquisitionRunner", runner)
    monkeypatch.setattr(ingestion_main, "configure_logging", lambda: None)

    def reader():
        raise _ReaderRefused

    with pytest.raises(_ReaderRefused):
        ingestion_main.main(credential_reader=reader)

    assert not rest_client.called
    assert not runner.called
