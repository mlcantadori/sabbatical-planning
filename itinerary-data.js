// Sabbatical itinerary — single source of truth.
// Drives all three design directions. Read-only at runtime.

window.TRIP = (function () {
  const START = new Date('2026-08-24');
  const END = new Date('2027-06-08');
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

  // Picsum.photos with a deterministic seed — always loads, looks photographic,
  // consistent across reloads. NOT the actual destination but a placeholder
  // until the user swaps in their own photos. The seed is keyword-based so
  // each chapter gets a consistent set across sessions.
  function photoUrl(keywords, w = 1200, h = 800) {
    const seed = encodeURIComponent(keywords).replace(/%20/g, '-');
    return `https://picsum.photos/seed/${seed}/${w}/${h}`;
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
  // Each entry: id, num, kind, country, flag, title, dates, days, theme,
  // intro (poetic), tldr (condensed), weather, region, places[]
  const chapters = [
    {
      id: 'toronto', num: 0, kind: 'chapter', region: 'americas',
      country: 'Canada', flag: '🇨🇦', title: 'Toronto',
      start: '2026-08-24', end: '2026-08-27', days: 3,
      theme: 'North American send-off, city stopover before Europe',
      intro: 'Three days in Toronto before crossing the Atlantic — a proper send-off from North America. Late August means warm evenings, patios open, and Kensington Market at its best.',
      tldr: 'Kensington Market · Distillery District · CN Tower',
      weather: { hi: 27, lo: 17, label: 'Late summer, 27°/17°', emoji: '🍁' },
      photos: ['toronto cn tower distillery district','kensington market toronto summer','toronto harbourfront lake ontario','niagara falls mist canada'],
      places: [
        { name: 'Toronto', days: 3, query: 'Kensington Market, Toronto',
          highlights: ['Kensington Market — multicultural street market, vintage shops, food stalls','Distillery District — Victorian industrial complex turned arts village','CN Tower + the Harbourfront waterfront walk','High Park late-summer picnic','Toronto Islands ferry — city skyline across Lake Ontario','Optional day trip: Niagara Falls (1.5h by car or GO bus)','Fly Toronto → Athens to open Mediterranean chapter'] },
      ],
    },
    {
      id: 'athens', num: 1, kind: 'chapter', region: 'mediterranean',
      country: 'Greece', flag: '🇬🇷', title: 'Athens',
      start: '2026-08-27', end: '2026-09-08', days: 12,
      theme: 'Ancient Mediterranean, cradle of Western civilization, island prologue',
      intro: 'Athens in late August: the Acropolis catches golden light at 7am before the crowds arrive. Monastiraki is electric at night. The Greek islands are a fast ferry away. A perfect opener before the rest of the world.',
      tldr: 'Athens · Acropolis · Hydra island · Cape Sounion',
      weather: { hi: 32, lo: 22, label: 'Warm Mediterranean, 32°/22°', emoji: '🏛️' },
      photos: ['athens acropolis parthenon sunrise','monastiraki flea market athens night','hydra island greece donkeys','cape sounion poseidon temple sunset'],
      places: [
        { name: 'Athens', days: 8, query: 'Acropolis, Athens, Greece',
          highlights: ['Acropolis + Parthenon — arrive at opening, golden light before 9am','Monastiraki flea market + evening mezedes bars','Plaka neighborhood — neoclassical houses, bougainvillea, cats','Anafiotika — whitewashed Cycladic enclave inside the city','National Archaeological Museum — world-class antiquities','Keramikos + Kerameikos cemetery walk','Lycabettus Hill rooftop sunset over the whole city','Roof garden dinners with Acropolis views in Koukaki'] },
        { name: 'Hydra', days: 2, query: 'Hydra Island, Greece',
          highlights: ['No cars or motorcycles — only donkeys and feet','Port town of stone mansions rising up from the harbor','Swimming off the rocks, fresh grilled octopus','Day boat or overnight stay from Piraeus (2h fast ferry)'] },
        { name: 'Cape Sounion + Delphi', days: 2, query: 'Cape Sounion, Greece',
          highlights: ['Temple of Poseidon at Cape Sounion — cliff\'s edge, Aegean 360° below','Delphi: Oracle sanctuary, museum, dramatic mountain valley','Fly Athens → Istanbul to open Turkey chapter'] },
      ],
    },
    {
      id: 'turkey', num: 2, kind: 'chapter', region: 'crossroads',
      country: 'Turkey', flag: '🇹🇷', title: 'Turkey',
      start: '2026-09-08', end: '2026-09-30', days: 22,
      theme: 'Ancient crossroads, Aegean coast, surreal landscapes',
      intro: 'September is the single best month to visit Turkey. Cappadocia balloon flights have optimal morning conditions. Alacatı offers Aegean coast life at its best. Istanbul before the autumn shift.',
      tldr: 'Istanbul · Alacatı · Pamukkale · Ephesus · Cappadocia',
      weather: { hi: 28, lo: 16, label: 'Late summer, 28°/16°', emoji: '☀️' },
      photos: ['istanbul hagia sophia bosphorus','alacatı windmill aegean coast','cappadocia hot air balloons','pamukkale white terraces'],
      places: [
        { name: 'Istanbul', days: 9, query: 'Istanbul, Turkey',
          highlights: ['Hagia Sophia, Topkapi Palace, Grand Bazaar, Spice Market','Bosphorus ferry — the most beautiful commute on Earth','Hammam at Cağaloğlu Baths','Beyoğlu rooftop bars, Karaköy galleries','Meyhane dinners with raki + meze','Princes\' Islands day trip by ferry'] },
        { name: 'Alacatı', days: 6, query: 'Alacatı, Çeşme, Turkey',
          highlights: ['Restored stone-house village on the Aegean — Çeşme peninsula','Windmills above the village — the iconic Alacatı image','Natural wine bars + boutique wineries in the surrounding hills','Kite surfing + windsurfing (consistently ranked top spot in Europe)','Cobblestone bazaar alley — artisan shops, slow mornings','Çeşme beach + optional ferry across to Chios'] },
        { name: 'Pamukkale + Ephesus', days: 3, query: 'Pamukkale, Turkey',
          highlights: ['White calcium travertine terraces — walking barefoot into warm pools','Hierapolis ruins on the plateau above','Ephesus — one of the best-preserved Roman cities anywhere'] },
        { name: 'Cappadocia', days: 4, query: 'Göreme, Cappadocia, Turkey',
          highlights: ['Hot air balloon at sunrise — book by Jul 2026 (Royal Balloon / Butterfly Balloons)','Göreme Open Air Museum','Underground cities: Derinkuyu, Kaymakli','Rose Valley + Love Valley hikes','Cave hotel stay — tuff stone rooms carved into fairy chimneys'] },
      ],
      booking: ['Cappadocia balloon — book by Jul 2026 (Royal Balloon / Butterfly Balloons)'],
    },
    {
      id: 'nepal', num: 3, kind: 'chapter', region: 'himalaya',
      country: 'Nepal', flag: '🇳🇵', title: 'Nepal',
      start: '2026-10-01', end: '2026-10-21', days: 20,
      theme: 'Sacred roof of the world, physical peak, elemental beauty',
      intro: 'October is the gold standard trekking month in Nepal. Monsoon has cleared. Skies are crystalline. Himalayan views unobstructed 360°. This is peak season for good reason.',
      tldr: 'Kathmandu · Pokhara · Annapurna Base Camp trek',
      weather: { hi: 22, lo: 6, label: 'Post-monsoon, crystalline', emoji: '🏔️' },
      photos: ['kathmandu boudhanath stupa','annapurna himalaya trek','pokhara phewa lake dawn','everest prayer flags wind'],
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
      id: 'india', num: 4, kind: 'chapter', region: 'himalaya',
      country: 'India', flag: '🇮🇳', title: 'India',
      start: '2026-10-21', end: '2026-11-10', days: 20,
      theme: 'Sacred intensity, iconic monuments, Himalayan slow life',
      intro: 'A tighter, more intentional India: Varanasi for spiritual intensity, the Golden Triangle, then a full week in Rishikesh for yoga, river, and mountain air.',
      tldr: 'Delhi · Varanasi · Agra · Jaipur · Rishikesh',
      weather: { hi: 26, lo: 12, label: 'Post-monsoon clear, 26°/12°', emoji: '🌅' },
      photos: ['taj mahal agra sunrise','varanasi ghats dawn rowing','jaipur amber fort rajasthan','rishikesh ganga yoga ashram'],
      places: [
        { name: 'Delhi', days: 1, query: 'Old Delhi, India',
          highlights: ['Transit, Old Delhi brief walk'] },
        { name: 'Varanasi', days: 2, query: 'Varanasi ghats, India',
          highlights: ['Ghats at dawn — rowing on the Ganges in morning mist','Ganga Aarti at dusk — fire, flowers, bells, priests','Manikarnika cremation ghats','Chai, silk, wandering the narrow alleys'] },
        { name: 'Agra', days: 3, query: 'Taj Mahal, Agra',
          highlights: ['Taj Mahal at sunrise — arrive 6am, before tour groups, in golden light','Agra Fort','Mehtab Bagh — sunset Taj view across the river','Fatehpur Sikri day trip'] },
        { name: 'Jaipur', days: 3, query: 'Jaipur, Rajasthan',
          highlights: ['Amber Fort, mirror palace','Hawa Mahal, City Palace','Jantar Mantar observatory','Pink City bazaars'] },
        { name: 'Rishikesh', days: 8, query: 'Rishikesh, India',
          highlights: ['Yoga + meditation at Parmarth Niketan (multi-day immersive)','Evening Ganga Aarti on the ghats — intimate, non-touristic','Beatles Ashram ruins (Maharishi Mahesh Yogi)','Ganges white-water rafting','Laxman Jhula + Ram Jhula suspension bridges','Ayurvedic treatments','Day trip: Haridwar Ganga Aarti + Har Ki Pauri'] },
        { name: 'Delhi', days: 3, query: 'Humayuns Tomb, Delhi',
          highlights: ['Humayun\'s Tomb','Lodhi Garden walk','Departure prep, fly to Tokyo'] },
      ],
      booking: [],
    },
    {
      id: 'japan-autumn', num: 5, kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Autumn',
      start: '2026-11-10', end: '2026-11-30', days: 20,
      theme: 'Sacred refinement, koyo at peak, slow urban chapter',
      intro: 'Tokyo first for peak city-koyo. Osaka as the bridge. Kyoto last — crowds thin after Nov 26 while late-season foliage (Eikan-do, Tofuku-ji) holds. This order means the best is saved.',
      tldr: 'Tokyo · Osaka · Kyoto — peak koyo (Kyoto last)',
      weather: { hi: 14, lo: 6, label: 'Crisp autumn, 14°/6°', emoji: '🍁' },
      photos: ['tokyo shinjuku gyoen koyo autumn','kyoto eikando maple night','fushimi inari gates dawn','osaka dotonbori canal','arashiyama bamboo grove'],
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
      id: 'korea', num: 6, kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2026-11-30', end: '2026-12-24', days: 24,
      theme: 'Electric winter hearth, K-culture, food depth, slow traditional chapter',
      intro: 'Palace grounds dusted with early snow, jjigae stews and makgeolli in pojangmacha tents, the Han River frozen at the edges. December Seoul is vibrant with Christmas energy.',
      tldr: 'Seoul · Busan · Gyeongju · Jeonju · Christmas Seoul',
      weather: { hi: 6, lo: -3, label: 'Cold + cozy, 6°/-3°', emoji: '❄️' },
      photos: ['seoul gyeongbokgung winter snow','busan gamcheon culture village','gyeongju bulguksa temple','jeonju hanok village','korean street food night market'],
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
      id: 'taiwan', num: 7, kind: 'chapter', region: 'northeast',
      country: 'Taiwan', flag: '🇹🇼', title: 'Taiwan',
      start: '2026-12-24', end: '2027-01-02', days: 9,
      theme: 'Café culture, NYE fireworks, dramatic east coast',
      intro: 'Arrive Christmas Eve. Taipei on New Year\'s Eve is one of Asia\'s great celebrations — the Taipei 101 countdown fireworks fired from the building itself in a vertical cascade.',
      tldr: 'Taipei · Jiufen · NYE Dec 31 · Taroko Gorge',
      weather: { hi: 18, lo: 13, label: 'Dry, clear, mild, 18°/13°', emoji: '🎆' },
      photos: ['taipei 101 nye fireworks night','jiufen old street lanterns mist','taroko gorge marble canyon jade river','taiwan shilin night market'],
      places: [
        { name: 'Taipei', days: 7, query: 'Da\'an District, Taipei',
          highlights: ['Da\'an specialty coffee + bookshops','Jiufen — clifftop mining town, lantern-lit teahouses, mist','Shilin Night Market','Elephant Mountain sunset hike over the skyline','NYE Dec 31: Taipei 101 fireworks — fired from the building, visible citywide ✓'] },
        { name: 'Hualien + Taroko Gorge', days: 2, query: 'Taroko Gorge, Taiwan',
          highlights: ['Train along Pacific coast — one of Asia\'s great rail journeys','Marble canyon, jade river, suspension bridges','Qingshui Cliffs — Pacific walls dropping into the ocean'] },
      ],
    },
    {
      id: 'japan-winter', num: 8, kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Winter',
      start: '2027-01-02', end: '2027-01-12', days: 10,
      theme: 'Powder snowboarding, mountain stillness, onsen',
      intro: 'Focused Hakuba: a pure snowboard chapter. No city detours — just powder, onsen, and mountain ramen. Early January is uncrowded and Japan is introspective.',
      tldr: 'Osaka (arrival) · Hakuba Valley (8 days snowboard)',
      weather: { hi: 4, lo: -4, label: 'Snow + powder, 4°/-4°', emoji: '🏂' },
      photos: ['hakuba valley snowboard powder japan','hakuba alps view sunrise','japan mountain onsen snow steam','hakuba village izakaya night'],
      places: [
        { name: 'Osaka', days: 1, query: 'Dotonbori, Osaka',
          highlights: ['Arrival anchor from Taipei','Winter seafood season — crab in Dotonbori','Overnight bus or JR to Hakuba'] },
        { name: 'Hakuba Valley', days: 8, query: 'Hakuba, Japan',
          highlights: ['Rent ALL equipment + outerwear locally (boots, board, jacket, helmet)','Hakuba over Niseko — authentic village feel, Japan-ness preserved','6–7 actual snowboard days across three resorts','1–2 onsen rest days + mountain restaurants','Happo-one, Goryu, Cortina — each with distinct character','Izakaya nights, ramen, star-filled mountain sky'] },
        { name: 'Departure', days: 1, query: 'Nagoya Station, Japan',
          highlights: ['Bus/train Hakuba → Nagoya or Tokyo','Fly to Shanghai — China Block 1 begins Jan 12'] },
      ],
    },
    {
      id: 'china-1', num: 9, kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 1',
      start: '2027-01-12', end: '2027-02-11', days: 30,
      theme: 'Imperial capital, global finance hub, future-tech frontier',
      intro: 'The three great metropolises in one extended block. Beijing in January — empty and sometimes snow-dusted — is one of its finest versions. Shanghai rewards lingering. Shenzhen is the most forward-facing city on Earth.',
      tldr: 'Beijing · Shanghai · Suzhou · Shenzhen',
      weather: { hi: 8, lo: -2, label: 'Cold north, mild south', emoji: '🏙️' },
      photos: ['beijing great wall mutianyu snow','shanghai bund night huangpu','shanghai french concession art deco','shenzhen skyline tech night'],
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
      id: 'hk', num: 10, kind: 'reset', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong reset',
      start: '2027-02-11', end: '2027-02-14', days: 3,
      theme: 'Visa reset between China and Philippines',
      intro: 'Quick reset — laundry, planning, neon, dim sum.',
      tldr: 'Victoria Peak · Kowloon · Temple Street',
      weather: { hi: 19, lo: 15, label: 'Mild, 19°/15°', emoji: '🥟' },
      photos: ['hong kong victoria harbour skyline night','hong kong dim sum yum cha','kowloon neon signs street'],
      places: [
        { name: 'Hong Kong', days: 3, query: 'Victoria Peak, Hong Kong',
          highlights: ['Victoria Peak','Kowloon neon','Star Ferry','Dim sum','Temple Street Night Market','Rest, laundry, planning'] },
      ],
    },
    {
      id: 'philippines', num: 11, kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-02-14', end: '2027-03-09', days: 23,
      theme: 'WWII wreck diving, limestone islands, warm-up for Raja Ampat',
      intro: 'Coron for the greatest wreck dives on Earth. El Nido for limestone drama. Cebu/Moalboal for the sardine run — all warm-up diving before Raja Ampat. No liveaboard here.',
      tldr: 'Manila · Coron · El Nido · Cebu/Moalboal',
      weather: { hi: 31, lo: 25, label: 'Dry season, 31°/25°', emoji: '🏝️' },
      photos: ['el nido big lagoon limestone palawan','coron kayangan lake','cebu moalboal sardine run','intramuros manila colonial'],
      places: [
        { name: 'Manila', days: 1, query: 'Intramuros, Manila',
          highlights: ['Intramuros — walled Spanish colonial city','Fly Manila → Coron'] },
        { name: 'Coron', days: 6, query: 'Coron, Palawan, Philippines',
          highlights: ['Japanese WWII wrecks — Okikawa Maru, Irako, Akitsushima (sunk 1944)','Kayangan Lake — crystal-clear inland lake framed by karst','Barracuda Lake — thermocline diving (hot/cold layers)','CYC Beach + Twin Lagoon by banca boat','Among the finest wreck diving on Earth'] },
        { name: 'El Nido', days: 8, query: 'El Nido, Palawan',
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
      id: 'transit-1', num: null, kind: 'transit', region: 'archipelago',
      country: 'Transit', flag: '✈️', title: 'Transit to Sorong',
      start: '2027-03-09', end: '2027-03-11', days: 2,
      theme: 'Cebu → Sorong (West Papua) via Manado or Manila',
      intro: 'Routing via Manado or Makassar. Arrive Sorong Mar 11, board liveaboard same day. Indonesia visa entry Day 1 of 30.',
      tldr: 'Cebu → Sorong (West Papua)',
      weather: { hi: 30, lo: 24, label: 'Tropical', emoji: '✈️' },
      photos: ['airplane tropical clouds','sorong west papua harbor'],
      places: [
        { name: 'Transit', days: 2, query: 'Sorong, West Papua',
          highlights: ['Long-haul reset','Indonesia VOA Day 1 of 30 — visa clock starts','Pack down to liveaboard dive kit'] },
      ],
    },
    {
      id: 'raja-ampat', num: 12, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Raja Ampat',
      start: '2027-03-11', end: '2027-03-20', days: 10,
      theme: 'The best diving on Earth',
      intro: 'Raja Ampat contains the highest marine biodiversity on the planet. More fish species in one bay than in the entire Caribbean. The coral coverage, the density of life — schools so thick they block out the sun.',
      tldr: '10-day liveaboard — Wayag, Cape Kri, Manta Sandy',
      weather: { hi: 32, lo: 26, label: 'Mid-season ideal, 32°/26°', emoji: '🐠' },
      photos: ['raja ampat wayag aerial karst','manta ray cleaning station indonesia','coral reef raja ampat density','pygmy seahorse fan coral','reef sharks indonesia'],
      places: [
        { name: 'Liveaboard', days: 10, query: 'Wayag, Raja Ampat',
          highlights: ['Wayag — postcard karst islands, kayak + hike viewpoint','Cape Kri — world record fish count dive site','Manta Sandy — manta cleaning station','Melissa\'s Garden — pristine hard coral','Pianemo — smaller Wayag, fewer boats','Blue Water Mantas — oceanic, 6m wingspan','Wobbegongs, walking sharks, pygmy seahorses, nudibranchs'] },
      ],
      diving: { sites: 30, type: 'Liveaboard', operators: 'Papua Diving / Meridian Adventure' },
      booking: ['Raja Ampat liveaboard — book by Oct 2025 (Mar 11–20 dates)'],
    },
    {
      id: 'transit-2', num: null, kind: 'transit', region: 'archipelago',
      country: 'Transit', flag: '✈️', title: 'Transit Sorong → Bali',
      start: '2027-03-20', end: '2027-03-22', days: 2,
      theme: 'Post-liveaboard, fly Sorong → Denpasar',
      intro: 'Off the boat in Sorong. Fly via Makassar or direct to Denpasar. Indonesia visa Day 11 of 30 — 19 days remaining.',
      tldr: 'Sorong → Bali (Denpasar)',
      weather: { hi: 30, lo: 24, label: 'Tropical', emoji: '✈️' },
      photos: ['bali arrival denpasar airport','indonesia airplane clouds'],
      places: [
        { name: 'Transit', days: 2, query: 'Ngurah Rai Airport, Bali',
          highlights: ['Decompress, repack from liveaboard','Indonesia visa Day 11 of 30','Fly onward Bali → Nusa Penida (fast boat from Sanur)'] },
      ],
    },
    {
      id: 'nusa-penida', num: 13, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Nusa Penida',
      start: '2027-03-22', end: '2027-03-26', days: 4,
      theme: 'Raw island drama, manta rays, vertical cliffs',
      intro: 'Completely different from Bali: arid, dramatic, raw, far fewer tourists. Crystal Bay mantas year-round. Kelingking is one of the most dramatic coastal formations in Asia.',
      tldr: 'Kelingking · Angel\'s Billabong · Crystal Bay mantas',
      weather: { hi: 30, lo: 24, label: 'Transition, 30°/24°', emoji: '🦈' },
      photos: ['kelingking beach trex cliff nusa penida','crystal bay manta ray bali','angels billabong broken beach','atuh beach east nusa penida'],
      places: [
        { name: 'Nusa Penida', days: 4, query: 'Kelingking Beach, Nusa Penida',
          highlights: ['Kelingking Beach — T-Rex cliff, most photographed in Bali region','Angel\'s Billabong + Broken Beach — natural infinity pool carved into clifftop','Crystal Bay — reef mantas year-round (early morning dive)','Atuh Beach — remote east coast, dramatic rock formations','Scooter rental for full freedom'] },
      ],
      diving: { sites: 4, type: 'Day dives', operators: 'Crystal Bay Dive (most reliable for mantas)' },
    },
    {
      id: 'komodo', num: 14, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Komodo',
      start: '2027-03-26', end: '2027-04-02', days: 7,
      theme: 'Dragons, world-class diving, wild Indonesia',
      intro: 'Fly Bali → Labuan Bajo. April is entering peak dry season — visibility building, mantas reliable at Manta Point. Day trips by fast boat from Labuan Bajo — no liveaboard needed.',
      tldr: 'Labuan Bajo · Komodo NP · Padar sunrise',
      weather: { hi: 31, lo: 23, label: 'Dry season building', emoji: '🐉' },
      photos: ['padar island three bays viewpoint','komodo dragon rinca','manta point komodo current','pink beach komodo indonesia','phinisi boat sunset flores'],
      places: [
        { name: 'Labuan Bajo / Flores', days: 2, query: 'Labuan Bajo, Flores',
          highlights: ['Gateway — dramatic harbor, wooden phinisi boats','Sunset from Bukit Cinta','Grilled fish with sambal, growing restaurant scene'] },
        { name: 'Komodo National Park', days: 5, query: 'Komodo National Park',
          highlights: ['Manta Point — oceanic mantas in strong current','Crystal Rock + Castle Rock — world-class drift dives','Pink Beach — crushed red coral, excellent snorkeling','Batu Bolong — pinnacle, coral so dense no bare rock','Komodo dragons with ranger at Rinca or Komodo Island','Padar Island sunrise — three colored bays stretching below'] },
      ],
      diving: { sites: 8, type: 'Day trips by fast boat', operators: 'Many operators in Labuan Bajo' },
    },
    {
      id: 'bali-volcano', num: 15, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Bali + Volcano',
      start: '2027-04-02', end: '2027-04-08', days: 6,
      theme: 'Tropical landing, temple culture, volcanic sunrise',
      intro: 'Final Indonesia days before the Borneo visa reset. Ubud for culture, Mount Batur for the sunrise volcano ritual — one of the most otherworldly experiences in SE Asia. Indonesia visa Day 24 of 30 on arrival.',
      tldr: 'Canggu · Ubud · Mount Batur sunrise',
      weather: { hi: 30, lo: 24, label: 'Transition, 30°/24°', emoji: '🌋' },
      photos: ['bali ubud rice terrace tegallalang','mount batur sunrise crater lake','tanah lot temple bali ocean','canggu beach club sunset bali'],
      places: [
        { name: 'Bali', days: 4, query: 'Ubud, Bali',
          highlights: ['Ubud: Tegallalang rice terraces, sacred monkey forest','Tanah Lot sunset temple on sea rock','Seminyak / Canggu beach club final evening','Balinese cooking class'] },
        { name: 'Mount Batur sunrise', days: 2, query: 'Mount Batur, Kintamani, Bali',
          highlights: ['3am departure, 2-hour hike to crater rim at 1,717m','Sunrise over the caldera and crater lake','Return in time for Borneo departure — Indonesia visa exits Day 30 ✓'] },
      ],
    },
    {
      id: 'borneo', num: 16, kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Borneo / Sabah',
      start: '2027-04-08', end: '2027-04-18', days: 10,
      theme: 'Indonesia visa reset + wildlife chapter',
      intro: 'Bali → KK flight exits Indonesia on Day 30 — perfectly timed reset. Kinabatangan is one of SE Asia\'s finest wildlife corridors. Proboscis monkeys, pygmy elephants bathing at dawn.',
      tldr: 'KK · Sepilok · Kinabatangan River · KK departure',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧' },
      photos: ['sepilok orangutan rehabilitation borneo','kinabatangan pygmy elephant dawn river','proboscis monkey borneo endemic','kinabatangan river lodge morning mist'],
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
      id: 'singapore', num: 17, kind: 'chapter', region: 'isthmus',
      country: 'Singapore', flag: '🇸🇬', title: 'Singapore',
      start: '2027-04-18', end: '2027-04-25', days: 7,
      theme: 'World-class food, modern wonder, city recharge',
      intro: 'Effective recharge hub: clean, organized, excellent food infrastructure, everything works.',
      tldr: 'Hawker centres · Gardens by the Bay · Marina Bay',
      weather: { hi: 31, lo: 25, label: 'Hot + humid', emoji: '🌳' },
      photos: ['gardens by the bay supertree night','marina bay sands singapore','maxwell food centre hawker','changi jewel waterfall singapore'],
      places: [
        { name: 'Singapore', days: 7, query: 'Marina Bay, Singapore',
          highlights: ['Maxwell, Lau Pa Sat, Old Airport Road hawker centres — best in the world','Gardens by the Bay — Supertree Grove at night','Marina Bay Sands observation deck','Chinatown, Little India, Haji Lane','National Gallery Singapore','Changi Airport waterfall walk (best airport in the world)'] },
      ],
    },
    {
      id: 'kl', num: 18, kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Kuala Lumpur',
      start: '2027-04-25', end: '2027-04-30', days: 5,
      theme: 'Urban contrast, Petronas, food before the island escape',
      intro: 'A full KL chapter before heading north to Penang — Petronas at night, Batu Caves at dawn, Jalan Alor at midnight.',
      tldr: 'Petronas · Batu Caves · Bukit Bintang · Jalan Alor',
      weather: { hi: 33, lo: 24, label: 'Warm + humid', emoji: '🏙️' },
      photos: ['petronas twin towers night kl','batu caves rainbow steps macaques','jalan alor night food street kl','bukit bintang kuala lumpur'],
      places: [
        { name: 'Kuala Lumpur', days: 5, query: 'Petronas Twin Towers, KL',
          highlights: ['Petronas Twin Towers at night — best view from KLCC park reflection pool','Batu Caves — rainbow steps, macaques, Hindu temple inside limestone cave','Jalan Alor Night Food Street','Bukit Bintang neighborhood','Train north to Penang (ETS / KTM — scenic coastal rail)'] },
      ],
    },
    {
      id: 'penang', num: 19, kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Penang',
      start: '2027-04-30', end: '2027-05-05', days: 5,
      theme: 'Street food, café culture, colonial slow life',
      intro: 'Georgetown is the best café-culture slow chapter in SE Asia. Find a recurring breakfast spot. Walk the same route each morning.',
      tldr: 'Georgetown · Armenian Street · Gurney Drive hawker',
      weather: { hi: 32, lo: 25, label: 'Warm + humid', emoji: '☕' },
      photos: ['penang zacharevic street art murals','georgetown shophouse penang heritage','char kway teow penang hawker','clan jetties penang chinese stilt'],
      places: [
        { name: 'Penang', days: 5, query: 'Armenian Street, Georgetown',
          highlights: ['Armenian Street — Zacharevic murals, shophouse architecture, UNESCO','Gurney Drive hawker — char kway teow, asam laksa, cendol','Clan Jetties — Chinese stilt villages over the water','Penang Hill funicular','Kek Lok Si Temple, Blue Mansion (Cheong Fatt Tze)','Temporary-life chapter: find a recurring breakfast spot'] },
      ],
    },
    {
      id: 'koh-tao', num: 20, kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Koh Tao + Koh Samui',
      start: '2027-05-05', end: '2027-05-12', days: 7,
      theme: 'Tropical reset, warm water, reef diving',
      intro: 'Gulf coast — May is firmly dry season on this side. Clear water, calm seas, 30°C.',
      tldr: 'Koh Tao (5 days) · Koh Samui (2 days)',
      weather: { hi: 31, lo: 27, label: 'Dry season Gulf', emoji: '🐢' },
      photos: ['koh tao diving chumphon pinnacle','sail rock whale shark koh tao','koh samui chaweng beach sunset','thailand reef coral fish'],
      places: [
        { name: 'Koh Tao', days: 5, query: 'Koh Tao, Thailand',
          highlights: ['One of the best value diving destinations on Earth','Japanese Gardens, Chumphon Pinnacle','Sail Rock — whale shark territory (seasonal but reliable in May)','Hammock, reef, lunch, repeat'] },
        { name: 'Koh Samui', days: 2, query: 'Chaweng Beach, Koh Samui',
          highlights: ['Chaweng Beach','Big Buddha','Ferry to Surat Thani → bus/flight to Bangkok'] },
      ],
      diving: { sites: 8, type: 'Day boats', operators: 'Several solid shops on island' },
    },
    {
      id: 'bangkok', num: 21, kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Bangkok',
      start: '2027-05-12', end: '2027-05-19', days: 7,
      theme: 'Urban intensity, street food, temples',
      intro: 'Bangkok in May is 34–36°C — hot but city travel is fine with AC and canal boats.',
      tldr: 'Wat Pho · Grand Palace · Yaowarat · Kanchanaburi',
      weather: { hi: 36, lo: 26, label: 'Hot, 36°/26°', emoji: '🛺' },
      photos: ['bangkok wat arun chao phraya','yaowarat chinatown bangkok night','grand palace bangkok','chatuchak market weekend'],
      places: [
        { name: 'Bangkok', days: 7, query: 'Wat Pho, Bangkok',
          highlights: ['Wat Pho — reclining Buddha + massage school','Grand Palace + Wat Phra Kaew','Khlong canal boat commute through the city','Chatuchak Weekend Market (Sat–Sun)','Yaowarat (Chinatown) at night','Kanchanaburi day trip — Erawan Falls, Death Railway, River Kwai'] },
      ],
    },
    {
      id: 'china-2', num: 22, kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 2',
      start: '2027-05-19', end: '2027-06-08', days: 20,
      theme: 'Surreal landscapes, ancient empire, spring China',
      intro: 'Spring is the ideal season for these landscapes. Li River mist in the karst, Zhangjiajie sea of clouds, pandas active in Chengdu. These regions shine more in May than in winter.',
      tldr: 'Guilin · Zhangjiajie · Chongqing · Chengdu · Xi\'an',
      weather: { hi: 26, lo: 16, label: 'Spring, 26°/16°', emoji: '🐼' },
      photos: ['guilin li river karst mist spring','zhangjiajie avatar pillars sea clouds','chongqing night cyberpunk yangtze','chengdu giant panda base','xian terracotta warriors army'],
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
          highlights: ['Travel buffer','Fly home Jun 8, 2027 ✓'] },
      ],
    },
  ];

  // Compute total chapter count for headers
  const chapterCount = chapters.filter(c => c.kind === 'chapter').length;

  // Bookings (flat list pulled from chapters + a few overall)
  const bookings = [
    { task: 'Raja Ampat liveaboard',     by: 'By Oct 2025', critical: true,  notes: 'Papua Diving / Meridian Adventure — Mar 11–20; books out 6+ months ahead' },
    { task: 'Sipadan permits',           by: 'By Nov 2026', critical: true,  notes: '120 permits/day cap — if adding Sipadan to Borneo chapter' },
    { task: 'Cappadocia balloon',        by: 'By Jul 2026', critical: false, notes: 'Royal Balloon / Butterfly Balloons' },
    { task: 'Annapurna permits',         by: 'On arrival',  critical: false, notes: 'ACAP permit + TIMS card in Kathmandu' },
    { task: 'Kinabatangan river lodge',  by: 'By Feb 2027', critical: false, notes: 'Book 2–3 months ahead; good lodges fill in dry season' },
  ];

  // Diving log
  const diving = [
    { where: 'Coron — WWII Wrecks',      dates: 'Feb 15–20',    days: 6,  notes: 'Japanese warships sunk 1944 — world\'s best wreck diving' },
    { where: 'Cebu / Moalboal',          dates: 'Mar 2–7',      days: 5,  notes: 'Sardine run at Pescador, thresher sharks at Malapascua' },
    { where: 'Raja Ampat',               dates: 'Mar 11–20',    days: 10, notes: 'Mid-season liveaboard — book by Oct 2025' },
    { where: 'Nusa Penida — Crystal Bay',dates: 'Mar 22–26',    days: 4,  notes: 'Reef mantas year-round' },
    { where: 'Komodo',                   dates: 'Mar 28 – Apr 1', days: 5, notes: 'Manta Point + drift dives, peak dry season building' },
    { where: 'Koh Tao',                  dates: 'May 5–10',     days: 5,  notes: 'Value diving, whale sharks at Sail Rock' },
    { where: 'Sipadan (optional)',       dates: 'Apr 14–17',    days: 3,  notes: '120 permits/day — book by Nov 2026' },
  ];

  // Budget anchors
  const budget = {
    estimate: 'USD 48–60k for two',
    inBRL: '~140–175k BRL per person',
    expensive: ['Raja Ampat liveaboard', 'Hakuba lift passes + gear rental', 'Japan generally', 'China cities'],
    cheap: ['Nepal', 'India', 'Indonesia (outside dives)', 'Malaysia', 'Philippines (outside dives)'],
    splurges: ['Raja Ampat liveaboard', 'Hakuba snowboarding', 'One Kyoto ryokan night', 'Cappadocia cave hotel'],
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
    'toronto':      { months: [7, 8, 9],              note: 'Jul–Sep: warm summer, patios open, Lake Ontario swimmable' },
    'athens':       { months: [5, 6, 9, 10],         note: 'May–Jun and Sep–Oct: ideal temps; Aug is peak heat + crowds' },
    'turkey':       { months: [9, 10],               note: 'Sep–Oct: post-summer, ideal weather, balloon season' },
    'nepal':        { months: [10, 11],              note: 'Oct–Nov: post-monsoon, crystalline skies, best trekking' },
    'india':        { months: [10, 11, 12],          note: 'Oct–Dec: post-monsoon, clear skies, India circuit' },
    'japan-autumn': { months: [11],                  note: 'Nov: peak koyo in Kyoto temples, Tofuku-ji, Eikan-do' },
    'korea':        { months: [11, 12, 1],           note: 'Nov–Jan: winter hearth atmosphere, early snow on palaces' },
    'taiwan':       { months: [12, 1],               note: 'Dec–Jan: dry season, NYE fireworks at Taipei 101' },
    'japan-winter': { months: [1, 2],                note: 'Jan–Feb: peak powder season in Hakuba Valley' },
    'china-1':      { months: [1, 2, 3],             note: 'Jan–Feb: quiet Beijing, winter light in Shanghai, mild Shenzhen' },
    'hk':           { months: [1, 2, 3, 10, 11],     note: 'Oct–Mar: cool dry season, comfortable' },
    'philippines':  { months: [2, 3, 4],             note: 'Feb–Apr: Coron + El Nido dry season; Cebu sardine run Mar' },
    'transit-1':    { months: [3, 4],               note: 'Mar–Apr: optimal transit window to West Papua' },
    'raja-ampat':   { months: [10, 11, 12, 1, 2, 3, 4], note: 'Oct–Apr: mid-season, best visibility and calm seas' },
    'transit-2':    { months: [3, 4],               note: 'Post-liveaboard return transit to Bali' },
    'nusa-penida':  { months: [3, 4, 5, 6, 7, 8, 9], note: 'Mar–Sep: dry season, Crystal Bay mantas year-round' },
    'komodo':       { months: [3, 4, 5, 6, 7, 8],   note: 'Mar–Aug: dry season building, best visibility and seas' },
    'bali-volcano': { months: [4, 5, 6, 7, 8, 9],   note: 'Apr–Sep: dry season, clear volcanic views at dawn' },
    'borneo':       { months: [3, 4, 5, 6, 7, 8],   note: 'Mar–Aug: dry season, wildlife most active at rivers' },
    'singapore':    { months: [2, 3, 4, 5, 6, 7, 8], note: 'Feb–Aug: relatively drier, pleasant' },
    'kl':           { months: [1, 2, 3, 4, 6, 7],   note: 'Jan–Apr and Jun–Jul: relatively drier periods' },
    'penang':       { months: [1, 2, 3, 4, 5, 11, 12], note: 'Nov–May: drier side of the year in Penang' },
    'koh-tao':      { months: [4, 5, 6, 7, 8, 9],   note: 'Apr–Sep: dry Gulf coast, clear water, calm seas' },
    'bangkok':      { months: [11, 12, 1, 2, 3, 4, 5], note: 'Nov–May: manageable heat; hot in May but passing through' },
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
