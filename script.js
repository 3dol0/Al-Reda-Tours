/* ══════════════════════════════════════════
   الرضا للرحلات — script.js
   موقع front-end بالكامل — من غير أي سيرفر أو باك-إند.
   الحجوزات بتتحفظ محلياً في متصفح الزائر، والتأكيد بيتم عبر واتساب.
   ══════════════════════════════════════════ */

/* ── CONFIG ── */
const CONFIG = {
  waNumber:  '201007079906',   /* رقم الواتساب بالكود الدولي */
  storageKey:'alreda_bookings' /* مفتاح التخزين في localStorage */
};

/* ══ DATABASE (localStorage) ══
   مفيش قاعدة بيانات على سيرفر — البيانات بتتحفظ في متصفح الزائر بس.
   ────────────────────────────── */
function getDB() {
  try { return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]'); }
  catch (e) { return []; }
}

function saveDB(data) {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(data)); }
  catch (e) { /* التخزين ممكن يكون مقفول في وضع التصفح الخفي */ }
}

function addBooking(record) {
  const db = getDB();
  record.id   = Date.now();
  record.date = new Date().toLocaleString('ar-EG');
  db.push(record);
  saveDB(db);
  return record;
}

/* ══ MOBILE NAV ══ */
function toggleNav() {
  const links  = document.getElementById('navLinks');
  const toggle = document.getElementById('navToggle');
  const isOpen = links.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
}

function closeNav() {
  const links  = document.getElementById('navLinks');
  const toggle = document.getElementById('navToggle');
  links.classList.remove('open');
  toggle.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'فتح القائمة');
}

/* قفل القائمة بعد اختيار أي لينك */
document.querySelectorAll('#navLinks a').forEach(function (link) {
  link.addEventListener('click', closeNav);
});

/* ══ MODAL STATE ══ */
let currentTrip = {};

function openModal(tripName, icon, dest) {
  currentTrip = { tripName, icon, dest };

  document.getElementById('modalTitle').textContent    = 'احجز — ' + tripName;
  document.getElementById('modalTripName').textContent = tripName;
  document.getElementById('modalTripDest').textContent = '📍 ' + dest;
  document.getElementById('modalIcon').textContent     = icon;

  /* reset form */
  document.getElementById('inputName').value  = '';
  document.getElementById('inputPhone').value = '';
  document.getElementById('inputCount').value = '1';
  document.getElementById('inputNotes').value = '';
  document.getElementById('modalFormSection').style.display = 'block';
  document.getElementById('modalSuccess').classList.remove('show');

  document.getElementById('bookingModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('inputName').focus();
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* قفل المودال بالضغط على الخلفية */
document.getElementById('bookingModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

/* قفل المودال والقائمة بزرار Escape */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  closeModal();
  closeNav();
});

/* ══ SUBMIT BOOKING ══ */
function submitBooking() {
  const name  = document.getElementById('inputName').value.trim();
  const phone = document.getElementById('inputPhone').value.trim();
  const count = document.getElementById('inputCount').value || '1';
  const notes = document.getElementById('inputNotes').value.trim();

  if (!name)                       { alert('من فضلك ادخل اسمك'); return; }
  if (!phone || phone.length < 10) { alert('من فضلك ادخل رقم موبايل صحيح'); return; }

  /* حفظ محلي في المتصفح */
  addBooking({
    name, phone, count, notes,
    trip: currentTrip.tripName,
    dest: currentTrip.dest
  });

  /* تجهيز رسالة واتساب جاهزة */
  const msg = encodeURIComponent(
    `مرحباً، أنا ${name} \nعايز أحجز: ${currentTrip.icon} ${currentTrip.tripName}\nعدد الأفراد: ${count}\nرقم موبايلي: ${phone}${notes ? '\nملاحظات: ' + notes : ''}`
  );
  const waUrl = `https://wa.me/${CONFIG.waNumber}?text=${msg}`;

  /* لينك احتياطي لو المتصفح منع الفتح التلقائي */
  document.getElementById('waLink').href = waUrl;

  /* تحويل مباشر على واتساب.
     ملاحظة: ممنوع نمرر 'noopener' كـ window feature لأن المتصفح ساعتها
     بيرجّع null حتى لو الفتح نجح — وكنا هنفتح واتساب مرتين. */
  const waWin = window.open(waUrl, '_blank');
  if (waWin) { waWin.opener = null; }
  else       { window.location.href = waUrl; }

  /* شاشة التأكيد — فيها زرار احتياطي لو واتساب ما اتفتحش */
  document.getElementById('modalFormSection').style.display = 'none';
  document.getElementById('modalSuccess').classList.add('show');
}

/* ══ FOOTER YEAR ══ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ══════════════════════════════════════════
   SCROLL 3D — حركة ثلاثية الأبعاد مع السكرول
   كل الحركة بتتعمل في CSS عن طريق variables بيحدّثها
   listener واحد للسكرول (مرة واحدة كل فريم بـ rAF).
   لو الزائر مفعّل "تقليل الحركة" من جهازه، مفيش أي حركة خالص.
   ══════════════════════════════════════════ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const motion = { hp: 0, mx: 0, my: 0 }; /* حالة مشتركة مع مشهد الـ WebGL في hero3d.js */

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

/* ══ REVEAL: العناصر بتظهر بحركة 3D أول ما تدخل الشاشة ══ */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    /* العناصر اللي بتدخل مع بعض بتظهر ورا بعض بفرق بسيط */
    let k = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--d', (k++ * 90) + 'ms');
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { io.observe(el); });
}

/* ══ SCROLL VARS: --p لكل سكشن فيه data-scroll + --sp للصفحة كلها ══
   data-scroll="top" → من 0 (أول السكشن فوق الشاشة) لـ 1 (السكشن خرج من فوق)
   data-scroll       → من 0 (داخل من تحت) لـ 1 (خارج من فوق) */
function initScrollVars() {
  const root    = document.documentElement;
  const nav     = document.querySelector('nav');
  const hero    = document.querySelector('.hero');
  const tracked = Array.prototype.slice.call(document.querySelectorAll('[data-scroll]'));
  const steps   = document.querySelectorAll('.book-step');
  let ticking = false;

  /* نفس معادلة --bp في styles.css: الخطوة بتنوّر لما الأتوبيس يوصلها */
  function lightSteps(p) {
    const bp = clamp01((p - 0.2) / 0.45);
    steps.forEach(function (step, i) {
      step.classList.toggle('lit', bp >= (i + 0.35) / steps.length);
    });
  }

  function update() {
    ticking = false;
    const vh  = window.innerHeight;
    const max = root.scrollHeight - vh;
    root.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
    nav.classList.toggle('scrolled', window.scrollY > 10);

    tracked.forEach(function (el) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return; /* بعيد عن الشاشة — مش محتاج تحديث */
      const p = el.dataset.scroll === 'top'
        ? clamp01(-r.top / r.height)
        : clamp01((vh - r.top) / (vh + r.height));
      el.style.setProperty('--p', p.toFixed(4));
      if (el === hero) motion.hp = p;
      if (el.classList.contains('book')) lightSteps(p);
    });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
}

/* ══ HERO POINTER: المشهد بيميل مع الماوس (ديسكتوب) أو مع ميل الموبايل ══ */
function initHeroPointer() {
  const hero = document.querySelector('.hero');
  let raf = 0;

  function apply() {
    raf = 0;
    hero.style.setProperty('--mx', motion.mx.toFixed(3));
    hero.style.setProperty('--my', motion.my.toFixed(3));
  }
  function queue() { if (!raf) raf = requestAnimationFrame(apply); }

  if (finePointer) {
    hero.addEventListener('pointermove', function (e) {
      const r = hero.getBoundingClientRect();
      motion.mx = (e.clientX - r.left) / r.width * 2 - 1;
      motion.my = (e.clientY - r.top) / r.height * 2 - 1;
      queue();
    });
    hero.addEventListener('pointerleave', function () {
      motion.mx = 0;
      motion.my = 0;
      queue();
    });
  } else if ('DeviceOrientationEvent' in window) {
    /* على iOS محتاج إذن من المستخدم فمش هيشتغل — والمشهد بيفضل ثابت عادي */
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || motion.hp >= 1) return;
      motion.mx = Math.max(-1, Math.min(1, e.gamma / 30));
      motion.my = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      queue();
    });
  }
}

/* ══ CARD TILT: الكارت بيميل ناحية الماوس مع لمعة (ديسكتوب بس) ══ */
function initCardTilt() {
  if (!finePointer) return;
  document.querySelectorAll('.flip-wrapper').forEach(function (card) {
    let rect = null;
    /* بنحسب المقاس مرة واحدة أول ما الماوس يدخل — قبل ما الكارت يميل */
    card.addEventListener('pointerenter', function () { rect = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', function (e) {
      if (!rect) rect = card.getBoundingClientRect();
      const x = clamp01((e.clientX - rect.left) / rect.width);
      const y = clamp01((e.clientY - rect.top) / rect.height);
      card.style.setProperty('--ty', ((x - 0.5) * 14).toFixed(2) + 'deg');
      card.style.setProperty('--tx', ((0.5 - y) * 10).toFixed(2) + 'deg');
      card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      rect = null;
      card.style.removeProperty('--tx');
      card.style.removeProperty('--ty');
    });
  });
}

/* ══ COUNTERS: أرقام الهيرو بتعدّ من صفر ══
   الرقم النهائي بيفضل في الصفحة (شفاف) عشان المقاس مايتغيرش والصف مايتنطش،
   والعدّاد بيترسم فوقه من data-now (شوف .stat-num.counting في styles.css) */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(function (el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const start  = performance.now() + 450; /* بعد ما صف الأرقام يظهر */
    el.dataset.now = '0' + suffix;
    el.classList.add('counting');
    function tick(now) {
      const k = clamp01((now - start) / 1400);
      el.dataset.now = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(tick);
      else el.classList.remove('counting');
    }
    requestAnimationFrame(tick);
  });
}

/* ══ HERO 3D: مشهد WebGL على الديسكتوب بس — بيتحمّل بعد ما الصفحة تخلص ══ */
function loadHero3D() {
  if (!finePointer || window.innerWidth < 900) return;
  if (navigator.connection && navigator.connection.saveData) return;

  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!gl) return;
  const lose = gl.getExtension('WEBGL_lose_context');
  if (lose) lose.loseContext();

  function start() {
    import('./hero3d.js')
      .then(function (m) { m.initHero3D(document.querySelector('.hero'), motion); })
      .catch(function () { /* لو الـ CDN مش متاح، مشهد الـ SVG بيفضل ظاهر */ });
  }
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
  else setTimeout(start, 600);
}

if (!reduceMotion) {
  window.motionStarted = true;
  document.documentElement.classList.add('motion-ready');
  initReveal();
  initScrollVars();
  initHeroPointer();
  initCardTilt();
  initCounters();
  if (document.readyState === 'complete') loadHero3D();
  else window.addEventListener('load', loadHero3D);
}
