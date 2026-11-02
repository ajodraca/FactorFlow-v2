import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ClassificationApiError } from "../../../../api/classification-client";
import type { UniverseOrigin } from "../../../../api/classification-types";
import { type HeaderUniverse, SummaryHeader, type SummaryHeaderProps } from "./summary-header";

const BY_HAND: UniverseOrigin = {
  kind: "by_hand",
  setId: null,
  classificationDate: null,
  thresholds: null,
  hideIncomplete: null,
  symbol: null,
};

const FROM_FILTER: UniverseOrigin = {
  kind: "from_filter",
  setId: "s-1",
  classificationDate: "2026-10-15",
  thresholds: { value_percentile_min: "80" },
  hideIncomplete: true,
  symbol: "AA",
};

const ACTIVE: HeaderUniverse = {
  name: "Tech",
  lifecycle: "active",
  createdAt: "2026-10-15T22:46:00Z",
  retiredAt: null,
  memberCount: 12,
  origin: BY_HAND,
};

const RETIRED: HeaderUniverse = {
  ...ACTIVE,
  lifecycle: "retired",
  retiredAt: "2026-10-16T05:00:00Z",
};

const RETIRED_REFUSAL =
  "This universe is retired and can't be changed. Its members and history are still viewable.";
const GENERIC = "Could not rename the universe: FactorFlow hit an unexpected problem. Try again.";
const EMPTY_NAME = "Enter a name for the universe.";

function apiError(code: string): ClassificationApiError {
  return new ClassificationApiError("refused", "req-1", {
    code,
    operation: "rename-universe",
    resource: "universe",
  });
}

function renderHeader(overrides: Partial<SummaryHeaderProps> = {}) {
  const props: SummaryHeaderProps = {
    universe: ACTIVE,
    onRename: vi.fn().mockResolvedValue(undefined),
    onAddStocks: vi.fn(),
    onRetire: vi.fn(),
    ...overrides,
  };
  const view = render(
    <MemoryRouter>
      <SummaryHeader {...props} />
    </MemoryRouter>,
  );
  function rerenderWith(next: Partial<SummaryHeaderProps>): void {
    view.rerender(
      <MemoryRouter>
        <SummaryHeader {...props} {...next} />
      </MemoryRouter>,
    );
  }
  return { props, rerenderWith, ...view };
}

function nameControl(name = "Tech"): HTMLElement {
  return within(screen.getByRole("heading", { level: 1 })).getByRole("button", { name });
}

function nameField(): HTMLInputElement {
  return screen.getByRole("textbox", { name: "Universe name" }) as HTMLInputElement;
}

async function startEditing(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(nameControl());
}

// Implements TC-COMP-030 (T002): DAC-E1-S9-1, DAC-E1-4, AC-4.
describe("TC-COMP-030: inline rename", () => {
  it("activating the name opens the Universe name field holding the name, selected and focused", async () => {
    const user = userEvent.setup();
    renderHeader();
    await startEditing(user);
    const field = nameField();
    expect(field.value).toBe("Tech");
    expect(field).toHaveFocus();
    expect(field.selectionStart).toBe(0);
    expect(field.selectionEnd).toBe(4);
  });

  it("Enter sends the rename once with the typed name", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await startEditing(user);
    await user.keyboard("Tech and Dividend growers{Enter}");
    expect(props.onRename).toHaveBeenCalledTimes(1);
    expect(props.onRename).toHaveBeenCalledWith("Tech and Dividend growers");
  });

  it("shows a secondary Rename only while editing, which submits the same way", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    expect(screen.queryByRole("button", { name: "Rename" })).toBeNull();
    await startEditing(user);
    const rename = screen.getByRole("button", { name: "Rename" });
    expect(rename).toHaveAttribute("data-variant", "secondary");
    await user.keyboard("Growth");
    await user.click(rename);
    expect(props.onRename).toHaveBeenCalledTimes(1);
    expect(props.onRename).toHaveBeenCalledWith("Growth");
  });

  it("Escape closes the field, restores the name, sends nothing and returns focus to the name", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await startEditing(user);
    await user.keyboard("Growth{Escape}");
    expect(screen.queryByRole("textbox", { name: "Universe name" })).toBeNull();
    expect(nameControl()).toHaveFocus();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Tech$/);
    expect(props.onRename).not.toHaveBeenCalled();
  });

  it("keeps the field open with the name-in-use error, described and invalid, focus in the field", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader({
      onRename: vi.fn().mockRejectedValue(apiError("universe_name_in_use")),
    });
    await startEditing(user);
    await user.keyboard("Tech and Dividend growers{Enter}");
    const field = nameField();
    expect(props.onRename).toHaveBeenCalledTimes(1);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(
      "Another active universe is already named Tech and Dividend growers.",
    );
    expect(field).toHaveFocus();
    expect(field.value).toBe("Tech and Dividend growers");
  });

  it("refuses an empty name as a field error without a request", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await startEditing(user);
    await user.keyboard("{Backspace}{Enter}");
    expect(nameField()).toHaveAttribute("aria-invalid", "true");
    expect(nameField()).toHaveAccessibleDescription(EMPTY_NAME);
    expect(props.onRename).not.toHaveBeenCalled();
  });

  it("refuses a whitespace-only name as a field error without a request", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await startEditing(user);
    await user.keyboard("   {Enter}");
    expect(nameField()).toHaveAccessibleDescription(EMPTY_NAME);
    expect(props.onRename).not.toHaveBeenCalled();
  });
});

// T003 (a) to (g): trimming, the other refusals, pending, the header's content and plain text.
describe("SummaryHeader", () => {
  it("closes without a request when the trimmed value equals the current name", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await startEditing(user);
    await user.keyboard("  Tech  {Enter}");
    expect(screen.queryByRole("textbox", { name: "Universe name" })).toBeNull();
    expect(props.onRename).not.toHaveBeenCalled();
    expect(nameControl()).toHaveFocus();
  });

  it("trims surrounding spaces before sending", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await startEditing(user);
    await user.keyboard("  Growth  {Enter}");
    expect(props.onRename).toHaveBeenCalledWith("Growth");
  });

  it("names the trimmed name in the name-in-use error", async () => {
    const user = userEvent.setup();
    renderHeader({ onRename: vi.fn().mockRejectedValue(apiError("universe_name_in_use")) });
    await startEditing(user);
    await user.keyboard("  Growth  {Enter}");
    expect(nameField()).toHaveAccessibleDescription(
      "Another active universe is already named Growth.",
    );
  });

  it("closes the field and returns focus to the name after the rename resolves", async () => {
    const user = userEvent.setup();
    renderHeader();
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    expect(screen.queryByRole("textbox", { name: "Universe name" })).toBeNull();
    expect(nameControl()).toHaveFocus();
  });

  it("states universe_retired as the field error", async () => {
    const user = userEvent.setup();
    renderHeader({ onRename: vi.fn().mockRejectedValue(apiError("universe_retired")) });
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    expect(nameField()).toHaveAccessibleDescription(RETIRED_REFUSAL);
    expect(nameField()).toHaveAttribute("aria-invalid", "true");
  });

  it("states any other failure with the generic sentence and keeps the typed value", async () => {
    const user = userEvent.setup();
    renderHeader({ onRename: vi.fn().mockRejectedValue(apiError("internal_error")) });
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    expect(nameField()).toHaveAccessibleDescription(GENERIC);
    expect(nameField().value).toBe("Growth");
  });

  it("states a failure that is not a client error with the generic sentence", async () => {
    const user = userEvent.setup();
    renderHeader({ onRename: vi.fn().mockRejectedValue(new Error("boom")) });
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    expect(nameField()).toHaveAccessibleDescription(GENERIC);
  });

  it("clears the field error once the value is edited", async () => {
    const user = userEvent.setup();
    renderHeader();
    await startEditing(user);
    await user.keyboard("{Backspace}{Enter}");
    await user.keyboard("G");
    expect(nameField()).not.toHaveAttribute("aria-invalid");
    expect(nameField()).not.toHaveAttribute("aria-describedby");
  });

  it("natively disables Rename while the rename is pending, and a second Enter sends nothing", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn(() => new Promise<void>(() => {}));
    renderHeader({ onRename });
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    expect(screen.getByRole("button", { name: "Rename" })).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  it("makes the name the page's only h1", () => {
    renderHeader();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Tech$/);
  });

  it("keeps the name as the h1 while editing, as text with no control in it", async () => {
    const user = userEvent.setup();
    renderHeader();
    await startEditing(user);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(heading).toHaveTextContent(/^Tech$/);
    expect(within(heading).queryByRole("button")).toBeNull();
  });

  it("Escape from the Rename button also cancels", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await startEditing(user);
    await user.keyboard("Growth");
    screen.getByRole("button", { name: "Rename" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("textbox", { name: "Universe name" })).toBeNull();
    expect(props.onRename).not.toHaveBeenCalled();
  });

  it("ignores Escape while the rename is pending", async () => {
    const user = userEvent.setup();
    renderHeader({ onRename: vi.fn(() => new Promise<void>(() => {})) });
    await startEditing(user);
    await user.keyboard("Growth{Enter}{Escape}");
    expect(nameField()).toBeInTheDocument();
  });

  it("moves focus from Rename to the field while the rename is pending", async () => {
    const user = userEvent.setup();
    renderHeader({ onRename: vi.fn(() => new Promise<void>(() => {})) });
    await startEditing(user);
    await user.keyboard("Growth");
    await user.click(screen.getByRole("button", { name: "Rename" }));
    expect(nameField()).toHaveFocus();
  });

  it("drops the field, shows the name and focuses the heading when the universe is retired meanwhile", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderHeader({
      onRename: vi.fn().mockRejectedValue(apiError("universe_retired")),
    });
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    rerenderWith({ universe: RETIRED });
    expect(screen.queryByRole("textbox", { name: "Universe name" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Rename" })).toBeNull();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).not.toHaveClass("sr-only");
    expect(heading).toHaveFocus();
  });

  it("leaves focus where the owner moved it while the rename was pending when it is refused", async () => {
    const user = userEvent.setup();
    let reject: (reason: unknown) => void = () => {};
    const onRename = vi.fn(
      () =>
        new Promise<void>((_, rejectRename) => {
          reject = rejectRename;
        }),
    );
    renderHeader({ onRename });
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    nameField().blur();
    await act(async () => reject(apiError("universe_name_in_use")));
    expect(nameField()).toHaveAttribute("aria-invalid", "true");
    expect(document.body).toHaveFocus();
  });

  it("moves no focus when it mounts", () => {
    renderHeader();
    expect(document.body).toHaveFocus();
  });

  it("returns focus to the field when a rename sent with Rename is refused", async () => {
    const user = userEvent.setup();
    renderHeader({ onRename: vi.fn().mockRejectedValue(apiError("universe_name_in_use")) });
    await startEditing(user);
    await user.keyboard("Growth");
    await user.click(screen.getByRole("button", { name: "Rename" }));
    expect(nameField()).toHaveFocus();
  });

  it("allows a second attempt after a refusal", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn().mockRejectedValue(apiError("internal_error"));
    renderHeader({ onRename });
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    expect(screen.getByRole("button", { name: "Rename" })).toBeEnabled();
    await user.keyboard("{Enter}");
    expect(onRename).toHaveBeenCalledTimes(2);
  });

  it("offers an enabled Rename again when the field is reopened after a rename", async () => {
    const user = userEvent.setup();
    renderHeader();
    await startEditing(user);
    await user.keyboard("Growth{Enter}");
    await startEditing(user);
    expect(screen.getByRole("button", { name: "Rename" })).toBeEnabled();
  });

  it("is a summary card section labelled by the name", () => {
    renderHeader();
    const card = screen.getByRole("region", { name: "Tech" });
    expect(card.tagName).toBe("SECTION");
    expect(card).toHaveAttribute("data-variant", "summary");
  });

  it("lists Lifecycle Active, Members, Created with its zone, and Origin", () => {
    renderHeader();
    const list = document.querySelector("dl") as HTMLElement;
    const terms = within(list)
      .getAllByRole("term")
      .map((term) => term.textContent);
    const values = within(list)
      .getAllByRole("definition")
      .map((value) => value.textContent);
    expect(terms).toEqual(["Lifecycle", "Members", "Created", "Origin"]);
    expect(values).toEqual(["Active", "12", "2026-10-15 17:46 CDT", "Created by hand"]);
  });

  it("states a filter origin in words, each clause that applied", () => {
    renderHeader({ universe: { ...ACTIVE, origin: FROM_FILTER } });
    expect(
      screen.getByText(
        'Saved from a filter on 2026-10-15: value percentile at least 80; search "AA"; stocks with an incomplete score hidden',
      ),
    ).toBeInTheDocument();
  });

  it("states a filter origin with no search and nothing hidden without those clauses", () => {
    renderHeader({
      universe: { ...ACTIVE, origin: { ...FROM_FILTER, symbol: null, hideIncomplete: false } },
    });
    expect(
      screen.getByText("Saved from a filter on 2026-10-15: value percentile at least 80"),
    ).toBeInTheDocument();
  });

  it("offers Add stocks… as the default action and Retire… as the secondary one", async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    const add = screen.getByRole("button", { name: "Add stocks…" });
    const retire = screen.getByRole("button", { name: "Retire…" });
    expect(add).toHaveAttribute("data-variant", "default");
    expect(retire).toHaveAttribute("data-variant", "secondary");
    await user.click(add);
    expect(props.onAddStocks).toHaveBeenCalledTimes(1);
    await user.click(retire);
    expect(props.onRetire).toHaveBeenCalledTimes(1);
  });

  it("on a retired universe shows a plain h1, the Retired badge with its time and the retired sentence", () => {
    renderHeader({ universe: RETIRED });
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/^Tech$/);
    expect(within(heading).queryByRole("button")).toBeNull();
    const badge = screen.getByText("Retired");
    expect(badge.closest('[data-variant="secondary"]')).not.toBeNull();
    expect(screen.getByText("2026-10-16 00:00 CDT")).toBeInTheDocument();
    expect(
      screen.getByText("This universe is retired. Its members and history stay viewable."),
    ).toBeInTheDocument();
  });

  it("on a retired universe offers no Add stocks…, Retire… or rename", () => {
    renderHeader({ universe: RETIRED });
    expect(screen.queryByRole("button", { name: "Add stocks…" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Retire…" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Rename" })).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the name as text, never as markup", () => {
    renderHeader({ universe: { ...ACTIVE, name: "<b>Tech</b>" } });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("<b>Tech</b>");
    expect(document.querySelector("h1 b")).toBeNull();
  });
});
