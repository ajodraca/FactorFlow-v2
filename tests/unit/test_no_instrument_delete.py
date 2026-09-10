"""Structural safeguard for the instrument-retirement lifecycle."""

from pathlib import Path


def test_no_source_statement_deletes_an_instrument() -> None:
    """Retirement is a lifecycle transition, never a destructive SQL operation."""
    source_root = Path("src/factorflow")
    statements = "\n".join(path.read_text() for path in source_root.rglob("*.py"))
    assert "DELETE FROM instrument" not in statements.upper()
