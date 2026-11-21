import type { JSX } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

/** The heading, with the straight apostrophe the delivered copy style uses. */
export const NOT_FOUND_HEADING = "There's no page at this address.";

/** The lead sentence, up to the **Home** link, with no punctuation added. */
export const NOT_FOUND_LEAD = "Check the address, or go to ";

/**
 * What an unregistered path shows, inside the shell's frame: a card holding a
 * status section with the heading and a link to Home (DAC-E3-4, DAC-E3-S4-4;
 * AC-24; UX design 0.5; owner-shell 2.8).
 *
 * The heading takes `tabIndex={-1}`, the focus target owner-shell 2.7 names
 * and CAP-003-E3-S6 moves focus to on a route change. It is not a tab stop, so
 * the **Home** link is the first one.
 */
export function NotFound(): JSX.Element {
  return (
    <Card variant="default">
      {/* biome-ignore lint/a11y/useSemanticElements: DAC-E3-S4-4 fixes a `section` with role="status"; `output` is a form-result element, not a page-state region. */}
      <section role="status" className="p-5">
        <h1 tabIndex={-1} className="text-xl font-semibold">
          {NOT_FOUND_HEADING}
        </h1>
        <p>
          {NOT_FOUND_LEAD}
          <Button asChild variant="ghost">
            <Link to="/home">Home</Link>
          </Button>
        </p>
      </section>
    </Card>
  );
}
