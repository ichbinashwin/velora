// Homepage banner: three slides in a scroll-snap track (native swipe on touch),
// with labelled tabs, previous/next buttons and an auto-advance that can be
// paused (WCAG 2.2.2). Auto-advance runs on desktop only: never on phones and
// tablets (people swipe or tap the tabs), never for reduced-motion users, and
// it stops after any manual navigation.
(() => {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) return;
  const track = root.querySelector("[data-hb-track]");
  const slides = [...root.querySelectorAll("[data-hb-slide]")];
  const tabs = [...root.querySelectorAll("[data-hb-go]")];
  const pauseButton = root.querySelector("[data-hb-pause]");
  const INTERVAL_MS = 6500;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactLayout = window.matchMedia("(max-width: 991.98px)");
  const header = document.querySelector("[data-site-header]");

  // The mobile banner fills the screen below the header.
  function syncHeaderHeight() {
    if (header) document.documentElement.style.setProperty("--site-header-h", `${header.offsetHeight}px`);
  }

  let index = 0;
  let timer = null;
  let stopped = reducedMotion || compactLayout.matches; // paused, navigated, reduced motion, or phone/tablet
  let hovering = false;
  let focused = false;

  function setActive(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      slide.inert = !active;
    });
    tabs.forEach((tab, i) => {
      if (i === index) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });
    // Restart the progress bar animation on the active tab.
    root.classList.remove("is-ticking");
    void root.offsetWidth;
    if (isPlaying()) root.classList.add("is-ticking");
  }

  function goTo(next, smooth = true) {
    const target = (next + slides.length) % slides.length;
    track.scrollTo({ left: target * track.clientWidth, behavior: smooth && !reducedMotion ? "smooth" : "auto" });
    setActive(target);
  }

  const isPlaying = () => !stopped && !hovering && !focused && !document.hidden;

  function schedule() {
    window.clearTimeout(timer);
    root.classList.toggle("is-playing", !stopped);
    if (isPlaying()) {
      root.classList.add("is-ticking");
      timer = window.setTimeout(() => goTo(index + 1), INTERVAL_MS);
    } else {
      root.classList.remove("is-ticking");
    }
    pauseButton.setAttribute("aria-label", stopped ? root.dataset.labelPlay : root.dataset.labelPause);
  }

  function stopAutoplay() {
    stopped = true;
    schedule();
  }

  // Keep the active slide in sync when the visitor swipes or scrolls the track.
  let scrollFrame = 0;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const current = Math.round(track.scrollLeft / track.clientWidth);
      if (current !== index) setActive(current);
    });
  }, { passive: true });
  track.addEventListener("touchstart", stopAutoplay, { passive: true });
  track.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) stopAutoplay();
  }, { passive: true });

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    stopAutoplay();
    goTo(Number(tab.dataset.hbGo));
  }));
  root.querySelector("[data-hb-prev]").addEventListener("click", () => { stopAutoplay(); goTo(index - 1); });
  root.querySelector("[data-hb-next]").addEventListener("click", () => { stopAutoplay(); goTo(index + 1); });
  pauseButton.addEventListener("click", () => {
    stopped = !stopped;
    schedule();
  });

  root.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.target.closest("input, select, textarea")) return;
    event.preventDefault();
    stopAutoplay();
    goTo(index + (event.key === "ArrowRight" ? 1 : -1));
  });

  root.addEventListener("mouseenter", () => { hovering = true; schedule(); });
  root.addEventListener("mouseleave", () => { hovering = false; schedule(); });
  root.addEventListener("focusin", () => { focused = true; schedule(); });
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("resize", () => {
    syncHeaderHeight();
    goTo(index, false);
  });
  compactLayout.addEventListener("change", (event) => {
    if (event.matches) stopAutoplay();
  });

  syncHeaderHeight();
  root.classList.add("is-ready");
  setActive(0);
  schedule();
})();
