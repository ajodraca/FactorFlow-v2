-- src/factorflow/coverage/sql/gaps.sql
WITH in_range AS (
    SELECT b.instrument_id, b.session_date
      FROM daily_bar b
     WHERE b.session_date BETWEEN %(from_date)s AND %(to_date)s
),
availability AS (
    SELECT count(DISTINCT instrument_id) >= 2 AS available
      FROM in_range
),
trading_day AS (
    SELECT DISTINCT session_date FROM in_range
),
covered AS (
    SELECT cs.instrument_id, cs.covered_from, cs.covered_to
      FROM coverage_segment cs
     WHERE cs.data_type = 'prices'
)
SELECT c.instrument_id,
       t.session_date AS missing_date
  FROM covered c
  JOIN trading_day t
    ON t.session_date BETWEEN c.covered_from AND c.covered_to
  LEFT JOIN in_range b
    ON b.instrument_id = c.instrument_id
   AND b.session_date  = t.session_date
 WHERE b.instrument_id IS NULL
   AND (SELECT available FROM availability)
 ORDER BY c.instrument_id, t.session_date;
