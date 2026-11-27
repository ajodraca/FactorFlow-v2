import { useShell } from "../../app/shell-context";
import { NotDeterminable } from "../../components/patterns/presence";
import { StatusBadge } from "../../components/patterns/status-badge";
import { labelOf, tierOf } from "../../components/patterns/tiers";
import { QUESTIONS, STEP1 } from "./copy";
import { StepCard } from "./step-card";
import type { SetupState } from "./use-setup-state";

/** The shared status of the key, from whether it is present. */
const statusOf = (present: boolean) => ({ of: "credential", present }) as const;

/*
 * Step 1, the market data key (CAP-003-E4-S2; component design setup-ui 4,
 * 10; AC-4, DAC-E4-3, DAC-E4-S2-2, DAC-E4-S2-5; DEC-0203, DEC-0349). The key
 * is judged only by whether it is present: nothing of the health answer
 * reaches the page but that boolean, and liveness is read first so a stale
 * answer kept after a failed poll is never shown. Continue is never blocked:
 * a missing key does not stop setup (DEC-0203).
 */
export function StepMarketData({ state }: { state: SetupState }) {
  const { health } = useShell();
  const answer = health.liveness === "answering" ? health.health : null;
  const [beforeName, afterName] = STEP1.setVariable.split(STEP1.KEY_VARIABLE);

  return (
    <StepCard step={1} question={QUESTIONS[1]} onContinue={() => state.goTo(2)}>
      <p className="flex flex-wrap items-center gap-2">
        <span>{STEP1.keyLabel}</span>
        {answer === null ? (
          <NotDeterminable reason={STEP1.notAnswering} />
        ) : (
          <StatusBadge tier={tierOf(statusOf(answer.credential_present))}>
            {labelOf(statusOf(answer.credential_present))}
          </StatusBadge>
        )}
      </p>
      {answer !== null && !answer.credential_present ? (
        <>
          <p>
            {beforeName}
            <code className="font-mono">{STEP1.KEY_VARIABLE}</code>
            {afterName}
          </p>
          <p>{STEP1.restart}</p>
        </>
      ) : null}
    </StepCard>
  );
}
