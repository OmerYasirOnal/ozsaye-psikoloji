import { config } from "../config.js";
import { log, sleep } from "../util.js";

// Meta Graph API ile Facebook Sayfası ve Instagram Business hesabına yayın.
// Gereksinimler:
//  - Facebook Sayfası + Sayfa erişim token'ı (FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN)
//  - Facebook Sayfasına bağlı Instagram Business/Creator hesabı (IG_USER_ID)
//  - Instagram için herkese açık bir görsel URL'si (imageUrl) ZORUNLUDUR.

const base = () => `https://graph.facebook.com/${config.meta.graphVersion}`;

async function graphPost(pathname, params) {
  const res = await fetch(`${base()}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || `HTTP ${res.status}`;
    throw new Error(`Graph API: ${msg}`);
  }
  return data;
}

/** Facebook Sayfası akışına metin + bağlantı paylaşır. */
export async function publishToFacebook(item, link) {
  const { fbPageId, fbPageToken } = config.meta;
  if (!fbPageId || !fbPageToken) {
    log.warn("Facebook atlandı: FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN tanımlı değil.");
    return { skipped: true };
  }

  const c = item.content;
  const message = [c.facebookCaption, link, c.hashtags.join(" ")]
    .filter(Boolean)
    .join("\n\n");

  if (config.dryRun) {
    log.warn("[DRY_RUN] Facebook'a gönderilmedi.");
    return { skipped: true, dryRun: true };
  }

  const data = await graphPost(`/${fbPageId}/feed`, {
    message,
    link: link || "",
    access_token: fbPageToken,
  });
  log.ok(`Facebook paylaşıldı: ${data.id}`);
  return { id: data.id };
}

/** Instagram Business hesabına görselli paylaşım yapar (iki adımlı). */
export async function publishToInstagram(item, link) {
  const { igUserId, igToken } = config.meta;
  if (!igUserId || !igToken) {
    log.warn("Instagram atlandı: IG_USER_ID / IG_ACCESS_TOKEN tanımlı değil.");
    return { skipped: true };
  }
  if (!item.imageUrl) {
    log.warn(
      `Instagram atlandı: görsel yok. 'ozsaye image ${item.id} <herkese-açık-görsel-url>' ile ekleyin.`,
    );
    return { skipped: true, reason: "no-image" };
  }

  const c = item.content;
  const caption = [c.instagramCaption, link, c.hashtags.join(" ")]
    .filter(Boolean)
    .join("\n\n");

  if (config.dryRun) {
    log.warn("[DRY_RUN] Instagram'a gönderilmedi.");
    return { skipped: true, dryRun: true };
  }

  // 1) Medya konteyneri oluştur
  const container = await graphPost(`/${igUserId}/media`, {
    image_url: item.imageUrl,
    caption,
    access_token: igToken,
  });

  // Görselin işlenmesi için kısa bekleme (büyük görsellerde gerekebilir)
  await sleep(2000);

  // 2) Yayınla
  const published = await graphPost(`/${igUserId}/media_publish`, {
    creation_id: container.id,
    access_token: igToken,
  });
  log.ok(`Instagram paylaşıldı: ${published.id}`);
  return { id: published.id };
}
