-- Deliberately broken migration used only by the exit-4 test (T004, T012).
-- The INSERT targets a table that does not exist, so it fails at execution
-- time and the migrator must roll back the whole file.
INSERT INTO does_not_exist VALUES (1);
