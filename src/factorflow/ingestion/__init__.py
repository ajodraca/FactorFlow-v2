"""The ingestion container: everything that reads market data from Massive.

Support matrix: the ingestion container only (`component-design-massive-client.md`
section 1). The API never imports from this package, which
`tests/unit/test_api_isolation.py` asserts.
"""
