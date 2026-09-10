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

// TC-COMP-014 (partial — shell has no auth-implying element), TC-COMP-303,
// AC-14: the shell contains no sign-in, user menu, or account area, because
// no principal is assumed anywhere (loopback with no authentication).
describe("Shell — no principal is assumed (AC-14)", () => {
  it("renders no element matching sign-in, account, or user-menu semantics", async () => {
    const { container } = render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

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

    // AC-14 says the shell contains no sign-in, user menu, or account
    // *area* — not merely no button or link carrying that semantics. A
    // static label ("Account", "Signed in as owner") or a non-interactive
    // menu region would satisfy the checks above while violating the
    // criterion, so also scan the whole rendered tree's text content and
    // every accessible name in its accessibility tree.
    expect(container.textContent ?? "").not.toMatch(forbidden);
    for (const el of container.querySelectorAll<HTMLElement>("[role], [aria-label]")) {
      expect(el.getAttribute("aria-label") ?? "").not.toMatch(forbidden);
    }
  });
});

// TC-COMP-303, TC-COMP-329: the rail presents exactly four destinations, in
// order, using the exact product vocabulary (STD-UI-1) — not synonyms.
describe("Shell — navigation rail destinations (DAC-E1-12, DAC-E1-S4-1)", () => {
  it("renders exactly four navigation items in order with exact labels", async () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

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

  it("uses no generic or forbidden vocabulary in place of product terms", async () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );
    await settleHealthPoll();

    const nav = screen.getByRole("navigation");
    const text = nav.textContent ?? "";
    for (const forbidden of ["Jobs", "Sync", "Import"]) {
      expect(text).not.toContain(forbidden);
    }
  });
});
