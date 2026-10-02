import { render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { describe, expect, it } from "vitest";
import type { PresenceState } from "../../api/types";
import { LifecycleBadge } from "../instruments/badges";
import { DepthShortBadge, GapsUnknownBadge, PresenceBadge } from "./badges";

const PRESENCE: { state: PresenceState; variant: string; label: string }[] = [
  { state: "present", variant: "coverage-present", label: "Present" },
  { state: "absent", variant: "coverage-absent", label: "Absent" },
  { state: "unknown", variant: "coverage-unknown", label: "Unknown" },
];

function renderBadge(element: JSX.Element): HTMLElement {
  const { container } = render(element);
  return container.firstElementChild as HTMLElement;
}

/** Label plus icon shape: the svg's child tags and fills, or the glyph. */
function signature(badge: Element): string {
  const svg = badge.querySelector("svg");
  const shape = svg
    ? Array.from(svg.children)
        .map((child) => `${child.tagName.toLowerCase()}:${child.getAttribute("fill") ?? ""}`)
        .join(",")
    : (badge.querySelector("[aria-hidden='true']")?.textContent ?? "");
  return `${label(badge)}|${shape}`;
}

function label(badge: Element): string {
  const clone = badge.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll("[aria-hidden='true']")) {
    hidden.remove();
  }
  return (clone.textContent ?? "").trim();
}

describe("TC-COMP-061: present, absent and unknown are distinct badges (DAC-E6-S4-3)", () => {
  // Implements TC-COMP-061
  it.each(PRESENCE)(
    "renders $state with its variant, label and an icon",
    ({ state, variant, label: text }) => {
      render(<PresenceBadge state={state} />);
      const badge = screen.getByTestId("presence-badge");
      expect(badge).toHaveAttribute("data-variant", variant);
      expect(label(badge)).toBe(text);
      const icon = badge.querySelector("svg[aria-hidden='true']");
      const glyph = badge.querySelector("[aria-hidden='true']");
      expect(icon ?? (glyph?.textContent === "—" ? glyph : null)).not.toBeNull();
    },
  );

  // Implements TC-COMP-061
  it("hatches unknown and never absent, so unknown is not a milder absent", () => {
    expect(renderBadge(<PresenceBadge state="unknown" />)).toHaveClass("bg-pattern-indeterminate");
    expect(renderBadge(<PresenceBadge state="absent" />)).not.toHaveClass(
      "bg-pattern-indeterminate",
    );
  });
});

describe("TC-COMP-065: every status is distinguishable in greyscale (DAC-E6-S4-7)", () => {
  // Implements TC-COMP-065
  it("gives each status a distinct label-and-shape signature that survives without colour", () => {
    const statuses = {
      present: renderBadge(<PresenceBadge state="present" />),
      absent: renderBadge(<PresenceBadge state="absent" />),
      unknown: renderBadge(<PresenceBadge state="unknown" />),
      short: renderBadge(<DepthShortBadge years={2} />),
      retired: renderBadge(<LifecycleBadge lifecycle="retired" />),
      active: renderBadge(<LifecycleBadge lifecycle="active" />),
    };
    const gapsUnknown = renderBadge(<GapsUnknownBadge />);

    const signatures = Object.values(statuses).map(signature);
    expect(new Set(signatures).size).toBe(signatures.length);
    for (const badge of [...Object.values(statuses), gapsUnknown]) {
      expect(label(badge)).not.toBe("");
    }
    // The gaps column's Unknown is the same status as an unknown presence,
    // so it reads the same, and differs from every other status.
    expect(signature(gapsUnknown)).toBe(signature(statuses.unknown));

    for (const badge of [...Object.values(statuses), gapsUnknown]) {
      const before = signature(badge);
      const stripped = badge.cloneNode(true) as Element;
      for (const element of [stripped, ...stripped.querySelectorAll("*")]) {
        element.removeAttribute("class");
      }
      expect(signature(stripped)).toBe(before);
    }
  });
});
