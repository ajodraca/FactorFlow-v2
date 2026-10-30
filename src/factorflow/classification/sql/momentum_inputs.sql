-- return_3m, return_6m and return_12m for every active instrument (factor-engine design 2.4;
-- DEC-0055 (3), (4), (5), (7); DEC-0116 (1), (2), (5); DEC-0117; DEC-0118; DEC-0241). Bars are
-- stored unadjusted (DEC-0001), so splits and dividends are applied here, at read time.
-- Inserts into the temporary table inputs that value_inputs.sql creates; insert_inputs.sql
-- writes the rows to factor_input (DEC-0115). Reads only. CAP-002-E2-S4.
--
-- Every bar lookup takes a session's latest observation, by observed_on and then recorded_at
-- (DEC-0117 (1)), so a re-acquired bar is used as currently known. That is design 2.4's
-- daily_bar_latest, each lookup one probe of idx_daily_bar_instrument_session.
INSERT INTO inputs (instrument_id, factor, input_name, status, value, as_of, known_on,
                    restated_possible, detail, missing_data_type)
WITH roster AS (
    SELECT unnest(%(active_ids)s::bigint[]) AS instrument_id
),
held AS (
    -- Each stock's latest bar, with no upper bound, which decides price currency
    -- (DEC-0055 (5)), and E: its latest session on or before D minus the lag (DEC-0055 (3)).
    SELECT r.instrument_id, t.e_target, l.latest_session,
           e.session_date AS e_session, e.close_price AS e_close, e.observed_on AS e_observed_on
      FROM roster r
     CROSS JOIN (SELECT (%(classification_date)s::date
                         - make_interval(months => %(momentum_lag_months)s::integer))::date
                        AS e_target) t
     CROSS JOIN LATERAL (SELECT max(d.session_date) AS latest_session
                           FROM daily_bar d
                          WHERE d.instrument_id = r.instrument_id) l
      LEFT JOIN LATERAL (SELECT d.session_date, d.close_price, d.observed_on
                           FROM daily_bar d
                          WHERE d.instrument_id = r.instrument_id
                            AND d.session_date <= t.e_target
                          ORDER BY d.session_date DESC, d.observed_on DESC, d.recorded_at DESC
                          LIMIT 1) e ON true
),
win AS (
    -- One row per active stock and window k: the roster, not the bars, drives the output.
    -- S_k is the latest session on or before E minus k months (DEC-0055 (3)).
    SELECT h.instrument_id, h.e_target, h.latest_session, h.e_session, h.e_close,
           h.e_observed_on, w.k, (h.e_session - make_interval(months => w.k))::date AS s_target,
           s.session_date AS s_session, s.close_price AS s_close, s.observed_on AS s_observed_on
      FROM held h
     CROSS JOIN unnest(%(momentum_windows)s::integer[]) AS w (k)
      LEFT JOIN LATERAL (SELECT d.session_date, d.close_price, d.observed_on
                           FROM daily_bar d
                          WHERE d.instrument_id = h.instrument_id
                            AND d.session_date
                                <= (h.e_session - make_interval(months => w.k))::date
                          ORDER BY d.session_date DESC, d.observed_on DESC, d.recorded_at DESC
                          LIMIT 1) s ON true
),
latest_action AS (
    -- Each split's and dividend's latest observation (DEC-0117 (1)); ticker changes and IPOs
    -- adjust no price.
    SELECT DISTINCT ON (c.instrument_id, c.action_type, c.effective_on)
           c.instrument_id, c.action_type, c.effective_on, c.observed_on, c.payload
      FROM corporate_action c
     WHERE c.instrument_id = ANY(%(active_ids)s::bigint[])
       AND c.action_type IN ('split', 'dividend')
     ORDER BY c.instrument_id, c.action_type, c.effective_on,
              c.observed_on DESC, c.recorded_at DESC
),
parsed AS (
    -- A value is read only from a JSON number or a JSON string holding a plain decimal,
    -- checked before the cast, so anything else reads as absent (DEC-0117 (2)).
    SELECT l.*,
           CASE WHEN jsonb_typeof(l.payload -> 'split_from') IN ('number', 'string')
                 AND l.payload ->> 'split_from' ~ '^-?[0-9]+(\.[0-9]+)?$'
                THEN (l.payload ->> 'split_from')::numeric
           END AS split_from,
           CASE WHEN jsonb_typeof(l.payload -> 'split_to') IN ('number', 'string')
                 AND l.payload ->> 'split_to' ~ '^-?[0-9]+(\.[0-9]+)?$'
                THEN (l.payload ->> 'split_to')::numeric
           END AS split_to,
           CASE WHEN jsonb_typeof(l.payload -> 'cash_amount') IN ('number', 'string')
                 AND l.payload ->> 'cash_amount' ~ '^-?[0-9]+(\.[0-9]+)?$'
                THEN (l.payload ->> 'cash_amount')::numeric
           END AS cash_amount
      FROM latest_action l
),
action AS (
    -- A split is usable when split_from and split_to are positive, a dividend when
    -- cash_amount is not negative (DEC-0117 (2)). A usable split carries the logarithm of its
    -- price factor split_from / split_to, so a product of factors is exp(sum(log_factor)).
    SELECT u.*,
           CASE WHEN u.action_type = 'split' AND u.usable
                THEN ln(u.split_from / u.split_to)
           END AS log_factor
      FROM (SELECT p.*,
                   CASE p.action_type
                        WHEN 'split' THEN coalesce(p.split_from > 0 AND p.split_to > 0, false)
                        WHEN 'dividend' THEN coalesce(p.cash_amount >= 0, false)
                   END AS usable
              FROM parsed p) u
),
split_set AS (
    -- Each stock's usable splits, which every split factor below is a sum over.
    SELECT a.instrument_id, array_agg(a.effective_on) AS effective_on,
           array_agg(a.log_factor) AS log_factor
      FROM action a
     WHERE a.log_factor IS NOT NULL
     GROUP BY a.instrument_id
),
dividend_split AS (
    -- Every split and dividend on or before E. A dividend carries its prior session, the
    -- stock's latest bar before the ex-date, which lies in [S_k, E) for a dividend in a window
    -- because S_k is itself a bar (DEC-0118 (3)), and two split factors: its prior close is
    -- scaled by the usable splits after the prior session and its cash amount by those
    -- strictly after the ex-date, both on or before E, so a split on the ex-date itself scales
    -- the close but not the cash amount (design 2.4, DEC-0118 (2)).
    SELECT a.*, p.session_date AS prior_session, p.close_price AS prior_close,
           p.observed_on AS prior_observed_on,
           (SELECT exp(sum(x.log_factor))
              FROM unnest(sp.effective_on, sp.log_factor) AS x (effective_on, log_factor)
             WHERE x.effective_on > p.session_date
               AND x.effective_on <= h.e_session) AS close_factor,
           (SELECT exp(sum(x.log_factor))
              FROM unnest(sp.effective_on, sp.log_factor) AS x (effective_on, log_factor)
             WHERE x.effective_on > a.effective_on
               AND x.effective_on <= h.e_session) AS cash_factor
      FROM action a
      JOIN held h ON h.instrument_id = a.instrument_id AND a.effective_on <= h.e_session
      LEFT JOIN split_set sp ON sp.instrument_id = a.instrument_id
      LEFT JOIN LATERAL (SELECT d.session_date, d.close_price, d.observed_on
                           FROM daily_bar d
                          WHERE a.action_type = 'dividend'
                            AND d.instrument_id = a.instrument_id
                            AND d.session_date < a.effective_on
                          ORDER BY d.session_date DESC, d.observed_on DESC, d.recorded_at DESC
                          LIMIT 1) p ON true
),
priced AS (
    -- Design 2.4: a usable dividend multiplies the return factor by
    -- 1 + cash_amount x split factor / prior adjusted close. A prior close that is not
    -- positive is never divided by; the windows holding that dividend are missing (DEC-0241).
    SELECT s.*,
           s.prior_close * coalesce(s.close_factor, 1) AS prior_adjusted_close,
           coalesce(s.cash_factor, 1) AS cash_split_factor,
           CASE WHEN s.action_type = 'dividend' AND s.usable AND s.prior_close > 0
                THEN ln(1 + s.cash_amount * coalesce(s.cash_factor, 1)
                            / (s.prior_close * coalesce(s.close_factor, 1)))
           END AS log_term
      FROM dividend_split s
),
judged AS (
    -- Each window over its splits and dividends, effective_on in (S_k, E] (DEC-0055 (4)).
    -- S_k's price factor is the product over every usable split in the window, each being
    -- after S_k; no split is after E and on or before it, so E's adjusted close is its close.
    SELECT w.instrument_id, w.k, w.latest_session, w.e_target, w.s_target, w.e_session,
           w.e_close, w.s_session, w.s_close,
           w.s_close * coalesce(exp(sum(a.log_factor)), 1) AS s_adjusted_close,
           coalesce(exp(sum(a.log_term)), 1) AS dividend_factor,
           coalesce(bool_or(NOT a.usable), false) AS unusable,
           -- The dividends whose prior session's close is not positive (DEC-0241).
           jsonb_agg(jsonb_build_object('effective_on', a.effective_on,
                                        'prior_session', jsonb_build_object(
                                            'session_date', a.prior_session,
                                            'close', a.prior_close,
                                            'observed_on', a.prior_observed_on))
                     ORDER BY a.effective_on)
               FILTER (WHERE a.action_type = 'dividend' AND a.prior_close <= 0)
               AS non_positive_dividends,
           -- DEC-0118 (1), DEC-0055 (7): the latest observation of the E and S_k bars, of
           -- every split and dividend in the window and of each dividend's prior session.
           greatest(w.e_observed_on, w.s_observed_on, max(a.observed_on),
                    max(a.prior_observed_on)) AS known_on,
           jsonb_build_object('session_date', w.e_session, 'close', w.e_close,
                              'observed_on', w.e_observed_on) AS e_bar,
           jsonb_build_object('session_date', w.s_session, 'close', w.s_close,
                              'observed_on', w.s_observed_on) AS s_bar,
           -- The actions that cannot be read (DEC-0117 (3)).
           jsonb_agg(jsonb_build_object('action_type', a.action_type,
                                        'effective_on', a.effective_on,
                                        'observed_on', a.observed_on,
                                        'payload', a.payload)
                     ORDER BY a.effective_on, a.action_type) FILTER (WHERE NOT a.usable)
               AS unusable_actions,
           coalesce(jsonb_agg(jsonb_build_object('effective_on', a.effective_on,
                                                 'split_from', a.split_from,
                                                 'split_to', a.split_to,
                                                 'observed_on', a.observed_on)
                              ORDER BY a.effective_on) FILTER (WHERE a.log_factor IS NOT NULL),
                    jsonb_build_array()) AS splits,
           coalesce(jsonb_agg(jsonb_build_object('effective_on', a.effective_on,
                                                 'cash_amount', a.cash_amount,
                                                 'observed_on', a.observed_on,
                                                 'split_factor', a.cash_split_factor,
                                                 'prior_session', jsonb_build_object(
                                                     'session_date', a.prior_session,
                                                     'close', a.prior_close,
                                                     'observed_on', a.prior_observed_on),
                                                 'prior_adjusted_close', a.prior_adjusted_close)
                              ORDER BY a.effective_on)
                        FILTER (WHERE a.action_type = 'dividend' AND a.usable),
                    jsonb_build_array()) AS dividends
      FROM win w
      LEFT JOIN priced a ON a.instrument_id = w.instrument_id
                        AND a.effective_on > w.s_session
                        AND a.effective_on <= w.e_session
     GROUP BY w.instrument_id, w.k, w.latest_session, w.e_target, w.s_target, w.e_session,
              w.e_close, w.e_observed_on, w.s_session, w.s_close, w.s_observed_on
),
priced_window AS (
    -- A bar the window uses whose close is not positive (DEC-0241).
    SELECT j.*,
           coalesce(j.e_close <= 0 OR j.s_close <= 0 OR j.non_positive_dividends IS NOT NULL,
                    false) AS price_not_positive
      FROM judged j
),
statused AS (
    -- Missing before outdated (DEC-0116 (1), DEC-0118 (4)), and among the missing causes a
    -- missing boundary, then a close that is not positive, then an unusable payload
    -- (DEC-0241 (2)). A momentum input is never not_computable (design 2.4).
    SELECT j.*,
           CASE WHEN j.e_session IS NULL THEN 'E'
                WHEN j.s_session IS NULL THEN concat('S_', j.k)
           END AS boundary,
           CASE WHEN j.e_session IS NULL OR j.s_session IS NULL OR j.price_not_positive
                  OR j.unusable THEN 'missing'
                WHEN j.latest_session < %(latest_trading_day)s::date THEN 'outdated'
                ELSE 'present'
           END AS status,
           jsonb_build_object('window_months', j.k,
                              'E', j.e_bar,
                              'S', j.s_bar,
                              'adjusted_close', jsonb_build_object('E', j.e_close,
                                                                   'S', j.s_adjusted_close),
                              'splits', j.splits,
                              'dividends', j.dividends) AS base
      FROM priced_window j
)
SELECT s.instrument_id,
       'momentum'::text AS factor,
       concat('return_', s.k, 'm') AS input_name,
       s.status,
       -- A value only for a present input (DEC-0116 (5)): the total return over (S_k, E].
       CASE WHEN s.status = 'present'
            THEN (s.e_close / s.s_adjusted_close) * s.dividend_factor - 1
       END AS value,
       s.e_session AS as_of,
       s.known_on,
       -- The constant false: momentum is never marked (DAC-E2-S6-2, CAP-002-E2-S6).
       false AS restated_possible,
       CASE WHEN s.boundary = 'E'
            THEN jsonb_build_object('boundary', s.boundary, 'on_or_before', s.e_target,
                                    'window_months', s.k)
            WHEN s.boundary IS NOT NULL
            THEN jsonb_build_object('boundary', s.boundary, 'on_or_before', s.s_target,
                                    'window_months', s.k, 'E', s.e_bar)
            WHEN s.price_not_positive
            THEN jsonb_build_object('cause', 'price_not_positive',
                                    'window_months', s.k, 'E', s.e_bar, 'S', s.s_bar,
                                    'dividends', coalesce(s.non_positive_dividends,
                                                          jsonb_build_array()))
            WHEN s.unusable
            THEN jsonb_build_object('cause', 'corporate_action_payload_unusable',
                                    'actions', s.unusable_actions,
                                    'window_months', s.k, 'E', s.e_bar, 'S', s.s_bar)
            WHEN s.status = 'outdated'
            THEN jsonb_set(jsonb_set(s.base, ARRAY['cause'], to_jsonb('outdated'::text)),
                           ARRAY['outdated'],
                           jsonb_build_object('prices', jsonb_build_object(
                               'bar_date', s.latest_session,
                               'latest_trading_day', %(latest_trading_day)s::date)))
            ELSE s.base
       END AS detail,
       'prices'::text AS missing_data_type
  FROM statused s
