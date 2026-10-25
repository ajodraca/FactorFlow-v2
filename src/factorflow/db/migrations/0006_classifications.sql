CREATE TABLE classification_set (
    set_id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id              uuid        NOT NULL UNIQUE REFERENCES acquisition_run (run_id),
    state               text        NOT NULL,
    classification_date date        NOT NULL,
    latest_trading_day  date,
    active_instruments  integer,
    started_at          timestamptz NOT NULL DEFAULT now(),
    ended_at            timestamptz,
    failure_reason      text,
    CONSTRAINT classification_set_state_known
        CHECK (state IN ('building', 'complete', 'failed')),
    CONSTRAINT classification_set_terminal_has_end
        CHECK ((state IN ('complete', 'failed')) = (ended_at IS NOT NULL)),
    CONSTRAINT classification_set_failed_has_reason
        CHECK ((state = 'failed') = (failure_reason IS NOT NULL)),
    CONSTRAINT classification_set_complete_is_sized
        CHECK (state <> 'complete'
               OR (latest_trading_day IS NOT NULL AND active_instruments IS NOT NULL))
);

CREATE UNIQUE INDEX idx_classification_set_single_building
    ON classification_set ((true)) WHERE state = 'building';
CREATE INDEX idx_classification_set_complete_recent
    ON classification_set (ended_at DESC) WHERE state = 'complete';
CREATE INDEX idx_classification_set_started
    ON classification_set (started_at DESC);

CREATE TABLE classification_set_factor (
    set_id          uuid    NOT NULL REFERENCES classification_set (set_id),
    factor          text    NOT NULL,
    qualified_count integer NOT NULL,
    ranked          boolean NOT NULL,
    PRIMARY KEY (set_id, factor),
    CONSTRAINT classification_set_factor_known
        CHECK (factor IN ('value', 'growth', 'momentum')),
    CONSTRAINT classification_set_factor_count_nonnegative
        CHECK (qualified_count >= 0)
);

CREATE TABLE factor_input (
    set_id            uuid            NOT NULL REFERENCES classification_set (set_id),
    instrument_id     bigint          NOT NULL REFERENCES instrument (instrument_id),
    factor            text            NOT NULL,
    input_name        text            NOT NULL,
    status            text            NOT NULL,
    value             numeric(30, 10),
    as_of             date,
    known_on          date,
    restated_possible boolean         NOT NULL DEFAULT false,
    detail            jsonb           NOT NULL,
    PRIMARY KEY (set_id, instrument_id, factor, input_name),
    CONSTRAINT factor_input_factor_known
        CHECK (factor IN ('value', 'growth', 'momentum')),
    CONSTRAINT factor_input_name_matches_factor CHECK (
           (factor = 'value'    AND input_name IN ('book_to_price', 'earnings_yield', 'fcf_yield'))
        OR (factor = 'growth'   AND input_name IN ('revenue_growth', 'eps_growth'))
        OR (factor = 'momentum' AND input_name IN ('return_3m', 'return_6m', 'return_12m'))),
    CONSTRAINT factor_input_status_known
        CHECK (status IN ('present', 'missing', 'outdated', 'not_computable')),
    CONSTRAINT factor_input_present_is_dated
        CHECK (status <> 'present'
               OR (value IS NOT NULL AND as_of IS NOT NULL AND known_on IS NOT NULL))
);

CREATE INDEX idx_factor_input_instrument ON factor_input (instrument_id, set_id);

CREATE TABLE factor_classification (
    set_id            uuid           NOT NULL REFERENCES classification_set (set_id),
    instrument_id     bigint         NOT NULL REFERENCES instrument (instrument_id),
    factor            text           NOT NULL,
    status            text           NOT NULL,
    score             numeric(18, 6),
    percentile        numeric(9, 6),
    reason_code       text,
    reason_input      text,
    reason_detail     text,
    restated_possible boolean        NOT NULL DEFAULT false,
    PRIMARY KEY (set_id, instrument_id, factor),
    CONSTRAINT factor_classification_factor_known
        CHECK (factor IN ('value', 'growth', 'momentum')),
    CONSTRAINT factor_classification_status_known
        CHECK (status IN ('classified', 'not_classified')),
    CONSTRAINT factor_classification_reason_known
        CHECK (reason_code IS NULL OR reason_code IN (
            'input_missing', 'input_outdated', 'input_not_computable',
            'not_enough_stocks', 'retired')),
    CONSTRAINT factor_classification_shape CHECK (
           (status = 'classified'     AND score IS NOT NULL AND percentile IS NOT NULL
                                      AND reason_code IS NULL AND reason_input IS NULL)
        OR (status = 'not_classified' AND score IS NULL AND percentile IS NULL
                                      AND reason_code IS NOT NULL)),
    CONSTRAINT factor_classification_reason_input_agrees
        CHECK ((reason_code IN ('input_missing', 'input_outdated', 'input_not_computable'))
               = (reason_input IS NOT NULL)),
    CONSTRAINT factor_classification_percentile_range
        CHECK (percentile IS NULL OR (percentile >= 0 AND percentile <= 100))
);

CREATE INDEX idx_factor_classification_instrument
    ON factor_classification (instrument_id, set_id);
CREATE INDEX idx_factor_classification_set_factor_score
    ON factor_classification (set_id, factor, score);
CREATE INDEX idx_factor_classification_set_factor_percentile
    ON factor_classification (set_id, factor, percentile);

COMMENT ON COLUMN classification_set.classification_date IS
    'The America/Chicago date at set creation; what dates the classification (AC-18, AC-19).';
COMMENT ON COLUMN factor_input.known_on IS
    'The latest observed_on among the rows the input was computed from (AC-17).';
COMMENT ON COLUMN factor_input.detail IS
    'The line items, statements, sessions and corporate actions used, or the acquisition outcome when missing (DEC-0066).';
