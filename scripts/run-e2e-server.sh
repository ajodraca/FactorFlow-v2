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
set -euo pipefail
cd "$(dirname "$0")/.."

CONTAINER_NAME="factorflow-e2e-postgres"
DB_PORT="${FACTORFLOW_E2E_DB_PORT:-55433}"
API_PORT="${FACTORFLOW_API_PORT:-8123}"
API_PID=""

cleanup() {
  if [[ -n "$API_PID" ]]; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=factorflow \
  -p "${DB_PORT}:5432" \
  postgres:16 >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

export FACTORFLOW_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/factorflow"
export FACTORFLOW_MASSIVE_API_KEY="${FACTORFLOW_MASSIVE_API_KEY:-e2e-test-key}"
export FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE="${FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE:-60}"
export FACTORFLOW_API_PORT="${API_PORT}"

uv run python -m factorflow.db.migrate_main

npm run build --silent

uv run python -m factorflow.app_main &
API_PID=$!
wait "$API_PID"
