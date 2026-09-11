"""Taxonomy and safety tests for ``factorflow.ingestion.massive.errors``
(CAP-001-E3-S3). See ``component-design-massive-client.md`` sections 2.4,
2.6a and 4.

Placeholder for Phase 1 (T001): populated with TC-COMP-207, TC-COMP-221,
TC-COMP-224, TC-COMP-011 in Phase 2.
"""

from factorflow.ingestion.massive import errors


def test_module_imports_without_provider_network_access() -> None:
    """Phase 1 checkpoint: the module collects and imports cleanly."""
    assert errors is not None
