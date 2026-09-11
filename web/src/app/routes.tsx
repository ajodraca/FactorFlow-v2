import type { JSX } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import InstrumentsScreen from "../screens/instruments";
import SettingsScreen from "../screens/settings";

/** Placeholder screen content until each destination's own story delivers it. */
function ScreenPlaceholder({ label }: { label: string }): JSX.Element {
  return <div>{label}</div>;
}

function RunDetailPlaceholder(): JSX.Element {
  return <div>Run detail</div>;
}

function NotFound(): JSX.Element {
  return <p>Not found</p>;
}

/**
 * The four destinations this story owns, plus one run-detail child route
 * nested under Runs (DAC-E1-12, DAC-E1-S4-2). An unmatched route renders a
 * not-found state inside the shell's main region (DAC-E1-S4-5) rather than
 * outside the frame — `AppRoutes` is rendered inside `Shell`'s main region,
 * so this catch-all stays within it.
 */
export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/coverage" replace />} />
      <Route path="/coverage" element={<ScreenPlaceholder label="Coverage" />} />
      <Route path="/instruments" element={<InstrumentsScreen />} />
      <Route path="/runs" element={<ScreenPlaceholder label="Runs" />} />
      <Route path="/runs/:runId" element={<RunDetailPlaceholder />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
