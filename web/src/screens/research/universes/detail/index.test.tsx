import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as classificationClient from "../../../../api/classification-client";
import type { UniverseDetail } from "../../../../api/classification-types";
import type { HistoryTabProps } from "./history-tab";
import UniverseDetailScreen from "./index";
import type { MembersTabProps } from "./members-tab";

vi.mock("../../../../api/classification-client", async () => ({
  ...(await vi.importActual<typeof import("../../../../api/classification-client")>(
    "../../../../api/classification-client",
  )),
  getUniverse: vi.fn(),
  renameUniverse: vi.fn(),
  addUniverseMembers: vi.fn(),
  retireUniverse: vi.fn(),
}));

/** What the two tab stubs record: their latest props and how often each mounted. */
const stubs = vi.hoisted(() => ({
  members: { mounts: 0, props: null as unknown },
  history: { mounts: 0, props: null as unknown },
}));

vi.mock("./members-tab", () => ({
  MembersTab: (props: unknown) => {
    stubs.members.props = props;
    useEffect(() => {
      stubs.members.mounts += 1;
    }, []);
    return <p>Members stub</p>;
  },
}));

vi.mock("./history-tab", () => ({
  HistoryTab: (props: unknown) => {
    stubs.history.props = props;
    useEffect(() => {
      stubs.history.mounts += 1;
    }, []);
    return <p>History stub</p>;
  },
}));

const { ClassificationApiError } = classificationClient;
const getUniverse = vi.mocked(classificationClient.getUniverse);
const renameUniverse = vi.mocked(classificationClient.renameUniverse);
const addUniverseMembers = vi.mocked(classificationClient.addUniverseMembers);
const retireUniverse = vi.mocked(classificationClient.retireUniverse);

const RETIRED_REFUSAL =
  "This universe is retired and can't be changed. Its members and history are still viewable.";
const RETIRED_HEADER = "This universe is retired. Its members and history stay viewable.";

function universe(overrides: Partial<UniverseDetail> = {}): UniverseDetail {
  return {
    universeId: "u1",
    name: "Tech",
    lifecycle: "active",
    createdAt: "2026-10-15T22:46:00Z",
    retiredAt: null,
    memberCount: 3,
    asOf: "2026-10-16",
    asOfBeforeCreation: false,
    origin: {
      kind: "by_hand",
      setId: null,
      classificationDate: null,
      thresholds: null,
      hideIncomplete: null,
      symbol: null,
    },
    members: [],
    set: null,
    ...overrides,
  };
}

const RETIRED = universe({ lifecycle: "retired", retiredAt: "2026-10-16T05:00:00Z" });

function apiError(
  code: string,
  operation: "get-universe" | "add-universe-members" | "retire-universe" | "rename-universe",
  symbols: string[] = [],
): InstanceType<typeof ClassificationApiError> {
  return new ClassificationApiError("refused", "req-1", {
    code,
    operation,
    resource: operation === "add-universe-members" ? "universe-member" : "universe",
    symbols,
  });
}

function membersProps(): MembersTabProps {
  return stubs.members.props as MembersTabProps;
}

function historyProps(): HistoryTabProps {
  return stubs.history.props as HistoryTabProps;
}

/** Prints the URL search and counts the navigations, so a test can see what the screen writes. */
const navigations = { count: 0 };
function LocationProbe() {
  const location = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: counts each new location.
  useEffect(() => {
    navigations.count += 1;
  }, [location.key]);
  return <p data-testid="location">{location.search}</p>;
}

function search(): URLSearchParams {
  return new URLSearchParams(screen.getByTestId("location").textContent ?? "");
}

function renderScreen(entry = "/research/universes/u1") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/research/universes/:universeId" element={<UniverseDetailScreen />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

async function renderLoaded(entry?: string) {
  const view = renderScreen(entry);
  await screen.findByRole("heading", { level: 1 });
  return view;
}

function heading(): HTMLElement {
  return screen.getByRole("heading", { level: 1 });
}

/** The page's one polite status region (DEC-0109); the stubs and the header render none. */
function statusRegion(): HTMLElement {
  return screen.getByRole("status");
}

beforeEach(() => {
  getUniverse.mockReset();
  renameUniverse.mockReset();
  addUniverseMembers.mockReset();
  retireUniverse.mockReset();
  stubs.members.mounts = 0;
  stubs.members.props = null;
  stubs.history.mounts = 0;
  stubs.history.props = null;
  navigations.count = 0;
  getUniverse.mockResolvedValue(universe());
});

// Implements TC-COMP-058 (T009): DAC-E1-S9-5, AC-6.
describe("TC-COMP-058: a retired universe stays readable", () => {
  it("shows the retired header with no write control, and both tabs readable", async () => {
    const user = userEvent.setup();
    getUniverse.mockResolvedValue(RETIRED);
    await renderLoaded();
    expect(heading()).toHaveTextContent(/^Tech$/);
    expect(screen.getByText("Retired")).toBeInTheDocument();
    expect(screen.getByText(RETIRED_HEADER)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add stocks…" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Retire…" })).toBeNull();
    expect(within(heading()).queryByRole("button")).toBeNull();
    expect(membersProps()).toMatchObject({ lifecycle: "retired", memberCount: 3 });
    await user.click(screen.getByRole("tab", { name: "History" }));
    expect(screen.getByText("History stub")).toBeInTheDocument();
    expect(historyProps().universeId).toBe("u1");
  });

  it("states universe_retired for a stale page's write and re-reads the header, which turns retired", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockRejectedValue(apiError("universe_retired", "add-universe-members"));
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL");
    await user.click(screen.getByRole("button", { name: "Add" }));
    const dialog = screen.getByRole("dialog", { name: "Add stocks to Tech" });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(RETIRED_REFUSAL);
    expect(await screen.findByText(RETIRED_HEADER)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add stocks…" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Retire…" })).toBeNull();
    expect(getUniverse).toHaveBeenCalledTimes(2);
  });
});

// Implements TC-COMP-044 (T007's page-level half, T010 a): DAC-E1-S9-4, DAC-E1-7, AC-4, AC-6.
describe("TC-COMP-044 (page): retiring", () => {
  it("retires on confirm: the header shows Retired with its time, the actions leave, the status says so and focus is on the h1", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockResolvedValue({ lifecycle: "retired", retiredAt: RETIRED.retiredAt ?? "" });
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    expect(retireUniverse).toHaveBeenCalledWith("u1");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByText("Retired")).toBeInTheDocument();
    expect(screen.getByText("2026-10-16 00:00 CDT")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add stocks…" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Retire…" })).toBeNull();
    expect(statusRegion()).toHaveTextContent(/^Retired Tech$/);
    expect(heading()).toHaveFocus();
  });

  it("states universe_retired in the dialog and re-reads the header", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockRejectedValue(apiError("universe_retired", "retire-universe"));
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    const dialog = screen.getByRole("dialog", { name: "Retire Tech" });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(RETIRED_REFUSAL);
    expect(await screen.findByText(RETIRED_HEADER)).toBeInTheDocument();
  });

  it("shows Retired from the response at once, before the read returns", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockResolvedValue({ lifecycle: "retired", retiredAt: RETIRED.retiredAt ?? "" });
    getUniverse.mockReturnValue(new Promise(() => {}));
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    expect(await screen.findByText(RETIRED_HEADER)).toBeInTheDocument();
    expect(screen.getByText("2026-10-16 00:00 CDT")).toBeInTheDocument();
    expect(heading()).toHaveFocus();
    expect(getUniverse).toHaveBeenCalledTimes(2);
  });

  it("moves focus to the h1 when the retire dialog of a universe retired elsewhere is cancelled", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockRejectedValue(apiError("universe_retired", "retire-universe"));
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    await screen.findByText(RETIRED_HEADER);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(heading()).toHaveFocus();
  });

  it("states any other failure with the generic sentence and keeps the dialog", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockRejectedValue(apiError("internal_error", "retire-universe"));
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    const dialog = screen.getByRole("dialog", { name: "Retire Tech" });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Could not retire the universe: FactorFlow hit an unexpected problem. Try again.",
    );
    expect(getUniverse).toHaveBeenCalledTimes(1);
  });

  it("Cancel closes the retire dialog without a request", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(retireUniverse).not.toHaveBeenCalled();
  });

  it("keeps the retire dialog open while its request is pending (dialog spec section 4)", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockReturnValue(new Promise(() => {}));
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog", { name: "Retire Tech" })).toBeInTheDocument();
  });

  it("opens the retire dialog from the Members tab's onRetire, ready to confirm or cancel", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    act(() => membersProps().onRetire());
    expect(screen.getByRole("dialog", { name: "Retire Tech" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retire universe" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("lets Cancel close the retire dialog once a refusal has arrived", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockRejectedValue(apiError("internal_error", "retire-universe"));
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("moves focus to the h1 once only: a later re-read leaves focus where it is", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    retireUniverse.mockResolvedValue({ lifecycle: "retired", retiredAt: RETIRED.retiredAt ?? "" });
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    await waitFor(() => expect(heading()).toHaveFocus());
    const members = screen.getByRole("tab", { name: "Members" });
    members.focus();
    act(() => membersProps().onMembershipChanged());
    await waitFor(() => expect(getUniverse).toHaveBeenCalledTimes(3));
    expect(members).toHaveFocus();
  });
});

// T010 (b) to (h): tabs and the URL, re-reads and remounts, states, breadcrumb and the status region.
describe("UniverseDetailScreen", () => {
  it("has a Members and History tablist with Members active by default and one tabpanel", async () => {
    await renderLoaded();
    const tablist = screen.getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Members", "History"]);
    const members = screen.getByRole("tab", { name: "Members" });
    expect(members).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "false");
    const panels = screen.getAllByRole("tabpanel");
    expect(panels).toHaveLength(1);
    expect(members).toHaveAttribute("aria-controls", panels[0].id);
    expect(panels[0]).toHaveAccessibleName("Members");
    expect(panels[0]).toHaveAttribute("tabindex", "0");
    expect(within(panels[0]).getByText("Members stub")).toBeInTheDocument();
  });

  it("activating History sets tab=history and mounts the History tab with the universe id", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("tab", { name: "History" }));
    expect(search().get("tab")).toBe("history");
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("History stub");
    expect(screen.queryByText("Members stub")).toBeNull();
    expect(historyProps().universeId).toBe("u1");
  });

  it("restores the tab and as_of from the URL", async () => {
    const user = userEvent.setup();
    await renderLoaded("/research/universes/u1?tab=history&as_of=2026-09-30");
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("History stub")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Members" }));
    expect(membersProps().asOf).toBe("2026-09-30");
  });

  it("passes as_of from the URL to the Members tab", async () => {
    await renderLoaded("/research/universes/u1?as_of=2026-09-30");
    expect(membersProps().asOf).toBe("2026-09-30");
  });

  it("puts only the active tab in the Tab order", async () => {
    await renderLoaded();
    expect(screen.getByRole("tab", { name: "Members" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves between tabs with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    const members = screen.getByRole("tab", { name: "Members" });
    const history = screen.getByRole("tab", { name: "History" });
    members.focus();
    await user.keyboard("{ArrowRight}");
    expect(history).toHaveFocus();
    expect(history).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(members).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(history).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(members).toHaveFocus();
    await user.keyboard("{End}");
    expect(history).toHaveFocus();
    await user.keyboard("{Home}");
    expect(members).toHaveFocus();
    expect(search().get("tab")).toBe("members");
  });

  it("keeps the page from scrolling on the tab keys it handles", async () => {
    await renderLoaded();
    const members = screen.getByRole("tab", { name: "Members" });
    expect(fireEvent.keyDown(members, { key: "ArrowRight" })).toBe(false);
    expect(fireEvent.keyDown(screen.getByRole("tab", { name: "History" }), { key: "a" })).toBe(
      true,
    );
  });

  it("onAsOfChange sets as_of, and null removes it, leaving the Research parameters alone", async () => {
    await renderLoaded(
      "/research/universes/u1?value.measure=percentile&value.direction=atLeast&value.value=80&sort=symbol",
    );
    act(() => membersProps().onAsOfChange("2026-09-30"));
    expect(search().get("as_of")).toBe("2026-09-30");
    expect(search().has("tab")).toBe(false);
    expect(search().get("value.measure")).toBe("percentile");
    expect(search().get("value.direction")).toBe("atLeast");
    expect(search().get("value.value")).toBe("80");
    expect(search().get("sort")).toBe("symbol");
    act(() => membersProps().onAsOfChange(null));
    expect(search().has("as_of")).toBe(false);
    expect(search().get("sort")).toBe("symbol");
  });

  it("onViewMembersAsOf opens Members as of that date in one navigation", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("tab", { name: "History" }));
    const before = navigations.count;
    act(() => historyProps().onViewMembersAsOf("2026-10-16"));
    expect(navigations.count).toBe(before + 1);
    expect(search().get("tab")).toBe("members");
    expect(search().get("as_of")).toBe("2026-10-16");
    expect(membersProps().asOf).toBe("2026-10-16");
  });

  it("onMembershipChanged re-reads the header once without remounting the Members tab", async () => {
    await renderLoaded();
    getUniverse.mockResolvedValue(universe({ memberCount: 2 }));
    act(() => membersProps().onMembershipChanged());
    await waitFor(() => expect(membersProps().memberCount).toBe(2));
    expect(getUniverse).toHaveBeenCalledTimes(2);
    expect(stubs.members.mounts).toBe(1);
  });

  it("an Add stocks success re-reads the header, remounts the Members tab and announces the result", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockResolvedValue({ added: ["MSFT"], alreadyMember: ["AAPL"] });
    getUniverse.mockResolvedValue(universe({ memberCount: 4 }));
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL, MSFT");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(addUniverseMembers).toHaveBeenCalledWith("u1", ["AAPL", "MSFT"]);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(statusRegion()).toHaveTextContent(/^Added 1 stock to Tech, and 1 were already members$/);
    await waitFor(() => expect(membersProps().memberCount).toBe(4));
    expect(stubs.members.mounts).toBe(2);
  });

  it("states an uncovered symbol in the Add stocks dialog and keeps it open", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockRejectedValue(
      apiError("instrument_not_acquired", "add-universe-members", ["TSLA"]),
    );
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL, TSLA");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not add the stocks: FactorFlow doesn't follow TSLA. Follow them on Data health, then try again.",
    );
    expect(screen.getByRole("dialog", { name: "Add stocks to Tech" })).toBeInTheDocument();
    expect(getUniverse).toHaveBeenCalledTimes(1);
  });

  it("moves focus to the h1 when the Add stocks dialog of a universe retired elsewhere is cancelled", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockRejectedValue(apiError("universe_retired", "add-universe-members"));
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText(RETIRED_HEADER);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(heading()).toHaveFocus();
  });

  it("returns focus to Add stocks… when its dialog is cancelled on an active universe", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Add stocks…" })).toHaveFocus();
  });

  it("states instrument_not_acquired without symbols with the generic sentence", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockRejectedValue(
      apiError("instrument_not_acquired", "add-universe-members"),
    );
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not add the stocks to the universe: FactorFlow hit an unexpected problem. Try again.",
    );
  });

  it("lets Cancel close the Add stocks dialog once a refusal has arrived", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockRejectedValue(new Error("network"));
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("states any other Add stocks failure with the generic sentence", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockRejectedValue(new Error("network"));
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not add the stocks to the universe: FactorFlow hit an unexpected problem. Try again.",
    );
  });

  it("keeps the Add stocks dialog open while its request is pending (dialog spec section 4)", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    addUniverseMembers.mockReturnValue(new Promise(() => {}));
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog", { name: "Add stocks to Tech" })).toBeInTheDocument();
  });

  it("Cancel closes the Add stocks dialog without a request", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(addUniverseMembers).not.toHaveBeenCalled();
  });

  it("re-opens History as a fresh mount each time its tab is opened", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    await user.click(screen.getByRole("tab", { name: "History" }));
    await user.click(screen.getByRole("tab", { name: "Members" }));
    await user.click(screen.getByRole("tab", { name: "History" }));
    expect(stubs.history.mounts).toBe(2);
  });

  it("moves no focus when the page loads", async () => {
    await renderLoaded();
    expect(document.body).toHaveFocus();
  });

  it("shows the busy skeleton again while Try again reads", async () => {
    const user = userEvent.setup();
    getUniverse.mockRejectedValueOnce(apiError("internal_error", "get-universe"));
    renderScreen();
    const tryAgain = await screen.findByRole("button", { name: "Try again" });
    getUniverse.mockReturnValue(new Promise(() => {}));
    await user.click(tryAgain);
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("shows a busy skeleton before the read resolves", () => {
    getUniverse.mockReturnValue(new Promise(() => {}));
    renderScreen();
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("reads the universe named by the route", async () => {
    await renderLoaded("/research/universes/u-other");
    expect(getUniverse).toHaveBeenCalledWith("u-other");
  });

  it("replaces the page with the failure sentence and Try again, which reads again", async () => {
    const user = userEvent.setup();
    getUniverse.mockRejectedValueOnce(apiError("internal_error", "get-universe"));
    renderScreen();
    expect(
      await screen.findByText(
        "Could not load the universe: FactorFlow hit an unexpected problem. Try again.",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(/^Tech$/);
    expect(getUniverse).toHaveBeenCalledTimes(2);
  });

  it("states a failure that is not a client error with the generic sentence", async () => {
    getUniverse.mockRejectedValueOnce(new Error("boom"));
    renderScreen();
    expect(
      await screen.findByText(
        "Could not load the universe: FactorFlow hit an unexpected problem. Try again.",
      ),
    ).toBeInTheDocument();
  });

  it("states universe_not_found with a link to the Universes list and no Try again", async () => {
    getUniverse.mockRejectedValueOnce(apiError("universe_not_found", "get-universe"));
    renderScreen();
    expect(await screen.findByText("No universe with this address exists.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Universes" })).toHaveAttribute(
      "href",
      "/research/universes",
    );
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("has a Breadcrumb nav reading Research › Universes › Tech, the first two linked", async () => {
    await renderLoaded();
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveTextContent(/^Research › Universes › Tech$/);
    expect(within(nav).getByRole("link", { name: "Research" })).toHaveAttribute(
      "href",
      "/research",
    );
    expect(within(nav).getByRole("link", { name: "Universes" })).toHaveAttribute(
      "href",
      "/research/universes",
    );
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
  });

  it("keeps one polite status region whose text the retire confirmation replaces", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    expect(statusRegion()).toHaveAttribute("aria-live", "polite");
    expect(statusRegion()).toBeEmptyDOMElement();
    addUniverseMembers.mockResolvedValue({ added: ["AAPL", "MSFT"], alreadyMember: [] });
    await user.click(screen.getByRole("button", { name: "Add stocks…" }));
    await user.type(screen.getByRole("textbox", { name: "Stocks" }), "AAPL, MSFT");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(statusRegion()).toHaveTextContent(/^Added 2 stocks to Tech$/));
    retireUniverse.mockResolvedValue({ lifecycle: "retired", retiredAt: RETIRED.retiredAt ?? "" });
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(screen.getByRole("button", { name: "Retire…" }));
    await user.click(screen.getByRole("button", { name: "Retire universe" }));
    await waitFor(() => expect(statusRegion()).toHaveTextContent(/^Retired Tech$/));
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("renames through PATCH: the h1 shows the new name and the status region is unchanged", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    renameUniverse.mockResolvedValue(universe({ name: "Growth" }));
    getUniverse.mockResolvedValue(universe({ name: "Growth" }));
    await user.click(within(heading()).getByRole("button", { name: "Tech" }));
    await user.keyboard("{Control>}a{/Control}Growth{Enter}");
    expect(renameUniverse).toHaveBeenCalledWith("u1", "Growth");
    await waitFor(() => expect(heading()).toHaveTextContent(/^Growth$/));
    expect(statusRegion()).toBeEmptyDOMElement();
    expect(membersProps().universeName).toBe("Growth");
  });

  it("renders the new name from the rename's response before the read returns", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    renameUniverse.mockResolvedValue(universe({ name: "Growth" }));
    getUniverse.mockReturnValue(new Promise(() => {}));
    await user.click(within(heading()).getByRole("button", { name: "Tech" }));
    await user.keyboard("{Control>}a{/Control}Growth{Enter}");
    await waitFor(() => expect(heading()).toHaveTextContent(/^Growth$/));
    expect(getUniverse).toHaveBeenCalledTimes(2);
  });

  it("keeps the loaded page when a later read fails, stating the failure with Try again", async () => {
    await renderLoaded();
    getUniverse.mockRejectedValue(apiError("internal_error", "get-universe"));
    act(() => membersProps().onMembershipChanged());
    expect(
      await screen.findByText(
        "Could not load the universe: FactorFlow hit an unexpected problem. Try again.",
      ),
    ).toBeInTheDocument();
    expect(heading()).toHaveTextContent(/^Tech$/);
    expect(screen.getByText("Members stub")).toBeInTheDocument();
    expect(statusRegion()).toBeEmptyDOMElement();
  });

  it("clears the later read's failure when Try again reads the universe", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    getUniverse.mockRejectedValueOnce(apiError("internal_error", "get-universe"));
    act(() => membersProps().onMembershipChanged());
    const tryAgain = await screen.findByRole("button", { name: "Try again" });
    getUniverse.mockResolvedValue(universe({ memberCount: 7 }));
    await user.click(tryAgain);
    await waitFor(() => expect(membersProps().memberCount).toBe(7));
    expect(screen.queryByText(/Could not load the universe/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("a refused rename keeps the field error and, for universe_retired, re-reads the header", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    renameUniverse.mockRejectedValue(apiError("universe_retired", "rename-universe"));
    getUniverse.mockResolvedValue(RETIRED);
    await user.click(within(heading()).getByRole("button", { name: "Tech" }));
    await user.keyboard("Growth{Enter}");
    expect(await screen.findByText(RETIRED_HEADER)).toBeInTheDocument();
    expect(getUniverse).toHaveBeenCalledTimes(2);
  });

  it("a rename refused for another reason does not re-read the header", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    renameUniverse.mockRejectedValue(apiError("universe_name_in_use", "rename-universe"));
    await user.click(within(heading()).getByRole("button", { name: "Tech" }));
    await user.keyboard("Growth{Enter}");
    expect(
      await screen.findByText("Another active universe is already named Growth."),
    ).toBeInTheDocument();
    expect(getUniverse).toHaveBeenCalledTimes(1);
  });

  it("passes the universe's id, name, lifecycle and count to the Members tab", async () => {
    await renderLoaded();
    expect(membersProps()).toMatchObject({
      universeId: "u1",
      universeName: "Tech",
      lifecycle: "active",
      memberCount: 3,
      asOf: null,
    });
  });

  it("ignores a superseded read's failure", async () => {
    await renderLoaded();
    let rejectFirst: (reason: unknown) => void = () => {};
    getUniverse.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectFirst = reject;
      }),
    );
    act(() => membersProps().onMembershipChanged());
    getUniverse.mockResolvedValueOnce(universe({ memberCount: 5 }));
    act(() => membersProps().onMembershipChanged());
    await waitFor(() => expect(membersProps().memberCount).toBe(5));
    await act(async () => rejectFirst(apiError("internal_error", "get-universe")));
    expect(screen.queryByText(/Could not load the universe/)).toBeNull();
  });

  it("lets a rename's response supersede a read already in flight", async () => {
    const user = userEvent.setup();
    await renderLoaded();
    let resolveFirst: (value: UniverseDetail) => void = () => {};
    getUniverse.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
    );
    act(() => membersProps().onMembershipChanged());
    renameUniverse.mockResolvedValue(universe({ name: "Growth" }));
    getUniverse.mockReturnValue(new Promise(() => {}));
    await user.click(within(heading()).getByRole("button", { name: "Tech" }));
    await user.keyboard("{Control>}a{/Control}Growth{Enter}");
    await waitFor(() => expect(heading()).toHaveTextContent(/^Growth$/));
    await act(async () => resolveFirst(universe({ name: "Tech" })));
    expect(heading()).toHaveTextContent(/^Growth$/);
  });

  it("ignores a superseded read", async () => {
    await renderLoaded();
    let resolveFirst: (value: UniverseDetail) => void = () => {};
    getUniverse.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
    );
    act(() => membersProps().onMembershipChanged());
    getUniverse.mockResolvedValueOnce(universe({ memberCount: 5 }));
    act(() => membersProps().onMembershipChanged());
    await waitFor(() => expect(membersProps().memberCount).toBe(5));
    await act(async () => resolveFirst(universe({ memberCount: 9 })));
    expect(membersProps().memberCount).toBe(5);
  });
});
