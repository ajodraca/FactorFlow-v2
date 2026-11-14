"""Parameterised reads of the data-health-reader (component design 2.4, DEC-0201).

Every constant is one read and is executed with bound parameters only. The
column aliases of ``PROBLEM_COUNT_SQL`` are the ``Problems`` field names, so a
caller maps the row field for field.

The four attention statements (component design 2.3 and 2.6, DEC-0213 f) take no
parameters: each is one aggregate read, so the attention read is a fixed set of
statements whatever the roster size (AC-28).
"""

from typing import Final

# A followed stock has a problem when it is active and any of its acquisition
# rows ended `failed` or `not_found`; each failure's facts come from the result
# row that outcome was recorded by (DEC-0201). Keyset page by symbol.
PROBLEM_ROWS_SQL: Final[str] = """
SELECT i.symbol,
       s.data_type,
       s.last_outcome            AS outcome,
       r.reason,
       r.attempts,
       r.completed_at,
       s.last_run_id             AS run_id
  FROM instrument i
  JOIN acquisition_state s      ON s.instrument_id = i.instrument_id
  JOIN run_instrument_result r  ON r.run_id = s.last_run_id
                               AND r.instrument_id = s.instrument_id
                               AND r.data_type = s.data_type
 WHERE i.lifecycle = 'active'
   AND s.last_outcome IN ('failed', 'not_found')
   AND i.symbol IN (
         SELECT DISTINCT i2.symbol
           FROM instrument i2
           JOIN acquisition_state s2 ON s2.instrument_id = i2.instrument_id
          WHERE i2.lifecycle = 'active'
            AND s2.last_outcome IN ('failed', 'not_found')
            AND (%(cursor)s::text IS NULL OR i2.symbol > %(cursor)s)
          ORDER BY i2.symbol
          LIMIT %(limit_plus_one)s)
 ORDER BY i.symbol, s.data_type
"""

# The same predicate, counted: the rail count, the attention block and
# `affected_count` are this one set (AC-16).
PROBLEM_COUNT_SQL: Final[str] = """
SELECT count(DISTINCT i.instrument_id)                                  AS stock_count,
       COALESCE((array_agg(DISTINCT i.symbol ORDER BY i.symbol))[1:3], '{}') AS symbols,
       max(r.completed_at)                                              AS newest_completed_at
  FROM instrument i
  JOIN acquisition_state s      ON s.instrument_id = i.instrument_id
  JOIN run_instrument_result r  ON r.run_id = s.last_run_id
                               AND r.instrument_id = s.instrument_id
                               AND r.data_type = s.data_type
 WHERE i.lifecycle = 'active'
   AND s.last_outcome IN ('failed', 'not_found')
"""

# Q1 of the attention read: the followed count, and `now()` as `checked_at`
# (the caller's transaction start, component design 2.3).
FOLLOWED_COUNT_SQL: Final[str] = """
SELECT count(*) AS followed_count,
       now()    AS checked_at
  FROM instrument
 WHERE lifecycle = 'active'
"""

# Q2: the latest prices coverage end over active instruments (system design 4.2).
PRICES_AS_OF_SQL: Final[str] = """
SELECT max(c.covered_to) AS prices_as_of
  FROM coverage_segment c
  JOIN instrument i ON i.instrument_id = c.instrument_id
 WHERE i.lifecycle = 'active'
   AND c.data_type = 'prices'
"""

# Q4: the run with the greatest `requested_at`, with its progress in the same
# statement. `done` is the instruments holding a result for all four data types
# in that run; `(run_id, instrument_id, data_type)` is the primary key, so
# `count(*) = 4` counts data types. The order repeats the Runs list's, so this
# run and the health strip's most recent run are the same run.
LATEST_DOWNLOAD_SQL: Final[str] = """
SELECT r.run_id,
       r.state,
       r.requested_at,
       r.started_at,
       r.ended_at,
       r.instruments_named,
       (SELECT count(*)
          FROM (SELECT x.instrument_id
                  FROM run_instrument_result x
                 WHERE x.run_id = r.run_id
                 GROUP BY x.instrument_id
                HAVING count(*) = 4) AS complete) AS done
  FROM acquisition_run r
 ORDER BY r.requested_at DESC, r.run_id DESC
 LIMIT 1
"""

# Q5: the run with the greatest `ended_at` among the five terminal states, with
# its recorded state and failure reason. A running download never displaces it.
LATEST_TERMINAL_SQL: Final[str] = """
SELECT run_id, state, ended_at, failure_reason
  FROM acquisition_run
 WHERE state IN ('succeeded', 'partial', 'failed', 'cancelled', 'abandoned')
 ORDER BY ended_at DESC, run_id DESC
 LIMIT 1
"""
