// Öz & Saye Psikoloji — profesyonel logo kiti üretici
// Çalıştırma: node scripts/generate-logo-kit.cjs
//
// ÖN KOŞUL (marka fontları sistemde kurulu olmalı — bu container'da kuruldu):
//   ofl/cormorantgaramond: Bold + MediumItalic  •  ofl/nunito (variable)
//   /usr/share/fonts/brand/ altına indirilip `fc-cache -f` çalıştırıldı.
// Metin opentype.js ile vektör yola (path) çevrildiği için üretilen SVG'ler
// alıcı tarafta font gerektirmez; her yerde birebir aynı görünür.
//
// Çıktılar:
//   brand/logo/svg/*.svg   (vektör ana dosyalar — metin outline)
//   brand/logo/png/*.png   (saydam zeminli yüksek çözünürlük)
//   brand/logo/ozsaye-logo-overview.png  (tüm varyantların önizleme tablosu)
//   public/logo.png        (yatay ana logo, saydam — sitede/genel kullanım)
const sharp = require("sharp");
const opentype = require("opentype.js");
const fs = require("fs");
const path = require("path");

const C = {
  forest: "#2B5233",
  sage: "#92B594",
  sageLight: "#AFC6B0",
  sageDark: "#7A9E7C",
  cream: "#F1EAD9",
  warmWhite: "#FDFBF7",
  black: "#1A1A1A",
};
const FONT = "/usr/share/fonts/brand";
const load = (f) => {
  const b = fs.readFileSync(`${FONT}/${f}`);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const cormorant = load("CormorantGaramond-Bold.ttf");
const nunito = load("Nunito.ttf");

const ROOT = path.join(__dirname, "..");
const SVG_DIR = path.join(ROOT, "brand", "logo", "svg");
const PNG_DIR = path.join(ROOT, "brand", "logo", "png");
fs.mkdirSync(SVG_DIR, { recursive: true });
fs.mkdirSync(PNG_DIR, { recursive: true });

// --- Metin -> vektör yol (origin'de, baseline y=0) ---
// opentype.toPathData() çok küçük koordinatları üstel gösterimle (1e-15)
// yazabiliyor; librsvg bunu parse edemeyip path'i yarıda kesiyor. Bu yüzden
// komutları kendimiz, üstel gösterim üretmeyecek şekilde serileştiriyoruz.
const num = (v) => (isFinite(v) ? Math.round(v * 100) / 100 : 0).toString();
function pathToD(p) {
  let d = "";
  for (const c of p.commands) {
    if (c.type === "M") d += `M${num(c.x)} ${num(c.y)}`;
    else if (c.type === "L") d += `L${num(c.x)} ${num(c.y)}`;
    else if (c.type === "C") d += `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`;
    else if (c.type === "Q") d += `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`;
    else if (c.type === "Z") d += "Z";
  }
  return d;
}
function textPath(font, text, size) {
  const p = font.getPath(text, 0, 0, size);
  const b = p.getBoundingBox();
  return { d: pathToD(p), x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2, w: b.x2 - b.x1, h: b.y2 - b.y1 };
}
function trackedPath(font, text, size, tracking) {
  const scale = size / font.unitsPerEm;
  let x = 0, X1 = Infinity, Y1 = Infinity, X2 = -Infinity, Y2 = -Infinity;
  const ds = [];
  for (const ch of [...text]) {
    const g = font.charToGlyph(ch);
    const gp = g.getPath(x, 0, size);
    const b = gp.getBoundingBox();
    if (isFinite(b.x1)) { X1 = Math.min(X1, b.x1); Y1 = Math.min(Y1, b.y1); X2 = Math.max(X2, b.x2); Y2 = Math.max(Y2, b.y2); }
    ds.push(pathToD(gp));
    x += g.advanceWidth * scale + tracking;
  }
  return { d: ds.join(" "), x1: X1, y1: Y1, x2: X2, y2: Y2, w: X2 - X1, h: Y2 - Y1 };
}
// Bir yolu hedef konuma yerleştir (cx: yatay merkez, top: üst kenar y)
function place(t, fill, opacity, cx, top) {
  const dx = cx - (t.x1 + t.x2) / 2;
  const dy = top - t.y1;
  const op = opacity != null && opacity !== 1 ? ` fill-opacity="${opacity}"` : "";
  return `<path d="${t.d}" fill="${fill}"${op} transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})"/>`;
}

// --- Amblem (LogoMark bileşeniyle birebir aynı geometri) ---
function emblem(o) {
  const lo = o.leafOp || [1, 1, 1];
  const fo = (i) => (lo[i] !== 1 ? ` fill-opacity="${lo[i]}"` : "");
  return `
    <circle cx="128" cy="128" r="96" stroke="${o.ink}" stroke-width="7" fill="none"/>
    <path d="M128 120 C102 108 102 72 128 50 C154 72 154 108 128 120 Z" transform="rotate(-52 128 120)" fill="${o.l1}"${fo(0)}/>
    <path d="M128 120 C102 108 102 72 128 50 C154 72 154 108 128 120 Z" transform="rotate(52 128 120)" fill="${o.l2}"${fo(1)}/>
    <path d="M128 120 L93 80" stroke="${o.vein}" stroke-width="2.4" stroke-linecap="round" opacity="0.35"/>
    <path d="M128 120 L163 80" stroke="${o.vein}" stroke-width="2.4" stroke-linecap="round" opacity="0.3"/>
    <path d="M105 182 C92 175 92 153 105 140 C118 153 118 175 105 182 Z" transform="rotate(-40 105 182)" fill="${o.l3}"${fo(2)}/>
    <path d="M151 182 C138 175 138 153 151 140 C164 153 164 175 151 182 Z" transform="rotate(40 151 182)" fill="${o.l3}"${fo(2)}/>
    <path d="M128 184 C112 176 112 148 128 130 C144 148 144 176 128 184 Z" fill="${o.l1}"${fo(0)}/>
    <circle cx="128" cy="110" r="12" fill="${o.ink}"/>
    <path d="M128 126 C118 136 118 154 128 168 C138 154 138 136 128 126 Z" fill="${o.ink}"/>
    <path d="M126 130 C112 122 102 112 100 100" stroke="${o.ink}" stroke-width="11" stroke-linecap="round" fill="none"/>
    <path d="M130 130 C144 122 154 112 156 100" stroke="${o.ink}" stroke-width="11" stroke-linecap="round" fill="none"/>`;
}
const emblemAt = (o, x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 256})">${emblem(o)}</g>`;

// --- Varyant paletleri ---
function palette(name) {
  const base = { l1: C.sage, l2: C.sageDark, l3: C.sageLight, leafOp: [1, 1, 1] };
  switch (name) {
    case "color":    return { ...base, ink: C.forest, vein: C.forest, big: C.forest, sub: C.sageDark, subOp: 1 };
    case "reversed": return { ...base, ink: C.cream,  vein: C.cream,  big: C.cream,  sub: C.sageLight, subOp: 1 };
    case "forest":   return { ink: C.forest, l1: C.forest, l2: C.forest, l3: C.forest, leafOp: [0.9, 0.62, 0.42], vein: C.forest, big: C.forest, sub: C.forest, subOp: 0.72 };
    case "black":    return { ink: C.black,  l1: C.black,  l2: C.black,  l3: C.black,  leafOp: [0.9, 0.62, 0.42], vein: C.black,  big: C.black,  sub: C.black,  subOp: 0.72 };
    case "white":    return { ink: C.warmWhite, l1: C.warmWhite, l2: C.warmWhite, l3: C.warmWhite, leafOp: [0.9, 0.62, 0.42], vein: C.warmWhite, big: C.warmWhite, sub: C.warmWhite, subOp: 0.72 };
  }
}

// --- Kompozisyonlar: {inner, w, h} döndürür ---
const PAD = 90;
function stacked(p) {
  const E = 300;
  const big = textPath(cormorant, "Öz & Saye", 168);
  const sub = trackedPath(nunito, "PSİKOLOJİ", 46, 18);
  const w = Math.max(E, big.w, sub.w) + PAD * 2;
  const cx = w / 2;
  const yEmblem = PAD;
  const yBig = yEmblem + E + 64;
  const ySub = yBig + big.h + 30;
  const h = ySub + sub.h + PAD;
  const inner =
    emblemAt(p, cx - E / 2, yEmblem, E) +
    place(big, p.big, 1, cx, yBig) +
    place(sub, p.sub, p.subOp, cx, ySub);
  return { inner, w: Math.round(w), h: Math.round(h) };
}
function horizontal(p) {
  const E = 280;
  const big = textPath(cormorant, "Öz & Saye", 150);
  const sub = trackedPath(nunito, "PSİKOLOJİ", 40, 16);
  const gap = 56;
  const textLeft = PAD + E + gap;
  const blockH = big.h + 24 + sub.h;
  const h = Math.max(E, blockH) + PAD * 2;
  const yEmblem = (h - E) / 2;
  const yBig = (h - blockH) / 2;
  const ySub = yBig + big.h + 24;
  const w = textLeft + Math.max(big.w, sub.w) + PAD;
  // sol hizalı metin: cx'i metin merkezine ayarla
  const bigCx = textLeft + big.w / 2;
  const subCx = textLeft + sub.w / 2;
  const inner =
    emblemAt(p, PAD, yEmblem, E) +
    place(big, p.big, 1, bigCx, yBig) +
    place(sub, p.sub, p.subOp, subCx, ySub);
  return { inner, w: Math.round(w), h: Math.round(h) };
}
function emblemOnly(p) {
  const E = 320, pad = 40;
  return { inner: emblemAt(p, pad, pad, E), w: E + pad * 2, h: E + pad * 2 };
}

function svgDoc(c, bg) {
  const rect = bg ? `<rect width="${c.w}" height="${c.h}" fill="${bg}"/>` : "";
  return `<svg width="${c.w}" height="${c.h}" viewBox="0 0 ${c.w} ${c.h}" xmlns="http://www.w3.org/2000/svg">${rect}${c.inner}</svg>`;
}
async function writePNG(c, file, targetW, bg) {
  const k = targetW / c.w;
  const rect = bg ? `<rect width="${c.w}" height="${c.h}" fill="${bg}"/>` : "";
  const svg = `<svg width="${targetW}" height="${Math.round(c.h * k)}" viewBox="0 0 ${c.w} ${c.h}" xmlns="http://www.w3.org/2000/svg">${rect}${c.inner}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(PNG_DIR, file));
}

(async () => {
  // Ana varyantlar: SVG (vektör) + saydam PNG
  const specs = [
    ["color",    "ozsaye-logo",            stacked,    1600],
    ["color",    "ozsaye-logo-yatay",      horizontal, 2200],
    ["color",    "ozsaye-amblem",          emblemOnly, 1024],
    ["reversed", "ozsaye-logo-ters",       stacked,    1600],
    ["reversed", "ozsaye-logo-yatay-ters", horizontal, 2200],
    ["reversed", "ozsaye-amblem-ters",     emblemOnly, 1024],
    ["forest",   "ozsaye-logo-mono-forest", stacked,   1600],
    ["black",    "ozsaye-logo-mono-siyah",  stacked,   1600],
    ["white",    "ozsaye-logo-mono-beyaz",  stacked,   1600],
  ];
  for (const [pal, name, comp, tw] of specs) {
    const c = comp(palette(pal));
    fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svgDoc(c));
    await writePNG(c, `${name}.png`, tw);
  }
  // Ek amblem boyutları
  for (const sz of [512, 256, 128]) await writePNG(emblemOnly(palette("color")), `ozsaye-amblem-${sz}.png`, sz);

  // Sitede kullanılan yatay logo (saydam, gerçek font)
  await sharp(Buffer.from(svgDoc(horizontal(palette("color")))))
    .resize({ width: 1100 }).png().toFile(path.join(ROOT, "public", "logo.png"));

  // --- Önizleme tablosu (overview) ---
  const tile = (c, x, y, tw, label, labelColor) => {
    const k = tw / c.w, hh = c.h * k;
    return `<g transform="translate(${x} ${y})"><g transform="scale(${k})">${c.inner}</g>
      <text x="${tw / 2}" y="${hh + 34}" text-anchor="middle" font-family="Nunito" font-size="22" fill="${labelColor}">${label}</text></g>`;
  };
  const OW = 1680, panelH = 470;
  const colorC = stacked(palette("color")), revC = stacked(palette("reversed"));
  const horC = horizontal(palette("color")), embC = emblemOnly(palette("color"));
  const forestC = stacked(palette("forest")), blackC = stacked(palette("black")), whiteC = stacked(palette("white"));
  const overview = `<svg width="${OW}" height="${panelH * 2 + 120}" viewBox="0 0 ${OW} ${panelH * 2 + 120}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${OW}" height="${panelH * 2 + 120}" fill="${C.warmWhite}"/>
    <text x="${OW / 2}" y="64" text-anchor="middle" font-family="Cormorant Garamond" font-weight="700" font-size="44" fill="${C.forest}">Öz &amp; Saye Psikoloji — Logo Kiti</text>
    <!-- üst sıra: açık zemin -->
    <rect x="40" y="100" width="${OW - 80}" height="${panelH}" rx="20" fill="${C.cream}"/>
    ${tile(colorC, 90, 150, 360, "Ana (dikey)", C.forest)}
    ${tile(horC, 560, 230, 640, "Yatay", C.forest)}
    ${tile(embC, 1300, 175, 300, "Amblem", C.forest)}
    <!-- alt sıra: koyu zemin (ters) + mono -->
    <rect x="40" y="${120 + panelH}" width="${(OW - 100) / 2}" height="${panelH}" rx="20" fill="${C.forest}"/>
    <rect x="${60 + (OW - 100) / 2}" y="${120 + panelH}" width="${(OW - 100) / 2}" height="${panelH}" rx="20" fill="${C.warmWhite}" stroke="${C.cream}" stroke-width="2"/>
    ${tile(revC, 120, 175 + panelH, 340, "Ters (koyu zemin)", C.cream)}
    ${tile(forestC, 520, 175 + panelH, 300, "Mono forest", C.cream)}
    ${tile(blackC, 900, 175 + panelH, 300, "Mono siyah", C.forest)}
    ${tile(whiteC, 1280, 175 + panelH, 300, "Mono beyaz", C.forest)}
  </svg>`;
  await sharp(Buffer.from(overview)).png().toFile(path.join(ROOT, "brand", "logo", "ozsaye-logo-overview.png"));

  console.log("brand/logo/svg:", fs.readdirSync(SVG_DIR).join(", "));
  console.log("brand/logo/png:", fs.readdirSync(PNG_DIR).join(", "));
  console.log("+ brand/logo/ozsaye-logo-overview.png, public/logo.png");
})();
