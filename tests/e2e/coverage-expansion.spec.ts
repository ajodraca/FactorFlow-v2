import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

/**
 * Expansion to gap dates on Coverage, in a browser against the real API and
 * PostgreSQL from `playwright.config.ts` (CAP-001-E6-S4 Testing:
 * "`@playwright/test` for expansion to gap dates"; AC-8, DAC-E6-13,
 * DAC-E6-S4-2, DAC-E6-S4-5).
 *
 * The seed is applied through the e2e container, whose name and credentials
 * are the constants in `scripts/run-e2e-server.sh`. CVC is missing
 * 2024-01-04, which CVA and CVB both hold.
 */
const seedPath = fileURLToPath(new URL("./fixtures/coverage-seed.sql", import.meta.url));

test.beforeAll(() => {
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      "-e",
      "PGPASSWORD=postgres",
      "factorflow-e2e-postgres",
      "psql",
      "--host=127.0.0.1",
      "--username=postgres",
      "--dbname=factorflow",
      "-v",
      "ON_ERROR_STOP=1",
    ],
    { input: readFileSync(seedPath) },
  );
});

test("a gap count sits in the row and its dates load once, on expansion, without polling", async ({
  page,
}) => {
  const coverageRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/coverage")) {
      coverageRequests.push(request.url());
    }
  });

  await page.goto("/coverage");
  // The unfiltered first page can already hold these rows, so wait for the
  // debounced filter's own response rather than for the rows alone.
  const filtered = page.waitForResponse((response) =>
    response.url().includes("/api/coverage?symbol=CV"),
  );
  await page.getByRole("textbox", { name: "Filter by symbol" }).fill("CV");
  await filtered;

  const rowOf = (symbol: string) =>
    page.locator("tr", { has: page.getByRole("rowheader", { name: new RegExp(`\\b${symbol}$`) }) });
  for (const symbol of ["CVA", "CVB", "CVC"]) {
    await expect(rowOf(symbol)).toBeVisible();
  }

  const gapsCell = (symbol: string) => rowOf(symbol).locator("td").nth(7);
  await expect(gapsCell("CVC")).toHaveText("1");
  await expect(gapsCell("CVA")).toHaveText("0");
  await expect(gapsCell("CVB")).toHaveText("0");
  expect(coverageRequests.some((url) => url.includes("expand="))).toBe(false);

  await page.getByRole("button", { name: "Show details for CVC" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("listitem").filter({ hasText: "2024-01-04" })).toBeVisible();
  expect(coverageRequests.filter((url) => url.includes("expand=CVC"))).toHaveLength(1);

  await expect(rowOf("CVC").locator("td").nth(5)).toHaveText("2024-01-02");

  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
  ).toBe(true);

  const settled = coverageRequests.filter((url) => !url.includes("expand=")).length;
  await page.waitForTimeout(15_000);
  expect(coverageRequests.filter((url) => !url.includes("expand="))).toHaveLength(settled);
});
