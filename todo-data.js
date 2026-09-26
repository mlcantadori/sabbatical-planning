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
  { id: 'brasil-3-rio', ch: 'brasil', place: 'Rio', cat: 'stay', title: 'Rio Airbnb', note: 'R$7,000', due: '2026-06-01', done: true },
  { id: 'brasil-3-cumbuco', ch: 'brasil', place: 'Cumbuco', cat: 'stay', title: 'Cumbuco monthly rental', note: '$1,900/mo', due: '2026-06-01', done: true },
  { id: 'brasil-3-sp', ch: 'brasil', place: 'São Paulo', cat: 'stay', title: 'São Paulo Airbnb', note: 'R$1,400', due: '2026-06-01', done: true },
  { id: 'brasil-4', ch: 'brasil', place: 'Petrópolis', cat: 'attraction', title: 'Petrópolis–Teresópolis trail booking', note: 'R$4,000, locked', due: '2026-06-01', done: true },

  // ── toronto (past) ────────────────────────────────────────────────
  { id: 'toronto-1', ch: 'toronto', place: null, cat: 'stay', title: "Friend's place", note: 'Lodging free; confirm arrival day', due: '2026-08-20', done: true },

  // ── athens (past) ─────────────────────────────────────────────────
  { id: 'athens-1-athens', ch: 'athens', place: 'Athens', cat: 'stay', title: 'Athens stays Sep 1–5 + buffer Oct 20–21', note: 'Booked', due: '2026-08-01', done: true },
  { id: 'athens-1-chania', ch: 'athens', place: 'Chania', cat: 'stay', title: 'Chania stay Sep 5–9', note: 'Booked', due: '2026-08-01', done: true },
  { id: 'athens-1-rethymno', ch: 'athens', place: 'Rethymno', cat: 'stay', title: 'Rethymno stay Sep 9–12', note: 'Booked', due: '2026-08-01', done: true },
  { id: 'athens-1-santorini', ch: 'athens', place: 'Santorini', cat: 'stay', title: 'Santorini stay Sep 12–14', note: 'Booked', due: '2026-08-01', done: true },
  { id: 'athens-1-folegandros', ch: 'athens', place: 'Folegandros', cat: 'stay', title: 'Folegandros stay Sep 14–16', note: 'Booked', due: '2026-08-01', done: true },
  { id: 'athens-1-milos', ch: 'athens', place: 'Milos', cat: 'stay', title: 'Milos stay Sep 16–20', note: 'Booked (checkout adjusted 22→20)', due: '2026-08-01', done: true },
  { id: 'athens-2', ch: 'athens', place: null, cat: 'transport', title: '4 inter-island ferries', note: '€685 actual', due: '2026-08-15', done: true },
  { id: 'athens-3', ch: 'athens', place: 'Chania', cat: 'car', title: 'Chania rental car', note: '~$240, rented', due: '2026-08-20', done: true },
  { id: 'athens-4', ch: 'athens', place: 'Milos', cat: 'attraction', title: 'Kleftiko boat', note: 'Booked — €140 pp', due: '2026-09-08', done: true },

  // ── turkey (current) ──────────────────────────────────────────────
  { id: 'turkey-1', ch: 'turkey', place: 'Göreme', cat: 'attraction', title: 'Hot-air balloon Sep 22/23 — cancelled (weather), refunded', note: 'Royal / Butterfly Balloons — full refund received', due: '2026-09-01', done: true },
  { id: 'turkey-2', ch: 'turkey', place: 'Göreme', cat: 'stay', title: 'Göreme stay Sep 21–24', note: 'Booked', due: '2026-08-15', done: true },
  { id: 'turkey-3-alacati', ch: 'turkey', place: 'Alaçatı', cat: 'stay', title: 'Alaçatı stay Sep 24–26', note: 'Room from Sep 24 for the 1am arrival — booked', due: '2026-09-27', done: true },
  { id: 'turkey-3-sirince', ch: 'turkey', place: 'Şirince', cat: 'stay', title: 'Şirince stay Sep 27', note: 'Booked', due: '2026-09-27', done: true },
  { id: 'turkey-3-kas', ch: 'turkey', place: 'Kaş', cat: 'stay', title: 'Kaş stay Sep 28–30', note: 'Booked', due: '2026-09-27', done: true },
  { id: 'turkey-3-akyaka', ch: 'turkey', place: 'Akyaka', cat: 'stay', title: 'Akyaka stay Oct 1', note: 'Booked', due: '2026-09-27', done: true },
  { id: 'turkey-4', ch: 'turkey', place: 'Izmir', cat: 'car', title: 'Izmir rental car Sep 25 – Oct 2', note: 'Collect ~1am Sep 25; loop Alaçatı→Şirince→Kaş→Akyaka; return Oct 2 — rented, €220', due: '2026-09-20', done: true },
  { id: 'turkey-5', ch: 'turkey', place: null, cat: 'transport', title: 'Kayseri→Izmir Sep 24 22:50', note: 'Bought', due: '2026-09-01', done: true },
  { id: 'turkey-6', ch: 'turkey', place: null, cat: 'transport', title: 'Izmir→Istanbul Oct 2 19:45', note: 'Moved to Oct 2 — bought', due: '2026-09-28', done: true },
  { id: 'turkey-7', ch: 'turkey', place: null, cat: 'transport', title: 'Istanbul→Baku Oct 12 + Baku→Delhi Oct 14', note: 'Bought (same ticket via Baku)', due: '2026-09-01', done: true },
  { id: 'turkey-8', ch: 'turkey', place: null, cat: 'visa', title: 'India e-Visa', note: 'Done — issued for the Oct 14 entry', due: '2026-09-15', done: true },
  { id: 'turkey-9', ch: 'turkey', place: 'Istanbul', cat: 'stay', title: 'Istanbul stay Oct 2–12 (10n)', note: 'Chapter close — book now, currently in Turkey', due: '2026-09-28', done: false },

  // ── baku ──────────────────────────────────────────────────────────
  { id: 'baku-1', ch: 'baku', place: null, cat: 'visa', title: 'Azerbaijan ASAN e-Visa', note: 'Done — issued', due: '2026-10-05', done: true },

  // ── india ─────────────────────────────────────────────────────────
  { id: 'india-1', ch: 'india', place: 'Agra + Delhi + Varanasi', cat: 'transport', title: 'Agra–Delhi round trip + Delhi–Varanasi trains', note: 'Booked via IRCTC', due: '2026-09-01', done: true },
  { id: 'india-2', ch: 'india', place: 'Agra', cat: 'attraction', title: 'Taj Mahal sunrise tickets (Oct 15 day trip)', note: 'Buy online the day before; arrive 6am', due: '2026-10-13', done: false },
  { id: 'india-3', ch: 'india', place: 'Varanasi → Kathmandu', cat: 'transport', title: 'Varanasi→Kathmandu Oct 21 08:30 direct', note: 'Booked ✅ ($343 for two)', due: '2026-09-15', done: true },
  { id: 'india-4', ch: 'india', place: 'Delhi', cat: 'stay', title: 'Delhi stay Oct 14–17', note: 'Agra as Oct 15 day trip', due: '2026-10-01', done: false },
  { id: 'india-5', ch: 'india', place: 'Varanasi', cat: 'stay', title: 'Varanasi stay Oct 17–21 (4n)', note: 'Near the ghats for dawn boat + evening Aarti', due: '2026-10-01', done: false },

  // ── nepal ─────────────────────────────────────────────────────────
  { id: 'nepal-2', ch: 'nepal', place: 'Annapurna', cat: 'attraction', title: 'ABC trek Oct 25 – Nov 4', note: 'Discovery World $1,440 for two ($144 paid, $1,296 balance due Oct 24 at Kathmandu office)', due: '2026-09-01', done: true },
  { id: 'nepal-3', ch: 'nepal', place: 'Kathmandu', cat: 'stay', title: 'Kathmandu hotels (pre/post-trek)', note: 'Oct 21–24 + Nov 5–8 Thamel nights; Pokhara transit covered by the trek', due: '2026-10-01', done: false },
  { id: 'nepal-4', ch: 'nepal', place: 'Kathmandu', cat: 'visa', title: 'ACAP permit + TIMS card', note: 'Via agency — confirm Oct 24 at DWT office', due: '2026-10-21', done: false },
  { id: 'nepal-5', ch: 'nepal', place: null, cat: 'admin', title: 'SafetyWing plan before Nepal', note: 'Credit-card insurance covers 60 days only — start SafetyWing ahead of the Oct 21 chapter; must cover heli-evac for the trek', due: '2026-10-15', done: false },
  { id: 'nepal-6', ch: 'nepal', place: null, cat: 'transport', title: 'Kathmandu→China flight Nov 9 (via Chengdu)', note: 'Entry leg for China E1 — book in the Sep batch', due: '2026-09-30', done: false },
  { id: 'nepal-7', ch: 'nepal', place: 'Kathmandu', cat: 'visa', title: 'Nepal visa — apply + pay online', note: 'Pre-pay online to skip the cash-only queue on arrival', due: '2026-10-15', done: false },

  // ── china-e1 ──────────────────────────────────────────────────────
  { id: 'china-e1-1-beijing', ch: 'china-e1', place: 'Beijing', cat: 'stay', title: 'Beijing stay (5n)', note: 'Nov 10–15', due: '2026-10-01', done: false },
  { id: 'china-e1-1-xian', ch: 'china-e1', place: 'Xi\'an', cat: 'stay', title: 'Xi\'an stay (3n)', note: 'Nov 15–18', due: '2026-10-01', done: false },
  { id: 'china-e1-1-huangshan', ch: 'china-e1', place: 'Huangshan', cat: 'stay', title: 'Huangshan stay (3n)', note: 'Nov 18–21, Tangkou base + summit night', due: '2026-10-01', done: false },
  { id: 'china-e1-1-hangzhou', ch: 'china-e1', place: 'Hangzhou', cat: 'stay', title: 'Hangzhou stay (2n)', note: 'Nov 21–23', due: '2026-10-01', done: false },
  { id: 'china-e1-1-suzhou', ch: 'china-e1', place: 'Suzhou', cat: 'stay', title: 'Suzhou stay (3n)', note: 'Nov 23–26', due: '2026-10-01', done: false },
  { id: 'china-e1-1-shenzhen', ch: 'china-e1', place: 'Shenzhen', cat: 'stay', title: 'Shenzhen stay (4n)', note: 'Nov 26–30 — friends at another hotel, book own stay', due: '2026-10-01', done: false },
  { id: 'china-e1-1-guangzhou', ch: 'china-e1', place: 'Guangzhou', cat: 'stay', title: 'Guangzhou stay (2n)', note: 'Nov 30 – Dec 2', due: '2026-10-01', done: false },
  { id: 'china-e1-2', ch: 'china-e1', place: null, cat: 'admin', title: 'Confirm BR 30-day visa-free still holds', note: 'Both E1/E2 entries pre-Dec-31-2026; otherwise +~$300 for two visas', due: '2026-10-20', done: false },
  { id: 'china-e1-3', ch: 'china-e1', place: 'Beijing → Xi\'an', cat: 'transport', title: 'Beijing–Xi\'an HSR Nov 15 (~5h)', note: 'Buy a few days ahead on Trip.com', due: '2026-11-10', done: false },
  { id: 'china-e1-4', ch: 'china-e1', place: 'Xi\'an → Hangzhou', cat: 'transport', title: 'Xi\'an–Hangzhou flight Nov 18 (~2h)', note: 'Then bus to Tangkou', due: '2026-10-20', done: false },
  { id: 'china-e1-5', ch: 'china-e1', place: 'Beijing', cat: 'attraction', title: 'Forbidden City tickets', note: 'Closed Mondays (Nov 16 out); reservation-only — book ~1 week ahead', due: '2026-11-05', done: false },
  { id: 'china-e1-6', ch: 'china-e1', place: 'Huangshan', cat: 'stay', title: 'Huangshan summit hotel', note: 'Book ~3 days ahead; front-load the canyon days (West Sea Canyon closes Dec–Mar)', due: '2026-11-15', done: false },
  { id: 'china-e1-7', ch: 'china-e1', place: 'Suzhou → Shenzhen', cat: 'transport', title: 'Suzhou–Shenzhen flight Nov 26', note: 'Via Shanghai airports; friends rendezvous Nov 26–30', due: '2026-10-25', done: false },
  { id: 'china-e1-8', ch: 'china-e1', place: 'Guangzhou → Hong Kong', cat: 'transport', title: 'Guangzhou–Hong Kong HSR Dec 2', note: 'Morning train + 1h West Kowloon buffer; prebook seats', due: '2026-11-27', done: false },

  // ── hk ────────────────────────────────────────────────────────────
  { id: 'hk-1', ch: 'hk', place: null, cat: 'stay', title: 'Hong Kong stay', note: '5 nights Dec 2–7 (cheapest hotel week of the season)', due: '2026-11-01', done: false },
  { id: 'hk-2', ch: 'hk', place: null, cat: 'visa', title: 'Taiwan visitor visas — TECO filing Dec 3', note: 'Thursday-morning errand for 2 pax; pickup Dec 4–5; request 30d grant for Jan 11–25; do not ticket Seoul→Taipei until answered', due: '2026-12-03', done: false },
  { id: 'hk-3', ch: 'hk', place: null, cat: 'transport', title: 'Hong Kong→Chengdu flight Dec 7', note: 'Direct, 5+ per day', due: '2026-11-01', done: false },

  // ── china-e2 ──────────────────────────────────────────────────────
  { id: 'china-e2-1-chengdu', ch: 'china-e2', place: 'Chengdu', cat: 'stay', title: 'Chengdu stay (6n)', note: 'Dec 7–13', due: '2026-11-01', done: false },
  { id: 'china-e2-1-chongqing', ch: 'china-e2', place: 'Chongqing', cat: 'stay', title: 'Chongqing stay (2n + Wulong transit)', note: 'Dec 13–15 + Dec 16 night', due: '2026-11-01', done: false },
  { id: 'china-e2-1-shanghai', ch: 'china-e2', place: 'Shanghai', cat: 'stay', title: 'Shanghai stay (5n)', note: 'Dec 17–22 — heated MODERN hotel (no lane houses, no central heating)', due: '2026-11-01', done: false },
  { id: 'china-e2-2', ch: 'china-e2', place: 'Chengdu', cat: 'attraction', title: 'Sanxingdui tickets', note: 'WeChat mini-program, 20:00 five days out, NO walk-up — book Dec 2 from HK!', due: '2026-12-02', done: false },
  { id: 'china-e2-3', ch: 'china-e2', place: 'Chengdu → Chongqing', cat: 'transport', title: 'Chengdu–Chongqing HSR Dec 13 (~1h)', note: 'Buy a few days ahead', due: '2026-12-08', done: false },
  { id: 'china-e2-4', ch: 'china-e2', place: 'Chongqing → Shanghai', cat: 'transport', title: 'Chongqing→Shanghai Dec 17 morning flight', note: 'Back to Chongqing first, then fly', due: '2026-11-10', done: false },
  { id: 'china-e2-5', ch: 'china-e2', place: 'Shanghai → Seoul', cat: 'transport', title: 'Shanghai–Seoul flight Dec 24', note: 'Christmas-Eve leg — book early', due: '2026-10-15', done: false },
  { id: 'china-e2-6', ch: 'china-e2', place: null, cat: 'visa', title: 'Korea K-ETA (2 pax)', note: 'File online ≥1 week before Dec 24; BR visa-free but not K-ETA-exempt', due: '2026-12-15', done: false },

  // ── korea ─────────────────────────────────────────────────────────
  { id: 'korea-2-busan', ch: 'korea', place: 'Busan', cat: 'stay', title: 'Busan stay (3n)', note: 'Dec 24–27, Christmas by the sea', due: '2026-11-01', done: false },
  { id: 'korea-2-gyeongju', ch: 'korea', place: 'Gyeongju', cat: 'stay', title: 'Gyeongju stay (2n)', note: 'Dec 27–29', due: '2026-11-01', done: false },
  { id: 'korea-2-jeonju', ch: 'korea', place: 'Jeonju', cat: 'stay', title: 'Jeonju stay (1n)', note: 'Dec 29–30', due: '2026-11-01', done: false },
  { id: 'korea-2-seoul', ch: 'korea', place: 'Seoul', cat: 'stay', title: 'Seoul stay (12n)', note: 'Dec 30 – Jan 11, NYE at Bosingak', due: '2026-11-01', done: false },
  { id: 'korea-3', ch: 'korea', place: 'Seoul → Busan', cat: 'transport', title: 'Seoul→Busan hop Dec 24 (flight or KTX)', note: 'Land Dec 24, straight to Busan for Christmas — lock the hop ahead', due: '2026-10-31', done: false },
  { id: 'korea-4', ch: 'korea', place: 'Seoul', cat: 'attraction', title: 'DMZ tour Jan 5/6', note: 'Tue/Wed only (closed Mon Jan 4); needs passport details days ahead', due: '2026-12-20', done: false },
  { id: 'korea-5', ch: 'korea', place: 'Jeonju → Seoul', cat: 'transport', title: 'KTX Dec 30 midday', note: 'Korail ~30-day window opens ~Nov 30 — reserve then, not earlier', due: '2026-11-30', done: false },
  { id: 'korea-6', ch: 'korea', place: 'Seoul → Taipei', cat: 'transport', title: 'Seoul–Taipei flight Jan 11', note: 'Entry leg for Taiwan — do not ticket until the TECO visa is answered', due: '2026-11-20', done: false },

  // ── taiwan ────────────────────────────────────────────────────────
  { id: 'taiwan-2', ch: 'taiwan', place: 'Taipei → Hualien', cat: 'transport', title: 'Taipei→Hualien express', note: 'TRA 28-day window, reserved seats; Pacific-coast rail journey', due: '2026-12-18', done: false },
  { id: 'taiwan-3', ch: 'taiwan', place: 'Hualien → Tainan', cat: 'transport', title: 'Hualien→Tainan direct TRA', note: 'Train 324 daily; 28-day window; recheck Hwy-8 status ~Jan 4 first', due: '2026-12-20', done: false },
  { id: 'taiwan-5', ch: 'taiwan', place: 'Tainan → Taoyuan', cat: 'transport', title: 'HSR Tainan→Taoyuan Jan 25', note: '+ MRT; fly onward to Osaka the same day', due: '2027-01-20', done: false },
  { id: 'taiwan-6', ch: 'taiwan', place: 'Taipei → Osaka', cat: 'transport', title: 'Taipei→Osaka flight Jan 25', note: 'Entry leg for Japan', due: '2026-12-01', done: false },
  { id: 'taiwan-7', ch: 'taiwan', place: 'Taipei', cat: 'stay', title: 'Taipei stay (5n)', note: 'Jan 11–16, Da\'an base', due: '2026-12-10', done: false },
  { id: 'taiwan-8', ch: 'taiwan', place: 'Hualien', cat: 'stay', title: 'Hualien stay (2n)', note: 'Taroko coast days', due: '2026-12-10', done: false },
  { id: 'taiwan-9', ch: 'taiwan', place: 'Tainan', cat: 'stay', title: 'Tainan stay (7n)', note: 'Slow southern week + Kaohsiung day', due: '2026-12-10', done: false },

  // ── japan ─────────────────────────────────────────────────────────
  { id: 'japan-1-kyoto', ch: 'japan', place: 'Kyoto', cat: 'stay', title: 'Kyoto stay (8n)', note: 'Jan 25 – Feb 2, empty temples + early plum', due: '2026-12-01', done: false },
  { id: 'japan-1-osaka', ch: 'japan', place: 'Osaka', cat: 'stay', title: 'Osaka stay (4n)', note: 'Feb 2–6, crab season + Nara day trip', due: '2026-12-01', done: false },
  { id: 'japan-1-tokyo', ch: 'japan', place: 'Tokyo', cat: 'stay', title: 'Tokyo stay (8n)', note: 'Feb 6–14, CNY week in the big city', due: '2026-12-01', done: false },
  { id: 'japan-1-hakuba', ch: 'japan', place: 'Hakuba', cat: 'stay', title: 'Hakuba stay (9n)', note: 'Feb 14–23, powder week (post-CNY, deep base)', due: '2026-12-01', done: false },
  { id: 'japan-2', ch: 'japan', place: null, cat: 'transport', title: 'JR Pass 21-day exchange order', note: 'Must be purchased BEFORE entering Japan (Jan 25); evaluate vs Osaka→Kyoto→Osaka→Tokyo→Hakuba legs', due: '2027-01-10', done: false },
  { id: 'japan-3', ch: 'japan', place: 'Tokyo ↔ Hakuba', cat: 'transport', title: 'Tokyo→Hakuba Feb 14 + return seats', note: 'Reserve both ways ahead', due: '2027-02-01', done: false },
  { id: 'japan-4', ch: 'japan', place: 'Hakuba', cat: 'attraction', title: 'Snowboard equipment rental (full kit)', note: 'Rent ALL gear locally — boots, board, jacket, helmet; reserve ahead', due: '2027-01-15', done: false },
  { id: 'japan-5', ch: 'japan', place: 'Tokyo → Jakarta', cat: 'transport', title: 'Tokyo–Jakarta flight Feb 24', note: 'Direct; 30-day free entry on arrival', due: '2027-01-10', done: false },

  // ── indonesia-a ───────────────────────────────────────────────────
  { id: 'indonesia-a-1', ch: 'indonesia-a', place: 'Raja Ampat', cat: 'attraction', title: 'Liveaboard Mar 11–20', note: 'Papua Diving / Meridian Adventure — $8,400 locked; reconfirm dates with operator', due: '2025-10-01', done: true },
  { id: 'indonesia-a-2', ch: 'indonesia-a', place: 'Borobudur', cat: 'attraction', title: 'Borobudur sunrise', note: 'Ramadan-quiet — book 2+ weeks ahead', due: '2027-02-10', done: false },
  { id: 'indonesia-a-3', ch: 'indonesia-a', place: 'Java', cat: 'transport', title: 'Java executive trains', note: 'Book 60+ days ahead (mudik)', due: '2027-01-10', done: false },
  { id: 'indonesia-a-9', ch: 'indonesia-a', place: 'Yogyakarta → Bali', cat: 'transport', title: 'Yogyakarta→Bali flight by Mar 2', note: '1h flight, pre-mudik; book 14+ days ahead', due: '2027-02-10', done: false },
  { id: 'indonesia-a-4', ch: 'indonesia-a', place: 'Bali → Sorong', cat: 'transport', title: 'Bali→Sorong Mar 10 via Makassar', note: 'Book 6–8 weeks ahead (Lebaran surge)', due: '2027-01-20', done: false },
  { id: 'indonesia-a-5', ch: 'indonesia-a', place: 'Ubud', cat: 'stay', title: 'Ubud slow 8n stay (Mar 2–9)', note: 'Staging before the liveaboard; Nyepi silent day Mar 8 (hotel-only)', due: '2027-02-01', done: false },
  { id: 'indonesia-a-7', ch: 'indonesia-a', place: 'Jakarta', cat: 'stay', title: 'Jakarta stay (2n)', note: 'Feb 24–26, Ramadan-evening markets', due: '2027-01-15', done: false },
  { id: 'indonesia-a-8', ch: 'indonesia-a', place: 'Yogyakarta', cat: 'stay', title: 'Yogyakarta stay (4n)', note: 'Borobudur + Prambanan base', due: '2027-01-15', done: false },
  { id: 'indonesia-a-6', ch: 'indonesia-a', place: 'Sorong → Kota Kinabalu', cat: 'transport', title: 'Sorong→Kota Kinabalu Mar 21 exit', note: 'Entry 1 uses ~26 of 30 free days — onward ticket in hand; starts the Borneo chapter', due: '2027-02-01', done: false },

  // ── borneo ────────────────────────────────────────────────────────
  { id: 'borneo-2', ch: 'borneo', place: 'Kinabatangan', cat: 'stay', title: 'Kinabatangan river lodge', note: 'Mar 21–31 chapter; book 2–3 months ahead — Mar 26 Good Friday (Sabah holiday), lodges operate', due: '2027-01-31', done: false },
  { id: 'borneo-3', ch: 'borneo', place: 'Sipadan', cat: 'attraction', title: 'Sipadan permits (only if adding 3 days)', note: '120 permits/day cap — book by Nov 2026', due: '2026-11-30', done: false },
  { id: 'borneo-4', ch: 'borneo', place: 'Kota Kinabalu → Manila', cat: 'transport', title: 'Kota Kinabalu→Manila Mar 31 via Kuala Lumpur', note: 'Entry leg for the Philippines', due: '2027-02-15', done: false },
  { id: 'borneo-5', ch: 'borneo', place: 'Kota Kinabalu', cat: 'stay', title: 'Kota Kinabalu stays (Mar 21–22 + 29–31)', note: 'Waterfront nights bracketing Sepilok + Kinabatangan', due: '2027-02-15', done: false },

  // ── philippines ───────────────────────────────────────────────────
  { id: 'philippines-2-manila', ch: 'philippines', place: 'Manila', cat: 'stay', title: 'Manila stay (2n)', note: 'Mar 31 – Apr 2, rest + dive-gear prep', due: '2027-03-01', done: false },
  { id: 'philippines-2-coron', ch: 'philippines', place: 'Coron', cat: 'stay', title: 'Coron stay (5n)', note: 'Wreck week base', due: '2027-03-01', done: false },
  { id: 'philippines-2-elnido', ch: 'philippines', place: 'El Nido', cat: 'stay', title: 'El Nido stay (4n)', note: 'Lagoon days', due: '2027-03-01', done: false },
  { id: 'philippines-2-cebu', ch: 'philippines', place: 'Cebu / Moalboal', cat: 'stay', title: 'Cebu/Moalboal stay (2n)', note: 'Sardine-run finale', due: '2027-03-01', done: false },
  { id: 'philippines-3', ch: 'philippines', place: 'Coron', cat: 'attraction', title: 'Coron wreck dive package (Apr 4–8 window)', note: 'Check-dive first, deep wrecks after; book the dive shop ahead', due: '2027-03-10', done: false },
  { id: 'philippines-6', ch: 'philippines', place: 'Cebu → Bali', cat: 'transport', title: 'Cebu→Bali Apr 14 (routing TBD)', note: 'Via Manila or Singapore — decide routing, then ticket; Entry 2 starts; onward ticket to Singapore May 1 in hand', due: '2027-03-01', done: false },

  // ── indonesia-b ───────────────────────────────────────────────────
  { id: 'indonesia-b-1-penida', ch: 'indonesia-b', place: 'Nusa Penida', cat: 'stay', title: 'Penida stay (4n)', note: 'Apr 14–18, scooter freedom', due: '2027-04-01', done: false },
  { id: 'indonesia-b-1-komodo', ch: 'indonesia-b', place: 'Labuan Bajo', cat: 'stay', title: 'Labuan Bajo stay (7n)', note: 'Apr 18–25, phinisi-harbor base', due: '2027-04-01', done: false },
  { id: 'indonesia-b-1-bali', ch: 'indonesia-b', place: 'Bali', cat: 'stay', title: 'Bali stay (6n)', note: 'Apr 25–30, temples + volcano finish', due: '2027-04-01', done: false },
  { id: 'indonesia-b-2', ch: 'indonesia-b', place: 'Bali → Labuan Bajo', cat: 'transport', title: 'Bali–Labuan Bajo flight Apr 18', note: 'Into Komodo', due: '2027-03-15', done: false },
  { id: 'indonesia-b-3', ch: 'indonesia-b', place: 'Komodo', cat: 'attraction', title: 'Komodo boat + dives', note: 'Manta Point + drift dives + dragons with ranger; book the operator ahead', due: '2027-03-20', done: false },
  { id: 'indonesia-b-4', ch: 'indonesia-b', place: 'Labuan Bajo → Bali', cat: 'transport', title: 'Labuan Bajo–Bali flight Apr 25', note: 'Back for the Bali + volcano finish', due: '2027-03-20', done: false },
  { id: 'indonesia-b-5', ch: 'indonesia-b', place: 'Bali → Singapore', cat: 'transport', title: 'Bali–Singapore flight May 1', note: 'Hop to the Singapore chapter', due: '2027-03-15', done: false },

  // ── singapore ─────────────────────────────────────────────────────
  { id: 'singapore-2', ch: 'singapore', place: null, cat: 'stay', title: 'Singapore stay', note: '5 nights May 1–6', due: '2027-04-01', done: false },

  // ── malaysia ──────────────────────────────────────────────────────
  { id: 'malaysia-1-kl', ch: 'malaysia', place: 'Kuala Lumpur', cat: 'stay', title: 'KL stay (4n)', note: 'May 6–10', due: '2027-04-02', done: false },
  { id: 'malaysia-1-penang', ch: 'malaysia', place: 'Penang', cat: 'stay', title: 'Penang stay (6n)', note: 'May 10–16, Georgetown slow chapter', due: '2027-04-02', done: false },
  { id: 'malaysia-2', ch: 'malaysia', place: 'Singapore → KL', cat: 'transport', title: 'Singapore→Kuala Lumpur bus', note: 'Book a few days ahead', due: '2027-04-21', done: false },
  { id: 'malaysia-3', ch: 'malaysia', place: 'KL → Penang', cat: 'transport', title: 'ETS rail KL→Penang', note: 'Book seats ahead; Penang Hill + mansions at the other end', due: '2027-04-26', done: false },

  // ── thailand ──────────────────────────────────────────────────────
  { id: 'thailand-1-kohtao', ch: 'thailand', place: 'Koh Tao', cat: 'stay', title: 'Koh Tao stay (6n)', note: 'Dive-week base', due: '2027-04-16', done: false },
  { id: 'thailand-1-samui', ch: 'thailand', place: 'Koh Samui', cat: 'stay', title: 'Samui transit night (1n)', note: 'Sleep near the ferry pier', due: '2027-04-16', done: false },
  { id: 'thailand-1-bangkok', ch: 'thailand', place: 'Bangkok', cat: 'stay', title: 'Bangkok stay (7n)', note: 'City finish', due: '2027-04-16', done: false },
  { id: 'thailand-2', ch: 'thailand', place: 'Penang → Koh Tao', cat: 'transport', title: 'Penang→Koh Tao transfer', note: 'Cross-border bus + ferry combo', due: '2027-05-02', done: false },
  { id: 'thailand-3', ch: 'thailand', place: 'Koh Tao', cat: 'attraction', title: 'Koh Tao dive package + Sail Rock', note: 'Value diving + whale-shark territory; reserve the shop ahead (Sail Rock = weather buffer day)', due: '2027-05-06', done: false },
  { id: 'thailand-4', ch: 'thailand', place: 'Bangkok → Xi\'an', cat: 'transport', title: 'Bangkok→Xi\'an May 30 (red-eye / Sunday options)', note: "Arrive Xi'an May 30 — tired day: walls + Muslim Quarter only", due: '2027-04-15', done: false },

  // ── china-spring ──────────────────────────────────────────────────
  { id: 'china-spring-1-xian', ch: 'china-spring', place: 'Xi\'an', cat: 'stay', title: 'Xi\'an stay (4n)', note: 'May 30 – Jun 3', due: '2027-05-01', done: false },
  { id: 'china-spring-1-guilin', ch: 'china-spring', place: 'Guilin / Yangshuo', cat: 'stay', title: 'Guilin/Yangshuo stay (4n)', note: 'Li River karst', due: '2027-05-01', done: false },
  { id: 'china-spring-1-longji', ch: 'china-spring', place: 'Longji', cat: 'stay', title: 'Longji stay (2n)', note: 'Zhuang village overnight, mirror terraces', due: '2027-05-01', done: false },
  { id: 'china-spring-1-zhangjiajie', ch: 'china-spring', place: 'Zhangjiajie', cat: 'stay', title: 'Zhangjiajie stay (4n)', note: 'Avatar pillars base', due: '2027-05-01', done: false },
  { id: 'china-spring-1-fenghuang', ch: 'china-spring', place: 'Fenghuang', cat: 'stay', title: 'Fenghuang stay (3n)', note: 'Furong en route; lantern finale', due: '2027-05-01', done: false },
  { id: 'china-spring-1-changsha', ch: 'china-spring', place: 'Changsha', cat: 'stay', title: 'Changsha buffer stay (2n)', note: 'Fly home Jun 17', due: '2027-05-01', done: false },
  { id: 'china-spring-2', ch: 'china-spring', place: 'Xi\'an → Guilin', cat: 'transport', title: 'Xi\'an→Guilin Jun 3 flight', note: '~2h trunk', due: '2027-04-20', done: false },
  { id: 'china-spring-3', ch: 'china-spring', place: 'Zhangjiajie', cat: 'attraction', title: 'Zhangjiajie entrance tickets', note: 'Peak-season sea of clouds; real-name booking ~1 week ahead', due: '2027-06-01', done: false },
  { id: 'china-spring-4', ch: 'china-spring', place: 'Zhangjiajie', cat: 'attraction', title: 'Tianmen Mountain tickets', note: 'Cableway slots sell out — book with Zhangjiajie', due: '2027-06-03', done: false },
];
