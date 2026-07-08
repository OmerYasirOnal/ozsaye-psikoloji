import { expect, test } from "vitest";
import { slugify } from "./slug";

test("Türkçe karakterleri sadeleştirir", () => {
  expect(slugify("Kaygı ile Başa Çıkmak")).toBe("kaygi-ile-basa-cikmak");
  expect(slugify("ÇİĞDEM'in Öğüdü — %100 İyi!")).toBe("cigdemin-ogudu-100-iyi");
});
test("boşluk/sembol tekrarını tek tireye indirir, uçları kırpar", () => {
  expect(slugify("  a   b  ")).toBe("a-b");
  expect(slugify("--a__b--")).toBe("a-b");
});
test("boş/sembol-yalnız girdi boş döner", () => {
  expect(slugify("!!!")).toBe("");
});
