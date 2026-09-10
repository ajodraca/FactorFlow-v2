"""Canonical request-bound constants shared across route modules.

Component design: `component-design-ingestion-api.md` section 2.4a. This
story (CAP-001-E2-S3) is the first whose acceptance criteria require these
values; later route stories (runs, coverage) import from here rather than
redeclare any of them.
"""

MAX_HISTORY_DEPTH_YEARS = 50
"""A sanity bound against typos, not plan enforcement. Comfortably beyond
Massive's deepest tier -- Advanced reaches back to September 2003, so about
23 years -- so it never constrains a legitimate request on any plan."""

MIN_HISTORY_DEPTH_YEARS = 1
"""Already enforced by the store's `acquisition_run_depth_positive`
constraint; restated here so the API rejects before the store has to."""

DEFAULT_PAGE_SIZE = 50
"""Fills a virtualised viewport with room to scroll."""

MAX_PAGE_SIZE = 500
"""Bounds one response payload. At 3000 instruments the coverage set spans
about 60 pages at the default and 6 at the maximum."""

MAX_SYMBOLS_PER_REQUEST = 1000
"""Bounds request size and the per-symbol validation loop. Adding the full
3000-instrument universe takes three requests. This is a cap on one request,
not on the list -- no maximum instrument count exists, per the
`instrument-list-service` design."""
