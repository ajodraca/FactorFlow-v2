import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ApiUnreachableError, startAcquisitionRun } from "../../api/client";
import type { RunStartResult } from "../../api/types";
import { toast } from "../../components/ui/toast";
import { DOWNLOAD_NOW, QUEUED_NOTICE, START_REFUSALS, TRY_AGAIN, startFailed } from "./copy";
import { DownloadNow } from "./download-now";

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

const startMock = vi.mocked(startAcquisitionRun);

const DEPTH = new ApiError(
  "No history depth has been set. Configure it in Settings before running.",
  "req-d1",
  { code: "history_depth_not_set" },
);
const NONE = new ApiError(
  "No active instruments exist. Add at least one instrument before running.",
  "req-n1",
  { code: "no_active_instruments" },
);
const INTERNAL = new ApiError("database said no", "req-9f3", { code: "internal_error" });
const OTHER_409 = new ApiError("a refusal nobody has met", "req-o1", { code: "some_future_code" });
const UNREACHABLE = new ApiUnreachableError("POST /api/acquisition-runs could not be reached");

const ACCEPTED: RunStartResult = { runId: "r-9", state: "requested", queuedBehind: null };
const QUEUED: RunStartResult = { runId: "r-10", state: "requested", queuedBehind: "r-1" };

function LocationProbe(): JSX.Element {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderDownload(label?: string) {
  return render(
    <MemoryRouter initialEntries={["/data"]}>
      <DownloadNow {...(label === undefined ? {} : { label })} />
      <LocationProbe />
    </MemoryRouter>,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const pressed = () => screen.getByRole("button", { name: "Download now" });

beforeEach(() => {
  vi.clearAllMocks();
  startMock.mockReset();
});

describe("Download now refusals and failures (TC-COMP-161, DAC-E6-S2-1, DAC-E6-11)", () => {
  // Implements TC-COMP-161
  it("(a) history depth: its own sentence and its Settings link, never the other refusal", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(DEPTH);
    renderDownload();
    await user.click(pressed());
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Couldn't start the download: history depth isn't set.");
    const link = screen.getByRole("link", { name: "Set history depth" });
    expect(link.getAttribute("href")).toBe("/settings");
    expect(link.getAttribute("data-variant")).toBe("outline");
    expect(pressed().getAttribute("data-variant")).toBe("default");
    expect(screen.queryByText(/no stocks are followed/)).toBeNull();
    expect(screen.queryByRole("link", { name: "Follow stocks" })).toBeNull();
    await user.click(link);
    expect(screen.getByTestId("location").textContent).toBe("/settings");
  });

  it("(b) no stocks followed: its own sentence and its Follow stocks link", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(NONE);
    renderDownload();
    await user.click(pressed());
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Couldn't start the download: no stocks are followed.");
    const link = screen.getByRole("link", { name: "Follow stocks" });
    expect(link.getAttribute("href")).toBe("/data/followed");
    expect(link.getAttribute("data-variant")).toBe("outline");
    expect(screen.queryByText(/history depth/)).toBeNull();
    expect(screen.queryByRole("link", { name: "Set history depth" })).toBeNull();
    await user.click(link);
    expect(screen.getByTestId("location").textContent).toBe("/data/followed");
  });

  it("(c) a transport failure: the reason and Try again outside the status, which posts again", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValueOnce(UNREACHABLE);
    renderDownload();
    await user.click(pressed());
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe("Couldn't start the download: FactorFlow is not answering.");
    const again = screen.getByRole("button", { name: "Try again" });
    expect(status.contains(again)).toBe(false);
    expect(again.getAttribute("data-variant")).toBe("outline");
    expect(screen.queryByRole("link", { name: "Set history depth" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Follow stocks" })).toBeNull();
    startMock.mockResolvedValueOnce(ACCEPTED);
    await user.click(again);
    expect(startMock).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith("attention");
    await waitFor(() => expect(screen.queryByText(/Couldn't start the download/)).toBeNull());
  });

  it.each([
    ["an internal error", INTERNAL],
    ["an unknown 409 code", OTHER_409],
  ])(
    "(d) %s reads as an unexpected problem with Try again, never as a refusal",
    async (_n, error) => {
      const user = userEvent.setup();
      startMock.mockRejectedValue(error);
      renderDownload();
      await user.click(pressed());
      const status = await screen.findByRole("status");
      expect(status.textContent).toBe(
        "Couldn't start the download: FactorFlow hit an unexpected problem.",
      );
      expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
      expect(screen.queryByRole("link")).toBeNull();
    },
  );

  it.each([
    ["DEPTH", DEPTH],
    ["NONE", NONE],
    ["UNREACHABLE", UNREACHABLE],
    ["INTERNAL", INTERNAL],
    ["OTHER_409", OTHER_409],
  ])("(e) %s: no envelope text reaches the page", async (_n, error) => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(error);
    renderDownload();
    await user.click(pressed());
    await screen.findByRole("status");
    const text = document.body.textContent ?? "";
    for (const leaked of [
      error.message,
      "req-",
      "history_depth_not_set",
      "no_active_instruments",
    ]) {
      expect(text).not.toContain(leaked);
    }
  });

  it("(f) a new press clears the previous line", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValueOnce(DEPTH).mockRejectedValueOnce(NONE);
    renderDownload();
    await user.click(pressed());
    await screen.findByRole("link", { name: "Set history depth" });
    await user.click(pressed());
    await screen.findByRole("link", { name: "Follow stocks" });
    expect(screen.queryByRole("link", { name: "Set history depth" })).toBeNull();
    expect(screen.queryByText(/history depth/)).toBeNull();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("(g) a thrown value that is neither error class reads as an unexpected problem", async () => {
    const user = userEvent.setup();
    startMock.mockRejectedValue(new Error("boom"));
    renderDownload();
    await user.click(pressed());
    const status = await screen.findByRole("status");
    expect(status.textContent).toBe(
      "Couldn't start the download: FactorFlow hit an unexpected problem.",
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});

describe("Download now 202 outcomes, no confirmation, whole list (TC-COMP-161 edge, DAC-E6-11, AC-15)", () => {
  it("(a) 202 with nothing queued refreshes attention once and says nothing", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue(ACCEPTED);
    renderDownload();
    await user.click(pressed());
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledWith("attention");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByTestId("location").textContent).toBe("/data");
  });

  it("(b) 202 queued behind a running download shows the helper line and refreshes nothing", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue(QUEUED);
    renderDownload();
    await user.click(pressed());
    const line = await screen.findByRole("status");
    expect(line.textContent).toBe("A download is running. This starts when it finishes.");
    expect(pressed().compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();
    expect(pressed()).toBeTruthy();
    expect(pressed().hasAttribute("disabled")).toBe(false);
  });

  it("(c) no confirmation: one click posts once, and no dialog ever appears", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue(ACCEPTED);
    renderDownload();
    await user.click(pressed());
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("(d) always the whole followed list: the post carries no argument", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue(ACCEPTED);
    renderDownload();
    await user.click(pressed());
    expect(startMock.mock.calls[0]).toEqual([]);
  });

  it("(e) in flight: aria-busy, never disabled, and a second click does not post again", async () => {
    const user = userEvent.setup();
    const pending = deferred<RunStartResult>();
    startMock.mockReturnValue(pending.promise);
    renderDownload();
    expect(pressed().hasAttribute("aria-busy")).toBe(false);
    await user.click(pressed());
    expect(pressed().getAttribute("aria-busy")).toBe("true");
    expect(pressed().hasAttribute("disabled")).toBe(false);
    await user.click(pressed());
    expect(startMock).toHaveBeenCalledTimes(1);
    pending.resolve(ACCEPTED);
    await waitFor(() => expect(pressed().hasAttribute("aria-busy")).toBe(false));
  });

  it("(f) the empty state's label posts the same way", async () => {
    const user = userEvent.setup();
    startMock.mockResolvedValue(ACCEPTED);
    renderDownload("Start the first download");
    await user.click(screen.getByRole("button", { name: "Start the first download" }));
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledWith("attention");
  });

  it("(g) no toast is raised on any outcome", async () => {
    const user = userEvent.setup();
    startMock
      .mockResolvedValueOnce(ACCEPTED)
      .mockResolvedValueOnce(QUEUED)
      .mockRejectedValueOnce(INTERNAL);
    renderDownload();
    await user.click(pressed());
    await user.click(pressed());
    await user.click(pressed());
    await screen.findByText(/Couldn't start the download/);
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe("copy.ts, Download now strings (DEC-0378)", () => {
  it("(a) the label and the queued notice", () => {
    expect(DOWNLOAD_NOW).toBe("Download now");
    expect(QUEUED_NOTICE).toBe("A download is running. This starts when it finishes.");
  });

  it("(b) each refusal names its sentence, its fix and its path", () => {
    expect(START_REFUSALS.history_depth_not_set).toEqual({
      sentence: "Couldn't start the download: history depth isn't set.",
      fix: "Set history depth",
      to: "/settings",
    });
    expect(START_REFUSALS.no_active_instruments).toEqual({
      sentence: "Couldn't start the download: no stocks are followed.",
      fix: "Follow stocks",
      to: "/data/followed",
    });
  });

  it("(c) a failure sentence", () => {
    expect(startFailed("x")).toBe("Couldn't start the download: x.");
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

const CUSTOM_LABEL = "Start the first download";

type State =
  | "idle"
  | "in flight"
  | "queued"
  | "DEPTH"
  | "NONE"
  | "UNREACHABLE"
  | "INTERNAL"
  | "label";
const STATES: State[] = [
  "idle",
  "in flight",
  "queued",
  "DEPTH",
  "NONE",
  "UNREACHABLE",
  "INTERNAL",
  "label",
];

/** Renders the control in each state this story defines, and runs the check in every one. */
async function inEveryState(check: (state: State) => void): Promise<void> {
  for (const state of STATES) {
    vi.clearAllMocks();
    startMock.mockReset();
    const user = userEvent.setup();
    const view = renderDownload(state === "label" ? CUSTOM_LABEL : undefined);
    const button = screen.getByRole("button", {
      name: state === "label" ? CUSTOM_LABEL : DOWNLOAD_NOW,
    });
    if (state === "in flight") {
      startMock.mockReturnValue(new Promise(() => undefined));
      await user.click(button);
    } else if (state === "queued") {
      startMock.mockResolvedValue(QUEUED);
      await user.click(button);
      await screen.findByRole("status");
    } else if (
      state === "DEPTH" ||
      state === "NONE" ||
      state === "UNREACHABLE" ||
      state === "INTERNAL"
    ) {
      startMock.mockRejectedValue({ DEPTH, NONE, UNREACHABLE, INTERNAL }[state]);
      await user.click(button);
      await screen.findByRole("status");
    }
    check(state);
    view.unmount();
  }
}

describe("Download now vocabulary (TC-COMP-163, DAC-E6-S2-3, AC-19)", () => {
  // Implements TC-COMP-163
  it("(a) no term of the DAC-E7-3 list appears in any state", async () => {
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
    for (const term of ["one run", "Retired", "Provider credential", "the instrument"]) {
      expect(term).toMatch(TERMS);
    }
    for (const fine of ["A download is running", "downloads", "instrument_not_found"]) {
      expect(fine).not.toMatch(TERMS);
    }
  });

  it("(d) every button and link name is a copy.ts label", async () => {
    const allowed = new Set([
      DOWNLOAD_NOW,
      TRY_AGAIN,
      ...Object.values(START_REFUSALS).map((r) => r.fix),
    ]);
    await inEveryState((state) => {
      for (const el of screen.getAllByRole("button").concat(screen.queryAllByRole("link"))) {
        const name = el.textContent?.trim() ?? "";
        if (state === "label" && name === CUSTOM_LABEL) continue;
        expect(allowed.has(name), `"${name}" in state ${state}`).toBe(true);
      }
    });
  });
});

describe("No status badge here (TC-COMP-164, DAC-E6-S2-4, AC-20)", () => {
  // Implements TC-COMP-164
  it("(a) no status or coverage badge renders in any state", async () => {
    await inEveryState(() => {
      expect(document.body.querySelector('[data-variant^="status-"]')).toBeNull();
      expect(document.body.querySelector('[data-variant="coverage-unknown"]')).toBeNull();
      const variants = new Set(
        [...document.body.querySelectorAll("[data-variant]")].map((el) =>
          el.getAttribute("data-variant"),
        ),
      );
      for (const variant of variants) {
        expect(["default", "outline", "ghost"]).toContain(variant);
      }
    });
  });

  it("(b) no state is conveyed by colour alone", async () => {
    await inEveryState(() => {
      for (const el of document.body.querySelectorAll("[class]")) {
        expect(el.getAttribute("class") ?? "").not.toMatch(
          /(^|[\s:])(text|bg|border)-((status|destructive)-?|(red|green|amber|yellow|orange)-\d)/,
        );
      }
      for (const el of document.body.querySelectorAll(
        "output, [role=status], [role=alert], [aria-live]",
      )) {
        expect((el.textContent ?? "").trim()).not.toBe("");
      }
    });
  });
});
