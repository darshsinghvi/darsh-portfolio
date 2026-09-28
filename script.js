const header = document.querySelector(".site-header");
const progress = document.querySelector(".progress span");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const copyButton = document.querySelector(".copy-email");
const toast = document.querySelector(".toast");
const year = document.querySelector("#year");
const heroScroll = document.querySelector(".hero-scroll");
const heroSticky = document.querySelector(".hero-sticky");
const heroScenes = [...document.querySelectorAll(".hero-scene")];
const heroCount = document.querySelector(".hero-count");
const education = document.querySelector(".education-showcase");
const educationRows = [...document.querySelectorAll(".education-card")];
const story = document.querySelector(".scroll-story");
const storySteps = [...document.querySelectorAll(".story-step")];
const storyCount = document.querySelector(".story-count span");
const marquee = document.querySelector(".marquee");
const marqueeTrack = document.querySelector(".marquee-track");
const f1Scroll = document.querySelector(".f1-scroll");
const f1TrackPath = document.querySelector(".f1-track-line");
const f1Car = document.querySelector(".f1-car");
const f1CarHalo = document.querySelector(".f1-car-halo");
const f1Chapters = [...document.querySelectorAll(".f1-chapter")];
const f1Lap = document.querySelector(".f1-lap-readout b");
const signalWindow = document.querySelector(".signal-window");
const signalPath = document.querySelector(".terminal-signal-line");
const signalCrossLine = document.querySelector(".signal-cross-line");
const signalCrossDot = document.querySelector(".signal-cross-dot");
const signalReadout = document.querySelector(".signal-readout strong");
const resultRows = [...document.querySelectorAll(".result-row")];
const marketLens = document.querySelector(".market-lens");
const lensLabel = document.querySelector(".lens-label");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const clamp = (value, minimum = 0, maximum = 1) =>
  Math.min(Math.max(value, minimum), maximum);

let activeStoryStep = 0;
let activeHeroScene = 0;
let activeF1Chapter = 0;
let f1TrackLength = 0;
let targetScroll = window.scrollY;
let smoothScroll = window.scrollY;
let motionFrame = null;
let lensTargetX = -100;
let lensTargetY = -100;
let lensCurrentX = -100;
let lensCurrentY = -100;

function updateHero(scrollTop) {
  if (!heroScroll || reducedMotion) return;

  const scrollable = Math.max(heroScroll.offsetHeight - window.innerHeight, 1);
  const heroProgress = clamp((scrollTop - heroScroll.offsetTop) / scrollable);
  const scenePosition = heroProgress * (heroScenes.length - 1);
  const nextScene = Math.round(scenePosition);

  heroScroll.style.setProperty("--hero-progress", heroProgress.toFixed(4));
  heroScroll.style.setProperty("--ring-one-rotation", `${heroProgress * 32}deg`);
  heroScroll.style.setProperty("--ring-two-rotation", `${heroProgress * -90}deg`);

  heroScenes.forEach((scene, index) => {
    const distance = scenePosition - index;
    const magnitude = Math.abs(distance);
    const opacity = clamp(1 - magnitude * 1.15);
    const translate = -distance * 115;
    const scale = 1 - Math.min(magnitude, 1) * 0.055;

    scene.style.opacity = opacity.toFixed(3);
    scene.style.transform = `translate3d(0, ${translate}px, 0) scale(${scale})`;
  });

  if (nextScene !== activeHeroScene) {
    activeHeroScene = nextScene;
    heroScenes.forEach((scene, index) => {
      const isActive = index === nextScene;
      scene.classList.toggle("active", isActive);
      scene.setAttribute("aria-hidden", String(!isActive));
    });
    heroCount.textContent = String(nextScene + 1).padStart(2, "0");
  }
}

function updateStory(scrollTop) {
  if (!story || reducedMotion) return;

  const scrollable = Math.max(story.offsetHeight - window.innerHeight, 1);
  const storyProgress = clamp((scrollTop - story.offsetTop) / scrollable);
  const stepPosition = storyProgress * (storySteps.length - 1);
  const nextStep = Math.round(stepPosition);

  story.style.setProperty("--story-progress", storyProgress.toFixed(4));

  storySteps.forEach((step, index) => {
    const distance = stepPosition - index;
    const magnitude = Math.abs(distance);
    step.style.opacity = clamp(1 - magnitude * 1.18).toFixed(3);
    step.style.transform = `translate3d(0, ${-distance * 34}px, 0)`;
  });

  if (nextStep !== activeStoryStep) {
    activeStoryStep = nextStep;
    storySteps.forEach((step, index) => {
      const isActive = index === nextStep;
      step.classList.toggle("active", isActive);
      step.setAttribute("aria-hidden", String(!isActive));
    });
    storyCount.textContent = String(nextStep + 1).padStart(2, "0");
  }
}

function updateEducation(scrollTop) {
  if (!education) return;

  if (reducedMotion) {
    education.style.setProperty("--education-progress", "1");
    educationRows.forEach((row) => row.style.setProperty("--row-progress", "1"));
    return;
  }

  const sectionTop = education.getBoundingClientRect().top + window.scrollY;
  const sectionTravel = Math.max(education.offsetHeight + window.innerHeight, 1);
  const sectionProgress = clamp((scrollTop + window.innerHeight - sectionTop) / sectionTravel);
  education.style.setProperty("--education-progress", sectionProgress.toFixed(4));

  educationRows.forEach((row) => {
    const rowTop = row.getBoundingClientRect().top + window.scrollY;
    const revealStart = rowTop - window.innerHeight * 0.88;
    const revealEnd = rowTop - window.innerHeight * 0.3;
    const rowProgress = clamp((scrollTop - revealStart) / Math.max(revealEnd - revealStart, 1));
    row.style.setProperty("--row-progress", rowProgress.toFixed(4));
  });
}

function updateF1(scrollTop) {
  if (!f1Scroll || !f1TrackPath) return;

  if (!f1TrackLength) {
    f1TrackLength = f1TrackPath.getTotalLength();
    f1TrackPath.style.strokeDasharray = `${f1TrackLength}`;
  }

  const sectionTop = f1Scroll.getBoundingClientRect().top + window.scrollY;
  const scrollable = Math.max(f1Scroll.offsetHeight - window.innerHeight, 1);
  const f1Progress = reducedMotion ? 0 : clamp((scrollTop - sectionTop) / scrollable);
  const chapterPosition = f1Progress * Math.max(f1Chapters.length - 1, 0);
  const nextChapter = Math.round(chapterPosition);

  f1Scroll.style.setProperty("--f1-progress", f1Progress.toFixed(4));
  f1TrackPath.style.strokeDashoffset = reducedMotion
    ? "0"
    : `${f1TrackLength * (1 - f1Progress)}`;

  const trackPoint = f1TrackPath.getPointAtLength(f1TrackLength * f1Progress);
  [f1Car, f1CarHalo].forEach((marker) => {
    if (!marker) return;
    marker.setAttribute("cx", trackPoint.x.toFixed(2));
    marker.setAttribute("cy", trackPoint.y.toFixed(2));
  });

  f1Chapters.forEach((chapter, index) => {
    const distance = chapterPosition - index;
    const magnitude = Math.abs(distance);
    chapter.style.opacity = clamp(1 - magnitude * 1.35).toFixed(3);
    chapter.style.transform = `translate3d(0, ${-distance * 58}px, 0) scale(${1 - Math.min(magnitude, 1) * 0.025})`;
  });

  if (nextChapter !== activeF1Chapter) {
    activeF1Chapter = nextChapter;
    f1Chapters.forEach((chapter, index) => {
      const isActive = index === nextChapter;
      chapter.classList.toggle("active", isActive);
      chapter.setAttribute("aria-hidden", String(!isActive));
    });
  }

  if (f1Lap) f1Lap.textContent = String(nextChapter + 1).padStart(2, "0");
}

function updateMotion(scrollTop = smoothScroll) {
  const actualScroll = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = scrollable > 0 ? actualScroll / scrollable : 0;

  header.classList.toggle("scrolled", actualScroll > 12);
  progress.style.transform = `scaleX(${pageProgress})`;

  updateHero(scrollTop);
  updateEducation(scrollTop);
  updateStory(scrollTop);
  updateF1(scrollTop);

  if (!reducedMotion && marquee && marqueeTrack) {
    const travel = window.innerHeight + marquee.offsetHeight;
    const marqueeProgress = clamp((scrollTop + window.innerHeight - marquee.offsetTop) / travel);
    const shift = -3 - marqueeProgress * 18;
    marqueeTrack.style.setProperty("--marquee-shift", `${shift}%`);
  }
}

function runMotionFrame() {
  const scrollDelta = targetScroll - smoothScroll;
  smoothScroll += scrollDelta * 0.14;

  const lensDeltaX = lensTargetX - lensCurrentX;
  const lensDeltaY = lensTargetY - lensCurrentY;
  lensCurrentX += lensDeltaX * 0.2;
  lensCurrentY += lensDeltaY * 0.2;

  if (marketLens && finePointer) {
    marketLens.style.transform = `translate3d(${lensCurrentX}px, ${lensCurrentY}px, 0) translate(-50%, -50%)`;
  }

  updateMotion(smoothScroll);

  const keepAnimating =
    Math.abs(scrollDelta) > 0.12 ||
    Math.abs(lensDeltaX) > 0.12 ||
    Math.abs(lensDeltaY) > 0.12;

  if (keepAnimating) motionFrame = window.requestAnimationFrame(runMotionFrame);
  else motionFrame = null;
}

function requestMotionUpdate() {
  targetScroll = window.scrollY;
  if (motionFrame === null) motionFrame = window.requestAnimationFrame(runMotionFrame);
}

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("scroll", requestMotionUpdate, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
  requestMotionUpdate();
});

const trailCanvas = document.querySelector(".cursor-trail");
if (finePointer && trailCanvas && !reducedMotion) {
  const context = trailCanvas.getContext("2d");
  const lifetime = 3000;
  let points = [];
  let trailFrame = null;

  function resizeTrail() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    trailCanvas.width = Math.round(window.innerWidth * ratio);
    trailCanvas.height = Math.round(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawTrail(now) {
    points = points.filter((point) => now - point.time < lifetime);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.lineCap = "round";
    context.lineJoin = "round";

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const point = points[index];
      if (point.breakBefore) continue;
      const fade = Math.pow(1 - (now - point.time) / lifetime, 1.35);
      const gradient = context.createLinearGradient(previous.x, previous.y, point.x, point.y);
      gradient.addColorStop(0, `hsl(${previous.hue}, 100%, 62%)`);
      gradient.addColorStop(1, `hsl(${point.hue}, 100%, 62%)`);
      context.strokeStyle = gradient;
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(point.x, point.y);
      context.lineWidth = 16;
      context.globalAlpha = fade * 0.14;
      context.stroke();
      context.lineWidth = 4;
      context.globalAlpha = fade * 0.9;
      context.stroke();
    }
    context.globalAlpha = 1;

    const head = points[points.length - 1];
    if (head) {
      const fade = 1 - (now - head.time) / lifetime;
      context.fillStyle = `hsla(${head.hue}, 100%, 62%, ${fade})`;
      context.beginPath();
      context.arc(head.x, head.y, 3, 0, Math.PI * 2);
      context.fill();
    }
    trailFrame = points.length ? window.requestAnimationFrame(drawTrail) : null;
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const now = performance.now();
    const previous = points[points.length - 1];
    points.push({
      x: event.clientX,
      y: event.clientY,
      time: now,
      hue: previous
        ? (previous.hue + Math.hypot(event.clientX - previous.x, event.clientY - previous.y) * 0.45 + (now - previous.time) * 0.025) % 360
        : (now * 0.06) % 360,
      breakBefore: !previous || now - previous.time > 100,
    });
    if (points.length > 600) points.splice(0, points.length - 600);
    if (trailFrame === null) trailFrame = window.requestAnimationFrame(drawTrail);
  }, { passive: true });

  window.addEventListener("resize", resizeTrail);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) points = [];
  });
  resizeTrail();
}

if (finePointer && heroSticky && !reducedMotion) {
  heroSticky.addEventListener("pointermove", (event) => {
    const offsetX = event.clientX - window.innerWidth * 0.72;
    const offsetY = event.clientY - window.innerHeight * 0.46;
    heroScroll.style.setProperty("--pointer-x", `${event.clientX}px`);
    heroScroll.style.setProperty("--pointer-y", `${event.clientY}px`);
    heroScroll.style.setProperty("--ring-one-x", `${offsetX * 0.018}px`);
    heroScroll.style.setProperty("--ring-one-y", `${offsetY * 0.018}px`);
    heroScroll.style.setProperty("--ring-two-x", `${offsetX * -0.025}px`);
    heroScroll.style.setProperty("--ring-two-y", `${offsetY * -0.025}px`);
  });

  heroSticky.addEventListener("pointerleave", () => {
    heroScroll.style.setProperty("--pointer-x", "72vw");
    heroScroll.style.setProperty("--pointer-y", "46vh");
  });
}

if (finePointer && signalWindow && signalPath) {
  const pathLength = signalPath.getTotalLength();

  signalWindow.addEventListener("pointermove", (event) => {
    const svg = signalWindow.querySelector("svg");
    const rect = svg.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width);
    const targetX = ratio * 760;
    let low = 0;
    let high = pathLength;

    for (let index = 0; index < 15; index += 1) {
      const middle = (low + high) / 2;
      const point = signalPath.getPointAtLength(middle);
      if (point.x < targetX) low = middle;
      else high = middle;
    }

    const point = signalPath.getPointAtLength((low + high) / 2);
    signalCrossLine.setAttribute("x1", point.x.toFixed(2));
    signalCrossLine.setAttribute("x2", point.x.toFixed(2));
    signalCrossDot.setAttribute("cx", point.x.toFixed(2));
    signalCrossDot.setAttribute("cy", point.y.toFixed(2));
    signalReadout.textContent = `SCAN ${String(Math.round(ratio * 99)).padStart(2, "0")}`;
    signalWindow.classList.add("pointer-active");
  });

  signalWindow.addEventListener("pointerleave", () => {
    signalWindow.classList.remove("pointer-active");
  });
}

if (finePointer) {
  resultRows.forEach((row) => {
    row.addEventListener("pointermove", (event) => {
      const rect = row.getBoundingClientRect();
      row.style.setProperty("--row-x", `${event.clientX - rect.left}px`);
      row.style.setProperty("--row-y", `${event.clientY - rect.top}px`);
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -30px" }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

copyButton.addEventListener("click", async () => {
  const email = copyButton.dataset.email;

  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = "Copied";
    toast.classList.add("visible");

    window.setTimeout(() => {
      copyButton.textContent = "Copy email";
      toast.classList.remove("visible");
    }, 1800);
  } catch {
    window.location.href = "mailto:" + email;
  }
});

year.textContent = String(new Date().getFullYear());

document.body.classList.add("ready");
updateMotion();
