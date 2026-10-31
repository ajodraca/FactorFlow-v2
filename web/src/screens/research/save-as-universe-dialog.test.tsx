import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/classification-client";
import { ClassificationApiError } from "../../api/classification-client";
import type { UniverseDetail } from "../../api/classification-types";
import { ApiUnreachableError } from "../../api/client";
import { DEFAULT_RESEARCH_QUERY, type ResearchQuery } from "../../api/research-query";
import { DIALOGS, FALLBACK_ERROR, RESULTS, describeQuery, failureSentence } from "./copy";
import { NoticeRegion, useNotices } from "./notices";
import { SaveAsUniverse } from "./save-as-universe-dialog";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return { ...actual, createUniverse: vi.fn() };
});

const createUniverse = vi.mocked(client.createUniverse);

const FILTERED: ResearchQuery = {
  ...DEFAULT_RESEARCH_QUERY,
  sentences: {
    value: { measure: "percentile", direction: "atLeast", value: "80" },
    momentum: { measure: "standardisedScore", direction: "atLeast", value: "0.00" },
  },
  hideIncomplete: true,
  symbol: "AA",
};

function universe(overrides: Partial<UniverseDetail> = {}): UniverseDetail {
  return {
    universeId: "u-9",
    name: "Tech leaders",
    lifecycle: "active",
    createdAt: "2026-10-15T17:46:00Z",
    retiredAt: null,
    memberCount: 12,
    asOf: "2026-10-15",
    asOfBeforeCreation: false,
    origin: {
      kind: "from_filter",
      setId: "s1",
      classificationDate: "2026-10-15",
      thresholds: null,
      hideIncomplete: true,
      symbol: "AA",
    },
    members: [],
    set: null,
    ...overrides,
  };
}

function refusal(code: string): ClassificationApiError {
  return new ClassificationApiError("raw envelope message", "req-1", {
    code,
    operation: "create-universe",
    resource: "universe",
  });
}

interface Props {
  query?: ResearchQuery;
  matchCount?: number;
  setId?: string | null;
  incompleteCount?: number | null;
}

/** The host as CAP-002-E4-S9 will be: it owns the notices and passes the header's values. */
function Host({ query = FILTERED, matchCount = 12, setId = "s1", incompleteCount = null }: Props) {
  const { notices, notify, dismiss } = useNotices();
  return (
    <>
      <SaveAsUniverse
        query={query}
        matchCount={matchCount}
        setId={setId}
        incompleteCount={incompleteCount}
        onNotify={notify}
      />
      <NoticeRegion notices={notices} onDismiss={dismiss} />
    </>
  );
}

/** Under `StrictMode`, as `main.tsx` renders the app, so effects run twice as in development. */
function renderHost(props: Props = {}) {
  const view = render(
    <StrictMode>
      <MemoryRouter>
        <Host {...props} />
      </MemoryRouter>
    </StrictMode>,
  );
  return {
    ...view,
    rerenderHost: (next: Props) =>
      view.rerender(
        <StrictMode>
          <MemoryRouter>
            <Host {...next} />
          </MemoryRouter>
        </StrictMode>,
      ),
  };
}

function trigger(count = 12): HTMLElement {
  return screen.getByRole("button", { name: RESULTS.saveThese(count) });
}

async function openDialog(user: ReturnType<typeof userEvent.setup>, count = 12) {
  await user.click(trigger(count));
  return screen.getByRole("dialog");
}

function nameField(): HTMLInputElement {
  return screen.getByRole("textbox", { name: DIALOGS.name }) as HTMLInputElement;
}

function noticeItems(): Element[] {
  return [...screen.getByRole("status").querySelectorAll("[data-variant='success']")];
}

/** A promise the test settles, for requests that must still be pending at an assertion. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  createUniverse.mockReset();
});

describe("SaveAsUniverse", () => {
  // Implements TC-COMP-008 (T001): DAC-E4-S8-1, DAC-E4-5, AC-5.
  describe("TC-COMP-008: Save is blocked at zero matches", () => {
    it("renders a focusable blocked control with its reason beside it", async () => {
      const user = userEvent.setup();
      renderHost({ matchCount: 0 });
      const control = trigger(0);
      expect(control).toHaveAttribute("type", "button");
      expect(control).toHaveAttribute("data-variant", "blocked");
      expect(control).toHaveAttribute("aria-disabled", "true");
      expect(control).not.toBeDisabled();
      expect(control).not.toHaveAttribute("tabindex", "-1");
      const reasonId = control.getAttribute("aria-describedby");
      expect(reasonId).toBeTruthy();
      const reason = document.getElementById(reasonId as string);
      expect(reason).toHaveTextContent(RESULTS.nothingToSave);
      expect(reason?.textContent).toBe(
        "No stocks match these filters, so there is nothing to save.",
      );
      expect(reason).toBeVisible();
      // Beside the button: the reason is its next sibling in one row.
      expect(control.nextElementSibling).toBe(reason);
      await user.tab();
      expect(control).toHaveFocus();
    });

    it("opens nothing and sends nothing by click, Enter or Space", async () => {
      const user = userEvent.setup();
      renderHost({ matchCount: 0 });
      await user.click(trigger(0));
      trigger(0).focus();
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(createUniverse).not.toHaveBeenCalled();
    });

    it("is blocked, with the same reason, while no set is on screen", async () => {
      const user = userEvent.setup();
      renderHost({ matchCount: 12, setId: null });
      const control = trigger(12);
      expect(control).toHaveAttribute("data-variant", "blocked");
      expect(control).toHaveAttribute("aria-disabled", "true");
      await user.click(control);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("is an outline control with no reason and opens the dialog above zero", async () => {
      const user = userEvent.setup();
      renderHost({ matchCount: 12 });
      const control = trigger(12);
      expect(control).toHaveAttribute("data-variant", "outline");
      expect(control).not.toHaveAttribute("aria-disabled");
      expect(control).not.toHaveAttribute("aria-describedby");
      expect(screen.queryByText(RESULTS.nothingToSave)).toBeNull();
      await user.click(control);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes an open dialog for good when the scope becomes a universe", async () => {
      const user = userEvent.setup();
      const { rerenderHost } = renderHost({ query: FILTERED });
      await openDialog(user);
      rerenderHost({ query: { ...FILTERED, scope: "u1" } });
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.queryByRole("button", { name: RESULTS.saveThese(12) })).toBeNull();
      rerenderHost({ query: FILTERED });
      expect(trigger()).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("renders nothing under a universe scope, at any count", () => {
      for (const matchCount of [0, 12]) {
        const { container, unmount } = render(
          <MemoryRouter>
            <SaveAsUniverse
              query={{ ...FILTERED, scope: "u1" }}
              matchCount={matchCount}
              setId="s1"
              incompleteCount={null}
              onNotify={vi.fn()}
            />
          </MemoryRouter>,
        );
        expect(container).toBeEmptyDOMElement();
        unmount();
      }
    });

    it("prints the count it is given, never a row count", () => {
      renderHost({ matchCount: 4321 });
      expect(trigger(4321)).toBeInTheDocument();
    });

    it("uses the theme's tokens for the control and the reason", () => {
      renderHost({ matchCount: 0 });
      const control = trigger(0);
      expect(control).toHaveClass("rounded", "border", "border-border", "px-3", "py-2");
      expect(control).toHaveClass("data-[variant=blocked]:text-muted-foreground");
      const reason = document.getElementById(control.getAttribute("aria-describedby") as string);
      expect(reason).toHaveClass("text-muted-foreground", "text-sm");
      expect(control.parentElement).toHaveClass("flex", "items-center", "gap-2");
    });
  });

  // Implements TC-COMP-009 (T002): DAC-E4-S8-2, DAC-E4-5, AC-2.
  describe("TC-COMP-009: Save under a search carries the prefix", () => {
    async function captureBody(query: ResearchQuery, setId: string) {
      const actual = await vi.importActual<typeof import("../../api/classification-client")>(
        "../../api/classification-client",
      );
      createUniverse.mockImplementation(actual.createUniverse);
      const fetchStub = vi.fn(
        async (_input: RequestInfo | URL, _init?: RequestInit) =>
          new Response(
            JSON.stringify({
              universe_id: "u-9",
              name: "Tech leaders",
              lifecycle: "active",
              created_at: "2026-10-15T17:46:00Z",
              retired_at: null,
              member_count: 12,
              as_of: "2026-10-15",
              as_of_before_creation: false,
              origin: {
                kind: "from_filter",
                set_id: setId,
                classification_date: "2026-10-15",
                thresholds: null,
                hide_incomplete: query.hideIncomplete,
                symbol: query.symbol,
              },
              members: [],
              set: null,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          ),
      );
      vi.stubGlobal("fetch", fetchStub);
      const user = userEvent.setup();
      renderHost({ query, setId });
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(fetchStub).toHaveBeenCalledTimes(1);
      const [input, init] = fetchStub.mock.calls[0] as [string, RequestInit];
      expect(input).toBe("/api/universes");
      expect(init.method).toBe("POST");
      return JSON.parse(init.body as string) as Record<string, unknown>;
    }

    it("posts the bounds, hide_incomplete, the prefix and the set on screen", async () => {
      const body = await captureBody(FILTERED, "s-42");
      expect(body).toEqual({
        name: "Tech leaders",
        filter: {
          value_percentile_min: "80",
          momentum_score_min: "0.00",
          hide_incomplete: true,
          symbol: "AA",
        },
        set_id: "s-42",
      });
      expect(body).not.toHaveProperty("symbols");
      expect(body).not.toHaveProperty("scope");
      expect(body.filter).not.toHaveProperty("universe_id");
    });

    it("posts symbol null, present, and hide_incomplete false with no search", async () => {
      const body = await captureBody({ ...FILTERED, symbol: null, hideIncomplete: false }, "s-43");
      expect(body.filter).toEqual({
        value_percentile_min: "80",
        momentum_score_min: "0.00",
        hide_incomplete: false,
        symbol: null,
      });
      expect(Object.keys(body.filter as object)).toContain("symbol");
      expect(body.set_id).toBe("s-43");
    });

    it("titles the dialog with the count and describes the filter in words", async () => {
      const user = userEvent.setup();
      renderHost({ query: FILTERED, matchCount: 12, incompleteCount: 3 });
      const dialog = await openDialog(user);
      const title = within(dialog).getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("Save these 12 stocks as a universe");
      expect(title.textContent).toBe(DIALOGS.saveTitle(12));
      const description = document.getElementById(
        dialog.getAttribute("aria-describedby") as string,
      );
      const lines = [...(description?.children ?? [])].map((line) => line.textContent);
      expect(lines).toEqual([
        "12 stocks, including 3 with an incomplete score",
        'value percentile at least 80 · momentum standardised score at least 0.00 · search "AA" · stocks with an incomplete score hidden',
      ]);
      expect(lines[1]).toBe(describeQuery(FILTERED));
    });

    it("names no search when none is active", async () => {
      const user = userEvent.setup();
      renderHost({ query: { ...FILTERED, symbol: null }, incompleteCount: 3 });
      const dialog = await openDialog(user);
      expect(dialog.textContent).not.toContain("search");
      expect(dialog).toHaveTextContent(describeQuery({ ...FILTERED, symbol: null }));
    });

    it("omits the including clause when the incomplete count is unknown or zero", async () => {
      const user = userEvent.setup();
      const { rerenderHost } = renderHost({ incompleteCount: null });
      let dialog = await openDialog(user);
      expect(dialog.textContent).not.toContain("including");
      let description = document.getElementById(dialog.getAttribute("aria-describedby") as string);
      expect([...(description?.children ?? [])].map((line) => line.textContent)).toEqual([
        describeQuery(FILTERED),
      ]);
      await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));
      rerenderHost({ incompleteCount: 0 });
      dialog = await openDialog(user);
      expect(dialog.textContent).not.toContain("including");
      description = document.getElementById(dialog.getAttribute("aria-describedby") as string);
      expect(description?.children).toHaveLength(1);
    });

    it("states the including clause for a single incomplete stock", async () => {
      const user = userEvent.setup();
      renderHost({ incompleteCount: 1 });
      const dialog = await openDialog(user);
      expect(dialog).toHaveTextContent(DIALOGS.includingIncomplete(12, 1));
    });

    it("is described by nothing when there is nothing to describe", async () => {
      const user = userEvent.setup();
      renderHost({ query: DEFAULT_RESEARCH_QUERY, matchCount: 40, incompleteCount: null });
      const dialog = await openDialog(user, 40);
      expect(dialog).not.toHaveAttribute("aria-describedby");
    });

    it("shows only the including clause when no filter is set", async () => {
      const user = userEvent.setup();
      renderHost({ query: DEFAULT_RESEARCH_QUERY, matchCount: 40, incompleteCount: 2 });
      const dialog = await openDialog(user, 40);
      const description = document.getElementById(
        dialog.getAttribute("aria-describedby") as string,
      );
      expect([...(description?.children ?? [])].map((line) => line.textContent)).toEqual([
        DIALOGS.includingIncomplete(40, 2),
      ]);
    });
  });

  // Implements TC-COMP-010 (T003): DAC-E4-S8-3, AC-2.
  describe("TC-COMP-010: 201 closes the dialog and toasts a link", () => {
    it("closes, notifies with a link to the universe and returns focus to the control", async () => {
      createUniverse.mockResolvedValue(universe());
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      const link = within(screen.getByRole("status")).getByRole("link", {
        name: "Saved 12 stocks as Tech leaders",
      });
      expect(link).toHaveAttribute("href", "/research/universes/u-9");
      expect(trigger()).toHaveFocus();
      expect(noticeItems()).toHaveLength(1);
    });

    it("reports the server's count and name, not the header's", async () => {
      createUniverse.mockResolvedValue(universe({ memberCount: 11, name: "Tech" }));
      const user = userEvent.setup();
      renderHost({ matchCount: 12 });
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      expect(await screen.findByRole("link", { name: DIALOGS.saved(11, "Tech") })).toBeVisible();
    });

    it("encodes a universe id in the link", async () => {
      createUniverse.mockResolvedValue(universe({ universeId: "a/b" }));
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      expect(await screen.findByRole("link")).toHaveAttribute("href", "/research/universes/a%2Fb");
    });
  });

  // Implements TC-COMP-011 (T004): DAC-E4-S8-4, AC-2.
  describe("TC-COMP-011: classification_set_changed replaces Save with Review new result", () => {
    it("keeps the dialog open with the sentence and swaps the confirm in place", async () => {
      createUniverse.mockRejectedValue(refusal("classification_set_changed"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      const alert = await within(dialog).findByRole("alert");
      expect(alert.textContent).toBe(DIALOGS.setChanged);
      expect(alert.textContent).toBe(
        "Could not save these stocks as a universe: the scores changed while you were reviewing them. Review the new result, then save again.",
      );
      expect(within(dialog).queryByRole("button", { name: DIALOGS.save })).toBeNull();
      const review = within(dialog).getByRole("button", { name: DIALOGS.reviewNewResult });
      const cancel = within(dialog).getByRole("button", { name: DIALOGS.cancel });
      // Same position: the last action, after Cancel, as Save was.
      expect(cancel.nextElementSibling).toBe(review);
      expect(review.nextElementSibling).toBeNull();
      expect(noticeItems()).toHaveLength(0);
      await user.click(review);
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(createUniverse).toHaveBeenCalledTimes(1);
      expect(trigger()).toHaveFocus();
    });

    it("moves focus from the removed Save to Review new result, so Escape still closes", async () => {
      createUniverse.mockRejectedValue(refusal("classification_set_changed"));
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.tab();
      await user.tab();
      expect(screen.getByRole("button", { name: DIALOGS.save })).toHaveFocus();
      await user.keyboard("{Enter}");
      const review = await screen.findByRole("button", { name: DIALOGS.reviewNewResult });
      expect(review).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(trigger()).toHaveFocus();
    });

    it("sends nothing when Enter is pressed in the field after the conflict", async () => {
      createUniverse.mockRejectedValue(refusal("classification_set_changed"));
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await screen.findByRole("button", { name: DIALOGS.reviewNewResult });
      await user.type(nameField(), "{Enter}");
      expect(createUniverse).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("alert").textContent).toBe(DIALOGS.setChanged);
    });

    it("reads the host's new count and set the next time it opens", async () => {
      createUniverse.mockRejectedValueOnce(refusal("classification_set_changed"));
      const user = userEvent.setup();
      const { rerenderHost } = renderHost({ matchCount: 12, setId: "s1" });
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await user.click(await screen.findByRole("button", { name: DIALOGS.reviewNewResult }));
      rerenderHost({ matchCount: 9, setId: "s2" });
      createUniverse.mockResolvedValueOnce(universe({ memberCount: 9 }));
      const dialog = await openDialog(user, 9);
      expect(within(dialog).getByRole("heading")).toHaveTextContent(DIALOGS.saveTitle(9));
      expect(within(dialog).queryByRole("alert")).toBeNull();
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(createUniverse).toHaveBeenLastCalledWith(
        expect.objectContaining({ setId: "s2", name: "Tech leaders" }),
      );
    });

    it("keeps the count and set it opened with while the host changes underneath", async () => {
      const pending = deferred<UniverseDetail>();
      createUniverse.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      const { rerenderHost } = renderHost({ matchCount: 12, setId: "s1" });
      const dialog = await openDialog(user);
      rerenderHost({ matchCount: 9, setId: "s2" });
      expect(within(dialog).getByRole("heading")).toHaveTextContent(DIALOGS.saveTitle(12));
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      expect(createUniverse).toHaveBeenCalledWith(expect.objectContaining({ setId: "s1" }));
      await act(async () => pending.resolve(universe()));
    });
  });

  // Implements T006: AC-2, AC-5, DAC-E4-5; DEC-0167 (Open Gap 1).
  describe("refusals, validation and request hygiene", () => {
    it("attaches universe_name_in_use to the Name field and clears it on edit", async () => {
      createUniverse.mockRejectedValue(refusal("universe_name_in_use"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      await user.type(nameField(), "Tech");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await waitFor(() => expect(nameField()).toHaveAttribute("aria-invalid", "true"));
      const errorId = nameField().getAttribute("aria-describedby") as string;
      expect(document.getElementById(errorId)?.textContent).toBe(
        failureSentence({
          operation: "create-universe",
          resource: "universe",
          code: "universe_name_in_use",
          universeName: "Tech",
        }),
      );
      expect(within(dialog).queryByRole("alert")).toBeNull();
      expect(nameField()).toHaveFocus();
      expect(createUniverse).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.type(nameField(), "s");
      expect(nameField()).not.toHaveAttribute("aria-invalid");
      expect(nameField()).not.toHaveAttribute("aria-describedby");
      expect(document.getElementById(errorId)).toBeNull();
    });

    it("treats a name empty after trimming as a field error and sends nothing", async () => {
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "   ");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      expect(nameField()).toHaveAttribute("aria-invalid", "true");
      const errorId = nameField().getAttribute("aria-describedby") as string;
      expect(document.getElementById(errorId)?.textContent).toBe(DIALOGS.enterName);
      expect(DIALOGS.enterName).toBe("Enter a name for the universe.");
      expect(nameField()).toHaveFocus();
      expect(createUniverse).not.toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("styles the field error with the critical status token", async () => {
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      const error = document.getElementById(nameField().getAttribute("aria-describedby") as string);
      expect(error).toHaveClass("text-status-critical", "text-sm");
    });

    it("sends the trimmed name, and a long name unchanged with no maximum", async () => {
      createUniverse.mockResolvedValue(universe());
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      expect(nameField()).not.toHaveAttribute("maxlength");
      await user.type(nameField(), "  Tech  ");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await waitFor(() => expect(createUniverse).toHaveBeenCalledTimes(1));
      expect(createUniverse.mock.calls[0]?.[0]).toMatchObject({ name: "Tech" });
      await openDialog(user);
      const long = "x".repeat(300);
      await user.click(nameField());
      await user.paste(long);
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await waitFor(() => expect(createUniverse).toHaveBeenCalledTimes(2));
      expect(createUniverse.mock.calls[1]?.[0]).toMatchObject({ name: long });
    });

    it.each(["empty_universe", "validation_error", "internal_error", "not_a_code"])(
      "shows the failure sentence for %s in an alert, keeping the name",
      async (code) => {
        createUniverse.mockRejectedValue(refusal(code));
        const user = userEvent.setup();
        renderHost();
        const dialog = await openDialog(user);
        await user.type(nameField(), "Tech leaders");
        await user.click(screen.getByRole("button", { name: DIALOGS.save }));
        const alert = await within(dialog).findByRole("alert");
        expect(alert.textContent).toBe(
          failureSentence({ operation: "create-universe", resource: "universe", code }),
        );
        expect(alert.textContent).not.toContain("raw envelope message");
        expect(alert.textContent).not.toContain(code);
        expect(alert).toHaveClass("text-status-critical", "text-sm");
        expect(nameField().value).toBe("Tech leaders");
        expect(nameField()).not.toHaveAttribute("aria-invalid");
        expect(within(dialog).getByRole("button", { name: DIALOGS.save })).toBeInTheDocument();
        expect(noticeItems()).toHaveLength(0);
      },
    );

    it("shows the fallback sentence for a network failure", async () => {
      createUniverse.mockRejectedValue(new ApiUnreachableError("POST /api/universes failed"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      const alert = await within(dialog).findByRole("alert");
      expect(alert.textContent).toBe(
        failureSentence({ operation: "create-universe", resource: "universe", code: null }),
      );
      expect(alert.textContent).toContain(FALLBACK_ERROR);
      expect(alert.textContent).not.toContain("failed");
    });

    it("cannot be submitted twice while a request is pending", async () => {
      const pending = deferred<UniverseDetail>();
      createUniverse.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      const save = screen.getByRole("button", { name: DIALOGS.save });
      await user.dblClick(save);
      await user.type(nameField(), "{Enter}{Enter}");
      expect(createUniverse).toHaveBeenCalledTimes(1);
      expect(dialog).toHaveAttribute("aria-busy", "true");
      expect(save).toHaveAttribute("aria-disabled", "true");
      await act(async () => pending.resolve(universe()));
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(noticeItems()).toHaveLength(1);
    });

    it("is not busy before a request, and is again after a failure", async () => {
      createUniverse.mockRejectedValueOnce(refusal("internal_error"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      expect(dialog).not.toHaveAttribute("aria-busy");
      expect(screen.getByRole("button", { name: DIALOGS.save })).not.toHaveAttribute(
        "aria-disabled",
      );
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await within(dialog).findByRole("alert");
      expect(dialog).not.toHaveAttribute("aria-busy");
    });

    it("clears the earlier failure while the next attempt is pending", async () => {
      const pending = deferred<UniverseDetail>();
      createUniverse.mockRejectedValueOnce(refusal("internal_error"));
      createUniverse.mockReturnValueOnce(pending.promise);
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await within(dialog).findByRole("alert");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      expect(within(dialog).queryByRole("alert")).toBeNull();
      await act(async () => pending.resolve(universe()));
    });

    it("saves on a second attempt after a failure, with one notice", async () => {
      createUniverse.mockRejectedValueOnce(refusal("internal_error"));
      createUniverse.mockResolvedValueOnce(universe());
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await within(dialog).findByRole("alert");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(createUniverse).toHaveBeenCalledTimes(2);
      expect(noticeItems()).toHaveLength(1);
    });

    it("drops a failure that arrives after the dialog was closed", async () => {
      const pending = deferred<UniverseDetail>();
      createUniverse.mockReturnValueOnce(pending.promise);
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));
      const reopened = await openDialog(user);
      await act(async () => pending.reject(refusal("classification_set_changed")));
      expect(within(reopened).queryByRole("alert")).toBeNull();
      expect(within(reopened).getByRole("button", { name: DIALOGS.save })).toBeInTheDocument();
      expect(reopened).not.toHaveAttribute("aria-busy");
    });

    it("reports a save that completes after the dialog was closed, without closing a reopened one", async () => {
      const pending = deferred<UniverseDetail>();
      createUniverse.mockReturnValueOnce(pending.promise);
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      await user.keyboard("{Escape}");
      const reopened = await openDialog(user);
      await act(async () => pending.resolve(universe()));
      expect(reopened).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBe(reopened);
      expect(screen.getByRole("link", { name: DIALOGS.saved(12, "Tech leaders") })).toBeVisible();
    });
  });

  // Implements T007: AC-2; the dialog frame (T012).
  describe("dialog frame", () => {
    it("is a native standard dialog labelled by its title, with initial focus on Name", async () => {
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      expect(dialog.tagName).toBe("DIALOG");
      expect(dialog).toHaveAttribute("open");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("data-variant", "standard");
      const title = within(dialog).getByRole("heading", { level: 2 });
      expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
      expect(title).toHaveClass("text-lg");
      expect(nameField()).toHaveFocus();
      expect(nameField()).toHaveAttribute("type", "text");
      expect(nameField()).toHaveClass("rounded", "border", "border-input", "p-2");
      expect(screen.getByText(DIALOGS.name, { selector: "label" })).toHaveClass("text-sm");
      expect(dialog).toHaveClass(
        "fixed",
        "inset-0",
        "m-auto",
        "flex",
        "flex-col",
        "gap-3",
        "rounded",
        "border",
        "border-border",
        "bg-background",
        "p-5",
      );
    });

    it("orders the content title, description, field, then Cancel before Save", async () => {
      const user = userEvent.setup();
      renderHost({ incompleteCount: 3 });
      const dialog = await openDialog(user);
      const title = within(dialog).getByRole("heading");
      const description = document.getElementById(
        dialog.getAttribute("aria-describedby") as string,
      ) as HTMLElement;
      const cancel = within(dialog).getByRole("button", { name: DIALOGS.cancel });
      const save = within(dialog).getByRole("button", { name: DIALOGS.save });
      const sequence = [title, description, nameField(), cancel, save];
      for (let index = 1; index < sequence.length; index += 1) {
        const before = sequence[index - 1] as HTMLElement;
        const after = sequence[index] as HTMLElement;
        expect(
          before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING,
          `${before.textContent} before ${after.textContent}`,
        ).toBeTruthy();
      }
      expect(cancel.nextElementSibling).toBe(save);
      expect(save).toHaveAttribute("type", "submit");
      expect(cancel).toHaveAttribute("type", "button");
      expect(save).toHaveClass("bg-foreground", "text-background");
      expect(cancel).toHaveClass("border", "border-border");
      expect(cancel.parentElement).toHaveClass("flex", "justify-end", "gap-2");
    });

    it("closes on Escape and on Cancel without a request, returning focus", async () => {
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(trigger()).toHaveFocus();
      await openDialog(user);
      await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(trigger()).toHaveFocus();
      expect(createUniverse).not.toHaveBeenCalled();
    });

    it("ignores other keys", async () => {
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.keyboard("a");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(nameField().value).toBe("a");
    });

    it("traps Tab inside the dialog in both directions", async () => {
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      const cancel = screen.getByRole("button", { name: DIALOGS.cancel });
      const save = screen.getByRole("button", { name: DIALOGS.save });
      expect(nameField()).toHaveFocus();
      await user.tab();
      expect(cancel).toHaveFocus();
      await user.tab();
      expect(save).toHaveFocus();
      await user.tab();
      expect(nameField()).toHaveFocus();
      await user.tab({ shift: true });
      expect(save).toHaveFocus();
      await user.tab({ shift: true });
      expect(cancel).toHaveFocus();
    });

    it("traps Tab over the controls present at the keypress, Review new result included", async () => {
      createUniverse.mockRejectedValue(refusal("classification_set_changed"));
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "Tech leaders");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      const review = await screen.findByRole("button", { name: DIALOGS.reviewNewResult });
      review.focus();
      await user.tab();
      expect(nameField()).toHaveFocus();
      await user.tab({ shift: true });
      expect(review).toHaveFocus();
    });

    it("reopens with an empty Name field and no stale error", async () => {
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.type(nameField(), "   ");
      await user.click(screen.getByRole("button", { name: DIALOGS.save }));
      expect(nameField()).toHaveAttribute("aria-invalid", "true");
      await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));
      await openDialog(user);
      expect(nameField().value).toBe("");
      expect(nameField()).not.toHaveAttribute("aria-invalid");
      expect(screen.queryByText(DIALOGS.enterName)).toBeNull();
    });
  });
});
