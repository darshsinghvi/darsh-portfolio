const header = document.querySelector(".site-header");
const progress = document.querySelector(".progress span");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const copyButton = document.querySelector(".copy-email");
const toast = document.querySelector(".toast");
const year = document.querySelector("#year");
const heroScroll = document.querySelector(".hero-scroll");
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

  updateMotion(smoothScroll);

  const keepAnimating = Math.abs(scrollDelta) > 0.12;

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
