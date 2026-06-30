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

const sql = readFileSync(resolve(root, "supabase", "policies-create.sql"), "utf8");
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("✅ Kebijakan buat kuis sudah diterapkan.");
} catch (err) {
  if (/already exists/i.test(err.message)) {
    console.log("✅ Kebijakan sudah ada, dilewati.");
  } else {
    console.error("❌", err.message);
    process.exit(1);
  }
} finally {
  await client.end();
}
