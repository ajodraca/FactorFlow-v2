"""Deployment smoke check (`scripts/deploy-smoke.sh`, CAP-001-E1-S9).

Component design: `component-design-runtime-config.md` sections 2.8.5 and 7;
AC-14, AC-18, DAC-E1-23, DAC-E1-S9-4, DAC-E1-S9-5, DAC-E1-S9-6.

Every test here runs without a container or network, placing executable
`docker`, `curl`, and `ifconfig` stubs first on `PATH` in `tmp_path` and
recording invocations to a log file.
"""

import json
import os
import shutil
import stat
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
SMOKE_SCRIPT = REPO_ROOT / "scripts" / "deploy-smoke.sh"

_DEFAULT_PG_HBA = """\
# PostgreSQL Client Authentication Configuration File
# TYPE  DATABASE        USER            ADDRESS                 METHOD

local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
local   replication     all                                     peer
host    replication     all             0.0.0.0/0               reject
"""

_DEFAULT_HEALTH = json.dumps(
    {
        "status": "ok",
        "database": "reachable",
        "credential_present": True,
        "schema_version": 4,
        "most_recent_run": None,
    }
)

_DEFAULT_INDEX_HTML = (
    '<!doctype html><html lang="en"><head><title>FactorFlow</title></head>'
    '<body><div id="root"></div></body></html>'
)

_DEFAULT_IFCONFIG = """\
lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
\tinet 127.0.0.1 netmask 0xff000000
\tinet6 ::1 prefixlen 128
\tinet6 fe80::1%lo0 prefixlen 64 scopeid 0x1
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
\tinet6 fe80::1899:a6a3:e4c0:be23%en0 prefixlen 64 secured scopeid 0xe
\tinet6 fd30:5ffa:7cb1:4e61::10 prefixlen 64 autoconf secured
\tinet 192.168.4.26 netmask 0xfffffc00 broadcast 192.168.7.255
"""


def _write_executable(path: Path, body: str) -> None:
    path.write_text(body, encoding="utf-8")
    path.chmod(path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def _setup_stubs(
    tmp_path: Path,
    *,
    postgres_health: str = "healthy",
    app_health: str = "healthy",
    pg_hba: str = _DEFAULT_PG_HBA,
    expected_schema_version: str = "4",
    health_body: str = _DEFAULT_HEALTH,
    health_exit: int = 0,
    index_body: str = _DEFAULT_INDEX_HTML,
    index_exit: int = 0,
    ifconfig_out: str = _DEFAULT_IFCONFIG,
    operating_system: str = "Docker Desktop",
    vm_probe_exit: int = 0,
    vm_probe_stderr: str = "",
) -> tuple[dict[str, str], Path]:
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir(parents=True, exist_ok=True)
    log_file = tmp_path / "invocations.jsonl"
    state_dir = tmp_path / "state"
    state_dir.mkdir(parents=True, exist_ok=True)

    (state_dir / "pg_hba.conf").write_text(pg_hba, encoding="utf-8")
    (state_dir / "health.json").write_text(health_body, encoding="utf-8")
    (state_dir / "index.html").write_text(index_body, encoding="utf-8")
    (state_dir / "ifconfig.txt").write_text(ifconfig_out, encoding="utf-8")

    docker_stub = f"""#!/usr/bin/env python3
import json
import sys
from pathlib import Path

args = sys.argv[1:]
log_path = Path({str(log_file)!r})
with log_path.open("a", encoding="utf-8") as fh:
    fh.write(json.dumps({{"tool": "docker", "args": args}}) + "\\n")

if not args:
    sys.exit(1)

cmd = args[0]
if cmd == "ps":
    joined = " ".join(args)
    if "com.docker.compose.service=postgres" in joined:
        print("cid-postgres")
    elif "com.docker.compose.service=app" in joined:
        print("cid-app")
    else:
        print("cid-postgres\\ncid-app")
    sys.exit(0)

if cmd == "inspect":
    target = args[-1]
    joined = " ".join(args)
    if "Image" in joined or ".Config.Image" in joined:
        print("factorflow:0.1.0-stub")
        sys.exit(0)
    if target == "cid-postgres":
        print({postgres_health!r})
        sys.exit(0)
    if target == "cid-app":
        print({app_health!r})
        sys.exit(0)
    sys.exit(1)

if cmd == "exec":
    joined = " ".join(args)
    if "pg_hba.conf" in joined:
        hba = Path({str(state_dir / "pg_hba.conf")!r}).read_text(encoding="utf-8")
        for line in hba.splitlines():
            if not line.lstrip().startswith("#"):
                print(line)
        sys.exit(0)
    if "discover(MIGRATIONS_DIR)" in joined:
        print({expected_schema_version!r})
        sys.exit(0)
    sys.exit(1)

if cmd == "info":
    print({operating_system!r})
    sys.exit(0)

if cmd == "run":
    if {vm_probe_stderr!r}:
        sys.stderr.write({vm_probe_stderr!r} + "\\n")
    sys.exit({vm_probe_exit})

sys.exit(1)
"""
    _write_executable(bin_dir / "docker", docker_stub)

    curl_stub = f"""#!/usr/bin/env python3
import json
import sys
from pathlib import Path

args = sys.argv[1:]
log_path = Path({str(log_file)!r})
with log_path.open("a", encoding="utf-8") as fh:
    fh.write(json.dumps({{"tool": "curl", "args": args}}) + "\\n")

url = args[-1] if args else ""
if url.endswith("/api/health"):
    if {health_exit} != 0:
        sys.exit({health_exit})
    sys.stdout.write(Path({str(state_dir / "health.json")!r}).read_text(encoding="utf-8"))
    sys.exit(0)
if url in ("http://127.0.0.1:8000/", "http://127.0.0.1:8000"):
    if {index_exit} != 0:
        sys.exit({index_exit})
    sys.stdout.write(Path({str(state_dir / "index.html")!r}).read_text(encoding="utf-8"))
    sys.exit(0)
sys.exit(22)
"""
    _write_executable(bin_dir / "curl", curl_stub)

    ifconfig_stub = f"""#!/usr/bin/env python3
import json
import sys
from pathlib import Path

args = sys.argv[1:]
log_path = Path({str(log_file)!r})
with log_path.open("a", encoding="utf-8") as fh:
    fh.write(json.dumps({{"tool": "ifconfig", "args": args}}) + "\\n")

sys.stdout.write(Path({str(state_dir / "ifconfig.txt")!r}).read_text(encoding="utf-8"))
"""
    _write_executable(bin_dir / "ifconfig", ifconfig_stub)

    env = {
        **os.environ,
        "PATH": f"{bin_dir}:{os.environ.get('PATH', '')}",
    }
    return env, log_file


def _read_invocations(log_file: Path) -> list[dict[str, object]]:
    if not log_file.exists():
        return []
    return [
        json.loads(line)
        for line in log_file.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def _run_smoke(env: dict[str, str], *args: str) -> subprocess.CompletedProcess[str]:
    assert SMOKE_SCRIPT.is_file(), "scripts/deploy-smoke.sh does not exist"
    assert os.access(SMOKE_SCRIPT, os.X_OK), "scripts/deploy-smoke.sh is not executable"
    return subprocess.run(
        [str(SMOKE_SCRIPT), *args],
        cwd=REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
    )


# Implements TC-COMP-398
def test_smoke_exits_nonzero_on_first_failed_check_when_app_unhealthy(tmp_path: Path) -> None:
    """DAC-E1-23, TC-COMP-398: when `app` is unhealthy in check 1, the script
    exits non-zero, names check 1, and makes no `curl` call and no check 2-4
    `docker` call."""
    env, log_file = _setup_stubs(tmp_path, app_health="unhealthy")
    res = _run_smoke(env)

    assert res.returncode != 0
    combined = (res.stdout + res.stderr).lower()
    assert "check 1" in combined
    assert "app" in combined

    calls = _read_invocations(log_file)
    assert [c for c in calls if c["tool"] == "curl"] == []
    docker_First_args = [c["args"][0] for c in calls if c["tool"] == "docker"]  # type: ignore[index]
    assert "run" not in docker_First_args
    assert not any(
        "discover(MIGRATIONS_DIR)" in " ".join(c["args"])  # type: ignore[arg-type]
        for c in calls
        if c["tool"] == "docker"
    )


# Implements TC-COMP-427
def test_smoke_accepts_pg_hba_rules_using_scram_peer_or_reject(tmp_path: Path) -> None:
    """DAC-E1-S9-4, TC-COMP-427: comments, blank lines, and rules whose methods
    are `scram-sha-256`, `peer`, or `reject` pass check 1 (and all 4 checks)."""
    env, _ = _setup_stubs(tmp_path)
    res = _run_smoke(env)
    assert res.returncode == 0, f"unexpected failure: {res.stdout}\n{res.stderr}"


# Implements TC-COMP-428
@pytest.mark.parametrize("bad_method", ["trust", "password", "md5"])
def test_smoke_fails_check_1_on_disallowed_pg_hba_method(tmp_path: Path, bad_method: str) -> None:
    """DAC-E1-S9-4, TC-COMP-428: any `pg_hba.conf` rule using `trust`,
    `password`, `md5`, or any method outside `scram-sha-256`, `peer`, `reject`
    fails check 1 and exits non-zero without running checks 2-4."""
    bad_hba = _DEFAULT_PG_HBA + f"host all all 127.0.0.1/32 {bad_method}\n"
    env, log_file = _setup_stubs(tmp_path, pg_hba=bad_hba)
    res = _run_smoke(env)

    assert res.returncode != 0
    combined = (res.stdout + res.stderr).lower()
    assert "check 1" in combined or "pg_hba" in combined
    assert bad_method in combined

    calls = _read_invocations(log_file)
    assert [c for c in calls if c["tool"] == "curl"] == []


# Implements TC-COMP-431
def test_smoke_reads_expected_schema_version_from_running_image(tmp_path: Path) -> None:
    """DAC-E1-S9-6, TC-COMP-431: when the `app` image's `discover(MIGRATIONS_DIR)`
    reports 5 while `/api/health` reports `schema_version: 4`, check 2 fails."""
    env, _ = _setup_stubs(tmp_path, expected_schema_version="5")
    res = _run_smoke(env)

    assert res.returncode != 0
    combined = (res.stdout + res.stderr).lower()
    assert "check 2" in combined or "schema_version" in combined


# Implements TC-COMP-429
def test_smoke_defaults_to_factorflow_project_and_uses_proxy_free_redirect_free_curl(
    tmp_path: Path,
) -> None:
    """DAC-E1-S9-5, TC-COMP-429: with no argument, every `docker ps` filters by
    `label=com.docker.compose.project=factorflow`, and every `curl` call
    includes `--noproxy '*'` and `--proto =http` and never `-L` or
    `--location`."""
    env, log_file = _setup_stubs(tmp_path)
    res = _run_smoke(env)
    assert res.returncode == 0, f"{res.stdout}\n{res.stderr}"

    calls = _read_invocations(log_file)
    ps_calls = [
        c["args"]
        for c in calls
        if c["tool"] == "docker" and isinstance(c["args"], list) and c["args"][0] == "ps"
    ]
    assert ps_calls, "expected at least one `docker ps` call"
    for args in ps_calls:
        assert isinstance(args, list)
        joined = " ".join(args)
        assert "label=com.docker.compose.project=factorflow" in joined

    curl_calls = [c["args"] for c in calls if c["tool"] == "curl"]
    assert len(curl_calls) >= 2
    for args in curl_calls:
        assert isinstance(args, list)
        assert "--noproxy" in args
        idx = args.index("--noproxy")
        assert idx + 1 < len(args) and args[idx + 1] == "*"
        assert "--proto" in args
        p_idx = args.index("--proto")
        assert p_idx + 1 < len(args) and args[p_idx + 1] == "=http"
        assert "-L" not in args
        assert "--location" not in args


# Implements TC-COMP-430
def test_smoke_targets_project_named_by_its_argument(tmp_path: Path) -> None:
    """DAC-E1-S9-5, TC-COMP-430: `scripts/deploy-smoke.sh factorflow-drill`
    filters every `docker ps` by `label=com.docker.compose.project=factorflow-drill`."""
    env, log_file = _setup_stubs(tmp_path)
    res = _run_smoke(env, "factorflow-drill")
    assert res.returncode == 0, f"{res.stdout}\n{res.stderr}"

    calls = _read_invocations(log_file)
    ps_calls = [
        c["args"]
        for c in calls
        if c["tool"] == "docker" and isinstance(c["args"], list) and c["args"][0] == "ps"
    ]
    assert ps_calls
    for args in ps_calls:
        assert isinstance(args, list)
        joined = " ".join(args)
        assert "label=com.docker.compose.project=factorflow-drill" in joined
        assert "label=com.docker.compose.project=factorflow " not in joined + " "


# --- Additional unit tests for checks 3, 4, syntax, and secret scan (T008, T009) ---


def test_smoke_check_3_fails_when_root_does_not_serve_index_html(tmp_path: Path) -> None:
    """T008, DAC-E1-23: check 3 fails and exits non-zero when `GET /` does not
    return `index.html`."""
    env, _ = _setup_stubs(tmp_path, index_body='{"detail":"Not Found"}')
    res = _run_smoke(env)
    assert res.returncode != 0
    combined = (res.stdout + res.stderr).lower()
    assert "check 3" in combined or "index.html" in combined


def test_smoke_check_4_fails_when_non_loopback_address_accepts_connection(
    tmp_path: Path,
) -> None:
    """T008, AC-14, DAC-E1-23: check 4 probes ports 8000 and 5432 on every
    non-loopback address and fails if any accepts a connection or if the Docker
    Desktop VM probe reports a listener."""
    env, log_file = _setup_stubs(
        tmp_path,
        vm_probe_exit=1,
        vm_probe_stderr="Check 4 failed: listener on 192.168.65.3:8000",
    )
    res = _run_smoke(env)
    assert res.returncode != 0
    combined = (res.stdout + res.stderr).lower()
    assert "check 4" in combined or "192.168.65.3:8000" in combined

    calls = _read_invocations(log_file)
    run_calls = [
        c["args"]
        for c in calls
        if c["tool"] == "docker" and isinstance(c["args"], list) and c["args"][0] == "run"
    ]
    assert run_calls, "expected check 4 to run a host-network container probe on Docker Desktop"
    joined = " ".join(run_calls[0])  # type: ignore[arg-type]
    assert "--rm" in joined
    assert "--network host" in joined or "--network=host" in joined


def test_smoke_check_4_host_probe_enumerates_ipv4_ipv6_and_link_local_with_zone(
    tmp_path: Path,
) -> None:
    """T008, AC-14, DAC-E1-23: check 4 parses `ifconfig` for non-loopback IPv4,
    global IPv6, and link-local IPv6 with `%<iface>` zone, skipping `lo0`, and
    probes both 8000 and 5432 on each discovered address."""
    env, log_file = _setup_stubs(tmp_path, operating_system="Linux")
    # Place a sitecustomize.py on PYTHONPATH that records every `(addr, port)`
    # check 4 probes via `socket.getaddrinfo` and simulates an accepted
    # connection on the last discovered address (`192.168.4.26` port 5432).
    hook_dir = tmp_path / "pyhook"
    hook_dir.mkdir(parents=True, exist_ok=True)
    (hook_dir / "sitecustomize.py").write_text(
        f"""\
import json
import socket
from pathlib import Path

_orig_getaddrinfo = socket.getaddrinfo

def _patched_getaddrinfo(host, port, *args, **kwargs):
    if port in (8000, 5432):
        log_path = Path({str(log_file)!r})
        rec = {{"tool": "host_probe", "host": str(host), "port": int(port)}}
        with log_path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(rec) + "\\n")
        af = socket.AF_INET
        st = socket.SOCK_STREAM
        pr = socket.IPPROTO_TCP
        return [(af, st, pr, "", (str(host), int(port)))]
    return _orig_getaddrinfo(host, port, *args, **kwargs)

class _FakeSocket:
    def __init__(self, *args, **kwargs):
        pass
    def settimeout(self, timeout):
        pass
    def connect_ex(self, sockaddr):
        host, port = sockaddr[0], sockaddr[1]
        if host == "192.168.4.26" and port == 5432:
            return 0
        return 61
    def close(self):
        pass

socket.getaddrinfo = _patched_getaddrinfo
socket.socket = _FakeSocket
""",
        encoding="utf-8",
    )
    env["PYTHONPATH"] = str(hook_dir)

    res = _run_smoke(env)
    assert res.returncode != 0
    combined = (res.stdout + res.stderr).lower()
    assert "check 4" in combined
    assert "192.168.4.26:5432" in combined

    calls = _read_invocations(log_file)
    probed = [(c["host"], c["port"]) for c in calls if c["tool"] == "host_probe"]
    assert probed == [
        ("fe80::1899:a6a3:e4c0:be23%en0", 8000),
        ("fe80::1899:a6a3:e4c0:be23%en0", 5432),
        ("fd30:5ffa:7cb1:4e61::10", 8000),
        ("fd30:5ffa:7cb1:4e61::10", 5432),
        ("192.168.4.26", 8000),
        ("192.168.4.26", 5432),
    ]


def test_smoke_syntax_and_static_secret_and_run_guard() -> None:
    """T009, DAC-E1-23, runtime-config section 2.8.5: `bash -n
    scripts/deploy-smoke.sh` exits 0 (and `shellcheck` if installed), and the
    script never references any secret variable or `/api/acquisition-runs`."""
    assert SMOKE_SCRIPT.is_file(), "scripts/deploy-smoke.sh does not exist"
    syntax = subprocess.run(
        ["bash", "-n", str(SMOKE_SCRIPT)],
        capture_output=True,
        text=True,
    )
    assert syntax.returncode == 0, syntax.stderr

    shellcheck_bin = shutil.which("shellcheck")
    if shellcheck_bin is not None:
        sc = subprocess.run(
            [shellcheck_bin, str(SMOKE_SCRIPT)],
            capture_output=True,
            text=True,
        )
        assert sc.returncode == 0, sc.stdout + sc.stderr

    text = SMOKE_SCRIPT.read_text(encoding="utf-8")
    for forbidden in (
        "FACTORFLOW_MASSIVE_API_KEY",
        "FACTORFLOW_POSTGRES_PASSWORD",
        "FACTORFLOW_DATABASE_URL",
        "/api/acquisition-runs",
    ):
        assert forbidden not in text, f"scripts/deploy-smoke.sh must not reference {forbidden}"
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if "curl " in stripped:
            tokens = stripped.rstrip("\\").split()
            assert "-L" not in tokens and "--location" not in tokens
