// Map view — Equal Earth projection (per UN General Assembly "Correct the
// Map" resolution, Sep 2026) rendered with D3 + vendored Natural Earth data.
// No tile servers, no API keys, works fully offline after first load.
//
// Reads chapters + place coords from the store. Same external interface as
// the old Leaflet view: selectedId / selectedPlaceIdx / onSelectChapter /
// onSelectPlace / focusKey.

(function () {
  const { REGIONS } = window.TRIP;

  // Central meridian: 30°E keeps the whole route (Toronto –79° … Japan +140°)
  // comfortably inside the frame.
  const CENTER_LON = 30;
  const MAX_ZOOM = 24;

  function MapView({ selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, focusKey }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const ROUTE_CHAPTERS = chapters.filter((c) => c.kind !== 'transit' && c.anchor);

    const ref = React.useRef(null);
    const st = React.useRef(null); // d3 state: { svg, g, pins, route, projection, path, zoom, t, userMoved, world }
    const propsRef = React.useRef({ selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, chapters });
    propsRef.current = { selectedId, selectedPlaceIdx, onSelectChapter, onSelectPlace, chapters };

    const ll = (anchor) => [anchor[1], anchor[0]]; // [lat,lng] → GeoJSON [lng,lat]

    // ── one-time setup + world data load ────────────────────────────────
    React.useEffect(() => {
      const d3 = window.d3;
      const topojson = window.topojson;
      if (!d3 || !topojson || st.current) return;
      const el = ref.current;
      if (!el) return;

      const projection = d3.geoEqualEarth().rotate([-CENTER_LON, 0]).precision(0.1);
      const path = d3.geoPath(projection);
      const svg = d3.select(el).append('svg')
        .attr('class', 'eq-svg')
        .attr('width', '100%')
        .attr('height', '100%');
      const g = svg.append('g');
      g.append('path').attr('class', 'eq-sphere');
      g.append('path').attr('class', 'eq-graticule').attr('d', path(d3.geoGraticule10()));
      g.append('path').attr('class', 'eq-land');
      g.append('path').attr('class', 'eq-borders');
      const routeSel = g.append('path').attr('class', 'route-line eq-route').attr('fill', 'none');

      // HTML overlay layers (pins reuse the existing .map-pin CSS)
      const pinsEl = document.createElement('div');
      pinsEl.className = 'eq-pins';
      el.appendChild(pinsEl);
      const popupEl = document.createElement('div');
      popupEl.className = 'eq-popup';
      popupEl.style.display = 'none';
      el.appendChild(popupEl);

      // Controls + attribution
      const ctl = document.createElement('div');
      ctl.className = 'eq-zoom';
      ctl.innerHTML = '<button data-z="in" title="Zoom in">+</button><button data-z="out" title="Zoom out">−</button>';
      el.appendChild(ctl);
      const attr = document.createElement('div');
      attr.className = 'eq-attr';
      attr.textContent = '© Natural Earth · Equal Earth projection';
      el.appendChild(attr);

      st.current = {
        svg, g, path, projection, routeSel, pinsEl, popupEl,
        t: d3.zoomIdentity, userMoved: false, world: null,
        zoom: null, w: 0, h: 0,
      };

      const zoom = d3.zoom()
        .scaleExtent([1, MAX_ZOOM])
        .translateExtent([[-2000, -2000], [4000, 4000]])
        .on('start', () => { st.current.userMoved = true; })
        .on('zoom', (e) => {
          st.current.t = e.transform;
          applyTransform();
        });
      st.current.zoom = zoom;
      svg.call(zoom);

      // Clicking empty map hides the popup (selection stays, like Leaflet).
      // Pin clicks stopPropagation above, so they never reach here.
      svg.on('click', () => {
        const s = st.current; if (!s) return;
        s.popupEl.style.display = 'none';
        s.popupEl._anchor = null;
      });

      ctl.querySelector('[data-z="in"]').addEventListener('click', () => {
        svg.transition().duration(250).call(zoom.scaleBy, 1.6);
      });
      ctl.querySelector('[data-z="out"]').addEventListener('click', () => {
        svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6);
      });

      const ro = new ResizeObserver(() => size(false));
      ro.observe(el);

      fetch('world-110m.json')
        .then((r) => r.json())
        .then((world) => {
          if (!st.current) return;
          st.current.world = world;
          drawWorld();
          size(true);
          refresh(true);
        })
        .catch(() => { /* ocean background remains */ });

      size(true);

      return () => {
        ro.disconnect();
        if (st.current) {
          st.current.svg.remove();
          st.current.pinsEl.remove();
          st.current.popupEl.remove();
          ctl.remove();
          attr.remove();
          st.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function size(refit) {
      const s = st.current; if (!s) return;
      const el = ref.current; if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      s.w = w; s.h = h;
      s.svg.attr('viewBox', `0 0 ${w} ${h}`);
      if (refit && !s.userMoved && s.world) {
        s.projection.fitExtent([[0, 0], [w, h]], { type: 'Sphere' });
        s.t = window.d3.zoomIdentity;
        s.svg.call(s.zoom.transform, s.t);
        drawWorld();
      }
      applyTransform();
    }

    function drawWorld() {
      const s = st.current; if (!s || !s.world) return;
      const countries = window.topojson.feature(s.world, s.world.objects.countries);
      s.g.select('.eq-sphere').attr('d', s.path({ type: 'Sphere' }));
      s.g.select('.eq-graticule').attr('d', s.path(window.d3.geoGraticule10()));
      s.g.select('.eq-land').datum(countries).attr('d', s.path);
      s.g.select('.eq-borders')
        .datum(window.topojson.mesh(s.world, s.world.objects.countries, (a, b) => a !== b))
        .attr('d', s.path);
      drawRoute();
    }

    function routeFC(list) {
      return {
        type: 'FeatureCollection',
        features: list.filter((c) => c.anchor).map((c) => ({
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: ll(c.anchor) },
        })),
      };
    }

    function drawRoute() {
      const s = st.current; if (!s) return;
      const pts = propsRef.current.chapters
        .filter((c) => c.kind !== 'transit' && c.anchor).map((c) => ll(c.anchor));
      if (pts.length > 1) {
        s.routeSel.datum({ type: 'LineString', coordinates: pts }).attr('d', s.path).style('display', null);
      } else {
        s.routeSel.style('display', 'none');
      }
    }

    // Zoom transform fitting a base-projected bbox into a screen extent.
    function fitTransform(bbox, extent, maxK) {
      const dx = Math.max(1, bbox[1][0] - bbox[0][0]);
      const dy = Math.max(1, bbox[1][1] - bbox[0][1]);
      const k = Math.min(maxK, (extent[1][0] - extent[0][0]) / dx, (extent[1][1] - extent[0][1]) / dy);
      const cx = (bbox[0][0] + bbox[1][0]) / 2;
      const cy = (bbox[0][1] + bbox[1][1]) / 2;
      const ex = (extent[0][0] + extent[1][0]) / 2;
      const ey = (extent[0][1] + extent[1][1]) / 2;
      return window.d3.zoomIdentity.translate(ex - k * cx, ey - k * cy).scale(k);
    }

    function flyTo(bbox, extent, maxK, instant) {
      const s = st.current; if (!s) return;
      const t = fitTransform(bbox, extent, maxK);
      s.userMoved = false;
      if (instant) {
        s.svg.call(s.zoom.transform, t);
      } else {
        s.svg.transition().duration(750).call(s.zoom.transform, t);
      }
    }

    function fullRouteBox(padLeft) {
      const s = st.current;
      const fc = routeFC(propsRef.current.chapters);
      const b = s.path.bounds(fc);
      const pad = 40;
      const left = padLeft && s.w > 1000 ? 300 : pad;
      return { bbox: b, extent: [[left, pad], [s.w - pad, s.h - pad]] };
    }

    function applyTransform() {
      const s = st.current; if (!s) return;
      s.g.attr('transform', s.t.toString());
      positionPins();
    }

    function project(anchor) {
      const s = st.current;
      const [x, y] = s.projection(ll(anchor));
      const [sx, sy] = [s.t.x + s.t.k * x, s.t.y + s.t.k * y];
      return [sx, sy];
    }

    function positionPins() {
      const s = st.current; if (!s) return;
      const { selectedId, selectedPlaceIdx } = propsRef.current;
      const kids = s.pinsEl.children;
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i];
        const a = el._anchor;
        if (!a) continue;
        const [x, y] = project(a);
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.display = (x < -80 || y < -80 || x > s.w + 80 || y > s.h + 80) ? 'none' : null;
      }
      // Popup follows its place
      if (s.popupEl._anchor) {
        const [px, py] = project(s.popupEl._anchor);
        s.popupEl.style.left = px + 'px';
        s.popupEl.style.top = py + 'px';
      }
    }

    // ── rebuild pins + route when chapters change ─────────────────────────
    const chapKey = chapters.map((c) => c.id + ':' + (c.anchor || []).join(',')).join('|');
    React.useEffect(() => {
      const s = st.current; if (!s) return;
      const { onSelectChapter } = propsRef.current;
      s.pinsEl.innerHTML = '';
      const list = propsRef.current.chapters.filter((c) => c.kind !== 'transit' && c.anchor);
      list.forEach((c) => {
        const region = REGIONS[c.region] || { accent: '#c2693a' };
        const wrap = document.createElement('div');
        wrap.className = 'eq-pin-wrap';
        wrap._anchor = c.anchor;
        wrap._id = c.id;
        wrap.innerHTML = `<div class="map-pin" data-chapter="${c.id}">`
          + `<div class="map-pin-num" style="--pin-c: ${region.accent};">${c.num == null ? '' : c.num}</div>`
          + `<div class="map-pin-label">${c.title}</div></div>`;
        wrap.querySelector('.map-pin').addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelectChapter) onSelectChapter(c.id);
        });
        s.pinsEl.appendChild(wrap);
      });
      drawRoute();
      refresh(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapKey]);

    // ── selection: places layer, popup, active states, framing ────────────
    React.useEffect(() => {
      const s = st.current; if (!s || !s.world) return;
      const { selectedId, selectedPlaceIdx, onSelectPlace, chapters } = propsRef.current;
      // Active pin
      [...s.pinsEl.children].forEach((el) => {
        const pin = el.querySelector('.map-pin');
        if (pin) pin.classList.toggle('is-active', el._id === selectedId);
      });
      // Remove old place markers
      [...s.pinsEl.querySelectorAll('.eq-place-wrap')].forEach((el) => el.remove());
      s.popupEl.style.display = 'none';
      s.popupEl._anchor = null;

      if (!selectedId) return;
      const ch = chapters.find((c) => c.id === selectedId);
      if (!ch) return;
      const region = REGIONS[ch.region] || { accent: '#c2693a' };
      const coords = [];
      ch.places.forEach((p, i) => {
        if (!p.coords) return;
        coords.push(p.coords);
        const wrap = document.createElement('div');
        wrap.className = 'eq-pin-wrap eq-place-wrap';
        wrap._anchor = p.coords;
        wrap.innerHTML = `<div class="map-place${i === selectedPlaceIdx ? ' is-active' : ''}">`
          + `<div class="map-place-dot" style="--pin-c: ${region.accent}"></div>`
          + `<div class="map-place-label">${i + 1}. ${p.name}</div></div>`;
        wrap.querySelector('.map-place').addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelectPlace) onSelectPlace(i);
        });
        s.pinsEl.appendChild(wrap);
      });

      // Popup for the selected place
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

      // Frame the chapter's places (offset left when the detail panel is open)
      const fc = {
        type: 'FeatureCollection',
        features: coords.map((a) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: ll(a) } })),
      };
      const doFit = () => {
        if (!st.current) return;
        const bb = st.current.path.bounds(fc.features.length ? fc : routeFC(chapters));
        const pad = 40;
        const right = st.current.w > 1000 ? st.current.w - 460 : st.current.w - pad;
        const t = fitTransform(bb, [[pad, pad], [Math.max(pad + 50, right), st.current.h - pad]], 10);
        st.current.userMoved = false;
        st.current.svg.transition().duration(750).call(st.current.zoom.transform, t);
      };
      setTimeout(doFit, 50);
      setTimeout(doFit, 350);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, selectedPlaceIdx, chapters]);

    // ── external "focus world" trigger ────────────────────────────────────
    React.useEffect(() => {
      const s = st.current; if (!s || !s.world) return;
      if (focusKey === 'world') {
        const { bbox, extent } = fullRouteBox(true);
        flyTo(bbox, extent, 8, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusKey]);

    function refresh(animate) {
      const s = st.current; if (!s || !s.world) return;
      const { selectedId } = propsRef.current;
      if (selectedId) return; // selection effect owns the framing
      const { bbox, extent } = fullRouteBox(true);
      flyTo(bbox, extent, 8, !animate);
    }

    return <div ref={ref} className="map-container" style={{ width: '100%', height: '100%' }} />;
  }

  window.MapView = MapView;
})();
