// Leaflet map view. Reads chapters + place coords from the store so it
// re-renders when the user adds/removes/edits.

(function () {
  const { chapterColor } = window.TRIP;

  // One zoom for every chapter. Moving between chapters is then a pure pan:
  // Leaflet animates a zoom by CSS-scaling the whole map pane, so any zoom
  // change drags the dashed route lines with it (they stretch and shimmer for
  // the length of the move) and, at these distances, dips the camera to ~z3.5
  // and back through a half-loaded world. Fixed zoom, no scaling, no dip.
  // Chapters that simply do not fit at z6 (Brasil and the Philippines are ~20°
  // of latitude) still ease out to their own fit — a ≤0.6-level difference,
  // not the up-to-five-level jumps this replaces.
  const CHAPTER_ZOOM = 6;

  // Past this much ground a pan is a sweep across continents: about one screen
  // at z6 (~31° of longitude at the equator). Under it, Leaflet's flyTo does
  // not even need to zoom out to make the trip, which is the whole point.
  const CUT_KM = 2600;

  // Great-circle interpolation between two [lat,lng] points — the actual
  // shortest path a flight follows over the sphere, not an arbitrary bulge.
  function greatCircleSegment(p1, p2, segments = 48) {
    const toRad = (d) => (d * Math.PI) / 180, toDeg = (r) => (r * 180) / Math.PI;
    const lat1 = toRad(p1[0]), lng1 = toRad(p1[1]);
    const lat2 = toRad(p2[0]), lng2 = toRad(p2[1]);
    const d = 2 * Math.asin(Math.sqrt(
      Math.sin((lat2 - lat1) / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
    ));
    if (d < 1e-9) return [p1, p2];
    const pts = [];
    let prevLng = null;
    for (let i = 0; i <= segments; i++) {
      const f = i / segments;
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
      const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
      let lng = toDeg(Math.atan2(y, x));
      // Unwrap so the path doesn't jump across the antimeridian on screen.
      if (prevLng !== null) {
        while (lng - prevLng > 180) lng -= 360;
        while (lng - prevLng < -180) lng += 360;
      }
      prevLng = lng;
      pts.push([lat, lng]);
    }
    return pts;
  }

  function MapView({ selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, focusKey, placeZoom, onBackgroundClick }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const ROUTE_CHAPTERS = chapters.filter((c) => c.kind !== 'transit' && c.anchor);

    const ref = React.useRef(null);
    const mapRef = React.useRef(null);
    const layersRef = React.useRef({ chapters: [], places: [], routes: [] });
    const jumpRef = React.useRef({ timer: null, token: null });
    const selectedIdRef = React.useRef(selectedId);
    React.useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

    // Ordered city stops across the whole itinerary: every place with
    // coords, in chapter/place order. Chapters with no place coords fall
    // back to their anchor so they still appear on the route.
    const getStops = () => {
      const stops = [];
      ROUTE_CHAPTERS.forEach((c) => {
        const withCoords = (c.places || [])
          .map((p, i) => ({ ch: c, place: p, idx: i }))
          .filter((s) => s.place.coords);
        if (withCoords.length) stops.push(...withCoords);
        else if (c.anchor) stops.push({ ch: c, place: null, idx: null });
      });
      return stops;
    };
    const stopCoords = (s) => (s.place ? s.place.coords : s.ch.anchor);

    // The chapter today falls in — the map opens here. Null before the trip
    // starts and after it ends, when the whole route (world view) is home.
    const homeChapter = () => (window.TRIP_NOW ? window.TRIP_NOW.currentChapter(chapters) : null);

    // Points + framing for the home view: today's chapter when there is
    // one, otherwise every city stop edge-to-edge.
    const homeFrame = () => {
      const cur = homeChapter();
      if (cur) {
        const pts = (cur.places || []).map((p) => p.coords).filter(Boolean);
        // "Where I am" is framed exactly like a selected chapter: same zoom,
        // same padding. It used to be capped at z4 ("South Asia, not
        // Kathmandu"), which made the landing view wider than every chapter
        // you could click to — and wider than what the Now button restored.
        return { pts, padding: [40, 40], maxZoom: CHAPTER_ZOOM, single: cur.anchor };
      }
      return { pts: getStops().map(stopCoords).filter(Boolean), padding: [24, 24], maxZoom: undefined, single: null };
    };

    const frameHome = () => {
      const map = mapRef.current;
      if (!map || selectedIdRef.current) return;
      map.invalidateSize();
      const { pts, padding, maxZoom, single } = homeFrame();
      if (pts.length > 1) {
        map.fitBounds(pts, { padding, maxZoom, animate: false });
      } else if (pts.length === 1) {
        map.setView(pts[0], CHAPTER_ZOOM, { animate: false });
      } else if (single) {
        map.setView(single, CHAPTER_ZOOM, { animate: false });
      }
    };

    // Never rests more zoomed out than the fit requires (repairs a
    // premature fit computed while the layout/fonts were still
    // settling); never touches a manual zoom-in.
    const ensureHomeFit = () => {
      const map = mapRef.current;
      if (!map || selectedIdRef.current) return;
      map.invalidateSize();
      const { pts, padding, maxZoom } = homeFrame();
      if (pts.length < 2) return;
      const capped = maxZoom == null ? Infinity : maxZoom;
      const need = Math.min(map.getBoundsZoom(pts, false, padding), capped);
      if (map.getZoom() < need) {
        map.fitBounds(pts, { padding, maxZoom, animate: false });
      }
    };

    // Build map once
    React.useEffect(() => {
      if (mapRef.current || !window.L) return;
      const L = window.L;
      // First paint already faces today's chapter instead of a generic
      // Asia-wide center (frameHome below settles the exact framing).
      const cur = homeChapter();
      const firstPt = cur ? (cur.anchor || (cur.places || []).map((p) => p.coords).filter(Boolean)[0]) : null;
      const map = L.map(ref.current, {
        center: firstPt || [25, 105],
        zoom: firstPt ? 4 : 3,
        minZoom: 2,
        maxZoom: 19,
        zoomControl: false,
        scrollWheelZoom: true,
        worldCopyJump: true,
        attributionControl: false,
        fadeAnimation: false,
      });
      mapRef.current = map;
      window._map = map;

      // Esri World Imagery (satellite) + reference overlay for city names,
      // boundaries and water labels. Note the {z}/{y}/{x} order.
      //
      // detectRetina: Esri ships only 256px tiles, so on a 2x display every
      // tile was being upscaled and the map read soft. Leaflet's retina
      // mode requests the next zoom level and draws it at half size — the
      // only way to get a genuinely sharp basemap out of this service.
      //
      // keepBuffer 4, not Leaflet's 2: a 600px flick at a chapter's zoom is
      // ~2.3 tiles, so with a 2-tile ring the leading edge kept showing the
      // page background through tiles that had not arrived yet. The wider
      // ring is prefetched per view (~40% more tiles, cached after the first
      // look) and covers the flick.
      const TILE = { maxZoom: 19, attribution: '', detectRetina: true, keepBuffer: 4 };
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        ...TILE,
      }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        ...TILE, opacity: 0.78, zIndex: 3,
      }).addTo(map);
      // Roads overlay only at country level and deeper (z7+) — at world
      // view it's visual noise. Toggled on zoomend (fitBounds/setView
      // fire it too, so programmatic fits stay in sync).
      const transport = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        ...TILE, opacity: 0.5, zIndex: 2,
        className: 'transport-tiles',
      });
      const TRANSPORT_MIN_ZOOM = 7;
      const syncTransport = () => {
        const show = map.getZoom() >= TRANSPORT_MIN_ZOOM;
        const has = map.hasLayer(transport);
        if (show && !has) transport.addTo(map);
        else if (!show && has) map.removeLayer(transport);
      };
      // Leaflet fires 'click' only for the surface itself — a marker's click
      // does not bubble to it — and suppresses it after a drag, which is
      // exactly the "background click" we want to forward.
      map.on('click', () => { if (onBackgroundClick) onBackgroundClick(); });
      map.on('zoomend', syncTransport);
      syncTransport();

      const onResize = () => {
        if (mapRef.current) mapRef.current.invalidateSize();
        clearTimeout(onResize._t);
        onResize._t = setTimeout(() => ensureHomeFit(), 250);
      };
      window.addEventListener('resize', onResize);
      // Late layout shifts (webfonts, images) don't fire resize — refit
      // once they're settled so the initial frame isn't stuck too wide.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ensureHomeFit());
      }
      return () => {
        window.removeEventListener('resize', onResize);
        clearTimeout(onResize._t);
        map.remove();
        mapRef.current = null;
        if (jumpRef.current.timer) clearTimeout(jumpRef.current.timer);
        jumpRef.current = { timer: null, token: null };
      };
    }, []);

    // Rebuild chapter markers + polyline whenever the chapter list changes
    // (add/remove/edit). Cheap enough: drops all markers, re-adds them.
    React.useEffect(() => {
      const map = mapRef.current; if (!map) return;
      const L = window.L;

      // Clear
      layersRef.current.chapters.forEach((m) => m.marker.remove());
      layersRef.current.chapters = [];
      layersRef.current.routes.forEach((r) => r.remove());
      layersRef.current.routes = [];

      // Route polyline through the city stops in travel order. One segment
      // per leg, painted with the starting dot's chapter color so the route
      // changes color as the trip moves between chapters.
      const stops = getStops();
      const routePoints = stops.map(stopCoords).filter(Boolean);
      for (let i = 0; i + 1 < stops.length; i++) {
        const from = stopCoords(stops[i]), to = stopCoords(stops[i + 1]);
        if (!from || !to) continue;
        const route = L.polyline(greatCircleSegment(from, to), {
          className: 'route-line',
          color: chapterColor(stops[i].ch), weight: 2.5, opacity: 0.95,
          dashArray: '0.5, 7', lineCap: 'round', lineJoin: 'round',
        }).addTo(map);
        layersRef.current.routes.push(route);
      }

      // City dots (one per place); anchor fallback pins for chapters
      // without place coords. Clicking a dot selects its chapter + place.
      stops.forEach((s) => {
        const c = s.ch;
        const accent = chapterColor(c);
        if (s.place) {
          const p = s.place, i = s.idx;
          const html = `
            <div class="map-place" data-chapter="${c.id}" data-idx="${i}">
              <div class="map-place-dot" style="--pin-c: ${accent}"></div>
              <div class="map-place-label">${i + 1}. ${p.name}</div>
            </div>`;
          const icon = L.divIcon({ html, className: 'map-place-wrap', iconSize: [14, 14], iconAnchor: [7, 7] });
          const m = L.marker(p.coords, { icon, riseOnHover: true });
          m.on('click', () => {
            if (onSelectChapter) onSelectChapter(c.id);
            if (onSelectPlace) onSelectPlace(i);
          });
          m.addTo(map);
          layersRef.current.chapters.push({ id: c.id, idx: i, marker: m });
        } else {
          const num = c.num == null ? '' : c.num.toString();
          const html = `
            <div class="map-pin" data-chapter="${c.id}">
              <div class="map-pin-num" style="--pin-c: ${accent};">${num}</div>
              <div class="map-pin-label">${c.title}</div>
            </div>`;
          const icon = L.divIcon({ html, className: 'map-pin-wrap', iconSize: [30, 30], iconAnchor: [15, 15] });
          const m = L.marker(c.anchor, { icon, riseOnHover: true });
          m.on('click', () => onSelectChapter && onSelectChapter(c.id));
          m.addTo(map);
          layersRef.current.chapters.push({ id: c.id, idx: null, marker: m });
        }
      });

      // Apply active state to the pin matching selectedId
      layersRef.current.chapters.forEach(({ id, marker }) => {
        const el = marker.getElement();
        if (!el) return;
        const pin = el.querySelector('.map-pin, .map-place');
        if (pin) pin.classList.toggle('is-active', id === selectedIdRef.current);
      });

      // If no chapter selected, apply the home framing (today's chapter,
      // or the whole route) so the opening view is where you actually
      // are. The map lives in its own grid column (no overlaid sidebar),
      // so small symmetric padding frames the dots tightly. ensureHomeFit
      // also repairs it after late layout shifts and window resizes (see
      // the build-once effect above).
      if (!selectedIdRef.current && routePoints.length) {
        setTimeout(() => frameHome(), 100);
      }
      // Deps: chapter ids + anchors + place coords (any add/remove/edit re-runs)
    }, [chapters.map((c) => c.id + ':' + (c.anchor || []).join(',') + ':' + (c.places || []).map((p) => (p.coords || []).join(',')).join(';')).join('|')]);

    // Reflect selected chapter — swap places, frame view, highlight pin
    React.useEffect(() => {
      const map = mapRef.current; if (!map) return;
      const L = window.L;

      // Hide whole-route dots of the selected chapter (re-rendered below
      // with their own markers) to avoid duplicates; restore on deselect.
      layersRef.current.chapters.forEach(({ id, marker }) => {
        if (id === selectedId) {
          if (map.hasLayer(marker)) marker.remove();
        } else {
          if (!map.hasLayer(marker)) marker.addTo(map);
          const el = marker.getElement();
          const pin = el && el.querySelector('.map-pin, .map-place');
          if (pin) pin.classList.toggle('is-active', false);
        }
      });

      layersRef.current.places.forEach((m) => m.remove());
      layersRef.current.places = [];

      // No chapter selected (e.g. detail panel just closed): the map column
      // widens, so force Leaflet to re-measure or tiles won't fill the freed
      // area and a grey box remains where the panel was.
      if (!selectedId) {
        setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 50);
        setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 350);
        return;
      }
      const ch = chapters.find((c) => c.id === selectedId);
      if (!ch) return;

      const placeCoords = [];
      const accent = chapterColor(ch);
      ch.places.forEach((p, i) => {
        if (!p.coords) return;
        placeCoords.push(p.coords);
        const isActive = i === selectedPlaceIdx;
        const html = `
          <div class="map-place ${isActive ? 'is-active' : ''}" data-idx="${i}">
            <div class="map-place-dot" style="--pin-c: ${accent}"></div>
            <div class="map-place-label">${i + 1}. ${p.name}</div>
          </div>`;
        const icon = L.divIcon({ html, className: 'map-place-wrap', iconSize: [14, 14], iconAnchor: [7, 7] });
        const m = L.marker(p.coords, { icon, riseOnHover: true, zIndexOffset: isActive ? 1000 : 0 });
        m.on('click', () => onSelectPlace && onSelectPlace(i));
        m.addTo(map);
        layersRef.current.places.push(m);
      });

      const doFit = () => {
        map.invalidateSize();
        // A selected stop centres the map on that city. How tight that
        // framing is depends on how it was picked: a day on the spine wants
        // the chapter as context, a pin click wants the city itself.
        //
        // Short hops glide: `flyTo` pans and zooms on one curve, with a
        // duration that grows with distance, so a hop across town is a nudge.
        // Long ones cut — see jumpTo. Reduced-motion users get an instant
        // setView for both, which is the one case where that is the polite
        // answer.
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Crossing the world is a cut, not a flight. Leaflet's zoom-out is
        // what makes the transit readable, and it is also what drags the whole
        // route and a half-loaded world across the stage: past roughly one
        // screen of travel, dip to the stage colour, move while nothing is
        // watching, and come back when the new tiles are in.
        const jumpTo = (center, zoom) => {
          const mapEl = map.getContainer();
          const token = {};
          jumpRef.current.token = token;
          if (jumpRef.current.timer) clearTimeout(jumpRef.current.timer);
          mapEl.classList.add('is-jumping');          // CSS fades it out
          jumpRef.current.timer = setTimeout(() => {
            if (jumpRef.current.token !== token) return;
            map.setView(center, zoom, { animate: false });
            // Come back once the view is actually painted: Leaflet's map-level
            // 'load' fires once per map (at init), not per view, so watch the
            // tiles instead. The deadline keeps a failed tile from holding the
            // curtain shut.
            const startedAt = performance.now();
            const waitTiles = () => {
              if (jumpRef.current.token !== token) return;
              const pending = mapEl.querySelectorAll('.leaflet-tile:not(.leaflet-tile-loaded)').length;
              const held = performance.now() - startedAt;
              if (pending === 0 && held > 120) {
                // Loaded is not the same as painted: let two frames go by so
                // the new tiles are on screen before the curtain lifts.
                requestAnimationFrame(() => requestAnimationFrame(() => {
                  if (jumpRef.current.token === token) mapEl.classList.remove('is-jumping');
                }));
                return;
              }
              if (held > 380) { mapEl.classList.remove('is-jumping'); return; }
              jumpRef.current.timer = setTimeout(waitTiles, 50);
            };
            jumpRef.current.timer = setTimeout(waitTiles, 60);
          }, 170);
        };
        const moveTo = (center, zoom) => {
          if (reduced) { map.setView(center, zoom, { animate: false }); return; }
          // Measured in ground, not pixels: a pin click from z6 to z12 is a
          // short hop that happens to be thousands of pixels wide at the zoom
          // it is heading to. Judging by pixels at the target zoom cut every
          // city zoom instead of letting it dive.
          const km = map.getCenter().distanceTo(L.latLng(center)) / 1000;
          if (km > CUT_KM) { jumpTo(center, zoom); return; }
          map.flyTo(center, zoom, {
            duration: Math.min(1.2, 0.6 + km / 9000),
            easeLinearity: 0.24,
          });
        };
        const focused = selectedPlaceIdx != null ? ch.places[selectedPlaceIdx] : null;
        const bounds = placeCoords.length ? L.latLngBounds(placeCoords) : null;
        // The chapter's own framing: z6 unless its stops genuinely do not fit,
        // in which case widen just enough (never tighter than z6).
        const chapterZoom = bounds && placeCoords.length > 1
          ? Math.min(CHAPTER_ZOOM, map.getBoundsZoom(bounds, false, L.point(80, 80)))
          : CHAPTER_ZOOM;
        if (focused && focused.coords) {
          // A day on the spine locates the city at the chapter's zoom; a pin
          // click is its own request for the city itself and passes a tight
          // zoom, which is the one place a deliberate zoom-in is wanted.
          moveTo(focused.coords, placeZoom == null ? chapterZoom : placeZoom);
        } else if (bounds) {
          // fitBounds cannot animate a pan (it computes a zoom and jumps), so
          // the same framing is derived twice: bounds → zoom, then flown to.
          moveTo(bounds.getCenter(), chapterZoom);
        } else if (ch.anchor) {
          moveTo(ch.anchor, CHAPTER_ZOOM);
        }
      };
      // One move per selection. The spread is a fixed overlay — the map keeps
      // its width behind it — so the second fit 350ms later only yanked the
      // freshly framed view off its new centre: a cut, then a correction.
      map.invalidateSize();
      doFit();
    }, [selectedId, selectedPlaceIdx, chapters, placeZoom]);

    // External recentre trigger ("whole route"). The selection effect above
    // frames the chosen chapter when there is one; this only takes over for
    // the case with nothing selected, where the whole route is the answer.
    React.useEffect(() => {
      if (!focusKey || !mapRef.current || selectedIdRef.current) return;
      const pts = getStops().map(stopCoords).filter(Boolean);
      if (!pts.length) return;
      mapRef.current.invalidateSize();
      mapRef.current.fitBounds(pts, {
        padding: [24, 24],
        animate: false,
      });
    }, [focusKey]);

    // CDN guard — render a message instead of crashing the whole app when
    // the Leaflet script failed to load. (Placed after all hooks.)
    if (!window.L) {
      return <div className="map-container"><div className="map-fallback"><div className="kicker">2D map unavailable</div><p>Leaflet failed to load. Check your connection and retry.</p></div></div>;
    }

    return <div ref={ref} className="map-container" style={{ width: '100%', height: '100%' }} />;
  }

  window.MapView = MapView;
})();
