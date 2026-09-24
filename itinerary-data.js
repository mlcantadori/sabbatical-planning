// Sabbatical itinerary — single source of truth.
// Drives all three design directions. Read-only at runtime.

window.TRIP = (function () {
  const START = new Date('2026-06-21');
  const END = new Date('2027-06-17');
  const MS = 86400000;
  const totalDays = Math.round((END - START) / MS);

  // Lookup helper for any date → "Day N of M"
  function dayCounter(date) {
    const d = (date instanceof Date) ? date : new Date(date);
    const n = Math.round((d - START) / MS) + 1;
    return { n: Math.max(1, Math.min(totalDays, n)), total: totalDays };
  }

  // Google Maps deep link
  function mapsUrl(query, lat, lng) {
    if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  // loremflickr — returns real Flickr photos matching the keyword.
  // Deterministic per keyword via a hash-derived lock value.
  function photoUrl(keywords, w = 1200, h = 900) {
    const terms = encodeURIComponent(keywords.trim().replace(/\s+/g, ','));
    let hash = 0;
    for (let i = 0; i < keywords.length; i++) {
      hash = ((hash << 5) - hash) + keywords.charCodeAt(i);
      hash |= 0;
    }
    const lock = Math.abs(hash) % 500;
    return `https://loremflickr.com/${w}/${h}/${terms}?lock=${lock}`;
  }

  function fmt(d, { year = false } = {}) {
    const dt = new Date(d);
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getUTCMonth()];
    return year ? `${m} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}` : `${m} ${dt.getUTCDate()}`;
  }

  function dayRange(start, end) {
    return `${fmt(start)} – ${fmt(end)}`;
  }

  // ── Regions for visual grouping / coloring ──
  const REGIONS = {
    americas:     { name: 'Americas',       accent: '#8b6040' },
    mediterranean:{ name: 'Mediterranean',  accent: '#4a7fa5' },
    crossroads:   { name: 'Crossroads',     accent: '#c2693a' },
    himalaya:     { name: 'Himalaya',       accent: '#7a8a52' },
    northeast:    { name: 'Northeast',      accent: '#a8543e' },
    middle:       { name: 'China & HK',     accent: '#b03a3a' },
    archipelago:  { name: 'Archipelago',    accent: '#2c6f7a' },
    isthmus:      { name: 'SE Asia',        accent: '#c98a2a' },
    rainforest:   { name: 'Rainforest',     accent: '#3d6e4f' },
  };

  // ── Chapters ──
  // Each entry: id, kind, country, flag, title, dates, days, theme,
  // intro (poetic), tldr (condensed), weather, region, places[]
  // NOTE: chapter numbers are NOT stored here — itinerary-store.js derives
  // them from array order on load, so inserting/reordering is renumber-free.
  const chapters = [
    {
      id: 'brasil', kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'Brasil',
      start: '2026-06-21', end: '2026-08-26', days: 66,
      theme: 'Mountains and diving certs, kite condo, farewell BBQ',
      intro: 'The trip opens at home: Rio for the Petrópolis–Teresópolis trail and diving certifications (Advanced Open Water + NITROX), then a month in a Cumbuco condo for short kitesurfing sessions and downwinders, closing with friends, family and a farewell BBQ in São Paulo.',
      tldr: 'Rio de Janeiro · Cumbuco · São Paulo',
      weather: { hi: 30, lo: 18, label: 'Inverno brasileiro, 18°–30°', emoji: '🏠', rainyDays: 12 },
      photos: ['rio aerial', 'copacabana beach', 'cumbuco beach kites', 'cumbuco kitesurf', 'masp sao paulo', 'sao paulo skyline'],
      places: [
        { name: 'Rio de Janeiro', days: 29, query: 'Ipanema, Rio de Janeiro',
          highlights: ['Petrópolis–Teresópolis trail (Serra dos Órgãos)','Diving certifications: Advanced Open Water + NITROX','Fly Rio → Fortaleza Jul 20'] },
        { name: 'Cumbuco', days: 29, query: 'Cumbuco, Caucaia, Ceará',
          highlights: ['Stayed in a condo — home base','Short kitesurfing sessions from the condo','Occasional downwinders from the village center','Fly Fortaleza → São Paulo Aug 19'] },
        { name: 'São Paulo', days: 7, query: 'Avenida Paulista, São Paulo',
          highlights: ['No sightseeing — time with friends and family only','Farewell BBQ before leaving Brazil','Fly São Paulo → Toronto to open the international leg'] },
      ],
    },
    {
      id: 'toronto', kind: 'chapter', region: 'americas',
      country: 'Canada', flag: '🇨🇦', title: 'Canada',
      start: '2026-08-27', end: '2026-09-01', days: 5,
      theme: 'Friends & family send-off before Europe',
      intro: 'Five days in Toronto before crossing the Atlantic — mostly to meet friends and family. Stayed at a friend\'s place, played with their kids. Overnight flight out on Aug 31, landing in Athens Sep 1.',
      tldr: 'Friends & family · Toronto Islands · High Park · UofT bike ride',
      weather: { hi: 27, lo: 17, label: 'Late summer, 27°/17°', emoji: '🍁', rainyDays: 2 },
      photos: ['toronto cn tower', 'toronto distillery', 'niagara falls'],
      places: [
        { name: 'Toronto', days: 5, query: 'Kensington Market, Toronto',
          highlights: ['Stayed at a friend\'s place — home base, meals together, played with their kids','Toronto Islands ferry — city skyline across Lake Ontario','High Park late-summer picnic','Bike ride around the University of Toronto campus','Fly Toronto → Athens to open Mediterranean chapter'] },
      ],
    },
    {
      id: 'athens', kind: 'chapter', region: 'mediterranean',
      country: 'Greece', flag: '🇬🇷', title: 'Greece',
      start: '2026-09-01', end: '2026-09-21', days: 20,
      theme: 'Athens, Cretan trails, island-hopping the western Cyclades — 100% booked ✅',
      intro: 'Twenty nights arcing south through Greece in September — crowds thinning, sea at its warmest. Athens first, then Crete with a car rented in Chania, and the ferry chain north through Santorini, Folegandros and Milos. Every bed, ferry and flight is locked.',
      tldr: 'Athens · Chania · Rethymno · Santorini · Folegandros · Milos',
      weather: { hi: 29, lo: 20, label: 'September Aegean, 29°/20°', emoji: '🏛️', rainyDays: 2 },
      photos: ['athens acropolis', 'chania old town', 'santorini oia', 'folegandros chora', 'milos sarakiniko'],
      places: [
        { name: 'Athens', days: 4, query: 'Acropolis, Athens, Greece',
          highlights: ['Acropolis + Parthenon — arrive at opening, golden light before 9am','Plaka + Anafiotika — whitewashed Cycladic enclave inside the city','Acropolis Museum','Monastiraki flea market + evening mezedes bars','Philopappos Hill','Pnyx','Ancient Agora + Roman Agora','National Garden','Panathenaic Stadium','Odyssey at the Thision Open Air Cinema','Took the X95 bus to the airport — Sep 5, 06h45 flight to Chania; online check-in the evening before'] },
        { name: 'Crete — Chania', days: 4, query: 'Chania old town, Crete',
          highlights: ['Rented a car in Chania (not Rethymno) — base for west-Crete day trips','Chania city: Venetian harbor + lighthouse, old town alleys','Balos lagoon','Elafonisi pink-sand beach','Therisos Gorge','Falasarna beach','Cretan tavernas: dakos, lamb, raki on the house'] },
        { name: 'Crete — Rethymno', days: 3, query: 'Rethymno old town, Crete',
          highlights: ['No car in Rethymno — city base only','Rethymno old town + Venetian harbor walk','Sep 12 seasonal fast ferry Rethymno → Santorini','Plan B if meltemi cancels: car/bus to Heraklion (~1h15) + ferry from there'] },
        { name: 'Santorini', days: 2, query: 'Fira, Santorini',
          highlights: ['Lodging outside the caldera — budget lever already applied','Cliff walk Fira → Imerovigli → Oia along the caldera rim','Local buses + ATV to get around','Sep 14 ferry to Folegandros'] },
        { name: 'Folegandros', days: 2, query: 'Chora, Folegandros',
          highlights: ['The un-hyped bet — 100% walkable island, no car','Chora — one of the prettiest villages in the Cyclades','Panagia church trail at sunset','Agali beach + Katergo by small boat','Local bus ~€2 per hop','Sep 16 short ferry hop to Milos'] },
        { name: 'Milos', days: 4, query: 'Sarakiniko, Milos',
          highlights: ['Sarakiniko — white volcanic moonscape over turquoise water','Kleftiko boat day — the chapter splurge (~€240)','ATV/car for ~3 days — Tsigrado, Firopotamos, Papafragas swims','Plaka sunset + Klima\'s painted syrmata boathouses','Checkout adjusted Sep 22 → 20 ✅','Sep 20 ferry Milos → Athens (Piraeus) — bought ✅'] },
        { name: 'Athens — buffer', days: 1, query: 'Piraeus, Athens',
          highlights: ['Buffer night near the airport — booked ✅','Sep 21 flight Athens → Cappadocia via IST, single Turkish ticket — bought ✅'] },
      ],
      booking: ['Crete car in Chania — rented ✅','Balos + Elafonisi + Falasarna by car, weather-dependent','Kleftiko boat, Milos — book 1–2 days ahead'],
      decisions: ['Crete replaced Naxos — superlative trails, authentic interior, cheaper; Heraklion dropped, Rethymno gets 3 nights with the direct seasonal ferry','Car rented in Chania (not Rethymno) — west-Crete day trips: Balos, Elafonisi, Therisos Gorge, Falasarna; Rethymno as car-free city base','Visited in Crete: Balos, Elafonisi, Therisos Gorge, Falasarna beach, Chania + Rethymno cities — other spots excluded','Folegandros kept as the un-hyped bet — fully walkable island','Milos→Athens flight discarded; bought ferry + buffer night solves the connection'],
    },
    {
      id: 'turkey', kind: 'chapter', region: 'crossroads',
      country: 'Turkey', flag: '🇹🇷', title: 'Turkey',
      start: '2026-09-21', end: '2026-10-12', days: 21,
      theme: 'Cappadocia balloons, Aegean kitesurfing, Lycian coast, unhurried Istanbul',
      intro: 'Landing from Athens on a single Turkish ticket via IST into Göreme. Three nights in the valleys (balloon booked ✅), then take the Sep 24, 22:50 ASR→ADB flight for a rental-car loop down the Aegean coast: Alaçatı, Şirince (Ephesus), Kaş and Akyaka. Return the car at ADB on Oct 2, fly ADB → Istanbul 16:45 and stay until the end of the chapter before the Oct 12 flight to Baku.',
      tldr: 'Cappadocia (Göreme) · Alaçatı · Şirince · Kaş · Akyaka · Istanbul',
      weather: { hi: 26, lo: 14, label: 'Early autumn, 26°/14°', emoji: '☀️', rainyDays: 3 },
      photos: ['cappadocia balloons', 'alacati aegean', 'kas harbour', 'istanbul mosque'],
      places: [
        { name: 'Cappadocia — Göreme', days: 3, query: 'Göreme, Cappadocia, Turkey',
          highlights: ['Sep 21 arrival in Göreme from Athens via IST — single Turkish ticket, bought ✅','Explore the valleys: Rose Valley, Love Valley, Göreme Open Air Museum','Hot air balloon flight — Sep 22 or 23, booked ✅','Underground cities: Derinkuyu, Kaymakli','Stays Göreme Sep 21–24 booked ✅','Sep 24, 22:50: fly Kayseri (ASR) → Izmir (ADB), bought ✅'] },
        { name: 'Alaçatı', days: 3, query: 'Alaçatı, Çeşme, Turkey',
          highlights: ['Land ADB 22:50 Sep 24, drive ~1h around 1am — room booked from Sep 24 for the late arrival','Relax, recover, explore Alaçatı / Çeşme / Ilıca','Kitesurfing window on the Çeşme peninsula','Restored stone-house village, windmills, Aegean coastline'] },
        { name: 'Şirince', days: 1, query: 'Şirince, Selçuk, Turkey',
          highlights: ['Drive ~1.5–2h from Alaçatı','Visit Ephesus late afternoon or next morning','Quiet village overnight'] },
        { name: 'Kaş', days: 3, query: 'Kaş, Antalya, Turkey',
          highlights: ['Drive ~5h from Şirince/Selçuk','Two full days for Kekova, swimming, Kaputaş, relaxing','Lycian Way treks from town'] },
        { name: 'Akyaka', days: 1, query: 'Akyaka, Muğla, Turkey',
          highlights: ['Drive ~2.5–3h from Kaş','Azmak River, slow evening','Oct 2: ~2.5h drive to Izmir airport (ADB) — drop the car, fly ADB → Istanbul 19:45'] },
        { name: 'Istanbul', days: 10, query: 'Sultanahmet, Istanbul',
          highlights: ['Oct 2, 19:45 flight ADB → Istanbul (~1h15)','Historic peninsula: Hagia Sophia, Topkapi, Sultanahmet without rushing','Asian side — Kadıköy/Moda ferries and market mornings','Bosphorus ferries — the most beautiful commute on Earth','Princes\' Islands day trip','Oct 12: fly Istanbul (IST) → Baku (GYD), bought ✅'] },
      ],
      booking: ['Balloon Sep 22/23 — booked ✅','IST → GYD Oct 12 + GYD → DEL Oct 14 — bought ✅','Stays Göreme Sep 21–24 booked ✅ — Alaçatı (Sep 24–26, from Sep 24 for 1am arrival), Şirince (27), Kaş (28–30), Akyaka (Oct 1) need (re)booking for new dates','Rental car ADB Sep 25 – Oct 2 — collect at ADB (~1am Sep 25), loop Alaçatı→Şirince→Kaş→Akyaka, return at ADB Oct 2','Internal flights ASR→ADB 22:50 Sep 24 + ADB→IST Oct 2, 19:45 — ASR→ADB bought ✅, ADB→IST to buy','India e-Visa by mid-Sep'],
      decisions: ['Göreme as the Cappadocia base — valleys, balloon logistics, Open Air Museum','Coastal loop by rental car (Alaçatı + Şirince/Ephesus + Kaş + Akyaka) instead of a Kaş turnaround','Şirince picked for Ephesus access + quiet village night; Akyaka breaks the Kaş→Izmir drive','Istanbul as 10-night close (Oct 2–12), then Baku stopover Oct 13 to break IST → DEL'],
    },
    {
      id: 'baku', kind: 'chapter', region: 'crossroads',
      country: 'Azerbaijan', flag: '🇦🇿', title: 'Azerbaijan',
      start: '2026-10-12', end: '2026-10-14', days: 2,
      theme: 'Caspian layover between Istanbul and Delhi',
      intro: 'One full day on the ground (Oct 13) between flights: leave IST Oct 12, arrive DEL Oct 14. Flame Towers at dusk, the walled Old City, and the Caspian promenade.',
      tldr: 'Flame Towers · Icherisheher · Caspian Bulvar',
      weather: { hi: 19, lo: 13, label: 'Mild autumn, 19°/13°', emoji: '🔥', rainyDays: 2 },
      photos: ['baku flame towers', 'baku old city'],
      places: [
        { name: 'Baku', days: 2, query: 'Baku, Azerbaijan',
          highlights: ['Oct 12: fly Istanbul (IST) → Baku (GYD), land 23:05 — bought ✅','Oct 13: Flame Towers — Caspian bay panorama at dusk','Icherisheher (Old City) — Maiden Tower + Palace of the Shirvanshahs','Caspian promenade (Bulvar) waterfront walk','Oct 13, 22:35: fly Baku (GYD) → Delhi (DEL), arrive Oct 14 — bought ✅'] },
      ],
    },
    {
      id: 'india', kind: 'chapter', region: 'himalaya',
      country: 'India', flag: '🇮🇳', title: 'India',
      start: '2026-10-14', end: '2026-10-21', days: 7,
      theme: 'Sacred intensity, iconic monuments, Himalayan slow life',
      intro: 'A tight, intentional India: land in Delhi Oct 14 from Baku, day trip to the Taj on Oct 15, train to Varanasi Oct 17 at 06:00 (booked ✅), then Varanasi Oct 17–21 at full spiritual intensity before flying direct to Kathmandu on Oct 21.',
      tldr: 'Delhi · Agra · Varanasi (via Baku)',
      weather: { hi: 30, lo: 16, label: 'Post-monsoon clear, 30°/16°', emoji: '🌅', rainyDays: 1 },
      photos: ['taj mahal sunrise', 'varanasi ghats'],
      places: [
        { name: 'Delhi + Agra', days: 3, query: 'Taj Mahal, Agra',
          highlights: ['Land in Delhi Oct 14 from Baku (IST → GYD Oct 12 → DEL Oct 14)','Oct 15: day trip Delhi → Agra — Taj Mahal at sunrise, Agra Fort, Mehtab Bagh sunset','Old Delhi — Jama Masjid + Chandni Chowk food walk','Oct 17, 06:00: train to Varanasi — booked ✅'] },
        { name: 'Varanasi', days: 4, query: 'Varanasi ghats, India',
          highlights: ['Arrive Oct 17 — Ghats at dawn: rowing on the Ganges in morning mist','Ganga Aarti at dusk — fire, flowers, bells, priests','Manikarnika cremation ghats','Sarnath — where Buddha first taught, 10km out','Chai, silk, wandering the narrow alleys','Oct 21, 08:30: fly Varanasi → Kathmandu (direct, ~1h) — booked ✅ ($343 for two)'] },
      ],
      booking: ['Delhi → Agra day trip Oct 15','Train to Varanasi Oct 17, 06:00 — booked ✅','Varanasi → Kathmandu Oct 21, 08:30 — booked ✅ ($343 for two)'],
    },
    {
      id: 'nepal', kind: 'chapter', region: 'himalaya',
      country: 'Nepal', flag: '🇳🇵', title: 'Nepal',
      start: '2026-10-21', end: '2026-11-09', days: 19,
      theme: 'Sacred roof of the world, physical peak, elemental beauty',
      intro: 'Late October into November — post-monsoon clarity holds, skies still crystalline, Himalayan views unobstructed 360°. Slightly cooler than October, meaning fewer crowds on the trail and sharper air at altitude.',
      tldr: 'Kathmandu · Pokhara · Annapurna Base Camp trek',
      weather: { hi: 18, lo: 2, label: 'Late post-monsoon, 18°/2°', emoji: '🏔️', rainyDays: 1 },
      photos: ['annapurna himalaya', 'kathmandu boudhanath stupa', 'pokhara phewa lake', 'everest prayer flags'],
      places: [
        { name: 'Kathmandu', days: 4, query: 'Kathmandu, Nepal',
          highlights: ['Arrive Oct 21 from Varanasi (08:30 direct — booked ✅)','Boudhanath Stupa — one of the largest stupas on Earth','Pashupatinath Temple — sacred Hindu cremation ghats on the Bagmati','Swayambhunath (Monkey Temple)','Oct 24: DWT office, Thamel — pay $1,296 balance, gear check, pre-trek briefing, meet guide + porter','ACAP + TIMS via agency (confirm at office); KTM hotels/meals own cost'] },
        { name: 'Annapurna Base Camp Trek', days: 11, query: 'Annapurna Base Camp, Nepal',
          highlights: ['Oct 25 – Nov 4 with Discovery World Trekking ($720pp — booked ✅)','Oct 25: tourist bus Kathmandu → Pokhara (6–7h); lakeside evening briefing','Oct 26: drive to Tikhedhunga, trek to Ulleri (7km, stone-stair challenge)','Oct 27: Ulleri → Ghorepani (10km, rhododendron forest)','Oct 28: 4am Poon Hill sunrise (3,210m) → Tadapani (11.5km)','Oct 29: Tadapani → Chomrong, sanctuary gateway (10km)','Oct 30: Chomrong → Himalaya via Sinuwa + Bamboo (12km)','Oct 31: Himalaya → ABC (4,130m) via MBC — apex day','Nov 1: ABC → Bamboo descent (14km)','Nov 2: Bamboo → Jhinu Danda hot springs (8.5km)','Nov 3: drive Jhinu → Pokhara, farewell gathering (Silver Oaks Inn incl.)','Nov 4: tourist bus Pokhara → Kathmandu with agency (included) — back to Thamel','Guide + porter per 2 (9kg pp limit — store rest free at DWT office); full-board on trail; bag + down jacket loan','Cash: tips ~$150, snacks/water, showers/WiFi, visa $50pp, heli-evac insurance (mandatory)'] },
        { name: 'Kathmandu recovery', days: 4, query: 'Thamel, Kathmandu',
          highlights: ['Nov 5–8: slow Thamel days — rest, massage, laundry + repack for China','Return loaned sleeping bag + down jacket at DWT office','Boudhanath dawn kora farewell, Patan Durbar Square slow afternoon option','Farewell dinner before the China leg','Nov 9: fly onward (KTM → Shanghai) — no positioning flight needed'] },
      ],
      booking: ['ABC trek — Discovery World, $1,440 for two ($144 advance paid ✅, $1,296 balance due Oct 24 at KTM office)','ACAP + TIMS via agency — confirm Oct 24','9kg pp porter limit — store excess free at DWT office'],
    },
    {
      id: 'china-e1', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-11-10', end: '2026-12-02', days: 22,
      theme: 'First entry: Beijing first, then south — canyon, gardens, friends finale',
      intro: 'The first mainland admission runs 22 days north-to-south, inside the 25-day comfort limit. Beijing first while winter light is crisp (empty Wall), Xi\'an, Huangshan with West Sea Canyon still open, Jiangnan gardens at foliage peak, then south for friends\' finale in Shenzhen and the Cantonese blitz in Guangzhou before Hong Kong.',
      tldr: 'Beijing · Xi\'an · Huangshan · Hangzhou · Suzhou · Shenzhen · Guangzhou',
      weather: { hi: 12, lo: 0, label: 'North cold → south mild, 12°/0°', emoji: '🍁', rainyDays: 4 },
      photos: ['great wall snow', 'xian terracotta warriors', 'shenzhen night skyline'],
      places: [
        { name: 'Beijing', days: 5, query: 'Mutianyu Great Wall, Beijing',
          highlights: ['Fly in from Kathmandu Nov 9 (via Chengdu) — Entry 1 starts Nov 10','Great Wall (Mutianyu) — empty, pick the bluest morning','Forbidden City in crisp winter light (closed Mondays — Nov 16 out)','Temple of Heaven + 798 Art District','Hutong + Drum/Bell Towers, Peking duck','Down/fleece bought in Kathmandu Thamel — Guangzhou trick no longer works','HSR Beijing → Xi\'an (~5h) Nov 15'] },
        { name: 'Xi\'an', days: 3, query: 'Terracotta Warriors, Xi\'an',
          highlights: ['Terracotta Warriors — indoor museum, astounding at any time of year','Cycle the city walls, Muslim Quarter lamb skewers + biangbiang','Giant Wild Goose Pagoda','Fly Xi\'an → Hangzhou (~2h) Nov 18, bus to Tangkou'] },
        { name: 'Huangshan', days: 3, query: 'Huangshan, Anhui',
          highlights: ['Yellow Mountain — autumn foliage + early rime, sea of clouds','West Sea Canyon OPEN (closes Dec–Mar) — November timing is the whole point','Bright Summit sunrise above the cloud sea','Windproof shell + traction spikes in Tangkou if icy','Book summit hotel ~3 days ahead; front-load the canyon days','Bus to Hangzhou Nov 21'] },
        { name: 'Hangzhou', days: 2, query: 'West Lake, Hangzhou',
          highlights: ['West Lake in autumn color — Broken Bridge, Su Causeway, golden gingkoes','Lingyin Temple in cedar quiet, Meijiawu tea village','Hefang Street old town','HSR Hangzhou → Suzhou (~1.5h) Nov 23'] },
        { name: 'Suzhou', days: 3, query: 'Humble Administrator\'s Garden, Suzhou',
          highlights: ['Humble Administrator\'s Garden + Lion Grove in autumn color — peak week','Tongli water town slow day — misty canals, empty bridges','Pingjiang Road canals at dusk (skip the Silk Museum for lived-in lanes)','Via Shanghai airports Nov 26 — fly to Shenzhen (in-chapter hop)'] },
        { name: 'Shenzhen', days: 4, query: 'Shekou, Shenzhen',
          highlights: ['Four full days with friends (Nov 26–30 ✓ — inside the Nov 24–Dec 1 window!)','Huaqiangbei Electronics Market — world\'s largest, floors of components','OCT-LOFT Contemporary Art District','Dapeng Peninsula coastal hike (optional)','Dafen Oil Painting Village (pass-through only)','HSR Shenzhen → Guangzhou (~1h) Nov 30'] },
        { name: 'Guangzhou', days: 2, query: 'Shamian Island, Guangzhou',
          highlights: ['Cantonese food deep-dive — dim sum where it was born (Kaiping cut)','Shamian Island colonial arcades, Chen Clan Academy','Canton Tower at night','HSR Guangzhou → Hong Kong Dec 2 (morning train + 1h buffer)'] },
      ],
    },
    {
      id: 'hk', kind: 'chapter', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong',
      start: '2026-12-02', end: '2026-12-07', days: 5,
      theme: 'Neon city + dim sum + visa reset, priced before Christmas week',
      intro: 'Five early-December days: dry 20° air, early WinterFest lights, the cheapest hotel week of the season — the 30-day visa clock resets for the Sichuan leg, and a Thursday-morning errand files the Taiwan visitor visas for January. A proper chapter, not transit.',
      tldr: 'Victoria Peak · Kowloon neon · Dim sum · Lamma Island',
      weather: { hi: 20, lo: 14, label: 'Pre-Christmas dry, 20°/14°', emoji: '🥟', rainyDays: 1 },
      photos: ['hong kong skyline', 'kowloon neon', 'hong kong dim sum'],
      places: [
        { name: 'Hong Kong', days: 5, query: 'Victoria Peak, Hong Kong',
          highlights: ['Victoria Peak — harbor panorama at dusk, city grid below','Star Ferry crossing: Kowloon → Central at night','Dim sum yum cha: Tim Ho Wan, Lin Heung, One Dim Sum','Taiwan visitor-visa filing at TECO Dec 3 (morning errand — pickup Dec 4–5)','Temple Street Night Market — jade, fortune tellers, street food','Nan Lian Garden + Chi Lin Nunnery (free, stunning)','Lamma Island day trip: seafood lunch, car-free village walk','Rest, laundry, planning — fly HK → Chengdu Dec 7'] },
      ],
    },
    {
      id: 'china-e2', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-12-07', end: '2026-12-24', days: 17,
      theme: 'Sichuan fire, Wulong karst, Shanghai slow finish',
      intro: 'Second mainland entry (16 counted days — clock reset in Hong Kong, huge buffer). Panda mornings and hotpot nights, a 2-day Wulong karst overnight (winter-empty bridges, possible Fairy Mountain snow), then a trimmed 5-day Shanghai slow finish with heated modern hotels before Korea.',
      tldr: 'Chengdu · Chongqing · Wulong · Shanghai',
      weather: { hi: 11, lo: 1, label: 'Mild Sichuan, cold Shanghai finish, 11°/1°', emoji: '🧣', rainyDays: 3 },
      photos: ['chengdu panda', 'chongqing cyberpunk night', 'shanghai bund night'],
      places: [
        { name: 'Chengdu', days: 6, query: 'Chengdu Panda Base',
          highlights: ['Fly HK → Chengdu Dec 7 (direct, 5+/day)','Giant panda base — crisp winter morning, active bears','Sanxingdui day trip — bronze masks, 18-min HSR + taxi (~50min door-to-door)','TICKETS: WeChat mini-program, 20:00 five days out, NO walk-up — book Dec 2 from HK!','Jinli Ancient Street (90-min evening only), Kuanzhai Alley','People\'s Park teahouse + Wenshu Monastery slow day','Leshan Giant Buddha day trip option (boat-first, skip the stair queues)','Hotpot ×4 — winter is the season','HSR Chengdu → Chongqing (~1h) Dec 13'] },
        { name: 'Chongqing', days: 2, query: 'Chongqing, China',
          highlights: ['The most cyberpunk city on Earth — 34M people, bridges everywhere','Hongyadong stilted riverfront — view from Qiansimen Bridge at night, don\'t queue inside','Cable car across the Yangtze River, Ciqikou old town slow half-day','Hotpot capital — mandatory multiple visits','HSR Chongqing East → Wulong South (~34min) Dec 15 morning'] },
        { name: 'Wulong', days: 2, query: 'Wulong Karst, Chongqing',
          highlights: ['Dec 15–16 overnight — winter-emptiest UNESCO karst (low-season ¥210 combined ticket)','Day 1: Three Natural Bridges (2.5–4h) + Longshuixia Gorge (2h); sleep Xiannvshan Town','Day 2: Fairy Mountain — possible snow; back to Chongqing by afternoon','Non-slip shoes (walkways can ice); fog lifts ~10–11am; last coach ~17:30 if day-tripping (we overnight)','HSR back to Chongqing, fly CKG → PVG Dec 17 (morning)'] },
        { name: 'Shanghai', days: 5, query: 'The Bund, Shanghai',
          highlights: ['French Concession café season — heated MODERN hotels only (no lane houses, no central heating)','The Bund at night, Yu Garden, Tianzifang, M50 art district','Wuzhen water-town day trip option (or second slow day)','Laundry, trip planning, Korea prep','Dec 22–23: protected buffer — no bonus day trips','Fly Shanghai → Seoul Dec 24 — Korea begins (Christmas Eve flight, booked early)'] },
      ],
    },
    {
      id: 'korea', kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2026-12-24', end: '2027-01-11', days: 18,
      theme: 'Christmas in Busan, NYE in Seoul, palace snow',
      intro: 'Eighteen days flipped south-first: Christmas by the sea in Busan, frost temples inland, then the capital for the Bosingak New Year bell on Dec 31. Deep winter (−8°) carried by jjigae stews, pojangmacha tents, and Seoul at its most electric.',
      tldr: 'Busan Christmas · Gyeongju · Jeonju · NYE Seoul',
      weather: { hi: 2, lo: -8, label: 'Festive deep winter, 2°/-8°', emoji: '❄️', rainyDays: 5 },
      photos: ['seoul palace winter', 'busan gamcheon', 'gyeongju temple', 'jeonju hanok', 'korean street food'],
      places: [
        { name: 'Busan', days: 3, query: 'Gamcheon Culture Village, Busan',
          highlights: ['Land ICN Dec 24, hop straight to Busan (flight or KTX)','Christmas Day by the sea — Gamcheon hillside in winter light','Jagalchi Fish Market — winter king crab season (open Xmas Day)','Haedong Yonggungsa seaside temple','Gwangalli Bridge lit up at night (drone show Sat Dec 26, 19:00/21:00 — verify dates)','Train to Gyeongju Dec 27'] },
        { name: 'Gyeongju', days: 2, query: 'Bulguksa Temple, Gyeongju',
          highlights: ['Bulguksa (UNESCO) + Seokguram Grotto, crowd-free','Tumuli Park burial mounds in frost','Anapji Pond at dusk','Direct bus to Jeonju Dec 29 (11:20, arrive by 15:00) — keep the day otherwise empty'] },
        { name: 'Jeonju', days: 1, query: 'Jeonju Hanok Village',
          highlights: ['Bibimbap in a traditional courtyard — the origin city (compressed to one full day)','800+ inhabited hanok houses','Makgeolli bars + traditional markets','KTX to Seoul Dec 30, midday — in position for NYE'] },
        { name: 'Seoul', days: 12, query: 'Myeongdong, Seoul',
          highlights: ['NYE Dec 31: Bosingak bell + citywide countdown ✓','Gyeongbokgung + Changdeokgung in snow-dusted winter light','Hongdae, Insadong, specialty coffee deep-dive','DMZ day trip Jan 5/6 (Tue/Wed — book ahead, closed Mon Jan 4)','Suwon Hwaseong day trip option (Jan 7 — best amid the soft Jan 7–8 stretch)','Gwangjang Market — bindaetteok, mayak gimbap','Bukchon Hanok Village (mornings, voices down)','Recovery day Jan 9: jjimjilbang + laundry + pack for Taipei','Thermals bought in Beijing — Seoul top-up if needed','Fly Seoul → Taipei Jan 11'] },
      ],
    },
    {
      id: 'taiwan', kind: 'chapter', region: 'northeast',
      country: 'Taiwan', flag: '🇹🇼', title: 'Taiwan',
      start: '2027-01-11', end: '2027-01-25', days: 14,
      theme: 'Winter island: gray north, mild south, slow food week',
      intro: 'Fourteen January days as post-Korea thaw: Taipei cool and drizzly (tilt indoor — full NPM day, coffee streets, Beitou option), a Taroko coast day, then Tainan\'s mild dry slow week before Japan. No NYE countdown here (Seoul keeps it) — the island as winter slow travel.',
      tldr: 'Taipei · Jiufen · Taroko Gorge · Tainan + south',
      weather: { hi: 18, lo: 13, label: 'Cool north, mild south, 18°/13°', emoji: '🏮', rainyDays: 14 },
      photos: ['taipei 101 night', 'jiufen old street', 'taroko gorge marble', 'taiwan night market'],
      places: [
        { name: 'Taipei', days: 5, query: 'Da\'an District, Taipei',
          highlights: ['Da\'an specialty coffee + bookshops','Jiufen — weekday dusk only (arrive ~15:00, stay past 18:30 lanterns)','Shilin + Raohe + Ningxia night markets (street stalls, skip Shilin basement)','Elephant Mountain sunset (fair-weather card)','National Palace Museum — full day (compare with Beijing collections seen in December)'] },
        { name: 'Hualien + Taroko Gorge', days: 2, query: 'Taroko Gorge, Taiwan',
          highlights: ['Train along Pacific coast — one of Asia\'s great rail journeys','Marble canyon viewpoints + visitor center (check park status ~Jan 4 — front-country trails still closed post-2024 quake)','Qingshui Cliffs — Pacific walls dropping into the ocean','Plan B: Qixingtan Beach + Liyu Lake + Highway 11 coast drive south'] },
        { name: 'Tainan + south', days: 7, query: 'Tainan, Taiwan',
          highlights: ['Tainan temples, food streets, night markets — Guohua/Shennong grazed slowly','Anping old fort + treehouse + Sicao mangrove boat','Kaohsiung Pier2/Cijin day + Ruifeng night market (Thu–Sun: Jan 21–24 ✓)','HSR Tainan → Taoyuan + MRT Jan 25 — fly Taipei → Osaka Jan 25'] },
      ],
    },
    {
      id: 'japan', kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan',
      start: '2027-01-25', end: '2027-02-24', days: 30,
      theme: 'Empty temples + early plum, then a post-CNY powder week',
      intro: 'One fused winter chapter (30 days max): Kyoto first for empty temples and early plum blossoms, Osaka as the bridge, Tokyo absorbing the CNY week (Feb 5–12), then Hakuba Feb 14–23 — post-CNY crowds gone, February base at its deepest.',
      tldr: 'Kyoto · Osaka · Tokyo (CNY) · Hakuba Valley powder week',
      weather: { hi: 9, lo: -1, label: 'Crisp cities, peak powder, 9°/-1°', emoji: '🏂', rainyDays: 8 },
      photos: ['fushimi inari', 'osaka dotonbori', 'tokyo shimokitazawa', 'hakuba snowboarding', 'japan onsen snow'],
      places: [
        { name: 'Kyoto', days: 8, query: 'Kitano Tenmangu, Kyoto',
          highlights: ['Empty winter temples — Fushimi Inari at dawn, no crowds','Early plum blossoms at Kitano Tenmangu (late Jan on)','Arashiyama bamboo grove + Tenryu-ji','Philosopher\'s Path in winter quiet','Nishiki Market','Temporary-life chapter: recurring café, structured mornings'] },
        { name: 'Osaka', days: 4, query: 'Dotonbori, Osaka',
          highlights: ['Winter crab season in Dotonbori','Kuromon Ichiba Market','Osaka Castle grounds','Nara day trip — deer, Todai-ji','Train to Tokyo Feb 6'] },
        { name: 'Tokyo', days: 8, query: 'Shimokitazawa, Tokyo',
          highlights: ['Shimokitazawa vintage shops + live music','Yanaka old-Tokyo lanes','Museums + neighborhoods through the CNY week (big city absorbs crowds)','Tsukiji outer market breakfast','Kamakura/Enoshima day trip','Travel to Hakuba Feb 14'] },
        { name: 'Hakuba Valley', days: 9, query: 'Hakuba, Japan',
          highlights: ['Feb 14–23: post-CNY, deep February base, thin crowds','Rent ALL equipment + outerwear locally (boots, board, jacket, helmet)','7 snowboard days across Happo-one, Goryu, Cortina','2 onsen rest days + mountain restaurants','Izakaya nights, ramen, star-filled mountain sky'] },
        { name: 'Departure', days: 1, query: 'Tokyo Station, Japan',
          highlights: ['Bus/train Hakuba → Tokyo','Fly Tokyo → Jakarta Feb 24 — Indonesia begins (direct, 30-day free entry)'] },
      ],
    },
    {
      id: 'indonesia-a', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-02-24', end: '2027-03-20', days: 25,
      theme: 'Java temples in Ramadan calm, Bali staging, then the best diving on Earth',
      intro: 'Fly in from Tokyo Feb 24 on the 30-day free entry (exit Mar 21, ~26 days used). Ramadan-quiet Java — Borobudur without crowds, night markets after dark — then a Nyepi silent day in Ubud and a domestic hop to Sorong Mar 10. Board Mar 11 with zero international stress.',
      tldr: 'Jakarta · Yogyakarta · Ubud · Raja Ampat liveaboard',
      weather: { hi: 32, lo: 25, label: 'Wet-tail Java/Bali → Raja mid-season, 32°/25°', emoji: '🐠', rainyDays: 6 },
      photos: ['raja ampat aerial wayag', 'manta ray cleaning station', 'bali ubud rice terrace'],
      places: [
        { name: 'Jakarta', days: 2, query: 'Jakarta, Indonesia',
          highlights: ['Feb 24: land CGK from Tokyo direct — 30-day free entry starts (exit Mar 21)','Monas + Kota Tua old town, Ramadan-evening food markets','Executive train or 1h flight onward to Yogyakarta'] },
        { name: 'Yogyakarta', days: 4, query: 'Borobudur, Yogyakarta',
          highlights: ['Borobudur sunrise — Ramadan-quiet, book 2+ weeks ahead','Prambanan + Kraton + Malioboro','Kampung Ramadan night market after dark','Daytime food via malls/hotels (warungs curtained); earplugs for 3am sahur drums','Fly JOG → DPS by Mar 2 (pre-mudik)'] },
        { name: 'Ubud', days: 8, query: 'Ubud, Bali',
          highlights: ['Mar 2–9: slow staging before the liveaboard','Tegallalang rice terraces at dawn, Tirta Empul water temple','Cooking class + Monkey Forest, massages — no agenda','Mar 8: Nyepi silent day — hotel-only rest day','Gear check; Mar 10: fly DPS → Sorong via Makassar (book 6–8 wks ahead)'] },
        { name: 'Transfer to Sorong', days: 1, query: 'Sorong, West Papua',
          highlights: ['Mar 10: DPS → SOQ domestic via UPG — already in-country, no immigration stress','Buffer night in Sorong before the Mar 11 boarding'] },
        { name: 'Raja Ampat Liveaboard', days: 10, query: 'Wayag, Raja Ampat',
          highlights: ['Mar 11–20: Wayag — postcard karst islands, kayak + hike viewpoint','Cape Kri — world record fish count dive site','Manta Sandy — manta ray cleaning station','Melissa\'s Garden — pristine hard coral','Pianemo — smaller Wayag, equally dramatic, fewer boats','Blue Water Mantas — oceanic, 6m wingspan','Wobbegongs, walking sharks, pygmy seahorses, nudibranchs','Book Papua Diving / Meridian Adventure — Mar 11–20 (reconfirm!)'] },
      ],
      diving: { sites: 30, type: 'Liveaboard', operators: 'Papua Diving / Meridian Adventure (Raja)' },
      booking: ['Raja Ampat liveaboard — Mar 11–20 (reconfirm!)','Java trains + Borobudur sunrise — book 60+/14+ days ahead (mudik)','DPS→SOQ Mar 10 — book 6–8 weeks ahead (Lebaran surge)','Exit Mar 21 SOQ→BKI — Entry 1 uses ~26 of 30 days'],
    },
    {
      id: 'borneo', kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysia',
      start: '2027-03-21', end: '2027-03-31', days: 10,
      theme: 'Indonesia visa reset + wildlife chapter',
      intro: 'Fly in from Sorong Mar 21 — reef→rainforest novelty switch right after the apex, and the exit resets Indonesia\'s clock for the second stay. Proboscis monkeys, pygmy elephants bathing at dawn. Late March sits in the Mar–May prime wildlife window.',
      tldr: 'KK · Sepilok · Kinabatangan River · Manila next',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧', rainyDays: 6 },
      photos: ['borneo orangutan', 'kinabatangan river', 'proboscis monkey', 'sepilok'],
      places: [
        { name: 'Kota Kinabalu', days: 2, query: 'Kota Kinabalu, Sabah',
          highlights: ['Mar 21: arrive from Sorong (via UPG/CGK), waterfront sunset, rest','Filipino Night Market','Post-liveaboard slow days'] },
        { name: 'Sepilok + Sandakan', days: 1, query: 'Sepilok Orangutan Centre',
          highlights: ['Sepilok Orangutan Rehabilitation Centre — morning feeding platform','Bornean Sun Bear Conservation Centre (adjacent)','Transfer same day to Kinabatangan'] },
        { name: 'Kinabatangan River', days: 5, query: 'Kinabatangan River, Sabah',
          highlights: ['Proboscis monkeys — endemic to Borneo, bizarre bulbous noses','Pygmy elephants bathing in the river at dawn — unmissable','Hornbills, kingfishers, monitor lizards, crocodiles','Fireflies illuminating the riverbank at night','Jungle lodges — wake to gibbons calling','Mar 26 Good Friday is a Sabah holiday — lodges operate; KK↔SDK flights booked early'] },
        { name: 'Kota Kinabalu', days: 2, query: 'Tunku Abdul Rahman Park, Kota Kinabalu',
          highlights: ['Tunku Abdul Rahman Marine Park snorkel day trip','Waterfront goodbye meal — fresh seafood','Fly BKI → Manila Mar 31 (via KUL) — Philippines next'] },
      ],
      booking: ['Kinabatangan river lodge — book 2–3 months ahead; Sipadan permits by Nov 2026 if adding 3 extra days'],
    },
    {
      id: 'philippines', kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-03-31', end: '2027-04-14', days: 15,
      theme: 'Post-Easter Palawan: wrecks at peak vis, glassy lagoons, sardines',
      intro: 'Arrive from Borneo Mar 31 into the post-Holy Week lull — the single best Palawan window: flat seas, 20m+ visibility, crowds gone. Coron wrecks first (nitrogen-correct), El Nido lagoons, Moalboal sardines, then hop to Bali Apr 14. Fifteen days inside the 30-day visa-free.',
      tldr: 'Manila · Coron · El Nido · Cebu/Moalboal (post-Easter)',
      weather: { hi: 33, lo: 25, label: 'Hot dry peak, 33°/25°', emoji: '🏝️', rainyDays: 1 },
      photos: ['el nido lagoon', 'coron kayangan lake', 'moalboal sardine run', 'intramuros manila'],
      places: [
        { name: 'Manila', days: 2, query: 'Intramuros, Manila',
          highlights: ['Mar 31–Apr 2: arrive from Kota Kinabalu, rest, dive-gear prep','Intramuros — walled Spanish colonial city','Fly Manila → Coron (Busuanga)'] },
        { name: 'Coron', days: 5, query: 'Coron, Palawan, Philippines',
          highlights: ['Japanese WWII wrecks — Okikawa Maru, Irako, Akitsushima (sunk 1944)','Day 1 check-dive first, deep wrecks after','Kayangan Lake — crystal-clear inland lake framed by karst','Barracuda Lake — thermocline diving (hot/cold layers)','CYC Beach + Twin Lagoon by banca boat'] },
        { name: 'El Nido', days: 4, query: 'El Nido, Palawan',
          highlights: ['Island-hopping: Big + Small Lagoons, Cadlao Island','Second lagoon day — glassy-seas bonus + weather buffer','Nacpan Beach — empty twin beach','Limestone cliffs, turquoise shallows, snorkeling'] },
        { name: 'Cebu / Moalboal', days: 2, query: 'Moalboal, Cebu, Philippines',
          highlights: ['Sardine Run — millions of sardines schooling at Pescador Island (accessible from shore)','Turtle Beach — sea turtles feeding right off the beach','Malapascua thresher dropped — Raja already delivered the apex','Kawasan Falls canyoneering (if time)'] },
        { name: 'Transfer to Bali', days: 2, query: 'Ngurah Rai Airport, Bali',
          highlights: ['Apr 14: CEB → DPS via MNL/SIN (daily, easy)','Indonesia Entry 2 starts ~Apr 14 — onward ticket to Singapore May 1 in hand'] },
      ],
      diving: { sites: 14, type: 'Day boats + shore dives', operators: 'Coron: multiple wreck operators; Moalboal: OceanBay / Savedra' },
      booking: [],
    },
    {
      id: 'indonesia-b', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-04-14', end: '2027-04-30', days: 17,
      theme: 'Cliffs, dragons, drift dives, volcano — second stay',
      intro: 'Second stay (17 days — fresh visa-free entry from Apr 14, no extension needed). Pick up where Raja left off: Nusa Penida mantas, Komodo dragons and drift dives, then Bali rice terraces and a volcano at 3am before the hop to Singapore May 1.',
      tldr: 'Nusa Penida · Komodo · Batur',
      weather: { hi: 32, lo: 24, label: 'Dry season building, 32°/24°', emoji: '🐉', rainyDays: 4 },
      photos: ['kelingking beach trex', 'padar island viewpoint', 'komodo dragon', 'mount batur sunrise'],
      places: [
        { name: 'Nusa Penida', days: 4, query: 'Kelingking Beach, Nusa Penida',
          highlights: ['Apr 14: land DPS from Cebu (Entry 2 starts); fast boat Sanur → Penida Apr 15','Kelingking Beach — T-Rex cliff, most photographed in the Bali region','Angel\'s Billabong + Broken Beach — natural infinity pool carved into clifftop','Crystal Bay — reef mantas year-round (early morning dive)','Atuh Beach — remote east coast, dramatic rock formations','Scooter rental for full freedom'] },
        { name: 'Komodo', days: 7, query: 'Komodo National Park',
          highlights: ['Apr 18: fly Bali → Labuan Bajo — dramatic harbor, wooden phinisi boats','Manta Point — oceanic mantas in strong current','Crystal Rock + Castle Rock — world-class drift dives','Pink Beach — crushed red coral, excellent snorkeling','Batu Bolong — coral so dense no bare rock visible','Komodo dragons with ranger at Rinca or Komodo Island','Padar Island sunrise hike — three colored bays stretching below'] },
        { name: 'Bali + Volcano', days: 6, query: 'Ubud, Bali',
          highlights: ['Apr 25: fly Labuan Bajo → Bali','Tanah Lot sunset temple on a sea rock','Seminyak / Canggu beach club final evening','Balinese cooking class','Mount Batur: 3am departure, 2h hike to crater rim at 1,717m','Sunrise over the caldera and crater lake — fly Bali → Singapore May 1 ✓'] },
      ],
      diving: { sites: 12, type: 'Day boats', operators: 'Crystal Bay Dive (Penida); Labuan Bajo operators (Komodo)' },
      booking: [],
    },
    {
      id: 'singapore', kind: 'chapter', region: 'isthmus',
      country: 'Singapore', flag: '🇸🇬', title: 'Singapore',
      start: '2027-05-01', end: '2027-05-06', days: 5,
      theme: 'World-class food, modern wonder, city recharge',
      intro: 'Effective recharge hub: clean, organized, excellent food infrastructure, everything works.',
      tldr: 'Hawker centres · Gardens by the Bay · Marina Bay',
      weather: { hi: 31, lo: 25, label: 'Hot + humid', emoji: '🌳', rainyDays: 4 },
      photos: ['gardens by the bay supertree', 'marina bay sands night', 'singapore hawker food', 'changi airport waterfall'],
      places: [
        { name: 'Singapore', days: 7, query: 'Marina Bay, Singapore',
          highlights: ['Maxwell, Lau Pa Sat, Old Airport Road hawker centres — best in the world','Gardens by the Bay — Supertree Grove at night','Marina Bay Sands observation deck','Chinatown, Little India, Haji Lane','National Gallery Singapore','Changi Airport waterfall walk (best airport in the world)'] },
      ],
    },
    {
      id: 'malaysia', kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysia',
      start: '2027-05-06', end: '2027-05-16', days: 10,
      theme: 'Urban intensity, street food capital, colonial slow life',
      intro: 'KL for the city spectacle and food, Penang for the most rewarding slow chapter in mainland SE Asia. Georgetown is UNESCO, effortlessly liveable, and the hawker food is unsurpassed.',
      tldr: 'Petronas · Batu Caves · Georgetown · Gurney Drive hawker',
      weather: { hi: 33, lo: 24, label: 'Warm + humid', emoji: '☕', rainyDays: 6 },
      photos: ['petronas towers night', 'batu caves rainbow steps', 'penang street art', 'penang hawker'],
      places: [
        { name: 'Kuala Lumpur', days: 4, query: 'Petronas Twin Towers, KL',
          highlights: ['Petronas Twin Towers at night — best view from KLCC park reflection pool','Batu Caves — rainbow steps, macaques, Hindu temple inside limestone cave','Jalan Alor Night Food Street','Bukit Bintang neighborhood','Train north to Penang (ETS / KTM — scenic coastal rail)'] },
        { name: 'Penang', days: 6, query: 'Armenian Street, Georgetown',
          highlights: ['Armenian Street — Zacharevic murals, shophouse architecture, UNESCO','Gurney Drive hawker — char kway teow, asam laksa, cendol — the real versions','Clan Jetties — Chinese stilt villages over the water','Penang Hill funicular','Kek Lok Si Temple, Blue Mansion (Cheong Fatt Tze)','Temporary-life chapter: find a recurring breakfast spot, walk the same route each morning'] },
      ],
    },
    {
      id: 'thailand', kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Thailand',
      start: '2027-05-16', end: '2027-05-30', days: 14,
      theme: 'Islands, reef diving, urban intensity, street food',
      intro: 'Gulf coast dry season — clear water, calm seas, 30°C in the islands. Then Bangkok: temples, canal boats, and the best street food city on Earth.',
      tldr: 'Koh Tao · Koh Samui · Bangkok',
      weather: { hi: 36, lo: 25, label: 'Dry Gulf coast → hot city', emoji: '🛺', rainyDays: 7 },
      photos: ['koh tao diving', 'koh samui beach', 'bangkok wat arun', 'bangkok street food'],
      places: [
        { name: 'Koh Tao', days: 6, query: 'Koh Tao, Thailand',
          highlights: ['One of the best value diving destinations on Earth','Japanese Gardens, Chumphon Pinnacle','Sail Rock — whale shark territory (extra day = weather buffer)','Hammock, reef, lunch, repeat'] },
        { name: 'Koh Samui', days: 1, query: 'Chaweng Beach, Koh Samui',
          highlights: ['Transit night only — sleep near the ferry pier','Ferry to Surat Thani → bus/flight to Bangkok'] },
        { name: 'Bangkok', days: 7, query: 'Wat Pho, Bangkok',
          highlights: ['Wat Pho — reclining Buddha + massage school','Grand Palace + Wat Phra Kaew','Khlong canal boat commute through the city','Chatuchak Weekend Market (Sat–Sun)','Yaowarat (Chinatown) at night','Kanchanaburi day trip — Erawan Falls, Death Railway, River Kwai','Fly Bangkok → Xi\'an May 30 (Spring red-eye / Sunday DMK options)'] },
      ],
      diving: { sites: 8, type: 'Day boats', operators: 'Several solid shops on Koh Tao' },
    },
    {
      id: 'china-spring', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2027-05-30', end: '2027-06-17', days: 19,
      theme: 'Ancient capital in perfect weather, then karst + old towns finale',
      intro: 'Nineteen days: Xi\'an in late-May perfection, then the southern karst at its greenest — including Zhangjiajie at peak season, when the pillars float above seas of cloud. Mist in the karst, mirror terraces, and lantern light to close the trip.',
      tldr: 'Xi\'an · Guilin · Longji · Zhangjiajie · Fenghuang · Furong',
      weather: { hi: 28, lo: 18, label: 'Early summer, 28°/18°', emoji: '🐉', rainyDays: 8 },
      photos: ['xian terracotta warriors', 'guilin karst li river', 'zhangjiajie avatar pillars'],
      places: [
        { name: 'Xi\'an', days: 4, query: 'Terracotta Warriors, Xi\'an',
          highlights: ['Arrive Bangkok → Xi\'an May 30 (red-eye) — tired day: walls + Muslim Quarter only','Terracotta Warriors — indoor museum, from Jun 1 onward','Cycle the Xi\'an city walls in perfect weather','Muslim Quarter — lamb skewers, biangbiang noodles, pomegranate juice','Giant Wild Goose Pagoda','Huashan day-trip option — iron chains and 2,000m drops','Fly Xi\'an → Guilin Jun 3'] },
        { name: 'Guilin / Yangshuo', days: 4, query: 'Yangshuo, China',
          highlights: ['Li River karst — mist between limestone towers at dawn','Bamboo raft on the Li River','Cycling through rice paddies and karst peaks','22–26°C, green and misty — best season'] },
        { name: 'Longji Terraces', days: 2, query: 'Longji Rice Terraces, China',
          highlights: ['Dragon\'s Backbone terraces flooded in June — mirror season','Ping\'an + Dazhai viewpoints at sunrise','Zhuang minority villages overnight'] },
        { name: 'Zhangjiajie + Tianmen', days: 4, query: 'Zhangjiajie National Park',
          highlights: ['Avatar Mountains — floating sandstone pillars in peak-season sea of clouds','Tianmen Stairway to Heaven (999 steps)','Glass Bridge + Glass Cliff Walk','Green valleys between the pillars','Travel to Fenghuang Jun 13 (Furong en route)'] },
        { name: 'Fenghuang + Furong', days: 3, query: 'Fenghuang Ancient Town, China',
          highlights: ['Furong waterfall town — river pouring through the town center, Tujia stilt houses','Fenghuang riverside old town — lanterns over the Tuo River','Hong Bridge + diaojiaolou houses at dusk','Slow final full days'] },
        { name: 'Buffer', days: 2, query: 'Changsha, China',
          highlights: ['Travel to Changsha','Fly home Jun 17, 2027 ✓'] },
      ],
    },
  ];

  // Compute total chapter count for headers
  const chapterCount = chapters.filter(c => c.kind === 'chapter').length;

  // Bookings (flat list pulled from chapters + a few overall).
  // done: true → already confirmed (rendered pre-checked; can't be lost to a
  // localStorage wipe because it lives in the data).
  const bookings = [
    // ── Pending — Türkiye, by urgency ──
    { task: 'India e-Visa',                             by: 'By mid-Sep 2026',       critical: false, notes: 'Before the Oct 14 flight to Delhi via Baku' },
    { task: 'Close-to-date: Kleftiko boat', by: 'On the road, 1–2 days ahead', critical: false, notes: 'Boat tour is weather-dependent — book short' },
    // ── Pending — rest of the trip ──
    { task: 'Raja Ampat liveaboard',     by: 'By Oct 2025', critical: true,  notes: 'Papua Diving / Meridian Adventure — Mar 11–20 (MOVED — reconfirm!); books out 6+ months ahead' },
    { task: 'Sipadan permits',           by: 'By Nov 2026', critical: true,  notes: '120 permits/day cap — if adding Sipadan to Borneo chapter' },
    { task: 'Flights Nov–Jan + China domestic hops', by: 'By Sep 2026', critical: true, notes: 'KTM→PEK Nov 9 · SHA/PVG→SZX Nov 26 · SZX→CAN HSR Nov 30 · CAN→HK HSR Dec 2 · HKG→CTU Dec 7 · CKG→PVG Dec 17 (morning) · PVG→ICN Dec 24 (+ICN→PUS hop) · ICN→TPE Jan 11 · TPE→KIX Jan 25 · domestic HSR: PEK→XIY, CTU→CKG' },
    { task: 'Taiwan visitor visa (2 pax)', by: 'File TECO Hong Kong Dec 3', critical: true, notes: 'Morning errand, pickup Dec 4–5; request 30d grant for Jan 11–25 stay; fallback Seoul filing; do not ticket ICN→TPE until answered' },
    { task: 'Korea K-ETA (2 pax)', by: 'By mid-Dec 2026', critical: true, notes: 'File online from Shanghai ≥1 week before Dec 24; Brazil visa-free but not K-ETA-exempt' },
    { task: 'Annapurna trek balance + briefing', by: 'Oct 24 at DWT office, Thamel', critical: true, notes: 'Pay $1,296 balance, gear check, meet guide/porter; ACAP/TIMS via agency — confirm; 9kg pp porter limit' },
    { task: 'Kinabatangan river lodge',  by: 'By Feb 2027', critical: false, notes: 'Book 2–3 months ahead; good lodges fill in dry season' },
    // ── Confirmed — Greece 100% ✅ ──
    { task: 'Greece stays — all 7 booked',  by: 'Done ✅', critical: false, done: true, notes: 'Athens 1–5 · Chania 5–9 · Rethymno 9–12 · Santorini 12–14 · Folegandros 14–16 · Milos 16–20 (checkout adjusted 22→20) · Athens buffer 20–21' },
    { task: 'Greece ferries — all 4 bought', by: 'Done ✅', critical: false, done: true, notes: 'Rethymno→Santorini Sep 12 · Santorini→Folegandros Sep 14 · Folegandros→Milos Sep 16 · Milos→Athens Sep 20' },
    { task: 'Flights: Athens→Chania + Athens→Cappadocia', by: 'Done ✅', critical: false, done: true, notes: 'Sep 5 06h45 to Chania · Sep 21 to Cappadocia via IST, single Turkish ticket' },
    // ── Confirmed — Türkiye + Baku + DEL ✅ ──
    { task: 'Cappadocia balloon — Sep 22 or 23', by: 'Done ✅', critical: false, done: true, notes: 'Royal Balloon / Butterfly Balloons — booked' },
    { task: 'Flights until DEL — recheck', by: 'Done except ADB→IST', critical: true, done: false, notes: 'ASR→ADB Sep 24 22:50 bought ✅ · ADB→IST Oct 2, 19:45, TO BUY · IST→GYD Oct 12 · GYD→DEL Oct 14' },
    { task: 'Türkiye stays until Izmir — rebook new dates', by: 'ASAP', critical: true, done: false, notes: 'Göreme Sep 21–24 booked ✅ · Alaçatı Sep 25–26 · Şirince Sep 27 · Kaş Sep 28–30 · Akyaka Oct 1' },
    { task: 'Crete car in Chania — rented', by: 'Done ✅', critical: false, done: true, notes: 'Chania base — Balos, Elafonisi, Therisos Gorge, Falasarna' },
  ];

  // Diving log
  const diving = [
    { where: 'Coron — WWII Wrecks',      dates: 'Apr 4–8',      days: 5, notes: 'Japanese warships sunk 1944 — post-Easter peak visibility' },
    { where: 'El Nido lagoons',          dates: 'Apr 8–12',     days: 4, notes: 'Glassy-seas bonus day in peak season' },
    { where: 'Cebu / Moalboal',          dates: 'Apr 12–14',    days: 2, notes: 'Sardine run at Pescador, thresher sharks at Malapascua (dropped)' },
    { where: 'Raja Ampat',               dates: 'Mar 11–20',    days: 10, notes: 'Mid-season liveaboard — book by Oct 2025' },
    { where: 'Nusa Penida — Crystal Bay',dates: 'Apr 15–18',    days: 4, notes: 'Reef mantas year-round' },
    { where: 'Komodo',                   dates: 'Apr 18–25',    days: 7, notes: 'Manta Point + drift dives, dry season building' },
    { where: 'Koh Tao',                  dates: 'May 16–21',    days: 5, notes: 'Value diving, Sail Rock weather buffer (+1 day)' },
    { where: 'Sipadan (optional)',       dates: 'Mar 24–27',    days: 3, notes: '120 permits/day — book by Nov 2026' },
  ];

  // Budget — full-trip model, USD for two travelers (couple).
  // Per-chapter parts are researched estimates (see notes); the three locked
  // costs came from actual bookings/quotes. Totals are COMPUTED in the UI
  // (BudgetView) from these parts — never hardcoded — so edits stay consistent.
  const budget = {
    currency: 'USD',
    basis: 'couple · 361 days · mid-range with strategic splurges',
    fxBRL: 5.2,
    estimate: 'USD ~97k for two',
    perDay: '~USD 269/day for two',
    inBRL: '~R$252k per person at R$5.20',
    contingencyPct: 8,
    // Confirmed figures — do not re-estimate.
    locked: [
      { item: 'GRU–YYZ–ATH flights (2 pax)', cost: 1700, note: 'Bought ✅ — long-haul positioning into the trip' },
      { item: 'Raja Ampat liveaboard 10d (2 pax)', cost: 8400, note: 'Quoted/held — the trip splurge' },
      { item: 'Annapurna Base Camp trek, Discovery World (2 pax)', cost: 1440, note: 'Booked ✅ — $720pp ($144 advance paid, $1,296 balance due Oct 24); guide + porter + teahouses + meals on trail' },
      { item: 'Cumbuco Airbnb, 1 month', cost: 1900, note: 'Actual — paid' },
      { item: 'Greece ferries, 4 legs (2 pax)', cost: 770, note: 'Booked ✅ — €685 actual' },
      { item: 'Petrópolis–Teresópolis trail (2 pax)', cost: 770, note: 'Actual — R$4,000' },
      { item: 'Diving certs AOW + Nitrox (2 pax)', cost: 960, note: 'Actual — R$5,000' },
      { item: 'Rio Airbnb, Jun 21–Jul 19', cost: 1350, note: 'Actual — R$7,000' },
      { item: 'São Paulo Airbnb, Aug 19–26', cost: 270, note: 'Actual — R$1,400' },
    ],
    // Per-chapter estimates for two. lodging/food are chapter totals; transport
    // is in-chapter only (inter-chapter flights live in `flights` below).
    chapters: [
      { id: 'brasil', days: 66, lodging: 3520, food: 3150, transport: 1350, activities: 1930, fees: 0, note: 'Rio Airbnb R$7,000 + Cumbuco $1,900/mo + SP R$1,400 actual · trail + certs actual · internal flights Rio→Fortaleza + Fortaleza→SP ~$750' },
      { id: 'toronto', days: 5, lodging: 0, food: 450, transport: 150, activities: 50, fees: 0, note: "Friend's place · TTC + Islands ferry · mostly home meals" },
      { id: 'athens', days: 20, lodging: 1700, food: 1700, transport: 1230, activities: 570, fees: 0, note: 'Booked stays avg ~$85/n · 4 ferries €685 actual (~$770) · Chania car ~$240 · Kleftiko ~$260' },
      { id: 'turkey', days: 21, lodging: 1865, food: 1470, transport: 790, activities: 780, fees: 120, note: 'Göreme 3n + Alaçatı 3n + Şirince/Kaş/Akyaka + Istanbul 10n · balloon ~$480 · car 8d ~$450 · e-visa' },
      { id: 'baku', days: 2, lodging: 0, food: 140, transport: 60, activities: 30, fees: 50, note: 'Stopover program — lodging free · ASAN e-visa · walkable old city' },
      { id: 'india', days: 7, lodging: 315, food: 315, transport: 190, activities: 120, fees: 55, note: 'Agra day trip Oct 15 · Varanasi train Oct 17 booked ✅ · VNS→KTM $343 booked ✅ · Taj + forts + boats' },
      { id: 'nepal', days: 19, lodging: 290, food: 290, transport: 100, activities: 1440, fees: 100, note: 'Trek $1,440 locked w/ Discovery World ($720pp; $144 paid, $1,296 due Oct 24) · KTM 8n (pre + recovery) · no positioning flight · tips/visa cash' },
      { id: 'china-e1', days: 22, lodging: 1850, food: 1450, transport: 900, activities: 450, fees: 0, note: 'Beijing 5n + Xi\'an 3n + Huangshan 3n + HGH 2n + SUZ 3n + Shenzhen friends 4n + CAN 2n · HSR + XIY→HGH + PVG→SZX hops' },
      { id: 'hk', days: 5, lodging: 750, food: 450, transport: 120, activities: 0, fees: 0, note: '~$150/n · Peak tram + ferries + Lamma · TECO filing Dec 3 · free gardens/markets' },
      { id: 'china-e2', days: 17, lodging: 1270, food: 1100, transport: 550, activities: 450, fees: 0, note: 'Chengdu 6n + CQ 2n + Wulong 2d/1n + Shanghai 5n · CTU→CKG HSR + Wulong trains + CKG→PVG ~$240 · Sanxingdui + karst tickets' },
      { id: 'korea', days: 18, lodging: 2250, food: 1260, transport: 450, activities: 250, fees: 0, note: '~$125/n · Busan Xmas + NYE Seoul · DMZ tour · ICN→PUS hop' },
      { id: 'taiwan', days: 14, lodging: 1330, food: 840, transport: 280, activities: 120, fees: 0, note: '~$95/n · Hualien rails · south slow days · January tilt' },
      { id: 'japan', days: 30, lodging: 3900, food: 2850, transport: 800, activities: 1800, fees: 0, note: 'Cities 21n ~$125/n · Hakuba 9n · lift 7d + full rental · Tokyo–Hakuba buses' },
      { id: 'indonesia-a', days: 25, lodging: 850, food: 500, transport: 550, activities: 8600, fees: 0, note: 'Liveaboard $8,400 locked · JKT→JOG→DPS hops ~$260 + DPS→SOQ ~$250 · Ramadan Java + Nyepi Ubud staging · Entry 1 Feb 24–Mar 21 (26d)' },
      { id: 'borneo', days: 10, lodging: 1020, food: 200, transport: 520, activities: 60, fees: 0, note: 'Kinabatangan 3D2N ~$600 + 2 lodge nights (full board) · Sepilok fees · in from SOQ Mar 21, out BKI→MNL Mar 31' },
      { id: 'philippines', days: 15, lodging: 835, food: 740, transport: 450, activities: 1050, fees: 0, note: 'Manila 2n staging + gear prep · Coron 5d + El Nido 4d post-Easter peak vis · sardines (Malapascua dropped)' },
      { id: 'indonesia-b', days: 17, lodging: 760, food: 1120, transport: 450, activities: 1010, fees: 20, note: 'CEB→DPS in flights · Penida + Komodo dives Apr 15–25 · Batur · Bali levies · Entry 2 Apr 14–30 (17d)' },
      { id: 'singapore', days: 5, lodging: 700, food: 275, transport: 90, activities: 80, fees: 0, note: '~$140/n · hawker-first food · Gardens domes' },
      { id: 'malaysia', days: 10, lodging: 550, food: 400, transport: 170, activities: 60, fees: 0, note: 'KL 4n + Penang 6n guesthouses · SG→KL bus + ETS rail · Penang Hill + mansions' },
      { id: 'thailand', days: 14, lodging: 800, food: 700, transport: 450, activities: 650, fees: 0, note: 'Koh Tao 6d (+Sail Rock buffer) ~$450 · Samui transit night · PEN→Tao May 16 · Kanchanaburi' },
      { id: 'china-spring', days: 19, lodging: 1320, food: 1045, transport: 1030, activities: 400, fees: 0, note: 'BKK→XIY May 30 red-eye ~$400 + XIY→KWL ~$250 · Warriors + karst/pillars tickets · Changsha buffer 1d' },
    ],
    // Between-chapter flights for two (in-chapter transport stays above).
    // Every leg carries a `date` (departure day) so the calendar sync can
    // place flight blocks; totals are unchanged by leg splits.
    flights: [
      { route: 'São Paulo → Toronto', cost: 900, date: '2026-08-27', note: 'Bought ✅ (locked)' },
      { route: 'Toronto → Athens', cost: 800, date: '2026-08-31', note: 'Bought ✅ (locked), overnight, lands Sep 1' },
      { route: 'Athens → Cappadocia via IST', cost: 500, date: '2026-09-21', note: 'Bought ✅ (est.)' },
      { route: 'Istanbul → Baku', cost: 450, date: '2026-10-12', note: 'Bought ✅ (est.)' },
      { route: 'Baku → Delhi', cost: 550, date: '2026-10-14', note: 'Bought ✅ (est.)' },
      { route: 'Varanasi → Kathmandu (direct)', cost: 343, date: '2026-10-21', note: 'Bought ✅ ($343 for two), 08:30 direct' },
      { route: 'Kathmandu → Beijing (via Chengdu)', cost: 550, date: '2026-11-09', note: 'Estimate ~$275pp (Sichuan/Air China 1-stop); Entry 1 starts Nov 10' },
      { route: 'Hong Kong → Chengdu (direct)', cost: 350, date: '2026-12-07', note: 'Estimate — 5+ directs/day; Entry 2 starts' },
      { route: 'Shanghai → Seoul', cost: 350, date: '2026-12-24', note: 'Estimate — Christmas Eve premium risk, buy early' },
      { route: 'Seoul → Taipei', cost: 275, date: '2027-01-11', note: 'Estimate, LCC Monday' },
      { route: 'Taipei → Osaka', cost: 450, date: '2027-01-25', note: 'Estimate' },
      { route: 'Tokyo → Jakarta (direct)', cost: 500, date: '2027-02-24', note: 'Estimate — direct daily (ANA/JAL/Garuda), 30-day free entry starts' },
      { route: 'Denpasar → Sorong (via Makassar)', cost: 250, date: '2027-03-10', note: 'Estimate — domestic, book 6–8 wks ahead (Lebaran surge)' },
      { route: 'Sorong → Kota Kinabalu (via UPG/CGK)', cost: 400, date: '2027-03-21', note: 'Estimate — off-boat day' },
      { route: 'Kota Kinabalu → Manila (via KUL)', cost: 250, date: '2027-03-31', note: 'Estimate, AirAsia' },
      { route: 'Cebu → Denpasar (via MNL/SIN)', cost: 300, date: '2027-04-14', note: 'Estimate — daily, easy; Entry 2 starts' },
      { route: 'Bali → Singapore', cost: 200, date: '2027-05-01', note: 'Estimate, AirAsia' },
      { route: 'Changsha → São Paulo (home)', cost: 1400, date: '2027-06-17', note: 'Estimate ~$700pp' },
    ],
    extras: [
      { item: 'Health insurance, $150/mo × 12 months (couple)', cost: 1800, note: 'Covers the full trip, both travelers' },
      { item: 'eSIMs + trail/trek sundries', cost: 350, note: '~15 countries + thermals/laundry gaps' },
    ],
    assumptions: [
      'All figures USD for two; mid-range with strategic splurges, researched Oct 2026 prices',
      'China entries are 22 + 16 days (each inside the 25-day comfort limit, HK reset between, all pre-Dec-31-2026) — no visa needed; spring entry (May 30) needs one L visa (~$300 for two) unless the waiver renews',
      'Own kite gear in Cumbuco; mask + dive computer owned; snowboard kit rented in Hakuba',
      'Free stays: Toronto (friends) and Azerbaijan (stopover program) — lodging paid elsewhere',
      'Inter-chapter flights are one-way advance fares; peak-season spikes are what the 8% contingency is for',
    ],
    levers: [
      'Diving is ~$12k of the total — fewer Coron/Komodo/Tao dive days saves $1,500+ fast',
      'Japan + Korea are ~$13.5k combined — business hotels + konbini breakfasts already assumed; ryokan splurge kept to zero',
      'Shoulder-season flights (booked early) and slow-travel lodging (weekly rates) are the two biggest structural savers',
      'Toronto + Azerbaijan avoid lodging costs; monthly rates in Rio/Cumbuco beat nightly prices',
    ],
  };

  // Packing notes
  const packing = [
    { layer: 'Base kit', items: 'Carry-on + 30L backpack only throughout' },
    { layer: 'Japan winter', items: 'Light thermal base layers from Seoul. Rent ALL snowboard kit in Hakuba.' },
    { layer: 'Beijing Wall day (mid-Nov)', items: 'Windproof shell + insulated boots over down/fleece bought in Kathmandu Thamel (sub-zero wind chill); pick the bluest morning' },
    { layer: 'Wulong karst (Dec)', items: 'Non-slip waterproof shoes (walkways can ice); fog lifts ~10–11am; warm layers (canyon 4–8° below the city)' },
    { layer: 'Diving', items: 'Bring personal mask + computer. BCD/reg/wetsuit rented per site.' },
    { layer: 'Nusa Penida', items: 'Reef-safe sunscreen, rash guard, water shoes (rocky entry)' },
    { layer: 'Nepal trek', items: 'Rent trekking poles + sleeping bag liner in Kathmandu' },
  ];

  // Optimal travel windows per chapter — used by the consequence engine.
  // months: 1-indexed array of good months. If a chapter's start month falls
  // outside this range, a season warning is shown in the impact preview.
  const optimalWindows = {
    'brasil':       { months: [6, 7, 8],              note: 'Jun–Ago: inverno seco no Rio, pico do vento no Ceará, inverno ameno em SP' },
    'toronto':      { months: [7, 8, 9],              note: 'Jul–Sep: warm summer, patios open, Lake Ontario swimmable' },
    'athens':       { months: [5, 6, 9, 10],         note: 'May–Jun and Sep–Oct: ideal temps; Aug is peak heat + crowds' },
    'turkey':       { months: [9, 10],               note: 'Sep–Oct: post-summer, ideal weather, balloon season' },
    'baku':         { months: [10],                  note: 'Oct: mild Caspian autumn, good stopover weather' },
    'nepal':        { months: [10, 11],              note: 'Oct–Nov: post-monsoon, crystalline skies, best trekking' },
    'india':        { months: [10, 11, 12],          note: 'Oct–Dec: post-monsoon, clear skies, India circuit' },
    'taiwan':       { months: [1],              note: 'Jan: cool drizzly north, mild dry south, post-holiday calm' },
    'china-e1':    { months: [11, 12],           note: 'Nov–Dec: Beijing first, then south — canyon safe in Nov, gardens at peak, Shenzhen friends Nov 26–30' },
    'china-e2':     { months: [12],                note: 'Dec: Sichuan fire + Wulong winter-empty karst; trimmed 5n Shanghai slow finish' },
    'hk':           { months: [1, 2, 3, 10, 11, 12], note: 'Oct–Mar: cool dry season; mid-Dec pre-Christmas shoulder' },
    'korea':        { months: [12, 1],              note: 'Dec–Jan: festive Seoul, palace snow, KTX loop' },
    'japan':        { months: [1, 2],               note: 'Jan–Feb: empty Kyoto temples + early plum; Hakuba powder post-CNY' },
    'philippines':  { months: [3, 4],             note: 'Mar–Apr: post-Easter lull — flat seas, peak vis; hottest month' },
    'indonesia-a':   { months: [2, 3],                note: 'Feb–Mar: Java wet-tail + Ramadan calm; Raja mid-season; Bali staging' },
    'indonesia-b':   { months: [4],                   note: 'Apr: Penida mantas year-round; Komodo + Bali dry season building' },
    'borneo':       { months: [3, 4, 5, 6, 7, 8],   note: 'Mar–Aug: dry season, wildlife most active at rivers' },
    'singapore':    { months: [2, 3, 4, 5, 6, 7, 8], note: 'Feb–Aug: relatively drier, pleasant' },
    'malaysia':     { months: [1, 2, 3, 4, 5, 11, 12], note: 'Nov–May: KL and Penang drier side of the year' },
    'thailand':     { months: [4, 5, 6, 7, 8, 9],   note: 'Apr–Sep: dry Gulf coast (Koh Tao); Bangkok manageable in May' },
    'china-spring': { months: [5, 6],             note: 'May–Jun: Xi\'an in perfect weather; Zhangjiajie peak season; karst mist-green, Longji mirrors' },
  };

  // Hand-authored calendar highlights: key attractions + car rentals.
  // Synced by the calendar integration alongside chapters + flights.
  // `end` is the inclusive last day.
  const calendarEvents = [
    { id: 'abctrek', title: 'Annapurna Base Camp trek', start: '2026-10-25', end: '2026-11-04', note: '11-day teahouse trek: Nayapul → ABC (4,130m) → Jhinu hot springs' },
    { id: 'rajaampatdiving', title: 'Raja Ampat Diving (liveaboard)', start: '2027-03-11', end: '2027-03-20', note: '10 days on the water: Wayag, Cape Kri, Manta Sandy' },
    { id: 'chaniacar', title: '🚗 Rental car — Chania', start: '2026-09-05', end: '2026-09-09', note: 'Return 8:30am Sep 9' },
    { id: 'izmircar', title: '🚗 Rental car — Izmir (ADB)', start: '2026-09-25', end: '2026-10-02', note: 'Pickup ~1am Sep 25 · return Oct 2 before 16:45 flight' },
  ];

  return {
    start: START, end: END, totalDays,
    travelers: 2,
    chapterCount,
    chapters,
    bookings, diving, budget, packing,
    calendarEvents,
    REGIONS,
    optimalWindows,
    helpers: { dayCounter, mapsUrl, photoUrl, fmt, dayRange },
  };
})();
