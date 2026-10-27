SELECT
    s.set_id,
    s.run_id,
    s.classification_date,
    (SELECT max(b.session_date)
       FROM daily_bar b
       JOIN instrument i USING (instrument_id)
      WHERE i.lifecycle = 'active') AS latest_trading_day,
    coalesce((SELECT array_agg(i.instrument_id ORDER BY i.instrument_id)
                FROM instrument i
               WHERE i.lifecycle = 'active'), ARRAY[]::bigint[]) AS active_ids,
    coalesce((SELECT array_agg(i.instrument_id ORDER BY i.instrument_id)
                FROM instrument i
               WHERE i.lifecycle = 'retired'), ARRAY[]::bigint[]) AS retired_ids
FROM classification_set s
WHERE s.set_id = %(set_id)s
