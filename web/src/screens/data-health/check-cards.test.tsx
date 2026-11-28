import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DataHealth } from "../../app/shell-types";
import { DailyPricesCard } from "./daily-prices-card";
import { FinancialsCard } from "./financials-card";

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
