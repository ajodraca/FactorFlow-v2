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
