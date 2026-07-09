import { describe, it, expect } from "vitest";
import client from "./ig-client.cjs";

/** Sıradaki yanıtları kuyruğa alan, çağrıları kaydeden sahte fetch. */
function mockFetch(responses) {
  const calls = [];
  const queue = [...responses];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const r = queue.shift() ?? { ok: true, status: 200, json: {} };
    return { ok: r.ok !== false, status: r.status ?? 200, json: async () => r.json };
  };
  fn.calls = calls;
  return fn;
}

describe("ig-client: createMediaContainer", () => {
  it("image_url + access_token gövdesiyle POST atar ve id döndürür", async () => {
    const f = mockFetch([{ json: { id: "CONTAINER_1" } }]);
    const id = await client.createMediaContainer({
      igUserId: "178", version: "v23.0", accessToken: "TOK",
      params: { image_url: "https://blob/x.png", caption: "merhaba" },
    }, f);
    expect(id).toBe("CONTAINER_1");
    const { url, init } = f.calls[0];
    expect(url).toBe("https://graph.instagram.com/v23.0/178/media");
    expect(init.method).toBe("POST");
    expect(init.body.get("image_url")).toBe("https://blob/x.png");
    expect(init.body.get("caption")).toBe("merhaba");
    expect(init.body.get("access_token")).toBe("TOK");
  });

  it("API hata döndürünce anlamlı hata fırlatır", async () => {
    const f = mockFetch([{ ok: false, status: 400, json: { error: { message: "Geçersiz görsel" } } }]);
    await expect(client.createMediaContainer({
      igUserId: "178", version: "v23.0", accessToken: "T", params: { image_url: "x" },
    }, f)).rejects.toThrow(/Geçersiz görsel/);
  });
});

describe("ig-client: pollUntilFinished", () => {
  const noSleep = async () => {};

  it("IN_PROGRESS → FINISHED olunca çözülür", async () => {
    const f = mockFetch([
      { json: { status_code: "IN_PROGRESS" } },
      { json: { status_code: "IN_PROGRESS" } },
      { json: { status_code: "FINISHED" } },
    ]);
    const code = await client.pollUntilFinished(
      { containerId: "C", version: "v23.0", accessToken: "T" },
      { fetchImpl: f, sleep: noSleep, maxTries: 10, intervalMs: 1 },
    );
    expect(code).toBe("FINISHED");
    expect(f.calls).toHaveLength(3);
  });

  it("ERROR durumunda hata fırlatır", async () => {
    const f = mockFetch([{ json: { status_code: "ERROR" } }]);
    await expect(client.pollUntilFinished(
      { containerId: "C", version: "v23.0", accessToken: "T" },
      { fetchImpl: f, sleep: noSleep, maxTries: 3, intervalMs: 1 },
    )).rejects.toThrow(/işleme hatası/);
  });

  it("süre dolunca zaman aşımı verir", async () => {
    const f = mockFetch([
      { json: { status_code: "IN_PROGRESS" } },
      { json: { status_code: "IN_PROGRESS" } },
    ]);
    await expect(client.pollUntilFinished(
      { containerId: "C", version: "v23.0", accessToken: "T" },
      { fetchImpl: f, sleep: noSleep, maxTries: 2, intervalMs: 1 },
    )).rejects.toThrow(/zaman aşımı/);
  });
});

describe("ig-client: publishMedia + getPermalink", () => {
  it("creation_id ile yayınlar ve media id döndürür", async () => {
    const f = mockFetch([{ json: { id: "MEDIA_9" } }]);
    const id = await client.publishMedia({ igUserId: "178", version: "v23.0", accessToken: "T", creationId: "C" }, f);
    expect(id).toBe("MEDIA_9");
    expect(f.calls[0].init.body.get("creation_id")).toBe("C");
  });
  it("permalink alanını çeker", async () => {
    const f = mockFetch([{ json: { permalink: "https://instagram.com/p/AAA" } }]);
    const link = await client.getPermalink({ mediaId: "MEDIA_9", version: "v23.0", accessToken: "T" }, f);
    expect(link).toBe("https://instagram.com/p/AAA");
    expect(f.calls[0].url).toContain("fields=permalink");
  });
});

describe("ig-client: refreshLongLivedToken", () => {
  it("yeni token ve son kullanma tarihini döndürür", async () => {
    const now = 1_000_000_000_000;
    const f = mockFetch([{ json: { access_token: "NEW", token_type: "bearer", expires_in: 5184000 } }]);
    const r = await client.refreshLongLivedToken({ accessToken: "OLD" }, f, now);
    expect(r.accessToken).toBe("NEW");
    expect(r.expiresAt.getTime()).toBe(now + 5184000 * 1000);
    expect(f.calls[0].url).toContain("grant_type=ig_refresh_token");
    // Uç nokta sürümsüz (Meta belgelerindeki biçim)
    expect(f.calls[0].url).toContain("https://graph.instagram.com/refresh_access_token?");
  });
});
