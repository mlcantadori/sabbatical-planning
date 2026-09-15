// Coordinates for every chapter (`anchor`) and every place within.
// Lat/lng pairs — used by the Leaflet map.
// Anchors are city centroids; places are landmark coords where useful, else
// city centroid.
window.TRIP_GEO = {
  // Chapter anchors (rough "you are here" point per chapter)
  chapters: {
    'brasil':       [-22.9068,  -43.1729], // Rio de Janeiro (trip opens here)
    'toronto':      [ 43.6532,  -79.3832], // CN Tower, Toronto
    'athens':       [ 37.9838,   23.7275], // Acropolis, Athens
    'turkey':       [41.0082,   28.9784], // Istanbul
    'baku':         [40.4093,   49.8671], // Baku
    'nepal':        [27.7172,   85.3240], // Kathmandu
    'india':        [28.6139,   77.2090], // New Delhi
    'taiwan':       [25.0330,  121.5654], // Taipei
    'china-e1a':    [23.1291,  113.2644], // Guangzhou (entry point)
    'china-e1b':    [39.9042,  116.4074], // Beijing (entry point)
    'korea':        [37.5665,  126.9780], // Seoul
    'china-e2':     [31.2304,  121.4737], // Shanghai (entry + most nights)
    'japan':        [35.0116,  135.7681], // Kyoto (entry point)
    'hk':           [22.3193,  114.1694], // Hong Kong
    'philippines':  [11.9964,  119.4192], // Coron
    'indonesia':      [-8.5069,  115.2625], // Ubud, Bali (most nights)
    'borneo':       [ 5.9804,  116.0735], // Kota Kinabalu
    'singapore':    [ 1.2834,  103.8607], // Marina Bay
    'malaysia':     [ 3.1579,  101.7117], // KL
    'thailand':     [10.0956,   99.8377], // Koh Tao
    'china-spring':  [34.3416,  108.9398], // Xi'an (entry point)
  },
  // Place-level (drilldown) coords. Key is "chapterId/placeName".
  places: {
    // Brasil (single chapter)
    'brasil/Rio de Janeiro':                [-22.9068,  -43.1729],
    'brasil/Cumbuco':                       [ -3.6267,  -38.7302],
    'brasil/São Paulo':                     [-23.5505,  -46.6333],
    // Toronto
    'toronto/Toronto':                        [ 43.6532,  -79.3832],
    // Greece
    'athens/Athens':                          [37.9838,   23.7275],
    'athens/Crete — Chania':                  [35.5138,   24.0180],
    'athens/Crete — Rethymno':                [35.3667,   24.4833],
    'athens/Santorini':                       [36.4166,   25.4335], // Fira
    'athens/Folegandros':                     [36.6167,   24.9167], // Chora
    'athens/Milos':                           [36.7397,   24.4265], // Plaka
    'athens/Athens — buffer':                 [37.9838,   23.7275],
    // Turkey
    'turkey/Cappadocia — Göreme':             [38.6431,   34.8289],
    'turkey/Alaçatı':                         [38.2822,   26.3747],
    'turkey/Şirince':                         [37.9429,   27.3417],
    'turkey/Kaş':                             [36.2018,   29.6377],
    'turkey/Akyaka':                          [37.0545,   28.3269],
    'turkey/Istanbul':                         [41.0082,   28.9784],
    // Baku
    'baku/Baku':                                 [40.4093,   49.8671],
    // Nepal
    'nepal/Kathmandu':                        [27.7172,   85.3240],
    'nepal/Pokhara':                          [28.2096,   83.9856],
    'nepal/Annapurna Base Camp Trek':         [28.5306,   83.8783],
    'nepal/Pokhara recovery':                 [28.2096,   83.9856],
    // India
    'india/Delhi + Agra':                     [27.1751,   78.0421], // Agra
    'india/Rishikesh':                        [30.0869,   78.2676],
    'india/Varanasi':                         [25.3176,   82.9739],
    // Japan (fused winter chapter)
    'japan/Kyoto':                          [35.0116,  135.7681],
    'japan/Osaka':                          [34.6937,  135.5023],
    'japan/Tokyo':                          [35.6762,  139.6503],
    'japan/Hakuba Valley':                  [36.6953,  137.8378],
    'japan/Departure':                      [35.6762,  139.6503], // Tokyo
    // Korea
    'korea/Seoul':                            [37.5665,  126.9780],
    'korea/Busan':                            [35.1796,  129.0756],
    'korea/Gyeongju':                         [35.8562,  129.2247],
    'korea/Jeonju':                           [35.8242,  127.1480],
    'korea/Seoul finale':                      [37.5665,  126.9780],
    // Taiwan
    'taiwan/Taipei':                          [25.0330,  121.5654],
    'taiwan/Hualien + Taroko Gorge':          [24.1908,  121.6202],
    'taiwan/Tainan + south':                  [22.9997,  120.2270], // Tainan
    // HK
    'hk/Hong Kong':                           [22.3193,  114.1694],
    // Philippines
    'philippines/Manila':                     [14.5995,  120.9842],
    'philippines/Coron':                      [11.9964,  119.4192],
    'philippines/El Nido':                    [11.1949,  119.4013],
    'philippines/Cebu / Moalboal':            [10.2720,  123.4220],
    'philippines/Transfer to Sorong':         [-0.8917,  131.2500],
    // Indonesia Block 1 — Raja Ampat
    // Indonesia (single chapter)
    'indonesia/Raja Ampat Liveaboard':          [-0.5897,  130.1053], // Wayag
    'indonesia/Transit Sorong → Bali':          [-8.6500,  115.2167], // Denpasar
    'indonesia/Ubud':                           [-8.5069,  115.2625],
    'indonesia/Nusa Penida':                    [-8.7270,  115.5444],
    'indonesia/Komodo':                         [-8.4889,  119.8825], // Labuan Bajo
    'indonesia/Bali + Volcano':                 [-8.5069,  115.2625], // Ubud
    // Borneo
    'borneo/Kota Kinabalu':                   [ 5.9804,  116.0735],
    'borneo/Sepilok + Sandakan':              [ 5.8754,  117.9472],
    'borneo/Kinabatangan River':              [ 5.4500,  118.0500],
    // Singapore
    'singapore/Singapore':                    [ 1.2834,  103.8607],
    // Malaysia — KL + Penang
    'malaysia/Kuala Lumpur':                  [ 3.1579,  101.7117],
    'malaysia/Penang':                        [ 5.4141,  100.3288],
    // Thailand
    'thailand/Koh Tao':                       [10.0956,   99.8377],
    'thailand/Koh Samui':                     [ 9.5018,  100.0140],
    'thailand/Bangkok':                       [13.7460,  100.5018],
    // China E1a (PRD: Guangzhou + Shenzhen)
    'china-e1a/Guangzhou':                    [23.1291,  113.2644],
    'china-e1a/Shenzhen':                     [22.5431,  114.0579],
    // China E1b (Beijing first, then Sichuan)
    'china-e1b/Beijing':                      [39.9042,  116.4074],
    'china-e1b/Chengdu':                      [30.5728,  104.0668],
    'china-e1b/Chongqing':                    [29.4316,  106.9123],
    'china-e1b/Departure':                    [31.2304,  121.4737], // via Shanghai
    // China E2 (Jiangnan winter loop)
    'china-e2/Shanghai':                      [31.2304,  121.4737],
    'china-e2/Huangshan':                     [30.1300,  118.1700],
    'china-e2/Hangzhou':                      [30.2741,  120.1551],
    'china-e2/Suzhou':                        [31.2989,  120.5853],
    'china-e2/Shanghai buffer':               [31.2304,  121.4737],
    // China spring (Xi'an + south in peak season)
    'china-spring/Xi\'an':                    [34.3416,  108.9398],
    'china-spring/Guilin / Yangshuo':         [24.7783,  110.4933],
    'china-spring/Longji Terraces':           [25.9270,  110.0930], // Ping'an
    'china-spring/Zhangjiajie + Tianmen':     [29.1170,  110.4790],
    'china-spring/Fenghuang + Furong':        [27.9538,  109.5991],
    'china-spring/Buffer':                    [28.2282,  112.9388], // Changsha
  },
};
