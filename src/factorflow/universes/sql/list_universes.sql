-- One page of universes, newest first, keyset-paged by (created_at, universe_id)
-- (component design replay section; see replay.py). The name is the replayed current
-- name: the latest renamed event, else the created event. The prefix match uses starts_with, not LIKE, so a
-- percent sign or underscore in the prefix is a literal. No member count.
WITH replayed AS (
    SELECT c.universe_id,
           COALESCE(r.name, c.name) AS name,
           c.recorded_at AS created_at,
           x.recorded_at AS retired_at
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
     WHERE c.event_type = 'created'
)
SELECT universe_id,
       name,
       CASE WHEN retired_at IS NULL THEN 'active' ELSE 'retired' END AS lifecycle,
       created_at,
       retired_at
  FROM replayed
 WHERE (%(lifecycle)s::text = 'all'
        OR (%(lifecycle)s::text = 'active' AND retired_at IS NULL)
        OR (%(lifecycle)s::text = 'retired' AND retired_at IS NOT NULL))
   AND (%(name_prefix)s::text IS NULL OR starts_with(name, %(name_prefix)s::text))
   AND (%(after_created_at)s::timestamptz IS NULL
        OR (created_at, universe_id)
           < (%(after_created_at)s::timestamptz, %(after_universe_id)s::uuid))
 ORDER BY created_at DESC, universe_id DESC
 LIMIT %(limit)s;
