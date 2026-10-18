// Velora Home order list: collect products on any napkins page and send the
// whole order as one WhatsApp message or email. Stored only in this browser.
(() => {
  const config = document.currentScript.dataset;
  const STORAGE_KEY = "velora_home_order_v1";

  const panel = document.querySelector("[data-order-panel]");
  const toggle = document.querySelector("[data-order-toggle]");
  const count = document.querySelector("[data-order-count]");
  const list = document.querySelector("[data-order-items]");
  const empty = document.querySelector("[data-order-empty]");
  const form = document.querySelector("[data-order-form]");

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  let items = load();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // Storage can be unavailable (private mode); the list still works for this visit.
    }
  }

  function describe(item) {
    return `${item.product} – ${item.material}, ${item.size}, ${item.colour}, ${item.qty} × pack of ${item.pack}`;
  }

  function render() {
    count.textContent = String(items.length);
    list.replaceChildren(...items.map((item, index) => {
      const li = document.createElement("li");
      li.textContent = describe(item);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${item.product}`);
      remove.addEventListener("click", () => {
        items.splice(index, 1);
        save();
        render();
      });
      li.append(remove);
      return li;
    }));
    empty.hidden = items.length > 0;
    form.hidden = items.length === 0;
  }

  function readForm(productForm) {
    const data = new FormData(productForm);
    const colourInput = productForm.querySelector("input[type=radio]:checked");
    return {
      product: productForm.dataset.product,
      material: data.get("material"),
      size: data.get("size"),
      colour: colourInput ? colourInput.value : "",
      pack: data.get("pack"),
      qty: Math.max(1, parseInt(data.get("qty"), 10) || 1)
    };
  }

  function message(orderItems) {
    const lines = [`Hello ${config.brand}, I would like to order:`, ""];
    orderItems.forEach((item, index) => lines.push(`${index + 1}. ${describe(item)}`));
    const type = document.querySelector("[data-order-type]");
    const name = document.querySelector("[data-order-name]");
    const city = document.querySelector("[data-order-city]");
    lines.push("");
    if (type) lines.push(`Order type: ${type.value}`);
    if (name && name.value.trim()) lines.push(`Name: ${name.value.trim()}`);
    if (city && city.value.trim()) lines.push(`City / PIN: ${city.value.trim()}`);
    lines.push(`(Sent from ${location.hostname}${location.pathname})`);
    return lines.join("\n");
  }

  function openWhatsApp(text) {
    window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  function setPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("button, select, input")?.focus();
  }

  document.querySelectorAll("[data-product-form]").forEach((productForm) => {
    const status = productForm.querySelector("[data-add-status]");
    productForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const item = readForm(productForm);
      items.push(item);
      save();
      render();
      status.textContent = `Added: ${item.colour}, ${item.size}. ${items.length} item(s) in your order list.`;
    });

    productForm.querySelector("[data-order-now]").addEventListener("click", () => {
      openWhatsApp(message([readForm(productForm)]));
    });
  });

  toggle.addEventListener("click", () => setPanel(panel.hidden));
  document.querySelector("[data-order-close]").addEventListener("click", () => {
    setPanel(false);
    toggle.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setPanel(false);
      toggle.focus();
    }
  });

  document.querySelector("[data-order-whatsapp]").addEventListener("click", () => openWhatsApp(message(items)));
  document.querySelector("[data-order-email]").addEventListener("click", () => {
    const subject = encodeURIComponent(`${config.brand} order request`);
    location.href = `mailto:${config.email}?subject=${subject}&body=${encodeURIComponent(message(items))}`;
  });
  document.querySelector("[data-order-clear]").addEventListener("click", () => {
    items = [];
    save();
    render();
  });

  render();
})();
