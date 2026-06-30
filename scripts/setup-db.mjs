/**
 * Jalankan schema Quizorama ke Supabase Postgres.
 * Butuh DATABASE_URL di .env.local (Supabase Dashboard → Settings → Database → Connection string → URI)
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i === -1) continue;
      const key = line.slice(0, i).trim();
      const val = line.slice(i + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* ignore */
  }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error(`
❌ DATABASE_URL belum diisi di .env.local

Ambil dari Supabase Dashboard:
  Settings → Database → Connection string → URI

Contoh:
  DATABASE_URL=postgresql://postgres.skeznadfjfzcyumamvhb:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

Ganti [PASSWORD] dengan database password project kamu, simpan .env.local, lalu jalankan lagi:
  pnpm db:setup
`);
  process.exit(1);
}

if (databaseUrl.includes("[") || databaseUrl.includes("YOUR-PASSWORD")) {
  console.error("❌ DATABASE_URL masih placeholder — ganti [PASSWORD] dengan password database Supabase.");
  process.exit(1);
}

const sql = readFileSync(resolve(root, "supabase", "schema.sql"), "utf8");

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("Menghubungkan ke Supabase Postgres…");
  await client.connect();
  console.log("Menjalankan supabase/schema.sql …");
  await client.query(sql);
  console.log("✅ Database siap (tabel + seed data).");

  const { rows } = await client.query(
    "select (select count(*) from categories) as categories, (select count(*) from quizzes) as quizzes",
  );
  console.log(`   ${rows[0].categories} kategori, ${rows[0].quizzes} kuis`);
} catch (err) {
  console.error("❌ Gagal setup database:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
