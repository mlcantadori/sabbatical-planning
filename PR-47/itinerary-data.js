// Sabbatical itinerary — single source of truth.
// Drives all three design directions. Read-only at runtime.

window.TRIP = (function () {
  const START = new Date('2026-06-21');
  const END = new Date('2027-06-11');
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

  // ── Trip-progression color: a single ember hue, light at the start ──
  // (Brasil) deepening to dark roast by the end (spring China). Chapters
  // read as one journey; position along the ramp shows time, not identity.
  const CHAPTER_COLORS = {
    'brasil':       '#e4833a',
    'toronto':      '#e27e33',
    'athens':       '#e1792e',
    'turkey':       '#df7428',
    'baku':         '#dd6f22',
    'india':        '#d66b21',
    'nepal':        '#cf6721',
    'china-e1':     '#c76321',
    'hk':           '#c05f20',
    'china-e2':     '#b95b20',
    'malaysia':     '#b2571f',
    'thailand':     '#ab541f',
    'japan':        '#a4501e',
    'indonesia-a':  '#9d4c1e',
    'borneo':       '#96491d',
    'philippines':  '#8f451c',
    'indonesia-b':  '#88421b',
    'singapore':    '#813e1b',
    'china-spring': '#77391a',
    'korea':        '#6d3418',
  };

  // Chapter identity color — falls back to the region accent for ids
  // added later without a palette entry.
  function chapterColor(ch) {
    if (ch && CHAPTER_COLORS[ch.id]) return CHAPTER_COLORS[ch.id];
    const region = ch && REGIONS[ch.region];
    return (region && region.accent) || '#c2693a';
  }

  // Readable text over a chapter color: ink on the light end of the
  // ramp, white everywhere else (the detail pill uses this).
  function contrastText(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#fff';
    const v = [0, 2, 4].map((i) => {
      const c = parseInt(m[1].substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const lum = 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    return lum > 0.3 ? '#2a2118' : '#fff';
  }

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
      photos: ['rio aerial'],
      places: [
        { name: 'Rio de Janeiro', photo: 'copacabana beach', days: 29, query: 'Ipanema, Rio de Janeiro',
          highlights: ['Petrópolis–Teresópolis trail (Serra dos Órgãos)','Diving certifications: Advanced Open Water + NITROX','Fly Rio → Fortaleza Jul 20'] },
        { name: 'Cumbuco', photo: 'cumbuco beach kites', days: 29, query: 'Cumbuco, Caucaia, Ceará',
          highlights: ['Stayed in a condo — home base','Short kitesurfing sessions from the condo','Occasional downwinders from the village center','Fly Fortaleza → São Paulo Aug 19'] },
        { name: 'São Paulo', photo: 'masp sao paulo', days: 7, query: 'Avenida Paulista, São Paulo',
          highlights: ['Farewell BBQ before leaving Brazil','Fly São Paulo → Toronto to open the international leg'] },
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
      photos: ['toronto cn tower'],
      places: [
        { name: 'Toronto', photo: 'toronto distillery', days: 5, query: 'Kensington Market, Toronto',
          highlights: ['Stayed at a friend\'s place — home base, meals together, played with their kids','Toronto Islands ferry — city skyline across Lake Ontario','High Park late-summer picnic','Bike ride around the University of Toronto campus','Fly Toronto → Athens to open Mediterranean chapter'] },
      ],
    },
    {
      id: 'athens', kind: 'chapter', region: 'mediterranean',
      country: 'Greece', flag: '🇬🇷', title: 'Greece',
      start: '2026-09-01', end: '2026-09-21', days: 20,
      theme: 'Athens, Cretan trails, island-hopping the western Cyclades',
      intro: 'Twenty nights arcing south through Greece in September — crowds thinning, sea at its warmest. Athens first, then Crete with a car in Chania, and the ferry chain north through Santorini, Folegandros and Milos.',
      tldr: 'Athens · Chania · Rethymno · Santorini · Folegandros · Milos',
      weather: { hi: 29, lo: 20, label: 'September Aegean, 29°/20°', emoji: '🏛️', rainyDays: 2 },
      photos: ['athens acropolis'],
      places: [
        { name: 'Athens', photo: 'athens monastiraki', days: 4, query: 'Acropolis, Athens, Greece',
          highlights: ['Acropolis + Parthenon — arrive at opening, golden light before 9am','Plaka + Anafiotika — whitewashed Cycladic enclave inside the city','Acropolis Museum','Monastiraki flea market + evening mezedes bars','Philopappos Hill','Pnyx','Ancient Agora + Roman Agora','National Garden','Panathenaic Stadium','Odyssey at the Thision Open Air Cinema','Sep 5: fly Athens → Chania (early flight)'] },
        { name: 'Crete — Chania', photo: 'chania old town', days: 4, query: 'Chania old town, Crete',
          highlights: ['Car base in Chania for west-Crete day trips','Chania city: Venetian harbor + lighthouse, old town alleys','Balos lagoon','Elafonisi pink-sand beach','Therisos Gorge','Falasarna beach','Cretan tavernas: dakos, lamb, raki on the house'] },
        { name: 'Crete — Rethymno', photo: 'rethymno old town', days: 3, query: 'Rethymno old town, Crete',
          highlights: ['Rethymno old town + Venetian harbor walk','Sep 12 seasonal fast ferry Rethymno → Santorini','Plan B if meltemi cancels: car/bus to Heraklion (~1h15) + ferry from there'] },
        { name: 'Santorini', photo: 'santorini oia', days: 2, query: 'Fira, Santorini',
          highlights: ['Lodging outside the caldera','Cliff walk Fira → Imerovigli → Oia along the caldera rim','Local buses + ATV to get around','Sep 14 ferry to Folegandros'] },
        { name: 'Folegandros', photo: 'folegandros chora', days: 2, query: 'Chora, Folegandros',
          highlights: ['The un-hyped bet — 100% walkable island, no car','Chora — one of the prettiest villages in the Cyclades','Panagia church trail at sunset','Agali beach + Katergo by small boat','Local bus ~€2 per hop','Sep 16 short ferry hop to Milos'] },
        { name: 'Milos', photo: 'milos sarakiniko', days: 4, query: 'Sarakiniko, Milos',
          highlights: ['Sarakiniko — white volcanic moonscape over turquoise water','Kleftiko boat day — the chapter splurge (~€240)','ATV/car for ~3 days — Tsigrado, Firopotamos, Papafragas swims','Plaka sunset + Klima\'s painted syrmata boathouses','Sep 20 ferry Milos → Athens (Piraeus)'] },
        { name: 'Athens', photo: 'cape sounion', days: 1, query: 'Piraeus, Athens',
          highlights: ['Buffer night near the airport','Sep 21: fly Athens → Cappadocia via Istanbul'] },
      ],
      decisions: ['Crete replaced Naxos — superlative trails, authentic interior, cheaper; Heraklion dropped, Rethymno gets 3 nights with the direct seasonal ferry','Car rented in Chania (not Rethymno) — west-Crete day trips: Balos, Elafonisi, Therisos Gorge, Falasarna; Rethymno as car-free city base','Visited in Crete: Balos, Elafonisi, Therisos Gorge, Falasarna beach, Chania + Rethymno cities — other spots excluded','Folegandros kept as the un-hyped bet — fully walkable island','Milos→Athens flight discarded; bought ferry + buffer night solves the connection'],
    },
    {
      id: 'turkey', kind: 'chapter', region: 'crossroads',
      country: 'Turkey', flag: '🇹🇷', title: 'Turkey',
      start: '2026-09-21', end: '2026-10-12', days: 21,
      theme: 'Cappadocia valleys, Aegean kitesurfing, Lycian coast, unhurried Istanbul',
      intro: 'Landing from Athens into Göreme Sep 21. Three nights in the valleys (September balloon cancelled — high winds), then Sep 24: fly Kayseri → Izmir for a rental-car loop down the Aegean coast: Alaçatı, Şirince (Ephesus), Kaş and Akyaka. Return the car at Izmir Oct 2, fly to Istanbul and stay until the Oct 12 flight to Baku.',
      tldr: 'Cappadocia (Göreme) · Alaçatı · Şirince · Kaş · Akyaka · Istanbul',
      weather: { hi: 26, lo: 14, label: 'Early autumn, 26°/14°', emoji: '☀️', rainyDays: 3 },
      photos: ['cappadocia balloons'],
      places: [
        { name: 'Cappadocia — Göreme', photo: 'goreme valley', days: 3, query: 'Göreme, Cappadocia, Turkey',
          highlights: ['Sep 21 arrival in Göreme from Athens','Explore the valleys: Rose Valley, Love Valley, Göreme Open Air Museum','Hot air balloon — September flights cancelled (high winds)','Underground city: Kaymakli','Göreme base Sep 21–24','Sep 24: fly Kayseri → Izmir'] },
        { name: 'Alaçatı', photo: 'alacati aegean', days: 3, query: 'Alaçatı, Çeşme, Turkey',
          highlights: ['Land Izmir late Sep 24, drive ~1h to Alaçatı','Relax, recover, explore Alaçatı / Çeşme / Ilıca','Restored stone-house village, windmills, Aegean coastline'] },
        { name: 'Şirince', photo: 'ephesus library', days: 1, query: 'Şirince, Selçuk, Turkey',
          highlights: ['Drive ~1.5–2h from Alaçatı','Visited Ephesus in the morning','Quiet village overnight'] },
        { name: 'Kaş', photo: 'kas harbour', days: 3, query: 'Kaş, Antalya, Turkey',
          highlights: ['Drive ~5h from Şirince/Selçuk','Two full days for Kekova, swimming, Kaputaş, relaxing'] },
        { name: 'Akyaka', photo: 'akyaka azmak', days: 1, query: 'Akyaka, Muğla, Turkey',
          highlights: ['Drive ~2.5–3h from Kaş','Azmak River, slow evening','Oct 2: drive to Izmir (~2.5h), drop the car, fly to Istanbul'] },
        { name: 'Istanbul', photo: 'istanbul mosque', days: 10, query: 'Sultanahmet, Istanbul',
          highlights: ['Oct 2: fly Izmir → Istanbul','Historic peninsula: Hagia Sophia, Topkapi, Sultanahmet without rushing','Asian side — Kadıköy/Moda ferries and market mornings','Bosphorus ferries — the most beautiful commute on Earth','Oct 12: fly Istanbul → Baku'] },
      ],
      decisions: ['Göreme as the Cappadocia base — valleys, balloon logistics, Open Air Museum','Coastal loop by rental car (Alaçatı + Şirince/Ephesus + Kaş + Akyaka) instead of a Kaş turnaround','Şirince picked for Ephesus access + quiet village night; Akyaka breaks the Kaş→Izmir drive','Istanbul as 10-night close (Oct 2–12), then Baku stopover Oct 13 to break IST → DEL'],
    },
    {
      id: 'baku', kind: 'chapter', region: 'crossroads',
      country: 'Azerbaijan', flag: '🇦🇿', title: 'Azerbaijan',
      start: '2026-10-12', end: '2026-10-14', days: 2,
      theme: 'Caspian layover between Istanbul and Delhi',
      intro: 'One full day on the ground (Oct 13) between flights: leave Oct 12, arrive Delhi Oct 14. Flame Towers at dusk, the walled Old City, and the Caspian promenade.',
      tldr: 'Flame Towers · Icherisheher · Caspian Bulvar',
      weather: { hi: 19, lo: 13, label: 'Mild autumn, 19°/13°', emoji: '🔥', rainyDays: 2 },
      photos: ['baku flame towers'],
      places: [
        { name: 'Baku', photo: 'baku old city', days: 2, query: 'Baku, Azerbaijan',
          highlights: ['Oct 12: fly Istanbul → Baku (late arrival)','Oct 13: Flame Towers — Caspian bay panorama at dusk','Icherisheher (Old City) — Maiden Tower + Palace of the Shirvanshahs','Caspian promenade (Bulvar) waterfront walk','Oct 13 (late): fly Baku → Delhi, arrive Oct 14'] },
      ],
    },
    {
      id: 'india', kind: 'chapter', region: 'himalaya',
      country: 'India', flag: '🇮🇳', title: 'India',
      start: '2026-10-14', end: '2026-10-21', days: 7,
      theme: 'Sacred intensity, iconic monuments, Himalayan slow life',
      intro: 'A tight, intentional India: land in Delhi Oct 14 from Baku, day trip to the Taj on Oct 15, early train to Varanasi Oct 17, then Varanasi Oct 17–21 at full spiritual intensity before flying direct to Kathmandu on Oct 21.',
      tldr: 'Delhi · Agra · Varanasi (via Baku)',
      weather: { hi: 30, lo: 16, label: 'Post-monsoon clear, 30°/16°', emoji: '🌅', rainyDays: 1 },
      photos: ['taj mahal sunrise'],
      places: [
        { name: 'Delhi + Agra', photo: 'old delhi jama masjid', days: 3, query: 'Taj Mahal, Agra',
          highlights: ['Land in Delhi Oct 14 from Baku','Oct 15: day trip Delhi → Agra — Taj Mahal at sunrise, Agra Fort, Mehtab Bagh sunset','Oct 17: early train to Varanasi'] },
        { name: 'Varanasi', photo: 'varanasi ghats', days: 4, query: 'Varanasi ghats, India',
          highlights: ['Arrive Oct 17 — Ghats at dawn: rowing on the Ganges in morning mist','Ganga Aarti at dusk — fire, flowers, bells, priests','Manikarnika cremation ghats','Sarnath — where Buddha first taught, 10km out','Chai, silk, wandering the narrow alleys','Oct 21: fly Varanasi → Kathmandu (direct)'] },
      ],
    },
    {
      id: 'nepal', kind: 'chapter', region: 'himalaya',
      country: 'Nepal', flag: '🇳🇵', title: 'Nepal',
      start: '2026-10-21', end: '2026-11-07', days: 17,
      theme: 'Sacred roof of the world, physical peak, elemental beauty',
      intro: 'Late October into November — post-monsoon clarity holds, skies still crystalline, Himalayan views unobstructed 360°. Slightly cooler than October, meaning fewer crowds on the trail and sharper air at altitude.',
      tldr: 'Kathmandu · Pokhara · Annapurna Base Camp trek',
      weather: { hi: 18, lo: 2, label: 'Late post-monsoon, 18°/2°', emoji: '🏔️', rainyDays: 1 },
      photos: ['annapurna himalaya'],
      places: [
        { name: 'Kathmandu', photo: 'kathmandu boudhanath stupa', days: 4, query: 'Kathmandu, Nepal',
          highlights: ['Arrive Oct 21 from Varanasi (direct)','Boudhanath Stupa — one of the largest stupas on Earth','Pashupatinath Temple — sacred Hindu cremation ghats on the Bagmati','Swayambhunath (Monkey Temple)','Oct 24: DWT office, Thamel — gear check, pre-trek briefing, meet guide + porter','ACAP + TIMS via agency (confirm at office)'] },
        { name: 'Annapurna Base Camp Trek', photo: 'everest prayer flags', days: 11, query: 'Annapurna Base Camp, Nepal',
          highlights: ['Oct 25 – Nov 4 with Discovery World Trekking','Oct 25: tourist bus Kathmandu → Pokhara (6–7h); lakeside evening briefing','Oct 26: drive to Tikhedhunga, trek to Ulleri (7km, stone-stair challenge)','Oct 27: Ulleri → Ghorepani (10km, rhododendron forest)','Oct 28: 4am Poon Hill sunrise (3,210m) → Tadapani (11.5km)','Oct 29: Tadapani → Chomrong, sanctuary gateway (10km)','Oct 30: Chomrong → Himalaya via Sinuwa + Bamboo (12km)','Oct 31: Himalaya → ABC (4,130m) via MBC — apex day','Nov 1: ABC → Bamboo descent (14km)','Nov 2: Bamboo → Jhinu Danda hot springs (8.5km)','Nov 3: drive Jhinu → Pokhara, farewell gathering','Nov 4: tourist bus Pokhara → Kathmandu — back to Thamel','Guide + porter per 2 (9kg pp limit — store rest free at DWT office); full-board on trail; bag + down jacket loan','Cash: tips ~$150, snacks/water, showers/WiFi, visa $50pp, heli-evac insurance (mandatory)'] },
        { name: 'Kathmandu', photo: 'patan durbar', days: 2, query: 'Thamel, Kathmandu',
          highlights: ['Nov 5–6: slow Thamel days — rest, massage, express laundry + repack for China','Nov 5: return loaned sleeping bag + down jacket at DWT office, buy down/fleece in Thamel','Nov 6: Boudhanath dawn kora farewell, Patan Durbar Square slow afternoon option, farewell dinner, pack for early departure','Nov 7: fly KTM → Beijing (late-night arrival)'] },
      ],
    },
    {
      id: 'china-e1', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-11-07', end: '2026-11-23', days: 16,
      theme: 'First entry: slow Beijing start (trek recovery), then Jiangnan — canyon, gardens, Suzhou sendoff',
      intro: 'The first mainland admission is a 16-day north-to-Jiangnan run. Land Beijing Nov 7 late night and open slow — two extra hutong days absorb the post-trek fatigue while winter light is crisp (empty Wall, three weather picks instead of one) — then straight south to Huangshan with West Sea Canyon still open, Jiangnan gardens at foliage peak, ending in Suzhou, with Hong Kong next for the visa reset.',
      tldr: 'Beijing · Huangshan · Hangzhou · Suzhou',
      weather: { hi: 12, lo: 0, label: 'North cold → south mild, 12°/0°', emoji: '🍁', rainyDays: 4 },
      photos: ['great wall snow'],
      places: [
        { name: 'Beijing', photo: 'forbidden city', days: 9, query: 'Mutianyu Great Wall, Beijing',
          highlights: ['Arrive Beijing Nov 7, late night — Entry 1 starts Nov 7','Nov 8: sleep in, hutong slow day + Drum/Bell Towers, Peking duck — trek-recovery day','Nov 9 (Mon): Summer Palace + Lama Temple + Jingshan — Forbidden City closed Mondays (Nov 9 + Nov 16)','Great Wall (Mutianyu) — empty, pick the bluest morning','Forbidden City in crisp winter light (closed Mondays — plan Tue–Sun)','Temple of Heaven + 798 Art District','Down/fleece from Kathmandu Thamel','HSR Beijing South → Huangshanbei (~5–5.5h) or direct flight to Tunxi Nov 16'] },
        { name: 'Huangshan', photo: 'huangshan sea of clouds', days: 3, query: 'Huangshan, Anhui',
          highlights: ['Yellow Mountain — autumn foliage + early rime, sea of clouds','West Sea Canyon OPEN (closes Dec–Mar) — November timing is the whole point','Bright Summit sunrise above the cloud sea','Windproof shell + traction spikes in Tangkou if icy','Summit hotel; front-load the canyon days','HSR Huangshanbei → Hangzhou East/West (~1.5h) Nov 19'] },
        { name: 'Hangzhou', photo: 'west lake', days: 2, query: 'West Lake, Hangzhou',
          highlights: ['West Lake in autumn color — Broken Bridge, Su Causeway, golden gingkoes','Lingyin Temple in cedar quiet, Meijiawu tea village','Hefang Street old town','HSR Hangzhou → Suzhou (~1.5h) Nov 21'] },
        { name: 'Suzhou', photo: 'suzhou garden', days: 2, query: 'Humble Administrator\'s Garden, Suzhou',
          highlights: ['Humble Administrator\'s Garden + Lion Grove in autumn color — peak week','Pingjiang Road canals at dusk (skip the Silk Museum for lived-in lanes)','Nov 23: HSR Suzhou → Shanghai Hongqiao (SHA, ~25min direct to terminal) — fly SHA → Hong Kong (visa reset)'] },
      ],
    },
    {
      id: 'hk', kind: 'chapter', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong',
      start: '2026-11-23', end: '2026-11-28', days: 5,
      theme: 'Neon city + dim sum + visa reset, priced before Christmas week',
      intro: 'Five late-November days: dry 20° air, early WinterFest lights, shoulder-season prices — the 30-day visa clock resets for the southern leg, and there is no Taiwan visa errand this time. Five days with friends and a proper chapter, not transit.',
      tldr: 'Victoria Peak · Kowloon neon · Dim sum · Lamma Island',
      weather: { hi: 20, lo: 14, label: 'Pre-Christmas dry, 20°/14°', emoji: '🥟', rainyDays: 1 },
      photos: ['hong kong skyline'],
      places: [
        { name: 'Hong Kong', photo: 'kowloon neon', days: 5, query: 'Victoria Peak, Hong Kong',
          highlights: ['Victoria Peak — harbor panorama at dusk, city grid below','Star Ferry crossing: Kowloon → Central at night','Dim sum yum cha: Tim Ho Wan, Lin Heung, One Dim Sum','Temple Street Night Market — jade, fortune tellers, street food','Nan Lian Garden + Chi Lin Nunnery (free, stunning)','Lamma Island day trip: seafood lunch, car-free village walk','Rest, laundry, planning — HSR Hong Kong → Guangzhou Nov 28 (West Kowloon → Guangzhou South direct, ~1h)'] },
      ],
    },
    {
      id: 'china-e2', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2026-11-28', end: '2026-12-12', days: 14,
      theme: 'Cantonese opening, Pearl Delta friends, Shanghai slow finale',
      intro: 'Second mainland block: 14 days across the Pearl River Delta and Shanghai (with Macau Dec 4–6 acting as a second SAR visa reset, splitting Mainland stays into 6d + 6d inside the 30-day waiver). Cantonese blitz in Guangzhou straight off the Hong Kong HSR, friends days in Shenzhen, Macau on the way east, then six heated Shanghai nights as a slow recharge before flying to Malaysia. Sichuan moves to the spring China chapter, where the light and the food weather are better.',
      tldr: 'Guangzhou · Shenzhen · Macau · Shanghai',
      weather: { hi: 16, lo: 5, label: 'Subtropical south → Yangtze winter, 16°/5°', emoji: '🌉', rainyDays: 5 },
      photos: ['shenzhen night skyline'],
      places: [
        { name: 'Guangzhou', photo: 'guangzhou canton tower', days: 2, query: 'Shamian Island, Guangzhou',
          highlights: ['Nov 28: HSR Hong Kong → Guangzhou South direct — Entry 2 starts','Cantonese food deep-dive — dim sum where it was born (Kaiping cut)','Shamian Island colonial arcades, Chen Clan Academy','Canton Tower at night','Nov 30: HSR Guangzhou → Shenzhen (~30min, dense trunk)'] },
        { name: 'Shenzhen', photo: 'huaqiangbei', days: 4, query: 'Shekou, Shenzhen',
          highlights: ['Four days with friends (Nov 30 – Dec 4 — rendezvous tail)','Huaqiangbei Electronics Market — world\'s largest, floors of components','OCT-LOFT Contemporary Art District','Dapeng Peninsula coastal hike (optional)','Dafen Oil Painting Village (pass-through only)','Ferry Shekou → Macau (~1h) Dec 4 (Mainland exit)'] },
        { name: 'Macau', photo: 'macau st paul', days: 2, query: 'Historic Centre of Macao',
          highlights: ['Ruins of St. Paul\'s, Senado Square, A-Ma Temple','Egg tarts + Macanese dinner','Cotai lights evening option','Dec 6: fly Macau (MFM) → Shanghai (PVG) direct (~2.5h, Air Macau — fresh Mainland entry at PVG)'] },
        { name: 'Shanghai', photo: 'shanghai bund night', days: 6, query: 'The Bund, Shanghai',
          highlights: ['Dec 6: land Shanghai from Macau — 6-night slow recharge before Malaysia','French Concession café season — heated MODERN hotels only (no lane houses, no central heating)','The Bund at night, Yu Garden, Tianzifang, M50 art district','Shanghai Museum East + Pudong skyline walk','Slow neighborhood days, laundry, trip planning, Malaysia entry check','Dec 12: fly Shanghai (PVG) → Kuala Lumpur (KUL) direct (~5h30) — Malaysia begins'] },
      ],
    },
    {
      id: 'malaysia', kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysia',
      start: '2026-12-12', end: '2026-12-26', days: 14,
      theme: 'KL skyline + hawker food, George Town slow chapter, Langkawi island hop',
      intro: 'Fourteen days moving cleanly north up the west coast: Kuala Lumpur for four nights of city spectacle and food, six slow nights in Penang before the peak Christmas school-holiday crush hits its stride, then four nights in Langkawi as a warm staging beach before taking the 90-minute cross-border ferry directly to Koh Lipe in Thailand.',
      tldr: 'Kuala Lumpur · Penang · Langkawi',
      weather: { hi: 32, lo: 24, label: 'KL showers → Penang/Langkawi dry season, 32°/24°', emoji: '🍜', rainyDays: 6 },
      photos: ['petronas towers night'],
      places: [
        { name: 'Kuala Lumpur', photo: 'batu caves rainbow steps', days: 4, query: 'Petronas Twin Towers, KL',
          highlights: ['Dec 12: fly Shanghai → Kuala Lumpur — Jalan Alor night market','Petronas Twin Towers at night from KLCC park','Batu Caves rainbow steps + Hindu temple in the limestone cave','Bukit Bintang, Merdeka 118, coffee and hawker food','Dec 16: ETS train north to Penang (~4h) + ferry to George Town'] },
        { name: 'Penang', photo: 'penang street art', days: 6, query: 'Armenian Street, Georgetown',
          highlights: ['Dec 16–22: George Town slow chapter before the main Christmas rush','Armenian Street murals, shophouse architecture, UNESCO core','Gurney Drive & Chulia Street hawker stalls — char kway teow, asam laksa, cendol','Clan Jetties, Penang Hill funicular, Kek Lok Si, Blue Mansion','Temporary-life chapter: recurring morning kopitiam, walkable heritage lanes','Dec 22: 35-min direct flight Penang → Langkawi (ferry remains suspended)'] },
        { name: 'Langkawi', photo: 'langkawi beach', days: 4, query: 'Pantai Cenang, Langkawi',
          highlights: ['Dec 22–26: Pantai Cenang / Tanjung Rhu base over Christmas','SkyCab cable car + Sky Bridge above the rainforest','Kilim Karst Geoforest mangrove boat tour','Duty-free island sunsets, beach dinners, slow Christmas Day','Dec 26: 90-min cross-border ferry from Telaga Harbour straight to Koh Lipe (Thai immigration on the beach)'] },
      ],
      decisions: ['Right-sized to 14 nights (KL 4n + Penang 6n + Langkawi 4n) so every stop stays sharp and the Andaman islands get a full 18-day run', 'Routed south-to-north (KL → Penang → Langkawi) so Penang happens before the Dec 23–Jan 1 holiday gridlock and Langkawi connects directly to Koh Lipe by 90-min boat', 'Uses the 35-min direct flight between Penang and Langkawi instead of the suspended passenger ferry'],
    },
    {
      id: 'thailand', kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Thailand',
      start: '2026-12-26', end: '2027-01-13', days: 18,
      theme: 'Andaman island-hopping south-to-north: Koh Lipe, Ko Lanta, Railay karst + Bangkok finale',
      intro: 'Eighteen days in peak Andaman dry season with zero backtracking: step off the 90-minute Langkawi ferry onto Koh Lipe\'s turquoise beaches, hop north by speedboat to Ko Lanta for a relaxed New Year\'s Eve and six unhurried beach days, continue to Railay\'s limestone cliffs, then finish with four proper nights in Bangkok before flying direct to Osaka. The two long hops sit on Dec 26 and Dec 29 — deliberately early enough that a weather cancellation still leaves you in Ko Lanta before New Year\'s Eve.',
      tldr: 'Koh Lipe · Ko Lanta · Railay/Krabi · Bangkok',
      weather: { hi: 31, lo: 23, label: 'Andaman peak dry season, 31°/23°', emoji: '🏝️', rainyDays: 2 },
      photos: ['railay krabi'],
      places: [
        { name: 'Koh Lipe', photo: 'koh lipe beach', days: 3, query: 'Sunrise Beach, Koh Lipe, Thailand',
          highlights: ['Dec 26–29: arrive by 90-min ferry from Langkawi — stamp into Thailand right on the sand','Sunrise Beach & Pattaya Beach — the clearest turquoise water in Thailand','One longtail snorkel day around Koh Adang, Koh Rawi and Jabang soft-coral pinnacles','Car-free Walking Street, grilled seafood on the beach, sunset at Sunset Beach','Three nights is deliberate: Lipe is only ~3km², and the extra days are worth more on Lanta','Dec 29: speedboat north up the Andaman chain to Ko Lanta (~3h)'] },
        { name: 'Ko Lanta', photo: 'koh lanta beach', days: 7, query: 'Ko Lanta, Krabi, Thailand',
          highlights: ['Dec 29 – Jan 5: seven nights on the Andaman\'s most laid-back big island — the slow chapter of the beach run','Dec 29 arrival leaves two clear days to settle before NYE (and a buffer if the speedboat is weather-cancelled)','NYE Dec 31 on Long Beach / Klong Nin — bonfires and lanterns without Phuket madness (check whether your resort forces a gala dinner)','Koh Rok & Koh Haa day trip — crystal water, reef sharks, coral gardens','Moped to Mu Ko Lanta National Park lighthouse and the Old Town stilt houses; cooking class on a wet afternoon','Jan 5: ferry/transfer north to Railay (~2h)'] },
        { name: 'Railay + Krabi', photo: 'railay krabi', days: 4, query: 'Railay Beach, Krabi, Thailand',
          highlights: ['Jan 5–9: towering limestone karst and Phra Nang cave beach — a boat-access peninsula that empties out after 16:00','Hong Islands longtail day at dawn, before the Ao Nang tour boats arrive','Sea kayaking under the karst overhangs, viewpoint hike, or a beginner rock-climbing half-day','Railay East is the value side; Railay West is for the sunset','Jan 9: fly Krabi (KBV) → Bangkok (~1h20)'] },
        { name: 'Bangkok', photo: 'bangkok wat arun', days: 4, query: 'Wat Pho, Bangkok',
          highlights: ['Jan 9–13: one consolidated 4-night city stay at the end (no split airport buffers)','Chatuchak Weekend Market lands on Sat–Sun Jan 9–10 — the reason this slot is here','Wat Pho, Wat Arun at sunset, and khlong canal boats','Yaowarat (Chinatown) street food crawl, Ari/Talad Noi cafés, Song Wat Road','Thai massages, laundry, and a winter-gear check before Japan','Jan 13: fly Bangkok (BKK) → Osaka (KIX) direct — Japan begins'] },
      ],
      decisions: ['Enters Thailand by 90-min ferry from Langkawi to Koh Lipe, threading the Andaman islands continuously south-to-north (Lipe → Lanta → Railay) with zero airport backtracking', 'Koh Lipe trimmed to 3n (it is a 3km² island) and the two freed nights given to Ko Lanta (7n): the strongest slow-beach base, with a Dec 29 arrival that de-risks NYE against a weather-cancelled speedboat', 'Railay cut from 5n to 4n — it is a small peninsula that fills with day-trippers midday; four nights covers Hong Islands, kayaking and a climb without overstaying', 'Consolidates Bangkok into one 4-night stay at the end (Jan 9–13) instead of burning days on two separate transit buffers', '14 full Andaman beach nights in peak January dry season makes a second May Gulf coast chapter unnecessary after Raja Ampat, Palawan, and Komodo'],
    },
    {
      id: 'japan', kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan',
      start: '2027-01-13', end: '2027-02-24', days: 42,
      theme: 'Empty temples, snow villages, blue-sky Mt. Fuji + two powder bases',
      intro: 'One fused six-week winter chapter (90-day visa-free for BR ePassports): land at Kansai directly from Bangkok, open in Kyoto for empty winter temples and early plum, Osaka for food and Nara, then head into the snowy Hida Alps (Takayama + Shirakawa-go) and across to Hakone/Kawaguchiko for Mt. Fuji in peak January blue skies before Tokyo absorbs CNY week (Feb 5–12). Close with two back-to-back snow bases — Nozawa Onsen (5n) and Myoko Kogen + Madarao (9n, Feb 14–23) — with 13–15m of Sea of Japan powder and a fraction of Hakuba\'s crowds.',
      tldr: 'Kyoto · Osaka · Takayama/Shirakawa-go · Hakone/Mt. Fuji · Tokyo (CNY) · Nozawa + Myoko powder',
      weather: { hi: 8, lo: -3, label: 'Crisp sunny Pacific + deep Alps powder, 8°/-3°', emoji: '🏂', rainyDays: 6 },
      photos: ['fushimi inari'],
      places: [
        { name: 'Kyoto', photo: 'kyoto autumn maple', days: 8, query: 'Kitano Tenmangu, Kyoto',
          highlights: ['Jan 13: fly Bangkok (BKK) → Osaka (KIX) direct, Haruka express straight to Kyoto','Empty winter temples — Fushimi Inari at dawn, no crowds','Early plum blossoms at Kitano Tenmangu (late Jan on)','Arashiyama bamboo grove + Tenryu-ji','Philosopher\'s Path in winter quiet, Nishiki Market','Temporary-life chapter: recurring café, structured mornings','Jan 21: train to Osaka (~30min)'] },
        { name: 'Osaka', photo: 'osaka dotonbori', days: 4, query: 'Dotonbori, Osaka',
          highlights: ['Jan 21–25: winter crab season in Dotonbori & Shinsekai kushikatsu','Kuromon Ichiba Market','Osaka Castle grounds','Nara day trip — deer, Todai-ji','Jan 25: Hida Wide View limited express to Takayama (~3.5h; point-to-point tickets beat the 21-day JR Pass)'] },
        { name: 'Takayama + Shirakawa-go', photo: 'shirakawa-go snow', days: 3, query: 'Shirakawa-go, Gifu, Japan',
          highlights: ['Jan 25–28: Shirakawa-go gassho-zukuri farmhouses under deep snow — the winter postcard','Takayama Sanmachi Suji old town, sake breweries, Miyagawa morning market, Hida beef','Hida Folk Village & traditional ryokan/onsen night','Jan 28: Hida train + Shinkansen via Nagoya/Odawara to Hakone / Mt. Fuji'] },
        { name: 'Hakone + Mt. Fuji', photo: 'mount fuji winter', days: 3, query: 'Lake Kawaguchiko, Yamanashi, Japan',
          highlights: ['Jan 28–31: replaces sleety coastal Kanazawa with the Pacific side\'s clearest blue-sky month (~80% winter Fuji visibility)','Lake Kawaguchiko & Chureito Pagoda views of snow-capped Mt. Fuji','Hakone Open-Air Museum, Lake Ashi pirate ship, Owakudani volcanic valley','Onsen baths with direct Mt. Fuji views','Jan 31: Romancecar / highway bus into Tokyo (~1.5–2h)'] },
        { name: 'Tokyo', photo: 'tokyo shimokitazawa', days: 9, query: 'Shimokitazawa, Tokyo',
          highlights: ['Jan 31–Feb 9: Shimokitazawa vintage shops + live music','Yanaka old-Tokyo lanes','Museums + neighborhoods through the CNY week (Feb 6; big city absorbs crowds)','Tsukiji outer market breakfast','Kamakura/Enoshima day trip','Feb 9: Hokuriku Shinkansen to Iiyama + bus → Nozawa Onsen (~2.5h door-to-door)'] },
        { name: 'Nozawa Onsen', photo: 'nozawa onsen snow', days: 5, query: 'Nozawa Onsen, Nagano, Japan',
          highlights: ['Feb 9–14: classic onsen village with 13 free public sotoyu baths and a walkable base','10–12m annual snowfall; wide beginner/intermediate slopes and tree runs','Three to four ride days plus a rest day — no need to force powder every morning','Feb 14: bus/train via Nagano → Myoko Kogen (~2h)'] },
        { name: 'Myoko Kogen + Madarao', photo: 'hakuba snowboarding', days: 9, query: 'Akakura Onsen, Myoko, Niigata, Japan',
          highlights: ['Feb 14–23: Akakura Onsen walkable village base — 13–15m annual snowfall, post-CNY, fraction of Hakuba\'s foreign crowds','Beginner/intermediate friendly: wide, gentle green/blue progression slopes at Akakura Onsen (no scary narrow cat-tracks) + English snowboard lessons at Myoko Snowsports','Advanced freeride & tree runs at Madarao (famous powder bowls/gladed trees) + Seki Onsen','Rent ALL equipment + outerwear locally (boots, board, jacket, helmet — reserve sizes ahead)','Ride Mon Feb 15 – Fri Feb 19 (5 empty weekdays); schedule the 2 onsen rest days on Sat Feb 20 – Sun Feb 21 to dodge the Feb 23 Emperor\'s Birthday domestic weekend surge','Traditional onsen baths, izakaya nights, ramen in a classic Japanese snow town'] },
        { name: 'Tokyo', days: 1, query: 'Tokyo Station, Japan',
          highlights: ['Feb 23: Shinkansen Myoko/Nagano → Tokyo','Fly Tokyo → Jakarta Feb 24 — Indonesia begins (direct, 30-day free entry)'] },
      ],
      decisions: ['Replaces gray, sleety late-January Kanazawa with Hakone + Mt. Fuji (Kawaguchiko) — late January has the clearest cobalt-blue skies of the year on the Pacific side (~80% Fuji visibility), while keeping Takayama + Shirakawa-go for the deep-snow gassho villages', 'Two snow bases instead of one: Nozawa Feb 9–14 for onsen-village rhythm and beginner/intermediate slopes, then Myoko Feb 14–23 for the booked week and Madarao tree runs', 'CNY Feb 6 lands in Tokyo by design — the big city absorbs the domestic travel surge; Myoko starts post-CNY', 'Point-to-point Shinkansen tickets only; a 21-day JR Pass would waste money on this slower, base-heavy route'],
    },
    {
      id: 'indonesia-a', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-02-24', end: '2027-03-21', days: 25,
      theme: 'Java temples in Ramadan calm, Bali staging, then the best diving on Earth',
      intro: 'Fly in from Tokyo Feb 24 on the 30-day free entry (exit Mar 21, ~26 days used). Ramadan-quiet Java — Borobudur without crowds, night markets after dark — then a Nyepi silent day in Ubud and a domestic hop to Sorong Mar 10. Board Mar 11 with zero international stress.',
      tldr: 'Jakarta · Yogyakarta · Ubud · Raja Ampat liveaboard',
      weather: { hi: 32, lo: 25, label: 'Wet-tail Java/Bali → Raja mid-season, 32°/25°', emoji: '🐠', rainyDays: 6 },
      photos: ['raja ampat aerial wayag'],
      places: [
        { name: 'Jakarta', photo: 'jakarta monas', days: 2, query: 'Jakarta, Indonesia',
          highlights: ['Feb 24: land Jakarta from Tokyo direct — 30-day free entry starts (exit Mar 21)','Monas + Kota Tua old town, Ramadan-evening food markets','Executive train or 1h flight onward to Yogyakarta'] },
        { name: 'Yogyakarta', photo: 'borobudur sunrise', days: 4, query: 'Borobudur, Yogyakarta',
          highlights: ['Borobudur sunrise — Ramadan-quiet','Prambanan + Kraton + Malioboro','Kampung Ramadan night market after dark','Daytime food via malls/hotels (warungs curtained); earplugs for 3am sahur drums','Fly Yogyakarta → Bali by Mar 2 (pre-mudik)'] },
        { name: 'Ubud', photo: 'bali ubud rice terrace', days: 8, query: 'Ubud, Bali',
          highlights: ['Mar 2–9: slow staging before the liveaboard','Tegallalang rice terraces at dawn, Tirta Empul water temple','Monkey Forest, massages — no agenda','Mar 8: Nyepi silent day — hotel-only rest day','Gear check; Mar 10: fly Bali → Sorong via Makassar'] },
        { name: 'Sorong', days: 1, query: 'Sorong, West Papua',
          highlights: ['Transit day: Mar 10 Bali → Sorong domestic — already in-country, no immigration stress','Buffer night in Sorong before the Mar 11 boarding'] },
        { name: 'Raja Ampat Liveaboard', photo: 'manta ray cleaning station', days: 10, query: 'Wayag, Raja Ampat',
          highlights: ['Mar 11–20: Wayag — postcard karst islands, kayak + hike viewpoint','Cape Kri — world record fish count dive site','Manta Sandy — manta ray cleaning station','Melissa\'s Garden — pristine hard coral','Pianemo — smaller Wayag, equally dramatic, fewer boats','Blue Water Mantas — oceanic, 6m wingspan','Wobbegongs, walking sharks, pygmy seahorses, nudibranchs'] },
      ],
    },
    {
      id: 'borneo', kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysia',
      start: '2027-03-21', end: '2027-03-31', days: 10,
      theme: 'Indonesia visa reset + wildlife chapter',
      intro: 'Fly in from Sorong Mar 21 — reef→rainforest novelty switch right after the apex, and the exit resets Indonesia\'s clock for the second stay. Proboscis monkeys, pygmy elephants bathing at dawn. Late March sits in the Mar–May prime wildlife window.',
      tldr: 'KK · Sepilok · Kinabatangan River · Manila next',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧', rainyDays: 6 },
      photos: ['borneo orangutan'],
      places: [
        { name: 'Kota Kinabalu', photo: 'kk city mosque', days: 2, query: 'Kota Kinabalu, Sabah',
          highlights: ['Mar 21: arrive from Sorong, waterfront sunset, rest','Filipino Night Market','Post-liveaboard slow days'] },
        { name: 'Sepilok + Sandakan', photo: 'sepilok', days: 1, query: 'Sepilok Orangutan Centre',
          highlights: ['Sepilok Orangutan Rehabilitation Centre — morning feeding platform','Bornean Sun Bear Conservation Centre (adjacent)','Transfer same day to Kinabatangan'] },
        { name: 'Kinabatangan River', photo: 'kinabatangan river', days: 5, query: 'Kinabatangan River, Sabah',
          highlights: ['Proboscis monkeys — endemic to Borneo, bizarre bulbous noses','Pygmy elephants bathing in the river at dawn — unmissable','Hornbills, kingfishers, monitor lizards, crocodiles','Fireflies illuminating the riverbank at night','Jungle lodges — wake to gibbons calling','Mar 26 Good Friday is a Sabah holiday — lodges operate'] },
        { name: 'Kota Kinabalu', photo: 'kk city mosque', days: 2, query: 'Tunku Abdul Rahman Park, Kota Kinabalu',
          highlights: ['Tunku Abdul Rahman Marine Park snorkel day trip','Waterfront goodbye meal — fresh seafood','Fly Kota Kinabalu → Manila Mar 31 (via Kuala Lumpur) — Philippines next'] },
      ],
    },
    {
      id: 'philippines', kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-03-31', end: '2027-04-14', days: 14,
      theme: 'Post-Easter Palawan: wrecks at peak vis, glassy lagoons, sardines',
      intro: 'Arrive from Borneo Mar 31 into the post-Holy Week lull — the single best Palawan window: flat seas, 20m+ visibility, crowds gone. Coron wrecks first (nitrogen-correct), El Nido lagoons, Moalboal sardines, then hop to Bali Apr 14. Fourteen days inside the 30-day visa-free.',
      tldr: 'Manila · Coron · El Nido · Cebu/Moalboal (post-Easter)',
      weather: { hi: 33, lo: 25, label: 'Hot dry peak, 33°/25°', emoji: '🏝️', rainyDays: 1 },
      photos: ['el nido lagoon'],
      places: [
        { name: 'Manila', photo: 'intramuros manila', days: 2, query: 'Intramuros, Manila',
          highlights: ['Mar 31–Apr 2: arrive from Kota Kinabalu, rest, dive-gear prep','Intramuros — walled Spanish colonial city','Fly Manila → Coron (Busuanga)'] },
        { name: 'Coron', photo: 'coron kayangan lake', days: 5, query: 'Coron, Palawan, Philippines',
          highlights: ['Japanese WWII wrecks — Okikawa Maru, Irako, Akitsushima (sunk 1944)','Day 1 check-dive first, deep wrecks after','Kayangan Lake — crystal-clear inland lake framed by karst','Barracuda Lake — thermocline diving (hot/cold layers)','CYC Beach + Twin Lagoon by banca boat'] },
        { name: 'El Nido', photo: 'el nido big lagoon', days: 4, query: 'El Nido, Palawan',
          highlights: ['Island-hopping: Big + Small Lagoons, Cadlao Island','Second lagoon day — glassy-seas bonus + weather buffer','Nacpan Beach — empty twin beach','Limestone cliffs, turquoise shallows, snorkeling'] },
        { name: 'Cebu / Moalboal', photo: 'moalboal sardine run', days: 2, query: 'Moalboal, Cebu, Philippines',
          highlights: ['Sardine Run — millions of sardines schooling at Pescador Island (accessible from shore)','Turtle Beach — sea turtles feeding right off the beach','Malapascua thresher dropped — Raja already delivered the apex','Kawasan Falls canyoneering (if time)'] },
        { name: 'Denpasar', days: 1, query: 'Ngurah Rai Airport, Bali',
          highlights: ['Transit day: Apr 14 Cebu → Denpasar (daily, easy)','Indonesia Entry 2 starts ~Apr 14 — onward ticket to Singapore May 1 in hand'] },
      ],
    },
    {
      id: 'indonesia-b', kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia',
      start: '2027-04-14', end: '2027-05-01', days: 17,
      theme: 'Cliffs, dragons, drift dives, volcano — second stay',
      intro: 'Second stay (17 days — fresh visa-free entry from Apr 14, no extension needed). Pick up where Raja left off: Nusa Penida mantas, Komodo dragons and drift dives, then Bali rice terraces and a volcano at 3am before the hop to Singapore May 1.',
      tldr: 'Nusa Penida · Komodo · Batur',
      weather: { hi: 32, lo: 24, label: 'Dry season building, 32°/24°', emoji: '🐉', rainyDays: 4 },
      photos: ['kelingking beach trex'],
      places: [
        { name: 'Nusa Penida', photo: 'broken beach', days: 4, query: 'Kelingking Beach, Nusa Penida',
          highlights: ['Apr 14: land Bali from Cebu (Entry 2 starts); fast boat Sanur → Penida Apr 15','Kelingking Beach — T-Rex cliff, most photographed in the Bali region','Angel\'s Billabong + Broken Beach — natural infinity pool carved into clifftop','Crystal Bay — reef mantas year-round (early morning dive)','Atuh Beach — remote east coast, dramatic rock formations','Scooter rental for full freedom'] },
        { name: 'Komodo', photo: 'komodo dragon', days: 7, query: 'Komodo National Park',
          highlights: ['Apr 18: fly Bali → Labuan Bajo — dramatic harbor, wooden phinisi boats','Manta Point — oceanic mantas in strong current','Crystal Rock + Castle Rock — world-class drift dives','Pink Beach — crushed red coral, excellent snorkeling','Batu Bolong — coral so dense no bare rock visible','Komodo dragons with ranger at Rinca or Komodo Island','Padar Island sunrise hike — three colored bays stretching below'] },
        { name: 'Bali + Volcano', photo: 'mount batur sunrise', days: 6, query: 'Ubud, Bali',
          highlights: ['Apr 25: fly Labuan Bajo → Bali','Tanah Lot sunset temple on a sea rock','Seminyak / Canggu beach club final evening','Mount Batur: 3am departure, 2h hike to crater rim at 1,717m','Sunrise over the caldera and crater lake — fly Bali → Singapore May 1'] },
      ],
    },
    {
      id: 'singapore', kind: 'chapter', region: 'isthmus',
      country: 'Singapore', flag: '🇸🇬', title: 'Singapore',
      start: '2027-05-01', end: '2027-05-06', days: 5,
      theme: 'World-class food, modern wonder, city recharge',
      intro: 'Effective recharge hub: clean, organized, excellent food infrastructure, everything works.',
      tldr: 'Hawker centres · Gardens by the Bay · Marina Bay',
      weather: { hi: 31, lo: 25, label: 'Hot + humid', emoji: '🌳', rainyDays: 4 },
      photos: ['gardens by the bay supertree'],
      places: [
        { name: 'Singapore', photo: 'marina bay sands night', days: 5, query: 'Marina Bay, Singapore',
          highlights: ['May 1–6: sits out China\'s May 1–5 Labor Day Golden Week in comfort','Maxwell, Lau Pa Sat, Old Airport Road hawker centres — best in the world','Gardens by the Bay — Supertree Grove at night','Marina Bay Sands observation deck','Chinatown, Little India, Haji Lane','National Gallery Singapore + Changi Jewel waterfall walk'] },
      ],
    },
    {
      id: 'china-spring', kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China',
      start: '2027-05-06', end: '2027-05-28', days: 22,
      theme: 'May sweet spot: Xi\'an walls, Sichuan pandas + hotpot, Avatar pillars & lantern towns',
      intro: 'Twenty-two days in China\'s May sweet spot: enter on May 6 — the day after China\'s May 1–5 Labor Day Golden Week clears out — and three full weeks before mid-June\'s heavy Meiyu plum rains hit Sichuan and Hunan. Open in Xi\'an under crisp spring skies, ride the high-speed rail into Chengdu and Chongqing for pandas and Yangtze nightscapes at 24–26°C instead of June steam, then cross into Zhangjiajie\'s sandstone pillars and Fenghuang\'s river lanterns before flying from Changsha to Korea.',
      tldr: 'Xi\'an · Chengdu · Chongqing · Zhangjiajie · Fenghuang',
      weather: { hi: 26, lo: 17, label: 'Prime late spring, 26°/17° (pre-plum-rain)', emoji: '🐉', rainyDays: 6 },
      photos: ['xian terracotta warriors'],
      places: [
        { name: 'Xi\'an', photo: 'xian city wall', days: 5, query: 'Terracotta Warriors, Xi\'an',
          highlights: ['May 6: fly Singapore → Xi\'an direct (~5.5h) — arrives right after May Day Golden Week ends','Terracotta Warriors — indoor museum, book morning slot','Cycle the Xi\'an city walls in 24°C May sunshine','Muslim Quarter — lamb skewers, biangbiang noodles, pomegranate juice','Giant Wild Goose Pagoda & Tang Paradise night walk','Huashan day-trip option — granite peaks and plank walks','May 11: HSR Xi\'an → Chengdu (~3.5h)'] },
        { name: 'Chengdu', photo: 'chengdu panda', days: 5, query: 'Chengdu Panda Base',
          highlights: ['May 11–16: giant panda base at 07:30 opening — cool May mornings, active bears','Sanxingdui day trip — bronze masks, 18-min HSR + taxi','Leshan Giant Buddha day trip — 1h HSR from Chengdu South','Jinli Ancient Street (90-min evening only), Kuanzhai Alley','People\'s Park teahouse + Wenshu Monastery slow day + Sichuan hotpot rounds','May 16: HSR Chengdu → Chongqing (~1h)'] },
        { name: 'Chongqing', photo: 'chongqing cyberpunk night', days: 4, query: 'Chongqing, China',
          highlights: ['May 16–20: cyberpunk mountain megacity in mild 26°C spring weather (before the June furnace)','Hongyadong stilted riverfront — view from Qiansimen Bridge at night, don\'t queue inside','Yangtze River cable car, Liziba monorail-through-building, Ciqikou old town','Hotpot capital — mandatory multiple visits','May 20: direct HSR Chongqing → Zhangjiajie (~2–2.5h)'] },
        { name: 'Zhangjiajie + Tianmen', photo: 'zhangjiajie avatar pillars', days: 4, query: 'Zhangjiajie National Park',
          highlights: ['May 20–24: Avatar Mountains in late-spring green — 3+ weeks before mid-June\'s heavy Meiyu plum rains','Yuanjiajie, Tianzi Mountain & Golden Whip Stream in comfortable hiking weather','Tianmen Mountain cable car + 999 steps (Stairway to Heaven)','Bailong Elevator + Grand Canyon Glass Bridge','May 24: HSR/bus to Fenghuang via Furong (~1–2h)'] },
        { name: 'Fenghuang + Furong', photo: 'fenghuang riverside', days: 3, query: 'Fenghuang Ancient Town, China',
          highlights: ['May 24–27: Furong waterfall town — river pouring through the Tujia stilt houses','Fenghuang riverside old town — lanterns over the Tuo River before summer flood season','Hong Bridge + diaojiaolou houses at dusk','Slow recovery days after the Zhangjiajie stairs','May 27: HSR to Changsha (~2h)'] },
        { name: 'Changsha (buffer)', days: 1, query: 'Changsha, China',
          highlights: ['May 27–28: laundry, pack, last Hunan meal','May 28: fly Changsha (CSX) → Seoul / Jeju — South Korea finale begins'] },
      ],
      decisions: ['Moved from June into May 6–28 by dropping the redundant May Thailand Gulf chapter and placing China before Korea', 'Enters May 6 (the exact day after China\'s May 1–5 Labor Day Golden Week ends) and exits May 28 (12 days before the June 9 Dragon Boat Festival)', 'Hits Chengdu, Chongqing, Zhangjiajie, and Fenghuang in May (23–26°C, ~40% less rain than mid-June\'s Meiyu plum-rain flood peak)', 'Chongqing → Zhangjiajie → Fenghuang → Changsha runs on fast direct HSR, with Guilin/Longji permanently dropped'],
    },
    {
      id: 'korea', kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2027-05-28', end: '2027-06-11', days: 14,
      theme: 'Sunny early-summer finale: Jeju volcanic coast, Busan sea, Gyeongju + Seoul',
      intro: 'Fourteen days to close the sabbatical in sunny, pre-monsoon weather (24–26°C, two full weeks before Korea\'s late-June Jangma rains): start in the south on Jeju Island, hop to Busan\'s coast and Gyeongju\'s royal tombs, then finish with six nights in Seoul so the long-haul flight home to Brazil departs directly from Incheon with zero last-day domestic transit stress.',
      tldr: 'Jeju · Busan · Gyeongju · Seoul',
      weather: { hi: 25, lo: 16, label: 'Sunny late spring / early summer, 25°/16°', emoji: '🌸', rainyDays: 5 },
      photos: ['korean street food'],
      places: [
        { name: 'Jeju', photo: 'jeju yongmeori', days: 3, query: 'Jeju Island, South Korea',
          highlights: ['May 28–31: fly Changsha → Jeju (via Seoul/Shanghai) — open on Korea\'s volcanic island','Yongmeori Coast + Sanbangsan cliffs in late-May sun','Seongsan Ilchulbong sunrise crater; Udo island ferry','Hallasan lower trails, Jusangjeolli lava columns & green tea fields','May 31: 50-min flight Jeju → Busan'] },
        { name: 'Busan', photo: 'busan gamcheon', days: 3, query: 'Gamcheon Culture Village, Busan',
          highlights: ['May 31 – Jun 3: Gamcheon hillside village & Haeundae / Gwangalli beach walks in warm 24°C weather','Jagalchi Fish Market + BIFF Square street food','Haedong Yonggungsa seaside temple at dawn','Gwangalli Bridge lit up at night','Jun 3: 35-min train north to Gyeongju'] },
        { name: 'Gyeongju', photo: 'gyeongju temple', days: 2, query: 'Bulguksa Temple, Gyeongju',
          highlights: ['Jun 3–5: Bulguksa Temple (UNESCO) + Seokguram Grotto','Daereungwon Tumuli Park burial mounds & Hwangridan-gil cafés','Wolji (Anapji) Pond + Woljeonggyo Bridge lit up at dusk','Jun 5: KTX north to Seoul (~2h)'] },
        { name: 'Seoul', photo: 'korean street food', days: 6, query: 'Bukchon Hanok Village, Seoul',
          highlights: ['Jun 5–11: six final nights of the sabbatical in Seoul — long daylight, green palaces','Gyeongbokgung (closed Tue) + Changdeokgung Secret Garden (closed Mon)','Bukchon Hanok Village mornings; Insadong, Ikseon-dong & Seongsu-dong cafés','Gwangjang Market + Euljiro pocha/BBQ nights + Han River sunset picnic','DMZ day trip (Tue–Fri) or Suwon Hwaseong fortress wall walk','Jun 11: AREX train to Seoul Incheon (ICN) → fly home to São Paulo'] },
      ],
      decisions: ['Placed May 28 – Jun 11 right after China Spring: Korea stays warm, dry, and sunny (24–26°C) until the Jangma monsoon arrives in late June', 'Routed south-to-north (Jeju → Busan → Gyeongju → Seoul) so the last 6 nights of the entire trip are in Seoul, giving a stress-free departure from Incheon (ICN) megahub to São Paulo'],
    },
  ];

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
    { task: 'Flights Nov–Jun + China domestic hops', by: 'ASAP — Dec 12 run', critical: true, notes: 'KTM→PEK Nov 7 · PEK→Huangshan HSR/flight Nov 16 · Huangshan→HGH HSR Nov 19 · SUZ→SHA→HKG Nov 23 · HK→CAN HSR Nov 28 · CAN→SZX HSR Nov 30 · SZX→Macau ferry Dec 4 · MFM→PVG flight Dec 6 · PVG→KUL direct Dec 12 · PEN→LGK flight Dec 22 · LGK→Koh Lipe ferry Dec 26 · KBV→BKK flight Jan 9 · BKK→KIX Jan 13 · SIN→XIY May 6 · CSX→CJU/ICN May 28 · ICN→home Jun 11' },
    { task: 'Korea K-ETA (2 pax)', by: 'By ~May 20 2027', critical: true, notes: 'File online ≥1 week before May 28; Brazil visa-free but not K-ETA-exempt' },
    { task: 'Annapurna trek balance + briefing', by: 'Oct 24 at DWT office, Thamel', critical: true, notes: 'Pay $1,296 balance, gear check, meet guide/porter; ACAP/TIMS via agency — confirm; 9kg pp porter limit' },
    { task: 'Kinabatangan river lodge',  by: 'By Feb 2027', critical: false, notes: 'Book 2–3 months ahead; good lodges fill in dry season' },
    // ── Confirmed — Greece 100% ✅ ──
    { task: 'Greece stays — all 7 booked',  by: 'Done ✅', critical: false, done: true, notes: 'Athens 1–5 · Chania 5–9 · Rethymno 9–12 · Santorini 12–14 · Folegandros 14–16 · Milos 16–20 (checkout adjusted 22→20) · Athens 20–21' },
    { task: 'Greece ferries — all 4 bought', by: 'Done ✅', critical: false, done: true, notes: 'Rethymno→Santorini Sep 12 · Santorini→Folegandros Sep 14 · Folegandros→Milos Sep 16 · Milos→Athens Sep 20' },
    { task: 'Flights: Athens→Chania + Athens→Cappadocia', by: 'Done ✅', critical: false, done: true, notes: 'Sep 5 06h45 to Chania · Sep 21 to Cappadocia via IST, single Turkish ticket' },
    // ── Confirmed — Türkiye + Baku + DEL ✅ ──
    { task: 'Cappadocia balloon — Sep 22 or 23', by: 'Done ✅', critical: false, done: true, notes: 'Royal Balloon / Butterfly Balloons — cancelled (bad weather), full refund received' },
    { task: 'Flights until DEL — recheck', by: 'Done except ADB→IST', critical: true, done: false, notes: 'ASR→ADB Sep 24 22:50 bought ✅ · ADB→IST Oct 2, 19:45, TO BUY · IST→GYD Oct 12 · GYD→DEL Oct 14' },
    { task: 'Türkiye stays until Izmir — rebook new dates', by: 'ASAP', critical: true, done: false, notes: 'Göreme Sep 21–24 booked ✅ · Alaçatı Sep 25–26 · Şirince Sep 27 · Kaş Sep 28–30 · Akyaka Oct 1' },
    { task: 'Crete car in Chania — rented', by: 'Done ✅', critical: false, done: true, notes: 'Chania base — Balos, Elafonisi, Therisos Gorge, Falasarna' },
  ];

  // Budget — full-trip model, USD for two travelers (couple).
  // Per-chapter parts are researched estimates (see notes); the three locked
  // costs came from actual bookings/quotes. Totals are COMPUTED in the UI
  // (BudgetView) from these parts — never hardcoded — so edits stay consistent.
  const budget = {
    currency: 'USD',
    basis: 'couple · 355 days · mid-range with strategic splurges',
    fxBRL: 5.2,
    estimate: 'USD ~93k for two',
    perDay: '~USD 263/day for two',
    inBRL: '~R$243k per person at R$5.20',
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
      { item: 'Varanasi Airbnb, Oct 17–21 (4n)', cost: 208, note: 'Actual — R$1,081 (~$208 at R$5.20)' },
      { item: 'Kathmandu → Beijing flight Nov 7 (2 pax)', cost: 477, note: 'Actual — $477 for two' },
      { item: 'Kathmandu hotel, Oct 21–25 (4n)', cost: 171, note: 'Booked ✅ — $171 pre-trek' },
      { item: 'Kathmandu hotel, Nov 4–7 (3n)', cost: 129, note: 'Booked ✅ — $129 post-trek' },
      { item: 'Beijing stay, Nov 7–16 (9n)', cost: 528, note: 'Booked ✅ — $528' },
    ],
    // Per-chapter estimates for two. lodging/food are chapter totals; transport
    // is in-chapter only (inter-chapter flights live in `flights` below).
    chapters: [
      { id: 'brasil', days: 66, lodging: 3520, food: 3150, transport: 1350, activities: 1930, fees: 0, note: 'Rio Airbnb R$7,000 + Cumbuco $1,900/mo + SP R$1,400 actual · trail + certs actual · internal flights Rio→Fortaleza + Fortaleza→SP ~$750' },
      { id: 'toronto', days: 5, lodging: 0, food: 450, transport: 150, activities: 50, fees: 0, note: "Friend's place · TTC + Islands ferry · mostly home meals" },
      { id: 'athens', days: 20, lodging: 1700, food: 1700, transport: 1230, activities: 570, fees: 0, note: 'Booked stays avg ~$85/n · 4 ferries €685 actual (~$770) · Chania car ~$240 · Kleftiko ~$260' },
      { id: 'turkey', days: 21, lodging: 1865, food: 1470, transport: 790, activities: 300, fees: 120, note: 'Göreme 3n + Alaçatı 3n + Şirince/Kaş/Akyaka + Istanbul 10n · balloon Sep 22/23 cancelled (weather), $480 refunded · car 8d ~$450 · e-visa' },
      { id: 'baku', days: 2, lodging: 0, food: 140, transport: 60, activities: 30, fees: 50, note: 'Stopover program — lodging free · ASAN e-visa · walkable old city' },
      { id: 'india', days: 7, lodging: 315, food: 315, transport: 190, activities: 120, fees: 55, note: 'Agra day trip Oct 15 · Varanasi train Oct 17 booked ✅ · Varanasi Airbnb R$1,081 · VNS→KTM $343 booked ✅ · Taj + forts + boats' },
      { id: 'nepal', days: 17, lodging: 300, food: 260, transport: 100, activities: 1440, fees: 100, note: 'Trek $1,440 locked w/ Discovery World ($720pp; $144 paid, $1,296 due Oct 24) · KTM 7n (pre 4n Oct 21–25 booked ✅ $171 + post 3n Nov 4–7 booked ✅ $129) · KTM→PEK Nov 7 ($477) · tips/visa cash' },
      { id: 'china-e1', days: 16, lodging: 1390, food: 1045, transport: 550, activities: 350, fees: 0, note: 'Beijing 9n Nov 7–16 booked ✅ $528 (slow start) + Huangshan 3n + HGH 2n + SUZ 2n · PEK→Huangshan HSR/flight + Huangshan→HGH HSR + SUZ→SHA→HKG hops' },
      { id: 'hk', days: 5, lodging: 750, food: 450, transport: 120, activities: 0, fees: 0, note: '~$150/n · Peak tram + ferries + Lamma · free gardens/markets' },
      { id: 'china-e2', days: 14, lodging: 1180, food: 915, transport: 270, activities: 240, fees: 0, note: 'CAN 2n + Shenzhen 4n + Macau 2n + Shanghai 6n · ferry + MFM→PVG direct + PVG→KUL · Shanghai heated hotel' },
      { id: 'malaysia', days: 14, lodging: 770, food: 560, transport: 250, activities: 110, fees: 0, note: 'KL 4n + Penang 6n + Langkawi 4n · KL→Penang ETS rail + Penang→Langkawi 35m flight · George Town pre-Christmas' },
      { id: 'thailand', days: 18, lodging: 1440, food: 720, transport: 300, activities: 300, fees: 0, note: 'Koh Lipe 4n + Ko Lanta 5n + Railay 5n + Bangkok 4n · Andaman peak season south-to-north boat chain + KBV→BKK hop' },
      { id: 'japan', days: 42, lodging: 5460, food: 3990, transport: 700, activities: 2300, fees: 0, note: 'Cities/Alps/Fuji 28n ~$125/n · Nozawa 5n + Myoko Kogen + Madarao 9n · lift/rental/lessons across two snow bases · point-to-point trains' },
      { id: 'indonesia-a', days: 25, lodging: 850, food: 500, transport: 550, activities: 8600, fees: 0, note: 'Liveaboard $8,400 locked · JKT→JOG→DPS hops ~$260 + DPS→SOQ ~$250 · Ramadan Java + Nyepi Ubud staging · Entry 1 Feb 24–Mar 21 (26d)' },
      { id: 'borneo', days: 10, lodging: 1020, food: 200, transport: 520, activities: 60, fees: 0, note: 'Kinabatangan 3D2N ~$600 + 2 lodge nights (full board) · Sepilok fees · in from SOQ Mar 21, out BKI→MNL Mar 31' },
      { id: 'philippines', days: 14, lodging: 780, food: 690, transport: 450, activities: 1050, fees: 0, note: 'Manila 2n staging + gear prep · Coron 5d + El Nido 4d post-Easter peak vis · sardines (Malapascua dropped)' },
      { id: 'indonesia-b', days: 17, lodging: 760, food: 1120, transport: 450, activities: 1010, fees: 20, note: 'CEB→DPS in flights · Penida + Komodo dives Apr 15–25 · Batur · Bali levies · Entry 2 Apr 14–May 1 (17d)' },
      { id: 'singapore', days: 5, lodging: 700, food: 275, transport: 90, activities: 80, fees: 0, note: '~$140/n · hawker-first food · Gardens domes · waits out China May Day Golden Week' },
      { id: 'china-spring', days: 22, lodging: 1530, food: 1215, transport: 1280, activities: 450, fees: 0, note: 'May 6–28 sweet spot · XIY→CTU + CTU→CKG + CKG→DYG + Fenghuang→CSX HSR hops · pandas/Sanxingdui + pillars tickets' },
      { id: 'korea', days: 14, lodging: 1750, food: 980, transport: 300, activities: 250, fees: 0, note: 'Jeju 3n + Busan 3n + Gyeongju 2n + Seoul 6n · CJU→PUS flight + KTX north · DMZ/Suwon · fly home from ICN Jun 11' },
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
      { route: 'Kathmandu → Beijing', cost: 477, date: '2026-11-07', note: 'Late-night arrival; Entry 1 starts Nov 7' },
      { route: 'Hong Kong → Guangzhou (HSR)', cost: 70, date: '2026-11-28', note: 'Estimate — West Kowloon → Guangzhou South direct, ~1h; Entry 2 starts' },
      { route: 'Shanghai → Kuala Lumpur (direct)', cost: 300, date: '2026-12-12', note: 'Estimate — PVG–KUL ~5h30; Malaysia begins' },
      { route: 'Langkawi → Koh Lipe (ferry)', cost: 110, date: '2026-12-26', note: 'Estimate — 90-min cross-border ferry from Telaga Harbour; Thailand Andaman begins' },
      { route: 'Bangkok → Osaka (direct)', cost: 450, date: '2027-01-13', note: 'Estimate — BKK–KIX ~5h30; Japan begins' },
      { route: 'Tokyo → Jakarta (direct)', cost: 500, date: '2027-02-24', note: 'Estimate — direct daily (ANA/JAL/Garuda), 30-day free entry starts' },
      { route: 'Denpasar → Sorong (via Makassar)', cost: 250, date: '2027-03-10', note: 'Estimate — domestic, book 6–8 wks ahead (Lebaran surge)' },
      { route: 'Sorong → Kota Kinabalu (via UPG/CGK)', cost: 400, date: '2027-03-21', note: 'Estimate — off-boat day' },
      { route: 'Kota Kinabalu → Manila (via KUL)', cost: 250, date: '2027-03-31', note: 'Estimate, AirAsia' },
      { route: 'Cebu → Denpasar (via MNL/SIN)', cost: 300, date: '2027-04-14', note: 'Estimate — daily, easy; Entry 2 starts' },
      { route: 'Bali → Singapore', cost: 200, date: '2027-05-01', note: 'Estimate, AirAsia' },
      { route: 'Singapore → Xi\'an (direct)', cost: 300, date: '2027-05-06', note: 'Estimate — Scoot direct ~5h30; China spring begins right after May Day Golden Week' },
      { route: 'Changsha → Jeju (via Seoul/Shanghai)', cost: 300, date: '2027-05-28', note: 'Estimate — CSX–ICN–CJU or via PVG; South Korea finale begins' },
      { route: 'Seoul → São Paulo (home)', cost: 1400, date: '2027-06-11', note: 'Estimate ~$700pp — 1-stop from Incheon (ICN) megahub; trip ends' },
    ],
    extras: [
      { item: 'Health insurance, $150/mo × 12 months (couple)', cost: 1800, note: 'Covers the full trip, both travelers' },
      { item: 'eSIMs + trail/trek sundries', cost: 350, note: '~15 countries + thermals/laundry gaps' },
    ],
    assumptions: [
      'All figures USD for two; mid-range with strategic splurges, researched Oct 2026 prices',
      'China entries are 16 + 6 + 6 days (HK + Macau SAR resets between, all inside the 30d visa-free and pre-Dec-31-2026) — no visa needed; spring entry (May 6–28, 22d) needs one L visa (~$300 for two) unless the waiver renews',
      'Malaysia and Thailand visa-free, Korea K-ETA (~$8 pp); Taiwan is out of the route, so no TECO filing',
      'Own kite gear in Cumbuco; mask + dive computer owned; snowboard kit rented at Nozawa Onsen and Myoko Kogen',
      'Free stays: Toronto (friends) and Azerbaijan (stopover program) — lodging paid elsewhere',
      'Inter-chapter flights are one-way advance fares; peak-season spikes are what the 8% contingency is for',
    ],
    levers: [
      'Diving is ~$12k of the total — fewer Coron/Komodo/Penida dive days saves $1,500+ fast',
      'Japan + Korea are ~$16k combined — business hotels + konbini breakfasts already assumed; ryokan splurge kept to zero',
      'Shoulder-season flights (booked early) and slow-travel lodging (weekly rates) are the two biggest structural savers',
      'Toronto + Azerbaijan avoid lodging costs; monthly rates in Rio/Cumbuco beat nightly prices',
    ],
  };

  // Packing notes
  const packing = [
    { layer: 'Base kit', items: 'Carry-on + 30L backpack only throughout' },
    { layer: 'Japan winter', items: 'Light thermal base layers from Beijing/Nepal. Rent ALL snowboard kit at Nozawa Onsen and Myoko Kogen.' },
    { layer: 'China May spring', items: 'Breathable layers + light rain shell for Zhangjiajie/Sichuan (mild 23–26°C in May, much cooler and drier than June).' },
    { layer: 'Beijing Wall day (mid-Nov)', items: 'Windproof shell + insulated boots over down/fleece bought in Kathmandu Thamel (sub-zero wind chill); pick the bluest morning' },
    { layer: 'Diving', items: 'Bring personal mask + computer. BCD/reg/wetsuit rented per site.' },
    { layer: 'Nusa Penida', items: 'Reef-safe sunscreen, rash guard, water shoes (rocky entry)' },
    { layer: 'Nepal trek', items: 'Rent trekking poles + sleeping bag liner in Kathmandu' },
  ];

  // Hand-authored calendar highlights: key attractions + car rentals.
  // Synced by the calendar integration alongside chapters + flights.
  // `end` is the inclusive last day.
  const calendarEvents = [
    { id: 'abctrek', title: 'Annapurna Base Camp trek', start: '2026-10-25', end: '2026-11-04', note: '11-day teahouse trek: Nayapul → ABC (4,130m) → Jhinu hot springs' },
    { id: 'rajaampatdiving', title: 'Raja Ampat Diving (liveaboard)', start: '2027-03-11', end: '2027-03-20', note: '10 days on the water: Wayag, Cape Kri, Manta Sandy' },
    { id: 'chaniacar', title: '🚗 Rental car — Chania', start: '2026-09-05', end: '2026-09-09', note: 'Return 8:30am Sep 9' },
    { id: 'izmircar', title: '🚗 Rental car — Izmir (ADB)', start: '2026-09-25', end: '2026-10-02', note: 'Pickup ~1am Sep 25 · return Oct 2 before 16:45 flight' },
  ];

  // Ground + sea legs for the calendar sync. `date` is the departure day;
  // all-day events (end is exclusive, computed by calendar.jsx). Inter-chapter
  // flights stay in budget.flights; this list covers trains, buses, ferries and
  // in-chapter flights so every travel day reaches the calendar.
  const transports = [
    // Greece — ferries
    { mode: 'ferry', route: 'Rethymno → Santorini', date: '2026-09-12', note: 'Seasonal fast ferry (~2h)' },
    { mode: 'ferry', route: 'Santorini → Folegandros', date: '2026-09-14', note: 'Inter-island ferry' },
    { mode: 'ferry', route: 'Folegandros → Milos', date: '2026-09-16', note: 'Inter-island ferry' },
    { mode: 'ferry', route: 'Milos → Athens (Piraeus)', date: '2026-09-20', note: 'Ferry + buffer night before the Sep 21 flight' },
    // Nepal — tourist buses
    { mode: 'bus', route: 'Kathmandu → Pokhara', date: '2026-10-25', note: 'Tourist bus, 6–7h; lakeside briefing on arrival' },
    { mode: 'bus', route: 'Pokhara → Kathmandu', date: '2026-11-04', note: 'Tourist bus, 6–7h — back to Thamel' },
    // India
    { mode: 'train', route: 'Delhi → Varanasi', date: '2026-10-17', note: 'Early train (06:00) — booked ✅' },
    // China E1
    { mode: 'train', route: 'Beijing South → Huangshanbei', date: '2026-11-16', note: 'HSR ~5–5.5h (weather-proof alternative to the Tunxi flight)' },
    { mode: 'train', route: 'Huangshanbei → Hangzhou East', date: '2026-11-19', note: 'HSR ~1.5h' },
    { mode: 'train', route: 'Hangzhou → Suzhou', date: '2026-11-21', note: 'HSR ~1.5h' },
    { mode: 'train', route: 'Suzhou → Shanghai Hongqiao', date: '2026-11-23', note: 'HSR ~25min direct into the SHA terminal, then flight to HK' },
    // China E2
    { mode: 'train', route: 'Guangzhou → Shenzhen', date: '2026-11-30', note: 'HSR ~30min' },
    { mode: 'ferry', route: 'Shenzhen (Shekou) → Macau', date: '2026-12-04', note: 'Ferry ~1h — Mainland exit' },
    { mode: 'flight', route: 'Macau → Shanghai', date: '2026-12-06', note: 'In-chapter hop ~2.5h — fresh Mainland entry at PVG' },
    // Malaysia — Dec west-coast run
    { mode: 'train', route: 'Kuala Lumpur → Penang (ETS)', date: '2026-12-16', note: 'ETS train to Butterworth (~4h) + short ferry to George Town' },
    { mode: 'flight', route: 'Penang → Langkawi', date: '2026-12-22', note: 'Direct hop ~35min (passenger ferry remains suspended)' },
    // Thailand — Andaman south-to-north + Bangkok
    { mode: 'ferry', route: 'Koh Lipe → Ko Lanta', date: '2026-12-29', note: 'Speedboat north up the Andaman chain (~3h); booked one day before NYE so a weather cancellation still leaves a fallback' },
    { mode: 'ferry', route: 'Ko Lanta → Railay / Krabi', date: '2027-01-05', note: 'Ferry / minivan + longtail north to Railay (~2h)' },
    { mode: 'flight', route: 'Krabi → Bangkok', date: '2027-01-09', note: 'In-chapter hop ~1h20 — 4 nights in Bangkok before Osaka' },
    // Japan
    { mode: 'train', route: 'Kyoto → Osaka', date: '2027-01-21', note: 'Local/rapid train ~30min' },
    { mode: 'train', route: 'Osaka → Takayama (via Shirakawa-go)', date: '2027-01-25', note: 'Hida Wide View limited express (~3.5h) + Nohi bus to Shirakawa-go' },
    { mode: 'train', route: 'Takayama → Hakone / Mt. Fuji', date: '2027-01-28', note: 'Hida train to Nagoya + Shinkansen to Odawara / Kawaguchiko' },
    { mode: 'train', route: 'Hakone / Kawaguchiko → Tokyo', date: '2027-01-31', note: 'Odakyu Romancecar or highway bus ~1.5–2h' },
    { mode: 'train', route: 'Tokyo → Nozawa Onsen', date: '2027-02-09', note: 'Hokuriku Shinkansen to Iiyama + bus ~2.5h' },
    { mode: 'train', route: 'Nozawa Onsen → Myoko Kogen', date: '2027-02-14', note: 'Bus/train via Nagano ~2h' },
    { mode: 'train', route: 'Myoko Kogen → Tokyo', date: '2027-02-23', note: 'Hokuriku Shinkansen + local transfer' },
    // Indonesia A
    { mode: 'train', route: 'Jakarta → Yogyakarta', date: '2027-02-26', note: 'Executive train (or 1h flight)' },
    // Indonesia B
    { mode: 'ferry', route: 'Sanur → Nusa Penida', date: '2027-04-15', note: 'Fast boat ~45min' },
    // China Spring — May sweet spot
    { mode: 'train', route: 'Xi\'an → Chengdu', date: '2027-05-11', note: 'HSR ~3.5h' },
    { mode: 'train', route: 'Chengdu → Chongqing', date: '2027-05-16', note: 'HSR ~1h' },
    { mode: 'train', route: 'Chongqing → Zhangjiajie', date: '2027-05-20', note: 'Direct HSR ~2–2.5h' },
    { mode: 'train', route: 'Zhangjiajie → Fenghuang (via Furong)', date: '2027-05-24', note: 'HSR/bus with the Furong waterfall-town stop en route (~1–2h)' },
    { mode: 'train', route: 'Fenghuang → Changsha', date: '2027-05-27', note: 'HSR ~2h; buffer night before the Korea flight' },
    // Korea — early-summer finale (south-to-north)
    { mode: 'flight', route: 'Jeju → Busan', date: '2027-05-31', note: 'In-chapter hop ~50min' },
    { mode: 'train', route: 'Busan → Gyeongju', date: '2027-06-03', note: 'KTX/train ~35min' },
    { mode: 'train', route: 'Gyeongju → Seoul', date: '2027-06-05', note: 'KTX ~2h — 6 final nights in Seoul before ICN flight home' },
  ];

  return {
    start: START, end: END, totalDays,
    travelers: 2,
    chapters,
    bookings, budget, packing,
    calendarEvents, transports,
    REGIONS,
    CHAPTER_COLORS,
    chapterColor,
    helpers: { dayCounter, mapsUrl, photoUrl, fmt, dayRange, contrastText },
  };
})();
