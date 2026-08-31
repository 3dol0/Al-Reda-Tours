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
