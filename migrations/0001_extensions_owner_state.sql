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
