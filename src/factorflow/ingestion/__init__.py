"""The ingestion container: everything that reads market data from Massive.

Support matrix: the ingestion container only (`component-design-massive-client.md`
section 1). The API never imports from this package, which
`tests/unit/test_api_isolation.py` asserts.

`GovernorSettings`, `Outcome` and `RateLimitGovernor` (`rate_limit.py`,
CAP-001-E3-S4) are re-exported here so `massive/client.py`
(CAP-001-E3-S1) can submit every SDK request through the governor with
its own provider-aware `classify` callable. No Massive-specific delay
callback is added: CAP-001-E3-S1 passes none, because Massive sends no
`Retry-After` (component design section 2.5).
"""

from factorflow.ingestion.rate_limit import GovernorSettings, Outcome, RateLimitGovernor

__all__ = [
    "GovernorSettings",
    "Outcome",
    "RateLimitGovernor",
]
