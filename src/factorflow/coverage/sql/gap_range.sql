-- Resolves the gap-detection range and its availability (component-design-coverage-service 2.2, 2.3).
-- Returns exactly one row. available is the same predicate as the availability CTE in
-- gaps.sql, so the service learns availability before computing gaps.
-- Read-only: no INSERT, UPDATE or DELETE.
WITH bounds AS (
    -- An omitted bound means everything acquired (owner decision 2026-09-05, design 2.3).
    SELECT coalesce(%(from_date)s::date, min(cs.covered_from)) AS from_date,
           coalesce(%(to_date)s::date, max(cs.covered_to)) AS to_date
      FROM coverage_segment cs
     WHERE cs.data_type = 'prices'
)
SELECT r.from_date,
       r.to_date,
       (SELECT count(DISTINCT b.instrument_id) >= 2
          FROM daily_bar b
         WHERE b.session_date BETWEEN r.from_date AND r.to_date) AS available
  FROM bounds r;
