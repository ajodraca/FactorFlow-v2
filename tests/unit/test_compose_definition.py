"""`compose.yaml` keeps host networking, loopback listeners, `scram-sha-256`
authentication, required variable interpolations, and the service start order
(CAP-001-E1-S9).

Component design: `component-design-runtime-config.md` sections 2.8.3 and 7;
AC-13, AC-14, AC-16, DAC-E1-22, DAC-E1-S9-3; SEC-ENC-001 host-local loopback
exception conditions H1 to H4.

`compose.yaml` is parsed as text so the suite does not add PyYAML as a project
dependency. When the Docker CLI with Compose is available on the host, the
`docker compose config` tests (`TC-COMP-395`, `TC-COMP-396`) also run.
"""

import os
import re
import shutil
import subprocess
from pathlib import Path

import pytest

from tests.unit.test_no_committed_secrets import _in_scanned_scope

REPO_ROOT = Path(__file__).resolve().parents[2]
COMPOSE_PATH = REPO_ROOT / "compose.yaml"

_REQUIRED_VARS = (
    "FACTORFLOW_POSTGRES_PASSWORD",
    "FACTORFLOW_MASSIVE_API_KEY",
    "FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE",
    "FACTORFLOW_IMAGE_TAG",
)


def _read_compose() -> str:
    assert COMPOSE_PATH.is_file(), "compose.yaml is missing at the repository root"
    return COMPOSE_PATH.read_text(encoding="utf-8")


def _top_level_sections(text: str) -> dict[str, list[str]]:
    """Split `compose.yaml` into top-level block names and their indented body lines."""
    sections: dict[str, list[str]] = {}
    current_key: str | None = None
    for raw_line in text.splitlines():
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        indent = len(raw_line) - len(raw_line.lstrip(" "))
        if indent == 0 and ":" in stripped:
            key = stripped.split(":", 1)[0].strip()
            sections[key] = [raw_line]
            current_key = key
        elif current_key is not None:
            sections[current_key].append(raw_line)
    return sections


def _service_blocks(text: str) -> dict[str, str]:
    """Extract each 2-space-indented service block under `services:`."""
    sections = _top_level_sections(text)
    assert "services" in sections, "compose.yaml has no top-level `services:` block"
    service_lines = sections["services"][1:]
    services: dict[str, list[str]] = {}
    current_service: str | None = None
    for raw_line in service_lines:
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        indent = len(raw_line) - len(raw_line.lstrip(" "))
        if indent == 2 and stripped.endswith(":"):
            current_service = stripped[:-1].strip()
            services[current_service] = []
        elif current_service is not None:
            services[current_service].append(raw_line)
    return {name: "\n".join(lines) for name, lines in services.items()}


def _docker_compose_available() -> bool:
    if shutil.which("docker") is None:
        return False
    result = subprocess.run(
        ["docker", "compose", "version"],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


# Implements TC-COMP-426
def test_compose_declares_project_name_and_three_host_network_services_with_no_ports() -> None:
    """DAC-E1-S9-3, DAC-E1-22, AC-14: `name: factorflow`, services `postgres`,
    `app`, and `ingestion` all on `network_mode: host` with `restart:
    unless-stopped`, and no `ports:` key anywhere in the file."""
    text = _read_compose()
    assert re.search(r"^name:\s*factorflow\s*$", text, flags=re.MULTILINE)
    assert not re.search(r"^\s*ports\s*:", text, flags=re.MULTILINE), (
        "compose.yaml must not declare a `ports:` key"
    )
    assert "FACTORFLOW_API_HOST" not in text

    services = _service_blocks(text)
    assert set(services) == {"postgres", "app", "ingestion"}
    for name, block in services.items():
        assert re.search(r"^\s+network_mode:\s*host\s*$", block, flags=re.MULTILINE), (
            f"{name} missing network_mode: host"
        )
        assert re.search(r"^\s+restart:\s*unless-stopped\s*$", block, flags=re.MULTILINE), (
            f"{name} missing restart: unless-stopped"
        )


# Implements TC-COMP-426
def test_compose_postgres_loopback_listen_scram_auth_volume_and_socket_healthcheck() -> None:
    """DAC-E1-S9-3, H1, H2, H4: PostgreSQL 16 listens only on `127.0.0.1`,
    enforces `scram-sha-256` on host and local routes, mounts
    `factorflow-pgdata`, and runs `pg_isready` over the local socket (no `-h`)."""
    text = _read_compose()
    services = _service_blocks(text)
    pg = services["postgres"]

    assert re.search(r"^\s+image:\s*postgres:16\s*$", pg, flags=re.MULTILINE)
    assert 'command: ["postgres", "-c", "listen_addresses=127.0.0.1", "-c", "port=5432"]' in pg
    assert "POSTGRES_DB: factorflow" in pg
    assert "POSTGRES_USER: factorflow" in pg
    assert (
        "POSTGRES_PASSWORD: ${FACTORFLOW_POSTGRES_PASSWORD:?set FACTORFLOW_POSTGRES_PASSWORD}" in pg
    )
    assert "POSTGRES_HOST_AUTH_METHOD: scram-sha-256" in pg
    assert "POSTGRES_INITDB_ARGS: --auth-host=scram-sha-256 --auth-local=scram-sha-256" in pg
    assert "- factorflow-pgdata:/var/lib/postgresql/data" in pg
    healthcheck_lines = [line for line in pg.splitlines() if "pg_isready" in line]
    assert healthcheck_lines == [
        '      test: ["CMD", "pg_isready", "-U", "factorflow", "-d", "factorflow"]'
    ]
    assert "-h" not in healthcheck_lines[0]
    assert "--host" not in healthcheck_lines[0]

    sections = _top_level_sections(text)
    assert "volumes" in sections
    volumes_body = "\n".join(sections["volumes"])
    assert "factorflow-pgdata:" in volumes_body


# Implements TC-COMP-426
def test_compose_database_url_and_required_variable_interpolations() -> None:
    """DAC-E1-S9-3, AC-13, H2, H4: `FACTORFLOW_DATABASE_URL` connects to
    `127.0.0.1:5432` with `require_auth=scram-sha-256`, and every secret and the
    image tag use `${VAR:?...}` required interpolation."""
    text = _read_compose()
    expected_url = (
        "FACTORFLOW_DATABASE_URL: "
        "postgresql://factorflow:"
        "${FACTORFLOW_POSTGRES_PASSWORD:?set FACTORFLOW_POSTGRES_PASSWORD}"
        "@127.0.0.1:5432/factorflow?require_auth=scram-sha-256"
    )
    assert expected_url in text

    for var in _REQUIRED_VARS:
        pattern = re.compile(rf"\$\{{{var}:\?[^}}]+\}}")
        assert pattern.search(text), f"{var} must use ${{...:?...}} required interpolation"
        # Ensure no bare/default interpolation `${VAR}` or `${VAR:-...}` is used.
        for match in re.finditer(rf"\$\{{{var}([^}}]*)\}}", text):
            suffix = match.group(1)
            assert suffix.startswith(":?"), (
                f"{var} interpolation must be required (:?), got ${{{var}{suffix}}}"
            )


# Implements TC-COMP-426
def test_compose_app_and_ingestion_share_image_and_enforce_start_order() -> None:
    """DAC-E1-S9-3, AC-16: `app` and `ingestion` use the exact same image,
    `app` depends on healthy `postgres` and its `http.client` healthcheck
    requires `database == 'reachable'` and `schema_version is not None`, and
    `ingestion` is in the `ingestion` profile with `factorflow.ingestion_main`
    depending on healthy `app`."""
    services = _read_compose()
    blocks = _service_blocks(services)
    app = blocks["app"]
    ingestion = blocks["ingestion"]

    expected_image = "image: factorflow:${FACTORFLOW_IMAGE_TAG:?set FACTORFLOW_IMAGE_TAG}"
    assert expected_image in app
    assert expected_image in ingestion

    assert re.search(
        r"depends_on:\s*\n\s+postgres:\s*\n\s+condition:\s*service_healthy",
        app,
    )
    assert "http.client.HTTPConnection('127.0.0.1', 8000, timeout=3)" in app
    assert "h.get('database') == 'reachable' and h.get('schema_version') is not None" in app
    assert (
        "FACTORFLOW_MASSIVE_API_KEY: "
        "${FACTORFLOW_MASSIVE_API_KEY:?set FACTORFLOW_MASSIVE_API_KEY}" in app
    )

    assert "profiles: [ingestion]" in ingestion
    assert 'command: ["python", "-m", "factorflow.ingestion_main"]' in ingestion
    assert (
        "FACTORFLOW_MASSIVE_API_KEY: "
        "${FACTORFLOW_MASSIVE_API_KEY:?set FACTORFLOW_MASSIVE_API_KEY}" in ingestion
    )
    assert (
        "FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE: "
        "${FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE:?set FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE}"
        in ingestion
    )
    assert re.search(
        r"depends_on:\s*\n\s+app:\s*\n\s+condition:\s*service_healthy",
        ingestion,
    )


# Implements TC-COMP-426
def test_secret_scanner_covers_compose_dockerignore_and_deploy_smoke() -> None:
    """T007, AC-13: `compose.yaml`, `.dockerignore`, and `scripts/deploy-smoke.sh`
    are in scope of `tests/unit/test_no_committed_secrets.py`."""
    for rel_path in ("compose.yaml", ".dockerignore", "scripts/deploy-smoke.sh"):
        assert _in_scanned_scope(rel_path), (
            f"{rel_path} must be covered by test_no_committed_secrets.py"
        )


# Implements TC-COMP-395
@pytest.mark.skipif(
    not _docker_compose_available(),
    reason="docker compose CLI is not available on this host",
)
def test_docker_compose_config_renders_services_and_ingestion_profile() -> None:
    """DAC-E1-22, TC-COMP-395: with the four variables set, `docker compose
    config` renders `postgres` and `app` only, and `--profile ingestion config`
    adds `ingestion`."""
    assert COMPOSE_PATH.is_file(), "compose.yaml is missing"
    env = {
        **os.environ,
        "FACTORFLOW_POSTGRES_PASSWORD": "testpassword1234567890abcdef",
        "FACTORFLOW_MASSIVE_API_KEY": "test-non-secret-key",
        "FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE": "60",
        "FACTORFLOW_IMAGE_TAG": "0.1.0-testsha",
    }

    default_res = subprocess.run(
        ["docker", "compose", "-f", str(COMPOSE_PATH), "config", "--services"],
        cwd=REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )
    assert set(default_res.stdout.splitlines()) == {"postgres", "app"}

    profile_res = subprocess.run(
        [
            "docker",
            "compose",
            "-f",
            str(COMPOSE_PATH),
            "--profile",
            "ingestion",
            "config",
            "--services",
        ],
        cwd=REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )
    assert set(profile_res.stdout.splitlines()) == {"postgres", "app", "ingestion"}

    full_cfg = subprocess.run(
        [
            "docker",
            "compose",
            "-f",
            str(COMPOSE_PATH),
            "--profile",
            "ingestion",
            "config",
        ],
        cwd=REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    assert full_cfg.count("network_mode: host") == 3
    assert "ports:" not in full_cfg
    assert "@127.0.0.1:5432/factorflow?require_auth=scram-sha-256" in full_cfg


# Implements TC-COMP-396
@pytest.mark.skipif(
    not _docker_compose_available(),
    reason="docker compose CLI is not available on this host",
)
@pytest.mark.parametrize("missing_var", _REQUIRED_VARS)
def test_docker_compose_config_fails_and_names_missing_variable(missing_var: str) -> None:
    """DAC-E1-22, AC-13, TC-COMP-396: when any of the four required variables is
    unset (or empty), `docker compose config` exits non-zero and names the
    missing variable."""
    assert COMPOSE_PATH.is_file(), "compose.yaml is missing"
    env = {
        **os.environ,
        "FACTORFLOW_POSTGRES_PASSWORD": "testpassword1234567890abcdef",
        "FACTORFLOW_MASSIVE_API_KEY": "test-non-secret-key",
        "FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE": "60",
        "FACTORFLOW_IMAGE_TAG": "0.1.0-testsha",
    }
    env.pop(missing_var, None)

    result = subprocess.run(
        [
            "docker",
            "compose",
            "-f",
            str(COMPOSE_PATH),
            "--profile",
            "ingestion",
            "config",
        ],
        cwd=REPO_ROOT,
        env=env,
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert missing_var in result.stderr
