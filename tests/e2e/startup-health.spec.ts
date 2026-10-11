import { connect } from "node:net";
import { networkInterfaces } from "node:os";
import { expect, test } from "@playwright/test";

/**
 * The product starts and reports its health (TC-E2E-011; AC-13, AC-14,
 * AC-15, AC-18), on the main stack at 127.0.0.1:8123
 * (CAP-001-e2e-tests-automation-tasks T013). The status region reports that
 * the product is answering and how the run `GET /api/health` names as most
 * recent ended (EXP-20261011-2), and the API is reachable on loopback only.
 */
const RUN_STATE_LABEL: Record<string, string> = {
  requested: "Requested",
  running: "Running",
  cancelling: "Cancelling",
  succeeded: "Succeeded",
  partial: "Partial",
  failed: "Failed",
  cancelled: "Cancelled",
  abandoned: "Abandoned",
};

function firstExternalIPv4(): string | undefined {
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
  return undefined;
}

function connectionError(host: string, port: number): Promise<string> {
  return new Promise((resolve) => {
    const socket = connect({ host, port, timeout: 5_000 });
    socket.on("connect", () => {
      socket.destroy();
      resolve("connected");
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve("timeout");
    });
    socket.on("error", (error: NodeJS.ErrnoException) => resolve(error.code ?? "error"));
  });
}

test("TC-E2E-011: the product reports it is answering and the most recent run outcome, on loopback only", async ({
  page,
  request,
}) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  const mostRecent: { state: string } | null = (await health.json()).most_recent_run;

  await page.goto("/");
  await expect(page.getByTestId("liveness-state")).toHaveText("Answering");
  const outcome = page.getByTestId("run-outcome");
  if (mostRecent === null) {
    await expect(outcome).toHaveText("No run recorded");
  } else {
    await expect(outcome).toHaveAttribute("data-outcome", mostRecent.state);
    await expect(outcome.getByTestId("outcome-badge")).toHaveText(
      RUN_STATE_LABEL[mostRecent.state],
    );
  }

  const external = firstExternalIPv4();
  expect(external, "this host has no non-internal IPv4 address to probe").toBeDefined();
  expect(await connectionError(external as string, 8123)).toBe("ECONNREFUSED");
});
