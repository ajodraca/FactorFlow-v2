"""Database operations for the owner-managed instrument list.

The unique ``idx_instrument_symbol`` index is created by migration 0001
(``0001_extensions_owner_state.sql``), delivered by CAP-001-E1-S1.
"""

from dataclasses import dataclass
from enum import StrEnum

import psycopg

from factorflow.instruments.symbols import is_valid, normalise


class Disposition(StrEnum):
    """The outcome of processing one supplied symbol."""

    ADDED = "added"
    REACTIVATED = "reactivated"
    DUPLICATE_ACTIVE = "duplicate_active"
    MALFORMED = "malformed"


@dataclass(frozen=True)
class SymbolOutcome:
    """The classification of one owner-supplied symbol."""

    input_symbol: str
    normalised_symbol: str | None
    disposition: Disposition


class InstrumentNotFound(Exception):
    """Raised when retirement targets no stored instrument."""


class AlreadyRetired(Exception):
    """Raised when retirement targets an already-retired instrument."""


@dataclass(frozen=True)
class InstrumentFilters:
    """Keyset-page inputs for the instrument list."""

    page_size: int
    symbol_prefix: str | None = None
    lifecycle: str | None = None
    cursor: str | None = None


@dataclass(frozen=True)
class Instrument:
    """One persisted instrument returned by the list read."""

    instrument_id: int
    symbol: str
    lifecycle: str


@dataclass(frozen=True)
class InstrumentPage:
    """A keyset page and whole-list lifecycle counts."""

    rows: list[Instrument]
    next_cursor: str | None
    active_count: int
    retired_count: int


def add_symbols(connection: psycopg.Connection, raw_symbols: list[str]) -> list[SymbolOutcome]:
    """Add or reactivate symbols in one transaction.

    Invalid symbols and active duplicates are reported but never written.
    """
    outcomes: list[SymbolOutcome] = []
    lifecycle_by_symbol: dict[str, str | None] = {}
    symbols_to_add: list[str] = []
    symbols_to_reactivate: list[str] = []

    with connection.transaction():
        with connection.cursor() as cursor:
            for raw_symbol in raw_symbols:
                symbol = normalise(raw_symbol)
                if not is_valid(symbol):
                    outcomes.append(SymbolOutcome(raw_symbol, None, Disposition.MALFORMED))
                    continue

                lifecycle = lifecycle_by_symbol.get(symbol)
                if lifecycle is None and symbol not in lifecycle_by_symbol:
                    cursor.execute("SELECT lifecycle FROM instrument WHERE symbol = %s", (symbol,))
                    row = cursor.fetchone()
                    lifecycle = row[0] if row is not None else None

                if lifecycle is None:
                    outcomes.append(SymbolOutcome(raw_symbol, symbol, Disposition.ADDED))
                    symbols_to_add.append(symbol)
                    lifecycle_by_symbol[symbol] = "active"
                elif lifecycle == "retired":
                    outcomes.append(SymbolOutcome(raw_symbol, symbol, Disposition.REACTIVATED))
                    symbols_to_reactivate.append(symbol)
                    lifecycle_by_symbol[symbol] = "active"
                else:
                    outcomes.append(SymbolOutcome(raw_symbol, symbol, Disposition.DUPLICATE_ACTIVE))

            if symbols_to_add:
                cursor.executemany(
                    "INSERT INTO instrument (symbol, lifecycle) VALUES (%s, 'active')",
                    [(symbol,) for symbol in symbols_to_add],
                )
            if symbols_to_reactivate:
                cursor.executemany(
                    "UPDATE instrument SET lifecycle = 'active', retired_at = NULL "
                    "WHERE symbol = %s",
                    [(symbol,) for symbol in symbols_to_reactivate],
                )

    return outcomes


def retire_symbol(connection: psycopg.Connection, symbol: str) -> None:
    """Retire one known active instrument without deleting any data."""
    normalised_symbol = normalise(symbol)
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT lifecycle FROM instrument WHERE symbol = %s", (normalised_symbol,)
            )
            row = cursor.fetchone()
            if row is None:
                raise InstrumentNotFound(normalised_symbol)
            if row[0] == "retired":
                raise AlreadyRetired(normalised_symbol)
            cursor.execute(
                "UPDATE instrument SET lifecycle = 'retired', retired_at = now() WHERE symbol = %s",
                (normalised_symbol,),
            )


def list_instruments(connection: psycopg.Connection, filters: InstrumentFilters) -> InstrumentPage:
    """Return one symbol-keyset page with whole-list lifecycle counts."""
    predicates: list[str] = []
    parameters: list[object] = []
    if filters.symbol_prefix is not None:
        predicates.append("symbol LIKE %s")
        parameters.append(f"{normalise(filters.symbol_prefix)}%")
    if filters.lifecycle is not None:
        predicates.append("lifecycle = %s")
        parameters.append(filters.lifecycle)
    if filters.cursor is not None:
        predicates.append("symbol > %s")
        parameters.append(normalise(filters.cursor))

    where_clause = f" WHERE {' AND '.join(predicates)}" if predicates else ""
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT instrument_id, symbol, lifecycle FROM instrument"
            f"{where_clause} ORDER BY symbol LIMIT %s",
            (*parameters, filters.page_size + 1),
        )
        result_rows = cursor.fetchall()
        cursor.execute(
            "SELECT count(*) FILTER (WHERE lifecycle = 'active'), "
            "count(*) FILTER (WHERE lifecycle = 'retired') FROM instrument"
        )
        counts = cursor.fetchone()
        assert counts is not None
        active_count, retired_count = counts

    has_next_page = len(result_rows) > filters.page_size
    rows = [Instrument(*row) for row in result_rows[: filters.page_size]]
    next_cursor = rows[-1].symbol if has_next_page else None
    return InstrumentPage(rows, next_cursor, active_count, retired_count)


def active_instrument_ids(connection: psycopg.Connection) -> list[int]:
    """Return active IDs in stable symbol order for acquisition-run claiming."""
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT instrument_id FROM instrument WHERE lifecycle = 'active' ORDER BY symbol"
        )
        return [row[0] for row in cursor.fetchall() or []]
