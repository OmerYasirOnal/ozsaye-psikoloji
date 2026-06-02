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

// Dikey yaprak (tip yukarı): base (0,0) -> tip (0,-46), 200'lük kutuda kullanılır
function leaf(cx, cy, rot, scale, fill, opacity) {
  const op = opacity != null && opacity !== 1 ? ` fill-opacity="${opacity}"` : "";
  return `<path d="M0 0 C-13 -9 -13 -33 0 -46 C13 -33 13 -9 0 0 Z" fill="${fill}"${op} transform="translate(${cx} ${cy}) rotate(${rot}) scale(${scale})"/>`;
}

// Amblem — "Figür + Kanat" (Konsept B): kollarını açan figür, iki yaprak kanat.
// 200x200 kutuda tanımlı. o: {ink, leafA, leafB, leafAOp?, leafBOp?}
function emblem(o) {
  return `
    ${leaf(86, 116, -28, 1.5, o.leafA, o.leafAOp)}
    ${leaf(114, 116, 28, 1.5, o.leafB, o.leafBOp)}
    <circle cx="100" cy="78" r="11" fill="${o.ink}"/>
    <path d="M100 92 C92 104 92 132 100 150 C108 132 108 104 100 92 Z" fill="${o.ink}"/>
    <path d="M99 100 C88 96 80 90 78 82" stroke="${o.ink}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M101 100 C112 96 120 90 122 82" stroke="${o.ink}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
}
const emblemAt = (o, x, y, size) =>
  `<g transform="translate(${x} ${y}) scale(${size / 200})">${emblem(o)}</g>`;

// Hazır amblem paletleri
const inkPalettes = {
  color: { ink: C.forest, leafA: C.sage, leafB: C.sageDark },
  reversed: { ink: C.cream, leafA: C.sage, leafB: C.sageDark },
  forest: { ink: C.forest, leafA: C.forest, leafB: C.forest, leafAOp: 0.5, leafBOp: 0.78 },
  black: { ink: C.black, leafA: C.black, leafB: C.black, leafAOp: 0.5, leafBOp: 0.78 },
  white: { ink: C.warmWhite, leafA: C.warmWhite, leafB: C.warmWhite, leafAOp: 0.5, leafBOp: 0.78 },
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
