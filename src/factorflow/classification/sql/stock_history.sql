-- A stock's history: component-design-classification-reader.md section 2.6 (CAP-002-E3-S4).
-- The stock's rows in complete sets other than the current one (DEC-0137), one page of sets newest
-- ended_at first, keyset on (ended_at, set_id) (DEC-0136), read through
-- idx_factor_classification_instrument; nothing is recomputed (AC-19). No row: the symbol names no
-- instrument. One row with a null set_id: a known stock with no earlier result (DAC-E3-S4-2).
WITH inst AS (
    SELECT i.instrument_id
      FROM instrument i
     WHERE i.symbol = %(symbol)s::text
),
page_sets AS (
    SELECT s.set_id, s.classification_date, s.run_id, s.ended_at
      FROM factor_classification fc
      JOIN classification_set s ON s.set_id = fc.set_id
     WHERE fc.instrument_id = (SELECT instrument_id FROM inst)
       AND s.state = 'complete'
       AND s.set_id IS DISTINCT FROM %(current_set_id)s::uuid
       AND (%(after_ended_at)s::timestamptz IS NULL
            OR (s.ended_at, s.set_id)
               < (%(after_ended_at)s::timestamptz, %(after_set_id)s::uuid))
     GROUP BY s.set_id, s.classification_date, s.run_id, s.ended_at
     ORDER BY s.ended_at DESC, s.set_id DESC
     LIMIT %(page_size)s::integer
)
SELECT i.instrument_id,
       p.set_id,
       p.classification_date,
       p.run_id,
       r.state AS run_outcome,
       p.ended_at,
       fc.factor,
       fc.status,
       fc.score,
       fc.percentile,
       fc.reason_code,
       fc.reason_input,
       fc.reason_detail,
       fc.restated_possible
  FROM inst i
  LEFT JOIN page_sets p ON true
  LEFT JOIN factor_classification fc
         ON fc.set_id = p.set_id AND fc.instrument_id = i.instrument_id
  LEFT JOIN acquisition_run r ON r.run_id = p.run_id
 ORDER BY p.ended_at DESC, p.set_id DESC, array_position(%(factor_order)s::text[], fc.factor);
