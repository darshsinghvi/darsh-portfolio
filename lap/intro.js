// One lap of Silverstone that plays before the main site, then hands over to it.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TRACK } from './track.js';
import { buildCar } from './car.js?v=2';

const root = document.getElementById('intro');

const SECTORS = [
  { id: 'education', s: 'S1', name: 'Education', color: '#ff3b2f', range: [0, 0.17] },
  { id: 'experience', s: 'S2', name: 'Experience', color: '#ffd23f', range: [0.17, 0.6] },
  { id: 'about', s: 'S3', name: 'About', color: '#3fd982', range: [0.6, 0.8] },
  { id: 'awards', s: 'S4', name: 'Awards', color: '#b47cff', range: [0.8, 1] },
];
const sectionAt = (t) => SECTORS.find((s) => t >= s.range[0] && t < s.range[1]) || SECTORS[0];
const BOARDS = [[0.0, 'EDUCATION'], [0.17, 'EXPERIENCE'], [0.6, 'ABOUT'], [0.7, 'CONTACT'], [0.8, 'PODIUM']];

/* Pop-ups that appear as the car reaches each part of the story */
const POPS = [
  { f: 0.015, tag: 'S1 · Education', html: `<h3>Carnegie Mellon University</h3><p class="i-meta">B.S. Business, additional major in Mathematics · Expected May 2030</p><p class="i-line">CMU Quant Club, Math Club, Scottie Ventures, Poker Club</p>` },
  { f: 0.09, tag: 'S1 · Education', html: `<h3>Garnet Valley High School</h3><p class="i-meta">Valedictorian · 4.30 weighted, 4.00 unweighted · June 2026</p><p class="i-line">Marching Band, Science Olympiad, FBLA, Finance Club, NHS</p>` },
  { f: 0.175, tag: 'S2 · Experience', html: `<h3><i class="i-tyre i-tyre-s">S</i>Introductory Finance Society</h3><p class="i-meta">Trade pitch · Oct 2026</p><span class="i-result">P1 · 1st place</span><p class="i-line">Long Mosaic / short CF options spreads, priced with Black-Scholes and 400,000 Monte Carlo runs.</p>` },
  { f: 0.23, tag: 'S2 · Experience', html: `<h3><i class="i-tyre i-tyre-s">S</i>CMU MSCF Trading Competition</h3><p class="i-meta">Quantitative trading competitor · Sep 2026</p><span class="i-result">1st / 170+ · Most Active Trader</span><p class="i-line">Built a trading bot for two simulated markets with execution and risk controls.</p>` },
  { f: 0.285, tag: 'S2 · Experience', html: `<h3><i class="i-tyre i-tyre-s">S</i>Susquehanna International Group</h3><p class="i-meta">Quantitative Trading Discovery Program · 2026</p><span class="i-result">Selected · first-year cohort</span><p class="i-line">Probability, expected value and market structure at a global market maker.</p>` },
  { f: 0.34, tag: 'S2 · Experience', html: `<h3><i class="i-tyre i-tyre-m">M</i>AI and ML Research</h3><p class="i-meta">Lead researcher · Northeastern University · 2024–2025</p><span class="i-result">5 models benchmarked</span><p class="i-line">FinBERT, FinGPT, GPT, RoBERTa and LLaMA on financial sentiment.</p>` },
  { f: 0.395, tag: 'S2 · Experience', html: `<h3><i class="i-tyre i-tyre-m">M</i>Baymont by Wyndham</h3><p class="i-meta">Finance and operations intern · 2024–2025</p><span class="i-result">+9.3% room revenue</span><p class="i-line">Dynamic pricing models and ROI analyses behind $520,000 of investment decisions.</p>` },
  { f: 0.45, tag: 'S2 · Experience', html: `<h3><i class="i-tyre i-tyre-m">M</i>Venture Starters and GoAhead Ventures</h3><p class="i-meta">Venture capital intern · 2022–Present</p><span class="i-result">~100 pitches screened</span><p class="i-line">Market potential, competitive position and key risks, summarized for senior review.</p>` },
  { f: 0.5, tag: 'S2 · Leadership', html: `<h3><i class="i-tyre i-tyre-h">H</i>Future Business Leaders of America</h3><p class="i-meta">Region president · 2022–Present</p><span class="i-result">15+ schools · 1,000+ members</span><p class="i-line">Ran a 700+ attendee conference and raised $2,000+ in sponsorships.</p>` },
  { f: 0.55, tag: 'S2 · Leadership', html: `<h3><i class="i-tyre i-tyre-h">H</i>Catalyst Business Advising Service</h3><p class="i-meta">Founder and president · 2023–Present</p><span class="i-result">15+ businesses · 4 countries</span><p class="i-line">A 40+ member team doing pro bono financial modeling and pitch decks.</p>` },
  { f: 0.605, tag: 'S3 · About', html: `<h3>In the paddock</h3><p class="i-line">I like problems with a little uncertainty in them.</p><ul class="i-chips"><li class="i-hot">Formula 1</li><li>NFL</li><li>Running</li><li>Ping pong</li><li>Tennis</li><li>Poker</li></ul><ul class="i-chips"><li>Python</li><li>pandas</li><li>Java</li><li>C++</li><li>Bloomberg</li></ul>` },
  { f: 0.7, tag: 'Box, box', html: `<h3>Let’s talk</h3><p class="i-line">A good question, a trade idea or an F1 take. Send it my way.</p><div class="i-actions"><a class="i-button" href="mailto:contact.darshsinghvi@gmail.com">Email me</a><a class="i-button ghost" href="https://www.linkedin.com/in/darshsinghvi" target="_blank" rel="noreferrer">LinkedIn</a></div>` },
  { f: 0.8, tag: 'S4 · Awards', html: `<h3>Podium</h3>
      <div class="i-podium">
        <div class="i-step i-p2"><p><b>CMU MSCF Trading</b><span class="i-gap purple">1st / 170+</span></p><i>2</i></div>
        <div class="i-step i-p1"><p><b>FBLA National Champion</b><span class="i-gap purple">1st / ~500</span></p><i>1</i></div>
        <div class="i-step i-p3"><p><b>Science Olympiad</b><span class="i-gap green">1st, 1st, 3rd</span></p><i>3</i></div>
      </div>` },
];
const CORNERS = [[0.042, 'Abbey'], [0.133, 'Farm'], [0.15, 'Village'], [0.2, 'The Loop'], [0.23, 'Aintree'], [0.365, 'Brooklands'], [0.385, 'Luffield'], [0.465, 'Woodcote'], [0.592, 'Copse'], [0.627, 'Maggotts'], [0.67, 'Becketts'], [0.698, 'Chapel'], [0.852, 'Stowe'], [0.885, 'Vale'], [0.945, 'Club'], [1.042, 'Abbey']];

/* ---------- Renderer ---------- */
const canvas = root.querySelector('.i-scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  window.dispatchEvent(new Event('lap:finish'));
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const BG = new THREE.Color('#0c0d0f');
scene.background = BG;
scene.fog = new THREE.Fog(BG, 120, 900);

const camera = new THREE.PerspectiveCamera(55, 1, 0.5, 9000);

scene.add(new THREE.HemisphereLight(0xcfd8ff, 0x0b0b0c, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 200 });
scene.add(sun, sun.target);

/* ---------- Track ---------- */
const curve = (() => {
  const rough = new THREE.CatmullRomCurve3(TRACK.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
  let pts = rough.getSpacedPoints(480); pts.pop();
  for (let pass = 0; pass < 4; pass++) {
    pts = pts.map((p, i) => {
      const a = pts[(i - 1 + pts.length) % pts.length]; const b = pts[(i + 1) % pts.length];
      return new THREE.Vector3((a.x + 2 * p.x + b.x) / 4, 0, (a.z + 2 * p.z + b.z) / 4);
    });
  }
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
})();
const LAP = curve.getLength();
const N = 2400;
const frames = [];
for (let i = 0; i <= N; i++) {
  const t = i / N;
  const p = curve.getPointAt(t % 1);
  const tan = curve.getTangentAt(t % 1).setY(0).normalize();
  const right = new THREE.Vector3(-tan.z, 0, tan.x);
  frames.push({ p, tan, right });
}
// Corner sharpness for kerbs
const bend = frames.map((_, i) => {
  const a = frames[(i - 6 + N) % N].tan; const b = frames[(i + 6) % N].tan;
  return Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
});

function ribbon(from, to, y, color, filter = () => true, colorFn = null) {
  const pos = []; const col = [];
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    if (!filter(i)) continue;
    const A = frames[i]; const B = frames[i + 1];
    const a0 = A.p.clone().addScaledVector(A.right, from); const a1 = A.p.clone().addScaledVector(A.right, to);
    const b0 = B.p.clone().addScaledVector(B.right, from); const b1 = B.p.clone().addScaledVector(B.right, to);
    [a0, a1, b0, b0, a1, b1].forEach((v) => pos.push(v.x, y, v.z));
    c.set(colorFn ? colorFn(i) : color);
    for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, side: THREE.DoubleSide }));
  m.receiveShadow = true;
  scene.add(m);
  return m;
}
const HALF = 7.5;
ribbon(-HALF - 6, HALF + 6, 0.02, '#16181b');                       // run-off
ribbon(-HALF, HALF, 0.06, '#26282d');                               // asphalt
ribbon(-HALF, -HALF + 0.35, 0.08, '#e9e9e9');                       // edge lines
ribbon(HALF - 0.35, HALF, 0.08, '#e9e9e9');
const kerb = (i) => bend[i] > 0.18;
const stripe = (i) => (Math.floor(i / 2) % 2 ? '#e8352a' : '#f2f2f2');
ribbon(-HALF - 1.6, -HALF, 0.1, null, kerb, stripe);
ribbon(HALF, HALF + 1.6, 0.1, null, kerb, stripe);
// Sector colour strips just outside the run-off, so the lap reads at a glance
const secColor = (i) => { const t = i / N; return t < 0.3 ? '#7a2a24' : t < 0.54 ? '#7a6a24' : t < 0.79 ? '#4f3a7a' : '#245a3c'; };
ribbon(HALF + 6, HALF + 6.8, 0.04, null, () => true, secColor);

// Sector outlines that only show from the air, one colour per section
const sectorLines = SECTORS.map((s) => {
  const m = ribbon(-16, 16, 0.3, s.color, (i) => i / N >= s.range[0] && i / N < s.range[1]);
  m.material = new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0, depthWrite: false, depthTest: false, side: THREE.DoubleSide });
  m.renderOrder = 10; m.visible = false;
  return m;
});

// Barriers: low walls with alternating panels and a white cap
function wall(offset, h) {
  const pos = []; const col = []; const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const A = frames[i].p.clone().addScaledVector(frames[i].right, offset);
    const B = frames[i + 1].p.clone().addScaledVector(frames[i + 1].right, offset);
    const quad = (y0, y1, hex) => {
      [[A, y0], [B, y0], [A, y1], [A, y1], [B, y0], [B, y1]].forEach(([v, y]) => pos.push(v.x, y, v.z));
      c.set(hex); for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
    };
    quad(0, h, Math.floor(i / 6) % 2 ? '#2a2c31' : '#33353b');
    quad(h, h + 0.15, '#d9d9d9');
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }));
  m.castShadow = true; m.receiveShadow = true; scene.add(m);
}
wall(HALF + 9, 1.1);
wall(-(HALF + 9), 1.1);

// Floodlight poles every ~120 m
{
  const count = Math.floor(LAP / 120);
  const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 14, 6);
  const headGeo = new THREE.BoxGeometry(1.6, 0.5, 0.6);
  const poles = new THREE.InstancedMesh(poleGeo, poleMat0(), count);
  const heads = new THREE.InstancedMesh(headGeo, new THREE.MeshStandardMaterial({ color: '#fff6e0', emissive: '#fff1cc', emissiveIntensity: 1.4 }), count);
  const m = new THREE.Matrix4(); const q = new THREE.Quaternion();
  for (let k = 0; k < count; k++) {
    const fr = frames[Math.floor((k / count) * N)];
    const side = k % 2 ? 1 : -1;
    const base = fr.p.clone().addScaledVector(fr.right, side * (HALF + 11));
    m.compose(base.clone().setY(7), q, new THREE.Vector3(1, 1, 1)); poles.setMatrixAt(k, m);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(fr.tan.x, fr.tan.z));
    m.compose(base.clone().setY(14.2), q, new THREE.Vector3(1, 1, 1)); heads.setMatrixAt(k, m);
    q.identity();
  }
  scene.add(poles, heads);
}
function poleMat0() { return new THREE.MeshStandardMaterial({ color: '#3a3c42', roughness: 0.6, metalness: 0.4 }); }

// Start / finish chequer
{
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32;
  const x = cv.getContext('2d');
  for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#f2f2f2' : '#0c0d0f'; x.fillRect(i * 8, j * 8, 8, 8); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 3), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
  const f = frames[0];
  plane.rotation.x = -Math.PI / 2;
  plane.rotation.z = -Math.atan2(f.right.z, f.right.x);
  plane.position.copy(f.p).setY(0.12);
  plane.receiveShadow = true;
  scene.add(plane);
}

// Ground and grid
const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshStandardMaterial({ color: '#101215', roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(9000, 450, 0x24262b, 0x1a1c20);
grid.position.y = 0.01; scene.add(grid);

/* ---------- Trackside boards ---------- */
function textTexture(lines, w = 512, h = 192, bg = '#0c0d0f', accent = '#ffd23f') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const x = cv.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.fillStyle = accent; x.fillRect(0, 0, w, 10);
  x.fillStyle = '#eeeeee'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '700 76px Archivo, Helvetica, Arial, sans-serif';
  x.fillText(lines[0], w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const poleMat = new THREE.MeshStandardMaterial({ color: '#3a3c42', roughness: 0.6, metalness: 0.4 });
function board(f, label, side = 1) {
  const fr = frames[Math.round(f * N) % N];
  const g = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 0.4), [poleMat, poleMat, poleMat, poleMat, new THREE.MeshStandardMaterial({ map: textTexture([label]), roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0.12, emissiveMap: textTexture([label]) }), poleMat]);
  panel.position.y = 7; panel.castShadow = true;
  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 7), poleMat); p1.position.set(-6, 3.5, 0);
  const p2 = p1.clone(); p2.position.x = 6;
  g.add(panel, p1, p2);
  g.position.copy(fr.p).addScaledVector(fr.right, side * (HALF + 12));
  g.lookAt(fr.p.clone().addScaledVector(fr.tan, -60).setY(0));
  scene.add(g);
}
try { await Promise.race([document.fonts.load('700 76px Archivo'), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* fall back to system font */ }
BOARDS.forEach(([f, label], i) => board(f + 0.012, label, i % 2 ? -1 : 1));

// A gantry over the start line, with five pairs of start lights
const lightMats = [];
const gantryPos = new THREE.Vector3();
{
  const fr = frames[0];
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + 8, 1.2, 1.2), poleMat); beam.position.y = 9.6;
  const l = new THREE.Mesh(new THREE.BoxGeometry(0.8, 10, 0.8), poleMat); l.position.set(-(HALF + 4), 5, 0);
  const r = l.clone(); r.position.x = HALF + 4;
  g.add(beam, l, r);
  const housingMat = new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.6 });
  const lampGeo = new THREE.SphereGeometry(0.5, 20, 14);
  for (let i = 0; i < 5; i++) {
    const x = (2 - i) * 2.5;
    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.7), housingMat); housing.position.set(x, 7.6, -0.2);
    const mat = new THREE.MeshBasicMaterial({ color: '#2a0f0d', toneMapped: false });
    lightMats.push(mat);
    const a = new THREE.Mesh(lampGeo, mat); a.position.set(x, 8.2, -0.6);
    const b = new THREE.Mesh(lampGeo, mat); b.position.set(x, 7.0, -0.6);
    g.add(housing, a, b);
  }
  g.position.copy(fr.p).addScaledVector(fr.tan, 6);
  g.lookAt(g.position.clone().add(fr.tan));
  gantryPos.copy(g.position).setY(7.6);
  scene.add(g);
}

/* ---------- The car ---------- */
const pmrem = new THREE.PMREMGenerator(renderer);
const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const { car, wheels, steer } = buildCar(envMap);
car.scale.setScalar(1.5);
scene.add(car);

/* ---------- Minimap ---------- */
{
  const xs = TRACK.map((p) => p[0]); const zs = TRACK.map((p) => p[1]);
  const minX = Math.min(...xs); const maxX = Math.max(...xs); const minZ = Math.min(...zs); const maxZ = Math.max(...zs);
  const s = 88 / Math.max(maxX - minX, maxZ - minZ);
  const ox = (100 - (maxX - minX) * s) / 2; const oz = (100 - (maxZ - minZ) * s) / 2;
  window.__mini = (v) => [ox + (v.x - minX) * s, oz + (v.z - minZ) * s];
  const pts = []; for (let i = 0; i <= 300; i++) pts.push(window.__mini(curve.getPointAt((i / 300) % 1)));
  root.querySelector('.i-mini-track').setAttribute('d', `M${pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L')} Z`);
}
const miniCar = root.querySelector('.i-mini-car');

/* ---------- Speed profile: slow for corners, fast on the straights ---------- */
const LAP_SECONDS = 34;
const profile = (() => {
  const raw = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let m = 0;
    for (let j = -8; j <= 45; j++) m = Math.max(m, bend[(i + j + N) % N]);
    raw[i] = THREE.MathUtils.clamp(1 - m * 1.2, 0.45, 1);
  }
  let out = raw;
  for (let pass = 0; pass < 5; pass++) {
    const o = new Float32Array(N);
    for (let i = 0; i < N; i++) { let s = 0; for (let j = -24; j <= 24; j++) s += out[(i + j + N) % N]; o[i] = s / 49; }
    out = o;
  }
  return out;
})();
const VSCALE = (() => { let T = 0; for (let i = 0; i < N; i++) T += (LAP / N) / profile[i]; return T / LAP_SECONDS; })();
const wrap = (t) => ((t % 1) + 1) % 1;
const profAt = (t) => profile[Math.floor(wrap(t) * N) % N];

/* ---------- DOM ---------- */
const $ = (s) => root.querySelector(s);
const heroEl = $('.i-hero');
const domLights = [...root.querySelectorAll('.i-lights i')];
const hudBar = $('.i-bar > i');
const hudMarks = $('.i-marks');
hudMarks.textContent = '';
SECTORS.slice(1).forEach((s) => { const m = document.createElement('span'); m.style.left = `${s.range[0] * 100}%`; hudMarks.appendChild(m); });
const hudSectorNum = $('.i-sector b');
const hudSection = $('.i-section');
const hudCorner = $('.i-corner');
const hudSpeed = $('.i-speed b');
const popsEl = $('.i-pops');
const popEls = POPS.map((c) => {
  const el = document.createElement('article');
  el.className = 'i-pop';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<p class="i-tag mono"><span>${c.tag}</span><span class="i-pop-corner"></span></p>${c.html}`;
  popsEl.appendChild(el);
  return el;
});
let activePop = -1;
function showPop(i) {
  if (i === activePop) return;
  popEls.forEach((el, k) => { el.classList.toggle('on', k === i); el.setAttribute('aria-hidden', String(k !== i)); });
  activePop = i;
}

/* ---------- Layout ---------- */
const box = new THREE.Box3().setFromPoints(TRACK.map(([x, z]) => new THREE.Vector3(x, 0, z)));
const centre = box.getCenter(new THREE.Vector3()).setY(0);
let mobile = false;
function resize() {
  const w = window.innerWidth; const h = window.innerHeight;
  mobile = w < 760;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = mobile ? 68 : 55;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

/* ---------- State ---------- */
const START = -0.005;
let phase = 'grid';   // grid → race → finish
let phaseT = 0;
let lapT = START; let v = 0;
let lightsOn = 0; let lightsOutAt = 0;
let orbitA = 0;
let running = true;
const lightsAt = [0.9, 1.6, 2.3, 3.0, 3.7];

function setLights(n) {
  lightsOn = n;
  lightMats.forEach((m, i) => { m.color.set(i < n ? '#ff1e10' : '#2a0f0d'); });
  domLights.forEach((el, i) => el.classList.toggle('on', i < n));
}
function frameAt(t) {
  const u = ((t % 1) + 1) % 1;
  return { p: curve.getPointAt(u), tan: curve.getTangentAt(u).setY(0).normalize() };
}

/* Camera blends from wherever it is toward the shot each mode wants */
const camFromPos = new THREE.Vector3(); const camFromLook = new THREE.Vector3();
const camLook = new THREE.Vector3();
let camMode = 'grid'; let camBlend = 1; let camDur = 1;
const camTan = new THREE.Vector3();
function setCam(mode, dur) {
  camFromPos.copy(camera.position); camFromLook.copy(camLook);
  camMode = mode; camBlend = 0; camDur = dur;
  if (mode === 'orbit') { const d = camera.position.clone().sub(centre); orbitA = Math.atan2(d.x, d.z); }
}
function shot(mode, p) {
  if (mode === 'grid') return [p.clone().addScaledVector(camTan, -11).setY(2.8), gantryPos.clone().setY(6.2)];
  if (mode === 'chase') return [p.clone().addScaledVector(camTan, -15).setY(5.2), p.clone().addScaledVector(camTan, 16).setY(1.4)];
  const R = mobile ? 1500 : 1300; const H = mobile ? 3100 : 2050;
  return [new THREE.Vector3(centre.x + Math.sin(orbitA) * R, H, centre.z + Math.cos(orbitA) * R), centre.clone()];
}
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

let offX = 0; let offY = 0;
function wantOffset() {
  const w = window.innerWidth; const h = window.innerHeight;
  const panel = phase === 'grid' || (phase === 'race' && activePop >= 0);
  if (!panel) return [0, 0];
  return mobile ? [0, h * 0.2] : [-w * 0.14, 0];
}

function go(next) {
  phase = next; phaseT = 0;
  root.dataset.phase = next;
  if (next === 'race') { setCam('chase', 1.6); heroEl.classList.remove('on'); }
  if (next === 'finish') setCam('orbit', 2.4);
}

// The page script removes the overlay; stop drawing when it does
window.addEventListener('lap:end', () => {
  pmrem.dispose(); envMap.dispose();
  running = false;
  window.removeEventListener('resize', resize);
  renderer.setAnimationLoop(null);
  setTimeout(() => { renderer.dispose(); renderer.forceContextLoss(); }, 1200);
}, { once: true });

/* ---------- Loop ---------- */
const headTarget = new THREE.Object3D(); let firstFrame = true; let steerAngle = 0;
setLights(0); go('grid');
camTan.copy(frameAt(lapT).tan);
{ const f = frameAt(lapT); const [p0, l0] = shot(camMode, f.p); camera.position.copy(p0); camLook.copy(l0); }
let lastTime = performance.now();

function tick(now) {
  if (!running) return;
  if (!root.isConnected) { running = false; renderer.setAnimationLoop(null); renderer.dispose(); return; }
  const dt = Math.min(0.05, (now - lastTime) / 1000); lastTime = now;
  phaseT += dt;

  if (phase === 'grid') {
    let n = 0; lightsAt.forEach((t) => { if (phaseT >= t) n++; });
    if (n !== lightsOn) setLights(n);
    if (n === 5 && !lightsOutAt) lightsOutAt = phaseT + 0.5 + Math.random() * 0.7;
    if (lightsOutAt && phaseT >= lightsOutAt) { lightsOutAt = 0; setLights(0); go('race'); }
  } else if (phase === 'race') {
    const want = profAt(lapT) * VSCALE;
    v += THREE.MathUtils.clamp(want - v, -70 * dt, 55 * dt);
    lapT += (v * dt) / LAP;
    if (lapT >= 1) go('finish');
  } else if (phase === 'finish') {
    v = Math.max(0, v - 120 * dt);
    lapT += (v * dt) / LAP;
    if (phaseT > 2.4 && phaseT - dt <= 2.4) window.dispatchEvent(new Event('lap:finish'));
  }

  // Car turns with a slerped heading instead of snapping to the tangent
  const { p, tan } = frameAt(lapT);
  car.position.copy(p);
  headTarget.position.copy(p);
  headTarget.lookAt(p.clone().add(frameAt(lapT + 6 / LAP).tan.add(tan).normalize()));
  if (firstFrame) car.quaternion.copy(headTarget.quaternion);
  else car.quaternion.slerp(headTarget.quaternion, 1 - Math.exp(-dt * 10));
  firstFrame = false;
  wheels.forEach(({ wheel, r }) => { wheel.rotation.x += (v * dt) / (r * 1.5); });
  { // Front wheels steer toward where the road goes next
    const ahead = frameAt(lapT + 10 / LAP).tan;
    const want = THREE.MathUtils.clamp(Math.atan2(tan.x * ahead.z - tan.z * ahead.x, tan.dot(ahead)) * -2.2, -0.32, 0.32);
    steerAngle += (want - steerAngle) * (1 - Math.exp(-dt * 8));
    steer.forEach((p) => { p.rotation.y = steerAngle; });
  }
  camTan.lerp(new THREE.Vector3(0, 0, 1).applyQuaternion(car.quaternion), 1 - Math.exp(-dt * 4)).normalize();

  // Camera
  if (phase === 'finish') orbitA += dt * 0.08;
  camBlend = Math.min(1, camBlend + dt / Math.max(camDur, 1e-3));
  const [dPos, dLook] = shot(camMode, p);
  const e = ease(camBlend);
  camera.position.copy(camFromPos).lerp(dPos, e);
  camLook.copy(camFromLook).lerp(dLook, e);
  const [ox, oy] = wantOffset();
  offX += (ox - offX) * Math.min(1, dt * 3); offY += (oy - offY) * Math.min(1, dt * 3);
  camera.setViewOffset(window.innerWidth, window.innerHeight, offX, offY, window.innerWidth, window.innerHeight);
  camera.lookAt(camLook);

  const air = THREE.MathUtils.smoothstep(camera.position.y, 40, 900);
  scene.fog.near = THREE.MathUtils.lerp(120, 2500, air);
  scene.fog.far = THREE.MathUtils.lerp(900, 7000, air);
  sectorLines.forEach((m) => { m.material.opacity = air * 0.85; m.visible = air > 0.01; });
  sun.position.copy(p).add(new THREE.Vector3(40, 80, 30));
  sun.target.position.copy(p);

  // HUD
  const t = THREE.MathUtils.clamp(lapT, 0, 1);
  hudBar.style.transform = `scaleX(${t})`;
  const sec = sectionAt(t);
  hudSectorNum.textContent = phase === 'grid' ? 'S0' : phase === 'finish' ? 'FIN' : sec.s;
  hudSection.textContent = phase === 'grid' ? 'On the grid' : phase === 'finish' ? 'Chequered flag' : sec.name;
  const next = CORNERS.find((c) => c[0] > lapT + 0.004);
  hudCorner.textContent = phase === 'race' && next ? `Next: ${next[1]}` : '';
  hudSpeed.textContent = String(Math.round(phase === 'grid' ? 0 : (v / VSCALE) * 330));
  const [mx, my] = window.__mini(p);
  miniCar.setAttribute('cx', mx.toFixed(1)); miniCar.setAttribute('cy', my.toFixed(1));

  // Pop-ups: the latest checkpoint the car has passed
  if (phase === 'race') {
    let idx = -1; POPS.forEach((c, i) => { if (lapT >= c.f) idx = i; });
    showPop(idx);
    if (idx >= 0) { const c = CORNERS.find((k) => Math.abs(k[0] - lapT) < 0.02); popEls[idx].querySelector('.i-pop-corner').textContent = c ? c[1] : ''; }
  } else if (activePop !== -1) showPop(-1);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(tick);
$('.i-loading').classList.add('done');
