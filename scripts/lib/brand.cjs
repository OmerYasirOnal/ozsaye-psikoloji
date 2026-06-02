// Öz & Saye Psikoloji — paylaşılan marka çizim kütüphanesi.
// Amblem geometrisi, marka fontlarıyla metin->vektör yol dönüşümü ve
// yerleştirme yardımcıları. generate-logo-kit.cjs ve generate-instagram.cjs
// bu modülü kullanır.
//
// ÖN KOŞUL: marka fontları /usr/share/fonts/brand/ altında kurulu olmalı
// (Cormorant Garamond Bold/SemiBold/MediumItalic + Nunito). Bkz. README/doküman.
const opentype = require("opentype.js");
const sharp = require("sharp");
const fs = require("fs");

const C = {
  forest: "#2B5233",
  forestDark: "#1E3A24",
  forestLight: "#3A6B45",
  sage: "#92B594",
  sageLight: "#AFC6B0",
  sageDark: "#7A9E7C",
  cream: "#F1EAD9",
  creamDark: "#E5D9C3",
  warmWhite: "#FDFBF7",
  black: "#1A1A1A",
};

const FONT_DIR = "/usr/share/fonts/brand";
const load = (f) => {
  const b = fs.readFileSync(`${FONT_DIR}/${f}`);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const fonts = {
  serif: load("CormorantGaramond-Bold.ttf"),
  serifSemi: load("CormorantGaramond-SemiBold.ttf"),
  italic: load("CormorantGaramond-MediumItalic.ttf"),
  sans: load("Nunito.ttf"),
};

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
// Metin -> {d, bbox} (origin'de, baseline y=0)
// font.getPath() bazı fontlarda desteklenmeyen GSUB (ccmp) lookup'larında
// hata veriyor; bu yüzden glyph-glyph ilerleyip kerning'i elle uyguluyoruz.
function textPath(font, text, size) {
  const scale = size / font.unitsPerEm;
  let x = 0, prev = null, X1 = Infinity, Y1 = Infinity, X2 = -Infinity, Y2 = -Infinity;
  const ds = [];
  for (const ch of [...text]) {
    const g = font.charToGlyph(ch);
    if (prev) x += font.getKerningValue(prev, g) * scale;
    const gp = g.getPath(x, 0, size);
    const b = gp.getBoundingBox();
    if (isFinite(b.x1)) { X1 = Math.min(X1, b.x1); Y1 = Math.min(Y1, b.y1); X2 = Math.max(X2, b.x2); Y2 = Math.max(Y2, b.y2); }
    ds.push(pathToD(gp));
    x += g.advanceWidth * scale;
    prev = g;
  }
  return { d: ds.join(" "), x1: X1, y1: Y1, x2: X2, y2: Y2, w: X2 - X1, h: Y2 - Y1 };
}
// Harf aralıklı (tracked) metin -> {d, bbox}
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
// Bir yolu konumlandır. align: "center" (cx merkez) | "left" (cx sol kenar)
function place(t, fill, x, top, { opacity = 1, align = "center" } = {}) {
  const dx = align === "left" ? x - t.x1 : x - (t.x1 + t.x2) / 2;
  const dy = top - t.y1;
  const op = opacity !== 1 ? ` fill-opacity="${opacity}"` : "";
  return `<path d="${t.d}" fill="${fill}"${op} transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})"/>`;
}

// Amblem (LogoMark bileşeniyle birebir aynı geometri). o: {ink,l1,l2,l3,vein,leafOp}
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
const emblemAt = (o, x, y, size) =>
  `<g transform="translate(${x} ${y}) scale(${size / 256})">${emblem(o)}</g>`;

// Hazır amblem paletleri
const inkPalettes = {
  color: { ink: C.forest, l1: C.sage, l2: C.sageDark, l3: C.sageLight, vein: C.forest, leafOp: [1, 1, 1] },
  reversed: { ink: C.cream, l1: C.sage, l2: C.sageDark, l3: C.sageLight, vein: C.cream, leafOp: [1, 1, 1] },
  forest: { ink: C.forest, l1: C.forest, l2: C.forest, l3: C.forest, vein: C.forest, leafOp: [0.9, 0.62, 0.42] },
  white: { ink: C.warmWhite, l1: C.warmWhite, l2: C.warmWhite, l3: C.warmWhite, vein: C.warmWhite, leafOp: [0.9, 0.62, 0.42] },
};

// SVG -> PNG (genişlik hedefli, isteğe bağlı arka plan rengi)
async function renderPNG(inner, w, h, outPath, { targetW = w, bg = null } = {}) {
  const k = targetW / w;
  const rect = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : "";
  const svg = `<svg width="${targetW}" height="${Math.round(h * k)}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${rect}${inner}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}
function svgDoc(inner, w, h, bg) {
  const rect = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : "";
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${rect}${inner}</svg>`;
}

module.exports = {
  C, fonts, num, pathToD, textPath, trackedPath, place,
  emblem, emblemAt, inkPalettes, renderPNG, svgDoc,
};
