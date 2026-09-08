import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Shell } from "./shell";

// DAC-E1-12, UX design section 0: a fixed left rail, a main region, and a
// status-region slot pinned to the bottom of the rail. This asserts the DOM
// structure of the layout contract, not merely its content.
describe("Shell — layout contract (UX design section 0)", () => {
  it("renders a fixed left rail containing navigation and the status-region slot", () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );

    const rail = screen.getByTestId("nav-rail");
    const nav = screen.getByRole("navigation");
    const statusRegion = screen.getByTestId("status-region");

    expect(rail).toContainElement(nav);
    expect(rail).toContainElement(statusRegion);
  });

  it("renders a main region as a sibling of the rail, not nested inside it", () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );

    const rail = screen.getByTestId("nav-rail");
    const main = screen.getByRole("main");

    expect(rail).not.toContainElement(main);
  });

  it("pins the status-region slot to the bottom of the rail", () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );

    const rail = screen.getByTestId("nav-rail");
    const statusRegion = screen.getByTestId("status-region");

    // The status region must be the rail's last child so it renders pinned
    // to the bottom, after the four navigation destinations.
    expect(rail.lastElementChild).toBe(statusRegion);
  });
});
