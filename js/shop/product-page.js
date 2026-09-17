/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, termékoldal (termek/<id>.html, statikus + kliens-render)
   Az id a #pdetRoot[data-id]-ból jön (a régi termek.html?id= is működik).
   Súlyra (0,25 kg lépés) vagy darabra/párra vétel, élő becsült ár, galéria, mobil buybar.
   MINDEN ár tájékoztató jellegű, a kanonikus mondat a PRICE_NOTE-ból jön.
   ========================================================================== */
(function () {
  const root = document.getElementById('pdetRoot');
  if (!root || !window.HFDATA || !window.HF) return;
  const fmt = HF.formatFt, fkg = HF.formatKg;

  const id = root.dataset.id || new URLSearchParams(location.search).get('id');
  const p = id ? HFDATA.getProduct(id) : null;
  if (!p) { location.replace(HF.link('termekek.html')); return; }
  const cat = HFDATA.getCategory(p.category);
  const an = HFDATA.getAnimal(p.animal);

  document.title = p.name + ' · Hegyháti Finomságok';

  /* ---- morzsamenü ---- */
  const SEP = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
  const crumbs = document.getElementById('crumbs');
  if (crumbs) crumbs.innerHTML =
    '<a href="' + HF.link('termekek.html') + '">Termékek</a>' + SEP +
    '<a href="' + HF.link(cat.slug + '.html') + '">' + cat.name + '</a>' + SEP +
    '<span style="color:var(--ink)">' + p.name + '</span>';

  /* ---- egység-modell ---- */
  const fixedPiece = p.priceUnit === 'db';           /* csomagolt, fix darabár (zsír) */
  const canPiece = !!p.piece;
  const canKg = !fixedPiece && !!p.weight;
  let unit = fixedPiece ? 'db' : (canPiece && p.piece.label === 'pár') ? 'db' : 'kg';
  let qty = unit === 'db' ? 1 : p.weight.default;

  function estKg() { return unit === 'kg' ? qty : qty * p.piece.kg; }
  function estPrice() { return fixedPiece ? p.price * qty : p.price * estKg(); }
  function qtyText() { return unit === 'kg' ? fkg(qty) : (qty + ' ' + p.piece.label); }

  /* ---- fő render ---- */
  const photos = p.photos && p.photos.length ? p.photos : ['media/products/foto-hamarosan.webp'];
  const gallery = photos.length > 1
    ? '<div class="pdet__thumbs" role="tablist" aria-label="További képek">' +
        photos.map((ph, i) => '<button type="button" class="pdet__thumb' + (i === 0 ? ' on' : '') + '" data-ph="' + HF.asset(ph) + '" aria-label="' + (i + 1) + '. kép"><img src="' + HF.asset(ph.replace(/\.webp$/, '-thumb.webp')) + '" alt="" loading="lazy" width="600" height="375"></button>').join('') +
      '</div>'
    : '';

  /* fotó-jelzés: a teljes sor egészben, elvágva, szeletelve. Ami hiányzik, azt kiírjuk. */
  const noteText = !p.photos || !p.photos.length
    ? 'A termék fotója hamarosan várható.'
    : p.photoInfo === 'illus'
      ? 'A képen illusztráció látható. A termék saját fotója hamarosan várható, egészben, elvágva és szeletelve is.'
      : p.photoInfo === 'partial'
        ? 'További fotók hamarosan várhatók a termékről, elvágva és szeletelve is.'
        : '';
  const photoNote = noteText
    ? '<p class="pdet__phnote"><svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="12" cy="12" r="3.2"/></svg><span>' + noteText + '</span></p>'
    : '';

  const unitToggle = (canPiece && canKg)
    ? '<div class="unit-toggle" role="radiogroup" aria-label="Mennyiség egysége">' +
        '<label class="unit-opt"><input type="radio" name="unit" value="kg"' + (unit === 'kg' ? ' checked' : '') + '><span>Súlyra <small>kg, 0,25 kg lépés</small></span></label>' +
        '<label class="unit-opt"><input type="radio" name="unit" value="db"' + (unit === 'db' ? ' checked' : '') + '><span>' + (p.piece.label === 'pár' ? 'Párra' : 'Darabra') + ' <small>kb. ' + fkg(p.piece.kg) + '/' + p.piece.label + '</small></span></label>' +
      '</div>'
    : '';

  root.innerHTML =
    '<div class="pdet__gal">' +
      '<figure class="pdet__media"><img id="pdetImg" src="' + HF.asset(photos[0]) + '" alt="' + p.name + '" width="1200" height="750"></figure>' +
      gallery +
      photoNote +
    '</div>' +
    '<div>' +
      '<p class="eyebrow">' + cat.name + (an && p.animal !== 'sertes' ? ' · ' + an.name : '') + '</p>' +
      '<h1 class="pdet__name">' + p.name + '</h1>' +
      '<p class="pdet__price num-tab">' + fmt(p.price) + '<small>/' + (fixedPiece ? 'db' : 'kg') + ' · bruttó · tájékoztató ár</small></p>' +
      '<p class="pdet__desc">' + p.desc + '</p>' +
      '<form class="pdet__form" id="buyForm">' +
        '<div>' +
          '<span class="fld-label">Mennyiség</span>' +
          unitToggle +
          '<div class="qty-row">' +
            '<div class="stepper">' +
              '<button type="button" data-st="down" aria-label="Kevesebb">−</button>' +
              '<input type="text" id="qIn" inputmode="decimal" value="" aria-label="Mennyiség">' +
              '<button type="button" data-st="up" aria-label="Több">+</button>' +
            '</div>' +
            '<span class="qty-hint" id="qHint"></span>' +
          '</div>' +
        '</div>' +
        (p.options.spice ? (
        '<div>' +
          '<span class="fld-label">' + (p.options.spiceLabel || 'Ízesítés') + '</span>' +
          '<div class="radio-row">' +
            p.options.spice.map((s, i) =>
              '<label class="radio-pill"><input type="radio" name="spice" value="' + s + '"' + (i === 0 ? ' checked' : '') + '><span>' + s.charAt(0).toUpperCase() + s.slice(1) + '</span></label>').join('') +
          '</div>' +
        '</div>') : '') +
        (p.options.sliceable ? '<label class="check-line"><input type="checkbox" id="slicedIn"> Kérem szeletelve</label>' : '') +
        '<div class="pdet__note">' +
          '<span class="fld-label">Megjegyzés a tételhez <span style="text-transform:none;letter-spacing:0;opacity:.7">(nem kötelező)</span></span>' +
          '<textarea id="noteIn" maxlength="200" placeholder="Pl. vastagabb szeletek, vákuumcsomagolás…"></textarea>' +
        '</div>' +
        '<div class="pdet__buy">' +
          '<button class="btn btn--solid" type="submit" data-magnet id="addBtn">Kosárba teszem ' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.2 12.2a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>' +
          '</button>' +
          '<div class="pdet__est">' +
            '<div class="est-label">Becsült ár</div>' +
            '<div class="est-val num-tab" id="estOut">~' + fmt(estPrice()) + '</div>' +
            '<div class="est-sub" id="estSub"></div>' +
          '</div>' +
        '</div>' +
        '<p class="measure-note">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>' +
          HF.PRICE_NOTE.long +
        '</p>' +
      '</form>' +
    '</div>';

  /* ---- galéria ---- */
  const img = root.querySelector('#pdetImg');
  root.querySelectorAll('.pdet__thumb').forEach(b => b.addEventListener('click', () => {
    img.src = b.dataset.ph;
    root.querySelectorAll('.pdet__thumb').forEach(x => x.classList.toggle('on', x === b));
  }));

  /* ---- mennyiség ---- */
  const qIn = root.querySelector('#qIn');
  const qHint = root.querySelector('#qHint');
  const estOut = root.querySelector('#estOut');
  const estSub = root.querySelector('#estSub');
  const bbPrice = document.getElementById('buybarPrice');

  function clampQty(v) {
    if (unit === 'kg') {
      const w = p.weight, st = w.step || HFDATA.STEP;
      v = Math.round(v / st) * st;
      return Math.round(Math.min(w.max, Math.max(w.min, v)) * 100) / 100;
    }
    return Math.min(p.piece.max || 10, Math.max(1, Math.round(v)));
  }
  function parseQ(str) {
    const n = parseFloat(String(str).replace(',', '.').replace(/[^\d.]/g, ''));
    return isNaN(n) ? (unit === 'kg' ? p.weight.default : 1) : n;
  }
  function paint() {
    qIn.value = unit === 'kg' ? String(qty).replace('.', ',') : String(qty);
    if (unit === 'kg') {
      qHint.textContent = 'kg (' + fkg(p.weight.min) + ' és ' + fkg(p.weight.max) + ' között, 0,25 kg lépésben)';
    } else if (fixedPiece) {
      qHint.textContent = p.piece.label + ' (' + fkg(p.piece.kg) + ' csomag)';
    } else {
      qHint.textContent = p.piece.label + ' (egy ' + p.piece.label + ' kb. ' + fkg(p.piece.kg) + ')';
    }
    const est = '~' + fmt(estPrice());
    estOut.textContent = est;
    estSub.textContent = unit === 'db' && !fixedPiece ? ('kb. ' + fkg(estKg()) + ' · ' + HF.PRICE_NOTE.short) : HF.PRICE_NOTE.short;
    if (bbPrice) bbPrice.textContent = est;
  }
  function setQty(v) { qty = clampQty(v); paint(); }

  root.addEventListener('click', e => {
    if (e.target.closest('[data-st="up"]')) { e.preventDefault(); setQty(qty + (unit === 'kg' ? (p.weight.step || HFDATA.STEP) : 1)); }
    if (e.target.closest('[data-st="down"]')) { e.preventDefault(); setQty(qty - (unit === 'kg' ? (p.weight.step || HFDATA.STEP) : 1)); }
  });
  qIn.addEventListener('change', () => setQty(parseQ(qIn.value)));
  qIn.addEventListener('focus', () => qIn.select());
  root.querySelectorAll('input[name="unit"]').forEach(r => r.addEventListener('change', () => {
    unit = r.value;
    qty = unit === 'kg' ? p.weight.default : 1;
    paint();
  }));
  paint();

  /* ---- kosárba ---- */
  function currentOpts() {
    const spiceEl = root.querySelector('input[name="spice"]:checked');
    const slicedEl = root.querySelector('#slicedIn');
    const noteEl = root.querySelector('#noteIn');
    return {
      spice: spiceEl ? spiceEl.value : null,
      sliced: slicedEl ? slicedEl.checked : false,
      note: noteEl ? noteEl.value.trim() : '',
    };
  }
  function addNow() { if (window.HFUI) HFUI.addAndToast(p.id, unit, qty, currentOpts()); }
  root.querySelector('#buyForm').addEventListener('submit', e => { e.preventDefault(); addNow(); });
  const bbAdd = document.getElementById('buybarAdd');
  if (bbAdd) bbAdd.addEventListener('click', addNow);

  /* ---- mobil buybar: ha a fő CTA kiscrollozott ---- */
  const buybar = document.getElementById('buybar');
  const addBtn = root.querySelector('#addBtn');
  if (buybar && addBtn && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => {
      buybar.classList.toggle('on', !en.isIntersecting);
      buybar.setAttribute('aria-hidden', en.isIntersecting ? 'true' : 'false');
    }, { threshold: 0 });
    io.observe(addBtn);
  }
  root.addEventListener('focusin', e => { if (e.target.matches('input,textarea')) document.body.classList.add('kb-open'); });
  root.addEventListener('focusout', () => setTimeout(() => {
    if (!document.activeElement || !document.activeElement.matches('input,textarea')) document.body.classList.remove('kb-open');
  }, 120));

  /* ---- kapcsolódó termékek ---- */
  const rel = HFDATA.PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
  const relSec = document.getElementById('relatedSec');
  if (rel.length && relSec && window.HFCAT) {
    relSec.style.display = '';
    const grid = document.getElementById('relatedGrid');
    grid.innerHTML = rel.map(r => HFCAT.card(r, { reveal: false, noFlag: true })).join('');
    HFCAT.bindQuickAdd(grid);
  }
})();
