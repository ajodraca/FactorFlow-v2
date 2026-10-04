import { execFileSync } from "node:child_process";

/**
 * Runs one SQL statement in the e2e PostgreSQL container and returns its
 * trimmed, unaligned output (CAP-001-E7-S4-tasks Other Notes, "E2E
 * seeding"). The container name and credentials are the constants in
 * `scripts/run-e2e-server.sh`. The e2e server starts no runner and no stub
 * provider, so result rows and running runs can only be seeded this way. A
 * test fixture, not a product contract.
 */
export function sql(statement: string): string {
  return execFileSync(
    "docker",
    [
      "exec",
      "-e",
      "PGPASSWORD=postgres",
      "factorflow-e2e-postgres",
      "psql",
      "--host=127.0.0.1",
      "--username=postgres",
      "--dbname=factorflow",
      "--no-password",
      "--tuples-only",
      "--no-align",
      "-v",
      "ON_ERROR_STOP=1",
      "--command",
      statement,
    ],
    { encoding: "utf-8" },
  ).trim();
}
