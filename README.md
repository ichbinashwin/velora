Upload images to assets/images/products and enable GitHub Pages.

## Security and compliance deployment checklist

- Enforce HTTPS for the custom domain and enable GitHub two-factor authentication.
- Configure HSTS, Content-Security-Policy, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy at the hosting or CDN layer. GitHub Pages does not support arbitrary custom response headers from repository files.
- Keep third-party media and animation loading behind the optional consent choice.
- Review and update `privacy.html` and `terms.html` when services, data collection, or business details change.
- Report security issues privately using the contact in `.well-known/security.txt`.

## Image credits

Homepage banner photos (`assets/images/banner/`) are from Unsplash, used under the
[Unsplash License](https://unsplash.com/license) and self-hosted so they load
without third-party requests. They show fabrics and machinery only (no people):

- Fabric rolls by Bernd Dittrich: https://unsplash.com/photos/rEb9iHOF638
- Folded cloth stacks: https://unsplash.com/photos/wl2TODALiAY
- Sewing machine needle by J Williams: https://unsplash.com/photos/tabzu_kbVs0
