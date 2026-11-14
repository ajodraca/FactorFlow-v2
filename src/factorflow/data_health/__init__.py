"""The data-health-reader: read-only reads behind the shell and the Data health screen.

Component design 2.1. Only ``read_problems`` exists so far; ``read_attention``
and ``read_data_health`` follow in later stories.
"""

from factorflow.data_health.reader import read_problems

__all__ = ["read_problems"]
