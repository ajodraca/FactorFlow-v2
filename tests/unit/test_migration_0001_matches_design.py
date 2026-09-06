"""Guards against drift between the shipped migration file and the design doc.

component-design-market-data-store.md section 2.3 states that a file that has
been applied must never be edited — a correction is a new file. This test
catches silent drift between what the design specifies and what ships.
"""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
MIGRATION_0001_PATH = REPO_ROOT / "migrations" / "0001_extensions_owner_state.sql"

# Verbatim from component-design-market-data-store.md section 2.3.
EXPECTED_SQL = """\
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE instrument (
    instrument_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    symbol        text        NOT NULL,
    lifecycle     text        NOT NULL,
    added_at      timestamptz NOT NULL DEFAULT now(),
    retired_at    timestamptz,
    CONSTRAINT instrument_symbol_uppercase CHECK (symbol = upper(symbol)),
    CONSTRAINT instrument_symbol_shape     CHECK (symbol ~ '^[A-Z][A-Z0-9.-]{0,15}$'),
    CONSTRAINT instrument_lifecycle_known  CHECK (lifecycle IN ('active', 'retired')),
    CONSTRAINT instrument_retired_at_agrees
        CHECK ((lifecycle = 'retired') = (retired_at IS NOT NULL))
);

CREATE UNIQUE INDEX idx_instrument_symbol ON instrument (symbol);
CREATE INDEX idx_instrument_active ON instrument (instrument_id) WHERE lifecycle = 'active';

CREATE TABLE owner_setting (
    setting_key   text        PRIMARY KEY,
    setting_value jsonb       NOT NULL,
    updated_at    timestamptz NOT NULL DEFAULT now()
);
"""


def test_migration_0001_matches_design_verbatim() -> None:
    actual = MIGRATION_0001_PATH.read_text()
    assert actual == EXPECTED_SQL
