import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/user";
import { signOut } from "@/app/auth/actions";
import { MaterialIcon } from "./MaterialIcon";

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
          className="font-headline-xl text-headline-md text-primary italic uppercase tracking-tighter"
        >
          QUIZORAMA
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
        <Link
          href="/library"
          className="relative hidden lg:block"
          aria-label="Cari kuis"
        >
          <input
            className="bg-surface border-2 border-on-background py-2 px-4 pr-10 w-64 focus:outline-none focus:border-4 focus:bg-secondary-container transition-all neo-shadow-sm pointer-events-none"
            placeholder="Cari assessment lainnya"
            type="text"
            readOnly
            tabIndex={-1}
          />
          <MaterialIcon
            name="search"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </Link>
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
              <button
                className="hidden sm:flex items-center gap-1 bg-surface-container border-2 border-on-background px-3 py-2 font-label-bold text-label-bold neo-shadow-sm btn-interact uppercase"
                type="submit"
              >
                <MaterialIcon name="logout" className="text-[18px]" />
                Keluar
              </button>
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
