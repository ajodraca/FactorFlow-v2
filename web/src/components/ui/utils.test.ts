import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn() (DAC-E1-S1-4, AC-26)", () => {
  it("merges conflicting Tailwind classes, the last one winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("joins truthy class values and drops falsy ones", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });

  it("accepts object and array class values, as clsx does", () => {
    expect(cn("a", { b: true, c: false }, ["d"])).toBe("a b d");
  });

  it("keeps both the muted background colour and the indeterminate pattern", () => {
    expect(cn("bg-value-indeterminate-muted", "bg-pattern-indeterminate")).toBe(
      "bg-value-indeterminate-muted bg-pattern-indeterminate",
    );
  });

  it("still merges two background colours", () => {
    expect(cn("bg-status-good-muted", "bg-status-warning-muted")).toBe("bg-status-warning-muted");
  });
});
