/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, rendelés-objektum kezelés
   Demó fázis: a rendelés localStorage-ba kerül (hf_last_order_v1).
   ÉLES seam: submitOrder() küld POST /api/order-t (CF Pages Function),
   lásd functions/README.md. A frontend hívási pontja már most itt van.
   ========================================================================== */
(function () {
  const KEY = 'hf_last_order_v1';

  function genId() {
    const d = new Date();
    const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'HF-' + ymd + '-' + rnd;
  }

  function build(customer, fulfillment, paymentMethod) {
    const items = HFCART.items().map(i => ({
      productId: i.productId, name: i.product.name,
      unit: i.unit, qty: i.qty, qtyLabel: i.qtyLabel, estKg: i.estKg,
      spice: i.spice, sliced: i.sliced, note: i.note,
      unitPrice: i.product.price, priceUnit: i.product.priceUnit || 'kg', estLinePrice: i.estPrice,
    }));
    const estSubtotal = items.reduce((s, i) => s + i.estLinePrice, 0);
    let shippingFee = 0;
    if (fulfillment.method === 'delivery') {
      shippingFee = (estSubtotal >= HF.SHIPPING.freeAbove) ? 0 : HF.SHIPPING.feeFor(fulfillment.town);
    }
    return {
      id: genId(),
      createdAt: new Date().toISOString(),
      items,
      totals: {
        estSubtotal, shippingFee,
        estTotal: estSubtotal + shippingFee,
        totalWeightKg: HFCART.totalWeight(),
      },
      customer, fulfillment,
      payment: { method: paymentMethod, provider: HF.FLAGS.PAYMENT_PROVIDER, status: 'pending' },
      meta: { demo: HF.FLAGS.DEMO_MODE, disclaimerAccepted: true, priceNote: HF.PRICE_NOTE.short },
    };
  }

  function save(order) {
    try { localStorage.setItem(KEY, JSON.stringify(order)); } catch (e) { window.__hfOrderMem = order; }
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : (window.__hfOrderMem || null); }
    catch (e) { return window.__hfOrderMem || null; }
  }
  function setStatus(status) {
    const o = load();
    if (!o) return null;
    o.payment.status = status;
    save(o);
    return o;
  }

  /* ÉLES seam: itt megy ki a rendelés e-mail/notifikáció a boltnak.
     Demóban no-op, a functions/api/order.js bekötése után POST /api/order. */
  function submitOrder(order) {
    if (HF.FLAGS.DEMO_MODE) return Promise.resolve({ ok: true, demo: true });
    return fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).then(r => r.json());
  }

  window.HFORDER = { build, save, load, setStatus, submitOrder };
})();
