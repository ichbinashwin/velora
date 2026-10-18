"""Build the Velora Home product pages from products.json.

Usage (from the repository root):
    python3 tools/napkins/build.py

Writes napkins/index.html and napkins/<slug>/index.html. The generated files are
committed so GitHub Pages can serve them without a build step.
"""
import html
import json
import os
from datetime import date
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = json.load(open(os.path.join(ROOT, "tools", "napkins", "products.json"), encoding="utf-8"))
SITE = "https://www.velora-apparel.store/"
HUB = SITE + "napkins/"
TODAY = date.today().isoformat()
BRAND = DATA["brand"]
WA = DATA["whatsapp"]

ICONS = {
    "kitchen": '<path d="M7 3v8a3 3 0 0 0 2 2.8V21h2v-7.2A3 3 0 0 0 13 11V3h-1.5v6h-1V3h-1v6h-1V3H7Zm9 0c-1.7 0-3 2.2-3 5.5 0 2 .8 3.4 2 3.9V21h2V3h-1Z"/>',
    "car": '<path d="M5 11 6.6 6.4A2 2 0 0 1 8.5 5h7a2 2 0 0 1 1.9 1.4L19 11a2 2 0 0 1 2 2v4h-2v2h-2.5v-2h-9v2H5v-2H3v-4a2 2 0 0 1 2-2Zm2.1 0h9.8l-1.2-3.5a.8.8 0 0 0-.7-.5H9a.8.8 0 0 0-.7.5L7.1 11ZM6.5 15.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>',
    "office": '<path d="M4 5h16v10H4V5Zm2 2v6h12V7H6Zm-4 10h20v2H2v-2Z"/>',
    "multi": '<path d="M12 2l1.8 4.7L18.5 8.5l-4.7 1.8L12 15l-1.8-4.7L5.5 8.5l4.7-1.8L12 2Zm6 11 .9 2.1 2.1.9-2.1.9L18 19l-.9-2.1-2.1-.9 2.1-.9L18 13ZM6 15l.7 1.6 1.6.7-1.6.7L6 19.6l-.7-1.6-1.6-.7 1.6-.7L6 15Z"/>',
}


def e(s):
    return html.escape(str(s), quote=True)


def icon(name):
    return f'<svg class="vh-icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'


def wa_link(text):
    return f"https://wa.me/{WA}?text={quote(text)}"


def ld(obj):
    body = json.dumps(obj, ensure_ascii=False, indent=2)
    return '<script type="application/ld+json">\n' + body + "\n  </script>"


SWATCHES = {}


def swatch_class(c):
    """Register a colour swatch and return its CSS class (written to napkins-swatches.css)."""
    key = "vh-sw-" + "".join(ch for ch in (c["name"] + c["hex"]).lower() if ch.isalnum())
    if c["hex"] == "assorted":
        rule = "background: conic-gradient(#2563eb 0 25%, #f4c430 0 50%, #e57fa6 0 75%, #2e8b57 0);"
    elif c.get("check"):
        rule = (f"background: linear-gradient(90deg, {c['hex']} 50%, transparent 50%) 0 0 / 8px 8px, "
                f"linear-gradient({c['hex']} 50%, #fff 50%) 0 0 / 8px 8px;")
    else:
        rule = f"background: {c['hex']};"
    SWATCHES[key] = rule
    return key


def head(title, desc, url, schema, current="/napkins/"):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:image" content="{SITE}assets/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{e(BRAND)} napkins and cleaning cloths by Velora Apparel">
  <meta property="og:url" content="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Velora Apparel">
  <meta property="og:locale" content="en_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(title)}">
  <meta name="twitter:description" content="{e(desc)}">
  <meta name="twitter:image" content="{SITE}assets/images/og-image.jpg">
  <link rel="canonical" href="{url}">
  {ld(schema)}
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/napkins.css">
  <link rel="stylesheet" href="/assets/css/napkins-swatches.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
</head>
<body class="vh-page">
  <a class="vh-skip" href="#main">Skip to content</a>
  <header class="vh-header">
    <div class="container vh-header-inner">
      <a class="vh-brand" href="/napkins/"><picture><source srcset="/assets/images/logo-240.webp" type="image/webp"><img src="/assets/images/logo-240.png" alt="Velora Apparel logo" width="240" height="159" decoding="async"></picture><span><strong>{e(BRAND)}</strong><small>by Velora Apparel</small></span></a>
      <nav class="vh-nav" aria-label="Velora Home">
{nav_links(current)}
        <a href="/napkins/#wholesale">Wholesale</a>
        <a href="/">Ladies wear</a>
      </nav>
    </div>
  </header>
"""


def nav_links(current):
    links = [("/napkins/", "All products")] + [(f"/napkins/{c['slug']}/", c["short"]) for c in DATA["categories"]]
    return "\n".join(f'        <a href="{href}"{' aria-current="page"' if href == current else ''}>{e(label)}</a>'
                     for href, label in links)


def footer():
    return f"""
  <footer class="footer vh-footer">
    <div class="container">
      <p class="footer-brand">{e(BRAND.upper())}</p>
      <p>Napkins and cleaning cloths for kitchen, car, office and home, made by Velora Apparel in Gujarat, India.</p>
      <p class="footer-nap">Velora Apparel · Village Alindra, Gujarat, India · {e(DATA['phone'])} · {e(DATA['email'])}</p>
      <p class="footer-links"><a href="/napkins/">All products</a> · <a href="/napkins/#wholesale">Wholesale</a> · <a href="/">Ladies wear manufacturing</a> · <a href="/privacy.html">Privacy Policy</a> · <a href="/terms.html">Terms of Use</a></p>
    </div>
  </footer>

  <button class="vh-order-toggle" type="button" data-order-toggle aria-controls="vh-order-panel" aria-expanded="false">
    Order list <span class="vh-order-count" data-order-count>0</span>
  </button>
  <aside class="vh-order-panel" id="vh-order-panel" data-order-panel hidden aria-label="Order list">
    <div class="vh-order-head">
      <h2>Your order list</h2>
      <button type="button" class="vh-order-close" data-order-close aria-label="Close order list">×</button>
    </div>
    <p class="vh-order-empty" data-order-empty>Your order list is empty. Choose a product, size and colour, then press "Add to order list".</p>
    <ol class="vh-order-items" data-order-items></ol>
    <div class="vh-order-form" data-order-form>
      <label>Order type
        <select data-order-type>
          <option value="Retail">Retail (for my own use)</option>
          <option value="Wholesale">Wholesale / bulk</option>
        </select>
      </label>
      <label>Your name <input type="text" data-order-name autocomplete="name"></label>
      <label>City or PIN code <input type="text" data-order-city autocomplete="postal-code"></label>
      <button type="button" class="btn btn-main w-100" data-order-whatsapp>Send order on WhatsApp</button>
      <button type="button" class="btn btn-outline-dark w-100" data-order-email>Send order by email</button>
      <button type="button" class="vh-order-clear" data-order-clear>Clear list</button>
    </div>
  </aside>
  <script src="/assets/js/order-list.js" defer data-whatsapp="{WA}" data-email="{e(DATA['email'])}" data-brand="{e(BRAND)}"></script>
</body>
</html>
"""


def channels_html():
    names = {"amazon": "Amazon", "flipkart": "Flipkart", "meesho": "Meesho"}
    items = [f'<a class="vh-channel is-live" href="{wa_link(f"Hello {BRAND}, I would like to order napkins.")}" target="_blank" rel="noopener noreferrer"><strong>WhatsApp</strong><span>Order now</span></a>']
    for key, label in names.items():
        url = DATA["channels"].get(key)
        if url:
            items.append(f'<a class="vh-channel is-live" href="{e(url)}" target="_blank" rel="noopener noreferrer"><strong>{label}</strong><span>Buy on {label}</span></a>')
        else:
            items.append(f'<div class="vh-channel"><strong>{label}</strong><span>Coming soon</span></div>')
    items.append('<a class="vh-channel is-live" href="/napkins/#wholesale"><strong>Wholesale</strong><span>Bulk &amp; resellers</span></a>')
    return '<div class="vh-channels">' + "".join(items) + "</div>"


def faq_html(faq):
    return "\n".join(
        f'        <details class="faq-item"{" open" if i == 0 else ""}>\n'
        f'          <summary><h3>{e(q)}</h3></summary>\n'
        f'          <p>{e(a)}</p>\n'
        f'        </details>' for i, (q, a) in enumerate(faq))


def faq_schema(faq, url):
    return {"@type": "FAQPage", "@id": url + "#faq",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}


BRAND_NODE = {"@type": "Brand", "@id": HUB + "#brand", "name": BRAND,
              "description": "Home textile brand of Velora Apparel for kitchen napkins, car cleaning cloths, office napkins and multipurpose cleaning cloths.",
              "logo": SITE + "assets/images/logo-240.png"}


def category_page(c):
    url = f"{HUB}{c['slug']}/"
    mats = [DATA["materials"][m] for m in c["materials"]]
    schema = {"@context": "https://schema.org", "@graph": [
        BRAND_NODE,
        {"@type": "ProductGroup", "@id": url + "#product", "name": f"{BRAND} {c['name']}", "description": c["intro"],
         "url": url, "productGroupID": c["slug"], "brand": {"@id": HUB + "#brand"},
         "manufacturer": {"@id": SITE + "#organization"}, "image": SITE + "assets/images/og-image.jpg",
         "material": [m["name"] for m in mats], "color": [x["name"] for x in c["colours"]], "size": c["sizes"],
         "variesBy": ["https://schema.org/color", "https://schema.org/size", "https://schema.org/material"],
         "countryOfOrigin": {"@type": "Country", "name": "India"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": BRAND, "item": HUB},
            {"@type": "ListItem", "position": 3, "name": c["name"], "item": url}]},
        {"@type": "WebPage", "@id": url + "#webpage", "url": url, "name": c["title"], "description": c["description"],
         "inLanguage": "en", "dateModified": TODAY, "isPartOf": {"@id": SITE + "#website"},
         "mainEntity": {"@id": url + "#product"}},
        faq_schema(c["faq"], url)]}

    material_opts = "".join(f'<option value="{e(m["name"])}">{e(m["name"])}</option>' for m in mats)
    size_opts = "".join(f'<option value="{e(s)}">{e(s)}</option>' for s in c["sizes"])
    pack_opts = "".join(f'<option value="{p}">Pack of {p}</option>' for p in c["packs"])
    swatches = "".join(
        f'<label class="vh-swatch"><input type="radio" name="colour-{c["slug"]}" value="{e(x["name"])}"{" checked" if i == 0 else ""}>'
        f'<span class="vh-swatch-dot {swatch_class(x)}"></span><span class="vh-swatch-name">{e(x["name"])}</span></label>'
        for i, x in enumerate(c["colours"]))
    material_rows = "".join(f'<li><strong>{e(m["name"])}</strong> – {e(m["summary"])} Best for: {e(m["best_for"])}</li>' for m in mats)
    uses = "".join(f"<li>{e(u)}</li>" for u in c["uses"])
    others = "".join(f'<a class="vh-chip" href="/napkins/{o["slug"]}/">{e(o["short"])}</a>' for o in DATA["categories"] if o["slug"] != c["slug"])
    wa_quick = wa_link(f"Hello {BRAND}, I am interested in {c['name']}. Please share prices and availability.")

    body = f"""
  <main id="main">
    <nav class="container vh-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/napkins/">{e(BRAND)}</a> › <span aria-current="page">{e(c['name'])}</span></nav>
    <section class="vh-hero vh-hero-product">
      <div class="container vh-product-grid">
        <div>
          <p class="eyebrow">{e(BRAND)} · Made in Gujarat, India</p>
          <h1>{e(c['h1'])}</h1>
          <p class="vh-lead">{e(c['intro'])}</p>
          <ul class="vh-facts">
            <li><strong>Materials</strong> {e(", ".join(m["name"] for m in mats))}</li>
            <li><strong>Sizes</strong> {e(", ".join(c["sizes"]))}</li>
            <li><strong>Colours</strong> {len(c["colours"])} options</li>
            <li><strong>Packs</strong> {e(", ".join(str(p) for p in c["packs"]))} pieces</li>
          </ul>
        </div>
        <form class="vh-configurator" data-product-form data-product="{e(c['name'])}">
          <div class="vh-config-icon">{icon(c['icon'])}</div>
          <h2>Choose your {e(c['short'].lower())}</h2>
          <label>Material<select name="material">{material_opts}</select></label>
          <label>Size<select name="size">{size_opts}</select></label>
          <fieldset><legend>Colour</legend><div class="vh-swatches">{swatches}</div></fieldset>
          <div class="vh-config-row">
            <label>Pack<select name="pack">{pack_opts}</select></label>
            <label>Quantity (packs)<input type="number" name="qty" min="1" value="1" inputmode="numeric"></label>
          </div>
          <button type="submit" class="btn btn-main w-100" data-add-to-order>Add to order list</button>
          <button type="button" class="btn btn-outline-dark w-100" data-order-now>Order this on WhatsApp</button>
          <p class="vh-config-note" data-add-status role="status"></p>
        </form>
      </div>
    </section>

    <section class="section-pad bg-white">
      <div class="container vh-two-col">
        <div>
          <h2>Uses</h2>
          <ul class="vh-checklist">{uses}</ul>
        </div>
        <div>
          <h2>Materials</h2>
          <ul class="vh-checklist">{material_rows}</ul>
        </div>
      </div>
    </section>

    <section class="section-pad vh-buy">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Where to buy</p>
          <h2>Buy {e(c['short'].lower())} online or wholesale</h2>
          <p class="section-copy">Order on WhatsApp today. Marketplace listings are on the way. Shops, hotels, offices and resellers can <a href="{wa_quick}" target="_blank" rel="noopener noreferrer">ask for wholesale prices</a>.</p>
        </div>
        {channels_html()}
      </div>
    </section>

    <section id="faq" class="section-pad bg-white faq-section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">FAQ</p>
          <h2>{e(c['name'])}: questions and answers</h2>
        </div>
        <div class="faq-list">
{faq_html(c['faq'])}
        </div>
        <p class="vh-more">More from {e(BRAND)}: {others}</p>
      </div>
    </section>
  </main>
"""
    return head(c["title"], c["description"], url, schema, f"/napkins/{c['slug']}/") + body + footer()


def hub_page():
    url = HUB
    title = f"{BRAND} Napkins & Cleaning Cloths | Kitchen, Car, Office"
    desc = f"{BRAND} napkins and cleaning cloths: kitchen, car, office and multipurpose, in cotton, terry, waffle and microfiber. Retail and wholesale from Gujarat."
    schema = {"@context": "https://schema.org", "@graph": [
        BRAND_NODE,
        {"@type": "CollectionPage", "@id": url + "#webpage", "url": url, "name": title, "description": desc,
         "inLanguage": "en", "dateModified": TODAY, "isPartOf": {"@id": SITE + "#website"},
         "about": {"@id": HUB + "#brand"}, "mainEntity": {"@id": url + "#products"}},
        {"@type": "ItemList", "@id": url + "#products", "name": f"{BRAND} products",
         "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": c["name"], "url": f"{HUB}{c['slug']}/"}
                             for i, c in enumerate(DATA["categories"])]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": BRAND, "item": HUB}]},
        faq_schema(DATA["hub_faq"], url)]}

    cards = "\n".join(f"""          <a class="vh-card" href="/napkins/{c['slug']}/">
            {icon(c['icon'])}
            <h3>{e(c['name'])}</h3>
            <p>{e(c['card'])}</p>
            <span class="vh-card-meta">{e(", ".join(DATA['materials'][m]['name'] for m in c['materials']))} · {e(", ".join(c['sizes']))}</span>
            <span class="vh-swatch-row">{"".join(f'<span class="vh-swatch-dot {swatch_class(x)}" title="{e(x["name"])}"></span>' for x in c['colours'])}</span>
          </a>""" for c in DATA["categories"])
    mat_rows = "\n".join(
        f'            <tr><th scope="row">{e(m["name"])}</th><td>{e(m["summary"])}</td><td>{e(m["best_for"])}</td></tr>'
        for m in DATA["materials"].values())
    wholesale_wa = wa_link(f"Hello {BRAND}, I would like wholesale prices. Business type: \nProducts: \nQuantity: \nCity: ")

    body = f"""
  <main id="main">
    <section class="vh-hero">
      <div class="container">
        <p class="eyebrow">New from Velora Apparel</p>
        <h1>{e(BRAND)} Napkins &amp; Cleaning Cloths</h1>
        <p class="vh-lead">Kitchen napkins, microfiber car cleaning cloths, office napkins and multipurpose cleaning cloths in cotton, terry, waffle and microfiber, in multiple colours and sizes. Made in Gujarat, India for homes, cars, offices and businesses.</p>
        <div class="d-flex flex-column flex-sm-row gap-3">
          <a class="btn btn-main" href="#products">Choose a product</a>
          <a class="btn btn-outline-dark" href="#wholesale">Wholesale enquiry</a>
        </div>
      </div>
    </section>

    <section id="products" class="section-pad bg-white">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Products</p>
          <h2>Napkins and cleaning cloths for every use</h2>
        </div>
        <div class="vh-cards">
{cards}
        </div>
      </div>
    </section>

    <section class="section-pad">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Materials</p>
          <h2>Cotton, terry, waffle or microfiber: which cloth to choose</h2>
        </div>
        <div class="vh-table-wrap">
          <table class="vh-table">
            <thead><tr><th scope="col">Material</th><th scope="col">What it is</th><th scope="col">Best for</th></tr></thead>
            <tbody>
{mat_rows}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section-pad bg-white vh-buy">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Where to buy</p>
          <h2>Order on WhatsApp now, marketplaces coming soon</h2>
          <p class="section-copy">Pick a product, size and colour on any product page and add it to your order list. Send the whole list in one WhatsApp message or email.</p>
        </div>
        {channels_html()}
      </div>
    </section>

    <section id="wholesale" class="section-pad vh-wholesale">
      <div class="container vh-two-col">
        <div>
          <p class="eyebrow">Wholesale</p>
          <h2>Wholesale napkins and cleaning cloths for businesses</h2>
          <p class="section-copy">Bulk supply for retailers, distributors, supermarkets, hotels, restaurants, offices and car accessory shops. Custom sizes, colours and private label packaging are available for bulk orders on request.</p>
        </div>
        <div class="vh-wholesale-panel">
          <h3>Ask for wholesale prices</h3>
          <ul class="vh-checklist">
            <li>Products and materials you need</li>
            <li>Sizes and colours</li>
            <li>Quantity per month or per order</li>
            <li>Your city or PIN code for delivery</li>
          </ul>
          <a class="btn btn-main w-100" href="{wholesale_wa}" target="_blank" rel="noopener noreferrer">Wholesale enquiry on WhatsApp</a>
          <a class="btn btn-outline-dark w-100" href="mailto:{e(DATA['email'])}?subject={quote(BRAND + ' wholesale enquiry')}">Email wholesale enquiry</a>
        </div>
      </div>
    </section>

    <section id="faq" class="section-pad bg-white faq-section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">FAQ</p>
          <h2>{e(BRAND)}: questions and answers</h2>
        </div>
        <div class="faq-list">
{faq_html(DATA['hub_faq'])}
        </div>
      </div>
    </section>
  </main>
"""
    return head(title, desc, url, schema) + body + footer()


def write(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(content)
    print("wrote", rel)


write("napkins/index.html", hub_page())
for cat in DATA["categories"]:
    write(f"napkins/{cat['slug']}/index.html", category_page(cat))
write("assets/css/napkins-swatches.css",
      "/* Generated by tools/napkins/build.py from products.json. Do not edit by hand. */\n"
      + "".join(f".{k} {{ {v} }}\n" for k, v in sorted(SWATCHES.items())))
