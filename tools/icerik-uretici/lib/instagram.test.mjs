import { describe, it, expect } from "vitest";
import IG from "./instagram.cjs";

describe("instagram: URL üreticileri", () => {
  it("varsayılan sürüm v23.0 ve graph.instagram.com kullanır", () => {
    expect(IG.igBaseUrl()).toBe("https://graph.instagram.com/v23.0");
    expect(IG.mediaContainerUrl("178", "v23.0")).toBe("https://graph.instagram.com/v23.0/178/media");
    expect(IG.mediaPublishUrl("178", "v23.0")).toBe("https://graph.instagram.com/v23.0/178/media_publish");
    expect(IG.refreshTokenUrl("v23.0")).toBe("https://graph.instagram.com/v23.0/refresh_access_token");
  });
  it("sürüm geçersiz kılınabilir", () => {
    expect(IG.igBaseUrl("v21.0")).toBe("https://graph.instagram.com/v21.0");
  });
});

describe("instagram: buildContainerParams", () => {
  it("görsel için image_url üretir, media_type eklemez", () => {
    const p = IG.buildContainerParams({ imageUrl: "https://x/y.png", caption: "merhaba" });
    expect(p).toEqual({ image_url: "https://x/y.png", caption: "merhaba" });
  });
  it("reels için media_type=REELS + video_url + share_to_feed üretir", () => {
    const p = IG.buildContainerParams({ mediaType: "REELS", videoUrl: "https://x/y.mp4", caption: "c" });
    expect(p.media_type).toBe("REELS");
    expect(p.video_url).toBe("https://x/y.mp4");
    expect(p.share_to_feed).toBe("true");
    expect(p.image_url).toBeUndefined();
  });
  it("boş başlık caption alanını atlar", () => {
    const p = IG.buildContainerParams({ imageUrl: "https://x/y.png", caption: "" });
    expect(p.caption).toBeUndefined();
  });
  it("eksik url'de anlamlı hata verir", () => {
    expect(() => IG.buildContainerParams({})).toThrow(/image_url/);
    expect(() => IG.buildContainerParams({ mediaType: "REELS" })).toThrow(/video_url/);
  });
});

describe("instagram: normalizeCaption", () => {
  it("kırpar ve hashtag sayar", () => {
    const r = IG.normalizeCaption("Metin\n\n#a #b #c\n");
    expect(r.caption).toBe("Metin\n\n#a #b #c");
    expect(r.hashtagCount).toBe(3);
    expect(r.truncated).toBe(false);
  });
  it("2200 karakteri aşınca kısaltır", () => {
    const r = IG.normalizeCaption("x".repeat(2500));
    expect(r.truncated).toBe(true);
    expect(r.caption.length).toBeLessThanOrEqual(2200);
    expect(r.caption.endsWith("…")).toBe(true);
  });
  it("30'dan fazla hashtag'i işaretler", () => {
    const many = Array.from({ length: 31 }, (_, i) => `#e${i}`).join(" ");
    const r = IG.normalizeCaption(many);
    expect(r.hashtagCount).toBe(31);
    expect(r.tooManyHashtags).toBe(true);
  });
});

describe("instagram: blobPath", () => {
  it("instagram/<slug>/<dosya> üretir ve slug'ı güvenli yapar", () => {
    expect(IG.blobPath("kaygi-ile", "gorsel.png")).toBe("instagram/kaygi-ile/gorsel.png");
    expect(IG.blobPath("Öz Saye!!", "reels.mp4")).toBe("instagram/z-saye/reels.mp4");
  });
});

describe("instagram: parseRefreshResponse", () => {
  it("expiresAt'i now + expires_in'den hesaplar", () => {
    const now = 1_000_000_000_000;
    const r = IG.parseRefreshResponse({ access_token: "TOK", expires_in: 5184000 }, now);
    expect(r.accessToken).toBe("TOK");
    expect(r.expiresInSec).toBe(5184000);
    expect(r.expiresAt.getTime()).toBe(now + 5184000 * 1000);
  });
  it("token yoksa hata verir", () => {
    expect(() => IG.parseRefreshResponse({ error: { message: "geçersiz" } })).toThrow(/geçersiz/);
  });
});

describe("instagram: classifyContainerStatus", () => {
  it("FINISHED → done", () => expect(IG.classifyContainerStatus("FINISHED").done).toBe(true));
  it("ERROR/EXPIRED → failed", () => {
    expect(IG.classifyContainerStatus("ERROR").failed).toBe(true);
    expect(IG.classifyContainerStatus("EXPIRED").failed).toBe(true);
  });
  it("IN_PROGRESS/boş → pending", () => {
    expect(IG.classifyContainerStatus("IN_PROGRESS").pending).toBe(true);
    expect(IG.classifyContainerStatus("").pending).toBe(true);
  });
});
