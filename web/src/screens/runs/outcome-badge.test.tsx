import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RunState } from "../../api/types";
import { OutcomeBadge } from "./outcome-badge";

const EXPECTED: [RunState, string, string][] = [
  ["requested", "status-neutral", "Requested"],
  ["running", "status-active", "Running"],
  ["cancelling", "status-warning", "Cancelling"],
  ["succeeded", "status-good", "Succeeded"],
  ["partial", "status-warning", "Partial"],
  ["failed", "status-critical", "Failed"],
  ["cancelled", "status-neutral", "Cancelled"],
  ["abandoned", "status-serious", "Abandoned"],
];

function badgeFor(state: RunState): HTMLElement {
  const { unmount } = render(<OutcomeBadge state={state} />);
  const badge = screen.getByTestId("outcome-badge");
  const snapshot = badge.cloneNode(true) as HTMLElement;
  unmount();
  return snapshot;
}

// Implements TC-COMP-251
// Implements TC-COMP-286
// Implements TC-COMP-009
describe("OutcomeBadge — STD-UI-12 tier mapping (DAC-E5-16, DAC-E5-S6-2, AC-9)", () => {
  it.each(EXPECTED)("renders %s as %s with the word %s", (state, variant, word) => {
    render(<OutcomeBadge state={state} />);
    const badge = screen.getByTestId("outcome-badge");
    expect(badge).toHaveAttribute("data-variant", variant);
    expect(badge).toHaveTextContent(word);
  });

  it.each(EXPECTED)("gives %s an aria-hidden icon named after its tier", (state, variant) => {
    render(<OutcomeBadge state={state} />);
    const icon = screen.getByTestId("outcome-badge").querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("data-icon", variant.replace("status-", ""));
  });

  it("draws a different shape for each of the six tiers, so they read in greyscale (STD-UI-8)", () => {
    const shapeByTier = new Map<string, string>();
    for (const [state] of EXPECTED) {
      const icon = badgeFor(state).querySelector("svg") as SVGElement;
      shapeByTier.set(icon.getAttribute("data-icon") as string, icon.innerHTML);
    }
    expect(shapeByTier.size).toBe(6);
    expect(new Set(shapeByTier.values()).size).toBe(6);
  });

  it("never renders partial as good (AC-9)", () => {
    expect(badgeFor("partial").getAttribute("data-variant")).not.toBe("status-good");
    expect(badgeFor("partial")).not.toHaveTextContent("Succeeded");
  });

  it("never renders cancelled as critical", () => {
    expect(badgeFor("cancelled").getAttribute("data-variant")).not.toBe("status-critical");
  });

  it("keeps abandoned distinct from both failed and cancelled (DAC-E5-16)", () => {
    const abandoned = badgeFor("abandoned").getAttribute("data-variant");
    expect(abandoned).not.toBe(badgeFor("failed").getAttribute("data-variant"));
    expect(abandoned).not.toBe(badgeFor("cancelled").getAttribute("data-variant"));
  });

  it("shows the outcome as recorded, never upgraded", () => {
    for (const [state, , word] of EXPECTED) {
      expect(badgeFor(state)).toHaveTextContent(new RegExp(`^${word}$`));
    }
  });
});
