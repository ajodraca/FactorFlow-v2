# Owner shell routing (`web/src/app/`)

The route map, the destinations list, the title table, the legacy redirects and
the not-found state, as CAP-003-E3-S4 left them (component design `owner-shell`
sections 2.6 to 2.8; AC-17, AC-18, AC-24, AC-27; DAC-E3-S4-1 to DAC-E3-S4-4).
`shell.tsx` renders the frame these routes mount in; the context `useTitle`
reads is in [`shell-context.md`](shell-context.md).

A route enters `DESTINATIONS` and `TITLES` in the change that registers its
screen, so neither names a route the router cannot render. `/setup`, `/home` and
`/data` are not registered yet: CAP-003-E4-S6, CAP-003-E5-S5 and CAP-003-E6-S7
register them.

## The route map (`routes.tsx`)

`AppRoutes` wraps one `Routes` in one `Suspense`, so the shell's frame stays
mounted while a screen's code loads. Every screen is `lazy`; the fallback is
`ShellSkeleton`, one `aria-busy` card at `LAYOUT.contentMaxWidth` that writes no
copy and no length.

| Path | Renders |
|---|---|
| `/` | `RootRedirect` |
| `/data/coverage` | Coverage screen |
| `/data/followed` | Instruments screen |
| `/data/downloads` | Runs screen |
| `/data/downloads/:runId` | Run detail screen |
| `/settings` | Settings screen |
| `/research` | Research screen |
| `/research/stocks/:symbol` | stock evidence |
| `/research/compare` | compare |
| `/research/universes` | universes |
| `/research/universes/:universeId` | universe detail |
| `/coverage`, `/instruments`, `/runs`, `/runs/:runId` | legacy redirects, below |
| `*` | `NotFound` |

The five Research routes are as CAP-002 delivered them; see
[`research-screen.md`](research-screen.md).

### `RootRedirect`

Reads `useHealth()`. While `liveness` is not `answering` or `health` is `null`
it renders `ShellSkeleton`; the shell's main region shows the unreachable state
in its place while the product cannot be reached. Once health has answered it
`Navigate`s with `replace` to `/setup` when `health.most_recent_run` is `null`
and to `/home` otherwise. Nothing is stored: only `/` reads setup state, and
setup incomplete does not lock any other path. Until the Setup and Home screens
register, both targets render `NotFound`.

## Destinations (`destinations.ts`)

`DESTINATIONS` is one static ordered list of `{ group, label, to, count? }`;
`group` is `"primary"` or `"data"` and `count` is `"needs-you"` or `"problems"`.
It holds Research (`primary`, `/research`) and Settings (`data`, `/settings`).
Home goes first when it registers and Data health goes before Settings.
`RESEARCH_REGISTERED` is `DESTINATIONS.some((d) => d.to === "/research")`,
computed at module load: the product detects no route at run time.

`shell.tsx` does not use this list yet. It keeps its own five-item rail,
retargeted to the new paths (Coverage `/data/coverage`, Instruments
`/data/followed`, Runs `/data/downloads`, Settings `/settings`, Research
`/research`); CAP-003-E3-S6 replaces it with `DESTINATIONS`.

## Titles (`titles.ts`)

`TITLES` is a static `{ pattern, crumbs }` table; a crumb is
`{ label, to? }`, `{ param: "symbol" }` (the matched `:symbol`) or
`{ detail }` (the detail slot). `crumbs: null` means the route has no title.

| Pattern | Crumbs |
|---|---|
| `/` | none |
| `/data/coverage` | Data health (`/data`), Coverage |
| `/data/followed` | Data health, Followed stocks |
| `/data/downloads` | Data health, Downloads |
| `/data/downloads/:runId` | Data health, Downloads (`/data/downloads`), detail (`Download`) |
| `/settings` | Settings |
| `/research` | Research |
| `/research/stocks/:symbol` | Research (`/research`), the symbol |
| `/research/compare` | Research, Compare |
| `/research/universes` | Research, Universes |
| `/research/universes/:universeId` | Research, Universes (`/research/universes`), detail (`Universe`) |
| `/coverage`, `/instruments`, `/runs`, `/runs/:runId` | none |
| `*` | Page not found |

- `resolveTitle(pathname, detail)` tries each entry but `*` in table order with
  react-router's `matchPath({ path, end: true })`, so a title never disagrees
  with the route that renders, and takes `*` when none matches. It returns
  `null` for a `null` entry, else the crumbs. A `param` crumb is the matched
  value, or `""` when absent; a `detail` crumb is `detail` when that is a
  non-empty string, else the entry's generic noun.
- `useTitle()` is `resolveTitle(useLocation().pathname, useTitleDetail())`.
- The separator and the rendering of crumbs belong to the top bar
  (CAP-003-E3-S6); this module holds neither.

## Legacy redirects (`legacy-redirects.tsx`)

The four paths CAP-001 shipped redirect for one release. Each is a `Navigate`
with `replace`, so the legacy path never enters history, and each keeps the
query string.

| From | To |
|---|---|
| `/coverage` | `/data/coverage` |
| `/instruments` | `/data/followed` |
| `/runs` | `/data/downloads` |
| `/runs/:runId` | `/data/downloads/:runId` |

`legacyRoutes` is an array of `Route` elements spread into `AppRoutes`. The
file, its import in `routes.tsx` and `legacy-redirects.test.tsx` are deleted one
release after this ships (capability assumption 3).

## Not found (`not-found.tsx`)

`NotFound` is what any unregistered path shows, inside the shell's main region:
a `Card` holding a `section` with `role="status"`, an `h1` with
`NOT_FOUND_HEADING` (`There's no page at this address.`) and a paragraph of
`NOT_FOUND_LEAD` (`Check the address, or go to `) followed by a ghost `Button`
that renders a `Link` to `/home`. The `h1` has `tabIndex={-1}`, the focus target
CAP-003-E3-S6 moves focus to on a route change; it is not a tab stop, so the
Home link is the first one.
