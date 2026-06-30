import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Ambil user auth + profilnya. Aman dipanggil meski env belum diisi (mengembalikan null).
export async function getCurrentUser(): Promise<{
  id: string;
  email: string | undefined;
  profile: Profile | null;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { id: user.id, email: user.email, profile: profile ?? null };
  } catch {
    return null;
  }
}
