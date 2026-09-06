"""Guards against drift between the applied_migrations DDL constant and the
design doc.

component-design-market-data-store.md section 2.2 reproduces the
`applied_migrations` definition so this component's design and
CAP-001-E1-S2's schema-migrator design cannot drift. This test pins the
constant this story exports to that exact text.
"""

from factorflow.db.applied_migrations import APPLIED_MIGRATIONS_DDL

# Verbatim from component-design-market-data-store.md section 2.2.
EXPECTED_DDL = """\
CREATE TABLE IF NOT EXISTS applied_migrations (
    version     integer     PRIMARY KEY,
    name        text        NOT NULL,
    checksum    text        NOT NULL,
    applied_at  timestamptz NOT NULL DEFAULT now()
);
"""


def test_applied_migrations_ddl_matches_design_verbatim() -> None:
    assert APPLIED_MIGRATIONS_DDL == EXPECTED_DDL
