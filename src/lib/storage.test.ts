import { afterAll, beforeAll, expect, test } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { saveImage } from "./storage";

// Dosya-paralelliği kapalı (vitest.config: fileParallelism:false) → env mutasyonu güvenli.
const prevToken = process.env.BLOB_READ_WRITE_TOKEN;
let writtenDiskPath: string | null = null;

beforeAll(() => {
  // Dev (disk) yolunu garanti et: Blob token'ı yoksa .uploads'a yazılmalı.
  delete process.env.BLOB_READ_WRITE_TOKEN;
});

afterAll(async () => {
  if (writtenDiskPath) await fs.rm(writtenDiskPath, { force: true });
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
  writtenDiskPath = path.join(
    process.cwd(),
    ".uploads",
    url.replace(/^\/uploads\//, ""),
  );
  const onDisk = await fs.readFile(writtenDiskPath, "utf8");
  expect(onDisk).toBe("x");
});
