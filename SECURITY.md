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

## Products page order form (`assets/js/cart.js`)

Orders are sent by opening WhatsApp with a pre-filled message; there is no
server. All checks therefore run in the visitor's browser. They prevent
accidental or casual malicious input, but they cannot stop someone from
messaging the WhatsApp number directly, so treat every incoming order as
untrusted (do not open links or files sent in an order chat).

| OWASP Top 10 (2021) | Control |
| --- | --- |
| A03 Injection (XSS) | DOM is written only with `textContent`; no `innerHTML`. Data embedded in `<script>` blocks escapes `<`, `>`, `&`. |
| A03 Injection (message) | Name: letters (any script), spaces, `. ' -`, 2–60 chars. City/PIN: letters, digits, spaces, `, . / -`, 2–80 chars. Links, `.com`-style words, file extensions, 7+ digit numbers (phones, UPI refs) and WhatsApp formatting symbols are rejected. Input is NFKC-normalised; zero-width characters are removed; bidi override/isolate characters cause rejection. |
| A04 Insecure design | Products, materials, sizes, colours and packs must match `catalog.json` (allowlist), so edited form values or tampered `localStorage` are discarded. Quantity is an integer 1–9999; at most 30 cart lines; a 4-second cooldown prevents repeated sends. |
| A05 Security misconfiguration | Products pages ship a meta Content-Security-Policy (`default-src 'none'`, scripts/styles from self only, `form-action 'none'`, `base-uri 'none'`) and `Referrer-Policy`. |
| A08 Integrity | No third-party scripts on the Products pages. |
| A10 / open redirect | The WhatsApp URL uses a fixed host and a digits-only number (checked at build time and run time); the language switcher only navigates to the four Products pages. |

The validation tests used during development cover script tags, links,
bidi spoofing, emoji, oversize values, tampered storage and form options, and
legitimate names in English, Gujarati, Hindi and German.
