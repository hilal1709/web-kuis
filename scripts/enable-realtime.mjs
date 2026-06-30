/**
 * Enable Realtime for game tables in Supabase.
 * Butuh DATABASE_URL di .env.local
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
  console.error("❌ DATABASE_URL belum diisi di .env.local");
  process.exit(1);
}

const sql = readFileSync(resolve(root, "supabase", "enable-realtime.sql"), "utf8");

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("Menghubungkan ke Supabase Postgres…");
  await client.connect();
  console.log("Meng-enable Realtime untuk tabel game…");
  await client.query(sql);
  console.log("✅ Realtime berhasil di-enable untuk tabel:");
  console.log("   - game_sessions");
  console.log("   - game_players");
  console.log("   - game_answers");
} catch (err) {
  console.error("❌ Gagal enable Realtime:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
