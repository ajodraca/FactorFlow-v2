import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, render, screen } from "@testing-library/react";
import type { JSX, ReactElement } from "react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { describe, expect, it } from "vitest";
import { legacyRoutes } from "./legacy-redirects";

type Navigate = ReturnType<typeof useNavigate>;
const navigateRef: { current: Navigate | null } = { current: null };

/** Renders the pathname plus search, the navigation type, and exposes `navigate`. */
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

function renderAt(from: string): void {
  render(
    <MemoryRouter initialEntries={["/start", from]} initialIndex={1}>
      <Routes>
        {legacyRoutes}
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

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

// Implements TC-COMP-077
describe("Legacy redirects — replace, with the query kept (DAC-E3-S4-1, AC-18)", () => {
  const cases: ReadonlyArray<readonly [string, string]> = [
    ["/runs/abc?x=1", "/data/downloads/abc?x=1"],
    ["/coverage", "/data/coverage"],
    ["/coverage?symbol=KO", "/data/coverage?symbol=KO"],
    ["/instruments", "/data/followed"],
    ["/instruments?lifecycle=retired", "/data/followed?lifecycle=retired"],
    ["/runs", "/data/downloads"],
    ["/runs?cursor=c1", "/data/downloads?cursor=c1"],
  ];

  it.each(cases)("%s lands on %s by replace, and back does not return to it", async (from, to) => {
    renderAt(from);
    expect(screen.getByTestId("location").textContent).toBe(to);
    expect(screen.getByTestId("nav-type").textContent).toBe("REPLACE");

    // History did not grow: with a push, back would land on the legacy path,
    // which would redirect again and read `to`.
    await act(async () => {
      navigateRef.current?.(-1);
    });
    expect(screen.getByTestId("location").textContent).toBe("/start");
  });
});

// DAC-E3-3: from one module whose removal deletes one file and its tests.
describe("Legacy redirects — one module (DAC-E3-3)", () => {
  it("exports four keyed routes for the four legacy paths", () => {
    expect(legacyRoutes).toHaveLength(4);
    const elements = legacyRoutes as ReactElement<{ path: string }>[];
    expect(elements.map((e) => e.props.path)).toEqual([
      "/coverage",
      "/instruments",
      "/runs",
      "/runs/:runId",
    ]);
    const keys = elements.map((e) => e.key);
    expect(keys.every((k) => typeof k === "string" && k.length > 0)).toBe(true);
    expect(new Set(keys).size).toBe(4);
  });

  it("registers the legacy paths in legacy-redirects.tsx and nowhere else", () => {
    const pattern = /path=["'](\/coverage|\/instruments|\/runs|\/runs\/:runId)["']/;
    const files = sourceFiles(webSrc);
    expect(files.length).toBeGreaterThan(50);
    const matching = files
      .filter((f) => pattern.test(readFileSync(f, "utf-8")))
      .map((f) => path.relative(webSrc, f));
    expect(matching).toEqual([path.join("app", "legacy-redirects.tsx")]);
  });

  it("is imported by routes.tsx once and by no other non-test source", () => {
    const importPattern = /from\s+["']\.\/legacy-redirects["']/g;
    const routes = readFileSync(path.join(here, "routes.tsx"), "utf-8");
    expect(routes.match(importPattern)?.length ?? 0).toBe(1);
    const importers = sourceFiles(webSrc)
      .filter((f) => path.basename(f) !== "routes.tsx")
      .filter((f) =>
        /["'](?:\.\/|(?:\.\.\/)+app\/)legacy-redirects["']/.test(readFileSync(f, "utf-8")),
      )
      .map((f) => path.relative(webSrc, f));
    expect(importers).toEqual([]);
  });
});
