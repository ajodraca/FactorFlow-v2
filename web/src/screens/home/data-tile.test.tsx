import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ShellContextValue } from "../../app/shell-context";
import type { Attention, ReadState, ScoreState, ScoreSummary } from "../../app/shell-types";
import { DataTile } from "./data-tile";

// The Data tile on Home (CAP-003-E5-S2; component design home-ui 2.2, 2.4,
// section 10; UX design 1.3 Page Layout 2). Every expected string is a literal;
// fixtures are independent literals typed `Attention` and `ScoreSummary`.

const shell = vi.hoisted(() => ({ value: {} as unknown as ShellContextValue }));
vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }));

const ATTENTION: Attention = {
  checked_at: "2026-10-15T22:52:10Z",
  followed_count: 26,
  prices_as_of: "2026-10-14",
  credential_present: true,
  problems: {
    stock_count: 3,
    symbols: ["FBXX", "KO", "TSLA"],
    newest_completed_at: "2026-10-15T22:40:00Z",
  },
  latest_download: {
    run_id: "run-7",
    state: "partial",
    requested_at: "2026-10-15T21:00:00Z",
    started_at: "2026-10-15T21:02:00Z",
    ended_at: "2026-10-15T22:40:00Z",
    progress: { done: 30, total: 30 },
  },
  latest_terminal_download: {
    run_id: "run-7",
    state: "partial",
    ended_at: "2026-10-15T22:40:00Z",
    failure_reason: null,
  },
  items: [],
};

function FIRST(state: "requested" | "running" | "cancelling", startedAt: string | null): Attention {
  return {
    ...ATTENTION,
    problems: { stock_count: 0, symbols: [], newest_completed_at: null },
    latest_terminal_download: null,
    latest_download: {
      run_id: "run-1",
      state,
      requested_at: "2026-10-15T21:00:00Z",
      started_at: startedAt,
      ended_at: null,
      progress: { done: 12, total: 30 },
    },
  };
}

const FACTOR = { qualified_count: 30, ranked: true, min_peer_set_size: 5 };

function SUMMARY(over: Partial<ScoreSummary> = {}): ScoreSummary {
  return {
    never_classified: false,
    set: {
      set_id: "s-1",
      classification_date: "2026-10-15",
      run_id: "run-7",
      run_started_at: "2026-10-15T21:02:00Z",
      run_outcome: "partial",
      state: "complete",
      started_at: "2026-10-15T22:41:00Z",
      ended_at: "2026-10-15T22:46:00Z",
      latest_trading_day: "2026-10-15",
      active_instruments: 30,
      not_current: false,
    },
    later: null,
    factors: Object.fromEntries(
      (["value", "quality", "momentum"] as const).map((name) => [name, FACTOR]),
    ) as ScoreSummary["factors"],
    stocks_current: { current_count: 27, followed_count: 30 },
    ...over,
  } as ScoreSummary;
}

const FAILED = SUMMARY({
  set: { ...SUMMARY().set, not_current: true } as ScoreSummary["set"],
  later: {
    set_id: "s-2",
    state: "failed",
    started_at: "2026-10-15T23:00:00Z",
    ended_at: "2026-10-15T23:05:00Z",
    failure_reason: "The engine stopped",
    run_id: "run-8",
    run_started_at: "2026-10-15T22:58:00Z",
  },
});
const NEVER_FAILED = SUMMARY({
  never_classified: true,
  set: null,
  stocks_current: null,
  later: FAILED.later,
});

const NOT_CURRENT_ONLY = SUMMARY({
  set: { ...SUMMARY().set, not_current: true } as ScoreSummary["set"],
  later: null,
});
const BUILDING = SUMMARY({
  set: { ...SUMMARY().set, not_current: true } as ScoreSummary["set"],
  later: {
    ...FAILED.later,
    state: "building",
    ended_at: null,
    failure_reason: null,
  } as ScoreSummary["later"],
});
const NEVER = SUMMARY({ never_classified: true, set: null, stocks_current: null, later: null });

function VERDICT(
  stockCount: number,
  followedCount: number,
  state: "succeeded" | "partial" | "failed" | "cancelled" | "abandoned",
): Attention {
  return {
    ...ATTENTION,
    followed_count: followedCount,
    problems: { ...ATTENTION.problems, stock_count: stockCount },
    latest_terminal_download: {
      ...ATTENTION.latest_terminal_download,
      state,
    } as Attention["latest_terminal_download"],
  };
}

const served = (data: ScoreSummary): ScoreState => ({
  kind: "served",
  data,
  checkedAt: new Date("2026-10-15T22:53:00Z"),
});
const NOT_SERVED: ScoreState = { kind: "not_served" };
const ok = (data: Attention): ReadState<Attention> => ({
  kind: "ok",
  data,
  checkedAt: new Date("2026-10-15T22:53:41Z"),
});
const LOADING: ScoreState = { kind: "loading" };
const ATT_LOADING: ReadState<Attention> = { kind: "loading" };

function show(attention: ReadState<Attention>, scores: ScoreState): HTMLElement {
  shell.value = {
    health: { kind: "loading" },
    attention,
    scores,
    refresh: vi.fn(),
    setTitleDetail: vi.fn(),
  } as unknown as ShellContextValue;
  return render(
    <MemoryRouter>
      <DataTile />
    </MemoryRouter>,
  ).container;
}

const text = (c: HTMLElement): string => (c.textContent ?? "").replace(/\s+/g, " ").trim();
const badgeOf = (c: HTMLElement): Element | null =>
  c.querySelector('[data-testid="data-tile-badge"] [data-variant^="status-"]');
const statusElements = (c: HTMLElement): NodeListOf<Element> =>
  c.querySelectorAll('[data-variant^="status-"]');

beforeEach(() => {
  shell.value = {} as unknown as ShellContextValue;
});

// Implements TC-COMP-136
describe("DataTile first download (TC-COMP-136; DAC-E5-S2-1, DAC-E5-2, AC-21)", () => {
  it("(a) requested: the sentence from requested_at and no badge", () => {
    const c = show(ok(FIRST("requested", null)), NOT_SERVED);
    expect(text(c)).toContain("Your first download, started 2026-10-15 16:00 CDT, is running.");
    expect(badgeOf(c)).toBeNull();
    expect(statusElements(c).length).toBe(0);
  });

  it("(b) running: the sentence from started_at and one Downloading badge", () => {
    const c = show(ok(FIRST("running", "2026-10-15T21:02:00Z")), NOT_SERVED);
    expect(text(c)).toContain("started 2026-10-15 16:02 CDT");
    expect(statusElements(c).length).toBe(1);
    const badge = c.querySelector('[data-variant="status-active"]');
    expect(badge?.textContent?.trim()).toBe("Downloading");
  });

  it("(c) no verdict word, hero, as-of, lag or progress, whatever the score state", () => {
    const attentions = [FIRST("requested", null), FIRST("running", "2026-10-15T21:02:00Z")];
    const words =
      /\b(?:Yes|No|Mostly yes|Score update failed|Not reflecting the latest download|No scores yet)\b/;
    for (const scores of [NOT_SERVED, served(NEVER_FAILED)]) {
      for (const attention of attentions) {
        const c = show(ok(attention), scores);
        const t = text(c);
        expect(t).not.toMatch(words);
        for (const absent of [
          "stocks current",
          "Scores ",
          "Prices ",
          "Every other number",
          "12 of",
        ]) {
          expect(t).not.toContain(absent);
        }
      }
    }
  });

  it("(d) settled: with a download ended the verdict badge shows", () => {
    const c = show(ok(ATTENTION), NOT_SERVED);
    const badge = badgeOf(c);
    expect(badge?.getAttribute("data-variant")).toBe("status-warning");
    expect(badge?.textContent?.trim()).toBe("Mostly yes");
  });
});

describe("DataTile states before the full tile (T010 a-c, T007 b)", () => {
  it("(a) attention loading: a busy skeleton, no link, no badge, no error", () => {
    const c = show(ATT_LOADING, NOT_SERVED);
    expect(c.querySelector('[data-testid="data-tile-skeleton"]')?.getAttribute("aria-busy")).toBe(
      "true",
    );
    expect(within(c).queryAllByRole("link").length).toBe(0);
    expect(statusElements(c).length).toBe(0);
    expect(text(c)).not.toContain("Couldn't read");
  });

  it("(d) summary loading after a download ended: the skeleton, no badge", () => {
    const c = show(ok(ATTENTION), LOADING);
    expect(c.querySelector('[data-testid="data-tile-skeleton"]')).not.toBeNull();
    expect(statusElements(c).length).toBe(0);
  });

  it("(d) summary loading during the first download: the sentence, not the skeleton", () => {
    const c = show(ok(FIRST("running", "2026-10-15T21:02:00Z")), LOADING);
    expect(c.querySelector('[data-testid="data-tile-skeleton"]')).toBeNull();
    expect(text(c)).toContain("Your first download, started 2026-10-15 16:02 CDT, is running.");
  });

  it("(b) no download at all: nothing renders", () => {
    const c = show(
      ok({ ...ATTENTION, latest_download: null, latest_terminal_download: null }),
      NOT_SERVED,
    );
    expect(c.innerHTML).toBe("");
  });

  it("(c) cancelling: the sentence and no status element", () => {
    const c = show(ok(FIRST("cancelling", "2026-10-15T21:02:00Z")), NOT_SERVED);
    expect(text(c)).toContain("Your first download, started 2026-10-15 16:02 CDT, is running.");
    expect(statusElements(c).length).toBe(0);
  });

  it("the first-download state is one link named by its sentence", () => {
    const c = show(ok(FIRST("running", "2026-10-15T21:02:00Z")), NOT_SERVED);
    const links = within(c).getAllByRole("link");
    expect(links.length).toBe(1);
    expect(links[0]?.getAttribute("href")).toMatch(/\/data$/);
    expect(links[0]?.getAttribute("aria-label")).toBe(
      "Data: your first download, started 2026-10-15 16:02 CDT, is running.",
    );
  });
});

const variantOf = (el: Element | null): string | null => el?.getAttribute("data-variant") ?? null;
const lagOf = (c: HTMLElement): Element | null =>
  c.querySelector('[data-testid="data-tile-lag"] [data-variant^="status-"]');
const heroOf = (c: HTMLElement): HTMLElement => {
  const hero = c.querySelector<HTMLElement>(".font-numeric");
  if (hero === null) {
    throw new Error("no hero");
  }
  return hero;
};
const lineStarting = (c: HTMLElement, start: string): HTMLElement => {
  const line = [...c.querySelectorAll<HTMLElement>("p.text-xs")].find((p) =>
    text(p as HTMLElement).startsWith(start),
  );
  if (line === undefined) {
    throw new Error(`no line starting ${start}`);
  }
  return line;
};
const collapsed = (el: HTMLElement): string => (el.textContent ?? "").replace(/\s+/g, " ").trim();
const nameOf = (c: HTMLElement): string | null =>
  within(c).getAllByRole("link")[0]?.getAttribute("aria-label") ?? null;
const DASH_THEN_WORDS = (el: HTMLElement, words: string): void => {
  const dash = el.querySelector('[aria-hidden="true"]');
  expect(dash?.textContent).toBe("—");
  expect(dash?.nextElementSibling?.className).toContain("sr-only");
  expect(dash?.nextElementSibling?.textContent).toBe(words);
};

// Implements TC-COMP-137
describe("DataTile verdict (TC-COMP-137; DAC-E5-S2-2, DAC-E5-3, AC-11)", () => {
  it.each([
    [1, 10, "partial", "status-warning", "Mostly yes"],
    [10, 10, "succeeded", "status-critical", "No"],
    [0, 10, "failed", "status-critical", "No"],
    [0, 10, "abandoned", "status-serious", "Mostly yes"],
    [0, 10, "succeeded", "status-good", "Yes"],
    [0, 10, "cancelled", "status-good", "Yes"],
  ] as const)("(a) %s of %s, %s -> %s %s", (stock, followed, state, variant, word) => {
    const c = show(ok(VERDICT(stock, followed, state)), NOT_SERVED);
    expect(variantOf(badgeOf(c))).toBe(variant);
    expect(badgeOf(c)?.textContent?.trim()).toBe(word);
  });

  it("(a) reads the terminal download, not the latest", () => {
    const a = VERDICT(0, 10, "failed");
    const c = show(
      ok({
        ...a,
        latest_download: {
          ...a.latest_download,
          state: "succeeded",
        } as Attention["latest_download"],
      }),
      NOT_SERVED,
    );
    expect(badgeOf(c)?.textContent?.trim()).toBe("No");
  });

  it.each([
    ["FAILED", FAILED, "status-critical", "Score update failed"],
    ["NEVER", NEVER, "status-good", "Yes"],
    ["BUILDING", BUILDING, "status-good", "Yes"],
    ["NEVER_FAILED", NEVER_FAILED, "status-good", "Yes"],
    ["NOT_CURRENT_ONLY", NOT_CURRENT_ONLY, "status-warning", "Not reflecting the latest download"],
    ["SUMMARY", SUMMARY(), "status-good", "Yes"],
  ] as const)("(b) score state %s over a good verdict -> %s %s", (_n, summary, variant, word) => {
    const c = show(ok(VERDICT(0, 10, "succeeded")), served(summary));
    expect(variantOf(badgeOf(c))).toBe(variant);
    expect(badgeOf(c)?.textContent?.trim()).toBe(word);
  });

  it.each([
    [VERDICT(10, 10, "succeeded"), FAILED, "status-critical", "No"],
    [VERDICT(1, 10, "partial"), FAILED, "status-critical", "Score update failed"],
    [VERDICT(1, 10, "partial"), BUILDING, "status-warning", "Mostly yes"],
  ] as const)("(c) ties and the worse verdict %#", (attention, summary, variant, word) => {
    const c = show(ok(attention), served(summary));
    expect(variantOf(badgeOf(c))).toBe(variant);
    expect(badgeOf(c)?.textContent?.trim()).toBe(word);
  });
});

// Implements TC-COMP-128
describe("DataTile hero and as-of lines (TC-COMP-128; DAC-E5-4, AC-8)", () => {
  it("(a) served: 27 of 30, never 27 of 26", () => {
    const c = show(ok(ATTENTION), served(SUMMARY()));
    expect(collapsed(heroOf(c))).toBe("27 of 30 stocks current");
    expect(text(c)).toContain("Scores 2026-10-15 17:46 CDT");
    expect(text(c)).toContain("Prices 2026-10-14");
  });

  it("(b) not served: dashes through Absent and attention's followed count", () => {
    const c = show(ok(ATTENTION), NOT_SERVED);
    DASH_THEN_WORDS(heroOf(c), "not determinable");
    expect(collapsed(heroOf(c))).toBe("—not determinable of 26 stocks current");
    expect(collapsed(lineStarting(c, "Scores"))).toBe("Scores —not determinable");
    DASH_THEN_WORDS(lineStarting(c, "Scores"), "not determinable");
    expect(text(c)).toContain("Prices 2026-10-14");
    expect(text(c)).not.toContain("0 of");
  });

  it("(c) never classified: no scores yet, prices unconverted", () => {
    const c = show(ok(ATTENTION), served(NEVER));
    DASH_THEN_WORDS(heroOf(c), "not determinable");
    expect(collapsed(heroOf(c))).toBe("—not determinable of 26 stocks current");
    expect(collapsed(lineStarting(c, "No scores yet"))).toBe("No scores yet");
    expect(text(c)).toContain("Prices 2026-10-14");
    expect(text(c)).not.toContain("0 of");
  });

  it("(e) no prices yet: the prices line is a dash with hidden words", () => {
    const c = show(ok({ ...ATTENTION, prices_as_of: null }), served(SUMMARY()));
    const line = lineStarting(c, "Prices");
    expect(collapsed(line)).toBe("Prices —not downloaded yet");
    DASH_THEN_WORDS(line, "not downloaded yet");
    expect(text(c)).not.toContain("Prices null");
  });
});

// Implements TC-COMP-129
describe("DataTile lag badge (TC-COMP-129; DAC-E5-5)", () => {
  it.each([
    ["not_current only", NOT_CURRENT_ONLY],
    ["building", BUILDING],
    ["failed", FAILED],
    ["never classified, failed", NEVER_FAILED],
  ])("renders when %s, after the prices line", (_n, summary) => {
    const c = show(ok(ATTENTION), served(summary));
    const lag = lagOf(c);
    expect(variantOf(lag)).toBe("status-warning");
    expect(lag?.textContent?.trim()).toBe("Not reflecting the latest download");
    const wrapper = c.querySelector('[data-testid="data-tile-lag"]') as Element;
    expect(
      lineStarting(c, "Prices").compareDocumentPosition(wrapper) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it.each([
    ["current", served(SUMMARY())],
    ["never classified", served(NEVER)],
    ["not served", NOT_SERVED],
  ])("is absent when %s", (_n, scores) => {
    const c = show(ok(ATTENTION), scores);
    expect(lagOf(c)).toBeNull();
    expect(text(c)).not.toContain("Not reflecting");
  });
});

// Implements TC-COMP-138
describe("DataTile link (TC-COMP-138; DAC-E5-S2-3)", () => {
  it("(a) one link named by title, verdict, figures and as-of", async () => {
    const c = show(ok(ATTENTION), served(SUMMARY()));
    const links = within(c).getAllByRole("link");
    expect(links.length).toBe(1);
    expect(links[0]?.getAttribute("href")).toMatch(/\/data$/);
    expect(nameOf(c)).toBe(
      "Data: mostly yes. 27 of 30 stocks current. Scores 2026-10-15 17:46 CDT, prices 2026-10-14.",
    );
    expect(
      within(links[0] as HTMLElement).getByRole("heading", { level: 2, name: "Data" }),
    ).toBeTruthy();
    await userEvent.tab();
    expect(document.activeElement).toBe(links[0]);
  });

  it.each([
    [
      "not served",
      NOT_SERVED,
      ATTENTION,
      "Data: mostly yes. not determinable of 26 stocks current. Scores not determinable, prices 2026-10-14.",
    ],
    [
      "never classified",
      served(NEVER),
      ATTENTION,
      "Data: mostly yes. not determinable of 26 stocks current. Scores no scores yet, prices 2026-10-14.",
    ],
    [
      "score failed",
      served(FAILED),
      VERDICT(0, 10, "succeeded"),
      "Data: score update failed. 27 of 30 stocks current. Scores 2026-10-15 17:46 CDT, prices 2026-10-14.",
    ],
  ])("(c) the name when %s", (_n, scores, attention, expected) => {
    const c = show(ok(attention), scores);
    expect(nameOf(c)).toBe(expected);
  });

  it("(c) no prices yet ends the name with not downloaded yet", () => {
    const c = show(ok({ ...ATTENTION, prices_as_of: null }), served(SUMMARY()));
    expect(nameOf(c)?.endsWith(", prices not downloaded yet.")).toBe(true);
  });

  it("(d) never reads the aggregate, and imports no reader", () => {
    // Every attention state crossed with every score state, so no row of
    // T002 to T005 or T010 can be left out of the no-read check.
    const running = "2026-10-15T21:02:00Z";
    const attentions: ReadState<Attention>[] = [
      ATT_LOADING,
      ok({ ...ATTENTION, latest_download: null, latest_terminal_download: null }),
      ok(FIRST("requested", null)),
      ok(FIRST("running", running)),
      ok(FIRST("cancelling", running)),
      ok(ATTENTION),
      ok({ ...ATTENTION, prices_as_of: null }),
      ...(
        [
          [1, 10, "partial"],
          [10, 10, "succeeded"],
          [0, 10, "failed"],
          [0, 10, "abandoned"],
          [0, 10, "succeeded"],
          [0, 10, "cancelled"],
        ] as const
      ).map(([stock, followed, state]) => ok(VERDICT(stock, followed, state))),
    ];
    const scoreStates: ScoreState[] = [
      NOT_SERVED,
      LOADING,
      ...[SUMMARY(), NEVER, NEVER_FAILED, BUILDING, FAILED, NOT_CURRENT_ONLY].map(served),
    ];
    const states = attentions.flatMap((attention) =>
      scoreStates.map((scores): [ReadState<Attention>, ScoreState] => [attention, scores]),
    );
    expect(states.length).toBe(attentions.length * scoreStates.length);
    for (const [attention, scores] of states) {
      show(attention, scores);
    }
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    const source = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), "data-tile.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/from\s+["'][^"']*(use-data-health|shell-client)["']/);
    expect(source).not.toMatch(/\bfetch\b/);
  });
});

// Implements TC-COMP-140
describe("DataTile shape and dashes (TC-COMP-140; DAC-E5-S2-5, AC-20)", () => {
  it("(a) every badge carries its label as text and one hidden shape", () => {
    const rendered: [HTMLElement, string][] = [];
    for (const [a, w] of [
      [VERDICT(1, 10, "partial"), "Mostly yes"],
      [VERDICT(10, 10, "succeeded"), "No"],
      [VERDICT(0, 10, "failed"), "No"],
      [VERDICT(0, 10, "abandoned"), "Mostly yes"],
      [VERDICT(0, 10, "succeeded"), "Yes"],
      [VERDICT(0, 10, "cancelled"), "Yes"],
    ] as const) {
      rendered.push([show(ok(a), NOT_SERVED), w]);
    }
    rendered.push([show(ok(VERDICT(0, 10, "succeeded")), served(FAILED)), "Score update failed"]);
    rendered.push([
      show(ok(VERDICT(0, 10, "succeeded")), served(NOT_CURRENT_ONLY)),
      "Not reflecting the latest download",
    ]);
    rendered.push([show(ok(FIRST("running", "2026-10-15T21:02:00Z")), NOT_SERVED), "Downloading"]);
    for (const [c, word] of rendered) {
      const badge = c.querySelector('[data-testid="data-tile-badge"] [data-variant^="status-"]');
      expect(badge?.textContent?.trim()).toBe(word);
      expect(badge?.querySelectorAll("svg").length).toBe(1);
      expect(badge?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
      expect(
        [...(badge?.childNodes ?? [])].some((n) => n.nodeType === 3 && n.textContent === word),
      ).toBe(true);
    }
    for (const summary of [NOT_CURRENT_ONLY, BUILDING, FAILED, NEVER_FAILED]) {
      const lag = lagOf(show(ok(ATTENTION), served(summary)));
      expect(lag?.textContent?.trim()).toBe("Not reflecting the latest download");
      expect(lag?.querySelectorAll("svg").length).toBe(1);
      expect(lag?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
      expect(
        [...(lag?.childNodes ?? [])].some(
          (n) => n.nodeType === 3 && n.textContent === "Not reflecting the latest download",
        ),
      ).toBe(true);
    }
  });

  it("(b) every dash is aria-hidden with hidden words after it", () => {
    for (const scores of [NOT_SERVED, served(NEVER)]) {
      const c = show(ok(ATTENTION), scores);
      for (const dash of [...c.querySelectorAll("span")].filter((el) => el.textContent === "—")) {
        expect(dash.getAttribute("aria-hidden")).toBe("true");
        expect(dash.nextElementSibling?.className).toContain("sr-only");
        expect(dash.nextElementSibling?.textContent).toBe("not determinable");
      }
    }
  });

  it("(c) no coverage-unknown badge in any state", () => {
    for (const scores of [NOT_SERVED, served(NEVER), served(SUMMARY()), served(FAILED)]) {
      expect(
        show(ok(ATTENTION), scores).querySelector('[data-variant="coverage-unknown"]'),
      ).toBeNull();
    }
  });
});

describe("DataTile composition (T010 f, g)", () => {
  it("(g) a metric card, a numeric hero, muted lines, a labelled section, no inline style", () => {
    const c = show(ok(ATTENTION), served(SUMMARY()));
    expect(c.querySelector('[data-variant="metric"]')).not.toBeNull();
    const hero = heroOf(c);
    expect(hero.className).toContain("font-numeric");
    expect(hero.className).toContain("text-2xl");
    for (const start of ["Scores", "Prices"]) {
      expect(lineStarting(c, start).className).toContain("text-xs");
      expect(lineStarting(c, start).className).toContain("text-muted-foreground");
    }
    const section = c.querySelector("section");
    const heading = within(c).getByRole("heading", { level: 2, name: "Data" });
    expect(section?.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(c.querySelectorAll("[style]").length).toBe(0);
  });

  describe.each(["Asia/Tokyo", "America/Los_Angeles"])("under TZ=%s", (zone) => {
    let previous: string | undefined;
    beforeEach(() => {
      previous = process.env.TZ;
      process.env.TZ = zone;
    });
    afterEach(() => {
      if (previous === undefined) {
        Reflect.deleteProperty(process.env, "TZ");
      } else {
        process.env.TZ = previous;
      }
    });

    it("(f) reads America/Chicago, not the machine zone", () => {
      const c = show(ok(ATTENTION), served(SUMMARY()));
      expect(text(c)).toContain("Scores 2026-10-15 17:46 CDT");
      expect(text(c)).toContain("Prices 2026-10-14");
      const first = show(ok(FIRST("running", "2026-10-15T21:02:00Z")), NOT_SERVED);
      expect(text(first)).toContain("16:02 CDT");
    });
  });
});
