import { type APIRequestContext, expect } from "@playwright/test";
import { sql } from "./database";

/**
 * Helpers for the acquisition stack `scripts/run-e2e-server.sh` starts: an
 * API with an ingestion runner on 127.0.0.1:8125, its own database
 * `factorflow_acquisition`, and the stub Massive provider
 * (`massive_stub.py`) on 127.0.0.1:8126 (CAP-001-e2e-tests-automation-tasks
 * T004; DEC-0025). Supports TC-E2E-001, 002, 004-007, 009, 010.
 *
 * Every acquisition-stack spec calls `resetAcquisitionStore()` in
 * `beforeEach`, so no spec depends on file order, and leaves no run
 * non-terminal at its end. A test fixture, not a product contract.
 */
export const ACQUISITION_BASE_URL = "http://127.0.0.1:8125";

const STUB_BASE_URL = "http://127.0.0.1:8126";
const ACQUISITION_DATABASE = "factorflow_acquisition";

/** Every table `migrations/0001`-`0004` create, except `applied_migrations`. */
const DATA_TABLES = [
  "instrument",
  "owner_setting",
  "instrument_reference",
  "daily_bar",
  "fundamental_observation",
  "corporate_action",
  "coverage_segment",
  "acquisition_state",
  "acquisition_run",
  "run_instrument_result",
];

async function stubControl(path: string, body: Record<string, string> = {}): Promise<void> {
  const response = await fetch(`${STUB_BASE_URL}/__stub/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`stub control ${path} answered ${response.status}: ${await response.text()}`);
  }
}

export type ProviderMode = "ok" | "reject-credential";

export function setProviderMode(mode: ProviderMode): Promise<void> {
  return stubControl("mode", { mode });
}

export function holdSymbol(symbol: string): Promise<void> {
  return stubControl("hold", { symbol });
}

export function releaseSymbol(symbol: string): Promise<void> {
  return stubControl("release", { symbol });
}

export function resetStub(): Promise<void> {
  return stubControl("reset");
}

/** Restores the stub's defaults and empties every data table on the acquisition stack. */
export async function resetAcquisitionStore(): Promise<void> {
  await resetStub();
  sql(`TRUNCATE ${DATA_TABLES.join(", ")} RESTART IDENTITY CASCADE`, ACQUISITION_DATABASE);
}

/**
 * Polls `GET /api/acquisition-runs/{id}` on the acquisition stack until the
 * run's state is one of `states`, and returns that state.
 */
export async function waitForRunState(
  request: APIRequestContext,
  runId: string,
  states: string[],
  timeoutMs: number,
): Promise<string> {
  let state = "";
  await expect
    .poll(
      async () => {
        const response = await request.get(`${ACQUISITION_BASE_URL}/api/acquisition-runs/${runId}`);
        expect(response.ok()).toBe(true);
        state = (await response.json()).run.state;
        return states.includes(state);
      },
      { timeout: timeoutMs, message: `run ${runId} never reached ${states.join(" or ")}` },
    )
    .toBe(true);
  return state;
}
