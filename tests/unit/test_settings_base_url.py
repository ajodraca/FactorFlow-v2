"""`FACTORFLOW_MASSIVE_BASE_URL` validation (CAP-001-E3-S6).

Component design: `component-design-runtime-config.md` section 2.2c, the
rule's clauses 1 to 9 and its accepted/rejected value table. `https` only:
the release settings never accept `http`, loopback included (SEC-NDG-001,
DEC-0033). Messages follow clause 9 exactly (DEC-0044).
"""

import pytest

from factorflow.config.settings import ConfigurationError, MassiveSettings, Settings
from tests.unit.massive_transport_fakes import generated_test_key

_VAR = "FACTORFLOW_MASSIVE_BASE_URL"

_WHITESPACE = "must be a non-empty URL without whitespace"
_QUERY = "must not carry a query or fragment"
_SCHEME = "scheme must be https"
_HOST = "host is missing"
_USERINFO = "must not carry userinfo"
_PORT = "port must be an integer from 1 to 65535"
_PATH = "must not carry a path"

# (value, clause) for every rejected value whose clause the table fixes.
_REJECTED_WITH_CLAUSE = [
    ("http://api.massive.com", _SCHEME),
    ("ftp://api.massive.com", _SCHEME),
    ("api.massive.com", _SCHEME),
    ("http://127.0.0.1:8126", _SCHEME),
    ("http://localhost:8126", _SCHEME),
    ("http://[::1]:8126", _SCHEME),
    ("https://", _HOST),
    ("https:///v3", _HOST),
    ("https:api.massive.com", _HOST),
    ("https://user:pw@api.massive.com", _USERINFO),
    ("https://user:s3cret@api.massive.com", _USERINFO),
    ("https://api.massive.com:0", _PORT),
    ("https://api.massive.com:70000", _PORT),
    ("https://api.massive.com:abc", _PORT),
    ("https://api.massive.com/v3", _PATH),
    ("https://api.massive.com//", _PATH),
    ("https://api.massive.com?x=1", _QUERY),
    ("https://api.massive.com#f", _QUERY),
    ("", _WHITESPACE),
    (" https://api.massive.com", _WHITESPACE),
    ("https://api.massive.com\x7f", _WHITESPACE),
]

# Unbracketed IPv6: the table says "host missing", the clause order says
# "scheme must be https" (story Open Question, specification review v7
# FINDING-12 (c)). Only rejection and the variable name are asserted.
_UNBRACKETED_IPV6 = "http://::1:8126"


def _env(monkeypatch: pytest.MonkeyPatch) -> str:
    key = generated_test_key()
    monkeypatch.setenv("FACTORFLOW_MASSIVE_API_KEY", key)
    monkeypatch.setenv("FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE", "60")
    return key


def _load_error(monkeypatch: pytest.MonkeyPatch, value: str) -> str:
    monkeypatch.setenv(_VAR, value)
    with pytest.raises(ConfigurationError) as excinfo:
        MassiveSettings(_env_file=None)  # type: ignore[call-arg]
    return str(excinfo.value)


# --- TC-COMP-347 / DAC-E3-S6-1: the default ------------------------------


# Implements TC-COMP-347
def test_unset_base_url_defaults_to_the_governed_host(monkeypatch: pytest.MonkeyPatch) -> None:
    """Clause 1: unset means `https://api.massive.com`."""
    monkeypatch.delenv(_VAR, raising=False)
    _env(monkeypatch)
    assert MassiveSettings(_env_file=None).base_url == "https://api.massive.com"  # type: ignore[call-arg]


# --- TC-COMP-348 / DAC-E3-S6-2: accepted rows ------------------------------


# Implements TC-COMP-348
@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("https://api.massive.com", "https://api.massive.com"),
        ("https://api.massive.com/", "https://api.massive.com"),
        ("HTTPS://API.MASSIVE.COM", "HTTPS://API.MASSIVE.COM"),
        ("https://api.massive.com:443", "https://api.massive.com:443"),
        ("https://other.example", "https://other.example"),
    ],
)
def test_accepted_base_url_loads(
    monkeypatch: pytest.MonkeyPatch, value: str, expected: str
) -> None:
    """Clauses 2, 5 and 6: every accepted row loads; a single trailing `/` is
    removed and nothing else is changed."""
    _env(monkeypatch)
    monkeypatch.setenv(_VAR, value)
    assert MassiveSettings(_env_file=None).base_url == expected  # type: ignore[call-arg]


# --- TC-COMP-349 / DAC-E3-S6-3: non-https schemes ----------------------------


# Implements TC-COMP-349
@pytest.mark.parametrize(
    "value", ["http://api.massive.com", "ftp://api.massive.com", "api.massive.com"]
)
def test_non_https_scheme_is_rejected(monkeypatch: pytest.MonkeyPatch, value: str) -> None:
    """Clause 2, SEC-ENC-001: only `https` is accepted."""
    _env(monkeypatch)
    assert _VAR in _load_error(monkeypatch, value)


# --- TC-COMP-350 / DAC-E3-S6-4: loopback http in the release settings ------


# Implements TC-COMP-350
@pytest.mark.parametrize(
    "value", ["http://127.0.0.1:8126", "http://localhost:8126", "http://[::1]:8126"]
)
def test_loopback_http_is_rejected_by_the_release_settings(
    monkeypatch: pytest.MonkeyPatch, value: str
) -> None:
    """The release settings never accept `http`, loopback included. This test
    stays unchanged when clause 2a takes effect: clause 2a lives only in the
    test-only entry point under `tests/` (SEC-NDG-001, DEC-0033)."""
    _env(monkeypatch)
    assert _VAR in _load_error(monkeypatch, value)


# --- TC-COMP-351 / DAC-E3-S6-5: every other rejected row ---------------------


# Implements TC-COMP-351
@pytest.mark.parametrize(
    "value",
    [
        "https://",
        "https:///v3",
        "https:api.massive.com",
        "https://user:pw@api.massive.com",
        "https://api.massive.com:0",
        "https://api.massive.com:70000",
        "https://api.massive.com:abc",
        "https://api.massive.com/v3",
        "https://api.massive.com//",
        "https://api.massive.com?x=1",
        "https://api.massive.com#f",
        "",
        " https://api.massive.com",
        _UNBRACKETED_IPV6,
        "https://api.massive.com\x7f",
    ],
)
def test_other_rejected_rows_are_rejected(monkeypatch: pytest.MonkeyPatch, value: str) -> None:
    """Clauses 3 to 8: missing host, userinfo, bad port, a path, a query or
    fragment, an empty value, surrounding whitespace, unbracketed IPv6 and a
    control character are each rejected, naming the variable."""
    _env(monkeypatch)
    assert _VAR in _load_error(monkeypatch, value)


# --- TC-COMP-352 / DAC-E3-S6-6: the message names the clause, not the value -


# Implements TC-COMP-352
@pytest.mark.parametrize(("value", "clause"), _REJECTED_WITH_CLAUSE)
def test_rejection_message_names_variable_and_clause_only(
    monkeypatch: pytest.MonkeyPatch, value: str, clause: str
) -> None:
    """Clause 9, SEC-ERR-001: the message is exactly
    `FACTORFLOW_MASSIVE_BASE_URL: <clause>` and never contains the submitted
    value, a userinfo password or the API key."""
    key = _env(monkeypatch)
    message = _load_error(monkeypatch, value)

    assert message == f"{_VAR}: {clause}"
    if value:
        assert value not in message
    assert "s3cret" not in message
    assert key not in message


# Implements TC-COMP-352
def test_unbracketed_ipv6_message_names_variable_only(monkeypatch: pytest.MonkeyPatch) -> None:
    """`http://::1:8126`: only the variable prefix is pinned, never the
    clause (specification review v7 FINDING-12 (c))."""
    key = _env(monkeypatch)
    message = _load_error(monkeypatch, _UNBRACKETED_IPV6)

    assert message.startswith(f"{_VAR}: ")
    assert _UNBRACKETED_IPV6 not in message
    assert key not in message


# --- T014: the aggregate load path `ingestion_main.main()` takes -----------


def test_aggregate_settings_load_raises_the_base_url_error_unchanged(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """`Settings` builds `MassiveSettings` through `default_factory`, so the
    clause 9 message reaches `ingestion_main.main()` unchanged (AC-13)."""
    _env(monkeypatch)
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused/unused")
    monkeypatch.setenv(_VAR, "http://api.massive.com")

    with pytest.raises(ConfigurationError) as excinfo:
        Settings(_env_file=None)  # type: ignore[call-arg]

    assert str(excinfo.value) == f"{_VAR}: {_SCHEME}"
