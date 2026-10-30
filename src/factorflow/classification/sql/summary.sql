-- src/factorflow/classification/sql/summary.sql (run with the current set_id)
SELECT count(*) FILTER (WHERE NOT stale) AS current_count,
       count(*)                           AS scored_roster
  FROM (
    SELECT fi.instrument_id,
           bool_or(fi.status IN ('missing', 'outdated')) AS stale
      FROM factor_input fi
     WHERE fi.set_id = %(set_id)s
     GROUP BY fi.instrument_id
  ) per_stock;
