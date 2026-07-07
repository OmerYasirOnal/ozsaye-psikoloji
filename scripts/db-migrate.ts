import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// IIFE: package.json'da "type": "module" olmadığı için tsx bu dosyayı CJS
// olarak derliyor ve top-level await'i desteklemiyor.
(async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  await sql.end();
  console.log("Migration uygulandı.");
})();
