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
// done:true is only set where a source confirms it (✅ / locked / actual).
// Everything else defaults to false for the traveler to confirm.

window.TODO_ITEMS = [
  // ── before you leave ──────────────────────────────────────────────
  { id: 'prep-1', ch: 'prep', place: null, cat: 'admin', title: 'Travel insurance for the full trip', note: 'Covers trek + diving; carry the policy PDF offline', due: '2026-06-01', done: true },
  { id: 'prep-2', ch: 'prep', place: null, cat: 'admin', title: 'Passports valid 6+ months past Jun 2027', note: 'BR passports; needed for every visa-on-arrival', due: '2026-06-01', done: true },
  { id: 'prep-3', ch: 'prep', place: null, cat: 'car', title: 'International Driving Permit', note: 'Needed for Greece, Turkey + Malaysia rentals', due: '2026-08-15', done: true },

  // ── brasil (past) ─────────────────────────────────────────────────
  { id: 'brasil-1', ch: 'brasil', place: null, cat: 'transport', title: 'GRU–YYZ–ATH flights', note: '$1,700 for two, locked', due: '2026-05-01', done: true },
  { id: 'brasil-2', ch: 'brasil', place: null, cat: 'transport', title: 'Internal flights Rio→Fortaleza + Fortaleza→SP', note: '~$750 for two, actual', due: '2026-06-01', done: true },
  { id: 'brasil-3', ch: 'brasil', place: 'Rio + Cumbuco + SP', cat: 'stay', title: 'Rio + Cumbuco + São Paulo stays', note: 'Rio Airbnb R$7,000 · Cumbuco $1,900/mo · SP R$1,400', due: '2026-06-01', done: true },
  { id: 'brasil-4', ch: 'brasil', place: 'Petrópolis', cat: 'attraction', title: 'Petrópolis–Teresópolis trail booking', note: 'R$4,000, locked', due: '2026-06-01', done: true },

  // ── toronto (past) ────────────────────────────────────────────────
  { id: 'toronto-1', ch: 'toronto', place: null, cat: 'stay', title: "Friend's place", note: 'Lodging free; confirm arrival day', due: '2026-08-20', done: true },

  // ── athens (past) ─────────────────────────────────────────────────
  { id: 'athens-1', ch: 'athens', place: null, cat: 'stay', title: 'All Greece stays', note: 'Avg ~$85/n, booked', due: '2026-08-01', done: true },
  { id: 'athens-2', ch: 'athens', place: null, cat: 'transport', title: '4 inter-island ferries', note: '€685 actual', due: '2026-08-15', done: true },
  { id: 'athens-3', ch: 'athens', place: 'Chania', cat: 'car', title: 'Chania rental car', note: '~$240, rented', due: '2026-08-20', done: true },
  { id: 'athens-4', ch: 'athens', place: 'Milos', cat: 'attraction', title: 'Kleftiko boat', note: 'Book 1–2 days ahead', due: '2026-09-08', done: false },

  // ── turkey (current) ──────────────────────────────────────────────
  { id: 'turkey-1', ch: 'turkey', place: 'Göreme', cat: 'attraction', title: 'Hot-air balloon Sep 22/23', note: 'Royal / Butterfly Balloons', due: '2026-09-01', done: true },
  { id: 'turkey-2', ch: 'turkey', place: 'Göreme', cat: 'stay', title: 'Göreme stay Sep 21–24', note: 'Booked', due: '2026-08-15', done: true },
  { id: 'turkey-3', ch: 'turkey', place: 'Alaçatı + Şirince + Kaş + Akyaka', cat: 'stay', title: 'Coastal stays (re)book for new dates', note: 'Alaçatı Sep 24–26 (room from Sep 24 for 1am arrival) · Şirince 27 · Kaş 28–30 · Akyaka Oct 1', due: '2026-09-27', done: false },
  { id: 'turkey-4', ch: 'turkey', place: 'Izmir (ADB)', cat: 'car', title: 'ADB rental car Sep 25 – Oct 2', note: 'Collect ~1am Sep 25; loop Alaçatı→Şirince→Kaş→Akyaka; return Oct 2', due: '2026-09-20', done: false },
  { id: 'turkey-5', ch: 'turkey', place: null, cat: 'transport', title: 'ASR→ADB Sep 24 22:50', note: 'Bought', due: '2026-09-01', done: true },
  { id: 'turkey-6', ch: 'turkey', place: null, cat: 'transport', title: 'ADB→IST Oct 2 19:45', note: 'Moved to Oct 2 — TO BUY', due: '2026-09-28', done: false },
  { id: 'turkey-7', ch: 'turkey', place: null, cat: 'transport', title: 'IST→GYD Oct 12 + GYD→DEL Oct 14', note: 'Bought', due: '2026-09-01', done: true },
  { id: 'turkey-8', ch: 'turkey', place: null, cat: 'visa', title: 'India e-Visa', note: 'Apply by mid-Sep for the Oct 14 entry', due: '2026-09-15', done: false },

  // ── baku ──────────────────────────────────────────────────────────
  { id: 'baku-1', ch: 'baku', place: null, cat: 'visa', title: 'Azerbaijan ASAN e-Visa', note: 'Online, ~3-day processing; ~$50 for two in budget', due: '2026-10-05', done: false },

  // ── india ─────────────────────────────────────────────────────────
  { id: 'india-1', ch: 'india', place: 'Agra + Delhi', cat: 'transport', title: 'Agra–Delhi trains via IRCTC', note: '~$90 for two; 60-day window — book early for sleeper/AC classes', due: '2026-09-01', done: false },
  { id: 'india-2', ch: 'india', place: 'Agra', cat: 'attraction', title: 'Taj Mahal sunrise tickets', note: 'Buy online the day before; arrive 6am', due: '2026-10-12', done: false },

  // ── nepal ─────────────────────────────────────────────────────────
  { id: 'nepal-1', ch: 'nepal', place: null, cat: 'transport', title: 'DEL→KTM flight Oct 21', note: 'Positioning for the Nepal entry', due: '2026-09-15', done: false },
  { id: 'nepal-2', ch: 'nepal', place: 'Annapurna', cat: 'attraction', title: 'ABC trek Oct 25 – Nov 4', note: '$2,000 all-in, locked', due: '2026-09-01', done: true },
  { id: 'nepal-3', ch: 'nepal', place: 'Kathmandu + Pokhara', cat: 'stay', title: 'KTM 3n + Pokhara 6n hotels', note: 'Off-trek nights around the Oct 25 – Nov 4 trek', due: '2026-10-01', done: false },
  { id: 'nepal-4', ch: 'nepal', place: 'Kathmandu', cat: 'visa', title: 'ACAP permit + TIMS card', note: 'Issued on arrival in Kathmandu — no advance booking', due: '2026-10-21', done: false },

  // ── japan-autumn ──────────────────────────────────────────────────
  { id: 'japan-autumn-1', ch: 'japan-autumn', place: null, cat: 'transport', title: 'KTM→Tokyo flight Nov 10', note: 'Entry leg for the autumn chapter', due: '2026-09-20', done: false },
  { id: 'japan-autumn-2', ch: 'japan-autumn', place: null, cat: 'transport', title: 'JR Pass exchange order', note: 'Must be purchased BEFORE entering Japan', due: '2026-10-15', done: false },
  { id: 'japan-autumn-3', ch: 'japan-autumn', place: 'Tokyo + Osaka + Kyoto', cat: 'stay', title: 'Business hotels ~$125/n', note: 'Tokyo–Osaka–Kyoto bases', due: '2026-10-01', done: false },

  // ── korea ─────────────────────────────────────────────────────────
  { id: 'korea-1', ch: 'korea', place: null, cat: 'transport', title: 'Japan→ICN flight Nov 30', note: 'Entry leg for the Korea chapter', due: '2026-10-15', done: false },
  { id: 'korea-2', ch: 'korea', place: null, cat: 'stay', title: 'Korea hotels ~$125/n', note: 'Seoul + Busan + Gyeongju/Jeonju nights', due: '2026-10-15', done: false },
  { id: 'korea-3', ch: 'korea', place: 'Busan', cat: 'transport', title: 'ICN→PUS flight Dec 24', note: 'Xmas-Eve hop — book in the Sep batch, not day-of', due: '2026-09-30', done: false },
  { id: 'korea-4', ch: 'korea', place: 'Seoul', cat: 'attraction', title: 'DMZ tour', note: 'Needs passport details days ahead — no same-day booking', due: '2026-12-10', done: false },
  { id: 'korea-5', ch: 'korea', place: 'Jeonju → Seoul', cat: 'transport', title: 'KTX Dec 30', note: 'Korail ~30-day window opens ~Nov 30 — reserve then, not earlier', due: '2026-11-30', done: false },

  // ── taiwan ────────────────────────────────────────────────────────
  { id: 'taiwan-1', ch: 'taiwan', place: null, cat: 'transport', title: 'ICN→TPE flight Dec 24', note: 'Xmas-day entry leg', due: '2026-10-30', done: false },
  { id: 'taiwan-2', ch: 'taiwan', place: 'Hualien', cat: 'transport', title: 'Taipei→Hualien express', note: 'TRA 28-day window, reserved seats', due: '2026-12-08', done: false },
  { id: 'taiwan-3', ch: 'taiwan', place: 'Hualien → Tainan', cat: 'transport', title: 'Hualien→Tainan direct TRA', note: 'Train 324 daily; 28-day window; recheck Hwy-8 status ~Jan 4 first', due: '2026-12-10', done: false },
  { id: 'taiwan-4', ch: 'taiwan', place: 'Alishan', cat: 'stay', title: 'Alishan overnight', note: 'Sunrise unreachable as a day trip — overnight or skip', due: '2026-12-15', done: false },
  { id: 'taiwan-5', ch: 'taiwan', place: 'Tainan → Taipei', cat: 'transport', title: 'HSR Tainan→Taipei', note: '1h45m; book a few days ahead', due: '2027-01-08', done: false },

  // ── china-1 ───────────────────────────────────────────────────────
  { id: 'china-1-1', ch: 'china-1', place: null, cat: 'transport', title: 'Flight into China Jan 12', note: 'Entry leg (TPE→China in current order)', due: '2026-11-15', done: false },
  { id: 'china-1-2', ch: 'china-1', place: null, cat: 'stay', title: 'China-1 stays ~$85/n', note: 'Beijing + Jiangnan bases', due: '2026-12-01', done: false },
  { id: 'china-1-3', ch: 'china-1', place: null, cat: 'admin', title: 'Confirm BR 30-day visa-free still holds', note: 'Both entries pre-Dec-31-2026; otherwise +~$300 for two visas', due: '2026-12-15', done: false },
  { id: 'china-1-4', ch: 'china-1', place: 'Beijing → Shanghai', cat: 'transport', title: 'Beijing–Shanghai bullet', note: '~$535 for both bullet legs together; buy ~2 weeks ahead on Trip.com', due: '2027-01-15', done: false },
  { id: 'china-1-5', ch: 'china-1', place: 'Shanghai → Shenzhen', cat: 'transport', title: 'Shanghai–Shenzhen bullet', note: 'Buy ~2 weeks ahead on Trip.com', due: '2027-01-25', done: false },

  // ── hk ────────────────────────────────────────────────────────────
  { id: 'hk-1', ch: 'hk', place: null, cat: 'stay', title: 'Hong Kong stay ~$150/n', note: '5 nights Feb 11–16', due: '2027-01-15', done: false },
  { id: 'hk-2', ch: 'hk', place: null, cat: 'transport', title: 'Shenzhen→HK HSR', note: 'Guangzhou South→West Kowloon pattern: ~60 trains/day; take a morning train, prebook seats', due: '2027-02-09', done: false },

  // ── japan-winter ──────────────────────────────────────────────────
  { id: 'japan-winter-1', ch: 'japan-winter', place: null, cat: 'transport', title: 'HK→Japan flight Feb 16', note: 'Entry leg for the powder chapter', due: '2026-12-01', done: false },
  { id: 'japan-winter-2', ch: 'japan-winter', place: 'Hakuba', cat: 'stay', title: 'Hakuba stay', note: 'Powder-week base Feb 16–26', due: '2027-01-01', done: false },
  { id: 'japan-winter-3', ch: 'japan-winter', place: 'Hakuba', cat: 'attraction', title: 'Hakuba Valley 7-day pass', note: '~$930 for two — reserve ahead', due: '2027-01-15', done: false },
  { id: 'japan-winter-4', ch: 'japan-winter', place: 'Hakuba', cat: 'attraction', title: 'Snowboard rental (full kit)', note: '~$950 for two; mask + dive computer owned, snowboard kit rented', due: '2027-01-20', done: false },
  { id: 'japan-winter-5', ch: 'japan-winter', place: 'Osaka → Hakuba', cat: 'transport', title: 'Osaka–Hakuba buses', note: 'Reserve seats ahead', due: '2027-02-01', done: false },

  // ── philippines ───────────────────────────────────────────────────
  { id: 'philippines-1', ch: 'philippines', place: null, cat: 'transport', title: 'Japan→Philippines flight Feb 26', note: 'Entry leg', due: '2026-12-15', done: false },
  { id: 'philippines-2', ch: 'philippines', place: null, cat: 'stay', title: 'Coron + El Nido + Cebu stays', note: 'Coron 5n · El Nido 3n · Moalboal 2n pattern', due: '2027-01-15', done: false },
  { id: 'philippines-3', ch: 'philippines', place: 'Coron', cat: 'attraction', title: 'Coron wreck dive package (4 dive-days)', note: '~$760; book the dive shop ahead', due: '2027-02-01', done: false },
  { id: 'philippines-4', ch: 'philippines', place: 'Cebu → Manado', cat: 'transport', title: 'CEB→MDC Mar 9 (1-stop, pre-dawn start)', note: 'No nonstops — weakest link in the chain; Moalboal→CEB airport is ~3h', due: '2027-01-15', done: false },
  { id: 'philippines-5', ch: 'philippines', place: 'Manado → Sorong', cat: 'transport', title: 'MDC→SOQ Mar 10, TransNusa 08:00', note: 'The humane choice over Lion 03:45; liveaboard boards Mar 11', due: '2027-01-15', done: false },

  // ── indonesia ─────────────────────────────────────────────────────
  { id: 'indonesia-1', ch: 'indonesia', place: 'Raja Ampat', cat: 'attraction', title: 'Liveaboard Mar 11–20', note: 'Papua Diving / Meridian Adventure — $8,400 locked; MOVED dates, reconfirm with operator', due: '2025-10-01', done: true },
  { id: 'indonesia-2', ch: 'indonesia', place: null, cat: 'visa', title: 'Indonesia VOA + 30-day extension', note: 'VOA on Mar 11 entry; extend in Bali (~$60 for two) to cover the Apr 18 exit', due: '2027-03-11', done: false },
  { id: 'indonesia-3', ch: 'indonesia', place: 'Sorong', cat: 'transport', title: 'Sorong flights ~$1,200', note: 'MDC→SOQ + SOQ→DPS chain', due: '2027-01-15', done: false },
  { id: 'indonesia-4', ch: 'indonesia', place: 'Ubud', cat: 'stay', title: 'Ubud slow 10n stay', note: 'Recovery base after the liveaboard', due: '2027-02-01', done: false },
  { id: 'indonesia-5', ch: 'indonesia', place: 'Komodo', cat: 'attraction', title: 'Komodo boat + dives', note: 'Book the boat operator ahead', due: '2027-02-15', done: false },

  // ── borneo ────────────────────────────────────────────────────────
  { id: 'borneo-1', ch: 'borneo', place: null, cat: 'transport', title: 'Flight into Borneo ~Apr 18', note: 'Entry leg (DPS→KK pattern)', due: '2027-02-15', done: false },
  { id: 'borneo-2', ch: 'borneo', place: 'Kinabatangan', cat: 'stay', title: 'Kinabatangan river lodge', note: '3D2N ~$600 full board; book 2–3 months ahead — dry-season lodges fill', due: '2027-02-01', done: false },
  { id: 'borneo-3', ch: 'borneo', place: 'Sipadan', cat: 'attraction', title: 'Sipadan permits (only if adding 3 days)', note: '120 permits/day cap — book by Nov 2026', due: '2026-11-30', done: false },

  // ── singapore ─────────────────────────────────────────────────────
  { id: 'singapore-1', ch: 'singapore', place: null, cat: 'transport', title: 'Flight into Singapore ~Apr 28', note: 'Entry leg (KK→SG pattern)', due: '2027-03-01', done: false },
  { id: 'singapore-2', ch: 'singapore', place: null, cat: 'stay', title: 'Singapore stay ~$140/n', note: '7 nights Apr 28 – May 5', due: '2027-03-15', done: false },

  // ── malaysia ──────────────────────────────────────────────────────
  { id: 'malaysia-1', ch: 'malaysia', place: null, cat: 'stay', title: 'KL + Penang guesthouses', note: '10 nights May 5–15', due: '2027-04-01', done: false },
  { id: 'malaysia-2', ch: 'malaysia', place: 'Singapore → KL', cat: 'transport', title: 'SG→KL bus', note: 'Book a few days ahead', due: '2027-04-20', done: false },
  { id: 'malaysia-3', ch: 'malaysia', place: 'KL → Penang', cat: 'transport', title: 'ETS rail KL→Penang', note: 'Book seats ahead; Penang Hill + mansions at the other end', due: '2027-04-25', done: false },

  // ── thailand ──────────────────────────────────────────────────────
  { id: 'thailand-1', ch: 'thailand', place: null, cat: 'stay', title: 'Thailand stays', note: 'Koh Tao + Samui + Kanchanaburi nights', due: '2027-04-15', done: false },
  { id: 'thailand-2', ch: 'thailand', place: 'Penang → Koh Tao', cat: 'transport', title: 'Penang→Koh Tao transfer', note: 'Cross-border bus + ferry combo', due: '2027-05-01', done: false },
  { id: 'thailand-3', ch: 'thailand', place: 'Koh Tao', cat: 'attraction', title: 'Koh Tao dive package + Sail Rock', note: '3 local dive-days ~$360 + Sail Rock ~$190; reserve the shop ahead', due: '2027-05-05', done: false },
  { id: 'thailand-4', ch: 'thailand', place: 'Bangkok → Guilin', cat: 'transport', title: 'BKK→XIY flight May 29', note: 'Spring 9C6294 dep 02:55 — leave Bangkok the night of May 28; ~$400 for two', due: '2027-04-01', done: false },

  // ── china-2 ───────────────────────────────────────────────────────
  { id: 'china-2-1', ch: 'china-2', place: null, cat: 'stay', title: 'Guilin + Zhangjiajie stays', note: '20 nights May 29 – Jun 18', due: '2027-05-01', done: false },
  { id: 'china-2-2', ch: 'china-2', place: "Xi'an → Guilin", cat: 'transport', title: 'XIY→KWL flight Jun 2', note: '~2h trunk; LCC ~$80–140 pp', due: '2027-04-15', done: false },
  { id: 'china-2-3', ch: 'china-2', place: 'Zhangjiajie', cat: 'attraction', title: 'Zhangjiajie entrance tickets', note: 'Real-name booking ~1 week ahead in June peak', due: '2027-06-01', done: false },
  { id: 'china-2-4', ch: 'china-2', place: 'Zhangjiajie', cat: 'attraction', title: 'Tianmen Mountain tickets', note: 'Cableway slots sell out — book with Zhangjiajie', due: '2027-06-03', done: false },
];
