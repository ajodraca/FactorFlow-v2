"""Canonical instrument-symbol normalisation and shape validation."""

import re

SYMBOL_PATTERN = re.compile(r"^[A-Z][A-Z0-9.-]{0,15}$")


def normalise(raw: str) -> str:
    """Trim and uppercase an owner-supplied instrument symbol."""
    return raw.strip().upper()


def is_valid(symbol: str) -> bool:
    """Return whether a normalised symbol matches the database shape constraint."""
    return SYMBOL_PATTERN.fullmatch(symbol) is not None
