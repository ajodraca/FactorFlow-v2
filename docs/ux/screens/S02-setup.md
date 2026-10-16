---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S02
artifact_type: ux-screen-spec
artifact_version: 1
parent: PRODUCT-UX
title: "S02 First-run setup"
route: /setup
design_source: docs/ux/design-source/P02-Setup.dc.html
status: draft
created: 2026-10-15
updated: 2026-10-15
owner: Alvaro de Jodra
owner_github: ajodraca
ai_provenance:
  agent_id: ux-blueprint
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude
  tool_version: unknown
  timestamp: 2026-10-16T01:40:00Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "1"
    - id: CAP-001
      version: "8"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# S02 First-run setup

## 1. Purpose

Get from an empty install to scored stocks without reading documentation. It
replaces CAP-001's "set depth in Settings, then add instruments, then start a
run" sequence, which spread one task over three screens. Setup is a five-step
operation, so STD-UI-26 applies: steps visible, current position shown, retreat
without losing input.

## 2. Delivered by

| Step | Milestone | Backed by |
|------|-----------|-----------|
| 1 Market data | M1 | CAP-001 AC-13: credential presence, read from the environment |
| 2 How far back | M1 | CAP-001 AC-2, AC-22 |
| 3 Stocks to follow | M1 | CAP-001 AC-1, bulk paste |
| 4 Download data | M1 | CAP-001 run start, AC-23 queueing |
| 5 Paper trading account | M2 | Broker port, paper credential presence |

Before M2 the stepper shows four steps.

## 3. Layout

Two columns inside the 1180 px main region, `--space-6` apart.

1. **Step list** (260–300 px): `h1` *Get set up*, a sub-line on time and
   resumability, then the `stepper` `vertical`: each step has its number or
   check, a bold title and a one-line summary of what was chosen (*5 years of
   history*). Done steps are links back to that step.
2. **Step card** (fluid): *Step n of 5* in `--text-xs`, the step question as
   `h2` at `--text-xl`, an explanation paragraph capped at 70ch, the step's
   controls, an info note, then a footer row: **← Back: {previous step}**
   (`button` `ghost`) at the left; at the right, a *Next: …* hint and
   **Continue** (`button` `default`).

### Step content

| Step | Question | Controls |
|------|----------|----------|
| 1 | *Connect market data* | Read-only. `badge` *Found* / *Missing*; when missing, the environment variable name `FACTORFLOW_MASSIVE_API_KEY` and *Restart FactorFlow after setting it.* Never the value |
| 2 | *How far back should history go?* | `input` `numeric` with *years* suffix; plan-limit note (CAP-001 §6): *Your provider plan holds 5 years. A deeper depth is requested as stated…* |
| 3 | *Which stocks do you want to follow?* | `radio-group` `cards`: *Paste a list* / *Upload a CSV* / *Add later*; then `textarea` `list` with live parse result |
| 4 | *Download data for {n} stocks* | Summary of choices; **Start download** (primary). After start, `progress` `determinate` *{done} of {n} stocks* polled every 10 s, and *You can leave; this keeps running.* |
| 5 | *Connect your paper trading account* | Read-only presence of the broker paper key, as step 1 |

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Step list | `stepper` | `vertical` |
| Step container | `card` | `default` |
| Source choice | `radio-group` | `cards` |
| Symbols | `textarea` | `list` |
| Parse result | `badge` | `status-good` count; `status-warning` per rejected entry |
| Years | `input` | `numeric` |
| Download progress | `progress` | `determinate` |
| Key presence | `badge` | `status-good` / `status-critical` |
| Back / Continue | `button` | `ghost` / `default` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `steps[]` | `{id, title, summary, state: done/current/todo, href}` | setup state, derived from settings, followed list, downloads, broker config |
| `providerKey` | `found` / `missing` | runtime config |
| `historyYears` | integer or null | settings |
| `planHistoryYears` | integer | provider plan (5 on Stocks Starter) |
| `parse` | `{accepted: string[], duplicates: string[], rejected: {entry, suggestion}[]}` | client-side parse (CAP-001's `parse-bulk-symbols`) |
| `download` | `{state, done, total}` or null | latest download |
| `paperKey` | `found` / `missing` | runtime config (M2) |

## 6. Interactions

- **Continue** saves the step and moves on. **Back** returns without
  discarding: values entered in a later step are kept if the owner moves forward
  again (STD-UI-26).
- Step 3 parses on paste and on blur. Rejected entries never discard accepted
  ones; a near-miss suggests a fix (*did you mean BRK.B?*) as a button that
  applies it.
- A warning under step 3's count appears below 30 accepted symbols: *Factor
  scores need at least 30 stocks with complete data. With {n}, no factor can be
  ranked yet.* Continue stays available.
- Step 4 starts a download and lets the owner leave. Setup is complete when the
  first download has been started (not finished); `/` then routes to Home, which
  shows the running download.
- Settings later exposes every choice; setup can be reopened from Settings.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton step list; card skeleton |
| Empty, never populated | Step 1 current with nothing done |
| Empty, nothing found | Step 3 with zero accepted symbols: Continue is `button` `blocked`, reason *Paste at least one symbol, or choose Add later.* |
| Partial | Step 3 with rejected entries: counts for both, accepted kept |
| Stale | Not applicable: setup reads current configuration on load |
| Unavailable | Key presence not determinable while the API is unreachable: `coverage-unknown`, never *Missing* |
| Error | Save failure: field-level error naming the step and reason; values kept |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Sub-line | *About 10 minutes, then the data download runs on its own. You can leave and come back.* |
| Step 3 explanation | *FactorFlow downloads data and scores value, growth and momentum for these stocks. Scores rank stocks against each other, so a factor needs at least 30 stocks with complete data before it can rank anything. Start with 100 or more if you can.* |
| Parse note | *Whether the provider knows each one is checked during the download.* |
| Info note | *This is your followed list. You can add or stop following stocks any time in Data health. Stopping keeps their history; nothing is ever deleted.* |

## 9. Accessibility

- The step list is a `nav` labelled *Setup steps*; the current step has
  `aria-current="step"`.
- The step card is a `section` labelled by its `h2`; focus moves to that `h2`
  when the step changes.
- The parse result is a polite live region tied to the textarea by
  `aria-describedby`.
- The years suffix is part of the input's accessible name.

## 10. Acceptance checks

1. **S02-1** Every step shows its position (*Step n of N*) and the list shows
   what remains.
2. **S02-2** Going back and forward keeps every value entered.
3. **S02-3** A pasted list with invalid entries adds the valid ones; the invalid
   ones are named.
4. **S02-4** The provider key value never appears; only its presence and the
   variable name.
5. **S02-5** Fewer than 30 accepted symbols shows the ranking warning but does
   not block.
6. **S02-6** After the download starts, `/` routes to Home.

## 11. Differences from the canvas

- The canvas shows *Paper trading account* as step 5 in M1; §2 omits it until M2.
- The canvas's step-3 option *Upload a CSV* requires a file input not specified
  in the design system; it uses a native `input type="file"` inside `form` until
  a `file-input` component is specified.
