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
  DEMO_MODE: true,              /* true = demó jelzések + szimulált fizetés */
  PAYMENT_PROVIDER: 'demo',     /* 'demo' | 'barion' (éleskor, functions/ + POSKey) */
};

/* Ár-figyelmeztetés, egy helyen (a bolt MINDEN felületén ez jelenik meg) */
const PRICE_NOTE = {
  short: 'Az ár tájékoztató jellegű.',
  line: 'Az ár tájékoztató jellegű, a pontos végösszeg a mérés után, átvételkor derül ki.',
  long: 'Mérlegelt árut adunk. Minden feltüntetett ár tájékoztató jellegű, a kosár összege becslés. A pontos végösszeg a mérés után, átvételkor derül ki, rendelés után telefonon egyeztetünk.',
};

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
  return href.replace(/(^|\/)index\.html(?=$|[#?])/, '$1').replace(/\.html(?=$|[#?])/, '');
}
function asset(path) { return HF_BASE + path; }
function link(path) { return cleanUrl(HF_BASE + path); }

window.HF = { SITE, DELIVERY, SHIPPING, LEGAL, FLAGS, PRICE_NOTE, UNITS, formatFt, formatKg, cleanUrl, asset, link, base: HF_BASE };
