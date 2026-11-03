import * as THREE from 'three';
import { TRACK } from './track.js';

const RESUME = '../assets/Darsh_Singhvi_Resume.pdf';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Content: where each part of the story appears on the lap ---------- */
const CARDS = [
  { f: 0, sector: 'Grid', tag: 'Lights out', hero: true, html: `
      <h1>Darsh<br>Singhvi</h1>
      <p class="body">Business and mathematics at Carnegie Mellon. I work on quantitative trading, options pricing and the models behind market decisions.</p>
      <p class="hint mono">Scroll to drive one lap of Silverstone</p>` },
  { f: 0.03, sector: 'Education', tag: 'S1 · Education', html: `
      <h2>Carnegie Mellon University</h2>
      <p class="meta">B.S. in Business, additional major in Mathematics · Expected May 2030</p>
      <dl><dt>Coursework</dt><dd>Concepts of Mathematics, Matrices and Linear Transformations</dd><dt>Activities</dt><dd>CMU Quant Club, CMU Math Club, Scottie Ventures, Poker Club</dd></dl>` },
  { f: 0.11, sector: 'Education', tag: 'S1 · Education', html: `
      <h2>Garnet Valley High School</h2>
      <p class="meta">Valedictorian · 4.30 weighted, 4.00 unweighted · June 2026</p>
      <dl><dt>Coursework</dt><dd>Multivariable Calculus, Calculus II, AP Statistics, AP Computer Science A, AP Micro and Macroeconomics</dd><dt>Activities</dt><dd>Marching Band, Bring a Smile Club, Science Olympiad, FBLA, Finance Club, NHS</dd></dl>` },
  { f: 0.21, sector: 'Experience', tag: 'S2 · Experience', html: `
      <h2><i class="tyre tyre-s">S</i>Introductory Finance Society</h2>
      <p class="meta">Trade pitch · Pittsburgh, PA · Oct 2026</p><span class="result">P1 · 1st place</span>
      <ul class="points"><li>Pitched long Mosaic / short CF with June 2027 MOS $20/$27.50 bull call debit and CF $130/$150 bear call credit spreads.</li><li>Applied Black-Scholes pricing, dollar-delta hedging, 400,000 Monte Carlo simulations and half-Kelly sizing.</li></ul>` },
  { f: 0.265, sector: 'Experience', tag: 'S2 · Experience', html: `
      <h2><i class="tyre tyre-s">S</i>CMU MSCF Trading Competition</h2>
      <p class="meta">Quantitative trading competitor · Sep 2026</p><span class="result">1st / 170+ · Most Active Trader</span>
      <ul class="points"><li>Built a bot for two simulated markets, turning live signals into systematic strategies, order execution and risk controls.</li><li>Won Most Active Trader and the Largest Comeback award.</li></ul>` },
  { f: 0.32, sector: 'Experience', tag: 'S2 · Experience', html: `
      <h2><i class="tyre tyre-s">S</i>Susquehanna International Group</h2>
      <p class="meta">Quantitative Trading Discovery Program · 2026</p><span class="result">Selected · first-year cohort</span>
      <ul class="points"><li>Trading, probability, quantitative analysis and market structure at a global market maker.</li><li>Applied expected value, execution and decision frameworks across three market-making themes.</li></ul>` },
  { f: 0.39, sector: 'Experience', tag: 'S2 · Experience', html: `
      <h2><i class="tyre tyre-m">M</i>AI and ML Research</h2>
      <p class="meta">Lead researcher, three-person team · Northeastern University · 2024–2025</p><span class="result">5 models benchmarked</span>
      <ul class="points"><li>Benchmarked FinBERT, FinGPT, GPT, RoBERTa and LLaMA on financial text and sentiment labels.</li><li>Directed the team and prepared an MSAST 2025 submission.</li></ul>` },
  { f: 0.46, sector: 'Experience', tag: 'S2 · Experience', html: `
      <h2><i class="tyre tyre-m">M</i>Baymont by Wyndham</h2>
      <p class="meta">Finance and operations intern · Milesburg, PA · 2024–2025</p><span class="result">+9.3% room revenue</span>
      <ul class="points"><li>Built dynamic pricing models from seasonal demand, competitor positioning and booking patterns.</li><li>Prepared ROI analyses supporting $520,000 in renovation and investment decisions.</li></ul>` },
  { f: 0.52, sector: 'Experience', tag: 'S2 · Experience', html: `
      <h2><i class="tyre tyre-m">M</i>Venture Starters and GoAhead Ventures</h2>
      <p class="meta">Venture capital intern · 2022–Present</p><span class="result">~100 pitches screened</span>
      <ul class="points"><li>Screened startup pitches on market potential, competitive position and differentiation.</li><li>Summarized theses, key risks and growth opportunities for senior review.</li></ul>` },
  { f: 0.585, sector: 'Leadership', tag: 'S2 · Leadership', html: `
      <h2><i class="tyre tyre-h">H</i>Future Business Leaders of America</h2>
      <p class="meta">Region president · 2022–Present</p><span class="result">15+ schools · 1,000+ members</span>
      <ul class="points"><li>Organized a 700+ attendee conference and raised $2,000+ in sponsorships.</li><li>Coach competitors in financial statement analysis, presentation strategy and case preparation.</li></ul>` },
  { f: 0.645, sector: 'Leadership', tag: 'S2 · Leadership', html: `
      <h2><i class="tyre tyre-h">H</i>Catalyst Business Advising Service</h2>
      <p class="meta">Founder and president · Philadelphia, PA · 2023–Present</p><span class="result">15+ businesses · 4 countries</span>
      <ul class="points"><li>Manage a 40+ member team providing pro bono financial modeling and pitch-deck consulting.</li><li>Deliver client analyses and presentations from scoping through final recommendations.</li></ul>` },
  { f: 0.72, sector: 'Awards', tag: 'S3 · Awards', html: `
      <h2>Podiums</h2>
      <ul class="tower">
        <li><span class="pos">1</span><span>FBLA National Champion<small>Financial Statement Analysis, 2025</small></span><span class="gap purple">1st / ~500</span></li>
        <li><span class="pos">2</span><span>CMU MSCF Trading<small>Most Active Trader, Largest Comeback</small></span><span class="gap purple">1st / 170+</span></li>
        <li><span class="pos">3</span><span>IFS Trade Pitch<small>Long MOS / short CF</small></span><span class="gap purple">1st</span></li>
        <li><span class="pos">4</span><span>Science Olympiad<small>UPenn, Princeton, PA states</small></span><span class="gap green">1st, 1st, 3rd</span></li>
        <li><span class="pos">5</span><span>Varsity Ultimate Frisbee<small>Best Defensive Player</small></span><span class="gap green">1 / 60</span></li>
      </ul>` },
  { f: 0.84, sector: 'About', tag: 'S4 · About', html: `
      <h2>In the paddock</h2>
      <p class="body">I like problems with a little uncertainty in them. That shows up in the way I work, and in what I do away from a screen.</p>
      <ul class="chips"><li class="hot">Formula 1</li><li>NFL</li><li>Running</li><li>Ping pong</li><li>Tennis</li><li>Soccer</li><li>Poker</li></ul>
      <ul class="chips"><li>Python</li><li>NumPy</li><li>pandas</li><li>scikit-learn</li><li>Java</li><li>C++</li><li>Excel</li><li>Bloomberg</li><li>CapIQ</li></ul>` },
  { f: 0.94, sector: 'Finish', tag: 'Chequered flag', html: `
      <h2>Box, box. Let’s talk</h2>
      <p class="body">Have a good question, a trade idea or an F1 take? Send it my way.</p>
      <div class="actions"><a class="button" href="mailto:contact.darshsinghvi@gmail.com">Email me</a><a class="button ghost" href="${RESUME}" target="_blank" rel="noreferrer">Resume</a><a class="button ghost" href="https://www.linkedin.com/in/darshsinghvi" target="_blank" rel="noreferrer">LinkedIn</a></div>
      <p class="hint mono">Scroll up to drive it backwards</p>` },
];
const BOARDS = [[0.03, 'EDUCATION'], [0.21, 'EXPERIENCE'], [0.585, 'LEADERSHIP'], [0.72, 'AWARDS'], [0.84, 'ABOUT'], [0.94, 'CONTACT']];
const CORNERS = [[0.042, 'Abbey'], [0.133, 'Farm'], [0.15, 'Village'], [0.2, 'The Loop'], [0.23, 'Aintree'], [0.365, 'Brooklands'], [0.385, 'Luffield'], [0.465, 'Woodcote'], [0.592, 'Copse'], [0.627, 'Maggotts'], [0.67, 'Becketts'], [0.698, 'Chapel'], [0.852, 'Stowe'], [0.885, 'Vale'], [0.945, 'Club'], [1.042, 'Abbey']];
const SECTORS = [[0, 'S1'], [0.3, 'S2'], [0.54, 'S3'], [0.79, 'S4']];
const SECTOR_TAG = { Grid: 'S0', Education: 'S1', Experience: 'S2', Leadership: 'S2', Awards: 'S3', About: 'S4', Finish: 'FIN' };

/* ---------- DOM ---------- */
const cardsEl = document.getElementById('cards');
const cardEls = CARDS.map((c) => {
  const el = document.createElement('article');
  el.className = `card${c.hero ? ' hero' : ''}`;
  el.innerHTML = `<p class="card-tag mono"><span>${c.tag}</span><span class="card-corner"></span></p>${c.html}`;
  cardsEl.appendChild(el);
  return el;
});
const hudBar = document.querySelector('.hud-bar > i');
const hudMarks = document.querySelector('.hud-marks');
const markEls = CARDS.slice(1).map((c) => { const s = document.createElement('span'); s.style.left = `${c.f * 100}%`; hudMarks.appendChild(s); return s; });
const hudSectorNum = document.querySelector('.hud-sector b');
const hudSection = document.querySelector('.hud-section');
const hudCorner = document.querySelector('.hud-corner');
const hudSpeed = document.querySelector('.hud-speed b');

/* ---------- Renderer ---------- */
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  document.querySelector('.loading').innerHTML = 'This lap needs WebGL. <a href="../" style="text-decoration:underline;margin-left:6px">Open the full site</a>';
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
const curve = new THREE.CatmullRomCurve3(TRACK.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
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

// Bright outline that only shows in the opening overview
const outline = ribbon(-16, 16, 0.3, '#f2f2f2');
outline.material = new THREE.MeshBasicMaterial({ color: '#f2f2f2', transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, side: THREE.DoubleSide });
outline.renderOrder = 10;

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

// A gantry over the start line
{
  const fr = frames[0];
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + 8, 1.2, 1.2), poleMat); beam.position.y = 9;
  const l = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9, 0.8), poleMat); l.position.set(-(HALF + 4), 4.5, 0);
  const r = l.clone(); r.position.x = HALF + 4;
  g.add(beam, l, r);
  const lightMat = new THREE.MeshStandardMaterial({ color: '#3a1512', emissive: '#ff2a1a', emissiveIntensity: 0 });
  for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), lightMat); b.position.set(-3 + i * 1.5, 8.3, 0.7); g.add(b); }
  g.position.copy(fr.p).addScaledVector(fr.tan, 6);
  g.lookAt(g.position.clone().add(fr.tan));
  scene.add(g);
}

/* ---------- The car (an original open-wheeler built from primitives) ---------- */
function buildCar() {
  const car = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: '#d42a1f', roughness: 0.35, metalness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.5, metalness: 0.4 });
  const white = new THREE.MeshStandardMaterial({ color: '#f2f2f2', roughness: 0.4 });
  const tyre = new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.9 });
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; car.add(m); return m; };
  // Car points along +z
  add(new THREE.BoxGeometry(0.9, 0.42, 2.6), red, 0, 0.45, -0.2);                      // tub
  add(new THREE.CylinderGeometry(0.08, 0.32, 1.9, 12), red, 0, 0.38, 1.95, Math.PI / 2); // nose
  add(new THREE.BoxGeometry(0.55, 0.3, 1.6), red, -0.62, 0.38, -0.4);                   // sidepods
  add(new THREE.BoxGeometry(0.55, 0.3, 1.6), red, 0.62, 0.38, -0.4);
  add(new THREE.BoxGeometry(0.3, 0.55, 1.4), red, 0, 0.82, -0.9);                        // engine cover
  add(new THREE.BoxGeometry(0.06, 0.5, 1.2), white, 0, 1.15, -1.1);                      // fin
  add(new THREE.BoxGeometry(2.1, 0.06, 0.55), dark, 0, 0.14, 2.75);                      // front wing
  add(new THREE.BoxGeometry(0.06, 0.32, 0.6), red, -1.05, 0.25, 2.75);
  add(new THREE.BoxGeometry(0.06, 0.32, 0.6), red, 1.05, 0.25, 2.75);
  add(new THREE.BoxGeometry(1.5, 0.08, 0.45), dark, 0, 1.15, -2.05);                     // rear wing
  add(new THREE.BoxGeometry(1.5, 0.06, 0.3), red, 0, 1.3, -2.15);
  add(new THREE.BoxGeometry(0.06, 0.75, 0.6), dark, -0.75, 0.85, -2.05);
  add(new THREE.BoxGeometry(0.06, 0.75, 0.6), dark, 0.75, 0.85, -2.05);
  add(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.3 }), 0, 0.82, 0.2); // helmet
  add(new THREE.TorusGeometry(0.34, 0.035, 8, 24, Math.PI), dark, 0, 0.82, 0.38, 0, 0, 0); // halo
  // Number panel
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64;
  const x = cv.getContext('2d'); x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#d42a1f'; x.font = '700 44px Archivo, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DS', 64, 34);
  const numTex = new THREE.CanvasTexture(cv); numTex.colorSpace = THREE.SRGBColorSpace;
  add(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshStandardMaterial({ map: numTex }), 0, 0.665, 1.0, -Math.PI / 2);
  // Wheels
  const wheels = [];
  [[-0.95, 1.75, 0.34, 0.32], [0.95, 1.75, 0.34, 0.32], [-0.95, -1.4, 0.38, 0.42], [0.95, -1.4, 0.38, 0.42]].forEach(([wx, wz, r, w]) => {
    const wheel = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 24), tyre); t.rotation.z = Math.PI / 2; t.castShadow = true;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.02, 16), dark); rim.rotation.z = Math.PI / 2;
    const band = new THREE.Mesh(new THREE.TorusGeometry(r * 0.75, 0.025, 6, 24), new THREE.MeshStandardMaterial({ color: '#ff3b2f', emissive: '#ff3b2f', emissiveIntensity: 0.25 }));
    band.rotation.y = Math.PI / 2; band.position.x = (wx < 0 ? -1 : 1) * (w / 2 + 0.01);
    wheel.add(t, rim, band);
    wheel.position.set(wx, r, wz);
    car.add(wheel);
    wheels.push({ wheel, r });
  });
  car.scale.setScalar(1.6);
  return { car, wheels };
}
const { car, wheels } = buildCar();
scene.add(car);

/* ---------- Minimap ---------- */
{
  const xs = TRACK.map((p) => p[0]); const zs = TRACK.map((p) => p[1]);
  const minX = Math.min(...xs); const maxX = Math.max(...xs); const minZ = Math.min(...zs); const maxZ = Math.max(...zs);
  const s = 88 / Math.max(maxX - minX, maxZ - minZ);
  const ox = (100 - (maxX - minX) * s) / 2; const oz = (100 - (maxZ - minZ) * s) / 2;
  window.__mini = (v) => [ox + (v.x - minX) * s, oz + (v.z - minZ) * s];
  const pts = []; for (let i = 0; i <= 300; i++) pts.push(window.__mini(curve.getPointAt((i / 300) % 1)));
  document.querySelector('.mini-track').setAttribute('d', `M${pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L')} Z`);
}
const miniCar = document.querySelector('.mini-car');

/* ---------- Scroll → lap ---------- */
let target = 0; let progress = 0; let lastProgress = 0; let speedKmh = 0;
function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  target = max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
}
window.addEventListener('scroll', readScroll, { passive: true });

function resize() {
  const w = window.innerWidth; const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < 760 ? 68 : 55;
  // Shift the picture so the car sits clear of the content card
  overview.set(0, w < 760 ? 3000 : 2000, w < 760 ? 1500 : 1250);
  if (w < 760) camera.setViewOffset(w, h, 0, h * 0.24, w, h);
  else camera.setViewOffset(w, h, -w * 0.14, 0, w, h);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

const camPos = new THREE.Vector3(); const camLook = new THREE.Vector3();
let camInit = false;
const overview = new THREE.Vector3(0, 2000, 1250);
const overviewLook = new THREE.Vector3(0, 0, 80);
let activeCard = -1;
resize(); readScroll();
let lastTime = performance.now();

function frameAt(t) {
  const u = ((t % 1) + 1) % 1;
  return { p: curve.getPointAt(u), tan: curve.getTangentAt(u).setY(0).normalize() };
}

function tick(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000); lastTime = now;
  // Ease the car toward the scroll position (instant with reduced motion)
  progress = reducedMotion ? target : progress + (target - progress) * Math.min(1, dt * 4);
  const lapT = progress * 0.995; // stop just past the line
  const { p, tan } = frameAt(lapT);
  car.position.copy(p);
  car.lookAt(p.clone().add(tan));

  // Speed from how fast you scroll the lap
  const dp = (progress - lastProgress) / Math.max(dt, 1e-3); lastProgress = progress;
  speedKmh += (Math.min(345, Math.abs(dp) * LAP * 3.6 * 0.35) - speedKmh) * Math.min(1, dt * 6);
  hudSpeed.textContent = String(Math.round(speedKmh));
  const spin = (dp * LAP * dt) ;
  wheels.forEach(({ wheel, r }) => { wheel.rotation.x += spin / r; });

  // Chase camera, blending from an overview of the whole circuit at the start
  const chase = p.clone().addScaledVector(tan, -16).add(new THREE.Vector3(0, 6.5, 0));
  const look = p.clone().addScaledVector(tan, 14).setY(1.5);
  const intro = THREE.MathUtils.smoothstep(progress, 0, 0.025);
  const desiredPos = overview.clone().lerp(chase, intro);
  const desiredLook = overviewLook.clone().lerp(look, intro);
  if (!camInit) { camPos.copy(desiredPos); camLook.copy(desiredLook); camInit = true; }
  const k = reducedMotion ? 1 : Math.min(1, dt * (intro < 1 ? 3 : 6));
  camPos.lerp(desiredPos, k); camLook.lerp(desiredLook, k);
  camera.position.copy(camPos); camera.lookAt(camLook);
  outline.material.opacity = 0.9 * (1 - intro);
  outline.visible = intro < 0.999;
  scene.fog.near = THREE.MathUtils.lerp(2500, 120, intro);
  scene.fog.far = THREE.MathUtils.lerp(6000, 900, intro);

  sun.position.copy(p).add(new THREE.Vector3(40, 80, 30));
  sun.target.position.copy(p);

  // HUD
  hudBar.style.transform = `scaleX(${progress})`;
  markEls.forEach((m, i) => m.classList.toggle('passed', progress >= CARDS[i + 1].f));
  const sec = SECTORS.filter((s) => lapT >= s[0]).pop();
  hudSectorNum.textContent = SECTOR_TAG[CARDS[activeCard < 0 ? 0 : activeCard].sector] ?? sec[1];
  const next = CORNERS.find((c) => c[0] > lapT + 0.004);
  hudCorner.textContent = next ? `Next: ${next[1]}` : '';
  const [mx, my] = window.__mini(p);
  miniCar.setAttribute('cx', mx.toFixed(1)); miniCar.setAttribute('cy', my.toFixed(1));

  // Cards: show the latest checkpoint passed
  let idx = 0;
  CARDS.forEach((c, i) => { if (progress >= c.f) idx = i; });
  if (idx !== activeCard) {
    cardEls.forEach((el, i) => { el.classList.toggle('on', i === idx); el.setAttribute('aria-hidden', String(i !== idx)); });
    hudSection.textContent = CARDS[idx].sector;
    activeCard = idx;
  }
  const corner = CORNERS.filter((c) => Math.abs(c[0] - lapT) < 0.02)[0];
  cardEls[idx].querySelector('.card-corner').textContent = corner ? corner[1] : '';

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

requestAnimationFrame((t) => { lastTime = t; tick(t); document.querySelector('.loading').classList.add('done'); });
