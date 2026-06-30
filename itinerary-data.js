// Sabbatical itinerary — single source of truth.
// Drives all three design directions. Read-only at runtime.

window.TRIP = (function () {
  const START = new Date('2026-06-21');
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
  // Each entry: id, num, kind, country, flag, title, dates, days, theme,
  // intro (poetic), tldr (condensed), weather, region, places[]
  const chapters = [
    {
      id: 'rio', num: 1, kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'Rio de Janeiro',
      start: '2026-06-21', end: '2026-07-20', days: 29,
      theme: 'A cidade maravilhosa — verão carioca, morro, praia, samba',
      intro: 'Junho e julho são a melhor época no Rio: céu limpo, temperatura ideal, sem umidade do verão. A cidade como ela é — sem a loucura do carnaval, mas com toda a energia.',
      tldr: 'Copacabana · Lapa · Santa Teresa · Sugarloaf',
      weather: { hi: 27, lo: 18, label: 'Inverno carioca, 27°/18°', emoji: '🌊' },
      photos: ['rio aerial', 'copacabana beach', 'lapa arches', 'santa teresa rio'],
      places: [
        { name: 'Rio de Janeiro', days: 29, query: 'Ipanema, Rio de Janeiro',
          highlights: ['Cristo Redentor ao amanhecer — antes das 8h, sem turistas','Pão de Açúcar no fim do dia — teleférico + vista da Baía de Guanabara','Copacabana + Ipanema: calçadão, quiosques, vôlei de praia','Lapa na quinta e sexta: frevos, samba ao vivo, arcos iluminados','Santa Teresa: bonde histórico, ateliês, Bar do Gomez','Maracanã: assistir um clássico Fla-Flu ou Fla-Vasco','Jardim Botânico + Lagoa Rodrigo de Freitas: corrida ou pedalada','Museu do Amanhã + Boulevard Olímpico: revitalização da zona portuária','Feira de São Cristóvão aos fins de semana: forró, comida nordestina','Prainha + Grumari: praias selvagens no extremo oeste da cidade'] },
      ],
    },
    {
      id: 'cumbuco', num: 2, kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'Cumbuco',
      start: '2026-07-21', end: '2026-08-17', days: 27,
      theme: 'Kite, lagoa, dunas — melhor vento do Brasil',
      intro: 'Julho a agosto é o pico da temporada de vento no Ceará. Cumbuco tem a combinação perfeita: vento constante, lagoas de água doce para fazer kite, dunas, jangadas, e ritmo de interior nordestino.',
      tldr: 'Cumbuco · Lagoa do Cauípe · dunas · jangadas',
      weather: { hi: 30, lo: 24, label: 'Nordeste seco, 30°/24°', emoji: '🪁' },
      photos: ['cumbuco beach kites', 'cumbuco kitesurf', 'cumbuco mural', 'super cumbuco'],
      places: [
        { name: 'Cumbuco', days: 27, query: 'Cumbuco, Caucaia, Ceará',
          highlights: ['Kitesurf na Lagoa do Cauípe — vento de 25–35 nós constante, água rasa e quente','Aulas e progressão de kite (ou wing/windsurf) no flatwater da lagoa','Passeio de buggy pelas dunas e lagoas da orla','Jangada ao amanhecer com pescadores locais','Lagoa Barra Seca + Lagoa Grande de buggy','Pôr do sol na praia com caju gelado','Frutos do mar frescos na orla: lagosta, camarão, peixe grelhado'] },
      ],
    },
    {
      id: 'saopaulo', num: 3, kind: 'chapter', region: 'americas',
      country: 'Brasil', flag: '🇧🇷', title: 'São Paulo',
      start: '2026-08-17', end: '2026-08-23', days: 6,
      theme: 'Metrópole cultural, gastronomia, despedida',
      intro: 'Seis dias para fechar o ciclo brasileiro antes de embarcar. São Paulo tem a melhor cena gastronômica da América Latina e um circuito cultural denso — MASP, Pinacoteca, Vila Madelena.',
      tldr: 'MASP · Vila Madelena · Liberdade · Ibirapuera',
      weather: { hi: 24, lo: 14, label: 'Inverno paulistano, 24°/14°', emoji: '☕' },
      photos: ['masp sao paulo', 'sao paulo skyline', 'ibirapuera park', 'vila madelena art'],
      places: [
        { name: 'São Paulo', days: 6, query: 'Avenida Paulista, São Paulo',
          highlights: ['MASP — acervo europeu em estrutura suspensa sobre a Paulista','Pinacoteca do Estado — melhor museu de arte brasileira','Vila Madelena: Beco do Batman, ateliês, bares, brunch','Liberdade: bairro japonês — yakisoba, onigiri, cultura nikkei','Ibirapuera: corrida, Museu Afro, Oca, pavilhões de Niemeyer','Mercadão Municipal: mortadela, bacalhau, frutas exóticas','Jantar de despedida no Japinha ou rodízio paulistano clássico','Fly São Paulo → Toronto para abrir o sabbatical internacional'] },
      ],
    },
    {
      id: 'toronto', num: 4, kind: 'chapter', region: 'americas',
      country: 'Canada', flag: '🇨🇦', title: 'Toronto',
      start: '2026-08-24', end: '2026-08-27', days: 3,
      theme: 'North American send-off, city stopover before Europe',
      intro: 'Three days in Toronto before crossing the Atlantic — a proper send-off from North America. Late August means warm evenings, patios open, and Kensington Market at its best.',
      tldr: 'Kensington Market · Distillery District · CN Tower',
      weather: { hi: 27, lo: 17, label: 'Late summer, 27°/17°', emoji: '🍁' },
      photos: ['toronto cn tower', 'toronto distillery', 'niagara falls'],
      places: [
        { name: 'Toronto', days: 3, query: 'Kensington Market, Toronto',
          highlights: ['Kensington Market — multicultural street market, vintage shops, food stalls','Distillery District — Victorian industrial complex turned arts village','CN Tower + the Harbourfront waterfront walk','High Park late-summer picnic','Toronto Islands ferry — city skyline across Lake Ontario','Optional day trip: Niagara Falls (1.5h by car or GO bus)','Fly Toronto → Athens to open Mediterranean chapter'] },
      ],
    },
    {
      id: 'athens', num: 5, kind: 'chapter', region: 'mediterranean',
      country: 'Greece', flag: '🇬🇷', title: 'Athens',
      start: '2026-08-27', end: '2026-09-08', days: 12,
      theme: 'Ancient Mediterranean, cradle of Western civilization, island prologue',
      intro: 'Athens in late August: the Acropolis catches golden light at 7am before the crowds arrive. Monastiraki is electric at night. The Greek islands are a fast ferry away. A perfect opener before the rest of the world.',
      tldr: 'Athens · Acropolis · Hydra island · Cape Sounion',
      weather: { hi: 32, lo: 22, label: 'Warm Mediterranean, 32°/22°', emoji: '🏛️' },
      photos: ['athens acropolis', 'athens monastiraki', 'hydra island greece', 'cape sounion'],
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
      id: 'turkey', num: 6, kind: 'chapter', region: 'crossroads',
      country: 'Turkey', flag: '🇹🇷', title: 'Turkey',
      start: '2026-09-08', end: '2026-09-30', days: 22,
      theme: 'Ancient crossroads, Aegean coast, surreal landscapes',
      intro: 'September is the single best month to visit Turkey. Cappadocia balloon flights have optimal morning conditions. Alacatı offers Aegean coast life at its best. Istanbul before the autumn shift.',
      tldr: 'Istanbul · Alacatı · Pamukkale · Ephesus · Cappadocia',
      weather: { hi: 28, lo: 16, label: 'Late summer, 28°/16°', emoji: '☀️' },
      photos: ['istanbul mosque', 'alacati aegean', 'cappadocia balloons', 'pamukkale terraces'],
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
      id: 'india', num: 7, kind: 'chapter', region: 'himalaya',
      country: 'India', flag: '🇮🇳', title: 'India',
      start: '2026-10-01', end: '2026-10-21', days: 20,
      theme: 'Sacred intensity, iconic monuments, Himalayan slow life',
      intro: 'A tighter, more intentional India: Varanasi for spiritual intensity, the Golden Triangle, then a full week in Rishikesh for yoga, river, and mountain air.',
      tldr: 'Delhi · Varanasi · Agra · Jaipur · Rishikesh',
      weather: { hi: 30, lo: 16, label: 'Post-monsoon clear, 30°/16°', emoji: '🌅' },
      photos: ['taj mahal sunrise', 'varanasi ghats', 'jaipur palace', 'rishikesh yoga'],
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
          highlights: ['Humayun\'s Tomb','Lodhi Garden walk','Departure prep, fly to Kathmandu'] },
      ],
      booking: [],
    },
    {
      id: 'nepal', num: 8, kind: 'chapter', region: 'himalaya',
      country: 'Nepal', flag: '🇳🇵', title: 'Nepal',
      start: '2026-10-21', end: '2026-11-10', days: 20,
      theme: 'Sacred roof of the world, physical peak, elemental beauty',
      intro: 'Late October into November — post-monsoon clarity holds, skies still crystalline, Himalayan views unobstructed 360°. Slightly cooler than October, meaning fewer crowds on the trail and sharper air at altitude.',
      tldr: 'Kathmandu · Pokhara · Annapurna Base Camp trek',
      weather: { hi: 18, lo: 2, label: 'Late post-monsoon, 18°/2°', emoji: '🏔️' },
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
      id: 'japan-autumn', num: 9, kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Autumn',
      start: '2026-11-10', end: '2026-11-30', days: 20,
      theme: 'Sacred refinement, koyo at peak, slow urban chapter',
      intro: 'Tokyo first for peak city-koyo. Osaka as the bridge. Kyoto last — crowds thin after Nov 26 while late-season foliage (Eikan-do, Tofuku-ji) holds. This order means the best is saved.',
      tldr: 'Tokyo · Osaka · Kyoto — peak koyo (Kyoto last)',
      weather: { hi: 14, lo: 6, label: 'Crisp autumn, 14°/6°', emoji: '🍁' },
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
      id: 'korea', num: 10, kind: 'chapter', region: 'northeast',
      country: 'South Korea', flag: '🇰🇷', title: 'South Korea',
      start: '2026-11-30', end: '2026-12-24', days: 24,
      theme: 'Electric winter hearth, K-culture, food depth, slow traditional chapter',
      intro: 'Palace grounds dusted with early snow, jjigae stews and makgeolli in pojangmacha tents, the Han River frozen at the edges. December Seoul is vibrant with Christmas energy.',
      tldr: 'Seoul · Busan · Gyeongju · Jeonju · Christmas Seoul',
      weather: { hi: 6, lo: -3, label: 'Cold + cozy, 6°/-3°', emoji: '❄️' },
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
      id: 'taiwan', num: 11, kind: 'chapter', region: 'northeast',
      country: 'Taiwan', flag: '🇹🇼', title: 'Taiwan',
      start: '2026-12-24', end: '2027-01-02', days: 9,
      theme: 'Café culture, NYE fireworks, dramatic east coast',
      intro: 'Arrive Christmas Eve. Taipei on New Year\'s Eve is one of Asia\'s great celebrations — the Taipei 101 countdown fireworks fired from the building itself in a vertical cascade.',
      tldr: 'Taipei · Jiufen · NYE Dec 31 · Taroko Gorge',
      weather: { hi: 18, lo: 13, label: 'Dry, clear, mild, 18°/13°', emoji: '🎆' },
      photos: ['taipei 101 night', 'jiufen old street', 'taroko gorge marble', 'taiwan night market'],
      places: [
        { name: 'Taipei', days: 7, query: 'Da\'an District, Taipei',
          highlights: ['Da\'an specialty coffee + bookshops','Jiufen — clifftop mining town, lantern-lit teahouses, mist','Shilin Night Market','Elephant Mountain sunset hike over the skyline','NYE Dec 31: Taipei 101 fireworks — fired from the building, visible citywide ✓'] },
        { name: 'Hualien + Taroko Gorge', days: 2, query: 'Taroko Gorge, Taiwan',
          highlights: ['Train along Pacific coast — one of Asia\'s great rail journeys','Marble canyon, jade river, suspension bridges','Qingshui Cliffs — Pacific walls dropping into the ocean'] },
      ],
    },
    {
      id: 'japan-winter', num: 12, kind: 'chapter', region: 'northeast',
      country: 'Japan', flag: '🇯🇵', title: 'Japan — Winter',
      start: '2027-01-02', end: '2027-01-12', days: 10,
      theme: 'Powder snowboarding, mountain stillness, onsen',
      intro: 'Focused Hakuba: a pure snowboard chapter. No city detours — just powder, onsen, and mountain ramen. Early January is uncrowded and Japan is introspective.',
      tldr: 'Osaka (arrival) · Hakuba Valley (8 days snowboard)',
      weather: { hi: 4, lo: -4, label: 'Snow + powder, 4°/-4°', emoji: '🏂' },
      photos: ['hakuba snowboarding', 'japan onsen snow', 'kanazawa kenrokuen snow', 'matsumoto castle winter'],
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
      id: 'china-1', num: 13, kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 1',
      start: '2027-01-12', end: '2027-02-11', days: 30,
      theme: 'Imperial capital, global finance hub, future-tech frontier',
      intro: 'The three great metropolises in one extended block. Beijing in January — empty and sometimes snow-dusted — is one of its finest versions. Shanghai rewards lingering. Shenzhen is the most forward-facing city on Earth.',
      tldr: 'Beijing · Shanghai · Suzhou · Shenzhen',
      weather: { hi: 8, lo: -2, label: 'Cold north, mild south', emoji: '🏙️' },
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
      id: 'hk', num: 14, kind: 'chapter', region: 'middle',
      country: 'Hong Kong', flag: '🇭🇰', title: 'Hong Kong',
      start: '2027-02-11', end: '2027-02-16', days: 5,
      theme: 'Neon city, dim sum, visa reset between China and Philippines',
      intro: 'Five days in one of the world\'s great cities. Neon-soaked Kowloon, world-class dim sum, the Star Ferry crossing at night. A proper chapter, not just a transit.',
      tldr: 'Victoria Peak · Kowloon neon · Dim sum · Lamma Island',
      weather: { hi: 19, lo: 15, label: 'Mild, 19°/15°', emoji: '🥟' },
      photos: ['hong kong skyline', 'kowloon neon', 'hong kong dim sum'],
      places: [
        { name: 'Hong Kong', days: 5, query: 'Victoria Peak, Hong Kong',
          highlights: ['Victoria Peak — harbor panorama at dusk, city grid below','Star Ferry crossing: Kowloon → Central at night','Dim sum yum cha: Tim Ho Wan, Lin Heung, One Dim Sum','Temple Street Night Market — jade, fortune tellers, street food','Nan Lian Garden + Chi Lin Nunnery (free, stunning)','Lamma Island day trip: seafood lunch, car-free village walk','Tai O fishing village: stilt houses over tidal channels','Rest, laundry, planning — fly HK → Manila Feb 16'] },
      ],
    },
    {
      id: 'philippines', num: 15, kind: 'chapter', region: 'archipelago',
      country: 'Philippines', flag: '🇵🇭', title: 'Philippines',
      start: '2027-02-16', end: '2027-03-09', days: 21,
      theme: 'WWII wreck diving, limestone islands, warm-up for Raja Ampat',
      intro: 'Coron for the greatest wreck dives on Earth. El Nido for limestone drama. Cebu/Moalboal for the sardine run — all warm-up diving before Raja Ampat. No liveaboard here.',
      tldr: 'Manila · Coron · El Nido · Cebu/Moalboal',
      weather: { hi: 31, lo: 25, label: 'Dry season, 31°/25°', emoji: '🏝️' },
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
      id: 'indonesia-1', num: 16, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia — Raja Ampat',
      start: '2027-03-09', end: '2027-03-22', days: 14,
      theme: 'The best diving on Earth — liveaboard deep dive',
      intro: 'Raja Ampat contains the highest marine biodiversity on the planet. More fish species in one bay than in the entire Caribbean. Transit in, 10 days on the water, transit back to Bali.',
      tldr: 'Transit to Sorong · 10d liveaboard · Back to Bali',
      weather: { hi: 32, lo: 26, label: 'Mid-season ideal, 32°/26°', emoji: '🐠' },
      photos: ['raja ampat aerial wayag', 'manta ray cleaning station', 'coral reef indonesia', 'pygmy seahorse', 'reef sharks'],
      places: [
        { name: 'Transit to Sorong', days: 2, query: 'Sorong, West Papua',
          highlights: ['Cebu → Manado or Manila → Sorong routing','Indonesia visa on arrival — Day 1 of 30-day window','Pack down to liveaboard dive kit, board same day'] },
        { name: 'Raja Ampat Liveaboard', days: 10, query: 'Wayag, Raja Ampat',
          highlights: ['Wayag — postcard karst islands, kayak + hike viewpoint','Cape Kri — world record fish count dive site','Manta Sandy — manta ray cleaning station','Melissa\'s Garden — pristine hard coral','Pianemo — smaller Wayag, equally dramatic, fewer boats','Blue Water Mantas — oceanic, 6m wingspan','Wobbegongs, walking sharks, pygmy seahorses, nudibranchs','Book Papua Diving / Meridian Adventure — by Oct 2025'] },
        { name: 'Transit Sorong → Bali', days: 2, query: 'Ngurah Rai Airport, Bali',
          highlights: ['Off the boat in Sorong, fly via Makassar or direct to Denpasar','Indonesia visa Day 11 of 30 — 19 days remaining','Fast boat Sanur → Nusa Penida Mar 22'] },
      ],
      diving: { sites: 30, type: 'Liveaboard', operators: 'Papua Diving / Meridian Adventure' },
      booking: ['Raja Ampat liveaboard — book by Oct 2025 (Mar 11–20 dates)'],
    },
    {
      id: 'indonesia-2', num: 17, kind: 'chapter', region: 'archipelago',
      country: 'Indonesia', flag: '🇮🇩', title: 'Indonesia — Nusa Penida · Komodo · Bali',
      start: '2027-03-22', end: '2027-04-08', days: 17,
      theme: 'Raw cliffs, dragon islands, volcanic sunrise — close of Indonesia block',
      intro: 'Three distinct Indonesian worlds back to back. Nusa Penida: stark, dramatic, manta-filled. Komodo: dragons and world-class drift dives. Bali: rice terraces and a volcano at 3am. Indonesia visa exits Day 30 ✓',
      tldr: 'Nusa Penida · Komodo · Ubud · Mount Batur sunrise',
      weather: { hi: 31, lo: 24, label: 'Dry season building, 31°/24°', emoji: '🌋' },
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
      id: 'borneo', num: 18, kind: 'chapter', region: 'rainforest',
      country: 'Malaysia', flag: '🇲🇾', title: 'Borneo / Sabah',
      start: '2027-04-08', end: '2027-04-18', days: 10,
      theme: 'Indonesia visa reset + wildlife chapter',
      intro: 'Bali → KK flight exits Indonesia on Day 30 — perfectly timed reset. Kinabatangan is one of SE Asia\'s finest wildlife corridors. Proboscis monkeys, pygmy elephants bathing at dawn.',
      tldr: 'KK · Sepilok · Kinabatangan River · KK departure',
      weather: { hi: 32, lo: 24, label: 'Tropical rainforest', emoji: '🦧' },
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
      id: 'singapore', num: 19, kind: 'chapter', region: 'isthmus',
      country: 'Singapore', flag: '🇸🇬', title: 'Singapore',
      start: '2027-04-18', end: '2027-04-25', days: 7,
      theme: 'World-class food, modern wonder, city recharge',
      intro: 'Effective recharge hub: clean, organized, excellent food infrastructure, everything works.',
      tldr: 'Hawker centres · Gardens by the Bay · Marina Bay',
      weather: { hi: 31, lo: 25, label: 'Hot + humid', emoji: '🌳' },
      photos: ['gardens by the bay supertree', 'marina bay sands night', 'singapore hawker food', 'changi airport waterfall'],
      places: [
        { name: 'Singapore', days: 7, query: 'Marina Bay, Singapore',
          highlights: ['Maxwell, Lau Pa Sat, Old Airport Road hawker centres — best in the world','Gardens by the Bay — Supertree Grove at night','Marina Bay Sands observation deck','Chinatown, Little India, Haji Lane','National Gallery Singapore','Changi Airport waterfall walk (best airport in the world)'] },
      ],
    },
    {
      id: 'malaysia', num: 20, kind: 'chapter', region: 'isthmus',
      country: 'Malaysia', flag: '🇲🇾', title: 'Malaysia',
      start: '2027-04-25', end: '2027-05-05', days: 10,
      theme: 'Urban intensity, street food capital, colonial slow life',
      intro: 'KL for the city spectacle and food, Penang for the most rewarding slow chapter in mainland SE Asia. Georgetown is UNESCO, effortlessly liveable, and the hawker food is unsurpassed.',
      tldr: 'Petronas · Batu Caves · Georgetown · Gurney Drive hawker',
      weather: { hi: 33, lo: 24, label: 'Warm + humid', emoji: '☕' },
      photos: ['petronas towers night', 'batu caves rainbow steps', 'penang street art', 'penang hawker'],
      places: [
        { name: 'Kuala Lumpur', days: 5, query: 'Petronas Twin Towers, KL',
          highlights: ['Petronas Twin Towers at night — best view from KLCC park reflection pool','Batu Caves — rainbow steps, macaques, Hindu temple inside limestone cave','Jalan Alor Night Food Street','Bukit Bintang neighborhood','Train north to Penang (ETS / KTM — scenic coastal rail)'] },
        { name: 'Penang', days: 5, query: 'Armenian Street, Georgetown',
          highlights: ['Armenian Street — Zacharevic murals, shophouse architecture, UNESCO','Gurney Drive hawker — char kway teow, asam laksa, cendol — the real versions','Clan Jetties — Chinese stilt villages over the water','Penang Hill funicular','Kek Lok Si Temple, Blue Mansion (Cheong Fatt Tze)','Temporary-life chapter: find a recurring breakfast spot, walk the same route each morning'] },
      ],
    },
    {
      id: 'thailand', num: 21, kind: 'chapter', region: 'isthmus',
      country: 'Thailand', flag: '🇹🇭', title: 'Thailand',
      start: '2027-05-05', end: '2027-05-19', days: 14,
      theme: 'Islands, reef diving, urban intensity, street food',
      intro: 'Gulf coast dry season — clear water, calm seas, 30°C in the islands. Then Bangkok: temples, canal boats, and the best street food city on Earth.',
      tldr: 'Koh Tao · Koh Samui · Bangkok',
      weather: { hi: 36, lo: 25, label: 'Dry Gulf coast → hot city', emoji: '🛺' },
      photos: ['koh tao diving', 'koh samui beach', 'bangkok wat arun', 'bangkok street food'],
      places: [
        { name: 'Koh Tao', days: 5, query: 'Koh Tao, Thailand',
          highlights: ['One of the best value diving destinations on Earth','Japanese Gardens, Chumphon Pinnacle','Sail Rock — whale shark territory (reliable in May)','Hammock, reef, lunch, repeat'] },
        { name: 'Koh Samui', days: 2, query: 'Chaweng Beach, Koh Samui',
          highlights: ['Chaweng Beach, Big Buddha','Ferry to Surat Thani → bus/flight to Bangkok'] },
        { name: 'Bangkok', days: 7, query: 'Wat Pho, Bangkok',
          highlights: ['Wat Pho — reclining Buddha + massage school','Grand Palace + Wat Phra Kaew','Khlong canal boat commute through the city','Chatuchak Weekend Market (Sat–Sun)','Yaowarat (Chinatown) at night','Kanchanaburi day trip — Erawan Falls, Death Railway, River Kwai','Fly Bangkok → Guilin / Guangzhou May 19'] },
      ],
      diving: { sites: 8, type: 'Day boats', operators: 'Several solid shops on Koh Tao' },
    },
    {
      id: 'china-2', num: 22, kind: 'chapter', region: 'middle',
      country: 'China', flag: '🇨🇳', title: 'China — Block 2',
      start: '2027-05-19', end: '2027-06-08', days: 20,
      theme: 'Surreal landscapes, ancient empire, spring China',
      intro: 'Spring is the ideal season for these landscapes. Li River mist in the karst, Zhangjiajie sea of clouds, pandas active in Chengdu. These regions shine more in May than in winter.',
      tldr: 'Guilin · Zhangjiajie · Chongqing · Chengdu · Xi\'an',
      weather: { hi: 26, lo: 16, label: 'Spring, 26°/16°', emoji: '🐼' },
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
    'rio':          { months: [6, 7, 8, 9],            note: 'Jun–Sep: inverno carioca seco, sem umidade, praias limpas' },
    'cumbuco':      { months: [7, 8, 9, 10, 11],      note: 'Jul–Nov: pico da temporada de vento no Ceará, Jeri em destaque' },
    'saopaulo':     { months: [5, 6, 7, 8, 9],        note: 'Mai–Set: inverno paulistano, menos umidade, agradável para cidade' },
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
