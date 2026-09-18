"""Deterministic fingerprints for observation values (CAP-001-E4-S2)."""

from __future__ import annotations

import hashlib
import json
from decimal import Decimal
from typing import Any

type CanonicalValue = None | bool | int | str | list[CanonicalValue] | dict[str, CanonicalValue]


def _canonicalize(value: Any) -> CanonicalValue:
    if value is None or isinstance(value, (bool, int, str)):
        return value
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, float):
        raise TypeError("float values are not supported for deterministic hashing")
    if isinstance(value, list):
        return [_canonicalize(item) for item in value]
    if isinstance(value, dict):
        if not all(isinstance(key, str) for key in value):
            raise TypeError("dictionary keys must be strings for deterministic hashing")
        return {key: _canonicalize(item) for key, item in value.items()}
    raise TypeError(f"unsupported value type for deterministic hashing: {type(value).__name__}")


def canonical_json(value: dict[str, Any]) -> bytes:
    """Return sorted, compact UTF-8 JSON with decimals preserved as strings."""
    canonical_value = _canonicalize(value)
    return json.dumps(canonical_value, sort_keys=True, separators=(",", ":")).encode("utf-8")


def value_hash(value: dict[str, Any]) -> bytes:
    """Return the raw SHA-256 digest of an observation-value dictionary."""
    return hashlib.sha256(canonical_json(value)).digest()
