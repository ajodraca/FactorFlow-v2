-- One keyset page of per-instrument coverage (component-design-coverage-service 2.2, 2.4).
-- Emits one row per instrument and data type. Retired instruments are included.
-- The date bounds narrow only covered_from/covered_to (segments overlapping them);
-- acquired_from/acquired_to span every segment and feed presence and the depth
-- shortfall (DEC-0003).
-- Read-only: no INSERT, UPDATE or DELETE (design section 8, AC 8).
WITH page AS (
    SELECT i.instrument_id, i.symbol, i.lifecycle
      FROM instrument i
     WHERE (%(symbol_prefix)s::text IS NULL OR i.symbol LIKE %(symbol_prefix)s::text || '%%')
       AND (%(lifecycle)s::text IS NULL OR i.lifecycle = %(lifecycle)s::text)
       AND (%(cursor_symbol)s::text IS NULL OR i.symbol > %(cursor_symbol)s::text)
     ORDER BY i.symbol
     LIMIT %(limit)s
),
segment AS (
    SELECT cs.instrument_id,
           cs.data_type,
           MIN(cs.covered_from) FILTER (WHERE in_bounds) AS covered_from,
           MAX(cs.covered_to)   FILTER (WHERE in_bounds) AS covered_to,
           MIN(cs.covered_from) AS acquired_from,
           MAX(cs.covered_to)   AS acquired_to
      FROM (
        SELECT cs.*,
               (%(from_date)s::date IS NULL OR cs.covered_to >= %(from_date)s::date)
               AND (%(to_date)s::date IS NULL OR cs.covered_from <= %(to_date)s::date)
               AS in_bounds
          FROM coverage_segment cs
      ) cs
      JOIN page p ON p.instrument_id = cs.instrument_id
     GROUP BY cs.instrument_id, cs.data_type
)
SELECT p.instrument_id,
       p.symbol,
       p.lifecycle,
       dt.data_type,
       s.covered_from,
       s.covered_to,
       s.acquired_from,
       s.acquired_to,
       a.last_outcome,
       a.last_acquired_at
  FROM page p
 CROSS JOIN (VALUES ('reference'), ('prices'), ('fundamentals'), ('corporate_actions'))
       AS dt (data_type)
  LEFT JOIN segment s
    ON s.instrument_id = p.instrument_id
   AND s.data_type = dt.data_type
  LEFT JOIN acquisition_state a
    ON a.instrument_id = p.instrument_id
   AND a.data_type = dt.data_type
 ORDER BY p.symbol, dt.data_type;
