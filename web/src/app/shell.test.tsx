import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Shell } from "./shell";

// TC-COMP-014 (partial — shell has no auth-implying element), TC-COMP-303,
// AC-14: the shell contains no sign-in, user menu, or account area, because
// no principal is assumed anywhere (loopback with no authentication).
describe("Shell — no principal is assumed (AC-14)", () => {
  it("renders no element matching sign-in, account, or user-menu semantics", () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );

    const forbidden = /sign.?in|log.?in|account|user.?menu|profile/i;

    for (const el of screen.queryAllByRole("button")) {
      expect(el.textContent ?? "").not.toMatch(forbidden);
      expect(el.getAttribute("aria-label") ?? "").not.toMatch(forbidden);
    }
    for (const el of screen.queryAllByRole("link")) {
      expect(el.textContent ?? "").not.toMatch(forbidden);
      expect(el.getAttribute("aria-label") ?? "").not.toMatch(forbidden);
    }
    expect(screen.queryByTestId(/sign-in|account|user-menu/i)).toBeNull();
  });
});

// TC-COMP-303, TC-COMP-329: the rail presents exactly four destinations, in
// order, using the exact product vocabulary (STD-UI-1) — not synonyms.
describe("Shell — navigation rail destinations (DAC-E1-12, DAC-E1-S4-1)", () => {
  it("renders exactly four navigation items in order with exact labels", () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation");
    const items = within(nav).getAllByRole("link");

    expect(items).toHaveLength(4);
    expect(items.map((el) => el.textContent)).toEqual([
      "Coverage",
      "Instruments",
      "Runs",
      "Settings",
    ]);
  });

  it("uses no generic or forbidden vocabulary in place of product terms", () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation");
    const text = nav.textContent ?? "";
    for (const forbidden of ["Jobs", "Sync", "Import"]) {
      expect(text).not.toContain(forbidden);
    }
  });
});
