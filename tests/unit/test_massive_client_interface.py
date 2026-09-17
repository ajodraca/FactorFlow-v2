"""`MassiveClient` public-interface tests (CAP-001-E3-S1).

Component design: `component-design-massive-client.md` section 2.3 (the
four named operations) and section 8, acceptance criterion 1. DAC-E3-14
requires this interface to leave room for the M3 streaming half without
redefinition -- named per-data-type methods rather than one generic
provider-path operation are what makes that possible.
"""

import inspect
from datetime import date

from factorflow.ingestion.massive import models
from factorflow.ingestion.massive.client import MassiveClient

# --- TC-COMP-195 / DAC-E3-1: one operation per data type -----------------


def test_exposes_exactly_the_four_named_read_operations() -> None:
    """DAC-E3-1: the client exposes one operation per data type, not a
    generic `get(path)` that would push Massive's URL shapes onto the
    runner (component design section 2.3)."""
    public_methods = {
        name
        for name, _ in inspect.getmembers(MassiveClient, predicate=inspect.isfunction)
        if not name.startswith("_")
    }

    assert public_methods == {
        "fetch_reference",
        "fetch_daily_bars",
        "fetch_financials",
        "fetch_corporate_actions",
    }


def test_fetch_reference_signature_accepts_a_symbol_only() -> None:
    """DAC-E3-1: reference is a single-symbol read (component design
    section 2.5, DAC-E3-S1-4) -- it takes no date range."""
    signature = inspect.signature(MassiveClient.fetch_reference)
    params = list(signature.parameters)[1:]  # drop `self`

    assert params == ["symbol"]
    assert signature.return_annotation in (
        models.TickerReference,
        "models.TickerReference",
        "TickerReference",
    )


def test_fetch_daily_bars_signature_accepts_symbol_and_date_range() -> None:
    signature = inspect.signature(MassiveClient.fetch_daily_bars)
    params = list(signature.parameters)[1:]

    assert params == ["symbol", "start", "end"]
    for name in ("start", "end"):
        annotation = signature.parameters[name].annotation
        assert annotation in (date, "date")


def test_fetch_financials_signature_accepts_symbol_and_date_range() -> None:
    signature = inspect.signature(MassiveClient.fetch_financials)
    params = list(signature.parameters)[1:]

    assert params == ["symbol", "start", "end"]


def test_fetch_corporate_actions_signature_accepts_symbol_and_date_range() -> None:
    signature = inspect.signature(MassiveClient.fetch_corporate_actions)
    params = list(signature.parameters)[1:]

    assert params == ["symbol", "start", "end"]


# --- TC-COMP-208 / DAC-E3-14: leaves room for the M3 streaming half ------


def test_client_carries_no_streaming_or_websocket_members_yet() -> None:
    """DAC-E3-14: the interface does not foreclose the M3 streaming half --
    it currently defines exactly the four historical reads and no
    provider-path-shaped catch-all a streaming method would have to be
    squeezed beside."""
    public_methods = {
        name
        for name, _ in inspect.getmembers(MassiveClient, predicate=inspect.isfunction)
        if not name.startswith("_")
    }
    forbidden = {"get", "request", "call", "stream", "subscribe"}

    assert public_methods.isdisjoint(forbidden)
