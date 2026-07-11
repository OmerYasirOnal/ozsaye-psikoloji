import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { POST } from "./route";

function istek(govde: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/asistan", {
    method: "POST",
    headers: { "x-forwarded-for": ip, "content-type": "application/json" },
    body: JSON.stringify(govde),
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  process.env.AI_ASISTAN_URL = "https://test.ts.net";
  process.env.AI_ASISTAN_SECRET = "gizli-anahtar";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.AI_ASISTAN_URL;
  delete process.env.AI_ASISTAN_SECRET;
});

describe("POST /api/asistan", () => {
  test("geçersiz gövdede kullanıcı-dostu cevap döner", async () => {
    const yanit = await POST(istek({ mesaj: "" }, "1.1.1.1"));
    const veri = await yanit.json();
    expect(veri.cevap).toContain("anlayamadım");
  });

  test("Mac'ten başarılı cevap gelirse onu döner", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ cevap: "Merhaba! Nasıl yardımcı olabilirim?" }), {
        status: 200,
      }),
    );
    const yanit = await POST(istek({ mesaj: "Merhaba" }, "5.5.5.5"));
    const veri = await yanit.json();
    expect(veri.cevap).toBe("Merhaba! Nasıl yardımcı olabilirim?");
  });

  test("Mac'e ulaşılamazsa fallback cevaba düşer", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network"));
    const yanit = await POST(istek({ mesaj: "randevu almak istiyorum" }, "6.6.6.6"));
    const veri = await yanit.json();
    expect(veri.cevap).toContain("randevu formunu");
  });

  test("AI_ASISTAN_URL tanımsızsa direkt fallback'e düşer, fetch çağrılmaz", async () => {
    delete process.env.AI_ASISTAN_URL;
    const yanit = await POST(istek({ mesaj: "randevu almak istiyorum" }, "8.8.8.8"));
    const veri = await yanit.json();
    expect(veri.cevap).toContain("randevu formunu");
    expect(fetch).not.toHaveBeenCalled();
  });

  test("aynı IP'den hız sınırı aşılınca uyarı döner", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ cevap: "ok" }), { status: 200 }),
    );
    const ip = "7.7.7.7";
    for (let i = 0; i < 8; i++) {
      await POST(istek({ mesaj: "merhaba" }, ip));
    }
    const yanit = await POST(istek({ mesaj: "merhaba" }, ip));
    const veri = await yanit.json();
    expect(veri.cevap).toContain("Birkaç dakika sonra");
  });
});
