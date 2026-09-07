"""Log redaction: a second line of defence over the SecretStr boundary.

`SecretStr` protects the settings object, not a string someone extracted
from it. This filter catches the extracted case: it is installed on every
handler at process start, in both processes (component design section 2.5).
"""

import logging


class RedactingFilter(logging.Filter):
    """Replace known secret values anywhere in a formatted log record."""

    def __init__(self, secrets: list[str]) -> None:
        super().__init__()
        self._secrets = [s for s in secrets if s]

    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        for secret in self._secrets:
            if secret in message:
                record.msg = message.replace(secret, "[redacted]")
                record.args = ()
                message = record.getMessage()
        return True
