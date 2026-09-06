"""The `applied_migrations` table definition.

Owned by `market-data-store` (component-design-market-data-store.md section
2.2), reproduced here as an importable constant rather than as a migration
file. `applied_migrations` is created by the schema-migrator
(CAP-001-E1-S2's `src/factorflow/db/migrator.py`) before the first numbered
migration file runs, because the migrator has to read it to decide what to
apply — a migration file cannot create the table it would then need to
already exist to record itself into.

This constant is the single source both designs reference so they cannot
drift; `tests/unit/test_applied_migrations_ddl_matches_design.py` pins it to
the design doc's text verbatim.
"""

APPLIED_MIGRATIONS_DDL = """\
CREATE TABLE IF NOT EXISTS applied_migrations (
    version     integer     PRIMARY KEY,
    name        text        NOT NULL,
    checksum    text        NOT NULL,
    applied_at  timestamptz NOT NULL DEFAULT now()
);
"""
