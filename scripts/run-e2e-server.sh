#!/usr/bin/env bash
# Starts a real PostgreSQL container, applies migrations, builds the
# interface bundle, and runs the API process — the environment
# `tests/e2e/` specs run against, matching component design section 7 ("the
# end-to-end suite runs against the real API and a real PostgreSQL
# container with a stubbed provider"). Invoked by `playwright.config.ts`'s
# `webServer.command`; Playwright starts this once, waits for
# `GET /api/health` to answer, and terminates it (SIGTERM) after the suite,
# which the trap below turns into stopping the API and removing the
# container — a `uv run ... &` child plus an explicit `wait`, not `exec`,
# because replacing this shell's process image with the API's would
# discard the trap and leave the container running after teardown.
#
# Playwright's own teardown can still escalate to SIGKILL, which no trap
# can catch — `package.json`'s `posttest:e2e` script is the reliable
# backstop that always removes the container by name once
# `npm run test:e2e` finishes, regardless of how this script was stopped.
#
# Three stacks share the one container and the one built bundle
# (CAP-001-e2e-tests-automation-tasks T002; DEC-0025, DEC-0026):
#
# - Main, 127.0.0.1:${FACTORFLOW_API_PORT:-8123}, database `factorflow`: no
#   runner and no provider, so a started run stays `requested`. The existing
#   specs and TC-E2E-003, 008, 011 and 012 (bundle) use it.
# - Acquisition, 127.0.0.1:${FACTORFLOW_E2E_ACQ_PORT:-8125}, database
#   `factorflow_acquisition`: its own API plus an ingestion runner whose
#   provider is `tests/e2e/support/massive_stub.py` on
#   127.0.0.1:${FACTORFLOW_E2E_STUB_PORT:-8126}. TC-E2E-001, 002, 004-007,
#   009 and 010 use it.
# - Refused, 127.0.0.1:${FACTORFLOW_E2E_REFUSED_PORT:-8124}, database
#   `factorflow_ahead`: a store ahead of this build. The production start
#   chain (Dockerfile `CMD`) is run against it once and must exit 2
#   (`StoreAheadOfBuildError`) without binding the port, or this script
#   aborts. TC-E2E-012 uses it.
#
# The acquisition stack is up and the refused start is through before the
# main API starts, so `playwright.config.ts`'s health wait on the main API
# covers all three.
set -euo pipefail
cd "$(dirname "$0")/.."

CONTAINER_NAME="factorflow-e2e-postgres"
DB_PORT="${FACTORFLOW_E2E_DB_PORT:-55433}"
API_PORT="${FACTORFLOW_API_PORT:-8123}"
ACQ_PORT="${FACTORFLOW_E2E_ACQ_PORT:-8125}"
STUB_PORT="${FACTORFLOW_E2E_STUB_PORT:-8126}"
REFUSED_PORT="${FACTORFLOW_E2E_REFUSED_PORT:-8124}"
API_PID=""
BACKGROUND_PIDS=()

cleanup() {
  local pid
  for pid in "${BACKGROUND_PIDS[@]}" "$API_PID"; do
    if [[ -n "$pid" ]]; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=factorflow \
  -p "${DB_PORT}:5432" \
  postgres:16 >/dev/null

# The image briefly starts an init-only server on its Unix socket before the
# final server begins accepting TCP connections.  Probing the default socket
# can therefore report ready too early and race the migration below.  Query the
# real database over TCP instead, which also verifies its credentials.
DATABASE_READY=false
for _ in $(seq 1 60); do
  if docker exec -e PGPASSWORD=postgres "$CONTAINER_NAME" \
    psql --host=127.0.0.1 --username=postgres --dbname=factorflow \
    --no-password --tuples-only --command='SELECT 1' >/dev/null 2>&1; then
    DATABASE_READY=true
    break
  fi
  sleep 1
done

if [[ "$DATABASE_READY" != true ]]; then
  echo "PostgreSQL did not become ready within 60 seconds" >&2
  exit 1
fi

export FACTORFLOW_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/factorflow"
export FACTORFLOW_MASSIVE_API_KEY="${FACTORFLOW_MASSIVE_API_KEY:-e2e-test-key}"
export FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE="${FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE:-60}"
export FACTORFLOW_API_PORT="${API_PORT}"

uv run python -m factorflow.db.migrate_main

npm run build --silent

database_url() {
  echo "postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/$1"
}

for database in factorflow_acquisition factorflow_ahead; do
  docker exec -e PGPASSWORD=postgres "$CONTAINER_NAME" \
    psql --host=127.0.0.1 --username=postgres --dbname=factorflow \
    --no-password -v ON_ERROR_STOP=1 --command="CREATE DATABASE ${database}" >/dev/null
  FACTORFLOW_DATABASE_URL="$(database_url "$database")" \
    uv run python -m factorflow.db.migrate_main
done

# A store ahead of this build: the same seed
# tests/integration/test_migrator_refuses.py uses.
docker exec -e PGPASSWORD=postgres "$CONTAINER_NAME" \
  psql --host=127.0.0.1 --username=postgres --dbname=factorflow_ahead \
  --no-password -v ON_ERROR_STOP=1 \
  --command="INSERT INTO applied_migrations (version, name, checksum) VALUES (99, 'from_the_future', 'deadbeef')" \
  >/dev/null

# The refused start (TC-E2E-012): the production start chain must stop at
# the migration with exit 2 and never start the API on the refused port.
REFUSED_STATUS=0
FACTORFLOW_DATABASE_URL="$(database_url factorflow_ahead)" \
  FACTORFLOW_API_PORT="$REFUSED_PORT" \
  timeout 60 uv run sh -c "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main" \
  || REFUSED_STATUS=$?
if [[ "$REFUSED_STATUS" -ne 2 ]]; then
  echo "The start against a store ahead of this build exited ${REFUSED_STATUS}, not 2" >&2
  exit 1
fi

# The acquisition stack. Its provider and runner settings are set only for
# these child processes, never exported to the main API.
uv run python tests/e2e/support/massive_stub.py "$STUB_PORT" &
BACKGROUND_PIDS+=("$!")

ACQUISITION_ENV=(
  "FACTORFLOW_DATABASE_URL=$(database_url factorflow_acquisition)"
  "FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:${STUB_PORT}"
  "FACTORFLOW_MASSIVE_API_KEY=e2e-test-key"
  "FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=6000"
  "FACTORFLOW_RUN_POLL_INTERVAL_SECONDS=1"
)
env "${ACQUISITION_ENV[@]}" FACTORFLOW_API_PORT="$ACQ_PORT" \
  uv run python -m factorflow.app_main &
BACKGROUND_PIDS+=("$!")
env "${ACQUISITION_ENV[@]}" uv run python -m factorflow.ingestion_main &
BACKGROUND_PIDS+=("$!")

ACQUISITION_READY=false
for _ in $(seq 1 60); do
  if curl --silent --fail --output /dev/null "http://127.0.0.1:${ACQ_PORT}/api/health"; then
    ACQUISITION_READY=true
    break
  fi
  sleep 1
done

if [[ "$ACQUISITION_READY" != true ]]; then
  echo "The acquisition API did not answer on port ${ACQ_PORT} within 60 seconds" >&2
  exit 1
fi

uv run python -m factorflow.app_main &
API_PID=$!
wait "$API_PID"
