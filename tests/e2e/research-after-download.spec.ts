import { expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  addInstruments,
  resetAcquisitionStore,
  startRun,
  stateHistoryDepth,
  summaryOutcome,
} from "./support/acquisition";
import { followStocks, followerSymbols } from "./support/classification";

/**
 * Stocks are classified after an acquisition run (flow 1: TC-E2E-001,
 * TC-E2E-002; AC-9, AC-10, AC-12, AC-13, AC-14, AC-15, AC-20, AC-21, AC-22),
 * through the interface only, against a real run and build on the acquisition
 * stack (CAP-002-e2e-tests-automation-tasks T005).
 *
 * The acquisition stack's API installs test statement payload keys and the stub
 * serves statements carrying them (AR-001; DEC-0290), so every test here runs;
 * none waits on the owner's payload-key answer (system design section 8
 * question 1).
 */
/**
 * Enough history for eight quarterly statements (growth) and thirteen months of
 * prices (12-month momentum), so a real build scores all three factors.
 */
const HISTORY_YEARS = 3;

test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

test("TC-E2E-002: before any run, Research says nothing has been scored and shows no table", async ({
  page,
}) => {
  // Implements TC-E2E-002 (before the run)
  await addInstruments(page, followerSymbols(20));

  await page.goto("/research");
  await expect(page.getByText("No stocks have been scored yet.")).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("TC-E2E-002: after a run with 20 stocks, every factor cell reads Not enough to rank", async ({
  page,
}) => {
  // Implements TC-E2E-002 (after the run)
  test.setTimeout(120_000);
  followStocks(followerSymbols(20));
  await stateHistoryDepth(page, HISTORY_YEARS);

  await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 60_000 });

  await page.goto("/research");
  const rows = page.locator("tr[data-symbol]");
  await expect(rows).toHaveCount(20);
  await expect(rows.getByTestId("factor-cell")).toHaveCount(60);
  for (const text of await rows.getByTestId("factor-cell").allInnerTexts()) {
    expect(text).toBe("Not enough to rank");
  }
  await expect(page.getByTestId("factor-percentile")).toHaveCount(0);
  for (const factor of ["Value", "Growth", "Momentum"]) {
    await expect(page.getByRole("columnheader", { name: new RegExp(factor) })).toContainText(
      /\d+ qualified, 30 needed/,
    );
  }
});

test("TC-E2E-001: a succeeded run leaves every stock scored on Research without any further action", async ({
  page,
}) => {
  // Implements TC-E2E-001
  test.setTimeout(120_000);
  followStocks([...followerSymbols(30), "GAPAAA"]);
  await stateHistoryDepth(page, HISTORY_YEARS);

  const runId = await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 60_000 });

  // Open Research without acting in between: every stock shows a whole-number percentile
  // (0 to 100) for each of the three factors, and the percentiles are not all alike.
  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1, name: "31 stocks match" })).toBeVisible();
  // The table draws a window of the rows, so every drawn row is read, not a fixed count.
  const scored = page.locator("tr[data-symbol]").filter({ hasNotText: "GAPAAA" });
  expect(await scored.count()).toBeGreaterThan(0);
  for (const row of await scored.all()) {
    const percentiles = await row.getByTestId("factor-percentile").allInnerTexts();
    expect(percentiles).toHaveLength(3);
    for (const percentile of percentiles) {
      expect(percentile).toMatch(/^(100|\d{1,2})$/);
    }
  }
  const percentiles = await scored.getByTestId("factor-percentile").allInnerTexts();
  expect(new Set(percentiles).size).toBeGreaterThan(1);

  // The standardised score sits on the evidence page of any listed stock, for all three factors.
  await page.goto("/research/stocks/F00");
  await expect(page.getByTestId("card-score")).toHaveCount(3);
  await page.goBack();

  // The as-of line names the scores' time in America/Chicago and the download, and links to that run.
  await expect(page.getByText(/^Scores from \S+ \S+ C[SD]T/)).toBeVisible();
  const download = page.getByRole("link", { name: /^Open the download started .+ C[SD]T$/ });
  await expect(download).toHaveAttribute("href", `/runs/${runId}`);

  // A stock lacking an input reads Incomplete on the affected factors; its other factor still scores.
  const search = page.getByRole("textbox", { name: "Find a stock" });
  await search.fill("GAPAAA");
  await search.press("Enter");
  const row = page.locator('tr[data-symbol="GAPAAA"]');
  await expect(row).toBeVisible();
  const cells = row.getByTestId("factor-cell");
  await expect(cells.nth(0).getByTestId("factor-percentile")).toBeVisible();
  await expect(cells.nth(1)).toHaveText(/Incomplete/);
  await expect(cells.nth(1)).toHaveAttribute(
    "title",
    /^Incomplete: .*earnings-per-share growth.*, so growth/,
  );
  await expect(cells.nth(2).getByTestId("factor-percentile")).toBeVisible();
});
