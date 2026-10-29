import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FactorName } from "../../api/classification-types";
import { CELL } from "../../screens/research/copy";
import { RestatedMark } from "./restated-mark";

/** The words assistive technology reads: the text with `aria-hidden` descendants dropped. */
function accessibleText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll("[aria-hidden='true']")) {
    hidden.remove();
  }
  return (clone.textContent ?? "").trim();
}

function renderMark(factor: FactorName): HTMLElement | null {
  const { container } = render(<RestatedMark factor={factor} />);
  return container.firstElementChild as HTMLElement | null;
}

// Implements TC-COMP-097 (mark half): DAC-E4-S3-3, DEC-0075.
describe("TC-COMP-097: the Possibly restated mark on value and growth only", () => {
  it.each<FactorName>(["value", "growth"])(
    "reads Possibly restated as its text on %s, with the R glyph aria-hidden",
    (factor) => {
      const mark = renderMark(factor);
      expect(mark).not.toBeNull();
      const element = mark as HTMLElement;
      expect(accessibleText(element)).toBe("Possibly restated");
      expect(accessibleText(element)).toBe(CELL.possiblyRestated);
      const glyph = element.querySelector("[aria-hidden='true']");
      expect(glyph).not.toBeNull();
      expect(glyph?.textContent).toBe("R");
      const words = Array.from(element.querySelectorAll("*")).find(
        (child) => child.textContent === "Possibly restated",
      );
      expect(words).toBeDefined();
      expect(words).toHaveClass("sr-only");
      expect(words).not.toBe(glyph);
      expect(words).not.toHaveAttribute("aria-hidden");
    },
  );

  it.each<FactorName>(["value", "growth"])("carries the status-neutral tokens on %s", (factor) => {
    const mark = renderMark(factor) as HTMLElement;
    expect(mark).toHaveClass("bg-status-neutral-muted");
    expect(mark).toHaveClass("text-status-neutral");
  });

  it("renders nothing on momentum", () => {
    const { container } = render(<RestatedMark factor="momentum" />);
    expect(container.innerHTML).toBe("");
    expect(container.textContent).toBe("");
  });

  it("is a composition, not a badge, and overrides no accessible name", () => {
    const mark = renderMark("value") as HTMLElement;
    for (const element of [mark, ...mark.querySelectorAll("*")]) {
      expect(element).not.toHaveAttribute("role");
      expect(element).not.toHaveAttribute("aria-label");
      expect(element).not.toHaveAttribute("aria-labelledby");
      expect(element).not.toHaveAttribute("title");
      expect(element).not.toHaveAttribute("tabindex");
      expect(element).not.toHaveAttribute("data-variant");
    }
    expect(mark.tagName).toBe("SPAN");
    expect(mark.querySelector("button, a, input")).toBeNull();
  });
});
