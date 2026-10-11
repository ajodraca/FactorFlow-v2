import { type APIRequestContext, type Locator, type Page, expect } from "@playwright/test";
import { sql } from "./database";

/**
 * Helpers for the acquisition stack `scripts/run-e2e-server.sh` starts: an
 * API with an ingestion runner on 127.0.0.1:8125, its own database
 * `factorflow_acquisition`, and the stub Massive provider
 * (`massive_stub.py`) on 127.0.0.1:8126 (CAP-001-e2e-tests-automation-tasks
 * T004; DEC-0025). Supports TC-E2E-001, 002, 004-007, 009, 010.
 *
 * Every acquisition-stack spec calls `resetAcquisitionStore()` in
 * `beforeEach`, so no spec depends on file order, and leaves no run
 * non-terminal at its end. A test fixture, not a product contract.
 */
export const ACQUISITION_BASE_URL = "http://127.0.0.1:8125";

const STUB_BASE_URL = "http://127.0.0.1:8126";
const ACQUISITION_DATABASE = "factorflow_acquisition";

/** Every table `migrations/0001`-`0004` create, except `applied_migrations`. */
const DATA_TABLES = [
  "instrument",
  "owner_setting",
  "instrument_reference",
  "daily_bar",
  "fundamental_observation",
  "corporate_action",
  "coverage_segment",
  "acquisition_state",
  "acquisition_run",
  "run_instrument_result",
];

async function stubControl(path: string, body: Record<string, string> = {}): Promise<void> {
  const response = await fetch(`${STUB_BASE_URL}/__stub/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`stub control ${path} answered ${response.status}: ${await response.text()}`);
  }
}

export type ProviderMode = "ok" | "reject-credential" | "unavailable";

export function setProviderMode(mode: ProviderMode): Promise<void> {
  return stubControl("mode", { mode });
}

export function holdSymbol(symbol: string): Promise<void> {
  return stubControl("hold", { symbol });
}

export function releaseSymbol(symbol: string): Promise<void> {
  return stubControl("release", { symbol });
}

export function resetStub(): Promise<void> {
  return stubControl("reset");
}

/** Restores the stub's defaults and empties every data table on the acquisition stack. */
export async function resetAcquisitionStore(): Promise<void> {
  await resetStub();
  sql(`TRUNCATE ${DATA_TABLES.join(", ")} RESTART IDENTITY CASCADE`, ACQUISITION_DATABASE);
}

/** States the history depth on Settings, as the owner does: type, then leave the field. */
export async function stateHistoryDepth(page: Page, years: number): Promise<void> {
  await page.goto("/settings");
  const field = page.getByRole("spinbutton", { name: "History depth, in years" });
  await expect(field).toBeEnabled();
  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/settings/history-depth") &&
      response.request().method() === "PUT",
  );
  await field.fill(String(years));
  await field.blur();
  expect((await saved).ok()).toBe(true);
}

/** Adds each symbol through the Instruments screen's single-symbol field. */
export async function addInstruments(page: Page, symbols: string[]): Promise<void> {
  await page.goto("/instruments");
  const field = page.getByRole("textbox", { name: /instrument symbol/i });
  for (const symbol of symbols) {
    await field.fill(symbol);
    await field.press("Enter");
    await expect(page.getByRole("table").locator("tr", { hasText: symbol })).toBeVisible();
  }
}

/**
 * Starts a run from the Runs screen, which routes to the new run's detail
 * (ux-design 1.1: Start lives on Coverage and Runs), and returns its id.
 */
export async function startRun(page: Page): Promise<string> {
  await page.goto("/runs");
  await page.getByRole("button", { name: "Start acquisition run" }).click();
  await expect(page).toHaveURL(/\/runs\/[0-9a-f-]{36}$/);
  return new URL(page.url()).pathname.split("/").pop() as string;
}

/** The outcome badge in Run detail's summary card. */
export function summaryOutcome(page: Page): Locator {
  return page.locator('section[data-variant="summary"]').getByTestId("outcome-badge");
}

/** The Run detail roster's expander for one instrument. */
export function rosterExpander(page: Page, symbol: string): Locator {
  return page.getByRole("button", { name: new RegExp(`data types for ${symbol}$`) });
}

/** Expands one instrument on Run detail and returns its data-type group. */
export async function expandInstrument(page: Page, symbol: string): Promise<Locator> {
  const expander = rosterExpander(page, symbol);
  await expander.click();
  return page.locator(`[id="${await expander.getAttribute("aria-controls")}"]`);
}

/** One instrument's row on the Coverage screen. */
export function coverageRow(page: Page, symbol: string): Locator {
  return page.locator("tr", {
    has: page.getByRole("rowheader", { name: new RegExp(`\\b${symbol}$`) }),
  });
}

/** Coverage columns after the symbol header, in `coverage-table.tsx` order. */
export const COVERAGE_COLUMN = {
  lifecycle: 0,
  reference: 1,
  prices: 2,
  fundamentals: 3,
  corporateActions: 4,
  coveredFrom: 5,
  coveredTo: 6,
  gaps: 7,
  depth: 8,
  lastAcquired: 9,
} as const;

export function coverageCell(page: Page, symbol: string, column: number): Locator {
  return coverageRow(page, symbol).locator("td").nth(column);
}

/**
 * Polls `GET /api/acquisition-runs/{id}` on the acquisition stack until the
 * run's state is one of `states`, and returns that state.
 */
export async function waitForRunState(
  request: APIRequestContext,
  runId: string,
  states: string[],
  timeoutMs: number,
): Promise<string> {
  let state = "";
  await expect
    .poll(
      async () => {
        const response = await request.get(`${ACQUISITION_BASE_URL}/api/acquisition-runs/${runId}`);
        expect(response.ok()).toBe(true);
        state = (await response.json()).run.state;
        return states.includes(state);
      },
      { timeout: timeoutMs, message: `run ${runId} never reached ${states.join(" or ")}` },
    )
    .toBe(true);
  return state;
}
