-- Each factor's peer-set size for the build's set (CAP-002-E2-S5; factor-engine design 2.5).
-- A stock qualifies on a factor when it is on the active roster and its present factor_input
-- rows for the factor number the factor's inputs, so an absent row disqualifies it as surely
-- as a missing one (DAC-E2-2, DEC-0119). Every factor gets a row, even with no qualifying
-- stock, and is ranked only at the floor (AC-14, DAC-E2-7).
INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked)
SELECT %(set_id)s::uuid,
       f.factor,
       count(q.instrument_id),
       count(q.instrument_id) >= %(min_peer_set_size)s
  FROM unnest(%(factors)s::text[], %(input_counts)s::int[]) AS f (factor, n_inputs)
  LEFT JOIN LATERAL (
        SELECT fi.instrument_id
          FROM factor_input fi
         WHERE fi.set_id = %(set_id)s::uuid
           AND fi.factor = f.factor
           AND fi.status = 'present'
           AND fi.instrument_id = ANY (%(active_ids)s::bigint[])
         GROUP BY fi.instrument_id
        HAVING count(*) = f.n_inputs
       ) q ON true
 GROUP BY f.factor
