"""Deterministic observation-value hashing tests (CAP-001-E4-S2)."""

import hashlib
from decimal import Decimal

import pytest

from factorflow.ingestion.hashing import canonical_json, value_hash


class UnsupportedValue:
    def __str__(self) -> str:
        return "silently-coerced"


# Implements TC-COMP-137
def test_canonical_json_sorts_nested_keys_and_uses_compact_separators() -> None:
    value = {"z": 1, "items": [{"b": 2, "a": 1}], "a": "first"}

    assert canonical_json(value) == b'{"a":"first","items":[{"a":1,"b":2}],"z":1}'


# Implements TC-COMP-157
def test_dictionary_insertion_order_does_not_change_value_hash() -> None:
    first = {"close": Decimal("123.45"), "volume": 100, "flags": {"b": True, "a": None}}
    reordered = {"flags": {"a": None, "b": True}, "volume": 100, "close": Decimal("123.45")}

    assert value_hash(first) == value_hash(reordered)


# Implements TC-COMP-158
def test_nested_decimals_render_as_exact_strings_and_preserve_scale() -> None:
    with_trailing_zero = {"quote": {"price": Decimal("1.10")}}
    without_trailing_zero = {"quote": {"price": Decimal("1.1")}}

    assert canonical_json(with_trailing_zero) == b'{"quote":{"price":"1.10"}}'
    assert canonical_json(without_trailing_zero) == b'{"quote":{"price":"1.1"}}'
    assert value_hash(with_trailing_zero) != value_hash(without_trailing_zero)


# Implements TC-COMP-159
def test_float_value_raises_instead_of_entering_the_digest() -> None:
    with pytest.raises(TypeError):
        value_hash({"price": 1.1})


# Implements TC-COMP-159
def test_unsupported_object_raises_instead_of_being_coerced() -> None:
    with pytest.raises(TypeError):
        value_hash({"price": UnsupportedValue()})


# Implements TC-COMP-006, TC-COMP-137, TC-COMP-160
def test_identical_input_returns_the_same_raw_sha256_digest() -> None:
    value = {"price": Decimal("12.50"), "volume": 10}

    first_digest = value_hash(value)
    second_digest = value_hash(value)

    assert first_digest == second_digest
    assert first_digest == hashlib.sha256(canonical_json(value)).digest()
    assert isinstance(first_digest, bytes)
    assert len(first_digest) == 32


# Implements TC-COMP-005, TC-COMP-161
def test_changed_field_changes_the_digest() -> None:
    original = {"price": Decimal("12.50"), "volume": 10}
    restated = {"price": Decimal("12.51"), "volume": 10}

    assert value_hash(original) != value_hash(restated)


def test_unsupported_value_nested_in_dictionary_raises_without_string_fallback() -> None:
    with pytest.raises(TypeError):
        value_hash({"outer": {"unsupported": UnsupportedValue()}})


def test_unsupported_value_nested_in_list_raises_without_string_fallback() -> None:
    with pytest.raises(TypeError):
        value_hash({"items": ["valid", UnsupportedValue()]})
