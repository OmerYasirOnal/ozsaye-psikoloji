// Öz & Saye Psikoloji — site + LinkedIn marka görselleri
// Çalıştırma: node scripts/generate-brand-assets.cjs
// Metin marka fontlarıyla (Cormorant Garamond + Nunito) vektör yola çevrilir.
// Bkz. scripts/lib/brand.cjs ön koşulları.
//   public/og.png            (1200x630 — OpenGraph/Twitter paylaşım görseli)
//   brand/social/linkedin-kapak.png, linkedin-post.png
const fs = require("fs");
const path = require("path");
const { C, fonts, textPath, trackedPath, place, emblemAt, inkPalettes, renderPNG } =
  require("./lib/brand.cjs");

const PUBLIC = path.join(__dirname, "..", "public");
const SOCIAL = path.join(__dirname, "..", "brand", "social");
fs.mkdirSync(SOCIAL, { recursive: true });

const TAGLINE = "Güvenli Bir Bölgede Kendi Özüne Doğru";
const EXPERTS = "Psk. Dan. Melek Yıldız   •   Kl. Psk. Sacide Şahin";
const t = (f, s, sz) => textPath(f, s, sz);
const tr = (f, s, sz, k) => trackedPath(f, s, sz, k);
const line = (x1, y1, x2, y2, c, w = 2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`;

(async () => {
  // OG (1200x630)
  {
    const cx = 600;
    const inner =
      `<rect x="24" y="24" width="1152" height="582" rx="18" fill="none" stroke="${C.forest}" stroke-opacity="0.18" stroke-width="2"/>` +
      emblemAt(inkPalettes.color, cx - 80, 56, 160) +
      place(t(fonts.serif, "Öz & Saye", 76), C.forest, cx, 270) +
      place(tr(fonts.sans, "PSİKOLOJİ", 24, 11), C.sageDark, cx, 360) +
      line(cx - 60, 405, cx + 60, 405, C.sage, 2) +
      place(t(fonts.italic, "“" + TAGLINE + "”", 32), C.forestLight, cx, 445) +
      place(t(fonts.sans, EXPERTS, 24), C.forest, cx, 540, { opacity: 0.72 });
    await renderPNG(inner, 1200, 630, path.join(PUBLIC, "og.png"), { bg: C.cream });
  }

  // LinkedIn kapak (1584x396)
  {
    const inner =
      `<rect x="0" y="0" width="14" height="396" fill="${C.forest}"/>` +
      emblemAt(inkPalettes.color, 110, 88, 220) +
      place(t(fonts.serif, "Öz & Saye Psikoloji", 78), C.forest, 400, 130, { align: "left" }) +
      place(tr(fonts.sans, "PSİKOLOJİK DANIŞMANLIK & TERAPİ", 26, 6), C.sageDark, 404, 235, { align: "left" }) +
      place(t(fonts.italic, "“" + TAGLINE + "”", 32), C.forestLight, 404, 285, { align: "left" });
    await renderPNG(inner, 1584, 396, path.join(SOCIAL, "linkedin-kapak.png"), { bg: C.cream });
  }

  // LinkedIn paylaşım (1200x627)
  {
    const inner =
      `<rect x="24" y="24" width="1152" height="579" rx="18" fill="none" stroke="${C.cream}" stroke-opacity="0.2" stroke-width="2"/>` +
      emblemAt(inkPalettes.reversed, 90, 205, 220) +
      place(t(fonts.serif, "Öz & Saye Psikoloji", 70), C.cream, 350, 235, { align: "left" }) +
      place(t(fonts.italic, "“" + TAGLINE + "”", 34), C.sageLight, 354, 320, { align: "left" }) +
      line(354, 372, 500, 372, C.sage, 3) +
      place(t(fonts.sans, EXPERTS, 28), C.cream, 352, 430, { align: "left", opacity: 0.85 });
    await renderPNG(inner, 1200, 627, path.join(SOCIAL, "linkedin-post.png"), { bg: C.forest });
  }

  console.log("public/og.png + brand/social/linkedin-kapak.png, linkedin-post.png");
})();
