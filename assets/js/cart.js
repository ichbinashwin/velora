// Products page: one order form, a cart (add / update / remove / empty) and a
// WhatsApp order message written in the page language. The cart is kept only
// in this browser and is shared by all language versions of the page.
//
// Input handling follows OWASP guidance: every value that reaches the message
// is allowlist-validated (products, options, quantities) or normalised and
// pattern-checked (name, city); the DOM is only written with textContent; and
// the WhatsApp URL is built from a fixed host, a digits-only number and an
// encoded message. This is client-side protection against accidental or casual
// bad input. It cannot stop someone messaging the WhatsApp number directly.
(() => {
  const catalog = JSON.parse(document.getElementById("catalog").textContent);
  const { ui, msg, limits } = catalog;
  const STORAGE_KEY = "velora_cart_v1";
  const SEND_COOLDOWN_MS = 4000;
  const products = Object.fromEntries(catalog.products.map((p) => [p.id, p]));
  const whatsappNumber = /^\d{10,15}$/.test(catalog.whatsapp) ? catalog.whatsapp : null;

  const form = document.querySelector("[data-order-form]");
  const field = (name) => form.querySelector(`[data-field="${name}"]`);
  const status = document.querySelector("[data-form-status]");
  const list = document.querySelector("[data-cart-items]");
  const emptyMsg = document.querySelector("[data-cart-empty-msg]");
  const emptyBtn = document.querySelector("[data-cart-empty]");
  const totals = document.querySelector("[data-cart-totals]");
  const checkout = document.querySelector("[data-checkout]");
  const preview = document.querySelector("[data-cart-preview]");
  const custName = document.querySelector("[data-cust-name]");
  const custCity = document.querySelector("[data-cust-city]");
  const errorSummary = document.querySelector("[data-error-summary]");
  const sendButton = document.querySelector("[data-cart-send]");

  const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);

  // ---- Validation -----------------------------------------------------------

  // Control characters, and invisible format characters such as bidi overrides
  // (U+202A–U+202E, U+2066–U+2069) and zero-width spaces, which can disguise
  // text. ZWNJ/ZWJ (U+200C/U+200D) are kept because Gujarati and Hindi need them.
  const INVISIBLE = /[\p{Cc}\p{Cf}\p{Co}\p{Cn}\u2028\u2029]/gu;
  const KEEP_JOINERS = /[\u200C\u200D]/;
  // Letters (any script) with combining marks, plus . ' ’ - and spaces.
  const NAME_PATTERN = /^[\p{L}\p{M}](?:[\p{L}\p{M} .'’-]*[\p{L}\p{M}.])?$/u;
  // Letters, digits, spaces and , . / - for "City / PIN code".
  const CITY_PATTERN = /^[\p{L}\p{M}\p{N}](?:[\p{L}\p{M}\p{N} ,./-]*[\p{L}\p{M}\p{N}.])?$/u;
  // Anything that looks like a link or a web address.
  const LINK_PATTERN = /(?:https?|ftp|file|javascript|data|mailto|tel|whatsapp)\s*:|www\.|[\p{L}\p{N}-]+\.(?:com|net|org|in|io|co|me|ly|xyz|info|biz|app|link|site|online|shop|store|top|click|ru|cn|tk)\b/iu;
  // 7+ digits in a row: phone numbers, UPI/bank references; a PIN code has 6.
  const LONG_NUMBER = /\d{7,}/;
  // Bidi embedding/override/isolate controls only appear in deliberately crafted
  // text (e.g. disguising "exe.txt"), so input containing them is rejected.
  const BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/u;
  // A dot followed by 2+ letters looks like a domain or file extension; initials
  // such as "A.K. Sharma" are still allowed.
  const DOT_WORD = /\.\p{L}{2,}/u;

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .replace(INVISIBLE, (ch) => (KEEP_JOINERS.test(ch) ? ch : ""))
      .trim();
  }

  function checkName(raw) {
    const value = normalizeText(raw);
    if (!value) return { value, error: ui.err_name_required };
    const valid = !BIDI_CONTROLS.test(raw) && value.length >= 2 && value.length <= limits.name_max
      && NAME_PATTERN.test(value) && !LINK_PATTERN.test(value) && !DOT_WORD.test(value);
    return { value, error: valid ? "" : ui.err_name_invalid };
  }

  function checkCity(raw) {
    const value = normalizeText(raw);
    if (!value) return { value, error: ui.err_city_required };
    const valid = !BIDI_CONTROLS.test(raw) && value.length >= 2 && value.length <= limits.city_max
      && CITY_PATTERN.test(value) && !LINK_PATTERN.test(value) && !LONG_NUMBER.test(value);
    return { value, error: valid ? "" : ui.err_city_invalid };
  }

  function clampQty(value) {
    const qty = Number.parseInt(value, 10);
    return Number.isFinite(qty) ? Math.min(limits.qty_max, Math.max(1, qty)) : 1;
  }

  // A cart item is valid only if every option is one the catalog offers for
  // that product. This rejects edited form values and tampered localStorage.
  function validItem(item) {
    if (!item || typeof item !== "object") return null;
    const product = Object.hasOwn(products, item.p) ? products[item.p] : null;
    if (!product) return null;
    const pack = Number(item.pack);
    if (!product.materials.includes(item.m) || !product.sizes.includes(item.s)
      || !product.colours.includes(item.c) || !product.packs.includes(pack)) return null;
    return { p: item.p, m: item.m, s: item.s, c: item.c, pack, qty: clampQty(item.qty) };
  }

  function showFieldError(input, error) {
    const slot = input.parentElement.querySelector(".pp-error");
    input.setAttribute("aria-invalid", error ? "true" : "false");
    slot.textContent = error;
    slot.hidden = !error;
  }

  // ---- Storage --------------------------------------------------------------

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw.map(validItem).filter(Boolean).slice(0, limits.cart_max) : [];
    } catch (error) {
      return [];
    }
  }

  let cart = load();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // Storage may be unavailable (private mode); the cart still works for this visit.
    }
  }

  // ---- Form -----------------------------------------------------------------

  function option(value, label) {
    const el = document.createElement("option");
    el.value = value;
    el.textContent = label;
    return el;
  }

  function setProduct(id) {
    const product = products[id];
    field("product").value = id;
    field("material").replaceChildren(...product.materials.map((m) => option(m, catalog.materials[m])));
    field("size").replaceChildren(...product.sizes.map((s) => option(s, s)));
    field("pack").replaceChildren(...product.packs.map((n) => option(n, fill(ui.pack_of, { n }))));
    field("colour").replaceChildren(...product.colours.map((c, index) => {
      const label = document.createElement("label");
      label.className = "pp-swatch";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "colour";
      input.value = c;
      input.checked = index === 0;
      const dot = document.createElement("span");
      dot.className = `pp-dot sw-${c}`;
      const text = document.createElement("span");
      text.textContent = catalog.colours[c];
      label.append(input, dot, text);
      return label;
    }));
  }

  // ---- Cart and message -----------------------------------------------------

  function describe(item) {
    return `${catalog.materials[item.m]} · ${item.s} · ${catalog.colours[item.c]}`;
  }

  function sums() {
    return cart.reduce((acc, item) => ({
      items: acc.items + 1,
      packs: acc.packs + item.qty,
      pieces: acc.pieces + item.qty * item.pack
    }), { items: 0, packs: 0, pieces: 0 });
  }

  function orderType() {
    const checked = document.querySelector('input[name="order-type"]:checked');
    return checked && (checked.value === "wholesale" || checked.value === "retail") ? checked.value : "retail";
  }

  // Only catalog text, validated options and checked customer fields reach the message.
  function message(name, city) {
    const lines = [msg.greet, "", msg.intro, ""];
    cart.forEach((item, index) => {
      lines.push(`${index + 1}. ${products[item.p].name}`);
      lines.push(`   ${describe(item)}`);
      lines.push(`   ${fill(msg.qty, { qty: item.qty, pack: item.pack, pieces: item.qty * item.pack })}`);
      lines.push("");
    });
    lines.push(fill(msg.total, sums()));
    lines.push(`${msg.type}: ${ui[orderType()]}`);
    if (name) lines.push(`${msg.name}: ${name}`);
    if (city) lines.push(`${msg.city}: ${city}`);
    lines.push("", msg.close, "", msg.thanks);
    return lines.join("\n");
  }

  function currentCustomer() {
    const name = checkName(custName.value);
    const city = checkCity(custCity.value);
    return { name: name.error ? "" : name.value, city: city.error ? "" : city.value };
  }

  function setQty(index, qty) {
    cart[index].qty = clampQty(qty);
    save();
    render();
  }

  function stepButton(label, text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pp-step";
    button.textContent = text;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", onClick);
    return button;
  }

  function renderItem(item, index) {
    const li = document.createElement("li");
    li.className = "pp-cart-item";

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = products[item.p].name;
    const details = document.createElement("span");
    details.textContent = describe(item);
    const packs = document.createElement("span");
    packs.className = "pp-cart-pack";
    packs.textContent = `${fill(ui.pack_of, { n: item.pack })} · ${item.qty * item.pack} ${ui.pcs}`;
    info.append(name, details, packs);

    const controls = document.createElement("div");
    controls.className = "pp-cart-controls";
    const qty = document.createElement("input");
    qty.type = "number";
    qty.min = "1";
    qty.max = String(limits.qty_max);
    qty.step = "1";
    qty.value = String(item.qty);
    qty.inputMode = "numeric";
    qty.setAttribute("aria-label", `${products[item.p].name}: ${fill(ui.pack_of, { n: item.pack })}`);
    qty.addEventListener("change", () => setQty(index, qty.value));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "pp-link-btn pp-remove";
    remove.textContent = ui.remove;
    remove.addEventListener("click", () => {
      cart.splice(index, 1);
      save();
      render();
    });
    controls.append(
      stepButton(ui.decrease, "−", () => setQty(index, item.qty - 1)),
      qty,
      stepButton(ui.increase, "+", () => setQty(index, item.qty + 1)),
      remove
    );

    li.append(info, controls);
    return li;
  }

  function render() {
    const hasItems = cart.length > 0;
    list.replaceChildren(...cart.map(renderItem));
    emptyMsg.hidden = hasItems;
    emptyBtn.hidden = !hasItems;
    totals.hidden = !hasItems;
    checkout.hidden = !hasItems;
    totals.textContent = fill(ui.totals, sums());
    const customer = currentCustomer();
    preview.textContent = hasItems ? message(customer.name, customer.city) : "";
    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = String(cart.length);
    });
  }

  // ---- Events ---------------------------------------------------------------

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const item = validItem({
      p: data.get("product"),
      m: data.get("material"),
      s: data.get("size"),
      c: data.get("colour"),
      pack: data.get("pack"),
      qty: data.get("qty")
    });
    if (!item) {
      status.textContent = ui.err_item;
      setProduct(Object.hasOwn(products, field("product").value) ? field("product").value : catalog.products[0].id);
      return;
    }
    const same = cart.find((x) => x.p === item.p && x.m === item.m && x.s === item.s && x.c === item.c && x.pack === item.pack);
    if (same) {
      same.qty = clampQty(same.qty + item.qty);
    } else if (cart.length >= limits.cart_max) {
      status.textContent = fill(ui.err_cart_full, { max: limits.cart_max });
      return;
    } else {
      cart.push(item);
    }
    save();
    render();
    status.textContent = fill(ui.added, { item: `${products[item.p].name} (${describe(item)})` });
  });

  field("product").addEventListener("change", () => {
    const id = field("product").value;
    if (Object.hasOwn(products, id)) setProduct(id);
  });

  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      setProduct(button.dataset.select);
      form.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      field("material").focus({ preventScroll: true });
    });
  });

  emptyBtn.addEventListener("click", () => {
    if (window.confirm(ui.empty_confirm)) {
      cart = [];
      save();
      render();
    }
  });

  // Validate as the visitor leaves a field (not on every keystroke), and
  // clear an error as soon as the value becomes valid.
  [[custName, checkName], [custCity, checkCity]].forEach(([input, check]) => {
    input.addEventListener("blur", () => {
      if (input.value) showFieldError(input, check(input.value).error);
    });
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true" && !check(input.value).error) showFieldError(input, "");
      render();
    });
  });
  document.querySelectorAll('input[name="order-type"]').forEach((input) => input.addEventListener("change", render));

  let lastSent = 0;
  sendButton.addEventListener("click", () => {
    if (!cart.length || !whatsappNumber) return;
    cart = cart.map(validItem).filter(Boolean);
    const name = checkName(custName.value);
    const city = checkCity(custCity.value);
    showFieldError(custName, name.error);
    showFieldError(custCity, city.error);
    if (name.error || city.error) {
      errorSummary.textContent = ui.err_fix;
      errorSummary.hidden = false;
      (name.error ? custName : custCity).focus();
      return;
    }
    errorSummary.hidden = true;
    // Show the cleaned values so the visitor sees exactly what is sent.
    custName.value = name.value;
    custCity.value = city.value;
    render();

    const now = Date.now();
    if (now - lastSent < SEND_COOLDOWN_MS) return;
    lastSent = now;
    sendButton.disabled = true;
    window.setTimeout(() => { sendButton.disabled = false; }, SEND_COOLDOWN_MS);

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message(name.value, city.value))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  document.querySelector("[data-lang-select]").addEventListener("change", (event) => {
    // Only the language pages offered in the menu are allowed as targets.
    const target = event.target.value;
    if (/^\/(?:(?:gu|hi|de)\/)?products\/$/.test(target)) window.location.href = target;
  });

  // Links such as /products/#p-car preselect that product in the order form.
  const fromHash = location.hash.replace("#p-", "");
  setProduct(Object.hasOwn(products, fromHash) ? fromHash : catalog.products[0].id);
  render();
})();
