import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../../api/client";
import type { Attention, DataHealth, ReadState } from "../../app/shell-types";
import { gapReason, readFailed, readFailureReason } from "./copy";
import { Verdict } from "./verdict";

const CHECKED_AT = new Date("2026-10-30T19:03:12Z");
const INTERNAL = new ApiError("database said no", "req-9f3", { code: "internal_error" });
const UNREACHABLE = new ApiUnreachableError("fetch failed");
const NO_GAPS_REASON = "fewer_than_two_instruments_with_data";

type TerminalState = NonNullable<Attention["latest_terminal_download"]>["state"];

/** Differs from the aggregate in every count, so a component reading it instead is caught. */
function att(state: TerminalState | null): Attention {
  return {
    checked_at: "2026-10-30T19:59:59Z",
    followed_count: 99,
    prices_as_of: null,
    credential_present: true,
    problems: { stock_count: 7, symbols: [], newest_completed_at: null },
    latest_download: null,
    latest_terminal_download:
      state === null
        ? null
        : { run_id: "r-1", state, ended_at: "2026-10-30T18:30:00Z", failure_reason: null },
    items: [],
  };
}

function dh(over: Partial<DataHealth> = {}): DataHealth {
  return {
    checked_at: "2026-10-30T19:03:12Z",
    never_acquired: false,
    followed_count: 10,
    affected_count: 0,
    checks: {
      daily_prices: {
        status: "ok",
        absent_count: 0,
        gap_stock_count: 0,
        behind_count: 0,
        latest_session: "2026-10-29",
        gap_detection: { available: true, reason: null },
        exception_count: 0,
        exception_symbols: [],
      },
      company_financials: {
        status: "ok",
        absent_count: 0,
        problem_count: 0,
        as_of: "2026-10-30T18:00:00Z",
        exception_count: 0,
        exception_symbols: [],
      },
    },
    problems: { rows: [], next_cursor: null },
    ...over,
  };
}

function ok<T>(data: T): ReadState<T> {
  return { kind: "ok", data, checkedAt: CHECKED_AT };
}

type Props = {
  attention: ReadState<Attention>;
  dataHealth: ReadState<DataHealth>;
};

function renderVerdict(props: Props, spies?: { attention?: () => void; dataHealth?: () => void }) {
  const view = render(
    <MemoryRouter>
      <Verdict
        attention={props.attention}
        dataHealth={props.dataHealth}
        onRetryAttention={spies?.attention ?? (() => undefined)}
        onRetryDataHealth={spies?.dataHealth ?? (() => undefined)}
        downloadNow={<button type="button">Download now</button>}
      />
    </MemoryRouter>,
  );
  return { container: view.container };
}

function sentence(): HTMLElement {
  return screen.getByTestId("verdict-sentence");
}

function statusBadges(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-variant^="status-"]'));
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

type Row = [TerminalState, number, number, string, string];

const ROWS: Row[] = [
  ["succeeded", 0, 10, "status-good", "Yes. None of the 10 followed stocks needs attention."],
  [
    "partial",
    1,
    10,
    "status-warning",
    "Mostly yes. 1 of 10 followed stocks needs attention; its scores show as Incomplete until it's fixed.",
  ],
  [
    "succeeded",
    2,
    10,
    "status-warning",
    "Mostly yes. 2 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed.",
  ],
  [
    "succeeded",
    10,
    10,
    "status-critical",
    "No. 10 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed.",
  ],
  [
    "failed",
    0,
    10,
    "status-critical",
    "No. None of the 10 followed stocks needs attention, and the last download failed.",
  ],
  [
    "failed",
    3,
    10,
    "status-critical",
    "No. 3 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed, and the last download failed.",
  ],
  [
    "abandoned",
    3,
    10,
    "status-serious",
    "Mostly yes. 3 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed, and the last download was interrupted.",
  ],
  [
    "abandoned",
    0,
    10,
    "status-serious",
    "Mostly yes. None of the 10 followed stocks needs attention, and the last download was interrupted.",
  ],
  ["cancelled", 0, 1236, "status-good", "Yes. None of the 1,236 followed stocks needs attention."],
  [
    "succeeded",
    1500,
    3000,
    "status-warning",
    "Mostly yes. 1,500 of 3,000 followed stocks need attention; their scores show as Incomplete until they're fixed.",
  ],
];

describe("Verdict sentence (TC-COMP-156, DAC-E6-1, DAC-E6-S1-1)", () => {
  // Implements TC-COMP-156
  it.each(ROWS)(
    "%s with %i of %i affected is %s: %s",
    (state, affected, followed, variant, text) => {
      const { container } = renderVerdict({
        attention: ok(att(state)),
        dataHealth: ok(dh({ affected_count: affected, followed_count: followed })),
      });
      expect(sentence().textContent).toBe(text);
      const badges = statusBadges(container);
      expect(badges).toHaveLength(1);
      expect(badges[0]?.dataset.variant).toBe(variant);
    },
  );

  // Implements TC-COMP-156
  it("the checks' tiers do not feed the answer", () => {
    const base = dh();
    renderVerdict({
      attention: ok(att("succeeded")),
      dataHealth: ok(
        dh({
          checks: {
            daily_prices: {
              ...(base.checks.daily_prices as NonNullable<DataHealth["checks"]["daily_prices"]>),
              status: "exceptions",
              absent_count: 2,
            },
            company_financials: {
              ...(base.checks.company_financials as NonNullable<
                DataHealth["checks"]["company_financials"]
              >),
              status: "exceptions",
              absent_count: 1,
            },
          },
        }),
      ),
    });
    expect(sentence().textContent).toBe("Yes. None of the 10 followed stocks needs attention.");
    expect(sentence().querySelector("[data-variant]")?.getAttribute("data-variant")).toBe(
      "status-good",
    );
  });

  // Implements TC-COMP-156
  it("the counts come from the aggregate, never from attention", () => {
    renderVerdict({
      attention: ok(att("succeeded")),
      dataHealth: ok(dh({ affected_count: 4, followed_count: 10 })),
    });
    expect(sentence().textContent).not.toMatch(/7 of|99/);
    expect(sentence().textContent).toContain("4 of 10");
  });

  // Implements TC-COMP-156
  it("the checked time comes from the aggregate", () => {
    const { container } = renderVerdict({
      attention: ok(att("succeeded")),
      dataHealth: ok(dh()),
    });
    expect(screen.getByText("checked 14:03:12 CDT")).toBeTruthy();
    expect(container.textContent).not.toContain("14:59:59");
  });

  // Implements TC-COMP-156
  it("the header holds the h1, the coverage link and the download action", () => {
    const { container } = renderVerdict({ attention: ok(att("succeeded")), dataHealth: ok(dh()) });
    const header = container.querySelector("header") as HTMLElement;
    const h1 = within(header).getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/^Is the data good enough to trust\?$/);
    expect(h1).toHaveAttribute("tabindex", "-1");
    expect(within(header).getByRole("link", { name: "Full coverage table" })).toHaveAttribute(
      "href",
      "/data/coverage",
    );
    expect(within(header).getByRole("button", { name: "Download now" })).toBeTruthy();
    expect(statusBadges(header)).toHaveLength(1);
  });
});

describe("Verdict states (TC-COMP-148, DAC-E6-2, AC-24)", () => {
  function expectHeaderKept(container: HTMLElement) {
    const header = container.querySelector("header") as HTMLElement;
    expect(within(header).getByRole("heading", { level: 1 })).toBeTruthy();
    expect(within(header).getByRole("link", { name: "Full coverage table" })).toBeTruthy();
    expect(within(header).getByRole("button", { name: "Download now" })).toBeTruthy();
  }

  // Implements TC-COMP-148
  it("(a) attention loading: a busy skeleton, no badge, no answer word", () => {
    const { container } = renderVerdict({ attention: { kind: "loading" }, dataHealth: ok(dh()) });
    expectHeaderKept(container);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(statusBadges(container)).toHaveLength(0);
    expect(container.textContent).not.toMatch(/Yes|Mostly yes|No\./);
  });

  // Implements TC-COMP-148
  it.each([
    [INTERNAL, "Couldn't read what needs attention: FactorFlow hit an unexpected problem."],
    [UNREACHABLE, "Couldn't read what needs attention: FactorFlow is not answering."],
  ])(
    "(b) attention failing (%s) keeps the header, shows Try again and computes no tier",
    (error, text) => {
      const retryAttention = vi.fn();
      const retryDataHealth = vi.fn();
      const { container } = renderVerdict(
        {
          attention: { kind: "error", error, last: { data: att("failed"), checkedAt: CHECKED_AT } },
          dataHealth: ok(dh({ affected_count: 10, followed_count: 10 })),
        },
        { attention: retryAttention, dataHealth: retryDataHealth },
      );
      expectHeaderKept(container);
      expect(screen.getByRole("status").textContent).toBe(text);
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));
      expect(retryAttention).toHaveBeenCalledTimes(1);
      expect(retryDataHealth).not.toHaveBeenCalled();
      expect(statusBadges(container)).toHaveLength(0);
      expect(container.textContent).not.toMatch(/req-9f3|database said no|fetch failed/);
    },
  );

  // Implements TC-COMP-148
  it("(d) aggregate loading: the same skeleton, no badge", () => {
    const { container } = renderVerdict({
      attention: ok(att("succeeded")),
      dataHealth: { kind: "loading" },
    });
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(statusBadges(container)).toHaveLength(0);
  });

  // Implements TC-COMP-148
  it("(e) aggregate failing: its own sentence and Try again calling the aggregate's retry", () => {
    const retryAttention = vi.fn();
    const retryDataHealth = vi.fn();
    const { container } = renderVerdict(
      {
        attention: ok(att("succeeded")),
        dataHealth: { kind: "error", error: INTERNAL, last: null },
      },
      { attention: retryAttention, dataHealth: retryDataHealth },
    );
    expect(screen.getByRole("status").textContent).toBe(
      "Couldn't read the data health checks: FactorFlow hit an unexpected problem.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retryDataHealth).toHaveBeenCalledTimes(1);
    expect(retryAttention).not.toHaveBeenCalled();
    expect(statusBadges(container)).toHaveLength(0);
  });

  // Implements TC-COMP-148
  it("(f) both failing: attention's message wins and only one Try again renders", () => {
    renderVerdict({
      attention: { kind: "error", error: INTERNAL, last: null },
      dataHealth: { kind: "error", error: INTERNAL, last: null },
    });
    expect(screen.getByRole("status").textContent).toContain("what needs attention");
    expect(screen.getAllByRole("button", { name: "Try again" })).toHaveLength(1);
  });

  // Implements TC-COMP-148
  it("(g) no download has ended: the header only, no badge, sentence or checked line", () => {
    const { container } = renderVerdict({
      attention: ok(att(null)),
      dataHealth: ok(dh({ affected_count: 3 })),
    });
    expectHeaderKept(container);
    expect(statusBadges(container)).toHaveLength(0);
    expect(screen.queryByTestId("verdict-sentence")).toBeNull();
    expect(container.textContent).not.toMatch(/checked|Yes/);
  });
});

describe("Verdict names a check whose gaps can't be checked (TC-COMP-157, DAC-E6-S1-2, DAC-E6-1)", () => {
  function gapsDh(status: "exceptions" | "not_determinable", reason: string | null): DataHealth {
    const base = dh();
    return dh({
      checks: {
        daily_prices: {
          ...(base.checks.daily_prices as NonNullable<DataHealth["checks"]["daily_prices"]>),
          status,
          absent_count: status === "exceptions" ? 2 : 0,
          gap_stock_count: null,
          behind_count: status === "exceptions" ? 1 : 0,
          gap_detection: { available: false, reason },
        },
        company_financials: base.checks.company_financials,
      },
    });
  }

  // Implements TC-COMP-157
  it.each(["exceptions", "not_determinable"] as const)(
    "(a, b) status %s is named after an unchanged sentence",
    (status) => {
      renderVerdict({
        attention: ok(att("succeeded")),
        dataHealth: ok(gapsDh(status, NO_GAPS_REASON)),
      });
      expect(sentence().textContent).toBe("Yes. None of the 10 followed stocks needs attention.");
      expect(
        screen.getByText(
          "Daily prices can't be checked for gaps: fewer than two followed stocks hold daily prices.",
        ),
      ).toBeTruthy();
    },
  );

  // Implements TC-COMP-157
  it("(c) an unknown code is shown as itself and a null reason says none was given", () => {
    renderVerdict({
      attention: ok(att("succeeded")),
      dataHealth: ok(gapsDh("exceptions", "calendar_unavailable")),
    });
    expect(
      screen.getByText("Daily prices can't be checked for gaps: calendar_unavailable."),
    ).toBeTruthy();
    cleanup();
    renderVerdict({ attention: ok(att("succeeded")), dataHealth: ok(gapsDh("exceptions", null)) });
    expect(
      screen.getByText("Daily prices can't be checked for gaps: no reason was given."),
    ).toBeTruthy();
  });

  // Implements TC-COMP-157
  it("(d) a gap count of 0 names nothing", () => {
    const { container } = renderVerdict({ attention: ok(att("succeeded")), dataHealth: ok(dh()) });
    expect(container.textContent).not.toContain("can't be checked");
  });

  // Implements TC-COMP-157
  it("(e) no daily prices check names nothing and the verdict still renders from the counts", () => {
    const { container } = renderVerdict({
      attention: ok(att("succeeded")),
      dataHealth: ok(
        dh({ never_acquired: true, checks: { daily_prices: null, company_financials: null } }),
      ),
    });
    expect(container.textContent).not.toContain("can't be checked");
    expect(sentence().textContent).toBe("Yes. None of the 10 followed stocks needs attention.");
  });
});

const TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

function visibleAndAccessibleText(container: HTMLElement): string {
  const parts = [container.textContent ?? ""];
  for (const element of Array.from(container.querySelectorAll<HTMLElement>("*"))) {
    for (const name of ["aria-label", "title"]) {
      const value = element.getAttribute(name);
      if (value) parts.push(value);
    }
    for (const id of (element.getAttribute("aria-describedby") ?? "").split(" ")) {
      const text = id ? container.querySelector(`[id="${CSS.escape(id)}"]`)?.textContent : null;
      if (text) parts.push(text);
    }
  }
  return parts.join(" ");
}

describe("Verdict vocabulary and badges (TC-COMP-159, TC-COMP-160, DAC-E6-S1-4, DAC-E6-S1-5)", () => {
  // Implements TC-COMP-159
  it("(a) no DAC-E7-3 term appears in any state, and the scan is not vacuous", () => {
    expect(TERMS.test("one run")).toBe(true);
    expect(TERMS.test("Retired")).toBe(true);
    expect(TERMS.test("downloads")).toBe(false);
    expect(TERMS.test(NO_GAPS_REASON)).toBe(false);
    const states: Props[] = [
      ...ROWS.map(
        ([state, affected, followed]): Props => ({
          attention: ok(att(state)),
          dataHealth: ok(dh({ affected_count: affected, followed_count: followed })),
        }),
      ),
      { attention: { kind: "loading" }, dataHealth: ok(dh()) },
      { attention: { kind: "error", error: INTERNAL, last: null }, dataHealth: ok(dh()) },
      { attention: { kind: "error", error: UNREACHABLE, last: null }, dataHealth: ok(dh()) },
      { attention: ok(att("succeeded")), dataHealth: { kind: "loading" } },
      {
        attention: ok(att("succeeded")),
        dataHealth: { kind: "error", error: INTERNAL, last: null },
      },
      { attention: ok(att(null)), dataHealth: ok(dh()) },
    ];
    for (const state of states) {
      const { container } = renderVerdict(state);
      expect(visibleAndAccessibleText(container)).not.toMatch(TERMS);
      cleanup();
    }
  });

  // Implements TC-COMP-160
  it("(b) the badge reads the answer word, with a hidden tier shape and no label replacing it", () => {
    for (const [state, affected, followed, variant] of ROWS) {
      const { container } = renderVerdict({
        attention: ok(att(state)),
        dataHealth: ok(dh({ affected_count: affected, followed_count: followed })),
      });
      const badge = statusBadges(container)[0] as HTMLElement;
      expect(badge.dataset.variant).toBe(variant);
      expect(badge.textContent).toMatch(/^(Yes|Mostly yes|No)$/);
      expect(badge.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(badge.hasAttribute("aria-label")).toBe(false);
      cleanup();
    }
  });

  // Implements TC-COMP-160
  it("(c) the answer word is the copy's literal, never the tier name", () => {
    const { container } = renderVerdict({
      attention: ok(att("partial")),
      dataHealth: ok(dh({ affected_count: 1 })),
    });
    expect(statusBadges(container)[0]?.textContent).toBe("Mostly yes");
    expect(statusBadges(container)[0]?.textContent).not.toBe("warning");
  });
});

describe("copy.ts (DEC-0373, -2)", () => {
  it("(a) readFailureReason names only the two cases and never an envelope field", () => {
    expect(readFailureReason(UNREACHABLE)).toBe("FactorFlow is not answering");
    expect(readFailureReason(INTERNAL)).toBe("FactorFlow hit an unexpected problem");
    const validation = new ApiError("bad body", "req-1", { code: "validation_error" });
    const codeless = new ApiError("bad body", "req-2", { code: null });
    expect(readFailureReason(validation)).toBe("FactorFlow hit an unexpected problem");
    expect(readFailureReason(codeless)).toBe("FactorFlow hit an unexpected problem");
    for (const error of [UNREACHABLE, INTERNAL, validation]) {
      expect(readFailureReason(error)).not.toContain(error.message);
    }
  });

  it("(b) gapReason maps the known code, shows an unknown one and words a null", () => {
    expect(gapReason(NO_GAPS_REASON)).toBe("fewer than two followed stocks hold daily prices");
    expect(gapReason("calendar_unavailable")).toBe("calendar_unavailable");
    expect(gapReason(null)).toBe("no reason was given");
  });

  it("(c) readFailed composes the family sentence", () => {
    expect(readFailed("what needs attention", "x")).toBe("Couldn't read what needs attention: x.");
  });
});
