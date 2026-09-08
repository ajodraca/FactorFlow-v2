/**
 * Placeholder for the persistent status region (UX design section 0).
 *
 * CAP-001-E1-S5 owns the real implementation: liveness and last-run-outcome
 * polling from `GET /api/health`, refreshed every 30 seconds. This story only
 * defines the slot in the shell's layout so layout tests can assert the
 * slot's position without depending on S5's content.
 */
export function StatusRegion(): JSX.Element {
  return <div data-testid="status-region" />;
}
