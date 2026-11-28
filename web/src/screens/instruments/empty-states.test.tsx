import { getRoles, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/client";
import InstrumentsScreen from "./index";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    listInstruments: vi.fn(),
    addInstruments: vi.fn(),
    retireInstrument: vi.fn(),
    getHistoryDepth: vi.fn(),
  };
});

const EMPTY = { rows: [], activeCount: 0, retiredCount: 0, nextCursor: null };
const POPULATED = {
  rows: [
    { instrumentId: 1, symbol: "AAPL", lifecycle: "active" as const },
    { instrumentId: 2, symbol: "MSFT", lifecycle: "retired" as const },
  ],
  activeCount: 1,
  retiredCount: 1,
  nextCursor: null,
};

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => undefined;
  Element.prototype.scrollIntoView = () => undefined;
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.mocked(client.getHistoryDepth).mockResolvedValue({ years: null, updatedAt: null });
});

function renderScreen() {
  return render(
    <MemoryRouter>
      <InstrumentsScreen />
    </MemoryRouter>,
  );
}

/** The retired domain words, whole words in any case. */
const BANNED_WORDS = String.raw`\b(instrument|instruments|acquisition|acquire|run|runs|retire|retired|provider credential)\b`;

/**
 * Where a retired word appears: in the text, or in the accessible name of any
 * element with a role (matched by Testing Library's own name computation).
 */
function bannedIn(root: HTMLElement): string[] {
  const found: string[] = [];
  for (const word of root.textContent?.match(new RegExp(BANNED_WORDS, "gi")) ?? []) {
    found.push(`text: ${word}`);
  }
  for (const role of Object.keys(getRoles(root))) {
    const named = within(root).queryAllByRole(role, {
      name: new RegExp(BANNED_WORDS, "i"),
      hidden: true,
    });
    for (const element of named) {
      found.push(`name of ${role}: ${element.getAttribute("aria-label") ?? element.textContent}`);
    }
  }
  return found;
}

// Implements TC-COMP-201
describe("Followed stocks vocabulary (TC-COMP-201, DAC-E7-S3-4)", () => {
  it("uses the display labels, with the exact deltas, when populated", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue(POPULATED);
    renderScreen();

    const table = await screen.findByRole("table");
    expect(screen.getByRole("heading", { level: 1, name: "Followed stocks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Follow a stock" })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Symbol of the stock to follow" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Follow many" })).toBeInTheDocument();
    expect(screen.getByText("1 followed, 1 stopped following")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop following AAPL" })).toBeInTheDocument();
    expect(within(table).getByText("Stopped following")).toBeInTheDocument();
    expect(within(table).getByText("Followed")).toBeInTheDocument();
    expect(bannedIn(document.body)).toEqual([]);
  });

  it("uses no retired word when never populated", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue(EMPTY);
    renderScreen();

    expect(await screen.findByText("No stocks followed yet.")).toBeInTheDocument();
    expect(bannedIn(document.body)).toEqual([]);
  });

  it("uses no retired word when the read fails", async () => {
    vi.mocked(client.listInstruments).mockRejectedValue(new Error("service unavailable"));
    renderScreen();

    await screen.findByRole("status");
    expect(bannedIn(document.body)).toEqual([]);
  });

  it("uses no retired word in the dialog, whose sentence says running", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue(POPULATED);
    renderScreen();
    await screen.findByRole("table");

    await userEvent.setup().click(screen.getByRole("button", { name: "Stop following AAPL" }));
    const dialog = await screen.findByRole("dialog");

    expect(dialog).toHaveTextContent("A download is running");
    expect(bannedIn(document.body)).toEqual([]);
  });

  it("finds a retired word where one is planted", () => {
    const probe = document.createElement("div");
    probe.innerHTML =
      '<button aria-label="Retire AAPL">Stop</button><p>No instruments named yet.</p>';
    document.body.append(probe);

    expect(bannedIn(probe)).toEqual(["text: instruments", "name of button: Retire AAPL"]);
    probe.remove();
  });
});

// TC-COMP-133: never-populated is distinct from a filter matching nothing
// (DAC-E2-S4-6); the eight states render through StateRegion (AC-24, DAC-E7-S3-6).
describe("Followed stocks — states", () => {
  it("renders 'No stocks followed yet.' with the add field focused when never populated", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue(EMPTY);
    renderScreen();

    expect(await screen.findByText("No stocks followed yet.")).toBeInTheDocument();
    // AddField focuses itself in a passive effect, which can land a Scheduler
    // task after the commit `findByText` observes (EXP-20261031-1).
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Symbol of the stock to follow" })).toHaveFocus(),
    );
  });

  it("renders the no-match copy, distinct from the never-populated copy, when stocks exist but none match", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue({
      rows: [],
      activeCount: 3,
      retiredCount: 1,
      nextCursor: null,
    });
    const { InstrumentTable } = await import("./instrument-table");
    render(
      <MemoryRouter>
        <InstrumentTable />
      </MemoryRouter>,
    );

    expect(await screen.findByText("No stock matches this filter.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset filter" })).toBeInTheDocument();
    expect(screen.queryByText("No stocks followed yet.")).not.toBeInTheDocument();
  });

  it("keeps the add field, and what was typed in it, while the list errors and across Try again", async () => {
    const user = userEvent.setup();
    vi.mocked(client.listInstruments).mockRejectedValueOnce(new Error("service unavailable"));
    renderScreen();

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Couldn't read followed stocks: service unavailable.");
    const field = screen.getByRole("textbox", { name: "Symbol of the stock to follow" });
    await user.type(field, "TSLA");
    vi.mocked(client.listInstruments).mockClear();
    vi.mocked(client.listInstruments).mockResolvedValue(POPULATED);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await screen.findByRole("table");
    expect(client.listInstruments).toHaveBeenCalledTimes(2); // the screen's read, then the table's
    expect(screen.getByRole("textbox", { name: "Symbol of the stock to follow" })).toHaveValue(
      "TSLA",
    );
    expect(document.body.textContent).not.toMatch(/request unknown|\(request /);
  });

  it("is busy and shows no add field while the first read is pending", async () => {
    vi.mocked(client.listInstruments).mockReturnValue(new Promise(() => undefined));
    renderScreen();

    const loading = await screen.findByText("Loading followed stocks…");
    expect(loading.closest("[aria-busy='true']")).not.toBeNull();
    expect(
      screen.queryByRole("textbox", { name: "Symbol of the stock to follow" }),
    ).not.toBeInTheDocument();
  });

  it("renders the blocked download action with its reason while history depth is unset", async () => {
    vi.mocked(client.listInstruments).mockResolvedValue(POPULATED);
    renderScreen();
    await screen.findByRole("table");

    const button = screen.getByRole("button", { name: "Download now" });
    expect(button).toHaveAttribute("data-variant", "blocked");
  });
});
