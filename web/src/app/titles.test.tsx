import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect, type JSX } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HealthResponse } from "../api/types";
import { HealthProvider } from "./health";
import { ShellProvider, useShell } from "./shell-context";
import { type Crumb, TITLES, resolveTitle, useTitle } from "./titles";

const here = path.dirname(fileURLToPath(import.meta.url));

function pathsIn(file: string): string[] {
  const source = readFileSync(path.join(here, file), "utf-8");
  return [...source.matchAll(/path=["']([^"']+)["']/g)].map((m) => m[1] as string);
}

// Implements TC-COMP-078
describe("titles.ts — every registered route has a title (DAC-E3-S4-2, DAC-E3-9)", () => {
  it("has an entry for every route routes.tsx and legacy-redirects.tsx register, and no other", () => {
    const registered = [...pathsIn("routes.tsx"), ...pathsIn("legacy-redirects.tsx")];
    expect([...new Set(registered)].sort()).toEqual(TITLES.map((t) => t.pattern).sort());
  });

  const rows: ReadonlyArray<readonly [string, string | null, readonly Crumb[] | null]> = [
    ["/settings", null, [{ label: "Settings" }]],
    ["/data/coverage", null, [{ label: "Data health", to: "/data" }, { label: "Coverage" }]],
    ["/data/followed", null, [{ label: "Data health", to: "/data" }, { label: "Followed stocks" }]],
    ["/data/downloads", null, [{ label: "Data health", to: "/data" }, { label: "Downloads" }]],
    [
      "/data/downloads/abc",
      null,
      [
        { label: "Data health", to: "/data" },
        { label: "Downloads", to: "/data/downloads" },
        { label: "Download" },
      ],
    ],
    [
      "/data/downloads/abc",
      "Download 2026-10-15 17:31 CDT",
      [
        { label: "Data health", to: "/data" },
        { label: "Downloads", to: "/data/downloads" },
        { label: "Download 2026-10-15 17:31 CDT" },
      ],
    ],
    ["/no/such/page", null, [{ label: "Page not found" }]],
    ["/research", null, [{ label: "Research" }]],
    ["/research/stocks/KO", null, [{ label: "Research", to: "/research" }, { label: "KO" }]],
    ["/research/compare", null, [{ label: "Research", to: "/research" }, { label: "Compare" }]],
    ["/research/universes", null, [{ label: "Research", to: "/research" }, { label: "Universes" }]],
    [
      "/research/universes/u1",
      null,
      [
        { label: "Research", to: "/research" },
        { label: "Universes", to: "/research/universes" },
        { label: "Universe" },
      ],
    ],
    [
      "/research/universes/u1",
      "Large caps",
      [
        { label: "Research", to: "/research" },
        { label: "Universes", to: "/research/universes" },
        { label: "Large caps" },
      ],
    ],
    ["/", null, null],
    ["/coverage", null, null],
    ["/instruments", null, null],
    ["/runs", null, null],
    ["/runs/abc", null, null],
  ];

  it.each(rows)("resolves %s with detail %j", (pathname, detail, expected) => {
    expect(resolveTitle(pathname, detail)).toEqual(expected);
  });

  it("links every ancestor crumb and leaves the last as text", () => {
    function check(crumbs: readonly { to?: string }[] | null): void {
      if (crumbs === null) return;
      for (const crumb of crumbs.slice(0, -1)) {
        expect(crumb.to).toBeTypeOf("string");
      }
      expect(crumbs.at(-1)?.to).toBeUndefined();
    }
    for (const entry of TITLES) {
      check(
        entry.crumbs === null
          ? null
          : entry.crumbs.map((spec) => ("label" in spec ? spec : { label: "x" })),
      );
    }
    for (const [pathname, detail] of rows.map((r) => [r[0], r[1]] as const)) {
      check(resolveTitle(pathname, detail));
    }
  });

  it("applies the detail only where the route has a detail slot, and never leaves a crumb blank", () => {
    expect(resolveTitle("/settings", "X")).toEqual([{ label: "Settings" }]);
    expect(resolveTitle("/data/coverage", "X")).toEqual([
      { label: "Data health", to: "/data" },
      { label: "Coverage" },
    ]);
    expect(resolveTitle("/data/downloads/abc", "")?.at(-1)).toEqual({ label: "Download" });
  });
});

/* ------------------------------------------------------------------ *
 * useTitle() through the real shell context (DAC-E3-9, DEC-0214).     *
 * ------------------------------------------------------------------ */

const HEALTH_EMPTY: HealthResponse = {
  status: "ok",
  database: "reachable",
  credential_present: true,
  schema_version: 4,
  most_recent_run: null,
};

const navigateRef: { current: ReturnType<typeof useNavigate> | null } = { current: null };

function TitleProbe(): JSX.Element {
  const crumbs = useTitle();
  navigateRef.current = useNavigate();
  return (
    <span data-testid="title">
      {crumbs === null ? "none" : crumbs.map((c) => c.label).join(" › ")}
    </span>
  );
}

/** What a screen does under DEC-0214: set its crumb detail while mounted. */
function DetailScreen(): null {
  const { setTitleDetail } = useShell();
  useEffect(() => {
    setTitleDetail("Download 2026-10-15 17:31 CDT");
    return () => setTitleDetail(null);
  }, [setTitleDetail]);
  return null;
}

function Harness({ show }: { show: boolean }): JSX.Element {
  return (
    <HealthProvider>
      <ShellProvider>
        <MemoryRouter initialEntries={["/data/downloads/abc"]}>
          <TitleProbe />
          {show && <DetailScreen />}
        </MemoryRouter>
      </ShellProvider>
    </HealthProvider>
  );
}

describe("useTitle() — the detail crumb follows the screen (DAC-E3-9, DEC-0214)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/api/health")) {
          return new Response(JSON.stringify(HEALTH_EMPTY), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({
            error: {
              code: "not_found",
              message: "No resource exists at this path.",
              request_id: "req-404",
            },
          }),
          { status: 404, headers: { "content-type": "application/json" } },
        );
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the generic noun, then the screen's detail, then the noun again", async () => {
    const { rerender, unmount } = render(<Harness show={false} />);
    expect(screen.getByTestId("title").textContent).toBe("Data health › Downloads › Download");

    rerender(<Harness show />);
    await waitFor(() =>
      expect(screen.getByTestId("title").textContent).toBe(
        "Data health › Downloads › Download 2026-10-15 17:31 CDT",
      ),
    );

    rerender(<Harness show={false} />);
    await waitFor(() =>
      expect(screen.getByTestId("title").textContent).toBe("Data health › Downloads › Download"),
    );

    // A mounted probe follows navigation.
    await act(async () => {
      navigateRef.current?.("/settings");
    });
    expect(screen.getByTestId("title").textContent).toBe("Settings");
    await act(async () => {
      navigateRef.current?.("/no/such/page");
    });
    expect(screen.getByTestId("title").textContent).toBe("Page not found");
    await act(async () => {
      navigateRef.current?.("/coverage");
    });
    expect(screen.getByTestId("title").textContent).toBe("none");

    unmount();
  });
});
