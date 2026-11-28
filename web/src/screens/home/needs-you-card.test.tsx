import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../../api/client";
import type { ShellContextValue } from "../../app/shell-context";
import type { Attention, ReadState, ScoreState, ScoreSummary } from "../../app/shell-types";
import { NEEDS_YOU_STATES, NeedsYouCard } from "./needs-you-card";

// The Needs you card on Home (CAP-003-E5-S3; component design home-ui 2.5,
// section 3 and section 10; UX design 1.3 Page Layout 3). Every expected string
// is a literal; fixtures are independent literals typed `Attention` and
// `ScoreSummary`, never produced by the code under test.

const shell = vi.hoisted(() => ({ value: {} as unknown as ShellContextValue }));
vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }));

const ATTENTION: Attention = {
  checked_at: "2026-10-15T22:52:10Z",
  followed_count: 26,
  prices_as_of: "2026-10-14",
  credential_present: false,
  problems: {
    stock_count: 3,
    symbols: ["KO", "TSLA", "FBXX"],
    newest_completed_at: "2026-10-15T22:31:00Z",
  },
  latest_download: {
    run_id: "run-7",
    state: "failed",
    requested_at: "2026-10-15T21:00:00Z",
    started_at: "2026-10-15T21:02:00Z",
    ended_at: "2026-10-15T22:40:00Z",
    progress: { done: 30, total: 30 },
  },
  latest_terminal_download: {
    run_id: "run-7",
    state: "failed",
    ended_at: "2026-10-15T22:40:00Z",
    failure_reason: "The market data service refused the request",
  },
  items: [
    { kind: "data_problems", recorded_at: "2026-10-15T22:31:00Z", run_id: null },
    { kind: "download_not_complete", recorded_at: "2026-10-15T22:40:00Z", run_id: "run-7" },
    { kind: "credential_missing", recorded_at: "2026-10-15T22:52:10Z", run_id: null },
  ],
};

const INTERRUPTED: Attention = {
  ...ATTENTION,
  latest_download: {
    ...ATTENTION.latest_download,
    state: "abandoned",
  } as Attention["latest_download"],
  latest_terminal_download: {
    run_id: "run-7",
    state: "abandoned",
    ended_at: "2026-10-15T22:40:00Z",
    failure_reason: null,
  },
};

function FIRST(total: number | null): Attention {
  return {
    ...ATTENTION,
    credential_present: true,
    problems: { stock_count: 0, symbols: [], newest_completed_at: null },
    items: [],
    latest_terminal_download: null,
    latest_download: {
      run_id: "run-1",
      state: "running",
      requested_at: "2026-10-15T21:00:00Z",
      started_at: "2026-10-15T21:02:00Z",
      ended_at: null,
      progress: { done: 12, total },
    },
  };
}

const SCORED: Attention = {
  ...FIRST(30),
  latest_download: {
    ...FIRST(30).latest_download,
    state: "succeeded",
    ended_at: "2026-10-15T22:40:00Z",
  } as Attention["latest_download"],
  latest_terminal_download: {
    run_id: "run-1",
    state: "succeeded",
    ended_at: "2026-10-15T22:40:00Z",
    failure_reason: null,
  },
};

const FACTOR = { qualified_count: 30, ranked: true, min_peer_set_size: 5 };

function SUMMARY(over: Partial<ScoreSummary> = {}): ScoreSummary {
  return {
    never_classified: false,
    set: {
      set_id: "s-1",
      classification_date: "2026-10-15",
      run_id: "run-1",
      run_started_at: "2026-10-15T21:02:00Z",
      run_outcome: "succeeded",
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
    failure_reason: "The scoring engine stopped",
    run_id: "run-8",
    run_started_at: "2026-10-15T22:58:00Z",
  },
});
const NEVER_BUILDING = SUMMARY({
  never_classified: true,
  set: null,
  stocks_current: null,
  later: {
    set_id: "s-1",
    state: "building",
    started_at: "2026-10-15T22:41:00Z",
    ended_at: null,
    failure_reason: null,
    run_id: "run-1",
    run_started_at: "2026-10-15T21:02:00Z",
  },
});
const NEVER_FAILED = SUMMARY({
  never_classified: true,
  set: null,
  stocks_current: null,
  later: {
    set_id: "s-1",
    state: "failed",
    started_at: "2026-10-15T22:41:00Z",
    ended_at: "2026-10-15T23:05:00Z",
    failure_reason: "The scoring engine stopped",
    run_id: "run-1",
    run_started_at: "2026-10-15T21:02:00Z",
  },
});

const served = (data: ScoreSummary): ScoreState => ({
  kind: "served",
  data,
  checkedAt: new Date("2026-10-15T22:53:00Z"),
});
const NOT_SERVED: ScoreState = { kind: "not_served" };
const SCORES_LOADING: ScoreState = { kind: "loading" };
const SUMMARY_500: ScoreState = {
  kind: "error",
  error: new ApiError("Internal error", "req-9f3", { code: "internal_error" }),
  last: null,
};
const ok = (data: Attention): ReadState<Attention> => ({
  kind: "ok",
  data,
  checkedAt: new Date("2026-10-15T22:53:41Z"),
});
const ATT_LOADING: ReadState<Attention> = { kind: "loading" };
const ATT_500: ReadState<Attention> = {
  kind: "error",
  error: new ApiError("Internal error", "req-9f3", { code: "internal_error" }),
  last: null,
};

function LocationProbe(): ReactElement {
  return <p data-testid="location">{useLocation().pathname}</p>;
}

function tree(): ReactElement {
  return (
    <MemoryRouter initialEntries={["/home"]}>
      <Routes>
        <Route path="/home" element={<NeedsYouCard />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function setShell(attention: ReadState<Attention>, scores: ScoreState): void {
  shell.value = {
    health: { kind: "loading" },
    attention,
    scores,
    refresh: vi.fn(),
    setTitleDetail: vi.fn(),
  } as unknown as ShellContextValue;
}

function mount(attention: ReadState<Attention>, scores: ScoreState) {
  setShell(attention, scores);
  const result = render(tree());
  return {
    ...result,
    update: (a: ReadState<Attention>, s: ScoreState) => {
      setShell(a, s);
      result.rerender(tree());
    },
  };
}

const card = (): HTMLElement => screen.getByRole("region", { name: /^Needs you/ });
const rows = (): HTMLElement[] => within(card()).queryAllByRole("listitem");
const squash = (e: Element | null): string => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
const titleOf = (row: HTMLElement): string => squash(row.querySelector("p.font-semibold"));
const bodyOf = (row: HTMLElement): string => squash(row.querySelectorAll("p")[1] ?? null);
const rowByTitle = (title: string): HTMLElement => {
  const found = rows().find((row) => titleOf(row) === title);
  if (found === undefined) {
    throw new Error(`no row titled ${title}`);
  }
  return found;
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-10-16T01:00:00Z"));
  vi.mocked(fetch).mockClear();
});
afterEach(() => {
  vi.useRealTimers();
});

const userSetup = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

describe("order, names and no mutation (TC-COMP-141; DAC-E5-S3-1, DAC-E5-7, DAC-E5-8)", () => {
  // Implements TC-COMP-141
  it("orders by tier then recency", () => {
    mount(ok(ATTENTION), served(SUMMARY()));
    expect(rows().map(titleOf)).toEqual([
      "The market data key is missing",
      "The last download failed",
      "KO, TSLA and FBXX are missing data",
    ]);
  });

  it("puts an interrupted download between critical and warning", () => {
    mount(ok(INTERRUPTED), served(SUMMARY()));
    expect(rows().map(titleOf)).toEqual([
      "The market data key is missing",
      "The last download was interrupted",
      "KO, TSLA and FBXX are missing data",
    ]);
  });

  it("gives each row exactly one link, named for the item, styled outline", () => {
    mount(ok(ATTENTION), served(SUMMARY()));
    const links = rows().map((row) => {
      const found = within(row).getAllByRole("link");
      expect(found).toHaveLength(1);
      return found[0] as HTMLElement;
    });
    expect(links.map((l) => l.getAttribute("aria-label"))).toEqual([
      "Open Settings to set the market data key",
      "See the download that failed",
      "Fix data for KO, TSLA and FBXX",
    ]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/settings",
      "/data/downloads/run-7",
      "/data",
    ]);
    expect(links.map((l) => l.textContent)).toEqual(["Open Settings", "See download", "Fix data"]);
    for (const link of links) {
      expect(link.getAttribute("data-variant")).toBe("outline");
    }
  });

  it("completes each action by keyboard and never calls fetch", async () => {
    const user = userSetup();
    const expected = ["/settings", "/data/downloads/run-7", "/data"];
    for (const [index, href] of expected.entries()) {
      const view = mount(ok(ATTENTION), served(SUMMARY()));
      const link = within(rows()[index] as HTMLElement).getByRole("link");
      for (let guard = 0; guard < 20 && document.activeElement !== link; guard += 1) {
        await user.tab();
      }
      expect(document.activeElement).toBe(link);
      await user.keyboard("{Enter}");
      expect(screen.getByTestId("location").textContent).toBe(href);
      view.unmount();
    }
    expect(vi.mocked(fetch).mock.calls).toEqual([]);
  });

  it("holds no button: the only control is a link", () => {
    mount(ok(ATTENTION), served(SUMMARY()));
    expect(within(card()).queryAllByRole("button")).toEqual([]);
  });
});

describe("a count change is announced politely and focus stays (TC-COMP-142; DAC-E5-S3-2, DAC-E5-9)", () => {
  // Implements TC-COMP-142
  it("removes the item, announces the new count, and keeps focus", () => {
    const view = mount(ok(ATTENTION), served(SUMMARY()));
    const status = within(card()).getByRole("status");
    expect(status.tagName).toBe("OUTPUT");
    expect(status.textContent).toBe("Needs you · 3");
    expect(status.getAttribute("aria-live")).not.toBe("assertive");
    expect(within(card()).queryByRole("alert")).toBeNull();

    const link = within(card()).getByRole("link", { name: "See the download that failed" });
    link.focus();
    const focused = document.activeElement;

    const reduced = ok({
      ...ATTENTION,
      problems: { stock_count: 0, symbols: [], newest_completed_at: null },
      items: ATTENTION.items.filter((i) => i.kind !== "data_problems"),
    });
    view.update(reduced, served(SUMMARY()));
    expect(rows()).toHaveLength(2);
    expect(screen.queryByText("KO, TSLA and FBXX are missing data")).toBeNull();
    expect(within(card()).getByRole("status")).toBe(status);
    expect(status.textContent).toBe("Needs you · 2");
    expect(document.activeElement).toBe(focused);
    expect(focused?.isConnected).toBe(true);
    expect(card().querySelector("h2")?.textContent).toBe("Needs you · 2");

    view.update(reduced, served(SUMMARY()));
    expect(rows()).toHaveLength(2);
  });

  it("keeps an item that is merely re-rendered", () => {
    const view = mount(ok(ATTENTION), served(SUMMARY()));
    view.update(ok(ATTENTION), served(SUMMARY()));
    view.update(ok(ATTENTION), served(SUMMARY()));
    expect(rows()).toHaveLength(3);
  });

  it("reads Nothing needs you right now with the checked time at zero items", () => {
    const view = mount(ok(ATTENTION), served(SUMMARY()));
    expect(rows()).toHaveLength(3);
    view.update(
      ok({
        ...FIRST(30),
        latest_download: {
          ...FIRST(30).latest_download,
          state: "succeeded",
        } as Attention["latest_download"],
        latest_terminal_download: {
          run_id: "run-1",
          state: "succeeded",
          ended_at: "2026-10-15T22:40:00Z",
          failure_reason: null,
        },
      }),
      served(SUMMARY()),
    );
    expect(rows()).toEqual([]);
    expect(card().querySelector("ul")).toBeNull();
    expect(squash(card())).toContain("Nothing needs you right now.");
    expect(squash(card())).toContain("checked 17:52:10 CDT");
    expect(within(card()).getByRole("status").textContent).toBe("Needs you · 0");
    expect(card().querySelector("h2")?.textContent).toBe("Needs you · 0");
    expect(squash(card())).not.toMatch(/No .*match/);
  });
});

describe("tag badges and severity tiles (TC-COMP-146; DAC-E5-S3-6)", () => {
  // Implements TC-COMP-146
  it.each([
    [
      ok(ATTENTION),
      served(SUMMARY()),
      "The market data key is missing",
      "status-critical",
      "Setup",
      "rect",
    ],
    [
      ok(ATTENTION),
      served(SUMMARY()),
      "The last download failed",
      "status-critical",
      "Download",
      "rect",
    ],
    [
      ok(ATTENTION),
      served(SUMMARY()),
      "KO, TSLA and FBXX are missing data",
      "status-warning",
      "Data",
      "path",
    ],
    [
      ok(INTERRUPTED),
      served(SUMMARY()),
      "The last download was interrupted",
      "status-serious",
      "Download",
      "path",
    ],
    [
      ok(FIRST(30)),
      NOT_SERVED,
      "Your first download is running",
      "status-active",
      "Download",
      "circle",
    ],
    [
      ok(SCORED),
      served(NEVER_BUILDING),
      "Your first scores are being produced",
      "status-active",
      "Scores",
      "circle",
    ],
    [
      ok(SCORED),
      served(FAILED),
      "The latest score update failed",
      "status-critical",
      "Scores",
      "rect",
    ],
  ] as const)("%#: %s", (attention, scores, title, variant, tag, shape) => {
    mount(attention, scores);
    const row = rowByTitle(title);
    const badges = row.querySelectorAll('[data-variant^="status-"]');
    expect(badges).toHaveLength(1);
    const badge = badges[0] as Element;
    expect(badge.getAttribute("data-variant")).toBe(variant);
    expect(squash(badge)).toBe(tag);
    const shapes = badge.querySelectorAll("svg");
    expect(shapes).toHaveLength(1);
    expect((shapes[0] as Element).getAttribute("aria-hidden")).toBe("true");
    expect((shapes[0] as Element).firstElementChild?.tagName.toLowerCase()).toBe(shape);
    const tile = row.querySelector('[data-slot="severity-tile"]') as HTMLElement;
    expect(tile.getAttribute("aria-hidden")).toBe("true");
    expect(tile.style.width).toBe("28px");
    expect(tile.style.height).toBe("28px");
    expect(row.querySelector('[data-variant="coverage-unknown"]')).toBeNull();
  });

  it("tells the tiers apart by shape and by a word, never by colour alone", () => {
    const shapeOf = (title: string): string => {
      const badge = rowByTitle(title).querySelector('[data-variant^="status-"]') as Element;
      return (badge.querySelector("svg")?.firstElementChild?.tagName ?? "").toLowerCase();
    };
    mount(ok(ATTENTION), served(SUMMARY()));
    const critical = shapeOf("The market data key is missing");
    const warning = shapeOf("KO, TSLA and FBXX are missing data");
    expect(new Set([critical, warning]).size).toBe(2);
    for (const row of rows()) {
      const badge = row.querySelector('[data-variant^="status-"]') as Element;
      expect(squash(badge).length).toBeGreaterThan(0);
    }
  });
});

describe("catalogue copy per kind (DAC-E5-7, DAC-E5-8, AC-7, AC-12; DEC-0368, DEC-0369)", () => {
  const only = (
    kind: Attention["items"][number]["kind"],
    over: Partial<Attention> = {},
  ): Attention => ({
    ...ATTENTION,
    items: ATTENTION.items.filter((i) => i.kind === kind),
    ...over,
  });
  const linkOf = (row: HTMLElement): HTMLElement => within(row).getByRole("link");
  const expectAction = (row: HTMLElement, label: string, name: string, href: string): void => {
    const link = linkOf(row);
    expect(link.textContent).toBe(label);
    expect(link.getAttribute("aria-label")).toBe(name);
    expect(link.getAttribute("href")).toBe(href);
  };

  it.each([
    [
      ["KO"],
      1,
      "KO is missing data",
      "Its scores show as Incomplete until the data is complete.",
      "Fix data for KO",
    ],
    [
      ["FBXX", "KO", "TSLA"],
      4,
      "FBXX, KO, TSLA and 1 more stock are missing data",
      "Their scores show as Incomplete until the data is complete.",
      "Fix data for FBXX, KO, TSLA and 1 more stock",
    ],
    [
      ["FBXX", "KO", "TSLA"],
      1239,
      "FBXX, KO, TSLA and 1,236 more stocks are missing data",
      "Their scores show as Incomplete until the data is complete.",
      "Fix data for FBXX, KO, TSLA and 1,236 more stocks",
    ],
    [
      ["KO", "TSLA", "FBXX"],
      3,
      "KO, TSLA and FBXX are missing data",
      "Their scores show as Incomplete until the data is complete.",
      "Fix data for KO, TSLA and FBXX",
    ],
  ] as const)("data_problems %j of %i", (symbols, count, title, body, name) => {
    mount(
      ok(
        only("data_problems", {
          problems: {
            stock_count: count,
            symbols: [...symbols],
            newest_completed_at: "2026-10-15T22:31:00Z",
          },
        }),
      ),
      served(SUMMARY()),
    );
    const row = rowByTitle(title);
    expect(bodyOf(row)).toBe(body);
    expectAction(row, "Fix data", name, "/data");
  });

  it("download_not_complete failed (AC-12)", () => {
    mount(ok(only("download_not_complete")), served(SUMMARY()));
    const row = rowByTitle("The last download failed");
    expect(bodyOf(row)).toBe(
      "The market data service refused the request. Ended 2026-10-15 17:40 CDT.",
    );
    expectAction(row, "See download", "See the download that failed", "/data/downloads/run-7");
  });

  it("download_not_complete interrupted (AC-12)", () => {
    mount(
      ok({ ...INTERRUPTED, items: [ATTENTION.items[1]] as Attention["items"] }),
      served(SUMMARY()),
    );
    const row = rowByTitle("The last download was interrupted");
    expect(bodyOf(row)).toBe(
      "FactorFlow restarted mid-download. Download again to pick up the rest. Ended 2026-10-15 17:40 CDT.",
    );
    expectAction(
      row,
      "See download",
      "See the download that was interrupted",
      "/data/downloads/run-7",
    );
  });

  it("download_not_complete failed with no recorded reason (DEC-0369)", () => {
    mount(
      ok(
        only("download_not_complete", {
          latest_terminal_download: {
            run_id: "run-7",
            state: "failed",
            ended_at: "2026-10-15T22:40:00Z",
            failure_reason: null,
          },
        }),
      ),
      served(SUMMARY()),
    );
    const row = rowByTitle("The last download failed");
    expect(bodyOf(row)).toBe("No reason was recorded. Ended 2026-10-15 17:40 CDT.");
    expectAction(row, "See download", "See the download that failed", "/data/downloads/run-7");
  });

  it("credential_missing never shows a key value", () => {
    mount(ok(only("credential_missing")), served(SUMMARY()));
    const row = rowByTitle("The market data key is missing");
    expect(bodyOf(row)).toBe(
      "Set FACTORFLOW_MASSIVE_API_KEY and restart FactorFlow. Downloads fail until then.",
    );
    expectAction(row, "Open Settings", "Open Settings to set the market data key", "/settings");
  });

  it("first_download with a total (AC-7)", () => {
    mount(ok(FIRST(30)), NOT_SERVED);
    const row = rowByTitle("Your first download is running");
    expect(bodyOf(row)).toBe("12 of 30 stocks so far. Scores appear when it finishes.");
    expectAction(row, "See download", "See your first download", "/data/downloads/run-1");
  });

  it("first_download drops its count clause while the total is null", () => {
    mount(ok(FIRST(null)), NOT_SERVED);
    const body = bodyOf(rowByTitle("Your first download is running"));
    expect(body).toBe("Scores appear when it finishes.");
    expect(body).not.toContain(" of ");
  });

  it("first_scores", () => {
    mount(ok(SCORED), served(NEVER_BUILDING));
    const row = rowByTitle("Your first scores are being produced");
    expect(bodyOf(row)).toBe("Scores appear when this finishes.");
    expectAction(
      row,
      "See download",
      "See the download your first scores come from",
      "/data/downloads/run-1",
    );
  });

  it("score_failed with a set", () => {
    mount(ok(SCORED), served(FAILED));
    const row = rowByTitle("The latest score update failed");
    expect(bodyOf(row)).toBe(
      "The scoring engine stopped. Scores still show the set from the download started 2026-10-15 16:02 CDT.",
    );
    expectAction(row, "See details", "See why the score update failed", "/data");
  });

  it("score_failed without a set drops its second sentence", () => {
    mount(ok(SCORED), served(NEVER_FAILED));
    expect(bodyOf(rowByTitle("The latest score update failed"))).toBe(
      "The scoring engine stopped.",
    );
  });

  it("score_failed with no recorded reason", () => {
    mount(
      ok(SCORED),
      served({ ...FAILED, later: { ...FAILED.later, failure_reason: null } } as ScoreSummary),
    );
    expect(bodyOf(rowByTitle("The latest score update failed"))).toBe(
      "No reason was recorded. Scores still show the set from the download started 2026-10-15 16:02 CDT.",
    );
  });

  describe.each(["Asia/Tokyo", "America/Los_Angeles"])("in %s", (zone) => {
    const saved = process.env.TZ;
    beforeEach(() => {
      process.env.TZ = zone;
    });
    afterEach(() => {
      if (saved === undefined) {
        Reflect.deleteProperty(process.env, "TZ");
      } else {
        process.env.TZ = saved;
      }
    });
    it("reads the owner's zone, not the host's", () => {
      mount(ok(only("download_not_complete")), served(SUMMARY()));
      expect(bodyOf(rowByTitle("The last download failed"))).toContain("17:40 CDT");
    });
    it("reads the set start in the owner's zone", () => {
      mount(ok(SCORED), served(FAILED));
      expect(bodyOf(rowByTitle("The latest score update failed"))).toContain("16:02 CDT");
    });
  });
});

describe("count, summary states, composition and no reads (AC-16, AC-24, AC-26, DAC-E5-9, DAC-E5-11)", () => {
  const SOURCE = readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "needs-you-card.tsx"),
    "utf8",
  );

  it("counts the same derivation as the rail chip", () => {
    mount(
      ok({
        ...SCORED,
        credential_present: true,
        problems: ATTENTION.problems,
        items: [ATTENTION.items[0]] as Attention["items"],
      }),
      served(FAILED),
    );
    expect(card().querySelector("h2")?.textContent).toBe("Needs you · 2");
    expect(within(card()).getByRole("status").textContent).toBe("Needs you · 2");
    expect(rows()).toHaveLength(2);
    expect(SOURCE.split("sortAttention(deriveNeedsYou(")).toHaveLength(2);
    expect(SOURCE).toMatch(
      /import \{[^}]*deriveNeedsYou[^}]*\} from "..\/..\/components\/patterns\/needs-you"/s,
    );
    expect(SOURCE).toMatch(
      /import \{[^}]*sortAttention[^}]*\} from "..\/..\/components\/patterns\/needs-you"/s,
    );
  });

  it("lists the server items while the summary loads", () => {
    mount(ok(ATTENTION), SCORES_LOADING);
    expect(rows().map(titleOf)).toEqual([
      "The market data key is missing",
      "The last download failed",
      "KO, TSLA and FBXX are missing data",
    ]);
  });

  it("shows a bare title and no figure while attention loads", () => {
    mount(ATT_LOADING, SCORES_LOADING);
    expect(card().querySelector("h2")?.textContent).toBe("Needs you");
    expect(squash(card())).not.toContain("checked");
    expect(within(card()).queryByRole("status")).toBeNull();
  });

  it("is composed from the card, with only the tiles styled inline", () => {
    mount(ok(ATTENTION), served(SUMMARY()));
    const region = card();
    expect(region.querySelector('[data-variant="default"]')).not.toBeNull();
    const heading = region.querySelector("h2") as HTMLElement;
    expect(region.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(squash(region)).toContain("Most important first. Nothing here is urgent unless marked.");
    const checked = [...region.querySelectorAll("p")].find((p) => squash(p).startsWith("checked"));
    expect(checked?.className).toContain("text-xs");
    expect(checked?.className).toContain("text-muted-foreground");
    for (const name of ["flex", "items-baseline", "justify-between", "gap-4"]) {
      expect(heading.parentElement?.classList.contains(name)).toBe(true);
    }
    const subLine = [...region.querySelectorAll("p")].find((p) =>
      squash(p).startsWith("Most important first."),
    );
    expect(subLine?.classList.contains("text-sm")).toBe(true);
    expect(subLine?.classList.contains("text-muted-foreground")).toBe(true);
    expect(heading.parentElement?.contains(checked as Element)).toBe(true);
    const list = region.querySelector("ul") as HTMLElement;
    expect(list.tagName).toBe("UL");
    for (const child of list.children) {
      expect(child.tagName).toBe("LI");
    }
    expect(within(region).getByRole("status").className).toContain("sr-only");
    const styled = [...region.querySelectorAll("[style]")];
    expect(styled).toHaveLength(3);
    for (const element of styled) {
      expect(element.getAttribute("data-slot")).toBe("severity-tile");
    }
  });

  it("makes no read of its own", () => {
    expect(SOURCE).not.toMatch(/\bfetch\b/);
    expect(SOURCE).not.toMatch(/\bmethod\b/);
    expect(SOURCE).not.toMatch(/data-health/);
  });
});

// T007 (a) to (d) and T008's records, asserted here as well because this cycle's
// card is what introduces the error path and the records: code and its tests land
// together. home.test.tsx asserts the same behaviour through the whole screen.
describe("attention failure and the state records (DAC-E5-11, DAC-E5-S3-3)", () => {
  const unreachable: ReadState<Attention> = {
    kind: "error",
    error: new ApiUnreachableError("GET /api/attention could not be reached"),
    last: {
      data: { ...ATTENTION, checked_at: "2026-10-15T22:40:05Z" },
      checkedAt: new Date("2026-10-15T22:40:06Z"),
    },
  };

  it("replaces the body with the error, ages checked, and retries attention", async () => {
    const user = userSetup();
    mount(unreachable, served(SUMMARY()));
    expect(squash(card())).toContain("Couldn't read what needs you: FactorFlow is not answering.");
    expect(rows()).toEqual([]);
    expect(squash(card())).toContain("checked 17:40:05 CDT");
    expect(squash(card())).not.toContain("17:52:10");
    const heading = card().querySelector("h2") as HTMLElement;
    expect(heading.querySelector('[aria-hidden="true"]')?.textContent).toBe("—");
    expect(heading.querySelector(".sr-only")?.textContent).toBe("not determinable");
    expect(within(card()).getAllByRole("status")).toHaveLength(1);
    expect(squash(card())).not.toMatch(/Needs you · \d/);
    await user.click(within(card()).getByRole("button", { name: "Try again" }));
    expect(shell.value.refresh).toHaveBeenCalledTimes(1);
    expect(shell.value.refresh).toHaveBeenCalledWith("attention");
  });

  it("never shows the server's words, and shows the absent pair when nothing ever answered", () => {
    mount(ATT_500, served(SUMMARY()));
    expect(squash(card())).toContain(
      "Couldn't read what needs you: FactorFlow hit an unexpected problem.",
    );
    expect(document.body.textContent).not.toContain("req-9f3");
    expect(document.body.textContent).not.toContain("Internal error");
    const checked = [...card().querySelectorAll("p")].find((p) => squash(p).startsWith("checked"));
    expect(checked?.querySelector('[aria-hidden="true"]')?.textContent).toBe("—");
  });

  it("keeps the server items while the summary fails", () => {
    mount(ok(ATTENTION), SUMMARY_500);
    expect(rows().map(titleOf)).toEqual([
      "The market data key is missing",
      "The last download failed",
      "KO, TSLA and FBXX are missing data",
    ]);
    expect(squash(card())).not.toContain("Couldn't read what needs you");
  });

  it("keeps the server items and the first-download item under a summary 404 (DEC-0216)", () => {
    mount(
      ok({
        ...FIRST(30),
        credential_present: false,
        problems: ATTENTION.problems,
        items: [ATTENTION.items[0], ATTENTION.items[2]] as Attention["items"],
      }),
      NOT_SERVED,
    );
    expect(rows().map(titleOf)).toEqual([
      "The market data key is missing",
      "KO, TSLA and FBXX are missing data",
      "Your first download is running",
    ]);
    expect(bodyOf(rowByTitle("Your first download is running"))).toBe(
      "12 of 30 stocks so far. Scores appear when it finishes.",
    );
  });

  it("records why a kind does not apply, and renders the three that do", () => {
    const records = Object.entries(NEEDS_YOU_STATES).filter(([, v]) => typeof v !== "function");
    expect(records.map(([k]) => k).sort()).toEqual([
      "empty-never-populated",
      "empty-no-match",
      "partial",
      "unavailable",
      "unreachable",
    ]);
    for (const [, record] of records) {
      expect((record as { notApplicable: string }).notApplicable.length).toBeGreaterThan(20);
    }
    for (const kind of ["loading", "populated", "error"] as const) {
      expect(typeof NEEDS_YOU_STATES[kind]).toBe("function");
    }
  });
});
