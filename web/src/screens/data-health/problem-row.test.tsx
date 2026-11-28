import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startAcquisitionRun } from "../../api/client";
import type { DataType } from "../../api/types";
import type { Failure, ProblemRow as ProblemRowData } from "../../app/shell-types";
import {
  downloadFailed,
  followDifferentName,
  lastCompleteDownload,
  needsFixingTitle,
  showingOf,
  stopFollowingName,
  symbolLinkName,
} from "./copy";
import { ProblemRow } from "./problem-row";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, startAcquisitionRun: vi.fn() };
});

const fetchSpy = vi.fn();

beforeEach(() => {
  vi.mocked(startAcquisitionRun).mockReset();
  fetchSpy.mockReset();
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  expect(fetchSpy).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

function FAIL(
  dataType: DataType,
  reason: string | null = "provider timeout",
  attempts = 3,
): Failure {
  return {
    data_type: dataType,
    outcome: "failed",
    reason,
    attempts,
    completed_at: "2026-10-30T18:20:00Z",
    run_id: "r-7",
  };
}

function NF(dataType: DataType): Failure {
  return {
    data_type: dataType,
    outcome: "not_found",
    reason: "no such ticker",
    attempts: 1,
    completed_at: "2026-10-30T18:20:00Z",
    run_id: "r-7",
  };
}

function ROW(symbol: string, failures: Failure[], retryable: boolean): ProblemRowData {
  return { symbol, failures, retryable };
}

function LocationProbe(): JSX.Element {
  const location = useLocation();
  return (
    <div data-testid="location">
      {JSON.stringify({ path: location.pathname + location.search, state: location.state })}
    </div>
  );
}

function renderRow(row: ProblemRowData, onStopFollowing: (symbol: string) => void = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={["/data"]}>
      <Routes>
        <Route
          path="/data"
          element={
            <ul>
              <ProblemRow row={row} onStopFollowing={onStopFollowing} />
            </ul>
          }
        />
        <Route path="*" element={<div>elsewhere</div>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

const FAILED_FIX =
  "Download again to retry; data already stored is never duplicated or overwritten.";
const NOT_FOUND_FIX = "Probably a typo or a delisted ticker. Downloading again won't help.";
const NOT_RECOGNISED = "The provider doesn't recognise this symbol.";
const CONSEQUENCE =
  "Its scores show as Incomplete until this is fixed, and so does every universe holding it.";

/** The rows only, never the location probe beside them. */
function rowText(container: HTMLElement): string {
  return container.querySelector("ul")?.textContent ?? "";
}

function badges(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-variant^="status-"]'));
}

// Implements TC-COMP-165
describe("Problem row (TC-COMP-165, DAC-E6-S3-1, DAC-E6-8, AC-13, AC-14)", () => {
  it("renders the symbol, both badges, both fixes and the consequence for a mixed row", async () => {
    const stop = vi.fn();
    const { container } = renderRow(ROW("FBXX", [FAIL("prices"), NF("reference")], true), stop);

    expect(container.querySelectorAll("li")).toHaveLength(1);
    const symbol = screen.getByRole("link", { name: "FBXX, show in the coverage table" });
    expect(symbol).toHaveTextContent(/^FBXX$/);
    expect(symbol.className).toContain("font-semibold");
    expect(symbol).toHaveAttribute("href", "/data/coverage?symbol=FBXX");

    const found = badges(container);
    expect(found.map((b) => [b.getAttribute("data-variant"), b.textContent])).toEqual([
      ["status-critical", "Failed"],
      ["status-warning", "Not found"],
    ]);

    const text = rowText(container);
    expect(text).toContain("Downloading daily prices failed: provider timeout, 3 attempts");
    expect(text).toContain(NOT_RECOGNISED);
    expect(text).not.toContain("no such ticker");
    expect(text).not.toContain("1 attempts");

    const consequence = screen.getAllByText(CONSEQUENCE);
    expect(consequence).toHaveLength(1);
    expect(consequence[0]?.className).toContain("text-xs");

    expect(screen.getAllByText(FAILED_FIX)).toHaveLength(1);
    expect(screen.getAllByText(NOT_FOUND_FIX)).toHaveLength(1);

    const stopButton = screen.getByRole("button", { name: "Stop following FBXX" });
    expect(stopButton).toHaveTextContent(/^Stop following$/);
    expect(stopButton).toHaveAttribute("data-variant", "ghost");
    const follow = screen.getByRole("link", { name: "Follow a different symbol than FBXX" });
    expect(follow).toHaveTextContent(/^Follow a different symbol$/);
    expect(follow).toHaveAttribute("data-variant", "outline");

    expect(screen.queryByRole("button", { name: /download/i })).toBeNull();
    const user = userEvent.setup();
    await user.click(follow);
    expect(vi.mocked(startAcquisitionRun)).not.toHaveBeenCalled();
    expect(stop).not.toHaveBeenCalled();
  });

  it("chooses each fix from the failures' outcomes, not from the served retryable flag", () => {
    const failedOnly = renderRow(ROW("KO", [FAIL("prices")], false));
    expect(screen.getAllByText(FAILED_FIX)).toHaveLength(1);
    failedOnly.unmount();
    renderRow(ROW("ZZZZ", [NF("reference")], true));
    expect(screen.queryByText(FAILED_FIX)).toBeNull();
    expect(screen.getAllByText(NOT_FOUND_FIX)).toHaveLength(1);
  });

  it("names the consequence on a row with only not-found failures", () => {
    renderRow(ROW("ZZZZ", [NF("reference")], false));
    const consequence = screen.getAllByText(CONSEQUENCE);
    expect(consequence).toHaveLength(1);
    expect(consequence[0]?.className).toContain("text-xs");
  });

  it("never starts a download from the row's own controls", async () => {
    const stop = vi.fn();
    renderRow(ROW("FBXX", [FAIL("prices"), NF("reference")], true), stop);
    const user = userEvent.setup();
    await user.click(screen.getByRole("link", { name: "FBXX, show in the coverage table" }));
    expect(vi.mocked(startAcquisitionRun)).not.toHaveBeenCalled();
  });

  it.each([
    ["prices", "Downloading daily prices failed"],
    ["fundamentals", "Downloading company financials failed"],
    ["corporate_actions", "Downloading corporate actions failed"],
    ["reference", "Downloading reference data failed"],
  ] as const)("words the %s download as %s", (dataType, words) => {
    const { container } = renderRow(ROW("KO", [FAIL(dataType)], true));
    expect(rowText(container)).toContain(`${words}: provider timeout, 3 attempts`);
  });

  it("shows the download-again sentence once for a row with only failed downloads", () => {
    const { container } = renderRow(
      ROW("KO", [FAIL("prices"), FAIL("fundamentals", "rate limited", 5)], true),
    );
    expect(badges(container).map((b) => b.getAttribute("data-variant"))).toEqual([
      "status-critical",
      "status-critical",
    ]);
    expect(rowText(container)).toContain(
      "Downloading company financials failed: rate limited, 5 attempts",
    );
    expect(screen.getAllByText(FAILED_FIX)).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /stop following/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /follow a different symbol/i })).toBeNull();
  });

  it("offers the not-found controls and no download-again sentence for a not-found row", () => {
    renderRow(ROW("ZZZZ", [NF("reference")], false));
    expect(screen.queryByText(FAILED_FIX)).toBeNull();
    expect(screen.getByRole("button", { name: "Stop following ZZZZ" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Follow a different symbol than ZZZZ" }),
    ).toBeInTheDocument();
    expect(screen.getByText(NOT_FOUND_FIX)).toBeInTheDocument();
    expect(screen.getByText(NOT_RECOGNISED)).toBeInTheDocument();
  });

  it("says no reason was recorded for a null reason", () => {
    const { container } = renderRow(ROW("KO", [FAIL("prices", null, 2)], true));
    expect(rowText(container)).toContain(
      "Downloading daily prices failed: no reason was recorded, 2 attempts",
    );
    expect(rowText(container)).not.toContain("null");
    expect(rowText(container)).not.toContain("undefined");
  });

  it("calls onStopFollowing with the symbol and nothing else", async () => {
    const stop = vi.fn();
    renderRow(ROW("FBXX", [NF("reference")], false), stop);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Stop following FBXX" }));
    expect(stop).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledWith("FBXX");
  });

  it("encodes the symbol in the coverage link", () => {
    renderRow(ROW("A&B/C", [FAIL("prices")], true));
    expect(screen.getByRole("link", { name: "A&B/C, show in the coverage table" })).toHaveAttribute(
      "href",
      "/data/coverage?symbol=A%26B%2FC",
    );
  });

  it("serves the attempts value unchanged, whatever it is (DAC-E6-S3-6)", () => {
    const { container } = renderRow(ROW("KO", [FAIL("prices", "[unavailable] gone", 1)], true));
    expect(rowText(container)).toContain(
      "Downloading daily prices failed: [unavailable] gone, 1 attempts",
    );
  });
});

// Implements TC-COMP-153
describe("Follow a different symbol (TC-COMP-153, DAC-E6-13, AC-14)", () => {
  function renderFollow() {
    return render(
      <MemoryRouter initialEntries={["/data"]}>
        <Routes>
          <Route
            path="/data"
            element={
              <ul>
                <ProblemRow row={ROW("FBXX", [NF("reference")], false)} onStopFollowing={vi.fn()} />
              </ul>
            }
          />
          <Route path="/data/followed" element={<div>followed page</div>} />
          <Route path="/data/coverage" element={<div>coverage page</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    );
  }

  it("navigates to Followed stocks with focusAdd in the router state", async () => {
    renderFollow();
    const user = userEvent.setup();
    await user.click(screen.getByRole("link", { name: "Follow a different symbol than FBXX" }));
    expect(JSON.parse(screen.getByTestId("location").textContent ?? "")).toEqual({
      path: "/data/followed",
      state: { focusAdd: true },
    });
    expect(screen.getByText("followed page")).toBeInTheDocument();
  });

  it("sends the symbol link to the coverage table with no router state", async () => {
    renderFollow();
    const user = userEvent.setup();
    await user.click(screen.getByRole("link", { name: "FBXX, show in the coverage table" }));
    expect(JSON.parse(screen.getByTestId("location").textContent ?? "")).toEqual({
      path: "/data/coverage?symbol=FBXX",
      state: null,
    });
  });
});

// Implements TC-COMP-167
describe("Provider reason is text (TC-COMP-167, DAC-E6-S3-3, AC-24)", () => {
  it("renders markup in a reason as text", () => {
    const reason = "<img src=x onerror=alert(1)><b>bold</b>";
    const { container } = renderRow(ROW("FBXX", [FAIL("prices", reason, 3)], true));
    expect(rowText(container)).toContain(`Downloading daily prices failed: ${reason}, 3 attempts`);
    expect(container.querySelector("img, b, script")).toBeNull();
  });

  it("shows a leading kind and a request_id inside the reason verbatim and nothing beyond it", () => {
    const reason = "[unavailable] gateway said no request_id=abc123";
    const { container } = renderRow(ROW("FBXX", [FAIL("prices", reason, 1)], true));
    expect(rowText(container)).toContain(`failed: ${reason}, 1 attempts`);
    expect(rowText(container).match(/request_id/g)).toHaveLength(1);
  });
});

// Implements TC-COMP-169
describe("Outcome badges (TC-COMP-169, DAC-E6-S3-5, AC-20)", () => {
  it("renders each badge through StatusBadge with its words, a hidden shape and no aria-label", () => {
    const { container } = renderRow(ROW("FBXX", [FAIL("prices"), NF("reference")], true));
    const found = badges(container);
    expect(found).toHaveLength(2);
    expect(found.map((b) => b.textContent)).toEqual(["Failed", "Not found"]);
    for (const badge of found) {
      expect(badge.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(badge).not.toHaveAttribute("aria-label");
    }
    const shapes = found.map((b) => b.querySelector("svg")?.outerHTML);
    expect(shapes[0]).not.toEqual(shapes[1]);
    expect(container.querySelector('[data-variant="coverage-unknown"]')).toBeNull();
  });
});

describe("copy.ts, Needs fixing strings (DEC-0382, -4)", () => {
  it("formats the card title with a thousands separator", () => {
    expect(needsFixingTitle(1236)).toBe("Needs fixing · 1,236");
    expect(needsFixingTitle(0)).toBe("Needs fixing · 0");
  });

  it("formats the what-failed line", () => {
    expect(downloadFailed("corporate_actions", "x", 1234)).toBe(
      "Downloading corporate actions failed: x, 1,234 attempts",
    );
    expect(downloadFailed("corporate_actions", null, 1234)).toBe(
      "Downloading corporate actions failed: no reason was recorded, 1,234 attempts",
    );
  });

  it("formats the count announcement and the last complete download", () => {
    expect(showingOf(100, 1236)).toBe("Showing 100 of 1,236 stocks");
    expect(showingOf(1100, 1236)).toBe("Showing 1,100 of 1,236 stocks");
    expect(lastCompleteDownload("2026-10-29 09:00 CDT")).toBe(
      "Last complete download 2026-10-29 09:00 CDT",
    );
  });

  it("names each row action after its symbol", () => {
    expect(stopFollowingName("FBXX")).toBe("Stop following FBXX");
    expect(followDifferentName("FBXX")).toBe("Follow a different symbol than FBXX");
    expect(symbolLinkName("FBXX")).toBe("FBXX, show in the coverage table");
  });
});
