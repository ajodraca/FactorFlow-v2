-- The current set and the later attempt: component-design-classification-reader.md section 2.4.
-- current: the latest complete set (constraint 11). later: the most recent set started after it,
-- or the most recent set while none is complete (DEC-0082; task plan Open Gap 1). One row, or
-- none when no set exists; the current columns are null when no set is complete.
WITH current AS (
    SELECT s.*, r.state AS run_outcome, r.started_at AS run_started_at
      FROM classification_set s JOIN acquisition_run r USING (run_id)
     WHERE s.state = 'complete'
     ORDER BY s.ended_at DESC
     LIMIT 1
),
later AS (
    SELECT s.set_id, s.state, s.run_id, r.started_at AS run_started_at,
           s.started_at, s.ended_at, s.failure_reason
      FROM classification_set s JOIN acquisition_run r USING (run_id)
     WHERE s.started_at > COALESCE((SELECT started_at FROM current), '-infinity')
     ORDER BY s.started_at DESC
     LIMIT 1
)
SELECT c.set_id,
       c.classification_date,
       c.run_id,
       c.run_started_at,
       c.run_outcome,
       c.state,
       c.started_at,
       c.ended_at,
       c.latest_trading_day,
       c.active_instruments,
       (SELECT jsonb_object_agg(f.factor, jsonb_build_object(
                   'qualified_count', f.qualified_count, 'ranked', f.ranked))
          FROM classification_set_factor f
         WHERE f.set_id = c.set_id) AS factors,
       l.set_id         AS later_set_id,
       l.state          AS later_state,
       l.run_id         AS later_run_id,
       l.run_started_at AS later_run_started_at,
       l.started_at     AS later_started_at,
       l.ended_at       AS later_ended_at,
       l.failure_reason AS later_failure_reason
  FROM current c FULL JOIN later l ON true;
