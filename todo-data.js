// Advance-booking checklist — one entry per thing that must be secured ahead:
// inter-chapter transport, stays, car rentals, attractions with scarce
// capacity, visas/permits. Day-to-day purchases (ferries you buy at the
// port, walk-in food) stay out on purpose.
//
// Shape: { id, ch, place, cat, title, note, due, done }
//   ch    — chapter id, or 'prep' for the before-you-leave group
//   place — sub-chapter / stop the item belongs to (optional)
//   cat   — transport | stay | car | attraction | visa | admin
//   due   — book-by date (YYYY-MM-DD). Drives overdue highlighting.
//   done  — status IN THIS FILE (the durable record). Ticks in the UI are
//           kept in the browser too; use the page's Export button to copy
//           current states back here and commit them.
// done:true is only set where a source confirms it (✅ / locked / actual /
// traveler-confirmed). Everything else defaults to false to confirm.

window.TODO_ITEMS = [
  // ── before you leave ──────────────────────────────────────────────
  { id: 'prep-1', ch: 'prep', place: null, cat: 'admin', title: 'Credit-card travel insurance (60-day cover)', note: 'Covers the first 60 days only — SafetyWing takes over before Nepal', due: '2026-06-01', done: true },
  { id: 'prep-2', ch: 'prep', place: null, cat: 'admin', title: 'Passports valid 6+ months past Jun 2027', note: 'BR passports; needed for every visa-on-arrival', due: '2026-06-01', done: true },
  { id: 'prep-3', ch: 'prep', place: null, cat: 'car', title: 'International Driving Permit', note: 'Needed for the Greece + Turkey rentals', due: '2026-08-15', done: true },

  // ── brasil (past) ─────────────────────────────────────────────────
  { id: 'brasil-1', ch: 'brasil', place: null, cat: 'transport', title: 'São Paulo→Toronto→Athens flights', note: '$1,700 for two, locked', due: '2026-05-01', done: true },
  { id: 'brasil-2-rio-fortaleza', ch: 'brasil', place: null, cat: 'transport', title: 'Flight Rio→Fortaleza', note: '~$750 for both internal flights, actual', due: '2026-06-01', done: true },
  { id: 'brasil-2-fortaleza-sp', ch: 'brasil', place: null, cat: 'transport', title: 'Flight Fortaleza→SP', note: '~$750 for both internal flights, actual', due: '2026-06-01', done: true },
  { id: 'brasil-3-rio', ch: 'brasil', place: 'Rio', cat: 'stay', title: 'Rio Airbnb', note: 'R$7,000', due: '2026-05-31', done: true },
  { id: 'brasil-3-cumbuco', ch: 'brasil', place: 'Cumbuco', cat: 'stay', title: 'Cumbuco monthly rental', note: '$1,900/mo', due: '2026-06-29', done: true },
  { id: 'brasil-3-sp', ch: 'brasil', place: 'São Paulo', cat: 'stay', title: 'São Paulo Airbnb', note: 'R$1,400', due: '2026-07-29', done: true },
  { id: 'brasil-4', ch: 'brasil', place: 'Petrópolis', cat: 'attraction', title: 'Petrópolis–Teresópolis trail booking', note: 'R$4,000, locked', due: '2026-06-01', done: true },

  // ── toronto (past) ────────────────────────────────────────────────
  { id: 'toronto-1', ch: 'toronto', place: null, cat: 'stay', title: "Friend's place", note: 'Lodging free; confirm arrival day', due: '2026-08-06', done: true },

  // ── athens (past) ─────────────────────────────────────────────────
  { id: 'athens-1-athens', ch: 'athens', place: 'Athens', cat: 'stay', title: 'Athens stays Sep 1–5 + Sep 20–21', note: 'Booked — 4n opening + buffer night after the Milos ferry, before the Sep 21 flight to Cappadocia', due: '2026-08-11', done: true },
  { id: 'athens-1-chania', ch: 'athens', place: 'Chania', cat: 'stay', title: 'Chania stay Sep 5–9', note: 'Booked', due: '2026-08-15', done: true },
  { id: 'athens-1-rethymno', ch: 'athens', place: 'Rethymno', cat: 'stay', title: 'Rethymno stay Sep 9–12', note: 'Booked', due: '2026-08-19', done: true },
  { id: 'athens-1-santorini', ch: 'athens', place: 'Santorini', cat: 'stay', title: 'Santorini stay Sep 12–14', note: 'Booked', due: '2026-08-22', done: true },
  { id: 'athens-1-folegandros', ch: 'athens', place: 'Folegandros', cat: 'stay', title: 'Folegandros stay Sep 14–16', note: 'Booked', due: '2026-08-24', done: true },
  { id: 'athens-1-milos', ch: 'athens', place: 'Milos', cat: 'stay', title: 'Milos stay Sep 16–20', note: 'Booked (checkout adjusted 22→20)', due: '2026-08-26', done: true },
  { id: 'athens-2', ch: 'athens', place: null, cat: 'transport', title: '4 inter-island ferries', note: '€685 actual', due: '2026-08-15', done: true },
  { id: 'athens-3', ch: 'athens', place: 'Chania', cat: 'car', title: 'Chania rental car', note: '~$240, rented', due: '2026-08-20', done: true },
  { id: 'athens-4', ch: 'athens', place: 'Milos', cat: 'attraction', title: 'Kleftiko boat', note: 'Booked — €140 pp', due: '2026-09-08', done: true },

  // ── turkey (current) ──────────────────────────────────────────────
  { id: 'turkey-1', ch: 'turkey', place: 'Göreme', cat: 'attraction', title: 'Hot-air balloon Sep 22/23 — cancelled (weather), refunded', note: 'Royal / Butterfly Balloons — full refund received', due: '2026-09-01', done: true },
  { id: 'turkey-2', ch: 'turkey', place: 'Göreme', cat: 'stay', title: 'Göreme stay Sep 21–24', note: 'Booked', due: '2026-08-31', done: true },
  { id: 'turkey-3-alacati', ch: 'turkey', place: 'Alaçatı', cat: 'stay', title: 'Alaçatı stay Sep 24–27 (3n)', note: 'Room from Sep 24 for the 1am Sep 25 arrival — booked; drives to Şirince on Sep 27', due: '2026-09-03', done: true },
  { id: 'turkey-3-sirince', ch: 'turkey', place: 'Şirince', cat: 'stay', title: 'Şirince stay Sep 27', note: 'Booked', due: '2026-09-06', done: true },
  { id: 'turkey-3-kas', ch: 'turkey', place: 'Kaş', cat: 'stay', title: 'Kaş stay Sep 28 – Oct 1 (3n)', note: 'Booked', due: '2026-09-07', done: true },
  { id: 'turkey-3-akyaka', ch: 'turkey', place: 'Akyaka', cat: 'stay', title: 'Akyaka stay Oct 1', note: 'Booked', due: '2026-09-10', done: true },
  { id: 'turkey-4', ch: 'turkey', place: 'Izmir', cat: 'car', title: 'Izmir rental car Sep 25 – Oct 2', note: 'Collect ~1am Sep 25; loop Alaçatı→Şirince→Kaş→Akyaka; return Oct 2 — rented, €220', due: '2026-09-20', done: true },
  { id: 'turkey-5', ch: 'turkey', place: null, cat: 'transport', title: 'Kayseri→Izmir Sep 24 22:50', note: 'Bought', due: '2026-09-01', done: true },
  { id: 'turkey-6', ch: 'turkey', place: null, cat: 'transport', title: 'Izmir→Istanbul Oct 2 19:45', note: 'Moved to Oct 2 — bought', due: '2026-09-28', done: true },
  { id: 'turkey-7', ch: 'turkey', place: null, cat: 'transport', title: 'Istanbul→Baku Oct 12 + Baku→Delhi Oct 14', note: 'Bought (same ticket via Baku)', due: '2026-09-01', done: true },
  { id: 'turkey-8', ch: 'turkey', place: null, cat: 'visa', title: 'India e-Visa', note: 'Done — issued for the Oct 14 entry', due: '2026-09-15', done: true },
  { id: 'turkey-9', ch: 'turkey', place: 'Istanbul', cat: 'stay', title: 'Istanbul stay Oct 2–12 (10n)', note: 'Chapter close — booked', due: '2026-09-11', done: true },

  // ── baku ──────────────────────────────────────────────────────────
  { id: 'baku-1', ch: 'baku', place: null, cat: 'visa', title: 'Azerbaijan ASAN e-Visa', note: 'Done — issued', due: '2026-10-05', done: true },
  { id: 'baku-2', ch: 'baku', place: 'Baku', cat: 'stay', title: 'Baku hotel (2n) — free stopover', note: 'No booking: the Azerbaijan Airlines stopover programme covers the hotel both nights, which is why the budget carries $0 lodging for Baku. Book the stopover when ticketing, not a room', due: '2026-09-01', done: true },

  // ── india ─────────────────────────────────────────────────────────
  { id: 'india-1', ch: 'india', place: 'Agra + Delhi + Varanasi', cat: 'transport', title: 'Agra–Delhi round trip + Delhi–Varanasi trains', note: 'Booked via IRCTC', due: '2026-09-01', done: true },
  { id: 'india-2', ch: 'india', place: 'Agra', cat: 'attraction', title: 'Taj Mahal sunrise tickets (Oct 15 day trip)', note: 'Bought online — done', due: '2026-10-13', done: true },
  { id: 'india-3', ch: 'india', place: 'Varanasi → Kathmandu', cat: 'transport', title: 'Varanasi→Kathmandu Oct 21 08:30 direct', note: 'Booked ✅ ($343 for two)', due: '2026-09-15', done: true },
  { id: 'india-4', ch: 'india', place: 'Delhi', cat: 'stay', title: 'Delhi stay Oct 14–17', note: 'Agra as Oct 15 day trip — booked; Greater Kailash 1 base', due: '2026-09-23', done: true },
  { id: 'india-5', ch: 'india', place: 'Varanasi', cat: 'stay', title: 'Varanasi stay Oct 17–21 (4n)', note: 'Booked ✅ — Airbnb R$1,081, near the ghats for dawn boat + evening Aarti', due: '2026-09-26', done: true },

  // ── nepal ─────────────────────────────────────────────────────────
  { id: 'nepal-2', ch: 'nepal', place: 'Annapurna', cat: 'attraction', title: 'ABC trek Oct 25 – Nov 4', note: 'Discovery World $1,440 for two — paid in full ($144 advance + $1,296 balance Oct 24); briefing + gear check done', due: '2026-09-01', done: true },
  { id: 'nepal-3', ch: 'nepal', place: 'Kathmandu', cat: 'stay', title: 'Kathmandu hotels (pre/post-trek)', note: 'Pre-trek Oct 21–25 booked ✅ ($171) + post-trek Nov 4–7 booked ✅ ($129); Pokhara transit covered by the trek', due: '2026-09-30', done: true },
  { id: 'nepal-4', ch: 'nepal', place: 'Kathmandu', cat: 'visa', title: 'ACAP permit + TIMS card', note: 'Handled via agency — done', due: '2026-10-21', done: true },
  { id: 'nepal-5', ch: 'nepal', place: null, cat: 'admin', title: 'SafetyWing plan before Nepal', note: 'Done — active for the trek window. Does NOT cover helicopter evacuation; the gap was accepted deliberately, not overlooked. Credit-card insurance covered the first 60 days only', due: '2026-10-15', done: true },
  { id: 'nepal-6', ch: 'nepal', place: null, cat: 'transport', title: 'Kathmandu→Beijing flight Nov 7 11:45–23:15', note: 'Booked ✅ ($477 for two) — Entry 1 starts Nov 7', due: '2026-09-30', done: true },
  { id: 'nepal-7', ch: 'nepal', place: 'Kathmandu', cat: 'visa', title: 'Nepal visa — apply + pay online', note: 'Applied + paid online — done', due: '2026-10-15', done: true },
  { id: 'nepal-8', ch: 'nepal', place: 'Kathmandu', cat: 'admin', title: 'Buy trekking gear in Thamel', note: 'Layers + essentials for ABC; bag + down jacket loaned by DWT — 9kg pp porter limit', due: '2026-10-22', done: true },

  // ── china-e1 ──────────────────────────────────────────────────────
  { id: 'china-e1-vpn', ch: 'china-e1', place: null, cat: 'admin', title: 'Buy + install VPN before China — per-trip only, then cancel', note: 'Bought ✅ — installed on both phones + laptop and tested before landing Nov 7. Covers E1 (Nov 7–23) + E2 (Nov 28 – Dec 6) on one 30-day plan; cancel after Dec 6, then buy a fresh plan for spring China (May 6 – Jun 2). Nothing needed for Malaysia/Thailand/Taiwan/Japan/Indonesia', due: '2026-11-06', done: true },
  { id: 'china-e1-1-beijing', ch: 'china-e1', place: 'Beijing', cat: 'stay', title: 'Beijing stay (8n)', note: 'Nov 7–15 — booked ✅ $472 total for 8 nights, incl. 2 slow hutong days upfront (trek recovery)', due: '2026-10-17', done: true },
  { id: 'china-e1-1-huangshan', ch: 'china-e1', place: 'Huangshan', cat: 'stay', title: 'Huangshan stay (3n, Tangkou — Zhaixi end)', note: 'Nov 15–18 in Tangkou, Zhaixi end: within 5–10min walk of the 新国线 transfer centre. Not the riverside strip 1.6–2.5km east (nicer dinners, but a 06:00 taxi you do not control) and not the hot-spring zone. No summit hotel: doubles ¥1,000–1,680, dorms sold out. Breakfast from 05:50 — the park shuttle leaves the transfer centre from 06:30 for the 07:00 cable · Booked ✅ — $84 for 3 nights (Nov 15–18), $28/n', due: '2026-10-26', done: true },
  { id: 'china-e1-1-hongcun', ch: 'china-e1', place: 'Hongcun', cat: 'stay', title: 'Hongcun stay (1n, inside the village)', note: 'Nov 18–19, Moon Pond or South Lake frontage (¥300–500, midweek Wednesday) — the dawn and dusk are the whole point. Back lanes are cheaper and quieter; ask for an upper floor. No cars inside: guesthouse meets you at the south-gate car park and moves packs by cart. Confirm they can register foreign passports. In from Tangkou 09:00 (¥15–25, 50–70min); out 09:00 Nov 19 for a late-morning Hangzhou train · Booked ✅ — $60 for 1 night (Nov 18–19)', due: '2026-10-26', done: true },
  { id: 'china-e1-1-hangzhou', ch: 'china-e1', place: 'Hangzhou', cat: 'stay', title: 'Hangzhou stay (4n)', note: 'Nov 19–23 — base Wulin Square / West Lake Cultural Square (Line 19 straight to HGH). Last night cannot move: booked 08:00 flight · Booked ✅ — $156 for 4 nights (Nov 19–23), $39/n', due: '2026-10-29', done: true },
  { id: 'china-e1-2', ch: 'china-e1', place: null, cat: 'admin', title: 'Confirm BR 30-day visa-free still holds', note: 'Confirmed ✅ — Brazil on the 30-day list through Dec 31, 2026; covers E1 + E2a/E2b entries', due: '2026-10-20', done: true },
  { id: 'china-e1-3', ch: 'china-e1', place: 'Beijing → Huangshan', cat: 'transport', title: 'Beijing→Huangshan HSR Nov 15 — G2553 07:17', note: 'Booked ✅ $176 for two — G2553, Beijing South 07:17, 21min later than the G87 the plan priced. Pre-dawn start stands; the station shuttle drops Tangkou the same afternoon (¥30, 45–60min, every 20–30min from the forecourt)', due: '2026-10-20', done: true },
  { id: 'china-e1-6-mountain', ch: 'china-e1', place: 'Huangshan', cat: 'attraction', title: 'Huangshan entry Nov 16 (¥190, real-name + timed)', note: 'Dated ticket, passport scan at the gate, single entry — buy it for Nov 16 and move it if the forecast turns. Real-name, timed, direction-specific (Yungu up / Yuping down). Nov 15–19 is the last full week before West Sea Canyon and Tiandu close for winter (1 Dec 2025 precedent). Buy it through the Tangkou guesthouse with your passport numbers (they register the date for you), or an OTA e-ticket — the scenic area sells direct only through a WeChat mini-programme, which wants Chinese mobile payment', due: '2026-11-10', done: false },
  { id: 'china-e1-6-reentry', ch: 'china-e1', place: 'Huangshan', cat: 'attraction', title: 'Day-2 Tiandu quota + second-entry re-reservation', note: 'Cannot be pre-booked: re-entry is re-reserved after the first check-in, against a daily quota, and Tiandu needs its own separate reservation (no reservation, no summit). Re-book the moment you exit on Nov 16 — only if Tiandu is open and the forecast is clear; if it is shut or murky, Nov 17 becomes Tachuan/Xidi/hot springs and Hongcun stays as booked', due: '2026-11-16', done: false },
  { id: 'china-e1-8', ch: 'china-e1', place: 'Beijing', cat: 'attraction', title: 'Mutianyu day — transport + entry (Tue 10 – Thu 12)', note: 'Pick the day by forecast, then book the night before. Mutianyu is 70km out: the public bus is a transfer at Huairou with no English, so for two a direct tourist shuttle from Dongzhimen (~¥80–100pp return) or a private car (~¥600–800 round trip) is the sane call. Entry online or at the visitor centre with passport; entry + one lift each way + toboggan lands around ¥200–250pp. Cable car reaches tower 14, chairlift tower 6, toboggan comes down from 6. Opens 07:30 — the tour buses land 09:30–11:00', due: '2026-11-08', done: false },
  { id: 'china-e1-5', ch: 'china-e1', place: 'Beijing', cat: 'attraction', title: 'Forbidden City tickets', note: 'Closed Mondays — only Nov 9 falls in this window; use Tue 10 – Sat 14. The Palace Museum sells no one-day tickets: real-name booking with passport, released 20:00 Beijing time exactly 7 days ahead (Nov 14 opens Nov 7 20:00), valid that day only, entry at Meridian Gate — morning check-in closes 12:00, last admission 15:30. Three cancellations in 180 days blocks you for 60, so never hold a placeholder date', due: '2026-11-05', done: false },
  { id: 'china-e1-4', ch: 'china-e1', place: 'Hangzhou → Hong Kong', cat: 'transport', title: 'HGH→HKG flight Nov 23 08:00 — booked ✅', note: 'Bought ✅ $183, 08:00–10:40; HK visa reset next. Wake 04:45: pre-booked taxi 05:20 (30–40min) or Line 19 from West Lake Cultural Sq 05:59 (~06:35 at T4). International check-in shuts 07:10 — the chapter\'s one irreversible failure', due: '2026-11-05', done: true },
  { id: 'china-e1-7', ch: 'china-e1', place: 'Hongcun → Hangzhou', cat: 'transport', title: 'Hongcun–Hangzhou HSR Nov 19 — G2396 13:30', note: 'Booked ✅ $33 for two — G2396 to Hangzhou EAST. Leave Hongcun by ~11:15 (bus 65–80min) for an hour of slack; not West, which adds 35min on Line 19', due: '2026-11-04', done: true },

  // ── hk ────────────────────────────────────────────────────────────
  { id: 'hk-1', ch: 'hk', place: null, cat: 'stay', title: 'Hong Kong stay', note: '5 nights Nov 23–28 (shoulder-season prices, with friends)', due: '2026-11-02', done: false },
  { id: 'hk-2', ch: 'hk', place: 'TECO', cat: 'visa', title: 'Taiwan visitor visa (2 pax) — TECO Hong Kong, Nov 24', note: 'Brazil passports need a visa: no visa-free, no online TAC. File during the HK stop (Nov 23–28) — go the morning of Nov 24; allow 3–5 business days, ~$50–160 pp. Bring itinerary, hotel bookings, financial proof, photos. Gates the whole Taiwan chapter (Dec 29), and there is no Seoul fallback any more', due: '2026-11-24', done: false },
  { id: 'hk-3', ch: 'hk', place: null, cat: 'transport', title: 'Hong Kong→Guangzhou HSR Nov 28', note: 'West Kowloon → Guangzhou South direct, ~1h; Entry 2 starts', due: '2026-11-20', done: false },

  // ── china-e2 ──────────────────────────────────────────────────────
  { id: 'china-e2-1-shenzhen', ch: 'china-e2', place: 'Shenzhen', cat: 'stay', title: 'Shenzhen stay (4n)', note: 'Nov 30 – Dec 4 — friends at another hotel, book own stay (rendezvous tail)', due: '2026-11-09', done: false },
  { id: 'china-e2-1-macau', ch: 'china-e2', place: 'Macau', cat: 'stay', title: 'Macau stay (2n)', note: 'Dec 4–6; fly Macau (MFM) → Kuala Lumpur (KUL) direct Dec 6', due: '2026-11-13', done: false },
  { id: 'china-e2-1-guangzhou', ch: 'china-e2', place: 'Guangzhou', cat: 'stay', title: 'Guangzhou stay (2n)', note: 'Nov 28–30, Cantonese opening straight off the Hong Kong HSR', due: '2026-11-07', done: false },
  { id: 'china-e2-7', ch: 'china-e2', place: 'Shenzhen → Macau', cat: 'transport', title: 'Shenzhen–Macau ferry Dec 4 (~1h)', note: 'Shekou departures, book ahead (Mainland exit)', due: '2026-11-24', done: false },
  { id: 'china-e2-10', ch: 'china-e2', place: 'Macau → Kuala Lumpur', cat: 'transport', title: 'Macau–Kuala Lumpur flight Dec 6 (~3h30)', note: 'MFM → KUL direct (AirAsia) — Malaysia begins', due: '2026-11-01', done: false },

  // ── malaysia (short west-coast run) ───────────────────────────────
  { id: 'malaysia-dec-1-kl', ch: 'malaysia', place: 'Kuala Lumpur', cat: 'stay', title: 'Kuala Lumpur stay (4n)', note: 'Dec 6–10 — Petronas, Batu Caves, Jalan Alor; decompression after the Pearl Delta', due: '2026-11-15', done: false },
  { id: 'malaysia-dec-2-kl-langkawi', ch: 'malaysia', place: 'Kuala Lumpur → Langkawi', cat: 'transport', title: 'KL→Langkawi flight Dec 10 (~1h)', note: 'In-chapter hop; book with the Langkawi stay', due: '2026-11-20', done: false },
  { id: 'malaysia-dec-1-langkawi', ch: 'malaysia', place: 'Langkawi', cat: 'stay', title: 'Langkawi stay (4n)', note: 'Dec 10–14 — Pantai Cenang / Tanjung Rhu; well before the Christmas crush · Booked ✅ — $286 for 4 nights ($71.50/n)', due: '2026-11-10', done: true },
  { id: 'malaysia-dec-2-langkawi-lipe', ch: 'malaysia', place: 'Langkawi → Koh Lipe', cat: 'transport', title: 'Langkawi→Koh Lipe ferry Dec 14 (~90min)', note: 'Cross-border ferry from Telaga Harbour; Thai immigration on the beach. Seasonal and weather-exposed — if cancelled the fallback is Langkawi→Pak Bara→Lipe (+4–5h)', due: '2026-11-15', done: false },

  // ── thailand (Andaman south-to-north) ─────────────────────────────
  { id: 'thailand-1-lipe', ch: 'thailand', place: 'Koh Lipe', cat: 'stay', title: 'Koh Lipe stay (4n)', note: 'Dec 14–18 — Sunrise Beach, not Pattaya. Ahead of the Christmas peak · Booked ✅ — $369 for 4 nights ($92.25/n)', due: '2026-11-15', done: true },
  { id: 'thailand-2-lipe-lanta', ch: 'thailand', place: 'Koh Lipe → Ko Lanta', cat: 'transport', title: 'Koh Lipe→Ko Lanta speedboat Dec 18 (~3h)', note: 'Northbound Andaman speedboat (Satun Pakbara / Bundhaya); reserve a few days ahead', due: '2026-11-25', done: false },
  { id: 'thailand-3-lanta', ch: 'thailand', place: 'Ko Lanta', cat: 'stay', title: 'Ko Lanta stay (8n, incl. Christmas)', note: 'Dec 18–26 — Long Beach / Klong Nin / Kantiang. Christmas here is the quiet holiday · Booked ✅ — $900 for 8 nights ($112.50/n); Christmas week is the peak inside the peak', due: '2026-11-10', done: true },
  { id: 'thailand-4-lanta-krabi', ch: 'thailand', place: 'Ko Lanta → Krabi airport', cat: 'transport', title: 'Ko Lanta→Krabi airport transfer Dec 26 (~2.5–3h)', note: 'Ferry/van; leave early enough for an afternoon flight', due: '2026-12-01', done: false },
  { id: 'thailand-5-bangkok', ch: 'thailand', place: 'Bangkok', cat: 'stay', title: 'Bangkok stay (3n)', note: 'Dec 26–29 — Talad Noi/Charoenkrung for atmosphere or Ari for calm; skip Khao San and the Old Town', due: '2026-11-25', done: false },
  { id: 'thailand-6-krabi-bangkok', ch: 'thailand', place: 'Krabi → Bangkok', cat: 'transport', title: 'Krabi→Bangkok flight Dec 26 (~1h20)', note: 'Afternoon flight; book with the Lanta transfer', due: '2026-11-15', done: false },
  { id: 'thailand-8', ch: 'thailand', place: 'Bangkok → Kaohsiung', cat: 'transport', title: 'Bangkok→Kaohsiung flight Dec 29 (~3h30)', note: 'Direct; Taiwan begins. No same-day connection needed', due: '2026-11-10', done: false },

  // ── taiwan (south to north, NYE in Kaohsiung) ─────────────────────
  { id: 'taiwan-1-kaohsiung', ch: 'taiwan', place: 'Kaohsiung', cat: 'stay', title: 'Kaohsiung stay (4n, incl. NYE)', note: 'Dec 29 – Jan 2 — harbour-front base. NYE Dec 31 at Dream Mall / Kaohsiung Port; hotels near the harbour go 2–3×, book by Oct · Booked ✅ — $431 for 4 nights ($107.75/n); NYE harbour-front, where the plan warned 2–3×', due: '2026-10-30', done: true },
  { id: 'taiwan-2-kaohsiung-tainan', ch: 'taiwan', place: 'Kaohsiung → Tainan', cat: 'transport', title: 'Kaohsiung→Tainan train Jan 2 (~35min)', note: 'TRA; frequent, no reservation needed', due: '2026-12-01', done: false },
  { id: 'taiwan-3-tainan', ch: 'taiwan', place: 'Tainan', cat: 'stay', title: 'Tainan stay (4n)', note: 'Jan 2–6 — Guohua Street / Shennong Street base; after the Jan 1–3 domestic travel surge', due: '2026-11-15', done: false },
  { id: 'taiwan-4-tainan-alishan', ch: 'taiwan', place: 'Tainan → Alishan', cat: 'transport', title: 'Tainan→Chiayi→Alishan Jan 6 — forest railway, 14-day window', note: 'TRA Tainan→Chiayi ~35min, no booking, EasyCard at the gate. Then the forest railway: online booking at afrts.forest.gov.tw opens 06:00 exactly 14 days before travel — for Jan 6 that is Dec 23, so "book months ahead" is impossible and Oct 30 was never a real deadline. Two daily Alishan Express trains from Chiayi, 09:00 and 10:00 (the second reaches Alishan 14:56 after a 65min stop at Fenqihu); ~NT$600pp at 8.33/km. Book with the passport number, pay online or at 7-Eleven ibon, then either collect paper tickets or open the e-ticket on the site — three unpaid bookings in a month suspends you for six. County bus from the Chiayi bus station is the no-booking fallback', due: '2026-12-23', done: false },
  { id: 'taiwan-5-alishan', ch: 'taiwan', place: 'Alishan', cat: 'stay', title: 'Alishan stay (2n, inside the recreation area)', note: 'Jan 6–8 — inside the park, not in the village below: the 05:20 sunrise train leaves from Alishan station and the whole point is walking to it in ten minutes. January is peak sea-of-clouds season and rooms inside are few, so this is the one Alishan booking with real scarcity. Expect around freezing on the platform at dawn — the Kathmandu down earns its keep. Park entrance is a separate gate fee, paid on arrival, not bundled with the train · Booked ✅ — $183 for 2 nights ($91.50/n)', due: '2026-10-30', done: true },
  { id: 'taiwan-9-zhushan', ch: 'taiwan', place: 'Alishan', cat: 'attraction', title: 'Zhushan sunrise train Jan 7 (NT$150)', note: 'Non-reserved; leaves Alishan station roughly an hour before sunrise — early-January sunrise is ~06:40 and the exact departure is posted at 16:30 the day before. Online booking runs from 14 days out until noon the day before, same window as the main line; same-day tickets go on sale at Alishan station 1F 30min before departure, which is what most people do. Jan 7 is a Thursday, so the 04:45 queue should be civil. Walk 10min past Zhushan to Xiaoliyuanshan for the 360° view', due: '2026-12-23', done: false },
  { id: 'taiwan-6-alishan-taipei', ch: 'taiwan', place: 'Alishan → Taipei', cat: 'transport', title: 'Alishan→Chiayi→Taipei Jan 8 (~1h40 HSR)', note: 'Bus down to Chiayi + HSR north; reserve HSR seats', due: '2026-12-01', done: false },
  { id: 'taiwan-7-taipei', ch: 'taiwan', place: 'Taipei', cat: 'stay', title: 'Taipei stay (5n)', note: 'Jan 8–13 — departure city: museums, Beitou hot springs, Jiufen day trip, night markets', due: '2026-11-15', done: false },
  { id: 'taiwan-8-taipei-osaka', ch: 'taiwan', place: 'Taipei → Osaka', cat: 'transport', title: 'Taipei→Osaka flight Jan 13 (~2h45)', note: 'Direct; Japan begins', due: '2026-11-10', done: false },

  // ── japan ─────────────────────────────────────────────────────────
  { id: 'japan-1-kyoto', ch: 'japan', place: 'Kyoto', cat: 'stay', title: 'Kyoto stay (8n)', note: 'Jan 13–21, empty temples + early plum', due: '2026-12-20', done: false },
  { id: 'japan-1-osaka', ch: 'japan', place: 'Osaka', cat: 'stay', title: 'Osaka stay (4n)', note: 'Jan 21–25, crab season + Nara day trip', due: '2027-01-01', done: false },
  { id: 'japan-1-takayama', ch: 'japan', place: 'Takayama + Shirakawa-go', cat: 'stay', title: 'Takayama/Shirakawa-go stay (3n)', note: 'Jan 25–28, gassho snow villages + Hida beef + onsen night', due: '2026-12-20', done: false },
  { id: 'japan-1-fuji', ch: 'japan', place: 'Hakone + Mt. Fuji', cat: 'stay', title: 'Hakone / Kawaguchiko stay (3n)', note: 'Jan 28–31, clearest winter blue skies for Mt. Fuji + ryokan onsen', due: '2026-12-25', done: false },
  { id: 'japan-1-tokyo', ch: 'japan', place: 'Tokyo', cat: 'stay', title: 'Tokyo stay (9n)', note: 'Jan 31 – Feb 9, CNY week in the big city', due: '2027-01-10', done: false },
  { id: 'japan-1-nozawa', ch: 'japan', place: 'Nozawa Onsen', cat: 'stay', title: 'Nozawa Onsen stay (5n)', note: 'Feb 9–14, first snow base — onsen village, beginner/intermediate slopes', due: '2026-12-01', done: false },
  { id: 'japan-1-myoko', ch: 'japan', place: 'Myoko Kogen + Madarao', cat: 'stay', title: 'Myoko Kogen stay (9n)', note: 'Feb 14–23, Akakura Onsen village base — post-CNY deep powder, walk to lifts + onsens', due: '2026-12-15', done: false },
  { id: 'japan-1-tokyo-final', ch: 'japan', place: 'Tokyo', cat: 'stay', title: 'Tokyo buffer stay (1n)', note: 'Feb 23–24, pack + airport buffer', due: '2027-01-20', done: false },
  { id: 'japan-2-kyoto-osaka', ch: 'japan', place: 'Kyoto → Osaka', cat: 'transport', title: 'Kyoto→Osaka train Jan 21 (~30min)', note: 'Local/rapid; no reservation needed', due: '2027-01-14', done: false },
  { id: 'japan-2-osaka-takayama', ch: 'japan', place: 'Osaka → Takayama + Shirakawa-go', cat: 'transport', title: 'Osaka→Takayama Hida Wide View Jan 25 + Shirakawa-go Nohi bus', note: 'Point-to-point tickets; reserve Nohi bus to Shirakawa-go ahead', due: '2027-01-05', done: false },
  { id: 'japan-2-takayama-fuji', ch: 'japan', place: 'Takayama → Hakone + Mt. Fuji', cat: 'transport', title: 'Takayama→Hakone/Kawaguchiko Jan 28', note: 'Hida train to Nagoya + Shinkansen to Odawara / bus to Kawaguchiko', due: '2027-01-15', done: false },
  { id: 'japan-2-fuji-tokyo', ch: 'japan', place: 'Hakone + Mt. Fuji → Tokyo', cat: 'transport', title: 'Hakone/Kawaguchiko→Tokyo Jan 31 (~1.5–2h)', note: 'Odakyu Romancecar or highway bus to Shinjuku; reserve', due: '2027-01-20', done: false },
  { id: 'japan-2-tokyo-nozawa', ch: 'japan', place: 'Tokyo → Nozawa Onsen', cat: 'transport', title: 'Tokyo→Nozawa Onsen Feb 9 (~2.5h)', note: 'Hokuriku Shinkansen to Iiyama + bus; reserve', due: '2027-01-25', done: false },
  { id: 'japan-2-nozawa-myoko', ch: 'japan', place: 'Nozawa Onsen → Myoko Kogen', cat: 'transport', title: 'Nozawa→Myoko Feb 14 (~2h)', note: 'Bus/train via Nagano; reserve', due: '2027-01-30', done: false },
  { id: 'japan-3', ch: 'japan', place: 'Myoko Kogen → Tokyo', cat: 'transport', title: 'Myoko→Tokyo Feb 23', note: 'Hokuriku Shinkansen + local transfer; point-to-point (skip 21-day JR Pass — saves ~$800 for two)', due: '2027-02-01', done: false },
  { id: 'japan-4', ch: 'japan', place: 'Nozawa Onsen + Myoko Kogen', cat: 'attraction', title: 'Snowboard full-kit rental + English lessons (Nozawa + Myoko Snowsports)', note: 'Rent ALL gear locally (boots, board, jacket, helmet) + reserve English lessons at both bases ahead', due: '2026-12-01', done: false },
  { id: 'japan-5', ch: 'japan', place: 'Tokyo → Jakarta', cat: 'transport', title: 'Tokyo–Jakarta flight Feb 24', note: 'Direct; 30-day free entry on arrival', due: '2027-01-10', done: false },

  // ── indonesia-a ───────────────────────────────────────────────────
  { id: 'indonesia-a-1', ch: 'indonesia-a', place: 'Raja Ampat', cat: 'attraction', title: 'Liveaboard Mar 11–20', note: 'Papua Diving / Meridian Adventure — $8,400 locked; reconfirm dates with operator', due: '2025-10-01', done: true },
  { id: 'indonesia-a-2', ch: 'indonesia-a', place: 'Borobudur', cat: 'attraction', title: 'Borobudur sunrise', note: 'Ramadan-quiet — book 2+ weeks ahead', due: '2027-02-10', done: false },
  { id: 'indonesia-a-3', ch: 'indonesia-a', place: 'Java', cat: 'transport', title: 'Java executive trains', note: 'Book 60+ days ahead (mudik)', due: '2027-01-10', done: false },
  { id: 'indonesia-a-9', ch: 'indonesia-a', place: 'Yogyakarta → Bali', cat: 'transport', title: 'Yogyakarta→Bali flight by Mar 2', note: '1h flight, pre-mudik; book 14+ days ahead', due: '2027-02-10', done: false },
  { id: 'indonesia-a-4', ch: 'indonesia-a', place: 'Bali → Sorong', cat: 'transport', title: 'Bali→Sorong Mar 10 via Makassar', note: 'Book 6–8 weeks ahead (Lebaran surge)', due: '2027-01-20', done: false },
  { id: 'indonesia-a-5', ch: 'indonesia-a', place: 'Ubud', cat: 'stay', title: 'Ubud slow 8n stay (Mar 2–10)', note: 'Staging before the liveaboard; Nyepi silent day Mar 8 (hotel-only)', due: '2027-02-09', done: false },
  { id: 'indonesia-a-7', ch: 'indonesia-a', place: 'Jakarta', cat: 'stay', title: 'Jakarta stay (2n)', note: 'Feb 24–26, Ramadan-evening markets', due: '2027-02-03', done: false },
  { id: 'indonesia-a-8', ch: 'indonesia-a', place: 'Yogyakarta', cat: 'stay', title: 'Yogyakarta stay (4n)', note: 'Borobudur + Prambanan base', due: '2027-02-05', done: false },
  { id: 'indonesia-a-10', ch: 'indonesia-a', place: 'Sorong', cat: 'stay', title: 'Sorong hotel ×2 (pre-boat Mar 10, post-boat Mar 20)', note: 'One night before boarding, one after the boat returns — the operator\'s run is Mar 11–20, and the flight to Kota Kinabalu leaves Mar 21. Confirm whether the liveaboard bundles the pre-night', due: '2027-01-20', done: false },
  { id: 'indonesia-a-6', ch: 'indonesia-a', place: 'Sorong → Kota Kinabalu', cat: 'transport', title: 'Sorong→Kota Kinabalu Mar 21 exit', note: 'Entry 1 uses ~26 of 30 free days — onward ticket in hand; starts the Borneo chapter', due: '2027-02-01', done: false },

  // ── borneo ────────────────────────────────────────────────────────
  { id: 'borneo-2', ch: 'borneo', place: 'Kinabatangan', cat: 'stay', title: 'Kinabatangan river lodge (5n, Mar 24–29)', note: 'Book 2–3 months ahead — Mar 26 Good Friday (Sabah holiday), lodges operate', due: '2027-03-03', done: false },
  { id: 'borneo-3', ch: 'borneo', place: 'Sipadan', cat: 'attraction', title: 'Sipadan permits (only if adding 3 days)', note: '120 permits/day cap — book by Nov 2026', due: '2026-11-30', done: false },
  { id: 'borneo-4', ch: 'borneo', place: 'Kota Kinabalu → Manila', cat: 'transport', title: 'Kota Kinabalu→Manila Mar 31 via Kuala Lumpur', note: 'Entry leg for the Philippines', due: '2027-02-15', done: false },
  { id: 'borneo-5', ch: 'borneo', place: 'Kota Kinabalu', cat: 'stay', title: 'Kota Kinabalu stays (Mar 21–23 + 29–31)', note: 'Waterfront nights bracketing Sepilok + Kinabatangan', due: '2027-02-28', done: false },
  { id: 'borneo-6', ch: 'borneo', place: 'Sepilok + Sandakan', cat: 'stay', title: 'Sepilok/Sandakan night (1n, Mar 23)', note: 'Orangutan + sun bear morning needs a bed 30min away. Confirm first whether the Kinabatangan operator bundles this night and the transfer — many do, which would make this item redundant', due: '2027-03-03', done: false },

  // ── philippines ───────────────────────────────────────────────────
  { id: 'philippines-2-manila', ch: 'philippines', place: 'Manila', cat: 'stay', title: 'Manila stay (2n)', note: 'Mar 31 – Apr 2, rest + dive-gear prep', due: '2027-03-10', done: false },
  { id: 'philippines-2-coron', ch: 'philippines', place: 'Coron', cat: 'stay', title: 'Coron stay (5n)', note: 'Wreck week base', due: '2027-03-12', done: false },
  { id: 'philippines-2-elnido', ch: 'philippines', place: 'El Nido', cat: 'stay', title: 'El Nido stay (4n)', note: 'Lagoon days', due: '2027-03-17', done: false },
  { id: 'philippines-2-cebu', ch: 'philippines', place: 'Cebu / Moalboal', cat: 'stay', title: 'Cebu/Moalboal stay (3n)', note: 'Sardine-run finale', due: '2027-03-22', done: false },
  { id: 'philippines-3', ch: 'philippines', place: 'Coron', cat: 'attraction', title: 'Coron wreck dive package (Apr 4–8 window)', note: 'Check-dive first, deep wrecks after; book the dive shop ahead', due: '2027-03-10', done: false },
  { id: 'philippines-6', ch: 'philippines', place: 'Cebu → Bali', cat: 'transport', title: 'Cebu→Bali Apr 14 (routing TBD)', note: 'Via Manila or Singapore — decide routing, then ticket; Entry 2 starts; onward ticket to Singapore May 1 in hand', due: '2027-03-01', done: false },

  // ── indonesia-b ───────────────────────────────────────────────────
  { id: 'indonesia-b-1-penida', ch: 'indonesia-b', place: 'Nusa Penida', cat: 'stay', title: 'Penida stay (3n)', note: 'Apr 15–18, scooter freedom — Sanur gets the arrival night', due: '2027-03-24', done: false },
  { id: 'indonesia-b-0-sanur', ch: 'indonesia-b', place: 'Sanur', cat: 'stay', title: 'Sanur arrival night (1n, Apr 14)', note: 'Land Bali from Cebu Apr 14; the fast boat to Penida leaves Sanur, and a same-day connection through an international arrival is not worth it', due: '2027-03-24', done: false },
  { id: 'indonesia-b-1-komodo', ch: 'indonesia-b', place: 'Labuan Bajo', cat: 'stay', title: 'Labuan Bajo stay (7n)', note: 'Apr 18–25, phinisi-harbor base', due: '2027-03-28', done: false },
  { id: 'indonesia-b-1-bali', ch: 'indonesia-b', place: 'Bali', cat: 'stay', title: 'Bali stay (6n)', note: 'Apr 25 – May 1, temples + volcano finish', due: '2027-04-04', done: false },
  { id: 'indonesia-b-2', ch: 'indonesia-b', place: 'Bali → Labuan Bajo', cat: 'transport', title: 'Bali–Labuan Bajo flight Apr 18', note: 'Into Komodo', due: '2027-03-15', done: false },
  { id: 'indonesia-b-3', ch: 'indonesia-b', place: 'Komodo', cat: 'attraction', title: 'Komodo boat + dives', note: 'Manta Point + drift dives + dragons with ranger; book the operator ahead', due: '2027-03-20', done: false },
  { id: 'indonesia-b-4', ch: 'indonesia-b', place: 'Labuan Bajo → Bali', cat: 'transport', title: 'Labuan Bajo–Bali flight Apr 25', note: 'Back for the Bali + volcano finish', due: '2027-03-20', done: false },
  { id: 'indonesia-b-5', ch: 'indonesia-b', place: 'Bali → Singapore', cat: 'transport', title: 'Bali–Singapore flight May 1', note: 'Hop to the Singapore chapter', due: '2027-03-15', done: false },

  // ── singapore ─────────────────────────────────────────────────────
  { id: 'singapore-2', ch: 'singapore', place: null, cat: 'stay', title: 'Singapore stay', note: '5 nights May 1–6 (waits out China May Day Golden Week)', due: '2027-04-10', done: false },
  { id: 'singapore-3-sin-xian', ch: 'singapore', place: 'Singapore → Xi\'an', cat: 'transport', title: 'Singapore→Xi\'an flight May 6 (~5h30)', note: 'Scoot direct; enters China the day after Labor Day Golden Week ends', due: '2027-03-25', done: false },

  // ── china-spring (May 6 – Jun 2 sweet spot) ───────────────────────
  { id: 'china-spring-0-visa', ch: 'china-spring', place: null, cat: 'visa', title: 'China L visa for May entry (unless 30d waiver renews for 2027)', note: 'Verify whether China extends the Brazilian 30-day visa-free policy past Dec 31, 2026; if not, file an L visa ~6 weeks out (~$300 for two) from Bali/Jakarta or Singapore — confirm which consulate takes third-country tourist applicants. Do not ticket SIN→XIY May 6 until this is answered', due: '2027-03-15', done: false },
  { id: 'china-spring-1-xian', ch: 'china-spring', place: 'Xi\'an', cat: 'stay', title: 'Xi\'an stay (5n)', note: 'May 6–11, walls + Warriors in sunny spring weather', due: '2027-04-15', done: false },
  { id: 'china-spring-1-chengdu', ch: 'china-spring', place: 'Chengdu', cat: 'stay', title: 'Chengdu stay (5n)', note: 'May 11–16 — pandas, Sanxingdui + Leshan Giant Buddha', due: '2027-04-20', done: false },
  { id: 'china-spring-1-chongqing', ch: 'china-spring', place: 'Chongqing', cat: 'stay', title: 'Chongqing stay (4n)', note: 'May 16–20 — cyberpunk nightscape + hotpot in mild May weather', due: '2027-04-25', done: false },
  { id: 'china-spring-1-zhangjiajie', ch: 'china-spring', place: 'Zhangjiajie', cat: 'stay', title: 'Zhangjiajie stay (4n)', note: 'May 20–24, Avatar pillars base before June plum rains', due: '2027-04-28', done: false },
  { id: 'china-spring-1-fenghuang', ch: 'china-spring', place: 'Fenghuang', cat: 'stay', title: 'Fenghuang stay (3n)', note: 'May 24–27, Furong en route, riverside lanterns', due: '2027-05-01', done: false },
  { id: 'china-spring-1-changsha', ch: 'china-spring', place: 'Changsha', cat: 'stay', title: 'Changsha buffer stay (1n)', note: 'May 27–28, laundry + last Hunan meal before Shanghai', due: '2027-05-05', done: false },
  { id: 'china-spring-2-xian-chengdu', ch: 'china-spring', place: 'Xi\'an → Chengdu', cat: 'transport', title: 'Xi\'an→Chengdu HSR May 11 (~3.5h)', note: 'Book 12306 ~15 days out', due: '2027-04-26', done: false },
  { id: 'china-spring-2-chengdu-chongqing', ch: 'china-spring', place: 'Chengdu → Chongqing', cat: 'transport', title: 'Chengdu→Chongqing HSR May 16 (~1h)', note: 'Frequent; book seats ahead', due: '2027-05-01', done: false },
  { id: 'china-spring-2-chongqing-zhangjiajie', ch: 'china-spring', place: 'Chongqing → Zhangjiajie', cat: 'transport', title: 'Chongqing→Zhangjiajie direct HSR May 20 (~2–2.5h)', note: 'Fast direct high-speed rail', due: '2027-05-05', done: false },
  { id: 'china-spring-2-zhangjiajie-fenghuang', ch: 'china-spring', place: 'Zhangjiajie → Fenghuang', cat: 'transport', title: 'Zhangjiajie→Fenghuang via Furong May 24', note: 'HSR/bus with the Furong waterfall-town stop', due: '2027-05-09', done: false },
  { id: 'china-spring-2-fenghuang-changsha', ch: 'china-spring', place: 'Fenghuang → Changsha', cat: 'transport', title: 'Fenghuang→Changsha HSR May 27 (~2h)', note: 'Direct HSR; overnight in Changsha', due: '2027-05-12', done: false },
  { id: 'china-spring-1-shanghai', ch: 'china-spring', place: 'Shanghai', cat: 'stay', title: 'Shanghai stay (5n)', note: 'May 28 – Jun 2 — Shanghai in its best month; departure hub before Korea', due: '2027-04-20', done: false },
  { id: 'china-spring-1-suzhou', ch: 'china-spring', place: 'Shanghai', cat: 'attraction', title: 'Suzhou day trip from Shanghai', note: 'Inherited from the dropped November Suzhou stop: 21–30min from Hongqiao, 240+ pairs/day, ~¥40. Book to Suzhou station (3km to the gardens), not Suzhou North; Humble Administrator\'s Garden needs a timed reservation', due: '2027-05-20', done: false },
  { id: 'china-spring-2-changsha-shanghai', ch: 'china-spring', place: 'Changsha → Shanghai', cat: 'transport', title: 'Changsha→Shanghai HSR May 28 (~5h)', note: 'Book 12306 ~15 days out', due: '2027-05-14', done: false },
  { id: 'china-spring-3', ch: 'china-spring', place: 'Chengdu', cat: 'attraction', title: 'Chengdu panda base + Sanxingdui tickets', note: 'Panda base 07:30 opening; Sanxingdui via WeChat mini-program, 20:00 five days out, no walk-up', due: '2027-05-05', done: false },
  { id: 'china-spring-4', ch: 'china-spring', place: 'Zhangjiajie', cat: 'attraction', title: 'Zhangjiajie + Tianmen tickets', note: 'Real-name booking ~1 week ahead; cableway slots sell out', due: '2027-05-12', done: false },
  { id: 'china-spring-5', ch: 'china-spring', place: 'Shanghai → Seoul', cat: 'transport', title: 'Shanghai→Seoul flight Jun 2 (~2h)', note: 'PVG → ICN direct; starts the South Korea finale', due: '2027-04-15', done: false },

  // ── korea (early-summer finale, Jun 2–16) ─────────────────────────
  { id: 'korea-1', ch: 'korea', place: null, cat: 'visa', title: 'Korea K-ETA (2 pax)', note: 'File online ~1 week before Jun 2; BR visa-free but not K-ETA-exempt; 3-year validity', due: '2027-05-20', done: false },
  { id: 'korea-8-jeju', ch: 'korea', place: 'Jeju', cat: 'stay', title: 'Jeju stay (3n)', note: 'Jun 2–5 — Yongmeori, Seongsan, Udo', due: '2027-04-25', done: false },
  { id: 'korea-7', ch: 'korea', place: 'Jeju → Busan', cat: 'transport', title: 'Jeju→Busan flight Jun 5 (~50min)', note: 'In-chapter hop; book with the Busan stay', due: '2027-04-28', done: false },
  { id: 'korea-6-busan', ch: 'korea', place: 'Busan', cat: 'stay', title: 'Busan stay (3n)', note: 'Jun 5–8 — Gamcheon, Jagalchi, Gwangalli', due: '2027-04-28', done: false },
  { id: 'korea-5', ch: 'korea', place: 'Busan → Gyeongju', cat: 'transport', title: 'Busan→Gyeongju train Jun 8 (~35min)', note: 'Frequent trains; book seats ahead', due: '2027-05-03', done: false },
  { id: 'korea-4-gyeongju', ch: 'korea', place: 'Gyeongju', cat: 'stay', title: 'Gyeongju stay (2n)', note: 'Jun 8–10 — Bulguksa + Tumuli Park', due: '2027-05-01', done: false },
  { id: 'korea-3', ch: 'korea', place: 'Gyeongju → Seoul', cat: 'transport', title: 'Gyeongju→Seoul KTX Jun 10 (~2h)', note: 'Korail ~30-day window opens ~May 5 — reserve then', due: '2027-05-05', done: false },
  { id: 'korea-2-seoul', ch: 'korea', place: 'Seoul', cat: 'stay', title: 'Seoul stay (6n)', note: 'Jun 10–16 — final 6 nights of the trip; Bukchon/Insadong base', due: '2027-05-01', done: false },
  { id: 'korea-11', ch: 'korea', place: 'Seoul', cat: 'attraction', title: 'DMZ tour option Jun 15 (Tue)', note: 'DMZ closed Mon/weekends; needs passport details days ahead', due: '2027-05-25', done: false },
  { id: 'korea-10', ch: 'korea', place: 'Seoul → São Paulo', cat: 'transport', title: 'Seoul→São Paulo return flight Jun 16 (~$700pp)', note: 'The last event of the trip and the only modelled return leg — `flights` carries $1,400 for two. Unticketed: buy ~3 months out for the ICN 1-stop; booking earlier locks Jun 16, booking later costs more', due: '2027-03-15', done: false },
];
