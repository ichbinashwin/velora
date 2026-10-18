// Products page: one order form, a cart (add / update / remove / empty) and a
// WhatsApp order message written in the page language. The cart is kept only
// in this browser and is shared by all language versions of the page.
(() => {
  const catalog = JSON.parse(document.getElementById("catalog").textContent);
  const { ui, msg } = catalog;
  const STORAGE_KEY = "velora_cart_v1";
  const products = Object.fromEntries(catalog.products.map((p) => [p.id, p]));

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

  const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);

  function load() {
    try {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(items) ? items.filter((item) => products[item.p]) : [];
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

  function message() {
    const type = document.querySelector('input[name="order-type"]:checked');
    const lines = [msg.greet, "", msg.intro, ""];
    cart.forEach((item, index) => {
      lines.push(`${index + 1}. ${products[item.p].name}`);
      lines.push(`   ${describe(item)}`);
      lines.push(`   ${fill(msg.qty, { qty: item.qty, pack: item.pack, pieces: item.qty * item.pack })}`);
      lines.push("");
    });
    lines.push(fill(msg.total, sums()));
    if (type) lines.push(`${msg.type}: ${ui[type.value]}`);
    if (custName.value.trim()) lines.push(`${msg.name}: ${custName.value.trim()}`);
    if (custCity.value.trim()) lines.push(`${msg.city}: ${custCity.value.trim()}`);
    lines.push("", msg.close, "", msg.thanks);
    return lines.join("\n");
  }

  function setQty(index, qty) {
    const value = Math.min(9999, Math.max(1, parseInt(qty, 10) || 1));
    cart[index].qty = value;
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
    qty.max = "9999";
    qty.value = String(item.qty);
    qty.inputMode = "numeric";
    qty.setAttribute("aria-label", `${products[item.p].name}: ${ui.pack_of.replace("{n}", item.pack)}`);
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
    preview.textContent = hasItems ? message() : "";
    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = String(cart.length);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const item = {
      p: data.get("product"),
      m: data.get("material"),
      s: data.get("size"),
      c: data.get("colour"),
      pack: parseInt(data.get("pack"), 10),
      qty: Math.min(9999, Math.max(1, parseInt(data.get("qty"), 10) || 1))
    };
    const same = cart.find((x) => x.p === item.p && x.m === item.m && x.s === item.s && x.c === item.c && x.pack === item.pack);
    if (same) {
      same.qty = Math.min(9999, same.qty + item.qty);
    } else {
      cart.push(item);
    }
    save();
    render();
    status.textContent = fill(ui.added, { item: `${products[item.p].name} (${describe(item)})` });
  });

  field("product").addEventListener("change", () => setProduct(field("product").value));

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

  [custName, custCity].forEach((input) => input.addEventListener("input", render));
  document.querySelectorAll('input[name="order-type"]').forEach((input) => input.addEventListener("change", render));

  document.querySelector("[data-cart-send]").addEventListener("click", () => {
    if (!cart.length) return;
    window.open(`https://wa.me/${catalog.whatsapp}?text=${encodeURIComponent(message())}`, "_blank", "noopener");
  });

  document.querySelector("[data-lang-select]").addEventListener("change", (event) => {
    window.location.href = event.target.value;
  });

  // Links such as /products/#p-car preselect that product in the order form.
  const fromHash = location.hash.replace("#p-", "");
  setProduct(products[fromHash] ? fromHash : catalog.products[0].id);
  render();
})();
