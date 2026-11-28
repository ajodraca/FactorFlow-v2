import { type ReactNode, useId } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { TRY_AGAIN } from "./copy";

/**
 * The check-card composition (UX design 3; data-health-ui 10): a region named by
 * its `h2`, the status beside the title, then the result, the as-of line and the
 * card's own children. Each of `status`, `result` and `asOf` renders only when
 * given.
 */
export function CheckCard({
  title,
  status,
  result,
  asOf,
  children,
}: {
  title: string;
  status?: ReactNode;
  result?: ReactNode;
  asOf?: ReactNode;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <Card variant="metric">
        <CardHeader className="flex-row items-center gap-2">
          <CardTitle id={id}>{title}</CardTitle>
          {status}
        </CardHeader>
        <CardContent>
          {result === undefined ? null : <p className="text-base font-semibold">{result}</p>}
          {asOf === undefined ? null : <p className="text-xs text-muted-foreground">{asOf}</p>}
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

/**
 * The shared read-failure body: the sentence in a status region, **Try again**
 * outside it, the error convention of `StateRegion` (DEC-0314) followed without
 * importing it, because `StateRegion` takes a `ScreenState`, not the shell's
 * `ReadState`.
 */
export function ReadFailure({ sentence, onRetry }: { sentence: string; onRetry: () => void }) {
  return (
    <>
      <output>{sentence}</output>
      <Button variant="outline" onClick={onRetry}>
        {TRY_AGAIN}
      </Button>
    </>
  );
}

/** One busy placeholder line, shown while a read has not answered. */
export function SkeletonLine() {
  return <div aria-busy="true" className="h-4 animate-pulse rounded bg-secondary" />;
}
