import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i === -1) continue;
      const key = line.slice(0, i).trim();
      const val = line.slice(i + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* ignore */ }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("❌ DATABASE_URL belum diisi di .env.local");
  process.exit(1);
}

const sql = readFileSync(resolve(root, "supabase", "migrations", "fix-guest-scoring.sql"), "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("✅ Fix guest scoring berhasil diterapkan.");
  console.log("   - Policy game_answers: guest player sekarang bisa insert jawaban.");
  console.log("   - Fungsi increment_game_score: sekarang SECURITY DEFINER.");
  console.log("   - Policy game_players update: guest player bisa update finished_at.");
} catch (err) {
  console.error("❌ Gagal:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
