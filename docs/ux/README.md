# docs/ux — product-level UX

The owner interface for the whole product, M1 through M6, designed once so that
each capability builds a piece of the same thing.

**Start with `product-ux-blueprint.md`.** It holds the principles, navigation and
routes, the application shell, shared patterns, status and action rules, the
display vocabulary, which milestone builds what, STD-UI conformance, and the
owner decisions it depends on.

| Path | What it is |
|------|------------|
| `product-ux-blueprint.md` | `PRODUCT-UX`, the blueprint (draft) |
| `screens/S01-home.md` | Home — what needs you today |
| `screens/S02-setup.md` | First-run setup |
| `screens/S03-research.md` | Research — screener and inspector |
| `screens/S04-strategies.md` | Strategies — lifecycle board |
| `screens/S05-builder.md` | Strategy builder |
| `screens/S06-backtest.md` | Backtest result |
| `screens/S07-promotion-review.md` | Promotion review — paper to live |
| `screens/S08-portfolio.md` | Portfolio — live and paper |
| `screens/S09-data-health.md` | Data health |
| `design-source/` | The canvas sources each screen was drawn from |

Related changes made with the blueprint:

- `design-system/components/` — six new specs (`stepper`, `progress`,
  `checkbox`, `radio-group`, `toggle-group`, `command`) and new variants on
  `button`, `chart` and `data-table`.
- `docs/constitution/proposals/STD-UI-v5-proposal.md` — the STD-UI amendments
  the blueprint needs, for the owner's decision.

## How the pipeline uses this

- `$ux-brief` for a capability cites `PRODUCT-UX` as a source artifact, claims
  its rows from the blueprint's milestone map (§10), and records only what it
  adds or specializes.
- `$ux-design` starts from the matching screen spec and delivers the regions
  that spec assigns to the capability's milestone.
- `$specification-review` checks a capability's design against the screen
  spec's acceptance checks as well as STD-UI.

## Visual reference

The screens were drawn on the Claude Design canvas *FactorFlow v2 — Owner
Interface*, page *Whole product · usability-first*
(<https://claude.ai/code/artifact/d80f7e78-4cfd-470f-ae4a-35f063250c6a>, private
to the owner). Where a screen spec and the canvas disagree, the spec wins; each
spec lists its differences in §11.
