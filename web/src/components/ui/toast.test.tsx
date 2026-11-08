import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
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
  // Let sonner's removal timers fire inside act while the fake clock still owns them, so none
  // survives the test environment's teardown.
  act(() => {
    vi.advanceTimersByTime(1000);
    vi.runOnlyPendingTimers();
  });
  cleanup();
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
    setup();
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

function tokensOf(node: Element | null | undefined): string[] {
  if (!node) throw new Error("node not rendered");
  return node.getAttribute("class")?.split(/\s+/).filter(Boolean) ?? [];
}

// AC-26, DAC-E1-12: the toast's surface and the outcome accents carry their tier in a token
// (toast spec section 6; UX design 0.6), and the close control meets the 24 px target (IR-006).
describe("toast resolves to design-system tokens, not shipped literals (AC-26, IR-002, IR-003, IR-006)", () => {
  it("marks the region with both toaster and group, so the group-[.toaster] tokens apply", async () => {
    setup();
    await raiseAll();
    const region = document.querySelector("[data-sonner-toaster]");
    expect(tokensOf(region)).toEqual(expect.arrayContaining(["toaster", "group"]));
  });

  it("gives each toast the popover surface and the theme radius, with no shipped shadow", async () => {
    setup();
    await raiseAll();
    const tokens = tokensOf(screen.getByText("Download failed").closest("[data-sonner-toast]"));
    for (const token of [
      "group-[.toaster]:bg-popover",
      "group-[.toaster]:text-popover-foreground",
      "group-[.toaster]:border-border",
      "group-[.toaster]:rounded",
    ]) {
      expect(tokens, token).toContain(token);
    }
    for (const shipped of [
      "group-[.toaster]:bg-background",
      "group-[.toaster]:text-foreground",
      "group-[.toaster]:shadow-lg",
    ]) {
      expect(tokens, shipped).not.toContain(shipped);
    }
  });

  it("colours the icon by outcome: critical, warning, good", async () => {
    setup();
    await raiseAll();
    const accentOf = (message: string) =>
      tokensOf(screen.getByText(message).closest("[data-sonner-toast]")).filter((token) =>
        token.includes("data-icon"),
      );
    expect(accentOf("Download failed")).toEqual(["[&_[data-icon]]:text-status-critical"]);
    expect(accentOf("Download partial")).toEqual(["[&_[data-icon]]:text-status-warning"]);
    expect(accentOf("Download complete")).toEqual(["[&_[data-icon]]:text-status-good"]);
  });

  it("sizes the dismiss control from the spacing token, 24 px and no smaller", async () => {
    setup();
    await raiseAll();
    const close = screen
      .getByText("Download failed")
      .closest("[data-sonner-toast]")
      ?.querySelector("[data-close-button]");
    const tokens = tokensOf(close);
    expect(tokens).toContain("!size-5");
  });
});
