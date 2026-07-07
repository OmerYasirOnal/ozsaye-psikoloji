import { db, client } from "../src/lib/db";
import { staff } from "../src/lib/db/schema";

// IIFE: package.json'da "type": "module" olmadığı için tsx bu dosyayı CJS
// olarak derliyor ve top-level await'i desteklemiyor.
(async () => {
  // Dev varsayılanı; gerçek e-postalar cutover'da SEED_STAFF ile verilir.
  // Biçim: "Ad Soyad:email:expertSlug" virgülle ayrılmış.
  const DEFAULT = [
    "Melek Yıldız:melek@example.com:melek-yildiz",
    "Sacide Şahin:sacide@example.com:sacide-sahin",
  ].join(",");

  const rows = (process.env.SEED_STAFF ?? DEFAULT).split(",").map((r) => {
    const [name, email, expertSlug] = r.split(":").map((s) => s.trim());
    return { name, email: email.toLowerCase(), expertSlug: expertSlug || null };
  });

  for (const r of rows) {
    await db
      .insert(staff)
      .values(r)
      .onConflictDoNothing({ target: staff.email });
    console.log(`seed: ${r.email}`);
  }

  await client.end();
  console.log("Seed tamam.");
})();
