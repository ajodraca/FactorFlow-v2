CREATE TABLE instrument_reference (
    instrument_id   bigint      NOT NULL REFERENCES instrument (instrument_id),
    observed_on     date        NOT NULL DEFAULT current_date,
    value_hash      bytea       NOT NULL,
    company_name    text,
    cik             text,
    composite_figi  text,
    share_class_figi text,
    is_active       boolean,
    list_date       date,
    delisted_utc    timestamptz,
    payload         jsonb       NOT NULL,
    recorded_at     timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT instrument_reference_hash_len CHECK (octet_length(value_hash) = 32),
    CONSTRAINT instrument_reference_natural_key
        UNIQUE (instrument_id, value_hash)
);

CREATE TABLE daily_bar (
    instrument_id bigint         NOT NULL REFERENCES instrument (instrument_id),
    session_date  date           NOT NULL,
    observed_on   date           NOT NULL DEFAULT current_date,
    value_hash    bytea          NOT NULL,
    open_price    numeric(18, 6) NOT NULL,
    high_price    numeric(18, 6) NOT NULL,
    low_price     numeric(18, 6) NOT NULL,
    close_price   numeric(18, 6) NOT NULL,
    volume        numeric(20, 4) NOT NULL,
    recorded_at   timestamptz    NOT NULL DEFAULT now(),
    CONSTRAINT daily_bar_hash_len CHECK (octet_length(value_hash) = 32),
    CONSTRAINT daily_bar_natural_key
        UNIQUE (instrument_id, session_date, value_hash)
);

CREATE INDEX idx_daily_bar_instrument_session ON daily_bar (instrument_id, session_date);
CREATE INDEX idx_daily_bar_session ON daily_bar (session_date);

CREATE TABLE fundamental_observation (
    instrument_id        bigint      NOT NULL REFERENCES instrument (instrument_id),
    fiscal_period_end    date        NOT NULL,
    fiscal_period        text        NOT NULL,
    statement_type       text        NOT NULL,
    observed_on          date        NOT NULL DEFAULT current_date,
    value_hash           bytea       NOT NULL,
    provider_filing_date date,
    payload              jsonb       NOT NULL,
    recorded_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fundamental_hash_len CHECK (octet_length(value_hash) = 32),
    CONSTRAINT fundamental_statement_known
        CHECK (statement_type IN ('balance_sheet', 'income_statement',
                                  'cash_flow_statement', 'ratios')),
    CONSTRAINT fundamental_natural_key
        UNIQUE (instrument_id, fiscal_period_end, statement_type, value_hash)
);

COMMENT ON COLUMN fundamental_observation.provider_filing_date IS
    'Descriptive provider field; never the observation as-of date.';

CREATE INDEX idx_fundamental_instrument_period
    ON fundamental_observation (instrument_id, fiscal_period_end);

CREATE TABLE corporate_action (
    instrument_id bigint      NOT NULL REFERENCES instrument (instrument_id),
    action_type   text        NOT NULL,
    effective_on  date        NOT NULL,
    observed_on   date        NOT NULL DEFAULT current_date,
    value_hash    bytea       NOT NULL,
    payload       jsonb       NOT NULL,
    recorded_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT corporate_action_hash_len CHECK (octet_length(value_hash) = 32),
    CONSTRAINT corporate_action_type_known
        CHECK (action_type IN ('split', 'dividend', 'ticker_change', 'ipo')),
    CONSTRAINT corporate_action_natural_key
        UNIQUE (instrument_id, action_type, effective_on, value_hash)
);

CREATE INDEX idx_corporate_action_instrument ON corporate_action (instrument_id, effective_on);
