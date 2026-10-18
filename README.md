Upload images to assets/images/products and enable GitHub Pages.

## Security and compliance deployment checklist

- Enforce HTTPS for the custom domain and enable GitHub two-factor authentication.
- Configure HSTS, Content-Security-Policy, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy at the hosting or CDN layer. GitHub Pages does not support arbitrary custom response headers from repository files.
- Keep third-party media and animation loading behind the optional consent choice.
- Review and update `privacy.html` and `terms.html` when services, data collection, or business details change.
- Report security issues privately using the contact in `.well-known/security.txt`.

## Image credits

All photos are self-hosted, show no people, and are free for commercial use.

Homepage banner (`assets/images/banner/`):

- Thread spools: Patryk Dziejma, StockSnap, CC0 (https://stocksnap.io/photo/thread-spools-OT78IG5U1C)
- Sewing kit with spools and scissors: rawpixel, CC0 (https://www.rawpixel.com/image/6043228)
- Blue and white striped towels: Unsplash License (https://unsplash.com/photos/3CVqadZfHJg)
- Folded towels in warm light: Irham Setyaki, Unsplash License (https://unsplash.com/photos/sHK_MA3nKWM)
- Measuring tape on silk: Unsplash License (https://unsplash.com/photos/xFcqV_XZNNU)
- Sewing kit with thimbles: rawpixel, CC0, cropped to exclude thread-brand labels (https://www.rawpixel.com/image/5904602)

Homepage product categories (`assets/images/categories/`): original SVG illustrations made for this site (`tools/make_category_art.py`); no licence or attribution needed.

Products page (`assets/images/products/`):

- Sewing thread: StockSnap, CC0 (https://stocksnap.io/photo/sewing-thread-TUSNCRKPBJ)
- Thread spools with thimble: rawpixel, CC0 (https://www.rawpixel.com/image/5916189)
