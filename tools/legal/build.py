"""Build privacy.html and terms.html with the same header, footer and scripts
as the homepage.

Usage (from the repository root):
    python3 tools/legal/build.py

Edit the section text in this file, then rebuild. Generated files are
committed so GitHub Pages serves them without a build step.
"""
import json
import os
from html import escape as e

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = "https://www.velora-apparel.store"
UPDATED_ISO = "2026-10-18"
UPDATED = "18 October 2026"
EMAIL = "rajani.parmar.tailor@gmail.com"
PHONE = "+91&nbsp;79909&nbsp;65209"
WHATSAPP_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"

HEADER = f'''  <header class="site-header" data-site-header>
    <div class="topbar">
      <div class="container topbar-inner">
        <span class="topbar-title">Ladies wear manufacturer · Gujarat, India</span>
        <span class="topbar-contact">
          <a href="tel:+917990965209"><svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.2 9.2 2l2.1 5-2.2 1.6a15.7 15.7 0 0 0 6.3 6.3l1.6-2.2 5 2.1-1.2 2.6c-.6 1.4-2.1 2.1-3.6 1.7C10.9 17.6 6.4 13.1 4.9 6.8c-.3-1.5.4-3 1.7-3.6Z"/></svg><span>{PHONE}</span></a>
          <span aria-hidden="true">|</span>
          <a href="mailto:{EMAIL}?subject=Velora%20Apparel%20enquiry" title="{EMAIL}"><svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18v13H3v-13Zm1.8 1.8v.3l7.2 5 7.2-5v-.3H4.8Zm14.4 9.4V9.8L12 14.7 4.8 9.8v6.9h14.4Z"/></svg><span>{EMAIL}</span></a>
          <span aria-hidden="true">|</span>
          <a href="https://wa.me/917990965209" target="_blank" rel="noopener noreferrer"><svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="{WHATSAPP_PATH}"/></svg><span>WhatsApp</span></a>
        </span>
      </div>
    </div>
    <nav class="navbar" aria-label="Primary">
      <div class="container navbar-inner">
        <a class="brand" href="/"><picture><source srcset="/assets/images/logo-240.webp" type="image/webp"><img src="/assets/images/logo-240.png" alt="Velora Apparel logo" class="brand-logo" width="240" height="159" decoding="async"></picture><span class="brand-text">Velora Apparel</span></a>
        <button class="navbar-toggle" type="button" data-nav-toggle aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggle-bar"></span>
          <span class="navbar-toggle-bar"></span>
          <span class="navbar-toggle-bar"></span>
        </button>
        <label class="language-switcher">
          <span class="sr-only">Language</span>
          <select data-legal-lang aria-label="Language"><option value="/" selected>English</option><option value="/gu/">ગુજરાતી</option><option value="/hi/">हिन्दी</option><option value="/de/">Deutsch</option></select>
        </label>
        <div class="nav-panel" id="mainNav" data-nav-panel>
          <ul class="nav-list">
            <li><a class="nav-link" href="/">Home</a></li>
            <li><a class="nav-link" href="/#about">About</a></li>
            <li><a class="nav-link" href="/products/">Products</a></li>
            <li><a class="nav-link" href="/#services">Services</a></li>
            <li><a class="nav-link" href="/#products">Ladies Wear</a></li>
            <li><a class="nav-link" href="/#manufacturing">Manufacturing</a></li>
            <li><a class="nav-link" href="/#faq">FAQ</a></li>
            <li><a class="nav-link" href="/#contact">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
'''

FOOTER = f'''  <footer class="footer">
    <div class="container">
      <p class="footer-brand">VELORA APPAREL</p>
      <p>Ladies wear manufacturer in Alindra, Gujarat, India: OEM, private label, job work and bulk production of kurtis, co-ord sets, tops, office wear, night wear and dresses.</p>
      <p class="footer-nap">Velora Apparel · Village Alindra, Gujarat, India · +91 79909 65209 · {EMAIL}</p>
      <p class="footer-links"><a href="/privacy.html">Privacy Policy</a> · <a href="/terms.html">Terms of Use</a> · <a href="/products/">Products</a> · <a href="/#contact">Contact</a></p>
      <p class="footer-language-links"><strong>Languages:</strong> <a href="/">English</a> · <a href="/gu/">ગુજરાતી</a> · <a href="/hi/">हिन्दी</a> · <a href="/de/">Deutsch</a></p>
      <button class="footer-cookie-btn" type="button" data-cookie-open>Privacy and cookie preferences</button>
    </div>
  </footer>
'''


def page(slug, title, description, eyebrow, h1, body, robots="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1", updated=True):
    url = f"{SITE}/{slug}"
    ld = {"@context": "https://schema.org", "@type": "WebPage", "@id": f"{url}#webpage", "url": url, "name": title,
          "description": description, "inLanguage": "en", "dateModified": UPDATED_ISO,
          "isPartOf": {"@id": f"{SITE}/#website"}, "about": {"@id": f"{SITE}/#organization"}}
    ld_json = json.dumps(ld, ensure_ascii=False, indent=2).replace("<", "\\u003c")
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(description)}">
  <meta name="robots" content="{robots}">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(description)}">
  <meta property="og:image" content="{SITE}/assets/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Velora Apparel – ladies wear manufacturer in Gujarat, India">
  <meta property="og:locale" content="en_IN">
  <meta property="og:url" content="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Velora Apparel">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{e(title)}">
  <meta name="twitter:description" content="{e(description)}">
  <meta name="twitter:image" content="{SITE}/assets/images/og-image.jpg">
{f'  <link rel="canonical" href="{url}">' if robots.startswith("index") else ""}
  <script type="application/ld+json">
{ld_json}
  </script>
  <script src="/assets/js/analytics.js" defer></script>
  <script src="/assets/js/consent-tab.js" defer></script>
  <script src="/assets/js/site-nav.js" defer></script>
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
</head>
<body class="legal-body">
{HEADER}
  <main id="main" class="section-pad legal-page">
    <div class="container legal-container">
      <nav class="legal-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> › <span aria-current="page">{e(h1)}</span></nav>
      <p class="eyebrow">{e(eyebrow)}</p>
      <h1>{e(h1)}</h1>
{f'      <p class="legal-updated">Last updated: {UPDATED}</p>' if updated else ""}
{body}
    </div>
  </main>
{FOOTER}</body>
</html>
'''


def section(h2, *parts):
    return f'      <h2>{h2}</h2>\n' + "\n".join(f"      {p}" for p in parts) + "\n"


CONTACT = f'<a href="mailto:{EMAIL}">{EMAIL}</a>, WhatsApp or phone <a href="tel:+917990965209">{PHONE}</a>'

PRIVACY = "".join([
    '      <div class="legal-summary"><h2>In short</h2><ul>'
    '<li>We use your details only to answer your enquiry, prepare a quote and deliver your order.</li>'
    '<li>Our forms do not send anything to our servers. They open WhatsApp with a message you can check before sending.</li>'
    '<li>Google Analytics runs only if you allow it. We do not use advertising cookies and we never sell personal data.</li>'
    '<li>You can ask to see, correct or delete your data, or withdraw consent, at any time.</li></ul></div>\n',
    section("1. Who we are",
            "<p>Velora Apparel (owner: Rajanikant Dhirajlal Parmar), Village Alindra, Gujarat, India, decides why and how your personal data is used on this website. Under India's Digital Personal Data Protection Act, 2023 (DPDP Act) we are the <strong>Data Fiduciary</strong>; under the EU GDPR we are the <strong>controller</strong>.</p>",
            f"<p><strong>Privacy and grievance contact:</strong> Rajanikant Dhirajlal Parmar, {CONTACT}.</p>"),
    section("2. Personal data we use and why",
            '<div class="legal-table-wrap"><table class="legal-table"><thead><tr><th scope="col">Data</th><th scope="col">Purpose</th><th scope="col">Basis</th><th scope="col">How long</th></tr></thead><tbody>'
            "<tr><td>What you send us on WhatsApp, by email or phone: name, city or PIN code, country, company, products, quantities, dates, notes, and the phone number or email address you contact us from</td><td>Reply to you, prepare quotes, take and deliver orders, follow up on an order</td><td>Your consent and request (DPDP Act s.6 and s.7(a); GDPR Art. 6(1)(a) and (b))</td><td>While your enquiry or order is open, then only as long as Indian tax and accounting laws require for invoices and order records</td></tr>"
            "<tr><td>Cart contents, form drafts and your cookie choice</td><td>Keep your cart and remember your privacy choice</td><td>Necessary for the service you ask for</td><td>Stored only in your browser's local storage until you clear it; never sent to us</td></tr>"
            "<tr><td>Google Analytics data (only if you allow Analytics): pseudonymous identifier in the <code>_ga</code> cookies, pages viewed, device and browser type, approximate location from your IP address, and when a form opens WhatsApp</td><td>Understand which pages help visitors and improve the website</td><td>Your consent (DPDP Act s.6; GDPR Art. 6(1)(a))</td><td>Event data is kept for 2 months (Google's default retention setting)</td></tr>"
            "<tr><td>Technical access data such as IP address and browser, processed by our hosting provider</td><td>Deliver and secure the website</td><td>Legitimate use for security (GDPR Art. 6(1)(f))</td><td>Kept by the hosting provider for security only</td></tr>"
            "</tbody></table></div>",
            "<p>We do not ask for card or bank details on this website, we do not build advertising profiles, and we do not make automated decisions about you.</p>"),
    section("3. Who receives your data",
            "<p>We do not sell personal data. It is shared only with services needed to run the website and your order:</p>",
            "<ul><li><strong>Meta (WhatsApp)</strong> and <strong>Google (Gmail)</strong>, when you choose to message or email us;</li>"
            "<li><strong>Google (Analytics)</strong>, only if you allow Analytics;</li>"
            "<li><strong>GitHub</strong>, which hosts this website, and <strong>jsDelivr</strong>, which delivers animation files if you allow preferences;</li>"
            "<li>courier or transport partners, with only the name, address and phone number needed for delivery;</li>"
            "<li>authorities, when the law requires it.</li></ul>",
            "<p>Some of these providers process data outside India (for example in the USA or the EU). Such transfers are allowed under the DPDP Act unless the Government of India restricts a country; for visitors in the EU, the providers use safeguards such as the EU Standard Contractual Clauses.</p>"),
    section("4. Your rights",
            "<p>Under the DPDP Act you can ask for: a summary of the personal data we hold about you and how we use it; correction, completion or updating of your data; erasure of data we no longer need; and redressal of a grievance. You can also nominate another person to exercise these rights if you die or become unable to do so.</p>",
            "<p>If you are in the EU or UK, you also have the rights of access, rectification, erasure, restriction, objection and data portability, and you can complain to your data protection authority.</p>",
            f"<p><strong>How to ask:</strong> contact us at {CONTACT}. We may need to confirm your identity. We aim to reply within 30 days and, for grievances, in any case within 90 days.</p>",
            "<p>If you are not satisfied with our response to a grievance, you can complain to the <strong>Data Protection Board of India</strong>.</p>"),
    section("5. Consent and how to withdraw it",
            "<p>Optional items (preferences and animations, Google Analytics) are off until you switch them on. You can change or withdraw your choice at any time, as easily as you gave it, with the <strong>Privacy</strong> tab on the right edge of every page or the <strong>Privacy and cookie preferences</strong> button in the footer. When you withdraw Analytics consent, the Google Analytics cookies are deleted. Withdrawing consent does not affect processing that already took place.</p>",
            "<p>To stop us using the details you sent in an enquiry, tell us using the contact details above.</p>"),
    section("6. Children",
            "<p>This website is meant for adults (18 years or older) and businesses. We do not knowingly collect personal data from children. If a child has contacted us, a parent or lawful guardian can ask us to delete the data.</p>"),
    section("7. Security",
            "<p>The website uses HTTPS. Its forms only prepare a WhatsApp message on your own device; nothing is sent to or stored on our servers. Inputs are checked to block links, phone numbers and harmful content. Enquiries are handled only by the owner. If a personal data breach affects you, we will inform you and the Data Protection Board of India as the law requires.</p>"),
    section("8. Language of this notice",
            "<p>This notice is in English. You can ask for it in Gujarati or Hindi using the contact details above. The cookie choices are available in English, Gujarati, Hindi and German.</p>"),
    section("9. AI transparency",
            "<p>Some website text, design and imagery were created with AI assistance and reviewed by Velora Apparel. AI is not used to make decisions about visitors or to process personal data.</p>"),
    section("10. Changes",
            "<p>We update this notice when the website, our services or the law change, and show the date of the latest version at the top. India's DPDP Rules, 2025 apply in phases up to 13 May 2027; this notice already follows their requirements.</p>"),
])

TERMS = "".join([
    section("1. About this website",
            "<p>This website gives information about Velora Apparel, a ladies wear manufacturer in Alindra, Gujarat, India, and lets you send manufacturing quote requests, napkin orders and tailoring enquiries on WhatsApp. By using it you accept these terms.</p>"),
    section("2. Quotes, orders and payment",
            "<p>Velora Apparel manufactures in-house at its own unit and produces to order. Prices, quantities, specifications, sampling, timelines and delivery charges are confirmed only in writing (WhatsApp or email) before production or dispatch. Information on this website is not a binding offer.</p>",
            "<p>This website does not take payments and never asks for card or bank details. Payment terms are agreed directly with you for each order.</p>",
            "<p>For new bulk designs, a sample is approved before bulk production starts. Colours on screen are approximate; ask for a fabric swatch or sample if the exact colour matters.</p>"),
    section("3. Defects and returns",
            "<p>If an item has a manufacturing defect, contact us with photos within the period agreed for your order, and we will agree a repair, replacement or other remedy with you in writing. Custom-made and tailored items are made to your specifications and are not returnable unless they are defective or differ from what was agreed.</p>"),
    section("4. Third-party services",
            "<p>Phone, email and WhatsApp links open third-party services whose own terms and privacy policies apply. Please do not send confidential information unless it is needed for your enquiry. See our <a href=\"/privacy.html\">Privacy Policy</a> for how we handle personal data.</p>"),
    section("5. Content and intellectual property",
            "<p>Website text, design, illustrations and the Velora Apparel name and logo belong to Velora Apparel or are used under licence. You may not copy or reuse them commercially without written permission.</p>"),
    section("6. Liability",
            "<p>We take care to keep this website accurate and available, but it is provided as is. To the extent permitted by law, Velora Apparel is not liable for interruptions, third-party service availability or indirect loss. Nothing in these terms limits rights you have under consumer protection law, including the Consumer Protection Act, 2019.</p>"),
    section("7. Governing law",
            "<p>These terms are governed by the laws of India.</p>"),
    section("8. Contact",
            f"<p>Questions about these terms: {CONTACT}.</p>"),
])

PAGES = {
    "privacy.html": page("privacy.html", "Privacy Policy | Velora Apparel",
                         "How Velora Apparel uses personal data under India's DPDP Act 2023 and the GDPR: enquiries on WhatsApp, optional Google Analytics, your rights and grievance contact.",
                         "Privacy", "Privacy Policy", PRIVACY),
    "terms.html": page("terms.html", "Terms of Use | Velora Apparel",
                       "Terms of use for the Velora Apparel website: quotes, orders and payment, defects and returns, third-party services, content and governing law.",
                       "Website terms", "Terms of Use", TERMS),
}

NOT_FOUND = (
    '      <p>Sorry, this page does not exist or has moved.</p>\n'
    '      <ul class="notfound-links"><li><a href="/">Homepage</a></li><li><a href="/products/">Products: napkins, cleaning cloths and tailoring</a></li>'
    '<li><a href="/#contact">Request a manufacturing quote</a></li><li><a href="/#faq">FAQ</a></li></ul>\n'
    '      <p>Languages: <a href="/gu/">ગુજરાતી</a> · <a href="/hi/">हिन्दी</a> · <a href="/de/">Deutsch</a></p>\n')
PAGES["404.html"] = page("404.html", "Page not found | Velora Apparel", "The page you are looking for does not exist on the Velora Apparel website.",
                         "404", "Page not found", NOT_FOUND, robots="noindex", updated=False)

for name, html_text in PAGES.items():
    open(os.path.join(ROOT, name), "w", encoding="utf-8").write(html_text)
    print("wrote", name)
