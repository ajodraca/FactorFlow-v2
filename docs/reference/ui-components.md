# Design-system components (`web/src/components/ui/`)

`web/src/components/ui/` holds the design-system components, vendored as
shadcn/ui ships them and adapted to the theme. CAP-003-E1-S1 created the
directory with `Badge`, `Button` and `Card` and the `cn` helper they share.
Every component is first-party source: it imports through relative paths, never
an `@/` alias, and `tsconfig.json` and `vite.config.ts` declare no path alias.

## Token-only styling

Components use only Tailwind keys that resolve to a token in
`design-system/theme.css` (AC-26). `tailwind.config.js` gained twelve colour
keys, each bound as `hsl(var(--<same name>) / <alpha-value>)`: `primary`,
`primary-foreground`, `accent`, `accent-foreground`, `popover`,
`popover-foreground`, `muted`, `ring`, `destructive`, `destructive-foreground`,
`status-foreground` and `seq-1`. It also binds the default `borderRadius` to
`var(--radius)` and the default `ringWidth` to `var(--focus-ring-width)`.

Two tests hold this in place: `web/src/components/token-literals.test.ts`
checks the Tailwind keys resolve, and scans the component sources for spacing,
size or colour literals (`literalsIn`); `ui/vendoring.test.ts` checks the
no-alias rule and that the five packages below carry an approved licence in
`package-lock.json`.

## Dependencies

`package.json` gained `@radix-ui/react-slot`, `class-variance-authority`,
`clsx`, `lucide-react` and `tailwind-merge`.

## `cn` (`utils.ts`)

`cn(...inputs)` joins class values with `clsx` and resolves Tailwind conflicts
with `tailwind-merge`. The merge is extended so `bg-pattern-indeterminate` is a
background image, not a colour; without that, `coverage-unknown` would lose
either its muted colour or its pattern.

## `Badge` (`badge.tsx`)

A `span` with a required `variant`; it is never focusable and has no hover.
It renders `data-variant`. Variants:

| Variant | Colours |
|---|---|
| `status-neutral`, `status-active`, `status-good`, `status-warning`, `status-serious`, `status-critical` | the matching `status-*-muted` background and `status-*` text |
| `coverage-present` | `status-good` pair |
| `coverage-absent` | `value-missing-muted` background, `value-missing` text |
| `coverage-unknown` | `value-indeterminate-muted` background and pattern, `value-indeterminate` text |
| `secondary` | `secondary` pair |

`BadgeVariant` is exported.

## `Button` (`button.tsx`)

A `button` (or, with `asChild`, the child element through Radix `Slot`),
forwarding its ref and rendering `data-variant`. Variants: `default` (the
default), `secondary`, `outline`, `ghost` and `blocked`. There are no
`destructive`, `link` or size parts.

`blocked` is for an action a precondition gates; do not use `disabled` there.
A blocked button sets `aria-disabled="true"`, stays in the tab order, and
calls `preventDefault` on activation instead of its `onClick`, so no handler
runs and an enclosing form is not submitted. The caller renders the reason
inline and points to it with `aria-describedby`.

## `Card` (`card.tsx`)

`Card` is a `div` with `variant` `default`, `metric` or `summary`
(`data-variant` carries it). The parts are `CardHeader`, `CardTitle` (a
level-2 heading; compose your own heading inside `CardHeader` for another
level), `CardDescription`, `CardContent` and `CardFooter`. The `metric` variant
adds `CardMetricValue`, one large number in `font-numeric text-2xl`; the
`summary` variant adds `CardSummaryList`, a two-column `dl` whose `dt` and `dd`
children the caller supplies.
