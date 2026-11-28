import { type ReactNode, useId } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

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
