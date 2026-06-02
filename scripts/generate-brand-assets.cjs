// Özsaye Psikoloji — marka görselleri üretici
// Çalıştırma: node scripts/generate-brand-assets.cjs
// Amblem + marka paleti ile Instagram/LinkedIn şablonları ve avatar üretir.
// Çıktılar: brand/social/*.png
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
const OUT = path.join(__dirname, "..", "brand", "social");

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
function emblemAt(x, y, scale, ink) {
  return `<g transform="translate(${x} ${y}) scale(${scale / 256})">${emblem(ink)}</g>`;
}
async function render(name, w, h, inner, density = 144) {
  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const file = path.join(OUT, name);
  await sharp(Buffer.from(svg), { density }).png().toFile(file);
  return file;
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // 1) Instagram — duyuru kartı (1080x1080, açık zemin)
  await render("instagram-duyuru.png", 1080, 1080, `
    <rect width="1080" height="1080" fill="${C.cream}"/>
    <rect x="40" y="40" width="1000" height="1000" rx="28" fill="none" stroke="${C.forest}" stroke-opacity="0.16" stroke-width="2"/>
    ${emblemAt(440, 150, 200, C.forest)}
    <text x="540" y="560" text-anchor="middle" font-family="${SERIF}" font-size="86" font-weight="700" fill="${C.forest}">Özsaye Psikoloji</text>
    <line x1="470" y1="600" x2="610" y2="600" stroke="${C.sage}" stroke-width="3"/>
    <text x="540" y="680" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="44" fill="${C.forestLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
    <text x="540" y="800" text-anchor="middle" font-family="${SANS}" font-size="34" fill="${C.forest}" fill-opacity="0.75">Online &amp; Yüz Yüze Terapi</text>
    <text x="540" y="990" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="2" fill="${C.sageDark}">@ozsayepsikoloji</text>
  `);

  // 2) Instagram — alıntı/slogan kartı (1080x1080, koyu zemin)
  await render("instagram-alinti.png", 1080, 1080, `
    <rect width="1080" height="1080" fill="${C.forest}"/>
    <rect x="40" y="40" width="1000" height="1000" rx="28" fill="none" stroke="${C.cream}" stroke-opacity="0.18" stroke-width="2"/>
    ${emblemAt(465, 120, 150, C.cream)}
    <text x="540" y="500" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="72" fill="${C.cream}">“Güvenli Bir Bölgede</text>
    <text x="540" y="590" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="72" fill="${C.cream}">Kendi Özüne Doğru.”</text>
    <text x="540" y="720" text-anchor="middle" font-family="${SANS}" font-size="32" fill="${C.sageLight}">Kendine iyi gelmek bir lüks değil, ihtiyaçtır.</text>
    <text x="540" y="990" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="2" fill="${C.sage}">@ozsayepsikoloji</text>
  `);

  // 3) Instagram — hizmetler kartı (1080x1080)
  const services = ["Bireysel Psikoterapi", "Çift Terapisi", "Aile Danışmanlığı", "Çocuk & Ergen Terapisi", "Travma Terapisi"];
  const rows = services.map((s, i) => {
    const y = 560 + i * 92;
    return `<circle cx="300" cy="${y - 10}" r="7" fill="${C.sage}"/>
      <text x="335" y="${y}" font-family="${SANS}" font-size="42" fill="${C.forest}">${esc(s)}</text>`;
  }).join("");
  await render("instagram-hizmetler.png", 1080, 1080, `
    <rect width="1080" height="1080" fill="${C.warmWhite}"/>
    <rect x="0" y="0" width="1080" height="300" fill="${C.cream}"/>
    ${emblemAt(465, 70, 150, C.forest)}
    <text x="540" y="400" text-anchor="middle" font-family="${SERIF}" font-size="66" font-weight="700" fill="${C.forest}">Hizmetlerimiz</text>
    ${rows}
    <text x="540" y="1010" text-anchor="middle" font-family="${SANS}" font-size="28" letter-spacing="2" fill="${C.sageDark}">ozsayepsikoloji.com  ·  @ozsayepsikoloji</text>
  `);

  // 4) Instagram — profil fotoğrafı (320x320, dairesel görünüm için forest dolu)
  await render("instagram-avatar.png", 320, 320, `
    <rect width="320" height="320" fill="${C.forest}"/>
    ${emblemAt(35, 35, 250, C.cream)}
  `);

  // 5) LinkedIn — kapak/banner (1584x396)
  await render("linkedin-kapak.png", 1584, 396, `
    <rect width="1584" height="396" fill="${C.cream}"/>
    <rect x="0" y="0" width="14" height="396" fill="${C.forest}"/>
    ${emblemAt(120, 88, 220, C.forest)}
    <text x="400" y="190" font-family="${SERIF}" font-size="82" font-weight="700" fill="${C.forest}">Özsaye Psikoloji</text>
    <text x="403" y="250" font-family="${SANS}" font-size="34" letter-spacing="8" fill="${C.sageDark}">PSİKOLOJİK DANIŞMANLIK &amp; TERAPİ</text>
    <text x="405" y="312" font-family="${SERIF}" font-style="italic" font-size="34" fill="${C.forestLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
  `);

  // 6) LinkedIn — paylaşım görseli (1200x627)
  await render("linkedin-post.png", 1200, 627, `
    <rect width="1200" height="627" fill="${C.forest}"/>
    <rect x="24" y="24" width="1152" height="579" rx="18" fill="none" stroke="${C.cream}" stroke-opacity="0.2" stroke-width="2"/>
    ${emblemAt(80, 200, 230, C.cream)}
    <text x="360" y="270" font-family="${SERIF}" font-size="74" font-weight="700" fill="${C.cream}">Özsaye Psikoloji</text>
    <text x="362" y="330" font-family="${SERIF}" font-style="italic" font-size="36" fill="${C.sageLight}">${esc("“Güvenli Bir Bölgede Kendi Özüne Doğru”")}</text>
    <line x1="362" y1="370" x2="500" y2="370" stroke="${C.sage}" stroke-width="3"/>
    <text x="360" y="430" font-family="${SANS}" font-size="30" fill="${C.cream}" fill-opacity="0.8">Psk. Dan. Melek Yıldız  ·  Kl. Psk. Sacide Şahin</text>
  `);

  console.log("Üretildi:", fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).join(", "));
})();
