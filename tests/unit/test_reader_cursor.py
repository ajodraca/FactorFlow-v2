"""The list cursor round-trips and refuses a tampered value (CAP-002-E3-S2).

Proves DAC-E3-S2-5 (TC-COMP-121, the cursor half): the cursor is versioned, URL-safe and
bound to the set, sort and order it was issued for; every malformed or altered value raises
the one ``CursorError`` the API already maps to 422 (DEC-0246).
"""

import base64
import json
from decimal import Decimal
from typing import Any
from uuid import UUID

import pytest

from factorflow.classification import reader
from factorflow.runs import queries

SET_ID = UUID("0b0e8e7c-1111-4222-8333-444455556666")
OTHER_SET = UUID("0b0e8e7c-1111-4222-8333-444455556667")


def _decode(cursor: str, **overrides: Any) -> tuple[object, bool, str]:
    binding = {"set_id": SET_ID, "sort": "value_score", "order": "asc", **overrides}
    return reader.decode_cursor(cursor, **binding)


def _raw(payload: Any) -> str:
    text = json.dumps(payload, separators=(",", ":"))
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


def _payload(cursor: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
    return data


# Implements TC-COMP-121
def test_one_cursor_error_class() -> None:
    """The reader raises the class the API's existing 422 mapping catches."""
    assert reader.CursorError is queries.CursorError


# Implements TC-COMP-121
def test_symbol_sort_cursor_round_trips() -> None:
    cursor = reader.encode_cursor(SET_ID, "symbol", "desc", "AAPL", False, "AAPL")
    assert _decode(cursor, sort="symbol", order="desc") == ("AAPL", False, "AAPL")


# Implements TC-COMP-121
def test_factor_sort_cursor_round_trips_the_decimal_by_value() -> None:
    cursor = reader.encode_cursor(SET_ID, "value_score", "asc", Decimal("12.345600"), False, "MSFT")
    key, key_is_null, symbol = _decode(cursor)
    assert isinstance(key, Decimal) and key == Decimal("12.3456")
    assert (key_is_null, symbol) == (False, "MSFT")


# Implements TC-COMP-121
def test_null_key_cursor_round_trips() -> None:
    cursor = reader.encode_cursor(SET_ID, "growth_percentile", "desc", None, True, "ZZZ")
    assert _decode(cursor, sort="growth_percentile", order="desc") == (None, True, "ZZZ")


# Implements TC-COMP-121
def test_cursor_is_url_safe_and_versioned() -> None:
    for key in (Decimal("-0.000001"), Decimal("99999999.999999")):
        cursor = reader.encode_cursor(SET_ID, "value_score", "asc", key, False, "BRK.B")
        assert not set(cursor) & {"+", "/", "="}
        assert _payload(cursor)["v"] == 1
        assert len(_payload(cursor)["chk"]) == 16


# Implements TC-COMP-121
def test_payload_check_does_not_depend_on_field_order() -> None:
    """DEC-0246: the check is over the canonical (sorted) payload, so reordering the fields of
    an issued cursor neither alters its position nor invalidates it."""
    payload = _valid_payload()
    reordered = dict(reversed(list(payload.items())))
    assert list(reordered) != list(payload)
    assert _decode(_raw(reordered)) == (Decimal("12.345600"), False, "AAPL")


def _valid_payload() -> dict[str, Any]:
    cursor = reader.encode_cursor(SET_ID, "value_score", "asc", Decimal("12.345600"), False, "AAPL")
    return _payload(cursor)


def _altered(*, recheck: bool = True, **changes: Any) -> str:
    """The valid payload with ``changes``; its check is recomputed unless ``recheck`` is false,
    so each case exercises the rule it names rather than the payload check."""
    payload = _valid_payload()
    payload.update(changes)
    if recheck:
        payload["chk"] = reader._cursor_check(payload)
    return _raw(payload)


def _without(field: str) -> str:
    payload = _valid_payload()
    del payload[field]
    if field != "chk":
        payload["chk"] = reader._cursor_check(payload)
    return _raw(payload)


@pytest.mark.parametrize(
    "cursor",
    [
        "",
        "!!!not-base64!!!",
        base64.urlsafe_b64encode(b"not json").decode(),
        _raw(["v", 1]),
        _altered(v=2),
        _altered(v=True),
        _without("sym"),
        _without("set"),
        _without("chk"),
        _altered(null="false"),
        _altered(key="twelve"),
        _altered(key="NaN"),
        _altered(key=12.3456),
        _altered(key="12.345601", recheck=False),
        _altered(key=None),
        _altered(sym=7),
        _altered(extra=1),
        _altered(null=True),
        _altered(sym="AAPM", recheck=False),
        _altered(chk=7, recheck=False),
    ],
)
# Implements TC-COMP-121
def test_malformed_or_altered_cursor_is_refused(cursor: str) -> None:
    """DAC-E3-S2-5: structure, field types and the payload check (DEC-0246) are all enforced."""
    with pytest.raises(reader.CursorError):
        _decode(cursor)


# Implements TC-COMP-121
def test_every_single_character_flip_is_refused_or_harmless() -> None:
    """DAC-E3-S2-5: a flipped character never decodes to a silently different position."""
    original = reader.encode_cursor(
        SET_ID, "value_score", "asc", Decimal("12.345600"), False, "AAPL"
    )
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    expected = _decode(original)
    for index, char in enumerate(original):
        for replacement in alphabet:
            if replacement == char:
                continue
            flipped = original[:index] + replacement + original[index + 1 :]
            try:
                decoded = _decode(flipped)
            except reader.CursorError:
                continue
            assert decoded == expected, (index, replacement)


@pytest.mark.parametrize(
    "binding",
    [
        {"set_id": OTHER_SET},
        {"sort": "growth_score"},
        {"order": "desc"},
    ],
)
# Implements TC-COMP-121
def test_cursor_for_another_set_sort_or_order_is_refused(binding: dict[str, Any]) -> None:
    cursor = reader.encode_cursor(SET_ID, "value_score", "asc", Decimal("1"), False, "AAPL")
    with pytest.raises(reader.CursorError):
        _decode(cursor, **binding)


# Implements TC-COMP-121
def test_symbol_sort_cannot_carry_a_null_key() -> None:
    payload = _payload(reader.encode_cursor(SET_ID, "symbol", "asc", "AAPL", False, "AAPL"))
    payload.update(key=None, null=True)
    payload["chk"] = reader._cursor_check(payload)
    with pytest.raises(reader.CursorError):
        _decode(_raw(payload), sort="symbol")
    payload.update(key=7, null=False)
    payload["chk"] = reader._cursor_check(payload)
    with pytest.raises(reader.CursorError):
        _decode(_raw(payload), sort="symbol")


@pytest.mark.parametrize(
    ("sort", "key"),
    [
        ("value_score", "1E+200000"),
        ("value_score", "-1E+200000"),
        ("value_score", "1E-200000"),
        ("value_score", "1000000000000"),
        ("value_score", "-1000000000000"),
        ("value_score", "0.0000001"),
        ("growth_percentile", "1000"),
        ("growth_percentile", "-1000"),
        ("momentum_percentile", "50.0000001"),
    ],
)
# Implements TC-COMP-121
def test_key_no_stored_value_can_equal_is_refused(sort: str, key: str) -> None:
    """DAC-E3-S2-5, T018: a re-encoded cursor whose key lies outside what its column holds
    (score numeric(18,6), percentile numeric(9,6)) is a malformed cursor, refused with
    CursorError before it can reach the database as a numeric overflow."""
    cursor = reader.encode_cursor(SET_ID, sort, "asc", Decimal(key), False, "AAPL")
    with pytest.raises(reader.CursorError):
        _decode(cursor, sort=sort)


@pytest.mark.parametrize(
    ("sort", "key"),
    [
        ("value_score", "999999999999.999999"),
        ("value_score", "-999999999999.999999"),
        ("value_score", "0.000001"),
        ("value_score", "1.5000000"),
        ("growth_percentile", "999.999999"),
        ("growth_percentile", "-999.999999"),
        ("momentum_percentile", "100"),
        ("value_score", "0E-200000"),
        ("value_score", "0E+200000"),
    ],
)
# Implements TC-COMP-121
def test_key_at_the_edge_of_its_column_round_trips_at_its_scale(sort: str, key: str) -> None:
    """The decoded key is the value sent, at the column's six decimal places, so whatever
    exponent a re-encoded cursor carries, the bound parameter is one the column could hold."""
    cursor = reader.encode_cursor(SET_ID, sort, "asc", Decimal(key), False, "AAPL")
    decoded, key_is_null, symbol = _decode(cursor, sort=sort)
    assert (decoded, key_is_null, symbol) == (Decimal(key), False, "AAPL")
    assert isinstance(decoded, Decimal) and decoded.as_tuple().exponent == -6
