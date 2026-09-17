/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, közös katalógus-réteg (kártya, keresés, szűrő, gyors-kosár)
   Használja: termekek.html (összes kategória), a 7 kategória-oldal, index.html (kiemelt).
   Minden ár tájékoztató jellegű: a kártyán is ott a jelzés (PRICE_NOTE).
   ========================================================================== */
(function () {
  if (!window.HFDATA || !window.HF) return;
  const fmt = HF.formatFt;

  const CHILI = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4c0-1 .8-2 2-2M14 4c-4 0-5 3-5 6 0 5-3 9-6 10 2 1 5 1 8-.5 4-2 6-6 6-10.5 0-3-1-5-3-5Z"/></svg>';
  const KNIFE = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17L17 3l2.5 2.5L8 17H3ZM12 17h9"/></svg>';
  const SCALE = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M5 6h14M7 6l-3 7a3 3 0 0 0 6 0L7 6ZM17 6l-3 7a3 3 0 0 0 6 0l-3-7ZM12 6v14M8 20h8"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function priceLabel(p) {
    return fmt(p.price) + '<small>/' + (p.priceUnit === 'db' ? 'db' : 'kg') + '</small>';
  }

  function chips(p) {
    const out = [];
    const an = HFDATA.getAnimal(p.animal);
    if (an && p.animal !== 'sertes') out.push('<span class="opt-chip opt-chip--animal">' + an.name + '</span>');
    if (p.options.spice) out.push('<span class="opt-chip">' + CHILI + p.options.spice.join(' / ') + '</span>');
    if (p.piece && p.priceUnit !== 'db') out.push('<span class="opt-chip">' + SCALE + 'súlyra vagy ' + (p.piece.label === 'pár' ? 'párra' : 'darabra') + '</span>');
    if (p.options.sliceable) out.push('<span class="opt-chip">' + KNIFE + 'szeletelve kérhető</span>');
    return out.length ? '<div class="pcard__opts">' + out.join('') + '</div>' : '';
  }

  function thumbSrc(p) {
    const t = HFDATA.thumbPhoto(p);
    return HF.asset(t || 'media/products/foto-hamarosan-thumb.webp');
  }
  function mainSrc(p) {
    const m = HFDATA.mainPhoto(p);
    return HF.asset(m || 'media/products/foto-hamarosan.webp');
  }

  /* alapértelmezett gyors-kosár mennyiség */
  function defaultAdd(p) {
    if (p.priceUnit === 'db') return { unit: 'db', qty: 1 };
    if (p.piece && p.piece.label === 'pár') return { unit: 'db', qty: 1 };
    return { unit: 'kg', qty: p.weight.default };
  }

  function card(p, o) {
    o = o || {};
    const needsPage = !!p.options.spice;
    const url = HF.link('termek/' + p.id + '.html');
    const btn = o.noButton ? '' : (needsPage
      ? '<a class="btn btn--sm btn--ghost" href="' + url + '">Választás ' + ARROW + '</a>'
      : '<button class="btn btn--sm" type="button" data-qadd="' + p.id + '">Kosárba</button>');
    return '' +
      '<article class="pcard" data-id="' + p.id + '" data-cat="' + p.category + '" data-animal="' + p.animal + '" data-search="' + HFDATA.searchIndex(p) + '"' + (o.reveal === false ? '' : ' data-reveal') + '>' +
        '<a class="pcard__link" href="' + url + '" aria-label="' + p.name + '"></a>' +
        (p.featured && !o.noFlag ? '<span class="pcard__flag">Kiemelt</span>' : '') +
        '<figure class="pcard__media"><img src="' + thumbSrc(p) + '" alt="' + p.name + '" loading="lazy" width="600" height="375"></figure>' +
        '<div class="pcard__body">' +
          '<h3 class="pcard__name">' + p.name + '</h3>' +
          '<p class="pcard__desc">' + p.desc + '</p>' +
          chips(p) +
          '<div class="pcard__foot">' +
            '<span class="pcard__pricewrap"><span class="pcard__price num-tab">' + priceLabel(p) + '</span><span class="pcard__pnote">tájékoztató ár</span></span>' +
            btn +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function bindQuickAdd(root) {
    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-qadd]');
      if (!btn) return;
      e.preventDefault();
      const p = HFDATA.getProduct(btn.dataset.qadd);
      if (!p || !window.HFUI) return;
      const d = defaultAdd(p);
      HFUI.addAndToast(p.id, d.unit, d.qty, {});
    });
  }

  /* ---- keresés + szűrő sáv ---- */
  const SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  const CLEAR_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function toolsHtml(o) {
    const animals = HFDATA.ANIMALS.filter(a => !o.animals || o.animals.includes(a.id));
    return '' +
      '<div class="shop-tools">' +
        '<label class="search">' + SEARCH_ICON +
          '<input type="search" id="shopSearch" placeholder="' + (o.placeholder || 'Keresés a termékek között…') + '" autocomplete="off" aria-label="Keresés a termékek között">' +
          '<button type="button" class="search__clear" id="shopSearchClear" aria-label="Keresés törlése" hidden>' + CLEAR_ICON + '</button>' +
        '</label>' +
        '<div class="filters" role="group" aria-label="Szűrés fajta szerint">' +
          (o.animalLinks
            /* link-mód: a fajta a tiszta URL-be kerül (/mangalica-szalonna), így megosztható és hirdethető */
            ? '<a class="fchip' + (o.currentAnimal ? '' : ' on') + '" href="' + o.animalLinks[''] + '">Mind</a>' +
              animals.map(a => o.animalLinks[a.id]
                ? '<a class="fchip' + (o.currentAnimal === a.id ? ' on' : '') + '" href="' + o.animalLinks[a.id] + '"' + (o.currentAnimal === a.id ? ' aria-current="page"' : '') + '>' + a.name + '</a>'
                : '').join('')
            : '<button type="button" class="fchip on" data-animal="">Mind</button>' +
              animals.map(a => '<button type="button" class="fchip" data-animal="' + a.id + '">' + a.name + '</button>').join('')) +
        '</div>' +
        '<span class="shop-tools__count" id="shopCount" aria-live="polite"></span>' +
      '</div>';
  }

  /* a kártyákra alkalmazza az állapotot: elrejti a nem illőt, üres szekciót, számlál */
  function applyFilter(root, state, o) {
    o = o || {};
    const q = HFDATA.normalize(state.q || '').trim();
    let shown = 0;
    root.querySelectorAll('.pcard').forEach(c => {
      const ok = (!state.animal || c.dataset.animal === state.animal) && (!q || (c.dataset.search || '').indexOf(q) !== -1);
      c.classList.toggle('is-hidden', !ok);
      if (ok) shown++;
    });
    root.querySelectorAll('.cat-sec').forEach(s => {
      const any = s.querySelector('.pcard:not(.is-hidden)');
      s.classList.toggle('is-hidden', !any);
    });
    const empty = root.querySelector('.shop-empty');
    if (empty) empty.classList.toggle('is-hidden', shown > 0);
    const cnt = document.getElementById('shopCount');
    if (cnt) {
      const total = root.querySelectorAll('.pcard').length;
      cnt.textContent = (q || state.animal) ? (shown + ' / ' + total + ' termék') : (total + ' termék');
    }
    if (o.onApply) o.onApply(shown, state);
    return shown;
  }

  function mountTools(container, root, o) {
    o = o || {};
    container.innerHTML = toolsHtml(o);
    const input = container.querySelector('#shopSearch');
    const clear = container.querySelector('#shopSearchClear');
    const chipsEl = [...container.querySelectorAll('.fchip')];
    const linkMode = !!o.animalLinks;
    const state = { q: '', animal: '' };
    /* ?q= és ?fajta= előtöltés (megosztható keresés). Link-módban a fajta az URL útvonalában van. */
    try {
      const sp = new URLSearchParams(location.search);
      if (sp.get('q')) { state.q = sp.get('q'); input.value = state.q; }
      if (!linkMode && sp.get('fajta') && HFDATA.getAnimal(sp.get('fajta'))) state.animal = sp.get('fajta');
    } catch (e) {}
    if (!linkMode) chipsEl.forEach(c => c.classList.toggle('on', c.dataset.animal === state.animal));
    clear.hidden = !state.q;

    let t = null;
    function run() {
      applyFilter(root, state, o);
      try {
        const sp = new URLSearchParams(location.search);
        state.q ? sp.set('q', state.q) : sp.delete('q');
        if (linkMode) sp.delete('fajta');
        else if (state.animal) sp.set('fajta', state.animal);
        else sp.delete('fajta');
        const qs = sp.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      } catch (e) {}
      /* a reveal-listás kártyák látszódjanak azonnal (szűrés után nincs görgetés) */
      root.querySelectorAll('.pcard:not(.is-hidden)[data-reveal]:not(.in)').forEach(c => c.classList.add('in'));
    }
    input.addEventListener('input', () => {
      state.q = input.value;
      clear.hidden = !state.q;
      clearTimeout(t); t = setTimeout(run, 120);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; state.q = ''; clear.hidden = true; run(); } });
    clear.addEventListener('click', () => { input.value = ''; state.q = ''; clear.hidden = true; run(); input.focus(); });
    if (!linkMode) {
      chipsEl.forEach(c => c.addEventListener('click', () => {
        state.animal = c.dataset.animal;
        chipsEl.forEach(x => x.classList.toggle('on', x === c));
        run();
      }));
    }
    run();
    return { state, run };
  }

  window.HFCAT = { card, priceLabel, chips, thumbSrc, mainSrc, defaultAdd, bindQuickAdd, mountTools, applyFilter, ARROW };
})();
