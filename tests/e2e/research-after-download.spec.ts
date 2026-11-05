import { expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  addInstruments,
  resetAcquisitionStore,
  startRun,
  stateHistoryDepth,
  summaryOutcome,
} from "./support/acquisition";
import {
  followStocks,
  followerSymbols,
  skipUnlessLineItemsResolved,
} from "./support/classification";

/**
 * Stocks are classified after an acquisition run (flow 1: TC-E2E-001,
 * TC-E2E-002; AC-9, AC-10, AC-12, AC-13, AC-14, AC-15, AC-20, AC-21, AC-22),
 * through the interface only, against a real run and build on the acquisition
 * stack (CAP-002-e2e-tests-automation-tasks T005).
 *
 * TC-E2E-001 and the second half of TC-E2E-002 are guarded (DEC-0285): while a
 * statement payload key is unresolved (system design section 8 question 1) a
 * build cannot score value or growth, so they skip with that reason and run
 * unchanged once it is resolved. The first half of TC-E2E-002 needs no build.
 */
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
  skipUnlessLineItemsResolved(test);
  test.setTimeout(120_000);
  followStocks(followerSymbols(20));
  await stateHistoryDepth(page, 1);

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
  skipUnlessLineItemsResolved(test);
  test.setTimeout(120_000);
  followStocks([...followerSymbols(30), "NOFAAA"]);
  await stateHistoryDepth(page, 1);

  const runId = await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 60_000 });

  // Open Research without acting in between: stocks show a score and a whole-number percentile.
  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1, name: "31 stocks match" })).toBeVisible();
  const first = page.locator('tr[data-symbol="F00"]');
  const percentiles = await first.getByTestId("factor-percentile").allInnerTexts();
  expect(percentiles).toHaveLength(3);
  for (const percentile of percentiles) {
    expect(percentile).toMatch(/^(100|\d{1,2})$/);
  }

  // The as-of line names the scores' time and the download, and links to that run.
  await expect(page.getByText(/^Scores from /)).toBeVisible();
  await expect(page.getByRole("link", { name: /^Open the download started / })).toHaveAttribute(
    "href",
    `/runs/${runId}`,
  );

  // A stock lacking an input reads Incomplete on the affected factors; its other factor still scores.
  const search = page.getByRole("textbox", { name: "Find a stock" });
  await search.fill("NOFAAA");
  await search.press("Enter");
  const row = page.locator('tr[data-symbol="NOFAAA"]');
  await expect(row).toBeVisible();
  const cells = row.getByTestId("factor-cell");
  await expect(cells.nth(0)).toHaveText(/Incomplete/);
  await expect(cells.nth(0)).toHaveAttribute("title", /^Incomplete: .+ can't be compared fairly/);
  await expect(cells.nth(1)).toHaveText(/Incomplete/);
  await expect(cells.nth(2).getByTestId("factor-percentile")).toBeVisible();
});
