// Öz & Saye Psikoloji — modern logo konsept denemeleri (seçim için)
// Çalıştırma: node scripts/generate-logo-concepts.cjs
// brand/logo/konseptler/ altına 3 konsept + karşılaştırma tablosu üretir.
const fs = require("fs");
const path = require("path");
const { C, fonts, textPath, trackedPath, place } = require("./lib/brand.cjs");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "brand", "logo", "konseptler");
fs.mkdirSync(OUT, { recursive: true });

// Dikey yaprak (tip yukarı): base (0,0) -> tip (0,-h)
function leaf(cx, cy, rot, scale, fill, opacity = 1) {
  const op = opacity !== 1 ? ` fill-opacity="${opacity}"` : "";
  return `<path d="M0 0 C-13 -9 -13 -33 0 -46 C13 -33 13 -9 0 0 Z" fill="${fill}"${op}
    transform="translate(${cx} ${cy}) rotate(${rot}) scale(${scale})"/>`;
}
// Yaprak orta damarı (ince çizgi)
function vein(cx, cy, rot, scale, stroke) {
  return `<path d="M0 -2 L0 -40" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" opacity="0.4"
    transform="translate(${cx} ${cy}) rotate(${rot}) scale(${scale})"/>`;
}

// ---- KONSEPT A: Monoline filiz, ince çember (çok sade, ferah) ----
// İki yaprak + yükselen sap + tomurcuk. Tek ana renk + tek sage aksan.
function conceptA(ink, leafColor, accent) {
  return `
    <circle cx="100" cy="100" r="86" stroke="${ink}" stroke-width="3.5" fill="none"/>
    <path d="M100 152 C100 128 100 116 100 84" stroke="${ink}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${leaf(100, 120, -34, 1.05, accent)}
    ${leaf(100, 108, 32, 1.25, leafColor)}
    <circle cx="100" cy="80" r="7" fill="${ink}"/>`;
}

// ---- KONSEPT B: Figür + kanat yapraklar, çembersiz (modern, sıcak) ----
// Sade insan figürü (baş + ince gövde) iki yaprak kanat arasında yükselir.
function conceptB(ink, leafA, leafB) {
  return `
    ${leaf(86, 116, -28, 1.5, leafA)}
    ${leaf(114, 116, 28, 1.5, leafB)}
    <circle cx="100" cy="78" r="11" fill="${ink}"/>
    <path d="M100 92 C92 104 92 132 100 150 C108 132 108 104 100 92 Z" fill="${ink}"/>
    <path d="M99 100 C88 96 80 90 78 82" stroke="${ink}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M101 100 C112 96 120 90 122 82" stroke="${ink}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
}

// ---- KONSEPT C: İki yaprak kalp/lotus, simetrik (sakin, güven veren) ----
// Birbirine doğru kıvrılan iki yaprak; ortada küçük filiz. Yumuşak çember.
function conceptC(ink, leafA, leafB, accent) {
  return `
    <circle cx="100" cy="100" r="86" fill="${accent}" fill-opacity="0.12"/>
    ${leaf(100, 128, -40, 1.55, leafA)}
    ${leaf(100, 128, 40, 1.55, leafB)}
    ${vein(100, 128, -40, 1.55, ink)}
    ${vein(100, 128, 40, 1.55, ink)}
    <path d="M100 134 C94 122 94 104 100 92 C106 104 106 122 100 134 Z" fill="${ink}"/>
    <circle cx="100" cy="86" r="6.5" fill="${ink}"/>`;
}

const concepts = [
  { id: "A", name: "Monoline Filiz", light: (i) => conceptA(C.forest, C.sage, C.sageDark), dark: () => conceptA(C.cream, C.sage, C.sageLight) },
  { id: "B", name: "Figür + Kanat", light: () => conceptB(C.forest, C.sage, C.sageDark), dark: () => conceptB(C.cream, C.sage, C.sageDark) },
  { id: "C", name: "Yaprak Kalp", light: () => conceptC(C.forest, C.sage, C.sageDark, C.sage), dark: () => conceptC(C.cream, C.sage, C.sageDark, C.cream) },
];

// markı 200x200 viewBox'tan verilen kutuya yerleştir
const markAt = (svg, x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 200})">${svg}</g>`;

async function writePNG(inner, w, h, file, bg) {
  const rect = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : "";
  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${rect}${inner}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, file));
}

(async () => {
  // Her konsept için: tek başına mark (saydam) + cream avatar + forest avatar
  for (const c of concepts) {
    await writePNG(markAt(c.light(), 60, 60, 400), 520, 520, `konsept-${c.id}-mark.png`);
  }

  // Karşılaştırma tablosu
  const COL = 520, ROWH = 560, W = COL * 3, H = 760;
  let panels = "";
  concepts.forEach((c, i) => {
    const x = i * COL;
    const cxc = x + COL / 2;
    // başlık
    const title = textPath(fonts.serif, `Konsept ${c.id}`, 52);
    const sub = trackedPath(fonts.sans, c.name.toUpperCase(), 22, 4);
    // avatarlar: cream daire + forest daire
    const r = 150;
    panels += `
      ${place(title, C.forest, cxc, 60)}
      ${place(sub, C.sageDark, cxc, 130)}
      <circle cx="${x + COL / 2 - 135}" cy="380" r="${r}" fill="${C.cream}" stroke="${C.forest}" stroke-opacity="0.15"/>
      ${markAt(c.light(), x + COL / 2 - 135 - 120, 260, 240)}
      <circle cx="${x + COL / 2 + 135}" cy="380" r="${r}" fill="${C.forest}"/>
      ${markAt(c.dark(), x + COL / 2 + 135 - 120, 260, 240)}
      ${place(trackedPath(fonts.sans, "açık zemin           koyu zemin", 18, 1), C.forest, cxc, 560, { opacity: 0.55 })}
      ${place(textPath(fonts.serif, "Öz & Saye", 40), C.forest, cxc, 620)}
      ${place(trackedPath(fonts.sans, "PSİKOLOJİ", 16, 8), C.sageDark, cxc, 678)}
    `;
    if (i < 2) panels += `<line x1="${x + COL}" y1="40" x2="${x + COL}" y2="${H - 40}" stroke="${C.forest}" stroke-opacity="0.1" stroke-width="2"/>`;
  });
  const overview = `<rect width="${W}" height="${H}" fill="${C.warmWhite}"/>${panels}`;
  await writePNG(overview, W, H, "konsept-karsilastirma.png", null);

  console.log("Üretildi:", fs.readdirSync(OUT).join(", "));
})();
