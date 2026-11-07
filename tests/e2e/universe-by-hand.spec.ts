import { type Page, expect, test } from "@playwright/test";
import { ACQUISITION_BASE_URL, resetAcquisitionStore } from "./support/acquisition";
import { fillerStocks, seedScoredStore } from "./support/classification";

/**
 * Build a universe by hand (flow 2: TC-E2E-003, TC-E2E-004; AC-1, AC-3, AC-5,
 * AC-15), through the interface only, against the acquisition stack with a
 * seeded scored set (CAP-002-e2e-tests-automation-tasks T006; DEC-0285).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

const STOCKS = [
  { symbol: "AAA", value: { score: 1.2, percentile: 91 }, growth: { score: 0.4, percentile: 62 } },
  {
    symbol: "BBB",
    value: { score: -0.3, percentile: 38 },
    momentum: { score: 0.9, percentile: 80 },
  },
  {
    symbol: "CCC",
    growth: { score: -1.1, percentile: 12 },
    momentum: { score: 0.1, percentile: 55 },
  },
  { symbol: "DDD", value: { score: 0.7, percentile: 74 } },
];

/** The whole-number percentiles one stock's row prints, in value, growth, momentum order. */
async function percentiles(page: Page, symbol: string): Promise<string[]> {
  return page
    .locator(`tr[data-symbol="${symbol}"]`)
    .getByTestId("factor-percentile")
    .allInnerTexts();
}

async function openNewUniverse(page: Page): Promise<void> {
  await page.goto("/research/universes");
  await page.getByRole("button", { name: "New universe…" }).click();
  await expect(page.getByRole("dialog", { name: "New universe" })).toBeVisible();
}

test("TC-E2E-003: a universe built by hand lists its three members with their scores", async ({
  page,
}) => {
  // Implements TC-E2E-003
  seedScoredStore([...STOCKS, ...fillerStocks()]);

  await page.goto("/research");
  await expect(page.getByRole("heading", { level: 1, name: "34 stocks match" })).toBeVisible();
  const expected = new Map<string, string[]>();
  for (const symbol of ["AAA", "BBB", "CCC"]) {
    expected.set(symbol, await percentiles(page, symbol));
  }

  await openNewUniverse(page);
  const dialog = page.getByRole("dialog", { name: "New universe" });
  await dialog.getByRole("textbox", { name: "Name" }).fill("Core");
  await dialog.getByRole("textbox", { name: "Stocks to include" }).fill("AAA, BBB, CCC");
  await dialog.getByRole("button", { name: "Create" }).click();

  // The app opens the new universe with its three members and their scores.
  await expect(page).toHaveURL(/\/research\/universes\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name: "Core" })).toBeVisible();
  const members = page.locator("tr[data-symbol]");
  await expect(members).toHaveCount(3);
  await expect(page.locator('tr[data-symbol="DDD"]')).toHaveCount(0);
  for (const [symbol, scores] of expected) {
    expect(await percentiles(page, symbol)).toEqual(scores);
  }

  // It is listed among the active universes.
  await page.goto("/research/universes");
  await expect(page.getByRole("link", { name: "Core", exact: true })).toBeVisible();

  // Research scoped to Core shows the same three stocks with the same scores.
  await page.goto("/research");
  await page.getByRole("combobox", { name: /^Look in/ }).selectOption({ label: "Core" });
  await expect(page.locator("tr[data-symbol]")).toHaveCount(3);
  for (const [symbol, scores] of expected) {
    expect(await percentiles(page, symbol)).toEqual(scores);
  }
});

test("TC-E2E-004: adding a stock that is not followed keeps the dialog open and creates nothing", async ({
  page,
}) => {
  // Implements TC-E2E-004
  seedScoredStore(STOCKS);

  await openNewUniverse(page);
  const dialog = page.getByRole("dialog", { name: "New universe" });
  await dialog.getByRole("textbox", { name: "Name" }).fill("Core");
  const stocks = dialog.getByRole("textbox", { name: "Stocks to include" });
  await stocks.fill("AAA, ZZZ");
  await dialog.getByRole("button", { name: "Create" }).click();

  // The dialog stays open with the list kept; ZZZ is named with a link to followed stocks.
  await expect(dialog).toBeVisible();
  const alert = dialog.getByRole("alert");
  await expect(alert).toContainText("ZZZ");
  await expect(alert).toContainText("doesn't follow");
  await expect(alert.getByRole("link", { name: "Follow them on Data health" })).toHaveAttribute(
    "href",
    "/instruments",
  );
  await expect(stocks).toHaveValue(/AAA/);
  await expect(stocks).toHaveValue(/ZZZ/);

  // No universe named Core appears in the list.
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);
  await page.goto("/research/universes");
  await expect(page.getByText(/No universes yet/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Core", exact: true })).toHaveCount(0);
});
