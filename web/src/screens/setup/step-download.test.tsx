import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, startAcquisitionRun } from "../../api/client";
import type { RunState } from "../../api/types";
import { type ShellContextValue, useShell } from "../../app/shell-context";
import type { Attention, LatestDownload, ReadState } from "../../app/shell-types";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import { STEP4 } from "./copy";
import { StepDownload } from "./step-download";
import type { SetupState } from "./use-setup-state";

// Implements TC-COMP-101, TC-COMP-102, TC-COMP-104, TC-COMP-119, TC-COMP-120,
// TC-COMP-123 (step 4 half) and TC-COMP-124 (CAP-003-E4-S4 T002 to T009; AC-2,
// AC-7, AC-15, DAC-E4-8 to DAC-E4-10, DAC-E4-12, DAC-E4-S4-1, DAC-E4-S4-2,
// DAC-E4-S4-5, DAC-E4-S4-6; DEC-0356 to DEC-0358, DEC-0360).

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  startAcquisitionRun: vi.fn(),
}));
vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }));

type Health = ShellContextValue["health"];

const SENTINEL = "SENTINEL-KEY-VALUE";
const CHECKED_AT = new Date("2026-10-15T14:31:12Z");
const ANSWERED_AT = new Date("2026-10-15T14:00:00.000Z");

function answer(credential_present: boolean): Health["health"] {
  return {
    status: "ok",
    database: "reachable",
    credential_present,
    schema_version: 3,
    most_recent_run: null,
    api_key: SENTINEL,
  } as unknown as Health["health"];
}

const HEALTH_FOUND: Health = {
  liveness: "answering",
  health: answer(true),
  lastUpdated: ANSWERED_AT,
  lastAnsweredAt: ANSWERED_AT,
};
const HEALTH_MISSING: Health = { ...HEALTH_FOUND, health: answer(false) };
const HEALTH_UNREACHABLE_STALE_MISSING: Health = {
  liveness: "unreachable",
  health: answer(false),
  lastUpdated: new Date("2026-10-15T14:05:00.000Z"),
  lastAnsweredAt: ANSWERED_AT,
};

const ATTENTION_BASE: Attention = {
  checked_at: "2026-10-15T00:00:00Z",
  followed_count: 1236,
  prices_as_of: null,
  credential_present: true,
  problems: { stock_count: 0, symbols: [], newest_completed_at: null },
  latest_download: null,
  latest_terminal_download: null,
  items: [],
};

function download(over: Partial<LatestDownload> = {}): LatestDownload {
  return {
    run_id: "r-2",
    state: "running",
    requested_at: "2026-10-15T14:29:00Z",
    started_at: "2026-10-15T14:30:00Z",
    ended_at: null,
    progress: { done: 812, total: 1236 },
    ...over,
  };
}

function ok(latest: LatestDownload | null, checkedAt = CHECKED_AT): ReadState<Attention> {
  return { kind: "ok", data: { ...ATTENTION_BASE, latest_download: latest }, checkedAt };
}

function failing(last: { data: Attention; checkedAt: Date } | null): ReadState<Attention> {
  return { kind: "error", error: new ApiUnreachableError("x"), last };
}

const QUEUED_PENDING = {
  state: "requested",
  started_at: null,
  progress: { done: 0, total: null },
} as const;

const refresh = vi.fn();

let current: ShellContextValue;

function setShell(overrides: Partial<ShellContextValue> = {}): void {
  current = {
    health: HEALTH_FOUND,
    attention: ok(null),
    scores: { kind: "loading" },
    refresh,
    setTitleDetail: vi.fn(),
    ...overrides,
  };
}

function stateWith(overrides: Partial<SetupState> = {}): SetupState {
  return {
    current: 4,
    done: { 1: true, 2: true, 3: true, 4: false },
    step4: "ready",
    drafts: { yearsText: "12", source: "paste", pasted: "AAPL", unposted: [] },
    depth: {
      kind: "ok",
      data: { years: 12, updatedAt: "2026-10-15T13:00:00Z" },
      checkedAt: CHECKED_AT,
    },
    activeCount: { kind: "ok", data: 1236, checkedAt: CHECKED_AT },
    loading: false,
    goTo: vi.fn(),
    reread: vi.fn(),
    setDraft: vi.fn(),
    ...overrides,
  };
}

function LocationProbe() {
  return <p data-testid="location">{useLocation().pathname}</p>;
}

function tree(state: SetupState) {
  return (
    <MemoryRouter initialEntries={["/setup"]}>
      <Routes>
        <Route path="/setup" element={<StepDownload state={state} />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderStep(state: SetupState = stateWith()) {
  const view = render(tree(state));
  return { ...view, again: () => view.rerender(tree(state)) };
}

function accepted(queuedBehind: string | null) {
  return { runId: "r-2", state: "requested" as const, queuedBehind };
}

function refused(code: string): ApiError {
  return new ApiError("x", "req-1", { code });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const settle = async (): Promise<void> => {
  await act(async () => {});
};

const startButton = (): HTMLElement => screen.getByRole("button", { name: "Start download" });

const FORBIDDEN =
  /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

/** The container's text with every aria-label, title and referenced description or label. */
function visibleAndAccessibleText(container: HTMLElement): string {
  const parts: string[] = [container.textContent ?? ""];
  for (const element of container.querySelectorAll("*")) {
    for (const attribute of ["aria-label", "title"]) {
      const value = element.getAttribute(attribute);
      if (value !== null) {
        parts.push(value);
      }
    }
    for (const attribute of ["aria-labelledby", "aria-describedby"]) {
      for (const id of (element.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean)) {
        parts.push(document.getElementById(id)?.textContent ?? "");
      }
    }
  }
  return parts.join(" | ");
}

const summaryCard = (container: HTMLElement): HTMLElement => {
  const card = container.querySelector<HTMLElement>('[data-variant="summary"]');
  if (card === null) {
    throw new Error("no summary card");
  }
  return card;
};

const RUN_STATES: RunState[] = [
  "requested",
  "running",
  "cancelling",
  "succeeded",
  "partial",
  "failed",
  "cancelled",
  "abandoned",
];
const TERMINAL: RunState[] = ["succeeded", "partial", "failed", "cancelled", "abandoned"];

beforeEach(() => {
  vi.mocked(useShell).mockReset();
  vi.mocked(startAcquisitionRun).mockReset();
  refresh.mockReset();
  setShell();
  vi.mocked(useShell).mockImplementation(() => current);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TC-COMP-101: Start download outcomes", () => {
  it("(a) a 202 with no queue refreshes attention and health once and shows the bar", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();
    expect(refresh.mock.calls.filter(([kind]) => kind === "attention")).toHaveLength(1);
    expect(refresh.mock.calls.filter(([kind]) => kind === "health")).toHaveLength(1);

    setShell({ attention: ok(download()) });
    view.again();
    const bar = screen.getByRole("progressbar", { name: "812 of 1,236 stocks" });
    expect(bar).toHaveAttribute("aria-valuenow", "812");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "1236");
    expect(bar).toHaveAttribute("data-variant", "determinate");
    expect(screen.getByText("Started 2026-10-15 09:30 CDT")).toBeInTheDocument();
    expect(screen.getByText("checked 09:31:12 CDT")).toBeInTheDocument();
    expect(screen.getByText("You can leave; this keeps running.")).toBeInTheDocument();
  });

  it("(b) an unknown total gives an indeterminate bar named by the state", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();
    setShell({
      attention: ok(
        download({ state: "requested", started_at: null, progress: { done: 0, total: null } }),
      ),
    });
    view.again();
    const bar = screen.getByRole("progressbar", { name: "Queued" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-variant", "indeterminate");
    expect(screen.queryByText(/\d+ of [\d,]+ stocks/)).toBeNull();
    expect(screen.queryByText(/null/)).toBeNull();
    expect(screen.getByText("Started 2026-10-15 09:29 CDT")).toBeInTheDocument();
  });

  it("(c) a 202 behind another download shows the queued line until this one leaves requested", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted("r-1"));
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();
    expect(screen.getByRole("status")).toHaveTextContent(
      /^A download is running\. This starts when it finishes\.$/,
    );
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(refresh.mock.calls.filter(([kind]) => kind === "attention")).toHaveLength(0);
    expect(refresh.mock.calls.filter(([kind]) => kind === "health")).toHaveLength(1);

    setShell({ attention: ok(download({ run_id: "r-1", state: "running" })) });
    view.again();
    expect(screen.getByRole("status")).toHaveTextContent(STEP4.queued);
    expect(screen.queryByRole("progressbar")).toBeNull();

    setShell({ attention: ok(download({ ...QUEUED_PENDING })) });
    view.again();
    expect(screen.getByRole("status")).toHaveTextContent(STEP4.queued);
    expect(screen.queryByRole("progressbar")).toBeNull();

    setShell({ attention: ok(download()) });
    view.again();
    expect(screen.queryByText(STEP4.queued)).toBeNull();
    expect(screen.getByRole("progressbar", { name: "812 of 1,236 stocks" })).toBeInTheDocument();
  });

  it("(d) 409 history_depth_not_set names step 2", async () => {
    vi.mocked(startAcquisitionRun).mockRejectedValue(refused("history_depth_not_set"));
    const state = stateWith();
    renderStep(state);
    await userEvent.click(startButton());
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't start the download: history depth isn't set.");
    const link = within(alert).getByRole("link", { name: "Go to step 2" });
    expect(link).toHaveAttribute("href", "#setup-step-heading");
    await userEvent.click(link);
    expect(state.goTo).toHaveBeenCalledTimes(1);
    expect(state.goTo).toHaveBeenCalledWith(2);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("(e) 409 no_active_instruments names step 3", async () => {
    vi.mocked(startAcquisitionRun).mockRejectedValue(refused("no_active_instruments"));
    const state = stateWith();
    renderStep(state);
    await userEvent.click(startButton());
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't start the download: no stocks are followed.");
    await userEvent.click(within(alert).getByRole("link", { name: "Go to step 3" }));
    expect(state.goTo).toHaveBeenCalledTimes(1);
    expect(state.goTo).toHaveBeenCalledWith(3);
  });
});

describe("TC-COMP-102: a missing key does not block Start download", () => {
  it.each([
    ["HEALTH_MISSING", HEALTH_MISSING],
    ["HEALTH_UNREACHABLE_STALE_MISSING", HEALTH_UNREACHABLE_STALE_MISSING],
  ])(
    "%s leaves the button usable and sends one request with no argument",
    async (_name, health) => {
      setShell({ health });
      vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
      renderStep();
      const button = startButton();
      expect(button).toHaveAttribute("data-variant", "default");
      expect(button).not.toHaveAttribute("aria-disabled");
      expect(button).not.toHaveAttribute("aria-describedby");
      await userEvent.click(button);
      expect(startAcquisitionRun).toHaveBeenCalledTimes(1);
      expect(startAcquisitionRun).toHaveBeenCalledWith();
    },
  );

  it("shows Missing in the summary card for an answered missing key", () => {
    setShell({ health: HEALTH_MISSING });
    const { container } = renderStep();
    expect(summaryCard(container)).toHaveTextContent("Missing");
  });
});

describe("TC-COMP-104: the summary card and the unreadable progress", () => {
  it.each([
    ["HEALTH_FOUND", HEALTH_FOUND, "status-good", "Found"],
    ["HEALTH_MISSING", HEALTH_MISSING, "status-critical", "Missing"],
    [
      "HEALTH_UNREACHABLE_STALE_MISSING",
      HEALTH_UNREACHABLE_STALE_MISSING,
      "coverage-unknown",
      "Not determinable",
    ],
  ])("restates key, depth and count (%s)", (_name, health, variant, label) => {
    setShell({ health });
    const { container } = renderStep();
    const card = summaryCard(container);
    expect(card.querySelectorAll("dl")).toHaveLength(1);
    expect(
      within(card)
        .getAllByRole("term")
        .map((term) => term.textContent),
    ).toEqual(["Market data key", "History depth", "Followed stocks"]);
    const definitions = within(card).getAllByRole("definition");
    const badge = definitions[0]?.querySelector(`[data-variant="${variant}"]`);
    expect(badge).toHaveTextContent(new RegExp(`^${label}$`));
    if (label !== "Missing") {
      expect(card).not.toHaveTextContent("Missing");
    }
    expect(definitions[1]).toHaveTextContent("12 years");
    expect(definitions[2]).toHaveTextContent("1,236");
    expect(container.innerHTML).not.toContain(SENTINEL);
  });

  it("reads Progress can't be read right now beside the state, never a bar, while attention fails", () => {
    setShell({
      attention: failing({
        data: { ...ATTENTION_BASE, latest_download: download() },
        checkedAt: CHECKED_AT,
      }),
    });
    const { container } = renderStep();
    expect(container.querySelector('[data-variant="status-active"]')).toHaveTextContent(
      "Downloading",
    );
    expect(screen.getByText("Progress can't be read right now")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText("812 of 1,236 stocks")).toBeNull();
  });
});

describe("TC-COMP-119: checked time advances per answer; no interval of its own", () => {
  it("follows the read's checkedAt, announces once per answer and opens no timer", async () => {
    const interval = vi.spyOn(window, "setInterval");
    const frame = vi.spyOn(window, "requestAnimationFrame");
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    const view = renderStep();
    fireEvent.click(startButton());
    await settle();

    const label = document.querySelector<HTMLElement>('[aria-live="polite"]');
    if (label === null) {
      throw new Error("no live label");
    }
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((batch) => records.push(...batch));
    observer.observe(label, { childList: true, characterData: true, subtree: true });

    const clocks = ["09:31:22 CDT", "09:31:32 CDT", "09:31:42 CDT"];
    for (const i of [1, 2, 3]) {
      setShell({
        attention: ok(
          download({ progress: { done: 812 + i, total: 1236 } }),
          new Date(Date.parse("2026-10-15T14:31:12Z") + 10_000 * i),
        ),
      });
      view.again();
      records.push(...observer.takeRecords());
      expect(screen.getByText(`checked ${clocks[i - 1]}`)).toBeInTheDocument();
      expect(
        screen.getByRole("progressbar", { name: `${812 + i} of 1,236 stocks` }),
      ).toBeInTheDocument();
    }
    const bar = screen.getByRole("progressbar");
    const labelling = document.getElementById(bar.getAttribute("aria-labelledby") ?? "");
    expect(labelling).toBe(label);
    expect(label).toHaveAttribute("aria-live", "polite");
    expect(bar).not.toHaveAttribute("aria-live");
    expect(records).toHaveLength(3);

    view.again();
    records.push(...observer.takeRecords());
    expect(records).toHaveLength(3);
    observer.disconnect();
    expect(interval).not.toHaveBeenCalled();
    expect(frame).not.toHaveBeenCalled();
  });
});

describe("TC-COMP-120: blocked step 4 by keyboard", () => {
  const blocked = (): SetupState =>
    stateWith({
      step4: "blocked",
      activeCount: { kind: "ok", data: 0, checkedAt: CHECKED_AT },
      done: { 1: true, 2: true, 3: false, 4: false },
    });

  it("is focusable, inert and described, with both exits by Tab", async () => {
    const user = userEvent.setup();
    const state = blocked();
    const view = renderStep(state);
    await user.tab();
    const button = startButton();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(button);
    expect(startAcquisitionRun).not.toHaveBeenCalled();
    expect(button).toHaveAccessibleDescription(
      "No stocks are followed. Follow stocks before downloading.",
    );
    expect(
      screen.getByText("No stocks are followed. Follow stocks before downloading."),
    ).toBeVisible();

    await user.tab();
    const home = screen.getByRole("link", { name: "Go to Home" });
    expect(home).toHaveFocus();
    expect(home).toHaveAttribute("href", "/home");
    expect(home).toHaveAttribute("data-variant", "outline");
    await user.tab();
    const manage = screen.getByRole("link", { name: "Manage followed stocks" });
    expect(manage).toHaveFocus();
    expect(manage).toHaveAttribute("href", "/data/followed");
    expect(manage).toHaveAttribute("data-variant", "outline");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("location")).toHaveTextContent("/data/followed");
    view.unmount();

    renderStep(blocked());
    screen.getByRole("link", { name: "Go to Home" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("location")).toHaveTextContent("/home");
  });

  it("renders neither exit nor the reason when step 4 is ready", () => {
    renderStep(stateWith());
    expect(screen.queryByRole("link", { name: "Go to Home" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Manage followed stocks" })).toBeNull();
    expect(startButton()).toHaveAttribute("data-variant", "default");
    expect(screen.queryByText(STEP4.blockedReason)).toBeNull();
  });

  it("keeps Back working in the blocked state", async () => {
    const state = blocked();
    renderStep(state);
    await userEvent.click(screen.getByRole("button", { name: "← Back: Stocks to follow" }));
    expect(state.goTo).toHaveBeenCalledTimes(1);
    expect(state.goTo).toHaveBeenCalledWith(3);
  });
});

describe("TC-COMP-124: key badge, download state and progress carry shape", () => {
  it.each([
    ["Found", HEALTH_FOUND],
    ["Missing", HEALTH_MISSING],
  ])("(a) the key badge %s has its text and a hidden shape only", (label, health) => {
    setShell({ health, attention: ok(download()) });
    const { container } = renderStep();
    const badge = within(summaryCard(container)).getByText(label, {
      selector: '[data-variant^="status-"]',
    });
    expect(badge).toHaveTextContent(new RegExp(`^${label}$`));
    expect(badge.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    for (const element of [badge, ...badge.querySelectorAll("svg")]) {
      expect(element).not.toHaveAttribute("aria-label");
      expect(element).not.toHaveAttribute("title");
    }
  });

  it("(b) a running download reads Downloading with a hidden shape", () => {
    setShell({ attention: ok(download()) });
    renderStep();
    const badge = screen.getByText("Downloading", { selector: '[data-variant^="status-"]' });
    expect(badge).toHaveAttribute("data-variant", "status-active");
    expect(badge.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  const TABLE: [RunState, string, string][] = [
    ["requested", "neutral", "Queued"],
    ["running", "active", "Downloading"],
    ["cancelling", "warning", "Stopping"],
    ["succeeded", "good", "Complete"],
    ["partial", "warning", "Partial"],
    ["failed", "critical", "Failed"],
    ["cancelled", "neutral", "Cancelled by you"],
    ["abandoned", "serious", "Interrupted"],
  ];
  it.each(TABLE)("(b) %s is tier %s and reads %s", (state, tier, label) => {
    expect(tierOf({ of: "download", state })).toBe(tier);
    expect(labelOf({ of: "download", state })).toBe(label);
    setShell({
      attention: ok(
        download({ state, ended_at: TERMINAL.includes(state) ? "2026-10-15T15:00:00Z" : null }),
      ),
    });
    renderStep();
    const badge = screen.getByText(label, { selector: '[data-variant^="status-"]' });
    expect(badge).toHaveAttribute("data-variant", `status-${tier}`);
    expect(badge.textContent).toBe(label);
    expect(badge.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("(c) an unreachable key is Not determinable, described, and no status badge sits in the card", () => {
    setShell({ health: HEALTH_UNREACHABLE_STALE_MISSING });
    const { container } = renderStep();
    const card = summaryCard(container);
    expect(
      within(card).getByText("Not determinable", { selector: '[data-variant="coverage-unknown"]' }),
    ).toHaveAccessibleDescription("FactorFlow isn't answering, so the key can't be checked.");
    expect(card.querySelector('[data-variant^="status-"]')).toBeNull();
  });

  it("(d) the progress bar's name equals the visible text it points to", () => {
    setShell({ attention: ok(download()) });
    renderStep();
    const bar = screen.getByRole("progressbar");
    const target = document.getElementById(bar.getAttribute("aria-labelledby") ?? "");
    expect(bar).toHaveAccessibleName(target?.textContent ?? "");
  });

  it("(e) every badge has text, so nothing is conveyed by colour alone", () => {
    setShell({ attention: ok(download()) });
    const { container } = renderStep();
    for (const badge of container.querySelectorAll("[data-variant]")) {
      if (badge.getAttribute("data-variant")?.startsWith("status-")) {
        expect((badge.textContent ?? "").trim()).not.toBe("");
      }
    }
  });
});

describe("TC-COMP-123 (step 4): the display vocabulary", () => {
  it("(a) the scan is not vacuous", () => {
    for (const planted of [
      "one run",
      "Runs",
      "Retired",
      "Instrument",
      "acquire",
      "Start acquisition",
      "Provider credential",
    ]) {
      expect(planted).toMatch(FORBIDDEN);
    }
    for (const clean of ["You can leave; this keeps running.", "Start download"]) {
      expect(clean).not.toMatch(FORBIDDEN);
    }
  });

  const scan = (container: HTMLElement): void => {
    expect(visibleAndAccessibleText(container)).not.toMatch(FORBIDDEN);
  };

  it("(b1) ready, no download", () => {
    scan(renderStep().container);
  });

  it("(b2) blocked with both exits", () => {
    scan(
      renderStep(
        stateWith({
          step4: "blocked",
          activeCount: { kind: "ok", data: 0, checkedAt: CHECKED_AT },
        }),
      ).container,
    );
  });

  it.each(RUN_STATES)("(b3, c) after a 202 with %s in attention", async (state) => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    setShell({
      attention: ok(
        download({ state, ended_at: TERMINAL.includes(state) ? "2026-10-15T15:00:00Z" : null }),
      ),
    });
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();
    scan(view.container);
    expect(
      screen.getByText(labelOf({ of: "download", state }), {
        selector: '[data-variant^="status-"]',
      }),
    ).toBeInTheDocument();
    expect(startButton()).toHaveTextContent(STEP4.start);
  });

  it("(b4) indeterminate", () => {
    setShell({ attention: ok(download({ progress: { done: 0, total: null } })) });
    scan(renderStep().container);
  });

  it("(b5) queued", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted("r-1"));
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();
    scan(view.container);
  });

  it.each(["history_depth_not_set", "no_active_instruments"])(
    "(b6) the %s refusal never renders the error's message",
    async (code) => {
      vi.mocked(startAcquisitionRun).mockRejectedValue(
        new ApiError("every instrument run was refused", "req-1", { code }),
      );
      const view = renderStep();
      await userEvent.click(startButton());
      await screen.findByRole("alert");
      scan(view.container);
      expect(view.container.textContent).not.toContain("every instrument run");
      const names = [STEP4.goToStep2, STEP4.goToStep3];
      expect(names).toContain(within(screen.getByRole("alert")).getByRole("link").textContent);
    },
  );

  it.each([
    ["unreachable", new ApiUnreachableError("x")],
    ["internal_error", new ApiError("an instrument run failed", "r", { code: "internal_error" })],
  ])("(b7) a start failure (%s)", async (_name, error) => {
    vi.mocked(startAcquisitionRun).mockRejectedValue(error);
    const view = renderStep();
    await userEvent.click(startButton());
    await screen.findByRole("alert");
    scan(view.container);
  });

  it.each([
    ["without last", null],
    [
      "with last",
      { data: { ...ATTENTION_BASE, latest_download: download() }, checkedAt: CHECKED_AT },
    ],
  ])("(b8) attention failing %s", (_name, last) => {
    setShell({ attention: failing(last) });
    scan(renderStep().container);
  });

  it("(b9) the summary card with every unknown fact", () => {
    setShell({ health: HEALTH_UNREACHABLE_STALE_MISSING });
    scan(
      renderStep(
        stateWith({
          depth: { kind: "error", error: new ApiUnreachableError("x"), last: null },
          activeCount: {
            kind: "error",
            error: new ApiError("x", "r", { code: "internal_error" }),
            last: null,
          },
        }),
      ).container,
    );
  });

  it("(c) the button and link names come from the catalogue", () => {
    renderStep(
      stateWith({ step4: "blocked", activeCount: { kind: "ok", data: 0, checkedAt: CHECKED_AT } }),
    );
    expect(startButton()).toHaveTextContent(STEP4.start);
    expect(screen.getByRole("link", { name: STEP4.goHome })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: STEP4.manageFollowed })).toBeInTheDocument();
  });
});

describe("step 4's own cases", () => {
  it("(a) before attention names this download, the region reads Queued and never an older state", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();
    expect(
      screen.getByText("Queued", { selector: '[data-variant="status-neutral"]' }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Queued" })).toHaveAttribute(
      "data-variant",
      "indeterminate",
    );
    expect(screen.getByText("You can leave; this keeps running.")).toBeInTheDocument();
    expect(screen.queryByText(/^Started/)).toBeNull();
    expect(screen.queryByText(/^checked/)).toBeNull();

    setShell({
      attention: ok(
        download({ run_id: "r-1", state: "succeeded", ended_at: "2026-10-14T20:00:00Z" }),
      ),
    });
    view.again();
    expect(
      screen.getByText("Queued", { selector: '[data-variant="status-neutral"]' }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Complete")).toBeNull();
  });

  it.each(["requested", "running", "cancelling"] as RunState[])(
    "(b) an existing %s download shows the bar and the leave line",
    (state) => {
      setShell({ attention: ok(download({ state })) });
      renderStep();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText("You can leave; this keeps running.")).toBeInTheDocument();
    },
  );

  it.each(TERMINAL)("(b) an existing %s download shows its badge and times, no bar", (state) => {
    setShell({ attention: ok(download({ state, ended_at: "2026-10-15T15:00:00Z" })) });
    renderStep();
    expect(
      screen.getByText(labelOf({ of: "download", state }), {
        selector: '[data-variant^="status-"]',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Started 2026-10-15 09:30 CDT")).toBeInTheDocument();
    expect(screen.getByText("checked 09:31:12 CDT")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText("You can leave; this keeps running.")).toBeNull();
  });

  it("(c) attention failing with no last answer, and loading", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    setShell({ attention: failing(null) });
    const view = renderStep();
    expect(screen.queryByText("Progress can't be read right now")).toBeNull();
    expect(view.container.querySelector('[data-variant^="status-"]')).toHaveTextContent(/Found/);
    await userEvent.click(startButton());
    await settle();
    expect(
      screen.getByText("Queued", { selector: '[data-variant^="status-"]' }),
    ).toBeInTheDocument();
    expect(screen.getByText("Progress can't be read right now")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("(c) attention loading shows no progress region", () => {
    setShell({ attention: { kind: "loading" } });
    const { container } = renderStep();
    expect(container.querySelectorAll('[data-variant^="status-"]')).toHaveLength(1);
    expect(screen.queryByText("Progress can't be read right now")).toBeNull();
  });

  it.each([
    [
      "an unreachable server",
      new ApiUnreachableError("x"),
      "Couldn't start the download: FactorFlow is not answering",
    ],
    [
      "an internal error",
      new ApiError("an instrument run failed", "req-5", { code: "internal_error" }),
      "Couldn't start the download: FactorFlow hit an unexpected problem",
    ],
    [
      "another code",
      new ApiError("an instrument run failed", "req-5", { code: "something_else" }),
      "Couldn't start the download: FactorFlow hit an unexpected problem",
    ],
  ])("(d) %s", async (_name, error, text) => {
    vi.mocked(startAcquisitionRun).mockRejectedValue(error);
    const { container } = renderStep();
    await userEvent.click(startButton());
    expect((await screen.findByRole("alert")).textContent).toBe(text);
    expect(refresh).not.toHaveBeenCalled();
    expect(startButton()).toHaveAttribute("data-variant", "default");
    expect(container.textContent).not.toContain("req-5");
    expect(container.textContent).not.toContain("an instrument run failed");
    await userEvent.click(startButton());
    expect(startAcquisitionRun).toHaveBeenCalledTimes(2);
  });

  it("(e) one request at a time, and Start stays available after a 202", async () => {
    const first = deferred<ReturnType<typeof accepted>>();
    vi.mocked(startAcquisitionRun).mockReturnValueOnce(first.promise);
    renderStep();
    await userEvent.click(startButton());
    await userEvent.click(startButton());
    expect(startAcquisitionRun).toHaveBeenCalledTimes(1);
    await act(async () => first.resolve(accepted(null)));
    expect(startButton()).toHaveAttribute("data-variant", "default");

    vi.mocked(startAcquisitionRun).mockResolvedValueOnce({
      runId: "r-3",
      state: "requested",
      queuedBehind: "r-2",
    });
    await userEvent.click(startButton());
    await settle();
    expect(startAcquisitionRun).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent(STEP4.queued);
  });

  it("(f) a new attempt clears the old outcome", async () => {
    vi.mocked(startAcquisitionRun)
      .mockRejectedValueOnce(refused("no_active_instruments"))
      .mockResolvedValueOnce(accepted(null));
    renderStep();
    await userEvent.click(startButton());
    await screen.findByRole("alert");
    await userEvent.click(startButton());
    await settle();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("(g) the question names the count, and falls back to the step title when it is unknown", () => {
    const first = renderStep();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Download data for 1,236 stocks",
    );
    first.unmount();
    renderStep(
      stateWith({
        activeCount: { kind: "error", error: new ApiUnreachableError("x"), last: null },
      }),
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Download data");
    expect(startButton()).toHaveAttribute("data-variant", "default");
  });

  it("(h) unknown summary facts are Not determinable with the read's reason, and unset depth is a dash", () => {
    const failedDepth = renderStep(
      stateWith({ depth: { kind: "error", error: new ApiUnreachableError("x"), last: null } }),
    );
    const depth = within(failedDepth.container).getAllByRole("definition")[1];
    expect(within(depth as HTMLElement).getByText("Not determinable")).toHaveAccessibleDescription(
      "Couldn't read history depth: FactorFlow is not answering",
    );
    failedDepth.unmount();

    const failedCount = renderStep(
      stateWith({
        activeCount: {
          kind: "error",
          error: new ApiError("x", "r", { code: "internal_error" }),
          last: null,
        },
      }),
    );
    const followed = within(failedCount.container).getAllByRole("definition")[2];
    expect(
      within(followed as HTMLElement).getByText("Not determinable"),
    ).toHaveAccessibleDescription(
      "Couldn't read the followed list: FactorFlow hit an unexpected problem",
    );
    failedCount.unmount();

    const unset = renderStep(
      stateWith({
        depth: { kind: "ok", data: { years: null, updatedAt: null }, checkedAt: CHECKED_AT },
      }),
    );
    const absent = within(unset.container).getAllByRole("definition")[1] as HTMLElement;
    expect(absent.querySelector('[aria-hidden="true"]')).toHaveTextContent("—");
    expect(absent).toHaveTextContent("History depth isn't set");
  });

  it("(i) the card has no Continue and says Step 4 of 4", () => {
    renderStep();
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
    expect(screen.queryByText(/^Next:/)).toBeNull();
    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Download data for 1,236 stocks" }),
    ).toBeInTheDocument();
  });

  it("(j) health is refreshed on every 202 and on nothing else", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValueOnce(accepted(null));
    renderStep();
    await userEvent.click(startButton());
    await settle();
    expect(refresh.mock.calls.filter(([kind]) => kind === "health")).toHaveLength(1);

    refresh.mockReset();
    vi.mocked(startAcquisitionRun).mockResolvedValueOnce(accepted("r-1"));
    await userEvent.click(startButton());
    await settle();
    expect(refresh.mock.calls.filter(([kind]) => kind === "health")).toHaveLength(1);

    refresh.mockReset();
    vi.mocked(startAcquisitionRun).mockRejectedValueOnce(refused("no_active_instruments"));
    await userEvent.click(startButton());
    await screen.findByRole("alert");
    vi.mocked(startAcquisitionRun).mockRejectedValueOnce(new ApiUnreachableError("x"));
    await userEvent.click(startButton());
    await settle();
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe("CAP-003-E4-S4 review v1 rework (IR-001, IR-003, IR-004)", () => {
  it("IR-001: the progress line reads Started and checked with a boundary between them", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();
    setShell({ attention: ok(download()) });
    view.again();
    const line = screen.getByText("Started 2026-10-15 09:30 CDT").parentElement;
    expect(line?.textContent).toBe("Started 2026-10-15 09:30 CDT checked 09:31:12 CDT");
  });

  it("IR-001: the Started text stands alone, with no trailing boundary, when checked is absent", () => {
    setShell({
      attention: failing({
        data: { ...ATTENTION_BASE, latest_download: download() },
        checkedAt: CHECKED_AT,
      }),
    });
    renderStep();
    const line = screen.getByText("Started 2026-10-15 09:30 CDT").parentElement;
    expect(line?.textContent).toBe("Started 2026-10-15 09:30 CDT");
  });

  it("IR-003: a 202 while attention is still loading shows the pending view, not the unreadable line", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    setShell({ attention: { kind: "loading" } });
    renderStep();
    await userEvent.click(startButton());
    await settle();
    expect(
      screen.getByText("Queued", { selector: '[data-variant="status-neutral"]' }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Queued" })).toHaveAttribute(
      "data-variant",
      "indeterminate",
    );
    expect(screen.getByText("You can leave; this keeps running.")).toBeInTheDocument();
    expect(screen.queryByText("Progress can't be read right now")).toBeNull();
  });

  it("IR-004: once attention has named this download, a later one is shown as itself, never as Queued", async () => {
    vi.mocked(startAcquisitionRun).mockResolvedValue(accepted(null));
    const view = renderStep();
    await userEvent.click(startButton());
    await settle();

    setShell({ attention: ok(download({ run_id: "r-2" })) });
    view.again();
    expect(screen.getByRole("progressbar", { name: "812 of 1,236 stocks" })).toBeInTheDocument();

    setShell({
      attention: ok(
        download({ run_id: "r-3", state: "running", progress: { done: 5, total: 10 } }),
      ),
    });
    view.again();
    expect(screen.getByRole("progressbar", { name: "5 of 10 stocks" })).toHaveAttribute(
      "data-variant",
      "determinate",
    );
    expect(screen.queryByRole("progressbar", { name: "Queued" })).toBeNull();

    setShell({
      attention: ok(
        download({ run_id: "r-3", state: "succeeded", ended_at: "2026-10-15T15:00:00Z" }),
      ),
    });
    view.again();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText("Queued")).toBeNull();
    expect(screen.queryByText("You can leave; this keeps running.")).toBeNull();
  });
});
