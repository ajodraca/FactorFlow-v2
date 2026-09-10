import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HealthResponse } from "../api/types";
import { Shell } from "./shell";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return { ...actual, fetchHealth: vi.fn() };
});

const { fetchHealth } = await import("../api/client");
const fetchHealthMock = vi.mocked(fetchHealth);

function answering(): HealthResponse {
  return {
    status: "ok",
    database: "reachable",
    credential_present: true,
    schema_version: 4,
    most_recent_run: null,
  };
}

beforeEach(() => {
  fetchHealthMock.mockReset();
  fetchHealthMock.mockResolvedValue(answering());
});

afterEach(() => {
  vi.useRealTimers();
});

// DAC-E1-13, AC-18: the region must appear on *every* screen. Testing the
// region in isolation (status-region.test.tsx) proves it works; this proves
// it is mounted where the criterion requires.
describe("Shell — the status region is mounted on every destination (DAC-E1-13, AC-18)", () => {
  it("renders the region inside the rail on the initial route", async () => {
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    const rail = screen.getByTestId("nav-rail");
    const region = await screen.findByTestId("status-region");
    expect(rail).toContainElement(region);
    expect(within(region).getByTestId("liveness-state")).toBeInTheDocument();
  });

  it("keeps the region rendered while the owner navigates all four destinations", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    await screen.findByTestId("liveness-state");

    for (const label of ["Instruments", "Runs", "Settings", "Coverage"]) {
      const nav = screen.getByRole("navigation");
      await user.click(within(nav).getByText(label));

      const region = screen.getByTestId("status-region");
      expect(screen.getByTestId("nav-rail")).toContainElement(region);
      await waitFor(() =>
        expect(within(region).getByTestId("liveness-state")).toHaveAttribute(
          "data-liveness",
          "answering",
        ),
      );
    }
  });

  it("does not remount the region across navigation, so its poll cadence is not reset", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    await waitFor(() => expect(fetchHealthMock).toHaveBeenCalledTimes(1));

    const nav = screen.getByRole("navigation");
    await user.click(within(nav).getByText("Runs"));
    await user.click(within(nav).getByText("Settings"));

    // The region lives in the rail, outside the routed main region, so
    // navigating between destinations does not re-mount it and does not
    // trigger a fresh mount-time fetch.
    expect(fetchHealthMock).toHaveBeenCalledTimes(1);
  });
});
