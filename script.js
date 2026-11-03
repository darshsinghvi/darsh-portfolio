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
}

if (reducedMotion) {
  lightsOut();
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

/* ---------- Layout measurements ---------- */
const sections = [...document.querySelectorAll('main > section')];
const stickies = sections.filter((s) => s.classList.contains('hero') || s.classList.contains('panel'));
const straight = document.querySelector('.straight');
const stints = document.querySelector('.stints');
const stintCards = [...document.querySelectorAll('.stint')];
const streaks = [...document.querySelectorAll('.streaks span')];
const spBar = document.querySelector('.sp-bar i');
const spCount = document.querySelector('.sp-count');
const tower = document.querySelector('.tower');

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
  if (y + vh * 0.6 >= starts[ti]) tower.classList.add('in');
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
