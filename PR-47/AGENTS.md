# Project instructions — sabbatical planning

This repo does two jobs: **design** a long, flexible two-person sabbatical out of
Brazil, and **build** the static site that renders it. Both are ongoing — treat
each request as one step in a conversation, not a one-shot ticket. Be blunt about
trade-offs; they asked for it and will notice a glass-half-full answer.

## Part 1 — Planning

**D1 — Decompose first.**
Split every request into **outcome** (what they want), **constraints** (the
ledger), and **implementation** (one way to get there). Never evaluate an
implementation you invented as if it were the request. Open with one line:
*"I'm reading this as X; if you mean Y, the answer changes."*

**D2 — Enumerate the space, then score it.**
3–5 variants, varying *where*, *when*, and *how long* independently. Table, then
score — the table *is* the comparison. A single option plus a caveat is a failed
answer; anything that belongs in "you could also…" belongs in the table.

**D3 — Score against the ledger.**
`.opencode/trip-brief.md` § *Preference ledger* is authoritative. Say what each
proposal satisfies and what it works against. **Breaking a Must means redesign,
not reject; departing from a strong preference just needs to be argued.**

**D4 — A self-found objection is a design signal.**
If the draft says "the downside is X" and X is a ledger constraint, mutate the
proposal instead of shipping the objection.

**D5 — Iconic ≠ optimal.**
The famous version of a place is not automatically the right version for these two.

**D6 — Flexibility is a mandate to search.**
"Full flexibility", "feel free to change anything", "add/remove days" mean explore
more of the space — never restructure the first idea and call it done.

**D7 — Adversarial pass before sending.**
Name the cheapest / quietest / warmest / shortest / least-touristy version. If none
differ from the draft, the space wasn't explored.

**D8 — Time is elastic; stops are not.**
No fixed trip length, no fixed grand total. A cramped plan gets **more days**, not
less content. Any stop under 4 nights should justify itself; several 3-nighters in a row
usually means the shape is wrong, not fatal.

**D9 — Audit the whole trip.**
A recommendation about one chapter is a claim about all of them. Scan every chapter
and report only what is actually wrong:

| Check | Look for |
|---|---|
| Weather | Rainy / monsoon / typhoon / gloom season; "dry" that is really shoulder; heat and humidity |
| Holidays | National, regional, religious and school holiday peaks; long weekends; festivals — check each local calendar, never a memorised list |
| Closures | Weekly closing days; seasonal ferries, roads, passes, islands; maintenance |
| Logistics | Visa validity and re-entry; impossible same-day connections; transfer days that eat a stop; last boat or flight |
| Pacing | Stops under 4 nights; runs of 3-nighters; moves per fortnight |
| Geography | Backtracking; hops that don't advance the arc; what moves downstream — recompute dates and run-rate |
| Bookings | `todo-data.js` `done: true` before proposing to move a fixed date |

**D10 — Leave the repo smarter.**
Every session should sharpen the next one:
- **Decisions** — accepted or rejected, with the reason — go to
  `.opencode/decisions.md`.
- **Durable preferences or corrections** amend the ledger or this file *in the
  same turn*; say what changed.
- Durable only — no one-off logistics or moods. Amend before appending. Never
  silently reverse a settled decision; raise it first.
- Keep this file near 150 lines; merge or delete to make room.

**D11 — Think long, write short.**
Default to **one screen**. Lead with the answer and its tradeoff: no preamble, no
recap of the itinerary, no narrating the option table. Spend words on *why* and
*what it costs*, not on surveying. Long analysis goes in the PR body or
`decisions.md`, linked. Never cut: the recommendation, its main tradeoff, the cost
in days and money, and what would change the answer.

### Answer shape for design questions

Target **one screen**; never more than two. Depth goes into the reasoning, not the
survey.

1. Interpretation (one line)
2. Option table — 3–5 rows, one line per cell
3. Which preferences it trades, and what that buys
4. Whole-trip audit — only what is off
5. Recommendation + cost, and what would change it
6. Offer to implement

Do not narrate the table or restate the itinerary. Detail belongs in the PR body
or `decisions.md`, linked.

## Part 2 — Building the app

Static page, no server. `index.html` loads hand-written data scripts plus
precompiled `dist/*.js` bundles.

- **Edit `.jsx`, never `dist/`.** Run `./build.sh` to recompile the eight sources
  into `dist/*.js`.
- **Data lives in five plain scripts** (globals, not modules): `itinerary-data.js`
  (the plan — source of truth), `itinerary-geo.js` (coordinates),
  `itinerary-photos.js` (keyword → local image), `itinerary-store.js` (state +
  cache key), `todo-data.js` (bookings).
- **Cache invalidation is manual and mandatory.** Bump the matching `?v=` in
  `index.html` when a data or bundle file changes; bump `LS_KEY` in
  `itinerary-store.js` when the *shape* of saved state changes. Forgetting this is
  the classic "my change didn't appear" bug.
- **Photos are vendored** — no hotlinks. New image: add the file, map a keyword,
  credit it in `extra-pictures/CREDITS.md`.
- **Every data edit must pass** `node scripts/validate-photo-urls.mjs`, plus day
  sums, date continuity, geo coverage, budget arithmetic, and todo chapter ids.
- **Ship as a PR.** Comparison variants live on their own branches off the base,
  targeting `main`.

## Where things live

| Kind | Home |
|---|---|
| How to reason, what to output | this file |
| Identity, money, horizon, passport, what's fixed | this file → Hard facts |
| Scoreable criteria for *which plan wins* | `.opencode/trip-brief.md` → Preference ledger |
| Settled calls and rejected options | `.opencode/decisions.md` |
| What is booked / paid | `todo-data.js` (`done: true`) |
| The plan itself | `itinerary-data.js` |

Test: changes *which plan wins* → ledger. Changes *how a request is read* → hard
fact. Changes *how the work is done* → this file. On conflict, the data file wins
for dates and figures; the brief wins for constraints.

**Facts are claims.** Geography, visa rules, weather, and crowd calendars must be
verified or labelled as estimates. Never invent a flight, ferry, or border rule.

## Hard facts

- **Travelers:** 2 Brazilians (couple), carry-on + ~30L backpack each. Mid-range
  comfort; no luxury, no needless suffering.
- **Budget is a monthly rate, not a total.** ~**R$20k/month per person** (~R$40k
  for the couple ≈ ~$7.7k ≈ **$256/day for two**) — the current model already sits
  here. Extending needs no cuts elsewhere; cost scales with nights. Optimise the
  run-rate, never a grand total.
- **Horizon is elastic within 12–18 months.** No exact end date. Adding days to
  fix a cramped chapter is the default; delete a chapter only if it is weak on its
  own merits.
- **Committed = `done: true` in `todo-data.js`.** That file is the source of truth
  for what is booked, paid, or fixed. **Read it before proposing to move a date.**
- **Not in the todo, still fixed:** the Hong Kong / Shenzhen friend visit in late
  November. Everything else is negotiable, including snow dates and the trip end.
- **Brazilian passports.** Do not assume visa-free access or trust a stored table.
  Each entry is a routing decision with a cost — verify when it matters. See
  `.opencode/trip-brief.md` § Visa posture for the two consequences baked in.
