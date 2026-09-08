/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, kosár-állapot (localStorage + in-memory fallback)
   Tétel: { key, productId, unit:'kg'|'db', qty, spice, sliced, note }
     unit 'kg' → qty = kilogramm (0,25 lépés) · unit 'db' → qty = darab/pár
   Kulcs: productId|spice|sliced|unit, azonos sorok összevonódnak.
   Minden ár BECSÜLT és tájékoztató jellegű, a UI mindig „~” jellel mutatja.
   A régi (v1, weightKg-s) tételeket betöltéskor kg-egységre alakítjuk.
   ========================================================================== */
(function () {
  const KEY = 'hf_cart_v1';
  let memory = null;
  let storageOk = true;

  function migrate(state) {
    if (!state || !Array.isArray(state.items)) return { v: 2, items: [] };
    state.items = state.items.map(i => {
      if (i.unit) return i;
      return { key: i.productId + '|' + (i.spice || '-') + '|' + (i.sliced ? 'sz' : '-') + '|kg',
        productId: i.productId, unit: 'kg', qty: i.weightKg || 0.5, spice: i.spice || null, sliced: !!i.sliced, note: i.note || '', addedAt: i.addedAt || Date.now() };
    });
    state.v = 2;
    return state;
  }
  function readRaw() {
    if (memory !== null) return memory;
    try {
      const raw = localStorage.getItem(KEY);
      return migrate(raw ? JSON.parse(raw) : { v: 2, items: [] });
    } catch (e) {
      storageOk = false;
      memory = { v: 2, items: [] };
      return memory;
    }
  }
  function write(state) {
    if (!storageOk) { memory = state; notify(); return; }
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; memory = state; }
    notify();
  }

  const listeners = [];
  function notify() { listeners.forEach(fn => { try { fn(); } catch (e) {} }); }

  function itemKey(productId, spice, sliced, unit) {
    return productId + '|' + (spice || '-') + '|' + (sliced ? 'sz' : '-') + '|' + unit;
  }

  function limits(p, unit) {
    if (unit === 'db') return { min: 1, max: (p.piece && p.piece.max) || 10, step: 1 };
    const w = p.weight || { min: 0.25, max: 5, step: 0.25 };
    return { min: w.min, max: w.max, step: w.step || 0.25 };
  }
  function clamp(p, unit, qty) {
    const l = limits(p, unit);
    const v = Math.round(qty / l.step) * l.step;
    return Math.round(Math.min(l.max, Math.max(l.min, v)) * 100) / 100;
  }

  function add(productId, unit, qty, opts) {
    const p = window.HFDATA && HFDATA.getProduct(productId);
    if (!p) return false;
    unit = (unit === 'db' && p.piece) ? 'db' : 'kg';
    if (p.priceUnit === 'db') unit = 'db';
    const spice = (opts && opts.spice) || null;
    const sliced = !!(opts && opts.sliced);
    const note = (opts && opts.note) || '';
    const state = readRaw();
    const key = itemKey(productId, spice, sliced, unit);
    const found = state.items.find(i => i.key === key);
    if (found) {
      found.qty = clamp(p, unit, found.qty + qty);
      if (note) found.note = found.note ? (found.note + ' · ' + note) : note;
    } else {
      state.items.push({ key, productId, unit, qty: clamp(p, unit, qty), spice, sliced, note, addedAt: Date.now() });
    }
    write(state);
    return true;
  }

  function setQty(key, qty) {
    const state = readRaw();
    const it = state.items.find(i => i.key === key);
    if (!it) return;
    const p = HFDATA.getProduct(it.productId);
    if (!p) return;
    it.qty = clamp(p, it.unit, qty);
    write(state);
  }

  function remove(key) {
    const state = readRaw();
    state.items = state.items.filter(i => i.key !== key);
    write(state);
  }

  function clear() { write({ v: 2, items: [] }); }

  function enrich(i, p) {
    const fkg = window.HF ? HF.formatKg : n => n + ' kg';
    const estKg = i.unit === 'kg' ? i.qty : i.qty * ((p.piece && p.piece.kg) || 0);
    const estPrice = p.priceUnit === 'db' ? Math.round(p.price * i.qty) : Math.round(p.price * estKg);
    let qtyLabel;
    if (i.unit === 'kg') qtyLabel = fkg(i.qty);
    else if (p.priceUnit === 'db') qtyLabel = i.qty + ' ' + p.piece.label;
    else qtyLabel = i.qty + ' ' + p.piece.label + ' (kb. ' + fkg(estKg) + ')';
    return Object.assign({}, i, { product: p, estKg: Math.round(estKg * 100) / 100, estPrice, qtyLabel, limits: limits(p, i.unit) });
  }

  function items() {
    return readRaw().items.map(i => {
      const p = window.HFDATA ? HFDATA.getProduct(i.productId) : null;
      return p ? enrich(i, p) : null;
    }).filter(Boolean);
  }

  function count() { return items().length; }
  function estSubtotal() { return items().reduce((s, i) => s + i.estPrice, 0); }
  function totalWeight() { return Math.round(items().reduce((s, i) => s + i.estKg, 0) * 100) / 100; }

  window.HFCART = {
    add, setQty, remove, clear, items, count, estSubtotal, totalWeight,
    onChange: fn => listeners.push(fn),
    storageOk: () => storageOk,
    itemKey,
  };
})();
