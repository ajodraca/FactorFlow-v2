CREATE TABLE universe (
    universe_id uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE universe_event (
    event_id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    universe_id       uuid        NOT NULL REFERENCES universe (universe_id),
    event_type        text        NOT NULL,
    instrument_id     bigint      REFERENCES instrument (instrument_id),
    name              text,
    filter_provenance jsonb,
    recorded_at       timestamptz NOT NULL DEFAULT now(),
    recorded_on       date        NOT NULL
                      DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date,
    CONSTRAINT universe_event_type_known
        CHECK (event_type IN ('created', 'renamed', 'member_added',
                              'member_removed', 'retired')),
    CONSTRAINT universe_event_member_has_instrument
        CHECK ((event_type IN ('member_added', 'member_removed'))
               = (instrument_id IS NOT NULL)),
    CONSTRAINT universe_event_name_agrees
        CHECK ((event_type IN ('created', 'renamed')) = (name IS NOT NULL)),
    CONSTRAINT universe_event_name_trimmed
        CHECK (name IS NULL OR (name = btrim(name) AND name <> '')),
    CONSTRAINT universe_event_provenance_only_on_created
        CHECK (filter_provenance IS NULL OR event_type = 'created')
);

CREATE INDEX idx_universe_event_universe
    ON universe_event (universe_id, event_id);
CREATE INDEX idx_universe_event_instrument
    ON universe_event (instrument_id, event_id) WHERE instrument_id IS NOT NULL;
CREATE UNIQUE INDEX idx_universe_event_single_created
    ON universe_event (universe_id) WHERE event_type = 'created';
CREATE UNIQUE INDEX idx_universe_event_single_retired
    ON universe_event (universe_id) WHERE event_type = 'retired';

COMMENT ON COLUMN universe_event.recorded_on IS
    'The America/Chicago date the event was recorded; the as-of grain for AC-6 (DEC-0065).';
COMMENT ON COLUMN universe_event.filter_provenance IS
    'Only on a created event taken from a filter: the filter as evaluated and the set it was evaluated against, '
    '{"set_id": uuid, "classification_date": date, "thresholds": {the twelve bounds that were set, '
    '{factor}_score_min/_max and {factor}_percentile_min/_max, by query-parameter name}, '
    '"hide_incomplete": bool, "symbol": text or null (the Find a stock prefix)} (AC-2, S03-7).';
