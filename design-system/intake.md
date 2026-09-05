# Design Spec Intake

How to resolve a `COMPONENT-SPEC-GAP`.

The UX skills may only propose components that have a `design-spec.md` in
`design-system/components/<slug>/`. When a design needs something else, the skill records a
`COMPONENT-SPEC-GAP` and continues — it will not invent a component. This document is what to do
about that gap.

The gap is not a failure. It is the pipeline refusing to silently design against something that
does not exist.

## 1. Decide whether the gap is real

Work through these in order, and stop at the first that applies:

1. **An existing component covers it.** Check the "Do not use when" section of the closest
   specs — they name the correct alternative. Most gaps end here. Update the UX design to use
   the existing component and close the gap.
2. **It is a variant, not a component.** If it behaves like an existing component but looks or
   reads differently, add a row to that spec's Variants table instead of creating a new spec.
   Prefer this: a new variant costs a table row, a new component costs a spec, an
   implementation, and ongoing maintenance.
3. **It is a composition.** A screen region built from existing components — a filter toolbar,
   a summary header — belongs in the capability's `ux-design.md`, not here. This repository
   holds reusable components, not page layouts.
4. **It is genuinely new.** Continue to step 2 below.

## 2. Add the component

1. Confirm the component exists upstream in shadcn/ui, or can be built from a Radix primitive.
   If neither, reconsider — a bespoke component carries the accessibility burden itself.
2. Copy `docs/templates/design-spec.md` from the ai-agents repository and fill every section.
3. Derive the Interaction Contract and Accessibility Contract from the upstream Radix primitive
   documentation, which publishes keyboard interaction tables per primitive. Do not write these
   from memory.
4. Every colour in Tokens Used must resolve to a custom property that already exists in
   `theme.css`. If it does not, that is a separate decision — adding a token changes the design
   language and should be deliberate, not a side effect of adding one component.
5. Set `status: beta` until the component has been used in a shipped screen.
6. Leave the component's entry out of `component-map.json` unless a real design source exists.

## 3. Re-run the affected skill

Re-run `$ux-design` or `$ux-spec-extraction` for the capability. The gap should disappear from
the report. If `$specification-review` still reports it under D8, the slug in the design does not
match the directory name.

## Conventions

- **Slug** is lowercase, hyphenated, singular, and matches the directory: `data-table`, not
  `DataTables`.
- **One component per directory**, one `design-spec.md` per component.
- **The pipeline never writes here.** All three UX skills are read-only against this repository;
  every change is a deliberate human edit.
