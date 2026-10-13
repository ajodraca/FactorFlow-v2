"""The built distribution carries this build's migrations (CAP-001-E1-S8).

Component designs: `component-design-schema-migrator.md` section 2.1 and
`component-design-runtime-config.md` section 7 (release manifest v1, B1).
The wheel is built from a copy of `src/` and `pyproject.toml`, so a stale
`dist/` or an editable install cannot make it pass. It is built with
`uv build --wheel --offline`, the pattern `test_release_excludes_test_paths.py`
uses (DEC-0045): `uv sync --all-extras` runs first and leaves the build backend
in uv's cache.
"""

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]

_MIGRATIONS = (
    "0001_extensions_owner_state.sql",
    "0002_observations.sql",
    "0003_coverage.sql",
    "0004_runs.sql",
)


@pytest.fixture(scope="module")
def built_wheel(tmp_path_factory: pytest.TempPathFactory) -> Path:
    source = tmp_path_factory.mktemp("source")
    # Build leftovers stay behind: a stale `factorflow.egg-info/SOURCES.txt`
    # would make setuptools ship files the package-data entry no longer names.
    shutil.copytree(
        REPO_ROOT / "src",
        source / "src",
        ignore=shutil.ignore_patterns("*.egg-info", "__pycache__", "build", "dist"),
    )
    assert not list((source / "src").glob("*.egg-info"))
    shutil.copy2(REPO_ROOT / "pyproject.toml", source / "pyproject.toml")
    out = tmp_path_factory.mktemp("dist")
    subprocess.run(
        ["uv", "build", "--wheel", "--offline", "--out-dir", str(out)],
        check=True,
        cwd=source,
        capture_output=True,
    )
    wheels = list(out.glob("*.whl"))
    assert len(wheels) == 1, wheels
    return wheels[0]


# Implements TC-COMP-392
def test_wheel_carries_the_migrations_and_nothing_under_tests(built_wheel: Path) -> None:
    names = zipfile.ZipFile(built_wheel).namelist()
    for migration in _MIGRATIONS:
        assert f"factorflow/db/migrations/{migration}" in names
    assert [name for name in names if name.startswith("tests/")] == []


# Implements TC-COMP-392
def test_installed_layout_resolves_its_migrations(built_wheel: Path, tmp_path: Path) -> None:
    """The unpacked wheel's `migrate_main` finds versions 1 to 4 beside itself.
    Its dependencies, such as `psycopg`, come from the project environment."""
    site = tmp_path / "site"
    zipfile.ZipFile(built_wheel).extractall(site)
    probe = (
        "import sys; sys.path.insert(0, sys.argv[1]);"
        "from factorflow.db.migrate_main import MIGRATIONS_DIR;"
        "from factorflow.db.migrator import discover;"
        "print(MIGRATIONS_DIR);"
        "print([f.version for f in discover(MIGRATIONS_DIR)])"
    )
    result = subprocess.run(
        [sys.executable, "-c", probe, str(site)],
        check=True,
        capture_output=True,
        text=True,
    )
    directory, versions = result.stdout.splitlines()
    assert Path(directory) == site / "factorflow" / "db" / "migrations"
    assert versions == "[1, 2, 3, 4]"
