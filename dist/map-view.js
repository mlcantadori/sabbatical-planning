"use strict";

// Leaflet map view. Reads chapters + place coords from the store so it
// re-renders when the user adds/removes/edits.

(function () {
  const {
    chapterColor
  } = window.TRIP;

  // Great-circle interpolation between two [lat,lng] points — the actual
  // shortest path a flight follows over the sphere, not an arbitrary bulge.
  function greatCircleSegment(p1, p2, segments = 48) {
    const toRad = d => d * Math.PI / 180,
      toDeg = r => r * 180 / Math.PI;
    const lat1 = toRad(p1[0]),
      lng1 = toRad(p1[1]);
    const lat2 = toRad(p2[0]),
      lng2 = toRad(p2[1]);
    const d = 2 * Math.asin(Math.sqrt(Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2));
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
  function curvedRoute(points) {
    const full = [];
    for (let i = 0; i < points.length - 1; i++) {
      const seg = greatCircleSegment(points[i], points[i + 1]);
      full.push(...(i === 0 ? seg : seg.slice(1)));
    }
    return full;
  }
  function MapView({
    selectedId,
    selectedPlaceIdx,
    onSelectChapter,
    onSelectPlace,
    focusKey
  }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const ROUTE_CHAPTERS = chapters.filter(c => c.kind !== 'transit' && c.anchor);
    const ref = React.useRef(null);
    const mapRef = React.useRef(null);
    const layersRef = React.useRef({
      chapters: [],
      places: [],
      route: null
    });
    const selectedIdRef = React.useRef(selectedId);
    React.useEffect(() => {
      selectedIdRef.current = selectedId;
    }, [selectedId]);

    // Ordered city stops across the whole itinerary: every place with
    // coords, in chapter/place order. Chapters with no place coords fall
    // back to their anchor so they still appear on the route.
    const getStops = () => {
      const stops = [];
      ROUTE_CHAPTERS.forEach(c => {
        const withCoords = (c.places || []).map((p, i) => ({
          ch: c,
          place: p,
          idx: i
        })).filter(s => s.place.coords);
        if (withCoords.length) stops.push(...withCoords);else if (c.anchor) stops.push({
          ch: c,
          place: null,
          idx: null
        });
      });
      return stops;
    };
    const stopCoords = s => s.place ? s.place.coords : s.ch.anchor;

    // Frame all city stops edge-to-edge (unconditional).
    const fitWorld = () => {
      const map = mapRef.current;
      if (!map || selectedIdRef.current) return;
      const pts = getStops().map(stopCoords).filter(Boolean);
      if (pts.length < 2) return;
      map.invalidateSize();
      map.fitBounds(pts, {
        padding: [24, 24],
        animate: false
      });
    };

    // Never rests more zoomed out than the fit requires (repairs a
    // premature fit computed while the layout/fonts were still
    // settling); never touches a manual zoom-in.
    const ensureWorldFit = () => {
      const map = mapRef.current;
      if (!map || selectedIdRef.current) return;
      const pts = getStops().map(stopCoords).filter(Boolean);
      if (pts.length < 2) return;
      map.invalidateSize();
      const need = map.getBoundsZoom(pts, false, [24, 24]);
      if (map.getZoom() < need) {
        map.fitBounds(pts, {
          padding: [24, 24],
          animate: false
        });
      }
    };

    // Build map once
    React.useEffect(() => {
      if (mapRef.current || !window.L) return;
      const L = window.L;
      const map = L.map(ref.current, {
        center: [25, 105],
        zoom: 4,
        minZoom: 2,
        maxZoom: 19,
        zoomControl: false,
        scrollWheelZoom: true,
        worldCopyJump: true,
        attributionControl: false,
        fadeAnimation: false
      });
      mapRef.current = map;
      window._map = map;

      // Esri World Imagery (satellite) + reference overlay for city names,
      // boundaries and water labels. Note the {z}/{y}/{x} order.
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: ''
      }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '',
        opacity: 0.7,
        zIndex: 3
      }).addTo(map);
      // Roads overlay only at country level and deeper (z7+) — at world
      // view it's visual noise. Toggled on zoomend (fitBounds/setView
      // fire it too, so programmatic fits stay in sync).
      const transport = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '',
        opacity: 0.5,
        zIndex: 2,
        className: 'transport-tiles'
      });
      const TRANSPORT_MIN_ZOOM = 7;
      const syncTransport = () => {
        const show = map.getZoom() >= TRANSPORT_MIN_ZOOM;
        const has = map.hasLayer(transport);
        if (show && !has) transport.addTo(map);else if (!show && has) map.removeLayer(transport);
      };
      map.on('zoomend', syncTransport);
      syncTransport();
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);
      L.control.attribution({
        position: 'bottomleft',
        prefix: false
      }).addAttribution('Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community').addTo(map);
      const onResize = () => {
        if (mapRef.current) mapRef.current.invalidateSize();
        clearTimeout(onResize._t);
        onResize._t = setTimeout(() => ensureWorldFit(), 250);
      };
      window.addEventListener('resize', onResize);
      // Late layout shifts (webfonts, images) don't fire resize — refit
      // once they're settled so the initial frame isn't stuck too wide.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ensureWorldFit());
      }
      return () => {
        window.removeEventListener('resize', onResize);
        clearTimeout(onResize._t);
        map.remove();
        mapRef.current = null;
      };
    }, []);

    // Rebuild chapter markers + polyline whenever the chapter list changes
    // (add/remove/edit). Cheap enough: drops all markers, re-adds them.
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const L = window.L;

      // Clear
      layersRef.current.chapters.forEach(m => m.marker.remove());
      layersRef.current.chapters = [];
      if (layersRef.current.route) {
        layersRef.current.route.remove();
        layersRef.current.route = null;
      }

      // Route polyline through the city stops in travel order
      const stops = getStops();
      const routePoints = stops.map(stopCoords).filter(Boolean);
      if (routePoints.length > 1) {
        const route = L.polyline(curvedRoute(routePoints), {
          className: 'route-line',
          color: '#8a8272',
          weight: 1.8,
          opacity: 0.9,
          dashArray: '4, 6',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        layersRef.current.route = route;
      }

      // City dots (one per place); anchor fallback pins for chapters
      // without place coords. Clicking a dot selects its chapter + place.
      stops.forEach(s => {
        const c = s.ch;
        const accent = chapterColor(c);
        if (s.place) {
          const p = s.place,
            i = s.idx;
          const html = `
            <div class="map-place" data-chapter="${c.id}" data-idx="${i}">
              <div class="map-place-dot" style="--pin-c: ${accent}"></div>
              <div class="map-place-label">${i + 1}. ${p.name}</div>
            </div>`;
          const icon = L.divIcon({
            html,
            className: 'map-place-wrap',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          const m = L.marker(p.coords, {
            icon,
            riseOnHover: true
          });
          m.on('click', () => {
            if (onSelectChapter) onSelectChapter(c.id);
            if (onSelectPlace) onSelectPlace(i);
          });
          m.addTo(map);
          layersRef.current.chapters.push({
            id: c.id,
            idx: i,
            marker: m
          });
        } else {
          const num = c.num == null ? '' : c.num.toString();
          const html = `
            <div class="map-pin" data-chapter="${c.id}">
              <div class="map-pin-num" style="--pin-c: ${accent};">${num}</div>
              <div class="map-pin-label">${c.title}</div>
            </div>`;
          const icon = L.divIcon({
            html,
            className: 'map-pin-wrap',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          const m = L.marker(c.anchor, {
            icon,
            riseOnHover: true
          });
          m.on('click', () => onSelectChapter && onSelectChapter(c.id));
          m.addTo(map);
          layersRef.current.chapters.push({
            id: c.id,
            idx: null,
            marker: m
          });
        }
      });

      // Apply active state to the pin matching selectedId
      layersRef.current.chapters.forEach(({
        id,
        marker
      }) => {
        const el = marker.getElement();
        if (!el) return;
        const pin = el.querySelector('.map-pin, .map-place');
        if (pin) pin.classList.toggle('is-active', id === selectedIdRef.current);
      });

      // If no chapter selected, do an initial fit so new chapters get
      // included in the framing. The map lives in its own grid column
      // (no overlaid sidebar), so small symmetric padding frames the
      // dots tightly. ensureWorldFit also repairs it after late layout
      // shifts and window resizes (see the build-once effect above).
      if (!selectedIdRef.current && routePoints.length) {
        setTimeout(() => fitWorld(), 100);
      }
      // Deps: chapter ids + anchors + place coords (any add/remove/edit re-runs)
    }, [chapters.map(c => c.id + ':' + (c.anchor || []).join(',') + ':' + (c.places || []).map(p => (p.coords || []).join(',')).join(';')).join('|')]);

    // Reflect selected chapter — swap places, frame view, highlight pin
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const L = window.L;

      // Hide whole-route dots of the selected chapter (re-rendered below
      // with popups) to avoid duplicates; restore everything on deselect.
      layersRef.current.chapters.forEach(({
        id,
        marker
      }) => {
        if (id === selectedId) {
          if (map.hasLayer(marker)) marker.remove();
        } else {
          if (!map.hasLayer(marker)) marker.addTo(map);
          const el = marker.getElement();
          const pin = el && el.querySelector('.map-pin, .map-place');
          if (pin) pin.classList.toggle('is-active', false);
        }
      });
      layersRef.current.places.forEach(m => m.remove());
      layersRef.current.places = [];

      // No chapter selected (e.g. detail panel just closed): the map column
      // widens, so force Leaflet to re-measure or tiles won't fill the freed
      // area and a grey box remains where the panel was.
      if (!selectedId) {
        setTimeout(() => {
          if (mapRef.current) mapRef.current.invalidateSize();
        }, 50);
        setTimeout(() => {
          if (mapRef.current) mapRef.current.invalidateSize();
        }, 350);
        return;
      }
      const ch = chapters.find(c => c.id === selectedId);
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
        const icon = L.divIcon({
          html,
          className: 'map-place-wrap',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        const m = L.marker(p.coords, {
          icon,
          riseOnHover: true,
          zIndexOffset: isActive ? 1000 : 0
        });
        m.on('click', () => onSelectPlace && onSelectPlace(i));
        const popupHtml = `
          <div class="map-popup">
            <div class="map-popup-num">${i + 1}</div>
            <div>
              <div class="map-popup-name">${p.name}</div>
              <div class="map-popup-sub">${p.days} day${p.days > 1 ? 's' : ''}</div>
              <a class="map-popup-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query)}" target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a>
            </div>
          </div>`;
        m.bindPopup(popupHtml, {
          closeButton: false,
          offset: [0, -4],
          className: 'map-popup-wrap'
        });
        m.addTo(map);
        layersRef.current.places.push(m);
      });
      const doFit = () => {
        map.invalidateSize();
        if (placeCoords.length > 1) {
          // maxZoom 14 lets tightly-clustered places frame at
          // neighbourhood/street level instead of capping at region level.
          map.fitBounds(placeCoords, {
            padding: [40, 40],
            maxZoom: 14,
            animate: false
          });
        } else if (placeCoords.length === 1) {
          map.setView(placeCoords[0], 12, {
            animate: false
          });
        } else if (ch.anchor) {
          map.setView(ch.anchor, 9, {
            animate: false
          });
        }
      };
      setTimeout(doFit, 50);
      setTimeout(doFit, 350);
    }, [selectedId, selectedPlaceIdx, chapters]);

    // External "focus world" trigger
    React.useEffect(() => {
      if (focusKey === 'world' && mapRef.current) {
        const pts = getStops().map(stopCoords).filter(Boolean);
        mapRef.current.invalidateSize();
        mapRef.current.fitBounds(pts, {
          padding: [24, 24],
          animate: false
        });
      }
    }, [focusKey]);

    // CDN guard — render a message instead of crashing the whole app when
    // the Leaflet script failed to load. (Placed after all hooks.)
    if (!window.L) {
      return /*#__PURE__*/React.createElement("div", {
        className: "map-container"
      }, /*#__PURE__*/React.createElement("div", {
        className: "map-fallback"
      }, /*#__PURE__*/React.createElement("div", {
        className: "kicker"
      }, "2D map unavailable"), /*#__PURE__*/React.createElement("p", null, "Leaflet failed to load. Check your connection and retry.")));
    }
    return /*#__PURE__*/React.createElement("div", {
      ref: ref,
      className: "map-container",
      style: {
        width: '100%',
        height: '100%'
      }
    });
  }
  window.MapView = MapView;
})();