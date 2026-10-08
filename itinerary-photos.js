// Chapter + place photos — ALL LOCAL (extra-pictures/). No hotlinking,
// no external fetches at runtime. Keywords map 1:1 to files.
// Chapters use photos[0] as the header; places carry their own `photo`.

window.PHOTO_IDS = {
  // ── Brasil ────────────────────────────────────────────────────────
  'rio aerial':                  'extra-pictures/brasil/rio-aerial.jpg',
  'copacabana beach':            'extra-pictures/brasil/copacabana-beach.jpg',
  'cumbuco beach kites':         'extra-pictures/cumbuco/20231014_154930.jpg',
  'masp sao paulo':              'extra-pictures/brasil/masp-sao-paulo.jpg',
  // ── Toronto ───────────────────────────────────────────────────────
  'toronto cn tower':            'extra-pictures/toronto/toronto-cn-tower.jpg',
  'toronto distillery':          'extra-pictures/toronto/toronto-distillery.jpg',
  // ── Greece ────────────────────────────────────────────────────────
  'athens acropolis':            'extra-pictures/athens/athens-acropolis.jpg',
  'athens monastiraki':          'extra-pictures/athens/athens-monastiraki.jpg',
  'chania old town':             'extra-pictures/athens/chania-old-town.jpg',
  'rethymno old town':           'extra-pictures/athens/rethymno-old-town.jpg',
  'santorini oia':               'extra-pictures/athens/santorini-oia.jpg',
  'folegandros chora':           'extra-pictures/athens/folegandros-chora.jpg',
  'milos sarakiniko':            'extra-pictures/athens/milos-sarakiniko.jpg',
  'cape sounion':                'extra-pictures/athens/cape-sounion.jpg',
  // ── Turkey ────────────────────────────────────────────────────────
  'cappadocia balloons':         'extra-pictures/turkey/cappadocia-balloons.jpg',
  'goreme valley':               'extra-pictures/turkey/goreme-valley.jpg',
  'alacati aegean':              'extra-pictures/turkey/alacati-aegean.jpg',
  'ephesus library':             'extra-pictures/turkey/ephesus-library.jpg',
  'kas harbour':                 'extra-pictures/turkey/kas-harbour.jpg',
  'akyaka azmak':                'extra-pictures/turkey/akyaka-azmak.jpg',
  'istanbul mosque':             'extra-pictures/turkey/istanbul-mosque.jpg',
  // ── Baku (local) ──────────────────────────────────────────────────
  'baku flame towers':           'extra-pictures/baku/flame-towers-day.jpg',
  'baku old city':               'extra-pictures/baku/old-city.jpg',
  // ── India ─────────────────────────────────────────────────────────
  'taj mahal sunrise':           'extra-pictures/india/taj-mahal-sunrise.jpg',
  'old delhi jama masjid':       'extra-pictures/india/old-delhi-jama-masjid.jpg',
  'varanasi ghats':              'extra-pictures/india/varanasi-ghats.jpg',
  // ── Nepal ─────────────────────────────────────────────────────────
  'annapurna himalaya':          'extra-pictures/nepal/annapurna-himalaya.jpg',
  'kathmandu boudhanath stupa':  'extra-pictures/nepal/kathmandu-boudhanath-stupa.jpg',
  'everest prayer flags':        'extra-pictures/nepal/everest-prayer-flags.jpg',
  'patan durbar':                'extra-pictures/nepal/patan-durbar.jpg',
  // ── China E1 ──────────────────────────────────────────────────────
  'great wall snow':             'extra-pictures/china-e1/great-wall-snow.jpg',
  'forbidden city':              'extra-pictures/china-e1/forbidden-city.jpg',
  'huangshan sea of clouds':     'extra-pictures/china-e1/huangshan-sea-of-clouds.jpg',
  'west lake':                   'extra-pictures/china-e1/west-lake.jpg',
  'suzhou garden':               'extra-pictures/china-e1/suzhou-garden.jpg',
  // ── Hong Kong ─────────────────────────────────────────────────────
  'hong kong skyline':           'extra-pictures/hk/hong-kong-skyline.jpg',
  'kowloon neon':                'extra-pictures/hk/kowloon-neon.jpg',
  // ── China E2 ──────────────────────────────────────────────────────
  'shenzhen night skyline':      'extra-pictures/china-e2/shenzhen-night-skyline.jpg',
  'huaqiangbei':                 'extra-pictures/china-e2/huaqiangbei.jpg',
  'macau st paul':               'extra-pictures/china-e2/macau-st-paul.jpg',
  'guangzhou canton tower':      'extra-pictures/china-e2/guangzhou-canton-tower.jpg',
  'shanghai bund night':         'extra-pictures/china-e2/shanghai-bund-night.jpg',
  'chengdu panda':               'extra-pictures/china-e2/chengdu-panda.jpg',
  'chongqing cyberpunk night':   'extra-pictures/china-e2/chongqing-cyberpunk-night.jpg',
  // ── Korea ─────────────────────────────────────────────────────────
  'seoul palace winter':         'extra-pictures/korea/seoul-palace-winter.jpg',
  'busan gamcheon':              'extra-pictures/korea/busan-gamcheon.jpg',
  'gyeongju temple':             'extra-pictures/korea/gyeongju-temple.jpg',
  'jeonju hanok':                'extra-pictures/korea/jeonju-hanok.jpg',
  'korean street food':          'extra-pictures/korea/korean-street-food.jpg',
  // ── Taiwan ────────────────────────────────────────────────────────
  'taipei 101 night':            'extra-pictures/taiwan/taipei-101-night.jpg',
  'taiwan night market':         'extra-pictures/taiwan/taiwan-night-market.jpg',
  'taroko gorge marble':         'extra-pictures/taiwan/taroko-gorge-marble.jpg',
  'anping fort':                 'extra-pictures/taiwan/anping-fort.jpg',
  // ── Japan ─────────────────────────────────────────────────────────
  'fushimi inari':               'extra-pictures/japan/fushimi-inari.jpg',
  'kyoto autumn maple':          'extra-pictures/japan/kyoto-autumn-maple.jpg',
  'osaka dotonbori':             'extra-pictures/japan/osaka-dotonbori.jpg',
  'tokyo shimokitazawa':         'extra-pictures/japan/tokyo-shimokitazawa.jpg',
  'hakuba snowboarding':         'extra-pictures/japan/hakuba-snowboarding.png',
  // ── Indonesia A ───────────────────────────────────────────────────
  'raja ampat aerial wayag':     'extra-pictures/indonesia-a/raja-ampat-aerial-wayag.jpg',
  'jakarta monas':               'extra-pictures/indonesia-a/jakarta-monas.jpg',
  'borobudur sunrise':           'extra-pictures/indonesia-a/borobudur-sunrise.jpg',
  'bali ubud rice terrace':      'extra-pictures/indonesia-a/bali-ubud-rice-terrace.jpg',
  'manta ray cleaning station':  'extra-pictures/indonesia-a/manta-ray-cleaning-station.jpg',
  // ── Borneo ────────────────────────────────────────────────────────
  'borneo orangutan':            'extra-pictures/borneo/borneo-orangutan.jpg',
  'kk city mosque':              'extra-pictures/borneo/kk-city-mosque.jpg',
  'sepilok':                     'extra-pictures/borneo/sepilok.jpg',
  'kinabatangan river':          'extra-pictures/borneo/kinabatangan-river.jpg',
  // ── Philippines ───────────────────────────────────────────────────
  'el nido lagoon':              'extra-pictures/philippines/el-nido-lagoon.jpg',
  'intramuros manila':           'extra-pictures/philippines/intramuros-manila.jpg',
  'coron kayangan lake':         'extra-pictures/philippines/coron-kayangan-lake.jpg',
  'el nido big lagoon':          'extra-pictures/philippines/el-nido-big-lagoon.jpg',
  'moalboal sardine run':        'extra-pictures/philippines/moalboal-sardine-run.jpg',
  // ── Indonesia B ───────────────────────────────────────────────────
  'kelingking beach trex':       'extra-pictures/indonesia-b/kelingking-beach-trex.jpg',
  'broken beach':                'extra-pictures/indonesia-b/broken-beach.jpg',
  'komodo dragon':               'extra-pictures/indonesia-b/komodo-dragon.jpg',
  'mount batur sunrise':         'extra-pictures/indonesia-b/mount-batur-sunrise.jpg',
  // ── Singapore ─────────────────────────────────────────────────────
  'gardens by the bay supertree': 'extra-pictures/singapore/gardens-by-the-bay-supertree.jpg',
  'marina bay sands night':      'extra-pictures/singapore/marina-bay-sands-night.jpg',
  // ── Malaysia ──────────────────────────────────────────────────────
  'petronas towers night':       'extra-pictures/malaysia/petronas-towers-night.jpg',
  'batu caves rainbow steps':    'extra-pictures/malaysia/batu-caves-rainbow-steps.jpg',
  'penang street art':           'extra-pictures/malaysia/penang-street-art.jpg',
  // ── Thailand ──────────────────────────────────────────────────────
  'koh tao diving':              'extra-pictures/thailand/koh-tao-diving.jpg',
  'koh tao sail rock':           'extra-pictures/thailand/koh-tao-sail-rock.jpg',
  'koh samui beach':             'extra-pictures/thailand/koh-samui-beach.jpg',
  'bangkok wat arun':            'extra-pictures/thailand/bangkok-wat-arun.jpg',
  // ── China Spring ──────────────────────────────────────────────────
  'xian terracotta warriors':    'extra-pictures/china-spring/xian-terracotta-warriors.jpg',
  'xian city wall':              'extra-pictures/china-spring/xian-city-wall.jpg',
  'guilin karst li river':       'extra-pictures/china-spring/guilin-karst-li-river.jpg',
  'longji terraces':             'extra-pictures/china-spring/longji-terraces.jpg',
  'zhangjiajie avatar pillars':  'extra-pictures/china-spring/zhangjiajie-avatar-pillars.jpg',
  'fenghuang riverside':         'extra-pictures/china-spring/fenghuang-riverside.jpg',
};
