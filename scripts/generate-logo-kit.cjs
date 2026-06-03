// Öz & Saye Psikoloji — profesyonel logo kiti üretici
// Çalıştırma: node scripts/generate-logo-kit.cjs
// Ortak çizim kütüphanesini (scripts/lib/brand.cjs) kullanır; amblem "Figür +
// Kanat" (Konsept B). Metin marka fontlarıyla vektör yola çevrilir.
//
// Çıktılar:
//   brand/logo/svg/*.svg   (vektör ana dosyalar — metin outline)
//   brand/logo/png/*.png   (saydam zeminli yüksek çözünürlük)
//   brand/logo/ozsaye-logo-overview.png  (tüm varyantların önizleme tablosu)
//   public/logo.png        (yatay ana logo, saydam)
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { C, fonts, textPath, trackedPath, place, emblemAt, inkPalettes, svgDoc } =
  require("./lib/brand.cjs");

const ROOT = path.join(__dirname, "..");
const SVG_DIR = path.join(ROOT, "brand", "logo", "svg");
const PNG_DIR = path.join(ROOT, "brand", "logo", "png");
fs.mkdirSync(SVG_DIR, { recursive: true });
fs.mkdirSync(PNG_DIR, { recursive: true });

const t = (f, s, sz) => textPath(f, s, sz);
const tr = (f, s, sz, k) => trackedPath(f, s, sz, k);
// Metin renkleri (amblem paletiyle eşleşir)
const TEXT = {
  color: { big: C.forest, sub: C.sageDark, subOp: 1 },
  reversed: { big: C.cream, sub: C.sageLight, subOp: 1 },
  forest: { big: C.forest, sub: C.forest, subOp: 0.72 },
  black: { big: C.black, sub: C.black, subOp: 0.72 },
  white: { big: C.warmWhite, sub: C.warmWhite, subOp: 0.72 },
};

const PAD = 90;
function stacked(name) {
  const e = inkPalettes[name], tx = TEXT[name];
  const E = 320, cx0 = 0;
  const big = t(fonts.serif, "Öz & Saye", 168);
  const sub = tr(fonts.sans, "PSİKOLOJİ", 46, 18);
  const w = Math.max(E, big.w, sub.w) + PAD * 2;
  const cx = w / 2;
  const yE = PAD, yBig = yE + E + 44, ySub = yBig + big.h + 30;
  const h = ySub + sub.h + PAD;
  const inner = emblemAt(e, cx - E / 2, yE, E) +
    place(big, tx.big, cx, yBig) +
    place(sub, tx.sub, cx, ySub, { opacity: tx.subOp });
  void cx0;
  return { inner, w: Math.round(w), h: Math.round(h) };
}
function horizontal(name) {
  const e = inkPalettes[name], tx = TEXT[name];
  const E = 300;
  const big = t(fonts.serif, "Öz & Saye", 150);
  const sub = tr(fonts.sans, "PSİKOLOJİ", 40, 16);
  const gap = 52, textLeft = PAD + E + gap;
  const blockH = big.h + 24 + sub.h;
  const h = Math.max(E, blockH) + PAD * 2;
  const yE = (h - E) / 2, yBig = (h - blockH) / 2, ySub = yBig + big.h + 24;
  const w = textLeft + Math.max(big.w, sub.w) + PAD;
  const inner = emblemAt(e, PAD, yE, E) +
    place(big, tx.big, textLeft, yBig, { align: "left" }) +
    place(sub, tx.sub, textLeft, ySub, { align: "left", opacity: tx.subOp });
  return { inner, w: Math.round(w), h: Math.round(h) };
}
function emblemOnly(name) {
  const E = 320, pad = 50;
  return { inner: emblemAt(inkPalettes[name], pad, pad, E), w: E + pad * 2, h: E + pad * 2 };
}

async function writePNG(c, file, targetW, bg) {
  const k = targetW / c.w;
  const rect = bg ? `<rect width="${c.w}" height="${c.h}" fill="${bg}"/>` : "";
  const svg = `<svg width="${targetW}" height="${Math.round(c.h * k)}" viewBox="0 0 ${c.w} ${c.h}" xmlns="http://www.w3.org/2000/svg">${rect}${c.inner}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(PNG_DIR, file));
}

(async () => {
  const specs = [
    ["color", "ozsaye-logo", stacked, 1600],
    ["color", "ozsaye-logo-yatay", horizontal, 2200],
    ["color", "ozsaye-amblem", emblemOnly, 1024],
    ["reversed", "ozsaye-logo-ters", stacked, 1600],
    ["reversed", "ozsaye-logo-yatay-ters", horizontal, 2200],
    ["reversed", "ozsaye-amblem-ters", emblemOnly, 1024],
    ["forest", "ozsaye-logo-mono-forest", stacked, 1600],
    ["black", "ozsaye-logo-mono-siyah", stacked, 1600],
    ["white", "ozsaye-logo-mono-beyaz", stacked, 1600],
  ];
  for (const [pal, name, comp, tw] of specs) {
    const c = comp(pal);
    fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svgDoc(c.inner, c.w, c.h));
    await writePNG(c, `${name}.png`, tw);
  }
  for (const sz of [512, 256, 128]) await writePNG(emblemOnly("color"), `ozsaye-amblem-${sz}.png`, sz);

  // Sitede kullanılan yatay logo (saydam)
  const horC = horizontal("color");
  await sharp(Buffer.from(svgDoc(horC.inner, horC.w, horC.h)))
    .resize({ width: 1100 }).png().toFile(path.join(ROOT, "public", "logo.png"));

  // Önizleme tablosu
  const tile = (c, x, y, tw, label, labelColor) => {
    const k = tw / c.w, hh = c.h * k;
    return `<g transform="translate(${x} ${y})"><g transform="scale(${k})">${c.inner}</g>
      <text x="${tw / 2}" y="${hh + 34}" text-anchor="middle" font-family="Montserrat" font-size="22" fill="${labelColor}">${label}</text></g>`;
  };
  const OW = 1680, panelH = 470;
  const overview = `<svg width="${OW}" height="${panelH * 2 + 120}" viewBox="0 0 ${OW} ${panelH * 2 + 120}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${OW}" height="${panelH * 2 + 120}" fill="${C.warmWhite}"/>
    <text x="${OW / 2}" y="64" text-anchor="middle" font-family="Playfair Display" font-weight="700" font-size="44" fill="${C.forest}">Öz &amp; Saye Psikoloji — Logo Kiti</text>
    <rect x="40" y="100" width="${OW - 80}" height="${panelH}" rx="20" fill="${C.cream}"/>
    ${tile(stacked("color"), 90, 150, 360, "Ana (dikey)", C.forest)}
    ${tile(horizontal("color"), 560, 250, 640, "Yatay", C.forest)}
    ${tile(emblemOnly("color"), 1320, 175, 280, "Amblem", C.forest)}
    <rect x="40" y="${120 + panelH}" width="${(OW - 100) / 2}" height="${panelH}" rx="20" fill="${C.forest}"/>
    <rect x="${60 + (OW - 100) / 2}" y="${120 + panelH}" width="${(OW - 100) / 2}" height="${panelH}" rx="20" fill="${C.warmWhite}" stroke="${C.cream}" stroke-width="2"/>
    ${tile(stacked("reversed"), 120, 175 + panelH, 340, "Ters (koyu zemin)", C.cream)}
    ${tile(stacked("forest"), 520, 175 + panelH, 300, "Mono forest", C.cream)}
    ${tile(stacked("black"), 900, 175 + panelH, 300, "Mono siyah", C.forest)}
    ${tile(stacked("white"), 1280, 175 + panelH, 300, "Mono beyaz", C.forest)}
  </svg>`;
  await sharp(Buffer.from(overview)).png().toFile(path.join(ROOT, "brand", "logo", "ozsaye-logo-overview.png"));

  console.log("logo kiti üretildi:", fs.readdirSync(SVG_DIR).length, "svg,", fs.readdirSync(PNG_DIR).length, "png");
})();
