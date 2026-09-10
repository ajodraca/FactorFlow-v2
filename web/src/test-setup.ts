import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

/**
 * A default `fetch` for every test.
 *
 * The shell polls `GET /api/health` from the moment it mounts (CAP-001-E1-S5),
 * so any test that renders it issues a request. jsdom provides no `fetch`
 * implementation that resolves, which would leave every such test with an
 * unhandled rejection settling after the assertions and a React `act(...)`
 * warning on the state update that follows it — noise that hides a real
 * failure rather than reporting one.
 *
 * Tests that care about health's content stub `fetchHealth` directly; this
 * only keeps the ones that do not from making an unstubbed network call.
 */
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            status: "ok",
            database: "reachable",
            credential_present: true,
            schema_version: 4,
            most_recent_run: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});
