/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, pénztár (penztar.html)
   Tétel-áttekintés (szerkeszthető) + átvétel/kiszállítás (település → nap + díj) +
   validáció + összegzés + rendelés-objektum → fizetés (cod / card provider-seam).
   A kosár ITT MÉG NEM ürül, csak a köszönő oldalon.
   ========================================================================== */
(function () {
  const form = document.getElementById('coForm');
  if (!form || !window.HFCART || !window.HF) return;
  const fmt = HF.formatFt;

  const itemsEl = document.getElementById('coItems');
  const sumRows = document.getElementById('sumRows');
  const emptyEl = document.getElementById('coEmpty');
  const pickupSub = document.getElementById('pickupSub');
  const deliverySub = document.getElementById('deliverySub');
  const minOrderHint = document.getElementById('minOrderHint');
  const delFeeTag = document.getElementById('delFeeTag');
  const townSel = document.getElementById('town');
  const routeInfo = document.getElementById('routeInfo');

  /* település-lista a configból (nap szerint csoportosítva) */
  townSel.innerHTML = '<option value="">Válasszon települést…</option>' +
    HF.DELIVERY.routes.map(r =>
      '<optgroup label="' + r.day + 'i kiszállítás">' +
        r.towns.map(t => '<option value="' + t + '">' + t + ' · ' + fmt(HF.SHIPPING.feeFor(t)) + '</option>').join('') +
      '</optgroup>').join('');

  if (!HF.FLAGS.DEMO_MODE) {
    document.getElementById('cardDemoTag').textContent = 'Barion';
    document.getElementById('cardDesc').textContent = 'Biztonságos online bankkártyás fizetés a Barion rendszerén keresztül.';
    document.getElementById('demoLine').style.display = 'none';
  }

  function state() {
    return {
      method: form.querySelector('input[name="fulfill"]:checked').value,
      town: townSel.value,
      paym: form.querySelector('input[name="paym"]:checked').value,
    };
  }

  function shippingFee(estSubtotal) {
    const s = state();
    if (s.method !== 'delivery') return 0;
    if (estSubtotal >= HF.SHIPPING.freeAbove) return 0;
    return s.town ? HF.SHIPPING.feeFor(s.town) : HF.SHIPPING.zones.korzet.fee;
  }

  function optLine(i) {
    const parts = [];
    if (i.spice) parts.push(i.spice);
    if (i.sliced) parts.push('szeletelve');
    if (i.note) parts.push('„' + i.note + '”');
    return parts.join(' · ');
  }
  function thumb(i) {
    const t = HFDATA.thumbPhoto(i.product);
    return HF.asset(t || 'media/products/foto-hamarosan-thumb.webp');
  }

  function render() {
    const items = HFCART.items();
    if (!items.length) {
      form.style.display = 'none';
      emptyEl.style.display = 'block';
      return;
    }
    form.style.display = '';
    emptyEl.style.display = 'none';

    itemsEl.innerHTML = items.map(i =>
      '<div class="citem" data-key="' + i.key + '">' +
        '<div class="citem__img"><img src="' + thumb(i) + '" alt=""></div>' +
        '<div>' +
          '<p class="citem__name">' + i.product.name + '</p>' +
          (optLine(i) ? '<p class="citem__opts">' + optLine(i) + '</p>' : '') +
          '<div class="citem__row">' +
            '<div class="stepper stepper--sm">' +
              '<button type="button" data-st="down" aria-label="Kevesebb">−</button>' +
              '<input type="text" value="' + i.qtyLabel.replace(/ \(kb\..*\)$/, '') + '" readonly aria-label="Mennyiség">' +
              '<button type="button" data-st="up" aria-label="Több">+</button>' +
            '</div>' +
            '<span class="citem__price num-tab">~' + fmt(i.estPrice) + '</span>' +
          '</div>' +
          (i.unit === 'db' && i.product.priceUnit !== 'db' ? '<p class="citem__opts">kb. ' + HF.formatKg(i.estKg) + ' · tájékoztató ár</p>' : '') +
        '</div>' +
        '<button class="citem__del" type="button" aria-label="' + i.product.name + ' törlése">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/></svg>' +
        '</button>' +
      '</div>').join('');

    const est = HFCART.estSubtotal();
    const fee = shippingFee(est);
    const s = state();
    const feeLabel = s.method === 'delivery'
      ? (fee === 0 ? 'Ingyenes (küszöb felett)' : fmt(fee))
      : 'Ingyenes (bolti átvétel)';
    sumRows.innerHTML =
      '<div class="sum-row"><span>Tételek (' + items.length + ')</span><b class="num-tab">~' + fmt(est) + '</b></div>' +
      '<div class="sum-row"><span>Becsült összsúly</span><b class="num-tab">' + HF.formatKg(HFCART.totalWeight()) + '</b></div>' +
      '<div class="sum-row"><span>Szállítás</span><b>' + feeLabel + '</b></div>' +
      '<div class="sum-row total"><span>Becsült végösszeg</span><b class="num-tab">~' + fmt(est + fee) + '</b></div>';

    const tagFee = s.town ? HF.SHIPPING.feeFor(s.town) : HF.SHIPPING.zones.pecs.fee;
    delFeeTag.textContent = est >= HF.SHIPPING.freeAbove ? 'ingyenes' : (s.town ? '+' + fmt(tagFee) : fmt(HF.SHIPPING.zones.pecs.fee) + '-tól');

    if (s.method === 'delivery') {
      const r = s.town ? HF.DELIVERY.routeOf(s.town) : null;
      routeInfo.innerHTML = r
        ? 'Kiszállítás <b>' + r.dayLower + '</b>, ' + HF.DELIVERY.cadenceShort + '. A pontos időpontot telefonon egyeztetjük.'
        : HF.DELIVERY.cadence + ' Pénteken a hegyháti falvakba, szombaton Pécsre és környékére, a településlistát <a href="' + HF.link('kiszallitas.html') + '" target="_blank" rel="noopener">itt találja</a>.';
      if (est < HF.SHIPPING.minOrder) {
        minOrderHint.innerHTML = 'Házhozszállításhoz a minimum rendelési érték <b style="color:var(--accent-soft)">' + fmt(HF.SHIPPING.minOrder) + '</b>, még <b style="color:var(--accent-soft)">~' + fmt(HF.SHIPPING.minOrder - est) + '</b> hiányzik. <a href="' + HF.link('termekek.html') + '" style="text-decoration:underline">Válogatok még →</a>';
      } else {
        minOrderHint.innerHTML = est >= HF.SHIPPING.freeAbove
          ? 'A rendelése elérte az ingyenes szállítási küszöböt.'
          : fmt(HF.SHIPPING.freeAbove) + ' felett a szállítás ingyenes.';
      }
    } else {
      minOrderHint.textContent = '';
    }
  }

  itemsEl.addEventListener('click', e => { if (window.HFUI) HFUI.stepClick(e); });

  form.querySelectorAll('input[name="fulfill"], input[name="paym"]').forEach(r =>
    r.addEventListener('change', () => {
      const s = state();
      pickupSub.classList.toggle('on', s.method === 'pickup');
      deliverySub.classList.toggle('on', s.method === 'delivery');
      render();
    }));
  townSel.addEventListener('change', () => { townSel.closest('.fld').classList.remove('err'); render(); });

  HFCART.onChange(render);
  render();

  form.addEventListener('input', e => {
    const fld = e.target.closest('.fld.err');
    if (fld) fld.classList.remove('err');
  });

  /* ---- validáció ---- */
  function setErr(id, on) {
    const fld = document.getElementById(id).closest('.fld');
    fld.classList.toggle('err', on);
    return on;
  }
  function validPhone(v) {
    return /^(\+36|0036|06)[\s-]?(\d{1,2})[\s-]?\d{3}[\s-]?\d{3,4}$/.test(v.trim());
  }
  function validate() {
    const s = state();
    let firstErr = null;
    const mark = (id, bad) => { if (setErr(id, bad) && !firstErr) firstErr = document.getElementById(id); };

    mark('cname', !document.getElementById('cname').value.trim());
    mark('cphone', !validPhone(document.getElementById('cphone').value));
    const em = document.getElementById('cemail').value.trim();
    mark('cemail', !!em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em));

    if (s.method === 'delivery') {
      mark('town', !s.town);
      mark('zip', !/^\d{4}$/.test(document.getElementById('zip').value.trim()));
      mark('street', !document.getElementById('street').value.trim());
      if (HFCART.estSubtotal() < HF.SHIPPING.minOrder) {
        if (!firstErr) firstErr = minOrderHint;
      }
    }

    const legalOk = document.getElementById('accTerms').checked && document.getElementById('accMeasure').checked;
    document.getElementById('legalErr').style.display = legalOk ? 'none' : 'block';
    if (!legalOk && !firstErr) firstErr = document.getElementById('legalErr');

    if (firstErr) {
      if (window.lenis) window.lenis.scrollTo(firstErr, { offset: -140 });
      else firstErr.scrollIntoView({ block: 'center' });
      return false;
    }
    return true;
  }

  /* ---- submit ---- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!HFCART.count()) return;
    if (!validate()) return;

    const s = state();
    if (s.method === 'delivery' && HFCART.estSubtotal() < HF.SHIPPING.minOrder) return;

    const customer = {
      name: document.getElementById('cname').value.trim(),
      phone: document.getElementById('cphone').value.trim(),
      email: document.getElementById('cemail').value.trim(),
      note: document.getElementById('cnote').value.trim(),
    };
    let fulfillment;
    if (s.method === 'delivery') {
      const r = HF.DELIVERY.routeOf(s.town);
      fulfillment = { method: 'delivery', town: s.town, day: r ? r.day : '', zone: HF.SHIPPING.zoneOf(s.town), address: {
        zip: document.getElementById('zip').value.trim(),
        city: s.town,
        street: document.getElementById('street').value.trim(),
      } };
    } else {
      fulfillment = { method: 'pickup', day: document.getElementById('pickupDay').value };
    }

    const order = HFORDER.build(customer, fulfillment, s.paym);
    HFORDER.save(order);
    HFORDER.submitOrder(order);

    if (s.paym === 'card') {
      HFPAY.start(order);
    } else {
      location.href = HF.link('koszonjuk.html') + '?order=' + encodeURIComponent(order.id) + '&status=cod';
    }
  });
})();
