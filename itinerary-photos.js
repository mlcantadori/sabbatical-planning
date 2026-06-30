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
  // Local photos from the trip — see extra-pictures/cumbuco/
  'cumbuco beach kites':         'extra-pictures/cumbuco/20231014_154930.jpg',
  'cumbuco kitesurf':            'extra-pictures/cumbuco/PXL_20240921_142226699.jpg',
  'cumbuco mural':               'extra-pictures/cumbuco/PXL_20241103_003746700.jpg',

  // ── Toronto ───────────────────────────────────────────────────────────────
  'toronto cn tower':            'photo-1517935706615-2717063c2225', // ✓
  'toronto distillery':          'photo-1495567720989-cebdbdd97913', // ✓
  'niagara falls':               'https://upload.wikimedia.org/wikipedia/commons/a/ab/3Falls_Niagara.jpg',

  // ── Athens ────────────────────────────────────────────────────────────────
  'athens acropolis':            'photo-1555993539-1732b0258235',    // Parthenon ✓
  'athens monastiraki':          'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Monastiraki_Square_and_in_the_distance_the_Acropolis.jpg/1920px-Monastiraki_Square_and_in_the_distance_the_Acropolis.jpg',
  'hydra island greece':         'photo-1533105079780-92b9be482077', // ✓
  'cape sounion':                'https://upload.wikimedia.org/wikipedia/commons/c/c2/Cape_Sounion_AC.JPG',

  // ── Turkey ────────────────────────────────────────────────────────────────
  'istanbul mosque':             'photo-1524231757912-21f4fe3a7200', // ✓
  'alacati aegean':              'https://upload.wikimedia.org/wikipedia/commons/2/23/Alacati_Streets.jpg',
  'cappadocia balloons':         'photo-1527838832700-5059252407fa', // ✓
  'pamukkale terraces':          'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/The_Travertine_terraces_of_Pamukkale.jpg/1920px-The_Travertine_terraces_of_Pamukkale.jpg',

  // ── India ─────────────────────────────────────────────────────────────────
  'taj mahal sunrise':           'photo-1524492412937-b28074a5d7da', // ✓
  'varanasi ghats':              'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg/1920px-Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg',
  'jaipur palace':               'photo-1599661046289-e31897846e41', // ✓
  'rishikesh yoga':              'photo-1506905925346-21bda4d32df4', // ✓

  // ── Nepal ─────────────────────────────────────────────────────────────────
  'kathmandu boudhanath stupa':  'photo-1605640840605-14ac1855827b', // ✓
  'annapurna himalaya':          'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/The_Annapurna_range_from_Pokhara.jpg/1920px-The_Annapurna_range_from_Pokhara.jpg',
  'pokhara phewa lake':          'https://upload.wikimedia.org/wikipedia/commons/0/0c/Phewa_Lake_of_Pokhara_city.jpg',
  'everest prayer flags':        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Mt.Everest%2C_Nupche_with_Prayer_flags.jpg/1920px-Mt.Everest%2C_Nupche_with_Prayer_flags.jpg',

  // ── Japan – Autumn ────────────────────────────────────────────────────────
  'kyoto autumn maple':          'https://upload.wikimedia.org/wikipedia/commons/0/0e/Eikando_Zenrinji-temple_Tahoto.JPG',
  'tokyo shimokitazawa':         'photo-1540959733332-eab4deabeeaf', // ✓
  'fushimi inari':               'photo-1493976040374-85c8e12f0c0e', // ✓
  'osaka dotonbori':             'photo-1589452271712-64b8a66c7b71', // ✓
  'arashiyama bamboo':           'photo-1524413840807-0c3cb6fa808d', // ✓

  // ── South Korea ───────────────────────────────────────────────────────────
  'seoul palace winter':         'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg/3840px-%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg',
  'busan gamcheon':              'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Colorful_houses_in_Gamcheon_Culture_Village_at_sunset_in_Busan_South_Korea.jpg/1920px-Colorful_houses_in_Gamcheon_Culture_Village_at_sunset_in_Busan_South_Korea.jpg',
  'gyeongju temple':             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Geungnakjeon%2C_Bulguksa_01.jpg/1920px-Geungnakjeon%2C_Bulguksa_01.jpg',
  'jeonju hanok':                'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Jeonju_Hanok_Village_20230408_006.jpg/1920px-Jeonju_Hanok_Village_20230408_006.jpg',
  'korean street food':          'photo-1583623025817-d180a2221d0a', // ✓

  // ── Taiwan ────────────────────────────────────────────────────────────────
  'taipei 101 night':            'https://upload.wikimedia.org/wikipedia/commons/d/d9/Taipei_101_Night_View.jpg',
  'jiufen old street':           'https://upload.wikimedia.org/wikipedia/commons/a/ad/A-Zhu_Peanut_Ice_Cream_Roll%2C_Jiufen_Old_Street%2C_2024.jpg',
  'taroko gorge marble':         'photo-1563245372-f21724e3856d',    // ✓
  'taiwan night market':         'photo-1513622470522-26c3c8a854bc', // ✓

  // ── Japan – Winter ────────────────────────────────────────────────────────
  'hakuba snowboarding':         'photo-1551698618-1dfe5d97d256',    // ✓
  'kanazawa kenrokuen snow':     'photo-1528360983277-13d401cdc186', // ✓
  'matsumoto castle winter':     'https://upload.wikimedia.org/wikipedia/commons/4/4d/Matsumoto_Castle_and_Reflection.jpg',
  'japan onsen snow':            'photo-1542224566-6e85f2e6772f',    // ✓

  // ── China Block 1 ─────────────────────────────────────────────────────────
  'great wall snow':             'photo-1508804185872-d7badad00f7d', // ✓
  'shanghai bund night':         'photo-1538428494232-9c0d8a3ab403', // ✓
  'shanghai french concession':  'photo-1545569341-9eb8b30979d9',    // ✓
  'shenzhen night skyline':      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Shenzhen_Skyline_At_Night_%28214551663%29.jpeg/1920px-Shenzhen_Skyline_At_Night_%28214551663%29.jpeg',

  // ── Hong Kong ─────────────────────────────────────────────────────────────
  'hong kong skyline':           'https://upload.wikimedia.org/wikipedia/commons/4/41/Hong_Kong_Skyline_Panorama_-_Dec_2008.jpg',
  'kowloon neon':                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mong_Kok_Neon_Signs_Night_%2848127904386%29.jpg/1920px-Mong_Kok_Neon_Signs_Night_%2848127904386%29.jpg',
  'hong kong dim sum':           'photo-1496116218417-1a781b1c416c', // ✓

  // ── Philippines ───────────────────────────────────────────────────────────
  'el nido lagoon':              'https://upload.wikimedia.org/wikipedia/commons/4/4f/Island_lagoon_in_Bacuit_Bay%2C_El_Nido%2C_Palawan%2C_Philippines.jpg',
  'coron kayangan lake':         'photo-1537996194471-e657df975ab4', // ✓
  'moalboal sardine run':        'https://upload.wikimedia.org/wikipedia/commons/a/af/Sardine_run_over_seafloor_in_Moalboal_04.jpg',
  'intramuros manila':           'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Manila%2C_Fort_Santiago%2C_Walled_city_of_Intramuros%2C_Philippines.jpg/1920px-Manila%2C_Fort_Santiago%2C_Walled_city_of_Intramuros%2C_Philippines.jpg',

  // ── Indonesia – Raja Ampat ────────────────────────────────────────────────
  'raja ampat aerial wayag':     'photo-1544551763-46a013bb70d5',    // ✓
  'manta ray cleaning station':  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Reef_manta_ray_%28Manta_alfredi%29_-_49877611423.jpg/1920px-Reef_manta_ray_%28Manta_alfredi%29_-_49877611423.jpg',
  'coral reef indonesia':        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Coral_in_Raja_Ampat.jpg/1920px-Coral_in_Raja_Ampat.jpg',
  'pygmy seahorse':              'photo-1546026423-cc4642628d2b',    // ✓
  'reef sharks':                 'https://upload.wikimedia.org/wikipedia/commons/5/59/Caribbean_reef_shark.jpg',

  // ── Indonesia – Block 2 ───────────────────────────────────────────────────
  'kelingking beach trex':       'photo-1573790387438-4da905039392', // ✓
  'padar island viewpoint':      'photo-1518548419970-58e3b4079ab2', // ✓
  'komodo dragon':               'photo-1583212292454-1fe6229603b7', // ✓
  'bali ubud rice terrace':      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Tegallalang_Rice_Terraces_Bali.jpg/1920px-Tegallalang_Rice_Terraces_Bali.jpg',
  'mount batur sunrise':         'photo-1539367628448-4bc5c9d171c8', // ✓

  // ── Borneo ────────────────────────────────────────────────────────────────
  'borneo orangutan':            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Bornean_Orangutan_%28Pongo_pygmaeus%29_%2814562544106%29.jpg/1920px-Bornean_Orangutan_%28Pongo_pygmaeus%29_%2814562544106%29.jpg',
  'kinabatangan river':          'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Kinabatangan_River_%2814154417142%29.jpg/1920px-Kinabatangan_River_%2814154417142%29.jpg',
  'proboscis monkey':            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Proboscis_Monkey_in_Borneo.jpg/3840px-Proboscis_Monkey_in_Borneo.jpg',
  'sepilok':                     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Sandakan_Sabah_Sepilok-Orangutan-Rehabilitation-Centre-07.jpg/1920px-Sandakan_Sabah_Sepilok-Orangutan-Rehabilitation-Centre-07.jpg',

  // ── Singapore ─────────────────────────────────────────────────────────────
  'gardens by the bay supertree':'photo-1525625293386-3f8f99389edd', // ✓
  'marina bay sands night':      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Singapore_Marina_Bay_Dusk_2018-02-27.jpg/1920px-Singapore_Marina_Bay_Dusk_2018-02-27.jpg',
  'singapore hawker food':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Lunch_time_at_Maxwell_Food_Centre.JPG/1920px-Lunch_time_at_Maxwell_Food_Centre.JPG',
  'changi airport waterfall':    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Rain_Vortex_Jewel_Changi_Airport.jpg/1920px-Rain_Vortex_Jewel_Changi_Airport.jpg',

  // ── Malaysia ──────────────────────────────────────────────────────────────
  'petronas towers night':       'photo-1596422846543-75c6fc197f07', // ✓
  'batu caves rainbow steps':    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Batu_Caves_stairs_2022-05.jpg/3840px-Batu_Caves_stairs_2022-05.jpg',
  'penang street art':           'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Penang_-_Little_Children_on_a_Bicycle.JPG/1920px-Penang_-_Little_Children_on_a_Bicycle.JPG',
  'penang hawker':               'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Penang_Char_Kuey_Teow_%28Stir_fried_flat_rice_noodle%29.jpg/1920px-Penang_Char_Kuey_Teow_%28Stir_fried_flat_rice_noodle%29.jpg',

  // ── Thailand ──────────────────────────────────────────────────────────────
  'koh samui beach':             'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Koh_Samui%2C_Beach%2C_Thailand.jpg/1920px-Koh_Samui%2C_Beach%2C_Thailand.jpg',
  'bangkok wat arun':            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Templo_Wat_Arun%2C_Bangkok%2C_Tailandia%2C_2013-08-22%2C_DD_30.jpg/1920px-Templo_Wat_Arun%2C_Bangkok%2C_Tailandia%2C_2013-08-22%2C_DD_30.jpg',
  'bangkok street food':         'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/2016_Bangkok%2C_Dystrykt_Samphanthawong%2C_Ulica_Yaowarat_%2814%29.jpg/1920px-2016_Bangkok%2C_Dystrykt_Samphanthawong%2C_Ulica_Yaowarat_%2814%29.jpg',
  'koh tao diving':              'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Koh_tao_1.jpg/1920px-Koh_tao_1.jpg',

  // ── China Block 2 ─────────────────────────────────────────────────────────
  'guilin karst li river':       'photo-1547981609-4b6bfe67ca0b',    // ✓
  'zhangjiajie avatar pillars':  'photo-1513415277900-a62401e19be4', // ✓
  'chongqing cyberpunk night':   'photo-1601921004897-b7d582836990', // ✓
  'chengdu panda':               'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/3840px-Grosser_Panda.JPG',
  'xian terracotta warriors':    'photo-1598935898639-81586f7d2129', // ✓
};
