/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, termékkatalógus
   Árak: a 2026.08.24-i bolti árlista szerint, bruttó Ft/kg (a zsír csomagolt: Ft/db).
   MINDEN ÁR TÁJÉKOZTATÓ JELLEGŰ (mérlegelt áru), a UI mindenhol jelzi.
   --------------------------------------------------------------------------
   Mezők:
     category  : 'sonka' | 'szalonna' | 'kolbasz' | 'szalami' | 'pacolt-hus' | 'teperto' | 'majas'
     animal    : 'sertes' | 'mangalica' | 'marha' | 'bivaly'  (szűrő)
     priceUnit : 'kg' (alap) | 'db' (csomagolt, fix darabár)
     weight    : kg-lépésköz (0,25 kg, az ügyfél kérése)
     piece     : darabra/párra vétel: { label:'db'|'pár', kg: becsült darabsúly, max } vagy null
                 (a kg értékek BECSLÉSEK a becsült árhoz, a bolt pontosítja méréskor)
     photos    : ['media/products/<file>', ...] első = fő kép; a -thumb változat a kártyán
                 ha nincs photos: brand-csempe „Fotó hamarosan" (fotó kérése az ügyféltől)
     options   : spice (választható ízesítés/fajta) + sliceable (szeletelve kérhető)
   Új termék: egy blokk ide + képek + `node tools/gen-pages.js` (statikus termékoldal).
   ========================================================================== */

const CATEGORIES = [
  { id: 'sonka',      slug: 'sonka',      name: 'Sonka',      img: 'media/stock/kat-sonka.webp',
    desc: 'Sózva, érlelve, füstölve. A comb legszebb részei, vékonyra szeletelve is kérhető.',
    seo: 'Füstölt és érlelt sonkák saját tenyésztésű sertésből és mangalicából, Pécsről. Szívsonka, mangalica sonka, comb hús.' },
  { id: 'szalonna',   slug: 'szalonna',   name: 'Szalonna',   img: 'media/stock/kat-marha.webp',
    desc: 'Angol, császár, kenyér és toka. Sütni, pirítani, vagy csak úgy, friss kenyérre.',
    seo: 'Kézműves szalonnák: angol szalonna, császárszalonna, mangalica szalonna, kenyérszalonna, paprikás főtt tokaszalonna. Pécsi Vásárcsarnok.' },
  { id: 'kolbasz',    slug: 'kolbasz',    name: 'Kolbász',    img: 'media/stock/kat-kolbasz.webp',
    desc: 'Kézzel töltve, csípős vagy csemege. Mellette a friss hurka, ahogy a disznótorban.',
    seo: 'Házi kolbász csípős és csemege változatban, sütőkolbász, véres és húsos hurka. Saját tenyésztésből, Pécsről.' },
  { id: 'szalami',    slug: 'szalami',    name: 'Szalámi',    img: 'media/stock/kat-mangalica.webp',
    desc: 'Stifolder, kulen, borókás. Lassan érlelt rudak, rúdban vagy szeletelve.',
    seo: 'Érlelt szalámik: stifolder sertésből, mangalicából, marhából és bivalyból, kulen, borókás stifolder. Kézműves, pécsi.' },
  { id: 'pacolt-hus', slug: 'pacolt-hus', name: 'Pácolt hús', img: 'media/stock/kat-fustolt.webp',
    desc: 'Csülök, tarja, karaj, oldalas. Pácolva, bükkfán füstölve, türelemmel érlelve.',
    seo: 'Pácolt és füstölt húsok: füstölt csülök, füstölt karaj és tarja, érlelt tarja, érlelt marha comb, füstölt oldalas. Pécsről.' },
  { id: 'teperto',    slug: 'teperto',    name: 'Tepertő',    img: 'media/stock/kat-egyeb.webp',
    desc: 'Csipszes és hagyományos tepertő, mellé házi sertés- és mangalicazsír.',
    seo: 'Házi tepertő: csipszes tepertő, hagyományos tepertő, sertészsír és mangalica zsír. Kistermelői, Pécs.' },
  { id: 'majas',      slug: 'majas',      name: 'Májas',      img: 'media/stock/kat-majas.webp',
    desc: 'A ház kenhető büszkesége, saját családi recept szerint.',
    seo: 'Paraszt májas saját recept szerint, kistermelői húsbolt, Pécsi Vásárcsarnok.' },
];

const ANIMALS = [
  { id: 'sertes',    name: 'Sertés' },
  { id: 'mangalica', name: 'Mangalica' },
  { id: 'marha',     name: 'Marha' },
  { id: 'bivaly',    name: 'Bivaly' },
];

const STEP = 0.25;
const W_DEFAULT = { min: 0.25, step: STEP, max: 5, default: 0.5 };
const W_BIG     = { min: 0.5,  step: STEP, max: 6, default: 1 };
const W_SMALL   = { min: 0.25, step: STEP, max: 3, default: 0.25 };

const PRODUCTS = [
  /* ---------------- SONKA ---------------- */
  { id: 'mangalica-sonka', name: 'Mangalica sonka', category: 'sonka', animal: 'mangalica', price: 5000,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/mangalica-sonka-szalonna.webp'],
    desc: 'Az őshonos mangalica combja, sózva és hosszan érlelve. Íze mélyebb, zsírja selymesebb a megszokottnál. Vékony szeletekben olvad az ember száján.' },
  { id: 'szivsonka', name: 'Szívsonka', category: 'sonka', animal: 'sertes', price: 4500,
    weight: W_DEFAULT, piece: null, featured: true, options: { spice: null, sliceable: true },
    photos: ['media/products/szivsonka.webp'],
    desc: 'A comb legszebb, legtömörebb része, sózva és érlelve. Vékonyra szeletelve is kérhető, jelezze a megjegyzésben.' },
  { id: 'comb-hus', name: 'Comb hús', category: 'sonka', animal: 'sertes', price: 5000,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/comb-hus.webp'],
    desc: 'Színhús a combból, pácolva és füstölve. Kevés zsír, sok íz. Szendvicsbe vékonyan, rakott ételbe vastagabban.' },

  /* ---------------- SZALONNA ---------------- */
  { id: 'mangalica-szalonna', name: 'Mangalica szalonna', category: 'szalonna', animal: 'mangalica', price: 6400,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/mangalica-szalonna.webp'],
    desc: 'Mangalicából, füstölve. A zsírja nem tömör, hanem olvadó, ezért kenyérre, sütéshez és pirításhoz egyaránt kiváló.' },
  { id: 'angol-szalonna', name: 'Angol szalonna', category: 'szalonna', animal: 'sertes', price: 4200,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/angol-szalonna.webp', 'media/products/angol-szalonna-2.webp', 'media/products/angol-szalonna-3.webp'],
    desc: 'Húsos, füstölt szalonna sütéshez és pirításhoz. Reggeli tojás mellé vagy egy jó házi burger koronájának.' },
  { id: 'csaszar-szalonna', name: 'Császárszalonna', category: 'szalonna', animal: 'sertes', price: 4500,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/csaszar-szalonna.webp', 'media/products/csaszar-szalonna-2.webp', 'media/products/csaszar-szalonna-3.webp'],
    desc: 'Rétegesen húsos, fűszeres kérgű császár. Ropogósra sütve, kenyérre vagy lencsefőzelékbe. A klasszikus, ahogy lennie kell.' },
  { id: 'mangalica-angol-szalonna', name: 'Mangalica angol szalonna', category: 'szalonna', animal: 'mangalica', price: 4000,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/mangalica-angol-szalonna.webp'],
    desc: 'Angol szalonna mangalicából. Több íz, lágyabb zsír, serpenyőben ropogósra sül. Aki egyszer kipróbálta, nehezen vált vissza.' },
  { id: 'kenyerszalonna', name: 'Kenyérszalonna', category: 'szalonna', animal: 'sertes', price: 3200,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: false },
    photos: ['media/products/kenyerszalonna.webp'],
    desc: 'A szalonnasütések főszereplője. Nyárson, parázs felett csepegtetve hagymás kenyérre, vagy egyszerűen a zsírjáért.' },
  { id: 'paprikas-tokaszalonna', name: 'Paprikás főtt tokaszalonna', category: 'szalonna', animal: 'sertes', price: 2300,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/paprikas-tokaszalonna.webp', 'media/products/paprikas-tokaszalonna-2.webp', 'media/products/paprikas-tokaszalonna-3.webp'],
    desc: 'Lassan főtt tokaszalonna, paprikás-fokhagymás bundában. Puha, omlós, fűszeres. Friss kenyérrel és lilahagymával az igazi.' },
  { id: 'sult-csaszar', name: 'Sült császár', category: 'szalonna', animal: 'sertes', price: 3900,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/sult-csaszar.webp'],
    desc: 'Ropogós kérgű, fűszeres sült császár, készen. Csak szeletelni kell, hidegen vagy langyosan, friss kenyérrel, savanyúsággal.' },

  /* ---------------- KOLBÁSZ ---------------- */
  { id: 'sertes-kolbasz', name: 'Sertéskolbász', category: 'kolbasz', animal: 'sertes', price: 4000,
    weight: W_DEFAULT, piece: { label: 'pár', kg: 0.5, max: 10 }, featured: true, options: { spice: ['csemege', 'csípős'], sliceable: false },
    photos: ['media/products/sertes-kolbasz.webp', 'media/products/sertes-kolbasz-2.webp', 'media/products/sertes-kolbasz-3.webp'],
    desc: 'Kézzel töltött, füstölt kolbász, csemege vagy csípős fűszerezéssel. Reggelihez, vacsorához, útravalónak. Párban vagy súlyra.' },
  { id: 'sutokolbasz', name: 'Sütőkolbász', category: 'kolbasz', animal: 'sertes', price: 3800,
    weight: W_DEFAULT, piece: { label: 'pár', kg: 0.4, max: 10 }, featured: false, options: { spice: null, sliceable: false },
    photos: ['media/products/sutokolbasz.webp'],
    desc: 'Frissen a sütőbe vagy serpenyőbe. Hagymás tört burgonyával, mustárral. Egyszerű, becsületes vacsora, ahogy régen.' },
  { id: 'hurka', name: 'Hurka', category: 'kolbasz', animal: 'sertes', price: 2300,
    weight: W_DEFAULT, piece: { label: 'pár', kg: 0.5, max: 10 }, featured: true, options: { spice: ['húsos', 'véres'], spiceLabel: 'Fajta', sliceable: false },
    photos: ['media/products/hurka.webp'],
    desc: 'Húsos és véres hurka, frissen, készlet szerint. Bő zsírban ropogósra sütve, hagymás tört burgonyával. A disznótor lelke.' },

  /* ---------------- SZALÁMI ---------------- */
  { id: 'mangalica-stifolder', name: 'Mangalica stifolder', category: 'szalami', animal: 'mangalica', price: 6300,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.7, max: 6 }, featured: true, options: { spice: ['csemege', 'csípős'], sliceable: true },
    photos: ['media/products/mangalica-stifolder.webp', 'media/products/mangalica-stifolder-2.webp', 'media/products/mangalica-stifolder-3.webp'],
    desc: 'Lassan érlelt stifolder mangalicából, csemege vagy csípős. Vastagabb szemcséjű, gazdag fűszerezésű, szeletelve is kérhető.' },
  { id: 'sertes-stifolder', name: 'Sertés stifolder', category: 'szalami', animal: 'sertes', price: 5500,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.7, max: 6 }, featured: false, options: { spice: ['csemege', 'csípős'], sliceable: true },
    photos: ['media/products/sertes-stifolder.webp', 'media/products/sertes-stifolder-2.webp', 'media/products/sertes-stifolder-3.webp'],
    desc: 'A baranyai svábok öröksége: vastag, lassan érlelt, paprikás szalámiféle. Csemege vagy csípős, mindkettő a türelem íze.' },
  { id: 'kulen', name: 'Kulen', category: 'szalami', animal: 'sertes', price: 6000,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.9, max: 4 }, featured: true, options: { spice: null, sliceable: true },
    photos: ['media/products/kulen.webp', 'media/products/kulen-2.webp', 'media/products/kulen-3.webp'],
    desc: 'Vastagra töltött, hónapokig érlelt, paprikás kulen. Nagy, szabálytalan szeletek, tömény íz. Ünnepi asztalra, vendégnek.' },
  { id: 'borokas-feltet', name: 'Borókás feltét', category: 'szalami', animal: 'sertes', price: 5000,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.5, max: 6 }, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/borokas-feltet.webp'],
    desc: 'Saját különlegességünk: borókával fűszerezett, érlelt feltét. Erdei, karakteres íz, vékonyan szeletelve kenyérre, sajt mellé.' },
  { id: 'borokas-stifolder', name: 'Borókás stifolder', category: 'szalami', animal: 'sertes', price: 6000,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.7, max: 6 }, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/borokas-stifolder.webp', 'media/products/borokas-stifolder-2.webp', 'media/products/borokas-stifolder-3.webp'],
    desc: 'Stifolder borókával, paprika nélkül. Fehér nemespenészes héj, sötét, érlelt hús, a boróka illata. Sehol máshol nem kapja.' },
  { id: 'marha-stifolder', name: 'Marha stifolder', category: 'szalami', animal: 'marha', price: 7000,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.7, max: 6 }, featured: true, options: { spice: ['csemege', 'csípős'], sliceable: true },
    photos: ['media/products/marha-stifolder.webp', 'media/products/marha-stifolder-2.webp', 'media/products/marha-stifolder-3.webp'],
    desc: 'Saját tartású marhából érlelt stifolder, ritkaság a maga nemében. Mély, karakteres íz, csemege vagy csípős, szeletelve is.' },
  { id: 'bivaly-stifolder', name: 'Bivaly stifolder', category: 'szalami', animal: 'bivaly', price: 7000,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.7, max: 6 }, featured: false, options: { spice: ['csemege', 'csípős'], sliceable: true },
    photos: ['media/products/bivaly-stifolder.webp'],
    desc: 'Bivalyhúsból érlelt stifolder, csemege vagy csípős. Sötétebb, szikárabb, vadabb karakter, mint a sertésé. Igazi kuriózum.' },

  /* ---------------- PÁCOLT HÚS ---------------- */
  { id: 'fustolt-elso-csulok', name: 'Füstölt első csülök', category: 'pacolt-hus', animal: 'sertes', price: 2800,
    weight: W_BIG, piece: { label: 'db', kg: 1.0, max: 4 }, featured: false, options: { spice: null, sliceable: false },
    photos: ['media/products/fustolt-elso-csulok.webp'],
    desc: 'Kisebb, első csülök, pácolva és füstölve. Bablevesbe, csülökpörköltbe. A füst mélysége a kész ételben is érződik.' },
  { id: 'fustolt-hatso-csulok', name: 'Füstölt hátsó csülök', category: 'pacolt-hus', animal: 'sertes', price: 3500,
    weight: W_BIG, piece: { label: 'db', kg: 1.4, max: 4 }, featured: false, options: { spice: null, sliceable: false },
    photos: ['media/products/fustolt-hatso-csulok.webp'],
    desc: 'A húsosabb, hátsó csülök, bükkfán füstölve. Egészben sütve, pékné módra, vagy káposztával. Egy csülök, egy vasárnap.' },
  { id: 'fustolt-karaj', name: 'Füstölt karaj', category: 'pacolt-hus', animal: 'sertes', price: 4800,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/fustolt-karaj.webp', 'media/products/fustolt-karaj-2.webp', 'media/products/fustolt-karaj-3.webp'],
    desc: 'Sovány, pácolt karaj, füstölve. Hidegen vékonyra szelve reggelihez, vagy rakott ételbe. Szeletelve is kérhető.' },
  { id: 'fustolt-tarja', name: 'Füstölt tarja', category: 'pacolt-hus', animal: 'sertes', price: 4800,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/fustolt-tarja.webp', 'media/products/fustolt-tarja-2.webp', 'media/products/fustolt-tarja-3.webp'],
    desc: 'Márványos tarja, pácolva és füstölve. Szaftosabb a karajnál, főzve és hidegen egyaránt megállja a helyét.' },
  { id: 'erlelt-tarja', name: 'Érlelt tarja', category: 'pacolt-hus', animal: 'sertes', price: 5200,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/erlelt-tarja.webp'],
    desc: 'Tarja sóban és fűszerben, heteken át érlelve. Tömörebb, koncentráltabb íz, papírvékonyra szeletelve az igazi.' },
  { id: 'erlelt-marha-comb', name: 'Érlelt marha comb', category: 'pacolt-hus', animal: 'marha', price: 8000,
    weight: W_DEFAULT, piece: null, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/erlelt-marha-comb.webp', 'media/products/erlelt-marha-comb-2.webp', 'media/products/erlelt-marha-comb-3.webp'],
    desc: 'Saját tartású marha combja, borsos kéregben, hosszan érlelve. Sötét, szikár, mély ízű. A pult egyik legnemesebb darabja.' },
  { id: 'fustolt-oldalas', name: 'Füstölt oldalas', category: 'pacolt-hus', animal: 'sertes', price: 2800,
    weight: W_BIG, piece: null, featured: false, options: { spice: null, sliceable: false },
    photos: ['media/products/fustolt-oldalas.webp'],
    desc: 'Pácolva, majd füstölve. Sütőben ropogósra sütve vagy töltött káposztába. A csonton érlelt hús íze semmihez sem fogható.' },
  { id: 'fustolt-csont', name: 'Füstölt csont', category: 'pacolt-hus', animal: 'sertes', price: 450,
    weight: W_BIG, piece: null, featured: false, options: { spice: null, sliceable: false },
    photos: null,
    desc: 'Füstölt csont levesalapnak. Bableves, lencseleves, káposztaleves. Ettől lesz a leves igazán füstös és testes.' },
  { id: 'toltott-fustolt-szuzpecsenye', name: 'Töltött füstölt szűzpecsenye', category: 'pacolt-hus', animal: 'sertes', price: 3800,
    weight: W_DEFAULT, piece: { label: 'db', kg: 0.5, max: 4 }, featured: false, options: { spice: null, sliceable: true },
    photos: ['media/products/toltott-szupecsenye.webp'],
    desc: 'Szűzpecsenye házi töltelékkel, füstölve. A töltelék a szezon szerint változhat, érdemes rákérdezni. Ünnepi asztalra való.' },

  /* ---------------- TEPERTŐ ---------------- */
  { id: 'csipszes-teperto', name: 'Csipszes tepertő', category: 'teperto', animal: 'sertes', price: 9000,
    weight: W_SMALL, piece: null, featured: true, options: { spice: null, sliceable: false },
    photos: ['media/products/teperto-chips.webp'],
    desc: 'Vékonyra sütött, üvegropogós tepertő. Sörkorcsolyának, salátára morzsolva vagy csak úgy, marokból. Veszélyesen fogyós.' },
  { id: 'hagyomanyos-teperto', name: 'Hagyományos tepertő', category: 'teperto', animal: 'sertes', price: 5500,
    weight: W_SMALL, piece: null, featured: false, options: { spice: null, sliceable: false },
    photos: ['media/products/hagyomanyos-teperto.webp'],
    desc: 'Ahogy a disznótorban készül: omlós, szaftos tepertő. Friss kenyérre kenve, lilahagymával, maga a gyerekkor.' },
  { id: 'sertes-zsir', name: 'Sertészsír', category: 'teperto', animal: 'sertes', price: 990,
    weight: W_BIG, piece: null, featured: false, options: { spice: null, sliceable: false },
    photos: null,
    desc: 'Házi sertészsír, a tepertősütés tiszta terméke. Sütéshez, zsíros kenyérhez, a nagymama konyhájához.' },
  { id: 'mangalica-zsir-1kg', name: 'Mangalica zsír, 1 kg', category: 'teperto', animal: 'mangalica', price: 1300, priceUnit: 'db',
    weight: null, piece: { label: 'db', kg: 1.0, max: 10 }, featured: false, options: { spice: null, sliceable: false },
    photos: null,
    desc: 'Mangalicazsír, 1 kilós kiszerelésben. Lágyabb, tisztább ízű a hagyományos sertészsírnál. Sütéshez, kenyérre.' },
  { id: 'mangalica-zsir-05kg', name: 'Mangalica zsír, 0,5 kg', category: 'teperto', animal: 'mangalica', price: 650, priceUnit: 'db',
    weight: null, piece: { label: 'db', kg: 0.5, max: 10 }, featured: false, options: { spice: null, sliceable: false },
    photos: null,
    desc: 'Mangalicazsír, fél kilós kiszerelésben. Ugyanaz a lágy, tiszta íz, kisebb adagban.' },

  /* ---------------- MÁJAS ---------------- */
  { id: 'parasztmajas', name: 'Paraszt májas', category: 'majas', animal: 'sertes', price: 3600,
    weight: W_SMALL, piece: { label: 'db', kg: 0.4, max: 6 }, featured: true, options: { spice: null, sliceable: false },
    photos: ['media/products/parasztmajas.webp'],
    desc: 'Kenhető, sűrű, fűszeres májas, a ház egyik büszkesége. Pirítósra vastagon, savanyúsággal mellé. Saját recept, sehol máshol.' },
];

function getProduct(id) { return PRODUCTS.find(p => p.id === id) || null; }
function getCategory(id) { return CATEGORIES.find(c => c.id === id) || null; }
function getAnimal(id) { return ANIMALS.find(a => a.id === id) || null; }
/* fő kép + thumb útvonal (HF_BASE nélkül, azt a hívó adja hozzá) */
function mainPhoto(p) { return p.photos && p.photos.length ? p.photos[0] : null; }
function thumbPhoto(p) { const m = mainPhoto(p); return m ? m.replace(/\.webp$/, '-thumb.webp') : null; }
/* ékezet-független kereséshez */
function normalize(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function searchIndex(p) {
  const cat = getCategory(p.category), an = getAnimal(p.animal);
  return normalize([p.name, p.desc, cat ? cat.name : '', an ? an.name : '', (p.options.spice || []).join(' ')].join(' '));
}

window.HFDATA = { CATEGORIES, ANIMALS, PRODUCTS, STEP, getProduct, getCategory, getAnimal, mainPhoto, thumbPhoto, normalize, searchIndex };
