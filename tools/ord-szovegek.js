/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, rendelés-kapcsolós szövegek a kézi oldalakban
   --------------------------------------------------------------------------
   Minden tétel: { file, key, on, off }
     on  = FLAGS.ORDERING:true  (online rendelés, kosár, pénztár): az eredeti szöveg
     off = FLAGS.ORDERING:false (telefonos és e-mailes rendelés, helyben vásárlás)
   A kézi oldalakban a szöveg <!-- @ord kulcs --> ... <!-- @/ord --> között áll,
   a gen-pages.js a kapcsoló szerint az egyiket írja be.
   Első bekötés: node tools/ord-jeloles.js (az "on" szöveget körbeveszi a jelölővel),
   utána mindig: node tools/gen-pages.js
   ========================================================================== */
module.exports = function ordTexts(SITE) {
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const PHONE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>';
  const MAIL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
  const TEL_BTN = `<a href="${SITE.phoneHref}" class="btn btn--solid num-tab" data-magnet aria-label="Rendelés telefonon: ${SITE.phone}">${PHONE_SVG}${SITE.phone}</a>`;
  const MAIL_BTN = `<a href="mailto:${SITE.email}" class="btn btn--ghost" data-magnet>${MAIL_SVG}Rendelés e-mailben</a>`;
  const LINK = 'style="color:var(--accent-soft);text-decoration:underline;text-underline-offset:3px"';

  return [
    /* ---- főoldal ---- */
    { file: 'index.html', key: 'idx-og',
      on: '<meta property="og:description" content="Kézműves füstölt áruk, kolbászok, sonkák, szalámik egy pécsi kistermelő házaspártól. Rendeljen a webshopból, kiszállítás előrendeléssel péntek és szombat.">',
      off: '<meta property="og:description" content="Kézműves füstölt áruk, kolbászok, sonkák, szalámik egy pécsi kistermelő házaspártól. Rendeljen telefonon, kiszállítás előrendeléssel péntek és szombat.">' },
    { file: 'index.html', key: 'idx-kiszallitas',
      on: 'Rendeljen a webshopból vagy telefonon, mi pedig hűtve, frissen hozzuk.',
      off: 'Rendeljen telefonon vagy e-mailben, mi pedig hűtve, frissen hozzuk.' },
    { file: 'index.html', key: 'idx-nyitvatartas',
      on: 'Vagy rendeljen a webshopból: pénteken',
      off: 'Vagy rendeljen telefonon: pénteken' },

    /* ---- kapcsolat ---- */
    { file: 'kapcsolat.html', key: 'kap-cta-szoveg',
      on: 'Rendeljen a webshopból, kiszállítjuk előrendeléssel:',
      off: 'Rendeljen telefonon vagy e-mailben, kiszállítjuk előrendeléssel:' },
    { file: 'kapcsolat.html', key: 'kap-cta-gomb',
      on: `<a href="termekek.html" class="btn btn--solid" data-magnet>Rendelek\n      ${ARROW}</a>`,
      off: `<div style="display:flex;flex-wrap:wrap;gap:1rem">${TEL_BTN}${MAIL_BTN}</div>` },

    /* ---- rólunk ---- */
    { file: 'rolunk.html', key: 'rol-kezbol',
      on: 'A pultnál mi állunk, a rendelésnél mi hívjuk vissza.',
      off: 'A pultnál mi állunk, a telefonos rendelést is mi vesszük fel.' },
    { file: 'rolunk.html', key: 'rol-cta',
      on: 'vagy rendeljen, és kiszállítjuk előrendeléssel.',
      off: 'vagy rendeljen telefonon, és kiszállítjuk előrendeléssel.' },

    /* ---- kiszállítás ---- */
    { file: 'kiszallitas.html', key: 'kis-lead',
      on: 'Kérjük, rendeljen előre a webshopban vagy telefonon, a többit mi intézzük.',
      off: 'Kérjük, rendeljen előre telefonon vagy e-mailben, a többit mi intézzük.' },
    { file: 'kiszallitas.html', key: 'kis-gombok',
      on: `<a href="termekek.html" class="btn btn--solid" data-magnet>Rendelek a webshopból\n      ${ARROW}</a>\n    <a href="${SITE.phoneHref}" class="btn btn--ghost num-tab" data-magnet>${SITE.phone}</a>`,
      off: `${TEL_BTN}\n    ${MAIL_BTN}` },
    { file: 'kiszallitas.html', key: 'kis-telefon',
      on: 'Telefonon vagy a webshopban. A rendelés után visszahívjuk, pontosítjuk a súlyokat, a végösszeget és a kiszállítás napját.',
      off: 'Telefonon vagy e-mailben. Rendeléskor egyeztetjük a súlyokat, a becsült végösszeget és a kiszállítás napját, e-mailes rendelésnél visszahívjuk.' },
    { file: 'kiszallitas.html', key: 'kis-lepes1',
      on: 'A webshopban súlyra (0,25 kg lépésben) vagy darabra, párra teszi kosárba, amit szeretne. Minden ár tájékoztató jellegű.',
      off: `A <a href="termekek.html" ${LINK}>termékeink</a> között megnézi, mit kér, súlyra (0,25 kg lépésben) vagy darabra, párra. Minden ár tájékoztató jellegű.` },
    { file: 'kiszallitas.html', key: 'kis-lepes2',
      on: '<h3 class="vrow__title">Települést választ</h3>\n        <p class="vrow__desc">A pénztárban kiválasztja a települését, a rendszer mutatja, melyik napon jövünk, és mennyi a szállítási díj.</p>',
      off: `<h3 class="vrow__title">Felhív minket</h3>\n        <p class="vrow__desc">Telefonon (<a href="${SITE.phoneHref}" class="num-tab" ${LINK}>${SITE.phone}</a>) vagy e-mailben elmondja, mit kér, és melyik településre vigyük. Megmondjuk, melyik napon megyünk, és mennyi a szállítási díj.</p>` },

    /* ---- szállítás és átvétel ---- */
    { file: 'szallitas.html', key: 'atvetel-nap',
      on: 'Rendelésnél megjelöli, melyik napon jön, mi pedig előkészítjük. A pultnál csak a rendelés-azonosítót kell mondania.',
      off: 'Telefonos rendelésnél megbeszéljük, melyik napon jön, mi pedig előkészítjük. A pultnál elég a nevét mondania.' },
    { file: 'szallitas.html', key: 'sz-lepes1',
      on: 'Összeállítja a kosarát a webshopban, megadja az elérhetőségét, és elküldi a rendelést.',
      off: 'Felhív minket vagy e-mailt ír: elmondja, mit kér, és hogy a pultnál veszi át, vagy kiszállítást kér.' },
    { file: 'szallitas.html', key: 'sz-lepes2',
      on: '<h3 class="vrow__title">Visszahívás</h3>\n        <p class="vrow__desc">Telefonon visszahívjuk: pontosítjuk a súlyokat, a végösszeget és az átvétel vagy a kiszállítás napját. Mérlegelt árut adunk, ezért a webshopban látott összeg becslés, az árak tájékoztató jellegűek.</p>',
      off: '<h3 class="vrow__title">Egyeztetés</h3>\n        <p class="vrow__desc">Telefonon pontosítjuk a súlyokat, a becsült végösszeget és az átvétel vagy a kiszállítás napját. Mérlegelt árut adunk, ezért a rendeléskor mondott összeg becslés, az árak tájékoztató jellegűek.</p>' },
    { file: 'szallitas.html', key: 'sz-lepes3',
      on: 'vákuumcsomagolást is kérhet a megjegyzésben.',
      off: 'vákuumcsomagolást is kérhet rendeléskor.' },
    { file: 'szallitas.html', key: 'sz-gyik-visszahivas',
      on: 'Mikor hívnak vissza a rendelésem után?',
      off: 'Mikor hívnak vissza, ha e-mailt írok?' },
    { file: 'szallitas.html', key: 'sz-gyik-becsult-kerdes',
      on: 'Miért becsült ár szerepel a kosárban?',
      off: 'Miért csak becsült árat mondanak rendeléskor?' },
    { file: 'szallitas.html', key: 'sz-gyik-becsult-valasz',
      on: 'Minden ár tájékoztató jellegű: a kosárban kg-alapú (darabnál becsült súlyú) becslést lát, a pontos végösszeg a mérés után derül ki. Ezt a visszahíváskor egyeztetjük,',
      off: 'Minden ár tájékoztató jellegű: rendeléskor kg-alapú (darabnál becsült súlyú) becslést mondunk, a pontos végösszeg a mérés után derül ki. Ezt telefonon egyeztetjük,' },
    { file: 'szallitas.html', key: 'sz-gyik-kiszallitas',
      on: 'Kérjük, rendeljen előre a webshopban vagy telefonon, a pontos időpontot visszahíváskor egyeztetjük.',
      off: 'Kérjük, rendeljen előre telefonon vagy e-mailben, a pontos időpontot telefonon egyeztetjük.' },
    { file: 'szallitas.html', key: 'sz-gyik-fizetes',
      on: 'Átvételkor készpénzzel vagy bankkártyával, az üzletben és a kiszállításnál is. Az online bankkártyás fizetés hamarosan érkezik, jelenleg bemutató módban látható a pénztárban.',
      off: 'Átvételkor készpénzzel vagy bankkártyával, az üzletben és a kiszállításnál is.' },
    { file: 'szallitas.html', key: 'sz-cta',
      on: `<h2 style="font-size:var(--step-3);max-width:18ch" data-reveal>Állítsa össze a kosarát, a többit intézzük</h2>\n    <a href="termekek.html" class="btn btn--solid" data-magnet>Termékeink\n      ${ARROW}</a>`,
      off: `<h2 style="font-size:var(--step-3);max-width:18ch" data-reveal>Hívjon minket, a többit intézzük</h2>\n    <div style="display:flex;flex-wrap:wrap;gap:1rem">${TEL_BTN}${MAIL_BTN}</div>` },

    /* ---- ÁSZF (csak a rendelés módja változik, a jogi tartalom nem) ---- */
    { file: 'aszf.html', key: 'aszf-targy',
      on: 'A hegyhatifinomsagok.com webshopban kistermelői húskészítmények rendelhetők.',
      off: 'Kistermelői húskészítményeink az üzletünkben vásárolhatók, valamint telefonon vagy e-mailben rendelhetők.' },
    { file: 'aszf.html', key: 'aszf-becsles',
      on: 'a kosárban és a rendelés-összesítőben szereplő összeg <strong>becslés</strong>',
      off: 'a rendeléskor közölt összeg <strong>becslés</strong>' },
    { file: 'aszf.html', key: 'aszf-menet',
      on: '<li>A termékek kosárba helyezése (súlyra, 0,25 kg lépésben, vagy darabra, párra megadott mennyiséggel, adott esetben csípős/csemege vagy szeletelési opcióval).</li>\n    <li>A pénztár oldalon az átvételi mód (bolti átvétel vagy kiszállítás előrendeléssel), a kapcsolattartási adatok és a fizetési mód megadása.</li>\n    <li>A rendelés elküldése után telefonos egyeztetés (súlyok, végösszeg, időpont).</li>',
      off: `<li>A rendelés leadása telefonon (${SITE.phone}) vagy e-mailben (${SITE.email}): a termékek és a mennyiség megadása (súlyra, 0,25 kg lépésben, vagy darabra, párra, adott esetben csípős/csemege vagy szeletelési opcióval).</li>\n    <li>Az átvételi mód (bolti átvétel vagy kiszállítás előrendeléssel) és a kapcsolattartási adatok megadása.</li>\n    <li>Telefonos egyeztetés (súlyok, végösszeg, időpont), e-mailes rendelésnél visszahívással.</li>` },
    { file: 'aszf.html', key: 'atvetel-nap',
      on: 'Rendelésnél megjelöli, melyik napon jön, mi pedig előkészítjük. A pultnál csak a rendelés-azonosítót kell mondania.',
      off: 'Telefonos rendelésnél megbeszéljük, melyik napon jön, mi pedig előkészítjük. A pultnál elég a nevét mondania.' },
    { file: 'aszf.html', key: 'aszf-fizetes',
      on: 'Fizetés átvételkor készpénzzel vagy bankkártyával. Online bankkártyás fizetés: a Barion Payment Zrt. rendszerén keresztül, a Barion-szerződés megkötése után; a bankkártya-adatok a kereskedőhöz nem jutnak el.',
      off: 'Fizetés átvételkor készpénzzel vagy bankkártyával.' },

    /* ---- adatkezelés ---- */
    { file: 'adatkezeles.html', key: 'adat-helyi',
      on: '<h2>3. Helyi tárolás (kosár)</h2>\n  <p>A webshop a kosár tartalmát és az utolsó rendelés összesítőjét kizárólag az Ön böngészőjének helyi tárolójában (localStorage) tartja. Ezek az adatok a mi szerverünkre a rendelés elküldéséig nem kerülnek át, és a böngésző adatainak törlésével eltávolíthatók.',
      off: '<h2>3. Helyi tárolás</h2>\n  <p>A weboldal rendelési adatot nem tárol az Ön böngészőjében, a rendelés telefonon vagy e-mailben érkezik hozzánk.' },

    /* ---- elállás, impresszum ---- */
    { file: 'elallas.html', key: 'ela-termekek',
      on: 'Webshopunk termékei (friss és füstölt húskészítmények)',
      off: 'Termékeink (friss és füstölt húskészítmények)' },
    { file: 'impresszum.html', key: 'imp-minta',
      on: 'kitöltésre várnak, a webshop élesítése előtt kötelezően pótolandók.',
      off: 'kitöltésre várnak, és kötelezően pótolandók.' },
  ];
};
