import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { CurrentSet, LaterSet } from "../../api/classification-types";
import { SCORE_SET, SHELL_ROUTES } from "../../screens/research/copy";
import { formatTimestamp } from "../../screens/research/format";
import { AsOfLine, type AsOfLineProps } from "./as-of-line";
import { NotCurrentBanner } from "./not-current-banner";

const RUN_ID = "0b2d4a6e-8c1f-4e3a-9b7d-2f6e8a0c4d1b";
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-/;

/** The current set: produced 2026-10-15 17:46 CDT from the download started 17:30 CDT. */
const SET: CurrentSet = {
  setId: "6f1c2b3a-4d5e-4f60-8a71-9b82c93d04e5",
  classificationDate: "2026-10-15",
  runId: RUN_ID,
  runStartedAt: "2026-10-15T22:30:00Z",
  runOutcome: "succeeded",
  state: "complete",
  startedAt: "2026-10-15T22:40:00Z",
  endedAt: "2026-10-15T22:46:00Z",
  latestTradingDay: "2026-10-15",
  activeInstruments: 120,
  notCurrent: false,
};

const BUILDING: LaterSet = {
  setId: "a1b2c3d4-0000-4000-8000-000000000002",
  state: "building",
  startedAt: "2026-10-16T22:40:00Z",
  endedAt: null,
  failureReason: null,
  runId: "1c3e5a7b-9d2f-4b6c-8e0a-3f5b7d9c1e2a",
  runStartedAt: "2026-10-16T22:30:00Z",
};

const FAILED: LaterSet = {
  ...BUILDING,
  state: "failed",
  startedAt: "2026-10-15T22:50:00Z",
  endedAt: "2026-10-15T23:03:00Z",
  failureReason: "Factor engine could not read prices",
};

const CHECKED_AT = "2026-10-15T22:52:10.000Z";

/**
 * The one `min-h-*` token the line and its skeleton share (UX design 1.2, Loading; DEC-0154).
 * `--space-7` clears the one-row line's content height, so the skeleton stands at the line's
 * final height; a smaller floor leaves the skeleton shorter than the line it stands in for.
 */
const LINE_HEIGHT = "min-h-7";

const BASE: AsOfLineProps = {
  set: SET,
  later: null,
  checkedAt: null,
  pollFailed: false,
  onTryAgain: () => undefined,
};

function renderLine(props: Partial<AsOfLineProps> = {}, extra?: JSX.Element) {
  return render(
    <MemoryRouter>
      {extra}
      <AsOfLine {...BASE} {...props} />
    </MemoryRouter>,
  );
}

/** Visible text with every aria-hidden shape removed. */
function visibleText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll("[aria-hidden='true']")) {
    hidden.remove();
  }
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
}

function badges(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-variant^='status-']"));
}

function badgeByVariant(container: HTMLElement, variant: string): HTMLElement | null {
  return badges(container).find((b) => b.dataset.variant === variant) ?? null;
}

/** The one `min-h-*` class an element carries: the height the line and its skeleton share. */
function heightToken(element: Element): string {
  const tokens = element.className.match(/\bmin-h-\S+/g) ?? [];
  if (tokens.length !== 1) {
    throw new Error(`expected one min-h class, found ${tokens.join(" ") || "none"}`);
  }
  return tokens[0];
}

describe("TC-COMP-179: the as-of line shows its times in America/Chicago with the run link (DAC-E4-S4-3)", () => {
  // Implements TC-COMP-179
  it("reads Scores from {time} · from the download started {time}, with the start time as the link", () => {
    const { container } = renderLine();
    expect(container).toHaveTextContent(
      "Scores from 2026-10-15 17:46 CDT · from the download started 2026-10-15 17:30 CDT",
    );
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("2026-10-15 17:30 CDT");
    expect(link).toHaveAccessibleName("Open the download started 2026-10-15 17:30 CDT");
    expect(link).toHaveAccessibleName(SCORE_SET.openDownload("2026-10-15 17:30 CDT"));
    expect(link).toHaveAttribute("href", SHELL_ROUTES.download(RUN_ID));
    expect(link).toHaveAttribute("href", `/runs/${RUN_ID}`);
  });

  // Implements TC-COMP-179
  it("prints no number, UUID or run_id anywhere in the line", () => {
    const { container } = renderLine({
      sortLabel: "value",
      later: BUILDING,
      checkedAt: CHECKED_AT,
    });
    const text = container.textContent ?? "";
    expect(text).not.toContain("#");
    expect(text).not.toMatch(UUID);
    expect(text).not.toContain("run_id");
    expect(screen.getByRole("link").textContent).not.toMatch(UUID);
  });

  // Implements TC-COMP-179
  it("renders CST for a winter instant and CDT for a summer one, never the machine zone", () => {
    const { container, unmount } = renderLine({
      set: { ...SET, endedAt: "2026-01-15T23:00:00Z", runStartedAt: "2026-01-15T22:30:00Z" },
    });
    expect(container).toHaveTextContent("Scores from 2026-01-15 17:00 CST");
    expect(screen.getByRole("link")).toHaveTextContent("2026-01-15 16:30 CST");
    expect(container.textContent).not.toMatch(/\bCDT\b/);
    unmount();

    const summer = renderLine();
    expect(summer.container).toHaveTextContent("Scores from 2026-10-15 17:46 CDT");
    expect(summer.container.textContent).not.toMatch(/\bCST\b/);
  });

  // Implements TC-COMP-179
  it("ends with · sorted by {label} when a sort label is given, and omits the clause otherwise", () => {
    const sorted = renderLine({ sortLabel: "value" });
    expect(visibleText(sorted.container)).toMatch(/· sorted by value$/);
    sorted.unmount();

    const unsorted = renderLine();
    expect(unsorted.container.textContent).not.toContain("sorted by");
  });
});

describe("TC-COMP-176: a failed poll keeps every mark and offers Try again (DAC-E4-S4-4)", () => {
  // Implements TC-COMP-176
  it("renders Could not check for newer scores. inside the live region and Try again outside it", async () => {
    const onTryAgain = vi.fn();
    const { container } = renderLine({
      later: BUILDING,
      checkedAt: CHECKED_AT,
      pollFailed: true,
      onTryAgain,
    });
    const status = screen.getByRole("status");
    expect(within(status).getByText(SCORE_SET.couldNotCheck)).toBeInTheDocument();
    expect(within(status).getByText("Could not check for newer scores.")).toBeInTheDocument();
    const tryAgain = screen.getByRole("button", { name: "Try again" });
    expect(within(status).queryByRole("button", { name: "Try again" })).toBeNull();
    expect(tryAgain).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(tryAgain);
    expect(onTryAgain).toHaveBeenCalledTimes(1);
    await user.click(tryAgain);
    expect(onTryAgain).toHaveBeenCalledTimes(2);

    // Every mark survives the failure.
    expect(container).toHaveTextContent("Scores from 2026-10-15 17:46 CDT");
    expect(badgeByVariant(container, "status-active")).not.toBeNull();
    expect(badgeByVariant(container, "status-good")).not.toBeNull();
    expect(container).toHaveTextContent("checked 2026-10-15 17:52:10 CDT");
  });

  // Implements TC-COMP-176
  it("renders neither the text nor the button while polling succeeds", () => {
    const { container } = renderLine({ later: BUILDING, checkedAt: CHECKED_AT });
    expect(container.textContent).not.toContain("Could not check");
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  // Implements TC-COMP-176
  it("leaves the banner beside it in place when the poll fails", () => {
    const { container } = renderLine(
      { later: BUILDING, checkedAt: CHECKED_AT, pollFailed: true },
      <NotCurrentBanner set={SET} later={BUILDING} />,
    );
    expect(container).toHaveTextContent("Not reflecting the latest download");
    expect(container).toHaveTextContent("replaces this one when complete");
    expect(container).toHaveTextContent("Could not check for newer scores.");
  });
});

describe("as-of line details: badges, checked time, Earlier sets…, the one live region, skeleton (AC-21, DAC-E4-4, DAC-E4-S4-1, DAC-E4-S4-3)", () => {
  it("shows no Updating badge and no checked time with later null and checkedAt null", () => {
    const { container } = renderLine();
    expect(badgeByVariant(container, "status-active")).toBeNull();
    expect(container.textContent).not.toContain("Updating");
    expect(container.textContent).not.toContain("checked");
  });

  it("adds the status-active Updating badge with its ringed-dot shape and checked {time} with seconds while building", () => {
    const { container } = renderLine({ later: BUILDING, checkedAt: CHECKED_AT });
    const updating = badgeByVariant(container, "status-active");
    expect(updating).not.toBeNull();
    expect(visibleText(updating as HTMLElement)).toBe(SCORE_SET.updating);
    expect(visibleText(updating as HTMLElement)).toBe("Updating");
    expect(
      (updating as HTMLElement).querySelectorAll("svg[aria-hidden='true'] circle"),
    ).toHaveLength(2);
    expect(updating).toHaveClass("bg-status-active-muted");
    expect(updating).toHaveClass("text-status-active");
    // The building set's start time is the badge's tooltip (UX design 1.2).
    expect(updating).toHaveAttribute("title", formatTimestamp(BUILDING.startedAt));
    expect(updating).toHaveAttribute("title", "2026-10-16 17:40 CDT");
    expect(container).toHaveTextContent(SCORE_SET.checked("2026-10-15 17:52:10 CDT"));
    expect(container).toHaveTextContent("checked 2026-10-15 17:52:10 CDT");
    expect(screen.getByText("checked 2026-10-15 17:52:10 CDT")).toHaveClass("font-numeric");
    // The 10-second tick is not announced.
    expect(screen.getByRole("status").textContent).not.toContain("checked");
  });

  it("renders Updating without a checked time while building before the first read", () => {
    const { container } = renderLine({ later: BUILDING, checkedAt: null });
    expect(badgeByVariant(container, "status-active")).not.toBeNull();
    expect(container.textContent).not.toContain("checked");
  });

  it("adds no Updating badge and no checked time for a failed later set", () => {
    const { container } = renderLine({ later: FAILED, checkedAt: CHECKED_AT });
    expect(badgeByVariant(container, "status-active")).toBeNull();
    expect(container.textContent).not.toContain("Updating");
    expect(container.textContent).not.toContain("checked");
  });

  it("shows no checked time once polling has stopped, however recent the last read", () => {
    const { container } = renderLine({ later: null, checkedAt: CHECKED_AT });
    expect(container.textContent).not.toContain("checked");
  });

  it.each([
    ["succeeded", "status-good", "Complete", "bg-status-good-muted", "text-status-good"],
    ["partial", "status-warning", "Partial", "bg-status-warning-muted", "text-status-warning"],
  ] as const)(
    "renders the %s download as a %s badge reading %s with a shape",
    (runOutcome, variant, word, ground, ink) => {
      const { container } = renderLine({ set: { ...SET, runOutcome } });
      const outcome = badgeByVariant(container, variant);
      expect(outcome).not.toBeNull();
      expect(visibleText(outcome as HTMLElement)).toBe(word);
      expect((outcome as HTMLElement).querySelector("svg[aria-hidden='true']")).not.toBeNull();
      expect(outcome).toHaveClass(ground);
      expect(outcome).toHaveClass(ink);
      // Badges stay in the line's extra-small text size (UX design 1.2, Page Layout).
      expect(outcome).toHaveClass("text-xs");
      expect(badges(container)).toHaveLength(1);
    },
  );

  it("draws the Complete badge's shape as one filled circle, not the active tier's ring", () => {
    // UX design 1.2, Accessibility: "good filled circle" against the "active ringed dot", so the
    // tiers stay distinct in greyscale (STD-UI-8; implementation review v2 IR-003).
    const { container } = renderLine();
    const good = badgeByVariant(container, "status-good") as HTMLElement;
    const shapes = good.querySelectorAll("svg[aria-hidden='true'] > *");
    expect(shapes).toHaveLength(1);
    const circle = shapes[0];
    expect(circle.tagName.toLowerCase()).toBe("circle");
    expect(circle).toHaveAttribute("fill", "currentColor");
    expect(circle).not.toHaveAttribute("stroke");
  });

  it("renders the Earlier sets… ghost button only when a handler is given, calling it once per click", async () => {
    const onOpenEarlierSets = vi.fn();
    const { unmount } = renderLine({ onOpenEarlierSets });
    const button = screen.getByRole("button", { name: "Earlier sets…" });
    expect(button).toHaveAttribute("data-variant", "ghost");
    expect(button).toHaveAttribute("type", "button");
    const user = userEvent.setup();
    await user.click(button);
    expect(onOpenEarlierSets).toHaveBeenCalledTimes(1);
    unmount();

    renderLine();
    expect(screen.queryByRole("button", { name: "Earlier sets…" })).toBeNull();
  });

  it("has exactly one live region: an output, polite and not atomic, present even when empty", () => {
    const { container } = renderLine();
    const regions = container.querySelectorAll("[aria-live], [role='status'], output");
    expect(regions).toHaveLength(1);
    const status = screen.getByRole("status");
    expect(status.tagName).toBe("OUTPUT");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "false");
    expect(status).toBeEmptyDOMElement();
  });

  it("holds the announcement, Updating, Earlier sets… and the failure text, and nothing else", () => {
    const announcement = SCORE_SET.scoresUpdatedTo("2026-10-16 17:48 CDT", "2026-10-16 17:30 CDT");
    const { container } = renderLine({
      later: BUILDING,
      checkedAt: CHECKED_AT,
      pollFailed: true,
      announcement,
      sortLabel: "value",
      onOpenEarlierSets: () => undefined,
    });
    const status = screen.getByRole("status");
    expect(within(status).getByText(announcement)).toBeInTheDocument();
    expect(within(status).getByText("Updating")).toBeInTheDocument();
    expect(within(status).getByRole("button", { name: "Earlier sets…" })).toBeInTheDocument();
    expect(within(status).getByText("Could not check for newer scores.")).toBeInTheDocument();

    expect(status.textContent).not.toContain("Scores from");
    expect(within(status).queryByRole("link")).toBeNull();
    expect(within(status).queryByText("Complete")).toBeNull();
    expect(status.querySelector("[data-variant='status-good']")).toBeNull();
    expect(status.textContent).not.toContain("sorted by");
    expect(status.textContent).not.toContain("checked");
    expect(within(status).queryByRole("button", { name: "Try again" })).toBeNull();

    // In order: announcement, Updating, Earlier sets…, a break, the failure text.
    expect(visibleText(status)).toBe(
      `${announcement} Updating Earlier sets… Could not check for newer scores.`,
    );
    expect(status.querySelector("br")).not.toBeNull();

    // Outside the region, in order: the sentence with the link, the outcome, sorted by, checked.
    const outside = visibleText(container).replace(visibleText(status), "").trim();
    expect(outside).toMatch(
      /^Scores from 2026-10-15 17:46 CDT · from the download started 2026-10-15 17:30 CDT Complete · sorted by value checked 2026-10-15 17:52:10 CDT/,
    );
    expect(outside).toMatch(/Try again$/);
  });

  it("separates the completion announcement from the text before it, with and without a sort clause", () => {
    const announcement = SCORE_SET.scoresUpdatedTo("2026-10-16 17:48 CDT", "2026-10-16 17:30 CDT");
    const sorted = renderLine({ announcement, sortLabel: "value" });
    expect(visibleText(sorted.container)).toBe(
      `Scores from 2026-10-15 17:46 CDT · from the download started 2026-10-15 17:30 CDT Complete · sorted by value ${announcement}`,
    );
    sorted.unmount();

    const building = renderLine({ announcement, later: BUILDING, checkedAt: CHECKED_AT });
    expect(visibleText(building.container)).toBe(
      `Scores from 2026-10-15 17:46 CDT · from the download started 2026-10-15 17:30 CDT Complete checked 2026-10-15 17:52:10 CDT ${announcement} Updating`,
    );
  });

  it("reads Updating then the failure text when nothing else is in the region", () => {
    renderLine({ later: BUILDING, pollFailed: true });
    const status = screen.getByRole("status");
    expect(visibleText(status)).toBe("Updating Could not check for newer scores.");
  });

  it("renders nothing when set is null and not loading: the never-populated state has no line", () => {
    const { container } = renderLine({ set: null });
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("renders the skeleton at the line's own height, and no live region, while loading with no set", () => {
    const line = renderLine();
    const lineHeight = heightToken(screen.getByTestId("as-of-line"));
    line.unmount();

    const { container } = renderLine({ set: null, loading: true });
    const skeleton = screen.getByTestId("as-of-line-skeleton");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    // One class fixes both heights, so the table beneath does not shift (UX design 1.2, Loading).
    expect(heightToken(skeleton)).toBe(lineHeight);
    // The shared value is pinned too: `min-height` is a floor, and a floor below the one-row
    // line's content height (min-h-5 or less) leaves the line taller than its skeleton
    // (implementation review v2 IR-001).
    expect(lineHeight).toBe(LINE_HEIGHT);
    expect(skeleton).toHaveClass(LINE_HEIGHT);
    expect(skeleton.className).not.toMatch(/(^|\s)h-\d/);
    expect(container.textContent).toBe("");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("ignores loading once a set is given", () => {
    renderLine({ loading: true });
    expect(screen.queryByTestId("as-of-line-skeleton")).toBeNull();
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("is a muted extra-small line and the link is numeric", () => {
    renderLine();
    const line = screen.getByTestId("as-of-line");
    expect(line).toHaveClass("text-xs");
    expect(line).toHaveClass("text-muted-foreground");
    expect(screen.getByRole("link")).toHaveClass("font-numeric");
    // Every time on the line is in the numeric face (UX design 1.2, Token Usage).
    expect(screen.getByText("2026-10-15 17:46 CDT")).toHaveClass("font-numeric");
  });
});
