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
  { id: 'prep-3', ch: 'prep', place: null, cat: 'car', title: 'International Driving Permit', note: 'Needed for Greece, Turkey + Malaysia rentals', due: '2026-08-15', done: true },

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
  { id: 'athens-1-athens', ch: 'athens', place: 'Athens', cat: 'stay', title: 'Athens stays Sep 1–5 + Oct 20–21', note: 'Booked', due: '2026-08-11', done: true },
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
  { id: 'turkey-3-alacati', ch: 'turkey', place: 'Alaçatı', cat: 'stay', title: 'Alaçatı stay Sep 24–26', note: 'Room from Sep 24 for the 1am arrival — booked', due: '2026-09-03', done: true },
  { id: 'turkey-3-sirince', ch: 'turkey', place: 'Şirince', cat: 'stay', title: 'Şirince stay Sep 27', note: 'Booked', due: '2026-09-06', done: true },
  { id: 'turkey-3-kas', ch: 'turkey', place: 'Kaş', cat: 'stay', title: 'Kaş stay Sep 28–30', note: 'Booked', due: '2026-09-07', done: true },
  { id: 'turkey-3-akyaka', ch: 'turkey', place: 'Akyaka', cat: 'stay', title: 'Akyaka stay Oct 1', note: 'Booked', due: '2026-09-10', done: true },
  { id: 'turkey-4', ch: 'turkey', place: 'Izmir', cat: 'car', title: 'Izmir rental car Sep 25 – Oct 2', note: 'Collect ~1am Sep 25; loop Alaçatı→Şirince→Kaş→Akyaka; return Oct 2 — rented, €220', due: '2026-09-20', done: true },
  { id: 'turkey-5', ch: 'turkey', place: null, cat: 'transport', title: 'Kayseri→Izmir Sep 24 22:50', note: 'Bought', due: '2026-09-01', done: true },
  { id: 'turkey-6', ch: 'turkey', place: null, cat: 'transport', title: 'Izmir→Istanbul Oct 2 19:45', note: 'Moved to Oct 2 — bought', due: '2026-09-28', done: true },
  { id: 'turkey-7', ch: 'turkey', place: null, cat: 'transport', title: 'Istanbul→Baku Oct 12 + Baku→Delhi Oct 14', note: 'Bought (same ticket via Baku)', due: '2026-09-01', done: true },
  { id: 'turkey-8', ch: 'turkey', place: null, cat: 'visa', title: 'India e-Visa', note: 'Done — issued for the Oct 14 entry', due: '2026-09-15', done: true },
  { id: 'turkey-9', ch: 'turkey', place: 'Istanbul', cat: 'stay', title: 'Istanbul stay Oct 2–12 (10n)', note: 'Chapter close — booked', due: '2026-09-11', done: true },

  // ── baku ──────────────────────────────────────────────────────────
  { id: 'baku-1', ch: 'baku', place: null, cat: 'visa', title: 'Azerbaijan ASAN e-Visa', note: 'Done — issued', due: '2026-10-05', done: true },

  // ── india ─────────────────────────────────────────────────────────
  { id: 'india-1', ch: 'india', place: 'Agra + Delhi + Varanasi', cat: 'transport', title: 'Agra–Delhi round trip + Delhi–Varanasi trains', note: 'Booked via IRCTC', due: '2026-09-01', done: true },
  { id: 'india-2', ch: 'india', place: 'Agra', cat: 'attraction', title: 'Taj Mahal sunrise tickets (Oct 15 day trip)', note: 'Bought online — done', due: '2026-10-13', done: true },
  { id: 'india-3', ch: 'india', place: 'Varanasi → Kathmandu', cat: 'transport', title: 'Varanasi→Kathmandu Oct 21 08:30 direct', note: 'Booked ✅ ($343 for two)', due: '2026-09-15', done: true },
  { id: 'india-4', ch: 'india', place: 'Delhi', cat: 'stay', title: 'Delhi stay Oct 14–17', note: 'Agra as Oct 15 day trip — booked; Greater Kailash 1 base', due: '2026-09-23', done: true },
  { id: 'india-5', ch: 'india', place: 'Varanasi', cat: 'stay', title: 'Varanasi stay Oct 17–21 (4n)', note: 'Booked ✅ — Airbnb R$1,081, near the ghats for dawn boat + evening Aarti', due: '2026-09-26', done: true },

  // ── nepal ─────────────────────────────────────────────────────────
  { id: 'nepal-2', ch: 'nepal', place: 'Annapurna', cat: 'attraction', title: 'ABC trek Oct 25 – Nov 4', note: 'Discovery World $1,440 for two ($144 paid, $1,296 balance due Oct 24 at Kathmandu office)', due: '2026-09-01', done: true },
  { id: 'nepal-3', ch: 'nepal', place: 'Kathmandu', cat: 'stay', title: 'Kathmandu hotels (pre/post-trek)', note: 'Pre-trek Oct 21–25 booked ✅ ($171) + post-trek Nov 4–7 booked ✅ ($129); Pokhara transit covered by the trek', due: '2026-09-30', done: true },
  { id: 'nepal-4', ch: 'nepal', place: 'Kathmandu', cat: 'visa', title: 'ACAP permit + TIMS card', note: 'Handled via agency — done', due: '2026-10-21', done: true },
  { id: 'nepal-5', ch: 'nepal', place: null, cat: 'admin', title: 'SafetyWing plan before Nepal', note: 'Credit-card insurance covers 60 days only — start SafetyWing ahead of the Oct 21 chapter; must cover heli-evac for the trek', due: '2026-10-15', done: false },
  { id: 'nepal-6', ch: 'nepal', place: null, cat: 'transport', title: 'Kathmandu→Beijing flight Nov 7 11:45–23:15', note: 'Booked ✅ ($477 for two) — Entry 1 starts Nov 7', due: '2026-09-30', done: true },
  { id: 'nepal-7', ch: 'nepal', place: 'Kathmandu', cat: 'visa', title: 'Nepal visa — apply + pay online', note: 'Applied + paid online — done', due: '2026-10-15', done: true },
  { id: 'nepal-8', ch: 'nepal', place: 'Kathmandu', cat: 'admin', title: 'Buy trekking gear in Thamel', note: 'Layers + essentials for ABC; bag + down jacket loaned by DWT — 9kg pp porter limit', due: '2026-10-22', done: false },

  // ── china-e1 ──────────────────────────────────────────────────────
  { id: 'china-e1-1-beijing', ch: 'china-e1', place: 'Beijing', cat: 'stay', title: 'Beijing stay (9n)', note: 'Nov 7–16 booked ✅ ($528), incl. 2 slow hutong days upfront (trek recovery)', due: '2026-10-17', done: true },
  { id: 'china-e1-1-huangshan', ch: 'china-e1', place: 'Huangshan', cat: 'stay', title: 'Huangshan stay (3n)', note: 'Nov 16–19, Tangkou base + summit night', due: '2026-10-26', done: false },
  { id: 'china-e1-1-hangzhou', ch: 'china-e1', place: 'Hangzhou', cat: 'stay', title: 'Hangzhou stay (2n)', note: 'Nov 19–21', due: '2026-10-29', done: false },
  { id: 'china-e1-1-suzhou', ch: 'china-e1', place: 'Suzhou', cat: 'stay', title: 'Suzhou stay (2n)', note: 'Nov 21–23, gardens express', due: '2026-10-31', done: false },
  { id: 'china-e1-2', ch: 'china-e1', place: null, cat: 'admin', title: 'Confirm BR 30-day visa-free still holds', note: 'Confirmed ✅ — Brazil on the 30-day list through Dec 31, 2026; covers E1 + E2a/E2b entries', due: '2026-10-20', done: true },
  { id: 'china-e1-3', ch: 'china-e1', place: 'Beijing → Huangshan', cat: 'transport', title: 'Beijing–Huangshan HSR or flight Nov 16', note: 'HSR Beijing South → Huangshanbei (~5–5.5h, weather-proof) or direct flight to Tunxi (~2.5h)', due: '2026-10-20', done: false },
  { id: 'china-e1-5', ch: 'china-e1', place: 'Beijing', cat: 'attraction', title: 'Forbidden City tickets', note: 'Closed Mondays — Nov 9 + Nov 16 are Mondays, plan Tue–Sun; reservation-only, book ~1 week ahead', due: '2026-11-05', done: false },
  { id: 'china-e1-6', ch: 'china-e1', place: 'Huangshan', cat: 'stay', title: 'Huangshan summit hotel', note: 'Book ~3 days ahead; front-load the canyon days (West Sea Canyon closes Dec–Mar)', due: '2026-10-27', done: false },
  { id: 'china-e1-4', ch: 'china-e1', place: 'Suzhou → Hong Kong', cat: 'transport', title: 'Suzhou–Hong Kong Nov 23 (via Shanghai Hongqiao SHA)', note: 'HSR Suzhou → Shanghai Hongqiao (~25m direct to terminal), then fly SHA→HKG; HK visa reset next', due: '2026-10-25', done: false },
  { id: 'china-e1-7', ch: 'china-e1', place: 'Huangshan → Hangzhou', cat: 'transport', title: 'Huangshan–Hangzhou HSR Nov 19 (~1.5h)', note: 'Huangshanbei → Hangzhou East/West direct HSR; 12306 releases ~15 days out (from Nov 4)', due: '2026-11-04', done: false },
  { id: 'china-e1-8', ch: 'china-e1', place: 'Hangzhou → Suzhou', cat: 'transport', title: 'Hangzhou–Suzhou HSR Nov 21 (~1.5h)', note: '12306 releases ~15 days out — grab seats from Nov 6; frequent departures', due: '2026-11-06', done: false },

  // ── hk ────────────────────────────────────────────────────────────
  { id: 'hk-1', ch: 'hk', place: null, cat: 'stay', title: 'Hong Kong stay', note: '5 nights Nov 23–28 (shoulder-season prices, with friends)', due: '2026-11-02', done: false },
  { id: 'hk-3', ch: 'hk', place: null, cat: 'transport', title: 'Hong Kong→Guangzhou HSR Nov 28', note: 'West Kowloon → Guangzhou South direct, ~1h; Entry 2 starts', due: '2026-11-20', done: false },

  // ── china-e2 ──────────────────────────────────────────────────────
  { id: 'china-e2-1-shenzhen', ch: 'china-e2', place: 'Shenzhen', cat: 'stay', title: 'Shenzhen stay (4n)', note: 'Nov 30 – Dec 4 — friends at another hotel, book own stay (rendezvous tail)', due: '2026-11-09', done: false },
  { id: 'china-e2-1-macau', ch: 'china-e2', place: 'Macau', cat: 'stay', title: 'Macau stay (2n)', note: 'Dec 4–6; fly Macau (MFM) → Shanghai (PVG) direct Dec 6', due: '2026-11-13', done: false },
  { id: 'china-e2-1-guangzhou', ch: 'china-e2', place: 'Guangzhou', cat: 'stay', title: 'Guangzhou stay (2n)', note: 'Nov 28–30, Cantonese opening straight off the Hong Kong HSR', due: '2026-11-07', done: false },
  { id: 'china-e2-1-shanghai', ch: 'china-e2', place: 'Shanghai', cat: 'stay', title: 'Shanghai stay (6n)', note: 'Dec 6–12 — heated MODERN hotel (no lane houses, no central heating); slow finale before Malaysia', due: '2026-11-15', done: false },
  { id: 'china-e2-7', ch: 'china-e2', place: 'Shenzhen → Macau', cat: 'transport', title: 'Shenzhen–Macau ferry Dec 4 (~1h)', note: 'Shekou departures, book ahead (Mainland exit)', due: '2026-11-24', done: false },
  { id: 'china-e2-10', ch: 'china-e2', place: 'Macau → Shanghai', cat: 'transport', title: 'Macau–Shanghai direct flight Dec 6 (~2.5h)', note: 'Fly MFM → PVG direct (Air Macau) — fresh Mainland entry, skips Zhuhai border', due: '2026-11-01', done: false },
  { id: 'china-e2-5', ch: 'china-e2', place: 'Shanghai → Kuala Lumpur', cat: 'transport', title: 'Shanghai–Kuala Lumpur flight Dec 12 (~5h30)', note: 'PVG → KUL direct — book early for the Christmas run', due: '2026-10-25', done: false },

  // ── malaysia (Dec holiday chapter) ────────────────────────────────
  { id: 'malaysia-dec-1-kl', ch: 'malaysia', place: 'Kuala Lumpur', cat: 'stay', title: 'Kuala Lumpur stay (5n)', note: 'Dec 12–17 — Petronas, Batu Caves, Jalan Alor', due: '2026-11-15', done: false },
  { id: 'malaysia-dec-1-langkawi', ch: 'malaysia', place: 'Langkawi', cat: 'stay', title: 'Langkawi stay (6n)', note: 'Dec 17–23 — Pantai Cenang/Tengah; dry-season beach before the Christmas rush', due: '2026-11-10', done: false },
  { id: 'malaysia-dec-1-penang', ch: 'malaysia', place: 'Penang', cat: 'stay', title: 'Penang stay (9n, incl. Christmas + NYE)', note: 'Dec 23 – Jan 1 — Georgetown slow chapter; holiday dinners book early', due: '2026-11-10', done: false },
  { id: 'malaysia-dec-2-kl-langkawi', ch: 'malaysia', place: 'Kuala Lumpur → Langkawi', cat: 'transport', title: 'KL→Langkawi flight Dec 17 (~1h)', note: 'In-chapter hop; book with the Langkawi stay', due: '2026-11-20', done: false },
  { id: 'malaysia-dec-2-langkawi-penang', ch: 'malaysia', place: 'Langkawi → Penang', cat: 'transport', title: 'Langkawi→Penang ferry Dec 23 (~2.5–3h)', note: 'Weather-dependent; short flight is the fallback', due: '2026-11-20', done: false },
  { id: 'malaysia-dec-2-penang-krabi', ch: 'malaysia', place: 'Penang → Krabi', cat: 'transport', title: 'Penang→Krabi flight Jan 1 (via KL/Bangkok)', note: 'Routine connection; Thailand Andaman next', due: '2026-12-01', done: false },

  // ── thailand (Andaman) ────────────────────────────────────────────
  { id: 'thailand-1-bangkok', ch: 'thailand', place: 'Bangkok', cat: 'stay', title: 'Bangkok stay (2n)', note: 'Jan 1–3 — city hub after Malaysia; temples, canals, Yaowarat', due: '2026-11-30', done: false },
  { id: 'thailand-2', ch: 'thailand', place: 'Bangkok → Krabi', cat: 'transport', title: 'Bangkok→Krabi flight Jan 3 (~1h30)', note: 'In-chapter hop; book ahead for peak season', due: '2026-11-20', done: false },
  { id: 'thailand-3', ch: 'thailand', place: 'Railay + Krabi', cat: 'stay', title: 'Railay/Krabi stay (4n)', note: 'Jan 3–7 — Railay or Ao Nang; longtail access', due: '2026-12-01', done: false },
  { id: 'thailand-4', ch: 'thailand', place: 'Krabi → Ko Lanta', cat: 'transport', title: 'Krabi→Ko Lanta transfer Jan 7', note: 'Bus + short ferry ~3–4h; book with the resort', due: '2026-12-15', done: false },
  { id: 'thailand-5', ch: 'thailand', place: 'Ko Lanta', cat: 'stay', title: 'Ko Lanta stay (5n)', note: 'Jan 7–12 — Long Beach/Klong Nin; quiet Andaman base', due: '2026-12-01', done: false },
  { id: 'thailand-6', ch: 'thailand', place: 'Ko Lanta → Krabi → Bangkok', cat: 'transport', title: 'Ko Lanta→Krabi→Bangkok Jan 12', note: 'Bus/ferry to Krabi, then flight to Bangkok', due: '2026-12-15', done: false },
  { id: 'thailand-7', ch: 'thailand', place: 'Bangkok (return)', cat: 'stay', title: 'Bangkok buffer stay (1n)', note: 'Jan 12–13 — laundry, markets, last Thai meal', due: '2026-12-08', done: false },
  { id: 'thailand-8', ch: 'thailand', place: 'Bangkok → Osaka', cat: 'transport', title: 'Bangkok→Osaka flight Jan 13 (~5h30)', note: 'Direct; Japan begins', due: '2026-11-15', done: false },

  // ── japan ─────────────────────────────────────────────────────────
  { id: 'japan-1-kyoto', ch: 'japan', place: 'Kyoto', cat: 'stay', title: 'Kyoto stay (8n)', note: 'Jan 13–21, empty temples + early plum', due: '2026-12-20', done: false },
  { id: 'japan-1-osaka', ch: 'japan', place: 'Osaka', cat: 'stay', title: 'Osaka stay (4n)', note: 'Jan 21–25, crab season + Nara day trip', due: '2027-01-01', done: false },
  { id: 'japan-1-kanazawa', ch: 'japan', place: 'Kanazawa', cat: 'stay', title: 'Kanazawa stay (3n)', note: 'Jan 25–28, Kenrokuen snow + Omicho market', due: '2027-01-04', done: false },
  { id: 'japan-1-takayama', ch: 'japan', place: 'Takayama + Shirakawa-go', cat: 'stay', title: 'Takayama/Shirakawa-go stay (3n)', note: 'Jan 28–31, gassho villages + onsen night', due: '2027-01-06', done: false },
  { id: 'japan-1-tokyo', ch: 'japan', place: 'Tokyo', cat: 'stay', title: 'Tokyo stay (9n)', note: 'Jan 31 – Feb 9, CNY week in the big city', due: '2027-01-10', done: false },
  { id: 'japan-1-nozawa', ch: 'japan', place: 'Nozawa Onsen', cat: 'stay', title: 'Nozawa Onsen stay (5n)', note: 'Feb 9–14, second snow base — onsen village, beginner/intermediate slopes', due: '2026-12-01', done: false },
  { id: 'japan-1-myoko', ch: 'japan', place: 'Myoko Kogen + Madarao', cat: 'stay', title: 'Myoko Kogen stay (9n)', note: 'Feb 14–23, Akakura Onsen village base — post-CNY deep powder, walk to lifts + onsens', due: '2026-12-15', done: false },
  { id: 'japan-1-tokyo-final', ch: 'japan', place: 'Tokyo', cat: 'stay', title: 'Tokyo buffer stay (1n)', note: 'Feb 23–24, pack + airport buffer', due: '2027-01-20', done: false },
  { id: 'japan-2-kyoto-osaka', ch: 'japan', place: 'Kyoto → Osaka', cat: 'transport', title: 'Kyoto→Osaka train Jan 21 (~30min)', note: 'Local/rapid; no reservation needed', due: '2027-01-14', done: false },
  { id: 'japan-2-osaka-kanazawa', ch: 'japan', place: 'Osaka → Kanazawa', cat: 'transport', title: 'Osaka→Kanazawa Jan 25 (~3h)', note: 'Thunderbird + Hokuriku Shinkansen; point-to-point ticket', due: '2027-01-15', done: false },
  { id: 'japan-2-kanazawa-takayama', ch: 'japan', place: 'Kanazawa → Shirakawa-go → Takayama', cat: 'transport', title: 'Kanazawa→Shirakawa-go→Takayama bus Jan 28', note: 'Nohi bus via the gassho villages ~3.5–4h; reserve seats', due: '2027-01-18', done: false },
  { id: 'japan-2-takayama-tokyo', ch: 'japan', place: 'Takayama → Tokyo', cat: 'transport', title: 'Takayama→Tokyo Jan 31 (~4.5h)', note: 'Hida limited express + Shinkansen; reserve', due: '2027-01-20', done: false },
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
  { id: 'indonesia-a-5', ch: 'indonesia-a', place: 'Ubud', cat: 'stay', title: 'Ubud slow 8n stay (Mar 2–9)', note: 'Staging before the liveaboard; Nyepi silent day Mar 8 (hotel-only)', due: '2027-02-09', done: false },
  { id: 'indonesia-a-7', ch: 'indonesia-a', place: 'Jakarta', cat: 'stay', title: 'Jakarta stay (2n)', note: 'Feb 24–26, Ramadan-evening markets', due: '2027-02-03', done: false },
  { id: 'indonesia-a-8', ch: 'indonesia-a', place: 'Yogyakarta', cat: 'stay', title: 'Yogyakarta stay (4n)', note: 'Borobudur + Prambanan base', due: '2027-02-05', done: false },
  { id: 'indonesia-a-6', ch: 'indonesia-a', place: 'Sorong → Kota Kinabalu', cat: 'transport', title: 'Sorong→Kota Kinabalu Mar 21 exit', note: 'Entry 1 uses ~26 of 30 free days — onward ticket in hand; starts the Borneo chapter', due: '2027-02-01', done: false },

  // ── borneo ────────────────────────────────────────────────────────
  { id: 'borneo-2', ch: 'borneo', place: 'Kinabatangan', cat: 'stay', title: 'Kinabatangan river lodge', note: 'Mar 21–31 chapter; book 2–3 months ahead — Mar 26 Good Friday (Sabah holiday), lodges operate', due: '2027-03-03', done: false },
  { id: 'borneo-3', ch: 'borneo', place: 'Sipadan', cat: 'attraction', title: 'Sipadan permits (only if adding 3 days)', note: '120 permits/day cap — book by Nov 2026', due: '2026-11-30', done: false },
  { id: 'borneo-4', ch: 'borneo', place: 'Kota Kinabalu → Manila', cat: 'transport', title: 'Kota Kinabalu→Manila Mar 31 via Kuala Lumpur', note: 'Entry leg for the Philippines', due: '2027-02-15', done: false },
  { id: 'borneo-5', ch: 'borneo', place: 'Kota Kinabalu', cat: 'stay', title: 'Kota Kinabalu stays (Mar 21–22 + 29–31)', note: 'Waterfront nights bracketing Sepilok + Kinabatangan', due: '2027-02-28', done: false },

  // ── philippines ───────────────────────────────────────────────────
  { id: 'philippines-2-manila', ch: 'philippines', place: 'Manila', cat: 'stay', title: 'Manila stay (2n)', note: 'Mar 31 – Apr 2, rest + dive-gear prep', due: '2027-03-10', done: false },
  { id: 'philippines-2-coron', ch: 'philippines', place: 'Coron', cat: 'stay', title: 'Coron stay (5n)', note: 'Wreck week base', due: '2027-03-12', done: false },
  { id: 'philippines-2-elnido', ch: 'philippines', place: 'El Nido', cat: 'stay', title: 'El Nido stay (4n)', note: 'Lagoon days', due: '2027-03-17', done: false },
  { id: 'philippines-2-cebu', ch: 'philippines', place: 'Cebu / Moalboal', cat: 'stay', title: 'Cebu/Moalboal stay (2n)', note: 'Sardine-run finale', due: '2027-03-22', done: false },
  { id: 'philippines-3', ch: 'philippines', place: 'Coron', cat: 'attraction', title: 'Coron wreck dive package (Apr 4–8 window)', note: 'Check-dive first, deep wrecks after; book the dive shop ahead', due: '2027-03-10', done: false },
  { id: 'philippines-6', ch: 'philippines', place: 'Cebu → Bali', cat: 'transport', title: 'Cebu→Bali Apr 14 (routing TBD)', note: 'Via Manila or Singapore — decide routing, then ticket; Entry 2 starts; onward ticket to Singapore May 1 in hand', due: '2027-03-01', done: false },

  // ── indonesia-b ───────────────────────────────────────────────────
  { id: 'indonesia-b-1-penida', ch: 'indonesia-b', place: 'Nusa Penida', cat: 'stay', title: 'Penida stay (4n)', note: 'Apr 14–18, scooter freedom', due: '2027-03-24', done: false },
  { id: 'indonesia-b-1-komodo', ch: 'indonesia-b', place: 'Labuan Bajo', cat: 'stay', title: 'Labuan Bajo stay (7n)', note: 'Apr 18–25, phinisi-harbor base', due: '2027-03-28', done: false },
  { id: 'indonesia-b-1-bali', ch: 'indonesia-b', place: 'Bali', cat: 'stay', title: 'Bali stay (6n)', note: 'Apr 25–30, temples + volcano finish', due: '2027-04-04', done: false },
  { id: 'indonesia-b-2', ch: 'indonesia-b', place: 'Bali → Labuan Bajo', cat: 'transport', title: 'Bali–Labuan Bajo flight Apr 18', note: 'Into Komodo', due: '2027-03-15', done: false },
  { id: 'indonesia-b-3', ch: 'indonesia-b', place: 'Komodo', cat: 'attraction', title: 'Komodo boat + dives', note: 'Manta Point + drift dives + dragons with ranger; book the operator ahead', due: '2027-03-20', done: false },
  { id: 'indonesia-b-4', ch: 'indonesia-b', place: 'Labuan Bajo → Bali', cat: 'transport', title: 'Labuan Bajo–Bali flight Apr 25', note: 'Back for the Bali + volcano finish', due: '2027-03-20', done: false },
  { id: 'indonesia-b-5', ch: 'indonesia-b', place: 'Bali → Singapore', cat: 'transport', title: 'Bali–Singapore flight May 1', note: 'Hop to the Singapore chapter', due: '2027-03-15', done: false },

  // ── singapore ─────────────────────────────────────────────────────
  { id: 'singapore-2', ch: 'singapore', place: null, cat: 'stay', title: 'Singapore stay', note: '5 nights May 1–6', due: '2027-04-10', done: false },

  // ── thailand-gulf (May) ───────────────────────────────────────────
  { id: 'thailand-gulf-1-samui', ch: 'thailand-gulf', place: 'Koh Samui', cat: 'stay', title: 'Koh Samui stay (5n)', note: 'May 6–11 — Chaweng/Lamai/Fisherman\'s Village; pick one base', due: '2027-04-10', done: false },
  { id: 'thailand-gulf-1-tao', ch: 'thailand-gulf', place: 'Koh Tao', cat: 'stay', title: 'Koh Tao stay (5n)', note: 'May 11–16 — dive island base; book the ferry + dive shop together', due: '2027-04-10', done: false },
  { id: 'thailand-gulf-2-sin-samui', ch: 'thailand-gulf', place: 'Singapore → Koh Samui', cat: 'transport', title: 'Singapore→Koh Samui flight May 6', note: 'Direct Bangkok Airways; book early', due: '2027-03-20', done: false },
  { id: 'thailand-gulf-3-samui-tao', ch: 'thailand-gulf', place: 'Koh Samui → Koh Tao', cat: 'transport', title: 'Koh Samui→Koh Tao ferry May 11', note: 'Passenger ferry ~1.5–2h; weather-dependent', due: '2027-04-20', done: false },
  { id: 'thailand-gulf-4-tao-samui', ch: 'thailand-gulf', place: 'Koh Tao → Koh Samui', cat: 'transport', title: 'Koh Tao→Koh Samui ferry May 16', note: 'Ferry back for the Seoul connection; leave a buffer', due: '2027-04-20', done: false },
  { id: 'thailand-gulf-5-samui-seoul', ch: 'thailand-gulf', place: 'Koh Samui → Seoul', cat: 'transport', title: 'Koh Samui→Seoul flight May 16 (via Bangkok)', note: 'USM–BKK–ICN; book as one ticket if possible', due: '2027-04-01', done: false },

  // ── korea (late spring) ───────────────────────────────────────────
  { id: 'korea-1', ch: 'korea', place: null, cat: 'visa', title: 'Korea K-ETA (2 pax)', note: 'File online ~1 week before May 16; BR visa-free but not K-ETA-exempt; 3-year validity', due: '2027-05-08', done: false },
  { id: 'korea-2-seoul', ch: 'korea', place: 'Seoul', cat: 'stay', title: 'Seoul stay (6n)', note: 'May 16–22 — long daylight, green palaces; Bukchon/Insadong base', due: '2027-04-01', done: false },
  { id: 'korea-3', ch: 'korea', place: 'Seoul → Gyeongju', cat: 'transport', title: 'Seoul→Gyeongju KTX May 22 (~2h)', note: 'Korail ~30-day window opens ~Apr 22 — reserve then', due: '2027-04-22', done: false },
  { id: 'korea-4-gyeongju', ch: 'korea', place: 'Gyeongju', cat: 'stay', title: 'Gyeongju stay (2n)', note: 'May 22–24 — Bulguksa + Tumuli Park', due: '2027-04-05', done: false },
  { id: 'korea-5', ch: 'korea', place: 'Gyeongju → Busan', cat: 'transport', title: 'Gyeongju→Busan train May 24 (~1.5h)', note: 'Frequent trains; book seats ahead', due: '2027-04-24', done: false },
  { id: 'korea-6-busan', ch: 'korea', place: 'Busan', cat: 'stay', title: 'Busan stay (3n)', note: 'May 24–27 — Gamcheon, Jagalchi, Gwangalli', due: '2027-04-08', done: false },
  { id: 'korea-7', ch: 'korea', place: 'Busan → Jeju', cat: 'transport', title: 'Busan→Jeju flight May 27 (~1h)', note: 'In-chapter hop; book with the Jeju stay', due: '2027-04-20', done: false },
  { id: 'korea-8-jeju', ch: 'korea', place: 'Jeju', cat: 'stay', title: 'Jeju stay (3n)', note: 'May 27–30 — Yongmeori, Seongsan, Udo', due: '2027-04-12', done: false },
  { id: 'korea-9', ch: 'korea', place: 'Jeju → Seoul/Incheon', cat: 'transport', title: 'Jeju→Seoul/Incheon flight May 30 (~1h)', note: 'Connect to the Xi\'an flight; allow a comfortable buffer', due: '2027-04-24', done: false },
  { id: 'korea-10', ch: 'korea', place: 'Seoul → Xi\'an', cat: 'transport', title: 'Seoul→Xi\'an flight May 30 (~3h)', note: 'Entry leg for China spring; China L visa required', due: '2027-04-15', done: false },
  { id: 'korea-11', ch: 'korea', place: 'Seoul', cat: 'attraction', title: 'DMZ tour option May 18/19 (Tue/Wed)', note: 'DMZ closed Mon/weekends; needs passport details days ahead', due: '2027-05-04', done: false },

  // ── china-spring ──────────────────────────────────────────────────
  { id: 'china-spring-1-xian', ch: 'china-spring', place: 'Xi\'an', cat: 'stay', title: 'Xi\'an stay (5n)', note: 'May 30 – Jun 4, walls + Warriors', due: '2027-05-09', done: false },
  { id: 'china-spring-1-chengdu', ch: 'china-spring', place: 'Chengdu', cat: 'stay', title: 'Chengdu stay (5n)', note: 'Jun 4–9 — pandas, Sanxingdui + Leshan Giant Buddha', due: '2027-05-13', done: false },
  { id: 'china-spring-1-chongqing', ch: 'china-spring', place: 'Chongqing', cat: 'stay', title: 'Chongqing stay (4n)', note: 'Jun 9–13 — cyberpunk nightscape + hotpot', due: '2027-05-17', done: false },
  { id: 'china-spring-1-zhangjiajie', ch: 'china-spring', place: 'Zhangjiajie', cat: 'stay', title: 'Zhangjiajie stay (4n)', note: 'Jun 13–17, Avatar pillars base', due: '2027-05-19', done: false },
  { id: 'china-spring-1-fenghuang', ch: 'china-spring', place: 'Fenghuang', cat: 'stay', title: 'Fenghuang stay (3n)', note: 'Jun 17–20, Furong en route, lantern finale', due: '2027-05-23', done: false },
  { id: 'china-spring-1-changsha', ch: 'china-spring', place: 'Changsha', cat: 'stay', title: 'Changsha buffer stay (1n)', note: 'Jun 20–21, pack + airport buffer before the home flight', due: '2027-05-27', done: false },
  { id: 'china-spring-2-xian-chengdu', ch: 'china-spring', place: 'Xi\'an → Chengdu', cat: 'transport', title: 'Xi\'an→Chengdu HSR Jun 4 (~3–4h)', note: 'Book 12306 ~15 days out', due: '2027-05-20', done: false },
  { id: 'china-spring-2-chengdu-chongqing', ch: 'china-spring', place: 'Chengdu → Chongqing', cat: 'transport', title: 'Chengdu→Chongqing HSR Jun 9 (~1h)', note: 'Frequent; book seats ahead', due: '2027-05-25', done: false },
  { id: 'china-spring-2-chongqing-zhangjiajie', ch: 'china-spring', place: 'Chongqing → Zhangjiajie', cat: 'transport', title: 'Chongqing→Zhangjiajie Jun 13 (~4–5h HSR or 1h flight)', note: 'Flight is the time-saver; HSR is weather-proof', due: '2027-05-29', done: false },
  { id: 'china-spring-2-zhangjiajie-fenghuang', ch: 'china-spring', place: 'Zhangjiajie → Fenghuang', cat: 'transport', title: 'Zhangjiajie→Fenghuang via Furong Jun 17', note: 'Bus with the Furong waterfall-town stop', due: '2027-06-02', done: false },
  { id: 'china-spring-2-fenghuang-changsha', ch: 'china-spring', place: 'Fenghuang → Changsha', cat: 'transport', title: 'Fenghuang→Changsha Jun 20 (~5–6h)', note: 'Bus/train; overnight near the airport before the home flight', due: '2027-06-05', done: false },
  { id: 'china-spring-3', ch: 'china-spring', place: 'Chengdu', cat: 'attraction', title: 'Chengdu panda base + Sanxingdui tickets', note: 'Panda base 07:30 opening; Sanxingdui via WeChat mini-program, 20:00 five days out, no walk-up', due: '2027-05-30', done: false },
  { id: 'china-spring-4', ch: 'china-spring', place: 'Zhangjiajie', cat: 'attraction', title: 'Zhangjiajie + Tianmen tickets', note: 'Real-name booking ~1 week ahead; cableway slots sell out', due: '2027-06-05', done: false },
  { id: 'china-spring-5', ch: 'china-spring', place: 'Changsha', cat: 'transport', title: 'Changsha→home flight Jun 21', note: 'CSX → GRU via Guangzhou/Hong Kong; book the long-haul early', due: '2027-04-15', done: false },
];
