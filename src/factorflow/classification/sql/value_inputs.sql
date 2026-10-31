-- book_to_price, earnings_yield and fcf_yield for every active instrument (factor-engine
-- design 2.4; DEC-0055 (1), (5), (6), (7); DEC-0116). Creates the temporary table inputs,
-- which growth_inputs.sql and CAP-002-E2-S4's momentum_inputs.sql insert into (DEC-0115).
-- Reads only. CAP-002-E2-S3.
CREATE TEMP TABLE inputs ON COMMIT DROP AS
WITH roster AS (
    SELECT unnest(%(active_ids)s::bigint[]) AS instrument_id
),
line_item AS (
    -- The seven line items with their bound payload keys and signs. A NULL key is one the
    -- owner has not supplied yet (line_items.REQUIRES_INPUT).
    SELECT m.name, m.statement_type, m.payload_key, m.sign
      FROM unnest(%(line_item_names)s::text[], %(line_item_statement_types)s::text[],
                  %(line_item_keys)s::text[], %(line_item_signs)s::integer[])
           AS m (name, statement_type, payload_key, sign)
),
needed (input_name, line_items, window_type) AS (
    -- The line items each input reads and the statement type of its trailing window.
    -- Market capitalisation needs shares outstanding for every input.
    VALUES ('book_to_price', ARRAY['book_equity', 'shares_outstanding'], NULL::text),
           ('earnings_yield', ARRAY['net_income', 'shares_outstanding'], 'income_statement'),
           ('fcf_yield', ARRAY['operating_cash_flow', 'capital_expenditure',
                               'shares_outstanding'], 'cash_flow_statement')
),
used AS (
    -- The rows an input reads: the most recent quarterly balance sheet and the four
    -- quarters of its trailing window.
    SELECT r.instrument_id, n.input_name, s.statement_type, s.fiscal_period_end,
           s.observed_on, s.period_rank, s.payload, s.backfilled,
           jsonb_build_object('statement_type', s.statement_type,
                              'fiscal_period_end', s.fiscal_period_end,
                              'observed_on', s.observed_on,
                              'provider_filing_date', s.provider_filing_date,
                              'backfilled', s.backfilled) AS period
      FROM roster r
      CROSS JOIN needed n
      JOIN stmt s ON s.instrument_id = r.instrument_id
     WHERE (s.statement_type = 'balance_sheet' AND s.period_rank = 1)
        OR (s.statement_type = n.window_type AND s.ttm_slot IS NOT NULL)
),
amount AS (
    -- Each needed line item of each row used, times its sign. A value is read only from a
    -- JSON number or a JSON string holding a plain decimal, checked before the cast, so
    -- anything else reads as absent rather than failing the set (DEC-0116 (4),
    -- DEC-0117 (2)).
    SELECT u.instrument_id, u.input_name, m.name,
           CASE WHEN jsonb_typeof(u.payload -> m.payload_key) IN ('number', 'string')
                 AND u.payload ->> m.payload_key ~ '^-?[0-9]+(\.[0-9]+)?$'
                THEN (u.payload ->> m.payload_key)::numeric * m.sign
           END AS amount
      FROM used u
      JOIN needed n USING (input_name)
      JOIN line_item m ON m.statement_type = u.statement_type AND m.name = ANY(n.line_items)
),
items AS (
    SELECT instrument_id, input_name,
           sum(amount) FILTER (WHERE name = 'book_equity') AS book_equity,
           sum(amount) FILTER (WHERE name = 'shares_outstanding') AS shares_outstanding,
           sum(amount) FILTER (WHERE name = 'net_income') AS net_income,
           sum(amount) FILTER (WHERE name = 'operating_cash_flow') AS operating_cash_flow,
           sum(amount) FILTER (WHERE name = 'capital_expenditure') AS capital_expenditure,
           array_agg(DISTINCT name ORDER BY name) FILTER (WHERE amount IS NULL) AS absent
      FROM amount
     GROUP BY instrument_id, input_name
),
periods AS (
    SELECT instrument_id, input_name,
           count(*) FILTER (WHERE statement_type = 'balance_sheet') AS balance_sheets,
           count(*) FILTER (WHERE statement_type <> 'balance_sheet') AS window_quarters,
           max(fiscal_period_end) FILTER (WHERE statement_type = 'balance_sheet')
               AS balance_sheet_period_end,
           -- The earliest of the latest period ends used (DEC-0116 (3)).
           min(fiscal_period_end) FILTER (WHERE period_rank = 1) AS as_of,
           max(observed_on) AS known_on,
           bool_or(backfilled) AS restated,
           jsonb_agg(period ORDER BY statement_type, fiscal_period_end DESC) AS periods
      FROM used
     GROUP BY instrument_id, input_name
),
found AS (
    -- Every quarterly period held of the statement types an input reads.
    SELECT r.instrument_id, n.input_name,
           jsonb_agg(jsonb_build_object('statement_type', s.statement_type,
                                        'fiscal_period_end', s.fiscal_period_end)
                     ORDER BY s.statement_type, s.fiscal_period_end DESC) AS periods_found
      FROM roster r
      CROSS JOIN needed n
      JOIN stmt s ON s.instrument_id = r.instrument_id
                 AND s.statement_type IN ('balance_sheet', n.window_type)
     GROUP BY r.instrument_id, n.input_name
),
bar AS (
    -- The latest bar: the latest session, then its latest observation (DEC-0055 (5), (6)).
    SELECT r.instrument_id, b.session_date, b.close_price, b.observed_on
      FROM roster r
      CROSS JOIN LATERAL (
          SELECT d.session_date, d.close_price, d.observed_on
            FROM daily_bar d
           WHERE d.instrument_id = r.instrument_id
           ORDER BY d.session_date DESC, d.observed_on DESC, d.recorded_at DESC
           LIMIT 1
      ) b
),
judged AS (
    SELECT r.instrument_id, n.input_name, n.window_type, p.balance_sheets, p.window_quarters,
           p.as_of, p.periods, p.restated, i.absent, f.periods_found, b.session_date AS bar_date,
           -- DEC-0055 (7): the latest observation among the statement rows and the bar.
           greatest(p.known_on, b.observed_on) AS known_on,
           CASE n.input_name
                WHEN 'book_to_price' THEN i.book_equity
                WHEN 'earnings_yield' THEN i.net_income
                WHEN 'fcf_yield' THEN i.operating_cash_flow - i.capital_expenditure
           END AS numerator,
           -- DEC-0055 (6): the latest close times the newest balance sheet's shares.
           b.close_price * i.shares_outstanding AS market_capitalisation,
           ARRAY(SELECT u.x FROM unnest(n.line_items) WITH ORDINALITY AS u (x, k)
                  WHERE u.x = ANY(%(unresolved)s::text[]) ORDER BY u.k) AS unresolved,
           (%(classification_date)s::date
               - make_interval(months => %(stale_months)s::integer))::date AS stale_before,
           jsonb_build_object('periods', p.periods,
                              'balance_sheet_period_end', p.balance_sheet_period_end,
                              'shares_outstanding', i.shares_outstanding,
                              'close', b.close_price,
                              'bar_date', b.session_date,
                              'bar_observed_on', b.observed_on,
                              'market_capitalisation', b.close_price * i.shares_outstanding)
               AS base,
           b.instrument_id IS NOT NULL AS has_bar
      FROM roster r
      CROSS JOIN needed n
      LEFT JOIN periods p ON p.instrument_id = r.instrument_id AND p.input_name = n.input_name
      LEFT JOIN items i ON i.instrument_id = r.instrument_id AND i.input_name = n.input_name
      LEFT JOIN found f ON f.instrument_id = r.instrument_id AND f.input_name = n.input_name
      LEFT JOIN bar b ON b.instrument_id = r.instrument_id
),
decided AS (
    -- Missing before outdated before not computable (DEC-0116 (1), (2)).
    SELECT j.*,
           CASE WHEN cardinality(j.unresolved) > 0 THEN %(unresolved_cause)s::text
                WHEN coalesce(j.balance_sheets, 0) = 0
                  OR (j.window_type IS NOT NULL AND j.window_quarters = 0)
                THEN 'periods_missing'
                WHEN j.absent IS NOT NULL THEN 'line_item_absent'
                WHEN NOT j.has_bar THEN 'price_missing'
           END AS missing_cause,
           j.as_of < j.stale_before AS fundamentals_outdated,
           j.bar_date < %(latest_trading_day)s::date AS prices_outdated
      FROM judged j
),
statused AS (
    SELECT d.*,
           CASE WHEN d.missing_cause IS NOT NULL THEN 'missing'
                WHEN d.fundamentals_outdated OR d.prices_outdated THEN 'outdated'
                WHEN d.market_capitalisation <= 0 THEN 'not_computable'
                ELSE 'present'
           END AS status
      FROM decided d
)
SELECT s.instrument_id,
       'value'::text AS factor,
       s.input_name,
       s.status,
       CASE WHEN s.status = 'present' THEN s.numerator / s.market_capitalisation END AS value,
       CASE WHEN s.status <> 'missing' THEN s.as_of END AS as_of,
       CASE WHEN s.status <> 'missing' THEN s.known_on END AS known_on,
       -- Marked when any statement row detail.periods lists is backfilled; a missing
       -- input lists none (AC-23, DAC-E2-11, DEC-0056, DEC-0122).
       s.status <> 'missing' AND s.restated AS restated_possible,
       CASE s.status
            WHEN 'missing' THEN jsonb_strip_nulls(jsonb_build_object(
                'cause', s.missing_cause,
                'line_items', CASE s.missing_cause
                                   WHEN %(unresolved_cause)s::text THEN to_jsonb(s.unresolved)
                                   WHEN 'line_item_absent' THEN to_jsonb(s.absent)
                              END,
                'periods_found', CASE WHEN s.missing_cause IN ('periods_missing',
                                                               'line_item_absent')
                                      THEN coalesce(s.periods_found, jsonb_build_array())
                                 END))
            WHEN 'outdated' THEN jsonb_set(
                jsonb_set(s.base, ARRAY['cause'], to_jsonb('outdated'::text)),
                ARRAY['outdated'],
                jsonb_strip_nulls(jsonb_build_object(
                    'fundamentals', CASE WHEN s.fundamentals_outdated
                                         THEN jsonb_build_object('latest_period_end', s.as_of,
                                                                 'stale_before', s.stale_before)
                                    END,
                    'prices', CASE WHEN s.prices_outdated
                                   THEN jsonb_build_object('bar_date', s.bar_date,
                                                           'latest_trading_day',
                                                           %(latest_trading_day)s::date)
                              END)))
            WHEN 'not_computable' THEN jsonb_set(
                s.base, ARRAY['cause'], to_jsonb('market_capitalisation_not_positive'::text))
            ELSE s.base
       END AS detail,
       CASE WHEN s.missing_cause = 'price_missing' THEN 'prices' ELSE 'fundamentals' END
           AS missing_data_type
  FROM statused s
