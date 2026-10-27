-- Start-up reclaim: a set left building by an interrupted process is recorded failed (DAC-E2-12).
UPDATE classification_set
   SET state = 'failed',
       ended_at = now(),
       failure_reason = 'interrupted: the application restarted during the build'
 WHERE state = 'building'
RETURNING set_id, run_id;
