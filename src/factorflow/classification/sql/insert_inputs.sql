-- Append the named factors' rows of the temporary table inputs to factor_input
-- (factor-engine design 2.3 step 5; DEC-0115). A missing input's detail gains the
-- instrument's last acquisition outcome for the data type it lacks, so the evidence can
-- say what the last download of it found (AC-12). Writes only factor_input.
-- CAP-002-E2-S3; CAP-002-E2-S4 runs it again for momentum.
INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, value, as_of,
                          known_on, restated_possible, detail)
SELECT %(set_id)s::uuid, i.instrument_id, i.factor, i.input_name, i.status, i.value, i.as_of,
       i.known_on, i.restated_possible,
       CASE WHEN a.instrument_id IS NULL THEN i.detail
            ELSE jsonb_set(i.detail, ARRAY['last_acquisition'],
                           jsonb_build_object('data_type', a.data_type,
                                              'outcome', a.last_outcome,
                                              'acquired_at', a.last_acquired_at))
       END
  FROM inputs i
  LEFT JOIN acquisition_state a
         ON i.status = 'missing'
        AND a.instrument_id = i.instrument_id
        AND a.data_type = i.missing_data_type
 WHERE i.factor = ANY(%(factors)s::text[])
