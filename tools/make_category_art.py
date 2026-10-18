"""Generate the homepage product-category illustrations (original artwork, no
licence or attribution needed). Run: python3 tools/make_category_art.py"""
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "images", "categories")
STITCH = 'fill="none" stroke="rgba(255,255,255,.85)" stroke-width="3" stroke-dasharray="9 7" stroke-linecap="round"'
OUTLINE = 'stroke="#1b0b3d" stroke-opacity=".35" stroke-width="3" stroke-linejoin="round"'
HANGER = ('<path d="M300 58c-14 0-22 10-22 20 0 11 9 17 22 22v14" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'
          '<path d="M300 114 175 172h250z" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>')

def scene(bg1, bg2, accent, defs, body, extra=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".38" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
{defs}
</defs>
<rect width="600" height="750" fill="url(#bg)"/>
<circle cx="510" cy="120" r="110" fill="{accent}" opacity=".35"/>
<circle cx="70" cy="600" r="140" fill="#fff" opacity=".08"/>
<rect width="600" height="750" fill="url(#glow)"/>
<path d="M40 690c90-60 170 40 260-10s150-80 260-20" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-dasharray="10 8"/>
<g transform="translate(520 652) rotate(35)"><rect x="-4" y="-46" width="8" height="70" rx="4" fill="#fff" opacity=".85"/><ellipse cx="0" cy="-36" rx="2" ry="7" fill="{bg2}"/></g>
{extra}
{HANGER}
{body}
</svg>
'''

dots = lambda pid, color, bg, r=4, gap=26: f'<pattern id="{pid}" width="{gap}" height="{gap}" patternUnits="userSpaceOnUse"><rect width="{gap}" height="{gap}" fill="{bg}"/><circle cx="{gap/2}" cy="{gap/2}" r="{r}" fill="{color}"/></pattern>'

ART = {
 "kurti": scene("#7c3aed", "#db2777", "#f9a8d4", dots("p", "#f59e0b", "#ffe4f1", 3.5, 24),
   f'''<path d="M268 160h64l70 22 50 118-42 16-36-78 4 322 14 40H208l14-40 4-322-36 78-42-16 50-118z" fill="url(#p)" {OUTLINE}/>
<path d="M268 160l32 58 32-58" fill="#fff" {OUTLINE}/>
<path d="M232 252c40 22 96 22 136 0" {STITCH}/>
<path d="M226 600v-80M374 600v-80" {STITCH}/>
<path d="M214 590h172" {STITCH}/>'''),
 "co-ord-set": scene("#4f46e5", "#7c3aed", "#a5b4fc", dots("p", "#ffffff", "#c7d2fe", 4, 22),
   f'''<path d="M262 160h76l58 22 34 72-36 16-26-44v104H232V226l-26 44-36-16 34-72z" fill="url(#p)" {OUTLINE}/>
<path d="M276 160c8 16 40 16 48 0" fill="none" {OUTLINE}/>
<path d="M232 380h136l12 268h-68l-12-170-12 170h-68z" fill="url(#p)" {OUTLINE}/>
<path d="M236 398h128M300 404v60" {STITCH}/>
<path d="M240 362h120" {STITCH}/>'''),
 "top": scene("#2563eb", "#7c3aed", "#93c5fd", dots("p", "#fb7185", "#fef3c7", 3.5, 20),
   f'''<path d="M268 168h64l42 14c46 0 62 70 30 92l-34-26 6 98 34 70H190l34-70 6-98-34 26c-32-22-16-92 30-92z" fill="url(#p)" {OUTLINE}/>
<path d="M268 168c6 30 58 30 64 0" fill="#fff" {OUTLINE}/>
<path d="M236 344c42 18 86 18 128 0" {STITCH}/>
<path d="M198 412h204" {STITCH}/>'''),
 "office-wear": scene("#1e3a8a", "#6d28d9", "#818cf8", "",
   f'''<path d="M262 160h76l64 24 30 300-44 8-14-196-4 300H210l-4-300-14 196-44-8 30-300z" fill="#312e81" {OUTLINE}/>
<path d="M262 160l38 150 38-150" fill="#e0e7ff" {OUTLINE}/>
<path d="M262 160l-10 70 48 80-38-150zM338 160l10 70-48 80 38-150z" fill="#4338ca" {OUTLINE}/>
<circle cx="300" cy="380" r="7" fill="#fbbf24"/><circle cx="300" cy="420" r="7" fill="#fbbf24"/>
<path d="M226 470h44M330 470h44" {STITCH}/>
<path d="M214 590h172" {STITCH}/>'''),
 "night-wear": scene("#312e81", "#0ea5e9", "#7dd3fc", dots("p", "#ffffff", "#bae6fd", 2.5, 18),
   f'''<path d="M266 162h68l90 30 40 150-50 14-34-90 30 340H190l30-340-34 90-50-14 40-150z" fill="url(#p)" {OUTLINE}/>
<path d="M266 162l34 46 34-46" fill="#fff" {OUTLINE}/>
<path d="M214 398h172" fill="none" stroke="#f472b6" stroke-width="12" stroke-linecap="round"/>
<path d="M300 398l-30 50M300 398l30 50" fill="none" stroke="#f472b6" stroke-width="8" stroke-linecap="round"/>
<path d="M200 600h200" {STITCH}/>''',
   extra='<path d="M92 132a46 46 0 1 0 50 62 38 38 0 1 1-50-62z" fill="#fde68a"/><g fill="#fff"><circle cx="160" cy="96" r="4"/><circle cx="470" cy="250" r="3"/><circle cx="120" cy="300" r="3"/><circle cx="455" cy="420" r="4"/></g>'),
 "dresses": scene("#a21caf", "#6d28d9", "#f0abfc", dots("p", "#ffffff", "#f9a8d4", 3, 22),
   f'''<path d="M262 162h22l16 30 16-30h22l18 46-14 120 112 296H130l112-296-14-120z" fill="url(#p)" {OUTLINE}/>
<path d="M240 316h120" fill="none" stroke="#fbbf24" stroke-width="12" stroke-linecap="round"/>
<path d="M150 600c50 18 250 18 300 0" {STITCH}/>
<path d="M262 162c8 40 68 40 76 0" fill="none" {OUTLINE}/>'''),
}

os.makedirs(OUT, exist_ok=True)
for name, svg in ART.items():
    open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8").write(svg)
    print("wrote", name, len(svg), "bytes")
