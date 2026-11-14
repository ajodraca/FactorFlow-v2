import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";
import type { Tier } from "./tiers";

const SOURCE = path.join(path.dirname(fileURLToPath(import.meta.url)), "status-badge.tsx");

const TIERS: Tier[] = ["neutral", "active", "good", "warning", "serious", "critical"];
const LABEL: Record<Tier, string> = {
  neutral: "Label neutral",
  active: "Label active",
  good: "Label good",
  warning: "Label warning",
  serious: "Label serious",
  critical: "Label critical",
};

function badgeOf(tier: Tier): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-variant="status-${tier}"]`);
  if (!element) throw new Error(`no ${tier} badge rendered`);
  return element;
}

function iconOf(tier: Tier): SVGElement {
  const icons = badgeOf(tier).querySelectorAll("svg");
  expect(icons).toHaveLength(1);
  return icons[0];
}

function tags(icon: SVGElement): string[] {
  return Array.from(icon.children).map((child) => child.tagName.toLowerCase());
}

const GEOMETRY = ["cx", "cy", "r", "d", "x", "y", "width", "height"] as const;

/**
 * What a tier draws, in the 24-unit viewBox: each element's tag, geometry and the fill it renders
 * with (its own, else the svg's). Two tiers that draw the same thing look the same in greyscale.
 */
function shapeOf(icon: SVGElement): string[] {
  const inherited = icon.getAttribute("fill");
  return Array.from(icon.children).map((child) =>
    [
      child.tagName.toLowerCase(),
      ...GEOMETRY.filter((name) => child.hasAttribute(name)).map(
        (name) => `${name}=${child.getAttribute(name)}`,
      ),
      `fill=${child.getAttribute("fill") ?? inherited}`,
    ].join(" "),
  );
}

const SHAPE: Record<Tier, string[]> = {
  neutral: ["circle cx=12 cy=12 r=10 fill=none"],
  active: ["circle cx=12 cy=12 r=1 fill=none", "circle cx=12 cy=12 r=10 fill=none"],
  good: ["circle cx=12 cy=12 r=10 fill=currentColor"],
  warning: [
    "path d=M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z fill=currentColor",
  ],
  serious: [
    "path d=M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z fill=currentColor",
  ],
  critical: ["rect x=3 y=3 width=18 height=18 fill=currentColor"],
};

// Implements TC-COMP-022
describe("StatusBadge words and shapes (TC-COMP-022, DAC-E1-S5-3)", () => {
  it.each(TIERS)("%s: the label is the accessible name and the shape is aria-hidden", (tier) => {
    render(
      <a href="/data">
        <StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>
      </a>,
    );

    expect(screen.getByRole("link", { name: LABEL[tier] })).toBeInTheDocument();
    const icon = iconOf(tier);
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("focusable", "false");
  });

  it("neutral is one hollow circle", () => {
    render(<StatusBadge tier="neutral">{LABEL.neutral}</StatusBadge>);
    const icon = iconOf("neutral");

    expect(tags(icon)).toEqual(["circle"]);
    expect(icon).toHaveAttribute("fill", "none");
    expect(icon.firstElementChild).not.toHaveAttribute("fill");
  });

  it("active is a ring and a dot", () => {
    render(<StatusBadge tier="active">{LABEL.active}</StatusBadge>);

    expect(tags(iconOf("active"))).toEqual(["circle", "circle"]);
  });

  it("good is one filled circle with no stroke", () => {
    render(<StatusBadge tier="good">{LABEL.good}</StatusBadge>);
    const icon = iconOf("good");

    expect(tags(icon)).toEqual(["circle"]);
    expect(icon.firstElementChild).toHaveAttribute("fill", "currentColor");
    expect(icon.firstElementChild).not.toHaveAttribute("stroke");
  });

  it.each([
    ["warning", "path", "lucide-triangle"],
    ["serious", "path", "lucide-diamond"],
    ["critical", "rect", "lucide-square"],
  ] as const)("%s is one %s from %s", (tier, tag, className) => {
    render(<StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>);
    const icon = iconOf(tier);

    expect(tags(icon)).toEqual([tag]);
    expect(icon).toHaveClass(className);
  });

  it.each(["warning", "serious", "critical"] as const)("%s is a filled shape", (tier) => {
    render(<StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>);

    expect(iconOf(tier)).toHaveAttribute("fill", "currentColor");
  });

  it.each(TIERS)("%s: the shape is 12 px square and comes before the label", (tier) => {
    render(<StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>);
    const icon = iconOf(tier);

    expect(icon).toHaveClass("h-3", "w-3", "shrink-0");
    expect(badgeOf(tier).firstChild).toBe(icon);
  });

  it.each(TIERS)(
    "%s draws its fixed shape: geometry inside the viewBox, fill as planned",
    (tier) => {
      render(<StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>);

      expect(shapeOf(iconOf(tier))).toEqual(SHAPE[tier]);
    },
  );

  it("active's ring is not filled, so it differs from good's disc in greyscale", () => {
    render(<StatusBadge tier="active">{LABEL.active}</StatusBadge>);

    expect(iconOf("active")).toHaveAttribute("fill", "none");
  });

  it("no two tiers share a shape", () => {
    const shapes = TIERS.map((tier) => {
      const { unmount } = render(<StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>);
      const shape = shapeOf(iconOf(tier)).join("|");
      unmount();
      return shape;
    });

    expect(new Set(shapes).size).toBe(6);
  });
});

describe("StatusBadge composition (DAC-E1-2)", () => {
  it.each(TIERS)("%s renders the badge variant and its token classes", (tier) => {
    render(<StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>);
    const badge = badgeOf(tier);

    expect(badge).toHaveClass(`bg-status-${tier}-muted`, `text-status-${tier}`, "text-xs");
  });

  it("forwards title and className and keeps the tier classes", () => {
    render(
      <StatusBadge tier="warning" title="2026-10-16 17:40 CDT" className="w-fit">
        {LABEL.warning}
      </StatusBadge>,
    );
    const badge = badgeOf("warning");

    expect(badge).toHaveAttribute("title", "2026-10-16 17:40 CDT");
    expect(badge).toHaveClass("w-fit", "text-status-warning");
  });

  it("has no title attribute when the caller passes none", () => {
    render(<StatusBadge tier="good">{LABEL.good}</StatusBadge>);

    expect(badgeOf("good")).not.toHaveAttribute("title");
  });

  it("is not a tab stop and has no ARIA role", async () => {
    render(<StatusBadge tier="good">{LABEL.good}</StatusBadge>);
    await userEvent.tab();

    expect(document.body).toHaveFocus();
    expect(badgeOf("good")).not.toHaveAttribute("role");
  });

  it("imports nothing from a screen", () => {
    expect(readFileSync(SOURCE, "utf-8")).not.toMatch(/from\s+["'](\.\.\/)+screens/);
  });
});
