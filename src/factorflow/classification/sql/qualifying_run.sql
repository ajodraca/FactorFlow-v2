-- The oldest ended run that acquired a set-worthy outcome and has no set yet (AC-10, DAC-E2-4).
SELECT r.run_id
  FROM acquisition_run r
 WHERE r.state IN ('succeeded', 'partial')
   AND NOT EXISTS (SELECT 1 FROM classification_set s WHERE s.run_id = r.run_id)
 ORDER BY r.ended_at ASC
 LIMIT 1;
