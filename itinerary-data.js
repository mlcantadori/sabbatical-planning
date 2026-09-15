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
      start: '2026-10-14', end: '2026-10-20', days: 6,
      theme: 'Sacred intensity, iconic monuments, Himalayan slow life',
      intro: 'A tight, intentional India: land in Delhi Oct 14 from Baku, straight to the Taj with three unhurried days around Delhi and Agra, then Varanasi Oct 17–20 at full spiritual intensity before flying direct to Kathmandu on Oct 20.',
      tldr: 'Delhi · Agra · Varanasi (via Baku)',
      weather: { hi: 30, lo: 16, label: 'Post-monsoon clear, 30°/16°', emoji: '🌅', rainyDays: 1 },
      photos: ['taj mahal sunrise', 'varanasi ghats'],
      places: [
        { name: 'Delhi + Agra', days: 3, query: 'Taj Mahal, Agra',
          highlights: ['Land in Delhi Oct 14 from Baku (IST → GYD Oct 12 → DEL Oct 14)','Taj Mahal at sunrise — arrive 6am, before tour groups, in golden light','Agra Fort','Mehtab Bagh — sunset Taj view across the river','Old Delhi — Jama Masjid + Chandni Chowk food walk'] },
        { name: 'Varanasi', days: 3, query: 'Varanasi ghats, India',
          highlights: ['Arrive Oct 17 — Ghats at dawn: rowing on the Ganges in morning mist','Ganga Aarti at dusk — fire, flowers, bells, priests','Manikarnika cremation ghats','Sarnath — where Buddha first taught, 10km out','Chai, silk, wandering the narrow alleys','Oct 20: fly Varanasi → Kathmandu (direct, ~1h)'] },
      ],
      booking: [],
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
        { name: 'Kathmandu', days: 3, query: 'Kathmandu, Nepal',
          highlights: ['Boudhanath Stupa — one of the largest stupas on Earth','Pashupatinath Temple — sacred Hindu cremation ghats on the Bagmati','Swayambhunath (Monkey Temple)','Altitude acclimatization, gear check, ACAP + TIMS permits'] },
        { name: 'Pokhara', days: 1, query: 'Pokhara, Nepal',
          highlights: ['Phewa Lake calm before the trek — staging night','Annapurna range at dawn from the lakeside'] },
        { name: 'Annapurna Base Camp Trek', days: 11, query: 'Annapurna Base Camp, Nepal',
          highlights: ['Oct 25 – Nov 4: Nayapul → Ghandruk → Chhomrong → Bamboo','Deurali → Machhapuchhre Base Camp → ABC (4,130m)','Teahouse circuit — no camping gear needed','Rhododendron forests, glacial moraines, 360° Annapurna amphitheater','Return via Jhinu hot springs'] },
        { name: 'Pokhara recovery', days: 4, query: 'Phewa Lake, Pokhara',
          highlights: ['Nov 5–8: lakeside slow meals, massage, reflection','Optional paragliding over Phewa Lake (weather buffer built in)','Sārangkot sunrise over the Himalayas','Fly Pokhara → Taipei Nov 9'] },
      ],
      booking: ['ACAP permit + TIMS card — on arrival in Kathmandu'],
    },
    {
      id: 'taiwan', kind: 'chapter', region: 'northeast',
      country: 'Taiwan', flag: '🇹🇼', title: 'Taiwan',
      start: '2026-11-10', end: '2026-11-24', days: 14,
      theme: 'Post-typhoon island, north to south in the best window',
      intro: 'Mid-November is Taiwan at its finest: typhoon season over, Taipei at 23°, the south still summery. No NYE countdown this time (moved to Seoul) — instead the island as pure slow travel: coffee streets, the marble gorge, then south to the food capital.',
      tldr: 'Taipei · Jiufen · Taroko Gorge · Tainan + south',
      weather: { hi: 23, lo: 17, label: 'Post-typhoon best window, 23°/17°', emoji: '🏮', rainyDays: 4 },
      photos: ['taipei 101 night', 'jiufen old street', 'taroko gorge marble', 'taiwan night market'],
      places: [
        { name: 'Taipei', days: 5, query: 'Da\'an District, Taipei',
          highlights: ['Da\'an specialty coffee + bookshops','Jiufen — clifftop mining town, lantern-lit teahouses','Shilin Night Market','Elephant Mountain sunset hike over the skyline','National Palace Museum'] },
        { name: 'Hualien + Taroko Gorge', days: 2, query: 'Taroko Gorge, Taiwan',
          highlights: ['Train along Pacific coast — one of Asia\'s great rail journeys','Marble canyon viewpoints + visitor center (check park status ~1 week ahead — some front-country trails still closed post-2024 quake)','Qingshui Cliffs — Pacific walls dropping into the ocean','Plan B: Qixingtan Beach + Liyu Lake + Highway 11 coast drive south'] },
        { name: 'Tainan + south', days: 7, query: 'Tainan, Taiwan',
          highlights: ['Tainan temples, old streets, night markets — oyster omelettes and beef noodle soup','Anping old fort + treehouse','Kaohsiung harbor + Liuhe night market','Alishan day-trip option (or skip for slow days)','Return to Taipei — fly Taipei → Guangzhou Nov 24'] },
      ],
    },
    {
      id: 'china-e1a', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-11-24', end: '2026-12-02', days: 8,
      theme: 'Cantonese immersion + friends in Shenzhen',
      intro: 'First mainland entry (8 counted days — deep inside the 30-day visa-free limit). Fly in from Taipei to Guangzhou for a Cantonese food blitz with a Kaiping day trip, then four days alongside friends in Shenzhen before the 15-minute HSR slide into Hong Kong.',
      tldr: 'Guangzhou · Shenzhen (friends ✓)',
      weather: { hi: 21, lo: 13, label: 'Mild Pearl River Delta, 21°/13°', emoji: '🏙️', rainyDays: 2 },
      photos: ['shenzhen night skyline', 'guangzhou canton tower'],
      places: [
        { name: 'Guangzhou', days: 4, query: 'Shamian Island, Guangzhou',
          highlights: ['Cantonese food deep-dive — dim sum where it was born','Shamian Island colonial arcades','Chen Clan Academy — Lingnan craft at its finest','Canton Tower at night','Kaiping Diaolou day trip option (UNESCO watchtowers)','HSR Guangzhou → Shenzhen (~35min) Nov 28'] },
        { name: 'Shenzhen', days: 4, query: 'Shekou, Shenzhen',
          highlights: ['Four full days with friends (in town Nov 23 – Dec 2 ✓)','Huaqiangbei Electronics Market — world\'s largest, floors of components','OCT-LOFT Contemporary Art District','Dafen Oil Painting Village','Dapeng Peninsula coastal hike','Macau ferry day-trip option (egg tarts, historic centre)','HSR Shenzhen → Hong Kong Dec 2 (15 min, West Kowloon immigration)'] },
      ],
    },
    {
      id: 'hk', kind: 'chapter', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong',
      start: '2026-12-02', end: '2026-12-07', days: 5,
      theme: 'Neon city + dim sum + visa reset, priced before Christmas week',
      intro: 'Five early-December days: dry 20° air, early WinterFest lights, the cheapest hotel week of the season — and the 30-day visa clock resets for the Sichuan leg. A proper chapter, not transit.',
      tldr: 'Victoria Peak · Kowloon neon · Dim sum · Lamma Island',
      weather: { hi: 20, lo: 14, label: 'Pre-Christmas dry, 20°/14°', emoji: '🥟', rainyDays: 1 },
      photos: ['hong kong skyline', 'kowloon neon', 'hong kong dim sum'],
      places: [
        { name: 'Hong Kong', days: 5, query: 'Victoria Peak, Hong Kong',
          highlights: ['Victoria Peak — harbor panorama at dusk, city grid below','Star Ferry crossing: Kowloon → Central at night','Dim sum yum cha: Tim Ho Wan, Lin Heung, One Dim Sum','Temple Street Night Market — jade, fortune tellers, street food','Nan Lian Garden + Chi Lin Nunnery (free, stunning)','Lamma Island day trip: seafood lunch, car-free village walk','Rest, laundry, planning — fly HK → Chengdu Dec 7'] },
      ],
    },
    {
      id: 'china-e1b', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-12-07', end: '2026-12-20', days: 13,
      theme: 'Great Wall first, then Sichuan fire',
      intro: 'Second mainland entry (13 counted days — deep inside the limit, clock reset in Hong Kong). The most important sight goes first while winter light is crisp: an empty, possibly snow-dusted Great Wall. Then west for panda mornings and hotpot nights, closing in cyberpunk Chongqing before exiting via Shanghai to Seoul.',
      tldr: 'Beijing · Chengdu · Chongqing',
      weather: { hi: 8, lo: -4, label: 'Cold capital, mild Sichuan, 8°/−4°', emoji: '🧣', rainyDays: 2 },
      photos: ['great wall snow', 'chengdu panda', 'chongqing cyberpunk night'],
      places: [
        { name: 'Beijing', days: 5, query: 'Mutianyu Great Wall, Beijing',
          highlights: ['Fly HK → Beijing Dec 7','Great Wall (Mutianyu) — empty + snow-dusted, pick the bluest morning','Forbidden City in crisp winter light','Temple of Heaven','798 Art District','Hutong + Drum/Bell Towers','Peking duck','Summer Palace — ice on Kunming Lake','Down layers from Guangzhou Uniqlo','Fly Beijing → Chengdu Dec 12'] },
        { name: 'Chengdu', days: 4, query: 'Chengdu Panda Base',
          highlights: ['Giant panda base — crisp winter morning, active bears','Jinli Ancient Street, Kuanzhai Alley','Teahouses + mapo tofu, dan dan noodles','Leshan Giant Buddha day trip option','Hotpot round one — winter is the season','HSR Chengdu → Chongqing (~1h) Dec 16'] },
        { name: 'Chongqing', days: 3, query: 'Chongqing, China',
          highlights: ['The most cyberpunk city on Earth — 34M people, bridges everywhere','Hongyadong stilted riverfront lit at night','Cable car across the Yangtze River','Hotpot capital — mandatory multiple visits','Dazu rock carvings day trip if time allows','Travel to Shanghai Dec 19'] },
        { name: 'Departure', days: 1, query: 'Shanghai Pudong Airport',
          highlights: ['Fly Chongqing → Shanghai Dec 19','Overnight buffer before Korea','Fly Shanghai → Seoul Dec 20 — Korea begins'] },
      ],
    },
    {
      id: 'korea', kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2026-12-20', end: '2027-01-07', days: 18,
      theme: 'Christmas + NYE in Seoul, palace snow, winter food loop',
      intro: 'Eighteen festive days: land Dec 20 into Christmas markets and palace snow, loop the south by KTX, and close with the Bosingak New Year bell on Dec 31. Deep winter (−8°) carried by jjigae stews, pojangmacha tents, and Seoul at its most electric.',
      tldr: 'Seoul Christmas · Busan · Gyeongju · Jeonju · NYE Seoul',
      weather: { hi: 2, lo: -8, label: 'Festive deep winter, 2°/-8°', emoji: '❄️', rainyDays: 5 },
      photos: ['seoul palace winter', 'busan gamcheon', 'gyeongju temple', 'jeonju hanok', 'korean street food'],
      places: [
        { name: 'Seoul', days: 4, query: 'Gyeongbokgung, Seoul',
          highlights: ['Gyeongbokgung + Changdeokgung in snow-dusted winter light','Christmas markets in Myeongdong + Dongdaemun Design Plaza','Gwangjang Market — bindaetteok, mayak gimbap','Bukchon Hanok Village','KTX south to Busan Dec 24'] },
        { name: 'Busan', days: 3, query: 'Gamcheon Culture Village, Busan',
          highlights: ['Christmas Day by the sea — Gamcheon hillside in winter light','Jagalchi Fish Market — winter king crab season','Haedong Yonggungsa seaside temple','Gwangalli Bridge lit up at night','Train to Gyeongju Dec 27'] },
        { name: 'Gyeongju', days: 2, query: 'Bulguksa Temple, Gyeongju',
          highlights: ['Bulguksa (UNESCO) + Seokguram Grotto, crowd-free','Tumuli Park burial mounds in frost','Anapji Pond at dusk','Bus/train to Jeonju Dec 29'] },
        { name: 'Jeonju', days: 2, query: 'Jeonju Hanok Village',
          highlights: ['Bibimbap in a traditional courtyard — the origin city','800+ inhabited hanok houses','Makgeolli bars + traditional markets','KTX to Seoul Dec 31, midday — in position for midnight'] },
        { name: 'Seoul finale', days: 7, query: 'Myeongdong, Seoul',
          highlights: ['NYE Dec 31: Bosingak bell + citywide countdown ✓','DMZ day trip (check Jan holiday schedule)','Hongdae, Insadong, specialty coffee deep-dive','Final Korean meals — galbi, naengmyeon, soju','Buy Uniqlo thermals + windproof shell for Huangshan','Fly Seoul → Shanghai Jan 7'] },
      ],
    },
    {
      id: 'china-e2', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2027-01-07', end: '2027-01-25', days: 18,
      theme: 'Jiangnan winter: canals, gardens, snow pines',
      intro: 'Second mainland entry (18 counted days — again deep inside the limit, clock reset in Hong Kong). Skip the northern deep-freeze for the Lower Yangtze in winter: Shanghai as cosmopolitan base, Suzhou and Hangzhou gardens in frosty quiet, and Huangshan snow-dusted pines above a sea of clouds. All linked by bullet train, all temperate.',
      tldr: 'Shanghai · Huangshan · Hangzhou · Suzhou',
      weather: { hi: 8, lo: 1, label: 'Jiangnan winter, 8°/1°', emoji: '❄️', rainyDays: 5 },
      photos: ['shanghai bund night', 'shanghai french concession'],
      places: [
        { name: 'Shanghai', days: 6, query: 'The Bund, Shanghai',
          highlights: ['Fly in from Seoul Jan 7 — French Concession café season (pick heated modern hotels — no central heating in old lanes!)','The Bund — skyline across the Huangpu, best at night','Yu Garden — classical garden in winter quiet','Tianzifang arts + crafts alleys','Xintiandi, M50 art district','HSR Shanghai → Huangshan (~2.5h) Jan 13'] },
        { name: 'Huangshan', days: 3, query: 'Huangshan, Anhui',
          highlights: ['Yellow Mountain — snow-dusted pines + sea of clouds (January is prime rime season)','Bright Summit sunrise above the cloud sea','Lion Peak → Beihai → Cloud-Dispersing Pavilion loop (West Sea Canyon closed Dec–Mar)','Hot springs at the mountain foot','Windproof shell essential at the summit; cheap traction spikes in Tangkou if icy','Winter cable cars end ~16:30 — front-load days; book summit hotel ~3 days ahead','HSR Huangshan → Hangzhou Jan 16'] },
        { name: 'Hangzhou', days: 3, query: 'West Lake, Hangzhou',
          highlights: ['West Lake in winter mist — Broken Bridge, Su Causeway, nearly empty','Lingyin Temple in cedar quiet','Meijiawu tea village — Longjing terraces, quiet season tastings','Hefang Street old town','HSR Hangzhou → Suzhou (~1.5h) Jan 19'] },
        { name: 'Suzhou', days: 3, query: 'Humble Administrator\'s Garden, Suzhou',
          highlights: ['Humble Administrator\'s Garden + Lion Grove in frost — classical gardens at their most atmospheric','Tongli water town day trip — misty canals, empty bridges','Silk museum + Pingjiang Road canals at dusk','HSR Suzhou → Shanghai (~30min) Jan 22'] },
        { name: 'Shanghai buffer', days: 3, query: 'Jing\'an, Shanghai',
          highlights: ['Final meals, laundry, trip planning','Last look at the Bund in winter light','Slow final days — fly Shanghai → Osaka Jan 25'] },
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
          highlights: ['Bus/train Hakuba → Tokyo','Fly Tokyo → Manila Feb 24 — Philippines begins'] },
      ],
    },
    {
      id: 'philippines', kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-02-24', end: '2027-03-11', days: 15,
      theme: 'Manila staging, WWII wreck diving, limestone islands, warm-up for Raja Ampat',
      intro: 'Fly in two days early for rest and dive-gear prep in Manila, then the express run stays intact: Coron keeps five days for the greatest wreck dives on Earth, El Nido three for limestone drama, Cebu/Moalboal two for the sardine run — Malapascua thresher dropped for schedule. All warm-up diving before Raja Ampat. No liveaboard here.',
      tldr: 'Manila · Coron · El Nido · Cebu/Moalboal (express)',
      weather: { hi: 31, lo: 25, label: 'Dry season, 31°/25°', emoji: '🏝️', rainyDays: 2 },
      photos: ['el nido lagoon', 'coron kayangan lake', 'moalboal sardine run', 'intramuros manila'],
      places: [
        { name: 'Manila', days: 3, query: 'Intramuros, Manila',
          highlights: ['Feb 24–27: rest, jetlag buffer, dive-gear prep after Japan','Intramuros — walled Spanish colonial city','Fly Manila → Coron'] },
        { name: 'Coron', days: 5, query: 'Coron, Palawan, Philippines',
          highlights: ['Japanese WWII wrecks — Okikawa Maru, Irako, Akitsushima (sunk 1944)','Kayangan Lake — crystal-clear inland lake framed by karst','Barracuda Lake — thermocline diving (hot/cold layers)','CYC Beach + Twin Lagoon by banca boat','Among the finest wreck diving on Earth'] },
        { name: 'El Nido', days: 3, query: 'El Nido, Palawan',
          highlights: ['Island-hopping express: Big + Small Lagoons, Cadlao Island','Nacpan Beach — empty twin beach','Limestone cliffs, turquoise shallows','Long beach lunches, no agenda'] },
        { name: 'Cebu / Moalboal', days: 2, query: 'Moalboal, Cebu, Philippines',
          highlights: ['Sardine Run — millions of sardines schooling at Pescador Island (accessible from shore)','Turtle Beach — sea turtles feeding right off the beach','Malapascua thresher dropped — no time before the Mar 11 boarding','Kawasan Falls canyoneering (if time)','Fly Cebu → Manado or Manila → Sorong'] },
        { name: 'Transfer to Sorong', days: 2, query: 'Sorong, West Papua',
          highlights: ['Mar 9–11: Cebu → Manado or Manila → Sorong routing','Swap from snorkel/dive kit to liveaboard kit','Indonesia visa on arrival — Day 1 ~Mar 11'] },
      ],
      diving: { sites: 14, type: 'Day boats + shore dives', operators: 'Coron: multiple wreck operators; Moalboal: OceanBay / Savedra' },
      booking: [],
    },
    {
      id: 'indonesia-a', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-03-11', end: '2027-04-01', days: 21,
      theme: 'The best diving on Earth, then a slow recovery week',
      intro: 'First stay (21 days — inside the 30-day visa-free limit, no extension needed). Board on arrival day: 10 days on the water Mar 11–20 in the highest marine biodiversity on the planet, then slow down with ten days in Ubud. Fly out to Borneo Apr 1 — the exit restarts the clock for the second stay.',
      tldr: 'Raja Ampat liveaboard · Ubud slow',
      weather: { hi: 32, lo: 25, label: 'Mid-season ideal, 32°/25°', emoji: '🐠', rainyDays: 5 },
      photos: ['raja ampat aerial wayag', 'manta ray cleaning station', 'bali ubud rice terrace'],
      places: [
        { name: 'Raja Ampat Liveaboard', days: 10, query: 'Wayag, Raja Ampat',
          highlights: ['Mar 11–20: Wayag — postcard karst islands, kayak + hike viewpoint','Cape Kri — world record fish count dive site','Manta Sandy — manta ray cleaning station','Melissa\'s Garden — pristine hard coral','Pianemo — smaller Wayag, equally dramatic, fewer boats','Blue Water Mantas — oceanic, 6m wingspan','Wobbegongs, walking sharks, pygmy seahorses, nudibranchs','Book Papua Diving / Meridian Adventure — Mar 11–20 dates'] },
        { name: 'Transit Sorong → Bali', days: 1, query: 'Ngurah Rai Airport, Bali',
          highlights: ['Mar 21: off the boat in Sorong, fly via Makassar or direct to Denpasar','Onward to Ubud Mar 22 — slow recovery week'] },
        { name: 'Ubud', days: 10, query: 'Ubud, Bali',
          highlights: ['Mar 22 – Apr 1: slow recovery week after the liveaboard','Tegallalang rice terraces at dawn, sacred monkey forest','Slow mornings, warungs, massages — no agenda','Day trip: Tirta Empul water temple','Fly Bali → KK Apr 1 — exit resets the visa clock ✓'] },
      ],
      diving: { sites: 30, type: 'Liveaboard', operators: 'Papua Diving / Meridian Adventure (Raja)' },
      booking: ['Raja Ampat liveaboard — Mar 11–20 dates (moved from Mar 21–30!)','Visa-free entry (21d) — exit to Borneo Apr 1, no extension needed'],
    },
    {
      id: 'borneo', kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysia',
      start: '2027-04-01', end: '2027-04-11', days: 10,
      theme: 'Indonesia visa reset + wildlife chapter',
      intro: 'Fly in from Bali Apr 1 — the exit reset Indonesia\'s clock, and Kinabatangan is one of SE Asia\'s finest wildlife corridors. Proboscis monkeys, pygmy elephants bathing at dawn. Early April is prime dry season here.',
      tldr: 'KK · Sepilok · Kinabatangan River · back to Bali',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧', rainyDays: 6 },
      photos: ['borneo orangutan', 'kinabatangan river', 'proboscis monkey', 'sepilok'],
      places: [
        { name: 'Kota Kinabalu', days: 2, query: 'Kota Kinabalu, Sabah',
          highlights: ['Arrival from Bali, waterfront sunset over offshore islands','Filipino Night Market','Rest after the liveaboard + Ubud week'] },
        { name: 'Sepilok + Sandakan', days: 1, query: 'Sepilok Orangutan Centre',
          highlights: ['Sepilok Orangutan Rehabilitation Centre — morning feeding platform','Bornean Sun Bear Conservation Centre (adjacent)','Transfer same day to Kinabatangan'] },
        { name: 'Kinabatangan River', days: 5, query: 'Kinabatangan River, Sabah',
          highlights: ['Proboscis monkeys — endemic to Borneo, bizarre bulbous noses','Pygmy elephants bathing in the river at dawn — unmissable','Hornbills, kingfishers, monitor lizards, crocodiles','Fireflies illuminating the riverbank at night','Jungle lodges — wake to gibbons calling'] },
        { name: 'Kota Kinabalu', days: 2, query: 'Tunku Abdul Rahman Park, Kota Kinabalu',
          highlights: ['Tunku Abdul Rahman Marine Park snorkel day trip','Waterfront goodbye meal — fresh seafood','Fly back to Bali Apr 11 — fresh 30-day entry for the second stay'] },
      ],
      booking: ['Kinabatangan river lodge — book 2–3 months ahead; Sipadan permits by Nov 2026 if adding 3 extra days'],
    },
    {
      id: 'indonesia-b', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-04-11', end: '2027-04-28', days: 17,
      theme: 'Cliffs, dragons, drift dives, volcano — second stay',
      intro: 'Second stay (17 days — fresh visa-free entry, no extension needed). Pick up where the first stay left off: Nusa Penida mantas, Komodo dragons and drift dives, then Bali rice terraces and a volcano at 3am before the hop to Singapore.',
      tldr: 'Nusa Penida · Komodo · Batur',
      weather: { hi: 32, lo: 24, label: 'Dry season building, 32°/24°', emoji: '🐉', rainyDays: 4 },
      photos: ['kelingking beach trex', 'padar island viewpoint', 'komodo dragon', 'mount batur sunrise'],
      places: [
        { name: 'Nusa Penida', days: 4, query: 'Kelingking Beach, Nusa Penida',
          highlights: ['Apr 11: fast boat Sanur → Penida','Kelingking Beach — T-Rex cliff, most photographed in the Bali region','Angel\'s Billabong + Broken Beach — natural infinity pool carved into clifftop','Crystal Bay — reef mantas year-round (early morning dive)','Atuh Beach — remote east coast, dramatic rock formations','Scooter rental for full freedom'] },
        { name: 'Komodo', days: 7, query: 'Komodo National Park',
          highlights: ['Apr 15: fly Bali → Labuan Bajo — dramatic harbor, wooden phinisi boats','Manta Point — oceanic mantas in strong current','Crystal Rock + Castle Rock — world-class drift dives','Pink Beach — crushed red coral, excellent snorkeling','Batu Bolong — coral so dense no bare rock visible','Komodo dragons with ranger at Rinca or Komodo Island','Padar Island sunrise hike — three colored bays stretching below'] },
        { name: 'Bali + Volcano', days: 6, query: 'Ubud, Bali',
          highlights: ['Apr 22: fly Labuan Bajo → Bali','Tanah Lot sunset temple on a sea rock','Seminyak / Canggu beach club final evening','Balinese cooking class','Mount Batur: 3am departure, 2h hike to crater rim at 1,717m','Sunrise over the caldera and crater lake — fly Bali → Singapore Apr 28 ✓'] },
      ],
      diving: { sites: 12, type: 'Day boats', operators: 'Crystal Bay Dive (Penida); Labuan Bajo operators (Komodo)' },
      booking: [],
    },
    {
      id: 'singapore', kind: 'chapter', region: 'isthmus',
      country: 'Singapore', flag: '🇸🇬', title: 'Singapore',
      start: '2027-04-28', end: '2027-05-05', days: 7,
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
      start: '2027-05-05', end: '2027-05-15', days: 10,
      theme: 'Urban intensity, street food capital, colonial slow life',
      intro: 'KL for the city spectacle and food, Penang for the most rewarding slow chapter in mainland SE Asia. Georgetown is UNESCO, effortlessly liveable, and the hawker food is unsurpassed.',
      tldr: 'Petronas · Batu Caves · Georgetown · Gurney Drive hawker',
      weather: { hi: 33, lo: 24, label: 'Warm + humid', emoji: '☕', rainyDays: 6 },
      photos: ['petronas towers night', 'batu caves rainbow steps', 'penang street art', 'penang hawker'],
      places: [
        { name: 'Kuala Lumpur', days: 5, query: 'Petronas Twin Towers, KL',
          highlights: ['Petronas Twin Towers at night — best view from KLCC park reflection pool','Batu Caves — rainbow steps, macaques, Hindu temple inside limestone cave','Jalan Alor Night Food Street','Bukit Bintang neighborhood','Train north to Penang (ETS / KTM — scenic coastal rail)'] },
        { name: 'Penang', days: 5, query: 'Armenian Street, Georgetown',
          highlights: ['Armenian Street — Zacharevic murals, shophouse architecture, UNESCO','Gurney Drive hawker — char kway teow, asam laksa, cendol — the real versions','Clan Jetties — Chinese stilt villages over the water','Penang Hill funicular','Kek Lok Si Temple, Blue Mansion (Cheong Fatt Tze)','Temporary-life chapter: find a recurring breakfast spot, walk the same route each morning'] },
      ],
    },
    {
      id: 'thailand', kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Thailand',
      start: '2027-05-15', end: '2027-05-29', days: 14,
      theme: 'Islands, reef diving, urban intensity, street food',
      intro: 'Gulf coast dry season — clear water, calm seas, 30°C in the islands. Then Bangkok: temples, canal boats, and the best street food city on Earth.',
      tldr: 'Koh Tao · Koh Samui · Bangkok',
      weather: { hi: 36, lo: 25, label: 'Dry Gulf coast → hot city', emoji: '🛺', rainyDays: 7 },
      photos: ['koh tao diving', 'koh samui beach', 'bangkok wat arun', 'bangkok street food'],
      places: [
        { name: 'Koh Tao', days: 5, query: 'Koh Tao, Thailand',
          highlights: ['One of the best value diving destinations on Earth','Japanese Gardens, Chumphon Pinnacle','Sail Rock — whale shark territory (reliable in May)','Hammock, reef, lunch, repeat'] },
        { name: 'Koh Samui', days: 2, query: 'Chaweng Beach, Koh Samui',
          highlights: ['Chaweng Beach, Big Buddha','Ferry to Surat Thani → bus/flight to Bangkok'] },
        { name: 'Bangkok', days: 7, query: 'Wat Pho, Bangkok',
          highlights: ['Wat Pho — reclining Buddha + massage school','Grand Palace + Wat Phra Kaew','Khlong canal boat commute through the city','Chatuchak Weekend Market (Sat–Sun)','Yaowarat (Chinatown) at night','Kanchanaburi day trip — Erawan Falls, Death Railway, River Kwai','Fly Bangkok → Guilin / Guangzhou May 29'] },
      ],
      diving: { sites: 8, type: 'Day boats', operators: 'Several solid shops on Koh Tao' },
    },
    {
      id: 'china-spring', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2027-05-29', end: '2027-06-17', days: 19,
      theme: 'Ancient capital in perfect weather, then karst + old towns finale',
      intro: 'Nineteen days: Xi\'an in late-May perfection, then the southern karst at its greenest — including Zhangjiajie at peak season, when the pillars float above seas of cloud. Mist in the karst, mirror terraces, and lantern light to close the trip.',
      tldr: 'Xi\'an · Guilin · Longji · Zhangjiajie · Fenghuang · Furong',
      weather: { hi: 28, lo: 18, label: 'Early summer, 28°/18°', emoji: '🐉', rainyDays: 8 },
      photos: ['xian terracotta warriors', 'guilin karst li river', 'zhangjiajie avatar pillars'],
      places: [
        { name: 'Xi\'an', days: 4, query: 'Terracotta Warriors, Xi\'an',
          highlights: ['Arrive Bangkok → Xi\'an May 29 — 25° and perfect','Terracotta Warriors — indoor museum, astounding at any time of year','Cycle the Xi\'an city walls in perfect weather','Muslim Quarter — lamb skewers, biangbiang noodles, pomegranate juice','Giant Wild Goose Pagoda','Huashan day-trip option — iron chains and 2,000m drops','Fly Xi\'an → Guilin Jun 2'] },
        { name: 'Guilin / Yangshuo', days: 4, query: 'Yangshuo, China',
          highlights: ['Li River karst — mist between limestone towers at dawn','Bamboo raft on the Li River','Cycling through rice paddies and karst peaks','22–26°C, green and misty — best season'] },
        { name: 'Longji Terraces', days: 2, query: 'Longji Rice Terraces, China',
          highlights: ['Dragon\'s Backbone terraces flooded in June — mirror season','Ping\'an + Dazhai viewpoints at sunrise','Zhuang minority villages overnight'] },
        { name: 'Zhangjiajie + Tianmen', days: 4, query: 'Zhangjiajie National Park',
          highlights: ['Avatar Mountains — floating sandstone pillars in peak-season sea of clouds','Tianmen Stairway to Heaven (999 steps)','Glass Bridge + Glass Cliff Walk','Green valleys between the pillars','Travel to Fenghuang Jun 12 (Furong en route)'] },
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
    { task: 'Flights Nov–Jan + China domestic hops', by: 'By Sep 2026', critical: true, notes: 'KTM→TPE Nov 9 · TPE→CAN Nov 24 · HKG→PEK Dec 7 · PVG→ICN Dec 20 · ICN→SHA Jan 7 · SHA→KIX Jan 25 · TYO→MNL Feb 24 · domestic HSR/flights: PEK→CTU, CTU→CKG, CKG→PVG' },
    { task: 'Annapurna permits',         by: 'On arrival',  critical: false, notes: 'ACAP permit + TIMS card in Kathmandu' },
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
    { where: 'Coron — WWII Wrecks',      dates: 'Feb 27 – Mar 5', days: 6, notes: 'Japanese warships sunk 1944 — world\'s best wreck diving' },
    { where: 'Cebu / Moalboal',          dates: 'Mar 11–17',    days: 5,  notes: 'Sardine run at Pescador, thresher sharks at Malapascua' },
    { where: 'Raja Ampat',               dates: 'Mar 21–30',    days: 10, notes: 'Mid-season liveaboard — book by Oct 2025' },
    { where: 'Nusa Penida — Crystal Bay',dates: 'Apr 11–15',    days: 4,  notes: 'Reef mantas year-round' },
    { where: 'Komodo',                   dates: 'Apr 15–22',    days: 7, notes: 'Manta Point + drift dives, dry season building' },
    { where: 'Koh Tao',                  dates: 'May 15–20',    days: 5,  notes: 'Value diving, whale sharks at Sail Rock' },
    { where: 'Sipadan (optional)',       dates: 'Apr 24–27',    days: 3,  notes: '120 permits/day — book by Nov 2026' },
  ];

  // Budget — full-trip model, USD for two travelers (couple).
  // Per-chapter parts are researched estimates (see notes); the three locked
  // costs came from actual bookings/quotes. Totals are COMPUTED in the UI
  // (BudgetView) from these parts — never hardcoded — so edits stay consistent.
  const budget = {
    currency: 'USD',
    basis: 'couple · 361 days · mid-range with strategic splurges',
    fxBRL: 5.2,
    estimate: 'USD ~97.5k for two',
    perDay: '~USD 270/day for two',
    inBRL: '~R$254k per person at R$5.20',
    contingencyPct: 8,
    // Confirmed figures — do not re-estimate.
    locked: [
      { item: 'GRU–YYZ–ATH flights (2 pax)', cost: 1700, note: 'Bought ✅ — long-haul positioning into the trip' },
      { item: 'Raja Ampat liveaboard 10d (2 pax)', cost: 8400, note: 'Quoted/held — the trip splurge' },
      { item: 'Annapurna Base Camp trek, all-in (2 pax)', cost: 2000, note: 'Guide + porter + teahouses + meals + permits (ACAP/TIMS)' },
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
      { id: 'india', days: 6, lodging: 270, food: 270, transport: 190, activities: 120, fees: 55, note: 'Agra + Delhi trains ~$90 · Taj + forts + boats ~$110 · no Rishikesh leg' },
      { id: 'nepal', days: 19, lodging: 290, food: 290, transport: 100, activities: 2000, fees: 100, note: 'Trek $2,000 locked (11d Oct 25–Nov 4) · KTM 3n + Pokhara 5n hotels · food off-trek · 30d visa' },
      { id: 'taiwan', days: 14, lodging: 1330, food: 840, transport: 280, activities: 120, fees: 0, note: '~$95/n · Hualien rails · south slow days' },
      { id: 'china-e1a', days: 8, lodging: 640, food: 520, transport: 110, activities: 100, fees: 0, note: 'CAN→SZX HSR + SZX→HK exit · Canton Tower + Chen Clan + Kaiping day trip' },
      { id: 'china-e1b', days: 13, lodging: 985, food: 845, transport: 830, activities: 330, fees: 0, note: 'PEK→CTU ~$350 + CTU→CKG HSR ~$120 + CKG→PVG ~$240 · Wall + pandas + Dazu' },
      { id: 'hk', days: 5, lodging: 750, food: 450, transport: 120, activities: 0, fees: 0, note: '~$150/n · Peak tram + ferries + Lamma · free gardens/markets' },
      { id: 'korea', days: 18, lodging: 2250, food: 1260, transport: 450, activities: 250, fees: 0, note: '~$125/n · KTX loop + DMZ tour · Christmas/NYE week premium' },
      { id: 'china-e2', days: 18, lodging: 1590, food: 1170, transport: 650, activities: 400, fees: 0, note: 'Shanghai 9n + Huangshan/Hangzhou/Suzhou HSR star ~$480 · gardens + Huangshan park ~$250' },
      { id: 'japan', days: 30, lodging: 3900, food: 2850, transport: 800, activities: 1800, fees: 0, note: 'Cities 21n ~$125/n · Hakuba 9n · lift 7d + full rental · Tokyo–Hakuba buses' },
      { id: 'philippines', days: 15, lodging: 835, food: 740, transport: 510, activities: 1050, fees: 0, note: 'Manila 3n staging + gear prep · Coron 4 dive-days ~$760 · sardines · Malapascua dropped' },
      { id: 'indonesia-a', days: 21, lodging: 600, food: 350, transport: 1350, activities: 8600, fees: 0, note: 'Liveaboard $8,400 locked · Sorong routing ~$1,200 + DPS→BKI ~$150 · Ubud slow 10n · visa-free, no extension' },
      { id: 'indonesia-b', days: 17, lodging: 760, food: 1120, transport: 450, activities: 1010, fees: 20, note: 'BKI→LBJ/DPS ~$200 + boats ~$250 · Penida + Komodo dives · Batur · Bali levies' },
      { id: 'borneo', days: 10, lodging: 1020, food: 200, transport: 520, activities: 60, fees: 0, note: 'Kinabatangan 3D2N ~$600 + 2 lodge nights (full board) · Sepilok fees' },
      { id: 'singapore', days: 7, lodging: 980, food: 385, transport: 105, activities: 100, fees: 0, note: '~$140/n · hawker-first food · Gardens domes' },
      { id: 'malaysia', days: 10, lodging: 550, food: 400, transport: 170, activities: 60, fees: 0, note: 'KL + Penang guesthouses · SG→KL bus + ETS rail · Penang Hill + mansions' },
      { id: 'thailand', days: 14, lodging: 770, food: 700, transport: 420, activities: 610, fees: 0, note: 'Koh Tao 3 local dive-days ~$360 + Sail Rock ~$190 · Penang→Koh Tao + Samui transfer · Kanchanaburi' },
      { id: 'china-spring', days: 19, lodging: 1320, food: 1045, transport: 1030, activities: 400, fees: 0, note: 'BKK→XIY ~$400 + XIY→KWL ~$250 · Warriors + karst/pillars tickets' },
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
      { route: 'Varanasi → Kathmandu (direct)', cost: 360, date: '2026-10-20', note: '~$180pp Buddha Air' },
      { route: 'Kathmandu/Pokhara → Taipei', cost: 950, date: '2026-11-09', note: 'Estimate ~$475pp, via Bangkok/KL' },
      { route: 'Taipei → Guangzhou', cost: 300, date: '2026-11-24', note: 'Estimate, cross-strait hop' },
      { route: 'Hong Kong → Beijing', cost: 350, date: '2026-12-07', note: 'Estimate' },
      { route: 'Shanghai → Seoul', cost: 300, date: '2026-12-20', note: 'Estimate' },
      { route: 'Seoul → Shanghai', cost: 400, date: '2027-01-07', note: 'Estimate' },
      { route: 'Shanghai → Osaka', cost: 450, date: '2027-01-25', note: 'Estimate' },
      { route: 'Tokyo → Manila', cost: 560, date: '2027-02-24', note: 'Estimate' },
      { route: 'Manila/Cebu → Sorong', cost: 700, date: '2027-03-09', note: 'Estimate' },
      { route: 'Bali → Kota Kinabalu', cost: 150, date: '2027-04-01', note: 'Estimate, AirAsia — visa reset hop' },
      { route: 'Kota Kinabalu → Bali', cost: 180, date: '2027-04-11', note: 'Estimate, via DPS or direct to Labuan Bajo' },
      { route: 'Bali → Singapore', cost: 200, date: '2027-04-28', note: 'Estimate, AirAsia' },
      { route: 'Changsha → São Paulo (home)', cost: 1400, date: '2027-06-17', note: 'Estimate ~$700pp' },
    ],
    extras: [
      { item: 'Health insurance, $150/mo × 12 months (couple)', cost: 1800, note: 'Covers the full trip, both travelers' },
      { item: 'eSIMs + trail/trek sundries', cost: 350, note: '~15 countries + thermals/laundry gaps' },
    ],
    assumptions: [
      'All figures USD for two; mid-range with strategic splurges, researched Oct 2026 prices',
      'China entries are 17 + 18 days (each far inside the 30-day visa-free limit) — E2 runs past the current Dec 31 2026 extension, so reconfirm the policy or budget ~$300 for two visas',
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
    { layer: 'Beijing Wall day (Dec)', items: 'Windproof shell + insulated boots over Uniqlo layers bought in Guangzhou (wind chill −15° on the Wall); pick the bluest morning' },
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
    'taiwan':       { months: [11, 12],           note: 'Nov–Dec: post-typhoon, warm south, best island window' },
    'china-e1a':    { months: [11, 12],           note: 'Nov–Dec: mild PRD, Cantonese food, friends in Shenzhen' },
    'china-e1b':    { months: [12],                note: 'Dec: Great Wall in crisp light; Sichuan hotpot season' },
    'hk':           { months: [1, 2, 3, 10, 11, 12], note: 'Oct–Mar: cool dry season; mid-Dec pre-Christmas shoulder' },
    'korea':        { months: [12, 1],              note: 'Dec–Jan: festive Seoul, palace snow, KTX loop' },
    'china-e2':     { months: [1],                  note: 'Jan: Shanghai café season; Huangshan snow pines; Suzhou/Hangzhou gardens in frost' },
    'japan':        { months: [1, 2],               note: 'Jan–Feb: empty Kyoto temples + early plum; Hakuba powder post-CNY' },
    'philippines':  { months: [2, 3, 4],             note: 'Feb–Apr: Coron + El Nido dry season; Cebu sardine run Mar' },
    'indonesia-a':   { months: [3, 4],                note: 'Mar–Apr: Raja mid-season liveaboard; Ubud slow season' },
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
