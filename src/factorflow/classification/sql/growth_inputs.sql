-- revenue_growth and eps_growth for every active instrument: the trailing four quarters
-- over the four quarters a year earlier, minus one (factor-engine design 2.4;
-- DEC-0055 (1), (2), (7); DEC-0116). Inserts into the temporary table value_inputs.sql
-- creates (DEC-0115). Depends on no price. Reads only. CAP-002-E2-S3.
INSERT INTO inputs (instrument_id, factor, input_name, status, value, as_of, known_on,
                    restated_possible, detail, missing_data_type)
WITH roster AS (
    SELECT unnest(%(active_ids)s::bigint[]) AS instrument_id
),
line_item AS (
    -- The seven line items with their bound payload keys and signs. A NULL key is one the
    -- owner has not supplied yet (line_items.REQUIRES_INPUT).
    SELECT m.name, m.payload_key, m.sign
      FROM unnest(%(line_item_names)s::text[], %(line_item_keys)s::text[],
                  %(line_item_signs)s::integer[])
           AS m (name, payload_key, sign)
),
needed (input_name, line_item) AS (
    VALUES ('revenue_growth', 'revenue'), ('eps_growth', 'diluted_eps')
),
used AS (
    -- The eight quarterly income statements of the trailing and prior-year windows, each
    -- line item read through the guard of value_inputs.sql (DEC-0116 (4)).
    SELECT r.instrument_id, n.input_name, s.fiscal_period_end, s.observed_on, s.backfilled,
           s.ttm_slot IS NOT NULL AS in_ttm,
           jsonb_build_object('statement_type', s.statement_type,
                              'fiscal_period_end', s.fiscal_period_end,
                              'observed_on', s.observed_on,
                              'provider_filing_date', s.provider_filing_date,
                              'backfilled', s.backfilled) AS period,
           CASE WHEN jsonb_typeof(s.payload -> m.payload_key) IN ('number', 'string')
                 AND s.payload ->> m.payload_key ~ '^-?[0-9]+(\.[0-9]+)?$'
                THEN (s.payload ->> m.payload_key)::numeric * m.sign
           END AS amount
      FROM roster r
      CROSS JOIN needed n
      JOIN line_item m ON m.name = n.line_item
      JOIN stmt s ON s.instrument_id = r.instrument_id
                 AND s.statement_type = 'income_statement'
                 AND (s.ttm_slot IS NOT NULL OR s.prior_slot IS NOT NULL)
),
windows AS (
    SELECT instrument_id, input_name,
           count(*) FILTER (WHERE in_ttm) AS trailing_quarters,
           count(*) FILTER (WHERE NOT in_ttm) AS prior_quarters,
           sum(amount) FILTER (WHERE in_ttm) AS trailing_sum,
           sum(amount) FILTER (WHERE NOT in_ttm) AS prior_sum,
           bool_or(amount IS NULL) AS absent,
           max(fiscal_period_end) AS as_of,
           max(observed_on) AS known_on,
           bool_or(backfilled) AS restated,
           jsonb_agg(period ORDER BY fiscal_period_end DESC) AS periods
      FROM used
     GROUP BY instrument_id, input_name
),
found AS (
    -- Every quarterly income statement held on or before the classification date.
    SELECT instrument_id,
           jsonb_agg(jsonb_build_object('statement_type', statement_type,
                                        'fiscal_period_end', fiscal_period_end)
                     ORDER BY fiscal_period_end DESC) AS periods_found
      FROM stmt
     WHERE statement_type = 'income_statement'
     GROUP BY instrument_id
),
decided AS (
    -- Missing before outdated before not computable (DEC-0116 (1)); a bar is never read.
    SELECT r.instrument_id, n.input_name, n.line_item, w.trailing_sum, w.prior_sum,
           w.as_of, w.known_on, w.restated, f.periods_found,
           jsonb_build_object('periods', w.periods) AS base,
           CASE WHEN n.line_item = ANY(%(unresolved)s::text[]) THEN %(unresolved_cause)s::text
                -- either window short, or no row of either (w is NULL)
                WHEN coalesce(w.trailing_quarters < 4 OR w.prior_quarters < 4, true)
                THEN 'periods_missing'
                WHEN w.absent THEN 'line_item_absent'
           END AS missing_cause,
           (%(classification_date)s::date
               - make_interval(months => %(stale_months)s::integer))::date AS stale_before
      FROM roster r
      CROSS JOIN needed n
      LEFT JOIN windows w ON w.instrument_id = r.instrument_id AND w.input_name = n.input_name
      LEFT JOIN found f ON f.instrument_id = r.instrument_id
),
statused AS (
    SELECT d.*,
           CASE WHEN d.missing_cause IS NOT NULL THEN 'missing'
                WHEN d.as_of < d.stale_before THEN 'outdated'
                WHEN d.prior_sum <= 0 THEN 'not_computable'
                ELSE 'present'
           END AS status
      FROM decided d
)
SELECT s.instrument_id,
       'growth'::text,
       s.input_name,
       s.status,
       CASE WHEN s.status = 'present' THEN s.trailing_sum / s.prior_sum - 1 END,
       CASE WHEN s.status <> 'missing' THEN s.as_of END,
       CASE WHEN s.status <> 'missing' THEN s.known_on END,
       -- Marked when any statement row detail.periods lists is backfilled; a missing
       -- input lists none (AC-23, DAC-E2-11, DEC-0056, DEC-0122).
       s.status <> 'missing' AND s.restated,
       CASE s.status
            WHEN 'missing' THEN jsonb_strip_nulls(jsonb_build_object(
                'cause', s.missing_cause,
                'line_items', CASE WHEN s.missing_cause IN (%(unresolved_cause)s::text,
                                                            'line_item_absent')
                                   THEN jsonb_build_array(s.line_item)
                              END,
                'periods_found', CASE WHEN s.missing_cause IN ('periods_missing',
                                                               'line_item_absent')
                                      THEN coalesce(s.periods_found, jsonb_build_array())
                                 END))
            WHEN 'outdated' THEN jsonb_set(
                jsonb_set(s.base, ARRAY['cause'], to_jsonb('outdated'::text)),
                ARRAY['outdated'],
                jsonb_build_object('fundamentals',
                                   jsonb_build_object('latest_period_end', s.as_of,
                                                      'stale_before', s.stale_before)))
            WHEN 'not_computable' THEN jsonb_set(
                jsonb_set(s.base, ARRAY['cause'], to_jsonb('prior_year_base_not_positive'::text)),
                ARRAY['prior_year_base'], to_jsonb(s.prior_sum))
            ELSE s.base
       END,
       'fundamentals'::text
  FROM statused s
