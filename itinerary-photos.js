// Curated photo sources keyed by chapter photo keyword.
// Values are either:
//   • an Unsplash photo ID string ("photo-XXXX") → loaded from images.unsplash.com
//   • a full URL (Wikipedia Commons, etc.)       → loaded directly
// Any keyword not found here falls back to loremflickr.com (real Flickr photos
// matching the keyword). See shared.jsx Photo component.

window.PHOTO_IDS = {
  // ── Brasil — Rio de Janeiro ────────────────────────────────────────────────
  'rio aerial':                  'photo-1483729558449-99ef09a8c325', // aerial bay + Cristo ✓
  'copacabana beach':            'photo-1516306580123-e6e52b1b7b5f', // Copacabana arc ✓
  'lapa arches':                 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Centro_do_Rio_de_Janeiro_by_Diego_Baravelli.jpg',
  'santa teresa rio':            'photo-1614531341773-3bff8b7cb3fc', // Santa Teresa ✓

  // ── Brasil — São Paulo ─────────────────────────────────────────────────────
  'masp sao paulo':              'photo-1544735716-392fe2489ffa',    // ✓
  'sao paulo skyline':           'photo-1539037116277-4db20889f2d4', // ✓
  'vila madelena art':           'https://upload.wikimedia.org/wikipedia/commons/e/eb/Por-do-Sol_%28P%C3%B3s-Chuva%29_-_Vila_Madalena_S%C3%A3o_Paulo_-_SP_-_Flickr_-_Rodrigo_Paoletti.jpg',
  'ibirapuera park':             'photo-1564769662533-4f00a87b4056', // ✓
  'cumbuco kitesurf':            'https://upload.wikimedia.org/wikipedia/commons/2/2a/Kitesurf_Cumbuco.jpg',
  'nordeste lagoa buggy':        'https://upload.wikimedia.org/wikipedia/commons/0/07/Praia_de_Cumbuco.jpg',
  'jangada nordeste':            'https://upload.wikimedia.org/wikipedia/commons/7/73/Jangadas_em_Fortaleza.jpg',

  // ── Toronto ───────────────────────────────────────────────────────────────
  'toronto cn tower':            'photo-1517935706615-2717063c2225', // ✓
  'toronto distillery':          'photo-1495567720989-cebdbdd97913', // ✓
  'niagara falls':               'https://upload.wikimedia.org/wikipedia/commons/a/ab/3Falls_Niagara.jpg',

  // ── Athens ────────────────────────────────────────────────────────────────
  'athens acropolis':            'photo-1555993539-1732b0258235',    // Parthenon ✓
  'athens monastiraki':          'photo-1580674684081-7617fbf3d745', // ✓
  'hydra island greece':         'photo-1533105079780-92b9be482077', // ✓
  'cape sounion':                'https://upload.wikimedia.org/wikipedia/commons/c/c2/Cape_Sounion_AC.JPG',

  // ── Turkey ────────────────────────────────────────────────────────────────
  'istanbul mosque':             'photo-1524231757912-21f4fe3a7200', // ✓
  'alacati aegean':              'https://upload.wikimedia.org/wikipedia/commons/2/23/Alacati_Streets.jpg',
  'cappadocia balloons':         'photo-1527838832700-5059252407fa', // ✓
  'pamukkale terraces':          'photo-1558618666-fcd25c85cd64',    // ✓

  // ── India ─────────────────────────────────────────────────────────────────
  'taj mahal sunrise':           'photo-1524492412937-b28074a5d7da', // ✓
  'varanasi ghats':              'photo-1561361513-2d000a50f0dc',    // ✓
  'jaipur palace':               'photo-1599661046289-e31897846e41', // ✓
  'rishikesh yoga':              'photo-1506905925346-21bda4d32df4', // ✓

  // ── Nepal ─────────────────────────────────────────────────────────────────
  'kathmandu boudhanath stupa':  'photo-1605640840605-14ac1855827b', // ✓
  'annapurna himalaya':          'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Under_stars_and_snows.jpg/3840px-Under_stars_and_snows.jpg',
  'pokhara phewa lake':          'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Phewa_Lake%2C_Pokhara%2C_Nepal.jpg/3840px-Phewa_Lake%2C_Pokhara%2C_Nepal.jpg',
  'everest prayer flags':        'photo-1502904550040-7534597429ae', // ✓

  // ── Japan – Autumn ────────────────────────────────────────────────────────
  'kyoto autumn maple':          'https://upload.wikimedia.org/wikipedia/commons/0/0e/Eikando_Zenrinji-temple_Tahoto.JPG',
  'tokyo shimokitazawa':         'photo-1540959733332-eab4deabeeaf', // ✓
  'fushimi inari':               'photo-1493976040374-85c8e12f0c0e', // ✓
  'osaka dotonbori':             'photo-1589452271712-64b8a66c7b71', // ✓
  'arashiyama bamboo':           'photo-1524413840807-0c3cb6fa808d', // ✓

  // ── South Korea ───────────────────────────────────────────────────────────
  'seoul palace winter':         'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg/3840px-%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg',
  'busan gamcheon':              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Gamcheon_Houses%2C_2024.jpg/3840px-Gamcheon_Houses%2C_2024.jpg',
  'gyeongju temple':             'photo-1534438327276-14e5300c3a48', // ✓
  'jeonju hanok':                'photo-1548115184-bc6544d06a58',    // ✓
  'korean street food':          'photo-1583623025817-d180a2221d0a', // ✓

  // ── Taiwan ────────────────────────────────────────────────────────────────
  'taipei 101 night':            'https://upload.wikimedia.org/wikipedia/commons/7/71/Taipei_101_Fireworks_2008.jpg',
  'jiufen old street':           'https://upload.wikimedia.org/wikipedia/commons/f/f2/Jiufen%2C_Taiwan.jpg',
  'taroko gorge marble':         'photo-1563245372-f21724e3856d',    // ✓
  'taiwan night market':         'photo-1513622470522-26c3c8a854bc', // ✓

  // ── Japan – Winter ────────────────────────────────────────────────────────
  'hakuba snowboarding':         'photo-1551698618-1dfe5d97d256',    // ✓
  'kanazawa kenrokuen snow':     'photo-1528360983277-13d401cdc186', // ✓
  'matsumoto castle winter':     'https://upload.wikimedia.org/wikipedia/commons/4/4f/Matsumoto_Castle_in_winter.jpg',
  'japan onsen snow':            'photo-1542224566-6e85f2e6772f',    // ✓

  // ── China Block 1 ─────────────────────────────────────────────────────────
  'great wall snow':             'photo-1508804185872-d7badad00f7d', // ✓
  'shanghai bund night':         'photo-1538428494232-9c0d8a3ab403', // ✓
  'shanghai french concession':  'photo-1545569341-9eb8b30979d9',    // ✓
  'shenzhen night skyline':      'photo-1621330396173-e41b1cafd17f', // ✓

  // ── Hong Kong ─────────────────────────────────────────────────────────────
  'hong kong skyline':           'https://upload.wikimedia.org/wikipedia/commons/7/7b/Hong_Kong_Night_Skyline.jpg',
  'kowloon neon':                'photo-1573511860302-28c524319d2a', // ✓
  'hong kong dim sum':           'photo-1496116218417-1a781b1c416c', // ✓

  // ── Philippines ───────────────────────────────────────────────────────────
  'el nido lagoon':              'https://upload.wikimedia.org/wikipedia/commons/6/64/Big_Lagoon%2C_El_Nido%2C_Palawan.jpg',
  'coron kayangan lake':         'photo-1537996194471-e657df975ab4', // ✓
  'moalboal sardine run':        'https://upload.wikimedia.org/wikipedia/commons/8/8c/Sardine_Run_Moalboal.jpg',
  'intramuros manila':           'https://upload.wikimedia.org/wikipedia/commons/8/87/Intramuros_Manila.jpg',

  // ── Indonesia – Raja Ampat ────────────────────────────────────────────────
  'raja ampat aerial wayag':     'photo-1544551763-46a013bb70d5',    // ✓
  'manta ray cleaning station':  'photo-1505765050516-f72dcac9c60e', // ✓
  'coral reef indonesia':        'photo-1518020382113-a7e8fc38eac9', // ✓
  'pygmy seahorse':              'photo-1546026423-cc4642628d2b',    // ✓
  'reef sharks':                 'https://upload.wikimedia.org/wikipedia/commons/5/59/Caribbean_reef_shark.jpg',

  // ── Indonesia – Block 2 ───────────────────────────────────────────────────
  'kelingking beach trex':       'photo-1573790387438-4da905039392', // ✓
  'padar island viewpoint':      'photo-1518548419970-58e3b4079ab2', // ✓
  'komodo dragon':               'photo-1583212292454-1fe6229603b7', // ✓
  'bali ubud rice terrace':      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Tegallalang_Rice_Terrace%2C_Ubud%2C_Bali.jpg',
  'mount batur sunrise':         'photo-1539367628448-4bc5c9d171c8', // ✓

  // ── Borneo ────────────────────────────────────────────────────────────────
  'borneo orangutan':            'photo-1584553421349-3557471bed79', // ✓
  'kinabatangan river':          'https://upload.wikimedia.org/wikipedia/commons/f/f2/Kinabatangan_River_%2814154417142%29.jpg',
  'proboscis monkey':            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Proboscis_Monkey_in_Borneo.jpg/3840px-Proboscis_Monkey_in_Borneo.jpg',
  'sepilok':                     'https://upload.wikimedia.org/wikipedia/commons/5/56/Sepilok_Orangutan_Rehabilitation_Centre.jpg',

  // ── Singapore ─────────────────────────────────────────────────────────────
  'gardens by the bay supertree':'photo-1525625293386-3f8f99389edd', // ✓
  'marina bay sands night':      'photo-1518733057094-95b53143d2a7', // ✓
  'singapore hawker food':       'photo-1559314809-0d155014e29e',    // ✓
  'changi airport waterfall':    'photo-1588436706487-9d55d73a39e3', // ✓

  // ── Malaysia ──────────────────────────────────────────────────────────────
  'petronas towers night':       'photo-1596422846543-75c6fc197f07', // ✓
  'batu caves rainbow steps':    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Batu_Caves_stairs_2022-05.jpg/3840px-Batu_Caves_stairs_2022-05.jpg',
  'penang street art':           'https://upload.wikimedia.org/wikipedia/commons/e/e8/Street_art_in_George_Town%2C_Penang.jpg',
  'penang hawker':               'photo-1555396273-367ea4eb4db5',    // ✓

  // ── Thailand ──────────────────────────────────────────────────────────────
  'koh samui beach':             'https://upload.wikimedia.org/wikipedia/commons/8/80/Koh_Samui_Lipa_Noi2.jpg',
  'bangkok wat arun':            'photo-1563492065599-3520f775eeed', // ✓
  'bangkok street food':         'photo-1504674900247-0877df9cc836', // ✓
  'koh tao diving':              'https://upload.wikimedia.org/wikipedia/commons/f/f2/Koh_Tao.jpg',

  // ── China Block 2 ─────────────────────────────────────────────────────────
  'guilin karst li river':       'photo-1547981609-4b6bfe67ca0b',    // ✓
  'zhangjiajie avatar pillars':  'photo-1513415277900-a62401e19be4', // ✓
  'chongqing cyberpunk night':   'photo-1601921004897-b7d582836990', // ✓
  'chengdu panda':               'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/3840px-Grosser_Panda.JPG',
  'xian terracotta warriors':    'photo-1598935898639-81586f7d2129', // ✓
};
