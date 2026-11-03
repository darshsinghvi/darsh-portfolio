const body = document.body;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wideQuery = window.matchMedia('(min-width: 900px) and (min-height: 620px)');

document.querySelector('#year').textContent = new Date().getFullYear();

/* ---------- Menu ---------- */
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

/* ---------- Start lights ---------- */
const pods = [...document.querySelectorAll('.pod')];
const statusText = document.querySelector('.status-text');
let started = false;
const timers = [];

function lightsOut() {
  if (started) return;
  started = true;
  timers.forEach(clearTimeout);
  pods.forEach((pod) => pod.classList.remove('on'));
  statusText.textContent = 'Lights out and away we go';
  body.classList.remove('is-starting');
  body.classList.add('is-go');
  document.querySelector('.c-line').style.strokeDashoffset = 0;
  driveHeroLap();
}

if (reducedMotion) {
  queueMicrotask(lightsOut);
} else {
  statusText.textContent = 'Formation lap';
  pods.forEach((pod, i) => {
    timers.push(setTimeout(() => {
      pod.classList.add('on');
      statusText.textContent = `Lights ${i + 1} / 5`;
    }, 350 + i * 320));
  });
  timers.push(setTimeout(lightsOut, 350 + 4 * 320 + 700));
  ['wheel', 'touchstart', 'keydown'].forEach((type) => window.addEventListener(type, lightsOut, { once: true, passive: true }));
}


/* ---------- Hero circuit ---------- */
const circuitLine = document.querySelector('.c-line');
const heroCar = document.querySelector('.c-car');
const lapLabel = document.querySelector('.circuit-lap');
const sectorPaths = [...document.querySelectorAll('.c-sector')];
const heroLen = circuitLine.getTotalLength();
const splits = [0, 0.22, 0.5, 0.72, 1];

circuitLine.style.strokeDasharray = heroLen;
circuitLine.style.strokeDashoffset = body.classList.contains('is-go') ? 0 : heroLen;
sectorPaths.forEach((p, i) => {
  const a = splits[i] * heroLen;
  const len = (splits[i + 1] - splits[i]) * heroLen;
  p.style.strokeDasharray = `${len} ${heroLen}`;
  p.style.strokeDashoffset = -a;
});
// 3D: extrude the track, add upright pins, tilt with the pointer
const scene = document.querySelector('.circuit-scene');
const trackD = circuitLine.getAttribute('d');
const SVGNS = 'http://www.w3.org/2000/svg';
const extrude = document.querySelector('.c-extrude');
const VB = { x: 20, y: 30, w: 450, h: 258 };
const LAYERS = 12;
for (let i = -1; i < LAYERS; i++) {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `${VB.x} ${VB.y} ${VB.w} ${VB.h}`);
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', trackD);
  if (i < 0) p.setAttribute('class', 'c-shadow');
  else {
    const t = i / (LAYERS - 1);
    const c = Math.round(20 + t * 22);
    p.style.stroke = `rgb(${c}, ${c + 1}, ${c + 5})`;
    svg.style.transform = `translateZ(${(i * 16) / LAYERS}px)`;
  }
  svg.appendChild(p);
  extrude.appendChild(svg);
}

const pinLayer = document.querySelector('.c-pins');
function makePin(x, y, label, kind) {
  const pin = document.createElement('div');
  pin.className = `pin pin-${kind}`;
  pin.innerHTML = `<div class="pin-body"><span class="pin-label">${label}</span><span class="pin-stem"></span></div>`;
  placePin(pin, x, y);
  pinLayer.appendChild(pin);
  return pin;
}
function placePin(pin, x, y) {
  pin.style.left = `${((x - VB.x) / VB.w) * 100}%`;
  pin.style.top = `${((y - VB.y) / VB.h) * 100}%`;
}
document.querySelectorAll('.c-turns text').forEach((t) => makePin(+t.getAttribute('x'), +t.getAttribute('y') + 4, `T${t.textContent}`, 'turn'));
const carPin = makePin(100, 250, 'DS', 'car');

const circuitCard = document.querySelector('.circuit');
if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
  circuitCard.addEventListener('pointermove', (e) => {
    if (!body.classList.contains('is-go')) return;
    const r = circuitCard.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    scene.classList.add('tracking');
    scene.style.setProperty('--rx', `${52 - ny * 16}deg`);
    scene.style.setProperty('--rz', `${-16 + nx * 24}deg`);
  });
  circuitCard.addEventListener('pointerleave', () => {
    scene.style.removeProperty('--rx');
    scene.style.removeProperty('--rz');
  });
}

// Sector boundary ticks
const tickGroup = document.querySelector('.c-ticks');
splits.slice(1, 4).forEach((f) => {
  const l = f * heroLen;
  const p0 = circuitLine.getPointAtLength(l - 1);
  const p1 = circuitLine.getPointAtLength(l + 1);
  const dx = p1.x - p0.x; const dy = p1.y - p0.y; const n = Math.hypot(dx, dy) || 1;
  const nx = -dy / n * 12; const ny = dx / n * 12;
  const pt = circuitLine.getPointAtLength(l);
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', pt.x - nx); line.setAttribute('y1', pt.y - ny);
  line.setAttribute('x2', pt.x + nx); line.setAttribute('y2', pt.y + ny);
  tickGroup.appendChild(line);
});

function lightSector(n) {
  sectorPaths.forEach((p) => p.classList.toggle('lit', Number(p.dataset.s) === n));
}

let lapDone = false;
function driveHeroLap() {
  if (reducedMotion) { lapDone = true; lapLabel.textContent = 'Pick a sector'; return; }
  const dur = 3600;
  const t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  function step(now) {
    const t = Math.min(1, (now - t0) / dur);
    const f = ease(t);
    const pt = circuitLine.getPointAtLength(f * heroLen);
    heroCar.setAttribute('cx', pt.x); heroCar.setAttribute('cy', pt.y);
    placePin(carPin, pt.x, pt.y);
    const sec = splits.findIndex((x, i) => f >= x && f < splits[i + 1]) + 1;
    lightSector(t < 1 ? sec : 0);
    lapLabel.textContent = t < 1 ? `Sector ${sec}` : 'Pick a sector';
    if (t < 1) requestAnimationFrame(step); else lapDone = true;
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('.circuit-legend a').forEach((a) => {
  const n = Number(a.dataset.s);
  const on = () => { if (lapDone) { lightSector(n); lapLabel.textContent = a.textContent.replace(/^S\d/, `S${n} · `).replace(/([a-z])([A-Z])/, '$1 · $2'); } };
  const off = () => { if (lapDone) { lightSector(0); lapLabel.textContent = 'Pick a sector'; } };
  a.addEventListener('mouseenter', on); a.addEventListener('focus', on);
  a.addEventListener('mouseleave', off); a.addEventListener('blur', off);
});

/* ---------- Layout measurements ---------- */
const sections = [...document.querySelectorAll('main > section')];
const stickies = sections.filter((s) => s.classList.contains('hero') || s.classList.contains('panel'));
const straight = document.querySelector('.straight');
const stints = document.querySelector('.stints');
const stintCards = [...document.querySelectorAll('.stint')];
const streaks = [...document.querySelectorAll('.streaks span')];
const spBar = document.querySelector('.sp-bar i');
const spCount = document.querySelector('.sp-count');
const podium = document.querySelector('.podium');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

const minimap = document.querySelector('.minimap');
const carPath = document.querySelector('.track-done');
const car = document.querySelector('.track-car');
const sectorLabel = document.querySelector('.minimap-label');
const sectorNum = document.querySelector('.minimap-sector');
const sectorBars = [...document.querySelectorAll('.sector-bars li')];
const pathLength = carPath.getTotalLength();
carPath.style.strokeDasharray = pathLength;

let starts = [];
let overflow = 0;
let vh = window.innerHeight;

function measure() {
  vh = window.innerHeight;
  const wide = wideQuery.matches;

  // Horizontal straight: wrapper is as tall as the sideways distance plus one screen
  if (wide) {
    straight.style.height = '';
    const visible = window.innerWidth - stints.parentElement.getBoundingClientRect().left;
    overflow = Math.max(0, stints.scrollWidth - visible + 24);
    straight.style.height = `${overflow + vh}px`;
  } else {
    overflow = 0;
    straight.style.height = '';
    stints.style.transform = '';
  }

  // Tall panels stick by their bottom edge so nothing gets hidden
  stickies.forEach((s) => {
    s.style.top = `${Math.min(0, vh - s.offsetHeight)}px`;
  });

  // Section starts in document flow (sticky offsets don't affect heights)
  let y = 0;
  starts = sections.map((s) => {
    const start = y;
    y += s.offsetHeight;
    return start;
  });
}

/* ---------- Scroll frame ---------- */
let lastY = window.scrollY;
let skew = 0;
let ticking = false;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function frame() {
  ticking = false;
  const y = window.scrollY;
  const velocity = y - lastY;
  lastY = y;

  header.classList.toggle('scrolled', y > 12);
  if (y > 8) lightsOut();

  // Panel being covered by the next one: push it back and dim it
  if (!reducedMotion) {
    stickies.forEach((s) => {
      const i = sections.indexOf(s);
      const nextStart = starts[i + 1];
      if (nextStart === undefined) return;
      const p = clamp((y + vh - nextStart) / vh, 0, 1);
      const inner = s.querySelector('.panel-inner, .hero-inner');
      inner.style.transform = p > 0 ? `translateY(${-p * 6}vh) scale(${1 - p * 0.08})` : '';
      inner.style.opacity = p > 0 ? String(1 - p * 0.7) : '';
    });
  }

  // Straight: vertical scroll drives the stints sideways
  const si = sections.indexOf(straight);
  if (overflow > 0) {
    const p = clamp((y - starts[si]) / overflow, 0, 1);
    stints.style.transform = `translate3d(${-p * overflow}px, 0, 0)`;
    streaks.forEach((s, k) => { s.style.transform = `translate3d(${-(p * overflow * (1.4 + k * 0.4)) % 800}px, 0, 0)`; });
    spBar.style.transform = `scaleX(${p})`;
    spCount.textContent = `${String(Math.round(p * (stintCards.length - 1)) + 1).padStart(2, '0')} / ${String(stintCards.length).padStart(2, '0')}`;
    if (!reducedMotion) {
      const inStraight = y > starts[si] && y < starts[si] + overflow;
      skew += ((inStraight ? clamp(-velocity * 0.12, -6, 6) : 0) - skew) * 0.25;
      stintCards.forEach((c) => { c.style.transform = Math.abs(skew) > 0.05 ? `skewX(${skew}deg)` : ''; });
      if (Math.abs(skew) > 0.05) requestTick();
    }
  }

  // Minimap: one lap over the whole page
  const total = document.documentElement.scrollHeight - vh;
  const lap = total > 0 ? clamp(y / total, 0, 1) : 0;
  const pt = carPath.getPointAtLength(lap * pathLength);
  car.setAttribute('cx', pt.x);
  car.setAttribute('cy', pt.y);
  carPath.style.strokeDashoffset = pathLength * (1 - lap);
  minimap.classList.toggle('show', y > vh * 0.5);

  let current = 0;
  sections.forEach((s, i) => {
    if (s.dataset.sector && y + vh * 0.5 >= starts[i]) current = Number(s.dataset.sector);
    if (s.id === 'contact' && y + vh * 0.5 >= starts[i]) current = 5;
  });
  sectorBars.forEach((b) => {
    const n = Number(b.dataset.s);
    b.classList.toggle('done', n < current);
    b.classList.toggle('current', n === current);
  });
  if (current === 5) { sectorNum.textContent = 'Finish'; sectorLabel.textContent = 'Chequered flag'; }
  else if (current > 0) {
    const s = sections.find((x) => x.dataset.sector === String(current));
    sectorNum.textContent = `S${current}`;
    sectorLabel.textContent = s.dataset.label;
  } else { sectorNum.textContent = 'S0'; sectorLabel.textContent = 'Lights out'; }

  // Timing tower rows slide in when the podium panel arrives
  const ti = sections.findIndex((s) => s.id === 'awards');
  if (y + vh * 0.6 >= starts[ti]) podium.classList.add('in');

  const ids = { 1: 'education', 2: 'experience', 3: 'awards', 4: 'about' };
  navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${ids[current]}`));
}

function requestTick() {
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}

window.addEventListener('scroll', requestTick, { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); measure(); requestTick(); });
wideQuery.addEventListener('change', () => { measure(); requestTick(); });

// Anchor links: jump to the section's start in flow (sticky panels report a stuck position)
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    const i = sections.indexOf(target);
    if (i < 0 && a.getAttribute('href') !== '#top') return;
    e.preventDefault();
    lightsOut();
    window.scrollTo({ top: i < 0 ? 0 : starts[i] + 1, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
});

measure();
frame();
document.fonts?.ready.then(() => { measure(); requestTick(); });
