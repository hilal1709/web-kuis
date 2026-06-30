/**
 * Sync profiles untuk user yang sudah ada tapi belum punya profile
 * Jalankan ini untuk memastikan semua user di auth.users punya profile di public.profiles
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

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("Menghubungkan ke Supabase Postgres…");
  await client.connect();

  // Cek user yang belum punya profile
  const { rows: usersWithoutProfile } = await client.query(`
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
  `);

  console.log(`Ditemukan ${usersWithoutProfile.length} user tanpa profile`);

  if (usersWithoutProfile.length > 0) {
    for (const user of usersWithoutProfile) {
      const username = user.raw_user_meta_data?.username || 
                      user.email?.split('@')[0] || 
                      'user';
      
      await client.query(`
        INSERT INTO public.profiles (id, username, avatar_url)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, username, user.raw_user_meta_data?.avatar_url || null]);
      
      console.log(`✅ Profile dibuat untuk: ${user.email}`);
    }
  }

  // Cek total profiles
  const { rows: profileCount } = await client.query(
    "SELECT COUNT(*) as count FROM public.profiles"
  );
  
  console.log(`\n📊 Total profiles: ${profileCount[0].count}`);
  console.log("✅ Sync profiles selesai");

} catch (err) {
  console.error("❌ Gagal sync profiles:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
