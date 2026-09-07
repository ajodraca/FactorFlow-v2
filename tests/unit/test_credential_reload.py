"""Implements TC-COMP-301, TC-COMP-328 (DAC-E1-10, DAC-E1-S3-6).

`read_provider_credential()` re-reads from the environment on every call --
never cached at module level -- and `credential_fingerprint()` produces a
short, non-reversible digest used only to detect change. This story owns
`read_provider_credential()` and `credential_fingerprint()` in isolation;
`massive-client`'s `RESTClient` does not exist yet, so the "rebuild the
client" behavior itself is `acquisition-runner`'s integration, out of scope
here. A stub client stands in only to document the intended call shape and is
not exercised by these tests.
"""

import pytest

from factorflow.config.settings import credential_fingerprint, read_provider_credential

KEY_A = "sk-massive-credential-aaa"
KEY_B = "sk-massive-credential-bbb"


class TestReadProviderCredential:
    def test_reflects_the_current_environment_value(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_A)
        first = read_provider_credential()
        assert first.get_secret_value() == KEY_A

        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_B)
        second = read_provider_credential()
        assert second.get_secret_value() == KEY_B


class TestCredentialFingerprint:
    def test_changed_value_produces_a_different_fingerprint(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_A)
        first = credential_fingerprint(read_provider_credential())

        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_B)
        second = credential_fingerprint(read_provider_credential())

        assert first != second

    def test_unchanged_value_produces_the_same_fingerprint(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_A)
        first = credential_fingerprint(read_provider_credential())
        second = credential_fingerprint(read_provider_credential())
        assert first == second

    def test_fingerprint_contains_no_substring_of_the_value(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_A)
        fingerprint = credential_fingerprint(read_provider_credential())
        assert KEY_A not in fingerprint
        for start in range(len(KEY_A) - 3):
            assert KEY_A[start : start + 4] not in fingerprint

    def test_no_process_restart_or_module_level_caching(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """Rotation must be observable without reimporting the module."""
        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_A)
        before = credential_fingerprint(read_provider_credential())

        monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KEY_B)
        after = credential_fingerprint(read_provider_credential())

        assert before != after
