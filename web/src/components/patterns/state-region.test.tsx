import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ScreenState } from "../../api/types";
import { StateRegion, type StateRenderers } from "./state-region";

type Row = { name: string };

const FIXTURE = {
  loading: { kind: "loading" },
  "empty-never-populated": { kind: "empty-never-populated" },
  "empty-no-match": { kind: "empty-no-match" },
  populated: { kind: "populated", data: { name: "AAPL" }, fetchedAt: "2026-10-15T22:30:00Z" },
  partial: { kind: "partial", data: { name: "MSFT" }, fetchedAt: "2026-10-16T22:30:00Z" },
  unavailable: { kind: "unavailable", reason: "No trading calendar yet" },
  error: { kind: "error", message: "the server could not be reached", requestId: "req-7f3a" },
} satisfies Record<string, ScreenState<Row>>;

const LITERALS = {
  loading: "Skeleton fixture",
  "empty-never-populated": "No stocks followed yet.",
  "empty-no-match": "No stock matches that filter.",
  populated: "Populated AAPL at 2026-10-15T22:30:00Z",
  partial: "Partial MSFT at 2026-10-16T22:30:00Z",
  unavailable: "Unavailable: No trading calendar yet",
  error: "Couldn't read what needs you: the server could not be reached.",
} as const;

type RenderedKind = keyof typeof LITERALS;
const KINDS = Object.keys(LITERALS) as RenderedKind[];

const RENDERERS: StateRenderers<Row> = {
  loading: () => <p>Skeleton fixture</p>,
  "empty-never-populated": () => <p>No stocks followed yet.</p>,
  "empty-no-match": () => <p>No stock matches that filter.</p>,
  populated: (s) => <p>{`Populated ${s.data.name} at ${s.fetchedAt}`}</p>,
  partial: (s) => <p>{`Partial ${s.data.name} at ${s.fetchedAt}`}</p>,
  unavailable: (s) => <p>{`Unavailable: ${s.reason}`}</p>,
  error: (s) => <p>{`Couldn't read what needs you: ${s.message}.`}</p>,
  unreachable: { notApplicable: "The shell replaces the main region (AC-23)" },
};

function region(
  state: ScreenState<Row>,
  renderers: StateRenderers<Row> = RENDERERS,
  onRetry = vi.fn(),
) {
  return render(<StateRegion state={state} renderers={renderers} onRetry={onRetry} />);
}

// Implements TC-COMP-031
describe("StateRegion (TC-COMP-031)", () => {
  it.each(KINDS)("renders only the %s renderer's output", (kind) => {
    region(FIXTURE[kind]);
    expect(screen.getByText(LITERALS[kind])).toBeInTheDocument();
    for (const other of KINDS.filter((k) => k !== kind)) {
      expect(screen.queryByText(LITERALS[other])).toBeNull();
    }
  });

  it("never renders never-populated as no-match, or the reverse", () => {
    const first = region(FIXTURE["empty-never-populated"]);
    expect(screen.getByText("No stocks followed yet.")).toBeInTheDocument();
    expect(screen.queryByText("No stock matches that filter.")).toBeNull();
    first.unmount();
    region(FIXTURE["empty-no-match"]);
    expect(screen.getByText("No stock matches that filter.")).toBeInTheDocument();
    expect(screen.queryByText("No stocks followed yet.")).toBeNull();
  });

  it("renders the error's operation and reason with Try again wired to the caller's retry", async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    region(FIXTURE.error, RENDERERS, retry);
    expect(screen.getByText(LITERALS.error)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Try again" });
    expect(button).toHaveAttribute("data-variant", "outline");
    expect(retry).not.toHaveBeenCalled();
    await user.click(button);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("leaves unreachable to the shell: nothing rendered, the reason never shown", () => {
    const { container } = region({ kind: "unreachable" });
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("The shell replaces the main region (AC-23)")).toBeNull();
  });
});

// Implements TC-COMP-032
describe("type-level coverage (DAC-E1-S9-2)", () => {
  it("refuses an omitted renderer without notApplicable, and unreachable renderers; accepts a reason", () => {
    // @ts-expect-error -- error has neither a renderer nor { notApplicable } (DAC-E1-S9-2)
    const omitsError: StateRenderers<Row> = {
      loading: RENDERERS.loading,
      "empty-never-populated": RENDERERS["empty-never-populated"],
      "empty-no-match": RENDERERS["empty-no-match"],
      populated: RENDERERS.populated,
      partial: RENDERERS.partial,
      unavailable: RENDERERS.unavailable,
      unreachable: { notApplicable: "The shell replaces the main region (AC-23)" },
    };
    // @ts-expect-error -- unreachable is the shell's; only a reason is accepted (DEC-0313)
    const rendersUnreachable: StateRenderers<Row> = { ...RENDERERS, unreachable: () => <p>x</p> };
    const partialNotApplicable: StateRenderers<Row> = {
      ...RENDERERS,
      partial: { notApplicable: "Nothing here is filtered" },
    };
    expect(omitsError).toBeDefined();
    expect(rendersUnreachable).toBeDefined();
    expect(partialNotApplicable).toBeDefined();
  });

  it("refuses an omitted unreachable key, an entry with no reason, and an undefined reason (DEC-0313)", () => {
    // @ts-expect-error -- unreachable is required: the shell's reason must be recorded (DEC-0313)
    const omitsUnreachable: StateRenderers<Row> = {
      loading: RENDERERS.loading,
      "empty-never-populated": RENDERERS["empty-never-populated"],
      "empty-no-match": RENDERERS["empty-no-match"],
      populated: RENDERERS.populated,
      partial: RENDERERS.partial,
      unavailable: RENDERERS.unavailable,
      error: RENDERERS.error,
    };
    // @ts-expect-error -- an entry with neither a renderer nor a reason does not type-check
    const emptyEntry: StateRenderers<Row> = { ...RENDERERS, error: {} };
    const noReason = { notApplicable: undefined };
    // @ts-expect-error -- the reason is a string, never undefined
    const undefinedReason: StateRenderers<Row> = { ...RENDERERS, error: noReason };
    expect(omitsUnreachable).toBeDefined();
    expect(emptyEntry).toBeDefined();
    expect(undefinedReason).toBeDefined();
  });

  it("refuses a call without onRetry (DEC-0313)", () => {
    // @ts-expect-error -- onRetry is a required top-level prop
    const missingRetry = <StateRegion state={FIXTURE.error} renderers={RENDERERS} />;
    expect(missingRetry).toBeDefined();
  });
});

describe("StateRegion wrappers (DEC-0314)", () => {
  it("marks the loading skeleton busy and nothing else", () => {
    region(FIXTURE.loading);
    expect(screen.getByText("Skeleton fixture").closest('[aria-busy="true"]')).not.toBeNull();
  });

  it("does not mark populated busy", () => {
    region(FIXTURE.populated);
    expect(screen.getByText(LITERALS.populated).closest('[aria-busy="true"]')).toBeNull();
  });

  it("announces the error politely with Try again outside the announcement", () => {
    region(FIXTURE.error);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(new RegExp(`^${LITERALS.error}$`));
    expect(within(status).queryByRole("button")).toBeNull();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("never shows the envelope's request id", () => {
    const { container } = region(FIXTURE.error);
    expect(container.textContent).not.toContain("req-7f3a");
  });

  it.each(KINDS.filter((k) => k !== "error"))("offers no Try again for %s", (kind) => {
    region(FIXTURE[kind]);
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("renders nothing for a kind whose entry is notApplicable, never its reason", () => {
    const renderers: StateRenderers<Row> = {
      ...RENDERERS,
      partial: { notApplicable: "Nothing here is filtered" },
    };
    const { container } = region(FIXTURE.partial, renderers);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("Nothing here is filtered")).toBeNull();
  });

  it("renders nothing for an error whose entry is notApplicable", () => {
    const renderers: StateRenderers<Row> = {
      ...RENDERERS,
      error: { notApplicable: "Nothing to read" },
    };
    const { container } = region(FIXTURE.error, renderers);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("StateRegion wrapper contract (DEC-0314, review v1 IR-002, IR-003)", () => {
  it.each(KINDS.filter((k) => k !== "loading"))("has no busy ancestor for %s", (kind) => {
    region(FIXTURE[kind]);
    expect(screen.getByText(LITERALS[kind]).closest("[aria-busy]")).toBeNull();
  });

  it.each(KINDS.filter((k) => k !== "loading" && k !== "error"))(
    "renders %s's output as the container's only child, unwrapped",
    (kind) => {
      const { container } = region(FIXTURE[kind]);
      expect(container.children).toHaveLength(1);
      expect(container.firstElementChild).toBe(screen.getByText(LITERALS[kind]));
    },
  );

  it("wraps the loading skeleton in one busy element holding only the skeleton", () => {
    const { container } = region(FIXTURE.loading);
    const busy = container.firstElementChild;
    expect(container.children).toHaveLength(1);
    expect(busy).toHaveAttribute("aria-busy", "true");
    expect(busy?.children).toHaveLength(1);
    expect(busy?.firstElementChild).toBe(screen.getByText(LITERALS.loading));
  });

  it("keeps the error announcement polite, never assertive or off", () => {
    region(FIXTURE.error);
    expect([null, "polite"]).toContain(screen.getByRole("status").getAttribute("aria-live"));
  });

  it("makes Try again a type=button, fit-width control beside the status in a spaced column", () => {
    region(FIXTURE.error);
    const status = screen.getByRole("status");
    const button = screen.getByRole("button", { name: "Try again" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("w-fit");
    expect(status.parentElement).toBe(button.parentElement);
    expect(status.parentElement).toHaveClass("flex", "flex-col", "gap-2");
  });
});
