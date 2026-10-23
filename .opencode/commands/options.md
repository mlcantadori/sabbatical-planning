---
description: Explore the option space for a design question before recommending anything
---

Design question: $ARGUMENTS

Follow the design-question protocol in `AGENTS.md`. Do **not** jump to a verdict.

1. **Interpretation.** One line: what outcome is being asked for, which
   constraints apply, and which implementation you are deliberately *not*
   assuming.
2. **Option space.** 3–5 concrete variants, varying *where*, *when*, and *how
   long* independently. Table: variant · shape · nights · what it costs · what
   it buys.
3. **Constraint check.** Score every variant against the Preference ledger in
   `.opencode/trip-brief.md` (P1–P12). Show pass/fail explicitly.
4. **Whole-trip audit.** Run the D13 checks across every chapter — weather,
   holidays, closures, logistics, pacing, geography, ripple, bookings. Report
   only what is actually off, with the chapter named.
5. **Recommendation.** Pick one, name the evidence that would flip it, and state
   the delta in days, money, and comfort.
6. **Do not edit trip files yet.** If the travelers choose a variant, log it in
   `.opencode/decisions.md` and implement it on its own branch as a PR.
7. **Update `AGENTS.md`** if the discussion surfaced a durable preference or
   correction (D12), and say what changed.

If a variant only appears as a caveat at the end, promote it into the table.
