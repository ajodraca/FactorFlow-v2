-- The latest observation of every quarterly statement period of the active instruments
-- on or before the classification date, with its backfill flag and its slot in the
-- trailing-twelve-month and prior-year windows (factor-engine design 2.3 step 3 and 2.4;
-- DEC-0055 (1), DEC-0056). The windows follow DEC-0221, which replaces design 2.4's
-- 12-month span rule. Reads only. CAP-002-E2-S3.
CREATE TEMP TABLE stmt ON COMMIT DROP AS
WITH latest AS (
    -- Annual rows are excluded before the latest observation is chosen, so an FY row
    -- sharing a quarter's period end never displaces or joins that quarter.
    SELECT DISTINCT ON (f.instrument_id, f.statement_type, f.fiscal_period_end)
           f.instrument_id, f.statement_type, f.fiscal_period_end, f.payload,
           f.observed_on, f.provider_filing_date
      FROM fundamental_observation f
     WHERE f.instrument_id = ANY(%(active_ids)s::bigint[])
       AND f.statement_type IN ('balance_sheet', 'income_statement', 'cash_flow_statement')
       AND f.fiscal_period <> 'FY'
       AND f.fiscal_period_end <= %(classification_date)s::date
     ORDER BY f.instrument_id, f.statement_type, f.fiscal_period_end,
              f.observed_on DESC, f.recorded_at DESC
),
first_observed AS (
    -- The day FactorFlow first observed any fundamental of the instrument: every row it
    -- holds, of every statement type, period kind and version (DEC-0056).
    SELECT f.instrument_id, min(f.observed_on) AS first_observed_on
      FROM fundamental_observation f
     WHERE f.instrument_id = ANY(%(active_ids)s::bigint[])
     GROUP BY f.instrument_id
),
ranked AS (
    SELECT l.instrument_id, l.statement_type, l.fiscal_period_end, l.payload, l.observed_on,
           l.provider_filing_date,
           coalesce(l.provider_filing_date < o.first_observed_on, false) AS backfilled,
           row_number() OVER newest_first AS period_rank,
           -- Consecutive with the next older period: at most 4 months before it (DEC-0221).
           lead(l.fiscal_period_end) OVER newest_first
               >= l.fiscal_period_end - interval '4 months' AS consecutive
      FROM latest l
      JOIN first_observed o USING (instrument_id)
    WINDOW newest_first AS (PARTITION BY l.instrument_id, l.statement_type
                            ORDER BY l.fiscal_period_end DESC)
),
windows AS (
    -- The trailing window P1 to P4 is formed when its three adjacent pairs are
    -- consecutive; the prior-year window P5 to P8 when all seven pairs of P1 to P8 are
    -- (DEC-0221, DEC-0055 (1)). Too few periods leave a pair without an older end.
    SELECT instrument_id, statement_type,
           count(*) FILTER (WHERE period_rank <= 3 AND consecutive) = 3 AS trailing_formed,
           count(*) FILTER (WHERE period_rank <= 7 AND consecutive) = 7 AS prior_formed
      FROM ranked
     GROUP BY instrument_id, statement_type
)
-- A window that is not formed gives none of its rows a slot, and the inputs read it as
-- missing.
SELECT r.instrument_id, r.statement_type, r.fiscal_period_end, r.payload, r.observed_on,
       r.provider_filing_date, r.backfilled, r.period_rank,
       CASE WHEN w.trailing_formed AND r.period_rank <= 4 THEN r.period_rank END AS ttm_slot,
       CASE WHEN w.prior_formed AND r.period_rank BETWEEN 5 AND 8
            THEN r.period_rank - 4 END AS prior_slot
  FROM ranked r
  JOIN windows w USING (instrument_id, statement_type)
