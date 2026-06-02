// Öz & Saye Psikoloji — marka görselleri üretici
// Çalıştırma: node scripts/generate-brand-assets.cjs
// Amblem + marka paleti ile site varlıkları (og.png, logo.png) ve
// Instagram/LinkedIn şablonlarını üretir.
//   public/og.png, public/logo.png
//   brand/social/*.png
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

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
};
const SERIF = "Liberation Serif, DejaVu Serif, serif";
const SANS = "DejaVu Sans, Liberation Sans, sans-serif";
const ROOT = path.join(__dirname, "..");
const SOCIAL = path.join(ROOT, "brand", "social");
const PUBLIC = path.join(ROOT, "public");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Amblem; ink = halka + figür rengi (açık zeminde forest, koyuda cream)
function emblem(ink) {
  return `
  <circle cx="128" cy="128" r="96" stroke="${ink}" stroke-width="7" fill="none"/>
  <path d="M128 120 C102 108 102 72 128 50 C154 72 154 108 128 120 Z" transform="rotate(-52 128 120)" fill="${C.sage}"/>
  <path d="M128 120 C102 108 102 72 128 50 C154 72 154 108 128 120 Z" transform="rotate(52 128 120)" fill="${C.sageDark}"/>
  <path d="M105 182 C92 175 92 153 105 140 C118 153 118 175 105 182 Z" transform="rotate(-40 105 182)" fill="${C.sageLight}"/>
  <path d="M151 182 C138 175 138 153 151 140 C164 153 164 175 151 182 Z" transform="rotate(40 151 182)" fill="${C.sageLight}"/>
  <path d="M128 184 C112 176 112 148 128 130 C144 148 144 176 128 184 Z" fill="${C.sage}"/>
  <circle cx="128" cy="110" r="12" fill="${ink}"/>
  <path d="M128 126 C118 136 118 154 128 168 C138 154 138 136 128 126 Z" fill="${ink}"/>
  <path d="M126 130 C112 122 102 112 100 100" stroke="${ink}" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M130 130 C144 122 154 112 156 100" stroke="${ink}" stroke-width="11" stroke-linecap="round" fill="none"/>`;
}
const emblemAt = (x, y, scale, ink) =>
  `<g transform="translate(${x} ${y}) scale(${scale / 256})">${emblem(ink)}</g>`;

// Ortalanmış "Öz & Saye" + "Psikoloji" wordmark
function wordmarkCentered(cx, y, big, ink, sub) {
  return `
    <text x="${cx}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="${big}" font-weight="700" fill="${ink}">Öz &amp; Saye</text>
    <text x="${cx}" y="${y + big * 0.5}" text-anchor="middle" font-family="${SANS}" font-size="${big * 0.32}" letter-spacing="${big * 0.12}" fill="${sub}">PSİKOLOJİ</text>`;
}

async function render(dir, name, w, h, inner, density = 144) {
  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  await sharp(Buffer.from(svg), { density }).png().toFile(path.join(dir, name));
}

(async () => {
  fs.mkdirSync(SOCIAL, { recursive: true });

  // ---- Site varlıkları (public/) ----

  // OG (1200x630)
  await render(PUBLIC, "og.png", 1200, 630, `
    <rect width="1200" height="630" fill="${C.cream}"/>
    <rect x="24" y="24" width="1152" height="582" rx="18" fill="none" stroke="${C.forest}" stroke-opacity="0.18" stroke-width="2"/>
    ${emblemAt(520, 54, 160, C.forest)}
    ${wordmarkCentered(600, 360, 74, C.forest, C.sageDark)}
    <line x1="540" y1="408" x2="660" y2="408" stroke="${C.sage}" stroke-width="2"/>
    <text x="600" y="476" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="32" fill="${C.forestLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
    <text x="600" y="544" text-anchor="middle" font-family="${SANS}" font-size="24" fill="${C.forest}" fill-opacity="0.7">Psk. Dan. Melek Yıldız&#160;&#160;•&#160;&#160;Kl. Psk. Sacide Şahin</text>
  `);

  // Yatay tam logo (transparent, public/logo.png)
  await render(PUBLIC, "logo.png", 1100, 380, `
    <g transform="translate(40,62)">${emblem(C.forest)}</g>
    <text x="340" y="170" font-family="${SERIF}" font-size="98" font-weight="700" fill="${C.forest}">Öz &amp; Saye</text>
    <text x="343" y="232" font-family="${SANS}" font-size="38" letter-spacing="13" fill="${C.sageDark}">PSİKOLOJİ</text>
    <text x="345" y="300" font-family="${SERIF}" font-style="italic" font-size="29" fill="${C.forestLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
  `, 200);

  // ---- Sosyal medya (brand/social/) ----

  // 1) Instagram duyuru (1080x1080, açık)
  await render(SOCIAL, "instagram-duyuru.png", 1080, 1080, `
    <rect width="1080" height="1080" fill="${C.cream}"/>
    <rect x="40" y="40" width="1000" height="1000" rx="28" fill="none" stroke="${C.forest}" stroke-opacity="0.16" stroke-width="2"/>
    ${emblemAt(440, 150, 200, C.forest)}
    ${wordmarkCentered(540, 520, 92, C.forest, C.sageDark)}
    <line x1="470" y1="585" x2="610" y2="585" stroke="${C.sage}" stroke-width="3"/>
    <text x="540" y="670" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="42" fill="${C.forestLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
    <text x="540" y="810" text-anchor="middle" font-family="${SANS}" font-size="34" fill="${C.forest}" fill-opacity="0.75">Online &amp; Yüz Yüze Terapi</text>
    <text x="540" y="995" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="2" fill="${C.sageDark}">@ozsayepsikoloji</text>
  `);

  // 2) Instagram alıntı (1080x1080, koyu)
  await render(SOCIAL, "instagram-alinti.png", 1080, 1080, `
    <rect width="1080" height="1080" fill="${C.forest}"/>
    <rect x="40" y="40" width="1000" height="1000" rx="28" fill="none" stroke="${C.cream}" stroke-opacity="0.18" stroke-width="2"/>
    ${emblemAt(465, 120, 150, C.cream)}
    <text x="540" y="500" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="72" fill="${C.cream}">“Güvenli Bir Bölgede</text>
    <text x="540" y="590" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="72" fill="${C.cream}">Kendi Özüne Doğru.”</text>
    <text x="540" y="720" text-anchor="middle" font-family="${SANS}" font-size="32" fill="${C.sageLight}">Kendine iyi gelmek bir lüks değil, ihtiyaçtır.</text>
    <text x="540" y="995" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="2" fill="${C.sage}">@ozsayepsikoloji</text>
  `);

  // 3) Instagram hizmetler (1080x1080)
  const services = ["Bireysel Psikoterapi", "Çift Terapisi", "Aile Danışmanlığı", "Çocuk & Ergen Terapisi", "Travma Terapisi"];
  const rows = services.map((s, i) => {
    const y = 575 + i * 92;
    return `<circle cx="300" cy="${y - 10}" r="7" fill="${C.sage}"/>
      <text x="335" y="${y}" font-family="${SANS}" font-size="42" fill="${C.forest}">${esc(s)}</text>`;
  }).join("");
  await render(SOCIAL, "instagram-hizmetler.png", 1080, 1080, `
    <rect width="1080" height="1080" fill="${C.warmWhite}"/>
    <rect x="0" y="0" width="1080" height="300" fill="${C.cream}"/>
    ${emblemAt(465, 70, 150, C.forest)}
    <text x="540" y="410" text-anchor="middle" font-family="${SERIF}" font-size="66" font-weight="700" fill="${C.forest}">Hizmetlerimiz</text>
    ${rows}
    <text x="540" y="1015" text-anchor="middle" font-family="${SANS}" font-size="28" letter-spacing="2" fill="${C.sageDark}">ozsayepsikoloji.com  ·  @ozsayepsikoloji</text>
  `);

  // 4) Instagram avatar (320x320)
  await render(SOCIAL, "instagram-avatar.png", 320, 320, `
    <rect width="320" height="320" fill="${C.forest}"/>
    ${emblemAt(35, 35, 250, C.cream)}
  `);

  // 5) Instagram story (1080x1920)
  await render(SOCIAL, "instagram-story.png", 1080, 1920, `
    <rect width="1080" height="1920" fill="${C.cream}"/>
    <rect x="0" y="0" width="1080" height="640" fill="${C.forest}"/>
    ${emblemAt(390, 180, 300, C.cream)}
    ${wordmarkCentered(540, 560, 64, C.cream, C.sageLight)}
    <text x="540" y="900" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="52" fill="${C.forest}">“Güvenli Bir Bölgede</text>
    <text x="540" y="975" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="52" fill="${C.forest}">Kendi Özüne Doğru.”</text>
    <line x1="465" y1="1050" x2="615" y2="1050" stroke="${C.sage}" stroke-width="3"/>
    <text x="540" y="1160" text-anchor="middle" font-family="${SANS}" font-size="38" fill="${C.forest}" fill-opacity="0.75">Online &amp; Yüz Yüze Terapi</text>
    <text x="540" y="1740" text-anchor="middle" font-family="${SANS}" font-size="34" letter-spacing="2" fill="${C.sageDark}">@ozsayepsikoloji</text>
  `);

  // 6) Uzman tanıtım kartları (1080x1350) — fotoğraf için yer tutuculu
  const experts = [
    { name: "Melek Yıldız", title: "Psikolojik Danışman", initials: "MY", file: "uzman-melek-yildiz.png" },
    { name: "Sacide Şahin", title: "Klinik Psikolog", initials: "SŞ", file: "uzman-sacide-sahin.png" },
  ];
  for (const e of experts) {
    await render(SOCIAL, e.file, 1080, 1350, `
      <rect width="1080" height="1350" fill="${C.cream}"/>
      <rect x="40" y="40" width="1000" height="1270" rx="28" fill="none" stroke="${C.forest}" stroke-opacity="0.16" stroke-width="2"/>
      ${emblemAt(490, 90, 100, C.forest)}
      <text x="540" y="250" text-anchor="middle" font-family="${SANS}" font-size="26" letter-spacing="6" fill="${C.sageDark}">ÖZ &amp; SAYE PSİKOLOJİ</text>
      <circle cx="540" cy="640" r="220" fill="${C.warmWhite}" stroke="${C.sage}" stroke-width="6"/>
      <text x="540" y="710" text-anchor="middle" font-family="${SERIF}" font-size="180" font-weight="700" fill="${C.sage}" fill-opacity="0.55">${e.initials}</text>
      <text x="540" y="1000" text-anchor="middle" font-family="${SERIF}" font-size="76" font-weight="700" fill="${C.forest}">${esc(e.name)}</text>
      <text x="540" y="1075" text-anchor="middle" font-family="${SANS}" font-size="38" fill="${C.forestLight}">${esc(e.title)}</text>
      <line x1="470" y1="1130" x2="610" y2="1130" stroke="${C.sage}" stroke-width="3"/>
      <text x="540" y="1210" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="34" fill="${C.sageDark}">${esc("“Güvenli bir bölgede kendi özüne doğru.”")}</text>
    `);
  }

  // 7) LinkedIn kapak (1584x396)
  await render(SOCIAL, "linkedin-kapak.png", 1584, 396, `
    <rect width="1584" height="396" fill="${C.cream}"/>
    <rect x="0" y="0" width="14" height="396" fill="${C.forest}"/>
    ${emblemAt(120, 88, 220, C.forest)}
    <text x="400" y="185" font-family="${SERIF}" font-size="82" font-weight="700" fill="${C.forest}">Öz &amp; Saye Psikoloji</text>
    <text x="403" y="245" font-family="${SANS}" font-size="32" letter-spacing="7" fill="${C.sageDark}">PSİKOLOJİK DANIŞMANLIK &amp; TERAPİ</text>
    <text x="405" y="308" font-family="${SERIF}" font-style="italic" font-size="34" fill="${C.forestLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
  `);

  // 8) LinkedIn paylaşım (1200x627)
  await render(SOCIAL, "linkedin-post.png", 1200, 627, `
    <rect width="1200" height="627" fill="${C.forest}"/>
    <rect x="24" y="24" width="1152" height="579" rx="18" fill="none" stroke="${C.cream}" stroke-opacity="0.2" stroke-width="2"/>
    ${emblemAt(80, 200, 230, C.cream)}
    <text x="360" y="265" font-family="${SERIF}" font-size="72" font-weight="700" fill="${C.cream}">Öz &amp; Saye Psikoloji</text>
    <text x="362" y="325" font-family="${SERIF}" font-style="italic" font-size="36" fill="${C.sageLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
    <line x1="362" y1="365" x2="500" y2="365" stroke="${C.sage}" stroke-width="3"/>
    <text x="360" y="425" font-family="${SANS}" font-size="30" fill="${C.cream}" fill-opacity="0.8">Psk. Dan. Melek Yıldız  ·  Kl. Psk. Sacide Şahin</text>
  `);

  console.log("public/: og.png, logo.png");
  console.log("brand/social/:", fs.readdirSync(SOCIAL).filter((f) => f.endsWith(".png")).join(", "));
})();
