import { type APIRequestContext, type Page, expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  resetAcquisitionStore,
  setProviderMode,
  startRun,
  stateHistoryDepth,
  waitForRunState,
} from "./support/acquisition";
import { sql } from "./support/database";
import { currentSetId, skipUnlessLineItemsResolved, waitForNewSet } from "./support/classification";

/**
 * Fix insufficient evidence (flow 5: TC-E2E-009, TC-E2E-010; AC-12, AC-13,
 * AC-17, AC-18, AC-20, AC-23), through the interface only, against a real
 * acquisition run and build on the acquisition stack
 * (CAP-002-e2e-tests-automation-tasks T009).
 *
 * Both tests are guarded (DEC-0285): while a statement payload key is
 * unresolved (system design section 8 question 1) a build cannot score value
 * or growth, so they skip with that reason and run unchanged once it is
 * resolved. The stub must then serve those keys; that is a further stub task.
 */
test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

/** Thirty followed stocks, enough for every factor to rank: `symbol` plus 29 fillers. */
function followThirty(symbol: string): void {
  const symbols = [
    symbol,
    ...Array.from({ length: 29 }, (_, i) => `F${String(i).padStart(2, "0")}`),
  ];
  sql(
    `INSERT INTO instrument (symbol, lifecycle) VALUES ${symbols.map((s) => `('${s}', 'active')`).join(", ")}`,
    "factorflow_acquisition",
  );
}

/** Starts a run, waits for it to end with data (succeeded or partial), and for its new set. */
async function runAndWait(
  page: Page,
  request: APIRequestContext,
  previousSetId: string | null,
): Promise<string> {
  const runId = await startRun(page);
  await waitForRunState(request, runId, ["succeeded", "partial"], 90_000);
  return waitForNewSet(request, previousSetId);
}

function growthCard(page: Page) {
  return page.getByRole("region", { name: "Growth" });
}

test("TC-E2E-009: a missing fundamental is fixed by the next run and the earlier result stays in history", async ({
  page,
  request,
}) => {
  // Implements TC-E2E-009
  skipUnlessLineItemsResolved(test);
  test.setTimeout(180_000);
  followThirty("BBB");
  await stateHistoryDepth(page, 1);

  // A partial run: the provider holds no fundamentals, so growth cannot be scored.
  await setProviderMode("no-fundamentals");
  const first = await runAndWait(page, request, await currentSetId(request));
  await page.goto("/research/stocks/BBB");
  await expect(growthCard(page)).toContainText(/growth for BBB couldn't be scored/i);
  await expect(growthCard(page)).toContainText(
    "The next Complete or Partial download will try again.",
  );
  await expect(growthCard(page).getByRole("link", { name: "Data health" })).toBeVisible();

  // The data completes on the next run; growth then shows a score and percentile.
  await setProviderMode("ok");
  await runAndWait(page, request, first);
  await page.goto("/research/stocks/BBB");
  await expect(growthCard(page).getByTestId("factor-percentile")).toBeVisible();
  await expect(growthCard(page).getByTestId("card-score")).toBeVisible();

  // Earlier scores lists the earlier Incomplete result with its original date.
  await page.getByRole("tab", { name: "Earlier scores" }).click();
  const earlier = page.getByRole("table", { name: "Earlier scores for BBB" });
  await expect(earlier).toBeVisible();
  await expect(earlier).toContainText("Incomplete");
  await expect(earlier.locator("tbody tr").first().locator("th")).toHaveText(/\d{4}-\d{2}-\d{2}/);
});

test("TC-E2E-010: a stock the provider holds no fundamentals for stays not classified on growth", async ({
  page,
  request,
}) => {
  // Implements TC-E2E-010
  skipUnlessLineItemsResolved(test);
  test.setTimeout(180_000);
  followThirty("NOFCCC");
  await stateHistoryDepth(page, 1);

  const first = await runAndWait(page, request, await currentSetId(request));
  await page.goto("/research/stocks/NOFCCC");
  await expect(growthCard(page)).toContainText("the provider reports no");
  await expect(growthCard(page)).toContainText("No action in FactorFlow changes this.");
  await expect(growthCard(page).getByRole("link", { name: "Data health" })).toHaveCount(0);

  await runAndWait(page, request, first);
  await page.goto("/research/stocks/NOFCCC");
  await expect(growthCard(page).getByTestId("factor-cell")).toHaveText(/Incomplete/);
  await expect(growthCard(page)).toContainText("the provider reports no");
  await expect(growthCard(page)).toContainText("No action in FactorFlow changes this.");
});
