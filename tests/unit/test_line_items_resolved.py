"""Keeps the unresolved Massive payload keys from being forgotten (CAP-002-E2-S2)."""

import pytest

from factorflow.classification import line_items


# Implements TC-COMP-059
@pytest.mark.xfail(
    strict=True,
    reason="[REQUIRES INPUT] Massive payload keys for the seven line items: "
    "system design section 8 question 1",
)
def test_every_line_item_payload_key_is_resolved() -> None:
    assert line_items.unresolved() == []
