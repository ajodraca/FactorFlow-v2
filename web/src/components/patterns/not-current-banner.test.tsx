import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CurrentSet, LaterSet } from "../../api/classification-types";
import { SCORE_SET } from "../../screens/research/copy";
import { formatTimestamp } from "../../screens/research/format";
import { NotCurrentBanner } from "./not-current-banner";

const RUN_ID = "0b2d4a6e-8c1f-4e3a-9b7d-2f6e8a0c4d1b";

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
  notCurrent: true,
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
  endedAt: "2026-10-15T23:03:00Z",
  failureReason: "Factor engine could not read prices",
};

const PRODUCED = formatTimestamp(SET.endedAt);
const DOWNLOAD_STARTED = formatTimestamp(SET.runStartedAt);

/** The badge's visible word: its text without the aria-hidden shape. */
function badgeWord(badge: Element): string {
  const clone = badge.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll("[aria-hidden='true']")) {
    hidden.remove();
  }
  return (clone.textContent ?? "").trim();
}

function badge(container: HTMLElement): HTMLElement {
  const found = container.querySelector("[data-variant^='status-']");
  if (found === null) {
    throw new Error("no badge rendered");
  }
  return found as HTMLElement;
}

describe("TC-COMP-174: banner absent when later is null, warning banner when building (DAC-E4-S4-1)", () => {
  // Implements TC-COMP-174
  it("renders nothing with a current set and later null", () => {
    const { container } = render(<NotCurrentBanner set={SET} later={null} />);
    expect(container).toBeEmptyDOMElement();
    expect(container.querySelector("[role]")).toBeNull();
    expect(container.querySelector("[data-variant]")).toBeNull();
  });

  // Implements TC-COMP-174
  it("renders one status-warning badge and the building sentence while a later set builds", () => {
    const { container } = render(<NotCurrentBanner set={SET} later={BUILDING} />);
    const badges = container.querySelectorAll("[data-variant^='status-']");
    expect(badges).toHaveLength(1);
    const warning = badges[0] as HTMLElement;
    expect(warning).toHaveAttribute("data-variant", "status-warning");
    expect(badgeWord(warning)).toBe(SCORE_SET.notReflecting);
    expect(badgeWord(warning)).toBe("Not reflecting the latest download");
    const triangle = warning.querySelector("svg[aria-hidden='true'] path");
    expect(triangle).not.toBeNull();
    expect(triangle?.getAttribute("d")).toMatch(/Z$/);

    expect(container).toHaveTextContent(SCORE_SET.buildingBody(PRODUCED, DOWNLOAD_STARTED));
    expect(container).toHaveTextContent("2026-10-15 17:46 CDT");
    expect(container).toHaveTextContent("2026-10-15 17:30 CDT");
    expect(container).toHaveTextContent("replaces this one when complete");
  });

  // Implements TC-COMP-174
  it("carries no button, link or handler", () => {
    const { container } = render(<NotCurrentBanner set={SET} later={BUILDING} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector("a, button, [onclick]")).toBeNull();
  });
});

describe("TC-COMP-175: a failed attempt shows the recorded reason and nothing to retry (DAC-E4-S4-2)", () => {
  // Implements TC-COMP-175
  it("renders one status-critical badge and the failed sentence with the reason verbatim", () => {
    const { container } = render(<NotCurrentBanner set={SET} later={FAILED} />);
    const badges = container.querySelectorAll("[data-variant^='status-']");
    expect(badges).toHaveLength(1);
    const critical = badges[0] as HTMLElement;
    expect(critical).toHaveAttribute("data-variant", "status-critical");
    expect(badgeWord(critical)).toBe(SCORE_SET.scoreUpdateFailed);
    expect(badgeWord(critical)).toBe("Score update failed");
    expect(critical.querySelector("svg[aria-hidden='true'] rect")).not.toBeNull();

    expect(container).toHaveTextContent(
      "Score update failed 2026-10-15 18:03 CDT: Factor engine could not read prices. Showing scores produced 2026-10-15 17:46 CDT from the download started 2026-10-15 17:30 CDT. The next complete download will try again.",
    );
  });

  // Implements TC-COMP-175
  it("renders the reason as text, never as HTML", () => {
    const { container } = render(
      <NotCurrentBanner set={SET} later={{ ...FAILED, failureReason: "<b>x</b> broke" }} />,
    );
    expect(container.querySelector("b")).toBeNull();
    expect(container).toHaveTextContent("<b>x</b> broke");
  });

  // Implements TC-COMP-175
  it("offers no button or link: the scheduler does not retry a failed set (STD-UI-2)", () => {
    render(<NotCurrentBanner set={SET} later={FAILED} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
  });

  // Implements TC-COMP-175
  it("uses the catalogue's clause for a failed set that recorded no reason, never null or undefined", () => {
    const { container } = render(
      <NotCurrentBanner set={SET} later={{ ...FAILED, failureReason: null }} />,
    );
    expect(container).toHaveTextContent(
      `Score update failed 2026-10-15 18:03 CDT: ${SCORE_SET.noReasonRecorded}.`,
    );
    expect(container).not.toHaveTextContent(/null|undefined/);
  });
});

describe("banner details: reads set and later only, a card with the badge first, no live region (AC-20, DAC-E4-2, DAC-E4-4)", () => {
  it.each([
    ["building", BUILDING],
    ["failed", FAILED],
  ])("renders nothing for a never-scored summary with later %s", (_state, later) => {
    const { container } = render(<NotCurrentBanner set={null} later={later} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a current set with later null and notCurrent false", () => {
    const { container } = render(
      <NotCurrentBanner set={{ ...SET, notCurrent: false }} later={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("reads later, never notCurrent: a building later renders the banner whatever notCurrent says", () => {
    const { container } = render(
      <NotCurrentBanner set={{ ...SET, notCurrent: false }} later={BUILDING} />,
    );
    expect(badge(container)).toHaveAttribute("data-variant", "status-warning");
  });

  it("is a card whose first child is the badge, followed by the words as text", () => {
    const { container } = render(<NotCurrentBanner set={SET} later={BUILDING} />);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveAttribute("data-variant", "default");
    expect(card).toHaveClass("bg-card");
    expect(card.firstElementChild).toBe(badge(container));
    const words = card.lastElementChild as HTMLElement;
    expect(words.tagName).toBe("P");
    expect(words).toHaveTextContent(SCORE_SET.buildingBody(PRODUCED, DOWNLOAD_STARTED));
    expect(words.querySelector("*")).toBeNull();
  });

  it("is not a live region: the as-of line owns announcing", () => {
    const { container } = render(<NotCurrentBanner set={SET} later={FAILED} />);
    expect(
      container.querySelector("[aria-live], [role='status'], [role='alert'], output"),
    ).toBeNull();
  });

  it.each([
    ["building", BUILDING, "bg-status-warning-muted", "text-status-warning"],
    ["failed", FAILED, "bg-status-critical-muted", "text-status-critical"],
  ])(
    "colours the %s badge with its muted token and leaves the words uncoloured",
    (_state, later, ground, ink) => {
      const { container } = render(<NotCurrentBanner set={SET} later={later} />);
      const mark = badge(container);
      expect(mark).toHaveClass(ground);
      expect(mark).toHaveClass(ink);
      const words = container.querySelector("p") as HTMLElement;
      expect(words.className).not.toMatch(/status-/);
    },
  );
});
