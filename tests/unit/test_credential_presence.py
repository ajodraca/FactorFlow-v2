"""Implements TC-COMP-300, TC-COMP-327 (DAC-E1-9, DAC-E1-S3-5).

`credential_present()` reads only whether the environment variable is set,
never its value. GET /api/health (a later story, ingestion-api) reports this
boolean, never the credential.
"""

import ast
import inspect

import pytest

from factorflow.config.settings import credential_present


class TestCredentialPresence:
    def test_true_when_variable_is_set(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "any-value-at-all")
        assert credential_present() is True

    def test_false_when_variable_is_unset(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)
        assert credential_present() is False

    def test_false_when_variable_is_empty_string(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "")
        assert credential_present() is False

    def test_no_code_path_unwraps_the_secret(self) -> None:
        """Static check: the function body never calls get_secret_value()."""
        source = inspect.getsource(credential_present)
        tree = ast.parse(source)
        calls = [
            node.func.attr
            for node in ast.walk(tree)
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
        ]
        assert "get_secret_value" not in calls

    def test_reads_the_environment_directly_not_a_cached_settings_object(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """Presence must reflect the current environment, not an import-time value."""
        monkeypatch.delenv("FACTORFLOW_MASSIVE_API_KEY", raising=False)
        assert credential_present() is False
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", "now-set")
        assert credential_present() is True
