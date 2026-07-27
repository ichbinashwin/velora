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
