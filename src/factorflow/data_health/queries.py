"""Parameterised reads of the data-health-reader (component design 2.4, DEC-0201).

Every constant is one read and is executed with bound parameters only. The
column aliases of ``PROBLEM_COUNT_SQL`` are the ``Problems`` field names, so a
caller maps the row field for field.
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
