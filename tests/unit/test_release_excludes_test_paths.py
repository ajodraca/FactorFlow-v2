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

One exemption exists (CAP-001-E1-S7, DAC-E1-S7-6): the Host and Origin
middleware of `component-design-ingestion-api.md` section 2.5a compares an
incoming `Origin` header against the API's own loopback origins, built from
the exact parts `http://127.0.0.1:`, `http://localhost:` and `http://[::1]:`.
Those three constants are accepted in `api/app.py` only; they accept no base
URL, so SEC-NDG-001's purpose is unchanged. The comparison and literal checks
for `"http"` still apply everywhere, that module included.
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


# CAP-001-E1-S7, DAC-E1-S7-6: the Host and Origin middleware's origin
# allow-list (`component-design-ingestion-api.md` section 2.5a) compares an
# incoming header against the API's own three loopback origins, built from
# these literal parts and `ApiSettings.port`. It accepts no base URL, so it is
# the one exemption from the scheme scan, keyed on the module and the exact
# strings; anything else, there or elsewhere, still fails.
_ORIGIN_ALLOW_LIST_MODULE = Path("api") / "app.py"
_ORIGIN_ALLOW_LIST_PARTS = frozenset({"http://127.0.0.1:", "http://localhost:", "http://[::1]:"})


def _http_scheme_offenders(package_root: Path) -> list[str]:
    """Every `http://` string constant, and every comparison with or listing
    of the `http` scheme, in the modules under `package_root`, except the
    origin allow-list's three parts in `api/app.py`."""
    files = sorted(package_root.rglob("*.py"))
    assert files, f"no source file was found under {package_root}"
    offenders = []
    for path in files:
        exempt = (
            _ORIGIN_ALLOW_LIST_PARTS
            if path.relative_to(package_root) == _ORIGIN_ALLOW_LIST_MODULE
            else frozenset()
        )
        tree = ast.parse(path.read_text(), filename=str(path))
        for node in ast.walk(tree):
            if (
                isinstance(node, ast.Constant)
                and isinstance(node.value, str)
                and node.value.lower().startswith("http://")
                and node.value not in exempt
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
    return offenders


# Implements TC-COMP-364
# Implements TC-COMP-408
def test_release_source_accepts_no_http_scheme() -> None:
    """DAC-E3-S6-17 (c), SEC-NDG-001: no module under `src/factorflow` holds
    an `http://` URL constant or compares against, or lists, the `http`
    scheme -- the origin allow-list of DAC-E1-S7-6 excepted."""
    assert _http_scheme_offenders(SRC_PACKAGE) == []


def _write(root: Path, relative: str, source: str) -> None:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(source)


_ALLOW_LIST_SOURCE = (
    "port = 8000\n"
    'origins = {f"http://127.0.0.1:{port}", f"http://localhost:{port}", f"http://[::1]:{port}"}\n'
)


# Implements TC-COMP-409
def test_the_exemption_admits_only_the_three_forms_in_api_app(tmp_path: Path) -> None:
    """DAC-E1-S7-6: the exemption is that narrow."""
    accepted = tmp_path / "accepted"
    _write(accepted, "api/app.py", _ALLOW_LIST_SOURCE)
    assert _http_scheme_offenders(accepted) == []

    elsewhere = tmp_path / "elsewhere"
    _write(elsewhere, "api/app.py", "x = 1\n")
    _write(elsewhere, "ingestion/client.py", _ALLOW_LIST_SOURCE)
    assert len(_http_scheme_offenders(elsewhere)) == 3

    fourth = tmp_path / "fourth"
    _write(fourth, "api/app.py", _ALLOW_LIST_SOURCE + 'base = "http://example.com"\n')
    assert len(_http_scheme_offenders(fourth)) == 1

    compared = tmp_path / "compared"
    _write(compared, "api/app.py", _ALLOW_LIST_SOURCE + 'ok = scheme == "http"\n')
    assert len(_http_scheme_offenders(compared)) == 1

    listed = tmp_path / "listed"
    _write(listed, "api/app.py", _ALLOW_LIST_SOURCE + 'schemes = ("http", "https")\n')
    _write(listed, "ingestion/client.py", 'allowed = {"http"}\n')
    assert len(_http_scheme_offenders(listed)) == 2


def test_the_exemption_is_keyed_on_the_path_not_the_file_name(tmp_path: Path) -> None:
    """An `app.py` in another package is not the middleware's module."""
    _write(tmp_path, "ingestion/app.py", _ALLOW_LIST_SOURCE)
    _write(tmp_path, "api/app.py", "x = 1\n")
    assert len(_http_scheme_offenders(tmp_path)) == 3
