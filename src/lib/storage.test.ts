import { afterAll, beforeAll, expect, test } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { saveImage, sniffImageType } from "./storage";

// Dosya-paralelliği kapalı (vitest.config: fileParallelism:false) → env mutasyonu güvenli.
const prevToken = process.env.BLOB_READ_WRITE_TOKEN;
const written: string[] = [];

// Kök-göreli /uploads url'ini diskteki (.uploads) mutlak yola çevir.
function diskPathFor(url: string): string {
  return path.join(process.cwd(), ".uploads", url.replace(/^\/uploads\//, ""));
}

beforeAll(() => {
  // Dev (disk) yolunu garanti et: Blob token'ı yoksa .uploads'a yazılmalı.
  delete process.env.BLOB_READ_WRITE_TOKEN;
});

afterAll(async () => {
  await Promise.all(written.map((p) => fs.rm(p, { force: true })));
  if (prevToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = prevToken;
});

test("dev: Blob token yokken .uploads/blog'a yazar; TR-temiz kök-göreli url döner", async () => {
  const { url } = await saveImage(
    Buffer.from("x"),
    "Çiğ Köfte Fotoğrafı.PNG",
    "image/png",
  );

  // Kök-göreli /uploads/blog/ url'i; uzantı küçük harf .png; TR karakter içermez.
  expect(url.startsWith("/uploads/blog/")).toBe(true);
  expect(url.endsWith(".png")).toBe(true);
  expect(url).not.toMatch(/[çÇğĞıIİöÖşŞüÜ]/);

  // Dönen url'nin diskteki (.uploads) karşılığı gerçekten var ve içeriği "x".
  const onDiskPath = diskPathFor(url);
  written.push(onDiskPath);
  const onDisk = await fs.readFile(onDiskPath, "utf8");
  expect(onDisk).toBe("x");
});

test("dev: uzantısız ad + image/png → uzantı contentType'tan türetilir (.png, .bin değil)", async () => {
  // Görsel MIME ile doğrulanır (upload endpoint). Ad uzantısız ("fotoğraf")
  // olsa bile dosya .png olarak saklanmalı — aksi halde .bin olur ve dev-serve
  // route (uzantı allowlist'i) onu servis edemez (servis edilemeyen upload).
  const { url } = await saveImage(Buffer.from("y"), "fotoğraf", "image/png");

  expect(url.startsWith("/uploads/blog/")).toBe(true);
  expect(url.endsWith(".png")).toBe(true);
  expect(url.endsWith(".bin")).toBe(false);

  const onDiskPath = diskPathFor(url);
  written.push(onDiskPath);
  const onDisk = await fs.readFile(onDiskPath, "utf8");
  expect(onDisk).toBe("y");
});

// sniffImageType: dosya-imzasından (magic bytes) içerik tipini doğrular. İstemci
// beyanına (dosya.type) güvenmeden gerçek türü belirler — spoofing kapatılır.
test("sniffImageType: geçerli PNG imzası → image/png", () => {
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  expect(sniffImageType(png)).toBe("image/png");
});

test("sniffImageType: geçerli JPEG imzası → image/jpeg", () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  expect(sniffImageType(jpeg)).toBe("image/jpeg");
});

test("sniffImageType: geçerli WebP (RIFF....WEBP) → image/webp", () => {
  const webp = Buffer.concat([
    Buffer.from("RIFF", "latin1"),
    Buffer.from([0x1a, 0x00, 0x00, 0x00]), // dosya boyutu alanı (herhangi)
    Buffer.from("WEBP", "latin1"),
    Buffer.from("VP8 ", "latin1"),
  ]);
  expect(sniffImageType(webp)).toBe("image/webp");
});

test("sniffImageType: RIFF ama WEBP değil (ör. WAV) → null", () => {
  const wav = Buffer.concat([
    Buffer.from("RIFF", "latin1"),
    Buffer.from([0x1a, 0x00, 0x00, 0x00]),
    Buffer.from("WAVE", "latin1"),
  ]);
  expect(sniffImageType(wav)).toBeNull();
});

test("sniffImageType: tanımsız/çöp baytlar → null", () => {
  const garbage = Buffer.from([
    0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
  ]); // "hello world!"
  expect(sniffImageType(garbage)).toBeNull();
});

test("sniffImageType: çok kısa buffer → null", () => {
  expect(sniffImageType(Buffer.from([0x89, 0x50]))).toBeNull();
  expect(sniffImageType(Buffer.alloc(0))).toBeNull();
});
