import { beforeEach, expect, test, vi } from "vitest";

/**
 * profilKaydet AKIŞ testleri — auth/DB/Next katmanları mock'lanır (gerçek
 * modüller `server-only`/DB import eder ve düz Vitest'te fırlatır; mock sayesinde
 * hiç yüklenmez). zod şeması (action içinde) ve `@/lib/ekip` saf yardımcıları
 * (`profiliDuzenleyebilir`, `satirlardanListe`) GERÇEK bırakılır.
 *
 * Odak: güvenlik hassas alanlar — yetki kuralı (admin her profili, therapist
 * yalnız kendi slug'ı), boş skalarların null'a düşmesi, `imageUrl`'in bu
 * action'da yönetilmeyip mevcut satırdan KORUNMASI ve kayıttan sonra 3 kamu
 * yüzeyinin doğru sırayla tazelenmesi.
 */

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/auth/dal", () => ({
  verifySession: vi.fn(async () => ({ email: "melek@x.com" })),
}));

vi.mock("@/lib/auth/staff", () => ({
  getStaffByEmail: vi.fn(),
}));

vi.mock("@/lib/profil-db", () => ({
  getProfilIcerik: vi.fn(),
  upsertProfilIcerik: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { getStaffByEmail } from "@/lib/auth/staff";
import { getProfilIcerik, upsertProfilIcerik } from "@/lib/profil-db";
import type { ProfilIcerik } from "@/lib/ekip";
import { profilKaydet, profilFotoAyarla } from "./actions";

const staff = vi.mocked(getStaffByEmail);
const oku = vi.mocked(getProfilIcerik);
const kaydet = vi.mocked(upsertProfilIcerik);
const tazele = vi.mocked(revalidatePath);

// Kendi slug'ına sahip terapist (yalnız melek-yildiz'ı düzenleyebilir).
const MELEK = {
  id: "s1",
  email: "melek@x.com",
  name: "Melek",
  role: "therapist" as const,
  expertSlug: "melek-yildiz",
};

// Admin: expertSlug null ama her profili düzenleyebilir.
const ADMIN = {
  id: "s0",
  email: "admin@x.com",
  name: "Yönetici",
  role: "admin" as const,
  expertSlug: null,
};

// Tüm içerik alanı null olan boş satır — `imageUrl` testlerinde override edilir.
function bosIcerik(over: Partial<ProfilIcerik> = {}): ProfilIcerik {
  return {
    bio: null,
    credentialsLine: null,
    university: null,
    membership: null,
    degrees: null,
    certifications: null,
    areas: null,
    sameAs: null,
    imageUrl: null,
    ...over,
  };
}

// Varsayılan geçerli form (tüm alanlar boş, slug melek-yildiz). Override edilebilir.
function fd(over: Record<string, string> = {}): FormData {
  const f = new FormData();
  f.set("slug", "melek-yildiz");
  f.set("bio", "");
  f.set("credentialsLine", "");
  f.set("university", "");
  f.set("membership", "");
  f.set("degrees", "");
  f.set("certifications", "");
  f.set("areas", "");
  f.set("sameAs", "");
  for (const [k, v] of Object.entries(over)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  staff.mockResolvedValue(MELEK);
  // Varsayılan: henüz içerik yok (ilk kayıt). imageUrl testi bunu override eder.
  oku.mockResolvedValue(null);
  kaydet.mockResolvedValue(undefined);
});

test("(1) yetki reddi: therapist başka uzmanın profilini yazamaz", async () => {
  staff.mockResolvedValue(MELEK); // expertSlug: melek-yildiz

  const sonuc = await profilKaydet({}, fd({ slug: "sacide-sahin" }));

  expect(sonuc).toEqual({ hata: "Bu profili düzenleme yetkiniz yok." });
  expect(kaydet).not.toHaveBeenCalled();
  expect(tazele).not.toHaveBeenCalled();
});

test("(2) kendi profili: bio + 2 satır derece kaydedilir, boş skalarlar null, 3 revalidate", async () => {
  const sonuc = await profilKaydet(
    {},
    fd({
      slug: "melek-yildiz",
      bio: "Merhaba, ben Melek.",
      degrees: "Lisans: X Üniversitesi\nYüksek Lisans: Y Üniversitesi",
    }),
  );

  expect(sonuc).toEqual({ ok: true });
  expect(kaydet).toHaveBeenCalledTimes(1);
  expect(kaydet).toHaveBeenCalledWith("melek-yildiz", {
    bio: "Merhaba, ben Melek.",
    credentialsLine: null,
    university: null,
    membership: null,
    degrees: ["Lisans: X Üniversitesi", "Yüksek Lisans: Y Üniversitesi"],
    certifications: null,
    areas: null,
    sameAs: null,
    imageUrl: null,
  });
  // Kayıttan sonra tam 3 kamu yüzeyi, DOĞRU sırayla tazelenir.
  expect(tazele).toHaveBeenCalledTimes(3);
  expect(tazele).toHaveBeenNthCalledWith(1, "/ekip");
  expect(tazele).toHaveBeenNthCalledWith(2, "/ekip/melek-yildiz");
  expect(tazele).toHaveBeenNthCalledWith(3, "/");
});

test("(3) admin: başka uzmanın (sacide-sahin) profilini yazabilir", async () => {
  staff.mockResolvedValue(ADMIN);

  const sonuc = await profilKaydet(
    {},
    fd({ slug: "sacide-sahin", bio: "Sacide biyografisi" }),
  );

  expect(sonuc).toEqual({ ok: true });
  expect(kaydet).toHaveBeenCalledTimes(1);
  expect(kaydet).toHaveBeenCalledWith(
    "sacide-sahin",
    expect.objectContaining({ bio: "Sacide biyografisi" }),
  );
});

test("(4a) imageUrl korunur: mevcut satırın imageUrl'i upsert'e taşınır", async () => {
  oku.mockResolvedValue(bosIcerik({ imageUrl: "https://blob/x.png" }));

  const sonuc = await profilKaydet(
    {},
    fd({ slug: "melek-yildiz", bio: "yeni bio" }),
  );

  expect(sonuc).toEqual({ ok: true });
  expect(kaydet).toHaveBeenCalledWith(
    "melek-yildiz",
    expect.objectContaining({ imageUrl: "https://blob/x.png" }),
  );
});

test("(4b) ilk kayıt (mevcut satır yok): imageUrl null", async () => {
  oku.mockResolvedValue(null);

  const sonuc = await profilKaydet(
    {},
    fd({ slug: "melek-yildiz", bio: "ilk bio" }),
  );

  expect(sonuc).toEqual({ ok: true });
  expect(kaydet).toHaveBeenCalledWith(
    "melek-yildiz",
    expect.objectContaining({ imageUrl: null }),
  );
});

test("(5) geçersiz slug: zod hatası döner (Türkçe), upsert ve revalidate YOK", async () => {
  const sonuc = await profilKaydet({}, fd({ slug: "olmayan" }));

  expect(sonuc.hata).toBe("Geçersiz uzman.");
  expect(sonuc.ok).toBeUndefined();
  expect(kaydet).not.toHaveBeenCalled();
  expect(tazele).not.toHaveBeenCalled();
});

/**
 * profilFotoAyarla AKIŞ testleri — yalnız `imageUrl`'i yöneten dar action.
 * Ana içerik alanlarına DOKUNMAZ: mevcut satır olduğu gibi taşınır, sadece
 * imageUrl değişir. Odak: yetki, url ayarlama (diğer alanlar korunur), kaldırma
 * (boş url → null) ve 3 kamu yüzeyinin tazelenmesi.
 */

// Foto formu: yalnız slug + url okunur.
function fdFoto(slug: string, url: string): FormData {
  const f = new FormData();
  f.set("slug", slug);
  f.set("url", url);
  return f;
}

test("(6) foto — yetki reddi: therapist başka uzmanın fotosunu ayarlayamaz", async () => {
  staff.mockResolvedValue(MELEK); // expertSlug: melek-yildiz

  const sonuc = await profilFotoAyarla(
    {},
    fdFoto("sacide-sahin", "/uploads/blog/x.png"),
  );

  expect(sonuc).toEqual({ hata: "Bu profili düzenleme yetkiniz yok." });
  expect(kaydet).not.toHaveBeenCalled();
  expect(tazele).not.toHaveBeenCalled();
});

test("(7) foto ayarla: imageUrl yazılır, diğer alanlar korunur, 3 revalidate", async () => {
  // Mevcut satırda bio var — foto ayarlanınca DEĞİŞMEDEN taşınmalı.
  oku.mockResolvedValue(bosIcerik({ bio: "Mevcut biyografi" }));

  const sonuc = await profilFotoAyarla(
    {},
    fdFoto("melek-yildiz", "/uploads/blog/portre.png"),
  );

  expect(sonuc).toEqual({ ok: true });
  expect(kaydet).toHaveBeenCalledTimes(1);
  expect(kaydet).toHaveBeenCalledWith("melek-yildiz", {
    bio: "Mevcut biyografi",
    credentialsLine: null,
    university: null,
    membership: null,
    degrees: null,
    certifications: null,
    areas: null,
    sameAs: null,
    imageUrl: "/uploads/blog/portre.png",
  });
  expect(tazele).toHaveBeenCalledTimes(3);
  expect(tazele).toHaveBeenNthCalledWith(1, "/ekip");
  expect(tazele).toHaveBeenNthCalledWith(2, "/ekip/melek-yildiz");
  expect(tazele).toHaveBeenNthCalledWith(3, "/");
});

test("(9) foto — dış URL reddi: yükleme sistemi dışı adres Türkçe hata, upsert/revalidate YOK", async () => {
  // Kendi slug'ına yetkili terapist bile olsa, url doğrulaması yetki
  // kontrolünden ÖNCE çalışır → keyfi dış URL upsert'e ulaşamaz.
  const sonuc = await profilFotoAyarla(
    {},
    fdFoto("melek-yildiz", "https://evil.com/x.png"),
  );

  expect(sonuc).toEqual({
    hata: "Fotoğraf adresi yükleme sisteminden gelmelidir.",
  });
  expect(kaydet).not.toHaveBeenCalled();
  expect(tazele).not.toHaveBeenCalled();
});

test("(8) foto kaldır: boş url → imageUrl null, diğer alanlar korunur", async () => {
  oku.mockResolvedValue(
    bosIcerik({ bio: "Mevcut biyografi", imageUrl: "/uploads/blog/eski.png" }),
  );

  const sonuc = await profilFotoAyarla({}, fdFoto("melek-yildiz", ""));

  expect(sonuc).toEqual({ ok: true });
  expect(kaydet).toHaveBeenCalledWith("melek-yildiz", {
    bio: "Mevcut biyografi",
    credentialsLine: null,
    university: null,
    membership: null,
    degrees: null,
    certifications: null,
    areas: null,
    sameAs: null,
    imageUrl: null,
  });
  expect(tazele).toHaveBeenCalledTimes(3);
});
