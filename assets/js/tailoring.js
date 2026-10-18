// Tailoring enquiry: one form whose answers are validated (validate.js) and
// sent as a WhatsApp message in the page language. Category, garment, fabric
// and measurement values must match the catalog allowlist.
(() => {
  const catalog = JSON.parse(document.getElementById("catalog").textContent);
  const { ui, msg, limits, tailoring } = catalog;
  const tmsg = catalog.tmsg;
  const V = window.VeloraValidate(ui, limits);
  const SEND_COOLDOWN_MS = 4000;
  const LOCALE = { en: "en-IN", gu: "gu-IN", hi: "hi-IN", de: "de-DE" }[catalog.lang] || "en-IN";
  const whatsappNumber = /^\d{10,15}$/.test(catalog.whatsapp) ? catalog.whatsapp : null;
  const categories = Object.fromEntries(tailoring.categories.map((c) => [c.id, c]));

  const form = document.querySelector("[data-tailor-form]");
  if (!form) return;
  const garment = form.querySelector("[data-tailor-garment]");
  const qty = form.querySelector("[data-tailor-qty]");
  const date = form.querySelector("[data-tailor-date]");
  const notes = form.querySelector("[data-tailor-notes]");
  const name = form.querySelector("[data-tailor-name]");
  const city = form.querySelector("[data-tailor-city]");
  const preview = form.querySelector("[data-tailor-preview]");
  const summary = form.querySelector("[data-tailor-summary]");
  const sendButton = form.querySelector("[data-tailor-send]");

  const checked = (fieldName) => form.querySelector(`input[name="${fieldName}"]:checked`);
  const allowed = (value, list) => (list.includes(value) ? value : null);

  // Date picker limits: today .. today + limit.
  const today = new Date();
  const last = new Date(today);
  last.setDate(last.getDate() + limits.date_max_days);
  date.min = V.isoDate(today);
  date.max = V.isoDate(last);

  function setCategory(id) {
    const category = categories[id];
    garment.replaceChildren(...category.garments.map((g) => {
      const option = document.createElement("option");
      option.value = g;
      option.textContent = tailoring.garments[g];
      return option;
    }));
  }

  // Read the form; every choice is checked against the catalog.
  function read() {
    const categoryId = allowed(checked("tailor-category")?.value, Object.keys(categories));
    const garmentId = categoryId ? allowed(garment.value, categories[categoryId].garments) : null;
    return {
      categoryId,
      garmentId,
      fabric: allowed(checked("tailor-fabric")?.value, Object.keys(tailoring.fabric)),
      measure: allowed(checked("tailor-measure")?.value, Object.keys(tailoring.measure)),
      qtyOk: V.isIntInRange(qty.value, 1, limits.tailor_qty_max),
      qty: V.clampInt(qty.value, 1, limits.tailor_qty_max),
      date: V.checkDate(date.value),
      notes: V.checkNotes(notes.value),
      name: V.checkName(name.value),
      city: V.checkCity(city.value)
    };
  }

  function message(data) {
    const lines = [msg.greet, "", tmsg.intro, ""];
    lines.push(`${tmsg.category}: ${categories[data.categoryId].name}`);
    lines.push(`${tmsg.garment}: ${tailoring.garments[data.garmentId]}`);
    lines.push(`${tmsg.qty}: ${data.qty} ${ui.pcs}`);
    lines.push(`${tmsg.fabric}: ${tailoring.fabric[data.fabric]}`);
    lines.push(`${tmsg.measure}: ${tailoring.measure[data.measure]}`);
    if (data.date.date) {
      lines.push(`${tmsg.date}: ${new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", year: "numeric" }).format(data.date.date)}`);
    }
    if (data.notes.value && !data.notes.error) lines.push(`${tmsg.notes}: ${data.notes.value}`);
    lines.push("");
    if (!data.name.error) lines.push(`${msg.name}: ${data.name.value}`);
    if (!data.city.error) lines.push(`${msg.city}: ${data.city.value}`);
    lines.push("", tmsg.close, "", msg.thanks);
    return lines.join("\n");
  }

  function updatePreview() {
    const data = read();
    preview.textContent = data.categoryId && data.garmentId && data.fabric && data.measure ? message(data) : "";
  }

  form.addEventListener("change", (event) => {
    if (event.target.name === "tailor-category" && Object.hasOwn(categories, event.target.value)) {
      setCategory(event.target.value);
    }
    updatePreview();
  });
  form.addEventListener("input", updatePreview);

  // Validate each field when the visitor leaves it; clear errors once fixed.
  const fieldChecks = [
    [name, () => V.checkName(name.value).error],
    [city, () => V.checkCity(city.value).error],
    [notes, () => V.checkNotes(notes.value).error],
    [date, () => V.checkDate(date.value).error],
    [qty, () => (V.isIntInRange(qty.value, 1, limits.tailor_qty_max) ? "" : ui.err_tqty)]
  ];
  fieldChecks.forEach(([input, check]) => {
    input.addEventListener("blur", () => {
      if (input.value || input === qty) V.showFieldError(input, check());
    });
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && !check()) V.showFieldError(input, "");
    });
  });

  let lastSent = 0;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!whatsappNumber) return;
    const data = read();
    const errors = [
      [qty, data.qtyOk ? "" : ui.err_tqty],
      [date, data.date.error],
      [notes, data.notes.error],
      [name, data.name.error],
      [city, data.city.error]
    ];
    errors.forEach(([input, error]) => V.showFieldError(input, error));
    const firstInvalid = errors.find(([, error]) => error);
    if (firstInvalid || !data.categoryId || !data.garmentId || !data.fabric || !data.measure) {
      summary.textContent = ui.err_fix;
      summary.hidden = false;
      if (firstInvalid) firstInvalid[0].focus();
      return;
    }
    summary.hidden = true;
    // Show the cleaned values so the visitor sees exactly what is sent.
    name.value = data.name.value;
    city.value = data.city.value;
    notes.value = data.notes.value;
    updatePreview();

    const now = Date.now();
    if (now - lastSent < SEND_COOLDOWN_MS) return;
    lastSent = now;
    sendButton.disabled = true;
    window.setTimeout(() => { sendButton.disabled = false; }, SEND_COOLDOWN_MS);

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message(data))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  const initial = checked("tailor-category");
  setCategory(initial && Object.hasOwn(categories, initial.value) ? initial.value : tailoring.categories[0].id);
  updatePreview();
})();
