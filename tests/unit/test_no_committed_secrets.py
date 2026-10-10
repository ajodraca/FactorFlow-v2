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

# Where a real credential could plausibly land: code that ships, its tests,
# and configuration/manifest files. `docs/` is excluded deliberately, not to
# weaken the guard but to scope it correctly -- AC-13 is about the
# credential appearing in shipped code, not about a *test fixture value*
# being quoted verbatim as evidence inside a governance document, which is
# what an implementation review's own findings do when they cite the exact
# string a prior test used. Narrowing KEY_SHAPE itself was rejected as a fix
# (implementation-review-v2, IR-001): a real leaked key in docs/ would still
# be a leak worth catching, just not the failure mode this exclusion exists
# for, and this repository's own precedent (`.gitignore`, `pyproject.toml`'s
# ruff `extend-exclude`) already treats `docs/` as carrying reviewed content
# this package does not own.
_SCANNED_PREFIXES = ("src/", "tests/", "migrations/")
_SCANNED_FILES = {"pyproject.toml", "uv.lock", "Dockerfile", ".gitignore"}


def _in_scanned_scope(rel_path: str) -> bool:
    return rel_path.startswith(_SCANNED_PREFIXES) or rel_path in _SCANNED_FILES


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
    tracked = [f for f in _tracked_files() if _in_scanned_scope(f)]
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


def test_scanned_scope_still_covers_this_story_own_files() -> None:
    """A guard against the exclusion becoming too broad: the files this
    story actually ships must remain in scope, or narrowing the scan
    silently defeats the guard it exists to keep."""
    for rel_path in (
        "src/factorflow/config/settings.py",
        "tests/unit/test_settings_secrecy.py",
        "pyproject.toml",
    ):
        assert _in_scanned_scope(rel_path), f"{rel_path} unexpectedly out of scope"


_E2E_KEY_SCANNED_PREFIXES = ("scripts/", "tests/", "src/")
_FORMER_FIXED_KEY = "e2e" + "-test-key"
_TEST_KEY_LITERAL = re.compile(r"TEST-ONLY-[0-9a-f]{32,}")


# Implements TC-COMP-381
def test_no_tracked_file_contains_a_fixed_e2e_provider_key() -> None:
    """SEC-SEC-001, DEC-0037, DEC-0040: the e2e provider key is generated per
    run, so no tracked file under `scripts/`, `tests/` or `src/` holds the
    former fixed key or a literal designated test credential. Both patterns
    are built so that they never match this file itself."""
    tracked = [f for f in _tracked_files() if f.startswith(_E2E_KEY_SCANNED_PREFIXES)]
    offenders = []
    for rel_path in tracked:
        path = REPO_ROOT / rel_path
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if _FORMER_FIXED_KEY in text or _TEST_KEY_LITERAL.search(text):
            offenders.append(rel_path)
    assert offenders == [], f"fixed e2e provider key found in: {offenders}"


# Implements TC-COMP-381
def test_e2e_key_scope_covers_the_script_and_entry_point() -> None:
    for rel_path in ("scripts/run-e2e-server.sh", "tests/e2e/support/ingestion_e2e_main.py"):
        assert rel_path.startswith(_E2E_KEY_SCANNED_PREFIXES), f"{rel_path} out of scope"


def test_scanned_scope_excludes_docs() -> None:
    """The exclusion this fix relies on: a governance document quoting a
    key-shaped fixture value as review evidence must not trip the scan."""
    assert not _in_scanned_scope(
        "docs/capabilities/CAP-001-x/epics/e1/stories/CAP-001-E1-S3-implementation-review-v1.md"
    )
