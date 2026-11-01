"""Request bounds the classification API adds to the first capability's.

Component design: `component-design-classification-api.md` sections 2.1 and 2.4
(CAP-002-E1-S6). The first capability's bounds (`DEFAULT_PAGE_SIZE`,
`MAX_PAGE_SIZE`, `MAX_SYMBOLS_PER_REQUEST`) are imported from
`factorflow.api.bounds` where they are used and never redeclared here.
"""

MIN_COMPARE_SYMBOLS = 2
"""The fewest symbols a compare read of `GET /api/classifications` accepts (DEC-0070)."""

MAX_COMPARE_SYMBOLS = 6
"""The most symbols a compare read of `GET /api/classifications` accepts (DEC-0070)."""

MAX_UNIVERSE_NAME_LENGTH: int | None = None
"""[REQUIRES INPUT: maximum universe name length in characters]

`None` means no maximum is enforced because the owner has not stated one
(system design section 8 question 2; classification-api design 2.4 and
section 14 question 1). Until then the request models enforce a trimmed,
non-empty name only; setting this constant to the owner's answer enforces the
bound on create and rename with no other change.
"""
