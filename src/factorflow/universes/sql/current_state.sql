-- One universe's current state by replay (component-design-universe-service 2.5, DEC-0065, DEC-0094; see replay.py):
-- the created event (creation time and date, provenance, original name), the latest
-- renamed event (current name) and the retired event (retired_at) in one query.
-- Zero rows for an unknown universe. today is the America/Chicago date, computed in
-- SQL beside the data by the same rule as the recorded_on column default.
SELECT c.recorded_at AS created_at,
       c.recorded_on AS created_on,
       c.filter_provenance,
       COALESCE(r.name, c.name) AS name,
       x.recorded_at AS retired_at,
       (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date AS today
  FROM universe_event c
  LEFT JOIN LATERAL (
       SELECT e.name
         FROM universe_event e
        WHERE e.universe_id = c.universe_id AND e.event_type = 'renamed'
        ORDER BY e.event_id DESC
        LIMIT 1) r ON TRUE
  LEFT JOIN LATERAL (
       SELECT e.recorded_at
         FROM universe_event e
        WHERE e.universe_id = c.universe_id AND e.event_type = 'retired'
        ORDER BY e.event_id DESC
        LIMIT 1) x ON TRUE
 WHERE c.universe_id = %(universe_id)s
   AND c.event_type = 'created';
