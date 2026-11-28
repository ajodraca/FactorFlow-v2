import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LifecycleBadge, RecognitionBadge } from "./badges";

/** The badge's visible text: the text with every `aria-hidden` node removed. */
function visibleText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  for (const hidden of Array.from(clone.querySelectorAll('[aria-hidden="true"]'))) {
    hidden.remove();
  }
  return clone.textContent?.trim() ?? "";
}

/** The shape tag the badge draws, with every class removed from a clone (STD-UI-8). */
function shapeWithoutClasses(element: Element): { text: string; shape: string | undefined } {
  const clone = element.cloneNode(true) as Element;
  for (const node of [clone, ...Array.from(clone.querySelectorAll("*"))]) {
    node.removeAttribute("class");
  }
  const svg = clone.querySelector('svg[aria-hidden="true"]');
  return { text: visibleText(clone), shape: svg?.firstElementChild?.tagName.toLowerCase() };
}

// Implements TC-COMP-202
describe("Not found and Stopped following carry a label and a shape (TC-COMP-202, DAC-E7-S3-5)", () => {
  it("renders a stopped-following stock as a neutral badge with a hollow circle", () => {
    const { container } = render(<LifecycleBadge lifecycle="retired" />);
    const badge = container.querySelector('[data-variant="status-neutral"]') as HTMLElement;

    expect(badge).not.toBeNull();
    expect(visibleText(badge)).toBe("Stopped following");
    const shapes = badge.querySelectorAll("svg");
    expect(shapes).toHaveLength(1);
    expect(shapes[0]).toHaveAttribute("aria-hidden", "true");
    expect(shapes[0].children).toHaveLength(1);
    expect(shapes[0].firstElementChild?.tagName.toLowerCase()).toBe("circle");
  });

  it("renders a followed stock as plain text, with no shape and no tier", () => {
    const { container } = render(<LifecycleBadge lifecycle="active" />);

    expect(container).toHaveTextContent("Followed");
    expect(container.textContent).toBe("Followed");
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("[data-variant]")).toBeNull();
  });

  it("renders a stock the provider does not recognise as a warning badge with a triangle", () => {
    const { container } = render(<RecognitionBadge />);
    const badge = container.querySelector('[data-variant="status-warning"]') as HTMLElement;

    expect(badge).not.toBeNull();
    expect(visibleText(badge)).toBe("Not found");
    const shapes = badge.querySelectorAll("svg");
    expect(shapes).toHaveLength(1);
    expect(shapes[0]).toHaveAttribute("aria-hidden", "true");
    expect(shapes[0].firstElementChild?.tagName.toLowerCase()).toBe("path");
  });

  it("keeps the label and the shape when every class is removed (never colour alone)", () => {
    const stopped = render(<LifecycleBadge lifecycle="retired" />).container;
    const notFound = render(<RecognitionBadge />).container;

    expect(shapeWithoutClasses(stopped)).toEqual({ text: "Stopped following", shape: "circle" });
    expect(shapeWithoutClasses(notFound)).toEqual({ text: "Not found", shape: "path" });
  });

  it("never renders a badge as not determinable", () => {
    for (const element of [
      <LifecycleBadge key="r" lifecycle="retired" />,
      <LifecycleBadge key="a" lifecycle="active" />,
      <RecognitionBadge key="n" />,
    ]) {
      const { container } = render(element);
      expect(container.querySelector('[data-variant="coverage-unknown"]')).toBeNull();
    }
  });
});
