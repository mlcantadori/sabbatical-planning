# Trip brief — Asia sabbatical 2026–2027 (agent source of truth)

> **Precedence:** if this brief disagrees with `itinerary-data.js`
> on dates, figures, or chapter content, **the data file wins**. This brief defines traveler preferences, review scope, and
> locked constraints.
> Dates below are a snapshot as of 2026-09-15; always confirm against the data files.

## Travelers & style

- 2 Brazilians (couple), carry-on + ~30L backpacks only. No checked-luggage logistics anywhere.
- Mid-range comfort: good value, local charm. No luxury, no hardcore-backpacker
  suffering ("perrengue"), no moving every 2 days, no insane logistics for checklist completion.
- Trip: Jun 21 2026 → Jun 16 2027, 360 days. Budget model: **~USD 94k for two
  (~USD 261/day, ~R$245k per person at R$5.20)**, all figures USD for a couple.
- Strategic splurges (locked, do not re-litigate): the Raja Ampat liveaboard, a
  Japan snowboarding block (rentals + lessons), the Cappadocia balloon + cave
  hotel, and one ryokan night.

## Philosophy (what "good" looks like)

- Cinematic life chapter: emotionally well-paced, seasonally optimized, immersive, not rushed.
- Temporary-life slow chapters are structural, not inefficiency. Protect the long
  stays in `itinerary-data.js` instead of moving every few days.
- China is mentally exhausting — decompression must follow each China block.
- Geographic efficiency is a hard constraint: no regional backtracking; every hop
  moves forward along the arc unless a seasonal reason justifies it explicitly.
- Awe-per-month over destination count. Cut traps, keep wonder.

## Preference ledger (score every proposal against this)

**Hard — breaking one means redesign the proposal, not reject the idea.**

| # | Constraint | Notes |
|---|---|---|
| P1 | **No gray / low-sun chapters** | Prefer dry, bright, mild. Reject a place in its gloomiest window even when the destination is good. |
| P2 | **Avoid holiday crowds** | Treat national, regional, religious and school holiday peaks as no-go. Check the local calendar for each stop and shift dates rather than fight the crowd — long weekends and festival weeks count. |
| P3 | **No moving every 2 days** | 4+ nights is the default. **3 nights is a warning; 2 only for a genuinely small place or a transit night.** Several 3-night stops in a row = wrong shape. |
| P4 | **Thailand coast/islands are a must** | Not tied to a particular month. |
| P5 | **Few immovable dates** | Committed items are whatever is `done: true` in `todo-data.js` — read it, never keep a parallel list. The one fixed thing with no booking record is the Hong Kong / Shenzhen friend visit in late November. Everything else is negotiable, including snow dates and the trip end. |
| P6 | **Japan snowboarding is a primary objective** | Quality over dates and over location — the resort region is flexible. Wants a **dedicated multi-week block with rest days** on good snow, not scattered days. Prefer fewer crowds: avoid holiday peaks and weekends where practical. **Extra snow time comes out of Japan's city nights, never out of the warm-weather block.** |
| P7 | **No repeat sightseeing** | Bangkok/Chiang Mai, Vietnam, Cambodia, Laos main sights are done. A few Bangkok days are acceptable. |
| P8 | **Beaches must earn their nights** | A-tier water or exceptional scenery. B-tier sand is not worth peak-season prices when better water comes later in the trip. |
| P9 | **Forward-only geography** | No needless backtracking; every hop advances the arc unless a season justifies it explicitly. |
| P10 | **Budget is a monthly rate, not a total** | Working figure ~R$20k/month (confirm per person vs couple). Extending the trip is allowed; state the monthly run-rate impact, not a grand total. |
| P11 | **Horizon is elastic** | Prefer adding days over cutting places. A cramped chapter is a scheduling bug, not a reason to delete a good stop. |
| P12 | **Visas are a real cost** | Days, fees, and rejection risk count. Weigh a country's visa burden against what it adds. |

**Soft**
- Variety beats a second helping of the same biome.
- Prefer a new country when the marginal beach night is B-tier.
- Keep one decompression stop after each China block.

## Visa posture (Brazilian passport)

No country-by-country table — requirements change and a stale table is worse than
none. **Passport: Brazilian.** Verify each entry when it matters, and treat a
costly visa as a **P12** reason to restructure, not a formality.

Two structural facts shape the route, so confirm them rather than assume:

- **Indonesia** grants a short, non-extendable visa-free stay. A second stay needs
  an exit and re-entry — which is why Malaysian Borneo sits between Indonesia A and B.
- **China's** visa-free window plus its SAR resets (Hong Kong, Macau) are why the
  route has two mainland entries rather than one continuous stay.

## Sports (bounded lens — breadth first)

- Both travelers: AOW + Nitrox certified, own mask + dive computer (rent the rest).
- Snowboard: one dedicated Japan snowboarding block (full local rental + English
  lessons). Region flexible. Kite: gear owned, used in Cumbuco (locked chapter).
- Rule: booked sports blocks are fixed. Elsewhere, only flag a 1–3 day
  dive/kite/ride window where it fits an existing stop naturally — never reshape
  a chapter around sports.

## Review scope

- **In scope (may propose changes):** every chapter after the last locked one — see
  the chapter table. Locked is per-chapter, not per-date.
- **Locked (immutable context, never propose against):** chapters `brasil`,
  `toronto`, `athens`, `turkey`, `baku`, `india` — all booked. Plus locked items
  *inside* scope (see below).

## Chapter table (snapshot — confirm dates in data files)

| # | id | Dates | Status |
|---|---|---|---|
| 1 | brasil | 2026-06-21 → 2026-08-26 | LOCKED |
| 2 | toronto | 2026-08-27 → 2026-09-01 | LOCKED (flights bought) |
| 3 | athens (Greece) | 2026-09-01 → 2026-09-21 | LOCKED (7 stays + 4 ferries booked) |
| 4 | turkey | 2026-09-21 → 2026-10-12 | LOCKED (balloon Sep 22/23 cancelled — weather, refunded) |
| 5 | baku | 2026-10-12 → 2026-10-14 | LOCKED (stopover program) |
| 6 | india | 2026-10-14 → 2026-10-21 | LOCKED (compact: Agra day trip Oct 15, train to Varanasi Oct 17 06:00 booked ✅, VNS→KTM Oct 21 08:30 booked ✅ $343) |
| 7 | nepal | 2026-10-21 → 2026-11-07 | SCOPE (ABC trek Oct 25–Nov 4 LOCKED inside; KTM→PEK Nov 7 late arrival) |
| 8 | china-e1 | 2026-11-07 → 2026-11-23 | SCOPE (16d slow-Beijing start: 9n Beijing incl. trek recovery → Huangshan canyon → HGH/SUZ gardens; south moved to E2 after HK reset) |
| 9 | hk | 2026-11-23 → 2026-11-28 | SCOPE (visa reset + Taiwan-visa filing Nov 24) |
| 10 | china-e2 | 2026-11-28 → 2026-12-24 | SCOPE (26d: CAN 2n + Shenzhen 4n (rendezvous tail) + Macau 2n + CQ 6n + Chengdu 6n + Shanghai 6n; PVG→PUS direct Dec 24) |
| 11 | korea | 2026-12-24 → 2027-01-08 | SCOPE (15d: Busan Christmas + Gyeongju + Jeonju + NYE Seoul 9n) |
| 12 | taiwan | 2027-01-08 → 2027-01-25 | SCOPE (17d post-Korea thaw: Taipei 5n + Alishan 2n + Tainan 5n + Kaohsiung/Xiaoliuqiu 5n; KHH→KIX direct Jan 25) |
| 13 | japan | 2027-01-25 → 2027-02-24 | SCOPE (Myoko Kogen + Madarao snowboard week Feb 14–23 inside) |
| 14 | indonesia-a | 2027-02-24 → 2027-03-21 | SCOPE (Java + Bali staging, liveaboard Mar 11–20 LOCKED inside; Entry 1 Feb 24–Mar 21) |
| 15 | borneo | 2027-03-21 → 2027-03-31 | SCOPE (Mar 31 shared transit; Sipadan permits undecided, decide by Nov 2026) |
| 16 | philippines | 2027-03-31 → 2027-04-14 | SCOPE (post-Easter window) |
| 17 | indonesia-b | 2027-04-14 → 2027-04-30 | SCOPE (Entry 2 Apr 14–30) |
| 18 | singapore | 2027-05-01 → 2027-05-06 | SCOPE (5d) |
| 19 | malaysia | 2027-05-06 → 2027-05-16 | SCOPE (KL 4n + Penang 6n) |
| 20 | thailand | 2027-05-16 → 2027-05-30 | SCOPE (Tao 6d, Samui transit) |
| 21 | china-spring | 2027-05-30 → 2027-06-16 | SCOPE (fly home Jun 16; no buffer — out via Changsha transit) |

## Committed (never contradict)

The authoritative list is **`todo-data.js`**: anything with `done: true` is
booked, paid, or fixed — flights, stays, permits, cars. Read it directly; this
section deliberately keeps no copy that could drift.

The only commitment with no booking record is the **Hong Kong / Shenzhen friend
visit in late November**.
