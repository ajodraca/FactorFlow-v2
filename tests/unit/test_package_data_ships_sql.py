"""Every `sql/` directory under src/factorflow/ is shipped by a package-data glob.

An editable install finds SQL files in the source tree whether or not
`pyproject.toml` names them; a wheel does not. This guard keeps the two in step.
"""

import tomllib
from glob import escape, glob
from pathlib import Path, PurePath

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
PACKAGE_ROOT = REPO_ROOT / "src" / "factorflow"


def package_data_globs() -> list[str]:
    pyproject = tomllib.loads((REPO_ROOT / "pyproject.toml").read_text(encoding="utf-8"))
    globs = pyproject["tool"]["setuptools"]["package-data"]["factorflow"]
    return [str(glob) for glob in globs]


def uncovered_sql_files(package_root: Path, globs: list[str]) -> list[str]:
    """Return `.sql` files in a `sql/` directory that no glob ships.

    Each glob is expanded the way setuptools' `build_py` expands package-data,
    `glob(..., recursive=True)`, so `*` never crosses a `/`.
    """
    shipped = {
        Path(match)
        for pattern in globs
        for match in glob(f"{escape(str(package_root))}/{pattern}", recursive=True)
    }
    uncovered = []
    for directory in sorted(package_root.rglob("sql")):
        if not directory.is_dir():
            continue
        for path in sorted(directory.glob("*.sql")):
            if path not in shipped:
                uncovered.append(path.relative_to(package_root).as_posix())
    return uncovered


# Implements TC-COMP-018
def test_every_sql_directory_matches_a_package_data_glob() -> None:
    assert uncovered_sql_files(PACKAGE_ROOT, package_data_globs()) == []


# Implements TC-COMP-018
def test_universes_sql_glob_is_listed_before_its_directory_exists() -> None:
    """`src/factorflow/universes/sql/` arrives with CAP-002-E1-S2 (DEC-0088)."""
    assert "universes/sql/*.sql" in package_data_globs()


# Implements TC-COMP-076
def test_classification_sql_is_covered_by_a_package_data_glob() -> None:
    """`src/factorflow/classification/sql/` arrives with CAP-002-E2-S2 (DEC-0088).

    The directory does not exist yet, so the glob is matched against a synthetic
    path: a check that enumerates directories cannot fail for one that is absent.
    """
    synthetic = PurePath("classification/sql/anything.sql")

    assert any(synthetic.match(pattern) for pattern in package_data_globs())


# Implements TC-COMP-018
def test_guard_reports_a_sql_directory_no_glob_covers(tmp_path: Path) -> None:
    sql_dir = tmp_path / "widgets" / "sql"
    sql_dir.mkdir(parents=True)
    (sql_dir / "read.sql").write_text("SELECT 1;\n", encoding="utf-8")

    assert uncovered_sql_files(tmp_path, ["db/migrations/*.sql"]) == ["widgets/sql/read.sql"]
    assert uncovered_sql_files(tmp_path, ["widgets/sql/*.sql"]) == []


# Implements TC-COMP-018
@pytest.mark.parametrize("glob", ["widgets/*.sql", "*.sql", "widgets/s*/x/*.sql"])
def test_guard_reports_a_glob_that_only_looks_like_it_covers_the_file(
    tmp_path: Path, glob: str
) -> None:
    """setuptools expands package-data with `glob(..., recursive=True)`: `*` stops at `/`."""
    sql_dir = tmp_path / "widgets" / "sql"
    sql_dir.mkdir(parents=True)
    (sql_dir / "read.sql").write_text("SELECT 1;\n", encoding="utf-8")

    assert uncovered_sql_files(tmp_path, [glob]) == ["widgets/sql/read.sql"]


# Implements TC-COMP-018
@pytest.mark.parametrize("glob", ["widgets/**/*.sql", "**/*.sql", "widgets/*/*.sql"])
def test_guard_accepts_a_glob_setuptools_expands_to_the_file(tmp_path: Path, glob: str) -> None:
    sql_dir = tmp_path / "widgets" / "sql"
    sql_dir.mkdir(parents=True)
    (sql_dir / "read.sql").write_text("SELECT 1;\n", encoding="utf-8")

    assert uncovered_sql_files(tmp_path, [glob]) == []
