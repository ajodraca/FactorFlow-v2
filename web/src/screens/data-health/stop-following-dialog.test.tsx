import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, retireInstrument } from "../../api/client";
import { toast } from "../../components/ui/toast";
import {
  STOP_FOLLOWING,
  isStaleRowRefusal,
  stopFailureReason,
  stopFollowingDescription,
  stopFollowingFailed,
  stopFollowingTitle,
  stoppedFollowing,
} from "./copy";
import { StopFollowingDialog } from "./stop-following-dialog";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return { ...actual, startAcquisitionRun: vi.fn(), retireInstrument: vi.fn() };
});

const refresh = vi.fn();
vi.mock("../../app/shell-context", () => ({ useShell: () => ({ refresh }) }));

vi.mock("../../components/ui/toast", () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

const retireMock = vi.mocked(retireInstrument);

const INTERNAL = new ApiError("database said no", "req-9f3", { code: "internal_error" });
const OTHER_409 = new ApiError("a refusal nobody has met", "req-o1", {
  code: "some_future_code",
});
const NOT_FOUND = new ApiError("no instrument exists for symbol 'FBXX'", "req-404", {
  code: "instrument_not_found",
});
const ALREADY = new ApiError("instrument 'FBXX' is already retired", "req-409", {
  code: "instrument_already_retired",
});
const UNREACHABLE = new ApiUnreachableError("DELETE /api/instruments/FBXX could not be reached");
const RETIRED = { lifecycle: "retired" as const, retiredAt: "2026-10-30T19:00:00Z" };

const DESCRIPTION =
  "Stop following FBXX? Its history is kept, and strategies holding it keep holding it. You can follow it again later.";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

const stopped = vi.fn();
const refusalClosed = vi.fn();

/** Stands in for CAP-003-E6-S3's Needs fixing card: the rows, the heading and the dialog beside them. */
function NeedsFixingHarness({
  rows = ["FBXX", "GOOD"],
  removeOnStopped = false,
}: {
  rows?: string[];
  removeOnStopped?: boolean;
}) {
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shown = rows.filter((s) => !gone.includes(s));
  return (
    <>
      {shown.length > 0 ? (
        <h2 ref={headingRef} tabIndex={-1}>
          Needs fixing
        </h2>
      ) : null}
      <ul>
        {shown.map((s) => (
          <li key={s}>
            <button type="button" onClick={() => setOpenFor(s)}>
              Stop following {s}
            </button>
          </li>
        ))}
      </ul>
      <StopFollowingDialog
        symbol={openFor}
        onClose={() => setOpenFor(null)}
        onStopped={() => {
          stopped();
          if (removeOnStopped && openFor !== null) setGone((g) => [...g, openFor]);
        }}
        onRefusalClosed={refusalClosed}
        fallbackFocusRef={headingRef}
      />
    </>
  );
}

const rowButton = (symbol: string) =>
  screen.getByRole("button", { name: `Stop following ${symbol}` });

async function openDialog(user: ReturnType<typeof userEvent.setup>, symbol = "FBXX") {
  await user.click(rowButton(symbol));
  return screen.findByRole("dialog", { name: `Stop following ${symbol}` });
}

async function confirm(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement) {
  await user.click(within(dialog).getByRole("button", { name: "Stop following" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  retireMock.mockReset();
});

describe("Stop following dialog (DAC-E6-12, AC-14, AC-25)", () => {
  it("(a) is titled with the symbol and carries the blueprint sentence verbatim", async () => {
    const user = userEvent.setup();
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    expect(dialog).toHaveAccessibleName("Stop following FBXX");
    expect(dialog).toHaveAccessibleDescription(DESCRIPTION);
  });

  it("(b) is a confirm dialog, never destructive", async () => {
    const user = userEvent.setup();
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    expect(dialog).toHaveAttribute("data-variant", "confirm");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(within(dialog).getByRole("button", { name: "Stop following" })).toHaveAttribute(
      "data-variant",
      "default",
    );
    expect(document.body.querySelector('[class*="destructive"]')).toBeNull();
  });

  it("(c) puts Cancel first and focused, and traps Tab", async () => {
    const user = userEvent.setup();
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    const buttons = within(dialog).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Cancel", "Stop following"]);
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Stop following" })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("(d) Cancel closes, returns focus to the row's button and calls nothing", async () => {
    const user = userEvent.setup();
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    expect(retireMock).not.toHaveBeenCalled();
    expect(stopped).not.toHaveBeenCalled();
    expect(refusalClosed).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("(e) in flight: busy, not closable, and the call carries exactly the symbol", async () => {
    const user = userEvent.setup();
    const pending = deferred<typeof RETIRED>();
    retireMock.mockReturnValue(pending.promise);
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    expect(dialog).toHaveAttribute("aria-busy", "true");
    await user.keyboard("{Escape}");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("dialog", { name: "Stop following FBXX" })).toBeInTheDocument();
    expect(retireMock).toHaveBeenCalledTimes(1);
    expect(retireMock).toHaveBeenCalledWith("FBXX");
    await act(async () => {
      pending.resolve(RETIRED);
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("Stop following outcomes (TC-COMP-162, DAC-E6-S2-2, DAC-E6-12, AC-17)", () => {
  // Implements TC-COMP-162
  it("(a)(b) a 409 keeps the dialog open with the reason; Esc closes it and refreshes the row", async () => {
    const user = userEvent.setup();
    retireMock.mockRejectedValue(ALREADY);
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    const status = await within(dialog).findByRole("status");
    expect(status.textContent).toBe(
      "Couldn't stop following FBXX: you already stopped following it.",
    );
    expect(screen.getByRole("dialog", { name: "Stop following FBXX" })).toBeInTheDocument();
    expect(stopped).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(refusalClosed).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(refusalClosed).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
  });

  it("(c) a 404 follows the same path, and Cancel closes it the same way", async () => {
    const user = userEvent.setup();
    retireMock.mockRejectedValue(NOT_FOUND);
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    const status = await within(dialog).findByRole("status");
    expect(status.textContent).toBe("Couldn't stop following FBXX: FactorFlow doesn't follow it.");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(refusalClosed).toHaveBeenCalledTimes(1);
  });

  it("(d) reopening clears the refusal", async () => {
    const user = userEvent.setup();
    retireMock.mockRejectedValue(ALREADY);
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await within(dialog).findByRole("status");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await openDialog(user);
    expect(screen.queryByText(/Couldn't stop following/)).toBeNull();
  });

  it.each([
    ["an internal error", INTERNAL, "FactorFlow hit an unexpected problem"],
    ["an unknown 409 code", OTHER_409, "FactorFlow hit an unexpected problem"],
    ["a transport failure", UNREACHABLE, "FactorFlow is not answering"],
  ])(
    "(e) %s keeps the dialog open and closing it leaves the row alone",
    async (_n, error, reason) => {
      const user = userEvent.setup();
      retireMock.mockRejectedValue(error);
      render(<NeedsFixingHarness />);
      const dialog = await openDialog(user);
      await confirm(user, dialog);
      const status = await within(dialog).findByRole("status");
      expect(status.textContent).toBe(`Couldn't stop following FBXX: ${reason}.`);
      expect(screen.getByRole("dialog", { name: "Stop following FBXX" })).toBeInTheDocument();
      await user.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(refusalClosed).not.toHaveBeenCalled();
      expect(stopped).not.toHaveBeenCalled();
    },
  );

  it("(f) a 200 closes, re-reads, refreshes attention, announces politely and raises no toast", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(stopped).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith("attention");
    const live = document.body.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe("Stopped following FBXX");
    expect(live?.closest('[role="dialog"]')).toBeNull();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
  });

  it("(g) when the row leaves after a stop, focus goes to the Needs fixing heading", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    const view = render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Needs fixing" })).toHaveFocus(),
    );
    expect(document.body.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Stopped following FBXX",
    );
  });

  it("(h) when the row leaves with the close itself, focus still reaches the heading", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    render(<NeedsFixingHarness removeOnStopped />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Needs fixing" })).toHaveFocus(),
    );
    expect(document.body).not.toHaveFocus();
  });

  it("(i) never steals focus the owner has placed elsewhere", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    const view = render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    act(() => rowButton("GOOD").focus());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    expect(rowButton("GOOD")).toHaveFocus();
  });

  it("(j) a second stop announces again, in a fresh node", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    render(<NeedsFixingHarness />);
    let dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const live = document.body.querySelector('[aria-live="polite"]');
    const first = live?.firstElementChild;
    expect(first?.textContent).toBe("Stopped following FBXX");
    dialog = await openDialog(user, "GOOD");
    await confirm(user, dialog);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(live?.textContent).toBe("Stopped following GOOD");
    expect(live?.firstElementChild).not.toBe(first);
    expect(retireMock).toHaveBeenLastCalledWith("GOOD");
  });

  it("(l) after Cancel, a row that leaves later does not move focus", async () => {
    const user = userEvent.setup();
    const view = render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    await settle();
    expect(screen.getByRole("heading", { name: "Needs fixing" })).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it("(m) the heading is focused once, not grabbed again after the owner leaves it", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    const view = render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    const heading = screen.getByRole("heading", { name: "Needs fixing" });
    await waitFor(() => expect(heading).toHaveFocus());
    act(() => heading.blur());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    await settle();
    expect(heading).not.toHaveFocus();
  });

  it("(m2) with no heading when the row leaves, nothing is focused and a later heading is not grabbed", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    const view = render(<NeedsFixingHarness rows={["FBXX"]} />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    view.rerender(<NeedsFixingHarness rows={[]} />);
    await settle();
    expect(screen.queryByRole("heading", { name: "Needs fixing" })).toBeNull();
    expect(document.body).toHaveFocus();
    view.rerender(<NeedsFixingHarness rows={["NEW"]} />);
    await settle();
    expect(screen.getByRole("heading", { name: "Needs fixing" })).not.toHaveFocus();
  });

  it("(d2) a refusal does not follow the dialog to another symbol the caller sets", async () => {
    const user = userEvent.setup();
    retireMock.mockRejectedValue(ALREADY);
    const heading = { current: null };
    const props = { onClose: vi.fn(), onStopped: vi.fn(), onRefusalClosed: vi.fn() };
    const view = render(
      <StopFollowingDialog symbol="FBXX" fallbackFocusRef={heading} {...props} />,
    );
    const dialog = await screen.findByRole("dialog", { name: "Stop following FBXX" });
    await confirm(user, dialog);
    await within(dialog).findByRole("status");
    view.rerender(<StopFollowingDialog symbol={null} fallbackFocusRef={heading} {...props} />);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    view.rerender(<StopFollowingDialog symbol="GOOD" fallbackFocusRef={heading} {...props} />);
    await screen.findByRole("dialog", { name: "Stop following GOOD" });
    expect(screen.queryByText(/Couldn't stop following/)).toBeNull();
  });

  it("(n) focus the owner placed elsewhere is not grabbed later either", async () => {
    const user = userEvent.setup();
    retireMock.mockResolvedValue(RETIRED);
    const view = render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    act(() => rowButton("GOOD").focus());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    act(() => rowButton("GOOD").blur());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    await settle();
    expect(screen.getByRole("heading", { name: "Needs fixing" })).not.toHaveFocus();
  });

  it("(o) when the refused row leaves, focus goes to the heading", async () => {
    const user = userEvent.setup();
    retireMock.mockRejectedValue(ALREADY);
    const view = render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await within(dialog).findByRole("status");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(rowButton("FBXX")).toHaveFocus());
    view.rerender(<NeedsFixingHarness rows={["GOOD"]} />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Needs fixing" })).toHaveFocus(),
    );
  });

  it.each([
    ["ALREADY", ALREADY],
    ["NOT_FOUND", NOT_FOUND],
    ["INTERNAL", INTERNAL],
    ["UNREACHABLE", UNREACHABLE],
  ])("(k) %s: no envelope text reaches the page", async (_n, error) => {
    const user = userEvent.setup();
    retireMock.mockRejectedValue(error);
    render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    await confirm(user, dialog);
    await within(dialog).findByRole("status");
    const text = document.body.textContent ?? "";
    for (const leaked of [error.message, "req-", "instrument_not_found", "instrument_already"]) {
      expect(text).not.toContain(leaked);
    }
  });
});

describe("copy.ts, stop following strings (DEC-0377)", () => {
  it("(d) the titles and sentences", () => {
    expect(stopFollowingTitle("FBXX")).toBe("Stop following FBXX");
    expect(stopFollowingDescription("FBXX")).toBe(DESCRIPTION);
    expect(STOP_FOLLOWING).toBe("Stop following");
    expect(stopFollowingFailed("FBXX", "x")).toBe("Couldn't stop following FBXX: x.");
    expect(stoppedFollowing("FBXX")).toBe("Stopped following FBXX");
  });

  it("(e) the reason of a failed stop, never an envelope message or request id", () => {
    expect(stopFailureReason(ALREADY)).toBe("you already stopped following it");
    expect(stopFailureReason(NOT_FOUND)).toBe("FactorFlow doesn't follow it");
    expect(stopFailureReason(INTERNAL)).toBe("FactorFlow hit an unexpected problem");
    expect(stopFailureReason(UNREACHABLE)).toBe("FactorFlow is not answering");
    for (const error of [ALREADY, NOT_FOUND, INTERNAL, UNREACHABLE]) {
      const reason = stopFailureReason(error);
      expect(reason).not.toContain(error.message);
      if (error instanceof ApiError) expect(reason).not.toContain(error.requestId);
    }
  });

  it("(f) only a 404 or the already-stopped 409 makes the row stale", () => {
    expect(isStaleRowRefusal(NOT_FOUND)).toBe(true);
    expect(isStaleRowRefusal(ALREADY)).toBe(true);
    expect(isStaleRowRefusal(INTERNAL)).toBe(false);
    expect(isStaleRowRefusal(OTHER_409)).toBe(false);
    expect(isStaleRowRefusal(UNREACHABLE)).toBe(false);
    expect(isStaleRowRefusal("instrument_not_found")).toBe(false);
  });
});

// The DAC-E7-3 term list: whole words, any case (DAC-E6-S2-3).
const TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i;

/** Everything a reader sees or hears: the page's text and every aria-label or title on it. */
function visibleAndAccessibleText(): string {
  const names = [...document.body.querySelectorAll("[aria-label], [title]")].map(
    (el) => `${el.getAttribute("aria-label") ?? ""} ${el.getAttribute("title") ?? ""}`,
  );
  return [document.body.textContent ?? "", ...names].join("\n");
}

type State =
  | "open"
  | "in flight"
  | "ALREADY"
  | "NOT_FOUND"
  | "INTERNAL"
  | "UNREACHABLE"
  | "stopped";
const STATES: State[] = [
  "open",
  "in flight",
  "ALREADY",
  "NOT_FOUND",
  "INTERNAL",
  "UNREACHABLE",
  "stopped",
];

/** Renders the dialog in each state this story defines, and runs the check in every one. */
async function inEveryState(check: (state: State) => void): Promise<void> {
  for (const state of STATES) {
    vi.clearAllMocks();
    retireMock.mockReset();
    const user = userEvent.setup();
    const view = render(<NeedsFixingHarness />);
    const dialog = await openDialog(user);
    if (state === "in flight") {
      retireMock.mockReturnValue(new Promise(() => undefined));
      await confirm(user, dialog);
    } else if (
      state === "ALREADY" ||
      state === "NOT_FOUND" ||
      state === "INTERNAL" ||
      state === "UNREACHABLE"
    ) {
      retireMock.mockRejectedValue({ ALREADY, NOT_FOUND, INTERNAL, UNREACHABLE }[state]);
      await confirm(user, dialog);
      await within(dialog).findByRole("status");
    } else if (state === "stopped") {
      retireMock.mockResolvedValue(RETIRED);
      await confirm(user, dialog);
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    }
    check(state);
    view.unmount();
  }
}

describe("Stop following vocabulary (TC-COMP-163, DAC-E6-S2-3, AC-19)", () => {
  // Implements TC-COMP-163
  it("(b) no term of the DAC-E7-3 list appears in any state, in the dialog or beside it", async () => {
    await inEveryState(() => {
      expect(visibleAndAccessibleText()).not.toMatch(TERMS);
    });
  });

  it("(c) the scan is not vacuous", () => {
    const planted = render(
      <>
        <button type="button" aria-label="the instrument">
          x
        </button>
        <span title="one run">y</span>
      </>,
    );
    expect(visibleAndAccessibleText()).toMatch(TERMS);
    planted.unmount();
    for (const term of ["one run", "Retired", "Provider credential", "no instrument exists"]) {
      expect(term).toMatch(TERMS);
    }
    for (const fine of ["A download is running", "downloads", "instrument_not_found"]) {
      expect(fine).not.toMatch(TERMS);
    }
  });

  it("(d) the dialog's buttons and links are Cancel and the copy.ts label", async () => {
    await inEveryState((state) => {
      if (state === "stopped") return;
      const dialog = screen.getByRole("dialog");
      const names = within(dialog)
        .getAllByRole("button")
        .concat(within(dialog).queryAllByRole("link"))
        .map((b) => b.textContent?.trim());
      expect(names).toEqual(["Cancel", STOP_FOLLOWING]);
    });
  });
});

describe("No status badge here (TC-COMP-164, DAC-E6-S2-4, AC-20)", () => {
  // Implements TC-COMP-164
  it("(a) no status or coverage badge renders in any state", async () => {
    await inEveryState(() => {
      expect(document.body.querySelector('[data-variant^="status-"]')).toBeNull();
      expect(document.body.querySelector('[data-variant="coverage-unknown"]')).toBeNull();
      for (const el of document.body.querySelectorAll("[data-variant]")) {
        const variant = el.getAttribute("data-variant");
        // `confirm` is the dialog's own variant; every other element is a Button.
        const allowed = el.matches('[role="dialog"]')
          ? ["confirm"]
          : ["default", "outline", "ghost"];
        expect(allowed, `${el.tagName} ${variant}`).toContain(variant);
      }
    });
  });

  it("(b) no state is conveyed by colour alone", async () => {
    await inEveryState((state) => {
      for (const el of document.body.querySelectorAll("[class]")) {
        expect(el.getAttribute("class") ?? "").not.toMatch(
          /(^|[\s:])(text|bg|border)-((status|destructive)-?|(red|green|amber|yellow|orange)-\d)/,
        );
      }
      for (const el of document.body.querySelectorAll(
        "output, [role=status], [role=alert], [aria-live]",
      )) {
        // The announcement region is empty until the first stop, by design.
        const announcement = el.classList.contains("sr-only");
        if (announcement && state !== "stopped") continue;
        expect((el.textContent ?? "").trim()).not.toBe("");
      }
    });
  });
});
