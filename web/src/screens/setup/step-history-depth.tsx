import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError, ApiUnreachableError, setHistoryDepth } from "../../api/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRoot,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { QUESTIONS, READ_ERRORS, STEP2 } from "./copy";
import { StepCard, StepReadError, failureReason } from "./step-card";
import type { SetupState } from "./use-setup-state";

/*
 * Step 2, the history depth (CAP-003-E4-S2; component design setup-ui 10;
 * AC-3, AC-17, DAC-E4-4, DAC-E4-13, DAC-E4-S2-1; DEC-0346, DEC-0347). The
 * number is checked on blur and on Continue and sent only when valid; the
 * server stays the authority, so its refusal of a value is shown the same way.
 * What was typed is kept as a draft and never reset by a failure.
 */

/** Mirrors the server's lower bound (`src/factorflow/api/bounds.py`), the range the copy states. */
const MIN_YEARS = 1;
/** Mirrors the server's upper bound (`src/factorflow/api/bounds.py`), the range the copy states. */
const MAX_YEARS = 50;

const schema = z.object({
  years: z
    .string()
    .trim()
    .refine(
      (text) => /^\d+$/.test(text) && Number(text) >= MIN_YEARS && Number(text) <= MAX_YEARS,
      STEP2.rangeError,
    ),
});

type Values = z.infer<typeof schema>;

export function StepHistoryDepth({ state }: { state: SetupState }) {
  // The draft wins when there is one, else the saved years, else empty (AC-3).
  const initialYears =
    state.drafts.yearsText !== ""
      ? state.drafts.yearsText
      : state.depth.kind === "ok" && state.depth.data.years !== null
        ? String(state.depth.data.years)
        : "";

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { years: initialYears },
  });

  async function save({ years }: Values): Promise<void> {
    try {
      await setHistoryDepth(Number(years));
    } catch (error) {
      if (error instanceof ApiError && error.code === "validation_error") {
        form.setError("years", { type: "server", message: STEP2.rangeError });
        return;
      }
      if (error instanceof ApiError || error instanceof ApiUnreachableError) {
        form.setError("years", {
          type: "server",
          message: STEP2.saveFailed(failureReason(error)),
        });
        return;
      }
      throw error;
    }
    state.reread("depth");
    state.goTo(3);
  }

  return (
    <StepCard
      step={2}
      question={QUESTIONS[2]}
      note={STEP2.planLimitNote}
      onBack={() => state.goTo(1)}
      onContinue={() => void form.handleSubmit(save)()}
    >
      {state.depth.kind === "error" ? (
        <StepReadError
          subject={READ_ERRORS.subjects.depth}
          error={state.depth.error}
          onRetry={() => state.reread("depth")}
        />
      ) : null}
      <Form {...form}>
        <FormRoot aria-label={STEP2.fieldLabel} onSubmit={form.handleSubmit(save)}>
          <FormField
            control={form.control}
            name="years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{STEP2.fieldLabel}</FormLabel>
                <FormControl>
                  <Input
                    variant="numeric"
                    suffix={STEP2.suffix}
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      state.setDraft("yearsText", event.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>{STEP2.description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormRoot>
      </Form>
    </StepCard>
  );
}
