"""The Massive provider boundary: the only place this codebase holds the
provider credential in usable form and the only place that knows Massive's
response shapes (`component-design-massive-client.md` section 1).

Package contents land across CAP-001-E3's stories:

- `models.py` -- CAP-001-E3-S2. The four Pydantic response models.
- `client.py` -- CAP-001-E3-S1. `MassiveClient`'s four historical reads.
- `errors.py` -- CAP-001-E3-S3. The typed error taxonomy.

Only the four product model types are re-exported here (DAC-E3-12): a
caller of `massive-client` -- `CAP-001-E3-S1`'s historical reads and
`CAP-001-E3-S3`'s error mapping -- imports `TickerReference`, `DailyBar`,
`FinancialStatement` and `CorporateAction` from this package, never the
Massive SDK's own response types or a raw wire dictionary.
"""

from factorflow.ingestion.massive.models import (
    CorporateAction,
    DailyBar,
    FinancialStatement,
    TickerReference,
)

__all__ = [
    "CorporateAction",
    "DailyBar",
    "FinancialStatement",
    "TickerReference",
]
