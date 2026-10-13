CREATE TABLE acquisition_run (
    run_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    state               text        NOT NULL,
    history_depth_years integer     NOT NULL,
    requested_at        timestamptz NOT NULL DEFAULT now(),
    started_at          timestamptz,
    ended_at            timestamptz,
    cancel_requested_at timestamptz,
    claimed_by          text,
    heartbeat_at        timestamptz,
    instruments_named   integer     NOT NULL DEFAULT 0,
    instruments_written integer     NOT NULL DEFAULT 0,
    instruments_failed  integer     NOT NULL DEFAULT 0,
    failure_reason      text,
    CONSTRAINT acquisition_run_state_known CHECK (state IN (
        'requested', 'running', 'cancelling',
        'succeeded', 'partial', 'failed', 'cancelled', 'abandoned')),
    CONSTRAINT acquisition_run_depth_positive CHECK (history_depth_years >= 1),
    CONSTRAINT acquisition_run_claim_agrees
        CHECK ((state IN ('running', 'cancelling'))
               = (claimed_by IS NOT NULL AND heartbeat_at IS NOT NULL)),
    CONSTRAINT acquisition_run_terminal_has_end
        CHECK ((state IN ('succeeded', 'partial', 'failed', 'cancelled', 'abandoned'))
               = (ended_at IS NOT NULL))
);

CREATE UNIQUE INDEX idx_acquisition_run_single_active
    ON acquisition_run ((true)) WHERE state IN ('running', 'cancelling');

CREATE INDEX idx_acquisition_run_requested
    ON acquisition_run (requested_at) WHERE state = 'requested';

CREATE INDEX idx_acquisition_run_recent ON acquisition_run (requested_at DESC);

CREATE TABLE run_instrument_result (
    run_id        uuid   NOT NULL REFERENCES acquisition_run (run_id),
    instrument_id bigint NOT NULL REFERENCES instrument (instrument_id),
    data_type     text   NOT NULL,
    outcome       text   NOT NULL,
    reason        text,
    attempts      integer NOT NULL DEFAULT 1,
    completed_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (run_id, instrument_id, data_type),
    CONSTRAINT run_result_data_type_known
        CHECK (data_type IN ('reference', 'prices', 'fundamentals', 'corporate_actions')),
    CONSTRAINT run_result_outcome_known
        CHECK (outcome IN ('written', 'unchanged', 'not_found', 'failed', 'skipped'))
);

CREATE INDEX idx_run_result_failures
    ON run_instrument_result (run_id) WHERE outcome IN ('not_found', 'failed');
