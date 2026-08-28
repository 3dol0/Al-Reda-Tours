<div align="center">

<img src="assets/logo.jpg" alt="الرضا للرحلات" width="110" style="border-radius:16px">

# الرضا للرحلات · Al‑Reda Tours

**موقع تعريفي وحجز لشركة رحلات في المنصورة — مبني بالكامل بـ Front‑End، من غير أي باك‑إند.**

A fully static, RTL‑first landing & booking site for an Egyptian tour operator — no backend, no build step, no dependencies.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![No Backend](https://img.shields.io/badge/Backend-None-success?style=flat-square)](#)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=flat-square&logo=githubpages)](https://3dol0.github.io/Al-Reda-Tours/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

### 🌐 [عرض مباشر · Live Demo](https://3dol0.github.io/Al-Reda-Tours/)

</div>

---

## 📖 نبذة · Overview

**عربي —** موقع شركة «الرضا للرحلات» بالمنصورة. بيعرض الرحلات المتاحة ببرنامج كل رحلة وسعرها، وبيخلّي الزائر يحجز في خطوات بسيطة: يملأ بياناته، فيتحفظ الطلب محلياً في متصفحه، ويتحوّل على واتساب برسالة جاهزة فيها تفاصيل الحجز كاملة لتأكيدها مع الشركة.

**English —** A marketing + booking site for a tour company in Mansoura, Egypt. It showcases six trips with itineraries and pricing, and walks visitors through a lightweight booking flow. Because the project is intentionally **front‑end only**, the "submission" step persists the request in the visitor's own browser and hands off to WhatsApp with a pre‑filled message — no server, no database, no API keys.

---

## ✨ الميزات · Features

| | |
|---|---|
| 🎴 **كروت رحلات ثلاثية الأبعاد** | Flip cards تكشف برنامج كل رحلة بحركة 3D — وبتشتغل بالضغط على الموبايل وبالـ hover على الديسكتوب |
| 📝 **نظام حجز بالكامل من غير سيرفر** | Modal للحجز مع تحقق من المدخلات، حفظ في `localStorage`، وتحويل لواتساب برسالة جاهزة |
| 💬 **تكامل واتساب مباشر** | `wa.me` deep link بيتولد ديناميكياً من بيانات الحجز — الوسيلة الأنسب للسوق المصري |
| 🌍 **RTL عربي أصيل** | التخطيط كله `dir="rtl"` بخط Cairo، مع ضبط الاتجاه للأرقام والهواتف |
| 📱 **متجاوب بالكامل** | من 320px للشاشات الكبيرة، مع قائمة hamburger على الموبايل |
| 🔍 **SEO + مشاركة اجتماعية** | Open Graph و Twitter Cards و JSON‑LD (`TravelAgency` schema) — الرابط بيظهر بمعاينة كاملة على واتساب وفيسبوك |
| ♿ **إمكانية وصول** | `aria-*` على العناصر التفاعلية، focus rings واضحة، ودعم `prefers-reduced-motion` |
| ⚡ **أداء** | صفر dependencies، صفر build step، صور بـ `loading="lazy"` |

---

## 🛠️ التقنيات · Tech Stack

- **HTML5** — بنية دلالية، RTL، وبيانات منظمة (JSON‑LD)
- **CSS3** — Custom Properties، Grid، Flexbox، 3D transforms، media queries
- **Vanilla JavaScript (ES6+)** — من غير أي مكتبات أو أطر عمل
- **Web Storage API** — `localStorage` كطبقة تخزين محلية بديلة عن الداتابيز
- **Google Fonts** — خط Cairo

> **صفر dependencies · صفر build tools · صفر باك‑إند.** الموقع كله ٣ ملفات + مجلد صور.

---

## 📂 هيكل المشروع · Project Structure

```
Al-Reda-Tours/
├── index.html              # الصفحة الكاملة (nav, hero, trips, booking modal, footer)
├── styles.css              # كل التنسيقات — متغيرات CSS، responsive، animations
├── script.js               # منطق الحجز، القائمة، وتخزين localStorage
├── assets/
│   ├── logo.jpg            # الشعار (بيُستخدم كمان كـ favicon و og:image)
│   ├── museum.jpg          # صور الرحلات
│   ├── cairo.jpg
│   ├── alex.jpg
│   ├── fayom.jpg
│   ├── port-said.jpg
│   └── africano.jpg
├── .github/workflows/
│   └── deploy.yml          # نشر تلقائي على GitHub Pages
├── .nojekyll                # يمنع GitHub من معالجة الموقع بـ Jekyll
├── LICENSE
└── README.md
```

---

## 🚀 التشغيل · Getting Started

مافيش تثبيت ولا build — افتح الملف وخلاص:

```bash
git clone https://github.com/3dol0/Al-Reda-Tours.git
cd Al-Reda-Tours
```

ثم افتح `index.html` في المتصفح مباشرة، أو شغّل سيرفر محلي بسيط (مفضّل عشان الخطوط والمسارات):

```bash
# Python
python -m http.server 8000

# أو Node
npx serve .
```

وافتح <http://localhost:8000>.

---

## 🌐 النشر · Deployment

المشروع static بالكامل، فبيتنشر على أي استضافة ثابتة من غير أي إعدادات.

الموقع منشور فعلياً على **GitHub Pages** من فرع `gh-pages`.

الـ workflow في [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) بيعمل mirror لـ `main` على `gh-pages` مع كل push — يعني **مفيش أي خطوة يدوية**؛ ادفع على `main` والموقع بيتحدّث خلال دقيقة.

> ملاحظة: روابط GitHub Pages بتحتوي دائماً على اسم الحساب (`<account>.github.io/<repo>/`). لو عايز رابط من غير اسم الحساب، دوّر على **custom domain** أو استضافة بتسمّي المواقع باسم المشروع (Netlify / Cloudflare Pages / Vercel).

بدائل تشتغل بنفس السهولة: **Netlify**، **Vercel**، **Cloudflare Pages** — مفيش أي خطوة بناء مطلوبة.

---

## ⚙️ التخصيص · Customization

| المطلوب | المكان |
|---|---|
| تغيير رقم الواتساب | `script.js` → `CONFIG.waNumber` |
| تغيير الأسعار | `index.html` → `<span class="price-val">` |
| تعديل برنامج رحلة | `index.html` → `.back-list` جوه كارت الرحلة |
| إضافة رحلة جديدة | انسخ أي `.flip-wrapper` وعدّل محتواه + `openModal(...)` |
| تغيير الألوان | `styles.css` → `:root` (`--red`, `--gold`, `--navy`) |
| الشريط المتحرك أعلى الصفحة | `index.html` → `.eid-notice` |

---

## 🧠 ملاحظة معمارية · Architecture Note

الموقع **front‑end only** بشكل مقصود. يعني:

- ✅ استضافة مجانية على أي CDN، وسرعة تحميل عالية، وصفر تكلفة تشغيل
- ✅ مفيش سيرفر يتصان، مفيش أسرار أو مفاتيح متسربة
- ⚠️ بيانات الحجز بتتخزن في متصفح الزائر نفسه (`localStorage`) — الشركة **بتستلم الحجز فعلياً عبر رسالة الواتساب**، مش من التخزين المحلي

لو احتجت لوحة تحكم بحجوزات مركزية لاحقاً، أقرب خطوة هي ربط الفورم بخدمة form‑backend (زي Formspree) أو Google Apps Script — من غير ما تلمس بنية الموقع.

---

## 📞 التواصل · Contact

**الرضا للرحلات** — المنصورة، طلخا — شارع العراقي
📱 01007079906 · 01557464886 · ☎️ 0502531103
💬 [واتساب](https://wa.me/201007079906) · 📘 [فيسبوك](https://www.facebook.com/share/1BfTjqdxe5/?mibextid=wwXIfr) · 📍 [خرائط جوجل](https://maps.app.goo.gl/qsmkiw3TEMThn1cE9)

---

## 📄 الترخيص · License

الكود متاح تحت رخصة [MIT](LICENSE).
الشعار وصور الرحلات واسم العلامة التجارية ملك لشركة «الرضا للرحلات» ومش مشمولين بالرخصة.

<div align="center">

**صُنع بـ ❤️ في المنصورة**

</div>
