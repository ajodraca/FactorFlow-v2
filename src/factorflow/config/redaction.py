"""Log redaction: a second line of defence over the SecretStr boundary.

`SecretStr` protects the settings object, not a string someone extracted
from it. This filter catches the extracted case: it is installed on every
handler at process start, in both processes (component design section 2.5).
"""

import logging

# The attribute names a plain LogRecord carries before any caller-supplied
# `extra={...}` is added. Anything beyond this set is caller-supplied and is
# scrubbed if it is a string; this set itself is exempt since `msg` and
# `exc_text` are handled explicitly above/below.
_STANDARD_RECORD_ATTRS = frozenset(vars(logging.LogRecord("_", 0, "_", 0, "", (), None)).keys())


class RedactingFilter(logging.Filter):
    """Replace known secret values anywhere in a formatted log record.

    Covers three places a value can surface: the message itself; a
    formatted exception traceback (`exc_info`) -- realistic once
    `massive-client` exists, since a provider client error can carry the
    credential in a formatted request or header; and any string-valued
    attribute a caller attached via `logging.log(..., extra={...})`, which
    a structured formatter would otherwise serialise unfiltered.
    """

    def __init__(self, secrets: list[str]) -> None:
        super().__init__()
        self._secrets = [s for s in secrets if s]

    def _scrub(self, text: str) -> str:
        for secret in self._secrets:
            if secret in text:
                text = text.replace(secret, "[redacted]")
        return text

    def filter(self, record: logging.LogRecord) -> bool:
        message = self._scrub(record.getMessage())
        if message != record.getMessage():
            record.msg = message
            record.args = ()

        if record.exc_info:
            # Pre-format and scrub the traceback now, then clear exc_info so
            # a handler's formatter uses the scrubbed `exc_text` cache
            # instead of reformatting the raw (unscrubbed) exception later.
            formatter = logging.Formatter()
            record.exc_text = self._scrub(formatter.formatException(record.exc_info))
            record.exc_info = None

        for key, value in vars(record).items():
            if key in _STANDARD_RECORD_ATTRS:
                continue
            if isinstance(value, str):
                setattr(record, key, self._scrub(value))

        return True
