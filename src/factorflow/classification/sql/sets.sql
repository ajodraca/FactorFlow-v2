-- The set list and one set: component-design-classification-reader.md section 2.6 (CAP-002-E3-S4).
-- Every set, building and failed included, newest started_at first, keyset on (started_at, set_id)
-- (DEC-0136), with the run's state and started_at (DEC-0083) and the three factor counts in the
-- current_set.sql spelling; null factors when the set has no classification_set_factor row
-- (DEC-0265). A set_id narrows it to that one set (get_set).
SELECT s.set_id,
       s.state,
       s.classification_date,
       s.run_id,
       r.started_at AS run_started_at,
       r.state      AS run_outcome,
       s.started_at,
       s.ended_at,
       s.failure_reason,
       s.latest_trading_day,
       s.active_instruments,
       (SELECT jsonb_object_agg(f.factor, jsonb_build_object(
                   'qualified_count', f.qualified_count, 'ranked', f.ranked))
          FROM classification_set_factor f
         WHERE f.set_id = s.set_id) AS factors
  FROM classification_set s
  JOIN acquisition_run r USING (run_id)
 WHERE (%(set_id)s::uuid IS NULL OR s.set_id = %(set_id)s::uuid)
   AND (%(after_started_at)s::timestamptz IS NULL
        OR (s.started_at, s.set_id) < (%(after_started_at)s::timestamptz, %(after_set_id)s::uuid))
 ORDER BY s.started_at DESC, s.set_id DESC
 LIMIT %(page_size)s::integer;
