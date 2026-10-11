import { type Page, expect, test } from "@playwright/test";
import { sql } from "./support/database";

/**
 * Cancel a run from its detail screen, against the real API and PostgreSQL
 * (owner-web-app section 7, "Cancel a run"; CAP-001-E7-S4 Testing:
 * "open-run-then-cancel"; AC-19, AC-26, DAC-E7-S4-3; TC-E2E-008, cancellation
 * races completed run).
 *
 * The e2e server starts no runner, so a running run is seeded directly. The
 * cleanup below frees the single-active-run slot after every test, so the
 * later runs-start-cancel.spec.ts still navigates on start.
 */
test.describe.configure({ mode: "serial" });

test.afterEach(() => {
  sql(
    "UPDATE acquisition_run SET state = 'cancelled', ended_at = now(), claimed_by = NULL, heartbeat_at = NULL WHERE state IN ('running', 'cancelling')",
  );
});

function seedRunningRun(): string {
  return sql(
    "WITH seeded AS (INSERT INTO acquisition_run (state, history_depth_years, started_at, claimed_by, heartbeat_at) VALUES ('running', 1, now(), 'e2e-seed', now()) RETURNING run_id) SELECT run_id FROM seeded",
  );
}

function summaryBadge(page: Page) {
  return page.locator('section[data-variant="summary"]').getByTestId("outcome-badge");
}

test("a queued run cancels at once with its own copy and no started time (AC-26)", async ({
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

  await page.getByRole("button", { name: "Cancel run" }).click();
  await expect(page.getByRole("dialog").getByRole("heading")).toHaveText("Cancel this queued run?");
  await page.getByRole("button", { name: "Cancel queued run" }).click();

  await expect(summaryBadge(page)).toHaveText("Cancelled");
  const started = page.locator('section[data-variant="summary"] dt', { hasText: "Started" });
  await expect(started.locator("xpath=following-sibling::dd[1]")).toContainText("Not recorded");
  await expect(page.getByText("Cancelling")).toHaveCount(0);
});

test("a running run shows cancelling, withdraws the action, and stays cancelling (AC-19)", async ({
  page,
}) => {
  const runId = seedRunningRun();
  await page.goto(`/runs/${runId}`);

  await page.getByRole("button", { name: "Cancel run" }).click();
  await page.getByRole("button", { name: "Stop run" }).click();

  await expect(summaryBadge(page)).toHaveText("Cancelling");
  // Scoped to the screen: the status region carries its own last-run badge.
  await expect(page.getByRole("main").getByTestId("outcome-badge")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Cancel run" })).toHaveCount(0);

  const polled = page.waitForResponse(
    (response) => response.url().includes(`/api/acquisition-runs/${runId}`),
    { timeout: 15_000 },
  );
  await polled;
  await expect(summaryBadge(page)).toHaveText("Cancelling");
});

test("TC-E2E-008: a cancel that races completion says the run had already completed (DAC-E7-S4-3)", async ({
  page,
}) => {
  const runId = seedRunningRun();
  await page.goto(`/runs/${runId}`);
  await page.getByRole("button", { name: "Cancel run" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  sql(
    `UPDATE acquisition_run SET state = 'succeeded', ended_at = now(), claimed_by = NULL, heartbeat_at = NULL WHERE run_id = '${runId}'`,
  );
  await page.getByRole("button", { name: "Stop run" }).click();

  await expect(page.getByText("This run had already completed.")).toBeVisible();
  // The summary's badge and, per DEC-0018, the control's actual outcome.
  await expect(summaryBadge(page)).toHaveText(["Succeeded", "Succeeded"]);
  await expect(page.getByText("Cancelling")).toHaveCount(0);
  await expect(page.getByText("Cancelled")).toHaveCount(0);
});
