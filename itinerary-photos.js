// Curated Unsplash photo IDs for each destination keyword.
// Unsplash guarantees permalink stability for individual photo IDs.
// URL format: https://images.unsplash.com/{id}?w=1200&h=900&fit=crop&auto=format
// Any keyword not found here falls back to picsum.photos/seed/ (see shared.jsx).

window.PHOTO_IDS = {
  // ── Brasil ────────────────────────────────────────────────────────────────
  'rio aerial':                  'photo-1483729558449-99ef09a8c325', // iconic aerial bay + Cristo
  'copacabana beach':            'photo-1516306580123-e6e52b1b7b5f', // Copacabana arc
  'lapa arches':                 'photo-1549836938-9b647be5a7e4',    // Lapa Arches illuminated
  'santa teresa rio':            'photo-1614531341773-3bff8b7cb3fc', // Santa Teresa hillside
  'cumbuco kitesurf':            'photo-1511497584788-876760111969', // kitesurfing flat water
  'nordeste lagoa buggy':        'photo-1565374392818-37c745b6d3a4', // dune lagoon Northeast Brazil
  'jangada nordeste':            'photo-1506973035872-a4ec16b8e8d9', // jangada fishing boat
  'masp sao paulo':              'photo-1544735716-392fe2489ffa',    // falls back if wrong; MASP
  'sao paulo skyline':           'photo-1539037116277-4db20889f2d4', // SP night skyline
  'vila madelena art':           'photo-1549887534-1541e9f34f01',    // street mural art
  'ibirapuera park':             'photo-1564769662533-4f00a87b4056', // urban park São Paulo

  // ── Toronto ───────────────────────────────────────────────────────────────
  'toronto cn tower':            'photo-1517935706615-2717063c2225', // CN Tower at dusk
  'toronto distillery':          'photo-1495567720989-cebdbdd97913', // Toronto skyline
  'niagara falls':               'photo-1438786657495-640937d904fe', // Niagara falls mist

  // ── Mediterranean / Athens ────────────────────────────────────────────────
  'athens acropolis':            'photo-1555993539-1732b0258235',    // Parthenon golden hour
  'athens monastiraki':          'photo-1580674684081-7617fbf3d745', // Athens street with Acropolis
  'hydra island greece':         'photo-1533105079780-92b9be482077', // Greek island harbour
  'cape sounion':                'photo-1525777562703-680eb77c0ba3', // Greek temple cliff

  // ── Turkey ────────────────────────────────────────────────────────────────
  'istanbul mosque':             'photo-1524231757912-21f4fe3a7200',
  'alacati aegean':              'photo-1568838117867-5d35e6beb7c7', // Aegean coast village
  'cappadocia balloons':         'photo-1527838832700-5059252407fa',
  'pamukkale terraces':          'photo-1558618666-fcd25c85cd64',

  // ── India ─────────────────────────────────────────────────────────────────
  'taj mahal sunrise':           'photo-1524492412937-b28074a5d7da',
  'varanasi ghats':              'photo-1561361513-2d000a50f0dc',
  'jaipur palace':               'photo-1599661046289-e31897846e41',
  'rishikesh yoga':              'photo-1506905925346-21bda4d32df4', // Rishikesh river/Himalayas

  // ── Nepal ─────────────────────────────────────────────────────────────────
  'kathmandu boudhanath stupa':  'photo-1605640840605-14ac1855827b',
  'annapurna himalaya':          'photo-1586002248706-55be3bcb53ec',
  'pokhara phewa lake':          'photo-1544735716-392fe2489ffa',
  'everest prayer flags':        'photo-1502904550040-7534597429ae',

  // ── Japan – Autumn ────────────────────────────────────────────────────────
  'kyoto autumn maple':          'photo-1570554520913-ce2e0e06b40d',
  'tokyo shimokitazawa':         'photo-1540959733332-eab4deabeeaf',
  'fushimi inari':               'photo-1493976040374-85c8e12f0c0e',
  'osaka dotonbori':             'photo-1589452271712-64b8a66c7b71',
  'arashiyama bamboo':           'photo-1524413840807-0c3cb6fa808d',

  // ── South Korea ───────────────────────────────────────────────────────────
  'seoul palace winter':         'photo-1517154421773-0855edd346b1',
  'busan gamcheon':              'photo-1583224994969-2e6e95e4e72c',
  'gyeongju temple':             'photo-1534438327276-14e5300c3a48',
  'jeonju hanok':                'photo-1548115184-bc6544d06a58',
  'korean street food':          'photo-1583623025817-d180a2221d0a',

  // ── Taiwan ────────────────────────────────────────────────────────────────
  'taipei 101 night':            'photo-1470137430797-0b79f52ab27b',
  'jiufen old street':           'photo-1590912561920-6b6d6f87c59f',
  'taroko gorge marble':         'photo-1563245372-f21724e3856d',
  'taiwan night market':         'photo-1513622470522-26c3c8a854bc',

  // ── Japan – Winter ────────────────────────────────────────────────────────
  'hakuba snowboarding':         'photo-1551698618-1dfe5d97d256',
  'kanazawa kenrokuen snow':     'photo-1528360983277-13d401cdc186',
  'matsumoto castle winter':     'photo-1580714215064-3e8f29b80e93',
  'japan onsen snow':            'photo-1542224566-6e85f2e6772f',

  // ── China Block 1 (Metropolises) ──────────────────────────────────────────
  'great wall snow':             'photo-1508804185872-d7badad00f7d',
  'shanghai bund night':         'photo-1538428494232-9c0d8a3ab403',
  'shanghai french concession':  'photo-1545569341-9eb8b30979d9',
  'shenzhen night skyline':      'photo-1621330396173-e41b1cafd17f',

  // ── Hong Kong ─────────────────────────────────────────────────────────────
  'hong kong skyline':           'photo-1536599018102-9f803c140b4f',
  'hong kong dim sum':           'photo-1563245372-f21724e3856d',
  'kowloon neon':                'photo-1573511860302-28c524319d2a',

  // ── Philippines ───────────────────────────────────────────────────────────
  'el nido lagoon':              'photo-1559628232-c5a8cd3e0b21',
  'coron kayangan lake':         'photo-1537996194471-e657df975ab4',
  'moalboal sardine run':        'photo-1510854271881-b4dad37c2c15',
  'intramuros manila':           'photo-1583309219338-a582f1db9a5f',

  // ── Indonesia – Raja Ampat ────────────────────────────────────────────────
  'raja ampat aerial wayag':     'photo-1544551763-46a013bb70d5',
  'manta ray cleaning station':  'photo-1505765050516-f72dcac9c60e',
  'coral reef indonesia':        'photo-1518020382113-a7e8fc38eac9',
  'pygmy seahorse':              'photo-1546026423-cc4642628d2b',
  'reef sharks':                 'photo-1583474586-52cf7c0011c4',

  // ── Indonesia – Block 2 ───────────────────────────────────────────────────
  'kelingking beach trex':       'photo-1573790387438-4da905039392',
  'padar island viewpoint':      'photo-1518548419970-58e3b4079ab2',
  'komodo dragon':               'photo-1583212292454-1fe6229603b7',
  'bali ubud rice terrace':      'photo-1537953773345-d172ccf13cf4',
  'mount batur sunrise':         'photo-1539367628448-4bc5c9d171c8',

  // ── Borneo ────────────────────────────────────────────────────────────────
  'borneo orangutan':            'photo-1584553421349-3557471bed79',
  'kinabatangan river':          'photo-1518481852452-e2a2d4b2588b',
  'proboscis monkey':            'photo-1536185736-5a3f9b7b7b5e',
  'sepilok':                     'photo-1584553421349-3557471bed79',

  // ── Singapore ─────────────────────────────────────────────────────────────
  'gardens by the bay supertree':'photo-1525625293386-3f8f99389edd',
  'marina bay sands night':      'photo-1518733057094-95b53143d2a7',
  'singapore hawker food':       'photo-1559314809-0d155014e29e',
  'changi airport waterfall':    'photo-1588436706487-9d55d73a39e3',

  // ── Malaysia ──────────────────────────────────────────────────────────────
  'petronas towers night':       'photo-1596422846543-75c6fc197f07',
  'batu caves rainbow steps':    'photo-1597435877854-7e6a4c08aee6',
  'penang street art':           'photo-1534481016317-a06e4f0c9ccc',
  'penang hawker':               'photo-1555396273-367ea4eb4db5',

  // ── Thailand ──────────────────────────────────────────────────────────────
  'koh tao diving':              'photo-1510854271881-b4dad37c2c15',
  'koh samui beach':             'photo-1537953773345-d172ccf13cf4',
  'bangkok wat arun':            'photo-1563492065599-3520f775eeed',
  'bangkok street food':         'photo-1559314809-0d155014e29e',

  // ── China Block 2 (Landscapes) ────────────────────────────────────────────
  'guilin karst li river':       'photo-1547981609-4b6bfe67ca0b',
  'zhangjiajie avatar pillars':  'photo-1513415277900-a62401e19be4',
  'chongqing cyberpunk night':   'photo-1601921004897-b7d582836990',
  'chengdu panda':               'photo-1535083783855-aaab5c4fcf3f',
  'xian terracotta warriors':    'photo-1598935898639-81586f7d2129',
};
