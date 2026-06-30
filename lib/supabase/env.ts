const PLACEHOLDER_MARKERS = ["PASTE", "YOUR_", "GANTI", "ISI_"];

export function getSupabaseEnv(): {
  url: string;
  anonKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  const upper = anonKey.toUpperCase();
  if (PLACEHOLDER_MARKERS.some((m) => upper.includes(m))) return null;

  // JWT anon key Supabase biasanya panjang (100+ karakter) dan diawali eyJ
  if (anonKey.length < 40 || !anonKey.startsWith("eyJ")) return null;

  return { url, anonKey };
}

export function supabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local.";
  }

  if (
    PLACEHOLDER_MARKERS.some((m) => anonKey.toUpperCase().includes(m)) ||
    anonKey === "PASTE_ANON_KEY_DISINI"
  ) {
    return "Anon key masih placeholder. Buka Supabase Dashboard → Settings → API → salin 'anon public' ke .env.local, lalu restart server (pnpm dev).";
  }

  if (!anonKey.startsWith("eyJ") || anonKey.length < 40) {
    return "Anon key tidak valid. Pastikan kamu menyalin 'anon public' (bukan service_role) dari Supabase Dashboard → Settings → API.";
  }

  return null;
}

export function friendlyAuthError(message: string): string {
  if (/invalid api key/i.test(message)) {
    return "Invalid API key — anon key di .env.local salah atau masih placeholder. Salin ulang dari Supabase Dashboard → Settings → API → 'anon public', simpan .env.local, lalu restart pnpm dev.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Email belum dikonfirmasi. Cek inbox/spam, klik link konfirmasi, lalu coba login lagi. Atau kirim ulang email konfirmasi di bawah.";
  }
  return message;
}

export function isEmailNotConfirmedError(message: string): boolean {
  return /email not confirmed/i.test(message);
}
