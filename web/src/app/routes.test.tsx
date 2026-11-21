import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from "react-router-dom";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { ApiUnreachableError, fetchHealth } from "../api/client";
import type { HealthResponse } from "../api/types";
import { SHELL_ROUTES } from "../screens/research/copy";
import { DESTINATIONS, type Destination, RESEARCH_REGISTERED } from "./destinations";
import { HealthProvider } from "./health";
import { NotFound } from "./not-found";
import { AppRoutes } from "./routes";
import { Shell } from "./shell";
import { resolveTitle } from "./titles";

/*
 * The route map (CAP-003-E3-S4; owner-shell 2.6; AC-2, AC-17, AC-18, AC-27).
 *
 * Each lazily loaded screen module is replaced by a stub that records that it
 * was loaded, so the test is about the route map and not about screens that
 * CAP-003-E7-S1 to S5 relabel later.
 */

const { loaded, detailGate } = vi.hoisted(() => {
  let release: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { loaded: new Set<string>(), detailGate: { promise, release } };
});

/** Lets the gated run-detail module finish loading. Idempotent. */
function releaseDetail(): void {
  detailGate.release();
}

vi.mock("../screens/coverage", () => {
  loaded.add("coverage");
  return { default: () => <p data-testid="stub-coverage">Coverage stub</p> };
});
vi.mock("../screens/instruments", () => {
  loaded.add("instruments");
  return { default: () => <p data-testid="stub-instruments">Instruments stub</p> };
});
vi.mock("../screens/runs", () => {
  loaded.add("runs");
  return { default: () => <p data-testid="stub-runs">Runs stub</p> };
});
vi.mock("../screens/runs/detail", async () => {
  loaded.add("runs/detail");
  await detailGate.promise;
  return {
    default: function RunDetailStub() {
      const { runId } = useParams();
      return (
        <p data-testid="stub-runs/detail" data-param={runId}>
          Run detail stub
        </p>
      );
    },
  };
});
vi.mock("../screens/settings", () => {
  loaded.add("settings");
  return { default: () => <p data-testid="stub-settings">Settings stub</p> };
});
vi.mock("../screens/research", () => {
  loaded.add("research");
  return { default: () => <p data-testid="stub-research">Research stub</p> };
});
vi.mock("../screens/research/stocks", () => {
  loaded.add("research/stocks");
  return {
    default: function StockStub() {
      const { symbol } = useParams();
      return (
        <p data-testid="stub-research/stocks" data-param={symbol}>
          Stock stub
        </p>
      );
    },
  };
});
vi.mock("../screens/research/compare", () => {
  loaded.add("research/compare");
  return { default: () => <p data-testid="stub-research/compare">Compare stub</p> };
});
vi.mock("../screens/research/universes", () => {
  loaded.add("research/universes");
  return { default: () => <p data-testid="stub-research/universes">Universes stub</p> };
});
vi.mock("../screens/research/universes/detail", () => {
  loaded.add("research/universes/detail");
  return {
    default: function UniverseDetailStub() {
      const { universeId } = useParams();
      return (
        <p data-testid="stub-research/universes/detail" data-param={universeId}>
          Universe detail stub
        </p>
      );
    },
  };
});

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return { ...actual, fetchHealth: vi.fn() };
});

/** The modules loaded by the time routes.tsx and its imports were imported. */
const loadedAtImport = new Set(loaded);

const HEALTH_EMPTY: HealthResponse = {
  status: "ok",
  database: "reachable",
  credential_present: true,
  schema_version: 4,
  most_recent_run: null,
};

const HEALTH_STARTED: HealthResponse = {
  status: "ok",
  database: "reachable",
  credential_present: true,
  schema_version: 4,
  most_recent_run: { run_id: "run-1", state: "running", ended_at: null },
};

const fetchHealthMock = vi.mocked(fetchHealth);

/** One pending health answer the test settles when it chooses. */
function deferHealth(): {
  resolve: (value: HealthResponse) => void;
  reject: (reason: unknown) => void;
} {
  let resolve: (value: HealthResponse) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const pending = new Promise<HealthResponse>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  fetchHealthMock.mockImplementation(() => pending);
  return { resolve, reject };
}

const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null };

/** Renders the pathname plus search and the navigation type, and exposes `navigate`. */
function LocationProbe(): JSX.Element {
  const location = useLocation();
  const navigationType = useNavigationType();
  navigateRef.current = useNavigate();
  return (
    <>
      <span data-testid="location">{location.pathname + location.search}</span>
      <span data-testid="nav-type">{navigationType}</span>
    </>
  );
}

function renderAt(initial: string, entries?: string[]): ReturnType<typeof render> {
  const history = entries ?? [initial];
  return render(
    <HealthProvider>
      <MemoryRouter initialEntries={history} initialIndex={history.length - 1}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </HealthProvider>,
  );
}

const currentPath = (): string => screen.getByTestId("location").textContent ?? "";
const navType = (): string => screen.getByTestId("nav-type").textContent ?? "";

const here = path.dirname(fileURLToPath(import.meta.url));
const webSrc = path.resolve(here, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

function registeredPaths(file: string): string[] {
  const source = readFileSync(path.join(here, file), "utf-8");
  return [...source.matchAll(/path=["']([^"']+)["']/g)].map((m) => m[1] as string);
}

const NOT_FOUND_HEADING = "There's no page at this address.";

beforeEach(() => {
  fetchHealthMock.mockReset();
  fetchHealthMock.mockResolvedValue(HEALTH_EMPTY);
});

afterEach(() => {
  vi.useRealTimers();
});

// This describe runs first in the file: the stubs record a load once, so the
// assertion that only Settings loaded needs no other render before it.
describe("Routes — each screen loads as its route renders (owner-shell 5)", () => {
  it("loads no screen module when routes.tsx is imported, and only Settings at /settings", async () => {
    expect(loadedAtImport).toEqual(new Set());
    renderAt("/settings");
    expect(await screen.findByTestId("stub-settings")).toBeInTheDocument();
    expect(loaded).toEqual(new Set(["settings"]));
  });

  // DEC-0328: one boundary in the main region shows the one shell skeleton while
  // a screen's code loads. The run-detail stub is held at its gate until released,
  // and no earlier test in this file releases it.
  it("shows the one skeleton card while a screen's code loads, then the screen", async () => {
    renderAt("/data/downloads/abc");
    expect(screen.getAllByTestId("shell-skeleton")).toHaveLength(1);
    expect(screen.queryByTestId("stub-runs/detail")).toBeNull();
    releaseDetail();
    expect(await screen.findByTestId("stub-runs/detail")).toBeInTheDocument();
    expect(screen.queryByTestId("shell-skeleton")).toBeNull();
  });
});

// Implements TC-COMP-079
describe("Routes — the five delivered screens at their new paths (AC-17, AC-27, DAC-E3-S4-3)", () => {
  const delivered: ReadonlyArray<readonly [string, string, string | null]> = [
    ["/data/coverage", "stub-coverage", null],
    ["/data/followed", "stub-instruments", null],
    ["/data/downloads", "stub-runs", null],
    ["/data/downloads/abc", "stub-runs/detail", "abc"],
    ["/settings", "stub-settings", null],
  ];

  it.each(delivered)("renders %s as %s", async (route, stub, param) => {
    releaseDetail();
    renderAt(route);
    const element = await screen.findByTestId(stub);
    if (param !== null) {
      expect(element).toHaveAttribute("data-param", param);
    }
    expect(currentPath()).toBe(route);
    expect(screen.queryByRole("heading", { name: NOT_FOUND_HEADING })).toBeNull();
  });

  // Implements TC-COMP-194
  const research: ReadonlyArray<readonly [string, string, string | null]> = [
    ["/research", "stub-research", null],
    ["/research/stocks/AAPL", "stub-research/stocks", "AAPL"],
    ["/research/compare", "stub-research/compare", null],
    ["/research/universes", "stub-research/universes", null],
    ["/research/universes/u1", "stub-research/universes/detail", "u1"],
  ];

  it.each(research)("keeps CAP-002's %s reachable as %s", async (route, stub, param) => {
    renderAt(route);
    const element = await screen.findByTestId(stub);
    if (param !== null) {
      expect(element).toHaveAttribute("data-param", param);
    }
    expect(currentPath()).toBe(route);
  });

  it("leaves CAP-002's five Route lines as delivered", () => {
    const lines = readFileSync(path.join(here, "routes.tsx"), "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith('<Route path="/research'));
    expect(lines).toEqual([
      '<Route path="/research" element={<ResearchScreen />} />',
      '<Route path="/research/stocks/:symbol" element={<StockEvidenceScreen />} />',
      '<Route path="/research/compare" element={<CompareScreen />} />',
      '<Route path="/research/universes" element={<UniversesScreen />} />',
      '<Route path="/research/universes/:universeId" element={<UniverseDetailScreen />} />',
    ]);
  });

  // Implements TC-COMP-197
  it("routes every SHELL_ROUTES target to its new path, never to not-found", async () => {
    releaseDetail();
    const expected: ReadonlyArray<readonly [string, string]> = [
      [SHELL_ROUTES.download("run-1"), "/data/downloads/run-1"],
      [SHELL_ROUTES.dataHealth, "/data/downloads"],
      [SHELL_ROUTES.followedStocks, "/data/followed"],
    ];
    expect(Object.keys(SHELL_ROUTES)).toHaveLength(expected.length);
    for (const [target, landing] of expected) {
      const { unmount } = renderAt(target);
      await waitFor(() => expect(currentPath()).toBe(landing));
      expect(await screen.findByTestId(/^stub-/)).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: NOT_FOUND_HEADING })).toBeNull();
      unmount();
    }
  });

  it("registers exactly the sixteen patterns the route table names", () => {
    const registered = [
      ...registeredPaths("routes.tsx"),
      ...registeredPaths("legacy-redirects.tsx"),
    ];
    expect(registered.sort()).toEqual(
      [
        "/",
        "*",
        "/data/coverage",
        "/data/followed",
        "/data/downloads",
        "/data/downloads/:runId",
        "/settings",
        "/research",
        "/research/stocks/:symbol",
        "/research/compare",
        "/research/universes",
        "/research/universes/:universeId",
        "/coverage",
        "/instruments",
        "/runs",
        "/runs/:runId",
      ].sort(),
    );
  });
});

// Implements TC-COMP-056
describe("/ — RootRedirect (DAC-E3-1, AC-2)", () => {
  it("renders one skeleton card until the first health answer", () => {
    deferHealth();
    renderAt("/");
    const skeletons = screen.getAllByTestId("shell-skeleton");
    expect(skeletons).toHaveLength(1);
    const skeleton = skeletons[0] as HTMLElement;
    expect(skeleton).toHaveAttribute("data-variant", "default");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton.style.maxWidth).toBe("1180px");
    expect(currentPath()).toBe("/");
  });

  it("redirects an empty install to /setup by replace", async () => {
    renderAt("/");
    await waitFor(() => expect(currentPath()).toBe("/setup"));
    expect(navType()).toBe("REPLACE");
    expect(screen.queryByTestId("shell-skeleton")).toBeNull();
  });

  it("redirects an install with a requested download to /home by replace", async () => {
    fetchHealthMock.mockResolvedValue(HEALTH_STARTED);
    renderAt("/");
    await waitFor(() => expect(currentPath()).toBe("/home"));
    expect(navType()).toBe("REPLACE");
  });

  it("replaces the entry, so Back does not return to /", async () => {
    renderAt("/", ["/start", "/"]);
    await waitFor(() => expect(currentPath()).toBe("/setup"));
    await act(async () => {
      navigateRef.current?.(-1);
    });
    expect(currentPath()).toBe("/start");
  });

  it("does not redirect while the product is unreachable", async () => {
    const pending = deferHealth();
    renderAt("/");
    await act(async () => {
      pending.reject(new ApiUnreachableError("connect ECONNREFUSED"));
    });
    expect(currentPath()).toBe("/");
    expect(navType()).toBe("POP");
    expect(screen.getAllByTestId("shell-skeleton")).toHaveLength(1);
  });

  it("is not a lock: setup incomplete still opens the registered data and settings routes", async () => {
    for (const route of ["/data/coverage", "/settings"]) {
      const { unmount } = renderAt(route);
      expect(
        await screen.findByTestId(route === "/settings" ? "stub-settings" : "stub-coverage"),
      ).toBeInTheDocument();
      expect(currentPath()).toBe(route);
      unmount();
    }
  });

  it("never redirects on a stale answer", async () => {
    vi.useFakeTimers();
    fetchHealthMock
      .mockResolvedValueOnce(HEALTH_EMPTY)
      .mockRejectedValue(new ApiUnreachableError("connect ECONNREFUSED"));
    renderAt("/start");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    await act(async () => {
      navigateRef.current?.("/");
    });
    expect(currentPath()).toBe("/");
    expect(screen.getAllByTestId("shell-skeleton")).toHaveLength(1);
  });
});

// Implements TC-COMP-195
describe("Routes — the unreachable state applies to every CAP-002 route (DAC-E4-S10-3)", () => {
  it.each([
    "/research",
    "/research/stocks/AAPL",
    "/research/compare",
    "/research/universes",
    "/research/universes/u1",
  ])("replaces main with the unreachable state at %s", async (route) => {
    fetchHealthMock.mockRejectedValue(new ApiUnreachableError("connect ECONNREFUSED"));
    render(
      <MemoryRouter initialEntries={[route]}>
        <Shell />
      </MemoryRouter>,
    );
    const main = screen.getByRole("main");
    expect(await within(main).findByTestId("unreachable-state")).toBeInTheDocument();
    expect(within(main).queryByTestId(/^stub-/)).toBeNull();
    expect(within(screen.getByRole("navigation")).getAllByRole("link")).toHaveLength(5);
  });
});

// Implements TC-COMP-193
describe("Routes — the Research rail link targets exactly /research (DAC-E4-6)", () => {
  it("links the Research rail item to /research", async () => {
    render(
      <MemoryRouter initialEntries={["/data/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );
    expect(
      await within(screen.getByRole("navigation")).findByRole("link", { name: "Research" }),
    ).toHaveAttribute("href", "/research");
  });
});

// Implements TC-COMP-057
describe("DESTINATIONS — one static ordered list with RESEARCH_REGISTERED (DAC-E3-2)", () => {
  it("is the independent literal list, with Research registered", () => {
    expect(DESTINATIONS).toEqual([
      { group: "primary", label: "Research", to: "/research" },
      { group: "data", label: "Settings", to: "/settings" },
    ]);
    expect(RESEARCH_REGISTERED).toBe(true);
  });

  it("holds a destination exactly when routes.tsx registers its path", () => {
    const routes = readFileSync(path.join(here, "routes.tsx"), "utf-8");
    const registered = registeredPaths("routes.tsx");
    expect(RESEARCH_REGISTERED).toBe(DESTINATIONS.some((d) => d.to === "/research"));
    expect(RESEARCH_REGISTERED).toBe(routes.includes('path="/research"'));
    for (const destination of DESTINATIONS) {
      expect(registered).toContain(destination.to);
    }
  });

  it("detects routes at no runtime", () => {
    const files = sourceFiles(webSrc);
    expect(files.length).toBeGreaterThan(50);
    const offenders = files
      .filter((f) =>
        /\b(matchRoutes|useRoutes|createRoutesFromChildren|createRoutesFromElements)\b|import\.meta\.glob/.test(
          readFileSync(f, "utf-8"),
        ),
      )
      .map((f) => path.relative(webSrc, f));
    expect(offenders).toEqual([]);
  });

  it("exports the list from destinations.ts only", () => {
    const exporters = sourceFiles(webSrc)
      .filter((f) => /export\s+const\s+DESTINATIONS\b/.test(readFileSync(f, "utf-8")))
      .map((f) => path.relative(webSrc, f));
    expect(exporters).toEqual([path.join("app", "destinations.ts")]);
  });

  it("types each entry as Destination", () => {
    expectTypeOf<(typeof DESTINATIONS)[number]>().toEqualTypeOf<Destination>();
  });
});

// Implements TC-COMP-058
describe("Routes — an unknown path renders the not-found state inside the frame (DAC-E3-4)", () => {
  it("keeps the rail, shows the heading and a Home link, and titles the page", async () => {
    render(
      <MemoryRouter initialEntries={["/this-route-does-not-exist"]}>
        <Shell />
      </MemoryRouter>,
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(
      await within(main).findByRole("heading", { level: 1, name: NOT_FOUND_HEADING }),
    ).toBeInTheDocument();
    expect(within(main).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    expect(resolveTitle("/this-route-does-not-exist", null)).toEqual([{ label: "Page not found" }]);
  });
});

// Implements TC-COMP-080
describe("NotFound — a status card with a keyboard-reachable Home link (DAC-E3-S4-4)", () => {
  /** The DAC-E7-3 terms the owner's words avoid (UX design 0.5). */
  function forbiddenTerms(text: string): string[] {
    return (
      text.match(
        /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/gi,
      ) ?? []
    );
  }

  function Probe(): JSX.Element {
    return <span data-testid="location">{useLocation().pathname}</span>;
  }

  it("is a card holding a status section with the heading, the lead and the Home link", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    const section = screen.getByRole("status");
    expect(section.tagName).toBe("SECTION");
    expect(section.parentElement).toHaveAttribute("data-variant", "default");
    expect(within(section).getByRole("heading", { level: 1 }).textContent).toBe(NOT_FOUND_HEADING);
    expect(within(section).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    expect(section.textContent).toBe(
      "There's no page at this address.Check the address, or go to Home",
    );
  });

  it("uses none of the DAC-E7-3 terms in its text or accessible names", () => {
    const { container } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(forbiddenTerms(container.textContent ?? "")).toEqual([]);
    const names = [...container.querySelectorAll("[aria-label]")].map(
      (el) => el.getAttribute("aria-label") ?? "",
    );
    names.push(...screen.getAllByRole("link").map((link) => link.textContent ?? ""));
    expect(forbiddenTerms(names.join(" "))).toEqual([]);
    // Non-vacuity: the helper finds a planted term.
    expect(forbiddenTerms("No run at this address")).toEqual(["run"]);
  });

  it("makes the heading a programmatic focus target, and the Home link a ghost button (IR-001)", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    // Owner-shell 2.7: CAP-003-E3-S6 moves focus to the h1 on a route change,
    // which only works while the h1 is focusable by script.
    const heading = screen.getByRole("heading", { level: 1 });
    heading.focus();
    expect(heading).toHaveFocus();
    expect(heading.getAttribute("tabindex")).toMatch(/^-\d+$/);
    // Owner-shell 10: the Home link is the `button` `ghost` variant.
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("data-variant", "ghost");
  });

  it("puts the first tab stop on the Home link, and Enter follows it", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotFound />
        <Probe />
      </MemoryRouter>,
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("location").textContent).toBe("/home");
  });
});
