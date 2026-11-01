-- One stock's evidence: component-design-classification-reader.md section 2.6, as one statement
-- over a common column list. An instrument row (none means the symbol is unknown), the stock's
-- cell rows and its factor_input rows, all of the one set bound as set_id (null: no cell or
-- input row). Ordering needs no interpolation: the factor and input definition orders are bound
-- arrays (SEC-INP-002). Every value is a stored row; nothing is recomputed (STD-UI-15).
WITH instrument_row AS (
    SELECT i.instrument_id, i.symbol, i.lifecycle,
           (SELECT r.company_name
              FROM instrument_reference r
             WHERE r.instrument_id = i.instrument_id
             ORDER BY r.recorded_at DESC, r.value_hash DESC
             LIMIT 1) AS name
      FROM instrument i
     WHERE i.symbol = %(symbol)s::text
)
SELECT u.*
  FROM (
SELECT 0 AS row_kind_rank, 'instrument'::text AS row_kind, i.instrument_id, i.symbol, i.name,
       i.lifecycle, NULL::text AS factor, NULL::text AS input_name, NULL::text AS status,
       NULL::numeric AS score, NULL::numeric AS percentile, NULL::text AS reason_code,
       NULL::text AS reason_input, NULL::text AS reason_detail, NULL::numeric AS value,
       NULL::date AS as_of, NULL::date AS known_on, NULL::boolean AS restated_possible,
       NULL::jsonb AS detail
  FROM instrument_row i
UNION ALL
SELECT 1, 'cell', c.instrument_id, NULL, NULL, NULL, c.factor, NULL, c.status, c.score,
       c.percentile, c.reason_code, c.reason_input, c.reason_detail, NULL, NULL, NULL,
       c.restated_possible, NULL
  FROM factor_classification c
  JOIN instrument_row i USING (instrument_id)
 WHERE c.set_id = %(set_id)s::uuid
UNION ALL
SELECT 2, 'input', f.instrument_id, NULL, NULL, NULL, f.factor, f.input_name, f.status, NULL,
       NULL, NULL, NULL, NULL, f.value, f.as_of, f.known_on, f.restated_possible, f.detail
  FROM factor_input f
  JOIN instrument_row i USING (instrument_id)
 WHERE f.set_id = %(set_id)s::uuid
) u
 ORDER BY u.row_kind_rank,
          array_position(%(factor_order)s::text[], u.factor),
          array_position(%(input_order)s::text[], u.input_name);
