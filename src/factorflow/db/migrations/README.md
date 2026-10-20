# Migrations

Numbered, forward-only SQL migration files, one file per migration, applied
in ascending order and recorded in `applied_migrations`.

## Conventions

- **Filename**: `NNNN_snake_case_name.sql` — four digits, ascending, no gaps.
- **One file, one transaction.** The migrator opens the transaction; a file
  must not contain `BEGIN` or `COMMIT`.
- **A file that has been applied is never edited.** A correction is a new,
  higher-numbered file, never a change to one already applied — the recorded
  checksum in `applied_migrations` is how the migrator (CAP-001-E1-S2) detects
  and refuses a tampered file.
- **No reversal path.** There is no down migration and no rollback-by-schema
  flag. See `component-design-market-data-store.md` section 6 for the
  product's rollback posture (restore from a backup, not a reverse migration).

## `applied_migrations`

Created by the schema-migrator (`src/factorflow/db/migrator.py`, CAP-001-E1-S2)
before the first file in this directory runs — never by a migration file
itself, since the migrator has to read it to decide what to apply. Its
definition is exported as `APPLIED_MIGRATIONS_DDL` in
`src/factorflow/db/applied_migrations.py` and is reproduced verbatim in
`component-design-market-data-store.md` section 2.2 so the two cannot drift.

## Files

| File | Delivered by | Contents |
|------|-------------|----------|
| `0001_extensions_owner_state.sql` | CAP-001-E1-S1 | `btree_gist` extension, `instrument`, `owner_setting` |
| `0002_observations.sql` | CAP-001-E4-S1 | Observation tables |
| `0003_coverage.sql` | CAP-001-E5-S1 | Coverage tables |
| `0004_runs.sql` | CAP-001-E5-S1 | Run journal tables |
| `0005_universes.sql` | CAP-002-E1-S1 | `universe`, `universe_event` |
