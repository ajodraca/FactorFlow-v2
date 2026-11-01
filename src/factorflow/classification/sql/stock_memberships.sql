-- The active universes one instrument currently belongs to: component-design-classification-reader.md
-- section 2.6 (DEC-0071, DEC-0079). The latest member event per universe decides membership
-- (DEC-0057), the latest created or renamed event names it, and a retired universe is left out.
-- The order is total: name, then universe_id (DEC-0134).
WITH latest_member_event AS (
    SELECT DISTINCT ON (e.universe_id) e.universe_id, e.event_type
      FROM universe_event e
     WHERE e.instrument_id = %(instrument_id)s
       AND e.event_type IN ('member_added', 'member_removed')
     ORDER BY e.universe_id, e.event_id DESC
)
SELECT u.universe_id, n.name
  FROM latest_member_event m
  JOIN universe u USING (universe_id)
  JOIN LATERAL (SELECT name FROM universe_event WHERE universe_id = u.universe_id
                  AND event_type IN ('created', 'renamed') ORDER BY event_id DESC LIMIT 1) n ON true
 WHERE m.event_type = 'member_added'
   AND NOT EXISTS (SELECT 1 FROM universe_event r
                    WHERE r.universe_id = u.universe_id AND r.event_type = 'retired')
 ORDER BY n.name, u.universe_id;
