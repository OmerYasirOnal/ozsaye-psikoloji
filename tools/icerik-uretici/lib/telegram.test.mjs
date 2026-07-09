import { describe, it, expect } from "vitest";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import TG from "./telegram.cjs";

const {
  tg, tgSafe,
  buildApprovalKeyboard, parseCallbackData, decideCallback,
  selectDraftsToNotify, buildCaption, applyCallback,
  fitSlugForCallback, resolveSlug, CALLBACK_DATA_LIMIT,
  readOffset, setOffset,
} = TG;

/** Telegram yanıtı kuyruğa alan, çağrıları kaydeden sahte fetch (ig-client.test deseni). */
function mockFetch(responses = []) {
  const calls = [];
  const queue = [...responses];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const r = queue.shift() ?? { json: { ok: true, result: {} } };
    return { ok: r.ok !== false, status: r.status ?? 200, json: async () => r.json ?? { ok: true, result: {} } };
  };
  fn.calls = calls;
  return fn;
}

/** Belirli bir Telegram metodu için son çağrının urlencoded gövdesini bul. */
function bodyFor(fetchFn, method) {
  const call = [...fetchFn.calls].reverse().find((c) => c.url.endsWith(`/${method}`));
  return call ? call.init.body : null;
}

// ---------------------------------------------------------------------------
describe("telegram: buildApprovalKeyboard", () => {
  it("reels yoksa ✅ Yayınla + ❌ Atla; callback_data biçimi", () => {
    const kb = buildApprovalKeyboard("kaygi-yazisi", { hasReels: false });
    expect(kb.inline_keyboard[0]).toEqual([
      { text: "✅ Yayınla", callback_data: "yayinla:kaygi-yazisi:gorsel" },
    ]);
    expect(kb.inline_keyboard[1]).toEqual([
      { text: "❌ Atla", callback_data: "atla:kaygi-yazisi" },
    ]);
  });
  it("reels varsa 🎬 Görsel+Reels butonu eklenir", () => {
    const kb = buildApprovalKeyboard("x", { hasReels: true });
    const cds = kb.inline_keyboard[0].map((b) => b.callback_data);
    expect(cds).toEqual(["yayinla:x:gorsel", "yayinla:x:ikisi"]);
  });
  it("UZUN slug'da bile HER callback_data ≤ 64 bayt (Telegram sınırı)", () => {
    const uzun = "kaygi-bozuklugu-ile-basa-cikmanin-yollari-ve-terapi-yontemleri-uzerine"; // 71 bayt
    const kb = buildApprovalKeyboard(uzun, { hasReels: true });
    const all = kb.inline_keyboard.flat().map((b) => b.callback_data);
    expect(all).toHaveLength(3);
    for (const cd of all) {
      expect(Buffer.byteLength(cd, "utf8")).toBeLessThanOrEqual(CALLBACK_DATA_LIMIT);
    }
    // Üç buton da AYNI kısaltılmış slug'ı taşır (tutarlı çözüm için)
    const slugs = all.map((cd) => cd.split(":")[1]);
    expect(new Set(slugs).size).toBe(1);
  });
});

describe("telegram: fitSlugForCallback + resolveSlug (64-bayt sınırı)", () => {
  it("kısa slug değişmez", () => {
    expect(fitSlugForCallback("kaygi-ile-basa-cikmak")).toBe("kaygi-ile-basa-cikmak");
  });
  it("uzun slug en-kötü kalıba ('yayinla:'+slug+':gorsel') sığacak kadar kısaltılır", () => {
    const uzun = "a".repeat(120);
    const s = fitSlugForCallback(uzun);
    expect(Buffer.byteLength(`yayinla:${s}:gorsel`, "utf8")).toBeLessThanOrEqual(CALLBACK_DATA_LIMIT);
    expect(uzun.startsWith(s)).toBe(true); // önek korunur → resolveSlug geri çözebilir
  });
  it("resolveSlug: tam eşleşme öncelikli", () => {
    expect(resolveSlug("abc", ["abc", "abcd"])).toBe("abc");
  });
  it("resolveSlug: TEK önek eşleşmesi çözülür; belirsiz/yok → null", () => {
    expect(resolveSlug("kaygi-boz", ["kaygi-bozuklugu-yazisi", "uyku-hijyeni"])).toBe("kaygi-bozuklugu-yazisi");
    expect(resolveSlug("kaygi", ["kaygi-bir", "kaygi-iki"])).toBe(null); // belirsiz → ASLA yayınlama
    expect(resolveSlug("yok-boyle", ["a", "b"])).toBe(null);
    expect(resolveSlug("", ["a"])).toBe(null);
  });
  it("resolveSlug: liste enjekte edilmemişse (null) kimlik döner", () => {
    expect(resolveSlug("abc", null)).toBe("abc");
  });
  it("kısaltılmış slug uçtan uca geri çözülür (fit → resolve)", () => {
    const gercek = "kaygi-bozuklugu-ile-basa-cikmanin-yollari-ve-terapi-yontemleri-uzerine";
    const kisa = fitSlugForCallback(gercek);
    expect(kisa.length).toBeLessThan(gercek.length);
    expect(resolveSlug(kisa, [gercek, "baska-yazi"])).toBe(gercek);
  });
});

describe("telegram: parseCallbackData", () => {
  it("yayinla:slug:tur", () => {
    expect(parseCallbackData("yayinla:abc:gorsel")).toEqual({ action: "yayinla", slug: "abc", tur: "gorsel" });
    expect(parseCallbackData("yayinla:abc:ikisi")).toEqual({ action: "yayinla", slug: "abc", tur: "ikisi" });
  });
  it("atla:slug", () => {
    expect(parseCallbackData("atla:abc")).toEqual({ action: "atla", slug: "abc" });
  });
  it("bozuk/eksik → action:null", () => {
    expect(parseCallbackData("yayinla:abc:xxx").action).toBe(null); // geçersiz tur
    expect(parseCallbackData("yayinla:abc").action).toBe(null); // tur yok
    expect(parseCallbackData("atla:").action).toBe(null); // slug yok
    expect(parseCallbackData("").action).toBe(null);
    expect(parseCallbackData(undefined).action).toBe(null);
  });
});

describe("telegram: decideCallback (güvenlik)", () => {
  const cq = (chatId, data) => ({ id: "CB1", data, message: { message_id: 7, chat: { id: chatId } } });

  it("izinli chat → authorized + ayrıştırma", () => {
    const d = decideCallback(cq(123, "yayinla:s:gorsel"), { allowedChatId: 123 });
    expect(d.authorized).toBe(true);
    expect(d).toMatchObject({ action: "yayinla", slug: "s", tur: "gorsel", callbackId: "CB1", messageId: 7 });
  });
  it("string/number chat id eşleşir", () => {
    expect(decideCallback(cq(123, "atla:s"), { allowedChatId: "123" }).authorized).toBe(true);
  });
  it("YETKİSİZ chat → authorized:false", () => {
    expect(decideCallback(cq(999, "yayinla:s:gorsel"), { allowedChatId: 123 }).authorized).toBe(false);
  });
  it("allowedChatId yoksa authorized:false", () => {
    expect(decideCallback(cq(123, "atla:s"), {}).authorized).toBe(false);
  });
});

describe("telegram: selectDraftsToNotify (bildirildi TEKRAR gönderilmez)", () => {
  const drafts = [
    { slug: "a", durum: "taslak" },
    { slug: "b", durum: "bildirildi" },
    { slug: "c", durum: "paylasildi" },
    { slug: "d", durum: "onaylandi" },
    { slug: "e", durum: "reddedildi" },
  ];
  it("varsayılan: yalnız 'taslak' (bildirilmiş/reddedilmiş atlanır)", () => {
    expect(selectDraftsToNotify(drafts, {}).map((x) => x.slug)).toEqual(["a"]);
  });
  it("--yeniden: paylaşılan hariç her şey (bildirildi + reddedildi dahil)", () => {
    expect(selectDraftsToNotify(drafts, { yeniden: true }).map((x) => x.slug)).toEqual(["a", "b", "d", "e"]);
  });
  it("slug filtresi", () => {
    expect(selectDraftsToNotify(drafts, { slug: "b" }).map((x) => x.slug)).toEqual([]); // b bildirildi, --yeniden yok
    expect(selectDraftsToNotify(drafts, { slug: "b", yeniden: true }).map((x) => x.slug)).toEqual(["b"]);
  });
  it("reddedilmiş taslak --yeniden ile diriltilir (fikir değişikliği yolu)", () => {
    expect(selectDraftsToNotify(drafts, { slug: "e" }).map((x) => x.slug)).toEqual([]);
    expect(selectDraftsToNotify(drafts, { slug: "e", yeniden: true }).map((x) => x.slug)).toEqual(["e"]);
  });
});

describe("telegram: buildCaption", () => {
  it("başlık + kırpılmış gövde + slug", () => {
    const body = "x".repeat(500);
    const cap = buildCaption({ baslik: "Başlık", instagramText: body, slug: "sl", limit: 300 });
    expect(cap).toContain("Başlık");
    expect(cap).toContain("slug: sl");
    expect(cap).toContain("…");
    expect(cap.length).toBeLessThan(400);
  });
  it("kısa gövde kırpılmaz", () => {
    const cap = buildCaption({ baslik: "B", instagramText: "kısa metin", slug: "s" });
    expect(cap).toContain("kısa metin");
    expect(cap).not.toContain("…");
  });
});

describe("telegram: offset dosyası (idempotensi, atomik, monotonik)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tg-offset-"));
  const file = path.join(dir, ".tg-offset");

  it("yoksa 0 döner", () => expect(readOffset(file)).toBe(0));
  it("setOffset ileri sarar ve kalıcıdır", () => {
    expect(setOffset(file, 42)).toBe(42);
    expect(readOffset(file)).toBe(42);
  });
  it("geri/eşit değer YOK sayılır (monotonik)", () => {
    expect(setOffset(file, 10)).toBe(42);
    expect(setOffset(file, 42)).toBe(42);
    expect(readOffset(file)).toBe(42);
  });
  it("bozuk içerik → 0 (kilitlenmez)", () => {
    fs.writeFileSync(file, "bozuk!!");
    expect(readOffset(file)).toBe(0);
  });
});

describe("telegram: tg / tgSafe (ağ sarmalayıcı, sahte fetch)", () => {
  it("ok:true → result döner, POST urlencoded", async () => {
    const f = mockFetch([{ json: { ok: true, result: { message_id: 5 } } }]);
    const res = await tg("sendMessage", { chat_id: 1, text: "selam", reply_markup: { inline_keyboard: [] } }, { token: "T", fetchImpl: f });
    expect(res).toEqual({ message_id: 5 });
    expect(f.calls[0].url).toBe("https://api.telegram.org/botT/sendMessage");
    expect(f.calls[0].init.body.get("text")).toBe("selam");
    expect(f.calls[0].init.body.get("reply_markup")).toBe('{"inline_keyboard":[]}'); // nesne JSON'a çevrilir
  });
  it("ok:false → anlamlı hata fırlatır", async () => {
    const f = mockFetch([{ ok: false, status: 400, json: { ok: false, description: "chat not found" } }]);
    await expect(tg("sendMessage", { chat_id: 1 }, { token: "T", fetchImpl: f })).rejects.toThrow(/chat not found/);
  });
  it("token yoksa fırlatır", async () => {
    await expect(tg("getMe", {}, { fetchImpl: mockFetch() })).rejects.toThrow(/TG_BOT_TOKEN/);
  });
  it("tgSafe hatayı yutar (null döner)", async () => {
    const f = mockFetch([{ ok: false, status: 500, json: { ok: false, description: "boom" } }]);
    expect(await tgSafe("sendMessage", {}, { token: "T", fetchImpl: f })).toBe(null);
  });
});

// --- applyCallback: uçtan uca (spawn mock'lu, ağsız) ---
function metaStore(initial = {}) {
  const store = JSON.parse(JSON.stringify(initial));
  return {
    readMeta: (slug) => (store[slug] ? JSON.parse(JSON.stringify(store[slug])) : null),
    writeMeta: (slug, meta) => { store[slug] = JSON.parse(JSON.stringify(meta)); },
    get: (slug) => store[slug],
  };
}
function mockSpawn({ status = 0, stdout = "", stderr = "", onCall } = {}) {
  const calls = [];
  const fn = (publisherPath, extraArgs, opts) => {
    calls.push({ publisherPath, extraArgs, opts });
    if (onCall) onCall({ publisherPath, extraArgs, opts });
    return { status, stdout, stderr };
  };
  fn.calls = calls;
  return fn;
}
const cbq = (chatId, data) => ({ id: "CB", data, message: { message_id: 3, chat: { id: chatId } } });

describe("telegram: applyCallback (orkestrasyon)", () => {
  const baseDeps = (extra) => ({
    allowedChatId: 100, token: "T", fetchImpl: mockFetch(),
    publisherPath: "/x/instagram-yayinla.cjs", cwd: "/x",
    ...extra,
  });

  it("YETKİSİZ chat → 'Yetkisiz' yanıtı, durum değişmez, spawn YOK", async () => {
    const s = metaStore({ a: { durum: "bildirildi" } });
    const spawn = mockSpawn();
    const f = mockFetch();
    const r = await applyCallback(cbq(999, "yayinla:a:gorsel"), baseDeps({ ...s, spawn, fetchImpl: f }));
    expect(r.outcome).toBe("unauthorized");
    expect(spawn.calls).toHaveLength(0);
    expect(s.get("a").durum).toBe("bildirildi");
    expect(bodyFor(f, "answerCallbackQuery").get("text")).toBe("Yetkisiz");
  });

  it("yayinla başarı → durum onaylandi, publisher --slug/--tur ile spawn, buton kaldırılır", async () => {
    const s = metaStore({ a: { durum: "bildirildi" } });
    // Publisher'ı taklit et: durum→paylasildi + permalink yaz, status 0 dön.
    const spawn = mockSpawn({ status: 0, onCall: () => {
      s.writeMeta("a", { durum: "paylasildi", paylasim: { permalink: "https://instagram.com/p/AAA" } });
    } });
    const f = mockFetch();
    const r = await applyCallback(cbq(100, "yayinla:a:gorsel"), baseDeps({ ...s, spawn, fetchImpl: f }));
    expect(r.outcome).toBe("published");
    expect(r.permalink).toBe("https://instagram.com/p/AAA");
    expect(spawn.calls[0].extraArgs).toEqual(["--yayinla", "--tur", "gorsel", "--slug", "a"]);
    // spinner önce kapatıldı
    expect(bodyFor(f, "answerCallbackQuery").get("text")).toBe("Yayınlanıyor…");
    // butonlar kaldırıldı
    expect(bodyFor(f, "editMessageReplyMarkup").get("reply_markup")).toBe('{"inline_keyboard":[]}');
    expect(bodyFor(f, "sendMessage").get("text")).toContain("Yayınlandı");
  });

  it("yayinla başarısız (publisher status!=0) → durum 'bildirildi'ye geri alınır, PII'siz uyarı", async () => {
    const s = metaStore({ a: { durum: "bildirildi" } });
    const spawn = mockSpawn({ status: 1 });
    const f = mockFetch();
    const r = await applyCallback(cbq(100, "yayinla:a:gorsel"), baseDeps({ ...s, spawn, fetchImpl: f }));
    expect(r.outcome).toBe("failed");
    expect(s.get("a").durum).toBe("bildirildi");
    const msg = bodyFor(f, "sendMessage").get("text");
    expect(msg).toContain("başarısız");
    expect(msg).not.toMatch(/token|http|status/i); // PII/ayrıntı sızmaz
  });

  it("atla → durum reddedildi, butonlar kaldırılır, spawn YOK", async () => {
    const s = metaStore({ a: { durum: "bildirildi" } });
    const spawn = mockSpawn();
    const r = await applyCallback(cbq(100, "atla:a"), baseDeps({ ...s, spawn }));
    expect(r.outcome).toBe("atla");
    expect(s.get("a").durum).toBe("reddedildi");
    expect(spawn.calls).toHaveLength(0);
  });

  it("zaten paylaşılmışa yayinla → çift-yayın YOK (spawn atlanır)", async () => {
    const s = metaStore({ a: { durum: "paylasildi" } });
    const spawn = mockSpawn();
    const r = await applyCallback(cbq(100, "yayinla:a:gorsel"), baseDeps({ ...s, spawn }));
    expect(r.outcome).toBe("skip");
    expect(spawn.calls).toHaveLength(0);
    expect(s.get("a").durum).toBe("paylasildi");
  });

  it("SAHTE başarı yakalanır: exit 0 ama durum 'paylasildi' OLMADI → failed + geri-al", async () => {
    // instagram-yayinla.cjs plan-dışı kalan taslakta da 0 döner (ör. gorsel.png yok,
    // "atlandı" der) → exit koduna güvenme, meta.json'daki duruma bak.
    const s = metaStore({ a: { durum: "bildirildi" } });
    const spawn = mockSpawn({ status: 0, stdout: "Atlananlar: a: gorsel.png yok" }); // meta'ya DOKUNMAZ
    const f = mockFetch();
    const r = await applyCallback(cbq(100, "yayinla:a:gorsel"), baseDeps({ ...s, spawn, fetchImpl: f }));
    expect(r.outcome).toBe("failed");
    expect(s.get("a").durum).toBe("bildirildi"); // onaylandi'da takılı kalmaz
    expect(bodyFor(f, "sendMessage").get("text")).toContain("başarısız"); // ✅ Yayınlandı DEMEZ
  });

  it("hata teşhisi YEREL loga yazılır (publisher stderr/stdout), Telegram'a sızmaz", async () => {
    const s = metaStore({ a: { durum: "bildirildi" } });
    const spawn = mockSpawn({ status: 1, stderr: "Hata: Konteyner oluşturma başarısız: Geçersiz görsel" });
    const f = mockFetch();
    const errors = [];
    await applyCallback(cbq(100, "yayinla:a:gorsel"), baseDeps({ ...s, spawn, fetchImpl: f, error: (m) => errors.push(m) }));
    expect(errors.join(" ")).toContain("Geçersiz görsel"); // teşhis logda VAR
    expect(bodyFor(f, "sendMessage").get("text")).not.toContain("Geçersiz görsel"); // Telegram'da YOK
  });

  it("kısaltılmış callback slug'ı listSlugs ile gerçek slug'a çözülür", async () => {
    const gercek = "kaygi-bozuklugu-ile-basa-cikmanin-yollari-ve-terapi-yontemleri-uzerine";
    const kisa = fitSlugForCallback(gercek);
    const s = metaStore({ [gercek]: { durum: "bildirildi" } });
    const spawn = mockSpawn({ status: 0, onCall: () => {
      s.writeMeta(gercek, { durum: "paylasildi", paylasim: { permalink: "https://instagram.com/p/L" } });
    } });
    const f = mockFetch();
    const r = await applyCallback(
      cbq(100, `yayinla:${kisa}:gorsel`),
      baseDeps({ ...s, spawn, fetchImpl: f, listSlugs: () => [gercek, "baska-yazi"] }),
    );
    expect(r.outcome).toBe("published");
    // publisher'a KISALTILMIŞ değil GERÇEK slug geçildi
    expect(spawn.calls[0].extraArgs).toEqual(["--yayinla", "--tur", "gorsel", "--slug", gercek]);
  });

  it("belirsiz kısaltılmış slug → notfound (ASLA yanlış taslak yayınlanmaz)", async () => {
    const s = metaStore({ "kaygi-bir": { durum: "bildirildi" }, "kaygi-iki": { durum: "bildirildi" } });
    const spawn = mockSpawn();
    const r = await applyCallback(
      cbq(100, "yayinla:kaygi:gorsel"),
      baseDeps({ ...s, spawn, listSlugs: () => ["kaygi-bir", "kaygi-iki"] }),
    );
    expect(r.outcome).toBe("notfound");
    expect(spawn.calls).toHaveLength(0);
  });
});
