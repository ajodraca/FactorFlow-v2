import { expect, test } from "@playwright/test";
import {
  ACQUISITION_BASE_URL,
  COVERAGE_COLUMN,
  addInstruments,
  coverageCell,
  coverageRow,
  expandInstrument,
  resetAcquisitionStore,
  setProviderMode,
  startRun,
  stateHistoryDepth,
  summaryOutcome,
} from "./support/acquisition";

/**
 * A first acquisition that fails is reported with its cause, and a failed
 * acquisition is diagnosed and recovered (TC-E2E-002, TC-E2E-005; AC-6, AC-9,
 * AC-10, AC-12), against the acquisition stack's real API, ingestion runner
 * and PostgreSQL with the stub provider (owner-web-app section 7 "Diagnose
 * and re-run"; CAP-001-e2e-tests-automation-tasks T009).
 *
 * TC-E2E-002 drives an unavailable provider, so each data type records its
 * own failure and reason; TC-E2E-005 drives a rejected credential, which
 * fails the whole run (DEC-0048; EXP-20261011-3).
 */
test.use({ baseURL: ACQUISITION_BASE_URL });
test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await resetAcquisitionStore();
});

const DATA_TYPES = ["Reference", "Prices", "Fundamentals", "Corporate actions"];

const PRESENCE_COLUMNS = [
  COVERAGE_COLUMN.reference,
  COVERAGE_COLUMN.prices,
  COVERAGE_COLUMN.fundamentals,
  COVERAGE_COLUMN.corporateActions,
];

test("TC-E2E-002: a first acquisition against an unavailable provider reports each instrument, data type and reason", async ({
  page,
}) => {
  await setProviderMode("unavailable");
  await stateHistoryDepth(page, 1);
  await addInstruments(page, ["DFA", "DFB"]);
  const runId = await startRun(page);
  await expect(summaryOutcome(page)).toHaveText(/^(Failed|Partial)$/, { timeout: 20_000 });

  await page.goto("/runs");
  await page.getByRole("link", { name: runId }).click();
  await expect(page).toHaveURL(new RegExp(`/runs/${runId}$`));
  await expect(summaryOutcome(page)).toHaveText(/^(Failed|Partial)$/);

  for (const symbol of ["DFA", "DFB"]) {
    const group = await expandInstrument(page, symbol);
    for (const name of DATA_TYPES) {
      const row = group.locator("tr", {
        has: page.getByRole("rowheader", { name, exact: true }),
      });
      await expect(row.getByTestId("result-outcome-badge")).toHaveText("Failed");
      await expect(
        group.getByText(
          new RegExp(`^Acquiring ${name.toLowerCase()} for ${symbol} failed: \\[unavailable\\] `),
        ),
      ).toBeVisible();
    }
  }

  // Nothing was written, so Coverage says so rather than showing a range
  // (NEVER_ACQUIRED in web/src/screens/coverage/copy.ts).
  await page.goto("/coverage");
  await expect(page.getByText("No data has been acquired yet.")).toBeVisible();
  for (const symbol of ["DFA", "DFB"]) {
    await expect(coverageRow(page, symbol)).toHaveCount(0);
  }
});

test("TC-E2E-005: a failed acquisition is diagnosed, its cause corrected, and a re-run completes without disturbing earlier data", async ({
  page,
}) => {
  test.setTimeout(90_000);

  await stateHistoryDepth(page, 1);
  await addInstruments(page, ["DXA"]);
  const firstRun = await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 20_000 });

  await page.goto("/coverage");
  const dxaFrom = await coverageCell(page, "DXA", COVERAGE_COLUMN.coveredFrom).innerText();
  expect(dxaFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  await addInstruments(page, ["DXB"]);
  await setProviderMode("reject-credential");
  const failedRun = await startRun(page);
  await expect(summaryOutcome(page)).toHaveText("Failed", { timeout: 20_000 });

  await page.goto("/runs");
  await page.getByRole("link", { name: failedRun }).click();
  await expect(summaryOutcome(page)).toHaveText("Failed");

  await setProviderMode("ok");
  await page.getByRole("button", { name: "Re-run acquisition" }).click();
  await expect(page).not.toHaveURL(new RegExp(`/runs/${failedRun}$`));
  await expect(page).toHaveURL(/\/runs\/[0-9a-f-]{36}$/);
  await expect(summaryOutcome(page)).toHaveText("Succeeded", { timeout: 20_000 });

  await page.goto("/coverage");
  await expect(page.getByRole("rowheader", { name: /\bDXA$/ })).toHaveCount(1);
  await expect(page.getByRole("rowheader", { name: /\bDXB$/ })).toHaveCount(1);
  await expect(coverageCell(page, "DXA", COVERAGE_COLUMN.coveredFrom)).toHaveText(dxaFrom);
  for (const column of PRESENCE_COLUMNS) {
    await expect(coverageCell(page, "DXB", column).getByTestId("presence-badge")).toHaveAttribute(
      "data-variant",
      "coverage-present",
    );
  }

  await page.goto("/runs");
  const outcomeOf = (runId: string) =>
    page
      .locator("tr", { has: page.getByRole("link", { name: runId }) })
      .getByTestId("outcome-badge");
  await expect(outcomeOf(firstRun)).toHaveText("Succeeded");
  await expect(outcomeOf(failedRun)).toHaveText("Failed");
});
