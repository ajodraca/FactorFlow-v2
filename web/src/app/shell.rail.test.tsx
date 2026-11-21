import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Shell } from "./shell";

// T014 (a), DEC-0327: the delivered rail targets the new paths, so
// `aria-current="page"` stays on the current item (AC-25, STD-UI-24).
describe("Shell rail — interim retargets keep aria-current (T014 (a))", () => {
  it.each([
    ["/data/coverage", "Coverage"],
    ["/data/followed", "Instruments"],
    ["/data/downloads", "Runs"],
  ])("at %s the %s rail item is current and links to it", async (path, label) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Shell />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("liveness-state")).toHaveAttribute("data-liveness", "answering"),
    );
    const item = within(screen.getByRole("navigation")).getByText(label).closest("a");
    expect(item).toHaveAttribute("href", path);
    expect(item).toHaveAttribute("aria-current", "page");
  });
});
