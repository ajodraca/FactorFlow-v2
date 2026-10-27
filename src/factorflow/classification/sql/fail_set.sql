UPDATE classification_set
   SET state = 'failed',
       ended_at = now(),
       failure_reason = %(reason)s
 WHERE set_id = %(set_id)s
   AND state = 'building'
