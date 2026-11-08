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

  it("no two tiers share a shape", () => {
    const signatures = TIERS.map((tier) => {
      const { unmount } = render(<StatusBadge tier={tier}>{LABEL[tier]}</StatusBadge>);
      const icon = iconOf(tier);
      const signature = `${icon.getAttribute("fill")}|${icon.innerHTML}`;
      unmount();
      return signature;
    });

    expect(new Set(signatures).size).toBe(6);
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
