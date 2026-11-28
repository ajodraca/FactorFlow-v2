import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHistoryDepth, listInstruments } from "../../api/client";
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
