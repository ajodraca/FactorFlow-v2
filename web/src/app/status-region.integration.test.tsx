import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Shell } from "./shell";

/**
 * T020: the three response shapes `GET /api/health` produces, exercised
 * through the real `fetchHealth()` with only the transport stubbed.
 *
 * Every other test in this story stubs `fetchHealth` itself, which proves the
 * region renders each state but not that the client maps a real response —
 * or a real transport failure — onto the right one. This one drives the whole
 * path: `fetch` → `client.ts` → `useHealthPolling` → the rendered state.
 */

const HEALTH_BODY = {
  status: "ok" as const,
  database: "reachable" as const,
  credential_present: true,
  schema_version: 4,
  most_recent_run: null,
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("StatusRegion — the three health response shapes, end to end (T020)", () => {
  it("a successful response with the product answering renders the answering state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(HEALTH_BODY)),
    );

    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("liveness-state")).toHaveAttribute("data-liveness", "answering"),
    );
    expect(screen.getByTestId("run-outcome")).toHaveAttribute("data-outcome", "none");
    expect(screen.queryByTestId("credential-state")).toBeNull();
    // The routed screen renders: the API answered.
    expect(within(screen.getByRole("main")).getByText("Coverage")).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/health", expect.anything());
  });

  it("a successful response with credential_present false renders the credential state, not unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ ...HEALTH_BODY, credential_present: false })),
    );

    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    const credential = await screen.findByTestId("credential-state");
    expect(credential).toHaveAttribute("data-credential", "absent");
    // The product answered, so the main region keeps its routed screen.
    expect(screen.getByTestId("liveness-state")).toHaveAttribute("data-liveness", "answering");
    expect(screen.queryByTestId("unreachable-state")).toBeNull();
  });

  it("a transport failure renders the designed unreachable state in the main region", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    const main = screen.getByRole("main");
    const unreachable = await within(main).findByTestId("unreachable-state");
    expect(unreachable).toHaveTextContent(
      "FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.",
    );
    // Not the raw `TypeError: Failed to fetch` the transport threw.
    expect(unreachable.textContent ?? "").not.toMatch(/TypeError|Failed to fetch/);
    expect(screen.getByTestId("liveness-state")).toHaveAttribute("data-liveness", "unreachable");
    expect(screen.queryByTestId("credential-state")).toBeNull();
  });

  it("a non-OK status is the API not answering usefully, and renders the same designed state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("gateway down", { status: 502 })),
    );

    render(
      <MemoryRouter initialEntries={["/coverage"]}>
        <Shell />
      </MemoryRouter>,
    );

    const main = screen.getByRole("main");
    await within(main).findByTestId("unreachable-state");
    expect(main.textContent ?? "").not.toMatch(/502|gateway down/i);
  });
});
