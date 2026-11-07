"""Keeps a Massive payload key from being left unresolved (CAP-002-E2-S2; DEC-0295)."""

from factorflow.classification import line_items


# Implements TC-COMP-059
def test_every_line_item_payload_key_is_resolved() -> None:
    assert line_items.unresolved() == []
