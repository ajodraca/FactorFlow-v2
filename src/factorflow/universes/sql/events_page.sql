-- One page of a universe's event history, newest first (component-design-universe-service 2.5, DEC-0093, DEC-0094; see replay.py).
-- before_event_id is the previous page's last event_id, or NULL for the first page.
-- filter_provenance is non-null only on a created event saved from a filter.
SELECT e.event_id,
       e.event_type,
       e.name,
       i.symbol,
       e.recorded_at,
       e.recorded_on,
       e.filter_provenance
  FROM universe_event e
  LEFT JOIN instrument i ON i.instrument_id = e.instrument_id
 WHERE e.universe_id = %(universe_id)s
   AND (%(before_event_id)s::bigint IS NULL OR e.event_id < %(before_event_id)s::bigint)
 ORDER BY e.event_id DESC
 LIMIT %(limit)s;
