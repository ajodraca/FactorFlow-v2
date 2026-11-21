import type { JSX } from "react";
import { Navigate, Route, useLocation, useParams } from "react-router-dom";

/**
 * The four paths CAP-001 shipped, redirected to their new paths for one
 * release (AC-18; DAC-E3-3, DAC-E3-S4-1; owner-shell 2.6 and 6).
 *
 * Each redirect is a `Navigate ... replace`, so the legacy path never enters
 * history and Back does not land on it. The query string is kept.
 *
 * This file, its import in `routes.tsx` and `legacy-redirects.test.tsx` are
 * deleted one release after this ships (capability assumption 3).
 */

/** Redirects to `to`, keeping the current query string. */
function KeepSearch({ to }: { to: string }): JSX.Element {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

/** `/runs/:runId` becomes `/data/downloads/:runId`, query kept. */
function LegacyRunDetail(): JSX.Element {
  const { runId } = useParams();
  const { search } = useLocation();
  return <Navigate to={`/data/downloads/${runId}${search}`} replace />;
}

export const legacyRoutes = [
  <Route key="legacy-coverage" path="/coverage" element={<KeepSearch to="/data/coverage" />} />,
  <Route
    key="legacy-instruments"
    path="/instruments"
    element={<KeepSearch to="/data/followed" />}
  />,
  <Route key="legacy-runs" path="/runs" element={<KeepSearch to="/data/downloads" />} />,
  <Route key="legacy-run-detail" path="/runs/:runId" element={<LegacyRunDetail />} />,
];
