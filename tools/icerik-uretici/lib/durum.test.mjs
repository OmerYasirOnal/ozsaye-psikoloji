import { describe, it, expect } from "vitest";
import durum from "./durum.cjs";

const { DURUM, normalizeDurum, nextDurum, isEligibleForPublish, planPublish } = durum;

describe("durum: normalizeDurum", () => {
  it("eski 'taslak — onay bekliyor' etiketini taslak yapar", () => {
    expect(normalizeDurum("taslak — onay bekliyor")).toBe(DURUM.TASLAK);
  });
  it("onaylandi ve paylasildi'yı tanır", () => {
    expect(normalizeDurum("onaylandi")).toBe(DURUM.ONAYLANDI);
    expect(normalizeDurum("paylasildi")).toBe(DURUM.PAYLASILDI);
    expect(normalizeDurum("paylaşıldı")).toBe(DURUM.PAYLASILDI);
  });
  it("bilinmeyeni taslak sayar", () => expect(normalizeDurum(undefined)).toBe(DURUM.TASLAK));
});

describe("durum: nextDurum geçişleri", () => {
  it("onayla: taslak → onaylandi", () => {
    expect(nextDurum("taslak", "onayla")).toEqual({ ok: true, durum: DURUM.ONAYLANDI });
  });
  it("onayla: paylasildi yeniden onaylanamaz", () => {
    const r = nextDurum("paylasildi", "onayla");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/zaten paylaşıldı/);
  });
  it("yayinla: yalnız onaylandi'dan paylasildi'ya", () => {
    expect(nextDurum("onaylandi", "yayinla")).toEqual({ ok: true, durum: DURUM.PAYLASILDI });
    expect(nextDurum("taslak", "yayinla").ok).toBe(false);
  });
  it("bilinmeyen işlem reddedilir", () => expect(nextDurum("taslak", "sil").ok).toBe(false));
});

describe("durum: isEligibleForPublish", () => {
  it("yalnız onaylandi uygundur", () => {
    expect(isEligibleForPublish("onaylandi")).toBe(true);
    expect(isEligibleForPublish("taslak")).toBe(false);
    expect(isEligibleForPublish("paylasildi")).toBe(false);
  });
});

describe("durum: planPublish", () => {
  const drafts = [
    { slug: "a", durum: "onaylandi", hasImage: true, hasReels: true },
    { slug: "b", durum: "onaylandi", hasImage: true, hasReels: false },
    { slug: "c", durum: "taslak", hasImage: true, hasReels: true },
  ];

  it("varsayılan: yalnız görsel, adet 1", () => {
    const plan = planPublish(drafts, {});
    expect(plan.willProcess).toHaveLength(1);
    expect(plan.willProcess[0].slug).toBe("a");
    expect(plan.willProcess[0].actions).toEqual([{ tur: "gorsel", dosya: "gorsel.png" }]);
    expect(plan.skipped.some((s) => s.slug === "c")).toBe(true);
  });

  it("tur=ikisi: reels varsa ekler, yoksa sessizce yalnız görsel", () => {
    const plan = planPublish(drafts, { tur: "ikisi", adet: 5 });
    const a = plan.willProcess.find((p) => p.slug === "a");
    const b = plan.willProcess.find((p) => p.slug === "b");
    expect(a.actions.map((x) => x.tur)).toEqual(["gorsel", "reels"]);
    expect(b.actions.map((x) => x.tur)).toEqual(["gorsel"]);
  });

  it("tur=reels: reels yoksa slug atlanır", () => {
    const plan = planPublish(drafts, { tur: "reels", adet: 5 });
    expect(plan.willProcess.map((p) => p.slug)).toEqual(["a"]);
    expect(plan.skipped.some((s) => s.slug === "b" && /reels\.mp4 yok/.test(s.reason))).toBe(true);
  });

  it("adet sınırı fazlasını atlar", () => {
    const plan = planPublish(drafts, { tur: "gorsel", adet: 1 });
    expect(plan.willProcess).toHaveLength(1);
    expect(plan.skipped.some((s) => s.slug === "b" && /adet sınırı/.test(s.reason))).toBe(true);
  });
});
