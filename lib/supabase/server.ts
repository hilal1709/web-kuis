import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Klien Supabase untuk Server Components / Route Handlers / Server Actions
export async function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dipanggil dari Server Component — diabaikan, middleware yang menyegarkan sesi.
          }
        },
      },
    },
  );
}
