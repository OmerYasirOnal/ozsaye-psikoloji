// Öz & Saye Psikoloji — profesyonel Instagram seti
// Çalıştırma: node scripts/generate-instagram.cjs
// Tüm metin marka fontlarıyla (Cormorant Garamond + Nunito) vektör yola
// çevrilir; çıktı net ve tutarlıdır. Bkz. scripts/lib/brand.cjs ön koşulları.
const fs = require("fs");
const path = require("path");
const { C, fonts, textPath, trackedPath, place, emblemAt, inkPalettes, renderPNG } =
  require("./lib/brand.cjs");

const OUT = path.join(__dirname, "..", "brand", "social", "instagram");
fs.mkdirSync(OUT, { recursive: true });

const TAGLINE = "Güvenli Bir Bölgede Kendi Özüne Doğru";
const HANDLE = "@ozsayepsikoloji";
const SITE = "ozsayepsikoloji.com";

// Kısayollar
const t = (font, s, size) => textPath(font, s, size);
const tr = (font, s, size, track) => trackedPath(font, s, size, track);
const line = (x1, y1, x2, y2, color, w = 3) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}"/>`;

async function make(name, w, h, bg, inner) {
  await renderPNG(inner, w, h, path.join(OUT, `${name}.png`), { bg });
  return { name, w, h };
}

(async () => {
  const made = [];

  // 1) Profil görseli — sade amblem, koyu zemin
  made.push(await make("profil", 1080, 1080, C.forest,
    emblemAt(inkPalettes.reversed, (1080 - 760) / 2, (1080 - 760) / 2, 760)));

  // 2) Tanıtım gönderisi — açık zemin, tam kilit (lockup)
  {
    const cx = 540;
    const inner =
      `<rect x="44" y="44" width="992" height="992" rx="30" fill="none" stroke="${C.forest}" stroke-opacity="0.16" stroke-width="2"/>` +
      emblemAt(inkPalettes.color, cx - 115, 120, 230) +
      place(t(fonts.serif, "Öz & Saye", 118), C.forest, cx, 400) +
      place(tr(fonts.sans, "PSİKOLOJİ", 32, 14), C.sageDark, cx, 540) +
      line(cx - 70, 605, cx + 70, 605, C.sage, 3) +
      place(t(fonts.italic, "“" + TAGLINE + "”", 40), C.forestLight, cx, 650) +
      place(t(fonts.sans, "Online & Yüz Yüze Terapi", 32), C.forest, cx, 800, { opacity: 0.78 }) +
      place(tr(fonts.sans, HANDLE, 30, 2), C.sageDark, cx, 985);
    made.push(await make("tanitim", 1080, 1080, C.cream, inner));
  }

  // 3) Alıntı / slogan — koyu zemin
  {
    const cx = 540;
    const inner =
      `<rect x="44" y="44" width="992" height="992" rx="30" fill="none" stroke="${C.cream}" stroke-opacity="0.18" stroke-width="2"/>` +
      emblemAt(inkPalettes.reversed, cx - 75, 120, 150) +
      place(t(fonts.italic, "“Güvenli Bir Bölgede", 78), C.cream, cx, 430) +
      place(t(fonts.italic, "Kendi Özüne Doğru.”", 78), C.cream, cx, 540) +
      line(cx - 60, 690, cx + 60, 690, C.sage, 3) +
      place(t(fonts.sans, "Kendine iyi gelmek bir lüks değil, ihtiyaçtır.", 30), C.sageLight, cx, 745) +
      place(tr(fonts.sans, HANDLE, 30, 2), C.sage, cx, 980);
    made.push(await make("alinti", 1080, 1080, C.forest, inner));
  }

  // 4) Hizmetler — açık zemin, başlık bandı
  {
    const cx = 540;
    const services = ["Bireysel Psikoterapi", "Çift Terapisi", "Aile Danışmanlığı", "Çocuk & Ergen Terapisi", "Travma Terapisi"];
    let rows = "";
    services.forEach((s, i) => {
      const y = 520 + i * 96;
      rows += `<circle cx="305" cy="${y + 16}" r="8" fill="${C.sage}"/>` +
        place(t(fonts.sans, s, 44), C.forest, 345, y, { align: "left" });
    });
    const inner =
      `<rect width="1080" height="300" fill="${C.cream}"/>` +
      emblemAt(inkPalettes.color, cx - 75, 70, 150) +
      place(t(fonts.serif, "Hizmetlerimiz", 72), C.forest, cx, 360) +
      rows +
      place(tr(fonts.sans, SITE + "  ·  " + HANDLE, 26, 1), C.sageDark, cx, 1010);
    made.push(await make("hizmetler", 1080, 1080, C.warmWhite, inner));
  }

  // 5) Uzman tanıtım kartları (fotoğraf için yer tutuculu)
  const experts = [
    { name: "Melek Yıldız", title: "Psikolojik Danışman", ini: "MY", file: "uzman-melek-yildiz" },
    { name: "Sacide Şahin", title: "Klinik Psikolog", ini: "SŞ", file: "uzman-sacide-sahin" },
  ];
  for (const e of experts) {
    const cx = 540;
    const inner =
      `<rect x="44" y="44" width="992" height="1262" rx="30" fill="none" stroke="${C.forest}" stroke-opacity="0.16" stroke-width="2"/>` +
      emblemAt(inkPalettes.color, cx - 48, 86, 96) +
      place(tr(fonts.sans, "ÖZ & SAYE PSİKOLOJİ", 24, 6), C.sageDark, cx, 210) +
      `<circle cx="${cx}" cy="600" r="220" fill="${C.warmWhite}" stroke="${C.sage}" stroke-width="6"/>` +
      place(t(fonts.serif, e.ini, 200), C.sage, cx, 510, { opacity: 0.5 }) +
      place(t(fonts.serif, e.name, 78), C.forest, cx, 940) +
      place(t(fonts.sans, e.title, 38), C.forestLight, cx, 1055) +
      line(cx - 70, 1130, cx + 70, 1130, C.sage, 3) +
      place(t(fonts.italic, "“Güvenli bir bölgede kendi özüne doğru.”", 34), C.sageDark, cx, 1180);
    made.push(await make(e.file, 1080, 1350, C.cream, inner));
  }

  // 6) Story (1080x1920)
  {
    const cx = 540;
    const inner =
      `<rect width="1080" height="680" fill="${C.forest}"/>` +
      emblemAt(inkPalettes.reversed, cx - 150, 150, 300) +
      place(t(fonts.serif, "Öz & Saye", 92), C.cream, cx, 500) +
      place(tr(fonts.sans, "PSİKOLOJİ", 28, 12), C.sageLight, cx, 600) +
      place(t(fonts.italic, "“Güvenli Bir Bölgede", 54), C.forest, cx, 900) +
      place(t(fonts.italic, "Kendi Özüne Doğru.”", 54), C.forest, cx, 985) +
      line(cx - 70, 1110, cx + 70, 1110, C.sage, 3) +
      place(t(fonts.sans, "Online & Yüz Yüze Terapi", 38), C.forest, cx, 1180, { opacity: 0.78 }) +
      place(tr(fonts.sans, HANDLE, 32, 2), C.sageDark, cx, 1740);
    made.push(await make("story", 1080, 1920, C.cream, inner));
  }

  // Önizleme tablosu (1080'lik kareler + 1350/1920 oranlı)
  console.log("brand/social/instagram/:", made.map((m) => `${m.name}.png`).join(", "));
})();
