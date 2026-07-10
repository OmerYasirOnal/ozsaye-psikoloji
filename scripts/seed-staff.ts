import { db, client } from "../src/lib/db";
import { staff, staffRole } from "../src/lib/db/schema";

// IIFE: package.json'da "type": "module" olmadığı için tsx bu dosyayı CJS
// olarak derliyor ve top-level await'i desteklemiyor.
(async () => {
  // Dev varsayılanı; gerçek e-postalar cutover'da SEED_STAFF ile verilir.
  // Biçim: "Ad Soyad:email:expertSlug:role" virgülle ayrılmış. `role` isteğe
  // bağlıdır — boş/eksikse DB varsayılanı ("therapist") kullanılır. Genel bir
  // hesabı (ör. info@) tam görünürlükle eklemek için: "Ad:eposta::admin".
  const DEFAULT = [
    "Melek Yıldız:melek@example.com:melek-yildiz",
    "Sacide Şahin:sacide@example.com:sacide-sahin",
  ].join(",");

  type StaffRole = (typeof staffRole.enumValues)[number];
  const gecerliRoller: readonly string[] = staffRole.enumValues;

  const rows = (process.env.SEED_STAFF ?? DEFAULT).split(",").map((r) => {
    const [name, email, expertSlug, role] = r.split(":").map((s) => s.trim());
    if (role && !gecerliRoller.includes(role)) {
      throw new Error(
        `Geçersiz role "${role}" (${email}) — geçerli değerler: ${gecerliRoller.join(", ")}`,
      );
    }
    return {
      name,
      email: email.toLowerCase(),
      expertSlug: expertSlug || null,
      ...(role ? { role: role as StaffRole } : {}),
    };
  });

  for (const r of rows) {
    await db
      .insert(staff)
      .values(r)
      .onConflictDoNothing({ target: staff.email });
    console.log(`seed: ${r.email}${"role" in r ? ` (${r.role})` : ""}`);
  }

  await client.end();
  console.log("Seed tamam.");
})();
