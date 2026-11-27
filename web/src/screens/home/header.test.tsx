import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiUnreachableError } from "../../api/client";
import type { ShellContextValue } from "../../app/shell-context";
import type { Attention } from "../../app/shell-types";
import * as copy from "./copy";
import { HomeHeader } from "./header";

// The consumer seam CAP-003-E3-S3's plan names: `useShell()` throws without a
// provider (DEC-0326), so the shell is mocked and `HomeHeader` reads one value.
const shell = vi.hoisted(() => ({
  value: { attention: { kind: "loading" } } as unknown as ShellContextValue,
}));
vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }));

// Independent fixtures, typed `Attention`, never produced by the code under test.
const ATTENTION: Attention = {
  checked_at: "2026-10-15T22:52:10Z", // 17:52:10 CDT
  prices_as_of: "2026-10-14",
  followed_count: 1236,
  credential_present: true,
  problems: { stock_count: 0, symbols: [], newest_completed_at: null },
  latest_download: null,
  latest_terminal_download: null,
  items: [],
};
// The client `checkedAt` differs from `checked_at` on purpose (T007 (a)).
const OK = { kind: "ok", data: ATTENTION, checkedAt: new Date("2026-10-15T22:53:41Z") } as const;
const OK_NO_PRICES = { ...OK, data: { ...ATTENTION, prices_as_of: null } } as const;
const FAILED_WITH_LAST = {
  kind: "error",
  error: new ApiUnreachableError("unreachable"),
  last: {
    data: { ...ATTENTION, checked_at: "2026-10-15T22:40:05Z" },
    checkedAt: new Date("2026-10-15T22:40:06Z"),
  },
} as const;
const FAILED_NO_LAST = {
  kind: "error",
  error: new ApiUnreachableError("unreachable"),
  last: null,
} as const;
const LOADING = { kind: "loading" } as const;

const INSIDE = "2026-10-15T17:00:00Z"; // Thursday 12:00 CDT, inside session hours
const OUTSIDE = "2026-10-16T01:00:00Z"; // Thursday 20:00 CDT, outside

const refresh = vi.fn();
const setTitleDetail = vi.fn();

function renderAt(instant: string, attention: ShellContextValue["attention"]) {
  vi.setSystemTime(new Date(instant));
  shell.value = { attention, refresh, setTitleDetail } as unknown as ShellContextValue;
  return render(
    <MemoryRouter>
      <HomeHeader />
    </MemoryRouter>,
  );
}

function lineText(): string {
  return (screen.getByTestId("as-of-line").textContent ?? "").replace(/\s+/g, " ").trim();
}

beforeEach(() => {
  vi.useFakeTimers();
  refresh.mockReset();
  setTitleDetail.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("HomeHeader: date and prices as-of (TC-COMP-133)", () => {
  // Implements TC-COMP-133
  it("reads the Chicago date in the evening and renders prices unshifted", () => {
    renderAt(OUTSIDE, OK);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Thursday, 2026-10-15");
    expect(lineText()).toBe("Market closed · prices current to 2026-10-14 · checked 17:52:10 CDT");
  });

  it("reads the same date at midday", () => {
    renderAt(INSIDE, OK);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Thursday, 2026-10-15");
  });

  describe.each(["Asia/Tokyo", "America/Los_Angeles"])("under TZ=%s", (zone) => {
    let previous: string | undefined;
    beforeEach(() => {
      previous = process.env.TZ;
      process.env.TZ = zone;
    });
    afterEach(() => {
      if (previous === undefined) {
        Reflect.deleteProperty(process.env, "TZ");
      } else {
        process.env.TZ = previous;
      }
    });

    it("renders the spring-change date as received and the heading from the Chicago clock", () => {
      renderAt(INSIDE, { ...OK, data: { ...ATTENTION, prices_as_of: "2026-03-08" } });
      expect(lineText()).toContain("prices current to 2026-03-08");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Thursday, 2026-10-15");
    });
  });
});

describe("HomeHeader: market-state badge (TC-COMP-135)", () => {
  // Implements TC-COMP-135
  it("renders not determinable through NotDeterminable, with a hatch and no tier", () => {
    renderAt(INSIDE, OK);
    const badge = screen.getByText("Market state not determinable");
    expect(badge).toHaveAttribute("data-variant", "coverage-unknown");
    expect(badge).toHaveClass("bg-pattern-indeterminate");
    const reason = "FactorFlow has no trading calendar, so it can't tell a session from a holiday.";
    expect(badge).toHaveAccessibleDescription(reason);
    const line = screen.getByTestId("as-of-line");
    expect(line.textContent).toContain(reason);
    expect(line.querySelector('[data-variant^="status-"]')).toBeNull();
    expect(line.querySelector("svg")).toBeNull();
  });

  it("renders closed as text with no badge", () => {
    renderAt(OUTSIDE, OK);
    const line = screen.getByTestId("as-of-line");
    expect(line.textContent).toContain("Market closed");
    expect(line.querySelector("[data-variant]")).toBeNull();
  });

  it("tells the two states apart in words, not colour", () => {
    renderAt(INSIDE, OK);
    expect(lineText()).not.toContain("Market closed");
  });
});

// The eight DAC-E7-3 terms as whole words, in any case.
const TERMS = /\b(?:instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

/** Every string in a catalogue export, with function leaves called as `CALLS` says. */
const CALLS: Record<string, unknown[][]> = {
  "HEADER.heading": [["Thursday", "2026-10-15"]],
  "DATA_TILE.ofFollowedStocksCurrent": [["1,236"]],
  "DATA_TILE.firstDownloadRunning": [["2026-10-15 16:02 CDT"]],
  "DATA_TILE.readError": [["The server answered 500"]],
  "DATA_TILE.name": [["Mostly yes", "1,233", "1,236", "2026-10-15 17:46 CDT", "2026-10-15"]],
  "DATA_TILE.firstDownloadName": [["2026-10-15 16:02 CDT"]],
  "NEEDS_YOU.heading": [[0], [3], [1236]],
  "NEEDS_YOU.readError": [["The server answered 500"]],
  "ITEMS.data_problems.title": [
    [["KO"], 1],
    [["KO", "TSLA"], 2],
    [["FBXX", "KO", "TSLA"], 3],
    [["FBXX", "KO", "TSLA"], 4],
    [["FBXX", "KO", "TSLA"], 1239],
  ],
  "ITEMS.data_problems.body": [[1], [3]],
  "ITEMS.data_problems.actionName": [[["KO"]], [["KO", "TSLA", "FBXX"]]],
  "ITEMS.download_not_complete.failedBody": [
    ["The provider refused the request", "2026-10-15 17:46 CDT"],
  ],
  "ITEMS.download_not_complete.interruptedBody": [["2026-10-15 17:46 CDT"]],
  "ITEMS.first_download.body": [
    [12, 1236],
    [0, 1],
    [5, null],
  ],
  "ITEMS.score_failed.body": [
    ["The engine stopped", "2026-10-15 17:30 CDT"],
    ["The engine stopped", null],
  ],
};

function walk(value: unknown, path: string, strings: string[], uncalled: string[]): void {
  if (typeof value === "string") {
    strings.push(value);
  } else if (typeof value === "function") {
    const calls = CALLS[path];
    if (calls === undefined) {
      uncalled.push(path);
      return;
    }
    for (const args of calls) {
      strings.push((value as (...a: unknown[]) => string)(...args));
    }
  } else if (typeof value === "object" && value !== null) {
    for (const [key, member] of Object.entries(value)) {
      walk(member, `${path}.${key}`, strings, uncalled);
    }
  }
}

describe("Home vocabulary (TC-COMP-134)", () => {
  // Implements TC-COMP-134
  const STATES: ReadonlyArray<readonly [string, ShellContextValue["attention"]]> = [
    ["loading", LOADING],
    ["ok", OK],
    ["ok without prices", OK_NO_PRICES],
    ["failed with last", FAILED_WITH_LAST],
    ["failed without last", FAILED_NO_LAST],
  ];

  describe.each([
    ["inside hours", INSIDE],
    ["outside hours", OUTSIDE],
  ])("%s", (_name, instant) => {
    it.each(STATES)(
      "the header in the %s state has none of the eight terms",
      (_state, attention) => {
        const { container } = renderAt(instant, attention);
        const texts = [container.textContent ?? ""];
        for (const element of container.querySelectorAll("[aria-label], [title], [alt]")) {
          for (const name of ["aria-label", "title", "alt"]) {
            const value = element.getAttribute(name);
            if (value !== null) {
              texts.push(value);
            }
          }
        }
        for (const text of texts) {
          expect(text).not.toMatch(TERMS);
        }
      },
    );
  });

  it("the catalogue has none of the eight terms, and the walk is not vacuous", () => {
    const strings: string[] = [];
    const uncalled: string[] = [];
    for (const [name, value] of Object.entries(copy)) {
      walk(value, name, strings, uncalled);
    }
    expect(uncalled).toEqual([]);
    expect(strings.length).toBeGreaterThanOrEqual(40);
    for (const text of strings) {
      expect(text).not.toMatch(TERMS);
    }
  });

  it("the scanner matches the terms and not their lookalikes", () => {
    for (const hit of ["Next run", "RUNS", "Provider Credential", "instrument", "Retired"]) {
      expect(hit).toMatch(TERMS);
    }
    for (const miss of ["running", "Downloads", "rerun", "instruments"]) {
      expect(miss).not.toMatch(TERMS);
    }
  });
});

describe("HomeHeader: freshness, failure, loading, tick and composition", () => {
  it("(a) shows checked from the read, not the client's clock (AC-25)", () => {
    renderAt(OUTSIDE, OK);
    expect(lineText()).toContain("checked 17:52:10 CDT");
    expect(lineText()).not.toContain("17:53:41");
  });

  it("(b) ages while the read fails, and the price date is a dash", () => {
    renderAt(OUTSIDE, FAILED_WITH_LAST);
    const line = screen.getByTestId("as-of-line");
    expect(lineText()).toContain("checked 17:40:05 CDT");
    expect(lineText()).toContain("prices current to");
    expect(lineText()).not.toContain("2026-10-14");
    const dash = line.querySelector('[aria-hidden="true"]');
    expect(dash?.textContent).toBe("—");
    expect(line.querySelector(".sr-only")?.textContent).toBe("not determinable");
  });

  it("(c) renders a dash for checked when the read never answered, and never a zero", () => {
    renderAt(OUTSIDE, FAILED_NO_LAST);
    const line = screen.getByTestId("as-of-line");
    expect(lineText()).toContain("checked");
    expect(line.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(line.querySelectorAll(".sr-only")).toHaveLength(2);
    for (const hidden of line.querySelectorAll(".sr-only")) {
      expect(hidden.textContent).toBe("not determinable");
    }
    expect(lineText()).not.toContain("0");
  });

  it("(d) says prices are not downloaded when there is no price date", () => {
    renderAt(OUTSIDE, OK_NO_PRICES);
    expect(lineText()).toBe("Market closed · prices not downloaded yet · checked 17:52:10 CDT");
  });

  it("(e) renders the heading and a hidden skeleton while loading", () => {
    const { container } = renderAt(OUTSIDE, LOADING);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId("home-as-of-skeleton")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByTestId("as-of-line")).toBeNull();
    expect(container.textContent).not.toContain("checked");
  });

  it("(f) recomputes the market state each minute, with no read", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderAt("2026-10-15T13:29:30Z", OK);
    expect(lineText()).toContain("Market closed");
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Market state not determinable")).toBeInTheDocument();
    expect(lineText()).not.toContain("Market closed");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(setTitleDetail).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("(f) rolls the date over at midnight in Chicago, with no read", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderAt("2026-10-16T04:59:30Z", OK);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Thursday, 2026-10-15");
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Friday, 2026-10-16");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(setTitleDetail).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("(g) stops its timer on unmount", () => {
    const { unmount } = renderAt(OUTSIDE, OK);
    const before = vi.getTimerCount();
    unmount();
    expect(vi.getTimerCount()).toBe(before - 1);
  });

  it("(h) is built from the shared pattern and theme tokens (AC-26)", () => {
    const { container } = renderAt(OUTSIDE, OK);
    const line = screen.getByTestId("as-of-line");
    expect(line.tagName).toBe("P");
    expect(line).toHaveClass("text-xs", "text-muted-foreground");
    const separators = [...line.children].filter(
      (child) => child.tagName === "SPAN" && child.classList.contains("inline-block"),
    );
    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator).toHaveClass("px-2");
      expect(separator.textContent?.trim()).toBe("·");
    }
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-xl");
    expect(container.querySelectorAll("[style]")).toHaveLength(0);
  });
});
