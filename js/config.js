/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, központi konfiguráció
   --------------------------------------------------------------------------
   MINTA-ADATOK KÖZPONTI LISTÁJA (éles előtt EZEKET kell cserélni):
     1. SHIPPING.*         = szállítási díjak, min. rendelés, ingyenes küszöb
                             (az átnézett ÁSZF szerint: 990 / 1990 / 25 000 / 8 000)
     2. LEGAL.*            = cégadatok az impresszumhoz/ÁSZF-hez (MINTA!)
     3. FLAGS.DEMO_MODE    = élesítéskor false
     4. FLAGS.PAYMENT_PROVIDER = élesítéskor 'barion' (functions/ + POSKey env kell,
        lásd functions/README.md)
   A kiszállítási útvonalak (DELIVERY) a 2026-09 plakát szerint, a
   kiszallitas.html statikus listája ugyanezt tartalmazza (SEO miatt kétszer).
   ========================================================================== */

/* Almappás oldalak (termek/*.html) beállítják: window.HF_BASE = '../' */
const HF_BASE = window.HF_BASE || '';

const SITE = {
  name: 'Hegyháti Finomságok',
  domain: 'hegyhatifinomsagok.com',
  phone: '+36 30 300 7422',
  phoneHref: 'tel:+36303007422',
  email: 'hegyhatihus@gmail.com',
  facebook: 'https://www.facebook.com/hegyhatifinomsagok',
  address: 'Pécsi Vásárcsarnok, Pécs, Zólyom utca 4.',
  addressShort: 'Pécsi Vásárcsarnok',
  street: 'Pécs, Zólyom utca 4.',
  city: 'Pécs',
  openingDays: 'keddtől szombatig',
  openingHours: '6:00-14:00, szombaton 6:00-12:00',
  openingLine: 'Keddtől péntekig 6:00-14:00, szombaton 6:00-12:00',
  hours: [['Kedd-péntek', '6:00-14:00'], ['Szombat', '6:00-12:00']],
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=P%C3%A9cs%2C+Z%C3%B3lyom+utca+4.',
};

/* Kiszállítás előrendeléssel: útvonalak és napok (plakát, 2026-09) */
const DELIVERY = {
  cadence: 'Kiszállítás minden hónap első hetében és a hónap közepén.',
  cadenceShort: 'a hónap első hetében és a hónap közepén',
  routes: [
    { id: 'pentek', day: 'Péntek', dayLower: 'pénteken',
      towns: ['Mánfa', 'Komló', 'Mecsekfalu', 'Mecsekjánosi', 'Mecsekpölöske', 'Oroszló', 'Mindszentgodisa', 'Kisbeszterce', 'Bakóca'] },
    { id: 'szombat', day: 'Szombat', dayLower: 'szombaton',
      towns: ['Pécs', 'Kozármisleny', 'Abaliget', 'Orfű'] },
  ],
  routeOf(town) {
    return DELIVERY.routes.find(r => r.towns.includes(town)) || null;
  },
};

/* Szállítási díjszabás az átnézett ÁSZF (2026-09) szerint */
const SHIPPING = {
  zones: {
    pecs:   { label: 'Pécs',                  fee: 990 },
    korzet: { label: 'Pécs környéke és a hegyháti települések', fee: 1990 },
  },
  zoneOf(town) { return town === 'Pécs' ? 'pecs' : 'korzet'; },
  feeFor(town) { return SHIPPING.zones[SHIPPING.zoneOf(town)].fee; },
  freeAbove: 25000,   /* e felett ingyenes a szállítás */
  minOrder: 8000,     /* minimum rendelési érték házhozszállításnál */
  pickupLabel: 'Átvétel az üzletben, ingyenes',
};

/* MINTA cégadatok a jogi oldalakhoz, Barion-élesítés előtt KÖTELEZŐ kitölteni */
const LEGAL = {
  operatorName: 'MINTA: üzemeltető neve (kistermelő)',
  operatorId: 'MINTA: kistermelői nyilvántartási szám',
  taxNumber: 'MINTA: adószám',
  registeredSeat: 'MINTA: székhely',
};

const FLAGS = {
  /* ONLINE RENDELÉS KAPCSOLÓ. false = nincs kosár, pénztár, fizetés: a termékek „helyben,
     az üzletben vásárolhatók”, a penztar/fizetes-demo/koszonjuk oldal a kapcsolatra visz.
     Visszakapcsolás: true, utána `node tools/gen-pages.js` (a menü, a termékoldalak és a
     három rendelési oldal fejléce a generátorból jön). */
  ORDERING: false,
  DEMO_MODE: true,              /* true = demó jelzések + szimulált fizetés */
  PAYMENT_PROVIDER: 'demo',     /* 'demo' | 'barion' (éleskor, functions/ + POSKey) */
};

/* E-mail link: asztali gépen a Gmail írás-ablaka nyílik, telefonon a levelező (mailto:).
   A statikus mailto: linkeket a main.js cseréli asztali gépen (HF.upgradeMail). */
const MAIL = {
  mailto: 'mailto:' + SITE.email,
  gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(SITE.email),
};
function isDesktop() {
  try {
    return matchMedia('(pointer:fine)').matches && !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  } catch (e) { return false; }
}
function upgradeMail(root) {
  if (!isDesktop()) return;
  (root || document).querySelectorAll('a[href^="mailto:"]').forEach(a => {
    const to = a.getAttribute('href').slice(7).split('?')[0];
    a.setAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(decodeURIComponent(to)));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });
}

/* Ár-figyelmeztetés, egy helyen (a bolt MINDEN felületén ez jelenik meg) */
const PRICE_NOTE = {
  short: 'Az ár tájékoztató jellegű.',
  line: 'Az ár tájékoztató jellegű, a pontos végösszeg a mérés után, átvételkor derül ki.',
  long: 'Mérlegelt árut adunk. Minden feltüntetett ár tájékoztató jellegű, a kosár összege becslés. A pontos végösszeg a mérés után, átvételkor derül ki, rendelés után telefonon egyeztetünk.',
  /* online rendelés nélkül (FLAGS.ORDERING:false) */
  instore: 'Az ár tájékoztató jellegű, a pontos végösszeg a mérés után, átvételkor derül ki.',
};

/* „Helyben, az üzletben vásárolható” blokk (online rendelés nélkül). Egy forrás: a generátor
   (kategória-oldalak, teljes kínálat) és a termékoldal JS-e is ezt hívja.
   variant: 'wide' = oldal-szélességű sáv, 'side' = termékoldal jobb oszlopa. */
function instoreHtml(variant) {
  const pin = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>';
  const clock = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>';
  const phone = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>';
  const mail = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
  return '' +
    '<section class="instore instore--' + (variant || 'wide') + '" aria-labelledby="instoreTitle">' +
      '<div class="instore__head">' +
        '<p class="eyebrow">Vásárlás</p>' +
        '<h2 class="instore__title" id="instoreTitle">Helyben, az üzletben vásárolható</h2>' +
        '<p class="instore__lead">A termékeinket a Pécsi Vásárcsarnokban, a pultunknál vásárolhatja meg. Telefonon vagy e-mailben is rendelhet, előrendeléssel házhoz is visszük. ' + PRICE_NOTE.instore + '</p>' +
      '</div>' +
      '<ul class="instore__rows">' +
        '<li>' + pin + '<span><strong>' + SITE.addressShort + '</strong>' + SITE.street +
          '<a class="instore__aux" href="' + SITE.mapsUrl + '" target="_blank" rel="noopener">Útvonalterv</a></span></li>' +
        '<li>' + clock + '<span><strong>Nyitvatartás</strong>' + SITE.hours.map(h => h[0] + ' ' + h[1]).join('<br>') + '</span></li>' +
        '<li>' + phone + '<span><strong>Telefon</strong><a class="num-tab" href="' + SITE.phoneHref + '">' + SITE.phone + '</a></span></li>' +
        '<li>' + mail + '<span><strong>E-mail</strong><a href="mailto:' + SITE.email + '">' + SITE.email + '</a></span></li>' +
      '</ul>' +
    '</section>';
}

/* Mennyiségi lépésköz: 250 g (az ügyfél kérése), darabra is kérhető */
const UNITS = { stepKg: 0.25 };

const FMT = new Intl.NumberFormat('hu-HU');
function formatFt(n) { return FMT.format(Math.round(n)) + ' Ft'; }
function formatKg(n) { return String(Math.round(n * 100) / 100).replace('.', ',') + ' kg'; }

/* ---- Intelligens URL-ek ----
   A forrásban .html-es relatív linkek vannak (dupla kattintásra, file://-ből is fut).
   http(s) alatt (Cloudflare Pages) a .html lekerül: /termekek, /sonka, /termek/kulen. */
const IS_HTTP = /^https?:$/.test(location.protocol);
function cleanUrl(href) {
  if (!IS_HTTP || !href) return href;
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(href)) return href;
  const out = href.replace(/(^|\/)index\.html(?=$|[#?])/, '$1').replace(/\.html(?=$|[#?])/, '');
  /* "index.html" -> "" lenne, az üres href pedig az AKTUÁLIS oldalra mutat (a Főoldal link
     visszadobott a kapcsolatra). Gyökér-index esetén "./" kell, ami http-n a "/"-re oldódik. */
  return (out === '' || /^[#?]/.test(out)) ? './' + out : out;
}
function asset(path) { return HF_BASE + path; }
function link(path) { return cleanUrl(HF_BASE + path); }

window.HF = { SITE, DELIVERY, SHIPPING, LEGAL, FLAGS, PRICE_NOTE, UNITS, MAIL, formatFt, formatKg, cleanUrl, asset, link, upgradeMail, isDesktop, instoreHtml, ordering: FLAGS.ORDERING !== false, base: HF_BASE };
