/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, bolt-oldalak
   - termekek.html: minden kategória szekciókban + sticky tabsor (scrollspy) + keresés/szűrő
   - kategória-oldalak (sonka.html, szalonna.html, ...): #shopRoot[data-cat] → csak az adott
     kategória rácsa, a sticky sáv a többi kategóriára linkel, keresés a kategórián belül.
   ========================================================================== */
(function () {
  const root = document.getElementById('shopRoot');
  const tabsEl = document.getElementById('shopTabs');
  const toolsEl = document.getElementById('shopTools');
  if (!root || !window.HFDATA || !window.HFCAT) return;

  const catId = root.dataset.cat || null;
  const cat = catId ? HFDATA.getCategory(catId) : null;
  /* fajta-oldal (/mangalica-szalonna): a kategórián belül egy fajta, saját URL-en */
  const animalId = (root.dataset.animal && HFDATA.getAnimal(root.dataset.animal)) ? root.dataset.animal : null;

  /* ---- render ---- */
  if (cat) {
    const items = HFDATA.PRODUCTS.filter(p => p.category === cat.id && (!animalId || p.animal === animalId));
    root.innerHTML =
      '<div class="pgrid">' + items.map(p => HFCAT.card(p)).join('') + '</div>' +
      '<p class="shop-empty is-hidden">Nincs ilyen termék ebben a kategóriában. <a href="' + HF.link('termekek.html') + '">Keresés a teljes kínálatban</a></p>';
  } else {
    root.innerHTML = HFDATA.CATEGORIES.map(c => {
      const items = HFDATA.PRODUCTS.filter(p => p.category === c.id);
      return '' +
        '<section class="cat-sec" id="kat-' + c.id + '" style="padding-block:2.2rem 3.4rem">' +
          '<div class="cat-head">' +
            '<img src="' + HF.asset(c.img) + '" alt="" loading="lazy">' +
            '<div class="cat-head__body">' +
              '<h2><a href="' + HF.link(c.slug + '.html') + '">' + c.name + '</a></h2>' +
              '<p>' + c.desc + '</p>' +
              '<a class="cat-head__count" href="' + HF.link(c.slug + '.html') + '">' + items.length + ' termék ' + HFCAT.ARROW + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="pgrid">' + items.map(p => HFCAT.card(p)).join('') + '</div>' +
        '</section>';
    }).join('') +
    '<p class="shop-empty is-hidden">Nincs találat. Próbáljon rövidebb szót, vagy vegye ki a szűrőt.</p>';
  }
  HFCAT.bindQuickAdd(root);

  /* ---- keresés + szűrő ---- */
  if (toolsEl) {
    const catAnimals = cat ? HFDATA.animalsInCategory(cat.id) : null;
    /* kategória-oldalon a fajta-csipek LINKEK: minden kombinációnak saját, hirdethető URL-je van */
    let animalLinks = null;
    if (cat && catAnimals) {
      animalLinks = { '': HF.link(cat.slug + '.html') };
      catAnimals.forEach(a => {
        const cb = HFDATA.getCombo(cat.id, a);
        if (cb) animalLinks[a] = HF.link(cb.slug + '.html');
      });
    }
    /* a teljes kínálat oldalán: ha fajta-szűrő aktív, a kategória-fejlécek a fajta-oldalra visznek */
    function syncCatLinks(animal) {
      HFDATA.CATEGORIES.forEach(c => {
        const sec = document.getElementById('kat-' + c.id);
        if (!sec) return;
        const cb = animal ? HFDATA.getCombo(c.id, animal) : null;
        const href = HF.link((cb ? cb.slug : c.slug) + '.html');
        sec.querySelectorAll('.cat-head h2 a, .cat-head__count').forEach(a => a.setAttribute('href', href));
        const cnt = sec.querySelector('.cat-head__count');
        if (cnt) cnt.innerHTML = sec.querySelectorAll('.pcard:not(.is-hidden)').length + ' termék ' + HFCAT.ARROW;
      });
    }
    HFCAT.mountTools(toolsEl, root, {
      placeholder: cat ? ('Keresés a(z) ' + (animalId ? HFDATA.getCombo(cat.id, animalId).name : cat.name).toLowerCase() + ' termékek között…') : 'Keresés a termékek között…',
      animals: catAnimals,
      animalLinks: animalLinks,
      currentAnimal: animalId || '',
      onApply: cat ? null : function (shown, state) { syncCatLinks(state.animal); },
    });
  }

  /* ---- sticky sáv ---- */
  if (tabsEl) {
    if (cat) {
      /* fajta-oldalon a kategória-sáv viszi tovább a fajtát, ha van olyan kombináció */
      const tabHref = c => {
        const cb = animalId ? HFDATA.getCombo(c.id, animalId) : null;
        return HF.link((cb ? cb.slug : c.slug) + '.html');
      };
      tabsEl.innerHTML = '<a class="tab" href="' + HF.link('termekek.html') + '">Összes</a>' +
        HFDATA.CATEGORIES.map(c => '<a class="tab' + (c.id === cat.id ? ' on' : '') + '" href="' + tabHref(c) + '"' + (c.id === cat.id ? ' aria-current="page"' : '') + '>' + c.name + '</a>').join('') +
        '<span class="tabs__ind" aria-hidden="true"></span>';
      const ind = tabsEl.querySelector('.tabs__ind');
      const on = tabsEl.querySelector('.tab.on');
      const place = () => { if (on) { ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px'; } };
      place(); addEventListener('resize', place, { passive: true });
      if (on && on.offsetLeft + on.offsetWidth > tabsEl.clientWidth) tabsEl.scrollTo({ left: on.offsetLeft - 24 });
    } else {
      tabsEl.innerHTML = HFDATA.CATEGORIES.map(c =>
        '<a class="tab" href="#kat-' + c.id + '" data-cat="' + c.id + '" role="tab">' + c.name + '</a>').join('')
        + '<span class="tabs__ind" aria-hidden="true"></span>';
      const ind = tabsEl.querySelector('.tabs__ind');
      const tabs = [...tabsEl.querySelectorAll('.tab')];

      function moveInd(tab) {
        if (!tab) return;
        tabs.forEach(t => t.classList.toggle('on', t === tab));
        ind.style.left = tab.offsetLeft + 'px';
        ind.style.width = tab.offsetWidth + 'px';
        const tl = tab.offsetLeft, tr = tl + tab.offsetWidth;
        if (tl < tabsEl.scrollLeft || tr > tabsEl.scrollLeft + tabsEl.clientWidth) {
          tabsEl.scrollTo({ left: tl - 24, behavior: 'smooth' });
        }
      }
      moveInd(tabs[0]);
      addEventListener('resize', () => moveInd(tabsEl.querySelector('.tab.on')), { passive: true });

      tabs.forEach(tab => tab.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById('kat-' + tab.dataset.cat);
        if (!target) return;
        if (window.lenis) window.lenis.scrollTo(target, { offset: -172 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }));

      const spy = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          const id = en.target.id.replace('kat-', '');
          moveInd(tabs.find(t => t.dataset.cat === id));
        });
      }, { rootMargin: '-22% 0px -62% 0px' });
      document.querySelectorAll('.cat-sec').forEach(s => spy.observe(s));

      /* #kat-xxx horgony betöltéskor (a régi termekek.html#kat-... linkek) */
      if (location.hash && location.hash.indexOf('#kat-') === 0) {
        const target = document.querySelector(location.hash);
        if (target) setTimeout(() => target.scrollIntoView(), 60);
      }
    }
  }

  /* a dinamikusan beszúrt [data-reveal] elemek azonnali ellenőrzése */
  dispatchEvent(new Event('scroll'));
})();
