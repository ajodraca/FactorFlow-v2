"""The Massive provider boundary: the only place this codebase holds the
provider credential in usable form and the only place that knows Massive's
response shapes (`component-design-massive-client.md` section 1).

Package contents land across CAP-001-E3's stories:

- `models.py` -- CAP-001-E3-S2. The four Pydantic response models.
- `client.py` -- CAP-001-E3-S1. `MassiveClient`'s four historical reads.
- `errors.py` -- CAP-001-E3-S3. The typed error taxonomy.
"""
