import { execFileSync } from "node:child_process";
import { type APIRequestContext, expect, type test as playwrightTest } from "@playwright/test";
import { ACQUISITION_BASE_URL } from "./acquisition";
import { sql } from "./database";

/**
 * Fixtures for the CAP-002 e2e specs on the acquisition stack
 * (CAP-002-e2e-tests-automation-tasks T004; DEC-0285): seeding a scored
 * classification set by SQL in the shape `tests/integration/reader_seed.py`
 * uses, creating universes and retiring a followed stock through the API as
 * test preconditions, and a guard for the cases that need a real build.
 *
 * The behaviour a test asserts is always driven through the interface; the
 * API is used for preconditions only. A test fixture, not a product contract.
 */
const ACQUISITION_DATABASE = "factorflow_acquisition";

export type Factor = "value" | "growth" | "momentum";
export const FACTORS: readonly Factor[] = ["value", "growth", "momentum"];

/** `src/factorflow/classification/constants.py` `INPUT_NAMES`. */
const INPUT_NAMES: Record<Factor, readonly string[]> = {
  value: ["book_to_price", "earnings_yield", "fcf_yield"],
  growth: ["revenue_growth", "eps_growth"],
  momentum: ["return_3m", "return_6m", "return_12m"],
};

/** The peer-set size below which a factor is not ranked (`min_peer_set_size`). */
const MIN_PEER_SET = 30;

/** A scored cell: standardised score and a whole-number percentile (0 to 100). */
export interface Scored {
  score: number;
  percentile: number;
}

/** A cell that is not classified because one input is not usable. */
export interface Incomplete {
  reason: "input_missing" | "input_outdated" | "input_not_computable";
  input: string;
  detail: string;
}

export type CellSeed = Scored | Incomplete;

export interface StockSeed {
  symbol: string;
  /** Company name stored as the stock's reference; omitted when not given. */
  name?: string;
  value?: CellSeed;
  growth?: CellSeed;
  momentum?: CellSeed;
  /**
   * True for a stock retired from acquisition at build time: all three factors
   * are `not_classified` with reason `retired` and the stock has no input rows
   * (`classify.sql` step 4).
   */
  retiredCells?: boolean;
}

export interface SeededStore {
  setId: string;
  runId: string;
  classificationDate: string;
}

const DEFAULT_CELL: Scored = { score: 0.5, percentile: 50 };

function lit(text: string): string {
  return `'${text.replaceAll("'", "''")}'`;
}

function num(value: number): string {
  return String(value);
}

function isIncomplete(cell: CellSeed): cell is Incomplete {
  return "reason" in cell;
}

function classificationRows(setId: string, stock: StockSeed): string[] {
  const id = `(SELECT instrument_id FROM instrument WHERE symbol = ${lit(stock.symbol)})`;
  return FACTORS.map((factor) => {
    if (stock.retiredCells) {
      return `(${lit(setId)}, ${id}, ${lit(factor)}, 'not_classified', NULL, NULL, 'retired', NULL, NULL)`;
    }
    const cell = stock[factor] ?? DEFAULT_CELL;
    if (isIncomplete(cell)) {
      return `(${lit(setId)}, ${id}, ${lit(factor)}, 'not_classified', NULL, NULL, ${lit(cell.reason)}, ${lit(cell.input)}, ${lit(cell.detail)})`;
    }
    return `(${lit(setId)}, ${id}, ${lit(factor)}, 'classified', ${num(cell.score)}, ${num(cell.percentile)}, NULL, NULL, NULL)`;
  });
}

function inputRows(setId: string, stock: StockSeed): string[] {
  if (stock.retiredCells) {
    return [];
  }
  const id = `(SELECT instrument_id FROM instrument WHERE symbol = ${lit(stock.symbol)})`;
  const rows: string[] = [];
  for (const factor of FACTORS) {
    const cell = stock[factor] ?? DEFAULT_CELL;
    for (const input of INPUT_NAMES[factor]) {
      const prefix = `(${lit(setId)}, ${id}, ${lit(factor)}, ${lit(input)}`;
      if (isIncomplete(cell) && cell.input === input) {
        const status = cell.reason.replace("input_", "");
        rows.push(`${prefix}, ${lit(status)}, NULL, NULL, NULL, '{}'::jsonb)`);
      } else {
        rows.push(`${prefix}, 'present', 1.5, DATE '2026-09-30', DATE '2026-10-01', '{}'::jsonb)`);
      }
    }
  }
  return rows;
}

/**
 * Seeds the acquisition database with the given stocks (active, or as a
 * retired-at-build stock) and one terminal run with one `complete`
 * classification set over them. A factor is ranked when at least 30 stocks
 * are classified on it. The classification date is today in the host's
 * calendar. The caller names each stock's cells, so a test can say which stocks
 * match a filter.
 */
export function seedScoredStore(stocks: readonly StockSeed[]): SeededStore {
  const symbols = stocks.map((stock) => `(${lit(stock.symbol)}, 'active', NULL)`);
  const names = stocks.filter((stock) => stock.name !== undefined);
  sql(
    `INSERT INTO instrument (symbol, lifecycle, retired_at) VALUES ${symbols.join(", ")}`,
    ACQUISITION_DATABASE,
  );
  // Coverage, not lifecycle, decides which stocks a universe accepts (AC-15), so each
  // seeded stock, retired-at-build ones included, has acquired data on record.
  sql(
    `INSERT INTO coverage_segment (instrument_id, data_type, covered_from, covered_to)
     SELECT instrument_id, 'prices', DATE '2025-01-01', DATE '2026-01-01'
       FROM instrument WHERE symbol = ANY(ARRAY[${stocks.map((stock) => lit(stock.symbol)).join(", ")}])`,
    ACQUISITION_DATABASE,
  );
  const ids = sql(
    `WITH run AS (
       INSERT INTO acquisition_run (state, history_depth_years, started_at, ended_at)
       VALUES ('succeeded', 5, now() - interval '2 hours', now() - interval '1 hour')
       RETURNING run_id
     ), made AS (
       INSERT INTO classification_set (run_id, state, classification_date, latest_trading_day,
                                       active_instruments, started_at, ended_at)
       SELECT run_id, 'complete', (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date,
              (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date - 1, ${stocks.length},
              now() - interval '1 hour', now() - interval '59 minutes'
       FROM run
       RETURNING set_id, run_id, classification_date
     )
     SELECT set_id::text || '|' || run_id::text || '|' || classification_date::text FROM made`,
    ACQUISITION_DATABASE,
  );
  const [seededSetId, runId, classificationDate] = ids.split("|") as [string, string, string];
  const factorCounts = FACTORS.map((factor) => {
    const qualified = stocks.filter(
      (stock) => !stock.retiredCells && !isIncomplete(stock[factor] ?? DEFAULT_CELL),
    ).length;
    return `(${lit(seededSetId)}, ${lit(factor)}, ${qualified}, ${qualified >= MIN_PEER_SET})`;
  });
  const statements = [
    `INSERT INTO classification_set_factor (set_id, factor, qualified_count, ranked)
     VALUES ${factorCounts.join(", ")}`,
    `INSERT INTO factor_classification (set_id, instrument_id, factor, status, score, percentile,
                                       reason_code, reason_input, reason_detail)
     VALUES ${stocks.flatMap((stock) => classificationRows(seededSetId, stock)).join(", ")}`,
  ];
  const inputs = stocks.flatMap((stock) => inputRows(seededSetId, stock));
  if (inputs.length > 0) {
    statements.push(
      `INSERT INTO factor_input (set_id, instrument_id, factor, input_name, status, value, as_of,
                              known_on, detail)
     VALUES ${inputs.join(", ")}`,
    );
  }
  if (names.length > 0) {
    statements.push(
      `INSERT INTO instrument_reference (instrument_id, value_hash, company_name, payload)
       VALUES ${names
         .map(
           (stock) =>
             `((SELECT instrument_id FROM instrument WHERE symbol = ${lit(stock.symbol)}),
               sha256(${lit(`${stock.symbol}:${stock.name}`)}::bytea),
               ${lit(stock.name as string)}, jsonb_build_object('name', ${lit(stock.name as string)}))`,
         )
         .join(", ")}`,
    );
  }
  sql(statements.join(";\n"), ACQUISITION_DATABASE);
  return { setId: seededSetId, runId, classificationDate };
}

/** A stock whose three cells are all scored. */
export type SpreadStock = StockSeed & { value: Scored; growth: Scored; momentum: Scored };

/**
 * `count` stocks `{prefix}00`, `{prefix}01`, ... whose percentiles are spread
 * over 0 to 100 and differ per factor, so a filter has a known subset: stock
 * `i` has value percentile `i * 100 / (count - 1)`, growth percentile in the
 * reverse order and momentum score `(i - count / 2) / 10`.
 */
export function spreadStocks(count: number, prefix = "S"): SpreadStock[] {
  return Array.from({ length: count }, (_, index) => {
    const percentile = Math.round((index * 100) / (count - 1));
    return {
      symbol: `${prefix}${String(index).padStart(2, "0")}`,
      value: { score: (index - count / 2) / 10, percentile },
      growth: { score: (count / 2 - index) / 10, percentile: 100 - percentile },
      momentum: { score: (index - count / 2) / 10, percentile },
    };
  });
}

/**
 * Enough scored stocks (`Z00` to `Z29`) to make every factor ranked, since a
 * factor with fewer than 30 qualified stocks shows "Not enough to rank". Add
 * them to a seeded set whose own stocks are fewer than 30.
 */
export function fillerStocks(): StockSeed[] {
  return spreadStocks(MIN_PEER_SET, "Z");
}

/**
 * Puts the symbols on the acquisition list as active followed stocks, as the
 * Instruments screen does, without acquiring anything. For the cases that need
 * a real run to produce the scores: adding thirty stocks one by one through
 * the screen is a precondition, not the behaviour under test.
 */
export function followStocks(symbols: readonly string[]): void {
  sql(
    `INSERT INTO instrument (symbol, lifecycle) VALUES ${symbols.map((symbol) => `(${lit(symbol)}, 'active')`).join(", ")}`,
    ACQUISITION_DATABASE,
  );
}

/** `F00` to `F{count-1}`: followed stocks for a real run. */
export function followerSymbols(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `F${String(index).padStart(2, "0")}`);
}

/**
 * Seeds one active universe, named `name`, whose creation and member events
 * were recorded `daysAgo` days ago (America/Chicago), so a test can view the
 * members as of a date before the day's own changes. Needs the stocks to be
 * seeded first, and no other universe in the store. Returns the universe id.
 * The universe API cannot backdate an event, and `universe_event` is
 * append-only, so a past event can only be inserted.
 */
export function seedUniverseRecorded(
  name: string,
  symbols: readonly string[],
  daysAgo: number,
): string {
  const day = `((CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date - ${daysAgo})`;
  const at = `now() - interval '${daysAgo} days'`;
  const members = symbols.map(
    (symbol) =>
      `INSERT INTO universe_event (universe_id, event_type, instrument_id, recorded_at, recorded_on)
       SELECT universe_id, 'member_added', (SELECT instrument_id FROM instrument WHERE symbol = ${lit(symbol)}), ${at}, ${day}
       FROM universe`,
  );
  // psql prints a command tag per statement, so the id is the last line.
  const output = sql(
    [
      "INSERT INTO universe DEFAULT VALUES",
      `INSERT INTO universe_event (universe_id, event_type, name, recorded_at, recorded_on)
       SELECT universe_id, 'created', ${lit(name)}, ${at}, ${day} FROM universe`,
      ...members,
      "SELECT universe_id::text FROM universe",
    ].join(";\n"),
    ACQUISITION_DATABASE,
  );
  return output.split("\n").at(-1) as string;
}

function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json" };
}

/** Creates an active universe through the API as a precondition; returns its id. */
export async function createUniverseViaApi(
  request: APIRequestContext,
  name: string,
  symbols: readonly string[],
): Promise<string> {
  const response = await request.post(`${ACQUISITION_BASE_URL}/api/universes`, {
    headers: jsonHeaders(),
    data: { name, symbols },
  });
  expect(response.status(), await response.text()).toBe(201);
  return (await response.json()).universe_id as string;
}

/** Adds members through the API as a precondition. */
export async function addMembersViaApi(
  request: APIRequestContext,
  universeId: string,
  symbols: readonly string[],
): Promise<void> {
  const response = await request.post(
    `${ACQUISITION_BASE_URL}/api/universes/${universeId}/members`,
    { headers: jsonHeaders(), data: { symbols } },
  );
  expect(response.ok(), await response.text()).toBe(true);
}

/** Removes a member through the API as a precondition. */
export async function removeMemberViaApi(
  request: APIRequestContext,
  universeId: string,
  symbol: string,
): Promise<void> {
  const response = await request.delete(
    `${ACQUISITION_BASE_URL}/api/universes/${universeId}/members/${encodeURIComponent(symbol)}`,
  );
  expect(response.ok(), await response.text()).toBe(true);
}

/** Retires a followed stock the way the owner does: `DELETE /api/instruments/{symbol}`. */
export async function retireInstrument(request: APIRequestContext, symbol: string): Promise<void> {
  const response = await request.delete(
    `${ACQUISITION_BASE_URL}/api/instruments/${encodeURIComponent(symbol)}`,
  );
  expect(response.ok(), await response.text()).toBe(true);
}

/** The current complete set's id on the acquisition stack, or null before any set. */
export async function currentSetId(request: APIRequestContext): Promise<string | null> {
  const response = await request.get(`${ACQUISITION_BASE_URL}/api/classifications/summary`);
  expect(response.ok()).toBe(true);
  const body = await response.json();
  return (body.set?.set_id as string | undefined) ?? null;
}

/**
 * Polls `GET /api/classifications/summary` until the current set differs from
 * `previousSetId` and no later attempt is pending, and returns the new set id.
 */
export async function waitForNewSet(
  request: APIRequestContext,
  previousSetId: string | null,
  timeoutMs = 60_000,
): Promise<string> {
  let found = "";
  await expect
    .poll(
      async () => {
        const response = await request.get(`${ACQUISITION_BASE_URL}/api/classifications/summary`);
        expect(response.ok()).toBe(true);
        const body = await response.json();
        const setId = (body.set?.set_id as string | undefined) ?? null;
        if (setId !== null && setId !== previousSetId && body.later === null) {
          found = setId;
          return true;
        }
        return false;
      },
      { timeout: timeoutMs, message: "no new classification set was produced" },
    )
    .toBe(true);
  return found;
}

/**
 * Skips the calling test, with the reason in the report, while a real build
 * cannot yet score value or growth: the statement payload keys are unresolved
 * (system design section 8 question 1; DEC-0285). Call it first in a guarded
 * test; once `line_items.unresolved()` is empty the test runs unchanged.
 */
export function skipUnlessLineItemsResolved(test: typeof playwrightTest): void {
  const output = execFileSync(
    "uv",
    [
      "run",
      "python",
      "-c",
      "from factorflow.classification import line_items; print(len(line_items.unresolved()))",
    ],
    { encoding: "utf-8" },
  ).trim();
  test.skip(
    output !== "0",
    "Blocked: Massive payload keys unresolved (system design section 8 question 1, DEC-0285)",
  );
}
