import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Shell } from "./shell";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    listInstruments: vi.fn().mockResolvedValue({
      rows: [],
      activeCount: 0,
      retiredCount: 0,
      nextCursor: null,
    }),
    getHistoryDepth: vi.fn().mockResolvedValue({ years: null, updatedAt: null }),
    listAcquisitionRuns: vi.fn().mockResolvedValue({ runs: [], nextCursor: null }),
    getAcquisitionRun: vi.fn().mockResolvedValue({
      run: {
        runId: "run-123",
        state: "succeeded",
        historyDepthYears: 5,
        requestedAt: "2026-09-06T14:00:00Z",
        startedAt: "2026-09-06T14:00:05Z",
        endedAt: "2026-09-06T14:30:00Z",
        instrumentsNamed: 0,
        instrumentsWritten: 0,
        instrumentsFailed: 0,
        failureReason: null,
      },
      counts: {
        instrumentsNamed: 0,
        instrumentsWritten: 0,
        instrumentsFailed: 0,
        resultsByOutcome: { written: 0, unchanged: 0, notFound: 0, failed: 0, skipped: 0 },
      },
      results: [],
      nextCursor: null,
    }),
  };
});

/**
 * Waits for the shell's health poll to settle.
 *
 * `Shell` polls `GET /api/health` on mount (CAP-001-E1-S5), and the state
 * update that follows lands after a synchronous test body returns. Awaiting
 * it keeps the update inside the test's `act(...)` scope rather than leaving
 * React to warn about one that escaped it.
 */
async function settleHealthPoll(): Promise<void> {
  await waitFor(() =>
    expect(screen.getByTestId("liveness-state")).toHaveAttribute("data-liveness", "answering"),
  );
}

// TC-COMP-330 (DAC-E1-S4-2): opening a run detail route renders it as a
// child of Runs, and Runs stays the active rail item — no fifth destination
// appears.
describe("Routes — run detail is a child of Runs (DAC-E1-S4-2)", () => {
  it("keeps Runs active and adds no fifth rail item when a run detail route opens", async () => {
    render(
      <MemoryRouter initialEntries={["/runs/run-123"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const nav = screen.getByRole("navigation");
    const items = within(nav).getAllByRole("link");
    expect(items).toHaveLength(4);

    const runsItem = within(nav).getByText("Runs").closest("a");
    expect(runsItem).toHaveAttribute("aria-current", "page");
  });
});

// TC-COMP-333 (DAC-E1-S4-5): an unknown route renders a not-found state
// inside the shell's frame — no empty page, no crash, and the rail/status
// region remain present.
describe("Routes — unknown route renders not-found inside the frame (DAC-E1-S4-5)", () => {
  it("renders a not-found state in the main region while keeping the shell frame", async () => {
    render(
      <MemoryRouter initialEntries={["/this-route-does-not-exist"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("status-region")).toBeInTheDocument();

    const main = screen.getByRole("main");
    expect(within(main).getByText(/not found/i)).toBeInTheDocument();
  });
});

// Declares exactly the five routes this story owns: four destinations plus
// one run-detail child route, and no additional top-level route.
describe("Routes — declares exactly five routes", () => {
  it("routes.tsx defines four destination routes plus one run-detail child route", () => {
    const routesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "routes.tsx");
    const source = readFileSync(routesPath, "utf-8");
    const pathMatches = [...source.matchAll(/path=["']([^"']+)["']/g)].map((m) => m[1]);

    // Exactly the five routes this story owns: the four destinations plus
    // the run-detail child route. A redirect from "/" and a "*" not-found
    // catch-all are routing infrastructure, not destinations, and are
    // excluded from the count.
    const storyOwnedRoutes = pathMatches.filter((p) => p !== "/" && p !== "*");
    expect(storyOwnedRoutes).toHaveLength(5);
    expect(storyOwnedRoutes.sort()).toEqual(
      ["/coverage", "/instruments", "/runs", "/runs/:runId", "/settings"].sort(),
    );
  });
});

// T010 (CAP-001-E5-S6): the real Runs screen replaces the placeholder at
// /runs inside the shell, with Runs the active rail item (DAC-E5-S6-4).
describe("Routes — Runs renders its real screen inside the shell (CAP-001-E5-S6)", () => {
  it("renders the Runs screen, not the placeholder, with Runs active", async () => {
    render(
      <MemoryRouter initialEntries={["/runs"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const main = screen.getByRole("main");
    expect(
      await within(main).findByRole("heading", { level: 1, name: "Runs" }),
    ).toBeInTheDocument();
    expect(
      await within(main).findByText("No acquisition run has been requested yet."),
    ).toBeInTheDocument();

    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Runs").closest("a")).toHaveAttribute("aria-current", "page");
  });
});

// T030 (CAP-001-E2-S4): both screens render their real content inside the
// CAP-001-E1-S4 shell at their routed destinations, and navigating between
// them preserves the shell's active-rail-item state.
describe("Routes — Instruments and Settings render inside the shell (T030)", () => {
  it("renders the real Instruments screen, not a placeholder, with Instruments active", async () => {
    render(
      <MemoryRouter initialEntries={["/instruments"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const main = screen.getByRole("main");
    expect(within(main).getByRole("heading", { name: "Instruments" })).toBeInTheDocument();
    expect(within(main).getByRole("textbox", { name: /instrument symbol/i })).toBeInTheDocument();

    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Instruments").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navigating to Settings renders its real screen and moves the active rail item", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/instruments"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const nav = screen.getByRole("navigation");
    await user.click(within(nav).getByText("Settings"));

    const main = screen.getByRole("main");
    expect(await within(main).findByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(within(nav).getByText("Settings").closest("a")).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByText("Instruments").closest("a")).not.toHaveAttribute("aria-current");
  });
});

// CAP-001-E7-S4 T014 (AC-10; DAC-E1-S4-2): the real Run detail screen
// replaces the placeholder at /runs/:runId inside the shell.
describe("Routes — Run detail renders its real screen inside the shell (CAP-001-E7-S4)", () => {
  it("renders the run-detail heading, not the placeholder, with Runs active", async () => {
    render(
      <MemoryRouter initialEntries={["/runs/run-123"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const main = screen.getByRole("main");
    expect(
      await within(main).findByRole("heading", { level: 1, name: "Run run-123" }),
    ).toBeInTheDocument();
    expect(within(main).queryByText("Run detail")).not.toBeInTheDocument();

    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Runs").closest("a")).toHaveAttribute("aria-current", "page");
  });
});
