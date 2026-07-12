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
  // Geliştirici makinesinde tanımlıysa bulut yolu testlere sızmasın.
  delete process.env.GROQ_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.AI_ASISTAN_URL;
  delete process.env.AI_ASISTAN_SECRET;
  delete process.env.GROQ_API_KEY;
});

function groqYaniti(icerik: string) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: icerik } }] }),
    { status: 200 },
  );
}

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

  test("GROQ_API_KEY tanımlıysa cevap buluttan gelir, Mac hiç aranmaz", async () => {
    process.env.GROQ_API_KEY = "test-groq-anahtari";
    vi.mocked(fetch).mockResolvedValueOnce(groqYaniti("Buluttan merhaba!"));
    const yanit = await POST(istek({ mesaj: "Merhaba" }, "9.9.9.9"));
    const veri = await yanit.json();
    expect(veri.cevap).toBe("Buluttan merhaba!");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("api.groq.com");
  });

  test("bulut başarısız olursa Mac köprüsüne düşer", async () => {
    process.env.GROQ_API_KEY = "test-groq-anahtari";
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("groq down"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ cevap: "Mac'ten merhaba!" }), { status: 200 }),
      );
    const yanit = await POST(istek({ mesaj: "Merhaba" }, "10.10.10.10"));
    const veri = await yanit.json();
    expect(veri.cevap).toBe("Mac'ten merhaba!");
    expect(fetch).toHaveBeenCalledTimes(2);
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
