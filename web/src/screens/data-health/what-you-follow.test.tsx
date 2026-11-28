import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, getHistoryDepth, listInstruments } from "../../api/client";
import type { HealthResponse, HistoryDepth, InstrumentListResult } from "../../api/types";
import type { ShellContextValue } from "../../app/shell-context";
import { WhatYouFollow } from "./what-you-follow";

vi.mock("../../api/client", async (importActual) => ({
  ...(await importActual<typeof import("../../api/client")>()),
  listInstruments: vi.fn(),
  getHistoryDepth: vi.fn(),
}));

const shell = vi.hoisted(() => ({ value: null as unknown as ShellContextValue }));
vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }));

const listMock = vi.mocked(listInstruments);
const depthMock = vi.mocked(getHistoryDepth);

/** A delivered `HealthResponse` literal; independent of the code under test. */
function HEALTH(present: boolean): HealthResponse {
  return {
    status: "ok",
    database: "reachable",
    credential_present: present,
    schema_version: 4,
    most_recent_run: null,
  };
}

const ANSWERED = new Date("2026-10-30T19:03:10Z");

/** Writes a full shell value; health answers with the key found unless a test says otherwise. */
function setShell(health: ShellContextValue["health"] = ANSWERING(true)) {
  shell.value = {
    health,
    attention: { kind: "loading" },
    scores: { kind: "loading" },
    refresh: vi.fn(),
    setTitleDetail: vi.fn(),
  };
}

function ANSWERING(present: boolean): ShellContextValue["health"] {
  return {
    liveness: "answering",
    health: HEALTH(present),
    lastUpdated: ANSWERED,
    lastAnsweredAt: ANSWERED,
  };
}

function COUNTS(activeCount: number, retiredCount: number): InstrumentListResult {
  return { rows: [], activeCount, retiredCount, nextCursor: null };
}

function DEPTH(years: number | null): HistoryDepth {
  return { years, updatedAt: "2026-10-01T12:00:00Z" };
}

beforeEach(() => {
  listMock.mockReset();
  depthMock.mockReset();
  setShell();
});

async function renderFollow() {
  const view = render(
    <MemoryRouter>
      <WhatYouFollow />
    </MemoryRouter>,
  );
  await screen.findAllByRole("term");
  return view;
}

function region(): HTMLElement {
  return screen.getByRole("region", { name: "What you follow" });
}

/** The `dt` / `dd` pairs of the summary list, in order. */
function pairs(): { term: string; definition: HTMLElement }[] {
  const list = region().querySelector("dl") as HTMLElement;
  const terms = [...list.querySelectorAll("dt")];
  const definitions = [...list.querySelectorAll<HTMLElement>("dd")];
  return terms.map((term, index) => ({
    term: term.textContent ?? "",
    definition: definitions[index] as HTMLElement,
  }));
}

function definitionOf(term: string): HTMLElement {
  const found = pairs().find((pair) => pair.term === term);
  expect(found).toBeDefined();
  return (found as { definition: HTMLElement }).definition;
}

describe("What you follow (TC-COMP-154, DAC-E6-16, AC-4, AC-17)", () => {
  // Implements TC-COMP-154
  it("(a) states the counts, the depth and whether the key was found, with a way to manage", async () => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockResolvedValue(DEPTH(5));
    await renderFollow();
    expect(within(region()).getByRole("heading", { level: 2 })).toHaveTextContent(
      "What you follow",
    );
    expect(region().querySelector('[data-variant="summary"]')).not.toBeNull();
    expect(pairs().map((pair) => pair.term)).toEqual([
      "Followed stocks",
      "Stopped following",
      "History depth",
      "Market data key",
    ]);
    expect(definitionOf("Followed stocks").textContent).toBe("30");
    expect(definitionOf("Stopped following").textContent).toBe("2 (history kept)");
    const depth = within(definitionOf("History depth")).getByRole("link", { name: "5 years" });
    expect(depth.getAttribute("href")).toBe("/settings");
    const badge = definitionOf("Market data key").querySelector('[data-variant="status-good"]');
    expect(badge?.textContent).toBe("Found");
    const manage = screen.getByRole("link", { name: "Manage followed stocks" });
    expect(manage.getAttribute("href")).toBe("/data/followed");
  });

  it("(b) an unset depth reads not set and still links to settings; an unreachable key is not determinable", async () => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockResolvedValue(DEPTH(null));
    setShell({
      liveness: "unreachable",
      health: HEALTH(true),
      lastUpdated: ANSWERED,
      lastAnsweredAt: ANSWERED,
    });
    await renderFollow();
    const depth = within(definitionOf("History depth")).getByRole("link", { name: "not set" });
    expect(depth.getAttribute("href")).toBe("/settings");
    const badge = definitionOf("Market data key").querySelector(
      '[data-variant="coverage-unknown"]',
    );
    expect(badge?.textContent).toBe("Not determinable");
  });

  it("(c) a missing key is a critical Missing", async () => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockResolvedValue(DEPTH(5));
    setShell(ANSWERING(false));
    await renderFollow();
    const badge = definitionOf("Market data key").querySelector('[data-variant="status-critical"]');
    expect(badge?.textContent).toBe("Missing");
  });

  it("(d) counts use thousands separators", async () => {
    listMock.mockResolvedValue(COUNTS(1236, 1000));
    depthMock.mockResolvedValue(DEPTH(5));
    await renderFollow();
    expect(definitionOf("Followed stocks").textContent).toBe("1,236");
    expect(definitionOf("Stopped following").textContent).toBe("1,000 (history kept)");
  });

  it("(e) reads the delivered endpoints unchanged, once", async () => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockResolvedValue(DEPTH(5));
    await renderFollow();
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));
    expect(listMock).toHaveBeenCalledWith({ limit: 1 });
    expect(depthMock).toHaveBeenCalledTimes(1);
    expect(depthMock).toHaveBeenCalledWith();
  });
});

const INTERNAL = new ApiError("instrument table said no", "req-9f3", { code: "internal_error" });
const UNREACHABLE = new ApiUnreachableError("fetch failed");

function renderOnly() {
  return render(
    <MemoryRouter>
      <WhatYouFollow />
    </MemoryRouter>,
  );
}

describe("What you follow read failure (TC-COMP-155, DAC-E6-17, AC-24)", () => {
  // Implements TC-COMP-155
  it("(a) while either read is pending, the heading stays, the body is busy and no list renders", () => {
    for (const [first, second] of [
      [new Promise<InstrumentListResult>(() => undefined), Promise.resolve(DEPTH(5))],
      [Promise.resolve(COUNTS(30, 2)), new Promise<HistoryDepth>(() => undefined)],
    ] as const) {
      listMock.mockReset();
      depthMock.mockReset();
      listMock.mockReturnValue(first);
      depthMock.mockReturnValue(second);
      const { container, unmount } = renderOnly();
      expect(
        screen.getByRole("heading", { level: 2, name: "What you follow" }),
      ).toBeInTheDocument();
      expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(container.querySelector("dl")).toBeNull();
      unmount();
    }
  });

  it("(b) a failed instrument read keeps the heading and says what happened, with Try again", async () => {
    listMock.mockRejectedValue(INTERNAL);
    depthMock.mockResolvedValue(DEPTH(5));
    const { container } = renderOnly();
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe(
      "Couldn't read what you follow: FactorFlow hit an unexpected problem.",
    );
    expect(screen.getByRole("heading", { level: 2, name: "What you follow" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(container.querySelector("dl")).toBeNull();
    expect(screen.queryByRole("link", { name: "Manage followed stocks" })).toBeNull();
  });

  it("(c) a failed depth read alone fails the card, naming an interface that is not answering", async () => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockRejectedValue(UNREACHABLE);
    renderOnly();
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Couldn't read what you follow: FactorFlow is not answering.");
  });

  it("(d) neither the request id nor the envelope message reaches the page", async () => {
    listMock.mockRejectedValue(INTERNAL);
    depthMock.mockResolvedValue(DEPTH(5));
    const { container } = renderOnly();
    await screen.findByRole("status");
    expect(container.textContent).not.toContain("req-9f3");
    expect(container.textContent).not.toContain("instrument table said no");
    for (const el of container.querySelectorAll("*")) {
      for (const attr of el.attributes) {
        expect(attr.value).not.toContain("req-9f3");
        expect(attr.value).not.toContain("instrument table said no");
      }
    }
  });

  it("(e) Try again reads each once more and shows the list", async () => {
    listMock.mockRejectedValueOnce(INTERNAL);
    depthMock.mockResolvedValueOnce(DEPTH(5));
    listMock.mockResolvedValueOnce(COUNTS(30, 2));
    depthMock.mockResolvedValueOnce(DEPTH(5));
    renderOnly();
    await userEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await screen.findAllByRole("term");
    expect(listMock).toHaveBeenCalledTimes(2);
    expect(depthMock).toHaveBeenCalledTimes(2);
    expect(definitionOf("Followed stocks").textContent).toBe("30");
  });

  it("keeps the newest read when an older one answers last", async () => {
    let answerOld: (counts: InstrumentListResult) => void = () => undefined;
    listMock.mockRejectedValueOnce(INTERNAL);
    depthMock.mockResolvedValue(DEPTH(5));
    renderOnly();
    const retry = await screen.findByRole("button", { name: "Try again" });
    listMock.mockReturnValueOnce(
      new Promise((resolve) => {
        answerOld = resolve;
      }),
    );
    listMock.mockResolvedValueOnce(COUNTS(3, 0));
    await userEvent.click(retry);
    await userEvent.click(retry);
    await screen.findAllByRole("term");
    await act(async () => answerOld(COUNTS(9, 9)));
    expect(definitionOf("Followed stocks").textContent).toBe("3");
  });
});

describe("Market data key while health is not answering (TC-COMP-172, DAC-E6-S4-3, AC-4, DEC-0385)", () => {
  // Implements TC-COMP-172
  beforeEach(() => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockResolvedValue(DEPTH(5));
  });

  it("(a) an unreachable interface never shows the stale value as Missing", async () => {
    setShell({
      liveness: "unreachable",
      health: HEALTH(false),
      lastUpdated: ANSWERED,
      lastAnsweredAt: ANSWERED,
    });
    await renderFollow();
    const badge = definitionOf("Market data key").querySelector<HTMLElement>(
      '[data-variant="coverage-unknown"]',
    );
    expect(badge?.textContent).toBe("Not determinable");
    expect(badge).toHaveAccessibleDescription("FactorFlow is not answering");
    expect(region().querySelector('[data-variant="status-critical"]')).toBeNull();
    expect(region().textContent).not.toContain("Missing");
  });

  it("(b) before the first answer it reads the same", async () => {
    setShell({ liveness: "unknown", health: null, lastUpdated: null, lastAnsweredAt: null });
    await renderFollow();
    const badge = definitionOf("Market data key").querySelector<HTMLElement>(
      '[data-variant="coverage-unknown"]',
    );
    expect(badge?.textContent).toBe("Not determinable");
    expect(badge).toHaveAccessibleDescription("FactorFlow is not answering");
  });

  it("(c) no key value reaches the page, and only credential_present is read", async () => {
    const leaky = { ...HEALTH(true), credential: "sk-live-PLANTED" } as unknown as HealthResponse;
    for (const health of [
      { liveness: "answering", health: leaky, lastUpdated: ANSWERED, lastAnsweredAt: ANSWERED },
      { liveness: "unreachable", health: leaky, lastUpdated: ANSWERED, lastAnsweredAt: ANSWERED },
      { liveness: "unknown", health: null, lastUpdated: null, lastAnsweredAt: null },
    ] as const) {
      setShell(health);
      const { container, unmount } = await renderFollow();
      expect(container.innerHTML).not.toContain("PLANTED");
      for (const el of container.querySelectorAll("*")) {
        for (const attr of el.attributes) {
          expect(attr.value).not.toContain("PLANTED");
        }
      }
      unmount();
    }
    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "what-you-follow.tsx"),
      "utf-8",
    );
    const fields = [...source.matchAll(/health\.health\??\.(\w+)/g)].map((m) => m[1]);
    expect(fields.length).toBeGreaterThan(0);
    expect(new Set(fields)).toEqual(new Set(["credential_present"]));
  });
});

/** Visible text plus every accessible name and description source (the DAC-E7-3 scan). */
function visibleAndAccessibleText(container: HTMLElement): string {
  const parts = [container.textContent ?? ""];
  for (const el of container.querySelectorAll("*")) {
    for (const name of ["aria-label", "title"]) {
      const value = el.getAttribute(name);
      if (value !== null) {
        parts.push(value);
      }
    }
    for (const name of ["aria-describedby", "aria-labelledby"]) {
      for (const id of (el.getAttribute(name) ?? "").split(" ").filter((x) => x !== "")) {
        parts.push(container.querySelector(`[id="${id}"]`)?.textContent ?? "");
      }
    }
  }
  return parts.join(" ");
}

const FORBIDDEN =
  /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

describe("What you follow vocabulary and badges (TC-COMP-173, TC-COMP-174, DAC-E6-S4-4, DAC-E6-S4-5)", () => {
  // Implements TC-COMP-173
  // Implements TC-COMP-174
  it("(a) no state shows a domain term in its text or accessible names", async () => {
    const states: { name: string; arrange: () => void; wait: "term" | "status" }[] = [
      {
        name: "key found, depth set",
        wait: "term",
        arrange: () => {
          listMock.mockResolvedValue(COUNTS(30, 2));
          depthMock.mockResolvedValue(DEPTH(5));
        },
      },
      {
        name: "key missing, depth not set",
        wait: "term",
        arrange: () => {
          listMock.mockResolvedValue(COUNTS(30, 2));
          depthMock.mockResolvedValue(DEPTH(null));
          setShell(ANSWERING(false));
        },
      },
      {
        name: "key not determinable",
        wait: "term",
        arrange: () => {
          listMock.mockResolvedValue(COUNTS(30, 2));
          depthMock.mockResolvedValue(DEPTH(5));
          setShell({ liveness: "unknown", health: null, lastUpdated: null, lastAnsweredAt: null });
        },
      },
      {
        name: "internal failure",
        wait: "status",
        arrange: () => {
          listMock.mockRejectedValue(INTERNAL);
          depthMock.mockResolvedValue(DEPTH(5));
        },
      },
      {
        name: "unreachable",
        wait: "status",
        arrange: () => {
          listMock.mockResolvedValue(COUNTS(30, 2));
          depthMock.mockRejectedValue(UNREACHABLE);
        },
      },
    ];
    for (const { name, arrange, wait } of states) {
      listMock.mockReset();
      depthMock.mockReset();
      setShell();
      arrange();
      const { container, unmount } = renderOnly();
      await screen.findAllByRole(wait);
      const text = visibleAndAccessibleText(container);
      expect(text, name).not.toMatch(FORBIDDEN);
      if (wait === "term") {
        expect(text).toContain("Stopped following");
        expect(text).toContain("Market data key");
      }
      unmount();
    }
    listMock.mockReset();
    listMock.mockReturnValue(new Promise(() => undefined));
    depthMock.mockReset();
    depthMock.mockReturnValue(new Promise(() => undefined));
    const loading = renderOnly();
    expect(visibleAndAccessibleText(loading.container)).not.toMatch(FORBIDDEN);
  });

  it("(b) Found and Missing are status badges with their word and a hidden shape", async () => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockResolvedValue(DEPTH(5));
    for (const [present, variant, word] of [
      [true, "status-good", "Found"],
      [false, "status-critical", "Missing"],
    ] as const) {
      setShell(ANSWERING(present));
      const { unmount } = await renderFollow();
      const badge = definitionOf("Market data key").querySelector(`[data-variant="${variant}"]`);
      expect(badge?.textContent).toBe(word);
      expect(badge?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      unmount();
    }
  });

  it("(c) Not determinable is a described coverage-unknown badge, never a status badge or a dash", async () => {
    listMock.mockResolvedValue(COUNTS(30, 2));
    depthMock.mockResolvedValue(DEPTH(5));
    setShell({
      liveness: "unreachable",
      health: HEALTH(true),
      lastUpdated: null,
      lastAnsweredAt: null,
    });
    await renderFollow();
    const key = definitionOf("Market data key");
    expect(key.querySelector('[data-variant^="status-"]')).toBeNull();
    expect(key.textContent).not.toContain("—");
    expect(key.querySelector('[data-variant="coverage-unknown"]')).toHaveAccessibleDescription(
      "FactorFlow is not answering",
    );
  });
});
