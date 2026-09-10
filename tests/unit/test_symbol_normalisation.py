"""Tests for the single instrument-symbol normalisation rule."""

import pytest

from factorflow.instruments.symbols import is_valid, normalise


@pytest.mark.parametrize(("raw", "expected"), [(" aapl ", "AAPL"), ("AAPL", "AAPL")])
def test_normalise_trims_and_uppercases(raw: str, expected: str) -> None:
    """Equivalent owner input resolves to one canonical symbol."""
    assert normalise(raw) == expected


@pytest.mark.parametrize("raw", ["1AAPL", "A" * 17, ""])
def test_invalid_normalised_symbols_are_rejected(raw: str) -> None:
    """Shape validation matches the instrument database constraint."""
    assert not is_valid(normalise(raw))
