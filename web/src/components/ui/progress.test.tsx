import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress";

function indicatorOf(bar: HTMLElement): HTMLElement {
  const node = bar.firstElementChild;
  if (!(node instanceof HTMLElement)) throw new Error("no indicator rendered");
  return node;
}

// Implements TC-COMP-014
describe("progress indeterminate has no valuenow; determinate exposes range (DAC-E1-S3-3, DAC-E1-14, AC-25)", () => {
  it("determinate exposes now, min and max and is labelled by its visible text", () => {
    render(
      <>
        <p id="p1">812 of 1,236 stocks</p>
        <Progress value={812} max={1236} aria-labelledby="p1" />
      </>,
    );
    const bar = screen.getByRole("progressbar", { name: "812 of 1,236 stocks" });
    expect(bar).toHaveAttribute("aria-valuenow", "812");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "1236");
    expect(bar).toHaveAttribute("data-variant", "determinate");
  });

  it("indeterminate carries no aria-valuenow", () => {
    render(
      <>
        <p id="p1">Counting stocks</p>
        <Progress value={null} aria-labelledby="p1" />
      </>,
    );
    const bar = screen.getByRole("progressbar", { name: "Counting stocks" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
    expect(bar).toHaveAttribute("data-variant", "indeterminate");
  });

  it("is indeterminate when a caller passes a null total", () => {
    render(
      <>
        <p id="p1">Waiting for the download to start</p>
        <Progress value={0} max={null} aria-labelledby="p1" />
      </>,
    );
    const bar = screen.getByRole("progressbar", { name: "Waiting for the download to start" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-variant", "indeterminate");
  });
});

describe("progress indicator and tokens (DEC-0303)", () => {
  it("translates the indicator by the share of the caller's maximum", () => {
    render(
      <>
        <p id="p1">50 of 200</p>
        <Progress value={50} max={200} aria-labelledby="p1" />
      </>,
    );
    const bar = screen.getByRole("progressbar");
    expect(indicatorOf(bar).style.transform).toBe("translateX(-75%)");
  });

  it("assumes a maximum of 100 when the caller gives none", () => {
    render(
      <>
        <p id="p1">label</p>
        <Progress value={50} aria-labelledby="p1" />
      </>,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(indicatorOf(bar).style.transform).toBe("translateX(-50%)");
  });

  it("uses the progress tokens for the track and the indicator", () => {
    render(
      <>
        <p id="p1">label</p>
        <Progress value={1} max={2} aria-labelledby="p1" />
      </>,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("bg-seq-1");
    expect(indicatorOf(bar).className).toContain("bg-status-active");
  });

  it("draws the indeterminate indicator with the hatch pattern and no transform", () => {
    render(
      <>
        <p id="p1">label</p>
        <Progress value={null} aria-labelledby="p1" />
      </>,
    );
    const indicator = indicatorOf(screen.getByRole("progressbar"));
    expect(indicator.className).toContain("bg-pattern-indeterminate");
    expect(indicator.className).not.toContain("bg-status-active");
    expect(indicator.style.transform).toBe("");
  });

  it("requires aria-labelledby (checked by tsc)", () => {
    const typeChecked = () => {
      // @ts-expect-error aria-labelledby is required
      return <Progress value={1} max={2} />;
    };
    expect(typeChecked).toBeTypeOf("function");
  });
});

function tokensOf(node: Element | null | undefined): string[] {
  if (!node) throw new Error("node not rendered");
  return node.getAttribute("class")?.split(/\s+/).filter(Boolean) ?? [];
}

// AC-26, DAC-E1-12: the track takes the spec's 6-8 px height and the theme radius (progress spec
// section 3), and an indeterminate bar moves when motion is allowed (progress spec section 4).
describe("progress resolves to design-system tokens, not shipped literals (AC-26, IR-002, IR-003, IR-004)", () => {
  function renderBar(value: number | null) {
    render(
      <>
        <p id="p1">label</p>
        <Progress value={value} max={2} aria-labelledby="p1" />
      </>,
    );
    return screen.getByRole("progressbar");
  }

  it("sets the track at the 8 px spacing height with the theme radius", () => {
    const tokens = tokensOf(renderBar(1));
    expect(tokens).toContain("h-2");
    expect(tokens).toContain("rounded");
    expect(tokens).not.toContain("h-4");
    expect(tokens).not.toContain("rounded-full");
  });

  it("pulses the indeterminate indicator only when motion is allowed", () => {
    const indicator = indicatorOf(renderBar(null));
    expect(tokensOf(indicator)).toContain("motion-safe:animate-pulse");
  });
});
