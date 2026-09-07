-- Synthetic migration used only by this story's tests (T003). It lives here,
-- never under the real migrations/ directory, because the real directory
-- must contain only migrations this build actually ships.
CREATE TABLE test_only_marker (
    id integer PRIMARY KEY
);
