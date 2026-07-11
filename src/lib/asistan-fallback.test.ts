import { describe, expect, test } from "vitest";
import { fallbackCevap } from "./asistan-fallback";

describe("fallbackCevap", () => {
  test("ücret geçen mesajda SSS'e yönlendirir", () => {
    expect(fallbackCevap("Seans ücreti ne kadar?")).toContain("Sıkça Sorulan Sorular");
  });

  test("randevu geçen mesajda randevu formuna yönlendirir", () => {
    expect(fallbackCevap("Randevu almak istiyorum")).toContain("randevu formunu");
  });

  test("hizmet geçen mesajda Hizmetler sayfasına yönlendirir", () => {
    expect(fallbackCevap("Hangi terapi türleri var?")).toContain("Hizmetler sayfasında");
  });

  test("eşleşmeyen mesajda genel cevap döner", () => {
    expect(fallbackCevap("merhaba nasılsın")).toContain("Sıkça Sorulan Sorular");
  });

  test("büyük/küçük harf duyarsız çalışır", () => {
    expect(fallbackCevap("RANDEVU nasıl alırım")).toContain("randevu formunu");
  });
});
