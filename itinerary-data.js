// Sabbatical itinerary — single source of truth.
// Drives all three design directions. Read-only at runtime.

window.TRIP = (function () {
  const START = new Date('2026-09-15');
  const END = new Date('2027-06-04');
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
    crossroads:  { name: 'Crossroads',     accent: '#c2693a' },
    himalaya:    { name: 'Himalaya',       accent: '#7a8a52' },
    northeast:   { name: 'Northeast',      accent: '#a8543e' },
    middle:      { name: 'China & HK',     accent: '#b03a3a' },
    archipelago: { name: 'Archipelago',    accent: '#2c6f7a' },
    isthmus:     { name: 'SE Asia',        accent: '#c98a2a' },
    rainforest:  { name: 'Rainforest',     accent: '#3d6e4f' },
  };

  // ── Chapters ──
  // Each entry: id, num, kind, country, flag, title, dates, days, theme,
  // intro (poetic), tldr (condensed), weather, region, places[]
  const chapters = [
    {
      id: 'turkey', num: 1, kind: 'chapter', region: 'crossroads',
      country: 'Turkey', flag: '🇹🇷', title: 'Turkey',
      start: '2026-09-15', end: '2026-10-05', days: 20,
      theme: 'Ancient crossroads, surreal landscapes, warm Mediterranean end-of-summer',
      intro: 'September is the single best month to visit Turkey. Cappadocia balloon flights have optimal morning conditions. Istanbul is at peak warmth without summer crowds.',
      tldr: 'Istanbul · Cappadocia · Pamukkale · Ephesus · Antalya',
      weather: { hi: 28, lo: 16, label: 'Late summer, 28°/16°', emoji: '☀️' },
      photos: ['istanbul mosque','cappadocia balloons','pamukkale terraces','antalya harbour'],
      places: [
        { name: 'Istanbul', days: 10, query: 'Istanbul, Turkey',
          highlights: ['Hagia Sophia, Topkapi, Grand Bazaar','Bosphorus ferry — the most beautiful commute on Earth','Hammam at Cağaloğlu Baths','Beyoğlu rooftop bars, Karaköy galleries','Meyhane dinners with raki + meze','Princes\u2019 Islands day trip'] },
        { name: 'Cappadocia', days: 5, query: 'Göreme, Cappadocia, Turkey',
          highlights: ['Hot air balloon at sunrise — book in advance','Göreme Open Air Museum','Underground cities: Derinkuyu, Kaymakli','Rose Valley + Love Valley hikes','Cave hotel'] },
        { name: 'Pamukkale + Ephesus', days: 3, query: 'Pamukkale, Turkey',
          highlights: ['White calcium travertine terraces','Hierapolis ruins','Ephesus — one of the best-preserved Roman cities anywhere'] },
        { name: 'Antalya', days: 2, query: 'Antalya, Turkey',
          highlights: ['Mediterranean calm, old harbor','Brief decompression before Asia begins'] },
      ],
      booking: ['Cappadocia balloon — book by Aug 2026 (Royal Balloon / Butterfly Balloons)'],
    },
    {
      id: 'nepal', num: 2, kind: 'chapter', region: 'himalaya',
      country: 'Nepal', flag: '🇳🇵', title: 'Nepal',
      start: '2026-10-05', end: '2026-10-31', days: 26,
      theme: 'Sacred roof of the world, physical peak, elemental beauty',
      intro: 'October is the gold standard trekking month in Nepal. Monsoon has cleared. Skies are crystalline. Himalayan views are unobstructed 360°.',
      tldr: 'Kathmandu · Pokhara · Annapurna Base Camp trek · recovery',
      weather: { hi: 22, lo: 6, label: 'Post-monsoon, crystalline', emoji: '🏔️' },
      photos: ['kathmandu boudhanath stupa','annapurna himalaya','pokhara phewa lake','everest prayer flags'],
      places: [
        { name: 'Kathmandu', days: 5, query: 'Kathmandu, Nepal',
          highlights: ['Boudhanath Stupa','Pashupatinath Temple — sacred Hindu cremation ghats','Swayambhunath (Monkey Temple)','Durbar Square','Altitude acclimatization, gear check'] },
        { name: 'Pokhara', days: 2, query: 'Pokhara, Nepal',
          highlights: ['Phewa Lake calm before the trek','Annapurna range at dawn'] },
        { name: 'Annapurna Base Camp Trek', days: 13, query: 'Annapurna Base Camp, Nepal',
          highlights: ['Nayapul → Ghandruk → Chhomrong → Bamboo','Deurali → Machhapuchhre BC → ABC (4,130m)','Teahouse circuit — no camping gear needed','Rhododendron forests, glacial moraines','Return via Jhinu hot springs'] },
        { name: 'Pokhara recovery', days: 4, query: 'Phewa Lake, Pokhara',
          highlights: ['Lakeside slow meals, massage, reflection','Optional paragliding over Phewa Lake','Sārangkot sunrise over the Himalayas'] },
        { name: 'Kathmandu', days: 2, query: 'Bhaktapur, Nepal',
          highlights: ['Bhaktapur day trip — medieval city','Departure prep'] },
      ],
      booking: ['ACAP permit + TIMS card — on arrival in Kathmandu'],
    },
    {
      id: 'india', num: 3, kind: 'chapter', region: 'himalaya',
      country: 'India', flag: '🇮🇳', title: 'India',
      start: '2026-10-31', end: '2026-11-22', days: 22,
      theme: 'Sacred intensity, iconic monuments, wildlife, mountain escape',
      intro: 'Structured so Ranthambore falls Nov 7–11 — well past opening day, all zones operational, tigers active post-monsoon at waterholes.',
      tldr: 'Varanasi · Agra · Ranthambore · Jaipur · Darjeeling · Rishikesh',
      weather: { hi: 26, lo: 12, label: 'Post-monsoon clear, 26°/12°', emoji: '🌅' },
      photos: ['taj mahal sunrise','varanasi ghats','jaipur palace','darjeeling tea','ranthambore tiger'],
      places: [
        { name: 'Delhi', days: 1, query: 'Old Delhi, India',
          highlights: ['Transit, Old Delhi brief walk'] },
        { name: 'Varanasi', days: 4, query: 'Varanasi ghats, India',
          highlights: ['Oldest continuously inhabited city on Earth','Ghats at dawn — rowing on the Ganges in morning mist','Ganga Aarti at dusk — fire, flowers, bells','Manikarnika cremation ghats','Chai, silk, narrow alleys'] },
        { name: 'Agra', days: 2, query: 'Taj Mahal, Agra',
          highlights: ['Taj Mahal at sunrise — arrive 6am, golden light','Agra Fort','Mehtab Bagh — sunset Taj from across the river'] },
        { name: 'Ranthambore', days: 4, query: 'Ranthambore National Park',
          highlights: ['Tiger safari, all zones open in November','Zones 1–5 highest density','Leopards, sloth bears, crocodiles','Ranthambore Fort ruins inside the park'] },
        { name: 'Jaipur', days: 2, query: 'Jaipur, Rajasthan',
          highlights: ['Amber Fort, mirror palace','Hawa Mahal, City Palace','Jantar Mantar observatory','Pink City bazaars'] },
        { name: 'Darjeeling', days: 4, query: 'Darjeeling, India',
          highlights: ['Toy Train (UNESCO Himalayan Railway)','Tea estate walks + tastings','Tiger Hill sunrise — Kangchenjunga clear, Everest often visible','10–18°C — cool mountain air'] },
        { name: 'Rishikesh', days: 3, query: 'Rishikesh, India',
          highlights: ['Evening Ganga Aarti — more intimate than Varanasi','Yoga + meditation at Parmarth Niketan','Beatles Ashram ruins','Optional Ganges rafting'] },
        { name: 'Delhi', days: 2, query: 'Humayuns Tomb, Delhi',
          highlights: ['Humayun\u2019s Tomb','Lodhi Garden walk','Departure prep'] },
      ],
      booking: ['Ranthambore jeep safari — 3–6 months ahead for peak Nov season'],
    },
    {
      id: 'japan-autumn', num: 4, kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Autumn',
      start: '2026-11-22', end: '2026-12-08', days: 16,
      theme: 'Sacred refinement, koyo at peak, slow urban chapter',
      intro: 'Late November is the finest week of autumn foliage in Kyoto. Temples hold momiji light-ups — maple trees lit from below after dark, one of the most beautiful things Japan produces.',
      tldr: 'Tokyo · Nikko · Kyoto · Osaka — peak koyo',
      weather: { hi: 14, lo: 6, label: 'Crisp autumn, 14°/6°', emoji: '🍁' },
      photos: ['kyoto autumn maple','tokyo shimokitazawa','fushimi inari','osaka dotonbori','arashiyama bamboo'],
      places: [
        { name: 'Tokyo', days: 6, query: 'Shimokitazawa, Tokyo',
          highlights: ['Shimokitazawa vintage + live music','Yanaka shitamachi neighborhood','Shinjuku Gyoen mid-autumn foliage','Harajuku, Omotesando','Tsukiji outer market breakfast','Nikko day trip — Tosho-gu shrine, Kegon Falls'] },
        { name: 'Kyoto', days: 7, query: 'Eikan-do, Kyoto',
          highlights: ['Eikan-do — late-season foliage + night light-up','Tofuku-ji maple bridge','Fushimi Inari at dawn','Arashiyama bamboo grove + Tenryu-ji','Philosopher\u2019s Path in last color','Nishiki Market','Temporary-life chapter: recurring café'] },
        { name: 'Osaka', days: 3, query: 'Dotonbori, Osaka',
          highlights: ['Dotonbori, Kuromon Ichiba','Osaka Castle grounds','Shinsekai','Takoyaki, okonomiyaki, kushikatsu'] },
      ],
    },
    {
      id: 'korea', num: 5, kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2026-12-08', end: '2026-12-25', days: 17,
      theme: 'Electric winter hearth, K-culture, food depth, slow traditional chapter',
      intro: 'Palace grounds dusted with early snow, jjigae stews and makgeolli in pojangmacha tents, the Han River frozen at the edges.',
      tldr: 'Seoul · Busan · Gyeongju · Jeonju · Christmas Seoul',
      weather: { hi: 6, lo: -3, label: 'Cold + cozy, 6°/-3°', emoji: '❄️' },
      photos: ['seoul palace winter','busan gamcheon','gyeongju temple','jeonju hanok','korean street food'],
      places: [
        { name: 'Seoul', days: 5, query: 'Gyeongbokgung, Seoul',
          highlights: ['Gyeongbokgung + Changdeokgung in winter light','Bukchon Hanok Village','Gwangjang Market — bindaetteok, mayak gimbap','Hongdae, Itaewon, Insadong','Specialty coffee culture','DMZ day trip'] },
        { name: 'Busan', days: 4, query: 'Gamcheon Culture Village, Busan',
          highlights: ['Gamcheon Culture Village (hillside)','Jagalchi Fish Market — sea urchin, octopus','Haedong Yonggungsa seaside temple','Haeundae Beach empty in winter'] },
        { name: 'Gyeongju', days: 2, query: 'Bulguksa Temple, Gyeongju',
          highlights: ['Ancient Silla capital (57 BC – 935 AD)','Bulguksa (UNESCO), Seokguram Grotto','Tumuli Park burial mounds','Anapji Pond at dusk'] },
        { name: 'Jeonju', days: 4, query: 'Jeonju Hanok Village',
          highlights: ['The best Korean food city','800+ traditional hanok houses','Bibimbap origin city','Makgeolli bars, slow pace'] },
        { name: 'Seoul / Incheon', days: 2, query: 'Myeongdong, Seoul',
          highlights: ['Christmas atmosphere in Myeongdong','Departure prep'] },
      ],
    },
    {
      id: 'taiwan', num: 6, kind: 'chapter', region: 'northeast',
      country: 'Taiwan', flag: '🇹🇼', title: 'Taiwan',
      start: '2026-12-25', end: '2027-01-03', days: 9,
      theme: 'Café culture, NYE fireworks, dramatic east coast',
      intro: 'Taipei on New Year\u2019s Eve is one of Asia\u2019s great celebrations — the Taipei 101 countdown fireworks fired from the building itself in a vertical cascade.',
      tldr: 'Taipei · Jiufen · NYE · Taroko Gorge',
      weather: { hi: 18, lo: 13, label: 'Dry, clear, mild, 18°/13°', emoji: '🎆' },
      photos: ['taipei 101 night','jiufen old street','taroko gorge marble','taiwan night market'],
      places: [
        { name: 'Taipei', days: 7, query: 'Da\u2019an District, Taipei',
          highlights: ['Da\u2019an specialty coffee + bookshops','Jiufen — clifftop old mining town, lantern teahouses','Shilin Night Market','Elephant Mountain sunset hike','NYE Dec 31: Taipei 101 fireworks'] },
        { name: 'Hualien + Taroko Gorge', days: 2, query: 'Taroko Gorge, Taiwan',
          highlights: ['Train along Pacific coast — one of Asia\u2019s great rail journeys','Marble canyon, jade river','Qingshui Cliffs — Pacific walls dropping into ocean'] },
      ],
    },
    {
      id: 'japan-winter', num: 7, kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Winter',
      start: '2027-01-03', end: '2027-01-21', days: 18,
      theme: 'Snow architecture, powder snowboarding, mountain stillness',
      intro: 'Zero cities repeated from autumn. Completely different register: snow, mountains, physical exhilaration. New Year energy has passed — Japan in early January is calm and introspective.',
      tldr: 'Osaka · Kanazawa · Hakuba (11 days) · Matsumoto',
      weather: { hi: 4, lo: -4, label: 'Snow + powder, 4°/-4°', emoji: '🏂' },
      photos: ['hakuba snowboarding','kanazawa kenrokuen snow','matsumoto castle winter','japan onsen snow'],
      places: [
        { name: 'Osaka', days: 1, query: 'Dotonbori, Osaka',
          highlights: ['Arrival anchor','Winter seafood season (crab)','Dotonbori at night'] },
        { name: 'Kanazawa', days: 3, query: 'Kenrokuen, Kanazawa',
          highlights: ['Kenroku-en under snow lanterns','Higashi Chaya geisha district','Omicho Market — Sea of Japan seafood','Kanazawa Castle, sake breweries'] },
        { name: 'Hakuba Valley', days: 11, query: 'Hakuba, Japan',
          highlights: ['Rent ALL equipment + outerwear locally','Hakuba over Niseko — preserved Japan-ness','7–8 actual snowboard days','3–4 onsen days, mountain restaurants','Happo-one, Goryu, Cortina — three resorts','Izakaya nights, ramen, star-filled mountain sky'] },
        { name: 'Matsumoto', days: 2, query: 'Matsumoto Castle, Japan',
          highlights: ['Matsumoto Castle — one of Japan\u2019s finest originals','Sake brewery district','Natural departure point toward Nagoya'] },
      ],
    },
    {
      id: 'china-1', num: 8, kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 1',
      start: '2027-01-21', end: '2027-02-15', days: 25,
      theme: 'Surreal landscapes, ancient empire, cyberpunk cities',
      intro: 'South-to-north routing in winter. Southern cities are mild. Beijing in February — empty and possibly snow-dusted — is one of its most extraordinary versions.',
      tldr: 'Guilin · Zhangjiajie · Chongqing · Chengdu · Xi\u2019an · Beijing',
      weather: { hi: 12, lo: 2, label: 'Mild south → cold north', emoji: '🐼' },
      photos: ['guilin karst li river','zhangjiajie avatar pillars','chongqing cyberpunk night','chengdu panda','xian terracotta warriors','great wall snow'],
      places: [
        { name: 'Guilin / Yangshuo', days: 4, query: 'Yangshuo, China',
          highlights: ['Li River karst landscape','Bamboo raft on the Li River','Cycling through rice paddies','Winter mist between towers at dawn'] },
        { name: 'Zhangjiajie + Tianmen', days: 4, query: 'Zhangjiajie National Park',
          highlights: ['Avatar Mountains — floating sandstone pillars','Tianmen Stairway to Heaven (999 steps)','Glass Bridge — world\u2019s longest','Winter sea of clouds in valleys'] },
        { name: 'Chongqing', days: 3, query: 'Chongqing, China',
          highlights: ['The most cyberpunk city on Earth','Cable car across the Yangtze','Hongyadong riverside stilted buildings','Hotpot capital — multiple visits mandatory'] },
        { name: 'Chengdu', days: 3, query: 'Chengdu Panda Base',
          highlights: ['Giant panda base — morning, cold, active','Jinli Ancient Street, Kuanzhai Alley','Mapo tofu, dan dan noodles, more hotpot'] },
        { name: 'Xi\u2019an + Huashan', days: 4, query: 'Terracotta Warriors, Xi\u2019an',
          highlights: ['Terracotta Warriors — weather irrelevant','Cycle the Xi\u2019an city walls','Muslim Quarter — lamb skewers, biangbiang','Huashan Plank Walk — iron chains, 2000m drop'] },
        { name: 'Beijing', days: 5, query: 'Mutianyu Great Wall, Beijing',
          highlights: ['Great Wall (Mutianyu) — empty + snow-dusted','Forbidden City in winter light','Temple of Heaven','798 Art District','Hutong + Drum/Bell Towers','Peking duck'] },
        { name: 'Buffer', days: 2, query: 'Beijing, China',
          highlights: ['Travel buffer','Fly Beijing → HK Feb 15'] },
      ],
    },
    {
      id: 'hk', num: null, kind: 'reset', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong reset',
      start: '2027-02-15', end: '2027-02-18', days: 3,
      theme: 'Visa reset between China blocks',
      intro: 'Quick reset — laundry, planning, neon, dim sum.',
      tldr: 'Victoria Peak · Kowloon · Temple Street',
      weather: { hi: 19, lo: 15, label: 'Mild, 19°/15°', emoji: '🥟' },
      photos: ['hong kong skyline','hong kong dim sum','kowloon neon'],
      places: [
        { name: 'Hong Kong', days: 3, query: 'Victoria Peak, Hong Kong',
          highlights: ['Victoria Peak','Kowloon neon','Star Ferry','Dim sum','Temple Street Night Market','Rest, laundry, planning'] },
      ],
    },
    {
      id: 'china-2', num: 9, kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 2',
      start: '2027-02-18', end: '2027-03-05', days: 15,
      theme: 'Cosmopolitan China, future-tech China',
      intro: 'Shanghai is waking up to spring. Shenzhen in late February–March is mild and excellent.',
      tldr: 'Shanghai · Suzhou day trip · Shenzhen · Guangzhou day trip',
      weather: { hi: 16, lo: 8, label: 'Spring arriving, 16°/8°', emoji: '🌸' },
      photos: ['shanghai bund night','shanghai french concession','suzhou garden','shenzhen night skyline','guangzhou shamian'],
      places: [
        { name: 'Shanghai', days: 10, query: 'The Bund, Shanghai',
          highlights: ['French Concession — plane trees, Art Deco','The Bund — skyline across the Huangpu','Pudong + Oriental Pearl Tower','Yu Garden classical Chinese garden','Tianzifang arts + crafts alleys','Suzhou day trip — classical gardens, canals','Xintiandi, M50 art district'] },
        { name: 'Shenzhen', days: 4, query: 'Huaqiangbei, Shenzhen',
          highlights: ['Huaqiangbei Electronics Market','OCT Contemporary Art District','Dafen Oil Painting Village','Guangzhou day trip — Cantonese food, Shamian Island'] },
        { name: 'Exit', days: 1, query: 'Shenzhen Bay Port',
          highlights: ['Shenzhen → HK → Singapore'] },
      ],
    },
    {
      id: 'transit-1', num: null, kind: 'transit', region: 'archipelago',
      country: 'Transit', flag: '✈️', title: 'Transit to Sorong',
      start: '2027-03-05', end: '2027-03-07', days: 2,
      theme: 'HK → Singapore → Sorong (West Papua)',
      intro: 'Standard routing via Singapore or Denpasar. Arrive Sorong Mar 7, board liveaboard same day.',
      tldr: 'Hong Kong → Singapore → Sorong',
      weather: { hi: 30, lo: 24, label: 'Tropical', emoji: '✈️' },
      photos: ['airplane tropical','singapore changi airport'],
      places: [
        { name: 'Transit', days: 2, query: 'Sorong, West Papua',
          highlights: ['Long-haul reset','Pack down trekking gear, swap to dive kit'] },
      ],
    },
    {
      id: 'raja-ampat', num: 10, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Raja Ampat',
      start: '2027-03-07', end: '2027-03-18', days: 11,
      theme: 'The best diving on Earth',
      intro: 'Raja Ampat contains the highest marine biodiversity on the planet. More fish species in one bay than in the entire Caribbean.',
      tldr: '10-day liveaboard — Wayag, Cape Kri, Manta Sandy',
      weather: { hi: 32, lo: 26, label: 'Mid-season ideal, 32°/26°', emoji: '🐠' },
      photos: ['raja ampat aerial wayag','manta ray cleaning station','coral reef indonesia','pygmy seahorse','reef sharks'],
      places: [
        { name: 'Liveaboard', days: 10, query: 'Wayag, Raja Ampat',
          highlights: ['Wayag — postcard karst islands','Cape Kri — world record fish count','Manta Sandy — manta cleaning station','Melissa\u2019s Garden — pristine hard coral','Pianemo — smaller, fewer boats','Blue Water Mantas — oceanic, 6m wingspan','Wobbegongs, walking sharks, pygmy seahorses'] },
      ],
      diving: { sites: 30, type: 'Liveaboard', operators: 'Papua Diving / Meridian Adventure' },
      booking: ['Raja Ampat liveaboard — book by Oct 2025'],
    },
    {
      id: 'philippines', num: 11, kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-03-18', end: '2027-04-01', days: 14,
      theme: 'Diving holy grail, limestone island recovery',
      intro: 'Tubbataha Reef — UNESCO World Heritage, accessible only mid-March to June, 6 hours into the Sulu Sea, zero other tourists.',
      tldr: 'Manila · Tubbataha liveaboard · El Nido recovery',
      weather: { hi: 31, lo: 25, label: 'Dry season, 31°/25°', emoji: '🏝️' },
      photos: ['el nido lagoon','tubbataha reef hammerhead','palawan limestone','intramuros manila'],
      places: [
        { name: 'Manila', days: 1, query: 'Intramuros, Manila',
          highlights: ['Intramuros — walled Spanish colonial city','Fly Manila → Puerto Princesa'] },
        { name: 'Tubbataha Reef', days: 9, query: 'Tubbataha Reefs, Philippines',
          highlights: ['UNESCO World Heritage','6 hours from Puerto Princesa','Hammerhead schools, whale sharks, mantas','Napoleon wrasse, pristine walls','Strict permit limit — opening of operating window'] },
        { name: 'El Nido', days: 3, query: 'El Nido, Palawan',
          highlights: ['Island-hopping: Secret + Big + Small Lagoons','Cadlao Island','Limestone cliffs, turquoise shallows','Long beach lunches, no agenda'] },
      ],
      diving: { sites: 20, type: 'Liveaboard', operators: 'Various — book early' },
      booking: ['Tubbataha liveaboard — book by Oct 2025'],
    },
    {
      id: 'bali', num: 12, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Bali + Nusa Penida',
      start: '2027-04-01', end: '2027-04-08', days: 7,
      theme: 'Tropical landing, raw island escape, manta warm-up',
      intro: 'Nusa Penida is completely different from Bali: arid, dramatic, raw, far fewer tourists. Crystal Bay mantas year-round.',
      tldr: 'Canggu/Seminyak · Nusa Penida (5 days)',
      weather: { hi: 30, lo: 24, label: 'Transition season, 30°/24°', emoji: '🌴' },
      photos: ['kelingking beach trex','nusa penida cliff','bali beach club','canggu sunset'],
      places: [
        { name: 'Bali', days: 2, query: 'Canggu, Bali',
          highlights: ['Canggu / Seminyak','Brief and intentional — easy to overstay'] },
        { name: 'Nusa Penida', days: 5, query: 'Kelingking Beach, Nusa Penida',
          highlights: ['Kelingking Beach — T-Rex cliff','Angel\u2019s Billabong + Broken Beach','Crystal Bay — reef mantas year-round','Atuh Beach — remote east coast','Scooter rental for full freedom'] },
      ],
    },
    {
      id: 'singapore', num: 13, kind: 'chapter', region: 'isthmus',
      country: 'Singapore', flag: '🇸🇬', title: 'Singapore',
      start: '2027-04-08', end: '2027-04-15', days: 7,
      theme: 'World-class food, modern wonder, city recharge',
      intro: 'Effective recharge hub: clean, organized, excellent food infrastructure, everything works.',
      tldr: 'Hawker centres · Gardens by the Bay · Marina Bay',
      weather: { hi: 31, lo: 25, label: 'Hot + humid', emoji: '🌳' },
      photos: ['gardens by the bay supertree','marina bay sands night','singapore hawker food','changi airport waterfall'],
      places: [
        { name: 'Singapore', days: 7, query: 'Marina Bay, Singapore',
          highlights: ['Maxwell, Lau Pa Sat, Old Airport Road hawker','Gardens by the Bay — Supertree Grove at night','Marina Bay Sands observation deck','Chinatown, Little India, Haji Lane','National Gallery Singapore','Changi Airport waterfall walk'] },
      ],
    },
    {
      id: 'bangkok', num: 14, kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Bangkok',
      start: '2027-04-15', end: '2027-04-22', days: 7,
      theme: 'Urban intensity, street food, temples',
      intro: 'Bangkok in April is 34–37°C — hot but city travel is fine.',
      tldr: 'Wat Pho · Grand Palace · Yaowarat · Kanchanaburi',
      weather: { hi: 36, lo: 26, label: 'Hot dry, 36°/26°', emoji: '🛺' },
      photos: ['bangkok wat arun','bangkok street food','grand palace bangkok','chatuchak market'],
      places: [
        { name: 'Bangkok', days: 7, query: 'Wat Pho, Bangkok',
          highlights: ['Wat Pho — reclining Buddha + massage school','Grand Palace + Wat Phra Kaew','Khlong canal boat commute','Chatuchak Weekend Market (Sat–Sun)','Yaowarat (Chinatown) at night','Kanchanaburi day trip — Erawan Falls, Death Railway'] },
      ],
    },
    {
      id: 'koh-tao', num: 15, kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Koh Tao',
      start: '2027-04-22', end: '2027-04-30', days: 8,
      theme: 'Tropical reset, warm water, reef diving',
      intro: 'Gulf coast — April is firmly dry season on this side. Clear water, calm seas, 30°C.',
      tldr: 'Koh Tao (6 days) · Koh Samui (2 days)',
      weather: { hi: 31, lo: 27, label: 'Dry season Gulf', emoji: '🐢' },
      photos: ['koh tao diving','sail rock thailand','koh samui beach','thailand reef'],
      places: [
        { name: 'Koh Tao', days: 6, query: 'Koh Tao, Thailand',
          highlights: ['One of the best value diving destinations','Japanese Gardens, Chumphon Pinnacle','Sail Rock — whale shark territory','Hammock, reef, lunch, repeat'] },
        { name: 'Koh Samui', days: 2, query: 'Chaweng Beach, Koh Samui',
          highlights: ['Chaweng Beach','Big Buddha','Transfer point'] },
      ],
      diving: { sites: 8, type: 'Day boats', operators: 'Several solid shops on island' },
    },
    {
      id: 'penang', num: 16, kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Penang',
      start: '2027-04-30', end: '2027-05-10', days: 10,
      theme: 'Street food, café culture, colonial slow life',
      intro: 'Georgetown is the best café-culture slow chapter in mainland SE Asia. Find a recurring breakfast spot. Walk the same route each morning.',
      tldr: 'Georgetown · Armenian Street · Gurney Drive hawker',
      weather: { hi: 32, lo: 25, label: 'Warm + humid', emoji: '☕' },
      photos: ['penang street art','georgetown shophouse','penang hawker','clan jetties penang'],
      places: [
        { name: 'Penang', days: 10, query: 'Armenian Street, Georgetown',
          highlights: ['Armenian Street — Zacharevic murals, shophouses','Gurney Drive hawker — char kway teow, asam laksa','Clan Jetties — Chinese stilt villages','Penang Hill funicular','Kek Lok Si Temple, Blue Mansion','Temporary-life chapter — recurring breakfast'] },
      ],
    },
    {
      id: 'kl', num: 17, kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Kuala Lumpur',
      start: '2027-05-10', end: '2027-05-13', days: 3,
      theme: 'Urban contrast before the wild',
      intro: 'A quick urban turn before flying east to Borneo.',
      tldr: 'Petronas · Batu Caves · Bukit Bintang',
      weather: { hi: 33, lo: 24, label: 'Warm + humid', emoji: '🏙️' },
      photos: ['petronas towers night','batu caves rainbow steps','kl night market'],
      places: [
        { name: 'Kuala Lumpur', days: 3, query: 'Petronas Twin Towers, KL',
          highlights: ['Petronas Twin Towers at night','Batu Caves — rainbow steps, macaques','Jalan Alor Night Food Street','Bukit Bintang neighborhood'] },
      ],
    },
    {
      id: 'borneo', num: 18, kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Borneo / Sabah',
      start: '2027-05-13', end: '2027-05-23', days: 10,
      theme: 'Wildlife encounters, orangutans, river safari',
      intro: 'Kinabatangan is one of SE Asia\u2019s finest wildlife corridors. Proboscis monkeys, pygmy elephants bathing at dawn.',
      tldr: 'Sepilok · Kinabatangan River · Kota Kinabalu',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧' },
      photos: ['borneo orangutan','kinabatangan river','proboscis monkey','sepilok','sipadan diving'],
      places: [
        { name: 'Sepilok', days: 2, query: 'Sepilok Orangutan Centre',
          highlights: ['Sepilok Orangutan Rehabilitation Centre','Bornean Sun Bear Conservation Centre'] },
        { name: 'Kinabatangan River', days: 5, query: 'Kinabatangan River, Sabah',
          highlights: ['Proboscis monkeys — endemic to Borneo','Pygmy elephants bathing at dawn','Hornbills, kingfishers, monitor lizards','Fireflies along the riverbank','Jungle lodges — wake to gibbons'] },
        { name: 'Kota Kinabalu', days: 3, query: 'Kota Kinabalu, Sabah',
          highlights: ['Waterfront sunset','Filipino Night Market','Optional Sipadan diving (3 extra days)'] },
      ],
      diving: { sites: 6, type: 'Optional Sipadan day boats', operators: 'Permit-limited' },
      booking: ['Sipadan permits — book by Nov 2026 (120/day cap)'],
    },
    {
      id: 'komodo', num: 19, kind: 'chapter', region: 'rainforest',
      country: 'Indonesia', flag: '🇮🇩', title: 'Komodo',
      start: '2027-05-23', end: '2027-06-04', days: 12,
      theme: 'Dragons, world-class diving, wild Indonesia, emotional close',
      intro: 'Late May–June is peak dry season. Best visibility, calmest seas, most reliable weather. Day trips from Labuan Bajo — no liveaboard needed.',
      tldr: 'Labuan Bajo · Komodo NP day trips · Padar sunrise',
      weather: { hi: 31, lo: 23, label: 'Peak dry season', emoji: '🐉' },
      photos: ['padar island viewpoint','komodo dragon','manta point komodo','pink beach komodo','phinisi boat'],
      places: [
        { name: 'Labuan Bajo / Flores', days: 2, query: 'Labuan Bajo, Flores',
          highlights: ['Gateway — dramatic harbor, wooden phinisi boats','Sunset from Bukit Cinta','Grilled fish with sambal'] },
        { name: 'Komodo National Park', days: 10, query: 'Komodo National Park',
          highlights: ['Manta Point — oceanic mantas in current','Crystal Rock + Castle Rock — drift dives','Pink Beach — crushed red coral','Batu Bolong — pinnacle, coral so dense no bare rock','Komodo dragons with ranger','Padar Island sunrise — three colored bays'] },
      ],
      diving: { sites: 12, type: 'Day trips by fast boat', operators: 'Many in Labuan Bajo' },
    },
  ];

  // Compute total chapter count for headers
  const chapterCount = chapters.filter(c => c.kind === 'chapter').length;

  // Bookings (flat list pulled from chapters + a few overall)
  const bookings = [
    { task: 'Raja Ampat liveaboard',     by: 'By Oct 2025', critical: true,  notes: 'Papua Diving / Meridian Adventure book out 6+ months ahead' },
    { task: 'Tubbataha liveaboard',      by: 'By Oct 2025', critical: true,  notes: 'Operating window is fixed and boats fill' },
    { task: 'Sipadan permits',           by: 'By Nov 2026', critical: true,  notes: '120 permits/day cap, sells out months ahead' },
    { task: 'Cappadocia balloon',        by: 'By Aug 2026', critical: false, notes: 'Royal Balloon / Butterfly Balloons' },
    { task: 'Ranthambore jeep safari',   by: '3–6mo ahead', critical: false, notes: 'Zones 1–5 fill fast for peak Nov season' },
    { task: 'Annapurna permits',         by: 'On arrival',  critical: false, notes: 'ACAP permit + TIMS card in Kathmandu' },
  ];

  // Diving log
  const diving = [
    { where: 'Nusa Penida — Crystal Bay', dates: 'Apr 3–8',   days: 5,  notes: 'Reef mantas, year-round' },
    { where: 'Raja Ampat',                dates: 'Mar 7–18',  days: 10, notes: 'Mid-season liveaboard' },
    { where: 'Tubbataha Reef',            dates: 'Mar 19–28', days: 9,  notes: 'UNESCO, opening of Mar–Jun window' },
    { where: 'Koh Tao',                   dates: 'Apr 22–28', days: 6,  notes: 'Value diving, whale sharks at Sail Rock' },
    { where: 'Sipadan (optional)',        dates: 'May 20–23', days: 3,  notes: '120 permits/day' },
    { where: 'Komodo',                    dates: 'May 25 – Jun 4', days: 10, notes: 'Peak dry, mantas + drift' },
  ];

  // Budget anchors
  const budget = {
    estimate: 'USD 48–60k for two',
    inBRL: '~140–175k BRL per person',
    expensive: ['Raja Ampat liveaboard','Tubbataha liveaboard','Hakuba lift + gear','Japan generally'],
    cheap: ['Nepal','India','Indonesia (outside dives)','Malaysia','Philippines (outside dives)'],
    splurges: ['Both liveaboards','Hakuba snowboarding','One Kyoto ryokan night','Cappadocia cave hotel','Kanazawa boutique'],
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
    'turkey':       { months: [9, 10],          note: 'Sep–Oct: post-summer, ideal weather, balloon season' },
    'nepal':        { months: [10, 11],          note: 'Oct–Nov: post-monsoon, crystalline skies, best trekking' },
    'india':        { months: [10, 11, 12],      note: 'Oct–Dec: post-monsoon, wildlife active, Ranthambore open' },
    'japan-autumn': { months: [11],              note: 'Nov: peak koyo (autumn foliage) in Kyoto temples' },
    'korea':        { months: [12, 1],           note: 'Dec–Jan: winter hearth atmosphere, early snow on palaces' },
    'taiwan':       { months: [12, 1],           note: 'Dec–Jan: dry season, NYE fireworks at Taipei 101' },
    'japan-winter': { months: [1, 2],            note: 'Jan–Feb: peak powder season in Hakuba Valley' },
    'china-1':      { months: [1, 2, 3],         note: 'Jan–Mar: low crowds, mild south, quiet Beijing' },
    'hk':           { months: [1, 2, 3, 10, 11], note: 'Oct–Mar: cool dry season, comfortable' },
    'china-2':      { months: [2, 3, 4],         note: 'Feb–Apr: spring arriving, warming, before summer crowds' },
    'transit-1':    { months: [3, 4],            note: 'Mar–Apr: optimal transit window to West Papua' },
    'raja-ampat':   { months: [10, 11, 12, 1, 2, 3, 4], note: 'Oct–Apr: mid-season, best visibility and calm seas' },
    'philippines':  { months: [3, 4, 5, 6],      note: 'Mar–Jun: Tubbataha operating window, dry Palawan season' },
    'bali':         { months: [4, 5, 6, 7, 8, 9], note: 'Apr–Sep: dry season, best diving at Crystal Bay' },
    'singapore':    { months: [2, 3, 4, 5, 6, 7, 8], note: 'Feb–Aug: relatively drier, pleasant' },
    'bangkok':      { months: [11, 12, 1, 2, 3], note: 'Nov–Mar: cooler dry season, bearable heat' },
    'koh-tao':      { months: [4, 5, 6, 7, 8, 9], note: 'Apr–Sep: dry Gulf coast, clear water, calm seas' },
    'penang':       { months: [1, 2, 3, 4, 11, 12], note: 'Nov–Apr: drier northwest monsoon season done' },
    'kl':           { months: [1, 2, 3, 6, 7],   note: 'Jan–Mar and Jun–Jul: relatively drier periods' },
    'borneo':       { months: [3, 4, 5, 6, 7, 8], note: 'Mar–Aug: dry season, wildlife most active at rivers' },
    'komodo':       { months: [5, 6, 7, 8],      note: 'May–Aug: peak dry season, calmest seas, best visibility' },
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
