// Mobile menu for pages that share the main site header but cannot use inline
// scripts (Products pages run under a strict Content-Security-Policy).
(() => {
  // Language selector on pages without their own handler (only the four homepages are allowed targets).
  document.querySelectorAll("[data-legal-lang]").forEach((select) => select.addEventListener("change", () => {
    if (/^\/(?:(?:gu|hi|de)\/)?$/.test(select.value)) window.location.href = select.value;
  }));

  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-nav-panel]");
  if (!toggle || !panel) return;

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  }

  toggle.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
})();
