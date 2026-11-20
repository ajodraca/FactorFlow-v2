import { render, screen, within } from "@testing-library/react";
import type { JSX } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NeedsYouItemRow } from "./needs-you-item";
import type { NeedsYouItem } from "./needs-you";
import type { Tier } from "./tiers";

const ITEM: NeedsYouItem = {
  kind: "download_not_complete",
  tier: "critical",
  recordedAt: "2026-10-15T22:31:00+00:00",
  target: "/data/downloads/run-failed-1",
  runId: "run-failed-1",
};

function tree(item: NeedsYouItem = ITEM): JSX.Element {
  return (
    <MemoryRouter>
      <ul>
        <NeedsYouItemRow
          item={item}
          title="The last download failed"
          body="Provider timeout. Ended 2026-10-15 17:31 CDT."
          actionLabel="See download"
          actionName="See the download that failed"
          markerSize="var(--space-6)"
        />
      </ul>
    </MemoryRouter>
  );
}

function row(): HTMLElement {
  return screen.getByRole("listitem");
}

function tile(): HTMLElement {
  const element = row().querySelector<HTMLElement>('[data-slot="severity-tile"]');
  if (!element) throw new Error("no severity tile rendered");
  return element;
}

describe("NeedsYouItemRow (TC-COMP-030, DAC-E1-S8-3)", () => {
  // Implements TC-COMP-030
  it("renders a list item whose severity tile is hidden, sized by the caller and coloured by tier", () => {
    render(tree());
    const severityTile = tile();
    expect(severityTile).toHaveAttribute("aria-hidden", "true");
    expect(severityTile.style.width).toBe("var(--space-6)");
    expect(severityTile.style.height).toBe("var(--space-6)");
    expect(severityTile).toHaveClass("bg-status-critical-muted", "text-status-critical");
    const icons = severityTile.querySelectorAll("svg");
    expect(icons).toHaveLength(1);
    expect(Array.from(icons[0].children).map((child) => child.tagName.toLowerCase())).toEqual([
      "rect",
    ]);
  });

  it("carries the tier in words through exactly one status badge", () => {
    render(tree());
    const badges = row().querySelectorAll('[data-variant^="status-"]');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveAttribute("data-variant", "status-critical");
    expect(badges[0].textContent).toBe("Download");
    expect(badges[0].querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1);
  });

  it("offers one outline link to the item's target, named for the item", () => {
    render(tree());
    const links = within(row()).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("See the download that failed");
    expect(links[0].textContent).toBe("See download");
    expect(links[0]).toHaveAttribute("data-variant", "outline");
    expect(links[0]).toHaveAttribute("href", "/data/downloads/run-failed-1");
  });

  it("shows the title in semibold and the body", () => {
    render(tree());
    expect(screen.getByText("The last download failed")).toHaveClass("font-semibold");
    expect(screen.getByText("Provider timeout. Ended 2026-10-15 17:31 CDT.")).toBeInTheDocument();
  });

  it("exposes no image role and no tile content to assistive technology", () => {
    render(tree());
    expect(within(row()).queryByRole("img")).toBeNull();
  });

  it("links to the item's target, whatever the kind", () => {
    render(
      tree({ kind: "credential_missing", tier: "critical", recordedAt: "x", target: "/settings" }),
    );
    expect(within(row()).getByRole("link")).toHaveAttribute("href", "/settings");
  });
});

describe("tile shape and colour per tier (DAC-E1-S8-3, AC-20)", () => {
  const EXPECTED: Record<Tier, { cls: string; tags: string[] }> = {
    neutral: { cls: "bg-status-neutral-muted", tags: ["circle"] },
    active: { cls: "bg-status-active-muted", tags: ["circle", "circle"] },
    good: { cls: "bg-status-good-muted", tags: ["circle"] },
    warning: { cls: "bg-status-warning-muted", tags: ["path"] },
    serious: { cls: "bg-status-serious-muted", tags: ["path"] },
    critical: { cls: "bg-status-critical-muted", tags: ["rect"] },
  };

  function tagsOf(svg: Element): string[] {
    return Array.from(svg.children).map((child) => child.tagName.toLowerCase());
  }

  it.each(Object.entries(EXPECTED))("the %s tile", (tier, expected) => {
    render(tree({ ...ITEM, tier: tier as Tier }));
    const severityTile = tile();
    expect(severityTile).toHaveClass(expected.cls);
    const tileSvg = severityTile.querySelector("svg");
    const badgeSvg = row().querySelector('[data-variant^="status-"] svg');
    if (!tileSvg || !badgeSvg) throw new Error("missing shape");
    expect(tagsOf(tileSvg)).toEqual(expected.tags);
    // The tile and the badge draw one shape per tier, from the one TierShape.
    expect(tagsOf(badgeSvg)).toEqual(expected.tags);
    expect(tileSvg.innerHTML).toBe(badgeSvg.innerHTML);
  });

  it("the good tile draws a filled circle", () => {
    render(tree({ ...ITEM, tier: "good" }));
    expect(tile().querySelector("svg circle")).toHaveAttribute("fill", "currentColor");
  });

  it("serious draws a diamond", () => {
    render(tree({ ...ITEM, tier: "serious" }));
    expect(tile().querySelector("svg")).toHaveClass("lucide-diamond");
  });
});
