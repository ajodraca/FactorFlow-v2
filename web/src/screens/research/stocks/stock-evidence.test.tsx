import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as classificationClient from "../../../api/classification-client";
import type {
  CurrentSet,
  FactorCell,
  InputRow,
  StockEvidence,
  StockHistory,
} from "../../../api/classification-types";
import { ApiUnreachableError } from "../../../api/client";
import { CELL, EVIDENCE, RESULTS, SHELL_ROUTES, failureSentence } from "../copy";
import StockEvidenceScreen from "./index";

vi.mock("../../../api/classification-client", async () => ({
  ...(await vi.importActual<typeof import("../../../api/classification-client")>(
    "../../../api/classification-client",
  )),
  getStockEvidence: vi.fn(),
  getStockHistory: vi.fn(),
}));

const getStockEvidence = vi.mocked(classificationClient.getStockEvidence);
const getStockHistory = vi.mocked(classificationClient.getStockHistory);
const { ClassificationApiError } = classificationClient;

function cell(overrides: Partial<FactorCell> = {}): FactorCell {
  return {
    status: "classified",
    score: "0.58",
    percentile: "72.00",
    reasonCode: null,
    reasonInput: null,
    reasonDetail: null,
    restatedPossible: false,
    ...overrides,
  };
}

const INCOMPLETE = cell({
  status: "not_classified",
  score: null,
  percentile: null,
  reasonCode: "input_missing",
  reasonInput: "book_to_price",
});

const SET: CurrentSet = {
  setId: "s-1",
  classificationDate: "2026-10-15",
  runId: "r-1",
  runStartedAt: "2026-10-15T06:00:00Z",
  runOutcome: "succeeded",
  state: "complete",
  startedAt: "2026-10-15T22:40:00Z",
  endedAt: "2026-10-15T22:46:00Z",
  latestTradingDay: "2026-10-14",
  activeInstruments: 30,
  notCurrent: false,
};

function input(overrides: Partial<InputRow> = {}): InputRow {
  return {
    factor: "value",
    inputName: "book_to_price",
    label: "book-to-price",
    status: "present",
    value: "0.4231",
    asOf: "2026-06-30",
    knownOn: "2026-10-14",
    restatedPossible: false,
    detail: {},
    ...overrides,
  };
}

function evidence(overrides: Partial<StockEvidence> = {}): StockEvidence {
  return {
    symbol: "KO",
    name: "The Coca-Cola Company",
    lifecycle: "active",
    set: SET,
    factors: { value: cell(), growth: cell(), momentum: cell() },
    inputs: [],
    memberships: [],
    ...overrides,
  };
}

function history(sets: StockHistory["sets"] = []): StockHistory {
  return { symbol: "KO", sets, nextCursor: null };
}

function historyRow(setId: string, date: string, value = cell()): StockHistory["sets"][number] {
  return {
    setId,
    classificationDate: date,
    runId: `run-${setId}`,
    runOutcome: "succeeded",
    endedAt: `${date}T22:46:00Z`,
    factors: { value, growth: cell(), momentum: cell() },
  };
}

function apiError(code: string) {
  return new ClassificationApiError("ignored envelope message", "req-1", {
    code,
    operation: "get-stock-evidence",
    resource: "classification",
    symbols: code === "instrument_not_found" ? ["XYZ"] : [],
  });
}

function Probe(): JSX.Element {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderScreen(path = "/research/stocks/KO") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
      <Routes>
        <Route path="/research/stocks/:symbol" element={<StockEvidenceScreen />} />
        <Route path="*" element={<span>elsewhere</span>} />
      </Routes>
    </MemoryRouter>,
  );
}

const marked = cell({ restatedPossible: true });

beforeEach(() => {
  getStockEvidence.mockResolvedValue(evidence());
  getStockHistory.mockResolvedValue(history());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("StockEvidenceScreen — mandatory component tests", () => {
  // Implements TC-COMP-116
  it("reads Not followed on every factor of a retired stock while its earlier scores stay in the history tab", async () => {
    const retired = cell({
      status: "not_classified",
      score: null,
      percentile: null,
      reasonCode: "retired",
    });
    getStockEvidence.mockResolvedValue(
      evidence({
        lifecycle: "retired",
        factors: { value: retired, growth: retired, momentum: retired },
      }),
    );
    getStockHistory.mockResolvedValue(
      history([
        historyRow("s-2", "2026-10-01", cell({ percentile: "81.00" })),
        historyRow("s-1", "2026-09-15", cell({ percentile: "64.00" })),
      ]),
    );
    renderScreen();

    const title = await screen.findByRole("heading", { level: 1 });
    expect(within(title).getByText(CELL.notFollowed).closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "status-neutral",
    );
    const cards = screen.getAllByRole("region");
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(within(card).getByText(CELL.notFollowed)).toBeInTheDocument();
      expect(within(card).getByText(CELL.notFollowedNoDate)).toBeInTheDocument();
      expect(card.querySelector("dl")).toBeNull();
      expect(within(card).queryByText(CELL.incomplete)).not.toBeInTheDocument();
    }

    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab }));
    const table = await screen.findByRole("table", { name: EVIDENCE.earlierScoresFor("KO") });
    expect(within(table).getByText("2026-10-01")).toBeInTheDocument();
    expect(within(table).getByText("2026-09-15")).toBeInTheDocument();
    expect(within(table).getByText("81")).toBeInTheDocument();
    expect(within(table).getByText("64")).toBeInTheDocument();
  });

  // Implements TC-COMP-149
  it("shows a not-found state, not an empty card set, for an unknown symbol", async () => {
    getStockEvidence.mockRejectedValue(apiError("instrument_not_found"));
    renderScreen("/research/stocks/XYZ");

    expect(
      await screen.findByText("FactorFlow doesn't follow a stock named XYZ."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: EVIDENCE.followedStocksLink })).toHaveAttribute(
      "href",
      SHELL_ROUTES.followedStocks,
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(getStockHistory).not.toHaveBeenCalled();
  });

  // Implements TC-COMP-192
  it("states the coverage sentence once and the restatement meaning once, directly below the first card with a mark", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({
        factors: { value: INCOMPLETE, growth: marked, momentum: cell() },
        inputs: [
          input({ restatedPossible: true }),
          input({
            factor: "growth",
            inputName: "revenue_growth",
            label: "revenue growth",
            value: "0.04",
            restatedPossible: true,
          }),
        ],
      }),
    );
    renderScreen();

    await screen.findByRole("heading", { level: 1 });
    expect(screen.getAllByText(CELL.coverageStatement)).toHaveLength(1);
    const sentences = screen.getAllByText(CELL.restatedExplanation);
    expect(sentences).toHaveLength(1);
    // Value is Incomplete but its input row carries a mark, so the first mark is in the value card.
    const [value, growth] = screen.getAllByRole("region");
    expect(value.nextElementSibling).toBe(sentences[0]);
    expect(growth.nextElementSibling).not.toBe(sentences[0]);
    // The marks carry no pointer to the sentence.
    expect(document.querySelector("[aria-describedby]")).toBeNull();
  });

  it("places the restatement meaning below the growth card when value has no mark", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({ factors: { value: cell(), growth: marked, momentum: cell() } }),
    );
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    const [, growth] = screen.getAllByRole("region");
    expect(growth.nextElementSibling).toBe(screen.getByText(CELL.restatedExplanation));
  });

  it("renders the restatement meaning nowhere when no mark is drawn, and still the coverage sentence once", async () => {
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText(CELL.restatedExplanation)).not.toBeInTheDocument();
    expect(screen.getAllByText(CELL.coverageStatement)).toHaveLength(1);
  });

  it("shows only the history panel's own sentences while Earlier scores is active", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({ factors: { value: marked, growth: cell(), momentum: cell() } }),
    );
    getStockHistory.mockResolvedValue(history([historyRow("s-1", "2026-10-01", marked)]));
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByText(CELL.restatedExplanation)).toBeVisible();

    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab }));
    await screen.findByRole("table", { name: EVIDENCE.earlierScoresFor("KO") });
    const explanations = screen.getAllByText(CELL.restatedExplanation);
    expect(explanations).toHaveLength(2);
    expect(explanations.filter(isVisible)).toHaveLength(1);
    const coverage = screen.getByText(CELL.coverageStatement);
    expect(isVisible(coverage)).toBe(false);
  });
});

function isVisible(node: Element): boolean {
  return node.closest("[hidden]") === null;
}

describe("StockEvidenceScreen — screen states", () => {
  it("renders a skeleton of three cards while the evidence is read", () => {
    getStockEvidence.mockReturnValue(new Promise(() => undefined));
    renderScreen();
    expect(screen.getAllByTestId("card-skeleton")).toHaveLength(3);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("states that no stocks have been scored when there is no current set, keeping the history tab reachable", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({ set: null, factors: {} as StockEvidence["factors"] }),
    );
    renderScreen();
    expect(await screen.findByText(EVIDENCE.noScoreYet("KO"))).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab }));
    expect(getStockHistory).toHaveBeenCalledTimes(1);
  });

  it("states that FactorFlow began following the stock later when the current set has no cells for it", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({
        symbol: "NEWCO",
        name: "NewCo Inc.",
        factors: {} as StockEvidence["factors"],
        inputs: [],
        memberships: [{ universeId: "u-1", name: "Tech" }],
      }),
    );
    renderScreen("/research/stocks/NEWCO");
    expect(
      await screen.findByText(EVIDENCE.notYetFollowed("NEWCO", "2026-10-15")),
    ).toBeInTheDocument();
    expect(screen.queryByText(EVIDENCE.noScoreYet("NEWCO"))).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.queryByText(CELL.incomplete)).not.toBeInTheDocument();
    expect(screen.getByTestId("memberships")).toHaveTextContent("In Tech");
    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab }));
    expect(getStockHistory).toHaveBeenCalledWith("NEWCO", expect.anything());
  });

  it("treats a response lacking only one factor's cell the same way, never passing an undefined cell to a card", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({ factors: { value: cell(), growth: cell() } as StockEvidence["factors"] }),
    );
    renderScreen();
    expect(
      await screen.findByText(EVIDENCE.notYetFollowed("KO", "2026-10-15")),
    ).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("renders the error state with the code's sentence and Try again, keeping the title", async () => {
    getStockEvidence.mockRejectedValueOnce(apiError("internal_error"));
    renderScreen();
    const sentence = failureSentence({
      operation: "get-stock-evidence",
      resource: "classification",
      code: "internal_error",
    });
    expect(await screen.findByText(sentence)).toBeInTheDocument();
    expect(screen.queryByText("ignored envelope message")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("KO");

    await userEvent.click(screen.getByRole("button", { name: RESULTS.tryAgain }));
    expect(await screen.findAllByRole("region")).toHaveLength(3);
    expect(getStockEvidence).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(sentence)).not.toBeInTheDocument();
  });

  it("uses the generic sentence for an error that is not an API error", async () => {
    getStockEvidence.mockRejectedValueOnce(new Error("boom"));
    renderScreen();
    expect(
      await screen.findByText(
        failureSentence({
          operation: "get-stock-evidence",
          resource: "classification",
          code: null,
        }),
      ),
    ).toBeInTheDocument();
  });

  it("renders the shell's unreachable state when the API cannot be reached", async () => {
    getStockEvidence.mockRejectedValue(new ApiUnreachableError("connect ECONNREFUSED"));
    renderScreen();
    expect(await screen.findByTestId("unreachable-state")).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("titles the page with the symbol in the numeric face and the name, under a Research breadcrumb, capped at 1180 px", async () => {
    renderScreen();
    const title = await screen.findByRole("heading", { level: 1 });
    expect(within(title).getByText("KO")).toHaveClass("font-numeric");
    expect(title).toHaveTextContent("The Coca-Cola Company");
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(crumbs).toHaveTextContent("Research › KO");
    expect(within(crumbs).getByRole("link", { name: "Research" })).toHaveAttribute(
      "href",
      "/research",
    );
    expect(title.parentElement).toHaveClass("max-w-[1180px]");
    expect(within(title).queryByText(CELL.notFollowed)).not.toBeInTheDocument();
  });

  it("lists memberships as links to their universes, or In no universe", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({
        memberships: [
          { universeId: "u-1", name: "Tech" },
          { universeId: "u-2", name: "Dividend growers" },
        ],
      }),
    );
    const { unmount } = renderScreen();
    const line = await screen.findByTestId("memberships");
    expect(line).toHaveTextContent("In Tech and Dividend growers");
    expect(within(line).getByRole("link", { name: "Tech" })).toHaveAttribute(
      "href",
      "/research/universes/u-1",
    );
    expect(within(line).getByRole("link", { name: "Dividend growers" })).toHaveAttribute(
      "href",
      "/research/universes/u-2",
    );
    unmount();
    getStockEvidence.mockResolvedValue(evidence());
    renderScreen();
    expect(await screen.findByTestId("memberships")).toHaveTextContent("In no universe");
  });

  it("joins three memberships with commas and a final and", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({
        memberships: [
          { universeId: "u-1", name: "A" },
          { universeId: "u-2", name: "B" },
          { universeId: "u-3", name: "C" },
        ],
      }),
    );
    renderScreen();
    expect(await screen.findByTestId("memberships")).toHaveTextContent("In A, B and C");
  });

  it("hands each card its factor's inputs and the set's dates", async () => {
    getStockEvidence.mockResolvedValue(
      evidence({
        factors: { value: INCOMPLETE, growth: cell(), momentum: cell() },
        inputs: [
          input({ status: "missing", value: null }),
          input({
            factor: "growth",
            inputName: "revenue_growth",
            label: "revenue growth",
            value: "0.04",
          }),
        ],
      }),
    );
    renderScreen();
    const [value, growth, momentum] = await screen.findAllByRole("region");
    expect(within(value).getByText("book-to-price")).toBeInTheDocument();
    expect(within(value).queryByText("revenue growth")).not.toBeInTheDocument();
    expect(within(growth).getByText("revenue growth")).toBeInTheDocument();
    expect(momentum.querySelector("dl")).toBeNull();
    expect(value).toHaveTextContent("Value for KO couldn't be scored: book-to-price is missing.");
  });

  it("mounts no as-of line, banner or poll", async () => {
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByTestId("as-of-line")).not.toBeInTheDocument();
    expect(screen.queryByTestId("not-current-banner")).not.toBeInTheDocument();
    expect(getStockEvidence).toHaveBeenCalledTimes(1);
  });
});

describe("StockEvidenceScreen — symbol and header edges", () => {
  it("sends the symbol as received and shows it upper-cased", async () => {
    getStockEvidence.mockResolvedValue(evidence());
    renderScreen("/research/stocks/ko");
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("KO");
    expect(getStockEvidence).toHaveBeenCalledWith("ko");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent(
      "Research › KO",
    );
  });

  it("keeps the breadcrumb and title in the not-found state, naming the symbol in capitals", async () => {
    getStockEvidence.mockRejectedValue(apiError("instrument_not_found"));
    renderScreen("/research/stocks/xyz");
    expect(
      await screen.findByText("FactorFlow doesn't follow a stock named XYZ."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("XYZ");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent(
      "Research › XYZ",
    );
  });

  it("falls back to Now for an unknown tab value", async () => {
    renderScreen("/research/stocks/KO?tab=bogus");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("tab", { name: EVIDENCE.nowTab })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(getStockHistory).not.toHaveBeenCalled();
  });
});

describe("StockEvidenceScreen — tabs", () => {
  it("offers Now (selected) and Earlier scores, each panel labelled by its tab", async () => {
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    const now = screen.getByRole("tab", { name: EVIDENCE.nowTab });
    const earlier = screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab });
    expect(now).toHaveAttribute("aria-selected", "true");
    expect(earlier).toHaveAttribute("aria-selected", "false");
    expect(now).toHaveAttribute("tabindex", "0");
    expect(earlier).toHaveAttribute("tabindex", "-1");
    const nowPanel = document.getElementById(
      now.getAttribute("aria-controls") ?? "",
    ) as HTMLElement;
    expect(nowPanel).toHaveAttribute("role", "tabpanel");
    expect(nowPanel).toHaveAttribute("aria-labelledby", now.id);
    expect(nowPanel).not.toHaveAttribute("hidden");
    const earlierPanel = document.getElementById(
      earlier.getAttribute("aria-controls") ?? "",
    ) as HTMLElement;
    expect(earlierPanel).toHaveAttribute("aria-labelledby", earlier.id);
    expect(earlierPanel).toHaveAttribute("hidden");
  });

  it("opens Earlier scores from ?tab=earlier", async () => {
    renderScreen("/research/stocks/KO?tab=earlier");
    expect(await screen.findByRole("tab", { name: EVIDENCE.earlierScoresTab })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await waitFor(() => expect(getStockHistory).toHaveBeenCalledTimes(1));
  });

  it("updates the tab query and aria-selected on click, and drops the query for Now", async () => {
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab }));
    expect(screen.getByTestId("location")).toHaveTextContent("/research/stocks/KO?tab=earlier");
    expect(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.nowTab }));
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/research\/stocks\/KO$/);
    expect(screen.getByRole("tab", { name: EVIDENCE.nowTab })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("moves between tabs with the arrow, Home and End keys", async () => {
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    screen.getByRole("tab", { name: EVIDENCE.nowTab }).focus();
    await userEvent.keyboard("{ArrowRight}");
    const earlier = screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab });
    expect(earlier).toHaveAttribute("aria-selected", "true");
    expect(earlier).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: EVIDENCE.nowTab })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(earlier).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: EVIDENCE.nowTab })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(earlier).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: EVIDENCE.nowTab })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(earlier).toHaveFocus();
    await userEvent.keyboard("{a}");
    expect(earlier).toHaveFocus();
  });

  it("reads the history only on first activation, then keeps it mounted without a second read", async () => {
    renderScreen();
    await screen.findByRole("heading", { level: 1 });
    expect(getStockHistory).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab }));
    await waitFor(() => expect(getStockHistory).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.nowTab }));
    await userEvent.click(screen.getByRole("tab", { name: EVIDENCE.earlierScoresTab }));
    expect(getStockHistory).toHaveBeenCalledTimes(1);
    expect(getStockEvidence).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("region", { hidden: true })).toHaveLength(3);
  });

  it("reads once for a changed symbol and resets the history mount", async () => {
    const view = render(
      <MemoryRouter initialEntries={["/research/stocks/KO?tab=earlier"]}>
        <Probe />
        <Routes>
          <Route path="/research/stocks/:symbol" element={<StockEvidenceScreen />} />
        </Routes>
        <GoTo to="/research/stocks/PEP" />
      </MemoryRouter>,
    );
    await waitFor(() => expect(getStockHistory).toHaveBeenCalledTimes(1));
    getStockEvidence.mockResolvedValue(evidence({ symbol: "PEP", name: "PepsiCo" }));
    await userEvent.click(within(view.container).getByRole("button", { name: "go" }));
    await waitFor(() => expect(getStockEvidence).toHaveBeenLastCalledWith("PEP"));
    expect(getStockEvidence).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("PEP");
    expect(screen.getByRole("tab", { name: EVIDENCE.nowTab })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(getStockHistory).toHaveBeenCalledTimes(1);
  });
});

function GoTo({ to }: { to: string }): JSX.Element {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      go
    </button>
  );
}
