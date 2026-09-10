// Sabbatical itinerary — single source of truth.
// Drives all three design directions. Read-only at runtime.

window.TRIP = (function () {
  const START = new Date('2026-06-21');
  const END = new Date('2027-06-18');
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
      id: 'rio', kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'Rio de Janeiro',
      start: '2026-06-21', end: '2026-07-20', days: 29,
      theme: 'Home base — mountains and diving certs',
      intro: 'The trip opens at home. This Rio chapter focused on two things: the Petrópolis–Teresópolis trail and diving certifications (Advanced Open Water + NITROX).',
      tldr: 'Petrópolis–Teresópolis trail · Advanced Open Water · NITROX',
      weather: { hi: 27, lo: 18, label: 'Inverno carioca, 27°/18°', emoji: '🌊', rainyDays: 8 },
      photos: ['rio aerial', 'copacabana beach', 'lapa arches', 'santa teresa rio'],
      places: [
        { name: 'Rio de Janeiro', days: 29, query: 'Ipanema, Rio de Janeiro',
          highlights: ['Petrópolis–Teresópolis trail (Serra dos Órgãos)','Diving certifications: Advanced Open Water + NITROX'] },
      ],
    },
    {
      id: 'cumbuco', kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'Cumbuco',
      start: '2026-07-21', end: '2026-08-19', days: 29,
      theme: 'Condo base, short kite sessions, downwinders',
      intro: 'Stayed in a condo and did short kitesurfing sessions from there, with occasional downwinders from the village center.',
      tldr: 'Condo · short kite sessions · downwinders',
      weather: { hi: 30, lo: 24, label: 'Nordeste seco, 30°/24°', emoji: '🪁', rainyDays: 3 },
      photos: ['cumbuco beach kites', 'cumbuco kitesurf', 'cumbuco mural', 'super cumbuco'],
      places: [
        { name: 'Cumbuco', days: 29, query: 'Cumbuco, Caucaia, Ceará',
          highlights: ['Stayed in a condo — home base','Short kitesurfing sessions from the condo','Occasional downwinders from the village center'] },
      ],
    },
    {
      id: 'saopaulo', kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'São Paulo',
      start: '2026-08-19', end: '2026-08-26', days: 7,
      theme: 'Friends & family, farewell BBQ',
      intro: 'No sightseeing — just time with friends and family in São Paulo before leaving Brazil. Closed the Brazil chapter with a farewell BBQ.',
      tldr: 'Friends & family · Farewell BBQ',
      weather: { hi: 24, lo: 14, label: 'Inverno paulistano, 24°/14°', emoji: '☕', rainyDays: 1 },
      photos: ['masp sao paulo', 'sao paulo skyline', 'ibirapuera park', 'vila madelena art'],
      places: [
        { name: 'São Paulo', days: 7, query: 'Avenida Paulista, São Paulo',
          highlights: ['No sightseeing — time with friends and family only','Farewell BBQ before leaving Brazil','Fly São Paulo → Toronto to open the international leg'] },
      ],
    },
    {
      id: 'toronto', kind: 'chapter', region: 'americas',
      country: 'Canada', flag: '🇨🇦', title: 'Toronto',
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
      intro: 'Landing from Athens on a single Turkish ticket via IST into Göreme. Three nights in the valleys (balloon booked ✅), then take the Sep 24, 22:50 ASR→ADB flight for a rental-car loop down the Aegean coast: Alaçatı, Şirince (Ephesus), Kaş and Akyaka. Return the car at ADB on Oct 2, fly into Istanbul and stay until the end of the chapter before the Oct 12 flight to Baku.',
      tldr: 'Cappadocia (Göreme) · Alaçatı · Şirince · Kaş · Akyaka · Istanbul',
      weather: { hi: 26, lo: 14, label: 'Early autumn, 26°/14°', emoji: '☀️', rainyDays: 3 },
      photos: ['cappadocia balloons', 'alacati aegean', 'kas harbour', 'istanbul mosque'],
      places: [
        { name: 'Cappadocia — Göreme', days: 3, query: 'Göreme, Cappadocia, Turkey',
          highlights: ['Sep 21 arrival in Göreme from Athens via IST — single Turkish ticket, bought ✅','Explore the valleys: Rose Valley, Love Valley, Göreme Open Air Museum','Hot air balloon flight — Sep 22 or 23, booked ✅','Underground cities: Derinkuyu, Kaymakli','Stays Göreme Sep 21–24 booked ✅','Sep 24, 22:50: fly Kayseri (ASR) → Izmir (ADB), bought ✅'] },
        { name: 'Alaçatı', days: 2, query: 'Alaçatı, Çeşme, Turkey',
          highlights: ['Pick up the rental car at ADB on Sep 25 (landed 22:50 the night before) — ~1h drive west','Relax, recover, explore Alaçatı / Çeşme / Ilıca','Kitesurfing window on the Çeşme peninsula','Restored stone-house village, windmills, Aegean coastline'] },
        { name: 'Şirince', days: 1, query: 'Şirince, Selçuk, Turkey',
          highlights: ['Drive ~1.5–2h from Alaçatı','Visit Ephesus late afternoon or next morning','Quiet village overnight'] },
        { name: 'Kaş', days: 3, query: 'Kaş, Antalya, Turkey',
          highlights: ['Drive ~5h from Şirince/Selçuk','Two full days for Kekova, swimming, Kaputaş, relaxing','Lycian Way treks from town'] },
        { name: 'Akyaka', days: 1, query: 'Akyaka, Muğla, Turkey',
          highlights: ['Drive ~2.5–3h from Kaş','Azmak River, slow evening','Oct 2: ~2.5h drive to Izmir airport (ADB), leave very early for a morning flight — drop the car, fly ADB → Istanbul'] },
        { name: 'Istanbul', days: 10, query: 'Sultanahmet, Istanbul',
          highlights: ['Oct 2 flight ADB → Istanbul (~1h15)','Historic peninsula: Hagia Sophia, Topkapi, Sultanahmet without rushing','Asian side — Kadıköy/Moda ferries and market mornings','Bosphorus ferries — the most beautiful commute on Earth','Princes\' Islands day trip','Oct 12: fly Istanbul (IST) → Baku (GYD), bought ✅'] },
      ],
      booking: ['Balloon Sep 22/23 — booked ✅','IST → GYD Oct 12 + GYD → DEL Oct 14 — bought ✅','Stays Göreme Sep 21–24 booked ✅ — Alaçatı (Sep 25–26), Şirince (27), Kaş (28–30), Akyaka (Oct 1) need (re)booking for new dates','Rental car ADB Sep 25 – Oct 2 — collect at ADB, loop Alaçatı→Şirince→Kaş→Akyaka, return at ADB','Internal flights ASR→ADB 22:50 Sep 24 + ADB→IST Oct 2 — ASR→ADB bought ✅, ADB→IST to buy','India e-Visa by mid-Sep'],
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
          highlights: ['Oct 12: fly Istanbul (IST) → Baku (GYD), bought ✅','Oct 13: Flame Towers — Caspian bay panorama at dusk','Icherisheher (Old City) — Maiden Tower + Palace of the Shirvanshahs','Caspian promenade (Bulvar) waterfront walk','Oct 14: fly Baku (GYD) → Delhi (DEL), bought ✅'] },
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
      start: '2026-10-21', end: '2026-11-10', days: 20,
      theme: 'Sacred roof of the world, physical peak, elemental beauty',
      intro: 'Late October into November — post-monsoon clarity holds, skies still crystalline, Himalayan views unobstructed 360°. Slightly cooler than October, meaning fewer crowds on the trail and sharper air at altitude.',
      tldr: 'Kathmandu · Pokhara · Annapurna Base Camp trek',
      weather: { hi: 18, lo: 2, label: 'Late post-monsoon, 18°/2°', emoji: '🏔️', rainyDays: 1 },
      photos: ['annapurna himalaya', 'kathmandu boudhanath stupa', 'pokhara phewa lake', 'everest prayer flags'],
      places: [
        { name: 'Kathmandu', days: 3, query: 'Kathmandu, Nepal',
          highlights: ['Boudhanath Stupa — one of the largest stupas on Earth','Pashupatinath Temple — sacred Hindu cremation ghats on the Bagmati','Swayambhunath (Monkey Temple)','Altitude acclimatization, gear check, ACAP + TIMS permits'] },
        { name: 'Pokhara', days: 2, query: 'Pokhara, Nepal',
          highlights: ['Phewa Lake calm before the trek','Annapurna range at dawn from the lakeside'] },
        { name: 'Annapurna Base Camp Trek', days: 13, query: 'Annapurna Base Camp, Nepal',
          highlights: ['Nayapul → Ghandruk → Chhomrong → Bamboo','Deurali → Machhapuchhre Base Camp → ABC (4,130m)','Teahouse circuit — no camping gear needed','Rhododendron forests, glacial moraines, 360° Annapurna amphitheater','Return via Jhinu hot springs'] },
        { name: 'Pokhara recovery', days: 2, query: 'Phewa Lake, Pokhara',
          highlights: ['Lakeside slow meals, massage, reflection','Optional paragliding over Phewa Lake','Sārangkot sunrise over the Himalayas'] },
      ],
      booking: ['ACAP permit + TIMS card — on arrival in Kathmandu'],
    },
    {
      id: 'japan-autumn', kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Autumn',
      start: '2026-11-10', end: '2026-11-30', days: 20,
      theme: 'Sacred refinement, koyo at peak, slow urban chapter',
      intro: 'Tokyo first for peak city-koyo. Osaka as the bridge. Kyoto last — crowds thin after Nov 26 while late-season foliage (Eikan-do, Tofuku-ji) holds. This order means the best is saved.',
      tldr: 'Tokyo · Osaka · Kyoto — peak koyo (Kyoto last)',
      weather: { hi: 14, lo: 6, label: 'Crisp autumn, 14°/6°', emoji: '🍁', rainyDays: 7 },
      photos: ['kyoto autumn maple', 'fushimi inari', 'tokyo shimokitazawa', 'osaka dotonbori', 'arashiyama bamboo'],
      places: [
        { name: 'Tokyo', days: 7, query: 'Shimokitazawa, Tokyo',
          highlights: ['Shimokitazawa vintage shops + live music','Yanaka shitamachi neighborhood — cats, temples, old Tokyo','Shinjuku Gyoen peak-autumn foliage (Nov 10–17 prime window)','Harajuku, Omotesando','Tsukiji outer market breakfast','Nikko day trip — Tosho-gu shrine, Kegon Falls, mountain koyo'] },
        { name: 'Osaka', days: 5, query: 'Dotonbori, Osaka',
          highlights: ['Dotonbori, Kuromon Ichiba Market','Osaka Castle grounds','Shinsekai neighborhood','Takoyaki, okonomiyaki, kushikatsu','Nara day trip — free-roaming deer, Todai-ji'] },
        { name: 'Kyoto', days: 8, query: 'Eikan-do, Kyoto',
          highlights: ['Eikan-do — late-season foliage + night light-up (Nov 22–30 prime)','Tofuku-ji maple bridge — most photographed koyo in Kyoto','Fushimi Inari at dawn','Arashiyama bamboo grove + Tenryu-ji','Philosopher\'s Path in last autumn color','Nishiki Market','Temporary-life chapter: recurring café, structured mornings'] },
      ],
    },
    {
      id: 'korea', kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2026-11-30', end: '2026-12-24', days: 24,
      theme: 'Electric winter hearth, K-culture, food depth, slow traditional chapter',
      intro: 'Palace grounds dusted with early snow, jjigae stews and makgeolli in pojangmacha tents, the Han River frozen at the edges. December Seoul is vibrant with Christmas energy.',
      tldr: 'Seoul · Busan · Gyeongju · Jeonju · Christmas Seoul',
      weather: { hi: 6, lo: -3, label: 'Cold + cozy, 6°/-3°', emoji: '❄️', rainyDays: 6 },
      photos: ['seoul palace winter', 'busan gamcheon', 'gyeongju temple', 'jeonju hanok', 'korean street food'],
      places: [
        { name: 'Seoul', days: 7, query: 'Gyeongbokgung, Seoul',
          highlights: ['Gyeongbokgung + Changdeokgung in winter light','Bukchon Hanok Village','Gwangjang Market — bindaetteok, mayak gimbap','Hongdae, Itaewon, Insadong','Specialty coffee culture — Seoul has some of Asia\'s best','DMZ day trip'] },
        { name: 'Busan', days: 5, query: 'Gamcheon Culture Village, Busan',
          highlights: ['Gamcheon Culture Village (colorful hillside)','Jagalchi Fish Market — raw sea urchin, live octopus','Haedong Yonggungsa seaside temple','Haeundae Beach — dramatic and empty in winter','Gwangalli Bridge lit up at night'] },
        { name: 'Gyeongju', days: 3, query: 'Bulguksa Temple, Gyeongju',
          highlights: ['Ancient capital of the Silla Kingdom (57 BC – 935 AD)','Bulguksa (UNESCO), Seokguram Grotto','Tumuli Park burial mounds in the middle of the city','Anapji Pond at dusk'] },
        { name: 'Jeonju', days: 5, query: 'Jeonju Hanok Village',
          highlights: ['The best Korean food city — full stop','800+ traditional hanok houses still inhabited','Bibimbap origin city — eat it in a traditional courtyard','Makgeolli bars, traditional markets, slow pace'] },
        { name: 'Seoul / Incheon', days: 4, query: 'Myeongdong, Seoul',
          highlights: ['Christmas atmosphere in Myeongdong','Dongdaemun Design Plaza lit up','Final Korean meals — galbi, naengmyeon, soju','Fly Seoul → Taipei Dec 24'] },
      ],
    },
    {
      id: 'taiwan', kind: 'chapter', region: 'northeast',
      country: 'Taiwan', flag: '🇹🇼', title: 'Taiwan',
      start: '2026-12-24', end: '2027-01-12', days: 19,
      theme: 'Café culture, NYE fireworks, dramatic east coast',
      intro: 'Arrive Christmas Eve. Taipei on New Year\'s Eve is one of Asia\'s great celebrations — the Taipei 101 countdown fireworks fired from the building itself in a vertical cascade.',
      tldr: 'Taipei · Jiufen · NYE Dec 31 · Taroko Gorge · Taiwan slow travel',
      weather: { hi: 18, lo: 13, label: 'Dry, clear, mild, 18°/13°', emoji: '🎆', rainyDays: 5 },
      photos: ['taipei 101 night', 'jiufen old street', 'taroko gorge marble', 'taiwan night market'],
      places: [
        { name: 'Taipei', days: 7, query: 'Da\'an District, Taipei',
          highlights: ['Da\'an specialty coffee + bookshops','Jiufen — clifftop mining town, lantern-lit teahouses, mist','Shilin Night Market','Elephant Mountain sunset hike over the skyline','NYE Dec 31: Taipei 101 fireworks — fired from the building, visible citywide ✓'] },
        { name: 'Hualien + Taroko Gorge', days: 2, query: 'Taroko Gorge, Taiwan',
          highlights: ['Train along Pacific coast — one of Asia\'s great rail journeys','Marble canyon, jade river, suspension bridges','Qingshui Cliffs — Pacific walls dropping into the ocean'] },
        { name: 'Taiwan slow travel', days: 10, query: 'Tainan, Taiwan',
          highlights: ['Use the added days to slow down rather than rush: Tainan temples and food, then return to Taipei','Tainan: old streets, night markets, oyster omelettes and beef noodle soup','Optional Alishan forest railway and tea-country overnight','Return to Taipei for the Jan 12 flight to Shanghai'] },
      ],
    },
    {
      id: 'china-1', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 1',
      start: '2027-01-12', end: '2027-02-11', days: 30,
      theme: 'Imperial capital, global finance hub, future-tech frontier',
      intro: 'The three great metropolises in one extended block. Beijing in January — empty and sometimes snow-dusted — is one of its finest versions. Shanghai rewards lingering. Shenzhen is the most forward-facing city on Earth.',
      tldr: 'Beijing · Shanghai · Suzhou · Shenzhen',
      weather: { hi: 8, lo: -2, label: 'Cold north, mild south', emoji: '🏙️', rainyDays: 8 },
      photos: ['great wall snow', 'shanghai bund night', 'shanghai french concession', 'shenzhen night skyline'],
      places: [
        { name: 'Beijing', days: 8, query: 'Mutianyu Great Wall, Beijing',
          highlights: ['Great Wall (Mutianyu) — empty + snow-dusted in January','Forbidden City in winter light','Temple of Heaven','798 Art District','Hutong + Drum/Bell Towers','Peking duck','Summer Palace — ice on Kunming Lake'] },
        { name: 'Shanghai', days: 14, query: 'The Bund, Shanghai',
          highlights: ['French Concession — plane-tree boulevards, Art Deco villas, best café scene in China','The Bund — skyline across the Huangpu, best at night','Pudong + Oriental Pearl Tower — futuristic counterpoint','Yu Garden — classical Chinese garden inside old city','Tianzifang arts + crafts alleys','Suzhou day trip (30min bullet): classical gardens, silk, canals','Hangzhou day trip: West Lake in winter mist','Xintiandi, M50 art district','Zhujiajiao water town day trip'] },
        { name: 'Shenzhen', days: 5, query: 'Huaqiangbei, Shenzhen',
          highlights: ['Huaqiangbei Electronics Market — world\'s largest, floors of components and DIY tech','OCT Contemporary Art District','Dafen Oil Painting Village','Guangzhou day trip (35min metro): Cantonese food, Shamian Island colonial'] },
        { name: 'Buffer', days: 3, query: 'Shenzhen Bay Port',
          highlights: ['Travel buffer between cities','Shenzhen → HK exit Feb 11'] },
      ],
    },
    {
      id: 'hk', kind: 'chapter', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong',
      start: '2027-02-11', end: '2027-02-16', days: 5,
      theme: 'Neon city, dim sum, city recharge between China and Hakuba',
      intro: 'Five days in one of the world\'s great cities. Neon-soaked Kowloon, world-class dim sum, the Star Ferry crossing at night. A proper chapter, not just a transit.',
      tldr: 'Victoria Peak · Kowloon neon · Dim sum · Lamma Island',
      weather: { hi: 19, lo: 15, label: 'Mild, 19°/15°', emoji: '🥟', rainyDays: 1 },
      photos: ['hong kong skyline', 'kowloon neon', 'hong kong dim sum'],
      places: [
        { name: 'Hong Kong', days: 5, query: 'Victoria Peak, Hong Kong',
          highlights: ['Victoria Peak — harbor panorama at dusk, city grid below','Star Ferry crossing: Kowloon → Central at night','Dim sum yum cha: Tim Ho Wan, Lin Heung, One Dim Sum','Temple Street Night Market — jade, fortune tellers, street food','Nan Lian Garden + Chi Lin Nunnery (free, stunning)','Lamma Island day trip: seafood lunch, car-free village walk','Tai O fishing village: stilt houses over tidal channels','Rest, laundry, planning — fly HK → Osaka Feb 16'] },
      ],
    },
    {
      id: 'japan-winter', kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Winter',
      start: '2027-02-16', end: '2027-02-26', days: 10,
      theme: 'Powder snowboarding, mountain stillness, onsen',
      intro: 'Focused Hakuba: a pure snowboard chapter. No city detours — just powder, onsen, and mountain ramen. February brings a deeper snowpack than early January; scheduling after China and Hong Kong keeps the journey coherent.',
      tldr: 'Osaka (arrival) · Hakuba Valley (8 days snowboard)',
      weather: { hi: 3, lo: -5, label: 'Peak powder, 3°/-5°', emoji: '🏂', rainyDays: 7 },
      photos: ['hakuba snowboarding', 'japan onsen snow', 'kanazawa kenrokuen snow', 'matsumoto castle winter'],
      places: [
        { name: 'Osaka', days: 1, query: 'Dotonbori, Osaka',
          highlights: ['Arrival anchor from Hong Kong','Winter seafood season — crab in Dotonbori','Overnight bus or JR to Hakuba'] },
        { name: 'Hakuba Valley', days: 8, query: 'Hakuba, Japan',
          highlights: ['Rent ALL equipment + outerwear locally (boots, board, jacket, helmet)','Hakuba over Niseko — authentic village feel, Japan-ness preserved','6–7 actual snowboard days across three resorts','1–2 onsen rest days + mountain restaurants','Happo-one, Goryu, Cortina — each with distinct character','Izakaya nights, ramen, star-filled mountain sky'] },
        { name: 'Departure', days: 1, query: 'Nagoya Station, Japan',
          highlights: ['Bus/train Hakuba → Nagoya or Tokyo','Fly to Manila — Philippines begins Feb 26'] },
      ],
    },
    {
      id: 'philippines', kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-02-26', end: '2027-03-19', days: 21,
      theme: 'WWII wreck diving, limestone islands, warm-up for Raja Ampat',
      intro: 'Coron for the greatest wreck dives on Earth. El Nido for limestone drama. Cebu/Moalboal for the sardine run — all warm-up diving before Raja Ampat. No liveaboard here.',
      tldr: 'Manila · Coron · El Nido · Cebu/Moalboal',
      weather: { hi: 31, lo: 25, label: 'Dry season, 31°/25°', emoji: '🏝️', rainyDays: 2 },
      photos: ['el nido lagoon', 'coron kayangan lake', 'moalboal sardine run', 'intramuros manila'],
      places: [
        { name: 'Manila', days: 1, query: 'Intramuros, Manila',
          highlights: ['Intramuros — walled Spanish colonial city','Fly Manila → Coron'] },
        { name: 'Coron', days: 6, query: 'Coron, Palawan, Philippines',
          highlights: ['Japanese WWII wrecks — Okikawa Maru, Irako, Akitsushima (sunk 1944)','Kayangan Lake — crystal-clear inland lake framed by karst','Barracuda Lake — thermocline diving (hot/cold layers)','CYC Beach + Twin Lagoon by banca boat','Among the finest wreck diving on Earth'] },
        { name: 'El Nido', days: 6, query: 'El Nido, Palawan',
          highlights: ['Island-hopping: Secret + Big + Small Lagoons','Cadlao Island circumnavigation','Nacpan Beach — empty twin beach','Limestone cliffs, turquoise shallows','Long beach lunches, no agenda'] },
        { name: 'Cebu / Moalboal', days: 6, query: 'Moalboal, Cebu, Philippines',
          highlights: ['Sardine Run — millions of sardines schooling at Pescador Island (accessible from shore)','Turtle Beach — sea turtles feeding right off the beach','Malapascua: thresher shark dive at dawn','Kawasan Falls canyoneering','Fly Cebu → Manado or Manila → Sorong'] },
        { name: 'Transfer to Sorong', days: 2, query: 'Sorong, West Papua',
          highlights: ['Cebu → Manado or Manila → Sorong routing','Swap from snorkel/dive kit to liveaboard kit','Indonesia visa on arrival — Day 1 of 30-day window'] },
      ],
      diving: { sites: 20, type: 'Day boats + shore dives', operators: 'Coron: multiple wreck operators; Moalboal: OceanBay / Savedra' },
      booking: [],
    },
    {
      id: 'indonesia-1', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia — Raja Ampat',
      start: '2027-03-19', end: '2027-04-01', days: 14,
      theme: 'The best diving on Earth — liveaboard deep dive',
      intro: 'Raja Ampat contains the highest marine biodiversity on the planet. More fish species in one bay than in the entire Caribbean. Transit in, 10 days on the water, transit back to Bali.',
      tldr: 'Transit to Sorong · 10d liveaboard · Back to Bali',
      weather: { hi: 32, lo: 26, label: 'Mid-season ideal, 32°/26°', emoji: '🐠', rainyDays: 5 },
      photos: ['raja ampat aerial wayag', 'manta ray cleaning station', 'coral reef indonesia', 'pygmy seahorse', 'reef sharks'],
      places: [
        { name: 'Transit to Sorong', days: 2, query: 'Sorong, West Papua',
          highlights: ['Cebu → Manado or Manila → Sorong routing','Indonesia visa on arrival — Day 1 of 30-day window','Pack down to liveaboard dive kit, board same day'] },
        { name: 'Raja Ampat Liveaboard', days: 10, query: 'Wayag, Raja Ampat',
          highlights: ['Wayag — postcard karst islands, kayak + hike viewpoint','Cape Kri — world record fish count dive site','Manta Sandy — manta ray cleaning station','Melissa\'s Garden — pristine hard coral','Pianemo — smaller Wayag, equally dramatic, fewer boats','Blue Water Mantas — oceanic, 6m wingspan','Wobbegongs, walking sharks, pygmy seahorses, nudibranchs','Book Papua Diving / Meridian Adventure — by Oct 2025'] },
        { name: 'Transit Sorong → Bali', days: 2, query: 'Ngurah Rai Airport, Bali',
          highlights: ['Off the boat in Sorong, fly via Makassar or direct to Denpasar','Indonesia visa Day 11 of 30 — 19 days remaining','Fast boat Sanur → Nusa Penida Apr 1'] },
      ],
      diving: { sites: 30, type: 'Liveaboard', operators: 'Papua Diving / Meridian Adventure' },
      booking: ['Raja Ampat liveaboard — book by Oct 2025 (Mar 21–30 dates)'],
    },
    {
      id: 'indonesia-2', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia — Nusa Penida · Komodo · Bali',
      start: '2027-04-01', end: '2027-04-18', days: 17,
      theme: 'Raw cliffs, dragon islands, volcanic sunrise — close of Indonesia block',
      intro: 'Three distinct Indonesian worlds back to back. Nusa Penida: stark, dramatic, manta-filled. Komodo: dragons and world-class drift dives. Bali: rice terraces and a volcano at 3am. Indonesia visa exits Day 30 ✓',
      tldr: 'Nusa Penida · Komodo · Ubud · Mount Batur sunrise',
      weather: { hi: 31, lo: 24, label: 'Dry season building, 31°/24°', emoji: '🌋', rainyDays: 5 },
      photos: ['kelingking beach trex', 'padar island viewpoint', 'komodo dragon', 'bali ubud rice terrace', 'mount batur sunrise'],
      places: [
        { name: 'Nusa Penida', days: 4, query: 'Kelingking Beach, Nusa Penida',
          highlights: ['Kelingking Beach — T-Rex cliff, most photographed in the Bali region','Angel\'s Billabong + Broken Beach — natural infinity pool carved into clifftop','Crystal Bay — reef mantas year-round (early morning dive)','Atuh Beach — remote east coast, dramatic rock formations','Scooter rental for full freedom'] },
        { name: 'Komodo', days: 7, query: 'Komodo National Park',
          highlights: ['Fly Bali → Labuan Bajo — dramatic harbor, wooden phinisi boats','Manta Point — oceanic mantas in strong current','Crystal Rock + Castle Rock — world-class drift dives','Pink Beach — crushed red coral, excellent snorkeling','Batu Bolong — coral so dense no bare rock visible','Komodo dragons with ranger at Rinca or Komodo Island','Padar Island sunrise hike — three colored bays stretching below'] },
        { name: 'Bali + Volcano', days: 6, query: 'Ubud, Bali',
          highlights: ['Ubud: Tegallalang rice terraces, sacred monkey forest','Tanah Lot sunset temple on a sea rock','Seminyak / Canggu beach club final evening','Balinese cooking class','Mount Batur: 3am departure, 2h hike to crater rim at 1,717m','Sunrise over the caldera and crater lake — Indonesia visa exits Day 30 ✓'] },
      ],
      diving: { sites: 12, type: 'Day dives + day boats', operators: 'Crystal Bay Dive (Nusa Penida); multiple operators in Labuan Bajo (Komodo)' },
    },
    {
      id: 'borneo', kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Borneo / Sabah',
      start: '2027-04-18', end: '2027-04-28', days: 10,
      theme: 'Indonesia visa reset + wildlife chapter',
      intro: 'Bali → KK flight exits Indonesia on Day 30 — perfectly timed reset. Kinabatangan is one of SE Asia\'s finest wildlife corridors. Proboscis monkeys, pygmy elephants bathing at dawn.',
      tldr: 'KK · Sepilok · Kinabatangan River · KK departure',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧', rainyDays: 6 },
      photos: ['borneo orangutan', 'kinabatangan river', 'proboscis monkey', 'sepilok'],
      places: [
        { name: 'Kota Kinabalu', days: 2, query: 'Kota Kinabalu, Sabah',
          highlights: ['Arrival, waterfront sunset over offshore islands','Filipino Night Market','Rest after Indonesia block'] },
        { name: 'Sepilok + Sandakan', days: 1, query: 'Sepilok Orangutan Centre',
          highlights: ['Sepilok Orangutan Rehabilitation Centre — morning feeding platform','Bornean Sun Bear Conservation Centre (adjacent)','Transfer same day to Kinabatangan'] },
        { name: 'Kinabatangan River', days: 5, query: 'Kinabatangan River, Sabah',
          highlights: ['Proboscis monkeys — endemic to Borneo, bizarre bulbous noses','Pygmy elephants bathing in the river at dawn — unmissable','Hornbills, kingfishers, monitor lizards, crocodiles','Fireflies illuminating the riverbank at night','Jungle lodges — wake to gibbons calling'] },
        { name: 'Kota Kinabalu', days: 2, query: 'Tunku Abdul Rahman Park, Kota Kinabalu',
          highlights: ['Tunku Abdul Rahman Marine Park snorkel day trip','Waterfront goodbye meal — fresh seafood','Fly KK → Singapore to open SE Asia final block'] },
      ],
      booking: ['Kinabatangan river lodge — book 2–3 months ahead; Sipadan permits by Nov 2026 if adding 3 extra days'],
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
      id: 'china-2', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 2',
      start: '2027-05-29', end: '2027-06-18', days: 20,
      theme: 'Surreal landscapes, ancient empire, spring China',
      intro: 'Spring is the ideal season for these landscapes. Li River mist in the karst, Zhangjiajie sea of clouds, pandas active in Chengdu. These regions shine more in May than in winter.',
      tldr: 'Guilin · Zhangjiajie · Chongqing · Chengdu · Xi\'an',
      weather: { hi: 26, lo: 16, label: 'Spring, 26°/16°', emoji: '🐼', rainyDays: 9 },
      photos: ['guilin karst li river', 'zhangjiajie avatar pillars', 'chongqing cyberpunk night', 'chengdu panda', 'xian terracotta warriors'],
      places: [
        { name: 'Guilin / Yangshuo', days: 4, query: 'Yangshuo, China',
          highlights: ['Li River karst — spring mist between limestone towers at dawn','Bamboo raft on the Li River','Cycling through rice paddies and karst peaks','Spring névoa and green — arguably the best season'] },
        { name: 'Zhangjiajie + Tianmen', days: 4, query: 'Zhangjiajie National Park',
          highlights: ['Avatar Mountains — floating sandstone pillars in spring sea of clouds','Tianmen Stairway to Heaven (999 steps)','Glass Bridge + Glass Cliff Walk','Spring green fills the valleys between pillars'] },
        { name: 'Chongqing', days: 3, query: 'Chongqing, China',
          highlights: ['The most cyberpunk city on Earth — 34M people, bridges everywhere','Cable car across the Yangtze River','Hongyadong riverside stilted buildings lit at night','Hotpot capital — mandatory multiple visits'] },
        { name: 'Chengdu', days: 3, query: 'Chengdu Panda Base',
          highlights: ['Giant panda base — spring morning, active babies','Jinli Ancient Street, Kuanzhai Alley','Mapo tofu, dan dan noodles, more hotpot'] },
        { name: 'Xi\'an', days: 4, query: 'Terracotta Warriors, Xi\'an',
          highlights: ['Terracotta Warriors — indoor museum, astounding at any time of year','Cycle the Xi\'an city walls','Muslim Quarter — lamb skewers, biangbiang noodles, pomegranate juice','Huashan Plank Walk — iron chains, narrow planks, 2,000m drop'] },
        { name: 'Buffer', days: 2, query: 'Xi\'an, China',
          highlights: ['Travel buffer','Fly home Jun 18, 2027 ✓'] },
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
    { task: 'Raja Ampat liveaboard',     by: 'By Oct 2025', critical: true,  notes: 'Papua Diving / Meridian Adventure — Mar 21–30; books out 6+ months ahead' },
    { task: 'Sipadan permits',           by: 'By Nov 2026', critical: true,  notes: '120 permits/day cap — if adding Sipadan to Borneo chapter' },
    { task: 'Annapurna permits',         by: 'On arrival',  critical: false, notes: 'ACAP permit + TIMS card in Kathmandu' },
    { task: 'Kinabatangan river lodge',  by: 'By Feb 2027', critical: false, notes: 'Book 2–3 months ahead; good lodges fill in dry season' },
    // ── Confirmed — Greece 100% ✅ ──
    { task: 'Greece stays — all 7 booked',  by: 'Done ✅', critical: false, done: true, notes: 'Athens 1–5 · Chania 5–9 · Rethymno 9–12 · Santorini 12–14 · Folegandros 14–16 · Milos 16–20 (checkout adjusted 22→20) · Athens buffer 20–21' },
    { task: 'Greece ferries — all 4 bought', by: 'Done ✅', critical: false, done: true, notes: 'Rethymno→Santorini Sep 12 · Santorini→Folegandros Sep 14 · Folegandros→Milos Sep 16 · Milos→Athens Sep 20' },
    { task: 'Flights: Athens→Chania + Athens→Cappadocia', by: 'Done ✅', critical: false, done: true, notes: 'Sep 5 06h45 to Chania · Sep 21 to Cappadocia via IST, single Turkish ticket' },
    // ── Confirmed — Türkiye + Baku + DEL ✅ ──
    { task: 'Cappadocia balloon — Sep 22 or 23', by: 'Done ✅', critical: false, done: true, notes: 'Royal Balloon / Butterfly Balloons — booked' },
    { task: 'Flights until DEL — recheck', by: 'Done except ADB→IST', critical: true, done: false, notes: 'ASR→ADB Sep 24 22:50 bought ✅ · ADB→IST moved Sep 30 eve → Oct 2, TO BUY · IST→GYD Oct 12 · GYD→DEL Oct 14' },
    { task: 'Türkiye stays until Izmir — rebook new dates', by: 'ASAP', critical: true, done: false, notes: 'Göreme Sep 21–24 booked ✅ · Alaçatı Sep 25–26 · Şirince Sep 27 · Kaş Sep 28–30 · Akyaka Oct 1' },
    { task: 'Crete car in Chania — rented', by: 'Done ✅', critical: false, done: true, notes: 'Chania base — Balos, Elafonisi, Therisos Gorge, Falasarna' },
  ];

  // Diving log
  const diving = [
    { where: 'Coron — WWII Wrecks',      dates: 'Feb 27 – Mar 5', days: 6, notes: 'Japanese warships sunk 1944 — world\'s best wreck diving' },
    { where: 'Cebu / Moalboal',          dates: 'Mar 11–17',    days: 5,  notes: 'Sardine run at Pescador, thresher sharks at Malapascua' },
    { where: 'Raja Ampat',               dates: 'Mar 21–30',    days: 10, notes: 'Mid-season liveaboard — book by Oct 2025' },
    { where: 'Nusa Penida — Crystal Bay',dates: 'Apr 1–5',      days: 4,  notes: 'Reef mantas year-round' },
    { where: 'Komodo',                   dates: 'Apr 7–12',     days: 5, notes: 'Manta Point + drift dives, peak dry season building' },
    { where: 'Koh Tao',                  dates: 'May 15–20',    days: 5,  notes: 'Value diving, whale sharks at Sail Rock' },
    { where: 'Sipadan (optional)',       dates: 'Apr 24–27',    days: 3,  notes: '120 permits/day — book by Nov 2026' },
  ];

  // Budget — full-trip model, USD for two travelers (couple).
  // Per-chapter parts are researched estimates (see notes); the three locked
  // costs came from actual bookings/quotes. Totals are COMPUTED in the UI
  // (BudgetView) from these parts — never hardcoded — so edits stay consistent.
  const budget = {
    currency: 'USD',
    basis: 'couple · 362 days · mid-range with strategic splurges',
    fxBRL: 5.2,
    estimate: 'USD ~97k for two',
    perDay: '~USD 267/day for two',
    inBRL: '~R$251k per person at R$5.20',
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
      { id: 'rio', days: 29, lodging: 1350, food: 1200, transport: 300, activities: 1730, fees: 0, note: 'Airbnb R$7,000 actual (~$1,350, Jun 21–Jul 19) · trail R$4,000 + certs R$5,000 actual' },
      { id: 'cumbuco', days: 29, lodging: 1900, food: 1600, transport: 150, activities: 100, fees: 0, note: 'Airbnb actual $1,900/mo · own kite gear · downwinder support' },
      { id: 'saopaulo', days: 7, lodging: 270, food: 350, transport: 150, activities: 100, fees: 0, note: 'Airbnb R$1,400 actual (~$270, Aug 19–26) · metro/Uber + farewell dinner' },
      { id: 'toronto', days: 5, lodging: 0, food: 450, transport: 150, activities: 50, fees: 0, note: "Friend's place · TTC + Islands ferry · mostly home meals" },
      { id: 'athens', days: 20, lodging: 1700, food: 1700, transport: 1230, activities: 570, fees: 0, note: 'Booked stays avg ~$85/n · 4 ferries €685 actual (~$770) · Chania car ~$240 · Kleftiko ~$260' },
      { id: 'turkey', days: 21, lodging: 1765, food: 1470, transport: 790, activities: 780, fees: 120, note: 'Göreme 3n + Alaçatı 2n + Şirince/Kaş/Akyaka + Istanbul 10n · balloon ~$480 · car 8d ~$450 · e-visa' },
      { id: 'baku', days: 2, lodging: 0, food: 140, transport: 60, activities: 30, fees: 50, note: 'Stopover program — lodging free · ASAN e-visa · walkable old city' },
      { id: 'india', days: 6, lodging: 270, food: 270, transport: 190, activities: 120, fees: 55, note: 'Agra + Delhi trains ~$90 · Taj + forts + boats ~$110 · no Rishikesh leg' },
      { id: 'nepal', days: 20, lodging: 245, food: 245, transport: 100, activities: 2000, fees: 100, note: 'Trek $2,000 locked · KTM/Pokhara hotels + food off-trek · 30d visa' },
      { id: 'japan-autumn', days: 20, lodging: 2530, food: 1800, transport: 550, activities: 150, fees: 0, note: 'Business hotels ~$125/n · Tokyo–Osaka–Kyoto rail · Nikko/Nara day trips' },
      { id: 'korea', days: 24, lodging: 3000, food: 1920, transport: 500, activities: 320, fees: 0, note: '~$125/n hotels · KTX Seoul–Busan + regional buses · DMZ tour' },
      { id: 'taiwan', days: 19, lodging: 1805, food: 1140, transport: 330, activities: 120, fees: 0, note: '~$95/n · Hualien/Alishan trains · Taipei 101 + museums' },
      { id: 'china-1', days: 30, lodging: 2550, food: 1650, transport: 850, activities: 150, fees: 0, note: '~$85/n · Beijing–Shanghai + Shanghai–Shenzhen bullets ~$535 · assumes 30d visa-free entry' },
      { id: 'hk', days: 5, lodging: 750, food: 450, transport: 120, activities: 0, fees: 0, note: '~$150/n · Peak tram + ferries + Lamma · free gardens/markets' },
      { id: 'japan-winter', days: 10, lodging: 1300, food: 950, transport: 260, activities: 1880, fees: 0, note: 'Valley 7d pass ~$930 + full rental ~$950 · Osaka–Hakuba buses' },
      { id: 'philippines', days: 21, lodging: 1155, food: 1050, transport: 550, activities: 1260, fees: 0, note: 'Coron 4 dive-days ~$760 · Malapascua ~$160 · sardines ~$120 · island tours ~$210' },
      { id: 'indonesia-1', days: 14, lodging: 160, food: 160, transport: 1200, activities: 8400, fees: 60, note: 'Liveaboard $8,400 locked · to/from Sorong flights ~$1,200 · VOA' },
      { id: 'indonesia-2', days: 17, lodging: 990, food: 850, transport: 510, activities: 1210, fees: 0, note: 'Komodo 3D2N boat ~$440 + park ~$80 · Komodo dives ~$340 · Penida mantas ~$230 · Batur ~$120' },
      { id: 'borneo', days: 10, lodging: 1020, food: 200, transport: 520, activities: 60, fees: 0, note: 'Kinabatangan 3D2N ~$600 + 2 lodge nights (full board) · Sepilok fees' },
      { id: 'singapore', days: 7, lodging: 980, food: 385, transport: 105, activities: 100, fees: 0, note: '~$140/n · hawker-first food · Gardens domes' },
      { id: 'malaysia', days: 10, lodging: 550, food: 400, transport: 170, activities: 60, fees: 0, note: 'KL + Penang guesthouses · SG→KL bus + ETS rail · Penang Hill + mansions' },
      { id: 'thailand', days: 14, lodging: 770, food: 700, transport: 420, activities: 610, fees: 0, note: 'Koh Tao 3 local dive-days ~$360 + Sail Rock ~$190 · Penang→Koh Tao + Samui transfer · Kanchanaburi' },
      { id: 'china-2', days: 20, lodging: 1400, food: 1000, transport: 980, activities: 330, fees: 0, note: 'BKK→Guilin flight ~$400 · 4 rail legs ~$430 · Zhangjiajie/Tianmen ~$180' },
    ],
    // Between-chapter flights for two (in-chapter transport stays above).
    flights: [
      { route: 'Brazil domestic (GIG→FOR→GRU)', cost: 750, note: 'Estimate' },
      { route: 'GRU → Toronto → Athens', cost: 1700, note: 'Bought ✅ (locked)' },
      { route: 'Athens → Cappadocia via IST', cost: 500, note: 'Bought ✅ (est.)' },
      { route: 'Istanbul → Baku → Delhi', cost: 1000, note: 'Bought ✅ (est. ~$500pp)' },
      { route: 'Varanasi → Kathmandu (direct)', cost: 360, note: '~$180pp Buddha Air' },
      { route: 'Kathmandu/Pokhara → Tokyo', cost: 1100, note: 'Estimate ~$550pp' },
      { route: 'Osaka → Seoul', cost: 400, note: 'Estimate' },
      { route: 'Seoul → Taipei', cost: 500, note: 'Estimate' },
      { route: 'Taipei → Shanghai', cost: 500, note: 'Estimate' },
      { route: 'Hong Kong → Osaka', cost: 400, note: 'Estimate, LCC' },
      { route: 'Tokyo/Nagoya → Manila', cost: 560, note: 'Estimate' },
      { route: 'Manila/Cebu → Sorong', cost: 700, note: 'Estimate' },
      { route: 'Kota Kinabalu → Singapore', cost: 200, note: 'Estimate, AirAsia' },
      { route: "Xi'an → São Paulo (home)", cost: 1400, note: 'Estimate ~$700pp' },
    ],
    extras: [
      { item: 'Health insurance, $150/mo × 12 months (couple)', cost: 1800, note: 'Covers the full trip, both travelers' },
      { item: 'eSIMs + trail/trek sundries', cost: 350, note: '~15 countries + thermals/laundry gaps' },
    ],
    assumptions: [
      'All figures USD for two; mid-range with strategic splurges, researched Oct 2026 prices',
      'China entries assume the 30-day visa-free policy for Brazil holds — otherwise add ~$300 for two visas',
      'Own kite gear in Cumbuco; mask + dive computer owned; snowboard kit rented in Hakuba',
      'Free stays: Toronto (friends) and Azerbaijan (stopover program) — lodging paid elsewhere',
      'Inter-chapter flights are one-way advance fares; peak-season spikes are what the 8% contingency is for',
    ],
    levers: [
      'Diving is ~$12k of the total — fewer Coron/Komodo/Tao dive days saves $1,500+ fast',
      'Japan + Korea are ~$12k combined — business hotels + konbini breakfasts already assumed; ryokan splurge kept to zero',
      'Shoulder-season flights (booked early) and slow-travel lodging (weekly rates) are the two biggest structural savers',
      'Toronto + Azerbaijan avoid lodging costs; monthly rates in Rio/Cumbuco beat nightly prices',
    ],
  };

  // Packing notes
  const packing = [
    { layer: 'Base kit', items: 'Carry-on + 30L backpack only throughout' },
    { layer: 'Japan winter', items: 'Light thermal base layers from Seoul. Rent ALL snowboard kit in Hakuba.' },
    { layer: 'Diving', items: 'Bring personal mask + computer. BCD/reg/wetsuit rented per site.' },
    { layer: 'Nusa Penida', items: 'Reef-safe sunscreen, rash guard, water shoes (rocky entry)' },
    { layer: 'Nepal trek', items: 'Rent trekking poles + sleeping bag liner in Kathmandu' },
  ];

  // Optimal travel windows per chapter — used by the consequence engine.
  // months: 1-indexed array of good months. If a chapter's start month falls
  // outside this range, a season warning is shown in the impact preview.
  const optimalWindows = {
    'rio':          { months: [6, 7, 8, 9],            note: 'Jun–Sep: inverno carioca seco, sem umidade, praias limpas' },
    'cumbuco':      { months: [7, 8, 9, 10, 11],      note: 'Jul–Nov: pico da temporada de vento no Ceará, Jeri em destaque' },
    'saopaulo':     { months: [5, 6, 7, 8, 9],        note: 'Mai–Set: inverno paulistano, menos umidade, agradável para cidade' },
    'toronto':      { months: [7, 8, 9],              note: 'Jul–Sep: warm summer, patios open, Lake Ontario swimmable' },
    'athens':       { months: [5, 6, 9, 10],         note: 'May–Jun and Sep–Oct: ideal temps; Aug is peak heat + crowds' },
    'turkey':       { months: [9, 10],               note: 'Sep–Oct: post-summer, ideal weather, balloon season' },
    'baku':         { months: [10],                  note: 'Oct: mild Caspian autumn, good stopover weather' },
    'nepal':        { months: [10, 11],              note: 'Oct–Nov: post-monsoon, crystalline skies, best trekking' },
    'india':        { months: [10, 11, 12],          note: 'Oct–Dec: post-monsoon, clear skies, India circuit' },
    'japan-autumn': { months: [11],                  note: 'Nov: peak koyo in Kyoto temples, Tofuku-ji, Eikan-do' },
    'korea':        { months: [11, 12, 1],           note: 'Nov–Jan: winter hearth atmosphere, early snow on palaces' },
    'taiwan':       { months: [12, 1],               note: 'Dec–Jan: dry season, NYE fireworks at Taipei 101' },
    'japan-winter': { months: [1, 2],                note: 'Jan–Feb: peak powder season in Hakuba Valley' },
    'china-1':      { months: [1, 2, 3],             note: 'Jan–Feb: quiet Beijing, winter light in Shanghai, mild Shenzhen' },
    'hk':           { months: [1, 2, 3, 10, 11],     note: 'Oct–Mar: cool dry season, comfortable' },
    'philippines':  { months: [2, 3, 4],             note: 'Feb–Apr: Coron + El Nido dry season; Cebu sardine run Mar' },
    'indonesia-1':  { months: [10, 11, 12, 1, 2, 3, 4], note: 'Oct–Apr: Raja Ampat mid-season, best visibility and calm seas' },
    'indonesia-2':  { months: [3, 4, 5, 6, 7, 8],   note: 'Mar–Aug: Nusa Penida mantas year-round; Komodo + Bali dry season building' },
    'borneo':       { months: [3, 4, 5, 6, 7, 8],   note: 'Mar–Aug: dry season, wildlife most active at rivers' },
    'singapore':    { months: [2, 3, 4, 5, 6, 7, 8], note: 'Feb–Aug: relatively drier, pleasant' },
    'malaysia':     { months: [1, 2, 3, 4, 5, 11, 12], note: 'Nov–May: KL and Penang drier side of the year' },
    'thailand':     { months: [4, 5, 6, 7, 8, 9],   note: 'Apr–Sep: dry Gulf coast (Koh Tao); Bangkok manageable in May' },
    'china-2':      { months: [4, 5, 6],             note: 'Apr–Jun: spring mist on karst, pandas active, before summer crowds' },
  };

  return {
    start: START, end: END, totalDays,
    travelers: 2,
    chapterCount,
    chapters,
    bookings, diving, budget, packing,
    REGIONS,
    optimalWindows,
    helpers: { dayCounter, mapsUrl, photoUrl, fmt, dayRange },
  };
})();
