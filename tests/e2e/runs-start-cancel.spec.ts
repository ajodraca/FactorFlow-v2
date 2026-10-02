import { expect, test } from "@playwright/test";

/**
 * Start a run from Runs, then cancel it and watch the poll pick that up
 * (CAP-001-E5-S6 Testing: "`@playwright/test` for start-then-cancel"; AC-9,
 * DAC-E5-S6-1, DAC-E5-S6-4). Runs against the real API and PostgreSQL
 * (`playwright.config.ts`'s `webServer`).
 *
 * The e2e server launches no runner process, so a started run stays
 * `requested` and nothing is ever queued behind it: Start routes straight
 * to the run's detail. Cancellation in the interface lives on Run detail
 * (CAP-001-E7-S4), so it is driven through the API here.
 */
test("a run started from Runs shows as requested, and its cancellation appears within one poll", async ({
  page,
  request,
}) => {
  const depth = await request.put("/api/settings/history-depth", { data: { years: 1 } });
  expect(depth.ok()).toBe(true);
  const instruments = await request.post("/api/instruments", { data: { symbols: ["MSFT"] } });
  expect([201, 409]).toContain(instruments.status());

  await page.goto("/runs");
  await page.getByRole("button", { name: "Start acquisition run" }).click();

  await expect(page).toHaveURL(/\/runs\/[0-9a-f-]{36}$/);
  const runId = new URL(page.url()).pathname.split("/").pop() as string;

  await page.goto("/runs");
  const link = page.getByRole("link", { name: runId });
  await expect(link).toHaveAttribute("href", `/runs/${runId}`);
  const row = page.locator("tr", { has: link });
  await expect(row.getByTestId("outcome-badge")).toHaveText(/Requested/);

  const cancel = await request.post(`/api/acquisition-runs/${runId}/cancel`);
  expect(cancel.status()).toBe(202);
  expect(await cancel.json()).toEqual({ state: "cancelled" });

  await expect(row.getByTestId("outcome-badge")).toHaveText(/Cancelled/, { timeout: 15_000 });
});
