"""No code computes a path to a repository-root `migrations/` directory
(CAP-001-E1-S8, DAC-E1-S8-7).

Component design: `component-design-schema-migrator.md` section 2.1. The
migrations are package data of `factorflow.db`, resolved through
`factorflow.db.migrate_main.MIGRATIONS_DIR`; a test or script that still
builds a path to `<repo>/migrations` would pass in a checkout and silently
read nothing in the installed image (release manifest v1, B1).
"""

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]

# Every form a path to a repository-root `migrations` directory takes in this
# repository's languages (T011): a Python join onto the root (`parents[N] /
# "migrations"`, `REPO_ROOT / "migrations"`), a quoted relative path
# (`"migrations/0001_x.sql"`, `'./migrations'`), and a shell join
# (`$ROOT/migrations`, `${REPO}/migrations`). The package's own
# `Path(__file__).resolve().parent / "migrations"` and a mention such as
# `src/factorflow/db/migrations/0004_runs.sql` match none of them.
_ROOT_MIGRATIONS_PATH = re.compile(
    r"""(?:parents\[\d+\]|REPO_ROOT)\s*/\s*["']migrations["']"""
    r"""|["'`](?:\.{1,2}/)+migrations\b|["'`]migrations/"""
    r"""|\$\{?\w+\}?/migrations\b"""
)
_SCANNED_SUFFIXES = (".py", ".sh", ".ts", ".tsx", ".sql")


@pytest.mark.parametrize(
    "line",
    [
        'MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"',
        'sql = (REPO_ROOT / "migrations" / "0004_runs.sql").read_text()',
        'open("migrations/0001_extensions_owner_state.sql")',
        'path = REPO_ROOT / "migrations/0001_extensions_owner_state.sql"',
        'Path("migrations/0002_observations.sql")',
        "const dir = './migrations';",
        'psql -f "$ROOT/migrations/0001_extensions_owner_state.sql"',
        "cp ${REPO}/migrations/*.sql /tmp",
    ],
)
def test_each_root_migrations_path_form_is_detected(line: str) -> None:
    """The scan below is not vacuous: every form T011 names is caught."""
    assert _ROOT_MIGRATIONS_PATH.search(line)


@pytest.mark.parametrize(
    "line",
    [
        'MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"',
        "# `run_result_outcome_known` in src/factorflow/db/migrations/0004_runs.sql",
        " * `coverage_data_type_known` check in `src/factorflow/db/migrations/0003_coverage.sql`",
        'FIXTURES_OK_DIR = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"',
    ],
)
def test_package_paths_and_mentions_are_not_flagged(line: str) -> None:
    assert not _ROOT_MIGRATIONS_PATH.search(line)


# Implements TC-COMP-420
def test_nothing_resolves_a_repository_root_migrations_directory() -> None:
    offenders = []
    for top in ("src", "tests", "scripts"):
        for path in sorted((REPO_ROOT / top).rglob("*")):
            if path.suffix not in _SCANNED_SUFFIXES or path == Path(__file__):
                continue
            if "node_modules" in path.parts or path.is_symlink():
                continue
            for number, line in enumerate(path.read_text().splitlines(), start=1):
                if _ROOT_MIGRATIONS_PATH.search(line):
                    offenders.append(f"{path.relative_to(REPO_ROOT)}:{number}")
    assert offenders == []


# Implements TC-COMP-420
def test_repository_root_has_no_migrations_directory() -> None:
    assert not (REPO_ROOT / "migrations").exists()
    fixture_dir = REPO_ROOT / "tests" / "fixtures" / "migrations_ok"
    assert fixture_dir.is_dir()
    # The fixture's 0001 is a symlink to the release migration; it must follow
    # the file into the package rather than dangle.
    package_dir = REPO_ROOT / "src" / "factorflow" / "db" / "migrations"
    linked = fixture_dir / "0001_extensions_owner_state.sql"
    assert linked.resolve() == (package_dir / "0001_extensions_owner_state.sql").resolve()
