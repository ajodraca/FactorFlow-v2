CREATE TABLE coverage_segment (
    coverage_segment_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    instrument_id bigint NOT NULL REFERENCES instrument (instrument_id),
    data_type     text   NOT NULL,
    covered_from  date   NOT NULL,
    covered_to    date   NOT NULL,
    CONSTRAINT coverage_data_type_known
        CHECK (data_type IN ('reference', 'prices', 'fundamentals', 'corporate_actions')),
    CONSTRAINT coverage_range_ordered CHECK (covered_from <= covered_to),
    CONSTRAINT coverage_no_overlap EXCLUDE USING gist (
        instrument_id WITH =,
        data_type WITH =,
        daterange(covered_from, covered_to, '[]') WITH &&
    )
);

CREATE INDEX idx_coverage_instrument ON coverage_segment (instrument_id, data_type);

CREATE TABLE acquisition_state (
    instrument_id    bigint      NOT NULL REFERENCES instrument (instrument_id),
    data_type        text        NOT NULL,
    last_acquired_at timestamptz NOT NULL,
    last_run_id      uuid        NOT NULL,
    last_outcome     text        NOT NULL,
    PRIMARY KEY (instrument_id, data_type),
    CONSTRAINT acquisition_state_data_type_known
        CHECK (data_type IN ('reference', 'prices', 'fundamentals', 'corporate_actions')),
    CONSTRAINT acquisition_state_outcome_known
        CHECK (last_outcome IN ('written', 'not_found', 'failed'))
);
