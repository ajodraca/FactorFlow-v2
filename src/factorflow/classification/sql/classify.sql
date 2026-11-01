-- One factor's classification rows for the build's set (CAP-002-E2-S5; factor-engine design
-- 2.5). Runs once per factor after peer_sets.sql and reads the committed factor_input rows of
-- this set for the active roster passed in (DEC-0119). The score is DEC-0053: each input's
-- z-score over the peer set with the sample standard deviation, the equal-weight mean of a
-- stock's z-scores, that composite re-standardised the same way, and percent_rank() x 100;
-- zero dispersion at either step contributes 0 instead of dividing by zero (DAC-E2-3).
-- Four row sets are written:
--   1. classified, for the peer set, when the factor is ranked (AC-9);
--   2. not_classified, for every other active stock, when it is ranked: the first input in the
--      factor's order that is not present, an absent row counting as missing, with its label
--      (bound in input_labels, parallel to input_names) and the cause (AC-12, DEC-0120);
--   3. not_classified, for every active stock, when it is not ranked: not_enough_stocks and
--      how many qualified (AC-14, DAC-E2-7);
--   4. not_classified, for every retired stock: retired (AC-15, DAC-E2-8).
WITH pf AS (
    SELECT ranked, qualified_count
      FROM classification_set_factor
     WHERE set_id = %(set_id)s::uuid
       AND factor = %(factor)s::text
),
inp AS (
    SELECT n.input_name, n.label, n.input_order
      FROM unnest(%(input_names)s::text[], %(input_labels)s::text[]) WITH ORDINALITY
           AS n (input_name, label, input_order)
),
active AS (
    SELECT unnest(%(active_ids)s::bigint[]) AS instrument_id
),
peer_ids AS (
    SELECT fi.instrument_id
      FROM factor_input fi
      JOIN active a USING (instrument_id)
     WHERE fi.set_id = %(set_id)s::uuid
       AND fi.factor = %(factor)s::text
       AND fi.status = 'present'
     GROUP BY fi.instrument_id
    HAVING count(*) = cardinality(%(input_names)s::text[])
),
peer AS (
    SELECT fi.instrument_id, fi.input_name, fi.value
      FROM factor_input fi
      JOIN peer_ids p USING (instrument_id)
     WHERE fi.set_id = %(set_id)s::uuid
       AND fi.factor = %(factor)s::text
),
z AS (
    SELECT instrument_id,
           CASE WHEN stddev_samp(value) OVER w = 0 THEN 0
                ELSE (value - avg(value) OVER w) / stddev_samp(value) OVER w
           END AS z
      FROM peer
    WINDOW w AS (PARTITION BY input_name)
),
composite AS (
    SELECT instrument_id, avg(z) AS c
      FROM z
     GROUP BY instrument_id
),
scored AS (
    SELECT instrument_id,
           CASE WHEN stddev_samp(c) OVER () = 0 THEN 0
                ELSE (c - avg(c) OVER ()) / stddev_samp(c) OVER ()
           END AS score
      FROM composite
),
ranked_scores AS (
    -- Ranked on the unrounded score; the columns keep 6 decimal places.
    SELECT instrument_id, score, 100 * percent_rank() OVER (ORDER BY score) AS percentile
      FROM scored
),
first_gap AS (
    SELECT DISTINCT ON (a.instrument_id)
           a.instrument_id, i.input_name, i.label, coalesce(fi.status, 'missing') AS status
      FROM active a
     CROSS JOIN inp i
      LEFT JOIN factor_input fi
        ON fi.set_id = %(set_id)s::uuid
       AND fi.factor = %(factor)s::text
       AND fi.instrument_id = a.instrument_id
       AND fi.input_name = i.input_name
     WHERE coalesce(fi.status, 'missing') <> 'present'
     ORDER BY a.instrument_id, i.input_order
),
marks AS (
    -- Each active stock's restatement mark: any of its inputs of this factor marked
    -- (DEC-0119, DEC-0122). The factor guard, not the input rows, is what keeps momentum
    -- unmarked (AC-23, DAC-E2-11).
    SELECT fi.instrument_id, bool_or(fi.restated_possible) AS restated
      FROM factor_input fi
      JOIN active a USING (instrument_id)
     WHERE fi.set_id = %(set_id)s::uuid
       AND fi.factor = %(factor)s::text
       AND %(factor)s::text IN ('value', 'growth')
     GROUP BY fi.instrument_id
)
INSERT INTO factor_classification
       (set_id, instrument_id, factor, status, score, percentile,
        reason_code, reason_input, reason_detail, restated_possible)
-- restated_possible is the stock's mark in the three active-stock row sets, false for a stock
-- with no input row, and false for a retired stock, which has no input (DEC-0122).
SELECT %(set_id)s::uuid, r.instrument_id, %(factor)s::text, 'classified',
       r.score, r.percentile, NULL, NULL, NULL, coalesce(m.restated, false)
  FROM ranked_scores r
  LEFT JOIN marks m USING (instrument_id), pf
 WHERE pf.ranked
UNION ALL
SELECT %(set_id)s::uuid, g.instrument_id, %(factor)s::text, 'not_classified',
       NULL, NULL,
       concat('input_', g.status),
       g.input_name,
       concat(g.label, ' ', CASE g.status WHEN 'missing' THEN 'missing'
                                          WHEN 'outdated' THEN 'outdated'
                                          WHEN 'not_computable' THEN 'not computable'
                                          END),
       coalesce(m.restated, false)
  FROM first_gap g
  LEFT JOIN marks m USING (instrument_id), pf
 WHERE pf.ranked
UNION ALL
SELECT %(set_id)s::uuid, a.instrument_id, %(factor)s::text, 'not_classified',
       NULL, NULL,
       'not_enough_stocks',
       NULL,
       concat(pf.qualified_count, ' of ', %(min_peer_set_size)s::int, ' stocks qualified'),
       coalesce(m.restated, false)
  FROM active a
  LEFT JOIN marks m USING (instrument_id), pf
 WHERE NOT pf.ranked
UNION ALL
SELECT %(set_id)s::uuid, gone.instrument_id, %(factor)s::text, 'not_classified',
       NULL, NULL,
       'retired',
       NULL,
       NULL,
       false
  FROM unnest(%(retired_ids)s::bigint[]) AS gone (instrument_id)
