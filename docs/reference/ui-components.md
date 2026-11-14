# Design-system components (`web/src/components/ui/`)

`web/src/components/ui/` holds the design-system components, vendored as
shadcn/ui ships them and adapted to the theme. CAP-003-E1-S1 created the
directory with `Badge`, `Button` and `Card` and the `cn` helper they share;
CAP-003-E1-S2 added the form controls: `Form`, `Input`, `Textarea`,
`Checkbox`, `RadioGroup` and `Select`; CAP-003-E1-S3 added the overlay and
feedback family: `ConfirmDialog`, `Command`, `Toaster` and `toast`, `Progress`
and `Stepper`; CAP-003-E1-S4 added `DataTable`. Every component is first-party source: it imports through relative paths, never
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
size or colour literals (`literalsIn`), including the six form-control files and the five overlay and feedback files;
`ui/vendoring.test.ts` checks the no-alias rule and that every package below
carries an approved licence (MIT, for the form packages) in `package-lock.json`.

## Dependencies

`package.json` gained `@radix-ui/react-slot`, `class-variance-authority`,
`clsx`, `lucide-react` and `tailwind-merge`, and, for the form controls,
`react-hook-form`, `zod`, `@hookform/resolvers`, `@radix-ui/react-label`,
`@radix-ui/react-radio-group`, `@radix-ui/react-checkbox` and
`@radix-ui/react-select`. All seven are `dependencies`, none a
`devDependency`. The overlay and feedback family added five more, also
`dependencies`: `@radix-ui/react-alert-dialog`, `@radix-ui/react-dialog`,
`@radix-ui/react-progress`, `cmdk` and `sonner`. The stepper has no package. `DataTable` added `@tanstack/react-table`
(`^8.21.3`), also a `dependency`.

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

## Form controls

Every control uses a `--ring` focus ring (`focus-visible:ring`; the select
trigger uses `focus:ring`), a `border-input` border and `bg-background`, and
shows `border-destructive` while `aria-invalid="true"`. Each renders
`data-variant`.

### `Form`, `FormRoot` and the field parts (`form.tsx`)

Built on `react-hook-form`. `Form` is `FormProvider`; create the form with
`useForm({ resolver: zodResolver(schema), mode: "onTouched" })`, so a field
validates when it loses focus and re-validates on every change once in error.

- `FormRoot` is a `form` with `noValidate`, so the resolver rather than the
  browser reports errors. `variant` is `stacked` (default, a column) or
  `inline` (a wrapping row).
- `FormField` wraps `Controller` and supplies the field name; `FormItem` gives
  the field a generated id; `useFormField` returns the ids and the field state
  and throws outside a `FormField`.
- `FormLabel` carries the label id and `htmlFor`, and turns `text-destructive`
  in error.
- `FormControl` (a Radix `Slot`) sets the wrapped control's `id`,
  `aria-labelledby` (the label id), `aria-describedby` (the hint, plus the
  message while in error) and `aria-invalid`. A prop the caller sets on the
  wrapped control replaces the one `FormControl` supplies; put extra
  descriptions inside `FormDescription` rather than overriding
  `aria-describedby`.
- `FormDescription` is the hint. `FormMessage` shows the field's error message,
  or its children when there is no error, and renders nothing when empty. It is
  `role="alert"` only while an error shows.

### `Input` (`input.tsx`)

An `input` with `variant` `text` (default) or `numeric`. `numeric` sets
`type="number"` and `inputMode="numeric"`, right-aligns in `font-numeric`, and
may carry a non-editable `suffix` rendered beside the field. The suffix is part
of the accessible name: the input's `aria-labelledby` lists the caller's label
id, then the suffix id. Inside `FormControl` the label id is supplied; outside
it, pass `aria-labelledby` yourself. The control meets the minimum control
height (`h-7`).

### `Textarea` (`textarea.tsx`)

A `textarea` with `variant` `list` (the only one). Height comes from `rows`
(default 4), resizing is off (`resize-none`), and there is no key handler. The
parse, entry counter and rejected-entry list belong to the consuming screen.

### `Checkbox` (`checkbox.tsx`)

A Radix checkbox with `variant` `default`. Space toggles; Enter does not.
`checked="indeterminate"` (controlled) sets `aria-checked="mixed"` and shows a
dash instead of a tick. The 16 px box has square corners; the primary fill
appears only when checked or mixed, and no mark renders while unchecked. The
24 px target is the consumer's: put the box and its label in a row with
`minHeight: "var(--control-min-target)"`.

### `RadioGroup` and `RadioGroupCard` (`radio-group.tsx`)

`RadioGroup` is a Radix radio group with `variant` `cards`, laid out as a row
of equal columns. The group is one tab stop; both arrow axes move the
selection and wrap at the ends. `orientation` is left unset on purpose:
Radix ignores the vertical arrows under a horizontal orientation. `RadioGroupCard`
is the Radix item drawn as a bordered card, so the whole card is the click
target; its required `title` is the accessible name and its required
`description` the accessible description. The checked card gets a `ring-1`
in `--foreground`. Name the group with `aria-label`, or place it inside
`FormControl` under a `FormLabel`.

### `Select` (`select.tsx`)

The Radix select parts: `Select`, `SelectGroup`, `SelectValue`,
`SelectTrigger` (`variant` `inline`), `SelectContent`, `SelectLabel` (in
`text-muted-foreground`), `SelectItem`, `SelectSeparator` and the two scroll
buttons. Enter or Space opens the list with the current value highlighted,
ArrowDown and Enter choose, Escape closes, and focus returns to the trigger.

## Overlay and feedback components

### `ConfirmDialog` (`dialog.tsx`)

The `confirm` variant (`data-variant="confirm"`), built on Radix AlertDialog.
The content has `role="dialog"` and `aria-modal="true"`, not Radix's
`alertdialog`. There is no `variant` prop and no destructive styling.

- Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`,
  `onConfirm`, optional `pending` and `children`. `children` render between the
  description and the buttons, so a refusal can stay inside the dialog.
- **Cancel** is the first button and takes initial focus. Clicking the overlay
  or pressing Escape asks to close, as Cancel does.
- The confirm action is a plain `Button`, so the dialog stays open until the
  caller closes it. While `pending`, the dialog sets `aria-busy`, the confirm
  action is `aria-disabled` and ignores clicks, and nothing closes the dialog.
- Focus returns to the element that held it when the dialog opened, if it is
  still in the document.

### `Command` and `CommandDialog` (`command.tsx`)

cmdk inside a Radix Dialog. `CommandDialog` (`open`, `onOpenChange`, `children`)
is labelled *Search FactorFlow* and loops the selection; `loop` is not a caller
option. Focus returns to the opener on close. Its 560 px width is the one
length literal the token scan allows, in this file only.

The parts are `Command`, `CommandInput` (with a search icon, ring on focus),
`CommandList` (at most ten rows tall), `CommandEmpty`, `CommandLoading`,
`CommandGroup`, `CommandSeparator` and `CommandItem`. The caller supplies the
placeholder, group headings and the empty and loading wording. There is no
`CommandShortcut`.

### `Toaster` and `toast` (`toast.tsx`)

`Toaster` renders sonner's region in the light theme with a close button on
every toast; `next-themes` is not used. `toast` has `success`, `warning` and
`error`, each `(message, { description?, action? })`. `warning` and `error`
never time out; `success` keeps sonner's default duration. There is no `info`
variant and no `important` option, so toasts stay in sonner's polite region and
never take focus.

### `Progress` (`progress.tsx`)

A Radix progress bar. `value` and `aria-labelledby` are required; the caller
renders the visible text and passes its id. The bar is indeterminate
(`data-variant="indeterminate"`, no `aria-valuenow`) when `value` or `max` is
`null`, so a download's `done` and `total` can be passed unchanged; otherwise
it is `determinate` and the indicator is positioned from the caller's `max`
(default 100). The indeterminate indicator is a static hatch that pulses only
when motion is allowed.

### `Stepper` (`stepper.tsx`)

A bespoke vertical stepper with no shadcn/ui or Radix source: a `nav` labelled
by `label` holding an `ol` of `steps`. Props: `label`, `steps` and `markerSize`
(the caller's marker width).

- A step has `title`, `state` (`done`, `current` or `todo`) and optional
  `summary`, `href` and `onSelect`. The current item carries
  `aria-current="step"`.
- Each title carries its state in text (", done", ", current", ", to do"): a
  visually hidden suffix, or the link's `aria-label`.
- Only a done step with an `href` is a link. When it has `onSelect`, a click is
  prevented and calls it. Current and to-do steps are never links or tab stops.
- The stepper never moves focus; the caller moves it to the step's heading.

## `DataTable` (`data-table.tsx`)

`DataTable<TRow>` is the design-system table on TanStack Table v8: one
controlled component with four variants, set by `variant`. It renders a native
`table`, `data-variant` carrying the variant.

Props: `columns` (TanStack `ColumnDef`s), `data`, `getRowId`, and optional
`sorting`, `onSortingChange`, `rowHeader` and `busy`.

- **Sorting is the caller's.** The table never sorts or reorders rows.
  `sorting` is declared with `aria-sort` on the header; given
  `onSortingChange`, a column with sorting enabled gets a ghost button that
  cycles ascending, descending, unsorted (single column, ascending first).
  Columns sort only when they opt in (`defaultColumn.enableSorting` is
  `false`). `column.meta.numeric` right-aligns a column in the numeric face.
- **Row header.** `history` always, other variants when `rowHeader` is set,
  render each row's first cell as `th scope="row"`.
- **`busy`** sets `aria-busy` and holds back `onEndReached`.
- **`compact` and `history`** take only the common props.
- **`expandable`** also takes `renderExpansion(row)` and `getRowLabel(row)`.
  A leading column holds a ghost button, `aria-label` `Expand <label>`, with
  `aria-expanded` and `aria-controls` naming the detail row; the detail row
  spans the columns inside an `aria-live="polite"` region. Expansion state is
  the table's own, keyed by `getRowId`, so appended data does not reset it.
- **`virtualised`** takes `hasMore` and `onEndReached`, and optionally the
  expansion pair. It renders inside a focusable scroller
  (`data-slot="data-table-scroller"`, `tabIndex` 0) `VIEWPORT_ROWS + 1` = 16
  row heights tall, with a sticky header, `aria-rowcount` (rows plus the
  header) and each row's `aria-rowindex` (index + 2). Only a window of rows is
  rendered, between `aria-hidden` spacer rows (`data-spacer`) that keep the
  scroll height. Constants: `VIEWPORT_ROWS` 15, `OVERSCAN_ROWS` 10,
  `PREFETCH_ROWS` 20 (DEC-0306, following CAP-002's `results-window.ts`).
  `windowFor({ scrollTop, rowHeight, rowCount, extraHeights })` computes the
  window and spacer heights; `extraHeights` maps a row index to its open
  expansion's measured height. The row height is measured from the rendered
  row, so with no layout (jsdom) the window is the top one.
- **Paging.** `onEndReached` is called when the window's end is within
  `PREFETCH_ROWS` of the loaded end, `hasMore` is true and `busy` is not. It
  fires once per loaded set, keyed by the first row id and the row count, so
  replacing the rows with as many as before (a sort or filter) asks again.
- **Row heights** use the `h-row` class (`--row-height`) and cell padding the
  `--cell-padding-x` and `--cell-padding-y` tokens.
- **Memoisation.** Rows are memoised by the record's identity, so callers
  keep `columns` and loaded records referentially stable. An open row also
  follows `renderExpansion` and `getRowLabel` (DEC-0307), so detail the caller
  loads into its own state reaches it; a collapsed row stays memoised.

Tests: `data-table.test.tsx`.
