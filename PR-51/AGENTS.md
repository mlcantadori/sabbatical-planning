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

**D12 — Keep this file current.**
When a conversation reveals something durable — a new preference, a correction, a
constraint, a rejected option with a reason — amend `AGENTS.md` or the ledger in
the same turn, and say what changed. Rules for doing it:
- Encode **durable** lessons only, not one-off logistics or moods.
- Amend before appending. Keep this file near ~150 lines; merge or delete when it
  creeps past.
- Never silently reverse a settled decision — say so before changing it.

**D13 — Audit the whole trip before recommending.**
A recommendation about one chapter is a claim about all of them. Before answering
any change question, scan every chapter and report only what is actually wrong:

| Check | Look for |
|---|---|
| Weather | Place in its rainy / monsoon / typhoon / gloom season; "dry season" that is really shoulder; heat and humidity mismatches |
| Holidays | CNY, Golden Week, NYE/Christmas, Songkran, Easter, Japan Golden Week, local school holidays, national and religious holidays |
| Closures | Museums closed Mondays; seasonal ferries, roads, passes, islands; cable cars under maintenance |
| Logistics | Visa validity and re-entry windows; impossible same-day connections; transfer days that eat a stop; last ferry/flight |
| Pacing | Stops under 4 nights, runs of 3-nighters, moves per fortnight |
| Geography & ripple | Backtracking; hops that don't advance the arc; what moves downstream; recompute the date chain and the run-rate |
| Bookings | Cross-check `todo-data.js` `done: true` before proposing to move a fixed date |

Report the finding and the fix, with the chapter named. No generic checklist
dumps.

### Where things live

- **D-rules here** — how to reason and what to output.
- **§ Hard facts here** — interpretive facts: identity, money, horizon, passport, what's fixed.
- **Preference ledger** — scoreable criteria that decide *which itinerary wins*.
- **`decisions.md`** — settled calls. **`todo-data.js`** — what's booked. **`itinerary-data.js`** — the plan.

Test: changes *which plan wins* → ledger. Changes *how a request is read* → hard
fact. Changes *how the model works* → D-rule. No trip taste here; this file loads
every session and has a size budget.

### Required output shape for design questions

1. Interpretation (one line)
2. Option space (3–5 variants, table)
3. Constraint check (which ledger items pass / fail)
4. Whole-trip audit (D13) — only what is actually off
5. Recommendation, and what evidence would change it
6. Offer to implement

## Hard facts

- **Travelers:** 2 Brazilians (couple), carry-on + ~30L backpack each. Mid-range
  comfort; no luxury, no needless suffering.
- **Budget is a monthly rate, not a total.** ~**R$20k/month per person** (~R$40k
  for the couple ≈ ~$7.7k ≈ **$256/day for two**) — the current model already sits
  here. Extending needs no cuts elsewhere; cost scales with nights. Optimise the
  run-rate, never a grand total.
- **Horizon is elastic within 12–18 months.** No exact end date. Adding days to
  fix a cramped chapter is the default move; delete a chapter only if it is weak
  in its own right. Do not defend a number that came from an earlier draft.
- **Committed = `done: true` in `todo-data.js`.** That file is the source of
  truth for what is actually booked, paid, or fixed — flights, stays, permits,
  cars. **Read it before proposing anything that would move those dates.** Never
  assume something is flexible just because it isn't described here.
- **Not in the todo, still fixed:** the Hong Kong / Shenzhen friend visit in late
  November (a social commitment with no booking record). Everything else is
  negotiable, including the Myoko snow week and the trip end date.
- **Travelers hold Brazilian passports.** Do not assume visa-free access and do
  not trust a stored table — requirements change. Treat every entry as a routing
  decision with a cost (fees, lead time, rejection risk) and verify the current
  rule when it matters. A handful of rules are **structural to the current
  route** — listed in `.opencode/trip-brief.md` § Routing-critical visa facts.
  Breaking one breaks the itinerary, so confirm rather than assume.

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
