import { type JSX, Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Card } from "../components/ui/card";
import { useHealth } from "./health";
import { LAYOUT } from "./layout";
import { legacyRoutes } from "./legacy-redirects";
import { NotFound } from "./not-found";

// Each screen loads as its route renders (owner-shell 5). The CAP-002 bindings
// keep their delivered names, so their `Route` lines stay as they were (AC-27).
const CoverageScreen = lazy(() => import("../screens/coverage"));
const InstrumentsScreen = lazy(() => import("../screens/instruments"));
const RunsScreen = lazy(() => import("../screens/runs"));
const RunDetailScreen = lazy(() => import("../screens/runs/detail"));
const SettingsScreen = lazy(() => import("../screens/settings"));
const ResearchScreen = lazy(() => import("../screens/research"));
const StockEvidenceScreen = lazy(() => import("../screens/research/stocks"));
const CompareScreen = lazy(() => import("../screens/research/compare"));
const UniversesScreen = lazy(() => import("../screens/research/universes"));
const UniverseDetailScreen = lazy(() => import("../screens/research/universes/detail"));

/**
 * The one shell-level loading state: a single card at the content cap
 * (owner-shell 2.8; DAC-E3-16). It writes no length and no copy.
 */
function ShellSkeleton(): JSX.Element {
  return (
    <Card
      variant="default"
      aria-busy="true"
      data-testid="shell-skeleton"
      className="w-full animate-pulse"
      style={{ maxWidth: LAYOUT.contentMaxWidth }}
    >
      <div className="p-5 space-y-3">
        <div className="h-4 rounded bg-secondary" />
        <div className="h-4 rounded bg-secondary" />
      </div>
    </Card>
  );
}

/**
 * `/`: the skeleton until the first health answer, then a replace to `/setup`
 * when no download was ever requested and to `/home` otherwise (DEC-0202 as
 * amended; DAC-E3-1; AC-2, AC-21). Setup incomplete is not a lock: only `/`
 * reads it, and nothing is stored. While the product is unreachable the
 * skeleton stays, and the shell's main region shows the unreachable state.
 */
function RootRedirect(): JSX.Element {
  const { liveness, health } = useHealth();
  if (liveness === "answering" && health !== null) {
    return <Navigate to={health.most_recent_run === null ? "/setup" : "/home"} replace />;
  }
  return <ShellSkeleton />;
}

/**
 * The route map as it stands at this story (owner-shell 2.6; AC-17, AC-18,
 * AC-27; DAC-E3-S4-3): the five delivered screens at their new paths, CAP-002's
 * five `/research` routes as delivered, the four legacy redirects, and the
 * not-found state for everything else, rendered inside the shell's main
 * region. One `Suspense` boundary there keeps the frame mounted while a
 * screen's code loads (DEC-0328).
 *
 * `/setup`, `/home` and `/data` are not registered here: CAP-003-E4-S6,
 * CAP-003-E5-S5 and CAP-003-E6-S7 register them.
 */
export function AppRoutes(): JSX.Element {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/data/coverage" element={<CoverageScreen />} />
        <Route path="/data/followed" element={<InstrumentsScreen />} />
        <Route path="/data/downloads" element={<RunsScreen />} />
        <Route path="/data/downloads/:runId" element={<RunDetailScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/research" element={<ResearchScreen />} />
        <Route path="/research/stocks/:symbol" element={<StockEvidenceScreen />} />
        <Route path="/research/compare" element={<CompareScreen />} />
        <Route path="/research/universes" element={<UniversesScreen />} />
        <Route path="/research/universes/:universeId" element={<UniverseDetailScreen />} />
        {legacyRoutes}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
