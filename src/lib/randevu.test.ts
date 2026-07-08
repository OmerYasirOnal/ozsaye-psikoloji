import { describe, expect, test } from "vitest";
import { UZMAN_SECENEKLERI, randevuSchema } from "./randevu";

// Bu şema, statik-hosting dönemindeki `public/randevu.php` doğrulayıcısının
// birebir aynasıdır. Hata metinleri üretimde kullanıcıya-görünür Türkçe
// kopyadır (byte-byte eşleşmeli); kurallar: ad ≥2, telefon regex, geçerli
// e-posta, uzman ∈ enum, mesaj ≤2000, KVKK zorunlu.

// Tümü geçerli bir taban girdi; her test yalnız ilgili alanı geçersiz kılar,
// böylece `issues[0]` deterministik olarak o alanın hatasını verir.
function gecerliGirdi(): Record<string, unknown> {
  return {
    ad: "Ayşe Yılmaz",
    telefon: "0555 123 45 67",
    email: "ayse@example.com",
    uzman: "melek-yildiz",
    tarih: "",
    mesaj: "Merhaba, randevu almak istiyorum.",
    kvkk: "on",
  };
}

// Tek geçersiz alanlı girdide ilk (tek) hata mesajı.
function ilkHata(input: Record<string, unknown>): string | undefined {
  const sonuc = randevuSchema.safeParse(input);
  return sonuc.success ? undefined : sonuc.error.issues[0]?.message;
}

describe("UZMAN_SECENEKLERI", () => {
  test("PHP $uzmanLabels ile birebir", () => {
    expect(UZMAN_SECENEKLERI).toEqual({
      "melek-yildiz": "Psk. Dan. Melek Yıldız",
      "sacide-sahin": "Kl. Psk. Sacide Şahin",
      farketmez: "Farketmez",
    });
  });
});

describe("randevuSchema — geçerli girdi", () => {
  test("tam geçerli girdi parse olur; kvkk 'on' geçer", () => {
    const sonuc = randevuSchema.safeParse(gecerliGirdi());
    expect(sonuc.success).toBe(true);
    if (sonuc.success) {
      expect(sonuc.data.kvkk).toBe("on");
      expect(sonuc.data.uzman).toBe("melek-yildiz");
      expect(sonuc.data.email).toBe("ayse@example.com");
    }
  });

  test("ad baştaki/sondaki boşluklardan kırpılır", () => {
    const sonuc = randevuSchema.safeParse({ ...gecerliGirdi(), ad: "  Ayşe  " });
    expect(sonuc.success).toBe(true);
    if (sonuc.success) expect(sonuc.data.ad).toBe("Ayşe");
  });

  test("üç uzman seçeneğinin tümü kabul edilir", () => {
    for (const uzman of ["melek-yildiz", "sacide-sahin", "farketmez"]) {
      expect(
        randevuSchema.safeParse({ ...gecerliGirdi(), uzman }).success,
      ).toBe(true);
    }
  });
});

describe("randevuSchema — ad", () => {
  test("tek karakter reddedilir: 'Lütfen adınızı girin.'", () => {
    expect(ilkHata({ ...gecerliGirdi(), ad: "A" })).toBe(
      "Lütfen adınızı girin.",
    );
  });

  test("boş ad reddedilir: 'Lütfen adınızı girin.'", () => {
    expect(ilkHata({ ...gecerliGirdi(), ad: "" })).toBe(
      "Lütfen adınızı girin.",
    );
  });
});

describe("randevuSchema — telefon (regex ^[0-9\\s\\-+()]{10,20}$)", () => {
  test("'0555 123 45 67' geçerli", () => {
    expect(randevuSchema.safeParse(gecerliGirdi()).success).toBe(true);
  });

  test("10 haneli (alt sınır) geçerli", () => {
    expect(
      randevuSchema.safeParse({ ...gecerliGirdi(), telefon: "1234567890" })
        .success,
    ).toBe(true);
  });

  test("20 karakter (üst sınır) geçerli", () => {
    expect(
      randevuSchema.safeParse({
        ...gecerliGirdi(),
        telefon: "12345678901234567890",
      }).success,
    ).toBe(true);
  });

  test("'abc' reddedilir", () => {
    expect(ilkHata({ ...gecerliGirdi(), telefon: "abc" })).toBe(
      "Lütfen geçerli bir telefon numarası girin.",
    );
  });

  test("9 haneli reddedilir (min 10)", () => {
    expect(ilkHata({ ...gecerliGirdi(), telefon: "123456789" })).toBe(
      "Lütfen geçerli bir telefon numarası girin.",
    );
  });

  test("21 karakter reddedilir (max 20)", () => {
    expect(
      ilkHata({ ...gecerliGirdi(), telefon: "123456789012345678901" }),
    ).toBe("Lütfen geçerli bir telefon numarası girin.");
  });
});

describe("randevuSchema — email", () => {
  test("geçersiz e-posta reddedilir", () => {
    expect(ilkHata({ ...gecerliGirdi(), email: "gecersiz" })).toBe(
      "Lütfen geçerli bir e-posta adresi girin.",
    );
  });
});

describe("randevuSchema — uzman", () => {
  test("'baska' (enum dışı) reddedilir: 'Lütfen bir uzman seçin.'", () => {
    expect(ilkHata({ ...gecerliGirdi(), uzman: "baska" })).toBe(
      "Lütfen bir uzman seçin.",
    );
  });
});

describe("randevuSchema — mesaj (trim, max 2000, opsiyonel)", () => {
  test("tam 2000 karakter geçerli", () => {
    expect(
      randevuSchema.safeParse({ ...gecerliGirdi(), mesaj: "a".repeat(2000) })
        .success,
    ).toBe(true);
  });

  test("2001 karakter reddedilir", () => {
    expect(ilkHata({ ...gecerliGirdi(), mesaj: "a".repeat(2001) })).toBe(
      "Mesaj en fazla 2000 karakter olabilir.",
    );
  });

  test("mesaj undefined (gönderilmemiş) geçerli", () => {
    expect(
      randevuSchema.safeParse({ ...gecerliGirdi(), mesaj: undefined }).success,
    ).toBe(true);
  });

  test("mesaj '' (boş) geçerli", () => {
    expect(
      randevuSchema.safeParse({ ...gecerliGirdi(), mesaj: "" }).success,
    ).toBe(true);
  });
});

describe("randevuSchema — tarih (opsiyonel, serbest metin)", () => {
  test("tarih '' geçerli", () => {
    expect(
      randevuSchema.safeParse({ ...gecerliGirdi(), tarih: "" }).success,
    ).toBe(true);
  });

  test("tarih dolu geçerli", () => {
    expect(
      randevuSchema.safeParse({ ...gecerliGirdi(), tarih: "2026-07-15" })
        .success,
    ).toBe(true);
  });

  test("tarih undefined geçerli", () => {
    expect(
      randevuSchema.safeParse({ ...gecerliGirdi(), tarih: undefined }).success,
    ).toBe(true);
  });
});

describe("randevuSchema — kvkk (z.literal 'on')", () => {
  test("null (işaretlenmemiş kutu) reddedilir: tam KVKK mesajı", () => {
    expect(ilkHata({ ...gecerliGirdi(), kvkk: null })).toBe(
      "Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir.",
    );
  });

  // İşaretli HTML checkbox yalnız "on" gönderir; PHP eski uçtan "true"yu da kabul
  // ederdi ama yeni form yalnız "on" gönderdiğinden şema bilinçli olarak daraltıldı.
  test("'true' reddedilir (yalnız 'on' kabul)", () => {
    expect(ilkHata({ ...gecerliGirdi(), kvkk: "true" })).toBe(
      "Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir.",
    );
  });
});
