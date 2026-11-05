import type { JSX } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import CoverageScreen from "../screens/coverage";
import InstrumentsScreen from "../screens/instruments";
import ResearchScreen from "../screens/research";
import CompareScreen from "../screens/research/compare";
import StockEvidenceScreen from "../screens/research/stocks";
import UniversesScreen from "../screens/research/universes";
import UniverseDetailScreen from "../screens/research/universes/detail";
import RunsScreen from "../screens/runs";
import RunDetailScreen from "../screens/runs/detail";
import SettingsScreen from "../screens/settings";

function NotFound(): JSX.Element {
  return <p>Not found</p>;
}

/**
 * The four CAP-001 destinations, one run-detail child route nested under Runs
 * (DAC-E1-12, DAC-E1-S4-2), and the five CAP-002 routes under /research
 * (DEC-0068, DEC-0084). An unmatched route renders a
 * not-found state inside the shell's main region (DAC-E1-S4-5) rather than
 * outside the frame — `AppRoutes` is rendered inside `Shell`'s main region,
 * so this catch-all stays within it.
 */
export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/coverage" replace />} />
      <Route path="/coverage" element={<CoverageScreen />} />
      <Route path="/instruments" element={<InstrumentsScreen />} />
      <Route path="/runs" element={<RunsScreen />} />
      <Route path="/runs/:runId" element={<RunDetailScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/research" element={<ResearchScreen />} />
      <Route path="/research/stocks/:symbol" element={<StockEvidenceScreen />} />
      <Route path="/research/compare" element={<CompareScreen />} />
      <Route path="/research/universes" element={<UniversesScreen />} />
      <Route path="/research/universes/:universeId" element={<UniverseDetailScreen />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
