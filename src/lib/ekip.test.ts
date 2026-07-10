import { expect, test } from "vitest";
import {
  satirlardanListe,
  listedenSatirlar,
  birlesikProfil,
  izinliFotoUrl,
  profiliDuzenleyebilir,
  type ProfilIcerik,
  type ProfilKimligi,
} from "./ekip";

// --- Liste <-> satır çeviricileri (form textarea <-> DB text[]) ---

test("satirlardanListe: satırlara böler, trim'ler, boşları atar", () => {
  expect(satirlardanListe("a\n\n b \nc")).toEqual(["a", "b", "c"]);
});

test("satirlardanListe: boş girdi boş dizi döner", () => {
  expect(satirlardanListe("")).toEqual([]);
});

test("listedenSatirlar: null -> boş metin", () => {
  expect(listedenSatirlar(null)).toBe("");
});

test("listedenSatirlar: dizi -> satır başlarıyla birleşir", () => {
  expect(listedenSatirlar(["a", "b"])).toBe("a\nb");
});

// --- birlesikProfil: kimlik (site.experts) + içerik (expert_profiles) ---

const kimlik: ProfilKimligi = {
  slug: "melek-yildiz",
  name: "Melek Yıldız",
  title: "Psikolojik Danışman",
  shortTitle: "Psk. Dan.",
};

test("birlesikProfil: içerik null ise tüm içerik alanları null, kimlik taşınır", () => {
  const p = birlesikProfil(kimlik, null);
  expect(p.slug).toBe("melek-yildiz");
  expect(p.name).toBe("Melek Yıldız");
  expect(p.title).toBe("Psikolojik Danışman");
  expect(p.shortTitle).toBe("Psk. Dan.");
  expect(p.bio).toBeNull();
  expect(p.credentialsLine).toBeNull();
  expect(p.university).toBeNull();
  expect(p.membership).toBeNull();
  expect(p.degrees).toBeNull();
  expect(p.certifications).toBeNull();
  expect(p.areas).toBeNull();
  expect(p.sameAs).toBeNull();
  expect(p.imageUrl).toBeNull();
});

test("birlesikProfil: içerik dolu ise içerik yansır, kimlik taşınır", () => {
  const icerik: ProfilIcerik = {
    bio: "x",
    credentialsLine: "Psk. Dan. Melek Yıldız",
    university: "Boğaziçi Üniversitesi",
    membership: "TPD üyesi",
    degrees: ["Lisans"],
    certifications: ["BDT"],
    areas: ["Kaygı"],
    sameAs: ["https://ozsaye.com"],
    imageUrl: "/uzmanlar/melek-yildiz.jpg",
  };
  const p = birlesikProfil(kimlik, icerik);
  expect(p.slug).toBe("melek-yildiz");
  expect(p.name).toBe("Melek Yıldız");
  expect(p.bio).toBe("x");
  expect(p.university).toBe("Boğaziçi Üniversitesi");
  expect(p.degrees).toEqual(["Lisans"]);
  expect(p.imageUrl).toBe("/uzmanlar/melek-yildiz.jpg");
});

// --- izinliFotoUrl: yalnız yükleme pipeline'ının ürettiği kaynaklar ---

test("izinliFotoUrl: yerel yükleme yolunu (/uploads/…) kabul eder", () => {
  expect(izinliFotoUrl("/uploads/blog/x.png")).toBe(true);
});

test("izinliFotoUrl: Vercel Blob public host'unu kabul eder", () => {
  expect(
    izinliFotoUrl("https://abc123.public.blob.vercel-storage.com/blog/x.png"),
  ).toBe(true);
});

test("izinliFotoUrl: keyfi dış URL'i reddeder", () => {
  expect(izinliFotoUrl("https://evil.com/x.png")).toBe(false);
});

test("izinliFotoUrl: alt-alan hilesini (host değil path'te blob eki) reddeder", () => {
  expect(
    izinliFotoUrl("https://evil.com/a.public.blob.vercel-storage.com/x.png"),
  ).toBe(false);
});

test("izinliFotoUrl: http (https değil) Blob host'unu reddeder", () => {
  expect(
    izinliFotoUrl("http://abc.public.blob.vercel-storage.com/x"),
  ).toBe(false);
});

test("izinliFotoUrl: javascript: şemasını reddeder", () => {
  expect(izinliFotoUrl("javascript:alert(1)")).toBe(false);
});

// --- profiliDuzenleyebilir: yetki kuralı ---

test("profiliDuzenleyebilir: therapist yalnız kendi slug'ını düzenler", () => {
  const staff = { expertSlug: "melek-yildiz", role: "therapist" as const };
  expect(profiliDuzenleyebilir(staff, "melek-yildiz")).toBe(true);
  expect(profiliDuzenleyebilir(staff, "sacide-sahin")).toBe(false);
});

test("profiliDuzenleyebilir: admin (expertSlug null bile olsa) her slug'ı düzenler", () => {
  const admin = { expertSlug: null, role: "admin" as const };
  expect(profiliDuzenleyebilir(admin, "melek-yildiz")).toBe(true);
  expect(profiliDuzenleyebilir(admin, "sacide-sahin")).toBe(true);
});

test("profiliDuzenleyebilir: expertSlug null therapist hiçbir slug'ı düzenleyemez", () => {
  const staff = { expertSlug: null, role: "therapist" as const };
  expect(profiliDuzenleyebilir(staff, "melek-yildiz")).toBe(false);
});
