-- src/factorflow/universes/sql/membership_as_of.sql
-- Members of one universe as of the end of day %(as_of)s (America/Chicago), DEC-0065.
WITH member_events AS (
    SELECT DISTINCT ON (instrument_id)
           instrument_id, event_type, recorded_at
      FROM universe_event
     WHERE universe_id = %(universe_id)s
       AND event_type IN ('member_added', 'member_removed')
       AND recorded_on <= %(as_of)s
     ORDER BY instrument_id, event_id DESC
)
SELECT i.instrument_id, i.symbol, i.lifecycle, m.recorded_at AS member_since
  FROM member_events m
  JOIN instrument i USING (instrument_id)
 WHERE m.event_type = 'member_added'
 ORDER BY i.symbol;
