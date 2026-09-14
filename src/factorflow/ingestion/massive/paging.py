"""Cursor following for Massive's `next_url`-paged endpoints.

Component design: `component-design-massive-client.md` sections 2.2b
(`pagination=False` is deliberate) and 2.5 (paging by `next_url`). Story:
`CAP-001-E3-S1`.

The SDK's own auto-pagination is disabled at construction
(`massive/client.py`), because it would take one governor permit for the
whole range rather than one per page and would hold every page in memory
at once. This module follows `next_url` itself, one page at a time, so
each page can be submitted through the rate-limit governor individually.

Massive's `next_url` is a full URL; following it means re-issuing the same
GET against its path and query string, which is exactly what the SDK's own
internal pager does through the `BaseClient._get` hook this module reuses.
That hook is private, but reusing it here -- rather than reimplementing
HTTP transport -- is what "uses Massive's official SDK internally" means
for a component that has turned the SDK's own pager off.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any
from urllib.parse import parse_qsl, urlparse

from urllib3 import HTTPResponse

__all__ = ["follow_pages"]


def follow_pages(
    first_page: Callable[[], HTTPResponse],
    next_page: Callable[[str, dict[str, str]], HTTPResponse],
    decode: Callable[[HTTPResponse], dict[str, Any]],
) -> list[Any]:
    """Follow `next_url` across every page of one read, accumulating and
    returning the complete, ordered list of raw result rows.

    `first_page` issues the initial request. `decode` turns a raw
    `HTTPResponse` into its parsed JSON envelope (`{"results": [...],
    "next_url": ...}`); this module never validates rows against a
    product model itself -- that is the caller's job, once the complete
    set is known to exist.

    `next_page` re-issues a GET against a page's path and query
    parameters, parsed from `next_url`. It is the caller's seam onto the
    rate-limit governor: a permit is acquired **before every page
    request**, including this one, because each page is a distinct
    provider request (component design section 2.2b).

    If a later page's request raises, this function does not catch it and
    does not return the rows already accumulated: an incomplete range must
    never be mistaken for a complete one (component design section 8,
    acceptance criterion 12).
    """
    envelope = decode(first_page())
    rows: list[Any] = list(envelope.get("results") or [])
    next_url = envelope.get("next_url")

    while next_url:
        path, params = _split_next_url(next_url)
        envelope = decode(next_page(path, params))
        rows.extend(envelope.get("results") or [])
        next_url = envelope.get("next_url")

    return rows


def _split_next_url(next_url: str) -> tuple[str, dict[str, str]]:
    """Split a full `next_url` into a request path and its query
    parameters, the same decomposition the SDK's own internal pager
    performs before re-issuing the request."""
    parsed = urlparse(next_url)
    params: dict[str, str] = dict(parse_qsl(parsed.query))
    return parsed.path, params
