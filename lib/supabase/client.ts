import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Klien Supabase untuk komponen client ("use client")
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  return createBrowserClient(env.url, env.anonKey);
}
