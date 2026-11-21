import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../../api/client";
import { PALETTE_COPY, failureReason } from "./copy";
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

afterEach(() => {
  flags.registered = true;
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
