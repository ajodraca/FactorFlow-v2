# FactorFlow Design System

The component contract the SDD UX pipeline reads. Built on
[shadcn/ui](https://ui.shadcn.com) (MIT), which is itself built on
[Radix Primitives](https://www.radix-ui.com/primitives).

| Path | What it is |
|------|------------|
| `components/<slug>/design-spec.md` | One spec per component. The set of components any UX design may use. |
| `theme.css` | Design tokens as CSS custom properties. The only colours a design may reference. |
| `component-map.json` | Component to design-source mapping for Figma traceability. Empty for now. |
| `intake.md` | What to do when a design needs a component that has no spec. |

## How the pipeline uses this

`$ux-brief`, `$ux-design`, and `$ux-spec-extraction` read these files to validate that every
component a design proposes actually exists, and that every colour resolves to a token.
Anything else is recorded as a `COMPONENT-SPEC-GAP` and routed through `intake.md`. The skills
never write here.

Wired up through `projects/factorflow-v2/design-system.yaml` in the ai-agents repository.

## Standing relative to STD-UI

`docs/constitution/standards/ui-conventions.md` (STD-UI) is the project's enforceable UX
standard. **It states the obligations; this design system satisfies them.** Where the two
disagree, STD-UI wins and this repository is corrected — a token or a spec is never the reason
a rule bends.

Practically: STD-UI-29 obliges density, type scale and spacing to exist as tokens and be
consumed everywhere, and `theme.css` is where they exist. STD-UI-12's six severity tiers,
STD-UI-14's three presence states and STD-UI-4's missing-is-not-zero each have tokens here
because a rule required them, not because a screen wanted them.

## Provenance

Ported from the first FactorFlow build on 2026-09-05, where these specs and tokens were written
for its first UI capability. The library choice is unchanged — `tech-stack.md` v2 closed OQ-TS-6
on `shadcn/ui` on Radix, the same choice the original made — so the specs port directly. What
changed on the port, all of it to satisfy STD-UI:

- **`--success` no longer duplicates `--gain`.** They were byte-identical, which put market
  direction and system state on one hue and violated STD-UI-7. Status now owns red and green;
  direction keeps teal and amber.
- **Six severity tiers replace three status tokens.** STD-UI-12 needs `neutral`, `active`,
  `good`, `warning`, `serious` and `critical`; the original had `success`, `warning` and `info`.
- **A sequential ramp was added** (`--seq-1..5`). STD-UI-7 names four colour jobs and magnitude
  had no palette.
- **Data-vintage tokens were added** — `--value-missing`, `--value-indeterminate` and
  `--pattern-indeterminate`. STD-UI-4 and STD-UI-14 require three distinguishable states where
  the original had one; `--neutral-value` means a measured zero, not an absent one.
- **Density, type scale and spacing tokens were added.** The original carried only `--radius`
  and font families, and STD-UI-29 requires the rest.
- **Variants were added** to `badge` (severity tiers, coverage tri-state), `button` (`blocked`)
  and `data-table` (`expandable`), per `intake.md`'s preference for a variant over a new
  component.

## Why shadcn/ui

Components are copied into the consuming repository rather than installed as a dependency, so
the `<slug>/` layout matches this contract directly. Its theme is already CSS custom properties,
so `theme.css` needs no build step. Radix supplies documented keyboard and ARIA contracts per
primitive, which is the expensive half of each spec — and `tech-stack.md` v2 records that Biome
has no `jsx-a11y` equivalent, so behaviour the primitive guarantees is behaviour review does not
have to catch.

The trade-off is that shadcn/ui has no official Figma kit, so `component-map.json` starts empty
and the Figma-based `$ux-spec-extraction` path has no file keys to resolve. The automated
`$ux-design` path is unaffected.

## Beyond the starting set

The 11 components here cover the first UI capability of the original build, and most of what
CAP-001 needs. `intake.md` describes how to grow the set, and most gaps turn out to be a new
variant of an existing component rather than a new component.

**One known gap for CAP-001:** an indeterminate progress indicator, for an acquisition run whose
duration cannot be estimated. It is genuinely new rather than a variant. It is deliberately not
written here, because `intake.md` step 2.3 requires the interaction and accessibility contracts
to be derived from the upstream Radix primitive documentation rather than from memory. The
application-status region and the polled live region are compositions, not components, and
belong in the capability's `ux-design.md`.

## Financial tokens

`theme.css` carries semantics no off-the-shelf design system provides: gain/loss, factor
classification, data vintage, and paper vs real-money trade states. Three decisions worth
keeping:

- **Gain/loss is teal and amber, not green and red.** Red-green colour vision deficiency affects
  roughly 1 in 12 men, and gain/loss is the most repeated signal in the product. STD-UI-7 makes
  this the rule and reserves red and green for status.
- **`--risk-real-money` is distinct from `--destructive`.** Destructive means "this deletes
  something"; real-money means "this spends something". They must never look the same.
- **Absent, indeterminate and zero are three different colours.** A point-in-time product that
  renders "no observation" the same as "measured zero" is lying about its own data.
