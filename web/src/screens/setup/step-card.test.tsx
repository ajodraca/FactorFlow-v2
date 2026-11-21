import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError } from "../../api/client";
import { READ_ERRORS } from "./copy";
import {
  STEP_HEADING_ID,
  StepCard,
  StepReadError,
  failureReason,
  useStepHeadingFocus,
} from "./step-card";
import type { StepId } from "./use-setup-state";

// Implements the step card contract (CAP-003-E4-S2 T008; AC-25, DAC-E4-13; setup-ui 10; DEC-0350, DEC-0345)

function Host({ step }: { step: StepId }) {
  useStepHeadingFocus(step);
  return <StepCard step={step} question={`Q${step}`} />;
}

describe("StepCard", () => {
  it("(a) is a section labelled by its h2, which is focusable by script", () => {
    render(<StepCard step={2} question="How far back should history go?" />);
    const region = screen.getByRole("region", { name: "How far back should history go?" });
    const heading = region.querySelector("h2");
    expect(heading?.id).toBe(STEP_HEADING_ID);
    expect(STEP_HEADING_ID).toBe("setup-step-heading");
    expect(heading?.getAttribute("tabindex")).toBe("-1");
    expect(screen.getByText("Step 2 of 4")).toBeTruthy();
  });

  it("(b) names the previous and next steps in the footer", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onContinue = vi.fn();
    const { rerender } = render(
      <StepCard step={2} question="Q" onBack={onBack} onContinue={onContinue} />,
    );
    const back = screen.getByRole("button", { name: "← Back: Market data" });
    expect(back.getAttribute("data-variant")).toBe("ghost");
    await user.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Next: Stocks to follow")).toBeTruthy();
    const next = screen.getByRole("button", { name: "Continue" });
    expect(next.getAttribute("data-variant")).toBe("default");
    await user.click(next);
    expect(onContinue).toHaveBeenCalledTimes(1);

    rerender(<StepCard step={3} question="Q" onBack={onBack} onContinue={onContinue} />);
    expect(screen.getByRole("button", { name: "← Back: How far back" })).toBeTruthy();
    expect(screen.getByText("Next: Download data")).toBeTruthy();
  });

  it("(c) leaves out Back on step 1 and Continue and Next without a handler", () => {
    const { rerender } = render(<StepCard step={1} question="Q" onBack={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Back/ })).toBeNull();
    rerender(<StepCard step={4} question="Q" onBack={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
    expect(screen.queryByText(/^Next:/)).toBeNull();
    expect(screen.getByRole("button", { name: "← Back: Stocks to follow" })).toBeTruthy();
    // Past the last step there is nothing to continue to, even with a handler.
    rerender(<StepCard step={4} question="Q" onContinue={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
    expect(screen.queryByText(/^Next:/)).toBeNull();
    // Without a handler a middle step shows no hint either.
    rerender(<StepCard step={2} question="Q" />);
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
    expect(screen.queryByText(/^Next:/)).toBeNull();
  });

  it("(d) renders the explanation at its measure and the note as an info note", () => {
    const { rerender } = render(<StepCard step={2} question="Q" explanation="E" note="N" />);
    expect(screen.getByText("E").style.maxWidth).toBe("70ch");
    const note = screen.getByText("N");
    expect(note.classList.contains("bg-muted")).toBe(true);
    expect(note.classList.contains("text-xs")).toBe(true);
    rerender(<StepCard step={2} question="Q" />);
    expect(screen.queryByText("E")).toBeNull();
    expect(screen.queryByText("N")).toBeNull();
  });

  it("(e) moves focus to the heading only when the step changes", () => {
    const { rerender } = render(<Host step={1} />);
    expect(document.activeElement).toBe(document.body);
    rerender(<Host step={2} />);
    expect(document.activeElement).toBe(screen.getByText("Q2"));
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    rerender(<Host step={2} />);
    expect(document.activeElement).toBe(outside);
    outside.remove();
    rerender(<Host step={1} />);
    expect(document.activeElement).toBe(screen.getByText("Q1"));
  });

  it("(f) gives a reason that never carries the error's own text", () => {
    const unreachable = new ApiUnreachableError(
      "GET /api/settings/history-depth could not be reached",
    );
    expect(failureReason(unreachable)).toBe("FactorFlow is not answering");
    const coded = new ApiError("an active instrument with this symbol already exists", "req-9", {
      code: "internal_error",
    });
    expect(failureReason(coded)).toBe("FactorFlow hit an unexpected problem");
    const uncoded = new ApiError("an active instrument with this symbol already exists", "req-9", {
      code: null,
    });
    expect(failureReason(uncoded)).toBe("FactorFlow hit an unexpected problem");
    for (const reason of [failureReason(unreachable), failureReason(coded)]) {
      expect(reason).not.toContain("instrument");
      expect(reason).not.toContain("req-9");
    }
  });

  it("(g) renders a failed read with its reason and Try again", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <StepReadError
        subject={READ_ERRORS.subjects.depth}
        error={new ApiUnreachableError("x")}
        onRetry={onRetry}
      />,
    );
    expect(
      screen.getByText("Couldn't read history depth: FactorFlow is not answering"),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
