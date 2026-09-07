"""No tracked file contains a value matching the Massive API key shape, and
no `.env` file is tracked. AC-13 requires the credential to never appear in
the repository.
"""

import re
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# Matches the shape of a plausible Massive API key: a long, high-entropy
# token. This is deliberately loose -- the goal is to catch an accidentally
# committed real key, not to validate Massive's exact format, which is not
# published.
KEY_SHAPE = re.compile(r"\bsk-massive-[A-Za-z0-9_-]{16,}\b")


def _tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "ls-files"],
        capture_output=True,
        text=True,
        check=True,
    )
    return [line for line in result.stdout.splitlines() if line]


def test_no_env_file_is_tracked() -> None:
    tracked = _tracked_files()
    env_files = [
        f
        for f in tracked
        if f == ".env" or f.endswith("/.env") or re.search(r"(^|/)\.env\.[^/]+$", f)
    ]
    env_files = [f for f in env_files if not f.endswith(".env.example")]
    assert env_files == [], f"tracked .env file(s): {env_files}"


def test_no_tracked_file_contains_a_key_shaped_value() -> None:
    tracked = _tracked_files()
    offenders = []
    for rel_path in tracked:
        path = REPO_ROOT / rel_path
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if KEY_SHAPE.search(text):
            offenders.append(rel_path)
    assert offenders == [], f"key-shaped value found in: {offenders}"
