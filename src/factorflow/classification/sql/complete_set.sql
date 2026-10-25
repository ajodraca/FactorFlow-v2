UPDATE classification_set
   SET state = 'complete',
       ended_at = now(),
       latest_trading_day = %(latest_trading_day)s,
       active_instruments = %(active_instruments)s
 WHERE set_id = %(set_id)s
   AND state = 'building'
