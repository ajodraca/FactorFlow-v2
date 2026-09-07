"""Fixed constants shared by the schema migrator and its tests.

The advisory lock key below is picked once, here, per
`component-design-schema-migrator.md` section 14 open question 2, which
explicitly defers the value to the implementing story rather than inventing
one in the design.

This value must never change once shipped. `apply_pending` takes
`pg_advisory_lock(ADVISORY_LOCK_KEY)` to serialise concurrently-starting
migrators (component design section 2.4, DAC-E1-5). A migrator built from a
changed key would no longer contend for the same lock as one built from the
old key, silently defeating the serialisation two containers rely on.
"""

ADVISORY_LOCK_KEY: int = 0x46414354_4F52464C
"""Arbitrary but fixed 64-bit key for `pg_advisory_lock`. Spells roughly
"FACT ORFL" in ASCII hex, chosen only to be a recognisable fixed constant —
the value itself carries no other meaning."""
