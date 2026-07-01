import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { BrandLogo } from "@/app/components/BrandLogo";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { SubmitButton } from "@/app/components/SubmitButton";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <BrandLogo href="/" width={188} className="mb-8" priority />

      <div className="w-full max-w-md bg-white border-4 border-on-background p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-headline-md text-headline-md mb-2">Buat Akun Baru</h1>
        <p className="text-on-surface-variant mb-6">
          Bergabung dan mulai buat assessment.
        </p>

        {error && (
          <div className="mb-6 bg-error-container text-on-error-container border-2 border-on-background px-4 py-3 font-label-bold text-label-bold">
            {error}
          </div>
        )}

        <form action={signup} className="space-y-5">
          <div>
            <label className="font-label-bold text-label-bold uppercase block mb-2">
              Nama Pengguna
            </label>
            <input
              className="w-full neo-input p-4 bg-surface"
              type="text"
              name="username"
              placeholder="Budi Santoso"
              required
            />
          </div>
          <div>
            <label className="font-label-bold text-label-bold uppercase block mb-2">
              Email
            </label>
            <input
              className="w-full neo-input p-4 bg-surface"
              type="email"
              name="email"
              placeholder="kamu@email.com"
              required
            />
          </div>
          <div>
            <label className="font-label-bold text-label-bold uppercase block mb-2">
              Password
            </label>
            <input
              className="w-full neo-input p-4 bg-surface"
              type="password"
              name="password"
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
            />
          </div>
          <SubmitButton
            className="w-full neo-button-primary py-4 font-headline-md flex items-center justify-center gap-2"
            pendingText="MENDAFTAR…"
          >
            DAFTAR GRATIS
            <MaterialIcon name="rocket_launch" />
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-on-surface-variant font-label-bold">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline">
            MASUK SINI
          </Link>
        </p>
      </div>
    </main>
  );
}
