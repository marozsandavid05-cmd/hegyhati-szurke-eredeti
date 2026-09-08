# Cloudflare Pages Functions, ÉLES bekötési pont (most ÜRES, szándékosan)

A webshop jelenleg **demó módban** fut (`js/config.js` → `FLAGS.DEMO_MODE: true`,
`PAYMENT_PROVIDER: 'demo'`). A frontend már fel van készítve az élesítésre,
**frontend-átírás nélkül** csak az alábbiak kellenek:

## 1. Barion Smart Gateway (online kártyás fizetés)

Fájlok, amiket ide kell megírni éleskor:

- `functions/api/payment/start.js`
  - POST body: `{ orderId, order }` (a frontend `js/shop/payment.js` már így hívja)
  - Barion `POST /v2/Payment/Start` hívás a POSKey-jel → válasz: `{ gatewayUrl }`
  - POSKey: **Cloudflare Pages env-változó** (`BARION_POSKEY`), SOHA nem a kódban!
- `functions/api/payment/callback.js`
  - Barion IPN (callback) fogadása → `GetPaymentState` ellenőrzés → rendelés státusz
- Visszatérési URL: `koszonjuk.html?paymentId=...` (a frontend kezeli)

## 2. Rendelés-értesítés a boltnak (email)

- `functions/api/order.js`
  - POST body: a teljes rendelés-objektum (a frontend `js/shop/order.js` →
    `submitOrder()` már hívja, demóban no-op)
  - Tétel-mezők (2026-09 óta): `unit` ('kg' | 'db'), `qty`, `qtyLabel` (pl. „2 pár (kb. 1 kg)"),
    `estKg`, `priceUnit`, `estLinePrice`; minden ár tájékoztató jellegű (`meta.priceNote`)
  - Kiszállításnál `fulfillment`: `{ method:'delivery', town, day ('Péntek'|'Szombat'), zone, address }`
  - Email küldés a boltnak (pl. MailChannels, Cloudflare Pages-ből ingyenes),
    címzett: hegyhatihus@gmail.com

## 3. Élesítési checklist (sorrendben)

1. Valós cégadatok kitöltése: `js/config.js` (LEGAL.*; a cím és a SHIPPING díjak már az átnézett ÁSZF szerint)
   + a 4 jogi oldal MINTA-szövegeinek véglegesítése (ÁSZF-be Barion-klauzula kell!)
2. Domain HTTPS-en él (Cloudflare Pages + hegyhatifinomsagok.com)
3. Barion kereskedői fiók + POSKey → `BARION_POSKEY` env a Pages projektben
4. A fenti functions fájlok megírása
5. `js/config.js`: `DEMO_MODE: false`, `PAYMENT_PROVIDER: 'barion'`
6. Teszt: Barion sandbox POSKey-jel teljes fizetési kör, utána éles kulcs

A `fizetes-demo.html` élesítés után is maradhat (linkelve nincs sehonnan, csak a
demó-provider használja).
