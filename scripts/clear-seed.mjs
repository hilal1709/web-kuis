/**
 * Hapus data demo/seed dari database (kuis & kategori contoh).
 * Jalankan: pnpm db:clear-seed
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const text = readFileSync(resolve(root, ".env.local"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    process.env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
}

loadEnvLocal();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query("delete from public.attempts");
await client.query("delete from public.quizzes");
await client.query("delete from public.categories");

console.log("✅ Data demo dihapus. Kuis & kategori contoh sudah bersih.");

await client.end();
