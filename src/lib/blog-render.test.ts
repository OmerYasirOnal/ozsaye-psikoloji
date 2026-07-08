import { expect, test } from "vitest";
import { renderMarkdown } from "@/lib/blog";

// renderMarkdown saf bir fonksiyondur (marked + sanitize-html); DB'ye
// dokunmaz. @/lib/blog @/lib/db'yi içe aktarsa da postgres.js tembel bağlanır
// (sorgu koşmadıkça soket açılmaz), bu yüzden bu test bağlantı açmaz.
test("renderMarkdown: script strip edilir, http(s) + kök-göreli görseller korunur", () => {
  const md = [
    "# Başlık",
    "",
    "Merhaba **dünya**.",
    "",
    "![kök-göreli](/uploads/blog/a.png)",
    "",
    "![uzak](https://example.com/b.png)",
    "",
    "<script>alert(1)</script>",
  ].join("\n");

  const html = renderMarkdown(md);

  // XSS: script etiketi VE içeriği tamamen kaldırılır (nonTextTags).
  expect(html).not.toContain("<script");
  expect(html).not.toContain("alert(1)");

  // Kök-göreli yükleme görseli (/uploads/...) korunur.
  expect(html).toContain('src="/uploads/blog/a.png"');
  // Uzak https görseli korunur.
  expect(html).toContain('src="https://example.com/b.png"');

  // Güvenli biçimlendirme korunur.
  expect(html).toContain("<strong>dünya</strong>");
});

test("renderMarkdown: protokol-göreli görsel src'i strip edilir (allowProtocolRelative:false)", () => {
  // `//host/...` protokol-göreli src, allowProtocolRelative:false ile reddedilir.
  // Gözlem (deneysel): sanitize-html <img> etiketini korur ama src'yi tümüyle
  // düşürür (`<img alt="x" />`), böylece host çıktıya sızmaz. Bu regresyon
  // koruması o davranışı kilitler.
  const html = renderMarkdown("![x](//evil.example/x.png)");

  // Kötü niyetli host hiçbir biçimde çıktıya sızmaz.
  expect(html).not.toContain("evil.example");
  // Protokol-göreli hiçbir src hayatta kalmaz.
  expect(html).not.toMatch(/src=["']\/\//);
});
