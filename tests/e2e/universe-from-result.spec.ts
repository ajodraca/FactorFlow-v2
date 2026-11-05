import { type Page, expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  resetAcquisitionStore,
  startRun,
  stateHistoryDepth,
  waitForRunState,
} from "./support/acquisition";
import { seedScoredStore, spreadStocks, waitForNewSet } from "./support/classification";

/**
 * Save a factor filter as a universe (flow 3: TC-E2E-005, TC-E2E-006; AC-2,
 * AC-5, AC-16), through the interface only, against the acquisition stack with
 * a seeded scored set of 30 stocks (CAP-002-e2e-tests-automation-tasks T007;
 * DEC-0285).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

/** Thirty stocks; the value percentile and momentum score of each are known from `spreadStocks`. */
const STOCKS = spreadStocks(30);

/** How many seeded stocks have a value percentile of at least 70 and a momentum score of at least 0. */
const MATCHING = STOCKS.filter(
  (stock) => (stock.value?.percentile ?? 0) >= 70 && (stock.momentum?.score ?? -1) >= 0,
).length;

async function setValuePercentileAtLeast(page: Page, bound: string): Promise<void> {
  const field = page.getByRole("textbox", { name: "Value threshold", exact: true });
  await field.fill(bound);
  await field.press("Enter");
}

async function setMomentumScoreAtLeast(page: Page, bound: string): Promise<void> {
  await page
    .getByRole("combobox", { name: "Measure for momentum" })
    .selectOption({ label: "standardised score" });
  const field = page.getByRole("textbox", { name: "Value threshold for momentum", exact: true });
  await field.fill(bound);
  await field.press("Enter");
}

test("TC-E2E-005: a factor filter saved as a universe keeps exactly its members after a later run", async ({
  page,
  request,
}) => {
  // Implements TC-E2E-005
  test.setTimeout(120_000);
  expect(MATCHING).toBeGreaterThan(0);
  const seeded = seedScoredStore(STOCKS);

  await page.goto("/research");
  await setValuePercentileAtLeast(page, "70");
  await setMomentumScoreAtLeast(page, "0");
  const heading = page.getByRole("heading", { level: 1, name: `${MATCHING} stocks match` });
  await expect(heading).toBeVisible();
  await expect(page.locator("tr[data-symbol]")).toHaveCount(MATCHING);
  const members = (
    await page
      .locator("tr[data-symbol]")
      .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-symbol")))
  ).sort();

  await page.getByRole("button", { name: `Save these ${MATCHING} as a universe…` }).click();
  const dialog = page.getByRole("dialog", { name: `Save these ${MATCHING} stocks as a universe` });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("value percentile at least 70");
  await expect(dialog).toContainText("momentum standardised score at least 0");
  await dialog.getByRole("textbox", { name: "Name" }).fill("Winners");
  await dialog.getByRole("button", { name: "Save" }).click();

  // A toast links to the new universe, which shows exactly n members and its origin.
  const toast = page.getByRole("link", { name: `Saved ${MATCHING} stocks as Winners` });
  await expect(toast).toBeVisible();
  const universePath = (await toast.getAttribute("href")) as string;
  await toast.click();
  await expect(page).toHaveURL(universePath);
  await expect(page.locator("tr[data-symbol]")).toHaveCount(MATCHING);
  await expect(page.getByText(`Saved from a filter on ${seeded.classificationDate}`)).toBeVisible();
  await expect(page.getByText(/value percentile at least 70/)).toBeVisible();
  await expect(page.getByText(/momentum standardised score at least 0/)).toBeVisible();

  // After the next acquisition run, the universe still has the same members.
  await stateHistoryDepth(page, 1);
  const runId = await startRun(page);
  await waitForRunState(request, runId, ["succeeded", "partial"], 90_000);
  await waitForNewSet(request, seeded.setId);
  await page.goto(universePath);
  await expect(page.locator("tr[data-symbol]")).toHaveCount(MATCHING);
  const after = (
    await page
      .locator("tr[data-symbol]")
      .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-symbol")))
  ).sort();
  expect(after).toEqual(members);
});

test("TC-E2E-006: a filter that matches no stock blocks saving and creates no universe", async ({
  page,
}) => {
  // Implements TC-E2E-006
  seedScoredStore(STOCKS);

  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1, name: "30 stocks match" })).toBeVisible();
  // No stock has a value percentile of at least 100 and a growth percentile of at least 100.
  await setValuePercentileAtLeast(page, "100");
  const growth = page.getByRole("textbox", { name: "Value threshold for growth", exact: true });
  await growth.fill("100");
  await growth.press("Enter");

  await expect(page.getByText("No stocks match these filters.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear filters" }).first()).toBeVisible();
  const save = page.getByRole("button", { name: "Save these 0 as a universe…" });
  await expect(save).toHaveAttribute("aria-disabled", "true");
  await expect(
    page.getByText("No stocks match these filters, so there is nothing to save.", { exact: true }),
  ).toBeVisible();
  await save.click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto("/research/universes");
  await expect(page.getByText(/No universes yet/)).toBeVisible();
});
