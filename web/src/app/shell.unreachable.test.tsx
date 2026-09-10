import { act, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiUnreachableError } from "../api/client";
import { Shell } from "./shell";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return { ...actual, fetchHealth: vi.fn() };
});

const { fetchHealth } = await import("../api/client");
const fetchHealthMock = vi.mocked(fetchHealth);

const DESIGNED_COPY =
  "FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.";

beforeEach(() => {
  fetchHealthMock.mockReset();
  fetchHealthMock.mockRejectedValue(new ApiUnreachableError("connect ECONNREFUSED 127.0.0.1:8000"));
});

afterEach(() => {
  vi.useRealTimers();
});

// AC-16, DAC-E1-15, DAC-E1-S5-3 and UX design section 2: when health does not
// answer, the shell replaces the main region on every route with the designed
// unreachable state, and the navigation rail stays rendered so the owner is
// not stranded.
describe("Shell — unreachable state replaces the main region on every route (AC-16, DAC-E1-15)", () => {
  for (const route of ["/coverage", "/instruments", "/runs", "/runs/run-123", "/settings"]) {
    it(`replaces the main region with the designed state on ${route}`, async () => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <Shell />
        </MemoryRouter>,
      );

      const main = screen.getByRole("main");
      const unreachable = await within(main).findByTestId("unreachable-state");
      expect(unreachable).toHaveTextContent(DESIGNED_COPY);
    });
  }

  it("keeps the navigation rail rendered so the owner is not stranded", async () => {
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    await within(screen.getByRole("main")).findByTestId("unreachable-state");

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    const items = within(nav).getAllByRole("link");
    expect(items).toHaveLength(4);
    expect(items.map((el) => el.textContent)).toEqual([
      "Coverage",
      "Instruments",
      "Runs",
      "Settings",
    ]);
  });

  it("keeps the status region rendered alongside the unreachable state", async () => {
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    await within(screen.getByRole("main")).findByTestId("unreachable-state");

    const region = screen.getByTestId("status-region");
    expect(screen.getByTestId("nav-rail")).toContainElement(region);
    expect(within(region).getByTestId("liveness-state")).toHaveAttribute(
      "data-liveness",
      "unreachable",
    );
  });

  it("does not render the routed screen content while the API is unreachable", async () => {
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    const main = screen.getByRole("main");
    await within(main).findByTestId("unreachable-state");
    // The routed placeholder for Coverage must be replaced, not merely
    // accompanied — UX design section 2 says "replaces the main region".
    expect(within(main).queryByText("Coverage")).toBeNull();
  });

  it("restores the routed screen once health answers again", async () => {
    fetchHealthMock.mockReset();
    fetchHealthMock
      .mockRejectedValueOnce(new ApiUnreachableError("connect ECONNREFUSED"))
      .mockResolvedValue({
        status: "ok",
        database: "reachable",
        credential_present: true,
        schema_version: 4,
        most_recent_run: null,
      });

    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    const main = screen.getByRole("main");
    await within(main).findByTestId("unreachable-state");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    await waitFor(() => expect(within(main).queryByTestId("unreachable-state")).toBeNull());
    expect(within(main).getByText("Coverage")).toBeInTheDocument();
  });
});
