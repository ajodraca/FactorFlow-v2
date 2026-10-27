-- Claim a run: one building set, stamped with the Chicago date (STD-UI-5; DEC-0125 adds the at parameter).
INSERT INTO classification_set (run_id, state, classification_date)
VALUES (%(run_id)s, 'building',
        (COALESCE(%(at)s::timestamptz, CURRENT_TIMESTAMP) AT TIME ZONE 'America/Chicago')::date)
RETURNING set_id;
