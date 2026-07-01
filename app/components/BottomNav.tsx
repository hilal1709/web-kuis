"use client";

import Link from "next/link";
import { MaterialIcon } from "./MaterialIcon";
import { signOut } from "@/app/auth/actions";
import { SubmitButton } from "./SubmitButton";

type Active = "home" | "explore" | "library";

const items: { key: Active; label: string; icon: string; href: string }[] = [
  { key: "home", label: "Home", icon: "home", href: "/" },
  { key: "explore", label: "Explore", icon: "explore", href: "/explore" },
  { key: "library", label: "Library", icon: "library_books", href: "/library" },
];

export function BottomNav({ active = "home" }: { active?: Active }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-3 bg-surface border-t-4 border-on-background md:hidden">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={
              isActive
                ? "flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container border-2 border-on-background rounded-full px-4 py-1"
                : "flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            }
          >
            <MaterialIcon name={item.icon} filled={isActive} />
            <span className="font-label-bold text-[10px] uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
      <form action={signOut}>
        <SubmitButton
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          pendingText={
            <span className="font-label-bold text-[10px] uppercase">Keluar…</span>
          }
        >
          <MaterialIcon name="logout" />
          <span className="font-label-bold text-[10px] uppercase">
            Keluar
          </span>
        </SubmitButton>
      </form>
    </nav>
  );
}
