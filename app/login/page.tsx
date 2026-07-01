import Link from "next/link";
import { login, resendConfirmation } from "@/app/auth/actions";
import { BrandLogo } from "@/app/components/BrandLogo";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { SubmitButton } from "@/app/components/SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    info?: string;
    redirect?: string;
    email?: string;
    unconfirmed?: string;
  }>;
}) {
  const { error, info, redirect, email, unconfirmed } = await searchParams;
  const showResend = unconfirmed === "1" || (error && /belum dikonfirmasi/i.test(error));

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <BrandLogo href="/" width={188} className="mb-8" priority />

      <div className="w-full max-w-md bg-white border-4 border-on-background p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-headline-md text-headline-md mb-2">Masuk Akun</h1>
        <p className="text-on-surface-variant mb-6">
          Lanjutkan tantanganmu dan jaga rekor skor!
        </p>

        {info && (
          <div className="mb-6 bg-secondary-container text-on-secondary-container border-2 border-on-background px-4 py-3 font-label-bold text-label-bold">
            {info}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-error-container text-on-error-container border-2 border-on-background px-4 py-3 font-label-bold text-label-bold">
            {error}
          </div>
        )}

        <form action={login} className="space-y-5">
          <input type="hidden" name="redirect" value={redirect ?? "/library"} />
          <div>
            <label className="font-label-bold text-label-bold uppercase block mb-2">
              Email
            </label>
            <input
              className="w-full neo-input p-4 bg-surface"
              type="email"
              name="email"
              placeholder="kamu@email.com"
              defaultValue={email ?? ""}
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
              placeholder="••••••••"
              required
            />
          </div>
          <SubmitButton
            className="w-full neo-button-primary py-4 font-headline-md flex items-center justify-center gap-2"
            pendingText="MASUK…"
          >
            MASUK
            <MaterialIcon name="login" />
          </SubmitButton>
        </form>

        {showResend && (
          <form action={resendConfirmation} className="mt-6 pt-6 border-t-2 border-dashed border-on-background space-y-3">
            <p className="font-label-bold text-label-bold text-on-surface-variant">
              Belum terima email konfirmasi?
            </p>
            <input type="hidden" name="email" value={email ?? ""} />
            <SubmitButton
              className="w-full neo-button-secondary py-3 font-label-bold flex items-center justify-center gap-2"
              pendingText="MENGIRIM…"
            >
              <MaterialIcon name="mail" />
              KIRIM ULANG EMAIL KONFIRMASI
            </SubmitButton>
          </form>
        )}

        <p className="mt-6 text-center text-on-surface-variant font-label-bold">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            DAFTAR DULU
          </Link>
        </p>
      </div>
    </main>
  );
}
