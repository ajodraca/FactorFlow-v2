"""The owner's stated history depth setting.

Held in ``owner_setting`` (created by migration ``0001_extensions_owner_state.sql``,
delivered by CAP-001-E1-S1) as a ``jsonb`` value under the fixed key
``history_depth_years``, so a later setting needs no schema change.

``None`` is a real state, not an error and not a zero (AC-2): every caller
distinguishes "the owner has never stated a depth" from "the owner stated
zero," which is why the read returns ``HistoryDepth | None`` rather than a
bare ``int``. No upper bound is enforced here — a depth beyond what the
provider plan holds is issued as stated (DAC-E2-12, DAC-E2-S2-5); the
product tells the owner the truth about what was actually acquired instead
of silently truncating the request.
"""

from dataclasses import dataclass
from datetime import datetime

import psycopg
from psycopg.types.json import Json

HISTORY_DEPTH_KEY = "history_depth_years"


@dataclass(frozen=True)
class HistoryDepth:
    """A stated history depth, in years, and when it was last set."""

    years: int
    updated_at: datetime


def read_history_depth(connection: psycopg.Connection) -> HistoryDepth | None:
    """The stated depth in years, or None when the owner has never stated one.

    None is a real state, never a default of zero: a missing depth blocks
    acquisition rather than the product selecting one on the owner's behalf
    (AC-2, DAC-E2-7). No upper bound is enforced by this read — a value
    beyond any provider plan tier is returned exactly as it was stated.
    """
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT setting_value, updated_at FROM owner_setting WHERE setting_key = %s",
            (HISTORY_DEPTH_KEY,),
        )
        row = cursor.fetchone()

    if row is None:
        return None

    setting_value, updated_at = row
    return HistoryDepth(years=setting_value["years"], updated_at=updated_at)


def write_history_depth(connection: psycopg.Connection, years: int) -> None:
    """Record the stated depth. Raises ValueError below 1.

    No upper bound is enforced here, deliberately: a depth beyond what the
    provider plan holds is issued as stated (DAC-E2-12, DAC-E2-S2-5) rather
    than rejected or silently truncated in this module. A future caller
    should not add a redundant cap check here — depth is stated, never
    assumed, and there is no ceiling this module is responsible for.
    """
    if not isinstance(years, int) or isinstance(years, bool) or years < 1:
        raise ValueError(f"history depth must be a positive integer, got {years!r}")

    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO owner_setting (setting_key, setting_value, updated_at)
                VALUES (%s, %s, now())
                ON CONFLICT (setting_key)
                DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = now()
                """,
                (HISTORY_DEPTH_KEY, Json({"years": years})),
            )
