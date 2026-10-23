"""Pure-function tests for ``universes/service.py``: names, symbols, exceptions, re-exports.

No database. Satisfies the validation half of DAC-E1-S3-1 through DAC-E1-S3-3
(CAP-002-E1-S3): the helpers every write function calls before it touches the
store, the exception contract of design 2.3, the lock key and the DEC-0093
re-export of the replayed types.
"""

from uuid import uuid4

import pytest

from factorflow.api.bounds import MAX_SYMBOLS_PER_REQUEST
from factorflow.universes import replay, service
from factorflow.universes.service import (
    ClassificationSetChanged,
    EmptyUniverse,
    InstrumentNotAcquired,
    LastMember,
    NotAMember,
    UniverseNameInUse,
    UniverseNotFound,
    UniverseRetired,
)

# --- (a) _normalise_name ------------------------------------------------------------


def test_name_is_trimmed() -> None:
    assert service._normalise_name("  Tech \t") == "Tech"


@pytest.mark.parametrize("name", ["", "   ", "\t\n"])
def test_empty_or_whitespace_name_is_a_shape_failure(name: str) -> None:
    with pytest.raises(ValueError):
        service._normalise_name(name)


def test_name_has_no_length_bound() -> None:
    long_name = "x" * 10_000
    assert service._normalise_name(long_name) == long_name


def test_name_is_not_case_folded() -> None:
    assert service._normalise_name(" growth ") == "growth"


# --- (b) _normalise_symbols ---------------------------------------------------------


def test_symbols_are_uppercased_trimmed_deduplicated_and_sorted() -> None:
    assert service._normalise_symbols([" msft", "aapl", "AAPL", "nvda "]) == [
        "AAPL",
        "MSFT",
        "NVDA",
    ]


def test_symbols_may_be_empty() -> None:
    assert service._normalise_symbols([]) == []


@pytest.mark.parametrize("bad", ["1ABC", "A B", "A" * 17, "", "   "])
def test_an_invalid_symbol_is_refused_and_named(bad: str) -> None:
    with pytest.raises(ValueError) as excinfo:
        service._normalise_symbols(["AAPL", bad])
    assert repr(bad.strip().upper()) in str(excinfo.value)


def test_a_symbol_of_the_longest_valid_shape_is_accepted() -> None:
    assert service._normalise_symbols(["A" * 16, "BRK.B", "A-1"]) == ["A-1", "A" * 16, "BRK.B"]


# --- (c) the request cap ------------------------------------------------------------


def _symbols(count: int) -> list[str]:
    return [f"S{n:04d}" for n in range(count)]


def test_the_cap_is_the_api_bound() -> None:
    assert MAX_SYMBOLS_PER_REQUEST == 1000


def test_exactly_the_cap_passes() -> None:
    assert len(service._normalise_symbols(_symbols(MAX_SYMBOLS_PER_REQUEST))) == 1000


def test_one_over_the_cap_is_refused() -> None:
    with pytest.raises(ValueError, match="1000"):
        service._normalise_symbols(_symbols(MAX_SYMBOLS_PER_REQUEST + 1))


def test_the_cap_counts_the_raw_list_before_deduplication() -> None:
    with pytest.raises(ValueError):
        service._normalise_symbols(["AAPL"] * (MAX_SYMBOLS_PER_REQUEST + 1))


def test_the_cap_is_checked_before_the_shape_of_any_symbol() -> None:
    with pytest.raises(ValueError, match="1000"):
        service._normalise_symbols(["1BAD"] * (MAX_SYMBOLS_PER_REQUEST + 1))


# --- (d) exception contract ---------------------------------------------------------


def test_instrument_not_acquired_exposes_sorted_symbols_as_a_copy() -> None:
    given = ["B", "A"]
    exc = InstrumentNotAcquired(given)
    assert exc.symbols == ["A", "B"]
    assert given == ["B", "A"]
    assert exc.symbols is not given
    assert "A" in str(exc) and "B" in str(exc)


def test_instrument_not_acquired_mutation_of_the_source_does_not_leak() -> None:
    given = ["B", "A"]
    exc = InstrumentNotAcquired(given)
    given.append("C")
    assert exc.symbols == ["A", "B"]


@pytest.mark.parametrize("cls", [UniverseNotFound, NotAMember])
def test_lookup_exceptions(cls: type[Exception]) -> None:
    assert issubclass(cls, LookupError)
    assert not issubclass(cls, ValueError)


@pytest.mark.parametrize(
    "cls",
    [
        UniverseRetired,
        UniverseNameInUse,
        EmptyUniverse,
        LastMember,
        InstrumentNotAcquired,
        ClassificationSetChanged,
    ],
)
def test_value_exceptions(cls: type[Exception]) -> None:
    assert issubclass(cls, ValueError)
    assert not issubclass(cls, LookupError)


def test_classification_set_changed_exposes_both_ids() -> None:
    requested, current = uuid4(), uuid4()
    exc = ClassificationSetChanged(requested, current)
    assert exc.requested_set_id == requested
    assert exc.current_set_id == current
    assert ClassificationSetChanged(requested, None).current_set_id is None


# --- (e) the lock key ---------------------------------------------------------------


def test_the_write_lock_key() -> None:
    assert service.UNIVERSE_WRITE_LOCK_KEY == 2002_0001


# --- (f) re-exports -----------------------------------------------------------------


@pytest.mark.parametrize("name", ["Member", "Origin", "Universe", "UniverseEvent"])
def test_replayed_types_are_the_replay_objects(name: str) -> None:
    assert getattr(service, name) is getattr(replay, name)
    assert name in service.__all__


def test_all_names_in_dunder_all_resolve() -> None:
    for name in service.__all__:
        assert hasattr(service, name), name
