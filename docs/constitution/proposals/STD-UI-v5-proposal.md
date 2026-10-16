---
artifact_id: STD-UI-v5-proposal
artifact_type: constitution-amendment-proposal
artifact_version: 1
amends: STD-UI
amends_version: "4"
proposed_version: "5"
title: "STD-UI v5 — amendments required by the product UX blueprint"
status: accepted
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
    - id: STD-UI
      version: "4"
    - id: PRODUCT-UX
      version: "1, draft"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# Proposal: STD-UI v5

> **Accepted in full by the owner on 2026-10-15.** A-1 to A-5 are applied in
> `docs/constitution/standards/ui-conventions.md` v5, and `design-system/theme.css`
> is corrected per A-4. The *If rejected* notes below are kept as the record of
> the alternatives that were considered.

`docs/ux/product-ux-blueprint.md` (PRODUCT-UX v1) depends on four changes to
STD-UI v4 and one correction to `design-system/theme.css`. STD-UI §5.1 requires
the owner's approval and a new `artifact_version` for any amendment, so they are
proposed here rather than applied. Each is independent; the owner may accept
some and reject others. The blueprint names the fallback for each rejection.

## A-1 — STD-UI-1: display labels (blueprint D-1)

**Current rule (v4).** User-visible text MUST use the product's domain
vocabulary: *instrument, universe, acquisition run, coverage, observation,
history depth, trading day, gap, retired, factor, classification, strategy,
promotion, paper, live, kill switch.*

**Problem.** Several domain terms are precise for the system and opaque to the
owner reading a screen: *acquisition run* for a data download, *retired* for a
stock no longer followed, *not classified* for a score that could not be formed.
The rule's purpose — no generic or implementation vocabulary, one name per
concept — is served equally by a fixed display label.

**Proposed rule text.**

> **Rule:** User-visible text MUST use the product vocabulary below. Each
> concept has one **domain term**, used in code, API, persistence, logs and
> SDD documents, and at most one **display label**, used in user-visible text.
> Where a display label is defined, user-visible text MUST use it and MUST NOT
> use the domain term or any other synonym. Text MUST NOT substitute generic
> terms — job, sync, import, task, item, object, entity, record, delete — for a
> named concept, and MUST NOT surface implementation vocabulary (null,
> undefined, exception, timeout, 500).
>
> | Domain term | Display label |
> |-------------|---------------|
> | instrument (on the acquisition list) | followed stock |
> | retire (an instrument) | stop following |
> | acquisition run | download |
> | run outcome succeeded / partial / failed / cancelled / abandoned | Complete / Partial / Failed / Cancelled by you / Interrupted |
> | not classified | Incomplete |
> | not enough stocks to rank | Not enough to rank |
> | classification | score |
> | promotion | review (the stage) / go live (the action) |
> | kill switch | Stop all trading (control) / Trading stopped (state) |
> | universe, coverage, observation, history depth, trading day, gap, factor, strategy, paper, live | unchanged |
>
> New concepts: gate, rebalance, limit, benchmark, market period.

**Specialization:** unchanged (permitted: a capability MAY add a concept with
its domain term and display label, recorded in its UX brief).

**Blast radius (STD-UI §5.2).** CAP-001 records STD-UI-1 *yes*; its shipped
strings change (Runs → Downloads, Instruments → Followed stocks, Retire →
Stop following). CAP-002 records *yes* and is still a draft. Both are re-reviewed
for STD-UI-1 only.

**If rejected:** the blueprint's domain-term column (§7) is implemented as the
user-visible text.

## A-2 — STD-UI-20: close OQ-UI-5 (blueprint D-4)

**Proposal.** Close OQ-UI-5 as *yes*: promotion captures the owner's written
rationale. The clause's authority changes from *internal policy pending OQ-UI-5*
to *owner decision, {date}*. Rule text is unchanged.

**If rejected:** S07 keeps the field as optional and the go-live button does not
count it.

## A-3 — STD-UI-12: the owner-engaged stop is neutral (clarification)

**Proposal.** Add to STD-UI-12's mapping: *trading stopped by the owner* is
**neutral**; *trading stopped by a limit or the broker* is **serious**. Add a
sentence: *A neutral state that changes what the product does on every screen
is made prominent by placement and words, not by fault colour.* This states
what the rule already implies, so the kill switch's stopped state is never drawn
as a failure.

## A-4 — STD-UI-11: the environment channel outside the region (blueprint D-5)

**Current.** STD-UI-11 requires the persistent environment region.
`theme.css` adds that the region *uses these [risk] tokens and nothing else uses
them*. The `badge` spec, however, already defines `paper` and `real-money`
variants.

**Proposal.** Add to STD-UI-11: *The `--risk-paper` and `--risk-real-money`
tokens MAY mark which environment a thing belongs to — a badge, a tile label, a
column heading, a progress indicator for paper days — always alongside the
environment in words. They MUST NOT be used for anything that is not tied to an
environment.* Correct the `theme.css` comment to match.

**If rejected:** S01, S04 and S08 replace environment-coloured labels with
`badge` `outline` plus the environment shape and words.

## A-5 — STD-UI-29: page ground (no new token)

No rule change. Recorded so a reviewer does not raise it: the blueprint's page
ground is `hsl(var(--muted) / 0.5)` over `--background`, an alpha of an existing
token, not a new value. Text on it uses the same pairs validated against
`--muted` and `--background` in `design-system/theme-validation.md`.

## Decision

| Amendment | Outcome | Applied in |
|-----------|---------|------------|
| A-1 STD-UI-1 display labels | Accepted 2026-10-15 | STD-UI-1 |
| A-2 Close OQ-UI-5 | Accepted 2026-10-15 | STD-UI-20, §5.3 |
| A-3 STD-UI-12 trading-state mapping | Accepted 2026-10-15 | STD-UI-12 |
| A-4 STD-UI-11 environment tokens | Accepted 2026-10-15 | STD-UI-11, `theme.css` |
| A-5 STD-UI-29 page ground | Accepted 2026-10-15 | STD-UI-29 verification |

## Revision of STD-UI on acceptance

On acceptance, STD-UI moves to `artifact_version: 5` with a revision-history
row naming each accepted amendment, and §5.3 marks OQ-UI-5 closed (if A-2 is
accepted). Rule numbering does not change.
