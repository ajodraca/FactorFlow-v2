"""Implements TC-COMP-299 (partial: memory-only holding), TC-COMP-013,
TC-COMP-324 (DAC-E1-8, DAC-E1-S3-2).

The secret-wrapping type's `repr`/`str`/`model_dump`/`model_dump_json` must
never expose the wrapped value. This is `SecretStr`'s own contract; the test
exists to prove this story actually wraps the credential and database URL in
it, rather than leaving them as plain `str` fields.
"""

import pytest

from factorflow.config.settings import DatabaseSettings, MassiveSettings

KNOWN_DB_URL = "postgresql://owner:s3cr3t-db-password@localhost/factorflow"
KNOWN_API_KEY = "TEST-FIXTURE-CREDENTIAL-abc123"


@pytest.fixture
def database_settings(monkeypatch: pytest.MonkeyPatch) -> DatabaseSettings:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", KNOWN_DB_URL)
    return DatabaseSettings(_env_file=None)  # type: ignore[call-arg]


@pytest.fixture
def massive_settings(monkeypatch: pytest.MonkeyPatch) -> MassiveSettings:
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", KNOWN_API_KEY)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    return MassiveSettings(_env_file=None)  # type: ignore[call-arg]


def _assert_secret_absent(rendered: str, secret: str) -> None:
    assert secret not in rendered


class TestDatabaseSettingsSecrecy:
    def test_repr_contains_no_secret(self, database_settings: DatabaseSettings) -> None:
        _assert_secret_absent(repr(database_settings), KNOWN_DB_URL)

    def test_str_contains_no_secret(self, database_settings: DatabaseSettings) -> None:
        _assert_secret_absent(str(database_settings), KNOWN_DB_URL)

    def test_model_dump_contains_no_secret(self, database_settings: DatabaseSettings) -> None:
        _assert_secret_absent(str(database_settings.model_dump()), KNOWN_DB_URL)

    def test_model_dump_json_contains_no_secret(self, database_settings: DatabaseSettings) -> None:
        _assert_secret_absent(database_settings.model_dump_json(), KNOWN_DB_URL)


class TestMassiveSettingsSecrecy:
    def test_repr_contains_no_secret(self, massive_settings: MassiveSettings) -> None:
        _assert_secret_absent(repr(massive_settings), KNOWN_API_KEY)

    def test_str_contains_no_secret(self, massive_settings: MassiveSettings) -> None:
        _assert_secret_absent(str(massive_settings), KNOWN_API_KEY)

    def test_model_dump_contains_no_secret(self, massive_settings: MassiveSettings) -> None:
        _assert_secret_absent(str(massive_settings.model_dump()), KNOWN_API_KEY)

    def test_model_dump_json_contains_no_secret(self, massive_settings: MassiveSettings) -> None:
        _assert_secret_absent(massive_settings.model_dump_json(), KNOWN_API_KEY)
