import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

// TC-COMP-332 (DAC-E1-S4-4, WCAG 2.1 AA): keyboard traversal reaches every
// destination, and the active one is announced via `aria-current` or an
// equivalent accessible mechanism.
describe("Shell — keyboard accessibility (DAC-E1-S4-4)", () => {
  it("tabs through all four rail destinations in order", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const nav = screen.getByRole("navigation");
    const items = within(nav).getAllByRole("link");
    expect(items).toHaveLength(4);

    for (const item of items) {
      await user.tab();
      expect(item).toHaveFocus();
    }
  });

  it("exposes the active destination via aria-current", async () => {
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const nav = screen.getByRole("navigation");
    const activeItem = within(nav).getByText("Coverage").closest("a");
    expect(activeItem).toHaveAttribute("aria-current", "page");

    const inactiveItem = within(nav).getByText("Instruments").closest("a");
    expect(inactiveItem).not.toHaveAttribute("aria-current", "page");
  });
});
