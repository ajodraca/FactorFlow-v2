"""Runtime configuration and credential loading from the environment.

Every variable carries the `FACTORFLOW_` prefix. Both containers load all
configuration through this module; it is the capability's credential
boundary (AC-13): the provider credential never appears in the repository,
in log output, or in any rendered view.

Component design: `component-design-runtime-config.md` sections 2.2-2.6.
"""

import hashlib
import logging
import os

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from factorflow.config.redaction import RedactingFilter

_LOOPBACK_HOSTS = {"127.0.0.1", "localhost", "::1"}

_MASSIVE_API_KEY_VAR = "FACTORFLOW_MASSIVE_API_KEY"
_DATABASE_URL_VAR = "FACTORFLOW_DATABASE_URL"


class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_DATABASE_")

    url: SecretStr
    pool_min: int = Field(default=1, ge=1)
    pool_max: int = Field(default=4, ge=1)


class ApiSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_API_")

    host: str = "127.0.0.1"
    port: int = Field(default=8000, ge=1, le=65535)

    @model_validator(mode="after")
    def _reject_non_loopback_host(self) -> "ApiSettings":
        """AC-14, DAC-E1-S3-4: a non-loopback bind address is rejected at
        start, not merely defaulted away from. The design's illustrative
        snippet (section 2.3) shows only the default and omits this
        validator; DAC-E1-S3-4's own wording and TC-COMP-326 both require
        active rejection, so this fills the gap the snippet left open.
        """
        if self.host not in _LOOPBACK_HOSTS:
            raise ValueError(
                f"FACTORFLOW_API_HOST must be a loopback address "
                f"({', '.join(sorted(_LOOPBACK_HOSTS))}), got {self.host!r}"
            )
        return self


class MassiveSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_MASSIVE_")

    api_key: SecretStr
    base_url: str = "https://api.massive.com"
    requests_per_minute: int = Field(ge=1)
    max_attempts: int = Field(default=3, ge=1)
    timeout_seconds: float = Field(default=30.0, gt=0)
    backoff_initial_seconds: float = Field(default=2.0, gt=0)
    max_throttle_wait_seconds: float = Field(default=300.0, gt=0)


class RunSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_RUN_")

    heartbeat_seconds: float = Field(default=60.0, ge=1)
    stale_after_seconds: float = Field(default=900.0, gt=0)
    poll_interval_seconds: float = Field(default=5.0, ge=1)


class Settings(BaseSettings):
    """The top-level settings aggregate.

    Composes every sub-settings model and enforces the timing invariants from
    component design section 2.2a, which relate values across `run` and
    `massive` and so cannot be checked by either model alone.
    """

    database: DatabaseSettings = Field(default_factory=DatabaseSettings)  # type: ignore[arg-type]
    api: ApiSettings = Field(default_factory=ApiSettings)
    massive: MassiveSettings = Field(default_factory=MassiveSettings)  # type: ignore[arg-type]
    run: RunSettings = Field(default_factory=RunSettings)

    @model_validator(mode="after")
    def _check_timing_invariants(self) -> "Settings":
        """Section 2.2a's invariants, enforced at load.

        A violated relationship produces a run that fails intermittently
        under a slow provider rather than an error at start, so these refuse
        to start.
        """
        run, massive = self.run, self.massive

        if run.stale_after_seconds <= run.heartbeat_seconds * 3:
            raise ValueError(
                "FACTORFLOW_RUN_STALE_AFTER_SECONDS must exceed "
                "FACTORFLOW_RUN_HEARTBEAT_SECONDS * 3; a window narrower "
                "than a few heartbeats reclaims healthy runs"
            )

        worst_case = (
            massive.max_attempts * massive.timeout_seconds * 4
        ) + massive.max_throttle_wait_seconds
        if run.stale_after_seconds <= worst_case:
            raise ValueError(
                f"FACTORFLOW_RUN_STALE_AFTER_SECONDS must exceed "
                f"{worst_case:.0f}s, the worst case for one instrument "
                "(4 data types x max_attempts x timeout, plus the throttle "
                "wait budget)"
            )

        if run.poll_interval_seconds >= run.stale_after_seconds:
            raise ValueError(
                "FACTORFLOW_RUN_POLL_INTERVAL_SECONDS must be less than "
                "FACTORFLOW_RUN_STALE_AFTER_SECONDS"
            )

        return self


def read_provider_credential() -> SecretStr:
    """Re-read the provider key from the environment.

    Called by the runner at claim time, not at import. The value is never
    cached at module level, which is what makes rotation observable
    (component design section 2.2b, SEC-SEC-002).
    """
    return SecretStr(os.environ.get(_MASSIVE_API_KEY_VAR, ""))


def credential_fingerprint(key: SecretStr) -> str:
    """A short, non-reversible digest used only to detect change.

    SHA-256 of the value, truncated. Never the value, never logged in full,
    and never compared against anything but another fingerprint.
    """
    digest = hashlib.sha256(key.get_secret_value().encode("utf-8")).hexdigest()
    return digest[:16]


def credential_present() -> bool:
    """Whether the provider credential is set in the environment.

    Reads presence only, never the value: `GET /api/health` (a later story,
    ingestion-api) reports this boolean rather than the credential
    (component design section 2.6, DAC-E1-S3-5).
    """
    return bool(os.environ.get(_MASSIVE_API_KEY_VAR, ""))


def configure_logging() -> None:
    """Install `RedactingFilter` on every handler, in both processes.

    Seeded with the current secret values (component design section 2.5:
    "installed on every handler at process start, in both processes"). This
    is the second line of defence over the `SecretStr` boundary: it catches
    a value someone has already extracted from a settings object and
    formatted into a log message, including through a third-party logger.
    """
    secrets = [
        os.environ.get(_DATABASE_URL_VAR, ""),
        os.environ.get(_MASSIVE_API_KEY_VAR, ""),
    ]
    redacting_filter = RedactingFilter(secrets)
    root = logging.getLogger()
    root.addFilter(redacting_filter)
    for handler in root.handlers:
        handler.addFilter(redacting_filter)
