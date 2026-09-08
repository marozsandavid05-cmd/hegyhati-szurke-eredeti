/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, statikus oldal-generátor (Node, függőség nélkül)
   Futtatás a projekt gyökeréből:  node tools/gen-pages.js
   Mit csinál:
     1. 7 kategória-oldal a gyökérbe (sonka.html, szalonna.html, ... → élesben /sonka)
     2. termek/<id>.html minden termékhez (→ élesben /termek/<id>), Product JSON-LD-vel
     3. sitemap.xml tiszta (.html nélküli) URL-ekkel
     4. a kézzel írt oldalakban a <!-- @nav -->, <!-- @mnav -->, <!-- @footer ... --> blokkok
        szinkronizálása (egy helyen él a menü és a lábléc)
   Új termék/kategória után EZT kell futtatni.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'https://hegyhatifinomsagok.com';

/* ---- adatok betöltése (böngésző-globálok szimulálva) ---- */
const ctx = { window: {}, location: { protocol: 'file:' }, Intl };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data/products.js'), 'utf8'), ctx);
const HF = ctx.window.HF;
const D = ctx.window.HFDATA;
const SITE = HF.SITE;
const N = D.PRODUCTS.length;

const CART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1.2 12.2a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>';

/* ---- közös blokkok ---- */
function nav(base, current) {
  const cur = k => (k === current ? ' aria-current="page"' : '');
  return `<!-- @nav -->
<nav class="nav" aria-label="Fő navigáció">
  <a href="${base}index.html" class="nav__brand">
    <img class="nav__logo" src="${base}media/logo-hegyhati.webp" alt="" width="42" height="42">
    <span><strong>Hegyháti</strong><small>Finomságok</small></span>
  </a>
  <div class="nav__links">
    <a href="${base}index.html" class="nav__link"${cur('index')}>Főoldal</a>
    <a href="${base}termekek.html" class="nav__link"${cur('termekek')}>Termékek</a>
    <a href="${base}kiszallitas.html" class="nav__link"${cur('kiszallitas')}>Kiszállítás / Előrendelés</a>
    <a href="${base}rolunk.html" class="nav__link"${cur('rolunk')}>Történetünk</a>
    <a href="${base}kapcsolat.html" class="nav__link"${cur('kapcsolat')}>Kapcsolat</a>
  </div>
  <div class="nav__cta">
    <button class="cart-btn" id="cartBtn" aria-label="Kosár megnyitása">
      ${CART_SVG}
      <span class="cart-btn__badge" id="cartBadge">0</span>
    </button>
    <button class="burger" aria-label="Menü" aria-expanded="false"><span></span></button>
  </div>
</nav>
<!-- @/nav -->`;
}

function mnav(base) {
  return `<!-- @mnav -->
<div class="mnav">
  <a href="${base}index.html">Főoldal</a>
  <a href="${base}termekek.html">Termékek <small>${N} finomság</small></a>
  <a href="${base}kiszallitas.html">Kiszállítás <small>előrendelés</small></a>
  <a href="${base}rolunk.html">Történetünk</a>
  <a href="${base}kapcsolat.html">Kapcsolat</a>
  <div class="mnav__foot">
    ${SITE.address} · kedd-péntek 6:00-14:00 · szombat 6:00-12:00<br>
    <a href="${SITE.phoneHref}">${SITE.phone}</a>
  </div>
</div>
<!-- @/mnav -->`;
}

function footer(base, type) {
  const parts = type.split(' ');
  const full = parts[0] === 'full';
  const cta = parts.includes('cta');
  const bottom = `    <div class="footer__bottom">
      <span>© 2026 Hegyháti Finomságok · Pécs</span>
      <span>${full ? 'Kistermelői húsáruk a Pécsi Vásárcsarnokból. Minden ár tájékoztató jellegű.' : `<a href="${base}kapcsolat.html" style="color:var(--accent-soft)">Kapcsolat</a> · <a href="${SITE.phoneHref}" style="color:var(--accent-soft)" class="num-tab">${SITE.phone}</a>`}</span>
    </div>`;
  if (!full) {
    return `<!-- @footer ${type} -->
<footer class="footer" style="margin-top:0">
  <div class="wrap">
${bottom.replace('<div class="footer__bottom">', '<div class="footer__bottom" style="border-top:0">')}
  </div>
</footer>
<!-- @/footer -->`;
  }
  const ctaBlock = cta ? `    <div class="footer__cta">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:2.4rem;justify-content:space-between">
        <h2 data-reveal>Kóstolja meg, amit mi magunk készítünk.</h2>
        <a href="${base}termekek.html" class="btn btn--solid" data-magnet>Rendelek
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </div>
    </div>
` : '';
  const catLinks = D.CATEGORIES.map(c => `        <a href="${base}${c.slug}.html">${c.name}</a>`).join('\n');
  return `<!-- @footer ${type} -->
<footer class="footer"${cta ? '' : ' style="margin-top:0"'}>
  <div class="wrap">
${ctaBlock}    <div class="footer__grid"${cta ? '' : ' style="padding-top:0"'}>
      <div>
        <div class="footer__brandline">
          <div class="stamp"><img src="${base}media/logo-hegyhati.webp" alt="Hegyháti Finomságok logó" width="118" height="118"></div>
          <div>
            <strong style="font-family:var(--font-display);font-size:1.25rem">Hegyháti Finomságok</strong>
            <p style="margin-top:.3rem">Saját földből, saját kézből.</p>
          </div>
        </div>
        <p style="margin-top:1.4rem;max-width:34ch">Kistermelői kézműves húsáruk Pécsről, saját tenyésztésű állatokból, hagyományos családi receptek szerint.</p>
      </div>
      <div>
        <h4>Termékek</h4>
${catLinks}
        <a href="${base}termekek.html">Teljes kínálat</a>
      </div>
      <div>
        <h4>Információ</h4>
        <a href="${base}kiszallitas.html">Kiszállítás / Előrendelés</a>
        <a href="${base}szallitas.html">Szállítás és átvétel</a>
        <a href="${base}rolunk.html">Történetünk</a>
        <a href="${base}kapcsolat.html">Kapcsolat</a>
        <a href="${base}aszf.html">ÁSZF</a>
        <a href="${base}adatkezeles.html">Adatkezelés</a>
        <a href="${base}impresszum.html">Impresszum</a>
        <a href="${base}elallas.html">Elállási tájékoztató</a>
      </div>
      <div>
        <h4>Elérhetőség</h4>
        <p>${SITE.addressShort}</p>
        <p>${SITE.street}</p>
        <p>Kedd-péntek 6:00-14:00 · Szombat 6:00-12:00</p>
        <a href="${SITE.phoneHref}" class="num-tab">${SITE.phone}</a>
        <a href="mailto:${SITE.email}">${SITE.email}</a>
        <a href="${SITE.facebook}" target="_blank" rel="noopener">Facebook ↗</a>
      </div>
    </div>
${bottom}
  </div>
</footer>
<!-- @/footer -->`;
}

function head(base, o) {
  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>document.documentElement.className += ' js';${base ? `window.HF_BASE='${base}';` : ''}</script>
<title>${o.title} · Hegyháti Finomságok</title>
<meta name="description" content="${o.desc}">
<link rel="canonical" href="${o.canonical}">
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:title" content="${o.title} · Hegyháti Finomságok">
<meta property="og:description" content="${o.desc}">
<meta property="og:image" content="${o.ogImage || DOMAIN + '/media/stock/og-image.jpg'}">
<meta property="og:url" content="${o.canonical}">
<meta property="og:locale" content="hu_HU">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="256x256" href="${base}media/favicon.png">
<link rel="apple-touch-icon" href="${base}media/apple-touch-icon.png">
<link rel="stylesheet" href="${base}css/fonts.css">
<link rel="stylesheet" href="${base}css/style.css">
<link rel="stylesheet" href="${base}css/shop.css">
${o.extraHead || ''}</head>`;
}

function scripts(base, extra) {
  return `<script src="${base}js/vendor/gsap.min.js"></script>
<script src="${base}js/vendor/ScrollTrigger.min.js"></script>
<script src="${base}js/vendor/lenis.min.js"></script>
<script src="${base}js/config.js"></script>
<script src="${base}js/data/products.js"></script>
<script src="${base}js/main.js"></script>
<script src="${base}js/shop/cart.js"></script>
<script src="${base}js/shop/cart-drawer.js"></script>
<script src="${base}js/shop/catalog.js"></script>
${extra.map(s => `<script src="${base}${s}"></script>`).join('\n')}`;
}

const PRICE_NOTE_BLOCK = (base) => `<div class="price-note" style="margin-top:1.8rem">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>
    <span><strong>Minden ár tájékoztató jellegű.</strong> Bruttó árak, kilogrammra vetítve, a csomagolt zsírnál darabra. Mérlegelt árut adunk, ezért a kosár összege becslés. A pontos végösszeg a mérés után, átvételkor derül ki. Súlyra (0,25 kg lépésben) vagy darabra, párra is kérheti.</span>
  </div>`;

/* ---- 1. kategória-oldalak ---- */
function categoryPage(c) {
  const base = '';
  const items = D.PRODUCTS.filter(p => p.category === c.id);
  const names = items.map(p => p.name).join(', ');
  return `${head(base, {
    title: c.name,
    desc: `${c.seo} ${items.length} termék, bruttó árak Ft/kg, tájékoztató jelleggel. Rendelés a webshopból, kiszállítás előrendeléssel.`,
    canonical: `${DOMAIN}/${c.slug}`,
    ogImage: `${DOMAIN}/${c.img}`,
  })}
<body>

<div class="amb" aria-hidden="true"><div class="amb__vig"></div></div>

${nav(base, 'termekek')}

${mnav(base)}

<!-- ============ KATEGÓRIA-FEJLÉC: full-bleed szalag, rajta a cím ============ -->
<header class="cat-hero">
  <div class="cat-hero__media"><img src="${c.img}" alt="" fetchpriority="high"></div>
  <div class="wrap">
    <p class="eyebrow"><a href="termekek.html">Termékek</a></p>
    <h1 style="margin-top:1.1rem">${c.name}</h1>
    <p class="lead">${c.desc}</p>
    <p style="margin-top:.8rem;color:var(--muted);font-size:.92rem">${names}.</p>
  </div>
</header>

<!-- ============ KATEGÓRIA-SÁV (a többi kategória tiszta URL-je) ============ -->
<div class="tabs-wrap" style="margin-top:0"><div class="tabs" id="shopTabs"></div></div>

<main class="wrap" style="padding-block:1.6rem 5rem">
  ${PRICE_NOTE_BLOCK(base)}
  <div id="shopTools"></div>
  <div id="shopRoot" data-cat="${c.id}" style="margin-top:2rem">
    <noscript><p style="padding:3rem 0;color:var(--muted)">A terméklistához és a rendeléshez JavaScript szükséges. Árlistánkért hívjon minket: ${SITE.phone}.</p></noscript>
  </div>
</main>

<section class="lip">
  <div class="wrap" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:2rem">
    <div>
      <h2 style="font-size:var(--step-2)" data-reveal>Kiszállítás előrendeléssel, péntek és szombat</h2>
      <p style="color:var(--muted);margin-top:.7rem;max-width:52ch" data-reveal>Pénteken a hegyháti falvakba, szombaton Pécsre és környékére visszük, minden hónap első hetében és közepén. Vagy vegye át a Pécsi Vásárcsarnokban.</p>
    </div>
    <a href="kiszallitas.html" class="btn btn--ghost" data-magnet>Kiszállítás részletei</a>
  </div>
</section>

${footer(base, 'full')}

${scripts(base, ['js/shop/shop-page.js'])}
</body>
</html>
`;
}

/* ---- 2. termékoldalak ---- */
function productPage(p) {
  const base = '../';
  const c = D.getCategory(p.category);
  const main = D.mainPhoto(p);
  const img = main ? `${DOMAIN}/${main}` : `${DOMAIN}/media/stock/og-image.jpg`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name, description: p.desc, image: img, category: c.name,
    brand: { '@type': 'Brand', name: 'Hegyháti Finomságok' },
    offers: { '@type': 'Offer', priceCurrency: 'HUF', price: p.price, availability: 'https://schema.org/InStock',
      url: `${DOMAIN}/termek/${p.id}`,
      priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: 'HUF', unitText: p.priceUnit === 'db' ? 'darab' : 'kilogramm' },
      description: 'Az ár tájékoztató jellegű, mérlegelt áru.' },
  };
  return `${head(base, {
    title: p.name,
    desc: `${p.name}: ${p.desc} Bruttó ${HF.formatFt(p.price)}/${p.priceUnit === 'db' ? 'db' : 'kg'}, tájékoztató ár. ${c.name} a Hegyháti Finomságoktól, Pécsről.`,
    canonical: `${DOMAIN}/termek/${p.id}`,
    ogType: 'product', ogImage: img,
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n`,
  })}
<body>

<div class="amb" aria-hidden="true"><div class="amb__vig"></div></div>

${nav(base, 'termekek')}

${mnav(base)}

<main class="wrap" style="padding-top:8.6rem;padding-bottom:4rem">
  <nav class="crumbs" id="crumbs" aria-label="Morzsamenü"></nav>
  <div class="pdet" id="pdetRoot" data-id="${p.id}">
    <noscript><p style="color:var(--muted)">${p.name}, ${HF.formatFt(p.price)}/${p.priceUnit === 'db' ? 'db' : 'kg'} (tájékoztató ár). ${p.desc} A rendeléshez JavaScript szükséges, vagy hívjon minket: ${SITE.phone}.</p></noscript>
  </div>

  <section id="relatedSec" style="padding-bottom:2rem;display:none">
    <h2 style="font-size:var(--step-2);margin-bottom:1.8rem">Ugyanebből a kategóriából</h2>
    <div class="pgrid" id="relatedGrid"></div>
  </section>
</main>

<!-- Mobil sticky vásárló-sáv -->
<div class="buybar" id="buybar" aria-hidden="true">
  <span class="buybar__price num-tab" id="buybarPrice">~0 Ft</span>
  <button class="btn btn--solid btn--sm" id="buybarAdd" type="button">Kosárba</button>
</div>

${footer(base, 'mini')}

${scripts(base, ['js/shop/product-page.js'])}
</body>
</html>
`;
}

/* ---- 3. sitemap ---- */
function sitemap() {
  const urls = [
    ['/', '1.0'], ['/termekek', '0.9'],
    ...D.CATEGORIES.map(c => ['/' + c.slug, '0.8']),
    ['/kiszallitas', '0.7'], ['/szallitas', '0.6'], ['/rolunk', '0.7'], ['/kapcsolat', '0.6'],
    ...D.PRODUCTS.map(p => ['/termek/' + p.id, '0.6']),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, pr]) => `  <url><loc>${DOMAIN}${u}</loc><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
}

/* ---- 4. kézzel írt oldalak szinkronja ---- */
const CURRENT = { 'index.html': 'index', 'termekek.html': 'termekek', 'termek.html': 'termekek', 'kiszallitas.html': 'kiszallitas', 'rolunk.html': 'rolunk', 'kapcsolat.html': 'kapcsolat' };
function syncPage(file) {
  let s = fs.readFileSync(file, 'utf8');
  const name = path.basename(file);
  const current = CURRENT[name] || '';
  const base = '';
  let changed = false;

  /* első futáskor a nyers blokkokat markerrel vesszük körül */
  if (!/<!-- @nav -->/.test(s) && /<nav class="nav"/.test(s)) {
    s = s.replace(/<nav class="nav"[\s\S]*?<\/nav>/, '<!-- @nav -->\n<!-- @/nav -->');
  }
  if (!/<!-- @mnav -->/.test(s) && /<div class="mnav">/.test(s)) {
    const re = /<div class="mnav">[\s\S]*?<div class="mnav__foot">[\s\S]*?<\/div>\s*<\/div>/;
    s = re.test(s) ? s.replace(re, '<!-- @mnav -->\n<!-- @/mnav -->') : s.replace(/<div class="mnav">[\s\S]*?<\/div>/, '<!-- @mnav -->\n<!-- @/mnav -->');
  }
  if (!/<!-- @footer/.test(s) && /<footer class="footer"/.test(s)) {
    const m = s.match(/<footer class="footer"[\s\S]*?<\/footer>/);
    const type = /footer__grid/.test(m[0]) ? (/footer__cta/.test(m[0]) ? 'full cta' : 'full') : 'mini';
    s = s.replace(m[0], `<!-- @footer ${type} -->\n<!-- @/footer -->`);
  }
  const before = s;
  s = s.replace(/<!-- @nav -->[\s\S]*?<!-- @\/nav -->/, () => nav(base, current));
  s = s.replace(/<!-- @mnav -->[\s\S]*?<!-- @\/mnav -->/, () => mnav(base));
  s = s.replace(/<!-- @footer ([\w ]+) -->[\s\S]*?<!-- @\/footer -->/, (m, type) => footer(base, type.trim()));
  /* favicon egységesítés */
  s = s.replace(/<link rel="icon" type="image\/png" href="media\/logo-emblem\.png">/, '<link rel="icon" type="image/png" sizes="256x256" href="media/favicon.png">\n<link rel="apple-touch-icon" href="media/apple-touch-icon.png">');
  changed = s !== before;
  if (changed) fs.writeFileSync(file, s, 'utf8');
  return changed;
}

/* ---- futtatás ---- */
const GENERATED = new Set(D.CATEGORIES.map(c => c.slug + '.html'));
let n = 0;
for (const c of D.CATEGORIES) { fs.writeFileSync(path.join(ROOT, c.slug + '.html'), categoryPage(c), 'utf8'); n++; }
fs.mkdirSync(path.join(ROOT, 'termek'), { recursive: true });
/* elavult termékoldalak törlése */
for (const f of fs.readdirSync(path.join(ROOT, 'termek'))) {
  if (f.endsWith('.html') && !D.getProduct(f.replace(/\.html$/, ''))) fs.unlinkSync(path.join(ROOT, 'termek', f));
}
for (const p of D.PRODUCTS) { fs.writeFileSync(path.join(ROOT, 'termek', p.id + '.html'), productPage(p), 'utf8'); n++; }
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap(), 'utf8');
let synced = 0;
for (const f of fs.readdirSync(ROOT)) {
  if (!f.endsWith('.html') || GENERATED.has(f)) continue;
  if (syncPage(path.join(ROOT, f))) synced++;
}
console.log(`generált: ${n} oldal (${D.CATEGORIES.length} kategória + ${D.PRODUCTS.length} termék), sitemap.xml, szinkronizált kézi oldal: ${synced}`);
