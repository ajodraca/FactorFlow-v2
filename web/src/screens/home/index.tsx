import { type JSX, useId } from "react";
import { Link } from "react-router-dom";
import { LAYOUT } from "../../app/layout";
import { useShell } from "../../app/shell-context";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { EMPTY_STATE } from "./copy";
import { DataTile } from "./data-tile";
import { HomeHeader } from "./header";
import { NeedsYouCard } from "./needs-you-card";

/**
 * The Home screen: the header, the data tile and the *Needs you* card (component
 * design `home-ui` 2.1, 2.2, section 3 and section 10; UX design 1.3; AC-10,
 * AC-21, AC-24, AC-26; DAC-E5-1, DAC-E5-10; Resolved Conflicts 1 and 2;
 * DEC-0367). It renders inside the shell's main region and adds none, so the
 * page has one `main` and one `h1`.
 */

/** Where the empty state sends the owner (DAC-E5-1). */
const SETUP = "/setup";

/** Before any download: the header stays, the tile and the list give way to this card. */
function EmptyState(): JSX.Element {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <Card variant="default">
        <CardHeader>
          <CardTitle id={id}>{EMPTY_STATE.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p>{EMPTY_STATE.body}</p>
          <Button asChild variant="default">
            <Link to={SETUP}>{EMPTY_STATE.action}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export default function HomeScreen(): JSX.Element {
  const { attention } = useShell();
  const neverDownloaded = attention.kind === "ok" && attention.data.latest_download === null;

  return (
    <div className="flex w-full flex-col gap-5" style={{ maxWidth: LAYOUT.contentMaxWidth }}>
      <HomeHeader />
      {neverDownloaded ? (
        <EmptyState />
      ) : (
        <>
          <div data-testid="home-summary-row" className="grid grid-cols-3 gap-5">
            <DataTile />
          </div>
          <NeedsYouCard />
        </>
      )}
    </div>
  );
}
