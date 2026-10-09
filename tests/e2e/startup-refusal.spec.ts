import { expect, test } from "@playwright/test";

/**
 * Inconsistent store prevents unsafe start (TC-E2E-012; AC-16), per
 * CAP-001-e2e-tests-automation-tasks T014 and DEC-0026.
 *
 * `scripts/run-e2e-server.sh` runs the production start chain (Dockerfile
 * `CMD`) against `factorflow_ahead`, a store ahead of this build, with
 * `FACTORFLOW_API_PORT=8124`, and aborts the whole suite unless that start
 * exits 2 (`StoreAheadOfBuildError`) — so by the time this test runs, the
 * product has refused to start and nothing listens on 8124. The already
 * available owner-interface bundle is loaded from the main stack (8123), and
 * its `/api` requests are sent to the refused product instead.
 */
const REFUSED_BASE_URL = "http://127.0.0.1:8124";

// UNREACHABLE_MESSAGE, verbatim from web/src/app/status-region.tsx.
const UNREACHABLE_MESSAGE =
  "FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.";

test("TC-E2E-012: a product that refused to start shows the named unavailable state and serves no API", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("status-region")).toBeVisible();

  await page.route("**/api/**", async (route) => {
    const original = new URL(route.request().url());
    try {
      const response = await route.fetch({
        url: `${REFUSED_BASE_URL}${original.pathname}${original.search}`,
      });
      await route.fulfill({ response });
    } catch {
      await route.abort("connectionrefused");
    }
  });
  await page.reload();

  await expect(page.getByTestId("unreachable-state")).toHaveText(UNREACHABLE_MESSAGE);
  await expect(page.getByTestId("liveness-state")).toHaveText("Not answering");

  // No API surface is available to serve or write data.
  await expect(request.get(`${REFUSED_BASE_URL}/api/health`)).rejects.toThrow();
});
