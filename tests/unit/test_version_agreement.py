"""Unit test: the release version is stated once, in every manifest that carries it.

The image tag is built from the version (README, *Deploying and operating
FactorFlow*), so the Python package, its lock entry and the interface's npm
manifests must agree (EXP-20261107-3).
"""

from __future__ import annotations

import json
import tomllib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _lock_version() -> str:
    lock = tomllib.loads((REPO_ROOT / "uv.lock").read_text(encoding="utf-8"))
    (entry,) = [p for p in lock["package"] if p["name"] == "factorflow"]
    return str(entry["version"])


def test_every_manifest_states_the_same_version() -> None:
    project = tomllib.loads((REPO_ROOT / "pyproject.toml").read_text(encoding="utf-8"))
    package = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
    lock = json.loads((REPO_ROOT / "package-lock.json").read_text(encoding="utf-8"))

    version = project["project"]["version"]

    assert _lock_version() == version
    assert package["version"] == version
    assert lock["version"] == version
    assert lock["packages"][""]["version"] == version
