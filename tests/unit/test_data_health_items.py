"""Unit tests: the attention item rules and the credential guard (CAP-003-E2-S2).

- TC-COMP-044 (edge), TC-COMP-045 (both outcomes): ``_attention_items`` is a pure
  function of the problem block, the latest terminal download and the credential
  presence (DAC-E2-8, DAC-E2-S2-2, DAC-E2-S2-3, AC-9). Items carry no tier and no copy.
- TC-COMP-045 step 2 (DAC-E2-S2-3, AC-4, AGT-PROHIB-001): the reader calls the delivered
  ``credential_present()`` and never reads the key's value.
"""

from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

import pytest

import factorflow.config.settings as settings
from factorflow.data_health import queries, reader
from factorflow.data_health.models import AttentionItem, LatestTerminalDownload, Problems

T1 = datetime(2026, 10, 20, 21, 0, tzinfo=UTC)
T2 = datetime(2026, 10, 21, 21, 0, tzinfo=UTC)
CHECKED = datetime(2026, 10, 24, 9, 0, tzinfo=UTC)
RUN = UUID(int=7)

NONE_PROBLEMS = Problems(0, (), None)


def _items(
    *,
    problems: Problems = NONE_PROBLEMS,
    latest_terminal: LatestTerminalDownload | None = None,
    credential_present: bool = True,
) -> tuple[AttentionItem, ...]:
    return reader._attention_items(
        problems=problems,
        latest_terminal=latest_terminal,
        credential_present=credential_present,
        checked_at=CHECKED,
    )


# Implements TC-COMP-044
# Implements TC-COMP-045
def test_data_problems_item_follows_the_stock_count() -> None:
    assert _items(problems=NONE_PROBLEMS) == ()
    assert _items(problems=Problems(1, ("AAA",), T1)) == (AttentionItem("data_problems", T1, None),)
    # The rule is the count, not the timestamp (DAC-E2-8).
    assert _items(problems=Problems(0, (), T1)) == ()


# Implements TC-COMP-044
@pytest.mark.parametrize(
    ("state", "item"),
    [
        ("failed", True),
        ("abandoned", True),
        ("succeeded", False),
        ("partial", False),
        ("cancelled", False),
    ],
)
def test_download_not_complete_only_for_failed_and_abandoned(state: str, item: bool) -> None:
    terminal = LatestTerminalDownload(RUN, state, T2, "reason")

    expected = (AttentionItem("download_not_complete", T2, RUN),) if item else ()
    assert _items(latest_terminal=terminal) == expected


# Implements TC-COMP-044
def test_no_terminal_download_gives_no_download_item() -> None:
    assert _items(latest_terminal=None) == ()


# Implements TC-COMP-045
def test_credential_missing_item_is_stamped_with_checked_at() -> None:
    assert _items(credential_present=False) == (AttentionItem("credential_missing", CHECKED, None),)
    assert _items(credential_present=True) == ()


# Implements TC-COMP-045
def test_all_three_causes_give_three_items_and_none_give_none() -> None:
    items = _items(
        problems=Problems(2, ("AAA", "BBB"), T1),
        latest_terminal=LatestTerminalDownload(RUN, "failed", T2, None),
        credential_present=False,
    )

    assert len(items) == 3
    # Each item holds its own recency when the causes coexist (IR-002).
    assert {i.kind: i for i in items} == {
        "data_problems": AttentionItem("data_problems", T1, None),
        "download_not_complete": AttentionItem("download_not_complete", T2, RUN),
        "credential_missing": AttentionItem("credential_missing", CHECKED, None),
    }
    assert _items() == ()


# Implements TC-COMP-044
def test_read_attention_is_exported_from_the_package() -> None:
    import factorflow.data_health as package

    assert package.read_attention is reader.read_attention
    assert "read_attention" in package.__all__


# Implements TC-COMP-045
def test_reader_calls_the_delivered_credential_presence_function() -> None:
    assert reader.credential_present is settings.credential_present


# Implements TC-COMP-045
@pytest.mark.parametrize("module", [reader, queries], ids=["reader", "queries"])
def test_module_never_reads_the_key_value(module: object) -> None:
    path = Path(module.__file__)  # type: ignore[attr-defined]
    text = path.read_text(encoding="utf-8")
    forbidden = (
        "FACTORFLOW_MASSIVE_API_KEY",
        "os.environ",
        "getenv",
        "get_secret_value",
        "massive_api_key",
        "Settings(",
    )

    hits = [token for token in forbidden if token in text]

    assert hits == [], f"{path.name} names {hits}"
