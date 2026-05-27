// Coordinates for every chapter (`anchor`) and every place within.
// Lat/lng pairs — used by the Leaflet map.
// Anchors are city centroids; places are landmark coords where useful, else
// city centroid.
window.TRIP_GEO = {
  // Chapter anchors (rough "you are here" point per chapter)
  chapters: {
    'rio':          [-22.9068,  -43.1729], // Ipanema, Rio de Janeiro
    'cumbuco':      [ -3.2833,  -38.7667], // Cumbuco, Ceará
    'saopaulo':     [-23.5505,  -46.6333], // Av. Paulista, São Paulo
    'toronto':      [ 43.6532,  -79.3832], // CN Tower, Toronto
    'athens':       [ 37.9838,   23.7275], // Acropolis, Athens
    'turkey':       [41.0082,   28.9784], // Istanbul
    'nepal':        [27.7172,   85.3240], // Kathmandu
    'india':        [28.6139,   77.2090], // New Delhi
    'japan-autumn': [35.6762,  139.6503], // Tokyo
    'korea':        [37.5665,  126.9780], // Seoul
    'taiwan':       [25.0330,  121.5654], // Taipei
    'japan-winter': [36.6953,  137.8378], // Hakuba
    'china-1':      [39.9042,  116.4074], // Beijing
    'hk':           [22.3193,  114.1694], // Hong Kong
    'philippines':  [11.9964,  119.4192], // Coron
    'indonesia-1':  [-0.5897,  130.1053], // Wayag, Raja Ampat
    'indonesia-2':  [-8.7270,  115.5444], // Nusa Penida
    'borneo':       [ 5.9804,  116.0735], // Kota Kinabalu
    'singapore':    [ 1.2834,  103.8607], // Marina Bay
    'malaysia':     [ 3.1579,  101.7117], // KL
    'thailand':     [10.0956,   99.8377], // Koh Tao
    'china-2':      [24.7783,  110.4933], // Guilin
  },
  // Place-level (drilldown) coords. Key is "chapterId/placeName".
  places: {
    // Rio de Janeiro
    'rio/Rio de Janeiro':                     [-22.9068,  -43.1729],
    'rio/Paraty':                             [-23.2178,  -44.7131],
    // Cumbuco
    'cumbuco/Cumbuco':                        [ -3.2833,  -38.7667],
    'cumbuco/Jericoacoara':                   [ -2.7978,  -40.5120],
    // São Paulo
    'saopaulo/São Paulo':                     [-23.5505,  -46.6333],
    // Toronto
    'toronto/Toronto':                        [ 43.6532,  -79.3832],
    // Athens
    'athens/Athens':                          [37.9838,   23.7275],
    'athens/Hydra':                           [37.3478,   23.4764],
    'athens/Cape Sounion + Delphi':           [37.6500,   24.0167], // Cape Sounion
    // Turkey
    'turkey/Istanbul':                        [41.0082,   28.9784],
    'turkey/Alacatı':                         [38.2789,   26.3793],
    'turkey/Pamukkale + Ephesus':             [37.9233,   28.9663],
    'turkey/Cappadocia':                      [38.6431,   34.8284],
    // Nepal
    'nepal/Kathmandu':                        [27.7172,   85.3240],
    'nepal/Pokhara':                          [28.2096,   83.9856],
    'nepal/Annapurna Base Camp Trek':         [28.5306,   83.8783],
    'nepal/Pokhara recovery':                 [28.2096,   83.9856],
    // India
    'india/Delhi':                            [28.6139,   77.2090],
    'india/Varanasi':                         [25.3176,   82.9739],
    'india/Agra':                             [27.1751,   78.0421],
    'india/Jaipur':                           [26.9124,   75.7873],
    'india/Rishikesh':                        [30.0869,   78.2676],
    // Japan Autumn
    'japan-autumn/Tokyo':                     [35.6762,  139.6503],
    'japan-autumn/Osaka':                     [34.6937,  135.5023],
    'japan-autumn/Kyoto':                     [35.0116,  135.7681],
    // Korea
    'korea/Seoul':                            [37.5665,  126.9780],
    'korea/Busan':                            [35.1796,  129.0756],
    'korea/Gyeongju':                         [35.8562,  129.2247],
    'korea/Jeonju':                           [35.8242,  127.1480],
    'korea/Seoul / Incheon':                  [37.4563,  126.7052],
    // Taiwan
    'taiwan/Taipei':                          [25.0330,  121.5654],
    'taiwan/Hualien + Taroko Gorge':          [24.1908,  121.6202],
    // Japan Winter
    'japan-winter/Osaka':                     [34.6937,  135.5023],
    'japan-winter/Hakuba Valley':             [36.6953,  137.8378],
    'japan-winter/Departure':                 [35.1815,  136.9066], // Nagoya
    // China 1 (metropolises)
    'china-1/Beijing':                        [39.9042,  116.4074],
    'china-1/Shanghai':                       [31.2304,  121.4737],
    'china-1/Shenzhen':                       [22.5431,  114.0579],
    'china-1/Buffer':                         [22.5431,  114.0579],
    // HK
    'hk/Hong Kong':                           [22.3193,  114.1694],
    // Philippines
    'philippines/Manila':                     [14.5995,  120.9842],
    'philippines/Coron':                      [11.9964,  119.4192],
    'philippines/El Nido':                    [11.1949,  119.4013],
    'philippines/Cebu / Moalboal':            [10.2720,  123.4220],
    'philippines/Transfer to Sorong':         [-0.8917,  131.2500],
    // Indonesia Block 1 — Raja Ampat
    'indonesia-1/Transit to Sorong':          [-0.8917,  131.2500],
    'indonesia-1/Raja Ampat Liveaboard':      [-0.5897,  130.1053],
    'indonesia-1/Transit Sorong → Bali':      [-8.6500,  115.2167],
    // Indonesia Block 2
    'indonesia-2/Nusa Penida':               [-8.7270,  115.5444],
    'indonesia-2/Komodo':                    [-8.4889,  119.8825], // Labuan Bajo
    'indonesia-2/Bali + Volcano':            [-8.5069,  115.2625], // Ubud
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
    // China 2 (landscapes)
    'china-2/Guilin / Yangshuo':              [24.7783,  110.4933],
    'china-2/Zhangjiajie + Tianmen':          [29.1170,  110.4790],
    'china-2/Chongqing':                      [29.4316,  106.9123],
    'china-2/Chengdu':                        [30.5728,  104.0668],
    'china-2/Xi\'an':                         [34.3416,  108.9398],
    'china-2/Buffer':                         [34.3416,  108.9398],
  },
};
