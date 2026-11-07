import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMetricValue,
  CardSummaryList,
  CardTitle,
} from "./card";

// The card contract (component design 2.1, card spec 2-6, UX design 10; DEC-0297).
describe("card (AC-26)", () => {
  it.each(["default", "metric", "summary"] as const)(
    "renders the %s variant with token classes and no shadow",
    (variant) => {
      render(
        <Card variant={variant} data-testid="card">
          Body
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("data-variant", variant);
      expect(card).toHaveClass(
        "rounded",
        "border",
        "border-border",
        "bg-card",
        "text-card-foreground",
      );
      expect(card.className).not.toMatch(/shadow/);
      expect(card.className).not.toMatch(/rounded-/);
    },
  );

  it("defaults to the default variant", () => {
    render(<Card data-testid="card">Body</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("data-variant", "default");
  });

  it("titles the card with a real level-2 heading at the large text size", () => {
    render(<CardTitle>Coverage</CardTitle>);
    expect(screen.getByRole("heading", { level: 2, name: "Coverage" })).toHaveClass("text-lg");
  });

  it("shows a metric in the numeric face at the hero size", () => {
    render(<CardMetricValue>1,204</CardMetricValue>);
    expect(screen.getByText("1,204")).toHaveClass("font-numeric", "text-2xl");
  });

  it("exposes a summary as a description list", () => {
    render(
      <CardSummaryList>
        <dt>Symbols</dt>
        <dd>12</dd>
      </CardSummaryList>,
    );
    expect(screen.getByRole("term").parentElement?.tagName).toBe("DL");
    expect(screen.getByRole("term")).toHaveTextContent("Symbols");
    expect(screen.getByRole("definition")).toHaveTextContent("12");
  });

  it("composes its parts and takes no tab stop of its own", async () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Description")).toHaveClass("text-sm", "text-muted-foreground");
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });
});
