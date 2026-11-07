import { type Page, expect, test } from "@playwright/test";
import { ACQUISITION_BASE_URL, resetAcquisitionStore } from "./support/acquisition";
import {
  type StockSeed,
  createUniverseViaApi,
  fillerStocks,
  retireInstrument,
  seedScoredStore,
} from "./support/classification";

/**
 * Sort, narrow, compare and inspect evidence (flow 4: TC-E2E-007, TC-E2E-008;
 * AC-9, AC-12, AC-14, AC-15, AC-16, AC-17), through the interface only,
 * against the acquisition stack with a seeded scored set
 * (CAP-002-e2e-tests-automation-tasks T008; DEC-0285).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

function stock(symbol: string, momentum: number, growth: number): StockSeed {
  return {
    symbol,
    value: { score: 0.2, percentile: 55 },
    growth: { score: (growth - 50) / 25, percentile: growth },
    momentum: { score: (momentum - 50) / 25, percentile: momentum },
  };
}

async function lookIn(page: Page, option: string): Promise<void> {
  await page.getByRole("combobox", { name: /^Look in/ }).selectOption({ label: option });
}

async function rowSymbols(page: Page): Promise<string[]> {
  return page
    .locator("tr[data-symbol]")
    .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-symbol") as string));
}

test("TC-E2E-007: sorting, narrowing, comparing three stocks and opening evidence", async ({
  page,
  request,
}) => {
  // Implements TC-E2E-007
  seedScoredStore([
    // Momentum is not monotone in symbol order, so the default order cannot pass for the sort.
    stock("AAA", 50, 80),
    stock("BBB", 70, 30),
    stock("CCC", 90, 60),
    stock("DDD", 10, 90),
    stock("EEE", 30, 50),
    stock("FFF", 99, 99),
    ...fillerStocks(),
  ]);
  await createUniverseViaApi(request, "Core", ["AAA", "BBB", "CCC", "DDD", "EEE"]);

  // Open the universe in Research, sort by momentum percentile and set a growth threshold.
  await page.goto("/research");
  await lookIn(page, "Core");
  await expect(page.locator("tr[data-symbol]")).toHaveCount(5);
  await page.getByRole("button", { name: "Sort by momentum percentile" }).click();
  await expect(page.getByRole("columnheader", { name: /Momentum/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  const growth = page.getByRole("textbox", { name: "Value threshold for growth", exact: true });
  await growth.fill("50");
  await growth.press("Enter");

  // Growth percentile of at least 50 keeps AAA, CCC, DDD and EEE; FFF is outside the universe.
  await expect(page.getByRole("heading", { level: 1, name: "4 stocks match" })).toBeVisible();
  await expect(page.locator("tr[data-symbol]")).toHaveCount(4);
  // The sort control's first choice is ascending: DDD 10, EEE 30, AAA 50, CCC 90. The default
  // order is by symbol (AAA, CCC, DDD, EEE), so only a working sort reaches this one.
  await expect.poll(() => rowSymbols(page)).toEqual(["DDD", "EEE", "AAA", "CCC"]);
  const symbols = await rowSymbols(page);
  // Check three stocks and compare them side by side.
  const picked = symbols.slice(0, 3);
  for (const symbol of picked) {
    await page.getByRole("checkbox", { name: `Select ${symbol}` }).check();
  }
  await page.getByRole("link", { name: "Compare side by side" }).click();
  await expect(page).toHaveURL(/\/research\/compare\?symbols=/);
  const table = page.getByRole("table", { name: "Comparison of 3 stocks" });
  await expect(table).toBeVisible();
  for (const symbol of picked) {
    await expect(table.getByRole("columnheader", { name: new RegExp(symbol) })).toBeVisible();
  }
  // Value, growth and momentum for all three stocks: nine scored cells.
  await expect(table.getByTestId("factor-percentile")).toHaveCount(9);

  // The evidence page lists every input with its value and the date each was known.
  await page.goto(`/research/stocks/${picked[0]}`);
  await expect(page.getByTestId("input-value")).toHaveCount(8);
  await expect(page.getByText("Known on", { exact: true })).toHaveCount(8);
  await expect(page.getByText("As of", { exact: true })).toHaveCount(8);
});

test("TC-E2E-008: comparing an incomplete and a no-longer-followed stock keeps all three columns", async ({
  page,
  request,
}) => {
  // Implements TC-E2E-008
  seedScoredStore([
    stock("AAA", 80, 80),
    {
      ...stock("BBB", 60, 60),
      growth: {
        reason: "input_missing",
        input: "revenue_growth",
        detail: "revenue growth missing",
      },
    },
    { symbol: "RRR", retiredCells: true },
    ...fillerStocks(),
  ]);
  await createUniverseViaApi(request, "Core", ["AAA", "BBB", "RRR"]);
  await retireInstrument(request, "RRR");

  await page.goto("/research");
  await lookIn(page, "Core");
  await expect(page.locator("tr[data-symbol]")).toHaveCount(3);
  for (const symbol of ["AAA", "BBB", "RRR"]) {
    await page.getByRole("checkbox", { name: `Select ${symbol}` }).check();
  }
  await page.getByRole("link", { name: "Compare side by side" }).click();

  const table = page.getByRole("table", { name: "Comparison of 3 stocks" });
  await expect(table).toBeVisible();
  for (const symbol of ["AAA", "BBB", "RRR"]) {
    await expect(table.getByRole("columnheader", { name: new RegExp(symbol) })).toBeVisible();
  }
  // Cells run factor by factor (value, growth, momentum), columns AAA, BBB, RRR in each.
  const cells = table.getByTestId("factor-cell");
  await expect(cells).toHaveCount(9);
  const growthOfBbb = cells.nth(4);
  await expect(growthOfBbb).toHaveText(/Incomplete/);
  await expect(growthOfBbb).toHaveAttribute("title", /revenue growth missing/);
  for (const index of [2, 5, 8]) {
    await expect(cells.nth(index)).toHaveText("Not followed");
  }
  // No value for either: only AAA's three cells and BBB's value and momentum cells carry a percentile.
  await expect(table.getByTestId("factor-percentile")).toHaveCount(5);
});
