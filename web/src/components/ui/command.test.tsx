import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

// jsdom lacks what cmdk calls. The shared test setup unstubs globals after
// each test, so ResizeObserver is stubbed again here.
const originalScrollIntoView = Element.prototype.scrollIntoView;
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open the command palette
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a stock or page" />
        <CommandList>
          <CommandEmpty>No stocks or pages match "zzz".</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem>Home</CommandItem>
            <CommandItem>Data health</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Implements TC-COMP-015
describe("command dialog labelled, loops, focuses input, renders caller empty copy (DAC-E1-S3-4, DAC-E1-14, AC-25)", () => {
  it("opens a labelled dialog with the input focused, loops the selection and restores focus", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open the command palette" });
    await user.click(opener);

    const dialog = await screen.findByRole("dialog", { name: "Search FactorFlow" });
    expect(dialog.className).toContain("max-w-[560px]");

    const input = screen.getByRole("combobox");
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleName("Search FactorFlow");
    expect(input).toHaveAttribute("placeholder", "Jump to a stock or page");

    const home = screen.getByRole("option", { name: "Home" });
    const settings = screen.getByRole("option", { name: "Settings" });
    expect(home).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowUp}");
    expect(settings).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(home).toHaveAttribute("aria-selected", "true");

    expect(screen.queryByText('No stocks or pages match "zzz".')).toBeNull();
    await user.keyboard("zzz");
    expect(await screen.findByText('No stocks or pages match "zzz".')).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(opener).toHaveFocus();
  });
});

// Implements TC-COMP-016
describe("overlay family scan and packages (TC-COMP-016)", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const read = (relPath: string) => readFileSync(path.join(repoRoot, relPath), "utf8");
  const FILES = ["dialog", "command", "toast", "progress", "stepper"].map(
    (name) => `web/src/components/ui/${name}.tsx`,
  );
  const sources = (): [string, string][] => FILES.map((file) => [file, read(file)]);

  it("reads all five sources, so the scan is not vacuous", () => {
    expect(sources().every(([, source]) => source.length > 0)).toBe(true);
  });

  it("finds exactly one length literal, the command dialog's 560 px", () => {
    const found = sources().flatMap(([file, source]) =>
      [...source.matchAll(/\b\d+(\.\d+)?(px|rem|em|vh|vw)\b/g)].map(
        (match) => `${file}: ${match[0]}`,
      ),
    );
    expect(found).toEqual(["web/src/components/ui/command.tsx: 560px"]);
  });

  it("holds no hex colour and no colour function outside var()", () => {
    for (const [file, source] of sources()) {
      expect(source.match(/#[0-9a-fA-F]{3,8}\b/g), `${file} hex`).toBeNull();
      expect(source.match(/\b(rgb|hsl)a?\((?!\s*var\()/g), `${file} colour function`).toBeNull();
    }
  });

  it("adds the five packages as MIT dependencies", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
    const lock = JSON.parse(read("package-lock.json")) as {
      packages: Record<string, { license?: string }>;
    };
    for (const name of [
      "@radix-ui/react-dialog",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-progress",
      "cmdk",
      "sonner",
    ]) {
      expect(pkg.dependencies, name).toHaveProperty([name]);
      expect(lock.packages[`node_modules/${name}`]?.license, name).toBe("MIT");
    }
  });
});

function tokensOf(node: Element | null | undefined): string[] {
  if (!node) throw new Error("node not rendered");
  return node.getAttribute("class")?.split(/\s+/).filter(Boolean) ?? [];
}

// AC-26, DAC-E1-12, AC-25: the palette's classes take design-system tokens and none of the
// Tailwind-default literals the shadcn source ships (command spec section 6, DEC-0305), and the
// input keeps a visible focus indicator (UX design 0.6).
describe("command palette resolves to design-system tokens, not shipped literals (AC-26, IR-002, IR-003, IR-005)", () => {
  async function openPalette() {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open the command palette" }));
    return screen.findByRole("dialog", { name: "Search FactorFlow" });
  }

  it("styles the dialog content and scrim with the popover and foreground tokens", async () => {
    const dialog = await openPalette();
    const content = tokensOf(dialog);
    expect(content).toContain("bg-popover");
    expect(content).not.toContain("shadow-lg");
    const scrim = tokensOf(document.querySelector("[data-state='open'].fixed.inset-0"));
    expect(scrim).toContain("bg-foreground/40");
    expect(scrim).not.toContain("bg-black/80");
  });

  it("caps the list by the row height token and gives the input no fixed height", async () => {
    const dialog = await openPalette();
    expect(tokensOf(dialog.querySelector("[cmdk-list]"))).toContain(
      "max-h-[calc(var(--row-height)*10)]",
    );
    expect(tokensOf(dialog.querySelector("[cmdk-list]"))).not.toContain("max-h-80");
    const input = tokensOf(dialog.querySelector("[cmdk-input]"));
    expect(input).not.toContain("h-11");
  });

  it("styles the active item with the accent tokens and the item with the theme radius", async () => {
    const dialog = await openPalette();
    const item = tokensOf(dialog.querySelector("[cmdk-item]"));
    for (const token of [
      "rounded",
      "px-2",
      "py-2",
      "data-[selected=true]:bg-accent",
      "data-[selected=true]:text-accent-foreground",
    ]) {
      expect(item, token).toContain(token);
    }
    for (const shipped of [
      "rounded-sm",
      "py-1.5",
      "data-[selected=true]:bg-muted",
      "data-[selected=true]:text-foreground",
    ]) {
      expect(item, shipped).not.toContain(shipped);
    }
  });

  it("sets group headings in the small muted face", async () => {
    const dialog = await openPalette();
    const root = tokensOf(dialog.querySelector("[cmdk-root]"));
    for (const token of [
      "[&_[cmdk-group-heading]]:text-xs",
      "[&_[cmdk-group-heading]]:font-medium",
      "[&_[cmdk-group-heading]]:text-muted-foreground",
    ]) {
      expect(root, token).toContain(token);
    }
  });

  it("keeps a visible, token-backed focus indicator around the input", async () => {
    const dialog = await openPalette();
    const wrapper = tokensOf(dialog.querySelector("[cmdk-input-wrapper]"));
    for (const token of [
      "focus-within:ring",
      "focus-within:ring-inset",
      "focus-within:ring-ring",
    ]) {
      expect(wrapper, token).toContain(token);
    }
  });
});
