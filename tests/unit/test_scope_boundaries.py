"""Guards against implementing adjacent-story work early."""

from pathlib import Path


def test_history_depth_settings_are_not_part_of_this_story() -> None:
    """CAP-001-E2-S2, rather than this story, owns history-depth settings."""
    settings_path = Path("src/factorflow/instruments/settings.py")
    assert not settings_path.exists()
