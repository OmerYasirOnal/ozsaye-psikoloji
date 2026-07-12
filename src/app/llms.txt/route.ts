import { getAllPosts } from "@/lib/blog";
import { services } from "@/lib/services";
import { absoluteUrl, site } from "@/lib/site";

// DB'den her istekte üretilir (sitemap.ts ile aynı gerekçe: panelden
// yayınlanan/kaldırılan yazılar anında yansısın, yeniden deploy gerekmez).
export const dynamic = "force-dynamic";

/**
 * /llms.txt — AI/AIO araçları için site içeriğinin düz-metin özeti.
 * Önceden `public/llms.txt` olarak statik/elle tutuluyordu (yazılar/hizmetler
 * eklendikçe eskiyordu, hatta artık var olmayan /yazilar yoluna işaret
 * ediyordu) — artık `services.ts` + yayınlı blog yazılarından üretilir.
 */
export async function GET() {
  const posts = await getAllPosts();

  const lines: string[] = [];
  lines.push(`# ${site.shortName}`, "");
  lines.push(site.description, "");

  lines.push("## Hizmetler", "");
  for (const s of services) {
    lines.push(`- [${s.title}](${absoluteUrl(`/hizmetler/${s.slug}`)}): ${s.shortDesc}`);
  }
  lines.push("");

  lines.push("## Ekip", "");
  for (const expert of site.experts) {
    lines.push(`- ${expert.name} — ${expert.title} (${absoluteUrl(`/ekip/${expert.slug}`)})`);
  }
  lines.push("");

  if (posts.length > 0) {
    lines.push("## Yazılar", "");
    for (const post of posts) {
      lines.push(`- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.excerpt}`);
    }
    lines.push("");
  }

  lines.push("## Önemli sayfalar", "");
  lines.push(`- Ana sayfa (${absoluteUrl("/")})`);
  lines.push(`- Hizmetler (${absoluteUrl("/hizmetler")})`);
  lines.push(`- Ekip (${absoluteUrl("/ekip")})`);
  lines.push(`- Yazılar (${absoluteUrl("/blog")})`);
  lines.push(`- KVKK Aydınlatma Metni (${absoluteUrl("/kvkk-aydinlatma-metni")})`);
  lines.push(`- Gizlilik Politikası (${absoluteUrl("/gizlilik-politikasi")})`);
  lines.push("");

  lines.push("## İletişim", "");
  lines.push("İletişim bilgileri için web sitesini ziyaret edin.");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
