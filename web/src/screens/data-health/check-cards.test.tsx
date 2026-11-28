import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../../api/client";
import type { DataHealth, ScoreState, ScoreSummary } from "../../app/shell-types";
import { DailyPricesCard } from "./daily-prices-card";
import { FinancialsCard } from "./financials-card";
import { ScoresCard } from "./scores-card";

type Prices = NonNullable<DataHealth["checks"]["daily_prices"]>;
type Financials = NonNullable<DataHealth["checks"]["company_financials"]>;

const OK_PRICES: Prices = {
  status: "ok",
  absent_count: 0,
  gap_stock_count: 0,
  behind_count: 0,
  latest_session: "2026-10-29",
  gap_detection: { available: true, reason: null },
  exception_count: 0,
  exception_symbols: [],
};

const NO_GAPS_REASON = "fewer_than_two_instruments_with_data";

function prices(over: Partial<Prices> = {}): Prices {
  return { ...OK_PRICES, ...over };
}

const OK_FINANCIALS: Financials = {
  status: "ok",
  absent_count: 0,
  problem_count: 0,
  as_of: "2026-10-30T18:00:00Z",
  exception_count: 0,
  exception_symbols: [],
};

function financials(over: Partial<Financials> = {}): Financials {
  return { ...OK_FINANCIALS, ...over };
}

function renderFinancials(
  check: Financials | null,
  followedCount = 10,
): { container: HTMLElement } {
  const view = render(
    <MemoryRouter>
      <FinancialsCard check={check} followedCount={followedCount} />
    </MemoryRouter>,
  );
  return { container: view.container };
}

/** Any status or not-determinable badge; the card itself carries `data-variant="metric"`. */
const BADGE = '[data-variant^="status-"], [data-variant="coverage-unknown"]';
const INTERNAL = new ApiError("database said no", "req-9f3", { code: "internal_error" });
const UNREACHABLE = new ApiUnreachableError("fetch failed");
const CHECKED_AT = new Date("2026-10-30T16:50:00Z");

function summary(over: Partial<ScoreSummary> = {}): ScoreSummary {
  return {
    never_classified: false,
    set: {
      set_id: "s-1",
      classification_date: "2026-10-30",
      run_id: "run-42",
      run_started_at: "2026-10-30T14:00:00Z",
      run_outcome: "succeeded",
      state: "complete",
      started_at: "2026-10-30T16:00:00Z",
      ended_at: "2026-10-30T16:45:00Z",
      latest_trading_day: "2026-10-29",
      active_instruments: 12,
      not_current: false,
    },
    later: null,
    factors: {} as ScoreSummary["factors"],
    stocks_current: { current_count: 9, followed_count: 12 },
    ...over,
  };
}

function served(data: ScoreSummary = summary()): ScoreState {
  return { kind: "served", data, checkedAt: CHECKED_AT };
}

function later(state: "building" | "failed"): NonNullable<ScoreSummary["later"]> {
  return {
    set_id: "s-2",
    state,
    started_at: "2026-10-30T17:00:00Z",
    ended_at: state === "failed" ? "2026-10-30T17:10:00Z" : null,
    failure_reason: null,
    run_id: "run-43",
    run_started_at: "2026-10-30T16:55:00Z",
  };
}

function renderScores(scores: ScoreState, onRetryScores: () => void = () => undefined) {
  const view = render(
    <MemoryRouter>
      <ScoresCard scores={scores} onRetryScores={onRetryScores} />
    </MemoryRouter>,
  );
  return { container: view.container };
}

function renderPrices(check: Prices | null, followedCount = 10): { container: HTMLElement } {
  const view = render(
    <MemoryRouter>
      <DailyPricesCard check={check} followedCount={followedCount} />
    </MemoryRouter>,
  );
  return { container: view.container };
}

function region(name: string): HTMLElement {
  return screen.getByRole("region", { name });
}

function badges(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-variant]"));
}

function badgeWith(root: HTMLElement, variant: string): HTMLElement {
  const found = badges(root).filter((element) => element.dataset.variant === variant);
  expect(found).toHaveLength(1);
  return found[0] as HTMLElement;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

function resultLine(root: HTMLElement): HTMLElement {
  const line = root.querySelector<HTMLElement>("p.text-base");
  if (!line) throw new Error("no result line rendered");
  return line;
}

function asOfLine(root: HTMLElement): HTMLElement {
  const line = root.querySelector<HTMLElement>("p.text-xs");
  if (!line) throw new Error("no as-of line rendered");
  return line;
}

describe("Daily prices card (TC-COMP-157, TC-COMP-158, DAC-E6-3, DAC-E6-S1-2, DAC-E6-S1-3)", () => {
  // Implements TC-COMP-157
  it("(a) ok: a good badge, the all-stocks result line and the newest session", () => {
    renderPrices(prices(), 1236);
    const card = region("Daily prices");
    const badge = badgeWith(card, "status-good");
    expect(badge).toHaveTextContent("No missing prices or gaps");
    expect(resultLine(card)).toHaveTextContent(/^All 1,236 stocks have prices to 2026-10-29$/);
    expect(asOfLine(card)).toHaveTextContent(/^Prices to 2026-10-29$/);
    expect(card.textContent).not.toMatch(/more/);
  });

  // Implements TC-COMP-157
  it("(b) gaps not determinable: a warning header, the gap part as coverage-unknown, the other parts kept", () => {
    const { container } = renderPrices(
      prices({
        status: "exceptions",
        absent_count: 2,
        gap_stock_count: null,
        behind_count: 1,
        gap_detection: { available: false, reason: NO_GAPS_REASON },
        exception_count: 3,
        exception_symbols: ["AAA", "BBB", "CCC"],
      }),
    );
    const card = region("Daily prices");
    expect(badgeWith(card, "status-warning")).toHaveTextContent("Needs attention");
    const gap = badgeWith(card, "coverage-unknown");
    expect(gap).toHaveTextContent("Gaps not determinable");
    expect(gap).toHaveAccessibleDescription("fewer than two followed stocks hold daily prices");
    expect(resultLine(card)).toHaveTextContent(
      /^2 without prices, Gaps not determinable\s*fewer than two followed stocks hold daily prices, 1 behind 2026-10-29$/,
    );
    expect(container.textContent).not.toContain(NO_GAPS_REASON);
    expect(container.textContent).not.toMatch(/\b0 (with|without|behind)/);
  });

  // Implements TC-COMP-157
  it("(c) not_determinable status: a Not determinable header and only the gap part", () => {
    renderPrices(
      prices({
        status: "not_determinable",
        gap_stock_count: null,
        gap_detection: { available: false, reason: NO_GAPS_REASON },
      }),
    );
    const card = region("Daily prices");
    const headerBadge = card.querySelector<HTMLElement>('[data-variant="coverage-unknown"]');
    expect(headerBadge).toHaveTextContent("Not determinable");
    expect(headerBadge).toHaveAccessibleDescription(
      "fewer than two followed stocks hold daily prices",
    );
    expect(card.textContent).not.toMatch(/All \d+ stocks have prices/);
    expect(card.querySelector('[data-variant="status-good"]')).toBeNull();
    expect(resultLine(card)).toHaveTextContent(/^Gaps not determinable/);
    expect(resultLine(card).textContent).not.toMatch(/without prices|behind/);
  });

  // Implements TC-COMP-157
  it("(d) omits zero parts and never shows a null as 0", () => {
    const { container } = renderPrices(
      prices({ status: "exceptions", absent_count: 0, gap_stock_count: 2, behind_count: 0 }),
    );
    expect(resultLine(container)).toHaveTextContent(/^2 with gaps$/);
  });

  // Implements TC-COMP-157
  it("(d) a count of absent prices alone reads as without prices, never 0 with gaps", () => {
    const { container } = renderPrices(
      prices({ status: "exceptions", absent_count: 3, gap_stock_count: 0, behind_count: 0 }),
    );
    expect(resultLine(container)).toHaveTextContent(/^3 without prices$/);
    expect(container.textContent).not.toContain("0 with gaps");
  });

  // Implements TC-COMP-157
  it("(d) a single absent stock and a single gap each count, joined in order", () => {
    const { container } = renderPrices(
      prices({ status: "exceptions", absent_count: 1, gap_stock_count: 1, behind_count: 1 }),
    );
    expect(resultLine(container)).toHaveTextContent(
      /^1 without prices, 1 with gaps, 1 behind 2026-10-29$/,
    );
  });

  // Implements TC-COMP-158
  it.each([
    [
      7,
      ["AAA", "BBB", "CCC", "DDD", "EEE"],
      "Prices to 2026-10-29 · AAA, BBB, CCC, DDD, EEE and 2 more",
    ],
    [
      6,
      ["AAA", "BBB", "CCC", "DDD", "EEE"],
      "Prices to 2026-10-29 · AAA, BBB, CCC, DDD, EEE and 1 more",
    ],
    [5, ["AAA", "BBB", "CCC", "DDD", "EEE"], "Prices to 2026-10-29 · AAA, BBB, CCC, DDD, EEE"],
    [4, ["AAA", "BBB", "CCC"], "Prices to 2026-10-29 · AAA, BBB, CCC and 1 more"],
    [3, ["AAA", "BBB", "CCC"], "Prices to 2026-10-29 · AAA, BBB, CCC"],
  ])("(e) exception_count %i with %j reads %s", (count, symbols, expected) => {
    const { container } = renderPrices(
      prices({
        status: "exceptions",
        absent_count: 1,
        exception_count: count,
        exception_symbols: symbols,
      }),
    );
    expect(asOfLine(container).textContent?.trim()).toBe(expected);
  });

  // Implements TC-COMP-157
  it("(f) a null latest_session renders an absent em dash, never null or 0", () => {
    const { container } = renderPrices(
      prices({ status: "exceptions", absent_count: 10, latest_session: null }),
    );
    const line = asOfLine(container);
    expect(line.textContent).toMatch(/^Prices to/);
    const dash = within(line).getByText("—");
    expect(dash).toHaveAttribute("aria-hidden", "true");
    expect(line).toHaveTextContent("no prices stored yet");
    expect(line.textContent).not.toMatch(/null|undefined|\b0\b/);
  });

  // Implements TC-COMP-157
  it("(f) an ok check with no stored session keeps the absent dash in the result, never a date", () => {
    const { container } = renderPrices(prices({ latest_session: null }));
    expect(resultLine(container).textContent).not.toMatch(/All|null|\b0\b/);
    expect(resultLine(container)).toHaveTextContent("no prices stored yet");
  });

  // Implements TC-COMP-157
  it("(g) carries the scope note and the Full coverage table link", () => {
    renderPrices(prices());
    const card = region("Daily prices");
    expect(card).toHaveTextContent(
      "Gaps and currency are judged against the days and the newest session other followed stocks hold. FactorFlow has no trading calendar, so a day with no download leaves nothing to detect.",
    );
    expect(within(card).getByRole("link", { name: "Full coverage table" })).toHaveAttribute(
      "href",
      "/data/coverage",
    );
  });
});

describe("Company financials card (TC-COMP-149, DAC-E6-4)", () => {
  // Implements TC-COMP-149
  it("(a) ok: a good badge, the all-stocks result line and the as-of instant with its zone", () => {
    renderFinancials(financials(), 30);
    const card = region("Company financials");
    expect(badgeWith(card, "status-good")).toHaveTextContent("All financials present");
    expect(resultLine(card)).toHaveTextContent(/^All 30 stocks have financials$/);
    expect(asOfLine(card)).toHaveTextContent(/^Financials to 2026-10-30 13:00 CDT$/);
  });

  // Implements TC-COMP-149
  it("(b) exceptions: a warning badge, the two parts and the symbols", () => {
    renderFinancials(
      financials({
        status: "exceptions",
        absent_count: 2,
        problem_count: 1,
        exception_count: 3,
        exception_symbols: ["AAA", "BBB", "CCC"],
      }),
    );
    const card = region("Company financials");
    expect(badgeWith(card, "status-warning")).toHaveTextContent("Needs attention");
    expect(resultLine(card)).toHaveTextContent(/^2 without financials, 1 with failed downloads$/);
    expect(asOfLine(card)).toHaveTextContent(
      /^Financials to 2026-10-30 13:00 CDT · AAA, BBB, CCC$/,
    );
  });

  // Implements TC-COMP-149
  it.each([
    [0, 4, "4 with failed downloads"],
    [5, 0, "5 without financials"],
    [1, 1, "1 without financials, 1 with failed downloads"],
  ])("(c) absent %i and problems %i read %s", (absent, problems, expected) => {
    const { container } = renderFinancials(
      financials({ status: "exceptions", absent_count: absent, problem_count: problems }),
    );
    expect(resultLine(container).textContent).toBe(expected);
  });

  // Implements TC-COMP-149
  it("(c) exceptions list more symbols than shown with and k more", () => {
    const { container } = renderFinancials(
      financials({
        status: "exceptions",
        absent_count: 1,
        exception_count: 7,
        exception_symbols: ["AAA", "BBB", "CCC", "DDD", "EEE"],
      }),
    );
    expect(asOfLine(container).textContent).toBe(
      "Financials to 2026-10-30 13:00 CDT · AAA, BBB, CCC, DDD, EEE and 2 more",
    );
  });

  // Implements TC-COMP-149
  it.each([
    [6, ["AAA", "BBB", "CCC", "DDD", "EEE"], " and 1 more"],
    [4, ["AAA", "BBB", "CCC"], " and 1 more"],
    [5, ["AAA", "BBB", "CCC", "DDD", "EEE"], ""],
    [3, ["AAA", "BBB", "CCC"], ""],
  ])("(c) exception_count %i with %j appends %j", (count, symbols, tail) => {
    const { container } = renderFinancials(
      financials({
        status: "exceptions",
        absent_count: 1,
        exception_count: count,
        exception_symbols: symbols,
      }),
    );
    expect(asOfLine(container).textContent).toBe(
      `Financials to 2026-10-30 13:00 CDT · ${symbols.join(", ")}${tail}`,
    );
  });

  // Implements TC-COMP-149
  it("(d) a null as_of renders an absent em dash with its hidden words", () => {
    const { container } = renderFinancials(
      financials({ status: "exceptions", absent_count: 10, as_of: null }),
    );
    const line = asOfLine(container);
    expect(within(line).getByText("—")).toHaveAttribute("aria-hidden", "true");
    expect(line).toHaveTextContent("no financials stored yet");
    expect(line.textContent).not.toMatch(/null|undefined/);
  });

  // Implements TC-COMP-149
  it("(e) carries the scope note", () => {
    renderFinancials(financials());
    expect(region("Company financials")).toHaveTextContent(
      "Checks that financials are present and downloaded, not that they are correct.",
    );
  });
});

describe("Factor scores card (TC-COMP-150, DAC-E6-5, AC-8)", () => {
  // Implements TC-COMP-150
  it("(a) not served: Not determinable with its reason once, and nothing else", () => {
    const { container } = renderScores({ kind: "not_served" });
    const card = region("Factor scores");
    const badge = badgeWith(card, "coverage-unknown");
    expect(badge).toHaveTextContent("Not determinable");
    expect(badge).toHaveAccessibleDescription("FactorFlow can't read scores yet.");
    expect(container.textContent?.match(/FactorFlow can't read scores yet\./g)).toHaveLength(1);
    expect(card.querySelector('[data-variant^="status-"]')).toBeNull();
    expect(card.querySelector("p.text-base")).toBeNull();
    expect(card.textContent).not.toMatch(/Scores \d/);
  });

  // Implements TC-COMP-150
  it.each([
    [
      "never classified",
      summary({ never_classified: true, set: null, stocks_current: null }),
      "status-neutral",
      "No scores yet",
    ],
    ["building", summary({ later: later("building") }), "status-active", "Updating"],
    ["failed", summary({ later: later("failed") }), "status-critical", "Score update failed"],
    [
      "not current",
      summary({
        set: { ...(summary().set as NonNullable<ScoreSummary["set"]>), not_current: true },
      }),
      "status-warning",
      "Not reflecting the latest download",
    ],
    ["current", summary(), "status-good", "Current"],
    [
      "building beats not current",
      summary({
        later: later("building"),
        set: { ...(summary().set as NonNullable<ScoreSummary["set"]>), not_current: true },
      }),
      "status-active",
      "Updating",
    ],
    [
      "failed beats not current",
      summary({
        later: later("failed"),
        set: { ...(summary().set as NonNullable<ScoreSummary["set"]>), not_current: true },
      }),
      "status-critical",
      "Score update failed",
    ],
  ])("(b) %s is %s %s", (_name, data, variant, label) => {
    renderScores(served(data));
    const badge = badgeWith(region("Factor scores"), variant);
    expect(badge).toHaveTextContent(label);
    expect(badge.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  // Implements TC-COMP-150
  it("(c) the result line and the Incomplete sentence", () => {
    const { container } = renderScores(served());
    expect(container.querySelectorAll("p.text-base")[0]).toHaveTextContent(
      /^9 of 12 stocks current$/,
    );
    expect(container.querySelectorAll("p.text-base")[1]).toHaveTextContent(
      /^3 stocks show as Incomplete until their data is complete$/,
    );
  });

  // Implements TC-COMP-150
  it("(c) no Incomplete sentence when every stock is current", () => {
    const { container } = renderScores(
      served(summary({ stocks_current: { current_count: 12, followed_count: 12 } })),
    );
    expect(container).toHaveTextContent("12 of 12 stocks current");
    expect(container.textContent).not.toMatch(/Incomplete/);
  });

  // Implements TC-COMP-150
  it("(c) one stock short still shows the Incomplete sentence, as the copy is written (register G11)", () => {
    const { container } = renderScores(
      served(summary({ stocks_current: { current_count: 11, followed_count: 12 } })),
    );
    expect(container).toHaveTextContent("11 of 12 stocks current");
    expect(container).toHaveTextContent("1 stocks show as Incomplete until their data is complete");
  });

  // Implements TC-COMP-150
  it("(d) the count comes from stocks_current alone, not the set's active_instruments", () => {
    const { container } = renderScores(
      served(summary({ stocks_current: { current_count: 9, followed_count: 15 } })),
    );
    expect(container).toHaveTextContent("9 of 15 stocks current");
    expect(container).toHaveTextContent("6 stocks show as Incomplete until their data is complete");
  });

  // Implements TC-COMP-150
  it("(e) the as-of line links the start time to the download", () => {
    const { container } = renderScores(served());
    const line = container.querySelector<HTMLElement>("p.text-xs");
    expect(line?.textContent).toBe(
      "Scores 2026-10-30 11:45 CDT · from the download started 2026-10-30 09:00 CDT",
    );
    const link = within(line as HTMLElement).getByRole("link", { name: "2026-10-30 09:00 CDT" });
    expect(link).toHaveAttribute("href", "/data/downloads/run-42");
  });

  // Implements TC-COMP-150
  it("(f) a null stocks_current is an absent dash, never 0 of, with no as-of line while there is no set", () => {
    const { container } = renderScores(
      served(summary({ never_classified: true, set: null, stocks_current: null })),
    );
    const result = container.querySelector<HTMLElement>("p.text-base");
    expect(within(result as HTMLElement).getByText("—")).toHaveAttribute("aria-hidden", "true");
    expect(result).toHaveTextContent("no scores yet");
    expect(container.textContent).not.toMatch(/0 of|Scores \d|Incomplete/);
    expect(container.querySelector("p.text-xs")).toBeNull();
  });

  // Implements TC-COMP-150
  it("(g) loading keeps the heading and shows a busy skeleton with no badge", () => {
    const { container } = renderScores({ kind: "loading" });
    const card = region("Factor scores");
    expect(within(card).getByRole("heading", { level: 2, name: "Factor scores" })).toBeTruthy();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(card.querySelector(BADGE)).toBeNull();
  });

  // Implements TC-COMP-150
  it("(h) a failed read keeps rendering its last summary", () => {
    const { container } = renderScores({ kind: "error", error: INTERNAL, last: summary() });
    expect(badgeWith(region("Factor scores"), "status-good")).toHaveTextContent("Current");
    expect(container).toHaveTextContent("9 of 12 stocks current");
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  // Implements TC-COMP-150
  it.each([
    [INTERNAL, "Couldn't read the factor scores: FactorFlow hit an unexpected problem."],
    [UNREACHABLE, "Couldn't read the factor scores: FactorFlow is not answering."],
  ])(
    "(i) a failed read with no last value keeps the heading and offers Try again (%s)",
    (error, sentence) => {
      const retry = vi.fn();
      const { container } = renderScores({ kind: "error", error, last: null }, retry);
      const card = region("Factor scores");
      expect(within(card).getByRole("heading", { level: 2, name: "Factor scores" })).toBeTruthy();
      expect(within(card).getByRole("status").textContent).toBe(sentence);
      expect(card.querySelector(BADGE)).toBeNull();
      fireEvent.click(within(card).getByRole("button", { name: "Try again" }));
      expect(retry).toHaveBeenCalledTimes(1);
      expect(container.textContent).not.toMatch(/req-9f3|database said no|fetch failed/);
    },
  );
});

describe("Check cards' null state (DAC-E6-7 support, AC-24)", () => {
  it("Company financials with check null keeps its heading and renders absent dashes, no status badge", () => {
    const { container } = renderFinancials(null);
    const card = region("Company financials");
    expect(
      within(card).getByRole("heading", { level: 2, name: "Company financials" }),
    ).toBeTruthy();
    expect(card.querySelector('[data-variant^="status-"]')).toBeNull();
    expect(card.querySelector('[data-variant="coverage-unknown"]')).toBeNull();
    expect(within(card).getAllByText("—")).toHaveLength(2);
    expect(within(card).getAllByText("no data stored yet")).toHaveLength(2);
    expect(container.textContent).not.toMatch(/All financials present|All \d+ stocks/);
  });

  it("Daily prices with check null keeps its heading and renders absent dashes, no status badge", () => {
    const { container } = renderPrices(null);
    const card = region("Daily prices");
    expect(within(card).getByRole("heading", { level: 2, name: "Daily prices" })).toBeTruthy();
    expect(card.querySelector('[data-variant^="status-"]')).toBeNull();
    expect(card.querySelector('[data-variant="coverage-unknown"]')).toBeNull();
    expect(within(card).getAllByText("—")).toHaveLength(2);
    expect(within(card).getAllByText("no data stored yet")).toHaveLength(2);
    expect(container.textContent).not.toMatch(/No missing prices or gaps|All \d+ stocks/);
  });
});

const TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

/** Visible text joined with every aria-label, title and aria-describedby-referenced text. */
function visibleAndAccessibleText(container: HTMLElement): string {
  const parts = [container.textContent ?? ""];
  for (const element of Array.from(container.querySelectorAll<HTMLElement>("*"))) {
    for (const name of ["aria-label", "title"]) {
      const value = element.getAttribute(name);
      if (value) parts.push(value);
    }
    for (const id of (element.getAttribute("aria-describedby") ?? "").split(" ")) {
      const text = id ? container.querySelector(`[id="${CSS.escape(id)}"]`)?.textContent : null;
      if (text) parts.push(text);
    }
  }
  return parts.join(" ");
}

describe("Check cards vocabulary and badges (TC-COMP-159, TC-COMP-160, DAC-E6-S1-4, DAC-E6-S1-5)", () => {
  const exceptions: Partial<Prices> = {
    status: "exceptions",
    absent_count: 2,
    gap_stock_count: null,
    behind_count: 1,
    gap_detection: { available: false, reason: NO_GAPS_REASON },
    exception_count: 7,
    exception_symbols: ["AAA", "BBB", "CCC", "DDD", "EEE"],
  };

  function everyState(): HTMLElement[] {
    const roots: HTMLElement[] = [];
    for (const check of [
      prices(),
      prices(exceptions),
      prices({ ...exceptions, status: "not_determinable" }),
      prices({ status: "exceptions", absent_count: 10, latest_session: null }),
      prices({ status: "exceptions", absent_count: 0, gap_stock_count: 2 }),
      prices({
        status: "not_determinable",
        gap_stock_count: null,
        gap_detection: { available: false, reason: "calendar_unavailable" },
      }),
      prices({
        status: "exceptions",
        absent_count: 1,
        exception_count: 4,
        exception_symbols: ["AAA", "BBB", "CCC"],
      }),
      prices({
        status: "exceptions",
        absent_count: 1,
        exception_count: 6,
        exception_symbols: ["AAA", "BBB", "CCC", "DDD", "EEE"],
      }),
      null,
    ]) {
      roots.push(renderPrices(check).container);
    }
    for (const check of [
      financials(),
      financials({ status: "exceptions", absent_count: 2, problem_count: 1 }),
      financials({ as_of: null }),
      financials({ status: "exceptions", absent_count: 0, problem_count: 4 }),
      financials({ status: "exceptions", absent_count: 5, problem_count: 0 }),
      null,
    ]) {
      roots.push(renderFinancials(check).container);
    }
    const scoreStates: ScoreState[] = [
      served(),
      served(summary({ never_classified: true, set: null, stocks_current: null })),
      served(summary({ later: later("building") })),
      served(summary({ later: later("failed") })),
      served(
        summary({
          set: { ...(summary().set as NonNullable<ScoreSummary["set"]>), not_current: true },
        }),
      ),
      served(summary({ stocks_current: { current_count: 12, followed_count: 12 } })),
      served(summary({ stocks_current: { current_count: 9, followed_count: 15 } })),
      { kind: "not_served" },
      { kind: "loading" },
      { kind: "error", error: INTERNAL, last: null },
      { kind: "error", error: UNREACHABLE, last: summary() },
    ];
    for (const state of scoreStates) {
      roots.push(renderScores(state).container);
    }
    return roots;
  }

  // Implements TC-COMP-159
  it("(a) no DAC-E7-3 term appears in any state's text or accessible names, and the scan is not vacuous", () => {
    expect(TERMS.test("one run")).toBe(true);
    expect(TERMS.test("Retired")).toBe(true);
    expect(TERMS.test("downloads")).toBe(false);
    expect(TERMS.test(NO_GAPS_REASON)).toBe(false);
    for (const root of everyState()) {
      expect(visibleAndAccessibleText(root)).not.toMatch(TERMS);
    }
    cleanup();
  });

  // Implements TC-COMP-159
  it("(a) the download link's href holds the run id but no name or text does", () => {
    const { container } = renderScores(served());
    expect(container.querySelector("a")?.getAttribute("href")).toContain("run-42");
    expect(visibleAndAccessibleText(container)).not.toMatch(/run-42/);
  });

  // Implements TC-COMP-160
  it("(b) every ok, exceptions and score-state badge reads exactly its label with a hidden tier shape", () => {
    const rows: [HTMLElement, string, string][] = [
      [renderPrices(prices()).container, "status-good", "No missing prices or gaps"],
      [renderPrices(prices(exceptions)).container, "status-warning", "Needs attention"],
      [renderFinancials(financials()).container, "status-good", "All financials present"],
      [
        renderFinancials(financials({ status: "exceptions", absent_count: 1 })).container,
        "status-warning",
        "Needs attention",
      ],
      [
        renderScores(served(summary({ never_classified: true, set: null, stocks_current: null })))
          .container,
        "status-neutral",
        "No scores yet",
      ],
      [
        renderScores(served(summary({ later: later("building") }))).container,
        "status-active",
        "Updating",
      ],
      [
        renderScores(served(summary({ later: later("failed") }))).container,
        "status-critical",
        "Score update failed",
      ],
      [
        renderScores(
          served(
            summary({
              set: { ...(summary().set as NonNullable<ScoreSummary["set"]>), not_current: true },
            }),
          ),
        ).container,
        "status-warning",
        "Not reflecting the latest download",
      ],
      [renderScores(served()).container, "status-good", "Current"],
    ];
    for (const [root, variant, label] of rows) {
      const badge = root.querySelector<HTMLElement>(`[data-variant="${variant}"]`);
      expect(badge?.textContent).toBe(label);
      expect(badge?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  // Implements TC-COMP-160
  it("(c) every Not determinable is a coverage-unknown badge with an accessible description, never a status badge, a dash or plain text", () => {
    const rows: [HTMLElement, string][] = [
      [
        renderPrices(prices({ ...exceptions, status: "not_determinable" })).container,
        "Not determinable",
      ],
      [renderPrices(prices(exceptions)).container, "Gaps not determinable"],
      [renderScores({ kind: "not_served" }).container, "Not determinable"],
    ];
    for (const [root, label] of rows) {
      const badge = Array.from(
        root.querySelectorAll<HTMLElement>('[data-variant="coverage-unknown"]'),
      ).find((candidate) => candidate.textContent === label);
      expect(badge).toBeDefined();
      expect(badge).toHaveAccessibleDescription(/\S/);
      expect(within(root).queryByText("—")).toBeNull();
    }
    // the gap part inside an exceptions card is the badge itself, not plain text
    expect(
      within(rows[1]?.[0] as HTMLElement).getByText("Gaps not determinable").dataset.variant,
    ).toBe("coverage-unknown");
    // not_determinable and not_served carry no status badge at all
    expect(rows[0]?.[0].querySelector('[data-variant^="status-"]')).toBeNull();
    expect(rows[2]?.[0].querySelector('[data-variant^="status-"]')).toBeNull();
  });

  // Implements TC-COMP-160
  it("(d) every null is an aria-hidden em dash with its hidden words, never a 0", () => {
    const rows: [HTMLElement, string][] = [
      [
        renderPrices(prices({ status: "exceptions", absent_count: 10, latest_session: null }))
          .container,
        "no prices stored yet",
      ],
      [renderPrices(null).container, "no data stored yet"],
      [renderFinancials(financials({ as_of: null })).container, "no financials stored yet"],
      [renderFinancials(null).container, "no data stored yet"],
      [
        renderScores(served(summary({ never_classified: true, set: null, stocks_current: null })))
          .container,
        "no scores yet",
      ],
    ];
    for (const [root, words] of rows) {
      const dashes = within(root).getAllByText("—");
      for (const dash of dashes) {
        expect(dash).toHaveAttribute("aria-hidden", "true");
        expect(dash.nextElementSibling?.textContent).toBe(words);
      }
      expect(root.textContent).not.toMatch(/\b0\b/);
    }
  });
});
