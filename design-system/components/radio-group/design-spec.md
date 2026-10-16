---
slug: radio-group
name: Radio Group
status: beta
source: shadcn/ui Radio Group — built on Radix Radio Group
upstream_docs: https://www.radix-ui.com/primitives/docs/components/radio-group
last_reviewed: 2026-10-15
---

# Radio Group

## 1. Purpose

Choose exactly one of two to five options that each need a sentence of
explanation: how to add stocks, what to do with an incomplete score, when a
live strategy starts.

**Use when:** one option must be chosen and the options differ in consequence.

**Do not use when:**
- More than five options — use `select`
- The choice is a display mode applied immediately — use `toggle-group`
- Options are independent — use `checkbox`

## 2. Variants

| Variant | When to use |
|---------|-------------|
| `default` | Vertical list; each option a bold title and one explanatory line |
| `cards` | Two or three options laid out as equal-width bordered cards, for a decision that frames the rest of a step (setup step 3). The selected card has a 1 px `--foreground` ring in addition to the filled radio |

## 3. Anatomy

Radio indicator, bold option title, optional *(recommended)* tag in
`--muted-foreground`, explanatory line in `--text-xs`.

## 4. Interaction Contract

From Radix Radio Group:

| Input | Result |
|-------|--------|
| `Tab` | Focuses the checked item, or the first item if none is checked |
| `Space` | Checks the focused item if it is unchecked |
| `ArrowDown` / `ArrowRight` | Moves focus to the next item and checks it |
| `ArrowUp` / `ArrowLeft` | Moves focus to the previous item (Radix documents focus movement only for this direction; verify checked-on-focus behaviour in implementation) |

- Roving tabindex: the group is one tab stop.
- `loop` defaults to true; `orientation` follows the variant.
- A recommended option is listed first and pre-selected only when choosing it
  has no capital-at-risk consequence.

## 5. Accessibility Contract

- **Role / ARIA:** Radix follows the WAI-ARIA Radio Group pattern;
  `role="radiogroup"` with a label naming the decision.
- **Screen reader:** each option's accessible name is its title; the
  explanatory line is its description.
- **Contrast and target size:** indicator border `--input`; whole option row or
  card is the target.

## 6. Tokens Used

| Purpose | Token |
|---------|-------|
| Indicator border / fill | `--input` / `--primary` |
| Card border / selected ring | `--border` / `--foreground` |
| Explanation | `--muted-foreground` |
| Focus ring | `--ring` |

## 7. Content Guidelines

Titles are short imperatives or nouns (*Skip the stock*, *Paste a list*). The
explanatory line says what happens, not why the option is good.

## 8. Do / Don't

| Do | Don't |
|----|-------|
| Explain each option's consequence | Rely on titles alone when outcomes differ |
| Mark one option *(recommended)* when there is a safe default | Pre-select an option that starts real-money trading sooner |

## 9. References

- Radix Radio Group: <https://www.radix-ui.com/primitives/docs/components/radio-group>
- WAI-ARIA APG Radio Group: <https://www.w3.org/WAI/ARIA/apg/patterns/radio/>
- shadcn/ui Radio Group: <https://ui.shadcn.com/docs/components/radio-group>
