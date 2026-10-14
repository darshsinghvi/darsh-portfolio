const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-line span');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const year = document.querySelector('#year');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${amount})`;
  header.classList.toggle('scrolled', window.scrollY > 12);
}

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
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); updateScroll(); });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((element) => {
  if (reducedMotion) element.classList.add('visible');
  else observer.observe(element);
});

year.textContent = new Date().getFullYear();
updateScroll();
