"""The release artifact carries nothing from `tests/` (CAP-001-E3-S6).

Component design: `component-design-runtime-config.md` section 7; SEC-NDG-001,
DEC-0033, DEC-0034. Clause 2a (loopback `http`) exists only in a test-only
entry point under `tests/`, so the release build must not contain `tests/`,
import from it, or accept an `http` base URL scheme on its own.

The wheel is built with `uv build --wheel --offline` so the test needs no
network: `uv sync --all-extras` runs first in the validation order and leaves
the build backend in uv's cache (DEC-0045, PROVISIONAL).

The source scan is shaped to catch an `http` scheme being accepted without
flagging unrelated uses of the word: it rejects any string constant that
starts with `http://`, and the constant `"http"` inside a comparison or a
set, tuple or list literal -- the forms a scheme check takes. A plain call
argument such as `@app.middleware("http")` in `src/factorflow/api/app.py`
is neither, so it is not flagged.
"""

import ast
import shlex
import subprocess
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_PACKAGE = REPO_ROOT / "src" / "factorflow"


def _copy_sources(dockerfile: str) -> list[str]:
    """Source paths of every `COPY` and `ADD` instruction, without flags or
    the destination."""
    sources: list[str] = []
    for line in dockerfile.splitlines():
        words = shlex.split(line, comments=True)
        if not words or words[0].upper() not in ("COPY", "ADD"):
            continue
        args = [w for w in words[1:] if not w.startswith("--")]
        sources.extend(args[:-1])
    return sources


# Implements TC-COMP-364
def test_dockerfile_copies_nothing_under_tests() -> None:
    """DAC-E3-S6-17 (a): no `COPY` or `ADD` source is `tests`, under
    `tests/`, or the whole build context."""
    sources = _copy_sources((REPO_ROOT / "Dockerfile").read_text())

    assert sources, "no COPY or ADD instruction was parsed"
    for source in sources:
        normalised = source.removeprefix("./").rstrip("/")
        assert normalised not in ("", ".", "tests"), source
        assert not normalised.startswith("tests/"), source


# Implements TC-COMP-364
def test_built_wheel_contains_nothing_under_tests(tmp_path: Path) -> None:
    """DAC-E3-S6-17 (b): the wheel `uv build` produces has no `tests/` entry."""
    subprocess.run(
        ["uv", "build", "--wheel", "--offline", "--out-dir", str(tmp_path)],
        check=True,
        cwd=REPO_ROOT,
        capture_output=True,
    )
    wheels = list(tmp_path.glob("*.whl"))
    assert len(wheels) == 1, wheels

    names = zipfile.ZipFile(wheels[0]).namelist()
    assert any(name.startswith("factorflow/") for name in names)
    assert [name for name in names if name.startswith("tests/")] == []


def _source_trees() -> list[tuple[Path, ast.AST]]:
    files = sorted(SRC_PACKAGE.rglob("*.py"))
    assert files, "no source file was found under src/factorflow"
    return [(path, ast.parse(path.read_text(), filename=str(path))) for path in files]


def _is_http(node: ast.AST) -> bool:
    return (
        isinstance(node, ast.Constant)
        and isinstance(node.value, str)
        and node.value.lower() == "http"
    )


# Implements TC-COMP-364
def test_release_source_imports_nothing_from_tests() -> None:
    """DAC-E3-S6-17 (c): no module under `src/factorflow` imports `tests`."""
    offenders = []
    for path, tree in _source_trees():
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                modules = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom):
                modules = [node.module or ""]
            else:
                continue
            if any(m == "tests" or m.startswith("tests.") for m in modules):
                offenders.append(f"{path}:{node.lineno}")
    assert offenders == []


# Implements TC-COMP-364
def test_release_source_accepts_no_http_scheme() -> None:
    """DAC-E3-S6-17 (c), SEC-NDG-001: no module under `src/factorflow` holds
    an `http://` URL constant or compares against, or lists, the `http`
    scheme."""
    offenders = []
    for path, tree in _source_trees():
        for node in ast.walk(tree):
            if (
                isinstance(node, ast.Constant)
                and isinstance(node.value, str)
                and node.value.lower().startswith("http://")
            ):
                offenders.append(f"{path}:{node.lineno} http:// constant")
            elif isinstance(node, ast.Compare) and any(
                _is_http(operand) for operand in (node.left, *node.comparators)
            ):
                offenders.append(f"{path}:{node.lineno} comparison with 'http'")
            elif isinstance(node, (ast.Set, ast.Tuple, ast.List)) and any(
                _is_http(element) for element in node.elts
            ):
                offenders.append(f"{path}:{node.lineno} 'http' in a literal")
    assert offenders == []
