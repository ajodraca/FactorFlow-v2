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

// Implements the step card contract of CAP-003-E4-S2 T008 (AC-25, DAC-E4-13;
// component design setup-ui 10; DEC-0345, DEC-0350).

/** A host that calls the focus hook the way the setup screen will, once. */
function Host({ step }: { step: StepId }) {
  useStepHeadingFocus(step);
  return <StepCard step={step} question={`Q${step}`} />;
}

describe("StepCard section and heading", () => {
  it("is a region named by its h2, which is focusable and says its position", () => {
    render(<StepCard step={2} question="How far back should history go?" />);
    const region = screen.getByRole("region", { name: "How far back should history go?" });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(region).toContainElement(heading);
    expect(heading.id).toBe(STEP_HEADING_ID);
    expect(STEP_HEADING_ID).toBe("setup-step-heading");
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
  });
});

describe("StepCard design tokens (setup-ui 10; UX design 1.2)", () => {
  it("is a default card with --space-4 inside and --space-5 between regions", () => {
    render(<StepCard step={2} question="Q" />);
    const card = screen.getByRole("region").firstElementChild as HTMLElement;
    expect(card).toHaveAttribute("data-variant", "default");
    expect(card).toHaveClass("gap-5");
    expect(card).toHaveClass("p-4");
  });

  it("sets the position line at text-xs muted and the question at text-xl", () => {
    render(<StepCard step={2} question="Q" />);
    const position = screen.getByText("Step 2 of 4");
    expect(position).toHaveClass("text-xs");
    expect(position).toHaveClass("text-muted-foreground");
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-xl");
  });

  it("puts Back first and the Next hint with Continue last, the hint at text-xs", () => {
    render(<StepCard step={2} question="Q" onBack={vi.fn()} onContinue={vi.fn()} />);
    const back = screen.getByRole("button", { name: "← Back: Market data" });
    const footer = back.parentElement as HTMLElement;
    expect(footer).toHaveClass("justify-between");
    expect(footer.firstElementChild).toBe(back);
    const group = footer.lastElementChild as HTMLElement;
    expect(group).not.toBe(back);
    const hint = screen.getByText("Next: Stocks to follow");
    expect(group).toContainElement(hint);
    expect(group).toContainElement(screen.getByRole("button", { name: "Continue" }));
    expect(hint).toHaveClass("text-xs");
  });
});

describe("StepCard footer", () => {
  it("names the previous and next steps and calls each handler once", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onContinue = vi.fn();
    render(<StepCard step={2} question="Q" onBack={onBack} onContinue={onContinue} />);
    const back = screen.getByRole("button", { name: "← Back: Market data" });
    expect(back).toHaveAttribute("data-variant", "ghost");
    await user.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Next: Stocks to follow")).toBeInTheDocument();
    const next = screen.getByRole("button", { name: "Continue" });
    expect(next).toHaveAttribute("data-variant", "default");
    await user.click(next);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("names its neighbours on step 3", () => {
    render(<StepCard step={3} question="Q" onBack={vi.fn()} onContinue={vi.fn()} />);
    expect(screen.getByRole("button", { name: "← Back: How far back" })).toBeInTheDocument();
    expect(screen.getByText("Next: Download data")).toBeInTheDocument();
  });

  it("renders no Back on step 1 and no Continue or Next hint without a handler", () => {
    const { rerender } = render(<StepCard step={1} question="Q" onBack={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Back/ })).toBeNull();
    rerender(<StepCard step={4} question="Q" onBack={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
    expect(screen.queryByText(/^Next:/)).toBeNull();
    expect(screen.getByRole("button", { name: "← Back: Stocks to follow" })).toBeInTheDocument();
  });
});

describe("StepCard explanation and note", () => {
  it("caps the explanation's measure and sets the note apart", () => {
    render(<StepCard step={1} question="Q" explanation="E" note="N" />);
    expect(screen.getByText("E").style.maxWidth).toBe("70ch");
    const note = screen.getByText("N");
    expect(note).toHaveClass("bg-muted");
    expect(note).toHaveClass("text-xs");
  });

  it("renders neither element when neither is given", () => {
    const { container } = render(<StepCard step={1} question="Q" />);
    expect(container.querySelector(".bg-muted")).toBeNull();
    expect(container.querySelector("[style]")).toBeNull();
  });
});

describe("useStepHeadingFocus", () => {
  it("never moves focus on first render, moves it on a change, and leaves it on a repeat", () => {
    const { rerender } = render(<Host step={1} />);
    expect(document.body).toHaveFocus();
    rerender(<Host step={2} />);
    expect(screen.getByRole("heading", { name: "Q2" })).toHaveFocus();
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();
    rerender(<Host step={2} />);
    expect(button).toHaveFocus();
    rerender(<Host step={1} />);
    expect(screen.getByRole("heading", { name: "Q1" })).toHaveFocus();
    button.remove();
  });
});

describe("failureReason", () => {
  it("separates an unreachable server from an unexpected answer and never echoes the error", () => {
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
});

describe("StepReadError", () => {
  it("states the read failure with its reason and offers Try again", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <StepReadError
        subject={READ_ERRORS.subjects.depth}
        error={new ApiUnreachableError("x")}
        onRetry={onRetry}
      />,
    );
    const message = screen.getByText("Couldn't read history depth: FactorFlow is not answering");
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass("text-destructive");
    const retry = screen.getByRole("button", { name: "Try again" });
    expect(retry).toHaveAttribute("data-variant", "outline");
    await user.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
