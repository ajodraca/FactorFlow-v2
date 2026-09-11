import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright end-to-end configuration (component design section 7; tech
 * stack's note that `npm run test:e2e` was defined with no specs yet).
 *
 * `testDir` is scoped to `tests/e2e` deliberately: without it, Playwright's
 * default file discovery also matches this repository's Vitest
 * `*.test.tsx` component specs, which import `vitest` and fail under
 * Playwright's own runner rather than reporting "no tests found".
 *
 * `webServer` runs `scripts/run-e2e-server.sh`, which starts a real
 * PostgreSQL container, applies migrations, builds the interface bundle,
 * and execs the API — the real API against a real database that component
 * design section 7 specifies, with a stubbed provider (no acquisition run
 * is started by this story's own spec, so the provider credential's value
 * never matters to it).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:8123",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bash scripts/run-e2e-server.sh",
    url: "http://127.0.0.1:8123/api/health",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
