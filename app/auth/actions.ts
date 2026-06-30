"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  friendlyAuthError,
  isEmailNotConfirmedError,
  supabaseConfigError,
} from "@/lib/supabase/env";

export async function login(formData: FormData) {
  const configErr = supabaseConfigError();
  if (configErr) {
    redirect(`/login?error=${encodeURIComponent(configErr)}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/library");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({
      error: friendlyAuthError(error.message),
      email,
    });
    if (isEmailNotConfirmedError(error.message)) {
      params.set("unconfirmed", "1");
    }
    redirect(`/login?${params.toString()}`);
  }

  revalidatePath("/", "layout");
  redirect(redirectTo || "/library");
}

export async function signup(formData: FormData) {
  const configErr = supabaseConfigError();
  if (configErr) {
    redirect(`/signup?error=${encodeURIComponent(configErr)}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
    },
  });

  if (error) {
    redirect(
      `/signup?error=${encodeURIComponent(friendlyAuthError(error.message))}`,
    );
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    redirect(
      `/login?info=${encodeURIComponent("Daftar berhasil! Cek email kamu (termasuk spam) untuk konfirmasi, lalu login.")}&email=${encodeURIComponent(email)}&unconfirmed=1`,
    );
  }

  redirect("/library");
}

export async function resendConfirmation(formData: FormData) {
  const configErr = supabaseConfigError();
  if (configErr) {
    redirect(`/login?error=${encodeURIComponent(configErr)}`);
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Isi email dulu.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
    },
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(friendlyAuthError(error.message))}&email=${encodeURIComponent(email)}&unconfirmed=1`,
    );
  }

  redirect(
    `/login?info=${encodeURIComponent("Email konfirmasi sudah dikirim ulang. Cek inbox/spam kamu.")}&email=${encodeURIComponent(email)}&unconfirmed=1`,
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
