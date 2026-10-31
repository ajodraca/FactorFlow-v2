import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as client from "../../api/classification-client";
import { ClassificationApiError } from "../../api/classification-client";
import type {
  AddMembersResult,
  ClassificationOperation,
  UniverseDetail,
  UniverseList,
  UniverseSummary,
} from "../../api/classification-types";
import { ApiUnreachableError } from "../../api/client";
import { AddToUniverseDialog } from "./add-to-universe-dialog";
import { DIALOGS, FILTERS, UNIVERSE_LIFECYCLE, failureSentence } from "./copy";
import { NoticeRegion, useNotices } from "./notices";

vi.mock("../../api/classification-client", async () => {
  const actual = await vi.importActual<typeof import("../../api/classification-client")>(
    "../../api/classification-client",
  );
  return {
    ...actual,
    listUniverses: vi.fn(),
    addUniverseMembers: vi.fn(),
    createUniverse: vi.fn(),
  };
});

const listUniverses = vi.mocked(client.listUniverses);
const addUniverseMembers = vi.mocked(client.addUniverseMembers);
const createUniverse = vi.mocked(client.createUniverse);

const SYMBOLS = ["AAPL", "MSFT", "NVDA"];

/** The select value of *New universe*. */
const NEW_UNIVERSE_VALUE = "";

const UNIVERSES: UniverseList = {
  universes: [
    {
      universeId: "u1",
      name: "Tech",
      lifecycle: "active",
      memberCount: 3,
      createdAt: "2026-10-15T17:46:00Z",
      retiredAt: null,
    },
    {
      universeId: "u2",
      name: "Dividend growers",
      lifecycle: "active",
      memberCount: 12,
      createdAt: "2026-10-16T17:46:00Z",
      retiredAt: null,
    },
  ],
  activeCount: 2,
  retiredCount: 0,
  nextCursor: null,
};

const EMPTY: UniverseList = { universes: [], activeCount: 0, retiredCount: 0, nextCursor: null };

function created(overrides: Partial<UniverseDetail> = {}): UniverseDetail {
  return {
    universeId: "u-new",
    name: "Quality",
    lifecycle: "active",
    createdAt: "2026-10-15T17:46:00Z",
    retiredAt: null,
    memberCount: 3,
    asOf: "2026-10-15",
    asOfBeforeCreation: false,
    origin: {
      kind: "by_hand",
      setId: null,
      classificationDate: null,
      thresholds: null,
      hideIncomplete: null,
      symbol: null,
    },
    members: [],
    set: null,
    ...overrides,
  };
}

function refusal(code: string, operation: ClassificationOperation = "add-universe-members") {
  return new ClassificationApiError("raw envelope message", "req-1", {
    code,
    operation,
    resource: operation === "add-universe-members" ? "universe-member" : "universe",
  });
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

/** The host as CAP-002-E4-S9 will be: it opens the dialog from the tray and owns the notices. */
function Host({
  symbols = SYMBOLS,
  onClose,
  onNotify,
}: {
  symbols?: string[];
  onClose?: () => void;
  onNotify?: () => void;
}) {
  const { notices, notify, dismiss } = useNotices();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Add to universe…
      </button>
      {/* The host unmounting the dialog on its own, as CAP-002-E4-S9 may. */}
      <button type="button" onClick={() => setOpen(false)}>
        Host closes
      </button>
      {open ? (
        <AddToUniverseDialog
          symbols={symbols}
          onClose={() => {
            onClose?.();
            setOpen(false);
          }}
          onNotify={(notice) => {
            onNotify?.();
            notify(notice);
          }}
        />
      ) : null}
      <NoticeRegion notices={notices} onDismiss={dismiss} />
    </>
  );
}

function renderHost(props: Parameters<typeof Host>[0] = {}, strict = false) {
  const tree = (
    <MemoryRouter>
      <Host {...props} />
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add to universe…" }));
  return screen.getByRole("dialog");
}

/** Opens the dialog and waits for the universe list to replace its skeleton. */
async function openLoaded(user: ReturnType<typeof userEvent.setup>) {
  const dialog = await openDialog(user);
  await within(dialog).findByRole("combobox", { name: DIALOGS.universe });
  return dialog;
}

function select(): HTMLSelectElement {
  return screen.getByRole("combobox", { name: DIALOGS.universe }) as HTMLSelectElement;
}

function nameField(): HTMLInputElement {
  return screen.getByRole("textbox", { name: DIALOGS.name }) as HTMLInputElement;
}

function addButton(): HTMLElement {
  return screen.getByRole("button", { name: DIALOGS.add });
}

function noticeItems(): Element[] {
  return [...screen.getByRole("status").querySelectorAll("[data-variant='success']")];
}

beforeEach(() => {
  listUniverses.mockReset();
  addUniverseMembers.mockReset();
  createUniverse.mockReset();
  listUniverses.mockResolvedValue(UNIVERSES);
});

describe("AddToUniverseDialog", () => {
  // Implements TC-COMP-033 (T005): DAC-E4-S8-5, AC-5.
  describe("TC-COMP-033: Add toasts with the already-member clause; universe_retired wording", () => {
    it("adds to the chosen universe, closes and toasts with a link and no clause", async () => {
      addUniverseMembers.mockResolvedValue({ added: SYMBOLS, alreadyMember: [] });
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.click(addButton());
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(addUniverseMembers).toHaveBeenCalledWith("u1", SYMBOLS);
      const link = within(screen.getByRole("status")).getByRole("link");
      expect(link.textContent).toBe("Added 3 stocks to Tech");
      expect(link).toHaveAttribute("href", "/research/universes/u1");
    });

    it("appends the already-member clause, counted from the response", async () => {
      addUniverseMembers.mockResolvedValue({ added: ["AAPL", "MSFT"], alreadyMember: ["NVDA"] });
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.click(addButton());
      const link = await screen.findByRole("link");
      expect(link.textContent).toBe("Added 2 stocks to Tech, and 1 were already members");
      expect(link.textContent).toBe(DIALOGS.added(2, "Tech", 1));
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("names the universe chosen, with its own link", async () => {
      addUniverseMembers.mockResolvedValue({ added: ["AAPL"], alreadyMember: ["MSFT", "NVDA"] });
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.selectOptions(select(), "u2");
      await user.click(addButton());
      const link = await screen.findByRole("link");
      expect(link.textContent).toBe(DIALOGS.added(1, "Dividend growers", 2));
      expect(link).toHaveAttribute("href", "/research/universes/u2");
      expect(addUniverseMembers).toHaveBeenCalledWith("u2", SYMBOLS);
    });

    it("shows the universe_retired sentence in an alert and keeps Add available", async () => {
      addUniverseMembers.mockRejectedValue(refusal("universe_retired"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.click(addButton());
      const alert = await within(dialog).findByRole("alert");
      expect(alert.textContent).toBe(
        "This universe is retired and can't be changed. Its members and history are still viewable.",
      );
      expect(alert.textContent).toBe(UNIVERSE_LIFECYCLE.retiredRefusal);
      expect(alert).toHaveClass("text-[hsl(var(--destructive))]", "text-sm");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(addButton()).not.toHaveAttribute("aria-disabled");
      expect(noticeItems()).toHaveLength(0);
      addUniverseMembers.mockResolvedValueOnce({ added: SYMBOLS, alreadyMember: [] });
      await user.selectOptions(select(), "u2");
      await user.click(addButton());
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(noticeItems()).toHaveLength(1);
    });
  });

  // Implements T008: AC-5, DAC-E4-S8-5; DEC-0169 (Open Gap 3).
  describe("states and routes", () => {
    it("titles the dialog with the count and reads the active universes once", async () => {
      const user = userEvent.setup();
      const view = renderHost();
      const dialog = await openLoaded(user);
      expect(within(dialog).getByRole("heading", { level: 2 }).textContent).toBe(
        "Add 3 stocks to a universe",
      );
      expect(listUniverses).toHaveBeenCalledTimes(1);
      expect(listUniverses).toHaveBeenCalledWith({ lifecycle: "active", limit: 500 });
      view.rerender(
        <MemoryRouter>
          <Host />
        </MemoryRouter>,
      );
      expect(listUniverses).toHaveBeenCalledTimes(1);
    });

    it("shows a status skeleton in the select's place while the list loads, with Add unavailable", async () => {
      const pending = deferred<UniverseList>();
      listUniverses.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      const skeleton = within(dialog).getByRole("status");
      expect(skeleton).toHaveTextContent(FILTERS.loadingUniverses);
      expect(skeleton).toHaveClass(
        "animate-pulse",
        "rounded",
        "border",
        "border-input",
        "px-2",
        "py-1",
      );
      expect(within(dialog).queryByRole("combobox")).toBeNull();
      // The choice is New universe until the list arrives, but its Name field is not shown.
      expect(within(dialog).queryByRole("textbox")).toBeNull();
      const label = within(dialog).getByText(DIALOGS.universe);
      expect(label.nextElementSibling).toBe(skeleton);
      expect(label).toHaveClass("text-sm");
      expect(addButton()).toHaveAttribute("aria-disabled", "true");
      await user.click(addButton());
      expect(addUniverseMembers).not.toHaveBeenCalled();
      expect(createUniverse).not.toHaveBeenCalled();
      await act(async () => pending.resolve(UNIVERSES));
      // The select takes the skeleton's place, with the same box.
      const loaded = select();
      expect(label.nextElementSibling).toBe(loaded);
      expect(loaded).toHaveClass("rounded", "border", "border-input", "px-2", "py-1");
      expect(addButton()).not.toHaveAttribute("aria-disabled");
      expect(within(dialog).queryByRole("textbox")).toBeNull();
    });

    it("shows no Name field while the list loads, even when it arrives empty", async () => {
      const pending = deferred<UniverseList>();
      listUniverses.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      expect(within(dialog).queryByRole("textbox")).toBeNull();
      expect(within(dialog).queryByText(DIALOGS.name)).toBeNull();
      await act(async () => pending.resolve(EMPTY));
      expect(nameField()).toHaveFocus();
    });

    it("leaves no stale field error from an Add pressed while the list loaded", async () => {
      const pending = deferred<UniverseList>();
      listUniverses.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      await user.click(addButton());
      await act(async () => pending.resolve(EMPTY));
      expect(nameField()).not.toHaveAttribute("aria-invalid");
      expect(screen.queryByText(DIALOGS.enterName)).toBeNull();
    });

    it("lists the universes in the API's order then New universe, first chosen and focused", async () => {
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      const options = within(select()).getAllByRole("option");
      expect(options.map((option) => option.textContent)).toEqual([
        "Tech",
        "Dividend growers",
        DIALOGS.newUniverseOption,
      ]);
      expect(select()).toHaveAttribute("data-variant", "default");
      expect(select().value).toBe("u1");
      expect(select()).toHaveFocus();
      expect(screen.queryByRole("textbox", { name: DIALOGS.name })).toBeNull();
    });

    it("reveals the Name field for New universe, keeping focus on the select, and hides it again", async () => {
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      expect(nameField()).toBeInTheDocument();
      expect(nameField()).not.toHaveAttribute("maxlength");
      expect(nameField()).toHaveClass(
        "rounded",
        "border",
        "border-input",
        "p-2",
        "aria-[invalid=true]:border-[hsl(var(--destructive))]",
      );
      expect(select()).toHaveFocus();
      // The Name field follows the select.
      expect(
        select().compareDocumentPosition(nameField()) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      await user.selectOptions(select(), "u2");
      expect(screen.queryByRole("textbox", { name: DIALOGS.name })).toBeNull();
    });

    it("starts on New universe with the Name field focused when there are no universes", async () => {
      listUniverses.mockResolvedValue(EMPTY);
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      expect(
        within(select())
          .getAllByRole("option")
          .map((o) => o.textContent),
      ).toEqual([DIALOGS.newUniverseOption]);
      expect(nameField()).toHaveFocus();
    });

    it("creates a universe by hand for New universe and toasts with no clause", async () => {
      createUniverse.mockResolvedValue(created());
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.type(nameField(), "  Quality  ");
      await user.click(addButton());
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(createUniverse).toHaveBeenCalledTimes(1);
      expect(createUniverse).toHaveBeenCalledWith({ name: "Quality", symbols: SYMBOLS });
      expect(addUniverseMembers).not.toHaveBeenCalled();
      const link = await screen.findByRole("link");
      expect(link.textContent).toBe("Added 3 stocks to Quality");
      expect(link).toHaveAttribute("href", "/research/universes/u-new");
    });

    it("reports the created universe's own count and name", async () => {
      createUniverse.mockResolvedValue(created({ memberCount: 2, name: "Quality picks" }));
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.type(nameField(), "Quality");
      await user.click(addButton());
      expect((await screen.findByRole("link")).textContent).toBe(
        DIALOGS.added(2, "Quality picks", 0),
      );
    });

    it("makes an empty New-universe name a field error with no request", async () => {
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.type(nameField(), "   ");
      await user.click(addButton());
      expect(nameField()).toHaveAttribute("aria-invalid", "true");
      const error = document.getElementById(nameField().getAttribute("aria-describedby") as string);
      expect(error?.textContent).toBe(DIALOGS.enterName);
      expect(error).toHaveClass("text-[hsl(var(--destructive))]", "text-sm");
      expect(nameField()).toHaveFocus();
      expect(createUniverse).not.toHaveBeenCalled();
      await user.type(nameField(), "Q");
      expect(nameField()).not.toHaveAttribute("aria-invalid");
      expect(nameField()).not.toHaveAttribute("aria-describedby");
    });

    it("attaches universe_name_in_use to the Name field", async () => {
      createUniverse.mockRejectedValue(refusal("universe_name_in_use", "create-universe"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.type(nameField(), "Tech");
      await user.click(addButton());
      await waitFor(() => expect(nameField()).toHaveAttribute("aria-invalid", "true"));
      const error = document.getElementById(nameField().getAttribute("aria-describedby") as string);
      expect(error?.textContent).toBe(
        failureSentence({
          operation: "create-universe",
          resource: "universe",
          code: "universe_name_in_use",
          universeName: "Tech",
        }),
      );
      expect(nameField()).toHaveFocus();
      expect(within(dialog).queryByRole("alert")).toBeNull();
    });

    it.each(["not_a_member", "internal_error", "not_a_code"])(
      "shows the failure sentence for %s in an alert, never the envelope message",
      async (code) => {
        addUniverseMembers.mockRejectedValue(refusal(code));
        const user = userEvent.setup();
        renderHost();
        const dialog = await openLoaded(user);
        await user.click(addButton());
        const alert = await within(dialog).findByRole("alert");
        expect(alert.textContent).toBe(
          failureSentence({ operation: "add-universe-members", resource: "universe-member", code }),
        );
        expect(alert.textContent).not.toContain("raw envelope message");
      },
    );

    it("shows the create failure sentence for a New universe refusal", async () => {
      createUniverse.mockRejectedValue(refusal("validation_error", "create-universe"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.type(nameField(), "Quality");
      await user.click(addButton());
      expect((await within(dialog).findByRole("alert")).textContent).toBe(
        failureSentence({
          operation: "create-universe",
          resource: "universe",
          code: "validation_error",
        }),
      );
      expect(nameField()).not.toHaveAttribute("aria-invalid");
    });

    it("shows the operation's fallback for a network failure", async () => {
      addUniverseMembers.mockRejectedValue(new ApiUnreachableError("POST failed"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.click(addButton());
      expect((await within(dialog).findByRole("alert")).textContent).toBe(
        failureSentence({
          operation: "add-universe-members",
          resource: "universe-member",
          code: null,
        }),
      );
    });

    it("shows the create fallback for a network failure on New universe", async () => {
      createUniverse.mockRejectedValue(new ApiUnreachableError("POST failed"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.type(nameField(), "Quality");
      await user.click(addButton());
      expect((await within(dialog).findByRole("alert")).textContent).toBe(
        failureSentence({ operation: "create-universe", resource: "universe", code: null }),
      );
    });

    it("replaces the select with the list failure, leaving Cancel working and Add unavailable", async () => {
      listUniverses.mockRejectedValue(refusal("internal_error", "list-universes"));
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderHost({ onClose });
      const dialog = await openDialog(user);
      const alert = await within(dialog).findByRole("alert");
      expect(alert.textContent).toBe(
        failureSentence({
          operation: "list-universes",
          resource: "universe",
          code: "internal_error",
        }),
      );
      expect(alert).toHaveClass("text-[hsl(var(--destructive))]", "text-sm");
      expect(within(dialog).queryByRole("combobox")).toBeNull();
      expect(within(dialog).queryByRole("status")).toBeNull();
      expect(addButton()).toHaveAttribute("aria-disabled", "true");
      await user.click(addButton());
      expect(addUniverseMembers).not.toHaveBeenCalled();
      expect(createUniverse).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("shows the list fallback when the list read cannot reach the API", async () => {
      listUniverses.mockRejectedValue(new ApiUnreachableError("GET failed"));
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      expect((await within(dialog).findByRole("alert")).textContent).toBe(
        failureSentence({ operation: "list-universes", resource: "universe", code: null }),
      );
    });

    it("drops the first of StrictMode's two list reads when it arrives last", async () => {
      const first = deferred<UniverseList>();
      const second = deferred<UniverseList>();
      listUniverses.mockReturnValueOnce(first.promise);
      listUniverses.mockReturnValueOnce(second.promise);
      const user = userEvent.setup();
      renderHost({}, true);
      await openDialog(user);
      expect(listUniverses).toHaveBeenCalledTimes(2);
      await act(async () => second.resolve(UNIVERSES));
      await user.selectOptions(select(), "u2");
      await act(async () =>
        first.resolve({
          ...EMPTY,
          universes: [
            { ...(UNIVERSES.universes[0] as UniverseSummary), universeId: "u9", name: "Stale" },
          ],
        }),
      );
      expect(select().value).toBe("u2");
      expect(
        within(select())
          .getAllByRole("option")
          .map((o) => o.textContent),
      ).toEqual(["Tech", "Dividend growers", DIALOGS.newUniverseOption]);
    });

    it("labels the skeleton while loading, as it labels the select once loaded", async () => {
      const pending = deferred<UniverseList>();
      listUniverses.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      const dialog = await openDialog(user);
      const label = within(dialog).getByText(DIALOGS.universe);
      expect(document.getElementById(label.getAttribute("for") as string)).toBe(
        within(dialog).getByRole("status"),
      );
      await act(async () => pending.resolve(UNIVERSES));
      expect(document.getElementById(label.getAttribute("for") as string)).toBe(select());
    });

    it("leaves focus where the owner moved it while the list loaded", async () => {
      const pending = deferred<UniverseList>();
      listUniverses.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      expect(screen.getByRole("button", { name: DIALOGS.cancel })).toHaveFocus();
      await user.tab();
      expect(addButton()).toHaveFocus();
      await act(async () => pending.resolve(UNIVERSES));
      expect(addButton()).toHaveFocus();
    });

    it("keeps the choice fixed while a request is pending", async () => {
      const pending = deferred<UniverseDetail>();
      createUniverse.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.type(nameField(), "Tech");
      await user.click(addButton());
      await user.selectOptions(select(), "u2");
      expect(select().value).toBe(NEW_UNIVERSE_VALUE);
      await act(async () => pending.reject(refusal("universe_name_in_use", "create-universe")));
      await waitFor(() => expect(nameField()).toHaveAttribute("aria-invalid", "true"));
      expect(nameField()).toHaveFocus();
    });

    it("closes on Escape and on Cancel without a request, returning focus to the opener", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderHost({ onClose });
      await openLoaded(user);
      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("button", { name: "Add to universe…" })).toHaveFocus();
      await openLoaded(user);
      await user.click(screen.getByRole("button", { name: DIALOGS.cancel }));
      expect(onClose).toHaveBeenCalledTimes(2);
      expect(addUniverseMembers).not.toHaveBeenCalled();
      expect(createUniverse).not.toHaveBeenCalled();
    });

    it("traps Tab inside the dialog in both directions, the select included", async () => {
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      const cancel = within(dialog).getByRole("button", { name: DIALOGS.cancel });
      expect(select()).toHaveFocus();
      await user.tab({ shift: true });
      expect(addButton()).toHaveFocus();
      await user.tab();
      expect(select()).toHaveFocus();
      await user.tab();
      expect(cancel).toHaveFocus();
      await user.tab();
      expect(addButton()).toHaveFocus();
      await user.tab();
      expect(select()).toHaveFocus();
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      await user.tab();
      expect(nameField()).toHaveFocus();
      await user.tab({ shift: true });
      await user.tab({ shift: true });
      expect(addButton()).toHaveFocus();
    });

    // DEC-0259; dialog spec section 4: never close the dialog before the result is known.
    it("stays open on Escape, Cancel and the overlay while a request is pending", async () => {
      const pending = deferred<AddMembersResult>();
      addUniverseMembers.mockReturnValue(pending.promise);
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderHost({ onClose });
      const dialog = await openLoaded(user);
      const cancel = within(dialog).getByRole("button", { name: DIALOGS.cancel });
      await user.click(addButton());
      expect(cancel).toHaveAttribute("aria-disabled", "true");
      expect(cancel).toHaveClass("aria-disabled:text-muted-foreground");
      await user.keyboard("{Escape}");
      await user.click(cancel);
      await user.click(dialog.previousElementSibling as HTMLElement);
      expect(screen.getByRole("dialog")).toBe(dialog);
      // A click on the overlay never takes focus out of the dialog.
      expect(cancel).toHaveFocus();
      expect(onClose).not.toHaveBeenCalled();
      await act(async () => pending.reject(refusal("universe_retired")));
      expect(within(dialog).getByRole("alert").textContent).toBe(
        failureSentence({
          operation: "add-universe-members",
          resource: "universe-member",
          code: "universe_retired",
        }),
      );
      expect(cancel).not.toHaveAttribute("aria-disabled");
      await user.click(cancel);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    // DEC-0259; button spec section 4 (Loading) and dialog spec section 4 (Submitting).
    it("shows progress in place on Add while a request is pending, keeping its label", async () => {
      const pending = deferred<AddMembersResult>();
      addUniverseMembers.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      await openLoaded(user);
      const progress = () => addButton().querySelector("[aria-hidden='true']");
      expect(progress()).toHaveClass(
        "invisible",
        "motion-safe:animate-spin",
        "size-4",
        "rounded-[var(--radius)]",
      );
      expect(addButton()).toHaveClass("inline-flex", "items-center", "gap-2");
      expect(addButton()).not.toHaveAttribute("data-pending");
      await user.click(addButton());
      expect(progress()).not.toHaveClass("invisible");
      expect(progress()).toHaveClass("motion-safe:animate-spin", "size-4");
      expect(addButton()).toHaveAttribute("data-pending", "true");
      expect(addButton()).toHaveAttribute("aria-busy", "true");
      expect(addButton().textContent).toBe(DIALOGS.add);
      await act(async () => pending.reject(refusal("internal_error")));
      expect(progress()).toHaveClass("invisible");
      expect(addButton()).not.toHaveAttribute("data-pending");
      expect(addButton()).not.toHaveAttribute("aria-busy");
    });

    it("shows no progress on Add while the list loads", async () => {
      const pending = deferred<UniverseList>();
      listUniverses.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      await openDialog(user);
      expect(addButton()).toHaveAttribute("aria-disabled", "true");
      expect(addButton().querySelector("[aria-hidden='true']")).toHaveClass("invisible");
      expect(addButton()).not.toHaveAttribute("data-pending");
      expect(addButton()).not.toHaveAttribute("aria-busy");
      expect(screen.getByRole("button", { name: DIALOGS.cancel })).not.toHaveAttribute(
        "aria-disabled",
      );
      await act(async () => pending.resolve(UNIVERSES));
    });

    it("cannot be submitted twice while a request is pending", async () => {
      const pending = deferred<AddMembersResult>();
      addUniverseMembers.mockReturnValue(pending.promise);
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.dblClick(addButton());
      expect(addUniverseMembers).toHaveBeenCalledTimes(1);
      expect(dialog).toHaveAttribute("aria-busy", "true");
      expect(addButton()).toHaveAttribute("aria-disabled", "true");
      await act(async () => pending.resolve({ added: SYMBOLS, alreadyMember: [] }));
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("loads, adds and closes under StrictMode, as main.tsx renders it", async () => {
      addUniverseMembers.mockResolvedValue({ added: SYMBOLS, alreadyMember: [] });
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderHost({ onClose }, true);
      await openLoaded(user);
      expect(select().value).toBe("u1");
      await user.click(addButton());
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(noticeItems()).toHaveLength(1);
    });

    it("notifies once, then closes once, on success", async () => {
      addUniverseMembers.mockResolvedValue({ added: SYMBOLS, alreadyMember: [] });
      const order: string[] = [];
      const user = userEvent.setup();
      renderHost({ onNotify: () => order.push("notify"), onClose: () => order.push("close") });
      await openLoaded(user);
      await user.click(addButton());
      await waitFor(() => expect(order).toEqual(["notify", "close"]));
    });

    it("clears an earlier failure when the next attempt starts", async () => {
      const pending = deferred<AddMembersResult>();
      addUniverseMembers.mockRejectedValueOnce(refusal("internal_error"));
      addUniverseMembers.mockReturnValueOnce(pending.promise);
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.click(addButton());
      await within(dialog).findByRole("alert");
      expect(dialog).not.toHaveAttribute("aria-busy");
      await user.click(addButton());
      expect(within(dialog).queryByRole("alert")).toBeNull();
      await act(async () => pending.resolve({ added: SYMBOLS, alreadyMember: [] }));
    });

    it("reports an add that completes after the host closed it, without closing a reopened dialog", async () => {
      const pending = deferred<AddMembersResult>();
      addUniverseMembers.mockReturnValueOnce(pending.promise);
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderHost({ onClose });
      await openLoaded(user);
      await user.click(addButton());
      await user.click(screen.getByRole("button", { name: "Host closes" }));
      expect(screen.queryByRole("dialog")).toBeNull();
      const reopened = await openLoaded(user);
      await act(async () => pending.resolve({ added: SYMBOLS, alreadyMember: [] }));
      expect(screen.getByRole("dialog")).toBe(reopened);
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole("link").textContent).toBe(DIALOGS.added(3, "Tech", 0));
    });

    it("sends the symbols it opened with, and orders Cancel before Add", async () => {
      addUniverseMembers.mockResolvedValue({ added: ["AAPL"], alreadyMember: [] });
      const user = userEvent.setup();
      renderHost({ symbols: ["AAPL"] });
      const dialog = await openLoaded(user);
      expect(within(dialog).getByRole("heading").textContent).toBe(DIALOGS.addTitle(1));
      const cancel = within(dialog).getByRole("button", { name: DIALOGS.cancel });
      expect(cancel.nextElementSibling).toBe(addButton());
      expect(addButton()).toHaveAttribute("type", "submit");
      expect(addButton()).toHaveClass(
        "bg-[hsl(var(--primary))]",
        "text-[hsl(var(--primary-foreground))]",
      );
      expect(cancel).toHaveClass("border", "border-input");
      expect(cancel.parentElement).toHaveClass("flex", "justify-end", "gap-2");
      expect(dialog).toHaveAttribute("data-variant", "standard");
      await user.click(addButton());
      await waitFor(() => expect(addUniverseMembers).toHaveBeenCalledWith("u1", ["AAPL"]));
    });

    it("keeps the symbols it opened with when the host's checked rows change", async () => {
      addUniverseMembers.mockResolvedValue({ added: SYMBOLS, alreadyMember: [] });
      const user = userEvent.setup();
      const view = renderHost({ symbols: SYMBOLS });
      const dialog = await openLoaded(user);
      view.rerender(
        <MemoryRouter>
          <Host symbols={["TSLA"]} />
        </MemoryRouter>,
      );
      expect(within(dialog).getByRole("heading").textContent).toBe(DIALOGS.addTitle(3));
      await user.click(addButton());
      await waitFor(() => expect(addUniverseMembers).toHaveBeenCalledWith("u1", SYMBOLS));
    });

    it("orders the title, the universe field and the actions", async () => {
      const user = userEvent.setup();
      renderHost();
      const dialog = await openLoaded(user);
      await user.selectOptions(select(), DIALOGS.newUniverseOption);
      const sequence = [
        within(dialog).getByRole("heading"),
        within(dialog).getByText(DIALOGS.universe),
        select(),
        nameField(),
        within(dialog).getByRole("button", { name: DIALOGS.cancel }),
        addButton(),
      ];
      for (let index = 1; index < sequence.length; index += 1) {
        expect(
          (sequence[index - 1] as HTMLElement).compareDocumentPosition(
            sequence[index] as HTMLElement,
          ) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      }
    });
  });
});
