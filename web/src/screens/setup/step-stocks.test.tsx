import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ApiUnreachableError,
  addInstruments,
  getHistoryDepth,
  listInstruments,
} from "../../api/client";
import type { SymbolOutcome } from "../../api/types";
import { type ShellContextValue, useShell } from "../../app/shell-context";
import type { Attention } from "../../app/shell-types";
import { parseBulkSymbols } from "../instruments/parse-bulk-symbols";
import { STEP3, STEP_TITLES } from "./copy";
import { type SetupDrafts, SetupDraftProvider } from "./draft";
import { StepList } from "./step-list";
import { StepStocks } from "./step-stocks";
import { type SetupState, useSetupState } from "./use-setup-state";

// Implements TC-COMP-100, TC-COMP-103, TC-COMP-114 (screen half), TC-COMP-115,
// TC-COMP-116, TC-COMP-117 and TC-COMP-118 of CAP-003-E4-S3 (AC-3, AC-5, AC-6,
// AC-17, AC-19, DAC-E4-5, DAC-E4-6, DAC-E4-7, DAC-E4-11, DAC-E4-13,
// DAC-E4-S3-1 to DAC-E4-S3-6; DEC-0351 to DEC-0355).

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  addInstruments: vi.fn(),
  getHistoryDepth: vi.fn(),
  listInstruments: vi.fn(),
}));
vi.mock("../instruments/parse-bulk-symbols", async (importActual) => {
  const actual = await importActual<typeof import("../instruments/parse-bulk-symbols")>();
  return { ...actual, parseBulkSymbols: vi.fn(actual.parseBulkSymbols) };
});
vi.mock("../../app/shell-context", () => ({ useShell: vi.fn() }));

const CHECKED_AT = new Date("2026-09-06T18:30:00.000Z");
/** A duplicate (KO), a fixable entry (BRK/B), an unfixable one (ZZZZ!) and one more symbol. */
const MIXED = "KO, KO, BRK/B, ZZZZ!, AAPL";
const FORBIDDEN =
  /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

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

function shell(): ShellContextValue {
  return {
    health: {
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
    },
    attention: {
      kind: "ok",
      data: { ...ATTENTION_BASE, latest_download: null },
      checkedAt: CHECKED_AT,
    },
    scores: { kind: "loading" },
    refresh: vi.fn(),
    setTitleDetail: vi.fn(),
  };
}

const goToSpy = vi.fn();
const rereadSpy = vi.fn();
const setDraftSpy = vi.fn();

function stateWith(overrides: Partial<SetupState> = {}): SetupState {
  return {
    current: 3,
    done: { 1: true, 2: true, 3: false, 4: false },
    step4: "ready",
    drafts: { yearsText: "", source: "paste", pasted: "", unposted: [] },
    depth: {
      kind: "ok",
      data: { years: 5, updatedAt: "2026-09-06T18:00:00Z" },
      checkedAt: CHECKED_AT,
    },
    activeCount: { kind: "ok", data: 0, checkedAt: CHECKED_AT },
    loading: false,
    goTo: goToSpy,
    reread: rereadSpy,
    setDraft: setDraftSpy,
    ...overrides,
  };
}

/** Holds the drafts in state so typing updates the field, and keeps every call observable. */
function Harness({
  initial = {},
  overrides = {},
}: {
  initial?: Partial<SetupDrafts>;
  overrides?: Partial<SetupState>;
}) {
  const [drafts, setDrafts] = useState<SetupDrafts>({
    yearsText: "",
    source: "paste",
    pasted: "",
    unposted: [],
    ...initial,
  });
  const setDraft: SetupState["setDraft"] = (key, value) => {
    setDraftSpy(key, value);
    setDrafts((previous) => ({ ...previous, [key]: value }));
  };
  return <StepStocks state={stateWith({ drafts, setDraft, ...overrides })} />;
}

const symbols = (n: number, start = 0): string[] =>
  Array.from({ length: n }, (_, i) => `S${start + i}`);

const outcome = (symbol: string, disposition: SymbolOutcome["disposition"]): SymbolOutcome => ({
  inputSymbol: symbol,
  normalisedSymbol: symbol,
  disposition,
  reason: null,
});

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** The text a person or a screen reader meets: content, names, titles and descriptions. */
function visibleAndAccessibleText(container: HTMLElement): string {
  const parts: string[] = [container.textContent ?? ""];
  for (const element of Array.from(container.querySelectorAll("*"))) {
    for (const name of ["aria-label", "title"]) {
      parts.push(element.getAttribute(name) ?? "");
    }
    for (const name of ["aria-labelledby", "aria-describedby"]) {
      for (const id of (element.getAttribute(name) ?? "").split(/\s+/).filter(Boolean)) {
        parts.push(document.getElementById(id)?.textContent ?? "");
      }
    }
  }
  return parts.join(" ");
}

const field = (): HTMLTextAreaElement =>
  screen.getByRole("textbox", { name: "Stock symbols" }) as HTMLTextAreaElement;
const continueButton = (): HTMLElement => screen.getByRole("button", { name: "Continue" });

async function pasteInto(user: ReturnType<typeof userEvent.setup>, text: string): Promise<void> {
  await user.click(field());
  await user.paste(text);
}

const okResult = (batch: string[]) => ({
  added: batch.map((s) => outcome(s, "added")),
  reactivated: [],
  rejected: [],
});

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const DUPLICATE_RESPONSE = {
  added: [{ input_symbol: "AAPL", normalised_symbol: "AAPL", disposition: "added", reason: null }],
  reactivated: [],
  rejected: [
    {
      input_symbol: "KO",
      normalised_symbol: "KO",
      disposition: "duplicate_active",
      reason: "an active instrument with this symbol already exists",
    },
  ],
};

beforeEach(() => {
  goToSpy.mockReset();
  rereadSpy.mockReset();
  setDraftSpy.mockReset();
  vi.mocked(parseBulkSymbols).mockClear();
  vi.mocked(useShell).mockReturnValue(shell());
  vi.mocked(addInstruments).mockReset();
  vi.mocked(addInstruments).mockImplementation(async (batch: string[]) => okResult(batch));
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Implements TC-COMP-100
describe("Continue blocked at zero, warning below 30 (TC-COMP-100; DAC-E4-7)", () => {
  it("blocks Continue with its reason when nothing usable is pasted", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ source: "paste" }} />);
    await pasteInto(user, "!!!, ???");
    await user.tab();
    const button = continueButton();
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(button).toHaveAccessibleDescription("Paste at least one symbol, or choose Add later.");
    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    expect(vi.mocked(addInstruments)).not.toHaveBeenCalled();
    expect(goToSpy).not.toHaveBeenCalled();
    expect(rereadSpy).not.toHaveBeenCalled();
    expect(screen.queryByText(/^Factor scores need/)).toBeNull();
  });

  it("blocks Continue with an empty field when Paste a list is chosen", () => {
    render(<Harness initial={{ source: "paste" }} />);
    expect(continueButton()).toHaveAttribute("data-variant", "blocked");
    expect(screen.queryByText(/^Factor scores need/)).toBeNull();
    expect(screen.queryByText(/symbols recognised/)).toBeNull();
  });

  it("warns at a single accepted symbol", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pasteInto(user, "AAPL");
    await user.tab();
    expect(
      screen.getByText(
        "Factor scores need at least 30 stocks with complete data. With 1, no factor can be ranked yet.",
      ),
    ).toBeInTheDocument();
    expect(continueButton()).toHaveAttribute("data-variant", "default");
  });

  it("warns at twelve and leaves Continue available", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pasteInto(user, symbols(12).join(", "));
    await user.tab();
    expect(
      screen.getByText(
        "Factor scores need at least 30 stocks with complete data. With 12, no factor can be ranked yet.",
      ),
    ).toBeInTheDocument();
    const button = continueButton();
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).not.toHaveAttribute("aria-disabled");
  });

  it("warns at 29 and not at 30", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    await pasteInto(user, symbols(30).join(", "));
    await user.tab();
    expect(screen.queryByText(/^Factor scores need/)).toBeNull();
    expect(continueButton()).toHaveAttribute("data-variant", "default");
    unmount();
    render(<Harness />);
    await pasteInto(user, symbols(29).join(", "));
    await user.tab();
    expect(
      screen.getByText(
        "Factor scores need at least 30 stocks with complete data. With 29, no factor can be ranked yet.",
      ),
    ).toBeInTheDocument();
  });

  it("does not count duplicates towards the 30", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    await pasteInto(user, `KO, KO, ${symbols(29).join(", ")}`);
    await user.tab();
    expect(screen.queryByText(/^Factor scores need/)).toBeNull();
    unmount();
    render(<Harness />);
    await pasteInto(user, `${symbols(28).join(", ")}, KO, KO`);
    await user.tab();
    expect(screen.getByText(/^Factor scores need .* With 29, no factor/)).toBeInTheDocument();
  });
});

// Implements TC-COMP-114
describe("parse on paste and blur only; the requests (TC-COMP-114; DAC-E4-S3-2, DAC-E4-6)", () => {
  it("parses once on paste and once on blur, never per keystroke", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const parse = vi.mocked(parseBulkSymbols);
    const base = parse.mock.calls.length;
    expect(base).toBe(0);
    await user.click(field());
    await user.paste("AAPL, MSFT");
    expect(parse.mock.calls.length).toBe(base + 1);
    setDraftSpy.mockClear();
    await user.type(field(), "{Enter}NVDA");
    expect(parse.mock.calls.length).toBe(base + 1);
    expect(setDraftSpy.mock.calls.filter(([key]) => key === "pasted")).toHaveLength(5);
    await user.tab();
    expect(parse.mock.calls.length).toBe(base + 2);
    expect(
      screen.getByText("3 symbols recognised, 0 duplicates, 0 not recognised"),
    ).toBeInTheDocument();
    await user.type(field(), "X");
    expect(parse.mock.calls.length).toBe(base + 2);
  });

  it("does not parse a keystroke typed before any paste", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(field(), "aap");
    expect(vi.mocked(parseBulkSymbols)).not.toHaveBeenCalled();
  });

  it("posts 2500 symbols as three requests, then re-reads and moves to step 4", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pasteInto(user, symbols(2500).join("\n"));
    expect(
      screen.getByText("2,500 symbols recognised, 0 duplicates, 0 not recognised"),
    ).toBeInTheDocument();
    await user.click(continueButton());
    await waitFor(() => expect(goToSpy).toHaveBeenCalledWith(4));
    const calls = vi.mocked(addInstruments).mock.calls;
    expect(calls.map(([batch]) => batch.length)).toEqual([1000, 1000, 500]);
    expect(calls.map(([batch]) => batch[0])).toEqual(["S0", "S1000", "S2000"]);
    expect(rereadSpy).toHaveBeenCalledTimes(1);
    expect(rereadSpy).toHaveBeenCalledWith("activeCount");
    expect(goToSpy).toHaveBeenCalledTimes(1);
    expect(rereadSpy.mock.invocationCallOrder[0]).toBeLessThan(
      goToSpy.mock.invocationCallOrder[0] ?? 0,
    );
  });
});

// Implements TC-COMP-115
describe("Add later posts nothing and makes step 4 current (TC-COMP-115; DAC-E4-S3-3)", () => {
  function Host({ seed }: { seed?: string }) {
    const state = useSetupState();
    useEffect(() => {
      if (seed !== undefined) {
        state.setDraft("pasted", seed);
      }
    }, [seed, state.setDraft]);
    return (
      <>
        <p data-testid="current">{state.current}</p>
        <p data-testid="done-3">{String(state.done[3])}</p>
        <p data-testid="source">{String(state.drafts.source)}</p>
        {state.current === 3 ? <StepStocks state={state} /> : null}
      </>
    );
  }

  function renderHost(seed?: string) {
    vi.mocked(getHistoryDepth).mockResolvedValue({ years: 5, updatedAt: "2026-09-06T18:00:00Z" });
    vi.mocked(listInstruments).mockResolvedValue({
      rows: [],
      activeCount: 0,
      retiredCount: 0,
      nextCursor: null,
    });
    return render(
      <SetupDraftProvider>
        <Host seed={seed} />
      </SetupDraftProvider>,
    );
  }

  it("moves to step 4 without a request, leaving step 3 still to do", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderHost("AAPL");
    await waitFor(() => expect(screen.getByTestId("current")).toHaveTextContent("3"));
    await screen.findByRole("radio", { name: "Add later" });
    expect(continueButton()).toHaveAttribute("data-variant", "blocked");
    await user.click(screen.getByRole("radio", { name: "Add later" }));
    expect(continueButton()).toHaveAttribute("data-variant", "default");
    await user.click(continueButton());
    await waitFor(() => expect(screen.getByTestId("current")).toHaveTextContent("4"));
    expect(screen.getByTestId("done-3")).toHaveTextContent("false");
    expect(screen.getByTestId("source")).toHaveTextContent("later");
    expect(vi.mocked(addInstruments)).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("blocks Continue until a source is chosen", async () => {
    renderHost();
    await waitFor(() => expect(screen.getByTestId("current")).toHaveTextContent("3"));
    expect(await screen.findByRole("button", { name: "Continue" })).toHaveAttribute(
      "data-variant",
      "blocked",
    );
  });
});

// Implements TC-COMP-116
describe("pasted symbols go as a JSON array, rejections are announced (TC-COMP-116; DAC-E4-S3-4)", () => {
  it("posts the accepted symbols and names the already-followed ones in the live region", async () => {
    const user = userEvent.setup();
    const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
    vi.mocked(addInstruments).mockImplementation(actual.addInstruments);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => jsonResponse(DUPLICATE_RESPONSE, 201));
    render(<Harness />);
    await pasteInto(user, "aapl, KO, ZZZZ!");
    await user.tab();
    await user.click(continueButton());
    await waitFor(() => expect(rereadSpy).toHaveBeenCalledWith("activeCount"));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/instruments");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body as string)).toEqual({ symbols: ["AAPL", "KO"] });

    const describedBy = (field().getAttribute("aria-describedby") ?? "").split(/\s+/);
    expect(describedBy).toHaveLength(2);
    const elements = describedBy.map((id) => document.getElementById(id) as HTMLElement);
    expect(elements.map((element) => element.textContent).join("|")).toContain(
      "Whether the provider knows each one is checked during the download.",
    );
    const live = elements.filter((element) => element.getAttribute("role") === "status");
    expect(live).toHaveLength(1);
    expect(live[0]).toHaveTextContent("ZZZZ!, not a valid symbol format");
    expect(live[0]).toHaveTextContent("KO, already followed");
    expect(document.body.textContent).not.toContain(
      "an active instrument with this symbol already exists",
    );

    expect(goToSpy).toHaveBeenLastCalledWith(3);
    expect(rereadSpy).toHaveBeenLastCalledWith("activeCount");

    fetchSpy.mockImplementation(async () =>
      jsonResponse({ error: { code: "all_duplicate", message: "x", request_id: "r" } }, 409),
    );
    await user.click(continueButton());
    await waitFor(() => expect(goToSpy).toHaveBeenLastCalledWith(4));
    expect(screen.queryByText("KO, already followed")).toBeNull();
  });
});

// Implements TC-COMP-117 and TC-COMP-118
describe("step 3 states use the display vocabulary and render no badge (TC-COMP-117, TC-COMP-118)", () => {
  it("has a forbidden-term pattern that is not vacuous", () => {
    for (const planted of [
      "one run",
      "Runs",
      "Retired",
      "Instrument",
      "acquire",
      "Provider credential",
    ]) {
      expect(planted).toMatch(FORBIDDEN);
    }
    for (const clean of [
      "already followed",
      "listed more than once",
      "not a valid symbol format",
    ]) {
      expect(clean).not.toMatch(FORBIDDEN);
    }
  });

  type Scenario = {
    name: string;
    initial?: Partial<SetupDrafts>;
    overrides?: Partial<SetupState>;
    play?: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
    summaryRows?: boolean;
  };

  const scenarios: Scenario[] = [
    { name: "nothing chosen", initial: { source: null } },
    { name: "Add later chosen", initial: { source: "later" } },
    { name: "Paste a list with an empty field", initial: { source: "paste" } },
    {
      name: "a summary with a duplicate and two unreadable entries",
      play: async (user) => {
        await pasteInto(user, MIXED);
        await user.tab();
      },
      summaryRows: true,
    },
    {
      name: "after a 201 with a duplicate_active rejection",
      play: async (user) => {
        const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
        vi.mocked(addInstruments).mockImplementation(actual.addInstruments);
        vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
          jsonResponse(DUPLICATE_RESPONSE, 201),
        );
        await pasteInto(user, "aapl, KO, ZZZZ!");
        await user.tab();
        await user.click(continueButton());
        await screen.findByText("KO, already followed");
      },
      summaryRows: true,
    },
    {
      name: "after a failed batch (a server failure)",
      play: async (user) => {
        vi.mocked(addInstruments).mockRejectedValue(
          new ApiError("x", "req-1", { code: "internal_error" }),
        );
        await pasteInto(user, "AAPL, KO");
        await user.click(continueButton());
        await screen.findByRole("alert");
      },
    },
    {
      name: "after a failed batch (an unreachable server)",
      play: async (user) => {
        vi.mocked(addInstruments).mockRejectedValue(new ApiUnreachableError("x"));
        await pasteInto(user, "AAPL, KO");
        await user.click(continueButton());
        await screen.findByRole("alert");
      },
    },
    {
      name: "a failed followed-count read",
      overrides: {
        activeCount: {
          kind: "error",
          error: new ApiError("an active instrument with this symbol already exists", "req-9", {
            code: "internal_error",
          }),
          last: null,
        },
      },
    },
  ];

  it.each(scenarios)("$name", async ({ initial, overrides, play, summaryRows }) => {
    const user = userEvent.setup();
    const { container } = render(<Harness initial={initial} overrides={overrides} />);
    await play?.(user);
    expect(visibleAndAccessibleText(container)).not.toMatch(FORBIDDEN);
    // TC-COMP-118: no badge of any kind, and no tier shape in the summary.
    expect(
      container.querySelectorAll('[data-variant^="status-"], [data-variant^="coverage-"]'),
    ).toHaveLength(0);
    const summary = container.querySelector('[role="status"]');
    if (summary !== null) {
      expect(summary.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(0);
    }
    if (summaryRows === true) {
      // TC-COMP-118: each disposition is stated in words, never by colour alone.
      const rows = Array.from((summary as HTMLElement).querySelectorAll("li"));
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.textContent).toMatch(
          /(, not a valid symbol format|, listed more than once|, already followed)/,
        );
      }
    }
  });

  it("reads its labels from the catalogue", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ source: "later" }} />);
    const radios = screen.getAllByRole("radio");
    expect(radios.map((radio) => radio.getAttribute("aria-labelledby"))).toHaveLength(2);
    expect(screen.getByRole("radio", { name: STEP3.paste.label })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: STEP3.later.label })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: STEP3.paste.label }));
    await pasteInto(user, MIXED);
    await user.tab();
    // KO and AAPL are accepted once each, KO is repeated once, two entries are unreadable.
    expect(screen.getByText(STEP3.counter("2", "1", "2"))).toBeInTheDocument();
    expect(
      screen.getByText("2 symbols recognised, 1 duplicates, 2 not recognised"),
    ).toBeInTheDocument();
  });
});

// Implements TC-COMP-103
describe("two sources, no file control, four steps (TC-COMP-103; DAC-E4-11)", () => {
  it("offers exactly Paste a list and Add later, each with its description", () => {
    render(<Harness initial={{ source: null }} />);
    const group = screen.getByRole("radiogroup", { name: "How do you want to name them?" });
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((radio) => radio.getAttribute("aria-labelledby") !== null)).toEqual([
      true,
      true,
    ]);
    expect(radios[0]).toHaveAccessibleName("Paste a list");
    expect(radios[0]).toHaveAccessibleDescription(
      "Paste symbols separated by commas or one per line.",
    );
    expect(radios[1]).toHaveAccessibleName("Add later");
    expect(radios[1]).toHaveAccessibleDescription(
      "Continue without stocks for now; you can follow them later from Data health.",
    );
    expect(radios).toHaveLength(2);
  });

  it.each([
    ["nothing chosen", { source: null } as Partial<SetupDrafts>],
    ["paste", { source: "paste" } as Partial<SetupDrafts>],
    ["later", { source: "later" } as Partial<SetupDrafts>],
  ])("has no file control in the %s state", (_name, initial) => {
    const { container } = render(<Harness initial={initial} />);
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByText(/csv/i)).toBeNull();
  });

  it("shows four steps in the list", () => {
    render(<StepList state={stateWith()} />);
    const nav = screen.getByRole("navigation", { name: "Setup steps" });
    const items = within(nav).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    const titles = [STEP_TITLES[1], STEP_TITLES[2], STEP_TITLES[3], STEP_TITLES[4]];
    expect(titles).toEqual(["Market data", "How far back", "Stocks to follow", "Download data"]);
    items.forEach((item, index) => {
      expect(item).toHaveTextContent(titles[index] as string);
      expect(item.textContent).not.toMatch(/paper trading/i);
    });
  });
});

describe("step 3's own cases (AC-3, AC-5, AC-6, DAC-E4-5, DAC-E4-6, DAC-E4-13; DEC-0351 to DEC-0355)", () => {
  it("is a card with the explanation, the note and a Back that sends nothing", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(
      screen.getByRole("region", { name: "Which stocks do you want to follow?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(STEP3.explanation)).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is your followed list. You can add or stop following stocks any time in Data health. Stopping keeps their history; nothing is ever deleted.",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "← Back: How far back" }));
    expect(goToSpy).toHaveBeenCalledWith(2);
    expect(vi.mocked(addInstruments)).not.toHaveBeenCalled();
  });

  it("keeps the choice in the drafts and shows the field only for Paste a list", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness initial={{ source: null }} />);
    expect(screen.queryByRole("textbox", { name: "Stock symbols" })).toBeNull();
    await user.click(screen.getByRole("radio", { name: "Paste a list" }));
    expect(setDraftSpy).toHaveBeenCalledWith("source", "paste");
    expect(field()).toBeInTheDocument();
    unmount();
    render(<Harness initial={{ source: "later" }} />);
    expect(screen.queryByRole("textbox", { name: "Stock symbols" })).toBeNull();
  });

  it("restores the pasted draft and its summary on mount with one parse", () => {
    render(<Harness initial={{ source: "paste", pasted: "AAPL\nKO" }} />);
    expect(field().value).toBe("AAPL\nKO");
    expect(
      screen.getByText("2 symbols recognised, 0 duplicates, 0 not recognised"),
    ).toBeInTheDocument();
    expect(vi.mocked(parseBulkSymbols)).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/not saved yet/)).toBeNull();
  });

  it("upper-cases on blur and never while typing", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(field(), "aapl");
    expect(field().value).toBe("aapl");
    await user.tab();
    expect(field().value).toBe("AAPL");
    expect(setDraftSpy).toHaveBeenLastCalledWith("pasted", "AAPL");
  });

  it("offers a near-miss fix that replaces the entry, re-parses and focuses the field", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pasteInto(user, "AAPL, BRK/B");
    await user.tab();
    const fix = screen.getByRole("button", { name: "Did you mean BRK.B?" });
    expect(fix).toHaveAttribute("data-variant", "outline");
    expect(fix.closest("li")).toHaveTextContent("BRK/B, not a valid symbol format");
    const before = vi.mocked(parseBulkSymbols).mock.calls.length;
    await user.click(fix);
    expect(field().value).toBe("AAPL, BRK.B");
    expect(
      screen.getByText("2 symbols recognised, 0 duplicates, 0 not recognised"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Did you mean BRK.B?" })).toBeNull();
    expect(vi.mocked(parseBulkSymbols).mock.calls.length).toBe(before + 1);
    expect(document.activeElement).toBe(field());
  });

  it("names a repeated symbol once", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pasteInto(user, "KO, KO, KO");
    await user.tab();
    expect(screen.getAllByText("KO, listed more than once")).toHaveLength(1);
    expect(
      screen.getByText("1 symbols recognised, 1 duplicates, 0 not recognised"),
    ).toBeInTheDocument();
  });

  describe("a failed batch (DEC-0354)", () => {
    it("keeps the unposted entries, counts the posted ones and stays on the step", async () => {
      const user = userEvent.setup();
      vi.mocked(addInstruments)
        .mockResolvedValueOnce(okResult(symbols(1000)))
        .mockRejectedValueOnce(new ApiUnreachableError("x"));
      render(<Harness />);
      await pasteInto(user, symbols(2500).join("\n"));
      await user.click(continueButton());
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(
        "Couldn't save the followed list: FactorFlow is not answering",
      );
      expect(alert).toHaveTextContent("1,000 followed so far.");
      const unposted = symbols(1500, 1000);
      expect(setDraftSpy).toHaveBeenCalledWith("unposted", unposted);
      expect(setDraftSpy).toHaveBeenCalledWith("pasted", unposted.join("\n"));
      expect(field().value).toBe(unposted.join("\n"));
      expect(screen.getByRole("status")).toHaveTextContent(
        "1,500 not saved yet; kept in the list to try again.",
      );
      expect(rereadSpy).toHaveBeenCalledWith("activeCount");
      expect(goToSpy).toHaveBeenCalledWith(3);
      expect(goToSpy).not.toHaveBeenCalledWith(4);

      // Retry: only the unposted entries go, and step 4 follows.
      vi.mocked(addInstruments).mockClear();
      await user.click(continueButton());
      await waitFor(() => expect(goToSpy).toHaveBeenLastCalledWith(4));
      expect(vi.mocked(addInstruments).mock.calls.map(([batch]) => batch.length)).toEqual([
        1000, 500,
      ]);
      expect(vi.mocked(addInstruments).mock.calls[0]?.[0][0]).toBe("S1000");
      expect(setDraftSpy).toHaveBeenLastCalledWith("unposted", []);
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("keeps everything when the first batch fails with a server error", async () => {
      const user = userEvent.setup();
      vi.mocked(addInstruments).mockRejectedValueOnce(
        new ApiError("x", "r", { code: "internal_error" }),
      );
      render(<Harness />);
      await pasteInto(user, symbols(2500).join("\n"));
      await user.click(continueButton());
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(
        "Couldn't save the followed list: FactorFlow hit an unexpected problem",
      );
      expect(alert).toHaveTextContent("0 followed so far.");
      expect(setDraftSpy).toHaveBeenCalledWith("unposted", symbols(2500));
      expect(rereadSpy).not.toHaveBeenCalled();
    });
  });

  it("shows the kept-for-retry line on a return visit, with no alert", () => {
    render(<Harness initial={{ source: "paste", pasted: "S1\nS2", unposted: ["S1", "S2"] }} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "2 not saved yet; kept in the list to try again.",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("says so when exactly one entry is not saved yet", () => {
    render(<Harness initial={{ source: "paste", pasted: "S1", unposted: ["S1"] }} />);
    expect(screen.getByText("1 not saved yet; kept in the list to try again.")).toBeInTheDocument();
  });

  it("makes the field read-only, not disabled, while posting, and ignores a second Continue", async () => {
    const user = userEvent.setup();
    const held = deferred<ReturnType<typeof okResult>>();
    vi.mocked(addInstruments).mockReturnValueOnce(held.promise);
    render(<Harness />);
    await pasteInto(user, "AAPL, KO");
    await user.click(continueButton());
    await waitFor(() => expect(field()).toHaveAttribute("readonly"));
    expect(field()).not.toBeDisabled();
    await user.click(continueButton());
    expect(vi.mocked(addInstruments)).toHaveBeenCalledTimes(1);
    await act(async () => {
      held.resolve(okResult(["AAPL", "KO"]));
    });
    await waitFor(() => expect(field()).not.toHaveAttribute("readonly"));
  });

  it("states a failed followed-count read with Try again, and keeps the sources", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <Harness
        overrides={{
          activeCount: { kind: "error", error: new ApiUnreachableError("x"), last: null },
        }}
      />,
    );
    expect(
      screen.getByText("Couldn't read the followed list: FactorFlow is not answering"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(rereadSpy).toHaveBeenCalledTimes(1);
    expect(rereadSpy).toHaveBeenCalledWith("activeCount");
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    unmount();
    render(<Harness />);
    expect(screen.queryByText(/Couldn't read/)).toBeNull();
  });

  it("blocks Continue with nothing chosen and sends nothing", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ source: null }} />);
    const button = continueButton();
    expect(button).toHaveAttribute("data-variant", "blocked");
    expect(button).toHaveAccessibleDescription("Paste at least one symbol, or choose Add later.");
    await user.click(button);
    expect(goToSpy).not.toHaveBeenCalled();
    expect(vi.mocked(addInstruments)).not.toHaveBeenCalled();
  });

  it("shows the warning only with Paste a list chosen", () => {
    render(<Harness initial={{ source: "later", pasted: symbols(12).join(",") }} />);
    expect(screen.queryByText(/^Factor scores need/)).toBeNull();
    expect(continueButton()).toHaveAttribute("data-variant", "default");
  });
});

// Implements TC-COMP-116 (the malformed half and the report reset, IR-001, IR-003) and
// DAC-E4-6 with AC-3 (a settled post never overrides navigation, IR-004).
describe("rework of review v1 (IR-001, IR-003, IR-004)", () => {
  async function useRealClient(): Promise<void> {
    const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
    vi.mocked(addInstruments).mockImplementation(actual.addInstruments);
  }

  const MALFORMED_RESPONSE = {
    added: [],
    reactivated: [],
    rejected: [
      {
        input_symbol: "ZZZZ!",
        normalised_symbol: null,
        disposition: "malformed",
        reason: "not a valid symbol shape",
      },
    ],
  };

  it("announces a malformed rejection as unreadable, without the server reason, and stays (IR-001)", async () => {
    const user = userEvent.setup();
    await useRealClient();
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      jsonResponse(MALFORMED_RESPONSE, 201),
    );
    render(<Harness />);
    await pasteInto(user, "AAPL");
    await user.tab();
    await user.click(continueButton());
    await waitFor(() => expect(rereadSpy).toHaveBeenCalledWith("activeCount"));
    expect(screen.getByRole("status")).toHaveTextContent("ZZZZ!, not a valid symbol format");
    expect(document.body.textContent).not.toContain("not a valid symbol shape");
    expect(goToSpy).toHaveBeenLastCalledWith(3);
    expect(goToSpy).not.toHaveBeenCalledWith(4);
  });

  it("clears the previous post's report when the next post starts (IR-003)", async () => {
    const user = userEvent.setup();
    await useRealClient();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(async () => jsonResponse(DUPLICATE_RESPONSE, 201));
    render(<Harness />);
    await pasteInto(user, "AAPL, KO");
    await user.tab();
    await user.click(continueButton());
    expect(await screen.findByText("KO, already followed")).toBeInTheDocument();

    const held = deferred<Response>();
    fetchSpy.mockImplementationOnce(() => held.promise);
    await user.click(continueButton());
    await waitFor(() => expect(field()).toHaveAttribute("readonly"));
    expect(screen.queryByText("KO, already followed")).toBeNull();
    held.resolve(
      jsonResponse({ error: { code: "internal_error", message: "x", request_id: "r" } }, 500),
    );
    await screen.findByRole("alert");
    expect(screen.queryByText("KO, already followed")).toBeNull();
  });

  it("does not move the owner again when a post settles after Back (IR-004)", async () => {
    const user = userEvent.setup();
    const held = deferred<ReturnType<typeof okResult>>();
    vi.mocked(addInstruments).mockImplementation(() => held.promise);
    render(<Harness />);
    await pasteInto(user, "AAPL");
    await user.tab();
    await user.click(continueButton());
    await waitFor(() => expect(field()).toHaveAttribute("readonly"));
    await user.click(screen.getByRole("button", { name: "← Back: How far back" }));
    expect(goToSpy).toHaveBeenLastCalledWith(2);
    held.resolve(okResult(["AAPL"]));
    await waitFor(() => expect(field()).not.toHaveAttribute("readonly"));
    expect(goToSpy.mock.calls).toEqual([[2]]);
  });

  it("does not move the owner again when a post fails after Back (IR-004)", async () => {
    const user = userEvent.setup();
    const held = deferred<ReturnType<typeof okResult>>();
    vi.mocked(addInstruments).mockImplementation(() => held.promise);
    render(<Harness />);
    await pasteInto(user, "AAPL");
    await user.tab();
    await user.click(continueButton());
    await waitFor(() => expect(field()).toHaveAttribute("readonly"));
    await user.click(screen.getByRole("button", { name: "← Back: How far back" }));
    held.reject(new ApiUnreachableError("x"));
    await screen.findByRole("alert");
    expect(goToSpy.mock.calls).toEqual([[2]]);
  });

  it("does not move the owner again when the step unmounts before the post settles (IR-004)", async () => {
    const user = userEvent.setup();
    const held = deferred<ReturnType<typeof okResult>>();
    vi.mocked(addInstruments).mockImplementation(() => held.promise);
    const { unmount } = render(<Harness />);
    await pasteInto(user, "AAPL");
    await user.tab();
    await user.click(continueButton());
    await waitFor(() => expect(field()).toHaveAttribute("readonly"));
    unmount();
    held.resolve(okResult(["AAPL"]));
    await act(async () => {
      await held.promise;
    });
    expect(goToSpy).not.toHaveBeenCalled();
  });
});
