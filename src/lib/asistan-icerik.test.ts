import { describe, expect, test } from "vitest";
import { asistanIcerigi } from "./asistan-icerik";

describe("asistanIcerigi", () => {
  test("hizmet başlıklarını içerir", () => {
    const metin = asistanIcerigi();
    expect(metin).toContain("Bireysel Psikoterapi");
  });

  test("uzman adlarını içerir", () => {
    const metin = asistanIcerigi();
    expect(metin).toContain("Melek Yıldız");
    expect(metin).toContain("Sacide Şahin");
  });

  test("SSS sorularını içerir", () => {
    const metin = asistanIcerigi();
    expect(metin).toContain("S:");
    expect(metin).toContain("C:");
  });

  test("klinik adını içerir", () => {
    const metin = asistanIcerigi();
    expect(metin).toContain("Öz & Saye");
  });

  test("placeholder ([DOLDUR]) alanı sızdırmaz", () => {
    const metin = asistanIcerigi();
    expect(metin).not.toContain("[DOLDUR]");
  });
});
