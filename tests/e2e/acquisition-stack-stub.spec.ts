import { expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  ingestionProcessIsRunning,
  resetAcquisitionStore,
  stubRequests,
  waitForRunState,
} from "./support/acquisition";

/**
 * The E2E acquisition stack reaches the loopback Massive stub (TC-INT-027;
 * DAC-E3-S7-14; `runtime-config` section 14 item 4). After the acquisition
 * API on 127.0.0.1:8125 answers health, the ingestion process
 * `scripts/run-e2e-server.sh` started is still running, and a run requested
 * there sends its provider `GET` requests to the DEC-0025 stub on
 * 127.0.0.1:8126 and reaches a terminal state. This is the breakage the
 * CAP-001-E3-S6/S7 landing rule prevents: with E3-S6 applied alone, the
 * ingestion process refuses to start and step 2 fails
 * (CAP-001-integration-tests-automation-tasks T028).
 */
test.beforeEach(async () => {
  await resetAcquisitionStore();
});

const TERMINAL_STATES = ["succeeded", "partial", "failed", "cancelled", "abandoned"];

// Implements TC-INT-027
test("TC-INT-027: the E2E acquisition stack reaches the loopback Massive stub", async ({
  request,
}) => {
  const health = await request.get(`${ACQUISITION_BASE_URL}/api/health`);
  expect(health.status()).toBe(200);

  expect(
    ingestionProcessIsRunning(),
    "the acquisition ingestion process refused to start or exited after health answered",
  ).toBe(true);

  const depth = await request.put(`${ACQUISITION_BASE_URL}/api/settings/history-depth`, {
    data: { years: 1 },
  });
  expect(depth.status()).toBe(200);
  const instruments = await request.post(`${ACQUISITION_BASE_URL}/api/instruments`, {
    data: { symbols: ["STB"] },
  });
  expect(instruments.status()).toBe(201);

  const started = await request.post(`${ACQUISITION_BASE_URL}/api/acquisition-runs`);
  expect(started.status()).toBe(202);
  const runId: string = (await started.json()).run_id;

  await waitForRunState(request, runId, TERMINAL_STATES, 20_000);

  const received = await stubRequests();
  expect(received.length).toBeGreaterThan(0);
  for (const entry of received) {
    expect(entry.method).toBe("GET");
  }
  expect(received.map((entry) => entry.path)).toContain("/v3/reference/tickers/STB");
});
