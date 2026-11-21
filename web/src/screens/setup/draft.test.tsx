import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SetupDraftProvider, type SetupDrafts, useSetupDrafts } from "./draft";

/** A test-local form bound to the drafts; its labels are not owner-facing. */
function DraftForm(): JSX.Element {
  const { drafts, setDraft } = useSetupDrafts();
  return (
    <div>
      <label>
        years
        <input value={drafts.yearsText} onChange={(e) => setDraft("yearsText", e.target.value)} />
      </label>
      <label>
        paste
        <input
          type="radio"
          name="source"
          checked={drafts.source === "paste"}
          onChange={() => setDraft("source", "paste")}
        />
      </label>
      <label>
        later
        <input
          type="radio"
          name="source"
          checked={drafts.source === "later"}
          onChange={() => setDraft("source", "later")}
        />
      </label>
      <label>
        pasted
        <textarea value={drafts.pasted} onChange={(e) => setDraft("pasted", e.target.value)} />
      </label>
      <button type="button" onClick={() => setDraft("unposted", ["MSFT", "NVDA"])}>
        keep unposted
      </button>
      <div data-testid="unposted">{JSON.stringify(drafts.unposted)}</div>
      <Link to="/home">to home</Link>
    </div>
  );
}

// Implements TC-COMP-105
describe("SetupDraftProvider above a route change", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.spyOn(Storage.prototype, "setItem");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps every draft across /setup -> /home -> /setup and writes nothing to browser storage", async () => {
    const user = userEvent.setup();
    const view = render(
      <SetupDraftProvider>
        <MemoryRouter initialEntries={["/setup"]}>
          <Routes>
            <Route path="/setup" element={<DraftForm />} />
            <Route path="/home" element={<Link to="/setup">to setup</Link>} />
          </Routes>
        </MemoryRouter>
      </SetupDraftProvider>,
    );

    await user.type(screen.getByLabelText("years"), "7");
    await user.click(screen.getByLabelText("paste"));
    await user.type(screen.getByLabelText("pasted"), "AAPL, MSFT");
    await user.click(screen.getByRole("button", { name: "keep unposted" }));

    await user.click(screen.getByRole("link", { name: "to home" }));
    expect(screen.queryByLabelText("years")).toBeNull();
    await user.click(screen.getByRole("link", { name: "to setup" }));

    expect((screen.getByLabelText("years") as HTMLInputElement).value).toBe("7");
    expect((screen.getByLabelText("paste") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("later") as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText("pasted") as HTMLTextAreaElement).value).toBe("AAPL, MSFT");
    expect(screen.getByTestId("unposted").textContent).toBe('["MSFT","NVDA"]');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();

    // A freshly mounted provider starts empty (DAC-E4-2).
    view.unmount();
    let latest: SetupDrafts | undefined;
    function Probe(): JSX.Element {
      latest = useSetupDrafts().drafts;
      return <span />;
    }
    render(
      <SetupDraftProvider>
        <Probe />
      </SetupDraftProvider>,
    );
    expect(latest).toEqual({ yearsText: "", source: null, pasted: "", unposted: [] });
  });
});

describe("useSetupDrafts", () => {
  function setup() {
    const renders = { count: 0 };
    const result = renderHook(
      () => {
        renders.count += 1;
        return useSetupDrafts();
      },
      { wrapper: SetupDraftProvider },
    );
    return { ...result, renders };
  }

  it("keeps one setter identity across updates", () => {
    const { result } = setup();
    const first = result.current.setDraft;
    act(() => result.current.setDraft("yearsText", "1"));
    act(() => result.current.setDraft("yearsText", "2"));
    act(() => result.current.setDraft("yearsText", "3"));
    expect(result.current.setDraft).toBe(first);
  });

  it("lands two writes made in one tick", () => {
    const { result } = setup();
    act(() => {
      result.current.setDraft("source", "paste");
      result.current.setDraft("pasted", "KO");
    });
    expect(result.current.drafts).toEqual({
      yearsText: "",
      source: "paste",
      pasted: "KO",
      unposted: [],
    });
  });

  it("changes one key at a time", () => {
    const { result } = setup();
    act(() => result.current.setDraft("pasted", "KO"));
    act(() => result.current.setDraft("yearsText", "12"));
    expect(result.current.drafts).toEqual({
      yearsText: "12",
      source: null,
      pasted: "KO",
      unposted: [],
    });
  });

  it("throws naming the provider when none is above it", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useSetupDrafts())).toThrow(/SetupDraftProvider/);
    quiet.mockRestore();
  });
});
