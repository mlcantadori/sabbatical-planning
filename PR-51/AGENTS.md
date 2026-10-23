# Project instructions — sabbatical planning

Long-horizon travel design for a two-person sabbatical out of Brazil. **Length is
not fixed and the budget is a rate, not a total.** Adding or removing chapters,
stops, and days is ordinary work here — not a last resort.

Most requests are **design questions** ("what if we…", "is this good?", "should
we…") with wide latitude, not implementation tickets. Answer them as design
questions.

## Design-question protocol

**D1 — Decompose before answering.**
Every request has three layers:
- **Outcome** — what the travelers actually want ("spend NYE in Taiwan").
- **Constraints** — hard preferences and locked dates (see the ledger).
- **Implementation** — one specific way to get there ("Taipei 101").

Never evaluate an implementation you invented as though the user asked for it.
Open with one line stating your reading: *"I'm reading this as X; if you mean Y,
the answer changes."*

**D2 — Enumerate 3–5 variants before scoring any.**
Vary *where*, *when*, and *how long* independently. Present the option space as a
table, then score it. A single option plus a caveat is a failed answer.

**D3 — Score against the preference ledger.**
`.opencode/trip-brief.md` § *Preference ledger* is authoritative. Every proposal
states which constraints it satisfies and which it breaks. **A proposal that
breaks a hard constraint gets redesigned, not rejected.**

**D4 — A self-found objection is a design signal.**
If the draft says "the downside is X" and X is a ledger constraint, stop and
mutate the proposal instead of shipping the objection.

**D5 — No buried alternatives.**
If a better option only appears in "you could also…", it belongs in the main
comparison. Promote it or delete it.

**D6 — Iconic ≠ optimal.**
The famous version of a place is not automatically the right version for these
travelers. Check the canonical choice against the ledger before adopting it.

**D7 — Flexibility is a mandate to search.**
"Full flexibility", "feel free to change anything", "add/remove days" mean
explore more of the space — never restructure the first idea and call it done.

**D8 — Adversarial pass before sending.**
Ask: what is the *cheapest / quietest / warmest / shortest / least-touristy*
version? If none differ from the draft, the space wasn't explored.

**D9 — Log the decision.**
Every accepted or rejected option goes in `.opencode/decisions.md` with the
reason. Future sessions must not silently re-collapse a settled question.

**D10 — Time and money are elastic.**
There is no fixed trip length and no fixed grand total. If a plan feels cramped,
the default fix is to **add days**, not to cut content. Propose extensions
explicitly, with the monthly run-rate impact. Never compress a good stop to fit
an arbitrary number of days.

**D11 — 3 nights is a warning, not a default.**
Any stop under 4 nights must justify itself (a genuinely tiny place, a ferry
bridge, or a transit night). If several stops are at 3 nights, the shape is
wrong — cut a base or add days.

### Required output shape for design questions

1. Interpretation (one line)
2. Option space (3–5 variants, table)
3. Constraint check (which ledger items pass / fail)
4. Recommendation, and what evidence would change it
5. Offer to implement

## Hard facts

- **Travelers:** 2 Brazilians (couple), carry-on + ~30L backpack each. Mid-range
  comfort; no luxury, no needless suffering.
- **Budget is a monthly rate, not a total.** Working figure: **~R$20k/month**
  (confirm whether per person or per couple). Extending the trip is allowed and
  does not require cuts elsewhere — the model scales with nights. Optimise the
  monthly run-rate, never a grand total.
- **Horizon is elastic.** No hard end date is assumed. If a plan is cramped, add
  days. If a chapter is weak, delete it. Do not defend a number that came from an
  earlier draft.
- **Hard commitments** (everything else is negotiable): Raja Ampat liveaboard
  Mar 11–20; Hong Kong Nov 23–28 + the Shenzhen friend visit; Nepal trek
  Oct 25–Nov 4; already-bought flights (GRU→YYZ→ATH Aug 27, VNS→KTM Oct 21,
  KTM→PEK Nov 7) and the Beijing stay Nov 7–16. The Myoko snow week is a
  preferred anchor, not a booked one — confirm before treating it as fixed.
- **Visas (Brazilian passport) are a routing constraint, not a detail.** The
  full matrix lives in `.opencode/trip-brief.md` § Visa matrix. The expensive
  ones are **Taiwan** (visitor visa, TECO filing, 3–5 business days), **India**
  (e-visa), **Azerbaijan** (e-visa), **South Korea** (K-ETA), and **Nepal**
  (visa on arrival). China is 30-day visa-free through 2026; a 2027 entry needs
  an L visa unless the waiver renews. Indonesia's 30 days are non-extendable —
  a second stay needs an exit and re-entry.

## Domain guardrails

- `itinerary-data.js` is the single source of truth; `.opencode/trip-brief.md`
  holds preferences and locked items. On conflict, the data file wins for
  dates/figures, the brief wins for constraints.
- Never contradict a locked booking or locked chapter without flagging it
  explicitly as a proposal that requires re-booking.
- Geography, visa rules, seasonal weather, and crowd calendars are factual
  claims: verify them or label them as estimates. Do not invent flight routes,
  ferry services, or border rules.
- After editing trip data: run `node scripts/validate-photo-urls.mjs`, then check
  chapter/place day sums, date continuity, geo coverage, budget arithmetic, and
  todo chapter ids. Never ship a plan whose numbers don't add up.
- Ship itinerary changes as PRs. Keep comparison variants on separate branches
  off the base branch, targeting `main`.
- Be blunt about trade-offs. The travelers asked for brutal honesty, not
  reassurance, and they will notice a glass-half-full answer.
