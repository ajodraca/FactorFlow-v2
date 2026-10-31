import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { REGIONS, SELECTION } from "../../screens/research/copy";
import { SelectionTray } from "./selection-tray";

const SYMBOLS = ["AAPL", "MSFT", "NVDA", "KO", "PEP", "JNJ", "XOM", "CVX"];

/** The router location, printed so a test can see that activating a control navigated nowhere. */
function LocationProbe(): JSX.Element {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function trayTree(checked: string[], onAddToUniverse?: (symbols: string[]) => void): JSX.Element {
  return (
    <MemoryRouter initialEntries={["/research"]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <SelectionTray checked={checked} onAddToUniverse={onAddToUniverse} />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

function renderTray(checked: string[], onAddToUniverse?: (symbols: string[]) => void) {
  return render(trayTree(checked, onAddToUniverse));
}

function tray(): HTMLElement {
  return screen.getByRole("region", { name: REGIONS.selection });
}

describe("TC-COMP-140: Compare is blocked at 1 or 7 checked and enabled at 2 to 6 (DAC-E4-S7-1)", () => {
  // Implements TC-COMP-140
  describe.each([1, 7, 8])("with %i checked", (count) => {
    const checked = SYMBOLS.slice(0, count);

    it("renders Compare as a focusable blocked button carrying its reason", async () => {
      renderTray(checked);
      const compare = within(tray()).getByRole("button", { name: SELECTION.compareSideBySide });
      expect(compare.tagName).toBe("BUTTON");
      expect(compare).toHaveAttribute("type", "button");
      expect(compare).toHaveAttribute("data-variant", "blocked");
      expect(compare).toHaveAttribute("aria-disabled", "true");
      expect(compare).not.toBeDisabled();
      expect(compare).not.toHaveAttribute("href");
      expect(compare.tabIndex).not.toBe(-1);
      expect(within(tray()).queryByRole("link", { name: SELECTION.compareSideBySide })).toBeNull();

      const reasonId = compare.getAttribute("aria-describedby");
      expect(reasonId).toBeTruthy();
      const reason = document.getElementById(reasonId as string);
      expect(reason).not.toBeNull();
      expect(reason?.textContent).toBe(SELECTION.compareBlocked);
      expect(reason).toBeVisible();
      expect(compare).toHaveAccessibleDescription(SELECTION.compareBlocked);

      await userEvent.tab();
      expect(compare).toHaveFocus();
    });

    it("navigates nowhere when activated by click, Enter or Space", async () => {
      const user = userEvent.setup();
      renderTray(checked);
      const compare = within(tray()).getByRole("button", { name: SELECTION.compareSideBySide });
      await user.click(compare);
      compare.focus();
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/research$/);
    });
  });

  describe.each([2, 3, 6])("with %i checked", (count) => {
    const checked = SYMBOLS.slice(0, count);

    it("renders Compare as a link to the compare route with the checked symbols", async () => {
      const user = userEvent.setup();
      renderTray(checked);
      const compare = within(tray()).getByRole("link", { name: SELECTION.compareSideBySide });
      expect(compare.tagName).toBe("A");
      expect(compare).toHaveAttribute("href", `/research/compare?symbols=${checked.join(",")}`);
      expect(compare).not.toHaveAttribute("data-variant", "blocked");
      expect(compare).not.toHaveAttribute("aria-disabled");
      expect(compare).not.toHaveAttribute("aria-describedby");
      expect(
        within(tray()).queryByRole("button", { name: SELECTION.compareSideBySide }),
      ).toBeNull();
      expect(tray()).not.toHaveTextContent(SELECTION.compareBlocked);
      expect(screen.queryByText(SELECTION.compareBlocked)).toBeNull();

      await user.click(compare);
      expect(screen.getByTestId("location")).toHaveTextContent(
        `/research/compare?symbols=${checked.join(",")}`,
      );
    });
  });
});

describe("the tray appears at one checked row and announces {n} selected (AC-16, DAC-E4-S7-1)", () => {
  it("renders nothing with no checked row", () => {
    const { container } = render(
      <MemoryRouter>
        <SelectionTray checked={[]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("is a region named Selection from one checked row, on the foreground fill", () => {
    renderTray(["AAPL"]);
    const region = tray();
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveClass("bg-foreground", "text-background");
  });

  it("announces the count politely and updates it as the checked rows grow", () => {
    const { rerender } = renderTray(["AAPL"]);
    const count = within(tray()).getByText(SELECTION.selected(1));
    expect(count).toHaveTextContent(/^1 selected$/);
    expect(count).toHaveAttribute("aria-live", "polite");

    rerender(trayTree(["AAPL", "MSFT", "NVDA"]));
    const grown = within(tray()).getByText(SELECTION.selected(3));
    expect(grown).toHaveTextContent(/^3 selected$/);
    expect(grown).toHaveAttribute("aria-live", "polite");
    // The same live region is updated, not replaced, so the change is announced.
    expect(grown).toBe(count);
  });

  it("counts what it is given, a duplicate included", () => {
    renderTray(["AAPL", "AAPL", "MSFT"]);
    expect(within(tray()).getByText(SELECTION.selected(3))).toBeInTheDocument();
  });

  it("keeps the count and the reason in separate elements", () => {
    renderTray(["AAPL"]);
    const count = within(tray()).getByText(SELECTION.selected(1));
    const reason = within(tray()).getByText(SELECTION.compareBlocked);
    expect(count).not.toBe(reason);
    expect(count).not.toContainElement(reason);
    expect(reason).not.toContainElement(count);
  });
});

describe("the compare link encodes each symbol and keeps the commas literal (DEC-0163)", () => {
  it.each([
    [["AAPL", "BRK.B"], "AAPL,BRK.B"],
    [["A/B", "MSFT"], "A%2FB,MSFT"],
    [["MSFT", "AAPL", "A&B"], "MSFT,AAPL,A%26B"],
  ])("%j links to symbols=%s in the order checked", (checked, query) => {
    renderTray(checked);
    expect(within(tray()).getByRole("link", { name: SELECTION.compareSideBySide })).toHaveAttribute(
      "href",
      `/research/compare?symbols=${query}`,
    );
  });
});

describe("Add to universe… is the optional seam to the add dialog (DEC-0163)", () => {
  it("is absent when no handler is given", () => {
    renderTray(["AAPL", "MSFT"]);
    expect(within(tray()).queryByRole("button", { name: SELECTION.addToUniverse })).toBeNull();
    expect(tray()).not.toHaveTextContent(SELECTION.addToUniverse);
  });

  it.each([1, 3, 7])(
    "with %i checked, is an enabled button that hands over the checked symbols once",
    async (count) => {
      const user = userEvent.setup();
      const onAddToUniverse = vi.fn();
      const checked = SYMBOLS.slice(0, count);
      renderTray(checked, onAddToUniverse);
      const add = within(tray()).getByRole("button", { name: SELECTION.addToUniverse });
      expect(add).toHaveAttribute("type", "button");
      expect(add).toHaveAttribute("data-variant", "outline");
      expect(add).toBeEnabled();
      expect(add).not.toHaveAttribute("aria-disabled");
      await user.click(add);
      expect(onAddToUniverse).toHaveBeenCalledTimes(1);
      expect(onAddToUniverse).toHaveBeenCalledWith(checked);
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/research$/);
    },
  );
});
