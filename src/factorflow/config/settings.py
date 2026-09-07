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
from typing import Any

from pydantic import Field, SecretStr, ValidationError, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from factorflow.config.redaction import RedactingFilter

_LOOPBACK_HOSTS = {"127.0.0.1", "localhost", "::1"}

_MASSIVE_API_KEY_VAR = "FACTORFLOW_MASSIVE_API_KEY"
_DATABASE_URL_VAR = "FACTORFLOW_DATABASE_URL"
_LOG_LEVEL_VAR = "FACTORFLOW_LOG_LEVEL"


class ConfigurationError(ValueError):
    """Raised when a settings model fails to load.

    Carries the same information a `ValidationError` would, formatted so
    every message names the environment variable a process operator would
    actually set, never the Python field name or the invalid value
    (DAC-E1-7).
    """


class _EnvNamedSettings(BaseSettings):
    """A `BaseSettings` whose load failures name the environment variable,
    never the Python field name or the submitted value.

    DAC-E1-7 requires a missing or malformed required value to fail start
    "naming the variable, never its value". Pydantic's default error
    formatting names the field (`api_key`) and, for some error types,
    echoes the invalid input -- accurate to Pydantic, but not what DAC-E1-7
    asks for. This catches the model's own `ValidationError` and re-raises
    a `ConfigurationError` whose message substitutes each field name for
    `<env_prefix><FIELD_NAME_UPPERCASE>`, the variable a process operator
    actually sets, and never restates the offending value.
    """

    def __init__(self, **data: Any) -> None:
        try:
            super().__init__(**data)
        except ValidationError as exc:
            prefix = self.model_config.get("env_prefix", "")
            lines = []
            for error in exc.errors(include_url=False, include_input=False):
                message = error["msg"]
                # `msg` does not reliably contain the field name (Pydantic's
                # "Field required" names nothing at all), so the variable
                # name is prefixed onto the message rather than substituted
                # into it -- substitution can silently produce a message
                # naming no variable, which is the one outcome DAC-E1-7
                # forbids.
                var_names = [
                    f"{prefix}{field_name}".upper()
                    for field_name in error["loc"]
                    if isinstance(field_name, str)
                ]
                if var_names:
                    message = f"{'.'.join(var_names)}: {message}"
                lines.append(message)
            raise ConfigurationError("; ".join(lines)) from None


class DatabaseSettings(_EnvNamedSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_DATABASE_")

    url: SecretStr
    pool_min: int = Field(default=1, ge=1)
    pool_max: int = Field(default=4, ge=1)


class ApiSettings(_EnvNamedSettings):
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


class MassiveSettings(_EnvNamedSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_MASSIVE_")

    api_key: SecretStr
    base_url: str = "https://api.massive.com"
    requests_per_minute: int = Field(ge=1)
    max_attempts: int = Field(default=3, ge=1)
    # Invariant 4 (section 2.2a) requires timeout, heartbeat and
    # poll_interval each >= 1 second specifically, not merely positive. The
    # design's illustrative snippet (section 2.3) showed only `gt=0` here;
    # `ge=1` closes that gap the same way T015's ApiSettings.host validator
    # closed the loopback-rejection gap the snippet also left open.
    timeout_seconds: float = Field(default=30.0, ge=1)
    backoff_initial_seconds: float = Field(default=2.0, gt=0)
    max_throttle_wait_seconds: float = Field(default=300.0, gt=0)


class RunSettings(_EnvNamedSettings):
    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_RUN_")

    heartbeat_seconds: float = Field(default=60.0, ge=1)
    stale_after_seconds: float = Field(default=900.0, gt=0)
    poll_interval_seconds: float = Field(default=5.0, ge=1)


class Settings(_EnvNamedSettings):
    """The top-level settings aggregate.

    Composes every sub-settings model and enforces the timing invariants from
    component design section 2.2a, which relate values across `run` and
    `massive` and so cannot be checked by either model alone.
    """

    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_")

    database: DatabaseSettings = Field(default_factory=DatabaseSettings)  # type: ignore[arg-type]
    api: ApiSettings = Field(default_factory=ApiSettings)
    massive: MassiveSettings = Field(default_factory=MassiveSettings)  # type: ignore[arg-type]
    run: RunSettings = Field(default_factory=RunSettings)
    # Component design section 2.2, SA-LOG-001: both processes, optional,
    # default INFO. It has no prefix-group siblings of its own (unlike
    # `run`/`massive`/`api`), so it lives directly on the top-level model
    # under the bare `FACTORFLOW_` prefix rather than a nested sub-model.
    log_level: str = "INFO"

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
    """Make every log record pass through `RedactingFilter`, in both
    processes, regardless of setup order or which logger a record
    originates from.

    Seeded with the current secret values (component design section 2.5:
    "installed on every handler at process start, in both processes"). This
    is the second line of defence over the `SecretStr` boundary: it catches
    a value someone has already extracted from a settings object and
    formatted into a log message, including through a third-party logger.

    Attaching the filter only to `logging.getLogger().handlers` is not
    sufficient on its own and was found to leak the credential in two ways:
    a handler attached to a *child* logger (the common case — a library or
    `logging.basicConfig()` typically attaches to root, but a handler can be
    attached anywhere) does not run root's filters, because `Filter`s on a
    `Logger` only apply to records logged directly on that logger, never to
    ones a descendant passes up during propagation; and a handler created
    *after* this function runs is never seen at all, since the loop over
    `root.handlers` is a one-time snapshot. Both defeat the "in both
    processes" guarantee for exactly the call orderings a real process start
    can produce.

    The robust mechanism is to patch `logging.Handler.handle` at the class
    level, once, so every handler -- existing, future, and on any logger --
    is filtered before it emits, independent of the propagation path or
    setup order. This is idempotent: calling it more than once (e.g. two
    processes importing this module) re-seeds the secret list without
    double-wrapping `Handler.handle`.
    """
    secrets = [
        os.environ.get(_DATABASE_URL_VAR, ""),
        os.environ.get(_MASSIVE_API_KEY_VAR, ""),
    ]
    redacting_filter = RedactingFilter(secrets)

    # FACTORFLOW_LOG_LEVEL (component design section 2.2, SA-LOG-001): both
    # processes, optional, default INFO.
    logging.getLogger().setLevel(os.environ.get(_LOG_LEVEL_VAR, "INFO"))

    original_handle = getattr(logging.Handler, "_unfiltered_handle", None)
    if original_handle is None:
        original_handle = logging.Handler.handle
        logging.Handler._unfiltered_handle = original_handle  # type: ignore[attr-defined]

    def _filtered_handle(self: logging.Handler, record: logging.LogRecord) -> bool:
        redacting_filter.filter(record)
        return original_handle(self, record)

    logging.Handler.handle = _filtered_handle  # type: ignore[method-assign]
