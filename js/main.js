/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, robusztus gerinc (main.js)
   A kritikus vizuál (reveal, hero, nav, sticky galéria) CSS/IO-alapú.
   A gsap CSAK degradálható extra (parallax, scrub, magnetic).
   ========================================================================== */

const reduce  = matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---- INTELLIGENS URL-EK: http(s) alatt a statikus .html linkekről lekerül a kiterjesztés
   (/termekek, /sonka, /termek/kulen). file://-en (dupla kattintás) marad a .html. ---- */
if (window.HF && HF.cleanUrl && /^https?:$/.test(location.protocol)) {
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    const c = HF.cleanUrl(h);
    if (c !== h) a.setAttribute('href', c);
  });
}
const touch   = matchMedia('(hover:none)').matches;
const hasGSAP = typeof gsap !== 'undefined';

/* ---- REVEAL (RB2): scroll-listener, sose marad ki.
   Élő lekérdezés, hogy a dinamikusan renderelt (bolt) elemek is bekerüljenek. ---- */
function runReveal() {
  const els = document.querySelectorAll('[data-reveal]:not(.in)');
  for (const el of els) {
    if (el.getBoundingClientRect().top < innerHeight * 0.92) el.classList.add('in');
  }
}
addEventListener('scroll', runReveal, { passive: true });
addEventListener('resize', runReveal, { passive: true });

/* ---- HERO belépő (RB1) + safety-net (RB8) ---- */
let heroDone = false;
function heroIn() {
  if (heroDone) return; heroDone = true;
  document.querySelector('.hero, .phero')?.classList.add('is-in');
  runReveal();
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}
addEventListener('load', () => setTimeout(heroIn, reduce ? 0 : 120));
setTimeout(heroIn, 2400); /* safety net */

/* ---- NAV (RB4): hide-on-scroll + scrolled háttér ----
   Hiszterézis: csak NAV_DELTA px egyirányú görgetés után vált, így a Lenis
   kifutó 1px-es eseményei és a touch-momentum nem villogtatják megálláskor. */
const nav = document.querySelector('.nav');
const NAV_DELTA = 14;
let lastY = 0, navAcc = 0;
function navTick() {
  const y = Math.max(0, scrollY); /* iOS overscroll-bounce ellen */
  if (nav) {
    nav.classList.toggle('nav--scrolled', y > 40);
    const d = y - lastY;
    if (document.body.classList.contains('menu-open') || y < 120) {
      nav.classList.remove('nav--hidden');
      navAcc = 0;
    } else if (d !== 0) {
      navAcc = (navAcc > 0) === (d > 0) ? navAcc + d : d; /* irányváltásnál újraindul */
      if (navAcc > NAV_DELTA && y > 260) nav.classList.add('nav--hidden');
      else if (navAcc < -NAV_DELTA) nav.classList.remove('nav--hidden');
      /* a két küszöb között az állapot NEM változik, ezért nincs villogás */
    }
    /* a sticky elemek (pl. kategória-tabsor) a látható nav ALÁ csússzanak */
    document.body.classList.toggle('nav-shown', !nav.classList.contains('nav--hidden'));
  }
  lastY = y;
}
addEventListener('scroll', navTick, { passive: true });
/* nav-magasság CSS-változóba (a tabsor offsetjéhez) */
function setNavH() {
  if (nav) document.documentElement.style.setProperty('--navh', nav.offsetHeight + 'px');
}
setNavH();
addEventListener('resize', setNavH, { passive: true });
navTick();

/* ---- Mobil menü (lenis.stop/start kötelező) ---- */
const burger = document.querySelector('.burger');
if (burger) {
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (window.lenis) { open ? window.lenis.stop() : window.lenis.start(); }
  });
  document.querySelectorAll('.mnav a').forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    if (window.lenis) window.lenis.start();
  }));
}

/* ---- COUNTER (RB5): IO + rAF ---- */
const cntIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; cntIO.unobserve(el);
    if (reduce) { el.textContent = el.dataset.count; return; }
    const end = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => cntIO.observe(el));

/* ---- STICKY „hogyan készül” galéria: IO-alapú képváltás (gsap-mentes) ---- */
const howMedia = document.querySelector('.how__media');
if (howMedia) {
  const imgs = [...howMedia.querySelectorAll('img')];
  const steps = [...document.querySelectorAll('.how__step')];
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const idx = steps.indexOf(e.target);
      if (idx < 0) return;
      imgs.forEach((im, i) => im.classList.toggle('on', i === idx));
    });
  }, { rootMargin: '-42% 0px -42% 0px' });
  steps.forEach(s => stepIO.observe(s));
  imgs[0]?.classList.add('on');
}

/* ---- GYIK accordion (K8) ---- */
document.querySelectorAll('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item');
    const open = item.classList.contains('open');
    item.closest('.faq').querySelectorAll('.faq__item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
    });
    if (!open) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});

/* ---- BEFORE/AFTER slider (natív range, gsap-mentes) ---- */
document.querySelectorAll('.ba').forEach(ba => {
  const range = ba.querySelector('.ba__range');
  if (!range) return;
  const set = v => ba.style.setProperty('--ba-x', v + '%');
  range.addEventListener('input', () => set(range.value));
  set(range.value || 50);
});

/* =========================================================================
   LENIS, helyesen: self-rAF, lenis.css a style.css-ben, overflow-x:clip
   ========================================================================= */
window.lenis = null;
if (!reduce && typeof Lenis !== 'undefined') {
  window.lenis = new Lenis({
    duration: 1.1,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });
  (function lraf(time) { window.lenis.raf(time); requestAnimationFrame(lraf); })();
  window.lenis.on('scroll', () => {
    if (hasGSAP && typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
    runReveal();
    navTick();
  });
}

/* ---- Horgony-görgetés (kategória-tabok, belső linkek) Lenis-szel ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (window.lenis) window.lenis.scrollTo(target, { offset: -86 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
});

/* =========================================================================
   Újrapróbálkozó idle-refresh (Lenis alatt kötelező, elavult pin-végek ellen)
   ========================================================================= */
let lastScrollT = 0;
addEventListener('scroll', () => { lastScrollT = performance.now(); }, { passive: true });
let refreshTries = 0;
function queueIdleRefresh() {
  if (!hasGSAP || typeof ScrollTrigger === 'undefined') return;
  if (refreshTries > 40) return;
  refreshTries++;
  const idle = performance.now() - lastScrollT > 500;
  if (idle) ScrollTrigger.refresh();
  else setTimeout(queueIdleRefresh, 600);
}
addEventListener('load', () => { setTimeout(queueIdleRefresh, 400); setTimeout(queueIdleRefresh, 2500); setTimeout(queueIdleRefresh, 6000); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(queueIdleRefresh, 200));
document.querySelectorAll('img[loading="lazy"]').forEach(im => im.addEventListener('load', () => setTimeout(queueIdleRefresh, 150), { once: true }));

/* =========================================================================
   GSAP EXTRÁK (degradálhatók)
   ========================================================================= */
if (hasGSAP && !reduce && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* Parallax képek */
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const amt = parseFloat(el.dataset.parallax) || 0.12;
    gsap.to(el, {
      yPercent: amt * 100, ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* Word-reveal statement ([data-words]) */
  document.querySelectorAll('[data-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w" style="opacity:.16">${w}</span>`).join(' ');
    gsap.to(el.querySelectorAll('.w'), {
      opacity: 1, stagger: 0.06, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'top 30%', scrub: true },
    });
  });

  /* Side-slide képek (S13) */
  gsap.utils.toArray('[data-slide]').forEach(fig => {
    const dir = fig.dataset.slide === 'right' ? 1 : -1;
    const row = fig.closest('.split') || fig;
    gsap.fromTo(fig, { xPercent: dir * 14, autoAlpha: 0 },
      { xPercent: 0, autoAlpha: 1, ease: 'none',
        scrollTrigger: { trigger: row, start: 'top 88%', end: 'top 46%', scrub: 1 } });
    const img = fig.querySelector('img');
    if (img) {
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 34%', scrub: 1 } });
    }
  });
}

/* ---- Magnetic gombok (K1), csak egér, degradálható ---- */
if (hasGSAP && !reduce && !touch) {
  document.querySelectorAll('[data-magnet]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - (r.left + r.width / 2)) * 0.32, y: (e.clientY - (r.top + r.height / 2)) * 0.32, duration: 0.5, ease: 'power3.out' });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1,0.45)' }));
  });
}
