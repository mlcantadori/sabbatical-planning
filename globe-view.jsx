// 3D globe view — Flighty-style satellite Earth, Three.js (WebGL).
// Blue Marble texture + country labels + glowing route arcs. Same external
// interface as MapView: selectedId / selectedPlaceIdx / onSelectChapter /
// onSelectPlace / focusKey.

(function () {
  const { chapterColor } = window.TRIP;

  const HOME = { lat: 18, lng: 15, r: 3.3 };
  // Base tube radius (world units, at the home distance) — the tick loop
  // thins tubes as you zoom in so the on-screen line weight stays ~constant.
  const ARC_R = 0.0014;
  const TEX_URL = 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg';

  // [name, lng, lat] — major countries + trip-relevant places
  const COUNTRIES = [
    ['United States', -100, 40], ['Canada', -105, 56], ['Mexico', -102, 23],
    ['Cuba', -79, 22], ['Colombia', -73, 4], ['Brazil', -52, -10],
    ['Peru', -76, -10], ['Argentina', -64, -35], ['Chile', -71, -33],
    ['Greenland', -42, 72], ['Iceland', -18, 65],
    ['United Kingdom', -2, 54], ['Ireland', -8, 53], ['France', 2, 47],
    ['Spain', -4, 40], ['Portugal', -8, 39.5], ['Italy', 12.5, 42.5],
    ['Germany', 10, 51], ['Poland', 20, 52], ['Norway', 8, 62],
    ['Sweden', 15, 62], ['Finland', 26, 64], ['Ukraine', 32, 49],
    ['Russia', 95, 62], ['Greece', 24, 39], ['Turkey', 35, 39],
    ['Georgia', 44, 42], ['Syria', 39, 35], ['Iraq', 44, 33],
    ['Saudi Arabia', 45, 24], ['Yemen', 48, 16], ['Oman', 58, 21],
    ['Iran', 54, 32], ['Afghanistan', 66, 34], ['Pakistan', 70, 30],
    ['Azerbaijan', 47.7, 40.3], ['Kazakhstan', 68, 48], ['Uzbekistan', 64, 41],
    ['India', 79, 22], ['Nepal', 84, 28], ['Sri Lanka', 81, 8],
    ['Bangladesh', 90, 24], ['Myanmar', 96, 21], ['Thailand', 101, 16],
    ['Laos', 104, 18], ['Vietnam', 108, 14], ['Cambodia', 105, 13],
    ['Malaysia', 102, 4], ['Singapore', 104, 1.35], ['Indonesia', 115, -2],
    ['Philippines', 122, 13], ['Taiwan', 121, 24], ['Hong Kong', 114, 22.3],
    ['China', 104, 35], ['Mongolia', 105, 46], ['Japan', 139, 37],
    ['South Korea', 128, 36], ['Egypt', 30, 27], ['Libya', 18, 28],
    ['Morocco', -6, 32], ['Algeria', 3, 28], ['Tunisia', 10, 34],
    ['Sudan', 30, 13], ['Chad', 19, 15], ['Niger', 12, 17], ['Mali', -2, 17],
    ['Nigeria', 8, 10], ['Ethiopia', 40, 9], ['Kenya', 38, 1],
    ['Somalia', 46, 6], ['DR Congo', 23, -3], ['Tanzania', 35, -6],
    ['Angola', 18, -12], ['Namibia', 17, -22], ['South Africa', 25, -29],
    ['Mozambique', 36, -18], ['Madagascar', 47, -20],
    ['Australia', 134, -25], ['New Zealand', 172, -42], ['Papua New Guinea', 141, -6],
  ];

  function GlobeView({ selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, focusKey }) {
    const store = window.useStore();
    const chapters = store.getChapters();

    const ref = React.useRef(null);
    const st = React.useRef(null);
    const propsRef = React.useRef({ selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, chapters });
    propsRef.current = { selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, chapters };

    function llv(lat, lng, r) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    function facing(worldPos, margin) {
      const s = st.current;
      const n = worldPos.clone().normalize();
      const c = s.camera.position.clone().normalize();
      return n.dot(c) > (margin == null ? 0.08 : margin);
    }

    function toScreen(worldPos) {
      const s = st.current;
      const v = worldPos.clone().project(s.camera);
      return [(v.x * 0.5 + 0.5) * s.w, (-v.y * 0.5 + 0.5) * s.h];
    }

    // ── one-time setup ──────────────────────────────────────────────────
    React.useEffect(() => {
      const THREE = window.THREE;
      if (!THREE || st.current) return;
      const el = ref.current;
      if (!el) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 1000);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const sun = new THREE.DirectionalLight(0xffffff, 1.5);
      sun.position.set(5, 2.5, 4);
      scene.add(sun);

      // Earth
      const earth = new THREE.Group();
      scene.add(earth);
      const tex = new THREE.TextureLoader().setCrossOrigin('anonymous').load(TEX_URL, () => {});
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(1, 96, 96),
        new THREE.MeshPhongMaterial({ map: tex, shininess: 12, specular: new THREE.Color(0x222222) })
      );
      earth.add(globe);

      // Atmosphere rim glow
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(1.03, 96, 96),
        new THREE.ShaderMaterial({
          vertexShader: 'varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
          fragmentShader: 'varying vec3 vNormal; void main(){ float intensity = pow(0.62 - dot(vNormal, vec3(0, 0, 1.0)), 3.5); gl_FragColor = vec4(0.35, 0.55, 0.9, 1.0) * intensity; }',
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
        })
      );
      scene.add(atmo);

      // Stars
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(900 * 3);
      for (let i = 0; i < 900; i++) {
        const r = 30 + Math.random() * 60;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
        starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        starPos[i * 3 + 2] = r * Math.cos(p);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0xffffff, size: 1.4, sizeAttenuation: false,
        transparent: true, opacity: 0.75, depthWrite: false,
      }));
      scene.add(stars);

      const arcs = new THREE.Group();
      scene.add(arcs);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.minDistance = 2.0;
      controls.maxDistance = 9;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;
      // First manual grab (drag or wheel) stops the spin for good —
      // it only resumes on an explicit "back to whole route".
      controls.addEventListener('start', () => {
        const s = st.current; if (!s) return;
        s.spinOff = true;
        s.controls.autoRotate = false;
      });

      // HTML overlays
      const overlay = document.createElement('div');
      overlay.className = 'eq-pins';
      el.appendChild(overlay);
      const popupEl = document.createElement('div');
      popupEl.className = 'eq-popup';
      popupEl.style.display = 'none';
      el.appendChild(popupEl);
      const ctl = document.createElement('div');
      ctl.className = 'eq-zoom';
      ctl.innerHTML = '<button data-z="in" title="Zoom in">+</button><button data-z="out" title="Zoom out">−</button>';
      el.appendChild(ctl);
      const attr = document.createElement('div');
      attr.className = 'eq-attr';
      attr.textContent = 'Imagery © NASA Blue Marble · Country labels © Natural Earth';
      el.appendChild(attr);

      st.current = {
        renderer, scene, camera, controls, earth, arcs, stars,
        overlay, popupEl, w: 0, h: 0, raf: 0, tween: null, world: true,
        spinOff: false, arcMats: [],
        noMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      };

      const home = llv(HOME.lat, HOME.lng, HOME.r);
      camera.position.copy(home);
      controls.target.set(0, 0, 0);
      controls.update();

      ctl.querySelector('[data-z="in"]').addEventListener('click', () => dolly(1 / 1.4));
      ctl.querySelector('[data-z="out"]').addEventListener('click', () => dolly(1.4));

      renderer.domElement.addEventListener('click', () => {
        const s = st.current; if (!s) return;
        s.popupEl.style.display = 'none';
        s.popupEl._anchor = null;
      });

      const ro = new ResizeObserver(() => size());
      ro.observe(el);
      size();

      const tick = () => {
        const s = st.current;
        if (!s) return;
        s.raf = requestAnimationFrame(tick);
        stepTween();
        s.controls.update();
        if (!s.noMotion) {
          const t = performance.now() * 0.001;
          for (let i = 0; i < s.arcMats.length; i++) s.arcMats[i].uniforms.uTime.value = t;
        }
        // Zoom-compensated line weight: thin the tubes as the camera moves
        // in so their on-screen width stays ~constant; never thicken past
        // the base radius when zoomed out (keeps the world view airy).
        const dist = s.camera.position.length();
        const shrink = ARC_R * (1 - Math.max(0.3, Math.min(1, dist / HOME.r)));
        if (Math.abs(shrink - (s.lastShrink || 0)) > 1e-5) {
          s.lastShrink = shrink;
          for (let i = 0; i < s.arcMats.length; i++) s.arcMats[i].uniforms.uShrink.value = shrink;
        }
        updateOverlay();
        s.renderer.render(s.scene, s.camera);
      };
      tick();

      rebuildAll();

      return () => {
        ro.disconnect();
        if (st.current) {
          cancelAnimationFrame(st.current.raf);
          st.current.controls.dispose();
          st.current.scene.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
              const ms = Array.isArray(o.material) ? o.material : [o.material];
              ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
            }
          });
          st.current.renderer.dispose();
          st.current.renderer.domElement.remove();
          st.current.overlay.remove();
          st.current.popupEl.remove();
          ctl.remove();
          attr.remove();
          st.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function dolly(f) {
      const s = st.current; if (!s) return;
      s.spinOff = true;
      s.controls.autoRotate = false;
      const len = Math.max(2.0, Math.min(9, s.camera.position.length() * f));
      s.camera.position.setLength(len);
    }

    function size() {
      const s = st.current; if (!s) return;
      const el = ref.current; if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      s.w = w; s.h = h;
      s.camera.aspect = w / h;
      s.camera.updateProjectionMatrix();
      s.renderer.setSize(w, h);
    }

    function stepTween() {
      const s = st.current;
      const tw = s && s.tween;
      if (!tw) return;
      const t = Math.min(1, (performance.now() - tw.start) / tw.dur);
      const e = 1 - Math.pow(1 - t, 3);
      s.controls.target.lerpVectors(tw.fromT, tw.toT, e);
      s.camera.position.lerpVectors(tw.fromP, tw.toP, e);
      if (t >= 1) {
        s.tween = null;
        s.controls.enabled = true;
      }
    }

    function flyTo(targetPos, camPos, dur) {
      const s = st.current; if (!s) return;
      s.tween = {
        start: performance.now(), dur: dur || 1100,
        fromT: s.controls.target.clone(), toT: targetPos.clone(),
        fromP: s.camera.position.clone(), toP: camPos.clone(),
      };
      s.controls.enabled = false;
      s.controls.autoRotate = false;
    }

    function arcBetween(a, b) {
      // Great-circle slerp lifted above the surface (Flighty-style arcs),
      // rendered as a real 3D tube with an animated dashed glow shader.
      // (THREE.Line is always 1px in WebGL — thin, aliased, no glow —
      // which is why the old LineDashedMaterial looked fuzzy.)
      const va = llv(a[0], a[1], 1).normalize();
      const vb = llv(b[0], b[1], 1).normalize();
      const angle = va.angleTo(vb);
      const lift = 0.008 + 0.10 * Math.min(1, angle / Math.PI);
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const t = i / 48;
        const v = va.clone().lerp(vb, t).normalize()
          .multiplyScalar(1.005 + lift * Math.sin(Math.PI * t));
        pts.push(v);
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const len = curve.getLength();
      // Keep world-space dash period ~0.014: short duty + tight spacing
      // reads as a dotted series.
      const dashCount = Math.max(4, Math.round(len / 0.014));
      const geo = new THREE.TubeGeometry(curve, 64, ARC_R, 6, false);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0xe8823f) },
          uTime: { value: 0 },
          uDashCount: { value: dashCount },
          uOpacity: { value: 0.95 },
          uShrink: { value: 0 },
        },
        // uShrink slides verts inward along the tube normals to thin the
        // line without rebuilding geometry (driven by zoom in tick()).
        vertexShader: 'varying vec2 vUv; uniform float uShrink; void main(){ vUv = uv; vec3 p = position - normal * uShrink; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
        fragmentShader: [
          'varying vec2 vUv;',
          'uniform vec3 uColor;',
          'uniform float uTime;',
          'uniform float uDashCount;',
          'uniform float uOpacity;',
          'void main(){',
          // Flow toward the destination (vUv.x = 0 at origin, 1 at dest).
          '  float x = fract(vUv.x * uDashCount - uTime * 1.2);',
          // Dot-like dash: short duty with soft edges (~20% of each cell).
          '  float dash = smoothstep(0.0, 0.05, x) * (1.0 - smoothstep(0.15, 0.20, x));',
          // Fade the tube ends so dashes dissolve into the city dots.
          '  float ends = smoothstep(0.0, 0.03, vUv.x) * (1.0 - smoothstep(0.97, 1.0, vUv.x));',
          '  float a = dash * ends * uOpacity;',
          '  if (a < 0.003) discard;',
          '  gl_FragColor = vec4(uColor, a);',
          '}',
        ].join('\n'),
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 3;
      mesh.userData.arcMat = mat;
      return mesh;
    }

    function updateOverlay() {
      const s = st.current; if (!s) return;
      const kids = s.overlay.children;
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i];
        if (el._hidden) {
          el.style.display = 'none';
          continue;
        }
        const a = el._anchor;
        if (!a) continue;
        const wp = llv(a[0], a[1], 1);
        const facing = wp.clone().normalize().dot(s.camera.position.clone().normalize());
        if (facing < (el._country ? 0.0 : 0.08)) {
          el.style.display = 'none';
          continue;
        }
        const sp = wp.clone().project(s.camera);
        const x = (sp.x * 0.5 + 0.5) * s.w;
        const y = (-sp.y * 0.5 + 0.5) * s.h;
        el.style.display = null;
        el.style.transform = el._country
          ? `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`
          : `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      }
      if (s.popupEl._anchor) {
        const a = s.popupEl._anchor;
        const wp = llv(a[0], a[1], 1);
        if (wp.clone().normalize().dot(s.camera.position.clone().normalize()) < 0.08) {
          s.popupEl.style.display = 'none';
        } else {
          const sp = wp.project(s.camera);
          s.popupEl.style.left = ((sp.x * 0.5 + 0.5) * s.w).toFixed(1) + 'px';
          s.popupEl.style.top = ((-sp.y * 0.5 + 0.5) * s.h).toFixed(1) + 'px';
        }
      }
    }

    function pinEl(c) {
      const accent = chapterColor(c);
      const wrap = document.createElement('div');
      wrap.className = 'eq-pin-wrap';
      wrap._anchor = c.anchor;
      wrap._id = c.id;
      wrap._chId = c.id;
      wrap.innerHTML = `<div class="map-pin" data-chapter="${c.id}">`
        + `<div class="map-pin-num" style="--pin-c: ${accent};">${c.num == null ? '' : c.num}</div>`
        + `<div class="map-pin-label">${c.title}</div></div>`;
      wrap.querySelector('.map-pin').addEventListener('click', (e) => {
        e.stopPropagation();
        const cb = propsRef.current.onSelectChapter;
        if (cb) cb(c.id);
      });
      return wrap;
    }

    function cityEl(c, p, i) {
      const accent = chapterColor(c);
      const wrap = document.createElement('div');
      wrap.className = 'eq-pin-wrap eq-city-wrap';
      wrap._anchor = p.coords;
      wrap._chId = c.id;
      wrap.innerHTML = `<div class="map-place" data-chapter="${c.id}" data-idx="${i}">`
        + `<div class="map-place-dot" style="--pin-c: ${accent}"></div>`
        + `<div class="map-place-label">${i + 1}. ${p.name}</div></div>`;
      wrap.querySelector('.map-place').addEventListener('click', (e) => {
        e.stopPropagation();
        const pr = propsRef.current;
        if (pr.onSelectChapter) pr.onSelectChapter(c.id);
        if (pr.onSelectPlace) pr.onSelectPlace(i);
      });
      return wrap;
    }

    function countryEl(name, lng, lat) {
      const el = document.createElement('div');
      el.className = 'eq-country';
      el._anchor = [lat, lng];
      el._country = true;
      el.textContent = name;
      return el;
    }

    function rebuildAll() {
      const s = st.current; if (!s) return;
      const { onSelectChapter } = propsRef.current;
      s.overlay.innerHTML = '';
      COUNTRIES.forEach(([name, lng, lat]) => s.overlay.appendChild(countryEl(name, lng, lat)));
      const list = propsRef.current.chapters.filter((c) => c.kind !== 'transit' && c.anchor);
      // City dots in itinerary order; anchor fallback pins for chapters
      // without place coords.
      list.forEach((c) => {
        const withCoords = (c.places || [])
          .map((p, i) => ({ p, i }))
          .filter((s) => s.p.coords);
        if (withCoords.length) withCoords.forEach(({ p, i }) => s.overlay.appendChild(cityEl(c, p, i)));
        else s.overlay.appendChild(pinEl(c));
      });
      // route arcs through the city stops in travel order
      const stops = [];
      list.forEach((c) => {
        const withCoords = (c.places || []).filter((p) => p.coords);
        if (withCoords.length) withCoords.forEach((p) => stops.push(p.coords));
        else if (c.anchor) stops.push(c.anchor);
      });
      while (s.arcs.children.length) {
        const l = s.arcs.children.pop();
        s.arcs.remove(l);
        l.geometry.dispose();
        l.material.dispose();
      }
      s.arcMats.length = 0;
      for (let i = 0; i + 1 < stops.length; i++) {
        const arc = arcBetween(stops[i], stops[i + 1]);
        s.arcs.add(arc);
        if (arc.userData.arcMat) s.arcMats.push(arc.userData.arcMat);
      }
      void onSelectChapter;
      refreshSelection();
    }

    function refreshSelection() {
      const s = st.current; if (!s) return;
      const { selectedId, selectedPlaceIdx, onSelectPlace, chapters } = propsRef.current;
      [...s.overlay.children].forEach((el) => {
        const pin = el.querySelector('.map-pin');
        if (pin) pin.classList.toggle('is-active', el._id === selectedId);
      });
      // Hide whole-route city dots of the selected chapter (re-rendered
      // below with popups) to avoid duplicates; updateOverlay honors _hidden.
      [...s.overlay.children].forEach((el) => {
        if (el.classList && el.classList.contains('eq-city-wrap')) {
          el._hidden = el._chId === selectedId;
        }
      });
      [...s.overlay.querySelectorAll('.eq-place-wrap')].forEach((el) => el.remove());
      s.popupEl.style.display = 'none';
      s.popupEl._anchor = null;
      s.controls.autoRotate = !selectedId && !s.spinOff;

      if (!selectedId) {
        // Panel just closed: make sure the orbit target is back at the
        // globe center (and cancel any interrupted fly-to) so rotate/pan
        // behaves normally again instead of orbiting a surface point.
        s.tween = null;
        s.controls.enabled = true;
        if (s.controls.target.length() > 1e-6) s.controls.target.set(0, 0, 0);
        return;
      }
      const ch = chapters.find((c) => c.id === selectedId);
      if (!ch) return;
      const accent = chapterColor(ch);
      ch.places.forEach((p, i) => {
        if (!p.coords) return;
        const wrap = document.createElement('div');
        wrap.className = 'eq-pin-wrap eq-place-wrap';
        wrap._anchor = p.coords;
        wrap.innerHTML = `<div class="map-place${i === selectedPlaceIdx ? ' is-active' : ''}">`
          + `<div class="map-place-dot" style="--pin-c: ${accent}"></div>`
          + `<div class="map-place-label">${i + 1}. ${p.name}</div></div>`;
        wrap.querySelector('.map-place').addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelectPlace) onSelectPlace(i);
        });
        s.overlay.appendChild(wrap);
      });

      if (selectedPlaceIdx != null && ch.places[selectedPlaceIdx]) {
        const p = ch.places[selectedPlaceIdx];
        s.popupEl._anchor = p.coords;
        s.popupEl.innerHTML = `<div class="map-popup"><div class="map-popup-num">${selectedPlaceIdx + 1}</div>`
          + `<div><div class="map-popup-name">${p.name}</div>`
          + `<div class="map-popup-sub">${p.days} day${p.days > 1 ? 's' : ''}</div>`
          + `<a class="map-popup-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query)}" target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a>`
          + `</div></div>`;
        s.popupEl.style.display = 'block';
      }

      // Fly the camera to face the chapter. The orbit target stays at the
      // globe center — targeting a surface point would leave OrbitControls
      // orbiting off-center after the panel closes, making pan/zoom feel
      // broken until the next "back to whole route".
      if (ch.anchor) {
        const camPos = llv(ch.anchor[0], ch.anchor[1], 2.35);
        flyTo(new window.THREE.Vector3(0, 0, 0), camPos, 1100);
      }
    }

    // ── rebuild pins + route when chapters change ─────────────────────────
    const chapKey = chapters.map((c) => c.id + ':' + (c.anchor || []).join(',') + ':' + (c.places || []).map((p) => (p.coords || []).join(',')).join(';')).join('|');
    React.useEffect(() => {
      if (st.current) rebuildAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapKey]);

    // ── selection ─────────────────────────────────────────────────────────
    React.useEffect(() => {
      if (st.current) refreshSelection();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, selectedPlaceIdx, chapters]);

    // ── external "focus world" trigger ────────────────────────────────────
    React.useEffect(() => {
      const s = st.current; if (!s) return;
      if (focusKey === 'world') {
        flyTo(new window.THREE.Vector3(0, 0, 0), llv(HOME.lat, HOME.lng, HOME.r), 1100);
        s.spinOff = false;
        if (!propsRef.current.selectedId) s.controls.autoRotate = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusKey]);

    return <div ref={ref} className="map-container is-globe" style={{ width: '100%', height: '100%' }} />;
  }

  window.GlobeView = GlobeView;
})();
