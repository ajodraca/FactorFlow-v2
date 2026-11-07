import { type Page, expect, test } from "@playwright/test";
import { ACQUISITION_BASE_URL, resetAcquisitionStore } from "./support/acquisition";
import {
  createUniverseViaApi,
  retireInstrument,
  seedScoredStore,
  seedUniverseRecorded,
} from "./support/classification";

/**
 * Maintain a universe over time (flow 6: TC-E2E-011, TC-E2E-012; AC-3, AC-4,
 * AC-5, AC-6, AC-15), through the interface only, against the acquisition
 * stack with a seeded scored set (CAP-002-e2e-tests-automation-tasks T010;
 * DEC-0285).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

/** A date `daysAgo` days back on the America/Chicago calendar, as YYYY-MM-DD. */
function chicagoDate(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
  });
}

function memberRow(page: Page, symbol: string) {
  return page.locator(`tr[data-symbol="${symbol}"]`);
}

test("TC-E2E-011: rename, add, remove, history, members as of a date, and retire", async ({
  page,
}) => {
  // Implements TC-E2E-011
  seedScoredStore(["AAA", "BBB", "CCC", "DDD"].map((symbol) => ({ symbol })));
  const universeId = seedUniverseRecorded("Core", ["AAA", "BBB", "CCC"], 5);
  const detail = `/research/universes/${universeId}`;

  await page.goto(detail);
  await expect(page.locator("tr[data-symbol]")).toHaveCount(3);

  // Rename Core to "Core 2": the header shows it at once.
  await page.getByRole("heading", { level: 1 }).getByRole("button", { name: "Core" }).click();
  await page.getByRole("textbox", { name: "Universe name" }).fill("Core 2");
  await page.getByRole("button", { name: "Rename" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Core 2" })).toBeVisible();

  // Add one stock: it is listed at once.
  await page.getByRole("button", { name: "Add stocks…" }).click();
  const addDialog = page.getByRole("dialog", { name: "Add stocks to Core 2" });
  await addDialog.getByRole("textbox", { name: "Stocks" }).fill("DDD");
  await addDialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(addDialog).toHaveCount(0);
  await expect(memberRow(page, "DDD")).toBeVisible();
  await expect(page.locator("tr[data-symbol]")).toHaveCount(4);

  // Remove another: it leaves the list at once.
  await page.getByRole("button", { name: "Remove AAA from Core 2" }).click();
  const removeDialog = page.getByRole("dialog", { name: "Remove AAA from Core 2" });
  await removeDialog.getByRole("button", { name: "Remove from universe" }).click();
  await expect(memberRow(page, "AAA")).toHaveCount(0);
  await expect(page.locator("tr[data-symbol]")).toHaveCount(3);

  // History lists every event, newest first; the rename shows both names.
  await page.getByRole("tab", { name: "History" }).click();
  const events = page.getByRole("tabpanel").locator("tbody tr");
  await expect(events).toHaveCount(7);
  await expect(events.nth(0)).toContainText("Stock removed");
  await expect(events.nth(0)).toContainText("AAA");
  await expect(events.nth(1)).toContainText("Stock added");
  await expect(events.nth(1)).toContainText("DDD");
  await expect(events.nth(2)).toContainText("Renamed");
  await expect(events.nth(2)).toContainText("Core → Core 2");
  await expect(events.nth(6)).toContainText("Created");

  // Members as of an earlier date (before today's changes) are AAA, BBB and CCC.
  await page.getByRole("tab", { name: "Members" }).click();
  const earlier = chicagoDate(3);
  const asOf = page.getByRole("textbox", { name: "Members as of" });
  await asOf.fill(earlier);
  await asOf.press("Enter");
  await expect(page.getByText(`Members as of ${earlier}.`)).toBeVisible();
  for (const symbol of ["AAA", "BBB", "CCC"]) {
    await expect(page.getByRole("rowheader", { name: symbol })).toBeVisible();
  }
  await expect(page.getByRole("rowheader", { name: "DDD" })).toHaveCount(0);
  await page.getByRole("button", { name: "Show current members" }).click();
  await expect(page.locator("tr[data-symbol]")).toHaveCount(3);

  // Retire the universe: Retired in the header, gone from the active list, still readable.
  await page.getByRole("button", { name: "Retire…" }).click();
  await page
    .getByRole("dialog", { name: "Retire Core 2" })
    .getByRole("button", { name: "Retire universe" })
    .click();
  const header = page.locator('section[data-variant="summary"]');
  await expect(header).toContainText("This universe is retired.");
  await expect(header.getByText("Retired", { exact: true })).toBeVisible();

  await page.goto("/research/universes");
  await expect(page.getByText("No active universes.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Core 2", exact: true })).toHaveCount(0);

  await page.goto(detail);
  await expect(page.locator("tr[data-symbol]")).toHaveCount(3);
  await page.getByRole("tab", { name: "History" }).click();
  await expect(page.getByRole("tabpanel").locator("tbody tr")).toHaveCount(8);
});

test("TC-E2E-012: removing the last member is refused and the universe is retired instead", async ({
  page,
  request,
}) => {
  // Implements TC-E2E-012
  seedScoredStore([{ symbol: "RRR", retiredCells: true }]);
  const universeId = await createUniverseViaApi(request, "Core", ["RRR"]);
  await retireInstrument(request, "RRR");

  await page.goto(`/research/universes/${universeId}`);
  const row = memberRow(page, "RRR");
  await expect(row).toBeVisible();

  // Remove is blocked, with Retire… beside it, and the member stays.
  const remove = row.getByRole("button", { name: "Remove RRR from Core" });
  await expect(remove).toHaveAttribute("aria-disabled", "true");
  await expect(row).toContainText("This is the last member. Retire the universe instead.");
  // aria-disabled, not disabled: force the click past Playwright's enabled check.
  await remove.click({ force: true });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(row).toBeVisible();

  // Retire instead; the stock reads Not followed on every factor.
  await expect(row.getByTestId("factor-cell")).toHaveText([
    "Not followed",
    "Not followed",
    "Not followed",
  ]);
  await row.getByRole("button", { name: "Retire…" }).click();
  await page
    .getByRole("dialog", { name: "Retire Core" })
    .getByRole("button", { name: "Retire universe" })
    .click();
  await expect(page.locator('section[data-variant="summary"]')).toContainText(
    "This universe is retired.",
  );
  await expect(row.getByTestId("factor-cell")).toHaveText([
    "Not followed",
    "Not followed",
    "Not followed",
  ]);

  // History still lists the stock as a member.
  await page.getByRole("tab", { name: "History" }).click();
  const history = page.getByRole("tabpanel");
  await expect(history.getByRole("link", { name: "RRR" })).toBeVisible();
  await expect(history).toContainText("Stock added");
});
