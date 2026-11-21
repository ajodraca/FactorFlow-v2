import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode, useState } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../../api/client";
import { PALETTE_COPY, failureReason } from "./copy";
import { CommandPalette } from "./index";
import { matchesText, palettePages } from "./pages";
import { stockTarget, universeTarget } from "./targets";
import { fetchActiveUniverses } from "./universes";

// The registration flag the palette reads from the delivered destinations
// module. The getters are read live, so each case sets it before it renders.
const flags = vi.hoisted(() => ({ registered: true }));
vi.mock("../destinations", () => ({
  get DESTINATIONS() {
    return flags.registered
      ? [
          { group: "primary", label: "Research", to: "/research" },
          { group: "data", label: "Settings", to: "/settings" },
        ]
      : [{ group: "data", label: "Settings", to: "/settings" }];
  },
  get RESEARCH_REGISTERED() {
    return flags.registered;
  },
}));

// ---------------------------------------------------------------------------
// The shared harness (task plan, Phase 2).
// ---------------------------------------------------------------------------

interface Deferred {
  promise: Promise<Response>;
  resolve: (response: Response) => void;
}

function deferred(): Deferred {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function ok(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function fail500(): Response {
  return new Response(JSON.stringify({ error: { code: "internal_error", request_id: "req-1" } }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

function unreachable(): Promise<Response> {
  return Promise.reject(new TypeError("Failed to fetch"));
}

function universeRow(id: string, name: string) {
  return {
    universe_id: id,
    name,
    lifecycle: "active",
    member_count: 40,
    created_at: "2026-10-01T15:00:00Z",
    retired_at: null,
  };
}

function universesPage(rows: ReturnType<typeof universeRow>[]) {
  return { universes: rows, active_count: rows.length, retired_count: 0, next_cursor: null };
}

const UNIVERSES = universesPage([
  universeRow("u1", "Large caps"),
  universeRow("u2", "Small value"),
]);

function stockPage(symbols: string[], nextCursor: string | null = null) {
  return {
    instruments: symbols.map((symbol, i) => ({
      instrument_id: i + 1,
      symbol,
      lifecycle: "active",
    })),
    active_count: symbols.length,
    retired_count: 0,
    next_cursor: nextCursor,
  };
}

type Reply = Response | Promise<Response>;
let stocks: (params: URLSearchParams, signal: AbortSignal | undefined) => Reply;
let universes: (signal: AbortSignal | undefined) => Reply;
let stocksCalls: number;
let universesCalls: number;

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeEach(() => {
  // jsdom lacks what cmdk calls. The shared setup unstubs globals after each
  // test, so ResizeObserver is stubbed again here.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
  stocksCalls = 0;
  universesCalls = 0;
  stocks = () => ok(stockPage([]));
  universes = () => ok(UNIVERSES);
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost");
      if (url.pathname === "/api/instruments") {
        stocksCalls += 1;
        return Promise.resolve(stocks(url.searchParams, init?.signal ?? undefined));
      }
      if (url.pathname === "/api/universes") {
        universesCalls += 1;
        expect(url.search).toBe("?lifecycle=active");
        return Promise.resolve(universes(init?.signal ?? undefined));
      }
      return Promise.reject(new TypeError(`unexpected request ${url.pathname}`));
    }),
  );
});

afterEach(() => {
  flags.registered = true;
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Opener
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}

function renderPalette() {
  return render(
    <MemoryRouter initialEntries={["/start"]}>
      <Harness />
      <LocationProbe />
    </MemoryRouter>,
  );
}

async function openPalette(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Opener" }));
  return screen.findByRole("dialog", { name: "Search FactorFlow" });
}

function location(): string {
  return screen.getByTestId("location").textContent ?? "";
}

function headings(): string[] {
  return [...document.querySelectorAll("[cmdk-group-heading]")].map((h) => h.textContent ?? "");
}

/** A row's own label: its text nodes, without the hint span beside it. */
function labelOf(option: Element): string {
  return [...option.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join("");
}

function optionsIn(heading: string): string[] {
  const group = [...document.querySelectorAll("[cmdk-group]")].find(
    (g) => g.querySelector("[cmdk-group-heading]")?.textContent === heading,
  );
  if (!group) return [];
  return [...group.querySelectorAll('[role="option"]')].map(labelOf);
}

/** The group headed `heading`, or null when none is. */
function groupHeaded(heading: string): Element | null {
  return (
    [...document.querySelectorAll("[cmdk-group]")].find(
      (g) => g.querySelector("[cmdk-group-heading]")?.textContent === heading,
    ) ?? null
  );
}

/** Wait out the stock search's debounce and a settled render after it. */
const SETTLE_MS = 700;
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
}

/** Arrow down until the row is selected, then Enter. */
async function choose(user: ReturnType<typeof userEvent.setup>, label: string) {
  const option = await waitFor(() => {
    const found = [...document.querySelectorAll('[role="option"]')].find(
      (o) => labelOf(o) === label,
    );
    if (!found) throw new Error(`no option ${label}`);
    return found;
  });
  for (let i = 0; i < 30 && option.getAttribute("aria-selected") !== "true"; i += 1) {
    await user.keyboard("{ArrowDown}");
  }
  expect(option).toHaveAttribute("aria-selected", "true");
  await user.keyboard("{Enter}");
}

const FIVE_PAGES = ["Research", "Settings", "Coverage", "Followed stocks", "Downloads"];

// Implements TC-COMP-062
describe("states (DAC-E3-12, AC-24)", () => {
  it("(a) shows the hint row before typing, with the five pages and no search sent", async () => {
    const user = userEvent.setup();
    renderPalette();
    await openPalette(user);
    expect(optionsIn("Stocks")).toEqual(["Type a symbol to find a followed stock"]);
    expect(
      screen.getByText("Type a symbol to find a followed stock").closest('[role="option"]'),
    ).toHaveAttribute("aria-disabled", "true");
    expect(optionsIn("Pages")).toEqual(FIVE_PAGES);
    // A destination carries no hint; a data page shows its breadcrumb beside it.
    expect(
      screen.getByText("Research").closest('[role="option"]')?.querySelector("span"),
    ).toBeNull();
    expect(screen.getByText("Data health › Coverage")).toBeInTheDocument();
    expect(screen.getByText("Data health › Downloads")).toBeInTheDocument();
    expect(screen.queryByText(/No stocks or pages match/)).toBeNull();
    expect(stocksCalls).toBe(0);
    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Jump to a stock or page");
  });

  it("(b) shows Searching… while the read is pending, and no empty state", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    stocks = () => pending.promise;
    renderPalette();
    await openPalette(user);
    await user.keyboard("zz");
    const searching = await screen.findByText("Searching…");
    // cmdk's loading row, inside the group headed Stocks, never a selectable option.
    expect(searching.closest('[role="progressbar"]')).not.toBeNull();
    expect(searching.closest("[cmdk-group]")).toBe(groupHeaded("Stocks"));
    expect(optionsIn("Stocks")).toEqual([]);
    expect(screen.queryByText(/No stocks or pages match/)).toBeNull();
    pending.resolve(ok(stockPage([])));
  });

  it("(c) shows the empty state when nothing is found", async () => {
    const user = userEvent.setup();
    renderPalette();
    await openPalette(user);
    await user.keyboard("zz");
    expect(await screen.findByText('No stocks or pages match "zz".')).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    // No group is left standing with a heading and no rows.
    expect(headings()).toEqual([]);
  });

  it("(c2) shows the empty state with research routes unregistered, quoting the trimmed text", async () => {
    const user = userEvent.setup();
    flags.registered = false;
    renderPalette();
    await openPalette(user);
    await user.keyboard("zz ");
    expect(await screen.findByText('No stocks or pages match "zz".')).toBeInTheDocument();
    expect(screen.queryByText('No stocks or pages match "zz ".')).toBeNull();
  });

  it("(c3) shows no empty state while the universes read is pending, and shows it once answered", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    universes = () => pending.promise;
    renderPalette();
    await openPalette(user);
    await user.keyboard("zz");
    await waitFor(() => expect(stocksCalls).toBe(1));
    await settle();
    expect(screen.queryByText(/No stocks or pages match/)).toBeNull();
    pending.resolve(ok(UNIVERSES));
    expect(await screen.findByText('No stocks or pages match "zz".')).toBeInTheDocument();
  });

  it("(d) shows the partial row when there is a next cursor, and drops it without one", async () => {
    const user = userEvent.setup();
    const eight = ["KA", "KB", "KC", "KD", "KE", "KF", "KG", "KH"];
    stocks = () => ok(stockPage(eight, "KH"));
    renderPalette();
    await openPalette(user);
    await user.keyboard("k");
    await waitFor(() =>
      expect(optionsIn("Stocks")).toEqual([
        ...eight,
        "Showing the first 8. Keep typing to narrow.",
      ]),
    );
    expect(
      screen.getByText("Showing the first 8. Keep typing to narrow.").closest('[role="option"]'),
    ).toHaveAttribute("aria-disabled", "true");
    stocks = () => ok(stockPage(eight, null));
    await user.keyboard("a");
    await waitFor(() => expect(optionsIn("Stocks")).toEqual(eight));
  });

  it("(e) a failed stock search leaves Pages usable and never selects the error row", async () => {
    const user = userEvent.setup();
    stocks = () => fail500();
    renderPalette();
    await openPalette(user);
    await user.keyboard("co");
    expect(
      await screen.findByText(
        "Couldn't search followed stocks: FactorFlow hit an unexpected problem.",
      ),
    ).toBeInTheDocument();
    expect(optionsIn("Pages")).toEqual(["Coverage"]);
    const errorRow = screen
      .getByText("Couldn't search followed stocks: FactorFlow hit an unexpected problem.")
      .closest('[role="option"]');
    expect(errorRow).toHaveAttribute("aria-disabled", "true");
    expect(errorRow).not.toHaveAttribute("aria-selected", "true");
    await choose(user, "Coverage");
    expect(location()).toBe("/data/coverage");
  });

  it("(f) a failed universes read leaves the hint row and the pages", async () => {
    const user = userEvent.setup();
    universes = () => fail500();
    renderPalette();
    await openPalette(user);
    expect(
      await screen.findByText("Couldn't read universes: FactorFlow hit an unexpected problem."),
    ).toBeInTheDocument();
    expect(optionsIn("Universes")).toEqual([
      "Couldn't read universes: FactorFlow hit an unexpected problem.",
    ]);
    expect(
      screen
        .getByText("Couldn't read universes: FactorFlow hit an unexpected problem.")
        .closest('[role="option"]'),
    ).toHaveAttribute("aria-disabled", "true");
    expect(optionsIn("Stocks")).toEqual(["Type a symbol to find a followed stock"]);
    expect(optionsIn("Pages")).toEqual(FIVE_PAGES);
  });

  it("(g) opens with health unreachable, and Pages stays usable", async () => {
    const user = userEvent.setup();
    stocks = () => unreachable() as unknown as Reply;
    universes = () => unreachable() as unknown as Reply;
    renderPalette();
    await openPalette(user);
    expect(
      await screen.findByText("Couldn't read universes: FactorFlow is not answering."),
    ).toBeInTheDocument();
    expect(optionsIn("Pages")).toEqual(FIVE_PAGES);
    await user.keyboard("set");
    expect(
      await screen.findByText("Couldn't search followed stocks: FactorFlow is not answering."),
    ).toBeInTheDocument();
    expect(optionsIn("Pages")).toEqual(["Settings"]);
    await choose(user, "Settings");
    expect(location()).toBe("/settings");
  });
});

// Implements TC-COMP-082
describe("universes and targets (DAC-E3-S5-2, DAC-E3-11, AC-27)", () => {
  it("(a) not registered: no universes request, no Universes group, a stock goes to Coverage", async () => {
    const user = userEvent.setup();
    flags.registered = false;
    stocks = () => ok(stockPage(["KO"]));
    renderPalette();
    await openPalette(user);
    await waitFor(() => expect(optionsIn("Stocks")).toHaveLength(1));
    expect(universesCalls).toBe(0);
    expect(headings()).toEqual(["Stocks", "Pages"]);
    await user.keyboard("KO");
    await waitFor(() => expect(optionsIn("Stocks")).toEqual(["KO"]));
    await choose(user, "KO");
    expect(location()).toBe("/data/coverage?symbol=KO");
  });

  it("(b) registered: one request per opening, filtered locally, a universe goes to its page", async () => {
    const user = userEvent.setup();
    renderPalette();
    await openPalette(user);
    await waitFor(() => expect(optionsIn("Universes")).toEqual(["Large caps", "Small value"]));
    expect(universesCalls).toBe(1);
    for (const typed of ["l", "a", "rge"]) {
      await user.keyboard(typed);
    }
    await waitFor(() => expect(optionsIn("Universes")).toEqual(["Large caps"]));
    expect(universesCalls).toBe(1);
    await choose(user, "Large caps");
    expect(location()).toBe("/research/universes/u1");
    await openPalette(user);
    await waitFor(() => expect(universesCalls).toBe(2));
  });

  it("(c) registered: a stock opens the Research evidence page", async () => {
    const user = userEvent.setup();
    stocks = () => ok(stockPage(["KO"]));
    renderPalette();
    await openPalette(user);
    await user.keyboard("KO");
    await waitFor(() => expect(optionsIn("Stocks")).toEqual(["KO"]));
    await choose(user, "KO");
    expect(location()).toBe("/research/stocks/KO");
  });

  it("(d) closing before the universes read answers aborts it", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    let signal: AbortSignal | undefined;
    universes = (s) => {
      signal = s;
      return pending.promise;
    };
    renderPalette();
    await openPalette(user);
    await waitFor(() => expect(universesCalls).toBe(1));
    expect(signal?.aborted).toBe(false);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(signal?.aborted).toBe(true);
    pending.resolve(ok(UNIVERSES));
  });

  it("(e) under StrictMode an aborted read never shows a universes error", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const signals: AbortSignal[] = [];
    // A fetch that honours its signal, as the browser's does.
    universes = (signal) => {
      if (signal) signals.push(signal);
      return new Promise<Response>((resolve, reject) => {
        signal?.addEventListener("abort", () =>
          reject(new DOMException("The operation was aborted.", "AbortError")),
        );
        void pending.promise.then(resolve);
      });
    };
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/start"]}>
          <Harness />
          <LocationProbe />
        </MemoryRouter>
      </StrictMode>,
    );
    await openPalette(user);
    await waitFor(() => expect(universesCalls).toBe(2));
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    await settle();
    expect(screen.queryByText(/Couldn't read universes/)).toBeNull();
    pending.resolve(ok(UNIVERSES));
    await waitFor(() => expect(optionsIn("Universes")).toEqual(["Large caps", "Small value"]));
  });
});

// Implements TC-COMP-083
describe("close (DAC-E3-S5-3, AC-25)", () => {
  it("(a) Esc closes and returns focus to the opener, and (b) nothing typed is kept", async () => {
    const user = userEvent.setup();
    renderPalette();
    const opener = screen.getByRole("button", { name: "Opener" });
    await openPalette(user);
    await user.keyboard("KO");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
    await openPalette(user);
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(optionsIn("Stocks")).toEqual(["Type a symbol to find a followed stock"]);
  });

  it("(c) choosing an item navigates, closes and returns focus", async () => {
    const user = userEvent.setup();
    renderPalette();
    const opener = screen.getByRole("button", { name: "Opener" });
    await openPalette(user);
    await user.keyboard("set");
    await choose(user, "Settings");
    expect(location()).toBe("/settings");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });
});

// Implements TC-COMP-062 (groups)
describe("groups (DAC-E3-11, AC-22)", () => {
  it("(a) lists Stocks, Universes and Pages in that order with two separators", async () => {
    const user = userEvent.setup();
    renderPalette();
    await openPalette(user);
    await waitFor(() => expect(headings()).toEqual(["Stocks", "Universes", "Pages"]));
    expect(document.querySelectorAll("[cmdk-separator]")).toHaveLength(2);
    // A separator sits between groups, never before the first or after the last.
    expect(
      [...document.querySelectorAll("[cmdk-group], [cmdk-separator]")].map((el) =>
        el.hasAttribute("cmdk-group") ? "group" : "separator",
      ),
    ).toEqual(["group", "separator", "group", "separator", "group"]);
  });

  it("(b) does not re-rank the groups by the text, and (d) shows a stock as its symbol alone", async () => {
    const user = userEvent.setup();
    stocks = () => ok(stockPage(["COST"]));
    universes = () =>
      ok(
        universesPage([
          universeRow("u1", "Large caps"),
          universeRow("u2", "Small value"),
          universeRow("u3", "Core holdings"),
        ]),
      );
    renderPalette();
    await openPalette(user);
    await user.keyboard("co");
    await waitFor(() => expect(optionsIn("Stocks")).toEqual(["COST"]));
    expect(headings()).toEqual(["Stocks", "Universes", "Pages"]);
    expect(optionsIn("Universes")).toEqual(["Core holdings"]);
    expect(optionsIn("Pages")).toEqual(["Coverage"]);
    const cost = [...document.querySelectorAll('[role="option"]')].find(
      (o) => labelOf(o) === "COST",
    );
    expect(cost?.textContent).toBe("COST");
  });

  it("(c) has no Actions group and offers nothing that trades", async () => {
    const user = userEvent.setup();
    stocks = () => ok(stockPage(["COST"]));
    renderPalette();
    await openPalette(user);
    await waitFor(() => expect(optionsIn("Universes")).toHaveLength(2));
    const before = [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent);
    await user.keyboard("co");
    await waitFor(() => expect(optionsIn("Stocks")).toEqual(["COST"]));
    const after = [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent);
    for (const text of [...before, ...after]) {
      expect(text).not.toMatch(/\b(trade|trading|buy|sell|order|go live|resume|stop)\b/i);
    }
    expect(headings().some((h) => /actions/i.test(h))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Vocabulary and status.
// ---------------------------------------------------------------------------

const DAC_E7_3 = /\b(instruments?|acquisition|acquire|runs?|retire|retired|provider credential)\b/i;

interface Scenario {
  name: string;
  setup: () => void;
  type?: string;
  wait: string;
  registered?: boolean;
}

const SCENARIOS: Scenario[] = [
  { name: "hint", setup: () => {}, wait: "Type a symbol to find a followed stock" },
  {
    name: "loading",
    setup: () => {
      stocks = () => deferred().promise;
    },
    type: "zz",
    wait: "Searching…",
  },
  { name: "empty", setup: () => {}, type: "zz", wait: 'No stocks or pages match "zz".' },
  {
    name: "partial",
    setup: () => {
      stocks = () => ok(stockPage(["KA", "KB"], "KB"));
    },
    type: "k",
    wait: "Showing the first 8. Keep typing to narrow.",
  },
  {
    name: "stocks error",
    setup: () => {
      stocks = () => fail500();
    },
    type: "co",
    wait: "Couldn't search followed stocks: FactorFlow hit an unexpected problem.",
  },
  {
    name: "universes error",
    setup: () => {
      universes = () => fail500();
    },
    wait: "Couldn't read universes: FactorFlow hit an unexpected problem.",
  },
  {
    name: "unreachable",
    setup: () => {
      stocks = () => unreachable() as unknown as Reply;
      universes = () => unreachable() as unknown as Reply;
    },
    type: "set",
    wait: "Couldn't search followed stocks: FactorFlow is not answering.",
  },
  { name: "universes listed", setup: () => {}, type: "large", wait: "Large caps" },
];

function collectStrings(root: Element): string[] {
  const out = [root.textContent ?? ""];
  for (const el of [root, ...root.querySelectorAll("*")]) {
    for (const attribute of ["aria-label", "placeholder", "title", "aria-valuetext"]) {
      const value = el.getAttribute(attribute);
      if (value) out.push(value);
    }
  }
  return out;
}

function leaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [String(value("x")), String(value("zz"))];
  if (value && typeof value === "object") return Object.values(value).flatMap(leaves);
  return [];
}

// Implements TC-COMP-085
// Implements TC-COMP-086
describe("vocabulary and status (DAC-E3-S5-5, DAC-E3-S5-6)", () => {
  it.each(SCENARIOS)(
    "$name: no domain term, no status, nothing by colour alone",
    async (scenario) => {
      const user = userEvent.setup();
      scenario.setup();
      renderPalette();
      const dialog = await openPalette(user);
      if (scenario.type) await user.keyboard(scenario.type);
      await screen.findByText(scenario.wait);
      for (const text of collectStrings(dialog)) {
        expect(text).not.toMatch(DAC_E7_3);
      }
      expect(
        dialog.querySelectorAll('[data-variant^="status-"], [data-variant="coverage-unknown"]'),
      ).toHaveLength(0);
      for (const el of dialog.querySelectorAll("*")) {
        expect(el.getAttribute("class") ?? "").not.toMatch(/\b(bg|text|border)-status-/);
      }
      for (const row of dialog.querySelectorAll('[role="option"]')) {
        expect((row.textContent ?? "").trim()).not.toBe("");
      }
    },
  );

  it("holds no domain term in its copy, and writes its not-applicable record", () => {
    for (const text of [
      ...leaves(PALETTE_COPY),
      failureReason(new ApiUnreachableError("x")),
      failureReason(new Error("x")),
    ]) {
      expect(text).not.toMatch(DAC_E7_3);
    }
    const here = path.dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(path.join(here, "index.tsx"), "utf-8");
    expect(source).toContain("Stale: not applicable");
    expect(source).toContain("Unavailable: not applicable");
    expect(source).toContain("One-tier rule (AC-20): not applicable");
  });
});

// Implements TC-COMP-082 (pure half: pages and targets)
describe("pages, targets and reasons", () => {
  it("(a) lists the destinations, then the three data pages, reading DESTINATIONS at call time", () => {
    expect(palettePages()).toEqual([
      { label: "Research", to: "/research", hint: null },
      { label: "Settings", to: "/settings", hint: null },
      { label: "Coverage", to: "/data/coverage", hint: "Data health › Coverage" },
      { label: "Followed stocks", to: "/data/followed", hint: "Data health › Followed stocks" },
      { label: "Downloads", to: "/data/downloads", hint: "Data health › Downloads" },
    ]);
    flags.registered = false;
    expect(palettePages().map((p) => p.label)).toEqual([
      "Settings",
      "Coverage",
      "Followed stocks",
      "Downloads",
    ]);
  });

  it("(b) matches a substring of any field, ignoring case and surrounding spaces", () => {
    expect(matchesText("", "Settings")).toBe(true);
    expect(matchesText("SET", "Settings")).toBe(true);
    expect(matchesText("  set ", "Settings")).toBe(true);
    expect(matchesText("data", "Coverage", "Data health › Coverage")).toBe(true);
    expect(matchesText("xyz", "Coverage", "Data health › Coverage")).toBe(false);
    expect(matchesText("ings", "Settings")).toBe(true);
    expect(matchesText("xyz", "Settings", null)).toBe(false);
  });

  it("(c) sends a stock by registration and a universe to its research page", () => {
    expect(stockTarget("BRK.B")).toBe("/research/stocks/BRK.B");
    expect(stockTarget("A B/C")).toBe("/research/stocks/A%20B%2FC");
    flags.registered = false;
    expect(stockTarget("BRK.B")).toBe("/data/coverage?symbol=BRK.B");
    expect(stockTarget("A B&C")).toBe("/data/coverage?symbol=A%20B%26C");
    expect(universeTarget("a/b c")).toBe("/research/universes/a%2Fb%20c");
  });

  it("(d) words a failure without the error's own message or request id", () => {
    expect(failureReason(new ApiUnreachableError("x"))).toBe("FactorFlow is not answering");
    const apiError = new ApiError("No resource exists at this path.", "req-9", {
      code: "not_found",
    });
    expect(failureReason(apiError)).toBe("FactorFlow hit an unexpected problem");
    expect(failureReason(new Error("boom"))).toBe("FactorFlow hit an unexpected problem");
    expect(failureReason(apiError)).not.toContain("No resource");
    expect(failureReason(apiError)).not.toContain("req-9");
    expect(PALETTE_COPY.empty("zz")).toBe('No stocks or pages match "zz".');
    expect(PALETTE_COPY.stocksError("r")).toBe("Couldn't search followed stocks: r.");
    expect(PALETTE_COPY.universesError("r")).toBe("Couldn't read universes: r.");
  });

  it("(e) reads the active universes with one GET and maps each row to an id and a name", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            universes: [
              { universe_id: "u1", name: "Large caps", lifecycle: "active" },
              { universe_id: "u2", name: "Small value", lifecycle: "active" },
            ],
            next_cursor: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const rows = await fetchActiveUniverses(controller.signal);
    expect(rows).toEqual([
      { id: "u1", name: "Large caps" },
      { id: "u2", name: "Small value" },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/universes?lifecycle=active");
    expect(init.signal).toBe(controller.signal);
    expect(init.method).toBeUndefined();
  });
});
