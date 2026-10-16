# Design source

The nine screens of the canvas page *Whole product · usability-first*, as
published on 2026-10-15. They are reference material for implementers, not
application code.

| File | Screen spec |
|------|-------------|
| `P01-Home.dc.html` | `../screens/S01-home.md` |
| `P02-Setup.dc.html` | `../screens/S02-setup.md` |
| `P03-Research.dc.html` | `../screens/S03-research.md` |
| `P04-Strategies.dc.html` | `../screens/S04-strategies.md` |
| `P05-Builder.dc.html` | `../screens/S05-builder.md` |
| `P06-Backtest.dc.html` | `../screens/S06-backtest.md` |
| `P07-Promote.dc.html` | `../screens/S07-promotion-review.md` |
| `P08-Portfolio.dc.html` | `../screens/S08-portfolio.md` |
| `P09-Data.dc.html` | `../screens/S09-data-health.md` |

**Reading them.** Each file is a Claude Design component: markup inside
`<x-dc>`, styles in `<helmet>`, and a small `class Component extends DCLogic`
script with the sample data. They need the canvas runtime (`support.js`) to
render, so open them on the canvas
(<https://claude.ai/code/artifact/d80f7e78-4cfd-470f-ae4a-35f063250c6a>). Reading the
source is still useful for exact spacing, sizes and copy.

**What they are not.**

- The sample data (tickers, money, dates, the backtest curve) is invented.
- Colours are written as `hsl(var(--token))` against a copy of `theme.css`
  values; implementation uses Tailwind classes bound to the real tokens.
- `--surface` in these files is not a token. It is `hsl(var(--muted) / 0.5)`.
- Where the source and a screen spec disagree, the spec wins.

Do not edit these files to change the design. Change the canvas, then
re-mirror the files here in the same change as the spec update.
