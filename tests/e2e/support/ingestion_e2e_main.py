"""A test-only ingestion entry point, for the e2e acquisition stack.

Started by `scripts/run-e2e-server.sh` (`uv run python
tests/e2e/support/ingestion_e2e_main.py`), its only launcher, so the
acquisition stack's ingestion runner can reach `tests/e2e/support/
massive_stub.py` over loopback `http` (CAP-001-E3-S7). It implements clause 2a
of `component-design-runtime-config.md` section 2.2c, with items 2, 3 and 6,
under CONST-SEC 1.2 SEC-ENC-001 conditions 1 to 4 (DEC-0036):

- the provider base URL may use `http` only for a host in `_LOOPBACK_HOSTS`,
  and every other 2.2c clause applies unchanged;
- `localhost` must resolve only to loopback addresses, checked once at start;
- the provider key must be a designated test credential, generated per run
  by the script (DEC-0037), at start and at every claim;
- the provider client is built only by `factorflow.ingestion_main.main`,
  which adds no redirect, retry or proxy handling of its own here.

The release artifact never contains this file: the wheel ships `src/` only
and the `Dockerfile` copies no `tests/` path (SEC-NDG-001, DEC-0033,
DEC-0034). A test fixture, not a product contract. Not collected by pytest
(no `test_` prefix).
"""

from __future__ import annotations

import ipaddress
import re
import socket
import sys
from urllib.parse import urlsplit

from pydantic import SecretStr, field_validator
from pydantic_core import PydanticCustomError

from factorflow.config.settings import (
    _LOOPBACK_HOSTS,
    ConfigurationError,
    MassiveSettings,
    Settings,
    read_provider_credential,
)
from factorflow.ingestion_main import main

# Item 3: a designated test credential (CONST-SEC 1.2 Definitions). Used only
# with `fullmatch`, so a trailing newline is not accepted.
_TEST_CREDENTIAL = re.compile(r"TEST-ONLY-[0-9a-f]{32,}")

_TEST_CREDENTIAL_CLAUSE = "must be a designated test credential"


class _LoopbackHttpMassiveSettings(MassiveSettings):
    """`MassiveSettings` with clause 2a: `http` for a loopback host only."""

    @field_validator("base_url")
    @classmethod
    def _validate_base_url(cls, value: str) -> str:
        """Replaces the release validator of the same name (item 2)."""
        parts = urlsplit(value)
        if parts.scheme == "http" and parts.hostname in _LOOPBACK_HOSTS:
            # Item 2: every other clause unchanged -- the release validator
            # decides them on the same value with only its scheme replaced.
            result = super()._validate_base_url("https" + value[4:])
            if parts.hostname == "localhost":
                # Item 2, SEC-ENC-001 condition 2: refuse to start unless every
                # address `localhost` resolves to is a loopback address.
                try:
                    infos = socket.getaddrinfo("localhost", parts.port or 80)
                except OSError:
                    infos = []
                if not infos or not all(
                    ipaddress.ip_address(info[4][0]).is_loopback for info in infos
                ):
                    raise PydanticCustomError(
                        "base_url", "localhost must resolve only to loopback addresses"
                    )
            return value[:4] + result[5:]
        # Clause 2a covers loopback hosts only; every other value is the
        # release validator's, which refuses `http`.
        return super()._validate_base_url(value)

    @field_validator("api_key")
    @classmethod
    def _require_test_credential(cls, value: SecretStr) -> SecretStr:
        """Item 3 at start; the message never includes the key."""
        if not _TEST_CREDENTIAL.fullmatch(value.get_secret_value()):
            raise PydanticCustomError("api_key", _TEST_CREDENTIAL_CLAUSE)
        return value


def load_settings() -> Settings:
    """The settings factory passed to `main` (clause 2a, item 2)."""
    return Settings(massive=_LoopbackHttpMassiveSettings())


def read_test_credential() -> SecretStr:
    """The credential reader passed to `main`: item 3 at every claim. The
    message never includes the key."""
    key = read_provider_credential()
    if not _TEST_CREDENTIAL.fullmatch(key.get_secret_value()):
        raise ConfigurationError(f"FACTORFLOW_MASSIVE_API_KEY: {_TEST_CREDENTIAL_CLAUSE}")
    return key


if __name__ == "__main__":
    sys.exit(main(settings_factory=load_settings, credential_reader=read_test_credential))
