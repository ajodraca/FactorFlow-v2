"""The reader's statements only read (CAP-002-E3-S1).

DAC-E3-S1-6 and the reader design's read-only constraint: nothing the reader returns is
written or recomputed by it. The files are located beside the module, the directory it
reads at import, so the guard checks what ships.
"""

import re
from pathlib import Path

import pytest

import factorflow.classification.reader as reader

SQL_DIR = Path(reader.__file__).parent / "sql"
WRITE_KEYWORDS = ("INSERT", "UPDATE", "DELETE", "TRUNCATE", "CREATE", "ALTER", "DROP")


def _strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", " ", text, flags=re.DOTALL)
    return re.sub(r"--[^\n]*", " ", text)


@pytest.mark.parametrize("name", ["current_set.sql", "summary.sql"])
def test_reader_statement_is_one_read_only_query(name: str) -> None:
    """DAC-E3-S1-6: one statement starting WITH or SELECT and no write keyword."""
    body = _strip_comments((SQL_DIR / name).read_text(encoding="utf-8")).strip()

    statements = [part for part in body.split(";") if part.strip()]
    assert len(statements) == 1, statements
    assert re.match(r"(WITH|SELECT)\b", body, flags=re.IGNORECASE), body
    for keyword in WRITE_KEYWORDS:
        assert not re.search(rf"\b{keyword}\b", body, flags=re.IGNORECASE), keyword


def test_comment_stripping_does_not_hide_a_write() -> None:
    """The guard's own helper keeps code outside comments."""
    text = "-- DELETE in a comment\nSELECT 1; /* DROP */ DELETE FROM x"
    stripped = _strip_comments(text)
    assert "DROP" not in stripped
    assert re.search(r"\bDELETE\b", stripped)
