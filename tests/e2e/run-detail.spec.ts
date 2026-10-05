import { type Page, expect, test } from "@playwright/test";
import { sql } from "./support/database";

/**
 * Open a partial run and expand an instrument to its data types, against
 * the real API and PostgreSQL (CAP-001-E7-S4 Testing: "expanding an
 * instrument to its data types"; AC-10, AC-11, DAC-E7-9, DAC-E7-2,
 * DAC-E7-S4-2, DAC-E7-S4-7). The e2e server starts no runner, so the run and
 * its result rows are seeded directly.
 */
const FAILED_REASON =
  "[failed] symbol=DIAGA data_type=prices request_id=req-e2e-1: upstream returned 503";

function instrumentId(symbol: string): string {
  return sql(`SELECT instrument_id FROM instrument WHERE symbol = '${symbol}'`);
}

function seedPartialRun(): string {
  const runId = sql(
    "WITH seeded AS (INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at, instruments_named) VALUES ('partial', 1, now() - interval '5 minutes', now(), 2) RETURNING run_id) SELECT run_id FROM seeded",
  );
  const diaga = instrumentId("DIAGA");
  const diagz = instrumentId("DIAGZ");
  sql(
    `INSERT INTO run_instrument_result (run_id, instrument_id, data_type, outcome, reason) VALUES
      ('${runId}', ${diaga}, 'prices', 'failed', '${FAILED_REASON}'),
      ('${runId}', ${diaga}, 'reference', 'written', NULL),
      ('${runId}', ${diaga}, 'fundamentals', 'written', NULL),
      ('${runId}', ${diaga}, 'corporate_actions', 'written', NULL),
      ('${runId}', ${diagz}, 'reference', 'not_found', NULL),
      ('${runId}', ${diagz}, 'prices', 'not_found', NULL),
      ('${runId}', ${diagz}, 'fundamentals', 'not_found', NULL),
      ('${runId}', ${diagz}, 'corporate_actions', 'not_found', NULL)`,
  );
  return runId;
}

function expander(page: Page, symbol: string) {
  return page.getByRole("button", { name: new RegExp(`data types for ${symbol}$`) });
}

async function groupOf(page: Page, symbol: string) {
  const id = await expander(page, symbol).getAttribute("aria-controls");
  return page.locator(`[id="${id}"]`);
}

const DATA_TYPES = ["Reference", "Prices", "Fundamentals", "Corporate actions"];

test("a partial run expands an instrument to its data types and filters by outcome", async ({
  page,
  request,
}) => {
  const added = await request.post("/api/instruments", { data: { symbols: ["DIAGA", "DIAGZ"] } });
  expect([201, 409]).toContain(added.status());
  const runId = seedPartialRun();

  await page.goto(`/runs/${runId}`);
  await expect(page.getByRole("button", { name: /^Show data types for / })).toHaveCount(2);
  for (const name of DATA_TYPES) {
    await expect(page.getByRole("rowheader", { name, exact: true })).toHaveCount(0);
  }

  await expander(page, "DIAGA").click();
  const diaga = await groupOf(page, "DIAGA");
  for (const name of DATA_TYPES) {
    await expect(diaga.getByRole("rowheader", { name, exact: true })).toHaveCount(1);
  }
  await expect(
    diaga.getByText(`Acquiring prices for DIAGA failed: ${FAILED_REASON}`),
  ).toBeVisible();
  await expect(diaga).toContainText("req-e2e-1");
  const failedBadge = diaga
    .locator("tr", { has: page.getByRole("rowheader", { name: "Prices", exact: true }) })
    .getByTestId("result-outcome-badge");
  await expect(failedBadge).toHaveText("Failed");
  await expect(failedBadge).toHaveAttribute("data-variant", "status-critical");

  await expander(page, "DIAGZ").click();
  const diagz = await groupOf(page, "DIAGZ");
  const notFound = diagz.getByTestId("result-outcome-badge").filter({ hasText: "Not found" });
  await expect(notFound).toHaveCount(5);
  for (const badge of await notFound.all()) {
    await expect(badge).toHaveAttribute("data-variant", "status-warning");
  }

  await expect(page.getByRole("button", { name: "Re-run acquisition" })).toBeVisible();

  await page.getByRole("combobox", { name: "Outcome" }).selectOption({ label: "Not found" });
  await expect(page.getByRole("button", { name: /data types for DIAGA$/ })).toHaveCount(0);
  await expect(expander(page, "DIAGZ")).toHaveCount(1);
});
