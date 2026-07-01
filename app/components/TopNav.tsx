import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/user";
import { signOut } from "@/app/auth/actions";
import logoRaw from "@/public/logo.png";
import { MaterialIcon } from "./MaterialIcon";
import { SubmitButton } from "./SubmitButton";

type ActiveLink = "home" | "explore" | "library";

const links: { key: ActiveLink; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "explore", label: "Explore", href: "/explore" },
  { key: "library", label: "My Library", href: "/library" },
];

export async function TopNav({ active }: { active?: ActiveLink }) {
  const user = await getCurrentUser();

  return (
    <nav className="flex justify-between items-center w-full px-margin md:px-gutter py-4 sticky top-0 z-50 bg-background border-b-4 border-on-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          aria-label="XSATU"
          className="relative block h-12 w-[172px] shrink-0 overflow-hidden"
        >
          <Image
            src={logoRaw}
            alt="XSATU"
            fill
            priority
            sizes="172px"
            className="object-cover object-center"
          />
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={
                active === l.key
                  ? "font-body-md text-body-md text-primary border-b-4 border-primary pb-1"
                  : "font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-all"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-on-background bg-secondary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center">
              {user.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={user.profile.username}
                  className="w-full h-full object-cover"
                  src={user.profile.avatar_url}
                />
              ) : (
                <span className="font-headline-md text-headline-md text-on-secondary uppercase">
                  {(user.profile?.username ?? "U").charAt(0)}
                </span>
              )}
            </div>
            <form action={signOut}>
              <SubmitButton
                className="hidden sm:flex items-center gap-1 bg-surface-container border-2 border-on-background px-3 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact uppercase"
                pendingText="KELUAR…"
              >
                <MaterialIcon name="logout" className="text-[18px]" />
                Keluar
              </SubmitButton>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-primary text-on-primary border-2 border-on-background px-4 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact uppercase"
          >
            Masuk
          </Link>
        )}
      </div>
    </nav>
  );
}
