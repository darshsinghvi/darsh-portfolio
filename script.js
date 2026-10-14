const header = document.querySelector('.site-header');
const progress = document.querySelector('.top-progress span');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-header nav');
const circuit = document.querySelector('.circuit-scroll');
const circuitPath = document.querySelector('.circuit-track');
const circuitCar = document.querySelector('.circuit-car');
const circuitHalo = document.querySelector('.circuit-car-halo');
const cornerCopies = [...document.querySelectorAll('.corner-copy')];
const sectorBars = [...document.querySelectorAll('.sector-bars span')];
const lapReadout = document.querySelector('.lap-readout b');
const heroPath = document.querySelector('.track-line');
const heroCar = document.querySelector('.hero-car');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let circuitLength = 0;

function clamp(value, min = 0, max = 1) { return Math.min(Math.max(value, min), max); }

function updateScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${pageProgress})`;
  header.classList.toggle('scrolled', window.scrollY > 10);

  if (!circuit || !circuitPath) return;
  if (!circuitLength) circuitLength = circuitPath.getTotalLength();
  const sectionTop = circuit.offsetTop;
  const travel = Math.max(circuit.offsetHeight - window.innerHeight, 1);
  const lapProgress = reducedMotion ? 1 : clamp((window.scrollY - sectionTop) / travel);
  const point = circuitPath.getPointAtLength(circuitLength * lapProgress);
  circuitCar.setAttribute('cx', point.x.toFixed(2));
  circuitCar.setAttribute('cy', point.y.toFixed(2));
  circuitHalo.setAttribute('cx', point.x.toFixed(2));
  circuitHalo.setAttribute('cy', point.y.toFixed(2));
  const corner = Math.min(3, Math.floor(lapProgress * 4));
  cornerCopies.forEach((copy, index) => copy.classList.toggle('active', index === corner));
  lapReadout.textContent = String(corner + 1).padStart(2, '0');
  sectorBars.forEach((bar, index) => { bar.style.background = index <= corner ? 'var(--red)' : 'rgba(255,255,255,.12)'; });
}

function updateHeroCar() {
  if (!heroPath || !heroCar) return;
  const length = heroPath.getTotalLength();
  const point = heroPath.getPointAtLength(length * 0.18);
  heroCar.setAttribute('cx', point.x.toFixed(2));
  heroCar.setAttribute('cy', point.y.toFixed(2));
}

function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); nav.classList.toggle('open', !open); });
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); updateScroll(); });

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: '0px 0px -30px' });
document.querySelectorAll('.reveal').forEach((element) => { if (reducedMotion) element.classList.add('visible'); else observer.observe(element); });

document.querySelector('#year').textContent = new Date().getFullYear();
updateHeroCar();
updateScroll();
