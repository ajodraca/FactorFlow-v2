import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast as sonnerToast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster, toast } from "./toast";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  // sonner's toast store is module-global.
  act(() => {
    sonnerToast.dismiss();
  });
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

function setup() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(
    <>
      <button type="button">Before</button>
      <Toaster />
    </>,
  );
  return user;
}

async function raiseAll() {
  act(() => {
    toast.error("Download failed");
    toast.warning("Download partial");
    toast.success("Download complete");
  });
  await screen.findByText("Download complete");
}

// Implements TC-COMP-013
describe("toast error and warning persist, never take focus, announce politely (DAC-E1-S3-2, AC-25)", () => {
  it("keeps error and warning, drops success, and never moves focus", async () => {
    const user = setup();
    const before = screen.getByRole("button", { name: "Before" });
    before.focus();
    await raiseAll();
    expect(before).toHaveFocus();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    await waitFor(() => expect(screen.queryByText("Download complete")).toBeNull());
    expect(screen.getByText("Download failed")).toBeInTheDocument();
    expect(screen.getByText("Download partial")).toBeInTheDocument();
    expect(before).toHaveFocus();

    for (const message of ["Download failed", "Download partial"]) {
      expect(screen.getByText(message).closest("[aria-live]")).toHaveAttribute(
        "aria-live",
        "polite",
      );
    }
    expect(document.querySelector('[aria-live="assertive"]')).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    // The user object is unused beyond the shared timer wiring.
    expect(user).toBeDefined();
  });

  it("reaches a close button on a persisting toast by keyboard and dismisses only that toast", async () => {
    const user = setup();
    const before = screen.getByRole("button", { name: "Before" });
    before.focus();
    await raiseAll();

    const failed = screen.getByText("Download failed").closest("[data-sonner-toast]");
    expect(failed).not.toBeNull();
    let reached: HTMLElement | null = null;
    for (let i = 0; i < 10 && reached === null; i++) {
      await user.tab();
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        failed?.contains(active) &&
        /close/i.test(active.getAttribute("aria-label") ?? active.textContent ?? "")
      ) {
        reached = active;
      }
    }
    expect(reached).not.toBeNull();
    await user.keyboard("{Enter}");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    await waitFor(() => expect(screen.queryByText("Download failed")).toBeNull());
    expect(screen.getByText("Download partial")).toBeInTheDocument();
  });
});

describe("toast variants (DEC-0302, DAC-E1-S3-2)", () => {
  it("tags each message with its own type", async () => {
    setup();
    await raiseAll();
    const typeOf = (message: string) =>
      screen.getByText(message).closest("[data-sonner-toast]")?.getAttribute("data-type");
    expect(typeOf("Download failed")).toBe("error");
    expect(typeOf("Download partial")).toBe("warning");
    expect(typeOf("Download complete")).toBe("success");
  });

  it("fixes the variant's duration and offers no info variant (checked by tsc)", () => {
    // Type-level only: `npx tsc --noEmit` fails on an unused directive.
    const typeChecked = () => {
      // @ts-expect-error the variant fixes the duration
      toast.error("x", { duration: 1000 });
      // @ts-expect-error no info variant (UX design 0.6)
      toast.info("x");
    };
    expect(typeChecked).toBeTypeOf("function");
    expect("info" in toast).toBe(false);
  });
});
