#!/usr/bin/env bash
# Deployment smoke check (component-design-runtime-config.md section 2.8.5).
#
# Usage: scripts/deploy-smoke.sh [project]
# Default project: factorflow (the drill passes factorflow-drill).
#
# Exits non-zero on the first failed check. Never reads, prints, or sends any
# secret, and never starts an acquisition run.

set -euo pipefail

PROJECT="${1:-factorflow}"

fail() {
    echo "FAIL: $*" >&2
    exit 1
}

# ---------------------------------------------------------------------------
# Check 1: postgres and app containers healthy, and pg_hba.conf methods only
# scram-sha-256, peer, or reject.
# ---------------------------------------------------------------------------
POSTGRES_CONTAINER="$(docker ps \
    --filter "label=com.docker.compose.project=${PROJECT}" \
    --filter "label=com.docker.compose.service=postgres" \
    --format '{{.ID}}' | head -n 1)"

if [[ -z "${POSTGRES_CONTAINER}" ]]; then
    fail "Check 1 (container health): no running postgres container for project '${PROJECT}'"
fi

POSTGRES_HEALTH="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "${POSTGRES_CONTAINER}")"
if [[ "${POSTGRES_HEALTH}" != "healthy" ]]; then
    fail "Check 1 (container health): postgres container (${POSTGRES_CONTAINER}) is '${POSTGRES_HEALTH}', expected 'healthy'"
fi

APP_CONTAINER="$(docker ps \
    --filter "label=com.docker.compose.project=${PROJECT}" \
    --filter "label=com.docker.compose.service=app" \
    --format '{{.ID}}' | head -n 1)"

if [[ -z "${APP_CONTAINER}" ]]; then
    fail "Check 1 (container health): no running app container for project '${PROJECT}'"
fi

APP_HEALTH="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "${APP_CONTAINER}")"
if [[ "${APP_HEALTH}" != "healthy" ]]; then
    fail "Check 1 (container health): app container (${APP_CONTAINER}) is '${APP_HEALTH}', expected 'healthy'"
fi

HBA_CONTENT="$(docker exec "${POSTGRES_CONTAINER}" sh -c 'grep -v "^[[:space:]]*#" "$PGDATA/pg_hba.conf"')"
python3 - "${HBA_CONTENT}" <<'PY' || fail "Check 1 (pg_hba.conf): disallowed authentication method or empty rules"
import sys

ALLOWED = {"scram-sha-256", "peer", "reject"}
rules = 0
for raw in sys.argv[1].splitlines():
    line = raw.split("#", 1)[0].strip()
    if not line:
        continue
    tokens = line.split()
    record_type = tokens[0]
    if record_type == "local":
        if len(tokens) < 4:
            print(f"Check 1 (pg_hba.conf): malformed local rule: {line}", file=sys.stderr)
            sys.exit(1)
        method = tokens[3]
    elif record_type in ("host", "hostssl", "hostnossl", "hostgssenc", "hostnogssenc"):
        if len(tokens) < 5:
            print(f"Check 1 (pg_hba.conf): malformed host rule: {line}", file=sys.stderr)
            sys.exit(1)
        method = tokens[4]
        if "/" not in tokens[3] and tokens[3] not in ("all", "samehost", "samenet"):
            if len(tokens) < 6:
                print(f"Check 1 (pg_hba.conf): malformed netmask rule: {line}", file=sys.stderr)
                sys.exit(1)
            method = tokens[5]
    else:
        print(f"Check 1 (pg_hba.conf): unknown record type '{record_type}' in rule: {line}", file=sys.stderr)
        sys.exit(1)
    if method not in ALLOWED:
        print(
            f"Check 1 (pg_hba.conf): disallowed auth method '{method}' in rule: {line}",
            file=sys.stderr,
        )
        sys.exit(1)
    rules += 1

if rules == 0:
    print("Check 1 (pg_hba.conf): no active authentication rules found", file=sys.stderr)
    sys.exit(1)
PY

echo "PASS: Check 1 (postgres and app healthy; pg_hba.conf methods verified)"

# ---------------------------------------------------------------------------
# Check 2: GET http://127.0.0.1:8000/api/health reports database == "reachable"
# and schema_version equal to the running image's highest migration version.
# ---------------------------------------------------------------------------
EXPECTED_SCHEMA_VERSION="$(docker exec "${APP_CONTAINER}" python -c \
    "from factorflow.db.migrate_main import MIGRATIONS_DIR; from factorflow.db.migrator import discover; print(max(f.version for f in discover(MIGRATIONS_DIR)))" \
    | tr -d '[:space:]')"

if [[ -z "${EXPECTED_SCHEMA_VERSION}" ]]; then
    fail "Check 2 (health and schema_version): could not read expected schema version from app image"
fi

HEALTH_JSON="$(curl --silent --show-error --fail --noproxy '*' --proto =http "http://127.0.0.1:8000/api/health")" \
    || fail "Check 2 (health and schema_version): GET http://127.0.0.1:8000/api/health failed"

python3 - "${HEALTH_JSON}" "${EXPECTED_SCHEMA_VERSION}" <<'PY' || fail "Check 2 (health and schema_version): health response did not match expected state"
import json
import sys

payload = json.loads(sys.argv[1])
expected_version = int(sys.argv[2])
db_state = payload.get("database")
actual_version = payload.get("schema_version")
if db_state != "reachable":
    print(f"Check 2: expected database == 'reachable', got {db_state!r}", file=sys.stderr)
    sys.exit(1)
if actual_version != expected_version:
    print(
        f"Check 2: expected schema_version == {expected_version}, got {actual_version!r}",
        file=sys.stderr,
    )
    sys.exit(1)
PY

echo "PASS: Check 2 (health database=reachable, schema_version=${EXPECTED_SCHEMA_VERSION})"

# ---------------------------------------------------------------------------
# Check 3: GET http://127.0.0.1:8000/ serves the interface bundle's index.html.
# ---------------------------------------------------------------------------
INDEX_HTML="$(curl --silent --show-error --fail --noproxy '*' --proto =http "http://127.0.0.1:8000/")" \
    || fail "Check 3 (interface bundle): GET http://127.0.0.1:8000/ failed"

python3 - "${INDEX_HTML}" <<'PY' || fail "Check 3 (interface bundle): GET / did not return index.html"
import sys

body = sys.argv[1].lower()
if "<!doctype html>" not in body or "<div id=\"root\"" not in body:
    print("Check 3: response from GET / does not contain index.html markers", file=sys.stderr)
    sys.exit(1)
PY

echo "PASS: Check 3 (GET / serves index.html)"

# ---------------------------------------------------------------------------
# Check 4: neither port 8000 nor port 5432 accepts a connection on any
# non-loopback IPv4, IPv6, or link-local address of the host or (on Docker
# Desktop) of the Linux virtual machine.
# ---------------------------------------------------------------------------
HOST_ADDR_RAW=""
if command -v ifconfig >/dev/null 2>&1; then
    HOST_ADDR_RAW="$(ifconfig)"
elif command -v ip >/dev/null 2>&1; then
    HOST_ADDR_RAW="$(ip addr)"
else
    fail "Check 4 (off-host listeners): neither 'ifconfig' nor 'ip' is available on PATH"
fi

python3 - "${HOST_ADDR_RAW}" <<'PY' || fail "Check 4 (off-host listeners): a non-loopback host address accepted a connection on port 8000 or 5432"
import errno
import ipaddress
import re
import socket
import sys

raw_text = sys.argv[1]
addresses: list[str] = []
current_iface = ""

for line in raw_text.splitlines():
    m_bsd = re.match(r"^([A-Za-z0-9_.-]+):\s+flags=", line)
    m_linux = re.match(r"^\d+:\s+([A-Za-z0-9_.-]+?)(?:@[^:]+)?:\s+<", line)
    if m_bsd:
        current_iface = m_bsd.group(1)
        continue
    if m_linux:
        current_iface = m_linux.group(1)
        continue
    if current_iface in ("lo", "lo0"):
        continue
    tokens = line.strip().split()
    if len(tokens) < 2:
        continue
    if tokens[0] == "inet":
        ip_str = tokens[1].split("/")[0]
        try:
            ip4 = ipaddress.IPv4Address(ip_str)
        except ValueError:
            continue
        if not ip4.is_loopback:
            addr = str(ip4)
            if addr not in addresses:
                addresses.append(addr)
    elif tokens[0] == "inet6":
        ip_token = tokens[1].split("/")[0]
        addr_part, _, explicit_zone = ip_token.partition("%")
        try:
            ip6 = ipaddress.IPv6Address(addr_part)
        except ValueError:
            continue
        if not ip6.is_loopback:
            zone = explicit_zone or (current_iface if ip6.is_link_local else "")
            addr = f"{ip6}%{zone}" if zone else str(ip6)
            if addr not in addresses:
                addresses.append(addr)

for addr in addresses:
    for port in (8000, 5432):
        try:
            infos = socket.getaddrinfo(addr, port, proto=socket.IPPROTO_TCP)
        except OSError:
            continue
        for family, socktype, proto, _, sockaddr in infos:
            sock = socket.socket(family, socktype, proto)
            sock.settimeout(0.5)
            try:
                rc = sock.connect_ex(sockaddr)
            except OSError:
                rc = errno.EHOSTUNREACH
            finally:
                sock.close()
            if rc == 0:
                print(
                    f"Check 4: non-loopback address {addr}:{port} accepted a connection",
                    file=sys.stderr,
                )
                sys.exit(1)
PY

DOCKER_OS="$(docker info --format '{{.OperatingSystem}}' 2>/dev/null || true)"
if [[ "${DOCKER_OS}" == *"Docker Desktop"* ]]; then
    APP_IMAGE="$(docker inspect --format '{{.Config.Image}}' "${APP_CONTAINER}")"
    docker run --rm --network host "${APP_IMAGE}" python -c '
import errno
import fcntl
import ipaddress
import os
import socket
import struct
import sys

SIOCGIFADDR = 0x8915
addresses: list[str] = []
probe_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    for iface in sorted(os.listdir("/sys/class/net")):
        if iface in ("lo", "lo0", "bonding_masters"):
            continue
        try:
            ifreq = struct.pack("256s", iface.encode("utf-8")[:15])
            res = fcntl.ioctl(probe_sock.fileno(), SIOCGIFADDR, ifreq)
            ip4 = ipaddress.IPv4Address(socket.inet_ntoa(res[20:24]))
            if not ip4.is_loopback:
                addr = str(ip4)
                if addr not in addresses:
                    addresses.append(addr)
        except OSError:
            continue
finally:
    probe_sock.close()

if os.path.exists("/proc/net/if_inet6"):
    with open("/proc/net/if_inet6", encoding="utf-8") as fh:
        for line in fh:
            parts = line.split()
            if len(parts) < 6:
                continue
            raw_hex, iface = parts[0], parts[5]
            if iface in ("lo", "lo0"):
                continue
            ip6 = ipaddress.IPv6Address(int(raw_hex, 16))
            if not ip6.is_loopback:
                addr = f"{ip6}%{iface}" if ip6.is_link_local else str(ip6)
                if addr not in addresses:
                    addresses.append(addr)

for addr in addresses:
    for port in (8000, 5432):
        try:
            infos = socket.getaddrinfo(addr, port, proto=socket.IPPROTO_TCP)
        except OSError:
            continue
        for family, socktype, proto, _, sockaddr in infos:
            sock = socket.socket(family, socktype, proto)
            sock.settimeout(0.5)
            try:
                rc = sock.connect_ex(sockaddr)
            except OSError:
                rc = errno.EHOSTUNREACH
            finally:
                sock.close()
            if rc == 0:
                print(
                    f"Check 4 (VM): non-loopback address {addr}:{port} accepted a connection",
                    file=sys.stderr,
                )
                sys.exit(1)
' || fail "Check 4 (off-host listeners): Docker Desktop VM non-loopback probe failed"
fi

echo "PASS: Check 4 (no off-host listener on port 8000 or 5432)"
