-- The classification list: component-design-classification-reader.md section 2.5, as DEC-0129
-- records. scope: the active roster unscoped, or the universe's replayed members (retired ones
-- kept), narrowed by the symbol prefix and to stocks with a row in the set. matched: the twelve
-- threshold bounds, each applied only where the stock is classified on its factor (DEC-0081), and
-- hide_incomplete over the input reasons only (DEC-0079). match_count is counted once over
-- matched and returned on a row of its own, so an empty page still carries it. The three
-- substitution slots (sort_expr, order, keyset) are filled by the reader from SORT_ALLOWLIST, the
-- ASC or DESC keyword and a fixed keyset fragment; every value is a bound parameter (SEC-INP-002).
-- The name is the latest stored reference name (DEC-0245).
WITH scope AS (
    SELECT i.instrument_id, i.symbol, ref.company_name AS name, i.lifecycle
      FROM instrument i
      LEFT JOIN LATERAL (
            SELECT r.company_name
              FROM instrument_reference r
             WHERE r.instrument_id = i.instrument_id
             ORDER BY r.recorded_at DESC, r.value_hash DESC
             LIMIT 1) ref ON true
     WHERE ((%(scoped)s::boolean AND i.instrument_id = ANY(%(member_ids)s::bigint[]))
            OR (NOT %(scoped)s::boolean AND i.lifecycle = 'active'))
       AND (%(symbol_pattern)s::text IS NULL OR i.symbol LIKE %(symbol_pattern)s::text ESCAPE '\')
       AND (%(symbols)s::text[] IS NULL OR i.symbol = ANY(%(symbols)s::text[]))
       AND EXISTS (SELECT 1 FROM factor_classification c
                    WHERE c.set_id = %(set_id)s::uuid AND c.instrument_id = i.instrument_id)
),
matched AS (
    SELECT s.instrument_id, s.symbol, s.name, s.lifecycle,
           c_value.status AS value_status, c_value.score AS value_score,
           c_value.percentile AS value_percentile, c_value.reason_code AS value_reason_code,
           c_value.reason_input AS value_reason_input, c_value.reason_detail AS value_reason_detail,
           c_value.restated_possible AS value_restated_possible,
           c_growth.status AS growth_status, c_growth.score AS growth_score,
           c_growth.percentile AS growth_percentile, c_growth.reason_code AS growth_reason_code,
           c_growth.reason_input AS growth_reason_input, c_growth.reason_detail AS growth_reason_detail,
           c_growth.restated_possible AS growth_restated_possible,
           c_momentum.status AS momentum_status, c_momentum.score AS momentum_score,
           c_momentum.percentile AS momentum_percentile, c_momentum.reason_code AS momentum_reason_code,
           c_momentum.reason_input AS momentum_reason_input,
           c_momentum.reason_detail AS momentum_reason_detail,
           c_momentum.restated_possible AS momentum_restated_possible
      FROM scope s
      LEFT JOIN factor_classification c_value
             ON c_value.set_id = %(set_id)s::uuid AND c_value.instrument_id = s.instrument_id
            AND c_value.factor = 'value'
      LEFT JOIN factor_classification c_growth
             ON c_growth.set_id = %(set_id)s::uuid AND c_growth.instrument_id = s.instrument_id
            AND c_growth.factor = 'growth'
      LEFT JOIN factor_classification c_momentum
             ON c_momentum.set_id = %(set_id)s::uuid AND c_momentum.instrument_id = s.instrument_id
            AND c_momentum.factor = 'momentum'
     WHERE (%(value_score_min)s::numeric IS NULL OR c_value.status IS DISTINCT FROM 'classified'
            OR c_value.score >= %(value_score_min)s::numeric)
       AND (%(value_score_max)s::numeric IS NULL OR c_value.status IS DISTINCT FROM 'classified'
            OR c_value.score <= %(value_score_max)s::numeric)
       AND (%(value_percentile_min)s::numeric IS NULL OR c_value.status IS DISTINCT FROM 'classified'
            OR c_value.percentile >= %(value_percentile_min)s::numeric)
       AND (%(value_percentile_max)s::numeric IS NULL OR c_value.status IS DISTINCT FROM 'classified'
            OR c_value.percentile <= %(value_percentile_max)s::numeric)
       AND (%(growth_score_min)s::numeric IS NULL OR c_growth.status IS DISTINCT FROM 'classified'
            OR c_growth.score >= %(growth_score_min)s::numeric)
       AND (%(growth_score_max)s::numeric IS NULL OR c_growth.status IS DISTINCT FROM 'classified'
            OR c_growth.score <= %(growth_score_max)s::numeric)
       AND (%(growth_percentile_min)s::numeric IS NULL OR c_growth.status IS DISTINCT FROM 'classified'
            OR c_growth.percentile >= %(growth_percentile_min)s::numeric)
       AND (%(growth_percentile_max)s::numeric IS NULL OR c_growth.status IS DISTINCT FROM 'classified'
            OR c_growth.percentile <= %(growth_percentile_max)s::numeric)
       AND (%(momentum_score_min)s::numeric IS NULL
            OR c_momentum.status IS DISTINCT FROM 'classified'
            OR c_momentum.score >= %(momentum_score_min)s::numeric)
       AND (%(momentum_score_max)s::numeric IS NULL
            OR c_momentum.status IS DISTINCT FROM 'classified'
            OR c_momentum.score <= %(momentum_score_max)s::numeric)
       AND (%(momentum_percentile_min)s::numeric IS NULL
            OR c_momentum.status IS DISTINCT FROM 'classified'
            OR c_momentum.percentile >= %(momentum_percentile_min)s::numeric)
       AND (%(momentum_percentile_max)s::numeric IS NULL
            OR c_momentum.status IS DISTINCT FROM 'classified'
            OR c_momentum.percentile <= %(momentum_percentile_max)s::numeric)
       AND (NOT %(hide_incomplete)s::boolean OR NOT (
                COALESCE(c_value.reason_code = ANY(%(input_reasons)s::text[]), false)
             OR COALESCE(c_growth.reason_code = ANY(%(input_reasons)s::text[]), false)
             OR COALESCE(c_momentum.reason_code = ANY(%(input_reasons)s::text[]), false)))
)
SELECT c.match_count, m.*
  FROM (SELECT count(*) AS match_count FROM matched) c
  LEFT JOIN (
        SELECT *
          FROM matched m
         WHERE {keyset}
         ORDER BY ({sort_expr} IS NULL) ASC, {sort_expr} {order}, m.symbol ASC
         LIMIT %(limit_plus_one)s::bigint) m ON true
 ORDER BY ({sort_expr} IS NULL) ASC, {sort_expr} {order}, m.symbol ASC;
