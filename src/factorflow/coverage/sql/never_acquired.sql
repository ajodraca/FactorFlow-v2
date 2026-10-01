-- True when no observation row exists anywhere in the store (DAC-E6-7, DAC-E6-S1-2).
-- Kept separate from coverage.sql: a filter that matches nothing is not never-acquired.
SELECT NOT (EXISTS (SELECT 1 FROM daily_bar) OR EXISTS (SELECT 1 FROM fundamental_observation) OR EXISTS (SELECT 1 FROM corporate_action) OR EXISTS (SELECT 1 FROM instrument_reference)) AS never_acquired;
