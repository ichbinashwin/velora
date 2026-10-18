// Homepage manufacturing quote form: validated with validate.js and sent as a
// WhatsApp message in the page language. Enquiry type and product must match
// the options in the page configuration (allowlist).
(() => {
  const config = JSON.parse(document.getElementById("quote-config").textContent);
  const { ui, msg, limits, types, products } = config;
  const V = window.VeloraValidate(ui, limits);
  const SEND_COOLDOWN_MS = 4000;
  const LOCALE = { en: "en-IN", gu: "gu-IN", hi: "hi-IN", de: "de-DE" }[config.lang] || "en-IN";
  const whatsappNumber = /^\d{10,15}$/.test(config.whatsapp) ? config.whatsapp : null;

  const form = document.querySelector("[data-quote-form]");
  if (!form) return;
  const field = (name) => form.querySelector(`[name="${name}"]`);
  const summary = form.querySelector("[data-quote-summary]");
  const preview = form.querySelector("[data-quote-preview]");
  const date = field("quote-date");

  const today = new Date();
  const last = new Date(today);
  last.setDate(last.getDate() + limits.date_max_days);
  date.min = V.isoDate(today);
  date.max = V.isoDate(last);

  const checked = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value;
  const allowed = (value, map) => (Object.hasOwn(map, value) ? value : null);

  function read() {
    return {
      type: allowed(checked("quote-type"), types),
      product: allowed(field("quote-product").value, products),
      sample: checked("quote-sample") === "yes" ? "yes" : "no",
      qtyOk: V.isIntInRange(field("quote-qty").value, 1, limits.quote_qty_max),
      qty: V.clampInt(field("quote-qty").value, 1, limits.quote_qty_max),
      date: V.checkDate(date.value),
      country: V.checkCountry(field("quote-country").value),
      city: V.checkCity(field("quote-city").value),
      name: V.checkName(field("quote-name").value),
      company: V.checkCompany(field("quote-company").value),
      notes: V.checkNotes(field("quote-notes").value)
    };
  }

  function message(d) {
    const lines = [msg.greet, "", msg.intro, ""];
    lines.push(`${msg.type}: ${types[d.type]}`);
    lines.push(`${msg.product}: ${products[d.product]}`);
    lines.push(`${msg.qty}: ${d.qty} ${msg.pcs}`);
    lines.push(`${msg.sample}: ${d.sample === "yes" ? ui.yes : ui.no}`);
    if (d.date.date) lines.push(`${msg.date}: ${new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", year: "numeric" }).format(d.date.date)}`);
    if (!d.notes.error && d.notes.value) lines.push(`${msg.notes}: ${d.notes.value}`);
    lines.push("");
    if (!d.name.error) lines.push(`${msg.name}: ${d.name.value}`);
    if (!d.company.error && d.company.value) lines.push(`${msg.company}: ${d.company.value}`);
    if (!d.city.error) lines.push(`${msg.city}: ${d.city.value}`);
    if (!d.country.error) lines.push(`${msg.country}: ${d.country.value}`);
    lines.push("", msg.close, "", msg.thanks);
    return lines.join("\n");
  }

  function updatePreview() {
    const d = read();
    preview.textContent = d.type && d.product ? message(d) : "";
  }

  const checks = [
    ["quote-qty", (d) => (d.qtyOk ? "" : ui.err_qty)],
    ["quote-date", (d) => d.date.error],
    ["quote-country", (d) => d.country.error],
    ["quote-city", (d) => d.city.error],
    ["quote-name", (d) => d.name.error],
    ["quote-company", (d) => d.company.error],
    ["quote-notes", (d) => d.notes.error]
  ];

  checks.forEach(([name, check]) => {
    const input = field(name);
    input.addEventListener("blur", () => { if (input.value) V.showFieldError(input, check(read())); });
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && !check(read())) V.showFieldError(input, "");
    });
  });
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);

  let lastSent = 0;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!whatsappNumber) return;
    const d = read();
    const errors = checks.map(([name, check]) => [field(name), check(d)]);
    errors.forEach(([input, error]) => V.showFieldError(input, error));
    const firstInvalid = errors.find(([, error]) => error);
    if (firstInvalid || !d.type || !d.product) {
      summary.textContent = ui.err_fix;
      summary.hidden = false;
      if (firstInvalid) firstInvalid[0].focus();
      return;
    }
    summary.hidden = true;
    // Show the cleaned values so the visitor sees exactly what is sent.
    ["country", "city", "name", "company", "notes"].forEach((key) => { field(`quote-${key}`).value = d[key].value; });
    updatePreview();

    const now = Date.now();
    if (now - lastSent < SEND_COOLDOWN_MS) return;
    lastSent = now;
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    window.setTimeout(() => { button.disabled = false; }, SEND_COOLDOWN_MS);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message(d))}`, "_blank", "noopener,noreferrer");
  });

  updatePreview();
})();
