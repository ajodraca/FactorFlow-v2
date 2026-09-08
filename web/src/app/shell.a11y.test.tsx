import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Shell } from "./shell";

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

    const nav = screen.getByRole("navigation");
    const items = within(nav).getAllByRole("link");
    expect(items).toHaveLength(4);

    for (const item of items) {
      await user.tab();
      expect(item).toHaveFocus();
    }
  });

  it("exposes the active destination via aria-current", () => {
    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation");
    const activeItem = within(nav).getByText("Coverage").closest("a");
    expect(activeItem).toHaveAttribute("aria-current", "page");

    const inactiveItem = within(nav).getByText("Instruments").closest("a");
    expect(inactiveItem).not.toHaveAttribute("aria-current", "page");
  });
});
