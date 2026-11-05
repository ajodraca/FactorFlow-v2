import { type APIRequestContext, type Page, expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  resetAcquisitionStore,
  restoreSymbol,
  startRun,
  stateHistoryDepth,
  waitForRunState,
  withholdSymbol,
} from "./support/acquisition";
import {
  currentSetId,
  followStocks,
  followerSymbols,
  waitForNewSet,
} from "./support/classification";

/**
 * Fix insufficient evidence (flow 5: TC-E2E-009, TC-E2E-010; AC-12, AC-13,
 * AC-17, AC-18, AC-20, AC-23), through the interface only, against a real
 * acquisition run and build on the acquisition stack
 * (CAP-002-e2e-tests-automation-tasks T009).
 *
 * The acquisition stack's API installs test statement payload keys and the stub
 * serves statements carrying them (AR-001; DEC-0290), so both tests run; none
 * waits on the owner's payload-key answer (system design section 8 question 1).
 * BBB's fundamentals fail at the provider (a Partial run) and are then restored;
 * NOFCCC's are not found (the provider holds none).
 */
const HISTORY_YEARS = 3;

test.use({ baseURL: ACQUISITION_BASE_URL });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

/**
 * `symbol` plus thirty fillers: with `symbol` unscored on growth the other thirty still
 * reach the peer-set floor of 30, so growth ranks for them.
 */
function followWithThirtyOthers(symbol: string): void {
  followStocks([symbol, ...followerSymbols(30)]);
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
  test.setTimeout(240_000);
  followWithThirtyOthers("BBB");
  await stateHistoryDepth(page, HISTORY_YEARS);

  // A partial run: BBB's statements fail at the provider, so growth cannot be scored.
  await withholdSymbol("BBB");
  const first = await runAndWait(page, request, await currentSetId(request));
  await page.goto("/research/stocks/BBB");
  // Names the missing input and the rule, then how to recover.
  await expect(growthCard(page)).toContainText(
    "Growth for BBB couldn't be scored: revenue growth is missing.",
  );
  await expect(growthCard(page)).toContainText(
    "The next Complete or Partial download will try again.",
  );
  await expect(growthCard(page).getByRole("link", { name: "Data health" })).toBeVisible();

  // The data completes on the next run; growth then shows a score and percentile.
  await restoreSymbol("BBB");
  const second = await runAndWait(page, request, first);
  await page.goto("/research/stocks/BBB");
  await expect(growthCard(page).getByTestId("factor-percentile")).toBeVisible();
  await expect(growthCard(page).getByTestId("card-score")).toBeVisible();

  // Earlier scores lists the earlier Incomplete result with its original date.
  await page.getByRole("tab", { name: "Earlier scores" }).click();
  const earlier = page.getByRole("table", { name: "Earlier scores for BBB" });
  const rows = earlier.locator("tbody tr");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Incomplete");
  await expect(rows.first().locator("th")).toHaveText(/^\d{4}-\d{2}-\d{2}$/);

  // With one more run the list holds two results, newest first: the classified one above the
  // Incomplete one, by the date of each set and the time it was produced.
  const third = await runAndWait(page, request, second);
  expect(third).not.toBe(second);
  await page.goto("/research/stocks/BBB");
  await page.getByRole("tab", { name: "Earlier scores" }).click();
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).not.toContainText("Incomplete");
  await expect(rows.nth(0).getByTestId("factor-percentile").first()).toBeVisible();
  await expect(rows.nth(1)).toContainText("Incomplete");
  const dates = await rows.locator("th").allInnerTexts();
  const produced = (await rows.locator("td:nth-child(2)").allInnerTexts()).map(
    (text) => text.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} C[SD]T/)?.[0] ?? "",
  );
  for (const date of dates) {
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
  expect(produced.every((time) => time !== "")).toBe(true);
  expect(dates[0] >= dates[1]).toBe(true);
  expect(produced[0] >= produced[1]).toBe(true);
});

test("TC-E2E-010: a stock the provider holds no fundamentals for stays not classified on growth", async ({
  page,
  request,
}) => {
  // Implements TC-E2E-010
  test.setTimeout(180_000);
  followWithThirtyOthers("NOFCCC");
  await stateHistoryDepth(page, HISTORY_YEARS);

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
