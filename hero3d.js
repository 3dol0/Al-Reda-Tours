/* ══════════════════════════════════════════
   الرضا للرحلات — hero3d.js
   مشهد WebGL للهيرو: أهرامات وكثبان رملية وغروب شمس ونجوم ورمل طاير.
   الكاميرا بتقرّب وتطلع لفوق مع السكرول، وبتميل مع الماوس.
   بيتحمّل من script.js على الديسكتوب بس — على الموبايل أو لو حصلت
   أي مشكلة، مشهد الـ SVG اللي في index.html بيفضل هو الظاهر.
   ══════════════════════════════════════════ */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

const PALETTE = {
  fog:   0x1a2150,
  sand:  0x6e4c2c,
  stone: 0xb08850,
  sun:   0xffc45e,
  gold:  0xf5c842,
  red:   0xd42b2b,
  sky:   0x4a5aa0,
  earth: 0x2b1a10
};

const LOOK_Y = 13; /* ارتفاع النقطة اللي الكاميرا باصّة عليها — أعلى = الأفق أوطى */

/* ارتفاع الكثبان عند أي نقطة — نفس الدالة بتقعّد الأهرامات على الأرض */
function duneHeight(x, z) {
  return Math.sin(x * 0.045) * 1.4
       + Math.sin(z * 0.07 + x * 0.02) * 0.9
       + Math.sin(x * 0.13 + z * 0.05) * 0.35;
}

function makeGround() {
  const geo = new THREE.PlaneGeometry(520, 320, 130, 80);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -90);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, duneHeight(pos.getX(i), pos.getZ(i)));
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color: PALETTE.sand, roughness: 1, flatShading: true });
  return new THREE.Mesh(geo, mat);
}

function makePyramid(radius, height, x, z, material) {
  const geo = new THREE.ConeGeometry(radius, height, 4, 1);
  geo.rotateY(0.4); /* زاوية بتبيّن وشّين بإضاءة مختلفة */
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, duneHeight(x, z) + height / 2 - 0.6, z);
  return mesh;
}

/* texture دايرة ناعمة مرسومة بـ canvas — للتوهّج وحبّات الرمل */
function radialTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(function (s) { grad.addColorStop(s[0], s[1]); });
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function glowTexture() {
  return radialTexture([[0, 'rgba(255,214,120,1)'], [0.25, 'rgba(255,170,70,.55)'], [1, 'rgba(212,43,43,0)']]);
}

function makeStars(count) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const elev  = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(4, 80));
    const r = 320;
    pos[i * 3]     = Math.cos(elev) * Math.sin(theta) * r;
    pos[i * 3 + 1] = Math.sin(elev) * r;
    pos[i * 3 + 2] = Math.cos(elev) * Math.cos(theta) * r - 60;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff, size: 1.6, sizeAttenuation: false,
    transparent: true, opacity: 0.85, fog: false, depthWrite: false
  });
  return new THREE.Points(geo, mat);
}

/* رمل طاير بيتحرك مع الريح من اليمين للشمال */
function makeSand(count) {
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = THREE.MathUtils.randFloat(-45, 45);
    pos[i * 3 + 1] = THREE.MathUtils.randFloat(0.2, 12);
    pos[i * 3 + 2] = THREE.MathUtils.randFloat(-40, 30);
    speed[i] = THREE.MathUtils.randFloat(1.5, 4.5);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: PALETTE.gold, size: 0.22, transparent: true, opacity: 0.7,
    map: radialTexture([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]),
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  points.userData.speed = speed;
  return points;
}

export function initHero3D(hero, state) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PALETTE.fog, 40, 200);

  /* الكاميرا باصّة لفوق شوية عشان الأفق ينزل تحت العنوان والكلام يفضل مقروء */
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 600);
  camera.position.set(0, 3, 34);
  const look = new THREE.Vector3(0, LOOK_Y, -80);

  /* ── الأرض والأهرامات (على الجناب — مش ورا العنوان) ── */
  scene.add(makeGround());
  const stone = new THREE.MeshStandardMaterial({ color: PALETTE.stone, roughness: 0.9, flatShading: true });
  scene.add(makePyramid(17, 20, -34, -66, stone));
  scene.add(makePyramid(13, 15.5, 22, -92, stone));
  scene.add(makePyramid(6, 7, 40, -60, stone));

  /* ── الشمس على اليمين ورا الأهرامات (نصها غاطس ورا الأفق) ── */
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(14, 32, 16),
    new THREE.MeshBasicMaterial({ color: PALETTE.sun, fog: false })
  );
  sun.position.set(95, 2, -300);
  scene.add(sun);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true
  }));
  glow.scale.set(190, 190, 1);
  glow.position.copy(sun.position);
  scene.add(glow);

  /* ── الإضاءة: شمس دافية من ورا + لمسة أحمر ودهبي من قدّام (ألوان البراند) ── */
  scene.add(new THREE.HemisphereLight(PALETTE.sky, PALETTE.earth, 0.6));
  const sunLight = new THREE.DirectionalLight(0xffb060, 2.4);
  sunLight.position.set(95, 14, -200);
  scene.add(sunLight);
  const goldFill = new THREE.DirectionalLight(0xffc070, 1.3);
  goldFill.position.set(60, 25, 30);
  scene.add(goldFill);
  const redFill = new THREE.DirectionalLight(PALETTE.red, 0.35);
  redFill.position.set(-40, 12, 40);
  scene.add(redFill);

  const stars = makeStars(1200);
  scene.add(stars);
  const sand = makeSand(600);
  scene.add(sand);

  /* ── المقاس ── */
  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  /* ── الحركة ── */
  const clock = new THREE.Clock();
  const camGoal  = new THREE.Vector3();
  const lookGoal = new THREE.Vector3();
  const sandPos  = sand.geometry.attributes.position;
  const sandSpeed = sand.userData.speed;
  let raf = 0;
  let first = true;

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t  = clock.elapsedTime;
    const k  = 1 - Math.exp(-dt * 4); /* تنعيم ثابت مهما كان الـ frame rate */

    /* السكرول بيقرّب الكاميرا ويطلّعها — والماوس بيميّلها */
    camGoal.set(state.mx * 3, 3 + state.hp * 5 - state.my * 1, 34 - state.hp * 24);
    camera.position.lerp(camGoal, k);
    lookGoal.set(state.mx * 2, LOOK_Y - state.hp * 8 + state.my * 1.5, -80);
    look.lerp(lookGoal, k);
    camera.lookAt(look);

    for (let i = 0; i < sandPos.count; i++) {
      let x = sandPos.getX(i) - sandSpeed[i] * dt;
      if (x < -45) x = 45;
      sandPos.setX(i, x);
      sandPos.setY(i, sandPos.getY(i) + Math.sin(t * 2 + i) * 0.004);
    }
    sandPos.needsUpdate = true;
    stars.material.opacity = 0.75 + Math.sin(t * 1.3) * 0.1;

    renderer.render(scene, camera);
    if (first) {
      first = false;
      hero.classList.add('is-webgl');
    }
  }

  /* الرسم بيقف لما الهيرو يخرج من الشاشة — مفيش استهلاك على الفاضي */
  new IntersectionObserver(function (entries) {
    const visible = entries[entries.length - 1].isIntersecting;
    if (visible && !raf) {
      clock.getDelta();
      frame();
    } else if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }).observe(hero);
}
