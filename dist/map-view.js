"use strict";

// Leaflet map view. Reads chapters + place coords from the store so it
// re-renders when the user adds/removes/edits.

(function () {
  const {
    REGIONS
  } = window.TRIP;
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

    // Build map once
    React.useEffect(() => {
      if (mapRef.current) return;
      const L = window.L;
      const map = L.map(ref.current, {
        center: [25, 105],
        zoom: 4,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
        scrollWheelZoom: true,
        worldCopyJump: true,
        attributionControl: false,
        fadeAnimation: false
      });
      mapRef.current = map;
      window._map = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: ''
      }).addTo(map);
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);
      L.control.attribution({
        position: 'bottomleft',
        prefix: false
      }).addAttribution('© OpenStreetMap · CARTO').addTo(map);
      const onResize = () => map.invalidateSize();
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
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

      // Route polyline
      const routePoints = ROUTE_CHAPTERS.map(c => c.anchor).filter(Boolean);
      if (routePoints.length > 1) {
        const route = L.polyline(routePoints, {
          color: '#c2693a',
          weight: 1.8,
          opacity: 0.55,
          dashArray: '4, 6',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        layersRef.current.route = route;
      }

      // Chapter pins
      ROUTE_CHAPTERS.forEach(c => {
        const region = REGIONS[c.region] || {
          accent: '#c2693a'
        };
        const num = c.kind === 'chapter' ? c.num == null ? '' : c.num.toString() : '·';
        const html = `
          <div class="map-pin" data-chapter="${c.id}">
            <div class="map-pin-num" style="--pin-c: ${region.accent};">${num}</div>
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
          marker: m
        });
      });

      // Apply active state to the pin matching selectedId
      layersRef.current.chapters.forEach(({
        id,
        marker
      }) => {
        const el = marker.getElement();
        if (!el) return;
        const pin = el.querySelector('.map-pin');
        if (pin) pin.classList.toggle('is-active', id === selectedIdRef.current);
      });

      // If no chapter selected, do an initial fit so new chapters get
      // included in the framing.
      if (!selectedIdRef.current && routePoints.length) {
        setTimeout(() => {
          if (selectedIdRef.current) return;
          map.invalidateSize();
          map.fitBounds(routePoints, {
            paddingTopLeft: [230, 60],
            paddingBottomRight: [40, 40],
            animate: false
          });
        }, 100);
      }
      // Deps: chapter ids + anchors (any add/remove/anchor-edit re-runs)
    }, [chapters.map(c => c.id + ':' + (c.anchor || []).join(',')).join('|')]);

    // Reflect selected chapter — swap places, frame view, highlight pin
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      const L = window.L;
      layersRef.current.chapters.forEach(({
        id,
        marker
      }) => {
        const el = marker.getElement();
        if (!el) return;
        const pin = el.querySelector('.map-pin');
        if (pin) pin.classList.toggle('is-active', id === selectedId);
      });
      layersRef.current.places.forEach(m => m.remove());
      layersRef.current.places = [];
      if (!selectedId) return;
      const ch = chapters.find(c => c.id === selectedId);
      if (!ch) return;
      const placeCoords = [];
      ch.places.forEach((p, i) => {
        if (!p.coords) return;
        placeCoords.push(p.coords);
        const region = REGIONS[ch.region] || {
          accent: '#c2693a'
        };
        const isActive = i === selectedPlaceIdx;
        const html = `
          <div class="map-place ${isActive ? 'is-active' : ''}" data-idx="${i}">
            <div class="map-place-dot" style="--pin-c: ${region.accent}"></div>
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
          map.fitBounds(placeCoords, {
            padding: [40, 40],
            maxZoom: 9,
            animate: false
          });
        } else if (placeCoords.length === 1) {
          map.setView(placeCoords[0], 8, {
            animate: false
          });
        } else if (ch.anchor) {
          map.setView(ch.anchor, 7, {
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
        const pts = ROUTE_CHAPTERS.map(c => c.anchor).filter(Boolean);
        mapRef.current.invalidateSize();
        mapRef.current.fitBounds(pts, {
          paddingTopLeft: [230, 60],
          paddingBottomRight: [40, 40],
          animate: false
        });
      }
    }, [focusKey]);
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