---
description: Run the full itinerary review gauntlet (Nepal onward) with the specialist team
agent: itinerary-coordinator
subtask: true
---

Run the full itinerary review via the coordinator's run procedure.

- Scope: all in-scope chapters (`nepal` → `china-spring`) unless $ARGUMENTS narrows it
  (e.g. `/review-trip taiwan` dry-runs a single chapter, `/review-trip japan philippines`
  covers a range — pass the narrowed scope to every specialist).
- Reports go to `reviews/<today's YYYY-MM-DD>/` (create it first): one per specialist
  plus `verdict.md` with the must/should/could change list, tradeoff tables,
  conflict-resolution log, validation results, and open questions for the travelers.
- Locked chapters (brasil → india) and locked bookings/flights per
  `.opencode/trip-brief.md` are immutable context — no recommendation may contradict them.
- Do not edit any trip files. End with the verdict summary and questions.
