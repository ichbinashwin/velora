# Security notes

Please report suspected vulnerabilities privately to
rajani.parmar.tailor@gmail.com. Do not publish sensitive details before the
issue has been reviewed.

For production deployment, configure these HTTP response headers at the
hosting or CDN layer:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy` restricted to the site, Unsplash, and jsDelivr
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy` with unused browser capabilities disabled
- `Content-Security-Policy: frame-ancestors 'none'`

GitHub Pages does not provide a repository file for arbitrary response headers;
use the hosting provider or a reverse proxy such as a managed CDN.

## Products page forms (`assets/js/validate.js`, `cart.js`, `tailoring.js`)

Orders are sent by opening WhatsApp with a pre-filled message; there is no
server. All checks therefore run in the visitor's browser. They prevent
accidental or casual malicious input, but they cannot stop someone from
messaging the WhatsApp number directly, so treat every incoming order as
untrusted (do not open links or files sent in an order chat).

| OWASP Top 10 (2021) | Control |
| --- | --- |
| A03 Injection (XSS) | DOM is written only with `textContent`; no `innerHTML`. Data embedded in `<script>` blocks escapes `<`, `>`, `&`. |
| A03 Injection (message) | Shared rules in `validate.js` for both forms. Name: letters (any script), spaces, `. ' -`, 2–60 chars. City/PIN: letters, digits, spaces, `, . / -`, 2–80 chars. Tailoring notes (optional): letters, digits, spaces and `, . - / ( ) ' : ? !`, max 300 chars. Required-by date: today to one year ahead. Links, `.com`-style words, file extensions, 7+ digit numbers (phones, UPI refs) and WhatsApp formatting symbols are rejected. Input is NFKC-normalised; zero-width characters are removed; bidi override/isolate characters cause rejection. |
| A04 Insecure design | Products, materials, sizes, colours, packs, tailoring categories, garments, fabric and measurement options must match `catalog.json` (allowlist), so edited form values or tampered `localStorage` are discarded. Cart quantity is an integer 1–9999 with at most 30 lines; tailoring quantity must be 1–999; a 4-second cooldown prevents repeated sends. |
| A05 Security misconfiguration | Products pages ship a meta Content-Security-Policy (`default-src 'none'`, scripts from self and `www.googletagmanager.com` only, styles from self, Google Analytics hosts allowed for `connect-src`/`img-src`, `form-action 'none'`, `base-uri 'none'`) and `Referrer-Policy`. |
| A08 Integrity | The only third-party script is Google Analytics (`gtag.js`), loaded by `assets/js/analytics.js` **only after the visitor allows Analytics** in the cookie preferences (Consent Mode v2, ads denied, Google signals off). Conversion events carry no personal data. |
| A10 / open redirect | The WhatsApp URL uses a fixed host and a digits-only number (checked at build time and run time); the language switcher only navigates to the four Products pages. |

The validation tests used during development cover script tags, links,
bidi spoofing, emoji, oversize values, tampered storage and form options, and
legitimate names in English, Gujarati, Hindi and German.
