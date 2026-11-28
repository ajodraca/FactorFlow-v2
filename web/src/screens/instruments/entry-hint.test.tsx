import { render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import InstrumentsScreen from "./index";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    listInstruments: vi.fn(),
    addInstruments: vi.fn(),
    retireInstrument: vi.fn(),
    getHistoryDepth: vi.fn(),
  };
});

const POPULATED = {
  rows: [
    { instrumentId: 1, symbol: "AAPL", lifecycle: "active" as const },
    { instrumentId: 2, symbol: "MSFT", lifecycle: "retired" as const },
  ],
  activeCount: 1,
  retiredCount: 1,
  nextCursor: null,
};

function LocationProbe() {
  return <output data-testid="location-state">{JSON.stringify(useLocation().state)}</output>;
}

type Entries = NonNullable<Parameters<typeof createMemoryRouter>[1]>["initialEntries"];

function makeRouter(initialEntries: Entries) {
  return createMemoryRouter(
    [
      {
        path: "/data/followed",
        element: (
          <>
            <InstrumentsScreen />
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries },
  );
}

const ADD_FIELD = { name: "Symbol of the stock to follow" };

// Implements TC-COMP-198
// Opened with `{ focusAdd: true }` in router state (sent by Data health's
// *Follow a different symbol*), the screen focuses its add field on mount, and a
// reload of the same history entry does not focus it again (DAC-E7-S3-1,
// DAC-E7-6, AC-14). Every case waits for the populated table, so the delivered
// never-populated autofocus cannot mask a failure.
describe("Followed stocks — the focusAdd entry hint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.listInstruments).mockResolvedValue(POPULATED);
    vi.mocked(client.getHistoryDepth).mockResolvedValue({ years: 5, updatedAt: null });
  });

  it("focuses the add field when opened with focusAdd, and consumes the hint", async () => {
    const router = makeRouter([{ pathname: "/data/followed", state: { focusAdd: true } }]);
    render(<RouterProvider router={router} />);

    await waitFor(() => expect(screen.getByRole("textbox", ADD_FIELD)).toHaveFocus());
    await screen.findByRole("table");
    await waitFor(() => expect(screen.getByTestId("location-state")).toHaveTextContent("null"));
    expect(router.state.location.state).toBeNull();
    // Replaced, not pushed: Back must not return to the entry that carries the hint.
    expect(router.state.historyAction).toBe("REPLACE");
    expect(screen.getByRole("textbox", ADD_FIELD)).toHaveFocus();
  });

  it("does not focus the add field when the same history entry is reloaded", async () => {
    const first = makeRouter([{ pathname: "/data/followed", state: { focusAdd: true } }]);
    const { unmount } = render(<RouterProvider router={first} />);
    await waitFor(() => expect(screen.getByTestId("location-state")).toHaveTextContent("null"));
    const consumed = first.state.location;
    unmount();

    const reloaded = makeRouter([consumed]);
    render(<RouterProvider router={reloaded} />);
    await screen.findByRole("table");

    expect(document.activeElement).toBe(document.body);
  });

  it("leaves focus alone when opened with no state", async () => {
    render(<RouterProvider router={makeRouter(["/data/followed"])} />);
    await screen.findByRole("table");

    expect(document.activeElement).toBe(document.body);
  });

  it("leaves focus alone when focusAdd is false", async () => {
    const router = makeRouter([{ pathname: "/data/followed", state: { focusAdd: false } }]);
    render(<RouterProvider router={router} />);
    await screen.findByRole("table");

    expect(document.activeElement).toBe(document.body);
  });
});
