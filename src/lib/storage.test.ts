import { afterAll, beforeAll, expect, test } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { saveImage } from "./storage";

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
