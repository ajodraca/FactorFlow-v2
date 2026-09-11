import { expect, test } from "@playwright/test";

/**
 * The add-then-retire path (this story's Testing section; component design
 * section 7's e2e row: "First-run journey" and "Cancel a run" cover other
 * flows, this one covers Instruments end to end). Runs against the real
 * API and a real PostgreSQL container (`playwright.config.ts`'s
 * `webServer`), never against a mock.
 */
test("adding a symbol via the single-field form, then retiring it, keeps it visible marked retired", async ({
  page,
}) => {
  await page.goto("/instruments");

  const addField = page.getByRole("textbox", { name: /instrument symbol/i });
  await addField.fill("AAPL");
  await addField.press("Enter");

  const table = page.getByRole("table");
  const row = table.locator("tr", { hasText: "AAPL" });
  await expect(row).toBeVisible();
  await expect(row.getByTestId("lifecycle-badge")).toHaveText(/active/i);

  await row.getByRole("button", { name: "Stop acquiring AAPL" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Stop acquiring AAPL?");
  await dialog.getByRole("button", { name: "Stop acquiring" }).click();

  // Retired, never removed (AC-21): the row stays visible in the same
  // table, now carrying the retired lifecycle badge.
  await expect(row).toBeVisible();
  await expect(row.getByTestId("lifecycle-badge")).toHaveText(/retired/i);
});
