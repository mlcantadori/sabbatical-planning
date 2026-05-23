"use strict";

// Chapter list (left rail / mobile list), detail panel (right slideover /
// mobile full-screen), binder overlay, and inline editing UI.

(function () {
  const {
    totalDays,
    REGIONS,
    helpers,
    bookings,
    diving,
    budget,
    packing
  } = window.TRIP;
  const {
    fmt,
    dayRange,
    dayCounter
  } = helpers;

  // ══════════════════════════════════════════════════════════════════════
  // CHAPTER LIST — left rail (desktop) or main list view (mobile).
  // ══════════════════════════════════════════════════════════════════════
  function ChapterList({
    selectedId,
    onSelect,
    editing,
    onToggleEdit
  }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const [editChapter, setEditChapter] = React.useState(null);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "chapter-list"
    }, /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-head-row"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "The Arc"), /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-meta"
    }, chapters.length, " entries \xB7 ", store.getTotalDays(), " days")), /*#__PURE__*/React.createElement("button", {
      className: `pill-btn ${editing ? 'is-active' : ''}`,
      onClick: onToggleEdit,
      title: "Toggle edit mode"
    }, editing ? 'Done' : 'Edit'))), /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-body"
    }, chapters.map(c => /*#__PURE__*/React.createElement(ChapterRow, {
      key: c.id,
      ch: c,
      isActive: c.id === selectedId,
      editing: editing,
      onSelect: () => onSelect(c.id),
      onRename: t => store.updateChapter(c.id, {
        title: t
      }),
      onEdit: () => setEditChapter(c.id),
      onAddBelow: () => {
        const newId = store.addChapter(c.id);
        setEditChapter(newId);
      },
      onDelete: () => {
        if (confirm(`Delete "${c.title}"?`)) {
          store.removeChapter(c.id);
          if (selectedId === c.id) onSelect(null);
        }
      }
    })), editing && /*#__PURE__*/React.createElement("button", {
      className: "add-row",
      onClick: () => {
        const lastId = chapters.at(-1)?.id;
        const newId = store.addChapter(lastId);
        setEditChapter(newId);
      }
    }, /*#__PURE__*/React.createElement(window.Icon.plus, {
      size: 12
    }), " Add chapter"))), editChapter && /*#__PURE__*/React.createElement(ChapterEditModal, {
      chapterId: editChapter,
      onClose: () => setEditChapter(null)
    }));
  }
  function ChapterRow({
    ch,
    isActive,
    editing,
    onSelect,
    onRename,
    onEdit,
    onAddBelow,
    onDelete
  }) {
    const region = REGIONS[ch.region] || {
      accent: '#c2693a',
      name: ''
    };
    return /*#__PURE__*/React.createElement("div", {
      className: `chapter-row ${isActive ? 'is-active' : ''} ${editing ? 'is-editing' : ''}`,
      onClick: onSelect
    }, /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-marker",
      style: {
        background: isActive ? region.accent : 'transparent'
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-num"
    }, ch.kind === 'chapter' ? (ch.num || '').toString().padStart(2, '0') : '··'), /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-body"
    }, editing ? /*#__PURE__*/React.createElement(window.Editable, {
      className: "chapter-row-title",
      value: ch.title,
      onCommit: onRename,
      placeholder: "Chapter title"
    }) : /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-title"
    }, ch.title), /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-dates"
    }, /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-region-dot",
      style: {
        background: region.accent
      }
    }), fmt(ch.start), " \u2013 ", fmt(ch.end), " \xB7 ", ch.days, "d")), editing && /*#__PURE__*/React.createElement(window.ActionMenu, {
      className: "chapter-row-menu",
      items: [{
        label: 'Edit details…',
        onClick: onEdit
      }, {
        label: 'Add chapter below',
        onClick: onAddBelow
      }, {
        label: 'Delete',
        onClick: onDelete,
        danger: true
      }]
    }));
  }

  // ══════════════════════════════════════════════════════════════════════
  // DETAIL PANEL — chapter detail with editable places + attractions.
  // ══════════════════════════════════════════════════════════════════════
  function DetailPanel({
    chapterId,
    onClose,
    onSelectPlace,
    selectedPlaceIdx,
    editing
  }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);
    const [view, setView] = React.useState('full'); // overview | full
    const [note, setNote] = React.useState('');
    const [editChapter, setEditChapter] = React.useState(false);
    const [editPlace, setEditPlace] = React.useState(null); // { placeIdx }

    React.useEffect(() => {
      if (!chapterId) return;
      try {
        setNote(localStorage.getItem('note:' + chapterId) || '');
      } catch {}
    }, [chapterId]);
    React.useEffect(() => {
      if (!chapterId) return;
      const t = setTimeout(() => {
        try {
          localStorage.setItem('note:' + chapterId, note);
        } catch {}
      }, 400);
      return () => clearTimeout(t);
    }, [note, chapterId]);
    if (!ch) return null;
    const region = REGIONS[ch.region] || {
      accent: '#c2693a',
      name: ''
    };
    const today = dayCounter(ch.start);
    const todayEnd = dayCounter(ch.end);
    const isFull = view === 'full';
    return /*#__PURE__*/React.createElement("div", {
      className: "detail-panel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-head-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "detail-pill",
      style: {
        background: region.accent,
        color: '#fff'
      }
    }, ch.kind === 'chapter' ? `Chapter ${(ch.num || '').toString().padStart(2, '0')}` : ch.kind.toUpperCase()), /*#__PURE__*/React.createElement("span", {
      className: "kicker"
    }, region.name, " \xB7 ", ch.country, " ", ch.flag)), /*#__PURE__*/React.createElement("div", {
      className: "detail-head-actions"
    }, editing && /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: () => setEditChapter(true),
      title: "Edit chapter"
    }, /*#__PURE__*/React.createElement(window.Icon.edit, {
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: onClose,
      title: "Close"
    }, /*#__PURE__*/React.createElement(window.Icon.close, {
      size: 16
    })))), /*#__PURE__*/React.createElement("div", {
      className: "detail-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-hero"
    }, /*#__PURE__*/React.createElement(window.Photo, {
      keyword: ch.photos[0],
      ratio: "auto",
      style: {
        width: '100%',
        height: '100%',
        aspectRatio: 'unset'
      },
      caption: `${ch.country.toUpperCase()} · ${fmt(ch.start)}`
    })), editing ? /*#__PURE__*/React.createElement(window.Editable, {
      as: "h1",
      className: "detail-title",
      value: ch.title,
      onCommit: t => store.updateChapter(ch.id, {
        title: t
      }),
      placeholder: "Chapter title"
    }) : /*#__PURE__*/React.createElement("h1", {
      className: "detail-title"
    }, ch.title), editing ? /*#__PURE__*/React.createElement(window.Editable, {
      as: "div",
      className: "detail-theme",
      value: ch.theme,
      onCommit: t => store.updateChapter(ch.id, {
        theme: t
      }),
      placeholder: "A short theme for this chapter"
    }) : ch.theme && /*#__PURE__*/React.createElement("div", {
      className: "detail-theme"
    }, ch.theme, "."), /*#__PURE__*/React.createElement("div", {
      className: "detail-stats"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Window",
      value: `${fmt(ch.start)} – ${fmt(ch.end)}`,
      sub: `${ch.days} days`
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Day of trip",
      value: `${today.n}–${todayEnd.n}`,
      sub: `of ${totalDays}`
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Weather",
      value: ch.weather?.label || '—',
      sub: ch.weather?.emoji
    })), /*#__PURE__*/React.createElement("div", {
      className: "seg"
    }, [['overview', 'Condensed'], ['full', 'Full detail']].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
      key: k,
      className: view === k ? 'is-active' : '',
      onClick: () => setView(k)
    }, l))), !isFull && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "detail-summary-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "The shape of it"), /*#__PURE__*/React.createElement("div", {
      className: "detail-summary-text"
    }, ch.tldr || ch.places.map(p => p.name).join(' · '))), ch.intro && /*#__PURE__*/React.createElement("div", {
      className: "detail-intro"
    }, ch.intro)), isFull && /*#__PURE__*/React.createElement(React.Fragment, null, ch.intro && (editing ? /*#__PURE__*/React.createElement(window.Editable, {
      as: "div",
      className: "detail-intro",
      value: ch.intro,
      onCommit: t => store.updateChapter(ch.id, {
        intro: t
      }),
      placeholder: "A few sentences setting the scene"
    }) : /*#__PURE__*/React.createElement("div", {
      className: "detail-intro"
    }, ch.intro)), editing && !ch.intro && /*#__PURE__*/React.createElement(window.Editable, {
      as: "div",
      className: "detail-intro is-empty",
      value: "",
      onCommit: t => store.updateChapter(ch.id, {
        intro: t
      }),
      placeholder: "Add a few sentences setting the scene\u2026"
    }), ch.photos.length > 1 && /*#__PURE__*/React.createElement("div", {
      className: "photo-strip"
    }, ch.photos.slice(1, 4).map((k, i) => /*#__PURE__*/React.createElement(window.Photo, {
      key: i,
      keyword: k,
      ratio: "3/4"
    }))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "01",
      title: `Itinerary · ${ch.places.length} stop${ch.places.length === 1 ? '' : 's'}`
    }), ch.places.map((p, i) => /*#__PURE__*/React.createElement(PlaceRow, {
      key: i,
      chapterId: ch.id,
      place: p,
      idx: i,
      offsetDays: ch.places.slice(0, i).reduce((s, x) => s + x.days, 0),
      region: region,
      isActive: selectedPlaceIdx === i,
      editing: editing,
      onSelect: () => onSelectPlace(i),
      onEdit: () => setEditPlace(i),
      onAddBelow: async () => {
        const name = prompt('Name of new stop?');
        if (!name) return;
        let coords = null;
        try {
          coords = await window.geocode(name + ' ' + ch.country);
        } catch {}
        store.addPlace(ch.id, i, {
          name,
          query: name,
          coords: coords || ch.anchor
        });
      },
      onDelete: () => {
        if (confirm(`Delete "${p.name}"?`)) store.removePlace(ch.id, i);
      }
    })), editing && /*#__PURE__*/React.createElement("button", {
      className: "add-row place-add-row",
      onClick: async () => {
        const name = prompt('Name of new stop?');
        if (!name) return;
        let coords = null;
        try {
          coords = await window.geocode(name + ' ' + ch.country);
        } catch {}
        store.addPlace(ch.id, null, {
          name,
          query: name,
          coords: coords || ch.anchor
        });
      }
    }, /*#__PURE__*/React.createElement(window.Icon.plus, {
      size: 12
    }), " Add stop"), ch.booking && ch.booking.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
      num: "02",
      title: "Book in advance",
      small: true
    }), /*#__PURE__*/React.createElement("ul", {
      className: "alert-list"
    }, ch.booking.map((b, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, b)))), ch.diving && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
      num: "03",
      title: "Diving",
      small: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "diving-inline"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, ch.diving.sites), " sites \xB7 ", ch.diving.type), /*#__PURE__*/React.createElement("div", {
      className: "muted"
    }, ch.diving.operators))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "04",
      title: "Notes & journal",
      small: true
    }), /*#__PURE__*/React.createElement("textarea", {
      className: "journal-input",
      value: note,
      onChange: e => setNote(e.target.value),
      placeholder: `Notes for ${ch.title.toLowerCase()} — what to remember, who to message…`
    }))), editChapter && /*#__PURE__*/React.createElement(ChapterEditModal, {
      chapterId: ch.id,
      onClose: () => setEditChapter(false)
    }), editPlace !== null && /*#__PURE__*/React.createElement(PlaceEditModal, {
      chapterId: ch.id,
      placeIdx: editPlace,
      onClose: () => setEditPlace(null)
    }));
  }
  function Stat({
    label,
    value,
    sub
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, label), /*#__PURE__*/React.createElement("div", {
      className: "stat-value"
    }, value), sub && /*#__PURE__*/React.createElement("div", {
      className: "stat-sub"
    }, sub));
  }
  function SectionHead({
    num,
    title,
    small
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: `section-head ${small ? 'is-small' : ''}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-head-num"
    }, "\xA7", num), /*#__PURE__*/React.createElement("span", {
      className: "section-head-title"
    }, title));
  }
  function PlaceRow({
    chapterId,
    place,
    idx,
    offsetDays,
    region,
    isActive,
    editing,
    onSelect,
    onEdit,
    onAddBelow,
    onDelete
  }) {
    const store = window.useStore();
    const coords = place.coords;
    return /*#__PURE__*/React.createElement("div", {
      className: `place-row ${isActive ? 'is-active' : ''} ${editing ? 'is-editing' : ''}`,
      onClick: onSelect
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-day"
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-day-num"
    }, offsetDays + 1, /*#__PURE__*/React.createElement("span", {
      className: "place-row-day-dash"
    }, "\u2013", offsetDays + place.days)), /*#__PURE__*/React.createElement("span", {
      className: "place-row-day-label"
    }, place.days, "d")), /*#__PURE__*/React.createElement("span", {
      className: "place-row-body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-title"
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-idx"
    }, (idx + 1).toString().padStart(2, '0')), editing ? /*#__PURE__*/React.createElement(window.Editable, {
      value: place.name,
      onCommit: v => store.updatePlace(chapterId, idx, {
        name: v,
        query: v
      }),
      placeholder: "Place name"
    }) : /*#__PURE__*/React.createElement("span", null, place.name)), /*#__PURE__*/React.createElement("ul", {
      className: "place-row-list"
    }, place.highlights.map((h, j) => /*#__PURE__*/React.createElement("li", {
      key: j,
      style: {
        '--bullet': region.accent
      }
    }, editing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(window.Editable, {
      value: h,
      onCommit: v => {
        if (!v) store.removeHighlight(chapterId, idx, j);else store.updateHighlight(chapterId, idx, j, v);
      },
      placeholder: "Attraction"
    }), /*#__PURE__*/React.createElement("button", {
      className: "hl-remove",
      onClick: e => {
        e.stopPropagation();
        store.removeHighlight(chapterId, idx, j);
      },
      title: "Remove"
    }, "\xD7")) : h)), editing && /*#__PURE__*/React.createElement("li", {
      className: "hl-add"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        store.addHighlight(chapterId, idx, '');
      }
    }, /*#__PURE__*/React.createElement(window.Icon.plus, {
      size: 10
    }), " Add attraction")))), /*#__PURE__*/React.createElement("div", {
      className: "place-row-actions"
    }, coords && /*#__PURE__*/React.createElement("button", {
      className: "place-row-map",
      onClick: e => {
        e.stopPropagation();
        window.openMaps(place.query);
      },
      title: "Open in Google Maps"
    }, /*#__PURE__*/React.createElement(window.Icon.external, {
      size: 11
    })), editing && /*#__PURE__*/React.createElement(window.ActionMenu, {
      items: [{
        label: 'Edit details…',
        onClick: onEdit
      }, {
        label: 'Add stop below',
        onClick: onAddBelow
      }, {
        label: 'Delete',
        onClick: onDelete,
        danger: true
      }]
    })));
  }

  // ══════════════════════════════════════════════════════════════════════
  // EDIT MODALS
  // ══════════════════════════════════════════════════════════════════════
  function Modal({
    title,
    onClose,
    children,
    wide
  }) {
    React.useEffect(() => {
      const k = e => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', k);
      return () => document.removeEventListener('keydown', k);
    }, [onClose]);
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: `modal ${wide ? 'is-wide' : ''}`,
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-title"
    }, title), /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: onClose
    }, /*#__PURE__*/React.createElement(window.Icon.close, {
      size: 14
    }))), /*#__PURE__*/React.createElement("div", {
      className: "modal-body"
    }, children)));
  }
  function Field({
    label,
    children,
    hint
  }) {
    return /*#__PURE__*/React.createElement("label", {
      className: "field"
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label"
    }, label), children, hint && /*#__PURE__*/React.createElement("span", {
      className: "field-hint"
    }, hint));
  }
  function ChapterEditModal({
    chapterId,
    onClose
  }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);
    const [form, setForm] = React.useState({
      title: ch.title,
      country: ch.country,
      flag: ch.flag,
      region: ch.region,
      start: ch.start,
      end: ch.end,
      theme: ch.theme || '',
      intro: ch.intro || '',
      anchor: ch.anchor ? ch.anchor.join(', ') : '',
      weatherLabel: ch.weather?.label || '',
      weatherEmoji: ch.weather?.emoji || ''
    });
    const update = (k, v) => setForm(f => ({
      ...f,
      [k]: v
    }));

    // Consequence preview — recomputed whenever dates change.
    const datesChanged = form.start !== ch.start || form.end !== ch.end;
    const consequences = React.useMemo(() => {
      if (!datesChanged) return null;
      return store.getConsequences(chapterId, {
        start: form.start,
        end: form.end
      });
    }, [form.start, form.end, datesChanged]);
    const save = () => {
      const [latS, lngS] = form.anchor.split(',').map(x => x.trim());
      const lat = parseFloat(latS),
        lng = parseFloat(lngS);
      store.updateChapter(chapterId, {
        title: form.title,
        country: form.country,
        flag: form.flag,
        region: form.region,
        start: form.start,
        end: form.end,
        theme: form.theme,
        intro: form.intro,
        anchor: !isNaN(lat) && !isNaN(lng) ? [lat, lng] : ch.anchor,
        weather: {
          ...ch.weather,
          label: form.weatherLabel,
          emoji: form.weatherEmoji
        }
      });
      onClose();
    };
    const geocodeAnchor = async () => {
      const q = form.title + ' ' + form.country;
      const res = await window.geocode(q);
      if (res) update('anchor', res.join(', '));else alert('Could not find a location for "' + q + '"');
    };
    return /*#__PURE__*/React.createElement(Modal, {
      title: "Edit chapter",
      onClose: onClose,
      wide: true
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Title"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.title,
      onChange: e => update('title', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Country"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.country,
      onChange: e => update('country', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Flag (emoji)"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.flag,
      onChange: e => update('flag', e.target.value),
      maxLength: 4
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Region"
    }, /*#__PURE__*/React.createElement("select", {
      value: form.region,
      onChange: e => update('region', e.target.value)
    }, Object.entries(REGIONS).map(([k, r]) => /*#__PURE__*/React.createElement("option", {
      key: k,
      value: k
    }, r.name)))), /*#__PURE__*/React.createElement(Field, {
      label: "Start date"
    }, /*#__PURE__*/React.createElement("input", {
      type: "date",
      value: form.start,
      onChange: e => update('start', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "End date"
    }, /*#__PURE__*/React.createElement("input", {
      type: "date",
      value: form.end,
      onChange: e => update('end', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Anchor (lat, lng)",
      hint: "Coordinates of the chapter's pin on the map"
    }, /*#__PURE__*/React.createElement("div", {
      className: "field-row"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.anchor,
      onChange: e => update('anchor', e.target.value),
      placeholder: "e.g. 41.0082, 28.9784"
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-secondary",
      onClick: geocodeAnchor
    }, "Find"))), /*#__PURE__*/React.createElement(Field, {
      label: "Weather summary"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.weatherLabel,
      onChange: e => update('weatherLabel', e.target.value),
      placeholder: "e.g. Late summer, 28\xB0/16\xB0"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Weather emoji"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.weatherEmoji,
      onChange: e => update('weatherEmoji', e.target.value),
      maxLength: 4
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Theme",
      hint: "Italic deck under the title"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.theme,
      onChange: e => update('theme', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Intro paragraph"
    }, /*#__PURE__*/React.createElement("textarea", {
      rows: 4,
      value: form.intro,
      onChange: e => update('intro', e.target.value)
    }))), consequences && /*#__PURE__*/React.createElement(ConsequencePreview, {
      c: consequences
    }), /*#__PURE__*/React.createElement("div", {
      className: "modal-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btn-primary",
      onClick: save
    }, "Save changes")));
  }
  function ConsequencePreview({
    c
  }) {
    const sign = n => n > 0 ? `+${n}` : `${n}`;
    const hasIssues = c.seasonWarnings.length > 0 || c.gapConflicts.length > 0;
    return /*#__PURE__*/React.createElement("div", {
      className: `consequence-preview ${hasIssues ? 'has-issues' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "consequence-title"
    }, hasIssues ? '⚠ Consequence preview' : '✓ Consequence preview'), /*#__PURE__*/React.createElement("ul", {
      className: "consequence-list"
    }, c.daysDelta !== 0 && /*#__PURE__*/React.createElement("li", null, "This chapter changes by ", /*#__PURE__*/React.createElement("strong", null, sign(c.daysDelta), " days"), ".", c.tripEndDelta !== 0 && ` Trip end shifts by ${sign(c.tripEndDelta)} days.`), c.chainShifts.length > 0 && /*#__PURE__*/React.createElement("li", {
      className: "consequence-chain"
    }, "Subsequent chapters not auto-shifted \u2014\xA0", /*#__PURE__*/React.createElement("strong", null, c.chainShifts.map(s => s.title).join(', ')), "\xA0would each need to shift by ", /*#__PURE__*/React.createElement("strong", null, sign(c.chainShifts[0].delta), " days"), " to stay continuous."), c.gapConflicts.map((g, i) => /*#__PURE__*/React.createElement("li", {
      key: i,
      className: "consequence-warn"
    }, g.type === 'gap' ? `Gap of ${g.gapDays} day${g.gapDays > 1 ? 's' : ''} between ${g.titles[0]} and ${g.titles[1]}.` : `Overlap of ${Math.abs(g.gapDays)} day${Math.abs(g.gapDays) > 1 ? 's' : ''} with ${g.titles[1]}.`)), c.seasonWarnings.map((w, i) => /*#__PURE__*/React.createElement("li", {
      key: i,
      className: "consequence-warn"
    }, w.message)), c.daysDelta === 0 && c.chainShifts.length === 0 && c.gapConflicts.length === 0 && c.seasonWarnings.length === 0 && /*#__PURE__*/React.createElement("li", null, "No date changes detected.")));
  }
  function PlaceEditModal({
    chapterId,
    placeIdx,
    onClose
  }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);
    const p = ch?.places[placeIdx];
    const [form, setForm] = React.useState({
      name: p?.name || '',
      days: p?.days || 1,
      coords: p?.coords ? p.coords.join(', ') : ''
    });
    if (!p) return null;
    const update = (k, v) => setForm(f => ({
      ...f,
      [k]: v
    }));
    const save = () => {
      const [latS, lngS] = form.coords.split(',').map(x => x.trim());
      const lat = parseFloat(latS),
        lng = parseFloat(lngS);
      store.updatePlace(chapterId, placeIdx, {
        name: form.name,
        query: form.name,
        days: parseInt(form.days, 10) || 1,
        coords: !isNaN(lat) && !isNaN(lng) ? [lat, lng] : p.coords
      });
      onClose();
    };
    const find = async () => {
      const res = await window.geocode(form.name + ' ' + ch.country);
      if (res) update('coords', res.join(', '));else alert('Could not find "' + form.name + '"');
    };
    return /*#__PURE__*/React.createElement(Modal, {
      title: "Edit stop",
      onClose: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Name"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.name,
      onChange: e => update('name', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Days"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      value: form.days,
      onChange: e => update('days', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Coordinates (lat, lng)",
      hint: "Pin location on the map"
    }, /*#__PURE__*/React.createElement("div", {
      className: "field-row"
    }, /*#__PURE__*/React.createElement("input", {
      value: form.coords,
      onChange: e => update('coords', e.target.value),
      placeholder: "e.g. 41.0082, 28.9784"
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-secondary",
      onClick: find
    }, "Find")))), /*#__PURE__*/React.createElement("div", {
      className: "modal-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btn-primary",
      onClick: save
    }, "Save")));
  }

  // ══════════════════════════════════════════════════════════════════════
  // BINDER (Bookings / Diving / Budget / Packing / Snapshots)
  // ══════════════════════════════════════════════════════════════════════
  function Binder({
    activeTab,
    onSwitchTab,
    onClose
  }) {
    const tab = activeTab || 'bookings';
    return /*#__PURE__*/React.createElement("div", {
      className: "binder"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-tabs"
    }, [['bookings', 'Bookings'], ['diving', 'Diving log'], ['budget', 'Budget'], ['packing', 'Packing'], ['snapshots', 'Versions']].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
      key: k,
      className: `binder-tab ${tab === k ? 'is-active' : ''}`,
      onClick: () => onSwitchTab(k)
    }, l))), /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: onClose,
      title: "Close binder"
    }, /*#__PURE__*/React.createElement(window.Icon.close, {
      size: 16
    }))), /*#__PURE__*/React.createElement("div", {
      className: "binder-body"
    }, tab === 'bookings' && /*#__PURE__*/React.createElement(BookingsView, null), tab === 'diving' && /*#__PURE__*/React.createElement(DivingView, null), tab === 'budget' && /*#__PURE__*/React.createElement(BudgetView, null), tab === 'packing' && /*#__PURE__*/React.createElement(PackingView, null), tab === 'snapshots' && /*#__PURE__*/React.createElement(SnapshotsView, null)));
  }
  function BookingsView() {
    const [done, setDone] = React.useState(() => {
      try {
        return JSON.parse(localStorage.getItem('bookings-done') || '{}');
      } catch {
        return {};
      }
    });
    const setAndSave = (i, v) => {
      const next = {
        ...done,
        [i]: v
      };
      setDone(next);
      try {
        localStorage.setItem('bookings-done', JSON.stringify(next));
      } catch {}
    };
    const doneCount = bookings.filter((_, i) => done[i]).length;
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "\xA7 Pre-departure"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title"
    }, "Book before you leave Brazil"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Time-sensitive locks. Liveaboard cabins and Sipadan permits don't reappear once they're gone.")), /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-counter"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-counter-big"
    }, doneCount, /*#__PURE__*/React.createElement("span", null, "/", bookings.length)), /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "checked off"))), /*#__PURE__*/React.createElement("div", {
      className: "booking-grid"
    }, bookings.map((b, i) => {
      const isDone = !!done[i];
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: `booking-card ${isDone ? 'is-done' : ''}`
      }, b.critical && !isDone && /*#__PURE__*/React.createElement("div", {
        className: "stamp"
      }, "Critical"), /*#__PURE__*/React.createElement("button", {
        className: `booking-check ${isDone ? 'is-done' : ''}`,
        onClick: () => setAndSave(i, !isDone)
      }, isDone && /*#__PURE__*/React.createElement(window.Icon.check, {
        size: 14
      })), /*#__PURE__*/React.createElement("div", {
        className: "booking-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "booking-task"
      }, b.task), /*#__PURE__*/React.createElement("div", {
        className: "booking-by"
      }, b.by), /*#__PURE__*/React.createElement("div", {
        className: "booking-notes"
      }, b.notes)));
    })));
  }
  function DivingView() {
    const total = diving.reduce((s, d) => s + d.days, 0);
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane diving-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker",
      style: {
        color: '#1c4a5e'
      }
    }, "\xA7 Underwater"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title",
      style: {
        color: '#1c4a5e'
      }
    }, "Diving log"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Six chapters underwater. Two liveaboards, three day-boat windows, one limestone reset.")), /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-counter"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-counter-big",
      style: {
        color: '#1c4a5e'
      }
    }, total, /*#__PURE__*/React.createElement("span", null, "/", totalDays)), /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "days underwater"))), /*#__PURE__*/React.createElement("div", {
      className: "diving-grid"
    }, diving.map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "diving-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "diving-photo"
    }, /*#__PURE__*/React.createElement(window.Photo, {
      keyword: d.where.split('—')[0].trim() + ' underwater',
      ratio: "auto",
      style: {
        width: '100%',
        height: '100%',
        aspectRatio: 'unset'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "diving-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "diving-name"
    }, d.where), /*#__PURE__*/React.createElement("div", {
      className: "diving-meta"
    }, /*#__PURE__*/React.createElement("span", null, d.dates), /*#__PURE__*/React.createElement("span", {
      className: "diving-dot"
    }), /*#__PURE__*/React.createElement("span", null, d.days, "d")), /*#__PURE__*/React.createElement("div", {
      className: "diving-notes"
    }, d.notes))))));
  }
  function BudgetView() {
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "\xA7 Money"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title"
    }, "Budget anchors"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Where the money goes and what's worth the splurge."))), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-big"
    }, budget.estimate), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-sub"
    }, budget.inBRL)), /*#__PURE__*/React.createElement("div", {
      className: "budget-grid"
    }, /*#__PURE__*/React.createElement(BudgetCard, {
      title: "Expensive chapters",
      items: budget.expensive,
      tone: "warn"
    }), /*#__PURE__*/React.createElement(BudgetCard, {
      title: "Cheap anchors",
      items: budget.cheap,
      tone: "cool"
    }), /*#__PURE__*/React.createElement(BudgetCard, {
      title: "Strategic splurges",
      items: budget.splurges,
      tone: "neutral",
      bordered: true
    })));
  }
  function BudgetCard({
    title,
    items,
    tone,
    bordered
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: `budget-card budget-card-${tone} ${bordered ? 'is-bordered' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, title), /*#__PURE__*/React.createElement("ul", null, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, it))));
  }
  function PackingView() {
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "\xA7 Kit"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title"
    }, "Packing"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Carry-on + 30L only. Rent locally where it makes sense."))), /*#__PURE__*/React.createElement("div", {
      className: "packing-list"
    }, packing.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "packing-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "packing-layer"
    }, p.layer), /*#__PURE__*/React.createElement("div", {
      className: "packing-items"
    }, p.items)))));
  }

  // ══════════════════════════════════════════════════════════════════════
  // SNAPSHOTS — save named versions and compare diffs
  // ══════════════════════════════════════════════════════════════════════
  function SnapshotsView() {
    const store = window.useStore();
    const [snaps, setSnaps] = React.useState(() => store.getSnapshots());
    const [diffTarget, setDiffTarget] = React.useState(null);
    const refresh = () => setSnaps(store.getSnapshots());
    const saveNew = () => {
      const name = prompt('Name this version (e.g. "V1 Original", "V2 Longer Nepal"):');
      if (!name || !name.trim()) return;
      store.saveSnapshot(name.trim());
      refresh();
    };
    const load = name => {
      if (!confirm(`Load snapshot "${name}"? Your current unsaved edits will be replaced.`)) return;
      store.loadSnapshot(name);
      refresh();
    };
    const del = name => {
      if (!confirm(`Delete snapshot "${name}"?`)) return;
      store.deleteSnapshot(name);
      refresh();
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "\xA7 Versions"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title"
    }, "Saved versions"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Save named snapshots of your itinerary and compare them side-by-side.")), /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-primary",
      onClick: saveNew
    }, "Save current as\u2026"))), snaps.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "snapshot-empty"
    }, "No versions saved yet. Click \"Save current as\u2026\" to capture the current itinerary.") : /*#__PURE__*/React.createElement("div", {
      className: "snapshot-list"
    }, snaps.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.name,
      className: "snapshot-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "snapshot-row-info"
    }, /*#__PURE__*/React.createElement("div", {
      className: "snapshot-name"
    }, s.name), /*#__PURE__*/React.createElement("div", {
      className: "snapshot-meta"
    }, new Date(s.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }), ' · ', s.chapters.length, " entries")), /*#__PURE__*/React.createElement("div", {
      className: "snapshot-row-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => setDiffTarget(s.name)
    }, "Compare"), /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => load(s.name)
    }, "Load"), /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      style: {
        color: 'var(--stamp)',
        borderColor: 'var(--stamp)'
      },
      onClick: () => del(s.name)
    }, "Delete"))))), diffTarget && /*#__PURE__*/React.createElement(SnapshotDiffModal, {
      snapName: diffTarget,
      store: store,
      onClose: () => setDiffTarget(null)
    }));
  }
  function SnapshotDiffModal({
    snapName,
    store,
    onClose
  }) {
    const diff = React.useMemo(() => store.compareWithSnapshot(snapName), [snapName]);
    if (!diff) return null;
    const sign = n => n > 0 ? `+${n}` : `${n}`;
    const fmtDate = d => {
      if (!d) return '—';
      const dt = new Date(d);
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getUTCMonth()] + ' ' + dt.getUTCDate();
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal is-wide diff-modal",
      onClick: e => e.stopPropagation(),
      style: {
        maxWidth: 820
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-title"
    }, "Compare: current vs \"", snapName, "\""), /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: onClose
    }, /*#__PURE__*/React.createElement(window.Icon.close, {
      size: 14
    }))), /*#__PURE__*/React.createElement("div", {
      className: "modal-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "diff-summary"
    }, /*#__PURE__*/React.createElement("span", {
      className: "diff-summary-chip",
      style: {
        background: diff.totalDaysDelta !== 0 ? 'var(--accent)' : 'var(--rule)',
        color: diff.totalDaysDelta !== 0 ? '#fff' : 'var(--ink-3)'
      }
    }, diff.totalDaysDelta !== 0 ? `${sign(diff.totalDaysDelta)} days total` : 'Same total days'), diff.added.length > 0 && /*#__PURE__*/React.createElement("span", {
      className: "diff-summary-chip diff-added"
    }, diff.added.length, " added"), diff.removed.length > 0 && /*#__PURE__*/React.createElement("span", {
      className: "diff-summary-chip diff-removed"
    }, diff.removed.length, " removed"), diff.modified.length > 0 && /*#__PURE__*/React.createElement("span", {
      className: "diff-summary-chip diff-modified"
    }, diff.modified.length, " modified"), diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && /*#__PURE__*/React.createElement("span", {
      className: "diff-summary-chip"
    }, "No changes")), /*#__PURE__*/React.createElement("table", {
      className: "diff-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Chapter"), /*#__PURE__*/React.createElement("th", null, "Current dates"), /*#__PURE__*/React.createElement("th", null, "Snapshot dates"), /*#__PURE__*/React.createElement("th", null, "\u0394 days"), /*#__PURE__*/React.createElement("th", null, "\u0394 start"))), /*#__PURE__*/React.createElement("tbody", null, diff.added.map(c => /*#__PURE__*/React.createElement("tr", {
      key: c.id,
      className: "diff-row-added"
    }, /*#__PURE__*/React.createElement("td", null, c.flag, " ", c.title), /*#__PURE__*/React.createElement("td", null, fmtDate(c.start), " \u2013 ", fmtDate(c.end)), /*#__PURE__*/React.createElement("td", {
      className: "diff-cell-muted"
    }, "\u2014"), /*#__PURE__*/React.createElement("td", {
      className: "diff-cell-pos"
    }, "+", c.days, "d"), /*#__PURE__*/React.createElement("td", null, "\u2014"))), diff.removed.map(c => /*#__PURE__*/React.createElement("tr", {
      key: c.id,
      className: "diff-row-removed"
    }, /*#__PURE__*/React.createElement("td", null, c.flag, " ", c.title), /*#__PURE__*/React.createElement("td", {
      className: "diff-cell-muted"
    }, "\u2014"), /*#__PURE__*/React.createElement("td", null, fmtDate(c.start), " \u2013 ", fmtDate(c.end)), /*#__PURE__*/React.createElement("td", {
      className: "diff-cell-neg"
    }, "-", c.days, "d"), /*#__PURE__*/React.createElement("td", null, "\u2014"))), diff.modified.map(m => /*#__PURE__*/React.createElement("tr", {
      key: m.id,
      className: "diff-row-modified"
    }, /*#__PURE__*/React.createElement("td", null, m.title), /*#__PURE__*/React.createElement("td", null, fmtDate(m.current.start), " \u2013 ", fmtDate(m.current.end)), /*#__PURE__*/React.createElement("td", null, fmtDate(m.snapshot.start), " \u2013 ", fmtDate(m.snapshot.end)), /*#__PURE__*/React.createElement("td", {
      className: m.daysDelta > 0 ? 'diff-cell-pos' : m.daysDelta < 0 ? 'diff-cell-neg' : ''
    }, m.daysDelta !== 0 ? sign(m.daysDelta) + 'd' : '—'), /*#__PURE__*/React.createElement("td", {
      className: m.dateDelta !== 0 ? 'diff-cell-shifted' : ''
    }, m.dateDelta !== 0 ? sign(m.dateDelta) + 'd' : '—')))))), /*#__PURE__*/React.createElement("div", {
      className: "modal-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-secondary",
      onClick: onClose
    }, "Close"))));
  }
  Object.assign(window, {
    ChapterList,
    DetailPanel,
    Binder
  });
})();