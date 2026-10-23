"""The universe service: named, dated sets of acquired instruments (CAP-002).

This package holds the read half (``replay``): membership is replayed from the
append-only ``universe_event`` log, never read from a maintained row. The
public service names live in ``service.py``, which is CAP-002-E1-S3's.
"""
