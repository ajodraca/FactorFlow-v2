"""Classification scheduler settings (FACTORFLOW_CLASSIFICATION_*; DEC-0054, DEC-0067)."""

from pydantic import Field, model_validator
from pydantic_settings import SettingsConfigDict

from factorflow.config.settings import _EnvNamedSettings


class ClassificationSettings(_EnvNamedSettings):
    """FACTORFLOW_CLASSIFICATION_* (system design constraint 10; DEC-0054, DEC-0067)."""

    model_config = SettingsConfigDict(env_prefix="FACTORFLOW_CLASSIFICATION_")

    poll_interval_seconds: float = Field(default=5.0, ge=1)
    build_timeout_seconds: float = Field(default=300.0, ge=1)

    @model_validator(mode="after")
    def _poll_must_be_below_timeout(self) -> "ClassificationSettings":
        """A poll that outlasts a build makes the loop observe its own work late.

        The message names the two variables and never their values (DAC-E1-7).
        """
        if self.poll_interval_seconds >= self.build_timeout_seconds:
            raise ValueError(
                "FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS must be less than "
                "FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS"
            )
        return self
