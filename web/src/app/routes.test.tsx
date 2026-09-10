import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Shell } from "./shell";

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
