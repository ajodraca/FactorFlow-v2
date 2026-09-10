import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import { AppRoutes } from "./routes";
import { HealthProvider, StatusRegion, UnreachableState, useHealth } from "./status-region";

/**
 * Product-vocabulary destinations, in the fixed order UX design section 0
 * and DAC-E1-12 require (STD-UI-1). Not "Jobs", not "Sync", not "Import".
 */
const DESTINATIONS = [
  { label: "Coverage", to: "/coverage" },
  { label: "Instruments", to: "/instruments" },
  { label: "Runs", to: "/runs" },
  { label: "Settings", to: "/settings" },
] as const;

/**
 * The main region's content.
 *
 * When `GET /api/health` cannot be reached at all, UX design section 2
 * requires the shell to replace the main region on every route with the
 * designed unreachable state (AC-16, DAC-E1-15) — replace, not accompany, so
 * the routed screen does not render stale or empty content beside a state
 * saying the product is not answering. The rail and the status region render
 * around it, so the owner is not stranded.
 *
 * The `unknown` state — before the first poll resolves — renders the routed
 * screen rather than the unreachable state, because "not yet checked" is not
 * evidence that the API is down.
 */
function MainRegion(): JSX.Element {
  const { liveness } = useHealth();
  return liveness === "unreachable" ? <UnreachableState /> : <AppRoutes />;
}

/**
 * The application shell (UX design section 0; component design section 2.2):
 * a fixed left navigation rail of `--space-7` width holding the four
 * destinations, a main region, and a persistent status region pinned to the
 * bottom of the rail. A pure composition, not a design-system component
 * — no spacing or type value here is a literal; every one resolves to a
 * `theme.css` custom property (DAC-E1-S4-3, STD-UI-29).
 *
 * Nothing here assumes a principal: no sign-in, no user menu, no account
 * area (AC-14) — the interface is bound to loopback with no authentication.
 *
 * `HealthProvider` wraps the whole shell so the status region and the main
 * region read one polled health state rather than opening an interval each
 * (DAC-E1-13's cadence is 30 seconds in total, not per consumer).
 */
export function Shell(): JSX.Element {
  return (
    <HealthProvider>
      <div className="flex min-h-screen bg-background text-foreground text-base">
        <div data-testid="nav-rail" className="flex w-7 flex-col border-border border-r">
          <nav aria-label="Primary" className="flex flex-1 flex-col gap-2 p-5">
            {DESTINATIONS.map(({ label, to }) => (
              <NavLink key={to} to={to} className="rounded p-3 text-base">
                {label}
              </NavLink>
            ))}
          </nav>
          <StatusRegion />
        </div>
        <main className="flex-1 p-5">
          <MainRegion />
        </main>
      </div>
    </HealthProvider>
  );
}
