import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiUnreachableError } from "../../api/client";
import type { HistoryDepth } from "../../api/types";
import { type ShellContextValue, useShell } from "../../app/shell-context";
import type { Attention, LatestDownload, ReadState } from "../../app/shell-types";
import { StepList } from "./step-list";
import type { SetupState } from "./use-setup-state";

// Implements the step list contract of CAP-003-E4-S2 T010 (AC-25, DAC-E4-1
// rendering half, DAC-E4-S2-1; component design setup-ui 10; DEC-0348,
// DEC-0349, DEC-0350).

vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }));

type Health = ShellContextValue["health"];

const CHECKED_AT = new Date("2026-09-06T18:30:00.000Z");

const HEALTH_FOUND: Health = {
  liveness: "answering",
  health: {
    status: "ok",
    database: "reachable",
    credential_present: true,
    schema_version: 3,
    most_recent_run: null,
  },
  lastUpdated: CHECKED_AT,
  lastAnsweredAt: CHECKED_AT,
};
const HEALTH_MISSING: Health = {
  ...HEALTH_FOUND,
  health: {
    status: "ok",
    database: "reachable",
    credential_present: false,
    schema_version: 3,
    most_recent_run: null,
  },
};
const HEALTH_UNREACHABLE_STALE_MISSING: Health = {
  liveness: "unreachable",
  health: HEALTH_MISSING.health,
  lastUpdated: new Date("2026-09-06T18:31:00.000Z"),
  lastAnsweredAt: CHECKED_AT,
};

const ATTENTION_BASE: Attention = {
  checked_at: "2026-09-06T18:30:00Z",
  followed_count: 3,
  prices_as_of: null,
  credential_present: true,
  problems: { stock_count: 0, symbols: [], newest_completed_at: null },
  latest_download: null,
  latest_terminal_download: null,
  items: [],
};

function downloadAt(started_at: string | null, requested_at: string): LatestDownload {
  return {
    run_id: "run-1",
    state: "running",
    requested_at,
    started_at,
    ended_at: null,
    progress: { done: 1, total: 3 },
  };
}

function attentionWith(latest_download: LatestDownload | null): ReadState<Attention> {
  return {
    kind: "ok",
    data: { ...ATTENTION_BASE, latest_download },
    checkedAt: CHECKED_AT,
  };
}

function shell(overrides: Partial<ShellContextValue> = {}): ShellContextValue {
  return {
    health: HEALTH_FOUND,
    attention: attentionWith(null),
    scores: { kind: "loading" },
    refresh: vi.fn(),
    setTitleDetail: vi.fn(),
    ...overrides,
  };
}

function stateWith(overrides: Partial<SetupState> = {}): SetupState {
  return {
    current: 1,
    done: { 1: false, 2: false, 3: false, 4: false },
    step4: "ready",
    drafts: { yearsText: "", source: null, pasted: "", unposted: [] },
    depth: { kind: "ok", data: { years: null, updatedAt: null }, checkedAt: CHECKED_AT },
    activeCount: { kind: "ok", data: 0, checkedAt: CHECKED_AT },
    loading: false,
    goTo: vi.fn(),
    reread: vi.fn(),
    setDraft: vi.fn(),
    ...overrides,
  };
}

const depthOk = (years: number): ReadState<HistoryDepth> => ({
  kind: "ok",
  data: { years, updatedAt: "2026-09-06T18:00:00Z" },
  checkedAt: CHECKED_AT,
});

beforeEach(() => {
  vi.mocked(useShell).mockReturnValue(shell());
});

describe("StepList structure", () => {
  it("is a navigation named Setup steps holding four titled items in order", () => {
    render(<StepList state={stateWith()} />);
    const nav = screen.getByRole("navigation", { name: "Setup steps" });
    const list = within(nav).getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    const titles = ["Market data", "How far back", "Stocks to follow", "Download data"];
    items.forEach((item, index) => {
      expect(item).toHaveTextContent(titles[index] as string);
    });
  });

  it("renders the header before the navigation", () => {
    render(<StepList state={stateWith()} header={<h1>Get set up</h1>} />);
    const heading = screen.getByRole("heading", { name: "Get set up" });
    const nav = screen.getByRole("navigation", { name: "Setup steps" });
    expect(heading.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("StepList current and done", () => {
  it("marks only the current step and makes done steps links", () => {
    render(
      <StepList
        state={stateWith({ current: 3, done: { 1: true, 2: true, 3: false, 4: false } })}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.getAttribute("aria-current"))).toEqual([
      null,
      null,
      "step",
      null,
    ]);
    expect(screen.getByRole("link", { name: "Market data, done" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "How far back, done" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("does not make a done step a link while it is the current one", () => {
    render(
      <StepList
        state={stateWith({ current: 2, done: { 1: true, 2: true, 3: false, 4: false } })}
      />,
    );
    expect(screen.queryByRole("link", { name: "How far back, done" })).toBeNull();
    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

describe("StepList activation", () => {
  it("calls goTo with the step and points each link at the step heading", async () => {
    const user = userEvent.setup();
    const goTo = vi.fn();
    render(
      <StepList
        state={stateWith({ current: 3, goTo, done: { 1: true, 2: true, 3: false, 4: false } })}
      />,
    );
    const link = screen.getByRole("link", { name: "How far back, done" });
    expect(link).toHaveAttribute("href", "#setup-step-heading");
    expect(screen.getByRole("link", { name: "Market data, done" })).toHaveAttribute(
      "href",
      "#setup-step-heading",
    );
    await user.click(link);
    expect(goTo).toHaveBeenCalledTimes(1);
    expect(goTo).toHaveBeenCalledWith(2);
  });

  it("reaches the done links by keyboard and no other step", async () => {
    const user = userEvent.setup();
    const goTo = vi.fn();
    render(
      <StepList
        state={stateWith({ current: 3, goTo, done: { 1: true, 2: true, 3: false, 4: false } })}
      />,
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Market data, done" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "How far back, done" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(goTo).toHaveBeenCalledWith(2);
    await user.tab();
    expect(document.body).toHaveFocus();
  });
});

describe("StepList summaries", () => {
  const ALL_DONE = { 1: true, 2: true, 3: true, 4: true } as const;
  const item = (n: number): HTMLElement => screen.getAllByRole("listitem")[n - 1] as HTMLElement;

  it("says Found or Missing for step 1 from the key's presence", () => {
    vi.mocked(useShell).mockReturnValue(shell({ health: HEALTH_FOUND }));
    const { unmount } = render(<StepList state={stateWith({ done: { ...ALL_DONE } })} />);
    expect(item(1)).toHaveTextContent("Found");
    unmount();
    vi.mocked(useShell).mockReturnValue(shell({ health: HEALTH_MISSING }));
    render(<StepList state={stateWith({ done: { ...ALL_DONE } })} />);
    expect(item(1)).toHaveTextContent("Missing");
  });

  it("says neither Found nor Missing for step 1 while health is not answering", () => {
    vi.mocked(useShell).mockReturnValue(shell({ health: HEALTH_UNREACHABLE_STALE_MISSING }));
    render(<StepList state={stateWith({ done: { ...ALL_DONE } })} />);
    expect(item(1)).not.toHaveTextContent("Found");
    expect(item(1)).not.toHaveTextContent("Missing");
  });

  it("says the saved years and the followed count with a thousands separator", () => {
    render(
      <StepList
        state={stateWith({
          done: { ...ALL_DONE },
          depth: depthOk(12),
          activeCount: { kind: "ok", data: 1236, checkedAt: CHECKED_AT },
        })}
      />,
    );
    expect(item(2)).toHaveTextContent("12 years of history");
    expect(item(3)).toHaveTextContent("1,236 followed stocks");
  });

  it("names the download by its start time, else its request time", () => {
    vi.mocked(useShell).mockReturnValue(
      shell({
        attention: attentionWith(downloadAt("2026-10-15T14:30:00Z", "2026-10-15T14:29:00Z")),
      }),
    );
    const { unmount } = render(<StepList state={stateWith({ done: { ...ALL_DONE } })} />);
    expect(item(4)).toHaveTextContent("Download started 2026-10-15 09:30 CDT");
    unmount();
    vi.mocked(useShell).mockReturnValue(
      shell({ attention: attentionWith(downloadAt(null, "2026-10-15T14:29:00Z")) }),
    );
    render(<StepList state={stateWith({ done: { ...ALL_DONE } })} />);
    expect(item(4)).toHaveTextContent("Download started 2026-10-15 09:29 CDT");
  });

  it("still reads the download from the last good answer when the attention read failed", () => {
    vi.mocked(useShell).mockReturnValue(
      shell({
        attention: {
          kind: "error",
          error: new ApiUnreachableError("x"),
          last: {
            data: {
              ...ATTENTION_BASE,
              latest_download: downloadAt("2026-10-15T14:30:00Z", "2026-10-15T14:29:00Z"),
            },
            checkedAt: CHECKED_AT,
          },
        },
      }),
    );
    render(<StepList state={stateWith({ done: { ...ALL_DONE } })} />);
    expect(item(4)).toHaveTextContent("Download started 2026-10-15 09:30 CDT");
  });

  it("shows no summary for a step that is not done", () => {
    render(
      <StepList
        state={stateWith({
          done: { 1: false, 2: false, 3: false, 4: false },
          depth: depthOk(12),
          activeCount: { kind: "ok", data: 5, checkedAt: CHECKED_AT },
        })}
      />,
    );
    for (const n of [1, 2, 3, 4]) {
      expect(item(n)).not.toHaveTextContent(
        /Found|Missing|years of history|followed stocks|started/,
      );
    }
  });
});

describe("StepList layout values", () => {
  it("bounds the column and sizes the dots from the layout values", () => {
    const { container } = render(<StepList state={stateWith()} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.minWidth).toBe("260px");
    expect(root.style.maxWidth).toBe("300px");
    const dot = container.querySelector('li [aria-hidden="true"]') as HTMLElement;
    expect(dot.style.width).toBe("28px");
  });
});
